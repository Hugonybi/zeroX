# Quick Start: RWA Tokenization

## 🚀 What Changed

Your marketplace now mints **TWO tokens** per artwork sale:

1. **Authenticity Certificate** (non-transferable proof)
2. **Ownership Certificate** (frozen, transferable RWA token)

## ⚡ Get Started

### Step 1: Create Ownership Token on Hedera
```bash
cd backend
npm run setup:ownership-token
```

Copy the token ID output (e.g., `0.0.123456`)

### Step 2: Update Environment
Add to your `.env`:
```bash
HEDERA_OWNERSHIP_TOKEN_ID=0.0.123456  # Use token ID from step 1
```

### Step 3: Restart Backend
```bash
npm run start:dev
```

## ✅ Test It

1. **Purchase an artwork** (creates order)
2. **Check order status** → should be `fulfilled`
3. **View certificate**:
   ```bash
   GET /ownership/order/{orderId}
   ```

## 📦 What You Get

### Database
- New `ownership_tokens` table
- Links authenticity + ownership tokens

### API Endpoints
```http
GET /ownership/artwork/:artworkId   # Get by artwork
GET /ownership/order/:orderId       # Get by order
POST /ownership/admin/re-mint       # Admin retry (requires admin role)
```

### Response Example
```json
{
  "ownershipToken": {
    "hederaTokenId": "0.0.123456/1",
    "transferable": true,
    "fractions": 1,
    "hashscanUrl": "https://hashscan.io/testnet/token/0.0.123456"
  },
  "authenticityToken": {
    "hederaTokenId": "0.0.789012/1",
    "hashscanUrl": "https://hashscan.io/testnet/token/0.0.789012"
  }
}
```

## 🔮 Future Ready

- **Fractionalization**: `fractions` field already in place
- **Wallet transfers**: Tokens frozen until buyer connects wallet
- **Secondary market**: Ownership tokens are transferable (when unfrozen)
- **Provenance**: Full history tracked in metadata

## 💰 Cost

~$0.002 USD per artwork sale (0.001 + 0.001)

## 📚 Full Documentation

See `RWA_IMPLEMENTATION_COMPLETE.md` for:
- Architecture details
- Error handling
- Admin remediation
- Future upgrade paths
- Security considerations

---

**Ready to mint your first dual-token artwork!** 🎨✨
