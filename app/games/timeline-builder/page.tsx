'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { NFL_PLAYERS, type PlayerEntry } from '@/lib/players-data';

/* ─── Rotation / player selection ────────────────────────────────── */
function dayNum(): number {
  const d = new Date();
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((local.getTime() - new Date(2024, 0, 1).getTime()) / 86400000);
}
function detShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]; let s = seed | 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    const j = (s >>> 0) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ERAS = [
  { min: 1950, max: 1979 }, { min: 1980, max: 1985 }, { min: 1986, max: 1991 },
  { min: 1992, max: 1999 }, { min: 2000, max: 2006 }, { min: 2007, max: 2011 },
  { min: 2012, max: 2017 }, { min: 2018, max: 2030 },
];

function getPlayersForSeed(seed: number): PlayerEntry[] {
  const eligible = NFL_PLAYERS.filter(p => p.draftYear !== undefined);
  const players: PlayerEntry[] = [];
  for (let b = 0; b < ERAS.length; b++) {
    const { min, max } = ERAS[b];
    const bucket = eligible.filter(p => p.draftYear! >= min && p.draftYear! <= max);
    if (bucket.length > 0) players.push(bucket[((seed + b * 17) * 3) % bucket.length]);
  }
  return players;
}

/* ─── Scoring ─────────────────────────────────────────────────────── */
function calcScore(user: PlayerEntry[], correct: PlayerEntry[]): number {
  let pts = 0, streak = 0;
  for (let i = 0; i < correct.length; i++) {
    if (user[i]?.name === correct[i].name) {
      pts += 15; streak++;
      if (streak >= 3) pts += 5;
    } else { streak = 0; }
  }
  if (pts >= correct.length * 15) pts += 30;
  return Math.min(pts, 150);
}

const todayStr = () => new Date().toISOString().split('T')[0];
const DAILY_KEY = `nfl-tl3-${todayStr()}`;

type Mode = 'daily' | 'freeplay';

/* ─── Component ───────────────────────────────────────────────────── */
export default function TimelineBuilder() {
  const [mode, setMode]         = useState<Mode>('daily');
  const [correct, setCorrect]   = useState<PlayerEntry[]>([]);
  const [display, setDisplay]   = useState<PlayerEntry[]>([]);
  const [phase, setPhase]       = useState<'loading' | 'playing' | 'submitted'>('loading');
  const [score, setScore]       = useState(0);
  const [results, setResults]   = useState<boolean[]>([]);
  const [fpSeed, setFpSeed]     = useState(1000);
  const [dragIdx, setDragIdx]   = useState<number | null>(null);
  const [overIdx, setOverIdx]   = useState<number | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [userInit, setUserInit] = useState<string | null>(null);
  const [copied, setCopied]     = useState(false);
  const [savedScore, setSavedScore] = useState<number | null>(null);
  const authTriggered           = useRef(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const n = user.user_metadata?.full_name || user.email || 'U';
        setUserInit(n[0].toUpperCase());
      }
    });
  }, []);

  function loadGame(seed: number, gameMode: Mode) {
    const players = getPlayersForSeed(seed);
    const sorted  = [...players].sort((a, b) => (a.draftYear || 0) - (b.draftYear || 0));
    const shuffled = detShuffle(players, seed + 99);
    setCorrect(sorted); setDisplay(shuffled);
    setResults([]); setScore(0); setPhase('playing');
    authTriggered.current = false;
  }

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) { const n = user.user_metadata?.full_name || user.email || 'U'; setUserInit(n[0].toUpperCase()); }
    });
    // Check daily save
    try {
      const raw = localStorage.getItem(DAILY_KEY);
      if (raw) {
        const { score: s, order } = JSON.parse(raw);
        const players = getPlayersForSeed(dayNum());
        const sorted = [...players].sort((a, b) => (a.draftYear || 0) - (b.draftYear || 0));
        setSavedScore(s); setScore(s); setCorrect(sorted);
        setDisplay(order.map((name: string) => sorted.find(p => p.name === name) || players[0]));
        setResults(order.map((name: string, i: number) => name === sorted[i].name));
        setPhase('submitted'); return;
      }
    } catch {}
    loadGame(dayNum(), 'daily');
  }, []);

  const startFreePlay = useCallback(() => {
    setMode('freeplay');
    loadGame(fpSeed, 'freeplay');
  }, [fpSeed]);

  const playAgain = useCallback(() => {
    const nextSeed = fpSeed + 1;
    setFpSeed(nextSeed);
    loadGame(nextSeed, 'freeplay');
  }, [fpSeed]);

  const triggerAuth = useCallback(() => {
    if (!userInit && !authTriggered.current) {
      authTriggered.current = true;
      setTimeout(() => setShowAuth(true), 1800);
    }
  }, [userInit]);

  /* Drag */
  const handleDragStart = useCallback((i: number) => setDragIdx(i), []);
  const handleDragEnter = useCallback((i: number) => {
    setOverIdx(i);
    if (dragIdx === null || dragIdx === i) return;
    setDisplay(prev => {
      const next = [...prev];
      const [item] = next.splice(dragIdx, 1);
      next.splice(i, 0, item);
      setDragIdx(i);
      return next;
    });
  }, [dragIdx]);
  const handleDragEnd = useCallback(() => { setDragIdx(null); setOverIdx(null); }, []);
  const moveCard = useCallback((i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= display.length) return;
    setDisplay(prev => { const n = [...prev]; [n[i], n[j]] = [n[j], n[i]]; return n; });
  }, [display.length]);

  const submit = useCallback(() => {
    const s = calcScore(display, correct);
    const res = display.map((p, i) => p.name === correct[i].name);
    setScore(s); setResults(res); setPhase('submitted');
    if (mode === 'daily') {
      try { localStorage.setItem(DAILY_KEY, JSON.stringify({ score: s, order: display.map(p => p.name) })); } catch {}
      triggerAuth();
    }
  }, [display, correct, mode, triggerAuth]);

  const shareResult = useCallback(() => {
    const grid = results.map(r => r ? '🟩' : '🟥').join('');
    navigator.clipboard?.writeText([`NFL Timeline Builder — ${todayStr()}`, `${score}/150 pts`, grid].join('\n'))
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }, [results, score]);

  if (phase === 'loading') return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0806' }}>
        <span className="tl-pulse">ACCESSING ARCHIVE…</span>
      </div>
    </>
  );

  const minYear = correct[0]?.draftYear || 1950;
  const maxYear = correct[correct.length - 1]?.draftYear || 2024;
  const timeSpan = maxYear - minYear || 1;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="tl-root">

        {/* Nav — 3-col grid */}
        <nav className="tl-nav">
          <div className="tl-nav-l"><Link href="/" className="tl-back">← Hub</Link></div>
          <div className="tl-nav-c">
            <span className="tl-icon">⏳</span>
            TIMELINE BUILDER
          </div>
          <div className="tl-nav-r">
            {userInit
              ? <Link href="/profile" className="tl-badge">{userInit}</Link>
              : <Link href="/login" className="tl-signin">SIGN IN</Link>}
          </div>
        </nav>

        <main className="tl-main">

          {/* Mode toggle */}
          <div className="tl-mode-bar">
            <button onClick={() => { setMode('daily'); loadGame(dayNum(), 'daily'); }}
              className={`tl-mode-btn ${mode === 'daily' ? 'tl-mode-on' : ''}`}>
              Daily Challenge
            </button>
            <button onClick={startFreePlay}
              className={`tl-mode-btn ${mode === 'freeplay' ? 'tl-mode-on' : ''}`}>
              Free Play ∞
            </button>
          </div>

          {/* Masthead */}
          <div className="tl-masthead">
            <div className="tl-overline">
              {mode === 'daily' ? 'DAILY CHALLENGE' : 'FREE PLAY — NO POINTS'}
            </div>
            <h1 className="tl-title">
              {phase === 'playing' ? 'Sort by Rookie Season' : 'Results'}
            </h1>
            <p className="tl-sub">
              {phase === 'playing'
                ? 'Drag to arrange 8 players earliest debut → most recent. Use ↑↓ on mobile.'
                : mode === 'daily'
                  ? `${score}/150 pts — ${results.filter(Boolean).length}/8 correct`
                  : `${results.filter(Boolean).length}/8 correct — free play`}
            </p>
          </div>

          {/* ── PLAYING ──────────────────────────────────────────── */}
          {phase === 'playing' && (
            <>
              <div className="tl-cards" onDragOver={e => e.preventDefault()} onDrop={handleDragEnd}>
                {display.map((player, i) => (
                  <div key={player.name}
                    className={`tl-card ${dragIdx === i ? 'tl-card-drag' : ''} ${overIdx === i && dragIdx !== i ? 'tl-card-over' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragEnter={() => handleDragEnter(i)}
                    onDragEnd={handleDragEnd}>
                    <div className="tl-handle">⠿</div>
                    <div className="tl-card-body">
                      <div className="tl-card-name">{player.name}</div>
                      <div className="tl-card-meta">
                        <span className="tl-pos">{player.positions[0]}</span>
                        {player.career[0] && <span className="tl-team">{player.career[0]}</span>}
                        {player.college && <span className="tl-college">{player.college}</span>}
                      </div>
                    </div>
                    <div className="tl-arrows">
                      <button onClick={() => moveCard(i, -1)} disabled={i === 0} className="tl-arrow" aria-label="Up">↑</button>
                      <button onClick={() => moveCard(i, 1)} disabled={i === display.length - 1} className="tl-arrow" aria-label="Down">↓</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="tl-submit-row">
                <span className="tl-hint">← Earlier · Later →</span>
                <button onClick={submit} className="tl-submit">SUBMIT ORDER</button>
              </div>
            </>
          )}

          {/* ── RESULTS ──────────────────────────────────────────── */}
          {phase === 'submitted' && (
            <>
              {/* Score */}
              <div className={`tl-score-banner ${score >= 120 ? 'tl-sc-great' : score >= 75 ? 'tl-sc-good' : 'tl-sc-low'}`}>
                <div className="tl-sc-num">{mode === 'freeplay' ? results.filter(Boolean).length : score}</div>
                <div className="tl-sc-denom">{mode === 'freeplay' ? '/8 correct' : '/150 pts'}</div>
                <div className="tl-sc-label">
                  {results.filter(Boolean).length === 8
                    ? 'PERFECT — ALL 8 CORRECT'
                    : results.filter(Boolean).length >= 6
                    ? `EXCELLENT — ${results.filter(Boolean).length}/8 CORRECT`
                    : results.filter(Boolean).length >= 4
                    ? `SOLID — ${results.filter(Boolean).length}/8 CORRECT`
                    : `KEEP STUDYING — ${results.filter(Boolean).length}/8 CORRECT`}
                </div>
              </div>

              {/* Visual timeline */}
              <div className="tl-timeline-wrap">
                <div className="tl-tl-heading">CORRECT ORDER</div>
                <div className="tl-track">
                  <div className="tl-rail" />
                  <div className="tl-nodes">
                    {correct.map((player, i) => {
                      const pct = ((player.draftYear || minYear) - minYear) / timeSpan * 100;
                      const userIdx = display.findIndex(p => p.name === player.name);
                      const correct_ = results[userIdx];
                      return (
                        <div key={player.name} className="tl-node" style={{ left: `${Math.min(Math.max(pct, 2), 96)}%` }}>
                          <div className={`tl-node-line ${i % 2 === 0 ? 'tl-nl-top' : 'tl-nl-bot'}`} />
                          <div className={`tl-nd ${correct_ ? 'tl-nd-ok' : 'tl-nd-err'}`} />
                          <div className={`tl-nc ${i % 2 === 0 ? 'tl-nc-top' : 'tl-nc-bot'} ${correct_ ? 'tl-nc-ok' : 'tl-nc-err'}`}>
                            <div className="tl-nc-yr">{player.draftYear}</div>
                            <div className="tl-nc-nm">{player.name.split(' ').pop()}</div>
                            <div className={correct_ ? 'tl-ok' : 'tl-err'}>{correct_ ? '✓' : '✗'}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="tl-rail-ends"><span>{minYear}</span><span>{maxYear}</span></div>
                </div>
              </div>

              {/* Card breakdown */}
              <div className="tl-list">
                <div className="tl-list-head">FULL BREAKDOWN</div>
                {correct.map((player, i) => {
                  const userIdx = display.findIndex(p => p.name === player.name);
                  const ok = results[userIdx];
                  return (
                    <div key={player.name} className={`tl-row ${ok ? 'tl-row-ok' : 'tl-row-err'}`}>
                      <div className={ok ? 'tl-ok tl-v' : 'tl-err tl-v'}>{ok ? '✓' : '✗'}</div>
                      <div className="tl-row-info">
                        <div className="tl-row-name">{player.name}</div>
                        <div className="tl-row-meta">
                          <span className="tl-pos">{player.positions[0]}</span>
                          <span>Rookie: {player.draftYear}</span>
                          {player.college && <span>{player.college}</span>}
                        </div>
                      </div>
                      <div className="tl-rank">
                        <div className="tl-rank-n">#{i + 1}</div>
                        {!ok && <div className="tl-rank-u">you: #{userIdx + 1}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="tl-actions">
                {mode === 'daily' && (
                  <button onClick={shareResult} className="tl-share">{copied ? '✓ Copied!' : '↗ Share Result'}</button>
                )}
                {mode === 'freeplay' && (
                  <button onClick={playAgain} className="tl-again">Play Again →</button>
                )}
                {mode === 'daily' && (
                  <button onClick={startFreePlay} className="tl-fp-cta">Try Free Play ∞</button>
                )}
                <span className="tl-actions-sub">
                  {mode === 'daily' ? 'New lineup tomorrow' : 'No points in free play — just for fun'}
                </span>
              </div>
            </>
          )}

          <div className="tl-footer">Daily challenge · Sort 8 players by NFL debut · Free Play for unlimited rounds</div>
        </main>

        {/* Modal */}
        {showAuth && (
          <div className="tl-overlay" onClick={() => setShowAuth(false)}>
            <div className="tl-modal" onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>🏆</div>
              <h3 className="tl-modal-title">Save Your Score</h3>
              <p className="tl-modal-body">Create a free account to track your streak, save results, and compete on the leaderboard.</p>
              <div className="tl-modal-btns">
                <Link href="/signup" className="tl-modal-cta">Create Free Account</Link>
                <Link href="/login" className="tl-modal-sec">Sign In</Link>
              </div>
              <button onClick={() => { setShowAuth(false); setShowBanner(true); }} className="tl-modal-skip">Maybe Later</button>
            </div>
          </div>
        )}

        {/* Bottom banner */}
        {showBanner && !userInit && (
          <div className="tl-banner">
            <span className="tl-banner-text">Save your score & streak —</span>
            <Link href="/signup" className="tl-banner-cta">Create Account</Link>
            <span style={{ color: '#5C5040', fontSize: '.75rem' }}>or</span>
            <Link href="/login" className="tl-banner-link">Sign In</Link>
            <button onClick={() => setShowBanner(false)} className="tl-banner-x">✕</button>
          </div>
        )}
      </div>
    </>
  );
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Barlow:wght@400;500;600&family=Playfair+Display:wght@700;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.tl-root{min-height:100vh;background:#09090B;color:#FAFAFA;font-family:'Barlow',sans-serif}

/* Nav */
.tl-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:.875rem 1.5rem;border-bottom:1px solid #27272A;position:sticky;top:0;background:#09090B;z-index:20}
.tl-nav-l{justify-self:start}
.tl-nav-c{display:flex;align-items:center;gap:.45rem;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.05rem;letter-spacing:.14em;color:#FAFAFA;justify-self:center}
.tl-nav-r{justify-self:end}
.tl-icon{font-size:1.05rem}
.tl-back{color:#71717A;text-decoration:none;font-size:.82rem;transition:.15s}
.tl-back:hover{color:#FAFAFA}
.tl-badge{width:28px;height:28px;border-radius:3px;background:#1C1917;border:1.5px solid #D97706;color:#D97706;font-family:'Playfair Display',serif;font-weight:700;font-size:.85rem;display:flex;align-items:center;justify-content:center;text-decoration:none;transition:.15s}
.tl-badge:hover{background:#D97706;color:#09090B}
.tl-signin{font-family:'Barlow Condensed',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.08em;color:#52525B;text-decoration:none;transition:.15s}
.tl-signin:hover{color:#D97706}

/* Main */
.tl-main{max-width:600px;margin:0 auto;padding:1.75rem 1.25rem 5rem}

/* Mode bar */
.tl-mode-bar{display:flex;gap:.35rem;background:#18181B;border:1px solid #27272A;border-radius:12px;padding:.3rem;margin-bottom:1.25rem}
.tl-mode-btn{flex:1;padding:.5rem;border:none;border-radius:8px;background:transparent;color:#71717A;font-family:'Barlow Condensed',sans-serif;font-size:.85rem;font-weight:700;letter-spacing:.06em;cursor:pointer;transition:.2s}
.tl-mode-btn:hover:not(.tl-mode-on){color:#FAFAFA}
.tl-mode-on{background:#27272A;color:#F59E0B}

/* Masthead */
.tl-masthead{text-align:center;margin-bottom:1.75rem;padding-bottom:1.25rem;border-bottom:1px solid #27272A}
.tl-overline{font-family:'Barlow Condensed',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.25em;color:#A1A1AA;text-transform:uppercase;margin-bottom:.4rem}
.tl-title{font-family:'Playfair Display',serif;font-size:2rem;font-weight:900;color:#FAFAFA;margin-bottom:.35rem;line-height:1.15}
.tl-sub{font-size:.82rem;color:#A1A1AA;line-height:1.5}

/* Cards */
.tl-cards{display:flex;flex-direction:column;gap:.45rem;margin-bottom:1.25rem;user-select:none}
.tl-card{display:flex;align-items:center;gap:.75rem;background:#18181B;border:1px solid #27272A;border-radius:12px;padding:.8rem 1rem;cursor:grab;transition:background .2s,border-color .2s,transform .15s}
.tl-card:active{cursor:grabbing}
.tl-card-drag{background:#27272A;border-color:#D97706;transform:scale(1.01);box-shadow:0 8px 24px rgba(0,0,0,.5);z-index:10;opacity:.9}
.tl-card-over{border-color:#FAFAFA;background:#27272A}
.tl-handle{font-size:1.2rem;color:#52525B;flex-shrink:0;line-height:1}
.tl-card-body{flex:1;min-width:0}
.tl-card-name{font-family:'Barlow Condensed',sans-serif;font-size:1.1rem;font-weight:800;letter-spacing:.03em;color:#FAFAFA;margin-bottom:.2rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tl-card-meta{display:flex;flex-wrap:wrap;gap:.3rem;align-items:center}
.tl-pos{background:#27272A;border:1px solid #3F3F46;color:#F59E0B;font-family:'Barlow Condensed',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.08em;padding:.15rem .5rem;border-radius:4px}
.tl-team{font-family:'Barlow Condensed',sans-serif;font-size:.72rem;color:#A1A1AA;letter-spacing:.04em}
.tl-college{font-size:.7rem;color:#71717A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:130px}
.tl-arrows{display:flex;flex-direction:column;gap:.2rem;flex-shrink:0}
.tl-arrow{background:#27272A;border:1px solid #3F3F46;color:#A1A1AA;font-size:.65rem;padding:.2rem .45rem;border-radius:4px;cursor:pointer;transition:.15s}
.tl-arrow:hover:not(:disabled){background:#3F3F46;color:#FAFAFA}
.tl-arrow:disabled{opacity:.2;cursor:not-allowed}

/* Submit row */
.tl-submit-row{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.tl-hint{font-size:.75rem;color:#71717A;font-family:'Barlow Condensed',sans-serif;letter-spacing:.06em}
.tl-submit{background:#D97706;color:#09090B;font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:800;letter-spacing:.08em;padding:.8rem 2rem;border-radius:10px;border:none;cursor:pointer;transition:.15s}
.tl-submit:hover{background:#F59E0B}

/* Score banner */
.tl-score-banner{display:flex;flex-wrap:wrap;align-items:baseline;gap:.5rem 1rem;background:#18181B;border:1px solid #27272A;border-radius:16px;padding:1.25rem 1.5rem;margin-bottom:1.5rem;animation:fadeUp .4s ease both}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.tl-sc-great{border-color:rgba(217,119,6,.6);background:#1C1708}
.tl-sc-good{border-color:rgba(217,119,6,.3)}
.tl-sc-low{border-color:#27272A}
.tl-sc-num{font-family:'Playfair Display',serif;font-size:3.5rem;font-weight:900;color:#F59E0B;line-height:1}
.tl-sc-denom{font-family:'Barlow Condensed',sans-serif;font-size:1.4rem;color:#71717A;align-self:flex-end;padding-bottom:.25rem}
.tl-sc-label{width:100%;font-family:'Barlow Condensed',sans-serif;font-size:.8rem;font-weight:700;letter-spacing:.1em;color:#A1A1AA;margin-top:.2rem}

/* Timeline visual */
.tl-timeline-wrap{margin-bottom:1.75rem}
.tl-tl-heading{font-family:'Barlow Condensed',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.2em;color:#71717A;margin-bottom:.85rem;padding-bottom:.5rem;border-bottom:1px solid #27272A}
.tl-track{position:relative;height:150px;margin:0 .5rem}
.tl-rail{position:absolute;top:50%;left:0;right:0;height:2px;background:#3F3F46;transform:translateY(-50%)}
.tl-nodes{position:relative;height:100%}
.tl-node{position:absolute;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center}
.tl-node-line{width:1px;background:#3F3F46;height:28px;flex-shrink:0}
.tl-nl-top{order:-1}
.tl-nl-bot{order:1}
.tl-nd{width:12px;height:12px;border-radius:50%;border:2px solid #09090B;flex-shrink:0;z-index:2}
.tl-nd-ok{background:#F59E0B;box-shadow:0 0 10px rgba(245,158,11,.7)}
.tl-nd-err{background:#EF4444;box-shadow:0 0 8px rgba(239,68,68,.5)}
.tl-nc{background:#18181B;border:1px solid #27272A;border-radius:5px;padding:.3rem .45rem;text-align:center;min-width:44px;max-width:58px;position:absolute;white-space:nowrap}
.tl-nc-top{bottom:calc(50% + 24px)}
.tl-nc-bot{top:calc(50% + 24px)}
.tl-nc-ok{border-color:rgba(245,158,11,.5)}
.tl-nc-err{border-color:rgba(239,68,68,.4)}
.tl-nc-yr{font-family:'Barlow Condensed',sans-serif;font-size:.62rem;font-weight:700;color:#A1A1AA}
.tl-nc-nm{font-family:'Barlow Condensed',sans-serif;font-size:.7rem;font-weight:800;color:#FAFAFA;overflow:hidden;text-overflow:ellipsis;max-width:56px}
.tl-ok{color:#F59E0B;font-size:.62rem;font-weight:700}
.tl-err{color:#EF4444;font-size:.62rem;font-weight:700}
.tl-v{font-size:1rem;font-weight:700;flex-shrink:0;width:1.2rem}
.tl-rail-ends{display:flex;justify-content:space-between;font-family:'Barlow Condensed',sans-serif;font-size:.7rem;color:#52525B;margin-top:.4rem}

/* Result list */
.tl-list{display:flex;flex-direction:column;gap:.4rem;margin-bottom:1.5rem}
.tl-list-head{font-family:'Barlow Condensed',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.2em;color:#71717A;margin-bottom:.65rem;padding-bottom:.45rem;border-bottom:1px solid #27272A}
.tl-row{display:flex;align-items:center;gap:.75rem;background:#18181B;border:1px solid;border-radius:10px;padding:.7rem 1rem;animation:fadeUp .3s ease both}
.tl-row-ok{border-color:#27272A}
.tl-row-err{border-color:rgba(239,68,68,.35)}
.tl-row-info{flex:1;min-width:0}
.tl-row-name{font-family:'Barlow Condensed',sans-serif;font-size:1.05rem;font-weight:800;color:#FAFAFA;margin-bottom:.15rem}
.tl-row-meta{display:flex;flex-wrap:wrap;gap:.35rem;font-size:.7rem;color:#71717A}
.tl-rank{text-align:right;flex-shrink:0}
.tl-rank-n{font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:800;color:#F59E0B}
.tl-rank-u{font-size:.7rem;color:#EF4444;margin-top:.1rem}

/* Actions */
.tl-actions{display:flex;flex-wrap:wrap;align-items:center;gap:.75rem;margin-bottom:1rem}
.tl-share,.tl-again,.tl-fp-cta{font-family:'Barlow Condensed',sans-serif;font-size:.88rem;font-weight:700;letter-spacing:.06em;padding:.6rem 1.2rem;border-radius:8px;cursor:pointer;transition:.15s;text-decoration:none}
.tl-share{background:#18181B;border:1px solid #27272A;color:#A1A1AA}
.tl-share:hover{border-color:#D97706;color:#F59E0B}
.tl-again{background:#D97706;color:#09090B;border:none}
.tl-again:hover{background:#F59E0B}
.tl-fp-cta{background:#18181B;border:1px solid #27272A;color:#A1A1AA}
.tl-fp-cta:hover{border-color:#D97706;color:#F59E0B}
.tl-actions-sub{font-size:.7rem;color:#52525B;flex-basis:100%}

/* Pulse */
.tl-pulse{font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:700;letter-spacing:.2em;color:#F59E0B;animation:tlpulse 1.2s ease infinite}
@keyframes tlpulse{0%,100%{opacity:1}50%{opacity:.3}}
.tl-footer{text-align:center;font-size:.68rem;color:#3F3F46;margin-top:2.5rem;line-height:1.7;font-family:'Barlow Condensed',sans-serif;letter-spacing:.04em}

/* Modal */
.tl-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;z-index:50;backdrop-filter:blur(4px)}
.tl-modal{background:#18181B;border:1px solid #27272A;border-radius:20px;padding:2rem 1.75rem;max-width:320px;width:90%;text-align:center;animation:fadeUp .3s ease both}
.tl-modal-title{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;color:#FAFAFA;margin-bottom:.5rem}
.tl-modal-body{font-size:.82rem;color:#A1A1AA;line-height:1.6;margin-bottom:1.25rem}
.tl-modal-btns{display:flex;flex-direction:column;gap:.5rem;margin-bottom:.75rem}
.tl-modal-cta{display:block;background:#D97706;color:#09090B;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1rem;letter-spacing:.06em;padding:.8rem;border-radius:10px;text-decoration:none;transition:.15s}
.tl-modal-cta:hover{background:#F59E0B}
.tl-modal-sec{display:block;background:#18181B;border:1px solid #3F3F46;color:#A1A1AA;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:.06em;padding:.7rem;border-radius:10px;text-decoration:none;transition:.15s}
.tl-modal-sec:hover{border-color:#D97706;color:#F59E0B}
.tl-modal-skip{background:none;border:none;color:#52525B;font-size:.72rem;cursor:pointer;transition:.15s}
.tl-modal-skip:hover{color:#A1A1AA}

/* Banner */
.tl-banner{position:fixed;bottom:0;left:0;right:0;background:#18181B;border-top:1px solid #27272A;padding:.75rem 1.5rem;display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;z-index:40}
.tl-banner-text{font-size:.78rem;color:#A1A1AA;flex-shrink:0}
.tl-banner-cta{background:#D97706;color:#09090B;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.8rem;padding:.3rem .8rem;border-radius:6px;text-decoration:none;transition:.15s;flex-shrink:0}
.tl-banner-cta:hover{background:#F59E0B}
.tl-banner-link{color:#A1A1AA;font-size:.78rem;text-decoration:underline;transition:.15s;flex-shrink:0}
.tl-banner-link:hover{color:#F59E0B}
.tl-banner-x{background:none;border:none;color:#52525B;font-size:.85rem;cursor:pointer;margin-left:auto;padding:.2rem .4rem;transition:.15s}
.tl-banner-x:hover{color:#A1A1AA}
`;