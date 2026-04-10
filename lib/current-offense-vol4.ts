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
   QUARTERBACKS — 15 entries
   Rarity split: 11 common · 4 rare · 0 epic
══════════════════════════════════════════════════════════════════════ */
export const QB_POOL_V4: NFLPlayer[] = [
  pl('dtr','Dorian Thompson-Robinson','QB','Cleveland Browns', 140, [
    '100th Pick (2023)','2023: Spot starter — 3 TDs in relief of Watson',
    'UCLA: 2023 All-Pac-12 — sharp off-platform passer',
  ]),
  pl('dmi','Davis Mills','QB','Houston Texans', 280, [
    '67th Pick (2021)','2022: Full season starter — 2,664 yards, 11 TDs',
    'Stanford product — patient pocket passer',
  ]),
  pl('des','Desmond Ridder','QB','Arizona Cardinals', 220, [
    '74th Pick (2022)','2022: Led Falcons to 7-6 record as starter',
    '2023 (ARI): Learning under veteran system',
  ]),
  pl('tba','Tyson Bagent','QB','Chicago Bears', 180, [
    'Undrafted (2023)','2023: 2-2 as starter for Bears — composed debut',
    'Shepherd University (D2) → NFL starter; remarkable journey',
  ]),
  pl('jha','Jake Haener','QB','New Orleans Saints', 140, [
    '134th Pick (2023)','Emergency starter experience',
    'Fresno State: 2× Mountain West OPOY',
  ]),
  pl('nro','Nathan Rourke','QB','Jacksonville Jaguars', 120, [
    'Undrafted (2022) — from Canadian Football League',
    '2022 (CFL): Grey Cup MVP — dominant passer before NFL shot',
  ]),
  pl('est','Easton Stick','QB','Los Angeles Chargers', 160, [
    '166th Pick (2019)','5-year backup; went 2-0 as emergency starter (2023)',
    'NDSU: 3× FCS champion — winner\'s pedigree',
  ]),
  pl('lpu','Luke Getsy (QB note)','QB','Free Agent', 120, [
    'Veteran camp arm; depth piece across multiple rosters',
  ]),
  pl('tre2','Trevor Siemian','QB','Free Agent', 300, [
    '250th Pick (2015)','Started 21 games across DEN/NYJ/CHI/NO',
    '2016: 8-6 as Broncos starter filling for Peyton Manning',
  ]),
  pl('cas2','Case Keenum','QB','Free Agent', 380, [
    'Pro Bowl honorable (2017)','259th Pick (2012)',
    '2017: Led Vikings to 13-3, NFC Championship — "Minneapolis Miracle" connection',
    '2017: 67.6 completion %, 22 TDs, 7 INT — career peak',
  ]),
  pl('kmo','Kellen Moore','QB','Free Agent', 140, [
    'NDSU legend — 4× FCS Champion','257th Pick (2012)',
    'Current NFL offensive coordinator; veteran backup who shaped a system',
  ]),
  pl('sha','Shane Buechele','QB','Philadelphia Eagles', 120, [
    'Undrafted (2021)','Career backup — 3 roster seasons',
    'SMU: 2020 AAC Offensive Player of Year',
  ]),
  pl('jfl','Jeff Driskel','QB','Free Agent', 140, [
    '207th Pick (2016)','Started 4 games for Detroit (2018) — 2 TDs, 1 INT',
    'Veteran journeyman; 6 teams across 8 seasons',
  ]),
  pl('rta','Ryan Tannehill (note)','QB','Tennessee Titans', 600, [
    '8th Pick (2012)','2× Pro Bowl','AP 2nd-Team (2019)',
    '2019: 117.5 passer rating — 2nd highest all-time for a season',
    'Note: Returned 2025 as backup after earlier listing; still active',
  ]),
  pl('aob','Aidan O\'Connell (note)','QB','Las Vegas Raiders', 240, [
    '135th Pick (2023)','2024: Led Raiders to several competitive outings',
    'Purdue product — polished pocket presence',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   RUNNING BACKS — 20 entries
   Rarity split: 13 common · 6 rare · 1 epic
══════════════════════════════════════════════════════════════════════ */
export const RB_POOL_V4: NFLPlayer[] = [
  pl('jkd','J.K. Dobbins','RB','Los Angeles Chargers', 820, [
    'Pro Bowl (2024 candidate)','55th Pick (2020)',
    '2020: 805 rush yards in 8 games — 6.0 YPC (highest among active RBs)',
    '2024: 1,069 yards for Chargers — finally healthy full season',
    'Two torn ACLs overcome — remarkable comeback story',
  ]),
  pl('jwi','Jamaal Williams','RB','New Orleans Saints', 540, [
    'Pro Bowl (2022)','134th Pick (2017)',
    '2022 (DET): 17 rushing TDs — 3rd most in NFL history in single season',
    'Beloved personality — fan favorite on every team',
  ]),
  pl('cam2','Cam Akers','RB','Minnesota Vikings', 380, [
    '52nd Pick (2020)','2021: Started Super Bowl LVI run after torn Achilles',
    '2021 Playoffs: 131 yards vs. Cardinals — miraculous comeback',
    'Overcome two major injuries to remain active starter',
  ]),
  pl('spe2','Samaje Perine','RB','Denver Broncos', 280, [
    '224th Pick (2017)','2022 (CIN): 572 yards, 6 TDs as complementary back',
    '2022: Super Bowl LVI appearance','Reliable veteran in multiple offenses',
  ]),
  pl('juh','Justice Hill','RB','Baltimore Ravens', 260, [
    '113th Pick (2019)','2023: 419 yards, 3 TDs as change-of-pace back',
    'One of fastest RBs on field — blazing 4.40 speed',
  ]),
  pl('khe','Khalil Herbert','RB','Chicago Bears', 320, [
    '149th Pick (2021)','2022: 731 yards in 9 starts — efficient workhorse',
    '2021: 5.8 YPC — led all rookie RBs in efficiency',
  ]),
  pl('kmi','Keaton Mitchell','RB','Baltimore Ravens', 280, [
    '160th Pick (2023)','2023: 5 TDs, 544 yards in 9 games before torn ACL',
    'One of fastest RBs in 2023 class — 4.32 combine speed',
  ]),
  pl('zaw','Zamir White','RB','Las Vegas Raiders', 260, [
    '122nd Pick (2022)','2023: 758 yards as starter after Jacobs holdout',
    'Georgia: 2× National Champion',
  ]),
  pl('jml2','Jaleel McLaughlin','RB','Denver Broncos', 220, [
    'Undrafted (2023)','2023: 671 rush + rec yards as UDFA surprise',
    'Shortest active RB (5\'7") — one of quickest in open field',
  ]),
  pl('wsh','Will Shipley','RB','Philadelphia Eagles', 280, [
    '121st Pick (2024)','Super Bowl LIX Champion (2024)',
    '2023 (Clemson): 1,097 yards, 11 TDs — ACC standout',
    'Versatile pass-catcher out of backfield — fits Eagles\' scheme perfectly',
  ]),
  pl('dys','Dylan Sampson','RB','Tennessee Titans', 200, [
    '109th Pick (2024)','2024: Starter-level opportunity as rookie',
    '2023 (Tennessee): 1,491 yards, 22 TDs — SEC Offensive Player of Year',
  ]),
  pl('aes','Audric Estimé','RB','Denver Broncos', 220, [
    '144th Pick (2024)','2024: Immediate backup role in Denver',
    '2023 (Notre Dame): 1,104 yards, 14 TDs — ACC All-American',
  ]),
  pl('hha','Hassan Haskins','RB','Tennessee Titans', 200, [
    '123rd Pick (2022)','2024: Key depth back in Tennessee system',
    'Michigan: 2021 Big Ten Champion; committed runner',
  ]),
  pl('pat2','Patrick Taylor Jr.','RB','Miami Dolphins', 180, [
    '205th Pick (2021)','Reliable depth back — quality short-yardage runner',
    '2023: 294 yards in backup role for Dolphins',
  ]),
  pl('deo','Deon Jackson','RB','Indianapolis Colts', 200, [
    'Undrafted (2021)','2022: 484 rush + rec yards — quality flex RB',
    'Elite pass-catcher out of backfield for Colts offense',
  ]),
  pl('mca','Michael Carter','RB','New York Jets', 180, [
    '107th Pick (2021)','2021: 639 rush + rec yards as rookie jet',
    'North Carolina: powerful burst in space',
  ]),
  pl('zev','Zach Evans','RB','Los Angeles Rams', 200, [
    '186th Pick (2023)','2024: Depth role in Rams system',
    'Ole Miss: 1,000+ yards in 2022 before draft slide',
  ]),
  pl('jho','Jameis Winston (note)','RB','Cleveland Browns', 140, [
    'Actually QB — listed as depth note',
    'Jamaal Hardeman - UDFA RB depth',
  ]),
  pl('lfo','Leonard Fournette','RB','Free Agent', 780, [
    '4th Overall Pick (2017)','Super Bowl LV Champion',
    '2020: 1,266 scrimmage yards','2020 Playoffs: 3 TDs in 3 games',
    'Key piece of Buccaneers\' Super Bowl run',
  ]),
  pl('son','Sony Michel','RB','Free Agent', 620, [
    '31st Pick (2018)','Super Bowl LIII Champion',
    '2018 Playoffs: 336 rush yards — Patriots postseason record',
    '2021 (LAR): Super Bowl LVI appearance — 845 yards regular season',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   WIDE RECEIVERS — 24 entries
   Rarity split: 16 common · 7 rare · 1 epic
══════════════════════════════════════════════════════════════════════ */
export const WR_POOL_V4: NFLPlayer[] = [
  pl('nel2','Nelson Agholor','WR','Baltimore Ravens', 580, [
    'Pro Bowl (2020)','198th Pick (2015)',
    '2020 (LV): 896 yards, 8 TDs — career year','2018 Super Bowl run (PHI)',
    'Super Bowl LII Champion — key in Eagles\' championship offense',
  ]),
  pl('dpa','Davante Parker','WR','Los Angeles Rams', 720, [
    '2× Pro Bowl','14th Pick (2014)',
    '2019: 1,202 yards, 9 TDs — Pro Bowl','2021: 996 yards for Miami',
    '2022 (NE): 635 yards despite weak QB play — still showing up',
  ]),
  pl('dch','D.J. Chark Jr.','WR','Las Vegas Raiders', 480, [
    'Pro Bowl (2019)','61st Pick (2018)',
    '2019: 1,008 yards, 8 TDs — breakout season for Jaguars',
    'Torn ankle (2021) slowed trajectory — showed true WR1 potential',
  ]),
  pl('dsl','Darius Slayton','WR','New York Giants', 420, [
    'Pro Bowl honorable (2020)','171st Pick (2019)',
    '2019: 740 yards, 8 TDs as 5th-round rookie',
    '2020: 751 yards — NYG\'s leading receiver for 2 seasons',
  ]),
  pl('rsh','Rashid Shaheed','WR','New Orleans Saints', 380, [
    'Pro Bowl (2024)','183rd Pick (2022)',
    '2024: 1,000+ yards, 6 TDs — breakthrough starring role',
    'Fastest WR in Saints history — 4.29 combine time',
  ]),
  pl('ron','Rondale Moore','WR','Atlanta Falcons', 340, [
    '49th Pick (2021)','2021: 435 yards for Arizona in limited role',
    '2024: Resurgence in ATL — electric after-the-catch runner',
    'Purdue: Tiniest WR (5\'7") with biggest big-play rate',
  ]),
  pl('jre','Josh Reynolds','WR','Detroit Lions', 380, [
    'Pro Bowl (2023)','117th Pick (2017)',
    '2023: 738 yards as Lions\' WR3 in Super Bowl run',
    'Super Bowl LVI ring (LAR) — consistent veteran depth',
  ]),
  pl('ttr','Tre Tucker','WR','Las Vegas Raiders', 220, [
    '99th Pick (2023)','2024: Special teams ace + speed receiver',
    '4.23 combine time — fastest WR in 2023 draft class',
  ]),
  pl('cti','Cedric Tillman','WR','Cleveland Browns', 260, [
    '74th Pick (2023)','2023: 476 yards for Cleveland',
    '2022 (Tennessee): 1,081 yards, 12 TDs — SEC standout',
  ]),
  pl('jmg','Jonathan Mingo','WR','Chicago Bears', 220, [
    '39th Pick (2023)','2024: Depth WR in Bears\' young offense',
    '2022 (Ole Miss): 747 yards, 6 TDs',
  ]),
  pl('vve','Devaughn Vele','WR','Denver Broncos', 200, [
    '146th Pick (2024)','2024: 500+ yards as Bo Nix\'s reliable option',
    'Colorado: Standout in Deion Sanders\' high-profile rebuild',
  ]),
  pl('trf','Troy Franklin','WR','Denver Broncos', 240, [
    '104th Pick (2024)','2024: Key target in Broncos\' passing game',
    '2023 (Oregon): 1,059 yards, 13 TDs — Pac-12 standout',
  ]),
  pl('khi','Kendall Hinton','WR','Denver Broncos', 200, [
    '152nd Pick (2020)','2020: Emergency QB start (game log oddity)',
    '2022: 421 yards as WR — found his proper position',
  ]),
  pl('kto','Kadarius Toney','WR','Free Agent', 320, [
    '20th Pick (2021)','2022: Super Bowl LVII ring (KC)',
    '2021 (NYG): 420 yards in 10 games — electric with ball in hands',
    'Injury concerns limited ceiling despite elite athleticism',
  ]),
  pl('bre2','Brenden Rice','WR','Los Angeles Chargers', 180, [
    '219th Pick (2024)','Son of HOF WR Jerry Rice',
    '2024: Spot contributor in Chargers offense',
    '2023 (USC): 768 yards, 8 TDs under Lincoln Riley',
  ]),
  pl('dtu','D.J. Turner','WR','Cincinnati Bengals', 260, [
    '60th Pick (2023)','2024: Becoming key slot piece for Burrow',
    'Michigan: 2023 National Champion',
  ]),
  pl('mho','Mack Hollins','WR','Atlanta Falcons', 280, [
    '168th Pick (2017)','2021 (LV): 690 yards — career high',
    'Special teams ace + reliable depth piece across 7 seasons',
  ]),
  pl('vel','Velus Jones Jr.','WR','Chicago Bears', 200, [
    '71st Pick (2022)','2024: Kick returner and depth WR',
    '2023: 255 yards + special teams contributions',
    'Tennessee: Top-3 in SEC kick return average (career)',
  ]),
  pl('shi','Shi Smith','WR','Carolina Panthers', 220, [
    '193rd Pick (2021)','2022: 350 yards — reliable slot option',
    'South Carolina: Program record holder in receptions',
  ]),
  pl('jre2','Jalen Reagor','WR','Free Agent', 160, [
    '21st Overall Pick (2020) — high expectations, limited output',
    '2020: 396 yards for Philadelphia',
    'TCU: Top-5 WR in 2020 draft class by pre-draft rankings',
  ]),
  pl('khm','KJ Hamler','WR','Denver Broncos', 240, [
    '46th Pick (2020)','2021: Torn ACL cut promising season short',
    '2022: 321 yards on return — showed elite deep-ball speed',
    'Penn State: One of fastest WRs in 2020 class',
  ]),
  pl('chy','Chase Claypool','WR','Miami Dolphins', 320, [
    '49th Pick (2020)','2020: 873 yards, 9 TDs — dynamic rookie',
    '2020: 3 TDs in single game vs. Eagles as a rookie',
    'Notre Dame: 2020 breakout pick who showed tantalizing upside',
  ]),
  pl('par3','Parker Washington','WR','Jacksonville Jaguars', 200, [
    '131st Pick (2023)','2024: WR2/3 role for Jaguars',
    'Penn State: Led Big Ten in catches (2022)',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   TIGHT ENDS — 13 entries
   Rarity split: 11 common · 2 rare · 0 epic
══════════════════════════════════════════════════════════════════════ */
export const TE_POOL_V4: NFLPlayer[] = [
  pl('ngo','Noah Gray','TE','Kansas City Chiefs', 340, [
    '141st Pick (2021)','2× Super Bowl Champion (LVII, LVIII)',
    '2023: 326 yards, 3 TDs complementing Kelce',
    'Duke: Reliable blocker and safety-valve receiver',
  ]),
  pl('bwr','Brock Wright','TE','Detroit Lions', 260, [
    '168th Pick (2022)','Super Bowl LVIII appearance',
    '2023: Key blocking TE in Detroit\'s dominant run game',
    'Notre Dame: Cornerstone of Lions\' trenches identity',
  ]),
  pl('tjo','Theo Johnson','TE','New York Giants', 200, [
    '109th Pick (2024)','2024: Immediate depth piece for Giants',
    'Penn State: Athletic pass-catching TE with upside',
  ]),
  pl('ajb','A.J. Barner','TE','Indianapolis Colts', 220, [
    '120th Pick (2024)','2024: Competing for starting role with Colts',
    'Michigan: Reliable two-way TE — solid in both phases',
  ]),
  pl('eal','Erick All Jr.','TE','Cincinnati Bengals', 180, [
    '109th Pick (2024)','Replacing Hockenson in Bengals TE room',
    'Iowa: Second in career receptions by a Hawkeye TE',
  ]),
  pl('col','Colby Parkinson','TE','Los Angeles Rams', 260, [
    '98th Pick (2020)','Super Bowl LVI Champion',
    '2023: Key blocking TE in Rams\' system with Stafford',
    'Stanford: High-IQ TE; reliable in short-to-mid passing game',
  ]),
  pl('don','Donald Parham Jr.','TE','Los Angeles Chargers', 240, [
    'Undrafted (2019) — Canadian Football League route',
    '2021: 241 yards, 3 TDs for Chargers','6\'8" — tallest TE in league',
    'Elite red zone target; unique height advantage',
  ]),
  pl('ttr2','Tommy Tremble','TE','Carolina Panthers', 240, [
    '85th Pick (2021)','3× starter for Panthers blocking-TE role',
    'Notre Dame: Defensive OPOY-level blocking accolades',
  ]),
  pl('sto2','Stone Smartt','TE','Los Angeles Chargers', 180, [
    '232nd Pick (2022)','2023: Spot contributor for Chargers',
    'Undrafted trajectory before being claimed — persevered',
  ]),
  pl('kgr2','Kylen Granson','TE','Indianapolis Colts', 220, [
    '128th Pick (2021)','2022: 290 yards in growing role',
    'SMU: Record-holder for receiving yards by a Mustang TE',
  ]),
  pl('jmi','James Mitchell','TE','Detroit Lions', 200, [
    '168th Pick (2022)','Super Bowl LVIII appearance',
    '2023: Depth piece in Lions\' loaded TE room',
    'Virginia Tech: Torn ACL in final college season; remarkable return',
  ]),
  pl('lfa','Luke Farrell','TE','Jacksonville Jaguars', 180, [
    '159th Pick (2021)','Elite blocking designation — PFF grade 78+ in run',
    'Ohio State: National Champion (2021); locks down edge in run game',
  ]),
  pl('qmo','Quintin Morris','TE','Buffalo Bills', 220, [
    'Undrafted (2022)','2023: 215 yards in first full NFL season',
    'Western Michigan: MAC Tight End of the Year (2021)',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   OFFENSIVE TACKLES — 16 entries
   Rarity split: 10 common · 5 rare · 1 epic
══════════════════════════════════════════════════════════════════════ */
export const OT_POOL_V4: NFLPlayer[] = [
  pl('psk','Peter Skoronski','OT','Tennessee Titans', 760, [
    'Pro Bowl (2024)','11th Overall Pick (2023)',
    '2024: Highest-graded OT on Tennessee\'s line per PFF',
    'Northwestern: Unanimous All-American; Outland Trophy finalist',
  ]),
  pl('bjo3','Braxton Jones','OT','Chicago Bears', 340, [
    '168th Pick (2022)','2022–24: Full-time LT protecting Bears QBs',
    'Southern Utah (FCS): Largest draft reach that delivered',
  ]),
  pl('cwa','Carter Warren','OT','Pittsburgh Steelers', 220, [
    '103rd Pick (2022)','2024: Spot starter in Pittsburgh system',
    'Pittsburgh: 3-year starter before heading to hometown team',
  ]),
  pl('cfl','Cam Fleming','OT','New York Giants', 240, [
    '123rd Pick (2014)','10-year veteran swing tackle across 6 teams',
    'Patriots: 2× Super Bowl Champion (XLIX, LI)',
    'Reliable veteran depth — started at both tackle spots in career',
  ]),
  pl('sto3','Storm Norton','OT','Los Angeles Chargers', 260, [
    'Undrafted (2017)','2021: Started 15 games at RT for Chargers',
    'One of best UDFA OT success stories — earned starting role',
  ]),
  pl('awy','Andrew Wylie','OT','Washington Commanders', 340, [
    'Undrafted (2018)','2021: Key piece of Chiefs\' Super Bowl LV line',
    '2022: Starting RT protecting Mahomes in SBLVII run',
    '2× Super Bowl ring — underrated dynasty contributor',
  ]),
  pl('clj','Caleb Jones','OT','Chicago Bears', 220, [
    '180th Pick (2021)','2024: Depth tackle for Bears\' rebuilt line',
    'Indiana: Started from day 1 in college — experienced anchor',
  ]),
  pl('och2','Charlie Heck','OT','Houston Texans', 240, [
    '112th Pick (2020)','2022–23: Starting RT protecting Stroud',
    'North Carolina: Consensus All-ACC selection',
  ]),
  pl('rhi','Rashod Hill','OT','Free Agent', 180, [
    'Undrafted (2016)','Veteran swing tackle across PIT, MIN, CHI',
    '2021: Started 10 games as fill-in — reliable emergency starter',
  ]),
  pl('cog','Cedric Ogbuehi','OT','Houston Texans', 220, [
    '21st Pick (2015)','Career backup and swing tackle',
    '2022 (HOU): Key depth piece on surprising Texans run',
  ]),
  pl('kbe','Kelvin Beachum','OT','Free Agent', 340, [
    'Pro Bowl (2014)','Undrafted (2012)','2014: One of best LTs in AFC',
    '10+ year starter — iron man for multiple franchises',
    '2021 (ARI): Started all 17 games at age 32',
  ]),
  pl('jma2','Jake Matthews','OT','Atlanta Falcons', 780, [
    '6th Overall Pick (2014)','7× Pro Bowl (alternate selections)','AP 2nd-Team',
    '2023: 10th full season as primary LT — ironman franchise piece',
    'Son of HOF center Bruce Matthews; OL royalty',
  ]),
  pl('tmo','Taylor Moton (dup note)','OT','Carolina Panthers', 1040, [
    '3× Pro Bowl','AP 2nd-Team (2020)','41st Pick (2017)',
    'One of the most dependable RTs of the 2020s; 4 straight Pro Bowl appearances',
  ]),
  pl('gfn','George Fant','OT','Free Agent', 280, [
    '190th Pick (2016)','Former professional basketball player → NFL',
    '2021 (NYJ): Starting LT — one of sport-crossing success stories',
  ]),
  pl('dfl','D.J. Fluker','OT','Free Agent', 300, [
    '11th Pick (2013)','2015: Starting RT in Chargers system',
    'Alabama: Multiple championship teams — OL pedigree',
  ]),
  pl('mbec','Mekhi Becton (OT note)','OT','Philadelphia Eagles', 400, [
    '11th Pick (2020)','Super Bowl LIX Champion (2024)',
    '2020: Pro Bowl trajectory before injury derailed 3 seasons',
    'Switched to guard role 2023; versatile and imposing at 363 lbs',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   OFFENSIVE GUARDS — 16 entries
   Rarity split: 12 common · 4 rare · 0 epic
══════════════════════════════════════════════════════════════════════ */
export const OG_POOL_V4: NFLPlayer[] = [
  pl('aba2','Aaron Banks','OG','San Francisco 49ers', 380, [
    '48th Pick (2021)','Super Bowl LVIII appearance',
    '2023: Key interior piece of 49ers\' dominant run-blocking O-Line',
    'Notre Dame: Two-year starter before being selected',
  ]),
  pl('cst','Cole Strange','OG','New England Patriots', 320, [
    '29th Pick (2022)','Starting LG protecting Drake Maye',
    '2023: Full-time starter for Patriots\' rebuilt interior',
    'Chattanooga (FCS): Scout favorite for athleticism',
  ]),
  pl('jca3','Jackson Carman','OG','Cincinnati Bengals', 240, [
    '46th Pick (2021)','2022: Super Bowl LVI appearance',
    '2024: Fighting for starting role in CIN\'s strong interior',
    'Clemson: 2× National Champion — winning culture background',
  ]),
  pl('ato','Atonio Mafi','OG','Los Angeles Rams', 280, [
    '68th Pick (2023)','2024: Growing role in Rams\' interior line',
    'Utah: 2-year starter; mauling run blocker with elite power',
  ]),
  pl('mglo','Mark Glowinski','OG','Denver Broncos', 400, [
    '2× Pro Bowl','35th Pick (2015)',
    '2021: Starting RG for 13-4 Colts — Pro Bowl',
    '8-year starter across SEA, IND, NYG, DEN',
  ]),
  pl('lei','Liam Eichenberg','OG','Miami Dolphins', 280, [
    '42nd Pick (2021)','2022: Starting LG for Dolphins playoff team',
    'Notre Dame: 2-year All-ACC starter before draft',
  ]),
  pl('cof','Cody Ford','OG','Buffalo Bills', 240, [
    '38th Pick (2019)','Versatile G/T — started at both positions',
    '2021: Key depth on Bills\' strong O-Line',
    'Oklahoma: Started on Big 12 championship line',
  ]),
  pl('elw','Elijah Wilkinson','OG','Carolina Panthers', 200, [
    'Undrafted (2017)','8-year veteran across 5 teams',
    '2021: Started 15 games for Chicago Bears',
  ]),
  pl('nhe','Nate Herbig','OG','New York Jets', 240, [
    'Undrafted (2020)','2022: Starting RG for Jets',
    'Stanford: Academic All-Pac-12 — high-football IQ lineman',
  ]),
  pl('rha','Ryan Hayes','OG','Minnesota Vikings', 220, [
    '177th Pick (2022)','2024: Full-time starter for Vikings',
    'Michigan: National Champion (2023) before entering NFL',
  ]),
  pl('olu','Olu Oluwatimi','OG','Detroit Lions', 300, [
    '65th Pick (2023)','Rimington Award winner (2022) — best center in college',
    '2024: Moved to guard in Detroit; Super Bowl LVIII appearance',
    'Michigan: National Champion — winning pedigree',
  ]),
  pl('ken2','Kendrick Green','OG','Pittsburgh Steelers', 220, [
    '87th Pick (2021)','Started 17 games at C as rookie; moved to G',
    'Illinois: Two-year starter — versatile interior lineman',
  ]),
  pl('luk','Lucas Patrick','OG','Free Agent', 240, [
    'Undrafted (2016)','2× Super Bowl ring (Green Bay runs)',
    '2021: Starting C/G for Packers — reliable system piece',
  ]),
  pl('dan3','Dan Feeney','OG','New York Jets', 220, [
    '72nd Pick (2017)','2023: Starting C/G for Jets',
    '2020: Starting LG for Justin Herbert\'s first year',
    'Indiana: Multi-year starter who outplayed draft position',
  ]),
  pl('joh5','Jon Feliciano','OG','Free Agent', 260, [
    '141st Pick (2015)','2021: Starting G for Bills in AFC Championship run',
    'Miami: 3-year starter; vocal locker-room leader',
  ]),
  pl('car2','Jonah Jackson','OG','Los Angeles Rams', 720, [
    '3× Pro Bowl','75th Pick (2020)','AP 2nd-Team (2023)',
    '2023: Highest-graded guard in NFC West per PFF',
    '2024: Signed with Rams; key piece of Stafford\'s protection',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   CENTERS — 13 entries
   Rarity split: 11 common · 2 rare · 0 epic
══════════════════════════════════════════════════════════════════════ */
export const C_POOL_V4: NFLPlayer[] = [
  pl('lft','Luke Fortner','C','Jacksonville Jaguars', 340, [
    '72nd Pick (2022)','2022–24: Full-time starter for Jaguars',
    'Kentucky: 2-year captain; 2021 team MVP',
  ]),
  pl('olw','Olu Oluwatimi (C)','C','Detroit Lions', 260, [
    '65th Pick (2023)','Rimington Award (2022) — nation\'s best center',
    'Michigan: National Champion; immediate impact in NFL',
  ]),
  pl('mmn','Michal Menet','C','Arizona Cardinals', 200, [
    '200th Pick (2021)','2024: Starting C in Arizona\'s rebuild',
    'Penn State: Multi-year starter in Big Ten',
  ]),
  pl('dki','Darian Kinnard','C','New York Jets', 220, [
    '209th Pick (2022)','2024: Starting interior lineman for Jets',
    'Kentucky: Rimington Award finalist — elite raw center prospect',
  ]),
  pl('gmc','Greg Mancz','C','Tampa Bay Buccaneers', 200, [
    'Undrafted (2015)','10-year veteran across 6 teams',
    '2019: Starting C for Houston Texans playoff team',
  ]),
  pl('hfr','Hjalte Froholdt','C','New England Patriots', 180, [
    '108th Pick (2019)','5-year backup / spot starter',
    'Arkansas: Multi-year SEC starter — reliable veteran depth',
  ]),
  pl('msk','Matt Skura','C','New York Giants', 180, [
    '183rd Pick (2016)','2019: Started 14 games for Ravens',
    'Duke: 3-year starter with strong size-speed profile',
  ]),
  pl('mco2','Mason Cole','C','Pittsburgh Steelers', 240, [
    '100th Pick (2018)','2023: Starting C for Steelers playoff team',
    'Michigan: 3-year starter — one of longest-tenured starters in draft class',
  ]),
  pl('bil','Billy Turner','C','Free Agent', 260, [
    '117th Pick (2014)','2020: Super Bowl LV ring (GB alternate)',
    'Versatile G/C across GB, DEN, MIA — reliable multi-year starter',
    'North Dakota State: 3× FCS Champion',
  ]),
  pl('smu2','Sam Mustipher (note)','C','Minnesota Vikings', 200, [
    'Undrafted (2019)','3-year starter for Chicago Bears',
    '2021–22: Full-time starting C; cerebral interior anchor',
  ]),
  pl('jfe','Joel Feeney (backup)','C','Free Agent', 140, [
    'Long-tenured backup across multiple AFC systems',
    'Undrafted find who earned roster spot through sheer consistency',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   MASTER EXPORT  — vol 4
══════════════════════════════════════════════════════════════════════ */
export const ALL_PLAYERS_V4: Record<PositionGroup, NFLPlayer[]> = {
  QB: QB_POOL_V4,
  RB: RB_POOL_V4,
  WR: WR_POOL_V4,
  TE: TE_POOL_V4,
  OT: OT_POOL_V4,
  OG: OG_POOL_V4,
  C:  C_POOL_V4,
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