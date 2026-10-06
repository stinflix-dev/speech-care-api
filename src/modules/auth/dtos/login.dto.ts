import { IsEmail, IsString, Length } from 'class-validator';
import { NormalizeEmail } from '../../../common/decorators/normalize-email.decorator.js';

export class LoginDto {
  @NormalizeEmail()
  @IsEmail({}, { message: 'Вкажіть коректну електронну пошту' })
  email: string;

  @IsString({ message: 'Пароль має бути рядком' })
  @Length(8, 64, {
    message: 'Пароль має містити від 8 до 64 символів',
  })
  password: string;
}
