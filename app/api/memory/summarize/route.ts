import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { ensureDb, getDb } from '@/lib/db';
import { getSummarizeConfig } from '@/lib/models';
import { MEMORY_SUMMARIZE_PROMPT } from '@/lib/prompts';

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { session_id } = await req.json();
  await ensureDb();
  const db = getDb();
  const messagesResult = await db.execute({ sql: 'SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at ASC', args: [session_id] });
  if (messagesResult.rows.length < 4) {
    return NextResponse.json({ skipped: true, reason: 'Too few messages' });
  }
  const convoText = messagesResult.rows.map((r) => `${String(r.role).toUpperCase()}: ${r.content}`).join('\n\n');
  const config = getSummarizeConfig();
  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.key}` },
      body: JSON.stringify({ model: config.model, messages: [{ role: 'system', content: MEMORY_SUMMARIZE_PROMPT }, { role: 'user', content: convoText }], max_tokens: 400, temperature: 0.3, stream: false }),
    });
    const data = await response.json();
    const summary: string = data.choices?.[0]?.message?.content?.trim() || '';
    if (summary === 'NOTHING_NEW' || !summary) return NextResponse.json({ skipped: true, reason: 'Nothing new' });
    const bullets = summary.split('\n').filter((l: string) => l.trim().startsWith('-')).map((l: string) => l.replace(/^-\s*/, '').trim()).filter(Boolean);
    if (!bullets.length) return NextResponse.json({ skipped: true, reason: 'No bullets parsed' });
    const existingResult = await db.execute("SELECT text FROM memories WHERE type = 'auto'");
    const existingTexts = new Set(existingResult.rows.map((r) => r.text as string));
    let added = 0;
    for (const bullet of bullets) {
      if (!existingTexts.has(bullet)) {
        await db.execute({ sql: "INSERT INTO memories (text, type) VALUES (?, 'auto')", args: [bullet] });
        added++;
      }
    }
    const countResult = await db.execute("SELECT COUNT(*) as count FROM memories WHERE type = 'auto'");
    const count = countResult.rows[0]?.count as number;
    if (count > 80) {
      await db.execute({ sql: "DELETE FROM memories WHERE type = 'auto' AND id IN (SELECT id FROM memories WHERE type = 'auto' ORDER BY created_at ASC LIMIT ?)", args: [count - 80] });
    }
    return NextResponse.json({ success: true, added });
  } catch {
    return NextResponse.json({ skipped: true, reason: 'Summarization failed' });
  }
}
