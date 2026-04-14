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
  player_idx: number; // index in pool array
  user: 'p1' | 'p2';
  slot: string; // 'QB', 'RB', 'WR1' etc
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

// Slot definitions — each player fills one of these
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

const TOTAL_PICKS = 22; // 11 per player

// Snake order: P1 P2 P2 P1 P1 P2 P2 ...
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
    { min: 17001, label: 'HOF',  color: '#ffd700' },
    { min: 14001, label: 'SBD',  color: '#f0c030' },
    { min: 11001, label: 'APE',  color: '#42c0f8' },
    { min: 8001,  label: 'PBC',  color: '#50d870' },
    { min: 0,     label: 'STR',  color: '#a0b8d0' },
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
        <div className="md-lc-name">{name}{isMe ? ' (YOU)' : ''}</div>
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
  const [picking, setPicking] = useState(false); // debounce picks
  const [posFilter, setPosFilter] = useState<string>('ALL');
  const [lastPickHighlight, setLastPickHighlight] = useState<string | null>(null);
  const [error, setError]     = useState('');

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

  /* ── Determine my role ── */
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

  /* ── Initial load ── */
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('mega_drafts').select('*').eq('id', draftId).single();
      if (error || !data) { setError('Draft not found'); setLoading(false); return; }
      setDraft(data as DraftState);

      // Determine role
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id;
      const localDrafts = JSON.parse(localStorage.getItem('mega-draft-active') || '[]');
      const myEntry = localDrafts.find((d: any) => d.id === draftId);

      if (uid && data.p1_id === uid) setMyRole('p1');
      else if (uid && data.p2_id === uid) setMyRole('p2');
      else if (myEntry?.role === 'p1') setMyRole('p1');
      else if (myEntry?.role === 'p2') setMyRole('p2');
      else {
        // Fallback: guest identification by stored name
        const guestName = localStorage.getItem(`mega-guest-${draftId}`);
        if (guestName && data.p1_name === guestName) setMyRole('p1');
        else if (guestName && data.p2_name === guestName) setMyRole('p2');
        else setMyRole('p1'); // default
      }

      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  /* ── Realtime subscription ── */
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

  /* ── Pick a player ── */
  const pickPlayer = useCallback(async (player: Player) => {
    if (!draft || !myRole || picking) return;
    const currentPicker = getPickOwner(draft.current_pick);
    if (currentPicker !== myRole) return;

    // Find open slot for this position
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

      // Optimistic update
      setDraft(prev => prev ? { ...prev, picks: newPicks, current_pick: newPickNumber, status: newStatus } : prev);
    } catch (e: any) {
      setError('Pick failed — try again');
    } finally {
      setPicking(false);
    }
  }, [draft, myRole, picking, draftId, supabase]);

  /* ── Derived state ── */
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

// NEW: Default sort = Highest score first, then by position as tiebreaker
const visiblePool = useMemo(() => {
  let filtered = pool.filter(p => 
    posFilter === 'ALL' || p.pos === posFilter
  );

  // Sort by score descending (highest power score first)
  filtered.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;        // Primary: Score high → low
    if (a.pos !== b.pos) return a.pos.localeCompare(b.pos);   // Secondary: Position alphabetical
    return a.name.localeCompare(b.name);                      // Tertiary: Name alphabetical
  });

  return filtered;
}, [pool, posFilter]);

<div className="md-pool-sort-info" style={{ fontSize: '0.68rem', color: '#2a4060', marginTop: '4px' }}>
  Sorted by Power Score (highest first)
</div>

  const p1Score = lineupScore(p1Lineup);
  const p2Score = lineupScore(p2Lineup);
  const p1Wins  = isDone && p1Score > p2Score;
  const p2Wins  = isDone && p2Score > p1Score;
  const isTie   = isDone && p1Score === p2Score;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#050a18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#2a4060', fontFamily: 'Barlow Condensed', letterSpacing: '.2em' }}>LOADING DRAFT...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#050a18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ color: '#e04040', fontFamily: 'Barlow Condensed', fontSize: '1rem' }}>{error}</div>
      <Link href="/games/pack-empire/offense/mega-draft" style={{ color: '#9a28dcff', textDecoration: 'none', fontSize: '.85rem' }}>← Back to Lobby</Link>
    </div>
  );

  if (draft?.status === 'waiting') return (
    <div style={{ minHeight: '100vh', background: '#050a18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem' }}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div style={{ fontSize: '2.5rem' }}>⏳</div>
      <div style={{ fontFamily: 'Orbitron,sans-serif', fontWeight: 700, color: '#9a28dcff', letterSpacing: '.14em', fontSize: '1.1rem' }}>WAITING FOR OPPONENT</div>
      <div style={{ background: '#07101e', border: '1px solid #1a3050', borderRadius: 10, padding: '1rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '.52rem', letterSpacing: '.28em', color: '#2a4060', marginBottom: '.4rem', fontFamily: 'Barlow Condensed' }}>DRAFT ID</div>
        <div style={{ fontFamily: 'Orbitron,sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#9a28dcff', letterSpacing: '.16em' }}>{draftId.toUpperCase()}</div>
      </div>
      <div style={{ color: '#2a4060', fontSize: '.78rem', fontFamily: 'Barlow Condensed', letterSpacing: '.1em' }}>Share the Draft ID above with your opponent</div>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Nav */}
      <nav className="md-nav">
        <Link href="/games/pack-empire/offense/mega-draft" className="md-back">← Lobby</Link>
        <div className="md-nav-title"><span className="md-pip" />MEGA DRAFT</div>
        <div style={{ fontFamily: 'Barlow Condensed', fontSize: '.75rem', color: '#d4e8f8', letterSpacing: '.1em', justifySelf: 'end' }}>
          #{draftId.slice(-6).toUpperCase()}
        </div>
      </nav>

      {/* Winner banner */}
      {isDone && (
        <div className={`md-winner-banner${isTie ? ' tie' : ''}`}>
          {isTie ? (
            <span>🤝 TIE GAME — {p1Score.toLocaleString()} pts each</span>
          ) : (
            <span>
              🏆 {(myRole === 'p1' && p1Wins) || (myRole === 'p2' && p2Wins) ? 'YOU WIN!' : `${p1Wins ? draft?.p1_name : draft?.p2_name} WINS`}
              {' '}· {Math.abs(p1Score - p2Score).toLocaleString()} pts margin
            </span>
          )}
        </div>
      )}

      {/* Turn indicator */}
      {!isDone && (
        <div className={`md-turn-bar${isMyTurn ? ' my-turn' : ''}`}>
          {isMyTurn ? (
            <><span className="md-turn-dot" />YOUR PICK — Round {Math.floor(currentPick / 2) + 1}, Pick {currentPick + 1} of {TOTAL_PICKS}</>
          ) : (
            <>⏳ Waiting for {getPickOwner(currentPick) === 'p1' ? draft?.p1_name : draft?.p2_name} to pick...</>
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
              <span style={{ color: p1Wins ? '#ffd700' : '#3a6080' }}>{p1Score.toLocaleString()}</span>
              <span style={{ color: '#1a3050', fontSize: '.7rem' }}>VS</span>
              <span style={{ color: p2Wins ? '#ffd700' : '#3a6080' }}>{p2Score.toLocaleString()}</span>
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
              <div className="md-pool-title">
                AVAILABLE PLAYERS
                <span className="md-pool-count">{pool.length - pickedIds.size} remaining</span>
              </div>
              {/* Position filter */}
              <div className="md-pos-filters">
                {posFilters.map(f => (
                  <button key={f} onClick={() => setPosFilter(f)} className={`md-pos-filter${posFilter === f ? ' active' : ''}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {isMyTurn && (
              <div className="md-pick-prompt">
                🎯 Your pick — tap a player to draft them
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
            <div className="md-complete-title">DRAFT COMPLETE</div>
            <div className="md-complete-scores">
              <div className={`md-cs-side${p1Wins ? ' winner' : p2Wins ? ' loser' : ''}`}>
                <div className="md-cs-name">{draft?.p1_name}</div>
                <div className="md-cs-score" style={{ color: p1Wins ? '#ffd700' : '#3a6080' }}>{p1Score.toLocaleString()}</div>
                {p1Wins && <div className="md-cs-badge">🏆 WINNER</div>}
              </div>
              <div className="md-cs-vs">VS</div>
              <div className={`md-cs-side${p2Wins ? ' winner' : p1Wins ? ' loser' : ''}`}>
                <div className="md-cs-name">{draft?.p2_name}</div>
                <div className="md-cs-score" style={{ color: p2Wins ? '#ffd700' : '#3a6080' }}>{p2Score.toLocaleString()}</div>
                {p2Wins && <div className="md-cs-badge">🏆 WINNER</div>}
              </div>
            </div>
            <Link href="/games/pack-empire/offense/mega-draft" className="md-btn primary" style={{ display:'block', textAlign:'center', marginTop:'1.5rem', textDecoration:'none', padding:'13px', color:'#d4e8f8'}}>
              ← Back to Lobby
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

function Fallback() {
  return (
    <div style={{ minHeight: '100vh', background: '#050a18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#2a4060', fontFamily: 'Barlow Condensed', letterSpacing: '.2em' }}>LOADING...</div>
    </div>
  );
}

export default function MegaDraftRoomPage() {
  return <Suspense fallback={<Fallback />}><MegaDraftRoom /></Suspense>;
}

/* ══════════════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Barlow+Condensed:wght@400;500;600;700;800&family=Barlow:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

/* ── Nav ── */
.md-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:1.3rem 1.2rem;border-bottom:2px solid #0d1835;position:sticky;top:0;background:#050a18;z-index:30}
.md-back{color:#9a28dcff;text-decoration:none;font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:700;letter-spacing:.06em;transition:.15s}
.md-back:hover{color: #d4e8f8}
.md-nav-title{display:flex;align-items:center;gap:.6rem;font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.2rem;letter-spacing:.22em;color:#9a28dcff;justify-self:center;text-shadow:0 0 24px rgba(40,220,120,.5)}
.md-pip{width:9px;height:9px;border-radius:50%;background:#9a28dcff;box-shadow:0 0 12px #9a28dcff;animation:pip 2s ease-in-out infinite;flex-shrink:0}
@keyframes pip{0%,100%{box-shadow:0 0 12px #9a28dcff}50%{box-shadow:0 0 22px #9a28dcff,0 0 48px rgba(40,220,120,.8)}}

/* ── Turn bar ── */
.md-turn-bar{display:flex;align-items:center;justify-content:center;gap:.6rem;padding:.6rem 1.2rem;background:rgba(4,8,16,.9);border-bottom:1px solid #0d1835;font-family:'Barlow Condensed',sans-serif;font-size:.9rem;color:#d4e8f8;letter-spacing:.08em;position:sticky;top:72px;z-index:20}
.md-turn-bar.my-turn{background:rgba(0, 0, 0, 0.06);border-bottom-color:rgba(255, 255, 255, 0.2);color:#d4e8f8}
.md-turn-dot{width:7px;height:7px;border-radius:50%;background:#9a28dcff;animation:turn-pulse 1s ease-in-out infinite;flex-shrink:0}
@keyframes turn-pulse{0%,100%{opacity:.4;transform:scale(.7)}50%{opacity:1;transform:scale(1.3)}}

/* ── Winner banner ── */
.md-winner-banner{text-align:center;padding:.8rem 1rem;background:linear-gradient(135deg,rgba(255,215,0,.08),rgba(255,215,0,.03));border-bottom:2px solid rgba(255,215,0,.2);font-family:'Orbitron',sans-serif;font-weight:700;font-size:clamp(.85rem,2.5vw,1.1rem);letter-spacing:.1em;color:#ffd700;text-shadow:0 0 20px rgba(255,215,0,.5)}
.md-winner-banner.tie{background:rgba(66,192,248,.06);border-bottom-color:rgba(66,192,248,.2);color:#42c0f8;text-shadow:none}

/* ── Layout ── */
.md-layout{background:#050a18;min-height:calc(100vh - 90px);padding:0 0 3rem}

/* ── Lineups row ── */
.md-lineups-row{display:grid;grid-template-columns:1fr auto 1fr;gap:0;border-bottom:2px solid #0d1835;background:rgba(4,8,16,.6);max-width: 70%;margin: 0 auto}

/* ── Lineup column ── */
.md-lineup-col{padding:.6rem .5rem}
.md-lineup-col.current-drafter{background:rgba(154, 40, 220, 0.10);box-shadow: 0 0 0 3px rgba(154, 40, 220, 0.35)}
.md-lineup-col.current-drafter .md-lc-header {
  background: rgba(154, 40, 220, 0.15);
}
.md-lc-header{text-align:center;padding:.5rem .4rem .6rem;border-bottom:1px solid #0d1835;margin-bottom:.5rem;position:relative;min-height:88px;display: flex;flex-direction: column;justify-content: center;align-items: center}
.md-lc-name{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.88rem;letter-spacing:.08em;color:#d4e8f8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.md-lc-picking{margin-top:-10px;display:inline-block;font-size:.6rem;letter-spacing:.3em;background:rgba(142, 40, 220, 0.15);border:1px solid rgba(145, 40, 220, 0.3);color:#9a28dcff;border-radius:3px;padding:1px 6px;margin: 0;font-family:'Barlow Condensed',sans-serif;font-weight:700;top:8px}
.md-lc-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1rem;line-height:1.1}
.md-lc-progress{font-size:.52rem;color:#2a4060;letter-spacing:.1em;font-family:'Barlow Condensed',sans-serif}
.md-lc-slots{display:flex;flex-direction:column;gap:8px}

/* ── Lineup slot row ── */
.md-lc-slot{display:flex;align-items:center;gap:.35rem;padding:.25rem .35rem;border-radius:5px;border:1px solid transparent;background:rgba(4,8,16,.5);min-height:48px}
.md-lc-slot.filled{background:rgba(4,8,16,.8);border-color:var(--rc,transparent)}
.md-lc-slot.empty{border-color:#0a1428}
.md-lcs-pos{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.48rem;letter-spacing:.1em;color:#fff;background:#1a3050;padding:1px 3px;border-radius:2px;min-width:16px;text-align:center;flex-shrink:0}
.md-lcs-img{width:40px;height:40px;border-radius:3px;object-fit:cover;object-position:center top;flex-shrink:0}
.md-lcs-initial{width:20px;height:20px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-family:'Orbitron',sans-serif;font-weight:900;font-size:.7rem;flex-shrink:0}
.md-lcs-info{flex:1;min-width:0}
.md-lcs-name{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.md-lcs-score{font-family:'Orbitron',sans-serif;font-weight:700;font-size:.75rem;color:#d4e8f8}
.md-lcs-empty{font-size:.55rem;color:#1a3050;font-family:'Barlow Condensed',sans-serif;flex:1;text-align:center}

/* ── VS divider ── */
.md-vs-divider{display:flex;flex-direction:column;align-items:center;padding:.5rem .4rem;gap:.3rem;width:36px;flex-shrink:0}
.md-vsd-line{flex:1;width:1px;background:linear-gradient(to bottom,transparent,#1a3050,transparent)}
.md-vsd-icon{font-size:.9rem;opacity:.3}
.md-vsd-scores{display:flex;flex-direction:column;align-items:center;gap:.2rem;font-family:'Orbitron',sans-serif;font-weight:700;font-size:.6rem}

/* ── Pool section ── */
.md-pool-section{padding:.8rem .8rem 0;max-width: 95%;margin: 0 auto;}
.md-pool-header{display:flex;flex-direction:column;gap:.5rem;margin-bottom:.6rem}
.md-pool-title{font-family:'Orbitron',sans-serif;font-weight:700;font-size:.8rem;letter-spacing:.12em;color:#d4e8f8;display:flex;align-items:center;gap:.6rem}
.md-pool-count{font-size:.6rem;color:#2a4060;letter-spacing:.08em;font-family:'Barlow Condensed',sans-serif;font-weight:600}
.md-pos-filters{display:flex;gap:.35rem;flex-wrap:wrap}
.md-pos-filter{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.68rem;letter-spacing:.1em;padding:.3rem .6rem;border-radius:5px;cursor:pointer;transition:.15s;background:rgba(4,8,16,.7);border:1px solid #0d1835;color:#2a4060}
.md-pos-filter.active{background:rgba(40,220,120,.12);border-color:rgba(40,220,120,.35);color:#9a28dcff}
.md-pos-filter:hover:not(.active){border-color:#1a3050;color:#3a6080}
.md-pick-prompt{font-family:'Barlow Condensed',sans-serif;font-size:.78rem;color:#9a28dcff;letter-spacing:.08em;padding:.4rem .6rem;background:rgba(40,220,120,.06);border:1px solid rgba(40,220,120,.15);border-radius:6px;margin-bottom:.6rem}

/* ── Pool grid ── */
.md-pool-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:.5rem;padding-bottom:2rem}

/* ── Pool card ── */
.md-pool-card{border-radius:10px;border:1.5px solid transparent;background:rgba(4,8,16,.8);overflow:hidden;transition:all .2s;position:relative}
.md-pool-card.can-pick{border-color:var(--rc,#333);cursor:pointer;box-shadow:0 0 12px var(--rg,transparent)}
.md-pool-card.can-pick:hover{transform:translateY(-4px) scale(1.04);box-shadow:0 0 24px var(--rg,transparent)}
.md-pool-card.picked{opacity:.25;filter:grayscale(.8)}
.md-pool-card.pos-full{opacity:.45;filter:grayscale(.4)}
.md-pc-top{display:flex;justify-content:space-between;align-items:center;padding:.3rem .4rem;background:rgba(4,8,16,.95)}
.md-pc-pos{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.5rem;letter-spacing:.1em;color:#fff;padding:1px 4px;border-radius:2px}
.md-pc-rar{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.46rem;letter-spacing:.14em}
.md-pc-art{height:60px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.md-pc-img{position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);height:110%;width:auto;object-fit:contain;object-position:center bottom;z-index:2}
.md-pc-initial{font-family:'Orbitron',sans-serif;font-weight:900;font-size:2.4rem;line-height:1}
.md-pc-picked-overlay{position:absolute;inset:0;background:rgba(4,8,16,.85);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.55rem;letter-spacing:.16em;color:#2a4060;z-index:10}
.md-pc-body{padding:.3rem .4rem .4rem;background:rgba(4,8,16,.95)}
.md-pc-name{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.68rem;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.02em}
.md-pc-team{font-size:.48rem;color:#3a6080;letter-spacing:.04em;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.md-pc-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:.72rem;margin-top:.15rem}

/* ── Complete section ── */
.md-complete-section{max-width:500px;margin:2rem auto;padding:0 1rem}
.md-complete-title{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1rem;letter-spacing:.18em;color:#9a28dcff;text-align:center;margin-bottom:1.2rem}
.md-complete-scores{display:flex;align-items:center;gap:1rem;background:#07101e;border:2px solid #1a3050;border-radius:16px;padding:1.5rem}
.md-cs-side{flex:1;text-align:center;transition:opacity .4s}
.md-cs-side.loser{opacity:.5}
.md-cs-name{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.85rem;color:#3a6080;letter-spacing:.06em;margin-bottom:.3rem}
.md-cs-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1.8rem}
.md-cs-badge{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.6rem;letter-spacing:.18em;color:#050a18;background:#ffd700;border-radius:3px;padding:2px 8px;margin-top:.3rem;display:inline-block}
.md-cs-vs{font-family:'Orbitron',sans-serif;font-weight:700;font-size:.8rem;color:#1a3050;letter-spacing:.14em;flex-shrink:0}

/* ── Shared btn/input ── */
.md-btn{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.92rem;letter-spacing:.1em;border-radius:10px;cursor:pointer;transition:all .2s;border:none;padding:13px 22px;text-align:center}
.md-btn.primary{background:linear-gradient(135deg, #5d108aff,#9a28dcff);color:#050a18}
.md-btn.primary:hover{filter:brightness(1.1);transform:scale(1.02);color:#050a18}
.md-btn.primary:disabled{background:#0d1835;color:#2a4060;cursor:default;transform:none}
.md-btn.secondary{background:transparent;border:2px solid #1a3050;color:#3a6080}
.md-btn.secondary:hover{border-color:#9a28dcff;color:#9a28dcff}
.md-input{background:#040810;border:1px solid #1a3050;border-radius:8px;padding:10px 14px;color:#d4e8f8;font-family:'Barlow Condensed',sans-serif;font-size:.9rem;outline:none;transition:border-color .15s}
.md-input:focus{border-color:#9a28dcff}

/* ── Responsive ── */
@media(max-width:600px){
  .md-pool-grid{grid-template-columns:repeat(auto-fill,minmax(85px,1fr))}
  .md-pc-art{height:48px}
  .md-pc-score{font-size:.62rem}
  .md-lc-score{font-size:.82rem}
  .md-vs-divider{width:28px}
}
@media(max-width:420px){
  .md-pool-grid{grid-template-columns:repeat(3,1fr)}
  .md-lineups-row{font-size:.9em;max-width: 85%;margin: 0 auto}
}
`;