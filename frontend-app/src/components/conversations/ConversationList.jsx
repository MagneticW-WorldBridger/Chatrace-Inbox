import { useDebounce } from '../../hooks/useDebounce';
import ConversationItem from './ConversationItem';
import { FiInbox } from 'react-icons/fi';
import { DEBOUNCE_DELAY } from '../../utils/constants';

/**
 * Conversation List component with search and filtering
 * 
 * @param {Object} props - Component props
 * @param {Array} props.conversations - Array of conversations
 * @param {Object} props.currentContact - Currently selected contact
 * @param {Function} props.onContactSelect - Function to handle contact selection
 * @param {string} props.searchText - Search text for filtering
 * @returns {JSX.Element} Conversation list component
 */
const ConversationList = ({ 
  conversations, 
  currentContact, 
  onContactSelect, 
  searchText 
}) => {
  const debouncedSearchText = useDebounce(searchText, DEBOUNCE_DELAY);

  // Filter conversations based on search text
  const filteredConversations = conversations.filter(conversation => {
    if (!debouncedSearchText.trim()) return true;
    
    const searchTerm = debouncedSearchText.toLowerCase();
    return (
      (conversation.name || '').toLowerCase().includes(searchTerm) ||
      (conversation.email || '').toLowerCase().includes(searchTerm) ||
      (conversation.lastMessage || '').toLowerCase().includes(searchTerm)
    );
  });

  if (filteredConversations.length === 0) {
    return (
      <div className="p-4 sm:p-6 text-center h-screen text-gray-600">
        <FiInbox className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
        <p className="text-base sm:text-lg font-medium mb-2">
          {searchText ? 'No conversations found' : 'No conversations'}
        </p>
        <p className="text-xs sm:text-sm">
          {searchText 
            ? 'Try adjusting your search terms' 
            : 'Start a conversation to see it here'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="p-1 sm:p-2 space-y-1">
      {filteredConversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={currentContact?.id === conversation.id}
          onClick={onContactSelect}
        />
      ))}
    </div>
  );
};

export default ConversationList;
