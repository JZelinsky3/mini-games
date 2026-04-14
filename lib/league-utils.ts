/* ══════════════════════════════════════════════════════════════════════
   LEAGUE MODE — Utility Functions
   Drop this into your lib/ folder
══════════════════════════════════════════════════════════════════════ */

export type Rarity = 'common' | 'rare' | 'dynasty' | 'transcendent' | 'immortal';
export type Phase = 'intro' | 'setup' | 'packing' | 'complete';

export interface Player {
  id: string;
  name: string;
  pos: string;           // you used 'pos' instead of 'position'
  team: string;
  score: number;
  rarity: Rarity;
  accolades: string[];
  // Add more fields here later (chemistryTags, overall, college, etc.)
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  tier: string;
  icon: string;
  timestamp: number;
  lineup: (Player | null)[];
}

export interface SavedDraft {
  id: string;
  name: string;
  score: number;
  tier: string;
  icon: string;
  lineup: (Player | null)[];
  timestamp: number;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

export const LEAGUE_WEEKS = 8;
export const TOTAL_SLOTS = 11;

export const SLOTS = [
  { key: 'QB',  label: 'Quarterback',   short: 'QB', pool: 'QB' },
  { key: 'RB',  label: 'Running Back',  short: 'HB', pool: 'RB' },
  { key: 'WR1', label: 'Wide Receiver', short: 'WR', pool: 'WR' },
  { key: 'WR2', label: 'Wide Receiver', short: 'WR', pool: 'WR' },
  { key: 'WR3', label: 'Wide Receiver', short: 'WR', pool: 'WR' },
  { key: 'TE',  label: 'Tight End',     short: 'TE', pool: 'TE' },
  { key: 'LT',  label: 'Left Tackle',   short: 'LT', pool: 'OT' },
  { key: 'LG',  label: 'Left Guard',    short: 'LG', pool: 'OG' },
  { key: 'C',   label: 'Center',        short: 'C',  pool: 'C'  },
  { key: 'RG',  label: 'Right Guard',   short: 'RG', pool: 'OG' },
  { key: 'RT',  label: 'Right Tackle',  short: 'RT', pool: 'OT' },
] as const;

/* ─── Pack Count Per Week ────────────────────────────────────────────── */
// Week 1: 11 packs, Week 2: 10, ... Week 8: 4
export function packsForWeek(week: number): number {
  return Math.max(TOTAL_SLOTS - (week - 1), 3);
}

// Which slots need packs (not locked)
export function unlockedSlots(
  lockedPlayers: { slot: string; player: Player }[]
): typeof SLOTS[number][] {
  const lockedKeys = new Set(lockedPlayers.map(lp => lp.slot));
  return SLOTS.filter(s => !lockedKeys.has(s.key));
}

/* ─── League Pack Weights (no captain packs) ─────────────────────────── */
export const LEAGUE_WEIGHTS = {
  normal: { common: 45, rare: 27, dynasty: 17, transcendent: 10, immortal: 1 },
};

/* ─── Boosted Pack Tiers ─────────────────────────────────────────────── */
export type BoostedTier = 'elite' | 'premium' | 'standard' | null;

export const BOOSTED_PACK_CONFIG: Record<string, {
  label: string;
  description: string;
  color: string;
  glow: string;
  weights: Record<Rarity, number>;
}> = {
  elite: {
    label: '🏆 ELITE PACK',
    description: '1st place reward — massively boosted rare+ odds',
    color: '#ffd700',
    glow: 'rgba(255,215,0,.6)',
    weights: { common: 10, rare: 25, dynasty: 35, transcendent: 25, immortal: 5 },
  },
  premium: {
    label: '⭐ PREMIUM PACK',
    description: 'Top 5 reward — boosted dynasty+ odds',
    color: '#42c0f8',
    glow: 'rgba(66,192,248,.5)',
    weights: { common: 20, rare: 30, dynasty: 30, transcendent: 17, immortal: 3 },
  },
  standard: {
    label: '📦 STANDARD PACK',
    description: 'Participation reward — slightly boosted odds',
    color: '#a0b8d0',
    glow: 'rgba(160,184,208,.4)',
    weights: { common: 35, rare: 32, dynasty: 22, transcendent: 10, immortal: 1 },
  },
};

// Determine boosted pack tier based on previous week's rank
export function getBoostedTier(rank: number, totalPlayers: number): BoostedTier {
  if (rank === 1) return 'elite';
  if (rank <= 5) return 'premium';
  return 'standard';
}

/* ─── Chemistry System ───────────────────────────────────────────────── */

// Team rivalries — each team maps to 1-2 rival teams
export const TEAM_RIVALRIES: Record<string, string[]> = {
  // AFC East
  'Buffalo Bills':      ['Miami Dolphins', 'New England Patriots'],
  'Miami Dolphins':     ['Buffalo Bills', 'New York Jets'],
  'New England Patriots':['Buffalo Bills', 'New York Jets'],
  'New York Jets':      ['New England Patriots', 'Miami Dolphins'],
  // AFC North
  'Baltimore Ravens':   ['Pittsburgh Steelers', 'Cincinnati Bengals'],
  'Pittsburgh Steelers':['Baltimore Ravens', 'Cleveland Browns'],
  'Cincinnati Bengals': ['Baltimore Ravens', 'Cleveland Browns'],
  'Cleveland Browns':   ['Pittsburgh Steelers', 'Cincinnati Bengals'],
  // AFC South
  'Houston Texans':     ['Jacksonville Jaguars', 'Indianapolis Colts'],
  'Indianapolis Colts': ['Houston Texans', 'Tennessee Titans'],
  'Jacksonville Jaguars':['Houston Texans', 'Tennessee Titans'],
  'Tennessee Titans':   ['Indianapolis Colts', 'Jacksonville Jaguars'],
  // AFC West
  'Kansas City Chiefs': ['Las Vegas Raiders', 'Denver Broncos'],
  'Las Vegas Raiders':  ['Kansas City Chiefs', 'Los Angeles Chargers'],
  'Denver Broncos':     ['Kansas City Chiefs', 'Las Vegas Raiders'],
  'Los Angeles Chargers':['Las Vegas Raiders', 'Denver Broncos'],
  // NFC East
  'Dallas Cowboys':     ['Philadelphia Eagles', 'Washington Commanders'],
  'Philadelphia Eagles':['Dallas Cowboys', 'New York Giants'],
  'New York Giants':    ['Philadelphia Eagles', 'Dallas Cowboys'],
  'Washington Commanders':['Dallas Cowboys', 'Philadelphia Eagles'],
  // NFC North
  'Green Bay Packers':  ['Chicago Bears', 'Minnesota Vikings'],
  'Chicago Bears':      ['Green Bay Packers', 'Detroit Lions'],
  'Minnesota Vikings':  ['Green Bay Packers', 'Detroit Lions'],
  'Detroit Lions':      ['Chicago Bears', 'Minnesota Vikings'],
  // NFC South
  'Tampa Bay Buccaneers':['New Orleans Saints', 'Atlanta Falcons'],
  'New Orleans Saints': ['Tampa Bay Buccaneers', 'Atlanta Falcons'],
  'Atlanta Falcons':    ['New Orleans Saints', 'Tampa Bay Buccaneers'],
  'Carolina Panthers':  ['Tampa Bay Buccaneers', 'New Orleans Saints'],
  // NFC West
  'San Francisco 49ers':['Seattle Seahawks', 'Los Angeles Rams'],
  'Seattle Seahawks':   ['San Francisco 49ers', 'Los Angeles Rams'],
  'Los Angeles Rams':   ['San Francisco 49ers', 'Seattle Seahawks'],
  'Arizona Cardinals':  ['San Francisco 49ers', 'Seattle Seahawks'],
};

// Chemistry points
const SAME_TEAM_BONUS = 200;    // +200 per same-team pair
const RIVAL_PENALTY   = -150;   // -150 per rival pair

export interface ChemistryResult {
  totalBonus: number;
  sameTeamLinks: { players: [string, string]; team: string; bonus: number }[];
  rivalLinks: { players: [string, string]; teams: [string, string]; penalty: number }[];
  sameTeamCount: number;
  rivalCount: number;
}

export function calculateChemistry(lineup: (Player | null)[]): ChemistryResult {
  const players = lineup.filter(Boolean) as Player[];
  const result: ChemistryResult = {
    totalBonus: 0,
    sameTeamLinks: [],
    rivalLinks: [],
    sameTeamCount: 0,
    rivalCount: 0,
  };

  // Check every pair
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const a = players[i], b = players[j];

      // Same team bonus
      if (a.team === b.team) {
        result.sameTeamLinks.push({
          players: [a.name, b.name],
          team: a.team,
          bonus: SAME_TEAM_BONUS,
        });
        result.totalBonus += SAME_TEAM_BONUS;
        result.sameTeamCount++;
      }

      // Rival penalty
      const aRivals = TEAM_RIVALRIES[a.team] || [];
      const bRivals = TEAM_RIVALRIES[b.team] || [];
      if (aRivals.includes(b.team) || bRivals.includes(a.team)) {
        result.rivalLinks.push({
          players: [a.name, b.name],
          teams: [a.team, b.team],
          penalty: RIVAL_PENALTY,
        });
        result.totalBonus += RIVAL_PENALTY;
        result.rivalCount++;
      }
    }
  }

  return result;
}

/* ─── Scoring ────────────────────────────────────────────────────────── */
export function calculateTeamScore(lineup: (Player | null)[]): {
  baseScore: number;
  chemistryScore: number;
  totalScore: number;
  chemistry: ChemistryResult;
} {
  const baseScore = lineup.reduce((s, p) => s + (p?.score ?? 0), 0);
  const chemistry = calculateChemistry(lineup);
  const totalScore = baseScore + chemistry.totalBonus;
  return { baseScore, chemistryScore: chemistry.totalBonus, totalScore, chemistry };
}

/* ─── Tiers (same as main game) ──────────────────────────────────────── */
export const TIERS = [
  { min: 20001, label: 'GOAT OFFENSE',      icon: '🐐', color: '#e040ff' },
  { min: 17001, label: 'HALL OF FAME',       icon: '🏛️', color: '#ffd700' },
  { min: 14001, label: 'SUPER BOWL DYNASTY', icon: '🏆', color: '#f0c030' },
  { min: 11001, label: 'ALL-PRO ELITE',      icon: '⭐', color: '#42c0f8' },
  { min: 8001,  label: 'PRO BOWL CALIBER',   icon: '🔥', color: '#50d870' },
  { min: 5001,  label: 'STARTER QUALITY',    icon: '📈', color: '#a0b8d0' },
  { min: 2001,  label: 'BACKUP UNIT',        icon: '📋', color: '#808080' },
  { min: 0,     label: 'PRACTICE SQUAD',     icon: '🏈', color: '#e8a060' },
];
export function getTier(score: number) {
  return TIERS.find(t => score >= t.min)!;
}

/* ─── Playoff helpers ────────────────────────────────────────────────── */
export function generatePlayoffBracket(
  rankedUserIds: string[],
  playoffSizePct: number,
  totalPlayers: number
): { p1_id: string; p2_id: string; match_number: number }[] {
  const playoffCount = Math.max(2, Math.floor(totalPlayers * (playoffSizePct / 100)));
  const qualified = rankedUserIds.slice(0, playoffCount);

  // Seed matchups: 1 vs last, 2 vs second-to-last, etc.
  const matches: { p1_id: string; p2_id: string; match_number: number }[] = [];
  const half = Math.floor(qualified.length / 2);
  for (let i = 0; i < half; i++) {
    matches.push({
      p1_id: qualified[i],
      p2_id: qualified[qualified.length - 1 - i],
      match_number: i + 1,
    });
  }
  return matches;
}
