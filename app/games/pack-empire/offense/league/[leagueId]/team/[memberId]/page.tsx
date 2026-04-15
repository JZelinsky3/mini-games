'use client';
// nfl-minigames-hub/app/games/pack-empire/offense/league/[leagueId]/team/[memberId]/page.tsx

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getLeague } from '@/lib/league/db';
import type { DBLeague } from '@/lib/league/db';
import { chemistryLabel } from '@/lib/league';

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

// Slot order for display
const SLOTS = [
  { key: 'QB',  pos: 'QB' }, { key: 'RB',  pos: 'RB' },
  { key: 'WR1', pos: 'WR' }, { key: 'WR2', pos: 'WR' }, { key: 'WR3', pos: 'WR' },
  { key: 'TE',  pos: 'TE' }, { key: 'LT',  pos: 'OT' }, { key: 'LG',  pos: 'OG' },
  { key: 'C',   pos: 'C'  }, { key: 'RG',  pos: 'OG' }, { key: 'RT',  pos: 'OT' },
];

export default function TeamViewPage() {
  const supabase = createClient();
  const { leagueId, memberId } = useParams<{ leagueId: string; memberId: string }>();
  const router = useRouter();

  const [league, setLeague]         = useState<DBLeague | null>(null);
  const [draft, setDraft]           = useState<any | null>(null);
  const [lockedIds, setLockedIds]   = useState<string[]>([]);
  const [teamName, setTeamName]     = useState('');
  const [username, setUsername]     = useState('');
  const [loading, setLoading]       = useState(true);
  const [myUserId, setMyUserId]     = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // Auth guard
      if (!user) { router.replace('/login'); return; }
      setMyUserId(user.id);

      const lg = await getLeague(leagueId);
      setLeague(lg);
      if (!lg) { setLoading(false); return; }

      // Profile + membership in parallel
      const [profileRes, membershipRes] = await Promise.all([
        supabase.from('profiles').select('username').eq('id', memberId).single(),
        supabase.from('league_members').select('permanent_locks, team_name')
          .eq('league_id', leagueId).eq('user_id', memberId).single(),
      ]);
      setUsername(profileRes.data?.username ?? 'Player');
      setTeamName(membershipRes.data?.team_name ?? '');
      const locks = (membershipRes.data?.permanent_locks as Player[]) ?? [];
      setLockedIds(locks.map(p => p.id));

      // Most recent revealed draft
      const revealedWeek = lg.phase === 'regular'
        ? lg.current_week - 1 : lg.current_week;
      if (revealedWeek >= 1) {
        const { data: draftRow } = await supabase
          .from('league_drafts')
          .select('*')
          .eq('league_id', leagueId)
          .eq('user_id', memberId)
          .eq('week_number', revealedWeek)
          .single();
        setDraft(draftRow ?? null);
      }
      setLoading(false);
    })();
  }, [leagueId, memberId]);

  if (loading) return (
    <div className="ltv-loading"><div className="ltv-spinner" /></div>
  );
  if (!league) return <div className="ltv-loading">League not found.</div>;

  const isMe      = myUserId === memberId;
  const roster: Player[] = draft?.roster ?? [];
  const chem      = draft?.chemistry ?? null;

  // Assign players to slots by position pool, in order
  const posQueues: Record<string, Player[]> = {};
  for (const p of roster) {
    if (!posQueues[p.pos]) posQueues[p.pos] = [];
    posQueues[p.pos].push(p);
  }
  const posCounters: Record<string, number> = {};
  const slotPlayers: (Player | null)[] = SLOTS.map(slot => {
    const pool = slot.pos;
    if (!posCounters[pool]) posCounters[pool] = 0;
    const q = posQueues[pool] ?? [];
    return q[posCounters[pool]++] ?? null;
  });

  const displayTitle = teamName
    ? teamName
    : isMe ? 'YOUR LINEUP' : `${username}'s LINEUP`;

  return (
    <>
      <div className="ltv-root">

        {/* Nav */}
        <nav className="ltv-nav">
          <Link href={`/games/pack-empire/offense/league/${leagueId}`} className="ltv-back">
            ← {league.name}
          </Link>
          <div className="ltv-nav-mid">
            <span className="ltv-nav-dot" />
            <span>{isMe ? 'MY LINEUP' : 'TEAM VIEW'}</span>
          </div>
          <div />
        </nav>

        {/* Header */}
        <div className="ltv-header">
          <div className="ltv-header-bg">
            <div className="ltv-header-grid" />
            <div className="ltv-header-glow" />
          </div>
          <div className="ltv-header-inner">
            <h1 className="ltv-title">{displayTitle}</h1>
            {teamName && <div className="ltv-subtitle">{username}</div>}
            {draft && (
              <div className="ltv-week-tag">
                WEEK {draft.week_number} · {draft.phase?.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className="ltv-body">
          {!draft ? (
            <div className="ltv-no-draft">
              {league.phase === 'pregame'
                ? 'Season hasn\'t started yet.'
                : 'No revealed draft for this week yet — check back after midnight.'}
            </div>
          ) : (
            <div className="ltv-cols">

              {/* Left — scores + chemistry */}
              <div className="ltv-col-left">
                <div className="ltv-score-card">
                  <div className="ltv-score-row">
                    <div className="ltv-score-block main">
                      <div className="ltv-score-num">{draft.final_score?.toLocaleString()}</div>
                      <div className="ltv-score-label">FINAL SCORE</div>
                    </div>
                  </div>
                  <div className="ltv-score-breakdown">
                    <div className="ltv-sbd-row">
                      <span className="ltv-sbd-key">Draft score</span>
                      <span className="ltv-sbd-val">{draft.draft_score?.toLocaleString()}</span>
                    </div>
                    {chem && (
                      <div className="ltv-sbd-row">
                        <span className="ltv-sbd-key">Chemistry</span>
                        <span className="ltv-sbd-val"
                          style={{ color: chem.totalChemPoints >= 0 ? '#ff8c00' : '#ff6060' }}>
                          {chem.totalChemPoints >= 0 ? '+' : ''}{chem.totalChemPoints?.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chemistry bonds */}
                {chem?.bonds?.length > 0 && (
                  <div className="ltv-chem-card">
                    <div className="ltv-chem-title">CHEMISTRY</div>
                    {chem.bonds.map((bond: any, i: number) => (
                      <div key={i} className="ltv-chem-row">
                        <span className="ltv-chem-icon">
                          {bond.type === 'synergy' ? '⚡' : '⚔️'}
                        </span>
                        <span className="ltv-chem-reason">{bond.reason}</span>
                        <span className="ltv-chem-pts"
                          style={{ color: bond.points >= 0 ? '#ff8c00' : '#ff6060' }}>
                          {bond.points >= 0 ? '+' : ''}{bond.points}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right — roster grid */}
              <div className="ltv-col-right">
                <div className="ltv-roster-label">ROSTER</div>
                <div className="ltv-roster-grid">
                  {SLOTS.map((slot, idx) => {
                    const player  = slotPlayers[idx];
                    const locked  = player ? lockedIds.includes(player.id) : false;
                    const rc      = player ? RC[player.rarity] ?? RC.common : null;
                    return (
                      <div
                        key={slot.key}
                        className={`ltv-card${locked ? ' locked' : ''}${!player ? ' empty' : ''}`}
                        style={locked ? { '--lc': '#c8a020' } as React.CSSProperties : undefined}
                      >
                        {locked && <div className="ltv-lock-badge">🔒</div>}
                        <div className="ltv-card-pos">{slot.key.replace(/\d/, '')}</div>
                        {player ? (
                          <>
                            <div className="ltv-card-art" style={{ background: rc!.art }} />
                            <div className="ltv-card-name">{player.name}</div>
                            <div className="ltv-card-team">{player.team}</div>
                            <div className="ltv-card-score" style={{ color: rc!.color }}>
                              {player.score.toLocaleString()}
                            </div>
                            <div className="ltv-card-rarity" style={{ color: rc!.color }}>
                              {player.rarity.toUpperCase()}
                            </div>
                          </>
                        ) : (
                          <div className="ltv-card-empty">—</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@700;800;900&display=swap');

        *{box-sizing:border-box}
        .ltv-root{font-family:'Rajdhani',sans-serif;color:#ffd4a8;background:#1c0a00;min-height:100vh}

        .ltv-loading{display:flex;align-items:center;justify-content:center;min-height:50vh;background:#1c0a00;color:#7a3a10;font-family:'Rajdhani',sans-serif}
        .ltv-spinner{width:30px;height:30px;border:2px solid #4a2000;border-top-color:#ff4500;border-radius:50%;animation:ltv-spin .8s linear infinite}
        @keyframes ltv-spin{to{transform:rotate(360deg)}}

        /* Nav */
        .ltv-nav{display:flex;align-items:center;justify-content:space-between;padding:.8rem 2rem;background:rgba(28,10,0,.98);border-bottom:1px solid #4a2000;position:sticky;top:0;z-index:40;font-family:'Rajdhani',sans-serif}
        .ltv-back{color:#7a3a10;font-size:.82rem;letter-spacing:.1em;font-weight:600;text-decoration:none;transition:.15s}
        .ltv-back:hover{color:#ff8c00}
        .ltv-nav-mid{display:flex;align-items:center;gap:.4rem;font-family:'Orbitron',sans-serif;font-size:.6rem;letter-spacing:.18em;color:#7a3a10}
        .ltv-nav-dot{width:6px;height:6px;border-radius:50%;background:#ff4500;box-shadow:0 0 5px #ff4500;flex-shrink:0}

        /* Header */
        .ltv-header{position:relative;overflow:hidden;padding:1.8rem 2rem 1.4rem;border-bottom:1px solid #2e1200}
        .ltv-header-bg{position:absolute;inset:0;background:linear-gradient(180deg,#2e1200,#1c0a00)}
        .ltv-header-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,69,0,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(255,69,0,.09) 1px,transparent 1px);background-size:40px 40px;mask-image:radial-gradient(ellipse 80% 100% at 20% 0%,black,transparent)}
        .ltv-header-glow{position:absolute;top:-40px;left:0;width:400px;height:240px;background:radial-gradient(ellipse,rgba(255,69,0,.15) 0%,transparent 70%);pointer-events:none}
        .ltv-header-inner{position:relative;z-index:1;max-width:1100px;margin:0 auto}
        .ltv-title{font-family:'Orbitron',sans-serif;font-size:clamp(1.3rem,3.5vw,2.2rem);font-weight:900;color:#fff0e8;margin:0 0 .3rem;text-shadow:0 0 24px rgba(255,69,0,.2)}
        .ltv-subtitle{font-size:.78rem;color:#7a3a10;font-weight:500;margin-bottom:.3rem}
        .ltv-week-tag{display:inline-block;font-family:'Orbitron',sans-serif;font-size:.58rem;letter-spacing:.16em;color:#ff8c00;border:1px solid rgba(255,140,0,.3);border-radius:4px;padding:.18rem .5rem}

        /* Body */
        .ltv-body{max-width:1100px;margin:0 auto;padding:1.8rem 2rem 4rem}
        .ltv-no-draft{text-align:center;color:#7a3a10;font-size:.9rem;padding:3rem 1rem;font-weight:500}

        /* Two cols */
        .ltv-cols{display:grid;grid-template-columns:280px 1fr;gap:1.4rem;align-items:start}
        .ltv-col-left{display:flex;flex-direction:column;gap:1rem}

        /* Score card */
        .ltv-score-card{background:#2e1200;border:1.5px solid rgba(255,140,0,.25);border-radius:12px;padding:1.1rem;position:relative;overflow:hidden}
        .ltv-score-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#ff4500,#ff8c00)}
        .ltv-score-row{margin-bottom:.8rem}
        .ltv-score-block.main .ltv-score-num{font-family:'Orbitron',sans-serif;font-size:2rem;font-weight:900;color:#ff8c00;line-height:1;text-shadow:0 0 16px rgba(255,140,0,.3)}
        .ltv-score-label{font-size:.6rem;letter-spacing:.18em;color:#7a3a10;margin-top:.15rem}
        .ltv-score-breakdown{border-top:1px solid #3a1800;padding-top:.7rem;display:flex;flex-direction:column;gap:.3rem}
        .ltv-sbd-row{display:flex;justify-content:space-between;align-items:center}
        .ltv-sbd-key{font-size:.78rem;color:#7a3a10;font-weight:600}
        .ltv-sbd-val{font-family:'Orbitron',sans-serif;font-size:.78rem;font-weight:800;color:#ffd4a8}

        /* Chemistry card */
        .ltv-chem-card{background:#2e1200;border:1px solid #4a2000;border-radius:10px;padding:.9rem 1rem}
        .ltv-chem-title{font-family:'Orbitron',sans-serif;font-size:.58rem;letter-spacing:.2em;color:#ff4500;margin-bottom:.6rem}
        .ltv-chem-row{display:flex;align-items:center;gap:.5rem;padding:.25rem 0;border-bottom:1px solid #2e1200}
        .ltv-chem-row:last-child{border-bottom:none}
        .ltv-chem-icon{font-size:.82rem;flex-shrink:0}
        .ltv-chem-reason{flex:1;font-size:.78rem;color:#7a3a10;font-weight:600}
        .ltv-chem-pts{font-family:'Orbitron',sans-serif;font-size:.72rem;font-weight:800;flex-shrink:0}

        /* Roster grid */
        .ltv-col-right{}
        .ltv-roster-label{font-family:'Orbitron',sans-serif;font-size:.6rem;letter-spacing:.2em;color:#7a3a10;margin-bottom:.7rem;display:flex;align-items:center;gap:.6rem}
        .ltv-roster-label::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,#4a2000,transparent)}
        .ltv-roster-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:.5rem}

        .ltv-card{background:#2e1200;border:1px solid #3a1800;border-radius:10px;padding:.75rem .7rem;position:relative;overflow:hidden;transition:.15s;min-height:100px}
        .ltv-card:hover{border-color:#4a2000;background:#3a1800}
        .ltv-card.locked{border:2px solid var(--lc,#c8a020);box-shadow:0 0 10px rgba(200,160,32,.15)}
        .ltv-card.empty{opacity:.3}
        .ltv-lock-badge{position:absolute;top:.3rem;right:.35rem;font-size:.6rem}
        .ltv-card-pos{font-size:.58rem;letter-spacing:.14em;color:#4a2000;margin-bottom:.3rem;font-weight:700}
        .ltv-card-art{height:30px;border-radius:4px;margin-bottom:.35rem;opacity:.65}
        .ltv-card-name{font-weight:700;font-size:.85rem;color:#ffd4a8;line-height:1.2;margin-bottom:.15rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ltv-card-team{font-size:.65rem;color:#4a2000;margin-bottom:.3rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ltv-card-score{font-family:'Orbitron',sans-serif;font-size:.72rem;font-weight:800}
        .ltv-card-rarity{font-size:.55rem;letter-spacing:.1em;margin-top:.1rem}
        .ltv-card-empty{color:#2e1200;font-size:1rem;padding-top:.3rem}

        /* Responsive */
        @media(max-width:800px){
          .ltv-cols{grid-template-columns:1fr}
          .ltv-col-left{order:2}
          .ltv-col-right{order:1}
          .ltv-body{padding:1.4rem 1rem 3rem}
          .ltv-nav{padding:.8rem 1rem}
          .ltv-header{padding:1.5rem 1rem 1.2rem}
        }
        @media(max-width:500px){
          .ltv-roster-grid{grid-template-columns:repeat(auto-fill,minmax(110px,1fr))}
        }
      `}</style>
    </>
  );
}