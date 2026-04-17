'use client';
// nfl-minigames-hub/app/games/pack-empire/offense/league/page.tsx

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getMyLeagues, getLeagueByJoinCode, joinLeague, getMyMembership, getLeagueMembers } from '@/lib/league/db';
import type { DBLeague } from '@/lib/league/db';

export default function LeagueHubPage() {
  const supabase = createClient();
  const [userId, setUserId]       = useState<string | null>(null);
  const [leagues, setLeagues]     = useState<DBLeague[]>([]);
  const [joinCode, setJoinCode]   = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining]     = useState(false);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);
      const my = await getMyLeagues(user.id);
      setLeagues(my);
      setLoading(false);
    })();
  }, []);

  async function handleJoin() {
    if (!userId || !joinCode.trim()) return;
    setJoining(true);
    setJoinError('');
    try {
      const league = await getLeagueByJoinCode(joinCode.trim());
      if (!league) { setJoinError('League not found. Check your code.'); return; }
      if (league.phase !== 'pregame') { setJoinError('This league has already started.'); return; }
      const existing = await getMyMembership(league.id, userId);
      if (existing) { window.location.href = `/games/pack-empire/offense/league/${league.id}`; return; }
      const members = await getLeagueMembers(league.id);
      if (members.length >= league.max_players) { setJoinError('League is full.'); return; }
      await joinLeague(league.id, userId);
      window.location.href = `/games/pack-empire/offense/league/${league.id}`;
    } catch {
      setJoinError('Something went wrong. Try again.');
    } finally {
      setJoining(false);
    }
  }

  const phaseLabel: Record<string, string> = {
    pregame: 'Waiting to start', regular: 'Regular season',
    gauntlet: 'Playoffs — gauntlet', finals: 'Playoffs — finals', complete: 'Complete',
  };

  return (
    <>
      <div className="lhub-root">

        {/* ── Masthead / Nav ── */}
        <nav className="lhub-nav">
          <div className="lhub-nav-l">
            <Link href="/games/pack-empire/offense" className="lhub-back">← Pack Empire</Link>
          </div>
          <div className="lhub-nav-c">
            <span className="lhub-pip" />
            <span className="lhub-nav-title">
              League <span className="lhub-nav-italic">Mode.</span>
            </span>
          </div>
          <div className="lhub-nav-r">
            {userId
              ? <Link href="/profile" className="lhub-hub-link">Profile →</Link>
              : <Link href="/login" className="lhub-hub-link">Sign In →</Link>
            }
          </div>
        </nav>

        {/* ── Hero ── */}
        <header className="lhub-hero">
          <div className="lhub-hero-kicker">§ Pack Empire · Season competition</div>
          <h1 className="lhub-hero-title">
            League <span className="lhub-italic">mode.</span>
          </h1>
          <p className="lhub-tagline">
            Draft. Lock. Dominate. Eight weeks to build a <em>dynasty</em>.
          </p>
          <div className="lhub-stats">
            <div className="lhub-stat">
              <span className="lhub-sn">8</span>
              <span className="lhub-sl">Weeks</span>
            </div>
            <div className="lhub-sdiv" />
            <div className="lhub-stat">
              <span className="lhub-sn">11</span>
              <span className="lhub-sl">Players</span>
            </div>
            <div className="lhub-sdiv" />
            <div className="lhub-stat">
              <span className="lhub-sn">12</span>
              <span className="lhub-sl">Max teams</span>
            </div>
          </div>
        </header>

        {/* ── How it works ── */}
        <section className="lhub-section">
          <div className="lhub-section-header">
            <span className="lhub-section-num">§ 01 · Primer</span>
            <span className="lhub-section-title">How it <span className="lhub-italic">works</span></span>
          </div>
          <div className="lhub-how">
            {[
              { n: 'I.',   title: 'Draft weekly',      body: 'Open packs every week. Score updates as you lock in better players.' },
              { n: 'II.',  title: 'Lock one per week', body: 'After each draft, keep one player permanently. 8 weeks = 8 locks.' },
              { n: 'III.', title: 'Chemistry matters', body: 'Stack teammates for synergy bonuses. Mix rivals and pay the penalty.' },
              { n: 'IV.',  title: 'Win the league',    body: 'Top half make playoffs. Survive the gauntlet. Win the best-of-3.' },
            ].map(c => (
              <div key={c.n} className="lhub-how-card">
                <div className="lhub-how-n">{c.n}</div>
                <div className="lhub-how-title">{c.title}</div>
                <div className="lhub-how-body">{c.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Action panel ── */}
        <section className="lhub-panel">
          {loading ? (
            <div className="lhub-loading">
              <div className="lhub-loading-text">Loading —</div>
            </div>
          ) : !userId ? (
            <div className="lhub-gated">
              <div className="lhub-gated-icon">🔐</div>
              <div className="lhub-gated-kicker">§ Sign in required</div>
              <div className="lhub-gated-title">
                Competition <span className="lhub-italic">awaits.</span>
              </div>
              <div className="lhub-gated-sub">League Mode requires an account — sign in to create a league or join one with a code.</div>
              <Link href="/login" className="lhub-cta">
                <span>Sign in</span>
                <span>→</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="lhub-section-header">
                <span className="lhub-section-num">§ 02 · Begin</span>
                <span className="lhub-section-title">Start or join a <span className="lhub-italic">league</span></span>
              </div>

              <div className="lhub-actions">
                <Link href="/games/pack-empire/offense/league/create" className="lhub-create">
                  <span className="lhub-create-plus">+</span>
                  <span className="lhub-create-body">
                    <span className="lhub-create-title">Create league</span>
                    <span className="lhub-create-sub">Set up your own as commissioner</span>
                  </span>
                  <span className="lhub-create-arrow">→</span>
                </Link>

                <div className="lhub-join">
                  <div className="lhub-join-label">★ Join with code</div>
                  <div className="lhub-join-row">
                    <input
                      className="lhub-code-input"
                      placeholder="ENTER CODE..."
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      maxLength={10}
                      onKeyDown={e => e.key === 'Enter' && handleJoin()}
                    />
                    <button className="lhub-join-btn" onClick={handleJoin} disabled={joining || !joinCode.trim()}>
                      {joining ? '...' : 'Join'}
                    </button>
                  </div>
                  {joinError && <div className="lhub-join-err">{joinError}</div>}
                </div>
              </div>

              {leagues.length > 0 ? (
                <div className="lhub-my">
                  <div className="lhub-section-header">
                    <span className="lhub-section-num">§ 03 · In progress</span>
                    <span className="lhub-section-title">
                      My <span className="lhub-italic">leagues</span>
                      <span className="lhub-count">({leagues.length})</span>
                    </span>
                  </div>
                  <div className="lhub-rows">
                    {leagues.map((lg, i) => (
                      <Link key={lg.id} href={`/games/pack-empire/offense/league/${lg.id}`} className="lhub-row">
                        <div className="lhub-row-num">{String(i + 1).padStart(2, '0')}</div>
                        <div className="lhub-row-bar" />
                        <div className="lhub-row-body">
                          <div className="lhub-row-name">{lg.name}</div>
                          <div className="lhub-row-meta">
                            {phaseLabel[lg.phase] ?? lg.phase}
                            {lg.phase === 'regular' && <span className="lhub-row-week"> · Week {lg.current_week} of 8</span>}
                          </div>
                        </div>
                        <div className="lhub-row-code">{lg.id}</div>
                        <div className="lhub-row-arrow">→</div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="lhub-empty">
                  <span className="lhub-empty-icon">🏟</span>
                  <span className="lhub-empty-msg">No leagues yet — create one or enter a code above.</span>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

        :root{
          --lhub-bg:#141311;
          --lhub-bg-soft:#1c1b18;
          --lhub-bg-card:#201e1a;
          --lhub-ink:#f4ebd8;
          --lhub-ink-soft:#bfb5a0;
          --lhub-ink-mute:#7d7463;
          --lhub-line:#3a3630;
          --lhub-line-soft:#2a2620;
          --lhub-amber:#e8a84b;
          --lhub-amber-bright:#f4c06a;
          /* League signature: rust */
          --lhub-rust:#c04820;
          --lhub-rust-bright:#e06040;
          --lhub-rust-deep:#8a3018;
          --lhub-rust-glow:rgba(192,72,32,.4);
        }

        *{box-sizing:border-box}

        .lhub-root{
          font-family:'Space Grotesk',sans-serif;
          color:var(--lhub-ink);background:var(--lhub-bg);
          min-height:100vh;
          background-image:
            radial-gradient(ellipse at 50% -10%,rgba(192,72,32,.08),transparent 55%),
            radial-gradient(ellipse at 15% 80%,rgba(232,168,75,.03),transparent 50%),
            repeating-linear-gradient(0deg,transparent,transparent 70px,rgba(192,72,32,.012) 70px,rgba(192,72,32,.012) 71px);
        }

        .lhub-italic{font-style:italic;color:var(--lhub-rust)}

        /* ═══ NAV / MASTHEAD ═══ */
        .lhub-nav{
          display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:1rem;
          padding:1.2rem 2rem;
          background:rgba(20,19,17,.92);
          backdrop-filter:blur(12px);
          border-bottom:1px solid var(--lhub-line);
          position:sticky;top:0;z-index:30;
        }
        .lhub-nav-l{justify-self:start}
        .lhub-nav-c{display:flex;align-items:center;gap:.65rem;justify-self:center}
        .lhub-nav-r{justify-self:end}

        .lhub-back{
          color:var(--lhub-rust);text-decoration:none;
          font-family:'JetBrains Mono',monospace;font-weight:700;
          font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;
          transition:color .2s;
        }
        .lhub-back:hover{color:var(--lhub-rust-bright)}

        .lhub-hub-link{
          color:var(--lhub-rust);text-decoration:none;
          font-family:'JetBrains Mono',monospace;font-weight:700;
          font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;
          transition:color .2s;
        }
        .lhub-hub-link:hover{color:var(--lhub-rust-bright)}

        .lhub-nav-title{
          font-family:'DM Serif Display',serif;
          font-size:1.35rem;letter-spacing:-.01em;color:var(--lhub-ink);
        }
        .lhub-nav-italic{font-style:italic;color:var(--lhub-rust)}

        .lhub-pip{
          width:9px;height:9px;border-radius:50%;
          background:var(--lhub-rust);flex-shrink:0;
          box-shadow:0 0 0 3px rgba(192,72,32,.15),0 0 12px var(--lhub-rust);
          animation:lhub-pip 2s ease-in-out infinite;
        }
        @keyframes lhub-pip{
          0%,100%{box-shadow:0 0 0 3px rgba(192,72,32,.15),0 0 12px var(--lhub-rust)}
          50%{box-shadow:0 0 0 6px rgba(192,72,32,.05),0 0 22px var(--lhub-rust-bright)}
        }

        /* ═══ HERO ═══ */
        .lhub-hero{
          max-width:920px;margin:0 auto;
          text-align:center;padding:3rem 1.5rem 2.5rem;
          position:relative;
        }
        .lhub-hero-kicker{
          font-family:'JetBrains Mono',monospace;font-weight:700;
          font-size:.62rem;letter-spacing:.32em;text-transform:uppercase;
          color:var(--lhub-rust);margin-bottom:1rem;
        }
        .lhub-hero-title{
          font-family:'DM Serif Display',serif;
          font-size:clamp(3rem,8vw,5.4rem);line-height:.9;letter-spacing:-.03em;
          color:var(--lhub-ink);margin:0 0 1.1rem;
        }
        .lhub-tagline{
          font-family:'DM Serif Display',serif;font-style:italic;
          font-size:clamp(1rem,2.2vw,1.2rem);color:var(--lhub-ink-soft);
          letter-spacing:-.005em;margin:0 0 2rem;
          max-width:540px;margin-left:auto;margin-right:auto;line-height:1.4;
        }
        .lhub-tagline em{color:var(--lhub-rust);font-style:italic}

        .lhub-stats{
          display:flex;align-items:center;justify-content:center;
          padding:1.25rem 0;
          border-top:1px solid var(--lhub-line);
          border-bottom:3px double var(--lhub-line);
          max-width:520px;margin:0 auto;
        }
        .lhub-stat{
          display:flex;flex-direction:column;align-items:center;
          padding:0 2rem;flex:1;
        }
        .lhub-sn{
          font-family:'DM Serif Display',serif;
          font-size:2.4rem;line-height:1;letter-spacing:-.03em;
          color:var(--lhub-rust);
        }
        .lhub-sl{
          font-family:'JetBrains Mono',monospace;font-weight:700;
          font-size:.58rem;letter-spacing:.28em;text-transform:uppercase;
          color:var(--lhub-ink-mute);margin-top:.45rem;
        }
        .lhub-sdiv{
          width:1px;height:48px;
          background:linear-gradient(180deg,transparent,var(--lhub-line),transparent);
          flex-shrink:0;
        }

        /* ═══ SECTIONS ═══ */
        .lhub-section{
          max-width:920px;margin:0 auto 2rem;padding:0 1.5rem;
        }
        .lhub-section-header{
          display:flex;justify-content:space-between;align-items:baseline;gap:.75rem;flex-wrap:wrap;
          padding-bottom:1rem;margin-bottom:1.25rem;
          border-bottom:3px double var(--lhub-line);
        }
        .lhub-section-num{
          font-family:'JetBrains Mono',monospace;font-weight:700;
          font-size:.62rem;letter-spacing:.26em;text-transform:uppercase;
          color:var(--lhub-rust);
        }
        .lhub-section-title{
          font-family:'DM Serif Display',serif;
          font-size:1.25rem;letter-spacing:-.01em;color:var(--lhub-ink);
          display:flex;align-items:baseline;gap:.5rem;
        }
        .lhub-count{
          font-family:'JetBrains Mono',monospace;font-weight:700;
          font-size:.7rem;letter-spacing:.1em;color:var(--lhub-ink-mute);
        }

        /* ═══ HOW IT WORKS ═══ */
        .lhub-how{
          display:grid;grid-template-columns:repeat(4,1fr);gap:1px;
          background:var(--lhub-line);
          border:1px solid var(--lhub-line);
        }
        .lhub-how-card{
          background:var(--lhub-bg-card);
          padding:1.5rem 1.25rem 1.3rem;
          position:relative;overflow:hidden;transition:background .2s;
        }
        .lhub-how-card::before{
          content:'';position:absolute;top:0;left:0;right:0;height:2px;
          background:linear-gradient(90deg,transparent,var(--lhub-rust-glow),transparent);
        }
        .lhub-how-card:hover{background:var(--lhub-bg-soft)}
        .lhub-how-n{
          font-family:'DM Serif Display',serif;font-style:italic;
          font-size:1.4rem;letter-spacing:-.02em;
          color:var(--lhub-rust);margin-bottom:.7rem;
        }
        .lhub-how-title{
          font-family:'DM Serif Display',serif;
          font-weight:400;font-size:1.05rem;line-height:1.15;letter-spacing:-.01em;
          color:var(--lhub-ink);margin-bottom:.5rem;
        }
        .lhub-how-body{
          font-family:'Space Grotesk',sans-serif;
          font-size:.85rem;line-height:1.55;
          color:var(--lhub-ink-soft);
        }

        /* ═══ PANEL ═══ */
        .lhub-panel{
          max-width:920px;margin:0 auto;padding:0 1.5rem 4rem;
        }

        /* ═══ LOADING ═══ */
        .lhub-loading{
          display:flex;justify-content:center;align-items:center;
          padding:4rem;
        }
        .lhub-loading-text{
          font-family:'JetBrains Mono',monospace;font-weight:700;
          font-size:.72rem;letter-spacing:.28em;text-transform:uppercase;
          color:var(--lhub-ink-mute);
        }

        /* ═══ GATED ═══ */
        .lhub-gated{
          text-align:center;padding:3rem 2rem;
          background:var(--lhub-bg-card);border:1px solid var(--lhub-line);
          position:relative;max-width:560px;margin:0 auto;
        }
        .lhub-gated::before{
          content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:var(--lhub-rust);
        }
        .lhub-gated-icon{font-size:2.8rem;margin-bottom:1rem}
        .lhub-gated-kicker{
          font-family:'JetBrains Mono',monospace;font-weight:700;
          font-size:.62rem;letter-spacing:.28em;text-transform:uppercase;
          color:var(--lhub-rust);margin-bottom:.6rem;
        }
        .lhub-gated-title{
          font-family:'DM Serif Display',serif;
          font-size:1.8rem;line-height:1;letter-spacing:-.02em;
          color:var(--lhub-ink);margin-bottom:.8rem;
        }
        .lhub-gated-sub{
          font-family:'Space Grotesk',sans-serif;
          color:var(--lhub-ink-soft);font-size:.95rem;line-height:1.55;
          max-width:420px;margin:0 auto 1.75rem;
        }
        .lhub-cta{
          display:inline-flex;align-items:center;gap:.75rem;
          background:var(--lhub-rust);color:var(--lhub-ink);
          padding:1rem 1.8rem;text-decoration:none;
          font-family:'Space Grotesk',sans-serif;font-weight:700;
          font-size:.88rem;letter-spacing:.18em;text-transform:uppercase;
          border-radius:2px;
          transition:all .25s cubic-bezier(.2,.8,.2,1);
          box-shadow:0 8px 20px rgba(192,72,32,.2);
        }
        .lhub-cta:hover{
          background:var(--lhub-rust-bright);
          transform:translateY(-2px);
          box-shadow:0 14px 30px rgba(192,72,32,.35);
        }

        /* ═══ ACTIONS ═══ */
        .lhub-actions{
          display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:2.25rem;
        }

        .lhub-create{
          display:flex;align-items:center;gap:1rem;
          background:var(--lhub-bg-card);
          border:1px solid var(--lhub-rust);
          padding:1.4rem 1.5rem;text-decoration:none;
          position:relative;overflow:hidden;
          transition:all .25s cubic-bezier(.2,.8,.2,1);
        }
        .lhub-create::before{
          content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,rgba(192,72,32,.08),transparent 60%);
          pointer-events:none;
        }
        .lhub-create:hover{
          background:var(--lhub-bg-soft);
          border-color:var(--lhub-rust-bright);
          transform:translateY(-2px);
          box-shadow:0 14px 30px rgba(192,72,32,.2);
        }
        .lhub-create-plus{
          font-family:'DM Serif Display',serif;
          font-size:2.4rem;line-height:1;letter-spacing:-.03em;
          color:var(--lhub-rust);flex-shrink:0;
        }
        .lhub-create-body{display:flex;flex-direction:column;gap:.15rem;min-width:0}
        .lhub-create-title{
          font-family:'DM Serif Display',serif;
          font-size:1.1rem;line-height:1.1;letter-spacing:-.015em;
          color:var(--lhub-ink);
        }
        .lhub-create-sub{
          font-family:'Space Grotesk',sans-serif;
          font-size:.8rem;letter-spacing:.01em;
          color:var(--lhub-ink-soft);
        }
        .lhub-create-arrow{
          margin-left:auto;
          font-family:'JetBrains Mono',monospace;font-weight:700;
          font-size:1.2rem;color:var(--lhub-ink-mute);
          transition:all .2s;flex-shrink:0;
        }
        .lhub-create:hover .lhub-create-arrow{
          color:var(--lhub-rust);transform:translateX(3px);
        }

        /* Join with code card */
        .lhub-join{
          background:var(--lhub-bg-card);
          border:1px solid var(--lhub-line);
          padding:1.4rem 1.5rem;position:relative;
        }
        .lhub-join::before{
          content:'';position:absolute;top:0;left:0;width:2px;height:100%;background:var(--lhub-amber);
        }
        .lhub-join-label{
          font-family:'JetBrains Mono',monospace;font-weight:700;
          font-size:.62rem;letter-spacing:.26em;text-transform:uppercase;
          color:var(--lhub-amber);margin-bottom:.75rem;
        }
        .lhub-join-row{display:flex;gap:.5rem}
        .lhub-code-input{
          flex:1;min-width:0;
          background:var(--lhub-bg);color:var(--lhub-ink);
          border:1px solid var(--lhub-line);
          padding:.75rem 1rem;
          font-family:'JetBrains Mono',monospace;font-weight:700;
          font-size:.88rem;letter-spacing:.18em;
          border-radius:2px;outline:none;transition:border-color .2s;
        }
        .lhub-code-input:focus{border-color:var(--lhub-amber)}
        .lhub-code-input::placeholder{color:var(--lhub-ink-mute);letter-spacing:.18em}
        .lhub-join-btn{
          background:var(--lhub-amber);color:var(--lhub-bg);
          border:none;padding:.75rem 1.3rem;
          font-family:'Space Grotesk',sans-serif;font-weight:700;
          font-size:.78rem;letter-spacing:.2em;text-transform:uppercase;
          border-radius:2px;cursor:pointer;
          transition:all .2s;white-space:nowrap;flex-shrink:0;
        }
        .lhub-join-btn:hover:not(:disabled){background:var(--lhub-amber-bright)}
        .lhub-join-btn:disabled{opacity:.4;cursor:not-allowed}
        .lhub-join-err{
          font-family:'Space Grotesk',sans-serif;font-weight:600;
          color:var(--lhub-rust-bright);
          font-size:.82rem;margin-top:.65rem;letter-spacing:.02em;
        }

        /* ═══ MY LEAGUES ═══ */
        .lhub-my{margin-top:.4rem}
        .lhub-rows{display:flex;flex-direction:column;gap:0}

        .lhub-row{
          display:grid;grid-template-columns:auto 4px 1fr auto auto;gap:.9rem;align-items:center;
          background:var(--lhub-bg-card);
          border:1px solid var(--lhub-line);border-top:none;
          text-decoration:none;
          padding:.9rem 1.2rem;
          transition:all .2s;
        }
        .lhub-row:first-child{border-top:1px solid var(--lhub-line)}
        .lhub-row:hover{
          background:var(--lhub-bg-soft);
          border-color:var(--lhub-rust);
        }

        .lhub-row-num{
          font-family:'DM Serif Display',serif;font-style:italic;
          font-size:1.3rem;letter-spacing:-.02em;
          color:var(--lhub-rust);
          min-width:2rem;
        }
        .lhub-row-bar{
          width:3px;align-self:stretch;
          background:linear-gradient(180deg,var(--lhub-rust),var(--lhub-amber));
        }
        .lhub-row-body{min-width:0}
        .lhub-row-name{
          font-family:'DM Serif Display',serif;
          font-size:1.05rem;line-height:1.15;letter-spacing:-.005em;
          color:var(--lhub-ink);
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
          margin-bottom:2px;
        }
        .lhub-row-meta{
          font-family:'JetBrains Mono',monospace;
          font-size:.62rem;letter-spacing:.16em;text-transform:uppercase;
          color:var(--lhub-ink-mute);
        }
        .lhub-row-week{color:var(--lhub-rust);font-weight:700}
        .lhub-row-code{
          font-family:'JetBrains Mono',monospace;font-weight:700;
          font-size:.62rem;letter-spacing:.16em;text-transform:uppercase;
          color:var(--lhub-ink-mute);flex-shrink:0;
          padding:.35rem .55rem;
          background:var(--lhub-bg);
          border:1px solid var(--lhub-line-soft);
          border-radius:2px;
        }
        .lhub-row-arrow{
          font-family:'JetBrains Mono',monospace;font-weight:700;
          font-size:1.1rem;color:var(--lhub-ink-mute);
          transition:all .2s;flex-shrink:0;
        }
        .lhub-row:hover .lhub-row-arrow{
          color:var(--lhub-rust);transform:translateX(3px);
        }

        /* ═══ EMPTY ═══ */
        .lhub-empty{
          display:flex;align-items:center;justify-content:center;gap:.8rem;
          padding:2.5rem 2rem;
          background:var(--lhub-bg-card);
          border:1px dashed var(--lhub-line);
          font-family:'DM Serif Display',serif;font-style:italic;
          color:var(--lhub-ink-soft);font-size:1rem;
          text-align:center;
        }
        .lhub-empty-icon{font-size:1.5rem;opacity:.7}

        /* ═══ RESPONSIVE ═══ */
        @media(max-width:720px){
          .lhub-nav{padding:1rem 1.25rem;gap:.75rem}
          .lhub-nav-title{font-size:1.1rem}
          .lhub-back{font-size:.65rem}
          .lhub-hub-link{font-size:.65rem}
          .lhub-hero{padding:2rem 1.25rem 1.75rem}
          .lhub-hero-title{font-size:2.8rem}
          .lhub-stats{padding:1rem 0}
          .lhub-stat{padding:0 1rem}
          .lhub-sn{font-size:2rem}
          .lhub-section{padding:0 1.25rem;margin-bottom:1.75rem}
          .lhub-section-header{flex-direction:column;align-items:flex-start;gap:.4rem}
          .lhub-how{grid-template-columns:repeat(2,1fr)}
          .lhub-panel{padding:0 1.25rem 3rem}
          .lhub-actions{grid-template-columns:1fr}
          .lhub-row{
            grid-template-columns:auto 3px 1fr auto;
            padding:.85rem 1rem;gap:.75rem;
          }
          .lhub-row-code{display:none}
        }
        @media(max-width:440px){
          .lhub-how{grid-template-columns:1fr}
          .lhub-hero-title{font-size:2.3rem}
          .lhub-sdiv{height:36px}
          .lhub-create{padding:1.2rem 1.25rem}
          .lhub-join{padding:1.2rem 1.25rem}
        }
      `}</style>
    </>
  );
}
