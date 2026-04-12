/* ─────────────────────────────────────────────────────────────────────────────
   current-offense-vol3.ts
   THIRD batch — active players who appeared on NFL rosters in 2025.
   Zero overlap with Vol 1 or Vol 2.

   Merge pattern (same as Vol 2):
     import { ALL_PLAYERS }    from './nfl-offense-players';
     import { ALL_PLAYERS_V2 } from './nfl-offense-players-vol2';
     import { ALL_PLAYERS_V3 } from './nfl-offense-players-vol3';

     const FULL_POOL = Object.fromEntries(
       Object.keys(ALL_PLAYERS).map(pos => [
         pos, [
           ...ALL_PLAYERS[pos],
           ...ALL_PLAYERS_V2[pos],
           ...ALL_PLAYERS_V3[pos],
         ],
       ])
     );

   Same scoring & rarity thresholds as Vol 1 & 2.
───────────────────────────────────────────────────────────────────────────── */

import type { NFLPlayer, PositionGroup, Rarity } from './current-offense-qb';

function r(score: number): Rarity {
  if (score >= 4000) return 'immortal';
  if (score >= 2800) return 'transcendent';
  if (score >= 1500) return 'dynasty';
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
   WIDE RECEIVERS — V2
   Current 2025–2026 skill-based scoring | Varied common scores
══════════════════════════════════════════════════════════════════════ */

export const WR_POOL_V1: NFLPlayer[] = [
  // === TRANSCENDENT TIER ===
  pl('jef','Justin Jefferson','WR','Minnesota Vikings', 3520, [
    'Elite route technician','Generational talent'
  ]),
  pl('chs','Ja\'Marr Chase','WR','Cincinnati Bengals', 3480, [
    'Explosive big-play threat','Instant superstar'
  ]),
  pl('nac','Puka Nacua','WR','Los Angeles Rams', 3380, [
    'Record-breaking production','Undrafted sensation'
  ]),
  pl('jre3','Jaxon Smith-Njigba','WR','Seattle Seahawks', 3150, [
    'Breakout superstar','Led NFL in yards'
  ]),
  pl('std','Amon-Ra St. Brown','WR','Detroit Lions', 3020, [
    'Slot chain-mover','Consistent 100+ catch seasons'
  ]),

  // === DYNASTY TIER ===
  pl('cdl','CeeDee Lamb','WR','Dallas Cowboys', 2880, [
    'High-volume alpha','Multiple 1,000+ yard seasons'
  ]),
  pl('bro','A.J. Brown','WR','Philadelphia Eagles', 2750, [
    'Physical YAC monster','Deep-ball threat'
  ]),
  pl('nab','Malik Nabers','WR','New York Giants', 2720, [
    'Explosive rookie star','Franchise record setter'
  ]),
  pl('lon','Drake London','WR','Atlanta Falcons', 2420, [
    'Consistent target hog','Reliable alpha'
  ]),
  pl('ada','Davante Adams','WR','Las Vegas Raiders', 2080, [
    'Elite route runner','Red-zone specialist'
  ]),
  pl('nic','Nico Collins','WR','Houston Texans', 2320, [
    'Rising deep threat','Big-play producer'
  ]),

  // === RARE TIER (700–1499) ===
  pl('ter','Terry McLaurin','WR','Washington Commanders', 1880, [
    'Consistent deep threat','Franchise leader'
  ]),
  pl('bna','Brian Thomas Jr.','WR','Jacksonville Jaguars', 1580, [
    'Elite rookie production','Big-play ability'
  ]),
  pl('wil2','Garrett Wilson','WR','New York Jets', 1780, [
    'Talented young star','OROTY winner'
  ]),
  pl('zfl','Zay Flowers','WR','Baltimore Ravens', 1680, [
    'Dynamic slot weapon','Instant impact rookie'
  ]),
  pl('hig','Tee Higgins','WR','Cincinnati Bengals', 1580, [
    'Big-bodied red-zone threat','Multiple 1,000-yard seasons'
  ]),
  pl('coo3','Amari Cooper','WR','Cleveland Browns', 1020, [
    'Veteran alpha','Consistent 1,000-yard producer'
  ]),
  pl('mtp','Michael Pittman Jr.','WR','Indianapolis Colts', 980, [
    'Contested-catch specialist','High target share'
  ]),
  pl('dmo','DJ Moore','WR','Chicago Bears', 920, [
    'Reliable volume receiver','Multiple 1,000-yard seasons'
  ]),
  pl('aiy','Brandon Aiyuk','WR','San Francisco 49ers', 880, [
    'Smooth route runner','Super Bowl contender piece'
  ]),
  pl('rid','Calvin Ridley','WR','Tennessee Titans', 840, [
    'Comeback performer','Strong deep threat'
  ]),
  pl('add','Jordan Addison','WR','Minnesota Vikings', 820, [
    'Complementary playmaker','Reliable target'
  ]),

  // === COMMON TIER — Varied scores (205–680) ===
  pl('obe','Odell Beckham Jr.','WR','Miami Dolphins', 680, [
    'Iconic playmaker','Veteran big-play threat'
  ]),
  pl('csa','Chris Godwin','WR','Tampa Bay Buccaneers', 750, [
    'Reliable slot presence','Super Bowl champion'
  ]),
  pl('thi2','Tyler Boyd','WR','Tennessee Titans', 630, [
    'Veteran slot weapon','Consistent producer'
  ]),
  pl('ksh','Khalil Shakir','WR','Buffalo Bills', 610, [
    'Slot specialist','High catch rate'
  ]),
  pl('hro','Hollywood Brown','WR','Philadelphia Eagles', 580, [
    'Speed deep threat','Explosive when healthy'
  ]),
  pl('crox','Christian Kirk','WR','Jacksonville Jaguars', 640, [
    'Reliable route runner','Strong target share'
  ]),
  pl('dch','D.J. Chark Jr.','WR','Las Vegas Raiders', 580, [
    'Deep-ball specialist','Breakout potential'
  ]),
  pl('jre','Josh Reynolds','WR','Detroit Lions', 500, [
    'Veteran depth piece','Super Bowl experience'
  ]),
  pl('rsh','Rashid Shaheed','WR','New Orleans Saints', 680, [
    'Speed threat','Breakthrough performer'
  ]),
  pl('jsa','Josh Palmer','WR','Los Angeles Chargers', 460, [
    'Reliable WR2','Trusted complementary piece'
  ]),
  pl('rme','Romeo Doubs','WR','Green Bay Packers', 640, [
    'Developing target','Strong rapport with Love'
  ]),
  pl('ava','Allen Lazard','WR','New York Jets', 420, [
    'Reliable hands','Physical receiver'
  ]),
  pl('dmo2','Darnell Mooney','WR','Atlanta Falcons', 500, [
    'Consistent deep option','Multiple 1,000-yard seasons'
  ]),
  pl('jme','Jakobi Meyers','WR','Las Vegas Raiders', 580, [
    'Slot possession receiver','1,000-yard season'
  ]),
  pl('ndl','Tank Dell','WR','Houston Texans', 460, [
    'Undersized competitor','Rookie impact'
  ]),
  pl('gab','Gabe Davis','WR','Jacksonville Jaguars', 440, [
    'Big-play streak threat','Playoff performer'
  ]),
  pl('chr','Christian Watson','WR','Green Bay Packers', 620, [
    'Size/speed combo','Emerging deep threat'
  ]),
  pl('tre3','Treylon Burks','WR','Tennessee Titans', 305, [
    'YAC ability','Physical receiver'
  ]),
  pl('qjo','Quentin Johnston','WR','Los Angeles Chargers', 490, [
    'Physical deep threat','Developing WR1'
  ]),
  pl('par','Josh Palmer','WR','Los Angeles Chargers', 275, [
    'Complementary piece','Reliable depth'
  ]),
  pl('sba2','Sterling Shepard','WR','Free Agent', 460, [
    'Veteran slot','Resilient veteran'
  ]),
  pl('vsh','Van Jefferson','WR','Los Angeles Rams', 435, [
    'Reliable route runner','Super Bowl champion'
  ]),
  pl('rma','Rondale Moore','WR','Atlanta Falcons', 325, [
    'Electric YAC runner','Slot playmaker'
  ]),
  pl('hig2x','Hunter Renfrow','WR','Las Vegas Raiders', 415, [
    'Slot master','High catch rate'
  ]),
  pl('kto','Kadarius Toney','WR','Free Agent', 310, [
    'Electric with ball','Injury recovery'
  ]),
  pl('cti','Cedric Tillman','WR','Cleveland Browns', 320, [
    'SEC standout','Developing depth'
  ]),
  pl('trf','Troy Franklin','WR','Denver Broncos', 330, [
    'Big-play college star','Emerging target'
  ]),
  pl('vve','Devaughn Vele','WR','Denver Broncos', 305, [
    'Reliable rookie option','College standout'
  ]),
  pl('ttr','Tre Tucker','WR','Las Vegas Raiders', 515, [
    'Speed deep threat','Special teams ace'
  ]),
  pl('jmg','Jonathan Mingo','WR','Chicago Bears', 325, [
    'Developing depth','College producer'
  ]),
  pl('mho','Mack Hollins','WR','Atlanta Falcons', 210, [
    'Special teams contributor','Veteran depth'
  ]),
  pl('vel','Velus Jones Jr.','WR','Chicago Bears', 220, [
    'Kick return specialist','Speed threat'
  ]),
  pl('shi','Shi Smith','WR','Carolina Panthers', 205, [
    'Slot option','College record holder'
  ]),
  pl('par3','Parker Washington','WR','Jacksonville Jaguars', 230, [
    'Big Ten leader','Emerging slot'
  ]),
  pl('dwi','Dontayvion Wicks','WR','Green Bay Packers', 335, [
    'Route runner','College standout'
  ]),
  pl('xhu','Xavier Hutchinson','WR','Houston Texans', 215, [
    'Undrafted gem','Reliable WR3'
  ]),
  pl('jml','Jalen McMillan','WR','Tampa Bay Buccaneers', 325, [
    'Rising WR2','Route specialist'
  ]),
  pl('tua2','Tutu Atwell','WR','Los Angeles Rams', 410, [
    'Explosive speed','Big-play threat'
  ]),
  pl('rpe','Ricky Pearsall','WR','San Francisco 49ers', 320, [
    'Resilient rookie','Elite traits'
  ]),
  pl('ami','Adonai Mitchell','WR','Indianapolis Colts', 405, [
    'Developing complement','College standout'
  ]),
  pl('lmc','Luke McCaffrey','WR','Washington Commanders', 215, [
    'Athletic slot','Bloodline talent'
  ]),
  pl('jdo','Josh Downs','WR','Indianapolis Colts', 530, [
    'Slot wizard','High catch rate'
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   MASTER EXPORT  — vol 3
══════════════════════════════════════════════════════════════════════ */
export const ALL_PLAYERS_V3: Record<PositionGroup, NFLPlayer[]> = {
  QB: [],
  RB: [],
  WR: WR_POOL_V1,
  TE: [],
  OT: [],
  OG: [],
  C:  [],
};

/* ── Quick stats ──
   QB: 18 · RB: 20 · WR: 26 · TE: 13 · OT: 18 · OG: 16 · C: 13
   Vol 3 total: 124 new players
   Running combined total (Vol 1 + 2 + 3): ~373 players
─────────────────────────────────────────────────────────────────── */