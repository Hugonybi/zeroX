---
goal: Connect SPA frontend to NestJS backend for artwork workflows
version: 1.0
date_created: 2025-10-26
owner: Frontend-Integration
status: Planned
tags: [feature, integration, frontend, backend]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

Define the deterministic steps required to replace mock data in the React SPA with live NestJS endpoints, covering browse and artist publishing flows while preserving existing UX.

## 1. Requirements & Constraints

- **REQ-001**: Frontend must fetch published artworks from `GET /artworks` exposed by `backend/src/modules/artworks/artworks.controller.ts`.
- **REQ-002**: Artist listing form must submit to `POST /artist/artworks` with JWT guard support once authentication wiring is complete.
- **REQ-003**: Introduce configurable backend base URL via `VITE_API_BASE_URL` and validate presence at build time.
- **REQ-004**: Surface Azure Blob Storage media URLs via the frontend upload flow so `POST /artist/artworks` receives a valid `mediaUrl`.
- **SEC-001**: Ensure all authenticated requests attach `Authorization: Bearer <token>` header sourced from secure storage (`localStorage` placeholder until auth module lands).
- **CON-001**: Preserve existing landing page load < 200ms by caching last fetched artworks in memory during the session.
- **CON-002**: Provide an offline-safe gallery mode via feature flag so browsing still works when the API is unavailable (falls back to mock seed data).
- **GUD-001**: Centralize HTTP logic inside `src/lib/http.ts` to enforce consistent error handling and typing.
- **PAT-001**: Use data hooks (`useArtworks`, `useCreateArtwork`) colocated in `src/hooks` to keep components presentation-focused.

## 2. Implementation Steps

### Implementation Phase 1

- GOAL-001: Establish environment-driven HTTP client with typed helpers.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Add `.env.example` entry `VITE_API_BASE_URL="http://localhost:4000"` and update `README.md` setup section with backend start instructions. |  |  |
| TASK-002 | Create `src/lib/http.ts` exporting `createHttpClient(baseUrl: string)` with `fetch` wrapper, JSON parsing, error normalization, and automatic header composition. |  |  |
| TASK-003 | Implement `src/config/api.ts` to read `import.meta.env.VITE_API_BASE_URL`, throw descriptive error if missing, and expose typed `API_BASE_URL` constant. |  |  |

### Implementation Phase 2

- GOAL-002: Replace gallery mock data with live `/artworks` integration and resilient UI states.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-004 | Create `src/types/artwork.ts` mirroring fields returned by `backend/src/modules/artworks/artworks.service.ts::findPublished`. |  |  |
| TASK-005 | Implement `src/hooks/useArtworks.ts` fetching from `/artworks`, caching in module-level memo, and exposing `{ data, isLoading, error, refetch }`. |  |  |
| TASK-006 | Wire feature flag (e.g. `VITE_USE_MOCK_ARTWORKS`) that preserves mock data fallback when API errors or flag is enabled; document toggle for local/offline dev. |  |  |
| TASK-007 | Update `src/pages/GalleryPage.tsx` to consume `useArtworks` hook, handle loading/error states, and respect the mock-data fallback flag. Remove `mockArtworks` only when flag is false. |  |  |

### Implementation Phase 3

- GOAL-003: Wire artist posting flow to backend create endpoint with optimistic UX.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-008 | Implement `src/lib/azureStorage.ts` (or similar service) to upload assets to Azure Blob Storage, returning secure `mediaUrl`/`metadataUrl` placeholders for backend consumption. Provide local stub when Azure credentials absent. |  |  |
| TASK-009 | Add DTO transformer in `src/features/artists/mappers.ts` converting `ArtistsPage` form state into backend `CreateArtworkDto` payload (name-matched fields, including `priceCents` conversion). |  |  |
| TASK-010 | Implement `src/hooks/useCreateArtwork.ts` performing authenticated POST `/artist/artworks`, exposing `{ mutate, status, error }` with retry logic. |  |  |
| TASK-011 | Integrate hook within `src/pages/ArtistsPage.tsx` submit handler; on success clear form, trigger toast (new `src/components/ui/Toast.tsx`), and optionally navigate to confirmation state without reloading. |  |  |

### Implementation Phase 4

- GOAL-004: Provide integration smoke tests and manual verification scripts.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-011 | Add `src/test/msw/handlers.ts` mocking `/artworks` and `/artist/artworks` for unit tests; configure MSW in `vitest` (if unavailable, note follow-up). |  |  |
| TASK-012 | Author `src/pages/__tests__/GalleryPage.spec.tsx` asserting loading, success, and error states using MSW mocks. |  |  |
| TASK-013 | Document manual QA script in `docs/qa/frontend-backend-sync.md` covering backend startup, JWT acquisition stub, artwork publish confirmation, and gallery refresh. |  |  |

## 3. Alternatives

- **ALT-001**: Directly call `fetch` within components; rejected to avoid duplicated error handling and ease of future retry policies.
- **ALT-002**: Introduce `@tanstack/react-query`; deferred to prevent additional dependency footprint until caching requirements exceed simple memoization.

## 4. Dependencies

- **DEP-001**: Backend NestJS server running on `http://localhost:4000` with `/artworks` and `/artist/artworks` endpoints available.
- **DEP-002**: Valid JWT token provisioning flow (temporary hardcoded token for local testing until auth UI lands).
- **DEP-003**: Azure Blob Storage container with SAS or managed identity configuration for uploads (stubbed locally when unavailable).
- **DEP-004**: MSW and Vitest configuration (if Vitest not yet installed, create issue to add test runner before executing Phase 4).

## 5. Files

- **FILE-001**: `src/lib/http.ts` — new HTTP utility module.
- **FILE-002**: `src/hooks/useArtworks.ts` — data fetching hook for gallery listings.
- **FILE-003**: `src/hooks/useCreateArtwork.ts` — mutation hook for artist submissions.
- **FILE-004**: `src/pages/GalleryPage.tsx` — landing page consumption of live data.
- **FILE-005**: `src/pages/ArtistsPage.tsx` — submission handler integration.
- **FILE-006**: `src/data/mockArtworks.ts` — file removal once API live.

## 6. Testing

- **TEST-001**: Component test `src/pages/__tests__/GalleryPage.spec.tsx` simulating success and failure of `/artworks` fetch.
- **TEST-002**: Hook test `src/hooks/__tests__/useCreateArtwork.spec.ts` verifying payload mapping and error handling via MSW mocks.
- **TEST-003**: End-to-end smoke (manual) described in `docs/qa/frontend-backend-sync.md` ensuring newly posted artwork appears on gallery after backend persistence.

## 7. Risks & Assumptions

- **RISK-001**: Backend CORS misconfiguration could block browser requests; plan includes validation during Phase 1 QA.
- **RISK-002**: Absence of auth token generation flow may delay POST integration; mitigate with temporary stub service and track follow-up ticket.
- **RISK-003**: Azure upload latency could impact artist UX; cache SAS tokens and stream uploads to keep interaction responsive.
- **ASSUMPTION-001**: Backend response shape remains stable and aligns with Prisma model; any changes require updating shared TypeScript types.
- **ASSUMPTION-002**: Azure storage credentials are provisioned via environment variables in both frontend and backend environments.

## 8. Related Specifications / Further Reading

[.github/copilot-instructions.md]
[plan/feature-hedera-backend-1.md]
[backend/IMPLEMENTATION_TODO.md]
