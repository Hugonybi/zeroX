# Project Structure

## Repository Layout
```
zeroX/
├── src/                    # Frontend React application
├── backend/                # NestJS backend service
├── .kiro/                  # Kiro configuration and specs
└── [config files]          # Root-level configuration
```

## Frontend Structure (`src/`)
```
src/
├── components/             # Reusable UI components
│   └── ProtectedRoute.tsx  # Route guards for authentication
├── layouts/                # Page layout components
│   └── RootLayout.tsx      # Main application layout
├── pages/                  # Route-specific page components
│   ├── GalleryPage.tsx     # Public artwork gallery
│   ├── ArtworkDetailPage.tsx
│   ├── ArtistsPage.tsx     # Artist dashboard
│   ├── AdminPage.tsx       # Admin interface
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ProfilePage.tsx
│   └── CertificatePage.tsx # NFT/RWA certificate viewer
└── App.tsx                 # Main application with routing
```

## Backend Structure (`backend/src/`)
```
src/
├── modules/                # Feature modules (NestJS pattern)
│   ├── auth/               # Authentication & authorization
│   ├── users/              # User management
│   ├── artworks/           # Artwork CRUD operations
│   ├── orders/             # Order processing
│   ├── payments/           # Paystack integration
│   ├── hedera/             # Hedera blockchain integration
│   ├── ipfs/               # IPFS/Pinata storage
│   ├── tokenization/       # NFT/RWA token management
│   └── prisma/             # Database service
├── queue/                  # Bull queue configuration
├── workers/                # Background job processors
├── guards/                 # Auth guards & middleware
├── config/                 # Application configuration
├── common/                 # Shared utilities and types
├── app.module.ts           # Root application module
└── main.ts                 # Application entry point
```

## Database Schema (`backend/prisma/`)
- **Users**: Role-based (buyer/artist/admin) with KYC status
- **Artworks**: Physical/digital type with pricing and metadata
- **Orders**: Purchase transactions with payment/order status
- **AuthTokens**: Authenticity certificates (non-transferable)
- **OwnershipTokens**: Ownership certificates (transferable, RWA for physical)
- **AuditLog**: System activity tracking
- **RefreshTokens**: JWT refresh token management

## Path Aliases (Backend)
```typescript
@app/*      → src/*
@modules/*  → src/modules/*
@common/*   → src/common/*
@config/*   → src/config/*
@queue/*    → src/queue/*
@workers/*  → src/workers/*
```

## Key Conventions
- **Frontend**: PascalCase components, camelCase functions/variables
- **Backend**: NestJS decorators, Prisma models, module-based architecture
- **Database**: Snake_case for enums, camelCase for fields
- **API**: RESTful endpoints with role-based guards
- **Tokens**: Separate handling for physical (RWA) vs digital (NFT) artworks