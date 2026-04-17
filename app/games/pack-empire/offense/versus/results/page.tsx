‘use client’;
import { useState, useEffect, useCallback, Suspense } from ‘react’;
import Link from ‘next/link’;
import { useSearchParams } from ‘next/navigation’;
import { createClient } from ‘@/lib/supabase/client’;

/* ─── Types ──────────────────────────────────────────────────────────── */
type Rarity = ‘common’ | ‘rare’ | ‘dynasty’ | ‘transcendent’ | ‘immortal’;
interface Player { id: string; name: string; pos: string; team: string; score: number; rarity: Rarity; accolades: string[]; }
interface ResultData {
lineup: (Player | null)[];
score: number;
tier: string;
icon: string;
completedAt: number;
name?: string;
}

/* ─── Rarity colors (preserved) ──────────────────────────────────────── */
const RC: Record<Rarity, { label: string; color: string; glow: string }> = {
common:       { label: ‘COM’, color: ‘#c87840’, glow: ‘rgba(200,120,60,.5)’ },
rare:         { label: ‘RAR’, color: ‘#42c0f8’, glow: ‘rgba(66,192,248,.6)’ },
dynasty:      { label: ‘DYN’, color: ‘#ffd700’, glow: ‘rgba(255,215,0,.7)’ },
transcendent: { label: ‘TRN’, color: ‘#e040ff’, glow: ‘rgba(224,64,255,.75)’ },
immortal:     { label: ‘IMM’, color: ‘#28dc78’, glow: ‘rgba(40,220,120,.7)’ },
};

const RARITY_MAP: Record<string, Rarity> = {
epic: ‘dynasty’, legendary: ‘transcendent’,
common: ‘common’, rare: ‘rare’, dynasty: ‘dynasty’, transcendent: ‘transcendent’, immortal: ‘immortal’,
};

/* ─── Slots ──────────────────────────────────────────────────────────── */
const SLOTS = [
{ key: ‘QB’,  short: ‘QB’ }, { key: ‘RB’, short: ‘HB’ },
{ key: ‘WR1’, short: ‘WR’ }, { key: ‘WR2’, short: ‘WR’ }, { key: ‘WR3’, short: ‘WR’ },
{ key: ‘TE’,  short: ‘TE’ }, { key: ‘LT’, short: ‘LT’ }, { key: ‘LG’, short: ‘LG’ },
{ key: ‘C’,   short: ‘C’  }, { key: ‘RG’, short: ‘RG’ }, { key: ‘RT’, short: ‘RT’ },
] as const;

/* ─── Tiers (palette nudged to editorial amber family, GOAT magenta kept) ── */
const TIERS = [
{ min: 20001, label: ‘GOAT OFFENSE’,      icon: ‘🐐’, color: ‘#e040ff’ },
{ min: 17001, label: ‘HALL OF FAME’,       icon: ‘🏛️’, color: ‘#f4c06a’ },
{ min: 14001, label: ‘SUPER BOWL DYNASTY’, icon: ‘🏆’, color: ‘#e8a84b’ },
{ min: 11001, label: ‘ALL-PRO ELITE’,      icon: ‘⭐’, color: ‘#6ba8c0’ },
{ min: 8001,  label: ‘PRO BOWL CALIBER’,  icon: ‘🔥’, color: ‘#68a878’ },
{ min: 5001,  label: ‘STARTER QUALITY’,   icon: ‘📈’, color: ‘#bfb5a0’ },
{ min: 2001,  label: ‘BACKUP UNIT’,        icon: ‘📋’, color: ‘#7d7463’ },
{ min: 0,     label: ‘PRACTICE SQUAD’,     icon: ‘🏈’, color: ‘#a87420’ },
];
function getTier(s: number) { return TIERS.find(t => s >= t.min)!; }

/* ─── CSV parse helper ───────────────────────────────────────────────── */
function parseCSVRow(row: string): string[] {
const cols: string[] = []; let cur = ‘’; let inQ = false;
for (const c of row) { if (c === ‘”’) { inQ = !inQ; continue; } if (c === ‘,’ && !inQ) { cols.push(cur.trim()); cur = ‘’; continue; } cur += c; }
cols.push(cur.trim()); return cols;
}

/* ══════════════════════════════════════════════════════════════════════
LINEUP COLUMN COMPONENT
══════════════════════════════════════════════════════════════════════ */
function LineupColumn({
label, result, isWinner, isLoser, blacked, imageMap,
}: {
label: string;
result: ResultData | null;
isWinner: boolean;
isLoser: boolean;
blacked: boolean;
imageMap: Record<string, string>;
}) {
const tier = result ? getTier(result.score) : null;

return (
<div className={`vr-col${isWinner ? ' winner' : ''}${isLoser ? ' loser' : ''}`}>
{/* Column header */}
<div className="vr-col-header">
<div className="vr-col-label">{label}</div>
{isWinner && <div className="vr-winner-badge">★ WINNER</div>}
{isLoser  && <div className="vr-loser-badge">Defeated</div>}

```
    <div className="vr-col-score">
      {blacked
        ? <span className="vr-score-waiting">Drafting<span className="vr-dots" /></span>
        : <span style={{ color: tier?.color }}>{result?.score.toLocaleString() ?? '—'}</span>
      }
    </div>
    <div className="vr-col-tier">
      {blacked
        ? <span className="vr-tier-waiting">— — —</span>
        : result ? <span style={{ color: tier?.color }}>{tier?.icon} {tier?.label}</span> : null
      }
    </div>
  </div>

  {/* Slot list */}
  <div className="vr-slot-list">
    {SLOTS.map((slot, i) => {
      const player = result?.lineup[i] ?? null;
      const rc = player ? RC[player.rarity] : null;
      const imgSrc = player ? imageMap[player.name] : undefined;

      if (blacked) {
        return (
          <div key={slot.key} className="vr-slot-row blacked">
            <div className="vr-sr-pos">?</div>
            <div className="vr-sr-img-wrap blacked-img">
              <div className="vr-sr-img-blur" />
            </div>
            <div className="vr-sr-info">
              <div className="vr-sr-name blacked-text" />
              <div className="vr-sr-team blacked-text short" />
            </div>
            <div className="vr-sr-score blacked-text short" />
          </div>
        );
      }

      if (!player) {
        return (
          <div key={slot.key} className="vr-slot-row empty">
            <div className="vr-sr-pos">{slot.short}</div>
            <div className="vr-sr-img-wrap empty-img" />
            <div className="vr-sr-info">
              <div className="vr-sr-name vr-empty-name">Empty</div>
            </div>
            <div className="vr-sr-score vr-empty-score">—</div>
          </div>
        );
      }

      return (
        <div key={slot.key} className="vr-slot-row filled"
          style={{ '--rc': rc!.color, '--rg': rc!.glow, borderColor: `${rc!.color}33` } as React.CSSProperties}>
          <div className="vr-sr-pos" style={{ background: rc!.color }}>{slot.short}</div>
          <div className="vr-sr-img-wrap" style={{ background: `linear-gradient(150deg,${rc!.color}18,${rc!.color}06)` }}>
            {imgSrc
              ? <img src={imgSrc} alt={player.name} className="vr-sr-img" onError={e => (e.currentTarget.style.display = 'none')} />
              : <div className="vr-sr-initial" style={{ color: `${rc!.color}55` }}>{player.name.charAt(0)}</div>
            }
          </div>
          <div className="vr-sr-info">
            <div className="vr-sr-name" style={{ color: rc!.color }}>
              {(() => {
                const parts = player.name.trim().split(' ');
                const suffixes = new Set(['jr.','jr','sr.','sr','ii','iii','iv','v']);
                const last = parts[parts.length - 1];
                if (suffixes.has(last.toLowerCase()) && parts.length >= 3) return `${parts[parts.length - 2]} ${last}`;
                return parts.length > 1 ? `${parts[0][0]}. ${last}` : last;
              })()}
            </div>
            <div className="vr-sr-team">{player.team}</div>
          </div>
          <div className="vr-sr-score" style={{ color: rc!.color }}>{player.score.toLocaleString()}</div>
        </div>
      );
    })}
  </div>

  {/* Column total */}
  {!blacked && result && (
    <div className="vr-col-total" style={{ borderColor: `${tier?.color}55` }}>
      <span className="vr-col-total-label">Total</span>
      <span className="vr-col-total-score" style={{ color: tier?.color }}>
        {result.score.toLocaleString()}
      </span>
    </div>
  )}
</div>
```

);
}

/* ══════════════════════════════════════════════════════════════════════
RESULTS PAGE
══════════════════════════════════════════════════════════════════════ */
function VersusResults() {
const searchParams = useSearchParams();
const challengeId  = searchParams.get(‘challenge’);
const supabase     = createClient();

const [isHost, setIsHost]       = useState<boolean | null>(null);
const [myResult, setMyResult]   = useState<ResultData | null>(null);
const [oppResult, setOppResult] = useState<ResultData | null>(null);
const [imageMap, setImageMap]   = useState<Record<string, string>>({});
const [pollTick, setPollTick]   = useState(0);
const [copied, setCopied] = useState(false);
const [origin, setOrigin] = useState(’’);

useEffect(() => {
fetch(’/players.csv’).then(r => r.ok ? r.text() : Promise.reject()).then(text => {
const map: Record<string, string> = {};
text.split(’\n’).forEach(line => {
if (!line.trim()) return;
const cols = parseCSVRow(line);
if (cols[1] && cols[22]?.startsWith(‘http’)) map[cols[1]] = cols[22];
});
setImageMap(map);
}).catch(() => {});
}, []);

const hydrateLineup = useCallback((raw: any[]): (Player | null)[] => {
return raw.map(p => p ? { …p, rarity: RARITY_MAP[p.rarity as string] ?? p.rarity } : null);
}, []);

useEffect(() => {
if (!challengeId) return;

```
async function loadResults() {
  const { data: { user } } = await supabase.auth.getUser();

  const { data: challenge } = await supabase
    .from('versus_challenges')
    .select('*')
    .eq('id', challengeId)
    .single();

  if (!challenge) return;

  const isHostDevice = !!(user && challenge.creator_id && challenge.creator_id === user.id)
    || (!user && JSON.parse(localStorage.getItem('versus-active-challenges') || '[]')
        .some((c: any) => c.id === challengeId && !c.isOpponent));

  const myRaw    = isHostDevice ? challenge.host_result     : challenge.opponent_result;
  const oppRaw   = isHostDevice ? challenge.opponent_result : challenge.host_result;

  if (myRaw)  setMyResult({ ...myRaw,  lineup: hydrateLineup(myRaw.lineup  ?? []) });
  if (oppRaw) setOppResult({ ...oppRaw, lineup: hydrateLineup(oppRaw.lineup ?? []) });

  setIsHost(isHostDevice);
}

loadResults();
```

}, [challengeId, pollTick]);

useEffect(() => {
if (oppResult) return;
const interval = setInterval(() => setPollTick(t => t + 1), 4000);
return () => clearInterval(interval);
}, [oppResult]);

useEffect(() => { setOrigin(window.location.origin); }, []);

const bothDone = !!(myResult && oppResult);
const myScore  = myResult?.score ?? 0;
const oppScore = oppResult?.score ?? 0;
const iWin     = bothDone && myScore > oppScore;
const theyWin  = bothDone && oppScore > myScore;
const isTie    = bothDone && myScore === oppScore;
const oppName = oppResult?.name || ‘Opponent’;
const myName  = myResult?.name  || ‘You’;

return (
<>
<style dangerouslySetInnerHTML={{ __html: STYLES }} />

```
  {/* ── Nav / Masthead ── */}
  <nav className="vr-nav">
    <div className="vr-nav-l">
      <Link href="/games/pack-empire/offense/versus" className="vr-back">← Lobby</Link>
    </div>
    <div className="vr-nav-c">
      <span className="vr-pip" />
      <span className="vr-nav-title">
        Versus <span className="vr-nav-italic">Results.</span>
      </span>
    </div>
    <div className="vr-nav-r">
      {challengeId && (
        <span className="vr-challenge-id">#{challengeId.slice(-6).toUpperCase()}</span>
      )}
    </div>
  </nav>

  <div className="vr-root">

    {/* ════ WINNER BANNER ════ */}
    {bothDone && (
      <div className={`vr-winner-banner${isTie ? ' tie' : ''}`}>
        {isTie ? (
          <div className="vr-banner-inner">
            <span className="vr-banner-icon">🤝</span>
            <div className="vr-banner-center">
              <span className="vr-banner-kicker">§ Final</span>
              <span className="vr-banner-text">
                Tie <span className="vr-banner-italic">game.</span>
              </span>
              <span className="vr-banner-sub">Both coaches matched up evenly</span>
            </div>
          </div>
        ) : (
          <div className="vr-banner-inner">
            <div className="vr-banner-center">
              <span className="vr-banner-kicker">§ Final · Verdict</span>
              <span className="vr-banner-text">
                <span className="vr-banner-star">★</span>
                {iWin ? <>You <span className="vr-banner-italic">win.</span></> : <>{oppName} <span className="vr-banner-italic">wins.</span></>}
                <span className="vr-banner-star">★</span>
              </span>
              <div className="vr-banner-arrow-row">
                {iWin
                  ? <>
                      <span className="vr-banner-arrow">◄◄◄</span>
                      <span className="vr-banner-sub">+{(myScore - oppScore).toLocaleString()} pts</span>
                    </>
                  : <>
                      <span className="vr-banner-sub">+{(oppScore - myScore).toLocaleString()} pts</span>
                      <span className="vr-banner-arrow">►►►</span>
                    </>
                }
              </div>
            </div>
          </div>
        )}
      </div>
    )}

    {/* ════ WAITING BANNER ════ */}
    {!bothDone && myResult && (
      <div className="vr-waiting-banner">
        <span className="vr-waiting-pulse" />
        <span className="vr-waiting-text">
          Waiting for opponent to finish their draft<span className="vr-dots" />
        </span>
      </div>
    )}

    {/* ════ VS SCOREBOARD ════ */}
    {(myResult || oppResult) && (
      <div className="vr-scoreboard">
        <div className={`vr-sb-side${iWin ? ' winner' : isTie ? '' : ' loser'}`}>
          <div className="vr-sb-label">{myName}</div>
          <div
            className="vr-sb-score"
            style={{ color: iWin ? '#e8a84b' : isTie ? '#6ba8c0' : 'var(--vr-ink-mute)' }}
          >
            {myResult?.score.toLocaleString() ?? '—'}
          </div>
        </div>
        <div className="vr-sb-divider">VS</div>
        <div className={`vr-sb-side${theyWin ? ' winner' : isTie ? '' : oppResult ? ' loser' : ''}`}>
          <div className="vr-sb-label">{oppName}</div>
          <div
            className="vr-sb-score"
            style={{ color: theyWin ? '#e8a84b' : isTie ? '#6ba8c0' : 'var(--vr-ink-mute)' }}
          >
            {oppResult ? oppResult.score.toLocaleString() : <span className="vr-dots-inline">drafting</span>}
          </div>
        </div>
      </div>
    )}

    {/* ════ SECTION HEADER ════ */}
    <div className="vr-rosters-header">
      <span className="vr-rosters-num">§ The Rosters</span>
      <span className="vr-rosters-title">
        Head to <span className="vr-italic">head.</span>
      </span>
    </div>

    {/* ════ SIDE-BY-SIDE LINEUPS ════ */}
    <div className="vr-lineups">
      <LineupColumn
        label={myName}
        result={myResult}
        isWinner={iWin}
        isLoser={theyWin}
        blacked={false}
        imageMap={imageMap}
      />
      <div className="vr-center-divider">
        <div className="vr-cd-line" />
        <div className="vr-cd-icon">⚔️</div>
        <div className="vr-cd-line" />
      </div>
      <LineupColumn
        label={oppName}
        result={oppResult}
        isWinner={theyWin}
        isLoser={iWin}
        blacked={!oppResult}
        imageMap={imageMap}
      />
    </div>

    {/* ════ ACTIONS ════ */}
    <div className="vr-actions">
      {challengeId && (
        <div className="vr-invite-row">
          <div className="vr-invite-label">★ Invite link — share this match</div>
          <div className="vr-invite-box">
            <span className="vr-invite-url">
              {origin ? `${origin}/games/pack-empire/offense/versus/join/${challengeId}` : ''}
            </span>
            <button
              className="vr-invite-copy"
              onClick={() => {
                navigator.clipboard.writeText(`${origin}/games/pack-empire/offense/versus/join/${challengeId}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? '✓' : '↗'}
            </button>
          </div>
        </div>
      )}
      <Link href="/games/pack-empire/offense/versus" className="vr-btn-primary">
        <span>Back to Versus lobby</span>
        <span>→</span>
      </Link>
      <Link href="/games/pack-empire/offense" className="vr-btn-secondary">
        <span>Play Solo Draft</span>
        <span>→</span>
      </Link>
    </div>

  </div>
</>
```

);
}

/* ══════════════════════════════════════════════════════════════════════
STYLES
══════════════════════════════════════════════════════════════════════ */
const STYLES = `
@import url(‘https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap’);
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
–vr-bg:#141311;
–vr-bg-soft:#1c1b18;
–vr-bg-card:#201e1a;
–vr-ink:#f4ebd8;
–vr-ink-soft:#bfb5a0;
–vr-ink-mute:#7d7463;
–vr-amber:#e8a84b;
–vr-amber-bright:#f4c06a;
–vr-line:#3a3630;
–vr-line-soft:#2a2620;
/* Versus signature: emerald */
–vr-green:#68a878;
–vr-green-bright:#88c898;
–vr-green-deep:#4a7854;
–vr-green-glow:rgba(104,168,120,.4);
/* Neutral placeholder shimmer tones */
–vr-shimmer-a:#2a2620;
–vr-shimmer-b:#3a3630;
}

body{font-family:‘Space Grotesk’,sans-serif;background:var(–vr-bg);color:var(–vr-ink)}

.vr-italic{font-style:italic;color:var(–vr-green)}

/* ═══ NAV / MASTHEAD ═══ */
.vr-nav{
display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:1rem;
padding:1.2rem 2rem;
background:rgba(20,19,17,.92);
backdrop-filter:blur(12px);
border-bottom:1px solid var(–vr-line);
position:sticky;top:0;z-index:30;
}
.vr-nav-l{justify-self:start}
.vr-nav-c{display:flex;align-items:center;gap:.65rem;justify-self:center}
.vr-nav-r{justify-self:end}

.vr-back{
color:var(–vr-green);text-decoration:none;
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;
transition:color .2s;
}
.vr-back:hover{color:var(–vr-green-bright)}

.vr-nav-title{
font-family:‘DM Serif Display’,serif;
font-size:1.35rem;letter-spacing:-.01em;color:var(–vr-ink);
}
.vr-nav-italic{font-style:italic;color:var(–vr-green)}

.vr-pip{
width:9px;height:9px;border-radius:50%;
background:var(–vr-green);flex-shrink:0;
box-shadow:0 0 0 3px rgba(104,168,120,.15),0 0 12px var(–vr-green);
animation:vr-pip 2s ease-in-out infinite;
}
@keyframes vr-pip{
0%,100%{box-shadow:0 0 0 3px rgba(104,168,120,.15),0 0 12px var(–vr-green)}
50%{box-shadow:0 0 0 6px rgba(104,168,120,.05),0 0 22px var(–vr-green-bright)}
}

.vr-challenge-id{
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.72rem;letter-spacing:.18em;
color:var(–vr-ink-soft);
padding:.45rem .75rem;
background:var(–vr-bg-card);border:1px solid var(–vr-line);
border-radius:2px;
}

/* ═══ ROOT ═══ */
.vr-root{
min-height:calc(100vh - 62px);
background:var(–vr-bg);color:var(–vr-ink);
background-image:
radial-gradient(ellipse at 50% -10%,rgba(104,168,120,.06),transparent 55%),
radial-gradient(ellipse at 15% 80%,rgba(74,120,84,.03),transparent 50%),
repeating-linear-gradient(0deg,transparent,transparent 70px,rgba(104,168,120,.012) 70px,rgba(104,168,120,.012) 71px);
padding-bottom:3rem;
}

/* ═══ ANIMATED DOTS ═══ */
.vr-dots::after{content:’…’;animation:dot-cycle 1.6s steps(4,end) infinite}
@keyframes dot-cycle{0%{content:’’}25%{content:’.’}50%{content:’..’}75%{content:’…’}100%{content:’’}}
.vr-dots-inline{animation:text-pulse 1.4s ease-in-out infinite}
@keyframes text-pulse{0%,100%{opacity:.4}50%{opacity:1}}

/* ═══ WINNER BANNER ═══ */
.vr-winner-banner{
margin:0;padding:2rem 1.5rem;
background:linear-gradient(160deg,var(–vr-bg-card),var(–vr-bg-soft));
border-bottom:1px solid var(–vr-line);
position:relative;overflow:hidden;
animation:banner-appear .6s cubic-bezier(.2,.8,.2,1) both;
}
.vr-winner-banner::before{
content:’’;position:absolute;top:-60px;left:50%;transform:translateX(-50%);
width:400px;height:200px;
background:radial-gradient(ellipse,rgba(232,168,75,.18) 0%,transparent 70%);
pointer-events:none;
}
.vr-winner-banner.tie::before{
background:radial-gradient(ellipse,rgba(107,168,192,.16) 0%,transparent 70%);
}
@keyframes banner-appear{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}

.vr-banner-inner{
display:flex;align-items:center;justify-content:center;gap:1rem;
max-width:900px;margin:0 auto;position:relative;
}
.vr-banner-center{display:flex;flex-direction:column;align-items:center;gap:.4rem;text-align:center}
.vr-banner-icon{font-size:1.8rem;margin-bottom:.2rem}
.vr-banner-kicker{
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.62rem;letter-spacing:.3em;text-transform:uppercase;
color:var(–vr-amber);margin-bottom:.2rem;
}
.vr-banner-text{
display:inline-flex;align-items:center;gap:.6rem;
font-family:‘DM Serif Display’,serif;
font-size:clamp(1.8rem,5vw,2.8rem);line-height:1;letter-spacing:-.02em;
color:var(–vr-ink);
}
.vr-banner-italic{font-style:italic;color:var(–vr-amber)}
.vr-banner-star{font-size:.6em;color:var(–vr-amber);opacity:.75}
.vr-winner-banner.tie .vr-banner-kicker{color:#6ba8c0}
.vr-winner-banner.tie .vr-banner-italic{color:#6ba8c0}
.vr-winner-banner.tie .vr-banner-star{color:#6ba8c0}

.vr-banner-arrow-row{
display:flex;align-items:center;gap:.7rem;
margin-top:.3rem;
}
.vr-banner-sub{
font-family:‘JetBrains Mono’,monospace;font-weight:500;
font-size:.75rem;letter-spacing:.16em;text-transform:uppercase;
color:var(–vr-ink-soft);
}
.vr-banner-arrow{
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.9rem;letter-spacing:.02em;
color:var(–vr-amber);
animation:arrow-pulse 1.2s ease-in-out infinite;
}
@keyframes arrow-pulse{
0%,100%{opacity:.5;transform:translateX(0)}
50%{opacity:1;transform:translateX(2px)}
}

/* ═══ WAITING BANNER ═══ */
.vr-waiting-banner{
display:flex;align-items:center;justify-content:center;gap:.7rem;
padding:.85rem 1.2rem;
background:rgba(104,168,120,.06);
border-bottom:1px solid rgba(104,168,120,.2);
}
.vr-waiting-pulse{
width:8px;height:8px;border-radius:50%;
background:var(–vr-green);flex-shrink:0;
box-shadow:0 0 10px var(–vr-green-glow);
animation:vr-pip 1.4s ease-in-out infinite;
}
.vr-waiting-text{
font-family:‘DM Serif Display’,serif;font-style:italic;
font-size:.95rem;color:var(–vr-ink);
}

/* ═══ VS SCOREBOARD ═══ */
.vr-scoreboard{
display:flex;align-items:center;justify-content:center;gap:0;
padding:1.75rem 1.5rem;
border-bottom:1px solid var(–vr-line);
max-width:900px;margin:0 auto;
}
.vr-sb-side{flex:1;text-align:center;transition:opacity .4s}
.vr-sb-side.loser{opacity:.45}
.vr-sb-label{
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.62rem;letter-spacing:.22em;text-transform:uppercase;
color:var(–vr-ink-mute);margin-bottom:.5rem;
white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.vr-sb-score{
font-family:‘DM Serif Display’,serif;
font-size:clamp(2rem,6vw,3.4rem);line-height:1;letter-spacing:-.03em;
transition:color .5s;
}
.vr-sb-divider{
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.8rem;letter-spacing:.2em;
color:var(–vr-line);padding:0 1.5rem;flex-shrink:0;
}

/* ═══ ROSTERS HEADER ═══ */
.vr-rosters-header{
max-width:900px;margin:2rem auto 1.2rem;
padding:0 1rem;
display:flex;justify-content:space-between;align-items:baseline;gap:.75rem;flex-wrap:wrap;
padding-bottom:.9rem;border-bottom:3px double var(–vr-line);
}
.vr-rosters-num{
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.68rem;letter-spacing:.26em;text-transform:uppercase;
color:var(–vr-green);
}
.vr-rosters-title{
font-family:‘DM Serif Display’,serif;
font-size:1.3rem;letter-spacing:-.01em;
color:var(–vr-ink);
}

/* ═══ LINEUPS GRID ═══ */
.vr-lineups{
display:grid;grid-template-columns:1fr auto 1fr;gap:0;
max-width:900px;margin:0 auto;padding:0 1rem;
}
.vr-center-divider{
display:flex;flex-direction:column;align-items:center;
padding:.5rem .7rem;gap:.4rem;
}
.vr-cd-line{flex:1;width:1px;background:linear-gradient(to bottom,transparent,var(–vr-line),transparent)}
.vr-cd-icon{font-size:1.1rem;opacity:.35}

/* ═══ COLUMN ═══ */
.vr-col{
display:flex;flex-direction:column;gap:0;
transition:opacity .4s;
}
.vr-col.loser{opacity:.55}
.vr-col.winner .vr-col-header{
background:linear-gradient(160deg,rgba(232,168,75,.1),rgba(232,168,75,.03));
border-color:rgba(232,168,75,.35);
}

.vr-col-header{
padding:1rem .8rem .85rem;
background:var(–vr-bg-card);
border:1px solid var(–vr-line);border-bottom:none;
text-align:center;
}
.vr-col-label{
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.62rem;letter-spacing:.26em;text-transform:uppercase;
color:var(–vr-ink-mute);margin-bottom:.5rem;
white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.vr-winner-badge{
display:inline-block;
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.6rem;letter-spacing:.22em;text-transform:uppercase;
color:var(–vr-bg);background:var(–vr-amber);
padding:3px 9px;border-radius:2px;margin-bottom:.4rem;
}
.vr-loser-badge{
display:inline-block;
font-family:‘DM Serif Display’,serif;font-style:italic;
font-size:.8rem;letter-spacing:-.005em;
color:var(–vr-ink-mute);
padding:2px 8px;margin-bottom:.4rem;
}
.vr-col-score{
font-family:‘DM Serif Display’,serif;
font-size:1.65rem;line-height:1;letter-spacing:-.02em;
margin-bottom:.25rem;
}
.vr-col-tier{
font-family:‘DM Serif Display’,serif;font-style:italic;
font-size:.82rem;letter-spacing:-.005em;
}
.vr-score-waiting{
font-family:‘DM Serif Display’,serif;font-style:italic;
font-size:1rem;color:var(–vr-ink-mute);
}
.vr-tier-waiting{
font-family:‘JetBrains Mono’,monospace;
font-size:.75rem;letter-spacing:.2em;
color:var(–vr-line);
}

/* ═══ SLOT LIST ═══ */
.vr-slot-list{
display:flex;flex-direction:column;gap:0;
background:var(–vr-bg-card);
border-left:1px solid var(–vr-line);
border-right:1px solid var(–vr-line);
}

/* ═══ SLOT ROW ═══ */
.vr-slot-row{
display:flex;align-items:center;gap:.5rem;
padding:.5rem .65rem;
background:transparent;
border:1px solid transparent;
border-bottom:1px solid var(–vr-line-soft);
transition:background .2s,border-color .2s;
}
.vr-slot-row:last-child{border-bottom:none}

.vr-slot-row.filled{
border-color:transparent;
border-bottom:1px solid var(–vr-line-soft);
border-left:3px solid var(–rc,var(–vr-line));
padding-left:calc(.65rem - 2px);
box-shadow:inset 0 0 12px var(–rg,transparent);
}
.vr-slot-row.filled:hover{
background:rgba(20,19,17,.4);
}
.vr-slot-row.blacked{
opacity:.9;
}
.vr-slot-row.empty{
opacity:.6;
}

.vr-sr-pos{
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.54rem;letter-spacing:.12em;text-transform:uppercase;
color:#fff;background:var(–vr-line);
padding:3px 5px;border-radius:2px;
min-width:22px;text-align:center;flex-shrink:0;
}

.vr-sr-img-wrap{
width:30px;height:30px;border-radius:2px;
overflow:hidden;flex-shrink:0;position:relative;
display:flex;align-items:center;justify-content:center;
background:rgba(20,19,17,.8);
}
.vr-sr-img{width:100%;height:100%;object-fit:cover;object-position:center top}
.vr-sr-initial{
font-family:‘DM Serif Display’,serif;
font-size:1.1rem;line-height:1;letter-spacing:-.02em;
}
.blacked-img{
background:rgba(20,19,17,.9);overflow:hidden;
}
.vr-sr-img-blur{
width:100%;height:100%;
background:repeating-linear-gradient(45deg,var(–vr-shimmer-a) 0,var(–vr-shimmer-a) 3px,var(–vr-shimmer-b) 3px,var(–vr-shimmer-b) 6px);
animation:blacked-shift 3s linear infinite;
}
@keyframes blacked-shift{0%{background-position:0 0}100%{background-position:12px 12px}}
.empty-img{
background:var(–vr-bg);
border:1px dashed var(–vr-line-soft);
}

.vr-sr-info{flex:1;min-width:0}
.vr-sr-name{
font-family:‘DM Serif Display’,serif;
font-size:.82rem;line-height:1.2;letter-spacing:-.005em;
white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.vr-sr-team{
font-family:‘JetBrains Mono’,monospace;
font-size:.52rem;letter-spacing:.14em;text-transform:uppercase;
color:var(–vr-ink-mute);
white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
margin-top:1px;
}
.vr-sr-score{
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.74rem;letter-spacing:.02em;
flex-shrink:0;text-align:right;
}
.vr-empty-name{
font-family:‘DM Serif Display’,serif;font-style:italic;
color:var(–vr-ink-mute);font-size:.82rem;
}
.vr-empty-score{color:var(–vr-line)}

/* Blacked-out placeholder text */
.blacked-text{
background:linear-gradient(90deg,var(–vr-shimmer-a) 40%,var(–vr-shimmer-b) 50%,var(–vr-shimmer-a) 60%);
background-size:200% 100%;
animation:shimmer-dark 2s ease-in-out infinite;
border-radius:2px;height:.7rem;min-width:60px;
}
.blacked-text.short{min-width:28px;height:.6rem}
@keyframes shimmer-dark{
0%{background-position:200% 0}
100%{background-position:-200% 0}
}

/* ═══ COLUMN TOTAL ═══ */
.vr-col-total{
display:flex;justify-content:space-between;align-items:center;
padding:.7rem .8rem;
background:var(–vr-bg-card);
border:1px solid var(–vr-line);
border-top:2px solid;
}
.vr-col-total-label{
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.62rem;letter-spacing:.22em;text-transform:uppercase;
color:var(–vr-ink-mute);
}
.vr-col-total-score{
font-family:‘DM Serif Display’,serif;
font-size:1.2rem;line-height:1;letter-spacing:-.02em;
}

/* ═══ ACTIONS ═══ */
.vr-actions{
display:flex;flex-direction:column;gap:.6rem;
max-width:520px;margin:2rem auto 0;padding:0 1rem;
}

.vr-invite-row{margin-bottom:.4rem}
.vr-invite-label{
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.62rem;letter-spacing:.26em;text-transform:uppercase;
color:var(–vr-amber);margin-bottom:.5rem;
}
.vr-invite-box{
display:flex;align-items:center;gap:.5rem;
background:var(–vr-bg-card);border:1px solid var(–vr-line);
padding:.65rem .8rem;position:relative;
}
.vr-invite-box::before{
content:’’;position:absolute;top:0;left:0;width:2px;height:100%;
background:var(–vr-green);
}
.vr-invite-url{
flex:1;
font-family:‘JetBrains Mono’,monospace;font-weight:500;
font-size:.72rem;letter-spacing:.02em;
color:var(–vr-green);
white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
padding-left:.3rem;
}
.vr-invite-copy{
background:transparent;color:var(–vr-green);
border:1px solid var(–vr-green);
padding:.35rem .7rem;cursor:pointer;
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.85rem;border-radius:2px;
flex-shrink:0;transition:all .2s;
}
.vr-invite-copy:hover{
background:rgba(104,168,120,.08);color:var(–vr-green-bright);
}

.vr-btn-primary{
display:flex;align-items:center;justify-content:center;gap:.6rem;
background:var(–vr-green);color:var(–vr-bg);
padding:1rem 1.4rem;
font-family:‘Space Grotesk’,sans-serif;font-weight:700;
font-size:.88rem;letter-spacing:.18em;text-transform:uppercase;
border-radius:2px;text-decoration:none;
transition:all .25s cubic-bezier(.2,.8,.2,1);
box-shadow:0 8px 20px rgba(104,168,120,.15);
}
.vr-btn-primary:hover{
background:var(–vr-green-bright);
transform:translateY(-2px);
box-shadow:0 14px 30px rgba(104,168,120,.3);
}

.vr-btn-secondary{
display:flex;align-items:center;justify-content:center;gap:.6rem;
background:transparent;color:var(–vr-ink-soft);
border:1px solid var(–vr-line);
padding:.9rem 1.4rem;
font-family:‘JetBrains Mono’,monospace;font-weight:700;
font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;
border-radius:2px;text-decoration:none;transition:all .2s;
}
.vr-btn-secondary:hover{
border-color:var(–vr-green);color:var(–vr-green);
}

/* ═══ RESPONSIVE ═══ */
@media(max-width:720px){
.vr-nav{padding:1rem 1.25rem;gap:.75rem}
.vr-nav-title{font-size:1.1rem}
.vr-challenge-id{font-size:.65rem;padding:.35rem .6rem}
.vr-scoreboard{padding:1.25rem 1rem}
.vr-sb-divider{padding:0 .9rem;font-size:.7rem}
.vr-rosters-header{flex-direction:column;align-items:flex-start;gap:.4rem;padding:0 1rem .9rem}
.vr-banner-text{font-size:1.6rem}
}
@media(max-width:640px){
.vr-lineups{padding:0 .5rem}
.vr-center-divider{padding:.5rem .3rem}
.vr-col-header{padding:.75rem .55rem .65rem}
.vr-col-label{font-size:.55rem;letter-spacing:.2em}
.vr-sr-pos{min-width:18px;font-size:.5rem;padding:2px 3px}
.vr-sr-img-wrap{width:24px;height:24px}
.vr-sr-name{font-size:.72rem}
.vr-sr-score{font-size:.66rem}
.vr-col-score{font-size:1.3rem}
.vr-sb-score{font-size:1.7rem}
.vr-col-tier{font-size:.72rem}
.vr-slot-row{padding:.45rem .5rem;gap:.4rem}
.vr-slot-row.filled{padding-left:calc(.5rem - 2px)}
}
@media(max-width:420px){
.vr-sr-img-wrap{display:none}
.vr-col-score{font-size:1.05rem}
.vr-col-tier{font-size:.65rem}
.vr-banner-text{font-size:1.3rem;flex-wrap:wrap;justify-content:center}
.vr-sb-side .vr-sb-label{font-size:.58rem}
}
`;

function VersusResultsFallback() {
return (
<div style={{
minHeight: ‘100vh’,
background: ‘#141311’,
display: ‘flex’,
alignItems: ‘center’,
justifyContent: ‘center’,
}}>
<div style={{
fontFamily: ‘JetBrains Mono,monospace’,
color: ‘#7d7463’,
letterSpacing: ‘.25em’,
fontSize: ‘.72rem’,
textTransform: ‘uppercase’,
fontWeight: 700,
}}>
Loading —
</div>
</div>
);
}

export default function VersusResultsPage() {
return (
<Suspense fallback={<VersusResultsFallback />}>
<VersusResults />
</Suspense>
);
}
