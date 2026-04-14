'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ──────────────────────────────────────────────────────────── */
interface League {
  id: string;
  name: string;
  commissioner_id: string;
  join_code: string;
  is_public: boolean;
  max_players: number;
  current_week: number;
  status: string;
  playoff_format: string;
  playoff_size_pct: number;
  created_at: string;
  member_count?: number;
}

/* ══════════════════════════════════════════════════════════════════════
   LEAGUE LOBBY — Create / Join / List Leagues
══════════════════════════════════════════════════════════════════════ */
export default function LeagueLobby() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [publicLeagues, setPublicLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [leagueName, setLeagueName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(12);
  const [isPublic, setIsPublic] = useState(true);
  const [playoffFormat, setPlayoffFormat] = useState<'best_of_3' | 'gauntlet'>('best_of_3');
  const [playoffPct, setPlayoffPct] = useState(50);
  const [creating, setCreating] = useState(false);

  // Join form
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      // Fetch my leagues
      const { data: memberships } = await supabase
        .from('league_members')
        .select('league_id')
        .eq('user_id', user.id);

      if (memberships && memberships.length > 0) {
        const ids = memberships.map(m => m.league_id);
        const { data: leagues } = await supabase
          .from('leagues')
          .select('*')
          .in('id', ids)
          .order('created_at', { ascending: false });
        setMyLeagues(leagues || []);
      }

      // Fetch public leagues
      const { data: pubLeagues } = await supabase
        .from('leagues')
        .select('*')
        .eq('is_public', true)
        .eq('status', 'setup')
        .order('created_at', { ascending: false })
        .limit(20);
      setPublicLeagues(pubLeagues || []);

      setLoading(false);
    }
    init();
  }, []);

  const createLeague = useCallback(async () => {
    if (!leagueName.trim() || !user) return;
    setCreating(true);
    try {
      const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Commissioner';

      const { data: league, error } = await supabase
        .from('leagues')
        .insert({
          name: leagueName.trim(),
          commissioner_id: user.id,
          is_public: isPublic,
          max_players: maxPlayers,
          playoff_format: playoffFormat,
          playoff_size_pct: playoffPct,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join as member
      await supabase.from('league_members').insert({
        league_id: league.id,
        user_id: user.id,
        display_name: displayName,
      });

      router.push(`/games/pack-empire/league/${league.id}`);
    } catch (e: any) {
      alert('Failed to create league: ' + e.message);
    } finally {
      setCreating(false);
    }
  }, [leagueName, isPublic, maxPlayers, playoffFormat, playoffPct, user, supabase, router]);

  const joinLeague = useCallback(async (leagueId?: string) => {
    if (!user || !joinName.trim()) { setJoinError('Enter your display name'); return; }
    setJoining(true);
    setJoinError('');
    try {
      let targetId = leagueId;

      // If joining by code
      if (!targetId && joinCode.trim()) {
        const { data: league } = await supabase
          .from('leagues')
          .select('id, max_players')
          .eq('join_code', joinCode.trim().toUpperCase())
          .single();
        if (!league) { setJoinError('League not found'); setJoining(false); return; }
        targetId = league.id;
      }

      if (!targetId) { setJoinError('Enter a join code'); setJoining(false); return; }

      // Check if already a member
      const { data: existing } = await supabase
        .from('league_members')
        .select('id')
        .eq('league_id', targetId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        router.push(`/games/pack-empire/league/${targetId}`);
        return;
      }

      const { error } = await supabase.from('league_members').insert({
        league_id: targetId,
        user_id: user.id,
        display_name: joinName.trim(),
      });

      if (error) throw error;
      router.push(`/games/pack-empire/league/${targetId}`);
    } catch (e: any) {
      setJoinError(e.message || 'Failed to join');
    } finally {
      setJoining(false);
    }
  }, [joinCode, joinName, user, supabase, router]);

  if (loading) return (
    <div style={{ background: '#050a18', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#3a6080', fontFamily: 'Orbitron, sans-serif', letterSpacing: '.2em' }}>LOADING...</div>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LOBBY_STYLES }} />

      <nav className="ll-nav">
        <Link href="/games/pack-empire" className="ll-back">← Pack Empire</Link>
        <div className="ll-title"><span className="ll-pip" />LEAGUE MODE</div>
        <div />
      </nav>

      <div className="ll-root">
        <div className="ll-content-wrapper">
        {/* Hero */}
        <div className="ll-hero">
          <div className="ll-hero-sup">PACK EMPIRE</div>
          <div className="ll-hero-title">LEAGUE MODE</div>
          <div className="ll-hero-sub">8-week seasons · Lock players · Climb the standings · Make playoffs</div>
        </div>

        {/* Actions */}
        <div className="ll-actions">
          <button className="ll-btn primary" onClick={() => setShowCreate(true)}>
            🏟️ CREATE LEAGUE
          </button>

          <div className="ll-join-section">
            <div className="ll-join-title">JOIN A LEAGUE</div>
            <input
              className="ll-input"
              placeholder="Your display name"
              value={joinName}
              onChange={e => setJoinName(e.target.value)}
              maxLength={24}
            />
            <div className="ll-join-row">
              <input
                className="ll-input"
                placeholder="Enter join code..."
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                style={{ textTransform: 'uppercase', letterSpacing: '.3em', textAlign: 'center' }}
              />
              <button className="ll-btn secondary" onClick={() => joinLeague()} disabled={joining}>
                {joining ? '...' : 'JOIN'}
              </button>
            </div>
            {joinError && <div className="ll-error">{joinError}</div>}
          </div>
        </div>

        {/* My Leagues */}
        {myLeagues.length > 0 && (
          <div className="ll-section">
            <div className="ll-sec-title">MY LEAGUES</div>
            <div className="ll-league-list">
              {myLeagues.map(league => (
                <Link key={league.id} href={`/games/pack-empire/league/${league.id}`} className="ll-league-card">
                  <div className="ll-lc-name">{league.name}</div>
                  <div className="ll-lc-meta">
                    <span className={`ll-lc-status ${league.status}`}>{league.status.toUpperCase()}</span>
                    <span>Week {league.current_week}/8</span>
                    <span>Code: {league.join_code}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Public Leagues */}
        {publicLeagues.length > 0 && (
          <div className="ll-section">
            <div className="ll-sec-title">OPEN LEAGUES</div>
            <div className="ll-league-list">
              {publicLeagues.map(league => (
                <div key={league.id} className="ll-league-card">
                  <div className="ll-lc-name">{league.name}</div>
                  <div className="ll-lc-meta">
                    <span>Max {league.max_players} players</span>
                    <span>{league.playoff_format === 'best_of_3' ? 'Best of 3' : 'Gauntlet'}</span>
                  </div>
                  <button className="ll-btn secondary small" onClick={() => joinLeague(league.id)} disabled={joining || !joinName.trim()}>
                    {!joinName.trim() ? 'Enter name above' : 'JOIN'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create League Modal */}
        {showCreate && (
          <div className="ll-overlay" onClick={() => setShowCreate(false)}>
            <div className="ll-modal" onClick={e => e.stopPropagation()}>
              <div className="ll-modal-title">🏟️ CREATE LEAGUE</div>

              <label className="ll-label">League Name</label>
              <input className="ll-input" placeholder="e.g. Sunday Kings" value={leagueName}
                onChange={e => setLeagueName(e.target.value)} maxLength={32} autoFocus />

              <label className="ll-label">Max Players</label>
              <div className="ll-option-row">
                {[4, 6, 8, 10, 12].map(n => (
                  <button key={n} className={`ll-opt${maxPlayers === n ? ' active' : ''}`}
                    onClick={() => setMaxPlayers(n)}>{n}</button>
                ))}
              </div>

              <label className="ll-label">Visibility</label>
              <div className="ll-option-row">
                <button className={`ll-opt${isPublic ? ' active' : ''}`} onClick={() => setIsPublic(true)}>
                  🌐 Public
                </button>
                <button className={`ll-opt${!isPublic ? ' active' : ''}`} onClick={() => setIsPublic(false)}>
                  🔒 Invite Only
                </button>
              </div>

              <label className="ll-label">Playoff Format</label>
              <div className="ll-option-row">
                <button className={`ll-opt wide${playoffFormat === 'best_of_3' ? ' active' : ''}`}
                  onClick={() => setPlayoffFormat('best_of_3')}>
                  ⚔️ Best of 3
                </button>
                <button className={`ll-opt wide${playoffFormat === 'gauntlet' ? ' active' : ''}`}
                  onClick={() => setPlayoffFormat('gauntlet')}>
                  🔥 Gauntlet
                </button>
              </div>

              <label className="ll-label">Playoff Size</label>
              <div className="ll-option-row">
                {[25, 50, 75].map(n => (
                  <button key={n} className={`ll-opt${playoffPct === n ? ' active' : ''}`}
                    onClick={() => setPlayoffPct(n)}>Top {n}%</button>
                ))}
              </div>

              <button className="ll-btn primary" onClick={createLeague}
                disabled={creating || !leagueName.trim()} style={{ marginTop: '1rem', width: '100%' }}>
                {creating ? 'CREATING...' : 'CREATE LEAGUE'}
              </button>
              <button className="ll-cancel" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}

/* ── Styles ── */
const LOBBY_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Barlow+Condensed:wght@400;500;600;700;800&family=Barlow:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.ll-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:1.3rem 1.2rem;border-bottom:2px solid #0d1835;position:sticky;top:0;background:#050a18;z-index:30}
.ll-back{color:#ffd700;text-decoration:none;font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:700}
.ll-back:hover{color:#d4e8f8}
.ll-title{display:flex;align-items:center;gap:.6rem;font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.2rem;letter-spacing:.22em;color:#9a28dc;justify-self:center;text-shadow:0 0 24px rgba(154,40,220,.5)}
.ll-pip{width:9px;height:9px;border-radius:50%;background:#9a28dc;box-shadow:0 0 12px #9a28dc;flex-shrink:0;animation:pip 2s ease-in-out infinite}
@keyframes pip{0%,100%{box-shadow:0 0 12px #9a28dc}50%{box-shadow:0 0 22px #9a28dc,0 0 48px rgba(154,40,220,.8)}}

.ll-root{min-height:calc(100vh - 60px);background:#050a18;padding:0 1rem 4rem;width:100%;margin:0 auto}

.ll-content-wrapper {
  max-width: 960px;           /* Good balance — feels spacious but readable */
  margin: 0 auto;             /* centers the content */
  width: 38%;
  padding: 0 1rem;            /* extra breathing room on very large screens */
}

.ll-hero{text-align:center;padding:2rem 1rem 1.5rem}
.ll-hero-sup{font-size:.6rem;letter-spacing:.4em;color:#3a6080;margin-bottom:.3rem}
.ll-hero-title{padding-top:10px;padding-bottom:10px;font-family:'Orbitron',sans-serif;font-weight:900;font-size:clamp(2rem,7vw,3.5rem);line-height:.92;background:linear-gradient(135deg,#7a18b8,#9a28dc 40%,#b848fc 70%,#7a18b8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:.7rem}
.ll-hero-sub{font-size:.85rem;color:#3a6080;letter-spacing:.08em;font-family:'Barlow Condensed',sans-serif}

.ll-actions{display:flex;flex-direction:column;gap:1rem;margin-bottom:2rem}

.ll-join-section{background:rgba(8,14,30,.7);border:1px solid #0d1835;border-radius:12px;padding:1rem}
.ll-join-title{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.72rem;letter-spacing:.2em;color:#9a28dc;margin-bottom:.7rem}
.ll-join-row{display:flex;gap:.5rem;margin-top:.5rem}

.ll-btn{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.92rem;letter-spacing:.1em;border-radius:10px;cursor:pointer;transition:all .2s;border:none;padding:13px 22px;text-align:center}
.ll-btn.primary{background:linear-gradient(135deg,#5d108a,#9a28dc);color:#fff}
.ll-btn.primary:hover{filter:brightness(1.15);transform:scale(1.02)}
.ll-btn.primary:disabled{opacity:.5;cursor:default;transform:none}
.ll-btn.secondary{background:transparent;border:2px solid #1a3050;color:#3a6080;flex-shrink:0}
.ll-btn.secondary:hover{border-color:#9a28dc;color:#9a28dc}
.ll-btn.small{font-size:.75rem;padding:8px 14px;margin-top:.5rem}

.ll-input{width:100%;background:rgba(4,8,16,.9);border:1px solid #1a3050;border-radius:8px;padding:10px 14px;color:#d4e8f8;font-family:'Barlow Condensed',sans-serif;font-size:.9rem;outline:none;transition:border-color .15s}
.ll-input:focus{border-color:#9a28dc}
.ll-input::placeholder{color:#2a4060}

.ll-error{color:#ff6b6b;font-size:.75rem;margin-top:.4rem;font-family:'Barlow Condensed',sans-serif}

.ll-section{margin-bottom:1.5rem}
.ll-sec-title{font-family:'Orbitron',sans-serif;font-weight:700;font-size:.75rem;letter-spacing:.2em;color:#9a28dc;margin-bottom:.7rem}

.ll-league-list{display:flex;flex-direction:column;gap:.6rem}
.ll-league-card{display:block;background:rgba(8,14,30,.7);border:1px solid #0d1835;border-radius:10px;padding:.9rem 1rem;text-decoration:none;transition:border-color .2s}
.ll-league-card:hover{border-color:#9a28dc}
.ll-lc-name{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1rem;letter-spacing:.06em;color:#d4e8f8;margin-bottom:.3rem}
.ll-lc-meta{display:flex;gap:.8rem;font-size:.7rem;color:#3a6080;font-family:'Barlow Condensed',sans-serif}
.ll-lc-status{font-weight:700;letter-spacing:.1em}
.ll-lc-status.setup{color:#ffd700}
.ll-lc-status.active{color:#28dc78}
.ll-lc-status.playoffs{color:#e040ff}
.ll-lc-status.complete{color:#42c0f8}

.ll-overlay{position:fixed;inset:0;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(10px);padding:1rem}
.ll-modal{background:#07101e;border:2px solid #1a3050;border-radius:16px;padding:1.5rem;max-width:420px;width:100%;max-height:90vh;overflow-y:auto;animation:fade-up .3s ease}
@keyframes fade-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.ll-modal-title{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.1rem;letter-spacing:.12em;color:#9a28dc;text-align:center;margin-bottom:1.2rem}

.ll-label{display:block;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.68rem;letter-spacing:.18em;color:#3a6080;margin:1rem 0 .4rem}
.ll-option-row{display:flex;gap:.4rem;flex-wrap:wrap}
.ll-opt{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.78rem;letter-spacing:.08em;padding:.5rem .8rem;border-radius:8px;cursor:pointer;transition:.15s;background:rgba(4,8,16,.7);border:1px solid #0d1835;color:#3a6080}
.ll-opt.active{background:rgba(154,40,220,.15);border-color:rgba(154,40,220,.4);color:#9a28dc}
.ll-opt:hover:not(.active){border-color:#1a3050;color:#5a8ab0}
.ll-opt.wide{flex:1;text-align:center}

.ll-cancel{display:block;width:100%;background:none;border:none;color:#2a4060;font-family:'Barlow Condensed',sans-serif;font-size:.78rem;letter-spacing:.1em;cursor:pointer;margin-top:.7rem;padding:.5rem;transition:.15s}
.ll-cancel:hover{color:#5a8ab0}
`;
