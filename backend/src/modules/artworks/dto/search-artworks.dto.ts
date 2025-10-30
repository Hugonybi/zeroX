import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ArtworkType } from '@prisma/client';

export class SearchArtworksDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsEnum(ArtworkType)
  type?: ArtworkType;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  artistId?: string;

  @IsOptional()
  @IsEnum(['price_asc', 'price_desc', 'date_desc', 'date_asc', 'title_asc'])
  sortBy?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc' | 'title_asc';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}
