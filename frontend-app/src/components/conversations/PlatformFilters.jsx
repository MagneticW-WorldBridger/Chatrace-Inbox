import { FiMessageCircle, FiInstagram, FiFacebook } from 'react-icons/fi';
import { PLATFORMS } from '../../utils/constants';

/**
 * Platform Filters component with click-to-change functionality
 * 
 * @param {Object} props - Component props
 * @param {string} props.currentPlatform - Currently selected platform
 * @param {Function} props.onPlatformChange - Function to handle platform changes
 * @param {Object} props.counts - Platform conversation counts
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Platform filters component
 */
const PlatformFilters = ({ 
  currentPlatform, 
  onPlatformChange, 
  counts = {}, 
  className = '' 
}) => {
  const platforms = [
    { 
      id: 'all', 
      icon: () => <span style={{fontSize: '16px'}}>📊</span>, 
      label: 'All', 
      count: counts.all || 0 
    },
    { 
      id: PLATFORMS.WEBCHAT, 
      icon: FiMessageCircle, 
      label: 'Webchat', 
      count: counts.webchat || counts.chatrace || 0 
    },
    { 
      id: PLATFORMS.INSTAGRAM, 
      icon: FiInstagram, 
      label: 'Instagram', 
      count: counts.instagram || 0 
    },
    { 
      id: PLATFORMS.FACEBOOK, 
      icon: FiFacebook, 
      label: 'Facebook', 
      count: counts.facebook || 0 
    },
    { 
      id: 'woodstock', 
      icon: () => <span style={{fontSize: '16px'}}>🌾</span>, 
      label: 'Woodstock', 
      count: counts.woodstock || 0 
    },
    { 
      id: PLATFORMS.RURAL_KING, 
      icon: () => <span style={{fontSize: '16px'}}>🏪</span>, 
      label: 'Rural King', 
      count: counts.rural_king || counts.vapi_rural || 0 
    },
    { 
      id: 'sms', 
      icon: () => <span style={{fontSize: '16px'}}>💬</span>, 
      label: 'SMS Only', 
      count: counts.sms || 0 
    },
    { 
      id: 'calls', 
      icon: () => <span style={{fontSize: '16px'}}>📞</span>, 
      label: 'Calls Only', 
      count: counts.calls || 0 
    }
  ];

  return (
    <div className={`overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${className}`}>
      <div className="flex items-center gap-2 min-w-max pb-1">
        {platforms.map(platform => {
          const Icon = platform.icon;
          const isActive = currentPlatform === platform.id;
          
          return (
            <button
              key={platform.id}
              onClick={() => {
                onPlatformChange(platform.id);
              }}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 flex-shrink-0 ${
                isActive
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="whitespace-nowrap">{platform.label}</span>
              <span className="text-xs opacity-70 whitespace-nowrap">({platform.count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformFilters;
