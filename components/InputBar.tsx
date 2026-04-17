'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';

interface InputBarProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function InputBar({ onSend, disabled }: InputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const handleSend = () => {
    const el = textareaRef.current;
    if (!el) return;
    const text = el.value.trim();
    if (!text || disabled) return;
    onSend(text);
    el.value = '';
    el.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-shrink-0 px-4 pb-4 pt-3 border-t border-[var(--blue-line)]"
      style={{ background: 'linear-gradient(0deg, rgba(4,13,26,0.98) 0%, rgba(2,8,16,0.9) 100%)' }}>
      <div
        className="flex items-end gap-3 border border-[var(--blue-line)] bg-[rgba(6,15,31,0.9)] px-4 py-3 transition-all focus-within:border-[rgba(26,111,255,0.5)]"
        style={{
          boxShadow: 'none',
        }}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          onInput={handleResize}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="State your query, My Lady..."
          className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] font-crimson text-[15px] leading-relaxed resize-none max-h-[120px] min-h-[24px] scrollbar-none placeholder:text-[var(--text-dim)] placeholder:italic disabled:opacity-50"
          style={{ fontSize: '16px' }}
        />
        <button
          onClick={handleSend}
          disabled={disabled}
          className="icon-btn flex-shrink-0 w-9 h-9 flex items-center justify-center disabled:opacity-40"
          title="Send"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <p className="font-cinzel text-[8px] tracking-[0.2em] text-[var(--text-dim)] text-center mt-2 uppercase hidden md:block">
        Enter to send &nbsp;·&nbsp; Shift+Enter for new line &nbsp;·&nbsp; Say &quot;remember this&quot; to pin
      </p>
    </div>
  );
}
