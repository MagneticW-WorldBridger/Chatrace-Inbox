// server-integration-patch.js
// Add this to your existing backend/server.js to enable unified inbox

import { getUnifiedConversations, getUnifiedMessages, triggerUnifiedSync } from './unified-inbox-endpoints.js';

// Replace your existing conversations endpoint with this:
/*
// ENHANCED: Inbox API: Get conversations (ChatRace + External Sources)
app.get('/api/inbox/conversations', async (req, res) => {
  return getUnifiedConversations(req, res, callUpstream, resolveAccountId);
});

// ENHANCED: Inbox API: Get messages for a conversation (ChatRace + External Sources)  
app.get('/api/inbox/conversations/:id/messages', async (req, res) => {
  return getUnifiedMessages(req, res, callUpstream, resolveAccountId);
});

// NEW: Manual sync endpoint
app.post('/api/inbox/sync', async (req, res) => {
  return triggerUnifiedSync(req, res);
});

// NEW: Get sync status and source counts
app.get('/api/inbox/sources', async (req, res) => {
  try {
    // This would show the breakdown of conversation sources
    return res.json({
      status: 'success',
      sources: {
        chatrace: { name: 'ChatRace', icon: '💬', active: true },
        woodstock: { name: 'Woodstock AI', icon: '🌲', active: true },
        vapi: { name: 'VAPI Calls', icon: '📞', active: true }
      }
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});
*/

// VAPI webhook enhancement to store calls for unified inbox
/*
// ENHANCED: VAPI Webhook endpoint - receives call events and stores for unified inbox
app.post('/webhook/vapi', async (req, res) => {
  console.log('🔔 VAPI Webhook received:', JSON.stringify(req.body, null, 2));
  
  const { type, call, assistant, timestamp } = req.body;
  
  // Log the event type and key data
  console.log(`📞 Event: ${type}`);
  if (call) {
    console.log(`📱 Call ID: ${call.id}`);
    console.log(`📱 Call Status: ${call.status}`);
    if (call.customer) {
      console.log(`👤 Customer: ${call.customer.number} (${call.customer.name || 'Unknown'})`);
    }
  }
  
  // Store call data for unified inbox
  try {
    if (type === 'call-ended' && call) {
      // Store completed call in database
      await storeVAPICall({
        call_id: call.id,
        customer_phone: call.customer?.number || '',
        customer_name: call.customer?.name || '',
        transcript: call.transcript || '',
        summary: call.summary || '',
        call_started_at: call.startedAt ? new Date(call.startedAt) : new Date(),
        call_ended_at: call.endedAt ? new Date(call.endedAt) : new Date(),
        recording_url: call.recordingUrl || '',
        created_at: new Date()
      });
      
      console.log(`✅ Stored VAPI call ${call.id} for unified inbox`);
    }
  } catch (error) {
    console.error('❌ Error storing VAPI call:', error);
  }
  
  // Handle different event types (existing logic)
  switch (type) {
    case 'call-started':
      console.log('✅ Call started successfully');
      break;
    case 'call-ended':
      console.log('🛑 Call ended');
      if (call.transcript) {
        console.log('📝 Transcript:', call.transcript);
      }
      if (call.recordingUrl) {
        console.log('🎵 Recording URL:', call.recordingUrl);
      }
      if (call.summary) {
        console.log('📋 Summary:', call.summary);
      }
      break;
    case 'transcript':
      console.log('📝 Transcript update:', req.body.transcript);
      break;
    case 'function-call':
      console.log('⚡ Function call:', req.body.functionCall);
      break;
    default:
      console.log('ℹ️ Other event type:', type);
  }
  
  res.status(200).json({ status: 'received' });
});

// Helper function to store VAPI calls
async function storeVAPICall(callData) {
  // You'll need to add this table to your database
  const query = `
    INSERT INTO vapi_calls (
      call_id, customer_phone, customer_name, transcript, summary,
      call_started_at, call_ended_at, recording_url, created_at, synced_to_chatrace
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (call_id) DO UPDATE SET
      transcript = EXCLUDED.transcript,
      summary = EXCLUDED.summary,
      call_ended_at = EXCLUDED.call_ended_at,
      recording_url = EXCLUDED.recording_url
  `;
  
  const values = [
    callData.call_id,
    callData.customer_phone,
    callData.customer_name,
    callData.transcript,
    callData.summary,
    callData.call_started_at,
    callData.call_ended_at,
    callData.recording_url,
    callData.created_at,
    false // synced_to_chatrace
  ];
  
  // You'll need to implement this with your database connection
  // await db.query(query, values);
}
*/

console.log(`
🎯 UNIFIED INBOX INTEGRATION READY!

To complete the integration:

1. **Add VAPI calls table to your database:**
   CREATE TABLE vapi_calls (
     id SERIAL PRIMARY KEY,
     call_id TEXT UNIQUE NOT NULL,
     customer_phone TEXT,
     customer_name TEXT,
     transcript TEXT,
     summary TEXT,
     call_started_at TIMESTAMP,
     call_ended_at TIMESTAMP,
     recording_url TEXT,
     created_at TIMESTAMP DEFAULT NOW(),
     synced_to_chatrace BOOLEAN DEFAULT false,
     chatrace_contact_id TEXT
   );

2. **Update your server.js with the enhanced endpoints above**

3. **Choose your integration approach:**
   - PUSH: Use chatrace-push-integration.js to send to ChatRace API
   - PULL: Use database-bridge-integration.js for unified database

4. **Test the integration:**
   - Visit your inbox at http://localhost:5173
   - Check /api/inbox/conversations for unified conversations
   - Trigger manual sync with POST /api/inbox/sync

🚀 Your unified inbox will show:
   🌲 Woodstock AI conversations
   📞 VAPI phone calls  
   💬 ChatRace conversations
   All in one beautiful interface!
`);

export default {
  getUnifiedConversations,
  getUnifiedMessages, 
  triggerUnifiedSync
};

