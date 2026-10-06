import { randomBytes } from 'node:crypto';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
  type OnModuleInit,
} from '@nestjs/common';
import { DataSource, QueryFailedError, type EntityManager } from 'typeorm';
import { isRecord } from '../../common/utils/isRecord.js';
import { UsersService } from '../users/users.service.js';
import type { LoginDto } from './dtos/login.dto.js';
import type { RefreshTokenDto } from './dtos/refresh-token.dto.js';
import type { RegisterDto } from './dtos/register.dto.js';
import { AuthRefreshToken } from './entities/auth-refresh-token.entity.js';
import { AuthSession } from './entities/auth-session.entity.js';
import { PasswordService } from './password.service.js';
import { TokenService } from './token.service.js';
import type { AuthCredentials } from './types/auth.types.js';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private dummyPasswordHash: string;

  constructor(
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.dummyPasswordHash = await this.passwordService.hash(
      randomBytes(32).toString('hex'),
    );
  }

  async register(dto: RegisterDto): Promise<AuthCredentials> {
    try {
      const passwordHash = await this.passwordService.hash(dto.password);

      return await this.dataSource.transaction(
        'READ COMMITTED',
        async (manager) => {
          const user = await this.usersService.create(
            {
              email: dto.email,
              passwordHash,
              firstName: dto.firstName,
              lastName: dto.lastName,
              avatarUrl: null,
              birthday: dto.birthday ?? null,
            },
            manager,
          );

          return this.createSession(manager, user.id);
        },
      );
    } catch (error) {
      return this.throwAuthOperationError(error, 'auth.register');
    }
  }

  async login(dto: LoginDto): Promise<AuthCredentials> {
    try {
      const user = await this.usersService.findByEmailForAuthentication(
        dto.email,
      );

      const passwordMatches = await this.passwordService.verify(
        user?.passwordHash ?? this.dummyPasswordHash,
        dto.password,
      );

      if (!user || !passwordMatches) {
        throw new UnauthorizedException(
          'Неправильна електронна пошта або пароль',
        );
      }

      return await this.dataSource.transaction('READ COMMITTED', (manager) =>
        this.createSession(manager, user.id),
      );
    } catch (error) {
      return this.throwAuthOperationError(error, 'auth.login');
    }
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthCredentials> {
    try {
      const tokenHash = this.tokenService.hashRefreshToken(dto.refreshToken);

      const credentials = await this.dataSource.transaction(
        'READ COMMITTED',
        async (manager): Promise<AuthCredentials | null> => {
          const session = await this.lockSessionByRefreshToken(
            manager,
            tokenHash,
          );

          if (!session) {
            return null;
          }

          const now = new Date();

          if (
            session.revokedAt !== null ||
            session.expiresAt.getTime() <= now.getTime()
          ) {
            return null;
          }

          // Read consumption state only after acquiring the session lock.
          const refreshToken = await manager.findOne(AuthRefreshToken, {
            select: {
              id: true,
              usedAt: true,
            },
            where: {
              tokenHash,
              sessionId: session.id,
            },
          });

          if (!refreshToken) {
            return null;
          }

          if (refreshToken.usedAt !== null) {
            await manager.update(AuthSession, session.id, {
              revokedAt: now,
            });

            // Return normally so revocation commits before the 401 below.
            return null;
          }

          await manager.update(AuthRefreshToken, refreshToken.id, {
            usedAt: now,
          });

          return this.issueCredentials(manager, session);
        },
      );

      if (!credentials) {
        throw new UnauthorizedException(
          'Сесія недійсна або завершилася. Увійдіть знову.',
        );
      }

      return credentials;
    } catch (error) {
      return this.throwAuthOperationError(error, 'auth.refresh');
    }
  }

  async logout(dto: RefreshTokenDto): Promise<void> {
    try {
      const tokenHash = this.tokenService.hashRefreshToken(dto.refreshToken);

      await this.dataSource.transaction('READ COMMITTED', async (manager) => {
        const session = await this.lockSessionByRefreshToken(
          manager,
          tokenHash,
        );

        if (!session || session.revokedAt !== null) {
          return;
        }

        await manager.update(AuthSession, session.id, {
          revokedAt: new Date(),
        });
      });
    } catch (error) {
      this.throwAuthOperationError(error, 'auth.logout');
    }
  }

  private async createSession(
    manager: EntityManager,
    userId: string,
  ): Promise<AuthCredentials> {
    const session = manager.create(AuthSession, {
      userId,
      expiresAt: this.tokenService.getSessionExpiresAt(),
      revokedAt: null,
    });

    await manager.save(session);

    return this.issueCredentials(manager, session);
  }

  private async issueCredentials(
    manager: EntityManager,
    session: AuthSession,
  ): Promise<AuthCredentials> {
    const refreshToken = this.tokenService.generateRefreshToken();
    const tokenHash = this.tokenService.hashRefreshToken(refreshToken);

    await manager.insert(AuthRefreshToken, {
      sessionId: session.id,
      tokenHash,
      usedAt: null,
    });

    const accessToken = await this.tokenService.signAccessToken(
      session.userId,
      session.id,
    );

    return {
      accessToken,
      refreshToken,
      sessionExpiresAt: session.expiresAt,
    };
  }

  private async lockSessionByRefreshToken(
    manager: EntityManager,
    tokenHash: string,
  ): Promise<AuthSession | null> {
    const refreshToken = await manager.findOne(AuthRefreshToken, {
      select: {
        sessionId: true,
      },
      where: {
        tokenHash,
      },
    });

    if (!refreshToken) {
      return null;
    }

    return manager.findOne(AuthSession, {
      where: {
        id: refreshToken.sessionId,
      },
      lock: {
        mode: 'pessimistic_write',
      },
    });
  }

  private throwAuthOperationError(error: unknown, operation: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    const driverError =
      error instanceof QueryFailedError && isRecord(error.driverError)
        ? error.driverError
        : undefined;

    this.logger.error({
      message: 'Authentication operation failed',
      operation,
      errorType: error instanceof Error ? error.name : 'UnknownThrownValue',
      errorCode:
        typeof driverError?.code === 'string' ? driverError.code : undefined,
    });

    throw new InternalServerErrorException(
      'Не вдалося виконати операцію автентифікації. Спробуйте пізніше.',
    );
  }
}
