import React, { useState, useEffect } from 'react';
import './ResetPasswordModal.css';

const ResetPasswordModal = ({ isOpen, onClose, user, onResetPassword }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      setShowPasswords(false);
    }
  }, [isOpen, user]);

  const validateForm = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const passwordErrors = [];
      
      if (newPassword.length < 8) passwordErrors.push('at least 8 characters');
      if (!/[A-Z]/.test(newPassword)) passwordErrors.push('one uppercase letter');
      if (!/[a-z]/.test(newPassword)) passwordErrors.push('one lowercase letter');
      if (!/\d/.test(newPassword)) passwordErrors.push('one number');
      
      if (passwordErrors.length > 0) {
        newErrors.newPassword = `Password must contain ${passwordErrors.join(', ')}`;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm the password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      await onResetPassword(user.email, newPassword);
    } catch (error) {
      console.error('Error resetting password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    
    // Ensure at least one of each required character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
    
    // Fill the rest randomly
    for (let i = 3; i < 12; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setNewPassword(password);
    setConfirmPassword(password);
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container reset-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Reset Password</h3>
          <button className="close-button" onClick={handleClose} disabled={isLoading}>
            ×
          </button>
        </div>

        <div className="user-info-section">
          <div className="user-avatar-large">
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div className="user-details">
            <h4>{user.name}</h4>
            <p>{user.email}</p>
            <span className={`role-badge ${user.role}`}>{user.role}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="newPassword">New Password *</label>
            <div className="password-input-group">
              <input
                type={showPasswords ? 'text' : 'password'}
                id="newPassword"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) {
                    setErrors(prev => ({ ...prev, newPassword: null }));
                  }
                }}
                placeholder="Enter new password"
                className={errors.newPassword ? 'error' : ''}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPasswords(!showPasswords)}
                disabled={isLoading}
              >
                {showPasswords ? '👁️' : '👁️‍🗨️'}
              </button>
              <button
                type="button"
                className="generate-password"
                onClick={generateRandomPassword}
                disabled={isLoading}
                title="Generate random password"
              >
                🎲
              </button>
            </div>
            {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password *</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors(prev => ({ ...prev, confirmPassword: null }));
                }
              }}
              placeholder="Confirm new password"
              className={errors.confirmPassword ? 'error' : ''}
              disabled={isLoading}
              required
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <div className="password-requirements">
            <p>Password requirements:</p>
            <ul>
              <li className={/[A-Z]/.test(newPassword) ? 'valid' : ''}>
                One uppercase letter
              </li>
              <li className={/[a-z]/.test(newPassword) ? 'valid' : ''}>
                One lowercase letter
              </li>
              <li className={/\d/.test(newPassword) ? 'valid' : ''}>
                One number
              </li>
              <li className={newPassword.length >= 8 ? 'valid' : ''}>
                At least 8 characters
              </li>
            </ul>
          </div>

          <div className="reset-warning">
            <p>
              <strong>⚠️ Warning:</strong> This will immediately reset the user's password. 
              They will be required to change it on their next login.
            </p>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn-danger ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
