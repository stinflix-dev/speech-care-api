import {
  SkipThrottle,
  Throttle,
  type ThrottlerGetTrackerFunction,
  ThrottlerGuard,
} from '@nestjs/throttler';
import {
  applyDecorators,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import type { AuthRequest } from '../../modules/auth/types/auth.types.js';

export function ThrottleByUser() {
  const getTracker: ThrottlerGetTrackerFunction = (_req, context) => {
    const { user } = context.switchToHttp().getRequest<AuthRequest>();

    if (!user) {
      throw new InternalServerErrorException(
        'Не вдалося визначити поточного користувача.',
      );
    }

    return `user:${user.userId}`;
  };

  return applyDecorators(
    UseGuards(ThrottlerGuard),
    SkipThrottle({ default: true }),
    Throttle({
      short: { getTracker },
      long: { getTracker },
    }),
  );
}
