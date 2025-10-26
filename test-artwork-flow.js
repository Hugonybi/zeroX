#!/usr/bin/env node

/**
 * Manual QA script for testing the full artwork creation flow.
 * Run this after starting both backend and frontend servers.
 */

const BASE_URL = 'http://localhost:4000';

async function testArtworkCreationFlow() {
  console.log('🧪 Starting artwork creation flow test\n');

  // Step 1: Register an artist account
  console.log('1️⃣  Registering artist account...');
  const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `artist-${Date.now()}@test.com`,
      password: 'Test123!@#',
      name: 'Test Artist',
      role: 'artist',
    }),
  });

  if (!registerResponse.ok) {
    const errorText = await registerResponse.text();
    console.error('❌ Registration failed:', errorText);
    return;
  }

  const registerData = await registerResponse.json();
  console.log('✅ Artist registered');
  
  const token = registerData.accessToken;
  console.log(`📋 Token: ${token.substring(0, 30)}...`);

  // Step 2: Store token in localStorage instruction
  console.log('\n2️⃣  To test in the browser:');
  console.log('   Open http://localhost:5174 and run in console:');
  console.log(`   localStorage.setItem('auth_token', '${token}');`);
  console.log('   Then navigate to /artists and submit an artwork form.');

  // Step 3: Create artwork via API
  console.log('\n3️⃣  Creating test artwork via API...');
  const artworkPayload = {
    title: 'Test Artwork - API',
    description: 'Created via automated test script',
    type: 'digital',
    mediaUrl: 'https://stub.azureblob.local/artworks/test-artwork.jpg',
    priceCents: 50000,
    currency: 'NGN',
    status: 'published',
  };

  const createResponse = await fetch(`${BASE_URL}/artist/artworks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(artworkPayload),
  });

  if (!createResponse.ok) {
    console.error('❌ Artwork creation failed:', await createResponse.text());
    return;
  }

  const artwork = await createResponse.json();
  console.log('✅ Artwork created:', artwork.title);
  console.log(`   ID: ${artwork.id}`);
  console.log(`   Price: ${artwork.currency} ${artwork.priceCents / 100}`);

  // Step 4: Verify artwork appears in marketplace
  console.log('\n4️⃣  Verifying artwork in marketplace...');
  const listResponse = await fetch(`${BASE_URL}/artworks`);
  const artworks = await listResponse.json();
  const foundArtwork = artworks.find((a) => a.id === artwork.id);

  if (foundArtwork) {
    console.log('✅ Artwork visible in marketplace');
  } else {
    console.error('❌ Artwork not found in marketplace listing');
  }

  console.log('\n✅ Full flow test complete!');
  console.log('\n📱 Manual UI Test Checklist:');
  console.log('   1. Set token in browser localStorage (see command above)');
  console.log('   2. Navigate to http://localhost:5174/artists');
  console.log('   3. Fill out artwork details form');
  console.log('   4. Upload an image file (Azure stub will generate URL)');
  console.log('   5. Set price and click "Publish listing"');
  console.log('   6. Verify success toast appears');
  console.log('   7. Navigate to http://localhost:5174 (home)');
  console.log('   8. Confirm new artwork appears in gallery');
}

testArtworkCreationFlow().catch((error) => {
  console.error('❌ Test failed with error:', error);
  process.exit(1);
});
