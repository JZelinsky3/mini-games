'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function VersusChallenge() {
  const [phase, setPhase] = useState<'loading' | 'sign-in' | 'lobby' | 'invite'>('loading');
  const [user, setUser] = useState<any>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [activeChallenges, setActiveChallenges] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { setOrigin(window.location.origin); }, []);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) { setPhase('sign-in'); }
      else { setPhase('lobby'); loadActiveChallenges(); }
    }
    init();
  }, [supabase]);

  // Poll localStorage every 5s to pick up opponent name updates
  useEffect(() => {
    if (phase !== 'lobby') return;
    const interval = setInterval(() => loadActiveChallenges(), 5000);
    return () => clearInterval(interval);
  }, [phase]);

  const loadActiveChallenges = async () => {
  try {
    const active = JSON.parse(localStorage.getItem('versus-active-challenges') || '[]');

    // For each challenge, fetch latest from Supabase to get real opponent name
    const enriched = await Promise.all(active.map(async (ch: any) => {
      try {
        const { data } = await supabase
          .from('versus_challenges')
          .select('opponent_name, host_name, status, opponent_result, host_result')
          .eq('id', ch.id)
          .single();

        if (!data) return ch;

        const isOpponent = ch.isOpponent;
        const opponentName = isOpponent
          ? (data.host_name || 'Host')
          : (data.opponent_name || 'Waiting for opponent...');

        return { ...ch, opponentName };
      } catch {
        return ch;
      }
    }));

    setActiveChallenges(enriched);
  } catch { }
};

  const createNewChallenge = async () => {
  const newId = 'vs-' + Date.now().toString(36).slice(0, 9);
  setChallengeId(newId);
  setPhase('invite');

  // Save to Supabase so opponent can find it
  await supabase.from('versus_challenges').insert({
    id: newId,
    creator_id: user?.id ?? null,
    host_name: user?.user_metadata?.full_name || user?.email || 'Host',
    status: 'waiting',
  });

  // Also save locally for lobby tracking
  const newChallenge = {
    id: newId,
    status: 'waiting',
    createdAt: Date.now(),
    creatorId: user?.id,
    opponentName: 'Waiting for opponent...',
  };
  const current = JSON.parse(localStorage.getItem('versus-active-challenges') || '[]');
  localStorage.setItem('versus-active-challenges', JSON.stringify([newChallenge, ...current]));
};

  const copyInviteLink = () => {
    if (!challengeId || !origin) return;
    const link = `${origin}/games/pack-empire/offense/versus/draft?challenge=${challengeId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteChallenge = (id: string) => {
    if (!confirm('Delete this challenge?')) return;
    const updated = activeChallenges.filter(c => c.id !== id);
    localStorage.setItem('versus-active-challenges', JSON.stringify(updated));
    setActiveChallenges(updated);
  };

  // Format timestamp as time (e.g. 3:42 PM)
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const isWaiting = (ch: any) => ch.opponentName === 'Waiting for opponent...';

  return (
    <div className="pe-versus-root">
      <style dangerouslySetInnerHTML={{ __html: VERSUS_STYLES }} />

      <nav className="pe-vs-nav">
        <Link href="/games/pack-empire" className="pe-vs-back">← Hub</Link>
        <div className="pe-vs-nav-title">VERSUS CHALLENGE</div>
        <Link href="/games/pack-empire/leaderboard" className="pe-vs-nav-lb">🏆 Leaderboard</Link>
      </nav>

      <div className="pe-versus-container">

        {/* ── Sign in ── */}
        {phase === 'sign-in' && (
          <div className="pe-versus-card">
            <div className="pe-versus-icon">⚔️</div>
            <h1 className="pe-versus-h1">Versus Challenge</h1>
            <p className="pe-versus-desc">Sign in to challenge friends head-to-head.</p>
            <Link href="/login?redirect=/games/pack-empire/offense/versus" className="pe-versus-btn primary">
              Sign In
            </Link>
          </div>
        )}

        {/* ── Lobby ── */}
        {phase === 'lobby' && (
          <div className="pe-versus-card">
            <div className="pe-versus-icon">🏟️</div>
            <h1 className="pe-versus-h1">Ready for Battle?</h1>

            <button onClick={createNewChallenge} className="pe-versus-btn primary" style={{ marginBottom: '2rem', width: '100%' }}>
              + Create New Challenge
            </button>

            {activeChallenges.length > 0 && (
              <div>
                <div className="pe-versus-section-title">Active Challenges</div>
                {activeChallenges.map(ch => (
                  <div key={ch.id} className="pe-challenge-row">
                    <div className="pe-ch-info">
                      <div className="pe-ch-opponent">
                        {isWaiting(ch) ? (
                          <span className="pe-ch-waiting">
                            <span className="pe-ch-wait-dot" />
                            Waiting for opponent...
                          </span>
                        ) : (
                          <span className="pe-ch-name">vs {ch.opponentName}</span>
                        )}
                      </div>
                      <div className="pe-ch-meta">
                        {new Date(ch.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        {' · '}
                        {formatTime(ch.createdAt)}
                      </div>
                    </div>
                    <div className="pe-ch-actions">
                      <button
                        onClick={() => {
                          const roleKey = ch.creatorId === user?.id ? 'host' : 'opponent';
                          const alreadyDone = localStorage.getItem(`versus-result-${ch.id}-${roleKey}`);
                          if (alreadyDone) {
                            router.push(`/games/pack-empire/offense/versus/results?challenge=${ch.id}`);
                          } else {
                            router.push(`/games/pack-empire/offense/versus/draft?challenge=${ch.id}`);
                          }
                        }}
                        className="pe-versus-btn secondary small"
                      >
                        {(() => {
                          const roleKey = ch.creatorId === user?.id ? 'host' : 'opponent';
                          const alreadyDone = localStorage.getItem(`versus-result-${ch.id}-${roleKey}`);
                          return alreadyDone ? 'View Results' : 'Continue Draft';
                        })()}
                      </button>
                      <button onClick={() => deleteChallenge(ch.id)} className="pe-ch-delete">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Invite ── */}
        {phase === 'invite' && challengeId && (
          <div className="pe-versus-card">
            <div className="pe-versus-icon">🔗</div>
            <h2 className="pe-versus-h1">Challenge Created!</h2>
            <p className="pe-versus-desc">Share this link with a friend to start the battle.</p>

            <div className="pe-invite-box">
              <div className="pe-invite-label">INVITE LINK</div>
              <div className="pe-invite-url">
                {origin}/games/pack-empire/offense/versus/draft?challenge={challengeId}
              </div>
            </div>

            <button onClick={copyInviteLink} className="pe-versus-btn primary" style={{ width: '100%', marginBottom: '.75rem' }}>
              {copied ? '✓ Copied!' : '↗ Copy Invite Link'}
            </button>

            <button
              onClick={() => router.push(`/games/pack-empire/offense/versus/draft?challenge=${challengeId}`)}
              className="pe-versus-btn secondary"
              style={{ width: '100%', marginBottom: '1.5rem' }}
            >
              Start My Draft →
            </button>

            <button onClick={() => { setPhase('lobby'); loadActiveChallenges(); }} className="pe-vs-cancel">
              ← Back to Lobby
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

const VERSUS_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Barlow+Condensed:wght@400;500;600;700;800&family=Barlow:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.pe-versus-root{min-height:100vh;background:#050a18;color:#d4e8f8;font-family:'Barlow Condensed',sans-serif;
  background-image:radial-gradient(ellipse at 50% 0%,rgba(255,215,0,.04),transparent 50%)}

/* ── Nav ── */
.pe-vs-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:1.3rem 1.2rem;
  border-bottom:2px solid #0d1835;position:sticky;top:0;background:#050a18;z-index:30}
.pe-vs-back{color:#ffd700;text-decoration:none;font-family:'Barlow Condensed',sans-serif;font-size:1rem;
  font-weight:700;letter-spacing:.06em;transition:.15s;justify-self:start}
.pe-vs-back:hover{color:#d4e8f8}


.pe-vs-nav-title{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1.3rem;letter-spacing:.2em;
  color:#ffd700;justify-self:center;text-shadow:0 0 20px rgba(255,215,0,.5)}
.pe-vs-nav-lb{color:#ffd700;text-decoration:none;font-family:'Barlow Condensed',sans-serif;font-size:1rem;
  font-weight:600;letter-spacing:.06em;transition:.15s;justify-self:end}
.pe-vs-nav-lb:hover{color:#d4e8f8}

/* ── Container & card ── */
.pe-versus-container{max-width:580px;margin:2.5rem auto;padding:0 1.2rem}
.pe-versus-card{background:#07101e;border:2px solid #1a3050;border-radius:16px;padding:2.2rem 1.8rem;text-align:center}
.pe-versus-icon{font-size:3.5rem;margin-bottom:1rem}
.pe-versus-h1{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:.06em;color:#d4e8f8;margin-bottom:.6rem}
.pe-versus-desc{color:#3a6080;line-height:1.6;font-size:.95rem;margin-bottom:1.5rem;font-family:'Barlow',sans-serif}

/* ── Buttons ── */
.pe-versus-btn{display:inline-block;padding:14px 24px;font-family:'Barlow Condensed',sans-serif;font-weight:800;
  font-size:.95rem;letter-spacing:.1em;border-radius:10px;cursor:pointer;transition:all .2s;border:none;text-decoration:none;text-align:center}
.pe-versus-btn.primary{background:linear-gradient(135deg,#a07020,#ffd700);color:#050a18}
.pe-versus-btn.primary:hover{filter:brightness(1.1);transform:scale(1.02)}
.pe-versus-btn.secondary{background:transparent;border:2px solid #1a3050;color:#3a6080}
.pe-versus-btn.secondary:hover{border-color:#ffd700;color:#ffd700}
.pe-versus-btn.small{padding:9px 16px;font-size:.8rem}
.pe-vs-cancel{background:none;border:none;color:#1a3050;font-family:'Barlow Condensed',sans-serif;
  font-size:.8rem;letter-spacing:.12em;cursor:pointer;transition:.15s}
.pe-vs-cancel:hover{color:#3a6080}

/* ── Section title ── */
.pe-versus-section-title{font-family:'Orbitron',sans-serif;font-size:.72rem;color:#ffd700;text-align:left;
  margin:0 0 .8rem;letter-spacing:.14em;font-weight:700}

/* ── Challenge rows ── */
.pe-challenge-row{background:rgba(4,8,16,.7);border:1px solid #0d1835;border-radius:10px;padding:.85rem 1rem;
  margin-bottom:.6rem;display:flex;justify-content:space-between;align-items:center;gap:1rem;
  transition:border-color .2s}
.pe-challenge-row:hover{border-color:#1a3050}
.pe-ch-info{text-align:left;flex:1;min-width:0}
.pe-ch-opponent{margin-bottom:.2rem}
.pe-ch-name{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.95rem;color:#d4e8f8;letter-spacing:.04em}
.pe-ch-waiting{display:flex;align-items:center;gap:.5rem;font-size:.85rem;color:#2a4060;font-style:italic}
.pe-ch-wait-dot{width:6px;height:6px;border-radius:50%;background:#28dc78;flex-shrink:0;
  animation:wait-pulse 1.4s ease-in-out infinite}
@keyframes wait-pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
.pe-ch-meta{font-size:.65rem;color:#1a3050;letter-spacing:.08em;font-family:'Barlow Condensed',sans-serif}
.pe-ch-actions{display:flex;align-items:center;gap:.6rem;flex-shrink:0}
.pe-ch-delete{background:none;border:none;color:#1a3050;cursor:pointer;font-size:.85rem;padding:.2rem .3rem;
  transition:.15s;border-radius:4px}
.pe-ch-delete:hover{color:#e04040;background:rgba(224,64,64,.1)}

/* ── Invite box ── */
.pe-invite-box{background:rgba(4,8,16,.8);border:1px solid #0d1835;border-radius:10px;padding:1rem 1.2rem;
  margin:1.2rem 0;text-align:left}
.pe-invite-label{font-size:.52rem;letter-spacing:.28em;color:#2a4060;margin-bottom:.5rem;
  font-family:'Barlow Condensed',sans-serif;font-weight:700}
.pe-invite-url{font-family:'Barlow Condensed',sans-serif;font-size:.75rem;color:#28dc78;
  word-break:break-all;line-height:1.5;letter-spacing:.02em}
`;