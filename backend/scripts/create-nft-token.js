#!/usr/bin/env node

/**
 * Hedera NFT Token Creation Script
 * 
 * This script creates an NFT token COLLECTION on Hedera testnet that will be used
 * for minting authenticity certificates for artwork purchases.
 * 
 * IMPORTANT: This creates a COLLECTION, not individual NFTs
 * - Each artwork purchase will mint a new NFT with an auto-incremented serial (1, 2, 3, etc.)
 * - The serial number is assigned by Hedera and indicates mint order across ALL artworks
 * - This is separate from any artist-defined edition numbers or catalog IDs
 * 
 * Example: If you mint 3 artworks, you'll get:
 *   - Artwork A → Token 0.0.xxxxx/1
 *   - Artwork B → Token 0.0.xxxxx/2
 *   - Artwork C (Edition 1 of 5) → Token 0.0.xxxxx/3 (metadata contains "Edition 1")
 * 
 * Prerequisites:
 * 1. Set up a Hedera testnet account
 * 2. Fund the account with HBAR
 * 3. Set environment variables for HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY
 * 
 * Usage:
 * node scripts/create-nft-token.js
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

async function createNftToken() {
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

  console.log('Creating NFT token on Hedera testnet...');

  try {
    // Create the NFT token
    const tokenCreateTx = new TokenCreateTransaction()
      .setTokenName('zeroX Certificates')
      .setTokenSymbol('0Xc')
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(accountId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setSupplyKey(operatorKey)
      .setAdminKey(operatorKey)
      .setFreezeDefault(false)
      .setMaxTransactionFee(new Hbar(30))
      .freezeWith(client);

    // Sign and execute the transaction
    const tokenCreateSigned = await tokenCreateTx.sign(operatorKey);
    const tokenCreateSubmit = await tokenCreateSigned.execute(client);

    // Get the receipt
    const tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
    const tokenId = tokenCreateRx.tokenId;

    console.log(`✅ NFT Token Collection created successfully!`);
    console.log(`Token ID: ${tokenId}`);
    console.log(`\n📝 This is a TOKEN COLLECTION, not an individual NFT.`);
    console.log(`   Each artwork purchase will mint a new NFT with serial /1, /2, /3, etc.`);
    console.log(`\nAdd this to your .env file:`);
    console.log(`HEDERA_NFT_TOKEN_ID="${tokenId}"`);
    console.log(`\nYou can view your token collection at:`);
    console.log(`https://hashscan.io/testnet/token/${tokenId}`);

  } catch (error) {
    console.error('❌ Error creating NFT token:', error);
    process.exit(1);
  } finally {
    client.close();
  }
}

// Run the script
createNftToken();