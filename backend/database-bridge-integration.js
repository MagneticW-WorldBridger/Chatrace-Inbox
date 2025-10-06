// database-bridge-integration.js
// WORKING PULL Integration: Bridge external databases to unified inbox

import pg from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

class DatabaseBridgeIntegration {
  constructor() {
    // Database connections
    this.woodstockDb = null;
    this.mainDb = null;
  }
  
  async initialize() {
    console.log('🔗 Initializing working database bridge...');
    
    // Connect to Woodstock database (loft-chat-chingon) - CORRECT CREDENTIALS
    this.woodstockDb = new pg.Client({
      host: 'ep-weathered-dream-adbza7xj-pooler.c-2.us-east-1.aws.neon.tech',
      database: 'neondb',  
      user: 'neondb_owner',
      password: 'npg_THMlQu6ZWmD4',
      ssl: { rejectUnauthorized: false }
    });
    
    // Connect to main inbox database
    this.mainDb = new pg.Client({
      connectionString: process.env.DATABASE_URL
    });
    
    await Promise.all([
      this.woodstockDb.connect(),
      this.mainDb.connect()
    ]);
    
    console.log('✅ Database connections established');
    
    // Create unified conversations table
    await this.createUnifiedTables();
  }
  
  async createUnifiedTables() {
    await this.mainDb.query(`
      CREATE TABLE IF NOT EXISTS unified_conversations (
        id SERIAL PRIMARY KEY,
        conversation_id TEXT UNIQUE NOT NULL,
        source TEXT NOT NULL, -- 'woodstock', 'vapi', 'chatrace'
        customer_name TEXT,
        customer_phone TEXT,
        customer_email TEXT,
        last_message_content TEXT,
        last_message_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'
      );
      
      CREATE TABLE IF NOT EXISTS unified_messages (
        id SERIAL PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        message_content TEXT NOT NULL,
        message_role TEXT NOT NULL, -- 'user', 'assistant'
        created_at TIMESTAMP NOT NULL,
        source TEXT NOT NULL,
        function_data JSONB DEFAULT '{}',
        FOREIGN KEY (conversation_id) REFERENCES unified_conversations(conversation_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_unified_conversations_source ON unified_conversations(source);
      CREATE INDEX IF NOT EXISTS idx_unified_conversations_updated ON unified_conversations(updated_at);
      CREATE INDEX IF NOT EXISTS idx_unified_messages_conversation ON unified_messages(conversation_id);
    `);
    
    console.log('✅ Unified tables created/verified');
  }
  
  // ===== WOODSTOCK SYNC =====
  
  async syncWoodstockConversations() {
    console.log('🌲 Syncing Woodstock conversations...');
    
    try {
      // Get recent conversations from Woodstock
      const conversations = await this.woodstockDb.query(`
          SELECT 
              conversation_id,
              user_identifier,
              platform_type,
              conversation_started_at,
              last_message_at,
              is_active
          FROM chatbot_conversations 
          WHERE is_active = true
          AND last_message_at > NOW() - INTERVAL '30 days'
          ORDER BY last_message_at DESC
          LIMIT 50
      `);
      
      console.log(`📊 Found ${conversations.rows.length} Woodstock conversations`);
      
      for (const conv of conversations.rows) {
          // Get last message for this conversation
          const lastMessage = await this.woodstockDb.query(`
              SELECT message_content, message_role
              FROM chatbot_messages 
              WHERE conversation_id = $1
              ORDER BY message_created_at DESC
              LIMIT 1
          `, [conv.conversation_id]);
          
          const lastMessageContent = lastMessage.rows.length > 0 ? 
              lastMessage.rows[0].message_content : 'No messages';
          
          // Upsert into unified table
          await this.mainDb.query(`
              INSERT INTO unified_conversations (
                  conversation_id, source, customer_name, customer_phone, customer_email,
                  last_message_content, last_message_at, updated_at, metadata
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              ON CONFLICT (conversation_id) DO UPDATE SET
                  customer_name = EXCLUDED.customer_name,
                  last_message_content = EXCLUDED.last_message_content,
                  last_message_at = EXCLUDED.last_message_at,
                  updated_at = EXCLUDED.updated_at,
                  metadata = EXCLUDED.metadata
          `, [
              `woodstock_${conv.conversation_id}`,
              'woodstock',
              `AI Customer ${conv.user_identifier}`,
              conv.user_identifier.includes('@') ? '' : conv.user_identifier, // phone if not email
              conv.user_identifier.includes('@') ? conv.user_identifier : '', // email if contains @
              lastMessageContent,
              conv.last_message_at,
              new Date(),
              JSON.stringify({
                  original_id: conv.conversation_id,
                  platform_type: conv.platform_type,
                  started_at: conv.conversation_started_at
              })
          ]);
          
          // Sync recent messages
          await this.syncConversationMessages(conv.conversation_id);
      }
      
      console.log(`✅ Synced ${conversations.rows.length} Woodstock conversations`);
      
    } catch (error) {
      console.error('❌ Error syncing Woodstock conversations:', error);
    }
  }
  
  async syncConversationMessages(conversationId) {
      // Get recent messages
      const messages = await this.woodstockDb.query(`
          SELECT 
              message_content,
              message_role,
              message_created_at,
              executed_function_name,
              function_input_parameters,
              function_output_result
          FROM chatbot_messages 
          WHERE conversation_id = $1
          AND message_created_at > NOW() - INTERVAL '7 days'
          ORDER BY message_created_at ASC
          LIMIT 20
      `, [conversationId]);
      
      const unifiedConversationId = `woodstock_${conversationId}`;
      
      // Clear existing messages for this conversation
      await this.mainDb.query(`
          DELETE FROM unified_messages WHERE conversation_id = $1
      `, [unifiedConversationId]);
      
      // Insert messages
      for (const message of messages.rows) {
          const functionData = {};
          if (message.executed_function_name) {
              functionData.function_name = message.executed_function_name;
              functionData.input_parameters = message.function_input_parameters;
              functionData.output_result = message.function_output_result;
          }
          
          await this.mainDb.query(`
              INSERT INTO unified_messages (
                  conversation_id, message_content, message_role, created_at, source, function_data
              ) VALUES ($1, $2, $3, $4, $5, $6)
          `, [
              unifiedConversationId,
              message.message_content,
              message.message_role,
              message.message_created_at,
              'woodstock',
              JSON.stringify(functionData)
          ]);
      }
  }
  
  async syncWoodstockConversation(conversation) {
    try {
      // Extract customer info
      let customerInfo = {
        name: 'AI Chat Customer',
        phone: conversation.user_identifier || '',
        email: ''
      };
      
      if (conversation.customer_data) {
        try {
          const customerData = JSON.parse(conversation.customer_data);
          if (customerData.customer) {
            customerInfo.name = `${customerData.customer.first_name || ''} ${customerData.customer.last_name || ''}`.trim();
            customerInfo.phone = customerData.customer.phone || customerInfo.phone;
            customerInfo.email = customerData.customer.email || '';
          }
        } catch (e) {
          console.warn('Error parsing customer data:', e);
        }
      }
      
      // Upsert conversation
      await this.mainDb.query(`
        INSERT INTO unified_conversations (
          conversation_id, source, customer_name, customer_phone, customer_email,
          last_message_content, last_message_at, updated_at, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (conversation_id) DO UPDATE SET
          customer_name = EXCLUDED.customer_name,
          customer_phone = EXCLUDED.customer_phone,
          customer_email = EXCLUDED.customer_email,
          last_message_content = EXCLUDED.last_message_content,
          last_message_at = EXCLUDED.last_message_at,
          updated_at = EXCLUDED.updated_at,
          metadata = EXCLUDED.metadata
      `, [
        `woodstock_${conversation.conversation_id}`,
        'woodstock',
        customerInfo.name,
        customerInfo.phone,
        customerInfo.email,
        conversation.last_message || '',
        conversation.last_message_at || conversation.updated_at,
        conversation.updated_at,
        JSON.stringify({
          original_id: conversation.conversation_id,
          user_identifier: conversation.user_identifier
        })
      ]);
      
      // Sync messages
      await this.syncWoodstockMessages(conversation.conversation_id);
      
    } catch (error) {
      console.error(`Error syncing Woodstock conversation ${conversation.conversation_id}:`, error);
    }
  }
  
  async syncWoodstockMessages(conversationId) {
    // Get messages from Woodstock
    const messages = await this.woodstockDb.query(`
      SELECT 
        message_content,
        message_role,
        created_at,
        executed_function_name,
        function_input_parameters,
        function_output_result
      FROM chatbot_messages 
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `, [conversationId]);
    
    const unifiedConversationId = `woodstock_${conversationId}`;
    
    // Clear existing messages for this conversation
    await this.mainDb.query(`
      DELETE FROM unified_messages WHERE conversation_id = $1
    `, [unifiedConversationId]);
    
    // Insert messages
    for (const message of messages.rows) {
      const functionData = {};
      if (message.executed_function_name) {
        functionData.function_name = message.executed_function_name;
        functionData.input_parameters = message.function_input_parameters;
        functionData.output_result = message.function_output_result;
      }
      
      await this.mainDb.query(`
        INSERT INTO unified_messages (
          conversation_id, message_content, message_role, created_at, source, function_data
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        unifiedConversationId,
        message.message_content,
        message.message_role,
        message.created_at,
        'woodstock',
        JSON.stringify(functionData)
      ]);
    }
  }
  
  // ===== VAPI SYNC =====
  
  async syncVAPIConversations() {
    console.log('📞 Syncing VAPI conversations...');
    
    try {
      // Get VAPI calls (assuming you store webhook data)
      const calls = await this.mainDb.query(`
        SELECT 
          call_id,
          customer_phone,
          customer_name,
          transcript,
          summary,
          call_started_at,
          call_ended_at,
          recording_url,
          created_at
        FROM vapi_calls 
        WHERE created_at > NOW() - INTERVAL '24 hours'
        ORDER BY call_started_at DESC
      `);
      
      for (const call of calls.rows) {
        await this.syncVAPICall(call);
      }
      
      console.log(`✅ Synced ${calls.rows.length} VAPI calls`);
      
    } catch (error) {
      console.error('❌ Error syncing VAPI calls:', error);
    }
  }
  
  async syncVAPICall(call) {
    try {
      const conversationId = `vapi_${call.call_id}`;
      
      // Upsert conversation
      await this.mainDb.query(`
        INSERT INTO unified_conversations (
          conversation_id, source, customer_name, customer_phone, customer_email,
          last_message_content, last_message_at, updated_at, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (conversation_id) DO UPDATE SET
          customer_name = EXCLUDED.customer_name,
          customer_phone = EXCLUDED.customer_phone,
          last_message_content = EXCLUDED.last_message_content,
          last_message_at = EXCLUDED.last_message_at,
          updated_at = EXCLUDED.updated_at,
          metadata = EXCLUDED.metadata
      `, [
        conversationId,
        'vapi',
        call.customer_name || 'Phone Customer',
        call.customer_phone || '',
        '', // No email for phone calls
        call.summary || 'Phone call completed',
        call.call_ended_at || call.call_started_at,
        call.created_at,
        JSON.stringify({
          call_id: call.call_id,
          recording_url: call.recording_url,
          call_duration: call.call_ended_at ? 
            (new Date(call.call_ended_at) - new Date(call.call_started_at)) / 1000 : null
        })
      ]);
      
      // Create messages for the call
      const messages = [
        {
          content: `📞 Phone call started`,
          role: 'assistant',
          timestamp: call.call_started_at
        }
      ];
      
      if (call.transcript) {
        messages.push({
          content: call.transcript,
          role: 'user',
          timestamp: call.call_started_at
        });
      }
      
      if (call.summary) {
        messages.push({
          content: `📋 Call Summary: ${call.summary}`,
          role: 'assistant', 
          timestamp: call.call_ended_at || call.call_started_at
        });
      }
      
      if (call.recording_url) {
        messages.push({
          content: `🎵 Recording: ${call.recording_url}`,
          role: 'assistant',
          timestamp: call.call_ended_at || call.call_started_at
        });
      }
      
      // Clear existing messages
      await this.mainDb.query(`
        DELETE FROM unified_messages WHERE conversation_id = $1
      `, [conversationId]);
      
      // Insert messages
      for (const message of messages) {
        await this.mainDb.query(`
          INSERT INTO unified_messages (
            conversation_id, message_content, message_role, created_at, source, function_data
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          conversationId,
          message.content,
          message.role,
          message.timestamp,
          'vapi',
          JSON.stringify({})
        ]);
      }
      
    } catch (error) {
      console.error(`Error syncing VAPI call ${call.call_id}:`, error);
    }
  }
  
  // ===== API ENDPOINTS FOR UNIFIED INBOX =====
  
  async getUnifiedConversations(platform = null, limit = 50, offset = 0) {
    let query = `
      SELECT 
        conversation_id,
        source,
        customer_name,
        customer_phone,
        customer_email,
        last_message_content,
        last_message_at,
        created_at,
        metadata
      FROM unified_conversations
    `;
    
    const params = [];
    
    if (platform && platform !== 'all') {
      query += ` WHERE source = $${params.length + 1}`;
      params.push(platform);
    }
    
    query += ` ORDER BY last_message_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await this.mainDb.query(query, params);
    
    // Transform to inbox format with PROPER SOURCE ICONS
    return result.rows.map(row => ({
      conversation_id: row.conversation_id,
      display_name: this.getSourceDisplayName(row.source, row.customer_name),
      username: row.customer_name || this.getDefaultCustomerName(row.source),
      user_identifier: row.conversation_id,
      avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(row.conversation_id)}`,
      last_message_at: row.last_message_at,
      last_message_content: row.last_message_content,
      _platform: this.getPlatformName(row.source),
      hash: '',
      channel: this.getChannelNumber(row.source),
      source: row.source,
      metadata: row.metadata
    }));
  }
  
  // RESTORED: Helper methods for proper source mapping
  getSourceDisplayName(source, customerName) {
    const icons = {
      'vapi': '📞',
      'woodstock': '🌲', 
      'vapi_rural': '🏪',
      'chatrace': '💬'
    };
    const icon = icons[source] || '💬';
    const defaultName = this.getDefaultCustomerName(source);
    return `${icon} ${customerName || defaultName}`;
  }
  
  getDefaultCustomerName(source) {
    const defaults = {
      'vapi': 'VAPI Customer',
      'woodstock': 'Woodstock Customer',
      'vapi_rural': 'Rural King Customer', 
      'chatrace': 'ChatRace Customer'
    };
    return defaults[source] || 'Unknown Customer';
  }
  
  getPlatformName(source) {
    const platforms = {
      'vapi': 'VAPI',
      'woodstock': 'Woodstock',
      'vapi_rural': 'Rural King',
      'chatrace': 'ChatRace'
    };
    return platforms[source] || 'Unknown';
  }
  
  getChannelNumber(source) {
    const channels = {
      'vapi': '11',
      'woodstock': '9', 
      'vapi_rural': '12', // New channel for Rural King
      'chatrace': '9'
    };
    return channels[source] || '9';
  }
  
  async getUnifiedMessages(conversationId, limit = 200) {
    console.log(`🔍 getUnifiedMessages called with conversationId: ${conversationId}`);
    
    // Handle Woodstock conversations - query Woodstock database directly
    if (conversationId.startsWith('woodstock_')) {
      console.log(`🌲 Fetching Woodstock messages for: ${conversationId}`);
      
      // Extract actual UUID from prefixed conversation ID
      const actualUuid = conversationId.replace('woodstock_', '');
      console.log(`🔍 Extracted UUID: ${actualUuid}`);
      
      try {
        const result = await this.woodstockDb.query(`
          SELECT 
            message_content,
            message_role,
            message_created_at,
            executed_function_name,
            function_input_parameters,
            function_output_result
          FROM chatbot_messages
          WHERE conversation_id = $1
          ORDER BY message_created_at ASC
          LIMIT $2
        `, [actualUuid, limit]);
        
        console.log(`🌲 Found ${result.rows.length} Woodstock messages`);
        
        return result.rows.map(row => ({
          message_created_at: new Date(row.message_created_at).getTime(),
          message_content: row.message_content,
          message_role: row.message_role,
          function_execution_status: 'read',
          function_data: {
            function_name: row.executed_function_name,
            function_args: row.function_input_parameters,
            function_result: row.function_output_result
          }
        }));
        
      } catch (error) {
        console.error('❌ Error fetching Woodstock messages:', error);
        return [];
      }
    }
    
    // Handle VAPI Rural King conversations - fetch fresh data from API
    if (conversationId.startsWith('vapi_rural_')) {
      console.log(`🏪 Fetching Rural King messages for: ${conversationId}`);
      
      try {
        // Extract phone from conversation_id (format: vapi_rural_+13323339453)
        const phoneNumber = conversationId.replace('vapi_rural_', '');
        
        // Fetch fresh data from Rural King API
        const response = await fetch(`https://rural-king-deploy.vercel.app/api/conversations/${encodeURIComponent(phoneNumber)}/messages?limit=200&offset=0`);
        const data = await response.json();
        
        if (!data.success || !Array.isArray(data.messages)) {
          console.log(`❌ Invalid Rural King messages response for ${phoneNumber}:`, data);
          return [];
        }
        
        console.log(`🏪 Found ${data.messages.length} Rural King messages from API`);
        
        return data.messages.map(message => {
          // Enhanced message mapping for call detection
          const enhancedFunctionData = {
            ...message.function_data,
            message_id: message.message_id,
            message_type: message.message_type || 'sms'
          };

          let messageType = message.message_type || 'sms';
          let messageContent = message.message_content;
          
          // CRITICAL: Detect VAPI call messages by role and content
          if (message.message_role === 'system' || 
              (message.function_data && message.function_data.call_id)) {
            // This is a VAPI call message
            messageType = 'call';
            enhancedFunctionData.message_type = 'call';
            
            // Add call-specific metadata
            enhancedFunctionData.call_id = message.function_data.call_id;
            enhancedFunctionData.call_status = message.function_data.call_status;
            enhancedFunctionData.call_duration = message.function_data.duration_seconds;
            enhancedFunctionData.call_summary = message.function_data.summary;
            enhancedFunctionData.transcript = message.message_content; // TRANSCRIPT IS HERE!
            enhancedFunctionData.recording_url = message.function_data.recording_url;
            enhancedFunctionData.ended_reason = message.function_data.ended_reason;
            enhancedFunctionData.ended_at = message.function_data.ended_at;
          }

          return {
            message_created_at: new Date(message.created_at).getTime(),
            message_content: messageContent,
            message_role: message.message_role,
            function_execution_status: 'read',
            function_data: enhancedFunctionData,
            source: 'vapi_rural',
            message_id: message.message_id,
            message_type: messageType
          };
        });
        
      } catch (error) {
        console.error('❌ Error fetching Rural King messages:', error);
        return [];
      }
    }
    
    // Handle other VAPI conversations - query local unified_messages table
    console.log(`📞 Fetching unified messages for: ${conversationId}`);
    const result = await this.mainDb.query(`
      SELECT 
        message_content,
        message_role,
        created_at,
        function_data
      FROM unified_messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      LIMIT $2
    `, [conversationId, limit]);
    
    console.log(`📞 Found ${result.rows.length} unified messages`);
    
    return result.rows.map(row => ({
      message_created_at: new Date(row.created_at).getTime(),
      message_content: row.message_content,
      message_role: row.message_role,
      function_execution_status: 'read',
      function_data: row.function_data
    }));
  }
  
  async syncVAPIRuralKingConversations() {
    console.log('🏪 Syncing VAPI Rural King conversations...');
    
    try {
      // Fetch conversations from Rural King API
      const response = await fetch('https://rural-king-deploy.vercel.app/api/conversations?limit=100&offset=0');
      const data = await response.json();
      
      if (!data.success || !Array.isArray(data.conversations)) {
        console.log('❌ Invalid Rural King API response:', data);
        return;
      }
      
      console.log(`📊 Found ${data.conversations.length} Rural King conversations`);
      
      for (const conversation of data.conversations) {
        await this.syncVAPIRuralKingConversation(conversation);
      }
      
      console.log(`✅ Synced ${data.conversations.length} Rural King conversations`);
      
    } catch (error) {
      console.error('❌ Error syncing Rural King conversations:', error);
    }
  }
  
  async syncVAPIRuralKingConversation(conversation) {
    try {
      const conversationId = conversation.conversation_id;
      
      // Upsert conversation
      await this.mainDb.query(`
        INSERT INTO unified_conversations (
          conversation_id, source, customer_name, customer_phone, customer_email,
          last_message_content, last_message_at, updated_at, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (conversation_id) DO UPDATE SET
          customer_name = EXCLUDED.customer_name,
          customer_phone = EXCLUDED.customer_phone,
          last_message_content = EXCLUDED.last_message_content,
          last_message_at = EXCLUDED.last_message_at,
          updated_at = EXCLUDED.updated_at,
          metadata = EXCLUDED.metadata
      `, [
        conversationId,
        'vapi_rural',
        conversation.display_name,
        conversation.user_identifier,
        '', // No email in Rural King
        conversation.last_message_content,
        new Date(conversation.last_message_at),
        new Date(),
        JSON.stringify({
          ...conversation.metadata,
          platform_type: 'rural_king_sms_vapi',
          message_count: conversation.message_count
        })
      ]);
      
    } catch (error) {
      console.error(`Error syncing Rural King conversation ${conversation.conversation_id}:`, error);
    }
  }

  async runSync() {
    console.log('🔄 Starting unified conversation sync...');
    
    try {
      await Promise.all([
        this.syncWoodstockConversations(),
        this.syncVAPIConversations(),
        this.syncVAPIRuralKingConversations() // RESTORED: Rural King integration
      ]);
      
      console.log('✅ Unified sync completed successfully');
    } catch (error) {
      console.error('❌ Unified sync failed:', error);
    }
  }
}

export { DatabaseBridgeIntegration };

