'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

import { Filter } from 'bad-words';
const filter = new Filter();

/* ─── Types ─────────────────────────────────────────────────────────── */
type Rarity = 'common' | 'rare' | 'dynasty' | 'transcendent' | 'immortal';
type Phase = 'intro' | 'setup' | 'packing' | 'complete';
interface Player { id: string; name: string; pos: string; team: string; score: number; rarity: Rarity; accolades: string[]; }
interface LeaderboardEntry { name: string; score: number; tier: string; icon: string; timestamp: number; lineup: (Player|null)[]; }
interface SavedDraft { id: string; name: string; score: number; tier: string; icon: string; lineup: (Player|null)[]; timestamp: number; }

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
  { min: 20001, label: 'GOAT OFFENSE',       icon: '🐐', color: '#e040ff' },
  { min: 17001, label: 'HALL OF FAME',        icon: '🏛️', color: '#ffd700' },
  { min: 14001, label: 'SUPER BOWL DYNASTY',  icon: '🏆', color: '#f0c030' },
  { min: 11001, label: 'ALL-PRO ELITE',       icon: '⭐', color: '#42c0f8' },
  { min: 8001,  label: 'PRO BOWL CALIBER',   icon: '🔥', color: '#50d870' },
  { min: 5001,  label: 'STARTER QUALITY',    icon: '📈', color: '#a0b8d0' },
  { min: 2001,  label: 'BACKUP UNIT',         icon: '📋', color: '#808080' },
  { min: 0,     label: 'PRACTICE SQUAD',      icon: '🏈', color: '#e8a060' },
];
function getTier(s: number) { return TIERS.find(t => s >= t.min)!; }

/* ─── Pack weights ───────────────────────────────────────────────────── */
const WEIGHTS = {
  normal:  { common: 44, rare: 28, dynasty: 17, transcendent: 10, immortal: 1 },
  captain: { common: 5,  rare: 27, dynasty: 41, transcendent: 22, immortal: 5 },
};

function weightedDraw(poolKey: string, count: number = 5, isCaptain: boolean = false, excl: string[] = []): Player[] {
  const avail = (POOL[poolKey] ?? []).filter(p => !excl.includes(p.id));
  if (avail.length === 0) return [];

  const baseWeights = isCaptain ? WEIGHTS.captain : WEIGHTS.normal;

  // === ONLY apply boost for normal packs (not captain) ===
  const useBoosted = !isCaptain;   // ← This is the key line

  const boostedWeights = {
    ...baseWeights,
    common: 36,
    rare:   42,
    // dynasty, transcendent, immortal stay unchanged
  };

  // Choose which weights to use for each slot
  const normalPool = avail.map(p => ({ p, w: baseWeights[p.rarity] ?? 1 }));
  const boostedPool = avail.map(p => ({ p, w: boostedWeights[p.rarity] ?? 1 }));

  // Pick one random slot to get the boosted weights (only if it's a normal pack)
  const boostedIndex = useBoosted ? Math.floor(Math.random() * count) : -2;

  const used = new Set<string>();
  const result: Player[] = [];

  for (let i = 0; i < Math.min(count, avail.length); i++) {
    // Use boosted weights only on the chosen slot AND only for normal packs
    const currentPool = (useBoosted && i === boostedIndex) ? boostedPool : normalPool;

    const available = currentPool.filter(x => !used.has(x.p.id));
    if (available.length === 0) break;

    const totalWeight = available.reduce((sum, x) => sum + x.w, 0);
    let roll = Math.random() * totalWeight;

    for (const item of available) {
      roll -= item.w;
      if (roll <= 0) {
        result.push(item.p);
        used.add(item.p.id);
        break;
      }
    }
  }

  // Shuffle final pack so boosted card isn't always in same position
  return result.sort(() => Math.random() - 0.5);
}

/* ══════════════════════════════════════════════════════════════════════
   RARITY EFFECTS COMPONENT
══════════════════════════════════════════════════════════════════════ */
function RarityEffects({ rarity, position = 'inner' }: { rarity: Rarity; position?: 'outer' | 'inner' }) {
  if (position === 'outer') {
    return (
      <>
        {rarity === 'rare' && (
          <div className="pe-ra-spin-wrap">
            <div className="pe-ra-spin-arc" /><div className="pe-ra-spin-inner" />
          </div>
        )}
        {rarity === 'dynasty' && (
          <div className="pe-ep-dual-wrap">
            <div className="pe-ep-dual-arc1" /><div className="pe-ep-dual-arc2" /><div className="pe-ep-dual-inner" />
          </div>
        )}
        {rarity === 'transcendent' && (
          <div className="pe-le-plasma-wrap">
            <div className="pe-le-plasma-arc1" /><div className="pe-le-plasma-arc2" /><div className="pe-le-plasma-inner" />
          </div>
        )}
        {rarity === 'immortal' && (
          <>
            <div className="pe-imm-glow-1" /><div className="pe-imm-glow-2" />
            <div className="pe-imm-glow-3" /><div className="pe-imm-glow-4" />
            <div className="pe-imm-corner-arcs">
              <svg viewBox="0 0 125 183" xmlns="http://www.w3.org/2000/svg"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' } as React.CSSProperties}>
                <path className="pe-imm-arc-glow a1" d="M -6,34 Q -6,-6 34,-6" />
                <path className="pe-imm-arc-line a1" d="M -6,34 Q -6,-6 34,-6" />
                <path className="pe-imm-arc-glow a2" d="M 91,-6 Q 131,-6 131,34" />
                <path className="pe-imm-arc-line a2" d="M 91,-6 Q 131,-6 131,34" />
                <path className="pe-imm-arc-glow a3" d="M 131,149 Q 131,189 91,189" />
                <path className="pe-imm-arc-line a3" d="M 131,149 Q 131,189 91,189" />
                <path className="pe-imm-arc-glow a4" d="M 34,189 Q -6,189 -6,149" />
                <path className="pe-imm-arc-line a4" d="M 34,189 Q -6,189 -6,149" />
              </svg>
            </div>
            <div className="pe-imm-plasma-wrap">
              <div className="pe-imm-plasma-arc1" /><div className="pe-imm-plasma-arc2" />
              <div className="pe-imm-plasma-arc3" /><div className="pe-imm-plasma-inner" />
            </div>
          </>
        )}
      </>
    );
  }

  /* ── INNER effects — go inside the art div ── */
  return (
    <>
      {rarity === 'common' && (
        <>
          <div className="pe-cm-scan" />
          <div className="pe-cm-corner tl" /><div className="pe-cm-corner tr" />
          <div className="pe-cm-corner bl" /><div className="pe-cm-corner br" />
          <div className="pe-cm-heat">
            <div className="pe-cm-heat-wave" /><div className="pe-cm-heat-wave" />
            <div className="pe-cm-heat-wave" /><div className="pe-cm-heat-wave" />
          </div>
          <div className="pe-cm-geo">
            <div className="pe-cm-geo-line" /><div className="pe-cm-geo-line" />
            <div className="pe-cm-geo-line" /><div className="pe-cm-geo-line" />
          </div>
          <div className="pe-cm-scratch-layer">
            <div className="pe-cm-scratch" /><div className="pe-cm-scratch" /><div className="pe-cm-scratch" />
          </div>
          <div className="pe-cm-ember-layer">
            <div className="pe-cm-ember" /><div className="pe-cm-ember" /><div className="pe-cm-ember" />
            <div className="pe-cm-ember" /><div className="pe-cm-ember" />
          </div>
          <div className="pe-cm-bottom-glow" />
        </>
      )}

      {rarity === 'rare' && (
        <>
          <div className="pe-ra-depth-vig" />
          <div className="pe-ra-center-glow" />
          <div className="pe-ra-pulse-layer">
            <div className="pe-ra-pulse-ring" /><div className="pe-ra-pulse-ring" /><div className="pe-ra-pulse-ring" />
          </div>
          <div className="pe-ra-crackle-layer">
            <div className="pe-ra-crackle">
              <svg width="100%" height="100%" viewBox="0 0 125 183">
                <polyline className="pe-ra-crackle-path" points="0,18 12,20 8,28 22,24 16,34" />
                <polyline className="pe-ra-crackle-path" points="113,88 121,84 117,94 125,90" />
              </svg>
            </div>
            <div className="pe-ra-crackle">
              <svg width="100%" height="100%" viewBox="0 0 125 183">
                <polyline className="pe-ra-crackle-path" points="0,62 12,58 8,68 20,64 14,76" />
                <polyline className="pe-ra-crackle-path" points="109,14 119,18 115,28 123,22" />
              </svg>
            </div>
            <div className="pe-ra-crackle">
              <svg width="100%" height="100%" viewBox="0 0 125 183">
                <polyline className="pe-ra-crackle-path" points="2,108 14,104 10,114 24,108" />
                <polyline className="pe-ra-crackle-path" points="105,50 115,46 111,58 121,52 117,64" />
              </svg>
            </div>
          </div>
        </>
      )}

      {rarity === 'dynasty' && (
        <>
          <div className="pe-ep-burst">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(100,100)">
                <line x1="0" y1="-95" x2="0" y2="95" stroke="rgba(255,215,0,.35)" strokeWidth=".8" />
                <line x1="-95" y1="0" x2="95" y2="0" stroke="rgba(255,215,0,.35)" strokeWidth=".8" />
                <line x1="-67" y1="-67" x2="67" y2="67" stroke="rgba(255,215,0,.25)" strokeWidth=".8" />
                <line x1="67" y1="-67" x2="-67" y2="67" stroke="rgba(255,215,0,.25)" strokeWidth=".8" />
                <line x1="-36" y1="-90" x2="36" y2="90" stroke="rgba(255,215,0,.18)" strokeWidth=".6" />
                <line x1="36" y1="-90" x2="-36" y2="90" stroke="rgba(255,215,0,.18)" strokeWidth=".6" />
                <line x1="-90" y1="-36" x2="90" y2="36" stroke="rgba(255,215,0,.18)" strokeWidth=".6" />
                <line x1="90" y1="-36" x2="-90" y2="36" stroke="rgba(255,215,0,.18)" strokeWidth=".6" />
              </g>
            </svg>
          </div>
          <div className="pe-ep-sparkle-layer">
            <div className="pe-ep-sparkle" /><div className="pe-ep-sparkle" /><div className="pe-ep-sparkle" />
            <div className="pe-ep-sparkle" /><div className="pe-ep-sparkle" /><div className="pe-ep-sparkle" />
            <div className="pe-ep-sparkle" />
          </div>
          <div className="pe-ep-foil" />
          <div className="pe-ep-shine" />
        </>
      )}

      {rarity === 'transcendent' && (
        <>
          <div className="pe-le-aurora">
            <div className="pe-le-aurora-band" /><div className="pe-le-aurora-band" />
            <div className="pe-le-aurora-band" /><div className="pe-le-aurora-band" />
          </div>
          <div className="pe-le-orb-layer">
            <div className="pe-le-orb" /><div className="pe-le-orb" /><div className="pe-le-orb" />
            <div className="pe-le-orb" /><div className="pe-le-orb" />
          </div>
          <div className="pe-le-holo" />
          <div className="pe-le-depth-rings">
            <div className="pe-le-depth-ring" /><div className="pe-le-depth-ring" /><div className="pe-le-depth-ring" />
          </div>
          <div className="pe-le-bolt-layer">
            {/* bolt 1 — far left, short */}
            <svg className="pe-le-bolt b1" viewBox="0 0 125 183">
              <polyline className="pe-le-bolt-glow" points="8,2 20,28 10,27 26,58 14,56 32,98" />
              <polyline className="pe-le-bolt-mid"  points="8,2 20,28 10,27 26,58 14,56 32,98" />
              <polyline className="pe-le-bolt-core" points="8,2 20,28 10,27 26,58 14,56 32,98" />
              <polyline className="pe-le-bolt-branch" points="26,58 40,68 34,82" />
            </svg>
            {/* bolt 2 — left-center */}
            <svg className="pe-le-bolt b2" viewBox="0 0 125 183">
              <polyline className="pe-le-bolt-glow" points="36,0 50,30 38,28 56,62 42,60 62,110" />
              <polyline className="pe-le-bolt-mid"  points="36,0 50,30 38,28 56,62 42,60 62,110" />
              <polyline className="pe-le-bolt-core" points="36,0 50,30 38,28 56,62 42,60 62,110" />
              <polyline className="pe-le-bolt-branch" points="56,62 70,74 62,90" />
            </svg>
            {/* bolt 3 — center, tallest */}
            <svg className="pe-le-bolt b3" viewBox="0 0 125 183">
              <polyline className="pe-le-bolt-glow" points="62,0 76,28 63,26 84,60 68,58 92,108 74,106 88,150" />
              <polyline className="pe-le-bolt-mid"  points="62,0 76,28 63,26 84,60 68,58 92,108 74,106 88,150" />
              <polyline className="pe-le-bolt-core" points="62,0 76,28 63,26 84,60 68,58 92,108 74,106 88,150" />
              <polyline className="pe-le-bolt-branch" points="84,60 100,74 90,90" />
            </svg>
            {/* bolt 4 — right-center */}
            <svg className="pe-le-bolt b4" viewBox="0 0 125 183">
              <polyline className="pe-le-bolt-glow" points="88,2 100,30 88,28 106,62 92,60 112,104" />
              <polyline className="pe-le-bolt-mid"  points="88,2 100,30 88,28 106,62 92,60 112,104" />
              <polyline className="pe-le-bolt-core" points="88,2 100,30 88,28 106,62 92,60 112,104" />
              <polyline className="pe-le-bolt-branch" points="106,62 118,76 110,92" />
            </svg>
            {/* bolt 5 — far right, offset */}
            <svg className="pe-le-bolt b5" viewBox="0 0 125 183">
              <polyline className="pe-le-bolt-glow" points="116,10 108,36 118,34 104,68 116,66 96,118" />
              <polyline className="pe-le-bolt-mid"  points="116,10 108,36 118,34 104,68 116,66 96,118" />
              <polyline className="pe-le-bolt-core" points="116,10 108,36 118,34 104,68 116,66 96,118" />
            </svg>
            {/* bolt 6 — left edge diagonal */}
            <svg className="pe-le-bolt b6" viewBox="0 0 125 183">
              <polyline className="pe-le-bolt-glow" points="22,15 10,44 22,42 6,78 20,76 2,130" />
              <polyline className="pe-le-bolt-mid"  points="22,15 10,44 22,42 6,78 20,76 2,130" />
              <polyline className="pe-le-bolt-core" points="22,15 10,44 22,42 6,78 20,76 2,130" />
            </svg>
          </div>
          <div className="pe-le-tear-layer">
            <div className="pe-le-tear"><div className="pe-le-tear-inner" /></div>
            <div className="pe-le-tear"><div className="pe-le-tear-inner" /></div>
            <div className="pe-le-tear"><div className="pe-le-tear-inner" /></div>
          </div>
          <div className="pe-le-whiteout w1" />
          <div className="pe-le-whiteout w2" />
          <div className="pe-le-whiteout w3" />
        </>
      )}

      {rarity === 'immortal' && (
        <>
          <div className="pe-imm-slab-layer">
            <div className="pe-imm-slab" /><div className="pe-imm-slab" /><div className="pe-imm-slab" />
            <div className="pe-imm-slab" /><div className="pe-imm-slab" />
          </div>
          <div className="pe-imm-aurora">
            <div className="pe-imm-aurora-band" /><div className="pe-imm-aurora-band" />
            <div className="pe-imm-aurora-band" /><div className="pe-imm-aurora-band" />
          </div>
          <div className="pe-imm-rings">
            <div className="pe-imm-ring" /><div className="pe-imm-ring" /><div className="pe-imm-ring" />
          </div>
          <div className="pe-imm-orb-layer">
            <div className="pe-imm-orb" /><div className="pe-imm-orb" /><div className="pe-imm-orb" />
            <div className="pe-imm-orb" /><div className="pe-imm-orb" /><div className="pe-imm-orb" />
          </div>
          <div className="pe-imm-holo" />
          <div className="pe-imm-foil" />
          <div className="pe-imm-shock">
            <div className="pe-imm-shock-ring" /><div className="pe-imm-shock-ring" />
            <div className="pe-imm-shock-ring" /><div className="pe-imm-shock-ring" />
            <div className="pe-imm-shock-core" />
          </div>
          <div className="pe-imm-spark-layer">
            <div className="pe-imm-spark" /><div className="pe-imm-spark" /><div className="pe-imm-spark" />
            <div className="pe-imm-spark" /><div className="pe-imm-spark" /><div className="pe-imm-spark" />
            <div className="pe-imm-spark" /><div className="pe-imm-spark" />
          </div>
          <div className="pe-imm-tear-layer">
            <div className="pe-imm-tear"><div className="pe-imm-tear-inner" /></div>
            <div className="pe-imm-tear"><div className="pe-imm-tear-inner" /></div>
            <div className="pe-imm-tear"><div className="pe-imm-tear-inner" /></div>
          </div>
          <div className="pe-imm-shine" />
          <div className="pe-imm-shock-flash" />
          <div className="pe-imm-inner-border" />
        </>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════ */
export default function OffensePackEmpire() {
  const [phase, setPhase]           = useState<Phase>('intro');
  const [isReturning, setIsRet]     = useState(false);
  const [lineup, setLineup]         = useState<(Player | null)[]>(Array(11).fill(null));
  const [captainSi, setCaptainSi]   = useState<number | null>(null);
  const [packSi, setPackSi]         = useState<number | null>(null);
  const [packCards, setPackCards]   = useState<Player[]>([]);
  const [revealed, setRevealed]     = useState<boolean[]>([]);
  const [pickedId, setPickedId]     = useState<string | null>(null);
  const [immFlash, setImmFlash]     = useState(false);
  const [showHow, setShowHow]       = useState(false);
  const [userInit, setUserInit]     = useState<string | null>(null);
  const [copied, setCopied]         = useState(false);
  const [draftName, setDraftName]   = useState('');
  const [submitStatus, setSubmit]   = useState<'idle'|'saving'|'saved'|'error'>('idle');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showSaveDraft, setShowSD]  = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([]);
  const [imageMap, setImageMap]     = useState<Record<string, string>>({});
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) { const n = user.user_metadata?.full_name || user.email || 'U'; setUserInit(n[0].toUpperCase()); }
    });
    try { if (localStorage.getItem('pe-has-played')) setIsRet(true); } catch { }
    fetch('/players.csv').then(r => r.ok ? r.text() : Promise.reject()).then(text => {
      const map: Record<string, string> = {};
      text.split('\n').forEach(line => {
        if (!line.trim()) return;
        const cols = parseCSVRow(line);
        const name = cols[1]; const url = cols[22];
        if (name && url && url.startsWith('http')) map[name] = url;
      });
      setImageMap(map);
    }).catch(() => { });

    // load leaderboard from localStorage (site-wide via shared key)
    try {
      const lb = JSON.parse(localStorage.getItem('pe-leaderboard') || '[]') as LeaderboardEntry[];
      setLeaderboard(lb);
    } catch { }

    // load saved drafts for this user
    try {
      const sd = JSON.parse(localStorage.getItem('pe-saved-drafts') || '[]') as SavedDraft[];
      setSavedDrafts(sd);
    } catch { }
  }, []);

  const markPlayed = useCallback(() => { try { localStorage.setItem('pe-has-played', '1'); } catch { } }, []);

  const totalScore  = lineup.reduce((s, p) => s + (p?.score ?? 0), 0);
  const filled      = lineup.filter(Boolean).length;
  const tier        = getTier(totalScore);
  const isBusy      = packCards.length > 0;
  const hiddenCount = revealed.filter(r => !r).length;
  const anyRevealed = revealed.some(Boolean);

  const submitToLeaderboard = useCallback(async (name: string) => {
  if (!name.trim()) return;
  if (filter.isProfane(name)) {
    alert('Please choose an appropriate name.');
    return;
  }
  setSubmit('saving');
  try {
    const supabase = createClient();
    const { error } = await supabase.from('leaderboard').insert({
      name: name.trim(),
      score: totalScore,
      tier: tier.label,
      icon: tier.icon,
      lineup,
    });
    if (error) throw error;
    setSubmit('saved');
    setTimeout(() => setSubmit('idle'), 3000);
  } catch {
    setSubmit('error');
  }
}, [totalScore, tier, lineup]);

  const saveDraft = useCallback(() => {
    if (!draftName.trim()) return;
    try {
      const draft: SavedDraft = {
        id: Date.now().toString(),
        name: draftName.trim(),
        score: totalScore,
        tier: tier.label,
        icon: tier.icon,
        lineup,
        timestamp: Date.now(),
      };
      const existing = JSON.parse(localStorage.getItem('pe-saved-drafts') || '[]') as SavedDraft[];
      const updated = [draft, ...existing].slice(0, 5); // keep top 5
      localStorage.setItem('pe-saved-drafts', JSON.stringify(updated));
      setSavedDrafts(updated);
      setShowSD(false);
      setDraftName('');
    } catch { }
  }, [draftName, totalScore, tier, lineup]);

  const openPack = useCallback((si: number, isCaptain: boolean, curLineup: (Player | null)[]) => {
    const pool = SLOTS[si].pool;
    const excl = curLineup.filter(Boolean).map(p => p!.id);
    const cards = weightedDraw(pool, 5, isCaptain, excl);
    setPackSi(si); setPackCards(cards);
    setRevealed(Array(cards.length).fill(false)); setPickedId(null);
    setTimeout(() => { cardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
  }, []);

  const selectCaptain = useCallback((si: number) => {
    setCaptainSi(si); setPhase('packing'); markPlayed();
  }, [markPlayed]);

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
        if (packCards[i]?.rarity === 'immortal')
          setTimeout(() => { setImmFlash(true); setTimeout(() => setImmFlash(false), 2400); }, 300);
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
        const n = [...prev]; n[packSi!] = card;
        if (n.filter(Boolean).length === 11) {
          setPhase('complete');
          // auth prompt removed — leaderboard submit bar handles this
        }
        return n;
      });
      setPackCards([]); setRevealed([]); setPickedId(null); setPackSi(null);
    }, 650);
  }, [pickedId, revealed, revealOne, packCards, packSi, userInit]);

  const reset = useCallback(() => {
    setPhase('setup'); setLineup(Array(11).fill(null));
    setCaptainSi(null); setPackSi(null);
    setPackCards([]); setRevealed([]); setPickedId(null); setImmFlash(false);
  }, []);

  const share = useCallback(() => {
    const txt = ['🏈 Offense Pack Empire', `${tier.icon} ${tier.label} — ${totalScore.toLocaleString()} pts`, '',
      ...SLOTS.map((s, i) => { const p = lineup[i]; return p ? `${s.short}: ${p.name} (${p.score})` : `${s.short}: Empty`; })
    ].join('\n');
    navigator.clipboard?.writeText(txt).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }, [tier, totalScore, lineup]);

  /* ════════════════════════════════════════════════════════
     FORMATION SLOT
  ════════════════════════════════════════════════════════ */
  const FSlot = ({ si, isSetup = false }: { si: number; isSetup?: boolean }) => {
    const player  = lineup[si];
    const isAct   = packSi === si;
    const isCap   = captainSi === si;
    const canOpen = !player && !isAct && !isBusy && phase === 'packing';
    const rc      = player ? RC[player.rarity] : null;
    const imgSrc  = player ? imageMap[player.name] : undefined;
    const packImg = PACK_IMG[SLOTS[si].pool];
    const isHB    = si === 1;
    const clickable = isSetup || canOpen;

    return (
      <div className={`pe-slot-outer${isHB ? ' hb-back' : ''}`}>
        {player ? (
          /* ── FILLED card ── */
          <div className="pe-fsl has-p"
            style={{ '--rc': rc!.color, '--rg': rc!.glow, '--art': rc!.art } as React.CSSProperties}>

            {/* outer rarity effects (spin borders, plasma, glow) */}
            <RarityEffects rarity={player.rarity} position="outer" />

            <div className="pe-filled-card">
              <div className="pe-fc-topbar" style={{ background: 'rgba(4,8,16,.95)' }}>
                <div className="pe-fc-pos-badge" style={{ background: rc!.color }}>{player.pos}</div>
                <div className="pe-fc-rar-badge" style={{ color: rc!.color }}>{rc!.label}</div>
              </div>
              <div className="pe-fc-art" style={{ background: rc!.art }}>
                <div className="pe-fc-field-lines" />
                {/* inner rarity effects */}
                <RarityEffects rarity={player.rarity} position="inner" />
                {imgSrc && (
                  <img src={imgSrc} alt={player.name} className="pe-fc-img"
                    onError={e => (e.currentTarget.style.display = 'none')} />
                )}
                <div className="pe-fc-initial">{player.name.charAt(0)}</div>
              </div>
              <div className="pe-fc-info">
                <div className="pe-fc-name" style={{ color: rc!.color }}>
                  {(() => {
                    const parts = player.name.trim().split(' ');
                    const suffixes = new Set(['jr.','jr','sr.','sr','ii','iii','iv','v','vi']);
                    const last = parts[parts.length - 1];
                    const isS = suffixes.has(last.toLowerCase());
                    if (isS && parts.length >= 3) return `${parts[parts.length - 2]} ${last}`;
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
          /* ── ACTIVE spinner ── */
          <div className="pe-fsl active">
            <div className="pe-fsl-locked">
              <div className="pe-fsl-pos-small">{SLOTS[si].short}</div>
              <div className="pe-fsl-opening">…</div>
            </div>
          </div>
        ) : (
          /* ── PACK image ── */
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
    <div className="pe-form-row">
      {indices.map(si => <FSlot key={SLOTS[si].key} si={si} isSetup={isSetup} />)}
    </div>
  );

  const FieldLayout = ({ isSetup = false }: { isSetup?: boolean }) => (
    <div className="pe-field">
      <FormRow indices={OL_ROW} isSetup={isSetup} />
      <div className="pe-skill-spread">
        <div className="pe-skill-side">
          {WR_LEFT.map(si => <FSlot key={SLOTS[si].key} si={si} isSetup={isSetup} />)}
        </div>
        <div className="pe-skill-side">
          {WR_RIGHT.map(si => <FSlot key={SLOTS[si].key} si={si} isSetup={isSetup} />)}
        </div>
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

      {/* Immortal pull flash */}
      {immFlash && (
        <div className="pe-imm-flash" aria-hidden="true">
          <div className="pe-imm-text">💎 IMMORTAL PULL!</div>
        </div>
      )}

      {/* Nav */}
      <nav className="pe-nav">
        <div className="pe-nav-l"><Link href="/games/pack-empire" className="pe-back">← Pack Empire</Link></div>
        <div className="pe-nav-c"><span className="pe-pip" />PACK EMPIRE</div>
        <div className="pe-nav-r">
          {userInit
            ? <Link href="/profile" className="pe-nb">{userInit}</Link>
            : <Link href="/login" className="pe-si">SIGN IN</Link>}
        </div>
      </nav>

      {/* Score strip */}
      {(phase === 'packing' || phase === 'complete') && (
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
        {/* ════ INTRO ════ */}
        {phase === 'intro' && (
          <div className="pe-intro">
            <div className="pe-intro-hero">
              <div className="pe-ih-sup">NFL</div>
              <div className="pe-ih-title">OFFENSE PACK<br />EMPIRE</div>
              <div className="pe-ih-sub">Build your ultimate NFL offense by opening card packs</div>
            </div>
            {isReturning ? (
              <div className="pe-intro-ret">
                <div className="pe-ir-title">WELCOME BACK, COACH</div>
                <div className="pe-ir-sub">Ready to build another lineup?</div>
                <button className="pe-play-btn" onClick={() => setPhase('setup')}>LET'S RUN IT BACK →</button>
                <button className="pe-rules-btn" onClick={() => setShowHow(true)}>See the rules again</button>
              </div>
            ) : (
              <div className="pe-intro-new">
                <div className="pe-rules-preview">
                  {[
                    { icon: '⚡', title: 'Pick Your Captain', text: 'Click any position to make it your CAPTAIN. Captain packs have 5× higher immortal odds.' },
                    { icon: '📦', title: 'Open Packs Your Way', text: 'Fill all 11 positions by opening packs in any order you choose — captain last if you dare.' },
                    { icon: '🃏', title: 'Reveal & Pick', text: 'Cards start face-down. Click to flip each one, or Reveal All. Then tap the card you want.' },
                    { icon: '🏆', title: 'Build Your Empire', text: 'Your Accolades Score determines your Offense Tier. Stack legendaries to reach GOAT status (20,000+).' },
                  ].map((r, i) => (
                    <div key={i} className="pe-irp-row">
                      <div className="pe-irp-icon">{r.icon}</div>
                      <div><div className="pe-irp-title">{r.title}</div><div className="pe-irp-text">{r.text}</div></div>
                    </div>
                  ))}
                </div>
                <button className="pe-play-btn" onClick={() => { markPlayed(); setPhase('setup'); }}>BUILD MY OFFENSE →</button>
              </div>
            )}
          </div>
        )}

        {/* ════ SETUP ════ */}
        {phase === 'setup' && (
          <div className="pe-setup">
            <div className="pe-setup-hero">
              <div className="pe-hero-sup">BUILD YOUR</div>
              <div className="pe-hero-title">ULTIMATE<br />OFFENSE</div>
              <div className="pe-hero-sub">Open packs · Draft legends · Build your empire</div>
            </div>
            <div className="pe-setup-inst">
              <span className="pe-inst-bolt">⚡</span>
              Tap any position to set it as your <strong>CAPTAIN</strong>
              <span className="pe-inst-note"> — captain packs have 5× immortal odds</span>
            </div>
            <div className="pe-setup-field"><FieldLayout isSetup /></div>
            <button className="pe-how-link" onClick={() => setShowHow(true)}>📋 How to Play</button>
          </div>
        )}

        {/* ════ PACKING ════ */}
        {phase === 'packing' && (
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

            {/* Pack reveal cards */}
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
                    const rc     = RC[card.rarity];
                    const isRev  = revealed[i];
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
                          {/* outer border effects sit on ci so they aren't clipped by card-front overflow:hidden */}
                          <RarityEffects rarity={card.rarity} position="outer" />
                          {/* Card back */}
                          <div className="pe-card-back">
                            <div className="pe-back-grid" />
                            <div className="pe-back-icon">🏈</div>
                            <div className="pe-back-label">CLICK TO REVEAL</div>
                          </div>
                          {/* Card front */}
                          <div className="pe-card-front">
                            <div className="pe-cf-topbar">
                              <div className="pe-cf-pos" style={{ background: rc.color }}>{card.pos}</div>
                              <div className={`pe-cf-rlab ${card.rarity}`}>{rc.label}</div>
                            </div>
                            <div className="pe-cf-art" style={{ background: rc.art }}>
                              <RarityEffects rarity={card.rarity} position="inner" />
                              {imgSrc && (
                                <img src={imgSrc} alt={card.name} className="pe-cf-img"
                                  onError={e => (e.currentTarget.style.display = 'none')} />
                              )}
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

        {/* ════ COMPLETE ════ */}
        {phase === 'complete' && (
          <div className="pe-complete">
            <div className="pe-comp-hdr">
              <div className="pe-ch-icon">{tier.icon}</div>
              <div className="pe-ch-sup">LINEUP COMPLETE</div>
              <div className="pe-ch-tier" style={{ color: tier.color }}>{tier.label}</div>
              <div className="pe-ch-score">{totalScore.toLocaleString()}</div>
              <div className="pe-ch-lbl">TOTAL ACCOLADES</div>
            </div>
            <div className="pe-comp-field-wrap"><FieldLayout /></div>
            <div className="pe-tier-card">
              {[...TIERS].reverse().map(t => {
                const reached   = totalScore >= t.min;
                const isCurrent = getTier(totalScore) === t;
                return (
                  <div key={t.label} className={`pe-tier-row${isCurrent ? ' active' : ''}`}>
                    <span className="pe-tr-ic">{t.icon}</span>
                    <span className="pe-tr-lbl" style={{ color: t.color }}>{t.label}</span>
                    <span className="pe-tr-min">{t.min.toLocaleString()}+</span>
                    {reached && <span className="pe-tr-ck" style={{ color: t.color }}>✓</span>}
                  </div>
                );
              })}
            </div>
            {/* Leaderboard submit bar */}
            <div className="pe-lb-bar">
              <div className="pe-lb-bar-label">🏆 Submit to Leaderboard</div>
              <div className="pe-lb-bar-row">
                <input
                  className="pe-lb-input"
                  type="text"
                  placeholder="Enter a draft name..."
                  maxLength={32}
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitToLeaderboard(draftName)}
                  autoComplete="off"
                />
                <button
                  className={`pe-lb-submit${submitStatus === 'saved' ? ' saved' : ''}`}
                  onClick={() => submitToLeaderboard(draftName)}
                  disabled={submitStatus === 'saving' || submitStatus === 'saved'}
                >
                  {submitStatus === 'saving' ? '...' : submitStatus === 'saved' ? '✓ Submitted!' : 'Submit'}
                </button>
                <Link href="/games/pack-empire/leaderboard" className="pe-lb-view">View Board</Link>
              </div>
            </div>
            <div className="pe-comp-btns">
              <button className="pe-share-btn" onClick={share}>{copied ? '✓ Copied!' : '↗ Share'}</button>
              <button className="pe-save-draft-btn" onClick={() => setShowSD(true)}>💾 Save Draft</button>
              <button className="pe-restart-btn" onClick={reset}>↺ New</button>
            </div>
          </div>
        )}
      </div>

      {/* How to Play overlay */}
      {showHow && (
        <div className="pe-overlay" onClick={() => setShowHow(false)}>
          <div className="pe-howto" onClick={e => e.stopPropagation()}>
            <div className="pe-ht-title">🏈 HOW TO PLAY</div>
            {[
              'Tap any position to set it as your CAPTAIN. Captain packs have 5% immortal odds vs only 1% in normal packs.',
              'Once you pick a captain the packing phase begins. Tap any position pack to open it — captain last if you dare.',
              'Each pack deals 5 face-down cards. Tap individual cards to flip them, or hit Reveal All.',
              'Once a card is flipped, tap it to PICK that player for the position.',
              'Fill all 11 positions to see your final Offense Tier. You need 20,000+ points for GOAT Offense!',
            ].map((rule, i) => (
              <div key={i} className="pe-ht-rule">
                <div className="pe-ht-num">{i + 1}</div>
                <div className="pe-ht-text">{rule}</div>
              </div>
            ))}
            <div className="pe-ht-tiers">
              {TIERS.map(t => (
                <div key={t.label} className="pe-ht-trow">
                  <span>{t.icon}</span>
                  <span style={{ color: t.color, fontWeight: 700 }}>{t.label}</span>
                  <span className="pe-ht-pts">{t.min.toLocaleString()}+ pts</span>
                </div>
              ))}
            </div>
            <button className="pe-ht-close" onClick={() => setShowHow(false)}>BUILD MY OFFENSE</button>
          </div>
        </div>
      )}

      {/* Save Draft modal */}
      {showSaveDraft && (
        <div className="pe-overlay" onClick={() => setShowSD(false)}>
          <div className="pe-modal" onClick={e => e.stopPropagation()}>
            <div className="pe-mi">💾</div>
            <div className="pe-mt">Save This Draft</div>
            {!userInit ? (
              /* ── not signed in ── */
              <>
                <div className="pe-mb">Sign in to save up to 5 of your favorite builds to your profile and access them anytime.</div>
                <div className="pe-mbtns">
                  <Link href="/login" className="pe-mcta">Sign In to Save</Link>
                  <Link href="/signup" className="pe-msec">Create Free Account</Link>
                </div>
                <button className="pe-mskip" onClick={() => setShowSD(false)}>Maybe Later</button>
              </>
            ) : (
              /* ── signed in ── */
              <>
                <div className="pe-mb">Save up to 5 of your favorite builds to your profile.</div>
                <input
                  className="pe-lb-input"
                  style={{marginBottom:'1rem',width:'100%'}}
                  type="text"
                  placeholder="Name this draft..."
                  maxLength={32}
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveDraft()}
                  autoComplete="off"
                />
                {savedDrafts.length > 0 && (
                  <div className="pe-saved-list">
                    <div className="pe-saved-list-label">Your saved drafts ({savedDrafts.length}/5):</div>
                    {savedDrafts.map(d => (
                      <div key={d.id} className="pe-saved-row">
                        <span className="pe-saved-name">{d.name}</span>
                        <span className="pe-saved-score" style={{color: TIERS.find(t=>t.label===d.tier)?.color??'#3a6080'}}>{d.icon} {d.score.toLocaleString()}</span>
                        <button className="pe-saved-del" onClick={() => {
                          const updated = savedDrafts.filter(x => x.id !== d.id);
                          setSavedDrafts(updated);
                          localStorage.setItem('pe-saved-drafts', JSON.stringify(updated));
                        }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pe-mbtns">
                  <button className="pe-mcta" style={{border:'none',cursor:'pointer'}} onClick={saveDraft}
                    disabled={!draftName.trim() || savedDrafts.length >= 5}>
                    {savedDrafts.length >= 5 ? 'Delete one to save more' : 'Save Draft'}
                  </button>
                </div>
                <button className="pe-mskip" onClick={() => setShowSD(false)}>Cancel</button>
              </>
            )}
          </div>
        </div>
      )}
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
.pe-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:.7rem 1.2rem;
  border-bottom:2px solid #0d1835;position:sticky;top:0;background:#050a18;z-index:30}
.pe-nav-l{justify-self:start}
.pe-nav-c{display:flex;align-items:center;gap:.6rem;font-family:'Orbitron',sans-serif;font-weight:700;
  font-size:.95rem;letter-spacing:.22em;color:#ffd700;justify-self:center;text-shadow:0 0 24px rgba(255,215,0,.5)}
.pe-nav-r{justify-self:end}
.pe-pip{width:9px;height:9px;border-radius:50%;background:#ffd700;flex-shrink:0;
  box-shadow:0 0 12px #ffd700,0 0 28px rgba(255,215,0,.6);animation:pip-pulse 2s ease-in-out infinite}
@keyframes pip-pulse{0%,100%{box-shadow:0 0 12px #ffd700,0 0 28px rgba(255,215,0,.6)}50%{box-shadow:0 0 22px #ffd700,0 0 48px rgba(255,215,0,.8)}}
.pe-back{color:#2a4060;text-decoration:none;font-size:.85rem;transition:.15s}
.pe-back:hover{color:#d4e8f8}
.pe-nb{width:30px;height:30px;border-radius:50%;background:#0a1428;border:2px solid #ffd700;
  color:#ffd700;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.85rem;
  display:flex;align-items:center;justify-content:center;text-decoration:none}
.pe-nb:hover{background:#ffd700;color:#050a18}
.pe-si{font-family:'Barlow Condensed',sans-serif;font-size:.72rem;font-weight:700;letter-spacing:.1em;
  color:#1a3050;text-decoration:none;border:1px solid #0d1835;padding:.25rem .65rem;border-radius:4px;transition:.15s}
.pe-si:hover{color:#ffd700;border-color:#ffd700}

/* ── Immortal flash ── */
.pe-imm-flash{position:fixed;inset:0;z-index:250;pointer-events:none;
  background:radial-gradient(ellipse at center,rgba(40,220,120,.35),rgba(10,60,30,.2) 40%,transparent 70%);
  display:flex;align-items:center;justify-content:center;animation:imm-in 2.4s ease both}
@keyframes imm-in{0%{opacity:0}10%{opacity:1}80%{opacity:1}100%{opacity:0}}
.pe-imm-text{font-family:'Orbitron',sans-serif;font-weight:900;font-size:clamp(1.6rem,5vw,3rem);
  letter-spacing:.18em;color:#28dc78;text-shadow:0 0 40px #28dc78,0 0 80px rgba(40,220,120,.7);
  animation:imm-pop .55s cubic-bezier(.36,1.6,.64,1) both}
@keyframes imm-pop{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}

/* ── Score strip ── */
.pe-strip{background:rgba(5,10,24,.96);border-bottom:2px solid #0d1835;display:flex;align-items:center;
  padding:.5rem 1.2rem;position:sticky;top:50px;z-index:20;backdrop-filter:blur(8px);overflow:hidden}
.pe-sg{flex:1;text-align:center;padding:0 .4rem}
.pe-sv{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.4rem;line-height:1;color:#d4e8f8;transition:color .4s}
.pe-sof{font-size:.85rem;color:#2a4060}
.pe-sl{font-size:.52rem;color:#2a4060;letter-spacing:.2em;text-transform:uppercase;margin-top:2px}
.pe-stier{font-size:.9rem;font-weight:700;letter-spacing:.06em;transition:color .4s}
.pe-sdiv{width:1px;height:38px;background:#0d1835;flex-shrink:0}
.pe-sbar{position:absolute;bottom:0;left:0;right:0;height:3px;background:#0d1835}
.pe-sfill{height:100%;background:linear-gradient(90deg,#a07020,#ffd700);transition:width .5s ease}

/* ── Root ── */
.pe-root{min-height:calc(100vh - 50px);background:#050a18;
  background-image:radial-gradient(ellipse at 50% -10%,rgba(255,215,0,.05),transparent 55%),
    repeating-linear-gradient(0deg,transparent,transparent 70px,rgba(255,255,255,.014) 70px,rgba(255,255,255,.014) 71px),
    repeating-linear-gradient(90deg,transparent,transparent 70px,rgba(255,255,255,.014) 70px,rgba(255,255,255,.014) 71px)}

/* ══ INTRO ══ */
.pe-intro{max-width:640px;margin:0 auto;padding:1.5rem 1.2rem 4rem}
.pe-intro-hero{text-align:center;margin-bottom:1.5rem;padding:1.5rem 1rem;
  background:radial-gradient(ellipse at 50% 0%,rgba(255,215,0,.07),transparent 65%)}
.pe-ih-sup{font-size:.65rem;letter-spacing:.45em;color:#3a6080;margin-bottom:.3rem}
.pe-ih-title{font-family:'Orbitron',sans-serif;font-weight:900;font-size:clamp(2rem,7vw,4rem);
  line-height:.92;letter-spacing:.04em;
  background:linear-gradient(135deg,#c8a820,#ffd700 40%,#f0c030 70%,#c8a820);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:.7rem}
.pe-ih-sub{font-size:.9rem;color:#3a6080;letter-spacing:.08em}
.pe-intro-ret{text-align:center;padding:1.5rem;background:rgba(8,14,30,.7);border:1px solid #1a3060;border-radius:16px;margin-bottom:1rem}
.pe-ir-title{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.3rem;letter-spacing:.12em;color:#d4e8f8;margin-bottom:.4rem}
.pe-ir-sub{color:#3a6080;font-size:.9rem;margin-bottom:1.2rem}
.pe-rules-preview{display:flex;flex-direction:column;gap:.8rem;margin-bottom:1.5rem;
  background:rgba(8,14,30,.7);border:1px solid #0d1835;border-radius:14px;padding:1.2rem}
.pe-irp-row{display:flex;gap:.9rem;align-items:flex-start}
.pe-irp-icon{font-size:1.3rem;min-width:28px;text-align:center}
.pe-irp-title{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;color:#ffd700;letter-spacing:.08em;margin-bottom:2px}
.pe-irp-text{font-family:'Barlow',sans-serif;font-size:.82rem;color:#5a8ab0;line-height:1.5}
.pe-play-btn{display:block;width:100%;background:linear-gradient(135deg,#a07020,#ffd700);
  color:#050a18;border:none;border-radius:12px;padding:1rem;margin-bottom:.7rem;
  font-family:'Orbitron',sans-serif;font-weight:700;font-size:1rem;letter-spacing:.16em;cursor:pointer;transition:all .2s}
.pe-play-btn:hover{filter:brightness(1.1);transform:scale(1.02)}
.pe-rules-btn{display:block;width:100%;background:none;border:1px solid #1a3050;color:#3a6080;
  border-radius:8px;padding:.65rem;font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:.85rem;
  letter-spacing:.1em;cursor:pointer;transition:.15s;text-align:center}
.pe-rules-btn:hover{border-color:#ffd700;color:#ffd700}

/* ══ SETUP ══ */
.pe-setup{max-width:1200px;margin:0 auto;padding:1rem 1rem 3rem}
.pe-setup-hero{text-align:center;margin-bottom:1rem;padding:1rem}
.pe-hero-sup{font-size:.65rem;letter-spacing:.4em;color:#3a6080;margin-bottom:.2rem}
.pe-hero-title{font-family:'Orbitron',sans-serif;font-weight:900;font-size:clamp(1.8rem,5vw,3rem);
  line-height:.95;letter-spacing:.04em;
  background:linear-gradient(135deg,#c8a820,#ffd700 40%,#f0c030 70%,#c8a820);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:.5rem}
.pe-hero-sub{font-size:.85rem;color:#3a6080;letter-spacing:.08em}
.pe-setup-inst{text-align:center;font-size:.9rem;color:#5a8ab0;margin-bottom:1rem;
  padding:.55rem .9rem;background:rgba(255,215,0,.04);border:1px solid rgba(255,215,0,.12);border-radius:8px;line-height:1.5}
.pe-setup-inst strong{color:#ffd700}
.pe-inst-bolt{color:#ffd700;margin-right:.3rem}
.pe-inst-note{color:#2a4060;font-size:.8rem}
.pe-setup-field{background:rgba(8,14,30,.7);border:1px solid #0d1835;border-radius:16px;
  padding:1rem .8rem;margin-bottom:.8rem;overflow:hidden}
.pe-how-link{display:block;text-align:center;background:none;border:none;color:#2a4060;
  font-family:'Barlow Condensed',sans-serif;font-size:.8rem;letter-spacing:.12em;cursor:pointer;margin:.8rem auto 0;transition:.15s}
.pe-how-link:hover{color:#7aa0c0}

/* ════ FIELD LAYOUT ════ */
.pe-field{display:flex;flex-direction:column;align-items:center;gap:18px;width:fit-content;margin:0 auto}
.pe-form-row{display:flex;gap:16px}
.pe-skill-spread{display:flex;justify-content:space-between;align-items:flex-end;width:calc(100% + 380px);margin:0 -40px}
.pe-skill-side{display:flex;gap:18px}

/* ════ SLOT OUTER ════ */
.pe-slot-outer{display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;background:transparent;border:none}
.pe-slot-outer.hb-back{margin-top:16px;margin-left:8px}
.pe-slot-label{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.62rem;letter-spacing:.12em;color:#3a6080;text-align:center;line-height:1}
.pe-slot-label.cap{color:#c040ff;text-shadow:0 0 8px rgba(192,64,255,.7)}

/* ════ PACK IMAGE ════ */
.pe-pack-wrap{position:relative;display:flex;align-items:center;justify-content:center;cursor:default;width:125px;height:183px;flex-shrink:0}
.pe-pack-img{width:100% !important;height:100% !important;object-fit:cover;display:block;background:transparent}
.pe-pack-wrap.clickable{cursor:pointer;transition:transform .18s ease,filter .18s ease}
.pe-pack-wrap.clickable:hover{transform:translateY(-6px) scale(1.07);filter:drop-shadow(0 0 10px rgba(255,215,0,.7))}
.pe-pack-wrap.is-cap{animation:cap-drop-pulse 1.9s ease-in-out infinite}
@keyframes cap-drop-pulse{0%,100%{filter:drop-shadow(0 0 8px rgba(160,32,240,.9))}50%{filter:drop-shadow(0 0 18px rgba(224,64,255,1))}}
.pe-pack-cap-badge{position:absolute;top:-8px;left:0;right:0;text-align:center;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.7rem;letter-spacing:.18em;color:#ffd700;text-shadow:0 0 8px rgba(255,215,0,.95);z-index:2;pointer-events:none}

/* ════ FILLED SLOT ════ */
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

/* Filled card internals */
.pe-filled-card{position:absolute;inset:0;display:flex;flex-direction:column;overflow:hidden;border-radius:9px}
.pe-fc-topbar{height:25px;flex-shrink:0;width:100%;display:flex;align-items:center;justify-content:space-between;padding:.25rem .35rem;background:rgba(4,8,16,.95);border-bottom:1px solid rgba(255,255,255,.08)}
.pe-fc-pos-badge{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.55rem;letter-spacing:.12em;color:#fff;padding:1px 5px;border-radius:3px}
.pe-fc-rar-badge{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.50rem;letter-spacing:.18em;opacity:.9}
.pe-fc-art{flex:1;position:relative;overflow:hidden;background:var(--art);display:flex;align-items:center;justify-content:center}
.pe-fc-img{position:absolute;bottom:3px;left:50%;transform:translateX(-50%);height:105%;width:auto;object-fit:contain;object-position:center bottom;z-index:10}
.pe-fc-initial{font-family:'Orbitron',sans-serif;font-weight:900;font-size:3.2rem;color:rgba(255,255,255,.12);position:absolute;bottom:-4px;right:-4px;z-index:1}
.pe-fc-field-lines{position:absolute;inset:0;z-index:1;pointer-events:none;
  background-image:repeating-linear-gradient(0deg,transparent,transparent 16px,rgba(255,255,255,.1) 16px,rgba(255,255,255,.1) 17px),linear-gradient(180deg,rgba(0,0,0,.1),transparent 50%,rgba(0,0,0,.25));
  border-bottom:2px solid var(--rc,rgba(255,255,255,.4))}
.pe-fc-info{flex-shrink:0;padding:.35rem .4rem .3rem;width:100%;background:linear-gradient(to bottom,rgba(4,8,16,.9),rgba(4,8,16,.98));border-top:2px solid var(--rc,rgba(255,255,255,.1))}
.pe-fc-name{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.82rem;line-height:1;letter-spacing:.02em;color:var(--rc,#e0eef8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pe-fc-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1rem;line-height:1.1;color:#d4e8f8;margin-top:2px}
.pe-fc-rar{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.48rem;letter-spacing:.2em;margin-top:2px;opacity:.9;color:var(--rc)}
.pe-fc-team-tag{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:.48rem;letter-spacing:.1em;margin-top:2px;color:#3a6080;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pe-fc-cap-badge{position:absolute;top:-18px;left:50%;transform:translateX(-50%);
  font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.58rem;letter-spacing:.14em;
  color:#ffd700;background:rgba(5,10,24,.9);border:1px solid rgba(255,215,0,.5);
  border-radius:4px;padding:1px 7px;white-space:nowrap;z-index:10;
  text-shadow:0 0 8px rgba(255,215,0,.8);pointer-events:none}
.pe-fc-shine{position:absolute;inset:0;pointer-events:none;z-index:4;background:linear-gradient(135deg,transparent 45%,rgba(255,255,255,.06) 50%,transparent 55%)}

/* ══ PACKING ══ */
.pe-packing{max-width:1200px;margin:0 auto;padding:.8rem 1rem 3rem}
.pe-formation-wrap{background:rgba(8,14,30,.7);border:1px solid #0d1835;border-radius:14px;padding:.8rem .6rem;margin-bottom:.8rem;overflow:hidden}
.pe-cap-banner{display:flex;align-items:center;justify-content:center;gap:.6rem;font-size:.78rem;color:#5a8ab0;letter-spacing:.06em;margin-bottom:.8rem;padding:.45rem .8rem;background:rgba(192,64,255,.07);border:1px solid rgba(192,64,255,.2);border-radius:6px}
.pe-cap-bolt{color:#e040ff;font-size:.9rem}
.pe-cap-txt{font-family:'Barlow Condensed',sans-serif;font-weight:600}

.pe-cards-area{background:rgba(6,10,22,.9);border:1px solid #0d1835;border-radius:14px;padding:1rem}
.pe-ca-header{text-align:center;margin-bottom:.9rem}
.pe-cap-tag{display:inline-block;font-size:.6rem;letter-spacing:.2em;font-weight:800;color:#e040ff;background:rgba(224,64,255,.1);border:1px solid rgba(224,64,255,.35);border-radius:3px;padding:3px 10px;margin-bottom:.4rem;box-shadow:0 0 12px rgba(224,64,255,.3);animation:cap-tag-glow 2s ease-in-out infinite}
@keyframes cap-tag-glow{0%,100%{box-shadow:0 0 12px rgba(224,64,255,.3)}50%{box-shadow:0 0 24px rgba(224,64,255,.6)}}
.pe-ca-pos{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.2rem;letter-spacing:.08em;color:#d4e8f8;margin-bottom:.2rem}
.pe-ca-status{font-size:.8rem;color:#3a6080;letter-spacing:.06em}
.pe-cards-row{display:flex;gap:.55rem;justify-content:center;flex-wrap:wrap;padding:.3rem 0}

/* Individual pack reveal cards */
.pe-card{width:136px;flex-shrink:0;perspective:1000px;position:relative;cursor:pointer;transition:transform .2s ease,opacity .3s;z-index:1}
.pe-card:hover{z-index:10}
.pe-card.rev.selectable:hover{transform:translateY(-14px) scale(1.07)}
.pe-card.rev.selectable:hover .pe-card-front{box-shadow:0 0 40px var(--rg),0 16px 36px rgba(0,0,0,.7);border-color:var(--rc)}
.pe-card.picked{transform:scale(1.08) translateY(-14px);z-index:20}
.pe-card.rejected{opacity:.22;transform:scale(.9);filter:grayscale(.6)}
.pe-ci{position:relative;width:100%;height:208px;transform-style:preserve-3d;transition:transform .7s cubic-bezier(.4,0,.2,1);overflow:visible}
.pe-card.rev .pe-ci{transform:rotateY(180deg)}
.pe-card-back,.pe-card-front{position:absolute;inset:0;border-radius:11px;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden}
.pe-card-back{background:linear-gradient(155deg,#080e24,#0c1840);border:2px solid #1a3060;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4rem}
.pe-back-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);background-size:14px 14px}
.pe-back-icon{font-size:2.2rem;opacity:.18;position:relative;z-index:1}
.pe-back-label{font-size:.58rem;letter-spacing:.2em;color:#1a3060;font-family:'Barlow Condensed',sans-serif;position:relative;z-index:1}
.pe-card-front{background:linear-gradient(170deg,#080e24,#0b1438);border:2px solid var(--sh,#333);transform:rotateY(180deg);box-shadow:0 0 18px var(--rg,transparent),inset 0 1px 0 rgba(255,255,255,.06);position:relative}
.pe-cf-topbar{display:flex;align-items:center;justify-content:space-between;padding:.35rem .5rem .15rem}
.pe-cf-pos{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.62rem;letter-spacing:.12em;color:#fff;padding:2px 5px;border-radius:3px}
.pe-cf-rlab{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.52rem;letter-spacing:.18em;color:var(--rc);opacity:.9}
.pe-cf-rlab.transcendent{background:linear-gradient(90deg,#d060f0,#ff90ff,#d060f0);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:holo-shift 2s linear infinite}
.pe-cf-rlab.immortal{background:linear-gradient(90deg,#20c060,#80ffb8,#20c060);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:holo-shift 1.6s linear infinite}
@keyframes holo-shift{from{background-position:0%}to{background-position:200%}}
.pe-cf-art{height:90px;position:relative;overflow:hidden;background:var(--art);display:flex;align-items:center;justify-content:center}
.pe-cf-img{position:absolute;bottom:-10px;left:50%;transform:translateX(-50%);height:118%;width:auto;object-fit:contain;object-position:center bottom;z-index:10}
.pe-cf-initial{font-family:'Orbitron',sans-serif;font-weight:900;font-size:4rem;color:rgba(255,255,255,.1);line-height:1;position:absolute;bottom:-8px;right:-6px;z-index:1}
.pe-cf-body{padding:.35rem .5rem .4rem}
.pe-cf-name{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.88rem;color:#e0eef8;letter-spacing:.02em;line-height:1.15;margin-bottom:1px}
.pe-cf-team{font-size:.5rem;color:#3a6080;letter-spacing:.04em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pe-cf-line{height:1.5px;margin:.3rem 0 .25rem;opacity:.4;border-radius:1px}
.pe-cf-score-row{display:flex;align-items:baseline;gap:.3rem;margin-bottom:.25rem}
.pe-cf-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1.4rem;line-height:1}
.pe-cf-ovr{font-size:.45rem;color:#2a4060;letter-spacing:.18em}
.pe-cf-acc{font-size:.45rem;color:#3a6080;line-height:1.5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

.pe-reveal-bar{text-align:center;margin-top:.9rem}
.pe-reveal-btn{background:linear-gradient(135deg,#0d1835,#142040);border:2px solid #ffd700;border-radius:8px;color:#ffd700;font-family:'Orbitron',sans-serif;font-weight:700;font-size:.82rem;letter-spacing:.16em;padding:.6rem 2rem;cursor:pointer;transition:all .22s}
.pe-reveal-btn:hover{background:rgba(255,215,0,.1);box-shadow:0 0 24px rgba(255,215,0,.3);transform:scale(1.03)}

.pe-empty-prompt{text-align:center;padding:1.2rem 1rem;margin-top:.4rem}
.pe-ep-arrow{font-size:1.8rem;color:#1a3050;animation:bob 2s ease-in-out infinite;display:block;margin-bottom:.3rem}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
.pe-ep-text{font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:700;letter-spacing:.12em;color:#3a6080;margin-bottom:.25rem}
.pe-ep-sub{font-size:.75rem;color:#1a3050;letter-spacing:.08em}

/* ══ COMPLETE ══ */
.pe-complete{max-width:1200px;margin:0 auto;padding:1rem 1rem 4rem}
.pe-comp-hdr{text-align:center;padding:1.2rem 1rem;background:radial-gradient(ellipse at 50% 0%,rgba(255,215,0,.09),transparent 65%);margin-bottom:.9rem}
.pe-ch-icon{font-size:2.8rem;margin-bottom:.4rem;animation:icon-pop .7s cubic-bezier(.36,1.6,.64,1)}
@keyframes icon-pop{from{transform:rotate(-20deg) scale(0)}to{transform:rotate(0) scale(1)}}
.pe-ch-sup{font-size:.6rem;letter-spacing:.38em;color:#2a4060;text-transform:uppercase;margin-bottom:.25rem}
.pe-ch-tier{font-family:'Orbitron',sans-serif;font-weight:900;font-size:clamp(1.2rem,4vw,2rem);letter-spacing:.1em;margin-bottom:.35rem}
.pe-ch-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:clamp(2.8rem,8vw,5rem);line-height:1;background:linear-gradient(135deg,#c8a820,#ffd700,#f0c030);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:score-pop .8s cubic-bezier(.34,1.2,.64,1)}
@keyframes score-pop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
.pe-ch-lbl{font-size:.58rem;color:#2a4060;letter-spacing:.24em}
.pe-comp-field-wrap{background:rgba(6,10,22,.9);border:1px solid #0d1835;border-radius:14px;padding:.8rem;margin-bottom:1rem;overflow:hidden}
.pe-tier-card{background:#07101e;border:1px solid #0d1835;border-radius:12px;padding:.9rem 1.1rem;margin-bottom:1rem}
.pe-tier-row{display:flex;align-items:center;gap:.7rem;padding:.28rem 0;border-bottom:1px solid #0a1228;font-family:'Barlow Condensed',sans-serif}
.pe-tier-row:last-child{border-bottom:none}
.pe-tier-row.active{background:rgba(255,215,0,.05);border-radius:6px;padding:.28rem .6rem;margin:0 -.6rem}
.pe-tr-ic{font-size:.9rem;width:20px;text-align:center}
.pe-tr-lbl{font-size:.75rem;font-weight:700;letter-spacing:.06em;flex:1}
.pe-tr-min{font-size:.62rem;color:#1a3050;margin-left:auto}
.pe-tr-ck{font-size:.8rem;font-weight:700}
.pe-comp-btns{display:flex;gap:.65rem;margin-bottom:.9rem}
.pe-share-btn{flex:1;background:linear-gradient(135deg,#a07020,#ffd700);color:#050a18;border:none;border-radius:8px;padding:.85rem 1rem;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.95rem;letter-spacing:.12em;cursor:pointer;transition:.2s}
.pe-share-btn:hover{filter:brightness(1.1);transform:scale(1.02)}
.pe-restart-btn{background:transparent;border:2px solid #1a3050;color:#3a6080;border-radius:8px;padding:.85rem 1.4rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:.1em;cursor:pointer;transition:.2s}
.pe-restart-btn:hover{border-color:#ffd700;color:#ffd700}
.pe-save-link{display:block;text-align:center;background:none;border:none;color:#1a3050;font-size:.75rem;cursor:pointer;letter-spacing:.08em;font-family:'Barlow Condensed',sans-serif;transition:.15s;margin-top:.4rem}
.pe-save-link:hover{color:#3a6080}

/* ── Overlays ── */
.pe-overlay{position:fixed;inset:0;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(10px);padding:1rem}
.pe-howto{background:#07101e;border:2px solid #1a3050;border-radius:16px;padding:1.5rem;max-width:520px;width:100%;max-height:88vh;overflow-y:auto;animation:fade-up .3s ease}
.pe-howto::-webkit-scrollbar{width:4px}
.pe-howto::-webkit-scrollbar-thumb{background:#0d1835}
@keyframes fade-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.pe-ht-title{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.2rem;letter-spacing:.15em;color:#ffd700;margin-bottom:1.1rem;text-align:center}
.pe-ht-rule{display:flex;gap:.8rem;margin-bottom:.85rem;align-items:flex-start}
.pe-ht-num{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.05rem;color:#ffd700;min-width:20px;line-height:1.2}
.pe-ht-text{font-family:'Barlow',sans-serif;font-size:.85rem;color:#5a8ab0;line-height:1.6}
.pe-ht-tiers{background:#040810;border:1px solid #0d1835;border-radius:8px;padding:.8rem;margin-top:.8rem}
.pe-ht-trow{display:flex;align-items:center;gap:.7rem;padding:.24rem 0;font-family:'Barlow Condensed',sans-serif;font-size:.8rem;font-weight:600}
.pe-ht-pts{margin-left:auto;color:#1a3050;font-size:.68rem}
.pe-ht-close{width:100%;margin-top:1.1rem;background:linear-gradient(135deg,#a07020,#ffd700);color:#050a18;border:none;border-radius:8px;padding:.85rem;font-family:'Orbitron',sans-serif;font-weight:700;font-size:.92rem;letter-spacing:.15em;cursor:pointer;transition:.2s}
.pe-ht-close:hover{filter:brightness(1.1)}
.pe-modal{background:#07101e;border:2px solid #1a3050;border-radius:20px;padding:2rem 1.8rem;max-width:320px;width:100%;text-align:center;animation:fade-up .3s ease}
.pe-mi{font-size:2.6rem;margin-bottom:.7rem}
.pe-mt{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.3rem;letter-spacing:.08em;color:#d4e8f8;margin-bottom:.45rem}
.pe-mb{font-size:.85rem;color:#3a6080;line-height:1.6;margin-bottom:1.2rem;font-family:'Barlow',sans-serif}
.pe-mbtns{display:flex;flex-direction:column;gap:.55rem;margin-bottom:.7rem}
.pe-mcta{display:block;background:linear-gradient(135deg,#a07020,#ffd700);color:#050a18;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.95rem;letter-spacing:.08em;padding:.8rem;border-radius:10px;text-decoration:none;text-align:center}
.pe-mcta:hover{filter:brightness(1.1)}
.pe-msec{display:block;background:transparent;border:2px solid #1a3050;color:#5a8ab0;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:.06em;padding:.7rem;border-radius:10px;text-decoration:none;text-align:center}
.pe-msec:hover{border-color:#ffd700;color:#ffd700}
.pe-mskip{background:none;border:none;color:#1a3050;font-size:.74rem;cursor:pointer;font-family:'Barlow Condensed',sans-serif;letter-spacing:.1em;transition:.15s}
.pe-mskip:hover{color:#3a6080}

/* ════════════════════════════════════════════════════════
   SHARED RARITY ANIMATIONS
════════════════════════════════════════════════════════ */
@keyframes border-spin   {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes orb-float     {0%,100%{transform:translateY(0) scale(1);opacity:.55}33%{transform:translateY(-12px) scale(1.2);opacity:1}66%{transform:translateY(-5px) scale(.9);opacity:.65}}
@keyframes sp-anim       {0%{transform:scale(0) rotate(0deg);opacity:0}20%{transform:scale(1) rotate(45deg);opacity:1}70%{transform:scale(.8) rotate(180deg);opacity:.8}100%{transform:scale(0) rotate(360deg);opacity:0}}
@keyframes aurora-wave   {0%{transform:translateX(-6%) skewX(-1deg);opacity:.6}100%{transform:translateX(6%) skewX(1deg);opacity:1}}
@keyframes tear-glitch   {0%,82%,100%{opacity:0;transform:translateX(0)}83%,86%{opacity:1;transform:translateX(-8px)}84%,87%{opacity:.5;transform:translateX(5px)}85%{opacity:1;transform:translateX(-3px)}88%{opacity:0}}
@keyframes holo-sweep    {0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes glow-breathe  {0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}
@keyframes foil-scroll   {0%{top:-50%}100%{top:120%}}
@keyframes coin-flip     {0%,38%{transform:translateX(0)}39%,100%{transform:translateX(420px)}}
@keyframes pulse-expand  {0%{width:14px;height:14px;opacity:.9;box-shadow:0 0 8px rgba(66,192,248,.6)}100%{width:140px;height:140px;opacity:0}}
@keyframes ring-expand   {0%{width:10px;height:10px;opacity:.75}100%{width:220px;height:220px;opacity:0}}
@keyframes shock-expand  {0%{width:8px;height:8px;opacity:1;border-width:4px}25%{opacity:.9;border-width:2.5px}100%{width:280px;height:280px;opacity:0;border-width:.5px}}
@keyframes core-pulse    {0%{transform:scale(0);opacity:0}7%{transform:scale(3.5);opacity:1}28%{transform:scale(1.4);opacity:.35}100%{transform:scale(1);opacity:0}}
@keyframes shock-flash   {0%,5%,20%,100%{background:rgba(0,0,0,0)}7%{background:rgba(80,255,160,.5)}10%{background:rgba(40,220,120,.1)}15%{background:rgba(0,0,0,0)}}
@keyframes slab-pulse    {0%{opacity:.07;transform:rotate(18deg) scaleY(.96)}100%{opacity:.52;transform:rotate(18deg) scaleY(1.02)}}
@keyframes corner-arc-fade{0%,55%,100%{opacity:0}65%{opacity:1}85%{opacity:.9}95%{opacity:0}}
@keyframes heat-drift    {0%{transform:translateY(0) scaleX(1);opacity:0}15%{opacity:1}100%{transform:translateY(-65px) scaleX(.5);opacity:0}}
@keyframes geo-shimmer   {0%{opacity:.1}100%{opacity:.55}}
@keyframes scratch-flick {0%,100%{opacity:.15}45%,55%{opacity:.7}}
@keyframes ember-rise    {0%{transform:translateY(0) scale(1);opacity:0}12%{opacity:.8}100%{transform:translateY(-90px) translateX(6px) scale(0);opacity:0}}
@keyframes scan-line     {0%{top:-2px;opacity:0}8%{opacity:1}92%{opacity:.6}100%{top:100%;opacity:0}}
@keyframes crackle-flash {0%,84%,93%,100%{opacity:0}85%,92%{opacity:1}88%{opacity:.3}}
@keyframes center-glow   {0%,100%{opacity:.6}50%{opacity:1}}
@keyframes bolt-flash    {0%,43%,50%,100%{opacity:0}44%,48%{opacity:1}46%{opacity:.25}}
@keyframes whiteout-leg  {0%,42%,52%,100%{background:rgba(255,255,255,0)}44%{background:rgba(255,200,255,.65)}47%{background:rgba(255,220,255,.12)}50%{background:rgba(255,255,255,.04)}}
@keyframes inner-border-pulse{0%,100%{box-shadow:inset 0 0 18px rgba(40,220,120,.16),inset 0 0 44px rgba(40,220,120,.05)}50%{box-shadow:inset 0 0 30px rgba(80,255,160,.35),inset 0 0 65px rgba(40,220,120,.12)}}

/* ════════════════════════════════════════════════════════
   1. COMMON
════════════════════════════════════════════════════════ */
.pe-cm-corner{position:absolute;z-index:5;width:10px;height:10px;pointer-events:none}
.pe-cm-corner::before,.pe-cm-corner::after{content:'';position:absolute;background:#c87840;opacity:.5}
.pe-cm-corner::before{width:100%;height:1.5px;top:0;left:0}
.pe-cm-corner::after{width:1.5px;height:100%;top:0;left:0}
.pe-cm-corner.tl{top:-1px;left:-1px}
.pe-cm-corner.tr{top:-1px;right:-1px;transform:scaleX(-1)}
.pe-cm-corner.bl{bottom:-1px;left:-1px;transform:scaleY(-1)}
.pe-cm-corner.br{bottom:-1px;right:-1px;transform:scale(-1)}
.pe-cm-scan{position:absolute;left:-2px;right:-2px;height:2px;z-index:6;background:linear-gradient(90deg,transparent,rgba(210,130,70,.8),transparent);animation:scan-line 3.8s ease-in-out infinite;pointer-events:none}
.pe-cm-heat{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden;opacity:.4}
.pe-cm-heat-wave{position:absolute;left:-10%;width:120%;height:1px;background:linear-gradient(90deg,transparent,rgba(210,120,50,.7),transparent);animation:heat-drift linear infinite}
.pe-cm-heat-wave:nth-child(1){animation-duration:3.2s;bottom:22%}
.pe-cm-heat-wave:nth-child(2){animation-duration:2.9s;animation-delay:.9s;bottom:46%}
.pe-cm-heat-wave:nth-child(3){animation-duration:3.7s;animation-delay:1.7s;bottom:68%}
.pe-cm-heat-wave:nth-child(4){animation-duration:3.1s;animation-delay:2.5s;bottom:82%}
.pe-cm-geo{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}
.pe-cm-geo-line{position:absolute;width:1px;background:linear-gradient(to bottom,transparent,rgba(200,120,60,.5),transparent);animation:geo-shimmer ease-in-out infinite alternate}
.pe-cm-geo-line:nth-child(1){height:65%;top:8%;left:18%;transform:rotate(22deg);animation-duration:3.0s}
.pe-cm-geo-line:nth-child(2){height:72%;top:4%;left:40%;transform:rotate(22deg);animation-duration:3.8s;animation-delay:.7s}
.pe-cm-geo-line:nth-child(3){height:60%;top:12%;left:62%;transform:rotate(22deg);animation-duration:3.3s;animation-delay:1.4s}
.pe-cm-geo-line:nth-child(4){height:68%;top:6%;left:80%;transform:rotate(22deg);animation-duration:4.0s;animation-delay:.3s}
.pe-cm-scratch-layer{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}
.pe-cm-scratch{position:absolute;background:rgba(255,200,140,.22);animation:scratch-flick ease-in-out infinite}
.pe-cm-scratch:nth-child(1){width:28%;height:1px;top:30%;left:12%;transform:rotate(-8deg);animation-duration:5s}
.pe-cm-scratch:nth-child(2){width:18%;height:1px;top:57%;left:52%;transform:rotate(4deg);animation-duration:6s;animation-delay:1.2s}
.pe-cm-scratch:nth-child(3){width:22%;height:1px;top:74%;left:22%;transform:rotate(-3deg);animation-duration:4.5s;animation-delay:2.5s}
.pe-cm-ember-layer{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}
.pe-cm-ember{position:absolute;bottom:-4px;border-radius:50%;background:radial-gradient(circle,#ffb060,#d06020 50%,transparent);animation:ember-rise linear infinite;opacity:0}
.pe-cm-ember:nth-child(1){width:3px;height:3px;left:12%;animation-duration:2.9s}
.pe-cm-ember:nth-child(2){width:2px;height:2px;left:35%;animation-duration:2.3s;animation-delay:.6s}
.pe-cm-ember:nth-child(3){width:4px;height:4px;left:60%;animation-duration:3.2s;animation-delay:.3s}
.pe-cm-ember:nth-child(4){width:2px;height:2px;left:78%;animation-duration:2.6s;animation-delay:1.1s}
.pe-cm-ember:nth-child(5){width:3px;height:3px;left:24%;animation-duration:3.0s;animation-delay:1.7s}
.pe-cm-bottom-glow{position:absolute;bottom:0;left:0;right:0;height:24px;z-index:2;pointer-events:none;background:linear-gradient(to top,rgba(180,70,10,.3),transparent)}

/* ════════════════════════════════════════════════════════
   2. RARE
════════════════════════════════════════════════════════ */
.pe-ra-spin-wrap{position:absolute;inset:-3px;border-radius:13px;overflow:hidden;z-index:0;pointer-events:none}
.pe-ra-spin-arc{position:absolute;inset:0;background:conic-gradient(from 0deg,transparent 55%,rgba(66,192,248,.9) 73%,rgba(160,230,255,1) 80%,rgba(66,192,248,.9) 87%,transparent 100%);animation:border-spin 2.8s linear infinite}
.pe-ra-spin-inner{position:absolute;inset:2px;border-radius:11px;background:#062840}
.pe-ra-pulse-layer{position:absolute;inset:0;z-index:3;pointer-events:none;display:flex;align-items:center;justify-content:center}
.pe-ra-pulse-ring{position:absolute;border-radius:50%;border:1.5px solid rgba(66,192,248,.7);animation:pulse-expand ease-out infinite;opacity:0}
.pe-ra-pulse-ring:nth-child(1){animation-duration:2.6s}
.pe-ra-pulse-ring:nth-child(2){animation-duration:2.6s;animation-delay:.87s}
.pe-ra-pulse-ring:nth-child(3){animation-duration:2.6s;animation-delay:1.74s}
.pe-ra-depth-vig{position:absolute;inset:0;z-index:2;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,transparent 28%,rgba(2,15,35,.7) 100%)}
.pe-ra-center-glow{position:absolute;inset:0;z-index:2;pointer-events:none;background:radial-gradient(ellipse at 50% 40%,rgba(66,192,248,.16),transparent 65%);animation:center-glow 3s ease-in-out infinite}
.pe-ra-crackle-layer{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden}
.pe-ra-crackle{position:absolute;top:0;left:0;width:100%;height:100%;animation:crackle-flash ease-in-out infinite;opacity:0}
.pe-ra-crackle:nth-child(1){animation-duration:4.2s;animation-delay:.5s}
.pe-ra-crackle:nth-child(2){animation-duration:5.1s;animation-delay:2.1s}
.pe-ra-crackle:nth-child(3){animation-duration:3.9s;animation-delay:3.4s}
.pe-ra-crackle-path{fill:none;stroke:#42c0f8;stroke-width:1.1;stroke-linecap:round;filter:drop-shadow(0 0 3px #42c0f8)}

/* ════════════════════════════════════════════════════════
   3. DYNASTY
════════════════════════════════════════════════════════ */
.pe-ep-dual-wrap{position:absolute;inset:-3px;border-radius:13px;overflow:hidden;z-index:0;pointer-events:none}
.pe-ep-dual-arc1{position:absolute;inset:0;background:conic-gradient(from 0deg,transparent 60%,rgba(255,215,0,.9) 76%,rgba(255,245,120,1) 82%,rgba(255,215,0,.9) 88%,transparent 100%);animation:border-spin 3.5s linear infinite}
.pe-ep-dual-arc2{position:absolute;inset:0;background:conic-gradient(from 180deg,transparent 65%,rgba(255,180,0,.55) 80%,rgba(255,220,0,.75) 86%,transparent 100%);animation:border-spin 5s linear infinite reverse}
.pe-ep-dual-inner{position:absolute;inset:2px;border-radius:11px;background:#3a2800}
.pe-ep-burst{position:absolute;inset:0;z-index:2;pointer-events:none;display:flex;align-items:center;justify-content:center}
.pe-ep-burst svg{position:absolute;width:190%;height:190%;top:-45%;left:-45%;animation:border-spin 10s linear infinite;opacity:.2}
.pe-ep-sparkle-layer{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}
.pe-ep-sparkle{position:absolute;background:#ffd700;clip-path:polygon(50% 0%,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0% 50%,38% 38%);animation:sp-anim linear infinite;opacity:0}
.pe-ep-sparkle:nth-child(1){width:6px;height:6px;left:8%;top:18%;animation-duration:2.2s}
.pe-ep-sparkle:nth-child(2){width:5px;height:5px;left:80%;top:12%;animation-duration:1.8s;animation-delay:.7s}
.pe-ep-sparkle:nth-child(3){width:4px;height:4px;left:44%;top:52%;animation-duration:2.6s;animation-delay:.3s}
.pe-ep-sparkle:nth-child(4){width:7px;height:7px;left:68%;top:66%;animation-duration:2.0s;animation-delay:1.2s}
.pe-ep-sparkle:nth-child(5){width:5px;height:5px;left:18%;top:74%;animation-duration:1.9s;animation-delay:.5s}
.pe-ep-sparkle:nth-child(6){width:4px;height:4px;left:90%;top:46%;animation-duration:2.4s;animation-delay:1.5s}
.pe-ep-sparkle:nth-child(7){width:6px;height:6px;left:32%;top:30%;animation-duration:2.1s;animation-delay:.9s}
.pe-ep-foil{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden;border-radius:9px}
.pe-ep-foil::before{content:'';position:absolute;top:-50%;left:0;right:0;height:50%;background:linear-gradient(180deg,transparent,rgba(255,240,100,.12),rgba(255,215,0,.06),transparent);animation:foil-scroll 4.5s ease-in-out infinite}
.pe-ep-foil::after{content:'';position:absolute;top:-100%;left:0;right:0;height:30%;background:linear-gradient(180deg,transparent,rgba(255,255,180,.08),transparent);animation:foil-scroll 4.5s ease-in-out infinite;animation-delay:1.8s}
.pe-ep-shine{position:absolute;inset:0;z-index:5;pointer-events:none;border-radius:9px;overflow:hidden}
.pe-ep-shine::after{content:'';position:absolute;top:-100%;left:-60%;width:40%;height:300%;background:linear-gradient(105deg,transparent 30%,rgba(255,245,120,.42) 50%,transparent 70%);animation:coin-flip 3.5s ease-in-out infinite}

/* ════════════════════════════════════════════════════════
   4. TRANSCENDENT
════════════════════════════════════════════════════════ */
.pe-le-plasma-wrap{position:absolute;inset:-4px;border-radius:14px;overflow:hidden;z-index:0;pointer-events:none}
.pe-le-plasma-arc1{position:absolute;inset:0;background:conic-gradient(from 0deg,transparent 40%,rgba(192,32,240,.7) 57%,rgba(255,80,255,1) 64%,rgba(224,64,255,.9) 71%,transparent 84%);animation:border-spin 2s linear infinite}
.pe-le-plasma-arc2{position:absolute;inset:0;background:conic-gradient(from 90deg,transparent 45%,rgba(160,20,220,.5) 61%,rgba(200,64,255,.8) 69%,transparent 81%);animation:border-spin 3.2s linear infinite reverse}
.pe-le-plasma-inner{position:absolute;inset:3px;border-radius:11px;background:#280048}
.pe-le-aurora{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}
.pe-le-aurora-band{position:absolute;left:-20%;right:-20%;animation:aurora-wave ease-in-out infinite alternate}
.pe-le-aurora-band:nth-child(1){height:20px;top:8%;background:linear-gradient(90deg,transparent,rgba(80,255,180,.1),rgba(140,80,255,.15),transparent);animation-duration:4s}
.pe-le-aurora-band:nth-child(2){height:16px;top:26%;background:linear-gradient(90deg,transparent,rgba(80,140,255,.09),rgba(160,80,255,.13),transparent);animation-duration:5.5s;animation-delay:.8s}
.pe-le-aurora-band:nth-child(3){height:14px;top:46%;background:linear-gradient(90deg,transparent,rgba(200,80,255,.09),rgba(80,200,255,.11),transparent);animation-duration:4.8s;animation-delay:1.6s}
.pe-le-aurora-band:nth-child(4){height:12px;top:62%;background:linear-gradient(90deg,transparent,rgba(100,255,160,.07),rgba(180,80,255,.11),transparent);animation-duration:6s;animation-delay:2.2s}
.pe-le-orb-layer{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}
.pe-le-orb{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(255,128,255,.9),rgba(192,32,240,.4),transparent 70%);animation:orb-float ease-in-out infinite}
.pe-le-orb:nth-child(1){width:11px;height:11px;left:10%;top:24%;animation-duration:4.0s}
.pe-le-orb:nth-child(2){width:7px;height:7px;left:76%;top:54%;animation-duration:3.5s;animation-delay:.8s}
.pe-le-orb:nth-child(3){width:9px;height:9px;left:48%;top:13%;animation-duration:4.8s;animation-delay:1.6s}
.pe-le-orb:nth-child(4){width:5px;height:5px;left:28%;top:70%;animation-duration:3.2s;animation-delay:2.2s}
.pe-le-orb:nth-child(5){width:8px;height:8px;left:88%;top:38%;animation-duration:4.2s;animation-delay:.4s}
.pe-le-holo{position:absolute;inset:0;z-index:4;pointer-events:none;background:linear-gradient(45deg,rgba(224,64,255,.12),rgba(100,64,255,.1),rgba(64,128,255,.12),rgba(64,240,200,.08),rgba(224,64,255,.12));background-size:300% 300%;animation:holo-sweep 3s ease-in-out infinite;mix-blend-mode:screen}
.pe-le-depth-rings{position:absolute;inset:0;z-index:2;pointer-events:none;display:flex;align-items:center;justify-content:center}
.pe-le-depth-ring{position:absolute;border-radius:50%;border:1px solid rgba(224,64,255,.22);animation:ring-expand ease-out infinite;opacity:0}
.pe-le-depth-ring:nth-child(1){animation-duration:4s}
.pe-le-depth-ring:nth-child(2){animation-duration:4s;animation-delay:1.33s}
.pe-le-depth-ring:nth-child(3){animation-duration:4s;animation-delay:2.66s}
.pe-le-bolt-layer{position:absolute;inset:0;z-index:5;pointer-events:none;overflow:hidden}
.pe-le-bolt{position:absolute;top:0;left:0;width:100%;height:100%;opacity:0}
.pe-le-bolt.b1{animation:bolt-flash 6.5s ease-in-out infinite;animation-delay:0s}
.pe-le-bolt.b2{animation:bolt-flash 8.2s ease-in-out infinite;animation-delay:1.4s}
.pe-le-bolt.b3{animation:bolt-flash 7.0s ease-in-out infinite;animation-delay:3.8s}
.pe-le-bolt.b4{animation:bolt-flash 9.5s ease-in-out infinite;animation-delay:2.2s}
.pe-le-bolt.b5{animation:bolt-flash 6.8s ease-in-out infinite;animation-delay:5.1s}
.pe-le-bolt.b6{animation:bolt-flash 8.8s ease-in-out infinite;animation-delay:4.3s}
.pe-le-bolt-glow{fill:none;stroke:#c020f0;stroke-linecap:round;stroke-linejoin:round;stroke-width:10;opacity:.4}
.pe-le-bolt-mid{fill:none;stroke:#e040ff;stroke-linecap:round;stroke-linejoin:round;stroke-width:5;opacity:.7}
.pe-le-bolt-core{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:2;opacity:1}
.pe-le-bolt-branch{fill:none;stroke:#e080ff;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.2;opacity:.65}
.pe-le-tear-layer{position:absolute;inset:0;z-index:5;pointer-events:none;overflow:hidden}
.pe-le-tear{position:absolute;left:0;right:0;animation:tear-glitch ease-in-out infinite;opacity:0}
.pe-le-tear-inner{height:3px;background:linear-gradient(90deg,transparent,rgba(255,80,255,.65),rgba(255,255,255,.85),rgba(224,64,255,.5),transparent)}
.pe-le-tear:nth-child(1){top:22%;animation-duration:5.0s;animation-delay:.4s}
.pe-le-tear:nth-child(2){top:56%;animation-duration:6.2s;animation-delay:2.3s}
.pe-le-tear:nth-child(3){top:74%;animation-duration:4.6s;animation-delay:3.8s}
.pe-le-whiteout{position:absolute;inset:0;z-index:6;pointer-events:none;border-radius:9px;background:rgba(255,255,255,0)}
.pe-le-whiteout.w1{animation:whiteout-leg 7.0s ease-in-out infinite;animation-delay:3.84s}
.pe-le-whiteout.w2{animation:whiteout-leg 9.5s ease-in-out infinite;animation-delay:2.24s}
.pe-le-whiteout.w3{animation:whiteout-leg 6.8s ease-in-out infinite;animation-delay:5.14s}

/* ════════════════════════════════════════════════════════
   5. IMMORTAL
════════════════════════════════════════════════════════ */
.pe-imm-glow-1{position:absolute;inset:-5px;border-radius:18px;z-index:-1;pointer-events:none;box-shadow:0 0 16px 4px rgba(40,220,120,.65),0 0 36px 8px rgba(20,180,80,.4);animation:glow-breathe 2s ease-in-out infinite}
.pe-imm-glow-2{position:absolute;inset:-16px;border-radius:24px;z-index:-2;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,rgba(40,220,120,.26) 0%,rgba(20,160,70,.12) 45%,transparent 72%);animation:glow-breathe 2s ease-in-out infinite;animation-delay:.3s}
.pe-imm-glow-3{position:absolute;inset:-44px;border-radius:52px;z-index:-3;pointer-events:none;background:radial-gradient(ellipse at 50% 55%,rgba(20,200,80,.14) 0%,rgba(10,120,50,.06) 50%,transparent 72%);animation:glow-breathe 3.2s ease-in-out infinite;animation-delay:.8s}
.pe-imm-glow-4{position:absolute;inset:-80px;border-radius:90px;z-index:-4;pointer-events:none;background:radial-gradient(ellipse at 50% 55%,rgba(10,160,60,.08) 0%,rgba(5,80,30,.04) 45%,transparent 70%);animation:glow-breathe 4s ease-in-out infinite;animation-delay:1.2s}
.pe-imm-corner-arcs{position:absolute;inset:0;z-index:7;pointer-events:none}
.pe-imm-corner-arcs svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.pe-imm-arc-glow{fill:none;stroke-linecap:round;stroke:rgba(40,220,120,.18);stroke-width:0}
.pe-imm-arc-line{fill:none;}
.pe-imm-arc-glow.a1,.pe-imm-arc-line.a1{animation:corner-arc-fade 4s ease-in-out infinite;animation-delay:0s}
.pe-imm-arc-glow.a2,.pe-imm-arc-line.a2{animation:corner-arc-fade 4s ease-in-out infinite;animation-delay:1s}
.pe-imm-arc-glow.a3,.pe-imm-arc-line.a3{animation:corner-arc-fade 4s ease-in-out infinite;animation-delay:2s}
.pe-imm-arc-glow.a4,.pe-imm-arc-line.a4{animation:corner-arc-fade 4s ease-in-out infinite;animation-delay:3s}
.pe-imm-plasma-wrap{position:absolute;inset:-5px;border-radius:17px;overflow:hidden;z-index:0;pointer-events:none}
.pe-imm-plasma-arc1{position:absolute;inset:0;background:conic-gradient(from 0deg,transparent 35%,rgba(20,160,70,.6) 50%,rgba(80,255,160,1) 59%,rgba(40,220,120,.9) 67%,transparent 80%);animation:border-spin 1.6s linear infinite}
.pe-imm-plasma-arc2{position:absolute;inset:0;background:conic-gradient(from 120deg,transparent 40%,rgba(10,120,50,.5) 54%,rgba(60,220,120,.85) 62%,transparent 76%);animation:border-spin 2.6s linear infinite reverse}
.pe-imm-plasma-arc3{position:absolute;inset:0;background:conic-gradient(from 240deg,transparent 48%,rgba(40,255,130,.45) 62%,rgba(120,255,190,.75) 68%,transparent 79%);animation:border-spin 3.8s linear infinite}
.pe-imm-plasma-inner{position:absolute;inset:4px;border-radius:13px;background:#021a0a}
.pe-imm-inner-border{position:absolute;inset:1px;border-radius:11px;z-index:6;pointer-events:none;border:1px solid rgba(80,255,160,.26);animation:inner-border-pulse 2.2s ease-in-out infinite}
.pe-imm-slab-layer{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}
.pe-imm-slab{position:absolute;top:-10%;height:120%;transform:rotate(18deg);transform-origin:top center;background:linear-gradient(to bottom,transparent 0%,rgba(40,220,120,.45) 20%,rgba(120,255,190,.75) 50%,rgba(40,220,120,.45) 80%,transparent 100%);filter:blur(1.5px);animation:slab-pulse ease-in-out infinite alternate}
.pe-imm-slab:nth-child(1){width:7px;left:10%;animation-duration:2.8s;animation-delay:0s}
.pe-imm-slab:nth-child(2){width:5px;left:28%;animation-duration:3.5s;animation-delay:.5s}
.pe-imm-slab:nth-child(3){width:9px;left:48%;animation-duration:3.0s;animation-delay:1.1s}
.pe-imm-slab:nth-child(4){width:5px;left:66%;animation-duration:3.8s;animation-delay:1.7s}
.pe-imm-slab:nth-child(5){width:7px;left:82%;animation-duration:2.6s;animation-delay:.3s}
.pe-imm-aurora{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}
.pe-imm-aurora-band{position:absolute;left:-20%;right:-20%;animation:aurora-wave ease-in-out infinite alternate}
.pe-imm-aurora-band:nth-child(1){height:22px;top:6%;background:linear-gradient(90deg,transparent,rgba(40,255,120,.18),rgba(80,255,160,.24),transparent);animation-duration:3.5s}
.pe-imm-aurora-band:nth-child(2){height:17px;top:24%;background:linear-gradient(90deg,transparent,rgba(20,200,100,.14),rgba(60,255,140,.2),transparent);animation-duration:4.8s;animation-delay:.7s}
.pe-imm-aurora-band:nth-child(3){height:15px;top:44%;background:linear-gradient(90deg,transparent,rgba(60,220,120,.12),rgba(40,220,255,.12),transparent);animation-duration:4.2s;animation-delay:1.4s}
.pe-imm-aurora-band:nth-child(4){height:13px;top:63%;background:linear-gradient(90deg,transparent,rgba(80,255,180,.1),rgba(40,220,120,.16),transparent);animation-duration:5.5s;animation-delay:2.1s}
.pe-imm-rings{position:absolute;inset:0;z-index:2;pointer-events:none;display:flex;align-items:center;justify-content:center}
.pe-imm-ring{position:absolute;border-radius:50%;border:1px solid rgba(40,220,120,.24);animation:ring-expand ease-out infinite;opacity:0}
.pe-imm-ring:nth-child(1){animation-duration:3.5s}
.pe-imm-ring:nth-child(2){animation-duration:3.5s;animation-delay:1.17s}
.pe-imm-ring:nth-child(3){animation-duration:3.5s;animation-delay:2.34s}
.pe-imm-orb-layer{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}
.pe-imm-orb{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(100,255,180,.95),rgba(20,160,80,.4),transparent 70%);animation:orb-float ease-in-out infinite}
.pe-imm-orb:nth-child(1){width:12px;height:12px;left:8%;top:22%;animation-duration:3.8s}
.pe-imm-orb:nth-child(2){width:8px;height:8px;left:78%;top:52%;animation-duration:3.3s;animation-delay:.7s}
.pe-imm-orb:nth-child(3){width:10px;height:10px;left:50%;top:12%;animation-duration:4.6s;animation-delay:1.4s}
.pe-imm-orb:nth-child(4){width:6px;height:6px;left:26%;top:68%;animation-duration:3.0s;animation-delay:2.0s}
.pe-imm-orb:nth-child(5){width:8px;height:8px;left:90%;top:36%;animation-duration:4.0s;animation-delay:.3s}
.pe-imm-orb:nth-child(6){width:6px;height:6px;left:62%;top:78%;animation-duration:3.6s;animation-delay:1.0s}
.pe-imm-holo{position:absolute;inset:0;z-index:4;pointer-events:none;background:linear-gradient(45deg,rgba(40,220,120,.14),rgba(20,180,80,.1),rgba(80,255,160,.16),rgba(40,200,255,.1),rgba(40,220,120,.14));background-size:300% 300%;animation:holo-sweep 2.4s ease-in-out infinite;mix-blend-mode:screen}
.pe-imm-spark-layer{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden}
.pe-imm-spark{position:absolute;background:#60ffb0;clip-path:polygon(50% 0%,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0% 50%,38% 38%);animation:sp-anim linear infinite;opacity:0}
.pe-imm-spark:nth-child(1){width:6px;height:6px;left:6%;top:16%;animation-duration:2.0s}
.pe-imm-spark:nth-child(2){width:5px;height:5px;left:82%;top:10%;animation-duration:1.7s;animation-delay:.6s}
.pe-imm-spark:nth-child(3){width:4px;height:4px;left:42%;top:50%;animation-duration:2.4s;animation-delay:.3s}
.pe-imm-spark:nth-child(4){width:7px;height:7px;left:70%;top:64%;animation-duration:1.9s;animation-delay:1.1s}
.pe-imm-spark:nth-child(5){width:5px;height:5px;left:16%;top:72%;animation-duration:2.2s;animation-delay:.5s}
.pe-imm-spark:nth-child(6){width:4px;height:4px;left:92%;top:44%;animation-duration:2.3s;animation-delay:1.4s}
.pe-imm-spark:nth-child(7){width:6px;height:6px;left:30%;top:28%;animation-duration:1.8s;animation-delay:.9s}
.pe-imm-spark:nth-child(8){width:4px;height:4px;left:58%;top:82%;animation-duration:2.5s;animation-delay:1.8s}
.pe-imm-tear-layer{position:absolute;inset:0;z-index:5;pointer-events:none;overflow:hidden}
.pe-imm-tear{position:absolute;left:0;right:0;animation:tear-glitch ease-in-out infinite;opacity:0}
.pe-imm-tear-inner{height:3px;background:linear-gradient(90deg,transparent,rgba(40,255,120,.7),rgba(200,255,220,.9),rgba(40,220,120,.5),transparent)}
.pe-imm-tear:nth-child(1){top:20%;animation-duration:5.2s;animation-delay:.3s}
.pe-imm-tear:nth-child(2){top:54%;animation-duration:6.0s;animation-delay:2.5s}
.pe-imm-tear:nth-child(3){top:74%;animation-duration:4.8s;animation-delay:4.0s}
.pe-imm-foil{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden;border-radius:11px}
.pe-imm-foil::before{content:'';position:absolute;top:-50%;left:0;right:0;height:50%;background:linear-gradient(180deg,transparent,rgba(100,255,180,.1),rgba(40,220,120,.05),transparent);animation:foil-scroll 4.5s ease-in-out infinite}
.pe-imm-foil::after{content:'';position:absolute;top:-100%;left:0;right:0;height:30%;background:linear-gradient(180deg,transparent,rgba(140,255,200,.08),transparent);animation:foil-scroll 4.5s ease-in-out infinite;animation-delay:1.8s}
.pe-imm-shine{position:absolute;inset:0;z-index:5;pointer-events:none;border-radius:11px;overflow:hidden}
.pe-imm-shine::after{content:'';position:absolute;top:-100%;left:-60%;width:40%;height:300%;background:linear-gradient(105deg,transparent 30%,rgba(140,255,200,.52) 50%,transparent 70%);animation:coin-flip 2.8s ease-in-out infinite}
.pe-imm-shock{position:absolute;inset:0;z-index:4;pointer-events:none;display:flex;align-items:center;justify-content:center}
.pe-imm-shock-ring{position:absolute;border-radius:50%;border:3px solid rgba(80,255,160,.9);box-shadow:0 0 14px rgba(40,220,120,.9),0 0 36px rgba(40,220,120,.4);animation:shock-expand ease-out infinite;opacity:0}
.pe-imm-shock-ring:nth-child(1){animation-duration:2.8s}
.pe-imm-shock-ring:nth-child(2){animation-duration:2.8s;animation-delay:.55s}
.pe-imm-shock-ring:nth-child(3){animation-duration:2.8s;animation-delay:1.1s}
.pe-imm-shock-ring:nth-child(4){animation-duration:2.8s;animation-delay:1.65s}
.pe-imm-shock-core{position:absolute;width:20px;height:20px;border-radius:50%;z-index:5;background:radial-gradient(circle,rgba(220,255,230,.95),rgba(40,220,120,.35),transparent 70%);animation:core-pulse 2.8s ease-out infinite}
.pe-imm-shock-flash{position:absolute;inset:0;z-index:6;pointer-events:none;border-radius:11px;background:rgba(0,0,0,0);animation:shock-flash 2.8s ease-out infinite}

/* ── Leaderboard bar ── */
.pe-lb-bar{background:rgba(8,14,30,.85);border:1px solid rgba(255,215,0,.2);border-radius:10px;padding:.8rem 1rem;margin-bottom:.8rem}
.pe-lb-bar-label{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.72rem;letter-spacing:.18em;color:#ffd700;margin-bottom:.55rem}
.pe-lb-bar-row{display:flex;gap:.5rem;align-items:center}
.pe-lb-input{flex:1;background:rgba(4,8,16,.9);border:1px solid #1a3050;border-radius:6px;padding:.55rem .7rem;font-family:'Barlow Condensed',sans-serif;font-size:.85rem;color:#d4e8f8;outline:none;transition:border-color .15s;min-width:0}
.pe-lb-input:focus{border-color:#ffd700}
.pe-lb-input::placeholder{color:#2a4060}
.pe-lb-submit{background:linear-gradient(135deg,#a07020,#ffd700);color:#050a18;border:none;border-radius:6px;padding:.55rem 1rem;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.78rem;letter-spacing:.1em;cursor:pointer;transition:.2s;white-space:nowrap;flex-shrink:0}
.pe-lb-submit:hover{filter:brightness(1.1)}
.pe-lb-submit.saved{background:linear-gradient(135deg,#206040,#28dc78);color:#050a18}
.pe-lb-submit:disabled{opacity:.6;cursor:default}
.pe-lb-view{background:transparent;border:1px solid #1a3050;color:#3a6080;border-radius:6px;padding:.55rem .8rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.75rem;letter-spacing:.1em;cursor:pointer;transition:.2s;white-space:nowrap;flex-shrink:0}
.pe-lb-view:hover{border-color:#42c0f8;color:#42c0f8}

/* leaderboard modal */
.pe-lb-modal{background:#07101e;border:2px solid #1a3050;border-radius:16px;padding:1.4rem;max-width:480px;width:100%;max-height:80vh;display:flex;flex-direction:column;animation:fade-up .3s ease}
.pe-lb-modal-title{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1rem;letter-spacing:.18em;color:#ffd700;text-align:center;margin-bottom:1rem}
.pe-lb-list{overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:.3rem}
.pe-lb-list::-webkit-scrollbar{width:4px}
.pe-lb-list::-webkit-scrollbar-thumb{background:#0d1835}
.pe-lb-row{display:flex;align-items:center;gap:.6rem;padding:.4rem .6rem;border-radius:6px;background:rgba(4,8,16,.7);font-family:'Barlow Condensed',sans-serif;font-size:.8rem}
.pe-lb-row.top3{background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.12)}
.pe-lb-rank{font-family:'Orbitron',sans-serif;font-weight:700;font-size:.7rem;min-width:28px;text-align:center}
.pe-lb-entry-name{flex:1;font-weight:700;letter-spacing:.04em;color:#d4e8f8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pe-lb-entry-tier{font-size:.65rem;font-weight:700;letter-spacing:.06em;white-space:nowrap}
.pe-lb-entry-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:.78rem;color:#d4e8f8;white-space:nowrap}
.pe-lb-empty{text-align:center;padding:2rem;color:#2a4060;font-family:'Barlow Condensed',sans-serif;font-size:.85rem;letter-spacing:.1em}
.pe-lb-close{width:100%;margin-top:1rem;background:linear-gradient(135deg,#a07020,#ffd700);color:#050a18;border:none;border-radius:8px;padding:.75rem;font-family:'Orbitron',sans-serif;font-weight:700;font-size:.82rem;letter-spacing:.15em;cursor:pointer;transition:.2s;flex-shrink:0}
.pe-lb-close:hover{filter:brightness(1.1)}

/* comp buttons update */
.pe-save-draft-btn{background:transparent;border:2px solid #42c0f8;color:#42c0f8;border-radius:8px;padding:.85rem .8rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.85rem;letter-spacing:.08em;cursor:pointer;transition:.2s;white-space:nowrap}
.pe-save-draft-btn:hover{background:rgba(66,192,248,.1)}
.pe-sign-save{display:block;text-align:center;background:none;border:none;color:#1a3050;font-size:.72rem;cursor:pointer;letter-spacing:.08em;font-family:'Barlow Condensed',sans-serif;transition:.15s;margin-top:.3rem}
.pe-sign-save:hover{color:#3a6080}

/* saved drafts list inside modal */
.pe-saved-list{margin-bottom:.8rem;display:flex;flex-direction:column;gap:.3rem}
.pe-saved-list-label{font-size:.62rem;color:#2a4060;letter-spacing:.12em;margin-bottom:.3rem;font-family:'Barlow Condensed',sans-serif}
.pe-saved-row{display:flex;align-items:center;gap:.5rem;padding:.35rem .5rem;background:rgba(4,8,16,.8);border-radius:5px;border:1px solid #0d1835}
.pe-saved-name{flex:1;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.78rem;color:#d4e8f8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pe-saved-score{font-family:'Orbitron',sans-serif;font-weight:700;font-size:.65rem;white-space:nowrap}
.pe-saved-del{background:none;border:none;color:#2a4060;cursor:pointer;font-size:.75rem;padding:0 .2rem;transition:.15s;flex-shrink:0}
.pe-saved-del:hover{color:#e04040}

/* ── Responsive ── */
@media(max-width:1000px){
  .pe-pack-img,.pe-fsl{width:100px;height:158px}
  .pe-skill-spread{width:calc(100% + 160px);margin:0 -30px}
}
@media(max-width:700px){
  .pe-pack-img,.pe-fsl{width:82px;height:128px}
  .pe-card{width:calc(19vw - 4px);min-width:110px}
  .pe-cards-row{gap:.4rem}
  .pe-skill-spread{width:calc(100% + 100px);margin:0 -20px}
  .pe-form-row{gap:6px}
  .pe-skill-side{gap:6px}
  .pe-pack-wrap,.pe-fsl{width:82px;height:128px}
}
@media(max-width:420px){
  .pe-pack-img,.pe-fsl{width:64px;height:100px}
  .pe-card{min-width:96px}
  .pe-fc-score{font-size:.72rem}
  .pe-skill-spread{width:calc(100% + 60px);margin:0 -10px}
  .pe-pack-wrap,.pe-fsl{width:64px;height:100px}
}
`;