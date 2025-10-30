export interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaymentMetadata {
  orderId: string;
  artworkId: string;
  custom_fields?: Array<{
    display_name: string;
    variable_name: string;
    value: string;
  }>;
}

export interface PaystackCallbackResponse {
  reference: string;
  status: 'success' | 'failed';
  message?: string;
}
