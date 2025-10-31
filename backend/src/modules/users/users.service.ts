import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role,
        name: dto.name,
        bio: dto.bio,
        kycStatus: dto.kycStatus
      }
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ 
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        bio: true,
        kycStatus: true,
        createdAt: true,
        updatedAt: true,
        // Explicitly exclude sensitive fields
        // passwordHash: false,
        // failedLoginAttempts: false,
        // lockedUntil: false,
      }
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id);
    const data: Prisma.UserUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name;
    }
    if (dto.bio !== undefined) {
      data.bio = dto.bio;
    }
    if (dto.kycStatus !== undefined) {
      data.kycStatus = dto.kycStatus;
    }
    if (dto.role !== undefined) {
      data.role = dto.role as UserRole;
    }
    if (dto.password !== undefined) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({ where: { id }, data });
  }
}
