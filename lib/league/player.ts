// ─── Positions ────────────────────────────────────────────────────────────────

export type Position =
  | 'QB'
  | 'HB'
  | 'WR'
  | 'TE'
  | 'OT'   // Offensive Tackle
  | 'OG'   // Offensive Guard
  | 'C'    // Center
  | 'DE'
  | 'DT'
  | 'LB'
  | 'CB'
  | 'SS'
  | 'FS'
  | 'K'
  | 'P';

// ─── Player ───────────────────────────────────────────────────────────────────

export interface Player {
  id: string;
  name: string;
  position: Position;
  team: string;
  ovr: number;         // base overall rating (e.g. 1980)
  traits: string[];    // flavour text array
}

/**
 * Compact player constructor — mirrors the pl() shorthand in your existing data.
 * pl('joh2', 'Zion Johnson', 'OG', 'Cleveland Browns', 1980, ['trait1'])
 */
export function pl(
  id: string,
  name: string,
  position: Position,
  team: string,
  ovr: number,
  traits: string[],
): Player {
  return { id, name, position, team, ovr, traits };
}