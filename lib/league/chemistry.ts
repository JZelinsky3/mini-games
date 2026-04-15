// nfl-minigames-hub/lib/league/chemistry.ts

export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'OT' | 'OG' | 'C'
                     | 'DE' | 'DT' | 'LB' | 'CB' | 'SS' | 'FS' | 'K' | 'P';

// Minimal player shape needed for chemistry — compatible with your existing pl() players
export interface ChemPlayer {
  id: string;
  name: string;
  pos: string;   // matches your existing field name
  team: string;
}

// ─── Bonus values ─────────────────────────────────────────────────────────────
const MEDIUM_BONUS       =  250;
const CONSERVATIVE_BONUS =  150;
const RIVAL_PENALTY      = -100;  // flat regardless of position

// ─── Synergy pairs (same-team only) ──────────────────────────────────────────
// Medium:       QB↔WR, QB↔TE, QB↔OT, OG↔RB, C↔RB
// Conservative: QB↔RB, QB↔OG, QB↔C, OT↔RB, WR↔WR, TE↔OT
type Tier = 'medium' | 'conservative';

const SYNERGY_PAIRS: { a: string; b: string; tier: Tier }[] = [
  { a: 'QB', b: 'WR',  tier: 'medium' },
  { a: 'QB', b: 'TE',  tier: 'medium' },
  { a: 'QB', b: 'OT',  tier: 'medium' },
  { a: 'OG', b: 'RB',  tier: 'medium' },
  { a: 'C',  b: 'RB',  tier: 'medium' },
  { a: 'QB', b: 'RB',  tier: 'conservative' },
  { a: 'QB', b: 'OG',  tier: 'conservative' },
  { a: 'QB', b: 'C',   tier: 'conservative' },
  { a: 'OT', b: 'RB',  tier: 'conservative' },
  { a: 'WR', b: 'WR',  tier: 'conservative' },
  { a: 'TE', b: 'OT',  tier: 'conservative' },
];

const synergyMap = new Map<string, Tier>();
for (const { a, b, tier } of SYNERGY_PAIRS) {
  synergyMap.set([a, b].sort().join('||'), tier);
}

// ─── Rivalries ────────────────────────────────────────────────────────────────
const RIVALRY_PAIRS: [string, string][] = [
  ['New England Patriots','New York Jets'],
  ['New England Patriots','Buffalo Bills'],
  ['New England Patriots','Miami Dolphins'],
  ['Buffalo Bills','Miami Dolphins'],
  ['Buffalo Bills','New York Jets'],
  ['Miami Dolphins','New York Jets'],
  ['Baltimore Ravens','Pittsburgh Steelers'],
  ['Baltimore Ravens','Cleveland Browns'],
  ['Pittsburgh Steelers','Cleveland Browns'],
  ['Cincinnati Bengals','Pittsburgh Steelers'],
  ['Cincinnati Bengals','Baltimore Ravens'],
  ['Houston Texans','Tennessee Titans'],
  ['Indianapolis Colts','Tennessee Titans'],
  ['Jacksonville Jaguars','Tennessee Titans'],
  ['Houston Texans','Indianapolis Colts'],
  ['Kansas City Chiefs','Las Vegas Raiders'],
  ['Kansas City Chiefs','Los Angeles Chargers'],
  ['Las Vegas Raiders','Los Angeles Chargers'],
  ['Denver Broncos','Kansas City Chiefs'],
  ['Denver Broncos','Las Vegas Raiders'],
  ['Dallas Cowboys','Philadelphia Eagles'],
  ['Dallas Cowboys','New York Giants'],
  ['Dallas Cowboys','Washington Commanders'],
  ['Philadelphia Eagles','New York Giants'],
  ['Philadelphia Eagles','Washington Commanders'],
  ['New York Giants','Washington Commanders'],
  ['Green Bay Packers','Chicago Bears'],
  ['Green Bay Packers','Minnesota Vikings'],
  ['Chicago Bears','Minnesota Vikings'],
  ['Detroit Lions','Green Bay Packers'],
  ['Detroit Lions','Chicago Bears'],
  ['New Orleans Saints','Atlanta Falcons'],
  ['New Orleans Saints','Tampa Bay Buccaneers'],
  ['Atlanta Falcons','Tampa Bay Buccaneers'],
  ['Carolina Panthers','New Orleans Saints'],
  ['San Francisco 49ers','Seattle Seahawks'],
  ['San Francisco 49ers','Los Angeles Rams'],
  ['Seattle Seahawks','Los Angeles Rams'],
  ['Arizona Cardinals','San Francisco 49ers'],
  ['Arizona Cardinals','Seattle Seahawks'],
];

const rivalrySet = new Set<string>();
for (const [a, b] of RIVALRY_PAIRS) {
  rivalrySet.add([a, b].sort().join('||'));
}

export function areRivals(teamA: string, teamB: string): boolean {
  if (teamA === teamB) return false;
  return rivalrySet.has([teamA, teamB].sort().join('||'));
}

// ─── Result types ─────────────────────────────────────────────────────────────
export interface ChemBond {
  playerAId: string;
  playerBId: string;
  playerAName: string;
  playerBName: string;
  type: 'synergy' | 'rivalry';
  points: number;
  reason: string;  // e.g. "QB ↔ WR (Chiefs)" or "Chiefs vs Raiders"
}

export interface ChemResult {
  bonds: ChemBond[];
  synergyPoints: number;
  rivalryPoints: number;
  totalChemPoints: number;
}

// ─── Main calculator ──────────────────────────────────────────────────────────
export function calculateChemistry(roster: ChemPlayer[]): ChemResult {
  const bonds: ChemBond[] = [];

  for (let i = 0; i < roster.length; i++) {
    for (let j = i + 1; j < roster.length; j++) {
      const a = roster[i];
      const b = roster[j];

      if (a.team === b.team) {
        const tier = synergyMap.get([a.pos, b.pos].sort().join('||'));
        if (tier) {
          const pts = tier === 'medium' ? MEDIUM_BONUS : CONSERVATIVE_BONUS;
          bonds.push({
            playerAId: a.id, playerBId: b.id,
            playerAName: a.name, playerBName: b.name,
            type: 'synergy', points: pts,
            reason: `${a.pos} ↔ ${b.pos} (${a.team})`,
          });
        }
      } else if (areRivals(a.team, b.team)) {
        bonds.push({
          playerAId: a.id, playerBId: b.id,
          playerAName: a.name, playerBName: b.name,
          type: 'rivalry', points: RIVAL_PENALTY,
          reason: `${a.team} vs ${b.team}`,
        });
      }
    }
  }

  const synergyPoints = bonds.filter(b => b.type === 'synergy').reduce((s, b) => s + b.points, 0);
  const rivalryPoints = bonds.filter(b => b.type === 'rivalry').reduce((s, b) => s + b.points, 0);

  return { bonds, synergyPoints, rivalryPoints, totalChemPoints: synergyPoints + rivalryPoints };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function finalScore(draftScore: number, chem: ChemResult): number {
  return draftScore + chem.totalChemPoints;
}

/** Short label for UI: "+750 chem (3 syn, 1 riv)" */
export function chemShortLabel(c: ChemResult): string {
  const sign = c.totalChemPoints >= 0 ? '+' : '';
  const syn  = c.bonds.filter(b => b.type === 'synergy').length;
  const riv  = c.bonds.filter(b => b.type === 'rivalry').length;
  const parts = [];
  if (syn > 0) parts.push(`${syn} syn`);
  if (riv > 0) parts.push(`${riv} riv`);
  return `${sign}${c.totalChemPoints.toLocaleString()} chem${parts.length ? ` (${parts.join(', ')})` : ''}`;
}