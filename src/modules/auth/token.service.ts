import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { AppEnv } from '../../config/env.schema.js';
import {
  accessTokenClaimsSchema,
  type AccessTokenClaims,
} from './schemas/access-token-claims.schema.js';

@Injectable()
export class TokenService {
  private readonly sessionTtlSeconds: number;

  constructor(
    private readonly jwtService: JwtService,
    config: ConfigService<AppEnv, true>,
  ) {
    this.sessionTtlSeconds = config.getOrThrow('AUTH_SESSION_TTL_SECONDS', {
      infer: true,
    });
  }

  signAccessToken(userId: string, sessionId: string): Promise<string> {
    return this.jwtService.signAsync({
      sub: userId,
      sid: sessionId,
    });
  }

  async verifyAccessToken(token: string): Promise<AccessTokenClaims | null> {
    let payload: unknown;

    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      return null;
    }

    const result = accessTokenClaimsSchema.safeParse(payload);

    if (!result.success) {
      return null;
    }

    if (result.data.iat > Math.floor(Date.now() / 1000)) {
      return null;
    }

    return result.data;
  }

  generateRefreshToken(): string {
    return randomBytes(32).toString('base64url');
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token, 'utf8').digest('hex');
  }

  getSessionExpiresAt(now: Date = new Date()): Date {
    return new Date(now.getTime() + this.sessionTtlSeconds * 1000);
  }
}
