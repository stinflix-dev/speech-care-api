import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ChildResponseDto {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  birthday: string | null;

  @Expose()
  diagnosis: string | null;

  @Expose()
  speechDifficulties: string[];

  @Expose()
  speechDifficultiesDetails: string | null;

  @Expose()
  parentName: string | null;

  @Expose()
  parentPhone: string | null;

  @Expose()
  notes: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
