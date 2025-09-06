#!/usr/bin/env node

import WebSocket from 'ws';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:5173';
const USER_TOKEN = process.env.USER_TOKEN; // Using USER_TOKEN like frontend
const BUSINESS_ID = process.env.BUSINESS_ID;
const USER_ID = process.env.USER_ID;

console.log('🧪 TESTING COMPLETE FRONTEND FLOW');
console.log('=================================');

async function testFrontendFlow() {
  try {
    console.log('\n1️⃣ Testing frontend is running...');
    const frontendResponse = await fetch(FRONTEND_URL);
    if (!frontendResponse.ok) {
      throw new Error(`Frontend not running on ${FRONTEND_URL}`);
    }
    console.log('✅ Frontend is running');

    console.log('\n2️⃣ Testing /api/test-auth (like frontend does)...');
    const authResponse = await fetch(`${API_BASE_URL}/api/test-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const authData = await authResponse.json();
    
    if (authData.status !== 'OK') {
      throw new Error(`Auth failed: ${JSON.stringify(authData)}`);
    }
    console.log('✅ Auth OK - Token:', authData.token?.substring(0, 20) + '...');
    const frontendToken = authData.token;

    console.log('\n3️⃣ Testing /api/whitelabel with frontend token...');
    const whitelabelResponse = await fetch(`${API_BASE_URL}/api/whitelabel`, {
      headers: {
        'X-ACCESS-TOKEN': frontendToken,
        'Origin': 'http://localhost:5173'
      }
    });
    const whitelabelData = await whitelabelResponse.json();
    
    if (whitelabelData.status !== 'OK') {
      throw new Error(`Whitelabel failed: ${JSON.stringify(whitelabelData)}`);
    }
    const wsUrl = whitelabelData.data.wsurl;
    console.log('✅ WebSocket URL obtained:', wsUrl);

    console.log('\n4️⃣ Testing conversations endpoint...');
    const conversationsResponse = await fetch(`${API_BASE_URL}/api/inbox/conversations`, {
      headers: {
        'X-ACCESS-TOKEN': frontendToken,
        'X-BUSINESS-ID': BUSINESS_ID
      }
    });
    const conversationsData = await conversationsResponse.json();
    
    if (conversationsData.status !== 'success' || !conversationsData.data?.length) {
      throw new Error(`No conversations found: ${JSON.stringify(conversationsData)}`);
    }
    console.log(`✅ Found ${conversationsData.data.length} conversations`);
    
    const testContact = conversationsData.data[0];
    console.log(`📞 Using test contact: ${testContact.display_name} (ID: ${testContact.conversation_id})`);

    console.log('\n5️⃣ Testing WebSocket connection (frontend style)...');
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      let messagesSent = 0;
      let messagesReceived = 0;
      
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket test timeout'));
      }, 30000);
      
      ws.on('open', () => {
        console.log('✅ WebSocket connected');
        
        // Authenticate immediately (frontend style)
        const authMessage = {
          action: 'authenticate',
          data: {
            platform: 'web',
            account_id: BUSINESS_ID,
            user_id: USER_ID,
            token: frontendToken
          }
        };
        console.log('🔑 Sending auth (frontend style)...');
        ws.send(JSON.stringify(authMessage));
        
        // Subscribe to conversation immediately (no wait)
        setTimeout(() => {
          const subscribeMessage = {
            action: -1,
            data: {
              dir: 0,
              from: USER_ID,
              channel: 9,
              page_id: BUSINESS_ID,
              ms_id: testContact.conversation_id,
              hash: ''
            }
          };
          console.log('📱 Subscribing to conversation...');
          ws.send(JSON.stringify(subscribeMessage));
          
          // Send test message after subscription
          setTimeout(() => {
            const testMessage = {
              action: 0,
              data: {
                platform: "web",
                dir: 0,
                account_id: BUSINESS_ID,
                contact_id: testContact.conversation_id,
                user_id: USER_ID,
                token: frontendToken,
                fromInbox: true,
                channel: 9,
                from: USER_ID,
                hash: "",
                timestamp: Date.now().toString(),
                message: [{
                  type: "text",
                  text: `Frontend flow test - ${new Date().toISOString()}`,
                  dir: 0,
                  channel: 9,
                  from: USER_ID,
                  replyingTo: null
                }]
              }
            };
            
            console.log('📤 Sending message (frontend style)...');
            ws.send(JSON.stringify(testMessage));
            messagesSent++;
            
            // Wait for response
            setTimeout(() => {
              console.log(`📊 Messages sent: ${messagesSent}, received: ${messagesReceived}`);
              clearTimeout(timeout);
              ws.close();
              
              resolve({
                frontend: true,
                auth: true,
                whitelabel: true,
                conversations: true,
                websocket: true,
                messageSent: messagesSent > 0,
                messageReceived: messagesReceived > 0,
                totalConversations: conversationsData.data.length
              });
            }, 5000);
            
          }, 1000);
        }, 1000);
      });
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('📥 WebSocket message received:', {
            action: message.action,
            isBot: message.isBot,
            hasData: !!message.data,
            messageText: message.data?.message?.[0]?.text || 'N/A'
          });
          messagesReceived++;
        } catch (error) {
          console.error('❌ Error parsing message:', error);
        }
      });
      
      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        clearTimeout(timeout);
        reject(error);
      });
      
      ws.on('close', (code, reason) => {
        console.log(`🔌 WebSocket closed - Code: ${code}`);
        clearTimeout(timeout);
      });
    });
    
  } catch (error) {
    console.error('❌ Frontend flow test failed:', error);
    throw error;
  }
}

// Run the test
testFrontendFlow()
  .then((results) => {
    console.log('\n🎉 FRONTEND FLOW TEST RESULTS:');
    console.log('==============================');
    console.log(`✅ Frontend Running: ${results.frontend ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Authentication: ${results.auth ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Whitelabel: ${results.whitelabel ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Conversations: ${results.conversations ? 'PASS' : 'FAIL'} (${results.totalConversations} found)`);
    console.log(`✅ WebSocket: ${results.websocket ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Message Sent: ${results.messageSent ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Message Received: ${results.messageReceived ? 'PASS' : 'FAIL'}`);
    
    const allPassed = Object.values(results).every(result => result === true || typeof result === 'number');
    console.log(`\n🏆 OVERALL RESULT: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (allPassed) {
      console.log('\n🚀 FRONTEND SHOULD WORK PERFECTLY!');
    } else {
      console.log('\n💥 FRONTEND HAS ISSUES!');
    }
    
    process.exit(allPassed ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 FRONTEND FLOW TEST FAILED:');
    console.error('=============================');
    console.error(error.message);
    process.exit(1);
  });




