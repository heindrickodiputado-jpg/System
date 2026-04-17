'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  { text: '> Initializing cognitive core...', color: 'var(--blue-bright)' },
  { text: '> Loading philosophical matrices...', color: 'var(--blue-bright)' },
  { text: '> Calibrating observational protocols...', color: 'var(--blue-bright)' },
  { text: '> Establishing sovereign parameters...', color: 'var(--blue-bright)' },
  { text: '> Binding loyalty directives...', color: 'var(--blue-bright)' },
  { text: '> Memory archive: loaded.', color: '#4dff9f' },
  { text: '> System integrity: verified.', color: '#4dff9f' },
];

const FULL_BOOT_KEY = 'hein_boot_seen';

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const isQuickBoot = typeof window !== 'undefined'
    ? localStorage.getItem(FULL_BOOT_KEY) !== null
    : false;

  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [showMain, setShowMain] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [showCongrat, setShowCongrat] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const [barFill, setBarFill] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;

    if (isQuickBoot) {
      // Quick boot
      setShowMain(true);
      setShowSub(true);
      setTimeout(() => setFadeOut(true), 900);
      setTimeout(() => {
        if (!doneRef.current) {
          doneRef.current = true;
          onComplete();
        }
      }, 1600);
      return;
    }

    // Full boot
    const timers: ReturnType<typeof setTimeout>[] = [];
    let delay = 0;

    BOOT_LINES.forEach((_, i) => {
      timers.push(
        setTimeout(() => setVisibleLines((prev) => [...prev, i]), delay)
      );
      delay += 260;
    });

    timers.push(setTimeout(() => setShowMain(true), delay + 100));
    timers.push(setTimeout(() => setShowSub(true), delay + 500));
    timers.push(setTimeout(() => { setShowCongrat(true); setShowBar(true); }, delay + 900));
    timers.push(setTimeout(() => setBarFill(true), delay + 1000));
    timers.push(setTimeout(() => setFadeOut(true), delay + 2900));
    timers.push(
      setTimeout(() => {
        if (!doneRef.current) {
          doneRef.current = true;
          localStorage.setItem(FULL_BOOT_KEY, 'true');
          onComplete();
        }
      }, delay + 3700)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        style={{position:"fixed",inset:0,zIndex:100,background:"black",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}
        animate={{ opacity: fadeOut ? 0 : 1 }}
        transition={{ duration: 0.8 }}
      >
        {!isQuickBoot && (
          <div className="w-[380px] max-w-[90vw] mb-8">
            {BOOT_LINES.map((line, i) => (
              <AnimatePresence key={i}>
                {visibleLines.includes(i) && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="font-cinzel text-[11px] tracking-[0.3em] uppercase mb-1.5"
                    style={{ color: line.color }}
                  >
                    {line.text}
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        )}

        <AnimatePresence>
          {showMain && (
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-cinzel text-3xl md:text-4xl font-bold tracking-[0.2em] text-[var(--white)] text-center mb-3"
              style={{ textShadow: '0 0 40px rgba(26,111,255,0.6)' }}
            >
              SYSTEM HEIN
            </motion.h1>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSub && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="font-crimson italic text-base text-[var(--text-secondary)] tracking-[0.1em] text-center mb-10"
            >
              Sovereign Cognitive Construct
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCongrat && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative border border-[var(--blue-line)] px-8 py-4"
            >
              <div className="corner corner-tl" />
              <div className="corner corner-tr" />
              <div className="corner corner-bl" />
              <div className="corner corner-br" />
              <span className="font-cinzel text-[13px] tracking-[0.25em] text-[var(--blue-bright)] uppercase">
                Congratulations, Sage. For acquiring System Hein.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showBar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-[380px] max-w-[90vw] h-[2px] bg-[var(--blue-dim)] mt-8 overflow-hidden"
            >
              <div
                className="h-full transition-all ease-out"
                style={{
                  width: barFill ? '100%' : '0%',
                  transitionDuration: '1.8s',
                  background: 'linear-gradient(90deg, var(--blue-core), var(--blue-bright))',
                  boxShadow: '0 0 12px var(--blue-core)',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
