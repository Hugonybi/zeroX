import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';
import { IsStrongPassword } from '@common/decorators/is-strong-password.decorator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @IsStrongPassword()
  password!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
