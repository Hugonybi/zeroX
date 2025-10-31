# Frontend-Backend Integration Test Results

**Test Date:** October 26, 2025  
**Branch:** `linkWithBackend`

## Authentication Flow

The application now uses cookie-based JWT authentication:

### Backend Endpoints
- `POST /auth/register` - Register new user, sets HTTP-only cookies
- `POST /auth/login` - Login user, sets HTTP-only cookies  
- `POST /auth/refresh` - Refresh access token using refresh cookie
- `POST /auth/logout` - Clear auth cookies
- `GET /users/me` - Get current user profile (requires auth)

### Frontend Implementation
- Cookie-based auth (no localStorage JWT exposure)
- Automatic token refresh on 401 responses
- Protected routes with role-based access
- Auth context provider managing global auth state
- Login/Register forms with validation
- Profile page for user management

### Test Authentication
1. Visit `http://localhost:5174/register` to create an account
2. Or use the Dev Auth Banner (bottom-right) to auto-generate a test artist account
3. Protected routes (`/artists`, `/admin`, `/certificate/*`) require authentication
4. Profile page at `/profile` shows user information

## Backend API Tests ✅

### 1. Artist Registration
- **Endpoint:** `POST /auth/register`
- **Status:** ✅ Success
- **Result:** JWT tokens generated automatically

### 2. Artwork Creation (API)
- **Endpoint:** `POST /artist/artworks`
- **Status:** ✅ Success
- **Authentication:** Bearer token validated
- **Test Artwork ID:** `7e3f9952-dd87-4392-8a16-4cd9d0c6eaec`

### 3. Marketplace Listing
- **Endpoint:** `GET /artworks`
- **Status:** ✅ Success
- **Result:** Created artwork appears in public listing

## Frontend UI Test Instructions

### Setup
1. Open browser to: `http://localhost:5174`
2. Open DevTools Console (F12)
3. Run command to set auth token:
   ```javascript
   localStorage.setItem('auth_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNWQ3MThkMC1hY2M0LTRkY2EtOGUzZi04Yjg1ODBiNTQ4ZWEiLCJyb2xlIjoiYXJ0aXN0IiwiaWF0IjoxNzYxNTA2NTE5LCJleHAiOjE3NjE1MDc0MTl9.Cta5GA8Y-KrVW3EhITfzzWcFyfaF-f9VYg2UUp2SIuM');
   ```

### Test Checklist

#### Gallery Page (Home)
- [ ] Page loads without errors
- [ ] Artwork grid displays mock or live data based on `VITE_USE_MOCK_ARTWORKS`
- [ ] "Post artwork" button visible
- [ ] Prices formatted correctly (₦ symbol + commas)
- [ ] Loading skeletons appear during fetch

#### Artist Posting Flow (`/artists`)
- [ ] Navigate to posting page via button or URL
- [ ] Step 1: Artwork Details
  - [ ] Title and description fields accept input
  - [ ] Digital/Physical classification toggles work
  - [ ] Category dropdown populated
- [ ] Step 2: Media & Editions
  - [ ] File upload trigger opens file picker
  - [ ] Preview image displays after selection
  - [ ] Edition size accepts numeric input
- [ ] Step 3: Pricing & Launch
  - [ ] Price field accepts decimal numbers
  - [ ] Currency dropdown shows NGN/USD/GBP/EUR
  - [ ] "Publish listing" button enabled when valid
- [ ] Form Submission
  - [ ] Button shows loading state during upload
  - [ ] Azure stub URL generated (check Network tab)
  - [ ] Success toast notification appears
  - [ ] Form clears after successful submission
- [ ] Marketplace Refresh
  - [ ] Navigate back to home (`/`)
  - [ ] New artwork appears in gallery grid
  - [ ] Artwork title matches submitted form

## Environment Configuration

```env
VITE_API_BASE_URL="http://localhost:4000"
VITE_USE_MOCK_ARTWORKS="true"
VITE_AZURE_STORAGE_ACCOUNT="zerox"
VITE_AZURE_STORAGE_CONTAINER="artwork"
VITE_AZURE_SAS_TOKEN="sp=r&st=..."
```

## Known Limitations
- Auth token expires after 15 minutes (refresh required)
- Azure upload uses stubbed URLs when credentials invalid/expired
- Gallery caches results for 60 seconds

## Next Steps
- [ ] Complete manual UI test checklist above
- [ ] Test error states (invalid token, network failure)
- [ ] Verify CORS headers if testing from different origin
- [ ] Add integration tests with MSW (Phase 4)
