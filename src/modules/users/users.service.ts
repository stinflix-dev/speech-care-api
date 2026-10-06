import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type EntityManager, Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import type { CreateUserData } from './types/users.types.js';
import { throwUserCreationError } from './errors/user-creation.error.js';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: {
        createdAt: 'ASC',
        id: 'ASC',
      },
    });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findByEmailForAuthentication(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', {
        email: this.normalizeEmail(email),
      })
      .getOne();
  }

  async create(
    data: CreateUserData,
    manager: EntityManager = this.usersRepository.manager,
  ): Promise<User> {
    const usersRepository = manager.getRepository(User);

    const user = usersRepository.create({
      email: this.normalizeEmail(data.email),
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      avatarUrl: data.avatarUrl ?? null,
      birthday: data.birthday ?? null,
    });

    try {
      return await usersRepository.save(user);
    } catch (error) {
      return throwUserCreationError(error, this.logger);
    }
  }
}
