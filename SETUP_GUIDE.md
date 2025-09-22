# 🚀 Quick Setup Guide

## For New Developers

### 1. Clone the Repository
```bash
git clone https://github.com/MagneticW-WorldBridger/Chatrace-Inbox.git
cd Chatrace-Inbox
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend-app
npm install
```

### 4. Environment Setup
- Ask the project owner for the `.env` file with the required credentials
- Place it in the root directory of the project

### 5. Run the Application

#### Backend (Terminal 1)
```bash
cd backend
npm start
```
Server runs on: http://localhost:3000

#### Frontend (Terminal 2)
```bash
cd frontend-app
npm run dev
```
Frontend runs on: http://localhost:5173

## Common Issues

### Error: Cannot find package 'pg'
**Solution:** You forgot to run `npm install` in the backend directory
```bash
cd backend
npm install
```

### Error: Cannot find package 'react'
**Solution:** You forgot to run `npm install` in the frontend directory
```bash
cd frontend-app
npm install
```

### Missing .env file
**Solution:** Ask the project owner for the environment variables file

## Requirements
- Node.js v16 or higher
- npm or yarn
- Git

## Need Help?
Contact the project owner for:
- `.env` file with credentials
- Database access
- API keys
