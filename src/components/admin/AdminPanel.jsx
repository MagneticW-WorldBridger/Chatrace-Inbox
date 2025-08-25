import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import UserManagement from './UserManagement';
import CreateUserModal from './CreateUserModal';
import ResetPasswordModal from './ResetPasswordModal';
import BulkUserCreation from './BulkUserCreation';
import './AdminPanel.css';

const AdminPanel = ({ onClose }) => {
  const { user, businessId } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 5000);
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken') || 'admin-token'}`,
          'x-business-id': businessId,
          'x-user-email': user.email
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        showNotification('Failed to load users', 'error');
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      showNotification('Error loading users', 'error');
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/admin/pending-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken') || 'admin-token'}`,
          'x-business-id': businessId,
          'x-user-email': user.email
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data.requests || []);
      } else {
        showNotification('Failed to load pending requests', 'error');
      }
    } catch (error) {
      console.error('❌ Error fetching pending requests:', error);
      showNotification('Error loading pending requests', 'error');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchPendingRequests()]);
      setLoading(false);
    };

    loadData();
  }, [businessId, user.email]);

  const handleCreateUser = async (userData) => {
    try {
      const response = await fetch('/api/admin/create-user-with-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken') || 'admin-token'}`,
          'x-business-id': businessId,
          'x-user-email': user.email
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(`User ${userData.email} created successfully!`, 'success');
        setShowCreateModal(false);
        await fetchUsers(); // Refresh users list
        return { success: true };
      } else {
        showNotification(data.error || 'Failed to create user', 'error');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('❌ Error creating user:', error);
      showNotification('Network error creating user', 'error');
      return { success: false, error: 'Network error' };
    }
  };

  const handleResetPassword = async (email, newPassword) => {
    try {
      const response = await fetch('/api/admin/reset-user-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken') || 'admin-token'}`,
          'x-business-id': businessId,
          'x-user-email': user.email
        },
        body: JSON.stringify({ email, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(`Password reset for ${email}`, 'success');
        setShowResetModal(false);
        setSelectedUser(null);
        await fetchUsers(); // Refresh users list
        return { success: true };
      } else {
        showNotification(data.error || 'Failed to reset password', 'error');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('❌ Error resetting password:', error);
      showNotification('Network error resetting password', 'error');
      return { success: false, error: 'Network error' };
    }
  };

  const handleBulkCreate = async (usersData) => {
    const results = [];
    for (const userData of usersData) {
      const result = await handleCreateUser(userData);
      results.push({ ...userData, ...result });
    }
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    showNotification(
      `Bulk creation completed: ${successful} successful, ${failed} failed`,
      failed > 0 ? 'warning' : 'success'
    );
    
    setShowBulkModal(false);
    return results;
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-panel-overlay">
        <div className="admin-panel-container">
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>You need administrator privileges to access this panel.</p>
            <button onClick={onClose} className="btn-primary">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel-overlay" onClick={onClose}>
      <div className="admin-panel-container" onClick={(e) => e.stopPropagation()}>
        <div className="admin-panel-header">
          <h2>Admin Panel - {user.business_name}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="admin-panel-tabs">
          <button 
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users ({users.length})
          </button>
          <button 
            className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Pending Requests ({pendingRequests.length})
          </button>
        </div>

        <div className="admin-panel-content">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading admin data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'users' && (
                <div className="users-tab">
                  <div className="tab-header">
                    <h3>User Management</h3>
                    <div className="tab-actions">
                      <button 
                        className="btn-secondary"
                        onClick={() => setShowBulkModal(true)}
                      >
                        Bulk Create
                      </button>
                      <button 
                        className="btn-primary"
                        onClick={() => setShowCreateModal(true)}
                      >
                        Create User
                      </button>
                    </div>
                  </div>
                  
                  <UserManagement 
                    users={users}
                    onResetPassword={(user) => {
                      setSelectedUser(user);
                      setShowResetModal(true);
                    }}
                    onRefresh={fetchUsers}
                  />
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="requests-tab">
                  <div className="tab-header">
                    <h3>Pending Access Requests</h3>
                  </div>
                  
                  {pendingRequests.length === 0 ? (
                    <div className="empty-state">
                      <p>No pending access requests</p>
                    </div>
                  ) : (
                    <div className="requests-list">
                      {pendingRequests.map(request => (
                        <div key={request.id} className="request-item">
                          <div className="request-info">
                            <h4>{request.email}</h4>
                            <p>Requested: {new Date(request.requested_at).toLocaleDateString()}</p>
                          </div>
                          <div className="request-actions">
                            <button className="btn-success">Approve</button>
                            <button className="btn-danger">Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modals */}
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateUser={handleCreateUser}
        />

        <ResetPasswordModal
          isOpen={showResetModal}
          onClose={() => {
            setShowResetModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onResetPassword={handleResetPassword}
        />

        <BulkUserCreation
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          onBulkCreate={handleBulkCreate}
        />

        {/* Notification */}
        {notification.message && (
          <div className={`admin-notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
