# Hedera Art Marketplace Backend

A NestJS-based backend service for a fiat-first art marketplace with Hedera NFT authenticity certificates.

## Features

- **Fiat Payments**: Integrated with Paystack for seamless fiat transactions
- **Hedera NFTs**: Automatic minting of authenticity certificates on Hedera testnet
- **IPFS Storage**: Metadata stored on IPFS via Pinata
- **Queue System**: Background job processing with Bull/Redis
- **Role-based Auth**: JWT authentication with artist/buyer/admin roles
- **Artwork Management**: Full CRUD operations for artwork listings
- **Order Processing**: Complete order lifecycle from creation to fulfillment

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: Bull with Redis
- **Blockchain**: Hedera SDK for NFT minting
- **Storage**: IPFS via Pinata
- **Payments**: Paystack API
- **Auth**: JWT with refresh tokens

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** database
3. **Redis** server
4. **Hedera Testnet Account** with HBAR
5. **Pinata Account** for IPFS storage
6. **Paystack Account** for payments

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create `.env` file from the template:

```bash
cp .env.example .env
```

Update the environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hedera_marketplace"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Hedera Configuration
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY
HEDERA_TREASURY_ACCOUNT_ID=0.0.YOUR_TREASURY_ACCOUNT_ID
HEDERA_TREASURY_PRIVATE_KEY=YOUR_TREASURY_PRIVATE_KEY
HEDERA_NFT_TOKEN_ID=  # Will be generated in setup
HEDERA_MINT_MAX_ATTEMPTS=2  # Balanced option (defaults to 3)
HEDERA_RETRY_DELAY_MS=250   # Balanced option (defaults to 1000ms)

# Pinata (IPFS)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key

# App Configuration
NODE_ENV=development
PORT=3000

# Hedera minting retries
# Use HEDERA_MINT_MAX_ATTEMPTS to control how many times the worker retries transient mint failures.
# HEDERA_RETRY_DELAY_MS controls the delay between attempts in milliseconds.
```

> **Note:** The Hedera mint retry knobs (`HEDERA_MINT_MAX_ATTEMPTS` and `HEDERA_RETRY_DELAY_MS`) default to `2` attempts with a `250ms` backoff. Increase these values if the Hedera network is temporarily unstable, or reduce them if you prefer faster manual intervention on persistent failures.

### 3. Infrastructure Setup

Start PostgreSQL and Redis using Docker Compose:

```bash
docker-compose -f docker-compose.infrastructure.yml up -d
```

### 4. Database Setup

Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Create Hedera NFT Token

Set up your NFT token on Hedera testnet:

```bash
npm run setup:token
```

This will create an NFT token and display the token ID. Add it to your `.env` file.

### 6. Start the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## API Documentation

The API will be available at `http://localhost:3000` with the following main endpoints:

### Public Endpoints
- `GET /artworks` - Browse available artworks
- `GET /artworks/:id` - Get artwork details

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token

### Artist Endpoints
- `POST /artworks` - Create new artwork listing
- `PUT /artworks/:id` - Update artwork
- `GET /artist/sales` - View sales history

### Buyer Endpoints
- `POST /orders` - Create new order
- `GET /orders/:id/certificate` - View authenticity certificate

### Admin Endpoints
- `GET /admin/orders` - View all orders
- `POST /admin/orders/:id/remint` - Retry failed minting

## Project Structure

```
src/
├── modules/
│   ├── auth/           # Authentication & authorization
│   ├── users/          # User management
│   ├── artworks/       # Artwork CRUD operations
│   ├── orders/         # Order processing
│   ├── payments/       # Paystack integration
│   ├── hedera/         # Hedera NFT minting
│   ├── pinata/         # IPFS storage
│   └── prisma/         # Database service
├── queue/              # Bull queue configuration
├── workers/            # Background job processors
├── guards/             # Auth guards & middleware
├── config/             # App configuration
└── main.ts             # Application entry point
```

## Development

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# View database in browser
npx prisma studio
```

### Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Code Quality

```bash
# Linting
npm run lint

# Formatting
npm run format
```

## Deployment

### Environment Variables

Ensure all production environment variables are set:

- Use production Hedera mainnet credentials
- Configure production database and Redis
- Set secure JWT secrets
- Use production Paystack keys

### Building

```bash
npm run build
npm run start:prod
```

### Docker

```bash
# Build image
docker build -t hedera-marketplace-backend .

# Run container
docker run -p 3000:3000 hedera-marketplace-backend
```

## Monitoring

The application includes comprehensive logging and error handling:

- **Structured Logging**: JSON logs for production
- **Error Tracking**: Detailed error logs with context
- **Queue Monitoring**: Job status and failure tracking
- **Health Checks**: Database and Redis connectivity

## Security Considerations

- **JWT Authentication**: Secure token-based auth with refresh
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: All inputs validated with DTOs
- **Webhook Security**: Paystack webhook signature verification
- **Secret Management**: Environment variables for all secrets

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and credentials are correct
2. **Redis Connection**: Check Redis server status and configuration
3. **Hedera Account**: Verify account has sufficient HBAR balance
4. **Token Creation**: Ensure Hedera account has proper permissions
5. **IPFS Upload**: Check Pinata API credentials and quota

### Logs

Check application logs for detailed error information:

```bash
# Development logs
npm run start:dev

# Production logs (if using PM2)
pm2 logs hedera-marketplace
```

## Support

For questions and support:

1. Check the [Hedera Documentation](https://docs.hedera.com/)
2. Review [NestJS Documentation](https://docs.nestjs.com/)
3. Check [Prisma Documentation](https://www.prisma.io/docs/)

## License

MIT License - see LICENSE file for details.