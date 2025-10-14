// unified-inbox-endpoints.js
// Enhanced endpoints that support both ChatRace + external sources

import { DatabaseBridgeIntegration } from './database-bridge-integration.js';

let dbBridge = null;

// Initialize database bridge
async function initializeUnifiedInbox() {
  if (!dbBridge) {
    try {
      console.log('🔗 Initializing unified inbox database bridge...');
      dbBridge = new DatabaseBridgeIntegration();
      
      console.log('📡 Attempting database initialization...');
      await dbBridge.initialize();
      console.log('✅ Database bridge initialized successfully');
      
      // Run initial sync to populate data
      console.log('🔄 Running initial data sync...');
      try {
        await dbBridge.runSync();
        console.log('✅ Initial sync completed');
      } catch (syncError) {
        console.error('❌ Initial sync failed:', syncError);
        // Don't throw - allow system to work with cached data
      }
      
      // Start periodic sync (every 5 minutes)
      setInterval(async () => {
        try {
          console.log('🔄 Running periodic sync...');
          await dbBridge.runSync();
          console.log('✅ Periodic sync completed');
        } catch (error) {
          console.error('❌ Periodic sync failed:', error);
        }
      }, 5 * 60 * 1000);
      
      console.log('✅ Unified inbox fully initialized');
    } catch (error) {
      console.error('🚨 CRITICAL: Unified inbox initialization failed!');
      console.error('🚨 Error details:', error);
      console.error('🚨 Error stack:', error.stack);
      throw error; // Re-throw so caller knows it failed
    }
  }
}

// Enhanced conversations endpoint
export async function getUnifiedConversations(req, res, callUpstream, resolveAccountId) {
  try {
    await initializeUnifiedInbox();
    
    const resolvedAccountId = resolveAccountId(req);
    const platform = String(req.query.platform || 'all');
    const limit = Math.max(1, Math.min(500, Number(req.query.limit || 25)));
    const offset = Math.max(0, Number(req.query.offset || 0));
    
    console.log(`[UNIFIED CONVERSATIONS] Loading for platform: ${platform}`);
    
    let allConversations = [];
    
    // 1. Get ChatRace conversations (existing logic)
    if (platform === 'all' || ['webchat', 'facebook', 'instagram'].includes(platform)) {
      try {
        const channelMap = {
          webchat: '9',
          facebook: '0', 
          instagram: '10'
        };
        const filterChannel = channelMap[platform] || null;
        
        // Get ALL ChatRace conversations for proper unified sorting
        const upstream = await callUpstream({
          op: 'conversations',
          op1: 'get',
          account_id: resolvedAccountId,
          offset: 0,
          limit: 200, // Get more conversations for proper sorting
        }, undefined, req);
        
        const chatraceData = await upstream.json().catch(() => null);
        
        if (chatraceData && chatraceData.status === 'OK' && Array.isArray(chatraceData.data)) {
          const chatraceConversations = chatraceData.data
            .filter(row => (filterChannel ? String(row.channel) === filterChannel : true))
            .map((row, idx) => {
              const conversationId = String(row.ms_id || row.id || idx + 1);
              const displayName = String(row.full_name || `Guest ${idx + 1}`);
              const avatarUrl = row.profile_pic || '';
              return {
                conversation_id: conversationId,
                display_name: displayName,
                username: displayName,
                user_identifier: conversationId,
                avatar_url: avatarUrl,
                last_message_at: row.timestamp || null,
                last_message_content: row.last_msg || '',
                _platform: platform.charAt(0).toUpperCase() + platform.slice(1),
                hash: '',
                channel: row.channel || filterChannel || '9',
                source: 'chatrace'
              };
            });
          
          allConversations.push(...chatraceConversations);
        }
      } catch (error) {
        console.error('❌ Error fetching ChatRace conversations:', error);
      }
    }
    
    // 2. Get unified conversations (Woodstock + VAPI + Rural King)  
    if (platform === 'all' || ['woodstock', 'vapi', 'vapi_rural', 'rural_king', 'sms', 'calls'].includes(platform)) {
      try {
        // Map special filters to vapi_rural for Rural King data
        let dbPlatform = platform;
        if (platform === 'rural_king' || platform === 'sms' || platform === 'calls') {
          dbPlatform = 'vapi_rural'; // All these filters show Rural King data
        }
        
        // Get ALL unified conversations for proper unified sorting  
        const unifiedConversations = await dbBridge.getUnifiedConversations(
          platform === 'all' ? null : dbPlatform,
          200, // Get more conversations for proper sorting
          0    // Start from beginning for unified sorting
        );
        
        // Add source indicator (display_name already includes icon from database bridge)
        const enhancedUnified = unifiedConversations.map(convo => ({
          ...convo,
          source: convo.source, // Keep original source
          // Display name already has icon from database bridge
        }));
        
        allConversations.push(...enhancedUnified);
      } catch (error) {
        console.error('❌ Error fetching unified conversations:', error);
      }
    }
    
    // 3. Sort all conversations by TRUE TIMESTAMP ORDER - most recent first
    allConversations.sort((a, b) => {
      // Handle different timestamp formats: Unix ms (ChatRace) vs ISO strings (Woodstock)
      let timeA = a.last_message_at || 0;
      let timeB = b.last_message_at || 0;
      
      // Convert Unix timestamp strings to numbers for ChatRace
      if (typeof timeA === 'string' && /^\d+$/.test(timeA)) {
        timeA = parseInt(timeA);
      }
      if (typeof timeB === 'string' && /^\d+$/.test(timeB)) {
        timeB = parseInt(timeB);
      }
      
      // Convert to Date objects for proper comparison
      const dateA = new Date(timeA).getTime();
      const dateB = new Date(timeB).getTime();
      
      // Debug logging to see what's happening
      if (Math.random() < 0.01) { // Only log 1% of comparisons to avoid spam
        console.log(`🔄 Sort compare: ${dateA} vs ${dateB} (${new Date(dateA).toISOString()} vs ${new Date(dateB).toISOString()})`);
      }
      
      return dateB - dateA; // Most recent first - PURE CHRONOLOGICAL ORDER
    });
    
    console.log(`📊 Total conversations before pagination: ${allConversations.length}`);
    
    // 4. Apply pagination
    const paginatedConversations = allConversations.slice(offset, offset + limit);
    
    console.log(`✅ Returning ${paginatedConversations.length} unified conversations`);
    console.log(`📊 Sources: ${[...new Set(paginatedConversations.map(c => c.source))].join(', ')}`);
    
    return res.json({ 
      status: 'success', 
      data: paginatedConversations,
      total: allConversations.length,
      sources: {
        chatrace: allConversations.filter(c => c.source === 'chatrace').length,
        woodstock: allConversations.filter(c => c.source === 'woodstock').length,
        vapi: allConversations.filter(c => c.source === 'vapi').length,
        vapi_rural: allConversations.filter(c => c.source === 'vapi_rural').length,
        rural_king: allConversations.filter(c => c.source === 'vapi_rural').length // Alias for frontend
      }
    });
    
  } catch (error) {
    console.error('❌ Error in unified conversations:', error);
    return res.status(200).json({ status: 'error', message: error.message });
  }
}

// Enhanced messages endpoint
export async function getUnifiedMessages(req, res, callUpstream, resolveAccountId) {
  try {
    await initializeUnifiedInbox();
    
    const conversationId = String(req.params.id);
    const limit = Math.max(1, Math.min(1000, Number(req.query.limit || 200)));
    
    console.log(`[UNIFIED MESSAGES] Loading for conversation: ${conversationId}`);
    
    // Determine source from conversation ID
    const source = getConversationSource(conversationId);
    
    if (source === 'chatrace') {
      // Use existing ChatRace logic
      const upstream = await callUpstream({
        op: 'conversations',
        op1: 'get',
        id: conversationId,
        account_id: resolveAccountId(req),
        offset: 0,
        limit: Math.min(limit, 100),
        expand: { comments: {}, refs: {}, appointments: {} },
      }, undefined, req);
      
      const data = await upstream.json().catch(() => null);
      if (data && data.status === 'OK' && Array.isArray(data.data)) {
        const mapped = data.data
          .map(row => {
            const parts = [];
            try {
              const arr = JSON.parse(row.message || '[]');
              for (const item of arr) {
                if (item.type === 'typing') continue;
                if (typeof item.text === 'string' && item.text.trim().length > 0) {
                  parts.push(item.text);
                } else if (item.attachment && item.attachment.payload) {
                  const element = item.attachment.payload.elements?.[0];
                  const url = element?.url || item.attachment.payload.url;
                  if (url) parts.push(`[media] ${url}`);
                }
              }
            } catch {
              if (row.message) parts.push(String(row.message));
            }
            const content = parts.join('\n').trim();
            return {
              message_created_at: Number(row.timestamp || Date.now()),
              message_content: content,
              message_role: (String(row.dir) === '0' ? 'assistant' : 'user'),
              function_execution_status: 'read',
              source: 'chatrace'
            };
          })
          .filter(m => m.message_content && m.message_content.length > 0);
        
        return res.json({ status: 'success', data: mapped });
      }
    } else {
      // Use unified database
      const messages = await dbBridge.getUnifiedMessages(conversationId, limit);
      
      // Enhance messages with source info
      const enhancedMessages = messages.map(msg => ({
        ...msg,
        source: source,
        // Add visual indicators for function calls
        message_content: enhanceFunctionCallDisplay(msg.message_content, msg.function_data)
      }));
      
      return res.json({ status: 'success', data: enhancedMessages });
    }
    
    return res.json({ status: 'success', data: [] });
    
  } catch (error) {
    console.error('❌ Error in unified messages:', error);
    return res.status(200).json({ status: 'error', message: error.message });
  }
}

// Helper functions
function getConversationSource(conversationId) {
  if (conversationId.startsWith('woodstock_')) return 'woodstock';
  if (conversationId.startsWith('vapi_rural_')) return 'vapi_rural';
  if (conversationId.startsWith('vapi_')) return 'vapi';
  return 'chatrace';
}

function getSourceIcon(platform) {
  const icons = {
    'Woodstock': '🌲',
    'VAPI': '📞',
    'Vapi': '📞',
    'Rural King': '🏪',
    'Webchat': '💬',
    'Facebook': '📘',
    'Instagram': '📷'
  };
  return icons[platform] || '💬';
}

function enhanceFunctionCallDisplay(content, functionData) {
  if (!functionData || !functionData.function_name) {
    return content;
  }
  
  let enhanced = content;
  
  // Add function call visualization
  enhanced += `\n\n🔧 **Function Call: ${functionData.function_name}**`;
  
  if (functionData.input_parameters) {
    try {
      const params = typeof functionData.input_parameters === 'string' 
        ? JSON.parse(functionData.input_parameters) 
        : functionData.input_parameters;
      enhanced += `\n📥 **Input:** ${JSON.stringify(params, null, 2)}`;
    } catch (e) {
      enhanced += `\n📥 **Input:** ${functionData.input_parameters}`;
    }
  }
  
  if (functionData.output_result) {
    try {
      const result = typeof functionData.output_result === 'string' 
        ? JSON.parse(functionData.output_result) 
        : functionData.output_result;
      enhanced += `\n📤 **Result:** ${JSON.stringify(result, null, 2)}`;
    } catch (e) {
      enhanced += `\n📤 **Result:** ${functionData.output_result}`;
    }
  }
  
  return enhanced;
}

// Sync endpoint for manual refresh
export async function triggerUnifiedSync(req, res) {
  try {
    await initializeUnifiedInbox();
    await dbBridge.runSync();
    
    return res.json({ 
      status: 'success', 
      message: 'Unified sync completed successfully' 
    });
  } catch (error) {
    console.error('❌ Manual sync failed:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
}

