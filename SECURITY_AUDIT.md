# Security and UX Audit Findings

This document summarizes the security and UX findings from a recent audit of the codebase.

## Security Vulnerabilities

### 1. Critical: Hardcoded Database Credentials

-   **File:** `backend/docker-compose.infrastructure.yml`
-   **Issue:** The `POSTGRES_PASSWORD` is hardcoded as `hedera`. This is a critical security vulnerability that exposes the database password in plain text.
-   **Recommendation:** The password should be externalized using environment variables. The `docker-compose.yml` file should use a variable like `${POSTGRES_PASSWORD}` and the actual password should be loaded from a `.env` file or the host environment.

### 2. High: Default JWT Secrets

-   **File:** `backend/src/config/configuration.ts`
-   **Issue:** The JWT secrets (`accessSecret` and `refreshSecret`) default to weak, predictable values (`'changeme'` and `'changeme-refresh'`) if the corresponding environment variables are not set. This could allow an attacker to forge JWTs if the application is deployed without proper configuration.
-   **Recommendation:** The application should fail to start if the JWT secrets are not provided. The default values should be removed, and the validation schema should be the single source of truth for required secrets.

### 3. Medium: Hardcoded Passwords in Test/Dev Files

-   **Files:** `test-artwork-flow.js`, `test-certificate-flow.js`, `test-minting-only.js`, `src/components/DevAuthBanner.tsx`
-   **Issue:** The password `'Test123!@#'` is hardcoded in multiple places for testing and development purposes. While not a production credential, it's a bad practice that increases the risk of these credentials being used in unintended environments.
-   **Recommendation:** Test credentials should be loaded from environment variables or a separate, non-committed configuration file.

### 4. Medium: Insecure Development Authentication Helper

-   **File:** `src/components/DevAuthBanner.tsx`
-   **Issue:** This component, while guarded from production builds, provides a UI for developers to manually set JWTs in `localStorage`. This encourages insecure practices and could be a security risk if the production guard fails or is misconfigured.
-   **Recommendation:** The developer authentication workflow should be improved to avoid manual token handling. For example, a development-only endpoint could provide a secure way to obtain a valid token.

## UX Issues

### 1. Clunky Developer Experience

-   **File:** `src/components/DevAuthBanner.tsx`
-   **Issue:** The "Dev Auth Helper" is a clunky and manual way for developers to authenticate. It requires copying and pasting tokens, which is inefficient and error-prone.
-   **Recommendation:** A more streamlined developer authentication process should be implemented. This could involve a dedicated development login page or a CLI command to generate a valid token.

## Recommendations Summary

The following actions are recommended to address these findings:

1.  **Immediately** remove the hardcoded database password from `docker-compose.infrastructure.yml` and use environment variables.
2.  Remove the default JWT secrets from `configuration.ts` and enforce their presence through environment variables.
3.  Remove hardcoded test passwords and use environment variables for test credentials.
4.  Re-evaluate the developer authentication workflow and replace the `DevAuthBanner` with a more secure and user-friendly solution.
