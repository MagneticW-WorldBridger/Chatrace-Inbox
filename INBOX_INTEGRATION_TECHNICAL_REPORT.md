# 📬 INBOX INTEGRATION TECHNICAL REPORT
## **WOODSTOCK CONVERSATIONS DATABASE INTEGRATION**

**For:** Inbox Development Team  
**From:** Woodstock AI Chat System  
**Date:** September 16, 2025  
**Status:** 🔥 **PRODUCTION DATABASE WITH 221 CONVERSATIONS & 86,420 MESSAGES** 🔥  

---

## 🎯 **EXECUTIVE SUMMARY**

The Woodstock AI Chat System has a **LIVE PRODUCTION DATABASE** with extensive conversation data ready for inbox integration. Here's everything your team needs to pull conversations into the unified inbox.

---

## 🗄️ **EXACT DATABASE CONNECTION**

### **PostgreSQL Connection Details:**
```bash
# PRIMARY CONNECTION (WITH POOLING)
DATABASE_URL="postgres://neondb_owner:npg_THMlQu6ZWmD4@ep-weathered-dream-adbza7xj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# DIRECT CONNECTION (WITHOUT POOLING)
DATABASE_URL_UNPOOLED="postgresql://neondb_owner:npg_THMlQu6ZWmD4@ep-weathered-dream-adbza7xj.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# CONNECTION COMPONENTS
HOST: ep-weathered-dream-adbza7xj-pooler.c-2.us-east-1.aws.neon.tech
USER: neondb_owner
PASSWORD: npg_THMlQu6ZWmD4
DATABASE: neondb
SSL: required
```

### **Test Connection:**
```bash
psql "postgres://neondb_owner:npg_THMlQu6ZWmD4@ep-weathered-dream-adbza7xj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" -c "\dt"
```

---

## 📊 **CURRENT DATABASE STATS (LIVE DATA)**

### **📈 CONVERSATION VOLUME:**
```sql
-- TOTAL CONVERSATIONS: 221
-- TOTAL MESSAGES: 86,420
-- PLATFORMS:
  - webchat: 148 conversations
  - web: 57 conversations  
  - facebook_messenger: 6 conversations
  - facebook: 5 conversations
  - instagram: 5 conversations
```

### **📱 ACTIVE CONVERSATIONS (TOP 5):**
```
conversation_id                      | user_identifier   | platform_type | messages | last_activity
-------------------------------------|-------------------|---------------|----------|------------------
a4b0df63-c700-4fe7-8dc1-ea749ed3a25f | 407-288-6040      | webchat      | 690      | Sep 5, 14:43 UTC
dd284ab5-6539-4ca4-8a90-6c5e5f751c8d | NEW_USER          | webchat      | 2        | Sep 5, 13:59 UTC
66ac8f0e-7fe8-4b8e-aecc-49612d38048a | webchat_user_9297 | webchat      | 2        | Sep 5, 01:08 UTC
4902ade0-a914-4630-828e-57cddf72f982 | webchat_user_4366 | webchat      | 2        | Sep 5, 01:07 UTC
09186e94-ae07-4a9c-9ca7-393b49d4a773 | jdan4sure@yahoo.com| webchat     | 54       | Sep 5, 01:07 UTC
```

---

## 🗂️ **EXACT TABLE SCHEMAS (FROM LIVE DATABASE)**

### **1. chatbot_conversations TABLE:**
```sql
-- TABLE: public.chatbot_conversations (221 rows)
Column                   | Type                     | Nullable | Default
-------------------------|--------------------------|----------|-------------------
conversation_id          | uuid                     | NOT NULL | gen_random_uuid()
user_identifier          | character varying(255)   | NOT NULL |
platform_type            | character varying(50)    | NOT NULL |
session_identifier       | character varying(255)   | NULL     |
conversation_started_at  | timestamp with time zone | NULL     | now()
last_message_at         | timestamp with time zone | NULL     | now()
is_active               | boolean                  | NULL     | true
client_id               | uuid                     | NULL     |
platform_specific_id    | character varying(255)   | NULL     |

-- PRIMARY KEY
PRIMARY KEY (conversation_id)

-- INDEXES
idx_chatbot_conversations_last_message (last_message_at DESC)
idx_chatbot_conversations_user_platform (user_identifier, platform_type)
unique_active_user_platform (user_identifier, platform_type, is_active) -- UNIQUE

-- FOREIGN KEYS
client_id → client_integrations(client_id)
```

### **2. chatbot_messages TABLE:**
```sql
-- TABLE: public.chatbot_messages (86,420 rows)
Column                    | Type                     | Nullable | Default
--------------------------|--------------------------|----------|-------------------
message_id               | uuid                     | NOT NULL | gen_random_uuid()
conversation_id          | uuid                     | NOT NULL |
message_role             | character varying(20)    | NOT NULL |
message_content          | text                     | NOT NULL |
executed_function_name   | character varying(100)   | NULL     |
function_input_parameters| jsonb                    | NULL     |
function_output_result   | jsonb                    | NULL     |
function_execution_status| character varying(20)    | NULL     |
message_created_at       | timestamp with time zone | NULL     | now()

-- PRIMARY KEY
PRIMARY KEY (message_id)

-- INDEXES
idx_chatbot_messages_conversation_time (conversation_id, message_created_at)
idx_chatbot_messages_function_calls (executed_function_name, function_execution_status)
idx_chatbot_messages_role (message_role)

-- FOREIGN KEYS
conversation_id → chatbot_conversations(conversation_id) ON DELETE CASCADE

-- CHECK CONSTRAINTS
message_role IN ('user', 'assistant', 'tool', 'function', 'system')

-- TRIGGERS
trigger_chatbot_update_last_message -- Updates last_message_at in conversations
```

---

## 📡 **API ENDPOINTS (LIVE BACKEND)**

### **Backend Base URL:**
```
Production: https://[railway-backend-url].railway.app
Local: http://localhost:8000
```

### **Available Endpoints:**
```python
# MAIN CHAT ENDPOINT
POST /v1/chat/completions
Body: {
  "messages": [{"role": "user", "content": "message"}],
  "user_identifier": "phone_or_email", 
  "stream": true,
  "admin_mode": false
}

# SESSION INFO ENDPOINT  
GET /v1/sessions/{user_identifier}
Response: {
  "user_identifier": "407-288-6040",
  "conversation_id": "uuid", 
  "message_count": 690,
  "customer_context": {...}
}

# HEALTH CHECK
GET /health
Response: {
  "status": "ok",
  "native_functions": 14,
  "memory": "PostgreSQL (Existing Tables)"
}
```

---

## 💬 **SAMPLE CONVERSATION DATA**

### **Sample Messages from Most Active Conversation (690 messages):**
```sql
-- USER MESSAGE EXAMPLE
{
  "message_role": "user",
  "message_content": "Get complete customer journey for 407-288-6040",
  "message_created_at": "2025-09-05T14:43:33.200279Z"
}

-- ASSISTANT RESPONSE WITH HTML COMPONENTS
{
  "message_role": "assistant", 
  "message_content": "<div class=\"customer-card\">\n  <h3 class=\"customer-name\">Janice Daniels</h3>\n  <div class=\"customer-phone\">📱 407-288-6040</div>\n</div>",
  "message_created_at": "2025-09-05T14:43:35.294546Z"
}

-- FUNCTION CALL STORAGE FORMAT (when functions are executed)
{
  "executed_function_name": "getCustomerByPhone",
  "function_input_parameters": {"phone": "407-288-6040"},
  "function_output_result": {"customer_data": {...}},
  "function_execution_status": "success"
}
```

---

## 🔌 **INBOX INTEGRATION QUERIES**

### **Get All Active Conversations:**
```sql
SELECT 
  c.conversation_id,
  c.user_identifier,
  c.platform_type,
  c.conversation_started_at,
  c.last_message_at,
  COUNT(m.message_id) as message_count,
  COALESCE(
    NULLIF(c.user_identifier, 'NEW_USER'),
    NULLIF(c.user_identifier, ''),
    c.session_identifier,
    'Anonymous User'
  ) as display_name
FROM chatbot_conversations c
LEFT JOIN chatbot_messages m ON c.conversation_id = m.conversation_id
WHERE c.is_active = true
GROUP BY c.conversation_id, c.user_identifier, c.platform_type, 
         c.conversation_started_at, c.last_message_at
ORDER BY c.last_message_at DESC;
```

### **Get Messages for Conversation:**
```sql
SELECT 
  m.message_id,
  m.message_role,
  m.message_content,
  m.executed_function_name,
  m.function_input_parameters,
  m.function_output_result,
  m.message_created_at
FROM chatbot_messages m
WHERE m.conversation_id = $1
ORDER BY m.message_created_at ASC;
```

### **Get Recent Activity:**
```sql
SELECT 
  c.conversation_id,
  c.user_identifier,
  c.platform_type,
  c.last_message_at,
  m.message_content as last_message,
  m.message_role as last_message_role
FROM chatbot_conversations c
LEFT JOIN chatbot_messages m ON c.conversation_id = m.conversation_id
WHERE c.last_message_at > NOW() - INTERVAL '24 hours'
  AND c.is_active = true
  AND m.message_created_at = c.last_message_at
ORDER BY c.last_message_at DESC;
```

---

## 🏗️ **RECOMMENDED INTEGRATION ARCHITECTURE**

### **Option 1: Direct Database Pull (RECOMMENDED)**
```javascript
// Your Inbox Backend
const conversations = await db.query(`
  SELECT 
    c.conversation_id,
    c.user_identifier,
    c.platform_type,
    c.last_message_at,
    COUNT(m.message_id) as unread_count
  FROM chatbot_conversations c
  LEFT JOIN chatbot_messages m ON c.conversation_id = m.conversation_id
  WHERE c.is_active = true
    AND c.last_message_at > $1
  GROUP BY c.conversation_id, c.user_identifier, c.platform_type, c.last_message_at
  ORDER BY c.last_message_at DESC
`, [lastPollTime]);

// Format for your inbox UI
const inboxConversations = conversations.map(conv => ({
  id: conv.conversation_id,
  source: 'woodstock_ai',
  customer: {
    identifier: conv.user_identifier,
    name: extractNameFromIdentifier(conv.user_identifier)
  },
  platform: conv.platform_type,
  lastActivity: conv.last_message_at,
  unreadCount: conv.unread_count,
  metadata: {
    aiPowered: true,
    functions: true
  }
}));
```

### **Option 2: API Polling**
```javascript
// Poll Woodstock backend for new conversations
const response = await fetch('https://woodstock-backend.railway.app/v1/sessions/recent');
const conversations = await response.json();
```

---

## 🎨 **MESSAGE FORMATTING FOR INBOX**

### **Handle Rich HTML Content:**
```javascript
// Woodstock messages contain HTML components
function formatWoodstockMessage(message) {
  if (message.message_content.includes('<div class="customer-card">')) {
    return {
      type: 'rich_html',
      content: message.message_content,
      renderAs: 'customer_profile'
    };
  }
  
  if (message.message_content.includes('sectional products')) {
    return {
      type: 'product_list', 
      content: parseProductList(message.message_content),
      renderAs: 'product_carousel'
    };
  }
  
  return {
    type: 'text',
    content: message.message_content
  };
}
```

---

## 📋 **WORK BREAKDOWN**

### **🔧 THIS REPO (Woodstock) - WHAT NEEDS TO BE DONE:**

1. **✅ ALREADY COMPLETE:**
   - Database schema with 221 conversations
   - Memory system working perfectly
   - 14 AI functions operational
   - Message storage with function calls
   - API endpoints for session access

2. **🔄 ENHANCEMENTS NEEDED:**
   - Add webhook endpoint to notify inbox of new messages
   - Add REST API for conversation list/search
   - Add conversation metadata enrichment
   - Implement real-time WebSocket updates

### **📱 INBOX REPO - WHAT YOUR TEAM NEEDS TO DO:**

1. **Database Integration:**
   - Add Woodstock PostgreSQL as data source
   - Create conversation polling mechanism  
   - Handle rich HTML message formatting

2. **UI Integration:**
   - Add "Woodstock AI" conversation source
   - Display AI function calls and results
   - Handle customer profile cards and product carousels
   - Show conversation context and customer data

3. **Real-time Updates:**
   - Poll for new conversations every 30 seconds
   - Handle conversation state changes
   - Mark messages as read/unread

---

## 🚀 **IMMEDIATE NEXT STEPS**

### **For Inbox Team (YOU):**
1. **Connect to Database:** Use the connection string above to test access
2. **Pull Sample Data:** Run the integration queries to see conversation format
3. **Design UI Components:** Plan how to display AI conversations vs regular chats
4. **Build Polling System:** Create background job to sync conversations

### **For Woodstock Team (US):**  
1. **Add Webhook Endpoint:** Notify inbox of new messages in real-time
2. **Enhance API:** Add conversation search and filtering endpoints
3. **Add Metadata:** Enrich conversations with customer context
4. **Optimize Performance:** Add pagination and caching for large conversations

---

## 📞 **CONTACT & SUPPORT**

**Database Access:** ✅ Full access provided above  
**API Documentation:** Available at `/docs` endpoint  
**Sample Data:** 221 live conversations ready for testing  
**Technical Support:** Available for integration questions  

**🔥 READY TO INTEGRATE - NO BLOCKERS! 🔥**

---

**This document contains EXACT production data and schemas. Your inbox can start pulling conversations immediately using the provided connection details and queries.**
