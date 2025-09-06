import React, { useState, useEffect } from 'react';
import UserManagement from './UserManagement';
import CreateUserModal from './CreateUserModal';
import ResetPasswordModal from './ResetPasswordModal';
import BulkUserCreation from './BulkUserCreation';
import ViewUserModal from './ViewUserModal';
import EditUserModal from './EditUserModal';
import ConfirmationModal from './ConfirmationModal';
import { API_BASE_URL } from '../../utils/constants';
import './AdminPanel.css';

const AdminPanel = ({ onClose, user }) => {
  // Get businessId from environment or user data
  const businessId = import.meta.env.VITE_BUSINESS_ID || '1145545';
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
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
      const userToken = localStorage.getItem('userToken');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmail = storedUser.email || user?.email || 'admin@woodstock.com';
      
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'x-business-id': businessId,
          'x-user-email': userEmail,
          'X-ACCESS-TOKEN': userToken
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      } else {
        showNotification(`Failed to load users: ${data.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      showNotification('Error loading users: ' + error.message, 'error');
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const userToken = localStorage.getItem('userToken');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmail = storedUser.email || user?.email || 'admin@woodstock.com';
      
      const response = await fetch(`${API_BASE_URL}/api/admin/pending-requests`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'x-business-id': businessId,
          'x-user-email': userEmail,
          'X-ACCESS-TOKEN': userToken
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
          'x-user-email': JSON.parse(localStorage.getItem('user') || '{}').email || 'admin@woodstock.com'
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
          'x-user-email': JSON.parse(localStorage.getItem('user') || '{}').email || 'admin@woodstock.com'
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

  const handleViewUser = async (selectedUser) => {
    // Open modal immediately with basic user data
    setSelectedUser(selectedUser);
    setShowViewModal(true);
    
    // Try to fetch more detailed user data from API
    try {
      const userToken = localStorage.getItem('userToken');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmail = storedUser.email || user?.email || 'admin@woodstock.com';
      
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${selectedUser.id}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'x-business-id': businessId,
          'x-user-email': userEmail,
          'X-ACCESS-TOKEN': userToken
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Update with more detailed user data from API
        setSelectedUser(data.user);
      }
    } catch (error) {
      console.error('❌ Error fetching user details:', error);
    }
  };

  const handleEditUser = (selectedUser) => {
    setSelectedUser(selectedUser);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      const userToken = localStorage.getItem('userToken');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmail = storedUser.email || user?.email || 'admin@woodstock.com';
      
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'x-business-id': businessId,
          'x-user-email': userEmail,
          'X-ACCESS-TOKEN': userToken
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        showNotification('User updated successfully', 'success');
        setShowEditModal(false);
        setSelectedUser(null);
        await fetchUsers();
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to update user', 'error');
      }
    } catch (error) {
      console.error('❌ Error updating user:', error);
      showNotification('Error updating user', 'error');
    }
  };

  const handleToggleUserStatus = (selectedUser, active) => {
    // Show confirmation modal instead of window.confirm
    setSelectedUser(selectedUser);
    setConfirmationAction(active ? 'activate' : 'deactivate');
    setShowConfirmationModal(true);
  };

  const handleConfirmToggleStatus = async (selectedUser, active) => {
    try {
      const userToken = localStorage.getItem('userToken');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmail = storedUser.email || user?.email || 'admin@woodstock.com';
      
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${selectedUser.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'x-business-id': businessId,
          'x-user-email': userEmail,
          'X-ACCESS-TOKEN': userToken
        },
        body: JSON.stringify({ active })
      });

      const data = await response.json();

      if (response.ok) {
        const action = active ? 'activated' : 'deactivated';
        showNotification(`User ${action} successfully`, 'success');
        await fetchUsers();
        setShowConfirmationModal(false);
        setSelectedUser(null);
        setConfirmationAction(null);
      } else {
        showNotification(`Failed to update user status: ${data.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      showNotification('Error updating user status: ' + error.message, 'error');
    }
  };

  // Allow access with token-based auth
  const isAdmin = true;
  
  if (!isAdmin) {
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
          <h2 className="">Woodstock Furniture <br/> Admin Panel</h2>
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
                        className="btn-secondary shadow-sm shadow-[#05a6f4]"
                        onClick={() => setShowBulkModal(true)}
                      >
                        Bulk Create
                      </button>
                      <button 
                        className="btn-primary shadow-2xl"
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
                    onViewUser={handleViewUser}
                    onEditUser={handleEditUser}
                    onToggleUserStatus={handleToggleUserStatus}
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

        <ViewUserModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />

        <EditUserModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onUpdateUser={handleUpdateUser}
        />

        <ConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => {
            setShowConfirmationModal(false);
            setSelectedUser(null);
            setConfirmationAction(null);
          }}
          onConfirm={handleConfirmToggleStatus}
          user={selectedUser}
          action={confirmationAction}
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
