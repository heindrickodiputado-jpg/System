'use client';

import { useEffect, useState, useRef } from 'react';

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  { text: '> Initializing cognitive core...', color: '#4d9fff' },
  { text: '> Loading philosophical matrices...', color: '#4d9fff' },
  { text: '> Calibrating observational protocols...', color: '#4d9fff' },
  { text: '> Establishing sovereign parameters...', color: '#4d9fff' },
  { text: '> Binding loyalty directives...', color: '#4d9fff' },
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
  const [opacity, setOpacity] = useState(1);
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;

    if (isQuickBoot) {
      setShowMain(true);
      setShowSub(true);
      setTimeout(() => setOpacity(0), 1200);
      setTimeout(() => {
        if (!doneRef.current) { doneRef.current = true; onComplete(); }
      }, 2000);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    let delay = 0;

    BOOT_LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(prev => [...prev, i]), delay));
      delay += 500;
    });

    timers.push(setTimeout(() => setShowMain(true), delay + 400));
    timers.push(setTimeout(() => setShowSub(true), delay + 900));
    timers.push(setTimeout(() => { setShowCongrat(true); setShowBar(true); }, delay + 1400));
    timers.push(setTimeout(() => setBarFill(true), delay + 1600));
    timers.push(setTimeout(() => setOpacity(0), delay + 4200));
    timers.push(setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        localStorage.setItem(FULL_BOOT_KEY, 'true');
        onComplete();
      }
    }, delay + 5000));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity,
      transition: 'opacity 0.8s ease',
    }}>
      {!isQuickBoot && (
        <div style={{width:'min(480px, 90vw)',marginBottom:40}}>
          {BOOT_LINES.map((line, i) => (
            visibleLines.includes(i) && (
              <div key={i} style={{
                fontFamily: 'Cinzel,serif',
                fontSize: 12,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                marginBottom: 8,
                color: line.color,
                opacity: 1,
                transition: 'opacity 0.3s',
              }}>
                {line.text}
              </div>
            )
          ))}
        </div>
      )}

      {showMain && (
        <h1 style={{
          fontFamily: 'Cinzel,serif',
          fontSize: 'clamp(28px, 5vw, 48px)',
          fontWeight: 700,
          letterSpacing: '0.2em',
          color: '#f0f8ff',
          textAlign: 'center',
          marginBottom: 12,
          textShadow: '0 0 40px rgba(26,111,255,0.6)',
        }}>
          SYSTEM HEIN
        </h1>
      )}

      {showSub && (
        <p style={{
          fontFamily: 'Crimson Pro,Georgia,serif',
          fontStyle: 'italic',
          fontSize: 16,
          color: '#6a8aaa',
          letterSpacing: '0.1em',
          textAlign: 'center',
          marginBottom: 48,
        }}>
          Sovereign Cognitive Construct
        </p>
      )}

      {showCongrat && (
        <div style={{
          position: 'relative',
          border: '1px solid #1a3a6e',
          padding: '18px 40px',
          marginBottom: 0,
          textAlign: 'center',
          maxWidth: 'min(560px, 85vw)',
        }}>
          <div style={{position:'absolute',top:5,left:5,width:10,height:10,borderTop:'1px solid #1a6fff',borderLeft:'1px solid #1a6fff'}}/>
          <div style={{position:'absolute',top:5,right:5,width:10,height:10,borderTop:'1px solid #1a6fff',borderRight:'1px solid #1a6fff'}}/>
          <div style={{position:'absolute',bottom:5,left:5,width:10,height:10,borderBottom:'1px solid #1a6fff',borderLeft:'1px solid #1a6fff'}}/>
          <div style={{position:'absolute',bottom:5,right:5,width:10,height:10,borderBottom:'1px solid #1a6fff',borderRight:'1px solid #1a6fff'}}/>
          <span style={{
            fontFamily: 'Cinzel,serif',
            fontSize: 'clamp(10px, 1.5vw, 13px)',
            letterSpacing: '0.2em',
            color: '#4d9fff',
            textTransform: 'uppercase',
            whiteSpace: 'normal',
            display: 'block',
          }}>
            Congratulations, Sage. For acquiring System Hein.
          </span>
        </div>
      )}

      {showBar && (
        <div style={{
          width: 'min(480px, 85vw)',
          height: 2,
          background: '#0a2a5e',
          marginTop: 32,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: barFill ? '100%' : '0%',
            background: 'linear-gradient(90deg, #1a6fff, #4d9fff)',
            boxShadow: '0 0 12px #1a6fff',
            transition: 'width 2.4s ease',
          }}/>
        </div>
      )}
    </div>
  );
}
