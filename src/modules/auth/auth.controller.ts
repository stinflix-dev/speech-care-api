import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Serialize } from '../../common/decorators/serialize.decorator.js';
import { AuthService } from './auth.service.js';
import { Public } from './decorators/public.decorator.js';
import { AuthResponseDto } from './dtos/auth-response.dto.js';
import { LoginDto } from './dtos/login.dto.js';
import { RefreshTokenDto } from './dtos/refresh-token.dto.js';
import { RegisterDto } from './dtos/register.dto.js';
import { SkipThrottle, Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
@UseGuards(ThrottlerGuard)
@SkipThrottle({ short: true, long: true })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Serialize(AuthResponseDto)
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Serialize(AuthResponseDto)
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Serialize(AuthResponseDto)
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refresh(dto);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Body() dto: RefreshTokenDto): Promise<void> {
    return this.authService.logout(dto);
  }
}
