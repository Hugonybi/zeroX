import { IsEnum, IsString, IsInt, Min, IsOptional, IsObject } from 'class-validator';
import { PaymentProvider } from '../orders.types';

export class ShippingAddressDto {
  @IsString()
  fullName!: string;

  @IsString()
  addressLine1!: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  postalCode!: string;

  @IsString()
  country!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateOrderDto {
  @IsString()
  artworkId!: string;

  @IsEnum(PaymentProvider)
  paymentProvider!: PaymentProvider;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsObject()
  shippingAddress?: ShippingAddressDto;

  @IsOptional()
  @IsString()
  shippingMethod?: string;
}
