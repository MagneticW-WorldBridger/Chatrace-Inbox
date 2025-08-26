import { FiCheckCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';
import { useEffect } from 'react';

/**
 * Toast notification component
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Unique toast ID
 * @param {string} props.text - Toast message
 * @param {string} props.type - Toast type ('success', 'error', 'info', 'warning')
 * @param {Function} props.onClose - Function to close toast
 * @param {number} props.duration - Auto-close duration in ms (default: 3000)
 * @returns {JSX.Element} Toast component
 */
const Toast = ({ 
  id, 
  text, 
  type = 'info', 
  onClose, 
  duration = 3000 
}) => {
  // Auto-close toast after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const iconMap = {
    success: FiCheckCircle,
    error: FiXCircle,
    info: FiInfo,
    warning: FiInfo
  };

  const colorMap = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-blue-400',
    warning: 'text-yellow-400'
  };

  const Icon = iconMap[type];

  return (
    <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-lg animate-fade-in">
      <Icon className={`w-5 h-5 ${colorMap[type]}`} />
      <span className="text-sm font-medium text-black flex-1">{text}</span>
      <button 
        onClick={() => onClose(id)}
        className="text-gray-600 hover:text-black transition-colors"
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
