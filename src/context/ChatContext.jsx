import { createContext, useContext, useReducer, useCallback } from 'react';

// Initial state
const initialState = {
  conversations: [],
  currentContact: null,
  messages: [],
  profile: null,
  isLoggedIn: false,
  userToken: null,
  demoMode: false,
  loading: false,
  platform: 'webchat',
  counts: { all: 0, webchat: 0, instagram: 0, facebook: 0 },
  composer: '',
  isSending: false,
  toasts: [],
  searchText: '',
  currentFilter: 'all',
  isTyping: false,
  sidebarOpen: false,
  debugMode: true,
  booting: true
};

// Action types
const ACTIONS = {
  SET_CONVERSATIONS: 'SET_CONVERSATIONS',
  SET_CURRENT_CONTACT: 'SET_CURRENT_CONTACT',
  SET_MESSAGES: 'SET_MESSAGES',
  SET_PROFILE: 'SET_PROFILE',
  SET_LOGGED_IN: 'SET_LOGGED_IN',
  SET_USER_TOKEN: 'SET_USER_TOKEN',
  SET_DEMO_MODE: 'SET_DEMO_MODE',
  SET_LOADING: 'SET_LOADING',
  SET_PLATFORM: 'SET_PLATFORM',
  SET_COUNTS: 'SET_COUNTS',
  SET_COMPOSER: 'SET_COMPOSER',
  SET_SENDING: 'SET_SENDING',
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  SET_SEARCH_TEXT: 'SET_SEARCH_TEXT',
  SET_CURRENT_FILTER: 'SET_CURRENT_FILTER',
  SET_TYPING: 'SET_TYPING',
  SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
  SET_DEBUG_MODE: 'SET_DEBUG_MODE',
  SET_BOOTING: 'SET_BOOTING'
};

// Reducer function
const chatReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_CONVERSATIONS:
      return { ...state, conversations: action.payload };
    case ACTIONS.SET_CURRENT_CONTACT:
      return { ...state, currentContact: action.payload };
    case ACTIONS.SET_MESSAGES:
      return { ...state, messages: action.payload };
    case ACTIONS.SET_PROFILE:
      return { ...state, profile: action.payload };
    case ACTIONS.SET_LOGGED_IN:
      return { ...state, isLoggedIn: action.payload };
    case ACTIONS.SET_USER_TOKEN:
      return { ...state, userToken: action.payload };
    case ACTIONS.SET_DEMO_MODE:
      return { ...state, demoMode: action.payload };
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_PLATFORM:
      return { ...state, platform: action.payload };
    case ACTIONS.SET_COUNTS:
      return { ...state, counts: action.payload };
    case ACTIONS.SET_COMPOSER:
      return { ...state, composer: action.payload };
    case ACTIONS.SET_SENDING:
      return { ...state, isSending: action.payload };
    case ACTIONS.ADD_TOAST:
      return { ...state, toasts: [...state.toasts, action.payload] };
    case ACTIONS.REMOVE_TOAST:
      return { ...state, toasts: state.toasts.filter(toast => toast.id !== action.payload) };
    case ACTIONS.SET_SEARCH_TEXT:
      return { ...state, searchText: action.payload };
    case ACTIONS.SET_CURRENT_FILTER:
      return { ...state, currentFilter: action.payload };
    case ACTIONS.SET_TYPING:
      return { ...state, isTyping: action.payload };
    case ACTIONS.SET_SIDEBAR_OPEN:
      return { ...state, sidebarOpen: action.payload };
    case ACTIONS.SET_DEBUG_MODE:
      return { ...state, debugMode: action.payload };
    case ACTIONS.SET_BOOTING:
      return { ...state, booting: action.payload };
    default:
      return state;
  }
};

// Create context
const ChatContext = createContext();

// Provider component
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Action creators
  const setConversations = useCallback((conversations) => {
    dispatch({ type: ACTIONS.SET_CONVERSATIONS, payload: conversations });
  }, []);

  const setCurrentContact = useCallback((contact) => {
    dispatch({ type: ACTIONS.SET_CURRENT_CONTACT, payload: contact });
  }, []);

  const setMessages = useCallback((messages) => {
    dispatch({ type: ACTIONS.SET_MESSAGES, payload: messages });
  }, []);

  const setProfile = useCallback((profile) => {
    dispatch({ type: ACTIONS.SET_PROFILE, payload: profile });
  }, []);

  const setLoggedIn = useCallback((isLoggedIn) => {
    dispatch({ type: ACTIONS.SET_LOGGED_IN, payload: isLoggedIn });
  }, []);

  const setUserToken = useCallback((token) => {
    dispatch({ type: ACTIONS.SET_USER_TOKEN, payload: token });
  }, []);

  const setDemoMode = useCallback((demoMode) => {
    dispatch({ type: ACTIONS.SET_DEMO_MODE, payload: demoMode });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
  }, []);

  const setPlatform = useCallback((platform) => {
    dispatch({ type: ACTIONS.SET_PLATFORM, payload: platform });
  }, []);

  const setCounts = useCallback((counts) => {
    dispatch({ type: ACTIONS.SET_COUNTS, payload: counts });
  }, []);

  const setComposer = useCallback((composer) => {
    dispatch({ type: ACTIONS.SET_COMPOSER, payload: composer });
  }, []);

  const setSending = useCallback((isSending) => {
    dispatch({ type: ACTIONS.SET_SENDING, payload: isSending });
  }, []);

  const addToast = useCallback((text, type = 'info') => {
    const id = Date.now() + Math.random();
    dispatch({ type: ACTIONS.ADD_TOAST, payload: { id, text, type } });
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      dispatch({ type: ACTIONS.REMOVE_TOAST, payload: id });
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: ACTIONS.REMOVE_TOAST, payload: id });
  }, []);

  const setSearchText = useCallback((searchText) => {
    dispatch({ type: ACTIONS.SET_SEARCH_TEXT, payload: searchText });
  }, []);

  const setCurrentFilter = useCallback((filter) => {
    dispatch({ type: ACTIONS.SET_CURRENT_FILTER, payload: filter });
  }, []);

  const setTyping = useCallback((isTyping) => {
    dispatch({ type: ACTIONS.SET_TYPING, payload: isTyping });
  }, []);

  const setSidebarOpen = useCallback((open) => {
    dispatch({ type: ACTIONS.SET_SIDEBAR_OPEN, payload: open });
  }, []);

  const setDebugMode = useCallback((debugMode) => {
    dispatch({ type: ACTIONS.SET_DEBUG_MODE, payload: debugMode });
  }, []);

  const setBooting = useCallback((booting) => {
    dispatch({ type: ACTIONS.SET_BOOTING, payload: booting });
  }, []);

  const value = {
    ...state,
    setConversations,
    setCurrentContact,
    setMessages,
    setProfile,
    setLoggedIn,
    setUserToken,
    setDemoMode,
    setLoading,
    setPlatform,
    setCounts,
    setComposer,
    setSending,
    addToast,
    removeToast,
    setSearchText,
    setCurrentFilter,
    setTyping,
    setSidebarOpen,
    setDebugMode,
    setBooting
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use the context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
