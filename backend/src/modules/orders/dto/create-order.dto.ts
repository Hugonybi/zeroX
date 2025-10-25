import { IsEnum, IsString } from 'class-validator';
import { PaymentProvider } from '../orders.types';

export class CreateOrderDto {
  @IsString()
  artworkId!: string;

  @IsEnum(PaymentProvider)
  paymentProvider!: PaymentProvider;
}
