import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './components/auth/auth-global.css';
import AuthProvider from './components/auth/AuthProvider';
import AuthenticatedApp from './components/auth/AuthenticatedApp';

// Get business ID from environment variable
const businessId = import.meta.env.VITE_BUSINESS_ID || '1145545'; // Default to Woodstock for testing

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider businessId={businessId}>
      <AuthenticatedApp />
    </AuthProvider>
  </React.StrictMode>
); 