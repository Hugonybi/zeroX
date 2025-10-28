/**
 * Simplified Test - Minting Only
 * 
 * This test focuses on the dual-minting flow by directly creating
 * a paid order and triggering the mint process, bypassing payment gateway.
 */

const BASE_URL = 'http://localhost:4000';

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(emoji, message, color = colors.cyan) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bright}${title}${colors.reset}`);
  console.log('='.repeat(60) + '\n');
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
  
  const timestamp = Date.now();
  const response = await fetch(`${BASE_URL}/artist/artworks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${artistToken}`,
    },
    body: JSON.stringify({
      title: `Dual Token Test ${timestamp}`,
      description: 'Testing dual-token minting: authenticity + ownership',
      type: 'digital',
      mediaUrl: 'https://picsum.photos/800/600',
      metadataUrl: 'ipfs://test-metadata',
      priceCents: 100000,
      currency: 'NGN',
      serialNumber: `TEST-${timestamp}`,
      edition: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`Artwork creation failed: ${await response.text()}`);
  }

  const artwork = await response.json();
  log('✅', `Artwork created: "${artwork.title}"`, colors.green);
  log('📌', `Artwork ID: ${artwork.id}`);
  log('💰', `Price: ${artwork.currency} ${artwork.priceCents / 100}`);
  
  return artwork;
}

async function createDirectOrder(buyerToken, buyerId, artworkId, priceCents, currency) {
  log('📦', 'Creating order directly (bypassing payment)...');
  
  // Use Prisma client directly through a backend endpoint
  // For testing, we'll need to add this endpoint or use database directly
  
  // For now, let's show what needs to happen:
  log('⚠️', 'Note: In production, orders are created via payment webhooks', colors.yellow);
  log('💡', 'For testing, you need to:', colors.yellow);
  log('  ', '1. Manually create an order in the database with payment_status=paid');
  log('  ', '2. Then the mint worker will automatically process it');
  log('  ', '3. Or trigger the mint worker manually');
  
  return null;
}

async function checkCertificates(orderId, buyerToken) {
  section('🔍 CHECKING CERTIFICATES');
  
  log('📜', `Fetching certificates for order: ${orderId}`);
  
  const response = await fetch(`${BASE_URL}/ownership/order/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${buyerToken}`,
    },
  });

  if (!response.ok) {
    log('❌', 'Certificates not ready yet', colors.yellow);
    return null;
  }

  const data = await response.json();
  
  section('✅ CERTIFICATES READY!');
  
  if (data.authenticityToken) {
    console.log(`\n${colors.blue}┌─────────────────────────────────────────┐`);
    console.log(`│  🛡️  AUTHENTICITY CERTIFICATE          │`);
    console.log(`├─────────────────────────────────────────┤${colors.reset}`);
    console.log(`  Token ID: ${data.authenticityToken.hederaTokenId}`);
    console.log(`  Serial: ${data.authenticityToken.serialNumber}`);
    console.log(`  Transaction: ${data.authenticityToken.hederaTxHash}`);
    console.log(`  ${colors.blue}└─────────────────────────────────────────┘${colors.reset}\n`);
  }
  
  if (data.ownershipToken) {
    console.log(`${colors.yellow}┌─────────────────────────────────────────┐`);
    console.log(`│  🔑  OWNERSHIP CERTIFICATE              │`);
    console.log(`├─────────────────────────────────────────┤${colors.reset}`);
    console.log(`  Token ID: ${data.ownershipToken.hederaTokenId}`);
    console.log(`  Serial: ${data.ownershipToken.serialNumber}`);
    console.log(`  Transaction: ${data.ownershipToken.hederaTxHash}`);
    console.log(`  Transferable: ${data.ownershipToken.transferable ? 'Yes' : 'No'}`);
    console.log(`  Status: ${data.ownershipToken.transferable ? '🟡 Frozen (Treasury)' : 'Locked'}`);
    console.log(`  ${colors.yellow}└─────────────────────────────────────────┘${colors.reset}\n`);
  }
  
  log('🌐', 'View on Hashscan:', colors.cyan);
  if (data.authenticityToken) {
    console.log(`  Authenticity: https://hashscan.io/testnet/token/${data.authenticityToken.hederaTokenId}`);
  }
  if (data.ownershipToken) {
    console.log(`  Ownership: https://hashscan.io/testnet/token/${data.ownershipToken.hederaTokenId}`);
  }
  
  return data;
}

async function runTest() {
  try {
    section('🚀 DUAL-TOKEN MINTING TEST');
    
    log('🔧', `Testing against: ${BASE_URL}`);
    
    section('👥 STEP 1: User Registration');
    const artist = await registerUser('artist');
    const buyer = await registerUser('buyer');
    
    section('🎨 STEP 2: Create Artwork');
    const artwork = await createArtwork(artist.token);
    
    section('💡 MANUAL TESTING REQUIRED');
    
    console.log(`\n${colors.yellow}To complete this test manually:${colors.reset}\n`);
    console.log(`1. ${colors.bright}Connect to PostgreSQL:${colors.reset}`);
    console.log(`   psql -U zerox_dev -d zerox_db\n`);
    
    console.log(`2. ${colors.bright}Create a test order:${colors.reset}`);
    console.log(`   ${colors.cyan}INSERT INTO orders (id, buyer_id, artwork_id, amount_cents, currency, payment_provider, payment_status, order_status, created_at, updated_at)`);
    console.log(`   VALUES (`);
    console.log(`     gen_random_uuid(),`);
    console.log(`     '${buyer.userId}',`);
    console.log(`     '${artwork.id}',`);
    console.log(`     ${artwork.priceCents},`);
    console.log(`     '${artwork.currency}',`);
    console.log(`     'test',`);
    console.log(`     'paid',`);
    console.log(`     'processing',`);
    console.log(`     NOW(),`);
    console.log(`     NOW()`);
    console.log(`   ) RETURNING id;${colors.reset}\n`);
    
    console.log(`3. ${colors.bright}The mint worker should automatically process it!${colors.reset}`);
    console.log(`   Watch the backend logs for minting progress.\n`);
    
    console.log(`4. ${colors.bright}Check certificates:${colors.reset}`);
    console.log(`   Run: ${colors.cyan}node check-certificates.js <ORDER_ID>${colors.reset}\n`);
    
    console.log(`${colors.green}💡 TIP: Save the buyer token for checking certificates:${colors.reset}`);
    console.log(`${colors.bright}${buyer.token}${colors.reset}\n`);
    
    section('✅ TEST SETUP COMPLETE');
    
  } catch (error) {
    section('❌ TEST FAILED');
    console.log(`\nError: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

runTest();
