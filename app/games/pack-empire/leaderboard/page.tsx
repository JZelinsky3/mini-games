'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ─────────────────────────────────────────────────────── */
type Rarity = 'common' | 'rare' | 'dynasty' | 'transcendent' | 'immortal';
interface Player {
  id: string; name: string; pos: string; team: string;
  score: number; rarity: Rarity; accolades: string[];
}
interface LeaderboardEntry {
  id?: string; name: string; score: number; tier: string; icon: string;
  timestamp: number; lineup: (Player | null)[];
}

/* ─── Rarity config ──────────────────────────────────────────────── */
const RC: Record<Rarity, { label: string; color: string; glow: string; art: string }> = {
  common:       { label: 'COMMON',       color: '#c87840', glow: 'rgba(200,120,60,.6)',  art: 'linear-gradient(150deg,#3d2210,#7a4820)' },
  rare:         { label: 'RARE',         color: '#42c0f8', glow: 'rgba(66,192,248,.7)',  art: 'linear-gradient(150deg,#062840,#104870)' },
  dynasty:      { label: 'DYNASTY',      color: '#ffd700', glow: 'rgba(255,215,0,.8)',   art: 'linear-gradient(150deg,#3a2800,#806010)' },
  transcendent: { label: 'TRANSCENDENT', color: '#e040ff', glow: 'rgba(224,64,255,.85)', art: 'linear-gradient(150deg,#280048,#6010b0)' },
  immortal:     { label: 'IMMORTAL',     color: '#28dc78', glow: 'rgba(40,220,120,.8)',  art: 'linear-gradient(150deg,#021a0a,#04401a)' },
};

const SLOTS = [
  { key: 'QB',  short: 'QB' }, { key: 'RB',  short: 'HB' },
  { key: 'WR1', short: 'WR' }, { key: 'WR2', short: 'WR' }, { key: 'WR3', short: 'WR' },
  { key: 'TE',  short: 'TE' }, { key: 'LT',  short: 'LT' }, { key: 'LG',  short: 'LG' },
  { key: 'C',   short: 'C'  }, { key: 'RG',  short: 'RG' }, { key: 'RT',  short: 'RT' },
] as const;

const TIERS = [
  { min: 20001, label: 'GOAT OFFENSE',      color: '#e040ff' },
  { min: 17001, label: 'HALL OF FAME',       color: '#ffd700' },
  { min: 14001, label: 'SUPER BOWL DYNASTY', color: '#f0c030' },
  { min: 11001, label: 'ALL-PRO ELITE',      color: '#42c0f8' },
  { min: 8001,  label: 'PRO BOWL CALIBER',  color: '#50d870' },
  { min: 5001,  label: 'STARTER QUALITY',   color: '#a0b8d0' },
  { min: 2001,  label: 'BACKUP UNIT',        color: '#808080' },
  { min: 0,     label: 'PRACTICE SQUAD',     color: '#e8a060' },
];

function getTierColor(label: string) {
  return TIERS.find(t => t.label === label)?.color ?? '#3a6080';
}

function getDisplayName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  const suffixes = new Set(['jr.','jr','sr.','sr','ii','iii','iv','v','vi']);
  const last = parts[parts.length - 1];
  const isS = suffixes.has(last.toLowerCase());
  if (isS && parts.length >= 3) return `${parts[parts.length - 2]} ${last}`;
  return last;
}

/* ─── Mini filled card ──────────────────────────────────────────── */
function MiniCard({ player, slotShort, imageMap }: { player: Player | null; slotShort: string; imageMap: Record<string, string> }) {
  if (!player) {
    return (
      <div style={{
        width: 90, height: 134, borderRadius: 8, background: 'rgba(8,14,30,.8)',
        border: '1px solid #0d1835', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: '.58rem', color: '#1a3050', letterSpacing: '.12em' }}>{slotShort}</div>
        <div style={{ fontSize: '.5rem', color: '#0d1835', marginTop: 4 }}>EMPTY</div>
      </div>
    );
  }
  const rc = RC[player.rarity] ?? RC.common;
  const imgSrc = imageMap[player.name];
  return (
    <div style={{
      width: 90, height: 134, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
      border: `2px solid ${rc.color}`, boxShadow: `0 0 12px ${rc.glow}`,
      display: 'flex', flexDirection: 'column', position: 'relative',
    }}>
      <div style={{ height: 18, background: 'rgba(4,8,16,.95)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5px', flexShrink: 0 }}>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: '.5rem', letterSpacing: '.1em', color: '#fff', background: rc.color, padding: '1px 4px', borderRadius: 2 }}>{player.pos}</span>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: '.42rem', letterSpacing: '.14em', color: rc.color }}>{rc.label}</span>
      </div>
      <div style={{ flex: 1, background: rc.art, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {imgSrc ? (
          <img src={imgSrc} alt={player.name}
            style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', height: '108%', width: 'auto', objectFit: 'contain', objectPosition: 'center bottom', zIndex: 2 }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
        ) : null}
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: '2.2rem', color: 'rgba(255,255,255,.1)', position: 'absolute', bottom: -4, right: -3, zIndex: 1 }}>
          {player.name.charAt(0)}
        </div>
      </div>
      <div style={{ flexShrink: 0, padding: '4px 5px 4px', background: 'linear-gradient(to bottom,rgba(4,8,16,.92),rgba(4,8,16,1))', borderTop: `1.5px solid ${rc.color}` }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: '.62rem', color: rc.color, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {getDisplayName(player.name)}
        </div>
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: '.72rem', color: '#d4e8f8', marginTop: 1 }}>
          {player.score.toLocaleString()}
        </div>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: '.42rem', color: '#3a6080', marginTop: 1, letterSpacing: '.06em' }}>
          {player.team}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function LeaderboardPage() {
  const [entries, setEntries]   = useState<LeaderboardEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null); // use unique id not timestamp
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setSelectedId(null); // always clear selection on load

    const supabase = createClient();
    supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(100)
      .then(({ data }: { data: LeaderboardEntry[] | null }) => {
        setEntries(data ?? []);
        setLoading(false);
      });

    fetch('/players.csv')
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(text => {
        const map: Record<string, string> = {};
        text.split('\n').forEach(line => {
          if (!line.trim()) return;
          const cols: string[] = [];
          let cur = ''; let inQ = false;
          for (const c of line) {
            if (c === '"') { inQ = !inQ; continue; }
            if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; }
            cur += c;
          }
          cols.push(cur.trim());
          const name = cols[1]; const url = cols[22];
          if (name && url && url.startsWith('http')) map[name] = url;
        });
        setImageMap(map);
      }).catch(() => {});
  }, []);

  // unique key per entry — use supabase id if available, else index-based fallback
  function getEntryKey(entry: LeaderboardEntry, i: number): string {
    return entry.id ?? `${entry.score}-${entry.name}-${i}`;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LB_STYLES }} />

      <nav className="lb-nav">
        <Link href="/games/pack-empire/offense" className="lb-back">← Pack Empire</Link>
        <div className="lb-nav-title"><span className="lb-pip" />LEADERBOARD</div>
        <Link href="/games/pack-empire" className="lb-hub">Hub</Link>
      </nav>

      <div className="lb-root">
        <div className="lb-hero">
          <div className="lb-hero-sup">OFFENSE PACK EMPIRE</div>
          <div className="lb-hero-title">TOP 100<br />DRAFTS</div>
          <div className="lb-hero-sub">
            {loading ? 'Loading...' : `${entries.length} draft${entries.length !== 1 ? 's' : ''} submitted · click any row to view the full lineup`}
          </div>
        </div>

        {!loading && entries.length === 0 ? (
          <div className="lb-empty">
            <div className="lb-empty-icon">🏈</div>
            <div className="lb-empty-title">No drafts yet</div>
            <div className="lb-empty-sub">Be the first to submit a lineup from Pack Empire</div>
            <Link href="/games/pack-empire/offense" className="lb-empty-cta">Build My Offense →</Link>
          </div>
        ) : (
          <div className="lb-table">
            <div className="lb-thead">
              <div className="lb-th rank">#</div>
              <div className="lb-th name">DRAFT NAME</div>
              <div className="lb-th tier">TIER</div>
              <div className="lb-th score">SCORE</div>
              <div className="lb-th action"></div>
            </div>

            {entries.map((entry, i) => {
              const entryKey  = getEntryKey(entry, i);
              const isOpen    = selectedId === entryKey;

              return (
                <div
                  key={entryKey}
                  className={`lb-row${i < 3 ? ' top3' : ''}${isOpen ? ' active' : ''}`}
                  onClick={() => setSelectedId(isOpen ? null : entryKey)}
                >
                  <div className="lb-td rank">
                    <span className="lb-rank-num" style={{
                      color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#3a6080'
                    }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                  </div>
                  <div className="lb-td name">
                    <span className="lb-entry-name">{entry.name}</span>
                  </div>
                  <div className="lb-td tier">
                    <span className="lb-entry-tier" style={{ color: getTierColor(entry.tier) }}>
                      {entry.icon} {entry.tier}
                    </span>
                  </div>
                  <div className="lb-td score">
                    <span className="lb-entry-score">{entry.score.toLocaleString()}</span>
                  </div>
                  <div className="lb-td action">
                    <span className="lb-chevron">{isOpen ? '▲' : '▼'}</span>
                  </div>

                  {/* Inline expand — only renders when this specific row is open */}
                  {isOpen && entry.lineup && (
                    <div className="lb-lineup-panel" onClick={e => e.stopPropagation()}>
                      <div className="lb-lineup-header">
                        <div className="lb-lineup-name">{entry.name}</div>
                        <div className="lb-lineup-meta">
                          <span style={{ color: getTierColor(entry.tier) }}>{entry.icon} {entry.tier}</span>
                          <span className="lb-lineup-score">{entry.score.toLocaleString()} pts</span>
                        </div>
                      </div>

                      <div className="lb-pos-label">OFFENSIVE LINE</div>
                      <div className="lb-card-row">
                        {[6,7,8,9,10].map(si => (
                          <MiniCard key={si} player={entry.lineup[si] ?? null} slotShort={SLOTS[si].short} imageMap={imageMap} />
                        ))}
                      </div>

                      <div className="lb-pos-label">SKILL PLAYERS</div>
                      <div className="lb-card-row">
                        {[2,3,5,4].map(si => (
                          <MiniCard key={si} player={entry.lineup[si] ?? null} slotShort={SLOTS[si].short} imageMap={imageMap} />
                        ))}
                      </div>

                      <div className="lb-pos-label">BACKFIELD</div>
                      <div className="lb-card-row">
                        {[0,1].map(si => (
                          <MiniCard key={si} player={entry.lineup[si] ?? null} slotShort={SLOTS[si].short} imageMap={imageMap} />
                        ))}
                      </div>

                      <div className="lb-roster">
                        {SLOTS.map((slot, si) => {
                          const p = entry.lineup[si];
                          if (!p) return null;
                          const rc = RC[p.rarity] ?? RC.common;
                          return (
                            <div key={slot.key} className="lb-roster-row">
                              <span className="lb-roster-pos" style={{ background: rc.color }}>{slot.short}</span>
                              <span className="lb-roster-name">{p.name}</span>
                              <span className="lb-roster-team">{p.team}</span>
                              <span className="lb-roster-rar" style={{ color: rc.color }}>{rc.label}</span>
                              <span className="lb-roster-score">{p.score.toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

const LB_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Barlow+Condensed:wght@400;500;600;700;800&family=Barlow:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Barlow Condensed',sans-serif;background:#050a18}
.lb-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:.7rem 1.4rem;
  border-bottom:2px solid #0d1835;position:sticky;top:0;background:#050a18;z-index:30}
.lb-back{color:#2a4060;text-decoration:none;font-family:'Barlow Condensed',sans-serif;font-size:.82rem;letter-spacing:.08em;transition:.15s;justify-self:start}
.lb-back:hover{color:#d4e8f8}
.lb-hub{color:#2a4060;text-decoration:none;font-family:'Barlow Condensed',sans-serif;font-size:.82rem;letter-spacing:.08em;transition:.15s;justify-self:end}
.lb-hub:hover{color:#d4e8f8}
.lb-nav-title{display:flex;align-items:center;gap:.55rem;font-family:'Orbitron',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:.22em;color:#ffd700;justify-self:center;text-shadow:0 0 20px rgba(255,215,0,.5)}
.lb-pip{width:8px;height:8px;border-radius:50%;background:#ffd700;flex-shrink:0;box-shadow:0 0 10px #ffd700;animation:pip-pulse 2s ease-in-out infinite}
@keyframes pip-pulse{0%,100%{box-shadow:0 0 10px #ffd700}50%{box-shadow:0 0 22px #ffd700}}
.lb-root{max-width:860px;margin:0 auto;padding:0 1.2rem 4rem;background:#050a18;min-height:100vh}
.lb-hero{text-align:center;padding:2rem 1rem 1.5rem;background:radial-gradient(ellipse at 50% 0%,rgba(255,215,0,.07),transparent 60%)}
.lb-hero-sup{font-size:.6rem;letter-spacing:.42em;color:#3a6080;margin-bottom:.3rem}
.lb-hero-title{font-family:'Orbitron',sans-serif;font-weight:900;font-size:clamp(2rem,6vw,3.5rem);line-height:.92;letter-spacing:.04em;background:linear-gradient(135deg,#c8a820,#ffd700 40%,#f0c030 70%,#c8a820);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:.6rem}
.lb-hero-sub{font-size:.82rem;color:#3a6080;letter-spacing:.06em}
.lb-empty{text-align:center;padding:4rem 2rem}
.lb-empty-icon{font-size:3rem;margin-bottom:.8rem;opacity:.4}
.lb-empty-title{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.1rem;letter-spacing:.1em;color:#2a4060;margin-bottom:.4rem}
.lb-empty-sub{font-size:.85rem;color:#1a3050;margin-bottom:1.5rem;letter-spacing:.06em}
.lb-empty-cta{display:inline-block;background:linear-gradient(135deg,#a07020,#ffd700);color:#050a18;font-family:'Orbitron',sans-serif;font-weight:700;font-size:.8rem;letter-spacing:.16em;padding:.75rem 1.6rem;border-radius:8px;text-decoration:none;transition:.2s}
.lb-empty-cta:hover{filter:brightness(1.1)}
.lb-table{display:flex;flex-direction:column;gap:0;border:1px solid #0d1835;border-radius:12px;overflow:hidden}
.lb-thead{display:grid;grid-template-columns:52px 1fr 200px 110px 36px;padding:.55rem .9rem;background:rgba(4,8,16,.95);border-bottom:1px solid #0d1835}
.lb-th{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.6rem;letter-spacing:.2em;color:#2a4060}
.lb-th.rank,.lb-td.rank{text-align:center}
.lb-th.score,.lb-td.score{text-align:right}
.lb-th.action,.lb-td.action{text-align:center}
.lb-row{display:grid;grid-template-columns:52px 1fr 200px 110px 36px;padding:.65rem .9rem;border-bottom:1px solid #0a1228;cursor:pointer;transition:background .15s;position:relative;align-items:center}
.lb-row:last-child{border-bottom:none}
.lb-row:hover{background:rgba(255,215,0,.03)}
.lb-row.top3{background:rgba(255,215,0,.04)}
.lb-row.top3:hover{background:rgba(255,215,0,.07)}
.lb-row.active{background:rgba(255,215,0,.06)!important}
.lb-td{display:flex;align-items:center}
.lb-rank-num{font-family:'Orbitron',sans-serif;font-weight:700;font-size:.78rem;min-width:28px;text-align:center}
.lb-entry-name{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.92rem;color:#d4e8f8;letter-spacing:.04em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lb-entry-tier{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.72rem;letter-spacing:.08em;white-space:nowrap}
.lb-entry-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:.85rem;color:#d4e8f8;margin-left:auto}
.lb-td.score{justify-content:flex-end}
.lb-chevron{font-size:.6rem;color:#2a4060;transition:.15s}
.lb-td.action{justify-content:center}
.lb-lineup-panel{grid-column:1/-1;background:rgba(4,8,16,.95);border-top:1px solid #0d1835;padding:1.2rem;margin:0 -0.9rem -0.65rem;display:flex;flex-direction:column;gap:1rem}
.lb-lineup-header{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.lb-lineup-name{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1rem;letter-spacing:.1em;color:#d4e8f8}
.lb-lineup-meta{display:flex;align-items:center;gap:.8rem;flex-wrap:wrap}
.lb-lineup-meta span{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.8rem;letter-spacing:.08em}
.lb-lineup-score{color:#d4e8f8!important}
.lb-pos-label{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.58rem;letter-spacing:.22em;color:#2a4060;margin-bottom:.4rem}
.lb-card-row{display:flex;gap:8px;flex-wrap:wrap}
.lb-roster{display:flex;flex-direction:column;gap:4px;background:rgba(2,6,14,.8);border:1px solid #0d1835;border-radius:8px;padding:.7rem .8rem}
.lb-roster-row{display:flex;align-items:center;gap:.6rem;padding:.2rem 0;border-bottom:1px solid #080e20;font-family:'Barlow Condensed',sans-serif}
.lb-roster-row:last-child{border-bottom:none}
.lb-roster-pos{font-weight:800;font-size:.58rem;letter-spacing:.1em;color:#fff;padding:1px 5px;border-radius:2px;min-width:26px;text-align:center}
.lb-roster-name{flex:1;font-weight:700;font-size:.82rem;color:#d4e8f8;letter-spacing:.02em}
.lb-roster-team{font-size:.65rem;color:#3a6080;letter-spacing:.04em;min-width:48px}
.lb-roster-rar{font-size:.58rem;font-weight:800;letter-spacing:.14em;min-width:90px}
.lb-roster-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:.72rem;color:#d4e8f8;margin-left:auto}
@media(max-width:600px){
  .lb-thead{grid-template-columns:40px 1fr 110px 36px}
  .lb-thead .tier,.lb-row .tier{display:none}
  .lb-row{grid-template-columns:40px 1fr 110px 36px}
  .lb-entry-score{font-size:.75rem}
  .lb-card-row{gap:6px}
}
@media(max-width:420px){
  .lb-thead{grid-template-columns:36px 1fr 90px 28px}
  .lb-row{grid-template-columns:36px 1fr 90px 28px}
}
`;