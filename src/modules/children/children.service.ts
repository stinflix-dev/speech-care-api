import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
import type { ChildResponseDto } from './dtos/child-response.dto.js';
import type { UpdateChildDto } from './dtos/update-child.dto.js';

@Injectable()
export class ChildrenService {
  private readonly logger = new Logger(ChildrenService.name);

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

  async getByIdForUser(id: string, userId: string) {
    const child = await this.childRepository.findOneBy({
      id,
      user: { id: userId },
    });

    if (!child) {
      throw new NotFoundException('Дитину не знайдено');
    }

    return child;
  }

  async updateByIdForUser(
    id: string,
    userId: string,
    data: UpdateChildDto,
  ): Promise<ChildResponseDto> {
    const { speechDifficulties, customSpeechDifficulties } = data;

    if (
      (speechDifficulties === undefined) !==
      (customSpeechDifficulties === undefined)
    ) {
      throw new BadRequestException(
        'Передайте стандартні та власні мовленнєві порушення разом.',
      );
    }

    const changes = {
      firstName: data.firstName,
      lastName: data.lastName,
      birthday: data.birthday,
      diagnosis: data.diagnosis,
      speechDifficulties:
        speechDifficulties !== undefined &&
        customSpeechDifficulties !== undefined
          ? [
              ...new Set([
                ...speechDifficulties,
                ...customSpeechDifficulties.map((value) => value.trim()),
              ]),
            ]
          : undefined,
      speechDifficultiesDetails: data.speechDifficultiesDetails,
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      notes: data.notes,
    };

    if (Object.values(changes).every((value) => value === undefined)) {
      throw new BadRequestException(
        'Передайте хоча б одне поле для оновлення.',
      );
    }

    let child: Child | null = null;

    try {
      const result = await this.childRepository.update(
        { id, user: { id: userId } },
        changes,
      );

      if (result.affected === 1) {
        child = await this.childRepository.findOneBy({
          id,
          user: { id: userId },
        });
      }
    } catch (error) {
      this.logger.error({
        operation: 'children.update',
        errorType: error instanceof Error ? error.name : 'UnknownThrownValue',
      });

      throw new InternalServerErrorException(
        'Не вдалося завершити оновлення профілю дитини. Спробуйте пізніше.',
      );
    }

    if (!child) {
      throw new NotFoundException('Дитину не знайдено');
    }

    return child;
  }
}
