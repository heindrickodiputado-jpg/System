import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { ensureDb, getDb } from '@/lib/db';
import { getSummarizeConfig } from '@/lib/models';
import { MEMORY_DETECT_PROMPT } from '@/lib/prompts';

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message } = await req.json();
  if (!message || message.trim().length < 10) {
    return NextResponse.json({ skipped: true });
  }

  const config = getSummarizeConfig();

  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.key}` },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: MEMORY_DETECT_PROMPT },
          { role: 'user', content: message },
        ],
        max_tokens: 100,
        temperature: 0.2,
        stream: false,
      }),
    });

    const data = await response.json();
    const result: string = data.choices?.[0]?.message?.content?.trim() || '';

    if (result === 'NOTHING' || !result || result.startsWith('NOTHING')) {
      return NextResponse.json({ skipped: true });
    }

    const memoryText = result.replace(/^-\s*/, '').trim();
    if (memoryText.length < 5) return NextResponse.json({ skipped: true });

    await ensureDb();
    const db = getDb();

    // Check for duplicates
    const existing = await db.execute("SELECT text FROM memories WHERE type = 'auto'");
    const existingTexts = existing.rows.map(r => r.text as string);
    const isDuplicate = existingTexts.some(t => t.toLowerCase().includes(memoryText.toLowerCase().slice(0, 20)));

    if (!isDuplicate) {
      await db.execute({
        sql: "INSERT INTO memories (text, type) VALUES (?, 'auto')",
        args: [memoryText],
      });
    }

    return NextResponse.json({ success: true, saved: memoryText });
  } catch {
    return NextResponse.json({ skipped: true });
  }
}
