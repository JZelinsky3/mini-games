'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import { DRAFT_DATA } from '@/lib/redraft/playerData';
import { TEAM_DATA } from '@/lib/redraft/teamData';

// ─── TYPES ────────────────────────────────────────────────────────────────────

type CareerGrade = 'S' | 'A' | 'B' | 'C' | 'D';
interface DraftPlayer { id:string; name:string; position:string; actualPick:number; actualRound:number; draftedBy:string; careerGrade:CareerGrade; careerNote:string; headshot?:string; }
interface TeamInfo { n:string[]; s:string[]; w:string; }
interface PickSlot { pickNumber:number; teamAbbr:string; player:DraftPlayer|null; }

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const GV: Record<CareerGrade,number> = { S:100,A:80,B:55,C:30,D:10 };

const GC: Record<CareerGrade,{bg:string;bd:string;tx:string;bar:string;lbl:string}> = {
  S:{bg:'bg-amber-500/15',   bd:'border-amber-400/50',   tx:'text-amber-300',   bar:'bg-amber-400',   lbl:'Elite'},
  A:{bg:'bg-emerald-500/15', bd:'border-emerald-400/50', tx:'text-emerald-300', bar:'bg-emerald-400', lbl:'Star'},
  B:{bg:'bg-sky-500/15',     bd:'border-sky-400/50',     tx:'text-sky-300',     bar:'bg-sky-400',     lbl:'Solid'},
  C:{bg:'bg-zinc-600/15',    bd:'border-zinc-600/50',    tx:'text-zinc-400',    bar:'bg-zinc-500',    lbl:'Backup'},
  D:{bg:'bg-red-500/15',     bd:'border-red-500/50',     tx:'text-red-400',     bar:'bg-red-500',     lbl:'Bust'},
};

const PC: Record<string,string> = {
  QB:'bg-red-500/20 text-red-300 border-red-500/40',   WR:'bg-sky-500/20 text-sky-300 border-sky-500/40',
  RB:'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', TE:'bg-orange-500/20 text-orange-300 border-orange-500/40',
  OT:'bg-violet-500/20 text-violet-300 border-violet-500/40',   OG:'bg-violet-500/20 text-violet-300 border-violet-500/40',
  C: 'bg-violet-500/20 text-violet-300 border-violet-500/40',   CB:'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  S: 'bg-teal-500/20 text-teal-300 border-teal-500/40',         LB:'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  EDGE:'bg-pink-500/20 text-pink-300 border-pink-500/40',       DE:'bg-pink-500/20 text-pink-300 border-pink-500/40',
  DT:'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
};

const NC: Record<string,string> = {
  QB:'bg-red-500/20 text-red-200 border-red-400/40',   WR:'bg-sky-500/20 text-sky-200 border-sky-400/40',
  RB:'bg-emerald-500/20 text-emerald-200 border-emerald-400/40', TE:'bg-orange-500/20 text-orange-200 border-orange-400/40',
  OT:'bg-violet-500/20 text-violet-200 border-violet-400/40',   CB:'bg-cyan-500/20 text-cyan-200 border-cyan-400/40',
  S: 'bg-teal-500/20 text-teal-200 border-teal-400/40',         LB:'bg-yellow-500/20 text-yellow-200 border-yellow-400/40',
  EDGE:'bg-pink-500/20 text-pink-200 border-pink-400/40',       DT:'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/40',
};

const TN: Record<string,string> = {
  ARI:'Arizona Cardinals', ATL:'Atlanta Falcons',   BAL:'Baltimore Ravens',  BUF:'Buffalo Bills',
  CAR:'Carolina Panthers', CHI:'Chicago Bears',     CIN:'Cincinnati Bengals',CLE:'Cleveland Browns',
  DAL:'Dallas Cowboys',    DEN:'Denver Broncos',    DET:'Detroit Lions',     GB:'Green Bay Packers',
  HOU:'Houston Texans',    IND:'Indianapolis Colts',JAX:'Jacksonville Jaguars',KC:'Kansas City Chiefs',
  LAC:'LA Chargers',       LAR:'LA Rams',           LV:'Las Vegas Raiders',  MIA:'Miami Dolphins',
  MIN:'Minnesota Vikings', NE:'New England Patriots',NO:'New Orleans Saints', NYG:'New York Giants',
  NYJ:'New York Jets',     OAK:'Oakland Raiders',   PHI:'Philadelphia Eagles',PIT:'Pittsburgh Steelers',
  SD:'San Diego Chargers', SEA:'Seattle Seahawks',  SF:'San Francisco 49ers', TB:'Tampa Bay Buccaneers',
  TEN:'Tennessee Titans',  WAS:'Washington Commanders',
};

const ESPN: Record<string,string> = { WAS:'wsh',OAK:'lv',SD:'lac',GB:'gb',KC:'kc',NE:'ne',NO:'no',SF:'sf',TB:'tb' };
const logoUrl = (a:string) => `https://a.espncdn.com/i/teamlogos/nfl/500/${ESPN[a]??a.toLowerCase()}.png`;

const YEARS = [2016,2017,2018,2019,2020,2021,2022,2023,2024,2025];

const DRAFT_ORDER: Record<number,string[]> = {
  2016:['TEN','CLE','SD','DAL','JAX','BAL','SF','PHI','TB','NYG','CHI','NO','MIA','OAK','JAX','LAR','ATL','IND','BUF','NYJ','WAS','HOU','MIN','CIN','NE','SEA','GB','KC','ARI','SEA','PIT','SD'],
  2017:['CLE','SF','CHI','JAX','TEN','NYJ','LAC','CAR','CIN','BUF','NO','CLE','ARI','PHI','IND','BAL','WAS','TEN','TB','DEN','GB','CLE','NYG','OAK','ATL','BUF','SEA','DET','KC','WAS','HOU','NE'],
  2018:['CLE','NYG','IND','CLE','DEN','IND','TB','CHI','SF','OAK','MIA','DET','WAS','GB','ARI','BAL','LAC','SEA','DAL','DET','BUF','BUF','NYJ','CAR','CIN','ATL','NE','PIT','JAX','MIN','NE','BAL'],
  2019:['ARI','SF','NYJ','OAK','TB','NYG','JAX','DET','BUF','DEN','CIN','GB','MIA','ATL','WAS','CAR','CLE','MIN','TEN','DEN','PHI','BUF','LAC','OAK','PHI','MIA','OAK','NO','SEA','LAR','KC','NE'],
  2020:['CIN','WAS','DET','NYG','MIA','LAC','CAR','ARI','JAX','CLE','NYJ','LV','SF','TB','DEN','ATL','DAL','MIA','PHI','JAX','PHI','MIN','NE','NO','SF','MIA','SEA','BAL','TEN','GB','MIN','KC'],
  2021:['JAX','NYJ','SF','ATL','CIN','MIA','DET','CAR','DEN','DAL','NYG','PHI','LAC','MIN','NE','ARI','LV','MIA','WAS','CHI','IND','TEN','NYJ','PIT','JAX','CLE','BAL','NO','GB','BUF','BAL','TB'],
  2022:['JAX','DET','HOU','NYJ','NYG','CAR','GB','ATL','SEA','NYJ','WAS','MIN','CLE','BAL','PHI','NO','LAC','PHI','NE','PIT','NE','GB','ARI','DAL','BUF','TEN','MIA','CIN','DAL','KC','CIN','SF'],
  2023:['CAR','HOU','ARI','IND','SEA','DET','LV','ATL','CHI','PHI','TEN','HOU','GB','NE','NYJ','WAS','PIT','DET','TB','SEA','LAC','BAL','MIN','JAX','NYG','DAL','BUF','CIN','SF','LAR','BAL','KC'],
  2024:['CHI','WAS','NE','ARI','LAC','NYG','TEN','ATL','CHI','NYJ','MIN','DEN','LV','IND','JAX','PIT','JAX','MIA','BUF','LAR','MIA','PHI','JAX','DET','LAC','SEA','TB','NO','GB','BAL','SF','KC'],
  2025:['TEN','JAX','NYG','NE','CLE','LV','SF','CAR','LV','CHI','NO','IND','MIA','KC','SEA','IND','HOU','CLE','DEN','ATL','PIT','LAC','GB','TEN','MIN','NYJ','BAL','NYG','GB','LAR','PHI','BUF'],
};

const FEAT: Record<number,{name:string;pos:string;last:string}[]> = {
  2016:[{name:'Jalen Ramsey',pos:'CB',last:'Ramsey'},{name:'Dak Prescott',pos:'QB',last:'Prescott'},{name:'Derrick Henry',pos:'RB',last:'Henry'}],
  2017:[{name:'Patrick Mahomes',pos:'QB',last:'Mahomes'},{name:'T.J. Watt',pos:'EDGE',last:'Watt'},{name:'Cooper Kupp',pos:'WR',last:'Kupp'}],
  2018:[{name:'Lamar Jackson',pos:'QB',last:'Jackson'},{name:'Josh Allen',pos:'QB',last:'Allen'},{name:'Nick Chubb',pos:'RB',last:'Chubb'}],
  2019:[{name:'Nick Bosa',pos:'EDGE',last:'Bosa'},{name:'A.J. Brown',pos:'WR',last:'Brown'},{name:'DK Metcalf',pos:'WR',last:'Metcalf'}],
  2020:[{name:'Justin Jefferson',pos:'WR',last:'Jefferson'},{name:'Joe Burrow',pos:'QB',last:'Burrow'},{name:'CeeDee Lamb',pos:'WR',last:'Lamb'}],
  2021:[{name:"Ja'Marr Chase",pos:'WR',last:'Chase'},{name:'Micah Parsons',pos:'EDGE',last:'Parsons'},{name:'Penei Sewell',pos:'OT',last:'Sewell'}],
  2022:[{name:'Aidan Hutchinson',pos:'EDGE',last:'Hutchinson'},{name:'Sauce Gardner',pos:'CB',last:'Gardner'},{name:'Garrett Wilson',pos:'WR',last:'Wilson'}],
  2023:[{name:'C.J. Stroud',pos:'QB',last:'Stroud'},{name:'Will Anderson Jr.',pos:'EDGE',last:'Anderson'},{name:'Jalen Carter',pos:'DT',last:'Carter'}],
  2024:[{name:'Jayden Daniels',pos:'QB',last:'Daniels'},{name:'Brock Bowers',pos:'TE',last:'Bowers'},{name:'Joe Alt',pos:'OT',last:'Alt'}],
  2025:[{name:'Travis Hunter',pos:'CB/WR',last:'Hunter'},{name:'Abdul Carter',pos:'EDGE',last:'Carter'},{name:'Ashton Jeanty',pos:'RB',last:'Jeanty'}],
};

const CM: Record<number,{tier:string;dot:string;accent:string}> = {
  2016:{tier:'Late Bloomers',  dot:'bg-amber-500',   accent:'from-amber-500/10'},
  2017:{tier:'All-Time Great', dot:'bg-red-500',     accent:'from-red-500/10'},
  2018:{tier:'QB Bonanza',     dot:'bg-orange-500',  accent:'from-orange-500/10'},
  2019:{tier:'WR Factory',     dot:'bg-sky-500',     accent:'from-sky-500/10'},
  2020:{tier:'Star-Studded',   dot:'bg-emerald-500', accent:'from-emerald-500/10'},
  2021:{tier:'Elite Talent',   dot:'bg-rose-500',    accent:'from-rose-500/10'},
  2022:{tier:'Defense Rules',  dot:'bg-cyan-500',    accent:'from-cyan-500/10'},
  2023:{tier:'RB Heaven',      dot:'bg-violet-500',  accent:'from-violet-500/10'},
  2024:{tier:'QB Heavy',       dot:'bg-amber-400',   accent:'from-amber-400/10'},
  2025:{tier:'Just Drafted',   dot:'bg-zinc-500',    accent:'from-zinc-500/8'},
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function calcScore(d:DraftPlayer[]) {
  if(!d.length) return null;
  const avg=d.reduce((s,p)=>s+GV[p.careerGrade],0)/d.length;
  if(avg>=88) return{letter:'S+',color:'text-amber-300',  emoji:'🏆',label:'All-Time GM'};
  if(avg>=78) return{letter:'S', color:'text-amber-300',  emoji:'👑',label:'Elite Board'};
  if(avg>=65) return{letter:'A', color:'text-emerald-300',emoji:'⭐',label:'Strong Board'};
  if(avg>=50) return{letter:'B', color:'text-sky-300',    emoji:'✅',label:'Solid Board'};
  if(avg>=35) return{letter:'C', color:'text-zinc-400',   emoji:'📋',label:'Average Board'};
  return           {letter:'D', color:'text-red-400',    emoji:'💸',label:'Rough Board'};
}

const isFit=(pos:string,needs:string[])=>{ const b=pos.split('/')[0]; return needs.includes(b)||needs.includes(pos); };
const posClass=(pos:string)=>PC[pos.split('/')[0]]||'bg-zinc-700/40 text-zinc-400 border-zinc-600';

// ─── TEAM LOGO ────────────────────────────────────────────────────────────────

function TeamLogo({abbr,size=20}:{abbr:string;size?:number}) {
  const [err,setErr]=useState(false);
  const st={width:size,height:size,minWidth:size,minHeight:size};
  if(err) return <div style={st} className="rounded-sm bg-zinc-700 shrink-0 flex items-center justify-center text-[6px] font-black text-zinc-400">{abbr.slice(0,2)}</div>;
  return <img src={logoUrl(abbr)} alt={abbr} onError={()=>setErr(true)} style={st} className="object-contain shrink-0"/>;
}

// ─── PLAYER AVATAR ────────────────────────────────────────────────────────────

function Ava({src,pos,grade,size}:{src?:string;pos:string;grade:CareerGrade;size:number}) {
  const g=GC[grade];
  const st={width:size,height:size,minWidth:size,minHeight:size};
  return src
    ?<img src={src} alt="" style={st} className="rounded-full object-cover border-2 border-zinc-600 shrink-0 bg-zinc-800"/>
    :<div style={st} className={`rounded-full flex items-center justify-center text-[8px] font-black border-2 shrink-0 ${g.bg} ${g.bd} ${g.tx}`}>{pos.split('/')[0].slice(0,2)}</div>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// YEAR SELECTOR  — 3 cols, ~80% width, no absolute positioning
// ═══════════════════════════════════════════════════════════════════════════════

function YearSelector({onSelect,headshots}:{onSelect:(yr:number)=>void;headshots:Record<string,string>}) {
  const [hov,setHov]=useState<number|null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
        <Link href="/games" className="text-zinc-500 hover:text-white text-sm font-medium transition">← All Games</Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
            <span className="text-sm">🏈</span>
          </div>
          <span className="font-black text-sm tracking-widest uppercase text-zinc-500">NFL Redraft</span>
        </div>
        <div className="w-24"/>
      </nav>

      {/* Hero */}
      <div className="relative overflow-hidden px-6 pt-12 pb-10 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-amber-500/7 rounded-full blur-3xl"/>
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-700/60 rounded-full px-4 py-1.5 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"/>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.18em]">Mock Draft Simulator</span>
          </div>
          <h1 className="text-6xl sm:text-7xl font-black tracking-tight leading-[0.9] mb-4">
            <span className="text-white">Re</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-orange-500">draft</span>
            <br/>
            <span className="text-zinc-600 text-3xl sm:text-4xl font-black block mt-2">the first round</span>
          </h1>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-7 leading-relaxed">
            Simulate every pick for all 32 teams. Study needs, match the talent — see if you could outpick the GMs.
          </p>
        </div>
      </div>

      {/* ── YEAR GRID: 3 cols, ~80% page width ── */}
      <div className="w-[82%] max-w-5xl mx-auto pb-16">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Select Draft Class</p>
          <p className="text-[10px] text-zinc-700">2016 – 2025</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {YEARS.map(yr=>{
            const meta=CM[yr]; const feats=FEAT[yr]||[];
            const isH=hov===yr;
            const pool=(DRAFT_DATA as any)[yr]||[];
            const eCnt=pool.filter((p:any)=>p.careerGrade==='S').length;
            return (
              <button key={yr} onClick={()=>onSelect(yr)}
                onMouseEnter={()=>setHov(yr)} onMouseLeave={()=>setHov(null)}
                className={`relative text-left rounded-2xl border overflow-hidden transition-all duration-250
                  ${isH?'bg-zinc-900 border-zinc-600 shadow-xl shadow-black/30 -translate-y-0.5':'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${meta.accent} to-transparent pointer-events-none transition-opacity ${isH?'opacity-100':'opacity-0'}`}/>
                {/* Top accent bar */}
                <div className={`h-[3px] w-full ${isH?meta.dot:'bg-zinc-800'} transition-colors`}/>

                <div className="relative p-5">
                  {/* Year + meta */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className={`text-5xl font-black leading-none ${isH?'text-white':'text-zinc-300'} transition-colors`}>{yr}</div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`}/>
                        <span className="text-[10px] text-zinc-500 font-semibold">{meta.tier}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-600 font-bold">{eCnt} elite</div>
                      <div className="text-[9px] text-zinc-700">{pool.length} players</div>
                    </div>
                  </div>

                  {/* 3 player headshots — inline layout, NO absolute positioning */}
                  <div className="flex items-start gap-3 mb-5">
                    {feats.map(f=>{
                      const shot=headshots[f.name.toLowerCase()];
                      const base=f.pos.split('/')[0];
                      const pc_=PC[base]||'bg-zinc-700/40 text-zinc-400 border-zinc-600';
                      return (
                        <div key={f.name} className="flex-1 flex flex-col items-center gap-1.5">
                          {/* Avatar */}
                          {shot
                            ?<img src={shot} alt={f.last} className="w-10 h-10 rounded-full object-cover border-2 border-zinc-600 bg-zinc-800 shrink-0"/>
                            :<div className={`w-10 h-10 rounded-full flex items-center justify-center text-[8px] font-black border-2 ${pc_} shrink-0`}>{base.slice(0,2)}</div>
                          }
                          {/* Pos badge — below avatar, no overlap */}
                          <span className={`text-[7px] font-black px-1.5 py-px rounded border ${pc_}`}>{f.pos}</span>
                          {/* Last name */}
                          <span className="text-[9px] text-zinc-400 font-medium truncate w-full text-center">{f.last}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  <div className={`flex items-center justify-between text-[10px] font-black ${isH?'text-amber-400':'text-zinc-700'} transition-colors`}>
                    <span>Simulate Draft</span>
                    <span className={`transition-transform ${isH?'translate-x-0.5':''}`}>→</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Grade key */}
        <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
          <span className="text-[9px] text-zinc-700 font-black uppercase tracking-wider mr-1">Career Grades:</span>
          {(['S','A','B','C','D'] as CareerGrade[]).map(g=>(
            <div key={g} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border ${GC[g].bg} ${GC[g].bd}`}>
              <span className={`font-black text-xs ${GC[g].tx}`}>{g}</span>
              <span className="text-zinc-600 text-[8px]">{GC[g].lbl}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESULTS SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

function Results({year,picks,pool,yt,onRestart,onNew}:{year:number;picks:PickSlot[];pool:DraftPlayer[];yt:Record<string,TeamInfo>;onRestart:()=>void;onNew:()=>void}) {
  const drafted=picks.filter(s=>s.player).map(s=>s.player!);
  const sc=calcScore(drafted);
  const did=new Set(drafted.map(p=>p.id));
  const missedS=pool.filter(p=>p.careerGrade==='S'&&!did.has(p.id));
  const bestLeft=pool.filter(p=>!did.has(p.id)).sort((a,b)=>GV[b.careerGrade]-GV[a.careerGrade]).slice(0,5);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="border-b border-zinc-800 px-6 py-3.5 flex items-center justify-between sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
        <button onClick={onRestart} className="text-zinc-500 hover:text-white text-sm font-medium transition">← Redo</button>
        <span className="font-black text-sm">{year} Draft Results</span>
        <button onClick={onNew} className="text-amber-400 hover:text-amber-300 text-sm font-black transition">New Year →</button>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="relative rounded-3xl border border-zinc-800 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 to-transparent pointer-events-none"/>
          <div className="relative flex flex-col sm:flex-row items-center gap-8 px-8 py-8">
            <div className="text-center shrink-0">
              <div className="text-6xl mb-2">{sc?.emoji}</div>
              <div className={`text-9xl font-black leading-none ${sc?.color}`}>{sc?.letter}</div>
            </div>
            <div className="flex-1">
              <div className="font-black text-2xl mb-1">{sc?.label}</div>
              <div className="text-zinc-500 text-sm mb-5">{year} Draft · {drafted.length}/{picks.length} picks simulated</div>
              <div className="flex gap-2 flex-wrap">
                {(['S','A','B','C','D'] as CareerGrade[]).map(g=>{const c=drafted.filter(p=>p.careerGrade===g).length;return c>0?(<div key={g} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${GC[g].bg} ${GC[g].bd}`}><span className={`font-black text-sm ${GC[g].tx}`}>{g}</span><span className="text-zinc-400 text-xs">×{c}</span></div>):null;})}
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={onRestart} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold text-sm transition">Redo</button>
              <button onClick={onNew} className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black rounded-xl font-black text-sm transition">New Year</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800"><h2 className="font-black">Your {year} First Round</h2><p className="text-zinc-600 text-[9px] mt-0.5">✓ = filled team need</p></div>
            <div className="divide-y divide-zinc-800/40 max-h-[600px] overflow-y-auto">
              {picks.map(slot=>{
                const p=slot.player; const cfg=p?GC[p.careerGrade]:null;
                const ti=yt[slot.teamAbbr]; const ok=p&&ti&&isFit(p.position,ti.n);
                return (
                  <div key={slot.pickNumber} className={`flex items-center gap-3 px-4 py-2.5 ${!p?'opacity-30':'hover:bg-zinc-800/25'} transition`}>
                    <span className="text-zinc-700 font-mono text-[9px] w-5 text-right shrink-0">{slot.pickNumber}</span>
                    <TeamLogo abbr={slot.teamAbbr} size={18}/><span className="text-[8px] font-black w-7 shrink-0 text-zinc-500">{slot.teamAbbr}</span>
                    {p&&cfg?(<>
                      <Ava src={p.headshot} pos={p.position} grade={p.careerGrade} size={28}/>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5"><span className="font-bold text-sm truncate">{p.name}</span><span className={`text-[7px] font-black px-1.5 py-px rounded border shrink-0 ${cfg.bg} ${cfg.bd} ${cfg.tx}`}>{p.careerGrade}</span>{ok&&<span className="text-emerald-400 text-[7px] font-black shrink-0">✓</span>}</div>
                        <span className="text-zinc-600 text-[8px]">{p.position} · {p.careerNote.slice(0,50)}{p.careerNote.length>50?'…':''}</span>
                      </div>
                    </>):<span className="text-zinc-700 text-xs flex-1">— skipped</span>}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="space-y-4">
            {missedS.length>0&&(<div className="bg-red-950/20 border border-red-500/20 rounded-2xl overflow-hidden"><div className="px-4 py-3 border-b border-red-500/15"><h3 className="font-black text-sm text-red-400">Elite Missed 😬</h3></div>{missedS.map(p=>(<div key={p.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-red-500/10 last:border-0"><Ava src={p.headshot} pos={p.position} grade={p.careerGrade} size={28}/><div className="flex-1 min-w-0"><div className="font-bold text-sm truncate">{p.name}</div><div className="text-zinc-600 text-[8px]">R{p.actualRound} #{p.actualPick} · {p.draftedBy}</div></div><span className={`text-[8px] font-black px-1.5 py-px rounded border ${GC.S.bg} ${GC.S.bd} ${GC.S.tx}`}>S</span></div>))}</div>)}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden"><div className="px-4 py-3 border-b border-zinc-800"><h3 className="font-black text-sm">Best Left on Board</h3></div>{bestLeft.map((p,i)=>(<div key={p.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-zinc-800/40 last:border-0"><span className="text-zinc-700 text-[8px] w-3">{i+1}</span><Ava src={p.headshot} pos={p.position} grade={p.careerGrade} size={28}/><div className="flex-1 min-w-0"><div className="font-semibold text-sm truncate">{p.name}</div><div className="text-zinc-600 text-[8px]">{p.position} · {p.draftedBy}</div></div><span className={`text-[8px] font-black px-1.5 py-px rounded border shrink-0 ${GC[p.careerGrade].bg} ${GC[p.careerGrade].bd} ${GC[p.careerGrade].tx}`}>{p.careerGrade}</span></div>))}</div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4"><div className="text-[8px] text-zinc-600 font-black uppercase tracking-wider mb-2.5">Grade Key</div><div className="grid grid-cols-5 gap-1.5">{(['S','A','B','C','D'] as CareerGrade[]).map(g=>(<div key={g} className={`flex flex-col items-center py-2 rounded-xl border ${GC[g].bg} ${GC[g].bd}`}><span className={`font-black text-base ${GC[g].tx}`}>{g}</span><span className="text-zinc-700 text-[7px]">{GC[g].lbl}</span></div>))}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PLAYER ROW ───────────────────────────────────────────────────────────────
// KEY FIX: DRAFT button gets a FIXED 100px column — always visible, never pushed off

function PlayerRow({player,rank,onDraft,canDraft,isFit:fit_}:{player:DraftPlayer;rank:number;onDraft:()=>void;canDraft:boolean;isFit:boolean}) {
  const g=GC[player.careerGrade];
  const pc_=posClass(player.position);

  return (
    <div className={`w-full flex items-center border-b border-zinc-800/50 transition-colors duration-100 ${fit_?'hover:bg-emerald-950/20':'hover:bg-zinc-800/15'}`} style={{minHeight:54}}>

      {/* Rank — 36px fixed */}
      <div className="w-9 shrink-0 self-stretch flex items-center justify-center text-[9px] font-black border-r border-zinc-800/60 tabular-nums text-zinc-700">
        {rank<=3?<span className="text-amber-500">{rank}</span>:rank}
      </div>

      {/* Grade color bar — 3px */}
      <div className={`w-[3px] self-stretch shrink-0 ${g.bar} opacity-60`}/>

      {/* Avatar — 36px + padding = ~56px fixed */}
      <div className="w-14 shrink-0 flex items-center justify-center py-1">
        <Ava src={player.headshot} pos={player.position} grade={player.careerGrade} size={36}/>
      </div>

      {/* Player info — flex-1 min-w-0 (takes remaining space, truncates) */}
      <div className="flex-1 min-w-0 py-2 pr-3">
        {/* Line 1: name + grade + fit badge */}
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-[13px] text-white truncate leading-tight">{player.name}</span>
          <span className={`text-[7px] font-black px-1.5 py-px rounded border shrink-0 ${g.bg} ${g.bd} ${g.tx}`}>{player.careerGrade}</span>
          {fit_&&<span className="text-emerald-400 text-[7px] font-black bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-px rounded shrink-0">✓FIT</span>}
        </div>
        {/* Line 2: position + draft info */}
        <div className="flex items-center gap-2">
          <span className={`text-[7px] font-black px-1.5 py-px rounded border ${pc_}`}>{player.position}</span>
          <span className="text-zinc-600 text-[8px]">
            {player.actualRound===0?'UDFA':`R${player.actualRound} #${player.actualPick}`} · {player.draftedBy}
            {' · '}<span className="text-zinc-600">{player.careerNote.slice(0,40)}{player.careerNote.length>40?'…':''}</span>
          </span>
        </div>
      </div>

      {/* DRAFT button — 100px fixed column, ALWAYS visible */}
      <div className="w-[100px] shrink-0 flex items-center justify-center px-2">
        {canDraft?(
          <button onClick={onDraft}
            className={`w-full font-black text-sm py-2 rounded-lg transition-all active:scale-95 shadow-md text-center
              ${fit_
                ?'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                :'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'}`}>
            DRAFT
          </button>
        ):(
          <button onClick={onDraft}
            className="w-full text-[9px] font-bold text-zinc-600 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-600 py-2 rounded-lg transition text-center">
            + Add
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function NFLRedraft() {
  const [headshots,setH]  =useState<Record<string,string>>({});
  const [year,setYear]    =useState<number|null>(null);
  const [pool,setPool]    =useState<DraftPlayer[]>([]);
  const [picks,setPicks]  =useState<PickSlot[]>([]);
  const [pidx,setPidx]    =useState(0);
  const [done,setDone]    =useState(false);
  const [fPos,setFPos]    =useState('ALL');
  const [fGrd,setFGrd]    =useState('ALL');
  const [srch,setSrch]    =useState('');
  const [tab,setTab]      =useState<'board'|'teams'>('board');
  const [expTeam,setExp]  =useState<string|null>(null);
  const [tSrch,setTSrch]  =useState('');
  const [hist,setHist]    =useState<{picks:PickSlot[];idx:number}[]>([]);
  const listRef  =useRef<HTMLDivElement>(null);
  const activeRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    fetch('/players.csv').then(r=>r.text()).then(csv=>{
      Papa.parse(csv,{header:true,skipEmptyLines:true,complete:({data})=>{
        const m:Record<string,string>={};
        (data as any[]).forEach((r:any)=>{if(r.display_name&&r.headshot)m[r.display_name.trim().toLowerCase()]=r.headshot;});
        setH(m);
      }});
    });
  },[]);

  useEffect(()=>{activeRef.current?.scrollIntoView({behavior:'smooth',block:'center'});},[pidx]);

  function start(yr:number){
    const raw:Omit<DraftPlayer,'headshot'>[]=(DRAFT_DATA as any)[yr]||[];
    setPool(raw.map(p=>({...p,headshot:headshots[p.name.toLowerCase()]})));
    setPicks((DRAFT_ORDER[yr]||[]).map((t,i)=>({pickNumber:i+1,teamAbbr:t,player:null})));
    setPidx(0);setYear(yr);setDone(false);
    setFPos('ALL');setFGrd('ALL');setSrch('');
    setTab('board');setExp(null);setTSrch('');setHist([]);
  }

  function draftP(player:DraftPlayer){
    if(pidx>=picks.length)return;
    setHist(h=>[...h,{picks:structuredClone(picks),idx:pidx}]);
    setPicks(prev=>{const n=[...prev];n[pidx]={...n[pidx],player};return n;});
    setPidx(i=>i+1);setSrch('');
  }

  function undo(){if(!hist.length)return;const l=hist[hist.length-1];setPicks(l.picks);setPidx(l.idx);setHist(h=>h.slice(0,-1));}
  function skip(){if(pidx>=picks.length)return;setHist(h=>[...h,{picks:structuredClone(picks),idx:pidx}]);setPidx(i=>i+1);}
  function reset(){setYear(null);setPool([]);setPicks([]);setDone(false);setHist([]);}

  if(!year) return <YearSelector onSelect={start} headshots={headshots}/>;

  const yt:Record<string,TeamInfo>=(TEAM_DATA as any)[year]||{};
  const isEnd=pidx>=picks.length;
  const otcSlot=picks[pidx];
  const otcTeam=otcSlot?yt[otcSlot.teamAbbr]:null;
  const dids=new Set(picks.filter(s=>s.player).map(s=>s.player!.id));
  const donePicks=picks.filter(s=>s.player);

  if(done) return <Results year={year} picks={picks} pool={pool} yt={yt} onRestart={()=>start(year)} onNew={reset}/>;

  const positions=['ALL',...Array.from(new Set(pool.map(p=>p.position.split('/')[0]))).sort()];

  const avail=pool.filter(p=>{
    if(dids.has(p.id))return false;
    if(fPos!=='ALL'&&p.position.split('/')[0]!==fPos&&p.position!==fPos)return false;
    if(fGrd!=='ALL'&&p.careerGrade!==fGrd)return false;
    if(srch&&!p.name.toLowerCase().includes(srch.toLowerCase()))return false;
    return true;
  }).sort((a,b)=>GV[b.careerGrade]-GV[a.careerGrade]);

  const fits=otcTeam?avail.filter(p=>isFit(p.position,otcTeam.n)):[];
  const rest=otcTeam?avail.filter(p=>!isFit(p.position,otcTeam.n)):avail;

  const filtTeams=Object.entries(yt).filter(([a])=>
    !tSrch||a.toLowerCase().includes(tSrch.toLowerCase())||(TN[a]||'').toLowerCase().includes(tSrch.toLowerCase())
  );

  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col overflow-hidden">

      {/* ── TOP BAR ── */}
      <header className="shrink-0 z-20 bg-zinc-950">
        <div className="border-b border-zinc-800 flex items-center px-3 py-2 gap-2 h-12">
          <button onClick={reset} className="text-zinc-600 hover:text-white text-xs font-bold transition shrink-0 px-2 py-1 rounded-lg hover:bg-zinc-800">← {year}</button>
          <div className="flex-1 flex justify-center">
            {otcSlot&&!isEnd?(
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0"/>
                <TeamLogo abbr={otcSlot.teamAbbr} size={16}/>
                <span className="text-amber-300 text-xs font-black">Pick {otcSlot.pickNumber} · {(TN[otcSlot.teamAbbr]||otcSlot.teamAbbr).split(' ').slice(-1)[0]}</span>
              </div>
            ):isEnd?(
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                <span className="text-emerald-400 text-xs font-black">✓ Round Complete</span>
              </div>
            ):null}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 mr-1">
              <span className="text-zinc-700 text-[9px] font-mono">{pidx}<span className="text-zinc-800">/{picks.length}</span></span>
              <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden"><div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all" style={{width:`${(pidx/picks.length)*100}%`}}/></div>
            </div>
            {hist.length>0&&<button onClick={undo} className="text-[9px] font-black text-zinc-500 hover:text-amber-400 border border-zinc-800 hover:border-amber-500/40 px-2 py-1.5 rounded-lg transition">↩ Undo</button>}
            {!isEnd&&<button onClick={skip} className="text-[9px] font-black text-zinc-600 hover:text-zinc-300 border border-zinc-800 px-2 py-1.5 rounded-lg transition">Skip</button>}
            {isEnd&&<button onClick={()=>setDone(true)} className="text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-black px-3 py-1.5 rounded-lg transition shadow shadow-amber-500/20">Results 🏆</button>}
          </div>
        </div>

        {/* OTC context bar */}
        {otcSlot&&!isEnd&&otcTeam&&(
          <div className="border-b border-zinc-800/50 bg-zinc-900/50 px-3 py-1.5 flex items-center gap-2 flex-wrap text-[8px]">
            <TeamLogo abbr={otcSlot.teamAbbr} size={20}/>
            <span className="font-black text-sm text-white">{TN[otcSlot.teamAbbr]}</span>
            <span className={`px-1.5 py-px rounded font-bold ${parseInt(otcTeam.w)>=10?'bg-emerald-500/15 text-emerald-400':'bg-zinc-800 text-zinc-500'}`}>{otcTeam.w}</span>
            <span className="text-zinc-800">·</span>
            <span className="text-zinc-600 font-black uppercase">Needs:</span>
            {otcTeam.n.map(n=>(<span key={n} className={`font-black px-1.5 py-px rounded border ${NC[n]||'bg-zinc-700 text-zinc-400 border-zinc-600'}`}>{n}</span>))}
            <span className="text-zinc-800">·</span>
            <span className="text-zinc-500 truncate hidden md:block">{otcTeam.s.slice(0,3).join(', ')}</span>
            {fits.length>0&&<span className="ml-auto font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg shrink-0">{fits.length} need fits</span>}
          </div>
        )}
      </header>

      {/* ── 3-COLUMN BODY ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: pick order — wider, shows player headshot + name when drafted */}
        <aside className="w-52 xl:w-60 shrink-0 border-r border-zinc-800 flex flex-col overflow-hidden bg-zinc-950">
          <div className="px-3 py-2 border-b border-zinc-800 shrink-0 flex items-center justify-between">
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{year} First Round</span>
            <span className="text-[8px] text-zinc-700 font-mono">{pidx}/{picks.length}</span>
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto">
            {picks.map((slot,i)=>{
              const isOTC=i===pidx&&!isEnd;
              const isNext=i===pidx+1;
              const p=slot.player;
              const gc=p?GC[p.careerGrade]:null;
              return (
                <div key={slot.pickNumber} ref={isOTC?activeRef:undefined}
                  className={`flex items-center gap-2 px-2.5 border-b transition-colors
                    ${isOTC?'bg-amber-500/8 border-l-[3px] border-l-amber-500 border-b-zinc-800':
                      isNext?'border-l-[3px] border-l-zinc-700/40 border-b-zinc-800/25 opacity-60':
                      p?'border-b-zinc-800/20':'border-b-zinc-800/10 opacity-20'}`}
                  style={{minHeight:44}}>
                  {/* Pick number */}
                  <span className={`text-[9px] font-mono w-4 text-right shrink-0 tabular-nums ${isOTC?'text-amber-400':'text-zinc-700'}`}>{slot.pickNumber}</span>
                  {/* Team logo */}
                  <TeamLogo abbr={slot.teamAbbr} size={18}/>
                  {/* Team abbr */}
                  <span className={`text-[8px] font-black w-7 shrink-0 ${isOTC?'text-amber-300':'text-zinc-500'}`}>{slot.teamAbbr}</span>
                  {/* Content */}
                  <div className="flex-1 min-w-0 flex items-center gap-1.5">
                    {p&&gc?(
                      <>
                        <Ava src={p.headshot} pos={p.position} grade={p.careerGrade} size={24}/>
                        <div className="min-w-0">
                          <div className={`text-[10px] font-bold truncate leading-tight ${gc.tx}`}>{p.name.split(' ').slice(-1)[0]}</div>
                          <span className={`text-[7px] font-black px-1 py-px rounded border ${gc.bg} ${gc.bd} ${gc.tx}`}>{p.careerGrade} · {p.position}</span>
                        </div>
                      </>
                    ):isOTC?(
                      <span className="text-amber-400 text-[9px] font-black">ON CLOCK</span>
                    ):(
                      <span className="text-zinc-600 text-[8px] truncate">{(TN[slot.teamAbbr]||'').split(' ').slice(-1)[0]}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* MIDDLE: player pool */}
        <main className="flex-1 flex flex-col overflow-hidden border-r border-zinc-800 min-w-0">

          {/* Filter bar */}
          <div className="shrink-0 px-3 py-2 border-b border-zinc-800 bg-zinc-950 flex items-center gap-2 flex-wrap">
            <div className="relative shrink-0">
              <input value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Search…"
                className="bg-zinc-800/80 border border-zinc-700 rounded-lg pl-2.5 pr-6 py-1 text-xs text-white placeholder-zinc-600 outline-none focus:border-amber-500/50 w-28"/>
              {srch&&<button onClick={()=>setSrch('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-[10px]">✕</button>}
            </div>
            <div className="flex gap-1 flex-wrap">
              {positions.slice(0,10).map(p=>(
                <button key={p} onClick={()=>setFPos(p)}
                  className={`text-[8px] font-black px-2 py-1 rounded-lg border transition ${fPos===p?'bg-amber-500 border-amber-500 text-black':'border-zinc-700/60 text-zinc-600 hover:border-zinc-500 hover:text-zinc-300'}`}>
                  {p}
                </button>
              ))}
            </div>
            <div className="flex gap-1 ml-auto">
              {['ALL','S','A','B','C','D'].map(g=>{
                const c=g!=='ALL'?GC[g as CareerGrade]:null;
                return(
                  <button key={g} onClick={()=>setFGrd(g)}
                    className={`text-[8px] font-black px-2 py-1 rounded-lg border transition ${fGrd===g?'bg-white border-white text-black':c?`${c.bg} ${c.bd} ${c.tx}`:'border-zinc-700 text-zinc-500 hover:border-zinc-500'}`}>
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Player list */}
          <div className="flex-1 overflow-y-auto">
            {avail.length===0&&(
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-zinc-700">
                <span className="text-2xl">🔍</span><span className="text-xs font-bold">No players match</span>
                <button onClick={()=>{setFPos('ALL');setFGrd('ALL');setSrch('');}} className="text-[10px] text-amber-400 hover:text-amber-300">Clear filters</button>
              </div>
            )}
            {fits.length>0&&(
              <div className="sticky top-0 z-10 px-3 py-1.5 bg-emerald-950/80 border-b border-emerald-500/20 backdrop-blur flex items-center gap-2">
                <span className="text-[8px] text-emerald-400 font-black uppercase tracking-wider">✓ Fills {otcSlot?.teamAbbr} Need</span>
                <span className="text-[8px] text-emerald-700">{fits.length} players</span>
              </div>
            )}
            {fits.map((p,i)=><PlayerRow key={p.id} player={p} rank={i+1} onDraft={()=>draftP(p)} canDraft={!isEnd} isFit/>)}
            {fits.length>0&&rest.length>0&&(
              <div className="sticky top-0 z-10 px-3 py-1.5 bg-zinc-900/90 border-b border-zinc-800/70 backdrop-blur">
                <span className="text-[8px] text-zinc-600 font-black uppercase tracking-wider">All Available</span>
              </div>
            )}
            {rest.map((p,i)=><PlayerRow key={p.id} player={p} rank={fits.length+i+1} onDraft={()=>draftP(p)} canDraft={!isEnd} isFit={false}/>)}
          </div>
        </main>

        {/* RIGHT: board + teams */}
        <aside className="w-56 xl:w-64 shrink-0 flex flex-col overflow-hidden bg-zinc-950">

          {/* Tab bar — prominent, clear active state */}
          <div className="flex border-b border-zinc-800 shrink-0">
            <button onClick={()=>setTab('board')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-black transition-all
                ${tab==='board'?'text-amber-400 border-b-2 border-amber-500 bg-amber-500/5':'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}>
              📋 Board {donePicks.length>0&&<span className={`text-[8px] px-1.5 py-px rounded-full ${tab==='board'?'bg-amber-500/20 text-amber-300':'bg-zinc-800 text-zinc-600'}`}>{donePicks.length}</span>}
            </button>
            <button onClick={()=>setTab('teams')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-black transition-all
                ${tab==='teams'?'text-amber-400 border-b-2 border-amber-500 bg-amber-500/5':'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}>
              🏟️ Teams
            </button>
          </div>

          {/* BOARD TAB */}
          {tab==='board'&&(
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/30">
                {donePicks.length===0&&(
                  <div className="flex flex-col items-center justify-center h-32 text-zinc-700 text-[10px] gap-1.5">
                    <span className="text-xl opacity-40">📋</span>Draft your first player
                  </div>
                )}
                {donePicks.map(slot=>{
                  const p=slot.player!; const c=GC[p.careerGrade];
                  const ti=yt[slot.teamAbbr]; const ok=ti&&isFit(p.position,ti.n);
                  return(
                    <div key={slot.pickNumber} className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-zinc-900/40 transition">
                      <span className="text-zinc-700 font-mono text-[8px] w-4 text-right shrink-0">{slot.pickNumber}</span>
                      <TeamLogo abbr={slot.teamAbbr} size={16}/>
                      <Ava src={p.headshot} pos={p.position} grade={p.careerGrade} size={22}/>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold truncate text-white">{p.name}</div>
                        <div className="flex items-center gap-1">
                          <span className="text-zinc-600 text-[7px]">{p.position}</span>
                          {ok&&<span className="text-emerald-500 text-[7px] font-black">✓</span>}
                          <span className={`text-[7px] font-black px-1 py-px rounded border ${c.bg} ${c.bd} ${c.tx}`}>{p.careerGrade}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {isEnd&&(
                <div className="p-3 border-t border-zinc-800 shrink-0">
                  <button onClick={()=>setDone(true)} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black rounded-xl py-3 text-sm transition shadow-lg shadow-amber-500/20">
                    Grade My Draft 🏆
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TEAMS TAB */}
          {tab==='teams'&&(
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-2.5 pt-2 pb-2 border-b border-zinc-800 shrink-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] text-zinc-600 font-black uppercase tracking-wider">32 Teams</span>
                  {/* Clear back-to-board button */}
                  <button onClick={()=>setTab('board')} className="flex items-center gap-1 text-[9px] font-black text-zinc-500 hover:text-amber-400 border border-zinc-800 hover:border-amber-500/40 px-2 py-1 rounded-lg transition">
                    ← Board
                  </button>
                </div>
                <input value={tSrch} onChange={e=>setTSrch(e.target.value)} placeholder="Search teams…"
                  className="w-full bg-zinc-800/70 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-[10px] text-white placeholder-zinc-600 outline-none focus:border-amber-500/50"/>
              </div>
              <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
                {filtTeams.map(([abbr,info])=>{
                  const isOTC=otcSlot?.teamAbbr===abbr&&!isEnd;
                  const isExp=expTeam===abbr;
                  const made=picks.filter(s=>s.teamAbbr===abbr&&s.player);
                  const avFits=pool.filter(p=>!dids.has(p.id)&&isFit(p.position,info.n)).sort((a,b)=>GV[b.careerGrade]-GV[a.careerGrade]).slice(0,3);
                  return(
                    <button key={abbr} onClick={()=>setExp(isExp?null:abbr)}
                      className={`w-full text-left rounded-xl border transition-all ${isOTC?'bg-amber-500/8 border-amber-500/40':isExp?'bg-zinc-800/50 border-zinc-600':'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'}`}>
                      <div className="p-2.5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <TeamLogo abbr={abbr} size={20}/>
                          <span className="font-black text-[11px] text-white">{abbr}</span>
                          {isOTC&&<span className="text-[7px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-px rounded-full animate-pulse">CLOCK</span>}
                          <span className={`text-[8px] px-1 py-px rounded font-bold ml-auto ${parseInt(info.w)>=10?'bg-emerald-500/15 text-emerald-400':'bg-zinc-800 text-zinc-500'}`}>{info.w}</span>
                          <span className={`text-zinc-500 text-xs transition-transform ${isExp?'rotate-90':''}`}>›</span>
                        </div>
                        <div className="text-[7px] text-zinc-500 truncate mb-1.5">⭐ {info.s.slice(0,2).join(' · ')}</div>
                        <div className="flex gap-1 flex-wrap">
                          {info.n.map(n=>(<span key={n} className={`text-[7px] font-black px-1 py-px rounded border ${NC[n]||'bg-zinc-700 text-zinc-400 border-zinc-600'}`}>{n}</span>))}
                        </div>
                        {made.length>0&&(
                          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                            {made.map(s=>(<div key={s.pickNumber} className="flex items-center gap-1"><Ava src={s.player!.headshot} pos={s.player!.position} grade={s.player!.careerGrade} size={16}/><span className={`text-[7px] font-bold ${GC[s.player!.careerGrade].tx}`}>{s.player!.name.split(' ').slice(-1)[0]}</span></div>))}
                          </div>
                        )}
                        {isExp&&(
                          <div className="mt-2 pt-2 border-t border-zinc-700/40 space-y-2">
                            <div>
                              <div className="text-[7px] text-zinc-600 font-black uppercase tracking-wider mb-1">Roster Stars</div>
                              <div className="flex flex-wrap gap-1">{info.s.map(s=>(<span key={s} className="text-[7px] bg-zinc-800 border border-zinc-700/70 px-1.5 py-px rounded text-zinc-400">{s}</span>))}</div>
                            </div>
                            {avFits.length>0&&(
                              <div>
                                <div className="text-[7px] text-emerald-700 font-black uppercase tracking-wider mb-1">Available Need Fits</div>
                                {avFits.map(p=>{const c=GC[p.careerGrade];return(
                                  <div key={p.id} className="flex items-center gap-1.5 py-0.5">
                                    <Ava src={p.headshot} pos={p.position} grade={p.careerGrade} size={18}/>
                                    <span className={`text-[7px] font-black px-1 py-px rounded border shrink-0 ${c.bg} ${c.bd} ${c.tx}`}>{p.careerGrade}</span>
                                    <span className="text-[9px] font-semibold text-white truncate">{p.name}</span>
                                  </div>
                                );})}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}