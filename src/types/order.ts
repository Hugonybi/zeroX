export type OrderStatus = 'created' | 'processing' | 'fulfilled' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentProvider = 'paystack' | 'test';

export interface Order {
  id: string;
  buyerId: string;
  artworkId: string;
  amountCents: number;
  currency: string;
  paymentProvider: PaymentProvider;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  reference: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutRequest {
  artworkId: string;
  paymentProvider: PaymentProvider;
}

export interface CheckoutResponse {
  order: Order;
  payment?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}
