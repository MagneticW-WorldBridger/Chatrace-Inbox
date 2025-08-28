import { FiInbox, FiLoader } from 'react-icons/fi';
import LoadingSpinner from '../common/LoadingSpinner';
import { useState } from 'react';

/**
 * Login Screen component for authentication
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.booting - Whether app is booting
 * @param {Function} props.onLogin - Function to handle login
 * @returns {JSX.Element} Login screen component
 */
const LoginScreen = ({ booting, onLogin }) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleLogin = () => {
    if (!acceptedTerms) {
      return;
    }
    onLogin();
  };

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
            AiprlAssist Inbox
          </h1>
          <p className="text-gray-400 mb-6">Preparing your session...</p>
          
          {/* Loading or Login Button */}
          {booting ? (
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <LoadingSpinner size="sm" color="blue" />
              <span className="ml-2">Auto-auth in progress...</span>
            </div>
          ) : (
            <>
              {/* Privacy Policy & Terms Checkbox */}
              <div className="mb-4 text-left">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    required
                  />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    I have read and agree to the{' '}
                    <a 
                      href="/privacy-policy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Privacy Policy
                    </a>
                    {' '}and{' '}
                    <a 
                      href="/terms-of-service" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Terms of Service
                    </a>
                    . I consent to the collection and use of my information as described.
                  </span>
                </label>
              </div>

              {/* Login Button */}
              <button 
                onClick={handleLogin}
                disabled={!acceptedTerms}
                className={`w-full py-3 px-6 font-medium rounded-xl transition-all duration-200 ${
                  acceptedTerms 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:transform hover:-translate-y-0.5 hover:shadow-lg' 
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                Enter Inbox
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;