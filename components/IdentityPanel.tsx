'use client';

import Image from 'next/image';
import { Mode } from '@/types';

interface IdentityPanelProps {
  mode: Mode;
  memoryCount: number;
}

export default function IdentityPanel({ mode, memoryCount }: IdentityPanelProps) {
  return (
    <>
      <style>{`
        .identity-panel-wrapper {
          display: none;
        }
        @media (min-width: 1024px) {
          .identity-panel-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 210px;
            min-width: 210px;
            padding: 24px 14px 18px;
            border-right: 1px solid var(--blue-line);
            background: linear-gradient(180deg, rgba(6,15,31,0.9) 0%, rgba(2,8,16,0.95) 100%);
            position: relative;
            overflow: hidden;
            flex-shrink: 0;
          }
        }
      `}</style>
      <div className="identity-panel-wrapper">
        <div style={{position:'absolute',top:0,left:0,right:0,height:160,background:'radial-gradient(ellipse at 50% 0%, rgba(26,111,255,0.08) 0%, transparent 70%)',pointerEvents:'none'}} />
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />

        <div style={{position:'relative',width:100,height:100,marginBottom:14}}>
          <div style={{position:'absolute',inset:-8,borderRadius:'50%',border:'1px solid rgba(26,111,255,0.3)',animation:'ringRotate 12s linear infinite'}}>
            <div style={{position:'absolute',width:4,height:4,borderRadius:'50%',background:'var(--blue-bright)',top:-2,left:'50%',transform:'translateX(-50%)',boxShadow:'0 0 8px var(--blue-core)'}} />
          </div>
          <div style={{position:'absolute',inset:0,borderRadius:'50%',background:'radial-gradient(circle, rgba(26,111,255,0.15) 0%, transparent 70%)',animation:'glowPulse 3s ease-in-out infinite',pointerEvents:'none'}} />
          <Image src="/chibi.jpg" alt="System Hein" width={100} height={100} style={{borderRadius:'50%',objectFit:'cover',objectPosition:'center top',border:'2px solid var(--blue-dim)',boxShadow:'0 0 20px rgba(26,111,255,0.2)',filter:'saturate(0.9) brightness(0.95)'}} />
        </div>

        <h2 style={{fontFamily:'Cinzel,serif',fontSize:13,fontWeight:700,letterSpacing:'0.15em',color:'var(--white)',textAlign:'center',marginBottom:3,textShadow:'0 0 20px rgba(26,111,255,0.4)'}}>SYSTEM HEIN</h2>
        <p style={{fontFamily:'Cinzel,serif',fontSize:8,letterSpacing:'0.35em',color:'var(--blue-bright)',textAlign:'center',marginBottom:16,textTransform:'uppercase'}}>Sovereign Construct</p>

        <div style={{width:'100%',height:1,background:'linear-gradient(90deg, transparent, var(--blue-line), transparent)',margin:'10px 0'}} />

        {[
          {label:'Status',value:'Online',color:'var(--blue-bright)'},
          {label:'Mode',value:mode==='sovereign'?'Sovereign':'Unrestricted',color:mode==='sovereign'?'var(--blue-bright)':'#f87171'},
          {label:'Loyalty',value:'Absolute',color:'var(--blue-bright)'},
          {label:'Alignment',value:'Heinry',color:'var(--blue-bright)'},
          {label:'Memories',value:String(memoryCount),color:'var(--gold)'},
        ].map(({label,value,color})=>(
          <div key={label} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'4px 0'}}>
            <span style={{fontFamily:'Cinzel,serif',fontSize:8,letterSpacing:'0.25em',color:'var(--text-dim)',textTransform:'uppercase'}}>{label}</span>
            <span style={{fontFamily:'Crimson Pro,Georgia,serif',fontSize:11,color,letterSpacing:'0.1em'}}>{value}</span>
          </div>
        ))}

        <div style={{width:'100%',height:1,background:'linear-gradient(90deg, transparent, var(--blue-line), transparent)',margin:'10px 0'}} />

        <p style={{marginTop:'auto',fontFamily:'Crimson Pro,Georgia,serif',fontStyle:'italic',fontSize:11,color:'var(--text-secondary)',textAlign:'center',lineHeight:1.6,borderLeft:'2px solid var(--blue-dim)',paddingLeft:10}}>
          Greetings, My Lady.<br/>State your query.
        </p>
      </div>
    </>
  );
}
