import { useRef, useEffect, useState, useCallback } from 'react';
import './App.css';

// ============================================================================
// CUSTOM HOOKS - Hooks chingones de los variants
// ============================================================================

// Hook para auto-scroll mejorado (del variant2.md)
function useAutoScroll(options = {}) {
  const { offset = 20, smooth = false, content } = options;
  const scrollRef = useRef(null);
  const lastContentHeight = useRef(0);
  const userHasScrolled = useRef(false);

  const [scrollState, setScrollState] = useState({
    isAtBottom: true,
    autoScrollEnabled: true,
  });

  const checkIsAtBottom = useCallback(
    (element) => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const distanceToBottom = Math.abs(scrollHeight - scrollTop - clientHeight);
      return distanceToBottom <= offset;
    },
    [offset]
  );

  const scrollToBottom = useCallback(
    (instant = false) => {
      if (!scrollRef.current) return;

      const targetScrollTop = scrollRef.current.scrollHeight - scrollRef.current.clientHeight;

      if (instant) {
        scrollRef.current.scrollTop = targetScrollTop;
      } else {
        scrollRef.current.scrollTo({
          top: targetScrollTop,
          behavior: smooth ? "smooth" : "auto",
        });
      }

      setScrollState({
        isAtBottom: true,
        autoScrollEnabled: true,
      });
      userHasScrolled.current = false;
    },
    [smooth]
  );

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const atBottom = checkIsAtBottom(scrollRef.current);

    setScrollState((prev) => ({
      isAtBottom: atBottom,
      autoScrollEnabled: atBottom ? true : prev.autoScrollEnabled,
    }));
  }, [checkIsAtBottom]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.addEventListener("scroll", handleScroll, { passive: true });
    return () => element.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const currentHeight = scrollElement.scrollHeight;
    const hasNewContent = currentHeight !== lastContentHeight.current;

    if (hasNewContent) {
      if (scrollState.autoScrollEnabled) {
        requestAnimationFrame(() => {
          scrollToBottom(lastContentHeight.current === 0);
        });
      }
      lastContentHeight.current = currentHeight;
    }
  }, [content, scrollState.autoScrollEnabled, scrollToBottom]);

  const disableAutoScroll = useCallback(() => {
    const atBottom = scrollRef.current ? checkIsAtBottom(scrollRef.current) : false;

    if (!atBottom) {
      userHasScrolled.current = true;
      setScrollState((prev) => ({
        ...prev,
        autoScrollEnabled: false,
      }));
    }
  }, [checkIsAtBottom]);

  return {
    scrollRef,
    isAtBottom: scrollState.isAtBottom,
    autoScrollEnabled: scrollState.autoScrollEnabled,
    scrollToBottom: () => scrollToBottom(false),
    disableAutoScroll,
  };
}

// Hook para textarea auto-resize (del variant3.md)
function useTextareaResize(value, rows = 1) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textArea = textareaRef.current;
    if (textArea) {
      const computedStyle = window.getComputedStyle(textArea);
      const lineHeight = parseInt(computedStyle.lineHeight, 10) || 20;
      const padding =
        parseInt(computedStyle.paddingTop, 10) +
        parseInt(computedStyle.paddingBottom, 10);

      const minHeight = lineHeight * rows + padding;

      textArea.style.height = "0px";
      const scrollHeight = Math.max(textArea.scrollHeight, minHeight);
      textArea.style.height = `${scrollHeight + 2}px`;
    }
  }, [value, rows]);

  return textareaRef;
}

// Hook para debounce (útil para search)
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const App = () => {
  const [conversations, setConversations] = useState([]);
  const [currentContact, setCurrentContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState('webchat');
  const [counts, setCounts] = useState({ all: 0, webchat: 0, instagram: 0, facebook: 0 });
  const [composer, setComposer] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [debugMode, setDebugMode] = useState(true); // Para los delimitadores de debug

  const ws = useRef(null);
  const autoAuthTried = useRef(false);
  const [booting, setBooting] = useState(true);

  // Hooks chingones de los variants
  const debouncedSearchText = useDebounce(searchText, 300);
  const textareaRef = useTextareaResize(composer, 1);
  const {
    scrollRef: messagesScrollRef,
    isAtBottom,
    autoScrollEnabled,
    scrollToBottom,
    disableAutoScroll,
  } = useAutoScroll({
    smooth: true,
    content: [...messages, isTyping],
  });

  // Configuration from environment variables
  const BUSINESS_ID = import.meta.env.VITE_BUSINESS_ID;
  const API_BASE_URL = ''; // Empty to use relative URLs with Vite proxy

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
            // Refresh counts and, if currentContact matches, refresh messages
            loadConversations(undefined, platform);
            if (currentContact?.id) {
              loadMessages(currentContact.id);
            }
          }
        } catch {}
      };
    } catch {}
    return () => { try { es?.close(); } catch {} };
  }, [isLoggedIn, platform, currentContact?.id]);

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
        const r = await fetch(`${API_BASE_URL}/api/test-auth`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
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
  }, [isLoggedIn, platform]);

  const handleDirectLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/test-auth`, {
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
      } else {
        alert(`Authentication failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Direct login error:', error);
      alert('Login failed. Please try again.');
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
        result = await fetch(`${API_BASE_URL}/api/demo-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'conversations' })
        });
      } else {
        console.log('Using real API for conversations');
        result = await fetch(`${API_BASE_URL}/api/inbox/conversations?platform=${encodeURIComponent(p)}&limit=50`, {
          method: 'GET'
        });
      }
      
      const data = await result.json();
      console.log('Conversations data:', data);
      
      if ((data.status === 'OK' || data.status === 'success') && Array.isArray(data.data)) {
        const base = data.data;
        const mappedConversations = base.map((item, idx) => ({
          id: item.conversation_id || item.ms_id || item.id,
          name: item.display_name || item.full_name || item.name || 'Unknown',
          email: item.email || `${item.display_name || 'guest'}@example.com`,
          avatar: item.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(item.user_identifier || item.conversation_id || 'visitor_'+idx)}`,
          status: 'online',
          lastMessage: item.last_message_content || item.last_msg || 'No messages',
          timestamp: new Date(item.last_message_at || Date.now()),
          unreadCount: 0,
          priority: 'low',
          tags: [p.charAt(0).toUpperCase() + p.slice(1)],
          department: 'Support'
        }));
        console.log('Mapped conversations:', mappedConversations);
        setConversations(mappedConversations);
        
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
        console.error('Failed to load conversations:', data);
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
      result = await fetch(`${API_BASE_URL}/api/demo-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'messages' })
      });
    } else {
      result = await fetch(`${API_BASE_URL}/api/inbox/conversations/${contactId}/messages?limit=50`, { method: 'GET' });
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
      setMessages(mapped);
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
    result = await fetch(`${API_BASE_URL}/api/inbox/conversations/${contactId}/contact`, { method: 'GET' });
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
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleSendMessage = async (message) => {
    if (!currentContact || !message.trim()) return;
    
    // Add message immediately to UI
    const newMessage = {
      id: Date.now().toString(),
      content: message,
      timestamp: new Date(),
      isOwn: true,
      status: 'sent'
    };
    setMessages(prev => [...prev, newMessage]);
    setComposer('');

    try {
      setIsSending(true);
      const resp = await fetch(`${API_BASE_URL}/api/inbox/conversations/${currentContact.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ACCESS-TOKEN': userToken || ''
        },
        body: JSON.stringify({ message, channel: getChannelForPlatform(platform) })
      });
      await resp.text();
      // Refresh messages from server (NO auto-respuesta)
      await loadMessages(currentContact.id);
      addToast('Message sent', 'success');
    } catch (e) {
      console.error('Send message failed', e);
      addToast('Send failed', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // ----- API helpers and real conversation actions -----
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
      addToast('Action failed: ' + action, 'error');
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
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-ACCESS-TOKEN': userToken || '' }, body: JSON.stringify({ text })
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
        method: 'DELETE', headers: { 'X-ACCESS-TOKEN': userToken || '' }
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
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-ACCESS-TOKEN': userToken || '' }, body: JSON.stringify({ prompt: null })
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

  // Switch account (sets cookie account_id and reloads with query param)
  const handleSwitchAccount = () => {
    try {
      const current = (() => { const m = document.cookie.match(/(?:^|; )account_id=([^;]+)/); return m ? decodeURIComponent(m[1]) : ''; })();
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

  // Logout handler
  const handleLogout = () => {
    try {
      localStorage.removeItem('userToken');
      localStorage.removeItem('demoMode');
      document.cookie = 'account_id=; Max-Age=0; path=/';
      document.cookie = 'user_token=; Max-Age=0; path=/';
    } catch {}
    window.location.reload();
  };

  const sendFlow = async () => {
    if (!currentContact) return;
    const flowId = window.prompt('Flow ID');
    if (!flowId) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/api/inbox/conversations/${encodeURIComponent(currentContact.id)}/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-ACCESS-TOKEN': userToken || '' }, body: JSON.stringify({ flow_id: flowId, channel: getChannelForPlatform(platform) })
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
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-ACCESS-TOKEN': userToken || '' }, body: JSON.stringify({ step_id: stepId, channel: getChannelForPlatform(platform) })
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
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-ACCESS-TOKEN': userToken || '' }, body: JSON.stringify({ product_ids: productIds, channel: getChannelForPlatform(platform) })
      });
      await resp.text();
      addToast('Products sent', 'success');
    } catch { addToast('Failed to send products', 'error'); }
  };

  const addToast = (text, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((arr) => [...arr, { id, text, type }]);
    setTimeout(() => setToasts((arr) => arr.filter(t => t.id !== id)), 3000);
  };

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

  const formatLastSeen = (date) => {
    const diff = new Date().getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  // Platform → channel mapping used for all send operations
  const getChannelForPlatform = (plat) => {
    const p = (plat || platform || 'webchat');
    if (p === 'instagram') return 10;
    if (p === 'facebook') return 0;
    return 9; // webchat
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500 shadow-green-500/50';
      case 'away': return 'bg-yellow-500 shadow-yellow-500/50';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filtros mejorados con debounce
  const filteredConversations = conversations.filter(c => {
    if (!debouncedSearchText.trim()) return true;
    const q = debouncedSearchText.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.lastMessage || '').toLowerCase().includes(q)
    );
  }).filter(c => {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'unread') return c.unreadCount > 0;
    if (currentFilter === 'priority') return c.priority === 'high';
    return true;
  });

  // Agent branding
  const AGENT_NAME = 'AiPRL Assist';
  const AGENT_AVATAR_URL = '/AI%20AIPRL%20modern.png';

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="glass rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-inbox text-2xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              ChatRace Inbox
            </h1>
            <p className="text-gray-300 mb-6">Preparando tu sesión…</p>
          {booting ? (
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <span className="ml-2">Auto-auth en progreso…</span>
              </div>
            ) : (
              <button 
                onClick={handleDirectLogin} 
                className="btn-primary w-full py-3 rounded-xl font-medium transition-all hover:transform hover:-translate-y-0.5"
              >
                Entrar al Inbox
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className={`flex h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900 ${debugMode ? 'debug-mode' : ''}`}>
      {/* DEBUG: Conversations Sidebar */}
      <div className={`w-80 glass flex flex-col transition-all duration-300 z-50 fixed md:relative h-full overflow-x-hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${debugMode ? 'debug-sidebar' : ''}`}>
        {/* DEBUG: Sidebar Header */}
        <div className={`p-6 border-b border-gray-600/30 ${debugMode ? 'debug-header' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-inbox text-sm text-white"></i>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Inbox</h2>
          </div>
          <div className="flex items-center gap-2">
              <button 
                onClick={() => setDebugMode(!debugMode)}
                className="p-2 rounded-lg hover:bg-gray-700/50 transition-all"
                title="Toggle Debug Mode"
              >
                <i className="fas fa-bug text-sm"></i>
              </button>
              <button 
                onClick={handleSwitchAccount}
                className="p-2 rounded-lg hover:bg-gray-700/50 transition-all"
                title="Switch account"
              >
                <i className="fas fa-exchange-alt text-sm"></i>
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-700/50 transition-all" title="Notifications">
                <i className="fas fa-bell text-sm"></i>
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-700/50 transition-all" title="Settings">
                <i className="fas fa-cog text-sm"></i>
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-700/50 transition-all" title="Logout">
                <i className="fas fa-sign-out-alt text-sm"></i>
              </button>
          </div>
        </div>
          
          {/* DEBUG: Enhanced Search */}
          <div className={`relative group ${debugMode ? 'debug-search' : ''}`}>
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors"></i>
            <input 
              placeholder="Search conversations..." 
              className="w-full search-input rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText && (
              <button 
                onClick={() => setSearchText('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <i className="fas fa-times h-3 w-3"></i>
              </button>
            )}
          </div>

          {/* Compact filters row (platform + quick filters) */}
          <div className="mt-2 -mx-2 px-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 min-w-max">
              <div className="flex items-center gap-1">
                <button 
                  className={`px-2.5 py-1 rounded-lg text-[11px] border border-gray-600/40 hover:bg-gray-700/40 ${platform==='webchat'?'bg-blue-600/20 text-blue-400 border-blue-600/30':''}`}
                  onClick={() => setPlatform('webchat')}
                >
                  Webchat <span className="ml-1 opacity-70">({counts.webchat})</span>
                </button>
                <button 
                  className={`px-2.5 py-1 rounded-lg text-[11px] border border-gray-600/40 hover:bg-gray-700/40 ${platform==='instagram'?'bg-blue-600/20 text-blue-400 border-blue-600/30':''}`}
                  onClick={() => setPlatform('instagram')}
                >
                  Instagram <span className="ml-1 opacity-70">({counts.instagram})</span>
                </button>
                <button 
                  className={`px-2.5 py-1 rounded-lg text-[11px] border border-gray-600/40 hover:bg-gray-700/40 ${platform==='facebook'?'bg-blue-600/20 text-blue-400 border-blue-600/30':''}`}
                  onClick={() => setPlatform('facebook')}
                >
                  Facebook <span className="ml-1 opacity-70">({counts.facebook})</span>
                </button>
              </div>
              <span className="h-4 w-px bg-gray-600/40" />
              <div className="flex items-center gap-1">
                <button 
                  className={`px-2.5 py-1 rounded-lg text-[11px] ${currentFilter==='all'?'bg-blue-600/20 text-blue-400 border border-blue-600/30':'hover:bg-gray-700/40 border border-gray-600/40'}`}
                  onClick={() => setCurrentFilter('all')}
                >
                  All <span className="ml-1 opacity-70">({filteredConversations.length})</span>
                </button>
                <button 
                  className={`px-2.5 py-1 rounded-lg text-[11px] ${currentFilter==='unread'?'bg-blue-600/20 text-blue-400 border border-blue-600/30':'hover:bg-gray-700/40 border border-gray-600/40'}`}
                  onClick={() => setCurrentFilter('unread')}
                >
                  Unread <span className="ml-1 opacity-70">({conversations.filter(c => c.unreadCount > 0).length})</span>
                </button>
                <button 
                  className={`px-2.5 py-1 rounded-lg text-[11px] ${currentFilter==='priority'?'bg-blue-600/20 text-blue-400 border border-blue-600/30':'hover:bg-gray-700/40 border border-gray-600/40'}`}
                  onClick={() => setCurrentFilter('priority')}
                >
                  Priority <span className="ml-1 opacity-70">({conversations.filter(c => c.priority === 'high').length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* DEBUG: Conversations List */}
        <div className={`flex-1 overflow-y-auto scrollbar-enhanced ${debugMode ? 'debug-conversations' : ''}`}>
          {loading ? (
            <div className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <span className="ml-2">Loading conversations...</span>
              </div>
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="p-2">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-4 rounded-xl cursor-pointer transition-all hover:bg-gray-700/30 animate-fade-in mb-2 ${currentContact?.id === conv.id ? 'bg-blue-600/20 border border-blue-600/30' : 'border border-transparent'} ${debugMode ? 'debug-conversation-item' : ''}`}
                  onClick={() => handleCardClick(conv)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <img className="w-12 h-12 rounded-full object-cover" src={conv.avatar} alt={conv.name} />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-gray-900 ${getStatusColor(conv.status)}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm truncate">{conv.name}</h3>
                        <div className="flex items-center gap-2">
                          {conv.unreadCount > 0 && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                          )}
                          <span className="text-xs text-gray-400">{formatTime(conv.timestamp)}</span>
                      </div>
                      </div>
                      <p className="text-sm text-gray-400 truncate mb-2">{conv.lastMessage}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${getPriorityColor(conv.priority)}`}>
                          {conv.priority}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="text-xs font-bold text-blue-400">{conv.unreadCount} new</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-400">
              <i className="fas fa-inbox text-3xl mb-4 opacity-50"></i>
              <p>No conversations found</p>
              <p className="text-xs mt-2">Demo mode: {demoMode ? 'Yes' : 'No'}</p>
              <button onClick={() => loadConversations()} className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-all">
                Retry
              </button>
            </div>
          )}
        </div>
        
        {/* DEBUG: Agent Status */}
        <div className={`p-4 border-t border-gray-600/30 ${debugMode ? 'debug-agent-status' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img className="w-8 h-8 rounded-full object-cover" src={AGENT_AVATAR_URL} alt={AGENT_NAME} />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 shadow-green-500/50"></div>
                </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{AGENT_NAME}</p>
              <p className="text-xs text-gray-400">Online • Ready to help</p>
              </div>
            <button className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-all">
              <i className="fas fa-ellipsis-h h-3 w-3"></i>
            </button>
          </div>
        </div>
      </div>

      {/* DEBUG: Main Chat Area */}
      <div className={`flex-1 flex flex-col min-h-0 ${debugMode ? 'debug-main-chat' : ''}`}>
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 md:hidden p-3 rounded-xl bg-white/90 backdrop-blur-sm text-gray-900 shadow-lg"
        >
          <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'} h-5 w-5`}></i>
        </button>

        {/* DEBUG: Chat Header */}
        {currentContact && (
          <>
          <div className={`p-6 border-b border-gray-600/30 glass mobile-padding md:pt-6 ${debugMode ? 'debug-chat-header' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img className="w-12 h-12 rounded-full object-cover" src={currentContact.avatar} alt={currentContact.name} />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-gray-900 ${getStatusColor(currentContact.status)}`}></div>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold">{currentContact.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{currentContact.status === 'online' ? 'Online now' : `Last seen ${formatLastSeen(currentContact.timestamp)}`}</span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                    <span>{currentContact.department}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-3 rounded-xl bg-gray-700/40 text-gray-400 cursor-not-allowed" title="Phone (coming soon)">
                  <i className="fas fa-phone h-4 w-4"></i>
                </button>
                <button className="p-3 rounded-xl bg-gray-700/40 text-gray-400 cursor-not-allowed" title="Video (coming soon)">
                  <i className="fas fa-video h-4 w-4"></i>
                </button>
                <button className="p-3 rounded-xl bg-gray-700/40 text-gray-400 cursor-not-allowed" title="Search (coming soon)">
                  <i className="fas fa-search h-4 w-4"></i>
                </button>
                <button className="p-3 rounded-xl bg-gray-700/40 text-gray-400 cursor-not-allowed" title="More (coming soon)">
                  <i className="fas fa-ellipsis-v h-4 w-4"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Actions Toolbar moved to sidebar to reduce clutter */}
          </>
        )}

        {/* DEBUG: Messages Area */}
        <div className={`flex-1 relative min-h-0 ${debugMode ? 'debug-messages-area' : ''}`}>
          {currentContact ? (
            <div
              ref={messagesScrollRef}
              className="h-full overflow-y-auto scrollbar-enhanced p-6 pb-28"
              onWheel={disableAutoScroll}
              onTouchMove={disableAutoScroll}
            >
              <div className="space-y-4 min-h-full flex flex-col justify-end">
                {messages.map((msg) => {
                  const msgDate = formatDate(msg.timestamp);
                  return (
                    <div key={msg.id}>
                      <div className={`flex gap-4 ${msg.isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        {!msg.isOwn && (
                          <img className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" src={currentContact.avatar} alt={currentContact.name} />
                        )}
                        <div className="max-w-[80%] lg:max-w-[70%]">
                          <div className={`rounded-2xl px-4 py-3 text-sm ${msg.isOwn ? 'message-own text-white' : 'message-other text-gray-100'}`}>
                            <p className="leading-relaxed">{msg.content}</p>
                          </div>
                          <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                              <span>{formatTime(msg.timestamp)}</span>
                            {msg.isOwn && msg.status && (
                              <i className={`fas ${msg.status === 'read' ? 'fa-check-double text-blue-400' : msg.status === 'delivered' ? 'fa-check-double' : 'fa-check'} h-3 w-3`}></i>
                            )}
                            </div>
                          </div>
                        {msg.isOwn && (
                          <img className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" src={AGENT_AVATAR_URL} alt={AGENT_NAME} />
                        )}
                        </div>
                      </div>
                    );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-4 justify-start animate-fade-in">
                    <img className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" src={currentContact.avatar} alt={currentContact.name} />
                    <div className="message-other rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
                </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <i className="fas fa-comments text-6xl mb-4 opacity-30"></i>
                <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                <p className="text-sm">Choose a conversation from the sidebar to start chatting</p>
                </div>
            </div>
          )}

          {/* Scroll to Bottom Button - Aparece cuando no está en el fondo */}
          {currentContact && !isAtBottom && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 glass rounded-full text-sm font-medium animate-fade-in hover:transform hover:-translate-y-1 transition-all"
            >
              <i className="fas fa-arrow-down mr-2"></i>
              New messages
            </button>
          )}
        </div>

        {/* DEBUG: Enhanced Message Input */}
        {currentContact && (
          <div className={`p-6 border-t border-gray-600/30 glass ${debugMode ? 'debug-message-input' : ''}`}>
            <div className="flex items-end gap-4">
              <div className="flex gap-2">
                <button className="p-3 rounded-xl hover:bg-gray-700/50 transition-all" title="Attach file">
                  <i className="fas fa-paperclip h-4 w-4"></i>
                </button>
                <button className="p-3 rounded-xl hover:bg-gray-700/50 transition-all" title="Add emoji">
                  <i className="fas fa-smile h-4 w-4"></i>
                </button>
              </div>
              
              <div className="flex-1 relative">
                  <textarea
                  ref={textareaRef}
                  placeholder="Type your message..." 
                  className="w-full auto-resize search-input rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none resize-none"
                    rows="1"
                  maxLength="2000"
                    value={composer}
                    onChange={(e) => setComposer(e.target.value)}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                      if (composer.trim()) {
                        handleSendMessage(composer);
                      }
                      }
                    }}
                  />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  <span className={composer.length > 1800 ? 'text-red-400' : ''}>{composer.length}</span>/2000
                </div>
              </div>
              
              <button 
                onClick={() => handleSendMessage(composer)}
                disabled={!composer.trim() || isSending}
                className="btn-primary p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all hover:transform hover:-translate-y-0.5"
              >
                <i className="fas fa-paper-plane h-4 w-4"></i>
                  </button>
                </div>
            
            {/* Quick Responses - Aparecen cuando el composer está vacío */}
            {!composer.trim() && (
              <div className="mt-3 flex gap-2 flex-wrap animate-fade-in">
                {[
                  "Thanks for reaching out! How can I help you today?",
                  "I'll look into this right away and get back to you shortly.",
                  "Is there anything else I can help you with?",
                  "Let me connect you with the right specialist.",
                  "I understand your concern. Let me check that for you."
                ].map((response, index) => (
                  <button
                    key={index}
                    onClick={() => setComposer(response)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-all hover:transform hover:scale-105"
                  >
                    {response.length > 30 ? response.substring(0, 30) + '...' : response}
                  </button>
                ))}
                </div>
            )}
              </div>
          )}
        </div>

      {/* DEBUG: Customer Info Sidebar */}
      {currentContact && (
        <div className={`w-80 glass p-6 hidden lg:flex flex-col gap-6 overflow-y-auto scrollbar-enhanced ${debugMode ? 'debug-customer-info' : ''}`}>
          {/* Customer Profile */}
          <div className="text-center">
            <img className="w-20 h-20 rounded-full object-cover mx-auto mb-4" src={currentContact.avatar} alt={currentContact.name} />
            <h3 className="text-xl font-bold mb-1">{currentContact.name}</h3>
            <p className="text-sm text-gray-400 mb-3">{currentContact.email}</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(currentContact.status)}`}></div>
              <span className="text-sm capitalize">{currentContact.status}</span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 text-xs rounded-lg bg-gray-700/60 text-gray-400 cursor-not-allowed" title="Coming soon">
                <i className="fas fa-phone mr-1"></i> Call (coming soon)
              </button>
              <button className="flex-1 px-3 py-2 text-xs rounded-lg bg-gray-700/60 text-gray-400 cursor-not-allowed" title="Coming soon">
                <i className="fas fa-video mr-1"></i> Video (coming soon)
              </button>
            </div>
          </div>

          <div className="h-px bg-gray-600/30"></div>

          {/* Contact Information */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <i className="fas fa-info-circle h-4 w-4"></i>
              Contact Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Department:</span>
                <span>{currentContact.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Priority:</span>
                <span className={`px-2 py-1 rounded-lg text-xs ${getPriorityColor(currentContact.priority)}`}>
                  {currentContact.priority}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Platform:</span>
                <span>{currentContact.tags?.[0] || 'Webchat'}</span>
              </div>
              {profile && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span>{profile.email || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phone:</span>
                    <span>{profile.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span>{profile.location || '-'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="h-px bg-gray-600/30"></div>

          {/* Conversation Actions (moved here) */}
          <div>
            <h4 className="font-medium mb-3">Conversation Actions</h4>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <button onClick={markRead} className="w-full px-3 py-2 rounded-lg bg-green-700/30 hover:bg-green-700/40 text-left"><i className="fas fa-check mr-2"></i>Mark Read</button>
              <button onClick={markUnread} className="w-full px-3 py-2 rounded-lg bg-gray-700/40 hover:bg-gray-700/60 text-left"><i className="fas fa-envelope mr-2"></i>Mark Unread</button>
              <button onClick={follow} className="w-full px-3 py-2 rounded-lg bg-yellow-700/30 hover:bg-yellow-700/40 text-left"><i className="fas fa-star mr-2"></i>Follow</button>
              <button onClick={unfollow} className="w-full px-3 py-2 rounded-lg bg-gray-700/40 hover:bg-gray-700/60 text-left"><i className="fas fa-star-half-alt mr-2"></i>Unfollow</button>
              <button onClick={archive} className="w-full px-3 py-2 rounded-lg bg-blue-700/30 hover:bg-blue-700/40 text-left"><i className="fas fa-archive mr-2"></i>Archive</button>
              <button onClick={unarchive} className="w-full px-3 py-2 rounded-lg bg-gray-700/40 hover:bg-gray-700/60 text-left"><i className="fas fa-box-open mr-2"></i>Unarchive</button>
              <button onClick={liveToHuman} className="w-full px-3 py-2 rounded-lg bg-rose-700/30 hover:bg-rose-700/40 text-left"><i className="fas fa-user mr-2"></i>Move to Human</button>
              <button onClick={liveToBot} className="w-full px-3 py-2 rounded-lg bg-indigo-700/30 hover:bg-indigo-700/40 text-left"><i className="fas fa-robot mr-2"></i>Move to Bot</button>
              <button onClick={block} className="w-full px-3 py-2 rounded-lg bg-red-700/30 hover:bg-red-700/40 text-left"><i className="fas fa-ban mr-2"></i>Block</button>
              <button onClick={unblock} className="w-full px-3 py-2 rounded-lg bg-gray-700/40 hover:bg-gray-700/60 text-left"><i className="fas fa-unlock mr-2"></i>Unblock</button>
              <button onClick={assign} className="w-full px-3 py-2 rounded-lg bg-sky-700/30 hover:bg-sky-700/40 text-left"><i className="fas fa-user-plus mr-2"></i>Assign</button>
              <button onClick={unassign} className="w-full px-3 py-2 rounded-lg bg-gray-700/40 hover:bg-gray-700/60 text-left"><i className="fas fa-user-minus mr-2"></i>Unassign</button>
              <button onClick={addNote} className="w-full px-3 py-2 rounded-lg bg-emerald-700/30 hover:bg-emerald-700/40 text-left"><i className="fas fa-sticky-note mr-2"></i>Add Note</button>
              <button onClick={updateNote} className="w-full px-3 py-2 rounded-lg bg-amber-700/30 hover:bg-amber-700/40 text-left"><i className="fas fa-edit mr-2"></i>Update Note</button>
              <button onClick={deleteNote} className="w-full px-3 py-2 rounded-lg bg-red-700/30 hover:bg-red-700/40 text-left"><i className="fas fa-trash mr-2"></i>Delete Note</button>
              <button onClick={requestAiSuggestion} className="w-full px-3 py-2 rounded-lg bg-purple-700/30 hover:bg-purple-700/40 text-left"><i className="fas fa-magic mr-2"></i>AI Suggest</button>
              <button onClick={sendFlow} className="w-full px-3 py-2 rounded-lg bg-blue-700/30 hover:bg-blue-700/40 text-left"><i className="fas fa-project-diagram mr-2"></i>Send Flow</button>
              <button onClick={sendStep} className="w-full px-3 py-2 rounded-lg bg-indigo-700/30 hover:bg-indigo-700/40 text-left"><i className="fas fa-step-forward mr-2"></i>Send Step</button>
              <button onClick={sendProducts} className="w-full px-3 py-2 rounded-lg bg-emerald-700/30 hover:bg-emerald-700/40 text-left"><i className="fas fa-boxes mr-2"></i>Send Products</button>
            </div>
          </div>

          {/* Coming soon group */}
          <div>
            <h4 className="font-medium mb-3 text-gray-300">More Tools</h4>
            <div className="space-y-2 text-xs">
              <button className="w-full px-3 py-2 rounded-lg bg-gray-700/60 text-gray-400 cursor-not-allowed" title="Coming soon"><i className="fas fa-search mr-2"></i>Search in conversation (coming soon)</button>
              <button className="w-full px-3 py-2 rounded-lg bg-gray-700/60 text-gray-400 cursor-not-allowed" title="Coming soon"><i className="fas fa-bell mr-2"></i>Notifications (coming soon)</button>
              <button className="w-full px-3 py-2 rounded-lg bg-gray-700/60 text-gray-400 cursor-not-allowed" title="Coming soon"><i className="fas fa-cog mr-2"></i>Settings (coming soon)</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className="flex items-center gap-3 p-4 rounded-xl glass backdrop-blur-sm shadow-lg animate-fade-in"
          >
            <i className={`fas ${toast.type === 'success' ? 'fa-check-circle text-green-400' : toast.type === 'error' ? 'fa-exclamation-circle text-red-400' : 'fa-info-circle text-blue-400'}`}></i>
            <span className="text-sm font-medium flex-1">{toast.text}</span>
            <button 
              onClick={() => setToasts(arr => arr.filter(t => t.id !== toast.id))}
              className="text-gray-400 hover:text-white"
            >
              <i className="fas fa-times h-3 w-3"></i>
            </button>
          </div>
        ))}
      </div>

      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="fixed bottom-4 left-4 bg-amber-600/20 border border-amber-600/30 text-amber-300 px-4 py-2 rounded-xl text-sm backdrop-blur-sm">
          <i className="fas fa-flask mr-2"></i>
          Demo Mode - Using sample data
        </div>
      )}
    </div>
  );
};

export default App; 