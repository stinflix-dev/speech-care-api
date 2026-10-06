import { z } from 'zod';

export const accessTokenClaimsSchema = z
  .object({
    // UUID користувача
    sub: z.uuid(),
    // UUID auth-сесії
    sid: z.uuid(),
    // час видачі, Unix seconds
    iat: z.number().int().nonnegative(),
    // час завершення дії, Unix seconds
    exp: z.number().int().positive(),
  })
  .refine((claims) => claims.exp > claims.iat, {
    message: 'Expiration must be later than issuance',
  });

export type AccessTokenClaims = z.infer<typeof accessTokenClaimsSchema>;
