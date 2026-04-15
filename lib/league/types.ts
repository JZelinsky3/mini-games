import { Player } from './player';
import { ChemistryResult } from './chemistry';

// ─── League Config ────────────────────────────────────────────────────────────

export type LeagueVisibility = 'public' | 'invite';

export interface LeagueConfig {
  id: string;
  name: string;
  commissionerId: string;
  visibility: LeagueVisibility;
  joinCode: string;           // used for both public (shareable) and invite
  minPlayers: number;         // default 4
  maxPlayers: number;         // default 12
  playoffSize: number | 'half'; // commissioner sets this; 'half' = 50% of members
  createdAt: number;          // unix ms
}

// ─── Phase ────────────────────────────────────────────────────────────────────

export type SeasonPhase =
  | 'pregame'       // league created, waiting for players
  | 'regular'       // weeks 1–8
  | 'gauntlet'      // playoff gauntlet rounds
  | 'finals'        // best-of-3
  | 'complete';     // champion crowned

// ─── Pack Tiers ───────────────────────────────────────────────────────────────

export type PackTier = 'elite_drop' | 'prime_pack' | 'rising_pack' | 'standard_pack';

/**
 * Returns the boosted pack tier a member earns based on their
 * rank among all active league members last week.
 */
export function packTierForRank(rank: number, totalMembers: number): PackTier {
  if (rank === 1)                        return 'elite_drop';
  if (rank <= Math.ceil(totalMembers * 0.25)) return 'prime_pack';
  if (rank <= Math.ceil(totalMembers * 0.55)) return 'rising_pack';
  return 'standard_pack';
}

export const PACK_TIER_LABELS: Record<PackTier, string> = {
  elite_drop:    'Elite Drop',
  prime_pack:    'Prime Pack',
  rising_pack:   'Rising Pack',
  standard_pack: 'Standard Pack',
};

// ─── Draft ────────────────────────────────────────────────────────────────────

/**
 * A single completed draft for one member in one week/round.
 * Playoffs: no locked players, always 11 packs.
 */
export interface DraftEntry {
  memberId: string;
  weekNumber: number;          // 1–8 regular; 1+ in playoffs (resets per phase)
  phase: SeasonPhase;
  roster: Player[];            // full 11-player lineup
  lockedPlayerIds: string[];   // IDs of players in locked slots (regular season only)
  draftScore: number;          // raw sum from pack game logic
  chemistry: ChemistryResult;
  finalScore: number;          // draftScore + chemistry.totalChemistryPoints
  completedAt: number;         // unix ms
  packTierEarned: PackTier;    // boosted pack for next week
  /** The player this member chose to lock after the draft (regular season only) */
  lockedThisWeek: string | null;
}

// ─── Member ───────────────────────────────────────────────────────────────────

export interface LeagueMember {
  userId: string;
  displayName: string;
  joinedAt: number;

  /** Locked players accumulated across regular season weeks */
  permanentLocks: Player[];    // grows by 1 each week; max 8 by end of week 8

  /** Current week's draft, null if not yet drafted */
  currentDraft: DraftEntry | null;

  /** All historical drafts, oldest first */
  draftHistory: DraftEntry[];

  /** Current cumulative team score (updates at midnight reveal) */
  teamScore: number;

  /** Pack tier earned last week; determines which boosted pack they open */
  nextPackTier: PackTier;

  /** Is this member still in the playoffs? */
  playoffActive: boolean;
}

// ─── Standings Row ────────────────────────────────────────────────────────────

export interface StandingsRow {
  rank: number;
  memberId: string;
  displayName: string;
  teamScore: number;
  weeklyScores: number[];      // one entry per revealed week
  playoffSeed: number | null;  // set once playoffs begin
}

// ─── Playoff State ────────────────────────────────────────────────────────────

export type PlayoffRoundType = 'gauntlet' | 'finals_game';

export interface PlayoffRound {
  roundNumber: number;
  type: PlayoffRoundType;
  /** For gauntlet: all remaining member IDs drafted this round */
  participants: string[];
  /** DraftEntry for each participant this round */
  drafts: DraftEntry[];
  /** Member eliminated (gauntlet) or null (finals game) */
  eliminated: string | null;
  /** Winner of a finals game, null for gauntlet */
  gameWinner: string | null;
  completedAt: number | null;
}

export interface FinalsState {
  memberA: string;
  memberB: string;
  /** Results per game: 'A' | 'B' | null */
  games: [string | null, string | null, string | null];
  winsA: number;
  winsB: number;
  champion: string | null;
}

// ─── Season ───────────────────────────────────────────────────────────────────

export interface LeagueSeason {
  config: LeagueConfig;
  phase: SeasonPhase;
  currentWeek: number;         // 1–8 during regular; playoff round number after
  members: LeagueMember[];
  /** Revealed after each midnight reset */
  standings: StandingsRow[];
  playoffRounds: PlayoffRound[];
  finals: FinalsState | null;
  /** Unix ms of next midnight EST reset */
  nextResetAt: number;
}

// ─── Packs per week ───────────────────────────────────────────────────────────

/**
 * How many packs a member opens in a given regular-season week.
 * Week 1 = 11, decreasing by 1 each week. Floor is 4 (week 8).
 */
export function packsForWeek(weekNumber: number): number {
  return Math.max(12 - weekNumber, 4);
}

/**
 * Packs for playoff rounds: always 11 (no locked players in playoffs).
 */
export const PLAYOFF_PACK_COUNT = 11;