#!/usr/bin/env node

// Test script to see what ChatRace API actually returns
// Using native fetch (Node.js 18+)

async function testChatRaceResponse() {
  try {
    console.log('🧪 Testing ChatRace conversations API response...');
    
    const response = await fetch('http://localhost:3001/api/inbox/conversations?account_id=1145545');
    const data = await response.json();
    
    console.log('📥 Full response structure:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.data && data.data.length > 0) {
      console.log('\n🔍 First conversation details:');
      console.log(JSON.stringify(data.data[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testChatRaceResponse();
