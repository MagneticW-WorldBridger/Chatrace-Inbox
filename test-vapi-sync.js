#!/usr/bin/env node

// VAPI Sync Testing Script
import pg from 'pg';
import { config } from 'dotenv';

config();

console.log('🔄 VAPI SYNC TESTING');
console.log('====================');

async function testVAPISync() {
  const db = new pg.Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await db.connect();
    console.log('✅ Connected to database');
    
    // Check if our test VAPI call exists
    console.log('\n📊 Checking VAPI calls in database...');
    const vapiCalls = await db.query('SELECT * FROM vapi_calls ORDER BY created_at DESC LIMIT 5');
    console.log(`Found ${vapiCalls.rows.length} VAPI calls:`);
    vapiCalls.rows.forEach(call => {
      console.log(`  - ${call.call_id}: ${call.customer_name} (${call.customer_phone})`);
    });
    
    // Manually sync VAPI calls to unified conversations
    console.log('\n🔄 Syncing VAPI calls to unified conversations...');
    for (const call of vapiCalls.rows) {
      const conversationId = `vapi_${call.call_id}`;
      
      // Check if conversation already exists
      const existing = await db.query(
        'SELECT * FROM unified_conversations WHERE conversation_id = $1',
        [conversationId]
      );
      
      if (existing.rows.length === 0) {
        // Create unified conversation
        await db.query(`
          INSERT INTO unified_conversations (
            conversation_id, source, customer_name, customer_phone, customer_email,
            last_message_content, last_message_at, updated_at, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
        
        console.log(`✅ Created unified conversation: ${conversationId}`);
        
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
        
        // Insert messages
        for (const message of messages) {
          await db.query(`
            INSERT INTO unified_messages (
              conversation_id, message_content, message_role, created_at, source, function_data
            ) VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            conversationId,
            message.content,
            message.role,
            message.timestamp,
            'vapi',
            '{}'
          ]);
        }
        
        console.log(`✅ Created ${messages.length} messages for ${conversationId}`);
      } else {
        console.log(`⚠️ Conversation ${conversationId} already exists`);
      }
    }
    
    // Check unified conversations
    console.log('\n📊 Checking unified conversations...');
    const unifiedConv = await db.query(`
      SELECT * FROM unified_conversations 
      WHERE source = 'vapi' 
      ORDER BY updated_at DESC
    `);
    console.log(`Found ${unifiedConv.rows.length} VAPI conversations in unified table:`);
    unifiedConv.rows.forEach(conv => {
      console.log(`  - ${conv.conversation_id}: ${conv.customer_name} (${conv.customer_phone})`);
    });
    
    // Check unified messages
    console.log('\n📊 Checking unified messages...');
    const unifiedMsgs = await db.query(`
      SELECT um.*, uc.customer_name 
      FROM unified_messages um
      JOIN unified_conversations uc ON um.conversation_id = uc.conversation_id
      WHERE um.source = 'vapi'
      ORDER BY um.created_at DESC
      LIMIT 10
    `);
    console.log(`Found ${unifiedMsgs.rows.length} VAPI messages:`);
    unifiedMsgs.rows.forEach(msg => {
      console.log(`  - ${msg.customer_name}: ${msg.message_content.substring(0, 50)}...`);
    });
    
    console.log('\n🎉 VAPI SYNC COMPLETED!');
    return true;
    
  } catch (error) {
    console.error('❌ VAPI sync failed:', error);
    return false;
  } finally {
    await db.end();
  }
}

testVAPISync().catch(console.error);
