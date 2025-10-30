---
goal: Create comprehensive payment UI flow for fiat checkout with Paystack integration
version: 1.0
date_created: 2025-10-30
last_updated: 2025-10-30
owner: Development Team
status: 'Planned'
tags: ['feature', 'payment', 'ui', 'checkout', 'paystack']
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

Implement a complete end-to-end payment UI flow that enables buyers to purchase artworks using fiat currency via Paystack integration. The flow includes checkout initiation, payment processing, order tracking, and post-payment certificate delivery, aligning with the marketplace's fiat-first approach without requiring crypto wallets.

## 1. Requirements & Constraints

### Requirements

- **REQ-001**: Buyers must be able to initiate checkout from artwork detail page
- **REQ-002**: Support both physical and digital artwork purchase options
- **REQ-003**: Integrate Paystack payment gateway for fiat transactions
- **REQ-004**: Display order status in real-time during payment processing
- **REQ-005**: Redirect to certificate page after successful payment
- **REQ-006**: Handle payment failures gracefully with retry options
- **REQ-007**: Require user authentication before checkout
- **REQ-008**: Display clear pricing with currency formatting (NGN)
- **REQ-009**: Show loading states during API calls and payment processing
- **REQ-010**: Provide order history view for buyers in profile page

### Security Requirements

- **SEC-001**: Validate authentication tokens before checkout
- **SEC-002**: Never expose payment provider secrets in frontend code
- **SEC-003**: Verify order ownership before displaying certificate
- **SEC-004**: Use HTTPS for all payment-related communications
- **SEC-005**: Implement CSRF protection for checkout endpoints

### Constraints

- **CON-001**: Payment provider limited to Paystack for MVP
- **CON-002**: Single currency support (NGN) initially
- **CON-003**: Direct checkout only (no cart/multi-item purchases in MVP)
- **CON-004**: Physical delivery tracking not included in MVP
- **CON-005**: No payment method selection (Paystack handles all payment methods)

### Guidelines

- **GUD-001**: Follow existing design system (brand colors, typography, components)
- **GUD-002**: Maintain consistency with authentication flow patterns
- **GUD-003**: Use existing HTTP client with error handling
- **GUD-004**: Implement optimistic UI updates where appropriate
- **GUD-005**: Ensure mobile-responsive design for all payment screens

### Patterns to Follow

- **PAT-001**: Use React hooks for state management (useState, useEffect)
- **PAT-002**: Implement TypeScript interfaces for all data structures
- **PAT-003**: Use React Router for navigation between payment steps
- **PAT-004**: Follow protected route pattern for authenticated flows
- **PAT-005**: Use toast notifications for user feedback

## 2. Implementation Steps

### Implementation Phase 1: Core Data Types & API Integration

- GOAL-001: Define TypeScript types and API client functions for payment flow

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Create `src/types/order.ts` with Order, OrderStatus, PaymentStatus, CheckoutRequest, and CheckoutResponse interfaces matching backend schema | | |
| TASK-002 | Create `src/types/payment.ts` with PaystackResponse, PaymentMetadata, and PaymentProvider enum types | | |
| TASK-003 | Create `src/lib/orderService.ts` with API functions: `createCheckout()`, `getOrder()`, `getOrdersByBuyer()` using existing httpClient | | |
| TASK-004 | Add error handling and type guards for API responses in orderService | | |
| TASK-005 | Create custom hook `src/hooks/useCheckout.ts` for checkout state management with loading, error, and success states | | |

### Implementation Phase 2: Purchase Flow Components

- GOAL-002: Build UI components for artwork purchase selection and checkout initiation

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-006 | Update `src/components/ArtworkDetails.tsx` to manage purchase option selection state (physical+digital vs digital-only) | | |
| TASK-007 | Add authentication check to "Buy Now" button - redirect to `/login` if not authenticated, store intended artwork in sessionStorage | | |
| TASK-008 | Implement `handleBuyNow()` function in ArtworkDetails that calls checkout API via useCheckout hook | | |
| TASK-009 | Create loading state UI for "Buy Now" button (spinner, disabled state) | | |
| TASK-010 | Add error toast notifications for checkout failures with retry option | | |
| TASK-011 | Pass artworkId and paymentProvider='paystack' in checkout API request | | |

### Implementation Phase 3: Payment Processing Integration

- GOAL-003: Integrate Paystack popup and handle payment window lifecycle

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-012 | Add Paystack inline script to `index.html`: `<script src="https://js.paystack.co/v1/inline.js"></script>` | | |
| TASK-013 | Create `src/lib/paystackHelper.ts` with `initializePaystack()` function to open Paystack popup with authorization_url from backend | | |
| TASK-014 | Implement Paystack callback handlers: `onSuccess()`, `onClose()`, `onError()` in paystackHelper | | |
| TASK-015 | Store orderId in localStorage/sessionStorage before opening payment popup for tracking | | |
| TASK-016 | Create modal/overlay UI component `src/components/PaymentProcessingModal.tsx` to indicate payment in progress | | |
| TASK-017 | Handle payment window closure (cancel) gracefully - show option to retry or return to artwork | | |

### Implementation Phase 4: Order Status & Tracking

- GOAL-004: Create order status page and polling mechanism for payment verification

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-018 | Create new route in App.tsx: `/orders/:orderId` pointing to `OrderStatusPage.tsx` | | |
| TASK-019 | Implement `src/pages/OrderStatusPage.tsx` with order details, payment status, and processing indicators | | |
| TASK-020 | Create custom hook `src/hooks/useOrderPolling.ts` to poll order status every 3 seconds until status changes from 'pending' | | |
| TASK-021 | Display order information: artwork details, amount, payment status, order status with appropriate badges | | |
| TASK-022 | Implement status-specific UI states: pending (loading), paid (processing), fulfilled (success), failed (error) | | |
| TASK-023 | Add automatic redirect to certificate page when order status becomes 'fulfilled' | | |
| TASK-024 | Handle edge cases: order not found, unauthorized access, network errors during polling | | |

### Implementation Phase 5: Payment Confirmation & Certificate Access

- GOAL-005: Update certificate page and provide seamless post-payment experience

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-025 | Verify CertificatePage accepts orderId parameter and fetches certificate by orderId | | |
| TASK-026 | Update certificate fetching logic to handle order-to-certificate mapping via backend API | | |
| TASK-027 | Add payment confirmation section to CertificatePage showing transaction details (amount, date, reference) | | |
| TASK-028 | Create "View Certificate" CTA button on OrderStatusPage when order is fulfilled | | |
| TASK-029 | Implement order-not-yet-fulfilled state on CertificatePage with helpful messaging | | |
| TASK-030 | Add share functionality for certificate (download PDF, copy link) | | |

### Implementation Phase 6: Order History & Profile Integration

- GOAL-006: Enable buyers to view purchase history in their profile

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-031 | Update `src/pages/ProfilePage.tsx` to include "My Purchases" section | | |
| TASK-032 | Create component `src/components/OrderHistoryList.tsx` to display buyer's orders with artwork thumbnails | | |
| TASK-033 | Implement custom hook `src/hooks/useOrderHistory.ts` to fetch orders by buyer ID | | |
| TASK-034 | Display order cards showing: artwork image, title, amount, purchase date, status badge | | |
| TASK-035 | Add click handler to navigate to order details or certificate page | | |
| TASK-036 | Implement empty state UI when user has no purchases yet | | |
| TASK-037 | Add filter/sort options for orders (by date, status) | | |

### Implementation Phase 7: Error Handling & Edge Cases

- GOAL-007: Implement robust error handling and edge case management

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-038 | Handle artwork already sold scenario - show "Sold Out" badge, disable purchase button | | |
| TASK-039 | Implement payment timeout handling (if user doesn't complete payment in popup) | | |
| TASK-040 | Add network error recovery with retry mechanisms in all API calls | | |
| TASK-041 | Create error boundary component for payment flow to catch React errors | | |
| TASK-042 | Implement webhook delay handling - show "Processing payment..." message while waiting for webhook | | |
| TASK-043 | Add support contact information on payment failure screens | | |
| TASK-044 | Handle duplicate purchase attempts - prevent multiple orders for same artwork by same user | | |

### Implementation Phase 8: UI Polish & Responsive Design

- GOAL-008: Ensure professional, polished UI across all devices

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-045 | Review and update all payment flow screens for mobile responsiveness (320px to 1440px) | | |
| TASK-046 | Add loading skeletons for order status page while fetching data | | |
| TASK-047 | Implement smooth transitions between payment states (pending → processing → fulfilled) | | |
| TASK-048 | Add appropriate icons and visual indicators for payment status (check marks, spinners, error icons) | | |
| TASK-049 | Ensure consistent spacing, typography, and color usage per design system | | |
| TASK-050 | Test and fix accessibility issues (keyboard navigation, screen readers, ARIA labels) | | |
| TASK-051 | Optimize images and lazy-load components for better performance | | |

### Implementation Phase 9: Testing & Validation

- GOAL-009: Comprehensive testing of payment flow end-to-end

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-052 | Create test script for checkout flow with Paystack test keys | | |
| TASK-053 | Test successful payment scenario: artwork → checkout → payment → certificate | | |
| TASK-054 | Test payment cancellation scenario: user closes popup before payment | | |
| TASK-055 | Test payment failure scenario: declined card, insufficient funds | | |
| TASK-056 | Test webhook delay: order status updates correctly after webhook processes | | |
| TASK-057 | Test edge cases: network failures, API timeouts, invalid artwork IDs | | |
| TASK-058 | Verify authentication redirects work correctly throughout flow | | |
| TASK-059 | Test order history displays correctly with multiple orders | | |
| TASK-060 | Perform cross-browser testing (Chrome, Firefox, Safari, Edge) | | |
| TASK-061 | Conduct mobile device testing (iOS Safari, Android Chrome) | | |

## 3. Alternatives

- **ALT-001**: **Stripe Integration Instead of Paystack** - Rejected because requirements specify Paystack for NG-focused rollout; Stripe can be added later for global expansion
- **ALT-002**: **Cart System for Multiple Items** - Deferred to post-MVP; current spec requires direct checkout only
- **ALT-003**: **In-page Payment Form Instead of Popup** - Rejected due to PCI compliance complexity; Paystack popup is more secure and maintains PCI compliance without additional certification
- **ALT-004**: **WebSocket for Real-time Order Updates** - Rejected as over-engineered for MVP; polling is simpler and sufficient given typical payment processing times (5-30 seconds)
- **ALT-005**: **Native Mobile Apps** - Deferred to future phase; responsive web app meets MVP requirements

## 4. Dependencies

### External Dependencies

- **DEP-001**: Paystack Inline JS library (v1) - CDN hosted, no npm package needed
- **DEP-002**: Backend `/checkout` endpoint must return Paystack authorization_url
- **DEP-003**: Backend `/orders/:id` endpoint for order status retrieval
- **DEP-004**: Backend `/orders/buyer/:buyerId` endpoint for order history
- **DEP-005**: Backend webhook endpoint must be registered with Paystack and processing payments

### Internal Dependencies

- **DEP-006**: Authentication system (JWT tokens) must be functional
- **DEP-007**: Artwork detail page and artwork API endpoints
- **DEP-008**: Certificate page must support orderId-based lookup
- **DEP-009**: Existing UI components (Button, Badge, Toast)
- **DEP-010**: HTTP client library with interceptors for auth headers

### Data Dependencies

- **DEP-011**: Artworks must have valid priceCents and currency fields
- **DEP-012**: Users must have buyer role to initiate checkout
- **DEP-013**: Orders must have unique reference IDs for Paystack tracking

## 5. Files

### New Files to Create

- **FILE-001**: `src/types/order.ts` - TypeScript interfaces for Order, OrderStatus, PaymentStatus
- **FILE-002**: `src/types/payment.ts` - Payment provider types and Paystack response interfaces
- **FILE-003**: `src/lib/orderService.ts` - API client functions for order operations
- **FILE-004**: `src/lib/paystackHelper.ts` - Paystack popup initialization and callback handlers
- **FILE-005**: `src/hooks/useCheckout.ts` - Custom hook for checkout flow state management
- **FILE-006**: `src/hooks/useOrderPolling.ts` - Custom hook for polling order status
- **FILE-007**: `src/hooks/useOrderHistory.ts` - Custom hook for fetching buyer order history
- **FILE-008**: `src/pages/OrderStatusPage.tsx` - Order status tracking page
- **FILE-009**: `src/components/PaymentProcessingModal.tsx` - Modal overlay during payment
- **FILE-010**: `src/components/OrderHistoryList.tsx` - Order history display component
- **FILE-011**: `src/components/OrderCard.tsx` - Individual order summary card

### Files to Modify

- **FILE-012**: `src/App.tsx` - Add new route for `/orders/:orderId`
- **FILE-013**: `src/components/ArtworkDetails.tsx` - Add purchase flow logic and checkout trigger
- **FILE-014**: `src/pages/CertificatePage.tsx` - Update to support order-based certificate lookup
- **FILE-015**: `src/pages/ProfilePage.tsx` - Add order history section
- **FILE-016**: `index.html` - Add Paystack inline script tag
- **FILE-017**: `src/config/api.ts` - Add payment-related API endpoint constants if needed

## 6. Testing

### Unit Tests

- **TEST-001**: Test orderService API functions with mocked fetch responses
- **TEST-002**: Test useCheckout hook state transitions (idle → loading → success/error)
- **TEST-003**: Test useOrderPolling hook polling logic and cleanup
- **TEST-004**: Test paystackHelper callback functions with mock Paystack responses
- **TEST-005**: Test order status badge rendering based on different statuses
- **TEST-006**: Test authentication redirect logic in ArtworkDetails

### Integration Tests

- **TEST-007**: Test complete checkout flow from artwork detail to order creation
- **TEST-008**: Test order status polling with mocked backend responses
- **TEST-009**: Test order history fetching and display
- **TEST-010**: Test payment success callback and redirect to certificate
- **TEST-011**: Test payment failure handling and error messages

### End-to-End Tests

- **TEST-012**: E2E test: Guest user attempts purchase → redirected to login → completes purchase
- **TEST-013**: E2E test: Authenticated user purchases artwork → payment succeeds → views certificate
- **TEST-014**: E2E test: User cancels payment in Paystack popup → returns to artwork page
- **TEST-015**: E2E test: Payment succeeds but webhook delayed → polling updates order status
- **TEST-016**: E2E test: User views order history with multiple purchases

### Manual Testing Scenarios

- **TEST-017**: Test with Paystack test card: 4084084084084081 (success)
- **TEST-018**: Test with Paystack test card for declined payment
- **TEST-019**: Test on mobile devices (iOS Safari, Android Chrome)
- **TEST-020**: Test with slow network (throttled connection)
- **TEST-021**: Test browser back button behavior during payment flow
- **TEST-022**: Test session timeout during payment flow

## 7. Risks & Assumptions

### Risks

- **RISK-001**: **Paystack popup blocked by browser** - Mitigation: Educate users, detect popup blockers and show warning
- **RISK-002**: **Webhook delay exceeds user patience** - Mitigation: Implement polling with clear "Processing..." messaging, typical delay is 5-30 seconds
- **RISK-003**: **Payment succeeds but webhook fails** - Mitigation: Backend implements webhook retry logic; admin console allows manual order completion
- **RISK-004**: **User closes browser before payment completes** - Mitigation: Store order reference in localStorage; show pending orders in profile
- **RISK-005**: **Network failure during checkout** - Mitigation: Implement retry mechanisms with exponential backoff
- **RISK-006**: **Race condition between webhook and polling** - Mitigation: Backend ensures idempotent order updates
- **RISK-007**: **Payment provider downtime** - Mitigation: Display maintenance message, provide contact support option

### Assumptions

- **ASSUMPTION-001**: Paystack webhook endpoint is configured and functional in backend
- **ASSUMPTION-002**: Backend validates order ownership before returning order details
- **ASSUMPTION-003**: Minting process completes within 5 minutes per spec (quality guardrails)
- **ASSUMPTION-004**: Users have JavaScript enabled (required for Paystack popup)
- **ASSUMPTION-005**: Artwork price and availability are validated server-side before order creation
- **ASSUMPTION-006**: Single concurrent purchase per user (no cart, no multi-tab purchases)
- **ASSUMPTION-007**: NGN currency formatting works correctly with Intl.NumberFormat
- **ASSUMPTION-008**: Certificate generation is triggered automatically by backend after order fulfillment

## 8. Related Specifications / Further Reading

- [Hedera Art Marketplace MVP — Delivery Guide](/.github/copilot-instructions.md) - Section 7: Purchase-to-Mint Flow
- [Backend Orders Service](/backend/src/modules/orders/orders.service.ts) - Checkout and order management logic
- [Paystack Documentation](https://paystack.com/docs/payments/accept-payments) - Payment integration guide
- [Paystack Popup API](https://paystack.com/docs/payments/accept-payments#popup) - JavaScript popup implementation
- [Paystack Test Cards](https://paystack.com/docs/payments/test-payments) - Test card numbers for development
- [Feature Auth UI Implementation Plan](/plan/feature-auth-ui-1.md) - Related authentication flow patterns
- [Frontend Backend Connection Plan](/plan/feature-frontend-backend-connection-1.md) - API integration patterns
