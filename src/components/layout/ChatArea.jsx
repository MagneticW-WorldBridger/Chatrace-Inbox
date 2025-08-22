import { FiPhone, FiVideo, FiSearch, FiMoreVertical, FiArrowDown } from 'react-icons/fi';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import MessageBubble from '../chat/MessageBubble';
import MessageInput from '../chat/MessageInput';
import QuickReplySuggestions from '../chat/QuickReplySuggestions';
import LoadingSpinner from '../common/LoadingSpinner';
import { AGENT_NAME, AGENT_AVATAR_URL } from '../../utils/constants';
import { formatLastSeen } from '../../utils/formatters';

/**
 * Chat Area component with header, messages, and input
 * 
 * @param {Object} props - Component props
 * @param {Object} props.contact - Current contact data
 * @param {Array} props.messages - Array of messages
 * @param {boolean} props.isTyping - Whether contact is typing
 * @param {string} props.composer - Message input value
 * @param {Function} props.onComposerChange - Function to handle composer changes
 * @param {Function} props.onSendMessage - Function to send message
 * @param {boolean} props.isSending - Whether message is being sent
 * @param {Function} props.onProfileClick - Function to handle profile click
 * @returns {JSX.Element} Chat area component
 */
const ChatArea = ({
  contact,
  messages,
  isTyping,
  composer,
  onComposerChange,
  onSendMessage,
  isSending,
  onProfileClick
}) => {
  const {
    scrollRef,
    isAtBottom,
    scrollToBottom,
    disableAutoScroll
  } = useAutoScroll({
    smooth: true,
    content: [...(Array.isArray(messages) ? messages : []), isTyping]
  });

  const handleSuggestionClick = (suggestionText) => {
    onComposerChange(suggestionText);
  };

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiSearch className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-black">Select a conversation</h3>
          <p className="text-sm">Choose a conversation from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Chat Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                className="w-12 h-12 rounded-full object-cover" 
                src={contact.avatar} 
                alt={contact.name} 
              />
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-gray-900 ${
                contact.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>
            <div className="flex-1">
              <button 
                onClick={onProfileClick}
                className="text-left hover:opacity-80 transition-opacity"
              >
                <h2 className="text-lg font-bold text-black">{contact.name}</h2>
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  {contact.status === 'online' 
                    ? 'Online now' 
                    : `Last seen ${formatLastSeen(contact.timestamp)}`
                  }
                </span>
                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                <span>{contact.department}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-3 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed hover:bg-gray-200 transition-colors" title="Phone (coming soon)">
              <FiPhone className="w-4 h-4" />
            </button>
            <button className="p-3 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed hover:bg-gray-200 transition-colors" title="Video (coming soon)">
              <FiVideo className="w-4 h-4" />
            </button>
            <button className="p-3 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed hover:bg-gray-200 transition-colors" title="Search (coming soon)">
              <FiSearch className="w-4 h-4" />
            </button>
            <button className="p-3 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed hover:bg-gray-200 transition-colors" title="More (coming soon)">
              <FiMoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 relative min-h-0">
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto p-6 pb-28"
          onWheel={disableAutoScroll}
          onTouchMove={disableAutoScroll}
        >
          <div className="space-y-4 min-h-full flex flex-col justify-end">
            {(Array.isArray(messages) ? messages : []).map((message, index) => (
              <MessageBubble
                key={`${message.id}-${index}-${message.timestamp}`}
                message={message}
                contact={contact}
                agentAvatar={AGENT_AVATAR_URL}
                isOwn={message.isOwn}
              />
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-4 justify-start">
                <img 
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" 
                  src={contact.avatar} 
                  alt={contact.name} 
                />
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <LoadingSpinner size="sm" color="gray" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scroll to Bottom Button */}
        {!isAtBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-all text-black"
          >
            <FiArrowDown className="w-4 h-4 mr-2 inline" />
            New messages
          </button>
        )}
      </div>

      {/* Quick Reply Suggestions */}
      <QuickReplySuggestions onSuggestionClick={handleSuggestionClick} />

      {/* Message Input */}
      <MessageInput
        value={composer}
        onChange={onComposerChange}
        onSend={onSendMessage}
        isSending={isSending}
      />
    </div>
  );
};

export default ChatArea;
