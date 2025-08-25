import React, { useState } from 'react';
import './BulkUserCreation.css';

const BulkUserCreation = ({ isOpen, onClose, onBulkCreate }) => {
  const [users, setUsers] = useState([
    { name: '', email: '', role: 'user', tempPassword: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const addUser = () => {
    setUsers([...users, { name: '', email: '', role: 'user', tempPassword: '' }]);
  };

  const removeUser = (index) => {
    if (users.length > 1) {
      const newUsers = users.filter((_, i) => i !== index);
      setUsers(newUsers);
      
      // Clean up errors for removed user
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const updateUser = (index, field, value) => {
    const newUsers = [...users];
    newUsers[index][field] = value;
    setUsers(newUsers);

    // Clear error when user starts typing
    if (errors[`${index}.${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}.${field}`];
      setErrors(newErrors);
    }
  };

  const generatePasswordForUser = (index) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    
    // Ensure at least one of each required character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    
    // Fill the rest randomly
    for (let i = 3; i < 12; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    updateUser(index, 'tempPassword', password);
  };

  const generateAllPasswords = () => {
    users.forEach((_, index) => {
      generatePasswordForUser(index);
    });
  };

  const validateForm = () => {
    const newErrors = {};

    users.forEach((user, index) => {
      if (!user.name.trim()) {
        newErrors[`${index}.name`] = 'Name is required';
      }

      if (!user.email.trim()) {
        newErrors[`${index}.email`] = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        newErrors[`${index}.email`] = 'Invalid email format';
      }

      if (!user.tempPassword) {
        newErrors[`${index}.tempPassword`] = 'Password is required';
      } else {
        const password = user.tempPassword;
        const passwordErrors = [];
        
        if (password.length < 8) passwordErrors.push('8+ chars');
        if (!/[A-Z]/.test(password)) passwordErrors.push('uppercase');
        if (!/[a-z]/.test(password)) passwordErrors.push('lowercase');
        if (!/\d/.test(password)) passwordErrors.push('number');
        
        if (passwordErrors.length > 0) {
          newErrors[`${index}.tempPassword`] = `Missing: ${passwordErrors.join(', ')}`;
        }
      }
    });

    // Check for duplicate emails
    const emails = users.map(u => u.email.toLowerCase()).filter(e => e);
    const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
    
    if (duplicates.length > 0) {
      users.forEach((user, index) => {
        if (duplicates.includes(user.email.toLowerCase())) {
          newErrors[`${index}.email`] = 'Duplicate email';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      await onBulkCreate(users);
      
      // Reset form on success
      setUsers([{ name: '', email: '', role: 'user', tempPassword: '' }]);
      setErrors({});
    } catch (error) {
      console.error('Error in bulk creation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUsers([{ name: '', email: '', role: 'user', tempPassword: '' }]);
    setErrors({});
    onClose();
  };

  const loadFromCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const newUsers = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const user = { name: '', email: '', role: 'user', tempPassword: '' };
          
          headers.forEach((header, index) => {
            if (header === 'name' && values[index]) user.name = values[index];
            if (header === 'email' && values[index]) user.email = values[index];
            if (header === 'role' && values[index]) user.role = values[index];
            if (header === 'password' && values[index]) user.tempPassword = values[index];
          });
          
          if (user.name && user.email) {
            newUsers.push(user);
          }
        }
        
        if (newUsers.length > 0) {
          setUsers(newUsers);
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container bulk-creation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Bulk User Creation</h3>
          <button className="close-button" onClick={handleClose} disabled={isLoading}>
            ×
          </button>
        </div>

        <div className="bulk-controls">
          <div className="csv-upload">
            <label htmlFor="csv-file" className="btn-secondary">
              📁 Load from CSV
            </label>
            <input
              type="file"
              id="csv-file"
              accept=".csv"
              onChange={loadFromCSV}
              style={{ display: 'none' }}
              disabled={isLoading}
            />
            <small>CSV format: name,email,role,password</small>
          </div>
          
          <button
            type="button"
            onClick={generateAllPasswords}
            className="btn-secondary"
            disabled={isLoading}
          >
            🎲 Generate All Passwords
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bulk-form">
          <div className="users-list">
            {users.map((user, index) => (
              <div key={index} className="user-row">
                <div className="user-row-header">
                  <h4>User {index + 1}</h4>
                  {users.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUser(index)}
                      className="remove-user"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  )}
                </div>
                
                <div className="user-fields">
                  <div className="field-group">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={user.name}
                      onChange={(e) => updateUser(index, 'name', e.target.value)}
                      className={errors[`${index}.name`] ? 'error' : ''}
                      disabled={isLoading}
                    />
                    {errors[`${index}.name`] && (
                      <span className="error-message">{errors[`${index}.name`]}</span>
                    )}
                  </div>
                  
                  <div className="field-group">
                    <input
                      type="email"
                      placeholder="Email Address *"
                      value={user.email}
                      onChange={(e) => updateUser(index, 'email', e.target.value)}
                      className={errors[`${index}.email`] ? 'error' : ''}
                      disabled={isLoading}
                    />
                    {errors[`${index}.email`] && (
                      <span className="error-message">{errors[`${index}.email`]}</span>
                    )}
                  </div>
                  
                  <div className="field-group">
                    <select
                      value={user.role}
                      onChange={(e) => updateUser(index, 'role', e.target.value)}
                      disabled={isLoading}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                    </select>
                  </div>
                  
                  <div className="field-group password-field">
                    <div className="password-input-group">
                      <input
                        type="password"
                        placeholder="Temporary Password *"
                        value={user.tempPassword}
                        onChange={(e) => updateUser(index, 'tempPassword', e.target.value)}
                        className={errors[`${index}.tempPassword`] ? 'error' : ''}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => generatePasswordForUser(index)}
                        className="generate-password"
                        disabled={isLoading}
                        title="Generate password"
                      >
                        🎲
                      </button>
                    </div>
                    {errors[`${index}.tempPassword`] && (
                      <span className="error-message">{errors[`${index}.tempPassword`]}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addUser}
            className="add-user-btn"
            disabled={isLoading}
          >
            + Add Another User
          </button>

          <div className="bulk-summary">
            <p>Ready to create {users.length} user{users.length !== 1 ? 's' : ''}</p>
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
                  Creating Users...
                </>
              ) : (
                `Create ${users.length} User${users.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkUserCreation;
