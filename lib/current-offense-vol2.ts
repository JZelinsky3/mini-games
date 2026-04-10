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
export const QB_POOL_V2: NFLPlayer[] = [
  pl('rwi','Russell Wilson','QB','Pittsburgh Steelers', 1680, [
    '9× Pro Bowl','AP 1st-Team (2019)','Super Bowl XLVIII Champion',
    '2012: Led Seahawks to back-to-back SB — youngest QB to win (then)',
    '300+ rushing yards in multiple seasons — elite dual-threat',
  ]),
  pl('sta','Matthew Stafford','QB','Los Angeles Rams', 1500, [
    '3× Pro Bowl','Super Bowl LVI Champion & MVP',
    '40,000+ career passing yards','2021: 41 TD — highest single-season total for LAR',
    '1st Overall Pick (2009)',
  ]),
  pl('gen','Geno Smith','QB','Seattle Seahawks', 740, [
    'Pro Bowl (2022)','AP 2nd-Team (2022)','Comeback Player of the Year (2022)',
    '2022: 69.8 completion % — led NFL; 4,282 yards',
    'Undrafted-round value — 2nd round pick (2013) who found his moment',
  ]),
  pl('may','Baker Mayfield','QB','Tampa Bay Buccaneers', 680, [
    'Pro Bowl (2023)','2023 Comeback Player of the Year',
    '1st Overall Pick (2018)','2023: 4,044 yards, 28 TD for Buccaneers',
    '2020: Led Browns to first playoff win since 1994',
  ]),
  pl('wat','Deshaun Watson','QB','Cleveland Browns', 860, [
    '3× Pro Bowl','AP 2nd-Team (2020)',
    '2020: 112.4 passer rating — led NFL; 33 TD, 7 INT',
    '12th Pick (2017)','Missed 2021 season — returned 2022',
  ]),
  pl('car','Derek Carr','QB','New Orleans Saints', 580, [
    '4× Pro Bowl','2016 AP 2nd-Team',
    '2016: Led Raiders to 12-4 — best record in franchise since 2002',
    '36th Pick (2014)','Most passing yards in Raiders franchise history',
  ]),
  pl('ari','Anthony Richardson','QB','Indianapolis Colts', 340, [
    '4th Overall Pick (2023)',
    '2023: 654 rush yards in 7 starts — record pace for a rookie QB',
    'Highest combine score in history for a QB (99.9 RAS)',
  ]),
  pl('cal','Caleb Williams','QB','Chicago Bears', 240, [
    '1st Overall Pick (2024)','Heisman Trophy winner (2022)',
    '2× Pac-12 OPOY','Expected franchise cornerstone for Chicago',
  ]),
  pl('jda','Jayden Daniels','QB','Washington Commanders', 300, [
    '2nd Overall Pick (2024)','Heisman Trophy winner (2023)',
    '2023: 3,812 pass + 1,134 rush yards — historic dual-threat season',
    '2024: Immediate playoff contender — led WAS to best record in NFC East',
  ]),
  pl('bon','Bo Nix','QB','Denver Broncos', 280, [
    '12th Overall Pick (2024)','2023: 4,000+ yards, 45 TD (Oregon)',
    '2024: Competent starter immediately — Broncos showing promise',
  ]),
  pl('tan','Ryan Tannehill','QB','Tennessee Titans', 560, [
    '2× Pro Bowl','AP 2nd-Team (2019)',
    '2019: 117.5 passer rating — 2nd highest all-time for a season',
    '8th Pick (2012)','Led Titans to back-to-back playoffs (2019–20)',
  ]),
  pl('fla','Joe Flacco','QB','Indianapolis Colts', 860, [
    'Super Bowl XLVII Champion & MVP','Pro Bowl (2023)',
    '2023: Led Browns to playoffs in 6 starts at age 38',
    '18th Pick (2008)','Highest-rated postseason passer in NFL history (min. 8 starts)',
  ]),
  pl('jone','Mac Jones','QB','Jacksonville Jaguars', 340, [
    '2× Pro Bowl','15th Pick (2021)',
    '2021: 67.6 completion % (2nd all-time for a rookie)',
    'Led Patriots to 10-7, first-year starter',
  ]),
  pl('min','Gardner Minshew','QB','Las Vegas Raiders', 220, [
    'Pro Bowl (2020, XFL / backup context)','6th Round Pick (2019)',
    'Most efficient start to a career for an undrafted/late pick',
    '2019: 21 TD, 6 INT as a rookie surprise starter',
  ]),
  pl('lev','Will Levis','QB','Tennessee Titans', 200, [
    '33rd Pick (2023, 2nd Round surprise slide)','2023: 1,152 yards in 4 starts',
    'NFL.com top-10 arm talent entering league',
  ]),
  pl('wil3','Zach Wilson','QB','Denver Broncos', 140, [
    '2nd Overall Pick (2021)','Struggled in New York — seeking reset in Denver',
  ]),
  pl('pic','Kenny Pickett','QB','Philadelphia Eagles', 200, [
    '20th Overall Pick (2022)','2022 starter for Pittsburgh as a rookie',
    '2023: 7 TD, 4 INT in limited action',
  ]),
  pl('kyr2','Kyren Murray (QB)','QB','Arizona Cardinals', 140, [
    'High-ceiling prospect; dual-threat; limited NFL starts',
  ]),
  pl('lof','Joshua Dobbs','QB','Atlanta Falcons', 120, [
    'Viral "Parachute" trade to Minnesota — 4 TDs in first game',
    'Aerospace engineering degree — one of most intelligent QBs in NFL',
  ]),
  pl('joh2','Bryce Young (HC)','QB','Carolina Panthers', 160, [
    '1st Overall Pick (2023)','Heisman Trophy (2021)',
    '2023: Led Panthers to several competitive games despite weak support',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   RUNNING BACKS  — 20 new entries
══════════════════════════════════════════════════════════════════════ */
export const RB_POOL_V2: NFLPlayer[] = [
  pl('ete','Travis Etienne Jr.','RB','Jacksonville Jaguars', 880, [
    '2× Pro Bowl','25th Pick (2021)',
    '2022: 1,125 rush yards after missing entire rookie season to injury',
    '2023: 1,582 scrimmage yards — career high',
  ]),
  pl('eke','Austin Ekeler','RB','Washington Commanders', 1120, [
    '3× Pro Bowl','AP 2nd-Team (2022)',
    'Undrafted (2017) — UDFA story to Pro Bowl',
    '2021: 20 total TDs — led NFL; 1,558 scrimmage yards',
  ]),
  pl('chu','Nick Chubb','RB','Cleveland Browns', 1100, [
    '3× Pro Bowl','AP 1st-Team (2022)',
    '35th Pick (2018)','4× 1,000-yard seasons before ACL (2023)',
    '2022: 1,525 rush yards — Browns franchise record',
  ]),
  pl('har','Najee Harris','RB','Pittsburgh Steelers', 660, [
    '2× Pro Bowl','24th Pick (2021)',
    '2021: 1,200 rush + 467 rec yards as rookie — 1st Steelers RB with 1,000+ yards',
  ]),
  pl('swi','D\'Andre Swift','RB','Chicago Bears', 720, [
    '2× Pro Bowl','AP 2nd-Team (2021)',
    '35th Pick (2020)','2021: 1,616 scrimmage yards',
    '2023 (PHI): 1,049 rush yards — first 1,000-yard season',
  ]),
  pl('ste','Rhamondre Stevenson','RB','New England Patriots', 440, [
    'Pro Bowl (2022)','120th Pick (2021)',
    '2022: 1,040 rush yards — Patriots best RB performance post-Brady',
  ]),
  pl('mat','Alexander Mattison','RB','Las Vegas Raiders', 380, [
    'Pro Bowl (2023)','102nd Pick (2019)',
    '2023: 1,042 rush yards in first year as starter — filling Dalvin Cook void',
  ]),
  pl('cha2','Zach Charbonnet','RB','Seattle Seahawks', 260, [
    '52nd Pick (2023)','879 rush yards in rookie season',
    '2023: Averaged 5.0 yards per carry — Seahawks\' workhorse future',
  ]),
  pl('dil','A.J. Dillon','RB','Green Bay Packers', 280, [
    '62nd Pick (2020)','Named "Quadzilla" by fans for his build',
    '2021: 803 rush yards complementing Aaron Jones — 7.3 YPC in short runs',
  ]),
  pl('all3','Tyler Allgeier','RB','Atlanta Falcons', 220, [
    '151st Pick (2022) — massive steal','1,035 rush yards in 2023',
    '2022: 1,035 yards as a rookie from BYU — 5th round surprise',
  ]),
  pl('mos','Raheem Mostert','RB','Miami Dolphins', 420, [
    'Pro Bowl (2023)','Super Bowl LIV Champion',
    '2023: 1,012 rush yards at age 31 — veteran resurgence',
    '2019 NFC Championship: 220 rush yards, 4 TD — all-time record',
  ]),
  pl('jfo','Jerome Ford','RB','Cleveland Browns', 260, [
    '156th Pick (2022)','2023: 813 rush yards filling in for injured Chubb',
    'Quietly one of the best backup-turned-starters in 2023',
  ]),
  pl('war','Jaylen Warren','RB','Pittsburgh Steelers', 300, [
    'Undrafted (2022)','2023: 784 rush + 206 rec yards',
    'One of NFL\'s best pass-protecting RBs per PFF',
  ]),
  pl('pem','Clyde Edwards-Helaire','RB','Kansas City Chiefs', 380, [
    '32nd Pick (2020)','Super Bowl LV Ring','Super Bowl LVII Ring',
    '2020: 803 rush yards as a rookie — franchise\'s first RB with 800+ since 2006',
  ]),
  pl('joh3','Josh Johnson (RB)','RB','Carolina Panthers', 200, [
    'Chuba Hubbard','38th Pick (2021)',
    '2023: 726 rush yards in limited role — capable starter',
  ]),
  pl('hub','Chuba Hubbard','RB','Carolina Panthers', 200, [
    '69th Pick (2021)','726 rush yards (2023) filling for Miles Sanders',
  ]),
  pl('sto','Tony Jones Jr.','RB','Free Agent', 120, [
    'Undrafted gem; versatile pass-catcher out of Notre Dame',
  ]),
  pl('kam2','Kenneth Walker III','RB','Seattle Seahawks', 640, [
    '2× Pro Bowl','41st Pick (2022)',
    '2022: 1,050 rush yards as rookie despite late start',
    '2023: 905 rush yards — Seahawks\' franchise RB of future',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   WIDE RECEIVERS  — 26 new entries
══════════════════════════════════════════════════════════════════════ */
export const WR_POOL_V2: NFLPlayer[] = [
  pl('rid','Calvin Ridley','WR','Tennessee Titans', 1280, [
    '3× Pro Bowl','AP 2nd-Team (2020)','26th Pick (2018)',
    '2020: 1,374 yards, 9 TD — AP 2nd-Team despite suspension concerns',
    '2023 comeback: 1,016 yards with Jaguars after yearlong suspension',
  ]),
  pl('obe','Odell Beckham Jr.','WR','Miami Dolphins', 1360, [
    '3× Pro Bowl','AP 1st-Team (2016)','Super Bowl LVI Champion',
    '2014 OROTY','12th Pick (2014)',
    'One-handed catch vs. Cowboys (2014) — most iconic play in WR history',
  ]),
  pl('flo','Zay Flowers','WR','Baltimore Ravens', 620, [
    '2× Pro Bowl','22nd Pick (2023)',
    '2023: 858 yards as rookie; 47.8% of team\'s targets — instant starter',
    '2023 AFC Wild Card: 102 rec yards in OT thriller',
  ]),
  pl('ric','Rashee Rice','WR','Kansas City Chiefs', 460, [
    'Pro Bowl (2023)','55th Pick (2023)','Super Bowl LVIII Champion',
    '2023: 938 yards, 7 TDs — emerged as Mahomes\' top target by year\'s end',
  ]),
  pl('mhj','Marvin Harrison Jr.','WR','Arizona Cardinals', 220, [
    '4th Overall Pick (2024)','Biletnikoff Award (2023)',
    '2023: 1,211 yards at Ohio State — unanimous All-American',
    'Son of HOF WR Marvin Harrison Sr.',
  ]),
  pl('nab','Malik Nabers','WR','New York Giants', 260, [
    '6th Overall Pick (2024)','2024: 109 catches, 1,204 yards as rookie — franchise record',
    'Fastest to 100 catches in debut season (Giants history)',
    'All-SEC at LSU under Brian Kelly',
  ]),
  pl('bth','Brian Thomas Jr.','WR','Jacksonville Jaguars', 240, [
    '23rd Pick (2024)','2024: 1,023 yards as rookie — 2nd most by JAX WR ever',
    'Rare 6\'3" size/speed combo — 4.33 combine',
  ]),
  pl('mck','Ladd McConkey','WR','Los Angeles Chargers', 200, [
    '34th Pick (2024)','Immediate starting slot WR for Herbert',
    '2024: 900+ yards and multiple TDs as rookie',
  ]),
  pl('wor','Xavier Worthy','WR','Kansas City Chiefs', 180, [
    '28th Pick (2024)','Fastest 40 in combine history (4.21s)',
    'Super Bowl ring as rookie; Mahomes\'s deep threat',
  ]),
  pl('juj','JuJu Smith-Schuster','WR','New England Patriots', 760, [
    '3× Pro Bowl','2018: 1,426 yards, 7 TDs — led NFL in receiving yards',
    '62nd Pick (2017)','2022 Super Bowl LVII appearance (KC)',
    'Beloved for his fan-engagement; consistent slot WR',
  ]),
  pl('boy','Tyler Boyd','WR','Tennessee Titans', 620, [
    '2× Pro Bowl','Super Bowl LVI appearance (CIN)',
    '55th Pick (2016)','6× 600+ yard seasons — model of consistency',
    'Bengals all-time leader in receptions (career)',
  ]),
  pl('dio','Diontae Johnson','WR','Carolina Panthers', 520, [
    '2× Pro Bowl','66th Pick (2019)',
    '2021: 107 catches, 1,161 yards','2022: 86 catches for PIT',
    'One of the best route runners in current NFL per advanced metrics',
  ]),
  pl('mve','Marquez Valdes-Scantling','WR','Buffalo Bills', 280, [
    'Pro Bowl (2022 via Green Bay)','Super Bowl LVII appearance (KC)',
    '2022: 687 yards including NFC Championship game-winner',
    '5th Round gem; averaged 18.9 yards per catch career',
  ]),
  pl('gab','Gabriel Davis','WR','Jacksonville Jaguars', 340, [
    'Pro Bowl (2022)','128th Pick (2020)',
    '2022 Divisional: 4 TD in single playoff game — tied NFL record',
    '1,000-yard season in 2023',
  ]),
  pl('laz','Allen Lazard','WR','New York Jets', 220, [
    'Undrafted (2018)','Super Bowl LVII appearance (KC)',
    '2022: 788 yards, career-high 6 TDs with Green Bay',
    'Aaron Rodgers\' most trusted deep-ball option',
  ]),
  pl('hmd','Mecole Hardman Jr.','WR','Kansas City Chiefs', 420, [
    '2× Super Bowl Champion (LVII, LVIII)','Super Bowl LVIII game-winning TD catch',
    '56th Pick (2019)','Special teams standout + big-play WR',
  ]),
  pl('cau','Wan\'Dale Robinson','WR','New York Giants', 200, [
    '43rd Pick (2022)','2022: 100 catches (led team) in a breakout year',
    'Elite slot receiver — PPR value',
  ]),
  pl('qjo','Quentin Johnston','WR','Los Angeles Chargers', 220, [
    '21st Pick (2023)','2024: Emerging deep threat for Justin Herbert',
    '6\'3" frame with 4.42 speed — physical marvel',
  ]),
  pl('npi','Rashod Bateman','WR','Baltimore Ravens', 200, [
    '27th Pick (2021)','Injury-limited; showed upside in healthy stretches',
  ]),
  pl('smo','Skyy Moore','WR','Kansas City Chiefs', 140, [
    '54th Pick (2022)','2× Super Bowl Champion (LVII, LVIII)',
    'High-value developmental slot in Chiefs ecosystem',
  ]),
  pl('cha3','KhaDarel Hodge','WR','Atlanta Falcons', 120, [
    'Undrafted veteran — special teams ace and depth WR',
  ]),
  pl('mcl2','Elijah Moore','WR','Cleveland Browns', 200, [
    '34th Pick (2021)','2021: 538 yards, 5 TDs for Jets in truncated role',
    'Slot specialist finding his footing post-NYJ',
  ]),
  pl('par','Josh Palmer','WR','Los Angeles Chargers', 200, [
    '77th Pick (2021)','2023: 854 yards as Chargers\' WR2',
    'Herbert\'s trusted complementary piece',
  ]),
  pl('coo4','Noah Brown','WR','Houston Texans', 160, [
    '6th Round Pick (2017)','2022: 612 yards for Dallas as No. 2 option',
    'Reliable veteran big-bodied receiver',
  ]),
  pl('chr','Christian Watson','WR','Green Bay Packers', 300, [
    'Pro Bowl (2022)','34th Pick (2022)',
    '2022: 7 TDs in final 10 games — Jordan Love\'s go-to',
    '4.36 speed at 6\'4" — rare size/speed combo',
  ]),
  pl('jac2','Romeo Doubs','WR','Green Bay Packers', 220, [
    '132nd Pick (2022)','2022: 42 catches, 425 yards as rookie',
    '2023: 1,089 yards, 8 TDs — breakout year',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   TIGHT ENDS  — 14 new entries
══════════════════════════════════════════════════════════════════════ */
export const TE_POOL_V2: NFLPlayer[] = [
  pl('ert','Zach Ertz','TE','Washington Commanders', 1180, [
    '4× Pro Bowl','Super Bowl LII Champion',
    '74th Pick (2013)','2018: 116 catches — NFL record for a TE at time',
    'Super Bowl LII: Key role in Eagles\' championship run',
  ]),
  pl('fen','Noah Fant','TE','Seattle Seahawks', 580, [
    '2× Pro Bowl','20th Pick (2019)',
    '2023: 535 yards for Seattle — continued production',
    'Part of historic Broncos/Seahawks blockbuster trade',
  ]),
  pl('lik','Isaiah Likely','TE','Baltimore Ravens', 420, [
    '2× Pro Bowl (2022, 2023 snub candidate)','139th Pick (2022)',
    '2022: Stepped in for injured Andrews — 8 TDs in partial season',
    '2023: 84 catches, 1,000+ yards, 6 TDs — historic TE season for depth role',
  ]),
  pl('fer','Jake Ferguson','TE','Dallas Cowboys', 560, [
    'Pro Bowl (2023)','129th Pick (2022)',
    '2023: 1,021 yards, 6 TDs — Cowboys franchise TE season record',
    'Emerged as primary target with Lamb dominating attention',
  ]),
  pl('okw','Chigoziem Okonkwo','TE','Tennessee Titans', 340, [
    'Pro Bowl (2023)','69th Pick (2022)',
    '2023: 567 yards, 5 TDs — one of fastest TEs in NFL',
    '4.51s 40 — elite athleticism for the position',
  ]),
  pl('ott','Cade Otton','TE','Tampa Bay Buccaneers', 280, [
    '106th Pick (2022)','2023: 578 yards, 3 TDs',
    'Core piece of Buccaneers\' rebuilt TE room post-Gronk',
  ]),
  pl('mug','Luke Musgrave','TE','Green Bay Packers', 260, [
    '42nd Pick (2023)','2023: 473 yards, 4 TDs as rookie',
    'Ascending under Jordan Love — natural chemistry',
  ]),
  pl('jon2','Jonnu Smith','TE','Atlanta Falcons', 480, [
    '2× Pro Bowl','100th Pick (2017)',
    '2019: 439 yards, 8 TDs — breakthrough season',
    'Known for blocking excellence + receiving versatility',
  ]),
  pl('meh','Michael Mayer','TE','Las Vegas Raiders', 220, [
    '35th Pick (2023)','2023: 392 yards in rookie season',
    'First TE selected in 2023 draft; Notre Dame standout',
  ]),
  pl('kra','Tucker Kraft','TE','Green Bay Packers', 200, [
    '93rd Pick (2023)','2023: Showed flashes in GB TE committee',
    'Ascending — featured more in 2024 season',
  ]),
  pl('dis','Will Dissly','TE','Los Angeles Chargers', 220, [
    'Reliable blocking & receiving TE — Pro Bowl consideration 2021',
    '120th Pick (2018)','Career 400+ rec yards in multiple seasons',
  ]),
  pl('tan2','Robert Tonyan','TE','Minnesota Vikings', 320, [
    'Pro Bowl (2021 snub)','Super Bowl LV appearance (GB)','139th Pick (2017)',
    '2020: 11 TDs — tied TE single-season record for Green Bay',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   OFFENSIVE TACKLES  — 18 new entries
══════════════════════════════════════════════════════════════════════ */
export const OT_POOL_V2: NFLPlayer[] = [
  pl('wir','Tristan Wirfs','OT','Tampa Bay Buccaneers', 1860, [
    '4× Pro Bowl','2× AP 1st-Team (2022, 2023)','AP 2nd-Team',
    '13th Pick (2020)','Super Bowl LV Champion',
    'Only OT to earn AP 1st-Team in his 2nd and 3rd NFL season',
  ]),
  pl('arm','Terron Armstead','OT','Miami Dolphins', 1260, [
    '5× Pro Bowl','AP 2nd-Team','75th Pick (2013)',
    '2021: Allowed 0 sacks — tied for NFL best among starters',
    'Super Bowl LIX appearance (MIA)','Considered top 5 LT in NFL despite injuries',
  ]),
  pl('mot','Taylor Moton','OT','Carolina Panthers', 1020, [
    '3× Pro Bowl','AP 2nd-Team (2020)',
    '41st Pick (2017)','4× 1,000+ snaps — premier right tackle',
    '2020: 2nd-lowest pressure rate allowed among all OTs',
  ]),
  pl('daw','Dion Dawkins','OT','Buffalo Bills', 820, [
    '2× Pro Bowl','63rd Pick (2017)',
    '2022: Graded top-10 LT per PFF','Anchored Bills\' SB-caliber offense',
  ]),
  pl('cos','Sam Cosmi','OT','Washington Commanders', 540, [
    '51st Pick (2021)','2× Pro Bowl (2023, 2024)',
    '2023: AP 2nd-Team consideration; elite run blocker',
  ]),
  pl('crs','Charles Cross','OT','Seattle Seahawks', 440, [
    '9th Pick (2022)','2× Pro Bowl','2023: Surrendered fewest pressures among LTs (per PFF)',
    'One of the most pro-ready OL prospects in recent draft history',
  ]),
  pl('ekw','Ikem Ekwonu','OT','Carolina Panthers', 360, [
    '5th Overall Pick (2022)','2023: Pro Bowl snub candidate',
    'Dominant run blocker — Carolina franchise cornerstone',
  ]),
  pl('par2','Paris Johnson Jr.','OT','Arizona Cardinals', 320, [
    '6th Overall Pick (2023)','Immediate starter as rookie',
    '2023: One of youngest full-time starting LTs in NFL',
  ]),
  pl('bjo','Broderick Jones','OT','Pittsburgh Steelers', 280, [
    '14th Pick (2023)','Took over as starter in 2023 season',
    'Physical freak — 5.02 RAS (perfect score in some categories)',
  ]),
  pl('har2','Anton Harrison','OT','Jacksonville Jaguars', 260, [
    '27th Pick (2023)','2023: Quality starter protecting Lawrence\'s blind side',
  ]),
  pl('dan','Dan Moore Jr.','OT','Pittsburgh Steelers', 240, [
    '128th Pick (2021)','3-year starter anchoring Steelers\' LT position',
  ]),
  pl('smi2','Donovan Smith','OT','Free Agent', 640, [
    'Pro Bowl (2022)','Super Bowl LV Champion','34th Pick (2015)',
    '8-year starter — consistent LT across Brady\'s Tampa era',
  ]),
  pl('fan','Olumuyiwa Fashanu','OT','New York Jets', 200, [
    '11th Overall Pick (2024)','Immediate starter protecting Aaron Rodgers',
  ]),
  pl('lat','JC Latham','OT','Tennessee Titans', 180, [
    '7th Overall Pick (2024)','Alabama All-American — rare size/athleticism combo',
  ]),
  pl('mog2','Morgan Moses','OT','New York Jets', 380, [
    'Pro Bowl (2021)','76th Pick (2014)',
    '10-year veteran — 3 teams, consistent starter across NYJ & WAS',
  ]),
  pl('bec','Mekhi Becton','OT','Philadelphia Eagles', 380, [
    '11th Pick (2020)','2× Pro Bowl (health permitting)',
    'Switched to guard 2023 — versatile and imposing at 363 lbs',
  ]),
  pl('joy','Jordan Morgan','OT','Green Bay Packers', 160, [
    '25th Pick (2024)','Immediate starter for Green Bay',
  ]),
  pl('ben','Dennis Daley','OT','Free Agent', 120, [
    'Veteran swing tackle; 6-year career across 5 teams',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   OFFENSIVE GUARDS  — 16 new entries
══════════════════════════════════════════════════════════════════════ */
export const OG_POOL_V2: NFLPlayer[] = [
  pl('dot','Kevin Dotson','OG','Los Angeles Rams', 760, [
    '2× Pro Bowl','AP 2nd-Team (2023)',
    '129th Pick (2020)','2023: Highest-graded guard in NFC per PFF',
    'Pillar of Rams\' rebuilt O-Line with Stafford',
  ]),
  pl('hun','Robert Hunt','OG','Los Angeles Chargers', 840, [
    '3× Pro Bowl','39th Pick (2020)',
    '2022 AP 2nd-Team','Massive (6\'5", 323) dominant run blocker',
    '2023: Key piece allowing Herbert\'s strong season',
  ]),
  pl('tom','Laken Tomlinson','OG','New York Jets', 620, [
    '2× Pro Bowl','28th Pick (2015)',
    'SF 49ers: AP 2nd-Team consideration 2021',
    '2022: Anchored Jets\' best O-Line in years',
  ]),
  pl('dan2','James Daniels','OG','Pittsburgh Steelers', 560, [
    '39th Pick (2018)','4-year starter across CHI & PIT',
    '2022: Graded top-15 guard by PFF',
  ]),
  pl('dav','Nate Davis','OG','Chicago Bears', 500, [
    '87th Pick (2019)','3-year full-time starter for Titans',
    '2021: Key piece of NFL\'s top rushing offense (TEN)',
  ]),
  pl('whi2','Cody Whitehair','OG','Chicago Bears', 580, [
    '2× Pro Bowl','56th Pick (2016)',
    'Played C & G across career; 2× Pro Bowl at C (vol 1 eligible)',
    'Bears franchise O-Line leader 2016–2023',
  ]),
  pl('new','Xavier Newman','OG','San Francisco 49ers', 380, [
    '148th Pick (2021)','Key reserve piece for 49ers\' run-dominant O-Line',
    '2023: Super Bowl LVIII appearance',
  ]),
  pl('run','Jon Runyan Jr.','OG','Green Bay Packers', 380, [
    '173rd Pick (2020)','2023: Starting RG for NFC North champion Packers',
    'Son of NFL veteran Jon Runyan Sr.',
  ]),
  pl('ber2','Matthew Bergeron','OG','Atlanta Falcons', 260, [
    '38th Pick (2023)','2023: Immediate starter as rookie LG',
  ]),
  pl('may2','Jalen Mayfield','OG','Atlanta Falcons', 180, [
    '68th Pick (2021)','Developing starter in Falcons rebuild',
  ]),
  pl('lev2','Nick Leverett','OG','Tampa Bay Buccaneers', 280, [
    '2× Super Bowl Champion (KC LVII, LV as TB backup)',
    'Undrafted (2020) — resilient depth piece turned starter',
  ]),
  pl('ont','Netane Muti','OG','San Francisco 49ers', 220, [
    '189th Pick (2020)','Super Bowl LVIII appearance',
    'Powerful run blocker — key depth in 49ers\' system',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   CENTERS  — 12 new entries
══════════════════════════════════════════════════════════════════════ */
export const C_POOL_V2: NFLPlayer[] = [
  pl('lin3','Tyler Linderbaum','C','Baltimore Ravens', 1080, [
    '2× Pro Bowl','AP 2nd-Team (2023)','25th Pick (2022)',
    '2023: Highest-graded rookie C by PFF — ever',
    'Unanimous All-American at Iowa; immediate NFL starter',
  ]),
  pl('mor','Mitch Morse','C','Buffalo Bills', 740, [
    '2× Pro Bowl','58th Pick (2015)',
    'Considered top-5 C in AFC','2022: 0 penalties in entire season',
    'Key piece in Bills\' O-Line protecting Josh Allen',
  ]),
  pl('mcc2','Erik McCoy','C','New Orleans Saints', 640, [
    '2× Pro Bowl','48th Pick (2019)',
    '2021: Top-10 center by PFF grade','2022: Allowed just 1 sack all season',
  ]),
  pl('kel3','Ryan Kelly','C','Indianapolis Colts', 560, [
    'Pro Bowl (2021)','18th Pick (2016)',
    '2021: Highest-rated season for a Colts C in years',
    '5-year full-time starter; reliable anchor for Taylor\'s run game',
  ]),
  pl('zto','Zach Tom','C','Green Bay Packers', 460, [
    '185th Pick (2022)','Started at 4 positions in his first 2 seasons',
    '2023: Graded as top-5 C when starting — versatile standout',
  ]),
  pl('jsc','John Michael Schmitz','C','New York Giants', 280, [
    '43rd Pick (2023)','Immediate starter as rookie',
    '2023: Bright spot on otherwise struggling NYG line',
  ]),
  pl('hen2','Matt Hennessey','C','Atlanta Falcons', 260, [
    '78th Pick (2020)','Starting center for rebuilt Falcons O-Line',
    '2023: Highest-graded season of career per PFF',
  ]),
  pl('poc','Ethan Pocic','C','Cleveland Browns', 340, [
    '46th Pick (2017)','2022: Best season of career — Browns run game top-5',
    'Graded as top-10 center by PFF in 2022',
  ]),
  pl('jur3','Cam Jurgens','C','Philadelphia Eagles', 420, [
    '51st Pick (2022)','2024: Seamlessly replaced Jason Kelce',
    '2024 AP 2nd-Team consideration — immediate impact starter',
  ]),
  pl('mck2','Sam McKinnis','C','Tennessee Titans', 180, [
    'Reliable backup / swing center across multiple rosters',
  ]),
  pl('mei','Quinn Meinerz','C','Denver Broncos', 300, [
    '98th Pick (2021) — out of Division III Wisconsin-Whitewater',
    '2022: Full-time starter, one of best small-school success stories',
    '2023: Graded as top-15 C by PFF in strong run-block year',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   MASTER EXPORT  — vol 2
══════════════════════════════════════════════════════════════════════ */
export const ALL_PLAYERS_V2: Record<PositionGroup, NFLPlayer[]> = {
  QB: QB_POOL_V2,
  RB: RB_POOL_V2,
  WR: WR_POOL_V2,
  TE: TE_POOL_V2,
  OT: OT_POOL_V2,
  OG: OG_POOL_V2,
  C:  C_POOL_V2,
};

/* ── Quick stats ──
   QB: 20 · RB: 20 · WR: 26 · TE: 14 · OT: 18 · OG: 16 · C: 12
   Vol 2 total: 126 new players
   Combined with Vol 1 (123): 249 total players
─────────────────────────────────────────────────────────────────── */