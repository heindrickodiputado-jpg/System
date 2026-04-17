'use client';

import { useState, useRef, useEffect } from 'react';

interface PassphraseGateProps {
  onAuthenticated: () => void;
}

export default function PassphraseGate({ onAuthenticated }: PassphraseGateProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

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
    <div style={{position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-deep)',padding:20}}>
      <div className="grid-overlay" />
      <div className="scanline-overlay" />
      <div style={{position:'relative',width:'100%',maxWidth:440,zIndex:1}}>
        <div style={{position:'relative',background:'rgba(6,15,31,0.6)',backdropFilter:'blur(20px)',border:'1px solid rgba(26,111,255,0.2)',boxShadow:'0 8px 32px rgba(0,0,0,0.4)',padding:40}}>
          <div style={{position:'absolute',top:6,left:6,width:12,height:12,borderTop:'1px solid var(--blue-core)',borderLeft:'1px solid var(--blue-core)'}}/>
          <div style={{position:'absolute',top:6,right:6,width:12,height:12,borderTop:'1px solid var(--blue-core)',borderRight:'1px solid var(--blue-core)'}}/>
          <div style={{position:'absolute',bottom:6,left:6,width:12,height:12,borderBottom:'1px solid var(--blue-core)',borderLeft:'1px solid var(--blue-core)'}}/>
          <div style={{position:'absolute',bottom:6,right:6,width:12,height:12,borderBottom:'1px solid var(--blue-core)',borderRight:'1px solid var(--blue-core)'}}/>

          <h1 style={{fontFamily:'Cinzel,serif',fontSize:22,fontWeight:600,color:'var(--white)',letterSpacing:'0.1em',textAlign:'center',marginBottom:10}}>System Hein</h1>
          <p style={{fontFamily:'Crimson Pro,Georgia,serif',fontStyle:'italic',fontSize:14,color:'var(--text-secondary)',textAlign:'center',marginBottom:32,lineHeight:1.6}}>State the passphrase to initialize the construct.</p>

          <input
            ref={inputRef}
            type="password"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Enter passphrase..."
            style={{width:'100%',background:'rgba(6,15,31,0.9)',border:'1px solid var(--blue-line)',color:'var(--text-primary)',fontFamily:'Crimson Pro,Georgia,serif',fontSize:16,padding:'12px 16px',outline:'none',marginBottom:12,display:'block',boxSizing:'border-box'}}
          />

          {error && (
            <p style={{fontFamily:'Crimson Pro,Georgia,serif',fontStyle:'italic',fontSize:13,color:'#f87171',marginBottom:12,lineHeight:1.5}}>{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !value.trim()}
            style={{width:'100%',background:'rgba(26,111,255,0.1)',border:'1px solid var(--blue-core)',color:'var(--blue-bright)',fontFamily:'Cinzel,serif',fontSize:11,letterSpacing:'0.3em',padding:'14px 0',cursor:loading||!value.trim()?'not-allowed':'pointer',textTransform:'uppercase',opacity:loading||!value.trim()?0.4:1,display:'block',boxSizing:'border-box'}}
          >
            {loading ? 'Initializing...' : 'Initialize System Hein'}
          </button>
        </div>
      </div>
    </div>
  );
}
