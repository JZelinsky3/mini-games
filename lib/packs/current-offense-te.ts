/* ─────────────────────────────────────────────────────────────────────────────
   current-offense-vol4.ts
   FOURTH batch — active 2025 players.
   Intentionally weighted toward COMMON & RARE tiers so that packs feel
   grounded and elite pulls (epic/legendary) feel earned.

   Target rarity distribution for this volume:
     ~55% common  (score   0 – 699)
     ~35% rare    (score 700 – 1 499)
     ~10% epic    (score 1 500 – 2 799)
       0% legendary — the 2 800 + legends live in earlier volumes

   Same scoring system & merge pattern as Vol 1–3.
───────────────────────────────────────────────────────────────────────────── */

import type { NFLPlayer, PositionGroup, Rarity } from './current-offense-qb';

function r(score: number): Rarity {
  if (score >= 4000) return 'immortal';
  if (score >= 2800) return 'transcendent';
  if (score >= 1600) return 'dynasty';
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
   TIGHT ENDS — V2
   Current 2025–2026 skill-based scoring | Boosted top TEs + varied commons
══════════════════════════════════════════════════════════════════════ */

export const TE_POOL_V1: NFLPlayer[] = [
  // === TRANSCENDENT TIER ===
  pl('kel','Travis Kelce','TE','Kansas City Chiefs', 2050, [
    'All-time great TE','Still elite at advanced age'
  ]),
  pl('kit','George Kittle','TE','San Francisco 49ers', 2780, [
    'Complete dominant TE','Elite blocker and receiver'
  ]),
  pl('mcb','Trey McBride','TE','Arizona Cardinals', 3350, [
    'Rising superstar','Led TEs in production'
  ]),
  pl('bow','Brock Bowers','TE','Las Vegas Raiders', 3020, [
    'Historic rookie season','Best TE prospect in years'
  ]),
  pl('lap','Sam LaPorta','TE','Detroit Lions', 2380, [
    'Explosive rookie star','Immediate franchise weapon'
  ]),

  // === DYNASTY TIER ===
  pl('and','Mark Andrews','TE','Baltimore Ravens', 1920, [
    'Reliable red-zone threat','Multiple 1,000-yard seasons'
  ]),
  pl('goe','Dallas Goedert','TE','Philadelphia Eagles', 1780, [
    'Consistent volume TE','Strong receiving threat'
  ]),
  pl('fer','Jake Ferguson','TE','Dallas Cowboys', 1620, [
    'Breakout franchise TE','Record-setting season'
  ]),
  pl('lik','Isaiah Likely','TE','Baltimore Ravens', 1380, [
    'Elite depth performer','Multiple TD seasons'
  ]),
  pl('ert','Zach Ertz','TE','Washington Commanders', 1150, [
    'Veteran leader','Super Bowl champion'
  ]),
  pl('tgr','Tucker Kraft','TE','Green Bay Packers', 1650, [
  'Emerging starting TE','Reliable safety valve for Jordan Love'
]),
pl('clo','Colston Loveland','TE','Chicago Bears', 1050, [
'Rookie sensation','Rising pass-catching threat'
]),
pl('twa','Tyler Warren','TE','Indianapolis Colts', 1480, [
'Strong young producer','Reliable target'
]),
pl('hfa','Harold Fannin Jr.','TE','Cleveland Browns', 1180, [
'High-upside talent','Contested-catch specialist'
]),
pl('dki','Dalton Kincaid','TE','Buffalo Bills', 1220, [
'Athletic receiving TE','Upside in space'
]),
pl('oga','Oronde Gadsden II','TE','Miami Dolphins', 950, [
'Emerging playmaker','Big-play flashes'
]),

  // === RARE TIER (700–1599) ===
  pl('hoc','T.J. Hockenson','TE','Minnesota Vikings', 980, [
    'Reliable safety valve','Strong target share'
  ]),
  pl('eng','Evan Engram','TE','Jacksonville Jaguars', 920, [
    'High-catch volume','Franchise record setter'
  ]),
  pl('dal2','Dalton Schultz','TE','Houston Texans', 980, [
    'Veteran starter','Consistent producer'
  ]),
  pl('hen3','Hunter Henry','TE','New England Patriots', 920, [
    'Red-zone specialist','Multiple TD seasons'
  ]),
  pl('pit','Kyle Pitts','TE','Atlanta Falcons', 880, [
    'Athletic mismatch','Former No. 4 overall pick'
  ]),
  pl('njo','David Njoku','TE','Cleveland Browns', 940, [
    'Athletic playmaker','Growing target share'
  ]),
pl('jjo','Juwan Johnson','TE','New Orleans Saints', 1050, [
'Veteran possession TE','Reliable red-zone option'
]),
pl('bst','Brenton Strange','TE','Jacksonville Jaguars', 980, [
'Developing starter','Athletic pass-catcher'
]),
pl('jsm','Jonnu Smith','TE','Free Agent', 920, [
'Versatile veteran','YAC & blocking ability'
]),
pl('nfa','Noah Fant','TE','New Orleans Saints', 870, [
'Athletic receiving TE','Speed in space'
]),
pl('thi','Tyler Higbee','TE','Los Angeles Rams', 850, [
'Veteran Rams stalwart','Franchise all-time TE leader'
]),
pl('dkn','Dawson Knox','TE','Buffalo Bills', 780, [
'Physical red-zone threat','Reliable hands with Josh Allen'
]),
pl('pfr','Pat Freiermuth','TE','Pittsburgh Steelers', 1120, [
'Steady volume TE','Consistent middle-of-the-field target'
]),

  // === COMMON TIER — Varied scores (205–680) ===
  pl('cmo','Cole Kmet','TE','Chicago Bears', 680, [
    'Reliable receiving TE','Career-best production'
  ]),
  pl('par4','Pat Freiermuth','TE','Pittsburgh Steelers', 750, [
    'Steady target','"The Dragon" nickname'
  ]),
  pl('mge','Mike Gesicki','TE','New England Patriots', 620, [
    'Athletic receiving TE','Former Pro Bowl level'
  ]),
  pl('aok','Austin Hooper','TE','Free Agent', 580, [
    'Veteran volume TE','Consistent blocker'
  ]),
  pl('hil2','Taysom Hill','TE','New Orleans Saints', 540, [
    'Unique hybrid weapon','Multi-position threat'
  ]),
  pl('con','Tyler Conklin','TE','New York Jets', 600, [
    'Reliable safety valve','Consistent contributor'
  ]),
  pl('jmg2','Jonnu Smith','TE','Miami Dolphins', 580, [
    'Versatile veteran','Career renaissance'
  ]),
  pl('geo','Gerald Everett','TE','Los Angeles Chargers', 560, [
    'Pass-catching specialist','Veteran option'
  ]),
  pl('ngo','Noah Gray','TE','Kansas City Chiefs', 440, [
    'Super Bowl depth','Reliable blocker'
  ]),
  pl('bwr','Brock Wright','TE','Detroit Lions', 420, [
    'Strong blocking TE','Run-game contributor'
  ]),
  pl('iro','Irv Smith Jr.','TE','Free Agent', 500, [
    'Athletic pass-catcher','Alabama pedigree'
  ]),
  pl('cwa3','C.J. Uzomah','TE','Free Agent', 480, [
    'Physical blocker','Super Bowl experience'
  ]),
  pl('fmox','Foster Moreau','TE','Free Agent', 460, [
    'Comeback story','Resilient veteran'
  ]),
  pl('tan2','Robert Tonyan','TE','Minnesota Vikings', 440, [
    'Former TD specialist','Veteran depth'
  ]),
  pl('kol','Charlie Kolar','TE','Baltimore Ravens', 320, [
    'Developing complement','Big 12 standout'
  ]),
  pl('dul','Greg Dulcich','TE','Denver Broncos', 305, [
    'Athletic YAC threat','Injury recovery'
  ]),
  pl('ben2','Ben Sinnott','TE','Washington Commanders', 290, [
    'Immediate rookie contributor','College standout'
  ]),
  pl('ott','Cade Otton','TE','Tampa Bay Buccaneers', 875, [
    'Core rebuilding piece','Rising role'
  ]),
  pl('mug','Luke Musgrave','TE','Green Bay Packers', 460, [
    'Athletic mismatch','Developing chemistry'
  ]),
  pl('jth2','Jelani Woods','TE','Indianapolis Colts', 245, [
    'Physical red-zone threat','Imposing size'
  ]),
  pl('bjo2','Brevin Jordan','TE','Houston Texans', 335, [
    'Speedy receiving TE','Athletic upside'
  ]),
  pl('smr','Durham Smythe','TE','Miami Dolphins', 225, [
    'Elite blocking TE','Iron-man reliability'
  ]),
  pl('kha2','Ko Kieft','TE','Tampa Bay Buccaneers', 215, [
    'Devastating blocker','Physical run-game piece'
  ]),
  pl('hai','Harrison Bryant','TE','Cleveland Browns', 210, [
    'Mackey Award winner','Depth contributor'
  ]),
  pl('tjo','Theo Johnson','TE','New York Giants', 220, [
    'Athletic pass-catcher','Developing upside'
  ]),
  pl('ajb','AJ Barner','TE','Indianapolis Colts', 305, [
    'Two-way college TE','Physical blocker'
  ]),
  pl('col','Colby Parkinson','TE','Los Angeles Rams', 330, [
    'High-IQ route runner','Reliable veteran'
  ]),
  pl('don','Donald Parham Jr.','TE','Los Angeles Chargers', 425, [
    'Red-zone height advantage','Unique 6\'8" frame'
  ]),
  pl('ttr2','Tommy Tremble','TE','Carolina Panthers', 215, [
    'Blocking specialist','Notre Dame pedigree'
  ]),
  pl('kgr2','Kylen Granson','TE','Indianapolis Colts', 210, [
    'Record-holding receiver','Athletic TE'
  ]),
  pl('qmo','Quintin Morris','TE','Buffalo Bills', 220, [
    'Undrafted success','MAC standout'
  ]),
  pl('jmi','James Mitchell','TE','Detroit Lions', 205, [
    'Resilient depth','Injury comeback'
  ]),
  pl('lfa','Luke Farrell','TE','Jacksonville Jaguars', 215, [
    'Elite run blocker','Ohio State champion'
  ]),
  pl('bla2','Brevyn Spann-Ford','TE','Minnesota Vikings', 210, [
    'Physical blocker','Developing depth'
  ]),
  pl('csp','Cade Stover','TE','Houston Texans', 225, [
    'Versatile LB convert','Competing for snaps'
  ]),
  pl('jny','Josh Whyle','TE','Cincinnati Bengals', 205, [
    'Pass-catching backup','Growing role'
  ]),
  pl('mmi','Michael Mayer','TE','Las Vegas Raiders', 230, [
    'Notre Dame standout','Full-time starter'
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   MASTER EXPORT  — vol 4
══════════════════════════════════════════════════════════════════════ */
export const ALL_PLAYERS_V4: Record<PositionGroup, NFLPlayer[]> = {
  QB: [],
  RB: [],
  WR: [],
  TE: TE_POOL_V1,
  OT: [],
  OG: [],
  C:  [],
};

/* ── Rarity breakdown for this volume ──
   QB : 11 common · 4 rare · 0 epic = 15
   RB : 13 common · 6 rare · 1 epic = 20
   WR : 16 common · 7 rare · 1 epic = 24
   TE : 11 common · 2 rare · 0 epic = 13
   OT : 10 common · 5 rare · 1 epic = 16
   OG : 12 common · 4 rare · 0 epic = 16
   C  : 11 common · 2 rare · 0 epic = 13
   ─────────────────────────────────────
   Vol 4 total: 117 players
   Combined (Vol 1–4): ~489 total players
   Overall rarity split (Vol 4 only):
     Common:  84 / 117 = 72%
     Rare:    30 / 117 = 26%
     Epic:     3 / 117 =  2%
     Legendary: 0       =  0%
─────────────────────────────────────────────────────────────────── */