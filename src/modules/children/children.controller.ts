import { Body, Controller, Header, Post } from '@nestjs/common';
import { CreateChildDto } from './dtos/create-child.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthContext } from '../auth/types/auth.types.js';
import { ChildrenService } from './children.service.js';
import { Serialize } from '../../common/decorators/serialize.decorator.js';
import { ChildResponseDto } from './dtos/child-response.dto.js';

@Controller('children')
@Serialize(ChildResponseDto)
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  create(
    @Body() body: CreateChildDto,
    @CurrentUser() currentUser: AuthContext,
  ): Promise<ChildResponseDto> {
    return this.childrenService.create(body, currentUser.userId);
  }
}
