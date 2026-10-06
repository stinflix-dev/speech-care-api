import { z } from 'zod';

const requiredStringSchema = z
  .string()
  .regex(/\S/, 'Must contain a non-whitespace character');

const portSchema = z
  .string()
  .regex(/^[0-9]+$/, 'Must contain only digits')
  .transform(Number)
  .pipe(z.number().int().min(1).max(65535));

const secondsSchema = z
  .string()
  .regex(/^[1-9][0-9]*$/, 'Must contain a positive integer in seconds')
  .transform(Number);

const jwtIdentifierSchema = z
  .string()
  .regex(/^\S+$/, 'Must be a non-empty identifier without whitespace');

export const databaseEnvSchema = z.object({
  DB_HOST: requiredStringSchema,
  DB_PORT: portSchema,
  DB_NAME: requiredStringSchema,
  DB_USER: requiredStringSchema,
  DB_PASSWORD: requiredStringSchema,
});

export const appEnvSchema = databaseEnvSchema.extend({
  PORT: portSchema,

  JWT_ACCESS_SECRET_HEX: z
    .string()
    .regex(
      /^[0-9a-fA-F]{64}$/,
      'Must contain exactly 64 hexadecimal characters',
    ),

  JWT_ACCESS_ALGORITHM: z.literal('HS256'),
  JWT_ACCESS_ISSUER: jwtIdentifierSchema,
  JWT_ACCESS_AUDIENCE: jwtIdentifierSchema,

  JWT_ACCESS_TTL_SECONDS: secondsSchema.pipe(z.number().int().min(60).max(900)),

  AUTH_SESSION_TTL_SECONDS: secondsSchema.pipe(
    z.number().int().min(3600).max(2_592_000),
  ),
});

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
export type AppEnv = z.infer<typeof appEnvSchema>;
