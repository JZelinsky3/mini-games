/* ─────────────────────────────────────────────────────────────────────────────
   old-offense.ts
   Old batch — all players are NEW (not in vol 1).
   Merge by spreading into the same pool arrays:

     import { QB_POOL } from './nfl-offense-players';
     import { QB_POOL_V2 } from './nfl-offense-players-vol2';
     const QB_FULL = [...QB_POOL, ...QB_POOL_V2];

   Same scoring system as vol 1:
     Pro Bowl          → +80 each
     AP 2nd-Team       → +100 each
     AP 1st-Team       → +220 each
     Super Bowl Ring   → +150 each
     Super Bowl MVP    → +300
     League MVP        → +420 each
     Offensive POY     → +260
     Offensive ROTY    → +120
     Rushing/Rec title → +120 each
     Major record      → +80–180

   Rarity thresholds  (same as vol 1):
     common    →    0 –  699
     rare      →  700 – 1 499
     epic      → 1 500 – 2 799
     legendary → 2 800 +
───────────────────────────────────────────────────────────────────────────── */

import type { NFLPlayer, PositionGroup, Rarity } from './current-offense';

function r(score: number): Rarity {
  if (score >= 2800) return 'legendary';
  if (score >= 1500) return 'epic';
  if (score >=  700) return 'rare';
  return 'common';
}
function pl(
  id: string, name: string, pos: PositionGroup, team: string,
  score: number, accolades: string[],
): NFLPlayer {
  return { id, name, pos, team, score, rarity: r(score), accolades };
}

/* ══════════════════════════════════════════════════════════════════════
   QUARTERBACKS  — 20 new entries
══════════════════════════════════════════════════════════════════════ */
export const QB_POOL_OLD: NFLPlayer[] = [
];

/* ══════════════════════════════════════════════════════════════════════
   RUNNING BACKS  — 20 new entries
══════════════════════════════════════════════════════════════════════ */
export const RB_POOL_OLD: NFLPlayer[] = [
  pl('gro','Todd Gurley','RB','Free Agent (Ret.)', 1680, [
    '4× Pro Bowl','AP 1st-Team (2017)','2017 Offensive POY',
    '2016 OROTY','10th Pick (2015)',
    '2017: 2,093 scrimmage yards — highest in NFL that season',
  ]),
  pl('bel','Le\'Veon Bell','RB','Free Agent (Ret.)', 1240, [
    '4× Pro Bowl','AP 1st-Team (2017)','AP 2nd-Team',
    '2017: Highest yards after contact per attempt in NFL (4.1)',
    '2014: 2,215 scrimmage yards — Steelers franchise record',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   WIDE RECEIVERS  — 26 new entries
══════════════════════════════════════════════════════════════════════ */
export const WR_POOL_OLD: NFLPlayer[] = [
  pl('jca2','Julio Jones (note ret.)','WR','Free Agent', 1420, [
    '6th Pick (2011)','3× Pro Bowl','AP 1st-Team',
    '2015: 1,871 yards — NFL single-season receiving record at time',
    'Note: Retired; included for deep-cut legendary feel in late packs',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   TIGHT ENDS  — 14 new entries
══════════════════════════════════════════════════════════════════════ */
export const TE_POOL_OLD: NFLPlayer[] = [
  pl('gro2','Rob Gronkowski','TE','New England Patriots (Ret.)', 3200, [
    '5× Pro Bowl','4× AP 1st-Team','4× Super Bowl Champion',
    '2011 AP Offensive Player of Year','94th Pick (2010)',
    'All-time TE leader in TDs (92) at retirement',
    'Only TE with 3× All-Pro seasons and 4 rings — widely considered the greatest TE ever',
  ]),
  pl('gra','Jimmy Graham','TE','Free Agent (Ret.)', 1620, [
    '5× Pro Bowl','AP 1st-Team (2013)',
    'Highest-paid TE in NFL history (at signing, 2014)',
    '2011: 11 TDs — Saints franchise TE record',
    '6,000+ career receiving yards',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   OFFENSIVE TACKLES  — 18 new entries
══════════════════════════════════════════════════════════════════════ */
export const OT_POOL_OLD: NFLPlayer[] = [
  pl('lew','Taylor Lewan','OT','Tennessee Titans (ret.)', 720, [
    '3× Pro Bowl','11th Pick (2014)',
    '2018: AP 1st-Team — anchored Titans\' league-best run game',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   OFFENSIVE GUARDS  — 16 new entries
══════════════════════════════════════════════════════════════════════ */
export const OG_POOL_OLD: NFLPlayer[] = [
  pl('inc','Richie Incognito','OG','Free Agent (Ret.)', 940, [
    '4× Pro Bowl','AP 1st-Team (2015)','AP 2nd-Team ×2',
    '36th Pick (2005)','5× 1,000-snap seasons — physical dominant guard',
  ]),

  pl('bro3','Brandon Brooks','OG','Philadelphia Eagles (Ret.)', 1040, [
    '3× Pro Bowl','AP 1st-Team (2018)','Super Bowl LII Champion',
    '85th Pick (2012)','2018: Top-rated guard by PFF (90.5)',
    'Retired at prime due to Achilles injury',
  ]),
  pl('sea2','Rodger Saffold','OG','Free Agent (Ret.)', 700, [
    'Pro Bowl (2018)','Super Bowl LIII appearance (LAR)',
    '33rd Pick (2010)','9 seasons starting for one franchise',
  ]),
  pl('war2','Larry Warford','OG','New Orleans Saints (Ret.)', 760, [
    '3× Pro Bowl','AP 2nd-Team','65th Pick (2013)',
    '2018: 89.7 PFF grade — 2nd among all guards',
  ]),
];
/* ══════════════════════════════════════════════════════════════════════
   CENTERS  — 12 new entries
══════════════════════════════════════════════════════════════════════ */
export const C_POOL_OLD: NFLPlayer[] = [
  pl('joh4','Ben Jones','C','Free Agent (Ret.)', 480, [
    'Pro Bowl (2019)','91st Pick (2012)',
    '7× 1,000-snap seasons — iron man of the Titans O-Line',
    'Never missed a start in 10 seasons',
  ]),
  pl('rhu','Rodney Hudson','C','Free Agent (Ret.)', 860, [
    '55th Pick (2011)','4× Pro Bowl','AP 1st-Team (2019)',
    '2019: Highest-graded center in AFC per PFF (89.7)',
    '2016–21: Highest-rated long-term starter at C for Raiders',
  ]),
  pl('tra','Travis Frederick','C','Dallas Cowboys (Ret.)', 1080, [
    '31st Pick (2013)','5× Pro Bowl','AP 1st-Team (2016)',
    '2016: Considered best center in NFL — Cowboys Hall of Honor',
    'Retired 2020 due to Guillain-Barré syndrome — courageous exit',
  ]),
  pl('jke','Jason Kelce','C','Philadelphia Eagles (ret.)', 3060, [
    '6× Pro Bowl','5× AP 1st-Team',
    'Super Bowl LII Champion','3× Super Bowl appearances',
    'Considered the greatest center in NFL history',
    'Eagles franchise record for consecutive starts (13 years)',
    'Highest-graded center in PFF history (multiple seasons)',
  ]),
];
  /* ══════════════════════════════════════════════════════════════════════
     MASTER EXPORT  — vol 2
  ══════════════════════════════════════════════════════════════════════ */
  export const ALL_PLAYERS_OLD: Record<PositionGroup, NFLPlayer[]> = {
    QB: QB_POOL_OLD,
    RB: RB_POOL_OLD,
    WR: WR_POOL_OLD,
    TE: TE_POOL_OLD,
    OT: OT_POOL_OLD,
    OG: OG_POOL_OLD,
    C:  C_POOL_OLD,
  };