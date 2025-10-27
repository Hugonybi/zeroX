#!/usr/bin/env node

/**
 * Hedera Ownership Token Creation Script
 * 
 * This script creates a TRANSFERABLE NFT token on Hedera testnet that represents
 * legal ownership of physical/digital artworks. These tokens are minted frozen
 * by default and can be unfrozen when buyers connect their Hedera wallets.
 * 
 * Key differences from authenticity tokens:
 * - Has freeze key (control transfers)
 * - Has wipe key (emergency clawback)
 * - Tokens frozen by default
 * - Represents transferable ownership rights
 * 
 * Prerequisites:
 * 1. Set up a Hedera testnet account
 * 2. Fund the account with HBAR
 * 3. Set environment variables for HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY
 * 
 * Usage:
 * node scripts/create-ownership-token.js
 */

const {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar
} = require('@hashgraph/sdk');

require('dotenv').config();

async function createOwnershipToken() {
  // Initialize the Hedera client
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;
  
  if (!accountId || !privateKey) {
    console.error('Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY environment variables');
    process.exit(1);
  }

  const client = Client.forTestnet();
  
  // Use fromString() instead of fromStringECDSA() to auto-detect key type
  let operatorKey;
  try {
    operatorKey = PrivateKey.fromString(privateKey);
  } catch (error) {
    console.error('Failed to parse private key. Make sure it is in the correct format.');
    console.error('Expected format: 302e020100300506032b657004220420...');
    process.exit(1);
  }
  
  client.setOperator(accountId, operatorKey);

  console.log('Creating Ownership NFT token on Hedera testnet...');
  console.log('This token will have:');
  console.log('  ✓ Freeze key (control transfers)');
  console.log('  ✓ Wipe key (emergency clawback)');
  console.log('  ✓ Frozen by default (requires unfreeze for transfers)');
  console.log('');

  try {
    // Create the ownership NFT token with advanced key controls
    const tokenCreateTx = new TokenCreateTransaction()
      .setTokenName('Hedera Art Ownership Certificates')
      .setTokenSymbol('HAOC')
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(accountId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setSupplyKey(operatorKey)      // Control minting
      .setAdminKey(operatorKey)        // Token management
      .setFreezeKey(operatorKey)       // Control when transfers are allowed
      .setWipeKey(operatorKey)         // Emergency clawback capability
      .setFreezeDefault(true)          // Tokens start frozen (no transfers until unfrozen)
      .setMaxTransactionFee(new Hbar(30))
      .freezeWith(client);

    // Sign and execute the transaction
    const tokenCreateSigned = await tokenCreateTx.sign(operatorKey);
    const tokenCreateSubmit = await tokenCreateSigned.execute(client);

    // Get the receipt
    const tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
    const tokenId = tokenCreateRx.tokenId;

    console.log(`✅ Ownership NFT Token created successfully!`);
    console.log(`Token ID: ${tokenId}`);
    console.log(`\nToken Properties:`);
    console.log(`  - Type: Non-Fungible Unique (NFT)`);
    console.log(`  - Supply Type: Infinite`);
    console.log(`  - Freeze Default: true (tokens start frozen)`);
    console.log(`  - Transferable: Yes (after unfreezing)`);
    console.log(`\nAdd this to your .env file:`);
    console.log(`HEDERA_OWNERSHIP_TOKEN_ID="${tokenId}"`);
    console.log(`\nYou can view your token at:`);
    console.log(`https://hashscan.io/testnet/token/${tokenId}`);
    console.log(`\n⚠️  Important:`);
    console.log(`  - Tokens will be minted to treasury in frozen state`);
    console.log(`  - Buyers will see ownership certificates immediately`);
    console.log(`  - When buyers connect wallets, you can unfreeze and transfer`);
    console.log(`  - Keep your freeze key secure - it controls all transfers`);

  } catch (error) {
    console.error('❌ Error creating ownership NFT token:', error);
    process.exit(1);
  } finally {
    client.close();
  }
}

// Run the script
createOwnershipToken();
