#!/usr/bin/env node

const BASE_URL = 'http://localhost:4000';

async function checkAuthState() {
  console.log('🔍 Checking Authentication State\n');

  // Step 1: Login and save cookies
  console.log('Step 1: Logging in...');
  const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'buyer@test.com',
      password: 'Test1234!'
    }),
  });

  if (!loginResponse.ok) {
    console.log('❌ Login failed');
    return;
  }

  // Extract cookies
  const setCookieHeaders = loginResponse.headers.get('set-cookie');
  console.log('✅ Login successful');
  console.log('Set-Cookie header:', setCookieHeaders);
  
  if (!setCookieHeaders) {
    console.log('⚠️  No cookies set!');
    return;
  }

  // Parse cookies
  const cookies = setCookieHeaders.split(',').map(c => c.trim().split(';')[0]).join('; ');
  console.log('Parsed cookies:', cookies);

  // Step 2: Check /users/me with cookies
  console.log('\nStep 2: Checking /users/me...');
  const meResponse = await fetch(`${BASE_URL}/users/me`, {
    headers: {
      'Cookie': cookies
    }
  });

  if (!meResponse.ok) {
    console.log('❌ Failed to get user:', await meResponse.text());
    return;
  }

  const user = await meResponse.json();
  console.log('✅ User info:');
  console.log(`  - ID: ${user.id}`);
  console.log(`  - Email: ${user.email}`);
  console.log(`  - Role: ${user.role}`);
  console.log(`  - Name: ${user.name}`);

  // Step 3: Try checkout
  console.log('\nStep 3: Testing checkout...');
  const artworksResponse = await fetch(`${BASE_URL}/artworks`);
  const artworks = await artworksResponse.json();
  
  if (!artworks || artworks.length === 0) {
    console.log('❌ No artworks available');
    return;
  }

  const artworkId = artworks[0].id;
  console.log(`  Using artwork: ${artworks[0].title} (${artworkId})`);

  const checkoutResponse = await fetch(`${BASE_URL}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({
      artworkId: artworkId,
      paymentProvider: 'test'
    })
  });

  console.log(`  Status: ${checkoutResponse.status} ${checkoutResponse.statusText}`);
  
  if (!checkoutResponse.ok) {
    const error = await checkoutResponse.text();
    console.log('❌ Checkout failed:', error);
  } else {
    const result = await checkoutResponse.json();
    console.log('✅ Checkout successful!');
    console.log('  Order ID:', result.id);
  }
}

checkAuthState().catch(console.error);
