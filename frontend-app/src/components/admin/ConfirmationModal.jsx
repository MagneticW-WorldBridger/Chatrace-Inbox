import React from 'react';
import { FiX, FiAlertTriangle, FiUser, FiUserX, FiUserCheck } from 'react-icons/fi';
import './ConfirmationModal.css';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  user, 
  action = 'deactivate',
  isLoading = false 
}) => {
  if (!isOpen || !user) return null;

  const isDeactivate = action === 'deactivate';
  const isActivate = action === 'activate';
  const isDelete = action === 'delete';

  const getActionConfig = () => {
    if (isDeactivate) {
      return {
        title: 'Deactivate User',
        message: 'Are you sure you want to deactivate this user?',
        details: 'The user will lose access to the system but their data will be preserved.',
        confirmText: 'Deactivate User',
        confirmClass: 'btn-danger',
        icon: <FiUserX />,
        iconClass: 'warning-icon'
      };
    }
    
    if (isActivate) {
      return {
        title: 'Activate User',
        message: 'Are you sure you want to activate this user?',
        details: 'The user will regain full access to the system.',
        confirmText: 'Activate User',
        confirmClass: 'btn-success',
        icon: <FiUserCheck />,
        iconClass: 'success-icon'
      };
    }
    
    if (isDelete) {
      return {
        title: 'Delete User',
        message: 'Are you sure you want to permanently delete this user?',
        details: 'This action cannot be undone. All user data will be permanently removed.',
        confirmText: 'Delete User',
        confirmClass: 'btn-danger',
        icon: <FiAlertTriangle />,
        iconClass: 'danger-icon'
      };
    }
  };

  const config = getActionConfig();

  const handleConfirm = () => {
    onConfirm(user, isActivate);
  };

  return (
    <div className="modal-overlay confirmation-modal-overlay" onClick={onClose}>
      <div className="modal-container confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-header">
          <div className={`confirmation-icon ${config.iconClass}`}>
            {config.icon}
          </div>
          <h2>{config.title}</h2>
          <button className="close-button" onClick={onClose} disabled={isLoading}>
            <FiX />
          </button>
        </div>

        <div className="confirmation-content">
          <div className="user-info-card">
            <div className="user-avatar">
              {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="user-details">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <span className={`role-badge ${user.role}`}>{user.role}</span>
            </div>
          </div>

          <div className="confirmation-message">
            <p className="main-message">{config.message}</p>
            <p className="details-message">{config.details}</p>
          </div>

          {isDelete && (
            <div className="warning-box">
              <FiAlertTriangle />
              <p><strong>Warning:</strong> This action is irreversible and will permanently delete all user data.</p>
            </div>
          )}
        </div>

        <div className="confirmation-footer">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className={`${config.confirmClass} ${isLoading ? 'loading' : ''}`}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              config.confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;



