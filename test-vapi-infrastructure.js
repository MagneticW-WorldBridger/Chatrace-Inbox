#!/usr/bin/env node

// VAPI Infrastructure Testing Script
import pg from 'pg';
import { config } from 'dotenv';
// Using built-in fetch (Node 18+)

config();

console.log('🚀 VAPI INFRASTRUCTURE TESTING');
console.log('===============================');

class VAPITester {
  constructor() {
    this.db = null;
    this.serverUrl = 'http://localhost:3001';
  }

  async initialize() {
    console.log('🔌 Connecting to database...');
    this.db = new pg.Client({
      connectionString: process.env.DATABASE_URL
    });
    await this.db.connect();
    console.log('✅ Database connected');
  }

  async testDatabaseTables() {
    console.log('\n📊 TESTING DATABASE TABLES');
    console.log('---------------------------');
    
    try {
      // Test vapi_calls table
      const vapiTable = await this.db.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'vapi_calls' 
        ORDER BY ordinal_position
      `);
      console.log('✅ vapi_calls table structure:');
      vapiTable.rows.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });

      // Test unified tables
      const unifiedConv = await this.db.query('SELECT COUNT(*) as count FROM unified_conversations');
      const unifiedMsgs = await this.db.query('SELECT COUNT(*) as count FROM unified_messages');
      
      console.log(`✅ unified_conversations: ${unifiedConv.rows[0].count} records`);
      console.log(`✅ unified_messages: ${unifiedMsgs.rows[0].count} records`);

      return true;
    } catch (error) {
      console.error('❌ Database table test failed:', error.message);
      return false;
    }
  }

  async testWebhookEndpoint() {
    console.log('\n🔗 TESTING WEBHOOK ENDPOINT');
    console.log('----------------------------');
    
    try {
      // Test if server is running
      const healthResponse = await fetch(`${this.serverUrl}/healthz`);
      if (!healthResponse.ok) {
        throw new Error(`Server not responding: ${healthResponse.status}`);
      }
      console.log('✅ Server is running');

      // Test webhook endpoint with mock data
      const mockWebhookData = {
        type: 'call-ended',
        call: {
          id: 'test-call-123',
          status: 'ended',
          customer: {
            number: '+1234567890',
            name: 'Test Customer'
          },
          transcript: 'Hello, this is a test call transcript.',
          summary: 'Test call completed successfully',
          startedAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          endedAt: new Date().toISOString(),
          recordingUrl: 'https://example.com/recording.mp3'
        },
        assistant: {
          id: 'test-assistant-123'
        },
        timestamp: new Date().toISOString()
      };

      console.log('📤 Sending mock webhook data...');
      const webhookResponse = await fetch(`${this.serverUrl}/webhook/vapi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mockWebhookData)
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook failed: ${webhookResponse.status}`);
      }

      const webhookResult = await webhookResponse.json();
      console.log('✅ Webhook endpoint responded:', webhookResult);
      
      return true;
    } catch (error) {
      console.error('❌ Webhook endpoint test failed:', error.message);
      return false;
    }
  }

  async testDatabaseStorage() {
    console.log('\n💾 TESTING DATABASE STORAGE');
    console.log('----------------------------');
    
    try {
      // Check if our test call was stored
      const storedCall = await this.db.query(`
        SELECT * FROM vapi_calls WHERE call_id = 'test-call-123'
      `);

      if (storedCall.rows.length > 0) {
        console.log('✅ Test call stored in database:');
        console.log(`   Call ID: ${storedCall.rows[0].call_id}`);
        console.log(`   Customer: ${storedCall.rows[0].customer_name} (${storedCall.rows[0].customer_phone})`);
        console.log(`   Transcript: ${storedCall.rows[0].transcript?.substring(0, 50)}...`);
        return true;
      } else {
        console.log('⚠️ Test call not found in database - webhook storage not implemented yet');
        return false;
      }
    } catch (error) {
      console.error('❌ Database storage test failed:', error.message);
      return false;
    }
  }

  async testUnifiedInboxIntegration() {
    console.log('\n🔄 TESTING UNIFIED INBOX INTEGRATION');
    console.log('------------------------------------');
    
    try {
      // Test unified conversations endpoint
      const conversationsResponse = await fetch(`${this.serverUrl}/api/inbox/conversations?platform=all&limit=10`);
      if (!conversationsResponse.ok) {
        throw new Error(`Conversations endpoint failed: ${conversationsResponse.status}`);
      }

      const conversations = await conversationsResponse.json();
      console.log('✅ Unified conversations endpoint working');
      console.log(`   Total conversations: ${conversations.data?.length || 0}`);
      
      // Check for VAPI conversations
      const vapiConversations = conversations.data?.filter(conv => conv.source === 'vapi') || [];
      console.log(`   VAPI conversations: ${vapiConversations.length}`);

      if (vapiConversations.length > 0) {
        console.log('✅ VAPI conversations visible in unified inbox');
        return true;
      } else {
        console.log('⚠️ No VAPI conversations found - may need sync');
        return false;
      }
    } catch (error) {
      console.error('❌ Unified inbox integration test failed:', error.message);
      return false;
    }
  }

  async cleanup() {
    if (this.db) {
      await this.db.end();
      console.log('🔌 Database connection closed');
    }
  }

  async runAllTests() {
    const results = {
      databaseTables: false,
      webhookEndpoint: false,
      databaseStorage: false,
      unifiedInbox: false
    };

    try {
      await this.initialize();
      
      results.databaseTables = await this.testDatabaseTables();
      results.webhookEndpoint = await this.testWebhookEndpoint();
      results.databaseStorage = await this.testDatabaseStorage();
      results.unifiedInbox = await this.testUnifiedInboxIntegration();

      console.log('\n📊 TEST RESULTS SUMMARY');
      console.log('========================');
      console.log(`Database Tables: ${results.databaseTables ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Webhook Endpoint: ${results.webhookEndpoint ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Database Storage: ${results.databaseStorage ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Unified Inbox: ${results.unifiedInbox ? '✅ PASS' : '❌ FAIL'}`);

      const passedTests = Object.values(results).filter(Boolean).length;
      const totalTests = Object.keys(results).length;
      
      console.log(`\n🎯 OVERALL SCORE: ${passedTests}/${totalTests} tests passed`);
      
      if (passedTests === totalTests) {
        console.log('🎉 ALL TESTS PASSED! VAPI infrastructure is ready!');
      } else {
        console.log('⚠️ Some tests failed - see issues above');
      }

      return results;
    } finally {
      await this.cleanup();
    }
  }
}

// Run the tests
const tester = new VAPITester();
tester.runAllTests().catch(console.error);
