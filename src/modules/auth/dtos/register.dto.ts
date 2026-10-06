import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { NormalizeEmail } from '../../../common/decorators/normalize-email.decorator.js';
import { Trim } from '../../../common/decorators/trim.decorator.js';

export class RegisterDto {
  @NormalizeEmail()
  @IsEmail({}, { message: 'Вкажіть коректну електронну пошту' })
  email: string;

  @IsString({ message: 'Пароль має бути рядком' })
  @Length(8, 64, {
    message: 'Пароль має містити від 8 до 64 символів',
  })
  password: string;

  @Trim()
  @IsString({ message: 'Ім’я має бути рядком' })
  @Length(1, 100, {
    message: 'Ім’я має містити від 1 до 100 символів',
  })
  firstName: string;

  @Trim()
  @IsString({ message: 'Прізвище має бути рядком' })
  @Length(1, 100, {
    message: 'Прізвище має містити від 1 до 100 символів',
  })
  lastName: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Дата народження має бути у форматі YYYY-MM-DD',
  })
  @IsDateString(
    { strict: true },
    { message: 'Вкажіть коректну дату народження' },
  )
  birthday?: string | null;
}
