import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { KycStatus, UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsEnum(KycStatus)
  kycStatus?: KycStatus;
}
