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
  { min: 17001, label: 'HALL OF FAME',       icon: '🏛️', color: '#f4c06a' },
  { min: 14001, label: 'SUPER BOWL DYNASTY', icon: '🏆', color: '#e8a84b' },
  { min: 11001, label: 'ALL-PRO ELITE',      icon: '⭐', color: '#6ba8c0' },
  { min: 8001,  label: 'PRO BOWL CALIBER',  icon: '🔥', color: '#68a878' },
  { min: 5001,  label: 'STARTER QUALITY',   icon: '📈', color: '#bfb5a0' },
  { min: 2001,  label: 'BACKUP UNIT',        icon: '📋', color: '#7d7463' },
  { min: 0,     label: 'PRACTICE SQUAD',     icon: '🏈', color: '#a87420' },
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
  const boostedWeights = isCaptain
    ? { ...baseWeights, rare: 18, transcendent: 30, immortal: 2 }
    : { ...baseWeights, common: 40, rare: 38 };

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
   RARITY EFFECTS (unchanged)
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
    if (!challengeId) return;
    async function checkIdentity() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: challenge } = await supabase
        .from('versus_challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      const host = !!(user && challenge && challenge.creator_id === user.id);
      setIsHost(host);

      if (host) {
        setNeedsIdentity(false);
        return;
      }

      if (user) {
        const name = user.user_metadata?.full_name || user.email || 'Opponent';
        setGuestName(name);
        localStorage.setItem(`versus-guest-${challengeId}`, name);

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

  useEffect(() => {
    if (!challengeId || needsIdentity) return;

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

  const submitResult = useCallback(async (finalLineup: (Player | null)[]) => {
    if (!challengeId) return;
    const score = finalLineup.reduce((s, p) => s + (p?.score ?? 0), 0);
    const t = getTier(score);
    const roleKey = isHost ? 'host' : 'opponent';

    let playerName = guestName || 'Opponent';
    if (user) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', user.id)
        .single();
      playerName = prof?.username || prof?.full_name || user.email || (isHost ? 'Host' : 'Opponent');
    }

    const resultData = {
      lineup: finalLineup,
      score,
      tier: t.label,
      icon: t.icon,
      completedAt: Date.now(),
      name: playerName,
    };

    try {
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

    localStorage.setItem(`versus-result-${challengeId}-${roleKey}`, JSON.stringify(resultData));
    localStorage.removeItem(`versus-draft-progress-${challengeId}-${roleKey}`);

    setPhase('submitted' as any);
  }, [challengeId, isHost, guestName, router, supabase, user]);

  const openPack = useCallback((si: number, isCaptain: boolean, curLineup: (Player | null)[]) => {
    const excl = curLineup.filter(Boolean).map(p => p!.id);
    const cards = weightedDraw(SLOTS[si].pool, 5, isCaptain, excl);
    setPackSi(si); setPackCards(cards);
    setRevealed(Array(cards.length).fill(false)); setPickedId(null);
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

  /* FORMATION SLOT */
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
              <div className="pe-fc-topbar" style={{ background: 'rgba(20,19,17,.95)' }}>
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

  /* RENDER */
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      {immFlash && (<div className="pe-imm-flash" aria-hidden="true"><div className="pe-imm-text">💎 IMMORTAL PULL!</div></div>)}

      <nav className="pe-nav">
        <div className="pe-nav-l"><Link href="/games/pack-empire/offense/versus" className="pe-back">← Versus Lobby</Link></div>
        <div className="pe-nav-c">
          <span className="pe-pip" />
          <span className="pe-nav-title">
            Versus <span className="pe-nav-italic">Draft.</span>
          </span>
        </div>
        <div className="pe-nav-r">
          {challengeId && (
            <span className="pe-nav-id">#{challengeId.slice(-6).toUpperCase()}</span>
          )}
        </div>
      </nav>

      {(phase === 'packing') && (
        <div className="pe-strip">
          <div className="pe-sg"><div className="pe-sv" style={{ color: tier.color }}>{totalScore.toLocaleString()}</div><div className="pe-sl">Accolades</div></div>
          <div className="pe-sdiv" />
          <div className="pe-sg"><div className="pe-sv">{filled}<span className="pe-sof">/11</span></div><div className="pe-sl">Filled</div></div>
          <div className="pe-sdiv" />
          <div className="pe-sg"><div className="pe-stier" style={{ color: tier.color }}>{tier.icon} {tier.label}</div><div className="pe-sl">Tier</div></div>
          <div className="pe-sbar"><div className="pe-sfill" style={{ width: `${(filled / 11) * 100}%` }} /></div>
        </div>
      )}

      <div className="pe-root">

        {/* ════ IDENTITY GATE ════ */}
        {needsIdentity && (
          <div className="pe-gate">
            <div className="pe-gate-icon">⚔️</div>
            <div className="pe-gate-kicker">§ Versus · Challenge invitation</div>
            <div className="pe-gate-title">
              Join the <span className="pe-italic">challenge.</span>
            </div>
            <p className="pe-gate-sub">
              Sign in to save this match to your history, or play as a guest.
            </p>

            <Link
              href={`/login?redirect=${encodeURIComponent(`/games/pack-empire/offense/versus/draft?challenge=${challengeId}`)}`}
              className="pe-gate-primary"
            >
              <span>Sign in to play</span>
              <span>→</span>
            </Link>

            <div className="pe-gate-divider">
              <span className="pe-gate-divider-line" />
              <span className="pe-gate-divider-text">OR</span>
              <span className="pe-gate-divider-line" />
            </div>

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
              className="pe-gate-input"
            />
            <button
              disabled={!guestName.trim()}
              onClick={() => {
                localStorage.setItem(`versus-guest-${challengeId}`, guestName.trim());
                setNeedsIdentity(false);
              }}
              className="pe-gate-guest"
            >
              <span>Play as guest</span>
              <span>→</span>
            </button>
          </div>
        )}

        {/* ════ SETUP ════ */}
        {!needsIdentity && phase === 'setup' && (
          <div className="pe-setup">
            <div className="pe-setup-hero">
              <div className="pe-hero-sup">§ Versus Challenge · Choose your captain</div>
              <div className="pe-hero-title">
                Pick your<br />
                <span className="pe-italic">captain.</span>
              </div>
              <div className="pe-hero-sub">Tap a position to set your captain, then open packs to build your lineup.</div>
            </div>
            <div className="pe-setup-inst">
              <span className="pe-inst-bolt">⚡</span>
              Tap any position to set it as your <strong>CAPTAIN</strong>
              <span className="pe-inst-note"> — captain packs have 5× immortal odds</span>
            </div>
            <div className="pe-setup-field"><FieldLayout isSetup /></div>
            {challengeId && (
              <div className="pe-setup-meta">
                ★ Challenge {challengeId.slice(-6).toUpperCase()} · Drafting as {isHost ? 'HOST' : (guestName || 'OPPONENT').toUpperCase()}
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
          <div className="pe-submitting">
            <div className="pe-submitting-icon">⚡</div>
            <div className="pe-submitting-kicker">§ Finalizing</div>
            <div className="pe-submitting-title">
              Locking in your <span className="pe-italic">draft.</span>
            </div>
          </div>
        )}

        {/* ════ SUBMITTED ════ */}
        {phase === 'submitted' && (
          <div className="pe-packing">
            <div className="pe-formation-wrap">
              <FieldLayout />
            </div>
            <div className="pe-submitted">
              <div className="pe-submitted-icon">✓</div>
              <div className="pe-submitted-kicker">§ Sealed</div>
              <div className="pe-submitted-title">
                Draft <span className="pe-italic">locked in.</span>
              </div>
              <p className="pe-submitted-sub">
                Your lineup has been submitted. Head to the results screen whenever you&apos;re ready — your opponent may still be drafting.
              </p>
              <button
                onClick={() => router.push(`/games/pack-empire/offense/versus/results?challenge=${challengeId}`)}
                className="pe-submitted-btn"
              >
                <span>View results</span>
                <span>→</span>
              </button>
              <Link
                href="/games/pack-empire/offense/versus"
                className="pe-submitted-back"
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
   STYLES
══════════════════════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --pe-bg:#141311;
  --pe-bg-soft:#1c1b18;
  --pe-bg-card:#201e1a;
  --pe-ink:#f4ebd8;
  --pe-ink-soft:#bfb5a0;
  --pe-ink-mute:#7d7463;
  --pe-amber:#e8a84b;
  --pe-line:#3a3630;
  --pe-line-soft:#2a2620;
  /* Versus signature: emerald green */
  --pe-green:#68a878;
  --pe-green-bright:#88c898;
  --pe-green-deep:#4a7854;
  --pe-green-glow:rgba(104,168,120,.4);
}

body{font-family:'Space Grotesk',sans-serif;background:var(--pe-bg);color:var(--pe-ink)}

/* ═══ NAV / MASTHEAD ═══ */
.pe-nav{
  display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:1rem;
  padding:1.2rem 2rem;
  background:rgba(20,19,17,.92);
  backdrop-filter:blur(12px);
  border-bottom:1px solid var(--pe-line);
  position:sticky;top:0;z-index:30;
}
.pe-nav-l{justify-self:start}
.pe-nav-l a.pe-back,
.pe-back{
  color:var(--pe-green);text-decoration:none;
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;
  transition:color .2s;
}
.pe-nav-l a.pe-back:hover,.pe-back:hover{color:var(--pe-green-bright)}
.pe-nav-c{display:flex;align-items:center;gap:.65rem;justify-self:center}
.pe-nav-title{
  font-family:'DM Serif Display',serif;
  font-size:1.35rem;letter-spacing:-.01em;color:var(--pe-ink);
}
.pe-nav-italic{font-style:italic;color:var(--pe-green)}
.pe-nav-r{justify-self:end}
.pe-nav-id{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.72rem;letter-spacing:.18em;
  color:var(--pe-ink-soft);
  padding:.45rem .75rem;
  background:var(--pe-bg-card);border:1px solid var(--pe-line);
  border-radius:2px;
}

.pe-pip{
  width:9px;height:9px;border-radius:50%;
  background:var(--pe-green);flex-shrink:0;
  box-shadow:0 0 0 3px rgba(104,168,120,.15),0 0 12px var(--pe-green);
  animation:pip-pulse 2s ease-in-out infinite;
}
@keyframes pip-pulse{
  0%,100%{box-shadow:0 0 0 3px rgba(104,168,120,.15),0 0 12px var(--pe-green)}
  50%{box-shadow:0 0 0 6px rgba(104,168,120,.05),0 0 22px var(--pe-green-bright)}
}

/* Immortal flash */
.pe-imm-flash{position:fixed;inset:0;z-index:250;pointer-events:none;background:radial-gradient(ellipse at center,rgba(40,220,120,.35),rgba(10,60,30,.2) 40%,transparent 70%);display:flex;align-items:center;justify-content:center;animation:imm-in 2.4s ease both}
@keyframes imm-in{0%{opacity:0}10%{opacity:1}80%{opacity:1}100%{opacity:0}}
.pe-imm-text{font-family:'DM Serif Display',serif;font-weight:900;font-size:clamp(1.6rem,5vw,3rem);letter-spacing:.06em;color:#28dc78;text-shadow:0 0 40px #28dc78,0 0 80px rgba(40,220,120,.7);animation:imm-pop .55s cubic-bezier(.36,1.6,.64,1) both}
@keyframes imm-pop{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}

/* Status strip */
.pe-strip{
  background:rgba(20,19,17,.96);
  border-bottom:1px solid var(--pe-line);
  display:flex;align-items:center;
  padding:.65rem 1.5rem;
  position:sticky;top:62px;z-index:20;backdrop-filter:blur(8px);overflow:hidden;
}
.pe-sg{flex:1;text-align:center;padding:0 .5rem}
.pe-sv{
  font-family:'DM Serif Display',serif;
  font-size:1.6rem;line-height:1;color:var(--pe-ink);
  letter-spacing:-.02em;transition:color .4s;
}
.pe-sof{font-size:.75rem;color:var(--pe-ink-mute);font-family:'JetBrains Mono',monospace}
.pe-sl{
  font-family:'JetBrains Mono',monospace;
  font-size:.55rem;color:var(--pe-ink-mute);
  letter-spacing:.22em;text-transform:uppercase;margin-top:4px;
}
.pe-stier{
  font-family:'DM Serif Display',serif;font-style:italic;
  font-size:1rem;letter-spacing:-.005em;transition:color .4s;
}
.pe-sdiv{width:1px;height:42px;background:var(--pe-line);flex-shrink:0}
.pe-sbar{position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--pe-line-soft)}
.pe-sfill{height:100%;background:linear-gradient(90deg,var(--pe-green-deep),var(--pe-green));transition:width .5s ease}

/* Root */
.pe-root{
  min-height:calc(100vh - 62px);
  background:var(--pe-bg);color:var(--pe-ink);
  background-image:
    radial-gradient(ellipse at 50% -10%,rgba(104,168,120,.06),transparent 55%),
    radial-gradient(ellipse at 15% 80%,rgba(74,120,84,.03),transparent 50%),
    repeating-linear-gradient(0deg,transparent,transparent 70px,rgba(104,168,120,.012) 70px,rgba(104,168,120,.012) 71px);
  position:relative;
}

.pe-italic{font-style:italic;color:var(--pe-green)}

/* ═══ IDENTITY GATE ═══ */
.pe-gate{
  max-width:480px;margin:3rem auto;padding:3rem 1.75rem;text-align:center;
  background:var(--pe-bg-card);border:1px solid var(--pe-line);
  position:relative;
}
.pe-gate::before{
  content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:var(--pe-green);
}
.pe-gate-icon{font-size:2.8rem;margin-bottom:1rem}
.pe-gate-kicker{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.62rem;letter-spacing:.28em;text-transform:uppercase;
  color:var(--pe-green);margin-bottom:.6rem;
}
.pe-gate-title{
  font-family:'DM Serif Display',serif;
  font-size:2rem;line-height:1;letter-spacing:-.02em;
  color:var(--pe-ink);margin-bottom:.8rem;
}
.pe-gate-sub{
  font-family:'Space Grotesk',sans-serif;
  color:var(--pe-ink-soft);font-size:.92rem;line-height:1.55;
  margin-bottom:1.75rem;
}
.pe-gate-primary{
  display:flex;width:100%;align-items:center;justify-content:center;gap:.75rem;
  background:var(--pe-green);color:var(--pe-bg);
  padding:1.1rem;margin-bottom:1rem;
  font-family:'Space Grotesk',sans-serif;font-weight:700;
  font-size:.9rem;letter-spacing:.18em;text-transform:uppercase;
  text-decoration:none;border-radius:2px;
  transition:all .25s cubic-bezier(.2,.8,.2,1);
  box-shadow:0 8px 20px rgba(104,168,120,.15);
}
.pe-gate-primary:hover{
  background:var(--pe-green-bright);transform:translateY(-2px);
  box-shadow:0 14px 30px rgba(104,168,120,.3);
}
.pe-gate-divider{
  display:flex;align-items:center;gap:1rem;margin-bottom:1rem;
}
.pe-gate-divider-line{flex:1;height:1px;background:var(--pe-line)}
.pe-gate-divider-text{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.62rem;letter-spacing:.25em;color:var(--pe-ink-mute);
}
.pe-gate-input{
  width:100%;padding:.95rem 1rem;
  background:var(--pe-bg);color:var(--pe-ink);
  border:1px solid var(--pe-line);border-radius:2px;
  font-family:'Space Grotesk',sans-serif;font-size:.95rem;letter-spacing:.02em;
  margin-bottom:.75rem;outline:none;transition:border-color .2s;
}
.pe-gate-input:focus{border-color:var(--pe-green)}
.pe-gate-input::placeholder{color:var(--pe-ink-mute)}
.pe-gate-guest{
  display:flex;width:100%;align-items:center;justify-content:center;gap:.6rem;
  background:transparent;color:var(--pe-green);
  border:1px solid var(--pe-green);padding:.95rem;
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;
  border-radius:2px;cursor:pointer;transition:all .2s;
}
.pe-gate-guest:hover:not(:disabled){
  background:rgba(104,168,120,.08);color:var(--pe-green-bright);border-color:var(--pe-green-bright);
}
.pe-gate-guest:disabled{
  color:var(--pe-ink-mute);border-color:var(--pe-line);cursor:not-allowed;
}

/* ═══ SETUP ═══ */
.pe-setup{max-width:1200px;margin:0 auto;padding:2rem 1.25rem 3rem}
.pe-setup-hero{text-align:center;margin-bottom:1.5rem;padding:1rem}
.pe-hero-sup{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.62rem;letter-spacing:.28em;text-transform:uppercase;
  color:var(--pe-green);margin-bottom:.8rem;
}
.pe-hero-title{
  font-family:'DM Serif Display',serif;
  font-size:clamp(2rem,5.5vw,3.4rem);line-height:.95;letter-spacing:-.02em;
  color:var(--pe-ink);margin-bottom:.7rem;
}
.pe-hero-sub{
  font-family:'DM Serif Display',serif;font-style:italic;
  font-size:1rem;color:var(--pe-ink-soft);
}
.pe-setup-inst{
  text-align:center;font-family:'Space Grotesk',sans-serif;
  font-size:.92rem;color:var(--pe-ink-soft);
  margin-bottom:1.25rem;padding:.8rem 1.1rem;
  background:rgba(104,168,120,.05);
  border:1px solid rgba(104,168,120,.2);
  border-left:3px solid var(--pe-green);
  line-height:1.5;max-width:720px;margin-left:auto;margin-right:auto;
}
.pe-setup-inst strong{color:var(--pe-green);font-weight:700}
.pe-inst-bolt{color:var(--pe-green);margin-right:.4rem}
.pe-inst-note{color:var(--pe-ink-mute);font-size:.85rem}
.pe-setup-field{
  background:var(--pe-bg-card);border:1px solid var(--pe-line);
  padding:1.2rem 1rem;margin-bottom:1rem;overflow:hidden;
}
.pe-setup-meta{
  text-align:center;margin-top:.8rem;
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;
  color:var(--pe-ink-mute);
}

/* ═══ PACKING ═══ */
.pe-packing{max-width:1200px;margin:0 auto;padding:2rem 1rem 3rem}
.pe-formation-wrap{
  background:var(--pe-bg-card);border:1px solid var(--pe-line);
  padding:1.25rem 1rem 1.5rem;margin-bottom:1.5rem;
}

.pe-cap-banner{
  display:flex;align-items:center;justify-content:center;gap:.6rem;
  padding:.65rem 1rem;margin-bottom:1rem;
  background:rgba(232,168,75,.08);
  border:1px solid rgba(232,168,75,.25);
  border-radius:2px;
  font-family:'Space Grotesk',sans-serif;
  font-size:.82rem;color:var(--pe-ink);
  text-align:center;line-height:1.4;
}
.pe-cap-bolt{color:var(--pe-amber);font-size:1rem}

.pe-cards-area{
  background:var(--pe-bg-card);border:1px solid var(--pe-line);
  padding:1.5rem 1rem;margin-bottom:1.5rem;
  position:relative;overflow:hidden;
}
.pe-cards-area::before{
  content:'';position:absolute;top:-40px;left:50%;transform:translateX(-50%);
  width:300px;height:150px;
  background:radial-gradient(ellipse,rgba(104,168,120,.1) 0%,transparent 70%);
  pointer-events:none;
}
.pe-ca-header{text-align:center;margin-bottom:1.5rem;position:relative}
.pe-cap-tag{
  display:inline-block;
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.65rem;letter-spacing:.22em;text-transform:uppercase;
  color:var(--pe-bg);background:var(--pe-amber);
  padding:.3rem .7rem;border-radius:2px;margin-bottom:.5rem;
}
.pe-ca-pos{
  font-family:'DM Serif Display',serif;
  font-size:1.8rem;line-height:1;letter-spacing:-.015em;
  color:var(--pe-ink);margin-bottom:.4rem;
}
.pe-ca-status{
  font-family:'JetBrains Mono',monospace;font-weight:500;
  font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;
  color:var(--pe-ink-mute);
}

.pe-cards-row{
  display:flex;gap:14px;justify-content:center;flex-wrap:wrap;padding:.5rem 0;
}

.pe-reveal-bar{display:flex;justify-content:center;margin-top:1.25rem}
.pe-reveal-btn{
  background:transparent;color:var(--pe-green);
  border:1px solid var(--pe-green);
  padding:.85rem 1.7rem;cursor:pointer;
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;
  border-radius:2px;transition:all .2s;
}
.pe-reveal-btn:hover{
  background:rgba(104,168,120,.08);
  color:var(--pe-green-bright);border-color:var(--pe-green-bright);
}

.pe-empty-prompt{
  text-align:center;padding:2.5rem 1rem;
  background:var(--pe-bg-card);border:1px dashed var(--pe-line);
}
.pe-ep-arrow{
  font-size:2rem;color:var(--pe-green);
  animation:bounce 1.4s ease-in-out infinite;margin-bottom:.5rem;
}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.pe-ep-text{
  font-family:'DM Serif Display',serif;font-style:italic;
  font-size:1.15rem;color:var(--pe-ink);margin-bottom:.3rem;
}
.pe-ep-sub{
  font-family:'JetBrains Mono',monospace;
  font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;
  color:var(--pe-ink-mute);
}

/* ═══ SUBMITTING / SUBMITTED ═══ */
.pe-submitting{
  text-align:center;padding:5rem 1.5rem;max-width:520px;margin:0 auto;
}
.pe-submitting-icon{
  font-size:3rem;color:var(--pe-green);margin-bottom:1rem;
  animation:pip-pulse 1.3s ease-in-out infinite;
}
.pe-submitting-kicker{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.65rem;letter-spacing:.28em;text-transform:uppercase;
  color:var(--pe-green);margin-bottom:.6rem;
}
.pe-submitting-title{
  font-family:'DM Serif Display',serif;
  font-size:clamp(1.8rem,4vw,2.6rem);line-height:1;letter-spacing:-.02em;
  color:var(--pe-ink);
}

.pe-submitted{
  text-align:center;padding:2.5rem 1.5rem;
  max-width:520px;margin:0 auto;
  background:var(--pe-bg-card);border:1px solid var(--pe-line);
  position:relative;
}
.pe-submitted::before{
  content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:var(--pe-green);
}
.pe-submitted-icon{
  font-size:2.4rem;color:var(--pe-green);margin-bottom:.8rem;
  text-shadow:0 0 20px var(--pe-green-glow);
}
.pe-submitted-kicker{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.65rem;letter-spacing:.28em;text-transform:uppercase;
  color:var(--pe-green);margin-bottom:.6rem;
}
.pe-submitted-title{
  font-family:'DM Serif Display',serif;
  font-size:clamp(1.8rem,4vw,2.4rem);line-height:1.05;letter-spacing:-.015em;
  color:var(--pe-ink);margin-bottom:1rem;
}
.pe-submitted-sub{
  font-family:'Space Grotesk',sans-serif;
  color:var(--pe-ink-soft);font-size:.92rem;line-height:1.6;
  margin-bottom:1.75rem;
}
.pe-submitted-btn{
  display:flex;width:100%;align-items:center;justify-content:center;gap:.8rem;
  background:var(--pe-green);color:var(--pe-bg);
  border:none;padding:1.1rem;cursor:pointer;
  font-family:'Space Grotesk',sans-serif;font-weight:700;
  font-size:.9rem;letter-spacing:.18em;text-transform:uppercase;
  border-radius:2px;margin-bottom:.85rem;
  transition:all .25s cubic-bezier(.2,.8,.2,1);
  box-shadow:0 8px 20px rgba(104,168,120,.15);
}
.pe-submitted-btn:hover{
  background:var(--pe-green-bright);transform:translateY(-2px);
  box-shadow:0 14px 30px rgba(104,168,120,.3);
}
.pe-submitted-back{
  display:block;text-align:center;
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;
  color:var(--pe-ink-mute);text-decoration:none;transition:color .2s;
}
.pe-submitted-back:hover{color:var(--pe-green)}

/* ═══ GAME CORE (field, slots, packs, cards) ═══ */
.pe-field{display:flex;flex-direction:column;align-items:center;gap:18px;width:fit-content;margin:0 auto}
.pe-form-row{display:flex;gap:16px}
.pe-skill-spread{display:flex;justify-content:space-between;align-items:flex-end;width:calc(100% + 380px);margin:0 -40px}
.pe-skill-side{display:flex;gap:18px}

.pe-slot-outer{display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;background:transparent;border:none}
.pe-slot-outer.hb-back{margin-top:16px;margin-left:8px}
.pe-slot-label{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.58rem;letter-spacing:.16em;text-transform:uppercase;
  color:var(--pe-ink-mute);text-align:center;line-height:1;
}
.pe-slot-label.cap{color:#c040ff;text-shadow:0 0 8px rgba(192,64,255,.6)}

.pe-pack-wrap{position:relative;display:flex;align-items:center;justify-content:center;cursor:default;width:125px;height:183px;flex-shrink:0}
.pe-pack-img{width:100% !important;height:100% !important;object-fit:cover;display:block;background:transparent}
.pe-pack-wrap.clickable{cursor:pointer;transition:transform .18s ease,filter .18s ease}
.pe-pack-wrap.clickable:hover{transform:translateY(-6px) scale(1.07);filter:drop-shadow(0 0 10px rgba(104,168,120,.7))}
.pe-pack-wrap.is-cap{animation:cap-drop-pulse 1.9s ease-in-out infinite}
@keyframes cap-drop-pulse{0%,100%{filter:drop-shadow(0 0 8px rgba(160,32,240,.9))}50%{filter:drop-shadow(0 0 18px rgba(224,64,255,1))}}
.pe-pack-cap-badge{
  position:absolute;top:-8px;left:0;right:0;text-align:center;
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;
  color:var(--pe-amber);text-shadow:0 0 8px rgba(232,168,75,.95);
  z-index:2;pointer-events:none;
}

.pe-fsl{width:125px;height:183px;border-radius:4px;overflow:visible;background:transparent;border:none;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  position:relative;transition:all .22s;cursor:default;flex-shrink:0}
.pe-fsl.has-p{background:#040810;border:2px solid rgba(255,255,255,.18);box-shadow:0 0 16px var(--rg,transparent);overflow:hidden;border-radius:4px}
.pe-fsl.active{background:rgba(104,168,120,.06);border:2px solid var(--pe-green);box-shadow:0 0 20px rgba(104,168,120,.4);animation:slot-p 1.4s ease-in-out infinite;border-radius:4px}
@keyframes slot-p{0%,100%{box-shadow:0 0 20px rgba(104,168,120,.4)}50%{box-shadow:0 0 38px rgba(104,168,120,.65)}}
.pe-fsl-locked{display:flex;flex-direction:column;align-items:center;gap:.3rem}
.pe-fsl-pos-small{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:.62rem;letter-spacing:.18em;color:var(--pe-ink-mute)}
.pe-fsl-opening{font-size:.65rem;color:var(--pe-green);animation:blink .9s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}

.pe-filled-card{position:absolute;inset:0;display:flex;flex-direction:column;overflow:hidden;border-radius:2px}
.pe-fc-topbar{display:flex;align-items:center;justify-content:space-between;padding:4px 6px;height:22px;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:.56rem;letter-spacing:.1em;flex-shrink:0;z-index:3}
.pe-fc-pos-badge{padding:1px 5px;border-radius:2px;color:#050a18;font-size:.55rem;letter-spacing:.1em;font-weight:700}
.pe-fc-rar-badge{font-size:.52rem;letter-spacing:.14em;opacity:.95}
.pe-fc-art{position:relative;height:98px;overflow:hidden;flex-shrink:0}
.pe-fc-field-lines{position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(255,255,255,.05) 20px,rgba(255,255,255,.05) 21px);pointer-events:none}
.pe-fc-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:2}
.pe-fc-initial{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'DM Serif Display',serif;font-size:2.4rem;color:rgba(255,255,255,.22);z-index:1;letter-spacing:-.02em}
.pe-fc-info{padding:4px 6px;background:rgba(4,8,16,.9);flex:1;display:flex;flex-direction:column;gap:2px;border-top:1px solid rgba(255,255,255,.05);z-index:3}
.pe-fc-name{font-family:'DM Serif Display',serif;font-size:.82rem;line-height:1.05;letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pe-fc-score{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:.78rem;letter-spacing:.02em;color:var(--pe-ink);line-height:1}
.pe-fc-team-tag{font-family:'JetBrains Mono',monospace;font-size:.52rem;letter-spacing:.14em;text-transform:uppercase;color:var(--pe-ink-mute);line-height:1}
.pe-fc-cap-badge{position:absolute;top:3px;right:3px;background:var(--pe-amber);color:var(--pe-bg);font-family:'JetBrains Mono',monospace;font-weight:700;font-size:.52rem;letter-spacing:.12em;padding:1px 4px;border-radius:2px;z-index:4}
.pe-fc-shine{position:absolute;inset:0;background:linear-gradient(120deg,transparent 40%,rgba(255,255,255,.08) 50%,transparent 60%);pointer-events:none;z-index:5}

.pe-card{
  position:relative;width:125px;min-width:125px;height:183px;
  perspective:1000px;cursor:pointer;flex-shrink:0;
  transition:transform .4s cubic-bezier(.2,.8,.2,1),filter .3s;
}
.pe-card.selectable:hover{transform:translateY(-12px) scale(1.04);filter:drop-shadow(0 10px 25px var(--rg,rgba(0,0,0,.5)))}
.pe-card.picked{transform:scale(1.15);filter:drop-shadow(0 0 35px var(--rc,var(--pe-green)))}
.pe-card.rejected{opacity:.25;transform:scale(.9);pointer-events:none;filter:grayscale(.7)}
.pe-ci{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .6s cubic-bezier(.2,.8,.2,1)}
.pe-card.rev .pe-ci{transform:rotateY(180deg)}

.pe-card-back,.pe-card-front{position:absolute;inset:0;backface-visibility:hidden;border-radius:4px;overflow:hidden}
.pe-card-back{
  background:linear-gradient(160deg,var(--pe-bg-card),var(--pe-bg-soft));
  border:1px solid var(--pe-line);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
}
.pe-back-grid{position:absolute;inset:0;background-image:repeating-linear-gradient(45deg,transparent,transparent 12px,rgba(104,168,120,.04) 12px,rgba(104,168,120,.04) 13px)}
.pe-back-icon{font-size:2.4rem;opacity:.4;filter:drop-shadow(0 0 8px rgba(104,168,120,.3))}
.pe-back-label{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.55rem;letter-spacing:.2em;text-transform:uppercase;
  color:var(--pe-green);
}
.pe-card-front{transform:rotateY(180deg);background:#050a18;border:2px solid var(--rc,var(--pe-green));box-shadow:0 0 18px var(--rg,transparent);display:flex;flex-direction:column}
.pe-cf-topbar{display:flex;align-items:center;justify-content:space-between;padding:4px 6px;height:22px;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:.56rem;letter-spacing:.1em;flex-shrink:0;z-index:3}
.pe-cf-pos{padding:1px 5px;border-radius:2px;color:#050a18;font-size:.55rem;letter-spacing:.1em;font-weight:700}
.pe-cf-rlab{font-size:.54rem;letter-spacing:.15em;opacity:.95}
.pe-cf-rlab.common{color:#c87840}.pe-cf-rlab.rare{color:#42c0f8}.pe-cf-rlab.dynasty{color:#ffd700}.pe-cf-rlab.transcendent{color:#e040ff}.pe-cf-rlab.immortal{color:#28dc78}
.pe-cf-art{position:relative;height:80px;overflow:hidden;flex-shrink:0}
.pe-cf-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:2}
.pe-cf-initial{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'DM Serif Display',serif;font-size:2.4rem;color:rgba(255,255,255,.22);z-index:1;letter-spacing:-.02em}
.pe-cf-body{padding:5px 6px;background:rgba(4,8,16,.93);flex:1;display:flex;flex-direction:column;gap:1px;border-top:1px solid rgba(255,255,255,.05);z-index:3}
.pe-cf-name{font-family:'DM Serif Display',serif;font-size:.78rem;line-height:1.05;letter-spacing:-.01em;color:var(--pe-ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pe-cf-team{font-family:'JetBrains Mono',monospace;font-size:.54rem;letter-spacing:.14em;text-transform:uppercase;color:var(--pe-ink-mute)}
.pe-cf-line{height:1px;margin:2px 0;opacity:.6}
.pe-cf-score-row{display:flex;align-items:baseline;gap:4px}
.pe-cf-score{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:.92rem;letter-spacing:.02em;line-height:1}
.pe-cf-ovr{font-family:'JetBrains Mono',monospace;font-size:.5rem;letter-spacing:.2em;color:var(--pe-ink-mute);text-transform:uppercase}
.pe-cf-acc{font-family:'Space Grotesk',sans-serif;font-size:.56rem;color:var(--pe-ink-mute);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* ═══ RARITY EFFECTS (unchanged from original) ═══ */
.pe-cm-scan{position:absolute;inset:0;background:linear-gradient(180deg,transparent,transparent 40%,rgba(200,120,60,.1) 50%,transparent 60%);animation:cm-scan 6s linear infinite;pointer-events:none;z-index:2}
@keyframes cm-scan{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}
.pe-cm-corner{position:absolute;width:10px;height:10px;border:1px solid rgba(200,120,60,.5);pointer-events:none;z-index:2}
.pe-cm-corner.tl{top:4px;left:4px;border-right:none;border-bottom:none}
.pe-cm-corner.tr{top:4px;right:4px;border-left:none;border-bottom:none}
.pe-cm-corner.bl{bottom:4px;left:4px;border-right:none;border-top:none}
.pe-cm-corner.br{bottom:4px;right:4px;border-left:none;border-top:none}
.pe-cm-heat{position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden}
.pe-cm-heat-wave{position:absolute;width:100%;height:3px;background:linear-gradient(90deg,transparent,rgba(200,120,60,.2),transparent);animation:heat 4s linear infinite}
.pe-cm-heat-wave:nth-child(1){top:20%;animation-delay:0s}
.pe-cm-heat-wave:nth-child(2){top:45%;animation-delay:1s}
.pe-cm-heat-wave:nth-child(3){top:70%;animation-delay:2s}
.pe-cm-heat-wave:nth-child(4){top:85%;animation-delay:3s}
@keyframes heat{0%{transform:translateX(-100%);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translateX(100%);opacity:0}}
.pe-cm-geo{position:absolute;inset:0;pointer-events:none;z-index:1}
.pe-cm-geo-line{position:absolute;background:rgba(200,120,60,.15)}
.pe-cm-geo-line:nth-child(1){top:15%;left:5%;width:20%;height:1px;transform:rotate(15deg)}
.pe-cm-geo-line:nth-child(2){top:30%;right:8%;width:15%;height:1px;transform:rotate(-25deg)}
.pe-cm-geo-line:nth-child(3){bottom:25%;left:10%;width:25%;height:1px;transform:rotate(-10deg)}
.pe-cm-geo-line:nth-child(4){bottom:15%;right:12%;width:18%;height:1px;transform:rotate(20deg)}
.pe-cm-scratch-layer{position:absolute;inset:0;pointer-events:none;z-index:2}
.pe-cm-scratch{position:absolute;background:rgba(200,120,60,.4);height:1px}
.pe-cm-scratch:nth-child(1){top:25%;left:15%;width:18%;transform:rotate(-20deg);animation:cm-scratch 5s ease-in-out infinite}
.pe-cm-scratch:nth-child(2){top:55%;right:18%;width:22%;transform:rotate(25deg);animation:cm-scratch 6s ease-in-out infinite .7s}
.pe-cm-scratch:nth-child(3){bottom:30%;left:12%;width:16%;transform:rotate(-15deg);animation:cm-scratch 4.5s ease-in-out infinite 1.4s}
@keyframes cm-scratch{0%,100%{opacity:0}50%{opacity:1}}
.pe-cm-ember-layer{position:absolute;inset:0;pointer-events:none;z-index:2}
.pe-cm-ember{position:absolute;width:2px;height:2px;border-radius:50%;background:#a06030;box-shadow:0 0 3px #a06030;animation:cm-ember 5s linear infinite}
.pe-cm-ember:nth-child(1){bottom:0;left:20%;animation-delay:0s}
.pe-cm-ember:nth-child(2){bottom:0;left:40%;animation-delay:1.2s}
.pe-cm-ember:nth-child(3){bottom:0;left:60%;animation-delay:2.4s}
.pe-cm-ember:nth-child(4){bottom:0;left:80%;animation-delay:3.2s}
.pe-cm-ember:nth-child(5){bottom:0;left:30%;animation-delay:4s}
@keyframes cm-ember{0%{transform:translateY(0);opacity:0}10%{opacity:1}100%{transform:translateY(-200px);opacity:0}}
.pe-cm-bottom-glow{position:absolute;bottom:0;left:0;right:0;height:30%;background:linear-gradient(0deg,rgba(200,120,60,.2),transparent);pointer-events:none;z-index:1}

.pe-ra-spin-wrap{position:absolute;inset:-8px;pointer-events:none;z-index:3}
.pe-ra-spin-arc{position:absolute;inset:0;border:2px solid transparent;border-top-color:rgba(66,192,248,.6);border-right-color:rgba(66,192,248,.3);border-radius:6px;animation:ra-spin 4s linear infinite}
.pe-ra-spin-inner{position:absolute;inset:4px;border:1px solid transparent;border-bottom-color:rgba(66,192,248,.4);border-left-color:rgba(66,192,248,.2);border-radius:4px;animation:ra-spin 3s linear infinite reverse}
@keyframes ra-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.pe-ra-depth-vig{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,.4) 100%);pointer-events:none;z-index:1}
.pe-ra-center-glow{position:absolute;inset:0;background:radial-gradient(circle at center,rgba(66,192,248,.25) 0%,transparent 50%);animation:ra-glow-pulse 3s ease-in-out infinite;pointer-events:none;z-index:1}
@keyframes ra-glow-pulse{0%,100%{opacity:.6}50%{opacity:1}}
.pe-ra-pulse-layer{position:absolute;inset:0;pointer-events:none;z-index:2}
.pe-ra-pulse-ring{position:absolute;inset:20%;border:1px solid rgba(66,192,248,.5);border-radius:50%;animation:ra-pulse 3s ease-out infinite}
.pe-ra-pulse-ring:nth-child(2){animation-delay:1s}
.pe-ra-pulse-ring:nth-child(3){animation-delay:2s}
@keyframes ra-pulse{0%{transform:scale(.5);opacity:0}50%{opacity:.8}100%{transform:scale(1.4);opacity:0}}
.pe-ra-crackle-layer{position:absolute;inset:0;pointer-events:none;z-index:2}
.pe-ra-crackle{position:absolute;inset:0}
.pe-ra-crackle:nth-child(1){animation:ra-crackle 6s linear infinite}
.pe-ra-crackle:nth-child(2){animation:ra-crackle 5s linear infinite 1.5s}
.pe-ra-crackle:nth-child(3){animation:ra-crackle 7s linear infinite 3s}
.pe-ra-crackle-path{fill:none;stroke:rgba(66,192,248,.8);stroke-width:1;filter:drop-shadow(0 0 3px #42c0f8)}
@keyframes ra-crackle{0%,90%,100%{opacity:0}92%,98%{opacity:1}}

.pe-ep-dual-wrap{position:absolute;inset:-10px;pointer-events:none;z-index:3}
.pe-ep-dual-arc1{position:absolute;inset:0;border:2px solid transparent;border-top-color:rgba(255,215,0,.85);border-right-color:rgba(255,215,0,.5);border-radius:6px;animation:ep-spin 5s linear infinite;box-shadow:0 0 12px rgba(255,215,0,.4)}
.pe-ep-dual-arc2{position:absolute;inset:3px;border:1px solid transparent;border-bottom-color:rgba(255,215,0,.75);border-left-color:rgba(255,215,0,.4);border-radius:4px;animation:ep-spin 4s linear infinite reverse;box-shadow:inset 0 0 8px rgba(255,215,0,.25)}
.pe-ep-dual-inner{position:absolute;inset:6px;border:1px solid rgba(255,215,0,.25);border-radius:3px;box-shadow:inset 0 0 6px rgba(255,215,0,.2)}
@keyframes ep-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.pe-ep-burst{position:absolute;inset:0;pointer-events:none;z-index:1;animation:ep-rotate 18s linear infinite}
.pe-ep-burst svg{width:100%;height:100%}
@keyframes ep-rotate{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.pe-ep-sparkle-layer{position:absolute;inset:0;pointer-events:none;z-index:3}
.pe-ep-sparkle{position:absolute;width:3px;height:3px;background:#ffd700;border-radius:50%;box-shadow:0 0 8px #ffd700,0 0 12px rgba(255,215,0,.7);animation:ep-twinkle 2s ease-in-out infinite}
.pe-ep-sparkle:nth-child(1){top:10%;left:15%;animation-delay:0s}
.pe-ep-sparkle:nth-child(2){top:25%;right:18%;animation-delay:.3s}
.pe-ep-sparkle:nth-child(3){top:55%;left:8%;animation-delay:.6s}
.pe-ep-sparkle:nth-child(4){bottom:35%;right:12%;animation-delay:.9s}
.pe-ep-sparkle:nth-child(5){bottom:15%;left:25%;animation-delay:1.2s}
.pe-ep-sparkle:nth-child(6){top:40%;right:30%;animation-delay:1.5s}
.pe-ep-sparkle:nth-child(7){bottom:20%;right:28%;animation-delay:1.8s}
@keyframes ep-twinkle{0%,100%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(1.4)}}
.pe-ep-foil{position:absolute;inset:0;background:linear-gradient(105deg,transparent 38%,rgba(255,215,0,.18) 48%,rgba(255,255,220,.35) 50%,rgba(255,215,0,.18) 52%,transparent 62%);animation:ep-foil 3s ease-in-out infinite;pointer-events:none;z-index:3}
@keyframes ep-foil{0%{transform:translateX(-120%)}50%{transform:translateX(120%)}100%{transform:translateX(120%)}}
.pe-ep-shine{position:absolute;inset:0;background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.15) 0%,transparent 50%);pointer-events:none;z-index:2}

.pe-le-plasma-wrap{position:absolute;inset:-14px;pointer-events:none;z-index:3}
.pe-le-plasma-arc1{position:absolute;inset:0;border:3px solid transparent;border-top-color:rgba(224,64,255,.9);border-right-color:rgba(224,64,255,.6);border-radius:8px;animation:le-spin 3.5s linear infinite;box-shadow:0 0 20px rgba(224,64,255,.6),0 0 40px rgba(224,64,255,.3)}
.pe-le-plasma-arc2{position:absolute;inset:4px;border:2px solid transparent;border-bottom-color:rgba(224,64,255,.8);border-left-color:rgba(224,64,255,.5);border-radius:6px;animation:le-spin 2.8s linear infinite reverse;box-shadow:inset 0 0 12px rgba(224,64,255,.4)}
.pe-le-plasma-inner{position:absolute;inset:8px;border:1px solid rgba(224,64,255,.3);border-radius:4px;box-shadow:inset 0 0 10px rgba(224,64,255,.3)}
@keyframes le-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.pe-le-aurora{position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden}
.pe-le-aurora-band{position:absolute;width:200%;height:60%;background:linear-gradient(90deg,transparent,rgba(224,64,255,.35),rgba(160,32,240,.25),transparent);animation:le-aurora 8s linear infinite}
.pe-le-aurora-band:nth-child(1){top:-20%;animation-delay:0s}
.pe-le-aurora-band:nth-child(2){top:20%;animation-delay:2s;animation-duration:6s}
.pe-le-aurora-band:nth-child(3){top:60%;animation-delay:4s;animation-duration:10s}
.pe-le-aurora-band:nth-child(4){top:100%;animation-delay:1s;animation-duration:7s}
@keyframes le-aurora{0%{transform:translateX(-60%)}100%{transform:translateX(60%)}}
.pe-le-orb-layer{position:absolute;inset:0;pointer-events:none;z-index:2}
.pe-le-orb{position:absolute;width:10px;height:10px;border-radius:50%;background:radial-gradient(circle,rgba(224,64,255,.9) 0%,rgba(160,32,240,.4) 50%,transparent 80%);filter:blur(2px);animation:le-orb 5s ease-in-out infinite}
.pe-le-orb:nth-child(1){top:15%;left:20%;animation-delay:0s}
.pe-le-orb:nth-child(2){top:35%;right:20%;animation-delay:1s}
.pe-le-orb:nth-child(3){top:60%;left:15%;animation-delay:2s}
.pe-le-orb:nth-child(4){bottom:25%;right:25%;animation-delay:3s}
.pe-le-orb:nth-child(5){bottom:10%;left:40%;animation-delay:4s}
@keyframes le-orb{0%,100%{opacity:0;transform:scale(.5) translateY(0)}50%{opacity:1;transform:scale(1.5) translateY(-15px)}}
.pe-le-holo{position:absolute;inset:0;background:linear-gradient(45deg,transparent 40%,rgba(224,64,255,.3) 45%,rgba(160,32,240,.4) 50%,rgba(255,64,192,.3) 55%,transparent 60%);background-size:200% 200%;animation:le-holo 4s linear infinite;pointer-events:none;z-index:2;mix-blend-mode:screen}
@keyframes le-holo{0%{background-position:0% 0%}100%{background-position:200% 200%}}
.pe-le-depth-rings{position:absolute;inset:0;pointer-events:none;z-index:1}
.pe-le-depth-ring{position:absolute;inset:20%;border:1px solid rgba(224,64,255,.4);border-radius:50%;animation:le-ring 4s ease-out infinite}
.pe-le-depth-ring:nth-child(2){animation-delay:1.3s}
.pe-le-depth-ring:nth-child(3){animation-delay:2.6s}
@keyframes le-ring{0%{transform:scale(.4);opacity:0}40%{opacity:.7}100%{transform:scale(1.8);opacity:0}}
.pe-le-bolt-layer{position:absolute;inset:0;pointer-events:none;z-index:3;overflow:hidden}
.pe-le-bolt{position:absolute;inset:0;width:100%;height:100%;opacity:0}
.pe-le-bolt.b1{animation:le-bolt 8s linear infinite}
.pe-le-bolt.b2{animation:le-bolt 7s linear infinite 2s}
.pe-le-bolt.b3{animation:le-bolt 9s linear infinite 4s}
.pe-le-bolt.b4{animation:le-bolt 6.5s linear infinite 1s}
.pe-le-bolt.b5{animation:le-bolt 8.5s linear infinite 3s}
.pe-le-bolt.b6{animation:le-bolt 7.5s linear infinite 5s}
.pe-le-bolt-glow{fill:none;stroke:rgba(224,64,255,.5);stroke-width:5;stroke-linecap:round;stroke-linejoin:round;filter:blur(3px)}
.pe-le-bolt-mid{fill:none;stroke:rgba(255,128,255,.85);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;filter:blur(1px)}
.pe-le-bolt-core{fill:none;stroke:#ffffff;stroke-width:1;stroke-linecap:round;stroke-linejoin:round}
.pe-le-bolt-branch{fill:none;stroke:rgba(255,200,255,.7);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;filter:blur(.5px)}
@keyframes le-bolt{0%,92%,100%{opacity:0}94%{opacity:1}96%{opacity:0}98%{opacity:1}}
.pe-le-tear-layer{position:absolute;inset:0;pointer-events:none;z-index:2}
.pe-le-tear{position:absolute;width:50px;height:50px;opacity:0;animation:le-tear 10s ease-in-out infinite}
.pe-le-tear:nth-child(1){top:20%;left:15%;animation-delay:0s}
.pe-le-tear:nth-child(2){top:50%;right:20%;animation-delay:3.3s}
.pe-le-tear:nth-child(3){bottom:25%;left:30%;animation-delay:6.6s}
.pe-le-tear-inner{width:100%;height:100%;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.9) 0%,rgba(224,64,255,.6) 40%,rgba(160,32,240,.3) 70%,transparent 100%);filter:blur(8px)}
@keyframes le-tear{0%,10%,85%,100%{opacity:0;transform:scale(.3)}40%,60%{opacity:1;transform:scale(1.6)}}
.pe-le-whiteout{position:absolute;inset:0;background:radial-gradient(circle,rgba(255,255,255,.8),transparent 60%);opacity:0;pointer-events:none;z-index:4}
.pe-le-whiteout.w1{animation:le-white 15s ease-in-out infinite 3s}
.pe-le-whiteout.w2{animation:le-white 15s ease-in-out infinite 8s}
.pe-le-whiteout.w3{animation:le-white 15s ease-in-out infinite 13s}
@keyframes le-white{0%,97%,100%{opacity:0}98%{opacity:1}}

.pe-imm-glow-1,.pe-imm-glow-2,.pe-imm-glow-3,.pe-imm-glow-4{position:absolute;border-radius:50%;pointer-events:none;z-index:0}
.pe-imm-glow-1{inset:-30px;background:radial-gradient(circle,rgba(40,220,120,.5) 0%,transparent 70%);filter:blur(15px);animation:imm-glow-p 3s ease-in-out infinite}
.pe-imm-glow-2{inset:-20px;background:radial-gradient(circle,rgba(40,220,120,.35) 0%,transparent 65%);filter:blur(10px);animation:imm-glow-p 3s ease-in-out infinite .5s}
.pe-imm-glow-3{inset:-15px;background:radial-gradient(circle,rgba(40,220,120,.3) 0%,transparent 60%);filter:blur(8px);animation:imm-glow-p 3.5s ease-in-out infinite 1s}
.pe-imm-glow-4{inset:-10px;background:radial-gradient(circle,rgba(40,220,120,.25) 0%,transparent 55%);filter:blur(6px);animation:imm-glow-p 4s ease-in-out infinite 1.5s}
@keyframes imm-glow-p{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}
.pe-imm-corner-arcs{position:absolute;inset:-6px;pointer-events:none;z-index:4}
.pe-imm-arc-glow{fill:none;stroke:rgba(40,220,120,.6);stroke-width:5;filter:blur(4px)}
.pe-imm-arc-line{fill:none;stroke:#28dc78;stroke-width:2;stroke-linecap:round;filter:drop-shadow(0 0 6px #28dc78)}
.pe-imm-arc-glow.a1,.pe-imm-arc-line.a1{stroke-dasharray:150;stroke-dashoffset:150;animation:imm-arc-draw 3s ease-in-out infinite}
.pe-imm-arc-glow.a2,.pe-imm-arc-line.a2{stroke-dasharray:150;stroke-dashoffset:150;animation:imm-arc-draw 3s ease-in-out infinite .75s}
.pe-imm-arc-glow.a3,.pe-imm-arc-line.a3{stroke-dasharray:150;stroke-dashoffset:150;animation:imm-arc-draw 3s ease-in-out infinite 1.5s}
.pe-imm-arc-glow.a4,.pe-imm-arc-line.a4{stroke-dasharray:150;stroke-dashoffset:150;animation:imm-arc-draw 3s ease-in-out infinite 2.25s}
@keyframes imm-arc-draw{0%{stroke-dashoffset:150}45%{stroke-dashoffset:0}55%{stroke-dashoffset:0}100%{stroke-dashoffset:-150}}
.pe-imm-plasma-wrap{position:absolute;inset:-16px;pointer-events:none;z-index:3}
.pe-imm-plasma-arc1{position:absolute;inset:0;border:3px solid transparent;border-top-color:rgba(40,220,120,.95);border-right-color:rgba(40,220,120,.6);border-radius:10px;animation:imm-spin 4s linear infinite;box-shadow:0 0 25px rgba(40,220,120,.7),0 0 50px rgba(40,220,120,.4)}
.pe-imm-plasma-arc2{position:absolute;inset:4px;border:2px solid transparent;border-bottom-color:rgba(40,220,120,.85);border-left-color:rgba(40,220,120,.55);border-radius:8px;animation:imm-spin 3s linear infinite reverse;box-shadow:inset 0 0 15px rgba(40,220,120,.5)}
.pe-imm-plasma-arc3{position:absolute;inset:8px;border:1px solid rgba(40,220,120,.6);border-radius:6px;box-shadow:inset 0 0 10px rgba(40,220,120,.4),0 0 10px rgba(40,220,120,.3)}
.pe-imm-plasma-inner{position:absolute;inset:12px;border:1px solid rgba(40,220,120,.3);border-radius:4px;box-shadow:inset 0 0 8px rgba(40,220,120,.3)}
@keyframes imm-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.pe-imm-slab-layer{position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden}
.pe-imm-slab{position:absolute;width:200%;height:4px;background:linear-gradient(90deg,transparent,rgba(40,220,120,.4),transparent);animation:imm-slab 6s linear infinite}
.pe-imm-slab:nth-child(1){top:15%;animation-delay:0s}
.pe-imm-slab:nth-child(2){top:30%;animation-delay:1.2s}
.pe-imm-slab:nth-child(3){top:50%;animation-delay:2.4s}
.pe-imm-slab:nth-child(4){top:70%;animation-delay:3.6s}
.pe-imm-slab:nth-child(5){top:85%;animation-delay:4.8s}
@keyframes imm-slab{0%{transform:translateX(-60%)}100%{transform:translateX(60%)}}
.pe-imm-aurora{position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden}
.pe-imm-aurora-band{position:absolute;width:200%;height:50%;background:linear-gradient(90deg,transparent,rgba(40,220,120,.4),rgba(20,180,80,.3),transparent);animation:imm-aurora 7s linear infinite}
.pe-imm-aurora-band:nth-child(1){top:-10%;animation-delay:0s}
.pe-imm-aurora-band:nth-child(2){top:25%;animation-delay:1.75s;animation-duration:5.5s}
.pe-imm-aurora-band:nth-child(3){top:55%;animation-delay:3.5s;animation-duration:8s}
.pe-imm-aurora-band:nth-child(4){top:85%;animation-delay:5.25s;animation-duration:6s}
@keyframes imm-aurora{0%{transform:translateX(-60%)}100%{transform:translateX(60%)}}
.pe-imm-rings{position:absolute;inset:0;pointer-events:none;z-index:1}
.pe-imm-ring{position:absolute;inset:20%;border:1px solid rgba(40,220,120,.45);border-radius:50%;animation:imm-ring 3.5s ease-out infinite}
.pe-imm-ring:nth-child(2){animation-delay:1.15s}
.pe-imm-ring:nth-child(3){animation-delay:2.3s}
@keyframes imm-ring{0%{transform:scale(.3);opacity:0}40%{opacity:.75}100%{transform:scale(2);opacity:0}}
.pe-imm-orb-layer{position:absolute;inset:0;pointer-events:none;z-index:2}
.pe-imm-orb{position:absolute;width:8px;height:8px;border-radius:50%;background:radial-gradient(circle,rgba(40,220,120,.95) 0%,rgba(20,160,80,.5) 50%,transparent 80%);filter:blur(2px);animation:imm-orb 4.5s ease-in-out infinite}
.pe-imm-orb:nth-child(1){top:10%;left:18%;animation-delay:0s}
.pe-imm-orb:nth-child(2){top:30%;right:22%;animation-delay:.7s}
.pe-imm-orb:nth-child(3){top:55%;left:12%;animation-delay:1.4s}
.pe-imm-orb:nth-child(4){top:70%;right:18%;animation-delay:2.1s}
.pe-imm-orb:nth-child(5){bottom:20%;left:35%;animation-delay:2.8s}
.pe-imm-orb:nth-child(6){bottom:8%;right:32%;animation-delay:3.5s}
@keyframes imm-orb{0%,100%{opacity:0;transform:scale(.5) translateY(0)}50%{opacity:1;transform:scale(1.6) translateY(-18px)}}
.pe-imm-holo{position:absolute;inset:0;background:linear-gradient(45deg,transparent 30%,rgba(40,220,120,.35) 40%,rgba(20,200,100,.45) 50%,rgba(40,220,120,.35) 60%,transparent 70%);background-size:250% 250%;animation:imm-holo 3s linear infinite;pointer-events:none;z-index:2;mix-blend-mode:screen}
@keyframes imm-holo{0%{background-position:0% 0%}100%{background-position:250% 250%}}
.pe-imm-foil{position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(40,220,120,.3) 45%,rgba(255,255,255,.5) 50%,rgba(40,220,120,.3) 55%,transparent 65%);animation:imm-foil 2s ease-in-out infinite;pointer-events:none;z-index:3}
@keyframes imm-foil{0%{transform:translateX(-120%)}50%{transform:translateX(120%)}100%{transform:translateX(120%)}}
.pe-imm-shock{position:absolute;inset:0;pointer-events:none;z-index:2}
.pe-imm-shock-ring{position:absolute;top:50%;left:50%;width:30px;height:30px;border:2px solid rgba(40,220,120,.7);border-radius:50%;transform:translate(-50%,-50%) scale(0);animation:imm-shock 3s ease-out infinite}
.pe-imm-shock-ring:nth-child(2){animation-delay:.75s}
.pe-imm-shock-ring:nth-child(3){animation-delay:1.5s}
.pe-imm-shock-ring:nth-child(4){animation-delay:2.25s}
.pe-imm-shock-core{position:absolute;top:50%;left:50%;width:4px;height:4px;border-radius:50%;background:#28dc78;box-shadow:0 0 12px #28dc78;transform:translate(-50%,-50%);animation:imm-core 2s ease-in-out infinite}
@keyframes imm-shock{0%{transform:translate(-50%,-50%) scale(0);opacity:1}100%{transform:translate(-50%,-50%) scale(6);opacity:0}}
@keyframes imm-core{0%,100%{opacity:.6;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.8)}}
.pe-imm-spark-layer{position:absolute;inset:0;pointer-events:none;z-index:3}
.pe-imm-spark{position:absolute;width:3px;height:3px;background:#28dc78;border-radius:50%;box-shadow:0 0 8px #28dc78,0 0 12px rgba(40,220,120,.6);animation:imm-spark 2s ease-in-out infinite}
.pe-imm-spark:nth-child(1){top:12%;left:20%;animation-delay:0s}
.pe-imm-spark:nth-child(2){top:22%;right:15%;animation-delay:.25s}
.pe-imm-spark:nth-child(3){top:48%;left:10%;animation-delay:.5s}
.pe-imm-spark:nth-child(4){bottom:40%;right:20%;animation-delay:.75s}
.pe-imm-spark:nth-child(5){bottom:25%;left:28%;animation-delay:1s}
.pe-imm-spark:nth-child(6){top:35%;right:30%;animation-delay:1.25s}
.pe-imm-spark:nth-child(7){bottom:18%;right:25%;animation-delay:1.5s}
.pe-imm-spark:nth-child(8){top:60%;left:40%;animation-delay:1.75s}
@keyframes imm-spark{0%,100%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(1.5)}}
.pe-imm-tear-layer{position:absolute;inset:0;pointer-events:none;z-index:2}
.pe-imm-tear{position:absolute;width:45px;height:45px;opacity:0;animation:imm-tear 8s ease-in-out infinite}
.pe-imm-tear:nth-child(1){top:18%;left:18%;animation-delay:0s}
.pe-imm-tear:nth-child(2){top:48%;right:18%;animation-delay:2.66s}
.pe-imm-tear:nth-child(3){bottom:22%;left:32%;animation-delay:5.33s}
.pe-imm-tear-inner{width:100%;height:100%;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.9) 0%,rgba(40,220,120,.6) 40%,rgba(20,160,80,.3) 70%,transparent 100%);filter:blur(7px)}
@keyframes imm-tear{0%,10%,85%,100%{opacity:0;transform:scale(.3)}40%,60%{opacity:1;transform:scale(1.8)}}
.pe-imm-shine{position:absolute;inset:0;background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.2) 0%,transparent 50%);pointer-events:none;z-index:2}
.pe-imm-shock-flash{position:absolute;inset:0;background:radial-gradient(circle,rgba(40,220,120,.4),transparent 60%);opacity:0;pointer-events:none;z-index:3;animation:imm-flash 5s ease-in-out infinite}
@keyframes imm-flash{0%,90%,100%{opacity:0}95%{opacity:.8}}
.pe-imm-inner-border{position:absolute;inset:3px;border:1px solid rgba(40,220,120,.3);border-radius:3px;pointer-events:none;z-index:1;box-shadow:inset 0 0 10px rgba(40,220,120,.2)}

/* ═══ RESPONSIVE ═══ */
@media(max-width:720px){
  .pe-nav{padding:1rem 1.25rem;gap:.75rem}
  .pe-nav-title{font-size:1.1rem}
  .pe-nav-id{font-size:.65rem;padding:.35rem .6rem}
  .pe-strip{padding:.55rem 1rem}
  .pe-sv{font-size:1.3rem}
  .pe-stier{font-size:.85rem}
}
@media(max-width:600px){
  .pe-cards-row{gap:10px}
  .pe-pack-img,.pe-fsl,.pe-card{width:100px;height:146px}
  .pe-card{min-width:100px}
  .pe-skill-spread{width:calc(100% + 180px);margin:0 -20px}
  .pe-pack-wrap{width:100px;height:146px}
  .pe-gate{padding:2.5rem 1.25rem}
}
@media(max-width:420px){
  .pe-pack-img,.pe-fsl,.pe-card{width:80px;height:117px}
  .pe-card{min-width:80px}
  .pe-fc-score,.pe-cf-score{font-size:.7rem}
  .pe-skill-spread{width:calc(100% + 80px);margin:0 -15px}
  .pe-pack-wrap{width:80px;height:117px}
  .pe-cf-art,.pe-fc-art{height:65px}
}
`;

function VersusDraftFallback() {
  return (
    <div style={{ minHeight:'100vh', background:'#141311', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontFamily:'JetBrains Mono,monospace', color:'#7d7463', letterSpacing:'.2em', fontSize:'.72rem', textTransform:'uppercase', fontWeight:700 }}>
        Loading —
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