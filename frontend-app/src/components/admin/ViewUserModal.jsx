import React from 'react';
import { FiX, FiUser, FiMail, FiShield, FiCalendar, FiClock } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import './ViewUserModal.css';

const ViewUserModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role) => {
    const isAdmin = role?.toLowerCase() === 'admin';
    return (
      <div className={`role-badge ${role?.toLowerCase()}`}>
        {isAdmin ? <FaCrown /> : <FiUser />}
        <span>{role}</span>
      </div>
    );
  };

  const getStatusBadge = (user) => {
    if (!user.active) {
      return <div className="status-badge inactive">Inactive</div>;
    }
    
    if (user.temp_password || user.must_change_password) {
      return <div className="status-badge temp-password">Temporary Password</div>;
    }
    
    return <div className="status-badge active">Active</div>;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container view-user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>User Profile</h2>
          <button className="close-button" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-content">
          <div className="user-profile-header">
            <div className="user-avatar-large">
              {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="user-basic-info">
              <h3>{user.name}</h3>
              <p className="user-email">{user.email}</p>
              <div className="user-badges">
                {getRoleBadge(user.role)}
                {getStatusBadge(user)}
              </div>
            </div>
          </div>

          <div className="user-details-grid">
            <div className="detail-item">
              <div className="detail-label">
                <FiMail />
                <span>Email Address</span>
              </div>
              <div className="detail-value">{user.email}</div>
            </div>

            {user.google_email && user.google_email !== user.email && (
              <div className="detail-item">
                <div className="detail-label">
                  <FiMail />
                  <span>Google Email</span>
                </div>
                <div className="detail-value">{user.google_email}</div>
              </div>
            )}

            <div className="detail-item">
              <div className="detail-label">
                <FiShield />
                <span>Role</span>
              </div>
              <div className="detail-value">{getRoleBadge(user.role)}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <FiCalendar />
                <span>Registered</span>
              </div>
              <div className="detail-value">{formatDate(user.registered_at)}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <FiClock />
                <span>Last Login</span>
              </div>
              <div className="detail-value">{formatDate(user.last_login)}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <FiUser />
                <span>Status</span>
              </div>
              <div className="detail-value">{getStatusBadge(user)}</div>
            </div>
          </div>

          {user.business_name && (
            <div className="business-info">
              <h4>Business Information</h4>
              <div className="detail-item">
                <div className="detail-label">Business</div>
                <div className="detail-value">{user.business_name}</div>
              </div>
              {user.subdomain && (
                <div className="detail-item">
                  <div className="detail-label">Subdomain</div>
                  <div className="detail-value">{user.subdomain}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;
