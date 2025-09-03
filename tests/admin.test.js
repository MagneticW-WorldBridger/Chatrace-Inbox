/**
 * Admin Endpoints Test Suite
 * TEST FIRST APPROACH - These tests define the expected behavior before implementation
 */

import request from 'supertest';
import { jest } from '@jest/globals';

// Mock the auth module
jest.mock('../backend/auth.js', () => ({
  initializeAuth: jest.fn(),
  requireAdmin: jest.fn((req, res, next) => {
    // Mock admin user for tests
    req.user = {
      id: 1,
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'admin',
      business_id: '1145545'
    };
    req.businessId = '1145545';
    next();
  }),
  getAuthorizedUsers: jest.fn(),
  getPendingRequests: jest.fn(),
  createInvitation: jest.fn(),
  reviewAccessRequest: jest.fn(),
  createUserWithPassword: jest.fn(),
  changePassword: jest.fn(),
  checkUserAuthorization: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  updateUserStatus: jest.fn(),
  deleteUser: jest.fn()
}));

describe('Admin Endpoints', () => {
  let app;
  
  beforeAll(async () => {
    // Import app after mocking
    const { default: serverApp } = await import('../backend/server.js');
    app = serverApp;
  });

  const adminHeaders = {
    'Authorization': 'Bearer admin-token',
    'x-business-id': '1145545',
    'x-user-email': 'admin@test.com',
    'Content-Type': 'application/json'
  };

  describe('GET /api/admin/users', () => {
    it('should return list of authorized users', async () => {
      const mockUsers = [
        {
          id: 1,
          email: 'user1@test.com',
          name: 'User One',
          role: 'user',
          active: true,
          registered_at: '2024-01-01T00:00:00Z',
          last_login: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          email: 'user2@test.com',
          name: 'User Two',
          role: 'admin',
          active: true,
          registered_at: '2024-01-02T00:00:00Z',
          last_login: null
        }
      ];

      const { getAuthorizedUsers } = await import('../backend/auth.js');
      getAuthorizedUsers.mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/api/admin/users')
        .set(adminHeaders)
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        users: mockUsers
      });
    });

    it('should require admin authentication', async () => {
      await request(app)
        .get('/api/admin/users')
        .expect(400); // Missing headers
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('should return specific user details', async () => {
      const mockUser = {
        id: 1,
        email: 'user1@test.com',
        name: 'User One',
        role: 'user',
        active: true,
        registered_at: '2024-01-01T00:00:00Z',
        last_login: '2024-01-15T10:30:00Z',
        google_email: 'user1@gmail.com',
        temp_password: false,
        must_change_password: false
      };

      const { getUserById } = await import('../backend/auth.js');
      getUserById.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/admin/users/1')
        .set(adminHeaders)
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        user: mockUser
      });
    });

    it('should return 404 for non-existent user', async () => {
      const { getUserById } = await import('../backend/auth.js');
      getUserById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/admin/users/999')
        .set(adminHeaders)
        .expect(404);

      expect(response.body).toEqual({
        error: 'User not found'
      });
    });
  });

  describe('PUT /api/admin/users/:id', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@test.com',
        role: 'admin'
      };

      const updatedUser = {
        id: 1,
        ...updateData,
        active: true,
        registered_at: '2024-01-01T00:00:00Z'
      };

      const { updateUser } = await import('../backend/auth.js');
      updateUser.mockResolvedValue({ success: true, user: updatedUser });

      const response = await request(app)
        .put('/api/admin/users/1')
        .set(adminHeaders)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'User updated successfully',
        user: updatedUser
      });
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .put('/api/admin/users/1')
        .set(adminHeaders)
        .send({}) // Empty data
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should prevent email conflicts', async () => {
      const { updateUser } = await import('../backend/auth.js');
      updateUser.mockResolvedValue({ 
        success: false, 
        error: 'Email already exists' 
      });

      const response = await request(app)
        .put('/api/admin/users/1')
        .set(adminHeaders)
        .send({
          name: 'Test User',
          email: 'existing@test.com',
          role: 'user'
        })
        .expect(400);

      expect(response.body).toEqual({
        error: 'Email already exists'
      });
    });
  });

  describe('PUT /api/admin/users/:id/status', () => {
    it('should activate user successfully', async () => {
      const { updateUserStatus } = await import('../backend/auth.js');
      updateUserStatus.mockResolvedValue({ success: true });

      const response = await request(app)
        .put('/api/admin/users/1/status')
        .set(adminHeaders)
        .send({ active: true })
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'User status updated successfully'
      });
    });

    it('should deactivate user successfully', async () => {
      const { updateUserStatus } = await import('../backend/auth.js');
      updateUserStatus.mockResolvedValue({ success: true });

      const response = await request(app)
        .put('/api/admin/users/1/status')
        .set(adminHeaders)
        .send({ active: false })
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'User status updated successfully'
      });
    });

    it('should validate status parameter', async () => {
      const response = await request(app)
        .put('/api/admin/users/1/status')
        .set(adminHeaders)
        .send({}) // Missing active field
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    it('should delete user successfully', async () => {
      const { deleteUser } = await import('../backend/auth.js');
      deleteUser.mockResolvedValue({ success: true });

      const response = await request(app)
        .delete('/api/admin/users/1')
        .set(adminHeaders)
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'User deleted successfully'
      });
    });

    it('should prevent self-deletion', async () => {
      const response = await request(app)
        .delete('/api/admin/users/1') // Same ID as mock admin user
        .set(adminHeaders)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Cannot delete your own account'
      });
    });

    it('should return 404 for non-existent user', async () => {
      const { deleteUser } = await import('../backend/auth.js');
      deleteUser.mockResolvedValue({ success: false, error: 'User not found' });

      const response = await request(app)
        .delete('/api/admin/users/999')
        .set(adminHeaders)
        .expect(404);

      expect(response.body).toEqual({
        error: 'User not found'
      });
    });
  });

  describe('GET /api/admin/pending-requests', () => {
    it('should return pending access requests', async () => {
      const mockRequests = [
        {
          id: 1,
          google_email: 'pending@test.com',
          name: 'Pending User',
          requested_role: 'user',
          status: 'pending',
          requested_at: '2024-01-15T10:00:00Z'
        }
      ];

      const { getPendingRequests } = await import('../backend/auth.js');
      getPendingRequests.mockResolvedValue(mockRequests);

      const response = await request(app)
        .get('/api/admin/pending-requests')
        .set(adminHeaders)
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        requests: mockRequests
      });
    });
  });

  describe('POST /api/admin/invitations', () => {
    it('should create invitation successfully', async () => {
      const mockInvitation = {
        token: 'test-token-123',
        role: 'user',
        expires_at: '2024-01-16T10:00:00Z'
      };

      const { createInvitation } = await import('../backend/auth.js');
      createInvitation.mockResolvedValue(mockInvitation);

      const response = await request(app)
        .post('/api/admin/invitations')
        .set(adminHeaders)
        .send({ role: 'user', expiresInHours: 24 })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.invitation).toHaveProperty('token');
      expect(response.body.invitation).toHaveProperty('url');
    });
  });

  describe('POST /api/admin/requests/:id/review', () => {
    it('should approve access request', async () => {
      const mockRequest = {
        id: 1,
        status: 'approved',
        reviewed_at: '2024-01-15T12:00:00Z',
        reviewed_by: 'admin@test.com'
      };

      const { reviewAccessRequest } = await import('../backend/auth.js');
      reviewAccessRequest.mockResolvedValue(mockRequest);

      const response = await request(app)
        .post('/api/admin/requests/1/review')
        .set(adminHeaders)
        .send({ status: 'approved', notes: 'Approved by admin' })
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Request approved successfully',
        request: mockRequest
      });
    });

    it('should reject access request', async () => {
      const mockRequest = {
        id: 1,
        status: 'rejected',
        reviewed_at: '2024-01-15T12:00:00Z',
        reviewed_by: 'admin@test.com'
      };

      const { reviewAccessRequest } = await import('../backend/auth.js');
      reviewAccessRequest.mockResolvedValue(mockRequest);

      const response = await request(app)
        .post('/api/admin/requests/1/review')
        .set(adminHeaders)
        .send({ status: 'rejected', notes: 'Not authorized' })
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Request rejected successfully',
        request: mockRequest
      });
    });
  });

  describe('POST /api/admin/create-user-with-password', () => {
    it('should create user with password successfully', async () => {
      const userData = {
        email: 'newuser@test.com',
        name: 'New User',
        role: 'user',
        tempPassword: 'TempPass123!'
      };

      const mockUser = {
        id: 3,
        business_id: '1145545',
        email: userData.email,
        name: userData.name,
        role: userData.role,
        temp_password: true,
        must_change_password: true,
        registered_at: '2024-01-15T12:00:00Z'
      };

      const { createUserWithPassword } = await import('../backend/auth.js');
      createUserWithPassword.mockResolvedValue({ success: true, user: mockUser });

      const response = await request(app)
        .post('/api/admin/create-user-with-password')
        .set(adminHeaders)
        .send(userData)
        .expect(201);

      expect(response.body).toEqual({
        status: 'success',
        user: mockUser
      });
    });
  });

  describe('POST /api/admin/reset-user-password', () => {
    it('should reset user password successfully', async () => {
      const { changePassword } = await import('../backend/auth.js');
      changePassword.mockResolvedValue({ 
        success: true, 
        message: 'Password reset successfully' 
      });

      const response = await request(app)
        .post('/api/admin/reset-user-password')
        .set(adminHeaders)
        .send({ 
          email: 'user@test.com', 
          newPassword: 'NewPass123!' 
        })
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Password reset successfully'
      });
    });
  });
});
