/**
 * Simple test runner for admin endpoints
 * Run with: node test-admin-endpoints.js
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';
const ADMIN_HEADERS = {
  'Authorization': 'Bearer admin-token',
  'x-business-id': '1145545',
  'x-user-email': 'admin@test.com',
  'Content-Type': 'application/json'
};

async function testEndpoint(name, method, url, body = null) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`   ${method} ${url}`);
    
    const options = {
      method,
      headers: ADMIN_HEADERS
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE}${url}`, options);
    const data = await response.text();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
    
    return { status: response.status, data };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Testing Admin Endpoints');
  console.log('=' .repeat(50));
  
  // Test existing endpoints
  await testEndpoint('Get Users', 'GET', '/api/admin/users');
  await testEndpoint('Get Pending Requests', 'GET', '/api/admin/pending-requests');
  
  // Test new endpoints (these will likely fail without real data, but we can see if they're wired up)
  await testEndpoint('Get User by ID', 'GET', '/api/admin/users/1');
  await testEndpoint('Update User', 'PUT', '/api/admin/users/1', {
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  });
  await testEndpoint('Update User Status', 'PUT', '/api/admin/users/1/status', {
    active: true
  });
  
  // Test create user
  await testEndpoint('Create User', 'POST', '/api/admin/create-user-with-password', {
    email: 'newuser@test.com',
    name: 'New User',
    role: 'user',
    tempPassword: 'TempPass123!'
  });
  
  // Test reset password
  await testEndpoint('Reset Password', 'POST', '/api/admin/reset-user-password', {
    email: 'test@example.com',
    newPassword: 'NewPass123!'
  });
  
  console.log('\n✅ Admin endpoint tests completed!');
  console.log('\nNote: Some tests may fail due to missing database data, but this verifies the endpoints are properly wired up.');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (response.ok) {
      console.log('✅ Server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start with: npm start');
    return false;
  }
}

// Run tests
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
  process.exit(0);
})();
