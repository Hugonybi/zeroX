const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!rawBaseUrl || typeof rawBaseUrl !== "string") {
  throw new Error("VITE_API_BASE_URL is required. Set it in your .env file.");
}

const normalizedBaseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

if (!/^https?:\/\//.test(normalizedBaseUrl)) {
  throw new Error("VITE_API_BASE_URL must be an absolute URL, e.g. https://api.example.com");
}

const rawMockFlag = import.meta.env.VITE_USE_MOCK_ARTWORKS;

const useMockArtworks = typeof rawMockFlag === "string" ? rawMockFlag.toLowerCase() === "true" : Boolean(rawMockFlag);

export const API_BASE_URL = normalizedBaseUrl;
export const USE_MOCK_ARTWORKS = useMockArtworks;
