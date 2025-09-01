import React, { useState } from 'react';
import './CreateUserModal.css';

const CreateUserModal = ({ isOpen, onClose, onCreateUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    tempPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.tempPassword) {
      newErrors.tempPassword = 'Temporary password is required';
    } else {
      const password = formData.tempPassword;
      const passwordErrors = [];
      
      if (password.length < 8) passwordErrors.push('at least 8 characters');
      if (!/[A-Z]/.test(password)) passwordErrors.push('one uppercase letter');
      if (!/[a-z]/.test(password)) passwordErrors.push('one lowercase letter');
      if (!/\d/.test(password)) passwordErrors.push('one number');
      
      if (passwordErrors.length > 0) {
        newErrors.tempPassword = `Password must contain ${passwordErrors.join(', ')}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const result = await onCreateUser(formData);
      
      if (result.success) {
        // Reset form
        setFormData({
          name: '',
          email: '',
          role: 'user',
          tempPassword: ''
        });
        setErrors({});
      }
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
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
    
    setFormData(prev => ({
      ...prev,
      tempPassword: password
    }));
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user',
      tempPassword: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container create-user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New User</h3>
          <button className="close-button" onClick={handleClose} disabled={isLoading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter user's full name"
              className={errors.name ? 'error' : ''}
              disabled={isLoading}
              required
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter user's email address"
              className={errors.email ? 'error' : ''}
              disabled={isLoading}
              required
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tempPassword">Temporary Password *</label>
            <div className="password-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                id="tempPassword"
                name="tempPassword"
                value={formData.tempPassword}
                onChange={handleInputChange}
                placeholder="Enter temporary password"
                className={errors.tempPassword ? 'error' : ''}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
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
            {errors.tempPassword && <span className="error-message">{errors.tempPassword}</span>}
            <div className="password-requirements">
              <p>Password requirements:</p>
              <ul>
                <li className={/[A-Z]/.test(formData.tempPassword) ? 'valid' : ''}>
                  One uppercase letter
                </li>
                <li className={/[a-z]/.test(formData.tempPassword) ? 'valid' : ''}>
                  One lowercase letter
                </li>
                <li className={/\d/.test(formData.tempPassword) ? 'valid' : ''}>
                  One number
                </li>
                <li className={formData.tempPassword.length >= 8 ? 'valid' : ''}>
                  At least 8 characters
                </li>
              </ul>
            </div>
          </div>

          <div className="user-creation-note">
            <p>
              <strong>Note:</strong> The user will be required to change their password on first login.
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
              className={`btn-primary ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;