import { Pool } from 'pg';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Database pool with robust config (works locally and on Railway/Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 30000,
});

// Pool error logging
pool.on('error', (err) => {
  try { console.error('❌ Postgres client error:', err?.message || err); } catch {}
});

// Google OAuth client
const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

// Initialize database connection
async function initializeAuth() {
  try {
    const conn = await pool.connect();
    await conn.query('SELECT 1');
    conn.release();
    console.log('✅ Database connected for auth module');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Verify Google token and get user info
async function verifyGoogleToken(token) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.VITE_GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      verified: payload.email_verified,
    };
  } catch (error) {
    console.error('❌ Google token verification failed:', error);
    return null;
  }
}

// Check if user is authorized for a business (supports email or google_email)
async function checkUserAuthorization(businessId, email) {
  try {
    const query = `
      SELECT au.*, b.name as business_name, b.subdomain 
      FROM authorized_users au
      JOIN businesses b ON au.business_id = b.business_id
      WHERE au.business_id = $1 
        AND (au.email = $2 OR au.google_email = $2)
        AND au.active = true
    `;
    const result = await pool.query(query, [businessId, email]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Authorization check failed:', error);
    return null;
  }
}

// Get business info by subdomain
async function getBusinessBySubdomain(subdomain) {
  try {
    const query = 'SELECT * FROM businesses WHERE subdomain = $1 AND active = true';
    const result = await pool.query(query, [subdomain]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Business lookup failed:', error);
    return null;
  }
}

// Create invitation token
async function createInvitation(businessId, createdBy, role = 'user', expiresInHours = 24) {
  try {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);
    const query = `
      INSERT INTO invitations (business_id, token, created_by, role, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [businessId, token, createdBy, role, expiresAt]);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Invitation creation failed:', error);
    return null;
  }
}

// Validate invitation token
async function validateInvitation(token) {
  try {
    const query = `
      SELECT i.*, b.name as business_name, b.subdomain
      FROM invitations i
      JOIN businesses b ON i.business_id = b.business_id
      WHERE i.token = $1 AND i.active = true AND i.expires_at > NOW() AND i.used_at IS NULL
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Invitation validation failed:', error);
    return null;
  }
}

// Use invitation (mark as used)
async function useInvitation(token, userEmail, userName) {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const updateQuery = `
      UPDATE invitations 
      SET used_at = NOW(), used_by = $1, active = false
      WHERE token = $2
      RETURNING *
    `;
    const invitationResult = await db.query(updateQuery, [userEmail, token]);
    const invitation = invitationResult.rows[0];
    if (!invitation) {
      await db.query('ROLLBACK');
      return null;
    }
    const insertQuery = `
      INSERT INTO authorized_users (business_id, google_email, name, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (business_id, google_email) 
      DO UPDATE SET name = $3, role = $4, active = true
      RETURNING *
    `;
    const userResult = await db.query(insertQuery, [
      invitation.business_id,
      userEmail,
      userName,
      invitation.role,
    ]);
    await db.query('COMMIT');
    return { invitation, user: userResult.rows[0] };
  } catch (error) {
    try { await db.query('ROLLBACK'); } catch {}
    console.error('❌ Invitation usage failed:', error);
    return null;
  } finally {
    db.release();
  }
}

// Get all authorized users for a business (admin only)
async function getAuthorizedUsers(businessId) {
  try {
    const query = `
      SELECT * FROM authorized_users 
      WHERE business_id = $1 
      ORDER BY registered_at DESC
    `;
    const result = await pool.query(query, [businessId]);
    return result.rows;
  } catch (error) {
    console.error('❌ Failed to get authorized users:', error);
    return [];
  }
}

// Get pending access requests for a business (admin only)
async function getPendingRequests(businessId) {
  try {
    const query = `
      SELECT * FROM access_requests 
      WHERE business_id = $1 AND status = 'pending'
      ORDER BY requested_at DESC
    `;
    const result = await pool.query(query, [businessId]);
    return result.rows;
  } catch (error) {
    console.error('❌ Failed to get pending requests:', error);
    return [];
  }
}

// Create access request
async function createAccessRequest(businessId, email, name, requestedRole = 'user') {
  try {
    const query = `
      INSERT INTO access_requests (business_id, google_email, name, requested_role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (business_id, google_email) 
      DO UPDATE SET requested_at = NOW(), status = 'pending'
      RETURNING *
    `;
    const result = await pool.query(query, [businessId, email, name, requestedRole]);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Access request creation failed:', error);
    return null;
  }
}

// Approve/reject access request
async function reviewAccessRequest(requestId, reviewedBy, status, notes = null) {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const updateQuery = `
      UPDATE access_requests 
      SET status = $1, reviewed_at = NOW(), reviewed_by = $2, notes = $3
      WHERE id = $4
      RETURNING *
    `;
    const requestResult = await db.query(updateQuery, [status, reviewedBy, notes, requestId]);
    const request = requestResult.rows[0];
    if (!request) {
      await db.query('ROLLBACK');
      return null;
    }
    if (status === 'approved') {
      const insertQuery = `
        INSERT INTO authorized_users (business_id, google_email, name, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (business_id, google_email) 
        DO UPDATE SET active = true, role = $4
      `;
      await db.query(insertQuery, [
        request.business_id,
        request.google_email,
        request.name,
        request.requested_role,
      ]);
    }
    await db.query('COMMIT');
    return request;
  } catch (error) {
    try { await db.query('ROLLBACK'); } catch {}
    console.error('❌ Access request review failed:', error);
    return null;
  } finally {
    db.release();
  }
}

// Middleware to check authentication
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  if (token !== process.env.USER_TOKEN) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  next();
}

// Middleware to check admin role
async function requireAdmin(req, res, next) {
  try {
    const businessId = req.headers['x-business-id'] || process.env.BUSINESS_ID;
    const userEmail = req.headers['x-user-email'];
    if (!businessId || !userEmail) {
      return res.status(400).json({ error: 'Business ID and user email required' });
    }
    const user = await checkUserAuthorization(businessId, userEmail);
    const role = (user?.role || '').toLowerCase();
    if (!user || role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = user;
    req.businessId = businessId;
    next();
  } catch (error) {
    console.error('❌ Admin check failed:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
}

// ========================================
// PASSWORD AUTHENTICATION FUNCTIONS
// ========================================

// Password validation utility
function validatePassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  if (!hasUpper || !hasLower || !hasNumber) {
    return { valid: false, error: 'Password must contain uppercase, lowercase, and number' };
  }
  return { valid: true };
}

// Hash password with bcrypt
async function hashPassword(password) {
  try {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error('❌ Password hashing failed:', error);
    throw new Error('Password hashing failed');
  }
}

// Verify password against hash
async function verifyPassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('❌ Password verification failed:', error);
    return false;
  }
}

// Email/password login
async function loginWithEmailPassword(email, password, businessId) {
  try {
    const query = `
      SELECT au.*, b.name as business_name, b.subdomain 
      FROM authorized_users au
      JOIN businesses b ON au.business_id = b.business_id
      WHERE au.business_id = $1 AND au.email = $2 AND au.active = true
    `;
    const result = await pool.query(query, [businessId, email]);
    const user = result.rows[0];
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    if (!user.password_hash) {
      return { success: false, error: 'Password not set for this user' };
    }
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return { success: false, error: 'Invalid password' };
    }
    await pool.query('UPDATE authorized_users SET last_login = NOW() WHERE id = $1', [user.id]);
    const { password_hash, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('❌ Email/password login failed:', error);
    return { success: false, error: 'Login failed' };
  }
}

// Change password
async function changePassword(email, businessId, currentPassword, newPassword, isAdminReset = false) {
  try {
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    const query = `
      SELECT * FROM authorized_users 
      WHERE business_id = $1 AND email = $2 AND active = true
    `;
    const result = await pool.query(query, [businessId, email]);
    const user = result.rows[0];
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    if (!isAdminReset && user.password_hash) {
      const isValidCurrent = await verifyPassword(currentPassword, user.password_hash);
      if (!isValidCurrent) {
        return { success: false, error: 'Current password is incorrect' };
      }
    }
    const newPasswordHash = await hashPassword(newPassword);
    await pool.query(
      `UPDATE authorized_users SET password_hash = $1, must_change_password = $2, temp_password = $3 WHERE id = $4`,
      [newPasswordHash, isAdminReset, isAdminReset, user.id]
    );
    const message = isAdminReset
      ? 'Password reset successfully. User must change password on next login.'
      : 'Password changed successfully';
    return { success: true, message };
  } catch (error) {
    console.error('❌ Password change failed:', error);
    return { success: false, error: 'Password change failed' };
  }
}

// Create user with password (admin only)
async function createUserWithPassword(userData, createdBy) {
  try {
    const { email, name, role = 'user', businessId, tempPassword } = userData;
    const validation = validatePassword(tempPassword);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    const existingQuery = `
      SELECT id FROM authorized_users 
      WHERE business_id = $1 AND email = $2
    `;
    const existingResult = await pool.query(existingQuery, [businessId, email]);
    if (existingResult.rows.length > 0) {
      return { success: false, error: 'User already exists' };
    }
    const passwordHash = await hashPassword(tempPassword);
    const insertQuery = `
      INSERT INTO authorized_users 
      (business_id, email, name, role, password_hash, temp_password, must_change_password)
      VALUES ($1, $2, $3, $4, $5, true, true)
      RETURNING id, business_id, email, name, role, temp_password, must_change_password, registered_at
    `;
    const result = await pool.query(insertQuery, [businessId, email, name, role, passwordHash]);
    return { success: true, user: result.rows[0] };
  } catch (error) {
    console.error('❌ User creation failed:', error);
    return { success: false, error: 'User creation failed' };
  }
}

export {
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
  requireAuth,
  requireAdmin,
  // Password functions
  validatePassword,
  hashPassword,
  verifyPassword,
  loginWithEmailPassword,
  changePassword,
  createUserWithPassword,
};