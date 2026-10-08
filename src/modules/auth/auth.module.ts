import { createSecretKey } from 'node:crypto';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import type { AppEnv } from '../../config/env.schema.js';
import { PasswordService } from './password.service.js';
import { TokenService } from './token.service.js';
import { UsersModule } from '../users/users.module.js';
import { AuthService } from './auth.service.js';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthSession } from './entities/auth-session.entity.js';
import { AccessTokenGuard } from './guards/access-token.guard.js';
import { AuthController } from './auth.controller.js';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([AuthSession]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppEnv, true>): JwtModuleOptions => {
        const secretHex = config.getOrThrow('JWT_ACCESS_SECRET_HEX', {
          infer: true,
        });
        const algorithm = config.getOrThrow('JWT_ACCESS_ALGORITHM', {
          infer: true,
        });
        const issuer = config.getOrThrow('JWT_ACCESS_ISSUER', { infer: true });
        const audience = config.getOrThrow('JWT_ACCESS_AUDIENCE', {
          infer: true,
        });
        const accessTtlSeconds = config.getOrThrow('JWT_ACCESS_TTL_SECONDS', {
          infer: true,
        });

        return {
          secret: createSecretKey(Buffer.from(secretHex, 'hex')),
          signOptions: {
            algorithm,
            issuer,
            audience,
            expiresIn: accessTtlSeconds,
          },
          verifyOptions: {
            algorithms: [algorithm],
            issuer,
            audience,
            maxAge: accessTtlSeconds,
            clockTolerance: 0,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    PasswordService,
    TokenService,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AuthModule {}
