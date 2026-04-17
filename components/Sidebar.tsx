'use client';

import { useEffect, useState } from 'react';
import { Session } from '@/types';

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

interface SidebarProps {
  sessions: Session[];
  currentSessionId: string | null;
  isOpen: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ sessions, currentSessionId, isOpen, onSelect, onDelete, onClose, isMobile = false }: SidebarProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const sessionList = (
    <div style={{flex:1,overflowY:'auto',padding:8,scrollbarWidth:'thin',scrollbarColor:'var(--blue-dim) transparent'}}>
      {sessions.length === 0
        ? <p style={{fontFamily:'Crimson Pro,Georgia,serif',fontStyle:'italic',fontSize:12,color:'var(--text-dim)',textAlign:'center',padding:20}}>No sessions yet.</p>
        : sessions.map(s => (
          <div key={s.id} onClick={() => { onSelect(s.id); onClose?.(); }}
            style={{padding:'10px 12px',marginBottom:4,cursor:'pointer',border:`1px solid ${s.id===currentSessionId?'var(--blue-core)':'transparent'}`,background:s.id===currentSessionId?'rgba(26,111,255,0.08)':'transparent',borderRadius:2,position:'relative'}}>
            <p style={{fontFamily:'Cinzel,serif',fontSize:10,letterSpacing:'0.1em',color:s.id===currentSessionId?'var(--blue-bright)':'var(--text-primary)',marginBottom:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',paddingRight:20}}>{s.title}</p>
            <p style={{fontFamily:'Crimson Pro,Georgia,serif',fontSize:10,color:'var(--text-dim)'}}>{formatTime(s.updated_at)}</p>
            <button onClick={e=>{e.stopPropagation();onDelete(s.id);}} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text-dim)',cursor:'pointer',fontSize:11}}>✕</button>
          </div>
        ))
      }
    </div>
  );

  if (isMobile) {
    if (!mounted || !isOpen) return null;
    return (
      <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:9997}}>
        <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.6)'}} />
        <div style={{position:'absolute',top:0,left:0,bottom:0,width:280,background:'var(--bg-mid)',borderRight:'1px solid var(--blue-line)',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid var(--blue-line)',flexShrink:0,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontFamily:'Cinzel,serif',fontSize:9,letterSpacing:'0.35em',color:'var(--text-dim)',textTransform:'uppercase'}}>Session History</span>
            <button onClick={onClose} style={{background:'none',border:'none',color:'var(--text-dim)',cursor:'pointer',fontSize:14}}>✕</button>
          </div>
          {sessionList}
        </div>
      </div>
    );
  }

  return (
    <div style={{width:isOpen?240:0,minWidth:isOpen?240:0,transition:'all 0.3s ease',overflow:'hidden',borderRight:isOpen?'1px solid var(--blue-line)':'none',background:'var(--bg-mid)',flexShrink:0,display:'flex',flexDirection:'column'}}>
      {isOpen && (
        <>
          <div style={{padding:'12px 14px',borderBottom:'1px solid var(--blue-line)',fontFamily:'Cinzel,serif',fontSize:9,letterSpacing:'0.35em',color:'var(--text-dim)',textTransform:'uppercase',flexShrink:0}}>Session History</div>
          {sessionList}
        </>
      )}
    </div>
  );
}
