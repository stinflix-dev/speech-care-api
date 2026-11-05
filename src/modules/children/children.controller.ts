import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateChildDto } from './dtos/create-child.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthContext } from '../auth/types/auth.types.js';
import { ChildrenService } from './children.service.js';
import { Serialize } from '../../common/decorators/serialize.decorator.js';
import { ChildResponseDto } from './dtos/child-response.dto.js';
import { ListChildrenQueryDto } from './dtos/list-children-query.dto.js';
import { PaginationListResponseDto } from '../../common/dtos/paginated-list-response.dto.js';
import { ThrottleByUser } from '../../common/decorators/throttle-by-user.decorator.js';

@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Post()
  @Serialize(ChildResponseDto)
  create(
    @Body() body: CreateChildDto,
    @CurrentUser() currentUser: AuthContext,
  ): Promise<ChildResponseDto> {
    return this.childrenService.create(body, currentUser.userId);
  }

  @Get()
  @Serialize(PaginationListResponseDto(ChildResponseDto))
  @ThrottleByUser()
  findAll(
    @Query() query: ListChildrenQueryDto,
    @CurrentUser() currentUser: AuthContext,
  ) {
    return this.childrenService.findAllByUser(currentUser.userId, query);
  }
}
