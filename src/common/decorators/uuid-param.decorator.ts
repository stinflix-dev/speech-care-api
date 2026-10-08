import { BadRequestException, Param, ParseUUIDPipe } from '@nestjs/common';

export function UuidParam(name: string): ParameterDecorator {
  return Param(
    name,
    new ParseUUIDPipe({
      exceptionFactory: () =>
        new BadRequestException(`Параметр "${name}" має бути коректним UUID`),
    }),
  );
}
