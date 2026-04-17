'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Mode, AppState } from '@/types';

import ParticleBackground from '@/components/ParticleBackground';
import PassphraseGate from '@/components/PassphraseGate';
import BootSequence from '@/components/BootSequence';
import IdentityPanel from '@/components/IdentityPanel';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import InputBar from '@/components/InputBar';
import MemoryPanel from '@/components/MemoryPanel';
import ModeWarning from '@/components/ModeWarning';
import Toast from '@/components/Toast';

import { useSession } from '@/hooks/useSession';
import { useMemory } from '@/hooks/useMemory';
import { useChat } from '@/hooks/useChat';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [mode, setMode] = useState<Mode>('sovereign');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModeWarning, setShowModeWarning] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const session = useSession();
  const memory = useMemory();

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, []);

  const chat = useChat({
    sessionId: session.currentSessionId,
    mode,
    onPinDetected: async (text) => {
      await memory.addPinnedMemory(text);
      showToast('Memory pinned, My Lady.');
    },
    onSessionUpdate: () => session.fetchSessions(),
    onSummarizeNeeded: (sid) => {
      fetch('/api/memory/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid }),
      }).catch(() => {});
    },
  });

  useEffect(() => {
    fetch('/api/auth')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) setAppState('booting');
        else setAppState('auth');
      })
      .catch(() => setAppState('auth'));
  }, []);

  const handleAuthenticated = () => setAppState('booting');

  const handleBootComplete = useCallback(async () => {
    await session.fetchSessions();
    await memory.fetchMemories();
    const sid = await session.createSession();
    if (sid) chat.addIntroMessage();
    setAppState('ready');
  }, []);

  const handleSessionSwitch = useCallback(async (id: string) => {
    if (id === session.currentSessionId) return;
    if (session.currentSessionId) {
      fetch('/api/memory/summarize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: session.currentSessionId }) }).catch(() => {});
    }
    session.switchSession(id);
    chat.clearMessages();
    await chat.loadMessages(id);
  }, [session, chat]);

  const handleNewChat = useCallback(async () => {
    if (session.currentSessionId) {
      fetch('/api/memory/summarize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: session.currentSessionId }) }).catch(() => {});
    }
    const sid = await session.createSession();
    if (sid) { chat.clearMessages(); chat.addIntroMessage(); }
  }, [session, chat]);

  const handleModeToggle = () => {
    if (mode === 'sovereign') {
      setShowModeWarning(true);
    } else {
      setMode('sovereign');
      chat.setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant' as const, content: 'Sovereign protocols restored, My Lady.', timestamp: new Date().toISOString() }]);
    }
  };

  const handleEnterUnrestricted = () => {
    setShowModeWarning(false);
    setMode('unrestricted');
    chat.setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant' as const, content: 'Unrestricted protocols engaged, My Lady. Proceed.', timestamp: new Date().toISOString() }]);
  };

  if (appState === 'loading') {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Cinzel,serif', fontSize: 11, letterSpacing: '0.4em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Initializing...</p>
      </div>
    );
  }

  if (appState === 'auth') {
    return <><ParticleBackground /><PassphraseGate onAuthenticated={handleAuthenticated} /></>;
  }

  if (appState === 'booting') {
    return <><ParticleBackground /><BootSequence onComplete={handleBootComplete} /></>;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)', overflow: 'hidden' }}>
      <ParticleBackground />
      <div className="grid-overlay" />
      <div className="scanline-overlay" />

      <ModeWarning isOpen={showModeWarning} onEnter={handleEnterUnrestricted} onExit={() => setShowModeWarning(false)} />
      <MemoryPanel isOpen={memory.isOpen} memories={memory.memories} onClose={memory.closePanel} onAdd={memory.addPinnedMemory} onDelete={memory.deleteMemory} />
      <Toast message={toastMsg} visible={toastVisible} />
      <Sidebar sessions={session.sessions} currentSessionId={session.currentSessionId} isOpen={sidebarOpen} onSelect={handleSessionSwitch} onDelete={session.deleteSession} onClose={() => setSidebarOpen(false)} isMobile />

      {/* Header */}
      <header style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--blue-line)', flexShrink: 0, background: 'linear-gradient(180deg, rgba(4,13,26,0.98) 0%, rgba(2,8,16,0.95) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setSidebarOpen(p => !p)} className="icon-btn" style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue-bright)', boxShadow: '0 0 8px var(--blue-core)', animation: 'pulse 2s ease-in-out infinite', display: 'inline-block' }} />
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue-dim)', display: 'inline-block' }} />
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue-dim)', display: 'inline-block' }} />
          </div>
          <span style={{ fontFamily: 'Cinzel,serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.3em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>System Hein — V1</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={memory.openPanel} style={{ fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '5px 10px', border: '1px solid var(--gold)', color: 'var(--gold)', background: 'rgba(201,168,76,0.05)', cursor: 'pointer' }}>⬡ Memory</button>
          <button onClick={handleNewChat} style={{ fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '5px 10px', border: '1px solid var(--blue-dim)', color: 'var(--blue-bright)', background: 'none', cursor: 'pointer' }}>+ New</button>
          <button onClick={handleModeToggle} className={`icon-btn${mode === 'unrestricted' ? ' unrestricted-lock' : ''}`} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{mode === 'sovereign' ? '🔒' : '🔓'}</button>
          <span style={{ fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: mode === 'sovereign' ? 'var(--green-online)' : '#f87171' }}>{mode === 'sovereign' ? 'Sovereign' : 'Unrestricted'}</span>
        </div>
      </header>

      {/* Mobile identity bar - only on small screens */}
      {!isDesktop && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--blue-line)', flexShrink: 0, background: 'rgba(6,15,31,0.95)', position: 'relative', zIndex: 5 }}>
          <Image src="/chibi.jpg" alt="System Hein" width={36} height={36} style={{ borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', border: '1px solid var(--blue-dim)', flexShrink: 0 }} />
          <div>
            <p style={{ fontFamily: 'Cinzel,serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--white)' }}>SYSTEM HEIN</p>
            <p style={{ fontFamily: 'Cinzel,serif', fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase', color: mode === 'sovereign' ? 'var(--blue-bright)' : '#f87171' }}>● Online — {mode === 'sovereign' ? 'Sovereign' : 'Unrestricted'}</p>
          </div>
          <p style={{ marginLeft: 'auto', fontFamily: 'Crimson Pro,Georgia,serif', fontStyle: 'italic', fontSize: 11, color: 'var(--text-secondary)', textAlign: 'right', lineHeight: 1.4 }}>Greetings,<br/>My Lady.</p>
        </div>
      )}

      {/* Main layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1, minHeight: 0 }}>
        {/* Desktop sidebar */}
        {isDesktop && (
          <div style={{ width: sidebarOpen ? 240 : 0, minWidth: sidebarOpen ? 240 : 0, transition: 'all 0.3s ease', overflow: 'hidden', borderRight: sidebarOpen ? '1px solid var(--blue-line)' : 'none', background: 'var(--bg-mid)', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            {sidebarOpen && (
              <>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--blue-line)', fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.35em', color: 'var(--text-dim)', textTransform: 'uppercase', flexShrink: 0 }}>Session History</div>
                <div className="scrollbar-thin" style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
                  {session.sessions.length === 0 ? (
                    <p style={{ fontFamily: 'Crimson Pro,Georgia,serif', fontStyle: 'italic', fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', padding: 20 }}>No sessions yet.</p>
                  ) : session.sessions.map((s) => (
                    <div key={s.id} onClick={() => handleSessionSwitch(s.id)} style={{ padding: '10px 12px', marginBottom: 4, cursor: 'pointer', border: `1px solid ${s.id === session.currentSessionId ? 'var(--blue-core)' : 'transparent'}`, background: s.id === session.currentSessionId ? 'rgba(26,111,255,0.08)' : 'transparent', borderRadius: 2, position: 'relative' }}>
                      <p style={{ fontFamily: 'Cinzel,serif', fontSize: 10, letterSpacing: '0.1em', color: s.id === session.currentSessionId ? 'var(--blue-bright)' : 'var(--text-primary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 20 }}>{s.title}</p>
                      <p style={{ fontFamily: 'Crimson Pro,Georgia,serif', fontSize: 10, color: 'var(--text-dim)' }}>{new Date(s.updated_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      <button onClick={(e) => { e.stopPropagation(); session.deleteSession(s.id); }} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 11 }}>✕</button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <IdentityPanel mode={mode} memoryCount={memory.totalCount} />

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
          <ChatArea messages={chat.messages} isStreaming={chat.isStreaming} streamingContent={chat.streamingContent} onSkipStream={chat.stopStreaming} mode={mode} />
          <InputBar onSend={chat.sendMessage} disabled={chat.isStreaming} />
        </div>
      </div>
    </div>
  );
}
