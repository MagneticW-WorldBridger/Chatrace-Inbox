import { FiCheck } from 'react-icons/fi';
import { formatTime } from '../../utils/formatters';
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import CallRecordingPlayer from './CallRecordingPlayer';

/**
 * Individual message bubble component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.message - Message data
 * @param {Object} props.contact - Contact data for avatar
 * @param {string} props.agentAvatar - Agent avatar URL
 * @param {boolean} props.isOwn - Whether this is the agent's message
 * @returns {JSX.Element} Message bubble component
 */
const MessageBubble = ({ 
  message, 
  contact, 
  agentAvatar, 
  isOwn 
}) => {
  const { content, timestamp, status } = message;
  
  // Check if this is a call recording message - FIXED FOR SYSTEM ROLE
  const isCallRecording = (
    // Direct call indicators
    message.message_type === 'call' ||
    (message.function_data && message.function_data.call_id) ||
    (message.function_data && message.function_data.recording_url) ||
    (message.function_data && message.function_data.call_duration && message.function_data.call_duration > 0) ||
    // CRITICAL: System role messages are VAPI calls
    (message.role === 'system' || message.message_role === 'system') ||
    // Content pattern detection for Rural King calls
    content.includes('📞 VAPI Call') ||
    content.includes('🎵 Recording:') ||
    content.includes('📞 Phone call') ||
    // Rural King specific patterns
    content.includes('AI: Hi, this is Rural King') ||
    (content.length > 200 && content.includes('User:') && content.includes('AI:')) ||
    // VAPI call status patterns
    content.includes('VAPI Call - No transcript available')
  );
  
  console.log('🔍 Call Detection:', {
    content: content.substring(0, 50),
    isCallRecording,
    message_type: message.message_type,
    has_call_id: !!(message.function_data && message.function_data.call_id),
    content_patterns: {
      vapi_call: content.includes('📞 VAPI Call'),
      rural_king_ai: content.includes('AI: Hi, this is Rural King'),
      long_conversation: content.length > 200 && content.includes('User:') && content.includes('AI:')
    }
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'read':
        return <IoCheckmarkDoneSharp className="w-3 h-3 text-blue-600" />;
      case 'delivered':
        return <IoCheckmarkDoneSharp className="w-3 h-3 text-gray-600" />;
      case 'sent':
        return <FiCheck className="w-3 h-3 text-gray-600" />;
      default:
        return null;
    }
  };

  // Render call recording player for call messages
  if (isCallRecording) {
    return (
      <div className={`flex gap-4 ${isOwn ? 'justify-end' : 'justify-start'} items-start`}>
        {/* Contact Avatar (for received messages) */}
        {!isOwn && (
          <img 
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" 
            src={contact?.avatar} 
            alt={contact?.name} 
          />
        )}
        
        {/* Call Recording Player */}
        <div className="max-w-[85%] sm:max-w-[90%] lg:max-w-[80%] min-w-0">
          <CallRecordingPlayer
            recordingUrl={message.function_data?.recording_url}
            transcript={message.function_data?.transcript || message.function_data?.message_content || content}
            summary={message.function_data?.call_summary || message.function_data?.summary}
            duration={message.function_data?.call_duration || message.function_data?.duration_seconds}
            callId={message.function_data?.call_id}
            orderContext={{
              order_number: message.function_data?.order_context || message.function_data?.order_number,
              store_name: message.function_data?.store_context || message.function_data?.store_name,
              order_status: message.function_data?.order_status
            }}
            customerName={contact?.name || message.function_data?.customer_name}
            isOwn={isOwn}
          />
          
          {/* Message Meta for Call */}
          <div className={`flex items-center gap-2 mt-2 text-xs text-gray-600 ${
            isOwn ? 'justify-end' : 'justify-start'
          }`}>
            <span>{formatTime(timestamp)}</span>
            {isOwn && status && getStatusIcon(status)}
          </div>
        </div>
        
        {/* Agent Avatar (for sent messages) */}
        {isOwn && (
          <img 
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" 
            src={agentAvatar} 
            alt="Agent" 
          />
        )}
      </div>
    );
  }

  // Standard message bubble for non-call messages
  return (
    <div className={`flex gap-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {/* Contact Avatar (for received messages) */}
      {!isOwn && (
        <img 
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" 
          src={contact?.avatar} 
          alt={contact?.name} 
        />
      )}
      
      {/* Message Content */}
      <div className="max-w-[75%] sm:max-w-[80%] lg:max-w-[70%] min-w-0">
        <div className={`rounded-2xl px-4 py-3 text-sm break-words ${
          isOwn 
            ? 'bg-[#05a6f4]/80 text-white' 
            : 'bg-gray-100 text-black'
        }`}>
          <p className="leading-relaxed whitespace-pre-wrap break-words">{content}</p>
        </div>
        
        {/* Message Meta */}
        <div className={`flex items-center gap-2 mt-1 text-xs text-gray-600 ${
          isOwn ? 'justify-end' : 'justify-start'
        }`}>
          <span>{formatTime(timestamp)}</span>
          {isOwn && status && getStatusIcon(status)}
        </div>
      </div>
      
      {/* Agent Avatar (for sent messages) */}
      {isOwn && (
        <img 
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" 
          src={agentAvatar} 
          alt="Agent" 
        />
      )}
    </div>
  );
};

export default MessageBubble;