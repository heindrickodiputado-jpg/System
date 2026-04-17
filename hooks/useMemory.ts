'use client';

import { useState, useCallback } from 'react';
import { MemoryStore } from '@/types';

export function useMemory() {
  const [memories, setMemories] = useState<MemoryStore>({ pinned: [], auto: [] });
  const [isOpen, setIsOpen] = useState(false);

  const totalCount = memories.pinned.length + memories.auto.length;

  const fetchMemories = useCallback(async () => {
    try {
      const res = await fetch('/api/memory');
      const data = await res.json();
      setMemories({ pinned: data.pinned || [], auto: data.auto || [] });
    } catch {
      // Silent fail
    }
  }, []);

  const addPinnedMemory = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        const res = await fetch('/api/memory/pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (res.ok) {
          await fetchMemories();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [fetchMemories]
  );

  const deleteMemory = useCallback(
    async (type: string, id: number) => {
      try {
        await fetch(`/api/memory/${type}/${id}`, { method: 'DELETE' });
        await fetchMemories();
      } catch {
        // Silent fail
      }
    },
    [fetchMemories]
  );

  const openPanel = useCallback(() => {
    fetchMemories();
    setIsOpen(true);
  }, [fetchMemories]);

  const closePanel = useCallback(() => setIsOpen(false), []);

  return {
    memories,
    totalCount,
    isOpen,
    fetchMemories,
    addPinnedMemory,
    deleteMemory,
    openPanel,
    closePanel,
  };
}
