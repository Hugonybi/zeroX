import { createHttpClient } from './http';
import { API_BASE_URL } from '../config/api';
import { getAuthToken } from './authHelper';
import type { Certificate } from '../types/certificate';

const httpClient = createHttpClient(API_BASE_URL, {
  getAuthToken
});

export const certificateService = {
  /**
   * Get certificate by order ID
   */
  async getByOrder(orderId: string): Promise<Certificate> {
    const response = await httpClient.get<Certificate>(`/ownership/order/${orderId}`);
    return response;
  },

  /**
   * Get certificate by artwork ID
   */
  async getByArtwork(artworkId: string): Promise<Certificate> {
    const response = await httpClient.get<Certificate>(`/ownership/artwork/${artworkId}`);
    return response;
  },

  /**
   * Admin: Re-mint ownership token
   */
  async remintOwnership(orderId: string): Promise<void> {
    await httpClient.post('/ownership/admin/re-mint', { orderId });
  }
};
