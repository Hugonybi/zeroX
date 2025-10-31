import { IsString, IsOptional } from 'class-validator';

/**
 * Accept either a simple string purchase option ('physical' | 'digital')
 * or an object with additional option details. The frontend sends a
 * string in most places, so relax the strict object-only validation.
 */
export class AddToCartDto {
  @IsString()
  artworkId: string;

  // Allow either 'physical' | 'digital' or an object with a `type` field.
  @IsOptional()
  purchaseOption?: 'physical' | 'digital' | { type?: 'physical' | 'digital'; [key: string]: any };
}