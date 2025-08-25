import { useState, useEffect } from 'react';
import { FiInbox, FiBell, FiRefreshCw, FiSettings, FiLogOut, FiMenu, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
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
  onLogout,
  isMobile = false
}) => {
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [showAgentStatus, setShowAgentStatus] = useState(false);
  const { width, handleMouseDown } = useResizable({
    minWidth: 350,
    maxWidth: 550,
    defaultWidth: 350
  });

  // Close dropdowns when clicking outside (mobile only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActionDropdown && !event.target.closest('.action-dropdown')) {
        setShowActionDropdown(false);
      }
    };

    // Only add listener on mobile
    if (window.innerWidth < 768) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActionDropdown]);

  return (
    <>
      {/* Mobile Menu Button - Only show on desktop */}
      {!isMobile && (
        <button 
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 md:hidden p-3 rounded-xl bg-white/90 backdrop-blur-sm text-gray-900 shadow-lg"
        >
          <FiMenu className="w-5 h-5" />
        </button>
      )}

      {/* Sidebar */}
      <div 
        className={`${
          isMobile 
            ? 'relative w-full h-full bg-white' 
            : 'fixed md:relative inset-y-0 left-0 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out flex flex-col'
        } ${
          isMobile ? '' : (isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0')
        }`}
        style={isMobile ? {} : { width: `${width}px` }}
      >
        {/* Header - Fully Fixed at Top */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200 bg-white fixed top-0 left-0 right-0 z-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <img src="/AiprlLogo.png" alt="AiprlAssist" className="w-full h-full object-cover" />
              </div>
              <div className="text">
              <h2 className="text-lg font-bold text-black truncate">
                AiprlAssist
              </h2>
              <h2 className="text-sm text-black truncate">
                Inbox
              </h2>
              </div>
            </div>
            {/* Mobile: Action Dropdown */}
            <div className="relative flex-shrink-0 action-dropdown md:hidden">
              <button 
                onClick={() => setShowActionDropdown(!showActionDropdown)}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-black"
                title="More actions"
              >
                <FiChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${showActionDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Action Dropdown */}
              {showActionDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-48 animate-in slide-in-from-top-2 duration-200">
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={onSwitchAccount}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left text-sm"
                    >
                      <FiRefreshCw className="w-4 h-4 text-gray-600" />
                      <span className="text-black">Switch Account</span>
                    </button>
                    <button 
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left text-sm"
                    >
                      <FiBell className="w-4 h-4 text-gray-600" />
                      <span className="text-black">Notifications</span>
                    </button>
                    <button 
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left text-sm"
                    >
                      <FiSettings className="w-4 h-4 text-gray-600" />
                      <span className="text-black">Settings</span>
                    </button>
                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left text-sm"
                    >
                      <FiLogOut className="w-4 h-4 text-gray-600" />
                      <span className="text-black">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop: Individual Action Buttons */}
            <div className="hidden md:flex items-center gap-1 sm:gap-0.5 flex-shrink-0">
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
            className="mb-4 rounded-full"
          />

          {/* Platform Filters - No Background */}
          <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <PlatformFilters 
              currentPlatform={platformState.platform}
              onPlatformChange={platformState.setPlatform}
              counts={platformState.counts}
            />
          </div>
        </div>

        {/* Conversations List - Account for Fixed Header */}
        <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mt-[6rem]">
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
        
        {/* Mobile: Agent Status - Fixed at Bottom with Full Width Overlay */}
        <div className="flex-shrink-0 relative md:hidden">
          {/* Toggle Button - Fixed Bottom Center */}
          <button 
            onClick={() => setShowAgentStatus(!showAgentStatus)}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all hover:scale-110 z-50 flex items-center justify-center"
          >
            <FiChevronUp className={`w-5 h-5 transition-transform ${showAgentStatus ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Full Width Overlay */}
          {showAgentStatus && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setShowAgentStatus(false)}
              />
              
              {/* Agent Status Panel - Full Width */}
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 rounded-t-2xl shadow-2xl p-6 animate-in slide-in-from-bottom-2 duration-300 z-50">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      className="w-12 h-12 rounded-full object-cover" 
                      src={AGENT_AVATAR_URL} 
                      alt={AGENT_NAME} 
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 shadow-green-500/50" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-black">{AGENT_NAME}</p>
                    <p className="text-sm text-gray-600">Online • Ready to help</p>
                  </div>
                  <button 
                    onClick={() => setShowAgentStatus(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-black"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Desktop: Agent Status - Always Visible */}
        <div className="hidden md:block flex-shrink-0 p-4 border-t border-gray-200">
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

        {/* Resize Handle - Only on desktop */}
        {!isMobile && (
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400/50 transition-colors z-10"
            onMouseDown={handleMouseDown}
          />
        )}
      </div>

      {/* Mobile Overlay - Only on desktop */}
      {!isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;
