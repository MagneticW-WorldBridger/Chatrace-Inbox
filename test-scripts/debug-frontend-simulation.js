#!/usr/bin/env node

import fetch from 'node-fetch';
import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'http://localhost:3001';
const USER_TOKEN = process.env.USER_TOKEN;
const BUSINESS_ID = process.env.BUSINESS_ID;

console.log('🔥 CLOSED LOOP FRONTEND SIMULATION');
console.log('==================================');

class FrontendSimulator {
  constructor() {
    this.conversations = [];
    this.currentContact = null;
    this.messages = [];
    this.userToken = null;
    this.ws = null;
    this.wsConnected = false;
  }

  async authenticate() {
    console.log('\n1️⃣ Authenticating...');
    const response = await fetch(`${API_BASE_URL}/api/test-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    this.userToken = data.token;
    console.log('✅ Token obtained:', this.userToken?.substring(0, 20) + '...');
  }

  async loadConversations() {
    console.log('\n2️⃣ Loading conversations...');
    const response = await fetch(`${API_BASE_URL}/api/inbox/conversations`, {
      headers: {
        'X-ACCESS-TOKEN': this.userToken,
        'X-BUSINESS-ID': BUSINESS_ID
      }
    });
    const data = await response.json();
    
    if (data.status !== 'success') {
      throw new Error(`Conversations failed: ${JSON.stringify(data)}`);
    }
    
    this.conversations = data.data.map(conv => ({
      id: conv.conversation_id || conv.id,
      name: conv.display_name || conv.name || 'Unknown',
      avatar: conv.profile_pic || 'default.png',
      lastMessage: conv.last_message || 'No messages',
      timestamp: new Date(conv.updated_at || Date.now()),
      status: conv.status || 'offline',
      department: conv.department || 'Support'
    }));
    
    console.log(`✅ Loaded ${this.conversations.length} conversations`);
    this.currentContact = this.conversations[0];
    console.log(`📞 Selected contact: ${this.currentContact.name} (ID: ${this.currentContact.id})`);
  }

  async loadMessages() {
    console.log('\n3️⃣ Loading messages for current contact...');
    const response = await fetch(`${API_BASE_URL}/api/inbox/conversations/${this.currentContact.id}/messages?limit=10`, {
      headers: {
        'X-ACCESS-TOKEN': this.userToken,
        'X-BUSINESS-ID': BUSINESS_ID
      }
    });
    const data = await response.json();
    
    if (data.status !== 'success') {
      throw new Error(`Messages failed: ${JSON.stringify(data)}`);
    }
    
    this.messages = (data.data || []).map(msg => ({
      id: msg.id || msg.message_id || Date.now().toString(),
      content: msg.content || msg.message || 'N/A',
      timestamp: new Date(msg.timestamp || Date.now()),
      isOwn: msg.dir === 0,
      status: 'received'
    }));
    
    console.log(`✅ Loaded ${this.messages.length} existing messages`);
    if (this.messages.length > 0) {
      console.log('📝 Last message:', this.messages[this.messages.length - 1].content?.substring(0, 50) + '...');
    }
  }

  async connectWebSocket() {
    console.log('\n4️⃣ Getting WebSocket URL...');
    
    // Get whitelabel info (like frontend does)
    const whitelabelResponse = await fetch(`${API_BASE_URL}/api/whitelabel`, {
      headers: {
        'X-ACCESS-TOKEN': this.userToken,
        'Origin': 'http://localhost:5173'
      }
    });
    const whitelabelData = await whitelabelResponse.json();
    
    if (whitelabelData.status !== 'success' && whitelabelData.status !== 'OK') {
      throw new Error(`Whitelabel failed: ${JSON.stringify(whitelabelData)}`);
    }
    
    const wsUrl = whitelabelData.data.websocket_url || whitelabelData.data.websocket;
    console.log('✅ WebSocket URL:', wsUrl);
    
    console.log('\n5️⃣ Connecting to WebSocket...');
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.on('open', () => {
        console.log('✅ WebSocket connected');
        this.wsConnected = true;
        
        // Send authentication (like frontend does)
        const authMessage = {
          action: "authenticate",
          data: {
            token: this.userToken,
            business_id: BUSINESS_ID
          }
        };
        console.log('🔑 Sending authentication:', authMessage);
        this.ws.send(JSON.stringify(authMessage));
        
        // Subscribe to conversation (like frontend does)
        setTimeout(() => {
          const subscribeMessage = {
            action: -1,
            data: {
              conversation_id: this.currentContact.id,
              business_id: BUSINESS_ID
            }
          };
          console.log('📱 Subscribing to conversation:', subscribeMessage);
          this.ws.send(JSON.stringify(subscribeMessage));
          resolve();
        }, 1000);
      });
      
      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('📥 WebSocket message received:', message);
          
          // Handle new messages (like frontend does)
          if (message.action === 0 && message.data?.message) {
            console.log('🔥 WEBSOCKET CALLBACK - Processing new message...');
            const newMessage = {
              id: message.data.ms_id || Date.now().toString(),
              content: message.data.message[0]?.text || message.data.message,
              timestamp: new Date(message.data.timestamp || Date.now()),
              isOwn: message.data.dir === 0,
              status: 'received'
            };
            
            console.log('🔥 WEBSOCKET CALLBACK - ANTES de agregar - messages length:', this.messages.length);
            this.messages = [...this.messages, newMessage].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            console.log('🔥 WEBSOCKET CALLBACK - DESPUÉS de agregar - messages length:', this.messages.length);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      });
      
      this.ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        reject(error);
      });
      
      this.ws.on('close', () => {
        console.log('🔌 WebSocket disconnected');
        this.wsConnected = false;
      });
    });
  }

  async sendMessage(messageText) {
    console.log('\n6️⃣ SIMULATING SEND MESSAGE...');
    console.log('🔥 HANDLE SEND MESSAGE LLAMADO - message:', messageText, 'currentContact:', this.currentContact.name);
    
    if (!this.currentContact || !messageText.trim()) {
      console.log('❌ Cannot send - no contact or empty message');
      return;
    }
    
    // Add message immediately to UI (like frontend does)
    const newMessage = {
      id: Date.now().toString(),
      content: messageText,
      timestamp: new Date(),
      isOwn: true,
      status: 'sent'
    };
    
    console.log('🔥 HANDLE SEND - ANTES de agregar - messages length:', this.messages.length);
    console.log('🔥 HANDLE SEND - newMessage:', newMessage);
    
    this.messages = [...this.messages, newMessage].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    console.log('🔥 HANDLE SEND - DESPUÉS de agregar - messages length:', this.messages.length);
    
    // Try WebSocket first (like frontend does)
    if (this.wsConnected && this.ws) {
      console.log('📤 Sending via WebSocket...');
      const wsMessage = {
        action: 0,
        data: {
          conversation_id: this.currentContact.id,
          message: messageText,
          business_id: BUSINESS_ID
        }
      };
      
      console.log('📤 WebSocket message:', wsMessage);
      this.ws.send(JSON.stringify(wsMessage));
      console.log('✅ Message sent via WebSocket');
      return;
    }
    
    // HTTP fallback (like frontend does)
    console.log('📤 Fallback: Sending via HTTP...');
    const response = await fetch(`${API_BASE_URL}/api/inbox/conversations/${this.currentContact.id}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ACCESS-TOKEN': this.userToken
      },
      body: JSON.stringify({ message: messageText, channel: 9 })
    });
    const result = await response.text();
    console.log('📥 HTTP send result:', result);
    console.log('✅ Message sent via HTTP');
  }

  printCurrentState() {
    console.log('\n📊 CURRENT STATE:');
    console.log('=================');
    console.log(`🗣️  Current Contact: ${this.currentContact?.name}`);
    console.log(`💬 Messages Count: ${this.messages.length}`);
    console.log(`🔌 WebSocket Connected: ${this.wsConnected}`);
    
    if (this.messages.length > 0) {
      console.log('\n📝 Recent Messages:');
      this.messages.slice(-5).forEach((msg, idx) => {
        const prefix = msg.isOwn ? '[OUT]' : '[IN] ';
        console.log(`   ${idx + 1}. ${prefix} ${msg.content?.substring(0, 50) || 'N/A'}...`);
      });
    }
  }
}

// Run the simulation
async function runSimulation() {
  const frontend = new FrontendSimulator();
  
  try {
    await frontend.authenticate();
    await frontend.loadConversations();
    await frontend.loadMessages();
    await frontend.connectWebSocket();
    
    frontend.printCurrentState();
    
    console.log('\n🚀 SENDING TEST MESSAGE...');
    await frontend.sendMessage('TEST MESSAGE FROM SIMULATION - ' + new Date().toISOString());
    
    // Wait for WebSocket response
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    frontend.printCurrentState();
    
    console.log('\n✅ SIMULATION COMPLETED');
    
  } catch (error) {
    console.error('\n💥 SIMULATION FAILED:', error.message);
    process.exit(1);
  } finally {
    if (frontend.ws) {
      frontend.ws.close();
    }
  }
}

runSimulation();
