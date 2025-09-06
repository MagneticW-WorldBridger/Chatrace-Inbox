# 🎨 Frontend Developer Style Guide - ChatRace Inbox

## 🚨 **IMPORTANT - WHAT YOU CAN/CANNOT TOUCH**

### ✅ **ALLOWED TO MODIFY:**
- **Styles & Colors** (CSS/Tailwind classes)
- **Visual Effects** (Glass/Liquid Glass effects, animations)
- **Layout & UI components** (visual appearance only)
- **Typography & spacing**

### ❌ **NEVER TOUCH:**
- **Backend logic** (`server.js`, API endpoints)
- **Authentication** (`.env` file, tokens, business logic)
- **Database connections** (all data fetching logic)
- **Core functionality** (message handling, conversation logic)

---

## 🚀 **Quick Setup (3 steps only!)**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Start Backend** (Terminal 1)
```bash
npm start
```
*Backend runs on `http://localhost:3001`*

### **3. Start Frontend** (Terminal 2) 
```bash
npm run dev
```
*Frontend runs on `http://localhost:5173`*

**That's it! No other setup needed.**

---

## 📁 **Style Files You'll Work With**

### **Main Style Files (Priority Order):**

#### 1. **`index.html`** (Lines 11-25) - **80% of colors**
```css
:root {
  --bg-primary: #ffffff;      /* Main background */
  --bg-secondary: #f8f9fa;    /* Sidebar panels */ 
  --bg-tertiary: #e9ecef;     /* Secondary elements */
  --text-primary: #000000;    /* Main text color */
  --text-secondary: #6c757d;  /* Secondary text */
  --glass-bg: rgba(248, 249, 250, 0.8);    /* Glass effects */
  --glass-border: rgba(222, 226, 230, 0.5); /* Glass borders */
}
```

#### 2. **`src/App.jsx`** - **15% of styles**
- Search for `className=` to find Tailwind classes
- Main areas: backgrounds, gradients, specific components

#### 3. **`src/App.css`** - **5% of additional styles**
- Custom CSS rules and overrides

---

## 🔍 **Finding & Changing Colors**

### **Color System:**
- **CSS Variables** (in `index.html`) control 80% of the app
- **Tailwind Classes** (in `App.jsx`) control specific elements
- **Custom CSS** (in `App.css`) for special effects

### **Common Tailwind Classes You'll See:**
```jsx
// Backgrounds
className="bg-gradient-to-br from-gray-50 to-white"
className="bg-white/90 backdrop-blur-sm"

// Text colors  
className="text-gray-900"
className="text-gray-500"

// Glass effects
className="glass" // Uses CSS variables from index.html
```

---


## 💻 **Development Workflow**

### **Live Reload:**
- **Frontend changes**: Auto-reload (Vite HMR)
- **Style changes**: Instant preview
- **Hard refresh**: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (PC)

### **Useful Commands:**
```bash
npm run dev     # Start frontend dev server
npm start       # Start backend server  
npm run build   # Build for production (when ready)
```

---

## 🎯 **Current App Structure**

```
Inbox/
├── index.html          ← Main CSS variables (your primary target)
├── src/
│   ├── App.jsx         ← React component with Tailwind classes
│   ├── App.css         ← Custom CSS styles
│   └── main.jsx        ← App entry point (don't touch)
├── server.js           ← Backend (don't touch)
├── .env               ← Environment variables (don't touch)
└── package.json       ← Dependencies (don't touch)
```

---

## 🚨 **Red Flags - Don't Touch These:**

- Any file ending in `.js` except style-related changes in `App.jsx`
- `.env` file
- `server.js` 
- `package.json` dependencies
- Any API endpoints or data fetching logic
- Authentication or business logic

---

**Happy styling! 🎨**
