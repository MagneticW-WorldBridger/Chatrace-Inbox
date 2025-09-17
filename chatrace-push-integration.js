w// chatrace-push-integration.js
// PUSH Integration: Send external conversations directly to ChatRace API

import fetch from 'node-fetch';
import pg from 'pg';

class ChatracePushIntegration {
  constructor(chatraceApiUrl, apiToken, businessId) {
    this.apiUrl = chatraceApiUrl; // https://app.aiprlassist.com/api/
    this.apiToken = apiToken;
    this.businessId = businessId;
    this.headers = {
      'Content-Type': 'application/json',
      'X-ACCESS-TOKEN': apiToken,
      'User-Agent': 'mobile-app'
    };
  }

  // ===== WOODSTOCK INTEGRATION =====
  
  async syncWoodstockConversations() {
    console.log('🌲 Starting Woodstock → ChatRace sync...');
    
    // Connect to Woodstock database
    const woodstockDb = new pg.Client({
      connectionString: process.env.WOODSTOCK_DB_URL
    });
    await woodstockDb.connect();
    
    try {
      // Get new/updated conversations from Woodstock
      const conversations = await woodstockDb.query(`
        SELECT DISTINCT 
          c.conversation_id,
          c.user_identifier,
          c.created_at,
          c.updated_at,
          -- Get customer context from latest message
          (SELECT function_output_result 
           FROM chatbot_messages 
           WHERE conversation_id = c.conversation_id 
           AND executed_function_name = 'get_customer_by_phone'
           ORDER BY created_at DESC LIMIT 1) as customer_data
        FROM chatbot_conversations c
        WHERE c.updated_at > NOW() - INTERVAL '1 hour'
        ORDER BY c.updated_at DESC
      `);
      
      for (const convo of conversations.rows) {
        await this.pushWoodstockConversation(convo, woodstockDb);
      }
      
    } finally {
      await woodstockDb.end();
    }
  }
  
  async pushWoodstockConversation(conversation, db) {
    console.log(`📤 Pushing Woodstock conversation: ${conversation.conversation_id}`);
    
    try {
      // 1. Get all messages for this conversation
      const messages = await db.query(`
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
      `, [conversation.conversation_id]);
      
      // 2. Extract customer info
      const customerInfo = this.extractCustomerInfo(messages.rows, conversation);
      
      // 3. Create or find contact in ChatRace
      const contactId = await this.createOrFindContact(customerInfo, 'WOODSTOCK_AI');
      
      // 4. Send conversation messages
      await this.sendConversationMessages(contactId, messages.rows, 'woodstock');
      
      console.log(`✅ Synced Woodstock conversation ${conversation.conversation_id} → ChatRace contact ${contactId}`);
      
    } catch (error) {
      console.error(`❌ Error syncing Woodstock conversation ${conversation.conversation_id}:`, error);
    }
  }
  
  // ===== VAPI INTEGRATION =====
  
  async syncVAPIConversations() {
    console.log('📞 Starting VAPI → ChatRace sync...');
    
    // Connect to your main database (where VAPI webhooks are stored)
    const db = new pg.Client({
      connectionString: process.env.POSTGRES_URL
    });
    await db.connect();
    
    try {
      // Get recent VAPI calls (assuming you store webhook data)
      const calls = await db.query(`
        SELECT 
          call_id,
          customer_phone,
          customer_name,
          transcript,
          summary,
          call_started_at,
          call_ended_at,
          recording_url
        FROM vapi_calls 
        WHERE created_at > NOW() - INTERVAL '1 hour'
        AND synced_to_chatrace = false
        ORDER BY call_started_at DESC
      `);
      
      for (const call of calls.rows) {
        await this.pushVAPICall(call, db);
      }
      
    } finally {
      await db.end();
    }
  }
  
  async pushVAPICall(call, db) {
    console.log(`📤 Pushing VAPI call: ${call.call_id}`);
    
    try {
      // 1. Create customer info from call data
      const customerInfo = {
        phone: call.customer_phone,
        first_name: call.customer_name || 'Phone Customer',
        email: `${call.customer_phone.replace(/[^0-9]/g, '')}@phone.customer`,
        source: 'VAPI_CALL'
      };
      
      // 2. Create or find contact
      const contactId = await this.createOrFindContact(customerInfo, 'VAPI_CALL');
      
      // 3. Send call summary as conversation
      const callMessages = [
        {
          message_content: `📞 Phone call started at ${call.call_started_at}`,
          message_role: 'assistant',
          created_at: call.call_started_at
        },
        {
          message_content: call.transcript || 'Call transcript not available',
          message_role: 'user', 
          created_at: call.call_started_at
        },
        {
          message_content: `📋 Call Summary: ${call.summary || 'No summary available'}`,
          message_role: 'assistant',
          created_at: call.call_ended_at
        }
      ];
      
      if (call.recording_url) {
        callMessages.push({
          message_content: `🎵 Recording: ${call.recording_url}`,
          message_role: 'assistant',
          created_at: call.call_ended_at
        });
      }
      
      await this.sendConversationMessages(contactId, callMessages, 'vapi');
      
      // Mark as synced
      await db.query(`
        UPDATE vapi_calls 
        SET synced_to_chatrace = true, chatrace_contact_id = $1
        WHERE call_id = $2
      `, [contactId, call.call_id]);
      
      console.log(`✅ Synced VAPI call ${call.call_id} → ChatRace contact ${contactId}`);
      
    } catch (error) {
      console.error(`❌ Error syncing VAPI call ${call.call_id}:`, error);
    }
  }
  
  // ===== CHATRACE API HELPERS =====
  
  async createOrFindContact(customerInfo, source) {
    // Try to find existing contact by phone or email
    let contactId = null;
    
    if (customerInfo.phone) {
      contactId = await this.findContactByField('phone', customerInfo.phone);
    }
    
    if (!contactId && customerInfo.email) {
      contactId = await this.findContactByField('email', customerInfo.email);
    }
    
    if (contactId) {
      console.log(`📋 Found existing ChatRace contact: ${contactId}`);
      return contactId;
    }
    
    // Create new contact
    const contactData = {
      phone: customerInfo.phone || '',
      email: customerInfo.email || '',
      first_name: customerInfo.first_name || 'Unknown',
      last_name: customerInfo.last_name || '',
      actions: [
        {
          action: 'add_tag',
          tag_name: source
        },
        {
          action: 'set_field_value',
          field_name: 'conversation_source', 
          value: source
        }
      ]
    };
    
    const response = await fetch(`${this.apiUrl}/contacts`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(contactData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Created new ChatRace contact: ${result.id}`);
      return result.id;
    } else {
      throw new Error(`Failed to create contact: ${JSON.stringify(result)}`);
    }
  }
  
  async findContactByField(fieldId, value) {
    try {
      const response = await fetch(
        `${this.apiUrl}/contacts/find_by_custom_field?field_id=${fieldId}&value=${encodeURIComponent(value)}`,
        {
          method: 'GET',
          headers: this.headers
        }
      );
      
      const result = await response.json();
      
      if (result.data && result.data.length > 0) {
        return result.data[0].id;
      }
      
      return null;
    } catch (error) {
      console.error(`Error finding contact by ${fieldId}:`, error);
      return null;
    }
  }
  
  async sendConversationMessages(contactId, messages, source) {
    for (const message of messages) {
      try {
        // Format message with source context
        let messageText = message.message_content;
        
        // Add function call context for Woodstock messages
        if (message.executed_function_name) {
          messageText += `\n\n🔧 Function: ${message.executed_function_name}`;
          if (message.function_input_parameters) {
            messageText += `\n📥 Input: ${JSON.stringify(message.function_input_parameters)}`;
          }
          if (message.function_output_result) {
            messageText += `\n📤 Result: ${JSON.stringify(message.function_output_result)}`;
          }
        }
        
        // Add role prefix
        const rolePrefix = message.message_role === 'user' ? '👤 Customer' : '🤖 AI Assistant';
        messageText = `${rolePrefix}: ${messageText}`;
        
        // Send to ChatRace
        const response = await fetch(`${this.apiUrl}/contacts/${contactId}/send/text`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            text: messageText,
            channel: source === 'vapi' ? 'webchat' : 'messenger'
          })
        });
        
        const result = await response.json();
        
        if (!result.success) {
          console.error(`Failed to send message to contact ${contactId}:`, result);
        }
        
        // Small delay to maintain message order
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error sending message to contact ${contactId}:`, error);
      }
    }
  }
  
  extractCustomerInfo(messages, conversation) {
    // Extract customer info from function calls and conversation data
    let customerInfo = {
      phone: '',
      email: '',
      first_name: 'AI Chat Customer',
      last_name: '',
      source: 'WOODSTOCK_AI'
    };
    
    // Look for customer data in function results
    for (const message of messages) {
      if (message.executed_function_name === 'get_customer_by_phone' && message.function_output_result) {
        try {
          const customerData = JSON.parse(message.function_output_result);
          if (customerData.customer) {
            customerInfo.phone = customerData.customer.phone || '';
            customerInfo.email = customerData.customer.email || '';
            customerInfo.first_name = customerData.customer.first_name || customerInfo.first_name;
            customerInfo.last_name = customerData.customer.last_name || '';
          }
        } catch (e) {
          console.warn('Error parsing customer data:', e);
        }
      }
    }
    
    // Fallback: use user_identifier as phone if no customer data found
    if (!customerInfo.phone && conversation.user_identifier) {
      customerInfo.phone = conversation.user_identifier;
      customerInfo.email = `${conversation.user_identifier.replace(/[^0-9]/g, '')}@woodstock.ai`;
    }
    
    return customerInfo;
  }
}

// ===== USAGE =====

async function runChatraceSync() {
  const integration = new ChatracePushIntegration(
    'https://app.aiprlassist.com/api',
    process.env.API_TOKEN, // Your ChatRace API token
    process.env.BUSINESS_ID
  );
  
  try {
    // Sync both sources
    await Promise.all([
      integration.syncWoodstockConversations(),
      integration.syncVAPIConversations()
    ]);
    
    console.log('✅ ChatRace sync completed successfully');
  } catch (error) {
    console.error('❌ ChatRace sync failed:', error);
  }
}

// Run every 5 minutes
setInterval(runChatraceSync, 5 * 60 * 1000);

export { ChatracePushIntegration, runChatraceSync };

