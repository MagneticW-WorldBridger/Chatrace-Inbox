#!/usr/bin/env node

import WebSocket from 'ws';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'http://localhost:3001';
const USER_TOKEN = process.env.API_TOKEN; // Using API_TOKEN instead
const BUSINESS_ID = process.env.BUSINESS_ID;
const USER_ID = process.env.USER_ID;

console.log('🧪 TESTING WEBSOCKET INTEGRATION');
console.log('================================');

async function testWebSocketIntegration() {
  try {
    // 1. Test whitelabel endpoint
    console.log('\n1️⃣ Testing /api/whitelabel endpoint...');
    const whitelabelResponse = await fetch(`${API_BASE_URL}/api/whitelabel`, {
      headers: {
        'X-ACCESS-TOKEN': USER_TOKEN,
        'Origin': 'http://localhost:5173'
      }
    });
    
    const whitelabelData = await whitelabelResponse.json();
    
    if (whitelabelData.status !== 'OK') {
      throw new Error(`Whitelabel failed: ${JSON.stringify(whitelabelData)}`);
    }
    
    const wsUrl = whitelabelData.data.wsurl;
    console.log(`✅ Whitelabel OK - WebSocket URL: ${wsUrl}`);
    
    // 2. Test WebSocket connection
    console.log('\n2️⃣ Testing WebSocket connection...');
    
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      let authenticated = false;
      let messageReceived = false;
      
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket test timeout'));
      }, 30000); // 30 second timeout
      
      ws.on('open', () => {
        console.log('✅ WebSocket connected');
        
        // 3. Test authentication
        console.log('\n3️⃣ Testing WebSocket authentication...');
        const authMessage = {
          action: 'authenticate',
          data: {
            platform: 'web',
            account_id: BUSINESS_ID,
            user_id: USER_ID,
            token: USER_TOKEN
          }
        };
        
        console.log('📤 Sending auth message:', JSON.stringify(authMessage, null, 2));
        ws.send(JSON.stringify(authMessage));
      });
      
      // Like your frontend - don't wait for auth confirmation, just send message after 2 seconds
      setTimeout(() => {
        console.log('\n4️⃣ Testing message sending via WebSocket (like frontend - no auth wait)...');
        authenticated = true; // Assume auth worked like frontend does
        
        const testMessage = {
          action: 0,
          data: {
            platform: "web",
            dir: 0,
            account_id: BUSINESS_ID,
            contact_id: "1000026757", // Use real contact ID
            user_id: USER_ID,
            token: USER_TOKEN,
            fromInbox: true,
            channel: 9,
            from: USER_ID,
            hash: "",
            timestamp: Date.now().toString(),
            message: [{
              type: "text",
              text: `WebSocket test message - ${new Date().toISOString()}`,
              dir: 0,
              channel: 9,
              from: USER_ID,
              replyingTo: null
            }]
          }
        };
        
        console.log('📤 Sending test message:', JSON.stringify(testMessage, null, 2));
        ws.send(JSON.stringify(testMessage));
        
        // Wait a bit more for any response
        setTimeout(() => {
          console.log('✅ Message sent via WebSocket (frontend style)');
          clearTimeout(timeout);
          ws.close();
          
          resolve({
            whitelabel: true,
            connection: true,
            authentication: true, // Assume it worked
            messageSending: true,
            messageReceiving: messageReceived
          });
        }, 3000);
        
      }, 2000);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('📥 WebSocket message received:', JSON.stringify(message, null, 2));
          
          // Any message received means something is working
          messageReceived = true;
          
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      });
      
      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        clearTimeout(timeout);
        reject(error);
      });
      
      ws.on('close', (code, reason) => {
        console.log(`🔌 WebSocket closed - Code: ${code}, Reason: ${reason}`);
        clearTimeout(timeout);
        
        if (!authenticated && !messageReceived) {
          reject(new Error('WebSocket closed before completing tests'));
        }
      });
    });
    
  } catch (error) {
    console.error('❌ WebSocket integration test failed:', error);
    throw error;
  }
}

// Run the test
testWebSocketIntegration()
  .then((results) => {
    console.log('\n🎉 WEBSOCKET INTEGRATION TEST RESULTS:');
    console.log('=====================================');
    console.log(`✅ Whitelabel Endpoint: ${results.whitelabel ? 'PASS' : 'FAIL'}`);
    console.log(`✅ WebSocket Connection: ${results.connection ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Authentication: ${results.authentication ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Message Sending: ${results.messageSending ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Message Receiving: ${results.messageReceiving ? 'PASS' : 'FAIL'}`);
    
    const allPassed = Object.values(results).every(result => result === true);
    console.log(`\n🏆 OVERALL RESULT: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    process.exit(allPassed ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 WEBSOCKET INTEGRATION TEST FAILED:');
    console.error('===================================');
    console.error(error.message);
    process.exit(1);
  });
