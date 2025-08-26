import { FiInbox, FiBell, FiRefreshCw, FiSettings, FiLogOut, FiMenu } from 'react-icons/fi';
import { useResizable } from '../../hooks/useResizable';
import SearchBar from '../conversations/SearchBar';
import PlatformFilters from '../conversations/PlatformFilters';
import ConversationList from '../conversations/ConversationList';
import LoadingSpinner from '../common/LoadingSpinner';
import { AGENT_NAME, AGENT_AVATAR_URL } from '../../utils/constants';

/**
 * Main Sidebar component with resizable functionality
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether sidebar is open (mobile)
 * @param {Function} props.onToggle - Function to toggle sidebar
 * @param {Object} props.conversations - Conversations data
 * @param {Object} props.currentContact - Currently selected contact
 * @param {Function} props.onContactSelect - Function to handle contact selection
 * @param {Object} props.searchState - Search state and handlers
 * @param {Object} props.platformState - Platform state and handlers
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onSwitchAccount - Function to switch account
 * @param {Function} props.onLogout - Function to logout
 * @returns {JSX.Element} Sidebar component
 */
const Sidebar = ({
  isOpen,
  onToggle,
  conversations,
  currentContact,
  onContactSelect,
  searchState,
  platformState,
  loading,
  onSwitchAccount,
  onLogout
}) => {
  const { width, handleMouseDown } = useResizable({
    minWidth: 280,
    maxWidth: 500,
    defaultWidth: 320
  });

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 md:hidden p-3 rounded-xl bg-white/90 backdrop-blur-sm text-gray-900 shadow-lg"
      >
        <FiMenu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <div 
        className={`fixed md:relative inset-y-0 left-0 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ width: `${width}px` }}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiInbox className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-black truncate">
                Inbox
              </h2>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button 
                onClick={onSwitchAccount}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-black"
                title="Switch account"
              >
                <FiRefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button 
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-black"
                title="Notifications"
              >
                <FiBell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button 
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-black"
                title="Settings"
              >
                <FiSettings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button 
                onClick={onLogout}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-black"
                title="Logout"
              >
                <FiLogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <SearchBar 
            value={searchState.searchText}
            onChange={searchState.setSearchText}
            className="mb-4"
          />

          {/* Platform Filters */}
          <div className="overflow-x-auto">
            <PlatformFilters 
              currentPlatform={platformState.platform}
              onPlatformChange={platformState.setPlatform}
              counts={platformState.counts}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <LoadingSpinner size="md" color="blue" />
              <span className="ml-2 text-gray-600">Loading conversations...</span>
            </div>
          ) : (
            <ConversationList 
              conversations={conversations}
              currentContact={currentContact}
              onContactSelect={onContactSelect}
              searchText={searchState.searchText}
            />
          )}
        </div>
        
        {/* Agent Status */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                className="w-8 h-8 rounded-full object-cover" 
                src={AGENT_AVATAR_URL} 
                alt={AGENT_NAME} 
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 shadow-green-500/50" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-black">{AGENT_NAME}</p>
              <p className="text-xs text-gray-600">Online • Ready to help</p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-black">
              <FiMenu className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400/50 transition-colors z-10"
          onMouseDown={handleMouseDown}
        />
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;
