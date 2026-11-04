import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  applyDecorators,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import type { AuthRequest } from '../../modules/auth/types/auth.types.js';

export function ThrottleByUser() {
  return applyDecorators(
    UseGuards(ThrottlerGuard),
    Throttle({
      default: {
        limit: 120,
        ttl: 60_000,
        blockDuration: 5_000,
        getTracker: (_req, context) => {
          const { user } = context.switchToHttp().getRequest<AuthRequest>();

          if (!user) {
            throw new InternalServerErrorException(
              'Не вдалося визначити поточного користувача.',
            );
          }

          return user.userId;
        },
      },
    }),
  );
}
