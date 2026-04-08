'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { NFL_PLAYERS, careerJourney, type PlayerEntry } from '@/lib/players-data';

/* ─── Rotation helpers ──────────────────────────────────────────── */
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

/* ─── Multi-team pool (3+ distinct teams) ──────────────────────── */
function getPool(diff: Difficulty): PlayerEntry[] {
  const multi = NFL_PLAYERS.filter(p => careerJourney(p).length >= 3);
  if (diff === 'rookie') return multi.slice(0, Math.ceil(multi.length * 0.55)); // famous subset
  if (diff === 'legend') return multi.slice(Math.floor(multi.length * 0.3));   // deeper cuts
  return multi; // pro = all
}
const DIFF_SEEDS = { rookie: 314, pro: 271, legend: 141 } as const;
function getDailyPlayer(diff: Difficulty): PlayerEntry {
  const pool = getPool(diff);
  const shuffled = detShuffle(pool, DIFF_SEEDS[diff]);
  return shuffled[dayNum() % shuffled.length];
}

/* ─── Types & Config ────────────────────────────────────────────── */
type Difficulty = 'rookie' | 'pro' | 'legend';
type GameStatus = 'playing' | 'won' | 'lost';
interface Saved { score: number; won: boolean; }

const DIFF = {
  rookie: {
    label: 'Rookie',
    startRevealed: 2, showMeta: true, showTeamCount: true,
    maxScore: 60, scoreStep: 8, minScore: 20,
    wrongEffect: 'reveal' as const,
    rules: 'Position, college & team count shown. Wrong guesses auto-reveal the next stop.',
  },
  pro: {
    label: 'Pro',
    startRevealed: 1, showMeta: true, showTeamCount: false,
    maxScore: 100, scoreStep: 15, minScore: 30,
    wrongEffect: 'points' as const, wrongPenalty: 10,
    rules: 'Position & draft year shown. Each wrong guess costs 10 pts.',
  },
  legend: {
    label: 'Legend',
    startRevealed: 1, showMeta: false, showTeamCount: false,
    maxScore: 150, scoreStep: 25, minScore: 40,
    wrongEffect: 'points' as const, wrongPenalty: 20,
    rules: 'No hints. Each wrong guess costs 20 pts. Harder player pool.',
  },
} as const;

/* ─── Helpers ───────────────────────────────────────────────────── */
const todayStr = () => new Date().toISOString().split('T')[0];
const storeKey  = (d: Difficulty) => `nfl-cp3-${todayStr()}-${d}`;
function calcScore(d: Difficulty, revealed: number, penalty: number) {
  const { maxScore, startRevealed, scoreStep, minScore } = DIFF[d];
  return Math.max(maxScore - Math.max(0, revealed - startRevealed) * scoreStep - penalty, minScore);
}
function norm(s: string) { return s.toLowerCase().trim().replace(/[^a-z\s]/g, ''); }
function nameMatch(g: string, c: string) {
  const gp = norm(g).split(/\s+/).filter(Boolean);
  const cp = norm(c).split(/\s+/).filter(Boolean);
  if (!gp.length || !cp.length) return false;
  if (gp.length === 1) return cp.some(p => p === gp[0]);
  return norm(g) === norm(c) || gp.every(p => cp.includes(p));
}

/* ─── Component ─────────────────────────────────────────────────── */
export default function CareerPath() {
  const [diff, setDiff]         = useState<Difficulty>('pro');
  const [player, setPlayer]     = useState<PlayerEntry | null>(null);
  const [journey, setJourney]   = useState<string[]>([]);
  const [revealed, setRevealed] = useState(1);
  const [penalty, setPenalty]   = useState(0);
  const [guess, setGuess]       = useState('');
  const [status, setStatus]     = useState<GameStatus>('playing');
  const [score, setScore]       = useState(100);
  const [msg, setMsg]           = useState('');
  const [isErr, setIsErr]       = useState(false);
  const [freshIdx, setFreshIdx] = useState<number | null>(null);
  const [copied, setCopied]     = useState(false);
  const [saved, setSaved]       = useState<Saved | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [userInit, setUserInit] = useState<string | null>(null);
  const authTriggered           = useRef(false);

  // Auth
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

  // Load player on diff change
  useEffect(() => {
    authTriggered.current = false;
    setShowBanner(false);
    const p = getDailyPlayer(diff);
    const j = careerJourney(p);
    setPlayer(p); setJourney(j);
    setGuess(''); setMsg(''); setFreshIdx(null); setIsErr(false); setPenalty(0);
    try {
      const raw = localStorage.getItem(storeKey(diff));
      if (raw) {
        const r: Saved = JSON.parse(raw);
        setSaved(r); setStatus(r.won ? 'won' : 'lost'); setScore(r.score); setRevealed(j.length);
        return;
      }
    } catch {}
    setSaved(null); setStatus('playing');
    setRevealed(DIFF[diff].startRevealed); setScore(DIFF[diff].maxScore);
  }, [diff]);

  const revealNext = useCallback((auto = false) => {
    if (!player || revealed >= journey.length || status !== 'playing') return;
    const next = revealed + 1;
    setRevealed(next); setFreshIdx(next - 1);
    if (!auto) setMsg('');
    setTimeout(() => setFreshIdx(null), 600);
  }, [player, revealed, journey, status]);

  const submitGuess = useCallback(() => {
    if (!player || !guess.trim() || status !== 'playing') return;
    const cfg = DIFF[diff];
    if (nameMatch(guess, player.name)) {
      const s = calcScore(diff, revealed, penalty);
      setScore(s); setStatus('won'); setMsg(''); setRevealed(journey.length);
      const r: Saved = { score: s, won: true };
      setSaved(r);
      try { localStorage.setItem(storeKey(diff), JSON.stringify(r)); } catch {}
      triggerAuth();
    } else {
      setIsErr(true); setTimeout(() => setIsErr(false), 400);
      if (cfg.wrongEffect === 'reveal') {
        setMsg('Wrong — revealing next stop…');
        setTimeout(() => revealNext(true), 400);
      } else {
        const pen = (cfg as any).wrongPenalty || 0;
        setPenalty(p => p + pen);
        setMsg(`Incorrect  −${pen} pts`);
      }
    }
    setGuess('');
  }, [player, guess, status, diff, revealed, journey, penalty, revealNext, triggerAuth]);

  const giveUp = useCallback(() => {
    if (!player || status !== 'playing') return;
    setStatus('lost'); setScore(0); setRevealed(journey.length);
    const r: Saved = { score: 0, won: false };
    setSaved(r);
    try { localStorage.setItem(storeKey(diff), JSON.stringify(r)); } catch {}
    triggerAuth();
  }, [player, status, journey, diff, triggerAuth]);

  const share = useCallback(() => {
    if (!player) return;
    const cfg = DIFF[diff];
    navigator.clipboard?.writeText([
      `NFL Career Path — ${todayStr()}`,
      `${cfg.label} Mode (max ${cfg.maxScore}pts)`,
      status === 'won' ? `✅ Guessed — ${score}pts` : `❌ ${player.name}`,
      journey.join(' → '),
    ].join('\n')).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }, [player, diff, status, score, journey]);

  if (!player) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050B14' }}>
        <span className="g-pulse" style={{ color: '#38BDF8' }}>LOADING ROUTE…</span>
      </div>
    </>
  );

  const cfg      = DIFF[diff];
  const visible  = journey.slice(0, revealed);
  const hidden   = journey.length - revealed;
  const live     = status === 'playing' ? calcScore(diff, revealed, penalty) : score;
  const nextPts  = revealed < journey.length ? calcScore(diff, revealed + 1, penalty) : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="cp-root">

        {/* ── Nav (3-col grid so title truly centers) ── */}
        <nav className="cp-nav">
          <div className="cp-nav-l">
            <Link href="/" className="g-back">← Hub</Link>
          </div>
          <div className="cp-nav-c">
            <span className="cp-brand-pip" />
            CAREER PATH
          </div>
          <div className="cp-nav-r">
            {userInit
              ? <Link href="/profile" className="cp-badge">{userInit}</Link>
              : <Link href="/login" className="cp-signin">SIGN IN</Link>}
          </div>
        </nav>

        <main className="g-main">

          {/* Difficulty tabs */}
          <div className="g-tabs">
            {(Object.keys(DIFF) as Difficulty[]).map(d => (
              <button key={d} onClick={() => setDiff(d)}
                className={`g-tab ${diff === d ? 'g-tab-on' : ''}`}
                style={diff === d ? { background: '#0C2A3F', color: '#38BDF8' } : {}}>
                {DIFF[d].label.toUpperCase()}
                <span className="g-tab-sub">{DIFF[d].maxScore}pt</span>
              </button>
            ))}
          </div>

          <div className="g-rules">{cfg.rules}</div>

          {/* Score */}
          <div className={`cp-scorebar ${status === 'won' ? 'cp-sb-won' : status === 'lost' ? 'cp-sb-lost' : ''}`}>
            <div>
              <div className="g-lbl">SCORE</div>
              <div className="cp-score-n" style={status === 'won' ? { color: '#38BDF8' } : status === 'lost' ? { color: '#EF4444' } : {}}>{live}</div>
              {nextPts !== null && status === 'playing' && <div className="g-sub">→ {nextPts} if reveal</div>}
              {penalty > 0 && <div className="g-sub" style={{ color: '#EF4444' }}>−{penalty} penalty</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="g-lbl">STOPS</div>
              <div className="cp-score-n">{revealed}<span style={{ color: '#1A3A50', fontSize: '1.4rem' }}>/{journey.length}</span></div>
              <div className="g-sub">−{cfg.scoreStep}pts per reveal</div>
            </div>
          </div>

          {/* Meta hints */}
          {cfg.showMeta && status === 'playing' && (
            <div className="g-pills">
              {player.positions.map(p => <span key={p} className="g-pill g-pill-accent">{p}</span>)}
              {player.draftYear && <span className="g-pill">Draft {player.draftYear}</span>}
              {diff === 'rookie' && player.college && <span className="g-pill">{player.college}</span>}
              {cfg.showTeamCount && <span className="g-pill">{journey.length} teams total</span>}
            </div>
          )}

          {/* Transit path */}
          <div className="cp-route-card">
            <div className="g-card-label">CAREER ROUTE</div>
            <div className="cp-transit">
              <div className="cp-rail" />
              <div className="cp-stops">
                {visible.map((team, i) => (
                  <div key={i} className={`cp-stop ${i === freshIdx ? 'cp-stop-fresh' : ''}`}>
                    <div className="cp-dot" style={status === 'won' ? { background: '#38BDF8', boxShadow: '0 0 12px #38BDF8' } : {}} />
                    <div className="cp-team">{team}</div>
                  </div>
                ))}
                {status === 'playing' && Array.from({ length: hidden }).map((_, i) => (
                  <div key={`h${i}`} className="cp-stop">
                    <div className="cp-dot cp-dot-hidden" />
                    <div className="cp-team cp-team-hidden">?</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Result */}
          {saved && (
            <div className={`cp-result ${status === 'won' ? 'cp-result-won' : 'cp-result-lost'}`}>
              <div className="cp-result-title">{status === 'won' ? '✓ DESTINATION REACHED' : '✗ ROUTE INCOMPLETE'}</div>
              <div className="cp-result-name">{player.name}</div>
              {player.notableFact && <p className="g-fact">{player.notableFact}</p>}
              {status === 'won' && <div className="cp-result-pts">{score} pts</div>}
              <div className="g-fact" style={{ marginTop: '.4rem' }}>{journey.join(' → ')}</div>
              <div className="g-row" style={{ marginTop: '.9rem' }}>
                <button onClick={share} className="g-share">{copied ? '✓ Copied' : '↗ Share'}</button>
                <span className="g-return">New route tomorrow</span>
              </div>
            </div>
          )}

          {msg && status === 'playing' && <div className={`g-msg ${isErr ? 'g-msg-err' : ''}`}>{msg}</div>}

          {/* Input */}
          {status === 'playing' && (
            <div className="g-input-wrap">
              <div className={isErr ? 'g-shake' : ''}>
                <input type="text" value={guess}
                  onChange={e => setGuess(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitGuess()}
                  placeholder="Name the player…" className="g-input" autoComplete="off" />
              </div>
              <div className="g-btn-row">
                <button onClick={submitGuess} disabled={!guess.trim()}
                  className="g-btn"
                  style={guess.trim() ? { background: '#38BDF8', color: '#050B14', borderColor: '#38BDF8' } : {}}>
                  SUBMIT
                </button>
                <button onClick={() => revealNext()} disabled={revealed >= journey.length}
                  className="g-btn g-btn-sec">
                  {revealed < journey.length ? `NEXT STOP  −${cfg.scoreStep}pts` : 'ALL SHOWN'}
                </button>
              </div>
              <button onClick={giveUp} className="g-giveup">Give up & reveal</button>
            </div>
          )}

          <div className="g-footer">Daily challenge · Fewer reveals = higher score · All players have 3+ team careers</div>
        </main>

        {/* Sign-in modal */}
        {showAuth && (
          <div className="g-overlay" onClick={() => setShowAuth(false)}>
            <div className="g-modal cp-modal" onClick={e => e.stopPropagation()}>
              <div className="g-modal-icon">🏆</div>
              <h3 className="g-modal-title">Save Your Score</h3>
              <p className="g-modal-body">Create a free account to track your streak, save results, and compete on the leaderboard.</p>
              <div className="g-modal-btns">
                <Link href="/signup" className="g-modal-cta" style={{ background: '#38BDF8', color: '#050B14' }}>Create Free Account</Link>
                <Link href="/login" className="g-modal-sec">Sign In</Link>
              </div>
              <button onClick={() => { setShowAuth(false); setShowBanner(true); }} className="g-modal-skip">Maybe Later</button>
            </div>
          </div>
        )}

        {/* Bottom banner after "Maybe Later" */}
        {showBanner && !userInit && (
          <div className="g-banner">
            <span className="g-banner-text">Save your score & streak —</span>
            <Link href="/signup" className="g-banner-cta">Create Account</Link>
            <span style={{ color: '#3D6080', fontSize: '.75rem' }}>or</span>
            <Link href="/login" className="g-banner-link">Sign In</Link>
            <button onClick={() => setShowBanner(false)} className="g-banner-x">✕</button>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Styles ────────────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.cp-root{min-height:100vh;background:#050B14;color:#D4E8F5;font-family:'Barlow',sans-serif;
  background-image:linear-gradient(rgba(56,189,248,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,.025) 1px,transparent 1px);
  background-size:52px 52px}

/* Nav — 3-col grid so title truly centers */
.cp-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:.875rem 1.5rem;border-bottom:1px solid #0C1F30;position:sticky;top:0;background:#050B14;z-index:20}
.cp-nav-l{justify-self:start}
.cp-nav-c{display:flex;align-items:center;gap:.5rem;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.1rem;letter-spacing:.14em;color:#D4E8F5;justify-self:center}
.cp-nav-r{justify-self:end}
.cp-brand-pip{width:8px;height:8px;border-radius:50%;background:#38BDF8;box-shadow:0 0 8px #38BDF8;flex-shrink:0}

/* User badge */
.cp-badge{width:28px;height:28px;border-radius:50%;background:#0C2A3F;border:1.5px solid #38BDF8;color:#38BDF8;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.85rem;display:flex;align-items:center;justify-content:center;text-decoration:none;transition:.15s}
.cp-badge:hover{background:#38BDF8;color:#050B14}
.cp-signin{font-family:'Barlow Condensed',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.08em;color:#1A3A50;text-decoration:none;transition:.15s;border:1px solid #0C1F30;padding:.25rem .6rem;border-radius:4px}
.cp-signin:hover{color:#38BDF8;border-color:#38BDF8}

/* Shared game styles */
.g-back{color:#3D6080;text-decoration:none;font-size:.82rem;transition:.15s}
.g-back:hover{color:#D4E8F5}
.g-main{max-width:540px;margin:0 auto;padding:1.75rem 1.25rem 5rem}
.g-tabs{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.3rem;background:#08111C;border:1px solid #0C1F30;border-radius:14px;padding:.3rem;margin-bottom:.6rem}
.g-tab{display:flex;flex-direction:column;align-items:center;gap:.1rem;padding:.55rem .4rem;border:none;border-radius:10px;background:transparent;color:#3D6080;font-family:'Barlow Condensed',sans-serif;font-size:.88rem;font-weight:700;letter-spacing:.06em;cursor:pointer;transition:.2s}
.g-tab:hover:not(.g-tab-on){color:#D4E8F5}
.g-tab-on{font-weight:800}
.g-tab-sub{font-size:.6rem;opacity:.6}
.g-rules{font-size:.75rem;color:#3D6080;text-align:center;margin-bottom:1.25rem;padding:.5rem;background:#08111C;border:1px solid #0C1F30;border-radius:8px}
.g-lbl{font-size:.65rem;color:#3D6080;text-transform:uppercase;letter-spacing:.12em;margin-bottom:.2rem}
.g-sub{font-size:.68rem;color:#3D6080;margin-top:.15rem}
.g-pills{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1rem}
.g-pill{background:#08111C;border:1px solid #0C1F30;color:#8CBBCC;font-size:.72rem;padding:.28rem .7rem;border-radius:999px}
.g-pill-accent{color:#38BDF8;border-color:rgba(56,189,248,.3);font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.08em}
.g-card-label{font-family:'Barlow Condensed',sans-serif;font-size:.62rem;font-weight:700;letter-spacing:.18em;color:#3D6080;margin-bottom:1.1rem}
.g-fact{font-size:.8rem;color:#3D6080;line-height:1.5;margin-bottom:.5rem}
.g-row{display:flex;align-items:center;gap:1rem}
.g-share{background:transparent;border:1px solid #0C1F30;color:#3D6080;font-size:.78rem;padding:.45rem .9rem;border-radius:8px;cursor:pointer;transition:.15s}
.g-share:hover{border-color:#38BDF8;color:#38BDF8}
.g-return{font-size:.7rem;color:#1A3A50}
.g-msg{font-size:.82rem;padding:.65rem 1rem;border-radius:10px;margin-bottom:.85rem;background:#08111C;color:#8CBBCC;animation:fadeUp .2s ease both}
.g-msg-err{background:#1A0808;color:#EF4444}
.g-input-wrap{display:flex;flex-direction:column;gap:.65rem}
.g-input{width:100%;background:#08111C;border:1px solid #0C1F30;border-radius:14px;padding:.9rem 1.15rem;font-size:1rem;color:#D4E8F5;font-family:'Barlow',sans-serif;outline:none;transition:.15s}
.g-input::placeholder{color:#1A3A50}
.g-input:focus{border-color:#38BDF8}
.g-btn-row{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
.g-btn{padding:.9rem;border-radius:12px;border:1px solid #0C1F30;font-family:'Barlow Condensed',sans-serif;font-size:.88rem;font-weight:700;letter-spacing:.06em;cursor:pointer;transition:.2s;background:#08111C;color:#3D6080}
.g-btn:disabled{opacity:.3;cursor:not-allowed}
.g-btn:not(:disabled):hover{opacity:.85}
.g-btn-sec{background:#08111C;color:#D4E8F5;border:1px solid #0C1F30}
.g-btn-sec:not(:disabled):hover{background:#0C1F30}
.g-btn-sec:disabled{color:#1A3A50}
.g-giveup{background:none;border:none;color:#1A3A50;font-size:.75rem;cursor:pointer;padding:.2rem;transition:.15s;align-self:center}
.g-giveup:hover{color:#3D6080}
.g-footer{text-align:center;font-size:.68rem;color:#1A3A50;margin-top:2rem;line-height:1.6}
.g-pulse{font-family:'Barlow Condensed',sans-serif;font-size:1.2rem;font-weight:800;letter-spacing:.2em;animation:cpulse 1.2s ease infinite}
@keyframes cpulse{0%,100%{opacity:1}50%{opacity:.35}}
.g-shake{animation:shake .38s ease}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* Score bar */
.cp-scorebar{display:flex;justify-content:space-between;align-items:center;background:#08111C;border:1px solid #0C1F30;border-radius:18px;padding:1.1rem 1.4rem;margin-bottom:1rem;transition:.3s}
.cp-sb-won{border-color:rgba(56,189,248,.4);background:#051828}
.cp-sb-lost{border-color:rgba(239,68,68,.3);background:#180808}
.cp-score-n{font-family:'Barlow Condensed',sans-serif;font-size:2.8rem;font-weight:900;line-height:1;color:#D4E8F5}

/* Route */
.cp-route-card{background:#08111C;border:1px solid #0C1F30;border-radius:18px;padding:1.25rem 1.25rem 1.5rem;margin-bottom:1rem;overflow-x:auto}
.cp-transit{position:relative;min-height:70px}
.cp-rail{position:absolute;top:13px;left:14px;right:14px;height:2px;background:#0C1F30;border-radius:1px}
.cp-stops{display:flex;gap:0;position:relative;z-index:1;align-items:flex-start;flex-wrap:wrap;row-gap:.9rem}
.cp-stop{display:flex;flex-direction:column;align-items:center;gap:.35rem;min-width:54px;flex:0 0 auto}
.cp-dot{width:14px;height:14px;border-radius:50%;background:#38BDF8;border:2px solid #050B14;box-shadow:0 0 8px rgba(56,189,248,.6);transition:.3s}
.cp-dot-hidden{background:#0C1F30;box-shadow:none}
.cp-team{font-family:'Barlow Condensed',sans-serif;font-size:.95rem;font-weight:800;letter-spacing:.04em;color:#D4E8F5;text-align:center}
.cp-team-hidden{color:#1A3A50;font-size:1rem}
.cp-stop-fresh{animation:stopIn .45s cubic-bezier(.34,1.5,.64,1) both}
@keyframes stopIn{from{opacity:0;transform:scale(.4) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}

/* Result */
.cp-result{border-radius:18px;padding:1.4rem;margin-bottom:1rem;border:1px solid;animation:fadeUp .4s ease both}
.cp-result-won{background:#051828;border-color:rgba(56,189,248,.4)}
.cp-result-lost{background:#180808;border-color:rgba(239,68,68,.3)}
.cp-result-title{font-family:'Barlow Condensed',sans-serif;font-size:1.2rem;font-weight:900;letter-spacing:.08em;margin-bottom:.3rem}
.cp-result-won .cp-result-title{color:#38BDF8}
.cp-result-lost .cp-result-title{color:#EF4444}
.cp-result-name{font-size:1.15rem;font-weight:600;margin-bottom:.3rem;color:#D4E8F5}
.cp-result-pts{font-family:'Barlow Condensed',sans-serif;font-size:2rem;font-weight:900;color:#38BDF8;margin-bottom:.3rem}

/* Modal */
.g-overlay{position:fixed;inset:0;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;z-index:50;backdrop-filter:blur(4px)}
.g-modal{background:#08111C;border:1px solid #0C2A3F;border-radius:20px;padding:2rem 1.75rem;max-width:330px;width:90%;text-align:center;animation:fadeUp .3s ease both}
.cp-modal{border-color:#0C2A3F}
.g-modal-icon{font-size:2.5rem;margin-bottom:.75rem}
.g-modal-title{font-family:'Barlow Condensed',sans-serif;font-size:1.5rem;font-weight:800;letter-spacing:.06em;color:#D4E8F5;margin-bottom:.5rem}
.g-modal-body{font-size:.82rem;color:#3D6080;line-height:1.6;margin-bottom:1.25rem}
.g-modal-btns{display:flex;flex-direction:column;gap:.5rem;margin-bottom:.75rem}
.g-modal-cta{display:block;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1rem;letter-spacing:.06em;padding:.8rem;border-radius:12px;text-decoration:none;transition:.15s}
.g-modal-cta:hover{opacity:.88}
.g-modal-sec{display:block;background:transparent;border:1px solid #0C2A3F;color:#8CBBCC;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:.06em;padding:.7rem;border-radius:12px;text-decoration:none;transition:.15s}
.g-modal-sec:hover{border-color:#38BDF8;color:#38BDF8}
.g-modal-skip{background:none;border:none;color:#1A3A50;font-size:.75rem;cursor:pointer;transition:.15s}
.g-modal-skip:hover{color:#3D6080}

/* Bottom banner */
.g-banner{position:fixed;bottom:0;left:0;right:0;background:#08111C;border-top:1px solid #0C1F30;padding:.75rem 1.5rem;display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;z-index:40}
.g-banner-text{font-size:.78rem;color:#3D6080;flex-shrink:0}
.g-banner-cta{background:#38BDF8;color:#050B14;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.8rem;letter-spacing:.06em;padding:.3rem .8rem;border-radius:6px;text-decoration:none;transition:.15s;flex-shrink:0}
.g-banner-cta:hover{opacity:.88}
.g-banner-link{color:#3D6080;font-size:.78rem;text-decoration:underline;transition:.15s;flex-shrink:0}
.g-banner-link:hover{color:#38BDF8}
.g-banner-x{background:none;border:none;color:#1A3A50;font-size:.85rem;cursor:pointer;margin-left:auto;padding:.2rem .4rem;transition:.15s}
.g-banner-x:hover{color:#3D6080}
`;