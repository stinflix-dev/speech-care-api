import {
  ConflictException,
  InternalServerErrorException,
  type Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { isRecord } from '../../../common/utils/isRecord.js';

const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';
const USERS_EMAIL_UNIQUE_CONSTRAINT = 'UQ_users_email';

export function throwUserCreationError(error: unknown, logger: Logger): never {
  const driverError =
    error instanceof QueryFailedError && isRecord(error.driverError)
      ? error.driverError
      : undefined;

  const code =
    typeof driverError?.code === 'string' ? driverError.code : undefined;

  const constraint =
    typeof driverError?.constraint === 'string'
      ? driverError.constraint
      : undefined;

  if (
    code === POSTGRES_UNIQUE_VIOLATION_CODE &&
    constraint === USERS_EMAIL_UNIQUE_CONSTRAINT
  ) {
    throw new ConflictException('Ця електронна пошта вже зареєстрована');
  }

  logger.error({
    message: 'Failed to create user',
    operation: 'users.create',
    errorType: error instanceof Error ? error.name : 'UnknownThrownValue',
    errorCode: code,
    constraint,
  });

  throw new InternalServerErrorException(
    'Не вдалося створити користувача. Спробуйте пізніше.',
  );
}
