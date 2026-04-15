'use client';
// nfl-minigames-hub/app/games/pack-empire/offense/league/[leagueId]/playoffs/page.tsx

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getLeague, getLeagueMembers, getMyMembership } from '@/lib/league/db';
import type { DBLeague, DBLeagueMember } from '@/lib/league/db';

const supabase = createClient();

interface PlayoffRound {
  id: string;
  round_number: number;
  round_type: 'gauntlet' | 'finals_game';
  participants: string[];        // user_ids
  eliminated: string | null;     // user_id
  game_winner: string | null;    // user_id
  completed_at: string | null;
  drafts?: GauntletDraft[];      // joined from league_drafts
}

interface GauntletDraft {
  user_id: string;
  final_score: number;
  draft_score: number;
  chemistry: any;
}

interface FinalsState {
  league_id: string;
  member_a: string;
  member_b: string;
  games: (string | null)[];  // 'A' | 'B' | null
  wins_a: number;
  wins_b: number;
  champion: string | null;
}

export default function PlayoffsPage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const router = useRouter();

  const [userId, setUserId]       = useState<string | null>(null);
  const [league, setLeague]       = useState<DBLeague | null>(null);
  const [members, setMembers]     = useState<DBLeagueMember[]>([]);
  const [me, setMe]               = useState<DBLeagueMember | null>(null);
  const [rounds, setRounds]       = useState<PlayoffRound[]>([]);
  const [finals, setFinals]       = useState<FinalsState | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      setUserId(user.id);

      const [lg, mems, membership] = await Promise.all([
        getLeague(leagueId),
        getLeagueMembers(leagueId),
        getMyMembership(leagueId, user.id),
      ]);

      if (!lg) { setLoading(false); return; }
      if (lg.phase !== 'gauntlet' && lg.phase !== 'finals' && lg.phase !== 'complete') {
        router.replace(`/games/pack-empire/offense/league/${leagueId}`);
        return;
      }

      setLeague(lg);
      setMembers(mems);
      setMe(membership ?? null);

      // Load playoff rounds
      const { data: roundData } = await supabase
        .from('league_playoff_rounds')
        .select('*')
        .eq('league_id', leagueId)
        .order('round_number', { ascending: true });

      // For each completed round, load draft scores
      const enrichedRounds: PlayoffRound[] = await Promise.all(
        (roundData ?? []).map(async (r: PlayoffRound) => {
          if (!r.completed_at || !r.participants?.length) return r;
          const { data: draftData } = await supabase
            .from('league_drafts')
            .select('user_id, final_score, draft_score, chemistry')
            .eq('league_id', leagueId)
            .in('user_id', r.participants)
            .eq('week_number', r.round_number)
            .eq('phase', r.round_type === 'gauntlet' ? 'gauntlet' : 'finals');
          return { ...r, drafts: draftData ?? [] };
        })
      );
      setRounds(enrichedRounds);

      // Load finals state
      const { data: finalsData } = await supabase
        .from('league_finals')
        .select('*')
        .eq('league_id', leagueId)
        .single();
      setFinals(finalsData ?? null);

      setLoading(false);
    })();
  }, [leagueId]);

  // ── Helpers ──────────────────────────────────────────────────────────
  const memberMap = Object.fromEntries(members.map(m => [m.user_id, m]));

  function displayName(uid: string) {
    const m = memberMap[uid];
    if (!m) return 'Unknown';
    return m.team_name ?? (m.profiles as any)?.username ?? 'Player';
  }

  function isEliminated(uid: string) {
    return rounds.some(r => r.eliminated === uid);
  }

  function isActive(uid: string) {
    return memberMap[uid]?.playoff_active === true;
  }

  const activeMembers  = members.filter(m => m.playoff_active);
  const seededMembers  = [...members]
    .filter(m => m.playoff_seed != null)
    .sort((a, b) => (a.playoff_seed ?? 99) - (b.playoff_seed ?? 99));

  const currentGauntletRound = league?.current_week ?? 1;
  const myRoundDraft = rounds.find(r =>
    r.round_number === currentGauntletRound && r.participants?.includes(userId ?? '')
  )?.drafts?.find(d => d.user_id === userId);
  const hasDraftedThisRound = !!myRoundDraft;
  const amActive = me?.playoff_active === true;
  const inFinals = finals && (finals.member_a === userId || finals.member_b === userId);

  if (loading) return (
    <div className="po-loading"><div className="po-spinner" /></div>
  );
  if (!league) return <div className="po-loading">League not found.</div>;

  return (
    <>
      <div className="po-root">

        {/* Nav */}
        <nav className="po-nav">
          <Link href={`/games/pack-empire/offense/league/${leagueId}`} className="po-back">
            ← {league.name}
          </Link>
          <div className="po-nav-mid">
            <span className="po-nav-dot" />
            <span className="po-nav-label">
              {league.phase === 'gauntlet' ? 'GAUNTLET' : league.phase === 'finals' ? 'FINALS' : 'PLAYOFFS'}
            </span>
          </div>
          <div />
        </nav>

        {/* Hero */}
        <div className="po-hero">
          <div className="po-hero-bg">
            <div className="po-hero-grid" />
            <div className="po-hero-glow" />
          </div>
          <div className="po-hero-inner">
            <div className="po-hero-eyebrow">
              {league.phase === 'complete' ? 'SEASON COMPLETE' : 'PLAYOFFS'}
            </div>
            <h1 className="po-hero-title">
              {league.phase === 'gauntlet' && 'GAUNTLET'}
              {league.phase === 'finals' && 'FINALS'}
              {league.phase === 'complete' && 'CHAMPION'}
            </h1>
            {league.phase === 'gauntlet' && (
              <p className="po-hero-sub">
                Everyone drafts. Lowest score is eliminated each round. Last two standing advance to finals.
              </p>
            )}
            {league.phase === 'finals' && (
              <p className="po-hero-sub">
                Best of 3. Highest score wins each session. First to 2 wins takes the championship.
              </p>
            )}
          </div>
        </div>

        <div className="po-body">

          {/* Champion banner */}
          {league.phase === 'complete' && finals?.champion && (
            <div className="po-champion">
              <div className="po-champ-trophy">🏆</div>
              <div className="po-champ-label">LEAGUE CHAMPION</div>
              <div className="po-champ-name">{displayName(finals.champion)}</div>
              {memberMap[finals.champion]?.team_name && (
                <div className="po-champ-username">
                  {(memberMap[finals.champion]?.profiles as any)?.username}
                </div>
              )}
            </div>
          )}

          <div className="po-cols">
            <div className="po-col-main">

              {/* My action card */}
              {(league.phase === 'gauntlet' || league.phase === 'finals') && me && (
                <div className={`po-my-card${amActive ? '' : ' eliminated'}`}>
                  <div className="po-my-card-top">
                    <div className={`po-my-status-dot${amActive ? ' active' : ''}`} />
                    <div className="po-my-status-label">
                      {amActive ? 'STILL IN IT' : 'ELIMINATED'}
                    </div>
                  </div>
                  {amActive && !hasDraftedThisRound && league.phase === 'gauntlet' && (
                    <>
                      <div className="po-my-prompt">
                        Round {currentGauntletRound} draft is open. Open your packs — lowest score this round goes home.
                      </div>
                      <Link
                        href={`/games/pack-empire/offense/league/${leagueId}/draft`}
                        className="po-draft-btn"
                      >
                        DRAFT NOW — ROUND {currentGauntletRound}
                      </Link>
                    </>
                  )}
                  {amActive && hasDraftedThisRound && league.phase === 'gauntlet' && (
                    <div className="po-drafted-msg">
                      ✓ Drafted this round · score: {myRoundDraft?.final_score?.toLocaleString()}
                      <br />
                      <span className="po-drafted-sub">Waiting for all players to finish…</span>
                    </div>
                  )}
                  {amActive && league.phase === 'finals' && inFinals && (
                    <>
                      <div className="po-my-prompt">
                        Finals — game {(finals?.games.findIndex(g => g === null) ?? 0) + 1} of 3.
                        First to 2 wins takes the championship.
                      </div>
                      <Link
                        href={`/games/pack-empire/offense/league/${leagueId}/draft`}
                        className="po-draft-btn"
                      >
                        DRAFT — FINALS GAME {(finals?.games.filter(g => g !== null).length ?? 0) + 1}
                      </Link>
                    </>
                  )}
                  {!amActive && (
                    <div className="po-elim-msg">
                      You were eliminated in round {rounds.find(r => r.eliminated === userId)?.round_number ?? '?'}.
                      Keep watching — you can still view everyone's lineups.
                    </div>
                  )}
                </div>
              )}

              {/* Gauntlet rounds */}
              {(league.phase === 'gauntlet' || league.phase === 'finals' || league.phase === 'complete') && rounds.filter(r => r.round_type === 'gauntlet').length > 0 && (
                <div className="po-section">
                  <div className="po-section-label">
                    <span className="po-sl-line" />GAUNTLET ROUNDS<span className="po-sl-line" />
                  </div>
                  {rounds.filter(r => r.round_type === 'gauntlet').map(round => (
                    <div key={round.id} className="po-round-card">
                      <div className="po-round-header">
                        <div className="po-round-title">ROUND {round.round_number}</div>
                        {round.eliminated && (
                          <div className="po-round-elim">
                            ☠️ {displayName(round.eliminated)} eliminated
                          </div>
                        )}
                        {!round.completed_at && <div className="po-round-live">LIVE</div>}
                      </div>
                      {round.drafts && round.drafts.length > 0 && (
                        <div className="po-round-scores">
                          {[...round.drafts]
                            .sort((a, b) => b.final_score - a.final_score)
                            .map((d, idx) => {
                              const isElim = round.eliminated === d.user_id;
                              return (
                                <div key={d.user_id} className={`po-score-row${isElim ? ' elim' : ''}`}>
                                  <div className="po-score-rank">{idx === 0 && !round.eliminated ? '👑' : isElim ? '☠️' : `#${idx + 1}`}</div>
                                  <div className="po-score-name">{displayName(d.user_id)}</div>
                                  <div className="po-score-val">{d.final_score?.toLocaleString()}</div>
                                  {d.chemistry?.totalChemPoints !== 0 && (
                                    <div className="po-score-chem"
                                      style={{ color: d.chemistry?.totalChemPoints >= 0 ? '#ff8c00' : '#ff6060' }}>
                                      {d.chemistry?.totalChemPoints >= 0 ? '+' : ''}{d.chemistry?.totalChemPoints}
                                    </div>
                                  )}
                                  <Link
                                    href={`/games/pack-empire/offense/league/${leagueId}/team/${d.user_id}`}
                                    className="po-view-btn"
                                  >
                                    VIEW
                                  </Link>
                                </div>
                              );
                            })}
                        </div>
                      )}
                      {(!round.drafts || round.drafts.length === 0) && round.completed_at && (
                        <div className="po-round-pending">Scores hidden until all players draft.</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Finals */}
              {finals && (league.phase === 'finals' || league.phase === 'complete') && (
                <div className="po-section">
                  <div className="po-section-label">
                    <span className="po-sl-line" />CHAMPIONSHIP FINALS<span className="po-sl-line" />
                  </div>
                  <div className="po-finals-card">
                    {/* Matchup */}
                    <div className="po-finals-matchup">
                      <div className={`po-finals-side${finals.champion === finals.member_a ? ' champion' : ''}`}>
                        <div className="po-finals-name">{displayName(finals.member_a)}</div>
                        <div className="po-finals-wins">{finals.wins_a}</div>
                        <div className="po-finals-wins-label">WINS</div>
                      </div>
                      <div className="po-finals-vs">VS</div>
                      <div className={`po-finals-side${finals.champion === finals.member_b ? ' champion' : ''}`}>
                        <div className="po-finals-name">{displayName(finals.member_b)}</div>
                        <div className="po-finals-wins">{finals.wins_b}</div>
                        <div className="po-finals-wins-label">WINS</div>
                      </div>
                    </div>

                    {/* Games */}
                    <div className="po-finals-games">
                      {finals.games.map((result, idx) => {
                        const finalsRound = rounds.filter(r => r.round_type === 'finals_game')[idx];
                        const drafts = finalsRound?.drafts ?? [];
                        const scoreA = drafts.find(d => d.user_id === finals.member_a)?.final_score;
                        const scoreB = drafts.find(d => d.user_id === finals.member_b)?.final_score;
                        return (
                          <div key={idx} className={`po-game${result ? ' played' : ' upcoming'}`}>
                            <div className="po-game-label">GAME {idx + 1}</div>
                            {result ? (
                              <div className="po-game-result">
                                <div className={`po-game-score${result === 'A' ? ' winner' : ''}`}>
                                  {scoreA?.toLocaleString() ?? '—'}
                                </div>
                                <div className="po-game-sep">·</div>
                                <div className={`po-game-score${result === 'B' ? ' winner' : ''}`}>
                                  {scoreB?.toLocaleString() ?? '—'}
                                </div>
                                <div className="po-game-winner-tag">
                                  {result === 'A' ? displayName(finals.member_a) : displayName(finals.member_b)} wins
                                </div>
                              </div>
                            ) : (
                              <div className="po-game-pending">
                                {idx === finals.games.filter(g => g !== null).length ? 'NEXT' : 'TBD'}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {finals.champion && (
                      <div className="po-finals-champ-row">
                        🏆 {displayName(finals.champion)} wins the championship!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right col — bracket / seeds */}
            <div className="po-col-side">
              <div className="po-section-label">
                <span className="po-sl-line" />PLAYOFF FIELD<span className="po-sl-line" />
              </div>
              <div className="po-seeds">
                {seededMembers.map(m => {
                  const elim   = isEliminated(m.user_id);
                  const active = m.playoff_active;
                  const champ  = finals?.champion === m.user_id;
                  return (
                    <Link
                      key={m.id}
                      href={`/games/pack-empire/offense/league/${leagueId}/team/${m.user_id}`}
                      className={`po-seed-row${elim ? ' elim' : ''}${champ ? ' champion' : ''}`}
                    >
                      <div className="po-seed-num">#{m.playoff_seed}</div>
                      <div className="po-seed-info">
                        <div className="po-seed-name">
                          {m.team_name ?? (m.profiles as any)?.username ?? 'Player'}
                          {champ && ' 🏆'}
                        </div>
                        {m.team_name && (
                          <div className="po-seed-username">{(m.profiles as any)?.username}</div>
                        )}
                      </div>
                      <div className={`po-seed-status${active ? ' active' : ' out'}`}>
                        {champ ? 'CHAMP' : active ? 'IN' : 'OUT'}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* How gauntlet works reminder */}
              {league.phase === 'gauntlet' && (
                <div className="po-rules-card">
                  <div className="po-rules-title">HOW IT WORKS</div>
                  <div className="po-rules-row">
                    <span className="po-rules-icon">📦</span>
                    <span>Everyone opens 11 packs and drafts</span>
                  </div>
                  <div className="po-rules-row">
                    <span className="po-rules-icon">☠️</span>
                    <span>Lowest final score is eliminated</span>
                  </div>
                  <div className="po-rules-row">
                    <span className="po-rules-icon">🔁</span>
                    <span>Repeat until 2 players remain</span>
                  </div>
                  <div className="po-rules-row">
                    <span className="po-rules-icon">🏆</span>
                    <span>Last two play best-of-3 finals</span>
                  </div>
                  <div className="po-rules-row">
                    <span className="po-rules-icon">⚡</span>
                    <span>No locked players — fresh 11 every round</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@700;800;900&display=swap');

        *{box-sizing:border-box}
        .po-root{font-family:'Rajdhani',sans-serif;color:#ffd4a8;background:#1c0a00;min-height:100vh}

        .po-loading{display:flex;align-items:center;justify-content:center;min-height:50vh;background:#1c0a00;color:#7a3a10;font-family:'Rajdhani',sans-serif}
        .po-spinner{width:30px;height:30px;border:2px solid #4a2000;border-top-color:#ff4500;border-radius:50%;animation:po-spin .8s linear infinite}
        @keyframes po-spin{to{transform:rotate(360deg)}}

        /* Nav */
        .po-nav{display:flex;align-items:center;justify-content:space-between;padding:.8rem 2rem;background:rgba(28,10,0,.98);border-bottom:1px solid #4a2000;position:sticky;top:0;z-index:40}
        .po-back{color:#7a3a10;font-size:.82rem;letter-spacing:.1em;font-weight:600;text-decoration:none;transition:.15s}
        .po-back:hover{color:#ff8c00}
        .po-nav-mid{display:flex;align-items:center;gap:.4rem;font-family:'Orbitron',sans-serif;font-size:.62rem;letter-spacing:.18em;color:#7a3a10}
        .po-nav-dot{width:6px;height:6px;border-radius:50%;background:#ff4500;box-shadow:0 0 6px #ff4500;flex-shrink:0}

        /* Hero */
        .po-hero{position:relative;overflow:hidden;padding:2rem 2rem 1.6rem;border-bottom:1px solid #2e1200}
        .po-hero-bg{position:absolute;inset:0;background:linear-gradient(180deg,#2e1200,#1c0a00)}
        .po-hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,69,0,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,69,0,.1) 1px,transparent 1px);background-size:40px 40px;mask-image:radial-gradient(ellipse 80% 100% at 50% 0%,black,transparent)}
        .po-hero-glow{position:absolute;top:-60px;left:50%;transform:translateX(-50%);width:600px;height:300px;background:radial-gradient(ellipse,rgba(255,69,0,.22) 0%,transparent 70%);pointer-events:none}
        .po-hero-inner{position:relative;z-index:1;max-width:1100px;margin:0 auto;text-align:center}
        .po-hero-eyebrow{font-family:'Orbitron',sans-serif;font-size:.6rem;letter-spacing:.26em;color:#7a3a10;margin-bottom:.4rem}
        .po-hero-title{font-family:'Orbitron',sans-serif;font-size:clamp(2rem,8vw,4.5rem);font-weight:900;background:linear-gradient(135deg,#ff4500,#ff6a00,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:0 0 .5rem;filter:drop-shadow(0 0 20px rgba(255,69,0,.4))}
        .po-hero-sub{font-size:.9rem;color:#7a3a10;font-weight:500;max-width:500px;margin:0 auto}

        /* Body */
        .po-body{max-width:1100px;margin:0 auto;padding:1.8rem 2rem 4rem}
        .po-cols{display:grid;grid-template-columns:1fr 300px;gap:1.4rem;align-items:start}
        .po-col-main{display:flex;flex-direction:column;gap:1.2rem}

        /* Champion banner */
        .po-champion{text-align:center;background:#2e1200;border:2px solid rgba(255,140,0,.4);border-radius:14px;padding:2rem;margin-bottom:1.4rem;position:relative;overflow:hidden}
        .po-champion::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#ff4500,#ff8c00,#ff4500)}
        .po-champ-trophy{font-size:3rem;margin-bottom:.4rem}
        .po-champ-label{font-family:'Orbitron',sans-serif;font-size:.62rem;letter-spacing:.24em;color:#7a3a10;margin-bottom:.4rem}
        .po-champ-name{font-family:'Orbitron',sans-serif;font-size:2rem;font-weight:900;color:#ff8c00;text-shadow:0 0 20px rgba(255,140,0,.4)}
        .po-champ-username{font-size:.78rem;color:#7a3a10;margin-top:.2rem}

        /* My action card */
        .po-my-card{background:#2e1200;border:1.5px solid rgba(255,140,0,.3);border-radius:12px;padding:1.1rem 1.2rem;position:relative;overflow:hidden}
        .po-my-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#ff4500,#ff8c00)}
        .po-my-card.eliminated{border-color:rgba(255,60,60,.2);opacity:.7}
        .po-my-card.eliminated::before{background:linear-gradient(90deg,#880000,#cc3300)}
        .po-my-card-top{display:flex;align-items:center;gap:.5rem;margin-bottom:.7rem}
        .po-my-status-dot{width:8px;height:8px;border-radius:50%;background:#4a2000;flex-shrink:0}
        .po-my-status-dot.active{background:#ff4500;box-shadow:0 0 6px #ff4500}
        .po-my-status-label{font-family:'Orbitron',sans-serif;font-size:.62rem;letter-spacing:.16em;color:#7a3a10}
        .po-my-prompt{font-size:.85rem;color:#a05030;font-weight:500;margin-bottom:.8rem;line-height:1.4}
        .po-draft-btn{display:block;text-align:center;text-decoration:none;background:linear-gradient(135deg,#cc2200,#ff4500,#ff8c00);color:#fff0e8;border:none;border-radius:9px;padding:.85rem;font-family:'Orbitron',sans-serif;font-weight:800;font-size:.78rem;letter-spacing:.14em;cursor:pointer;transition:.2s}
        .po-draft-btn:hover{filter:brightness(1.1);box-shadow:0 4px 16px rgba(255,69,0,.3)}
        .po-drafted-msg{font-size:.85rem;color:#28dc78;font-weight:600;line-height:1.5}
        .po-drafted-sub{font-size:.75rem;color:#7a3a10;font-weight:500}
        .po-elim-msg{font-size:.82rem;color:#7a3a10;font-weight:500;line-height:1.45}

        /* Section */
        .po-section{display:flex;flex-direction:column;gap:.7rem}
        .po-section-label{display:flex;align-items:center;gap:.7rem;font-family:'Orbitron',sans-serif;font-size:.58rem;letter-spacing:.2em;color:#7a3a10}
        .po-sl-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,#4a2000)}
        .po-sl-line:last-child{background:linear-gradient(90deg,#4a2000,transparent)}

        /* Round card */
        .po-round-card{background:#2e1200;border:1px solid #3a1800;border-radius:11px;overflow:hidden}
        .po-round-header{display:flex;align-items:center;gap:.8rem;padding:.75rem 1rem;background:#3a1800;border-bottom:1px solid #4a2000}
        .po-round-title{font-family:'Orbitron',sans-serif;font-size:.68rem;font-weight:800;color:#ff4500;letter-spacing:.14em}
        .po-round-elim{flex:1;font-size:.75rem;color:#ff6060;font-weight:600}
        .po-round-live{font-family:'Orbitron',sans-serif;font-size:.55rem;letter-spacing:.16em;color:#ff4500;border:1px solid rgba(255,69,0,.4);border-radius:3px;padding:.12rem .4rem;animation:po-blink 1.2s ease-in-out infinite}
        @keyframes po-blink{0%,100%{opacity:1}50%{opacity:.4}}
        .po-round-scores{display:flex;flex-direction:column;gap:0}
        .po-score-row{display:flex;align-items:center;gap:.7rem;padding:.6rem 1rem;border-bottom:1px solid #2e1200;transition:.15s}
        .po-score-row:last-child{border-bottom:none}
        .po-score-row:hover{background:#3a1800}
        .po-score-row.elim{opacity:.5}
        .po-score-rank{width:1.8rem;text-align:center;font-size:.8rem;flex-shrink:0}
        .po-score-name{flex:1;font-weight:700;font-size:.9rem;color:#ffd4a8}
        .po-score-val{font-family:'Orbitron',sans-serif;font-size:.82rem;font-weight:800;color:#ff8c00;flex-shrink:0}
        .po-score-chem{font-family:'Orbitron',sans-serif;font-size:.68rem;flex-shrink:0;min-width:3rem;text-align:right}
        .po-view-btn{font-family:'Rajdhani',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.1em;color:#7a3a10;border:1px solid #4a2000;border-radius:4px;padding:.18rem .45rem;text-decoration:none;transition:.15s;flex-shrink:0}
        .po-view-btn:hover{border-color:#ff4500;color:#ff8c00}
        .po-round-pending{padding:.8rem 1rem;font-size:.8rem;color:#4a2000;font-style:italic}

        /* Finals card */
        .po-finals-card{background:#2e1200;border:1.5px solid rgba(255,140,0,.25);border-radius:12px;overflow:hidden}
        .po-finals-matchup{display:grid;grid-template-columns:1fr auto 1fr;gap:1rem;padding:1.2rem 1.2rem .8rem;align-items:center}
        .po-finals-side{text-align:center;padding:.5rem}
        .po-finals-side.champion{background:rgba(255,140,0,.06);border-radius:8px}
        .po-finals-name{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.9rem;color:#ffd4a8;margin-bottom:.4rem}
        .po-finals-wins{font-family:'Orbitron',sans-serif;font-size:2.4rem;font-weight:900;color:#ff8c00;line-height:1}
        .po-finals-wins-label{font-size:.55rem;letter-spacing:.18em;color:#7a3a10;margin-top:.1rem}
        .po-finals-vs{font-family:'Orbitron',sans-serif;font-size:.75rem;color:#4a2000;letter-spacing:.1em}
        .po-finals-games{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;padding:.8rem 1.2rem 1rem;border-top:1px solid #3a1800}
        .po-game{background:#1c0a00;border:1px solid #3a1800;border-radius:8px;padding:.7rem;text-align:center}
        .po-game.played{border-color:#4a2000}
        .po-game.upcoming{opacity:.45}
        .po-game-label{font-family:'Orbitron',sans-serif;font-size:.55rem;letter-spacing:.16em;color:#7a3a10;margin-bottom:.4rem}
        .po-game-result{display:flex;flex-direction:column;gap:.15rem;align-items:center}
        .po-game-score{font-family:'Orbitron',sans-serif;font-size:.75rem;color:#7a3a10}
        .po-game-score.winner{color:#ff8c00;font-weight:900}
        .po-game-sep{color:#4a2000;font-size:.7rem}
        .po-game-winner-tag{font-size:.62rem;color:#ff4500;font-weight:600;margin-top:.2rem}
        .po-game-pending{font-family:'Orbitron',sans-serif;font-size:.6rem;letter-spacing:.12em;color:#4a2000}
        .po-finals-champ-row{padding:.8rem 1.2rem;border-top:1px solid #3a1800;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.9rem;color:#ff8c00;text-align:center}

        /* Side col */
        .po-col-side{display:flex;flex-direction:column;gap:1.2rem}
        .po-seeds{display:flex;flex-direction:column;gap:.35rem}
        .po-seed-row{display:flex;align-items:center;gap:.7rem;background:#2e1200;border:1px solid #3a1800;border-radius:8px;padding:.65rem .85rem;text-decoration:none;transition:.15s}
        .po-seed-row:hover{border-color:#4a2000;background:#3a1800}
        .po-seed-row.elim{opacity:.4}
        .po-seed-row.champion{border-color:rgba(255,140,0,.4);background:rgba(58,24,0,.7)}
        .po-seed-num{font-family:'Orbitron',sans-serif;font-size:.65rem;color:#4a2000;width:1.8rem;flex-shrink:0}
        .po-seed-info{flex:1;min-width:0}
        .po-seed-name{font-weight:700;font-size:.88rem;color:#ffd4a8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .po-seed-username{font-size:.65rem;color:#7a3a10;margin-top:.08rem}
        .po-seed-status{font-family:'Orbitron',sans-serif;font-size:.55rem;letter-spacing:.12em;padding:.15rem .4rem;border-radius:3px;flex-shrink:0}
        .po-seed-status.active{color:#ff4500;border:1px solid rgba(255,69,0,.35)}
        .po-seed-status.out{color:#4a2000;border:1px solid #2e1200}
        .po-seed-status.champion{color:#ff8c00;border:1px solid rgba(255,140,0,.3)}

        /* Rules card */
        .po-rules-card{background:#2e1200;border:1px solid #4a2000;border-radius:10px;padding:.9rem 1rem}
        .po-rules-title{font-family:'Orbitron',sans-serif;font-size:.58rem;letter-spacing:.2em;color:#ff4500;margin-bottom:.7rem}
        .po-rules-row{display:flex;align-items:flex-start;gap:.5rem;font-size:.78rem;color:#7a3a10;font-weight:500;padding:.25rem 0;border-bottom:1px solid #2e1200}
        .po-rules-row:last-child{border-bottom:none}
        .po-rules-icon{flex-shrink:0;font-size:.85rem}

        /* Responsive */
        @media(max-width:800px){
          .po-cols{grid-template-columns:1fr}
          .po-col-side{order:-1}
          .po-body{padding:1.4rem 1rem 3rem}
          .po-nav{padding:.8rem 1rem}
          .po-hero{padding:1.5rem 1rem 1.2rem}
        }
      `}</style>
    </>
  );
}