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

// Cart checkout types
export interface CartCheckoutRequest {
  paymentProvider: PaymentProvider;
  shippingAddress?: ShippingAddress;
  shippingMethod?: string;
}

export interface CartCheckoutResponse {
  orders: Order[];
  sessionId: string;
  payment?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
  totalAmount: number;
  currency: string;
}

export interface ConsolidatedOrderStatus {
  sessionId: string;
  orders: OrderWithStatus[];
  totalOrders: number;
  successfulOrders: number;
  failedOrders: number;
  overallStatus: 'processing' | 'completed' | 'partial_failure' | 'failed';
  createdAt: string;
}

export interface OrderWithStatus extends Order {
  artwork?: {
    id: string;
    title: string;
    artistName: string;
    mediaUrl: string;
    type: string;
  };
  error?: string;
}
