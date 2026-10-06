import { Transform, type TransformFnParams } from 'class-transformer';

export function NormalizeEmail(): PropertyDecorator {
  return Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
}
