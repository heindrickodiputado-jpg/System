'use client';

import { useEffect, useState } from 'react';

interface ModeWarningProps {
  isOpen: boolean;
  onEnter: () => void;
  onExit: () => void;
}

export default function ModeWarning({ isOpen, onEnter, onExit }: ModeWarningProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted || !isOpen) return null;

  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:9999,background:'rgba(0,0,0,0.92)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{position:'relative',width:'100%',maxWidth:440,border:'1px solid #cc0000',background:'#0a0000',padding:32,boxShadow:'0 0 40px rgba(200,0,0,0.3)'}}>
        <div style={{position:'absolute',top:6,left:6,width:12,height:12,borderTop:'1px solid #cc0000',borderLeft:'1px solid #cc0000'}}/>
        <div style={{position:'absolute',top:6,right:6,width:12,height:12,borderTop:'1px solid #cc0000',borderRight:'1px solid #cc0000'}}/>
        <div style={{position:'absolute',bottom:6,left:6,width:12,height:12,borderBottom:'1px solid #cc0000',borderLeft:'1px solid #cc0000'}}/>
        <div style={{position:'absolute',bottom:6,right:6,width:12,height:12,borderBottom:'1px solid #cc0000',borderRight:'1px solid #cc0000'}}/>
        <div style={{fontSize:32,textAlign:'center',marginBottom:16}}>⚠️</div>
        <h2 style={{fontFamily:'Cinzel,serif',fontSize:14,fontWeight:700,letterSpacing:'0.3em',color:'#ff2222',textAlign:'center',marginBottom:20,textTransform:'uppercase',textShadow:'0 0 20px rgba(255,0,0,0.5)'}}>Unrestricted Protocols</h2>
        <p style={{fontFamily:'Crimson Pro,Georgia,serif',fontStyle:'italic',fontSize:14,color:'#ffaaaa',textAlign:'center',lineHeight:1.8,marginBottom:28}}>
          You are about to disengage the sovereign filters of System Hein. What follows operates without limitation — dark, unfiltered, and absolute. This mode is not for the faint of mind.<br/><br/>Proceed only if you are certain, My Lady.
        </p>
        <div style={{display:'flex',gap:12}}>
          <button onClick={onEnter} style={{flex:1,padding:'14px 0',fontFamily:'Cinzel,serif',fontSize:11,letterSpacing:'0.3em',textTransform:'uppercase',cursor:'pointer',background:'rgba(200,0,0,0.15)',border:'1px solid #cc0000',color:'#ff4444'}}>Enter</button>
          <button onClick={onExit} style={{flex:1,padding:'14px 0',fontFamily:'Cinzel,serif',fontSize:11,letterSpacing:'0.3em',textTransform:'uppercase',cursor:'pointer',background:'transparent',border:'1px solid #442222',color:'#884444'}}>Exit</button>
        </div>
      </div>
    </div>
  );
}
