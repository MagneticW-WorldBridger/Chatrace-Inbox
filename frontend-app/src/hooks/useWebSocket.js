import { useEffect, useRef, useState, useCallback } from 'react';
import { API_BASE_URL } from '../utils/constants';

/**
 * Custom hook for ChatRace WebSocket connection
 * Based on the original inbox.js implementation
 */
export const useWebSocket = ({ 
  isLoggedIn, 
  userToken, 
  currentContact, 
  onMessageReceived,
  onConnectionChange 
}) => {
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const reconnectTimer = useRef(null);
  const triedToConnect = useRef(0);

  // WebSocket configuration - obtained from whitelabel API
  const [wsUrl, setWsUrl] = useState(null);
  const BUSINESS_ID = import.meta.env.VITE_BUSINESS_ID || '1145545';
  const USER_ID = '1000026757'; // From .env

  // Keep stable refs for callbacks to avoid effect re-runs
  const onMsgRef = useRef(onMessageReceived);
  const onConnRef = useRef(onConnectionChange);
  useEffect(() => { onMsgRef.current = onMessageReceived; }, [onMessageReceived]);
  useEffect(() => { onConnRef.current = onConnectionChange; }, [onConnectionChange]);

  // Obtener información del whitelabel
  const getWhitelabelInfo = useCallback(async () => {
    try {
      console.log('🔍 Obteniendo información del whitelabel...');
      const response = await fetch(`${API_BASE_URL}/api/whitelabel`);
      const data = await response.json();
      
      if (data.status === 'OK' && data.data.wsurl) {
        console.log('✅ WebSocket URL obtenida:', data.data.wsurl);
        setWsUrl(data.data.wsurl);
        return data.data.wsurl;
      } else {
        console.error('❌ Error obteniendo whitelabel:', data);
        return null;
      }
    } catch (error) {
      console.error('❌ Error en getWhitelabelInfo:', error);
      return null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!isLoggedIn || !userToken || !wsUrl) return;
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) return;

    setIsConnecting(true);
    try {
      console.log('🔌 Conectando a WebSocket:', wsUrl);
      const socket = new WebSocket(wsUrl);
      ws.current = socket;

      socket.onopen = () => {
        console.log('🔌 WebSocket conectado');
        triedToConnect.current = 0;
        setIsConnected(true);
        setIsConnecting(false);
        onConnRef.current?.(true);

        const authMessage = {
          action: 'authenticate',
          data: { platform: 'web', account_id: BUSINESS_ID, user_id: USER_ID, token: userToken }
        };
        console.log('🔑 Enviando autenticación:', authMessage);
        socket.send(JSON.stringify(authMessage));

        if (currentContact?.id) {
          const subscribeMessage = {
            action: -1,
            data: { dir: 0, from: USER_ID, channel: currentContact.channel || 9, page_id: BUSINESS_ID, ms_id: currentContact.id, hash: currentContact.hash || '' }
          };
          console.log('📱 Suscribiéndose a conversación:', subscribeMessage);
          socket.send(JSON.stringify(subscribeMessage));
        }
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📥 Mensaje WebSocket recibido:', message);
          onMsgRef.current?.(message);
        } catch (error) {
          console.error('❌ Error procesando mensaje WebSocket:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('❌ Error WebSocket:', error);
      };

      socket.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        setIsConnected(false);
        setIsConnecting(false);
        onConnRef.current?.(false);

        triedToConnect.current++;
        if (triedToConnect.current < 3) {
          console.log(`🔄 Reintentando en 5 segundos (intento ${triedToConnect.current})...`);
          reconnectTimer.current = setTimeout(() => connect(), 5000);
        }
      };
    } catch (error) {
      console.error('❌ Error creando WebSocket:', error);
      setIsConnecting(false);
    }
  }, [isLoggedIn, userToken, wsUrl, currentContact?.id]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const sendMessage = useCallback((messageText, contactId, channel = 9) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket no está conectado');
      return false;
    }

    const messagePayload = {
      action: 0,
      data: {
        platform: "web",
        dir: 0,
        account_id: BUSINESS_ID,
        contact_id: contactId,
        user_id: USER_ID,
        token: userToken,
        fromInbox: true,
        channel: channel,
        from: USER_ID,
        hash: '', // TODO: obtener hash del contacto
        timestamp: Date.now().toString(),
        message: [{
          type: "text",
          text: messageText,
          dir: 0,
          channel: channel,
          from: USER_ID,
          replyingTo: null
        }]
      }
    };

    console.log('📤 Enviando mensaje via WebSocket:', messagePayload);
    ws.current.send(JSON.stringify(messagePayload));
    return true;
  }, [userToken]);

  // Obtener whitelabel info una vez y luego conectar WebSocket
  useEffect(() => {
    if (!isLoggedIn || !userToken) return;

    console.log('🚀 Usuario logueado, obteniendo whitelabel info y conectando WebSocket...');
    let cancelled = false;

    (async () => {
      const info = await getWhitelabelInfo();
      if (cancelled) return;
      if (info) {
        setWsUrl(info);
      }
    })();

    return () => { cancelled = true; };
  }, [isLoggedIn, userToken, getWhitelabelInfo]);

  // Conectar cuando wsUrl esté listo
  useEffect(() => {
    if (!isLoggedIn || !userToken || !wsUrl) return;
    connect();
    return () => {
      if (reconnectTimer.current) { clearTimeout(reconnectTimer.current); reconnectTimer.current = null; }
      if (ws.current) { ws.current.close(); ws.current = null; }
      setIsConnected(false);
      setIsConnecting(false);
    };
  }, [isLoggedIn, userToken, wsUrl, connect]);

  // Suscribirse a conversación cuando cambie el contacto
  useEffect(() => {
    if (isConnected && currentContact?.id && ws.current?.readyState === WebSocket.OPEN) {
      const subscribeMessage = {
        action: -1,
        data: {
          dir: 0,
          from: USER_ID,
          channel: currentContact.channel || 9,
          page_id: BUSINESS_ID,
          ms_id: currentContact.id,
          hash: currentContact.hash || ''
        }
      };
      
      console.log('📱 Cambiando suscripción a conversación:', subscribeMessage);
      ws.current.send(JSON.stringify(subscribeMessage));
    }
  }, [isConnected, currentContact?.id]);

  return {
    isConnected,
    isConnecting,
    sendMessage,
    connect,
    disconnect
  };
};
