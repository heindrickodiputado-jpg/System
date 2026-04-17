import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { ensureDb, getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { text } = await req.json();

  if (!text || text.trim().length < 3) {
    return NextResponse.json({ error: 'Memory too short.' }, { status: 400 });
  }

  await ensureDb();
  const db = getDb();

  await db.execute({
    sql: 'INSERT INTO memories (text, type) VALUES (?, ?)',
    args: [text.trim(), 'pinned'],
  });

  return NextResponse.json({ success: true });
}
