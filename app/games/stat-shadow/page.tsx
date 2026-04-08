'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { NFL_PLAYERS, type PlayerEntry } from '@/lib/players-data';

/* ─── Epoch rotation ────────────────────────────────────────────── */
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

/* ─── Player pools ──────────────────────────────────────────────── */
// Different seeds from Career Path (offset +1000) so players always differ
const DIFF_SEEDS = { rookie: 1314, pro: 1271, legend: 1141 } as const;
type Difficulty = 'rookie' | 'pro' | 'legend';

function getPool(diff: Difficulty): PlayerEntry[] {
  if (diff === 'rookie') return NFL_PLAYERS.slice(0, 22);       // iconic
  if (diff === 'legend') return NFL_PLAYERS.slice(18);          // deeper cuts
  return NFL_PLAYERS;                                            // pro = all
}
function getDailyPlayer(diff: Difficulty): PlayerEntry {
  const pool = getPool(diff);
  const shuffled = detShuffle(pool, DIFF_SEEDS[diff]);
  return shuffled[dayNum() % shuffled.length];
}

/* ─── Config ─────────────────────────────────────────────────────── */
// Clues: index 0 = hardest, index 4 = easiest
const DIFF = {
  rookie: {
    label: 'Rookie', maxClues: 5, showPos: true, showCollege: true,
    scores: [60, 52, 44, 36, 28] as const,
    wrongEffect: 'reveal' as const,
    rules: 'Famous player. Position & college shown. Wrong guesses reveal next clue.',
  },
  pro: {
    label: 'Pro', maxClues: 5, showPos: true, showCollege: false,
    scores: [100, 85, 70, 55, 40] as const,
    wrongEffect: 'points' as const, wrongPenalty: 10,
    rules: 'Position shown. Each wrong guess costs 10 pts.',
  },
  legend: {
    label: 'Legend', maxClues: 3, showPos: false, showCollege: false,
    scores: [150, 100, 60] as const,
    wrongEffect: 'points' as const, wrongPenalty: 25,
    rules: 'Only 3 hardest clues. No hints. Each wrong guess costs 25 pts.',
  },
} as const;

/* ─── Helpers ─────────────────────────────────────────────────────── */
const todayStr = () => new Date().toISOString().split('T')[0];
const storeKey = (d: Difficulty) => `nfl-ss3-${todayStr()}-${d}`;
interface Saved { score: number; won: boolean; clueIdx: number; }

function norm(s: string) { return s.toLowerCase().trim().replace(/[^a-z\s]/g, ''); }
function nameMatch(g: string, c: string) {
  const gp = norm(g).split(/\s+/).filter(Boolean);
  const cp = norm(c).split(/\s+/).filter(Boolean);
  if (!gp.length || !cp.length) return false;
  if (gp.length === 1) return cp.some(p => p === gp[0]);
  return norm(g) === norm(c) || gp.every(p => cp.includes(p));
}
function buildEmojis(ci: number, max: number, won: boolean) {
  return Array.from({ length: max }, (_, i) => i < ci ? '⬛' : i === ci ? (won ? '🟨' : '🟥') : '⬜').join('');
}

/* ─── Component ──────────────────────────────────────────────────── */
export default function StatShadow() {
  const [diff, setDiff]         = useState<Difficulty>('pro');
  const [player, setPlayer]     = useState<PlayerEntry | null>(null);
  const [revealed, setRevealed] = useState(1);
  const [penalty, setPenalty]   = useState(0);
  const [guess, setGuess]       = useState('');
  const [status, setStatus]     = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore]       = useState(0);
  const [msg, setMsg]           = useState('');
  const [isErr, setIsErr]       = useState(false);
  const [freshIdx, setFreshIdx] = useState<number | null>(null);
  const [copied, setCopied]     = useState(false);
  const [saved, setSaved]       = useState<Saved | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [userInit, setUserInit] = useState<string | null>(null);
  const authTriggered           = useRef(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const n = user.user_metadata?.full_name || user.email || 'U';
        setUserInit(n[0].toUpperCase());
      }
    });
  }, []);

  const triggerAuth = useCallback(() => {
    if (!userInit && !authTriggered.current) {
      authTriggered.current = true;
      setTimeout(() => setShowAuth(true), 1800);
    }
  }, [userInit]);

  const liveScore = useCallback((rev: number, pen: number) => {
    const s = DIFF[diff].scores;
    return Math.max(s[Math.min(rev - 1, s.length - 1)] - pen, 0);
  }, [diff]);

  useEffect(() => {
    authTriggered.current = false;
    setShowBanner(false);
    const p = getDailyPlayer(diff);
    setPlayer(p); setGuess(''); setMsg(''); setFreshIdx(null); setIsErr(false); setPenalty(0);
    try {
      const raw = localStorage.getItem(storeKey(diff));
      if (raw) {
        const r: Saved = JSON.parse(raw);
        setSaved(r); setStatus(r.won ? 'won' : 'lost'); setScore(r.score);
        setRevealed(DIFF[diff].maxClues); return;
      }
    } catch {}
    setSaved(null); setStatus('playing'); setRevealed(1);
    setScore(DIFF[diff].scores[0]);
  }, [diff]);

  const revealNext = useCallback((auto = false) => {
    const cfg = DIFF[diff];
    if (!player || revealed >= cfg.maxClues || status !== 'playing') return;
    const next = revealed + 1;
    setRevealed(next); setFreshIdx(next - 1);
    if (!auto) setMsg('');
    setTimeout(() => setFreshIdx(null), 600);
  }, [player, revealed, diff, status]);

  const submitGuess = useCallback(() => {
    if (!player || !guess.trim() || status !== 'playing') return;
    const cfg = DIFF[diff];
    if (nameMatch(guess, player.name)) {
      const clueIdx = revealed - 1;
      const s = liveScore(revealed, penalty);
      setScore(s); setStatus('won'); setMsg(''); setRevealed(cfg.maxClues);
      const r: Saved = { score: s, won: true, clueIdx };
      setSaved(r);
      try { localStorage.setItem(storeKey(diff), JSON.stringify(r)); } catch {}
      triggerAuth();
    } else {
      setIsErr(true); setTimeout(() => setIsErr(false), 400);
      if (cfg.wrongEffect === 'reveal') {
        setMsg('Incorrect — revealing next clue…');
        setTimeout(() => revealNext(true), 400);
      } else {
        const pen = (cfg as any).wrongPenalty || 0;
        setPenalty(p => p + pen);
        setMsg(`Incorrect  −${pen} pts`);
      }
    }
    setGuess('');
  }, [player, guess, status, diff, revealed, penalty, liveScore, revealNext, triggerAuth]);

  const giveUp = useCallback(() => {
    if (!player || status !== 'playing') return;
    const cfg = DIFF[diff];
    setStatus('lost'); setScore(0); setRevealed(cfg.maxClues);
    const r: Saved = { score: 0, won: false, clueIdx: cfg.maxClues - 1 };
    setSaved(r);
    try { localStorage.setItem(storeKey(diff), JSON.stringify(r)); } catch {}
    triggerAuth();
  }, [player, status, diff, triggerAuth]);

  const share = useCallback(() => {
    if (!player || !saved) return;
    const cfg = DIFF[diff];
    navigator.clipboard?.writeText([
      `NFL Stat Shadow — ${todayStr()}`,
      `${cfg.label} Mode`,
      status === 'won' ? `Clue ${saved.clueIdx + 1} — ${score}pts` : `Did not get it (${player.name})`,
      buildEmojis(saved.clueIdx, cfg.maxClues, status === 'won'),
    ].join('\n')).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }, [player, diff, status, saved, score]);

  if (!player) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D0900' }}>
        <span className="g-pulse" style={{ color: '#EF4444', fontFamily: "'Space Mono',monospace" }}>LOADING FILE…</span>
      </div>
    </>
  );

  const cfg  = DIFF[diff];
  const cur  = liveScore(revealed, penalty);
  const nxt  = revealed < cfg.maxClues ? liveScore(revealed + 1, penalty) : null;
  const lock = cfg.maxClues - revealed;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="ss-root">

        {/* Nav */}
        <nav className="ss-nav">
          <div className="ss-nav-l"><Link href="/" className="g-back">← Hub</Link></div>
          <div className="ss-nav-c">
            <span className="ss-marker" style={{ background: '#EF4444' }} />
            STAT SHADOW
          </div>
          <div className="ss-nav-r">
            {userInit
              ? <Link href="/profile" className="ss-badge">{userInit}</Link>
              : <Link href="/login" className="ss-signin">SIGN IN</Link>}
          </div>
        </nav>

        <main className="g-main">

          {/* Tabs */}
          <div className="g-tabs">
            {(Object.keys(DIFF) as Difficulty[]).map(d => (
              <button key={d} onClick={() => setDiff(d)}
                className={`g-tab ${diff === d ? 'g-tab-on' : ''}`}
                style={diff === d ? { background: '#1E1408', color: '#F0C080', borderColor: 'rgba(240,192,128,.3)' } : {}}>
                {DIFF[d].label.toUpperCase()}
                <span className="g-tab-sub">{DIFF[d].scores[0]}pt</span>
              </button>
            ))}
          </div>

          <div className="ss-rules">{cfg.rules}</div>

          {/* Score + dots */}
          <div className={`ss-header ${status === 'won' ? 'ss-header-won' : status === 'lost' ? 'ss-header-lost' : ''}`}>
            <div>
              <div className="ss-mono-lbl">POINTS</div>
              <div className="ss-score" style={status === 'won' ? { color: '#F0C080' } : status === 'lost' ? { color: '#EF4444' } : {}}>{cur}</div>
              {nxt !== null && status === 'playing' && <div className="ss-mono-sub">→ {nxt} if reveal</div>}
              {penalty > 0 && <div className="ss-mono-sub" style={{ color: '#EF4444' }}>−{penalty} penalty</div>}
            </div>
            <div className="ss-dots-wrap">
              <div className="ss-mono-lbl">CLUES</div>
              <div className="ss-dots">
                {Array.from({ length: cfg.maxClues }).map((_, i) => (
                  <div key={i} className={`ss-dot ${i < revealed ? 'ss-dot-on' : 'ss-dot-off'}`}
                    style={i === revealed - 1 && status === 'playing' ? { background: '#F0C080', boxShadow: '0 0 8px rgba(240,192,128,.5)' } : {}} />
                ))}
              </div>
              <div className="ss-mono-sub">{revealed}/{cfg.maxClues} revealed</div>
            </div>
          </div>

          {/* Hints */}
          {(cfg.showPos || cfg.showCollege) && status === 'playing' && (
            <div className="ss-hints">
              {cfg.showPos && player.positions.map(p => (
                <span key={p} className="ss-hint ss-hint-pos">{p}</span>
              ))}
              {cfg.showCollege && player.college && (
                <span className="ss-hint">{player.college}</span>
              )}
            </div>
          )}

          {/* Classified file */}
          <div className="ss-file">
            <div className="ss-file-bar">
              <span className="ss-stamp">CLASSIFIED</span>
              <span className="ss-file-id">#{todayStr().replace(/-/g, '')}-{diff.toUpperCase()}</span>
            </div>
            <div className="ss-clues">
              {Array.from({ length: cfg.maxClues }).map((_, i) => {
                const vis = i < revealed;
                const fresh = i === freshIdx;
                const winHere = saved && status === 'won' && i === saved.clueIdx;
                if (vis) return (
                  <div key={i} className={`ss-clue ${fresh ? 'ss-clue-fresh' : ''} ${winHere ? 'ss-clue-win' : ''}`}>
                    <span className="ss-cn" style={winHere ? { color: '#F0C080' } : {}}>{String(i + 1).padStart(2, '0')}</span>
                    <p className="ss-ct">{player.clues[i]}</p>
                    {winHere && <span className="ss-win-tag">✓</span>}
                  </div>
                );
                return (
                  <div key={i} className="ss-clue-lock">
                    <span className="ss-cn ss-cn-lock">{String(i + 1).padStart(2, '0')}</span>
                    <div className="ss-redact">
                      <div className="ss-bar" /><div className="ss-bar ss-bar-s" />
                    </div>
                    <span className="ss-lock-lbl">REDACTED</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Result */}
          {saved && (
            <div className={`ss-result ${status === 'won' ? 'ss-result-won' : 'ss-result-lost'}`}>
              <div className="ss-result-stamp">{status === 'won' ? 'IDENTITY CONFIRMED' : 'CASE CLOSED — UNSOLVED'}</div>
              <div className="ss-result-name">{player.name}</div>
              {player.notableFact && <p className="ss-result-fact">{player.notableFact}</p>}
              {status === 'won' && <div className="ss-result-pts">{score} / {cfg.scores[0]} pts</div>}
              <div className="ss-emojis">{buildEmojis(saved.clueIdx, cfg.maxClues, status === 'won')}</div>
              <div className="g-row" style={{ marginTop: '.75rem' }}>
                <button onClick={share} className="ss-share">{copied ? '✓ Copied' : '↗ Share'}</button>
                <span className="ss-return">New file tomorrow</span>
              </div>
            </div>
          )}

          {msg && status === 'playing' && <div className={`ss-msg ${isErr ? 'ss-msg-err' : ''}`}>{msg}</div>}

          {/* Input */}
          {status === 'playing' && (
            <div className="g-input-wrap">
              <div className={isErr ? 'g-shake' : ''}>
                <input type="text" value={guess}
                  onChange={e => setGuess(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitGuess()}
                  placeholder="Name the player…" className="ss-input" autoComplete="off" />
              </div>
              <div className="g-btn-row">
                <button onClick={submitGuess} disabled={!guess.trim()} className="ss-btn"
                  style={guess.trim() ? { background: '#F0C080', color: '#0D0900', borderColor: '#F0C080' } : {}}>
                  SUBMIT
                </button>
                <button onClick={() => revealNext()} disabled={lock === 0} className="ss-btn ss-btn-sec">
                  {lock > 0 ? `NEXT CLUE  −${cur - (nxt ?? cur)}pts` : 'ALL REVEALED'}
                </button>
              </div>
              <button onClick={giveUp} className="ss-giveup">Give up & reveal</button>
            </div>
          )}

          <div className="ss-footer">Daily classified file · Clues ordered hardest → easiest · Fewer used = higher score</div>
        </main>

        {/* Modal */}
        {showAuth && (
          <div className="g-overlay" onClick={() => setShowAuth(false)}>
            <div className="ss-modal" onClick={e => e.stopPropagation()}>
              <div className="g-modal-icon">🏆</div>
              <h3 className="ss-modal-title">Save Your Score</h3>
              <p className="ss-modal-body">Create a free account to track your streak, save results, and compete on the leaderboard.</p>
              <div className="g-modal-btns">
                <Link href="/signup" className="g-modal-cta ss-modal-cta">Create Free Account</Link>
                <Link href="/login" className="ss-modal-sec">Sign In</Link>
              </div>
              <button onClick={() => { setShowAuth(false); setShowBanner(true); }} className="ss-modal-skip">Maybe Later</button>
            </div>
          </div>
        )}

        {/* Bottom banner */}
        {showBanner && !userInit && (
          <div className="ss-banner">
            <span className="ss-banner-text">Save your score & streak —</span>
            <Link href="/signup" className="ss-banner-cta">Create Account</Link>
            <span style={{ color: '#5C4030', fontSize: '.75rem' }}>or</span>
            <Link href="/login" className="ss-banner-link">Sign In</Link>
            <button onClick={() => setShowBanner(false)} className="ss-banner-x">✕</button>
          </div>
        )}
      </div>
    </>
  );
}

const DIFF_COLORS = { rookie: '#10B981', pro: '#F0C080', legend: '#EF4444' };

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Barlow:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.ss-root{min-height:100vh;background:#09090B;color:#FAFAFA;font-family:'Barlow',sans-serif}

/* Nav */
.ss-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:.875rem 1.5rem;border-bottom:1px solid #27272A;position:sticky;top:0;background:#09090B;z-index:20}
.ss-nav-l{justify-self:start}
.ss-nav-c{display:flex;align-items:center;gap:.5rem;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.1rem;letter-spacing:.14em;color:#FAFAFA;justify-self:center}
.ss-nav-r{justify-self:end}
.ss-marker{width:8px;height:8px;border-radius:2px;flex-shrink:0}
.ss-badge{width:28px;height:28px;border-radius:3px;background:#18181B;border:1.5px solid #EF4444;color:#EF4444;font-family:'Space Mono',monospace;font-weight:700;font-size:.8rem;display:flex;align-items:center;justify-content:center;text-decoration:none;transition:.15s}
.ss-badge:hover{background:#EF4444;color:#09090B}
.ss-signin{font-family:'Space Mono',monospace;font-size:.62rem;font-weight:700;letter-spacing:.06em;color:#52525B;text-decoration:none;transition:.15s}
.ss-signin:hover{color:#EF4444}

/* Shared */
.g-back{color:#71717A;text-decoration:none;font-size:.82rem;transition:.15s}
.g-back:hover{color:#FAFAFA}
.g-main{max-width:540px;margin:0 auto;padding:1.75rem 1.25rem 5rem}
.g-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;z-index:50;backdrop-filter:blur(4px)}
.g-modal-icon{font-size:2.5rem;margin-bottom:.75rem}
.g-modal-btns{display:flex;flex-direction:column;gap:.5rem;margin-bottom:.75rem}
.g-modal-cta{display:block;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1rem;letter-spacing:.06em;padding:.8rem;border-radius:10px;text-decoration:none;transition:.15s}
.g-modal-cta:hover{opacity:.88}
.g-row{display:flex;align-items:center;gap:.9rem}
.g-input-wrap{display:flex;flex-direction:column;gap:.65rem}
.g-btn-row{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
.g-shake{animation:shake .38s ease}
.g-pulse{font-size:1rem;font-weight:700;letter-spacing:.2em;animation:cpulse 1.2s ease infinite}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
@keyframes cpulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* Tabs */
.g-tabs{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.3rem;background:#18181B;border:1px solid #27272A;border-radius:14px;padding:.3rem;margin-bottom:.6rem}
.g-tab{display:flex;flex-direction:column;align-items:center;gap:.1rem;padding:.55rem .4rem;border:1px solid transparent;border-radius:10px;background:transparent;color:#71717A;font-family:'Barlow Condensed',sans-serif;font-size:.88rem;font-weight:700;letter-spacing:.06em;cursor:pointer;transition:.2s}
.g-tab:hover:not(.g-tab-on){color:#FAFAFA}
.g-tab-on{font-weight:800}
.g-tab-sub{font-size:.6rem;opacity:.65}

/* Rules */
.ss-rules{font-size:.75rem;color:#A1A1AA;text-align:center;margin-bottom:1.25rem;padding:.5rem;background:#18181B;border-radius:8px;border:1px solid #27272A;font-family:'Space Mono',monospace;line-height:1.5}

/* Header score card */
.ss-header{display:flex;justify-content:space-between;align-items:center;background:#18181B;border:1px solid #27272A;border-radius:16px;padding:1.1rem 1.4rem;margin-bottom:1rem;transition:.3s}
.ss-header-won{border-color:rgba(234,179,8,.4);background:#1A1A0E}
.ss-header-lost{border-color:rgba(239,68,68,.35);background:#1A0E0E}
.ss-mono-lbl{font-family:'Space Mono',monospace;font-size:.62rem;color:#71717A;text-transform:uppercase;letter-spacing:.12em;margin-bottom:.2rem}
.ss-mono-sub{font-family:'Space Mono',monospace;font-size:.65rem;color:#71717A;margin-top:.15rem}
.ss-score{font-family:'Space Mono',monospace;font-size:2.8rem;font-weight:700;line-height:1;color:#FAFAFA}
.ss-dots-wrap{display:flex;flex-direction:column;align-items:flex-end;gap:.4rem}
.ss-dots{display:flex;gap:.4rem}
.ss-dot{width:10px;height:10px;border-radius:2px;transition:.3s}
.ss-dot-on{background:#EAB308}
.ss-dot-off{background:#27272A}

/* Hints */
.ss-hints{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1rem}
.ss-hint{background:#18181B;border:1px solid #27272A;color:#A1A1AA;font-size:.72rem;padding:.28rem .7rem;border-radius:4px;font-family:'Space Mono',monospace}
.ss-hint-pos{color:#FACC15;border-color:rgba(250,204,21,.25);font-weight:700}

/* Classified file */
.ss-file{background:#18181B;border:1px solid #27272A;border-radius:4px 4px 16px 16px;margin-bottom:1rem;overflow:hidden}
.ss-file-bar{display:flex;justify-content:space-between;align-items:center;background:#27272A;padding:.45rem 1rem;border-bottom:1px solid #3F3F46}
.ss-stamp{font-family:'Space Mono',monospace;font-size:.65rem;font-weight:700;color:#EF4444;letter-spacing:.18em}
.ss-file-id{font-family:'Space Mono',monospace;font-size:.58rem;color:#71717A}
.ss-clues{display:flex;flex-direction:column}

/* Clue cards */
.ss-clue{display:flex;align-items:flex-start;gap:.9rem;border-bottom:1px solid #27272A;padding:.95rem 1.15rem;transition:.3s;position:relative}
.ss-clue:last-child{border-bottom:none}
.ss-clue-fresh{animation:clueIn .45s cubic-bezier(.34,1.45,.64,1) both}
@keyframes clueIn{from{opacity:0;background:#27272A}to{opacity:1;background:transparent}}
.ss-clue-win{background:#1C1A0A}
.ss-cn{font-family:'Space Mono',monospace;font-size:1.2rem;font-weight:700;color:#3F3F46;min-width:2rem;flex-shrink:0;line-height:1.3}
.ss-cn-lock{color:#27272A}
.ss-ct{font-size:.92rem;line-height:1.7;color:#F4F4F5;flex:1}
.ss-win-tag{font-family:'Space Mono',monospace;font-size:.62rem;color:#FACC15;position:absolute;top:.6rem;right:.9rem}

/* Locked clues */
.ss-clue-lock{display:flex;align-items:center;gap:.9rem;border-bottom:1px solid #1F1F23;padding:.7rem 1.15rem;opacity:.45}
.ss-clue-lock:last-child{border-bottom:none}
.ss-redact{flex:1;display:flex;flex-direction:column;gap:.35rem}
.ss-bar{height:.5rem;background:#3F3F46;border-radius:2px;animation:shimmer 2s ease infinite}
.ss-bar-s{width:55%}
@keyframes shimmer{0%,100%{opacity:.5}50%{opacity:.9}}
.ss-lock-lbl{font-family:'Space Mono',monospace;font-size:.52rem;color:#3F3F46;letter-spacing:.15em;flex-shrink:0}

/* Result */
.ss-result{border-radius:14px;padding:1.4rem;margin-bottom:1rem;border:1px solid #27272A;background:#18181B;animation:fadeUp .4s ease both}
.ss-result-won{border-color:rgba(234,179,8,.4)}
.ss-result-lost{border-color:rgba(239,68,68,.35)}
.ss-result-stamp{font-family:'Space Mono',monospace;font-size:.8rem;font-weight:700;letter-spacing:.1em;margin-bottom:.4rem}
.ss-result-won .ss-result-stamp{color:#FACC15}
.ss-result-lost .ss-result-stamp{color:#EF4444}
.ss-result-name{font-size:1.2rem;font-weight:600;margin-bottom:.35rem;color:#FAFAFA}
.ss-result-fact{font-size:.82rem;color:#71717A;line-height:1.55;margin-bottom:.6rem}
.ss-result-pts{font-family:'Space Mono',monospace;font-size:1.5rem;font-weight:700;color:#FACC15;margin-bottom:.5rem}
.ss-emojis{font-size:1.3rem;letter-spacing:.1em;margin-bottom:.5rem}
.ss-share{background:transparent;border:1px solid #27272A;color:#71717A;font-family:'Space Mono',monospace;font-size:.7rem;padding:.45rem .9rem;border-radius:6px;cursor:pointer;transition:.15s}
.ss-share:hover{border-color:#EF4444;color:#EF4444}
.ss-return{font-family:'Space Mono',monospace;font-size:.62rem;color:#3F3F46}

/* Feedback */
.ss-msg{font-family:'Space Mono',monospace;font-size:.75rem;padding:.6rem .9rem;border-radius:6px;margin-bottom:.85rem;background:#27272A;color:#A1A1AA;animation:fadeUp .2s ease both;line-height:1.5}
.ss-msg-err{background:#2D1515;color:#FCA5A5}

/* Input */
.ss-input{width:100%;background:#18181B;border:1px solid #27272A;border-radius:10px;padding:.9rem 1.1rem;font-size:1rem;color:#FAFAFA;font-family:'Barlow',sans-serif;outline:none;transition:.15s}
.ss-input::placeholder{color:#3F3F46}
.ss-input:focus{border-color:#71717A}
.ss-btn{padding:.9rem;border-radius:10px;border:1px solid #27272A;font-family:'Space Mono',monospace;font-size:.78rem;font-weight:700;cursor:pointer;transition:.2s;background:#18181B;color:#71717A}
.ss-btn:disabled{opacity:.3;cursor:not-allowed}
.ss-btn:not(:disabled):hover{opacity:.85}
.ss-btn-sec{background:#18181B;color:#F4F4F5}
.ss-btn-sec:not(:disabled):hover{background:#27272A}
.ss-btn-sec:disabled{color:#3F3F46}
.ss-giveup{background:none;border:none;color:#3F3F46;font-size:.72rem;cursor:pointer;transition:.15s;align-self:center;font-family:'Space Mono',monospace}
.ss-giveup:hover{color:#71717A}
.ss-footer{text-align:center;font-family:'Space Mono',monospace;font-size:.6rem;color:#3F3F46;margin-top:2rem;line-height:1.7}

/* Modal */
.ss-modal{background:#18181B;border:1px solid #27272A;border-radius:18px;padding:2rem 1.75rem;max-width:320px;width:90%;text-align:center;animation:fadeUp .3s ease both}
.ss-modal-title{font-family:'Barlow Condensed',sans-serif;font-size:1.5rem;font-weight:800;letter-spacing:.06em;color:#FAFAFA;margin-bottom:.5rem}
.ss-modal-body{font-size:.8rem;color:#A1A1AA;line-height:1.6;margin-bottom:1.25rem}
.ss-modal-cta{background:#EF4444;color:#FAFAFA}
.ss-modal-sec{display:block;background:#18181B;border:1px solid #3F3F46;color:#A1A1AA;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:.06em;padding:.7rem;border-radius:10px;text-decoration:none;transition:.15s}
.ss-modal-sec:hover{border-color:#EF4444;color:#FCA5A5}
.ss-modal-skip{background:none;border:none;color:#3F3F46;font-size:.72rem;cursor:pointer;transition:.15s;font-family:'Space Mono',monospace}
.ss-modal-skip:hover{color:#71717A}

/* Banner */
.ss-banner{position:fixed;bottom:0;left:0;right:0;background:#18181B;border-top:1px solid #27272A;padding:.75rem 1.5rem;display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;z-index:40}
.ss-banner-text{font-family:'Space Mono',monospace;font-size:.72rem;color:#A1A1AA;flex-shrink:0}
.ss-banner-cta{background:#EF4444;color:#FAFAFA;font-family:'Space Mono',monospace;font-weight:700;font-size:.72rem;padding:.3rem .75rem;border-radius:5px;text-decoration:none;transition:.15s;flex-shrink:0}
.ss-banner-cta:hover{opacity:.88}
.ss-banner-link{color:#A1A1AA;font-family:'Space Mono',monospace;font-size:.7rem;text-decoration:underline;transition:.15s;flex-shrink:0}
.ss-banner-link:hover{color:#EF4444}
.ss-banner-x{background:none;border:none;color:#52525B;font-size:.85rem;cursor:pointer;margin-left:auto;padding:.2rem .4rem;transition:.15s}
.ss-banner-x:hover{color:#A1A1AA}
`;