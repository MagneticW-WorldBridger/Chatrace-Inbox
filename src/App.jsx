import { useRef, useEffect, useState } from 'react';
import MagicBento from './MagicBento';
import './App.css';

const App = () => {
  const [conversations, setConversations] = useState([]);
  const [currentContact, setCurrentContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginStep, setLoginStep] = useState('choose'); // 'choose', 'email', 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRid, setOtpRid] = useState('');
  const ws = useRef(null);

  // Configuration from environment variables
  const BUSINESS_ID = import.meta.env.VITE_BUSINESS_ID;
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

  // Debug: Log conversations state changes
  useEffect(() => {
    console.log('Conversations state updated:', conversations, 'Length:', conversations.length);
  }, [conversations]);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('userToken');
    const isDemoMode = localStorage.getItem('demoMode') === 'true';
    if (token) {
      setUserToken(token);
      setDemoMode(isDemoMode);
      setIsLoggedIn(true);
      // Don't call loadConversations here - it will be called in the next useEffect
    }
  }, []);

  // Load conversations when demoMode state is set
  useEffect(() => {
    if (isLoggedIn) {
      loadConversations();
    }
  }, [isLoggedIn, demoMode]);

  const handleGoogleLogin = () => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=openid%20email%20profile&` +
      `access_type=offline`;

    window.location.href = googleAuthUrl;
  };

  const handleDirectLogin = async () => {
    try {
      const response = await fetch('/api/test-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      console.log('Auth response:', data);
      
      if (data.status === 'OK') {
        setUserToken(data.token);
        setDemoMode(data.demoMode || false);
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('demoMode', (data.demoMode || false).toString());
        setIsLoggedIn(true);
        // loadConversations will be called by useEffect
      } else {
        alert(`Authentication failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Direct login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleGoogleCallback = async (code) => {
    try {
      const response = await fetch('/api/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      
      const data = await response.json();
      if (data.status === 'OK') {
        setUserToken(data.data.token);
        localStorage.setItem('userToken', data.data.token);
        setIsLoggedIn(true);
        loadConversations(data.data.token);
      } else {
        console.log('Google OAuth failed, trying direct login...');
        handleDirectLogin();
      }
    } catch (error) {
      console.error('Google login error:', error);
      handleDirectLogin();
    }
  };

  const loadConversations = async (token) => {
    console.log('Loading conversations, demoMode:', demoMode);
    setLoading(true);
    let result;
    
    try {
      if (demoMode) {
        console.log('Using demo data for conversations');
        result = await fetch('/api/demo-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'conversations' })
        });
      } else {
        console.log('Using real API for conversations');
        result = await fetch('/api/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            op: "conversation",
            op1: "get",
            op2: "list",
            account_id: BUSINESS_ID
          })
        });
      }
      
      const data = await result.json();
      console.log('Conversations data:', data);
      
      if (data.status === 'OK') {
        const mappedConversations = data.data.map(conv => ({
          color: "#060010",
          title: conv.name,
          description: conv.last_message || 'No messages',
          label: conv.time_ago || 'Never',
          // Keep id for internal use
          id: conv.id
        }));
        console.log('Mapped conversations:', mappedConversations);
        console.log('Setting conversations state...');
        setConversations(mappedConversations);
      } else {
        console.error('Failed to load conversations:', data);
        // Set empty array to clear any previous data
        setConversations([]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (contactId) => {
    let result;
    
    if (demoMode) {
      result = await fetch('/api/demo-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'messages' })
      });
    } else {
      result = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          op: "message",
          op1: "get",
          op2: "list",
          account_id: BUSINESS_ID,
          contact_id: contactId
        })
      });
    }
    
    const data = await result.json();
    if (data.status === 'OK') {
      setMessages(data.data);
    }
  };

  const loadProfile = async (contactId) => {
    let result;
    
    if (demoMode) {
      result = await fetch('/api/demo-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'profile' })
      });
    } else {
      result = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          op: "contact",
          op1: "get",
          op2: "info",
          account_id: BUSINESS_ID,
          contact_id: contactId
        })
      });
    }
    
    const data = await result.json();
    if (data.status === 'OK') {
      setProfile(data.data);
    }
  };

  const handleCardClick = async (card) => {
    setCurrentContact(card);
    await Promise.all([
      loadMessages(card.id),
      loadProfile(card.id)
    ]);
  };

  const handleSendMessage = (message) => {
    if (!currentContact || !message.trim()) return;

    ws.current?.send(JSON.stringify({
      action: 0,
      data: {
        platform: "web",
        dir: 0,
        account_id: BUSINESS_ID,
        contact_id: currentContact.id,
        message: [{
          type: "text",
          text: message,
          dir: 0
        }]
      }
    }));
  };

  const connectWebSocket = () => {
    ws.current = new WebSocket(`ws://${window.location.host}`);
    
    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({
        action: "authenticate",
        data: {
          platform: "web",
          account_id: BUSINESS_ID
        }
      }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message' && data.contact_id === currentContact?.id) {
        loadMessages(currentContact.id);
      }
    };
  };

  useEffect(() => {
    if (isLoggedIn) {
      connectWebSocket();
    }
  }, [isLoggedIn]);

  // Handle Google OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleGoogleCallback(code);
    }
  }, []);

  const handleEmailOtpRequest = async () => {
    if (!email.trim()) {
      alert('Por favor ingresa tu email');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      console.log('OTP Request response:', data);
      
      if (data.status === 'OK') {
        setOtpRid(data.rid);
        setLoginStep('otp');
        alert(`Código OTP enviado a ${email}`);
      } else {
        alert(`Error: ${data.message || 'No se pudo enviar el OTP'}`);
      }
    } catch (error) {
      console.error('OTP request error:', error);
      alert('Error enviando OTP. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpValidation = async () => {
    if (!otp.trim()) {
      alert('Por favor ingresa el código OTP');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/validate-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, rid: otpRid })
      });
      
      const data = await response.json();
      console.log('OTP Validation response:', data);
      
      if (data.status === 'OK') {
        setUserToken(data.data.token);
        localStorage.setItem('userToken', data.data.token);
        localStorage.setItem('demoMode', 'false');
        setDemoMode(false);
        setIsLoggedIn(true);
        alert('¡Login exitoso!');
      } else {
        alert(`Error: ${data.message || 'Código OTP inválido'}`);
      }
    } catch (error) {
      console.error('OTP validation error:', error);
      alert('Error validando OTP. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>ChatRace Inbox</h1>
          <p>Business ID: {BUSINESS_ID}</p>
          
          {loginStep === 'choose' && (
            <>
              <button onClick={handleGoogleLogin} className="google-login-btn">
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
                Login with Google
              </button>
              
              <button onClick={() => setLoginStep('email')} className="email-login-btn">
                📧 Login with Email/OTP
              </button>
              
              <button onClick={handleDirectLogin} className="direct-login-btn">
                🎭 Start Demo Mode
              </button>
              
              <p className="demo-note">
                Demo mode: datos de muestra | Email/OTP: datos reales de ChatRace
              </p>
            </>
          )}
          
          {loginStep === 'email' && (
            <>
              <h3>Ingresa tu Email</h3>
              <input
                type="email"
                placeholder="tu-email@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                disabled={loading}
              />
              <button 
                onClick={handleEmailOtpRequest} 
                className="otp-btn"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Código OTP'}
              </button>
              <button 
                onClick={() => setLoginStep('choose')} 
                className="back-btn"
              >
                ← Regresar
              </button>
            </>
          )}
          
          {loginStep === 'otp' && (
            <>
              <h3>Código OTP</h3>
              <p>Enviado a: {email}</p>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="login-input"
                maxLength="6"
                disabled={loading}
              />
              <button 
                onClick={handleOtpValidation} 
                className="validate-btn"
                disabled={loading}
              >
                {loading ? 'Validando...' : 'Verificar Código'}
              </button>
              <button 
                onClick={() => setLoginStep('email')} 
                className="back-btn"
              >
                ← Cambiar Email
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {demoMode && (
        <div className="demo-banner">
          <span>🎭 Demo Mode - Using sample data</span>
        </div>
      )}
      <div className="inbox">
        <div className="conversations">
          {loading ? (
            <div className="loading">Loading conversations...</div>
          ) : conversations.length > 0 ? (
            <MagicBento
              textAutoHide={true}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              spotlightRadius={300}
              particleCount={12}
              enableTilt={true}
              glowColor="255, 149, 29"
              clickEffect={true}
              enableMagnetism={true}
              cardData={conversations}
              onCardClick={handleCardClick}
            />
          ) : (
            <div className="no-conversations">
              <p>No conversations found</p>
              <p>Demo mode: {demoMode ? 'Yes' : 'No'}</p>
              <p>Conversations count: {conversations.length}</p>
              <button onClick={() => loadConversations()}>Retry</button>
            </div>
          )}
        </div>
        
        <div className="chat">
          {currentContact ? (
            <>
              <div className="chat-header">
                <h2>{currentContact.title}</h2>
              </div>
              <div className="messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`message ${msg.dir === 0 ? 'sent' : 'received'}`}>
                    {msg.text}
                  </div>
                ))}
              </div>
              <div className="message-input">
                <input
                  type="text"
                  placeholder="Type your message..."
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      handleSendMessage(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </>
          ) : (
            <div className="no-chat">Select a conversation</div>
          )}
        </div>

        <div className="profile">
          {profile && (
            <MagicBento
              textAutoHide={false}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              spotlightRadius={200}
              particleCount={8}
              enableTilt={true}
              glowColor="255, 149, 29"
              clickEffect={true}
              enableMagnetism={true}
              cardData={[{
                color: "#060010",
                title: profile.name,
                description: `${profile.email || 'No email'}\n${profile.phone || 'No phone'}\n${profile.location || 'No location'}`,
                label: profile.role || 'Customer'
              }]}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App; 