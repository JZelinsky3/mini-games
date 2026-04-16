'use client';
// nfl-minigames-hub/app/games/pack-empire/offense/league/[leagueId]/team/[memberId]/page.tsx

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getLeague } from '@/lib/league/db';
import type { DBLeague } from '@/lib/league/db';
import { chemistryLabel } from '@/lib/league/chemistry';

const supabase = createClient();

type Rarity = 'common' | 'rare' | 'dynasty' | 'transcendent' | 'immortal';
interface Player {
  id: string; name: string; pos: string; team: string;
  score: number; rarity: Rarity; accolades: string[];
}

const RC: Record<Rarity, { color: string; art: string }> = {
  common:       { color: '#c87840', art: 'linear-gradient(150deg,#3d2210,#7a4820)' },
  rare:         { color: '#42c0f8', art: 'linear-gradient(150deg,#062840,#104870)' },
  dynasty:      { color: '#ffd700', art: 'linear-gradient(150deg,#3a2800,#806010)' },
  transcendent: { color: '#e040ff', art: 'linear-gradient(150deg,#280048,#6010b0)' },
  immortal:     { color: '#28dc78', art: 'linear-gradient(150deg,#021a0a,#04401a)' },
};

const SLOTS = [
  { key: 'QB',  pos: 'QB' }, { key: 'RB',  pos: 'RB' },
  { key: 'WR1', pos: 'WR' }, { key: 'WR2', pos: 'WR' }, { key: 'WR3', pos: 'WR' },
  { key: 'TE',  pos: 'TE' }, { key: 'LT',  pos: 'OT' }, { key: 'LG',  pos: 'OG' },
  { key: 'C',   pos: 'C'  }, { key: 'RG',  pos: 'OG' }, { key: 'RT',  pos: 'OT' },
];

function mapToSlots(roster: Player[]): (Player | null)[] {
  const q: Record<string, Player[]> = {};
  for (const p of roster) { if (!q[p.pos]) q[p.pos] = []; q[p.pos].push(p); }
  const c: Record<string, number> = {};
  return SLOTS.map(slot => { if (!c[slot.pos]) c[slot.pos] = 0; return (q[slot.pos] ?? [])[c[slot.pos]++] ?? null; });
}

export default function TeamViewPage() {
  const { leagueId, memberId } = useParams<{ leagueId: string; memberId: string }>();
  const router = useRouter();

  const [league, setLeague]               = useState<DBLeague | null>(null);
  const [draft, setDraft]                 = useState<any | null>(null);
  const [currentDraft, setCurrentDraft]   = useState<any | null>(null);
  const [lockedIds, setLockedIds]         = useState<string[]>([]);
  const [teamName, setTeamName]           = useState('');
  const [username, setUsername]           = useState('');
  const [loading, setLoading]             = useState(true);
  const [myUserId, setMyUserId]           = useState<string | null>(null);
  const [imageMap, setImageMap]           = useState<Record<string, string>>({});
  const [lockSelected, setLockSelected]   = useState<string | null>(null);
  const [lockSaving, setLockSaving]       = useState(false);
  const [lockDone, setLockDone]           = useState(false);
  const [showLockWarning, setShowLockWarning] = useState(false);

  useEffect(() => {
    fetch('/players.csv').then(r => r.ok ? r.text() : Promise.reject()).then(text => {
      const map: Record<string, string> = {};
      text.split('\n').forEach(line => {
        if (!line.trim()) return;
        const cols: string[] = []; let cur = ''; let inQ = false;
        for (const c of line) { if (c === '"') { inQ = !inQ; continue; } if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; } cur += c; }
        cols.push(cur.trim());
        if (cols[1] && cols[22]?.startsWith('http')) map[cols[1]] = cols[22];
      });
      setImageMap(map);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      setMyUserId(user.id);

      const lg = await getLeague(leagueId);
      setLeague(lg);
      if (!lg) { setLoading(false); return; }

      const [profileRes, membershipRes] = await Promise.all([
        supabase.from('profiles').select('username').eq('id', memberId).single(),
        supabase.from('league_members').select('permanent_locks, team_name')
          .eq('league_id', leagueId).eq('user_id', memberId).single(),
      ]);
      setUsername(profileRes.data?.username ?? 'Player');
      setTeamName(membershipRes.data?.team_name ?? '');
      const locks = (membershipRes.data?.permanent_locks as Player[]) ?? [];
      setLockedIds(locks.map(p => p.id));

      const revealedWeek = lg.phase === 'regular' ? lg.current_week - 1 : lg.current_week;
      if (revealedWeek >= 1) {
        const { data: draftRow } = await supabase
          .from('league_drafts').select('*')
          .eq('league_id', leagueId).eq('user_id', memberId)
          .eq('week_number', revealedWeek).single();
        setDraft(draftRow ?? null);
      }

      const activePhasesForCurrentDraft = ['regular', 'gauntlet', 'finals'];
if (user.id === memberId && activePhasesForCurrentDraft.includes(lg.phase)) {
  const { data: currentRow } = await supabase
    .from('league_drafts').select('*')
    .eq('league_id', leagueId).eq('user_id', memberId)
    .eq('week_number', lg.current_week).eq('phase', lg.phase).single();
  setCurrentDraft(currentRow ?? null);
  if (currentRow?.locked_this_week) setLockDone(true);
}

      setLoading(false);
    })();
  }, [leagueId, memberId]);

  async function handleLock() {
    if (!lockSelected || lockSaving || lockDone || !currentDraft) return;
    setLockSaving(true);
    try {
      await supabase.from('league_drafts').update({ locked_this_week: lockSelected }).eq('id', currentDraft.id);
      const { data: memRow } = await supabase.from('league_members')
        .select('id, permanent_locks').eq('league_id', leagueId).eq('user_id', memberId).single();
      if (memRow) {
        const player = (currentDraft.roster as Player[]).find((p: Player) => p.id === lockSelected);
        if (player) {
          const newLocks = [...((memRow.permanent_locks as Player[]) ?? []), player];
          await supabase.from('league_members').update({ permanent_locks: newLocks }).eq('id', memRow.id);
          setLockedIds(prev => [...prev, player.id]);
        }
      }
      setLockDone(true); setShowLockWarning(false); setLockSelected(null);
    } catch(e) { console.error(e); } finally { setLockSaving(false); }
  }

  if (loading) return <div className="ltv-loading"><div className="ltv-spinner" /></div>;
  if (!league) return <div className="ltv-loading">League not found.</div>;

  const isMe = myUserId === memberId;
  const chem = draft?.chemistry ?? null;

  const isPlayoff = league.phase === 'gauntlet' || league.phase === 'finals';
  const slotPlayers: (Player | null)[] = mapToSlots(draft?.roster ?? []);
  const currentSlotPlayers: (Player | null)[] = mapToSlots(currentDraft?.roster ?? []);

  // Left col: regular = private current week (if available) else revealed; playoff = revealed
  const leftSlots: (Player | null)[] = isPlayoff
    ? slotPlayers
    : (isMe && currentDraft ? currentSlotPlayers : slotPlayers);

  // Right col: regular = locked players; playoff = this week's private draft
  const lockSlots: (Player | null)[] = Array(11).fill(null);
  if (!isPlayoff) {
    const allRoster: Player[] = [...(currentDraft?.roster ?? []), ...(draft?.roster ?? [])];
    const seen = new Set<string>();
    allRoster.filter(p => { if (lockedIds.includes(p.id) && !seen.has(p.id)) { seen.add(p.id); return true; } return false; })
      .forEach(lp => {
        const si = SLOTS.findIndex((slot, idx) => slot.pos === lp.pos && lockSlots[idx] === null);
        if (si !== -1) lockSlots[si] = lp;
      });
  }
  const rightSlots: (Player | null)[] = isPlayoff
    ? (isMe ? currentSlotPlayers : Array(11).fill(null))
    : lockSlots;

  const pickRoster: Player[] = (currentDraft?.roster ?? draft?.roster ?? []) as Player[];
  const displayTitle = teamName ? teamName : isMe ? 'YOUR LINEUP' : `${username}'s LINEUP`;

  return (
    <>
      <div className="ltv-root">
        <nav className="ltv-nav">
          <Link href={`/games/pack-empire/offense/league/${leagueId}`} className="ltv-back">← {league.name}</Link>
          <div className="ltv-nav-mid"><span className="ltv-nav-dot" /><span>{isMe ? 'MY LINEUP' : 'TEAM VIEW'}</span></div>
          <div />
        </nav>

        <div className="ltv-header">
          <div className="ltv-header-bg"><div className="ltv-header-grid" /><div className="ltv-header-glow" /></div>
          <div className="ltv-header-inner">
            <h1 className="ltv-title">{displayTitle}</h1>
            {teamName && <div className="ltv-subtitle">{username}</div>}
            {draft && <div className="ltv-week-tag">WEEK {draft.week_number} · {draft.phase?.toUpperCase()}</div>}
          </div>
        </div>

        <div className="ltv-body">
          {!draft && !currentDraft ? (
            <div className="ltv-no-draft">
              {league.phase === 'pregame' ? "Season hasn't started yet." : 'No revealed draft yet — check back after midnight.'}
            </div>
          ) : (<>

            {/* Score strip */}
            {draft && (
              <div className="ltv-score-strip">
                <div className="ltv-ss-block">
                  <div className="ltv-ss-num" style={{ color: '#ff8c00' }}>{draft.final_score?.toLocaleString()}</div>
                  <div className="ltv-ss-label">FINAL SCORE</div>
                </div>
                <div className="ltv-ss-div" />
                <div className="ltv-ss-block">
                  <div className="ltv-ss-num">{draft.draft_score?.toLocaleString()}</div>
                  <div className="ltv-ss-label">DRAFT</div>
                </div>
                {chem && <><div className="ltv-ss-div" />
                  <div className="ltv-ss-block">
                    <div className="ltv-ss-num" style={{ color: chem.totalChemPoints >= 0 ? '#ff8c00' : '#ff6060' }}>
                      {chem.totalChemPoints >= 0 ? '+' : ''}{chem.totalChemPoints?.toLocaleString()}
                    </div>
                    <div className="ltv-ss-label">CHEMISTRY</div>
                  </div>
                </>}
                {chem?.bonds?.length > 0 && <><div className="ltv-ss-div" />
                  <div className="ltv-ss-bonds">
                    {chem.bonds.map((b: any, i: number) => (
                      <span key={i} className="ltv-ss-bond" style={{ color: b.points >= 0 ? '#ff8c00' : '#ff6060' }}>
                        {b.type === 'synergy' ? '⚡' : '⚔️'} {b.reason} {b.points >= 0 ? '+' : ''}{b.points}
                      </span>
                    ))}
                  </div>
                </>}
              </div>
            )}

            {/* Lock picker — self only */}
            {isMe && currentDraft && !lockDone && league.phase === 'regular' && (
              <div className="ltv-lock-section">
                <div className="ltv-lock-eyebrow">PICK YOUR LOCKED PLAYER FOR NEXT WEEK</div>
                <div className="ltv-lock-sub">Only you see this. Pick one player to carry forward. <strong>Cannot be changed once locked.</strong></div>
                <div className="ltv-lock-grid">
                  {pickRoster.filter((p: Player) => !lockedIds.includes(p.id)).map((p: Player) => {
                    const rc = RC[p.rarity] ?? RC.common;
                    const isSel = lockSelected === p.id;
                    return (
                      <div key={p.id} className={`ltv-lock-card${isSel ? ' selected' : ''}`}
                        style={{ '--rc': rc.color } as React.CSSProperties}
                        onClick={() => setLockSelected(isSel ? null : p.id)}>
                        <div className="ltv-lc-pos">{p.pos}</div>
                        <div className="ltv-lc-name">{p.name.split(' ').slice(-1)[0]}</div>
                        <div className="ltv-lc-score" style={{ color: rc.color }}>{p.score.toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
                {lockSelected && !showLockWarning && (
                  <button className="ltv-lock-btn" onClick={() => setShowLockWarning(true)}>
                    🔒 LOCK {pickRoster.find((p: Player) => p.id === lockSelected)?.name?.split(' ').slice(-1)[0]} →
                  </button>
                )}
                {showLockWarning && (
                  <div className="ltv-lock-warning">
                    <div className="ltv-lw-msg">⚠️ Cannot be undone. Lock this player for the rest of the season?</div>
                    <div className="ltv-lw-btns">
                      <button className="ltv-lw-confirm" onClick={handleLock} disabled={lockSaving}>{lockSaving ? 'LOCKING…' : 'YES, LOCK THEM'}</button>
                      <button className="ltv-lw-cancel" onClick={() => setShowLockWarning(false)}>CANCEL</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {isMe && lockDone && league.phase === 'regular' && <div className="ltv-lock-done">🔒 Player locked for next week.</div>}

            {/* Dual columns */}
            <div className="ltv-dual-cols">
              {/* Left — this week / current draft */}
              <div className="ltv-dual-col">
                <div className="ltv-col-hdr">
                  <span className="ltv-col-hdr-dot" style={{ background: '#ff8c00' }} />
                  {isPlayoff
                    ? `LAST WEEKS ${draft?.week_number ?? ''} LINEUP`
                    : isMe && currentDraft ? 'THIS WEEKS (PRIVATE)' : `WEEKS ${draft?.week_number ?? ''} LINEUP`}
                </div>
                {SLOTS.map((slot, idx) => {
                  const player = leftSlots[idx];
                  const rc = player ? RC[player.rarity] ?? RC.common : null;
                  const imgSrc = player ? imageMap[player.name] : undefined;
                  const isLocked = player ? lockedIds.includes(player.id) : false;
                  return (
                    <div key={slot.key}
                      className={`ltv-row${!player ? ' empty' : ''}${isLocked ? ' is-locked' : ''}`}
                      style={player ? { '--rc': rc!.color, '--art': rc!.art } as React.CSSProperties : undefined}>
                      <div className="ltv-row-pos">{slot.key}</div>
                      {player ? <>
                        <div className="ltv-row-art" style={{ background: rc!.art }}>
                          {imgSrc && <img src={imgSrc} alt={player.name} className="ltv-row-img" onError={e => (e.currentTarget.style.display = 'none')} />}
                        </div>
                        <div className="ltv-row-info">
                          <div className="ltv-row-name" style={{ color: rc!.color }}>{player.name}</div>
                          <div className="ltv-row-meta">{player.team} · {player.rarity.toUpperCase()}</div>
                        </div>
                        <div className="ltv-row-score" style={{ color: rc!.color }}>{player.score.toLocaleString()}</div>
                        {isLocked && <div className="ltv-row-lock">🔒</div>}
                      </> : <div className="ltv-row-empty">—</div>}
                    </div>
                  );
                })}
              </div>

              {/* Right — locked players (regular) or this week's draft (playoffs) */}
              <div className="ltv-dual-col">
                <div className="ltv-col-hdr">
                  <span className="ltv-col-hdr-dot" style={{ background: isPlayoff ? '#ff8c00' : '#28dc78' }} />
                  {isPlayoff
                    ? (isMe && currentDraft ? 'THIS WEEKS (PRIVATE)' : 'CURRENT WEEKS')
                    : 'LOCKED IN'}
                </div>
                {SLOTS.map((slot, idx) => {
                  const player = rightSlots[idx];
                  const rc = player ? RC[player.rarity] ?? RC.common : null;
                  const imgSrc = player ? imageMap[player.name] : undefined;
                  const emptyClass = isPlayoff ? ' empty' : ' empty lock-open';
                  const filledClass = isPlayoff ? '' : ' locked-slot';
                  return (
                    <div key={slot.key}
                      className={`ltv-row${!player ? emptyClass : filledClass}`}
                      style={player ? { '--rc': rc!.color, '--art': rc!.art } as React.CSSProperties : undefined}>
                      <div className="ltv-row-pos">{slot.key}</div>
                      {player ? <>
                        <div className="ltv-row-art" style={{ background: rc!.art }}>
                          {imgSrc && <img src={imgSrc} alt={player.name} className="ltv-row-img" onError={e => (e.currentTarget.style.display = 'none')} />}
                        </div>
                        <div className="ltv-row-info">
                          <div className="ltv-row-name" style={{ color: rc!.color }}>{player.name}</div>
                          <div className="ltv-row-meta">{player.team} · {player.rarity.toUpperCase()}</div>
                        </div>
                        <div className="ltv-row-score" style={{ color: rc!.color }}>{player.score.toLocaleString()}</div>
                        {!isPlayoff && <div className="ltv-row-lock">🔒</div>}
                      </> : <div className="ltv-row-empty open">{isPlayoff ? '—' : 'OPEN'}</div>}
                    </div>
                  );
                })}
              </div>
            </div>

          </>)}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@700;800;900&display=swap');
        *{box-sizing:border-box}
        .ltv-root{font-family:'Rajdhani',sans-serif;color:#ffd4a8;background:#1c0a00;min-height:100vh}
        .ltv-loading{display:flex;align-items:center;justify-content:center;min-height:50vh;background:#1c0a00;color:#7a3a10;font-family:'Rajdhani',sans-serif}
        .ltv-spinner{width:30px;height:30px;border:2px solid #4a2000;border-top-color:#ff4500;border-radius:50%;animation:ltv-spin .8s linear infinite}
        @keyframes ltv-spin{to{transform:rotate(360deg)}}
        .ltv-nav{display:flex;align-items:center;justify-content:space-between;padding:.8rem 2rem;background:rgba(28,10,0,.98);border-bottom:1px solid #4a2000;position:sticky;top:0;z-index:40;font-family:'Rajdhani',sans-serif}
        .ltv-back{color:#7a3a10;font-size:.82rem;letter-spacing:.1em;font-weight:600;text-decoration:none;transition:.15s}
        .ltv-back:hover{color:#ff8c00}
        .ltv-nav-mid{display:flex;align-items:center;gap:.4rem;font-family:'Orbitron',sans-serif;font-size:.6rem;letter-spacing:.18em;color:#7a3a10}
        .ltv-nav-dot{width:6px;height:6px;border-radius:50%;background:#ff4500;box-shadow:0 0 5px #ff4500;flex-shrink:0}
        .ltv-header{position:relative;overflow:hidden;padding:1.8rem 2rem 1.4rem;border-bottom:1px solid #2e1200}
        .ltv-header-bg{position:absolute;inset:0;background:linear-gradient(180deg,#2e1200,#1c0a00)}
        .ltv-header-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,69,0,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(255,69,0,.09) 1px,transparent 1px);background-size:40px 40px;mask-image:radial-gradient(ellipse 80% 100% at 20% 0%,black,transparent)}
        .ltv-header-glow{position:absolute;top:-40px;left:0;width:400px;height:240px;background:radial-gradient(ellipse,rgba(255,69,0,.15) 0%,transparent 70%);pointer-events:none}
        .ltv-header-inner{position:relative;z-index:1;max-width:1100px;margin:0 auto}
        .ltv-title{font-family:'Orbitron',sans-serif;font-size:clamp(1.3rem,3.5vw,2.2rem);font-weight:900;color:#fff0e8;margin:0 0 .3rem;text-shadow:0 0 24px rgba(255,69,0,.2)}
        .ltv-subtitle{font-size:.78rem;color:#7a3a10;font-weight:500;margin-bottom:.3rem}
        .ltv-week-tag{display:inline-block;font-family:'Orbitron',sans-serif;font-size:.58rem;letter-spacing:.16em;color:#ff8c00;border:1px solid rgba(255,140,0,.3);border-radius:4px;padding:.18rem .5rem}
        .ltv-body{max-width:1100px;margin:0 auto;padding:1.8rem 2rem 4rem}
        .ltv-no-draft{text-align:center;color:#7a3a10;font-size:.9rem;padding:3rem 1rem;font-weight:500}
        /* Score strip */
        .ltv-score-strip{display:flex;align-items:center;background:#2e1200;border:1px solid #3a1800;border-radius:10px;padding:.6rem 1rem;margin-bottom:1.2rem;overflow-x:auto;scrollbar-width:none}
        .ltv-score-strip::-webkit-scrollbar{display:none}
        .ltv-ss-block{text-align:center;padding:0 .8rem;flex-shrink:0}
        .ltv-ss-num{font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:900;color:#ffd4a8;line-height:1}
        .ltv-ss-label{font-size:.48rem;letter-spacing:.16em;color:#7a3a10;margin-top:.1rem}
        .ltv-ss-div{width:1px;height:30px;background:#4a2000;flex-shrink:0}
        .ltv-ss-bonds{display:flex;flex-direction:column;gap:.1rem;padding:0 .8rem}
        .ltv-ss-bond{font-size:.68rem;color:#8a5030;font-weight:600;white-space:nowrap}
        /* Lock section */
        .ltv-lock-section{background:rgba(14,6,0,.85);border:1.5px solid rgba(200,160,32,.3);border-radius:10px;padding:.9rem 1rem;margin-bottom:1rem}
        .ltv-lock-eyebrow{font-family:'Orbitron',sans-serif;font-size:.55rem;letter-spacing:.2em;color:#c8a020;margin-bottom:.3rem}
        .ltv-lock-sub{font-size:.78rem;color:#8a5030;line-height:1.5;margin-bottom:.8rem}
        .ltv-lock-sub strong{color:#c8a020}
        .ltv-lock-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:.4rem;margin-bottom:.6rem}
        .ltv-lock-card{background:rgba(30,12,4,.9);border:1.5px solid #3a1008;border-radius:7px;padding:.5rem .4rem;cursor:pointer;text-align:center;transition:.15s}
        .ltv-lock-card:hover{border-color:var(--rc,#ff6b35)}
        .ltv-lock-card.selected{border-color:var(--rc,#c8a020);background:rgba(200,160,32,.08);box-shadow:0 0 10px rgba(200,160,32,.2)}
        .ltv-lc-pos{font-family:'Rajdhani',sans-serif;font-size:.6rem;font-weight:700;color:#6a3820;letter-spacing:.1em}
        .ltv-lc-name{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.78rem;color:#f0d8c8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ltv-lc-score{font-family:'Orbitron',sans-serif;font-size:.68rem;font-weight:800}
        .ltv-lock-btn{width:100%;background:linear-gradient(135deg,#4a2000,#8a4000,#c87020);border:none;border-radius:8px;padding:.75rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:.12em;color:#fff5ee;cursor:pointer;transition:.2s;margin-top:.4rem;display:block}
        .ltv-lock-btn:hover{filter:brightness(1.1)}
        .ltv-lock-warning{background:rgba(60,20,0,.9);border:1px solid rgba(200,160,32,.4);border-radius:8px;padding:.8rem;margin-top:.5rem}
        .ltv-lw-msg{font-size:.8rem;color:#c8a020;margin-bottom:.6rem;font-weight:600}
        .ltv-lw-btns{display:flex;gap:.4rem}
        .ltv-lw-confirm{flex:1;background:rgba(200,160,32,.2);border:1.5px solid #c8a020;color:#c8a020;border-radius:6px;padding:.5rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.8rem;cursor:pointer;transition:.15s}
        .ltv-lw-confirm:hover:not(:disabled){background:rgba(200,160,32,.35)}
        .ltv-lw-confirm:disabled{opacity:.5}
        .ltv-lw-cancel{flex:1;background:transparent;border:1px solid #3a1008;color:#6a3820;border-radius:6px;padding:.5rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.8rem;cursor:pointer;transition:.15s}
        .ltv-lw-cancel:hover{border-color:#6a3820;color:#f0d8c8}
        .ltv-lock-done{background:rgba(30,20,4,.8);border:1px solid rgba(200,160,32,.25);border-radius:8px;padding:.7rem 1rem;margin-bottom:1rem;font-size:.82rem;color:#c8a020;font-family:'Rajdhani',sans-serif;font-weight:600}
        /* Dual columns */
        .ltv-dual-cols{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
        .ltv-dual-col{display:flex;flex-direction:column;gap:.25rem}
        .ltv-col-hdr{display:flex;align-items:center;gap:.4rem;font-family:'Orbitron',sans-serif;font-size:.55rem;letter-spacing:.16em;color:#7a3a10;margin-bottom:.3rem;padding-bottom:.35rem;border-bottom:1px solid #3a1800}
        .ltv-col-hdr-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
        /* Row cards */
        .ltv-row{display:flex;align-items:center;gap:.45rem;background:#2e1200;border:1px solid #3a1800;border-radius:7px;padding:.4rem .5rem;min-height:42px;overflow:hidden;transition:.12s}
        .ltv-row:hover:not(.empty){border-color:#4a2000}
        .ltv-row.is-locked{border-color:rgba(200,160,32,.3);background:rgba(38,22,0,.9)}
        .ltv-row.locked-slot{border-color:rgba(40,220,120,.25);background:rgba(4,18,8,.9)}
        .ltv-row.empty{opacity:.25;border-style:dashed;color: #f0d8c8}
        .ltv-row.lock-open{opacity:.18;border-style:dashed;border-color:rgba(40,220,120,.3)}
        .ltv-row-pos{font-family:'Orbitron',sans-serif;font-size:.48rem;font-weight:800;letter-spacing:.08em;color: #f0d8c8;width:2rem;flex-shrink:0;text-align:center}
        .ltv-row-art{width:30px;height:30px;border-radius:4px;flex-shrink:0;position:relative;overflow:hidden}
        .ltv-row-img{position:absolute;bottom:0;left:50%;transform:translateX(-50%);height:130%;width:auto;object-fit:contain;object-position:center bottom;z-index:2}
        .ltv-row-info{flex:1;min-width:0}
        .ltv-row-name{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ltv-row-meta{font-size:.52rem;color:#f0d8c8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500}
        .ltv-row-score{font-family:'Orbitron',sans-serif;font-size:.68rem;font-weight:800;flex-shrink:0}
        .ltv-row-lock{font-size:.65rem;flex-shrink:0}
        .ltv-row-empty{font-size:.7rem;color: #f0d8c8;flex:1;letter-spacing:.08em;font-weight:600;padding:.4rem .5rem;min-height:31.8px}
        .ltv-row-empty.open{color: #f0d8c8;font-family:'Orbitron',sans-serif;font-size:.46rem;letter-spacing:.12em}
        @media(max-width:700px){
          .ltv-dual-cols{grid-template-columns:1fr}
          .ltv-body{padding:1.4rem 1rem 3rem}
          .ltv-nav{padding:.8rem 1rem}
          .ltv-header{padding:1.5rem 1rem 1.2rem}
        }
      `}</style>
    </>
  );
}