import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export class CartCheckoutDto {
  @IsString()
  @IsEnum(['paystack', 'test'])
  paymentProvider: string;

  @IsOptional()
  @IsObject()
  shippingAddress?: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };

  @IsOptional()
  @IsString()
  shippingMethod?: string;
}