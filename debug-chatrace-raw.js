#!/usr/bin/env node

// Debug script to see what ChatRace API actually returns
async function debugChatRaceRaw() {
  try {
    console.log('🧪 Testing direct ChatRace API call...');
    
    // Test the backend endpoint that calls ChatRace
    const response = await fetch('http://localhost:3001/api/inbox/conversations?account_id=1145545');
    const data = await response.json();
    
    console.log('📥 Backend response structure:');
    console.log('Status:', data.status);
    console.log('Data length:', data.data?.length);
    
    if (data.data && data.data.length > 0) {
      console.log('\n🔍 First conversation fields:');
      const first = data.data[0];
      Object.keys(first).forEach(key => {
        console.log(`  ${key}: ${first[key]}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugChatRaceRaw();
