/* ─────────────────────────────────────────────────────────────────────────────
   current-offense-vol2.ts
   SECOND batch — all players are NEW (not in vol 1).
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
   RUNNING BACKS — V2
   Current 2025–2026 skill-based scoring | Varied common scores
══════════════════════════════════════════════════════════════════════ */

export const RB_POOL_V1: NFLPlayer[] = [
  // === TRANSCENDENT TIER ===
  pl('bij','Bijan Robinson','RB','Atlanta Falcons', 3420, [
    'Elite dual-threat back','NFL-leading scrimmage yards'
  ]),
  pl('cmc','Christian McCaffrey','RB','San Francisco 49ers', 3250, [
    'Generational receiving RB','Consistent All-Pro producer'
  ]),
  pl('gib','Jahmyr Gibbs','RB','Detroit Lions', 3180, [
    'Explosive dual-threat','High touchdown scorer'
  ]),
  pl('bar','Saquon Barkley','RB','Philadelphia Eagles', 3050, [
    'Big-play superstar','Multiple 2,000+ scrimmage seasons'
  ]),
  pl('hen','Derrick Henry','RB','Baltimore Ravens', 2820, [
    'Power running legend','Multiple 1,500+ yard seasons'
  ]),

  // === DYNASTY TIER ===
  pl('tay','Jonathan Taylor','RB','Indianapolis Colts', 2720, [
    'Efficient volume leader','Rushing title contender'
  ]),
  pl('coo2','James Cook','RB','Buffalo Bills', 2580, [
    '2025 rushing champion','Elite efficiency'
  ]),
  pl('ach','De\'Von Achane','RB','Miami Dolphins', 2350, [
    'Big-play speed threat','Explosive home-run ability'
  ]),
  pl('hal','Breece Hall','RB','New York Jets', 1980, [
    'Strong vision and YAC','Rising lead back'
  ]),
  pl('kam','Alvin Kamara','RB','New Orleans Saints', 1820, [
    'Versatile veteran','Consistent receiving threat'
  ]),

  // === RARE TIER (700–1499) ===
  pl('dha','D\'Andre Swift','RB','Chicago Bears', 1380, [
    'Explosive runner','Multiple 1,000-yard seasons'
  ]),
  pl('jac','Josh Jacobs','RB','Green Bay Packers', 1480, [
    'Workhorse back','Rushing title winner'
  ]),
  pl('mix','Joe Mixon','RB','Houston Texans', 1280, [
    'Consistent volume back','Goal-line specialist'
  ]),
  pl('pac','Isiah Pacheco','RB','Detroit Lions', 780, [
    'Physical champion RB','Multiple Super Bowl rings'
  ]),
  pl('mon','David Montgomery','RB','Houston Texans', 1020, [
    'Tough between-tackles runner','Reliable contributor'
  ]),
  pl('kyr','Kyren Williams','RB','Los Angeles Rams', 1180, [
    'High-volume efficient back','Super Bowl champion'
  ]),
  pl('ete','Travis Etienne Jr.','RB','Jacksonville Jaguars', 1020, [
    'Versatile playmaker','Strong scrimmage yards'
  ]),
  pl('nak','Najee Harris','RB','Pittsburgh Steelers', 880, [
    'Durable lead back','Alabama pedigree'
  ]),
  pl('caf','Chuba Hubbard','RB','Carolina Panthers', 840, [
    'Consistent starter','1,000-yard seasons'
  ]),
  pl('cla2','Chase Brown','RB','Cincinnati Bengals', 820, [
    'Rising lead back','Strong vision and burst'
  ]),
  pl('kwa','Kenneth Walker III','RB','Seattle Seahawks', 1650, [
'Explosive lead back','Big-play home-run threat'
]),
pl('oha','Omarion Hampton','RB','Los Angeles Chargers', 1120, [
'Rising young star','High-upside volume back'
]),
pl('aje','Ashton Jeanty','RB','Las Vegas Raiders', 1480, [
'Elite rookie production','Workhorse potential'
]),
pl('jco','James Conner','RB','Arizona Cardinals', 1250, [
'Durable veteran','Consistent 1,000-yard producer'
]),
pl('rhe','Rhamondre Stevenson','RB','New England Patriots', 880, [
'Power between-the-tackles runner','Reliable starter'
]),
pl('jbr','Jonathon Brooks','RB','Carolina Panthers', 650, [
'Developing lead back','Post-injury upside'
]),
pl('jhi','Justice Hill','RB','Baltimore Ravens', 520, [
'Speedy change-of-pace back','Explosive in space'
]),
pl('sper','Samaje Perine','RB','[Team]', 480, [
'Veteran pass-catcher','Reliable third-down option'
]),
pl('tyjo','Ty Johnson','RB','Buffalo Bills', 450, [
'Versatile depth piece','Quick open-field runner'
]),

  // === COMMON TIER — Varied scores (205–680) for depth ===
  pl('jkd','J.K. Dobbins','RB','Los Angeles Chargers', 780, [
    'Comeback story','Efficient when healthy'
  ]),
  pl('bro4','Brian Robinson Jr.','RB','Washington Commanders', 650, [
    'Tough reliable back','Playoff contributor'
  ]),
  pl('irv','Bucky Irving','RB','Tampa Bay Buccaneers', 830, [
    'Efficient power runner','Strong rookie impact'
  ]),
  pl('ty2','Tyjae Spears','RB','Tennessee Titans', 610, [
    'Speedy successor','High YPC threat'
  ]),
  pl('eke','Austin Ekeler','RB','Washington Commanders', 580, [
    'Receiving specialist','Former Pro Bowl back'
  ]),
  pl('rwa2','Raheem Mostert','RB','Free Agent', 560, [
    'Veteran big-play threat','Super Bowl champion'
  ]),
  pl('jwi','Jamaal Williams','RB','New Orleans Saints', 640, [
    'Goal-line hammer','Fan favorite personality'
  ]),
  pl('rmo','Rachaad White','RB','Tampa Bay Buccaneers', 620, [
    'Pass-catching back','Versatile contributor'
  ]),
  pl('gbe','Gus Edwards','RB','Los Angeles Chargers', 600, [
    'Power runner','High yards-per-attempt'
  ]),
  pl('ttu','Tyrone Tracy Jr.','RB','New York Giants', 480, [
    'UDFA success','Surprise starter production'
  ]),
  pl('jma','Jordan Mason','RB','San Francisco 49ers', 560, [
    'Late-round gem','1,000-yard fill-in'
  ]),
  pl('jav','Javonte Williams','RB','Denver Broncos', 1040, [
    'Post-injury rebound','Workhorse potential'
  ]),
  pl('san','Miles Sanders','RB','Carolina Panthers', 520, [
    'Zone runner','Former Pro Bowl season'
  ]),
  pl('kah','Kareem Hunt','RB','Cleveland Browns', 500, [
    'Versatile veteran','Rushing title as rookie'
  ]),
  pl('sin','Devin Singletary','RB','New York Giants', 480, [
    'Consistent 1,000-yard back','Model of reliability'
  ]),
  pl('jer','Jerome Ford','RB','Cleveland Browns', 360, [
    'Fill-in starter','Quietly productive'
  ]),
  pl('ali','Alexander Mattison','RB','Las Vegas Raiders', 440, [
    'Dependable backup','Workhorse when needed'
  ]),
  pl('ste','Rhamondre Stevenson','RB','New England Patriots', 420, [
    'Power back','Post-Brady contributor'
  ]),
  pl('bib','Blake Corum','RB','Los Angeles Rams', 305, [
    'College champion','Developing depth piece'
  ]),
  pl('mar2x','MarShawn Lloyd','RB','Green Bay Packers', 290, [
    'Explosive prospect','Competing for carries'
  ]),
  pl('dfr','Dameon Pierce','RB','Houston Texans', 475, [
    'Physical debut season','Between-tackles runner'
  ]),
  pl('ahe','Antonio Gibson','RB','New England Patriots', 360, [
    'Versatile third-down back','Former 1,000-yard rusher'
  ]),
  pl('tan3','Tank Bigsby','RB','Jacksonville Jaguars', 345, [
    'Power runner','Developing starter'
  ]),
  pl('ray','Ray Davis','RB','Buffalo Bills', 235, [
    'Utility college standout','Immediate depth role'
  ]),
  pl('zmo','Zack Moss','RB','Cincinnati Bengals', 325, [
    'Efficient backup','1,000-yard potential'
  ]),
  pl('cha2','Zach Charbonnet','RB','Seattle Seahawks', 615, [
    'Strong rookie production','Future workhorse'
  ]),
  pl('khe','Khalil Herbert','RB','Chicago Bears', 210, [
    'Efficient burst','High YPC rookie'
  ]),
  pl('kmi','Keaton Mitchell','RB','Baltimore Ravens', 405, [
    'Speed threat','Injury recovery'
  ]),
  pl('wsh','Will Shipley','RB','Philadelphia Eagles', 220, [
    'Versatile pass-catcher','Scheme fit'
  ]),
  pl('dys','Dylan Sampson','RB','Tennessee Titans', 330, [
    'SEC standout','Rookie opportunity'
  ]),
  pl('aes','Audric Estimé','RB','Denver Broncos', 240, [
    'Power prospect','Immediate backup'
  ]),
  pl('hha','Hassan Haskins','RB','Tennessee Titans', 225, [
    'Committed runner','Depth contributor'
  ]),
  pl('pat2','Patrick Taylor Jr.','RB','Miami Dolphins', 210, [
    'Short-yardage specialist','Reliable depth'
  ]),
  pl('deo','Deon Jackson','RB','Indianapolis Colts', 215, [
    'Pass-catching flex','Undrafted success'
  ]),
  pl('mca','Michael Carter','RB','New York Jets', 205, [
    'Burst in space','Rookie contributor'
  ]),
  pl('zev','Zach Evans','RB','Los Angeles Rams', 220, [
    'Developing depth','Ole Miss pedigree'
  ]),
  pl('jml2','Jaleel McLaughlin','RB','Denver Broncos', 230, [
    'Quick open-field runner','UDFA surprise'
  ]),
  pl('cre','Craig Reynolds','RB','Detroit Lions', 210, [
    'Spot starter','Undrafted contributor'
  ]),
  pl('elo','Elijah Mitchell','RB','Jacksonville Jaguars', 340, [
    'Efficient when healthy','High per-carry rate'
  ]),
  pl('war','Jaylen Warren','RB','Pittsburgh Steelers', 735, [
    'Pass-protecting back','Undrafted gem'
  ]),
  pl('pem','Clyde Edwards-Helaire','RB','Kansas City Chiefs', 425, [
    'Super Bowl depth','Rookie impact'
  ]),
  pl('all3','Tyler Allgeier','RB','Atlanta Falcons', 615, [
    'Rookie 1,000-yard surprise','Fifth-round steal'
  ]),
  pl('mos','Raheem Mostert','RB','Miami Dolphins', 605, [
    'Veteran resurgence','Big-play veteran'
  ]),
  pl('jfo','Jerome Ford','RB','Cleveland Browns', 220, [
    'Fill-in performer','Quietly effective'
  ]),
  pl('qju','Quinshon Judkins','RB','Detroit Lions', 830, [
    'College standout','Immediate contributor'
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   MASTER EXPORT  — vol 2
══════════════════════════════════════════════════════════════════════ */
export const ALL_PLAYERS_V2: Record<PositionGroup, NFLPlayer[]> = {
  QB: [],
  RB: RB_POOL_V1,
  WR: [],
  TE: [],
  OT: [],
  OG: [],
  C:  [],
};

/* ── Quick stats ──
   QB: 20 · RB: 20 · WR: 26 · TE: 14 · OT: 18 · OG: 16 · C: 12
   Vol 2 total: 126 new players
   Combined with Vol 1 (123): 249 total players
─────────────────────────────────────────────────────────────────── */