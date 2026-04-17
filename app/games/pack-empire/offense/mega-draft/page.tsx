'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function parseCSVRow(row: string): string[] {
  const cols: string[] = []; let cur = ''; let inQ = false;
  for (const c of row) { if (c === '"') { inQ = !inQ; continue; } if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; } cur += c; }
  cols.push(cur.trim()); return cols;
}

/* ─── Player Pools ───────────────────────────────────────────────────── */
import { ALL_PLAYERS } from '@/lib/packs/current-offense-qb';
import { ALL_PLAYERS_V2 } from '@/lib/packs/current-offense-rb';
import { ALL_PLAYERS_V3 } from '@/lib/packs/current-offense-wr';
import { ALL_PLAYERS_V4 } from '@/lib/packs/current-offense-te';
import { ALL_PLAYERS_V5 } from '@/lib/packs/current-offense-ot';
import { ALL_PLAYERS_V6 } from '@/lib/packs/current-offense-iol';
import { ALL_PLAYERS_V7 } from '@/lib/packs/legend-offense';

type Rarity = 'common' | 'rare' | 'dynasty' | 'transcendent' | 'immortal';
interface Player { id: string; name: string; pos: string; team: string; score: number; rarity: Rarity; accolades: string[]; }

const RARITY_MAP: Record<string, Rarity> = {
  epic: 'dynasty', legendary: 'transcendent',
  common: 'common', rare: 'rare', dynasty: 'dynasty', transcendent: 'transcendent', immortal: 'immortal',
};

const FULL_POOL: Record<string, Player[]> = (() => {
  const keys = ['QB', 'RB', 'WR', 'TE', 'OT', 'OG', 'C'] as const;
  return Object.fromEntries(keys.map(k => [k, [
    ...ALL_PLAYERS[k], ...ALL_PLAYERS_V2[k], ...ALL_PLAYERS_V3[k],
    ...ALL_PLAYERS_V4[k], ...ALL_PLAYERS_V5[k], ...ALL_PLAYERS_V6[k], ...ALL_PLAYERS_V7[k],
  ].map(p => ({ ...p, rarity: (RARITY_MAP[p.rarity] ?? p.rarity) as Rarity }))]));
})() as Record<string, Player[]>;

const POOL_COUNTS: Record<string, number> = {
  QB: 4, RB: 4, WR: 8, TE: 4, OT: 6, OG: 6, C: 4,
};

const MEGA_WEIGHTS: Record<Rarity, number> = {
  common: 30, rare: 35, dynasty: 22, transcendent: 10, immortal: 3,
};

function generatePool(): Player[] {
  const result: Player[] = [];

  for (const [pos, count] of Object.entries(POOL_COUNTS)) {
    const players = FULL_POOL[pos] ?? [];
    const picked = new Set<string>();
    const posResult: Player[] = [];

    const dynastyPlus = players.filter(p => ['dynasty','transcendent','immortal'].includes(p.rarity));
    if (dynastyPlus.length > 0) {
      const pick = dynastyPlus[Math.floor(Math.random() * dynastyPlus.length)];
      posResult.push(pick);
      picked.add(pick.id);
    }

    let attempts = 0;
    while (posResult.length < count && attempts < 500) {
      attempts++;
      const available = players.filter(p => !picked.has(p.id));
      if (available.length === 0) break;
      const total = available.reduce((s, p) => s + (MEGA_WEIGHTS[p.rarity] ?? 1), 0);
      let roll = Math.random() * total;
      for (const p of available) {
        roll -= MEGA_WEIGHTS[p.rarity] ?? 1;
        if (roll <= 0) { posResult.push(p); picked.add(p.id); break; }
      }
    }

    result.push(...posResult);
  }

  return result.sort(() => Math.random() - 0.5);
}

export function buildSnakeOrder(totalPicks: number): number[] {
  const order: number[] = [];
  let round = 0;
  while (order.length < totalPicks) {
    if (round % 2 === 0) {
      order.push(0);
    } else {
      order.push(1);
    }
    round++;
  }
  const result: number[] = [];
  let r = 0;
  while (result.length < totalPicks) {
    if (r % 2 === 0) {
      result.push(0);
    } else {
      result.push(1);
    }
    r++;
  }
  const snake: number[] = [];
  for (let pick = 0; pick < totalPicks; pick++) {
    if (pick % 4 < 2) snake.push(0);
    else snake.push(1);
  }
  const proper: number[] = [];
  for (let pick = 0; pick < totalPicks; pick++) {
    const pair = Math.floor(pick / 2);
    if (pair % 2 === 0) proper.push(pick % 2 === 0 ? 0 : 1);
    else proper.push(pick % 2 === 0 ? 1 : 0);
  }
  return proper;
}

function MegaDraftLobby() {
  const router   = useRouter();
  const supabase = createClient();

  const [userInit, setUserInit]     = useState<string | null>(null);
  const [isReturning, setIsRet]     = useState(false);

  const [user, setUser]     = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [guestName, setGuestName] = useState('');
  const [needsName, setNeedsName] = useState(false);
  const [phase, setPhase]   = useState<'loading'|'lobby'|'waiting'|'creating'>('loading');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [activeDrafts, setActiveDrafts] = useState<any[]>([]);
  const [error, setError]   = useState('');

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) { const n = user.user_metadata?.full_name || user.email || 'U'; setUserInit(n[0].toUpperCase()); }
    });
    try { if (localStorage.getItem('pe-has-played')) setIsRet(true); } catch { }
    fetch('/players.csv').then(r => r.ok ? r.text() : Promise.reject()).then(text => {
      const map: Record<string, string> = {};
      text.split('\n').forEach(line => {
        if (!line.trim()) return;
        const cols = parseCSVRow(line);
        const name = cols[1]; const url = cols[22];
        if (name && url && url.startsWith('http')) map[name] = url;
      });
    }).catch(() => { });
  }, []);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('username, full_name').eq('id', user.id).single();
        setProfile(prof);
      }
      loadActiveDrafts();
      setPhase('lobby');
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadActiveDrafts = () => {
    try {
      const drafts = JSON.parse(localStorage.getItem('mega-draft-active') || '[]');
      setActiveDrafts(drafts);
    } catch { }
  };

  const getMyName = () => {
    if (user) return profile?.username || profile?.full_name || user.email || 'Player';
    return guestName.trim() || 'Guest';
  };

  const createDraft = async () => {
    const name = getMyName();
    if (!name) { setNeedsName(true); return; }

    setPhase('creating');
    setError('');

    try {
      const id = 'md-' + Date.now().toString(36).slice(0, 9);
      const pool = generatePool();

      const { error: err } = await supabase.from('mega_drafts').insert({
        id,
        pool,
        picks: [],
        current_pick: 0,
        p1_id: user?.id ?? `guest-${Date.now()}`,
        p1_name: name,
        p2_id: null,
        p2_name: null,
        status: 'waiting',
      });

      if (err) throw err;

      const entry = { id, role: 'p1', createdAt: Date.now(), opponentName: null };
      const existing = JSON.parse(localStorage.getItem('mega-draft-active') || '[]');
      localStorage.setItem('mega-draft-active', JSON.stringify([entry, ...existing]));
      if (!user) localStorage.setItem(`mega-guest-${id}`, name);

      setDraftId(id);
      setPhase('waiting');
    } catch (e: any) {
      setError(e.message || 'Failed to create draft');
      setPhase('lobby');
    }
  };

  const joinDraft = async (id: string) => {
    const name = getMyName();
    if (!name) { setNeedsName(true); return; }

    setError('');
    try {
      const { data: draft } = await supabase.from('mega_drafts').select('*').eq('id', id).single();
      if (!draft) { setError('Draft not found'); return; }
      if (draft.status !== 'waiting') { setError('This draft already started'); return; }

      const p1GoesFirst = Math.random() < 0.5;
      const myId = user?.id ?? `guest-${Date.now()}`;

      await supabase.from('mega_drafts').update({
        p2_id: p1GoesFirst ? draft.p1_id : myId,
        p2_name: p1GoesFirst ? draft.p1_name : name,
        p1_id: p1GoesFirst ? myId : draft.p1_id,
        p1_name: p1GoesFirst ? name : draft.p1_name,
        status: 'active',
        current_pick: 0,
      }).eq('id', id);

      const entry = { id, role: 'p2', createdAt: Date.now() };
      const existing = JSON.parse(localStorage.getItem('mega-draft-active') || '[]');
      localStorage.setItem('mega-draft-active', JSON.stringify([entry, ...existing]));
      if (!user) localStorage.setItem(`mega-guest-${id}`, name);

      router.push(`/games/pack-empire/offense/mega-draft/${id}`);
    } catch (e: any) {
      setError(e.message || 'Failed to join');
    }
  };

  useEffect(() => {
    if (phase !== 'waiting' || !draftId) return;
    const interval = setInterval(async () => {
      const { data } = await supabase.from('mega_drafts').select('status').eq('id', draftId).single();
      if (data?.status === 'active') {
        clearInterval(interval);
        router.push(`/games/pack-empire/offense/mega-draft/${draftId}`);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [phase, draftId, supabase, router]);

  const deleteActiveDraft = (id: string) => {
    const updated = activeDrafts.filter(d => d.id !== id);
    localStorage.setItem('mega-draft-active', JSON.stringify(updated));
    setActiveDrafts(updated);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ── Masthead / Nav ── */}
      <nav className="mdh-nav">
        <div className="mdh-nav-l">
          <button onClick={() => window.history.back()} className="mdh-back">← Back</button>
        </div>
        <div className="mdh-nav-c">
          <span className="mdh-pip" />
          <span className="mdh-nav-title">
            Mega <span className="mdh-nav-italic">Draft.</span>
          </span>
        </div>
        <div className="mdh-nav-r">
          {userInit
            ? <Link href="/profile" className="mdh-nb">{userInit}</Link>
            : <Link href="/login" className="mdh-si">Sign In</Link>}
        </div>
      </nav>

      <div className="mdh-root">
        <div className="mdh-container">

          {/* Guest name gate */}
          {needsName && !user && (
            <div className="mdh-name-gate">
              <div className="mdh-name-label">★ Your name</div>
              <div className="mdh-name-row">
                <input
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  placeholder="Enter your name..."
                  maxLength={24}
                  className="mdh-input"
                  autoFocus
                />
                <button onClick={() => setNeedsName(false)} className="mdh-btn primary" disabled={!guestName.trim()}>
                  OK →
                </button>
              </div>
            </div>
          )}

          {/* ════ LOBBY ════ */}
          {phase === 'lobby' && (
            <>
              {/* Hero */}
              <header className="mdh-hero">
                <div className="mdh-hero-kicker">§ Pack Empire · Head-to-head mode</div>
                <h1 className="mdh-hero-title">
                  Mega <span className="mdh-italic">Draft.</span>
                </h1>
                <p className="mdh-hero-sub">
                  Snake draft from a shared pool — steal the best players before your opponent does.
                </p>
              </header>

              {/* Rules section */}
              <section className="mdh-section">
                <div className="mdh-section-header">
                  <span className="mdh-section-num">§ 01 · Primer</span>
                  <span className="mdh-section-title">How it <span className="mdh-italic">works</span></span>
                </div>
                <div className="mdh-rules">
                  {[
                    { num: 'I.',   title: 'Shared player pool',    text: '36 players drafted from the same pool — QB×4, RB×4, WR×8, TE×4, OT×6, OG×6, C×4.' },
                    { num: 'II.',  title: 'Snake draft order',     text: 'P1 P2 P2 P1 P1 P2… evens out the early-pick advantage.' },
                    { num: 'III.', title: 'Real-time picks',        text: 'See your opponent draft live. Every pick updates instantly.' },
                    { num: 'IV.',  title: 'Fill the lineup',        text: 'Draft for all 11 positions. First to complete wins the score comparison.' },
                  ].map((r, i) => (
                    <div key={i} className="mdh-rule-row">
                      <div className="mdh-rule-roman">{r.num}</div>
                      <div>
                        <div className="mdh-rule-title">{r.title}</div>
                        <div className="mdh-rule-text">{r.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Actions */}
              <section className="mdh-section">
                <div className="mdh-section-header">
                  <span className="mdh-section-num">§ 02 · Begin</span>
                  <span className="mdh-section-title">Start a <span className="mdh-italic">draft</span></span>
                </div>

                {error && <div className="mdh-error">{error}</div>}

                <div className="mdh-actions">
                  <button onClick={createDraft} className="mdh-btn primary full">
                    <span>Create new draft</span>
                    <span>→</span>
                  </button>
                  <JoinByIdSection onJoin={joinDraft} />
                </div>
              </section>

              {/* Active drafts */}
              {activeDrafts.length > 0 && (
                <section className="mdh-section">
                  <div className="mdh-section-header">
                    <span className="mdh-section-num">§ 03 · In progress</span>
                    <span className="mdh-section-title">
                      Active <span className="mdh-italic">drafts</span>
                      <span className="mdh-count">({activeDrafts.length})</span>
                    </span>
                  </div>
                  <div className="mdh-drafts-list">
                    {activeDrafts.map((d, i) => (
                      <div key={d.id} className="mdh-draft-row">
                        <div className="mdh-dr-num">{String(i + 1).padStart(2, '0')}</div>
                        <div className="mdh-dr-info">
                          <div className="mdh-dr-id">{d.id.toUpperCase()}</div>
                          <div className="mdh-dr-meta">
                            {new Date(d.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            <span className="mdh-dr-sep">·</span>
                            {d.role === 'p1' ? 'You created' : 'You joined'}
                          </div>
                        </div>
                        <div className="mdh-dr-actions">
                          <button onClick={() => router.push(`/games/pack-empire/offense/mega-draft/${d.id}`)} className="mdh-btn secondary small">
                            Rejoin →
                          </button>
                          <button onClick={() => deleteActiveDraft(d.id)} className="mdh-dr-delete" aria-label="Delete">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* ════ CREATING ════ */}
          {phase === 'creating' && (
            <div className="mdh-status-card">
              <div className="mdh-status-icon">⚙</div>
              <div className="mdh-status-kicker">§ Building</div>
              <div className="mdh-status-title">
                Generating the <span className="mdh-italic">pool.</span>
              </div>
              <div className="mdh-status-sub">Assembling your 36-player draft pool</div>
            </div>
          )}

          {/* ════ WAITING ════ */}
          {phase === 'waiting' && draftId && (
            <div className="mdh-status-card">
              <div className="mdh-status-icon">⏳</div>
              <div className="mdh-status-kicker">§ Draft created · Awaiting opponent</div>
              <h2 className="mdh-status-title">
                Share your <span className="mdh-italic">ID.</span>
              </h2>
              <p className="mdh-status-sub">
                Send this to your opponent — the draft begins instantly when they join.
              </p>

              <div className="mdh-invite-box">
                <div className="mdh-invite-label">Draft ID</div>
                <div className="mdh-invite-id">{draftId.toUpperCase()}</div>
              </div>

              <CopyButton text={draftId.toUpperCase()} label="Copy draft ID" />

              <div className="mdh-waiting-row">
                <div className="mdh-wait-dot" />
                <span className="mdh-waiting-text">Waiting for opponent to join</span>
                <div className="mdh-wait-dot delayed" />
              </div>

              <button onClick={() => setPhase('lobby')} className="mdh-cancel-btn">Cancel</button>
            </div>
          )}

          {phase === 'loading' && (
            <div className="mdh-loading">
              <div className="mdh-loading-text">Loading —</div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

/* ── Join by ID subcomponent ── */
function JoinByIdSection({ onJoin }: { onJoin: (id: string) => void }) {
  const [id, setId]     = useState('');
  const [open, setOpen] = useState(false);
  return (
    <>
      {!open ? (
        <button onClick={() => setOpen(true)} className="mdh-btn secondary full">
          <span>Join existing draft</span>
          <span>↓</span>
        </button>
      ) : (
        <div className="mdh-join-row">
          <input
            value={id}
            onChange={e => setId(e.target.value.trim().toLowerCase())}
            placeholder="Enter draft ID..."
            className="mdh-input"
            autoFocus
          />
          <button onClick={() => onJoin(id)} disabled={!id} className="mdh-btn primary small">Join</button>
          <button onClick={() => setOpen(false)} className="mdh-btn ghost small" aria-label="Cancel">✕</button>
        </div>
      )}
    </>
  );
}

/* ── Copy button ── */
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="mdh-btn primary full copy"
    >
      <span>{copied ? '✓ Copied!' : `↗ ${label}`}</span>
      {!copied && <span>→</span>}
    </button>
  );
}

function Fallback() {
  return (
    <div className="mdh-loading-fullscreen">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="mdh-loading-text">Loading —</div>
    </div>
  );
}

export default function MegaDraftLobbyPage() {
  return <Suspense fallback={<Fallback />}><MegaDraftLobby /></Suspense>;
}

/* ══════════════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --mdh-bg:#141311;
  --mdh-bg-soft:#1c1b18;
  --mdh-bg-card:#201e1a;
  --mdh-ink:#f4ebd8;
  --mdh-ink-soft:#bfb5a0;
  --mdh-ink-mute:#7d7463;
  --mdh-amber:#e8a84b;
  --mdh-rust:#c04820;
  --mdh-line:#3a3630;
  --mdh-line-soft:#2a2620;
  /* Mega Draft signature: purple */
  --mdh-purple:#b06090;
  --mdh-purple-bright:#cc7bb0;
  --mdh-purple-deep:#7a4068;
  --mdh-purple-glow:rgba(176,96,144,.4);
}

body{font-family:'Space Grotesk',sans-serif;background:var(--mdh-bg);color:var(--mdh-ink)}

.mdh-italic{font-style:italic;color:var(--mdh-purple)}

/* ═══ NAV / MASTHEAD ═══ */
.mdh-nav{
  display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:1rem;
  padding:1.2rem 2rem;
  background:rgba(20,19,17,.92);
  backdrop-filter:blur(12px);
  border-bottom:1px solid var(--mdh-line);
  position:sticky;top:0;z-index:30;
}
.mdh-nav-l{justify-self:start}
.mdh-nav-c{display:flex;align-items:center;gap:.65rem;justify-self:center}
.mdh-nav-r{justify-self:end}

.mdh-back{
  background:none;border:none;cursor:pointer;
  color:var(--mdh-purple);text-decoration:none;
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;
  padding:0;transition:color .2s;
}
.mdh-back:hover{color:var(--mdh-purple-bright)}

.mdh-nav-title{
  font-family:'DM Serif Display',serif;
  font-size:1.35rem;letter-spacing:-.01em;color:var(--mdh-ink);
}
.mdh-nav-italic{font-style:italic;color:var(--mdh-purple)}

.mdh-pip{
  width:9px;height:9px;border-radius:50%;
  background:var(--mdh-purple);flex-shrink:0;
  box-shadow:0 0 0 3px rgba(176,96,144,.15),0 0 12px var(--mdh-purple);
  animation:mdh-pip 2s ease-in-out infinite;
}
@keyframes mdh-pip{
  0%,100%{box-shadow:0 0 0 3px rgba(176,96,144,.15),0 0 12px var(--mdh-purple)}
  50%{box-shadow:0 0 0 6px rgba(176,96,144,.05),0 0 22px var(--mdh-purple-bright)}
}

.mdh-nb{
  width:32px;height:32px;border-radius:2px;
  background:var(--mdh-bg-card);border:1px solid var(--mdh-purple);
  color:var(--mdh-purple);
  font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:.85rem;
  display:flex;align-items:center;justify-content:center;text-decoration:none;
  transition:all .2s;
}
.mdh-nb:hover{background:var(--mdh-purple);color:var(--mdh-bg)}
.mdh-si{
  font-family:'JetBrains Mono',monospace;font-size:.68rem;font-weight:700;
  letter-spacing:.2em;text-transform:uppercase;
  color:var(--mdh-purple);text-decoration:none;
  border:1px solid var(--mdh-purple);
  padding:.4rem .8rem;border-radius:2px;transition:all .2s;
}
.mdh-si:hover{background:rgba(176,96,144,.08);color:var(--mdh-purple-bright)}

/* ═══ ROOT ═══ */
.mdh-root{
  min-height:calc(100vh - 62px);
  background:var(--mdh-bg);color:var(--mdh-ink);
  background-image:
    radial-gradient(ellipse at 50% -10%,rgba(176,96,144,.06),transparent 55%),
    radial-gradient(ellipse at 15% 80%,rgba(122,64,104,.03),transparent 50%),
    repeating-linear-gradient(0deg,transparent,transparent 70px,rgba(176,96,144,.012) 70px,rgba(176,96,144,.012) 71px);
  padding-bottom:3rem;
}
.mdh-container{max-width:720px;margin:0 auto;padding:2.5rem 1.5rem 4rem;display:flex;flex-direction:column;gap:2rem}

/* ═══ HERO ═══ */
.mdh-hero{text-align:center;padding:1rem 0 0}
.mdh-hero-kicker{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.62rem;letter-spacing:.32em;text-transform:uppercase;
  color:var(--mdh-purple);margin-bottom:1rem;
}
.mdh-hero-title{
  font-family:'DM Serif Display',serif;
  font-size:clamp(2.6rem,7vw,4.2rem);line-height:.95;letter-spacing:-.025em;
  color:var(--mdh-ink);margin-bottom:1rem;
}
.mdh-hero-sub{
  font-family:'DM Serif Display',serif;font-style:italic;
  font-size:1.05rem;color:var(--mdh-ink-soft);
  max-width:480px;margin:0 auto;line-height:1.5;
}

/* ═══ SECTIONS ═══ */
.mdh-section{
  background:var(--mdh-bg-card);border:1px solid var(--mdh-line);
  padding:1.75rem 1.75rem 1.5rem;
}

.mdh-section-header{
  display:flex;justify-content:space-between;align-items:baseline;gap:.75rem;flex-wrap:wrap;
  padding-bottom:1rem;margin-bottom:1.25rem;
  border-bottom:3px double var(--mdh-line);
}
.mdh-section-num{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.62rem;letter-spacing:.22em;text-transform:uppercase;
  color:var(--mdh-purple);
}
.mdh-section-title{
  font-family:'DM Serif Display',serif;
  font-size:1.25rem;letter-spacing:-.01em;
  color:var(--mdh-ink);display:flex;align-items:baseline;gap:.5rem;
}
.mdh-count{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.7rem;letter-spacing:.1em;
  color:var(--mdh-ink-mute);
}

/* ═══ RULES ═══ */
.mdh-rules{display:flex;flex-direction:column;gap:.2rem}
.mdh-rule-row{
  display:grid;grid-template-columns:auto 1fr;gap:1rem;align-items:baseline;
  padding:.85rem 0;border-bottom:1px solid var(--mdh-line-soft);
}
.mdh-rule-row:last-child{border-bottom:none}
.mdh-rule-roman{
  font-family:'DM Serif Display',serif;font-style:italic;
  font-size:1.3rem;color:var(--mdh-purple);min-width:2.2rem;
  letter-spacing:-.02em;
}
.mdh-rule-title{
  font-family:'DM Serif Display',serif;
  font-size:1.05rem;line-height:1.2;letter-spacing:-.01em;
  color:var(--mdh-ink);margin-bottom:.2rem;
}
.mdh-rule-text{
  font-family:'Space Grotesk',sans-serif;
  font-size:.85rem;color:var(--mdh-ink-soft);line-height:1.55;
}

/* ═══ ACTIONS ═══ */
.mdh-actions{display:flex;flex-direction:column;gap:.55rem}
.mdh-join-row{display:flex;gap:.5rem}
.mdh-join-row .mdh-input{flex:1;min-width:0}

.mdh-btn{
  display:flex;align-items:center;justify-content:center;gap:.6rem;
  padding:1rem 1.4rem;
  font-family:'Space Grotesk',sans-serif;font-weight:700;
  font-size:.85rem;letter-spacing:.16em;text-transform:uppercase;
  border-radius:2px;cursor:pointer;text-decoration:none;border:none;
  transition:all .25s cubic-bezier(.2,.8,.2,1);
}
.mdh-btn.full{width:100%}
.mdh-btn.small{padding:.55rem 1rem;font-size:.7rem;letter-spacing:.14em;gap:.35rem}
.mdh-btn.copy{margin-bottom:1rem}

.mdh-btn.primary{
  background:var(--mdh-purple);color:var(--mdh-bg);
  box-shadow:0 8px 20px rgba(176,96,144,.15);
}
.mdh-btn.primary:hover:not(:disabled){
  background:var(--mdh-purple-bright);
  transform:translateY(-2px);
  box-shadow:0 14px 30px rgba(176,96,144,.3);
}
.mdh-btn.primary:disabled{
  background:var(--mdh-line);color:var(--mdh-ink-mute);
  cursor:not-allowed;box-shadow:none;
}

.mdh-btn.secondary{
  background:transparent;color:var(--mdh-purple);
  border:1px solid var(--mdh-purple);
}
.mdh-btn.secondary:hover{
  background:rgba(176,96,144,.08);
  color:var(--mdh-purple-bright);border-color:var(--mdh-purple-bright);
}

.mdh-btn.ghost{
  background:transparent;color:var(--mdh-ink-mute);
  border:1px solid var(--mdh-line);
  padding:.55rem .85rem;
}
.mdh-btn.ghost:hover{
  color:var(--mdh-rust);border-color:var(--mdh-rust);
}

/* ═══ INPUT ═══ */
.mdh-input{
  width:100%;
  background:var(--mdh-bg);color:var(--mdh-ink);
  border:1px solid var(--mdh-line);
  padding:.85rem 1rem;
  font-family:'Space Grotesk',sans-serif;font-size:.9rem;letter-spacing:.02em;
  border-radius:2px;outline:none;transition:border-color .2s;
}
.mdh-input:focus{border-color:var(--mdh-purple)}
.mdh-input::placeholder{color:var(--mdh-ink-mute)}

/* ═══ NAME GATE ═══ */
.mdh-name-gate{
  background:var(--mdh-bg-card);border:1px solid var(--mdh-line);
  padding:1.25rem 1.4rem;position:relative;
}
.mdh-name-gate::before{
  content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:var(--mdh-purple);
}
.mdh-name-label{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.62rem;letter-spacing:.26em;text-transform:uppercase;
  color:var(--mdh-purple);margin-bottom:.65rem;
}
.mdh-name-row{display:flex;gap:.5rem}
.mdh-name-row .mdh-input{flex:1}

/* ═══ ERROR ═══ */
.mdh-error{
  font-family:'Space Grotesk',sans-serif;font-size:.85rem;line-height:1.5;
  color:var(--mdh-rust);
  background:rgba(192,72,32,.08);
  border:1px solid rgba(192,72,32,.3);
  border-left:3px solid var(--mdh-rust);
  padding:.7rem 1rem;margin-bottom:.85rem;
}

/* ═══ ACTIVE DRAFTS LIST ═══ */
.mdh-drafts-list{display:flex;flex-direction:column;gap:.2rem}
.mdh-draft-row{
  display:grid;grid-template-columns:auto 1fr auto;gap:1rem;align-items:center;
  padding:.85rem 0;
  border-bottom:1px solid var(--mdh-line-soft);
  transition:padding-left .2s;
}
.mdh-draft-row:last-child{border-bottom:none}
.mdh-draft-row:hover{padding-left:.35rem}
.mdh-dr-num{
  font-family:'DM Serif Display',serif;font-style:italic;
  font-size:1.3rem;letter-spacing:-.02em;
  color:var(--mdh-purple);
  min-width:2rem;
}
.mdh-dr-info{min-width:0}
.mdh-dr-id{
  font-family:'DM Serif Display',serif;
  font-size:1rem;line-height:1.15;letter-spacing:.02em;
  color:var(--mdh-ink);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.mdh-dr-meta{
  font-family:'JetBrains Mono',monospace;
  font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;
  color:var(--mdh-ink-mute);margin-top:3px;
}
.mdh-dr-sep{margin:0 .4em}

.mdh-dr-actions{display:flex;align-items:center;gap:.4rem;flex-shrink:0}
.mdh-dr-delete{
  background:none;border:1px solid transparent;
  color:var(--mdh-ink-mute);cursor:pointer;
  width:30px;height:30px;border-radius:2px;
  font-size:.78rem;transition:all .2s;
}
.mdh-dr-delete:hover{
  border-color:var(--mdh-rust);color:var(--mdh-rust);
  background:rgba(192,72,32,.05);
}

/* ═══ STATUS CARD (creating / waiting) ═══ */
.mdh-status-card{
  background:var(--mdh-bg-card);border:1px solid var(--mdh-line);
  padding:3rem 2rem;text-align:center;
  position:relative;
}
.mdh-status-card::before{
  content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:var(--mdh-purple);
}
.mdh-status-icon{font-size:2.8rem;margin-bottom:1rem}
.mdh-status-kicker{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.62rem;letter-spacing:.28em;text-transform:uppercase;
  color:var(--mdh-purple);margin-bottom:.65rem;
}
.mdh-status-title{
  font-family:'DM Serif Display',serif;
  font-size:clamp(1.7rem,4vw,2.3rem);line-height:1;letter-spacing:-.02em;
  color:var(--mdh-ink);margin-bottom:.7rem;
}
.mdh-status-sub{
  font-family:'Space Grotesk',sans-serif;
  color:var(--mdh-ink-soft);font-size:.92rem;line-height:1.55;
  max-width:400px;margin:0 auto 1.5rem;
}

/* ═══ INVITE BOX ═══ */
.mdh-invite-box{
  background:var(--mdh-bg);border:1px solid var(--mdh-line);
  padding:1.25rem 1.5rem;margin:1.25rem 0 1rem;
  text-align:center;position:relative;
}
.mdh-invite-box::before{
  content:'';position:absolute;top:0;left:0;width:2px;height:100%;background:var(--mdh-purple);
}
.mdh-invite-label{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.62rem;letter-spacing:.28em;text-transform:uppercase;
  color:var(--mdh-ink-mute);margin-bottom:.55rem;
}
.mdh-invite-id{
  font-family:'DM Serif Display',serif;
  font-size:1.5rem;letter-spacing:.04em;
  color:var(--mdh-purple);
}

/* ═══ WAITING ROW ═══ */
.mdh-waiting-row{
  display:flex;align-items:center;justify-content:center;gap:.7rem;
  padding:.75rem 0;margin-bottom:.75rem;
}
.mdh-wait-dot{
  width:7px;height:7px;border-radius:50%;
  background:var(--mdh-purple);flex-shrink:0;
  box-shadow:0 0 10px var(--mdh-purple-glow);
  animation:mdh-wait 1.4s ease-in-out infinite;
}
.mdh-wait-dot.delayed{animation-delay:.35s}
@keyframes mdh-wait{
  0%,100%{opacity:.35;transform:scale(.75)}
  50%{opacity:1;transform:scale(1.15)}
}
.mdh-waiting-text{
  font-family:'DM Serif Display',serif;font-style:italic;
  font-size:.92rem;color:var(--mdh-ink-soft);
}

.mdh-cancel-btn{
  background:none;border:none;cursor:pointer;
  color:var(--mdh-ink-mute);
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;
  padding:.4rem;transition:color .2s;
}
.mdh-cancel-btn:hover{color:var(--mdh-purple)}

/* ═══ LOADING ═══ */
.mdh-loading{padding:4rem 1rem;text-align:center}
.mdh-loading-fullscreen{
  min-height:100vh;background:var(--mdh-bg);
  display:flex;align-items:center;justify-content:center;
}
.mdh-loading-text{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.72rem;letter-spacing:.28em;text-transform:uppercase;
  color:var(--mdh-ink-mute);
}

/* ═══ RESPONSIVE ═══ */
@media(max-width:680px){
  .mdh-nav{padding:1rem 1.25rem;gap:.75rem}
  .mdh-nav-title{font-size:1.1rem}
  .mdh-container{padding:1.75rem 1rem 3rem;gap:1.5rem}
  .mdh-section{padding:1.4rem 1.2rem 1.25rem}
  .mdh-section-header{flex-direction:column;align-items:flex-start;gap:.4rem}
  .mdh-status-card{padding:2.2rem 1.4rem}
  .mdh-hero{padding:.5rem 0 0}
  .mdh-draft-row{
    grid-template-columns:auto 1fr;gap:.7rem;
  }
  .mdh-dr-actions{
    grid-column:1 / -1;justify-content:flex-end;margin-top:.4rem;
  }
  .mdh-join-row{flex-wrap:wrap}
  .mdh-join-row .mdh-input{flex:1 1 100%;margin-bottom:.3rem}
  .mdh-join-row .mdh-btn{flex:1}
  .mdh-name-row{flex-direction:column}
  .mdh-name-row .mdh-btn{width:100%}
}
@media(max-width:420px){
  .mdh-nav-title{font-size:1rem}
  .mdh-back{font-size:.65rem}
  .mdh-si{font-size:.62rem;padding:.3rem .6rem}
  .mdh-hero-title{font-size:2.3rem}
  .mdh-btn{font-size:.78rem;letter-spacing:.12em;padding:.95rem 1.1rem}
  .mdh-invite-id{font-size:1.25rem}
}
`;
