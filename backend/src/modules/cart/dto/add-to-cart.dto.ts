import { IsString, IsOptional, IsObject } from 'class-validator';

export class AddToCartDto {
  @IsString()
  artworkId: string;

  @IsOptional()
  @IsObject()
  purchaseOption?: {
    type?: 'physical' | 'digital';
    [key: string]: any;
  };
}