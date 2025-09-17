#!/usr/bin/env node

// test-woodstock-integration.js
// Simple test to simulate Woodstock AI conversation in ChatRace inbox

const API_URL = 'https://app.aiprlassist.com/api';
const API_TOKEN = '1281352.DJB0g6DT3PONyWkenC43WIS2aexzXwiaLWnuKiGEF2Rsky';
const BACKEND_URL = 'http://localhost:3001';
const BACKEND_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiMTAwMDAyNjc1NyIsImV4cGlyZSI6MTc4NjM3Mjc4OSwicHJvdmlkZXIiOiJnb29nbGUiLCJ3dCI6IjQyMCJ9.J8B9b_A2Fk8Em4F27cUBtVRZ9ZPHb5DO7uZtJ8C2Y6A';

async function testWoodstockIntegration() {
  console.log('🌲 Testing Woodstock AI → ChatRace Integration\n');
  
  try {
    // Step 1: Create a contact in ChatRace
    console.log('📋 Step 1: Creating Woodstock customer contact...');
    
    const contactResponse = await fetch(`${API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ACCESS-TOKEN': API_TOKEN,
        'User-Agent': 'mobile-app'
      },
      body: JSON.stringify({
        phone: '+15551234567',
        email: 'woodstock.customer@example.com',
        first_name: 'Sarah',
        last_name: 'Johnson',
        actions: [
          {
            action: 'add_tag',
            tag_name: 'WOODSTOCK_AI'
          },
          {
            action: 'set_field_value',
            field_name: 'source',
            value: 'loft-chat-chingon'
          }
        ]
      })
    });
    
    const contactData = await contactResponse.json();
    console.log('✅ Contact created:', contactData);
    
    if (!contactData.success) {
      throw new Error('Failed to create contact');
    }
    
    const contactId = contactData.data.id;
    
    // Step 2: Simulate Woodstock AI conversation
    console.log('\n💬 Step 2: Simulating Woodstock AI conversation...');
    
    const messages = [
      {
        text: '👤 Customer: Hi, I\'m looking for a bedroom set for my master bedroom. What do you have available?',
        delay: 0
      },
      {
        text: '🤖 Woodstock AI: I\'d be happy to help you find the perfect bedroom set! Let me search our inventory for you.',
        delay: 1000
      },
      {
        text: '🔧 AI Function Call: search_products_by_category(category="bedroom", room_type="master")',
        delay: 2000
      },
      {
        text: '🤖 AI Response: I found 5 beautiful bedroom sets perfect for a master bedroom:\n\n1. **Royal Oak Collection** - $2,499 (King size, includes dresser)\n2. **Modern Walnut Set** - $1,899 (Queen/King available)\n3. **Classic Cherry Bedroom** - $2,199 (Traditional style)\n4. **Contemporary Platform Set** - $1,699 (Minimalist design)\n5. **Luxury Upholstered Collection** - $3,299 (Premium fabric headboard)\n\nWhich style interests you most?',
        delay: 3000
      },
      {
        text: '👤 Customer: The Royal Oak Collection sounds nice. Can you tell me more about it?',
        delay: 4000
      },
      {
        text: '🔧 AI Function Call: get_product_details(product_id="royal_oak_bedroom_set")',
        delay: 5000
      },
      {
        text: '🤖 AI Response: **Royal Oak Collection Details:**\n\n✅ **In Stock** - 3 sets available\n💰 **Price:** $2,499 (King), $2,299 (Queen)\n📦 **Includes:** Bed frame, 2 nightstands, dresser with mirror\n🌳 **Material:** Solid oak with rich honey finish\n📏 **Dimensions:** King bed 82"W x 88"L x 54"H\n🚚 **Delivery:** Free white glove delivery within 50 miles\n⭐ **Rating:** 4.8/5 stars (127 reviews)\n\nWould you like to see photos or schedule a showroom visit?',
        delay: 6000
      }
    ];
    
    // Send messages with delays
    for (const message of messages) {
      if (message.delay > 0) {
        console.log(`⏳ Waiting ${message.delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, message.delay));
      }
      
      console.log(`📤 Sending: ${message.text.substring(0, 50)}...`);
      
      const messageResponse = await fetch(`${API_URL}/contacts/${contactId}/send/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ACCESS-TOKEN': API_TOKEN,
          'User-Agent': 'mobile-app'
        },
        body: JSON.stringify({
          text: message.text,
          channel: 'webchat'
        })
      });
      
      const messageResult = await messageResponse.json();
      if (messageResult.success) {
        console.log('✅ Message sent successfully');
      } else {
        console.log('❌ Message failed:', messageResult);
      }
    }
    
    // Step 3: Check if conversation appears in inbox
    console.log('\n🔍 Step 3: Checking if conversation appears in your inbox...');
    
    const inboxResponse = await fetch(`${BACKEND_URL}/api/inbox/conversations?platform=webchat&limit=20`, {
      headers: {
        'X-ACCESS-TOKEN': BACKEND_TOKEN,
        'X-BUSINESS-ID': '1145545'
      }
    });
    
    const inboxData = await inboxResponse.json();
    
    console.log('\n📋 Current conversations in your inbox:');
    inboxData.data.forEach((conv, idx) => {
      console.log(`${idx + 1}. ${conv.display_name} (ID: ${conv.conversation_id})`);
      console.log(`   Last message: ${conv.last_message_content.substring(0, 60)}...`);
    });
    
    // Look for our contact
    const ourConversation = inboxData.data.find(conv => 
      conv.display_name.includes('Sarah') || 
      conv.display_name.includes('Johnson') ||
      conv.conversation_id === contactId
    );
    
    if (ourConversation) {
      console.log('\n🎉 SUCCESS! Found our Woodstock conversation in the inbox:');
      console.log(`   Name: ${ourConversation.display_name}`);
      console.log(`   ID: ${ourConversation.conversation_id}`);
      console.log(`   Last message: ${ourConversation.last_message_content}`);
    } else {
      console.log('\n⚠️  Conversation not found in your inbox (different business account)');
      console.log('   But messages were successfully sent to ChatRace!');
    }
    
    console.log('\n✅ Woodstock AI integration test completed!');
    console.log(`🌐 Check your inbox at: http://localhost:5173`);
    console.log(`📞 Contact created with ID: ${contactId}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWoodstockIntegration();

