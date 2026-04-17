import { NextRequest, NextResponse } from 'next/server';
import {
  verifyPassphrase,
  generateAuthToken,
  setAuthCookie,
  clearAuthCookie,
  isAuthenticated,
} from '@/lib/auth';

export async function GET() {
  const authed = await isAuthenticated();
  return NextResponse.json({ authenticated: authed });
}

export async function POST(req: NextRequest) {
  const { passphrase } = await req.json();

  if (!verifyPassphrase(passphrase)) {
    return NextResponse.json(
      { error: 'The construct does not recognize this phrase, My Lady.' },
      { status: 401 }
    );
  }

  const token = generateAuthToken();
  await setAuthCookie(token);
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  await clearAuthCookie();
  return NextResponse.json({ success: true });
}
