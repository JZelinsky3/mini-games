'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ─────────────────────────────────────────────────────────── */
interface CombineStats {
  fortyYard?: number;
  bench?:     number;
  vertical?:  number;
  broadJump?: number;
  threeCone?: number;
  shuttle?:   number;
}
interface DraftPlayer {
  name: string; year: number; round: number; pick: number;
  team: string; pos: string; college: string;
  height: string; weight: number;
  stats: CombineStats;
  note?: string;
}
type StatKey = keyof CombineStats;
type Difficulty = 'rookie' | 'pro' | 'legend';

/* ─── Stat metadata ──────────────────────────────────────────────────── */
const STAT_META: Record<StatKey, { label: string; unit: string; inverse: boolean; min: number; max: number }> = {
  fortyYard: { label: '40-Yard Dash', unit: 's',   inverse: true,  min: 4.20, max: 5.60 },
  bench:     { label: 'Bench Press',  unit: ' reps',inverse: false, min: 0,    max: 50   },
  vertical:  { label: 'Vertical Jump',unit: '"',    inverse: false, min: 20,   max: 50   },
  broadJump: { label: 'Broad Jump',   unit: '"',    inverse: false, min: 80,   max: 150  },
  threeCone: { label: '3-Cone Drill', unit: 's',   inverse: true,  min: 6.30, max: 8.50 },
  shuttle:   { label: 'Shuttle Run',  unit: 's',   inverse: true,  min: 3.90, max: 5.00 },
};

const REVEAL_ORDER: StatKey[] = ['fortyYard','bench','vertical','broadJump','threeCone','shuttle'];
const REVEAL_COST  = 75;
const COLLEGE_COST = 150;
const PICK_COST    = 200;
const OPTIONS_COST = 150;
const WRONG_COST   = 100;

const DIFF_CFG = {
  rookie: { label: 'Rookie', maxScore: 600, startRevealed: 2, hint: 'Position & year shown. Two stats free.' },
  pro:    { label: 'Pro',    maxScore: 800, startRevealed: 0, hint: 'Position & year shown. No free stats.' },
  legend: { label: 'Legend', maxScore: 1000,startRevealed: 0, hint: 'Position only. Guess blind for max points.' },
} as const;

const PLAYERS_PER_GAME = 5;

/* ─── Stat helpers ───────────────────────────────────────────────────── */
function pct(key: StatKey, val: number): number {
  const m = STAT_META[key];
  const raw = (val - m.min) / (m.max - m.min);
  const p   = Math.max(0, Math.min(1, m.inverse ? 1 - raw : raw));
  return Math.round(p * 100);
}
function grade(p: number): string {
  if (p >= 92) return 'ELITE';
  if (p >= 78) return 'EXCELLENT';
  if (p >= 58) return 'ABOVE AVG';
  if (p >= 38) return 'AVERAGE';
  if (p >= 20) return 'BELOW AVG';
  return 'LOW';
}
function gradeColor(p: number): string {
  if (p >= 92) return '#ffd700';
  if (p >= 78) return '#c9a62a';
  if (p >= 58) return '#5b9bd5';
  if (p >= 38) return '#8a9ab0';
  return '#a05050';
}
function ordinal(n: number): string {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function norm(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z\s]/g, '');
}
function nameMatch(guess: string, correct: string): boolean {
  const g = norm(guess).split(/\s+/).filter(Boolean);
  const c = norm(correct).split(/\s+/).filter(Boolean);
  if (!g.length || !c.length) return false;
  if (g.length === 1) return c.some(p => p === g[0]);
  return norm(guess) === norm(correct) || g.every(p => c.includes(p));
}

/* ─── Draft player database ─────────────────────────────────────────── */
const ALL_PLAYERS: DraftPlayer[] = [
  { name:'Tom Brady',        year:2000,round:6,pick:199, team:'New England Patriots', pos:'QB', college:'Michigan',
    height:"6'4\"",weight:211, stats:{ fortyYard:5.28,vertical:24.5,broadJump:110,shuttle:4.38 },
    note:'The greatest draft steal in NFL history' },
  { name:'Calvin Johnson',   year:2007,round:1,pick:2,   team:'Detroit Lions',        pos:'WR', college:'Georgia Tech',
    height:"6'5\"",weight:236, stats:{ fortyYard:4.35,bench:17,vertical:42.0,broadJump:138,threeCone:6.69,shuttle:4.21 },
    note:'Recorded the highest vertical ever by a wide receiver at the combine' },
  { name:'D.K. Metcalf',     year:2019,round:2,pick:64,  team:'Seattle Seahawks',     pos:'WR', college:'Ole Miss',
    height:"6'3\"",weight:228, stats:{ fortyYard:4.33,bench:27,vertical:40.5,broadJump:132,threeCone:7.38,shuttle:4.51 },
    note:'Only WR in combine history to run sub-4.35 at 228 lbs' },
  { name:'Aaron Donald',     year:2014,round:1,pick:13,  team:'Los Angeles Rams',     pos:'DT', college:'Pittsburgh',
    height:"6'1\"",weight:285, stats:{ fortyYard:4.68,bench:35,vertical:32.5,broadJump:121,threeCone:6.96,shuttle:4.43 } },
  { name:'Patrick Mahomes',  year:2017,round:1,pick:10,  team:'Kansas City Chiefs',   pos:'QB', college:'Texas Tech',
    height:"6'3\"",weight:225, stats:{ fortyYard:4.80,vertical:31.5,broadJump:116 } },
  { name:'Lamar Jackson',    year:2018,round:1,pick:32,  team:'Baltimore Ravens',     pos:'QB', college:'Louisville',
    height:"6'2\"",weight:216, stats:{ fortyYard:4.34,vertical:38.0,broadJump:126 },
    note:'Fastest 40-yard dash ever recorded by a QB at the NFL combine' },
  { name:'Myles Garrett',    year:2017,round:1,pick:1,   team:'Cleveland Browns',     pos:'EDGE',college:'Texas A&M',
    height:"6'4\"",weight:272, stats:{ fortyYard:4.64,bench:29,vertical:41.5,broadJump:131,threeCone:7.02,shuttle:4.52 } },
  { name:'J.J. Watt',        year:2011,round:1,pick:11,  team:'Houston Texans',       pos:'DE', college:'Wisconsin',
    height:"6'5\"",weight:290, stats:{ fortyYard:4.84,bench:34,vertical:37.0,broadJump:122,threeCone:7.22,shuttle:4.60 } },
  { name:'Odell Beckham Jr.',year:2014,round:1,pick:12,  team:'New York Giants',      pos:'WR', college:'LSU',
    height:"5'11\"",weight:198,stats:{ fortyYard:4.43,bench:13,vertical:38.5,broadJump:121,threeCone:6.77,shuttle:4.24 } },
  { name:'Julio Jones',      year:2011,round:1,pick:6,   team:'Atlanta Falcons',      pos:'WR', college:'Alabama',
    height:"6'3\"",weight:220, stats:{ fortyYard:4.34,bench:17,vertical:38.5,broadJump:136,threeCone:7.04,shuttle:4.36 } },
  { name:'Randy Moss',       year:1998,round:1,pick:21,  team:'Minnesota Vikings',    pos:'WR', college:'Marshall',
    height:"6'4\"",weight:210, stats:{ fortyYard:4.25,vertical:38.0 } },
  { name:'Chris Johnson',    year:2008,round:1,pick:24,  team:'Tennessee Titans',     pos:'RB', college:'East Carolina',
    height:"5'11\"",weight:197,stats:{ fortyYard:4.24,bench:21,vertical:37.0,broadJump:131,threeCone:6.87,shuttle:4.21 },
    note:'Set the all-time combine 40-yard dash record' },
  { name:'Adrian Peterson',  year:2007,round:1,pick:7,   team:'Minnesota Vikings',    pos:'RB', college:'Oklahoma',
    height:"6'1\"",weight:217, stats:{ fortyYard:4.40,bench:29,vertical:40.5,broadJump:134,threeCone:7.00,shuttle:4.34 } },
  { name:'Jerry Rice',       year:1985,round:1,pick:16,  team:'San Francisco 49ers',  pos:'WR', college:'Mississippi Valley State',
    height:"6'2\"",weight:200, stats:{ fortyYard:4.71,vertical:33.5 },
    note:'The GOAT WR nearly fell out of the first round due to combine times' },
  { name:'Aaron Rodgers',    year:2005,round:1,pick:24,  team:'Green Bay Packers',    pos:'QB', college:'California',
    height:"6'2\"",weight:223, stats:{ fortyYard:4.71,vertical:30.0,broadJump:112 } },
  { name:'Jonathan Taylor',  year:2020,round:2,pick:41,  team:'Indianapolis Colts',   pos:'RB', college:'Wisconsin',
    height:"5'10\"",weight:226,stats:{ fortyYard:4.39,bench:24,vertical:33.5,broadJump:122,threeCone:7.01,shuttle:4.40 } },
  { name:'Justin Jefferson', year:2020,round:1,pick:22,  team:'Minnesota Vikings',    pos:'WR', college:'LSU',
    height:"6'1\"",weight:195, stats:{ fortyYard:4.43,vertical:37.5,broadJump:130,threeCone:6.79,shuttle:4.21 } },
  { name:'Cam Newton',       year:2011,round:1,pick:1,   team:'Carolina Panthers',    pos:'QB', college:'Auburn',
    height:"6'5\"",weight:248, stats:{ fortyYard:4.59,vertical:35.5,broadJump:126 } },
  { name:'Reggie Bush',      year:2006,round:1,pick:2,   team:'New Orleans Saints',   pos:'RB', college:'USC',
    height:"6'0\"",weight:200, stats:{ fortyYard:4.33,bench:20,vertical:38.0,broadJump:130,threeCone:6.72,shuttle:4.18 } },
  { name:'Sauce Gardner',    year:2022,round:1,pick:4,   team:'New York Jets',        pos:'CB', college:'Cincinnati',
    height:"6'3\"",weight:190, stats:{ fortyYard:4.41,vertical:39.5,broadJump:134,threeCone:6.73,shuttle:4.23 } },
  { name:'Micah Parsons',    year:2021,round:1,pick:12,  team:'Dallas Cowboys',       pos:'LB', college:'Penn State',
    height:"6'3\"",weight:245, stats:{ fortyYard:4.36,bench:29,vertical:40.5,broadJump:128 } },
  { name:'CeeDee Lamb',      year:2020,round:1,pick:17,  team:'Dallas Cowboys',       pos:'WR', college:'Oklahoma',
    height:"6'2\"",weight:198, stats:{ fortyYard:4.50,bench:14,vertical:36.5,broadJump:123,threeCone:6.89,shuttle:4.37 } },
];

/* ─── Pos badge colors ───────────────────────────────────────────────── */
const POS_COLOR: Record<string, string> = {
  QB:'#d4380d', WR:'#1677ff', RB:'#389e0d', TE:'#722ed1',
  OT:'#d46b08', OL:'#d46b08', DE:'#eb2f96', EDGE:'#eb2f96',
  DT:'#08979c', CB:'#1d39c4', S:'#237804', LB:'#c41d7f', K:'#8c8c8c',
};
function posColor(pos: string): string { return POS_COLOR[pos] ?? '#595959'; }

/* ─── Score calc ─────────────────────────────────────────────────────── */
function calcScore(diff: Difficulty, revealCount: number, collegeRevealed: boolean,
                   pickRevealed: boolean, optionsUsed: boolean, wrongGuesses: number): number {
  const max = DIFF_CFG[diff].maxScore;
  let deduct = revealCount * REVEAL_COST;
  if (collegeRevealed) deduct += COLLEGE_COST;
  if (pickRevealed)    deduct += PICK_COST;
  if (optionsUsed)     deduct += OPTIONS_COST;
  deduct += wrongGuesses * WRONG_COST;
  return Math.max(50, max - deduct);
}

/* ─── Shuffle ────────────────────────────────────────────────────────── */
function pickGame(): DraftPlayer[] {
  const arr = [...ALL_PLAYERS].sort(() => Math.random() - 0.5);
  return arr.slice(0, PLAYERS_PER_GAME);
}

/* ─── Component ──────────────────────────────────────────────────────── */
export default function DraftRoom() {
  const [diff, setDiff]               = useState<Difficulty>('pro');
  const [gamePlayers, setGamePlayers] = useState<DraftPlayer[]>([]);
  const [round, setRound]             = useState(0);          // 0-indexed
  const [revealed, setRevealed]       = useState<StatKey[]>([]);
  const [collegeShown, setCollegeShown] = useState(false);
  const [pickShown, setPickShown]     = useState(false);
  const [optionsShown, setOptionsShown] = useState(false);
  const [options, setOptions]         = useState<string[]>([]);
  const [guess, setGuess]             = useState('');
  const [wrong, setWrong]             = useState(0);
  const [msg, setMsg]                 = useState('');
  const [isErr, setIsErr]             = useState(false);
  const [won, setWon]                 = useState(false);
  const [given, setGiven]             = useState(false);      // gave up
  const [scores, setScores]           = useState<number[]>([]);
  const [showFinal, setShowFinal]     = useState(false);
  const [showHowTo, setShowHowTo]     = useState(false);
  const [showAuth, setShowAuth]       = useState(false);
  const [animKey, setAnimKey]         = useState(0);          // key for card re-mount
  const [announcing, setAnnouncing]   = useState(false);      // draft pick announcement anim
  const [userInit, setUserInit]       = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  /* Auth */
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const n = user.user_metadata?.full_name || user.email || 'U';
        setUserInit(n[0].toUpperCase());
      }
    });
  }, []);

  /* Start / restart */
  const startGame = useCallback((d: Difficulty) => {
    const pl = pickGame();
    setGamePlayers(pl);
    setRound(0);
    const startRev = DIFF_CFG[d].startRevealed;
    setRevealed(REVEAL_ORDER.slice(0, startRev) as StatKey[]);
    setCollegeShown(false); setPickShown(false); setOptionsShown(false); setOptions([]);
    setGuess(''); setMsg(''); setIsErr(false); setWon(false); setGiven(false); setScores([]);
    setShowFinal(false); setAnnouncing(false); setAnimKey(k => k + 1);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => { startGame(diff); }, []); // eslint-disable-line

  /* Current player */
  const player = gamePlayers[round] ?? null;

  /* Available stats to reveal */
  const nextStat = useMemo((): StatKey | null => {
    for (const key of REVEAL_ORDER) {
      if (!revealed.includes(key) && player?.stats[key] != null) return key;
    }
    return null;
  }, [revealed, player]);

  /* Generate options pool */
  const makeOptions = useCallback((p: DraftPlayer) => {
    const same = ALL_PLAYERS.filter(x => x.pos === p.pos && x.name !== p.name);
    const shuffled = same.sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.name);
    const opts = [...shuffled, p.name].sort(() => Math.random() - 0.5);
    setOptions(opts); setOptionsShown(true);
  }, []);

  /* Reveal next stat */
  const revealStat = useCallback(() => {
    if (!nextStat || won || given) return;
    setRevealed(r => [...r, nextStat]);
  }, [nextStat, won, given]);

  /* Reveal college */
  const revealCollege = useCallback(() => {
    if (collegeShown || won || given) return;
    setCollegeShown(true);
  }, [collegeShown, won, given]);

  /* Reveal pick */
  const revealPick = useCallback(() => {
    if (pickShown || won || given) return;
    setPickShown(true);
  }, [pickShown, won, given]);

  /* Submit guess */
  const submitGuess = useCallback((guessStr?: string) => {
    const g = guessStr ?? guess;
    if (!player || !g.trim() || won || given) return;
    if (nameMatch(g, player.name)) {
      const s = calcScore(diff, revealed.length, collegeShown, pickShown, optionsShown, wrong);
      const newScores = [...scores, s];
      setScores(newScores);
      setWon(true); setMsg('');
      setAnnouncing(true);
      setTimeout(() => setAnnouncing(false), 3200);
      setGuess('');
      if (!userInit) setTimeout(() => setShowAuth(true), 3500);
    } else {
      setIsErr(true);
      setTimeout(() => setIsErr(false), 420);
      setWrong(w => w + 1);
      setMsg(`Not quite. −${WRONG_COST} pts`);
    }
  }, [player, guess, won, given, diff, revealed, collegeShown, pickShown, optionsShown, wrong, scores, userInit]);

  /* Give up */
  const giveUp = useCallback(() => {
    if (!player || won || given) return;
    setGiven(true); setScores(s => [...s, 0]); setMsg('');
  }, [player, won, given]);

  /* Next round */
  const nextRound = useCallback(() => {
    const nextR = round + 1;
    if (nextR >= PLAYERS_PER_GAME) { setShowFinal(true); return; }
    setRound(nextR);
    const startRev = DIFF_CFG[diff].startRevealed;
    setRevealed(REVEAL_ORDER.slice(0, startRev) as StatKey[]);
    setCollegeShown(false); setPickShown(false);
    setOptionsShown(false); setOptions([]);
    setGuess(''); setMsg(''); setIsErr(false);
    setWon(false); setGiven(false); setWrong(0); setAnnouncing(false);
    setAnimKey(k => k + 1);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [round, diff]);

  /* Change diff */
  const changeDiff = useCallback((d: Difficulty) => {
    setDiff(d); startGame(d);
  }, [startGame]);

  if (!player) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="dr-loading"><span className="g-pulse" style={{ color: '#c9a62a' }}>LOADING WAR ROOM…</span></div>
    </>
  );

  const cfg         = DIFF_CFG[diff];
  const liveScore   = won || given
    ? scores[scores.length - 1]
    : calcScore(diff, revealed.length, collegeShown, pickShown, optionsShown, wrong);
  const totalScore  = scores.reduce((a, b) => a + b, 0);
  const maxTotal    = cfg.maxScore * PLAYERS_PER_GAME;
  const done        = won || given;
  const isLast      = round === PLAYERS_PER_GAME - 1;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Scanline overlay */}
      <div className="dr-scanlines" aria-hidden="true" />

      {/* Draft announcement */}
      {announcing && player && (
        <div className="dr-announce">
          <div className="dr-announce-inner">
            <div className="dr-announce-label">WITH THE {ordinal(player.pick).toUpperCase()} PICK</div>
            <div className="dr-announce-round">ROUND {player.round} — {player.year} NFL DRAFT</div>
            <div className="dr-announce-team">{player.team.toUpperCase()}</div>
            <div className="dr-announce-select">SELECTS</div>
            <div className="dr-announce-name">{player.name.toUpperCase()}</div>
            <div className="dr-announce-pos" style={{ color: posColor(player.pos) }}>{player.pos}</div>
            <div className="dr-announce-college">{player.college}</div>
          </div>
        </div>
      )}

      {/* ── Nav ── */}
      <nav className="cp-nav">
        <div className="cp-nav-l">
          <Link href="/" className="g-back">← Hub</Link>
        </div>
        <div className="cp-nav-c">
          <span className="dr-nav-pip" />
          DRAFT ROOM
        </div>
        <div className="cp-nav-r">
          {userInit
            ? <Link href="/profile" className="cp-badge">{userInit}</Link>
            : <Link href="/login"   className="cp-signin">SIGN IN</Link>}
        </div>
      </nav>

      <main className="dr-main">

        {/* ── Diff tabs ── */}
        <div className="g-tabs">
          {(Object.keys(DIFF_CFG) as Difficulty[]).map(d => (
            <button key={d} onClick={() => changeDiff(d)}
              className={`g-tab${diff === d ? ' g-tab-on' : ''}`}
              style={diff === d ? { background: '#0e1e30', color: '#c9a62a', borderColor: '#c9a62a' } : {}}>
              {DIFF_CFG[d].label.toUpperCase()}
              <span className="g-tab-sub">{DIFF_CFG[d].maxScore}pt</span>
            </button>
          ))}
        </div>
        <div className="g-rules">{cfg.hint}</div>

        {/* ── Draft progress ── */}
        <div className="dr-progress-bar">
          {Array.from({ length: PLAYERS_PER_GAME }).map((_, i) => (
            <div key={i} className={`dr-pick-dot${i < round ? ' done' : i === round ? ' active' : ''}`}>
              <div className="dr-pick-num">{i + 1}</div>
            </div>
          ))}
          <div className="dr-progress-fill-bg">
            <div className="dr-progress-fill" style={{ width: `${(round / (PLAYERS_PER_GAME - 1)) * 100}%` }} />
          </div>
        </div>

        {/* ── Scoreboard ── */}
        <div className="dr-scoreboard">
          <div className="dr-sb-left">
            <div className="dr-sb-label">CURRENT PICK</div>
            <div className={`dr-live-score${won ? ' won' : given ? ' lost' : ''}`}>{liveScore}</div>
            <div className="dr-sb-sub">pts available{done ? '' : ` · −${REVEAL_COST} per stat`}</div>
          </div>
          <div className="dr-sb-center">
            <div className="dr-coin-stack">
              <div className="dr-coin" />
              <div className="dr-coin" style={{ top: '-4px' }} />
              <div className="dr-coin" style={{ top: '-8px' }} />
            </div>
            <div className="dr-total-score">{totalScore}</div>
            <div className="dr-sb-label">TOTAL · MAX {maxTotal}</div>
          </div>
          <div className="dr-sb-right">
            <div className="dr-sb-label">PICK</div>
            <div className="dr-pick-counter">{round + 1}<span className="dr-pick-of">/{PLAYERS_PER_GAME}</span></div>
            <div className="dr-sb-sub">{wrong > 0 ? `${wrong} wrong · −${wrong * WRONG_COST}pts` : 'No wrong guesses'}</div>
          </div>
        </div>

        {/* ── Scouting card ── */}
        <div className="dr-card" key={animKey}>
          {/* Card header */}
          <div className="dr-card-header">
            <div className="dr-card-left">
              <div className="dr-classified">SCOUTING REPORT</div>
              <div className="dr-pos-badge" style={{ background: posColor(player.pos), boxShadow: `0 0 20px ${posColor(player.pos)}55` }}>
                {player.pos}
              </div>
            </div>
            <div className="dr-card-right">
              <div className="dr-year-badge">{player.year} NFL DRAFT</div>
              {diff !== 'legend' && (
                <div className="dr-year-badge" style={{ background: 'rgba(201,166,42,.1)', borderColor: 'rgba(201,166,42,.2)', color: '#c9a62a' }}>
                  {player.year} COMBINE
                </div>
              )}
            </div>
          </div>

          {/* Measurements */}
          <div className="dr-measurements">
            <div className="dr-meas">
              <div className="dr-meas-label">HT</div>
              <div className="dr-meas-val">{player.height}</div>
            </div>
            <div className="dr-meas-div" />
            <div className="dr-meas">
              <div className="dr-meas-label">WT</div>
              <div className="dr-meas-val">{player.weight} <span style={{ fontSize:'.7rem', color:'#5a7a9a' }}>lbs</span></div>
            </div>
            {collegeShown && (
              <>
                <div className="dr-meas-div" />
                <div className="dr-meas" style={{ animation: 'stat-in .4s ease' }}>
                  <div className="dr-meas-label">COLLEGE</div>
                  <div className="dr-meas-val" style={{ fontSize: '1.1rem' }}>{player.college}</div>
                </div>
              </>
            )}
            {pickShown && (
              <>
                <div className="dr-meas-div" />
                <div className="dr-meas" style={{ animation: 'stat-in .4s ease' }}>
                  <div className="dr-meas-label">DRAFT SLOT</div>
                  <div className="dr-meas-val" style={{ fontSize: '1rem' }}>
                    Rd {player.round} · Pk {player.pick}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Stat bars */}
          <div className="dr-stats-grid">
            {revealed.map((key, i) => {
              const val = player.stats[key];
              if (val == null) return null;
              const m    = STAT_META[key];
              const p    = pct(key, val);
              const g    = grade(p);
              const gc   = gradeColor(p);
              return (
                <div key={key} className="dr-stat-row" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="dr-stat-name">{m.label}</div>
                  <div className="dr-stat-bar-wrap">
                    <div className="dr-stat-bar-bg">
                      <div className="dr-stat-bar-fill"
                        style={{ width: `${p}%`, background: `linear-gradient(90deg, ${gc}99, ${gc})` }} />
                    </div>
                  </div>
                  <div className="dr-stat-right">
                    <div className="dr-stat-val">{val}{m.unit}</div>
                    <div className="dr-stat-grade" style={{ color: gc }}>{g}</div>
                  </div>
                </div>
              );
            })}
            {/* Locked stat placeholders */}
            {REVEAL_ORDER.filter(k => !revealed.includes(k) && player.stats[k] != null).map(key => (
              <div key={key} className="dr-stat-row locked">
                <div className="dr-stat-name" style={{ color: '#1e3352' }}>{STAT_META[key].label}</div>
                <div className="dr-stat-bar-wrap">
                  <div className="dr-stat-bar-bg">
                    <div className="dr-stat-bar-fill dr-stat-bar-locked" style={{ width: '40%' }} />
                  </div>
                </div>
                <div className="dr-stat-right">
                  <div className="dr-stat-val" style={{ color: '#1e3352' }}>—</div>
                  <div className="dr-stat-grade" style={{ color: '#1a3050' }}>LOCKED</div>
                </div>
              </div>
            ))}
          </div>

          {/* Redacted overlay if no stats yet */}
          {revealed.length === 0 && (
            <div className="dr-redacted">
              <div className="dr-redacted-label">STATS CLASSIFIED</div>
              <div className="dr-redacted-sub">Reveal combine data to identify the prospect</div>
            </div>
          )}

          {/* Won state */}
          {won && (
            <div className="dr-won-banner">
              <div className="dr-won-label">✓ IDENTIFIED</div>
              <div className="dr-won-name">{player.name}</div>
              {player.note && <div className="dr-won-note">"{player.note}"</div>}
              <div className="dr-won-score">+{liveScore} pts</div>
            </div>
          )}

          {/* Given up state */}
          {given && (
            <div className="dr-given-banner">
              <div className="dr-won-label" style={{ color: '#e53935' }}>✗ SCOUT FAILED</div>
              <div className="dr-won-name">{player.name}</div>
              <div className="dr-given-info">
                {player.round === 1 ? `1st round` : `Round ${player.round}`} · Pick #{player.pick} · {player.college}
              </div>
              {player.note && <div className="dr-won-note">"{player.note}"</div>}
            </div>
          )}
        </div>

        {/* ── Options (multiple choice) ── */}
        {optionsShown && options.length > 0 && !done && (
          <div className="dr-options">
            <div className="dr-opts-label">CHOOSE YOUR PICK</div>
            <div className="dr-opts-grid">
              {options.map(opt => (
                <button key={opt} className="dr-opt-btn" onClick={() => submitGuess(opt)}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Message ── */}
        {msg && !done && (
          <div className={`g-msg${isErr ? ' g-msg-err' : ''}`} style={{ fontFamily: "'Teko', sans-serif", letterSpacing: '.06em' }}>
            {msg}
          </div>
        )}

        {/* ── Input + controls ── */}
        {!done && (
          <div className="dr-input-section">
            <div className={isErr ? 'g-shake' : ''}>
              <div className="dr-input-row">
                <input ref={inputRef} type="text" className="dr-input"
                  placeholder="NAME THE PROSPECT…"
                  value={guess}
                  onChange={e => setGuess(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitGuess()}
                  autoComplete="off" spellCheck={false} />
                <button className="dr-submit-btn" onClick={() => submitGuess()} disabled={!guess.trim()}>
                  DRAFT
                </button>
              </div>
            </div>

            <div className="dr-action-row">
              {nextStat && (
                <button className="dr-action-btn reveal" onClick={revealStat}>
                  ▶ Reveal Stat <span className="dr-cost">−{REVEAL_COST}pts</span>
                </button>
              )}
              {!collegeShown && (
                <button className="dr-action-btn" onClick={revealCollege}>
                  🎓 College <span className="dr-cost">−{COLLEGE_COST}pts</span>
                </button>
              )}
              {!pickShown && (
                <button className="dr-action-btn" onClick={revealPick}>
                  📋 Draft Slot <span className="dr-cost">−{PICK_COST}pts</span>
                </button>
              )}
              {!optionsShown && (
                <button className="dr-action-btn" onClick={() => makeOptions(player)}>
                  🎯 Options <span className="dr-cost">−{OPTIONS_COST}pts</span>
                </button>
              )}
              <button className="dr-action-btn give-up" onClick={giveUp}>
                ✗ Give Up
              </button>
            </div>
          </div>
        )}

        {/* ── Next / finish ── */}
        {done && (
          <div className="dr-next-row">
            <button className="dr-next-btn" onClick={isLast ? () => setShowFinal(true) : nextRound}>
              {isLast ? '🏆 Final Grades' : `Next Prospect →`}
            </button>
          </div>
        )}

        <div className="g-footer">
          {PLAYERS_PER_GAME} prospects per session · Fewer reveals = more draft capital · Guess early, scout well
        </div>
      </main>

      {/* ── Final screen ── */}
      {showFinal && (
        <div className="g-overlay">
          <div className="dr-final">
            <div className="dr-final-header">
              <div className="dr-final-title">DRAFT GRADES</div>
              <div className="dr-final-season">{new Date().getFullYear()} NFL DRAFT CLASS</div>
            </div>
            <div className="dr-final-total">
              <div className="dr-final-pts">{totalScore}</div>
              <div className="dr-final-max">/ {maxTotal} pts</div>
            </div>
            <div className="dr-final-grade-label">
              {totalScore >= maxTotal * 0.9 ? '🏆 ELITE GM' :
               totalScore >= maxTotal * 0.7 ? '⭐ SHARP SCOUT' :
               totalScore >= maxTotal * 0.5 ? '📋 SOLID EVALUATOR' :
               totalScore >= maxTotal * 0.3 ? '📉 NEEDS WORK' : '🔍 BACK TO FILM ROOM'}
            </div>
            <div className="dr-final-picks">
              {gamePlayers.map((p, i) => (
                <div key={p.name} className={`dr-final-pick${scores[i] === 0 ? ' zero' : ''}`}>
                  <div className="dr-fp-pos" style={{ color: posColor(p.pos) }}>{p.pos}</div>
                  <div className="dr-fp-name">{p.name}</div>
                  <div className="dr-fp-score">{scores[i] ?? 0}<span style={{ color:'#3a5a7a', fontSize:'.7rem' }}>pts</span></div>
                </div>
              ))}
            </div>
            <div className="dr-final-btns">
              <button className="dr-submit-btn" style={{ flex: 1 }} onClick={() => { setShowFinal(false); startGame(diff); }}>
                ↺ New Draft Class
              </button>
              <button className="dr-action-btn" onClick={() => setShowFinal(false)}>Review</button>
            </div>
            {!userInit && (
              <button className="g-modal-skip" onClick={() => { setShowFinal(false); setShowAuth(true); }}>
                Save your grades →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── How to play ── */}
      {showHowTo && (
        <div className="g-overlay" onClick={() => setShowHowTo(false)}>
          <div className="dr-howto" onClick={e => e.stopPropagation()}>
            <div className="dr-howto-title">📋 DRAFT ROOM</div>
            {[
              `You're an NFL GM. Identify the mystery prospect from their combine measurements alone — position and year are always shown.`,
              `Reveal stats one at a time to narrow it down. Each reveal costs ${REVEAL_COST} pts. College costs ${COLLEGE_COST} pts. Draft slot costs ${PICK_COST} pts.`,
              `Wrong guesses cost ${WRONG_COST} pts each. The earlier you identify the prospect, the more draft capital you earn.`,
              `Need a lifeline? "Options" (−${OPTIONS_COST} pts) gives you 4 multiple choice picks from the same position.`,
              `5 prospects per game. Your combined score becomes your final draft grade.`,
            ].map((r, i) => (
              <div key={i} className="dr-hrule">
                <div className="dr-rnum">{i + 1}</div>
                <div>{r}</div>
              </div>
            ))}
            <button className="dr-submit-btn" style={{ marginTop: '1.2rem', width: '100%' }} onClick={() => setShowHowTo(false)}>
              ENTER THE WAR ROOM
            </button>
          </div>
        </div>
      )}

      {/* ── Sign-in modal ── */}
      {showAuth && (
        <div className="g-overlay" onClick={() => setShowAuth(false)}>
          <div className="g-modal" onClick={e => e.stopPropagation()}>
            <div className="g-modal-icon">🏆</div>
            <h3 className="g-modal-title">Save Your Draft Grades</h3>
            <p className="g-modal-body">Create a free account to track your scores and see how your scouting stacks up.</p>
            <div className="g-modal-btns">
              <Link href="/signup" className="g-modal-cta" style={{ background:'#c9a62a', color:'#050a14' }}>Create Free Account</Link>
              <Link href="/login" className="g-modal-sec">Sign In</Link>
            </div>
            <button onClick={() => setShowAuth(false)} className="g-modal-skip">Maybe Later</button>
          </div>
        </div>
      )}

      {/* Floating how-to */}
      <button className="dr-how-float" onClick={() => setShowHowTo(true)}>? Rules</button>
    </>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

/* ── Shared nav ── */
.cp-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:.875rem 1.5rem;
  border-bottom:1px solid #0d1f35;position:sticky;top:0;background:#050a14;z-index:20;
  font-family:'Barlow Condensed',sans-serif}
.cp-nav-l{justify-self:start}
.cp-nav-c{display:flex;align-items:center;gap:.5rem;font-family:'Rajdhani',sans-serif;font-weight:700;
  font-size:1.1rem;letter-spacing:.22em;color:#c9a62a;justify-self:center}
.cp-nav-r{justify-self:end}
.dr-nav-pip{width:8px;height:8px;border-radius:50%;background:#c9a62a;
  box-shadow:0 0 10px #c9a62a, 0 0 20px rgba(201,166,42,.4);flex-shrink:0}
.g-back{color:#2a4a6a;text-decoration:none;font-size:.82rem;transition:.15s;font-family:'Barlow Condensed',sans-serif}
.g-back:hover{color:#d4e4f4}
.cp-badge{width:28px;height:28px;border-radius:50%;background:#091828;border:1.5px solid #c9a62a;
  color:#c9a62a;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.85rem;display:flex;
  align-items:center;justify-content:center;text-decoration:none;transition:.15s}
.cp-badge:hover{background:#c9a62a;color:#050a14}
.cp-signin{font-family:'Barlow Condensed',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.08em;
  color:#1a3050;text-decoration:none;transition:.15s;border:1px solid #0d1f35;padding:.25rem .6rem;border-radius:4px}
.cp-signin:hover{color:#c9a62a;border-color:#c9a62a}

/* ── Shared utils ── */
.g-tabs{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.3rem;background:#070f1c;
  border:1px solid #0d1f35;border-radius:12px;padding:.3rem;margin-bottom:.5rem}
.g-tab{display:flex;flex-direction:column;align-items:center;gap:.1rem;padding:.5rem .4rem;border:none;
  border-radius:8px;background:transparent;color:#2a4a6a;font-family:'Barlow Condensed',sans-serif;
  font-size:.85rem;font-weight:700;letter-spacing:.06em;cursor:pointer;transition:.2s;border:1px solid transparent}
.g-tab:hover:not(.g-tab-on){color:#d4e4f4}
.g-tab-on{font-weight:800}
.g-tab-sub{font-size:.58rem;opacity:.6}
.g-rules{font-size:.73rem;color:#2a4a6a;text-align:center;margin-bottom:1rem;padding:.45rem;
  background:#070f1c;border:1px solid #0d1f35;border-radius:6px;font-family:'Barlow',sans-serif}
.g-msg{font-size:.85rem;padding:.6rem 1rem;border-radius:8px;margin-bottom:.75rem;
  background:#070f1c;color:#8ab0cc;animation:fadeUp .2s ease both;font-family:'Barlow',sans-serif}
.g-msg-err{background:#140808;color:#ef4444}
.g-footer{text-align:center;font-size:.65rem;color:#132030;margin-top:1.5rem;line-height:1.6;
  font-family:'Barlow',sans-serif}
.g-overlay{position:fixed;inset:0;background:rgba(0,0,0,.88);display:flex;align-items:center;
  justify-content:center;z-index:50;backdrop-filter:blur(8px);padding:1rem}
.g-modal{background:#070f1c;border:1px solid #0d2a40;border-radius:20px;padding:2rem 1.75rem;
  max-width:320px;width:100%;text-align:center;animation:fadeUp .3s ease both}
.g-modal-icon{font-size:2.5rem;margin-bottom:.75rem}
.g-modal-title{font-family:'Rajdhani',sans-serif;font-size:1.6rem;font-weight:700;letter-spacing:.1em;
  color:#d4e4f4;margin-bottom:.5rem}
.g-modal-body{font-size:.82rem;color:#3a6080;line-height:1.6;margin-bottom:1.25rem;font-family:'Barlow',sans-serif}
.g-modal-btns{display:flex;flex-direction:column;gap:.5rem;margin-bottom:.75rem}
.g-modal-cta{display:block;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1rem;
  letter-spacing:.06em;padding:.8rem;border-radius:10px;text-decoration:none;transition:.15s;text-align:center}
.g-modal-cta:hover{opacity:.88}
.g-modal-sec{display:block;background:transparent;border:1px solid #0d2a40;color:#5a8ab0;
  font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:.06em;
  padding:.7rem;border-radius:10px;text-decoration:none;transition:.15s;text-align:center}
.g-modal-sec:hover{border-color:#c9a62a;color:#c9a62a}
.g-modal-skip{background:none;border:none;color:#1a3050;font-size:.75rem;cursor:pointer;transition:.15s;font-family:'Barlow',sans-serif}
.g-modal-skip:hover{color:#3a6080}
.g-pulse{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1.2rem;letter-spacing:.2em;animation:cpulse 1.2s ease infinite}
.g-shake{animation:shake .38s ease}
@keyframes cpulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}

/* ── Root ── */
.dr-loading{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#050a14}
.dr-scanlines{position:fixed;inset:0;pointer-events:none;z-index:1;
  background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.04) 2px,rgba(0,0,0,.04) 4px);
  animation:scanshift 8s linear infinite}
@keyframes scanshift{from{background-position:0 0}to{background-position:0 40px}}
.dr-main{position:relative;z-index:2;max-width:620px;margin:0 auto;padding:1.25rem 1rem 5rem;
  font-family:'Barlow Condensed',sans-serif;background:#050a14;min-height:100vh}

/* ── Draft progress ── */
.dr-progress-bar{display:flex;align-items:center;gap:0;margin-bottom:1rem;position:relative;padding:0 .5rem}
.dr-progress-fill-bg{position:absolute;left:.5rem;right:.5rem;top:50%;transform:translateY(-50%);
  height:2px;background:#0d1f35;z-index:0}
.dr-progress-fill{height:100%;background:linear-gradient(90deg,#c9a62a,#ffd700);transition:width .5s ease}
.dr-pick-dot{width:32px;height:32px;border-radius:50%;background:#070f1c;border:2px solid #0d1f35;
  display:flex;align-items:center;justify-content:center;position:relative;z-index:1;transition:all .3s;
  flex-shrink:0;margin:0 auto;flex:1}
.dr-pick-dot.done{border-color:#c9a62a;background:#0e1a08}
.dr-pick-dot.active{border-color:#c9a62a;background:#0e1e30;box-shadow:0 0 12px rgba(201,166,42,.5),0 0 24px rgba(201,166,42,.2)}
.dr-pick-num{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.75rem;color:#2a4a6a}
.dr-pick-dot.done .dr-pick-num,.dr-pick-dot.active .dr-pick-num{color:#c9a62a}

/* ── Scoreboard ── */
.dr-scoreboard{display:grid;grid-template-columns:1fr auto 1fr;gap:.5rem;
  background:#070f1c;border:1px solid #0d1f35;border-radius:12px;padding:1rem 1.2rem;margin-bottom:1rem}
.dr-sb-label{font-size:.55rem;color:#2a4a6a;letter-spacing:.2em;text-transform:uppercase;margin-bottom:.2rem;font-family:'Barlow Condensed',sans-serif}
.dr-sb-sub{font-size:.6rem;color:#1a3050;letter-spacing:.06em;margin-top:.2rem}
.dr-live-score{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:2.6rem;color:#d4e4f4;line-height:1;transition:color .3s}
.dr-live-score.won{color:#c9a62a}
.dr-live-score.lost{color:#e53935}
.dr-sb-center{display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:0 .5rem;border-left:1px solid #0d1f35;border-right:1px solid #0d1f35}
.dr-coin-stack{position:relative;width:28px;height:28px;margin-bottom:.3rem}
.dr-coin{position:absolute;width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#c9a62a,#ffd700);
  box-shadow:0 2px 6px rgba(201,166,42,.4);top:0;left:0}
.dr-total-score{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1.8rem;color:#c9a62a;line-height:1}
.dr-sb-right{text-align:right}
.dr-pick-counter{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:2.2rem;color:#d4e4f4;line-height:1}
.dr-pick-of{font-size:1rem;color:#2a4a6a}

/* ── Scouting card ── */
.dr-card{background:linear-gradient(145deg,#070f1c,#080f20);border:1px solid #0d2a40;border-radius:14px;
  padding:1.5rem;margin-bottom:.8rem;position:relative;overflow:hidden;
  animation:card-appear .5s cubic-bezier(.34,1.2,.64,1) both}
@keyframes card-appear{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.dr-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent,#c9a62a 30%,#ffd700 50%,#c9a62a 70%,transparent)}
.dr-card::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 20% 0%,rgba(201,166,42,.04),transparent 60%);pointer-events:none}
.dr-card-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.2rem}
.dr-classified{font-size:.55rem;letter-spacing:.3em;text-transform:uppercase;color:#2a4a6a;margin-bottom:.5rem;font-family:'Barlow Condensed',sans-serif}
.dr-pos-badge{display:inline-block;padding:.35rem .9rem;border-radius:4px;font-family:'Rajdhani',sans-serif;
  font-weight:700;font-size:1.3rem;letter-spacing:.12em;color:#fff;transition:box-shadow .3s}
.dr-card-right{text-align:right;display:flex;flex-direction:column;gap:.3rem;align-items:flex-end}
.dr-year-badge{font-size:.62rem;letter-spacing:.15em;color:#3a6080;background:#070f1c;
  border:1px solid #0d1f35;border-radius:3px;padding:.2rem .6rem;font-family:'Barlow Condensed',sans-serif}

/* ── Measurements ── */
.dr-measurements{display:flex;align-items:center;gap:.8rem;padding:.8rem 1rem;
  background:#050a14;border:1px solid #0d1f35;border-radius:8px;margin-bottom:1.2rem;flex-wrap:wrap}
.dr-meas{text-align:center;min-width:60px}
.dr-meas-label{font-size:.52rem;letter-spacing:.2em;text-transform:uppercase;color:#2a4a6a;font-family:'Barlow Condensed',sans-serif}
.dr-meas-val{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1.45rem;color:#d4e4f4;line-height:1.1}
.dr-meas-div{width:1px;height:36px;background:#0d1f35;flex-shrink:0}

/* ── Stat bars ── */
.dr-stats-grid{display:flex;flex-direction:column;gap:.55rem}
.dr-stat-row{display:grid;grid-template-columns:110px 1fr 90px;gap:.7rem;align-items:center;
  animation:stat-in .45s ease both}
.dr-stat-row.locked{opacity:.25}
@keyframes stat-in{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
.dr-stat-name{font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:#3a6080;font-family:'Barlow Condensed',sans-serif}
.dr-stat-bar-wrap{position:relative;height:6px}
.dr-stat-bar-bg{width:100%;height:6px;background:#0d1f35;border-radius:3px;overflow:hidden}
.dr-stat-bar-fill{height:100%;border-radius:3px;transition:width .8s cubic-bezier(.34,1.2,.64,1);
  animation:bar-grow .8s cubic-bezier(.34,1.2,.64,1)}
@keyframes bar-grow{from{width:0 !important}}
.dr-stat-bar-locked{background:#0d1f35;animation:none}
.dr-stat-right{text-align:right}
.dr-stat-val{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1rem;color:#d4e4f4;line-height:1}
.dr-stat-grade{font-size:.52rem;letter-spacing:.14em;font-family:'Barlow Condensed',sans-serif}

/* ── Redacted ── */
.dr-redacted{text-align:center;padding:1.5rem 1rem;border:1px dashed #0d1f35;border-radius:6px;margin-top:.5rem}
.dr-redacted-label{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1rem;letter-spacing:.3em;
  color:#1a3050;text-transform:uppercase}
.dr-redacted-sub{font-size:.7rem;color:#132030;margin-top:.3rem;font-family:'Barlow',sans-serif}

/* ── Won / Given banners ── */
.dr-won-banner{background:rgba(201,166,42,.07);border:1px solid rgba(201,166,42,.25);border-radius:8px;
  padding:1rem 1.2rem;margin-top:1rem;animation:fadeUp .4s ease both}
.dr-given-banner{background:rgba(211,47,47,.07);border:1px solid rgba(211,47,47,.2);border-radius:8px;
  padding:1rem 1.2rem;margin-top:1rem;animation:fadeUp .4s ease both}
.dr-won-label{font-size:.58rem;letter-spacing:.25em;text-transform:uppercase;color:#c9a62a;margin-bottom:.3rem;font-family:'Barlow Condensed',sans-serif}
.dr-won-name{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1.8rem;color:#d4e4f4;line-height:1}
.dr-won-note{font-size:.78rem;color:#3a6080;margin-top:.3rem;font-style:italic;font-family:'Barlow',sans-serif;line-height:1.5}
.dr-won-score{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1.4rem;color:#c9a62a;margin-top:.3rem}
.dr-given-info{font-size:.78rem;color:#5a3a3a;margin-top:.2rem;font-family:'Barlow',sans-serif}

/* ── Options ── */
.dr-options{background:#070f1c;border:1px solid #0d2a40;border-radius:10px;padding:1rem;margin-bottom:.8rem;animation:fadeUp .3s ease}
.dr-opts-label{font-size:.58rem;letter-spacing:.22em;text-transform:uppercase;color:#2a4a6a;margin-bottom:.6rem;font-family:'Barlow Condensed',sans-serif}
.dr-opts-grid{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
.dr-opt-btn{background:#050a14;border:1px solid #0d2a40;border-radius:6px;padding:.7rem 1rem;
  font-family:'Barlow Condensed',sans-serif;font-size:.95rem;font-weight:600;letter-spacing:.04em;
  color:#8ab0cc;cursor:pointer;transition:all .2s;text-align:left}
.dr-opt-btn:hover{background:rgba(201,166,42,.1);border-color:rgba(201,166,42,.4);color:#c9a62a}

/* ── Input ── */
.dr-input-section{margin-top:.5rem}
.dr-input-row{display:flex;gap:.5rem;margin-bottom:.6rem}
.dr-input{flex:1;background:#070f1c;border:1px solid #0d2a40;border-radius:8px;
  padding:.85rem 1.1rem;font-family:'Rajdhani',sans-serif;font-weight:600;font-size:1.1rem;
  letter-spacing:.08em;color:#d4e4f4;outline:none;transition:border-color .2s,box-shadow .2s;
  text-transform:uppercase}
.dr-input::placeholder{color:#132030;font-size:.9rem;font-weight:400;text-transform:none}
.dr-input:focus{border-color:#c9a62a;box-shadow:0 0 18px rgba(201,166,42,.15)}
.dr-submit-btn{background:linear-gradient(135deg,#c9a62a,#e8c050);color:#050a14;border:none;border-radius:8px;
  padding:.85rem 1.5rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1.1rem;
  letter-spacing:.15em;cursor:pointer;transition:all .2s;white-space:nowrap}
.dr-submit-btn:hover:not(:disabled){filter:brightness(1.1);transform:scale(1.02)}
.dr-submit-btn:active:not(:disabled){transform:scale(.98)}
.dr-submit-btn:disabled{background:#0d1f35;color:#2a4a6a;cursor:not-allowed}

/* ── Action buttons ── */
.dr-action-row{display:flex;gap:.4rem;flex-wrap:wrap}
.dr-action-btn{background:transparent;border:1px solid #0d2a40;color:#3a6080;padding:.4rem .8rem;
  border-radius:6px;font-family:'Barlow Condensed',sans-serif;font-size:.78rem;font-weight:600;
  letter-spacing:.1em;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:.35rem;
  white-space:nowrap}
.dr-action-btn:hover{border-color:#c9a62a;color:#c9a62a}
.dr-action-btn.reveal{border-color:#1a3a5a;color:#5a8ab0}
.dr-action-btn.reveal:hover{border-color:#c9a62a;color:#c9a62a}
.dr-action-btn.give-up{color:#3a2020}
.dr-action-btn.give-up:hover{border-color:#e53935;color:#e53935}
.dr-cost{opacity:.6;font-size:.68rem}

/* ── Next row ── */
.dr-next-row{display:flex;justify-content:center;margin-top:1rem}
.dr-next-btn{background:transparent;border:1px solid #c9a62a;color:#c9a62a;padding:.8rem 2.5rem;
  border-radius:8px;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1.1rem;
  letter-spacing:.15em;cursor:pointer;transition:all .2s}
.dr-next-btn:hover{background:rgba(201,166,42,.1);transform:scale(1.03)}

/* ── Draft announcement ── */
.dr-announce{position:fixed;inset:0;background:rgba(5,10,20,.96);z-index:200;
  display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);
  animation:announce-in .5s ease}
@keyframes announce-in{from{opacity:0}to{opacity:1}}
.dr-announce-inner{text-align:center;animation:announce-rise .6s cubic-bezier(.34,1.2,.64,1)}
@keyframes announce-rise{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}
.dr-announce-label{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:clamp(1rem,3vw,1.4rem);
  letter-spacing:.35em;color:#c9a62a;margin-bottom:.3rem}
.dr-announce-round{font-size:.7rem;letter-spacing:.3em;color:#2a4a6a;margin-bottom:1rem;font-family:'Barlow Condensed',sans-serif}
.dr-announce-team{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:clamp(1rem,4vw,1.5rem);
  letter-spacing:.25em;color:#3a6080;margin-bottom:.4rem}
.dr-announce-select{font-size:.75rem;letter-spacing:.4em;color:#1a3050;margin-bottom:.5rem;font-family:'Barlow Condensed',sans-serif}
.dr-announce-name{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:clamp(2.5rem,9vw,5.5rem);
  line-height:1;color:#d4e4f4;letter-spacing:.05em;
  text-shadow:0 0 40px rgba(201,166,42,.3),0 0 80px rgba(201,166,42,.1);
  animation:name-glow 2s ease}
@keyframes name-glow{0%{text-shadow:0 0 60px rgba(201,166,42,.8)}100%{text-shadow:0 0 40px rgba(201,166,42,.3)}}
.dr-announce-pos{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1.8rem;letter-spacing:.2em;margin:.4rem 0}
.dr-announce-college{font-size:.85rem;letter-spacing:.2em;color:#2a4a6a;font-family:'Barlow Condensed',sans-serif}

/* ── Final ── */
.dr-final{background:#070f1c;border:1px solid #0d2a40;border-radius:16px;padding:2rem;
  max-width:540px;width:100%;animation:fadeUp .4s ease both;max-height:90vh;overflow-y:auto}
.dr-final::-webkit-scrollbar{width:3px}
.dr-final::-webkit-scrollbar-thumb{background:#0d2a40}
.dr-final-header{text-align:center;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid #0d1f35}
.dr-final-title{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1.6rem;
  letter-spacing:.3em;color:#c9a62a}
.dr-final-season{font-size:.6rem;letter-spacing:.22em;color:#2a4a6a;font-family:'Barlow Condensed',sans-serif;margin-top:.2rem}
.dr-final-total{text-align:center;margin-bottom:.5rem;display:flex;align-items:baseline;justify-content:center;gap:.4rem}
.dr-final-pts{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:4.5rem;
  background:linear-gradient(135deg,#c9a62a,#ffd700);-webkit-background-clip:text;
  -webkit-text-fill-color:transparent;background-clip:text;line-height:1}
.dr-final-max{font-size:1.2rem;color:#2a4a6a;font-family:'Rajdhani',sans-serif}
.dr-final-grade-label{text-align:center;font-family:'Barlow Condensed',sans-serif;font-weight:700;
  font-size:1.1rem;letter-spacing:.15em;color:#c9a62a;margin-bottom:1.2rem}
.dr-final-picks{display:flex;flex-direction:column;gap:.4rem;margin-bottom:1.2rem}
.dr-final-pick{display:grid;grid-template-columns:44px 1fr auto;gap:.6rem;align-items:center;
  background:#050a14;border:1px solid #0d1f35;border-radius:6px;padding:.6rem .8rem}
.dr-final-pick.zero{opacity:.5}
.dr-fp-pos{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.9rem;text-align:center}
.dr-fp-name{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:.95rem;color:#8ab0cc;letter-spacing:.04em}
.dr-fp-score{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1.2rem;color:#c9a62a;white-space:nowrap}
.dr-final-btns{display:flex;gap:.6rem;align-items:center}

/* ── How to play ── */
.dr-howto{background:#070f1c;border:1px solid #0d2a40;border-radius:14px;padding:2rem;
  max-width:520px;width:100%;animation:fadeUp .3s ease both}
.dr-howto-title{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1.6rem;
  letter-spacing:.18em;color:#c9a62a;margin-bottom:1.2rem}
.dr-hrule{display:flex;gap:.8rem;margin-bottom:.85rem;font-family:'Barlow',sans-serif;
  font-size:.87rem;color:#5a8ab0;line-height:1.55;align-items:flex-start}
.dr-rnum{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1.2rem;color:#c9a62a;min-width:20px;line-height:1.15}

/* ── Floating button ── */
.dr-how-float{position:fixed;bottom:1.5rem;right:1.5rem;background:#070f1c;
  border:1px solid rgba(201,166,42,.3);color:#c9a62a;font-family:'Barlow Condensed',sans-serif;
  font-size:.75rem;font-weight:700;letter-spacing:.12em;padding:.4rem .9rem;border-radius:4px;
  cursor:pointer;z-index:20;transition:all .2s;backdrop-filter:blur(4px)}
.dr-how-float:hover{background:rgba(201,166,42,.12);border-color:#c9a62a}

@media(max-width:520px){
  .dr-scoreboard{grid-template-columns:1fr auto 1fr;gap:.3rem;padding:.8rem}
  .dr-stat-row{grid-template-columns:90px 1fr 76px}
  .dr-measurements{gap:.5rem;padding:.6rem .8rem}
  .dr-opts-grid{grid-template-columns:1fr}
  .dr-action-row{gap:.3rem}
  .dr-action-btn{font-size:.72rem;padding:.35rem .6rem}
}
`;