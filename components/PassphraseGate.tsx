'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PassphraseGateProps {
  onAuthenticated: () => void;
}

export default function PassphraseGate({ onAuthenticated }: PassphraseGateProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!value.trim() || loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase: value }),
      });

      if (res.ok) {
        onAuthenticated();
      } else {
        const data = await res.json();
        setError(data.error || 'The construct does not recognize this phrase, My Lady.');
      }
    } catch {
      setError('A disruption in the construct, My Lady. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-deep)] p-5">
      <div className="grid-overlay" />
      <div className="scanline-overlay" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="glass-panel p-8 relative">
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          <h1 className="font-cinzel text-xl font-semibold text-[var(--white)] tracking-[0.1em] text-center mb-2">
            System Hein
          </h1>
          <p className="font-crimson italic text-sm text-[var(--text-secondary)] text-center mb-8 leading-relaxed">
            State the passphrase to initialize the construct.
          </p>

          <input
            ref={inputRef}
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Enter passphrase..."
            className="w-full bg-[rgba(6,15,31,0.9)] border border-[var(--blue-line)] text-[var(--text-primary)] font-crimson text-base px-4 py-3 outline-none mb-3 focus:border-[var(--blue-bright)] transition-colors placeholder:text-[var(--text-dim)] placeholder:italic"
            style={{ fontSize: '16px' }}
          />

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-crimson italic text-sm text-red-400 mb-3 leading-relaxed"
            >
              {error}
            </motion.p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !value.trim()}
            className="w-full bg-[rgba(26,111,255,0.1)] border border-[var(--blue-core)] text-[var(--blue-bright)] font-cinzel text-[11px] tracking-[0.3em] py-4 uppercase cursor-pointer transition-all hover:bg-[rgba(26,111,255,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Initializing...' : 'Initialize System Hein'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
