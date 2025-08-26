import { FiSearch, FiX } from 'react-icons/fi';

/**
 * Enhanced Search Bar component with icon and clear functionality
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Search input value
 * @param {Function} props.onChange - Function to handle input changes
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Search bar component
 */
const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Search conversations...", 
  className = '' 
}) => {
  return (
    <div className={`relative group ${className}`}>
      {/* Search Icon */}
      <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
      
      {/* Input Field */}
      <input 
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 sm:pl-11 pr-9 sm:pr-10 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-black placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
      />
      
      {/* Clear Button */}
      {value && (
        <button 
          onClick={() => onChange('')}
          className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
        >
          <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
