#!/usr/bin/env node

const BASE_URL = 'http://localhost:4000';

async function testUserRole() {
  console.log('🔍 Testing User Role\n');

  // Login
  const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'buyer@test.com',
      password: 'Test1234!'
    }),
    credentials: 'include',
  });

  if (!loginResponse.ok) {
    console.log('❌ Login failed');
    return;
  }

  console.log('✅ Logged in successfully\n');

  // Get current user
  const meResponse = await fetch(`${BASE_URL}/users/me`, {
    credentials: 'include',
  });

  if (!meResponse.ok) {
    console.log('❌ Failed to get user info');
    return;
  }

  const user = await meResponse.json();
  console.log('Current user:');
  console.log(JSON.stringify(user, null, 2));
  console.log('\n👤 User role:', user.role);
  console.log('📧 Email:', user.email);
}

testUserRole().catch(console.error);
