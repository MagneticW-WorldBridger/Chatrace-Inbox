import React, { useState } from 'react';
import { API_BASE_URL } from '../../utils/constants';
import { FiEye, FiEyeOff, FiInbox } from 'react-icons/fi';

const EmailPasswordLogin = ({ businessId, onLoginSuccess, onError }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      onError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/email-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          businessId: businessId
        })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Store user data and token in localStorage for session management
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('businessId', businessId);
        localStorage.setItem('userToken', data.token); // Store token for API calls

        onLoginSuccess(data.user);
      } else {
        onError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      onError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-100/10 flex">
      {/* Left Section - Illustration */}
      <div className="hidden lg:flex lg:w-2/3 items-center justify-center p-8">
        <div className="text-center text-white">
          {/* 3D Illustration Placeholder */}
          {/* <div className="w-96 h-96 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center mb-8">
            <div className="text-center">
              <FiInbox className="w-24 h-24 mx-auto mb-4 text-white/80" />
              <h3 className="text-2xl font-bold mb-2">AiprlAssist Inbox</h3>
              <p className="text-white/80 text-lg">Your unified messaging platform</p>
            </div>
          </div> */}
          <div className="text absolute mt-10 w-1/2 -ml-10">
            <h2 className="text-3xl font-bold text-black">Welcome Back!</h2>
            <p className='text-xl text-black/90'>to</p>
            <p className='text-2xl font-bold text-black/90'>AiprlAssist Inbox</p>
          </div>
          <img src="/HelloAiprl.svg" alt="" className="w-full h-full" />
          <p className="text-xl text-black/90 mt-10">Signed in to access your conversations</p> 
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full shadow-2xl shadow-grey-500 rounded-3xl my-16 mx-16 lg:w-1/3 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-16 h-14 flex items-center justify-center">
                <img src="/AiprlLogo.png" alt="" className='w-full h-full scale-100' />
              </div>
              <span className="text-3xl font-bold text-gray-900">AiprlAssist</span>
            </div>
          </div>

          {/* Title */}
          {/* <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Sign In</h1> */}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#05a6f4] focus:border-[#05a6f4] outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#05a6f4] focus:border-[#05a6f4] outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#05a6f4] text-white py-3 px-6 rounded-full font-semibold text-lg hover:from-[#e67a00] hover:to-[#0495d9] transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact your administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPasswordLogin;