import {
  applyDecorators,
  ClassSerializerInterceptor,
  SerializeOptions,
  UseInterceptors,
  type Type,
} from '@nestjs/common';

export function Serialize(dto: Type<object>) {
  return applyDecorators(
    UseInterceptors(ClassSerializerInterceptor),
    SerializeOptions({
      type: dto,
      excludeExtraneousValues: true,
    }),
  );
}
