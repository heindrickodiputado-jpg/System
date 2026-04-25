'use client';

import { useState, useCallback, useRef } from 'react';
import { Message, Mode } from '@/types';
import { INTRO_MESSAGE } from '@/lib/prompts';

const PIN_TRIGGERS = ['remember this', 'pin this', 'make note', 'take note'];

function detectPinTrigger(text: string): string | null {
  const lower = text.toLowerCase();
  for (const trigger of PIN_TRIGGERS) {
    if (lower.includes(trigger)) {
      const cleaned = text.replace(new RegExp(trigger, 'gi'), '').replace(/[,.:;!?]+$/, '').trim();
      if (cleaned.length > 3) return cleaned;
    }
  }
  return null;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface UseChatOptions {
  sessionId: string | null;
  mode: Mode;
  onPinDetected?: (text: string) => void;
  onSessionUpdate?: () => void;
  onSummarizeNeeded?: (sessionId: string) => void;
  onRateLimit?: (seconds: number) => void;
}

export function useChat({ sessionId, mode, onPinDetected, onSessionUpdate, onSummarizeNeeded, onRateLimit }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const userMessageCountRef = useRef(0);

  const addIntroMessage = useCallback(() => {
    setMessages([{ id: generateId(), role: 'assistant', content: INTRO_MESSAGE, timestamp: new Date().toISOString() }]);
  }, []);

  const loadMessages = useCallback(async (sid: string) => {
    try {
      const res = await fetch(`/api/sessions/${sid}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
        userMessageCountRef.current = data.messages.filter((m: Message) => m.role === 'user').length;
      }
    } catch {}
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingContent('');
    userMessageCountRef.current = 0;
  }, []);

  const stopStreaming = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    if (streamingContent) {
      setMessages(prev => [...prev, { id: generateId(), role: 'assistant', content: streamingContent, timestamp: new Date().toISOString() }]);
      setStreamingContent('');
    }
    setIsStreaming(false);
  }, [streamingContent]);

  const deleteMessage = useCallback(async (messageId: string) => {
    // Remove from local state immediately
    setMessages(prev => prev.filter(m => m.id !== messageId));
    // Delete from DB
    try {
      await fetch(`/api/messages/${messageId}`, { method: 'DELETE' });
    } catch {}
  }, []);

  const detectAndSaveMemory = useCallback(async (text: string) => {
    try {
      await fetch('/api/memory/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
    } catch {}
  }, []);

  const triggerSummarize = useCallback((sid: string) => {
    fetch('/api/memory/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sid }),
    }).catch(() => {});
    onSummarizeNeeded?.(sid);
  }, [onSummarizeNeeded]);

  const sendMessage = useCallback(async (text: string) => {
    if (!sessionId || isStreaming) return;

    const userMsg: Message = { id: generateId(), role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    userMessageCountRef.current += 1;

    const pinText = detectPinTrigger(text);
    if (pinText && onPinDetected) onPinDetected(pinText);

    detectAndSaveMemory(text);

    setIsStreaming(true);
    setStreamingContent('');

    const controller = new AbortController();
    abortRef.current = controller;
    let fullContent = '';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, session_id: sessionId, mode }),
        signal: controller.signal,
      });

      if (!res.body) throw new Error('No stream');
      const reader = res.body.getReader();
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
          try {
            const evt = JSON.parse(line.slice(6).trim());
            if (evt.type === 'token' && evt.content) {
              fullContent += evt.content;
              setStreamingContent(fullContent);
            } else if (evt.type === 'done') {
              setMessages(prev => [...prev, { id: generateId(), role: 'assistant', content: evt.full_content || fullContent, timestamp: new Date().toISOString() }]);
              setStreamingContent('');
            } else if (evt.type === 'rate_limit') {
              onRateLimit?.(evt.retry_after || 60);
            }
          } catch {}
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setMessages(prev => [...prev, { id: generateId(), role: 'assistant', content: 'A disruption in the construct, My Lady. The connection wavers. Try again.', timestamp: new Date().toISOString() }]);
        setStreamingContent('');
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }

    if (userMessageCountRef.current % 4 === 0) triggerSummarize(sessionId);
    onSessionUpdate?.();
  }, [sessionId, mode, isStreaming, onPinDetected, onSessionUpdate, triggerSummarize, detectAndSaveMemory, onRateLimit]);

  return { messages, isStreaming, streamingContent, addIntroMessage, loadMessages, clearMessages, sendMessage, stopStreaming, setMessages, deleteMessage };
}
