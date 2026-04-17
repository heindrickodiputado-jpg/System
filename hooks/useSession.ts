'use client';

import { useState, useCallback } from 'react';
import { Session } from '@/types';

export function useSession() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch {
      // Silent fail
    }
  }, []);

  const createSession = useCallback(async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/sessions', { method: 'POST' });
      const data = await res.json();
      await fetchSessions();
      setCurrentSessionId(data.id);
      return data.id;
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSessions]);

  const switchSession = useCallback(
    async (id: string) => {
      setCurrentSessionId(id);
      await fetchSessions();
    },
    [fetchSessions]
  );

  const deleteSession = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
        const remaining = sessions.filter((s) => s.id !== id);
        setSessions(remaining);

        if (currentSessionId === id) {
          if (remaining.length > 0) {
            setCurrentSessionId(remaining[0].id);
          } else {
            setCurrentSessionId(null);
          }
        }
      } catch {
        // Silent fail
      }
    },
    [sessions, currentSessionId]
  );

  return {
    sessions,
    currentSessionId,
    isLoading,
    fetchSessions,
    createSession,
    switchSession,
    deleteSession,
    setCurrentSessionId,
  };
}
