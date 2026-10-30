import { ValidateBy } from 'class-validator';

export function IsNotFutureDate() {
  return ValidateBy({
    name: 'isNotFutureDate',
    validator: {
      validate(value: unknown): boolean {
        if (typeof value !== 'string') return false;

        const today = new Intl.DateTimeFormat('sv-SE', {
          timeZone: 'Europe/Kyiv',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date());

        return value <= today;
      },
      defaultMessage: () => 'Дата не може бути в майбутньому',
    },
  });
}
