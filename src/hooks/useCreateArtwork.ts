import { useCallback, useState } from "react";
import { API_BASE_URL } from "../config/api";
import { createHttpClient } from "../lib/http";
import type { Artwork } from "../types/artwork";
import type { CreateArtworkPayload } from "../features/artists/mappers";

export type UseCreateArtworkResult = {
  mutate: (payload: CreateArtworkPayload) => Promise<Artwork>;
  status: "idle" | "pending" | "success" | "error";
  error: Error | null;
  reset: () => void;
};

const httpClient = createHttpClient(API_BASE_URL, {
  getAuthToken: () => {
    // TODO: Replace with real auth token from context/storage once auth module lands
    const stubToken = localStorage.getItem("auth_token");
    if (!stubToken) {
      console.warn("No auth token found. Artist endpoints require authentication.");
    }
    return stubToken;
  },
});

export function useCreateArtwork(): UseCreateArtworkResult {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (payload: CreateArtworkPayload): Promise<Artwork> => {
    setStatus("pending");
    setError(null);

    try {
      const artwork = await httpClient.post<Artwork>("/artist/artworks", payload);
      setStatus("success");
      return artwork;
    } catch (err) {
      const errorObject = err instanceof Error ? err : new Error(String(err));
      setError(errorObject);
      setStatus("error");
      throw errorObject;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return {
    mutate,
    status,
    error,
    reset,
  };
}
