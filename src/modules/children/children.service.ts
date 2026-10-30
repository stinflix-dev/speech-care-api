import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { Child } from './entities/child.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import type { CreateChildDto } from './dtos/create-child.dto.js';

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
}
