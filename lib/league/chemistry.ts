// nfl-minigames-hub/lib/league/chemistry.ts

export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'OT' | 'OG' | 'C';

// Minimal player shape needed for chemistry
export interface ChemPlayer {
  id: string;
  name: string;
  pos: string;
  team: string;
}

// ─── Bonus / penalty values ───────────────────────────────────────────────────
const MEDIUM_BONUS       =  250;
const CONSERVATIVE_BONUS =  150;

// Rivalry penalties scale by how "connected" the position pair is
// Skill positions that work directly together hurt more
const RIVALRY_PENALTIES: Record<string, number> = {
  // Skill-to-skill — directly competing positions, high penalty
  'QB||WR':  -100,
  'QB||TE':  -100,
  'QB||RB':  -50,
  'WR||WR':  -75,
  'RB||TE':  -25,

  // QB to line — QB protected by rival linemen, medium penalty
  'QB||OT':  -100,
  'QB||OG':  -50,
  'QB||C':   -125,

  // Line pairs — less direct relationship, smaller penalty
  'OT||RB':  -50,
  'OG||RB':  -75,
  'C ||RB':  -50,
  'OT||OG':  -50,
  'OT||C':   -50,
  'OG||C':   -50,
  'OG||OG':  -50,

};

// ─── Synergy pairs (same-team only) ──────────────────────────────────────────
type Tier = 'medium' | 'conservative';

const SYNERGY_PAIRS: { a: string; b: string; tier: Tier }[] = [
  { a: 'QB', b: 'WR',  tier: 'medium' },
  { a: 'QB', b: 'TE',  tier: 'medium' },
  { a: 'QB', b: 'OT',  tier: 'medium' },
  { a: 'QB', b: 'C',   tier: 'medium' },
  { a: 'OG', b: 'RB',  tier: 'medium' },
  { a: 'C',  b: 'RB',  tier: 'medium' },
  { a: 'C',  b: 'OG',  tier: 'medium' },
  { a: 'C',  b: 'OT',  tier: 'medium' },
  { a: 'OG', b: 'OT',  tier: 'medium' },
  { a: 'QB', b: 'RB',  tier: 'conservative' },
  { a: 'QB', b: 'OG',  tier: 'conservative' },
  { a: 'OT', b: 'RB',  tier: 'conservative' },
  { a: 'WR', b: 'WR',  tier: 'conservative' },
  { a: 'TE', b: 'OT',  tier: 'conservative' },
  { a: 'WR1',b: 'WR2', tier: 'conservative' },
  { a: 'WR1',b: 'WR3', tier: 'conservative' },
  { a: 'WR2',b: 'WR3', tier: 'conservative' },
];

const synergyMap = new Map<string, Tier>();
for (const { a, b, tier } of SYNERGY_PAIRS) {
  synergyMap.set([a, b].sort().join('||'), tier);
}

// ─── Rivalries ────────────────────────────────────────────────────────────────
const RIVALRY_PAIRS: [string, string][] = [
  ['New England Patriots',  'New York Jets'],
  ['New England Patriots',  'Buffalo Bills'],
  ['Buffalo Bills',         'Miami Dolphins'],
  ['Buffalo Bills',         'New York Jets'],
  ['Miami Dolphins',        'New York Jets'],
  ['Baltimore Ravens',      'Pittsburgh Steelers'],
  ['Baltimore Ravens',      'Cleveland Browns'],
  ['Pittsburgh Steelers',   'Cleveland Browns'],
  ['Cincinnati Bengals',    'Baltimore Ravens'],
  ['Houston Texans',        'Tennessee Titans'],
  ['Indianapolis Colts',    'Tennessee Titans'],
  ['Houston Texans',        'Indianapolis Colts'],
  ['Kansas City Chiefs',    'Las Vegas Raiders'],
  ['Kansas City Chiefs',    'Los Angeles Chargers'],
  ['Las Vegas Raiders',     'Los Angeles Chargers'],
  ['Denver Broncos',        'Kansas City Chiefs'],
  ['Denver Broncos',        'Las Vegas Raiders'],
  ['Dallas Cowboys',        'Philadelphia Eagles'],
  ['Dallas Cowboys',        'New York Giants'],
  ['Philadelphia Eagles',   'New York Giants'],
  ['New York Giants',       'Washington Commanders'],
  ['Green Bay Packers',     'Chicago Bears'],
  ['Green Bay Packers',     'Minnesota Vikings'],
  ['Chicago Bears',         'Minnesota Vikings'],
  ['Detroit Lions',         'Green Bay Packers'],
  ['Detroit Lions',         'Chicago Bears'],
  ['New Orleans Saints',    'Atlanta Falcons'],
  ['New Orleans Saints',    'Tampa Bay Buccaneers'],
  ['Atlanta Falcons',       'Tampa Bay Buccaneers'],
  ['Carolina Panthers',     'New Orleans Saints'],
  ['San Francisco 49ers',   'Los Angeles Rams'],
  ['Seattle Seahawks',      'Los Angeles Rams'],
  ['Arizona Cardinals',     'San Francisco 49ers'],
];

const rivalrySet = new Set<string>();
for (const [a, b] of RIVALRY_PAIRS) {
  rivalrySet.add([a, b].sort().join('||'));
}

export function areRivals(teamA: string, teamB: string): boolean {
  if (teamA === teamB) return false;
  return rivalrySet.has([teamA, teamB].sort().join('||'));
}

/** Returns the rivalry penalty for two positions, or 0 if not a penalised pair */
export function getRivalryPenalty(posA: string, posB: string): number {
  const key = [posA, posB].sort().join('||');
  return RIVALRY_PENALTIES[key] ?? 0;
}

// ─── Result types ─────────────────────────────────────────────────────────────
export interface ChemBond {
  playerAId:   string;
  playerBId:   string;
  playerAName: string;
  playerBName: string;
  type:   'synergy' | 'rivalry';
  points: number;
  reason: string;
}

export interface ChemResult {
  bonds:            ChemBond[];
  synergyPoints:    number;
  rivalryPoints:    number;
  totalChemPoints:  number;
}

// ─── Main calculator ──────────────────────────────────────────────────────────
export function calculateChemistry(roster: ChemPlayer[]): ChemResult {
  const bonds: ChemBond[] = [];

  for (let i = 0; i < roster.length; i++) {
    for (let j = i + 1; j < roster.length; j++) {
      const a = roster[i];
      const b = roster[j];

      if (a.team === b.team) {
        // Same team — check synergy
        const tier = synergyMap.get([a.pos, b.pos].sort().join('||'));
        if (tier) {
          const pts = tier === 'medium' ? MEDIUM_BONUS : CONSERVATIVE_BONUS;
          bonds.push({
            playerAId: a.id,   playerBId: b.id,
            playerAName: a.name, playerBName: b.name,
            type: 'synergy', points: pts,
            reason: `${a.pos} ↔ ${b.pos} (${a.team})`,
          });
        }
      } else if (areRivals(a.team, b.team)) {
        // Rival teams — penalty only if the position pair matters
        const penalty = getRivalryPenalty(a.pos, b.pos);
        if (penalty !== 0) {
          bonds.push({
            playerAId: a.id,   playerBId: b.id,
            playerAName: a.name, playerBName: b.name,
            type: 'rivalry', points: penalty,
            reason: `${a.pos} ↔ ${b.pos} (${a.team} vs ${b.team})`,
          });
        }
      }
    }
  }

  const synergyPoints = bonds
    .filter(b => b.type === 'synergy')
    .reduce((s, b) => s + b.points, 0);

  const rivalryPoints = bonds
    .filter(b => b.type === 'rivalry')
    .reduce((s, b) => s + b.points, 0);

  return {
    bonds,
    synergyPoints,
    rivalryPoints,
    totalChemPoints: synergyPoints + rivalryPoints,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function finalScore(draftScore: number, chem: ChemResult): number {
  return draftScore + chem.totalChemPoints;
}

/** Short label for UI: "+750 chem (3 syn, 1 riv)" */
export function chemistryLabel(c: ChemResult): string {
  const sign = c.totalChemPoints >= 0 ? '+' : '';
  const syn  = c.bonds.filter(b => b.type === 'synergy').length;
  const riv  = c.bonds.filter(b => b.type === 'rivalry').length;
  const parts: string[] = [];
  if (syn > 0) parts.push(`${syn} syn`);
  if (riv > 0) parts.push(`${riv} riv`);
  return `${sign}${c.totalChemPoints.toLocaleString()} chem${parts.length ? ` (${parts.join(', ')})` : ''}`;
}

/**
 * Preview chemistry for a single player being added to a partial roster.
 * Useful for showing "+250 / -200" hints in the draft UI before committing.
 */
export function previewPlayerChem(
  candidate: ChemPlayer,
  currentRoster: ChemPlayer[],
): { gain: number; loss: number; net: number; bonds: ChemBond[] } {
  const bonds: ChemBond[] = [];

  for (const existing of currentRoster) {
    if (existing.team === candidate.team) {
      const tier = synergyMap.get([existing.pos, candidate.pos].sort().join('||'));
      if (tier) {
        const pts = tier === 'medium' ? MEDIUM_BONUS : CONSERVATIVE_BONUS;
        bonds.push({
          playerAId: candidate.id, playerBId: existing.id,
          playerAName: candidate.name, playerBName: existing.name,
          type: 'synergy', points: pts,
          reason: `${candidate.pos} ↔ ${existing.pos} (${candidate.team})`,
        });
      }
    } else if (areRivals(candidate.team, existing.team)) {
      const penalty = getRivalryPenalty(candidate.pos, existing.pos);
      if (penalty !== 0) {
        bonds.push({
          playerAId: candidate.id, playerBId: existing.id,
          playerAName: candidate.name, playerBName: existing.name,
          type: 'rivalry', points: penalty,
          reason: `${candidate.pos} ↔ ${existing.pos} (${candidate.team} vs ${existing.team})`,
        });
      }
    }
  }

  const gain = bonds.filter(b => b.type === 'synergy').reduce((s, b) => s + b.points, 0);
  const loss = bonds.filter(b => b.type === 'rivalry').reduce((s, b) => s + b.points, 0);

  return { gain, loss, net: gain + loss, bonds };
}