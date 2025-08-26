import { FiCheck } from 'react-icons/fi';
import { formatTime } from '../../utils/formatters';
import { IoCheckmarkDoneSharp } from "react-icons/io5";

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
      <div className="max-w-[80%] lg:max-w-[70%]">
        <div className={`rounded-2xl px-4 py-3 text-sm ${
          isOwn 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-black'
        }`}>
          <p className="leading-relaxed whitespace-pre-wrap">{content}</p>
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
