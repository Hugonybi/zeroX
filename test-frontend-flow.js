#!/usr/bin/env node

const BASE_URL = 'http://localhost:4000';

async function testFrontendFlow() {
  console.log('🧪 Testing Complete Frontend Flow\n');

  // Step 1: Login as buyer
  console.log('Step 1: Login as buyer...');
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
    console.log('❌ Login failed:', await loginResponse.text());
    return;
  }

  // Extract cookies
  const setCookie = loginResponse.headers.get('set-cookie');
  console.log('✅ Login successful');
  console.log('Cookies:', setCookie?.substring(0, 100) + '...\n');

  // Parse cookies for manual sending (simulating browser)
  const cookies = setCookie?.split(',').map(c => c.trim().split(';')[0]).join('; ') || '';

  // Step 2: Verify user info
  console.log('Step 2: Verify user info...');
  const meResponse = await fetch(`${BASE_URL}/users/me`, {
    headers: { 'Cookie': cookies }
  });

  if (!meResponse.ok) {
    console.log('❌ Failed to get user:', await meResponse.text());
    return;
  }

  const user = await meResponse.json();
  console.log('✅ User authenticated:');
  console.log(`   Email: ${user.email}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   ID: ${user.id}\n`);

  // Step 3: Get an artwork
  console.log('Step 3: Get artwork...');
  const artworksResponse = await fetch(`${BASE_URL}/artworks`);
  const artworks = await artworksResponse.json();
  
  if (!artworks || artworks.length === 0) {
    console.log('❌ No artworks available');
    return;
  }

  const artwork = artworks[0];
  console.log(`✅ Found artwork: "${artwork.title}"`);
  console.log(`   ID: ${artwork.id}\n`);

  // Step 4: Test checkout (this is what fails)
  console.log('Step 4: Attempt checkout...');
  console.log('Request details:');
  console.log(`   URL: ${BASE_URL}/checkout`);
  console.log(`   Method: POST`);
  console.log(`   Body: { artworkId: "${artwork.id}", paymentProvider: "paystack" }`);
  console.log(`   Cookies: ${cookies.substring(0, 50)}...`);
  
  const checkoutResponse = await fetch(`${BASE_URL}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({
      artworkId: artwork.id,
      paymentProvider: 'paystack'
    })
  });

  console.log(`\n📊 Response: ${checkoutResponse.status} ${checkoutResponse.statusText}`);
  
  if (!checkoutResponse.ok) {
    const errorText = await checkoutResponse.text();
    console.log('❌ Checkout failed!');
    console.log('Error response:', errorText);
    
    try {
      const errorJson = JSON.parse(errorText);
      console.log('\nParsed error:');
      console.log(JSON.stringify(errorJson, null, 2));
    } catch {}
  } else {
    const result = await checkoutResponse.json();
    console.log('✅ Checkout successful!');
    console.log('Order ID:', result.order?.id);
  }
}

testFrontendFlow().catch(console.error);
