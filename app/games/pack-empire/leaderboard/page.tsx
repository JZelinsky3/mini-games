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

/* ─── Rarity config (preserved — these drive MiniCard visuals) ── */
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

/* Tier colors remapped toward editorial amber family for harmony;
   GOAT kept magenta, tier ladder tightly matches offense page. */
const TIERS = [
  { min: 20001, label: 'GOAT OFFENSE',      color: '#e040ff' },
  { min: 17001, label: 'HALL OF FAME',       color: '#f4c06a' },
  { min: 14001, label: 'SUPER BOWL DYNASTY', color: '#e8a84b' },
  { min: 11001, label: 'ALL-PRO ELITE',      color: '#6ba8c0' },
  { min: 8001,  label: 'PRO BOWL CALIBER',  color: '#68a878' },
  { min: 5001,  label: 'STARTER QUALITY',   color: '#bfb5a0' },
  { min: 2001,  label: 'BACKUP UNIT',        color: '#7d7463' },
  { min: 0,     label: 'PRACTICE SQUAD',     color: '#a87420' },
];

function getTierColor(label: string) {
  return TIERS.find(t => t.label === label)?.color ?? '#7d7463';
}

function getDisplayName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  const suffixes = new Set(['jr.','jr','sr.','sr','ii','iii','iv','v','vi']);
  const last = parts[parts.length - 1];
  const isS = suffixes.has(last.toLowerCase());
  if (isS && parts.length >= 3) return `${parts[parts.length - 2]} ${last}`;
  return last;
}

/* ─── Mini filled card (preserved — rarity design intact) ──────── */
function MiniCard({ player, slotShort, imageMap }: { player: Player | null; slotShort: string; imageMap: Record<string, string> }) {
  if (!player) {
    return (
      <div style={{
        width: 90, height: 134, borderRadius: 4, background: '#201e1a',
        border: '1px dashed #3a3630', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: '.55rem', color: '#7d7463', letterSpacing: '.16em' }}>{slotShort}</div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.48rem', color: '#3a3630', marginTop: 4, letterSpacing: '.16em' }}>EMPTY</div>
      </div>
    );
  }
  const rc = RC[player.rarity] ?? RC.common;
  const imgSrc = imageMap[player.name];
  return (
    <div style={{
      width: 90, height: 134, borderRadius: 4, overflow: 'hidden', flexShrink: 0,
      border: `2px solid ${rc.color}`, boxShadow: `0 0 12px ${rc.glow}`,
      display: 'flex', flexDirection: 'column', position: 'relative',
    }}>
      <div style={{ height: 18, background: 'rgba(4,8,16,.95)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5px', flexShrink: 0 }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: '.5rem', letterSpacing: '.1em', color: '#fff', background: rc.color, padding: '1px 4px', borderRadius: 2 }}>{player.pos}</span>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: '.42rem', letterSpacing: '.14em', color: rc.color }}>{rc.label}</span>
      </div>
      <div style={{ flex: 1, background: rc.art, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {imgSrc ? (
          <img src={imgSrc} alt={player.name}
            style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', height: '108%', width: 'auto', objectFit: 'contain', objectPosition: 'center bottom', zIndex: 2 }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
        ) : null}
        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '2.2rem', color: 'rgba(255,255,255,.1)', position: 'absolute', bottom: -4, right: -3, zIndex: 1, letterSpacing: '-.02em' }}>
          {player.name.charAt(0)}
        </div>
      </div>
      <div style={{ flexShrink: 0, padding: '4px 5px 4px', background: 'linear-gradient(to bottom,rgba(4,8,16,.92),rgba(4,8,16,1))', borderTop: `1.5px solid ${rc.color}` }}>
        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '.7rem', color: rc.color, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-.005em' }}>
          {getDisplayName(player.name)}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: '.72rem', color: '#f4ebd8', marginTop: 2, letterSpacing: '.02em' }}>
          {player.score.toLocaleString()}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.42rem', color: '#7d7463', marginTop: 1, letterSpacing: '.14em', textTransform: 'uppercase' }}>
          {player.team}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function LeaderboardPage() {
  const [entries, setEntries]   = useState<LeaderboardEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setSelectedId(null);

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

  function getEntryKey(entry: LeaderboardEntry, i: number): string {
    return entry.id ?? `${entry.score}-${entry.name}-${i}`;
  }

  /* Medal tokens for top 3 — kept as emojis but colored to the editorial palette */
  const medalFor = (i: number) => {
    if (i === 0) return { icon: '🥇', color: '#e8a84b' };  // amber gold
    if (i === 1) return { icon: '🥈', color: '#bfb5a0' };  // silver/cream
    if (i === 2) return { icon: '🥉', color: '#c04820' };  // rust bronze
    return null;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LB_STYLES }} />

      {/* ── Masthead / Nav ── */}
      <nav className="lb-nav">
        <div className="lb-nav-l">
          <button onClick={() => window.history.back()} className="lb-back">← Back</button>
        </div>
        <div className="lb-nav-c">
          <span className="lb-pip" />
          <span className="lb-nav-title">
            The <span className="lb-nav-italic">Leaderboard.</span>
          </span>
        </div>
        <div className="lb-nav-r">
          <Link href="/games/pack-empire" className="lb-hub">Hub →</Link>
        </div>
      </nav>

      <div className="lb-root">

        {/* ── Hero / Masthead ── */}
        <header className="lb-hero">
          <div className="lb-hero-kicker">§ Offense Pack Empire · Standings</div>
          <h1 className="lb-hero-title">
            The top <span className="lb-italic">100.</span>
          </h1>
          <div className="lb-hero-sub">
            {loading
              ? 'Loading standings —'
              : <>{entries.length} draft{entries.length !== 1 ? 's' : ''} submitted · tap any row to view the full lineup</>
            }
          </div>
        </header>

        {!loading && entries.length === 0 ? (
          <div className="lb-empty">
            <div className="lb-empty-icon">🏈</div>
            <div className="lb-empty-kicker">§ Empty board</div>
            <div className="lb-empty-title">
              No drafts <span className="lb-italic">yet.</span>
            </div>
            <div className="lb-empty-sub">
              Be the first to submit a lineup from Pack Empire.
            </div>
            <Link href="/games/pack-empire/offense" className="lb-empty-cta">
              <span>Build my offense</span>
              <span>→</span>
            </Link>
          </div>
        ) : (
          <div className="lb-table">
            <div className="lb-thead">
              <div className="lb-th rank">#</div>
              <div className="lb-th name">Draft Name</div>
              <div className="lb-th tier">Tier</div>
              <div className="lb-th score">Score</div>
              <div className="lb-th action"></div>
            </div>

            {entries.map((entry, i) => {
              const entryKey  = getEntryKey(entry, i);
              const isOpen    = selectedId === entryKey;
              const medal     = medalFor(i);

              return (
                <div
                  key={entryKey}
                  className={`lb-row${i < 3 ? ' top3' : ''}${isOpen ? ' active' : ''}`}
                  onClick={() => setSelectedId(isOpen ? null : entryKey)}
                >
                  <div className="lb-td rank">
                    {medal ? (
                      <span className="lb-rank-medal" style={{ color: medal.color }}>
                        {medal.icon}
                      </span>
                    ) : (
                      <span className="lb-rank-num">{String(i + 1).padStart(2, '0')}</span>
                    )}
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

                  {isOpen && entry.lineup && (
                    <div className="lb-lineup-panel" onClick={e => e.stopPropagation()}>
                      <div className="lb-lineup-header">
                        <div className="lb-lineup-header-l">
                          <div className="lb-lineup-kicker">§ Roster · Full lineup</div>
                          <div className="lb-lineup-name">{entry.name}</div>
                        </div>
                        <div className="lb-lineup-meta">
                          <span className="lb-meta-tier" style={{ color: getTierColor(entry.tier) }}>
                            {entry.icon} {entry.tier}
                          </span>
                          <span className="lb-meta-score">{entry.score.toLocaleString()}<span className="lb-meta-score-unit"> pts</span></span>
                        </div>
                      </div>

                      <div className="lb-formation">
                        <div className="lb-pos-label">★ Offensive line</div>
                        <div className="lb-card-row">
                          {[6,7,8,9,10].map(si => (
                            <MiniCard key={si} player={entry.lineup[si] ?? null} slotShort={SLOTS[si].short} imageMap={imageMap} />
                          ))}
                        </div>

                        <div className="lb-pos-label">★ Skill players</div>
                        <div className="lb-card-row">
                          {[2,3,5,4].map(si => (
                            <MiniCard key={si} player={entry.lineup[si] ?? null} slotShort={SLOTS[si].short} imageMap={imageMap} />
                          ))}
                        </div>

                        <div className="lb-pos-label">★ Backfield</div>
                        <div className="lb-card-row">
                          {[0,1].map(si => (
                            <MiniCard key={si} player={entry.lineup[si] ?? null} slotShort={SLOTS[si].short} imageMap={imageMap} />
                          ))}
                        </div>
                      </div>

                      <div className="lb-roster">
                        <div className="lb-roster-header">
                          <span className="lb-roster-num">§ Box score</span>
                          <span className="lb-roster-title">Every <span className="lb-italic">pick</span></span>
                        </div>
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

/* ══════════════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════════════ */
const LB_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --lb-bg:#141311;
  --lb-bg-soft:#1c1b18;
  --lb-bg-card:#201e1a;
  --lb-ink:#f4ebd8;
  --lb-ink-soft:#bfb5a0;
  --lb-ink-mute:#7d7463;
  --lb-amber:#e8a84b;
  --lb-amber-bright:#f4c06a;
  --lb-amber-deep:#a87420;
  --lb-rust:#c04820;
  --lb-line:#3a3630;
  --lb-line-soft:#2a2620;
}

body{font-family:'Space Grotesk',sans-serif;background:var(--lb-bg);color:var(--lb-ink)}

.lb-italic{font-style:italic;color:var(--lb-amber)}

/* ═══ NAV / MASTHEAD ═══ */
.lb-nav{
  display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:1rem;
  padding:1.2rem 2rem;
  background:rgba(20,19,17,.92);
  backdrop-filter:blur(12px);
  border-bottom:1px solid var(--lb-line);
  position:sticky;top:0;z-index:30;
}
.lb-nav-l{justify-self:start}
.lb-nav-c{display:flex;align-items:center;gap:.65rem;justify-self:center}
.lb-nav-r{justify-self:end}

.lb-back{
  background:none;border:none;cursor:pointer;
  color:var(--lb-amber);text-decoration:none;
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;
  padding:0;transition:color .2s;
}
.lb-back:hover{color:var(--lb-amber-bright)}

.lb-hub{
  color:var(--lb-amber);text-decoration:none;
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;
  transition:color .2s;
}
.lb-hub:hover{color:var(--lb-amber-bright)}

.lb-nav-title{
  font-family:'DM Serif Display',serif;
  font-size:1.35rem;letter-spacing:-.01em;color:var(--lb-ink);
}
.lb-nav-italic{font-style:italic;color:var(--lb-amber)}

.lb-pip{
  width:9px;height:9px;border-radius:50%;
  background:var(--lb-amber);flex-shrink:0;
  box-shadow:0 0 0 3px rgba(232,168,75,.15),0 0 12px var(--lb-amber);
  animation:lb-pip 2s ease-in-out infinite;
}
@keyframes lb-pip{
  0%,100%{box-shadow:0 0 0 3px rgba(232,168,75,.15),0 0 12px var(--lb-amber)}
  50%{box-shadow:0 0 0 6px rgba(232,168,75,.05),0 0 22px var(--lb-amber-bright)}
}

/* ═══ ROOT ═══ */
.lb-root{
  max-width:920px;margin:0 auto;
  padding:0 1.5rem 4rem;
  background:var(--lb-bg);min-height:100vh;
  background-image:
    radial-gradient(ellipse at 50% -10%,rgba(232,168,75,.06),transparent 55%),
    radial-gradient(ellipse at 15% 80%,rgba(192,72,32,.03),transparent 50%),
    repeating-linear-gradient(0deg,transparent,transparent 70px,rgba(232,168,75,.012) 70px,rgba(232,168,75,.012) 71px);
}

/* ═══ HERO ═══ */
.lb-hero{
  text-align:center;padding:3rem 1rem 2rem;
}
.lb-hero-kicker{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.62rem;letter-spacing:.32em;text-transform:uppercase;
  color:var(--lb-amber);margin-bottom:1rem;
}
.lb-hero-title{
  font-family:'DM Serif Display',serif;
  font-size:clamp(2.6rem,7vw,4.4rem);line-height:.95;letter-spacing:-.025em;
  color:var(--lb-ink);margin-bottom:1rem;
}
.lb-hero-sub{
  font-family:'DM Serif Display',serif;font-style:italic;
  font-size:1rem;color:var(--lb-ink-soft);
  max-width:540px;margin:0 auto;line-height:1.5;
}

/* ═══ EMPTY STATE ═══ */
.lb-empty{
  text-align:center;padding:4rem 2rem;
  background:var(--lb-bg-card);border:1px solid var(--lb-line);
  position:relative;
}
.lb-empty::before{
  content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:var(--lb-amber);
}
.lb-empty-icon{font-size:2.8rem;margin-bottom:1rem;opacity:.6}
.lb-empty-kicker{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.62rem;letter-spacing:.28em;text-transform:uppercase;
  color:var(--lb-amber);margin-bottom:.6rem;
}
.lb-empty-title{
  font-family:'DM Serif Display',serif;
  font-size:1.8rem;line-height:1;letter-spacing:-.02em;
  color:var(--lb-ink);margin-bottom:.7rem;
}
.lb-empty-sub{
  font-family:'Space Grotesk',sans-serif;
  font-size:.95rem;color:var(--lb-ink-soft);line-height:1.5;
  margin-bottom:1.75rem;max-width:360px;margin-left:auto;margin-right:auto;
}
.lb-empty-cta{
  display:inline-flex;align-items:center;gap:.75rem;
  background:var(--lb-amber);color:var(--lb-bg);
  padding:1rem 1.75rem;text-decoration:none;
  font-family:'Space Grotesk',sans-serif;font-weight:700;
  font-size:.88rem;letter-spacing:.18em;text-transform:uppercase;
  border-radius:2px;
  transition:all .25s cubic-bezier(.2,.8,.2,1);
  box-shadow:0 8px 20px rgba(232,168,75,.15);
}
.lb-empty-cta:hover{
  background:var(--lb-amber-bright);
  transform:translateY(-2px);
  box-shadow:0 14px 30px rgba(232,168,75,.3);
}

/* ═══ TABLE ═══ */
.lb-table{
  background:var(--lb-bg-card);border:1px solid var(--lb-line);
  overflow:hidden;
}

.lb-thead{
  display:grid;grid-template-columns:56px 1fr 200px 110px 36px;
  padding:.85rem 1.2rem;
  background:var(--lb-bg-soft);
  border-bottom:3px double var(--lb-line);
}
.lb-th{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.6rem;letter-spacing:.24em;text-transform:uppercase;
  color:var(--lb-ink-mute);
}
.lb-th.rank,.lb-td.rank{text-align:center;justify-content:center}
.lb-th.score,.lb-td.score{text-align:right;justify-content:flex-end}
.lb-th.action,.lb-td.action{text-align:center;justify-content:center}

/* ═══ ROW ═══ */
.lb-row{
  display:grid;grid-template-columns:56px 1fr 200px 110px 36px;
  padding:.95rem 1.2rem;
  border-bottom:1px solid var(--lb-line-soft);
  cursor:pointer;transition:background .15s,padding-left .2s;
  position:relative;align-items:center;
}
.lb-row:last-of-type{border-bottom:none}
.lb-row:hover{background:rgba(232,168,75,.04)}
.lb-row.top3{background:rgba(232,168,75,.06)}
.lb-row.top3:hover{background:rgba(232,168,75,.1)}
.lb-row.active{background:rgba(232,168,75,.08)!important}

.lb-td{display:flex;align-items:center;min-width:0}

.lb-rank-medal{
  font-size:1.15rem;line-height:1;
  filter:drop-shadow(0 0 8px currentColor);
}
.lb-rank-num{
  font-family:'DM Serif Display',serif;font-style:italic;
  font-size:1.2rem;letter-spacing:-.02em;
  color:var(--lb-ink-mute);
}

.lb-entry-name{
  font-family:'DM Serif Display',serif;
  font-size:1.05rem;line-height:1.15;letter-spacing:-.005em;
  color:var(--lb-ink);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}

.lb-entry-tier{
  font-family:'DM Serif Display',serif;font-style:italic;
  font-size:.88rem;letter-spacing:-.005em;
  white-space:nowrap;
}

.lb-entry-score{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.92rem;letter-spacing:.02em;
  color:var(--lb-ink);
}

.lb-chevron{
  font-size:.55rem;
  color:var(--lb-ink-mute);
  transition:color .15s,transform .15s;
}
.lb-row:hover .lb-chevron,.lb-row.active .lb-chevron{color:var(--lb-amber)}

/* ═══ LINEUP PANEL ═══ */
.lb-lineup-panel{
  grid-column:1/-1;
  background:var(--lb-bg);
  border-top:1px solid var(--lb-line);
  padding:2rem 1.5rem;
  margin:.95rem -1.2rem -.95rem;
  display:flex;flex-direction:column;gap:1.75rem;
  position:relative;
}
.lb-lineup-panel::before{
  content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:var(--lb-amber);
}

.lb-lineup-header{
  display:flex;align-items:flex-end;justify-content:space-between;
  gap:1.5rem;flex-wrap:wrap;
  padding-bottom:1rem;border-bottom:3px double var(--lb-line);
}
.lb-lineup-header-l{min-width:0}
.lb-lineup-kicker{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.6rem;letter-spacing:.26em;text-transform:uppercase;
  color:var(--lb-amber);margin-bottom:.4rem;
}
.lb-lineup-name{
  font-family:'DM Serif Display',serif;
  font-size:clamp(1.35rem,3vw,1.8rem);line-height:1;letter-spacing:-.015em;
  color:var(--lb-ink);
}

.lb-lineup-meta{
  display:flex;flex-direction:column;align-items:flex-end;gap:.2rem;
  text-align:right;flex-shrink:0;
}
.lb-meta-tier{
  font-family:'DM Serif Display',serif;font-style:italic;
  font-size:.92rem;letter-spacing:-.005em;
}
.lb-meta-score{
  font-family:'DM Serif Display',serif;
  font-size:1.6rem;line-height:1;letter-spacing:-.02em;
  color:var(--lb-ink);
}
.lb-meta-score-unit{
  font-family:'JetBrains Mono',monospace;font-weight:500;
  font-size:.65rem;letter-spacing:.15em;text-transform:uppercase;
  color:var(--lb-ink-mute);
}

/* ═══ FORMATION (cards section) ═══ */
.lb-formation{
  display:flex;flex-direction:column;gap:.45rem;
  padding:1rem 0;
}
.lb-pos-label{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.62rem;letter-spacing:.28em;text-transform:uppercase;
  color:var(--lb-amber);
  margin-top:.9rem;margin-bottom:.4rem;
}
.lb-pos-label:first-child{margin-top:0}
.lb-card-row{display:flex;gap:8px;flex-wrap:wrap}

/* ═══ ROSTER BOX SCORE ═══ */
.lb-roster{
  display:flex;flex-direction:column;gap:0;
  background:var(--lb-bg-card);
  border:1px solid var(--lb-line);
  padding:1.2rem 1.4rem;
}
.lb-roster-header{
  display:flex;justify-content:space-between;align-items:baseline;gap:.75rem;flex-wrap:wrap;
  padding-bottom:.85rem;margin-bottom:.7rem;
  border-bottom:3px double var(--lb-line);
}
.lb-roster-num{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.62rem;letter-spacing:.24em;text-transform:uppercase;
  color:var(--lb-amber);
}
.lb-roster-title{
  font-family:'DM Serif Display',serif;
  font-size:1.1rem;letter-spacing:-.01em;color:var(--lb-ink);
}

.lb-roster-row{
  display:grid;grid-template-columns:auto 1fr auto auto auto;gap:.7rem;align-items:center;
  padding:.5rem 0;
  border-bottom:1px solid var(--lb-line-soft);
  font-family:'Space Grotesk',sans-serif;
}
.lb-roster-row:last-child{border-bottom:none}

.lb-roster-pos{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.56rem;letter-spacing:.12em;text-transform:uppercase;
  color:#fff;padding:3px 6px;border-radius:2px;
  min-width:28px;text-align:center;
}
.lb-roster-name{
  font-family:'DM Serif Display',serif;
  font-size:.92rem;line-height:1.15;letter-spacing:-.005em;
  color:var(--lb-ink);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.lb-roster-team{
  font-family:'JetBrains Mono',monospace;
  font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;
  color:var(--lb-ink-mute);
  min-width:42px;text-align:center;
}
.lb-roster-rar{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.55rem;letter-spacing:.18em;
  min-width:90px;text-align:right;
}
.lb-roster-score{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.8rem;letter-spacing:.02em;
  color:var(--lb-ink);
  min-width:56px;text-align:right;
}

/* ═══ RESPONSIVE ═══ */
@media(max-width:720px){
  .lb-nav{padding:1rem 1.25rem;gap:.75rem}
  .lb-nav-title{font-size:1.1rem}
  .lb-hub{font-size:.65rem}
  .lb-back{font-size:.65rem}
  .lb-hero{padding:2rem 1rem 1.5rem}
  .lb-thead{grid-template-columns:44px 1fr 110px 32px;padding:.75rem 1rem}
  .lb-thead .tier,.lb-row .tier{display:none}
  .lb-row{grid-template-columns:44px 1fr 110px 32px;padding:.85rem 1rem}
  .lb-entry-name{font-size:.95rem}
  .lb-entry-score{font-size:.85rem}
  .lb-lineup-panel{padding:1.5rem 1rem;margin:.85rem -1rem -.85rem}
  .lb-lineup-header{align-items:flex-start}
  .lb-lineup-meta{align-items:flex-start;text-align:left}
  .lb-meta-score{font-size:1.35rem}
  .lb-roster{padding:1rem 1.1rem}
  .lb-roster-row{grid-template-columns:auto 1fr auto;gap:.6rem}
  .lb-roster-team,.lb-roster-rar{display:none}
  .lb-card-row{gap:6px}
}
@media(max-width:420px){
  .lb-thead{grid-template-columns:36px 1fr 90px 28px;padding:.65rem .85rem}
  .lb-row{grid-template-columns:36px 1fr 90px 28px;padding:.75rem .85rem}
  .lb-hero-title{font-size:2.4rem}
  .lb-entry-name{font-size:.88rem}
  .lb-entry-score{font-size:.75rem}
  .lb-rank-medal{font-size:1rem}
  .lb-rank-num{font-size:1rem}
}
`;
