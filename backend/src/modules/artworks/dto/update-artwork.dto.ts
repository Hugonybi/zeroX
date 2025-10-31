import { ArtworkStatus, ArtworkType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateArtworkDto {
	@IsOptional()
	@IsString()
	@MinLength(1)
	title?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsEnum(ArtworkType)
	type?: ArtworkType;

	@IsOptional()
	@IsString()
	mediaUrl?: string;

	@IsOptional()
	@IsString()
	metadataUrl?: string;

	// Artist-defined identifiers (independent of Hedera NFT serials)
	@IsOptional()
	@IsString()
	serialNumber?: string; // Artist's catalog number (e.g., "ART-2024-001", "Limited Edition 5/10")

	@IsOptional()
	@IsInt()
	@Min(1)
	edition?: number; // Edition number if part of series (e.g., 5 means "Edition 5 of X")

	@IsOptional()
	@IsInt()
	@Min(1)
	priceCents?: number;

	@IsOptional()
	@IsString()
	currency?: string;

	@IsOptional()
	@IsEnum(ArtworkStatus)
	status?: ArtworkStatus;
}
