import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GuestCartItemDto {
  artworkId: string;
  purchaseOption?: {
    type?: 'physical' | 'digital';
    [key: string]: any;
  };
}

export class MigrateCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestCartItemDto)
  items: GuestCartItemDto[];
}