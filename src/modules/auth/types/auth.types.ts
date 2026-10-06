import type { Request } from 'express';

export interface AuthCredentials {
  accessToken: string;
  refreshToken: string;
  sessionExpiresAt: Date;
}

export interface AuthContext {
  userId: string;
  sessionId: string;
}

export interface AuthRequest extends Request {
  user?: AuthContext;
}
