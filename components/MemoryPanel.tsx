'use client';

import { useState, useEffect } from 'react';
import { Memory, MemoryStore } from '@/types';

interface MemoryPanelProps {
  isOpen: boolean;
  memories: MemoryStore;
  onClose: () => void;
  onAdd: (text: string) => Promise<boolean>;
  onDelete: (type: string, id: number) => void;
}

export default function MemoryPanel({ isOpen, memories, onClose, onAdd, onDelete }: MemoryPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [adding, setAdding] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted || !isOpen) return null;

  const handleAdd = async () => {
    if (!inputValue.trim() || adding) return;
    setAdding(true);
    const ok = await onAdd(inputValue.trim());
    if (ok) setInputValue('');
    setAdding(false);
  };

  const renderMemory = (m: Memory, isPinned: boolean) => (
    <div key={m.id} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(26,58,110,0.3)'}}>
      {isPinned && <span style={{fontFamily:'Cinzel,serif',fontSize:8,letterSpacing:'0.2em',color:'var(--gold)',border:'1px solid var(--gold)',padding:'2px 6px',flexShrink:0,textTransform:'uppercase'}}>Pinned</span>}
      <p style={{flex:1,fontFamily:'Crimson Pro,Georgia,serif',fontSize:13,color:'var(--text-primary)',lineHeight:1.5}}>{m.text}</p>
      <button onClick={() => onDelete(m.type, m.id)} style={{background:'none',border:'none',color:'var(--text-dim)',cursor:'pointer',fontSize:11,flexShrink:0,padding:'0 4px'}}>✕</button>
    </div>
  );

  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:9998,background:'rgba(2,8,16,0.92)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{position:'relative',width:'100%',maxWidth:560,maxHeight:'80vh',display:'flex',flexDirection:'column',border:'1px solid var(--gold)',background:'var(--bg-panel)'}}>
        <div style={{position:'absolute',top:6,left:6,width:12,height:12,borderTop:'1px solid var(--gold)',borderLeft:'1px solid var(--gold)'}}/>
        <div style={{position:'absolute',top:6,right:6,width:12,height:12,borderTop:'1px solid var(--gold)',borderRight:'1px solid var(--gold)'}}/>
        <div style={{position:'absolute',bottom:6,left:6,width:12,height:12,borderBottom:'1px solid var(--gold)',borderLeft:'1px solid var(--gold)'}}/>
        <div style={{position:'absolute',bottom:6,right:6,width:12,height:12,borderBottom:'1px solid var(--gold)',borderRight:'1px solid var(--gold)'}}/>
        <div style={{padding:'28px 28px 0',flexShrink:0}}>
          <h2 style={{fontFamily:'Cinzel,serif',fontSize:14,fontWeight:600,color:'var(--gold)',letterSpacing:'0.2em',textTransform:'uppercase',marginBottom:4}}>Memory Archive</h2>
          <p style={{fontFamily:'Crimson Pro,Georgia,serif',fontStyle:'italic',fontSize:12,color:'var(--text-secondary)',marginBottom:20}}>Everything System Hein knows about My Lady.</p>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'0 28px',scrollbarWidth:'thin'}}>
          <div style={{marginBottom:20}}>
            <div style={{fontFamily:'Cinzel,serif',fontSize:9,letterSpacing:'0.3em',color:'var(--text-dim)',textTransform:'uppercase',borderBottom:'1px solid var(--blue-line)',paddingBottom:6,marginBottom:12}}>Pinned Memories ({memories.pinned.length})</div>
            {memories.pinned.length === 0 ? <p style={{fontFamily:'Crimson Pro,Georgia,serif',fontStyle:'italic',fontSize:12,color:'var(--text-dim)',textAlign:'center',padding:'16px 0'}}>No pinned memories yet.</p> : memories.pinned.map(m => renderMemory(m, true))}
          </div>
          <div style={{marginBottom:20}}>
            <div style={{fontFamily:'Cinzel,serif',fontSize:9,letterSpacing:'0.3em',color:'var(--text-dim)',textTransform:'uppercase',borderBottom:'1px solid var(--blue-line)',paddingBottom:6,marginBottom:12}}>Auto-Learned ({memories.auto.length})</div>
            {memories.auto.length === 0 ? <p style={{fontFamily:'Crimson Pro,Georgia,serif',fontStyle:'italic',fontSize:12,color:'var(--text-dim)',textAlign:'center',padding:'16px 0'}}>Auto memories build after each session.</p> : memories.auto.map(m => renderMemory(m, false))}
          </div>
        </div>
        <div style={{padding:'16px 28px',flexShrink:0,borderTop:'1px solid var(--blue-line)'}}>
          <div style={{fontFamily:'Cinzel,serif',fontSize:9,letterSpacing:'0.3em',color:'var(--text-dim)',textTransform:'uppercase',marginBottom:10}}>Pin a Memory Manually</div>
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <input type="text" value={inputValue} onChange={e=>setInputValue(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAdd()} placeholder="e.g. She loves horror stories..." style={{flex:1,background:'rgba(6,15,31,0.9)',border:'1px solid var(--blue-line)',color:'var(--text-primary)',fontFamily:'Crimson Pro,Georgia,serif',fontSize:13,padding:'10px 14px',outline:'none'}}/>
            <button onClick={handleAdd} disabled={adding||!inputValue.trim()} style={{background:'rgba(201,168,76,0.1)',border:'1px solid var(--gold)',color:'var(--gold)',fontFamily:'Cinzel,serif',fontSize:9,letterSpacing:'0.2em',padding:'10px 14px',cursor:'pointer',textTransform:'uppercase',opacity:adding||!inputValue.trim()?0.4:1}}>Pin</button>
          </div>
          <button onClick={onClose} style={{width:'100%',border:'1px solid var(--blue-line)',color:'var(--text-secondary)',fontFamily:'Cinzel,serif',fontSize:9,letterSpacing:'0.3em',padding:'12px 0',cursor:'pointer',textTransform:'uppercase',background:'none'}}>Close Archive</button>
        </div>
      </div>
    </div>
  );
}
