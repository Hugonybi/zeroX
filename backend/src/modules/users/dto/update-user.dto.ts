import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { KycStatus, UserRole } from '@prisma/client';

export class UpdateUserDto {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	bio?: string;

	@IsOptional()
	@IsEnum(UserRole)
	role?: UserRole;

	@IsOptional()
	@IsEnum(KycStatus)
	kycStatus?: KycStatus;

	@IsOptional()
	@IsString()
	@MinLength(8)
	password?: string;
}
