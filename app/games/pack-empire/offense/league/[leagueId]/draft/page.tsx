'use client';
// nfl-minigames-hub/app/games/pack-empire/offense/league/[leagueId]/draft/page.tsx
 
import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getLeague, getMyMembership, getMyDraft, submitDraft as dbSubmitDraft } from '@/lib/league/db';
import { leagueWeightedDraw, packsForWeek, PLAYOFF_PACK_COUNT, PACK_TIER_LABELS, PACK_TIER_COLORS } from '@/lib/league/packs';
import type { PackTier } from '@/lib/league/packs';
import { calculateChemistry, finalScore, chemistryLabel } from '@/lib/league';
 
import { ALL_PLAYERS }    from '@/lib/packs/current-offense-qb';
import { ALL_PLAYERS_V2 } from '@/lib/packs/current-offense-rb';
import { ALL_PLAYERS_V3 } from '@/lib/packs/current-offense-wr';
import { ALL_PLAYERS_V4 } from '@/lib/packs/current-offense-te';
import { ALL_PLAYERS_V5 } from '@/lib/packs/current-offense-ot';
import { ALL_PLAYERS_V6 } from '@/lib/packs/current-offense-iol';
import { ALL_PLAYERS_V7 } from '@/lib/packs/legend-offense';
 
function parseCSVRow(row: string): string[] {
  const cols: string[] = []; let cur = ''; let inQ = false;
  for (const c of row) { if (c === '"') { inQ = !inQ; continue; } if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; } cur += c; }
  cols.push(cur.trim()); return cols;
}
 
/* ─── Types ──────────────────────────────────────────────────────────── */
type Rarity = 'common' | 'rare' | 'dynasty' | 'transcendent' | 'immortal';
type Phase = 'loading' | 'boosted_pick' | 'packing' | 'complete';
 
interface Player {
  id: string; name: string; pos: string; team: string;
  score: number; rarity: Rarity; accolades: string[];
}
 
/* ─── Rarity config — same visual system, now themed to crimson palette ─ */
const RC: Record<Rarity, { label: string; color: string; glow: string; art: string; shimmer: string }> = {
  common:       { label: 'COMMON',       color: '#c87840', glow: 'rgba(200,120,60,.6)',   art: 'linear-gradient(150deg,#3d2210,#7a4820)', shimmer: '#a06030' },
  rare:         { label: 'RARE',         color: '#42c0f8', glow: 'rgba(66,192,248,.7)',   art: 'linear-gradient(150deg,#062840,#104870)', shimmer: '#2890d8' },
  dynasty:      { label: 'DYNASTY',      color: '#ffd700', glow: 'rgba(255,215,0,.8)',    art: 'linear-gradient(150deg,#3a2800,#806010)', shimmer: '#c8a020' },
  transcendent: { label: 'TRANSCENDENT', color: '#e040ff', glow: 'rgba(224,64,255,.85)',  art: 'linear-gradient(150deg,#280048,#6010b0)', shimmer: '#c020f0' },
  immortal:     { label: 'IMMORTAL',     color: '#28dc78', glow: 'rgba(40,220,120,.8)',   art: 'linear-gradient(150deg,#021a0a,#04401a)', shimmer: '#20a050' },
};
 
/* ─── Player pool ────────────────────────────────────────────────────── */
const POOL: Record<string, Player[]> = (() => {
  const keys = ['QB','RB','WR','TE','OT','OG','C'] as const;
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
  { key: 'QB',  label: 'Quarterback',   short: 'QB',  pool: 'QB' },
  { key: 'RB',  label: 'Running Back',  short: 'RB',  pool: 'RB' },
  { key: 'WR1', label: 'Wide Receiver', short: 'WR',  pool: 'WR' },
  { key: 'WR2', label: 'Wide Receiver', short: 'WR',  pool: 'WR' },
  { key: 'WR3', label: 'Wide Receiver', short: 'WR',  pool: 'WR' },
  { key: 'TE',  label: 'Tight End',     short: 'TE',  pool: 'TE' },
  { key: 'LT',  label: 'Left Tackle',   short: 'LT',  pool: 'OT' },
  { key: 'LG',  label: 'Left Guard',    short: 'LG',  pool: 'OG' },
  { key: 'C',   label: 'Center',        short: 'C',   pool: 'C'  },
  { key: 'RG',  label: 'Right Guard',   short: 'RG',  pool: 'OG' },
  { key: 'RT',  label: 'Right Tackle',  short: 'RT',  pool: 'OT' },
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
 
/* ─── Rarity effects (imported from offense — same components) ──────── */
// Re-use your existing RarityEffects component here in your actual codebase.
// For this file we inline a lightweight placeholder that calls the same CSS classes.
function RarityEffects({ rarity, position = 'inner' }: { rarity: Rarity; position?: 'outer' | 'inner' }) {
  if (position === 'outer') {
    return (
      <>
        {rarity === 'rare' && (
          <div className="pe-ra-spin-wrap">
            <div className="pe-ra-spin-arc"/><div className="pe-ra-spin-inner"/>
          </div>
        )}
        {rarity === 'dynasty' && (
          <div className="pe-ep-dual-wrap">
            <div className="pe-ep-dual-arc1"/><div className="pe-ep-dual-arc2"/><div className="pe-ep-dual-inner"/>
          </div>
        )}
        {rarity === 'transcendent' && (
          <div className="pe-le-plasma-wrap">
            <div className="pe-le-plasma-arc1"/><div className="pe-le-plasma-arc2"/><div className="pe-le-plasma-inner"/>
          </div>
        )}
        {rarity === 'immortal' && <>
          <div className="pe-imm-glow-1"/><div className="pe-imm-glow-2"/>
          <div className="pe-imm-glow-3"/><div className="pe-imm-glow-4"/>
          <div className="pe-imm-corner-arcs">
            <svg viewBox="0 0 125 183" xmlns="http://www.w3.org/2000/svg"
                 style={{position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible'} as React.CSSProperties}>
              <path className="pe-imm-arc-glow a1" d="M -6,34 Q -6,-6 34,-6"/>
              <path className="pe-imm-arc-line a1" d="M -6,34 Q -6,-6 34,-6"/>
              <path className="pe-imm-arc-glow a2" d="M 91,-6 Q 131,-6 131,34"/>
              <path className="pe-imm-arc-line a2" d="M 91,-6 Q 131,-6 131,34"/>
              <path className="pe-imm-arc-glow a3" d="M 131,149 Q 131,189 91,189"/>
              <path className="pe-imm-arc-line a3" d="M 131,149 Q 131,189 91,189"/>
              <path className="pe-imm-arc-glow a4" d="M 34,189 Q -6,189 -6,149"/>
              <path className="pe-imm-arc-line a4" d="M 34,189 Q -6,189 -6,149"/>
            </svg>
          </div>
          <div className="pe-imm-plasma-wrap">
            <div className="pe-imm-plasma-arc1"/><div className="pe-imm-plasma-arc2"/>
            <div className="pe-imm-plasma-arc3"/><div className="pe-imm-plasma-inner"/>
          </div>
        </>}
      </>
    );
  }

  return (
    <>
      {rarity === 'common' && <>
        <div className="pe-cm-scan"/>
        <div className="pe-cm-heat">
          <div className="pe-cm-heat-wave"/><div className="pe-cm-heat-wave"/>
          <div className="pe-cm-heat-wave"/><div className="pe-cm-heat-wave"/>
        </div>
        <div className="pe-cm-geo">
          <div className="pe-cm-geo-line"/><div className="pe-cm-geo-line"/>
          <div className="pe-cm-geo-line"/><div className="pe-cm-geo-line"/>
        </div>
        <div className="pe-cm-scratch-layer">
          <div className="pe-cm-scratch"/><div className="pe-cm-scratch"/><div className="pe-cm-scratch"/>
        </div>
        <div className="pe-cm-ember-layer">
          <div className="pe-cm-ember"/><div className="pe-cm-ember"/><div className="pe-cm-ember"/>
          <div className="pe-cm-ember"/><div className="pe-cm-ember"/>
        </div>
        <div className="pe-cm-bottom-glow"/>
      </>}

      {rarity === 'rare' && <>
        <div className="pe-ra-depth-vig"/>
        <div className="pe-ra-center-glow"/>
        <div className="pe-ra-pulse-layer">
          <div className="pe-ra-pulse-ring"/><div className="pe-ra-pulse-ring"/><div className="pe-ra-pulse-ring"/>
        </div>
        <div className="pe-ra-crackle-layer">
          <div className="pe-ra-crackle">
            <svg width="100%" height="100%" viewBox="0 0 125 183">
              <polyline className="pe-ra-crackle-path" points="0,18 12,20 8,28 22,24 16,34"/>
              <polyline className="pe-ra-crackle-path" points="113,88 121,84 117,94 125,90"/>
            </svg>
          </div>
          <div className="pe-ra-crackle">
            <svg width="100%" height="100%" viewBox="0 0 125 183">
              <polyline className="pe-ra-crackle-path" points="0,62 12,58 8,68 20,64 14,76"/>
              <polyline className="pe-ra-crackle-path" points="109,14 119,18 115,28 123,22"/>
            </svg>
          </div>
          <div className="pe-ra-crackle">
            <svg width="100%" height="100%" viewBox="0 0 125 183">
              <polyline className="pe-ra-crackle-path" points="2,108 14,104 10,114 24,108"/>
              <polyline className="pe-ra-crackle-path" points="105,50 115,46 111,58 121,52 117,64"/>
            </svg>
          </div>
        </div>
      </>}

      {rarity === 'dynasty' && <>
        <div className="pe-ep-burst">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(100,100)">
              <line x1="0" y1="-95" x2="0" y2="95" stroke="rgba(255,215,0,.35)" strokeWidth=".8"/>
              <line x1="-95" y1="0" x2="95" y2="0" stroke="rgba(255,215,0,.35)" strokeWidth=".8"/>
              <line x1="-67" y1="-67" x2="67" y2="67" stroke="rgba(255,215,0,.25)" strokeWidth=".8"/>
              <line x1="67" y1="-67" x2="-67" y2="67" stroke="rgba(255,215,0,.25)" strokeWidth=".8"/>
            </g>
          </svg>
        </div>
        <div className="pe-ep-sparkle-layer">
          <div className="pe-ep-sparkle"/><div className="pe-ep-sparkle"/><div className="pe-ep-sparkle"/>
          <div className="pe-ep-sparkle"/><div className="pe-ep-sparkle"/><div className="pe-ep-sparkle"/>
          <div className="pe-ep-sparkle"/>
        </div>
        <div className="pe-ep-foil"/>
        <div className="pe-ep-shine"/>
      </>}

      {rarity === 'transcendent' && <>
        <div className="pe-le-aurora">
          <div className="pe-le-aurora-band"/><div className="pe-le-aurora-band"/>
          <div className="pe-le-aurora-band"/><div className="pe-le-aurora-band"/>
        </div>
        <div className="pe-le-orb-layer">
          <div className="pe-le-orb"/><div className="pe-le-orb"/><div className="pe-le-orb"/>
          <div className="pe-le-orb"/><div className="pe-le-orb"/>
        </div>
        <div className="pe-le-holo"/>
        <div className="pe-le-depth-rings">
          <div className="pe-le-depth-ring"/><div className="pe-le-depth-ring"/><div className="pe-le-depth-ring"/>
        </div>
        <div className="pe-le-bolt-layer">
          <svg className="pe-le-bolt b1" viewBox="0 0 125 183"><polyline className="pe-le-bolt-glow" points="8,2 20,28 10,27 26,58 14,56 32,98"/><polyline className="pe-le-bolt-mid" points="8,2 20,28 10,27 26,58 14,56 32,98"/><polyline className="pe-le-bolt-core" points="8,2 20,28 10,27 26,58 14,56 32,98"/><polyline className="pe-le-bolt-branch" points="26,58 40,68 34,82"/></svg>
          <svg className="pe-le-bolt b2" viewBox="0 0 125 183"><polyline className="pe-le-bolt-glow" points="36,0 50,30 38,28 56,62 42,60 62,110"/><polyline className="pe-le-bolt-mid" points="36,0 50,30 38,28 56,62 42,60 62,110"/><polyline className="pe-le-bolt-core" points="36,0 50,30 38,28 56,62 42,60 62,110"/><polyline className="pe-le-bolt-branch" points="56,62 70,74 62,90"/></svg>
          <svg className="pe-le-bolt b3" viewBox="0 0 125 183"><polyline className="pe-le-bolt-glow" points="88,2 100,30 88,28 106,62 92,60 112,104"/><polyline className="pe-le-bolt-mid" points="88,2 100,30 88,28 106,62 92,60 112,104"/><polyline className="pe-le-bolt-core" points="88,2 100,30 88,28 106,62 92,60 112,104"/><polyline className="pe-le-bolt-branch" points="106,62 118,76 110,92"/></svg>
        </div>
        <div className="pe-le-tear-layer">
          <div className="pe-le-tear"><div className="pe-le-tear-inner"/></div>
          <div className="pe-le-tear"><div className="pe-le-tear-inner"/></div>
          <div className="pe-le-tear"><div className="pe-le-tear-inner"/></div>
        </div>
        <div className="pe-le-whiteout w1"/>
        <div className="pe-le-whiteout w2"/>
        <div className="pe-le-whiteout w3"/>
      </>}

      {rarity === 'immortal' && <>
        <div className="pe-imm-slab-layer">
          <div className="pe-imm-slab"/><div className="pe-imm-slab"/><div className="pe-imm-slab"/>
          <div className="pe-imm-slab"/><div className="pe-imm-slab"/>
        </div>
        <div className="pe-imm-aurora">
          <div className="pe-imm-aurora-band"/><div className="pe-imm-aurora-band"/>
          <div className="pe-imm-aurora-band"/><div className="pe-imm-aurora-band"/>
        </div>
        <div className="pe-imm-rings">
          <div className="pe-imm-ring"/><div className="pe-imm-ring"/><div className="pe-imm-ring"/>
        </div>
        <div className="pe-imm-orb-layer">
          <div className="pe-imm-orb"/><div className="pe-imm-orb"/><div className="pe-imm-orb"/>
          <div className="pe-imm-orb"/><div className="pe-imm-orb"/><div className="pe-imm-orb"/>
        </div>
        <div className="pe-imm-holo"/>
        <div className="pe-imm-foil"/>
        <div className="pe-imm-shock">
          <div className="pe-imm-shock-ring"/><div className="pe-imm-shock-ring"/>
          <div className="pe-imm-shock-ring"/><div className="pe-imm-shock-ring"/>
          <div className="pe-imm-shock-core"/>
        </div>
        <div className="pe-imm-spark-layer">
          <div className="pe-imm-spark"/><div className="pe-imm-spark"/><div className="pe-imm-spark"/>
          <div className="pe-imm-spark"/><div className="pe-imm-spark"/><div className="pe-imm-spark"/>
          <div className="pe-imm-spark"/><div className="pe-imm-spark"/>
        </div>
        <div className="pe-imm-tear-layer">
          <div className="pe-imm-tear"><div className="pe-imm-tear-inner"/></div>
          <div className="pe-imm-tear"><div className="pe-imm-tear-inner"/></div>
          <div className="pe-imm-tear"><div className="pe-imm-tear-inner"/></div>
        </div>
        <div className="pe-imm-shine"/>
        <div className="pe-imm-shock-flash"/>
        <div className="pe-imm-inner-border"/>
      </>}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════ */
export default function LeagueDraftPage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const router = useRouter();
 
  /* ── League state ── */
  const [leagueName, setLeagueName]   = useState('');
  const [weekNumber, setWeekNumber]   = useState(1);
  const [leaguePhase, setLeaguePhase] = useState('regular');
  const [myMemberId, setMyMemberId]   = useState('');
  const [myUserId, setMyUserId]       = useState('');
  const [myPackTier, setMyPackTier]   = useState<PackTier>('standard_pack');
  const [lockedPlayers, setLockedPlayers] = useState<Player[]>([]);
  const [totalPackCount, setTotalPackCount] = useState(11);
  const [alreadyDrafted, setAlreadyDrafted] = useState(false);
 
  /* ── Boosted pack position picker ── */
  const [boostedPos, setBoostedPos]   = useState<string | null>(null);   // pool key e.g. 'QB'
  const [boostedPicked, setBoostedPicked] = useState(false);
 
  /* ── Draft state ── */
  const [phase, setPhase]             = useState<Phase>('loading');
  const [lineup, setLineup]           = useState<(Player | null)[]>(Array(11).fill(null));
  const [packSi, setPackSi]           = useState<number | null>(null);
  const [packCards, setPackCards]     = useState<Player[]>([]);
  const [revealed, setRevealed]       = useState<boolean[]>([]);
  const [pickedId, setPickedId]       = useState<string | null>(null);
  const [immFlash, setImmFlash]       = useState(false);
  const [imageMap, setImageMap]       = useState<Record<string, string>>({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitDone, setSubmitDone]   = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);
 
  /* ── Load league + player images ── */
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      setMyUserId(user.id);
 
      const [league, membership] = await Promise.all([
        getLeague(leagueId),
        getMyMembership(leagueId, user.id),
      ]);
 
      if (!league || !membership) { router.replace(`/games/pack-empire/offense/league/${leagueId}`); return; }
      if (league.phase === 'pregame') { router.replace(`/games/pack-empire/offense/league/${leagueId}`); return; }
 
      setLeagueName(league.name);
      setWeekNumber(league.current_week);
      setLeaguePhase(league.phase);
      setMyMemberId(membership.id);
      setMyPackTier(membership.next_pack_tier);
      setLockedPlayers((membership.permanent_locks as Player[]) ?? []);
 
      const isPlayoff = league.phase === 'gauntlet' || league.phase === 'finals';
      const packCount = isPlayoff ? PLAYOFF_PACK_COUNT : packsForWeek(league.current_week);
      setTotalPackCount(packCount);
 
      // Check if already drafted this week
      const existing = await getMyDraft(leagueId, membership.id, league.current_week, league.phase);
      if (existing) { setAlreadyDrafted(true); setPhase('complete'); return; }
 
      // Restore in-progress draft if exists — prevents refreshing to reroll packs
      const supabase2 = createClient();
      const { data: progress } = await supabase2
        .from('league_draft_progress')
        .select('*')
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
        .eq('week_number', league.current_week)
        .eq('phase', league.phase)
        .single();
 
      if (progress) {
        const restoredLineup = (progress.lineup as (Player|null)[]) ?? Array(11).fill(null);
        setLineup(restoredLineup);
        setBoostedPicked(progress.boosted_picked ?? false);
        if (progress.boosted_pos) setBoostedPos(progress.boosted_pos);
        // If they had a pack open, restore those exact cards
        if (progress.open_pack_si !== null && progress.open_pack_cards?.length) {
          setPackSi(progress.open_pack_si);
          setPackCards(progress.open_pack_cards as Player[]);
          setRevealed(Array(progress.open_pack_cards.length).fill(false));
        }
        const filledCount = restoredLineup.filter(Boolean).length;
        if (filledCount < 11) {
          setPhase(progress.boosted_picked || isPlayoff ? 'packing' : 
            (membership.next_pack_tier === 'standard_pack' ? 'packing' : 'boosted_pick'));
        }
        return;
      }
 
      // Pre-fill locked players into lineup for regular season
      if (!isPlayoff && (membership.permanent_locks as Player[]).length > 0) {
        const locks = membership.permanent_locks as Player[];
        const newLineup = Array(11).fill(null) as (Player | null)[];
        for (const lp of locks) {
          const si = SLOTS.findIndex((slot, idx) => slot.pool === lp.pos && newLineup[idx] === null);
          if (si !== -1) newLineup[si] = lp;
        }
        setLineup(newLineup);
      }
 
      // Skip boosted picker if tier is standard or already in playoffs
      if (membership.next_pack_tier === 'standard_pack' || isPlayoff) {
        setBoostedPicked(true);
        setPhase('packing');
      } else {
        setPhase('boosted_pick');
      }
    })();
  }, [leagueId]);
 
  useEffect(() => {
  fetch('/players.csv')
    .then(r => r.ok ? r.text() : Promise.reject())
    .then(text => {
      const map: Record<string, string> = {};
      text.split('\n').forEach(line => {
        if (!line.trim()) return;
        const cols = parseCSVRow(line);
        const name = cols[1];
        const url = cols[22];
        if (name && url && url.startsWith('http')) map[name] = url;
      });
      setImageMap(map);  // ← this line was missing before
    })
    .catch(() => {});
}, []);
 
  /* ── Pack opening ── */
  const isBusy      = packCards.length > 0;
  const filled      = lineup.filter(Boolean).length;
  const totalScore  = lineup.reduce((s, p) => s + (p?.score ?? 0), 0);
  const tier        = getTier(totalScore);
  const hiddenCount = revealed.filter(r => !r).length;
  const anyRevealed = revealed.some(Boolean);
  const openSlotsLeft = 11 - filled; // includes locked (already filled) and open
 
  function isBoostedSlot(si: number): boolean {
    return boostedPos !== null && SLOTS[si].key === boostedPos;
  }
 
  function isLockedSlot(si: number): boolean {
    return lockedPlayers.some(lp => lp.id === lineup[si]?.id);
  }
 
  const openPack = useCallback((si: number, curLineup: (Player | null)[]) => {
    const excl = curLineup.filter(Boolean).map(p => p!.id);
    const poolKey = SLOTS[si].pool;
    const useBoostedTier = isBoostedSlot(si);
    const tier: PackTier = useBoostedTier ? myPackTier : 'standard_pack';
    const pool = POOL[poolKey] ?? [];
    const cards = leagueWeightedDraw(pool, 5, tier, excl);
 
    setPackSi(si); setPackCards(cards);
    setRevealed(Array(cards.length).fill(false)); setPickedId(null);
    // Save pack state immediately — player can't refresh to reroll
    saveProgress({ lineup, packSi: si, packCards: cards });
 
    if (cards.some(c => c.rarity === 'immortal')) {
      setTimeout(() => { setImmFlash(true); setTimeout(() => setImmFlash(false), 2400); }, 300);
    }
    setTimeout(() => cardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }, [myPackTier, boostedPos, lineup]);
 
  const clickSlot = useCallback((si: number) => {
    if (isBusy || pickedId !== null) return;
    if (isLockedSlot(si)) return; // locked — can't reopen
    openPack(si, lineup);
  }, [isBusy, pickedId, lineup, openPack]);
 
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
        // Mark boosted slot as used
        if (isBoostedSlot(packSi!)) setBoostedPicked(true);
        if (n.filter(Boolean).length === 11) setPhase('complete');
        return n;
      });
      setPackCards([]); setRevealed([]); setPickedId(null); setPackSi(null);
      // Save updated lineup — player can't refresh to undo pick
      setLineup(prev2 => {
        saveProgress({ lineup: prev2, packSi: null, packCards: [] });
        return prev2;
      });
    }, 650);
  }, [pickedId, revealed, revealOne, packCards, packSi, boostedPos]);
 
  /* ── Submit draft to Supabase ── */
  const handleSubmit = useCallback(async () => {
    if (submitting || submitDone) return;
    setSubmitting(true);
    try {
      const roster = lineup.filter(Boolean) as Player[];
      const chem = calculateChemistry(roster);
      const draftScore = totalScore;
      const fs = finalScore(draftScore, chem);
 
      await dbSubmitDraft({
        leagueId,
        memberId: myMemberId,
        userId: myUserId,
        weekNumber,
        phase: leaguePhase,
        roster,
        lockedPlayerIds: lockedPlayers.map(p => p.id),
        draftScore,
        chemistry: chem,
        finalScore: fs,
        packTierEarned: myPackTier,
      });
      setSubmitDone(true);
      // Clear progress — draft is officially submitted
      const supabase3 = createClient();
      await supabase3.from('league_draft_progress')
        .delete()
        .eq('league_id', leagueId)
        .eq('user_id', myUserId)
        .eq('week_number', weekNumber)
        .eq('phase', leaguePhase);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, submitDone, lineup, totalScore, leagueId, myMemberId, myUserId, weekNumber, leaguePhase, lockedPlayers, myPackTier]);
 
  /* ── Draft progress persistence ── */
  const saveProgress = useCallback(async (params: {
    lineup: (Player|null)[];
    packSi?: number|null;
    packCards?: Player[];
    boostedPicked?: boolean;
    boostedPos?: string|null;
  }) => {
    if (!myMemberId || !myUserId || !leagueId) return;
    const supabase = createClient();
    await supabase.from('league_draft_progress').upsert({
      league_id: leagueId,
      member_id: myMemberId,
      user_id: myUserId,
      week_number: weekNumber,
      phase: leaguePhase,
      lineup: params.lineup,
      open_pack_si: params.packSi ?? null,
      open_pack_cards: params.packCards ?? null,
      boosted_picked: params.boostedPicked ?? boostedPicked,
      boosted_pos: params.boostedPos ?? boostedPos,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'league_id,user_id,week_number,phase' });
  }, [myMemberId, myUserId, leagueId, weekNumber, leaguePhase, boostedPicked, boostedPos]);
 
  /* ── Chemistry for display ── */
  const chemResult = calculateChemistry(lineup.filter(Boolean) as Player[]);
 
  /* ── Slot rendering ── */
  const FSlot = ({ si }: { si: number }) => {
    const player   = lineup[si];
    const isAct    = packSi === si;
    const locked   = isLockedSlot(si);
    const boosted  = isBoostedSlot(si) && !boostedPicked && !player;
    const canOpen  = !player && !isAct && !isBusy && phase === 'packing';
    const rc       = player ? RC[player.rarity] : null;
    const imgSrc   = player ? imageMap[player.name] : undefined;
 
    return (
      <div className="ldr-slot-outer">
        {player ? (
          <div className={`ldr-fsl has-p${locked ? ' is-locked' : ''}`}
            style={{ '--rc': rc!.color, '--rg': rc!.glow, '--art': rc!.art } as React.CSSProperties}>
            <RarityEffects rarity={player.rarity} position="outer" />
            {locked && (
              <div className="ldr-lock-plasma-wrap">
              <div className="ldr-lock-plasma-arc1"/>
              <div className="ldr-lock-plasma-arc2"/>
              <div className="ldr-lock-plasma-arc3"/>
              <div className="ldr-lock-plasma-arc4"/>
              <div className="ldr-lock-plasma-inner"/>
              </div>
            )}
            <div className="ldr-filled-card">
              <div className="ldr-fc-topbar">
                <div className="ldr-fc-pos-badge" style={{ background: rc!.color }}>{player.pos}</div>
                <div className="ldr-fc-rar-badge" style={{ color: rc!.color }}>{rc!.label}</div>
              </div>
              <div className="ldr-fc-art" style={{ background: rc!.art }}>
                <div className="ldr-fc-field-lines" />
                <RarityEffects rarity={player.rarity} position="inner" />
                {imgSrc && <img src={imgSrc} alt={player.name} className="ldr-fc-img" onError={e => (e.currentTarget.style.display = 'none')} />}
                <div className="ldr-fc-initial">{player.name.charAt(0)}</div>
              </div>
              <div className="ldr-fc-info">
                <div className="ldr-fc-name" style={{ color: rc!.color }}>
                  {(() => {
                    const parts = player.name.trim().split(' ');
                    const suffixes = new Set(['jr.','jr','sr.','sr','ii','iii','iv','v']);
                    const last = parts[parts.length - 1];
                    const isS = suffixes.has(last.toLowerCase());
                    return (isS && parts.length >= 3) ? `${parts[parts.length - 2]} ${last}` : last;
                  })()}
                </div>
                <div className="ldr-fc-score">{player.score.toLocaleString()}</div>
                <div className="ldr-fc-team-tag">{player.team}</div>
              </div>
              {locked && <div className="ldr-fc-lock-overlay" />}
              <div className="ldr-fc-shine" />
            </div>
            {locked && <div className="ldr-fc-lock-badge">🔒 LOCKED</div>}
          </div>
        ) : isAct ? (
          <div className="ldr-fsl active">
            <div className="ldr-fsl-pos-small">{SLOTS[si].short}</div>
            <div className="ldr-fsl-opening">…</div>
          </div>
        ) : (
          <div
            className={`ldr-pack-wrap${boosted ? ' boosted' : ''}${canOpen ? ' clickable' : ''}`}
            style={boosted ? {
              '--boost-glow-lo': `drop-shadow(0 0 8px ${PACK_TIER_COLORS[myPackTier]}99)`,
              '--boost-glow-hi': `drop-shadow(0 0 18px ${PACK_TIER_COLORS[myPackTier]}) drop-shadow(0 0 32px ${PACK_TIER_COLORS[myPackTier]}66)`,
            } as React.CSSProperties : undefined}
            onClick={() => canOpen ? clickSlot(si) : undefined}
            role={canOpen ? 'button' : undefined}
            tabIndex={canOpen ? 0 : undefined}
          >
            <img src={PACK_IMG[SLOTS[si].pool]} alt={SLOTS[si].short} className="ldr-pack-img" />
          </div>
        )}
        {boosted && (
          <div className="ldr-pack-boosted-badge" style={{ color: PACK_TIER_COLORS[myPackTier] }}>
            {PACK_TIER_LABELS[myPackTier]}
          </div>
        )}
        <div className={`ldr-slot-label${locked ? ' locked' : ''}${boosted ? ' boosted-label' : ''}`}>
          {locked ? '🔒 ' : ''}{SLOTS[si].short}
        </div>
      </div>
    );
  };
 
  const FormRow = ({ indices }: { indices: readonly number[] }) => (
    <div className="ldr-form-row">
      {indices.map(si => <FSlot key={SLOTS[si].key} si={si} />)}
    </div>
  );
 
  const FieldLayout = () => (
    <div className="ldr-field">
      <FormRow indices={OL_ROW} />
      <div className="ldr-skill-spread">
        <div className="ldr-skill-side">{WR_LEFT.map(si => <FSlot key={SLOTS[si].key} si={si} />)}</div>
        <div className="ldr-skill-side">{WR_RIGHT.map(si => <FSlot key={SLOTS[si].key} si={si} />)}</div>
      </div>
      <FormRow indices={QB_ROW} />
    </div>
  );
 
  /* ══════════════════ RENDER ══════════════════ */
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LEAGUE_DRAFT_STYLES }} />
 
      {immFlash && (
        <div className="ldr-imm-flash" aria-hidden="true">
          <div className="ldr-imm-text">💎 IMMORTAL PULL!</div>
        </div>
      )}
 
      {/* Nav */}
      <nav className="ldr-nav">
        <Link href={`/games/pack-empire/offense/league/${leagueId}`} className="ldr-back">
          ← {leagueName || 'League'}
        </Link>
        <div className="ldr-nav-c">
          <span className="ldr-nav-dot" />
          {leaguePhase === 'regular' ? `WEEK ${weekNumber}` : leaguePhase.toUpperCase()}
        </div>
        <div className="ldr-pack-tier-pill" style={{ color: PACK_TIER_COLORS[myPackTier] }}>
          {PACK_TIER_LABELS[myPackTier]}
        </div>
      </nav>
 
      {/* Score strip */}
      {(phase === 'packing' || phase === 'complete') && (
        <div className="ldr-strip">
          <div className="ldr-sg">
            <div className="ldr-sv" style={{ color: tier.color }}>{totalScore.toLocaleString()}</div>
            <div className="ldr-sl">DRAFT SCORE</div>
          </div>
          <div className="ldr-sdiv" />
          <div className="ldr-sg">
            <div className="ldr-sv" style={{ color: chemResult.totalChemPoints >= 0 ? '#ff6b35' : '#cc2200' }}>
              {chemResult.totalChemPoints >= 0 ? '+' : ''}{chemResult.totalChemPoints.toLocaleString()}
            </div>
            <div className="ldr-sl">CHEMISTRY</div>
          </div>
          <div className="ldr-sdiv" />
          <div className="ldr-sg">
            <div className="ldr-sv" style={{ color: '#ff6b35' }}>
              {(totalScore + chemResult.totalChemPoints).toLocaleString()}
            </div>
            <div className="ldr-sl">FINAL SCORE</div>
          </div>
          <div className="ldr-sdiv" />
          <div className="ldr-sg">
            <div className="ldr-sv">{filled}<span className="ldr-sof">/11</span></div>
            <div className="ldr-sl">FILLED</div>
          </div>
          <div className="ldr-sbar"><div className="ldr-sfill" style={{ width: `${(filled / 11) * 100}%` }} /></div>
        </div>
      )}
 
      <div className="ldr-root">
 
        {/* ════ LOADING ════ */}
        {phase === 'loading' && (
          <div className="ldr-loading">
            <div className="ldr-loading-spinner" />
            <div className="ldr-loading-text">LOADING LEAGUE DRAFT…</div>
          </div>
        )}
 
        {/* ════ ALREADY DRAFTED ════ */}
        {alreadyDrafted && (
          <div className="ldr-already">
            <div className="ldr-already-icon">✓</div>
            <div className="ldr-already-title">DRAFT SUBMITTED</div>
            <div className="ldr-already-sub">You've already drafted this week. Scores reveal at midnight EST.</div>
            <Link href={`/games/pack-empire/offense/league/${leagueId}`} className="ldr-submit-btn">
              BACK TO LEAGUE
            </Link>
          </div>
        )}
 
        {/* ════ BOOSTED PACK POSITION PICKER ════ */}
        {phase === 'boosted_pick' && (
          <div className="ldr-boost-pick">
            <div className="ldr-boost-eyebrow">YOUR REWARD</div>
            <div className="ldr-boost-title" style={{ color: PACK_TIER_COLORS[myPackTier] }}>
              {PACK_TIER_LABELS[myPackTier]}
            </div>
            <div className="ldr-boost-sub">
              Choose which position slot gets your boosted pack this week.
              All other slots use standard weights.
            </div>
            <div className="ldr-boost-formation">
  <div className="ldr-boost-row">
    {([6,7,8,9,10] as const).map((si, i) => {
      const slot = SLOTS[si]; const isLocked = lineup[si] !== null;
      const isSelected = boostedPos === slot.key;
      const label = ['LT','LG','C','RG','RT'][i];
      return (
        <button key={slot.key}
          className={`ldr-boost-slot${isLocked?' locked':''}${isSelected?' selected':''}`}
          style={isSelected?{borderColor:PACK_TIER_COLORS[myPackTier],color:PACK_TIER_COLORS[myPackTier]}:{}}
          disabled={isLocked} onClick={() => !isLocked && setBoostedPos(slot.key)}>
          {isLocked ? '🔒' : label}
        </button>
      );
    })}
  </div>
  <div className="ldr-boost-row" style={{gap:'20px'}}>
    <div style={{display:'flex',gap:'7px'}}>
      {([2,3] as const).map((si,i) => {
        const slot=SLOTS[si]; const isLocked=lineup[si]!==null; const isSelected=boostedPos===slot.key;
        return <button key={slot.key} className={`ldr-boost-slot${isLocked?' locked':''}${isSelected?' selected':''}`} style={isSelected?{borderColor:PACK_TIER_COLORS[myPackTier],color:PACK_TIER_COLORS[myPackTier]}:{}} disabled={isLocked} onClick={()=>!isLocked&&setBoostedPos(slot.key)}>{isLocked?'🔒':['WR1','WR2'][i]}</button>;
      })}
    </div>
    <div style={{display:'flex',gap:'7px'}}>
      {([5,4] as const).map((si,i) => {
        const slot=SLOTS[si]; const isLocked=lineup[si]!==null; const isSelected=boostedPos===slot.key;
        return <button key={slot.key} className={`ldr-boost-slot${isLocked?' locked':''}${isSelected?' selected':''}`} style={isSelected?{borderColor:PACK_TIER_COLORS[myPackTier],color:PACK_TIER_COLORS[myPackTier]}:{}} disabled={isLocked} onClick={()=>!isLocked&&setBoostedPos(slot.key)}>{isLocked?'🔒':['TE','WR3'][i]}</button>;
      })}
    </div>
  </div>
  <div className="ldr-boost-row">
    {([0,1] as const).map((si,i) => {
      const slot=SLOTS[si]; const isLocked=lineup[si]!==null; const isSelected=boostedPos===slot.key;
      return <button key={slot.key} className={`ldr-boost-slot${isLocked?' locked':''}${isSelected?' selected':''}`} style={isSelected?{borderColor:PACK_TIER_COLORS[myPackTier],color:PACK_TIER_COLORS[myPackTier]}:{}} disabled={isLocked} onClick={()=>!isLocked&&setBoostedPos(slot.key)}>{isLocked?'🔒':['QB','RB'][i]}</button>;
    })}
  </div>
</div>
<button className="ldr-submit-btn" disabled={!boostedPos}
  onClick={() => { setBoostedPicked(false); setPhase('packing'); }}
  style={{ marginTop: '1rem' }}>
  {boostedPos ? `BOOST ${boostedPos} →` : 'SELECT A SLOT'}
</button>
            <button className="ldr-skip-boost" onClick={() => { setBoostedPos(null); setBoostedPicked(true); setPhase('packing'); }}>
              Skip — use standard packs for all slots
            </button>
          </div>
        )}
 
        {/* ════ PACKING ════ */}
        {phase === 'packing' && (
          <div className="ldr-packing">
            {/* Info banner */}
            <div className="ldr-week-banner">
              <div className="ldr-wb-left">
                <div className="ldr-wb-week">
                  {leaguePhase === 'regular' ? `WEEK ${weekNumber} OF 8` : leaguePhase.toUpperCase()}
                </div>
                <div className="ldr-wb-count">{openSlotsLeft} SLOTS REMAINING</div>
              </div>
              {lockedPlayers.length > 0 && (
                <div className="ldr-wb-locks">🔒 {lockedPlayers.length} LOCKED</div>
              )}
              {boostedPos && !boostedPicked && (
                <div className="ldr-wb-boost" style={{ color: PACK_TIER_COLORS[myPackTier] }}>
                  ⚡ {PACK_TIER_LABELS[myPackTier]} on {boostedPos}
                </div>
              )}
            </div>
 
            <div className="ldr-formation-wrap">
              <FieldLayout />
            </div>
 
            {/* Pack cards */}
            {packCards.length > 0 && (
              <div className="ldr-cards-area" ref={cardsRef}>
                <div className="ldr-ca-header">
                  {packSi !== null && isBoostedSlot(packSi) && (
                    <div className="ldr-cap-tag" style={{ color: PACK_TIER_COLORS[myPackTier] }}>
                      ⚡ {PACK_TIER_LABELS[myPackTier]} — {SLOTS[packSi].label.toUpperCase()}
                    </div>
                  )}
                  <div className="ldr-ca-pos">{packSi !== null ? SLOTS[packSi].label.toUpperCase() : ''}</div>
                  <div className="ldr-ca-status">
                    {pickedId ? '✓ Player drafted!'
                      : anyRevealed ? `${revealed.filter(Boolean).length}/5 revealed · tap a card to PICK`
                        : 'Tap cards to reveal · or use REVEAL ALL'}
                  </div>
                </div>
                <div className="ldr-cards-row">
                  {packCards.map((card, i) => {
                    const rc    = RC[card.rarity];
                    const isRev = revealed[i];
                    const isPick = pickedId === card.id;
                    const isRej  = !!pickedId && pickedId !== card.id;
                    const imgSrc = imageMap[card.name];
                    return (
                      <div key={card.id + i}
                        className={`ldr-card${isRev ? ' rev' : ''}${isPick ? ' picked' : ''}${isRej ? ' rejected' : ''}${isRev && !pickedId ? ' selectable' : ''}`}
                        onClick={() => handleCardClick(i)}
                        style={{ '--rc': rc.color, '--rg': rc.glow, '--art': rc.art, '--sh': rc.shimmer } as React.CSSProperties}
                      >
                        <div className="ldr-ci">
                          <RarityEffects rarity={card.rarity} position="outer" />
                          <div className="ldr-card-back">
                            <div className="ldr-back-grid" />
                            <div className="ldr-back-icon">🏈</div>
                            <div className="ldr-back-label">TAP TO REVEAL</div>
                          </div>
                          <div className="ldr-card-front">
                            <div className="ldr-cf-topbar">
                              <div className="ldr-cf-pos" style={{ background: rc.color }}>{card.pos}</div>
                              <div className="ldr-cf-rlab" style={{ color: rc.color }}>{rc.label}</div>
                            </div>
                            <div className="ldr-cf-art" style={{ background: rc.art }}>
                              <RarityEffects rarity={card.rarity} position="inner" />
                              {imgSrc && <img src={imgSrc} alt={card.name} className="ldr-cf-img" onError={e => (e.currentTarget.style.display = 'none')} />}
                              <div className="ldr-cf-initial">{card.name.charAt(0)}</div>
                            </div>
                            <div className="ldr-cf-body">
                              <div className="ldr-cf-name">{card.name}</div>
                              <div className="ldr-cf-team">{card.team}</div>
                              <div className="ldr-cf-line" style={{ background: rc.color }} />
                              <div className="ldr-cf-score-row">
                                <div className="ldr-cf-score" style={{ color: rc.color }}>{card.score.toLocaleString()}</div>
                                <div className="ldr-cf-ovr">OVR</div>
                              </div>
                              {card.accolades.slice(0, 2).map((a, j) => <div key={j} className="ldr-cf-acc">· {a}</div>)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {!pickedId && hiddenCount > 0 && (
                  <div className="ldr-reveal-bar">
                    <button className="ldr-reveal-btn" onClick={revealAll}>REVEAL ALL {hiddenCount}</button>
                  </div>
                )}
              </div>
            )}
 
            {!isBusy && filled < 11 && (
              <div className="ldr-empty-prompt">
                <div className="ldr-ep-arrow">↑</div>
                <div className="ldr-ep-text">Tap an open slot to open that pack</div>
              </div>
            )}
          </div>
        )}
 
        {/* ════ COMPLETE ════ */}
        {phase === 'complete' && !alreadyDrafted && (
          <div className="ldr-complete">
            <div className="ldr-cmp-header">
              <div className="ldr-cmp-eyebrow">LEAGUE DRAFT COMPLETE</div>
              <div className="ldr-cmp-score" style={{ color: tier.color }}>
                {(totalScore + chemResult.totalChemPoints).toLocaleString()}
              </div>
              <div className="ldr-cmp-label">FINAL SCORE</div>
            </div>
 
            {/* Score breakdown */}
            <div className="ldr-cmp-breakdown">
              <div className="ldr-cmp-bd-row">
                <span className="ldr-cmp-bd-label">Draft score</span>
                <span className="ldr-cmp-bd-val">{totalScore.toLocaleString()}</span>
              </div>
              <div className="ldr-cmp-bd-row">
                <span className="ldr-cmp-bd-label">Chemistry</span>
                <span className="ldr-cmp-bd-val" style={{ color: chemResult.totalChemPoints >= 0 ? '#ff6b35' : '#cc3300' }}>
                  {chemResult.totalChemPoints >= 0 ? '+' : ''}{chemResult.totalChemPoints.toLocaleString()}
                </span>
              </div>
              {chemResult.bonds.length > 0 && (
                <div className="ldr-cmp-bonds">
                  {chemResult.bonds.map((bond, i) => (
                    <div key={i} className="ldr-cmp-bond-row">
                      <span className="ldr-cmp-bond-icon">{bond.type === 'synergy' ? '⚡' : '⚔️'}</span>
                      <span className="ldr-cmp-bond-reason">{bond.reason}</span>
                      <span className="ldr-cmp-bond-pts" style={{ color: bond.points >= 0 ? '#ff6b35' : '#cc3300' }}>
                        {bond.points >= 0 ? '+' : ''}{bond.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="ldr-cmp-bd-row total">
                <span className="ldr-cmp-bd-label">Total</span>
                <span className="ldr-cmp-bd-val" style={{ color: '#ff6b35' }}>
                  {(totalScore + chemResult.totalChemPoints).toLocaleString()}
                </span>
              </div>
            </div>
 
            {/* Tier */}
            <div className="ldr-cmp-tier" style={{ color: tier.color }}>
              {tier.icon} {tier.label}
            </div>
 
            {/* Submit */}
            {!submitDone ? (
              <button
                className="ldr-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'SUBMITTING…' : 'SUBMIT TO LEAGUE →'}
              </button>
            ) : (
              <div className="ldr-submitted">
                <div className="ldr-sub-check">✓</div>
                <div className="ldr-sub-msg">Draft submitted! Scores reveal at midnight EST.</div>
                <Link href={`/games/pack-empire/offense/league/${leagueId}`} className="ldr-submit-btn" style={{ marginTop: '.8rem', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                  BACK TO LEAGUE
                </Link>
              </div>
            )}
 
            {/* Roster preview */}
            <div className="ldr-cmp-field-wrap">
              <div className="ldr-cmp-field-label">YOUR LINEUP</div>
              <FieldLayout />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   STYLES — crimson / burnt orange identity, Rajdhani body font
   Orbitron kept for scores. `ldr-` prefix throughout.
══════════════════════════════════════════════════════════════════════ */
const LEAGUE_DRAFT_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@700;800;900&display=swap');

/* ── Root palette ────────────────────────────────────────────────────── */
/* Primary:  #ff6b35  (burnt orange)
   Accent:   #cc2200  (deep crimson)
   Dark bg:  #0e0600  →  #1a0800
   Mid bg:   #1e0c04
   Border:   #3a1008
   Text:     #f0d8c8  (warm off-white)
   Muted:    #6a3820  */

*{box-sizing:border-box}

.ldr-root{max-width:860px;margin:0 auto;padding:1rem 1.5rem 5rem;font-family:'Rajdhani',sans-serif;color:#f0d8c8}

/* ── Nav ─────────────────────────────────────────────────────────────── */
.ldr-nav{display:flex;align-items:center;justify-content:space-between;padding:.7rem 1.5rem;background:rgba(14,6,0,.95);border-bottom:1px solid #3a1008;position:sticky;top:0;z-index:40;font-family:'Rajdhani',sans-serif}
.ldr-back{color:#6a3820;font-size:.82rem;letter-spacing:.1em;font-weight:600;text-decoration:none;transition:.15s}
.ldr-back:hover{color:#ff6b35}
.ldr-nav-c{display:flex;align-items:center;gap:.4rem;font-family:'Orbitron',sans-serif;font-size:.65rem;font-weight:800;color:#6a3820;letter-spacing:.14em}
.ldr-nav-dot{width:6px;height:6px;border-radius:50%;background:#cc2200;box-shadow:0 0 6px #cc2200}
.ldr-pack-tier-pill{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.72rem;letter-spacing:.12em;border:1px solid currentColor;border-radius:4px;padding:.15rem .4rem;opacity:.9}

/* ── Score strip ─────────────────────────────────────────────────────── */
.ldr-strip{display:flex;align-items:center;gap:.3rem;padding:.55rem 1.5rem;background:rgba(14,6,0,.98);border-bottom:1px solid #3a1008;overflow-x:auto;scrollbar-width:none;position:sticky;top:41px;z-index:39}
.ldr-strip::-webkit-scrollbar{display:none}
.ldr-sg{display:flex;flex-direction:column;align-items:center;flex-shrink:0;padding:0 .5rem}
.ldr-sv{font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:800;white-space:nowrap}
.ldr-sof{font-size:.6rem;color:#6a3820}
.ldr-sl{font-size:.52rem;letter-spacing:.14em;color:#6a3820;white-space:nowrap;margin-top:.1rem}
.ldr-sdiv{width:1px;height:28px;background:#3a1008;flex-shrink:0}
.ldr-stier{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.82rem;letter-spacing:.1em;white-space:nowrap}
.ldr-sbar{position:absolute;bottom:0;left:0;right:0;height:2px;background:#3a1008}
.ldr-sfill{height:100%;background:linear-gradient(90deg,#cc2200,#ff6b35);transition:width .4s ease}

/* ── Loading ─────────────────────────────────────────────────────────── */
.ldr-loading{display:flex;flex-direction:column;align-items:center;gap:1rem;padding:4rem 0}
.ldr-loading-spinner{width:32px;height:32px;border:2px solid #3a1008;border-top-color:#ff6b35;border-radius:50%;animation:ldr-spin .8s linear infinite}
@keyframes ldr-spin{to{transform:rotate(360deg)}}
.ldr-loading-text{font-family:'Orbitron',sans-serif;font-size:.7rem;letter-spacing:.2em;color:#6a3820}

/* ── Already drafted ─────────────────────────────────────────────────── */
.ldr-already{text-align:center;padding:3rem 1rem}
.ldr-already-icon{font-size:2.5rem;color:#ff6b35;margin-bottom:.5rem}
.ldr-already-title{font-family:'Orbitron',sans-serif;font-size:1.2rem;color:#ff6b35;margin-bottom:.5rem}
.ldr-already-sub{color:#6a3820;font-size:.9rem;margin-bottom:1.5rem}

/* ── Boosted pick ────────────────────────────────────────────────────── */
.ldr-boost-pick{max-width:440px;margin:0 auto;padding:2rem 0}
.ldr-boost-eyebrow{font-size:.65rem;letter-spacing:.22em;color:#6a3820;margin-bottom:.2rem}
.ldr-boost-title{font-family:'Orbitron',sans-serif;font-size:1.5rem;font-weight:800;margin-bottom:.6rem}
.ldr-boost-sub{color:#8a5030;font-size:.9rem;line-height:1.5;margin-bottom:1.4rem}
.ldr-boost-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.4rem}
.ldr-boost-btn{background:rgba(30,12,4,.9);border:1px solid #3a1008;border-radius:7px;padding:.7rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.95rem;letter-spacing:.1em;color:#8a5030;cursor:pointer;transition:.15s}
.ldr-boost-btn:hover{border-color:#ff6b35;color:#ff6b35}
.ldr-boost-btn.selected{background:rgba(40,8,0,.95)}
.ldr-skip-boost{display:block;margin:.6rem auto 0;background:none;border:none;color:#4a2010;font-family:'Rajdhani',sans-serif;font-size:.78rem;cursor:pointer;text-decoration:underline;transition:.15s}
.ldr-skip-boost:hover{color:#6a3820}

/* ── Week banner ─────────────────────────────────────────────────────── */
.ldr-week-banner{display:flex;align-items:center;justify-content:space-between;background:rgba(30,12,4,.9);border:1px solid #3a1008;border-radius:8px;padding:.6rem .9rem;margin-bottom:.8rem}
.ldr-wb-week{font-family:'Orbitron',sans-serif;font-size:.72rem;font-weight:800;color:#cc2200;letter-spacing:.12em}
.ldr-wb-count{font-size:.72rem;color:#6a3820;margin-top:.1rem}
.ldr-wb-locks{font-size:.72rem;color:#c8a020;font-weight:600}
.ldr-wb-boost{font-size:.72rem;font-weight:700;letter-spacing:.08em}

/* ── Field / slots ───────────────────────────────────────────────────── */
/*
  Slot size uses a CSS custom property --sw (slot width) set at the
  field level. This means one variable controls everything and we can
  scale it cleanly at each breakpoint without transform hacks.
  Desktop default: 110px  (fits 5 OL slots comfortably at 680px)
*/
.ldr-field{display:flex;flex-direction:column;align-items:center;gap:18px;width:fit-content;margin:0 auto}
.ldr-form-row{display:flex;gap:16px}
.ldr-skill-spread{display:flex;justify-content:space-between;align-items:flex-end;width:calc(100% + 380px);margin:0 -40px}
.ldr-skill-side{display:flex;gap:18px}
.ldr-slot-outer{display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;background:transparent;border:none}
.ldr-slot-label{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.65rem;letter-spacing:.12em;color:#6a3820}
.ldr-slot-label.locked{color:#c8a020}
.ldr-slot-label.boosted-label{color:#ff6b35}

/* Pack (empty slot) */
.ldr-pack-wrap{position:relative;display:flex;align-items:center;justify-content:center;cursor:default;width:125px;height:183px;flex-shrink:0}
.ldr-pack-img{width:100% !important;height:100% !important;object-fit:cover;display:block;background:transparent}
.ldr-pack-wrap.clickable{cursor:pointer;transition:transform .18s ease,filter .18s ease}
.ldr-pack-wrap.clickable:hover{transform:translateY(-6px) scale(1.07);filter:drop-shadow(0 0 10px rgba(255,69,0,.7))}
.ldr-pack-wrap.boosted{animation:ldr-boost-glow 1.8s ease-in-out infinite}
@keyframes ldr-boost-glow{0%,100%{filter:var(--boost-glow-lo)}50%{filter:var(--boost-glow-hi)}}
.ldr-fsl.active{width:125px;height:183px;background:rgba(255,69,0,.06);border:2px solid #ff4500;box-shadow:0 0 20px rgba(255,69,0,.4);border-radius:11px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;flex-shrink:0}
@keyframes ldr-boost-pulse{0%,100%{box-shadow:0 0 10px #ff6b354d}50%{box-shadow:0 0 22px rgba(255,107,53,.5)}}
.ldr-pack-boosted-badge{position:relative;top:-205px;text-align:center;font-family:'Rajdhani',sans-serif;font-weight:800;font-size:.6rem;letter-spacing:.14em;text-shadow:0 0 8px currentColor;background:rgba(14,6,0,.88);border:1px solid currentColor;border-radius:3px;padding:.1rem .4rem;white-space:nowrap;margin-bottom:2px;margin-left:15px;box-shadow:0 0 6px currentColor}

/* Active slot */
.ldr-fsl-pos-small{font-family:'Rajdhani',sans-serif;font-size:.65rem;color:#6a3820;letter-spacing:.1em}
.ldr-fsl-opening{font-family:'Orbitron',sans-serif;font-size:.8rem;color:#ff6b35;animation:ldr-spin .8s linear infinite}

/* Filled card */
.ldr-fsl.has-p{width:125px;height:183px;border-radius:11px;overflow:visible;background:transparent;border:none;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;flex-shrink:0}
.ldr-filled-card{position:absolute;inset:0;display:flex;flex-direction:column;overflow:hidden;border-radius:9px}
.pe-fsl{width:125px;height:183px;border-radius:11px;overflow:visible;background:transparent;border:none;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  position:relative;transition:all .22s;cursor:default;flex-shrink:0}
.pe-fsl.has-p{background:#040810;border:2px solid rgba(255,255,255,.18);box-shadow:0 0 16px var(--rg,transparent);overflow:hidden}
.pe-fsl.active{background:rgba(255,215,0,.06);border:2px solid #ffd700;box-shadow:0 0 20px rgba(255,215,0,.4);animation:slot-p 1.4s ease-in-out infinite}
@keyframes slot-p{0%,100%{box-shadow:0 0 20px rgba(255,215,0,.4)}50%{box-shadow:0 0 38px rgba(255,215,0,.65)}}
.pe-fsl-locked{display:flex;flex-direction:column;align-items:center;gap:.3rem}
.pe-fsl-pos-small{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.68rem;letter-spacing:.14em;color:#2a4060}
.pe-fsl-opening{font-size:.65rem;color:#ffd700;animation:blink .9s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}

.pe-filled-card{position:absolute;inset:0;display:flex;flex-direction:column;overflow:hidden;border-radius:9px}
.ldr-fc-topbar{height:25px;flex-shrink:0;width:100%;display:flex;align-items:center;justify-content:space-between;padding:.25rem .35rem;background:rgba(4,8,16,.95);border-bottom:1px solid rgba(255,255,255,.08)}
.ldr-fc-pos-badge{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.55rem;letter-spacing:.12em;color:#fff;padding:1px 5px;border-radius:3px}
.ldr-fc-rar-badge{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.50rem;letter-spacing:.18em;opacity:.9}
.ldr-fc-art{flex:1;position:relative;overflow:hidden;background:var(--art);display:flex;align-items:center;justify-content:center}
.ldr-fc-img{position:absolute;bottom:3px;left:50%;transform:translateX(-50%);height:105%;width:auto;object-fit:contain;object-position:center bottom;z-index:10}
.ldr-fc-initial{font-family:'Orbitron',sans-serif;font-weight:900;font-size:3.2rem;color:rgba(255,255,255,.12);position:absolute;bottom:-4px;right:-4px;z-index:1}
.ldr-fc-field-lines{position:absolute;inset:0;z-index:1;pointer-events:none;
  background-image:repeating-linear-gradient(0deg,transparent,transparent 16px,rgba(255,255,255,.1) 16px,rgba(255,255,255,.1) 17px),linear-gradient(180deg,rgba(0,0,0,.1),transparent 50%,rgba(0,0,0,.25));
  border-bottom:2px solid var(--rc,rgba(255,255,255,.4))}
.ldr-fc-info{flex-shrink:0;padding:.35rem .4rem .3rem;width:100%;background:linear-gradient(to bottom,rgba(4,8,16,.9),rgba(4,8,16,.98));border-top:2px solid var(--rc,rgba(255,255,255,.1))}
.ldr-fc-name{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.82rem;line-height:1;letter-spacing:.02em;color:var(--rc,#e0eef8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ldr-fc-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1rem;line-height:1.1;color:#d4e8f8;margin-top:2px}
.ldr-fc-team-tag{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:.48rem;letter-spacing:.1em;margin-top:2px;color:#3a6080;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ldr-fc-cap-badge{position:absolute;top:-18px;left:50%;transform:translateX(-50%);
  font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.58rem;letter-spacing:.14em;
  color:#ffd700;background:rgba(5,10,24,.9);border:1px solid rgba(255,215,0,.5);
  border-radius:4px;padding:1px 7px;white-space:nowrap;z-index:10;
  text-shadow:0 0 8px rgba(255,215,0,.8);pointer-events:none}
.ldr-fc-shine{position:absolute;inset:0;pointer-events:none;z-index:4;background:linear-gradient(135deg,transparent 45%,rgba(255,255,255,.06) 50%,transparent 55%)}

/* ── Cards area ──────────────────────────────────────────────────────── */
.ldr-cards-area{margin-top:1.2rem;padding:0 .25rem}
.ldr-ca-header{margin-bottom:.7rem;text-align:center}
.ldr-cap-tag{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.72rem;letter-spacing:.14em;margin-bottom:.2rem}
.ldr-ca-pos{font-family:'Orbitron',sans-serif;font-size:1.2rem;font-weight:800;color:#cc2200;letter-spacing:.14em;margin-bottom:.2rem}
.ldr-ca-status{font-size:.78rem;color:#6a3820;font-weight:600}

.ldr-cards-row{display:flex;gap:.55rem;justify-content:center;flex-wrap:wrap;padding:.3rem 0}

/* Card flip */
.ldr-card{width:calc(19vw - 4px);min-width:110px;max-width:140px;aspect-ratio:125/183;border-radius:11px;perspective:700px;cursor:pointer;flex-shrink:0;position:relative}
.ldr-ci{width:100%;height:100%;transform-style:preserve-3d;-webkit-transform-style:preserve-3d;transition:transform .55s cubic-bezier(.4,0,.2,1);position:relative;border-radius:11px}
.ldr-card.rev .ldr-ci{transform:rotateY(180deg)}
.ldr-card-back,.ldr-card-front{position:absolute;inset:0;border-radius:11px;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden}
.pe-card-back{background:linear-gradient(155deg,#080e24,#0c1840);border:2px solid #1a3060;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4rem;-webkit-backface-visibility:hidden;backface-visibility:hidden;transform:translateZ(0)}
.ldr-card-back{background:linear-gradient(150deg,#1a0800,#2e0e04);border:1px solid #3a1008;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.3rem;-webkit-backface-visibility:hidden;backface-visibility:hidden;transform:translateZ(0)}
.ldr-back-grid{position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(204,34,0,.06),rgba(204,34,0,.06) 1px,transparent 1px,transparent 10px),repeating-linear-gradient(-45deg,rgba(204,34,0,.06),rgba(204,34,0,.06) 1px,transparent 1px,transparent 10px);-webkit-backface-visibility:hidden}
.ldr-back-icon{font-size:1.5rem;z-index:1;position:relative}
.ldr-back-label{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.65rem;letter-spacing:.14em;color:#6a3820;z-index:1;position:relative}
.ldr-back-league{font-family:'Orbitron',sans-serif;font-size:.48rem;letter-spacing:.18em;color:#3a1008;z-index:1;position:relative}
.ldr-card-front{background:linear-gradient(170deg,#080e24,#0b1438);border:2px solid var(--sh,#333);transform:rotateY(180deg) translateZ(0);box-shadow:0 0 18px var(--rg,transparent),inset 0 1px 0 rgba(255,255,255,.06);position:relative;-webkit-backface-visibility:hidden;backface-visibility:hidden}

.ldr-cf-topbar{display:flex;align-items:center;justify-content:space-between;padding:.22rem .35rem;background:rgba(4,2,0,.95);flex-shrink:0}
.ldr-cf-pos{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.6rem;color:#0e0600;padding:.08rem .28rem;border-radius:2px}
.ldr-cf-rlab{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.5rem;letter-spacing:.1em}
.ldr-cf-art{flex:1;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;min-height:80px}
.ldr-cf-img{position:absolute;bottom:-10px;left:50%;transform:translateX(-50%);height:118%;width:auto;object-fit:contain;object-position:center bottom;z-index:10}
.ldr-cf-initial{position:absolute;font-family:'Orbitron',sans-serif;font-size:3.2rem;font-weight:900;color:rgba(255,255,255,.06);z-index:1}
.ldr-cf-body{padding:.35rem .38rem .4rem;background:rgba(4,2,0,.96);flex-shrink:0}
.ldr-cf-name{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.88rem;color: #f0d8c8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ldr-cf-team{font-family:'Rajdhani',sans-serif;font-size:.68rem;color: #f79e7ec8;margin-bottom:.25rem;font-weight:500}
.ldr-cf-line{height:1px;margin:.2rem 0}
.ldr-cf-score-row{display:flex;align-items:baseline;gap:.25rem}
.ldr-cf-score{font-family:'Orbitron',sans-serif;font-size:.92rem;font-weight:800}
.ldr-cf-ovr{font-family:'Rajdhani',sans-serif;font-size:.56rem;color:#6a3820;letter-spacing:.1em}
.ldr-cf-acc{font-family:'Rajdhani',sans-serif;font-size:.6rem;color: #f79e7ec8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* Card states */
.ldr-card.selectable:hover .ldr-ci{transform:rotateY(180deg) scale(1.04)}
.ldr-card.picked{z-index:10}
.ldr-card.picked .ldr-ci{transform:rotateY(180deg) scale(1.08);box-shadow:0 0 30px var(--rg)}
.ldr-card.rejected{pointer-events:none}
.ldr-card.rejected .ldr-ci{transform:rotateY(180deg) scale(.94);opacity:.35}

/* ── Reveal bar ──────────────────────────────────────────────────────── */
.ldr-reveal-bar{text-align:center;margin:.5rem 0}
.ldr-reveal-btn{background:transparent;border:1.5px solid #cc2200;color:#ff6b35;border-radius:7px;padding:.55rem 1.4rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:.1em;cursor:pointer;transition:.2s}
.ldr-reveal-btn:hover{background:rgba(204,34,0,.12)}

/* ── Empty prompt ────────────────────────────────────────────────────── */
.ldr-empty-prompt{text-align:center;color:#4a2010;padding:1rem 0;font-family:'Rajdhani',sans-serif;font-weight:600;font-size:.85rem;letter-spacing:.1em}
.ldr-ep-arrow{font-size:1.2rem;margin-bottom:.2rem;animation:ldr-bob .9s ease-in-out infinite}
@keyframes ldr-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}

/* ── Complete ────────────────────────────────────────────────────────── */
.ldr-complete{padding:.5rem 0}
.ldr-cmp-header{text-align:center;margin-bottom:1.2rem}
.ldr-cmp-eyebrow{font-size:.65rem;letter-spacing:.22em;color:#6a3820;margin-bottom:.3rem}
.ldr-cmp-score{font-family:'Orbitron',sans-serif;font-size:2.6rem;font-weight:900;line-height:1}
.ldr-cmp-label{font-size:.68rem;letter-spacing:.18em;color:#6a3820;margin-top:.2rem}
.ldr-cmp-tier{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1rem;letter-spacing:.12em;text-align:center;margin-bottom:1rem}

.ldr-cmp-breakdown{background:rgba(30,12,4,.9);border:1px solid #3a1008;border-radius:10px;padding:.9rem 1rem;margin-bottom:1rem}
.ldr-cmp-bd-row{display:flex;justify-content:space-between;align-items:center;padding:.3rem 0;border-bottom:1px solid #2a0c04;font-family:'Rajdhani',sans-serif;font-weight:600}
.ldr-cmp-bd-row:last-child{border-bottom:none}
.ldr-cmp-bd-row.total{margin-top:.3rem;padding-top:.5rem;border-top:1px solid #3a1008;font-weight:700;font-size:1.05rem}
.ldr-cmp-bd-label{color:#8a5030}
.ldr-cmp-bd-val{font-family:'Orbitron',sans-serif;font-size:.85rem;font-weight:800;color:#f0d8c8}
.ldr-cmp-bonds{padding:.4rem 0 .2rem;display:flex;flex-direction:column;gap:.2rem}
.ldr-cmp-bond-row{display:flex;align-items:center;gap:.4rem;font-size:.78rem;padding:.15rem 0}
.ldr-cmp-bond-icon{flex-shrink:0;font-size:.8rem}
.ldr-cmp-bond-reason{flex:1;color:#8a5030;font-family:'Rajdhani',sans-serif;font-weight:600}
.ldr-cmp-bond-pts{font-family:'Orbitron',sans-serif;font-size:.72rem;font-weight:800;flex-shrink:0}

.ldr-submit-btn{display:block;width:100%;background:linear-gradient(135deg,#8a2000,#cc2200,#ff6b35);color:#fff5ee;border:none;border-radius:9px;padding:.9rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1rem;letter-spacing:.14em;cursor:pointer;transition:.2s;text-decoration:none;text-align:center;box-sizing:border-box}
.ldr-submit-btn:hover:not(:disabled){filter:brightness(1.1);transform:scale(1.01)}
.ldr-submit-btn:disabled{opacity:.5;cursor:default}

.ldr-submitted{text-align:center;padding:.5rem 0}
.ldr-sub-check{font-size:2rem;color:#ff6b35;margin-bottom:.3rem}
.ldr-sub-msg{color:#8a5030;font-size:.9rem;margin-bottom:.8rem;font-family:'Rajdhani',sans-serif;font-weight:600}

.ldr-cmp-field-wrap{margin-top:1.4rem}
.ldr-cmp-field-label{font-size:.62rem;letter-spacing:.18em;color:#6a3820;margin-bottom:.5rem}

/* ── Immortal flash ──────────────────────────────────────────────────── */
.ldr-imm-flash{position:fixed;inset:0;z-index:999;display:flex;align-items:center;justify-content:center;background:rgba(40,220,120,.08);animation:ldr-imm-fade 2.4s ease-out forwards;pointer-events:none}
@keyframes ldr-imm-fade{0%{opacity:1}80%{opacity:1}100%{opacity:0}}
.ldr-imm-text{font-family:'Orbitron',sans-serif;font-size:1.6rem;font-weight:900;color:#28dc78;text-shadow:0 0 30px rgba(40,220,120,.8),0 0 60px rgba(40,220,120,.4);animation:ldr-imm-scale .4s ease-out}
@keyframes ldr-imm-scale{0%{transform:scale(.6)}100%{transform:scale(1)}}

/* ── Responsive ──────────────────────────────────────────────────────── */
/* 
  No scale transforms. Just shrink --sw so slots stay in-flow.
  OL row has 5 slots + 4 gaps. At --sw=110px, --sg=.5rem:
    5*110 + 4*8 = 582px — fine at 640px container.
  At 560px viewport the container is ~520px:
    5*96 + 4*6 = 504px — fine.
  At 400px:
    5*72 + 4*4 = 376px — fine.
*/

.ldr-fc-lock-overlay{position:absolute;inset:0;z-index:9;pointer-events:none;border-radius:9px;background:linear-gradient(135deg,rgba(20,120,60,.12),transparent 60%);border:9px}
.ldr-fc-lock-badge{position:absolute;top:-27px;left:50%;transform:translateX(-50%);font-family:'Rajdhani',sans-serif;font-weight:800;font-size:.6rem;letter-spacing:.18em;color:#28dc78;text-shadow:0 0 8px rgba(40,220,120,.95);z-index:12;pointer-events:none;background:rgba(2,10,6,.85);border:1px solid rgba(40,220,120,.4);border-radius:3px;padding:.1rem .4rem;white-space:nowrap;box-shadow:0 0 8px rgba(40,220,120,.25)}

.ldr-boost-formation{display:flex;flex-direction:column;align-items:center;gap:8px;margin:0 auto 1rem;width:fit-content}
.ldr-boost-row{display:flex;gap:7px;justify-content:center}
.ldr-boost-slot{width:52px;height:50px;border-radius:8px;background:rgba(30,12,4,.9);border:1.5px solid #3a1008;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.75rem;color:#8a5030;cursor:pointer;transition:.15s;display:flex;align-items:center;justify-content:center}
.ldr-boost-slot:hover:not(:disabled){border-color:#ff6b35;color:#ff6b35;background:rgba(255,107,53,.08)}
.ldr-boost-slot.selected{background:rgba(255,107,53,.15)}
.ldr-boost-slot.locked{background:rgba(14,6,0,.6);border-color:#2a1008;color:#3a1808;cursor:default;opacity:.45}

.ldr-fsl.is-locked .pe-ra-spin-wrap,
.ldr-fsl.is-locked .pe-ep-dual-wrap,
.ldr-fsl.is-locked .pe-le-plasma-wrap,
.ldr-fsl.is-locked .pe-imm-glow-1,
.ldr-fsl.is-locked .pe-imm-glow-2,
.ldr-fsl.is-locked .pe-imm-glow-3,
.ldr-fsl.is-locked .pe-imm-glow-4,
.ldr-fsl.is-locked .pe-imm-plasma-wrap,
.ldr-fsl.is-locked .pe-imm-corner-arcs{display:none}
.ldr-lock-plasma-wrap{position:absolute;inset:-4px;border-radius:14px;overflow:hidden;z-index:0;pointer-events:none}
.ldr-lock-plasma-arc1{position:absolute;inset:0;background:conic-gradient(from 0deg,transparent 20%,rgba(20,160,80,.7) 40%,rgba(80,255,160,1) 50%,rgba(40,220,120,.9) 60%,transparent 80%);animation:border-spin 2s linear infinite}
.ldr-lock-plasma-arc2{position:absolute;inset:0;background:conic-gradient(from 90deg,transparent 20%,rgba(10,100,50,.5) 40%,rgba(40,180,100,.8) 50%,transparent 70%);animation:border-spin 3.2s linear infinite reverse}
.ldr-lock-plasma-arc3{position:absolute;inset:0;background:conic-gradient(from 180deg,transparent 25%,rgba(255,255,255,.4) 42%,rgba(255,255,255,.8) 50%,rgba(255,255,255,.5) 58%,transparent 75%);animation:border-spin 2.4s linear infinite}
.ldr-lock-plasma-arc4{position:absolute;inset:0;background:conic-gradient(from 270deg,transparent 25%,rgba(255,255,255,.3) 42%,rgba(255,255,255,.65) 50%,transparent 72%);animation:border-spin 3.8s linear infinite reverse}
.ldr-lock-plasma-inner{position:absolute;inset:3px;border-radius:11px;background:#060a06}

@keyframes holo-shift{from{background-position:0%}to{background-position:200%}}
@keyframes border-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes orb-float{0%,100%{transform:translateY(0) scale(1);opacity:.55}33%{transform:translateY(-12px) scale(1.2);opacity:1}66%{transform:translateY(-5px) scale(.9);opacity:.65}}
@keyframes sp-anim{0%{transform:scale(0) rotate(0deg);opacity:0}20%{transform:scale(1) rotate(45deg);opacity:1}70%{transform:scale(.8) rotate(180deg);opacity:.8}100%{transform:scale(0) rotate(360deg);opacity:0}}
@keyframes aurora-wave{0%{transform:translateX(-6%) skewX(-1deg);opacity:.6}100%{transform:translateX(6%) skewX(1deg);opacity:1}}
@keyframes tear-glitch{0%,82%,100%{opacity:0;transform:translateX(0)}83%,86%{opacity:1;transform:translateX(-8px)}84%,87%{opacity:.5;transform:translateX(5px)}85%{opacity:1;transform:translateX(-3px)}88%{opacity:0}}
@keyframes holo-sweep{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes glow-breathe{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}
@keyframes foil-scroll{0%{top:-50%}100%{top:120%}}
@keyframes coin-flip{0%,38%{transform:translateX(0)}39%,100%{transform:translateX(420px)}}
@keyframes pulse-expand{0%{width:14px;height:14px;opacity:.9;box-shadow:0 0 8px rgba(66,192,248,.6)}100%{width:140px;height:140px;opacity:0}}
@keyframes ring-expand{0%{width:10px;height:10px;opacity:.75}100%{width:220px;height:220px;opacity:0}}
@keyframes shock-expand{0%{width:8px;height:8px;opacity:1;border-width:4px}25%{opacity:.9;border-width:2.5px}100%{width:280px;height:280px;opacity:0;border-width:.5px}}
@keyframes core-pulse{0%{transform:scale(0);opacity:0}7%{transform:scale(3.5);opacity:1}28%{transform:scale(1.4);opacity:.35}100%{transform:scale(1);opacity:0}}
@keyframes shock-flash{0%,5%,20%,100%{background:rgba(0,0,0,0)}7%{background:rgba(80,255,160,.5)}10%{background:rgba(40,220,120,.1)}15%{background:rgba(0,0,0,0)}}
@keyframes slab-pulse{0%{opacity:.07;transform:rotate(18deg) scaleY(.96)}100%{opacity:.52;transform:rotate(18deg) scaleY(1.02)}}
@keyframes corner-arc-fade{0%,55%,100%{opacity:0}65%{opacity:1}85%{opacity:.9}95%{opacity:0}}
@keyframes heat-drift{0%{transform:translateY(0) scaleX(1);opacity:0}15%{opacity:1}100%{transform:translateY(-65px) scaleX(.5);opacity:0}}
@keyframes geo-shimmer{0%{opacity:.1}100%{opacity:.55}}
@keyframes scratch-flick{0%,100%{opacity:.15}45%,55%{opacity:.7}}
@keyframes ember-rise{0%{transform:translateY(0) scale(1);opacity:0}12%{opacity:.8}100%{transform:translateY(-90px) translateX(6px) scale(0);opacity:0}}
@keyframes scan-line{0%{top:-2px;opacity:0}8%{opacity:1}92%{opacity:.6}100%{top:100%;opacity:0}}
@keyframes crackle-flash{0%,84%,93%,100%{opacity:0}85%,92%{opacity:1}88%{opacity:.3}}
@keyframes center-glow{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes bolt-flash{0%,43%,50%,100%{opacity:0}44%,48%{opacity:1}46%{opacity:.25}}
@keyframes whiteout-leg{0%,42%,52%,100%{background:rgba(255,255,255,0)}44%{background:rgba(255,200,255,.65)}47%{background:rgba(255,220,255,.12)}50%{background:rgba(255,255,255,.04)}}
@keyframes inner-border-pulse{0%,100%{box-shadow:inset 0 0 18px rgba(40,220,120,.16),inset 0 0 44px rgba(40,220,120,.05)}50%{box-shadow:inset 0 0 30px rgba(80,255,160,.35),inset 0 0 65px rgba(40,220,120,.12)}}
.pe-cm-corner{position:absolute;z-index:5;width:10px;height:10px;pointer-events:none}.pe-cm-corner::before,.pe-cm-corner::after{content:'';position:absolute;background:#c87840;opacity:.5}.pe-cm-corner::before{width:100%;height:1.5px;top:0;left:0}.pe-cm-corner::after{width:1.5px;height:100%;top:0;left:0}.pe-cm-corner.tl{top:-1px;left:-1px}.pe-cm-corner.tr{top:-1px;right:-1px;transform:scaleX(-1)}.pe-cm-corner.bl{bottom:-1px;left:-1px;transform:scaleY(-1)}.pe-cm-corner.br{bottom:-1px;right:-1px;transform:scale(-1)}.pe-cm-scan{position:absolute;left:-2px;right:-2px;height:2px;z-index:6;background:linear-gradient(90deg,transparent,rgba(210,130,70,.8),transparent);animation:scan-line 3.8s ease-in-out infinite;pointer-events:none}.pe-cm-heat{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden;opacity:.4}.pe-cm-heat-wave{position:absolute;left:-10%;width:120%;height:1px;background:linear-gradient(90deg,transparent,rgba(210,120,50,.7),transparent);animation:heat-drift linear infinite}.pe-cm-heat-wave:nth-child(1){animation-duration:3.2s;bottom:22%}.pe-cm-heat-wave:nth-child(2){animation-duration:2.9s;animation-delay:.9s;bottom:46%}.pe-cm-heat-wave:nth-child(3){animation-duration:3.7s;animation-delay:1.7s;bottom:68%}.pe-cm-heat-wave:nth-child(4){animation-duration:3.1s;animation-delay:2.5s;bottom:82%}.pe-cm-geo{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}.pe-cm-geo-line{position:absolute;width:1px;background:linear-gradient(to bottom,transparent,rgba(200,120,60,.5),transparent);animation:geo-shimmer ease-in-out infinite alternate}.pe-cm-geo-line:nth-child(1){height:65%;top:8%;left:18%;transform:rotate(22deg);animation-duration:3.0s}.pe-cm-geo-line:nth-child(2){height:72%;top:4%;left:40%;transform:rotate(22deg);animation-duration:3.8s;animation-delay:.7s}.pe-cm-geo-line:nth-child(3){height:60%;top:12%;left:62%;transform:rotate(22deg);animation-duration:3.3s;animation-delay:1.4s}.pe-cm-geo-line:nth-child(4){height:68%;top:6%;left:80%;transform:rotate(22deg);animation-duration:4.0s;animation-delay:.3s}.pe-cm-scratch-layer{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}.pe-cm-scratch{position:absolute;background:rgba(255,200,140,.22);animation:scratch-flick ease-in-out infinite}.pe-cm-scratch:nth-child(1){width:28%;height:1px;top:30%;left:12%;transform:rotate(-8deg);animation-duration:5s}.pe-cm-scratch:nth-child(2){width:18%;height:1px;top:57%;left:52%;transform:rotate(4deg);animation-duration:6s;animation-delay:1.2s}.pe-cm-scratch:nth-child(3){width:22%;height:1px;top:74%;left:22%;transform:rotate(-3deg);animation-duration:4.5s;animation-delay:2.5s}.pe-cm-ember-layer{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}.pe-cm-ember{position:absolute;bottom:-4px;border-radius:50%;background:radial-gradient(circle,#ffb060,#d06020 50%,transparent);animation:ember-rise linear infinite;opacity:0}.pe-cm-ember:nth-child(1){width:3px;height:3px;left:12%;animation-duration:2.9s}.pe-cm-ember:nth-child(2){width:2px;height:2px;left:35%;animation-duration:2.3s;animation-delay:.6s}.pe-cm-ember:nth-child(3){width:4px;height:4px;left:60%;animation-duration:3.2s;animation-delay:.3s}.pe-cm-ember:nth-child(4){width:2px;height:2px;left:78%;animation-duration:2.6s;animation-delay:1.1s}.pe-cm-ember:nth-child(5){width:3px;height:3px;left:24%;animation-duration:3.0s;animation-delay:1.7s}.pe-cm-bottom-glow{position:absolute;bottom:0;left:0;right:0;height:24px;z-index:2;pointer-events:none;background:linear-gradient(to top,rgba(180,70,10,.3),transparent)}
.pe-ra-spin-wrap{position:absolute;inset:-3px;border-radius:13px;overflow:hidden;z-index:0;pointer-events:none}.pe-ra-spin-arc{position:absolute;inset:0;background:conic-gradient(from 0deg,transparent 55%,rgba(66,192,248,.9) 73%,rgba(160,230,255,1) 80%,rgba(66,192,248,.9) 87%,transparent 100%);animation:border-spin 2.8s linear infinite}.pe-ra-spin-inner{position:absolute;inset:2px;border-radius:11px;background:#062840}.pe-ra-pulse-layer{position:absolute;inset:0;z-index:3;pointer-events:none;display:flex;align-items:center;justify-content:center}.pe-ra-pulse-ring{position:absolute;border-radius:50%;border:1.5px solid rgba(66,192,248,.7);animation:pulse-expand ease-out infinite;opacity:0}.pe-ra-pulse-ring:nth-child(1){animation-duration:2.6s}.pe-ra-pulse-ring:nth-child(2){animation-duration:2.6s;animation-delay:.87s}.pe-ra-pulse-ring:nth-child(3){animation-duration:2.6s;animation-delay:1.74s}.pe-ra-depth-vig{position:absolute;inset:0;z-index:2;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,transparent 28%,rgba(2,15,35,.7) 100%)}.pe-ra-center-glow{position:absolute;inset:0;z-index:2;pointer-events:none;background:radial-gradient(ellipse at 50% 40%,rgba(66,192,248,.16),transparent 65%);animation:center-glow 3s ease-in-out infinite}.pe-ra-crackle-layer{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden}.pe-ra-crackle{position:absolute;top:0;left:0;width:100%;height:100%;animation:crackle-flash ease-in-out infinite;opacity:0}.pe-ra-crackle:nth-child(1){animation-duration:4.2s;animation-delay:.5s}.pe-ra-crackle:nth-child(2){animation-duration:5.1s;animation-delay:2.1s}.pe-ra-crackle:nth-child(3){animation-duration:3.9s;animation-delay:3.4s}.pe-ra-crackle-path{fill:none;stroke:#42c0f8;stroke-width:1.1;stroke-linecap:round;filter:drop-shadow(0 0 3px #42c0f8)}
.pe-ep-dual-wrap{position:absolute;inset:-3px;border-radius:13px;overflow:hidden;z-index:0;pointer-events:none}.pe-ep-dual-arc1{position:absolute;inset:0;background:conic-gradient(from 0deg,transparent 60%,rgba(255,215,0,.9) 76%,rgba(255,245,120,1) 82%,rgba(255,215,0,.9) 88%,transparent 100%);animation:border-spin 3.5s linear infinite}.pe-ep-dual-arc2{position:absolute;inset:0;background:conic-gradient(from 180deg,transparent 65%,rgba(255,180,0,.55) 80%,rgba(255,220,0,.75) 86%,transparent 100%);animation:border-spin 5s linear infinite reverse}.pe-ep-dual-inner{position:absolute;inset:2px;border-radius:11px;background:#3a2800}.pe-ep-burst{position:absolute;inset:0;z-index:2;pointer-events:none;display:flex;align-items:center;justify-content:center}.pe-ep-burst svg{position:absolute;width:190%;height:190%;top:-45%;left:-45%;animation:border-spin 10s linear infinite;opacity:.2}.pe-ep-sparkle-layer{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}.pe-ep-sparkle{position:absolute;background:#ffd700;clip-path:polygon(50% 0%,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0% 50%,38% 38%);animation:sp-anim linear infinite;opacity:0}.pe-ep-sparkle:nth-child(1){width:6px;height:6px;left:8%;top:18%;animation-duration:2.2s}.pe-ep-sparkle:nth-child(2){width:5px;height:5px;left:80%;top:12%;animation-duration:1.8s;animation-delay:.7s}.pe-ep-sparkle:nth-child(3){width:4px;height:4px;left:44%;top:52%;animation-duration:2.6s;animation-delay:.3s}.pe-ep-sparkle:nth-child(4){width:7px;height:7px;left:68%;top:66%;animation-duration:2.0s;animation-delay:1.2s}.pe-ep-sparkle:nth-child(5){width:5px;height:5px;left:18%;top:74%;animation-duration:1.9s;animation-delay:.5s}.pe-ep-sparkle:nth-child(6){width:4px;height:4px;left:90%;top:46%;animation-duration:2.4s;animation-delay:1.5s}.pe-ep-sparkle:nth-child(7){width:6px;height:6px;left:32%;top:30%;animation-duration:2.1s;animation-delay:.9s}.pe-ep-foil{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden;border-radius:9px}.pe-ep-foil::before{content:'';position:absolute;top:-50%;left:0;right:0;height:50%;background:linear-gradient(180deg,transparent,rgba(255,240,100,.12),rgba(255,215,0,.06),transparent);animation:foil-scroll 4.5s ease-in-out infinite}.pe-ep-foil::after{content:'';position:absolute;top:-100%;left:0;right:0;height:30%;background:linear-gradient(180deg,transparent,rgba(255,255,180,.08),transparent);animation:foil-scroll 4.5s ease-in-out infinite;animation-delay:1.8s}.pe-ep-shine{position:absolute;inset:0;z-index:5;pointer-events:none;border-radius:9px;overflow:hidden}.pe-ep-shine::after{content:'';position:absolute;top:-100%;left:-60%;width:40%;height:300%;background:linear-gradient(105deg,transparent 30%,rgba(255,245,120,.42) 50%,transparent 70%);animation:coin-flip 3.5s ease-in-out infinite}
.pe-le-plasma-wrap{position:absolute;inset:-4px;border-radius:14px;overflow:hidden;z-index:0;pointer-events:none}.pe-le-plasma-arc1{position:absolute;inset:0;background:conic-gradient(from 0deg,transparent 40%,rgba(192,32,240,.7) 57%,rgba(255,80,255,1) 64%,rgba(224,64,255,.9) 71%,transparent 84%);animation:border-spin 2s linear infinite}.pe-le-plasma-arc2{position:absolute;inset:0;background:conic-gradient(from 90deg,transparent 45%,rgba(160,20,220,.5) 61%,rgba(200,64,255,.8) 69%,transparent 81%);animation:border-spin 3.2s linear infinite reverse}.pe-le-plasma-inner{position:absolute;inset:3px;border-radius:11px;background:#280048}.pe-le-aurora{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}.pe-le-aurora-band{position:absolute;left:-20%;right:-20%;animation:aurora-wave ease-in-out infinite alternate}.pe-le-aurora-band:nth-child(1){height:20px;top:8%;background:linear-gradient(90deg,transparent,rgba(80,255,180,.1),rgba(140,80,255,.15),transparent);animation-duration:4s}.pe-le-aurora-band:nth-child(2){height:16px;top:26%;background:linear-gradient(90deg,transparent,rgba(80,140,255,.09),rgba(160,80,255,.13),transparent);animation-duration:5.5s;animation-delay:.8s}.pe-le-aurora-band:nth-child(3){height:14px;top:46%;background:linear-gradient(90deg,transparent,rgba(200,80,255,.09),rgba(80,200,255,.11),transparent);animation-duration:4.8s;animation-delay:1.6s}.pe-le-aurora-band:nth-child(4){height:12px;top:62%;background:linear-gradient(90deg,transparent,rgba(100,255,160,.07),rgba(180,80,255,.11),transparent);animation-duration:6s;animation-delay:2.2s}.pe-le-orb-layer{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}.pe-le-orb{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(255,128,255,.9),rgba(192,32,240,.4),transparent 70%);animation:orb-float ease-in-out infinite}.pe-le-orb:nth-child(1){width:11px;height:11px;left:10%;top:24%;animation-duration:4.0s}.pe-le-orb:nth-child(2){width:7px;height:7px;left:76%;top:54%;animation-duration:3.5s;animation-delay:.8s}.pe-le-orb:nth-child(3){width:9px;height:9px;left:48%;top:13%;animation-duration:4.8s;animation-delay:1.6s}.pe-le-orb:nth-child(4){width:5px;height:5px;left:28%;top:70%;animation-duration:3.2s;animation-delay:2.2s}.pe-le-orb:nth-child(5){width:8px;height:8px;left:88%;top:38%;animation-duration:4.2s;animation-delay:.4s}.pe-le-holo{position:absolute;inset:0;z-index:4;pointer-events:none;background:linear-gradient(45deg,rgba(224,64,255,.12),rgba(100,64,255,.1),rgba(64,128,255,.12),rgba(64,240,200,.08),rgba(224,64,255,.12));background-size:300% 300%;animation:holo-sweep 3s ease-in-out infinite;mix-blend-mode:screen}.pe-le-depth-rings{position:absolute;inset:0;z-index:2;pointer-events:none;display:flex;align-items:center;justify-content:center}.pe-le-depth-ring{position:absolute;border-radius:50%;border:1px solid rgba(224,64,255,.22);animation:ring-expand ease-out infinite;opacity:0}.pe-le-depth-ring:nth-child(1){animation-duration:4s}.pe-le-depth-ring:nth-child(2){animation-duration:4s;animation-delay:1.33s}.pe-le-depth-ring:nth-child(3){animation-duration:4s;animation-delay:2.66s}.pe-le-bolt-layer{position:absolute;inset:0;z-index:5;pointer-events:none;overflow:hidden}.pe-le-bolt{position:absolute;top:0;left:0;width:100%;height:100%;opacity:0}.pe-le-bolt.b1{animation:bolt-flash 6.5s ease-in-out infinite}.pe-le-bolt.b2{animation:bolt-flash 8.2s ease-in-out infinite;animation-delay:1.4s}.pe-le-bolt.b3{animation:bolt-flash 7.0s ease-in-out infinite;animation-delay:3.8s}.pe-le-bolt.b4{animation:bolt-flash 9.5s ease-in-out infinite;animation-delay:2.2s}.pe-le-bolt.b5{animation:bolt-flash 6.8s ease-in-out infinite;animation-delay:5.1s}.pe-le-bolt.b6{animation:bolt-flash 8.8s ease-in-out infinite;animation-delay:4.3s}.pe-le-bolt-glow{fill:none;stroke:#c020f0;stroke-linecap:round;stroke-linejoin:round;stroke-width:10;opacity:.4}.pe-le-bolt-mid{fill:none;stroke:#e040ff;stroke-linecap:round;stroke-linejoin:round;stroke-width:5;opacity:.7}.pe-le-bolt-core{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:2;opacity:1}.pe-le-bolt-branch{fill:none;stroke:#e080ff;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.2;opacity:.65}.pe-le-tear-layer{position:absolute;inset:0;z-index:5;pointer-events:none;overflow:hidden}.pe-le-tear{position:absolute;left:0;right:0;animation:tear-glitch ease-in-out infinite;opacity:0}.pe-le-tear-inner{height:3px;background:linear-gradient(90deg,transparent,rgba(255,80,255,.65),rgba(255,255,255,.85),rgba(224,64,255,.5),transparent)}.pe-le-tear:nth-child(1){top:22%;animation-duration:5.0s;animation-delay:.4s}.pe-le-tear:nth-child(2){top:56%;animation-duration:6.2s;animation-delay:2.3s}.pe-le-tear:nth-child(3){top:74%;animation-duration:4.6s;animation-delay:3.8s}.pe-le-whiteout{position:absolute;inset:0;z-index:6;pointer-events:none;border-radius:9px;background:rgba(255,255,255,0)}.pe-le-whiteout.w1{animation:whiteout-leg 7.0s ease-in-out infinite;animation-delay:3.84s}.pe-le-whiteout.w2{animation:whiteout-leg 9.5s ease-in-out infinite;animation-delay:2.24s}.pe-le-whiteout.w3{animation:whiteout-leg 6.8s ease-in-out infinite;animation-delay:5.14s}
.pe-imm-glow-1{position:absolute;inset:-5px;border-radius:18px;z-index:-1;pointer-events:none;box-shadow:0 0 16px 4px rgba(40,220,120,.65),0 0 36px 8px rgba(20,180,80,.4);animation:glow-breathe 2s ease-in-out infinite}.pe-imm-glow-2{position:absolute;inset:-16px;border-radius:24px;z-index:-2;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,rgba(40,220,120,.26) 0%,rgba(20,160,70,.12) 45%,transparent 72%);animation:glow-breathe 2s ease-in-out infinite;animation-delay:.3s}.pe-imm-glow-3{position:absolute;inset:-44px;border-radius:52px;z-index:-3;pointer-events:none;background:radial-gradient(ellipse at 50% 55%,rgba(20,200,80,.14) 0%,rgba(10,120,50,.06) 50%,transparent 72%);animation:glow-breathe 3.2s ease-in-out infinite;animation-delay:.8s}.pe-imm-glow-4{position:absolute;inset:-80px;border-radius:90px;z-index:-4;pointer-events:none;background:radial-gradient(ellipse at 50% 55%,rgba(10,160,60,.08) 0%,rgba(5,80,30,.04) 45%,transparent 70%);animation:glow-breathe 4s ease-in-out infinite;animation-delay:1.2s}.pe-imm-corner-arcs{position:absolute;inset:0;z-index:7;pointer-events:none}.pe-imm-corner-arcs svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}.pe-imm-arc-glow{fill:none;stroke-linecap:round;stroke:rgba(40,220,120,.18);stroke-width:0}.pe-imm-arc-line{fill:none;}.pe-imm-arc-glow.a1,.pe-imm-arc-line.a1{animation:corner-arc-fade 4s ease-in-out infinite;animation-delay:0s}.pe-imm-arc-glow.a2,.pe-imm-arc-line.a2{animation:corner-arc-fade 4s ease-in-out infinite;animation-delay:1s}.pe-imm-arc-glow.a3,.pe-imm-arc-line.a3{animation:corner-arc-fade 4s ease-in-out infinite;animation-delay:2s}.pe-imm-arc-glow.a4,.pe-imm-arc-line.a4{animation:corner-arc-fade 4s ease-in-out infinite;animation-delay:3s}.pe-imm-plasma-wrap{position:absolute;inset:-5px;border-radius:17px;overflow:hidden;z-index:0;pointer-events:none}.pe-imm-plasma-arc1{position:absolute;inset:0;background:conic-gradient(from 0deg,transparent 35%,rgba(20,160,70,.6) 50%,rgba(80,255,160,1) 59%,rgba(40,220,120,.9) 67%,transparent 80%);animation:border-spin 1.6s linear infinite}.pe-imm-plasma-arc2{position:absolute;inset:0;background:conic-gradient(from 120deg,transparent 40%,rgba(10,120,50,.5) 54%,rgba(60,220,120,.85) 62%,transparent 76%);animation:border-spin 2.6s linear infinite reverse}.pe-imm-plasma-arc3{position:absolute;inset:0;background:conic-gradient(from 240deg,transparent 48%,rgba(40,255,130,.45) 62%,rgba(120,255,190,.75) 68%,transparent 79%);animation:border-spin 3.8s linear infinite}.pe-imm-plasma-inner{position:absolute;inset:4px;border-radius:13px;background:#021a0a}.pe-imm-inner-border{position:absolute;inset:1px;border-radius:11px;z-index:6;pointer-events:none;border:1px solid rgba(80,255,160,.26);animation:inner-border-pulse 2.2s ease-in-out infinite}.pe-imm-slab-layer{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}.pe-imm-slab{position:absolute;top:-10%;height:120%;transform:rotate(18deg);transform-origin:top center;background:linear-gradient(to bottom,transparent 0%,rgba(40,220,120,.45) 20%,rgba(120,255,190,.75) 50%,rgba(40,220,120,.45) 80%,transparent 100%);filter:blur(1.5px);animation:slab-pulse ease-in-out infinite alternate}.pe-imm-slab:nth-child(1){width:7px;left:10%;animation-duration:2.8s}.pe-imm-slab:nth-child(2){width:5px;left:28%;animation-duration:3.5s;animation-delay:.5s}.pe-imm-slab:nth-child(3){width:9px;left:48%;animation-duration:3.0s;animation-delay:1.1s}.pe-imm-slab:nth-child(4){width:5px;left:66%;animation-duration:3.8s;animation-delay:1.7s}.pe-imm-slab:nth-child(5){width:7px;left:82%;animation-duration:2.6s;animation-delay:.3s}.pe-imm-aurora{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}.pe-imm-aurora-band{position:absolute;left:-20%;right:-20%;animation:aurora-wave ease-in-out infinite alternate}.pe-imm-aurora-band:nth-child(1){height:22px;top:6%;background:linear-gradient(90deg,transparent,rgba(40,255,120,.18),rgba(80,255,160,.24),transparent);animation-duration:3.5s}.pe-imm-aurora-band:nth-child(2){height:17px;top:24%;background:linear-gradient(90deg,transparent,rgba(20,200,100,.14),rgba(60,255,140,.2),transparent);animation-duration:4.8s;animation-delay:.7s}.pe-imm-aurora-band:nth-child(3){height:15px;top:44%;background:linear-gradient(90deg,transparent,rgba(60,220,120,.12),rgba(40,220,255,.12),transparent);animation-duration:4.2s;animation-delay:1.4s}.pe-imm-aurora-band:nth-child(4){height:13px;top:63%;background:linear-gradient(90deg,transparent,rgba(80,255,180,.1),rgba(40,220,120,.16),transparent);animation-duration:5.5s;animation-delay:2.1s}.pe-imm-rings{position:absolute;inset:0;z-index:2;pointer-events:none;display:flex;align-items:center;justify-content:center}.pe-imm-ring{position:absolute;border-radius:50%;border:1px solid rgba(40,220,120,.24);animation:ring-expand ease-out infinite;opacity:0}.pe-imm-ring:nth-child(1){animation-duration:3.5s}.pe-imm-ring:nth-child(2){animation-duration:3.5s;animation-delay:1.17s}.pe-imm-ring:nth-child(3){animation-duration:3.5s;animation-delay:2.34s}.pe-imm-orb-layer{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}.pe-imm-orb{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(100,255,180,.95),rgba(20,160,80,.4),transparent 70%);animation:orb-float ease-in-out infinite}.pe-imm-orb:nth-child(1){width:12px;height:12px;left:8%;top:22%;animation-duration:3.8s}.pe-imm-orb:nth-child(2){width:8px;height:8px;left:78%;top:52%;animation-duration:3.3s;animation-delay:.7s}.pe-imm-orb:nth-child(3){width:10px;height:10px;left:50%;top:12%;animation-duration:4.6s;animation-delay:1.4s}.pe-imm-orb:nth-child(4){width:6px;height:6px;left:26%;top:68%;animation-duration:3.0s;animation-delay:2.0s}.pe-imm-orb:nth-child(5){width:8px;height:8px;left:90%;top:36%;animation-duration:4.0s;animation-delay:.3s}.pe-imm-orb:nth-child(6){width:6px;height:6px;left:62%;top:78%;animation-duration:3.6s;animation-delay:1.0s}.pe-imm-holo{position:absolute;inset:0;z-index:4;pointer-events:none;background:linear-gradient(45deg,rgba(40,220,120,.14),rgba(20,180,80,.1),rgba(80,255,160,.16),rgba(40,200,255,.1),rgba(40,220,120,.14));background-size:300% 300%;animation:holo-sweep 2.4s ease-in-out infinite;mix-blend-mode:screen}.pe-imm-spark-layer{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}.pe-imm-spark{position:absolute;background:#60ffb0;clip-path:polygon(50% 0%,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0% 50%,38% 38%);animation:sp-anim linear infinite;opacity:0}.pe-imm-spark:nth-child(1){width:6px;height:6px;left:6%;top:16%;animation-duration:2.0s}.pe-imm-spark:nth-child(2){width:5px;height:5px;left:82%;top:10%;animation-duration:1.7s;animation-delay:.6s}.pe-imm-spark:nth-child(3){width:4px;height:4px;left:42%;top:50%;animation-duration:2.4s;animation-delay:.3s}.pe-imm-spark:nth-child(4){width:7px;height:7px;left:70%;top:64%;animation-duration:1.9s;animation-delay:1.1s}.pe-imm-spark:nth-child(5){width:5px;height:5px;left:16%;top:72%;animation-duration:2.2s;animation-delay:.5s}.pe-imm-spark:nth-child(6){width:4px;height:4px;left:92%;top:44%;animation-duration:2.3s;animation-delay:1.4s}.pe-imm-spark:nth-child(7){width:6px;height:6px;left:30%;top:28%;animation-duration:1.8s;animation-delay:.9s}.pe-imm-spark:nth-child(8){width:4px;height:4px;left:58%;top:82%;animation-duration:2.5s;animation-delay:1.8s}.pe-imm-tear-layer{position:absolute;inset:0;z-index:5;pointer-events:none;overflow:hidden}.pe-imm-tear{position:absolute;left:0;right:0;animation:tear-glitch ease-in-out infinite;opacity:0}.pe-imm-tear-inner{height:3px;background:linear-gradient(90deg,transparent,rgba(40,255,120,.7),rgba(200,255,220,.9),rgba(40,220,120,.5),transparent)}.pe-imm-tear:nth-child(1){top:20%;animation-duration:5.2s;animation-delay:.3s}.pe-imm-tear:nth-child(2){top:54%;animation-duration:6.0s;animation-delay:2.5s}.pe-imm-tear:nth-child(3){top:74%;animation-duration:4.8s;animation-delay:4.0s}.pe-imm-foil{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden;border-radius:11px}.pe-imm-foil::before{content:'';position:absolute;top:-50%;left:0;right:0;height:50%;background:linear-gradient(180deg,transparent,rgba(100,255,180,.1),rgba(40,220,120,.05),transparent);animation:foil-scroll 4.5s ease-in-out infinite}.pe-imm-foil::after{content:'';position:absolute;top:-100%;left:0;right:0;height:30%;background:linear-gradient(180deg,transparent,rgba(140,255,200,.08),transparent);animation:foil-scroll 4.5s ease-in-out infinite;animation-delay:1.8s}.pe-imm-shine{position:absolute;inset:0;z-index:5;pointer-events:none;border-radius:11px;overflow:hidden}.pe-imm-shine::after{content:'';position:absolute;top:-100%;left:-60%;width:40%;height:300%;background:linear-gradient(105deg,transparent 30%,rgba(140,255,200,.52) 50%,transparent 70%);animation:coin-flip 2.8s ease-in-out infinite}.pe-imm-shock{position:absolute;inset:0;z-index:4;pointer-events:none;display:flex;align-items:center;justify-content:center}.pe-imm-shock-ring{position:absolute;border-radius:50%;border:3px solid rgba(80,255,160,.9);box-shadow:0 0 14px rgba(40,220,120,.9),0 0 36px rgba(40,220,120,.4);animation:shock-expand ease-out infinite;opacity:0}.pe-imm-shock-ring:nth-child(1){animation-duration:2.8s}.pe-imm-shock-ring:nth-child(2){animation-duration:2.8s;animation-delay:.55s}.pe-imm-shock-ring:nth-child(3){animation-duration:2.8s;animation-delay:1.1s}.pe-imm-shock-ring:nth-child(4){animation-duration:2.8s;animation-delay:1.65s}.pe-imm-shock-core{position:absolute;width:20px;height:20px;border-radius:50%;z-index:5;background:radial-gradient(circle,rgba(220,255,230,.95),rgba(40,220,120,.35),transparent 70%);animation:core-pulse 2.8s ease-out infinite}.pe-imm-shock-flash{position:absolute;inset:0;z-index:6;pointer-events:none;border-radius:11px;background:rgba(0,0,0,0);animation:shock-flash 2.8s ease-out infinite}
@media(max-width:1000px){.ldr-pack-wrap,.ldr-fsl.has-p,.ldr-fsl.active{width:100px;height:158px}.ldr-skill-spread{width:calc(100% + 160px);margin:0 -30px}}
@media(max-width:700px){.ldr-pack-wrap,.ldr-fsl.has-p,.ldr-fsl.active{width:82px;height:128px}.ldr-card{min-width:110px}.ldr-cards-row{gap:.4rem}.ldr-skill-spread{width:calc(100% + 100px);margin:0 -20px}.ldr-form-row{gap:6px}.ldr-skill-side{gap:6px}}
@media(max-width:420px){.ldr-pack-wrap,.ldr-fsl.has-p,.ldr-fsl.active{width:64px;height:100px}.ldr-card{min-width:96px}.ldr-skill-spread{width:calc(100% + 60px);margin:0 -10px}}
`;