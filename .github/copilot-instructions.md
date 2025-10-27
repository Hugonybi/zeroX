# Hedera Art Marketplace MVP — Delivery Guide

This document captures the implementation-ready blueprint for the fiat-first art marketplace. Use it to align scope, architecture, and delivery expectations across the team.

---

## 1. Product North Star

Enable artists to sell physical or digital works for fiat currency and automatically issue Hedera-backed authenticity certificates (NFT-like tokens) after every successful payment—no crypto wallets required for buyers or artists.

---

## 2. Scope Definition
### 2.1 Mandatory Features
- Artist onboarding with profile setup and manual KYC placeholder.
- Artwork listing workflow (image upload, metadata, physical vs digital, editioning).
- Marketplace browsing with basic filters and search.
- Cart/checkout integrating Stripe or Paystack for fiat payments.
- Order lifecycle management (pending → paid → fulfilled).
- Post-payment background job to mint Hedera authenticity tokens.
- Buyer receipt page showing certificate, token ID, and Hedera transaction hash.
- Lightweight admin console for artwork moderation, order visibility, and re-mint actions.
- Asset storage on S3 or R2; artwork metadata optionally pushed to IPFS.
- Provenance audit log covering artworks, orders, and mint events.

### 2.2 Explicit Exclusions
- Native crypto payments or wallet UX.
- Secondary marketplace or token transfers by end users.
- On-chain royalty enforcement.
- Automated KYC/KYB integrations beyond manual review.

---

## 3. Quality & Reliability Guardrails
- Page responses ≤300 ms with caching/CDN.
- Payment webhook success rate ≥99.9%, with replay-safe handling.
- Minting job achieves eventual consistency inside 5 minutes or escalates for manual remediation.
- Durable storage with backups for media and metadata.
- Encrypt sensitive PII at rest, follow principle of least privilege.
- Every authenticity token mapped to order + Hedera tx hash for auditing.

---

## 4. Recommended Stack
- **Frontend:** React (Next.js optional for SEO/SSG).
- **Backend:** Node.js + TypeScript using NestJS or Express with Prisma.
- **Database:** PostgreSQL primary; Redis for caching and job coordination.
- **Storage:** AWS S3 or Cloudflare R2 for media; Pinata/Infura IPFS for metadata (MVP optional).
- **Payments:** Stripe globally, Paystack for NG-focused rollouts.
- **Jobs:** BullMQ atop Redis or RabbitMQ worker queue.
- **Hedera:** JS/TS SDK with dedicated operator account; keys stored in Vault/secrets manager.
- **Observability:** Sentry for errors; Prometheus/Grafana optional for metrics.
- **Auth:** JWT access + refresh tokens; optional social OAuth.
- **Hosting:** Vercel (frontend) and AWS ECS / DigitalOcean App Platform / Fly.io / Heroku-like for backend.
- **CI/CD:** GitHub Actions.

---

## 5. Data Contracts
```sql
users (
  id uuid primary key,
  email text unique,
  password_hash text,
  role enum('buyer','artist','admin'),
  name text,
  bio text,
  kyc_status enum('none','pending','verified','rejected'),
  created_at timestamptz,
  updated_at timestamptz
)

artworks (
  id uuid primary key,
  artist_id uuid references users(id),
  title text,
  description text,
  type enum('physical','digital'),
  media_url text,
  metadata_url text,
  serial_number text,
  edition integer,
  price_cents integer,
  currency text,
  status enum('draft','published','sold','removed'),
  created_at timestamptz,
  updated_at timestamptz
)

orders (
  id uuid primary key,
  buyer_id uuid references users(id),
  artwork_id uuid references artworks(id),
  amount_cents integer,
  currency text,
  payment_provider varchar,
  payment_status enum('pending','paid','failed','refunded'),
  order_status enum('created','processing','fulfilled','cancelled'),
  created_at timestamptz,
  updated_at timestamptz
)

auth_tokens (
  id uuid primary key,
  artwork_id uuid references artworks(id),
  order_id uuid references orders(id),
  hedera_token_id text,
  hedera_tx_hash text,
  metadata_ipfs text,
  minted_by text,
  minted_at timestamptz
)

audit_logs (
  id uuid primary key,
  entity_type text,
  entity_id uuid,
  action text,
  meta_json jsonb,
  created_at timestamptz
)
```

---

## 6. API Surface
### Public
- `GET /artworks` with filters (type, artist, min_price, max_price).
- `GET /artworks/:id` for detail, inventory, and pricing.

### Buyer Authenticated
- `POST /cart` (or direct checkout) to capture purchase intent.
- `POST /checkout` to create payment intent and return client secret.
- `POST /payments/webhook` to process verified provider callbacks.

### Artist Authenticated
- `POST /artist/artworks` to create listings and trigger uploads.
- `PUT /artist/artworks/:id` to edit listings.
- `GET /artist/sales` to review fulfilled and pending orders.

### Admin
- `GET /admin/submissions` for moderation queue.
- `POST /admin/re-mint` to retry authenticity token generation.

---

## 7. Purchase-to-Mint Flow
1. Buyer submits checkout; backend creates order with `payment_status=pending`.
2. System generates payment intent via Stripe/Paystack and returns client secret.
3. On successful payment, provider fires webhook; backend validates signature, sets `payment_status=paid`, `order_status=processing`, enqueues `mint_authenticity` job.
4. Worker assembles certificate metadata, pins to IPFS (optional), then executes Hedera mint using operator credentials.
5. Worker stores `hedera_token_id`, `hedera_tx_hash`, metadata URI, and marks order fulfilled.
6. Buyer receives confirmation email and certificate page linking to Hedera mirror node/explorer.
7. Failures trigger retries with exponential backoff; after threshold, order flagged `mint_failed` for admin action.

---

## 8. Hedera Integration Guidelines
- Use Hedera Token Service to mint one non-transferable NFT per fulfilled order.
- Keep operator private key in a managed secret store; never expose to clients.
- Mint tokens with a controlled key set so future secondary transfers remain possible: retain admin and supply keys, configure freeze and (optionally) KYC keys on creation, and pause/wipe keys if you want emergency stops or clawbacks.
- Default to accounts frozen until explicitly unfrozen; this lets you run auctions later by unfreezing the winning wallet only.
- Restrict token transfers today by omitting end-user associations; NFTs remain in treasury while buyers rely on explorer proofs.
- Surface token data via Hedera mirror node REST endpoints on certificate pages.

**Edge cases to watch**
- Association needed before transfers: when you enable owner transfers, require wallets to associate (and, if enabled, pass KYC) prior to bidding or purchase.
- Key custody: protect admin/supply/freeze/KYC keys in the same vault as the operator to avoid compromise that could freeze all tokens or mint extras.
- Serial supply lock: once all planned editions are minted, rotate or disable the supply key to prevent accidental inflation.

---

## 9. Security & Compliance Minimums
- Enforce HTTPS, rate limiting, payload size caps, and malware scanning on uploads.
- Verify webhook signatures and guard against replays.
- Encrypt sensitive data, apply RBAC to admin tooling, maintain audit logs.
- Collect manual KYC evidence for artists with documented review flow.
- Publish privacy policy, ToS, and support data deletion requests.

---

## 10. Monitoring & Resilience
- Track payments, mint successes/failures, queue depth, worker latency.
- Alert when mint retries escalate or queue backlog exceeds threshold.
- Admin tooling should allow re-queuing failed jobs and inspecting provenance history.

---

## 11. Acceptance Checklist
- Buyer journey from discovery → payment → certificate works end-to-end with real webhook and mint job.
- Artists can list and manage artworks, observing sales in dashboard.
- Admin can view moderation queue, failure states, and manually re-mint tokens.
- Metadata assets are retrievable from storage and linked in auth token records.
- All integration secrets rotate cleanly and are absent from client bundles.

---

## 12. UX Footprint
- Home/browse gallery.
- Artwork detail page with purchase CTA.
- Artist onboarding and listing creation.
- Checkout flow tied to PSP payment element.
- Post-purchase certificate page with Hedera explorer link.
- Artist dashboard (listings + sales).
- Admin console (submissions + mint queue).

---

## 13. Delivery Roadmap (Two-week sprints unless noted)
- **Sprint 0 (1 week):** Repo + CI setup, secrets management, database migrations, Stripe test mode, Hedera testnet credentials.
- **Sprint 1:** Auth foundation, artist onboarding, artwork CRUD + uploads, public marketplace UI.
- **Sprint 2:** Checkout integration, order lifecycle, buyer certificate scaffolding.
- **Sprint 3:** Job queue + worker, Hedera minting, persistence of auth tokens, admin re-mint controls.
- **Sprint 4:** Hardening—error handling, monitoring, retry strategy, end-to-end tests, runbook documentation.

Estimated total delivery effort: 7–9 weeks for a 3-person (backend, frontend, devops/QA) squad.

---

## 14. Risk Register
- **Minting instability:** Mitigate with queued retries and admin override.
- **Physical delivery disputes:** Future enhancement—consider escrow or delivery confirmation.
- **Trust gap:** Provide mirror-node explorer links and downloadable PDF certificates.
- **Key exposure:** Guard secrets with Vault/secrets manager; enforce rotation policy.

