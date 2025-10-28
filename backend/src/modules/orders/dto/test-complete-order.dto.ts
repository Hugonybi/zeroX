import { IsUUID } from 'class-validator';

export class TestCompleteOrderDto {
  @IsUUID()
  orderId: string;
}
