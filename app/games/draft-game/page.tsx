'use client';
import { useState, useCallback, useEffect, useRef} from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
/* ─── Types ─────────────────────────────────────────────────────────── */
type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
type Phase = 'intro' | 'setup' | 'packing' | 'complete';
interface Player { id:string; name:string; pos:string; team:string; score:number; rarity:Rarity; accolades:string[]; }
/* ─── Rarity config ──────────────────────────────────────────────────── */
const RC: Record<Rarity,{label:string;color:string;glow:string;art:string;shimmer:string}> = {
common: {label:'COMMON', color:'#e8a060',glow:'rgba(232,160,96,.7)', art:'linear-gradient(150deg,#3d2210,#7a4820)',shimmer:'#c97c3a'},
rare: {label:'RARE', color:'#42c0f8',glow:'rgba(66,192,248,.75)', art:'linear-gradient(150deg,#062840,#104870)',shimmer:'#2890d8'},
epic: {label:'EPIC', color:'#ffd700',glow:'rgba(255,215,0,.85)', art:'linear-gradient(150deg,#3a2800,#806010)',shimmer:'#c8a020'},
legendary: {label:'LEGENDARY', color:'#e040ff',glow:'rgba(224,64,255,.9)', art:'linear-gradient(150deg,#280048,#6010b0)',shimmer:'#c020f0'},
};
function parseCSVRow(row:string):string[] {
const cols:string[]=[]; let cur=''; let inQ=false;
for(const c of row){ if(c==='"'){inQ=!inQ;continue;} if(c===','&&!inQ){cols.push(cur.trim());cur='';continue;} cur+=c; }
cols.push(cur.trim()); return cols;
}
/* ─── Player Pools — imported from vol files ────────────────────────── */
import { ALL_PLAYERS } from '@/lib/current-offense';
import { ALL_PLAYERS_V2 } from '@/lib/current-offense-vol2';
import { ALL_PLAYERS_V3 } from '@/lib/current-offense-vol3';
import { ALL_PLAYERS_V4 } from '@/lib/current-offense-vol4';
import { ALL_PLAYERS_V5 } from '@/lib/current-offense-vol5';
const POOL: Record<string, Player[]> = (() => {
const keys = ['QB','RB','WR','TE','OT','OG','C'] as const;
return Object.fromEntries(keys.map(k => [k, [
...ALL_PLAYERS[k],
...ALL_PLAYERS_V2[k],
...ALL_PLAYERS_V3[k],
...ALL_PLAYERS_V4[k],
...ALL_PLAYERS_V5[k],
  ]]));
})() as Record<string, Player[]>;
/* ─── Slots ──────────────────────────────────────────────────────────── */
const SLOTS = [
  {key:'QB', label:'Quarterback', short:'QB', pool:'QB'},
  {key:'RB', label:'Running Back', short:'HB', pool:'RB'},
  {key:'WR1',label:'Wide Receiver', short:'WR', pool:'WR'},
  {key:'WR2',label:'Wide Receiver', short:'WR', pool:'WR'},
  {key:'WR3',label:'Wide Receiver', short:'WR', pool:'WR'},
  {key:'TE', label:'Tight End', short:'TE', pool:'TE'},
  {key:'LT', label:'Left Tackle', short:'LT', pool:'OT'},
  {key:'LG', label:'Left Guard', short:'LG', pool:'OG'},
  {key:'C', label:'Center', short:'C', pool:'C' },
  {key:'RG', label:'Right Guard', short:'RG', pool:'OG'},
  {key:'RT', label:'Right Tackle', short:'RT', pool:'OT'},
] as const;
const OL_ROW = [6,7,8,9,10];
const WR_LEFT = [2,3];
const WR_RIGHT= [5,4];
const QB_ROW = [0,1];
/* Pack cover images — place at public/pack-covers/ */
const PACK_IMG: Record<string,string> = {
QB:'/pack-covers/tombrady.png',
RB:'/pack-covers/toddgurley.png',
WR:'/pack-covers/julio.png',
TE:'/pack-covers/gronk.png',
OT:'/pack-covers/trentwilliams.png',
OG:'/pack-covers/zackmartin.png',
C: '/pack-covers/jasonkelce.png',
};
const POS_LABEL: Record<string,string> = {
QB:'QUARTERBACK',RB:'RUNNING BACK',WR:'WIDE RECEIVER',
TE:'TIGHT END',OT:'O-LINEMAN',OG:'O-LINEMAN',C:'CENTER',
};
/* ─── Tiers ──────────────────────────────────────────────────────────── */
const TIERS = [
  {min:20001,label:'GOAT OFFENSE', icon:'🐐',color:'#e040ff'},
  {min:17001,label:'HALL OF FAME', icon:'🏛️',color:'#ffd700'},
  {min:14001,label:'SUPER BOWL DYNASTY', icon:'🏆',color:'#f0c030'},
  {min:11001,label:'ALL-PRO ELITE', icon:'⭐',color:'#42c0f8'},
  {min:8001, label:'PRO BOWL CALIBER', icon:'🔥',color:'#50d870'},
  {min:5001, label:'STARTER QUALITY', icon:'📈',color:'#a0b8d0'},
  {min:2001, label:'BACKUP UNIT', icon:'📋',color:'#808080'},
  {min:0, label:'PRACTICE SQUAD', icon:'🏈',color:'#e8a060'},
];
function getTier(s:number){return TIERS.find(t=>s>=t.min)!;}
/* ─── Pack weights ───────────────────────────────────────────────────── */
const WEIGHTS = {
  normal: {common:62,rare:26,epic:10,legendary:2},
  captain:{common:12,rare:26,epic:44,legendary:18},
};
function weightedDraw(poolKey:string,count:number,isCaptain:boolean,excl:string[]):Player[]{
const avail=(POOL[poolKey]??[]).filter(p=>!excl.includes(p.id));
const wm=isCaptain?WEIGHTS.captain:WEIGHTS.normal;
const weighted=avail.map(p=>({p,w:wm[p.rarity]}));
const used=new Set<string>();
const result:Player[]=[];
for(let i=0;i<Math.min(count,weighted.length);i++){
const el=weighted.filter(x=>!used.has(x.p.id));
const tot=el.reduce((s,x)=>s+x.w,0);
let r=Math.random()*tot;
for(const item of el){r-=item.w;if(r<=0){result.push(item.p);used.add(item.p.id);break;}}
  }
return result;
}
/* ══════════════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════════════ */
export default function OffensePackEmpire() {
const [phase,setPhase] = useState<Phase>('intro');
const [isReturning,setIsRet] = useState(false);
const [lineup,setLineup] = useState<(Player|null)[]>(Array(11).fill(null));
const [captainSi,setCaptainSi] = useState<number|null>(null);
const [packSi,setPackSi] = useState<number|null>(null);
const [packCards,setPackCards] = useState<Player[]>([]);
const [revealed,setRevealed] = useState<boolean[]>([]);
const [pickedId,setPickedId] = useState<string|null>(null);
const [legFlash,setLegFlash] = useState(false);
const [showHow,setShowHow] = useState(false);
const [showAuth,setShowAuth] = useState(false);
const [userInit,setUserInit] = useState<string|null>(null);
const [copied,setCopied] = useState(false);
const [imageMap,setImageMap] = useState<Record<string,string>>({});
const cardsRef = useRef<HTMLDivElement>(null);
useEffect(()=>{
createClient().auth.getUser().then(({data:{user}})=>{
if(user){const n=user.user_metadata?.full_name||user.email||'U';setUserInit(n[0].toUpperCase());}
    });
try{if(localStorage.getItem('pe-has-played'))setIsRet(true);}catch{}
fetch('/players.csv').then(r=>r.ok?r.text():Promise.reject()).then(text=>{
const map:Record<string,string>={};
text.split('\n').forEach(line=>{
if(!line.trim())return;
const cols=parseCSVRow(line);
const name=cols[1];const url=cols[22];
if(name&&url&&url.startsWith('http'))map[name]=url;
      });
setImageMap(map);
    }).catch(()=>{});
  },[]);
const markPlayed=useCallback(()=>{try{localStorage.setItem('pe-has-played','1');}catch{}},[]);
const totalScore = lineup.reduce((s,p)=>s+(p?.score??0),0);
const filled = lineup.filter(Boolean).length;
const tier = getTier(totalScore);
const isBusy = packCards.length>0;
const hiddenCount= revealed.filter(r=>!r).length;
const anyRevealed= revealed.some(Boolean);
const openPack=useCallback((si:number,isCaptain:boolean,curLineup:(Player|null)[])=>{
const pool=SLOTS[si].pool;
const excl=curLineup.filter(Boolean).map(p=>p!.id);
const cards=weightedDraw(pool,5,isCaptain,excl);
setPackSi(si);setPackCards(cards);
setRevealed(Array(cards.length).fill(false));setPickedId(null);
setTimeout(()=>{ cardsRef.current?.scrollIntoView({behavior:'smooth',block:'start'}); },80);
  },[]);
const selectCaptain=useCallback((si:number)=>{
setCaptainSi(si);setPhase('packing');markPlayed();
  },[markPlayed]);
const clickSlot=useCallback((si:number)=>{
if(isBusy||pickedId!==null)return;
openPack(si,si===captainSi,lineup);
  },[isBusy,pickedId,captainSi,lineup,openPack]);
const revealOne=useCallback((i:number)=>{
setRevealed(prev=>{const n=[...prev];n[i]=true;return n;});
if(packCards[i]?.rarity==='legendary')
setTimeout(()=>{setLegFlash(true);setTimeout(()=>setLegFlash(false),2400);},200);
  },[packCards]);
const revealAll=useCallback(()=>{
packCards.forEach((_,i)=>{
if(!revealed[i])setTimeout(()=>{
setRevealed(prev=>{const n=[...prev];n[i]=true;return n;});
if(packCards[i]?.rarity==='legendary')
setTimeout(()=>{setLegFlash(true);setTimeout(()=>setLegFlash(false),2400);},300);
      },i*130);
    });
  },[packCards,revealed]);
const handleCardClick=useCallback((i:number)=>{
if(pickedId)return;
if(!revealed[i]){revealOne(i);return;}
const card=packCards[i];
setPickedId(card.id);
setTimeout(()=>{
setLineup(prev=>{
const n=[...prev];n[packSi!]=card;
if(n.filter(Boolean).length===11){
setPhase('complete');
if(!userInit)setTimeout(()=>setShowAuth(true),1600);
        }
return n;
      });
setPackCards([]);setRevealed([]);setPickedId(null);setPackSi(null);
    },650);
  },[pickedId,revealed,revealOne,packCards,packSi,userInit]);
const reset=useCallback(()=>{
setPhase('setup');setLineup(Array(11).fill(null));
setCaptainSi(null);setPackSi(null);
setPackCards([]);setRevealed([]);setPickedId(null);setLegFlash(false);
  },[]);
const share=useCallback(()=>{
const txt=['🏈 Offense Pack Empire',`${tier.icon} ${tier.label} — ${totalScore.toLocaleString()} pts`,'',
...SLOTS.map((s,i)=>{const p=lineup[i];return p?`${s.short}: ${p.name} (${p.score})`:`${s.short}: Empty`;})
    ].join('\n');
navigator.clipboard?.writeText(txt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
  },[tier,totalScore,lineup]);
/* ════════════════════════════════════════════════════════
     FORMATION SLOT — packs are now pure image (no inner box)
  ════════════════════════════════════════════════════════ */
const FSlot=({si,isSetup=false}:{si:number;isSetup?:boolean})=>{
const player = lineup[si];
const isAct = packSi===si;
const isCap = captainSi===si;
const canOpen = !player&&!isAct&&!isBusy&&phase==='packing';
const rc = player?RC[player.rarity]:null;
const imgSrc = player?imageMap[player.name]:undefined;
const packImg = PACK_IMG[SLOTS[si].pool];
const isHB = si === 1; // for slight depth offset
const clickable = isSetup || canOpen;
return(
<div className={`pe-slot-outer${isHB ? ' hb-back' : ''}`}>
        {player ? (
/* ── FILLED: rarity mini-card (box stays for filled slots) ── */
<div className="pe-fsl has-p"
            style={{'--rc':rc!.color,'--rg':rc!.glow,'--art':rc!.art} as React.CSSProperties}>
<div className="pe-filled-card">
<div className="pe-fc-topbar" style={{background:rc!.color}}/>
<div className="pe-fc-art" style={{background:rc!.art}}>
  <div className="pe-fc-field-lines"/>  {/* ← add this */}
  {rc!.label==='LEGENDARY'&&<div className="pe-fc-holo"/>}
  {rc!.label==='EPIC'&&<div className="pe-fc-epic-g"/>}
  {imgSrc&&<img src={imgSrc} alt={player.name} className="pe-fc-img"
    onError={e=>(e.currentTarget.style.display='none')}/>}
  <div className="pe-fc-initial">{player.name.charAt(0)}</div>
</div>
<div className="pe-fc-info">
<div className="pe-fc-name" style={{color:rc!.color}}>
                  {player.name.split(' ').slice(-1)[0]}
</div>
<div className="pe-fc-score">{player.score.toLocaleString()}</div>
<div className="pe-fc-rar" style={{color:rc!.color}}>{rc!.label}</div>
</div>
              {isCap&&<div className="pe-fc-cap-badge">⚡</div>}
<div className="pe-fc-shine"/>
</div>
</div>
        ) : isAct ? (
/* ── ACTIVE: opening spinner ── */
<div className="pe-fsl active">
<div className="pe-fsl-locked">
<div className="pe-fsl-pos-small">{SLOTS[si].short}</div>
<div className="pe-fsl-opening">…</div>
</div>
</div>
/* ── Inside the FSlot component ── */
) : (
  <div
    className={`pe-pack-wrap ${isCap ? 'is-cap' : ''} ${clickable ? 'clickable' : ''}`}
    onClick={() => isSetup ? selectCaptain(si) : canOpen ? clickSlot(si) : undefined}
    role={clickable ? 'button' : undefined}
    tabIndex={clickable ? 0 : undefined}
  >
    <img
      src={packImg}
      alt={SLOTS[si].short}
      className="pe-pack-img"
    />
    {isCap && <div className="pe-pack-cap-badge">⚡ CAPTAIN</div>}
  </div>
)}
        {/* Label below */}
<div className={`pe-slot-label${isCap&&!player?' cap':''}`}>
          {isCap&&!player?'⚡ '+SLOTS[si].short:SLOTS[si].short}
</div>
</div>
    );
  };
/* Formation rows helper */
const FormRow=({indices,isSetup=false}:{indices:number[];isSetup?:boolean})=>(
<div className="pe-form-row">
      {indices.map(si=><FSlot key={SLOTS[si].key} si={si} isSetup={isSetup}/>)}
</div>
  );
/* Full field layout */
const FieldLayout=({isSetup=false}:{isSetup?:boolean})=>(
<div className="pe-field">
      {/* OL — line of scrimmage */}
<FormRow indices={OL_ROW} isSetup={isSetup}/>
      {/* WR/TE spread — wider than before, extends further outward */}
<div className="pe-skill-spread">
<div className="pe-skill-side">
          {WR_LEFT.map(si=><FSlot key={SLOTS[si].key} si={si} isSetup={isSetup}/>)}
</div>
<div className="pe-skill-side">
          {WR_RIGHT.map(si=><FSlot key={SLOTS[si].key} si={si} isSetup={isSetup}/>)}
</div>
</div>
      {/* QB + HB backfield (HB offset slightly deeper) */}
<FormRow indices={QB_ROW} isSetup={isSetup}/>
</div>
  );
/* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
return(
<>
<style dangerouslySetInnerHTML={{__html:STYLES}}/>
      {legFlash&&(
<div className="pe-leg-flash" aria-hidden="true">
<div className="pe-leg-text">💎 LEGENDARY PULL!</div>
</div>
      )}
<nav className="pe-nav">
<div className="pe-nav-l"><Link href="/" className="pe-back">← Hub</Link></div>
<div className="pe-nav-c"><span className="pe-pip"/>PACK EMPIRE</div>
<div className="pe-nav-r">
          {userInit?<Link href="/profile" className="pe-nb">{userInit}</Link>
:<Link href="/login" className="pe-si">SIGN IN</Link>}
</div>
</nav>
      {(phase==='packing'||phase==='complete')&&(
<div className="pe-strip">
<div className="pe-sg"><div className="pe-sv" style={{color:tier.color}}>{totalScore.toLocaleString()}</div><div className="pe-sl">ACCOLADES</div></div>
<div className="pe-sdiv"/>
<div className="pe-sg"><div className="pe-sv">{filled}<span className="pe-sof">/11</span></div><div className="pe-sl">FILLED</div></div>
<div className="pe-sdiv"/>
<div className="pe-sg"><div className="pe-stier" style={{color:tier.color}}>{tier.icon} {tier.label}</div><div className="pe-sl">TIER</div></div>
<div className="pe-sbar"><div className="pe-sfill" style={{width:`${(filled/11)*100}%`}}/></div>
</div>
      )}
<div className="pe-root">
        {/* ════ INTRO ════ */}
        {phase==='intro'&&(
<div className="pe-intro">
<div className="pe-intro-hero">
<div className="pe-ih-sup">NFL</div>
<div className="pe-ih-title">OFFENSE PACK<br/>EMPIRE</div>
<div className="pe-ih-sub">Build your ultimate NFL offense by opening card packs</div>
</div>
            {isReturning?(
<div className="pe-intro-ret">
<div className="pe-ir-title">WELCOME BACK, COACH</div>
<div className="pe-ir-sub">Ready to build another lineup?</div>
<button className="pe-play-btn" onClick={()=>setPhase('setup')}>LET'S RUN IT BACK →</button>
<button className="pe-rules-btn" onClick={()=>setShowHow(true)}>See the rules again</button>
</div>
            ):(
<div className="pe-intro-new">
<div className="pe-rules-preview">
                  {[
                    {icon:'⚡',title:'Pick Your Captain',text:'Click any position to make it your CAPTAIN. Captain packs have 18× higher legendary odds.'},
                    {icon:'📦',title:'Open Packs Your Way',text:'Fill all 11 positions by opening packs in any order you choose — captain last if you dare.'},
                    {icon:'🃏',title:'Reveal & Pick',text:'Cards start face-down. Click to flip each one, or Reveal All. Then tap the card you want.'},
                    {icon:'🏆',title:'Build Your Empire',text:'Your Accolades Score determines your Offense Tier. Stack legendaries to reach GOAT status (20,000+).'},
                  ].map((r,i)=>(
<div key={i} className="pe-irp-row">
<div className="pe-irp-icon">{r.icon}</div>
<div><div className="pe-irp-title">{r.title}</div><div className="pe-irp-text">{r.text}</div></div>
</div>
                  ))}
</div>
<button className="pe-play-btn" onClick={()=>{markPlayed();setPhase('setup');}}>BUILD MY OFFENSE →</button>
</div>
            )}
</div>
        )}
        {/* ════ SETUP ════ */}
        {phase==='setup'&&(
<div className="pe-setup">
<div className="pe-setup-hero">
<div className="pe-hero-sup">BUILD YOUR</div>
<div className="pe-hero-title">ULTIMATE<br/>OFFENSE</div>
<div className="pe-hero-sub">Open packs · Draft legends · Build your empire</div>
</div>
<div className="pe-setup-inst">
<span className="pe-inst-bolt">⚡</span>
              Tap any position to set it as your <strong>CAPTAIN</strong>
<span className="pe-inst-note"> — captain packs have 18× legendary odds</span>
</div>
<div className="pe-setup-field">
<FieldLayout isSetup/>
</div>
<button className="pe-how-link" onClick={()=>setShowHow(true)}>📋 How to Play</button>
</div>
        )}
        {/* ════ PACKING ════ */}
        {phase==='packing'&&(
<div className="pe-packing">
<div className="pe-formation-wrap">
              {captainSi!==null&&!lineup[captainSi]&&(
<div className="pe-cap-banner">
<span className="pe-cap-bolt">⚡</span>
<span className="pe-cap-txt">
                    {POS_LABEL[SLOTS[captainSi].pool]} is your CAPTAIN — 18% legendary odds when you open it
</span>
<span className="pe-cap-bolt">⚡</span>
</div>
              )}
<FieldLayout/>
</div>
            {/* Cards */}
            {packCards.length>0&&(
<div className="pe-cards-area" ref={cardsRef}>
<div className="pe-ca-header">
                  {packSi===captainSi&&<div className="pe-cap-tag">⚡ CAPTAIN PACK — 18% LEGENDARY ODDS</div>}
<div className="pe-ca-pos">{packSi!==null?SLOTS[packSi].label.toUpperCase():''}</div>
<div className="pe-ca-status">
                    {pickedId?'✓ Player drafted!'
:anyRevealed?`${revealed.filter(Boolean).length}/5 revealed · tap a card to PICK`
:'Tap cards to reveal · or use REVEAL ALL'}
</div>
</div>
<div className="pe-cards-row">
                  {packCards.map((card,i)=>{
const rc=RC[card.rarity];
const isRev=revealed[i];
const isPick=pickedId===card.id;
const isRej=!!pickedId&&pickedId!==card.id;
const imgSrc=imageMap[card.name];
return(
<div key={card.id+i}
                        className={`pe-card${isRev?' rev':''}${isPick?' picked':''}${isRej?' rejected':''}${isRev&&!pickedId?' selectable':''}`}
                        onClick={()=>handleCardClick(i)}
                        style={{'--rc':rc.color,'--rg':rc.glow,'--art':rc.art,'--sh':rc.shimmer} as React.CSSProperties}
>
<div className="pe-ci">
<div className="pe-card-back">
<div className="pe-back-grid"/>
<div className="pe-back-icon">🏈</div>
<div className="pe-back-label">CLICK TO REVEAL</div>
</div>
<div className="pe-card-front">
<div className="pe-cf-topbar">
<div className="pe-cf-pos" style={{background:rc.color}}>{card.pos}</div>
<div className={`pe-cf-rlab ${card.rarity}`}>{rc.label}</div>
</div>
<div className="pe-cf-art" style={{background:rc.art}}>
                              {imgSrc&&<img src={imgSrc} alt={card.name} className="pe-cf-img"
                                onError={e=>(e.currentTarget.style.display='none')}/>}
<div className="pe-cf-initial">{card.name.charAt(0)}</div>
                              {card.rarity==='legendary'&&<div className="pe-holo"/>}
                              {card.rarity==='epic'&&<div className="pe-epic-g"/>}
</div>
<div className="pe-cf-body">
<div className="pe-cf-name">{card.name}</div>
<div className="pe-cf-team">{card.team}</div>
<div className="pe-cf-line" style={{background:rc.color}}/>
<div className="pe-cf-score-row">
<div className="pe-cf-score" style={{color:rc.color}}>{card.score.toLocaleString()}</div>
<div className="pe-cf-ovr">OVR</div>
</div>
                              {card.accolades.slice(0,2).map((a,j)=><div key={j} className="pe-cf-acc">· {a}</div>)}
</div>
</div>
</div>
</div>
                    );
                  })}
</div>
                {!pickedId&&hiddenCount>0&&(
<div className="pe-reveal-bar">
<button className="pe-reveal-btn" onClick={revealAll}>REVEAL ALL {hiddenCount} REMAINING</button>
</div>
                )}
</div>
            )}
            {!isBusy&&filled<11&&(
<div className="pe-empty-prompt">
<div className="pe-ep-arrow">↑</div>
<div className="pe-ep-text">Tap any pack above to draft your player</div>
<div className="pe-ep-sub">{11-filled} of 11 positions remaining</div>
</div>
            )}
</div>
        )}
        {/* ════ COMPLETE ════ */}
        {phase==='complete'&&(
<div className="pe-complete">
<div className="pe-comp-hdr">
<div className="pe-ch-icon">{tier.icon}</div>
<div className="pe-ch-sup">LINEUP COMPLETE</div>
<div className="pe-ch-tier" style={{color:tier.color}}>{tier.label}</div>
<div className="pe-ch-score">{totalScore.toLocaleString()}</div>
<div className="pe-ch-lbl">TOTAL ACCOLADES</div>
</div>
<div className="pe-comp-field-wrap"><FieldLayout/></div>
<div className="pe-tier-card">
              {[...TIERS].reverse().map(t=>{
const reached=totalScore>=t.min;
const isCurrent=getTier(totalScore)===t;
return(
<div key={t.label} className={`pe-tier-row${isCurrent?' active':''}`}>
<span className="pe-tr-ic">{t.icon}</span>
<span className="pe-tr-lbl" style={{color:t.color}}>{t.label}</span>
<span className="pe-tr-min">{t.min.toLocaleString()}+</span>
                    {reached&&<span className="pe-tr-ck" style={{color:t.color}}>✓</span>}
</div>
                );
              })}
</div>
<div className="pe-comp-btns">
<button className="pe-share-btn" onClick={share}>{copied?'✓ Copied!':'↗ Share'}</button>
<button className="pe-restart-btn" onClick={reset}>↺ New Draft</button>
</div>
            {!userInit&&<button className="pe-save-link" onClick={()=>setShowAuth(true)}>Save your lineup & scores →</button>}
</div>
        )}
</div>
      {/* How to Play */}
      {showHow&&(
<div className="pe-overlay" onClick={()=>setShowHow(false)}>
<div className="pe-howto" onClick={e=>e.stopPropagation()}>
<div className="pe-ht-title">🏈 HOW TO PLAY</div>
            {['Tap any position to set it as your CAPTAIN. Captain packs have 18% legendary odds vs only 2% in normal packs.',
'Once you pick a captain the packing phase begins. Tap any position pack to open it — captain last if you dare.',
'Each pack deals 5 face-down cards. Tap individual cards to flip them, or hit Reveal All.',
'Once a card is flipped, tap it to PICK that player for the position.',
'Fill all 11 positions to see your final Offense Tier. You need 20,000+ points for GOAT Offense!',
            ].map((rule,i)=>(
<div key={i} className="pe-ht-rule">
<div className="pe-ht-num">{i+1}</div>
<div className="pe-ht-text">{rule}</div>
</div>
            ))}
<div className="pe-ht-tiers">
              {TIERS.map(t=>(
<div key={t.label} className="pe-ht-trow">
<span>{t.icon}</span>
<span style={{color:t.color,fontWeight:700}}>{t.label}</span>
<span className="pe-ht-pts">{t.min.toLocaleString()}+ pts</span>
</div>
              ))}
</div>
<button className="pe-ht-close" onClick={()=>setShowHow(false)}>BUILD MY OFFENSE</button>
</div>
</div>
      )}
      {showAuth&&(
<div className="pe-overlay" onClick={()=>setShowAuth(false)}>
<div className="pe-modal" onClick={e=>e.stopPropagation()}>
<div className="pe-mi">🏆</div>
<div className="pe-mt">Save Your Lineup</div>
<div className="pe-mb">Create a free account to save your best builds and share your scores.</div>
<div className="pe-mbtns">
<Link href="/signup" className="pe-mcta">Create Free Account</Link>
<Link href="/login" className="pe-msec">Sign In</Link>
</div>
<button className="pe-mskip" onClick={()=>setShowAuth(false)}>Maybe Later</button>
</div>
</div>
      )}
</>
  );
}
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Barlow+Condensed:wght@400;500;600;700;800&family=Barlow:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Barlow Condensed',sans-serif}

/* ── Nav ── */
.pe-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:.7rem 1.2rem;
  border-bottom:2px solid #0d1835;position:sticky;top:0;background:#050a18;z-index:30}
.pe-nav-l{justify-self:start}
.pe-nav-c{display:flex;align-items:center;gap:.6rem;font-family:'Orbitron',sans-serif;font-weight:700;
  font-size:.95rem;letter-spacing:.22em;color:#ffd700;justify-self:center;text-shadow:0 0 24px rgba(255,215,0,.5)}
.pe-nav-r{justify-self:end}
.pe-pip{width:9px;height:9px;border-radius:50%;background:#ffd700;flex-shrink:0;
  box-shadow:0 0 12px #ffd700,0 0 28px rgba(255,215,0,.6);animation:pip-pulse 2s ease-in-out infinite}
@keyframes pip-pulse{0%,100%{box-shadow:0 0 12px #ffd700,0 0 28px rgba(255,215,0,.6)}50%{box-shadow:0 0 22px #ffd700,0 0 48px rgba(255,215,0,.8)}}
.pe-back{color:#2a4060;text-decoration:none;font-size:.85rem;transition:.15s}
.pe-back:hover{color:#d4e8f8}
.pe-nb{width:30px;height:30px;border-radius:50%;background:#0a1428;border:2px solid #ffd700;
  color:#ffd700;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.85rem;
  display:flex;align-items:center;justify-content:center;text-decoration:none}
.pe-nb:hover{background:#ffd700;color:#050a18}
.pe-si{font-family:'Barlow Condensed',sans-serif;font-size:.72rem;font-weight:700;letter-spacing:.1em;
  color:#1a3050;text-decoration:none;border:1px solid #0d1835;padding:.25rem .65rem;border-radius:4px;transition:.15s}
.pe-si:hover{color:#ffd700;border-color:#ffd700}

/* ── Legendary flash ── */
.pe-leg-flash{position:fixed;inset:0;z-index:250;pointer-events:none;
  background:radial-gradient(ellipse at center,rgba(224,64,255,.4),rgba(60,0,120,.25) 40%,transparent 70%);
  display:flex;align-items:center;justify-content:center;animation:leg-in 2.4s ease both}
@keyframes leg-in{0%{opacity:0}10%{opacity:1}80%{opacity:1}100%{opacity:0}}
.pe-leg-text{font-family:'Orbitron',sans-serif;font-weight:900;font-size:clamp(1.6rem,5vw,3rem);
  letter-spacing:.18em;color:#e040ff;text-shadow:0 0 40px #e040ff,0 0 80px rgba(224,64,255,.7);
  animation:leg-pop .55s cubic-bezier(.36,1.6,.64,1) both}
@keyframes leg-pop{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}

/* ── Score strip ── */
.pe-strip{background:rgba(5,10,24,.96);border-bottom:2px solid #0d1835;display:flex;align-items:center;
  padding:.5rem 1.2rem;position:sticky;top:50px;z-index:20;backdrop-filter:blur(8px);overflow:hidden}
.pe-sg{flex:1;text-align:center;padding:0 .4rem}
.pe-sv{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.4rem;line-height:1;color:#d4e8f8;transition:color .4s}
.pe-sof{font-size:.85rem;color:#2a4060}
.pe-sl{font-size:.52rem;color:#2a4060;letter-spacing:.2em;text-transform:uppercase;margin-top:2px}
.pe-stier{font-size:.9rem;font-weight:700;letter-spacing:.06em;transition:color .4s}
.pe-sdiv{width:1px;height:38px;background:#0d1835;flex-shrink:0}
.pe-sbar{position:absolute;bottom:0;left:0;right:0;height:3px;background:#0d1835}
.pe-sfill{height:100%;background:linear-gradient(90deg,#a07020,#ffd700);transition:width .5s ease}

/* ── Root ── */
.pe-root{min-height:calc(100vh - 50px);background:#050a18;
  background-image:radial-gradient(ellipse at 50% -10%,rgba(255,215,0,.05),transparent 55%),
    repeating-linear-gradient(0deg,transparent,transparent 70px,rgba(255,255,255,.014) 70px,rgba(255,255,255,.014) 71px),
    repeating-linear-gradient(90deg,transparent,transparent 70px,rgba(255,255,255,.014) 70px,rgba(255,255,255,.014) 71px)}

/* ══ INTRO ══ */
.pe-intro{max-width:640px;margin:0 auto;padding:1.5rem 1.2rem 4rem}
.pe-intro-hero{text-align:center;margin-bottom:1.5rem;padding:1.5rem 1rem;
  background:radial-gradient(ellipse at 50% 0%,rgba(255,215,0,.07),transparent 65%)}
.pe-ih-sup{font-size:.65rem;letter-spacing:.45em;color:#3a6080;margin-bottom:.3rem}
.pe-ih-title{font-family:'Orbitron',sans-serif;font-weight:900;font-size:clamp(2rem,7vw,4rem);
  line-height:.92;letter-spacing:.04em;
  background:linear-gradient(135deg,#c8a820,#ffd700 40%,#f0c030 70%,#c8a820);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:.7rem}
.pe-ih-sub{font-size:.9rem;color:#3a6080;letter-spacing:.08em}
.pe-intro-ret{text-align:center;padding:1.5rem;background:rgba(8,14,30,.7);border:1px solid #1a3060;border-radius:16px;margin-bottom:1rem}
.pe-ir-title{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.3rem;letter-spacing:.12em;color:#d4e8f8;margin-bottom:.4rem}
.pe-ir-sub{color:#3a6080;font-size:.9rem;margin-bottom:1.2rem}
.pe-rules-preview{display:flex;flex-direction:column;gap:.8rem;margin-bottom:1.5rem;
  background:rgba(8,14,30,.7);border:1px solid #0d1835;border-radius:14px;padding:1.2rem}
.pe-irp-row{display:flex;gap:.9rem;align-items:flex-start}
.pe-irp-icon{font-size:1.3rem;min-width:28px;text-align:center}
.pe-irp-title{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;color:#ffd700;letter-spacing:.08em;margin-bottom:2px}
.pe-irp-text{font-family:'Barlow',sans-serif;font-size:.82rem;color:#5a8ab0;line-height:1.5}
.pe-play-btn{display:block;width:100%;background:linear-gradient(135deg,#a07020,#ffd700);
  color:#050a18;border:none;border-radius:12px;padding:1rem;margin-bottom:.7rem;
  font-family:'Orbitron',sans-serif;font-weight:700;font-size:1rem;letter-spacing:.16em;cursor:pointer;transition:all .2s}
.pe-play-btn:hover{filter:brightness(1.1);transform:scale(1.02)}
.pe-rules-btn{display:block;width:100%;background:none;border:1px solid #1a3050;color:#3a6080;
  border-radius:8px;padding:.65rem;font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:.85rem;
  letter-spacing:.1em;cursor:pointer;transition:.15s;text-align:center}
.pe-rules-btn:hover{border-color:#ffd700;color:#ffd700}

/* ══ SETUP ══ */
.pe-setup{max-width:1200px;margin:0 auto;padding:1rem 1rem 3rem}
.pe-setup-hero{text-align:center;margin-bottom:1rem;padding:1rem;}
.pe-hero-sup{font-size:.65rem;letter-spacing:.4em;color:#3a6080;margin-bottom:.2rem}
.pe-hero-title{font-family:'Orbitron',sans-serif;font-weight:900;font-size:clamp(1.8rem,5vw,3rem);
  line-height:.95;letter-spacing:.04em;
  background:linear-gradient(135deg,#c8a820,#ffd700 40%,#f0c030 70%,#c8a820);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:.5rem}
.pe-hero-sub{font-size:.85rem;color:#3a6080;letter-spacing:.08em}
.pe-setup-inst{text-align:center;font-size:.9rem;color:#5a8ab0;margin-bottom:1rem;
  padding:.55rem .9rem;background:rgba(255,215,0,.04);border:1px solid rgba(255,215,0,.12);border-radius:8px;line-height:1.5}
.pe-setup-inst strong{color:#ffd700}
.pe-inst-bolt{color:#ffd700;margin-right:.3rem}
.pe-inst-note{color:#2a4060;font-size:.8rem}
.pe-setup-field{background:rgba(8,14,30,.7);border:1px solid #0d1835;border-radius:16px;
  padding:1rem .8rem;margin-bottom:.8rem;overflow:hidden}
.pe-how-link{display:block;text-align:center;background:none;border:none;color:#2a4060;
  font-family:'Barlow Condensed',sans-serif;font-size:.8rem;letter-spacing:.12em;cursor:pointer;margin:.8rem auto 0;transition:.15s}
.pe-how-link:hover{color:#7aa0c0}

/* ════════════════════════════════════════════
   FIELD LAYOUT
════════════════════════════════════════════ */
.pe-field{display:flex;flex-direction:column;align-items:center;gap:18px;
  width:fit-content;margin:0 auto}
.pe-form-row{display:flex;gap:16px}
.pe-skill-spread{display:flex;justify-content:space-between;align-items:flex-end;
  width:calc(100% + 380px);margin:0 -40px}
.pe-skill-side{display:flex;gap:18px}

/* ════════════════════════════════════════════
   SLOT OUTER
════════════════════════════════════════════ */
.pe-slot-outer{
  display:flex;flex-direction:column;align-items:center;gap:4px;
  flex-shrink:0;background:transparent;border:none}
.pe-slot-outer.hb-back{margin-top:16px;margin-left:8px}
.pe-slot-label{
  font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.62rem;
  letter-spacing:.12em;color:#3a6080;text-align:center;line-height:1}
.pe-slot-label.cap{color:#c040ff;text-shadow:0 0 8px rgba(192,64,255,.7)}

/* ════════════════════════════════════════════
   PACK — pure image, zero box behind it
════════════════════════════════════════════ */
.pe-pack-wrap{
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:default;
  width:125px;      /* ← dimensions go HERE on the parent */
  height:183px;
  flex-shrink:0;
}
.pe-pack-img{
  width:100% !important;    /* ← !important to beat the Tailwind reset */
  height:100% !important;
  object-fit:cover;
  display:block;
  background:transparent;
}
.pe-pack-wrap.clickable{
  cursor:pointer;
  transition:transform .18s ease, filter .18s ease;
}
.pe-pack-wrap.clickable:hover{
  transform:translateY(-6px) scale(1.07);
  filter:drop-shadow(0 0 10px rgba(255,215,0,.7));
}
.pe-pack-wrap.is-cap{
  animation:cap-drop-pulse 1.9s ease-in-out infinite;
}
@keyframes cap-drop-pulse{
  0%,100%{filter:drop-shadow(0 0 8px rgba(160,32,240,.9));}
  50%{filter:drop-shadow(0 0 18px rgba(224,64,255,1));}
}
.pe-pack-cap-badge{
  position:absolute;top:-8px;left:0;right:0;text-align:center;
  font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.7rem;
  letter-spacing:.18em;color:#ffd700;text-shadow:0 0 8px rgba(255,215,0,.95);z-index:2;
  pointer-events:none}

/* ════════════════════════════════════════════
   FILLED SLOT (has a player card)
════════════════════════════════════════════ */
.pe-fsl{
  width:125px;height:183px;border-radius:11px;overflow:hidden;
  background:transparent;border:none;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  position:relative;transition:all .22s;cursor:default;flex-shrink:0}
.pe-fsl.has-p{
  background:#040810;
  border:2px solid rgba(255,255,255,.18);
  box-shadow:0 0 16px var(--rg,transparent)}
.pe-fsl.active{
  background:rgba(255,215,0,.06);
  border:2px solid #ffd700;
  box-shadow:0 0 20px rgba(255,215,0,.4);
  animation:slot-p 1.4s ease-in-out infinite}
@keyframes slot-p{0%,100%{box-shadow:0 0 20px rgba(255,215,0,.4)}50%{box-shadow:0 0 38px rgba(255,215,0,.65)}}
.pe-fsl-locked{display:flex;flex-direction:column;align-items:center;gap:.3rem}
.pe-fsl-pos-small{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.68rem;
  letter-spacing:.14em;color:#2a4060}
.pe-fsl-opening{font-size:.65rem;color:#ffd700;animation:blink .9s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}

/* Filled card internals */
.pe-filled-card{position:absolute;inset:0;display:flex;flex-direction:column;overflow:hidden}
.pe-fc-topbar{height:4px;flex-shrink:0;width:100%}
.pe-fc-art{flex:1;position:relative;overflow:hidden;background:var(--art);
  display:flex;align-items:center;justify-content:center}
.pe-fc-img{position:absolute;bottom:3px;left:50%;transform:translateX(-50%);
  height:105%;width:auto;object-fit:contain;object-position:center bottom;z-index:2}
.pe-fc-initial{font-family:'Orbitron',sans-serif;font-weight:900;font-size:3.2rem;
  color:rgba(255,255,255,.12);position:absolute;bottom:-4px;right:-4px;z-index:1}
.pe-fc-holo{position:absolute;inset:0;
  background:linear-gradient(45deg,rgba(208,96,240,.25),rgba(255,128,255,.18),rgba(80,64,240,.25),rgba(208,96,240,.25));
  background-size:300%;animation:holo-sweep 3s ease-in-out infinite;mix-blend-mode:screen;z-index:3}
.pe-fc-epic-g{position:absolute;inset:0;
  background:radial-gradient(ellipse at 50% 0%,rgba(255,215,0,.35),transparent 65%);z-index:3}
.pe-fc-info{flex-shrink:0;padding:.35rem .4rem .3rem;width:100%;
  background:linear-gradient(to bottom,rgba(4,8,16,.9),rgba(4,8,16,.98));
  border-top:2px solid var(--rc,rgba(255,255,255,.1))}
.pe-fc-name{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.82rem;
  line-height:1;letter-spacing:.02em;color:var(--rc,#e0eef8);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pe-fc-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1rem;line-height:1.1;
  color:#d4e8f8;margin-top:2px}
.pe-fc-rar{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.48rem;
  letter-spacing:.2em;margin-top:2px;opacity:.9;color:var(--rc)}
.pe-fc-cap-badge{position:absolute;top:0px;right:0px;font-size:.5rem;color:#ffd700;
  text-shadow:0 0 8px rgba(255,215,0,.9);z-index:5}
.pe-fc-shine{position:absolute;inset:0;pointer-events:none;z-index:4;
  background:linear-gradient(135deg,transparent 45%,rgba(255,255,255,.06) 50%,transparent 55%)}
.pe-filled-card{position:absolute;inset:0;display:flex;flex-direction:column;overflow:hidden}
.pe-fc-topbar{height:4px;flex-shrink:0;width:100%}
.pe-fc-art{flex:1;position:relative;overflow:hidden;background:var(--art);
  display:flex;align-items:center;justify-content:center}
.pe-fc-field-lines{
  position:absolute;inset:0;z-index:1;pointer-events:none;
  background-image:
    repeating-linear-gradient(0deg,transparent,transparent 16px,rgba(255,255,255,.1) 16px,rgba(255,255,255,.1) 17px),
    linear-gradient(180deg,rgba(0,0,0,.1),transparent 50%,rgba(0,0,0,.25));
  border-bottom:2px solid var(--rc,rgba(255,255,255,.4))}
.pe-fc-endzone{
  position:absolute;top:0;left:0;right:0;height:18%;
  z-index:2;pointer-events:none;
  background:rgba(255, 255, 255, 1);
  display:flex;align-items:center;justify-content:center;
  border-bottom:0px solid rgba(255,255,255,.3)}

/* ══ PACKING phase ══ */
.pe-packing{max-width:1200px;margin:0 auto;padding:.8rem 1rem 3rem}
.pe-formation-wrap{background:rgba(8,14,30,.7);border:1px solid #0d1835;border-radius:14px;
  padding:.8rem .6rem;margin-bottom:.8rem;overflow:hidden}
.pe-cap-banner{display:flex;align-items:center;justify-content:center;gap:.6rem;
  font-size:.78rem;color:#5a8ab0;letter-spacing:.06em;margin-bottom:.8rem;
  padding:.45rem .8rem;background:rgba(192,64,255,.07);border:1px solid rgba(192,64,255,.2);border-radius:6px}
.pe-cap-bolt{color:#e040ff;font-size:.9rem}
.pe-cap-txt{font-family:'Barlow Condensed',sans-serif;font-weight:600}

/* Cards area */
.pe-cards-area{background:rgba(6,10,22,.9);border:1px solid #0d1835;border-radius:14px;padding:1rem}
.pe-ca-header{text-align:center;margin-bottom:.9rem}
.pe-cap-tag{display:inline-block;font-size:.6rem;letter-spacing:.2em;font-weight:800;
  color:#e040ff;background:rgba(224,64,255,.1);border:1px solid rgba(224,64,255,.35);
  border-radius:3px;padding:3px 10px;margin-bottom:.4rem;
  box-shadow:0 0 12px rgba(224,64,255,.3);animation:cap-tag-glow 2s ease-in-out infinite}
@keyframes cap-tag-glow{0%,100%{box-shadow:0 0 12px rgba(224,64,255,.3)}50%{box-shadow:0 0 24px rgba(224,64,255,.6)}}
.pe-ca-pos{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.2rem;
  letter-spacing:.08em;color:#d4e8f8;margin-bottom:.2rem}
.pe-ca-status{font-size:.8rem;color:#3a6080;letter-spacing:.06em}
.pe-cards-row{display:flex;gap:.55rem;justify-content:center;flex-wrap:wrap;padding:.3rem 0}

/* Individual cards */
.pe-card{width:136px;flex-shrink:0;perspective:1000px;position:relative;cursor:pointer;
  transition:transform .2s ease,opacity .3s;z-index:1}
.pe-card:hover{z-index:10}
.pe-card.rev.selectable:hover{transform:translateY(-14px) scale(1.07)}
.pe-card.rev.selectable:hover .pe-card-front{
  box-shadow:0 0 40px var(--rg),0 16px 36px rgba(0,0,0,.7);border-color:var(--rc)}
.pe-card.picked{transform:scale(1.08) translateY(-14px);z-index:20}
.pe-card.rejected{opacity:.22;transform:scale(.9);filter:grayscale(.6)}
.pe-ci{position:relative;width:100%;height:208px;transform-style:preserve-3d;
  transition:transform .7s cubic-bezier(.4,0,.2,1)}
.pe-card.rev .pe-ci{transform:rotateY(180deg)}
.pe-card-back,.pe-card-front{position:absolute;inset:0;border-radius:11px;
  backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden}
.pe-card-back{background:linear-gradient(155deg,#080e24,#0c1840);border:2px solid #1a3060;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4rem}
.pe-back-grid{position:absolute;inset:0;
  background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);
  background-size:14px 14px}
.pe-back-icon{font-size:2.2rem;opacity:.18;position:relative;z-index:1}
.pe-back-label{font-size:.58rem;letter-spacing:.2em;color:#1a3060;font-family:'Barlow Condensed',sans-serif;position:relative;z-index:1}
.pe-card-front{background:linear-gradient(170deg,#080e24,#0b1438);
  border:2px solid var(--sh,#333);transform:rotateY(180deg);
  box-shadow:0 0 18px var(--rg,transparent),inset 0 1px 0 rgba(255,255,255,.06)}
.pe-cf-topbar{display:flex;align-items:center;justify-content:space-between;padding:.35rem .5rem .15rem}
.pe-cf-pos{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.62rem;
  letter-spacing:.12em;color:#fff;padding:2px 5px;border-radius:3px}
.pe-cf-rlab{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.52rem;
  letter-spacing:.18em;color:var(--rc);opacity:.9}
.pe-cf-rlab.legendary{background:linear-gradient(90deg,#d060f0,#ff90ff,#d060f0);
  background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;animation:holo-shift 2s linear infinite}
@keyframes holo-shift{from{background-position:0%}to{background-position:200%}}
.pe-cf-art{height:90px;position:relative;overflow:hidden;background:var(--art);
  display:flex;align-items:center;justify-content:center}
.pe-cf-img{position:absolute;bottom:-10px;left:50%;transform:translateX(-50%);
  height:118%;width:auto;object-fit:contain;object-position:center bottom;z-index:2}
.pe-cf-initial{font-family:'Orbitron',sans-serif;font-weight:900;font-size:4rem;
  color:rgba(255,255,255,.1);line-height:1;position:absolute;bottom:-8px;right:-6px;z-index:1}
.pe-holo{position:absolute;inset:0;
  background:linear-gradient(45deg,rgba(208,96,240,.22),rgba(255,128,255,.16),rgba(80,64,240,.22),rgba(208,96,240,.22));
  background-size:300%;animation:holo-sweep 3s ease-in-out infinite;mix-blend-mode:screen;z-index:3}
@keyframes holo-sweep{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.pe-epic-g{position:absolute;inset:0;
  background:radial-gradient(ellipse at 50% 0%,rgba(255,215,0,.25),transparent 70%);z-index:3}
.pe-cf-body{padding:.35rem .5rem .4rem}
.pe-cf-name{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.88rem;
  color:#e0eef8;letter-spacing:.02em;line-height:1.15;margin-bottom:1px}
.pe-cf-team{font-size:.5rem;color:#3a6080;letter-spacing:.04em;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pe-cf-line{height:1.5px;margin:.3rem 0 .25rem;opacity:.4;border-radius:1px}
.pe-cf-score-row{display:flex;align-items:baseline;gap:.3rem;margin-bottom:.25rem}
.pe-cf-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1.4rem;line-height:1}
.pe-cf-ovr{font-size:.45rem;color:#2a4060;letter-spacing:.18em}
.pe-cf-acc{font-size:.45rem;color:#3a6080;line-height:1.5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* Reveal bar */
.pe-reveal-bar{text-align:center;margin-top:.9rem}
.pe-reveal-btn{background:linear-gradient(135deg,#0d1835,#142040);
  border:2px solid #ffd700;border-radius:8px;color:#ffd700;
  font-family:'Orbitron',sans-serif;font-weight:700;font-size:.82rem;
  letter-spacing:.16em;padding:.6rem 2rem;cursor:pointer;transition:all .22s}
.pe-reveal-btn:hover{background:rgba(255,215,0,.1);box-shadow:0 0 24px rgba(255,215,0,.3);transform:scale(1.03)}

/* Empty prompt */
.pe-empty-prompt{text-align:center;padding:1.2rem 1rem;margin-top:.4rem}
.pe-ep-arrow{font-size:1.8rem;color:#1a3050;animation:bob 2s ease-in-out infinite;display:block;margin-bottom:.3rem}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
.pe-ep-text{font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:700;letter-spacing:.12em;color:#3a6080;margin-bottom:.25rem}
.pe-ep-sub{font-size:.75rem;color:#1a3050;letter-spacing:.08em}

/* ══ COMPLETE ══ */
.pe-complete{max-width:1200px;margin:0 auto;padding:1rem 1rem 4rem}
.pe-comp-hdr{text-align:center;padding:1.2rem 1rem;
  background:radial-gradient(ellipse at 50% 0%,rgba(255,215,0,.09),transparent 65%);margin-bottom:.9rem}
.pe-ch-icon{font-size:2.8rem;margin-bottom:.4rem;animation:icon-pop .7s cubic-bezier(.36,1.6,.64,1)}
@keyframes icon-pop{from{transform:rotate(-20deg) scale(0)}to{transform:rotate(0) scale(1)}}
.pe-ch-sup{font-size:.6rem;letter-spacing:.38em;color:#2a4060;text-transform:uppercase;margin-bottom:.25rem}
.pe-ch-tier{font-family:'Orbitron',sans-serif;font-weight:900;font-size:clamp(1.2rem,4vw,2rem);letter-spacing:.1em;margin-bottom:.35rem}
.pe-ch-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:clamp(2.8rem,8vw,5rem);
  line-height:1;background:linear-gradient(135deg,#c8a820,#ffd700,#f0c030);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:score-pop .8s cubic-bezier(.34,1.2,.64,1)}
@keyframes score-pop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
.pe-ch-lbl{font-size:.58rem;color:#2a4060;letter-spacing:.24em}
.pe-comp-field-wrap{background:rgba(6,10,22,.9);border:1px solid #0d1835;border-radius:14px;
  padding:.8rem;margin-bottom:1rem;overflow:hidden}
.pe-tier-card{background:#07101e;border:1px solid #0d1835;border-radius:12px;padding:.9rem 1.1rem;margin-bottom:1rem}
.pe-tier-row{display:flex;align-items:center;gap:.7rem;padding:.28rem 0;
  border-bottom:1px solid #0a1228;font-family:'Barlow Condensed',sans-serif}
.pe-tier-row:last-child{border-bottom:none}
.pe-tier-row.active{background:rgba(255,215,0,.05);border-radius:6px;padding:.28rem .6rem;margin:0 -.6rem}
.pe-tr-ic{font-size:.9rem;width:20px;text-align:center}
.pe-tr-lbl{font-size:.75rem;font-weight:700;letter-spacing:.06em;flex:1}
.pe-tr-min{font-size:.62rem;color:#1a3050;margin-left:auto}
.pe-tr-ck{font-size:.8rem;font-weight:700}
.pe-comp-btns{display:flex;gap:.65rem;margin-bottom:.9rem}
.pe-share-btn{flex:1;background:linear-gradient(135deg,#a07020,#ffd700);color:#050a18;
  border:none;border-radius:8spx;padding:.85rem 1rem;font-family:'Barlow Condensed',sans-serif;
  font-weight:800;font-size:.95rem;letter-spacing:.12em;cursor:pointer;transition:.2s}
.pe-share-btn:hover{filter:brightness(1.1);transform:scale(1.02)}
.pe-restart-btn{background:transparent;border:2px solid #1a3050;color:#3a6080;
  border-radius:8px;padding:.85rem 1.4rem;font-family:'Barlow Condensed',sans-serif;
  font-weight:700;font-size:.9rem;letter-spacing:.1em;cursor:pointer;transition:.2s}
.pe-restart-btn:hover{border-color:#ffd700;color:#ffd700}
.pe-save-link{display:block;text-align:center;background:none;border:none;
  color:#1a3050;font-size:.75rem;cursor:pointer;letter-spacing:.08em;
  font-family:'Barlow Condensed',sans-serif;transition:.15s;margin-top:.4rem}
.pe-save-link:hover{color:#3a6080}

/* ── Overlays ── */
.pe-overlay{position:fixed;inset:0;background:rgba(0,0,0,.92);
  display:flex;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(10px);padding:1rem}
.pe-howto{background:#07101e;border:2px solid #1a3050;border-radius:16px;padding:1.5rem;
  max-width:520px;width:100%;max-height:88vh;overflow-y:auto;animation:fade-up .3s ease}
.pe-howto::-webkit-scrollbar{width:4px}
.pe-howto::-webkit-scrollbar-thumb{background:#0d1835}
@keyframes fade-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.pe-ht-title{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.2rem;
  letter-spacing:.15em;color:#ffd700;margin-bottom:1.1rem;text-align:center}
.pe-ht-rule{display:flex;gap:.8rem;margin-bottom:.85rem;align-items:flex-start}
.pe-ht-num{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.05rem;color:#ffd700;min-width:20px;line-height:1.2}
.pe-ht-text{font-family:'Barlow',sans-serif;font-size:.85rem;color:#5a8ab0;line-height:1.6}
.pe-ht-tiers{background:#040810;border:1px solid #0d1835;border-radius:8px;padding:.8rem;margin-top:.8rem}
.pe-ht-trow{display:flex;align-items:center;gap:.7rem;padding:.24rem 0;
  font-family:'Barlow Condensed',sans-serif;font-size:.8rem;font-weight:600}
.pe-ht-pts{margin-left:auto;color:#1a3050;font-size:.68rem}
.pe-ht-close{width:100%;margin-top:1.1rem;background:linear-gradient(135deg,#a07020,#ffd700);
  color:#050a18;border:none;border-radius:8px;padding:.85rem;
  font-family:'Orbitron',sans-serif;font-weight:700;font-size:.92rem;
  letter-spacing:.15em;cursor:pointer;transition:.2s}
.pe-ht-close:hover{filter:brightness(1.1)}
.pe-modal{background:#07101e;border:2px solid #1a3050;border-radius:20px;
  padding:2rem 1.8rem;max-width:320px;width:100%;text-align:center;animation:fade-up .3s ease}
.pe-mi{font-size:2.6rem;margin-bottom:.7rem}
.pe-mt{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.3rem;
  letter-spacing:.08em;color:#d4e8f8;margin-bottom:.45rem}
.pe-mb{font-size:.85rem;color:#3a6080;line-height:1.6;margin-bottom:1.2rem;font-family:'Barlow',sans-serif}
.pe-mbtns{display:flex;flex-direction:column;gap:.55rem;margin-bottom:.7rem}
.pe-mcta{display:block;background:linear-gradient(135deg,#a07020,#ffd700);color:#050a18;
  font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.95rem;
  letter-spacing:.08em;padding:.8rem;border-radius:10px;text-decoration:none;text-align:center}
.pe-mcta:hover{filter:brightness(1.1)}
.pe-msec{display:block;background:transparent;border:2px solid #1a3050;color:#5a8ab0;
  font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;
  letter-spacing:.06em;padding:.7rem;border-radius:10px;text-decoration:none;text-align:center}
.pe-msec:hover{border-color:#ffd700;color:#ffd700}
.pe-mskip{background:none;border:none;color:#1a3050;font-size:.74rem;cursor:pointer;
  font-family:'Barlow Condensed',sans-serif;letter-spacing:.1em;transition:.15s}
.pe-mskip:hover{color:#3a6080}

/* ── Responsive ── */
@media(max-width:1000px){
  .pe-pack-img,.pe-fsl{width:100px;height:158px}
  .pe-skill-spread{width:calc(100% + 160px);margin:0 -30px}
}
@media(max-width:700px){
  .pe-pack-img,.pe-fsl{width:82px;height:128px}
  .pe-card{width:calc(19vw - 4px);min-width:110px}
  .pe-cards-row{gap:.4rem}
  .pe-skill-spread{width:calc(100% + 100px);margin:0 -20px}
  .pe-form-row{gap:6px}
  .pe-skill-side{gap:6px}
  .pe-pack-wrap,.pe-fsl{width:82px;height:128px}
}
@media(max-width:420px){
  .pe-pack-img,.pe-fsl{width:64px;height:100px}
  .pe-card{min-width:96px}
  .pe-fc-score{font-size:.72rem}
  .pe-skill-spread{width:calc(100% + 60px);margin:0 -10px}
  .pe-pack-wrap,.pe-fsl{width:64px;height:100px}
}
`;