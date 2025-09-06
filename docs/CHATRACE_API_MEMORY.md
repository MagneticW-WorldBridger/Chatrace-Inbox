# ChatRace API Integration - Long Term Memory

## 🎯 **MASTER USER CONCEPT**
- **USER_ID**: `1000026757` (HARDCODED - This is the MASTER USER with access to ALL ChatRace subaccounts)
- **BUSINESS_ID**: `1145545` (VARIABLE - Changes to switch between different ChatRace subaccounts)
- **Purpose**: Master user can access any ChatRace subaccount by changing BUSINESS_ID

## 🔑 **CRITICAL API PATTERNS (From ChatRace Documentation)**

### **1. Whitelabel Information API**
```javascript
// Request
POST {{api_url}}
Headers: {
  "Content-Type": "application/json",
  "X-ACCESS-TOKEN": "{{token}}",
  "User-Agent": "mobile-app"
}
Body: {
  "op": "wt",
  "op1": "get"
}

// Response contains: wsurl, business info, etc.
```

### **2. WebSocket Authentication**
```javascript
{
  "action": "authenticate",
  "data": {
    "platform": "web|ios|android",
    "account_id": "{{account_id}}", // BUSINESS_ID
    "user_id": "{{logged_user_id}}", // MASTER USER_ID
    "token": "{{logged_user_token}}"
  }
}
```

### **3. WebSocket Message Sending**
```javascript
{
  "action": 0,
  "data": {
    "platform": "web|ios|android",
    "dir": 0,
    "account_id": "{{account_id}}", // BUSINESS_ID
    "contact_id": "{{contact_id}}", // ms_id from conversations
    "user_id": "{{logged_user_id}}", // MASTER USER_ID
    "token": "{{logged_user_token}}",
    "fromInbox": true,
    "channel": "{{channel_ID}}",
    "from": "{{logged_user_id}}", // MASTER USER_ID
    "hash": "{{contact_hash}}", // CRITICAL: Must get from conversations API
    "timestamp": "{{unix_timestamp_milliseconds}}",
    "message": [{
      "type": "text",
      "text": "Your Message",
      "dir": 0,
      "channel": "{{channel_ID}}",
      "from": "{{logged_user_id}}", // MASTER USER_ID
      "replyingTo": null
    }]
  }
}
```

### **4. Key Mappings (From Documentation)**
- `page_id` = `account_id` (Business account ID) = **BUSINESS_ID**
- `ms_id` = `contact_id` (User that sends message to bot) = **CONTACT_ID**
- `fb_id` = `admin_id` (Team member/admin) = **MASTER USER_ID**

## 🚨 **CRITICAL ISSUES IDENTIFIED**

### **1. Missing Contact Hash**
- **Problem**: WebSocket messages use `hash: ''` instead of proper contact hash
- **Solution**: Get hash from conversations API response
- **Impact**: Messages may not be properly associated with contacts

### **2. Channel Inconsistency**
- **Problem**: Different channel values used in different parts
- **Solution**: Standardize channel values across WebSocket and HTTP
- **Impact**: Messages may be sent to wrong channels

### **3. WebSocket Subscription Timing**
- **Problem**: Conversation subscription happens before authentication completes
- **Solution**: Wait for authentication success before subscribing
- **Impact**: May miss messages during connection setup

### **4. Message Deduplication**
- **Problem**: Only checks by ID, but ChatRace may send different IDs for same message
- **Solution**: Check by content + timestamp + contact_id combination
- **Impact**: Duplicate messages in chat

## 🔧 **IMPLEMENTATION REQUIREMENTS**

### **Frontend Changes Needed:**
1. **useWebSocket.js**: Fix hash retrieval, improve subscription timing
2. **App.jsx**: Better message deduplication, consistent channel handling
3. **ChatContext.jsx**: Ensure proper state management

### **Backend Changes Needed:**
1. **server.js**: Ensure proper ChatRace API forwarding
2. **Conversations API**: Return contact hash information
3. **Error Handling**: Better error recovery for API failures

## 🎯 **TESTING STRATEGY**
1. **Test BUSINESS_ID switching**: Verify conversations load for different subaccounts
2. **Test message sending**: Verify messages appear in correct conversations
3. **Test real-time updates**: Verify WebSocket messages appear immediately
4. **Test error recovery**: Verify system recovers from connection failures

## 📚 **REFERENCE DOCUMENTS**
- **Postman Collection**: `/Chatrace.postman_collection.json`
- **Mobile Documentation**: `/chatracemobile.md`
- **API Documentation**: https://documenter.getpostman.com/view/27874332/2s93zCZg9Q
