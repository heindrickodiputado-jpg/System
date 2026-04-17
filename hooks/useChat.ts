'use client';

import { useState, useCallback, useRef } from 'react';
import { Message, Mode } from '@/types';
import { INTRO_MESSAGE } from '@/lib/prompts';

const PIN_TRIGGERS = ['remember this', 'pin this', 'make note', 'take note'];

function detectPinTrigger(text: string): string | null {
  const lower = text.toLowerCase();
  for (const trigger of PIN_TRIGGERS) {
    if (lower.includes(trigger)) {
      const cleaned = text
        .replace(new RegExp(trigger, 'gi'), '')
        .replace(/[,.:;!?]+$/, '')
        .trim();
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
}

export function useChat({
  sessionId,
  mode,
  onPinDetected,
  onSessionUpdate,
  onSummarizeNeeded,
}: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const userMessageCountRef = useRef(0);

  const addIntroMessage = useCallback(() => {
    const intro: Message = {
      id: generateId(),
      role: 'assistant',
      content: INTRO_MESSAGE,
      timestamp: new Date().toISOString(),
    };
    setMessages([intro]);
  }, []);

  const loadMessages = useCallback(async (sid: string) => {
    try {
      const res = await fetch(`/api/sessions/${sid}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
        userMessageCountRef.current = data.messages.filter(
          (m: Message) => m.role === 'user'
        ).length;
      }
    } catch {
      // Silent fail
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingContent('');
    userMessageCountRef.current = 0;
  }, []);

  const stopStreaming = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    if (streamingContent) {
      const msg: Message = {
        id: generateId(),
        role: 'assistant',
        content: streamingContent,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msg]);
      setStreamingContent('');
    }

    setIsStreaming(false);
  }, [streamingContent]);

  const triggerSummarize = useCallback(
    (sid: string) => {
      fetch('/api/memory/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid }),
      }).catch(() => {});
      onSummarizeNeeded?.(sid);
    },
    [onSummarizeNeeded]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!sessionId || isStreaming) return;

      // Optimistic user message
      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      userMessageCountRef.current += 1;

      // Pin detection
      const pinText = detectPinTrigger(text);
      if (pinText && onPinDetected) {
        onPinDetected(pinText);
      }

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

        if (!res.body) throw new Error('No stream body');

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
            const raw = line.slice(6).trim();
            try {
              const evt = JSON.parse(raw);
              if (evt.type === 'token' && evt.content) {
                fullContent += evt.content;
                setStreamingContent(fullContent);
              } else if (evt.type === 'done') {
                const assistantMsg: Message = {
                  id: generateId(),
                  role: 'assistant',
                  content: evt.full_content || fullContent,
                  timestamp: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, assistantMsg]);
                setStreamingContent('');
              }
            } catch {
              // Skip
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          const errorMsg: Message = {
            id: generateId(),
            role: 'assistant',
            content:
              'A disruption in the construct, My Lady. The connection wavers. Try again.',
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, errorMsg]);
          setStreamingContent('');
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }

      // Auto-summarize every 8 user messages
      if (userMessageCountRef.current % 8 === 0) {
        triggerSummarize(sessionId);
      }

      onSessionUpdate?.();
    },
    [sessionId, mode, isStreaming, onPinDetected, onSessionUpdate, triggerSummarize]
  );

  return {
    messages,
    isStreaming,
    streamingContent,
    addIntroMessage,
    loadMessages,
    clearMessages,
    sendMessage,
    stopStreaming,
    setMessages,
  };
}
