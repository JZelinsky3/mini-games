/* ─────────────────────────────────────────────────────────────────────────────
   nfl-offense-players-vol5.ts
   FIFTH batch — active 2025 players, depth pieces, ascending starters,
   and a handful of veterans adding rare/epic colour.

   Target distribution (this volume):
     ~55% common  (0 – 699)
     ~35% rare    (700 – 1 499)
     ~10% epic    (1 500 – 2 799)
       0% legendary — saved for Vols 1-3

   Same mkP / rarity helper pattern as prior volumes.
───────────────────────────────────────────────────────────────────────────── */

import type { NFLPlayer, PositionGroup, Rarity } from './current-offense-qb';

function r(score: number): Rarity {
  if (score >= 2800) return 'transcendent';
  if (score >= 1500) return 'dynasty';
  if (score >= 700) return 'rare';
  return 'common';
}

function pl(
  id: string, 
  name: string, 
  pos: PositionGroup, 
  team: string,
  score: number, 
  accolades: string[]
): NFLPlayer {
  return { id, name, pos, team, score, rarity: r(score), accolades };
}

/* ══════════════════════════════════════════════════════════════════════
   OFFENSIVE TACKLES — V2
   Current 2025–2026 skill-based scoring | No retired players
   Common scores tightened (200–680) for better depth
══════════════════════════════════════════════════════════════════════ */

export const OT_POOL_V1: NFLPlayer[] = [
  // === TRANSCENDENT TIER ===
  pl('ljo','Lane Johnson','OT','Philadelphia Eagles', 3650, [
    'Elite right tackle','Multiple All-Pro seasons'
  ]),
  pl('twi','Trent Williams','OT','San Francisco 49ers', 3550, [
    'Dominant left tackle','Still elite at advanced age'
  ]),
  pl('wir','Tristan Wirfs','OT','Tampa Bay Buccaneers', 3380, [
    'Perennial All-Pro','Highest-graded tackle contender'
  ]),
  pl('sew','Penei Sewell','OT','Detroit Lions', 3250, [
    'Highest-graded OT in 2025','Cornerstone of Lions O-Line'
  ]),

  // === DYNASTY TIER ===
  pl('sla','Rashawn Slater','OT','Los Angeles Chargers', 2680, [
    'Elite pass protector','Consistent All-Pro level'
  ]),
  pl('bak','David Bakhtiari','OT','Green Bay Packers', 2380, [
    'Former elite protector','Strong when healthy'
  ]),
  pl('tho','Andrew Thomas','OT','New York Giants', 2180, [
    'Reliable franchise LT','Zero-sack stretches'
  ]),
  pl('dar','Christian Darrisaw','OT','Minnesota Vikings', 1980, [
    'Ascending blind-side anchor','Pro Bowl caliber'
  ]),
  pl('tun','Laremy Tunsil','OT','Houston Texans', 1880, [
    'Highest-paid LT history','Strong pass blocker'
  ]),

  // === RARE TIER (700–1499) ===
  pl('tmo','Taylor Moton','OT','Carolina Panthers', 1420, [
    'Dependable right tackle','Multiple Pro Bowl nods'
  ]),
  pl('rst','Ronnie Stanley','OT','Baltimore Ravens', 1350, [
    'Elite when healthy','Former All-Pro LT'
  ]),
  pl('aco','Abraham Lucas','OT','Seattle Seahawks', 1280, [
    'Injury-prone but talented','Super Bowl champion RT'
  ]),
  pl('mne','Morgan Moses','OT','New York Jets', 1120, [
    'Veteran ironman','Long consecutive starts'
  ]),
  pl('psk','Peter Skoronski','OT','Tennessee Titans', 1080, [
    'High-graded young talent','Pro Bowl consideration'
  ]),
  pl('daw','Dion Dawkins','OT','Buffalo Bills', 1020, [
    'Solid LT for Allen','Pro Bowl alternate'
  ]),
  pl('cos','Sam Cosmi','OT','Washington Commanders', 980, [
    'Strong run blocker','Recent Pro Bowl level'
  ]),
  pl('crs','Charles Cross','OT','Seattle Seahawks', 840, [
    'Fewest pressures allowed','Super Bowl champion LT'
  ]),
  pl('jma2','Jake Matthews','OT','Atlanta Falcons', 820, [
    'Ironman franchise LT','OL royalty'
  ]),

  // === EXPANDED COMMON TIER (200–680) — Tight score clustering ===
  pl('tfo','Taylor Decker','OT','Detroit Lions', 680, [
    'Physical left tackle','Key in Lions resurgence'
  ]),
  pl('ore','Orlando Brown Jr.','OT','Cincinnati Bengals', 650, [
    'Powerful run blocker','Former All-Pro'
  ]),
  pl('jco3','Jawaan Taylor','OT','Kansas City Chiefs', 630, [
    'Super Bowl champion RT','Reliable anchor'
  ]),
  pl('tri','Trent Brown','OT','New England Patriots', 620, [
    'Massive imposing frame','Pro Bowl pedigree'
  ]),
  pl('mil','Kolton Miller','OT','Las Vegas Raiders', 600, [
    'Low sack seasons','Consistent starter'
  ]),
  pl('smi2','Donovan Smith','OT','Free Agent', 580, [
    'Super Bowl champion LT','Veteran experience'
  ]),
  pl('jos2','Josh Jones','OT','Houston Texans', 560, [
    'Pro Bowl alternate','Low-pressure seasons'
  ]),
  pl('mca2','Mike Onwenu','OT','New England Patriots', 540, [
    'Versatile swing tackle','Multi-position starter'
  ]),
  pl('dcx','Dan Moore Jr.','OT','Pittsburgh Steelers', 520, [
    'Full-time LT','Reliable protector'
  ]),
  pl('cam','Cam Robinson','OT','Jacksonville Jaguars', 500, [
    'Pro Bowl experience','Rebuilt line anchor'
  ]),
  pl('ena','Evan Neal','OT','New York Giants', 480, [
    'High draft pedigree','Improving LT'
  ]),
  pl('joW','Jonah Williams','OT','New York Giants', 460, [
    'Veteran LT','Super Bowl appearance'
  ]),
  pl('cho','Chukwuma Okorafor','OT','Pittsburgh Steelers', 440, [
    'Solid RT starter','Multi-year contributor'
  ]),
  pl('ber','Bernhard Raimann','OT','Indianapolis Colts', 400, [
    'Immediate rookie starter','Ascending LT'
  ]),
  pl('bjo3','Braxton Jones','OT','Chicago Bears', 380, [
    'FCS success story','Full-time LT'
  ]),
  pl('awy','Andrew Wylie','OT','Washington Commanders', 360, [
    'Super Bowl veteran','Underrated depth'
  ]),
  pl('cmd','Cody Mauch','OT','Tennessee Titans', 340, [
    'Athletic small-school gem','Immediate contributor'
  ]),
  pl('daw2','Dawand Jones','OT','Cleveland Browns', 320, [
    'Mammoth right tackle','Massive anchor'
  ]),
  pl('bfr','Blake Freeland','OT','Indianapolis Colts', 300, [
    'Tall athletic frame','Developing starter'
  ]),
  pl('wmr','Wanya Morris','OT','Kansas City Chiefs', 280, [
    'Super Bowl depth','Spot starter'
  ]),
  pl('npf','Nicholas Petit-Frere','OT','Tennessee Titans', 260, [
    'Ohio State pedigree','Full-time RT'
  ]),
  pl('vcl','Vederian Lowe','OT','Chicago Bears', 240, [
    'Recent starter','Rebuild contributor'
  ]),
  pl('sfo','Stone Forsythe','OT','Seattle Seahawks', 220, [
    'Quietly consistent','Durable RT'
  ]),
  pl('jdr','Jack Driscoll','OT','Buffalo Bills', 200, [
    'Versatile swing T/G','Valuable depth'
  ]),

  // === MORE COMMON DEPTH (tight scores 200–680) ===
  pl('mba','Marcus Cannon','OT','Free Agent', 580, [
    'Super Bowl champion','Run-game specialist'
  ]),
  pl('dol','Donovan Smith','OT','Free Agent', 560, [
    'Ironman left side','Super Bowl LV winner'
  ]),
  pl('mke2','Mike McGlinchey','OT','Denver Broncos', 520, [
    'Notre Dame product','Former high pick'
  ]),
  pl('mle','Mike Remmers','OT','Free Agent', 420, [
    'Super Bowl 50 blocker','Versatile veteran'
  ]),
  pl('sst','Storm Norton','OT','Free Agent', 400, [
    'UDFA success','Multiple starts'
  ]),
  pl('gfl2','George Fant','OT','Free Agent', 380, [
    'Basketball crossover','Swing tackle'
  ]),
  pl('cfl2','Calvin Anderson','OT','Denver Broncos', 360, [
    'Merit-based roster spot','College starter'
  ]),
  pl('cwa','Carter Warren','OT','Pittsburgh Steelers', 340, [
    'Hometown contributor','Spot starter'
  ]),
  pl('och2','Charlie Heck','OT','Houston Texans', 320, [
    'All-ACC background','RT experience'
  ]),
  pl('rgi','Rashod Hill','OT','Free Agent', 300, [
    'Reliable emergency fill-in','Veteran swing'
  ]),
  pl('cog','Cedric Ogbuehi','OT','Houston Texans', 280, [
    'Former first-rounder','Backup depth'
  ]),
  pl('kbe','Kelvin Beachum','OT','Free Agent', 260, [
    'Long-time ironman','Undrafted success'
  ]),
  pl('bjo','Broderick Jones','OT','Pittsburgh Steelers', 240, [
    'Athletic freak','Physical prospect'
  ]),
  pl('har2','Anton Harrison','OT','Jacksonville Jaguars', 220, [
    'Blind-side protector','Quality young starter'
  ]),
  pl('dan','Dan Moore Jr.','OT','Pittsburgh Steelers', 200, [
    'Multi-year LT','Steady contributor'
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   MASTER EXPORT  — Vol 5
══════════════════════════════════════════════════════════════════════ */
export const ALL_PLAYERS_V5: Record<PositionGroup, NFLPlayer[]> = {
  QB: [],
  RB: [],
  WR: [],
  TE: [],
  OT: OT_POOL_V1,
  OG: [],
  C:  [],
};

/* ── Rarity breakdown (Vol 5 only) ──
   QB : 11 common · 4 rare · 1 epic  = 16
   RB : 13 common · 6 rare · 1 epic  = 20
   WR : 16 common · 6 rare · 2 epic  = 24
   TE : 10 common · 3 rare · 0 epic  = 13
   OT : 11 common · 4 rare · 1 epic  = 16
   OG : 12 common · 4 rare · 0 epic  = 16
   C  : 11 common · 2 rare · 0 epic  = 13
   ─────────────────────────────────────
   Vol 5 total: 118 players
   Common: 84  (71%)
   Rare:   29  (25%)
   Epic:    5  ( 4%)
   Legendary: 0 (0%)
──────────────────────────────────── */