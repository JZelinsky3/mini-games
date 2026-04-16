'use client';
// nfl-minigames-hub/app/games/pack-empire/offense/league/[leagueId]/champion/page.tsx

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getLeague } from '@/lib/league/db';

const supabase = createClient();

type Rarity = 'common' | 'rare' | 'dynasty' | 'transcendent' | 'immortal';
interface Player { id: string; name: string; pos: string; team: string; score: number; rarity: Rarity; }
interface Member {
  id: string; user_id: string; team_name: string | null; team_score: number;
  playoff_score: number; playoff_active: boolean; playoff_seed: number | null;
  permanent_locks: Player[]; profiles: { username: string } | null;
}

export default function ChampionPage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const router = useRouter();
  const [league, setLeague] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingNew, setStartingNew] = useState(false);
  const [newSeasonMsg, setNewSeasonMsg] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      setMyUserId(user.id);

      const lg = await getLeague(leagueId);
      if (!lg) { router.replace(`/games/pack-empire/offense/league/${leagueId}`); return; }
      // Only show this page when season is complete
      if (lg.phase !== 'complete') { router.replace(`/games/pack-empire/offense/league/${leagueId}`); return; }
      setLeague(lg);

      const { data: mems } = await supabase
        .from('league_members')
        .select('*, profiles(username)')
        .eq('league_id', leagueId)
        .order('playoff_score', { ascending: false });
      setMembers((mems ?? []) as Member[]);
      setLoading(false);
    })();
  }, [leagueId]);

  async function handleNewSeason() {
    if (startingNew) return;
    setStartingNew(true);
    setNewSeasonMsg('');
    try {
      const res = await fetch('/api/new-season', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId }),
      });
      const data = await res.json();
      if (data.ok) {
        setNewSeasonMsg(`✓ Season ${data.season_number} starting!`);
        setTimeout(() => router.push(`/games/pack-empire/offense/league/${leagueId}`), 1200);
      } else {
        setNewSeasonMsg(`Error: ${data.error}`);
        setStartingNew(false);
      }
    } catch {
      setNewSeasonMsg('Network error');
      setStartingNew(false);
    }
  }

  if (loading) return <div className="pec-loading"><div className="pec-spinner" /></div>;
  if (!league) return null;

  const isCommissioner = league.commissioner_id === myUserId;
  const champion = members[0];
  const champName = champion?.team_name ?? (champion?.profiles as any)?.username ?? 'Champion';

  const medalClass = (i: number) => i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'other';
  const medalIcon  = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
  const podiumTag  = (m: Member) => {
    if (!m.playoff_active && m.playoff_seed == null) return 'ELIMINATED';
    if (m === champion) return 'CHAMPION';
    if (m.playoff_active) return 'FINALIST';
    return 'ELIMINATED';
  };

  return (
    <>
      <div className="pec-root">
        {/* Particles */}
        <div className="pec-particles" id="pec-particles" />
        <div className="pec-grid" />
        <div className="pec-radial" />
        <div className="pec-scanline" />

        {/* Nav */}
        <nav className="pec-nav">
          <Link href={`/games/pack-empire/offense/league/${leagueId}`} className="pec-back">
            ← {league.name}
          </Link>
          <div className="pec-nav-mid">
            <span className="pec-nav-dot" />
            <span>SEASON {league.season_number} COMPLETE</span>
          </div>
          <div />
        </nav>

        {/* Hero */}
        <div className="pec-hero">
          <div className="pec-crown">🏆</div>
          <div className="pec-season-label">PACK EMPIRE · SEASON {league.season_number}</div>
          <div className="pec-champ-title">LEAGUE CHAMPION</div>
          <div className="pec-champ-name">{champName}</div>
          {champion?.team_name && (
            <div className="pec-champ-username">{(champion.profiles as any)?.username}</div>
          )}

          {/* Trophy card */}
          <div className="pec-trophy-card">
            <div className="pec-card-streak" />
            <div className="pec-stats">
              <div className="pec-stat">
                <div className="pec-stat-num">{(champion?.team_score ?? 0).toLocaleString()}</div>
                <div className="pec-stat-label">REG SEASON PTS</div>
              </div>
              <div className="pec-stat-div" />
              <div className="pec-stat">
                <div className="pec-stat-num">{(champion?.playoff_score ?? 0).toLocaleString()}</div>
                <div className="pec-stat-label">PLAYOFF PTS</div>
              </div>
              <div className="pec-stat-div" />
              <div className="pec-stat">
                <div className="pec-stat-num">{(champion?.permanent_locks as any[])?.length ?? 0}</div>
                <div className="pec-stat-label">LOCKED PLAYERS</div>
              </div>
            </div>
          </div>
        </div>

        {/* Podium */}
        <div className="pec-podium">
          <div className="pec-podium-label">FINAL STANDINGS</div>
          <div className="pec-podium-list">
            {members.map((m, i) => {
              const name = m.team_name ?? (m.profiles as any)?.username ?? 'Player';
              const cls  = medalClass(i);
              return (
                <Link
                  key={m.id}
                  href={`/games/pack-empire/offense/league/${leagueId}/team/${m.user_id}`}
                  className={`pec-podium-row ${cls}`}
                >
                  <div className="pec-podium-medal">{medalIcon(i)}</div>
                  <div className="pec-podium-name">{name}</div>
                  <div className="pec-podium-score">
                    {(m.playoff_score ?? 0) > 0
                      ? (m.playoff_score).toLocaleString()
                      : (m.team_score ?? 0).toLocaleString()}
                  </div>
                  <div className={`pec-podium-tag ${cls}`}>{podiumTag(m)}</div>
                  <div className="pec-podium-arrow">›</div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="pec-actions">
          {isCommissioner && (
            <>
              <button className="pec-btn-new" onClick={handleNewSeason} disabled={startingNew}>
                {startingNew ? 'STARTING…' : `🏈 START SEASON ${(league.season_number ?? 1) + 1}`}
              </button>
              {newSeasonMsg && <div className="pec-new-msg">{newSeasonMsg}</div>}
            </>
          )}
          <Link href={`/games/pack-empire/offense/league/${leagueId}/team/${champion?.user_id}`}
            className="pec-btn-team">
            VIEW CHAMPION'S TEAM
          </Link>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;800;900&family=Rajdhani:wght@500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}

        .pec-loading{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0e0400}
        .pec-spinner{width:32px;height:32px;border:2px solid #4a2000;border-top-color:#ffd700;border-radius:50%;animation:pec-spin .8s linear infinite}

        .pec-root{font-family:'Rajdhani',sans-serif;background:#0e0400;min-height:100vh;position:relative;overflow:hidden;color:#ffd4a8}

        .pec-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,140,0,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,140,0,.06) 1px,transparent 1px);background-size:40px 40px;mask-image:radial-gradient(ellipse 90% 60% at 50% 0%,black,transparent);pointer-events:none}
        .pec-radial{position:absolute;inset:0;background:radial-gradient(ellipse 70% 45% at 50% 0%,rgba(255,140,0,.22),transparent 70%);pointer-events:none}
        .pec-scanline{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(255,215,0,.6),transparent);animation:pec-scan 4s linear infinite;pointer-events:none}

        @keyframes pec-spin{to{transform:rotate(360deg)}}
        @keyframes pec-scan{0%{top:-2px;opacity:0}5%{opacity:1}95%{opacity:.5}100%{top:100%;opacity:0}}
        @keyframes pec-crown{0%,100%{transform:scale(1) rotate(-2deg)}50%{transform:scale(1.1) rotate(2deg)}}
        @keyframes pec-fadeup{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pec-streak{0%{left:-80%}100%{left:160%}}
        @keyframes pec-border{0%{background-position:0% 50%}100%{background-position:200% 50%}}
        @keyframes pec-particle{0%{transform:translateY(0) scale(1);opacity:0}10%{opacity:1}90%{opacity:.5}100%{transform:translateY(-800px) scale(0);opacity:0}}
        @keyframes pec-pulse{0%,100%{box-shadow:0 0 20px rgba(255,215,0,.3)}50%{box-shadow:0 0 50px rgba(255,215,0,.6)}}

        /* Nav */
        .pec-nav{display:flex;align-items:center;justify-content:space-between;padding:.8rem 2rem;position:relative;z-index:10;border-bottom:1px solid rgba(255,140,0,.15)}
        .pec-back{color:#7a3a10;font-size:.82rem;letter-spacing:.1em;font-weight:600;text-decoration:none;transition:.15s;font-family:'Rajdhani',sans-serif}
        .pec-back:hover{color:#ff8c00}
        .pec-nav-mid{display:flex;align-items:center;gap:.4rem;font-family:'Orbitron',sans-serif;font-size:.58rem;letter-spacing:.18em;color:#7a3a10}
        .pec-nav-dot{width:6px;height:6px;border-radius:50%;background:#ffd700;box-shadow:0 0 6px #ffd700;flex-shrink:0}

        /* Hero */
        .pec-hero{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;padding:2rem 1rem 1.5rem;text-align:center}
        .pec-crown{font-size:4rem;animation:pec-crown 3s ease-in-out infinite;filter:drop-shadow(0 0 24px rgba(255,215,0,.8));margin-bottom:.4rem;display:block}
        .pec-season-label{font-family:'Orbitron',sans-serif;font-size:.55rem;letter-spacing:.28em;color:#ff8c00;margin-bottom:.4rem;animation:pec-fadeup .5s ease both}
        .pec-champ-title{font-family:'Orbitron',sans-serif;font-size:clamp(.9rem,3vw,1.3rem);font-weight:900;color:#ffd700;letter-spacing:.2em;text-shadow:0 0 30px rgba(255,215,0,.5);animation:pec-fadeup .6s .08s ease both;margin-bottom:.2rem}
        .pec-champ-name{font-family:'Orbitron',sans-serif;font-size:clamp(1.8rem,7vw,3.2rem);font-weight:900;color:#fff0e8;letter-spacing:.06em;text-shadow:0 0 40px rgba(255,140,0,.4);animation:pec-fadeup .7s .15s ease both;line-height:1.1;margin-bottom:.15rem}
        .pec-champ-username{font-size:.85rem;color:#7a3a10;letter-spacing:.12em;font-weight:600;animation:pec-fadeup .7s .2s ease both;margin-bottom:.9rem}

        /* Trophy card */
        .pec-trophy-card{position:relative;background:linear-gradient(135deg,#1c0800,#2e1200);border-radius:14px;padding:1.1rem 2rem;overflow:hidden;animation:pec-fadeup .8s .25s ease both;animation-fill-mode:both;margin-bottom:.5rem}
        .pec-trophy-card::before{content:'';position:absolute;inset:0;border-radius:14px;padding:2px;background:linear-gradient(135deg,#ffd700,#ff8c00,#ffd700,#cc2200,#ffd700);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:destination-out;mask-composite:exclude;background-size:200% 200%;animation:pec-border 3s linear infinite}
        .pec-trophy-card{animation:pec-fadeup .8s .25s ease both,pec-pulse 3s 1s ease-in-out infinite;animation-fill-mode:both}
        .pec-card-streak{position:absolute;top:0;bottom:0;width:35%;background:linear-gradient(90deg,transparent,rgba(255,215,0,.12),transparent);animation:pec-streak 4s ease-in-out infinite;pointer-events:none}
        .pec-stats{display:flex;gap:0;align-items:center;position:relative;z-index:1}
        .pec-stat{text-align:center;padding:0 1.2rem}
        .pec-stat-num{font-family:'Orbitron',sans-serif;font-size:1.4rem;font-weight:900;color:#ffd700;line-height:1}
        .pec-stat-label{font-size:.5rem;letter-spacing:.16em;color:#7a3a10;margin-top:.2rem;white-space:nowrap}
        .pec-stat-div{width:1px;height:36px;background:rgba(255,140,0,.2);flex-shrink:0}

        /* Podium */
        .pec-podium{position:relative;z-index:2;padding:1rem 1rem 0;animation:pec-fadeup .9s .35s ease both;animation-fill-mode:both;max-width:560px;margin:0 auto;width:100%}
        .pec-podium-label{font-family:'Orbitron',sans-serif;font-size:.55rem;letter-spacing:.2em;color:#4a2000;text-align:center;margin-bottom:.7rem}
        .pec-podium-list{display:flex;flex-direction:column;gap:.35rem}
        .pec-podium-row{display:flex;align-items:center;gap:.7rem;border-radius:8px;padding:.55rem .9rem;text-decoration:none;transition:.12s}
        .pec-podium-row.gold{background:rgba(255,215,0,.07);border:1px solid rgba(255,215,0,.35)}
        .pec-podium-row.silver{background:rgba(192,192,192,.04);border:1px solid rgba(192,192,192,.2)}
        .pec-podium-row.bronze{background:rgba(205,127,50,.04);border:1px solid rgba(205,127,50,.18)}
        .pec-podium-row.other{background:#1c0800;border:1px solid #2e1200;opacity:.5}
        .pec-podium-row:hover:not(.other){filter:brightness(1.1)}
        .pec-podium-medal{font-size:.95rem;flex-shrink:0;width:1.6rem;text-align:center;font-family:'Orbitron',sans-serif;color:#4a2000;font-size:.75rem;font-weight:800}
        .pec-podium-name{flex:1;font-weight:700;font-size:.92rem}
        .pec-podium-row.gold .pec-podium-name{color:#ffd700}
        .pec-podium-row.silver .pec-podium-name{color:#c0c0c0}
        .pec-podium-row.bronze .pec-podium-name{color:#cd7f32}
        .pec-podium-row.other .pec-podium-name{color:#4a2000}
        .pec-podium-score{font-family:'Orbitron',sans-serif;font-size:.78rem;font-weight:800;flex-shrink:0}
        .pec-podium-row.gold .pec-podium-score{color:#ffd700}
        .pec-podium-row:not(.gold) .pec-podium-score{color:#7a3a10}
        .pec-podium-tag{font-size:.52rem;letter-spacing:.1em;border-radius:3px;padding:.1rem .35rem;flex-shrink:0;font-weight:700}
        .pec-podium-tag.gold{color:#ffd700;border:1px solid rgba(255,215,0,.4);background:rgba(255,215,0,.08)}
        .pec-podium-tag.silver{color:#a0a0a0;border:1px solid rgba(192,192,192,.25)}
        .pec-podium-tag.bronze{color:#cd7f32;border:1px solid rgba(205,127,50,.2)}
        .pec-podium-tag.other{color:#3a1808;border:1px solid #2a1008}
        .pec-podium-arrow{color:#4a2000;font-size:1rem;flex-shrink:0}
        .pec-podium-row:hover .pec-podium-arrow{color:#ff8c00}

        /* Actions */
        .pec-actions{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:.6rem;padding:1.5rem 1rem 3rem;animation:pec-fadeup 1s .45s ease both;animation-fill-mode:both}
        .pec-btn-new{background:linear-gradient(135deg,#8a2000,#cc2200,#ff6b35);color:#fff0e8;border:none;border-radius:10px;padding:.85rem 2rem;font-family:'Orbitron',sans-serif;font-weight:800;font-size:.78rem;letter-spacing:.14em;cursor:pointer;transition:.2s;width:100%;max-width:380px}
        .pec-btn-new:hover:not(:disabled){filter:brightness(1.1);transform:scale(1.01)}
        .pec-btn-new:disabled{opacity:.5;cursor:default}
        .pec-btn-team{display:block;text-align:center;text-decoration:none;background:transparent;border:1.5px solid #4a2000;color:#7a3a10;border-radius:10px;padding:.75rem 2rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.85rem;letter-spacing:.12em;cursor:pointer;transition:.2s;width:100%;max-width:380px}
        .pec-btn-team:hover{border-color:#ff8c00;color:#ff8c00}
        .pec-new-msg{font-size:.78rem;color:#ff8c00;font-family:'Rajdhani',sans-serif;font-weight:600}

        /* Particles (JS-injected) */
        .pec-particle{position:absolute;border-radius:50%;pointer-events:none;animation:pec-particle linear infinite}

        @media(max-width:600px){
          .pec-stat{padding:0 .7rem}
          .pec-stat-num{font-size:1.1rem}
          .pec-trophy-card{padding:.9rem 1rem}
          .pec-nav{padding:.8rem 1rem}
          .pec-hero{padding:1.5rem .8rem 1.2rem}
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var root = document.querySelector('.pec-root');
          var colors = ['#ffd700','#ff8c00','#ff4500','#ffaa00','#fff0a0'];
          for (var i = 0; i < 32; i++) {
            var p = document.createElement('div');
            p.className = 'pec-particle';
            var size = 2 + Math.random() * 4;
            var delay = Math.random() * 5;
            var dur = 4 + Math.random() * 6;
            p.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (Math.random()*100) + '%;bottom:' + (Math.random()*15) + '%;background:' + colors[Math.floor(Math.random()*colors.length)] + ';opacity:' + (.4+Math.random()*.6) + ';animation-duration:' + dur + 's;animation-delay:' + delay + 's;z-index:1;pointer-events:none;position:absolute;border-radius:50%';
            if (root) root.appendChild(p);
          }
        })();
      `}} />
    </>
  );
}