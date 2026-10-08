import { Controller, Get, Header, NotFoundException } from '@nestjs/common';
import { Serialize } from '../../common/decorators/serialize.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthContext } from '../auth/types/auth.types.js';
import { UserResponseDto } from './dtos/user-response.dto.js';
import { UsersService } from './users.service.js';
import { UuidParam } from '../../common/decorators/uuid-param.decorator.js';

@Controller('users')
@Serialize(UserResponseDto)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @Header('Cache-Control', 'no-store')
  async me(@CurrentUser() currentUser: AuthContext): Promise<UserResponseDto> {
    const user = await this.usersService.findById(currentUser.userId);

    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    return user;
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async findById(@UuidParam('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    return user;
  }
}
