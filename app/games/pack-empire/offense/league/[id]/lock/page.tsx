'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SLOTS } from '@/lib/league-utils';

type Rarity = 'common' | 'rare' | 'dynasty' | 'transcendent' | 'immortal';
interface Player { id: string; name: string; pos: string; team: string; score: number; rarity: Rarity; accolades: string[]; }

const RC: Record<Rarity, { label: string; color: string; glow: string; art: string }> = {
  common:       { label: 'COMMON',       color: '#c87840', glow: 'rgba(200,120,60,.6)',  art: 'linear-gradient(150deg,#3d2210,#7a4820)' },
  rare:         { label: 'RARE',         color: '#42c0f8', glow: 'rgba(66,192,248,.7)',  art: 'linear-gradient(150deg,#062840,#104870)' },
  dynasty:      { label: 'DYNASTY',      color: '#ffd700', glow: 'rgba(255,215,0,.8)',   art: 'linear-gradient(150deg,#3a2800,#806010)' },
  transcendent: { label: 'TRANSCENDENT', color: '#e040ff', glow: 'rgba(224,64,255,.85)', art: 'linear-gradient(150deg,#280048,#6010b0)' },
  immortal:     { label: 'IMMORTAL',     color: '#28dc78', glow: 'rgba(40,220,120,.8)',  art: 'linear-gradient(150deg,#021a0a,#04401a)' },
};

function parseCSVRow(row: string): string[] {
  const cols: string[] = []; let cur = ''; let inQ = false;
  for (const c of row) { if (c === '"') { inQ = !inQ; continue; } if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; } cur += c; }
  cols.push(cur.trim()); return cols;
}

/* ══════════════════════════════════════════════════════════════════════
   LOCK PLAYER PAGE — Choose 1 player to lock after weekly draft
══════════════════════════════════════════════════════════════════════ */
export default function LockPlayer() {
  const params   = useParams();
  const router   = useRouter();
  const supabase = createClient();
  const leagueId = params.id as string;

  const [team, setTeam]         = useState<any>(null);
  const [league, setLeague]     = useState<any>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [locking, setLocking]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    fetch('/players.csv').then(r => r.ok ? r.text() : Promise.reject()).then(text => {
      const map: Record<string, string> = {};
      text.split('\n').forEach(line => {
        if (!line.trim()) return;
        const cols = parseCSVRow(line);
        if (cols[1] && cols[22]?.startsWith('http')) map[cols[1]] = cols[22];
      });
      setImageMap(map);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: leagueData } = await supabase.from('leagues').select('*').eq('id', leagueId).single();
      setLeague(leagueData);

      const { data: teamData } = await supabase
        .from('league_teams')
        .select('*')
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
        .eq('week', leagueData?.current_week)
        .single();

      if (!teamData || !teamData.draft_complete) {
        router.push(`/games/pack-empire/league/${leagueId}`);
        return;
      }
      if (teamData.locked_pick) {
        router.push(`/games/pack-empire/league/${leagueId}`);
        return;
      }
      setTeam(teamData);
      setLoading(false);
    }
    load();
  }, [leagueId]);

  // Get which slots are already locked from previous weeks
  const alreadyLocked = new Set((team?.locked_players || []).map((lp: any) => lp.slot));

  // Lockable slots = filled and not already locked
  const lockableSlots = SLOTS.map((s, i) => ({ ...s, index: i }))
    .filter(s => team?.lineup?.[s.index] && !alreadyLocked.has(s.key));

  const lockPlayer = useCallback(async () => {
    if (selected === null || !team || locking) return;
    setLocking(true);
    try {
      const slot = SLOTS[selected];
      const player = team.lineup[selected] as Player;

      const newLockedPlayers = [
        ...(team.locked_players || []),
        { slot: slot.key, player },
      ];

      const { error } = await supabase
        .from('league_teams')
        .update({
          locked_players: newLockedPlayers,
          locked_pick: slot.key,
        })
        .eq('id', team.id);

      if (error) throw error;
      setConfirmed(true);
      setTimeout(() => {
        router.push(`/games/pack-empire/league/${leagueId}`);
      }, 2000);
    } catch (e: any) {
      alert('Failed to lock: ' + e.message);
    } finally {
      setLocking(false);
    }
  }, [selected, team, locking, supabase, leagueId, router]);

  if (loading) return (
    <div style={{ background: '#050a18', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#3a6080', fontFamily: 'Orbitron, sans-serif', letterSpacing: '.2em' }}>LOADING...</div>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LOCK_STYLES }} />

      <nav className="lk-nav">
        <Link href={`/games/pack-empire/league/${leagueId}`} className="lk-back">← Dashboard</Link>
        <div className="lk-title">🔒 LOCK A PLAYER</div>
        <div />
      </nav>

      <div className="lk-root">
        {confirmed ? (
          <div className="lk-confirmed">
            <div className="lk-conf-icon">🔒</div>
            <div className="lk-conf-text">PLAYER LOCKED!</div>
            <div className="lk-conf-sub">This player will carry over to next week's lineup</div>
          </div>
        ) : (
          <>
            <div className="lk-hero">
              <div className="lk-hero-title">LOCK ONE PLAYER</div>
              <div className="lk-hero-sub">
                Choose 1 player from this week's draft to keep permanently.
                They'll be locked into your lineup for the rest of the season.
                <br/>
                <strong>Already locked: {alreadyLocked.size} / 11</strong>
              </div>
            </div>

            <div className="lk-grid">
              {lockableSlots.map(slot => {
                const player = team.lineup[slot.index] as Player;
                const rc = RC[player.rarity];
                const imgSrc = imageMap[player.name];
                const isSelected = selected === slot.index;

                return (
                  <div
                    key={slot.key}
                    className={`lk-card${isSelected ? ' selected' : ''}`}
                    onClick={() => setSelected(slot.index)}
                    style={{ '--rc': rc.color, '--rg': rc.glow, '--art': rc.art } as React.CSSProperties}
                  >
                    <div className="lk-c-pos">{slot.short}</div>
                    <div className="lk-c-art" style={{ background: rc.art }}>
                      {imgSrc && <img src={imgSrc} alt={player.name} className="lk-c-img"
                        onError={e => (e.currentTarget.style.display='none')} />}
                    </div>
                    <div className="lk-c-info">
                      <div className="lk-c-name">{player.name}</div>
                      <div className="lk-c-team">{player.team}</div>
                      <div className="lk-c-rar" style={{ color: rc.color }}>{rc.label}</div>
                      <div className="lk-c-score" style={{ color: rc.color }}>{player.score.toLocaleString()}</div>
                    </div>
                    {isSelected && <div className="lk-c-check">🔒</div>}
                  </div>
                );
              })}
            </div>

            {selected !== null && (
              <div className="lk-confirm-bar">
                <div className="lk-confirm-text">
                  Lock <strong>{(team.lineup[selected] as Player).name}</strong> at {SLOTS[selected].short}?
                </div>
                <button className="lk-confirm-btn" onClick={lockPlayer} disabled={locking}>
                  {locking ? 'LOCKING...' : '🔒 CONFIRM LOCK'}
                </button>
                <div className="lk-confirm-warn">⚠️ This cannot be undone</div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

const LOCK_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Barlow+Condensed:wght@400;500;600;700;800&family=Barlow:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.lk-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:1.3rem 1.2rem;border-bottom:2px solid #0d1835;position:sticky;top:0;background:#050a18;z-index:30}
.lk-back{color:#9a28dc;text-decoration:none;font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:700}
.lk-title{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1rem;letter-spacing:.15em;color:#9a28dc;justify-self:center}

.lk-root{min-height:calc(100vh - 60px);background:#050a18;padding:1rem 1rem 4rem;max-width:700px;margin:0 auto}

.lk-hero{text-align:center;padding:1.5rem 1rem;margin-bottom:1rem}
.lk-hero-title{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1.4rem;letter-spacing:.1em;color:#9a28dc;margin-bottom:.5rem}
.lk-hero-sub{font-family:'Barlow Condensed',sans-serif;font-size:.85rem;color:#3a6080;line-height:1.6}
.lk-hero-sub strong{color:#9a28dc}

.lk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.8rem;margin-bottom:1.5rem}

.lk-card{background:rgba(8,14,30,.7);border:2px solid #0d1835;border-radius:12px;overflow:hidden;cursor:pointer;transition:all .2s;position:relative}
.lk-card:hover{border-color:var(--rc,#333);transform:translateY(-4px);box-shadow:0 0 20px var(--rg,transparent)}
.lk-card.selected{border-color:#9a28dc;box-shadow:0 0 30px rgba(154,40,220,.4);transform:translateY(-6px) scale(1.03)}

.lk-c-pos{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.58rem;letter-spacing:.14em;color:#fff;background:rgba(4,8,16,.9);padding:.3rem .5rem}
.lk-c-art{height:100px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.lk-c-img{position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);height:110%;width:auto;object-fit:contain;z-index:2}
.lk-c-info{padding:.5rem .6rem;background:rgba(4,8,16,.95)}
.lk-c-name{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.85rem;color:#d4e8f8;line-height:1.2;margin-bottom:.15rem}
.lk-c-team{font-size:.55rem;color:#3a6080;margin-bottom:.2rem}
.lk-c-rar{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.5rem;letter-spacing:.16em;margin-bottom:.15rem}
.lk-c-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1.1rem}
.lk-c-check{position:absolute;top:8px;right:8px;font-size:1.2rem;background:rgba(154,40,220,.9);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(154,40,220,.6);animation:lock-pop .3s ease}
@keyframes lock-pop{from{transform:scale(0)}to{transform:scale(1)}}

.lk-confirm-bar{text-align:center;padding:1.2rem;background:rgba(154,40,220,.06);border:2px solid rgba(154,40,220,.2);border-radius:12px}
.lk-confirm-text{font-family:'Barlow Condensed',sans-serif;font-size:.9rem;color:#d4e8f8;margin-bottom:.7rem}
.lk-confirm-text strong{color:#9a28dc}
.lk-confirm-btn{background:linear-gradient(135deg,#5d108a,#9a28dc);color:#fff;border:none;border-radius:10px;padding:12px 28px;font-family:'Orbitron',sans-serif;font-weight:700;font-size:.88rem;letter-spacing:.1em;cursor:pointer;transition:.2s;margin-bottom:.4rem}
.lk-confirm-btn:hover{filter:brightness(1.15)}
.lk-confirm-btn:disabled{opacity:.5;cursor:default}
.lk-confirm-warn{font-size:.6rem;color:#2a4060;letter-spacing:.1em;font-family:'Barlow Condensed',sans-serif}

.lk-confirmed{text-align:center;padding:3rem 1rem}
.lk-conf-icon{font-size:3rem;margin-bottom:.7rem;animation:lock-pop .5s cubic-bezier(.36,1.6,.64,1)}
.lk-conf-text{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:.12em;color:#9a28dc;margin-bottom:.4rem}
.lk-conf-sub{font-size:.82rem;color:#3a6080;font-family:'Barlow Condensed',sans-serif}
`;
