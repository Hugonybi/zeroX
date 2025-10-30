import { createHttpClient } from './http';
import { API_BASE_URL } from '../config/api';
import type { CheckoutRequest, CheckoutResponse, Order } from '../types/order';

const httpClient = createHttpClient(API_BASE_URL);

export const orderService = {
  /**
   * Create a checkout session for an artwork
   */
  async createCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
    return httpClient.post<CheckoutResponse>('/checkout', request);
  },

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order> {
    return httpClient.get<Order>(`/orders/${orderId}`);
  },

  /**
   * Get all orders for the current buyer
   */
  async getOrdersByBuyer(): Promise<Order[]> {
    return httpClient.get<Order[]>('/orders/buyer/me');
  },

  /**
   * Test endpoint: Complete order without payment (development only)
   */
  async testCompleteOrder(orderId: string): Promise<{ success: boolean; message: string; orderId: string }> {
    return httpClient.post('/test/complete-order', { orderId });
  },
};
