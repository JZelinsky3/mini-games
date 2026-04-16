'use client';
// nfl-minigames-hub/app/games/pack-empire/offense/league/[leagueId]/page.tsx

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { joinLeague, updateTeamName, leaveLeague, deleteLeague } from '@/lib/league/db';
import type { DBLeague, DBLeagueMember } from '@/lib/league/db';
import { PACK_TIER_LABELS, PACK_TIER_COLORS, packsForWeek } from '@/lib/league/packs';

const PHASE_LABEL: Record<string, string> = {
  pregame:  'WAITING TO START',
  regular:  'REGULAR SEASON',
  gauntlet: 'PLAYOFFS — GAUNTLET',
  finals:   'PLAYOFFS — FINALS',
  complete: 'SEASON COMPLETE',
};

export default function LeagueHomePage() {
  const supabase = createClient();
  const { leagueId } = useParams<{ leagueId: string }>();
  const router = useRouter();

  const [userId, setUserId]         = useState<string | null>(null);
  const [league, setLeague]         = useState<DBLeague | null>(null);
  const [members, setMembers]       = useState<DBLeagueMember[]>([]);
  const [me, setMe]                 = useState<DBLeagueMember | null>(null);
  const [loading, setLoading]       = useState(true);
  const [copying, setCopying]       = useState(false);
  const [joining, setJoining]       = useState(false);
  const [leaving, setLeaving]       = useState(false);
  const [showLeave, setShowLeave]   = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [advancing, setAdvancing]   = useState(false);
  const [advanceMsg, setAdvanceMsg] = useState('');

  // Team name editor
  const [editingName, setEditingName]   = useState(false);
  const [teamNameInput, setTeamNameInput] = useState('');
  const [savingName, setSavingName]     = useState(false);
  const [nameError, setNameError]       = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Invite modal
  const [showInvite, setShowInvite] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  const [draftSubmitted, setDraftSubmitted] = useState<Set<string>>(new Set());
  const [draftLocked, setDraftLocked]       = useState<Set<string>>(new Set());

  async function reload(uid: string) {
  const [lgRes, memRes, myRes] = await Promise.all([
    supabase.from('leagues').select('*').eq('id', leagueId).single(),
    supabase.from('league_members').select('*, profiles(username, avatar_url)').eq('league_id', leagueId).order('team_score', { ascending: false }),
    supabase.from('league_members').select('*').eq('league_id', leagueId).eq('user_id', uid).single(),
  ]);
  const lg = lgRes.data as DBLeague | null;
  const mems = (memRes.data ?? []) as DBLeagueMember[];
  const membership = myRes.data as DBLeagueMember | null;
  setLeague(lg);
  const merged = membership && !mems.find((m: DBLeagueMember) => m.user_id === uid)
    ? [membership, ...mems] : mems;
  setMembers(merged);
  // Load this week's draft status for all members
if (lg && lg.phase !== 'pregame' && lg.phase !== 'complete') {
  const { data: statuses } = await supabase
    .rpc('get_league_draft_status', { p_league_id: leagueId });
  setDraftSubmitted(new Set((statuses ?? []).filter((s: any) => s.submitted).map((s: any) => s.member_id)));
  setDraftLocked(new Set((statuses ?? []).filter((s: any) => s.locked).map((s: any) => s.member_id)));
}
  setMe(membership ?? merged.find((m: DBLeagueMember) => m.user_id === uid) ?? null);
}

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // Auth guard — league mode requires sign-in
      if (!user) { router.replace('/login'); return; }
      setUserId(user.id);
      await reload(user.id);
      setLoading(false);
    })();
  }, [leagueId]);

  async function handleJoin() {
    if (!userId || !league) return;
    setJoining(true);
    try {
      await joinLeague(league.id, userId);
      await reload(userId);
    } finally {
      setJoining(false);
    }
  }

  async function handleLeave() {
    if (!userId || !league || isCommissioner) return;
    setLeaving(true);
    try {
      await leaveLeague(league.id, userId);
      router.replace('/games/pack-empire/offense/league');
    } catch {
      setLeaving(false);
      setShowLeave(false);
    }
  }

  async function handleDelete() {
    if (!userId || !league || !isCommissioner) return;
    setDeleting(true);
    try {
      await deleteLeague(league.id);
      router.replace('/games/pack-empire/offense/league');
    } catch {
      setDeleting(false);
      setShowDelete(false);
    }
  }

  async function handleAdvanceWeek() {
  if (!league || !isCommissioner) return;
  setAdvancing(true);
  setAdvanceMsg('');
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setAdvanceMsg('Not logged in'); setAdvancing(false); return; }
    
    const res = await fetch('/api/advance-week', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ leagueId: league.id }),
});

    const text = await res.text();
    let result: any;
    try { result = JSON.parse(text); } 
    catch { setAdvanceMsg(`Bad response: ${text.slice(0, 100)}`); return; }
    
    if (result.ok) {
      setAdvanceMsg(`✓ Advanced to ${result.advanced_to.replace(/_/g, ' ')}`);
      await reload(userId!);
    } else {
      setAdvanceMsg(`Error: ${result.error}`);
    }
  } catch (e) {
    setAdvanceMsg(`Failed: ${String(e)}`);
  } finally {
    setAdvancing(false);
  }
}

  async function handleStartSeason() {
  if (!league || !isCommissioner) return;
  try {
    await supabase
      .from('leagues')
      .update({ phase: 'regular', current_week: 1 })
      .eq('id', league.id);
    setLeague(prev => prev ? { ...prev, phase: 'regular', current_week: 1 } : prev);
  } catch (e) {
    console.error(e);
  }
}

  async function handleSaveTeamName() {
    if (!me || !teamNameInput.trim()) return;
    if (teamNameInput.trim().length < 2) { setNameError('Min 2 characters'); return; }
    if (teamNameInput.trim().length > 32) { setNameError('Max 32 characters'); return; }
    setSavingName(true);
    setNameError('');
    try {
      await updateTeamName(me.id, teamNameInput.trim());
      setMe(prev => prev ? { ...prev, team_name: teamNameInput.trim() } : prev);
      setMembers(prev => prev.map(m =>
        m.id === me.id ? { ...m, team_name: teamNameInput.trim() } : m
      ));
      setEditingName(false);
    } catch {
      setNameError('Failed to save. Try again.');
    } finally {
      setSavingName(false);
    }
  }

  function startEditName() {
    setTeamNameInput(me?.team_name ?? '');
    setNameError('');
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopying(true);
    setTimeout(() => setCopying(false), 1600);
  }

  function copyInviteLink() {
    if (!league) return;
    const url = `${window.location.origin}/games/pack-empire/offense/league?join=${league.join_code}`;
    navigator.clipboard.writeText(url);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  }

  const isCommissioner = league?.commissioner_id === userId;
  const myRank         = me ? members.findIndex(m => m.user_id === userId) + 1 : null;
  const packsThisWeek  = league ? packsForWeek(league.current_week) : 11;
  const canJoin        = userId && !me && league?.phase === 'pregame'
                         && members.length < (league?.max_players ?? 0);

  const displayName = (m: DBLeagueMember) =>
    m.team_name ?? (m.profiles as any)?.username ?? 'Player';

  if (loading) return (
    <div className="llh-loading"><div className="llh-spinner" /></div>
  );
  if (!league) return <div className="llh-loading">League not found.</div>;

  return (
    <>
      <div className="llh-root">

        {/* ── Nav ── */}
        <nav className="llh-nav">
          <Link href="/games/pack-empire/offense/league" className="llh-back">← League Hub</Link>
          <div className="llh-nav-mid">
            <span className="llh-nav-dot" />
            <span className="llh-nav-label">PACK EMPIRE · LEAGUE</span>
          </div>
          <div className="llh-nav-right">
  {league.phase === 'pregame' && (
    <>
      <button className="llh-invite-nav-btn" onClick={() => setShowInvite(true)}>
        + INVITE
      </button>
      <button className="llh-code-btn" onClick={() => copyCode(league.join_code)}>
        {copying ? '✓ COPIED' : `CODE: ${league.join_code}`}
      </button>
    </>
  )}
</div>
        </nav>

        {/* ── Hero ── */}
        <div className="llh-hero">
          <div className="llh-hero-bg">
            <div className="llh-hero-grid" />
            <div className="llh-hero-glow" />
          </div>
          <div className="llh-hero-inner">
            <div className="llh-phase-badge">{PHASE_LABEL[league.phase] ?? league.phase}</div>
            <h1 className="llh-title">{league.name}</h1>
            <div className="llh-meta-row">
              {league.phase === 'regular' && (
                <span className="llh-meta-pill">WEEK {league.current_week} OF 8</span>
              )}
              <span className="llh-meta-pill">{members.length}/{league.max_players} PLAYERS</span>
              {isCommissioner && <span className="llh-meta-pill commissioner">⚡ COMMISSIONER</span>}
            </div>
          </div>
        </div>

        <div className="llh-body">
          <div className="llh-cols">

            {/* ── Left col ── */}
            <div className="llh-col-left">

              {/* My card */}
              {me && (
                <div className="llh-mycard">
                  <div className="llh-mycard-top">
                    <div className="llh-mycard-rank">#{myRank}</div>
                    <div className="llh-mycard-score-block">
                      <div className="llh-mycard-score">
                        {league.phase === 'pregame'
  ? '—'
  : (league.phase === 'gauntlet' || league.phase === 'finals' || league.phase === 'complete')
    ? ((me as any).playoff_score ?? 0).toLocaleString()
    : me.team_score.toLocaleString()}
                      </div>
                      <div className="llh-mycard-score-label">TEAM SCORE</div>
                    </div>
                    {me.next_pack_tier && league.phase === 'regular' && (
                      <div className="llh-mycard-tier-block">
                        <div className="llh-mycard-tier"
                          style={{ color: PACK_TIER_COLORS[me.next_pack_tier] }}>
                          {PACK_TIER_LABELS[me.next_pack_tier]}
                        </div>
                        <div className="llh-mycard-tier-label">NEXT PACK · {packsThisWeek} SLOTS</div>
                      </div>
                    )}
                  </div>
                  {(me.permanent_locks as any[]).length > 0 && (
                    <div className="llh-mycard-locks">
                      🔒 {(me.permanent_locks as any[]).length} locked player{(me.permanent_locks as any[]).length !== 1 ? 's' : ''}
                    </div>
                  )}

                  {/* Team name editor */}
                  <div className="llh-teamname-block">
                    {editingName ? (
                      <div className="llh-teamname-edit">
                        <input
                          ref={nameInputRef}
                          className="llh-teamname-input"
                          value={teamNameInput}
                          onChange={e => setTeamNameInput(e.target.value)}
                          maxLength={32}
                          placeholder="Team name…"
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveTeamName();
                            if (e.key === 'Escape') setEditingName(false);
                          }}
                        />
                        <div className="llh-teamname-edit-btns">
                          <button className="llh-teamname-save" onClick={handleSaveTeamName} disabled={savingName}>
                            {savingName ? '…' : 'SAVE'}
                          </button>
                          <button className="llh-teamname-cancel" onClick={() => setEditingName(false)}>
                            CANCEL
                          </button>
                        </div>
                        {nameError && <div className="llh-teamname-error">{nameError}</div>}
                      </div>
                    ) : (
                      <div className="llh-teamname-display">
                        <div className="llh-teamname-row">
                          <span className="llh-teamname-value">
                            {me.team_name ?? (me.profiles as any)?.username ?? 'Set team name'}
                          </span>
                          <button className="llh-teamname-edit-btn" onClick={startEditName}>
                            ✏️ {me.team_name ? 'RENAME' : 'SET NAME'}
                          </button>
                        </div>
                        {me.team_name && (
                          <div className="llh-teamname-username">
                            {(me.profiles as any)?.username}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action button */}
              {me && (league.phase === 'regular' || league.phase === 'gauntlet' || league.phase === 'finals') && (
                <Link
                  href={`/games/pack-empire/offense/league/${leagueId}/draft`}
                  className="llh-action-btn"
                >
                  OPEN PACKS — {league.phase === 'regular' ? `WEEK ${league.current_week}` : league.phase.toUpperCase()}
                </Link>
              )}

              {canJoin && (
                <button className="llh-action-btn" onClick={handleJoin} disabled={joining}>
                  {joining ? 'JOINING…' : 'JOIN THIS LEAGUE'}
                </button>
              )}

              {/* Commissioner */}
              {isCommissioner && (
                <div className="llh-comm-block">
                  <div className="llh-comm-label">COMMISSIONER</div>
                  {league.phase === 'pregame' && (
                    members.length >= league.min_players ? (
                      <button className="llh-start-btn" onClick={handleStartSeason}>
                        START SEASON ({members.length} teams ready)
                      </button>
                    ) : (
                      <div className="llh-comm-hint">
                        Need {league.min_players - members.length} more player{league.min_players - members.length !== 1 ? 's' : ''} to start
                      </div>
                    )
                  )}
                  {league.phase === 'regular' && (
                    <div style={{ marginTop: '.6rem' }}>
                      <button className="llh-advance-btn" onClick={handleAdvanceWeek} disabled={advancing}>
                        {advancing ? 'ADVANCING…' : `⏩ ADVANCE WEEK ${league.current_week} → ${league.current_week >= 8 ? 'PLAYOFFS' : `WEEK ${league.current_week + 1}`}`}
                      </button>
                      {advanceMsg && <div className="llh-advance-msg">{advanceMsg}</div>}
                    </div>
                  )}
                  {league.phase === 'gauntlet' && (
  <div style={{ marginTop: '.6rem' }}>
    <button className="llh-advance-btn" onClick={handleAdvanceWeek} disabled={advancing}>
      {advancing ? 'ADVANCING…' : '⏩ ADVANCE GAUNTLET → FINALS'}
    </button>
    {advanceMsg && <div className="llh-advance-msg">{advanceMsg}</div>}
  </div>
)}
{league.phase === 'finals' && (
  <div style={{ marginTop: '.6rem' }}>
    <button className="llh-advance-btn llh-advance-champion" onClick={handleAdvanceWeek} disabled={advancing}>
      {advancing ? 'FINISHING…' : '🏆 END FINALS — CROWN CHAMPION'}
    </button>
    {advanceMsg && <div className="llh-advance-msg">{advanceMsg}</div>}
  </div>
)}
                  {showDelete ? (
                    <div className="llh-delete-confirm">
                      <div className="llh-delete-msg">Delete this league permanently? All data will be lost and cannot be recovered.</div>
                      <div className="llh-leave-btns">
                        <button className="llh-leave-yes" onClick={handleDelete} disabled={deleting}>
                          {deleting ? 'DELETING…' : 'YES, DELETE'}
                        </button>
                        <button className="llh-leave-no" onClick={() => setShowDelete(false)}>CANCEL</button>
                      </div>
                    </div>
                  ) : (
                    <button className="llh-delete-btn" onClick={() => setShowDelete(true)}>
                      Delete League
                    </button>
                  )}
                </div>
              )}

              {/* Leave league */}
              {me && !isCommissioner && league.phase !== 'complete' && (
                <div className="llh-leave-block">
                  {showLeave ? (
                    <div className="llh-leave-confirm">
                      <div className="llh-leave-msg">Leave this league? You'll need the code to rejoin.</div>
                      <div className="llh-leave-btns">
                        <button className="llh-leave-yes" onClick={handleLeave} disabled={leaving}>
                          {leaving ? 'LEAVING…' : 'YES, LEAVE'}
                        </button>
                        <button className="llh-leave-no" onClick={() => setShowLeave(false)}>CANCEL</button>
                      </div>
                    </div>
                  ) : (
                    <button className="llh-leave-btn" onClick={() => setShowLeave(true)}>
                      Leave League
                    </button>
                  )}
                </div>
              )}

              {/* Invite card — pregame only */}
              {league.phase === 'pregame' && (
                <div className="llh-invite-card">
                  <div className="llh-invite-card-label">INVITE PLAYERS</div>
                  <div className="llh-invite-code">{league.join_code}</div>
                  <div className="llh-invite-hint">Share code or link with friends</div>
                  <div className="llh-invite-btns">
                    <button className="llh-copy-code-btn" onClick={() => copyCode(league.join_code)}>
                      {copying ? '✓ CODE COPIED' : 'COPY CODE'}
                    </button>
                    <button className="llh-invite-link-btn" onClick={() => setShowInvite(true)}>
                      INVITE LINK
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right col — standings ── */}
            <div className="llh-col-right">
              <div className="llh-standings-label">
                <span className="llh-sl-line" />STANDINGS<span className="llh-sl-line" />
              </div>
              <div className="llh-board">
                {members.length === 0 ? (
                  <div className="llh-board-empty">
                    No members yet — share the code to invite players.
                  </div>
                ) : members.map((m, idx) => {
                  const isMe  = m.user_id === userId;
                  const uname = (m.profiles as any)?.username ?? 'Player';
                  return (
                    <Link
                      key={m.id}
                      href={`/games/pack-empire/offense/league/${leagueId}/team/${m.user_id}`}
                      className={`llh-board-row${isMe ? ' me' : ''}`}
                    >
                      <div className="llh-board-rank">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </div>
                      <div className="llh-board-names">
                        <div className="llh-board-teamname">
                          {displayName(m)}
                          {isMe && <span className="llh-board-you"> YOU</span>}
                          {m.user_id === league.commissioner_id && <span className="llh-board-comm"> ⚡</span>}
                          <span className="llh-status-row">
  <span className={`llh-dot draft${draftSubmitted.has(m.id) ? ' on' : ''}`} title="Drafted" />
  <span className={`llh-dot lock${draftLocked.has(m.id) ? ' on' : ''}`} title="Locked" />
  {(m.permanent_locks as any[]).length > 0 && (
    <span className="llh-board-locks">🔒{(m.permanent_locks as any[]).length}</span>
  )}
</span>
                        </div>
                        {m.team_name && (
                          <div className="llh-board-username">{uname}</div>
                        )}
                      </div>
                      <div className="llh-board-score">
  {league.phase === 'pregame'
    ? '—'
    : (league.phase === 'gauntlet' || league.phase === 'finals' || league.phase === 'complete')
      ? ((m as any).playoff_score ?? 0).toLocaleString()
      : m.team_score.toLocaleString()}
</div>
                      {league.phase === 'complete' && m.playoff_active && (
  <div className="llh-board-champion">🏆 CHAMPION</div>
)}
{league.phase !== 'complete' && m.playoff_seed != null && (
  <div className="llh-board-seed">SEED {m.playoff_seed}</div>
)}
                      <div className="llh-board-arrow">›</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Invite modal ── */}
      {showInvite && (
        <div className="llh-modal-overlay" onClick={() => setShowInvite(false)}>
          <div className="llh-modal" onClick={e => e.stopPropagation()}>
            <div className="llh-modal-header">
              <div className="llh-modal-title">INVITE FRIENDS</div>
              <button className="llh-modal-close" onClick={() => setShowInvite(false)}>✕</button>
            </div>
            <div className="llh-modal-body">
              <div className="llh-modal-league-name">{league.name}</div>

              <div className="llh-modal-section-label">JOIN CODE</div>
              <div className="llh-modal-code-row">
                <div className="llh-modal-code">{league.join_code}</div>
                <button className="llh-modal-copy-btn" onClick={() => copyCode(league.join_code)}>
                  {copying ? '✓ COPIED' : 'COPY'}
                </button>
              </div>
              <div className="llh-modal-hint">Friends enter this code on the League Hub page</div>

              <div className="llh-modal-divider" />

              <div className="llh-modal-section-label">INVITE LINK</div>
              <div className="llh-modal-link-row">
                <div className="llh-modal-link">
                  {typeof window !== 'undefined'
                    ? `${window.location.origin}/games/pack-empire/offense/league?join=${league.join_code}`
                    : `…/league?join=${league.join_code}`}
                </div>
              </div>
              <button className="llh-modal-copy-link-btn" onClick={copyInviteLink}>
                {inviteCopied ? '✓ LINK COPIED' : 'COPY INVITE LINK'}
              </button>

              <div className="llh-modal-divider" />

              <div className="llh-modal-section-label">SHARE WITH FRIENDS</div>
              <div className="llh-friends-list">
                <div className="llh-friends-coming-soon">
                  Friends list integration coming soon — use the code or link above for now.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@700;800;900&display=swap');

        *{box-sizing:border-box}
        .llh-root{font-family:'Rajdhani',sans-serif;color:#ffd4a8;background:#1c0a00;min-height:100vh}

        .llh-loading{display:flex;align-items:center;justify-content:center;min-height:50vh;color:#7a3a10;font-family:'Rajdhani',sans-serif;font-size:.9rem;background:#1c0a00}
        .llh-spinner{width:32px;height:32px;border:2px solid #4a2000;border-top-color:#ff4500;border-radius:50%;animation:llh-spin .8s linear infinite}
        @keyframes llh-spin{to{transform:rotate(360deg)}}

        /* Nav */
        .llh-nav{display:flex;align-items:center;justify-content:space-between;padding:.8rem 2rem;background:rgba(28,10,0,.98);border-bottom:1px solid #4a2000;position:sticky;top:0;z-index:40;gap:1rem;overflow:hidden}
        .llh-back{color:#7a3a10;font-size:.82rem;letter-spacing:.1em;font-weight:600;text-decoration:none;transition:.15s;white-space:nowrap;flex-shrink:0}
        .llh-back:hover{color:#ff8c00}
        .llh-nav-mid{display:flex;align-items:center;gap:.4rem;font-family:'Orbitron',sans-serif;font-size:.6rem;letter-spacing:.18em;color:#7a3a10;position:absolute;left:50%;transform:translateX(-50%);pointer-events:none}
        .llh-nav-dot{width:6px;height:6px;border-radius:50%;background:#ff4500;box-shadow:0 0 6px #ff4500;flex-shrink:0}
        .llh-nav-right{display:flex;align-items:center;gap:.5rem;flex-shrink:0}
        .llh-invite-nav-btn{background:linear-gradient(135deg,#8a2000,#ff4500);color:#fff0e8;border:none;border-radius:6px;padding:.28rem .7rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.75rem;letter-spacing:.1em;cursor:pointer;transition:.15s;white-space:nowrap}
        .llh-invite-nav-btn:hover{filter:brightness(1.1)}
        .llh-code-btn{font-family:'Orbitron',sans-serif;font-size:.6rem;letter-spacing:.12em;color:#ff8c00;background:transparent;border:1px solid rgba(255,140,0,.3);border-radius:5px;padding:.24rem .55rem;cursor:pointer;transition:.15s;white-space:nowrap}
        .llh-code-btn:hover{background:rgba(255,140,0,.08);border-color:#ff8c00}

        /* Hero */
        .llh-hero{position:relative;overflow:hidden;padding:2rem 2rem 1.6rem;border-bottom:1px solid #2e1200}
        .llh-hero-bg{position:absolute;inset:0;background:linear-gradient(180deg,#2e1200,#1c0a00)}
        .llh-hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,69,0,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,69,0,.1) 1px,transparent 1px);background-size:40px 40px;mask-image:radial-gradient(ellipse 90% 100% at 30% 0%,black,transparent)}
        .llh-hero-glow{position:absolute;top:-60px;left:0;width:500px;height:300px;background:radial-gradient(ellipse,rgba(255,69,0,.18) 0%,transparent 70%);pointer-events:none}
        .llh-hero-inner{position:relative;z-index:1;max-width:1100px;margin:0 auto}
        .llh-phase-badge{display:inline-block;font-family:'Orbitron',sans-serif;font-size:.6rem;letter-spacing:.16em;color:#ff8c00;border:1px solid rgba(255,140,0,.35);border-radius:4px;padding:.2rem .55rem;margin-bottom:.6rem}
        .llh-title{font-family:'Orbitron',sans-serif;font-size:clamp(1.4rem,4vw,2.4rem);font-weight:900;color:#fff0e8;margin:0 0 .7rem;text-shadow:0 0 30px rgba(255,69,0,.2)}
        .llh-meta-row{display:flex;gap:.4rem;flex-wrap:wrap;align-items:center}
        .llh-meta-pill{font-family:'Rajdhani',sans-serif;font-size:.72rem;letter-spacing:.12em;color:#7a3a10;border:1px solid #4a2000;border-radius:4px;padding:.2rem .5rem;font-weight:600}
        .llh-meta-pill.commissioner{color:#ff8c00;border-color:rgba(255,140,0,.3)}

        /* Body */
        .llh-body{max-width:1100px;margin:0 auto;padding:1.8rem 2rem 4rem}
        .llh-cols{display:grid;grid-template-columns:360px 1fr;gap:1.4rem;align-items:start}
        .llh-col-left{display:flex;flex-direction:column;gap:1rem}

        /* My card */
        .llh-mycard{background:#2e1200;border:1.5px solid rgba(255,140,0,.3);border-radius:12px;padding:1.1rem 1.2rem;position:relative;overflow:hidden}
        .llh-mycard::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#ff4500,#ff8c00)}
        .llh-mycard-top{display:flex;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:.8rem}
        .llh-mycard-rank{font-family:'Orbitron',sans-serif;font-size:2.2rem;font-weight:900;color:#4a2000;min-width:3rem;text-align:center}
        .llh-mycard-score-block{flex:1}
        .llh-mycard-score{font-family:'Orbitron',sans-serif;font-size:1.5rem;font-weight:900;color:#ff8c00;line-height:1;text-shadow:0 0 12px rgba(255,140,0,.3)}
        .llh-mycard-score-label{font-size:.6rem;letter-spacing:.16em;color:#7a3a10;margin-top:.15rem}
        .llh-mycard-tier-block{text-align:right}
        .llh-mycard-tier{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:.1em}
        .llh-mycard-tier-label{font-size:.6rem;letter-spacing:.12em;color:#7a3a10;margin-top:.1rem}
        .llh-mycard-locks{font-size:.75rem;color:#c8a020;margin-bottom:.7rem;font-weight:600}

        /* Team name */
        .llh-teamname-block{border-top:1px solid #3a1800;padding-top:.7rem;margin-top:.1rem}
        .llh-teamname-display{}
        .llh-teamname-row{display:flex;align-items:center;justify-content:space-between;gap:.5rem}
        .llh-teamname-value{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1rem;color:#ffd4a8}
        .llh-teamname-username{font-size:.7rem;color:#7a3a10;margin-top:.15rem;font-weight:500}
        .llh-teamname-edit-btn{background:transparent;border:1px solid #4a2000;color:#7a3a10;border-radius:5px;padding:.2rem .5rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.65rem;letter-spacing:.08em;cursor:pointer;transition:.15s;white-space:nowrap;flex-shrink:0}
        .llh-teamname-edit-btn:hover{border-color:#ff4500;color:#ff8c00}
        .llh-teamname-edit{display:flex;flex-direction:column;gap:.4rem}
        .llh-teamname-input{width:100%;background:#1c0a00;border:1.5px solid #ff4500;border-radius:7px;padding:.5rem .7rem;font-family:'Rajdhani',sans-serif;font-size:.95rem;font-weight:600;color:#fff0e8;outline:none}
        .llh-teamname-input::placeholder{color:#4a2000}
        .llh-teamname-edit-btns{display:flex;gap:.4rem}
        .llh-teamname-save{flex:1;background:linear-gradient(135deg,#cc2200,#ff4500);color:#fff0e8;border:none;border-radius:6px;padding:.4rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.78rem;letter-spacing:.1em;cursor:pointer;transition:.15s}
        .llh-teamname-save:disabled{opacity:.5;cursor:default}
        .llh-teamname-cancel{background:transparent;border:1px solid #4a2000;color:#7a3a10;border-radius:6px;padding:.4rem .8rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.78rem;cursor:pointer;transition:.15s}
        .llh-teamname-cancel:hover{border-color:#7a3a10;color:#ffd4a8}
        .llh-teamname-error{font-size:.72rem;color:#ff6060;font-weight:600}

        /* Action button */
        .llh-action-btn{display:block;width:100%;text-align:center;text-decoration:none;border:none;border-radius:10px;padding:.95rem;font-family:'Orbitron',sans-serif;font-weight:800;font-size:.78rem;letter-spacing:.14em;cursor:pointer;transition:.2s;background:linear-gradient(135deg,#cc2200,#ff4500,#ff8c00);color:#fff0e8}
        .llh-action-btn:hover:not(:disabled){filter:brightness(1.1);box-shadow:0 4px 20px rgba(255,69,0,.35);transform:scale(1.01)}
        .llh-action-btn:disabled{opacity:.5;cursor:default;transform:none}

        /* Commissioner */
        .llh-comm-block{background:#2e1200;border:1px solid #4a2000;border-radius:10px;padding:.9rem 1rem}
        .llh-comm-label{font-family:'Orbitron',sans-serif;font-size:.58rem;letter-spacing:.2em;color:#ff4500;margin-bottom:.6rem}
        .llh-start-btn{width:100%;background:linear-gradient(135deg,#cc2200,#ff4500);color:#fff0e8;border:none;border-radius:8px;padding:.8rem;font-family:'Orbitron',sans-serif;font-weight:800;font-size:.72rem;letter-spacing:.12em;cursor:pointer;transition:.2s}
        .llh-start-btn:hover{filter:brightness(1.1)}
        .llh-comm-hint{font-size:.78rem;color:#7a3a10;font-weight:600;text-align:center}

        /* Invite card */
        .llh-invite-card{background:#2e1200;border:1px solid #4a2000;border-radius:10px;padding:.9rem 1rem;text-align:center}
        .llh-invite-card-label{font-family:'Orbitron',sans-serif;font-size:.58rem;letter-spacing:.2em;color:#7a3a10;margin-bottom:.5rem}
        .llh-invite-code{font-family:'Orbitron',sans-serif;font-size:1.6rem;font-weight:900;color:#ff4500;letter-spacing:.24em;margin-bottom:.2rem;text-shadow:0 0 12px rgba(255,69,0,.3)}
        .llh-invite-hint{font-size:.7rem;color:#4a2000;margin-bottom:.7rem;font-weight:500}
        .llh-invite-btns{display:flex;gap:.4rem}
        .llh-copy-code-btn{flex:1;background:transparent;border:1.5px solid #4a2000;color:#7a3a10;border-radius:7px;padding:.45rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.8rem;letter-spacing:.08em;cursor:pointer;transition:.15s}
        .llh-copy-code-btn:hover{border-color:#ff4500;color:#ff8c00}
        .llh-invite-link-btn{flex:1;background:linear-gradient(135deg,#8a2000,#cc2200);color:#fff0e8;border:none;border-radius:7px;padding:.45rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.8rem;letter-spacing:.08em;cursor:pointer;transition:.15s}
        .llh-invite-link-btn:hover{filter:brightness(1.1)}

        /* Standings */
        .llh-col-right{}
        .llh-standings-label{display:flex;align-items:center;gap:.8rem;font-family:'Orbitron',sans-serif;font-size:.6rem;letter-spacing:.2em;color:#7a3a10;margin-bottom:.8rem}
        .llh-sl-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,#4a2000)}
        .llh-sl-line:last-child{background:linear-gradient(90deg,#4a2000,transparent)}
        .llh-board{display:flex;flex-direction:column;gap:.4rem}
        .llh-board-empty{color:#7a3a10;font-size:.85rem;padding:1.5rem;text-align:center;background:#2e1200;border:1px dashed #4a2000;border-radius:10px;font-weight:500}
        .llh-board-row{display:flex;align-items:center;gap:.8rem;background:#2e1200;border:1px solid #3a1800;border-radius:9px;padding:.75rem 1rem;text-decoration:none;transition:.15s}
        .llh-board-row:hover{border-color:#ff4500;background:#3a1800}
        .llh-board-row.me{border-color:rgba(255,140,0,.4);background:rgba(58,24,0,.8)}
        .llh-board-rank{font-family:'Orbitron',sans-serif;font-size:.78rem;color:#7a3a10;width:2.4rem;flex-shrink:0;text-align:center}
        .llh-board-names{flex:1;min-width:0}
        .llh-board-teamname{font-weight:700;font-size:.95rem;color:#ffd4a8;display:flex;align-items:center;gap:.3rem;flex-wrap:wrap;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .llh-board-username{font-size:.68rem;color:#7a3a10;margin-top:.1rem;font-weight:500}
        .llh-board-you{font-size:.6rem;letter-spacing:.12em;color:#ff8c00;background:rgba(255,140,0,.12);border:1px solid rgba(255,140,0,.25);border-radius:3px;padding:.05rem .3rem}
        .llh-board-comm{color:#ff4500}
        .llh-board-locks{font-size:.7rem;color:#c8a020}
        .llh-board-score{font-family:'Orbitron',sans-serif;font-size:.88rem;color:#ff8c00;flex-shrink:0;font-weight:800}
        .llh-board-seed{font-size:.62rem;letter-spacing:.1em;color:#28dc78;border:1px solid rgba(40,220,120,.3);border-radius:3px;padding:.1rem .3rem;flex-shrink:0}
        .llh-board-arrow{color:#4a2000;font-size:1.1rem;flex-shrink:0;transition:.15s}
        .llh-board-row:hover .llh-board-arrow{color:#ff4500}

        .llh-board-champion{font-size:.68rem;letter-spacing:.1em;color:#ffd700;border:1px solid rgba(255,215,0,.5);border-radius:3px;padding:.1rem .4rem;flex-shrink:0;background:rgba(255,215,0,.08);text-shadow:0 0 8px rgba(255,215,0,.5)}
        
        /* Invite modal */
        .llh-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:100;display:flex;align-items:center;justify-content:center;padding:1rem}
        .llh-modal{background:#1c0a00;border:1.5px solid #4a2000;border-radius:14px;width:100%;max-width:480px;overflow:hidden;position:relative}
        .llh-modal-header{display:flex;align-items:center;justify-content:space-between;padding:.9rem 1.2rem;border-bottom:1px solid #2e1200;background:#2e1200}
        .llh-modal-title{font-family:'Orbitron',sans-serif;font-size:.75rem;letter-spacing:.18em;color:#ff4500;font-weight:800}
        .llh-modal-close{background:transparent;border:none;color:#7a3a10;font-size:1rem;cursor:pointer;transition:.15s;padding:.1rem .3rem}
        .llh-modal-close:hover{color:#ff8c00}
        .llh-modal-body{padding:1.2rem}
        .llh-modal-league-name{font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:900;color:#ff8c00;margin-bottom:1rem}
        .llh-modal-section-label{font-family:'Orbitron',sans-serif;font-size:.55rem;letter-spacing:.2em;color:#7a3a10;margin-bottom:.45rem}
        .llh-modal-code-row{display:flex;align-items:center;gap:.6rem;margin-bottom:.3rem}
        .llh-modal-code{font-family:'Orbitron',sans-serif;font-size:1.8rem;font-weight:900;color:#ff4500;letter-spacing:.28em;flex:1;text-shadow:0 0 12px rgba(255,69,0,.3)}
        .llh-modal-copy-btn{background:linear-gradient(135deg,#8a2000,#cc2200);color:#fff0e8;border:none;border-radius:7px;padding:.5rem 1rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.82rem;letter-spacing:.1em;cursor:pointer;transition:.15s;white-space:nowrap;flex-shrink:0}
        .llh-modal-copy-btn:hover{filter:brightness(1.1)}
        .llh-modal-hint{font-size:.72rem;color:#4a2000;font-weight:500;margin-bottom:.2rem}
        .llh-modal-divider{height:1px;background:#2e1200;margin:1rem 0}
        .llh-modal-link-row{margin-bottom:.6rem}
        .llh-modal-link{font-family:'Orbitron',sans-serif;font-size:.58rem;color:#7a3a10;letter-spacing:.04em;word-break:break-all;background:#2e1200;border-radius:6px;padding:.5rem .7rem;line-height:1.4}
        .llh-modal-copy-link-btn{width:100%;background:linear-gradient(135deg,#cc2200,#ff4500,#ff8c00);color:#fff0e8;border:none;border-radius:9px;padding:.75rem;font-family:'Orbitron',sans-serif;font-weight:800;font-size:.75rem;letter-spacing:.14em;cursor:pointer;transition:.2s}
        .llh-modal-copy-link-btn:hover{filter:brightness(1.1)}
        .llh-friends-coming-soon{font-size:.8rem;color:#4a2000;text-align:center;padding:.8rem;font-weight:500;font-style:italic}

        /* Packs and Lock count */
        .llh-status-row{display:flex;align-items:center;gap:.3rem;margin-left:.3rem}
        .llh-dot{width:7px;height:7px;border-radius:50%;border:1px solid #3a1808;background:#1c0a00;flex-shrink:0;transition:.2s}
        .llh-dot.draft.on{background:#ff6b35;border-color:#ff6b35;box-shadow:0 0 5px rgba(255,107,53,.7)}
        .llh-dot.lock.on{background:#c8a020;border-color:#c8a020;box-shadow:0 0 5px rgba(200,160,32,.7)}

        /* Leave */
        .llh-leave-block{padding:.3rem 0}
        .llh-leave-btn{background:transparent;border:none;color:#4a2000;font-family:'Rajdhani',sans-serif;font-size:.75rem;font-weight:600;cursor:pointer;text-decoration:underline;transition:.15s;padding:.2rem 0}
        .llh-leave-btn:hover{color:#ff6060}
        .llh-leave-confirm{background:#2e1200;border:1px solid rgba(255,60,60,.25);border-radius:9px;padding:.8rem 1rem}
        .llh-leave-msg{font-size:.8rem;color:#a05030;margin-bottom:.6rem;font-weight:500}
        .llh-leave-btns{display:flex;gap:.4rem}
        .llh-leave-yes{flex:1;background:rgba(180,0,0,.3);border:1.5px solid rgba(255,60,60,.4);color:#ff8080;border-radius:6px;padding:.45rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.8rem;letter-spacing:.08em;cursor:pointer;transition:.15s}
        .llh-leave-yes:hover:not(:disabled){background:rgba(180,0,0,.5)}
        .llh-leave-yes:disabled{opacity:.5}
        .llh-leave-no{flex:1;background:transparent;border:1px solid #4a2000;color:#7a3a10;border-radius:6px;padding:.45rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.8rem;cursor:pointer;transition:.15s}
        .llh-leave-no:hover{border-color:#7a3a10;color:#ffd4a8}

        /* Delete */
        .llh-delete-btn{background:transparent;border:none;color:#4a2000;font-family:'Rajdhani',sans-serif;font-size:.75rem;font-weight:600;cursor:pointer;text-decoration:underline;transition:.15s;padding:.3rem 0;display:block;margin-top:.5rem}
        .llh-delete-btn:hover{color:#ff6060}
        .llh-delete-confirm{background:rgba(80,0,0,.2);border:1px solid rgba(255,60,60,.25);border-radius:9px;padding:.8rem 1rem;margin-top:.6rem}
        .llh-delete-msg{font-size:.78rem;color:#a05030;margin-bottom:.6rem;font-weight:500;line-height:1.4}

        .llh-advance-btn{width:100%;background:rgba(255,140,0,.1);border:1.5px solid rgba(255,140,0,.3);color:#ff8c00;border-radius:8px;padding:.7rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.8rem;letter-spacing:.1em;cursor:pointer;transition:.2s}
        .llh-advance-btn:hover:not(:disabled){background:rgba(255,140,0,.2);border-color:#ff8c00}
        .llh-advance-btn:disabled{opacity:.5;cursor:default}
        .llh-advance-btn.llh-advance-champion{background:linear-gradient(135deg,#6a4000,#c8a020,#ffd700);border-color:#ffd700;color:#1a0800 !important}
        .llh-advance-btn.llh-advance-champion:hover:not(:disabled){background:linear-gradient(135deg,#8a5000,#e0b830,#ffe040);border-color:#ffe040}
        .llh-advance-msg{font-size:.72rem;color:#ff8c00;margin-top:.3rem;text-align:center;font-family:'Rajdhani',sans-serif;font-weight:600}

        /* Responsive */
        @media(max-width:860px){
          .llh-cols{grid-template-columns:1fr}
          .llh-col-left{order:2}
          .llh-col-right{order:1}
          .llh-body{padding:1.4rem 1rem 3rem}
          .llh-nav{padding:.8rem 1rem}
          .llh-hero{padding:1.6rem 1rem 1.2rem}
          .llh-nav-label{display:none}
        }
        @media(max-width:480px){
          .llh-nav-right{gap:.3rem}
          .llh-invite-nav-btn{display:none}
        }
      `}</style>
    </>
  );
}