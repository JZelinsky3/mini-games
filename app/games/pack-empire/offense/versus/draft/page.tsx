'use client';
import { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ──────────────────────────────────────────────────────────── */
type Rarity = 'common' | 'rare' | 'dynasty' | 'transcendent' | 'immortal';
type Phase  = 'setup' | 'packing' | 'submitting' | 'submitted';
interface Player { id: string; name: string; pos: string; team: string; score: number; rarity: Rarity; accolades: string[]; }

/* ─── Rarity config ──────────────────────────────────────────────────── */
const RC: Record<Rarity, { label: string; color: string; glow: string; art: string; shimmer: string }> = {
  common:       { label: 'COMMON',       color: '#c87840', glow: 'rgba(200,120,60,.6)',   art: 'linear-gradient(150deg,#3d2210,#7a4820)', shimmer: '#a06030' },
  rare:         { label: 'RARE',         color: '#42c0f8', glow: 'rgba(66,192,248,.7)',   art: 'linear-gradient(150deg,#062840,#104870)', shimmer: '#2890d8' },
  dynasty:      { label: 'DYNASTY',      color: '#ffd700', glow: 'rgba(255,215,0,.8)',    art: 'linear-gradient(150deg,#3a2800,#806010)', shimmer: '#c8a020' },
  transcendent: { label: 'TRANSCENDENT', color: '#e040ff', glow: 'rgba(224,64,255,.85)',  art: 'linear-gradient(150deg,#280048,#6010b0)', shimmer: '#c020f0' },
  immortal:     { label: 'IMMORTAL',     color: '#28dc78', glow: 'rgba(40,220,120,.8)',   art: 'linear-gradient(150deg,#021a0a,#04401a)', shimmer: '#20a050' },
};

function parseCSVRow(row: string): string[] {
  const cols: string[] = []; let cur = ''; let inQ = false;
  for (const c of row) { if (c === '"') { inQ = !inQ; continue; } if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; } cur += c; }
  cols.push(cur.trim()); return cols;
}

/* ─── Player Pools ───────────────────────────────────────────────────── */
import { ALL_PLAYERS } from '@/lib/packs/current-offense-qb';
import { ALL_PLAYERS_V2 } from '@/lib/packs/current-offense-rb';
import { ALL_PLAYERS_V3 } from '@/lib/packs/current-offense-wr';
import { ALL_PLAYERS_V4 } from '@/lib/packs/current-offense-te';
import { ALL_PLAYERS_V5 } from '@/lib/packs/current-offense-ot';
import { ALL_PLAYERS_V6 } from '@/lib/packs/current-offense-iol';
import { ALL_PLAYERS_V7 } from '@/lib/packs/legend-offense';

const POOL: Record<string, Player[]> = (() => {
  const keys = ['QB', 'RB', 'WR', 'TE', 'OT', 'OG', 'C'] as const;
  return Object.fromEntries(keys.map(k => [k, [
    ...ALL_PLAYERS[k], ...ALL_PLAYERS_V2[k], ...ALL_PLAYERS_V3[k],
    ...ALL_PLAYERS_V4[k], ...ALL_PLAYERS_V5[k], ...ALL_PLAYERS_V6[k], ...ALL_PLAYERS_V7[k],
  ]]));
})() as Record<string, Player[]>;

const RARITY_MAP: Record<string, Rarity> = {
  epic: 'dynasty', legendary: 'transcendent',
  common: 'common', rare: 'rare', dynasty: 'dynasty', transcendent: 'transcendent', immortal: 'immortal',
};
Object.values(POOL).forEach(arr => arr.forEach(p => { p.rarity = RARITY_MAP[p.rarity] as Rarity ?? p.rarity; }));

/* ─── Slots ──────────────────────────────────────────────────────────── */
const SLOTS = [
  { key: 'QB',  label: 'Quarterback',  short: 'QB', pool: 'QB' },
  { key: 'RB',  label: 'Running Back', short: 'HB', pool: 'RB' },
  { key: 'WR1', label: 'Wide Receiver',short: 'WR', pool: 'WR' },
  { key: 'WR2', label: 'Wide Receiver',short: 'WR', pool: 'WR' },
  { key: 'WR3', label: 'Wide Receiver',short: 'WR', pool: 'WR' },
  { key: 'TE',  label: 'Tight End',    short: 'TE', pool: 'TE' },
  { key: 'LT',  label: 'Left Tackle',  short: 'LT', pool: 'OT' },
  { key: 'LG',  label: 'Left Guard',   short: 'LG', pool: 'OG' },
  { key: 'C',   label: 'Center',       short: 'C',  pool: 'C'  },
  { key: 'RG',  label: 'Right Guard',  short: 'RG', pool: 'OG' },
  { key: 'RT',  label: 'Right Tackle', short: 'RT', pool: 'OT' },
] as const;

const OL_ROW   = [6, 7, 8, 9, 10];
const WR_LEFT  = [2, 3];
const WR_RIGHT = [5, 4];
const QB_ROW   = [0, 1];

const PACK_IMG: Record<string, string> = {
  QB: '/pack-covers/tombrady.png',   RB: '/pack-covers/toddgurley.png',
  WR: '/pack-covers/julio.png',      TE: '/pack-covers/gronk.png',
  OT: '/pack-covers/trentwilliams.png', OG: '/pack-covers/zackmartin.png',
  C:  '/pack-covers/jasonkelce.png',
};

const POS_LABEL: Record<string, string> = {
  QB: 'QUARTERBACK', RB: 'RUNNING BACK', WR: 'WIDE RECEIVER',
  TE: 'TIGHT END', OT: 'O-LINEMAN', OG: 'O-LINEMAN', C: 'CENTER',
};

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

/* ─── Pack weights ───────────────────────────────────────────────────── */
const WEIGHTS = {
  normal:  { common: 45, rare: 27, dynasty: 17, transcendent: 10, immortal: 1 },
  captain: { common: 5,  rare: 22, dynasty: 41, transcendent: 27, immortal: 5 },
};

function weightedDraw(poolKey: string, count: number = 5, isCaptain: boolean = false, excl: string[] = []): Player[] {
  const avail = (POOL[poolKey] ?? []).filter(p => !excl.includes(p.id));
  if (avail.length === 0) return [];

  const baseWeights = isCaptain ? WEIGHTS.captain : WEIGHTS.normal;

  // Normal packs: one boosted slot with higher rare chance
  // Captain packs: one boosted slot with higher transcendent chance
  const boostedWeights = isCaptain
    ? { ...baseWeights, rare: 18, transcendent: 30, immortal: 2 }
    : { ...baseWeights, common: 40, rare: 38 };        // existing rare boost for normal

  const normalPool  = avail.map(p => ({ p, w: baseWeights[p.rarity] ?? 1 }));
  const boostedPool = avail.map(p => ({ p, w: boostedWeights[p.rarity] ?? 1 }));
  const boostedIndex = Math.floor(Math.random() * count);

  const used = new Set<string>();
  const result: Player[] = [];

  for (let i = 0; i < Math.min(count, avail.length); i++) {
    const currentPool = i === boostedIndex ? boostedPool : normalPool;
    const available = currentPool.filter(x => !used.has(x.p.id));
    if (available.length === 0) break;
    const totalWeight = available.reduce((sum, x) => sum + x.w, 0);
    let roll = Math.random() * totalWeight;
    for (const item of available) {
      roll -= item.w;
      if (roll <= 0) { result.push(item.p); used.add(item.p.id); break; }
    }
  }

  return result.sort(() => Math.random() - 0.5);
}

/* ══════════════════════════════════════════════════════════════════════
   RARITY EFFECTS
══════════════════════════════════════════════════════════════════════ */
function RarityEffects({ rarity, position = 'inner' }: { rarity: Rarity; position?: 'outer' | 'inner' }) {
  if (position === 'outer') {
    return (
      <>
        {rarity === 'rare' && (<div className="pe-ra-spin-wrap"><div className="pe-ra-spin-arc" /><div className="pe-ra-spin-inner" /></div>)}
        {rarity === 'dynasty' && (<div className="pe-ep-dual-wrap"><div className="pe-ep-dual-arc1" /><div className="pe-ep-dual-arc2" /><div className="pe-ep-dual-inner" /></div>)}
        {rarity === 'transcendent' && (<div className="pe-le-plasma-wrap"><div className="pe-le-plasma-arc1" /><div className="pe-le-plasma-arc2" /><div className="pe-le-plasma-inner" /></div>)}
        {rarity === 'immortal' && (
          <>
            <div className="pe-imm-glow-1" /><div className="pe-imm-glow-2" /><div className="pe-imm-glow-3" /><div className="pe-imm-glow-4" />
            <div className="pe-imm-corner-arcs">
              <svg viewBox="0 0 125 183" xmlns="http://www.w3.org/2000/svg" style={{ position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible' } as React.CSSProperties}>
                <path className="pe-imm-arc-glow a1" d="M -6,34 Q -6,-6 34,-6" /><path className="pe-imm-arc-line a1" d="M -6,34 Q -6,-6 34,-6" />
                <path className="pe-imm-arc-glow a2" d="M 91,-6 Q 131,-6 131,34" /><path className="pe-imm-arc-line a2" d="M 91,-6 Q 131,-6 131,34" />
                <path className="pe-imm-arc-glow a3" d="M 131,149 Q 131,189 91,189" /><path className="pe-imm-arc-line a3" d="M 131,149 Q 131,189 91,189" />
                <path className="pe-imm-arc-glow a4" d="M 34,189 Q -6,189 -6,149" /><path className="pe-imm-arc-line a4" d="M 34,189 Q -6,189 -6,149" />
              </svg>
            </div>
            <div className="pe-imm-plasma-wrap"><div className="pe-imm-plasma-arc1" /><div className="pe-imm-plasma-arc2" /><div className="pe-imm-plasma-arc3" /><div className="pe-imm-plasma-inner" /></div>
          </>
        )}
      </>
    );
  }
  return (
    <>
      {rarity === 'common' && (<><div className="pe-cm-scan" /><div className="pe-cm-corner tl" /><div className="pe-cm-corner tr" /><div className="pe-cm-corner bl" /><div className="pe-cm-corner br" /><div className="pe-cm-heat"><div className="pe-cm-heat-wave" /><div className="pe-cm-heat-wave" /><div className="pe-cm-heat-wave" /><div className="pe-cm-heat-wave" /></div><div className="pe-cm-geo"><div className="pe-cm-geo-line" /><div className="pe-cm-geo-line" /><div className="pe-cm-geo-line" /><div className="pe-cm-geo-line" /></div><div className="pe-cm-scratch-layer"><div className="pe-cm-scratch" /><div className="pe-cm-scratch" /><div className="pe-cm-scratch" /></div><div className="pe-cm-ember-layer"><div className="pe-cm-ember" /><div className="pe-cm-ember" /><div className="pe-cm-ember" /><div className="pe-cm-ember" /><div className="pe-cm-ember" /></div><div className="pe-cm-bottom-glow" /></>)}
      {rarity === 'rare' && (<><div className="pe-ra-depth-vig" /><div className="pe-ra-center-glow" /><div className="pe-ra-pulse-layer"><div className="pe-ra-pulse-ring" /><div className="pe-ra-pulse-ring" /><div className="pe-ra-pulse-ring" /></div><div className="pe-ra-crackle-layer"><div className="pe-ra-crackle"><svg width="100%" height="100%" viewBox="0 0 125 183"><polyline className="pe-ra-crackle-path" points="0,18 12,20 8,28 22,24 16,34" /><polyline className="pe-ra-crackle-path" points="113,88 121,84 117,94 125,90" /></svg></div><div className="pe-ra-crackle"><svg width="100%" height="100%" viewBox="0 0 125 183"><polyline className="pe-ra-crackle-path" points="0,62 12,58 8,68 20,64 14,76" /><polyline className="pe-ra-crackle-path" points="109,14 119,18 115,28 123,22" /></svg></div><div className="pe-ra-crackle"><svg width="100%" height="100%" viewBox="0 0 125 183"><polyline className="pe-ra-crackle-path" points="2,108 14,104 10,114 24,108" /><polyline className="pe-ra-crackle-path" points="105,50 115,46 111,58 121,52 117,64" /></svg></div></div></>)}
      {rarity === 'dynasty' && (<><div className="pe-ep-burst"><svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><g transform="translate(100,100)"><line x1="0" y1="-95" x2="0" y2="95" stroke="rgba(255,215,0,.35)" strokeWidth=".8" /><line x1="-95" y1="0" x2="95" y2="0" stroke="rgba(255,215,0,.35)" strokeWidth=".8" /><line x1="-67" y1="-67" x2="67" y2="67" stroke="rgba(255,215,0,.25)" strokeWidth=".8" /><line x1="67" y1="-67" x2="-67" y2="67" stroke="rgba(255,215,0,.25)" strokeWidth=".8" /></g></svg></div><div className="pe-ep-sparkle-layer"><div className="pe-ep-sparkle" /><div className="pe-ep-sparkle" /><div className="pe-ep-sparkle" /><div className="pe-ep-sparkle" /><div className="pe-ep-sparkle" /><div className="pe-ep-sparkle" /><div className="pe-ep-sparkle" /></div><div className="pe-ep-foil" /><div className="pe-ep-shine" /></>)}
      {rarity === 'transcendent' && (<><div className="pe-le-aurora"><div className="pe-le-aurora-band" /><div className="pe-le-aurora-band" /><div className="pe-le-aurora-band" /><div className="pe-le-aurora-band" /></div><div className="pe-le-orb-layer"><div className="pe-le-orb" /><div className="pe-le-orb" /><div className="pe-le-orb" /><div className="pe-le-orb" /><div className="pe-le-orb" /></div><div className="pe-le-holo" /><div className="pe-le-depth-rings"><div className="pe-le-depth-ring" /><div className="pe-le-depth-ring" /><div className="pe-le-depth-ring" /></div><div className="pe-le-bolt-layer"><svg className="pe-le-bolt b1" viewBox="0 0 125 183"><polyline className="pe-le-bolt-glow" points="8,2 20,28 10,27 26,58 14,56 32,98" /><polyline className="pe-le-bolt-mid" points="8,2 20,28 10,27 26,58 14,56 32,98" /><polyline className="pe-le-bolt-core" points="8,2 20,28 10,27 26,58 14,56 32,98" /><polyline className="pe-le-bolt-branch" points="26,58 40,68 34,82" /></svg><svg className="pe-le-bolt b2" viewBox="0 0 125 183"><polyline className="pe-le-bolt-glow" points="36,0 50,30 38,28 56,62 42,60 62,110" /><polyline className="pe-le-bolt-mid" points="36,0 50,30 38,28 56,62 42,60 62,110" /><polyline className="pe-le-bolt-core" points="36,0 50,30 38,28 56,62 42,60 62,110" /><polyline className="pe-le-bolt-branch" points="56,62 70,74 62,90" /></svg><svg className="pe-le-bolt b3" viewBox="0 0 125 183"><polyline className="pe-le-bolt-glow" points="62,0 76,28 63,26 84,60 68,58 92,108 74,106 88,150" /><polyline className="pe-le-bolt-mid" points="62,0 76,28 63,26 84,60 68,58 92,108 74,106 88,150" /><polyline className="pe-le-bolt-core" points="62,0 76,28 63,26 84,60 68,58 92,108 74,106 88,150" /><polyline className="pe-le-bolt-branch" points="84,60 100,74 90,90" /></svg><svg className="pe-le-bolt b4" viewBox="0 0 125 183"><polyline className="pe-le-bolt-glow" points="88,2 100,30 88,28 106,62 92,60 112,104" /><polyline className="pe-le-bolt-mid" points="88,2 100,30 88,28 106,62 92,60 112,104" /><polyline className="pe-le-bolt-core" points="88,2 100,30 88,28 106,62 92,60 112,104" /><polyline className="pe-le-bolt-branch" points="106,62 118,76 110,92" /></svg><svg className="pe-le-bolt b5" viewBox="0 0 125 183"><polyline className="pe-le-bolt-glow" points="116,10 108,36 118,34 104,68 116,66 96,118" /><polyline className="pe-le-bolt-mid" points="116,10 108,36 118,34 104,68 116,66 96,118" /><polyline className="pe-le-bolt-core" points="116,10 108,36 118,34 104,68 116,66 96,118" /></svg><svg className="pe-le-bolt b6" viewBox="0 0 125 183"><polyline className="pe-le-bolt-glow" points="22,15 10,44 22,42 6,78 20,76 2,130" /><polyline className="pe-le-bolt-mid" points="22,15 10,44 22,42 6,78 20,76 2,130" /><polyline className="pe-le-bolt-core" points="22,15 10,44 22,42 6,78 20,76 2,130" /></svg></div><div className="pe-le-tear-layer"><div className="pe-le-tear"><div className="pe-le-tear-inner" /></div><div className="pe-le-tear"><div className="pe-le-tear-inner" /></div><div className="pe-le-tear"><div className="pe-le-tear-inner" /></div></div><div className="pe-le-whiteout w1" /><div className="pe-le-whiteout w2" /><div className="pe-le-whiteout w3" /></>)}
      {rarity === 'immortal' && (<><div className="pe-imm-slab-layer"><div className="pe-imm-slab" /><div className="pe-imm-slab" /><div className="pe-imm-slab" /><div className="pe-imm-slab" /><div className="pe-imm-slab" /></div><div className="pe-imm-aurora"><div className="pe-imm-aurora-band" /><div className="pe-imm-aurora-band" /><div className="pe-imm-aurora-band" /><div className="pe-imm-aurora-band" /></div><div className="pe-imm-rings"><div className="pe-imm-ring" /><div className="pe-imm-ring" /><div className="pe-imm-ring" /></div><div className="pe-imm-orb-layer"><div className="pe-imm-orb" /><div className="pe-imm-orb" /><div className="pe-imm-orb" /><div className="pe-imm-orb" /><div className="pe-imm-orb" /><div className="pe-imm-orb" /></div><div className="pe-imm-holo" /><div className="pe-imm-foil" /><div className="pe-imm-shock"><div className="pe-imm-shock-ring" /><div className="pe-imm-shock-ring" /><div className="pe-imm-shock-ring" /><div className="pe-imm-shock-ring" /><div className="pe-imm-shock-core" /></div><div className="pe-imm-spark-layer"><div className="pe-imm-spark" /><div className="pe-imm-spark" /><div className="pe-imm-spark" /><div className="pe-imm-spark" /><div className="pe-imm-spark" /><div className="pe-imm-spark" /><div className="pe-imm-spark" /><div className="pe-imm-spark" /></div><div className="pe-imm-tear-layer"><div className="pe-imm-tear"><div className="pe-imm-tear-inner" /></div><div className="pe-imm-tear"><div className="pe-imm-tear-inner" /></div><div className="pe-imm-tear"><div className="pe-imm-tear-inner" /></div></div><div className="pe-imm-shine" /><div className="pe-imm-shock-flash" /><div className="pe-imm-inner-border" /></>)}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   VERSUS DRAFT COMPONENT
══════════════════════════════════════════════════════════════════════ */
function VersusDraft() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const challengeId  = searchParams.get('challenge');
  const supabase     = createClient();
  const [user, setUser] = useState<any>(null);

  const [phase, setPhase]         = useState<Phase>('setup');
  const [lineup, setLineup]       = useState<(Player | null)[]>(Array(11).fill(null));
  const [captainSi, setCaptainSi] = useState<number | null>(null);
  const [packSi, setPackSi]       = useState<number | null>(null);
  const [packCards, setPackCards] = useState<Player[]>([]);
  const [revealed, setRevealed]   = useState<boolean[]>([]);
  const [pickedId, setPickedId]   = useState<string | null>(null);
  const [immFlash, setImmFlash]   = useState(false);
  const [imageMap, setImageMap]   = useState<Record<string, string>>({});
  const [guestName, setGuestName] = useState('');
  const [needsIdentity, setNeedsIdentity] = useState(true);
  const [isHost, setIsHost]       = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);

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

  /* ── Determine host/opponent identity ── */
  useEffect(() => {
    if (!challengeId) return;
    async function checkIdentity() {
  const { data: { user } } = await supabase.auth.getUser();
  setUser(user);

  // Fetch challenge from Supabase — this is the source of truth
  const { data: challenge } = await supabase
    .from('versus_challenges')
    .select('*')
    .eq('id', challengeId)
    .single();

  // Host = the person whose user ID matches creator_id in Supabase
  // This works for signed-in users across any device
  const host = !!(user && challenge && challenge.creator_id === user.id);
  setIsHost(host);

  if (host) {
    setNeedsIdentity(false);
    return;
  }

  // Opponent flow
  if (user) {
    // Signed-in opponent — use their display name
    const name = user.user_metadata?.full_name || user.email || 'Opponent';
    setGuestName(name);
    localStorage.setItem(`versus-guest-${challengeId}`, name);

    // Save challenge to their lobby
    const existing = JSON.parse(localStorage.getItem('versus-active-challenges') || '[]');
    const alreadySaved = existing.some((c: any) => c.id === challengeId);
    if (!alreadySaved && challenge) {
      const entry = {
        id: challengeId,
        status: challenge.status,
        createdAt: new Date(challenge.created_at).getTime(),
        creatorId: challenge.creator_id,
        opponentName: challenge.opponent_name || 'Opponent',
        isOpponent: true,
      };
      localStorage.setItem('versus-active-challenges', JSON.stringify([entry, ...existing]));
    }

    setNeedsIdentity(false);
    return;
  }

  // Guest flow
  const savedGuest = localStorage.getItem(`versus-guest-${challengeId}`);
  if (savedGuest) {
    setGuestName(savedGuest);
    setNeedsIdentity(false);
  } else {
    setNeedsIdentity(true);
  }
}
    checkIdentity();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeId]);

  /* ── Load saved draft progress (once identity resolved) ── */
  useEffect(() => {
    if (!challengeId || needsIdentity) return;

    // If already submitted for this role, redirect to results
    const roleKey = isHost ? 'host' : 'opponent';
    const alreadyDone = localStorage.getItem(`versus-result-${challengeId}-${roleKey}`);
    if (alreadyDone) {
      router.replace(`/games/pack-empire/offense/versus/results?challenge=${challengeId}`);
      return;
    }

    try {
      const saved = localStorage.getItem(`versus-draft-progress-${challengeId}-${roleKey}`);
      if (!saved) return;
      const data = JSON.parse(saved);
      if (data.lineup && Array.isArray(data.lineup)) {
        setLineup(data.lineup.map((p: any) => p ? { ...p, rarity: RARITY_MAP[p.rarity] || p.rarity } : null));
      }
      if (data.captainSi != null) setCaptainSi(data.captainSi);
      if (data.phase) setPhase(data.phase);
    } catch { }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeId, needsIdentity, isHost]);

  /* ── Auto-save progress with role key ── */
  useEffect(() => {
    if (!challengeId || needsIdentity || phase === 'submitting') return;
    const hasProgress = lineup.some(Boolean) || captainSi !== null;
    if (!hasProgress) return;
    const roleKey = isHost ? 'host' : 'opponent';
    try {
      localStorage.setItem(`versus-draft-progress-${challengeId}-${roleKey}`, JSON.stringify({
        lineup, captainSi, phase, timestamp: Date.now(),
      }));
    } catch { }
  }, [challengeId, needsIdentity, isHost, lineup, captainSi, phase]);

  const totalScore  = lineup.reduce((s, p) => s + (p?.score ?? 0), 0);
  const filled      = lineup.filter(Boolean).length;
  const tier        = getTier(totalScore);
  const isBusy      = packCards.length > 0;
  const hiddenCount = revealed.filter(r => !r).length;
  const anyRevealed = revealed.some(Boolean);

  /* ── Submit: saves with role key, then redirects to results ── */
  const submitResult = useCallback(async (finalLineup: (Player | null)[]) => {
  if (!challengeId) return;
  const score = finalLineup.reduce((s, p) => s + (p?.score ?? 0), 0);
  const t = getTier(score);
  const roleKey = isHost ? 'host' : 'opponent';
  const playerName = isHost
    ? (user?.user_metadata?.full_name || user?.email || 'Host')
    : (guestName || 'Opponent');

  const resultData = {
    lineup: finalLineup,
    score,
    tier: t.label,
    icon: t.icon,
    completedAt: Date.now(),
    name: playerName,
  };

  try {
    // Write to Supabase — both players can now see each other's results
    if (isHost) {
      await supabase.from('versus_challenges').update({
        host_result: resultData,
        host_name: playerName,
        status: 'host_done',
      }).eq('id', challengeId);
    } else {
      await supabase.from('versus_challenges').update({
        opponent_result: resultData,
        opponent_name: playerName,
        status: 'opponent_done',
      }).eq('id', challengeId);
    }
  } catch (e) {
    console.error('Failed to save to Supabase', e);
  }

  // Also save locally as backup
  localStorage.setItem(`versus-result-${challengeId}-${roleKey}`, JSON.stringify(resultData));
  localStorage.removeItem(`versus-draft-progress-${challengeId}-${roleKey}`);

  setPhase('submitted' as any);
}, [challengeId, isHost, guestName, router, supabase, user]);

  const openPack = useCallback((si: number, isCaptain: boolean, curLineup: (Player | null)[]) => {
  const excl = curLineup.filter(Boolean).map(p => p!.id);
  const cards = weightedDraw(SLOTS[si].pool, 5, isCaptain, excl);
  setPackSi(si); setPackCards(cards);
  setRevealed(Array(cards.length).fill(false)); setPickedId(null);
  // Trigger immortal flash immediately if any card in the pack is immortal
  if (cards.some(c => c.rarity === 'immortal')) {
    setTimeout(() => { setImmFlash(true); setTimeout(() => setImmFlash(false), 2400); }, 300);
  }
  setTimeout(() => { cardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
}, []);

  const selectCaptain = useCallback((si: number) => {
    setCaptainSi(si); setPhase('packing');
  }, []);

  const clickSlot = useCallback((si: number) => {
    if (isBusy || pickedId !== null) return;
    openPack(si, si === captainSi, lineup);
  }, [isBusy, pickedId, captainSi, lineup, openPack]);

  const revealOne = useCallback((i: number) => {
  setRevealed(prev => { const n = [...prev]; n[i] = true; return n; });
  if (packCards[i]?.rarity === 'immortal')
    setTimeout(() => { setImmFlash(true); setTimeout(() => setImmFlash(false), 2400); }, 200);
}, [packCards]);

  const revealAll = useCallback(() => {
    packCards.forEach((_, i) => {
      if (!revealed[i]) setTimeout(() => {
        setRevealed(prev => { const n = [...prev]; n[i] = true; return n; });
      }, i * 130);
    });
  }, [packCards, revealed]);

  const handleCardClick = useCallback((i: number) => {
    if (pickedId) return;
    if (!revealed[i]) { revealOne(i); return; }
    const card = packCards[i];
    setPickedId(card.id);
    setTimeout(() => {
      setLineup(prev => {
        const n = [...prev];
        n[packSi!] = card;
        if (n.filter(Boolean).length === 11) {
          setPhase('submitting');
          submitResult(n);
        }
        return n;
      });
      setPackCards([]); setRevealed([]); setPickedId(null); setPackSi(null);
    }, 650);
  }, [pickedId, revealed, revealOne, packCards, packSi, submitResult]);

  /* ════════════════════════════════════════════════════════
     FORMATION SLOT
  ════════════════════════════════════════════════════════ */
  const FSlot = ({ si, isSetup = false }: { si: number; isSetup?: boolean }) => {
    const player    = lineup[si];
    const isAct     = packSi === si;
    const isCap     = captainSi === si;
    const canOpen   = !player && !isAct && !isBusy && phase === 'packing';
    const rc        = player ? RC[player.rarity] : null;
    const imgSrc    = player ? imageMap[player.name] : undefined;
    const packImg   = PACK_IMG[SLOTS[si].pool];
    const isHB      = si === 1;
    const clickable = isSetup || canOpen;

    return (
      <div className={`pe-slot-outer${isHB ? ' hb-back' : ''}`}>
        {player ? (
          <div className="pe-fsl has-p"
            style={{ '--rc': rc!.color, '--rg': rc!.glow, '--art': rc!.art } as React.CSSProperties}>
            <RarityEffects rarity={player.rarity} position="outer" />
            <div className="pe-filled-card">
              <div className="pe-fc-topbar" style={{ background: 'rgba(4,8,16,.95)' }}>
                <div className="pe-fc-pos-badge" style={{ background: rc!.color }}>{player.pos}</div>
                <div className="pe-fc-rar-badge" style={{ color: rc!.color }}>{rc!.label}</div>
              </div>
              <div className="pe-fc-art" style={{ background: rc!.art }}>
                <div className="pe-fc-field-lines" />
                <RarityEffects rarity={player.rarity} position="inner" />
                {imgSrc && (<img src={imgSrc} alt={player.name} className="pe-fc-img" onError={e => (e.currentTarget.style.display = 'none')} />)}
                <div className="pe-fc-initial">{player.name.charAt(0)}</div>
              </div>
              <div className="pe-fc-info">
                <div className="pe-fc-name" style={{ color: rc!.color }}>
                  {(() => {
                    const parts = player.name.trim().split(' ');
                    const suffixes = new Set(['jr.','jr','sr.','sr','ii','iii','iv','v','vi']);
                    const last = parts[parts.length - 1];
                    if (suffixes.has(last.toLowerCase()) && parts.length >= 3) return `${parts[parts.length - 2]} ${last}`;
                    return last;
                  })()}
                </div>
                <div className="pe-fc-score">{player.score.toLocaleString()}</div>
                <div className="pe-fc-team-tag">{player.team}</div>
              </div>
              {isCap && <div className="pe-fc-cap-badge">⚡ CAP</div>}
              <div className="pe-fc-shine" />
            </div>
          </div>
        ) : isAct ? (
          <div className="pe-fsl active">
            <div className="pe-fsl-locked">
              <div className="pe-fsl-pos-small">{SLOTS[si].short}</div>
              <div className="pe-fsl-opening">…</div>
            </div>
          </div>
        ) : (
          <div
            className={`pe-pack-wrap${isCap ? ' is-cap' : ''}${clickable ? ' clickable' : ''}`}
            onClick={() => isSetup ? selectCaptain(si) : canOpen ? clickSlot(si) : undefined}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
          >
            <img src={packImg} alt={SLOTS[si].short} className="pe-pack-img" />
            {isCap && <div className="pe-pack-cap-badge">⚡ CAPTAIN</div>}
          </div>
        )}
        <div className={`pe-slot-label${isCap && !player ? ' cap' : ''}`}>
          {isCap && !player ? '⚡ ' + SLOTS[si].short : SLOTS[si].short}
        </div>
      </div>
    );
  };

  const FormRow = ({ indices, isSetup = false }: { indices: number[]; isSetup?: boolean }) => (
    <div className="pe-form-row">{indices.map(si => <FSlot key={SLOTS[si].key} si={si} isSetup={isSetup} />)}</div>
  );

  const FieldLayout = ({ isSetup = false }: { isSetup?: boolean }) => (
    <div className="pe-field">
      <FormRow indices={OL_ROW} isSetup={isSetup} />
      <div className="pe-skill-spread">
        <div className="pe-skill-side">{WR_LEFT.map(si => <FSlot key={SLOTS[si].key} si={si} isSetup={isSetup} />)}</div>
        <div className="pe-skill-side">{WR_RIGHT.map(si => <FSlot key={SLOTS[si].key} si={si} isSetup={isSetup} />)}</div>
      </div>
      <FormRow indices={QB_ROW} isSetup={isSetup} />
    </div>
  );

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      {immFlash && (<div className="pe-imm-flash" aria-hidden="true"><div className="pe-imm-text">💎 IMMORTAL PULL!</div></div>)}

      <nav className="pe-nav">
        <div className="pe-nav-l"><Link href="/games/pack-empire/offense/versus" className="pe-back">← Versus Lobby</Link></div>
        <div className="pe-nav-c"><span className="pe-pip" />VERSUS DRAFT</div>
        <div className="pe-nav-r">
          {challengeId && (
            <span style={{ fontFamily:'Barlow Condensed,sans-serif', fontSize:'.75rem', color:'#d4e8f8', letterSpacing:'.1em' }}>
              #{challengeId.slice(-6).toUpperCase()}
            </span>
          )}
        </div>
      </nav>

      {(phase === 'packing') && (
        <div className="pe-strip">
          <div className="pe-sg"><div className="pe-sv" style={{ color: tier.color }}>{totalScore.toLocaleString()}</div><div className="pe-sl">ACCOLADES</div></div>
          <div className="pe-sdiv" />
          <div className="pe-sg"><div className="pe-sv">{filled}<span className="pe-sof">/11</span></div><div className="pe-sl">FILLED</div></div>
          <div className="pe-sdiv" />
          <div className="pe-sg"><div className="pe-stier" style={{ color: tier.color }}>{tier.icon} {tier.label}</div><div className="pe-sl">TIER</div></div>
          <div className="pe-sbar"><div className="pe-sfill" style={{ width: `${(filled / 11) * 100}%` }} /></div>
        </div>
      )}

      <div className="pe-root">

        {/* ════ IDENTITY GATE ════ */}
{needsIdentity && (
  <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 1.5rem', textAlign: 'center' }}>
    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚔️</div>
    <div style={{ fontFamily:'Orbitron,sans-serif', fontWeight:900, fontSize:'1.4rem', color:'#d4e8f8', marginBottom:'.5rem', letterSpacing:'.08em' }}>
      JOIN CHALLENGE
    </div>
    <p style={{ color:'#3a6080', marginBottom:'1.8rem', fontFamily:'Barlow,sans-serif', lineHeight:1.6 }}>
      Sign in to save this match to your history, or play as a guest.
    </p>

    {/* Sign in option */}
    <Link
      href={`/login?redirect=${encodeURIComponent(`/games/pack-empire/offense/versus/draft?challenge=${challengeId}`)}`}
      style={{
        display:'block', width:'100%', background:'linear-gradient(135deg,#a07020,#ffd700)',
        color:'#050a18', border:'none', borderRadius:'10px', padding:'14px',
        fontFamily:'Orbitron,sans-serif', fontWeight:700, fontSize:'.95rem',
        letterSpacing:'.14em', textDecoration:'none', marginBottom:'1rem',
      }}
    >
      SIGN IN TO PLAY
    </Link>

    {/* Divider */}
    <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' }}>
      <div style={{ flex:1, height:'1px', background:'#0d1835' }} />
      <span style={{ color:'#1a3050', fontSize:'.72rem', letterSpacing:'.16em', fontFamily:'Barlow Condensed,sans-serif' }}>OR</span>
      <div style={{ flex:1, height:'1px', background:'#0d1835' }} />
    </div>

    {/* Guest name input */}
    <input
      type="text"
      value={guestName}
      onChange={e => setGuestName(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter' && guestName.trim()) {
          localStorage.setItem(`versus-guest-${challengeId}`, guestName.trim());
          setNeedsIdentity(false);
        }
      }}
      placeholder="Enter a guest name..."
      maxLength={24}
      style={{
        width:'100%', padding:'14px 16px', fontSize:'1rem', borderRadius:'10px',
        border:'1px solid #1a3050', background:'#0a1428', color:'#fff', outline:'none',
        marginBottom:'.75rem', fontFamily:'Barlow Condensed,sans-serif', letterSpacing:'.06em',
      }}
    />
    <button
      disabled={!guestName.trim()}
      onClick={() => {
        localStorage.setItem(`versus-guest-${challengeId}`, guestName.trim());
        setNeedsIdentity(false);
      }}
      style={{
        width:'100%',
        background: guestName.trim() ? 'rgba(66,192,248,.15)' : '#0d1835',
        color: guestName.trim() ? '#42c0f8' : '#2a4060',
        border: `2px solid ${guestName.trim() ? '#42c0f8' : '#0d1835'}`,
        borderRadius:'10px', padding:'13px',
        fontFamily:'Orbitron,sans-serif', fontWeight:700, fontSize:'.88rem',
        letterSpacing:'.14em', cursor: guestName.trim() ? 'pointer' : 'default', transition:'.2s',
      }}
    >
      PLAY AS GUEST →
    </button>
  </div>
)}

        {/* ════ SETUP ════ */}
        {!needsIdentity && phase === 'setup' && (
          <div className="pe-setup">
            <div className="pe-setup-hero">
              <div className="pe-hero-sup">VERSUS CHALLENGE</div>
              <div className="pe-hero-title">PICK YOUR<br />CAPTAIN</div>
              <div className="pe-hero-sub">Tap a position to set your captain · then open packs to build your lineup</div>
            </div>
            <div className="pe-setup-inst">
              <span className="pe-inst-bolt">⚡</span>
              Tap any position to set it as your <strong>CAPTAIN</strong>
              <span className="pe-inst-note"> — captain packs have 5× immortal odds</span>
            </div>
            <div className="pe-setup-field"><FieldLayout isSetup /></div>
            {challengeId && (
              <div style={{ textAlign:'center', marginTop:'.8rem', fontSize:'.62rem', color:'#1a3050', letterSpacing:'.14em', fontFamily:'Barlow Condensed,sans-serif' }}>
                CHALLENGE · {challengeId.toUpperCase()} · DRAFTING AS {isHost ? 'HOST' : (guestName || 'OPPONENT').toUpperCase()}
              </div>
            )}
          </div>
        )}

        {/* ════ PACKING ════ */}
        {!needsIdentity && phase === 'packing' && (
          <div className="pe-packing">
            <div className="pe-formation-wrap">
              {captainSi !== null && !lineup[captainSi] && (
                <div className="pe-cap-banner">
                  <span className="pe-cap-bolt">⚡</span>
                  <span className="pe-cap-txt">{POS_LABEL[SLOTS[captainSi].pool]} is your CAPTAIN — 5% immortal odds when you open it</span>
                  <span className="pe-cap-bolt">⚡</span>
                </div>
              )}
              <FieldLayout />
            </div>

            {packCards.length > 0 && (
              <div className="pe-cards-area" ref={cardsRef}>
                <div className="pe-ca-header">
                  {packSi === captainSi && <div className="pe-cap-tag">⚡ CAPTAIN PACK — 5% IMMORTAL ODDS</div>}
                  <div className="pe-ca-pos">{packSi !== null ? SLOTS[packSi].label.toUpperCase() : ''}</div>
                  <div className="pe-ca-status">
                    {pickedId ? '✓ Player drafted!'
                      : anyRevealed ? `${revealed.filter(Boolean).length}/5 revealed · tap a card to PICK`
                        : 'Tap cards to reveal · or use REVEAL ALL'}
                  </div>
                </div>
                <div className="pe-cards-row">
                  {packCards.map((card, i) => {
                    const rc    = RC[card.rarity];
                    const isRev = revealed[i];
                    const isPick = pickedId === card.id;
                    const isRej  = !!pickedId && pickedId !== card.id;
                    const imgSrc = imageMap[card.name];
                    return (
                      <div key={card.id + i}
                        className={`pe-card${isRev ? ' rev' : ''}${isPick ? ' picked' : ''}${isRej ? ' rejected' : ''}${isRev && !pickedId ? ' selectable' : ''}`}
                        onClick={() => handleCardClick(i)}
                        style={{ '--rc': rc.color, '--rg': rc.glow, '--art': rc.art, '--sh': rc.shimmer } as React.CSSProperties}
                      >
                        <div className="pe-ci">
                          <RarityEffects rarity={card.rarity} position="outer" />
                          <div className="pe-card-back">
                            <div className="pe-back-grid" />
                            <div className="pe-back-icon">🏈</div>
                            <div className="pe-back-label">CLICK TO REVEAL</div>
                          </div>
                          <div className="pe-card-front">
                            <div className="pe-cf-topbar">
                              <div className="pe-cf-pos" style={{ background: rc.color }}>{card.pos}</div>
                              <div className={`pe-cf-rlab ${card.rarity}`}>{rc.label}</div>
                            </div>
                            <div className="pe-cf-art" style={{ background: rc.art }}>
                              <RarityEffects rarity={card.rarity} position="inner" />
                              {imgSrc && (<img src={imgSrc} alt={card.name} className="pe-cf-img" onError={e => (e.currentTarget.style.display = 'none')} />)}
                              <div className="pe-cf-initial">{card.name.charAt(0)}</div>
                            </div>
                            <div className="pe-cf-body">
                              <div className="pe-cf-name">{card.name}</div>
                              <div className="pe-cf-team">{card.team}</div>
                              <div className="pe-cf-line" style={{ background: rc.color }} />
                              <div className="pe-cf-score-row">
                                <div className="pe-cf-score" style={{ color: rc.color }}>{card.score.toLocaleString()}</div>
                                <div className="pe-cf-ovr">OVR</div>
                              </div>
                              {card.accolades.slice(0, 2).map((a, j) => <div key={j} className="pe-cf-acc">· {a}</div>)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {!pickedId && hiddenCount > 0 && (
                  <div className="pe-reveal-bar">
                    <button className="pe-reveal-btn" onClick={revealAll}>REVEAL ALL {hiddenCount} REMAINING</button>
                  </div>
                )}
              </div>
            )}

            {!isBusy && filled < 11 && (
              <div className="pe-empty-prompt">
                <div className="pe-ep-arrow">↑</div>
                <div className="pe-ep-text">Tap any pack above to draft your player</div>
                <div className="pe-ep-sub">{11 - filled} of 11 positions remaining</div>
              </div>
            )}
          </div>
        )}

        {/* ════ SUBMITTING ════ */}
{phase === 'submitting' && (
  <div style={{ textAlign:'center', padding:'4rem 1rem' }}>
    <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>⚡</div>
    <div style={{ fontFamily:'Orbitron,sans-serif', fontWeight:700, fontSize:'1.2rem', color:'#28dc78', letterSpacing:'.14em' }}>
      LOCKING IN YOUR DRAFT...
    </div>
  </div>
)}

{/* ════ SUBMITTED ════ */}
{/* ════ SUBMITTED ════ */}
{phase === 'submitted' && (
  <div className="pe-packing">
    <div className="pe-formation-wrap">
      <FieldLayout />
    </div>
    <div style={{ textAlign:'center', padding:'2rem 1.5rem', maxWidth:480, margin:'0 auto' }}>
    <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>✅</div>
    <div style={{ fontFamily:'Orbitron,sans-serif', fontWeight:900, fontSize:'1.3rem', color:'#28dc78', letterSpacing:'.1em', marginBottom:'.6rem' }}>
      DRAFT LOCKED IN
    </div>
    <p style={{ color:'#3a6080', fontFamily:'Barlow,sans-serif', lineHeight:1.7, marginBottom:'2rem', fontSize:'.95rem' }}>
      Your lineup has been submitted. Head to the results screen whenever you're ready — your opponent may still be drafting.
    </p>
    <button
      onClick={() => router.push(`/games/pack-empire/offense/versus/results?challenge=${challengeId}`)}
      style={{
        display:'block', width:'100%', background:'linear-gradient(135deg,#20a050,#28dc78)',
        color:'#050a18', border:'none', borderRadius:'10px', padding:'15px',
        fontFamily:'Orbitron,sans-serif', fontWeight:700, fontSize:'.95rem',
        letterSpacing:'.14em', cursor:'pointer', transition:'.2s', marginBottom:'.75rem',
      }}
    >
      VIEW RESULTS →
    </button>
    <Link
      href="/games/pack-empire/offense/versus"
      style={{
        display:'block', textAlign:'center', color:'#2a4060',
        fontFamily:'Barlow Condensed,sans-serif', fontSize:'.82rem',
        letterSpacing:'.1em', textDecoration:'none', transition:'.15s',
      }}
    >
      ← Back to Versus Lobby
    </Link>
    </div>
  </div>
)}

      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   STYLES — same as offense page (all rarity effects + layout)
══════════════════════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Barlow+Condensed:wght@400;500;600;700;800&family=Barlow:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Barlow Condensed',sans-serif}
.pe-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:1.3rem 1.2rem;
  border-bottom:2px solid #0d1835;position:sticky;top:0;background:#050a18;z-index:30}
.pe-nav-l{justify-self:start}
.pe-nav-l a.pe-back {
    font-size: 1rem;     /* ← This is what actually controls the size */
    font-weight: 700;
    color: #ffd700;
    text-decoration: none;}
.pe-nav-l a.pe-back:hover {
    color: #d4e8f8;}
.pe-nav-l{justify-self:start}
.pe-nav-c{display:flex;align-items:center;gap:.6rem;font-family:'Orbitron',sans-serif;font-weight:700;font-size:1rem;letter-spacing:.22em;color:#28dc78;justify-self:center;text-shadow:0 0 24px rgba(40,220,120,.5)}.pe-nav-r{justify-self:end}
.pe-pip{width:9px;height:9px;border-radius:50%;background:#28dc78;flex-shrink:0;box-shadow:0 0 12px #28dc78,0 0 28px rgba(40,220,120,.6);animation:pip-pulse 2s ease-in-out infinite}
@keyframes pip-pulse{0%,100%{box-shadow:0 0 12px #28dc78,0 0 28px rgba(40,220,120,.6)}50%{box-shadow:0 0 22px #28dc78,0 0 48px rgba(40,220,120,.8)}}
.pe-back{color:#2a4060;text-decoration:none;font-size:.85rem;transition:.15s}.pe-back:hover{color:#28dc78}
.pe-imm-flash{position:fixed;inset:0;z-index:250;pointer-events:none;background:radial-gradient(ellipse at center,rgba(40,220,120,.35),rgba(10,60,30,.2) 40%,transparent 70%);display:flex;align-items:center;justify-content:center;animation:imm-in 2.4s ease both}
@keyframes imm-in{0%{opacity:0}10%{opacity:1}80%{opacity:1}100%{opacity:0}}
.pe-imm-text{font-family:'Orbitron',sans-serif;font-weight:900;font-size:clamp(1.6rem,5vw,3rem);letter-spacing:.18em;color:#28dc78;text-shadow:0 0 40px #28dc78,0 0 80px rgba(40,220,120,.7);animation:imm-pop .55s cubic-bezier(.36,1.6,.64,1) both}
@keyframes imm-pop{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}
.pe-strip{background:rgba(5,10,24,.96);border-bottom:2px solid #0d1835;display:flex;align-items:center;padding:.5rem 1.2rem;position:sticky;top:50px;z-index:20;backdrop-filter:blur(8px);overflow:hidden}
.pe-sg{flex:1;text-align:center;padding:0 .4rem}.pe-sv{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.4rem;line-height:1;color:#d4e8f8;transition:color .4s}.pe-sof{font-size:.85rem;color:#2a4060}.pe-sl{font-size:.52rem;color:#2a4060;letter-spacing:.2em;text-transform:uppercase;margin-top:2px}.pe-stier{font-size:.9rem;font-weight:700;letter-spacing:.06em;transition:color .4s}.pe-sdiv{width:1px;height:38px;background:#0d1835;flex-shrink:0}.pe-sbar{position:absolute;bottom:0;left:0;right:0;height:3px;background:#0d1835}.pe-sfill{height:100%;background:linear-gradient(90deg,#20a050,#28dc78);transition:width .5s ease}
.pe-root{min-height:calc(100vh - 50px);background:#050a18;background-image:radial-gradient(ellipse at 50% -10%,rgba(40,220,120,.04),transparent 55%),repeating-linear-gradient(0deg,transparent,transparent 70px,rgba(255,255,255,.014) 70px,rgba(255,255,255,.014) 71px),repeating-linear-gradient(90deg,transparent,transparent 70px,rgba(255,255,255,.014) 70px,rgba(255,255,255,.014) 71px)}
.pe-setup{max-width:1200px;margin:0 auto;padding:1rem 1rem 3rem}.pe-setup-hero{text-align:center;margin-bottom:1rem;padding:1rem}.pe-hero-sup{font-size:.65rem;letter-spacing:.4em;color:#28dc78;margin-bottom:.2rem;opacity:.7}.pe-hero-title{font-family:'Orbitron',sans-serif;font-weight:900;font-size:clamp(1.8rem,5vw,3rem);line-height:.95;letter-spacing:.04em;background:linear-gradient(135deg,#20a050,#28dc78 40%,#60ffb0 70%,#28dc78);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:.5rem}.pe-hero-sub{font-size:.85rem;color:#3a6080;letter-spacing:.08em}
.pe-setup-inst{text-align:center;font-size:.9rem;color:#5a8ab0;margin-bottom:1rem;padding:.55rem .9rem;background:rgba(40,220,120,.04);border:1px solid rgba(40,220,120,.12);border-radius:8px;line-height:1.5}.pe-setup-inst strong{color:#28dc78}.pe-inst-bolt{color:#28dc78;margin-right:.3rem}.pe-inst-note{color:#2a4060;font-size:.8rem}
.pe-setup-field{background:rgba(8,14,30,.7);border:1px solid #0d1835;border-radius:16px;padding:1rem .8rem;margin-bottom:.8rem;overflow:hidden}
.pe-field{display:flex;flex-direction:column;align-items:center;gap:18px;width:fit-content;margin:0 auto}.pe-form-row{display:flex;gap:16px}.pe-skill-spread{display:flex;justify-content:space-between;align-items:flex-end;width:calc(100% + 380px);margin:0 -40px}.pe-skill-side{display:flex;gap:18px}
.pe-slot-outer{display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;background:transparent;border:none}.pe-slot-outer.hb-back{margin-top:16px;margin-left:8px}.pe-slot-label{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.62rem;letter-spacing:.12em;color:#3a6080;text-align:center;line-height:1}.pe-slot-label.cap{color:#c040ff;text-shadow:0 0 8px rgba(192,64,255,.7)}
.pe-pack-wrap{position:relative;display:flex;align-items:center;justify-content:center;cursor:default;width:125px;height:183px;flex-shrink:0}.pe-pack-img{width:100% !important;height:100% !important;object-fit:cover;display:block;background:transparent}.pe-pack-wrap.clickable{cursor:pointer;transition:transform .18s ease,filter .18s ease}.pe-pack-wrap.clickable:hover{transform:translateY(-6px) scale(1.07);filter:drop-shadow(0 0 10px rgba(40,220,120,.7))}.pe-pack-wrap.is-cap{animation:cap-drop-pulse 1.9s ease-in-out infinite}
@keyframes cap-drop-pulse{0%,100%{filter:drop-shadow(0 0 8px rgba(160,32,240,.9))}50%{filter:drop-shadow(0 0 18px rgba(224,64,255,1))}}
.pe-pack-cap-badge{position:absolute;top:-8px;left:0;right:0;text-align:center;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.7rem;letter-spacing:.18em;color:#ffd700;text-shadow:0 0 8px rgba(255,215,0,.95);z-index:2;pointer-events:none}
.pe-fsl{width:125px;height:183px;border-radius:11px;overflow:visible;background:transparent;border:none;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;transition:all .22s;cursor:default;flex-shrink:0}.pe-fsl.has-p{background:#040810;border:2px solid rgba(255,255,255,.18);box-shadow:0 0 16px var(--rg,transparent);overflow:hidden}.pe-fsl.active{background:rgba(40,220,120,.06);border:2px solid #28dc78;box-shadow:0 0 20px rgba(40,220,120,.4);animation:slot-p 1.4s ease-in-out infinite}
@keyframes slot-p{0%,100%{box-shadow:0 0 20px rgba(40,220,120,.4)}50%{box-shadow:0 0 38px rgba(40,220,120,.65)}}
.pe-fsl-locked{display:flex;flex-direction:column;align-items:center;gap:.3rem}.pe-fsl-pos-small{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.68rem;letter-spacing:.14em;color:#2a4060}.pe-fsl-opening{font-size:.65rem;color:#28dc78;animation:blink .9s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
.pe-filled-card{position:absolute;inset:0;display:flex;flex-direction:column;overflow:hidden;border-radius:9px}.pe-fc-topbar{height:25px;flex-shrink:0;width:100%;display:flex;align-items:center;justify-content:space-between;padding:.25rem .35rem;background:rgba(4,8,16,.95);border-bottom:1px solid rgba(255,255,255,.08)}.pe-fc-pos-badge{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.55rem;letter-spacing:.12em;color:#fff;padding:1px 5px;border-radius:3px}.pe-fc-rar-badge{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.50rem;letter-spacing:.18em;opacity:.9}.pe-fc-art{flex:1;position:relative;overflow:hidden;background:var(--art);display:flex;align-items:center;justify-content:center}.pe-fc-img{position:absolute;bottom:3px;left:50%;transform:translateX(-50%);height:105%;width:auto;object-fit:contain;object-position:center bottom;z-index:10}.pe-fc-initial{font-family:'Orbitron',sans-serif;font-weight:900;font-size:3.2rem;color:rgba(255,255,255,.12);position:absolute;bottom:-4px;right:-4px;z-index:1}.pe-fc-field-lines{position:absolute;inset:0;z-index:1;pointer-events:none;background-image:repeating-linear-gradient(0deg,transparent,transparent 16px,rgba(255,255,255,.1) 16px,rgba(255,255,255,.1) 17px),linear-gradient(180deg,rgba(0,0,0,.1),transparent 50%,rgba(0,0,0,.25));border-bottom:2px solid var(--rc,rgba(255,255,255,.4))}.pe-fc-info{flex-shrink:0;padding:.35rem .4rem .3rem;width:100%;background:linear-gradient(to bottom,rgba(4,8,16,.9),rgba(4,8,16,.98));border-top:2px solid var(--rc,rgba(255,255,255,.1))}.pe-fc-name{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.82rem;line-height:1;letter-spacing:.02em;color:var(--rc,#e0eef8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pe-fc-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1rem;line-height:1.1;color:#d4e8f8;margin-top:2px}.pe-fc-team-tag{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:.48rem;letter-spacing:.1em;margin-top:2px;color:#3a6080;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pe-fc-cap-badge{position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.58rem;letter-spacing:.14em;color:#ffd700;background:rgba(5,10,24,.9);border:1px solid rgba(255,215,0,.5);border-radius:4px;padding:1px 7px;white-space:nowrap;z-index:10;text-shadow:0 0 8px rgba(255,215,0,.8);pointer-events:none}.pe-fc-shine{position:absolute;inset:0;pointer-events:none;z-index:4;background:linear-gradient(135deg,transparent 45%,rgba(255,255,255,.06) 50%,transparent 55%)}
.pe-packing{max-width:1200px;margin:0 auto;padding:.8rem 1rem 3rem}.pe-formation-wrap{background:rgba(8,14,30,.7);border:1px solid #0d1835;border-radius:14px;padding:.8rem .6rem;margin-bottom:.8rem;overflow:hidden}.pe-cap-banner{display:flex;align-items:center;justify-content:center;gap:.6rem;font-size:.78rem;color:#5a8ab0;letter-spacing:.06em;margin-bottom:.8rem;padding:.45rem .8rem;background:rgba(192,64,255,.07);border:1px solid rgba(192,64,255,.2);border-radius:6px}.pe-cap-bolt{color:#e040ff;font-size:.9rem}.pe-cap-txt{font-family:'Barlow Condensed',sans-serif;font-weight:600}
.pe-cards-area{background:rgba(6,10,22,.9);border:1px solid #0d1835;border-radius:14px;padding:1rem}.pe-ca-header{text-align:center;margin-bottom:.9rem}.pe-cap-tag{display:inline-block;font-size:.6rem;letter-spacing:.2em;font-weight:800;color:#e040ff;background:rgba(224,64,255,.1);border:1px solid rgba(224,64,255,.35);border-radius:3px;padding:3px 10px;margin-bottom:.4rem;box-shadow:0 0 12px rgba(224,64,255,.3);animation:cap-tag-glow 2s ease-in-out infinite}
@keyframes cap-tag-glow{0%,100%{box-shadow:0 0 12px rgba(224,64,255,.3)}50%{box-shadow:0 0 24px rgba(224,64,255,.6)}}
.pe-ca-pos{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.2rem;letter-spacing:.08em;color:#d4e8f8;margin-bottom:.2rem}.pe-ca-status{font-size:.8rem;color:#3a6080;letter-spacing:.06em}.pe-cards-row{display:flex;gap:.55rem;justify-content:center;flex-wrap:wrap;padding:.3rem 0}
.pe-card{width:136px;flex-shrink:0;perspective:1000px;position:relative;cursor:pointer;transition:transform .2s ease,opacity .3s;z-index:1}.pe-card:hover{z-index:10}.pe-card.rev.selectable:hover{transform:translateY(-14px) scale(1.07)}.pe-card.rev.selectable:hover .pe-card-front{box-shadow:0 0 40px var(--rg),0 16px 36px rgba(0,0,0,.7);border-color:var(--rc)}.pe-card.picked{transform:scale(1.08) translateY(-14px);z-index:20}.pe-card.rejected{opacity:.22;transform:scale(.9);filter:grayscale(.6)}.pe-ci{position:relative;width:100%;height:208px;transform-style:preserve-3d;transition:transform .7s cubic-bezier(.4,0,.2,1);overflow:visible}.pe-card.rev .pe-ci{transform:rotateY(180deg)}
.pe-card-back,.pe-card-front{position:absolute;inset:0;border-radius:11px;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden}
.pe-card-back{background:linear-gradient(155deg,#080e24,#0c1840);border:2px solid #1a3060;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4rem;-webkit-backface-visibility:hidden;backface-visibility:hidden;transform:translateZ(0)}
.pe-back-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);background-size:14px 14px}.pe-back-icon{font-size:2.2rem;opacity:.18;position:relative;z-index:1}.pe-back-label{font-size:.58rem;letter-spacing:.2em;color:#1a3060;font-family:'Barlow Condensed',sans-serif;position:relative;z-index:1}
.pe-card-front{background:linear-gradient(170deg,#080e24,#0b1438);border:2px solid var(--sh,#333);transform:rotateY(180deg) translateZ(0);box-shadow:0 0 18px var(--rg,transparent),inset 0 1px 0 rgba(255,255,255,.06);position:relative;-webkit-backface-visibility:hidden;backface-visibility:hidden}
.pe-cf-topbar{display:flex;align-items:center;justify-content:space-between;padding:.35rem .5rem .15rem}.pe-cf-pos{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.62rem;letter-spacing:.12em;color:#fff;padding:2px 5px;border-radius:3px}.pe-cf-rlab{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.52rem;letter-spacing:.18em;color:var(--rc);opacity:.9}.pe-cf-rlab.transcendent{background:linear-gradient(90deg,#d060f0,#ff90ff,#d060f0);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:holo-shift 2s linear infinite}.pe-cf-rlab.immortal{background:linear-gradient(90deg,#20c060,#80ffb8,#20c060);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:holo-shift 1.6s linear infinite}
@keyframes holo-shift{from{background-position:0%}to{background-position:200%}}
.pe-cf-art{height:90px;position:relative;overflow:hidden;background:var(--art);display:flex;align-items:center;justify-content:center}.pe-cf-img{position:absolute;bottom:-10px;left:50%;transform:translateX(-50%);height:118%;width:auto;object-fit:contain;object-position:center bottom;z-index:10}.pe-cf-initial{font-family:'Orbitron',sans-serif;font-weight:900;font-size:4rem;color:rgba(255,255,255,.1);line-height:1;position:absolute;bottom:-8px;right:-6px;z-index:1}.pe-cf-body{padding:.35rem .5rem .4rem}.pe-cf-name{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.88rem;color:#e0eef8;letter-spacing:.02em;line-height:1.15;margin-bottom:1px}.pe-cf-team{font-size:.5rem;color:#3a6080;letter-spacing:.04em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pe-cf-line{height:1.5px;margin:.3rem 0 .25rem;opacity:.4;border-radius:1px}.pe-cf-score-row{display:flex;align-items:baseline;gap:.3rem;margin-bottom:.25rem}.pe-cf-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1.4rem;line-height:1}.pe-cf-ovr{font-size:.45rem;color:#2a4060;letter-spacing:.18em}.pe-cf-acc{font-size:.45rem;color:#3a6080;line-height:1.5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pe-reveal-bar{text-align:center;margin-top:.9rem}.pe-reveal-btn{background:linear-gradient(135deg,#0d1835,#142040);border:2px solid #28dc78;border-radius:8px;color:#28dc78;font-family:'Orbitron',sans-serif;font-weight:700;font-size:.82rem;letter-spacing:.16em;padding:.6rem 2rem;cursor:pointer;transition:all .22s}.pe-reveal-btn:hover{background:rgba(40,220,120,.08);box-shadow:0 0 24px rgba(40,220,120,.3);transform:scale(1.03)}
.pe-empty-prompt{text-align:center;padding:1.2rem 1rem;margin-top:.4rem}.pe-ep-arrow{font-size:1.8rem;color:#1a3050;animation:bob 2s ease-in-out infinite;display:block;margin-bottom:.3rem}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
.pe-ep-text{font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:700;letter-spacing:.12em;color:#3a6080;margin-bottom:.25rem}.pe-ep-sub{font-size:.75rem;color:#1a3050;letter-spacing:.08em}
@keyframes border-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes orb-float{0%,100%{transform:translateY(0) scale(1);opacity:.55}33%{transform:translateY(-12px) scale(1.2);opacity:1}66%{transform:translateY(-5px) scale(.9);opacity:.65}}@keyframes sp-anim{0%{transform:scale(0) rotate(0deg);opacity:0}20%{transform:scale(1) rotate(45deg);opacity:1}70%{transform:scale(.8) rotate(180deg);opacity:.8}100%{transform:scale(0) rotate(360deg);opacity:0}}@keyframes aurora-wave{0%{transform:translateX(-6%) skewX(-1deg);opacity:.6}100%{transform:translateX(6%) skewX(1deg);opacity:1}}@keyframes tear-glitch{0%,82%,100%{opacity:0;transform:translateX(0)}83%,86%{opacity:1;transform:translateX(-8px)}84%,87%{opacity:.5;transform:translateX(5px)}85%{opacity:1;transform:translateX(-3px)}88%{opacity:0}}@keyframes holo-sweep{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}@keyframes glow-breathe{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}@keyframes foil-scroll{0%{top:-50%}100%{top:120%}}@keyframes coin-flip{0%,38%{transform:translateX(0)}39%,100%{transform:translateX(420px)}}@keyframes pulse-expand{0%{width:14px;height:14px;opacity:.9;box-shadow:0 0 8px rgba(66,192,248,.6)}100%{width:140px;height:140px;opacity:0}}@keyframes ring-expand{0%{width:10px;height:10px;opacity:.75}100%{width:220px;height:220px;opacity:0}}@keyframes shock-expand{0%{width:8px;height:8px;opacity:1;border-width:4px}25%{opacity:.9;border-width:2.5px}100%{width:280px;height:280px;opacity:0;border-width:.5px}}@keyframes core-pulse{0%{transform:scale(0);opacity:0}7%{transform:scale(3.5);opacity:1}28%{transform:scale(1.4);opacity:.35}100%{transform:scale(1);opacity:0}}@keyframes shock-flash{0%,5%,20%,100%{background:rgba(0,0,0,0)}7%{background:rgba(80,255,160,.5)}10%{background:rgba(40,220,120,.1)}15%{background:rgba(0,0,0,0)}}@keyframes slab-pulse{0%{opacity:.07;transform:rotate(18deg) scaleY(.96)}100%{opacity:.52;transform:rotate(18deg) scaleY(1.02)}}@keyframes corner-arc-fade{0%,55%,100%{opacity:0}65%{opacity:1}85%{opacity:.9}95%{opacity:0}}@keyframes heat-drift{0%{transform:translateY(0) scaleX(1);opacity:0}15%{opacity:1}100%{transform:translateY(-65px) scaleX(.5);opacity:0}}@keyframes geo-shimmer{0%{opacity:.1}100%{opacity:.55}}@keyframes scratch-flick{0%,100%{opacity:.15}45%,55%{opacity:.7}}@keyframes ember-rise{0%{transform:translateY(0) scale(1);opacity:0}12%{opacity:.8}100%{transform:translateY(-90px) translateX(6px) scale(0);opacity:0}}@keyframes scan-line{0%{top:-2px;opacity:0}8%{opacity:1}92%{opacity:.6}100%{top:100%;opacity:0}}@keyframes crackle-flash{0%,84%,93%,100%{opacity:0}85%,92%{opacity:1}88%{opacity:.3}}@keyframes center-glow{0%,100%{opacity:.6}50%{opacity:1}}@keyframes bolt-flash{0%,43%,50%,100%{opacity:0}44%,48%{opacity:1}46%{opacity:.25}}@keyframes whiteout-leg{0%,42%,52%,100%{background:rgba(255,255,255,0)}44%{background:rgba(255,200,255,.65)}47%{background:rgba(255,220,255,.12)}50%{background:rgba(255,255,255,.04)}}@keyframes inner-border-pulse{0%,100%{box-shadow:inset 0 0 18px rgba(40,220,120,.16),inset 0 0 44px rgba(40,220,120,.05)}50%{box-shadow:inset 0 0 30px rgba(80,255,160,.35),inset 0 0 65px rgba(40,220,120,.12)}}
.pe-cm-corner{position:absolute;z-index:5;width:10px;height:10px;pointer-events:none}.pe-cm-corner::before,.pe-cm-corner::after{content:'';position:absolute;background:#c87840;opacity:.5}.pe-cm-corner::before{width:100%;height:1.5px;top:0;left:0}.pe-cm-corner::after{width:1.5px;height:100%;top:0;left:0}.pe-cm-corner.tl{top:-1px;left:-1px}.pe-cm-corner.tr{top:-1px;right:-1px;transform:scaleX(-1)}.pe-cm-corner.bl{bottom:-1px;left:-1px;transform:scaleY(-1)}.pe-cm-corner.br{bottom:-1px;right:-1px;transform:scale(-1)}.pe-cm-scan{position:absolute;left:-2px;right:-2px;height:2px;z-index:6;background:linear-gradient(90deg,transparent,rgba(210,130,70,.8),transparent);animation:scan-line 3.8s ease-in-out infinite;pointer-events:none}.pe-cm-heat{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden;opacity:.4}.pe-cm-heat-wave{position:absolute;left:-10%;width:120%;height:1px;background:linear-gradient(90deg,transparent,rgba(210,120,50,.7),transparent);animation:heat-drift linear infinite}.pe-cm-heat-wave:nth-child(1){animation-duration:3.2s;bottom:22%}.pe-cm-heat-wave:nth-child(2){animation-duration:2.9s;animation-delay:.9s;bottom:46%}.pe-cm-heat-wave:nth-child(3){animation-duration:3.7s;animation-delay:1.7s;bottom:68%}.pe-cm-heat-wave:nth-child(4){animation-duration:3.1s;animation-delay:2.5s;bottom:82%}.pe-cm-geo{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}.pe-cm-geo-line{position:absolute;width:1px;background:linear-gradient(to bottom,transparent,rgba(200,120,60,.5),transparent);animation:geo-shimmer ease-in-out infinite alternate}.pe-cm-geo-line:nth-child(1){height:65%;top:8%;left:18%;transform:rotate(22deg);animation-duration:3.0s}.pe-cm-geo-line:nth-child(2){height:72%;top:4%;left:40%;transform:rotate(22deg);animation-duration:3.8s;animation-delay:.7s}.pe-cm-geo-line:nth-child(3){height:60%;top:12%;left:62%;transform:rotate(22deg);animation-duration:3.3s;animation-delay:1.4s}.pe-cm-geo-line:nth-child(4){height:68%;top:6%;left:80%;transform:rotate(22deg);animation-duration:4.0s;animation-delay:.3s}.pe-cm-scratch-layer{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}.pe-cm-scratch{position:absolute;background:rgba(255,200,140,.22);animation:scratch-flick ease-in-out infinite}.pe-cm-scratch:nth-child(1){width:28%;height:1px;top:30%;left:12%;transform:rotate(-8deg);animation-duration:5s}.pe-cm-scratch:nth-child(2){width:18%;height:1px;top:57%;left:52%;transform:rotate(4deg);animation-duration:6s;animation-delay:1.2s}.pe-cm-scratch:nth-child(3){width:22%;height:1px;top:74%;left:22%;transform:rotate(-3deg);animation-duration:4.5s;animation-delay:2.5s}.pe-cm-ember-layer{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}.pe-cm-ember{position:absolute;bottom:-4px;border-radius:50%;background:radial-gradient(circle,#ffb060,#d06020 50%,transparent);animation:ember-rise linear infinite;opacity:0}.pe-cm-ember:nth-child(1){width:3px;height:3px;left:12%;animation-duration:2.9s}.pe-cm-ember:nth-child(2){width:2px;height:2px;left:35%;animation-duration:2.3s;animation-delay:.6s}.pe-cm-ember:nth-child(3){width:4px;height:4px;left:60%;animation-duration:3.2s;animation-delay:.3s}.pe-cm-ember:nth-child(4){width:2px;height:2px;left:78%;animation-duration:2.6s;animation-delay:1.1s}.pe-cm-ember:nth-child(5){width:3px;height:3px;left:24%;animation-duration:3.0s;animation-delay:1.7s}.pe-cm-bottom-glow{position:absolute;bottom:0;left:0;right:0;height:24px;z-index:2;pointer-events:none;background:linear-gradient(to top,rgba(180,70,10,.3),transparent)}
.pe-ra-spin-wrap{position:absolute;inset:-3px;border-radius:13px;overflow:hidden;z-index:0;pointer-events:none}.pe-ra-spin-arc{position:absolute;inset:0;background:conic-gradient(from 0deg,transparent 55%,rgba(66,192,248,.9) 73%,rgba(160,230,255,1) 80%,rgba(66,192,248,.9) 87%,transparent 100%);animation:border-spin 2.8s linear infinite}.pe-ra-spin-inner{position:absolute;inset:2px;border-radius:11px;background:#062840}.pe-ra-pulse-layer{position:absolute;inset:0;z-index:3;pointer-events:none;display:flex;align-items:center;justify-content:center}.pe-ra-pulse-ring{position:absolute;border-radius:50%;border:1.5px solid rgba(66,192,248,.7);animation:pulse-expand ease-out infinite;opacity:0}.pe-ra-pulse-ring:nth-child(1){animation-duration:2.6s}.pe-ra-pulse-ring:nth-child(2){animation-duration:2.6s;animation-delay:.87s}.pe-ra-pulse-ring:nth-child(3){animation-duration:2.6s;animation-delay:1.74s}.pe-ra-depth-vig{position:absolute;inset:0;z-index:2;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,transparent 28%,rgba(2,15,35,.7) 100%)}.pe-ra-center-glow{position:absolute;inset:0;z-index:2;pointer-events:none;background:radial-gradient(ellipse at 50% 40%,rgba(66,192,248,.16),transparent 65%);animation:center-glow 3s ease-in-out infinite}.pe-ra-crackle-layer{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden}.pe-ra-crackle{position:absolute;top:0;left:0;width:100%;height:100%;animation:crackle-flash ease-in-out infinite;opacity:0}.pe-ra-crackle:nth-child(1){animation-duration:4.2s;animation-delay:.5s}.pe-ra-crackle:nth-child(2){animation-duration:5.1s;animation-delay:2.1s}.pe-ra-crackle:nth-child(3){animation-duration:3.9s;animation-delay:3.4s}.pe-ra-crackle-path{fill:none;stroke:#42c0f8;stroke-width:1.1;stroke-linecap:round;filter:drop-shadow(0 0 3px #42c0f8)}
.pe-ep-dual-wrap{position:absolute;inset:-3px;border-radius:13px;overflow:hidden;z-index:0;pointer-events:none}.pe-ep-dual-arc1{position:absolute;inset:0;background:conic-gradient(from 0deg,transparent 60%,rgba(255,215,0,.9) 76%,rgba(255,245,120,1) 82%,rgba(255,215,0,.9) 88%,transparent 100%);animation:border-spin 3.5s linear infinite}.pe-ep-dual-arc2{position:absolute;inset:0;background:conic-gradient(from 180deg,transparent 65%,rgba(255,180,0,.55) 80%,rgba(255,220,0,.75) 86%,transparent 100%);animation:border-spin 5s linear infinite reverse}.pe-ep-dual-inner{position:absolute;inset:2px;border-radius:11px;background:#3a2800}.pe-ep-burst{position:absolute;inset:0;z-index:2;pointer-events:none;display:flex;align-items:center;justify-content:center}.pe-ep-burst svg{position:absolute;width:190%;height:190%;top:-45%;left:-45%;animation:border-spin 10s linear infinite;opacity:.2}.pe-ep-sparkle-layer{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}.pe-ep-sparkle{position:absolute;background:#ffd700;clip-path:polygon(50% 0%,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0% 50%,38% 38%);animation:sp-anim linear infinite;opacity:0}.pe-ep-sparkle:nth-child(1){width:6px;height:6px;left:8%;top:18%;animation-duration:2.2s}.pe-ep-sparkle:nth-child(2){width:5px;height:5px;left:80%;top:12%;animation-duration:1.8s;animation-delay:.7s}.pe-ep-sparkle:nth-child(3){width:4px;height:4px;left:44%;top:52%;animation-duration:2.6s;animation-delay:.3s}.pe-ep-sparkle:nth-child(4){width:7px;height:7px;left:68%;top:66%;animation-duration:2.0s;animation-delay:1.2s}.pe-ep-sparkle:nth-child(5){width:5px;height:5px;left:18%;top:74%;animation-duration:1.9s;animation-delay:.5s}.pe-ep-sparkle:nth-child(6){width:4px;height:4px;left:90%;top:46%;animation-duration:2.4s;animation-delay:1.5s}.pe-ep-sparkle:nth-child(7){width:6px;height:6px;left:32%;top:30%;animation-duration:2.1s;animation-delay:.9s}.pe-ep-foil{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden;border-radius:9px}.pe-ep-foil::before{content:'';position:absolute;top:-50%;left:0;right:0;height:50%;background:linear-gradient(180deg,transparent,rgba(255,240,100,.12),rgba(255,215,0,.06),transparent);animation:foil-scroll 4.5s ease-in-out infinite}.pe-ep-foil::after{content:'';position:absolute;top:-100%;left:0;right:0;height:30%;background:linear-gradient(180deg,transparent,rgba(255,255,180,.08),transparent);animation:foil-scroll 4.5s ease-in-out infinite;animation-delay:1.8s}.pe-ep-shine{position:absolute;inset:0;z-index:5;pointer-events:none;border-radius:9px;overflow:hidden}.pe-ep-shine::after{content:'';position:absolute;top:-100%;left:-60%;width:40%;height:300%;background:linear-gradient(105deg,transparent 30%,rgba(255,245,120,.42) 50%,transparent 70%);animation:coin-flip 3.5s ease-in-out infinite}
.pe-le-plasma-wrap{position:absolute;inset:-4px;border-radius:14px;overflow:hidden;z-index:0;pointer-events:none}.pe-le-plasma-arc1{position:absolute;inset:0;background:conic-gradient(from 0deg,transparent 40%,rgba(192,32,240,.7) 57%,rgba(255,80,255,1) 64%,rgba(224,64,255,.9) 71%,transparent 84%);animation:border-spin 2s linear infinite}.pe-le-plasma-arc2{position:absolute;inset:0;background:conic-gradient(from 90deg,transparent 45%,rgba(160,20,220,.5) 61%,rgba(200,64,255,.8) 69%,transparent 81%);animation:border-spin 3.2s linear infinite reverse}.pe-le-plasma-inner{position:absolute;inset:3px;border-radius:11px;background:#280048}.pe-le-aurora{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}.pe-le-aurora-band{position:absolute;left:-20%;right:-20%;animation:aurora-wave ease-in-out infinite alternate}.pe-le-aurora-band:nth-child(1){height:20px;top:8%;background:linear-gradient(90deg,transparent,rgba(80,255,180,.1),rgba(140,80,255,.15),transparent);animation-duration:4s}.pe-le-aurora-band:nth-child(2){height:16px;top:26%;background:linear-gradient(90deg,transparent,rgba(80,140,255,.09),rgba(160,80,255,.13),transparent);animation-duration:5.5s;animation-delay:.8s}.pe-le-aurora-band:nth-child(3){height:14px;top:46%;background:linear-gradient(90deg,transparent,rgba(200,80,255,.09),rgba(80,200,255,.11),transparent);animation-duration:4.8s;animation-delay:1.6s}.pe-le-aurora-band:nth-child(4){height:12px;top:62%;background:linear-gradient(90deg,transparent,rgba(100,255,160,.07),rgba(180,80,255,.11),transparent);animation-duration:6s;animation-delay:2.2s}.pe-le-orb-layer{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}.pe-le-orb{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(255,128,255,.9),rgba(192,32,240,.4),transparent 70%);animation:orb-float ease-in-out infinite}.pe-le-orb:nth-child(1){width:11px;height:11px;left:10%;top:24%;animation-duration:4.0s}.pe-le-orb:nth-child(2){width:7px;height:7px;left:76%;top:54%;animation-duration:3.5s;animation-delay:.8s}.pe-le-orb:nth-child(3){width:9px;height:9px;left:48%;top:13%;animation-duration:4.8s;animation-delay:1.6s}.pe-le-orb:nth-child(4){width:5px;height:5px;left:28%;top:70%;animation-duration:3.2s;animation-delay:2.2s}.pe-le-orb:nth-child(5){width:8px;height:8px;left:88%;top:38%;animation-duration:4.2s;animation-delay:.4s}.pe-le-holo{position:absolute;inset:0;z-index:4;pointer-events:none;background:linear-gradient(45deg,rgba(224,64,255,.12),rgba(100,64,255,.1),rgba(64,128,255,.12),rgba(64,240,200,.08),rgba(224,64,255,.12));background-size:300% 300%;animation:holo-sweep 3s ease-in-out infinite;mix-blend-mode:screen}.pe-le-depth-rings{position:absolute;inset:0;z-index:2;pointer-events:none;display:flex;align-items:center;justify-content:center}.pe-le-depth-ring{position:absolute;border-radius:50%;border:1px solid rgba(224,64,255,.22);animation:ring-expand ease-out infinite;opacity:0}.pe-le-depth-ring:nth-child(1){animation-duration:4s}.pe-le-depth-ring:nth-child(2){animation-duration:4s;animation-delay:1.33s}.pe-le-depth-ring:nth-child(3){animation-duration:4s;animation-delay:2.66s}.pe-le-bolt-layer{position:absolute;inset:0;z-index:5;pointer-events:none;overflow:hidden}.pe-le-bolt{position:absolute;top:0;left:0;width:100%;height:100%;opacity:0}.pe-le-bolt.b1{animation:bolt-flash 6.5s ease-in-out infinite;animation-delay:0s}.pe-le-bolt.b2{animation:bolt-flash 8.2s ease-in-out infinite;animation-delay:1.4s}.pe-le-bolt.b3{animation:bolt-flash 7.0s ease-in-out infinite;animation-delay:3.8s}.pe-le-bolt.b4{animation:bolt-flash 9.5s ease-in-out infinite;animation-delay:2.2s}.pe-le-bolt.b5{animation:bolt-flash 6.8s ease-in-out infinite;animation-delay:5.1s}.pe-le-bolt.b6{animation:bolt-flash 8.8s ease-in-out infinite;animation-delay:4.3s}.pe-le-bolt-glow{fill:none;stroke:#c020f0;stroke-linecap:round;stroke-linejoin:round;stroke-width:10;opacity:.4}.pe-le-bolt-mid{fill:none;stroke:#e040ff;stroke-linecap:round;stroke-linejoin:round;stroke-width:5;opacity:.7}.pe-le-bolt-core{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:2;opacity:1}.pe-le-bolt-branch{fill:none;stroke:#e080ff;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.2;opacity:.65}.pe-le-tear-layer{position:absolute;inset:0;z-index:5;pointer-events:none;overflow:hidden}.pe-le-tear{position:absolute;left:0;right:0;animation:tear-glitch ease-in-out infinite;opacity:0}.pe-le-tear-inner{height:3px;background:linear-gradient(90deg,transparent,rgba(255,80,255,.65),rgba(255,255,255,.85),rgba(224,64,255,.5),transparent)}.pe-le-tear:nth-child(1){top:22%;animation-duration:5.0s;animation-delay:.4s}.pe-le-tear:nth-child(2){top:56%;animation-duration:6.2s;animation-delay:2.3s}.pe-le-tear:nth-child(3){top:74%;animation-duration:4.6s;animation-delay:3.8s}.pe-le-whiteout{position:absolute;inset:0;z-index:6;pointer-events:none;border-radius:9px;background:rgba(255,255,255,0)}.pe-le-whiteout.w1{animation:whiteout-leg 7.0s ease-in-out infinite;animation-delay:3.84s}.pe-le-whiteout.w2{animation:whiteout-leg 9.5s ease-in-out infinite;animation-delay:2.24s}.pe-le-whiteout.w3{animation:whiteout-leg 6.8s ease-in-out infinite;animation-delay:5.14s}
.pe-imm-glow-1{position:absolute;inset:-5px;border-radius:18px;z-index:-1;pointer-events:none;box-shadow:0 0 16px 4px rgba(40,220,120,.65),0 0 36px 8px rgba(20,180,80,.4);animation:glow-breathe 2s ease-in-out infinite}.pe-imm-glow-2{position:absolute;inset:-16px;border-radius:24px;z-index:-2;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,rgba(40,220,120,.26) 0%,rgba(20,160,70,.12) 45%,transparent 72%);animation:glow-breathe 2s ease-in-out infinite;animation-delay:.3s}.pe-imm-glow-3{position:absolute;inset:-44px;border-radius:52px;z-index:-3;pointer-events:none;background:radial-gradient(ellipse at 50% 55%,rgba(20,200,80,.14) 0%,rgba(10,120,50,.06) 50%,transparent 72%);animation:glow-breathe 3.2s ease-in-out infinite;animation-delay:.8s}.pe-imm-glow-4{position:absolute;inset:-80px;border-radius:90px;z-index:-4;pointer-events:none;background:radial-gradient(ellipse at 50% 55%,rgba(10,160,60,.08) 0%,rgba(5,80,30,.04) 45%,transparent 70%);animation:glow-breathe 4s ease-in-out infinite;animation-delay:1.2s}.pe-imm-corner-arcs{position:absolute;inset:0;z-index:7;pointer-events:none}.pe-imm-corner-arcs svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}.pe-imm-arc-glow{fill:none;stroke-linecap:round;stroke:rgba(40,220,120,.18);stroke-width:0}.pe-imm-arc-line{fill:none;}.pe-imm-arc-glow.a1,.pe-imm-arc-line.a1{animation:corner-arc-fade 4s ease-in-out infinite;animation-delay:0s}.pe-imm-arc-glow.a2,.pe-imm-arc-line.a2{animation:corner-arc-fade 4s ease-in-out infinite;animation-delay:1s}.pe-imm-arc-glow.a3,.pe-imm-arc-line.a3{animation:corner-arc-fade 4s ease-in-out infinite;animation-delay:2s}.pe-imm-arc-glow.a4,.pe-imm-arc-line.a4{animation:corner-arc-fade 4s ease-in-out infinite;animation-delay:3s}.pe-imm-plasma-wrap{position:absolute;inset:-5px;border-radius:17px;overflow:hidden;z-index:0;pointer-events:none}.pe-imm-plasma-arc1{position:absolute;inset:0;background:conic-gradient(from 0deg,transparent 35%,rgba(20,160,70,.6) 50%,rgba(80,255,160,1) 59%,rgba(40,220,120,.9) 67%,transparent 80%);animation:border-spin 1.6s linear infinite}.pe-imm-plasma-arc2{position:absolute;inset:0;background:conic-gradient(from 120deg,transparent 40%,rgba(10,120,50,.5) 54%,rgba(60,220,120,.85) 62%,transparent 76%);animation:border-spin 2.6s linear infinite reverse}.pe-imm-plasma-arc3{position:absolute;inset:0;background:conic-gradient(from 240deg,transparent 48%,rgba(40,255,130,.45) 62%,rgba(120,255,190,.75) 68%,transparent 79%);animation:border-spin 3.8s linear infinite}.pe-imm-plasma-inner{position:absolute;inset:4px;border-radius:13px;background:#021a0a}.pe-imm-inner-border{position:absolute;inset:1px;border-radius:11px;z-index:6;pointer-events:none;border:1px solid rgba(80,255,160,.26);animation:inner-border-pulse 2.2s ease-in-out infinite}.pe-imm-slab-layer{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}.pe-imm-slab{position:absolute;top:-10%;height:120%;transform:rotate(18deg);transform-origin:top center;background:linear-gradient(to bottom,transparent 0%,rgba(40,220,120,.45) 20%,rgba(120,255,190,.75) 50%,rgba(40,220,120,.45) 80%,transparent 100%);filter:blur(1.5px);animation:slab-pulse ease-in-out infinite alternate}.pe-imm-slab:nth-child(1){width:7px;left:10%;animation-duration:2.8s;animation-delay:0s}.pe-imm-slab:nth-child(2){width:5px;left:28%;animation-duration:3.5s;animation-delay:.5s}.pe-imm-slab:nth-child(3){width:9px;left:48%;animation-duration:3.0s;animation-delay:1.1s}.pe-imm-slab:nth-child(4){width:5px;left:66%;animation-duration:3.8s;animation-delay:1.7s}.pe-imm-slab:nth-child(5){width:7px;left:82%;animation-duration:2.6s;animation-delay:.3s}.pe-imm-aurora{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}.pe-imm-aurora-band{position:absolute;left:-20%;right:-20%;animation:aurora-wave ease-in-out infinite alternate}.pe-imm-aurora-band:nth-child(1){height:22px;top:6%;background:linear-gradient(90deg,transparent,rgba(40,255,120,.18),rgba(80,255,160,.24),transparent);animation-duration:3.5s}.pe-imm-aurora-band:nth-child(2){height:17px;top:24%;background:linear-gradient(90deg,transparent,rgba(20,200,100,.14),rgba(60,255,140,.2),transparent);animation-duration:4.8s;animation-delay:.7s}.pe-imm-aurora-band:nth-child(3){height:15px;top:44%;background:linear-gradient(90deg,transparent,rgba(60,220,120,.12),rgba(40,220,255,.12),transparent);animation-duration:4.2s;animation-delay:1.4s}.pe-imm-aurora-band:nth-child(4){height:13px;top:63%;background:linear-gradient(90deg,transparent,rgba(80,255,180,.1),rgba(40,220,120,.16),transparent);animation-duration:5.5s;animation-delay:2.1s}.pe-imm-rings{position:absolute;inset:0;z-index:2;pointer-events:none;display:flex;align-items:center;justify-content:center}.pe-imm-ring{position:absolute;border-radius:50%;border:1px solid rgba(40,220,120,.24);animation:ring-expand ease-out infinite;opacity:0}.pe-imm-ring:nth-child(1){animation-duration:3.5s}.pe-imm-ring:nth-child(2){animation-duration:3.5s;animation-delay:1.17s}.pe-imm-ring:nth-child(3){animation-duration:3.5s;animation-delay:2.34s}.pe-imm-orb-layer{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}.pe-imm-orb{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(100,255,180,.95),rgba(20,160,80,.4),transparent 70%);animation:orb-float ease-in-out infinite}.pe-imm-orb:nth-child(1){width:12px;height:12px;left:8%;top:22%;animation-duration:3.8s}.pe-imm-orb:nth-child(2){width:8px;height:8px;left:78%;top:52%;animation-duration:3.3s;animation-delay:.7s}.pe-imm-orb:nth-child(3){width:10px;height:10px;left:50%;top:12%;animation-duration:4.6s;animation-delay:1.4s}.pe-imm-orb:nth-child(4){width:6px;height:6px;left:26%;top:68%;animation-duration:3.0s;animation-delay:2.0s}.pe-imm-orb:nth-child(5){width:8px;height:8px;left:90%;top:36%;animation-duration:4.0s;animation-delay:.3s}.pe-imm-orb:nth-child(6){width:6px;height:6px;left:62%;top:78%;animation-duration:3.6s;animation-delay:1.0s}.pe-imm-holo{position:absolute;inset:0;z-index:4;pointer-events:none;background:linear-gradient(45deg,rgba(40,220,120,.14),rgba(20,180,80,.1),rgba(80,255,160,.16),rgba(40,200,255,.1),rgba(40,220,120,.14));background-size:300% 300%;animation:holo-sweep 2.4s ease-in-out infinite;mix-blend-mode:screen}.pe-imm-spark-layer{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}.pe-imm-spark{position:absolute;background:#60ffb0;clip-path:polygon(50% 0%,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0% 50%,38% 38%);animation:sp-anim linear infinite;opacity:0}.pe-imm-spark:nth-child(1){width:6px;height:6px;left:6%;top:16%;animation-duration:2.0s}.pe-imm-spark:nth-child(2){width:5px;height:5px;left:82%;top:10%;animation-duration:1.7s;animation-delay:.6s}.pe-imm-spark:nth-child(3){width:4px;height:4px;left:42%;top:50%;animation-duration:2.4s;animation-delay:.3s}.pe-imm-spark:nth-child(4){width:7px;height:7px;left:70%;top:64%;animation-duration:1.9s;animation-delay:1.1s}.pe-imm-spark:nth-child(5){width:5px;height:5px;left:16%;top:72%;animation-duration:2.2s;animation-delay:.5s}.pe-imm-spark:nth-child(6){width:4px;height:4px;left:92%;top:44%;animation-duration:2.3s;animation-delay:1.4s}.pe-imm-spark:nth-child(7){width:6px;height:6px;left:30%;top:28%;animation-duration:1.8s;animation-delay:.9s}.pe-imm-spark:nth-child(8){width:4px;height:4px;left:58%;top:82%;animation-duration:2.5s;animation-delay:1.8s}.pe-imm-tear-layer{position:absolute;inset:0;z-index:5;pointer-events:none;overflow:hidden}.pe-imm-tear{position:absolute;left:0;right:0;animation:tear-glitch ease-in-out infinite;opacity:0}.pe-imm-tear-inner{height:3px;background:linear-gradient(90deg,transparent,rgba(40,255,120,.7),rgba(200,255,220,.9),rgba(40,220,120,.5),transparent)}.pe-imm-tear:nth-child(1){top:20%;animation-duration:5.2s;animation-delay:.3s}.pe-imm-tear:nth-child(2){top:54%;animation-duration:6.0s;animation-delay:2.5s}.pe-imm-tear:nth-child(3){top:74%;animation-duration:4.8s;animation-delay:4.0s}.pe-imm-foil{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden;border-radius:11px}.pe-imm-foil::before{content:'';position:absolute;top:-50%;left:0;right:0;height:50%;background:linear-gradient(180deg,transparent,rgba(100,255,180,.1),rgba(40,220,120,.05),transparent);animation:foil-scroll 4.5s ease-in-out infinite}.pe-imm-foil::after{content:'';position:absolute;top:-100%;left:0;right:0;height:30%;background:linear-gradient(180deg,transparent,rgba(140,255,200,.08),transparent);animation:foil-scroll 4.5s ease-in-out infinite;animation-delay:1.8s}.pe-imm-shine{position:absolute;inset:0;z-index:5;pointer-events:none;border-radius:11px;overflow:hidden}.pe-imm-shine::after{content:'';position:absolute;top:-100%;left:-60%;width:40%;height:300%;background:linear-gradient(105deg,transparent 30%,rgba(140,255,200,.52) 50%,transparent 70%);animation:coin-flip 2.8s ease-in-out infinite}.pe-imm-shock{position:absolute;inset:0;z-index:4;pointer-events:none;display:flex;align-items:center;justify-content:center}.pe-imm-shock-ring{position:absolute;border-radius:50%;border:3px solid rgba(80,255,160,.9);box-shadow:0 0 14px rgba(40,220,120,.9),0 0 36px rgba(40,220,120,.4);animation:shock-expand ease-out infinite;opacity:0}.pe-imm-shock-ring:nth-child(1){animation-duration:2.8s}.pe-imm-shock-ring:nth-child(2){animation-duration:2.8s;animation-delay:.55s}.pe-imm-shock-ring:nth-child(3){animation-duration:2.8s;animation-delay:1.1s}.pe-imm-shock-ring:nth-child(4){animation-duration:2.8s;animation-delay:1.65s}.pe-imm-shock-core{position:absolute;width:20px;height:20px;border-radius:50%;z-index:5;background:radial-gradient(circle,rgba(220,255,230,.95),rgba(40,220,120,.35),transparent 70%);animation:core-pulse 2.8s ease-out infinite}.pe-imm-shock-flash{position:absolute;inset:0;z-index:6;pointer-events:none;border-radius:11px;background:rgba(0,0,0,0);animation:shock-flash 2.8s ease-out infinite}
@media(max-width:1000px){.pe-pack-img,.pe-fsl{width:100px;height:158px}.pe-skill-spread{width:calc(100% + 160px);margin:0 -30px}}
@media(max-width:700px){
  .pe-pack-img,.pe-fsl{width:82px;height:128px}
  .pe-card{width:calc(19vw - 4px);min-width:110px}
  .pe-cards-row{gap:.4rem}
  .pe-skill-spread{width:calc(100% + 100px);margin:0 -20px}
  .pe-form-row{gap:6px}
  .pe-skill-side{gap:6px}
  .pe-pack-wrap,.pe-fsl{width:82px;height:128px}
  .pe-field{transform:scale(0.82);transform-origin:top center;margin-bottom:-18%}
}
@media(max-width:420px){.pe-pack-img,.pe-fsl{width:64px;height:100px}.pe-card{min-width:96px}.pe-fc-score{font-size:.72rem}.pe-skill-spread{width:calc(100% + 60px);margin:0 -10px}.pe-pack-wrap,.pe-fsl{width:64px;height:100px}}
`;

function VersusDraftFallback() {
  return (
    <div style={{ minHeight:'100vh', background:'#050a18', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontFamily:'Barlow Condensed,sans-serif', color:'#2a4060', letterSpacing:'.2em', fontSize:'.85rem' }}>
        LOADING...
      </div>
    </div>
  );
}

export default function VersusDraftPage() {
  return (
    <Suspense fallback={<VersusDraftFallback />}>
      <VersusDraft />
    </Suspense>
  );
}