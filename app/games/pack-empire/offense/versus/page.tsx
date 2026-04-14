'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function VersusChallenge() {
  const [phase, setPhase] = useState<'loading' | 'sign-in' | 'lobby' | 'invite'>('loading');
  const [user, setUser]   = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [challengeId, setChallengeId]         = useState<string | null>(null);
  const [activeChallenges, setActiveChallenges] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites]     = useState<any[]>([]);
  const [friends, setFriends]                   = useState<any[]>([]);
  const [showFriendPicker, setShowFriendPicker] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [origin, setOrigin]   = useState('');

  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => { setOrigin(window.location.origin); }, []);

  /* ── Init ── */
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) { setPhase('sign-in'); return; }

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
      const active = JSON.parse(localStorage.getItem('versus-active-challenges') || '[]');
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
        } catch { return ch; }
      }));
      setActiveChallenges(enriched);
    } catch { }
  }, [supabase]);

  const loadPendingInvites = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'challenge_invite')
      .eq('read', false)
      .order('created_at', { ascending: false });
    setPendingInvites(data ?? []);
  }, [supabase]);

  const loadFriends = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('friends')
      .select('id, requester_id, addressee_id, status')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq('status', 'accepted');
    if (!data) return;

    const enriched = await Promise.all(data.map(async (f: any) => {
      const otherId = f.requester_id === userId ? f.addressee_id : f.requester_id;
      const { data: prof } = await supabase.from('profiles').select('username, full_name').eq('id', otherId).single();
      return { id: otherId, username: prof?.username ?? '', full_name: prof?.full_name ?? '' };
    }));
    setFriends(enriched);
  }, [supabase]);

  /* ── Create challenge (link-based) ── */
  const createNewChallenge = async () => {
    const newId = 'vs-' + Date.now().toString(36).slice(0, 9);
    setChallengeId(newId);
    setPhase('invite');

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
  };

  /* ── Challenge a friend directly ── */
  const challengeFriend = async (friendId: string, friendUsername: string) => {
    const newId = 'vs-' + Date.now().toString(36).slice(0, 9);

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
  };

  /* ── Accept a pending invite ── */
  const acceptInvite = async (notif: any) => {
    const challengeId = notif.data?.challenge_id;
    if (!challengeId) return;

    // Mark notification read
    await supabase.from('notifications').update({ read: true }).eq('id', notif.id);

    // Save to their lobby as opponent
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
  };

  const dismissInvite = async (notifId: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', notifId);
    setPendingInvites(p => p.filter(n => n.id !== notifId));
  };

  const copyInviteLink = () => {
    if (!challengeId || !origin) return;
    navigator.clipboard.writeText(`${origin}/games/pack-empire/offense/versus/draft?challenge=${challengeId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteChallenge = (id: string) => {
    if (!confirm('Delete this challenge?')) return;
    const updated = activeChallenges.filter(c => c.id !== id);
    localStorage.setItem('versus-active-challenges', JSON.stringify(updated));
    setActiveChallenges(updated);
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const isWaiting = (ch: any) => ch.opponentName === 'Waiting for opponent...';

  /* ════════════════ RENDER ════════════════ */
  return (
    <div className="pe-versus-root">
      <style dangerouslySetInnerHTML={{ __html: VERSUS_STYLES }} />

      <nav className="pe-vs-nav">
        <Link href="/games/pack-empire" className="pe-vs-back">← Hub</Link>
        <div className="pe-vs-nav-title"><span className="pe-vs-pip" />VERSUS CHALLENGE</div>
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
          <div>

            {/* Pending invites from friends */}
            {pendingInvites.length > 0 && (
              <div className="pe-invites-section">
                <div className="pe-invites-title">
                  <span className="pe-invites-dot" />
                  PENDING CHALLENGES ({pendingInvites.length})
                </div>
                {pendingInvites.map(notif => (
                  <div key={notif.id} className="pe-invite-notif">
                    <div className="pe-in-icon">⚔️</div>
                    <div className="pe-in-info">
                      <div className="pe-in-from">
                        <strong>@{notif.from_username}</strong> challenged you!
                      </div>
                      <div className="pe-in-time">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        {' · '}
                        {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="pe-in-actions">
                      <button onClick={() => acceptInvite(notif)} className="pe-in-accept">Accept →</button>
                      <button onClick={() => dismissInvite(notif.id)} className="pe-in-dismiss">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pe-versus-card">
              <div className="pe-versus-icon">🏟️</div>
              <h1 className="pe-versus-h1">Ready for Battle?</h1>

              {/* Create buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '2rem' }}>
                <button onClick={createNewChallenge} className="pe-versus-btn primary" style={{ width: '100%' }}>
                  + Create Challenge (Invite Link)
                </button>
                {friends.length > 0 && (
                  <button onClick={() => setShowFriendPicker(s => !s)} className="pe-versus-btn secondary" style={{ width: '100%' }}>
                    ⚡ Challenge a Friend
                  </button>
                )}
              </div>

              {/* Friend picker */}
              {showFriendPicker && friends.length > 0 && (
                <div className="pe-friend-picker">
                  <div className="pe-fp-title">Choose a friend to challenge</div>
                  {friends.map(f => (
                    <div key={f.id} className="pe-fp-row">
                      <div className="pe-fp-avatar">
                        {(f.full_name || f.username || '?').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="pe-fp-info">
                        <div className="pe-fp-name">{f.full_name || f.username}</div>
                        <div className="pe-fp-un">@{f.username}</div>
                      </div>
                      <button onClick={() => challengeFriend(f.id, f.username)} className="pe-fp-btn">
                        Challenge →
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Active challenges */}
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
                            const done = localStorage.getItem(`versus-result-${ch.id}-${roleKey}`);
                            router.push(done
                              ? `/games/pack-empire/offense/versus/results?challenge=${ch.id}`
                              : `/games/pack-empire/offense/versus/draft?challenge=${ch.id}`
                            );
                          }}
                          className="pe-versus-btn secondary small"
                        >
                          {(() => {
                            const roleKey = ch.creatorId === user?.id ? 'host' : 'opponent';
                            return localStorage.getItem(`versus-result-${ch.id}-${roleKey}`) ? 'View Results' : 'Continue Draft';
                          })()}
                        </button>
                        <button onClick={() => deleteChallenge(ch.id)} className="pe-ch-delete">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Invite created ── */}
        {phase === 'invite' && challengeId && (
          <div className="pe-versus-card">
            <div className="pe-versus-icon">🔗</div>
            <h2 className="pe-versus-h1">Challenge Created!</h2>
            <p className="pe-versus-desc">Share this link with a friend, or go start your draft.</p>

            <div className="pe-invite-box">
              <div className="pe-invite-label">INVITE LINK</div>
              <div className="pe-invite-url">
                {origin}/games/pack-empire/offense/versus/draft?challenge={challengeId}
              </div>
            </div>

            <button onClick={copyInviteLink} className="pe-versus-btn primary" style={{ width:'100%', marginBottom:'.75rem' }}>
              {copied ? '✓ Copied!' : '↗ Copy Invite Link'}
            </button>
            <button
              onClick={() => router.push(`/games/pack-empire/offense/versus/draft?challenge=${challengeId}`)}
              className="pe-versus-btn secondary"
              style={{ width:'100%', marginBottom:'1.5rem' }}
            >
              Start My Draft →
            </button>
            <button onClick={() => { setPhase('lobby'); loadActiveChallenges(user); }} className="pe-vs-cancel">
              ← Back to Lobby
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════════════ */
const VERSUS_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Barlow+Condensed:wght@400;500;600;700;800&family=Barlow:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.pe-versus-root{min-height:100vh;background:#050a18;color:#d4e8f8;font-family:'Barlow Condensed',sans-serif;
  background-image:radial-gradient(ellipse at 50% 0%,rgba(255,215,0,.04),transparent 50%)}

/* ── Nav ── */
.pe-vs-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:1.3rem 1.2rem;
  border-bottom:2px solid #0d1835;position:sticky;top:0;background:#050a18;z-index:30}
.pe-vs-back{color:#28dc78;text-decoration:none;font-family:'Barlow Condensed',sans-serif;font-size:1rem;
  font-weight:700;letter-spacing:.06em;transition:.15s;justify-self:start}
.pe-vs-back:hover{color:#d4e8f8}
.pe-vs-nav-title{display:flex;align-items:center;gap:.6rem;font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.3rem;letter-spacing:.22em;color:#28dc78;justify-self:center;text-shadow:0 0 24px rgba(40,220,120,.5)}
.pe-vs-pip{width:9px;height:9px;border-radius:50%;background:#28dc78;flex-shrink:0;box-shadow:0 0 12px #28dc78,0 0 28px rgba(40,220,120,.6);animation:pip-pulse 2s ease-in-out infinite}
@keyframes pip-pulse{0%,100%{box-shadow:0 0 12px #28dc78,0 0 28px rgba(40,220,120,.6)}50%{box-shadow:0 0 22px #28dc78,0 0 48px rgba(40,220,120,.8)}}
.pe-vs-nav-lb{color:#28dc78;text-decoration:none;font-family:'Barlow Condensed',sans-serif;font-size:1rem;
  font-weight:700;letter-spacing:.06em;transition:.15s;justify-self:end}
.pe-vs-nav-lb:hover{color:#d4e8f8}

/* ── Container & card ── */
.pe-versus-container{max-width:580px;margin:2rem auto;padding:0 1.2rem}
.pe-versus-card{background:#07101e;border:2px solid #1a3050;border-radius:16px;padding:2rem 1.8rem;text-align:center}
.pe-versus-icon{font-size:3.2rem;margin-bottom:.8rem}
.pe-versus-h1{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1.4rem;letter-spacing:.06em;color:#d4e8f8;margin-bottom:.5rem;}
.pe-versus-desc{color:#3a6080;line-height:1.6;font-size:.9rem;margin-bottom:1.4rem;font-family:'Barlow',sans-serif}

/* ── Buttons ── */
.pe-versus-btn{display:inline-block;padding:13px 22px;font-family:'Barlow Condensed',sans-serif;font-weight:700;
  font-size:1rem;letter-spacing:.1em;border-radius:10px;cursor:pointer;transition:all .2s;border:none;text-decoration:none;text-align:center}
.pe-versus-btn.primary{background:linear-gradient(135deg, #167440ff, #28dc78);color: #1a3050}
.pe-versus-btn.primary:hover{filter:brightness(1.1);transform:scale(1.02);color:#d4e8f8}
.pe-versus-btn.secondary{background:transparent;border:2px solid #1a3050;color: #3a6080}
.pe-versus-btn.secondary:hover{border-color: #28dc78;color: #28dc78}
.pe-versus-btn.small{padding:8px 14px;font-size:.78rem}
.pe-vs-cancel{background:none;border:none;color:#1a3050;font-family:'Barlow Condensed',sans-serif;
  font-size:.8rem;letter-spacing:.12em;cursor:pointer;transition:.15s}
.pe-vs-cancel:hover{color:s#3a6080}

/* ── Pending invites section ── */
.pe-invites-section{background:rgba(40,220,120,.04);border:1px solid rgba(40,220,120,.18);border-radius:14px;
  padding:1rem 1.2rem;margin-bottom:1rem}
.pe-invites-title{display:flex;align-items:center;gap:.5rem;font-family:'Barlow Condensed',sans-serif;
  font-weight:800;font-size:.7rem;letter-spacing:.2em;color:#28dc78;margin-bottom:.8rem}
.pe-invites-dot{width:7px;height:7px;border-radius:50%;background:#28dc78;animation:invite-pulse 1.4s ease-in-out infinite;flex-shrink:0}
@keyframes invite-pulse{0%,100%{opacity:.4;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
.pe-invite-notif{display:flex;align-items:center;gap:.8rem;padding:.7rem 0;border-bottom:1px solid rgba(40,220,120,.1)}
.pe-invite-notif:last-child{border-bottom:none;padding-bottom:0}
.pe-in-icon{font-size:1.4rem;flex-shrink:0}
.pe-in-info{flex:1;min-width:0}
.pe-in-from{font-size:.88rem;color:#d4e8f8;line-height:1.4}
.pe-in-from strong{color:#28dc78}
.pe-in-time{font-size:.65rem;color:#2a4060;letter-spacing:.06em;margin-top:1px}
.pe-in-actions{display:flex;gap:.5rem;flex-shrink:0}
.pe-in-accept{background:linear-gradient(135deg,#20a050,#28dc78);border:none;color:#050a18;border-radius:7px;
  padding:6px 12px;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.78rem;
  letter-spacing:.08em;cursor:pointer;transition:.2s}
.pe-in-accept:hover{filter:brightness(1.1)}
.pe-in-dismiss{background:none;border:1px solid #1a3050;color:#2a4060;border-radius:7px;
  padding:6px 8px;font-size:.78rem;cursor:pointer;transition:.15s}
.pe-in-dismiss:hover{border-color:#e04040;color:#e04040}

/* ── Friend picker ── */
.pe-friend-picker{background:rgba(4,8,16,.8);border:1px solid #0d1835;border-radius:12px;padding:.9rem 1rem;
  margin-bottom:1.2rem;text-align:left}
.pe-fp-title{font-size:.65rem;letter-spacing:.2em;color:#2a4060;font-weight:700;margin-bottom:.8rem;
  font-family:'Barlow Condensed',sans-serif}
.pe-fp-row{display:flex;align-items:center;gap:.7rem;padding:.55rem 0;border-bottom:1px solid #0d1835}
.pe-fp-row:last-child{border-bottom:none}
.pe-fp-avatar{width:32px;height:32px;border-radius:8px;background:#0a1428;border:1px solid #1a3050;
  display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#42c0f8;flex-shrink:0}
.pe-fp-info{flex:1;min-width:0}
.pe-fp-name{font-size:.88rem;font-weight:700;color:#d4e8f8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pe-fp-un{font-size:.65rem;color:#2a4060}
.pe-fp-btn{background:linear-gradient(135deg, #146c3bff, #28dc78);border:none;color:#050a18;border-radius:7px;
  padding:6px 12px;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.75rem;
  letter-spacing:.08em;cursor:pointer;transition:.2s;flex-shrink:0}
.pe-fp-btn:hover{filter:brightness(1.1);color:#d4e8f8}

/* ── Section title ── */
.pe-versus-section-title{font-family:'Orbitron',sans-serif;font-size:.7rem;color:#28dc78;text-align:left;
  margin:0 0 .8rem;letter-spacing:.14em;font-weight:700}

/* ── Challenge rows ── */
.pe-challenge-row{background:rgba(4,8,16,.7);border:1px solid #0d1835;border-radius:10px;padding:.8rem .9rem;
  margin-bottom:.55rem;display:flex;justify-content:space-between;align-items:center;gap:1rem}
.pe-challenge-row:hover{border-color:#1a3050}
.pe-ch-info{text-align:left;flex:1;min-width:0}
.pe-ch-opponent{margin-bottom:.15rem}
.pe-ch-name{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.92rem;color:#d4e8f8;letter-spacing:.04em}
.pe-ch-waiting{display:flex;align-items:center;gap:.5rem;font-size:.82rem;color:#2a4060;font-style:italic}
.pe-ch-wait-dot{width:6px;height:6px;border-radius:50%;background:#28dc78;flex-shrink:0;
  animation:invite-pulse 1.4s ease-in-out infinite}
.pe-ch-meta{font-size:.62rem;color:#1a3050;letter-spacing:.08em;font-family:'Barlow Condensed',sans-serif}
.pe-ch-actions{display:flex;align-items:center;gap:.55rem;flex-shrink:0}
.pe-ch-delete{background:none;border:none;color:#1a3050;cursor:pointer;font-size:.82rem;padding:.2rem .3rem;
  transition:.15s;border-radius:4px}
.pe-ch-delete:hover{color:#e04040;background:rgba(224,64,64,.1)}

/* ── Invite box ── */
.pe-invite-box{background:rgba(4,8,16,.8);border:1px solid #0d1835;border-radius:10px;padding:.9rem 1.1rem;
  margin:1.1rem 0;text-align:left}
.pe-invite-label{font-size:.5rem;letter-spacing:.28em;color:#2a4060;margin-bottom:.4rem;
  font-family:'Barlow Condensed',sans-serif;font-weight:700}
.pe-invite-url{font-family:'Barlow Condensed',sans-serif;font-size:.72rem;color:#28dc78;
  word-break:break-all;line-height:1.5;letter-spacing:.02em}

@media(max-width:420px){
  .pe-vs-nav-title{font-size:.9rem}
  .pe-vs-nav-lb{font-size:.5rem}
}
`;