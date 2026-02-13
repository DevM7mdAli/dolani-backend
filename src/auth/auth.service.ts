import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';

interface JwtPayload {
  sub: number;
  email: string;
  username: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    username: string;
    name: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(identifier: string, password: string) {
    let user = await this.usersService.findByEmail(identifier);
    if (!user) {
      user = await this.usersService.findByUsername(identifier);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: {
    id: number;
    email: string;
    username: string;
    name: string;
    role: string;
  }): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env['JWT_SECRET'],
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env['JWT_REFRESH_SECRET'],
        expiresIn: '7d',
      }),
    ]);

    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refreshTokens(userId: number, refreshToken: string): Promise<AuthResponse> {
    const user = await this.usersService.findById(userId);

    if (!user.refresh_token) {
      throw new ForbiddenException('Access denied — no active session');
    }

    const tokenMatches = await bcrypt.compare(refreshToken, user.refresh_token);
    if (!tokenMatches) {
      throw new ForbiddenException('Access denied — invalid refresh token');
    }

    return this.login(user);
  }

  async logout(userId: number): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }
}
