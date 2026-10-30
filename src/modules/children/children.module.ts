import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Child } from './entities/child.entity.js';
import { ChildrenService } from './children.service.js';
import { ChildrenController } from './children.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Child])],
  providers: [ChildrenService],
  controllers: [ChildrenController],
})
export class ChildrenModule {}
