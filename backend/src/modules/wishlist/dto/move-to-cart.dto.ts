import { IsBoolean, IsOptional } from 'class-validator';

export class MoveToCartDto {
  @IsOptional()
  @IsBoolean()
  removeFromWishlist?: boolean = true;
}