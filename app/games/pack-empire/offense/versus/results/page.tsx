'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ──────────────────────────────────────────────────────────── */
type Rarity = 'common' | 'rare' | 'dynasty' | 'transcendent' | 'immortal';
interface Player { id: string; name: string; pos: string; team: string; score: number; rarity: Rarity; accolades: string[]; }
interface ResultData {
  lineup: (Player | null)[];
  score: number;
  tier: string;
  icon: string;
  completedAt: number;
  name?: string;
}

/* ─── Rarity colors ──────────────────────────────────────────────────── */
const RC: Record<Rarity, { label: string; color: string; glow: string }> = {
  common:       { label: 'COM', color: '#c87840', glow: 'rgba(200,120,60,.5)' },
  rare:         { label: 'RAR', color: '#42c0f8', glow: 'rgba(66,192,248,.6)' },
  dynasty:      { label: 'DYN', color: '#ffd700', glow: 'rgba(255,215,0,.7)' },
  transcendent: { label: 'TRN', color: '#e040ff', glow: 'rgba(224,64,255,.75)' },
  immortal:     { label: 'IMM', color: '#28dc78', glow: 'rgba(40,220,120,.7)' },
};

const RARITY_MAP: Record<string, Rarity> = {
  epic: 'dynasty', legendary: 'transcendent',
  common: 'common', rare: 'rare', dynasty: 'dynasty', transcendent: 'transcendent', immortal: 'immortal',
};

/* ─── Slots ──────────────────────────────────────────────────────────── */
const SLOTS = [
  { key: 'QB',  short: 'QB' }, { key: 'RB', short: 'HB' },
  { key: 'WR1', short: 'WR' }, { key: 'WR2', short: 'WR' }, { key: 'WR3', short: 'WR' },
  { key: 'TE',  short: 'TE' }, { key: 'LT', short: 'LT' }, { key: 'LG', short: 'LG' },
  { key: 'C',   short: 'C'  }, { key: 'RG', short: 'RG' }, { key: 'RT', short: 'RT' },
] as const;

/* ─── Tiers ──────────────────────────────────────────────────────────── */
const TIERS = [
  { min: 20001, label: 'GOAT OFFENSE',      icon: '🐐', color: '#e040ff' },
  { min: 17001, label: 'HALL OF FAME',       icon: '🏛️', color: '#ffd700' },
  { min: 14001, label: 'SUPER BOWL DYNASTY', icon: '🏆', color: '#f0c030' },
  { min: 11001, label: 'ALL-PRO ELITE',      icon: '⭐', color: '#42c0f8' },
  { min: 8001,  label: 'PRO BOWL CALIBER',  icon: '🔥', color: '#50d870' },
  { min: 5001,  label: 'STARTER QUALITY',   icon: '📈', color: '#a0b8d0' },
  { min: 2001,  label: 'BACKUP UNIT',        icon: '📋', color: '#808080' },
  { min: 0,     label: 'PRACTICE SQUAD',     icon: '🏈', color: '#e8a060' },
];
function getTier(s: number) { return TIERS.find(t => s >= t.min)!; }

/* ─── CSV parse helper ───────────────────────────────────────────────── */
function parseCSVRow(row: string): string[] {
  const cols: string[] = []; let cur = ''; let inQ = false;
  for (const c of row) { if (c === '"') { inQ = !inQ; continue; } if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; } cur += c; }
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
        {isWinner && <div className="vr-winner-badge">🏆 WINNER</div>}
        {isLoser  && <div className="vr-loser-badge">DEFEATED</div>}

        <div className="vr-col-score">
          {blacked
            ? <span className="vr-score-waiting">Drafting<span className="vr-dots" /></span>
            : <span style={{ color: tier?.color }}>{result?.score.toLocaleString() ?? '—'}</span>
          }
        </div>
        <div className="vr-col-tier">
          {blacked
            ? <span style={{ color: '#2a4060' }}>— — —</span>
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
                  <div className="vr-sr-name" style={{ color: '#2a4060' }}>Empty</div>
                </div>
                <div className="vr-sr-score" style={{ color: '#1a3050' }}>—</div>
              </div>
            );
          }

          return (
            <div key={slot.key} className="vr-slot-row filled"
              style={{ '--rc': rc!.color, '--rg': rc!.glow, borderColor: `${rc!.color}22` } as React.CSSProperties}>
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
        <div className="vr-col-total" style={{ borderColor: `${tier?.color}40` }}>
          <span style={{ color: '#3a6080', fontSize: '.62rem', letterSpacing: '.12em' }}>TOTAL</span>
          <span style={{ color: tier?.color, fontFamily: 'Orbitron,sans-serif', fontWeight: 900, fontSize: '1.1rem' }}>
            {result.score.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   RESULTS PAGE
══════════════════════════════════════════════════════════════════════ */
function VersusResults() {
  const searchParams = useSearchParams();
  const challengeId  = searchParams.get('challenge');
  const supabase     = createClient();

  const [isHost, setIsHost]       = useState<boolean | null>(null);
  const [myResult, setMyResult]   = useState<ResultData | null>(null);
  const [oppResult, setOppResult] = useState<ResultData | null>(null);
  const [imageMap, setImageMap]   = useState<Record<string, string>>({});
  const [pollTick, setPollTick]   = useState(0); // triggers re-check
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  /* ── Load player images ── */
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

  /* ── Restore rarity on lineups (localStorage stores plain strings) ── */
  const hydrateLineup = useCallback((raw: any[]): (Player | null)[] => {
    return raw.map(p => p ? { ...p, rarity: RARITY_MAP[p.rarity as string] ?? p.rarity } : null);
  }, []);

  /* ── Determine role and load results ── */
  useEffect(() => {
  if (!challengeId) return;

  async function loadResults() {
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch the shared challenge from Supabase
    const { data: challenge } = await supabase
      .from('versus_challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (!challenge) return;

    // Determine if current user/device is host
    // Host = creator_id matches current user, fallback to localStorage for guests
    const isHostDevice = !!(user && challenge.creator_id && challenge.creator_id === user.id)
  ||  (!user && JSON.parse(localStorage.getItem('versus-active-challenges') || '[]')
      .some((c: any) => c.id === challengeId && !c.isOpponent));

    const myRaw    = isHostDevice ? challenge.host_result     : challenge.opponent_result;
    const oppRaw   = isHostDevice ? challenge.opponent_result : challenge.host_result;

    if (myRaw)  setMyResult({ ...myRaw,  lineup: hydrateLineup(myRaw.lineup  ?? []) });
    if (oppRaw) setOppResult({ ...oppRaw, lineup: hydrateLineup(oppRaw.lineup ?? []) });

    setIsHost(isHostDevice);
  }

  loadResults();
}, [challengeId, pollTick]);

  /* ── Poll every 4s for opponent result ── */
  useEffect(() => {
    if (oppResult) return; // already found
    const interval = setInterval(() => setPollTick(t => t + 1), 4000);
    return () => clearInterval(interval);
  }, [oppResult]);

  useEffect(() => { setOrigin(window.location.origin); }, []);

  /* ── Derived state ── */
  const bothDone = !!(myResult && oppResult);
  const myScore  = myResult?.score ?? 0;
  const oppScore = oppResult?.score ?? 0;
  const iWin     = bothDone && myScore > oppScore;
  const theyWin  = bothDone && oppScore > myScore;
  const isTie    = bothDone && myScore === oppScore;

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Nav */}
      <nav className="vr-nav">
        <div className="vr-nav-l">
          <Link href="/games/pack-empire/offense/versus" className="vr-back">← Lobby</Link>
        </div>
        <div className="vr-nav-c">
          <span className="vr-pip" />VERSUS RESULTS
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
                <span className="vr-banner-text">TIE GAME</span>
                <span className="vr-banner-sub">Both coaches matched up evenly</span>
              </div>
            ) : iWin ? (
              <div className="vr-banner-inner win">
                {/* Arrow points LEFT toward "YOU" column */}
                <div className="vr-banner-arrow left">◄◄◄</div>
                <div className="vr-banner-center">
                  <span className="vr-banner-icon">🏆</span>
                  <span className="vr-banner-text">YOU WIN</span>
                  <span className="vr-banner-sub">+{(myScore - oppScore).toLocaleString()} pts ahead</span>
                </div>
                <div className="vr-banner-spacer" />
              </div>
            ) : (
              <div className="vr-banner-inner loss">
                {/* Arrow points RIGHT toward "OPPONENT" column */}
                <div className="vr-banner-spacer" />
                <div className="vr-banner-center">
                  <span className="vr-banner-icon">🏆</span>
                  <span className="vr-banner-text">OPPONENT WINS</span>
                  <span className="vr-banner-sub">+{(oppScore - myScore).toLocaleString()} pts ahead</span>
                </div>
                <div className="vr-banner-arrow right">►►►</div>
              </div>
            )}
          </div>
        )}

        {/* ════ WAITING BANNER (opponent not done) ════ */}
        {!bothDone && myResult && (
          <div className="vr-waiting-banner">
            <div className="vr-waiting-pulse" />
            <span>Waiting for opponent to finish their draft</span>
            <span className="vr-dots" />
          </div>
        )}

        {/* ════ VS SCOREBOARD ════ */}
        {(myResult || oppResult) && (
          <div className="vr-scoreboard">
            <div className={`vr-sb-side${iWin ? ' winner' : isTie ? '' : ' loser'}`}>
              <div className="vr-sb-label">YOU</div>
              <div className="vr-sb-score" style={{ color: iWin ? '#ffd700' : isTie ? '#42c0f8' : '#3a6080' }}>
                {myResult?.score.toLocaleString() ?? '—'}
              </div>
            </div>
            <div className="vr-sb-divider">VS</div>
            <div className={`vr-sb-side${theyWin ? ' winner' : isTie ? '' : oppResult ? ' loser' : ''}`}>
              <div className="vr-sb-label">OPPONENT</div>
              <div className="vr-sb-score" style={{ color: theyWin ? '#ffd700' : isTie ? '#42c0f8' : '#3a6080' }}>
                {oppResult ? oppResult.score.toLocaleString() : <span className="vr-dots-inline">drafting</span>}
              </div>
            </div>
          </div>
        )}

        {/* ════ SIDE-BY-SIDE LINEUPS ════ */}
        <div className="vr-lineups">
          <LineupColumn
            label="YOU"
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
            label="OPPONENT"
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
    <div className="vr-invite-label">INVITE LINK</div>
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
            ← Back to Versus Lobby
          </Link>
          <Link href="/games/pack-empire/offense" className="vr-btn-secondary">
            Play Solo Draft
          </Link>
        </div>

      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Barlow+Condensed:wght@400;500;600;700;800&family=Barlow:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Barlow Condensed',sans-serif}

/* ── Nav ── */
.vr-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:.7rem 1.2rem;border-bottom:2px solid #0d1835;position:sticky;top:0;background:#050a18;z-index:30}
.vr-nav-l{justify-self:start}
.vr-nav-c{display:flex;align-items:center;gap:.6rem;font-family:'Orbitron',sans-serif;font-weight:700;font-size:.95rem;letter-spacing:.22em;color:#28dc78;justify-self:center;text-shadow:0 0 24px rgba(40,220,120,.5)}
.vr-nav-r{justify-self:end}
.vr-pip{width:9px;height:9px;border-radius:50%;background:#28dc78;flex-shrink:0;box-shadow:0 0 12px #28dc78,0 0 28px rgba(40,220,120,.6);animation:pip-pulse 2s ease-in-out infinite}
@keyframes pip-pulse{0%,100%{box-shadow:0 0 12px #28dc78,0 0 28px rgba(40,220,120,.6)}50%{box-shadow:0 0 22px #28dc78,0 0 48px rgba(40,220,120,.8)}}
.vr-back{color:#2a4060;text-decoration:none;font-size:.85rem;transition:.15s}.vr-back:hover{color:#28dc78}
.vr-challenge-id{font-family:'Barlow Condensed',sans-serif;font-size:.65rem;color:#1a3050;letter-spacing:.14em}

/* ── Root ── */
.vr-root{min-height:calc(100vh - 52px);background:#050a18;background-image:radial-gradient(ellipse at 50% 0%,rgba(40,220,120,.04),transparent 50%),repeating-linear-gradient(0deg,transparent,transparent 70px,rgba(255,255,255,.012) 70px,rgba(255,255,255,.012) 71px);padding-bottom:3rem}

/* ── Animated dots ── */
.vr-dots::after{content:'...';animation:dot-cycle 1.6s steps(4,end) infinite}
@keyframes dot-cycle{0%{content:''}25%{content:'.'}50%{content:'..'}75%{content:'...'}100%{content:''}}
.vr-dots-inline{animation:text-pulse 1.4s ease-in-out infinite}
@keyframes text-pulse{0%,100%{opacity:.4}50%{opacity:1}}

/* ── Winner banner ── */
.vr-winner-banner{margin:0;padding:1rem 1.5rem;background:linear-gradient(135deg,rgba(255,215,0,.08),rgba(255,215,0,.03));border-bottom:2px solid rgba(255,215,0,.2);animation:banner-appear .6s ease both}
@keyframes banner-appear{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.vr-winner-banner.tie{background:linear-gradient(135deg,rgba(66,192,248,.06),rgba(66,192,248,.02));border-bottom-color:rgba(66,192,248,.2)}
.vr-banner-inner{display:flex;align-items:center;justify-content:center;gap:1rem;max-width:900px;margin:0 auto}
.vr-banner-inner.win{justify-content:flex-start}
.vr-banner-inner.loss{justify-content:flex-end}
.vr-banner-center{display:flex;flex-direction:column;align-items:center;gap:.2rem}
.vr-banner-spacer{flex:1}
.vr-banner-icon{font-size:2rem}
.vr-banner-text{font-family:'Orbitron',sans-serif;font-weight:900;font-size:clamp(1.2rem,4vw,1.8rem);letter-spacing:.1em;color:#ffd700;text-shadow:0 0 24px rgba(255,215,0,.6);align-items:center}
.vr-banner-sub{font-size:.75rem;color:#3a6080;letter-spacing:.1em;align-items:center}
.vr-banner-arrow{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1.6rem;color:#ffd700;text-shadow:0 0 16px rgba(255,215,0,.8);animation:arrow-pulse 1.2s ease-in-out infinite;align-items:center}
@keyframes arrow-pulse{0%,100%{opacity:.6;text-shadow:0 0 16px rgba(255,215,0,.6)}50%{opacity:1;text-shadow:0 0 32px rgba(255,215,0,.9)}}

/* ── Waiting banner ── */
.vr-waiting-banner{display:flex;align-items:center;justify-content:center;gap:.5rem;padding:.65rem 1rem;background:rgba(40,220,120,.04);border-bottom:1px solid rgba(40,220,120,.12);font-size:.82rem;color:#3a6080;letter-spacing:.08em}
.vr-waiting-pulse{width:7px;height:7px;border-radius:50%;background:#28dc78;animation:pip-pulse 1.4s ease-in-out infinite;flex-shrink:0}

/* ── VS Scoreboard ── */
.vr-scoreboard{display:flex;align-items:center;justify-content:center;gap:0;padding:1.2rem 1.5rem;border-bottom:1px solid #0d1835;max-width:900px;margin:0 auto}
.vr-sb-side{flex:1;text-align:center;transition:opacity .4s}
.vr-sb-side.loser{opacity:.45}
.vr-sb-label{font-size:.58rem;letter-spacing:.3em;color:#2a4060;margin-bottom:.3rem;font-family:'Barlow Condensed',sans-serif;font-weight:700}
.vr-sb-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:clamp(1.6rem,5vw,2.6rem);transition:color .5s}
.vr-sb-divider{font-family:'Orbitron',sans-serif;font-weight:700;font-size:.9rem;color:#1a3050;letter-spacing:.14em;padding:0 1.5rem;flex-shrink:0}

/* ── Lineups grid ── */
.vr-lineups{display:grid;grid-template-columns:1fr auto 1fr;gap:0;max-width:900px;margin:.8rem auto 0;padding:0 .8rem}
.vr-center-divider{display:flex;flex-direction:column;align-items:center;padding:.5rem .6rem;gap:.4rem}
.vr-cd-line{flex:1;width:1px;background:linear-gradient(to bottom,transparent,#1a3050,transparent)}
.vr-cd-icon{font-size:1.1rem;opacity:.3}

/* ── Column ── */
.vr-col{display:flex;flex-direction:column;gap:.5rem;transition:opacity .4s}
.vr-col.loser{opacity:.55}
.vr-col-header{padding:.7rem .6rem .5rem;border-radius:10px 10px 0 0;background:rgba(8,14,30,.8);border:1px solid #0d1835;border-bottom:none;text-align:center}
.vr-col-label{font-size:.52rem;letter-spacing:.32em;color:#2a4060;margin-bottom:.3rem;font-family:'Barlow Condensed',sans-serif;font-weight:700}
.vr-winner-badge{display:inline-block;font-size:.6rem;letter-spacing:.18em;font-weight:800;color:#050a18;background:#ffd700;border-radius:3px;padding:2px 8px;margin-bottom:.3rem;font-family:'Barlow Condensed',sans-serif}
.vr-loser-badge{display:inline-block;font-size:.6rem;letter-spacing:.18em;font-weight:700;color:#2a4060;background:rgba(42,64,96,.2);border:1px solid #1a3050;border-radius:3px;padding:2px 8px;margin-bottom:.3rem;font-family:'Barlow Condensed',sans-serif}
.vr-col-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1.3rem;line-height:1;margin-bottom:.15rem}
.vr-col-tier{font-size:.62rem;color:#3a6080;letter-spacing:.08em;font-family:'Barlow Condensed',sans-serif;font-weight:600}
.vr-score-waiting{color:#2a4060;font-size:.9rem;font-family:'Barlow Condensed',sans-serif;font-weight:600;letter-spacing:.06em}

/* ── Slot list ── */
.vr-slot-list{display:flex;flex-direction:column;gap:3px}

/* ── Individual slot row ── */
.vr-slot-row{display:flex;align-items:center;gap:.45rem;padding:.32rem .5rem;border-radius:6px;background:rgba(4,8,16,.7);border:1px solid transparent;transition:border-color .3s}
.vr-slot-row.filled{border-color:var(--rc,transparent);box-shadow:inset 0 0 12px var(--rg,transparent)}
.vr-slot-row.filled:hover{border-color:var(--rc,transparent);background:rgba(4,8,16,.9)}
.vr-slot-row.blacked{background:rgba(4,8,16,.5);border-color:#0a1428}
.vr-slot-row.empty{border-color:#0a1428}

.vr-sr-pos{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.52rem;letter-spacing:.1em;color:#fff;background:#1a3050;padding:2px 4px;border-radius:3px;min-width:20px;text-align:center;flex-shrink:0}

.vr-sr-img-wrap{width:28px;height:28px;border-radius:4px;overflow:hidden;flex-shrink:0;position:relative;display:flex;align-items:center;justify-content:center;background:rgba(4,8,16,.6)}
.vr-sr-img{width:100%;height:100%;object-fit:cover;object-position:center top}
.vr-sr-initial{font-family:'Orbitron',sans-serif;font-weight:900;font-size:.9rem;line-height:1}
.blacked-img{background:rgba(8,14,30,.9);overflow:hidden}
.vr-sr-img-blur{width:100%;height:100%;background:repeating-linear-gradient(45deg,#0a1428 0,#0a1428 3px,#071020 3px,#071020 6px);animation:blacked-shift 3s linear infinite}
@keyframes blacked-shift{0%{background-position:0 0}100%{background-position:12px 12px}}
.empty-img{background:#070e20}

.vr-sr-info{flex:1;min-width:0}
.vr-sr-name{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.75rem;letter-spacing:.02em;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vr-sr-team{font-size:.48rem;color:#2a4060;letter-spacing:.06em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vr-sr-score{font-family:'Orbitron',sans-serif;font-weight:700;font-size:.7rem;flex-shrink:0;text-align:right}

/* Blacked-out placeholder text */
.blacked-text{background:linear-gradient(90deg,#0d1835 40%,#162040 50%,#0d1835 60%);background-size:200% 100%;animation:shimmer-dark 2s ease-in-out infinite;border-radius:3px;height:.7rem;min-width:40px}
.blacked-text.short{min-width:24px;height:.65rem}
@keyframes shimmer-dark{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* ── Column total ── */
.vr-col-total{display:flex;justify-content:space-between;align-items:center;padding:.5rem .6rem;border-radius:0 0 8px 8px;background:rgba(4,8,16,.8);border:1px solid;border-top:none}

/* ── Actions ── */
.vr-actions{display:flex;flex-direction:column;gap:.6rem;max-width:500px;margin:1.5rem auto 0;padding:0 1rem}
.vr-btn-primary{display:block;text-align:center;background:linear-gradient(135deg,#a07020,#ffd700);color:#050a18;border:none;border-radius:10px;padding:.9rem 1.5rem;font-family:'Orbitron',sans-serif;font-weight:700;font-size:.88rem;letter-spacing:.12em;text-decoration:none;cursor:pointer;transition:.2s}
.vr-btn-primary:hover{filter:brightness(1.1);transform:scale(1.02)}
.vr-btn-secondary{display:block;text-align:center;background:transparent;border:2px solid #1a3050;color:#3a6080;border-radius:10px;padding:.8rem 1.5rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.95rem;letter-spacing:.1em;text-decoration:none;transition:.2s}
.vr-btn-secondary:hover{border-color:#28dc78;color:#28dc78}

.vr-invite-row{margin-bottom:.8rem}
.vr-invite-label{font-size:.52rem;letter-spacing:.28em;color:#2a4060;margin-bottom:.4rem;font-family:'Barlow Condensed',sans-serif;font-weight:700}
.vr-invite-box{display:flex;align-items:center;gap:.5rem;background:rgba(4,8,16,.8);border:1px solid #1a3050;border-radius:8px;padding:.5rem .7rem}
.vr-invite-url{flex:1;font-family:'Barlow Condensed',sans-serif;font-size:.72rem;color:#2a4060;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.03em}
.vr-invite-copy{background:rgba(40,220,120,.1);border:1px solid rgba(40,220,120,.3);color:#28dc78;border-radius:5px;padding:.3rem .65rem;font-size:.8rem;cursor:pointer;flex-shrink:0;transition:.15s;font-weight:700}
.vr-invite-copy:hover{background:rgba(40,220,120,.2)}

/* ── Responsive ── */
@media(max-width:640px){
  .vr-lineups{padding:0 .4rem;gap:0}
  .vr-center-divider{padding:.5rem .3rem}
  .vr-sr-pos{min-width:17px;font-size:.48rem}
  .vr-sr-img-wrap{width:22px;height:22px}
  .vr-sr-name{font-size:.68rem}
  .vr-sr-score{font-size:.62rem}
  .vr-col-score{font-size:1rem}
  .vr-sb-score{font-size:1.4rem}
  .vr-sb-divider{padding:0 .8rem}
  .vr-banner-text{font-size:1rem}
  .vr-banner-arrow{font-size:1.2rem}
}
@media(max-width:420px){
  .vr-sr-img-wrap{display:none}
  .vr-col-score{font-size:.85rem}
}
`;

function VersusResultsFallback() {
  return (
    <div style={{ minHeight:'100vh', background:'#050a18', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontFamily:'Barlow Condensed,sans-serif', color:'#2a4060', letterSpacing:'.2em', fontSize:'.85rem' }}>
        LOADING...
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