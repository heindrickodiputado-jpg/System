import { NextRequest } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { ensureDb, getDb } from '@/lib/db';
import { getModelConfig } from '@/lib/models';
import { buildSystemPrompt, CHRONICLE_EXTENSION } from '@/lib/prompts';
import { Memory } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const CHRONICLE_TRIGGERS = ['chronicle mode', 'weave a tale', 'begin chronicle', 'tell me a story', 'write a story', 'make a story', 'write a scenario', 'make a scenario'];

function encodeSSE(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return new Response(encodeSSE({ type: 'error', message: 'Not authenticated.' }), { status: 401, headers: { 'Content-Type': 'text/event-stream' } });
  }

  const { message, session_id, mode } = await req.json();
  await ensureDb();
  const db = getDb();

  await db.execute({ sql: 'INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)', args: [session_id, 'user', message] });

  const sessionRow = await db.execute({ sql: 'SELECT title FROM sessions WHERE id = ?', args: [session_id] });
  if (sessionRow.rows[0]?.title === 'New Session') {
    const title = message.slice(0, 40) + (message.length > 40 ? '...' : '');
    await db.execute({ sql: "UPDATE sessions SET title = ?, updated_at = datetime('now') WHERE id = ?", args: [title, session_id] });
  } else {
    await db.execute({ sql: "UPDATE sessions SET updated_at = datetime('now') WHERE id = ?", args: [session_id] });
  }

  const memoriesResult = await db.execute('SELECT id, text, type, created_at FROM memories ORDER BY created_at DESC');
  const memories: Memory[] = memoriesResult.rows.map((r) => ({ id: r.id as number, text: r.text as string, type: r.type as 'pinned' | 'auto', created_at: r.created_at as string }));

  const historyResult = await db.execute({ sql: 'SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at ASC', args: [session_id] });
  const history = historyResult.rows.map((r) => ({ role: r.role as string, content: r.content as string }));

  // Detect chronicle mode from message or recent history
  const messageLower = message.toLowerCase();
  const isChronicle = CHRONICLE_TRIGGERS.some(t => messageLower.includes(t)) ||
    history.slice(-6).some(m => CHRONICLE_TRIGGERS.some(t => m.content.toLowerCase().includes(t))) &&
    !messageLower.includes('end chronicle');

  let systemPrompt = buildSystemPrompt(mode, memories);
  if (isChronicle) systemPrompt += CHRONICLE_EXTENSION;

  const allMessages = [{ role: 'system', content: systemPrompt }, ...history];

  const stream = new ReadableStream({
    async start(controller) {
      let fullContent = '';

      const tryModel = async (config: ReturnType<typeof getModelConfig>, isFallback = false): Promise<boolean> => {
        try {
          const headers: Record<string, string> = { 'Content-Type': 'application/json', Authorization: `Bearer ${config.key}`, ...config.headers };
          const response = await fetch(config.url, { method: 'POST', headers, body: JSON.stringify({ model: config.model, messages: allMessages, temperature: config.temperature, max_tokens: config.max_tokens, stream: true }) });
          if (!response.ok || !response.body) return false;
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  fullContent += delta;
                  controller.enqueue(new TextEncoder().encode(encodeSSE({ type: 'token', content: delta })));
                }
                if (parsed.choices?.[0]?.finish_reason === 'content_filter' && !isFallback) return false;
              } catch {}
            }
          }
          return true;
        } catch { return false; }
      };

      let success = false;
      if (mode === 'sovereign') {
        success = await tryModel(getModelConfig('sovereign'));
        if (!success) { fullContent = ''; success = await tryModel(getModelConfig('unrestricted'), true); }
      } else {
        success = await tryModel(getModelConfig('unrestricted'));
      }

      if (!success || !fullContent) {
        const errorMsg = 'A disruption in the construct, My Lady. The connection wavers. Try again.';
        controller.enqueue(new TextEncoder().encode(encodeSSE({ type: 'token', content: errorMsg })));
        fullContent = errorMsg;
      }

      await db.execute({ sql: 'INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)', args: [session_id, 'assistant', fullContent] });
      controller.enqueue(new TextEncoder().encode(encodeSSE({ type: 'done', full_content: fullContent })));
      controller.close();
    },
  });

  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' } });
}
