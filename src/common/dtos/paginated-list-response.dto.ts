import {
  Exclude,
  Expose,
  Type,
  type ClassConstructor,
} from 'class-transformer';

@Exclude()
export class PaginationMetaDto {
  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  total: number;

  @Expose()
  totalPages: number;
}

export function PaginationListResponseDto<T>(ItemDto: ClassConstructor<T>) {
  @Exclude()
  class PaginatedResponse {
    @Expose()
    @Type(() => ItemDto)
    items: T[];

    @Expose()
    @Type(() => PaginationMetaDto)
    meta: PaginationMetaDto;
  }

  return PaginatedResponse;
}
