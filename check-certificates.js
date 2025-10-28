/**
 * Certificate Checker
 * Usage: node check-certificates.js <ORDER_ID> [BUYER_TOKEN]
 */

const BASE_URL = 'http://localhost:4000';
const orderId = process.argv[2];
const buyerToken = process.argv[3];

if (!orderId) {
  console.error('Usage: node check-certificates.js <ORDER_ID> [BUYER_TOKEN]');
  process.exit(1);
}

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function checkCertificates() {
  console.log(`\n${colors.cyan}🔍 Checking certificates for order: ${orderId}${colors.reset}\n`);
  
  const headers = {};
  if (buyerToken) {
    headers['Authorization'] = `Bearer ${buyerToken}`;
  }
  
  const response = await fetch(`${BASE_URL}/ownership/order/${orderId}`, { headers });

  if (!response.ok) {
    if (response.status === 404) {
      console.log(`${colors.yellow}⏳ Certificates not ready yet. Minting might still be in progress...${colors.reset}\n`);
      console.log(`Try running this command again in a few seconds.`);
    } else {
      console.log(`${colors.red}❌ Error: ${response.status} ${response.statusText}${colors.reset}`);
      console.log(await response.text());
    }
    process.exit(1);
  }

  const data = await response.json();
  
  console.log(`${colors.green}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✅ CERTIFICATES READY!${colors.reset}`);
  console.log(`${colors.green}═══════════════════════════════════════════════════${colors.reset}\n`);
  
  // Authenticity Certificate
  if (data.authenticityToken) {
    console.log(`${colors.blue}┌───────────────────────────────────────────────┐`);
    console.log(`│  🛡️   AUTHENTICITY CERTIFICATE               │`);
    console.log(`│       Proof of Origin (Non-Transferable)     │`);
    console.log(`├───────────────────────────────────────────────┤${colors.reset}`);
    console.log(`  Token ID:      ${data.authenticityToken.hederaTokenId}`);
    console.log(`  Serial #:      ${data.authenticityToken.serialNumber}`);
    console.log(`  Transaction:   ${data.authenticityToken.hederaTxHash}`);
    if (data.authenticityToken.metadataIpfs) {
      console.log(`  Metadata:      ${data.authenticityToken.metadataIpfs}`);
    }
    console.log(`  Minted:        ${new Date(data.authenticityToken.mintedAt).toLocaleString()}`);
    console.log(`  ${colors.blue}└───────────────────────────────────────────────┘${colors.reset}\n`);
  } else {
    console.log(`${colors.red}❌ Authenticity certificate not found${colors.reset}\n`);
  }
  
  // Ownership Certificate
  if (data.ownershipToken) {
    const frozenStatus = data.ownershipToken.transferable ? '🟡 Frozen (Treasury)' : '🔴 Locked';
    console.log(`${colors.yellow}┌───────────────────────────────────────────────┐`);
    console.log(`│  🔑  OWNERSHIP CERTIFICATE                    │`);
    console.log(`│      Transferable Asset Token                │`);
    console.log(`├───────────────────────────────────────────────┤${colors.reset}`);
    console.log(`  Token ID:      ${data.ownershipToken.hederaTokenId}`);
    console.log(`  Serial #:      ${data.ownershipToken.serialNumber}`);
    console.log(`  Transaction:   ${data.ownershipToken.hederaTxHash}`);
    console.log(`  Status:        ${frozenStatus}`);
    console.log(`  Transferable:  ${data.ownershipToken.transferable ? 'Yes ✅' : 'No ❌'}`);
    console.log(`  Fractions:     ${data.ownershipToken.fractions || 1}`);
    if (data.ownershipToken.metadataIpfs) {
      console.log(`  Metadata:      ${data.ownershipToken.metadataIpfs}`);
    }
    console.log(`  Minted:        ${new Date(data.ownershipToken.mintedAt).toLocaleString()}`);
    console.log(`  ${colors.yellow}└───────────────────────────────────────────────┘${colors.reset}\n`);
  } else {
    console.log(`${colors.red}❌ Ownership certificate not found${colors.reset}\n`);
  }
  
  // Artwork Info
  if (data.artwork) {
    console.log(`${colors.cyan}📸 Artwork Details:${colors.reset}`);
    console.log(`  Title:         ${data.artwork.title}`);
    console.log(`  Artist:        ${data.artwork.artist?.name || 'Unknown'}`);
    console.log(`  Type:          ${data.artwork.type}`);
    console.log(`  Edition:       ${data.artwork.edition || 'N/A'}`);
    console.log();
  }
  
  // Order Info
  if (data.order) {
    console.log(`${colors.cyan}📦 Order Details:${colors.reset}`);
    console.log(`  Order ID:      ${data.order.id}`);
    console.log(`  Amount:        ${data.order.currency} ${data.order.amountCents / 100}`);
    console.log(`  Status:        ${data.order.orderStatus}`);
    console.log(`  Payment:       ${data.order.paymentStatus}`);
    console.log();
  }
  
  // Hashscan Links
  console.log(`${colors.cyan}🌐 View on Hedera Explorer:${colors.reset}`);
  if (data.authenticityToken) {
    const authUrl = `https://hashscan.io/testnet/token/${data.authenticityToken.hederaTokenId}`;
    console.log(`  Authenticity:  ${colors.bright}${authUrl}${colors.reset}`);
  }
  if (data.ownershipToken) {
    const ownUrl = `https://hashscan.io/testnet/token/${data.ownershipToken.hederaTokenId}`;
    console.log(`  Ownership:     ${colors.bright}${ownUrl}${colors.reset}`);
  }
  console.log();
  
  // Frontend Link
  console.log(`${colors.cyan}💻 View in Browser:${colors.reset}`);
  console.log(`  ${colors.bright}http://localhost:5174/certificate/${orderId}${colors.reset}`);
  console.log();
}

checkCertificates().catch(error => {
  console.error(`\n${colors.red}Error: ${error.message}${colors.reset}\n`);
  process.exit(1);
});
