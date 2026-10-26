import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './public.decorator';
import type { FastifyRequest } from 'fastify';
import { COOKIE_NAME, ERROR_AUTHENTICATION_MESSAGE } from './auth.constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & { userId?: string }>();

    const token = request.cookies[COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedException(ERROR_AUTHENTICATION_MESSAGE);
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      request.userId = payload.sub;
    } catch {
      throw new UnauthorizedException(ERROR_AUTHENTICATION_MESSAGE);
    }

    return true;
  }
}
