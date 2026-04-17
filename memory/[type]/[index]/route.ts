import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { ensureDb, getDb } from '@/lib/db';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string; index: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { index } = await params;
  await ensureDb();
  const db = getDb();

  await db.execute({
    sql: 'DELETE FROM memories WHERE id = ?',
    args: [parseInt(index)],
  });

  return NextResponse.json({ success: true });
}
