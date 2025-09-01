import React, { useState, useEffect, useRef } from 'react';
import { 
  FiUser, 
  FiMoreVertical, 
  FiEdit3, 
  FiEye, 
  FiUserX, 
  FiUserCheck,
  FiCalendar,
  FiClock,
  FiShield,
  FiAlertCircle
} from 'react-icons/fi';
import { FaCrown } from "react-icons/fa";
import './UserManagement.css';

const UserManagement = ({ users, onResetPassword, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const actionMenuRef = useRef(null);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setActiveActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'registered_at' || sortBy === 'last_login') {
      aValue = new Date(aValue || 0);
      bValue = new Date(bValue || 0);
    }
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatRelativeTime = (dateString) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const formatExactTime = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role) => {
    const isAdmin = role.toLowerCase() === 'admin';
    return (
      <div className={`role-badge-modern ${role.toLowerCase()}`}>
        <span className="role-icon">
          {isAdmin ? <FaCrown /> : <FiUser />}
        </span>
        <span className="role-text">{role}</span>
      </div>
    );
  };

  const getStatusBadge = (user) => {
    if (!user.active) {
      return (
        <div className="status-chip inactive" title="User account is deactivated">
          <span className="status-dot"></span>
          <span className="status-text">Inactive</span>
        </div>
      );
    }
    
    if (user.temp_password || user.must_change_password) {
      return (
        <div className="status-chip temp-password" title="Temporary password expires in 24h">
          <span className="status-dot pulsing"></span>
          <span className="status-text">Temp Password</span>
        </div>
      );
    }
    
    return (
      <div className="status-chip active" title="User account is active and verified">
        <span className="status-dot glowing"></span>
        <span className="status-text">Active</span>
      </div>
    );
  };

  const getLastLoginStatus = (user) => {
    if (!user.last_login) {
      return (
        <div className="last-login-never">
          <span className="never-text">Never</span>
        </div>
      );
    }

    const lastLogin = new Date(user.last_login);
    const now = new Date();
    const diffInHours = (now - lastLogin) / (1000 * 60 * 60);
    
    return (
      <div className="last-login-status">
        <div className="time-display">
          <FiClock className="time-icon" />
          <span className="relative-time">{formatRelativeTime(user.last_login)}</span>
        </div>
        <div className="exact-time" title={formatExactTime(user.last_login)}>
          {formatExactTime(user.last_login)}
        </div>
        {diffInHours < 24 && (
          <span className="online-indicator" title="Online within last 24 hours"></span>
        )}
      </div>
    );
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const toggleActionMenu = (userId) => {
    setActiveActionMenu(activeActionMenu === userId ? null : userId);
  };

  const closeActionMenu = () => {
    setActiveActionMenu(null);
  };

  return (
    <div className="user-management">
      <div className="user-management-controls">
        <div className="search-container flex gap-3 rounded-2xl">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={onRefresh} className="btn-refresh-mobile hidden">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          </button>
        </div>
        
        <button onClick={onRefresh} className="btn-refresh">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          Refresh
        </button>
      </div>

      {sortedUsers.length === 0 ? (
        <div className="empty-state">
          <p>No users found</p>
        </div>
      ) : (
        <div className="users-table-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="users-table" style={{ minWidth: '950px' }}>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable">
                  Name
                  {sortBy === 'name' && (
                    <span className="sort-indicator">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('email')} className="sortable">
                  Email
                  {sortBy === 'email' && (
                    <span className="sort-indicator">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('role')} className="sortable">
                  Role
                  {sortBy === 'role' && (
                    <span className="sort-indicator">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th>Status</th>
                <th onClick={() => handleSort('registered_at')} className="sortable">
                  Registered
                  {sortBy === 'registered_at' && (
                    <span className="sort-indicator">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('last_login')} className="sortable">
                  Last Login
                  {sortBy === 'last_login' && (
                    <span className="sort-indicator">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar-small">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{getStatusBadge(user)}</td>
                  <td>
                    <div className="registered-time">
                      <div className="time-display">
                        <FiCalendar className="time-icon" />
                        <span className="relative-time">{formatRelativeTime(user.registered_at)}</span>
                      </div>
                      <div className="exact-time" title={formatExactTime(user.registered_at)}>
                        {formatExactTime(user.registered_at)}
                      </div>
                    </div>
                  </td>
                  <td>{getLastLoginStatus(user)}</td>
                  <td>
                    <div className="user-actions-modern" ref={actionMenuRef}>
                      <button
                        className="action-menu-trigger"
                        onClick={() => toggleActionMenu(user.id)}
                        title="More actions"
                      >
                        <FiMoreVertical />
                      </button>
                      
                      {activeActionMenu === user.id && (
                        <div className="action-menu-dropdown">
                          <button 
                            className="action-menu-item view"
                            onClick={() => {
                              // Handle view user
                              closeActionMenu();
                            }}
                          >
                            <FiEye />
                            <span>View Profile</span>
                          </button>
                          
                          <button 
                            className="action-menu-item edit"
                            onClick={() => {
                              // Handle edit user
                              closeActionMenu();
                            }}
                          >
                            <FiEdit3 />
                            <span>Edit User</span>
                          </button>
                          
                          <button 
                            className="action-menu-item reset"
                            onClick={() => {
                              onResetPassword(user);
                              closeActionMenu();
                            }}
                          >
                            <FiShield />
                            <span>Reset Password</span>
                          </button>
                          
                          {user.active ? (
                            <button 
                              className="action-menu-item deactivate"
                              onClick={() => {
                                // Handle deactivate user
                                closeActionMenu();
                              }}
                            >
                              <FiUserX />
                              <span>Deactivate</span>
                            </button>
                          ) : (
                            <button 
                              className="action-menu-item activate"
                              onClick={() => {
                                // Handle activate user
                                closeActionMenu();
                              }}
                            >
                              <FiUserCheck />
                              <span>Activate</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="users-summary">
        <p>Showing {sortedUsers.length} of {sortedUsers.length} users</p>
      </div>
    </div>
  );
};

export default UserManagement;