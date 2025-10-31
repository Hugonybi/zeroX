---
goal: Deliver complete frontend authentication UX with JWT integration
version: 1.0
date_created: 2025-10-28
last_updated: 2025-10-28
owner: Frontend Platform Team
status: Planned
tags: [feature, auth, frontend]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-1E90FF)

This plan enables end-to-end user authentication on the frontend, matching the existing backend JWT APIs. It covers UI flows, token lifecycle management, route protection, and profile access.

## 1. Requirements & Constraints

- **REQ-001**: Provide user login and registration forms that call backend `/auth/login` and `/auth/register`.
- **REQ-002**: Persist access and refresh tokens securely using HTTP-only cookies via backend endpoints.
- **REQ-003**: Implement automatic token refresh on expiry via `/auth/refresh`.
- **REQ-004**: Enforce protected routes for authenticated roles (`buyer`, `artist`, `admin`).
- **REQ-005**: Expose user profile view/edit sourced from `/users/me`.
- **REQ-006**: Surface auth errors and validation feedback to users.
- **SEC-001**: Do not expose JWTs to JavaScript; rely on backend-managed cookies for storage.
- **SEC-002**: Guard against CSRF by integrating backend-issued CSRF token header on mutating requests.
- **CON-001**: Maintain compatibility with existing React + Vite setup and routing conventions in `src/pages`.
- **CON-002**: Follow existing Tailwind styling and component patterns from `src/components`.
- **GUD-001**: Reuse `lib/http.ts` utilities for API interaction.
- **GUD-002**: Keep all auth state in a dedicated context provider under `src/features/auth`.
- **PAT-001**: Use React Router loaders/actions for route protection consistent with current routing approach.

## 2. Implementation Steps

### Implementation Phase 1

- GOAL-001: Establish auth data layer, context, and API helpers.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Update `src/lib/http.ts` to expose `setAuthHeaders`, `clearAuthHeaders`, and CSRF extraction helpers tied to backend cookie responses. |  |  |
| TASK-002 | Create `src/features/auth/api.ts` implementing `login`, `register`, `refreshSession`, and `fetchCurrentUser` using backend endpoints; ensure functions accept typed payloads and return typed responses. |  |  |
| TASK-003 | Add `src/features/auth/types.ts` defining `AuthUser`, `LoginPayload`, `RegisterPayload`, and response DTOs matching backend schema. |  |  |
| TASK-004 | Implement `AuthProvider` in `src/features/auth/AuthContext.tsx` managing auth state, loading flags, refresh scheduling, and providing `signIn`, `signOut`, and `requireAuth` helpers; depends on TASK-001 and TASK-002. |  |  |
| TASK-005 | Wire `AuthProvider` around app root in `src/main.tsx`, ensuring lazy refresh on app load and dev banner integration; depends on TASK-004. |  |  |

### Implementation Phase 2

- GOAL-002: Deliver authentication UI flows and route protection.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-006 | Create `src/pages/LoginPage.tsx` with form fields (email, password), client-side validation, loading state, and error handling pulling `signIn` from context. |  |  |
| TASK-007 | Create `src/pages/RegisterPage.tsx` supporting role selection (`artist`/`buyer`), password confirmation, terms checkbox, and calls `register`; reuse shared form components. |  |  |
| TASK-008 | Add route entries in `src/main.tsx` (or routing file) for `/login` and `/register`; redirect authenticated users away from these routes; depends on TASK-006 and TASK-007. |  |  |
| TASK-009 | Implement higher-order component or hook `useProtectedRoute` in `src/features/auth/hooks.ts` to gate routes; integrate with `src/pages/AdminPage.tsx`, `ArtistsPage.tsx`, `CertificatePage.tsx`, and any role-specific screens. |  |  |
| TASK-010 | Update navigation components (`src/components/SiteHeader.tsx`, `src/components/Sidebar.tsx`) to reflect signed-in state, display user menu, and offer sign-out action; depends on TASK-004. |  |  |

### Implementation Phase 3

- GOAL-003: Add profile UX, session resilience, and regression coverage.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-011 | Create `src/pages/ProfilePage.tsx` to display and edit user info via `/users/me`; include form to update name, bio, and password change stub (if supported). |  |  |
| TASK-012 | Implement silent refresh logic using `refreshSession` on 401 responses within `lib/http.ts` interceptor; ensure retry only once per request and logout on failure; depends on TASK-001 and TASK-002. |  |  |
| TASK-013 | Add global toast/error handling for auth failures in `src/hooks/useToast.ts` where necessary, ensuring consistent messaging and logging. |  |  |
| TASK-014 | Document auth flow and token lifecycle in `docs/qa/frontend-backend-sync.md`; include diagrams or sequence chart referencing new modules. |  |  |
| TASK-015 | Build automated tests: component tests for login/register, integration test for protected route behavior using React Testing Library under `src/features/auth/__tests__/`. |  |  |

## 3. Alternatives

- **ALT-001**: Use a third-party auth provider (e.g., Auth0) instead of backend JWT; rejected to stay aligned with existing NestJS auth.
- **ALT-002**: Store JWTs in `localStorage`; rejected due to security requirements and existing backend cookie strategy.

## 4. Dependencies

- **DEP-001**: Backend `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout`, `/users/me` endpoints operational and returning cookies.
- **DEP-002**: React Router configuration supporting loaders/actions and redirection.
- **DEP-003**: Toast/notification system in `src/hooks/useToast.ts` functioning for error surfacing.

## 5. Files

- **FILE-001**: `src/lib/http.ts` – extend HTTP utility with auth-aware interceptors.
- **FILE-002**: `src/features/auth/api.ts` – implement API bindings.
- **FILE-003**: `src/features/auth/AuthContext.tsx` – new auth provider and hooks.
- **FILE-004**: `src/pages/LoginPage.tsx` – login UI.
- **FILE-005**: `src/pages/RegisterPage.tsx` – registration UI.
- **FILE-006**: `src/pages/ProfilePage.tsx` – profile management.
- **FILE-007**: `src/components/SiteHeader.tsx` and `src/components/Sidebar.tsx` – navigation updates.
- **FILE-008**: `docs/qa/frontend-backend-sync.md` – updated documentation.
- **FILE-009**: `src/features/auth/__tests__/*.test.tsx` – automated tests.

## 6. Testing

- **TEST-001**: Component test verifying login form submits credentials and handles success/error states.
- **TEST-002**: Component test verifying registration flow and validation messages.
- **TEST-003**: Integration test confirming protected route redirects unauthenticated users and allows access post-login.
- **TEST-004**: Hook test ensuring `AuthProvider` auto-refreshes tokens and logs out on refresh failure.
- **TEST-005**: E2E script (`test-artwork-flow.js`) updated to authenticate via new UI prior to artwork interactions.

## 7. Risks & Assumptions

- **RISK-001**: Backend cookie configuration may differ between environments; mitigate with early staging verification.
- **RISK-002**: Silent refresh race conditions could cause request duplication; ensure single-flight logic in interceptor.
- **ASSUMPTION-001**: Backend already issues CSRF token headers for stateful sessions; if absent, need backend update.

## 8. Related Specifications / Further Reading

- [backend/README.md](backend/README.md)
- [docs/qa/frontend-backend-sync.md](docs/qa/frontend-backend-sync.md)
- [backend/IMPLEMENTATION_TODO.md](backend/IMPLEMENTATION_TODO.md)
