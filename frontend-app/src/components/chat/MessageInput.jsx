import { FiSend, FiPaperclip, FiSmile, FiX } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { useTextareaResize } from '../../hooks/useTextareaResize';
import { MAX_MESSAGE_LENGTH } from '../../utils/constants';
// Temporarily comment out emoji picker to fix the error
// import { Picker } from 'emoji-mart';

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
  const fileInputRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isSending) {
        onSend(value);
      }
    }
  };

  const handleSend = () => {
    console.log('🔥 MESSAGE INPUT HANDLE SEND - value:', value.trim(), 'isSending:', isSending, 'onSend:', typeof onSend);
    if (value.trim() && !isSending) {
      console.log('🔥 MESSAGE INPUT - CALLING onSend with:', value);
      onSend(value);
    }
  };

  const handleEmojiSelect = (emoji) => {
    // Temporarily use a simple emoji insertion
    onChange(value + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    // TODO: Handle file upload when backend is ready
    console.log('Files selected:', files);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  return (
    <div className={`bg-white border-t border-gray-200 px-4 py-2 sm:py-auto sm:p-6 fixed bottom-0 left-0 right-0 md:relative md:bottom-auto md:left-auto md:right-auto ${className}`}>
      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <span className="text-sm text-gray-700 truncate max-w-32">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Message Input Container - Single Border */}
      <div className="bg-white border border-gray-200 pt-1 px-2 rounded-full shadow-sm">
        <div className="flex items-end gap-2">
          {/* Action Buttons */}
          <div className="flex gap-1">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full hover:bg-gray-100 transition-all text-gray-600 hover:text-black mb-1" 
              title="Attach file"
            >
              <FiPaperclip className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 rounded-full hover:bg-gray-100 transition-all text-gray-600 hover:text-black mb-1" 
              title="Add emoji"
            >
              <FiSmile className="w-6 h-6" />
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          
          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              placeholder="Type your message..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={MAX_MESSAGE_LENGTH}
              className="w-full bg-transparent border-none rounded-lg px-3 py-2 text-sm text-black placeholder-gray-500 focus:outline-none resize-none leading-relaxed"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            
            {/* Character Counter */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
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
            className="p-2 rounded-full bg-none disabled:opacity-50 disabled:cursor-not-allowed text-black transition-all hover:scale-110 mb-2"
          >
            <FiSend className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Emoji Picker - Temporarily using simple emoji buttons */}
      {showEmojiPicker && (
        <div className="absolute bottom-full right-0 mb-2 z-50 emoji-picker-container animate-in slide-in-from-bottom-2 duration-200">
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-4">
            <div className="grid grid-cols-8 gap-2">
              {['😊', '😂', '❤️', '👍', '🎉', '🔥', '💯', '✨', '😍', '🤔', '👏', '🙏', '😎', '🤗', '😴', '🤩'].map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="w-8 h-8 text-lg hover:bg-gray-100 rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
