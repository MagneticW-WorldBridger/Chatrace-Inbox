import Avatar from '../common/Avatar';
import { formatTime } from '../../utils/formatters';
import { getPriorityColor } from '../../utils/constants';

/**
 * Individual conversation item component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.conversation - Conversation data
 * @param {boolean} props.isActive - Whether this conversation is currently selected
 * @param {Function} props.onClick - Function to handle conversation selection
 * @returns {JSX.Element} Conversation item component
 */
const ConversationItem = ({ 
  conversation, 
  isActive, 
  onClick 
}) => {
  const {
    id,
    name,
    avatar,
    status,
    lastMessage,
    timestamp,
    unreadCount,
    priority,
    source,
    tags
  } = conversation;

  // Get source icon for conversation preview
  const getSourceIcon = (source) => {
    const icons = {
      'chatrace': '💬',
      'woodstock': '🌲',
      'vapi': '📞', 
      'vapi_rural': '🏪'
    };
    return icons[source] || '💬';
  };

  // Get source from tags or source field
  const conversationSource = source || (tags && tags[0] && tags[0].toLowerCase()) || 'chatrace';
  const sourceIcon = getSourceIcon(conversationSource);

  return (
    <div
      className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-50 mb-1 sm:mb-2 border ${
        isActive 
          ? 'shadow-lg shadow-[#ff8a0e]/40 border-[#ff8a0e]/20' 
          : 'border-transparent hover:shadow-lg hover:shadow-[#05a6f4]/10 hover:border-gray-200'
      }`}
      onClick={() => onClick(conversation)}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Avatar with Status */}
        <Avatar 
          src={avatar} 
          alt={name} 
          status={status} 
          size="md" 
          className="flex-shrink-0"
        />
        
        {/* Conversation Details */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm flex-shrink-0" title={`Source: ${conversationSource}`}>
                {sourceIcon}
              </span>
              <h3 className="font-semibold text-sm text-black truncate">
                {name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
              <span className="text-xs text-gray-600">
                {formatTime(timestamp)}
              </span>
            </div>
          </div>
          
          {/* Last Message */}
          <p className="text-sm text-gray-600 truncate mb-2">
            {lastMessage}
          </p>
          
          {/* Footer Row */}
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${getPriorityColor(priority)}`}>
              {priority}
            </span>
            {unreadCount > 0 && (
              <span className="text-xs font-bold text-blue-600">
                {unreadCount} new
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
