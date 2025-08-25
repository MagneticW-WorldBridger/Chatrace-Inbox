import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import ProfilePanel from '../profile/ProfilePanel';
import Toast from '../ui/Toast';
import { AGENT_NAME, AGENT_AVATAR_URL } from '../../utils/constants';

/**
 * Main Layout component that orchestrates the entire application
 * 
 * @param {Object} props - Component props
 * @param {Object} props.appState - Application state
 * @param {Object} props.appActions - Application actions
 * @returns {JSX.Element} Main layout component
 */
const MainLayout = ({ appState, appActions }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [mobileView, setMobileView] = useState('chatList'); // 'chatList' | 'chatArea' | 'profile'

  const {
    conversations,
    currentContact,
    messages,
    profile,
    isTyping,
    composer,
    isSending,
    searchText,
    platform,
    counts,
    loading,
    toasts
  } = appState;

  // Handle mobile view changes
  useEffect(() => {
    if (currentContact && mobileView === 'chatList') {
      setMobileView('chatArea');
    }
  }, [currentContact, mobileView]);

  // Handle profile panel open/close for mobile
  useEffect(() => {
    if (profilePanelOpen && mobileView !== 'profile') {
      setMobileView('profile');
    } else if (!profilePanelOpen && mobileView === 'profile') {
      setMobileView('chatArea');
    }
  }, [profilePanelOpen, mobileView]);

  const {
    setSearchText,
    setPlatform,
    setComposer,
    handleContactSelect,
    handleSendMessage,
    handleSwitchAccount,
    handleLogout,
    removeToast,
    ...actionHandlers
  } = appActions;

  const handleProfileClick = () => {
    setProfilePanelOpen(true);
  };

  const handleContactSelectWrapper = async (contact) => {
    await handleContactSelect(contact);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleBackToChatList = () => {
    setMobileView('chatList');
    handleContactSelect(null); // Clear current contact
  };

  const handleBackToChat = () => {
    setMobileView('chatArea');
    setProfilePanelOpen(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-white text-black">
      {/* Mobile: Chat List View */}
      <div className={`md:hidden w-full ${mobileView === 'chatList' ? 'block' : 'hidden'}`}>
        <Sidebar
          isOpen={true}
          onToggle={() => {}} // No toggle on mobile
          conversations={conversations}
          currentContact={currentContact}
          onContactSelect={handleContactSelectWrapper}
          searchState={{
            searchText,
            setSearchText
          }}
          platformState={{
            platform,
            setPlatform,
            counts
          }}
          loading={loading}
          onSwitchAccount={handleSwitchAccount}
          onLogout={handleLogout}
          isMobile={true}
        />
      </div>

      {/* Mobile: Chat Area View */}
      <div className={`md:hidden w-full ${mobileView === 'chatArea' ? 'block' : 'hidden'}`}>
        <ChatArea
          contact={currentContact}
          messages={messages}
          isTyping={isTyping}
          composer={composer}
          onComposerChange={setComposer}
          onSendMessage={handleSendMessage}
          isSending={isSending}
          onProfileClick={handleProfileClick}
          onBackToChatList={handleBackToChatList}
          profilePanelProps={{
            isOpen: profilePanelOpen,
            onClose: () => setProfilePanelOpen(false),
            contact: currentContact,
            profile: profile,
            actions: actionHandlers
          }}
          isMobile={true}
        />
      </div>

      {/* Mobile: Profile Panel View */}
      <div className={`md:hidden w-full ${mobileView === 'profile' ? 'block' : 'hidden'}`}>
        <ProfilePanel
          isOpen={true}
          onClose={handleBackToChat}
          contact={currentContact}
          profile={profile}
          actions={actionHandlers}
          isMobile={true}
        />
      </div>

      {/* Desktop: Side-by-side Layout */}
      <div className="hidden md:flex w-full">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          conversations={conversations}
          currentContact={currentContact}
          onContactSelect={handleContactSelectWrapper}
          searchState={{
            searchText,
            setSearchText
          }}
          platformState={{
            platform,
            setPlatform,
            counts
          }}
          loading={loading}
          onSwitchAccount={handleSwitchAccount}
          onLogout={handleLogout}
          isMobile={false}
        />

        {/* Chat Area */}
        <ChatArea
          contact={currentContact}
          messages={messages}
          isTyping={isTyping}
          composer={composer}
          onComposerChange={setComposer}
          onSendMessage={handleSendMessage}
          isSending={isSending}
          onProfileClick={handleProfileClick}
          profilePanelProps={{
            isOpen: profilePanelOpen,
            onClose: () => setProfilePanelOpen(false),
            contact: currentContact,
            profile: profile,
            actions: actionHandlers
          }}
          isMobile={false}
        />
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            text={toast.text}
            type={toast.type}
            onClose={removeToast}
          />
        ))}
      </div>

      {/* Demo Mode Banner */}
      {appState.demoMode && (
        <div className="fixed bottom-4 left-4 bg-amber-600/20 border border-amber-600/30 text-amber-300 px-4 py-2 rounded-xl text-sm backdrop-blur-sm">
          <span className="mr-2">🧪</span>
          Demo Mode - Using sample data
        </div>
      )}
    </div>
  );
};

export default MainLayout;
