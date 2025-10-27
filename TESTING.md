# Quick Start: Test Artwork Creation Flow

## Step 1: Start Servers

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
npm run dev
```

## Step 2: Get Auth Token

```bash
# Terminal 3
node test-artwork-flow.js
```

Copy the token from the output (after `localStorage.setItem('auth_token', '...`).

## Step 3: Set Token in Browser

**Option A: Use Dev Banner (Easiest)**
1. Open `http://localhost:5174`
2. Look for orange "Dev Auth Helper" banner in bottom-right
3. Click "Set Token" button
4. Paste the JWT token from test script
5. Click "Set Token" to save

**Option B: Use Console**
1. Open `http://localhost:5174`
2. Press F12 to open DevTools
3. Go to Console tab
4. Paste and run:
   ```javascript
   localStorage.setItem('auth_token', 'YOUR_TOKEN_HERE');
   ```
5. Refresh page

## Step 4: Test Artwork Creation

1. Click "Post artwork" button on home page (or navigate to `/artists`)
2. Fill out the form:
   - **Step 1 - Details:**
     - Title: "Test Artwork"
     - Description: "Testing the full flow"
     - Classification: Digital or Physical
     - Category: Select any
   
   - **Step 2 - Media:**
     - Click upload area
     - Select an image file (JPG, PNG, etc.)
     - Preview should appear
     - Edition size: 1
   
   - **Step 3 - Pricing:**
     - Price: 500 (will be ₦500.00)
     - Currency: NGN
     - Inventory: 1
     - Click "Publish listing"

3. Watch for:
   - Button shows "loading" state
   - Success toast appears (green notification)
   - Form clears automatically

4. Navigate back to home (`/`)
5. **Verify:** Your new artwork appears in the gallery

## Troubleshooting

### "No auth token found"
- Token expired (15 min lifetime) - Run `node test-artwork-flow.js` again
- Token not set correctly - Check DevTools → Application → Local Storage → `auth_token`

### "Azure upload error, falling back to stub"
- **This is expected!** Azure SAS token has CORS restrictions
- Stub URL is generated: `https://stub.azureblob.local/artwork/stub-...`
- Backend accepts stub URLs for testing

### "Request failed" / 401 Unauthorized
- Auth token missing or expired
- Set new token using test script

### Backend not responding
- Check `backend/` terminal for errors
- Verify running on port 4000: `curl http://localhost:4000/artworks`

### Frontend not loading
- Check port (might be 5174 instead of 5173)
- Verify `.env` file exists with `VITE_API_BASE_URL="http://localhost:4000"`

## Expected Behavior

✅ **Success Flow:**
1. Form validation passes (all required fields filled)
2. File uploads (stub URL generated if Azure unavailable)
3. POST `/artist/artworks` returns 201 with artwork data
4. Success toast displays
5. Form resets to initial state
6. New artwork appears in marketplace

❌ **Error States:**
- Missing required fields → Button stays disabled
- No auth token → 401 error + error toast
- Network error → Error toast with retry message
- Invalid file type → Browser file picker filters

## What's Being Tested

- [x] Azure upload service (with fallback)
- [x] Form-to-DTO mapping (price conversion to cents)
- [x] Authenticated POST request with JWT
- [x] Backend artwork creation endpoint
- [x] Toast notification system
- [x] Form state management
- [x] Marketplace data refresh
- [x] Error handling and user feedback
