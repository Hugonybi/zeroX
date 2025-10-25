import { ArtworkStatus, ArtworkType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

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
}
