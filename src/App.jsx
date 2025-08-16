import { useRef, useEffect, useState } from 'react';
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
  const [platform, setPlatform] = useState('webchat'); // 'webchat' | 'instagram' | 'facebook'
  const [counts, setCounts] = useState({ all: 0, webchat: 0, instagram: 0, facebook: 0 });
  const [composer, setComposer] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all'); // all | unread | priority
  const [atBottom, setAtBottom] = useState(true);
  const [charCount, setCharCount] = useState(0);
  const ws = useRef(null);
  const autoAuthTried = useRef(false);
  const messagesRef = useRef(null);
  const [booting, setBooting] = useState(true);

  // Configuration from environment variables
  const BUSINESS_ID = import.meta.env.VITE_BUSINESS_ID;
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

  // Debug: Log conversations state changes
  useEffect(() => {
    console.log('Conversations state updated:', conversations, 'Length:', conversations.length);
  }, [conversations]);

  useEffect(() => {
    // Mirror admin HTML behavior: capture ?account_id=... into cookie for server resolution
    try {
      const params = new URLSearchParams(window.location.search);
      const aid = params.get('account_id');
      if (aid) {
        document.cookie = `account_id=${encodeURIComponent(aid)}; path=/; max-age=31536000`;
      }
    } catch {}
    
    // Check if user is already logged in
    const token = localStorage.getItem('userToken');
    const isDemoMode = localStorage.getItem('demoMode') === 'true';
    if (token) {
      setUserToken(token);
      setDemoMode(isDemoMode);
      setIsLoggedIn(true);
      // Don't call loadConversations here - it will be called in the next useEffect
      setBooting(false);
    }
  }, []);

  // Auto-login: if no token in storage, request server test-auth once and proceed
  useEffect(() => {
    if (isLoggedIn) return;
    if (autoAuthTried.current) return;
    autoAuthTried.current = true;
    (async () => {
      try {
        const r = await fetch('/api/test-auth', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        const j = await r.json();
        if (j && j.status === 'OK' && j.token) {
          setUserToken(j.token);
          setDemoMode(j.demoMode || false);
          localStorage.setItem('userToken', j.token);
          localStorage.setItem('demoMode', (j.demoMode || false).toString());
          setIsLoggedIn(true);
        }
      } catch {}
      setBooting(false);
    })();
  }, [isLoggedIn]);

  // Load conversations when session state or platform changes
  useEffect(() => {
    if (isLoggedIn) {
      loadConversations(undefined, platform);
    }
  }, [isLoggedIn, demoMode, platform]);

  // Periodic counts refresh and SSE heartbeat hook
  useEffect(() => {
    if (!isLoggedIn) return;
    let intervalId = null;
    try {
      const es = new EventSource('/api/inbox/stream');
      es.onmessage = () => {
        // Heartbeat only (server returns heartbeat). We perform lightweight counts refresh occasionally.
      };
      es.onerror = () => {};
    } catch {}
    const refreshCounts = async () => {
      try {
        if (!demoMode) {
          const [rWeb, rIg, rFb] = await Promise.all([
            fetch('/api/inbox/conversations?platform=webchat&limit=50'),
            fetch('/api/inbox/conversations?platform=instagram&limit=50'),
            fetch('/api/inbox/conversations?platform=facebook&limit=50')
          ]);
          const [jWeb, jIg, jFb] = await Promise.all([rWeb.json(), rIg.json(), rFb.json()]);
          const cWeb = Array.isArray(jWeb?.data) ? jWeb.data.length : 0;
          const cIg = Array.isArray(jIg?.data) ? jIg.data.length : 0;
          const cFb = Array.isArray(jFb?.data) ? jFb.data.length : 0;
          setCounts({ all: cWeb + cIg + cFb, webchat: cWeb, instagram: cIg, facebook: cFb });
        }
      } catch {}
    };
    intervalId = setInterval(refreshCounts, 30000);
    return () => { if (intervalId) clearInterval(intervalId); };
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

  const loadConversations = async (token, selectedPlatform) => {
    const p = selectedPlatform || platform || 'webchat';
    console.log('Loading conversations, demoMode:', demoMode, 'platform:', p);
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
        result = await fetch(`/api/inbox/conversations?platform=${encodeURIComponent(p)}&limit=50`, {
          method: 'GET'
        });
      }
      
      const data = await result.json();
      console.log('Conversations data:', data);
      
      if ((data.status === 'OK' || data.status === 'success') && Array.isArray(data.data)) {
        const base = data.data;
        const mappedConversations = base.map(item => ({
          color: "#060010",
          title: item.display_name || item.full_name || item.name || 'Unknown',
          description: item.last_message_content || item.last_msg || 'No messages',
          label: '',
          id: item.conversation_id || item.ms_id || item.id
        }));
        console.log('Mapped conversations:', mappedConversations);
        console.log('Setting conversations state...');
        setConversations(mappedConversations);
        // Update counts with this platform size
        try {
          if (!demoMode) {
            const [rWeb, rIg, rFb] = await Promise.all([
              fetch('/api/inbox/conversations?platform=webchat&limit=50'),
              fetch('/api/inbox/conversations?platform=instagram&limit=50'),
              fetch('/api/inbox/conversations?platform=facebook&limit=50')
            ]);
            const [jWeb, jIg, jFb] = await Promise.all([rWeb.json(), rIg.json(), rFb.json()]);
            const cWeb = Array.isArray(jWeb?.data) ? jWeb.data.length : 0;
            const cIg = Array.isArray(jIg?.data) ? jIg.data.length : 0;
            const cFb = Array.isArray(jFb?.data) ? jFb.data.length : 0;
            setCounts({ all: cWeb + cIg + cFb, webchat: cWeb, instagram: cIg, facebook: cFb });
          } else {
            setCounts({ all: mappedConversations.length, webchat: mappedConversations.length, instagram: 0, facebook: 0 });
          }
        } catch (e) {
          console.warn('Counts update failed:', e);
        }
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
      result = await fetch(`/api/inbox/conversations/${contactId}/messages?limit=50`, { method: 'GET' });
    }
    
    const data = await result.json();
    if ((data.status === 'OK' || data.status === 'success') && Array.isArray(data.data)) {
      // Map to UI shape { dir, text }
      const mapped = data.data.map(m => ({
        dir: m.message_role ? (m.message_role === 'assistant' ? 0 : 1) : (m.dir ?? 1),
        text: m.message_content || m.text || '',
        timestamp: m.message_created_at ? new Date(m.message_created_at).getTime() : Date.now()
      })).filter(x => x.text);
      setMessages(mapped);
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
      const data = await result.json();
      if (data.status === 'OK' && data.data) {
        const u = data.data;
        const name = u.full_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Unknown';
        setProfile({ name, email: u.email || '', phone: u.phone || '', location: u.city || u.state || u.country || '' });
      }
      return;
    }
    // Real: use dedicated contact endpoint that resolves account_id from cookie
    result = await fetch(`/api/inbox/conversations/${contactId}/contact`, { method: 'GET' });
    const data = await result.json();
    if ((data.status === 'OK' || data.status === 'success') && (data.data || data.contact)) {
      const u = data.data || data.contact;
      const name = u.full_name || u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Unknown';
      setProfile({ name, email: u.email || '', phone: u.phone || '', location: u.city || u.state || u.country || '' });
    }
  };

  const handleCardClick = async (card) => {
    setCurrentContact(card);
    await Promise.all([
      loadMessages(card.id),
      loadProfile(card.id)
    ]);
  };

  const handleSendMessage = async (message) => {
    if (!currentContact || !message.trim()) return;
    try {
      setIsSending(true);
      const resp = await fetch(`/api/inbox/conversations/${currentContact.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ACCESS-TOKEN': userToken || ''
        },
        body: JSON.stringify({ message, channel: 9 })
      });
      await resp.text();
      // Refresh messages after sending
      await loadMessages(currentContact.id);
      addToast('Message sent', 'success');
    } catch (e) {
      console.error('Send message failed', e);
      addToast('Send failed', 'error');
    } finally {
      setIsSending(false);
    }
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

  // Helpers for time formatting
  const formatTime = (ts) => {
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  };
  const formatDate = (ts) => {
    try {
      const date = new Date(ts);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / 86400000);
      if (days === 0) return 'Today';
      if (days === 1) return 'Yesterday';
      if (days < 7) return `${days} days ago`;
      return date.toLocaleDateString();
    } catch { return ''; }
  };

  // Track scroll-at-bottom state for scroll-to-bottom button
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = (el.scrollHeight - el.scrollTop - el.clientHeight) < 100;
      setAtBottom(nearBottom);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [messagesRef.current]);

  // ----- Inbox Core Actions (React) -----
  const postJson = async (url, body) => {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-ACCESS-TOKEN': userToken || '' },
      body: JSON.stringify(body || {})
    });
    const text = await resp.text();
    try { return JSON.parse(text); } catch { return { status: 'RAW', raw: text }; }
  };

  const updateConversation = async (action, payload = {}) => {
    if (!currentContact) return;
    try {
      const j = await postJson(`/api/inbox/conversations/${encodeURIComponent(currentContact.id)}/update`, { action, ...payload });
      await loadMessages(currentContact.id);
      addToast(`${action} done`, 'success');
      return j;
    } catch (e) {
      console.error('Action failed', action, e);
      alert('Action failed: ' + action);
    }
  };

  const markRead = () => updateConversation('read', { timestamp: Math.floor(Date.now()/1000) });
  const markUnread = () => updateConversation('read', { timestamp: 0 });
  const archive = () => updateConversation('archived', { value: 1 });
  const unarchive = () => updateConversation('archived', { value: 0 });
  const follow = () => updateConversation('followup', { value: 1 });
  const unfollow = () => updateConversation('followup', { value: 0 });
  const liveToHuman = () => updateConversation('live_chat', { value: 1 });
  const liveToBot = () => updateConversation('live_chat', { value: 0 });
  const block = () => updateConversation('blocked', { value: 1 });
  const unblock = () => updateConversation('blocked', { value: 0 });

  const assign = async () => {
    if (!currentContact) return;
    const fbId = window.prompt('Assign to admin/team fb_id');
    if (fbId === null || fbId === undefined || fbId === '') return;
    return updateConversation('assign', { fb_id: String(fbId) });
  };
  const unassign = async () => updateConversation('assign', { fb_id: 0 });

  const addNote = async () => {
    if (!currentContact) return;
    const text = window.prompt('Note text');
    if (!text) return;
    try {
      await postJson(`/api/inbox/conversations/${encodeURIComponent(currentContact.id)}/notes`, { text });
      alert('Note added');
    } catch (e) {
      alert('Failed to add note');
    }
  };

  const updateNote = async () => {
    if (!currentContact) return;
    const noteId = window.prompt('Note ID');
    const text = window.prompt('New text');
    if (!noteId || !text) return;
    try {
      const resp = await fetch(`/api/inbox/conversations/${encodeURIComponent(currentContact.id)}/notes/${encodeURIComponent(noteId)}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-ACCESS-TOKEN': userToken || '' }, body: JSON.stringify({ text })
      });
      await resp.json().catch(() => ({}));
      alert('Note updated');
    } catch {
      alert('Failed to update note');
    }
  };

  const deleteNote = async () => {
    if (!currentContact) return;
    const noteId = window.prompt('Note ID');
    if (!noteId) return;
    try {
      const resp = await fetch(`/api/inbox/conversations/${encodeURIComponent(currentContact.id)}/notes/${encodeURIComponent(noteId)}`, {
        method: 'DELETE', headers: { 'X-ACCESS-TOKEN': userToken || '' }
      });
      await resp.json().catch(() => ({}));
      alert('Note deleted');
    } catch {
      alert('Failed to delete note');
    }
  };

  // AI Suggestion → fill composer
  const requestAiSuggestion = async () => {
    if (!currentContact) return;
    try {
      const resp = await fetch(`/api/inbox/conversations/${encodeURIComponent(currentContact.id)}/ai-suggestion`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-ACCESS-TOKEN': userToken || '' }, body: JSON.stringify({ prompt: null })
      });
      const j = await resp.json().catch(() => ({}));
      const suggestion = j?.data?.text || j?.text || j?.suggestion || '';
      if (suggestion) {
        setComposer((prev) => (prev ? prev + '\n' + suggestion : suggestion));
        addToast('AI suggestion ready', 'success');
      } else {
        addToast('No suggestion returned', 'warning');
      }
    } catch {
      addToast('AI suggestion failed', 'error');
    }
  };

  // Send Flow/Step/Products helpers
  const sendFlow = async () => {
    if (!currentContact) return;
    const flowId = window.prompt('Flow ID');
    if (!flowId) return;
    try {
      const resp = await fetch(`/api/inbox/conversations/${encodeURIComponent(currentContact.id)}/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-ACCESS-TOKEN': userToken || '' }, body: JSON.stringify({ flow_id: flowId, channel: 9 })
      });
      await resp.text();
      addToast('Flow sent', 'success');
    } catch { addToast('Failed to send flow', 'error'); }
  };
  const sendStep = async () => {
    if (!currentContact) return;
    const stepId = window.prompt('Step ID');
    if (!stepId) return;
    try {
      const resp = await fetch(`/api/inbox/conversations/${encodeURIComponent(currentContact.id)}/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-ACCESS-TOKEN': userToken || '' }, body: JSON.stringify({ step_id: stepId, channel: 9 })
      });
      await resp.text();
      addToast('Step sent', 'success');
    } catch { addToast('Failed to send step', 'error'); }
  };
  const sendProducts = async () => {
    if (!currentContact) return;
    const csv = window.prompt('Product IDs (comma separated)');
    if (!csv) return;
    const productIds = csv.split(',').map(s => Number(String(s).trim())).filter(n => !isNaN(n));
    try {
      const resp = await fetch(`/api/inbox/conversations/${encodeURIComponent(currentContact.id)}/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-ACCESS-TOKEN': userToken || '' }, body: JSON.stringify({ product_ids: productIds, channel: 9 })
      });
      await resp.text();
      addToast('Products sent', 'success');
    } catch { addToast('Failed to send products', 'error'); }
  };

  // Simple toast system
  const addToast = (text, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((arr) => [...arr, { id, text, type }]);
    setTimeout(() => setToasts((arr) => arr.filter(t => t.id !== id)), 2500);
  };

  useEffect(() => {
    // WebSocket not wired yet; skip for now
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
          <p>Preparando tu sesión…</p>
          {booting ? (
            <p style={{opacity:0.7}}>Auto-auth en progreso…</p>
          ) : (
            <button onClick={handleDirectLogin} className="direct-login-btn">Entrar</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="max-w-[1800px] mx-auto mb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-inbox text-sm text-white"></i>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Inbox</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-700/50 transition-all" title="Notifications"><i className="fas fa-bell"></i></button>
            <button className="p-2 rounded-lg hover:bg-gray-700/50 transition-all" title="Settings"><i className="fas fa-cog"></i></button>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button title="Filter: Webchat" className={`px-3 py-1.5 rounded-lg text-xs border border-gray-600/40 hover:bg-gray-700/40 ${platform==='webchat'?'bg-blue-600/20 text-blue-400 border-blue-600/30':''}`} onClick={() => setPlatform('webchat')}>Webchat <span className="ml-1 text-gray-400">({counts.webchat})</span></button>
          <button title="Filter: Instagram" className={`px-3 py-1.5 rounded-lg text-xs border border-gray-600/40 hover:bg-gray-700/40 ${platform==='instagram'?'bg-blue-600/20 text-blue-400 border-blue-600/30':''}`} onClick={() => setPlatform('instagram')}>Instagram <span className="ml-1 text-gray-400">({counts.instagram})</span></button>
          <button title="Filter: Facebook" className={`px-3 py-1.5 rounded-lg text-xs border border-gray-600/40 hover:bg-gray-700/40 ${platform==='facebook'?'bg-blue-600/20 text-blue-400 border-blue-600/30':''}`} onClick={() => setPlatform('facebook')}>Facebook <span className="ml-1 text-gray-400">({counts.facebook})</span></button>
          <div className="flex-1"></div>
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input className="search-input rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none" placeholder="Search conversations..." value={searchText} onChange={(e)=>setSearchText(e.target.value)} />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <button title="Show all" className={`px-3 py-1.5 rounded-lg ${currentFilter==='all'?'bg-blue-600/20 text-blue-400 border-blue-600/30':'hover:bg-gray-700/40'} border border-gray-600/40`} onClick={()=>setCurrentFilter('all')}>All</button>
          <button title="Show unread" className={`px-3 py-1.5 rounded-lg ${currentFilter==='unread'?'bg-blue-600/20 text-blue-400 border-blue-600/30':'hover:bg-gray-700/40'} border border-gray-600/40`} onClick={()=>setCurrentFilter('unread')}>Unread</button>
          <button title="Show priority" className={`px-3 py-1.5 rounded-lg ${currentFilter==='priority'?'bg-blue-600/20 text-blue-400 border-blue-600/30':'hover:bg-gray-700/40'} border border-gray-600/40`} onClick={()=>setCurrentFilter('priority')}>Priority</button>
        </div>
      </div>
      {demoMode && (
        <div className="demo-banner">
          <span>🎭 Demo Mode - Using sample data</span>
        </div>
      )}
      <div className="inbox">
        <div className="conversations glass rounded-xl p-4 border border-gray-600/30 scrollbar-enhanced">
          {loading ? (
            <div className="loading">Loading conversations...</div>
          ) : conversations.length > 0 ? (
            <div className="conv-list">
              {conversations
                .filter(c => {
                  if (!searchText.trim()) return true;
                  const q = searchText.toLowerCase();
                  return (
                    (c.title || '').toLowerCase().includes(q) ||
                    (c.description || '').toLowerCase().includes(q)
                  );
                })
                .filter(c => {
                  if (currentFilter === 'all') return true;
                  if (currentFilter === 'unread') return false; // TODO: wire unread when backend exposes it
                  if (currentFilter === 'priority') return false; // placeholder
                  return true;
                })
                .map((c) => (
                <div key={c.id} className={`p-3 rounded-xl cursor-pointer transition-all border ${currentContact?.id===c.id? 'active conv-item' : 'border-transparent hover:bg-gray-700/30 hover:border-gray-600/40'}`} onClick={() => handleCardClick(c)}>
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full conv-avatar"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm truncate conv-title">{c.title}</h3>
                      </div>
                      <p className="text-sm text-gray-300 truncate conv-desc">{c.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                <div className="chat-header-title"><h2>{currentContact.title}</h2></div>
                <div className="chat-header-actions">
                  <button title="Mark Read" onClick={markRead} className="btn-icon">✔</button>
                  <button title="Mark Unread" onClick={markUnread} className="btn-icon">✉</button>
                  <button title="Follow" onClick={follow} className="btn-icon">★</button>
                  <button title="Archive" onClick={archive} className="btn-icon">📦</button>
                  <button title="Unarchive" onClick={unarchive} className="btn-icon">📤</button>
                  <button title="Human" onClick={liveToHuman} className="btn-icon">👤</button>
                  <button title="Bot" onClick={liveToBot} className="btn-icon">🤖</button>
                  <button title="Block" onClick={block} className="btn-icon">⛔</button>
                </div>
              </div>
              <div ref={messagesRef} className="messages scrollbar-enhanced relative">
                {(() => {
                  let currentDateHeader = '';
                  return messages.map((msg, i) => {
                    const header = formatDate(msg.timestamp);
                    const showHeader = header !== currentDateHeader;
                    if (showHeader) currentDateHeader = header;
                    return (
                      <div key={i}>
                        {showHeader && (
                          <div className="flex items-center justify-center my-2">
                            <span className="px-3 py-1 text-[11px] bg-gray-700/50 rounded-full">{header}</span>
                          </div>
                        )}
                        <div className={`flex ${msg.dir === 0 ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] lg:max-w-[70%] rounded-2xl px-4 py-3 text-sm ${msg.dir===0 ? 'message-own text-white' : 'message-other text-gray-100'}`}>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            <div className={`flex items-center gap-2 mt-1 text-[10px] ${msg.dir===0 ? 'justify-end text-white/80' : 'justify-start text-gray-300'}`}>
                              <span>{formatTime(msg.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
                {!atBottom && (
                  <button className="scroll-to-bottom absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm" onClick={() => { const el = messagesRef.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); }}>
                    <i className="fas fa-arrow-down mr-2"></i> New messages
                  </button>
                )}
              </div>
              {/* Inbox core actions */}
              <div className="message-input" style={{display:'grid',gridTemplateColumns:'1fr',rowGap:'8px'}}>
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                  <button title="Unfollow conversation" onClick={unfollow} className="filter">Unfollow</button>
                  <button title="Unblock contact" onClick={unblock} className="filter">Unblock</button>
                  <button title="Assign to admin/team" onClick={assign} className="filter">Assign</button>
                  <button title="Remove assignment" onClick={unassign} className="filter">Unassign</button>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                  <button title="Add note" onClick={addNote} className="filter">Add Note</button>
                  <button title="Update note" onClick={updateNote} className="filter">Update Note</button>
                  <button title="Delete note" onClick={deleteNote} className="filter">Delete Note</button>
                  <button title="AI reply suggestion" onClick={requestAiSuggestion} className="filter">AI Suggest</button>
                  <button title="Send flow" onClick={sendFlow} className="filter">Send Flow</button>
                  <button title="Send step" onClick={sendStep} className="filter">Send Step</button>
                  <button title="Send products" onClick={sendProducts} className="filter">Send Products</button>
                </div>
                <div className="composer-row">
                  <textarea
                    className="search-input rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
                    rows="1"
                    value={composer}
                    placeholder="Type your message..."
                    onChange={(e) => setComposer(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const msg = composer.trim();
                        if (msg) handleSendMessage(msg);
                        setComposer('');
                      }
                    }}
                  />
                  <button title="Send message" className="btn-primary" disabled={isSending || !composer.trim()} onClick={() => { const msg = composer.trim(); if (msg) handleSendMessage(msg); setComposer(''); }}>
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
                <div className="flex items-center justify-end text-xs text-gray-400">
                  <span>{(composer || '').length}/2000</span>
                </div>
              </div>
            </>
          ) : (
            <div className="no-chat">Select a conversation</div>
          )}
        </div>

        <div className="profile">
          {profile ? (
            <div className="profile-card">
              <div className="avatar avatar-lg" />
              <div className="profile-name">{profile.name}</div>
              <div className="profile-sub">{profile.email || 'No email'}</div>
              <div className="profile-sub">{profile.phone || 'No phone'}</div>
              <div className="profile-sub">{profile.location || 'No location'}</div>
              <div className="profile-actions">
                <button className="btn-secondary" onClick={addNote}>Add Note</button>
                <button className="btn-secondary" onClick={requestAiSuggestion}>AI Suggest</button>
              </div>
            </div>
          ) : (
            <div className="profile-card placeholder">Select a conversation</div>
          )}
        </div>
      </div>
      {/* Toasts */}
      <div style={{position:'fixed',right:16,bottom:16,display:'flex',flexDirection:'column',gap:8}}>
        {toasts.map(t => (
          <div key={t.id} style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,149,29,0.35)',color:'#fff',padding:'8px 12px',borderRadius:8,fontSize:12}}>
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App; 