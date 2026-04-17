'use client';
import { useState, useEffect, useCallback } from ‘react’;
import Link from ‘next/link’;
import { useRouter } from ‘next/navigation’;
import { createClient } from ‘@/lib/supabase/client’;

function parseCSVRow(row: string): string[] {
const cols: string[] = []; let cur = ‘’; let inQ = false;
for (const c of row) { if (c === ‘”’) { inQ = !inQ; continue; } if (c === ‘,’ && !inQ) { cols.push(cur.trim()); cur = ‘’; continue; } cur += c; }
cols.push(cur.trim()); return cols;
}

export default function VersusChallenge() {
const [phase, setPhase] = useState<‘loading’ | ‘sign-in’ | ‘lobby’ | ‘invite’>(‘loading’);
const [user, setUser]   = useState<any>(null);
const [profile, setProfile] = useState<any>(null);
const [challengeId, setChallengeId]         = useState<string | null>(null);
const [activeChallenges, setActiveChallenges] = useState<any[]>([]);
const [pendingInvites, setPendingInvites]     = useState<any[]>([]);
const [friends, setFriends]                   = useState<any[]>([]);
const [showFriendPicker, setShowFriendPicker] = useState(false);
const [copied, setCopied]   = useState(false);
const [origin, setOrigin]   = useState(’’);

const [userInit, setUserInit]     = useState<string | null>(null);
const [isReturning, setIsRet]     = useState(false);

const router   = useRouter();
const supabase = createClient();

useEffect(() => { setOrigin(window.location.origin); }, []);

useEffect(() => {
createClient().auth.getUser().then(({ data: { user } }) => {
if (user) { const n = user.user_metadata?.full_name || user.email || ‘U’; setUserInit(n[0].toUpperCase()); }
});
try { if (localStorage.getItem(‘pe-has-played’)) setIsRet(true); } catch { }
fetch(’/players.csv’).then(r => r.ok ? r.text() : Promise.reject()).then(text => {
const map: Record<string, string> = {};
text.split(’\n’).forEach(line => {
if (!line.trim()) return;
const cols = parseCSVRow(line);
const name = cols[1]; const url = cols[22];
if (name && url && url.startsWith(‘http’)) map[name] = url;
});
}).catch(() => { });
}, []);

/* ── Init ── */
useEffect(() => {
async function init() {
const { data: { user } } = await supabase.auth.getUser();
setUser(user);
if (!user) { setPhase(‘sign-in’); return; }

```
  const { data: prof } = await supabase.from('profiles').select('username, full_name').eq('id', user.id).single();
  setProfile(prof);

  setPhase('lobby');
  await Promise.all([
    loadActiveChallenges(user),
    loadPendingInvites(user.id),
    loadFriends(user.id),
  ]);
}
init();
```

// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

/* ── Poll every 6s for new invites ── */
useEffect(() => {
if (!user) return;
const interval = setInterval(() => {
loadPendingInvites(user.id);
loadActiveChallenges(user);
}, 6000);
return () => clearInterval(interval);
}, [user]);

/* ── Loaders ── */
const loadActiveChallenges = useCallback(async (u: any) => {
try {
const active = JSON.parse(localStorage.getItem(‘versus-active-challenges’) || ‘[]’);
const enriched = await Promise.all(active.map(async (ch: any) => {
try {
const { data } = await supabase
.from(‘versus_challenges’)
.select(‘opponent_name, host_name, status, opponent_result, host_result’)
.eq(‘id’, ch.id)
.single();
if (!data) return ch;
const isOpponent = ch.isOpponent;
const opponentName = isOpponent
? (data.host_name || ‘Host’)
: (data.opponent_name || ‘Waiting for opponent…’);
return { …ch, opponentName };
} catch { return ch; }
}));
setActiveChallenges(enriched);
} catch { }
}, [supabase]);

const loadPendingInvites = useCallback(async (userId: string) => {
const { data } = await supabase
.from(‘notifications’)
.select(’*’)
.eq(‘user_id’, userId)
.eq(‘type’, ‘challenge_invite’)
.eq(‘read’, false)
.order(‘created_at’, { ascending: false });
setPendingInvites(data ?? []);
}, [supabase]);

const loadFriends = useCallback(async (userId: string) => {
const { data } = await supabase
.from(‘friends’)
.select(‘id, requester_id, addressee_id, status’)
.or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
.eq(‘status’, ‘accepted’);
if (!data) return;

```
const enriched = await Promise.all(data.map(async (f: any) => {
  const otherId = f.requester_id === userId ? f.addressee_id : f.requester_id;
  const { data: prof } = await supabase.from('profiles').select('username, full_name').eq('id', otherId).single();
  return { id: otherId, username: prof?.username ?? '', full_name: prof?.full_name ?? '' };
}));
setFriends(enriched);
```

}, [supabase]);

/* ── Create challenge (link-based) ── */
const createNewChallenge = async () => {
const newId = ‘vs-’ + Date.now().toString(36).slice(0, 9);
setChallengeId(newId);
setPhase(‘invite’);

```
await supabase.from('versus_challenges').insert({
  id: newId,
  creator_id: user?.id ?? null,
  host_name: profile?.username || profile?.full_name || user?.email || 'Host',
  status: 'waiting',
});

const newChallenge = {
  id: newId, status: 'waiting', createdAt: Date.now(),
  creatorId: user?.id, opponentName: 'Waiting for opponent...',
};
const current = JSON.parse(localStorage.getItem('versus-active-challenges') || '[]');
localStorage.setItem('versus-active-challenges', JSON.stringify([newChallenge, ...current]));
```

};

/* ── Challenge a friend directly ── */
const challengeFriend = async (friendId: string, friendUsername: string) => {
const newId = ‘vs-’ + Date.now().toString(36).slice(0, 9);

```
await supabase.from('versus_challenges').insert({
  id: newId,
  creator_id: user?.id ?? null,
  host_name: profile?.username || profile?.full_name || user?.email || 'Host',
  status: 'waiting',
});

await supabase.from('notifications').insert({
  user_id: friendId,
  type: 'challenge_invite',
  from_user_id: user.id,
  from_username: profile?.username ?? user.email,
  data: { challenge_id: newId },
});

const entry = { id: newId, status: 'waiting', createdAt: Date.now(), creatorId: user?.id, opponentName: friendUsername };
const current = JSON.parse(localStorage.getItem('versus-active-challenges') || '[]');
localStorage.setItem('versus-active-challenges', JSON.stringify([entry, ...current]));

setShowFriendPicker(false);
router.push(`/games/pack-empire/offense/versus/draft?challenge=${newId}`);
```

};

/* ── Accept a pending invite ── */
const acceptInvite = async (notif: any) => {
const challengeId = notif.data?.challenge_id;
if (!challengeId) return;

```
await supabase.from('notifications').update({ read: true }).eq('id', notif.id);

const { data: challenge } = await supabase
  .from('versus_challenges').select('*').eq('id', challengeId).single();
if (challenge) {
  const existing = JSON.parse(localStorage.getItem('versus-active-challenges') || '[]');
  if (!existing.some((c: any) => c.id === challengeId)) {
    const entry = {
      id: challengeId, status: challenge.status,
      createdAt: new Date(challenge.created_at).getTime(),
      creatorId: challenge.creator_id,
      opponentName: challenge.host_name || 'Host',
      isOpponent: true,
    };
    localStorage.setItem('versus-active-challenges', JSON.stringify([entry, ...existing]));
  }
}

router.push(`/games/pack-empire/offense/versus/draft?challenge=${challengeId}`);
```

};

const dismissInvite = async (notifId: string) => {
await supabase.from(‘notifications’).update({ read: true }).eq(‘id’, notifId);
setPendingInvites(p => p.filter(n => n.id !== notifId));
};

const copyInviteLink = () => {
if (!challengeId || !origin) return;
navigator.clipboard.writeText(`${origin}/games/pack-empire/offense/versus/draft?challenge=${challengeId}`);
setCopied(true);
setTimeout(() => setCopied(false), 2000);
};

const deleteChallenge = (id: string) => {
if (!confirm(‘Delete this challenge?’)) return;
const updated = activeChallenges.filter(c => c.id !== id);
localStorage.setItem(‘versus-active-challenges’, JSON.stringify(updated));
setActiveChallenges(updated);
};

const formatTime = (ts: number) =>
new Date(ts).toLocaleTimeString([], { hour: ‘numeric’, minute: ‘2-digit’ });

const isWaiting = (ch: any) => ch.opponentName === ‘Waiting for opponent…’;

/* ════════════════ RENDER ════════════════ */
return (
<div className="vs-root">
<style dangerouslySetInnerHTML={{ __html: VERSUS_STYLES }} />

```
  {/* ── Masthead / Nav ── */}
  <nav className="vs-nav">
    <div className="vs-nav-l">
      <button onClick={() => window.history.back()} className="vs-back">← Back</button>
    </div>
    <div className="vs-nav-c">
      <span className="vs-pip" />
      <span className="vs-nav-title">
        Versus <span className="vs-nav-italic">Challenge.</span>
      </span>
    </div>
    <div className="vs-nav-r">
      {userInit
        ? <Link href="/profile" className="vs-nb">{userInit}</Link>
        : <Link href="/login" className="vs-si">Sign In</Link>}
    </div>
  </nav>

  <div className="vs-container">

    {/* ── Sign in ── */}
    {phase === 'sign-in' && (
      <div className="vs-card">
        <div className="vs-card-icon">⚔️</div>
        <div className="vs-card-kicker">§ Sign in required</div>
        <h1 className="vs-card-title">
          Versus <span className="vs-italic">challenge.</span>
        </h1>
        <p className="vs-card-desc">
          Sign in to challenge friends head-to-head in a best-of-lineup showdown.
        </p>
        <Link href="/login?redirect=/games/pack-empire/offense/versus" className="vs-btn primary full">
          <span>Sign in</span>
          <span>→</span>
        </Link>
      </div>
    )}

    {/* ── Lobby ── */}
    {phase === 'lobby' && (
      <div className="vs-lobby">

        {/* Hero header */}
        <header className="vs-hero">
          <div className="vs-hero-kicker">§ Lobby · Pack Empire Versus</div>
          <h1 className="vs-hero-title">
            Ready for<br />
            <span className="vs-italic">battle.</span>
          </h1>
          <p className="vs-hero-sub">
            Create a challenge, invite a friend, or accept an incoming match.
          </p>
        </header>

        {/* Pending invites */}
        {pendingInvites.length > 0 && (
          <section className="vs-section">
            <div className="vs-section-header">
              <span className="vs-section-num">§ 01 · Incoming</span>
              <span className="vs-section-title">
                Pending <span className="vs-italic">challenges</span>
                <span className="vs-count">({pendingInvites.length})</span>
              </span>
            </div>
            <div className="vs-invites-list">
              {pendingInvites.map(notif => (
                <div key={notif.id} className="vs-invite-row">
                  <div className="vs-invite-icon">⚔</div>
                  <div className="vs-invite-info">
                    <div className="vs-invite-from">
                      <strong>@{notif.from_username}</strong> challenged you
                    </div>
                    <div className="vs-invite-time">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      {' · '}
                      {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="vs-invite-actions">
                    <button onClick={() => acceptInvite(notif)} className="vs-btn primary small">
                      Accept →
                    </button>
                    <button onClick={() => dismissInvite(notif.id)} className="vs-invite-dismiss" aria-label="Dismiss">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* New challenge section */}
        <section className="vs-section">
          <div className="vs-section-header">
            <span className="vs-section-num">§ {pendingInvites.length > 0 ? '02' : '01'} · New match</span>
            <span className="vs-section-title">
              Start a <span className="vs-italic">challenge</span>
            </span>
          </div>

          <div className="vs-actions-grid">
            <button onClick={createNewChallenge} className="vs-btn primary full">
              <span>Create challenge · invite link</span>
              <span>→</span>
            </button>
            {friends.length > 0 && (
              <button onClick={() => setShowFriendPicker(s => !s)} className="vs-btn secondary full">
                <span>⚡ Challenge a friend</span>
                <span>{showFriendPicker ? '↑' : '↓'}</span>
              </button>
            )}
          </div>

          {/* Friend picker */}
          {showFriendPicker && friends.length > 0 && (
            <div className="vs-friend-picker">
              <div className="vs-fp-label">Choose a friend</div>
              <div className="vs-fp-list">
                {friends.map(f => (
                  <div key={f.id} className="vs-fp-row">
                    <div className="vs-fp-avatar">
                      {(f.full_name || f.username || '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="vs-fp-info">
                      <div className="vs-fp-name">{f.full_name || f.username}</div>
                      <div className="vs-fp-un">@{f.username}</div>
                    </div>
                    <button onClick={() => challengeFriend(f.id, f.username)} className="vs-fp-btn">
                      Challenge →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Active challenges */}
        {activeChallenges.length > 0 && (
          <section className="vs-section">
            <div className="vs-section-header">
              <span className="vs-section-num">§ {pendingInvites.length > 0 ? '03' : '02'} · In progress</span>
              <span className="vs-section-title">
                Active <span className="vs-italic">challenges</span>
                <span className="vs-count">({activeChallenges.length})</span>
              </span>
            </div>
            <div className="vs-challenges-list">
              {activeChallenges.map((ch, i) => {
                const roleKey = ch.creatorId === user?.id ? 'host' : 'opponent';
                const isDone = typeof window !== 'undefined' && localStorage.getItem(`versus-result-${ch.id}-${roleKey}`);
                return (
                  <div key={ch.id} className="vs-challenge-row">
                    <div className="vs-ch-num">{String(i + 1).padStart(2, '0')}</div>
                    <div className="vs-ch-info">
                      <div className="vs-ch-opponent">
                        {isWaiting(ch) ? (
                          <span className="vs-ch-waiting">
                            <span className="vs-ch-wait-dot" />
                            Waiting for opponent
                          </span>
                        ) : (
                          <span className="vs-ch-name">
                            vs <span className="vs-italic">{ch.opponentName}</span>
                          </span>
                        )}
                      </div>
                      <div className="vs-ch-meta">
                        {new Date(ch.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        {' · '}
                        {formatTime(ch.createdAt)}
                        {isDone && <span className="vs-ch-status"> · DRAFT LOCKED</span>}
                      </div>
                    </div>
                    <div className="vs-ch-actions">
                      <button
                        onClick={() => {
                          router.push(isDone
                            ? `/games/pack-empire/offense/versus/results?challenge=${ch.id}`
                            : `/games/pack-empire/offense/versus/draft?challenge=${ch.id}`
                          );
                        }}
                        className="vs-btn secondary small"
                      >
                        {isDone ? 'View results' : 'Continue →'}
                      </button>
                      <button onClick={() => deleteChallenge(ch.id)} className="vs-ch-delete" aria-label="Delete">✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>
    )}

    {/* ── Invite created ── */}
    {phase === 'invite' && challengeId && (
      <div className="vs-card">
        <div className="vs-card-icon">🔗</div>
        <div className="vs-card-kicker">§ Challenge created</div>
        <h2 className="vs-card-title">
          Share your <span className="vs-italic">link.</span>
        </h2>
        <p className="vs-card-desc">
          Send this link to a friend, or go start your draft.
        </p>

        <div className="vs-invite-box">
          <div className="vs-invite-box-label">Invite link</div>
          <div className="vs-invite-url">
            {origin}/games/pack-empire/offense/versus/draft?challenge={challengeId}
          </div>
        </div>

        <div className="vs-actions-grid">
          <button onClick={copyInviteLink} className="vs-btn primary full">
            <span>{copied ? '✓ Copied!' : '↗ Copy invite link'}</span>
            {!copied && <span>→</span>}
          </button>
          <button
            onClick={() => router.push(`/games/pack-empire/offense/versus/draft?challenge=${challengeId}`)}
            className="vs-btn secondary full"
          >
            <span>Start my draft</span>
            <span>→</span>
          </button>
        </div>
        <button onClick={() => { setPhase('lobby'); loadActiveChallenges(user); }} className="vs-cancel">
          ← Back to lobby
        </button>
      </div>
    )}

    {/* ── Loading ── */}
    {phase === 'loading' && (
      <div className="vs-loading">
        <div className="vs-loading-text">Loading —</div>
      </div>
    )}

  </div>
</div>
```

);
}

/* ══════════════════════════════════════════════════════════════════════
STYLES
══════════════════════════════════════════════════════════════════════ */
const VERSUS_STYLES = `
@import url(‘https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap’);
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
–vs-bg:#141311;
–vs-bg-soft:#1c1b18;
–vs-bg-card:#201e1a;
–vs-ink:#f4ebd8;
–vs-ink-soft:#bfb5a0;
–vs-ink-mute:#7d7463;
–vs-amber:#e8a84b;
–vs-line:#3a3630;
–vs-line-soft:#2a2620;
–vs-rust:#c04820;
/* Versus signature: emerald */
–vs-green:#68a878;
–vs-green-bright:#88c898;
–vs-green-deep:#4a7854;
–vs-green-glow:rgba(104,168,120,.4);
}

.vs-root{
min-height:100vh;
background:var(–vs-bg);color:var(–vs-ink);
font-family:‘Space Grotesk’,sans-serif;
background-image:
radial-gradient(ellipse at 50% -10%,rgba(104,168,120,.06),transparent 55%),
radial-gradient(ellipse at 15% 80%,rgba(74,120,84,.03),transparent 50%),
repeating-linear-gradient(0deg,transparent,transparent 70px,rgba(104,168,120,.012) 70px,rgba(104,168,120,.012) 71px);
}

.vs-italic{font-style:italic;color:var(–vs-green)}

/* ═══ MASTHEAD ═══ */
.vs-nav{
display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:1rem;
padding:1.2rem 2rem;
background:rgba(20,19,17,.92);
backdrop-filter:blur(12px);
border-bottom:1px solid var(–vs-line);
position:sticky;top:0;z-index:30;
}
.vs-nav-l{justify-self:start}
.vs-nav-c{display:flex;align-items:center;gap:.65rem;justify-self:center}
.vs-nav-r{justify-self:end}

.vs-back{
background:none;border:none;
color:var(–vs-green);text-decoration:none;cursor:pointer;
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;
padding:0;transition:color .2s;
}
.vs-back:hover{color:var(–vs-green-bright)}

.vs-nav-title{
font-family:‘DM Serif Display’,serif;
font-size:1.35rem;letter-spacing:-.01em;color:var(–vs-ink);
}
.vs-nav-italic{font-style:italic;color:var(–vs-green)}

.vs-pip{
width:9px;height:9px;border-radius:50%;
background:var(–vs-green);flex-shrink:0;
box-shadow:0 0 0 3px rgba(104,168,120,.15),0 0 12px var(–vs-green);
animation:vs-pip 2s ease-in-out infinite;
}
@keyframes vs-pip{
0%,100%{box-shadow:0 0 0 3px rgba(104,168,120,.15),0 0 12px var(–vs-green)}
50%{box-shadow:0 0 0 6px rgba(104,168,120,.05),0 0 22px var(–vs-green-bright)}
}

.vs-nb{
width:32px;height:32px;border-radius:2px;
background:var(–vs-bg-card);border:1px solid var(–vs-green);
color:var(–vs-green);
font-family:‘Space Grotesk’,sans-serif;font-weight:700;font-size:.85rem;
display:flex;align-items:center;justify-content:center;text-decoration:none;
transition:all .2s;
}
.vs-nb:hover{background:var(–vs-green);color:var(–vs-bg)}
.vs-si{
font-family:‘JetBrains Mono’,monospace;font-size:.68rem;font-weight:700;
letter-spacing:.2em;text-transform:uppercase;
color:var(–vs-green);text-decoration:none;
border:1px solid var(–vs-green);
padding:.4rem .8rem;border-radius:2px;transition:all .2s;
}
.vs-si:hover{background:rgba(104,168,120,.08);color:var(–vs-green-bright)}

/* ═══ CONTAINER ═══ */
.vs-container{max-width:720px;margin:0 auto;padding:2.5rem 1.5rem 4rem}

/* ═══ STANDALONE CARDS (sign-in, invite, loading) ═══ */
.vs-card{
background:var(–vs-bg-card);border:1px solid var(–vs-line);
padding:2.5rem 2rem;text-align:center;
position:relative;
}
.vs-card::before{
content:’’;position:absolute;top:0;left:0;width:3px;height:100%;background:var(–vs-green);
}
.vs-card-icon{font-size:2.8rem;margin-bottom:1rem}
.vs-card-kicker{
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.62rem;letter-spacing:.28em;text-transform:uppercase;
color:var(–vs-green);margin-bottom:.6rem;
}
.vs-card-title{
font-family:‘DM Serif Display’,serif;
font-size:clamp(1.8rem,4vw,2.4rem);line-height:1;letter-spacing:-.02em;
color:var(–vs-ink);margin-bottom:.8rem;
}
.vs-card-desc{
font-family:‘Space Grotesk’,sans-serif;
color:var(–vs-ink-soft);font-size:.95rem;line-height:1.55;
max-width:420px;margin:0 auto 1.75rem;
}

.vs-loading{
padding:4rem 1rem;text-align:center;
}
.vs-loading-text{
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.72rem;letter-spacing:.28em;text-transform:uppercase;
color:var(–vs-ink-mute);
}

/* ═══ LOBBY HERO ═══ */
.vs-lobby{display:flex;flex-direction:column;gap:2.5rem}

.vs-hero{text-align:center;padding:1.5rem 0 .5rem}
.vs-hero-kicker{
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.62rem;letter-spacing:.32em;text-transform:uppercase;
color:var(–vs-green);margin-bottom:1rem;
}
.vs-hero-title{
font-family:‘DM Serif Display’,serif;
font-size:clamp(2.4rem,7vw,4.2rem);line-height:.95;letter-spacing:-.025em;
color:var(–vs-ink);margin-bottom:1rem;
}
.vs-hero-sub{
font-family:‘DM Serif Display’,serif;font-style:italic;
font-size:1.05rem;color:var(–vs-ink-soft);
max-width:420px;margin:0 auto;line-height:1.5;
}

/* ═══ SECTIONS ═══ */
.vs-section{
background:var(–vs-bg-card);border:1px solid var(–vs-line);
padding:1.75rem 1.75rem 1.5rem;
}

.vs-section-header{
display:flex;justify-content:space-between;align-items:baseline;gap:.75rem;flex-wrap:wrap;
padding-bottom:1rem;margin-bottom:1.25rem;
border-bottom:3px double var(–vs-line);
}
.vs-section-num{
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.62rem;letter-spacing:.22em;text-transform:uppercase;
color:var(–vs-green);
}
.vs-section-title{
font-family:‘DM Serif Display’,serif;
font-size:1.25rem;letter-spacing:-.01em;
color:var(–vs-ink);display:flex;align-items:baseline;gap:.5rem;
}
.vs-count{
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.7rem;letter-spacing:.1em;
color:var(–vs-ink-mute);
}

/* ═══ PENDING INVITES ═══ */
.vs-invites-list{display:flex;flex-direction:column;gap:.2rem}
.vs-invite-row{
display:grid;grid-template-columns:auto 1fr auto;gap:1rem;align-items:center;
padding:.9rem 0;
border-bottom:1px solid var(–vs-line-soft);
}
.vs-invite-row:last-child{border-bottom:none}
.vs-invite-icon{
font-size:1.3rem;color:var(–vs-green);
width:36px;height:36px;
display:flex;align-items:center;justify-content:center;
background:rgba(104,168,120,.08);
border:1px solid rgba(104,168,120,.25);
border-radius:2px;flex-shrink:0;
}
.vs-invite-info{min-width:0}
.vs-invite-from{
font-family:‘DM Serif Display’,serif;
font-size:1.02rem;line-height:1.2;letter-spacing:-.005em;
color:var(–vs-ink);
overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.vs-invite-from strong{
font-weight:400;color:var(–vs-green);font-style:italic;
}
.vs-invite-time{
font-family:‘JetBrains Mono’,monospace;
font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;
color:var(–vs-ink-mute);margin-top:3px;
}
.vs-invite-actions{display:flex;align-items:center;gap:.4rem;flex-shrink:0}
.vs-invite-dismiss{
background:none;border:1px solid var(–vs-line);
color:var(–vs-ink-mute);cursor:pointer;
width:32px;height:32px;border-radius:2px;
font-size:.8rem;transition:all .2s;
}
.vs-invite-dismiss:hover{
border-color:var(–vs-rust);color:var(–vs-rust);
}

/* ═══ ACTIONS ═══ */
.vs-actions-grid{display:flex;flex-direction:column;gap:.55rem}

.vs-btn{
display:flex;align-items:center;justify-content:center;gap:.6rem;
padding:1rem 1.4rem;
font-family:‘Space Grotesk’,sans-serif;font-weight:700;
font-size:.85rem;letter-spacing:.16em;text-transform:uppercase;
border-radius:2px;cursor:pointer;text-decoration:none;
border:none;
transition:all .25s cubic-bezier(.2,.8,.2,1);
}
.vs-btn.full{width:100%}
.vs-btn.small{
padding:.55rem .95rem;font-size:.7rem;letter-spacing:.14em;gap:.35rem;
}

.vs-btn.primary{
background:var(–vs-green);color:var(–vs-bg);
box-shadow:0 8px 20px rgba(104,168,120,.15);
}
.vs-btn.primary:hover{
background:var(–vs-green-bright);
transform:translateY(-2px);
box-shadow:0 14px 30px rgba(104,168,120,.3);
}

.vs-btn.secondary{
background:transparent;color:var(–vs-green);
border:1px solid var(–vs-green);
}
.vs-btn.secondary:hover{
background:rgba(104,168,120,.08);
color:var(–vs-green-bright);border-color:var(–vs-green-bright);
}

.vs-cancel{
display:block;margin:1.25rem auto 0;
background:none;border:none;
color:var(–vs-ink-mute);cursor:pointer;
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;
transition:color .2s;
}
.vs-cancel:hover{color:var(–vs-green)}

/* ═══ FRIEND PICKER ═══ */
.vs-friend-picker{
margin-top:1rem;
background:var(–vs-bg);border:1px solid var(–vs-line);
padding:1.25rem 1.4rem;
}
.vs-fp-label{
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.6rem;letter-spacing:.24em;text-transform:uppercase;
color:var(–vs-ink-mute);margin-bottom:.85rem;
padding-bottom:.65rem;border-bottom:1px solid var(–vs-line);
}
.vs-fp-list{display:flex;flex-direction:column;gap:.2rem}
.vs-fp-row{
display:grid;grid-template-columns:auto 1fr auto;gap:.75rem;align-items:center;
padding:.65rem 0;
border-bottom:1px solid var(–vs-line-soft);
}
.vs-fp-row:last-child{border-bottom:none}
.vs-fp-avatar{
width:36px;height:36px;
background:var(–vs-bg-card);
border:1px solid var(–vs-line);
border-left:2px solid var(–vs-green);
display:flex;align-items:center;justify-content:center;
font-family:‘DM Serif Display’,serif;
font-size:.88rem;color:var(–vs-green);
flex-shrink:0;
}
.vs-fp-info{min-width:0}
.vs-fp-name{
font-family:‘DM Serif Display’,serif;
font-size:.95rem;line-height:1.1;letter-spacing:-.005em;
color:var(–vs-ink);
white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.vs-fp-un{
font-family:‘JetBrains Mono’,monospace;
font-size:.62rem;letter-spacing:.08em;color:var(–vs-ink-mute);
margin-top:2px;
}
.vs-fp-btn{
background:transparent;color:var(–vs-green);
border:1px solid var(–vs-green);
padding:.45rem .75rem;
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.65rem;letter-spacing:.14em;text-transform:uppercase;
border-radius:2px;cursor:pointer;transition:all .2s;flex-shrink:0;
}
.vs-fp-btn:hover{
background:var(–vs-green);color:var(–vs-bg);border-color:var(–vs-green);
}

/* ═══ ACTIVE CHALLENGES ═══ */
.vs-challenges-list{display:flex;flex-direction:column;gap:.2rem}
.vs-challenge-row{
display:grid;grid-template-columns:auto 1fr auto;gap:1rem;align-items:center;
padding:.85rem 0;
border-bottom:1px solid var(–vs-line-soft);
transition:padding-left .2s;
}
.vs-challenge-row:last-child{border-bottom:none}
.vs-challenge-row:hover{padding-left:.35rem}
.vs-ch-num{
font-family:‘DM Serif Display’,serif;font-style:italic;
font-size:1.3rem;letter-spacing:-.02em;
color:var(–vs-green);
min-width:2rem;
}
.vs-ch-info{min-width:0}
.vs-ch-opponent{margin-bottom:3px}
.vs-ch-name{
font-family:‘DM Serif Display’,serif;
font-size:1.02rem;line-height:1.15;letter-spacing:-.005em;
color:var(–vs-ink);
overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.vs-ch-waiting{
display:inline-flex;align-items:center;gap:.5rem;
font-family:‘DM Serif Display’,serif;font-style:italic;
font-size:.95rem;color:var(–vs-ink-mute);
}
.vs-ch-wait-dot{
width:7px;height:7px;border-radius:50%;
background:var(–vs-green);
box-shadow:0 0 8px var(–vs-green-glow);
animation:vs-wait-pulse 1.4s ease-in-out infinite;flex-shrink:0;
}
@keyframes vs-wait-pulse{
0%,100%{opacity:.4;transform:scale(.8)}
50%{opacity:1;transform:scale(1.2)}
}
.vs-ch-meta{
font-family:‘JetBrains Mono’,monospace;
font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;
color:var(–vs-ink-mute);
}
.vs-ch-status{color:var(–vs-green);font-weight:700}

.vs-ch-actions{display:flex;align-items:center;gap:.4rem;flex-shrink:0}
.vs-ch-delete{
background:none;border:1px solid transparent;
color:var(–vs-ink-mute);cursor:pointer;
width:30px;height:30px;border-radius:2px;
font-size:.78rem;transition:all .2s;
}
.vs-ch-delete:hover{
border-color:var(–vs-rust);color:var(–vs-rust);
background:rgba(192,72,32,.05);
}

/* ═══ INVITE BOX ═══ */
.vs-invite-box{
background:var(–vs-bg);border:1px solid var(–vs-line);
padding:1.1rem 1.3rem;margin:1.25rem 0;text-align:left;
position:relative;
}
.vs-invite-box::before{
content:’’;position:absolute;top:0;left:0;width:2px;height:100%;
background:var(–vs-green);
}
.vs-invite-box-label{
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.58rem;letter-spacing:.28em;text-transform:uppercase;
color:var(–vs-ink-mute);margin-bottom:.5rem;
}
.vs-invite-url{
font-family:‘JetBrains Mono’,monospace;font-weight:500;
font-size:.75rem;letter-spacing:.02em;line-height:1.55;
color:var(–vs-green);
word-break:break-all;
}

/* ═══ RESPONSIVE ═══ */
@media(max-width:680px){
.vs-nav{padding:1rem 1.25rem;gap:.75rem}
.vs-nav-title{font-size:1.1rem}
.vs-container{padding:1.75rem 1rem 3rem}
.vs-section{padding:1.4rem 1.2rem 1.25rem}
.vs-card{padding:2rem 1.4rem}
.vs-hero{padding:.5rem 0}
.vs-section-header{flex-direction:column;align-items:flex-start;gap:.4rem}
.vs-invite-row,.vs-challenge-row,.vs-fp-row{
grid-template-columns:auto 1fr;gap:.7rem;
}
.vs-invite-actions,.vs-ch-actions{
grid-column:1 / -1;justify-content:flex-end;margin-top:.4rem;
}
.vs-fp-btn{grid-column:1 / -1;margin-top:.3rem;width:100%;justify-self:stretch}
.vs-fp-row{grid-template-columns:auto 1fr;gap:.7rem}
}
@media(max-width:420px){
.vs-nav-title{font-size:1rem}
.vs-back{font-size:.65rem}
.vs-si{font-size:.62rem;padding:.3rem .6rem}
.vs-hero-title{font-size:2.2rem}
.vs-btn{font-size:.78rem;letter-spacing:.12em;padding:.95rem 1.1rem}
}
`;
