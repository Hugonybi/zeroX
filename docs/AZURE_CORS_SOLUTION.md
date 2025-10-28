# Azure Blob Storage CORS Solution

## Problem
When the frontend tries to load images directly from Azure Blob Storage, the browser blocks the request due to CORS (Cross-Origin Resource Sharing) policy. This results in errors like:
- `NS_BINDING_ABORTED`
- `A resource is blocked by OpaqueResponseBlocking`

## Solution Implemented: Backend Image Proxy

We've implemented a proxy endpoint in the backend that fetches images from Azure Blob Storage and serves them to the frontend, bypassing CORS restrictions.

### How It Works

1. **Backend Proxy Controller** (`artworks-proxy.controller.ts`):
   - Endpoint: `GET /proxy/image/*`
   - Takes any Azure Blob URL and proxies it through the backend
   - Sets proper CORS headers to allow frontend access

2. **Automatic URL Transformation** (`artworks.service.ts`):
   - All artwork media URLs are automatically transformed when returned from the API
   - Example transformation:
     ```
     Original: https://zerox.blob.core.windows.net/artwork/image.jpg
     Proxied:  http://localhost:4000/proxy/image/zerox.blob.core.windows.net/artwork/image.jpg
     ```

3. **Benefits**:
   - ✅ No Azure portal configuration required
   - ✅ Works immediately in development
   - ✅ Images load without CORS errors
   - ✅ Transparent to frontend code

### Configuration

The backend uses `API_BASE_URL` from environment variables to construct proxy URLs:

**backend/.env**:
```env
API_BASE_URL="http://localhost:4000"
```

For production, update this to your production backend URL:
```env
API_BASE_URL="https://api.yourdomain.com"
```

## Alternative Solution: Configure Azure CORS (Production Recommended)

For production deployments, you should configure CORS directly on Azure Blob Storage for better performance (fewer hops).

### Steps to Configure Azure CORS:

1. **Azure Portal**:
   - Go to your Storage Account → Resource sharing (CORS)
   - Add a CORS rule with:
     - **Allowed origins**: `https://yourdomain.com` (your frontend domain)
     - **Allowed methods**: `GET`
     - **Allowed headers**: `*`
     - **Exposed headers**: `*`
     - **Max age**: `3600`

2. **Azure CLI**:
   ```bash
   az storage cors add \
     --services b \
     --methods GET \
     --origins https://yourdomain.com \
     --allowed-headers '*' \
     --exposed-headers '*' \
     --max-age 3600 \
     --account-name zerox
   ```

### When to Use Each Solution:

| Solution | Best For | Pros | Cons |
|----------|----------|------|------|
| **Backend Proxy** | Development, Simple setups | No Azure config needed, Works immediately | Extra network hop, Backend handles traffic |
| **Azure CORS** | Production | Faster (direct), Less backend load | Requires Azure configuration, Domain-specific |

## Testing

To test the proxy is working:

1. Start the backend: `cd backend && npm run start:dev`
2. Check the logs for: `[RouterExplorer] Mapped {/proxy/image/*, GET} route`
3. Access an image via proxy:
   ```
   http://localhost:4000/proxy/image/zerox.blob.core.windows.net/artwork/your-image.jpg
   ```
4. The frontend will automatically use proxied URLs when fetching artworks from `/artworks` API

## Troubleshooting

### Images still not loading?
- Check browser console for the actual URL being requested
- Verify backend is running (`http://localhost:4000`)
- Check that the artwork API returns proxied URLs (should start with `http://localhost:4000/proxy/image/`)

### 404 errors from proxy?
- Verify the Azure Blob URL is correct
- Check Azure SAS token hasn't expired
- Ensure the blob exists in Azure Storage

### Performance concerns?
- For production, switch to Azure CORS configuration
- Consider adding CDN in front of your backend
- Implement caching headers (already set in proxy controller)
