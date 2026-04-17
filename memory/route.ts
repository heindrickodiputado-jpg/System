import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { ensureDb, getDb } from '@/lib/db';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureDb();
  const db = getDb();

  const result = await db.execute(
    'SELECT id, text, type, created_at FROM memories ORDER BY created_at DESC'
  );

  const pinned = result.rows
    .filter((r) => r.type === 'pinned')
    .map((r) => ({ id: r.id, text: r.text, type: r.type, created_at: r.created_at }));

  const auto = result.rows
    .filter((r) => r.type === 'auto')
    .map((r) => ({ id: r.id, text: r.text, type: r.type, created_at: r.created_at }));

  return NextResponse.json({ pinned, auto });
}
