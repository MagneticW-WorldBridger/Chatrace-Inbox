import { FiX, FiUser, FiInfo, FiSettings, FiFilter, FiChevronRight } from 'react-icons/fi';
import Avatar from '../common/Avatar';
import ContactInfo from './ContactInfo';
import ConversationActions from './ConversationActions';
import { useState, useEffect, useRef } from 'react';

/**
 * Profile Panel component that slides in from left when profile is clicked
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether panel is open
 * @param {Function} props.onClose - Function to close panel
 * @param {Object} props.contact - Contact data
 * @param {Object} props.profile - Profile data
 * @param {Object} props.actions - Action handlers
 * @returns {JSX.Element} Profile panel component
 */
const ProfilePanel = ({ 
  isOpen, 
  onClose, 
  contact, 
  profile, 
  actions = {} 
}) => {
  const [activeTab, setActiveTab] = useState('contact');
  const [showFilter, setShowFilter] = useState(false);
  const panelRef = useRef(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        // Check if click is in the chat area (not in sidebar)
        const chatArea = document.querySelector('.flex-1.flex.flex-col.min-h-0');
        if (chatArea && chatArea.contains(event.target)) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !contact) return null;

  const tabs = [
    { id: 'contact', label: 'Contact Info', icon: FiInfo },
    { id: 'actions', label: 'Conversation Actions', icon: FiSettings }
  ];

  const handleFilterClick = () => {
    setShowFilter(!showFilter);
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setShowFilter(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        ref={panelRef}
        className={`fixed inset-y-0 left-0 w-80 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-black flex items-center gap-2">
              <FiUser className="w-5 h-5" />
              Profile
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleFilterClick}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-black"
                title="Filter"
              >
                <FiFilter className="w-4 h-4" />
              </button>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-black"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Contact Header - WhatsApp Style */}
          <div className="text-center">
            <Avatar 
              src={contact.avatar} 
              alt={contact.name} 
              status={contact.status} 
              size="xl" 
              className="mx-auto mb-4"
            />
            <h3 className="text-lg font-bold text-black mb-1">{contact.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{contact.email || contact.id}</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${contact.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm capitalize text-gray-600">
                {contact.status === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        {showFilter && (
          <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
            <div className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-black">{tab.label}</span>
                    </div>
                    <FiChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        {!showFilter && (
          <div className="flex-shrink-0 flex border-b border-gray-200">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'contact' && (
            <ContactInfo contact={contact} profile={profile} />
          )}
          {activeTab === 'actions' && (
            <ConversationActions actions={actions} />
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePanel;
