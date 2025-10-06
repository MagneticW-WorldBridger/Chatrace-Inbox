# 🚨 WINDOWS DEPLOYMENT DEBUG GUIDE

## 🎯 **CRITICAL SETUP CHECKLIST FOR WINDOWS MACHINE**

### **📋 STEP 1: ENVIRONMENT VARIABLES**

**Create `.env` file in backend folder:**
```env
USER_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiMTAwMDAyNjc1NyIsImV4cGlyZSI6MTc4NjM3Mjc4OSwicHJvdmlkZXIiOiJnb29nbGUiLCJ3dCI6IjQyMCJ9.J8B9b_A2Fk8Em4F27cUBtVRZ9ZPHb5DO7uZtJ8C2Y6A
API_TOKEN=1281352.DJB0g6DT3PONyWkenC43WIS2aexzXwiaLWnuKiGEF2Rsky
API_URL=https://app.aiprlassist.com/php/user
BUSINESS_ID=1145545
DATABASE_URL=postgresql://neondb_owner:npg_Qy8rxk0itEhg@ep-ancient-scene-ad2nguei-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Create `.env` file in root folder (same content):**
```env
# Copy the same content as backend/.env
```

---

### **📋 STEP 2: DEPENDENCY INSTALLATION**

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend-app  
npm install
```

**Root:**
```bash
npm install
```

---

### **📋 STEP 3: DATABASE CONNECTIVITY TEST**

**Test database connection:**
```bash
cd backend
node -e "
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect().then(() => {
  console.log('✅ Database connected');
  client.end();
}).catch(err => {
  console.log('❌ Database error:', err.message);
});
"
```

---

### **📋 STEP 4: BACKEND STARTUP VERIFICATION**

**Start backend:**
```bash
cd backend
npm start
```

**Verify endpoints work:**
```bash
# Test 1: Health check
curl http://localhost:3001/healthz

# Test 2: Conversations endpoint  
curl "http://localhost:3001/api/inbox/conversations?platform=all&limit=5"

# Test 3: Rural King specific
curl "http://localhost:3001/api/inbox/conversations?platform=rural_king&limit=3"
```

---

### **📋 STEP 5: FRONTEND SETUP VERIFICATION**

**Start frontend:**
```bash
cd frontend-app
npm run dev
```

**Enable unified inbox in browser:**
```javascript
// Open browser console (F12) at http://localhost:5173
localStorage.setItem('UNIFIED_INBOX_BETA', 'true');
// Refresh page
```

---

## 🔍 **DEBUGGING COMMON WINDOWS ISSUES:**

### **❌ ISSUE 1: "Partial Information Showing"**
**CAUSE:** Unified inbox feature flag not enabled
**FIX:** 
```javascript
localStorage.setItem('UNIFIED_INBOX_BETA', 'true');
localStorage.setItem('DEBUG_MODE', 'true'); // Optional for debugging
```

### **❌ ISSUE 2: "Looks Hideous"**  
**CAUSE:** CSS not loading properly or build issues
**FIX:** 
```bash
cd frontend-app
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### **❌ ISSUE 3: "Database Connection Fails"**
**CAUSE:** Environment variables not loaded
**FIX:** Check `.env` files exist in both `/backend/` and root `/`

### **❌ ISSUE 4: "Rural King Data Not Loading"**
**CAUSE:** CORS or network issues
**FIX:** Check browser console for errors

---

## 🎯 **QUICK WINDOWS VERIFICATION COMMANDS:**

```bash
# 1. Check if environment is loaded
cd backend && node -p "process.env.DATABASE_URL ? '✅ DB_URL loaded' : '❌ DB_URL missing'"

# 2. Test Rural King API access
curl "https://rural-king-deploy.vercel.app/api/conversations?limit=1"

# 3. Test our backend health
curl http://localhost:3001/healthz

# 4. Test unified conversations
curl "http://localhost:3001/api/inbox/conversations?platform=all&limit=3"

# 5. Test Rural King integration
curl "http://localhost:3001/api/inbox/conversations/vapi_rural_+13323339453/messages?limit=3"
```

---

## 🚨 **EXPECTED RESULTS:**

### **✅ WORKING BACKEND SHOULD SHOW:**
```json
{
  "status": "success",
  "data": [
    {
      "display_name": "🏪 Jean Test",
      "_platform": "Rural King", 
      "source": "vapi_rural"
    }
  ],
  "sources": {
    "rural_king": 3,
    "woodstock": 134,
    "vapi": 2,
    "chatrace": 1
  }
}
```

### **✅ WORKING FRONTEND SHOULD SHOW:**
- **🏪 Rural King (3)** filter button
- **🏪 Jean Test** in conversation list with store icon
- **📞 Call recording messages** with glass-effect audio players
- **📋 Rich metadata** (order context, transcripts, summaries)

---

## 📞 **CAN YOU RUN THESE COMMANDS ON WINDOWS?**

**Send me the output of:**

1. **Backend health:**
```bash
curl http://localhost:3001/healthz
curl "http://localhost:3001/api/inbox/conversations?platform=rural_king&limit=1"
```

2. **Environment check:**
```bash
cd backend && node -p "process.env.DATABASE_URL ? 'DB Connected' : 'DB Missing'"
```

3. **Browser console errors** (F12 in browser at http://localhost:5173)

4. **Is unified inbox enabled?**
```javascript
// In browser console:
localStorage.getItem('UNIFIED_INBOX_BETA')
```

**This will tell me exactly what's broken on Windows!** 🔧
