#!/usr/bin/env node

/**
 * Hedera NFT Token Creation Script
 * 
 * This script creates an NFT token on Hedera testnet that will be used
 * for minting authenticity certificates for artwork purchases.
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
  const operatorKey = PrivateKey.fromStringECDSA(privateKey);
  client.setOperator(accountId, operatorKey);

  console.log('Creating NFT token on Hedera testnet...');

  try {
    // Create the NFT token
    const tokenCreateTx = new TokenCreateTransaction()
      .setTokenName('Hedera Art Marketplace Certificates')
      .setTokenSymbol('HAMC')
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

    console.log(`✅ NFT Token created successfully!`);
    console.log(`Token ID: ${tokenId}`);
    console.log(`\nAdd this to your .env file:`);
    console.log(`HEDERA_NFT_TOKEN_ID="${tokenId}"`);
    console.log(`\nYou can view your token at:`);
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