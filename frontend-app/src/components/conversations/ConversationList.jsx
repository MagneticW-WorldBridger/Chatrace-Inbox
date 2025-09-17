import { useDebounce } from '../../hooks/useDebounce';
import ConversationItem from './ConversationItem';
import { FiInbox } from 'react-icons/fi';
import { DEBOUNCE_DELAY } from '../../utils/constants';
import { useEffect, useRef } from 'react';

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
  searchText,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore = () => {}
}) => {
  const debouncedSearchText = useDebounce(searchText, DEBOUNCE_DELAY);
  const containerRef = useRef(null);

  // Infinite scroll detection
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasMore || isLoadingMore) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      
      if (isNearBottom) {
        console.log('🔄 Near bottom, loading more conversations...');
        onLoadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, onLoadMore]);

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
    <div ref={containerRef} className="p-1 sm:p-2 space-y-1 h-full overflow-y-auto">
      {filteredConversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={currentContact?.id === conversation.id}
          onClick={onContactSelect}
        />
      ))}
      
      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="p-4 text-center text-gray-600">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm">Loading more conversations...</p>
        </div>
      )}
      
      {/* End of list indicator */}
      {!hasMore && filteredConversations.length > 0 && (
        <div className="p-4 text-center text-gray-400">
          <p className="text-sm">No more conversations to load</p>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
