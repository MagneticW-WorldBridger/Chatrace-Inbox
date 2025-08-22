import { useState } from 'react';
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-white text-black">
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
      />

      {/* Profile Panel */}
      <ProfilePanel
        isOpen={profilePanelOpen}
        onClose={() => setProfilePanelOpen(false)}
        contact={currentContact}
        profile={profile}
        actions={actionHandlers}
      />

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
