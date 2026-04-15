// ─── Public API ───────────────────────────────────────────────────────────────
export { pl }                          from './player';
export type { Player, Position }       from './player';
export { areRivals }                   from './rivalries';
export {
  calculateChemistry,
  finalScore,
  chemistryLabel,
}                                      from './chemistry';

export type { 
  ChemBond as ChemistryBond, 
  ChemResult as ChemistryResult 
} from './chemistry';

export {
  submitDraft,
  processMidnightReset,
  recordLockChoice,
  processGauntletRound,
  recordFinalsGame,
  packsForMember,
  buildStandings,
}                                      from './season';
export {
  packTierForRank,
  packsForWeek,
  PLAYOFF_PACK_COUNT,
  PACK_TIER_LABELS,
}                                      from './types';
export type {
  LeagueConfig,
  LeagueSeason,
  LeagueMember,
  StandingsRow,
  DraftEntry,
  PlayoffRound,
  FinalsState,
  PackTier,
  SeasonPhase,
  LeagueVisibility,
}                                      from './types';