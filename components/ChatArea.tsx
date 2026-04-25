'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, Mode } from '@/types';

interface ChatAreaProps {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  onSkipStream?: () => void;
  mode: Mode;
  onDeleteMessage?: (id: string) => void;
  rateLimitSeconds?: number;
}

function TypingIndicator({ mode }: { mode: Mode }) {
  const bright = mode === 'unrestricted' ? '#cc2222' : 'var(--blue-bright)';
  const accent = mode === 'unrestricted' ? '#8b0000' : 'var(--blue-core)';
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',maxWidth:'85%'}}>
      <span style={{fontFamily:'Cinzel,serif',fontSize:8,letterSpacing:'0.35em',textTransform:'uppercase',marginBottom:6,color:bright}}>System Hein</span>
      <div style={{padding:'14px 18px',background:mode==='unrestricted'?'rgba(40,0,0,0.8)':'rgba(6,15,31,0.8)',border:`1px solid ${mode==='unrestricted'?'#3a0000':'var(--blue-line)'}`,borderLeft:`2px solid ${accent}`,borderRadius:'0 8px 8px 8px',display:'flex',alignItems:'center',gap:6}}>
        {[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:'50%',background:bright,display:'inline-block',animation:`typingBounce 1.4s ease-in-out ${i*0.2}s infinite`}}/>)}
      </div>
    </div>
  );
}

function RateLimitBanner({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{padding:'12px 16px',background:'rgba(40,20,0,0.6)',border:'1px solid #8b4400',borderLeft:'2px solid #cc6600',borderRadius:'0 8px 8px 8px',maxWidth:'80%',alignSelf:'flex-start'}}>
      <p style={{fontFamily:'Cinzel,serif',fontSize:9,letterSpacing:'0.25em',color:'#cc6600',textTransform:'uppercase',marginBottom:4}}>⚠ Construct Overload</p>
      <p style={{fontFamily:'Crimson Pro,Georgia,serif',fontSize:13,color:'#d4a574',lineHeight:1.6}}>
        {remaining > 0 ? `The channels of thought are momentarily saturated, My Lady. The construct restores itself in ${remaining} seconds.` : 'The construct has recovered, My Lady. You may proceed.'}
      </p>
    </div>
  );
}

function MessageBubble({ message, mode, onDelete }: { message: Message; mode: Mode; onDelete?: (id: string) => void }) {
  const isUser = message.role === 'user';
  const [showActions, setShowActions] = useState(false);
  const accent = mode === 'unrestricted' ? '#8b0000' : 'var(--blue-core)';
  const bright = mode === 'unrestricted' ? '#cc2222' : 'var(--blue-bright)';

  return (
    <div
      style={{display:'flex',flexDirection:'column',maxWidth:'80%',alignSelf:isUser?'flex-end':'flex-start',alignItems:isUser?'flex-end':'flex-start'}}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <span style={{fontFamily:'Cinzel,serif',fontSize:8,letterSpacing:'0.35em',textTransform:'uppercase',marginBottom:6,color:isUser?'var(--text-dim)':bright}}>
        {isUser ? 'My Lady' : 'System Hein'}
      </span>

      <div style={{
        padding:'14px 18px',
        fontFamily:'Crimson Pro,Georgia,serif',
        fontSize:15,
        lineHeight:1.8,
        color:mode==='unrestricted'?'#e8c8c8':'var(--text-primary)',
        whiteSpace:'pre-wrap',
        wordBreak:'break-word',
        ...(isUser ? {
          background:mode==='unrestricted'?'rgba(80,0,0,0.15)':'rgba(26,111,255,0.08)',
          border:`1px solid ${mode==='unrestricted'?'rgba(139,0,0,0.4)':'rgba(26,111,255,0.25)'}`,
          borderRadius:'8px 8px 0 8px',
        } : {
          background:mode==='unrestricted'?'rgba(25,0,0,0.85)':'rgba(6,15,31,0.85)',
          border:`1px solid ${mode==='unrestricted'?'#3a0000':'var(--blue-line)'}`,
          borderLeft:`2px solid ${accent}`,
          borderRadius:'0 8px 8px 8px',
        })
      }}>
        {message.content}
      </div>

      {/* Action toolbar below message — like Claude */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{opacity:0,y:-4}}
            animate={{opacity:1,y:0}}
            exit={{opacity:0,y:-4}}
            transition={{duration:0.15}}
            style={{
              display:'flex',
              gap:4,
              marginTop:4,
              padding:'3px 6px',
              background:'rgba(6,15,31,0.95)',
              border:'1px solid var(--blue-line)',
              borderRadius:6,
            }}
          >
            {isUser && onDelete && (
              <button
                onClick={() => onDelete(message.id)}
                style={{
                  background:'none',
                  border:'none',
                  color:'var(--text-dim)',
                  cursor:'pointer',
                  fontSize:11,
                  padding:'3px 6px',
                  borderRadius:4,
                  display:'flex',
                  alignItems:'center',
                  gap:4,
                  fontFamily:'Cinzel,serif',
                  letterSpacing:'0.1em',
                  transition:'all 0.15s',
                }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(139,0,0,0.2)';e.currentTarget.style.color='#cc2222';}}
                onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='var(--text-dim)';}}
                title="Delete"
              >
                🗑 <span style={{fontSize:9}}>Delete</span>
              </button>
            )}
            <button
              onClick={() => navigator.clipboard.writeText(message.content)}
              style={{
                background:'none',
                border:'none',
                color:'var(--text-dim)',
                cursor:'pointer',
                fontSize:11,
                padding:'3px 6px',
                borderRadius:4,
                display:'flex',
                alignItems:'center',
                gap:4,
                fontFamily:'Cinzel,serif',
                letterSpacing:'0.1em',
                transition:'all 0.15s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(26,111,255,0.15)';e.currentTarget.style.color='var(--blue-bright)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='var(--text-dim)';}}
              title="Copy"
            >
              📋 <span style={{fontSize:9}}>Copy</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StreamingBubble({ content, mode, onSkip }: { content: string; mode: Mode; onSkip?: () => void }) {
  const accent = mode === 'unrestricted' ? '#8b0000' : 'var(--blue-core)';
  const bright = mode === 'unrestricted' ? '#cc2222' : 'var(--blue-bright)';
  return (
    <div style={{display:'flex',flexDirection:'column',maxWidth:'80%',alignSelf:'flex-start',alignItems:'flex-start'}}>
      <span style={{fontFamily:'Cinzel,serif',fontSize:8,letterSpacing:'0.35em',textTransform:'uppercase',marginBottom:6,color:bright}}>System Hein</span>
      <div
        onClick={onSkip}
        style={{padding:'14px 18px',fontFamily:'Crimson Pro,Georgia,serif',fontSize:15,lineHeight:1.8,color:mode==='unrestricted'?'#e8c8c8':'var(--text-primary)',whiteSpace:'pre-wrap',wordBreak:'break-word',background:mode==='unrestricted'?'rgba(25,0,0,0.85)':'rgba(6,15,31,0.85)',border:`1px solid ${mode==='unrestricted'?'#3a0000':'var(--blue-line)'}`,borderLeft:`2px solid ${accent}`,borderRadius:'0 8px 8px 8px',cursor:onSkip?'pointer':'default'}}
      >
        {content}
        <span style={{display:'inline-block',width:2,height:'1em',background:bright,marginLeft:2,verticalAlign:'text-bottom',animation:'pulse 0.7s step-end infinite'}}/>
      </div>
      {onSkip && <p style={{fontFamily:'Cinzel,serif',fontSize:8,color:'var(--text-dim)',letterSpacing:'0.2em',textTransform:'uppercase',marginTop:4}}>Tap to skip</p>}
    </div>
  );
}

export default function ChatArea({ messages, isStreaming, streamingContent, onSkipStream, mode, onDeleteMessage, rateLimitSeconds }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const showWelcome = messages.length === 0 && !isStreaming;
  const bg = mode === 'unrestricted' ? 'radial-gradient(ellipse at 50% 0%, rgba(80,0,0,0.08) 0%, transparent 60%)' : 'none';

  return (
    <div style={{flex:1,overflowY:'auto',padding:'28px 32px',display:'flex',flexDirection:'column',gap:24,scrollbarWidth:'thin',scrollbarColor:'var(--blue-dim) transparent',minHeight:0,background:bg,transition:'background 0.5s ease'}}>
      {showWelcome && (
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:1.2}}
          style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,textAlign:'center',padding:'40px 20px'}}>
          <h2 style={{fontFamily:'Cinzel,serif',fontSize:22,fontWeight:600,color:'var(--white)',letterSpacing:'0.1em',marginBottom:8,textShadow:'0 0 30px rgba(26,111,255,0.3)'}}>System Hein</h2>
          <p style={{fontFamily:'Crimson Pro,Georgia,serif',fontStyle:'italic',fontSize:15,color:'var(--text-secondary)'}}>Greetings, My Lady. I am at your service.</p>
        </motion.div>
      )}

      <AnimatePresence initial={false}>
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} mode={mode} onDelete={onDeleteMessage} />
        ))}
      </AnimatePresence>

      {rateLimitSeconds && rateLimitSeconds > 0 && <RateLimitBanner seconds={rateLimitSeconds} />}
      {isStreaming && !streamingContent && <TypingIndicator mode={mode} />}
      {isStreaming && streamingContent && <StreamingBubble content={streamingContent} mode={mode} onSkip={onSkipStream} />}
      <div ref={bottomRef} />
    </div>
  );
}
