import { ArtworkStatus, ArtworkType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min, MinLength, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class CreateArtworkDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  description!: string;

  @IsEnum(ArtworkType)
  type!: ArtworkType;

  @IsString()
  mediaUrl!: string;

  @IsOptional()
  @IsString()
  metadataUrl?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  edition?: number;

  @IsInt()
  @Min(1)
  priceCents!: number;

  @IsString()
  currency!: string;

  @IsOptional()
  @IsEnum(ArtworkStatus)
  status?: ArtworkStatus;

  // Enhanced fields for MVP
  @IsOptional()
  @IsString()
  medium?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsInt()
  @Min(1000)
  yearCreated?: number;

  @IsOptional()
  @IsNumber()
  dimensionHeight?: number;

  @IsOptional()
  @IsNumber()
  dimensionWidth?: number;

  @IsOptional()
  @IsNumber()
  dimensionDepth?: number;

  @IsOptional()
  @IsString()
  dimensionUnit?: string;

  @IsOptional()
  @IsBoolean()
  isUnique?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalQuantity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  availableQuantity?: number;
}
