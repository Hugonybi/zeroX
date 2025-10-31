# Technology Stack

## Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7 with HMR
- **Styling**: Tailwind CSS 4 with PostCSS
- **Routing**: React Router DOM 7
- **Blockchain**: Hashgraph SDK for Hedera integration
- **HTTP Client**: Native fetch with custom wrapper

## Backend
- **Framework**: NestJS 10 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Queue System**: Bull with Redis for background jobs
- **Authentication**: JWT with refresh tokens, Passport.js
- **Blockchain**: Hedera SDK for NFT minting
- **Storage**: IPFS via Pinata SDK
- **Payments**: Paystack API integration
- **Security**: Helmet, CORS, rate limiting, input validation

## Infrastructure
- **Database**: PostgreSQL (via Docker Compose)
- **Cache/Queue**: Redis (via Docker Compose)
- **File Storage**: IPFS (Pinata)
- **Blockchain**: Hedera Testnet/Mainnet

## Common Commands

### Frontend Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server with HMR
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Development
```bash
npm install                    # Install dependencies
npm run start:dev             # Start with watch mode
npm run build                 # Build TypeScript
npm run start:prod            # Start production build
npm run test                  # Run Jest tests
npm run lint                  # Run ESLint with auto-fix
npm run prisma:generate       # Generate Prisma client
npm run prisma:migrate        # Run database migrations
npm run setup:token           # Create Hedera NFT token
npm run setup:ownership-token # Create ownership token
```

### Infrastructure
```bash
# Start PostgreSQL and Redis
docker-compose -f backend/docker-compose.infrastructure.yml up -d

# Stop infrastructure
docker-compose -f backend/docker-compose.infrastructure.yml down
```

## Build Process
- Frontend: TypeScript compilation → Vite bundling → Static assets in `dist/`
- Backend: TypeScript compilation → NestJS build → Compiled JS in `backend/dist/`
- Database: Prisma migrations → Generated client → PostgreSQL schema