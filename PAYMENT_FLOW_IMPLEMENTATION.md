# Payment Flow Implementation Guide

## Overview

This document describes the complete payment UI flow implementation for the Hedera Art Marketplace. The system enables buyers to purchase artworks using fiat currency via Paystack integration, with automatic certificate minting on the Hedera blockchain.

## Architecture

### Frontend Components

```
src/
├── types/
│   ├── order.ts          # Order type definitions
│   └── payment.ts        # Payment type definitions
├── lib/
│   ├── orderService.ts   # Order API client
│   └── paystackHelper.ts # Paystack integration helper
├── hooks/
│   ├── useCheckout.ts    # Checkout state management
│   ├── useOrderPolling.ts # Order status polling
│   └── useOrderHistory.ts # Order history fetching
├── components/
│   ├── ArtworkDetails.tsx      # Purchase UI
│   ├── OrderCard.tsx           # Order summary card
│   ├── OrderHistoryList.tsx    # Order list display
│   └── PaymentProcessingModal.tsx # Payment loading UI
└── pages/
    ├── OrderStatusPage.tsx # Order tracking
    └── ProfilePage.tsx     # Updated with order history
```

### Backend Endpoints

```
POST /checkout              # Create order and payment session
GET  /orders/:id            # Get order by ID
GET  /orders/buyer/me       # Get buyer's order history
POST /test/complete-order   # Test endpoint for development
```

## User Flow

### 1. Browse and Select Artwork

Users browse the gallery and view artwork details on the `ArtworkDetailPage`.

### 2. Choose Purchase Option

On the artwork detail page, buyers can select:
- **Physical Art + Digital NFT**: Receive the original artwork and digital certificate
- **Digital NFT Only**: Receive only the digital certificate

### 3. Authentication Check

When clicking "Buy Now":
- If not authenticated → Redirect to `/login` with return URL
- If authenticated but not a buyer → Show error message
- If authenticated as buyer → Proceed to checkout

### 4. Create Checkout Session

The system calls `POST /checkout` with:
```typescript
{
  artworkId: string,
  paymentProvider: 'paystack'
}
```

Backend response:
```typescript
{
  order: Order,
  payment: {
    authorization_url: string,
    access_code: string,
    reference: string
  }
}
```

### 5. Open Paystack Payment Popup

The Paystack popup is initialized with:
- Public key (from environment)
- Buyer's email
- Order amount
- Order reference
- Callback handlers

### 6. Process Payment

**Success Path:**
1. Paystack callback fires with success status
2. Paystack webhook notifies backend
3. Backend updates order: `paymentStatus='paid'`, `orderStatus='processing'`
4. Backend enqueues minting job
5. User redirected to `/orders/:orderId`

**Failure Path:**
1. User closes popup or payment fails
2. Error message displayed
3. Option to retry payment

### 7. Order Status Tracking

The `OrderStatusPage` polls the order status every 3 seconds:
- **Created/Pending**: Waiting for payment confirmation
- **Processing**: Payment received, certificate being minted
- **Fulfilled**: Certificate ready, auto-redirect to certificate page
- **Cancelled/Failed**: Show error with support contact

### 8. View Certificate

Once order is fulfilled, users are redirected to `/certificate/:orderId` where they can view:
- Authenticity token details
- Ownership token details
- Hedera transaction hashes
- IPFS metadata links
- Order information

### 9. Order History

Buyers can view their purchase history in the Profile page:
- List of all orders
- Order status badges
- Quick links to order details or certificates
- Filter by date and status (future enhancement)

## Key Features

### Authentication Integration

```typescript
// Check if user is authenticated
const { isAuthenticated, user } = useAuth();

// Redirect to login if needed
if (!isAuthenticated) {
  sessionStorage.setItem('intendedPurchase', JSON.stringify({ artworkId }));
  navigate('/login');
  return;
}

// Verify buyer role
if (user?.role !== 'buyer') {
  alert('Only buyers can purchase artworks');
  return;
}
```

### Checkout State Management

```typescript
const { checkout, isLoading, error } = useCheckout();

const result = await checkout({
  artworkId: 'artwork-123',
  paymentProvider: 'paystack',
});

if (result) {
  // Navigate to order status or open payment
}
```

### Order Status Polling

```typescript
const { order, isLoading, error } = useOrderPolling({
  orderId: 'order-123',
  enabled: true,
  interval: 3000, // 3 seconds
  onStatusChange: (order) => {
    if (order.orderStatus === 'fulfilled') {
      navigate(`/certificate/${orderId}`);
    }
  },
});
```

### Paystack Integration

```typescript
import { initializePaystack, getPaystackPublicKey } from '../lib/paystackHelper';

initializePaystack({
  publicKey: getPaystackPublicKey(),
  email: user.email,
  amount: order.amountCents,
  currency: order.currency,
  reference: order.reference,
  onSuccess: (reference) => {
    navigate(`/orders/${orderId}`);
  },
  onClose: () => {
    console.log('Payment cancelled');
  },
  onError: (error) => {
    console.error('Payment error:', error);
  },
});
```

## Configuration

### Environment Variables

Frontend (.env):
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
```

Backend (.env):
```bash
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
```

### API Configuration

Update `src/config/api.ts` if needed:
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const USE_MOCK_ARTWORKS = false; // Set to true for development without backend
```

## Testing

### Manual Testing Checklist

#### Basic Flow
- [ ] Browse gallery as guest
- [ ] Click "Buy Now" without login
- [ ] Redirected to login page
- [ ] Login successfully
- [ ] Return to artwork and purchase
- [ ] Payment popup opens
- [ ] Complete payment with test card
- [ ] Redirected to order status page
- [ ] Order status updates in real-time
- [ ] Redirected to certificate page when fulfilled
- [ ] View certificate details

#### Error Scenarios
- [ ] Cancel payment popup
- [ ] Payment fails with declined card
- [ ] Network error during checkout
- [ ] Order not found (invalid ID)
- [ ] Unauthorized access to other user's order

#### Edge Cases
- [ ] Attempt to purchase sold-out artwork
- [ ] Non-buyer user attempts purchase
- [ ] Multiple tabs open during checkout
- [ ] Browser refresh during payment
- [ ] Payment succeeds but webhook delayed

### Paystack Test Cards

**Success:**
- Card: `4084 0840 8408 4081`
- CVV: Any 3 digits
- Expiry: Any future date
- PIN: `0000`

**Decline:**
- Card: `4084 0840 8408 4084`
- CVV: Any 3 digits
- Expiry: Any future date

**Insufficient Funds:**
- Card: `5060 6666 6666 6666 666`
- CVV: Any 3 digits
- Expiry: Any future date
- OTP: `123456`

## Security Considerations

### Frontend Security
- ✅ No sensitive keys exposed in client code
- ✅ Authentication required for all checkout operations
- ✅ Paystack public key only (secret key on backend)
- ✅ Order IDs are UUIDs (not sequential)
- ✅ CSRF protection via backend cookies

### Backend Security
- ✅ Order ownership validation on retrieval
- ✅ Role-based access control (buyers only)
- ✅ Webhook signature verification (Paystack)
- ✅ Payment amount validation against artwork price
- ✅ Idempotent order updates

### Best Practices
- Use HTTPS in production
- Rotate API keys regularly
- Monitor failed payment attempts
- Log security events
- Implement rate limiting on checkout endpoint

## Troubleshooting

### Payment Popup Not Opening

**Symptoms:** Click "Buy Now" but nothing happens

**Solutions:**
1. Check browser console for errors
2. Verify Paystack script loaded: `<script src="https://js.paystack.co/v1/inline.js"></script>`
3. Check popup blockers
4. Verify public key is configured

### Order Status Not Updating

**Symptoms:** Order stuck in "pending" or "processing"

**Solutions:**
1. Check webhook endpoint is accessible
2. Verify webhook signature validation
3. Check minting queue status
4. Review backend logs for errors
5. Use test endpoint to manually complete order

### Certificate Not Appearing

**Symptoms:** Order fulfilled but certificate not found

**Solutions:**
1. Check minting job completed successfully
2. Verify certificate service endpoint
3. Review tokenization logs
4. Ensure IPFS metadata is accessible
5. Check Hedera transaction was successful

### Order History Empty

**Symptoms:** Buyer made purchases but list is empty

**Solutions:**
1. Verify user is logged in as buyer
2. Check backend `/orders/buyer/me` endpoint
3. Review console for API errors
4. Verify order records exist in database
5. Check user ID matches order buyer ID

## Future Enhancements

### Phase 1 (Completed)
- ✅ Basic checkout flow
- ✅ Paystack integration
- ✅ Order status tracking
- ✅ Order history

### Phase 2 (Planned)
- [ ] Multiple payment providers (Stripe)
- [ ] Multi-currency support
- [ ] Cart functionality (multiple items)
- [ ] Discount codes and promotions
- [ ] Email notifications
- [ ] Order cancellation

### Phase 3 (Future)
- [ ] Physical delivery tracking
- [ ] Escrow for high-value purchases
- [ ] Installment payments
- [ ] Gift purchases
- [ ] Auction bidding
- [ ] Token transfers to buyer wallets

## Support

For issues or questions:
- Review this documentation
- Check backend logs: `/backend/logs/`
- Frontend console errors
- Backend API responses
- Paystack dashboard for payment issues

## References

- [Paystack Documentation](https://paystack.com/docs)
- [Hedera Token Service](https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service)
- [React Router](https://reactrouter.com/)
- [TypeScript](https://www.typescriptlang.org/)
