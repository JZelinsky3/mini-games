/* ─────────────────────────────────────────────────────────────────────────────
   current-offense.ts
   Comprehensive NFL offensive player dataset for Offense Pack Empire.

   SCORING SYSTEM (used to derive `score` and `rarity`):
     Pro Bowl appearance    → +80  each
     AP 2nd-Team           → +100 each
     AP 1st-Team           → +220 each
     Super Bowl Ring       → +150 each
     Super Bowl MVP        → +300
     League MVP            → +420 each
     Offensive POY         → +260
     Offensive ROTY        → +120
     Rushing / Rec title   → +120 each
     Major record / mile.  → +80–180 (noted inline)

   RARITY TIERS:
     common    →    0 – 699
     rare      →  700 – 1 499
     dynasty      → 1 500 – 2 799
     transcendent → 2 800 - 3 999
     immortal  → 4 000 +
───────────────────────────────────────────────────────────────────────────── */

export type Rarity = 'common' | 'rare' | 'dynasty' | 'transcendent' | 'immortal';
export type PositionGroup = 'QB' | 'RB' | 'WR' | 'TE' | 'OT' | 'OG' | 'C';

export interface NFLPlayer {
  id:        string;
  name:      string;
  pos:       PositionGroup;   // pool position (OT covers LT & RT; OG covers LG & RG)
  team:      string;
  score:     number;
  rarity:    Rarity;
  accolades: string[];        // human-readable bullets shown on card
  weight?:    number;
}

/* ─── helper so we don't repeat the rarity calc ─────────────────────── */
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
   QUARTERBACKS — V2
   Current 2025–2026 skill-based scoring | Expanded depth
══════════════════════════════════════════════════════════════════════ */

export const QB_POOL_V1: NFLPlayer[] = [
  // === IMMORTAL / TRANSCENDENT TIER ===
  pl('mah','Patrick Mahomes','QB','Kansas City Chiefs', 3980, [
    'Generational talent','Still the clear best QB in football'
  ]),
  pl('all','Josh Allen','QB','Buffalo Bills', 3350, [
    'Elite dual-threat superstar','Consistent MVP candidate'
  ]),
  pl('laj','Lamar Jackson','QB','Baltimore Ravens', 3180, [
    '2× League MVP','Most dangerous dual-threat QB'
  ]),
  pl('sta','Matthew Stafford','QB','Los Angeles Rams', 2980, [
    'Super Bowl MVP','Still elite in his late 30s'
  ]),
  pl('rod','Aaron Rodgers','QB','Pittsburgh Steelers', 2820, [
    '4× League MVP','Elite accuracy and football IQ'
  ]),

  // === DYNASTY TIER ===
  pl('bur','Joe Burrow','QB','Cincinnati Bengals', 2620, [
    'Precision passer','Franchise cornerstone'
  ]),
  pl('hur','Jalen Hurts','QB','Philadelphia Eagles', 2480, [
    'Dual-threat leader','Super Bowl contender anchor'
  ]),
  pl('her','Justin Herbert','QB','Los Angeles Chargers', 2450, [
    'Cannon arm','Consistent top-tier producer'
  ]),
  pl('dma','Drake Maye','QB','New England Patriots', 2380, [
    'Rising superstar','MVP runner-up in Year 2'
  ]),
  pl('kca','Caleb Williams','QB','Chicago Bears', 1920, [
    'Elite arm talent','Franchise QB with big upside'
  ]),
  pl('dak','Dak Prescott','QB','Dallas Cowboys', 1950, [
    'Pro Bowl veteran','High-volume efficient passer'
  ]),
  pl('sab','Sam Darnold','QB','Seattle Seahawks', 1580, [
    'Career revival','Super Bowl champion QB'
  ]),


  // === RARE TIER (700–1499) ===
  pl('tua','Tua Tagovailoa','QB','Miami Dolphins', 980, [
    'High completion percentage','Accurate rhythm passer'
  ]),
  pl('gof','Jared Goff','QB','Detroit Lions', 1250, [
    'Strong Lions resurgence','Reliable game manager'
  ]),
  pl('mai','Daniel Jones','QB','Indianapolis Colts', 1180, [
    'Recent career resurgence','Efficient dual-threat'
  ]),
  pl('bab','Baker Mayfield','QB','Tampa Bay Buccaneers', 1480, [
    'Comeback success story','Tough competitive leader'
  ]),
  pl('kco2x','Kirk Cousins','QB','Atlanta Falcons', 1020, [
    'Veteran volume passer','Consistent high-yardage seasons'
  ]),
  pl('wat','Deshaun Watson','QB','Cleveland Browns', 920, [
    'Former elite talent','Athletic playmaker'
  ]),
  pl('gen','Geno Smith','QB','Seattle Seahawks', 880, [
    'Comeback Player winner','Efficient veteran'
  ]),
  pl('fla','Joe Flacco','QB','Indianapolis Colts', 820, [
    'Veteran playoff performer','Super Bowl MVP pedigree'
  ]),
  pl('bro','Brock Purdy','QB','San Francisco 49ers', 1080, [
    'Mr. Irrelevant success','High win percentage'
  ]),

  // === COMMON TIER (200–680) — Tight clustering for depth ===
  pl('jda','Jayden Daniels','QB','Washington Commanders', 1480, [
    'Explosive dual-threat','Immediate impact rookie'
  ]),
  pl('byo','Bo Nix','QB','Denver Broncos', 1050, [
    'Experienced college producer','Competent young starter'
  ]),
  pl('afe','Anthony Richardson','QB','Indianapolis Colts', 620, [
    'Highest athleticism','Big upside dual-threat'
  ]),
  pl('mwi','Malik Willis','QB','Miami Dolphins', 580, [
    'Electric athleticism','High-upside backup turned starter'
  ]),
  pl('jga','Jimmy Garoppolo','QB','Los Angeles Rams', 560, [
    'Veteran game manager','Super Bowl experience'
  ]),
  pl('cas','Carson Wentz','QB','Los Angeles Rams', 540, [
    'Former high-upside QB','Super Bowl champion backup'
  ]),
  pl('wil','Kyler Murray','QB','Minnesota Vikings', 480, [
    'Mobile dual-threat','Former Offensive Rookie of the Year'
  ]),
  pl('mma','Marcus Mariota','QB','Washington Commanders', 440, [
    'Athletic veteran','Former high draft pick'
  ]),
  pl('jwo2','Jameis Winston','QB','Cleveland Browns', 420, [
    'Cannon arm','High-volume passer'
  ]),
  pl('how','Sam Howell','QB','Seattle Seahawks', 400, [
    'Tough pocket presence','High attempt volume'
  ]),
  pl('law','Trevor Lawrence','QB','Jacksonville Jaguars', 880, [
    'High pedigree','Developing franchise QB'
  ]),
  pl('str','C.J. Stroud','QB','Houston Texans', 760, [
    'Rookie of the Year winner','Promising young passer'
  ]),
  pl('lov','Jordan Love','QB','Green Bay Packers', 940, [
    'Emerging starter','Strong arm talent'
  ]),
  pl('jco','Jacoby Brissett','QB','Arizona Cardinals', 520, [
    'Steady veteran backup','Reliable locker-room presence'
  ]),
  pl('mpe','Michael Penix Jr.','QB','Atlanta Falcons', 300, [
    'Strong arm prospect','Developing backup'
  ]),
  pl('wle','Will Levis','QB','Tennessee Titans', 280, [
    'Elite arm strength','Deep ball specialist'
  ]),
  pl('gbr','Gardner Minshew','QB','Las Vegas Raiders', 260, [
    ' scrappy competitor','Underdog success story'
  ]),
  pl('och','Aidan O\'Connell','QB','Las Vegas Raiders', 240, [
    'Pocket composure','Late-round development'
  ]),
  pl('jjm','J.J. McCarthy','QB','Minnesota Vikings', 420, [
    'National champion pedigree','High floor prospect'
  ]),

  // === Additional Common Depth ===
  pl('tbr','Tanner McKee','QB','Philadelphia Eagles', 210, [
    'Cerebral backup','Stanford pedigree'
  ]),
  pl('sra','Spencer Rattler','QB','New Orleans Saints', 220, [
    'Former top recruit','Developing backup'
  ]),
  pl('thl','Tyler Huntley','QB','Baltimore Ravens', 215, [
    'Dual-threat backup','Team-first leader'
  ]),
  pl('hoo','Hendon Hooker','QB','Detroit Lions', 200, [
    'Strong college producer','Injury recovery'
  ]),
  pl('wal2','Tommy DeVito','QB','New York Giants', 200, [
    'Fan favorite','Underdog story'
  ]),
  pl('zco','Zach Wilson','QB','Denver Broncos', 205, [
    'Athletic scrambler','Seeking reset'
  ]),
  pl('bza','Bailey Zappe','QB','New England Patriots', 200, [
    'Record-setting college passer','Emergency starter'
  ]),
  pl('jdo2','Joshua Dobbs','QB','San Francisco 49ers', 205, [
    'Smart dual-threat','Aerospace engineer'
  ]),
  pl('tpe','Tyson Bagent','QB','Chicago Bears', 200, [
    'D-II success story','Surprise winner'
  ]),
  pl('dtr','Dorian Thompson-Robinson','QB','Cleveland Browns', 200, [
    'Off-platform passer','Spot starter'
  ]),
  pl('dmi','Davis Mills','QB','Houston Texans', 200, [
    'Patient pocket passer','Stanford product'
  ]),
  pl('des','Desmond Ridder','QB','Arizona Cardinals', 200, [
    'Developing young QB','Former college leader'
  ]),
  pl('jha','Jake Haener','QB','New Orleans Saints', 200, [
    'Emergency experience','Mountain West standout'
  ]),
  pl('nro','Nathan Rourke','QB','Jacksonville Jaguars', 200, [
    'CFL success','International prospect'
  ]),
  pl('tre2','Trevor Siemian','QB','Free Agent', 200, [
    'Veteran backup','Steady journeyman'
  ]),
  pl('jfl','Jeff Driskel','QB','Free Agent', 200, [
    'Multi-team veteran','Journeyman depth'
  ]),
  pl('pic','Kenny Pickett','QB','Carolina Panthers', 200, [
    'Former rookie starter','Developing backup'
  ]),
  pl('joh2','Bryce Young','QB','Carolina Panthers', 630, [
    'High draft pedigree','Former No. 1 pick'
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   MASTER EXPORT  —  all pools in one object for easy lookup
══════════════════════════════════════════════════════════════════════ */
export const ALL_PLAYERS: Record<PositionGroup, NFLPlayer[]> = {
  QB: QB_POOL_V1,
  RB: [],
  WR: [],
  TE: [],
  OT: [],
  OG: [],
  C:  [],
};

/* Quick stats */
export const POOL_SIZES: Record<PositionGroup, number> = Object.fromEntries(
  Object.entries(ALL_PLAYERS).map(([k, v]) => [k, v.length]),
) as Record<PositionGroup, number>;

/* Total players: */
// QB: 18 · RB: 19 · WR: 27 · TE: 15 · OT: 18 · OG: 15 · C: 11  →  123 total