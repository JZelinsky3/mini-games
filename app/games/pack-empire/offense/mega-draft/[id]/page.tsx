'use client';
import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ──────────────────────────────────────────────────────────── */
type Rarity = 'common' | 'rare' | 'dynasty' | 'transcendent' | 'immortal';
interface Player {
  id: string; name: string; pos: string; team: string;
  score: number; rarity: Rarity; accolades: string[];
}
interface Pick {
  player_id: string;
  player_idx: number;
  user: 'p1' | 'p2';
  slot: string;
  pick_number: number;
}
interface DraftState {
  id: string;
  pool: Player[];
  picks: Pick[];
  current_pick: number;
  p1_id: string;
  p2_id: string | null;
  p1_name: string;
  p2_name: string | null;
  status: 'waiting' | 'active' | 'complete';
}

function parseCSVRow(row: string): string[] {
  const cols: string[] = []; let cur = ''; let inQ = false;
  for (const c of row) { if (c === '"') { inQ = !inQ; continue; } if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; } cur += c; }
  cols.push(cur.trim()); return cols;
}

/* ─── Constants ──────────────────────────────────────────────────────── */
const RC: Record<Rarity, { label: string; color: string; glow: string; art: string }> = {
  common:       { label: 'COM', color: '#c87840', glow: 'rgba(200,120,60,.5)',  art: 'linear-gradient(150deg,#3d2210,#7a4820)' },
  rare:         { label: 'RAR', color: '#42c0f8', glow: 'rgba(66,192,248,.6)', art: 'linear-gradient(150deg,#062840,#104870)' },
  dynasty:      { label: 'DYN', color: '#ffd700', glow: 'rgba(255,215,0,.7)',  art: 'linear-gradient(150deg,#3a2800,#806010)' },
  transcendent: { label: 'TRN', color: '#e040ff', glow: 'rgba(224,64,255,.7)', art: 'linear-gradient(150deg,#280048,#6010b0)' },
  immortal:     { label: 'IMM', color: '#28dc78', glow: 'rgba(40,220,120,.7)', art: 'linear-gradient(150deg,#021a0a,#04401a)' },
};

const SLOT_DEFS = [
  { key: 'QB',  label: 'QB',  pos: 'QB' },
  { key: 'RB',  label: 'HB',  pos: 'RB' },
  { key: 'WR1', label: 'WR',  pos: 'WR' },
  { key: 'WR2', label: 'WR',  pos: 'WR' },
  { key: 'WR3', label: 'WR',  pos: 'WR' },
  { key: 'TE',  label: 'TE',  pos: 'TE' },
  { key: 'LT',  label: 'LT',  pos: 'OT' },
  { key: 'LG',  label: 'LG',  pos: 'OG' },
  { key: 'C',   label: 'C',   pos: 'C'  },
  { key: 'RG',  label: 'RG',  pos: 'OG' },
  { key: 'RT',  label: 'RT',  pos: 'OT' },
] as const;

const TOTAL_PICKS = 22;

function getPickOwner(pickNumber: number): 'p1' | 'p2' {
  const pair = Math.floor(pickNumber / 2);
  if (pair % 2 === 0) return pickNumber % 2 === 0 ? 'p1' : 'p2';
  else return pickNumber % 2 === 0 ? 'p2' : 'p1';
}

function getDisplayName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  const suffixes = new Set(['jr.','jr','sr.','sr','ii','iii','iv','v','vi']);
  const last = parts[parts.length - 1];
  if (suffixes.has(last.toLowerCase()) && parts.length >= 3) return `${parts[parts.length - 2]} ${last}`;
  return parts.length > 1 ? `${parts[0][0]}. ${last}` : last;
}

function getTier(score: number) {
  const tiers = [
    { min: 20001, label: 'GOAT', color: '#e040ff' },
    { min: 17001, label: 'HOF',  color: '#f4c06a' },
    { min: 14001, label: 'SBD',  color: '#e8a84b' },
    { min: 11001, label: 'APE',  color: '#6ba8c0' },
    { min: 8001,  label: 'PBC',  color: '#68a878' },
    { min: 0,     label: 'STR',  color: '#bfb5a0' },
  ];
  return tiers.find(t => score >= t.min) ?? tiers[tiers.length - 1];
}

/* ─── Lineup helpers ─────────────────────────────────────────────────── */
function buildLineup(picks: Pick[], pool: Player[], user: 'p1' | 'p2'): Record<string, Player | null> {
  const lineup: Record<string, Player | null> = {};
  SLOT_DEFS.forEach(s => { lineup[s.key] = null; });
  picks.filter(p => p.user === user).forEach(p => {
    const player = pool[p.player_idx] ?? pool.find(pl => pl.id === p.player_id);
    if (player) lineup[p.slot] = player;
  });
  return lineup;
}

function getOpenSlots(lineup: Record<string, Player | null>, pos: string): string[] {
  return SLOT_DEFS
    .filter(s => s.pos === pos && lineup[s.key] === null)
    .map(s => s.key);
}

function lineupScore(lineup: Record<string, Player | null>): number {
  return Object.values(lineup).reduce((s, p) => s + (p?.score ?? 0), 0);
}

function filledCount(lineup: Record<string, Player | null>): number {
  return Object.values(lineup).filter(Boolean).length;
}

/* ══════════════════════════════════════════════════════════════════════
   POOL CARD
══════════════════════════════════════════════════════════════════════ */
function PoolCard({
  player, isPicked, isMyTurn, myLineup, imageMap,
  onPick,
}: {
  player: Player;
  isPicked: boolean;
  isMyTurn: boolean;
  myLineup: Record<string, Player | null>;
  imageMap: Record<string, string>;
  onPick: (player: Player) => void;
}) {
  const rc = RC[player.rarity];
  const openSlots = getOpenSlots(myLineup, player.pos);
  const canPick = isMyTurn && !isPicked && openSlots.length > 0;
  const positionFull = isMyTurn && !isPicked && openSlots.length === 0;
  const imgSrc = imageMap[player.name];

  return (
    <div
      className={`md-pool-card${isPicked ? ' picked' : ''}${canPick ? ' can-pick' : ''}${positionFull ? ' pos-full' : ''}`}
      style={{ '--rc': rc.color, '--rg': rc.glow, '--art': rc.art } as React.CSSProperties}
      onClick={() => canPick && onPick(player)}
      title={positionFull ? `Your ${player.pos} slots are full` : undefined}
    >
      <div className="md-pc-top">
        <span className="md-pc-pos" style={{ background: rc.color }}>{player.pos}</span>
        <span className="md-pc-rar" style={{ color: rc.color }}>{rc.label}</span>
      </div>
      <div className="md-pc-art" style={{ background: rc.art }}>
        {imgSrc
          ? <img src={imgSrc} alt={player.name} className="md-pc-img" onError={e => (e.currentTarget.style.display = 'none')} />
          : <div className="md-pc-initial" style={{ color: `${rc.color}30` }}>{player.name.charAt(0)}</div>
        }
        {isPicked && <div className="md-pc-picked-overlay">DRAFTED</div>}
      </div>
      <div className="md-pc-body">
        <div className="md-pc-name" style={{ color: rc.color }}>{getDisplayName(player.name)}</div>
        <div className="md-pc-team">{player.team}</div>
        <div className="md-pc-score" style={{ color: rc.color }}>{player.score.toLocaleString()}</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   LINEUP COLUMN
══════════════════════════════════════════════════════════════════════ */
function LineupCol({
  name, lineup, isMe, isCurrent, imageMap,
}: {
  name: string;
  lineup: Record<string, Player | null>;
  isMe: boolean;
  isCurrent: boolean;
  imageMap: Record<string, string>;
}) {
  const score = lineupScore(lineup);
  const tier  = getTier(score);
  const filled = filledCount(lineup);

  return (
    <div className={`md-lineup-col${isCurrent ? ' current-drafter' : ''}`}>
      <div className="md-lc-header">
        {isCurrent && <div className="md-lc-picking">PICKING</div>}
        <div className="md-lc-name">{name}{isMe ? ' (you)' : ''}</div>
        <div className="md-lc-score" style={{ color: tier.color }}>{score.toLocaleString()}</div>
        <div className="md-lc-progress">{filled}/11</div>
      </div>
      <div className="md-lc-slots">
        {SLOT_DEFS.map(slot => {
          const player = lineup[slot.key];
          const rc = player ? RC[player.rarity] : null;
          const imgSrc = player ? imageMap[player.name] : undefined;
          return (
            <div key={slot.key} className={`md-lc-slot${player ? ' filled' : ' empty'}`}
              style={player ? { '--rc': rc!.color, borderColor: `${rc!.color}30` } as React.CSSProperties : {}}>
              <div className="md-lcs-pos" style={player ? { background: rc!.color } : {}}>{slot.label}</div>
              {player ? (
                <>
                  {imgSrc
                    ? <img src={imgSrc} alt={player.name} className="md-lcs-img" onError={e => (e.currentTarget.style.display='none')} />
                    : <div className="md-lcs-initial" style={{ color: `${rc!.color}40` }}>{player.name.charAt(0)}</div>
                  }
                  <div className="md-lcs-info">
                    <div className="md-lcs-name" style={{ color: rc!.color }}>{getDisplayName(player.name)}</div>
                    <div className="md-lcs-score">{player.score.toLocaleString()}</div>
                  </div>
                </>
              ) : (
                <div className="md-lcs-empty">—</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN DRAFT ROOM
══════════════════════════════════════════════════════════════════════ */
function MegaDraftRoom() {
  const params   = useParams();
  const router   = useRouter();
  const supabase = createClient();
  const draftId  = params.id as string;

  const [draft, setDraft]     = useState<DraftState | null>(null);
  const [myRole, setMyRole]   = useState<'p1' | 'p2' | null>(null);
  const [myId, setMyId]       = useState<string>('');
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState(false);
  const [posFilter, setPosFilter] = useState<string>('ALL');
  const [lastPickHighlight, setLastPickHighlight] = useState<string | null>(null);
  const [error, setError]     = useState('');

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
    async function identify() {
      const { data: { user } } = await supabase.auth.getUser();
      const guestName = localStorage.getItem(`mega-guest-${draftId}`);
      const localDrafts = JSON.parse(localStorage.getItem('mega-draft-active') || '[]');
      const myEntry = localDrafts.find((d: any) => d.id === draftId);
      const uid = user?.id ?? `guest-${draftId}`;
      setMyId(uid);
    }
    identify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('mega_drafts').select('*').eq('id', draftId).single();
      if (error || !data) { setError('Draft not found'); setLoading(false); return; }
      setDraft(data as DraftState);

      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id;
      const localDrafts = JSON.parse(localStorage.getItem('mega-draft-active') || '[]');
      const myEntry = localDrafts.find((d: any) => d.id === draftId);

      if (uid && data.p1_id === uid) setMyRole('p1');
      else if (uid && data.p2_id === uid) setMyRole('p2');
      else if (myEntry?.role === 'p1') setMyRole('p1');
      else if (myEntry?.role === 'p2') setMyRole('p2');
      else {
        const guestName = localStorage.getItem(`mega-guest-${draftId}`);
        if (guestName && data.p1_name === guestName) setMyRole('p1');
        else if (guestName && data.p2_name === guestName) setMyRole('p2');
        else setMyRole('p1');
      }

      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  useEffect(() => {
    const channel = supabase
      .channel(`mega_draft_${draftId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'mega_drafts',
        filter: `id=eq.${draftId}`,
      }, (payload) => {
        const newDraftData = payload.new as DraftState;
        setDraft(prev => {
          if (!prev) return newDraftData;

          if (newDraftData.picks?.length > prev.picks.length) {
            const lastPick = newDraftData.picks[newDraftData.picks.length - 1];
            if (lastPick) {
              setLastPickHighlight(lastPick.player_id);
              setTimeout(() => setLastPickHighlight(null), 2000);
            }
          }

          return {
            ...prev,
            ...newDraftData,
            pool: newDraftData.pool ?? prev.pool,
          };
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [draftId, supabase]);

  const pickPlayer = useCallback(async (player: Player) => {
    if (!draft || !myRole || picking) return;
    const currentPicker = getPickOwner(draft.current_pick);
    if (currentPicker !== myRole) return;

    const myLineup = buildLineup(draft.picks, draft.pool, myRole);
    const openSlots = getOpenSlots(myLineup, player.pos);
    if (openSlots.length === 0) return;
    const slot = openSlots[0];

    setPicking(true);
    try {
      const newPick: Pick = {
        player_id: player.id,
        player_idx: draft.pool.findIndex(p => p.id === player.id),
        user: myRole,
        slot,
        pick_number: draft.current_pick,
      };

      const newPicks = [...draft.picks, newPick];
      const newPickNumber = draft.current_pick + 1;
      const newStatus = newPickNumber >= TOTAL_PICKS ? 'complete' : 'active';

      const { error } = await supabase.from('mega_drafts').update({
        picks: newPicks,
        current_pick: newPickNumber,
        status: newStatus,
        ...(newStatus === 'complete' ? { completed_at: new Date().toISOString() } : {}),
      }).eq('id', draftId);

      if (error) throw error;

      setDraft(prev => prev ? { ...prev, picks: newPicks, current_pick: newPickNumber, status: newStatus } : prev);
    } catch (e: any) {
      setError('Pick failed — try again');
    } finally {
      setPicking(false);
    }
  }, [draft, myRole, picking, draftId, supabase]);

  const pool         = draft?.pool ?? [];
  const picks        = draft?.picks ?? [];
  const pickedIds    = new Set(picks.map(p => p.player_id));
  const currentPick  = draft?.current_pick ?? 0;
  const isMyTurn     = myRole !== null && getPickOwner(currentPick) === myRole;
  const p1Lineup     = useMemo(() => buildLineup(picks, pool, 'p1'), [picks, pool]);
  const p2Lineup     = useMemo(() => buildLineup(picks, pool, 'p2'), [picks, pool]);
  const myLineup     = myRole === 'p1' ? p1Lineup : p2Lineup;
  const isDone       = draft?.status === 'complete';

  const posFilters = ['ALL', 'QB', 'RB', 'WR', 'TE', 'OT', 'OG', 'C'];

  const visiblePool = useMemo(() => {
    let filtered = pool.filter(p =>
      posFilter === 'ALL' || p.pos === posFilter
    );
    filtered.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.pos !== b.pos) return a.pos.localeCompare(b.pos);
      return a.name.localeCompare(b.name);
    });
    return filtered;
  }, [pool, posFilter]);

  const p1Score = lineupScore(p1Lineup);
  const p2Score = lineupScore(p2Lineup);
  const p1Wins  = isDone && p1Score > p2Score;
  const p2Wins  = isDone && p2Score > p1Score;
  const isTie   = isDone && p1Score === p2Score;

  if (loading) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="md-loading">
        <div className="md-loading-text">Loading draft —</div>
      </div>
    </>
  );

  if (error) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="md-error">
        <div className="md-error-icon">✕</div>
        <div className="md-error-title">{error}</div>
        <Link href="/games/pack-empire/offense/mega-draft" className="md-error-back">← Back to Lobby</Link>
      </div>
    </>
  );

  if (draft?.status === 'waiting') return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="md-waiting">
        <div className="md-waiting-icon">⏳</div>
        <div className="md-waiting-kicker">§ Lobby · Awaiting challenger</div>
        <div className="md-waiting-title">
          Waiting for <span className="md-italic">opponent.</span>
        </div>
        <div className="md-waiting-id-card">
          <div className="md-waiting-id-label">Draft ID — share this</div>
          <div className="md-waiting-id-value">{draftId.toUpperCase()}</div>
        </div>
        <div className="md-waiting-sub">Send the Draft ID above to your opponent to join.</div>
        <Link href="/games/pack-empire/offense/mega-draft" className="md-waiting-back">← Back to Lobby</Link>
      </div>
    </>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Nav / Masthead */}
      <nav className="md-nav">
        <div className="md-nav-l">
          <Link href="/games/pack-empire/offense/mega-draft" className="md-back">← Lobby</Link>
        </div>
        <div className="md-nav-c">
          <span className="md-pip" />
          <span className="md-nav-title">
            Mega <span className="md-nav-italic">Draft.</span>
          </span>
        </div>
        <div className="md-nav-r">
          <span className="md-nav-id">#{draftId.slice(-6).toUpperCase()}</span>
        </div>
      </nav>

      {/* Winner banner */}
      {isDone && (
        <div className={`md-winner-banner${isTie ? ' tie' : ''}`}>
          <span className="md-wb-star">★</span>
          {isTie ? (
            <span>Tie game · {p1Score.toLocaleString()} pts each</span>
          ) : (
            <span>
              {(myRole === 'p1' && p1Wins) || (myRole === 'p2' && p2Wins) ? 'You win' : `${p1Wins ? draft?.p1_name : draft?.p2_name} wins`}
              <span className="md-wb-margin"> · {Math.abs(p1Score - p2Score).toLocaleString()} pt margin</span>
            </span>
          )}
          <span className="md-wb-star">★</span>
        </div>
      )}

      {/* Turn indicator */}
      {!isDone && (
        <div className={`md-turn-bar${isMyTurn ? ' my-turn' : ''}`}>
          {isMyTurn ? (
            <>
              <span className="md-turn-dot" />
              <strong>YOUR PICK</strong>
              <span className="md-turn-detail">Round {Math.floor(currentPick / 2) + 1} · Pick {currentPick + 1} of {TOTAL_PICKS}</span>
            </>
          ) : (
            <>
              <span className="md-turn-dot muted" />
              Waiting for <strong>{getPickOwner(currentPick) === 'p1' ? draft?.p1_name : draft?.p2_name}</strong>
              <span className="md-turn-detail">to pick...</span>
            </>
          )}
        </div>
      )}

      <div className="md-layout">

        {/* ── Side-by-side lineups ── */}
        <div className="md-lineups-row">
          <LineupCol
            name={draft?.p1_name ?? 'Player 1'}
            lineup={p1Lineup}
            isMe={myRole === 'p1'}
            isCurrent={!isDone && getPickOwner(currentPick) === 'p1'}
            imageMap={imageMap}
          />
          <div className="md-vs-divider">
            <div className="md-vsd-line" />
            <div className="md-vsd-icon">⚔️</div>
            <div className="md-vsd-scores">
              <span style={{ color: p1Wins ? '#e8a84b' : 'var(--md-ink-mute)' }}>{p1Score.toLocaleString()}</span>
              <span className="md-vsd-vs">VS</span>
              <span style={{ color: p2Wins ? '#e8a84b' : 'var(--md-ink-mute)' }}>{p2Score.toLocaleString()}</span>
            </div>
            <div className="md-vsd-line" />
          </div>
          <LineupCol
            name={draft?.p2_name ?? 'Player 2'}
            lineup={p2Lineup}
            isMe={myRole === 'p2'}
            isCurrent={!isDone && getPickOwner(currentPick) === 'p2'}
            imageMap={imageMap}
          />
        </div>

        {/* ── Available pool ── */}
        {!isDone && (
          <div className="md-pool-section">
            <div className="md-pool-header">
              <div className="md-pool-header-top">
                <span className="md-pool-section-num">§ 02 · Pool</span>
                <span className="md-pool-title">
                  Available <span className="md-italic">players.</span>
                </span>
                <span className="md-pool-count">{pool.length - pickedIds.size} remaining</span>
              </div>
              <div className="md-pos-filters">
                {posFilters.map(f => (
                  <button key={f} onClick={() => setPosFilter(f)} className={`md-pos-filter${posFilter === f ? ' active' : ''}`}>
                    {f}
                  </button>
                ))}
              </div>
              <div className="md-pool-sort-info">Sorted by power score · highest first</div>
            </div>

            {isMyTurn && (
              <div className="md-pick-prompt">
                <span className="md-pp-dot" />
                Your pick — tap a player to draft them
              </div>
            )}

            <div className="md-pool-grid">
              {visiblePool.map(player => (
                <PoolCard
                  key={player.id}
                  player={player}
                  isPicked={pickedIds.has(player.id)}
                  isMyTurn={isMyTurn && !picking}
                  myLineup={myLineup}
                  imageMap={imageMap}
                  onPick={pickPlayer}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Complete screen ── */}
        {isDone && (
          <div className="md-complete-section">
            <div className="md-complete-kicker">§ 03 · Final</div>
            <div className="md-complete-title">
              Draft <span className="md-italic">complete.</span>
            </div>
            <div className="md-complete-scores">
              <div className={`md-cs-side${p1Wins ? ' winner' : p2Wins ? ' loser' : ''}`}>
                <div className="md-cs-name">{draft?.p1_name}</div>
                <div className="md-cs-score" style={{ color: p1Wins ? '#e8a84b' : 'var(--md-ink-mute)' }}>{p1Score.toLocaleString()}</div>
                {p1Wins && <div className="md-cs-badge">★ WINNER</div>}
              </div>
              <div className="md-cs-vs">VS</div>
              <div className={`md-cs-side${p2Wins ? ' winner' : p1Wins ? ' loser' : ''}`}>
                <div className="md-cs-name">{draft?.p2_name}</div>
                <div className="md-cs-score" style={{ color: p2Wins ? '#e8a84b' : 'var(--md-ink-mute)' }}>{p2Score.toLocaleString()}</div>
                {p2Wins && <div className="md-cs-badge">★ WINNER</div>}
              </div>
            </div>
            <Link href="/games/pack-empire/offense/mega-draft" className="md-complete-btn">
              <span>Back to lobby</span>
              <span>→</span>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

function Fallback() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="md-loading">
        <div className="md-loading-text">Loading —</div>
      </div>
    </>
  );
}

export default function MegaDraftRoomPage() {
  return <Suspense fallback={<Fallback />}><MegaDraftRoom /></Suspense>;
}

/* ══════════════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --md-bg:#141311;
  --md-bg-soft:#1c1b18;
  --md-bg-card:#201e1a;
  --md-ink:#f4ebd8;
  --md-ink-soft:#bfb5a0;
  --md-ink-mute:#7d7463;
  --md-line:#3a3630;
  --md-line-soft:#2a2620;
  --md-amber:#e8a84b;
  --md-amber-bright:#f4c06a;
  /* Mega Draft signature: purple */
  --md-purple:#b06090;
  --md-purple-bright:#cc7bb0;
  --md-purple-deep:#7a4068;
  --md-purple-glow:rgba(176,96,144,.4);
}

body{font-family:'Space Grotesk',sans-serif;background:var(--md-bg);color:var(--md-ink)}

/* ═══ Loading / error / waiting states ═══ */
.md-loading,.md-error,.md-waiting{
  min-height:100vh;background:var(--md-bg);color:var(--md-ink);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:2rem 1.5rem;gap:1rem;
}
.md-loading-text{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.72rem;letter-spacing:.28em;text-transform:uppercase;
  color:var(--md-ink-mute);
}

.md-error-icon{font-size:2rem;color:#c04820}
.md-error-title{
  font-family:'DM Serif Display',serif;font-size:1.4rem;
  color:var(--md-ink);letter-spacing:-.01em;
}
.md-error-back{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;
  color:var(--md-purple);text-decoration:none;
  padding:.65rem 1.2rem;border:1px solid var(--md-purple);
  border-radius:2px;margin-top:.5rem;transition:all .2s;
}
.md-error-back:hover{background:rgba(176,96,144,.08);color:var(--md-purple-bright)}

.md-waiting{max-width:520px;margin:0 auto;text-align:center}
.md-waiting-icon{font-size:3rem}
.md-waiting-kicker{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.65rem;letter-spacing:.28em;text-transform:uppercase;
  color:var(--md-purple);
}
.md-waiting-title{
  font-family:'DM Serif Display',serif;
  font-size:clamp(2rem,5vw,3rem);line-height:1;letter-spacing:-.02em;
  color:var(--md-ink);margin:.3rem 0;
}
.md-waiting-id-card{
  background:var(--md-bg-card);border:1px solid var(--md-line);
  padding:1.25rem 1.8rem;margin-top:1rem;position:relative;
}
.md-waiting-id-card::before{
  content:'';position:absolute;top:0;left:0;width:3px;height:100%;
  background:var(--md-purple);
}
.md-waiting-id-label{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.6rem;letter-spacing:.28em;text-transform:uppercase;
  color:var(--md-ink-mute);margin-bottom:.5rem;
}
.md-waiting-id-value{
  font-family:'DM Serif Display',serif;
  font-size:1.4rem;letter-spacing:.04em;
  color:var(--md-purple);
}
.md-waiting-sub{
  font-family:'Space Grotesk',sans-serif;
  color:var(--md-ink-soft);font-size:.9rem;margin-top:.5rem;
}
.md-waiting-back{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;
  color:var(--md-ink-mute);text-decoration:none;margin-top:1rem;
  transition:color .2s;
}
.md-waiting-back:hover{color:var(--md-purple)}

/* ═══ NAV / MASTHEAD ═══ */
.md-nav{
  display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:1rem;
  padding:1.2rem 2rem;
  background:rgba(20,19,17,.92);
  backdrop-filter:blur(12px);
  border-bottom:1px solid var(--md-line);
  position:sticky;top:0;z-index:30;
}
.md-nav-l{justify-self:start}
.md-back{
  color:var(--md-purple);text-decoration:none;
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;
  transition:color .2s;
}
.md-back:hover{color:var(--md-purple-bright)}
.md-nav-c{display:flex;align-items:center;gap:.65rem;justify-self:center}
.md-nav-title{
  font-family:'DM Serif Display',serif;
  font-size:1.35rem;letter-spacing:-.01em;color:var(--md-ink);
}
.md-nav-italic{font-style:italic;color:var(--md-purple)}
.md-pip{
  width:9px;height:9px;border-radius:50%;
  background:var(--md-purple);flex-shrink:0;
  box-shadow:0 0 0 3px rgba(176,96,144,.15),0 0 12px var(--md-purple);
  animation:md-pip 2s ease-in-out infinite;
}
@keyframes md-pip{
  0%,100%{box-shadow:0 0 0 3px rgba(176,96,144,.15),0 0 12px var(--md-purple)}
  50%{box-shadow:0 0 0 6px rgba(176,96,144,.05),0 0 22px var(--md-purple-bright)}
}
.md-nav-r{justify-self:end}
.md-nav-id{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.72rem;letter-spacing:.18em;
  color:var(--md-ink-soft);
  padding:.45rem .75rem;
  background:var(--md-bg-card);border:1px solid var(--md-line);
  border-radius:2px;
}

/* ═══ WINNER BANNER ═══ */
.md-winner-banner{
  display:flex;align-items:center;justify-content:center;gap:.8rem;
  text-align:center;padding:.9rem 1.2rem;
  background:linear-gradient(135deg,rgba(232,168,75,.08),rgba(232,168,75,.03));
  border-bottom:1px solid rgba(232,168,75,.25);
  font-family:'DM Serif Display',serif;
  font-size:clamp(1rem,2.3vw,1.3rem);letter-spacing:-.01em;
  color:var(--md-amber);
}
.md-winner-banner.tie{
  background:rgba(107,168,192,.06);
  border-bottom-color:rgba(107,168,192,.25);
  color:#6ba8c0;
}
.md-wb-star{color:inherit;opacity:.7;font-size:.85em}
.md-wb-margin{
  font-family:'JetBrains Mono',monospace;font-size:.75rem;font-style:normal;
  letter-spacing:.12em;text-transform:uppercase;color:var(--md-ink-mute);
  font-weight:500;
}

/* ═══ TURN BAR ═══ */
.md-turn-bar{
  display:flex;align-items:center;justify-content:center;gap:.6rem;
  padding:.7rem 1.2rem;
  background:rgba(20,19,17,.95);
  border-bottom:1px solid var(--md-line);
  font-family:'Space Grotesk',sans-serif;font-size:.88rem;
  color:var(--md-ink-soft);letter-spacing:.02em;
  position:sticky;top:62px;z-index:20;backdrop-filter:blur(8px);
}
.md-turn-bar.my-turn{
  background:linear-gradient(90deg,rgba(176,96,144,.08),rgba(176,96,144,.04));
  border-bottom-color:rgba(176,96,144,.3);
  color:var(--md-ink);
}
.md-turn-bar strong{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;
  color:var(--md-purple);
}
.md-turn-bar.my-turn strong{color:var(--md-purple-bright)}
.md-turn-detail{
  font-family:'JetBrains Mono',monospace;font-size:.68rem;
  letter-spacing:.12em;text-transform:uppercase;color:var(--md-ink-mute);
}
.md-turn-dot{
  width:7px;height:7px;border-radius:50%;
  background:var(--md-purple);flex-shrink:0;
  animation:md-turn-pulse 1s ease-in-out infinite;
  box-shadow:0 0 10px var(--md-purple-glow);
}
.md-turn-dot.muted{
  background:var(--md-ink-mute);animation:none;box-shadow:none;
}
@keyframes md-turn-pulse{
  0%,100%{opacity:.5;transform:scale(.8)}
  50%{opacity:1;transform:scale(1.2)}
}

/* ═══ LAYOUT ═══ */
.md-layout{
  background:var(--md-bg);
  min-height:calc(100vh - 120px);
  background-image:
    radial-gradient(ellipse at 50% -10%,rgba(176,96,144,.04),transparent 55%),
    repeating-linear-gradient(0deg,transparent,transparent 70px,rgba(176,96,144,.01) 70px,rgba(176,96,144,.01) 71px);
  padding:0 0 3rem;
}

/* ═══ LINEUPS ROW ═══ */
.md-lineups-row{
  display:grid;grid-template-columns:1fr auto 1fr;gap:0;
  border-bottom:1px solid var(--md-line);
  background:rgba(20,19,17,.6);
  max-width:75%;margin:0 auto;
}

/* ═══ LINEUP COLUMN ═══ */
.md-lineup-col{
  padding:.9rem .75rem;
  transition:background .3s;
}
.md-lineup-col.current-drafter{
  background:rgba(176,96,144,.08);
  box-shadow:inset 0 0 0 1px rgba(176,96,144,.3);
}
.md-lineup-col.current-drafter .md-lc-header{
  background:rgba(176,96,144,.1);
}

.md-lc-header{
  text-align:center;padding:.6rem .4rem .8rem;
  border-bottom:1px solid var(--md-line);
  margin-bottom:.7rem;
  display:flex;flex-direction:column;justify-content:center;align-items:center;
  gap:.15rem;min-height:92px;
}
.md-lc-picking{
  display:inline-block;
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.58rem;letter-spacing:.3em;text-transform:uppercase;
  background:rgba(176,96,144,.15);color:var(--md-purple-bright);
  border:1px solid var(--md-purple);
  padding:3px 8px;border-radius:2px;
  margin-bottom:.2rem;
}
.md-lc-name{
  font-family:'DM Serif Display',serif;
  font-size:1.1rem;line-height:1.1;letter-spacing:-.01em;
  color:var(--md-ink);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;
}
.md-lc-score{
  font-family:'DM Serif Display',serif;
  font-size:1.6rem;line-height:1;letter-spacing:-.02em;
  margin-top:.15rem;
}
.md-lc-progress{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;
  color:var(--md-ink-mute);
}
.md-lc-slots{display:flex;flex-direction:column;gap:6px}

.md-lc-slot{
  display:flex;align-items:center;gap:.4rem;
  padding:.3rem .4rem;
  background:var(--md-bg-card);
  border:1px solid transparent;
  border-radius:2px;
  min-height:46px;
}
.md-lc-slot.filled{
  background:rgba(20,19,17,.8);
  border-color:var(--rc,var(--md-line));
  border-left-width:3px;
}
.md-lc-slot.empty{
  border-color:var(--md-line-soft);
  border-style:dashed;
}
.md-lcs-pos{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.5rem;letter-spacing:.12em;color:#fff;
  background:var(--md-line);
  padding:2px 4px;border-radius:2px;
  min-width:20px;text-align:center;flex-shrink:0;
}
.md-lcs-img{
  width:36px;height:36px;
  border-radius:2px;
  object-fit:cover;object-position:center top;
  flex-shrink:0;
}
.md-lcs-initial{
  width:20px;height:20px;border-radius:2px;
  display:flex;align-items:center;justify-content:center;
  font-family:'DM Serif Display',serif;font-size:.9rem;
  flex-shrink:0;
}
.md-lcs-info{flex:1;min-width:0}
.md-lcs-name{
  font-family:'DM Serif Display',serif;
  font-size:.9rem;line-height:1.2;letter-spacing:-.005em;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.md-lcs-score{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.72rem;color:var(--md-ink-soft);letter-spacing:.02em;
}
.md-lcs-empty{
  font-family:'JetBrains Mono',monospace;
  font-size:.55rem;letter-spacing:.18em;text-transform:uppercase;
  color:var(--md-line);flex:1;text-align:center;
}

/* ═══ VS DIVIDER ═══ */
.md-vs-divider{
  display:flex;flex-direction:column;align-items:center;
  padding:.5rem .4rem;gap:.3rem;width:42px;flex-shrink:0;
}
.md-vsd-line{
  flex:1;width:1px;
  background:linear-gradient(to bottom,transparent,var(--md-line),transparent);
}
.md-vsd-icon{font-size:.95rem;opacity:.4}
.md-vsd-scores{
  display:flex;flex-direction:column;align-items:center;gap:.25rem;
  font-family:'JetBrains Mono',monospace;font-weight:700;font-size:.62rem;
}
.md-vsd-vs{
  font-size:.6rem;letter-spacing:.18em;
  color:var(--md-line);
}

/* ═══ POOL SECTION ═══ */
.md-pool-section{
  padding:1.5rem 1rem 0;
  max-width:96%;margin:0 auto;
}
.md-pool-header{
  display:flex;flex-direction:column;gap:.7rem;
  margin-bottom:1rem;
  padding-bottom:1rem;
  border-bottom:3px double var(--md-line);
}
.md-pool-header-top{
  display:flex;justify-content:space-between;align-items:baseline;gap:.75rem;flex-wrap:wrap;
}
.md-pool-section-num{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.7rem;letter-spacing:.22em;text-transform:uppercase;
  color:var(--md-purple);
}
.md-pool-title{
  font-family:'DM Serif Display',serif;font-style:italic;
  font-size:clamp(1.3rem,2.5vw,1.8rem);letter-spacing:-.01em;
  color:var(--md-ink);
}
.md-pool-count{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.65rem;letter-spacing:.2em;text-transform:uppercase;
  color:var(--md-ink-mute);
}
.md-italic{font-style:italic;color:var(--md-purple)}

.md-pos-filters{display:flex;gap:.4rem;flex-wrap:wrap}
.md-pos-filter{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.65rem;letter-spacing:.18em;text-transform:uppercase;
  padding:.4rem .75rem;
  border-radius:2px;cursor:pointer;transition:all .2s;
  background:transparent;
  border:1px solid var(--md-line);
  color:var(--md-ink-mute);
}
.md-pos-filter.active{
  background:var(--md-purple);
  border-color:var(--md-purple);
  color:var(--md-bg);
}
.md-pos-filter:hover:not(.active){
  border-color:var(--md-purple);
  color:var(--md-purple);
}
.md-pool-sort-info{
  font-family:'JetBrains Mono',monospace;
  font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;
  color:var(--md-ink-mute);
}

.md-pick-prompt{
  display:flex;align-items:center;gap:.6rem;
  font-family:'DM Serif Display',serif;font-style:italic;
  font-size:1rem;color:var(--md-ink);
  padding:.75rem 1rem;margin-bottom:1rem;
  background:rgba(176,96,144,.06);
  border:1px solid rgba(176,96,144,.25);
  border-left:3px solid var(--md-purple);
  border-radius:2px;
}
.md-pp-dot{
  width:7px;height:7px;border-radius:50%;
  background:var(--md-purple);
  box-shadow:0 0 10px var(--md-purple-glow);
  animation:md-turn-pulse 1.2s ease-in-out infinite;flex-shrink:0;
}

/* ═══ POOL GRID ═══ */
.md-pool-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(110px,1fr));
  gap:.6rem;padding-bottom:2rem;
}

/* ═══ POOL CARD ═══ */
.md-pool-card{
  background:var(--md-bg-card);
  border:1px solid var(--md-line);
  overflow:hidden;position:relative;
  transition:all .25s cubic-bezier(.2,.8,.2,1);
}
.md-pool-card.can-pick{
  border-color:var(--rc,var(--md-line));
  cursor:pointer;
  box-shadow:0 0 0 0 transparent;
}
.md-pool-card.can-pick:hover{
  transform:translateY(-4px);
  box-shadow:0 14px 28px rgba(0,0,0,.4),0 0 20px var(--rg,transparent);
}
.md-pool-card.picked{opacity:.25;filter:grayscale(.8)}
.md-pool-card.pos-full{opacity:.4;filter:grayscale(.4)}

.md-pc-top{
  display:flex;justify-content:space-between;align-items:center;
  padding:.35rem .45rem;
  background:rgba(20,19,17,.95);
  border-bottom:1px solid var(--md-line-soft);
}
.md-pc-pos{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.52rem;letter-spacing:.12em;color:#050a18;
  padding:1px 5px;border-radius:2px;
}
.md-pc-rar{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.5rem;letter-spacing:.18em;
}

.md-pc-art{
  height:64px;position:relative;overflow:hidden;
  display:flex;align-items:center;justify-content:center;
}
.md-pc-img{
  position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);
  height:110%;width:auto;object-fit:contain;object-position:center bottom;z-index:2;
}
.md-pc-initial{
  font-family:'DM Serif Display',serif;
  font-size:2.4rem;line-height:1;letter-spacing:-.02em;
}
.md-pc-picked-overlay{
  position:absolute;inset:0;z-index:10;
  background:rgba(20,19,17,.9);
  display:flex;align-items:center;justify-content:center;
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.56rem;letter-spacing:.22em;text-transform:uppercase;
  color:var(--md-ink-mute);
}

.md-pc-body{
  padding:.4rem .45rem .5rem;
  background:rgba(20,19,17,.95);
}
.md-pc-name{
  font-family:'DM Serif Display',serif;
  font-size:.82rem;line-height:1.2;letter-spacing:-.01em;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.md-pc-team{
  font-family:'JetBrains Mono',monospace;
  font-size:.5rem;letter-spacing:.1em;text-transform:uppercase;
  color:var(--md-ink-mute);margin-top:2px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.md-pc-score{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.78rem;letter-spacing:.02em;margin-top:.25rem;
}

/* ═══ COMPLETE SECTION ═══ */
.md-complete-section{
  max-width:620px;margin:3rem auto;padding:0 1.5rem;
}
.md-complete-kicker{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.68rem;letter-spacing:.26em;text-transform:uppercase;
  color:var(--md-purple);text-align:center;margin-bottom:.6rem;
}
.md-complete-title{
  font-family:'DM Serif Display',serif;
  font-size:clamp(2rem,5vw,3rem);line-height:1;letter-spacing:-.02em;
  color:var(--md-ink);text-align:center;margin-bottom:2rem;
}
.md-complete-scores{
  display:flex;align-items:center;gap:1.5rem;
  background:linear-gradient(160deg,var(--md-bg-card),var(--md-bg-soft));
  border:1px solid var(--md-line);
  padding:2rem 1.5rem;
}
.md-cs-side{flex:1;text-align:center;transition:opacity .4s}
.md-cs-side.loser{opacity:.5}
.md-cs-name{
  font-family:'DM Serif Display',serif;
  font-size:1.15rem;line-height:1.1;letter-spacing:-.01em;
  color:var(--md-ink);margin-bottom:.5rem;
}
.md-cs-score{
  font-family:'DM Serif Display',serif;
  font-size:2.4rem;line-height:1;letter-spacing:-.02em;
}
.md-cs-badge{
  display:inline-block;
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.62rem;letter-spacing:.22em;text-transform:uppercase;
  color:var(--md-bg);background:var(--md-amber);
  padding:3px 10px;border-radius:2px;
  margin-top:.55rem;
}
.md-cs-vs{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.75rem;letter-spacing:.18em;
  color:var(--md-line);flex-shrink:0;
}

.md-complete-btn{
  display:flex;width:100%;align-items:center;justify-content:center;gap:.8rem;
  background:var(--md-purple);color:var(--md-bg);
  font-family:'Space Grotesk',sans-serif;font-weight:700;
  font-size:.9rem;letter-spacing:.18em;text-transform:uppercase;
  padding:1.1rem;margin-top:1.5rem;
  border-radius:2px;text-decoration:none;
  transition:all .25s cubic-bezier(.2,.8,.2,1);
  box-shadow:0 8px 20px rgba(176,96,144,.15);
}
.md-complete-btn:hover{
  background:var(--md-purple-bright);
  transform:translateY(-2px);
  box-shadow:0 14px 30px rgba(176,96,144,.3);
}

/* ═══ RESPONSIVE ═══ */
@media(max-width:900px){
  .md-lineups-row{max-width:95%}
}
@media(max-width:600px){
  .md-nav{padding:1rem 1.25rem;gap:.75rem}
  .md-nav-title{font-size:1.1rem}
  .md-nav-id{font-size:.65rem;padding:.35rem .6rem}
  .md-turn-bar{font-size:.8rem;padding:.6rem .9rem;flex-wrap:wrap}
  .md-pool-grid{grid-template-columns:repeat(auto-fill,minmax(95px,1fr));gap:.45rem}
  .md-pc-art{height:52px}
  .md-pc-score{font-size:.66rem}
  .md-lineups-row{max-width:100%;grid-template-columns:1fr auto 1fr}
  .md-lineup-col{padding:.6rem .5rem}
  .md-lc-name{font-size:.95rem}
  .md-lc-score{font-size:1.3rem}
  .md-vs-divider{width:32px}
  .md-complete-scores{gap:1rem;padding:1.5rem 1rem}
  .md-cs-score{font-size:1.8rem}
}
@media(max-width:420px){
  .md-pool-grid{grid-template-columns:repeat(3,1fr)}
  .md-pool-header-top{font-size:.9em}
  .md-lineups-row{font-size:.88em}
}
`;