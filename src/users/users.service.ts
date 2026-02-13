import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existingEmail = await this.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    const existingUsername = await this.findByUsername(dto.username);
    if (existingUsername) {
      throw new ConflictException('Username already in use');
    }

    const password_hash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password_hash,
        name: dto.name,
        phoneNumber: dto.phoneNumber,
      },
    });
  }

  async updateRefreshToken(userId: number, hashedToken: string | null): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refresh_token: hashedToken },
    });
  }
}
