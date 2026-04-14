'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SLOTS, calculateTeamScore, getTier } from '@/lib/league-utils';

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

function getDisplayName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  const suffixes = new Set(['jr.','jr','sr.','sr','ii','iii','iv','v','vi']);
  const last = parts[parts.length - 1];
  if (suffixes.has(last.toLowerCase()) && parts.length >= 3) return `${parts[parts.length - 2]} ${last}`;
  return parts.length > 1 ? last : last;
}

/* ══════════════════════════════════════════════════════════════════════
   TEAM VIEWER — View any league member's lineup
══════════════════════════════════════════════════════════════════════ */
export default function TeamViewer() {
  const params   = useParams();
  const supabase = createClient();
  const leagueId = params.id as string;
  const targetUserId = params.userId as string;

  const [team, setTeam]         = useState<any>(null);
  const [league, setLeague]     = useState<any>(null);
  const [memberName, setName]   = useState('');
  const [loading, setLoading]   = useState(true);
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [myUserId, setMyUserId] = useState('');

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
      if (user) setMyUserId(user.id);

      const { data: leagueData } = await supabase.from('leagues').select('*').eq('id', leagueId).single();
      setLeague(leagueData);

      const { data: member } = await supabase
        .from('league_members')
        .select('display_name')
        .eq('league_id', leagueId)
        .eq('user_id', targetUserId)
        .single();
      setName(member?.display_name || 'Unknown');

      const { data: teamData } = await supabase
        .from('league_teams')
        .select('*')
        .eq('league_id', leagueId)
        .eq('user_id', targetUserId)
        .eq('week', leagueData?.current_week)
        .single();

      setTeam(teamData);
      setLoading(false);
    }
    load();
  }, [leagueId, targetUserId]);

  if (loading) return (
    <div style={{ background: '#050a18', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#3a6080', fontFamily: 'Orbitron, sans-serif', letterSpacing: '.2em' }}>LOADING...</div>
    </div>
  );

  const lineup = (team?.lineup || Array(11).fill(null)) as (Player | null)[];
  const lockedSlots = new Set((team?.locked_players || []).map((lp: any) => lp.slot));
  const { baseScore, chemistryScore, totalScore, chemistry } = calculateTeamScore(lineup);
  const tier = getTier(totalScore);
  const isMe = myUserId === targetUserId;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: TV_STYLES }} />

      <nav className="tv-nav">
        <Link href={`/games/pack-empire/league/${leagueId}`} className="tv-back">← Standings</Link>
        <div className="tv-title">TEAM VIEW</div>
        <div />
      </nav>

      <div className="tv-root">
        {/* Header */}
        <div className="tv-header">
          <div className="tv-h-icon">{tier.icon}</div>
          <div className="tv-h-name">{memberName}{isMe ? ' (YOU)' : ''}</div>
          <div className="tv-h-tier" style={{ color: tier.color }}>{tier.label}</div>
          <div className="tv-h-score">{totalScore.toLocaleString()}</div>
          <div className="tv-h-breakdown">
            Base: {baseScore.toLocaleString()} · Chemistry:{' '}
            <span style={{ color: chemistryScore >= 0 ? '#28dc78' : '#ff6b6b' }}>
              {chemistryScore >= 0 ? '+' : ''}{chemistryScore}
            </span>
          </div>
        </div>

        {/* Lineup Grid */}
        <div className="tv-lineup">
          {SLOTS.map((slot, i) => {
            const player = lineup[i];
            const isLocked = lockedSlots.has(slot.key);
            const rc = player ? RC[player.rarity] : null;
            const imgSrc = player ? imageMap[player.name] : undefined;

            return (
              <div key={slot.key} className={`tv-slot${isLocked ? ' locked' : ''}${player ? ' filled' : ''}`}
                style={player ? { '--rc': rc!.color, '--rg': rc!.glow, '--art': rc!.art, borderColor: isLocked ? '#9a28dc' : rc!.color + '44' } as React.CSSProperties : {}}>
                {isLocked && <div className="tv-lock-icon">🔒</div>}
                <div className="tv-s-pos">{slot.short}</div>
                {player ? (
                  <>
                    <div className="tv-s-art" style={{ background: rc!.art }}>
                      {imgSrc && <img src={imgSrc} alt={player.name} className="tv-s-img"
                        onError={e => (e.currentTarget.style.display='none')} />}
                    </div>
                    <div className="tv-s-info">
                      <div className="tv-s-name">{player.name}</div>
                      <div className="tv-s-team">{player.team}</div>
                      <div className="tv-s-rar" style={{ color: rc!.color }}>{rc!.label}</div>
                      <div className="tv-s-score" style={{ color: rc!.color }}>{player.score.toLocaleString()}</div>
                    </div>
                  </>
                ) : (
                  <div className="tv-s-empty">—</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Chemistry Breakdown */}
        {(chemistry.sameTeamLinks.length > 0 || chemistry.rivalLinks.length > 0) && (
          <div className="tv-chem-section">
            <div className="tv-chem-title">⚡ CHEMISTRY BREAKDOWN</div>
            {chemistry.sameTeamLinks.length > 0 && (
              <div className="tv-chem-group">
                <div className="tv-chem-label" style={{ color: '#28dc78' }}>TEAM SYNERGIES (+{chemistry.sameTeamCount * 200})</div>
                {chemistry.sameTeamLinks.map((link, i) => (
                  <div key={i} className="tv-chem-row positive">
                    <span>{link.players[0]} + {link.players[1]}</span>
                    <span className="tv-chem-val">+{link.bonus}</span>
                  </div>
                ))}
              </div>
            )}
            {chemistry.rivalLinks.length > 0 && (
              <div className="tv-chem-group">
                <div className="tv-chem-label" style={{ color: '#ff6b6b' }}>RIVALRIES ({chemistry.rivalCount * -150})</div>
                {chemistry.rivalLinks.map((link, i) => (
                  <div key={i} className="tv-chem-row negative">
                    <span>{link.players[0]} vs {link.players[1]}</span>
                    <span className="tv-chem-val">{link.penalty}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

const TV_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Barlow+Condensed:wght@400;500;600;700;800&family=Barlow:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.tv-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:1.3rem 1.2rem;border-bottom:2px solid #0d1835;position:sticky;top:0;background:#050a18;z-index:30}
.tv-back{color:#9a28dc;text-decoration:none;font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:700}
.tv-title{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1rem;letter-spacing:.18em;color:#9a28dc;justify-self:center}

.tv-root{min-height:calc(100vh - 60px);background:#050a18;padding:1rem 1rem 4rem;max-width:700px;margin:0 auto}

.tv-header{text-align:center;padding:1.5rem 1rem;background:rgba(8,14,30,.7);border:1px solid #0d1835;border-radius:14px;margin-bottom:1rem}
.tv-h-icon{font-size:2.2rem;margin-bottom:.3rem}
.tv-h-name{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.1rem;letter-spacing:.08em;color:#d4e8f8;margin-bottom:.2rem}
.tv-h-tier{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1.1rem;letter-spacing:.08em;margin-bottom:.3rem}
.tv-h-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:2.2rem;line-height:1;background:linear-gradient(135deg,#7a18b8,#9a28dc,#b848fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.tv-h-breakdown{font-size:.7rem;color:#3a6080;font-family:'Barlow Condensed',sans-serif;margin-top:.3rem}

.tv-lineup{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:.6rem;margin-bottom:1.5rem}

.tv-slot{background:rgba(8,14,30,.7);border:2px solid #0d1835;border-radius:10px;overflow:hidden;position:relative;transition:.2s}
.tv-slot.locked{border-width:3px;box-shadow:0 0 16px rgba(154,40,220,.25)}
.tv-slot.filled{border-color:var(--rc,#333)}
.tv-lock-icon{position:absolute;top:4px;right:4px;font-size:.7rem;z-index:5;background:rgba(154,40,220,.85);border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(154,40,220,.5)}

.tv-s-pos{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.6rem;letter-spacing:.14em;color:#fff;background:rgba(4,8,16,.9);padding:.3rem .5rem}
.tv-s-art{height:90px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.tv-s-img{position:absolute;bottom:-3px;left:50%;transform:translateX(-50%);height:108%;width:auto;object-fit:contain;z-index:2}
.tv-s-info{padding:.5rem .6rem;background:rgba(4,8,16,.95)}
.tv-s-name{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.82rem;color:#d4e8f8;line-height:1.2;margin-bottom:.1rem}
.tv-s-team{font-size:.5rem;color:#3a6080;margin-bottom:.15rem}
.tv-s-rar{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.48rem;letter-spacing:.14em;margin-bottom:.1rem}
.tv-s-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1rem}
.tv-s-empty{font-size:.7rem;color:#1a3050;text-align:center;padding:2rem;font-family:'Barlow Condensed',sans-serif}

.tv-chem-section{background:rgba(8,14,30,.7);border:1px solid #0d1835;border-radius:12px;padding:1rem}
.tv-chem-title{font-family:'Orbitron',sans-serif;font-weight:700;font-size:.72rem;letter-spacing:.15em;color:#9a28dc;margin-bottom:.8rem;text-align:center}
.tv-chem-group{margin-bottom:.7rem}
.tv-chem-label{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.65rem;letter-spacing:.12em;margin-bottom:.3rem}
.tv-chem-row{display:flex;justify-content:space-between;align-items:center;padding:.3rem .5rem;border-radius:5px;font-family:'Barlow Condensed',sans-serif;font-size:.75rem;color:#5a8ab0}
.tv-chem-row.positive{background:rgba(40,220,120,.04)}
.tv-chem-row.negative{background:rgba(255,100,100,.04)}
.tv-chem-val{font-weight:700;font-family:'Orbitron',sans-serif;font-size:.7rem}
.tv-chem-row.positive .tv-chem-val{color:#28dc78}
.tv-chem-row.negative .tv-chem-val{color:#ff6b6b}
`;
