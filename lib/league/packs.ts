// nfl-minigames-hub/lib/league/packs.ts
// Pack weight system for league mode — no captain packs.
// Boosted pack replaces the captain slot; position is chosen by user before draw.

export type PackTier = 'elite_drop' | 'prime_pack' | 'rising_pack' | 'standard_pack';

/* ─── Types ─────────────────────────────────────────────────────────── */
type Rarity = 'common' | 'rare' | 'dynasty' | 'transcendent' | 'immortal';
type Phase = 'intro' | 'setup' | 'packing' | 'complete';
interface Player { id: string; name: string; pos: string; team: string; score: number; rarity: Rarity; accolades: string[]; }

export const PACK_TIER_LABELS: Record<PackTier, string> = {
  elite_drop:    'Elite Drop',
  prime_pack:    'Prime Pack',
  rising_pack:   'Rising Pack',
  standard_pack: 'Standard Pack',
};

export const PACK_TIER_COLORS: Record<PackTier, string> = {
  elite_drop:    '#28dc78',   // immortal green
  prime_pack:    '#e040ff',   // transcendent purple
  rising_pack:   '#ffd700',   // dynasty gold
  standard_pack: '#42c0f8',   // rare blue
};

// ─── Weights ──────────────────────────────────────────────────────────────────
type WeightMap = Record<Rarity, number>;

export const LEAGUE_WEIGHTS: Record<PackTier, WeightMap> = {
  standard_pack: { common: 40, rare: 30, dynasty: 19, transcendent: 10, immortal: 1 },
  rising_pack:   { common: 33, rare: 30, dynasty: 20, transcendent: 15, immortal: 2 },
  prime_pack:    { common: 18,  rare: 35, dynasty: 23, transcendent: 20, immortal: 4 },
  elite_drop:    { common: 15,  rare: 25,  dynasty: 27, transcendent: 25, immortal: 8 },
};

// One boosted slot per pack (same pattern as your existing weightedDraw)
// Boosted slot within a tier escalates one level higher:
const BOOSTED_WEIGHTS: Record<PackTier, WeightMap> = {
  standard_pack: { common: 40, rare: 30, dynasty: 19, transcendent: 10, immortal: 1 },
  rising_pack:   { common: 33, rare: 30, dynasty: 20, transcendent: 15, immortal: 2 },
  prime_pack:    { common: 18,  rare: 35, dynasty: 23, transcendent: 20, immortal: 4 },
  elite_drop:    { common: 15,  rare: 25,  dynasty: 27, transcendent: 25, immortal: 8 },
};

// ─── Player shape (matches your existing Player interface) ────────────────────
interface Player {
  id: string;
  name: string;
  pos: string;
  team: string;
  score: number;
  rarity: Rarity;
  accolades: string[];
}

/**
 * Draw `count` players from the given pool using league weights.
 * `tier` is the overall pack tier.
 * `excl` is a list of player ids already on the roster (no duplicates).
 */
export function leagueWeightedDraw(
  pool: Player[],
  count: number,
  tier: PackTier,
  excl: string[] = [],
): Player[] {
  const avail = pool.filter(p => !excl.includes(p.id));
  if (avail.length === 0) return [];

  const base    = LEAGUE_WEIGHTS[tier];
  const boosted = BOOSTED_WEIGHTS[tier];
  const boostedIndex = Math.floor(Math.random() * count);

  const normalPool  = avail.map(p => ({ p, w: base[p.rarity]    ?? 1 }));
  const boostedPool = avail.map(p => ({ p, w: boosted[p.rarity] ?? 1 }));

  const used = new Set<string>();
  const result: Player[] = [];

  for (let i = 0; i < Math.min(count, avail.length); i++) {
    const currentPool = (i === boostedIndex ? boostedPool : normalPool)
      .filter(x => !used.has(x.p.id));
    if (currentPool.length === 0) break;
    const total = currentPool.reduce((s, x) => s + x.w, 0);
    let roll = Math.random() * total;
    for (const item of currentPool) {
      roll -= item.w;
      if (roll <= 0) { result.push(item.p); used.add(item.p.id); break; }
    }
  }

  return result.sort(() => Math.random() - 0.5);
}

// ─── Season helpers ───────────────────────────────────────────────────────────

/** Packs to open in regular season. Week 1 = 11, week 8 = 4. */
export function packsForWeek(week: number): number {
  return Math.max(12 - week, 4);
}

/** Always 11 packs in playoffs. */
export const PLAYOFF_PACK_COUNT = 11;

/** Pack tier based on last week's rank. Scales with league size. */
export function packTierForRank(rank: number, total: number): PackTier {
  if (rank === 1)                              return 'elite_drop';
  if (rank <= Math.max(2, Math.ceil(total * 0.2))) return 'prime_pack';
  if (rank <= Math.max(4, Math.ceil(total * 0.5))) return 'rising_pack';
  return 'standard_pack';
}