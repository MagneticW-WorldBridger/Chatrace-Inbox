// API Configuration
export const API_BASE_URL = ''; // Empty to use relative URLs with Vite proxy
export const BUSINESS_ID = import.meta.env.VITE_BUSINESS_ID;

// Agent Configuration
export const AGENT_NAME = 'AiPRL Assist';
export const AGENT_AVATAR_URL = '/AI%20AIPRL%20modern.png';

// Platform Configuration
export const PLATFORMS = {
  WEBCHAT: 'webchat',
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook'
};

// Platform to Channel Mapping
export const getChannelForPlatform = (platform) => {
  switch (platform) {
    case PLATFORMS.INSTAGRAM:
      return 10;
    case PLATFORMS.FACEBOOK:
      return 0;
    default:
      return 9; // webchat
  }
};

// Status Colors
export const getStatusColor = (status) => {
  switch (status) {
    case 'online':
      return 'bg-green-500 shadow-green-500/50';
    case 'away':
      return 'bg-yellow-500 shadow-yellow-500/50';
    case 'offline':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
};

// Priority Colors
export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// UI Constants
export const SIDEBAR_MIN_WIDTH = 200;
export const SIDEBAR_MAX_WIDTH = 600;
export const SIDEBAR_DEFAULT_WIDTH = 320;

// Message Constants
export const MAX_MESSAGE_LENGTH = 2000;
export const DEBOUNCE_DELAY = 300;

// Animation Durations
export const TRANSITION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};
