#!/usr/bin/env node

/**
 * End-to-End Test: Purchase Flow with Dual Certificate Verification
 * 
 * This script tests the complete flow from artwork creation to certificate display:
 * 1. Register artist and create artwork
 * 2. Register buyer and initiate purchase
 * 3. Simulate payment webhook
 * 4. Verify both tokens were minted
 * 5. Retrieve and display certificates
 * 
 * Prerequisites:
 * - Backend running on localhost:4000
 * - Redis running (for job queue)
 * - Hedera testnet configured
 * - PostgreSQL database running
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5174';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(emoji, message, color = colors.reset) {
  console.log(`${emoji} ${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function registerUser(role = 'artist') {
  const timestamp = Date.now();
  const email = `${role}-${timestamp}@test.com`;
  
  log('📝', `Registering ${role}: ${email}`);
  
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'Test123!@#',
      name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role,
    }),
  });

  if (!response.ok) {
    throw new Error(`Registration failed: ${await response.text()}`);
  }

  const data = await response.json();
  log('✅', `${role} registered successfully`, colors.green);
  
  // Decode JWT to get user ID
  const tokenParts = data.accessToken.split('.');
  const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
  
  return { email, token: data.accessToken, userId: payload.sub };
}

async function createArtwork(artistToken) {
  log('🎨', 'Creating test artwork...');
  
  const response = await fetch(`${BASE_URL}/artist/artworks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${artistToken}`,
    },
    body: JSON.stringify({
      title: `Dual Token Test Artwork ${Date.now()}`,
      description: 'Testing dual certificate minting (authenticity + ownership)',
      type: 'physical',
      mediaUrl: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800',
      priceCents: 100000, // 1000 NGN
      currency: 'NGN',
      status: 'published',
      serialNumber: `TEST-${Date.now().toString().slice(-6)}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Artwork creation failed: ${await response.text()}`);
  }

  const artwork = await response.json();
  log('✅', `Artwork created: "${artwork.title}"`, colors.green);
  log('📌', `Artwork ID: ${artwork.id}`, colors.cyan);
  log('💰', `Price: ${artwork.currency} ${artwork.priceCents / 100}`, colors.cyan);
  
  return artwork;
}

async function initiatePurchase(buyerToken, artworkId) {
  log('🛒', 'Initiating checkout...');
  
  const response = await fetch(`${BASE_URL}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${buyerToken}`,
    },
    body: JSON.stringify({
      artworkId,
      paymentProvider: 'test', // Use test mode
    }),
  });

  if (!response.ok) {
    throw new Error(`Checkout failed: ${await response.text()}`);
  }

  const data = await response.json();
  log('✅', 'Checkout initiated', colors.green);
  log('📦', `Order ID: ${data.order.id}`, colors.cyan);
  log('🔗', `Reference: ${data.order.reference}`, colors.cyan);
  
  return data.order;
}

async function completeTestOrder(buyerToken, orderId) {
  log('🎯', 'Completing order in test mode...');
  
  const response = await fetch(`${BASE_URL}/test/complete-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${buyerToken}`,
    },
    body: JSON.stringify({
      orderId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Test order completion failed: ${await response.text()}`);
  }

  const data = await response.json();
  log('✅', 'Order marked as paid and minting started', colors.green);
  
  return data;
}

async function checkOrderStatus(orderId, token) {
  const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    return null;
  }

  return await response.json();
}

async function getCertificate(orderId, token) {
  const response = await fetch(`${BASE_URL}/ownership/order/${orderId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to get certificate: ${await response.text()}`);
  }

  return await response.json();
}

function displayCertificate(cert) {
  logSection('🎫 CERTIFICATE DETAILS');

  // Artwork Info
  console.log(`${colors.bright}Artwork:${colors.reset}`);
  console.log(`  Title: ${cert.artwork.title}`);
  console.log(`  Type: ${cert.artwork.type}`);
  console.log(`  Serial: ${cert.artwork.serialNumber || 'N/A'}\n`);

  // Authenticity Token
  console.log(`${colors.blue}${colors.bright}🔵 Authenticity Certificate (Proof of Origin)${colors.reset}`);
  console.log(`  Token ID: ${colors.cyan}${cert.authenticityToken.hederaTokenId}${colors.reset}`);
  console.log(`  Transaction: ${cert.authenticityToken.hederaTxHash}`);
  console.log(`  Metadata: ${cert.authenticityToken.metadataIpfs}`);
  console.log(`  Explorer: ${colors.cyan}${cert.authenticityToken.hashscanUrl}${colors.reset}\n`);

  // Ownership Token
  console.log(`${colors.yellow}${colors.bright}👑 Ownership Certificate (Asset Rights)${colors.reset}`);
  console.log(`  Token ID: ${colors.cyan}${cert.ownershipToken.hederaTokenId}${colors.reset}`);
  console.log(`  Transaction: ${cert.ownershipToken.hederaTxHash}`);
  console.log(`  Transferable: ${cert.ownershipToken.transferable ? '✅ Yes' : '❌ No'}`);
  console.log(`  Fractions: ${cert.ownershipToken.fractions}`);
  console.log(`  Status: 🔒 Frozen (In Treasury)`);
  console.log(`  Metadata: ${cert.ownershipToken.metadataIpfs}`);
  console.log(`  Explorer: ${colors.cyan}${cert.ownershipToken.hashscanUrl}${colors.reset}\n`);

  // Order Info
  console.log(`${colors.bright}Order Details:${colors.reset}`);
  console.log(`  Reference: ${cert.order.reference}`);
  console.log(`  Amount: ${cert.order.currency} ${cert.order.amountCents / 100}`);
  console.log(`  Date: ${new Date(cert.order.createdAt).toLocaleString()}\n`);

  // Owner
  console.log(`${colors.bright}Owner:${colors.reset}`);
  console.log(`  Name: ${cert.owner.name}`);
  console.log(`  Email: ${cert.owner.email}\n`);
}

async function waitForMinting(orderId, buyerToken, maxWaitSeconds = 30) {
  log('⏳', `Waiting for dual token minting (max ${maxWaitSeconds}s)...`, colors.yellow);
  
  const startTime = Date.now();
  const maxWaitMs = maxWaitSeconds * 1000;
  
  while (Date.now() - startTime < maxWaitMs) {
    await sleep(2000);
    
    try {
      const cert = await getCertificate(orderId, buyerToken);
      
      if (cert && cert.authenticityToken && cert.ownershipToken) {
        const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
        log('✅', `Both tokens minted successfully in ${elapsedSeconds}s!`, colors.green);
        return cert;
      }
    } catch (error) {
      // Certificate not ready yet, continue waiting
    }
    
    process.stdout.write('.');
  }
  
  console.log('');
  throw new Error('Minting timeout - tokens not created within expected time');
}

async function runFullTest() {
  try {
    logSection('🚀 STARTING END-TO-END CERTIFICATE TEST');
    
    // Step 1: Setup
    log('🔧', 'Testing against:', colors.cyan);
    console.log(`   Backend: ${BASE_URL}`);
    console.log(`   Frontend: ${FRONTEND_URL}\n`);

    // Step 2: Register users
    logSection('👥 STEP 1: User Registration');
    const artist = await registerUser('artist');
    await sleep(500);
    const buyer = await registerUser('buyer');

    // Step 3: Create artwork
    logSection('🎨 STEP 2: Artwork Creation');
    const artwork = await createArtwork(artist.token);

    // Step 4: Purchase
    logSection('💳 STEP 3: Purchase Flow');
    const order = await initiatePurchase(buyer.token, artwork.id);

    // Step 5: Complete order (test mode)
    logSection('🎯 STEP 4: Complete Order');
    await completeTestOrder(buyer.token, order.id);

    // Step 5: Wait for minting
    logSection('⛏️ STEP 4: Token Minting');
    const certificate = await waitForMinting(order.id, buyer.token);

    // Step 6: Display results
    displayCertificate(certificate);

    // Step 7: Browser instructions
    logSection('🌐 BROWSER TESTING');
    log('📱', 'To view in the frontend:', colors.cyan);
    console.log(`   1. Set buyer token in localStorage:`);
    console.log(`      ${colors.yellow}localStorage.setItem('auth_token', '${buyer.token}');${colors.reset}`);
    console.log(`   2. Navigate to certificate page:`);
    console.log(`      ${colors.cyan}${FRONTEND_URL}/certificate/${order.id}${colors.reset}\n`);

    log('🔗', 'Quick Links:', colors.cyan);
    console.log(`   Authenticity: ${certificate.authenticityToken.hashscanUrl}`);
    console.log(`   Ownership: ${certificate.ownershipToken.hashscanUrl}`);
    console.log(`   Frontend: ${FRONTEND_URL}/certificate/${order.id}\n`);

    logSection('✅ TEST COMPLETED SUCCESSFULLY');
    
    return {
      success: true,
      orderId: order.id,
      artworkId: artwork.id,
      buyerToken: buyer.token,
      certificate,
    };

  } catch (error) {
    logSection('❌ TEST FAILED');
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
runFullTest();
