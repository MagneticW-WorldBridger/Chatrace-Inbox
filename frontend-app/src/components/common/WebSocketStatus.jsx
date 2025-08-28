import { useChat } from '../../context/ChatContext';
import { useState, useEffect } from 'react';

/**
 * Indicador visual del estado de conexión WebSocket
 */
const WebSocketStatus = () => {
  const { wsConnected, wsConnecting } = useChat();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide the component after 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg ${
        wsConnected 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : wsConnecting 
            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          wsConnected 
            ? 'bg-green-500 animate-pulse' 
            : wsConnecting 
              ? 'bg-yellow-500 animate-spin'
              : 'bg-red-500'
        }`} />
        <span className="text-xs font-medium">
          {wsConnected ? 'WebSocket Conectado' : wsConnecting ? 'Conectando...' : 'WebSocket Desconectado'}
        </span>
      </div>
    </div>
  );
};

export default WebSocketStatus;