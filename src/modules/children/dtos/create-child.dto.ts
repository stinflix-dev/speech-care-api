import { Trim } from '../../../common/decorators/trim.decorator.js';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { SPEECH_DIFFICULTIES } from '../constants/speech-difficulties.js';
import { IsNotFutureDate } from '../../../common/decorators/is-not-future-date.decorator.js';

export class CreateChildDto {
  @Trim()
  @IsString({ message: 'Ім’я має бути рядком' })
  @Length(1, 100, {
    message: 'Ім’я має містити від 1 до 100 символів',
  })
  firstName: string;

  @Trim()
  @IsString({ message: 'Прізвище має бути рядком' })
  @Length(1, 100, {
    message: 'Прізвище має містити від 1 до 100 символів',
  })
  lastName: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Дата народження має бути у форматі YYYY-MM-DD',
  })
  @IsDateString(
    { strict: true },
    { message: 'Вкажіть коректну дату народження' },
  )
  @IsNotFutureDate()
  birthday?: string | null;

  @IsOptional()
  @IsString({ message: 'Діагноз має бути рядком' })
  @MaxLength(2000, {
    message: 'Діагноз не може перевищувати 2000 символів',
  })
  diagnosis?: string | null;

  @ValidateIf((_, value) => value !== undefined)
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @IsIn(SPEECH_DIFFICULTIES.map(({ value }) => value), {
    each: true,
    message: 'Невідоме мовленнєве порушення',
  })
  speechDifficulties?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  @Matches(/\S/u, {
    each: true,
    message: 'Назва порушення не може бути порожньою',
  })
  customSpeechDifficulties?: string[];

  @IsOptional()
  @IsString({ message: 'Опис мовленнєвих труднощів має бути рядком' })
  @MaxLength(5000, {
    message: 'Опис труднощів не може перевищувати 5000 символів',
  })
  speechDifficultiesDetails?: string | null;

  @IsOptional()
  @Trim()
  @IsString({ message: 'Ім’я має бути рядком' })
  @Length(1, 100, {
    message: 'Ім’я має містити від 1 до 100 символів',
  })
  parentName?: string | null;

  @IsOptional()
  @IsString()
  @IsPhoneNumber('UA', { message: 'Вкажіть коректний номер телефону' })
  @MaxLength(13)
  parentPhone?: string | null;

  @IsOptional()
  @IsString({ message: 'Замітки мають бути рядком' })
  @MaxLength(10000, {
    message: 'Нотатки не можуть перевищувати 10000 символів',
  })
  notes?: string | null;
}
