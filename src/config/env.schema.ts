import { z } from 'zod';

const requiredStringSchema = z
  .string()
  .regex(/\S/, 'Must contain a non-whitespace character');

const portSchema = z
  .string()
  .regex(/^[0-9]+$/, 'Must contain only digits')
  .transform(Number)
  .pipe(z.number().int().min(1).max(65535));

export const databaseEnvSchema = z.object({
  DB_HOST: requiredStringSchema,
  DB_PORT: portSchema,
  DB_NAME: requiredStringSchema,
  DB_USER: requiredStringSchema,
  DB_PASSWORD: requiredStringSchema,
});

export const appEnvSchema = databaseEnvSchema.extend({
  PORT: portSchema,
});

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
