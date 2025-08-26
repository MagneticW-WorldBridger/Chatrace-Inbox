import { FiSend, FiPaperclip, FiSmile } from 'react-icons/fi';
import { useTextareaResize } from '../../hooks/useTextareaResize';
import { MAX_MESSAGE_LENGTH } from '../../utils/constants';

/**
 * Message input component with auto-resize and enhanced features
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Function to handle input changes
 * @param {Function} props.onSend - Function to handle message sending
 * @param {boolean} props.isSending - Whether a message is currently being sent
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Message input component
 */
const MessageInput = ({ 
  value, 
  onChange, 
  onSend, 
  isSending, 
  className = '' 
}) => {
  const textareaRef = useTextareaResize(value, 1);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isSending) {
        onSend(value);
      }
    }
  };

  const handleSend = () => {
    if (value.trim() && !isSending) {
      onSend(value);
    }
  };

  return (
    <div className={`bg-white border-t border-gray-200 p-6 ${className}`}>
      <div className="flex items-end gap-4">
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button 
            className="p-3 rounded-xl hover:bg-gray-100 transition-all text-gray-600 hover:text-black" 
            title="Attach file"
          >
            <FiPaperclip className="w-4 h-4" />
          </button>
          <button 
            className="p-3 rounded-xl hover:bg-gray-100 transition-all text-gray-600 hover:text-black" 
            title="Add emoji"
          >
            <FiSmile className="w-4 h-4" />
          </button>
        </div>
        
        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            placeholder="Type your message..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={MAX_MESSAGE_LENGTH}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 pr-12 text-sm text-black placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none"
            rows="1"
          />
          
          {/* Character Counter */}
          <div className="absolute bottom-3 right-3 text-xs text-gray-600">
            <span className={value.length > 1800 ? 'text-red-600' : ''}>
              {value.length}
            </span>
            /{MAX_MESSAGE_LENGTH}
          </div>
        </div>
        
        {/* Send Button */}
        <button 
          onClick={handleSend}
          disabled={!value.trim() || isSending}
          className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all hover:transform hover:-translate-y-0.5"
        >
          <FiSend className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
