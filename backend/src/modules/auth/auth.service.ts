import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@modules/users/users.service';
import { PrismaService } from '@common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      name: dto.name,
      role: dto.role ?? 'buyer',
      bio: dto.bio
    });
    return this.generateTokens(user.id, user.role);
  }

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    
    // SECURITY: Always check password even if user doesn't exist
    // This prevents timing attacks that could reveal valid emails
    const dummyHash = '$2b$10$dummyHashToPreventTimingAttacks1234567890123456789012';
    const userHash = user?.passwordHash || dummyHash;
    
    // Check if account is locked
    if (user?.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingMinutes = Math.ceil(
        (new Date(user.lockedUntil).getTime() - Date.now()) / 60000
      );
      throw new UnauthorizedException(
        `Account is locked due to too many failed login attempts. Try again in ${remainingMinutes} minutes.`
      );
    }

    // Always compare password (prevents user enumeration via timing)
    const passwordValid = await bcrypt.compare(pass, userHash);

    // If user doesn't exist or password invalid
    if (!user || !passwordValid) {
      // Track failed login attempt if user exists
      if (user) {
        await this.handleFailedLogin(user.id);
      }
      // Generic error message (prevents user enumeration)
      throw new UnauthorizedException('Invalid email or password');
    }

    // Successful login - reset failed attempts
    if (user.failedLoginAttempts > 0) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { 
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    }

    return user;
  }

  private async handleFailedLogin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { failedLoginAttempts: true },
    });

    const newAttempts = (user?.failedLoginAttempts || 0) + 1;
    const updateData: any = { failedLoginAttempts: newAttempts };

    // Lock account after max attempts
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  async login(email: string, password: string): Promise<TokenResponseDto> {
    const user = await this.validateUser(email, password);
    return this.generateTokens(user.id, user.role);
  }

  async refreshTokens(userId: string, role: string): Promise<TokenResponseDto> {
    return this.generateTokens(userId, role);
  }

  private generateTokens(userId: string, role: string): TokenResponseDto {
    const payload = { sub: userId, role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessTtl')
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshTtl')
    });
    return { accessToken, refreshToken };
  }
}
