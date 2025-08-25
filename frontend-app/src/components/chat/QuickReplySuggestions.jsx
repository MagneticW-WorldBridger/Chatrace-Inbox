import { FiMessageCircle, FiClock, FiCheck } from 'react-icons/fi';

/**
 * Quick Reply Suggestions component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.suggestions - Array of quick reply suggestions
 * @param {Function} props.onSuggestionClick - Function to handle suggestion click
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Quick reply suggestions component
 */
const QuickReplySuggestions = ({ 
  suggestions = [], 
  onSuggestionClick, 
  className = '' 
}) => {
  // Default suggestions if none provided
  const defaultSuggestions = [
    { id: 1, text: 'Hello! How can I help you today?', icon: FiMessageCircle },
    { id: 2, text: 'I\'ll get back to you shortly.', icon: FiClock },
    { id: 3, text: 'Thank you for your message!', icon: FiCheck },
    { id: 4, text: 'Is there anything else I can assist with?', icon: FiMessageCircle }
  ];

  const displaySuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  if (displaySuggestions.length === 0) return null;

  return (
    <div className={`p-4 border-t border-gray-200 bg-gray-50 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {displaySuggestions.map((suggestion) => {
          const Icon = suggestion.icon || FiMessageCircle;
          return (
            <button
              key={suggestion.id}
              onClick={() => onSuggestionClick?.(suggestion.text)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-black"
            >
              <Icon className="w-3 h-3 text-gray-500" />
              <span>{suggestion.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickReplySuggestions;
