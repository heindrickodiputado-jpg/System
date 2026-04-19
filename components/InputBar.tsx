'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';

interface InputBarProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function InputBar({ onSend, disabled }: InputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Fix mobile keyboard pushing input out of view
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleViewportResize = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const offsetFromBottom = window.innerHeight - viewport.height - viewport.offsetTop;
      container.style.transform = `translateY(-${Math.max(0, offsetFromBottom)}px)`;
      container.style.transition = 'transform 0.15s ease';
    };

    viewport.addEventListener('resize', handleViewportResize);
    viewport.addEventListener('scroll', handleViewportResize);

    return () => {
      viewport.removeEventListener('resize', handleViewportResize);
      viewport.removeEventListener('scroll', handleViewportResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        flexShrink: 0,
        padding: '12px 16px 16px',
        borderTop: '1px solid var(--blue-line)',
        background: 'linear-gradient(0deg, rgba(4,13,26,0.98) 0%, rgba(2,8,16,0.9) 100%)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 10,
        border: '1px solid var(--blue-line)',
        background: 'rgba(6,15,31,0.9)',
        padding: '10px 14px',
      }}>
        <textarea
          ref={textareaRef}
          rows={1}
          onInput={handleResize}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="State your query, My Lady..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'Crimson Pro,Georgia,serif',
            fontSize: 16,
            lineHeight: 1.5,
            resize: 'none',
            maxHeight: 120,
            minHeight: 24,
            scrollbarWidth: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={disabled}
          className="icon-btn"
          style={{
            width: 36,
            height: 36,
            minWidth: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            opacity: disabled ? 0.4 : 1,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <p style={{
        fontFamily: 'Cinzel,serif',
        fontSize: 8,
        letterSpacing: '0.2em',
        color: 'var(--text-dim)',
        textAlign: 'center',
        marginTop: 8,
        textTransform: 'uppercase',
      }}>
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
