import { useEffect, useRef, useState } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import MainLayout from './components/layout/MainLayout';
import LoginScreen from './components/auth/LoginScreen';
import { API_BASE_URL } from './utils/constants';
import { useWebSocket } from './hooks/useWebSocket';

/**
 * Main App component with authentication and data loading logic
 */
const AppContent = ({ user, onLogout, onChangePassword }) => {
  const {
    isLoggedIn,
    userToken,
    demoMode,
    booting,
    setLoggedIn,
    setUserToken,
    setDemoMode,
    setBooting,
    setConversations,
    setCurrentContact,
    setMessages,
    setProfile,
    setLoading,
    setPlatform,
    setCounts,
    setComposer,
    setSending,
    addToast,
    platform,
    currentContact,
    setWsConnected,
    setWsConnecting,
    appendMessage
  } = useChat();

  const ws = useRef(null);
  const autoAuthTried = useRef(false);

  // WebSocket para mensajería en tiempo real
  const {
    isConnected: wsConnected, 
    isConnecting: wsConnecting, 
    sendMessage: sendWebSocketMessage 
  } = useWebSocket({
    isLoggedIn,
    userToken,
    currentContact,
    onMessageReceived: (message) => {
      console.log('📥 Nuevo mensaje recibido via WebSocket:', message);
      
      // ✅ Usar appendMessage para agregar mensaje sin perder estado
      if (message?.data?.contact_id === currentContact?.id) {
        console.log('🔄 WebSocket message for current contact, appending...');
        
        // Procesar el mensaje según el formato de la API
        const newMessage = {
          id: message.data.ms_id || message.data.id || Date.now().toString(),
          content: message.data.message?.[0]?.text || message.data.message || message.data.text || '',
          timestamp: new Date(message.data.timestamp || Date.now()),
          isOwn: message.data.dir === 0, // dir: 0 = mensaje propio, dir: 1 = mensaje recibido
          status: 'received'
        };
        
        console.log('🔥 WEBSOCKET - Parsed message:', newMessage);
        appendMessage(newMessage);
      } else {
        console.log('📥 WebSocket message for different contact, ignoring:', message?.data?.contact_id);
      }
    },
    onConnectionChange: (connected) => {
      setWsConnected(connected);
      setWsConnecting(!connected);
    }
  });

  // Subscribe to SSE for live updates
  useEffect(() => {
    if (!isLoggedIn) return;
    let es;
    try {
      es = new EventSource(`${API_BASE_URL}/api/inbox/stream`);
      es.onmessage = (evt) => {
        try {
          const payload = JSON.parse(evt.data || '{}');
          if (payload?.type === 'conversation_updated' || payload?.type === 'message_sent') {
            // CRITICAL: Never reload conversations or messages from SSE
            // This was causing the chat to empty and conversation list to change
            console.log('📡 SSE event received but ignoring to prevent conversation/message clearing:', payload.type);
          }
        } catch {}
      };
    } catch {}
    return () => { try { es?.close(); } catch {} };
  }, [isLoggedIn, platform]); // Removed currentContact?.id to prevent SSE reconnection on conversation change

  // Initialize app state
  useEffect(() => {
    // Capture account_id from URL params
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
      setLoggedIn(true);
      setBooting(false);
    }
  }, []);

  // Auto-login if no token
  useEffect(() => {
    if (isLoggedIn) return;
    if (autoAuthTried.current) return;
    autoAuthTried.current = true;
    
    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/api/test-auth`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' } 
        });
        const j = await r.json();
        if (j && j.status === 'OK' && j.token) {
          setUserToken(j.token);
          setDemoMode(j.demoMode || false);
          localStorage.setItem('userToken', j.token);
          localStorage.setItem('demoMode', (j.demoMode || false).toString());
          setLoggedIn(true);
        }
      } catch {}
      setBooting(false);
    })();
  }, [isLoggedIn]);

  // Load conversations when logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadConversations();
    }
  }, [isLoggedIn, platform]);

  // Infinite scroll state
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadConversations = async (offset = 0, append = false) => {
    if (!append) {
      setLoading(true);
      setHasMore(true);
    } else {
      setIsLoadingMore(true);
    }
    
    let result;
    
    // 🧪 UNIFIED INBOX BETA TEST - Safe feature flag
    const useUnifiedInbox = localStorage.getItem('UNIFIED_INBOX_BETA') === 'true';
    const effectivePlatform = useUnifiedInbox ? 'all' : platform;
    
    console.log('🔥 Loading conversations, demoMode:', demoMode, 'platform:', platform, 'offset:', offset);
    if (useUnifiedInbox) {
      console.log('🧪 BETA: Using unified inbox (platform=all) - ChatRace + Woodstock conversations');
    }
    
    try {
      if (demoMode) {
        result = await fetch(`${API_BASE_URL}/api/demo-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'conversations' })
        });
      } else {
        result = await fetch(`${API_BASE_URL}/api/inbox/conversations?platform=${encodeURIComponent(effectivePlatform)}&limit=50&offset=${offset}`, {
          method: 'GET',
          headers: {
            'X-ACCESS-TOKEN': userToken || '',
            'X-BUSINESS-ID': user?.business_id || localStorage.getItem('businessId') || ''
          }
        });
      }
      
      const data = await result.json();
      
      console.log('📥 Conversaciones recibidas:', data);
      
      if ((data.status === 'OK' || data.status === 'success') && Array.isArray(data.data)) {
        const base = data.data;
        const mappedConversations = base.map((item, idx) => {
          // Determine source for tags and identification
          const source = item.source || 'chatrace'; // Default to chatrace for compatibility
          const sourceLabel = source === 'woodstock' ? 'Woodstock' : 
                             source === 'vapi' ? 'VAPI' : 
                             'ChatRace';
          
          return {
            id: item.conversation_id || item.ms_id || item.id,
            name: item.display_name || item.full_name || item.name || 'Unknown',
            email: item.email || `${item.display_name || 'guest'}@example.com`,
            avatar: item.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(item.user_identifier || item.conversation_id || 'visitor_'+idx)}`,
            status: 'online',
            lastMessage: item.last_message_content || item.last_msg || 'No messages',
            timestamp: new Date(item.last_message_at || Date.now()),
            unreadCount: 0,
            priority: 'low',
            tags: useUnifiedInbox ? [sourceLabel] : [platform.charAt(0).toUpperCase() + platform.slice(1)],
            department: 'Support',
            source: source // Keep source for message routing
          };
        });
        
        console.log('✅ Conversaciones mapeadas:', mappedConversations);
        
        if (append) {
          // Append new conversations to existing ones
          setConversations(prev => [...prev, ...mappedConversations]);
        } else {
          // Replace conversations (initial load)
          setConversations(mappedConversations);
        }
        
        // Check if we got fewer conversations than requested (end of list)
        if (mappedConversations.length < 50) {
          setHasMore(false);
        }
        
        // Update counts
        try {
          if (!demoMode) {
            const [rWeb, rIg, rFb] = await Promise.all([
              fetch(`${API_BASE_URL}/api/inbox/conversations?platform=webchat&limit=50`),
              fetch(`${API_BASE_URL}/api/inbox/conversations?platform=instagram&limit=50`),
              fetch(`${API_BASE_URL}/api/inbox/conversations?platform=facebook&limit=50`)
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
        setConversations([]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      if (!append) {
        setConversations([]);
      }
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreConversations = async () => {
    if (!hasMore || isLoadingMore) return;
    
    const currentCount = conversations.length;
    console.log(`🔄 Loading more conversations. Current count: ${currentCount}`);
    
    await loadConversations(currentCount, true);
  };

  const loadMessages = async (contactId) => {
    let result;
    
    if (demoMode) {
      result = await fetch(`${API_BASE_URL}/api/demo-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'messages' })
      });
    } else {
      result = await fetch(`${API_BASE_URL}/api/inbox/conversations/${contactId}/messages?limit=50`, { 
        method: 'GET',
        headers: {
          'X-ACCESS-TOKEN': userToken || '',
          'X-BUSINESS-ID': user?.business_id || localStorage.getItem('businessId') || ''
        }
      });
    }
    
    const data = await result.json();
    if ((data.status === 'OK' || data.status === 'success') && Array.isArray(data.data)) {
      const mapped = data.data.map(m => ({
        id: m.id || Date.now().toString(),
        content: m.message_content || m.text || '',
        timestamp: new Date(m.message_created_at || Date.now()),
        isOwn: m.message_role ? (m.message_role === 'assistant') : (m.dir === 0),
        status: m.message_role === 'assistant' ? 'read' : undefined
      })).filter(x => x.content);
      
      // Ordenar mensajes por timestamp (más antiguos primero)
      const sorted = mapped.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      setMessages(sorted);
    }
  };

  const loadProfile = async (contactId) => {
    let result;
    if (demoMode) {
      result = await fetch(`${API_BASE_URL}/api/demo-data`, {
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
    result = await fetch(`${API_BASE_URL}/api/inbox/conversations/${contactId}/contact`, { 
      method: 'GET',
      headers: {
        'X-ACCESS-TOKEN': userToken || '',
        'X-BUSINESS-ID': user?.business_id || localStorage.getItem('businessId') || ''
      }
    });
    const data = await result.json();
    if ((data.status === 'OK' || data.status === 'success') && (data.data || data.contact)) {
      const u = data.data || data.contact;
      const name = u.full_name || u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Unknown';
      setProfile({ name, email: u.email || '', phone: u.phone || '', location: u.city || u.state || u.country || '' });
    }
  };

  const handleContactSelect = async (contact) => {
    setCurrentContact(contact);
    await Promise.all([
      loadMessages(contact.id),
      loadProfile(contact.id)
    ]);
  };

  const handleSendMessage = async (message) => {
    console.log('🔥 HANDLE SEND MESSAGE - message:', message, 'currentContact:', currentContact?.name);
    if (!currentContact || !message.trim()) return;
    
    setComposer('');

    try {
      setSending(true);
      
      // Usar WebSocket si está conectado, sino fallback a HTTP
      if (wsConnected && sendWebSocketMessage) {
        console.log('📤 Enviando mensaje via WebSocket');
        const success = sendWebSocketMessage(
          message, 
          currentContact.id, 
          getChannelForPlatform(platform)
        );
        
        if (success) {
          // Agregar mensaje inmediatamente al UI
          appendMessage({
            id: Date.now().toString(),
            content: message,
            timestamp: new Date(),
            isOwn: true,
            status: 'sent'
          });
          addToast('Message sent via WebSocket', 'success');
          return;
        }
      }
      
      // Fallback a HTTP si WebSocket no está disponible
      console.log('📤 Fallback: Enviando mensaje via HTTP');
      const resp = await fetch(`${API_BASE_URL}/api/inbox/conversations/${currentContact.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ACCESS-TOKEN': userToken || ''
        },
        body: JSON.stringify({ message, channel: getChannelForPlatform(platform) })
      });
      const result = await resp.text();
      console.log('📥 HTTP send result:', result);
      
      // ✅ Agregar mensaje inmediatamente al UI (HTTP también funciona)
      appendMessage({
        id: Date.now().toString(),
        content: message,
        timestamp: new Date(),
        isOwn: true,
        status: 'sent'
      });
      
      addToast('Message sent via HTTP', 'success');
    } catch (e) {
      console.error('Send message failed', e);
      addToast('Send failed', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDirectLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/test-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        setUserToken(data.token);
        setDemoMode(data.demoMode || false);
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('demoMode', (data.demoMode || false).toString());
        setLoggedIn(true);
      } else {
        addToast(`Authentication failed: ${data.message}`, 'error');
      }
    } catch (error) {
      console.error('Direct login error:', error);
      addToast('Login failed. Please try again.', 'error');
    }
  };

  const handleSwitchAccount = () => {
    try {
      const current = (() => { 
        const m = document.cookie.match(/(?:^|; )account_id=([^;]+)/); 
        return m ? decodeURIComponent(m[1]) : ''; 
      })();
      const input = window.prompt('Enter account_id', current || '');
      if (!input) return;
      document.cookie = `account_id=${encodeURIComponent(String(input))}; path=/; max-age=31536000`;
      const url = new URL(window.location.href);
      url.searchParams.set('account_id', String(input));
      window.location.href = url.toString();
    } catch (e) {
      window.location.reload();
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('userToken');
      localStorage.removeItem('demoMode');
      document.cookie = 'account_id=; Max-Age=0; path=/';
      document.cookie = 'user_token=; Max-Age=0; path=/';
    } catch {}
    window.location.reload();
  };

  // Platform → channel mapping
  const getChannelForPlatform = (plat) => {
    const p = (plat || platform || 'webchat');
    if (p === 'instagram') return 10;
    if (p === 'facebook') return 0;
    return 9; // webchat
  };

  // API helpers
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
      // Don't reload messages after conversation updates to prevent chat clearing
      // await loadMessages(currentContact.id); // ❌ THIS CLEARS THE CHAT!
      addToast(`${action} done`, 'success');
      return j;
    } catch (e) {
      console.error('Action failed', action, e);
      addToast('Action failed: ' + action, 'error');
    }
  };

  // Conversation actions
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
      addToast('Note added', 'success');
    } catch (e) {
      addToast('Failed to add note', 'error');
    }
  };

  const updateNote = async () => {
    if (!currentContact) return;
    const noteId = window.prompt('Note ID');
    const text = window.prompt('New text');
    if (!noteId || !text) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/api/inbox/conversations/${encodeURIComponent(currentContact.id)}/notes/${encodeURIComponent(noteId)}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json', 'X-ACCESS-TOKEN': userToken || '' }, 
        body: JSON.stringify({ text })
      });
      await resp.json().catch(() => ({}));
      addToast('Note updated', 'success');
    } catch {
      addToast('Failed to update note', 'error');
    }
  };

  const deleteNote = async () => {
    if (!currentContact) return;
    const noteId = window.prompt('Note ID');
    if (!noteId) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/api/inbox/conversations/${encodeURIComponent(currentContact.id)}/notes/${encodeURIComponent(noteId)}`, {
        method: 'DELETE', 
        headers: { 'X-ACCESS-TOKEN': userToken || '' }
      });
      await resp.json().catch(() => ({}));
      addToast('Note deleted', 'success');
    } catch {
      addToast('Failed to delete note', 'error');
    }
  };

  const requestAiSuggestion = async () => {
    if (!currentContact) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/api/inbox/conversations/${encodeURIComponent(currentContact.id)}/ai-suggestion`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'X-ACCESS-TOKEN': userToken || '' }, 
        body: JSON.stringify({ prompt: null })
      });
      const j = await resp.json().catch(() => ({}));
      const suggestion = Array.isArray(j?.data) ? (j.data[0]?.text || '') : (j?.data?.text || j?.text || j?.suggestion || '');
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

  const sendFlow = async () => {
    if (!currentContact) return;
    const flowId = window.prompt('Flow ID');
    if (!flowId) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/api/inbox/conversations/${encodeURIComponent(currentContact.id)}/send`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'X-ACCESS-TOKEN': userToken || '' }, 
        body: JSON.stringify({ flow_id: flowId, channel: getChannelForPlatform(platform) })
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
      const resp = await fetch(`${API_BASE_URL}/api/inbox/conversations/${encodeURIComponent(currentContact.id)}/send`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'X-ACCESS-TOKEN': userToken || '' }, 
        body: JSON.stringify({ step_id: stepId, channel: getChannelForPlatform(platform) })
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
      const resp = await fetch(`${API_BASE_URL}/api/inbox/conversations/${encodeURIComponent(currentContact.id)}/send`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'X-ACCESS-TOKEN': userToken || '' }, 
        body: JSON.stringify({ product_ids: productIds, channel: getChannelForPlatform(platform) })
      });
      await resp.text();
      addToast('Products sent', 'success');
    } catch { addToast('Failed to send products', 'error'); }
  };

  // Prepare app state and actions for MainLayout
  const appState = {
    conversations: useChat().conversations,
    currentContact: useChat().currentContact,
    messages: useChat().messages,
    profile: useChat().profile,
    isTyping: useChat().isTyping,
    composer: useChat().composer,
    isSending: useChat().isSending,
    searchText: useChat().searchText,
    platform: useChat().platform,
    counts: useChat().counts,
    loading: useChat().loading,
    toasts: useChat().toasts,
    demoMode: useChat().demoMode,
    // Infinite scroll state
    hasMore: hasMore,
    isLoadingMore: isLoadingMore
  };

  const appActions = {
    setSearchText: useChat().setSearchText,
    setPlatform: useChat().setPlatform,
    setComposer: useChat().setComposer,
    handleContactSelect,
    handleSendMessage,
    handleSwitchAccount,
    handleLogout,
    removeToast: useChat().removeToast,
    markRead,
    markUnread,
    archive,
    unarchive,
    follow,
    unfollow,
    liveToHuman,
    liveToBot,
    block,
    unblock,
    assign,
    unassign,
    addNote,
    updateNote,
    deleteNote,
    requestAiSuggestion,
    sendFlow,
    sendStep,
    sendProducts,
    // Infinite scroll action
    loadMoreConversations
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen 
        booting={booting}
        onLogin={handleDirectLogin}
      />
    );
  }

  return (
        <MainLayout
      appState={appState}
      appActions={appActions}
      user={user}
      onLogout={onLogout}
      onChangePassword={onChangePassword}
    />
  );
};

/**
 * Root App component with context provider
 */
const App = ({ user = null, onLogout = () => {}, onChangePassword = () => {} }) => {
  return (
    <ChatProvider>
      <AppContent 
        user={user} 
        onLogout={onLogout} 
        onChangePassword={onChangePassword} 
      />
    </ChatProvider>
  );
};

export default App; 