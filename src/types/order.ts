export type OrderStatus = 'created' | 'processing' | 'fulfilled' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentProvider = 'paystack' | 'test';

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

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
  
  // Enhanced fields
  quantity?: number;
  unitPriceCents?: number;
  shippingCents?: number;
  taxCents?: number;
  totalCents?: number;
  shippingAddress?: ShippingAddress;
  shippingMethod?: string;
  trackingNumber?: string;
}

export interface CheckoutRequest {
  artworkId: string;
  paymentProvider: PaymentProvider;
  quantity?: number;
  shippingAddress?: ShippingAddress;
  shippingMethod?: string;
}

export interface CheckoutResponse {
  order: Order;
  payment?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}
