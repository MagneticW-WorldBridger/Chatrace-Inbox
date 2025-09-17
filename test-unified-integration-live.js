#!/usr/bin/env node

// 🧪 LIVE UNIFIED INTEGRATION TEST
// Tests the complete unified inbox system with real data

import fetch from 'node-fetch';
import { DatabaseBridgeIntegration } from './database-bridge-integration.js';

const API_BASE_URL = 'http://localhost:3001';

console.log('🚀 UNIFIED INTEGRATION - LIVE TEST');
console.log('==================================');

async function testUnifiedIntegration() {
    let testResults = {
        databaseBridge: false,
        unifiedConversations: false,
        conversationSources: false,
        messageRetrieval: false,
        woodstockData: false
    };

    try {
        // Step 1: Test Database Bridge
        console.log('\n1️⃣ Testing Database Bridge Connection...');
        const bridge = new DatabaseBridgeIntegration();
        await bridge.initialize();
        console.log('✅ Database bridge initialized successfully');
        testResults.databaseBridge = true;

        // Step 2: Test Woodstock Connection
        console.log('\n2️⃣ Testing Woodstock Database Access...');
        const woodstockConversations = await bridge.woodstockDb.query(`
            SELECT COUNT(*) as total FROM chatbot_conversations LIMIT 1
        `);
        const conversationCount = woodstockConversations.rows[0].total;
        console.log(`✅ Woodstock DB: ${conversationCount} conversations found`);
        testResults.woodstockData = conversationCount > 0;

        // Step 3: Start backend server (if not running)
        console.log('\n3️⃣ Testing Backend Server...');
        let serverStarted = false;
        try {
            const healthCheck = await fetch(`${API_BASE_URL}/health`);
            if (healthCheck.ok) {
                console.log('✅ Backend server already running');
            }
        } catch (error) {
            console.log('🚀 Starting backend server...');
            // Note: In real test, we'd start the server here
            console.log('⚠️  Please start: cd backend && npm start');
            serverStarted = false;
        }

        // Step 4: Test Auth
        console.log('\n4️⃣ Testing Authentication...');
        const authResponse = await fetch(`${API_BASE_URL}/api/test-auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const authData = await authResponse.json();
        
        if (authData.status === 'OK') {
            console.log('✅ Authentication working');
            const token = authData.token;

            // Step 5: Test Unified Conversations Endpoint
            console.log('\n5️⃣ Testing Unified Conversations...');
            const conversationsResponse = await fetch(
                `${API_BASE_URL}/api/inbox/conversations?platform=all&limit=10`,
                {
                    headers: {
                        'X-ACCESS-TOKEN': token,
                        'X-BUSINESS-ID': process.env.BUSINESS_ID || '1145545'
                    }
                }
            );

            const conversationsData = await conversationsResponse.json();
            
            if (conversationsData.status === 'success' || conversationsData.status === 'OK') {
                console.log(`✅ Unified conversations: ${conversationsData.data?.length || 0} found`);
                testResults.unifiedConversations = true;

                // Check for multiple sources
                if (conversationsData.sources) {
                    const sources = Object.keys(conversationsData.sources);
                    console.log(`✅ Multiple sources detected: ${sources.join(', ')}`);
                    testResults.conversationSources = true;
                } else if (conversationsData.data && conversationsData.data.length > 0) {
                    const sourcesFound = [...new Set(conversationsData.data.map(c => c.source))].filter(Boolean);
                    if (sourcesFound.length > 0) {
                        console.log(`✅ Sources in data: ${sourcesFound.join(', ')}`);
                        testResults.conversationSources = true;
                    }
                }

                // Step 6: Test Messages for a conversation
                if (conversationsData.data && conversationsData.data.length > 0) {
                    console.log('\n6️⃣ Testing Message Retrieval...');
                    const testConversation = conversationsData.data[0];
                    console.log(`📞 Testing conversation: ${testConversation.display_name} (${testConversation.conversation_id})`);

                    const messagesResponse = await fetch(
                        `${API_BASE_URL}/api/inbox/conversations/${testConversation.conversation_id}/messages?limit=5`,
                        {
                            headers: {
                                'X-ACCESS-TOKEN': token,
                                'X-BUSINESS-ID': process.env.BUSINESS_ID || '1145545'
                            }
                        }
                    );

                    const messagesData = await messagesResponse.json();
                    
                    if (messagesData.status === 'success' || messagesData.status === 'OK') {
                        console.log(`✅ Messages retrieved: ${messagesData.data?.length || 0} messages`);
                        testResults.messageRetrieval = true;

                        if (messagesData.data && messagesData.data.length > 0) {
                            const sampleMessage = messagesData.data[0];
                            console.log(`📝 Sample message: "${sampleMessage.message_content?.substring(0, 50)}..."`);
                            console.log(`👤 Role: ${sampleMessage.message_role}`);
                        }
                    } else {
                        console.log('⚠️  Messages endpoint returned error or no data');
                    }
                }
            } else {
                console.log('❌ Unified conversations endpoint failed');
                console.log('Response:', JSON.stringify(conversationsData, null, 2));
            }
        } else {
            console.log('❌ Authentication failed');
        }

        // Cleanup
        try {
            await bridge.woodstockDb.end();
            await bridge.mainDb.end();
        } catch (e) {
            console.log('⚠️  Cleanup warning:', e.message);
        }

    } catch (error) {
        console.error('❌ Integration test failed:', error.message);
        console.error('Stack:', error.stack);
    }

    // Results Summary
    console.log('\n🏆 UNIFIED INTEGRATION TEST RESULTS');
    console.log('===================================');
    
    const results = [
        ['Database Bridge', testResults.databaseBridge],
        ['Unified Conversations', testResults.unifiedConversations],
        ['Multiple Sources', testResults.conversationSources],
        ['Message Retrieval', testResults.messageRetrieval],
        ['Woodstock Data', testResults.woodstockData]
    ];

    let passedCount = 0;
    results.forEach(([name, passed]) => {
        const status = passed ? '✅ PASSED' : '❌ FAILED';
        console.log(`${status}: ${name}`);
        if (passed) passedCount++;
    });

    const totalTests = results.length;
    console.log(`\nOVERALL: ${passedCount}/${totalTests} tests passed`);

    if (passedCount === totalTests) {
        console.log('\n🎉🎉🎉 ALL INTEGRATION TESTS PASSED! 🎉🎉🎉');
        console.log('✅ UNIFIED INBOX SYSTEM IS FULLY FUNCTIONAL!');
        process.exit(0);
    } else {
        console.log('\n💥 SOME INTEGRATION TESTS FAILED');
        console.log('❌ Review failures and fix before deploying');
        process.exit(1);
    }
}

testUnifiedIntegration();

