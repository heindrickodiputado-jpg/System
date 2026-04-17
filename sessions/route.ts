import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { ensureDb, getDb } from '@/lib/db';

function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureDb();
  const db = getDb();

  const result = await db.execute(`
    SELECT 
      s.id, s.title, s.mode, s.created_at, s.updated_at,
      COUNT(m.id) as message_count
    FROM sessions s
    LEFT JOIN messages m ON s.id = m.session_id
    GROUP BY s.id
    ORDER BY s.updated_at DESC
    LIMIT 60
  `);

  const sessions = result.rows.map((r) => ({
    id: r.id,
    title: r.title,
    mode: r.mode,
    created_at: r.created_at,
    updated_at: r.updated_at,
    message_count: r.message_count,
  }));

  return NextResponse.json({ sessions });
}

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureDb();
  const db = getDb();

  const id = generateSessionId();
  await db.execute({
    sql: 'INSERT INTO sessions (id, title) VALUES (?, ?)',
    args: [id, 'New Session'],
  });

  return NextResponse.json({ id, title: 'New Session' });
}
