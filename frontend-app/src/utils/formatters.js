/**
 * Format time to local time string
 * @param {Date|string|number} timestamp - Time to format
 * @returns {string} Formatted time string
 */
export const formatTime = (timestamp) => {
  try {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch {
    return '';
  }
};

/**
 * Format date to relative or absolute date string
 * @param {Date|string|number} timestamp - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString();
  } catch {
    return '';
  }
};

/**
 * Format last seen time to relative string
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted last seen string
 */
export const formatLastSeen = (date) => {
  try {
    const diff = new Date().getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    
    return `${Math.floor(diff / 86400000)}d ago`;
  } catch {
    return '';
  }
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
