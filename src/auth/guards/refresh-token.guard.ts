import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Request } from 'express';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const { refresh_token } = request.body as { refresh_token?: string };

    if (!refresh_token) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync(refresh_token, {
        secret: process.env['JWT_REFRESH_SECRET'],
      });
      request['user'] = { ...payload, refresh_token };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return true;
  }
}
