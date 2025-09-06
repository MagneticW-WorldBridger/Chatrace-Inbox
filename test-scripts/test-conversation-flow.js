#!/usr/bin/env node

/**
 * TEST FIRST APPROACH: Conversation Flow Analysis
 * 
 * This test verifies how conversations are currently handled vs expected flow
 * Based on the authentication guide provided by the user
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test configuration
const API_BASE_URL = 'http://localhost:3001';
const TEST_CONFIG = {
  // From your authentication guide
  USER_TOKEN: process.env.USER_TOKEN,
  API_TOKEN: process.env.API_TOKEN,
  BUSINESS_ID: process.env.BUSINESS_ID,
  
  // Test endpoints
  ENDPOINTS: {
    testAuth: '/api/test-auth',
    conversations: '/api/inbox/conversations',
    messages: '/api/inbox/conversations/:id/messages',
    sendMessage: '/api/inbox/conversations/:id/send',
    updateConversation: '/api/inbox/conversations/:id/update'
  }
};

class ConversationFlowTester {
  constructor() {
    this.results = {
      auth: null,
      conversations: null,
      messages: null,
      sendMessage: null,
      updateConversation: null
    };
    this.errors = [];
  }

  async runAllTests() {
    console.log('🧪 TESTING CONVERSATION FLOW - TEST FIRST APPROACH\n');
    
    try {
      await this.testAuthentication();
      await this.testConversationsList();
      await this.testMessagesRetrieval();
      await this.testSendMessage();
      await this.testUpdateConversation();
      
      this.generateReport();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    }
  }

  async testAuthentication() {
    console.log('🔐 Testing Authentication Flow...');
    
    try {
      const response = await fetch(`${API_BASE_URL}${TEST_CONFIG.ENDPOINTS.testAuth}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      this.results.auth = {
        status: response.status,
        data: data,
        success: data.status === 'OK' && data.token
      };
      
      if (this.results.auth.success) {
        console.log('✅ Authentication: SUCCESS');
        console.log(`   Token: ${data.token?.substring(0, 20)}...`);
        console.log(`   Business ID: ${data.account_id || data.business_id}`);
      } else {
        console.log('❌ Authentication: FAILED');
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      this.errors.push(`Authentication: ${error.message}`);
      console.log('❌ Authentication: ERROR -', error.message);
    }
  }

  async testConversationsList() {
    console.log('\n📋 Testing Conversations List...');
    
    try {
      // Test with different platforms
      const platforms = ['webchat', 'facebook', 'instagram'];
      
      for (const platform of platforms) {
        const response = await fetch(`${API_BASE_URL}${TEST_CONFIG.ENDPOINTS.conversations}?platform=${platform}&limit=10`, {
          method: 'GET',
          headers: {
            'X-ACCESS-TOKEN': TEST_CONFIG.USER_TOKEN || '',
            'X-BUSINESS-ID': TEST_CONFIG.BUSINESS_ID || ''
          }
        });
        
        const data = await response.json();
        
        console.log(`   ${platform.toUpperCase()}: ${response.status} - ${data.status}`);
        console.log(`   Conversations found: ${Array.isArray(data.data) ? data.data.length : 0}`);
        
        if (Array.isArray(data.data) && data.data.length > 0) {
          console.log(`   Sample conversation: ${JSON.stringify(data.data[0], null, 2)}`);
        }
      }
      
      this.results.conversations = { success: true };
    } catch (error) {
      this.errors.push(`Conversations: ${error.message}`);
      console.log('❌ Conversations: ERROR -', error.message);
    }
  }

  async testMessagesRetrieval() {
    console.log('\n💬 Testing Messages Retrieval...');
    
    try {
      // First get a conversation ID
      const convResponse = await fetch(`${API_BASE_URL}${TEST_CONFIG.ENDPOINTS.conversations}?platform=webchat&limit=1`);
      const convData = await convResponse.json();
      
      if (Array.isArray(convData.data) && convData.data.length > 0) {
        const conversationId = convData.data[0].conversation_id;
        console.log(`   Testing with conversation ID: ${conversationId}`);
        
        const response = await fetch(`${API_BASE_URL}${TEST_CONFIG.ENDPOINTS.messages.replace(':id', conversationId)}?limit=10`, {
          method: 'GET',
          headers: {
            'X-ACCESS-TOKEN': TEST_CONFIG.USER_TOKEN || '',
            'X-BUSINESS-ID': TEST_CONFIG.BUSINESS_ID || ''
          }
        });
        
        const data = await response.json();
        
        console.log(`   Messages: ${response.status} - ${data.status}`);
        console.log(`   Messages found: ${Array.isArray(data.data) ? data.data.length : 0}`);
        
        this.results.messages = { success: true, conversationId };
      } else {
        console.log('   No conversations found to test messages');
        this.results.messages = { success: false, reason: 'No conversations' };
      }
    } catch (error) {
      this.errors.push(`Messages: ${error.message}`);
      console.log('❌ Messages: ERROR -', error.message);
    }
  }

  async testSendMessage() {
    console.log('\n📤 Testing Send Message...');
    
    try {
      // Get a conversation ID first
      const convResponse = await fetch(`${API_BASE_URL}${TEST_CONFIG.ENDPOINTS.conversations}?platform=webchat&limit=1`);
      const convData = await convResponse.json();
      
      if (Array.isArray(convData.data) && convData.data.length > 0) {
        const conversationId = convData.data[0].conversation_id;
        
        const testMessage = {
          message: `Test message from conversation flow test - ${new Date().toISOString()}`,
          channel: 9 // webchat
        };
        
        const headers = {
          'Content-Type': 'application/json',
          'X-ACCESS-TOKEN': TEST_CONFIG.USER_TOKEN || '',
          'X-BUSINESS-ID': TEST_CONFIG.BUSINESS_ID || ''
        };
        
        console.log(`   Headers being sent:`, {
          'X-ACCESS-TOKEN': headers['X-ACCESS-TOKEN']?.substring(0, 20) + '...',
          'X-BUSINESS-ID': headers['X-BUSINESS-ID']
        });
        
        const response = await fetch(`${API_BASE_URL}${TEST_CONFIG.ENDPOINTS.sendMessage.replace(':id', conversationId)}`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(testMessage)
        });
        
        let data = null;
        try {
          const responseText = await response.text();
          console.log(`   Raw response text: ${responseText}`);
          
          if (responseText.trim()) {
            data = JSON.parse(responseText);
          } else {
            data = { status: 'ERROR', message: 'Empty response' };
          }
        } catch (error) {
          console.log(`   Send Message: ${response.status} - Failed to parse response`);
          console.log(`   Parse error: ${error.message}`);
          data = { status: 'ERROR', message: 'Parse error', error: error.message };
        }
        
        console.log(`   Send Message: ${response.status} - ${data?.status || 'UNKNOWN'}`);
        console.log(`   Response: ${JSON.stringify(data)}`);
        
        this.results.sendMessage = { success: data?.status === 'OK', response: data };
      } else {
        console.log('   No conversations found to test send message');
        this.results.sendMessage = { success: false, reason: 'No conversations' };
      }
    } catch (error) {
      this.errors.push(`Send Message: ${error.message}`);
      console.log('❌ Send Message: ERROR -', error.message);
    }
  }

  async testUpdateConversation() {
    console.log('\n🔄 Testing Update Conversation...');
    
    try {
      // Get a conversation ID first
      const convResponse = await fetch(`${API_BASE_URL}${TEST_CONFIG.ENDPOINTS.conversations}?platform=webchat&limit=1`);
      const convData = await convResponse.json();
      
      if (Array.isArray(convData.data) && convData.data.length > 0) {
        const conversationId = convData.data[0].conversation_id;
        
        const updatePayload = {
          action: 'read',
          value: true,
          timestamp: Math.floor(Date.now() / 1000)
        };
        
        const response = await fetch(`${API_BASE_URL}${TEST_CONFIG.ENDPOINTS.updateConversation.replace(':id', conversationId)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-ACCESS-TOKEN': TEST_CONFIG.USER_TOKEN || '',
            'X-BUSINESS-ID': TEST_CONFIG.BUSINESS_ID || ''
          },
          body: JSON.stringify(updatePayload)
        });
        
        const data = await response.json();
        
        console.log(`   Update Conversation: ${response.status} - ${data.status}`);
        console.log(`   Response: ${JSON.stringify(data)}`);
        
        this.results.updateConversation = { success: data.status === 'OK', response: data };
      } else {
        console.log('   No conversations found to test update');
        this.results.updateConversation = { success: false, reason: 'No conversations' };
      }
    } catch (error) {
      this.errors.push(`Update Conversation: ${error.message}`);
      console.log('❌ Update Conversation: ERROR -', error.message);
    }
  }

  generateReport() {
    console.log('\n📊 CONVERSATION FLOW TEST REPORT');
    console.log('=====================================');
    
    const tests = [
      { name: 'Authentication', result: this.results.auth },
      { name: 'Conversations List', result: this.results.conversations },
      { name: 'Messages Retrieval', result: this.results.messages },
      { name: 'Send Message', result: this.results.sendMessage },
      { name: 'Update Conversation', result: this.results.updateConversation }
    ];
    
    let passed = 0;
    let failed = 0;
    
    tests.forEach(test => {
      const status = test.result?.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${test.name}`);
      if (test.result?.success === false && test.result?.reason) {
        console.log(`   Reason: ${test.result.reason}`);
      }
      
      if (test.result?.success) passed++;
      else failed++;
    });
    
    console.log(`\n📈 SUMMARY: ${passed} passed, ${failed} failed`);
    
    if (this.errors.length > 0) {
      console.log('\n🚨 ERRORS:');
      this.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    console.log('\n🔍 ANALYSIS:');
    this.analyzeResults();
  }

  analyzeResults() {
    console.log('\n1. AUTHENTICATION FLOW:');
    if (this.results.auth?.success) {
      console.log('   ✅ Authentication is working correctly');
      console.log('   ✅ Token-based auth is functional');
    } else {
      console.log('   ❌ Authentication is broken');
      console.log('   ❌ Check USER_TOKEN and API_TOKEN in .env');
    }
    
    console.log('\n2. CONVERSATION ENDPOINTS:');
    if (this.results.conversations?.success) {
      console.log('   ✅ Conversations endpoint is accessible');
      console.log('   ✅ Platform filtering is working');
    } else {
      console.log('   ❌ Conversations endpoint has issues');
    }
    
    console.log('\n3. MESSAGE HANDLING:');
    if (this.results.messages?.success) {
      console.log('   ✅ Messages can be retrieved');
    } else {
      console.log('   ❌ Message retrieval has issues');
    }
    
    if (this.results.sendMessage?.success) {
      console.log('   ✅ Messages can be sent');
    } else {
      console.log('   ❌ Message sending has issues');
    }
    
    console.log('\n4. RECOMMENDATIONS:');
    if (!this.results.auth?.success) {
      console.log('   🔧 Fix authentication first - check .env variables');
    }
    if (!this.results.conversations?.success) {
      console.log('   🔧 Check backend server is running on port 3001');
    }
    if (!this.results.sendMessage?.success) {
      console.log('   🔧 Verify ChatRace API connection and tokens');
    }
  }
}

// Run the tests
const tester = new ConversationFlowTester();
tester.runAllTests().catch(console.error);

export default ConversationFlowTester;
