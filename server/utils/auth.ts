import { H3Event, getCookie, setCookie } from 'h3';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

export const COOKIE_NAME = 'auth_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/'
};

export interface JWTPayload {
  userId: string;
  email: string;
}

export function setAuthCookie(event: H3Event, token: string): void {
  setCookie(event, COOKIE_NAME, token, COOKIE_OPTIONS);
}

export function removeAuthCookie(event: H3Event): void {
  setCookie(event, COOKIE_NAME, '', {
    ...COOKIE_OPTIONS,
    maxAge: 0
  });
}

export function getAuthCookie(event: H3Event): string | undefined {
  return getCookie(event, COOKIE_NAME);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): JWTPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
  if (!decoded.userId || !decoded.email) {
    throw new Error('Invalid token payload');
  }
  return decoded;
}

export async function requireAuth(event: H3Event): Promise<JWTPayload> {
  const token = getAuthCookie(event);
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    });
  }

  try {
    return verifyToken(token);
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token'
    });
  }
}