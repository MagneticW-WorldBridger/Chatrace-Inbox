import React, { useState } from 'react';
import AdminPanel from '../admin/AdminPanel';
import LogoutConfirmation from '../common/LogoutConfirmation';
import './UserHeader.css';

const UserHeader = ({ user, onLogout, onChangePassword }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    setShowDropdown(false);
    setShowLogoutConfirmation(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirmation(false);
    onLogout();
  };

  const handleChangePassword = () => {
    setShowDropdown(false);
    onChangePassword();
  };

  const handleAdminPanel = () => {
    setShowDropdown(false);
    setShowAdminPanel(true);
  };

  return (
    <div className="user-header shadow-lg ">
      <div className="user-header-content ">
        <div className="business-info rounded-lg">
          <h1 className="business-name">{user.business_name || 'Inbox'}</h1>
          <span className="business-subdomain">@{user.subdomain}</span>
        </div>
        
        <div className="user-men">
          <div className="user-inf" onClick={handleDropdownToggle}>
            <div className="user-avatar">
              {getInitials(user.name)}
            </div>
            {/* <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
              {(user.temp_password || user.must_change_password) && (
                <span className="temp-password-badge">Temp Password</span>
              )}
            </div> */}
            {/* <svg 
              className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}
              width="12" 
              height="12" 
              viewBox="0 0 12 12"
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg> */}
          </div>

          {/* {showDropdown && (
            <div className="user-dropdown">
              {user.role === 'admin' && (
                <>
                  <button 
                    className="dropdown-item"
                    onClick={handleAdminPanel}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Admin Panel
                  </button>
                  
                  <div className="dropdown-divider"></div>
                </>
              )}
              
              <button 
                className="dropdown-item"
                onClick={handleChangePassword}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11V12z"/>
                </svg>
                Change Password
              </button>
              
              <div className="dropdown-divider"></div>
              
              <button 
                className="dropdown-item logout"
                onClick={handleLogout}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                Logout
              </button>
            </div>
          )} */}
        </div>
      </div>
      
      {/* {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      <LogoutConfirmation
        isOpen={showLogoutConfirmation}
        onClose={() => setShowLogoutConfirmation(false)}
        onConfirm={confirmLogout}
      /> */}
    </div>
  );
};

export default UserHeader;