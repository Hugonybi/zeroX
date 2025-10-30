#!/usr/bin/env node

/**
 * Debug script to test checkout endpoint
 * This will help identify whether the issue is authentication or something else
 */

const BASE_URL = 'http://localhost:4000';

async function testCheckout() {
  console.log('🔍 Testing Checkout Endpoint Debug\n');

  // First, let's register/login to get a valid session
  console.log('Step 1: Logging in as a buyer...');
  
  const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'buyer@test.com',
      password: 'Test1234!'
    }),
    credentials: 'include', // Important: include cookies
  });

  if (!loginResponse.ok) {
    console.log('❌ Login failed. Let\'s try registering first...');
    
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'buyer@test.com',
        password: 'Test1234!',
        name: 'Test Buyer',
        role: 'buyer'
      }),
      credentials: 'include',
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.text();
      console.log('❌ Registration also failed:', error);
      return;
    }
    
    console.log('✅ Registered successfully');
  } else {
    console.log('✅ Logged in successfully');
  }

  // Extract cookies from the response
  const cookies = loginResponse.headers.get('set-cookie') || '';
  console.log('Cookies received:', cookies ? 'Yes' : 'No');

  // Now let's get an artwork ID
  console.log('\nStep 2: Getting an artwork to purchase...');
  const artworksResponse = await fetch(`${BASE_URL}/artworks`, {
    credentials: 'include',
  });

  if (!artworksResponse.ok) {
    console.log('❌ Failed to fetch artworks');
    return;
  }

  const artworks = await artworksResponse.json();
  if (!artworks || artworks.length === 0) {
    console.log('❌ No artworks available. Please create one first.');
    return;
  }

  const artwork = artworks[0];
  console.log(`✅ Found artwork: "${artwork.title}" (ID: ${artwork.id})`);

  // Now test the checkout
  console.log('\nStep 3: Testing checkout endpoint...');
  const checkoutResponse = await fetch(`${BASE_URL}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      artworkId: artwork.id,
      paymentProvider: 'test'
    }),
    credentials: 'include', // Important: send cookies
  });

  console.log('Checkout Response Status:', checkoutResponse.status);

  if (!checkoutResponse.ok) {
    const errorText = await checkoutResponse.text();
    console.log('❌ Checkout failed:', errorText);
    
    // Try to parse as JSON
    try {
      const errorJson = JSON.parse(errorText);
      console.log('\nError details:');
      console.log(JSON.stringify(errorJson, null, 2));
    } catch {
      console.log('\nRaw error:', errorText);
    }
  } else {
    const result = await checkoutResponse.json();
    console.log('✅ Checkout successful!');
    console.log(JSON.stringify(result, null, 2));
  }
}

testCheckout().catch(console.error);
