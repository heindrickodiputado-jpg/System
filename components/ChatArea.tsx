'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/types';

interface ChatAreaProps {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  onSkipStream?: () => void;
}

function TypingIndicator() {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',maxWidth:'85%'}}>
      <span style={{fontFamily:'Cinzel,serif',fontSize:8,letterSpacing:'0.35em',textTransform:'uppercase',marginBottom:6,color:'var(--blue-bright)'}}>System Hein</span>
      <div style={{padding:'14px 18px',background:'rgba(6,15,31,0.8)',border:'1px solid var(--blue-line)',borderLeft:'2px solid var(--blue-core)',borderRadius:'0 8px 8px 8px',display:'flex',alignItems:'center',gap:6}}>
        {[0,1,2].map(i => (
          <span key={i} style={{width:6,height:6,borderRadius:'50%',background:'var(--blue-bright)',display:'inline-block',animation:`typingBounce 1.4s ease-in-out ${i*0.2}s infinite`}}/>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{display:'flex',flexDirection:'column',maxWidth:'80%',alignSelf:isUser?'flex-end':'flex-start',alignItems:isUser?'flex-end':'flex-start'}}
    >
      <span style={{fontFamily:'Cinzel,serif',fontSize:8,letterSpacing:'0.35em',textTransform:'uppercase',marginBottom:6,color:isUser?'var(--text-dim)':'var(--blue-bright)'}}>
        {isUser ? 'My Lady' : 'System Hein'}
      </span>
      <div style={{
        padding:'14px 18px',
        fontFamily:'Crimson Pro,Georgia,serif',
        fontSize:15,
        lineHeight:1.8,
        color:'var(--text-primary)',
        whiteSpace:'pre-wrap',
        wordBreak:'break-word',
        ...(isUser ? {
          background:'rgba(26,111,255,0.08)',
          border:'1px solid rgba(26,111,255,0.25)',
          borderRadius:'8px 8px 0 8px',
        } : {
          background:'rgba(6,15,31,0.85)',
          border:'1px solid var(--blue-line)',
          borderLeft:'2px solid var(--blue-core)',
          borderRadius:'0 8px 8px 8px',
        })
      }}>
        {message.content}
      </div>
    </motion.div>
  );
}

function StreamingBubble({ content }: { content: string }) {
  return (
    <div style={{display:'flex',flexDirection:'column',maxWidth:'80%',alignSelf:'flex-start',alignItems:'flex-start'}}>
      <span style={{fontFamily:'Cinzel,serif',fontSize:8,letterSpacing:'0.35em',textTransform:'uppercase',marginBottom:6,color:'var(--blue-bright)'}}>System Hein</span>
      <div style={{padding:'14px 18px',fontFamily:'Crimson Pro,Georgia,serif',fontSize:15,lineHeight:1.8,color:'var(--text-primary)',whiteSpace:'pre-wrap',wordBreak:'break-word',background:'rgba(6,15,31,0.85)',border:'1px solid var(--blue-line)',borderLeft:'2px solid var(--blue-core)',borderRadius:'0 8px 8px 8px'}}>
        {content}
        <span style={{display:'inline-block',width:2,height:'1em',background:'var(--blue-bright)',marginLeft:2,verticalAlign:'text-bottom',animation:'pulse 0.7s step-end infinite'}}/>
      </div>
    </div>
  );
}

export default function ChatArea({ messages, isStreaming, streamingContent, onSkipStream }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const showWelcome = messages.length === 0 && !isStreaming;

  return (
    <div
      onClick={isStreaming ? onSkipStream : undefined}
      style={{flex:1,overflowY:'auto',padding:'28px 32px',display:'flex',flexDirection:'column',gap:24,scrollbarWidth:'thin',scrollbarColor:'var(--blue-dim) transparent',minHeight:0,cursor:isStreaming?'pointer':'default'}}
    >
      {showWelcome && (
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:1.2}}
          style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,textAlign:'center',padding:'40px 20px'}}>
          <h2 style={{fontFamily:'Cinzel,serif',fontSize:22,fontWeight:600,color:'var(--white)',letterSpacing:'0.1em',marginBottom:8,textShadow:'0 0 30px rgba(26,111,255,0.3)'}}>System Hein</h2>
          <p style={{fontFamily:'Crimson Pro,Georgia,serif',fontStyle:'italic',fontSize:15,color:'var(--text-secondary)'}}>Greetings, My Lady. I am at your service.</p>
        </motion.div>
      )}

      <AnimatePresence initial={false}>
        {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
      </AnimatePresence>

      {isStreaming && !streamingContent && <TypingIndicator />}
      {isStreaming && streamingContent && <StreamingBubble content={streamingContent} />}
      <div ref={bottomRef} />
    </div>
  );
}
