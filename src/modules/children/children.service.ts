import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  ArrayOverlap,
  type FindOptionsWhere,
  ILike,
  type Repository,
} from 'typeorm';
import { Child } from './entities/child.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import type { CreateChildDto } from './dtos/create-child.dto.js';
import type { ListChildrenQueryDto } from './dtos/list-children-query.dto.js';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectRepository(Child)
    private readonly childRepository: Repository<Child>,
  ) {}

  async create(data: CreateChildDto, userId: string) {
    const child = this.childRepository.create({
      user: { id: userId },
      firstName: data.firstName,
      lastName: data.lastName,
      birthday: data.birthday,
      diagnosis: data.diagnosis,
      speechDifficulties: [
        ...new Set([
          ...(data.speechDifficulties ?? []),
          ...(data.customSpeechDifficulties ?? []).map((value) => value.trim()),
        ]),
      ],
      speechDifficultiesDetails: data.speechDifficultiesDetails,
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      notes: data.notes,
    });

    try {
      return await this.childRepository.save(child);
    } catch {
      throw new InternalServerErrorException(
        'Не вдалося створити профіль дитини. Спробуйте пізніше.',
      );
    }
  }

  async findAllByUser(userId: string, query: ListChildrenQueryDto) {
    const { page, limit, sortBy, sortOrder, speechDifficulties, search } =
      query;

    const searchPattern = search && `${search.replace(/[\\%_]/g, '\\$&')}%`;

    const baseWhere: FindOptionsWhere<Child> = {
      user: { id: userId },
      ...(speechDifficulties?.length && {
        speechDifficulties: ArrayOverlap(speechDifficulties),
      }),
    };

    const where: FindOptionsWhere<Child> | FindOptionsWhere<Child>[] =
      searchPattern
        ? ['firstName', 'lastName'].map((field) => ({
            ...baseWhere,
            [field]: ILike(searchPattern),
          }))
        : baseWhere;

    const [items, total] = await this.childRepository.findAndCount({
      where,
      order: { [sortBy]: sortOrder, id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
