import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { ensureDb, getDb } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  await ensureDb();
  const db = getDb();
  const sessionResult = await db.execute({ sql: 'SELECT * FROM sessions WHERE id = ?', args: [id] });
  if (!sessionResult.rows.length) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  const messagesResult = await db.execute({ sql: 'SELECT id, role, content, created_at FROM messages WHERE session_id = ? ORDER BY created_at ASC', args: [id] });
  const messages = messagesResult.rows.map((r) => ({ id: String(r.id), role: r.role, content: r.content, timestamp: r.created_at }));
  return NextResponse.json({ session: sessionResult.rows[0], messages });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  await ensureDb();
  const db = getDb();
  await db.execute({ sql: 'DELETE FROM sessions WHERE id = ?', args: [id] });
  return NextResponse.json({ success: true });
}
