import { FiInbox, FiLoader } from 'react-icons/fi';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Login Screen component for authentication
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.booting - Whether app is booting
 * @param {Function} props.onLogin - Function to handle login
 * @returns {JSX.Element} Login screen component
 */
const LoginScreen = ({ booting, onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          {/* Logo */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6">
            <FiInbox className="w-8 h-8 text-white" />
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            ChatRace Inbox
          </h1>
          <p className="text-gray-400 mb-6">Preparing your session...</p>
          
          {/* Loading or Login Button */}
          {booting ? (
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <LoadingSpinner size="sm" color="blue" />
              <span className="ml-2">Auto-auth in progress...</span>
            </div>
          ) : (
            <button 
              onClick={onLogin} 
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              Enter Inbox
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
