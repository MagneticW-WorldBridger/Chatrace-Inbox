/**
 * Reusable Loading Spinner component
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Size variant ('sm', 'md', 'lg')
 * @param {string} props.color - Color variant ('blue', 'white', 'gray')
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Loading spinner component
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const colorClasses = {
    blue: 'bg-blue-400',
    white: 'bg-white',
    gray: 'bg-gray-400'
  };

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <div 
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}
        style={{ animationDelay: '0ms' }}
      />
      <div 
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}
        style={{ animationDelay: '100ms' }}
      />
      <div 
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}
        style={{ animationDelay: '200ms' }}
      />
    </div>
  );
};

export default LoadingSpinner;
