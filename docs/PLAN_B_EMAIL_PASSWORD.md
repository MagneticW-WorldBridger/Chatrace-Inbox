      # 🔄 PLAN B - EMAIL/PASSWORD AUTHENTICATION IMPLEMENTATION

## 📋 EXECUTIVE SUMMARY
**GOAL:** Implement email/password authentication system to replace Google OAuth
**TIMELINE:** 3 hours maximum
**STATUS:** App currently working, ready to implement Plan B

---

## ✅ CURRENT STATE (VERIFIED WORKING)
- **Backend:** Express.js server running on port 3001
- **Frontend:** React app running on port 5173
- **Database:** PostgreSQL with multitenant tables created
- **Auth System:** Google OAuth endpoints created (keeping for future)
- **Test Data:** Woodstock Furniture business and admin user created

## 🗄️ DATABASE SCHEMA UPDATES NEEDED

```sql
-- Update existing authorized_users table for email/password auth
ALTER TABLE authorized_users RENAME COLUMN google_email TO email;
ALTER TABLE authorized_users ADD COLUMN password_hash TEXT;
ALTER TABLE authorized_users ADD COLUMN temp_password BOOLEAN DEFAULT false;
ALTER TABLE authorized_users ADD COLUMN must_change_password BOOLEAN DEFAULT false;
ALTER TABLE authorized_users ADD COLUMN password_reset_token TEXT;
ALTER TABLE authorized_users ADD COLUMN password_reset_expires TIMESTAMP;

-- Update access_requests table
ALTER TABLE access_requests RENAME COLUMN google_email TO email;

-- Update invitations table to include temp passwords
ALTER TABLE invitations ADD COLUMN temp_password TEXT;
ALTER TABLE invitations ADD COLUMN email TEXT;
```

---

## 🛠️ IMPLEMENTATION PLAN (3 HOURS)

### Phase 1: Database Schema Update (20 min) ✅ COMPLETED
- [x] Execute SQL schema updates
- [x] Install bcryptjs: `npm install bcryptjs @types/bcryptjs`
- [x] Test database changes
- [x] Verified existing users with password hashes
- [x] Added missing fields (must_change_password, password_reset_token, password_reset_expires)

### Phase 2: Backend Password System (40 min) 🧪 TDD APPROACH
- [x] Install testing dependencies (jest, supertest)
- [x] Write comprehensive tests FIRST (TDD approach)
- ✅ Add password hashing utilities to auth.js (12 rounds, high security)
- ✅ Create email/password login endpoint: `POST /api/auth/email-login`
- ✅ Create password change endpoint: `POST /api/auth/change-password`
- ✅ Create admin user creation: `POST /api/admin/create-user-with-password`
- ✅ Add password validation utilities (8+ chars, uppercase, lowercase, number)
- ✅ Run tests to verify all endpoints work (TDD approach successful!)

**🧪 TDD Results:** All endpoints tested and working perfectly. Created test user and verified login/password change flow.

### Phase 3: Frontend Login System (30 min)
- [ ] Create email/password login form (replace Google OAuth)
- [ ] Add password change modal
- [ ] Update invitation acceptance flow
- [ ] Add "Forgot Password" functionality

### Phase 4: Admin Panel Updates (45 min)
- [ ] Add "Create User with Password" functionality
- [ ] Add "Reset Password" functionality
- [ ] Update user management UI
- [ ] Add bulk user creation

### Phase 5: Testing & Deployment (45 min)
- [ ] Test complete flow with Woodstock
- [ ] Create admin users for all 15 businesses
- [ ] Generate deployment credentials
- [ ] Document user creation process

---

## 🎯 IMPLEMENTATION DETAILS

### Backend Endpoints to Add/Modify

```javascript
// New endpoints for email/password auth
POST /api/auth/email-login          // Email/password login
POST /api/auth/change-password      // Change password
POST /api/auth/forgot-password      // Request password reset
POST /api/auth/reset-password       // Reset password with token

// Modified endpoints
POST /api/admin/create-user         // Create user with email/password
POST /api/admin/reset-user-password // Admin reset user password
POST /api/auth/invitation/:token/accept // Accept invitation with password
```

### Frontend Components to Add/Modify

```javascript
// New components
EmailPasswordLogin.jsx              // Replace Google OAuth login
PasswordChangeModal.jsx             // Password change form
ForgotPasswordForm.jsx              // Forgot password form

// Modified components
InvitationPage.jsx                  // Accept invitation with password setup
AdminPanel.jsx                      // Add user management with passwords
```

---

## 📊 CLIENT DEPLOYMENT MATRIX (15 CLIENTS)

| Client # | Business Name | Business ID | Subdomain | Admin Email | Temp Password |
|----------|---------------|-------------|-----------|-------------|---------------|
| 1 | Baer's Furniture | 8584189 | baers | admin@baers.temp | TempPass123! |
| 2 | AiPRL Assist Main | 1047143 | aiprl | admin@aiprl.temp | TempPass123! |
| 3 | Boost Mobile | 1003637 | boost | admin@boost.temp | TempPass123! |
| 4 | Drive Retail Traffic | 1270775 | drive | admin@drive.temp | TempPass123! |
| 5 | Furniture Template | 1441205 | furniture | admin@furniture.temp | TempPass123! |
| 6 | Hooker Furniture | 1022121 | hooker | admin@hooker.temp | TempPass123! |
| 7 | Interiors by Design | 5315491 | interiors | admin@interiors.temp | TempPass123! |
| 8 | Orbit Interactive | 1453419 | orbit | admin@orbit.temp | TempPass123! |
| 9 | Penny Mustard | 2205016 | penny | admin@penny.temp | TempPass123! |
| 10 | Reef Sandals | 1411698 | reef | admin@reef.temp | TempPass123! |
| 11 | RK Guns | 1680441 | rk | admin@rk.temp | TempPass123! |
| 12 | Rural King | 1281352 | rural | admin@rural.temp | TempPass123! |
| 13 | Sports Clips | 1807517 | sports | admin@sports.temp | TempPass123! |
| 14 | Swann's Furniture | 1484971 | swanns | admin@swanns.temp | TempPass123! |
| 15 | Woodstock Furniture | 1145545 | woodstock | admin@woodstock.temp | TempPass123! |

---

## 🔐 SECURITY CONSIDERATIONS

### Password Requirements
- Minimum 8 characters
- Must contain uppercase, lowercase, number
- Bcrypt hashing with salt rounds: 12
- Temp passwords expire in 24 hours

### Session Management
- JWT tokens with 24-hour expiration
- Refresh token mechanism
- Secure cookie storage
- CSRF protection

---

## 🧪 TESTING CHECKLIST

### Phase 1 Testing
- [ ] Database schema updates applied successfully
- [ ] Bcrypt installation and basic hashing test
- [ ] Existing data migration successful

### Phase 2 Testing
- [ ] Email/password login endpoint works
- [ ] Password hashing/verification works
- [ ] Password change endpoint works
- [ ] Invitation with temp password works

### Phase 3 Testing
- [ ] Login form accepts email/password
- [ ] Password change modal works
- [ ] Invitation acceptance with password setup works
- [ ] Error handling for invalid credentials

### Phase 4 Testing
- [ ] Admin can create users with passwords
- [ ] Admin can reset user passwords
- [ ] User management UI shows email instead of Google email
- [ ] Bulk operations work correctly

### Phase 5 Testing
- [ ] Complete flow test with Woodstock
- [ ] All 15 businesses have admin users
- [ ] Login works for each business
- [ ] Password changes work for each business

---

## 📦 DELIVERY PACKAGE

### For Each Client
1. **URL:** `https://[subdomain].aiprlassist.com`
2. **Admin Credentials:**
   - Email: `admin@[subdomain].temp`
   - Password: `TempPass123!`
3. **Instructions:** Must change password on first login

### Documentation
1. **Admin Guide:** How to manage users and passwords
2. **User Guide:** How to login and change passwords
3. **Deployment Guide:** How to deploy for new clients

---

## 🚨 ROLLBACK PLAN

If Plan B fails:
1. **Keep Google OAuth endpoints** (already implemented)
2. **Revert database schema** (backup before changes)
3. **Use hardcoded links** with token-based access
4. **Manual user management** via database

---

*Status: Ready to implement*
*Estimated completion: 3 hours*
*Risk level: LOW (fallback options available)*
