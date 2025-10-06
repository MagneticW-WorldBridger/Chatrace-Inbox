import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';

const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose'
].join(' ');

const GoogleOAuthButton = ({ businessId, onSuccess, onError, buttonText = 'Connect Gmail Account' }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleOAuth = async () => {
    setIsLoading(true);
    
    try {
      const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const REDIRECT_URI = `${window.location.origin}/oauth2callback`;
      
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', SCOPES);
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('state', JSON.stringify({ businessId }));
      
      // Open popup window
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        authUrl.toString(),
        'Google OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      // Listen for OAuth callback
      const handleMessage = async (event) => {
        if (event.origin !== window.location.origin) return;
        if (!event.data.type === 'oauth-callback') return;
        
        const { code, state } = event.data;
        
        try {
          // Exchange code for tokens via backend
          const response = await fetch('/api/auth/google-callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, businessId: state?.businessId || businessId })
          });
          
          const result = await response.json();
          
          if (result.status === 'success') {
            onSuccess?.(result);
          } else {
            onError?.(result.error || 'OAuth failed');
          }
        } catch (error) {
          onError?.(error.message);
        } finally {
          window.removeEventListener('message', handleMessage);
          setIsLoading(false);
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Close popup listener
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setIsLoading(false);
        }
      }, 1000);
      
    } catch (error) {
      onError?.(error.message);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleOAuth}
      disabled={isLoading}
      className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FcGoogle className="w-6 h-6" />
      <span>{isLoading ? 'Connecting...' : buttonText}</span>
    </button>
  );
};

export default GoogleOAuthButton;



