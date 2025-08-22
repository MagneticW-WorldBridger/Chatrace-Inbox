import { getStatusColor } from '../../utils/constants';

/**
 * Reusable Avatar component with optional status indicator
 * 
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text for image
 * @param {string} props.status - User status ('online', 'away', 'offline')
 * @param {string} props.size - Size variant ('sm', 'md', 'lg', 'xl')
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Avatar component
 */
const Avatar = ({ 
  src, 
  alt, 
  status, 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const statusSizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5'
  };

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <img 
        className={`${sizeClasses[size]} rounded-full object-cover`} 
        src={src} 
        alt={alt} 
      />
      {status && (
        <div 
          className={`absolute -bottom-0.5 -right-0.5 ${statusSizeClasses[size]} rounded-full border-2 border-gray-900 ${getStatusColor(status)}`}
        />
      )}
    </div>
  );
};

export default Avatar;
