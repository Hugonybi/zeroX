---
goal: Implement Hedera-enabled backend with IPFS-first asset workflows
version: 1.0
date_created: 2025-10-24
owner: Platform-Backend
status: Planned
tags: [feature, backend, hedera, ipfs]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

Deliver a Node.js + TypeScript backend that processes fiat payments, mints Hedera authenticity tokens, and stores artwork metadata on IPFS, including a tracked TODO list and automated tests.

## 1. Requirements & Constraints

- **REQ-001**: Implement REST API surface defined in `.github/copilot-instructions.md` Section 6 using NestJS controllers under `backend/src/modules`.
- **REQ-002**: Persist artwork and order data in PostgreSQL via Prisma schema located at `backend/prisma/schema.prisma`.
- **REQ-003**: Store artwork metadata JSON on IPFS via Pinata SDK; persist returned CID in `auth_tokens.metadata_ipfs`.
- **REQ-004**: Integrate Paystack transaction charge with signature-verified webhook at `POST /payments/webhook`.
- **REQ-005**: Mint Hedera NFTs using `@hashgraph/sdk` with operator credentials stored in `.env` and injected through `backend/src/config/hedera.config.ts`.
- **SEC-001**: Encrypt environment secrets at rest and ensure no secrets committed to git per `.gitignore` enforcement.
- **SEC-002**: Validate Paystack webhook signatures and protect endpoints with role-based guards.
- **CON-001**: Maintain response latency <= 300ms by leveraging Redis caching for GET `/artworks`.
- **CON-002**: Ensure minting jobs reach eventual consistency within 5 minutes via BullMQ retry strategy.
- **GUD-001**: Follow NestJS module structure with service injections and DTO validation using `class-validator`.
- **PAT-001**: Use CQRS-inspired separation: controllers delegate to services, services orchestrate repositories and queues.

## 2. Implementation Steps

### Implementation Phase 1

- GOAL-001: Scaffold backend foundation, database schema, and configuration management.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Generate NestJS app in `backend/` with ESLint, Prettier, and tsconfig aligned to existing repo standards. |  |  |
| TASK-002 | Create `backend/prisma/schema.prisma` reflecting tables in `.github/copilot-instructions.md` Section 5 and run `npx prisma migrate dev` seeds. |  |  |
| TASK-003 | Implement configuration module at `backend/src/config` covering env validation (Stripe, Hedera, database, Redis, IPFS). |  |  |
| TASK-004 | Provision Redis and PostgreSQL docker-compose in `backend/docker-compose.infrastructure.yml` for local development. |  |  |

### Implementation Phase 2

- GOAL-002: Deliver core modules for authentication, artist management, artworks, and marketplace queries.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-005 | Implement `backend/src/modules/auth` with JWT access+refresh flows, guards, and `POST /auth/*` endpoints. |  |  |
| TASK-006 | Implement `backend/src/modules/users` for artist onboarding, role assignments, and manual KYC state transitions. |  |  |
| TASK-007 | Implement `backend/src/modules/artworks` for CRUD, S3 upload orchestration, IPFS metadata generation, caching strategy for GET endpoints. |  |  |
| TASK-008 | Implement `backend/src/modules/marketplace` for public browse and search with Redis caching. |  |  |

### Implementation Phase 3

- GOAL-003: Implement orders, payments, and minting job queue with Hedera integration.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-009 | Implement `backend/src/modules/orders` handling checkout intent creation and order lifecycle state machine. |  |  |
| TASK-010 | Integrate Paystack at `backend/src/modules/payments` with webhook controller, signature verification, and order updates. |  |  |
| TASK-011 | Configure BullMQ queue (`mint_authenticity`) under `backend/src/modules/queue` with Redis connections and durable retry policies. |  |  |
| TASK-012 | Implement Hedera minting worker in `backend/src/workers/mint-authenticity.worker.ts` using IPFS metadata CIDs; handle success/failure logging. |  |  |

### Implementation Phase 4

- GOAL-004: Deliver admin tooling, observability, and automated tests.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-013 | Implement admin module at `backend/src/modules/admin` with moderation, re-mint endpoint, and audit log views. |  |  |
| TASK-014 | Integrate Sentry and Prometheus metrics exporters in `backend/src/main.ts` and `backend/src/observability`. |  |  |
| TASK-015 | Implement provenance audit logging service writing to `audit_logs` on key events. |  |  |
| TASK-016 | Author automated test suites and CI workflow (see Section 6). |  |  |

## 3. Alternatives

- **ALT-001**: Use Express + custom architecture; rejected to leverage NestJS scaffolding and module system for faster delivery.
- **ALT-002**: Store metadata directly on S3 instead of IPFS; rejected to satisfy authenticity and decentralization requirements.

## 4. Dependencies

- **DEP-001**: `@nestjs/*` packages for framework foundation.
- **DEP-002**: `@prisma/client` and `prisma` for database access.
- **DEP-003**: `@hashgraph/sdk` for Hedera token service operations.
- **DEP-004**: `bullmq` and `ioredis` for queue management.
- **DEP-005**: `paystack-sdk` (or official API client) for payment integration.
- **DEP-006**: `@pinata/sdk` for IPFS uploads.

## 5. Files

- **FILE-001**: `backend/src/main.ts` — NestJS bootstrap with global pipes, filters, interceptors.
- **FILE-002**: `backend/prisma/schema.prisma` — Database schema definition.
- **FILE-003**: `backend/src/modules/**/*` — Feature modules for auth, users, artworks, marketplace, orders, payments, admin.
- **FILE-004**: `backend/src/workers/mint-authenticity.worker.ts` — Hedera mint job executor.
- **FILE-005**: `backend/test/**/*.spec.ts` — Automated tests.
- **FILE-006**: `backend/docker-compose.infrastructure.yml` — Local infra stack configuration.

## 6. Testing

- **TEST-001**: `backend/test/integration/payments.webhook.spec.ts` verifying Paystack webhook signature validation and order status transitions.
- **TEST-002**: `backend/test/integration/mint-authenticity.worker.spec.ts` ensuring successful Hedera mint after payment and IPFS CID persistence.
- **TEST-003**: `backend/test/unit/artworks.service.spec.ts` covering metadata generation and IPFS upload flow.
- **TEST-004**: `backend/test/e2e/buyer-journey.spec.ts` exercising discovery → checkout → certificate endpoint.
- **TEST-005**: GitHub Actions workflow `backend/.github/workflows/backend-ci.yml` running lint, unit, integration, and e2e suites.

### Test Data & Fixtures

- Create reusable Prisma seed data under `backend/prisma/seed.ts` for base users, artists, and artworks.
- Provide Paystack webhook payload fixtures in `backend/test/fixtures/paystack` mirroring success, failure, and replay attempts.
- Mock Hedera SDK using dependency injection with in-memory responses for unit tests; rely on testnet for selective integration tests flagged with `@hedera` tag.
- Store IPFS fixture responses (CID, pinned metadata) in `backend/test/fixtures/ipfs` for deterministic unit tests.

## 7. Risks & Assumptions

- **RISK-001**: Hedera testnet instability may delay mint jobs; mitigate with retry and fallback treasury logging.
- **RISK-002**: Stripe webhook downtime could backlog orders; mitigate with replay-safe idempotency keys and manual retry tooling.
- **ASSUMPTION-001**: AWS S3 bucket, Redis, PostgreSQL, and Pinata credentials are available via secure secret management before deployment.
- **ASSUMPTION-002**: Artists accept manual KYC process until automated solution is prioritized.

## 8. Related Specifications / Further Reading

[.github/copilot-instructions.md]
[https://docs.hedera.com/hedera/sdks-and-apis/sdks/javascript]
[https://paystack.com/docs/api]

## 9. TODO Checklist

- [ ] Spin up NestJS project scaffold with shared ESLint/Prettier rules.
- [ ] Define Prisma schema, run initial migration, and commit generated client.
- [ ] Implement configuration module with validation pipes for Paystack, Hedera, Redis, IPFS.
- [ ] Wire Redis and Postgres via docker-compose infrastructure stack.
- [ ] Ship auth, users, artworks, and marketplace modules with DTO validation and caching.
- [ ] Complete payments + orders modules with Paystack webhook verification.
- [ ] Deliver BullMQ queue and mint worker integrating Hedera + IPFS metadata.
- [ ] Expose admin tooling and audit log pipeline.
- [ ] Instrument Sentry + basic metrics endpoint.
- [ ] Finalize automated test suites and CI workflow.

## 10. Milestones & Cadence

- **M1 (Week 1)**: Backend scaffold, config, and database migrations complete; auth module stubbed.
- **M2 (Week 2)**: Artworks + marketplace endpoints online with caching; IPFS upload path functional in staging.
- **M3 (Week 3)**: Payments, orders, and mint worker producing Hedera tokens on testnet.
- **M4 (Week 4)**: Admin console endpoints, observability, full automated test matrix passing in CI.

## 11. Monitoring & Runbooks

- Document mint worker retry procedure in `backend/docs/runbooks/mint-authenticity.md`.
- Configure alert thresholds: queue depth > 50 for 5 minutes, mint failure rate > 5% within 1 hour.
- Record manual re-mint process in admin module README and ensure audit logs capture operator actions.