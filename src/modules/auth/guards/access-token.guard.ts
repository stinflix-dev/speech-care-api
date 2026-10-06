import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import type { Response } from 'express';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { Public } from '../decorators/public.decorator.js';
import { AuthSession } from '../entities/auth-session.entity.js';
import { TokenService } from '../token.service.js';
import type { AuthRequest } from '../types/auth.types.js';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  private readonly logger = new Logger(AccessTokenGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
    @InjectRepository(AuthSession)
    private readonly sessionsRepository: Repository<AuthSession>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride(Public, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const http = context.switchToHttp();
    const request = http.getRequest<AuthRequest>();
    const response = http.getResponse<Response>();

    const authorization = request.headers.authorization;
    const match = authorization?.match(/^Bearer +(\S+)$/i);
    const token = match?.[1];

    if (!token) {
      this.rejectUnauthorized(response);
    }

    const claims = await this.tokenService.verifyAccessToken(token);

    if (!claims) {
      this.rejectUnauthorized(response);
    }

    let sessionExists: boolean;

    try {
      sessionExists = await this.sessionsRepository.existsBy({
        id: claims.sid,
        userId: claims.sub,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      });
    } catch (error) {
      this.logger.error({
        message: 'Failed to check authentication session',
        operation: 'auth.checkSession',
        errorType: error instanceof Error ? error.name : 'UnknownThrownValue',
      });

      throw new ServiceUnavailableException(
        'Тимчасово не вдалося перевірити сесію. Спробуйте пізніше.',
      );
    }

    if (!sessionExists) {
      this.rejectUnauthorized(response);
    }

    request.user = {
      userId: claims.sub,
      sessionId: claims.sid,
    };

    return true;
  }

  private rejectUnauthorized(response: Response): never {
    response.setHeader('WWW-Authenticate', 'Bearer');

    throw new UnauthorizedException('Потрібна автентифікація. Увійдіть знову.');
  }
}
