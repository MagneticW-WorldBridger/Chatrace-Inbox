#!/usr/bin/env node

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'http://localhost:3001';
const USER_TOKEN = process.env.USER_TOKEN;
const BUSINESS_ID = process.env.BUSINESS_ID;

console.log('🔍 ROOT CAUSE ANALYSIS - MESSAGES STATE');
console.log('=====================================');

async function debugMessagesState() {
  try {
    console.log('\n1️⃣ Getting auth token...');
    const authResponse = await fetch(`${API_BASE_URL}/api/test-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const authData = await authResponse.json();
    console.log('✅ Token obtained:', authData.token?.substring(0, 20) + '...');

    console.log('\n2️⃣ Getting conversations...');
    const conversationsResponse = await fetch(`${API_BASE_URL}/api/inbox/conversations`, {
      headers: {
        'X-ACCESS-TOKEN': authData.token,
        'X-BUSINESS-ID': BUSINESS_ID
      }
    });
    const conversationsData = await conversationsResponse.json();
    
    if (conversationsData.status !== 'success') {
      throw new Error(`Conversations failed: ${JSON.stringify(conversationsData)}`);
    }
    
    console.log(`✅ Found ${conversationsData.data.length} conversations`);
    const testContact = conversationsData.data[0];
    console.log(`📞 Test contact: ${testContact.display_name} (ID: ${testContact.conversation_id})`);

    console.log('\n3️⃣ Getting messages for test contact...');
    const messagesResponse = await fetch(`${API_BASE_URL}/api/inbox/conversations/${testContact.conversation_id}/messages?limit=10`, {
      headers: {
        'X-ACCESS-TOKEN': authData.token,
        'X-BUSINESS-ID': BUSINESS_ID
      }
    });
    const messagesData = await messagesResponse.json();
    
    if (messagesData.status !== 'success') {
      throw new Error(`Messages failed: ${JSON.stringify(messagesData)}`);
    }
    
    console.log(`✅ Found ${messagesData.data?.length || 0} existing messages`);
    
    // Show last 3 messages
    if (messagesData.data?.length > 0) {
      console.log('\n📝 Last 3 messages:');
      messagesData.data.slice(-3).forEach((msg, idx) => {
        console.log(`   ${idx + 1}. [${msg.dir === 0 ? 'OUT' : 'IN'}] ${msg.content?.substring(0, 50) || 'N/A'}...`);
      });
    }

    console.log('\n4️⃣ Simulating React state updates...');
    
    // Simulate current messages state
    let currentMessages = messagesData.data?.map(msg => ({
      id: msg.id || msg.message_id || Date.now().toString(),
      content: msg.content || msg.message || 'N/A',
      timestamp: new Date(msg.timestamp || Date.now()),
      isOwn: msg.dir === 0,
      status: 'received'
    })) || [];
    
    console.log(`📊 Current messages count: ${currentMessages.length}`);
    
    // Simulate adding new message (what frontend does)
    console.log('\n5️⃣ Simulating adding new message...');
    const newMessage = {
      id: Date.now().toString(),
      content: "TEST MESSAGE FROM DEBUG SCRIPT",
      timestamp: new Date(),
      isOwn: true,
      status: 'sent'
    };
    
    // Simulate setMessages function
    const simulateSetMessages = (prev) => {
      console.log('📊 setMessages called with prev type:', Array.isArray(prev) ? `Array(${prev.length})` : typeof prev);
      const currentMessages = Array.isArray(prev) ? prev : [];
      const updated = [...currentMessages, newMessage];
      const sorted = updated.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      console.log('📊 After update, messages count:', sorted.length);
      return sorted;
    };
    
    const updatedMessages = simulateSetMessages(currentMessages);
    console.log(`✅ Messages after adding new: ${updatedMessages.length}`);
    
    // Check if any message is malformed
    const malformedMessages = updatedMessages.filter(msg => 
      !msg.id || !msg.content || !msg.timestamp || typeof msg.isOwn !== 'boolean'
    );
    
    if (malformedMessages.length > 0) {
      console.log(`❌ Found ${malformedMessages.length} malformed messages:`, malformedMessages);
    } else {
      console.log('✅ All messages are well-formed');
    }

    return {
      conversationsCount: conversationsData.data.length,
      messagesCount: messagesData.data?.length || 0,
      updatedCount: updatedMessages.length,
      malformedCount: malformedMessages.length,
      testContact: testContact.display_name
    };
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    throw error;
  }
}

// Run the debug
debugMessagesState()
  .then((results) => {
    console.log('\n🎯 ROOT CAUSE ANALYSIS RESULTS:');
    console.log('===============================');
    console.log(`📊 Conversations: ${results.conversationsCount}`);
    console.log(`📊 Original Messages: ${results.messagesCount}`);
    console.log(`📊 After Adding New: ${results.updatedCount}`);
    console.log(`📊 Malformed Messages: ${results.malformedCount}`);
    console.log(`📞 Test Contact: ${results.testContact}`);
    
    if (results.malformedCount === 0 && results.updatedCount === results.messagesCount + 1) {
      console.log('\n✅ REACT STATE SIMULATION PASSED');
      console.log('🔍 Problem is likely in React rendering or component lifecycle');
    } else {
      console.log('\n❌ REACT STATE SIMULATION FAILED');
      console.log('🔍 Problem is in message state management');
    }
  })
  .catch((error) => {
    console.error('\n💥 ROOT CAUSE ANALYSIS FAILED:');
    console.error(error.message);
    process.exit(1);
  });



