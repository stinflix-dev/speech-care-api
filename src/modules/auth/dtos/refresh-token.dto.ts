import { IsString, Matches } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: 'Refresh-токен має бути рядком' })
  @Matches(/^[A-Za-z0-9_-]{43}$/, {
    message: 'Некоректний формат refresh-токена',
  })
  refreshToken: string;
}
