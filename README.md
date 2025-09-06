# Chatrace-Inbox

A real-time chat inbox system with React frontend and Express.js backend, supporting multiple platforms (webchat, Instagram, Facebook) with WebSocket integration for live messaging.

## 🏗️ Architecture

### Backend Components
- **`backend/server.js`** - Main Express.js server (1,681 lines)
  - Handles all API endpoints
  - Authentication and authorization
  - WebSocket connections
  - Database operations
  - File uploads
  - CORS configuration

- **`backend/auth.js`** - Authentication module
  - Google OAuth integration
  - User management
  - Password handling
  - Business/account management

### Frontend Components
- **`frontend-app/`** - React application directory
  - **`src/main.jsx`** - React app entry point
  - **`src/App.jsx`** - Main application component (690 lines)
  - **`src/components/layout/`** - Main UI layout components
  - **`src/components/chat/`** - Chat-specific components
  - **`src/components/auth/`** - Authentication components
  - **`src/components/admin/`** - Admin panel components
  - **`src/context/ChatContext.jsx`** - React context for state management
  - **`src/hooks/`** - Custom React hooks (WebSocket, auto-scroll, etc.)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database (for production)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Chatrace-Inbox
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend-app
   npm install
   ```

4. **Environment Setup**
   - Copy `.env.example` to `.env` in the root directory
   - Configure your environment variables (database, API keys, etc.)

### Running the Application

#### Development Mode

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   The backend will run on `http://localhost:3000`

2. **Start the frontend development server**
   ```bash
   cd frontend-app
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

#### Production Mode

1. **Build the frontend**
   ```bash
   cd frontend-app
   npm run build
   ```

2. **Start the backend (serves both API and frontend)**
   ```bash
   cd backend
   npm start
   ```

## 📁 Project Structure

```
Chatrace-Inbox/
├── backend/                    # Backend Express.js server
│   ├── server.js              # Main server file (1,681 lines)
│   ├── auth.js                # Authentication module
│   ├── package.json           # Backend dependencies
│   └── node_modules/          # Backend dependencies
├── frontend-app/              # React frontend application
│   ├── src/
│   │   ├── main.jsx           # React entry point
│   │   ├── App.jsx            # Main app component (690 lines)
│   │   ├── components/        # React components
│   │   │   ├── layout/        # Layout components
│   │   │   ├── chat/          # Chat components
│   │   │   ├── auth/          # Auth components
│   │   │   └── admin/         # Admin components
│   │   ├── context/           # React context
│   │   ├── hooks/             # Custom hooks
│   │   └── utils/             # Utility functions
│   ├── package.json           # Frontend dependencies
│   └── node_modules/          # Frontend dependencies
├── docs/                      # 📚 Important Documentation
│   ├── Chatrace.postman_collection.json  # 🔥 API documentation
│   ├── chatracemobile.md      # 🔥 Mobile app & WebSocket docs
│   ├── CHATRACE_API_MEMORY.md # API memory and notes
│   ├── FRONTEND_DEV_GUIDE.md  # Frontend development guide
│   └── *.md                   # Other documentation files
├── test-scripts/              # 🧪 Test and debug scripts
│   ├── test-*.js              # Test files
│   ├── debug-*.js             # Debug scripts
│   └── test_*.py              # Python test scripts
├── data-samples/              # 📊 Sample data files
│   ├── *.csv                  # CSV data samples
│   ├── *.sql                  # SQL scripts
│   └── *.json                 # JSON data samples
├── archive/                   # 📦 Archived files
│   ├── *.py                   # Python scripts
│   ├── *.html                 # HTML files
│   └── *.json                 # JSON configuration files
├── tests/                     # 🧪 Jest test files
├── src_DEPRECATED/            # 🗑️ Deprecated source code
├── Dockerfile                 # Backend containerization
├── Dockerfile.frontend        # Frontend containerization
├── .env                       # Environment variables
└── README.md                  # This file
```

## 🔧 Key Features

- **Real-time messaging** via WebSocket connections
- **Multi-platform support** (webchat, Instagram, Facebook)
- **Authentication** with Google OAuth and email/password
- **Admin panel** for user management
- **Responsive design** with modern UI components
- **File uploads** and media sharing
- **Conversation management** (archive, assign, notes)
- **AI suggestions** for responses

## 📚 Important Documentation

### API Documentation
- **`docs/Chatrace.postman_collection.json`** - Complete API documentation with Postman collection
- **`docs/chatracemobile.md`** - Mobile app development guide and WebSocket protocols

### Key API Endpoints
- `POST /api/test-auth` - Authentication
- `GET /api/inbox/conversations` - Get conversations
- `POST /api/inbox/conversations/:id/send` - Send messages
- `GET /api/inbox/stream` - Server-sent events for real-time updates

### WebSocket Integration
The app uses WebSocket for real-time messaging. See `docs/chatracemobile.md` for detailed WebSocket protocol documentation.

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend-app
npm test
```

## 🐳 Docker Deployment

### Backend
```bash
docker build -f Dockerfile -t chatrace-backend .
docker run -p 3000:3000 chatrace-backend
```

### Frontend
```bash
docker build -f Dockerfile.frontend -t chatrace-frontend .
docker run -p 8080:8080 chatrace-frontend
```

## 🔑 Environment Variables

Create a `.env` file in the root directory with:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/chatrace

# Authentication
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret

# API Keys
VAPI_API_KEY=your_vapi_api_key

# Server
PORT=3000
NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the API documentation in `docs/Chatrace.postman_collection.json`
- Review the mobile development guide in `docs/chatracemobile.md`
- Check the test files for usage examples

## 🔄 Recent Updates

- WebSocket integration for real-time messaging
- Multi-platform support (webchat, Instagram, Facebook)
- Enhanced authentication system
- Improved UI/UX with modern components
- Admin panel for user management
