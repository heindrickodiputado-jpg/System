import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'hein_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function hmacSign(payload: string): string {
  return createHmac('sha256', process.env.COOKIE_SECRET!)
    .update(payload)
    .digest('hex');
}

export function generateAuthToken(): string {
  const payload = `authenticated:${Date.now()}`;
  const sig = hmacSign(payload);
  return `${payload}.${sig}`;
}

export function verifyAuthToken(token: string): boolean {
  const lastDot = token.lastIndexOf('.');
  if (lastDot === -1) return false;
  const payload = token.substring(0, lastDot);
  const sig = token.substring(lastDot + 1);
  const expected = hmacSign(payload);
  try {
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export function verifyPassphrase(input: string): boolean {
  return input.trim() === process.env.HEIN_PASSPHRASE?.trim();
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const token = await getAuthCookie();
    if (!token) return false;
    return verifyAuthToken(token);
  } catch {
    return false;
  }
}
