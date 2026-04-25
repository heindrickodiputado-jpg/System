import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { ensureDb, getDb } from '@/lib/db';

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
  await db.execute({ sql: 'DELETE FROM messages WHERE id = ?', args: [parseInt(id)] });
  return NextResponse.json({ success: true });
}
