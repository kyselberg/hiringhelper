import { H3Event } from 'h3';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

const COOKIE_NAME = 'auth_token';
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
  event.node.res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; ${Object.entries(COOKIE_OPTIONS)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')}`);
}

export function removeAuthCookie(event: H3Event): void {
  event.node.res.setHeader('Set-Cookie', `${COOKIE_NAME}=; ${Object.entries({
    ...COOKIE_OPTIONS,
    maxAge: 0
  }).map(([key, value]) => `${key}=${value}`).join('; ')}`);
}

export function getAuthCookie(event: H3Event): string | undefined {
  const cookies = event.node.req.headers.cookie;
  if (!cookies) return undefined;

  const cookie = cookies.split(';').find(c => c.trim().startsWith(`${COOKIE_NAME}=`));
  return cookie ? cookie.split('=')[1] : undefined;
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