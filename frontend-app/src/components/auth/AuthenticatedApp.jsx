import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import EmailPasswordLogin from './EmailPasswordLogin';
import PasswordChangeModal from './PasswordChangeModal';
import App from '../../App';

const AuthenticatedApp = () => {
  const { user, isLoading, isAuthenticated, businessId, login, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 5000);
  };

  const handleLoginSuccess = (userData) => {
    login(userData);
    
    // Show password change modal if user has temporary password
    if (userData.must_change_password || userData.temp_password) {
      setTimeout(() => {
        setShowPasswordModal(true);
        showNotification('Please change your temporary password', 'warning');
      }, 1000);
    } else {
      showNotification(`Welcome back, ${userData.name}!`, 'success');
    }
  };

  const handleLoginError = (error) => {
    showNotification(error, 'error');
  };

  const handlePasswordChangeSuccess = (message) => {
    showNotification(message, 'success');
  };

  const handlePasswordChangeError = (error) => {
    showNotification(error, 'error');
  };

  const handleLogout = () => {
    logout();
    showNotification('Logged out successfully', 'info');
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <EmailPasswordLogin
          businessId={businessId}
          onLoginSuccess={handleLoginSuccess}
          onError={handleLoginError}
        />
        {notification.message && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
      </>
    );
  }

  // Show main app if authenticated
  return (
    <>
      <App 
        user={user} 
        onLogout={handleLogout}
        onChangePassword={() => setShowPasswordModal(true)}
      />
      
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        user={user}
        businessId={businessId}
        onSuccess={handlePasswordChangeSuccess}
        onError={handlePasswordChangeError}
      />
      
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </>
  );
};

export default AuthenticatedApp;
