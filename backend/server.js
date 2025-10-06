import { config } from 'dotenv';
import express from 'express';
import { sendEmail, sendEmailWithAttachment } from './gmail-service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '..', '.env') });
import fetch from 'node-fetch';
import cookieParser from 'cookie-parser';
import pg from 'pg';
import Busboy from 'busboy';
import FormData from 'form-data';
import {
  initializeAuth,
  verifyGoogleToken,
  checkUserAuthorization,
  getBusinessBySubdomain,
  createInvitation,
  validateInvitation,
  useInvitation,
  getAuthorizedUsers,
  getPendingRequests,
  createAccessRequest,
  reviewAccessRequest,
  requireAdmin,
  // Password functions
  loginWithEmailPassword,
  changePassword,
  createUserWithPassword,
  // User management functions
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser
} from './auth.js';

// 🚀 UNIFIED INBOX INTEGRATION - IMPORT UNIFIED ENDPOINTS
import { 
  getUnifiedConversations, 
  getUnifiedMessages,
  triggerUnifiedSync 
} from './unified-inbox-endpoints.js';

const app = express();

// CORS configuration - DEBE IR ANTES DE OTROS MIDDLEWARES
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('🌐 CORS request from origin:', origin);
  
  // Allow localhost during development
  if (origin && (
    origin.includes('localhost:5173') || 
    origin.includes('localhost:3000') || 
    origin.includes('127.0.0.1')
  )) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log('✅ CORS: Allowing localhost origin:', origin);
  } else {
    // Allow specific production domains if needed
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    console.log('🔧 CORS: Using default localhost:5173');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-ACCESS-TOKEN, X-BUSINESS-ID, X-USER-EMAIL, X-UNIFIED-INBOX, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS: Handling preflight request');
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.disable('x-powered-by');
app.use((_, res, next) => { res.setHeader('X-Content-Type-Options', 'nosniff'); next(); });
// Minimal security headers
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Basic request-id and logging
app.use((req, res, next) => {
  const rid = req.headers['x-request-id'] || Math.random().toString(36).slice(2);
  res.setHeader('x-request-id', String(rid));
  req._rid = rid;
  next();
});

// Simple auth gate for mutating endpoints
function requireAuth(req, res, next) {
  const headerToken = req.headers['x-access-token'] || (req.headers.authorization?.toString().replace(/^Bearer\s+/i, ''));
  const cookieToken = req.cookies?.user_token;
  const token = headerToken || cookieToken || null;
  
  if (!token) {
    return res.status(401).json({ status: 'ERROR', message: 'Missing authentication token' });
  }
  
  // Validate token against environment variables
  const validTokens = [process.env.USER_TOKEN, process.env.API_TOKEN].filter(Boolean);
  if (!validTokens.includes(token)) {
    console.log('🔐 Token validation failed:', {
      provided: token?.substring(0, 20) + '...',
      validTokens: validTokens.map(t => t?.substring(0, 20) + '...')
    });
    return res.status(401).json({ status: 'ERROR', message: 'Invalid authentication token' });
  }
  
  next();
}

// Basic health endpoints
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));
app.get('/healthz', (_req, res) => res.status(200).send('ok'));

// ========================================
// MULTITENANT AUTH ENDPOINTS
// ========================================

// Google OAuth login endpoint - UPDATED WITH GMAIL SCOPES
app.post('/api/auth/google-login', async (req, res) => {
  try {
    const { token, businessId, accessToken, refreshToken, expiresAt, scope } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Google token required' });
    }
    
    // Verify Google token
    const userInfo = await verifyGoogleToken(token);
    if (!userInfo) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }
    
    // Check if user is authorized for this business
    const authorization = await checkUserAuthorization(businessId, userInfo.email);
    
    if (authorization) {
      // Save OAuth tokens if provided (for Gmail access)
      if (accessToken && scope) {
        try {
          await pool.query(`
            INSERT INTO google_oauth_tokens 
              (business_id, user_email, access_token, refresh_token, expires_at, scope)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (business_id, user_email) 
            DO UPDATE SET 
              access_token = $3,
              refresh_token = COALESCE($4, google_oauth_tokens.refresh_token),
              expires_at = $5,
              scope = $6,
              updated_at = NOW()
          `, [businessId, userInfo.email, accessToken, refreshToken, expiresAt, scope]);
          
          console.log(`✅ OAuth tokens saved for ${userInfo.email}`);
        } catch (err) {
          console.error('❌ Failed to save OAuth tokens:', err);
        }
      }
      
      // User is authorized - return success
      return res.json({
        status: 'success',
        user: {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          role: authorization.role,
          businessId: authorization.business_id,
          businessName: authorization.business_name
        }
      });
    } else {
      // User not authorized - create access request
      await createAccessRequest(businessId, userInfo.email, userInfo.name);
      return res.status(403).json({ 
        error: 'Access request created. Please wait for admin approval.',
        requestCreated: true
      });
    }
  } catch (error) {
    console.error('❌ Google login failed:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Validate invitation token
app.get('/api/auth/invitation/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const invitation = await validateInvitation(token);
    
    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }
    
    res.json({
      status: 'success',
      invitation: {
        businessId: invitation.business_id,
        businessName: invitation.business_name,
        role: invitation.role,
        subdomain: invitation.subdomain
      }
    });
  } catch (error) {
    console.error('❌ Invitation validation failed:', error);
    res.status(500).json({ error: 'Invitation validation failed' });
  }
});

// Use invitation (complete registration)
app.post('/api/auth/invitation/:token/accept', async (req, res) => {
  try {
    const { token } = req.params;
    const { googleToken } = req.body;
    
    if (!googleToken) {
      return res.status(400).json({ error: 'Google token required' });
    }
    
    // Verify Google token
    const userInfo = await verifyGoogleToken(googleToken);
    if (!userInfo) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }
    
    // Use invitation
    const result = await useInvitation(token, userInfo.email, userInfo.name);
    
    if (!result) {
      return res.status(400).json({ error: 'Failed to accept invitation' });
    }
    
    res.json({
      status: 'success',
      message: 'Welcome! You now have access to the dashboard.',
      user: {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        role: result.user.role,
        businessId: result.user.business_id
      }
    });
  } catch (error) {
    console.error('❌ Invitation acceptance failed:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Get business info by subdomain (for routing)
app.get('/api/auth/business/:subdomain', async (req, res) => {
  try {
    const { subdomain } = req.params;
    const business = await getBusinessBySubdomain(subdomain);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    res.json({
      status: 'success',
      business: {
        businessId: business.business_id,
        name: business.name,
        subdomain: business.subdomain,
        description: business.description
      }
    });
  } catch (error) {
    console.error('❌ Business lookup failed:', error);
    res.status(500).json({ error: 'Business lookup failed' });
  }
});

// ========================================
// ADMIN PANEL ENDPOINTS (require admin role)
// ========================================

// Get authorized users (admin only)
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await getAuthorizedUsers(req.businessId);
    res.json({ status: 'success', users });
  } catch (error) {
    console.error('❌ Failed to get users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get pending access requests (admin only)
app.get('/api/admin/pending-requests', requireAdmin, async (req, res) => {
  try {
    const requests = await getPendingRequests(req.businessId);
    res.json({ status: 'success', requests });
  } catch (error) {
    console.error('❌ Failed to get pending requests:', error);
    res.status(500).json({ error: 'Failed to get pending requests' });
  }
});

// Create invitation link (admin only)
app.post('/api/admin/invitations', requireAdmin, async (req, res) => {
  try {
    const { role = 'user', expiresInHours = 24 } = req.body;
    
    const invitation = await createInvitation(
      req.businessId,
      req.user.google_email,
      role,
      expiresInHours
    );
    
    if (!invitation) {
      return res.status(500).json({ error: 'Failed to create invitation' });
    }
    
    // Generate invitation URL (will be customized per deployment)
    const inviteUrl = `${req.protocol}://${req.get('host')}/invite/${invitation.token}`;
    
    res.json({
      status: 'success',
      invitation: {
        token: invitation.token,
        url: inviteUrl,
        role: invitation.role,
        expiresAt: invitation.expires_at
      }
    });
  } catch (error) {
    console.error('❌ Failed to create invitation:', error);
    res.status(500).json({ error: 'Failed to create invitation' });
  }
});

// Approve/reject access request (admin only)
app.post('/api/admin/requests/:id/review', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }
    
    const request = await reviewAccessRequest(
      id,
      req.user.google_email,
      status,
      notes
    );
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json({
      status: 'success',
      message: `Request ${status} successfully`,
      request
    });
  } catch (error) {
    console.error('❌ Failed to review request:', error);
    res.status(500).json({ error: 'Failed to review request' });
  }
});

// ========================================
// EMAIL/PASSWORD AUTHENTICATION ENDPOINTS
// ========================================

// Email/password login
app.post('/api/auth/email-login', async (req, res) => {
  try {
    const { email, password, businessId } = req.body;
    
    if (!email || !password || !businessId) {
      return res.status(400).json({ 
        error: 'Email, password, and businessId are required' 
      });
    }
    
    const result = await loginWithEmailPassword(email, password, businessId);
    
    if (!result.success) {
      return res.status(result.error === 'User not found' ? 404 : 401).json({ 
        error: result.error 
      });
    }
    
    res.json({
      status: 'success',
      user: result.user,
      token: process.env.USER_TOKEN // Use legacy token for API calls
    });
  } catch (error) {
    console.error('❌ Email login failed:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Change password
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { email, businessId, currentPassword, newPassword } = req.body;
    
    if (!email || !businessId || !currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Email, businessId, currentPassword, and newPassword are required' 
      });
    }
    
    const result = await changePassword(email, businessId, currentPassword, newPassword);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    console.error('❌ Password change failed:', error);
    res.status(500).json({ error: 'Password change failed' });
  }
});

// Create user with password (admin only)
app.post('/api/admin/create-user-with-password', requireAdmin, async (req, res) => {
  try {
    const { email, name, role, tempPassword } = req.body;
    const businessId = req.businessId;
    
    if (!email || !name || !tempPassword) {
      return res.status(400).json({ 
        error: 'Email, name, and tempPassword are required' 
      });
    }
    
    const userData = {
      email,
      name,
      role: role || 'user',
      businessId,
      tempPassword
    };
    
    const result = await createUserWithPassword(userData, req.user.email);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.status(201).json({
      status: 'success',
      user: result.user
    });
  } catch (error) {
    console.error('❌ User creation failed:', error);
    res.status(500).json({ error: 'User creation failed' });
  }
});

// Reset user password (admin only)
app.post('/api/admin/reset-user-password', requireAdmin, async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const businessId = req.businessId;
    
    if (!email || !newPassword) {
      return res.status(400).json({ 
        error: 'Email and newPassword are required' 
      });
    }
    
    const result = await changePassword(email, businessId, null, newPassword, true); // true = admin reset
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    console.error('❌ Password reset failed:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// Get specific user by ID (admin only)
app.get('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const businessId = req.businessId;
    
    const user = await getUserById(businessId, userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({
      status: 'success',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('❌ Failed to get user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user profile (admin only)
app.put('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const businessId = req.businessId;
    const { name, email, role } = req.body;
    
    if (!name || !email || !role) {
      return res.status(400).json({ 
        error: 'Name, email, and role are required' 
      });
    }
    
    const result = await updateUser(businessId, userId, { name, email, role });
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json({
      status: 'success',
      message: 'User updated successfully',
      user: result.user
    });
  } catch (error) {
    console.error('❌ Failed to update user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Update user status (activate/deactivate) (admin only)
app.put('/api/admin/users/:id/status', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const businessId = req.businessId;
    const { active } = req.body;
    
    if (typeof active !== 'boolean') {
      return res.status(400).json({ 
        error: 'Active status (boolean) is required' 
      });
    }
    
    const result = await updateUserStatus(businessId, userId, active);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json({
      status: 'success',
      message: 'User status updated successfully'
    });
  } catch (error) {
    console.error('❌ Failed to update user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Delete user (admin only)
app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const businessId = req.businessId;
    
    // Prevent self-deletion
    if (req.user.id.toString() === userId.toString()) {
      return res.status(400).json({ 
        error: 'Cannot delete your own account' 
      });
    }
    
    const result = await deleteUser(businessId, userId);
    
    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }
    
    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('❌ Failed to delete user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Serve static admin inbox file
app.get('/admin-inbox-v2.html', (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin-inbox-v2.html'));
});

// Serve invitation page
app.get('/invite/:token', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'invite.html'));
});

// Resolve account_id from request (query > cookie > env)
function resolveAccountId(req, payload) {
  if (payload && payload.account_id) return payload.account_id;
  if (req?.headers?.['x-business-id']) return req.headers['x-business-id'];
  if (req?.query?.account_id) return req.query.account_id;
  if (req?.cookies?.account_id) return req.cookies.account_id;
  return process.env.BUSINESS_ID;
}

// Helper to call upstream API
async function callUpstream(payload, tokenOverride, req) {
  const apiUrl = process.env.API_URL || 'https://app.aiprlassist.com/php/user';

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'mobile-app',
    'X-ACCESS-TOKEN': tokenOverride || (req && (req.headers['x-access-token'] || (req.headers.authorization?.toString().replace(/^Bearer\s+/i, '')))) || process.env.USER_TOKEN || process.env.API_TOKEN || '',
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return response;
}

// SSE clients registry and broadcaster
const sseClients = new Set();
function broadcastEvent(event) {
  const payload = `data: ${JSON.stringify({ ...event, t: Date.now() })}\n\n`;
  for (const client of sseClients) {
    try { client.write(payload); } catch (_) { /* ignore */ }
  }
}

// Simple validators
function ensureArray(val) { return Array.isArray(val) ? val : []; }
function isNonEmptyString(s) { return typeof s === 'string' && s.trim().length > 0; }

// Very light rate limiter (per IP)
const rateWindowMs = Number(process.env.RATE_WINDOW_MS || 60000);
const rateMax = Number(process.env.RATE_MAX || 600);
const ipHits = new Map();
function rateLimit(req, res, next) {
  try {
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const rec = ipHits.get(ip) || { t: now, n: 0 };
    if (now - rec.t > rateWindowMs) { rec.t = now; rec.n = 0; }
    rec.n += 1; ipHits.set(ip, rec);
    if (rec.n > rateMax) return res.status(429).json({ status: 'ERROR', message: 'Too many requests' });
  } catch {}
  next();
}

// Inbox API: Get whitelabel info for WebSocket
app.get('/api/whitelabel', async (req, res) => {
  try {
    // CORS: allow Railway frontend and localhost
    const origin = req.headers.origin;
    const allowed = new Set([
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://frontend-production-43b8.up.railway.app',
      process.env.FRONTEND_ORIGIN
    ].filter(Boolean));
    if (origin && allowed.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    // Según Postman, la operación correcta es wt/get y requiere USER_TOKEN
    const tokenToUse = process.env.USER_TOKEN || process.env.API_TOKEN || '';
    const upstream = await callUpstream({
      op: 'wt',
      op1: 'get'
    }, tokenToUse, req);

    const data = await upstream.json().catch(() => null);
    if (data && data.status === 'OK') {
      return res.json(data);
    }
    return res.status(500).json({ status: 'error', message: 'Failed to get whitelabel info' });
  } catch (error) {
    console.error('❌ Error en whitelabel endpoint:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// 🚀 UNIFIED INBOX API: Get conversations (ChatRace + Woodstock + VAPI)
app.get('/api/inbox/conversations', (req, res) => {
  console.log('🌟 USING UNIFIED CONVERSATIONS ENDPOINT');
  return getUnifiedConversations(req, res, callUpstream, resolveAccountId);
});

// 🚀 UNIFIED INBOX API: Get messages for conversation (ChatRace + Woodstock + VAPI)
app.get('/api/inbox/conversations/:id/messages', (req, res) => {
  console.log('🌟 USING UNIFIED MESSAGES ENDPOINT');
  return getUnifiedMessages(req, res, callUpstream, resolveAccountId);
});

// Inbox API: Dedup preview (stub)
app.get('/api/inbox/conversations/:id/dedup-preview', async (_req, res) => {
  return res.json({ status: 'success', data: [] });
});

// Inbox API: Link contact (stub)
app.post('/api/inbox/conversations/:id/link-contact', async (req, res) => {
  const { id } = req.params;
  return res.json({ status: 'success', contact_id: id });
});

// Inbox API: Get linked contact (prefer users.get with ms_id)
app.get('/api/inbox/conversations/:id/contact', async (req, res) => {
  try {
    const conversationId = String(req.params.id);
    // Try users.get first (ms_id), fallback to contacts.get
    let data = null;
    try {
      const up1 = await callUpstream({ op: 'users', op1: 'get', account_id: resolveAccountId(req), ms_id: conversationId }, undefined, req);
      data = await up1.json().catch(() => null);
      if (!(data && data.status === 'OK' && data.data)) {
        const up2 = await callUpstream({ op: 'contacts', op1: 'get', account_id: resolveAccountId(req), contact_id: conversationId }, undefined, req);
        data = await up2.json().catch(() => null);
      }
    } catch {}

    if (data && data.status === 'OK' && data.data) {
      const u = data.data;
      return res.json({
        status: 'success',
        contact: {
          contact_id: String(u.id || u.ms_id || conversationId),
          full_name: String(u.full_name || u.name || ''),
          email: u.email || '',
          phone: u.phone || '',
          city: u.city || '',
          state: u.state || '',
          country: u.country || ''
        },
      });
    }
    return res.json({ status: 'success', contact: null });
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// Inbox API: SSE stream (heartbeat stub)
app.get('/api/inbox/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: 'hello', t: Date.now() })}\n\n`);
  sseClients.add(res);

  const interval = setInterval(() => {
    try { res.write(`data: ${JSON.stringify({ type: 'heartbeat', t: Date.now() })}\n\n`); } catch (_) {}
  }, 15000);

  req.on('close', () => {
    clearInterval(interval);
    sseClients.delete(res);
  });
});

// Inbox API: Send message/flow/step/products to a conversation
app.post('/api/inbox/conversations/:id/send', rateLimit, requireAuth, async (req, res) => {
  try {
    const conversationId = String(req.params.id);
    const body = (req && typeof req.body === 'object' && req.body) ? req.body : {};

    const accountId = resolveAccountId(req);
    const headerToken = req.headers['x-access-token'] || (req.headers.authorization?.toString().replace(/^Bearer\s+/i, ''));
    // Use API_TOKEN first for HTTP API calls (as per working repo instructions)
    const tokenToUse = headerToken || body.user_token || process.env.API_TOKEN || process.env.USER_TOKEN || '';

    // Supported payloads:
    // 1) Text message: { message, channel? }
    // 2) Flow: { flow_id, contact_id, channel }
    // 3) Step: { step_id, contact_id, channel }
    // 4) Products: { product_ids: [], contact_id, channel }

    let upstreamPayload = null;

    // Basic validation
    const validChannels = new Set([0, 9, 10]);
    const ch = Number(body.channel);
    if (!validChannels.has(ch)) {
      return res.status(400).json({ status: 'error', message: 'Invalid channel. Use 0 (facebook), 9 (webchat), or 10 (instagram).' });
    }

    if (body && typeof body.flow_id !== 'undefined') {
      // Send a flow
      upstreamPayload = {
        account_id: accountId,
        op: 'conversations',
        op1: 'send',
        op2: 'flow',
        id: body.flow_id,
        contact_id: body.contact_id || conversationId,
        channel: body.channel,
      };
    } else if (body && typeof body.step_id !== 'undefined') {
      // Send a single step
      upstreamPayload = {
        account_id: accountId,
        op: 'conversations',
        op1: 'send',
        op2: 'step',
        id: body.step_id,
        contact_id: body.contact_id || conversationId,
        channel: body.channel,
      };
    } else if (body && (Array.isArray(body.product_ids) || typeof body.product_ids !== 'undefined')) {
      // Send products
      const list = Array.isArray(body.product_ids) ? body.product_ids : [body.product_ids].filter(Boolean);
      upstreamPayload = {
        account_id: accountId,
        op: 'conversations',
        op1: 'send',
        op2: 'products',
        product_ids: list,
        contact_id: body.contact_id || conversationId,
        channel: body.channel,
      };
    } else if (body && typeof body.message === 'string' && body.message.trim().length > 0) {
      // Check if this is an EMAIL request
      if (body.sendAsEmail && body.recipientEmail && body.fromEmail) {
        try {
          const result = await sendEmail({
            businessId: accountId,
            fromEmail: body.fromEmail,
            to: body.recipientEmail,
            subject: body.emailSubject || 'Message from ChatRace Inbox',
            body: body.message,
            html: body.emailHtml
          });
          
          return res.status(200).json({ 
            status: 'OK', 
            type: 'email',
            messageId: result.messageId,
            threadId: result.threadId 
          });
        } catch (error) {
          return res.status(500).json({ 
            status: 'ERROR', 
            message: `Email send failed: ${error.message}` 
          });
        }
      }
      
      // Plain text message - using HTTP API format (exact format from user)
      upstreamPayload = {
        op: 'conversations',
        op1: 'send',
        account_id: accountId,
        contact_id: conversationId,
        channel: body.channel,
        message: body.message,
      };
    } else {
      return res.status(400).json({ status: 'error', message: 'Missing payload. Provide one of: message | flow_id | step_id | product_ids' });
    }

    console.log('🔥 DEBUGGING MESSAGE SEND:');
    console.log('📤 Payload enviado a ChatRace:', JSON.stringify(upstreamPayload, null, 2));
    console.log('🔑 Token usado:', tokenToUse?.substring(0, 20) + '...');
    
    const upstreamRes = await callUpstream(upstreamPayload, tokenToUse, req);
    const text = await upstreamRes.text();
    
    console.log('📥 Respuesta de ChatRace:', text);
    console.log('📊 Status Code:', upstreamRes.status);
    console.log('📊 Response Headers:', Object.fromEntries(upstreamRes.headers.entries()));
    console.log('📊 Text length:', text?.length || 0);
    console.log('📊 Text type:', typeof text);
    try {
      const json = JSON.parse(text);
      // If plain message failed, try fallback to conversations/send message
      if ((upstreamPayload.op === 'message') && json && json.status && json.status !== 'OK') {
        const fallback = {
          account_id: accountId,
          op: 'conversations',
          op1: 'send',
          op2: 'message',
          id: conversationId,
          contact_id: body.contact_id || conversationId,
          channel: body.channel,
          message: body.message,
        };
        const fbRes = await callUpstream(fallback, tokenToUse, req);
        const fbText = await fbRes.text();
        try {
          const fbJson = JSON.parse(fbText);
          return res.status(200).json(fbJson);
        } catch {
          res.setHeader('Content-Type', 'text/plain');
          return res.status(200).send(fbText);
        }
      }
      // Broadcast event on success
      if (json && json.status === 'OK') {
        broadcastEvent({ type: 'message_sent', conversation_id: conversationId, channel: ch });
      }
      return res.status(200).json(json);
    } catch (parseError) {
      console.log('📥 ChatRace response is not JSON, sending as text:', text);
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(text || 'OK');
    }
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// Inbox API: Update conversation state (assign, archived, followup, read, live-chat)
app.post('/api/inbox/conversations/:id/update', rateLimit, requireAuth, async (req, res) => {
  try {
    const conversationId = String(req.params.id);
    const body = (req && typeof req.body === 'object' && req.body) ? req.body : {};

    const accountId = resolveAccountId(req);
    const headerToken = req.headers['x-access-token'] || (req.headers.authorization?.toString().replace(/^Bearer\s+/i, ''));
    const tokenToUse = headerToken || body.user_token || process.env.USER_TOKEN || process.env.API_TOKEN || '';

    // Accept both `action` and explicit op/op1/op2 (fallback to direct call if provided)
    if (body.op && body.op1) {
      const upstreamRes = await callUpstream({ ...body, account_id: body.account_id || accountId }, tokenToUse, req);
      const text = await upstreamRes.text();
      try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
    }

    const action = String(body.action || '').toLowerCase();
    if (!action) {
      return res.status(400).json({ status: 'error', message: 'Missing action. Supported: assign | archived | followup | read | live_chat' });
    }

    let op2 = null;
    let data = {};
    switch (action) {
      case 'assign':
        op2 = 'assign';
        data = { fb_id: body.fb_id ?? 0 };
        break;
      case 'archived':
        op2 = 'archived';
        data = { value: body.value ? 1 : 0 };
        break;
      case 'followup':
        op2 = 'followup';
        data = { value: body.value ? 1 : 0 };
        break;
      case 'read':
        op2 = 'read';
        // Postman expects timestamp (read) or 0 to mark unread
        if (typeof body.timestamp !== 'undefined') {
          data = { timestamp: Number(body.timestamp) || 0 };
        } else {
          data = { timestamp: body.value ? Math.floor(Date.now() / 1000) : 0 };
        }
        break;
      case 'live_chat':
      case 'live-chat':
        op2 = 'live-chat';
        // Postman expects { enabled: 1|0 }
        data = { enabled: body.value ? 1 : 0 };
        break;
      case 'blocked':
        op2 = 'blocked';
        data = { value: body.value ? 1 : 0 };
        break;
      default:
        return res.status(400).json({ status: 'error', message: `Unsupported action: ${action}` });
    }

    const upstreamPayload = {
      account_id: accountId,
      op: 'conversations',
      op1: 'update',
      op2,
      contact_id: body.contact_id || conversationId,
      data,
    };

    const upstreamRes = await callUpstream(upstreamPayload, tokenToUse, req);
    const text = await upstreamRes.text();
    try {
      const json = JSON.parse(text);
      if (json && json.status === 'OK') {
        broadcastEvent({ type: 'conversation_updated', conversation_id: conversationId, action, op2 });
      }
      return res.status(200).json(json);
    } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

const PORT = Number(process.env.PORT || 3001);

// Initialize auth module
initializeAuth().catch(console.error);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Generic proxy route to mirror Postman collection usage
app.post('/api/chatrace', async (req, res) => {
  try {
    const apiUrl = process.env.API_URL;
    if (!apiUrl) return res.status(500).json({ status: 'error', message: 'Missing API_URL' });

    const body = typeof req.body === 'object' && req.body ? { ...req.body } : {};
    if (!body.account_id) body.account_id = resolveAccountId(req, body);

    // Determine token: whitelabel ops use API_TOKEN; others use incoming or USER_TOKEN
    const isWhitelabel = (body.op === 'wt' || body.op === 'whitelabel');
    const headerToken = req.headers['x-access-token'] || (req.headers.authorization?.toString().replace(/^Bearer\s+/i, ''));
    const incomingToken = headerToken || body.user_token || body.token;
    const tokenToUse = isWhitelabel ? (process.env.API_TOKEN || incomingToken) : (incomingToken || process.env.USER_TOKEN || process.env.API_TOKEN);

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'mobile-app',
      'X-PLATFORM': req.headers['x-platform'] || 'web',
      'X-ACCESS-TOKEN': tokenToUse || '',
    };

    const upstream = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    // Stream back raw body if not JSON
    const text = await upstream.text();
    try {
      const json = JSON.parse(text);
      return res.status(200).json(json);
    } catch {
      // Non-JSON allowed by tests (they treat non-JSON as success sometimes)
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(text);
    }
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// Alias to match React usage and external tools expecting /api/proxy
app.post('/api/proxy', async (req, res) => {
  // Delegate to /api/chatrace logic
  req.url = '/api/chatrace';
  return app._router.handle(req, res, () => {});
});

// Simple auth helper: returns configured USER_TOKEN so UI can proceed
app.post('/api/test-auth', async (_req, res) => {
  try {
    const token = process.env.USER_TOKEN || process.env.API_TOKEN || '';
    if (!token) return res.status(200).json({ status: 'ERROR', message: 'Missing USER_TOKEN' });
    const accountId = process.env.BUSINESS_ID || null;
    if (accountId) {
      res.cookie('account_id', String(accountId), { httpOnly: false, sameSite: 'lax', maxAge: 31536000000 });
    }
    return res.status(200).json({ status: 'OK', token, account_id: accountId, demoMode: false });
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// Test admin endpoint without auth (for debugging)
app.get('/api/admin/test', async (req, res) => {
  try {
    console.log('🧪 Test admin endpoint called');
    console.log('Headers:', req.headers);
    console.log('USER_TOKEN:', process.env.USER_TOKEN?.substring(0, 20) + '...');
    console.log('API_TOKEN:', process.env.API_TOKEN?.substring(0, 20) + '...');
    
    return res.json({
      status: 'success',
      message: 'Admin test endpoint working',
      headers: req.headers,
      env_check: {
        has_user_token: !!process.env.USER_TOKEN,
        has_api_token: !!process.env.API_TOKEN,
        business_id: process.env.BUSINESS_ID
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Demo data provider using local JSON fixtures
app.post('/api/demo-data', async (req, res) => {
  try {
    const type = (req.body && req.body.type) || '';
    if (type === 'conversations') {
      const raw = fs.readFileSync(path.join(__dirname, 'working_conversations.json'), 'utf-8');
      const json = JSON.parse(raw);
      return res.status(200).json({ status: 'OK', data: json });
    }
    if (type === 'messages') {
      const raw = fs.readFileSync(path.join(__dirname, 'working_messages.json'), 'utf-8');
      const json = JSON.parse(raw);
      return res.status(200).json({ status: 'OK', data: json });
    }
    if (type === 'profile') {
      return res.status(200).json({ status: 'OK', data: { name: 'Demo User', email: '', phone: '', location: '' } });
    }
    return res.status(400).json({ status: 'ERROR', message: 'Unknown demo data type' });
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// Request OTP via Chatrace (login/email/sendOTP)
app.post('/api/request-otp', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim();
    if (!email) return res.status(400).json({ status: 'ERROR', message: 'Missing email' });
    const upstream = await callUpstream({ op: 'login', op1: 'email', op2: 'sendOTP', data: { email } });
    const json = await upstream.json().catch(() => null);
    if (json) return res.status(200).json(json);
    const text = await upstream.text();
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(text);
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// Validate OTP via Chatrace (login/email/validateOTP)
app.post('/api/validate-otp', async (req, res) => {
  try {
    const rid = String(req.body?.rid || '').trim();
    const code = String(req.body?.otp || req.body?.code || '').trim();
    if (!rid || !code) return res.status(400).json({ status: 'ERROR', message: 'Missing rid or code' });
    const upstream = await callUpstream({ op: 'login', op1: 'email', op2: 'validateOTP', rid, data: { code } });
    const json = await upstream.json().catch(() => null);
    if (json) {
      try {
        const token = json?.data?.token || json?.token || null;
        const accountId = json?.data?.account_id || json?.account_id || json?.data?.business_id || null;
        if (token) res.cookie('user_token', String(token), { httpOnly: false, sameSite: 'lax', maxAge: 31536000000 });
        if (accountId) res.cookie('account_id', String(accountId), { httpOnly: false, sameSite: 'lax', maxAge: 31536000000 });
      } catch {}
      return res.status(200).json(json);
    }
    const text = await upstream.text();
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(text);
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// OAuth callback - exchange code for tokens
app.post('/api/auth/google-callback', async (req, res) => {
  try {
    const { code, businessId } = req.body;
    if (!code) return res.status(400).json({ error: 'Code required' });
    
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback'
    );
    
    const { tokens } = await oauth2Client.getToken(code);
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    
    // Save tokens
    await pool.query(`
      INSERT INTO google_oauth_tokens 
        (business_id, user_email, access_token, refresh_token, expires_at, scope)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (business_id, user_email) 
      DO UPDATE SET 
        access_token = $3,
        refresh_token = COALESCE($4, google_oauth_tokens.refresh_token),
        expires_at = $5,
        scope = $6,
        updated_at = NOW()
    `, [
      businessId,
      payload.email,
      tokens.access_token,
      tokens.refresh_token,
      new Date(tokens.expiry_date),
      tokens.scope
    ]);
    
    res.json({ 
      status: 'success', 
      email: payload.email,
      hasGmailAccess: tokens.scope.includes('gmail')
    });
  } catch (error) {
    console.error('❌ OAuth callback failed:', error);
    res.status(500).json({ error: 'OAuth callback failed' });
  }
});

// ===== Additional first-class endpoints for full Postman coverage =====

// Lists
app.get('/api/inbox/admins', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'admins', op1: 'get', account_id: resolveAccountId(req), basic_info: true }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.get('/api/inbox/teams', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'inbox_team', op1: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.get('/api/inbox/flows', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'flows', op1: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.get('/api/inbox/flows/:id/steps', async (req, res) => {
  try {
    const flowID = String(req.params.id);
    const upstream = await callUpstream({ op: 'flows', op1: 'get', account_id: resolveAccountId(req), steps: true, data: { flowID } }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.get('/api/inbox/products', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'products', op1: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.get('/api/inbox/tags', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'tags', op1: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.get('/api/inbox/sequences', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'sequences', op1: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// Custom fields (account-level)
app.get('/api/inbox/custom-fields', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'custom-fields', op1: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.post('/api/inbox/custom-fields', async (req, res) => {
  try {
    const { name, type } = req.body || {};
    const upstream = await callUpstream({ op: 'custom-fields', op1: 'add', account_id: resolveAccountId(req), name, type }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// Saved replies
app.get('/api/inbox/saved-replies', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'inbox_saved_reply', op1: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.post('/api/inbox/saved-replies', async (req, res) => {
  try {
    const { shortcode, value } = req.body || {};
    const upstream = await callUpstream({ op: 'inbox_saved_reply', op1: 'add', account_id: resolveAccountId(req), data: { shortcode, value } }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.put('/api/inbox/saved-replies/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { shortcode, value } = req.body || {};
    const upstream = await callUpstream({ op: 'inbox_saved_reply', op1: 'update', account_id: resolveAccountId(req), data: { id, shortcode, value } }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.delete('/api/inbox/saved-replies/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const upstream = await callUpstream({ op: 'inbox_saved_reply', op1: 'delete', account_id: resolveAccountId(req), id }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// Notes
app.post('/api/inbox/conversations/:id/notes', rateLimit, requireAuth, async (req, res) => {
  try {
    const contact_id = String(req.params.id);
    const { text } = req.body || {};
    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ status: 'ERROR', message: 'Note text is required' });
    }
    const upstream = await callUpstream({ op: 'conversations', op1: 'notes', op2: 'add', account_id: resolveAccountId(req), contact_id, data: { text } }, undefined, req);
    const responseText = await upstream.text();
    try {
      const json = JSON.parse(responseText);
      if (json && json.status === 'OK') broadcastEvent({ type: 'note_added', conversation_id: contact_id });
      return res.status(200).json(json);
    } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(responseText); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.put('/api/inbox/conversations/:id/notes/:noteId', rateLimit, requireAuth, async (req, res) => {
  try {
    const contact_id = String(req.params.id);
    const noteId = String(req.params.noteId);
    const { text } = req.body || {};
    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ status: 'ERROR', message: 'Note text is required' });
    }
    const upstream = await callUpstream({ op: 'conversations', op1: 'notes', op2: 'update', account_id: resolveAccountId(req), contact_id, id: noteId, data: { text } }, undefined, req);
    const responseText = await upstream.text();
    try { const json = JSON.parse(responseText); if (json && json.status === 'OK') broadcastEvent({ type: 'note_updated', conversation_id: contact_id, note_id: noteId }); return res.status(200).json(json); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(responseText); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.delete('/api/inbox/conversations/:id/notes/:noteId', rateLimit, requireAuth, async (req, res) => {
  try {
    const contact_id = String(req.params.id);
    const noteId = String(req.params.noteId);
    const upstream = await callUpstream({ op: 'conversations', op1: 'notes', op2: 'delete', account_id: resolveAccountId(req), contact_id, id: noteId }, undefined, req);
    const responseText = await upstream.text();
    try { const json = JSON.parse(responseText); if (json && json.status === 'OK') broadcastEvent({ type: 'note_deleted', conversation_id: contact_id, note_id: noteId }); return res.status(200).json(json); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(responseText); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// Users: tags/custom-fields
app.post('/api/inbox/users/:ms_id/custom-field/set', rateLimit, requireAuth, async (req, res) => {
  try {
    const contact_id = String(req.params.ms_id);
    const { field_id, field_type, value } = req.body || {};
    const upstream = await callUpstream({ op: 'users', op1: 'custom-field', op2: 'set', account_id: resolveAccountId(req), contact_id, field_id, field_type, value }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.post('/api/inbox/users/:ms_id/custom-field/delete', rateLimit, requireAuth, async (req, res) => {
  try {
    const contact_id = String(req.params.ms_id);
    const { field_id, field_type } = req.body || {};
    const upstream = await callUpstream({ op: 'users', op1: 'custom-field', op2: 'delete', account_id: resolveAccountId(req), contact_id, field_id, field_type }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.post('/api/inbox/users/:ms_id/tags/remove', rateLimit, requireAuth, async (req, res) => {
  try {
    const contact_id = String(req.params.ms_id);
    const { tags } = req.body || {};
    const upstream = await callUpstream({ op: 'users', op1: 'update', op2: 'remove-tag', account_id: resolveAccountId(req), contact_id, tags }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// Calendars & Appointments
app.get('/api/inbox/calendars', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'calendars', op1: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.get('/api/inbox/appointments', async (req, res) => {
  try {
    const calendarID = req.query.calendarID ?? null;
    const upstream = await callUpstream({ op: 'calendars', op1: 'appointments', op2: 'get', account_id: resolveAccountId(req), calendarID }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.post('/api/inbox/appointments/:id/cancel', rateLimit, requireAuth, async (req, res) => {
  try {
    const id = String(req.params.id);
    const upstream = await callUpstream({ op: 'calendars', op1: 'appointments', op2: 'changeStatus', account_id: resolveAccountId(req), id, status: -1 }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.delete('/api/inbox/appointments/:id', rateLimit, requireAuth, async (req, res) => {
  try {
    const id = String(req.params.id);
    const upstream = await callUpstream({ op: 'calendars', op1: 'appointments', op2: 'delete', account_id: resolveAccountId(req), id }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// Ecommerce orders
app.get('/api/inbox/orders', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'ecommerce', op1: 'orders', op2: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.get('/api/inbox/orders/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    const upstream = await callUpstream({ op: 'ecommerce', op1: 'orders', op2: 'get', account_id: resolveAccountId(req), id }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

app.post('/api/inbox/orders/:id/status', rateLimit, requireAuth, async (req, res) => {
  try {
    const id = String(req.params.id);
    const statusCode = Number(req.body?.status ?? 4);
    const upstream = await callUpstream({ op: 'ecommerce', op1: 'orders', op2: 'update', account_id: resolveAccountId(req), id, data: { status: statusCode } }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// Firebase Cloud Messaging device registration
app.post('/api/inbox/firebase/device', rateLimit, requireAuth, async (req, res) => {
  try {
    const { firebaseToken, platform, brand, model } = req.body || {};
    const upstream = await callUpstream({ op: 'firebaseCM', op1: 'device', op2: 'add', account_id: resolveAccountId(req), data: { firebaseToken, platform, brand, model } }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// Google Business Messages: locations
app.get('/api/inbox/googlebm/locations', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'googleBM', op1: 'location', op2: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// OTN lists
app.get('/api/inbox/otn', async (req, res) => {
  try {
    const upstream = await callUpstream({ op: 'otn', op1: 'get', account_id: resolveAccountId(req) }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// AI reply suggestion
app.post('/api/inbox/conversations/:id/ai-suggestion', async (req, res) => {
  try {
    const contact_id = String(req.params.id);
    const prompt = req.body?.prompt ?? null;
    const upstream = await callUpstream({ op: 'conversations', op1: 'AI-reply-suggestion', account_id: resolveAccountId(req), contact_id, data: { prompt } }, undefined, req);
    const text = await upstream.text();
    try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
  } catch (error) { return res.status(200).json({ status: 'error', message: error.message }); }
});

// Session helper: return current resolved account_id
app.get('/api/session/account', async (req, res) => {
  try {
    return res.status(200).json({ status: 'OK', account_id: resolveAccountId(req) });
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// Upload file (multipart)
app.post('/api/inbox/upload', rateLimit, requireAuth, (req, res) => {
  try {
    const bb = new Busboy({ headers: req.headers });
    let jsonParam = null;
    let fileBuffer = null;
    let fileName = 'upload.bin';

    bb.on('field', (name, val) => {
      if (name === 'param') jsonParam = val;
    });

    bb.on('file', (_name, file, filename) => {
      fileName = filename || fileName;
      const chunks = [];
      file.on('data', d => chunks.push(d));
      file.on('end', () => { fileBuffer = Buffer.concat(chunks); });
    });

    bb.on('finish', async () => {
      try {
        const apiUrl = process.env.API_URL;
        if (!apiUrl) return res.status(500).json({ status: 'error', message: 'Missing API_URL' });
        const tokenToUse = req.headers['x-access-token'] || process.env.USER_TOKEN || process.env.API_TOKEN || '';

        const form = new FormData();
        if (jsonParam) form.append('param', jsonParam);
        if (fileBuffer) form.append('file', fileBuffer, { filename: fileName });

        const upstream = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'X-ACCESS-TOKEN': tokenToUse, 'User-Agent': 'mobile-app', ...form.getHeaders() },
          body: form,
        });
        const text = await upstream.text();
        try { return res.status(200).json(JSON.parse(text)); } catch { res.setHeader('Content-Type','text/plain'); return res.status(200).send(text); }
      } catch (e) {
        return res.status(200).json({ status: 'error', message: e.message });
      }
    });

    req.pipe(bb);
  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  try {
    res.clearCookie('account_id');
    res.clearCookie('user_token');
  } catch {}
  return res.status(200).json({ status: 'OK' });
});

// 🚀 UNIFIED INBOX: Manual sync endpoint
app.post('/api/inbox/sync', requireAuth, (req, res) => {
  console.log('🔄 MANUAL UNIFIED SYNC TRIGGERED');
  return triggerUnifiedSync(req, res);
});

// Helper function to store VAPI calls
async function storeVAPICall(callData) {
  const db = new pg.Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await db.connect();
    
    const query = `
      INSERT INTO vapi_calls (
        call_id, customer_phone, customer_name, transcript, summary,
        call_started_at, call_ended_at, recording_url, created_at, synced_to_chatrace
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (call_id) DO UPDATE SET
        transcript = EXCLUDED.transcript,
        summary = EXCLUDED.summary,
        call_ended_at = EXCLUDED.call_ended_at,
        recording_url = EXCLUDED.recording_url
    `;
    
    const values = [
      callData.call_id,
      callData.customer_phone,
      callData.customer_name,
      callData.transcript,
      callData.summary,
      callData.call_started_at,
      callData.call_ended_at,
      callData.recording_url,
      callData.created_at,
      false // synced_to_chatrace
    ];
    
    await db.query(query, values);
    console.log(`✅ VAPI call ${callData.call_id} stored successfully`);
    
  } catch (error) {
    console.error('❌ Error storing VAPI call:', error);
    throw error;
  } finally {
    await db.end();
  }
}

// VAPI Webhook endpoint - receives call events
app.post('/webhook/vapi', async (req, res) => {
  console.log('🔔 VAPI Webhook received:', JSON.stringify(req.body, null, 2));
  
  const { type, call, assistant, timestamp } = req.body;
  
  // Log the event type and key data
  console.log(`📞 Event: ${type}`);
  if (call) {
    console.log(`📱 Call ID: ${call.id}`);
    console.log(`📱 Call Status: ${call.status}`);
    if (call.customer) {
      console.log(`👤 Customer: ${call.customer.number} (${call.customer.name || 'Unknown'})`);
    }
  }
  
  // Handle different event types
  switch (type) {
    case 'call-started':
      console.log('✅ Call started successfully');
      break;
    case 'call-ended':
      console.log('🛑 Call ended');
      if (call.transcript) {
        console.log('📝 Transcript:', call.transcript);
      }
      if (call.recordingUrl) {
        console.log('🎵 Recording URL:', call.recordingUrl);
      }
      if (call.summary) {
        console.log('📋 Summary:', call.summary);
      }
      // Store call data for unified inbox
      try {
        await storeVAPICall({
          call_id: call.id,
          customer_phone: call.customer?.number || '',
          customer_name: call.customer?.name || '',
          transcript: call.transcript || '',
          summary: call.summary || '',
          call_started_at: call.startedAt ? new Date(call.startedAt) : new Date(),
          call_ended_at: call.endedAt ? new Date(call.endedAt) : new Date(),
          recording_url: call.recordingUrl || '',
          created_at: new Date()
        });
        
        console.log(`✅ Stored VAPI call ${call.id} for unified inbox`);
      } catch (error) {
        console.error('❌ Error storing VAPI call:', error);
      }
      break;
    case 'transcript':
      console.log('📝 Transcript update:', req.body.transcript);
      break;
    case 'function-call':
      console.log('⚡ Function call:', req.body.functionCall);
      break;
    default:
      console.log('ℹ️ Other event type:', type);
  }
  
  res.status(200).json({ status: 'received' });
});

