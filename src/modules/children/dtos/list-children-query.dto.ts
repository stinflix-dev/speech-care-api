import { ListQueryDto } from '../../../common/dtos/list-query.dto.js';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class ListChildrenQueryDto extends ListQueryDto {
  @IsIn(['createdAt', 'firstName', 'birthday'])
  sortBy: 'createdAt' | 'firstName' | 'birthday' = 'createdAt';

  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsArray()
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  speechDifficulties?: string[];
}
