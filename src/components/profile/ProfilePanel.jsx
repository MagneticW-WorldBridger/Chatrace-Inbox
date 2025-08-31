import { FiX, FiUser, FiInfo, FiSettings, FiFilter, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
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
    { id: 'actions', label: 'Actions', icon: FiSettings }
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
        className={`fixed inset-y-0 right-0 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out flex flex-col w-full sm:w-1/2 md:w-1/3 lg:w-1/4 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-black"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-black flex items-center gap-2">
                <FiUser className="w-5 h-5" />
                Profile
              </h3>
            </div>
            {/* <button 
              onClick={handleFilterClick}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-black"
              title="Filter"
            >
              <FiFilter className="w-4 h-4" />
            </button> */}
          </div>
          
          {/* Contact Header - WhatsApp Style */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={contact.avatar} 
                alt={contact.name} 
                className="w-16 h-16 rounded-full object-cover"
              />
              {/* <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" /> */}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-black mb-1">{contact.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{contact.email || contact.id}</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-600">Online</span>
              </div>
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
                      ? 'text-[#05a6f4] border-b-2 border-[#05a6f4]'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
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
