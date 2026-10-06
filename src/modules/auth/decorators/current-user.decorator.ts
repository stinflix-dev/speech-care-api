import {
  createParamDecorator,
  InternalServerErrorException,
  type ExecutionContext,
} from '@nestjs/common';
import type { AuthContext, AuthRequest } from '../types/auth.types.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthContext => {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    if (!request.user) {
      throw new InternalServerErrorException(
        'Не вдалося визначити поточного користувача.',
      );
    }

    return request.user;
  },
);
