# zeroX — Hedera Art Marketplace

> 🏆 [View Hedera Certification](https://drive.google.com/file/d/1tDTYvuTQ4h7LX9OQONDA2Kzt-0LyfTfZ/view?usp=sharing)


> 🏆 [Pitch Deck](https://docs.google.com/presentation/d/1a104EqlB6hPzeADcOWXvzMWrQvHcE7ZF/edit?slide=id.p1#slide=id.p1)

## Elevator Pitch

A fiat-first art marketplace connecting artists with global collectors, automatically issuing Hedera-backed authenticity certificates (NFT-like tokens) after every successful payment—no crypto wallets required.

---

## Problem Statement

- **Artists**: Struggle to reach global collectors, lack verifiable provenance for their work, and need accessible platforms that don't require crypto knowledge
- **Collectors/Buyers**: Want authentic art with verifiable ownership, need secure payment methods, and desire blockchain-backed certificates without managing crypto wallets
- **Current Gap**: No accessible platform exists that seamlessly combines traditional fiat payments with blockchain-based authenticity while maintaining a delightful user experience

---

## Solution

A two-sided marketplace where:

- **Artists** list physical or digital artworks with complete control over pricing, editions, and metadata
- **Buyers** browse and purchase art using familiar payment methods (Stripe/Paystack)
- **Smart automation** mints Hedera authenticity tokens after successful payments
- **Certificates** are issued showing provenance, token ID, and transaction hash
- **NFTs** remain non-transferable in MVP (treasury-held proof), enabling future secondary markets

---

## Core User Flows

### Artist Journey

1. **Register** → Create artist profile with bio, social links, professional background
2. **Submit artwork** → Upload images, add metadata (title, description, medium, dimensions, price)
3. **Choose options** → Select physical/digital, set editions, define catalog numbers
4. **Admin review** → Manual KYC verification and artwork moderation
5. **Go live** → Artwork published to marketplace
6. **Track sales** → Dashboard shows orders, revenue, and minted certificates
7. **Get paid** → Direct fiat payments via integrated payment processor

### Buyer Journey

1. **Browse gallery** → Filter by category, artist, price range, medium
2. **View details** → High-resolution images, artist bio, artwork specifications
3. **Add to cart** → Select purchase options, review cart with expiration warnings
4. **Checkout** → Enter shipping details, pay with credit/debit card (no crypto wallet needed)
5. **Payment confirmation** → Receive order confirmation via email
6. **Certificate issuance** → Background job mints Hedera authenticity token
7. **Receive certificate** → View certificate page with token ID, Hedera transaction hash, and explorer link
8. **Track order** → Monitor shipping and delivery status

### Admin Journey

1. **Review submissions** → Approve or reject artwork listings with moderation notes
2. **Monitor orders** → View all transactions, payment statuses, and order lifecycle
3. **Manage users** → Handle KYC verification, user roles, and access control
4. **Troubleshoot minting** → Re-mint failed certificates, inspect queue status
5. **Audit trail** → Review complete provenance history across artworks, orders, and mint events

---

## Data Architecture

### Core Models

```typescript
User {
  id: uuid
  email: string (unique)
  role: enum('buyer', 'artist', 'admin')
  name: string
  bio: string
  kycStatus: enum('none', 'pending', 'verified', 'rejected')
  createdAt: timestamp
  updatedAt: timestamp
}

Artwork {
  id: uuid
  artistId: uuid → User
  title: string
  description: string
  type: enum('physical', 'digital')
  mediaUrl: string
  metadataUrl: string (IPFS)
  serialNumber: string (artist catalog number)
  edition: int (e.g., 5 of 10)
  priceCents: int
  currency: string
  status: enum('draft', 'published', 'sold', 'removed')
  medium: string
  category: string
  tags: string[]
  dimensions: object
  inventory: {
    totalQuantity: int
    availableQuantity: int
    reservedQuantity: int
  }
  createdAt: timestamp
  updatedAt: timestamp
}

Order {
  id: uuid
  buyerId: uuid → User
  artworkId: uuid → Artwork
  amountCents: int
  currency: string
  paymentProvider: string
  paymentStatus: enum('pending', 'paid', 'failed', 'refunded')
  orderStatus: enum('created', 'processing', 'fulfilled', 'cancelled', 'mint_failed')
  reference: string (unique)
  shippingAddress: json
  shippingMethod: string
  trackingNumber: string
  createdAt: timestamp
  updatedAt: timestamp
}

AuthToken {
  id: uuid
  artworkId: uuid → Artwork
  orderId: uuid → Order (unique)
  hederaTokenId: string (format: "0.0.XXXXX/serial")
  hederaTxHash: string
  metadataIpfs: string
  mintedBy: string
  mintedAt: timestamp
}

AuditLog {
  id: uuid
  entityType: string
  entityId: uuid
  action: string
  metaJson: jsonb
  createdAt: timestamp
}
```

---

## API Surface

### Public Endpoints
```http
GET    /artworks                    # Browse artworks with filters
GET    /artworks/:id                # Get artwork details
GET    /artists/:id                 # View artist profile
```

### Authentication
```http
POST   /auth/register               # User registration
POST   /auth/login                  # Login with email/password
POST   /auth/refresh                # Refresh access token
POST   /auth/logout                 # Logout and revoke tokens
```

### Buyer Endpoints (Authenticated)
```http
POST   /cart/items                  # Add artwork to cart
GET    /cart                        # View cart contents
DELETE /cart/items/:id              # Remove from cart
POST   /checkout                    # Create payment intent
GET    /orders/:id/certificate      # View authenticity certificate
GET    /orders                      # Order history
POST   /wishlist                    # Add to wishlist
```

### Artist Endpoints (Authenticated)
```http
POST   /artworks                    # Create new artwork listing
PUT    /artworks/:id                # Update artwork
DELETE /artworks/:id                # Remove artwork
GET    /artist/sales                # View sales dashboard
GET    /artist/artworks             # Manage artwork listings
PUT    /artist/profile              # Update artist profile
```

### Admin Endpoints (Authenticated)
```http
GET    /admin/submissions           # Moderation queue
POST   /admin/artworks/:id/approve  # Approve artwork
POST   /admin/artworks/:id/reject   # Reject artwork
GET    /admin/orders                # View all orders
POST   /admin/orders/:id/remint     # Retry failed minting
GET    /admin/users                 # User management
PUT    /admin/users/:id/kyc         # Update KYC status
GET    /admin/audit-logs            # View audit trail
```

---

## Purchase-to-Mint Flow

### The Automated Journey

1. **Checkout initiated** → Backend creates order with `paymentStatus=pending`, `orderStatus=created`
2. **Payment intent** → System generates Stripe/Paystack payment intent, returns client secret to frontend
3. **Payment success** → Provider fires webhook with payment confirmation
4. **Webhook validation** → Backend verifies signature, checks for replay attacks
5. **Status update** → Set `paymentStatus=paid`, `orderStatus=processing`
6. **Queue job** → Enqueue `mint_authenticity` background job via BullMQ/Redis
7. **Metadata assembly** → Worker creates certificate JSON with artwork details, buyer info, order reference
8. **IPFS pinning** → Upload metadata to IPFS via Pinata, get content hash
9. **Hedera minting** → Execute NFT mint using Hedera Token Service with operator credentials
10. **Record token** → Store `hederaTokenId` (format: CollectionID/Serial), `hederaTxHash`, IPFS URL
11. **Mark fulfilled** → Update order to `orderStatus=fulfilled`
12. **Send confirmation** → Email buyer with certificate page link and Hedera explorer URL
13. **Failure handling** → Retries with exponential backoff (configurable attempts); escalate to admin if persistent

### Error Recovery

- **Transient failures**: Automatic retry (default: 2 attempts, 250ms delay)
- **Persistent failures**: Flag order as `mint_failed`, alert admin dashboard
- **Manual remediation**: Admin can trigger re-mint via admin console
- **Audit logging**: Every step recorded in audit trail for forensics

---

## Hedera Integration Guidelines

### Token Architecture

- **Token Type**: Non-fungible tokens (NFTs) via Hedera Token Service (HTS)
- **Collection approach**: One NFT minted per fulfilled order
- **Operator custody**: Private keys stored in managed secret store (never exposed to clients)
- **Treasury holding**: NFTs remain in treasury account (non-transferable in MVP)
- **Future readiness**: Retain admin/supply/freeze keys for secondary market enablement

### Key Management

```javascript
// Key hierarchy for future flexibility
{
  adminKey: "Controls token properties",
  supplyKey: "Enables minting new NFTs",
  freezeKey: "Can freeze/unfreeze accounts (for auctions)",
  kycKey: "Optional KYC gating for transfers",
  wipeKey: "Emergency clawback capability"
}
```

### Edge Cases

- **Association requirement**: Wallets must associate before receiving transfers (Phase 2)
- **Key custody**: Protect all keys in same vault as operator to prevent compromise
- **Serial supply lock**: Disable supply key after edition complete to prevent inflation
- **Rate limiting**: Hedera testnet throttles aggressive minting (use retry delays)

### Certificate Data

Stored on IPFS and linked on-chain:

```json
{
  "artwork": {
    "title": "Sunset Over Lagos",
    "artist": "Adebayo Ojo",
    "medium": "Oil on Canvas",
    "dimensions": "100x80 cm",
    "year": 2024,
    "serialNumber": "ART-2024-042",
    "edition": "5/10"
  },
  "order": {
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "buyerName": "Jane Collector",
    "purchaseDate": "2024-10-31T14:23:00Z",
    "amountPaid": "₦500,000"
  },
  "certificate": {
    "hederaTokenId": "0.0.7145131/42",
    "hederaTxHash": "0.0.12345@1698764580.123456789",
    "metadataIpfs": "ipfs://QmX...",
    "mintedAt": "2024-10-31T14:25:00Z"
  }
}
```

---

## Quick Start

### Prerequisites

- **Node.js** 18+ with npm
- **PostgreSQL** 15+
- **Redis** 6+
- **Hedera Testnet Account** with HBAR
- **Pinata Account** (IPFS)
- **Paystack/Stripe Account** (payments)

### Installation

```bash
# Clone repository
git clone https://github.com/Hugonybi/zeroX.git
cd zeroX

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### Environment Setup

**Frontend `.env`:**
```bash
VITE_API_BASE_URL=http://localhost:4000
VITE_USE_MOCK_ARTWORKS=false
```

**Backend `backend/.env`:**
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/hedera_marketplace"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Hedera (Testnet)
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY
HEDERA_TREASURY_ACCOUNT_ID=0.0.YOUR_TREASURY_ID
HEDERA_TREASURY_PRIVATE_KEY=YOUR_TREASURY_KEY
HEDERA_NFT_TOKEN_ID=  # Generated during setup
HEDERA_MINT_MAX_ATTEMPTS=2
HEDERA_RETRY_DELAY_MS=250

# IPFS
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Payments
PAYSTACK_SECRET_KEY=sk_test_your_key
PAYSTACK_PUBLIC_KEY=pk_test_your_key

# Auth
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# App
NODE_ENV=development
PORT=4000
```

### Start Infrastructure

```bash
# Start PostgreSQL and Redis with Docker
cd backend
docker-compose -f docker-compose.infrastructure.yml up -d
```

### Database Setup

```bash
# Run migrations
cd backend
npm run prisma:migrate

# Seed demo data
npm run db:seed
```

### Create Hedera NFT Collection

```bash
# Generate NFT token on Hedera testnet
cd backend
npm run setup:token

# Copy the token ID to your .env file
# Example output: "Created NFT token: 0.0.7145131"
```

### Run Application

```bash
# Terminal 1: Start backend
cd backend
npm run start:dev

# Terminal 2: Start frontend
cd ../
npm run dev
```

**Access the app:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Swagger Docs: http://localhost:4000/api

### Demo Accounts (from seed)

```
Admin:
Email: admin@zerox.art
Password: admin123

Artist:
Email: artist@zerox.art
Password: artist123

Buyer:
Email: buyer@zerox.art
Password: buyer123
```

---

## Technical Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Auth**: JWT access + refresh tokens

### Backend
- **Framework**: NestJS (TypeScript)
- **ORM**: Prisma
- **Database**: PostgreSQL 15+
- **Cache/Queue**: Redis (BullMQ)
- **Storage**: AWS S3 / Cloudflare R2
- **IPFS**: Pinata
- **Payments**: Stripe + Paystack
- **Blockchain**: Hedera SDK (@hashgraph/sdk)
- **Auth**: Passport.js with JWT strategy

---

## Frontend Pages (MVP)

### 1. Home/Gallery
**Elements:**
- Hero section with featured artworks carousel
- Filter sidebar: Category, medium, price range, artist
- Artwork grid with lazy loading
- Card displays: Image, title, artist, price, "View Details" button
- Search bar with real-time filtering
- "Featured Artists" section

### 2. Artwork Detail Page
**Elements:**
- High-resolution image viewer (zoom, multiple angles)
- Artwork metadata: Title, artist, year, dimensions, medium
- Artist bio snippet with link to full profile
- Price and availability status
- "Add to Cart" / "Add to Wishlist" buttons
- Shipping information estimator
- Related artworks carousel
- Certificate preview (if already sold)

### 3. Artist Profile
**Elements:**
- Profile header: Photo, name, bio, social links
- Professional credentials: Education, exhibitions, awards
- Artist's artwork gallery (filterable)
- Contact/inquiry button
- Sales statistics (if public)

### 4. Create Artwork (Artist)
**Form Fields:**
- Basic info: Title, description, year created
- Media upload: Drag-and-drop image uploader (multi-angle support)
- Classification: Category, medium, tags
- Dimensions: Height, width, depth (with unit selector)
- Type: Physical / Digital / Both
- Pricing: Amount, currency
- Inventory: Unique piece or edition (if edition: total quantity, catalog number)
- Submit for review button

### 5. Artist Dashboard
**Sections:**
- Overview: Total sales, active listings, pending approvals
- Artworks table: Title, status, price, views, actions (Edit/Remove)
- Sales history: Order date, buyer (anonymized), amount, certificate link
- Analytics: Views over time, top-performing pieces
- Profile management: Update bio, photos, links

### 6. Cart & Checkout
**Elements:**
- Cart summary: Item thumbnails, prices, remove buttons
- Expiration warning: "Reserved for 15 minutes"
- Subtotal, shipping, tax breakdown
- Shipping form: Name, address, phone, delivery preferences
- Payment element: Stripe/Paystack card input
- "Place Order" button with loading state
- Order confirmation page with tracking info

### 7. Buyer Dashboard
**Sections:**
- My Collection: Purchased artworks with certificate links
- Order History: Status tracking (pending → paid → shipped → delivered)
- Wishlist: Saved artworks with price alerts
- Profile settings: Shipping addresses, payment methods

### 8. Certificate Page
**Elements:**
- Certificate header: "Authenticity Certificate"
- Artwork image and details
- Buyer information (name, purchase date)
- Hedera integration:
  - Token ID (e.g., `0.0.7145131/42`)
  - Transaction hash (clickable link to Hedera explorer)
  - Minted timestamp
- Download as PDF button
- QR code for mobile verification
- "Verified on Hedera" badge

### 9. Admin Console
**Sections:**
- Pending Submissions:
  - Artwork cards with image, artist, details
  - Approve/Reject buttons with note field
- Order Monitor:
  - All orders table with filters (status, date, amount)
  - Payment status indicators
  - Minting status (success/failed/retrying)
- Failed Mints Queue:
  - Orders with minting failures
  - Error details
  - "Re-mint" action button
- User Management:
  - User list with role filters
  - KYC status controls
  - Account actions (suspend, delete)
- Audit Logs:
  - Searchable log viewer
  - Filter by entity type, action, date range

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Support & Contact

- **Email**: support@zerox.art
- **GitHub Issues**: [github.com/Hugonybi/zeroX/issues](https://github.com/Hugonybi/zeroX/issues)
- **Hedera Discord**: [hedera.com/discord](https://hedera.com/discord)

---

## Acknowledgments

Built with:
- [Hedera Hashgraph](https://hedera.com/) - Sustainable blockchain technology
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [React](https://react.dev/) - UI library
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Paystack](https://paystack.com/) - African payment infrastructure
- [Pinata](https://pinata.cloud/) - IPFS pinning service

---

## Demo Flow Script

**For presentations/testing:**

### Setup
3 pre-seeded artworks: 1 sold, 1 available, 1 draft

### Step 1: Browse (Public)
1. Open homepage → See artwork gallery
2. Apply filters (category: "Painting", price: <₦500k)
3. View featured artist profiles

### Step 2: Purchase Flow (Buyer)
1. Login as buyer (`buyer@zerox.art`)
2. Click artwork → View details
3. Add to cart → Proceed to checkout
4. Enter shipping address
5. Complete payment (Paystack test card: `5060666666666666666`)
6. See "Payment successful" confirmation

### Step 3: Minting (Background)
1. Switch to backend logs → Show job processing
2. Watch IPFS upload → "Metadata pinned: QmX..."
3. Hedera mint → "NFT minted: 0.0.7145131/5"
4. Order status → "fulfilled"

### Step 4: Certificate (Buyer)
1. Return to frontend → Go to "My Collection"
2. Click order → View certificate page
3. Show Hedera token ID and transaction hash
4. Click "View on Hedera Explorer" → Opens mirror node
5. Download PDF certificate

### Step 5: Artist Dashboard
1. Login as artist (`artist@zerox.art`)
2. View sales dashboard → New sale appears
3. Check minted certificate details
4. See revenue breakdown

### Step 6: Admin Actions
1. Login as admin (`admin@zerox.art`)
2. Navigate to pending submissions
3. Approve new artwork → Goes live
4. View audit logs → Show complete trail
5. Simulate failed mint → Trigger re-mint action

### Impact Metrics Display
Show platform stats:
- "₦2,500,000 in sales"
- "47 artworks authenticated"
- "23 artists onboarded"
- "156 certificates issued"

---

### Authentication Flow

```javascript
// 1. Register
POST /auth/register
{
  "email": "artist@example.com",
  "password": "SecurePass123!",
  "name": "Adebayo Ojo",
  "role": "artist"
}

// 2. Login
POST /auth/login
{
  "email": "artist@example.com",
  "password": "SecurePass123!"
}
Response: {
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "uuid", "email": "...", "role": "artist" }
}

// 3. Refresh token
POST /auth/refresh
Headers: { "Authorization": "Bearer <refreshToken>" }

// 4. Logout
POST /auth/logout
```

### Artwork Management

```javascript
// Create artwork (Artist only)
POST /artworks
Headers: { "Authorization": "Bearer <accessToken>" }
FormData: {
  "title": "Sunset Over Lagos",
  "description": "Vibrant oil painting...",
  "type": "physical",
  "medium": "Oil on Canvas",
  "category": "Painting",
  "priceCents": 50000000,  // ₦500,000
  "currency": "NGN",
  "dimensionHeight": 100,
  "dimensionWidth": 80,
  "dimensionUnit": "cm",
  "yearCreated": 2024,
  "serialNumber": "ART-2024-042",
  "edition": 5,
  "totalQuantity": 10,
  "tags": ["landscape", "contemporary", "lagos"],
  "image": File  // multipart upload
}

// Browse artworks (Public)
GET /artworks?category=Painting&minPrice=10000&maxPrice=100000&page=1&limit=20

// Get artwork details
GET /artworks/:id
```

### Checkout Flow

```javascript
// Add to cart
POST /cart/items
{
  "artworkId": "550e8400-e29b-41d4-a716-446655440000",
  "purchaseOption": { "type": "physical" }
}

// Create checkout session
POST /checkout
{
  "cartItems": ["cartItemId1", "cartItemId2"],
  "shippingAddress": {
    "name": "Jane Collector",
    "street": "123 Art Street",
    "city": "Lagos",
    "state": "Lagos",
    "postalCode": "100001",
    "country": "Nigeria",
    "phone": "+234 123 456 7890"
  }
}
Response: {
  "orderId": "uuid",
  "paymentIntentId": "pi_xyz",
  "clientSecret": "pi_xyz_secret_abc",
  "amountCents": 50000000
}

// Payment webhook (Paystack/Stripe)
POST /payments/webhook
Headers: { "x-paystack-signature": "signature" }
Body: { /* Provider payload */ }
```

### Certificate Retrieval

```javascript
// Get certificate (Buyer/Admin)
GET /orders/:id/certificate
Response: {
  "orderId": "uuid",
  "artwork": {
    "title": "Sunset Over Lagos",
    "artist": "Adebayo Ojo",
    "serialNumber": "ART-2024-042"
  },
  "buyer": { "name": "Jane Collector" },
  "certificate": {
    "hederaTokenId": "0.0.7145131/42",
    "hederaTxHash": "0.0.12345@1698764580.123456789",
    "metadataIpfs": "ipfs://QmX...",
    "mintedAt": "2024-10-31T14:25:00Z",
    "explorerUrl": "https://hashscan.io/testnet/token/0.0.7145131/42"
  }
}
```

---
