import {
  LeagueSeason,
  LeagueMember,
  StandingsRow,
  PlayoffRound,
  FinalsState,
  DraftEntry,
  packTierForRank,
  packsForWeek,
  PLAYOFF_PACK_COUNT,
} from './types';
import { calculateChemistry, finalScore } from './chemistry';

// ─── Standings ────────────────────────────────────────────────────────────────

/**
 * Rebuild standings from all members' current teamScore.
 * Called at midnight after drafts are revealed.
 */
export function buildStandings(season: LeagueSeason): StandingsRow[] {
  const sorted = [...season.members].sort((a, b) => b.teamScore - a.teamScore);
  return sorted.map((m, idx) => {
    const existing = season.standings.find(s => s.memberId === m.userId);
    return {
      rank:         idx + 1,
      memberId:     m.userId,
      displayName:  m.displayName,
      teamScore:    m.teamScore,
      weeklyScores: existing ? existing.weeklyScores : [],
      playoffSeed:  existing?.playoffSeed ?? null,
    };
  });
}

// ─── Midnight Reset ───────────────────────────────────────────────────────────

/**
 * Called at midnight EST each week.
 * 1. Reveal all drafts (update teamScore for each member).
 * 2. Rebuild standings.
 * 3. Assign next week's pack tiers based on new standings.
 * 4. Advance week counter (or trigger playoffs if week 8 just ended).
 * 5. Schedule next reset.
 *
 * Does NOT handle the "pick a player to lock" step —
 * that happens client-side before the member opens next week's packs.
 * The lock selection is stored via `recordLockChoice`.
 */
export function processMidnightReset(season: LeagueSeason): LeagueSeason {
  const s = structuredClone(season);

  // 1. Commit each member's current draft score to their teamScore
  for (const member of s.members) {
    if (member.currentDraft) {
      member.teamScore = member.currentDraft.finalScore;
      // Append to history
      member.draftHistory.push(member.currentDraft);
      member.currentDraft = null;
    }
  }

  // 2. Rebuild standings
  s.standings = buildStandings(s);

  // 3. Update weekly scores array on each standings row
  for (const row of s.standings) {
    const member = s.members.find(m => m.userId === row.memberId)!;
    const lastDraft = member.draftHistory.at(-1);
    if (lastDraft) {
      row.weeklyScores.push(lastDraft.finalScore);
    }
  }

  // 4. Assign next pack tiers (based on just-revealed standings)
  const total = s.members.length;
  for (const row of s.standings) {
    const member = s.members.find(m => m.userId === row.memberId)!;
    member.nextPackTier = packTierForRank(row.rank, total);
  }

  // 5. Advance
  if (s.phase === 'regular') {
    if (s.currentWeek >= 8) {
      s.phase = 'gauntlet';
      s.currentWeek = 1;
      _initPlayoffs(s);
    } else {
      s.currentWeek += 1;
    }
  } else if (s.phase === 'gauntlet') {
    // Gauntlet advancement is handled separately via processGauntletRound
    s.currentWeek += 1;
  }

  // 6. Next midnight EST
  s.nextResetAt = _nextMidnightEST();

  return s;
}

// ─── Lock Choice ─────────────────────────────────────────────────────────────

/**
 * Record which player a member chose to lock after seeing their draft revealed.
 * Must be called after midnight reset, before the member opens new packs.
 */
export function recordLockChoice(
  season: LeagueSeason,
  memberId: string,
  playerId: string,
): LeagueSeason {
  const s = structuredClone(season);
  const member = s.members.find(m => m.userId === memberId);
  if (!member) throw new Error(`Member ${memberId} not found`);

  // Find player in their last draft
  const lastDraft = member.draftHistory.at(-1);
  if (!lastDraft) throw new Error('No draft history to pick from');

  const player = lastDraft.roster.find(p => p.id === playerId);
  if (!player) throw new Error(`Player ${playerId} not in last draft`);

  // Check not already locked
  if (member.permanentLocks.find(p => p.id === playerId)) {
    throw new Error(`Player ${playerId} is already locked`);
  }

  member.permanentLocks.push(player);
  lastDraft.lockedThisWeek = playerId;

  return s;
}

// ─── Draft Submission ─────────────────────────────────────────────────────────

/**
 * Submit a completed draft for a member.
 * Calculates chemistry and final score, stores as currentDraft.
 */
export function submitDraft(
  season: LeagueSeason,
  memberId: string,
  roster: import('./player').Player[],
  draftScore: number,
): LeagueSeason {
  if (roster.length !== 11) throw new Error('Roster must have exactly 11 players');

  const s = structuredClone(season);
  const member = s.members.find(m => m.userId === memberId);
  if (!member) throw new Error(`Member ${memberId} not found`);

  if (member.currentDraft) throw new Error('Draft already submitted this week');

  const chemistry = calculateChemistry(roster);
  const fs = finalScore(draftScore, chemistry);

  const isPlayoff = s.phase === 'gauntlet' || s.phase === 'finals';

  member.currentDraft = {
    memberId,
    weekNumber:      s.currentWeek,
    phase:           s.phase,
    roster,
    lockedPlayerIds: isPlayoff ? [] : member.permanentLocks.map(p => p.id),
    draftScore,
    chemistry,
    finalScore:      fs,
    completedAt:     Date.now(),
    packTierEarned:  packTierForRank(
      s.standings.find(r => r.memberId === memberId)?.rank ?? s.members.length,
      s.members.length,
    ),
    lockedThisWeek:  null,
  };

  return s;
}

// ─── Playoffs ─────────────────────────────────────────────────────────────────

function _initPlayoffs(season: LeagueSeason): void {
  const cfg = season.config;
  let qualCount: number;
  if (cfg.playoffSize === 'half') {
    qualCount = Math.floor(season.members.length / 2);
  } else {
    qualCount = Math.min(cfg.playoffSize as number, season.members.length);
  }

  // Seed by final regular-season standing
  const seeds = [...season.standings]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, qualCount);

  seeds.forEach((row, idx) => {
    row.playoffSeed = idx + 1;
    const member = season.members.find(m => m.userId === row.memberId)!;
    member.playoffActive = true;
  });

  // Non-qualifiers
  season.members
    .filter(m => !seeds.find(s => s.memberId === m.userId))
    .forEach(m => (m.playoffActive = false));
}

/**
 * Process the result of a gauntlet round:
 * - Eliminate the member with the lowest finalScore this round.
 * - If 2 remain → transition to finals.
 */
export function processGauntletRound(season: LeagueSeason): LeagueSeason {
  const s = structuredClone(season);
  if (s.phase !== 'gauntlet') throw new Error('Not in gauntlet phase');

  const active = s.members.filter(m => m.playoffActive);
  if (active.length <= 2) {
    // Move to finals
    s.phase = 'finals';
    s.finals = _initFinals(active[0].userId, active[1].userId);
    return s;
  }

  // Collect drafts for this round from active members
  const drafts: DraftEntry[] = active
    .map(m => m.draftHistory.at(-1))
    .filter((d): d is DraftEntry => !!d && d.phase === 'gauntlet');

  if (drafts.length !== active.length) {
    throw new Error('Not all active members have submitted gauntlet drafts');
  }

  // Lowest score is eliminated
  const sorted = [...drafts].sort((a, b) => a.finalScore - b.finalScore);
  const loser = sorted[0];
  const eliminatedMember = s.members.find(m => m.userId === loser.memberId)!;
  eliminatedMember.playoffActive = false;

  const round: PlayoffRound = {
    roundNumber: s.currentWeek,
    type:        'gauntlet',
    participants: active.map(m => m.userId),
    drafts,
    eliminated:  loser.memberId,
    gameWinner:  null,
    completedAt: Date.now(),
  };
  s.playoffRounds.push(round);

  // Check if only 2 remain
  const remaining = s.members.filter(m => m.playoffActive);
  if (remaining.length === 2) {
    s.phase  = 'finals';
    s.finals = _initFinals(remaining[0].userId, remaining[1].userId);
  }

  return s;
}

function _initFinals(memberAId: string, memberBId: string): FinalsState {
  return {
    memberA:  memberAId,
    memberB:  memberBId,
    games:    [null, null, null],
    winsA:    0,
    winsB:    0,
    champion: null,
  };
}

/**
 * Record one finals game result.
 * Provide the two finalScores; higher score wins the game.
 */
export function recordFinalsGame(
  season: LeagueSeason,
  scoreA: number,
  scoreB: number,
): LeagueSeason {
  const s = structuredClone(season);
  if (s.phase !== 'finals' || !s.finals) throw new Error('Not in finals phase');

  const f = s.finals;
  const gameIdx = f.games.findIndex(g => g === null);
  if (gameIdx === -1) throw new Error('All finals games already played');

  const winner = scoreA >= scoreB ? 'A' : 'B';
  f.games[gameIdx] = winner;
  if (winner === 'A') f.winsA++;
  else f.winsB++;

  // First to 2 wins
  if (f.winsA >= 2) {
    f.champion = f.memberA;
    s.phase = 'complete';
  } else if (f.winsB >= 2) {
    f.champion = f.memberB;
    s.phase = 'complete';
  }

  const round: PlayoffRound = {
    roundNumber: gameIdx + 1,
    type:        'finals_game',
    participants: [f.memberA, f.memberB],
    drafts:      [],  // populated from member draftHistory externally
    eliminated:  null,
    gameWinner:  winner === 'A' ? f.memberA : f.memberB,
    completedAt: Date.now(),
  };
  s.playoffRounds.push(round);

  return s;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function _nextMidnightEST(): number {
  const now = new Date();
  // EST = UTC-5, EDT = UTC-4; use fixed -5 for simplicity, adjust if needed
  const estOffset = -5 * 60;
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const estMs = utcMs + estOffset * 60000;
  const estDate = new Date(estMs);
  estDate.setHours(24, 0, 0, 0);  // next midnight in EST
  // Convert back to UTC ms
  return estDate.getTime() - estOffset * 60000;
}

/**
 * How many packs a member should open for their next draft.
 * Regular season: decreases each week. Playoffs: always 11.
 */
export function packsForMember(season: LeagueSeason): number {
  if (season.phase === 'gauntlet' || season.phase === 'finals') {
    return PLAYOFF_PACK_COUNT;
  }
  return packsForWeek(season.currentWeek);
}