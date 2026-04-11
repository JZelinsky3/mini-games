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
   WIDE RECEIVERS — 24 entries  |  15 common · 7 rare · 2 epic
══════════════════════════════════════════════════════════════════════ */
export const WR_POOL_V1: NFLPlayer[] = [
  pl('hro', 'Hollywood Brown',     'WR', 'Kansas City Chiefs',    640, [
    'Pro Bowl 2019 (alternate)', '25th Pick 2019',
    '2019 (BAL): 1,008 yards — first 1,000-yard season in Ravens franchise history',
    '2022 (ARI): 1,361 yards — career high',
  ]),
  pl('ram', 'Randall Cobb',        'WR', 'Green Bay Packers',     580, [
    '2× Pro Bowl', '64th Pick 2011',
    '2014: 1,287 yards, 12 TDs — career peak with Aaron Rodgers',
    '12-year veteran; 3× 1,000-yard seasons',
  ]),
  pl('sba2','Sterling Shepard',    'WR', 'Free Agent',            340, [
    'Pro Bowl 2021 (alternate)', '40th Pick 2016',
    '2019: 576 yards — efficient slot receiver in Giants system',
    '8-year veteran; fought back from 2 torn ACLs',
  ]),
  pl('thox','T.Y. Hilton',          'WR', 'Free Agent',            820, [
    '3× Pro Bowl', 'AP 2nd-Team 2016',
    '2016: 1,448 yards — led NFL; speed threat against any coverage',
    '6× 1,000-yard seasons across 11-year career',
  ]),
  pl('dmo2x','Donovan Peoples-Jones','WR','Cleveland Browns',      480, [
    '169th Pick 2020', '2022: 839 yards — became WR1 for Browns',
    'Michigan: 2018 Big Ten freshman of the year',
  ]),
  pl('csa', 'Chris Godwin Jr.',        'WR', 'Tampa Bay Buccaneers',   960, [
    '3× Pro Bowl', '84th Pick 2017',
    '2019: 1,333 yards, 9 TDs — Super Bowl LV Champion',
    'Comeback from torn ACL — 2022: 1,103 yards recovery season',
  ]),
  pl('wfu', 'Will Fuller V',       'WR', 'Free Agent',            580, [
    '21st Pick 2016', 'Pro Bowl 2020 (alternate)',
    '2020: 879 yards, 8 TDs in 11 games — electric when healthy',
    '2016 (HOU): First 500+ yards in his career season as a rookie',
  ]),
  pl('vsh', 'Van Jefferson',       'WR', 'Los Angeles Rams',      360, [
    '57th Pick 2020', 'Super Bowl LVI Champion',
    '2021: 802 yards as Rams\' WR2 in championship season',
    'Florida: 4-year starter — reliable route runner',
  ]),
  pl('hig2x','Hunter Renfrow',      'WR', 'Las Vegas Raiders',     660, [
    '149th Pick 2019', '2× Pro Bowl',
    '2021: 1,038 yards — led Raiders in receptions (103)',
    'Clemson: 2× National Champion — slot master',
  ]),
  pl('ken3','Kendall Hinton',      'WR', 'Denver Broncos',        240, [
    '152nd Pick 2020', '2022: 421 yards in Broncos\' lean year',
    '2020: Emergency QB start — one of NFL\'s stranger game logs',
  ]),
  pl('kbi', 'Kalif Raymond',       'WR', 'Detroit Lions',         280, [
    'Undrafted 2017', 'Super Bowl LVIII Appearance',
    '2021 (DET): 500+ yards + elite special teams contributions',
    '5.4 kick return average — one of best returners in AFC',
  ]),
  pl('kwa2','KJ Hamler',           'WR', 'Denver Broncos',        260, [
    '46th Pick 2020', '2022: 321 yards on comeback from ACL',
    'Penn State: Blazing deep threat — 4.28 combine time',
  ]),
  pl('jje2','JuJu Smith-Schuster', 'WR', 'Free Agent',            1680, [
    '2× Pro Bowl', 'AP 2nd-Team 2018',
    '2018: 1,426 yards — one of the best slot WR seasons ever',
    'Super Bowl LVII ring (KC)',
    '2022 (KC): 933 yards — key contributor in Chiefs championship run',
  ]),
  pl('cmo2','Cole Beasley',        'WR', 'Free Agent',            540, [
    'Pro Bowl 2021 (alternate)', 'Undrafted 2012',
    '2020 (BUF): 967 yards — 6 seasons as elite slot weapon',
    'Super Bowl LII Runner-up',
  ]),
  pl('thi2','Tyler Boyd',          'WR', 'Tennessee Titans',      760, [
    '2× Pro Bowl', '55th Pick 2016',
    '2018: 1,028 yards — Super Bowl LVI appearance 2022',
    '8-year Bengals veteran; reliable slot presence',
  ]),
  pl('mha','Michael Gallup',       'WR', 'Free Agent',            480, [
    'Pro Bowl 2022 (alternate)', '81st Pick 2018',
    '2019: 1,107 yards for Cowboys — first 1,000-yard season',
    '2021: ACL tear; came back to post 424 yards in 11 games',
  ]),
  pl('crox','Christian Kirk',       'WR', 'Jacksonville Jaguars',  640, [
    'Pro Bowl 2022 (alternate)', '47th Pick 2018',
    '2022: 1,108 yards, 8 TDs — set career bests in year 1 with Jaguars',
  ]),
  pl('ava','Allen Lazard',         'WR', 'New York Jets',         420, [
    'Undrafted 2018', '2022 (GB): 788 yards, 6 TDs — Rodgers\' trusted slot',
    '2021: Super Bowl LVI appearance (GB)',
    'IOWA State: 2-year starter — reliable hands in tough weather',
  ]),
  pl('bwi','Breshad Perriman',     'WR', 'Free Agent',            300, [
    '26th Pick 2015', '2019 (TB): 645 yards + 6 TDs in 8 games',
    'UCF: 2014 American Athletic Conference champion',
  ]),
  pl('rma','Rondale Moore',        'WR', 'Atlanta Falcons',       360, [
    '49th Pick 2021', '2024: Resurgence in ATL after Arizona stint',
    'Purdue: 2018 Biletnikoff Award finalist — electric with ball in hands',
  ]),
  pl('lwo','Lynn Bowden Jr.',      'WR', 'Free Agent',            200, [
    '80th Pick 2020', 'Kentucky: Played QB, RB, and WR — true Swiss Army knife',
    '2021: Versatile gadget piece across LV and MIA',
  ]),
  pl('aad', 'Alec Pierce',         'WR', 'Indianapolis Colts',    320, [
    '53rd Pick 2022', '2023: 592 yards in developing WR2 role',
    'Cincinnati: 2022 AAC First-Team — deep threat with 4.41 speed',
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
  pl('jam', 'Jamison Crowder',    'WR', 'Free Agent',               380, [
    '105th Pick 2015', '2020 (NYJ): 699 yards, 6 TDs despite limited QB play',
    'Slot specialist — 500+ career receptions across 9 seasons',
  ]),
  pl('cla','Corey Davis',         'WR', 'Free Agent',               380, [
    '5th Overall Pick 2017', '2020 (TEN): 984 yards, 5 TDs',
    'Western Michigan: First-ever first-round WR from the program',
  ]),
  pl('jal', 'Jalen Tolbert',      'WR', 'Dallas Cowboys',           260, [
    '89th Pick 2022', '2024: Growing role in Cowboys offense',
    'South Alabama: 1,474 yards in final college season',
  ]),
  pl('rmo2','Romeo Doubs',        'WR', 'Green Bay Packers',        440, [
    '132nd Pick 2022', '2024: 744 yards as Love\'s #1 receiver',
    'Nevada: 1,000+ yards in back-to-back seasons',
  ]),
  pl('dsa2','Dontayvion Wicks',   'WR', 'Green Bay Packers',        320, [
    '159th Pick 2023', '2024: Depth piece with growing rapport with Love',
    'Virginia: 3-year starter — underrated route runner',
  ]),
  pl('tnx', 'Tutu Atwell',        'WR', 'Los Angeles Rams',         280, [
    '57th Pick 2021', '2024: Breakout slot role with Stafford',
    'Louisville: 5.88 time in 3-cone drill — among fastest WRs in 2021 class',
  ]),
  pl('twa', 'Trent Sherfield',    'WR', 'Free Agent',               220, [
    '239th Pick 2018', '2021 (MIA): 4 TDs in limited role',
    '7-season veteran — reliable special teams ace + depth WR',
  ]),
  pl('cwr', 'Curtis Samuel',      'WR', 'Buffalo Bills',            500, [
    'Pro Bowl (alternate) 2020', '40th Pick 2017',
    '2020 (CAR): 851 scrimmage yards — dynamic after catch',
    'Ohio State: First 1,000-yard receiver in Buckeye history (2016)',
  ]),
  pl('pgu', 'Parris Campbell',    'WR', 'Free Agent',               280, [
    '59th Pick 2019', '2022 (IND): Career-best 623 yards finally healthy',
    'Ohio State: Blazing 4.31 combine speed',
  ]),
  pl('tre3','Treylon Burks',      'WR', 'Tennessee Titans',         360, [
    '18th Pick 2022', '2023: 524 yards — first healthy full stretch',
    'Arkansas: 1,104 yards 2021 — won over scouts with YAC ability',
  ]),
  pl('jwo', 'Jalen Wayne',        'WR', 'Las Vegas Raiders',        200, [
    'Undrafted 2023', '2024: Competed for starting role in Raiders system',
    'South Alabama: 2022 Sun Belt leading receiver',
  ]),
  pl('zfl', 'Zay Flowers',        'WR', 'Baltimore Ravens',         760, [
    '22nd Pick 2023', '2× Pro Bowl',
    '2023: 858 yards as rookie; 47.8% of team\'s targets — instant starter',
    '2023 AFC Wild Card: 102 rec yards in OT thriller',
    '2024: 903 yards, 7 TDs — breakout sophomore season',
  ]),
  pl('qjn', 'Quentin Johnston',   'WR', 'Los Angeles Chargers',     380, [
    '21st Pick 2023', '2024: Emerging as Herbert\'s WR1',
    'TCU: 2022 Big 12 Championship run — 837 yards, 6 TDs',
  ]),
  pl('bna', 'Brian Thomas Jr.',   'WR', 'Jacksonville Jaguars',     620, [
    '23rd Pick 2024', '2024: 1,282 yards — elite rookie season (4th all-time by a WR)',
    'LSU: 2023 SEC leading receiver — 1,177 yards, 17 TDs',
  ]),
  pl('lmu', 'Luke Musgrave',      'WR', 'Green Bay Packers',        220, [
    'Note: TE by position but listed here for flex role',
    'Oregon State: 3-year starter — athletic mismatch',
  ]),
  pl('rwo', 'Rashee Rice',        'WR', 'Kansas City Chiefs',       820, [
    '55th Pick 2023', '2023: 938 yards — immediate starter for Chiefs',
    '2× Super Bowl Champion (LVII, LVIII)',
    'SMU: 2-year All-American — 110 receptions in final season',
  ]),
  pl('xhx', 'Xavier Hutchinson',  'WR', 'Houston Texans',           240, [
    'Undrafted 2023', '2024: Depth piece for Texans playoff roster',
    'Iowa State: 2022 Big 12 leading receiver — 107 receptions',
  ]),
  pl('acu', 'Anthony Schwartz',   'WR', 'Free Agent',               180, [
    '91st Pick 2021', 'Auburn: Fastest WR in 2021 class — 4.26 combine',
    'Developing receiver with elite speed upside',
  ]),
  pl('jsa','Josh Palmer',         'WR', 'Los Angeles Chargers',     340, [
    '77th Pick 2021', '2023: 628 yards as Herbert\'s depth option',
    'Tennessee: 2-year starter — precise route runner in short-to-mid range',
  ]),
  pl('aca','Adam Thielen',        'WR', 'Carolina Panthers',        1640, [
    '3× Pro Bowl', 'AP 1st-Team 2018',
    '2018: 1,373 yards — led NFL in receiving TDs (14)',
    '2017–18: 2 consecutive 1,000-yard seasons as UDFA gem',
  ]),
  pl('sam','Deebo Samuel','WR','San Francisco 49ers', 960, [
    '2× Pro Bowl','2021: 1,405 yards + 8 rush TDs — "wide receiver / RB hybrid"',
    '2022 Super Bowl appearance',
  ]),
  pl('all2','Keenan Allen','WR','Chicago Bears', 1380, [
    '5× Pro Bowl','AP 2nd-Team',
    '1,000+ yards in 7 seasons','2022: 108 catches at age 30',
  ]),
  pl('aiy','Brandon Aiyuk','WR','San Francisco 49ers', 780, [
    'Pro Bowl','AP 2nd-Team (2023)','2023: 1,342 yards, 7 TDs',
    'Super Bowl LVIII appearance',
  ]),
  pl('jeu','Jerry Jeudy','WR','Cleveland Browns', 280, [
    '15th Pick (2020)','2023: 1,000+ receiving yards (first of career)',
  ]),
  pl('mcl','Rashod Bateman','WR','Baltimore Ravens', 160, [
    '27th Pick (2021)','Injury-limited career — showed promise in 2022',
  ]),
  pl('odz','Rome Odunze','WR','Chicago Bears', 680, [
'9th Overall Pick (2024)','Biletnikoff Award winner (2023)',
'2025: Strong sophomore growth alongside Caleb Williams — emerging deep threat',
'Long-term cornerstone of Bears\' young offense with elite size/speed combo'
]),
pl('nac','Puka Nacua','WR','Los Angeles Rams', 2150, [
'2× Pro Bowl','AP 1st-Team All-Pro (2025)',
'2025: 129 catches, 1,715 yards, 10 TDs in 16 games — led NFL in receptions',
'2023 rookie record: 105 catches — one of the greatest WR starts in NFL history',
'Undrafted/late-round gem (5th round) turned superstar'
]),
pl('lon','Drake London','WR','Atlanta Falcons', 980, [
'8th Overall Pick (2022)','Multiple 1,000-yard seasons',
'Consistent alpha WR for Falcons — strong target share and red-zone presence',
'2025: Reliable 1,000+ yard contributor despite QB changes'
]),
pl('add','Jordan Addison','WR','Minnesota Vikings', 720, [
'23rd Pick (2023)','Biletnikoff Award winner (college)',
'2023 rookie: 911 yards, 10 TDs','Solid complementary piece next to Justin Jefferson'
]),
pl('hig','Tee Higgins','WR','Cincinnati Bengals', 940, [
'Multiple Pro Bowl consideration','4× 1,000-yard seasons',
'Big-bodied red-zone threat — key piece in Bengals\' high-powered offense',
'Super Bowl LVI appearance'
]),
pl('ter','Terry McLaurin','WR','Washington Commanders', 880, [
'Multiple Pro Bowl selections','6× 1,000-yard seasons (in varying QB situations)',
'2020: 1,118 yards — most ever by a Commanders WR in first 2 seasons combined',
'Franchise leader and consistent deep threat'
]),
pl('coo3','Amari Cooper','WR','Cleveland Browns', 980, [
'4× Pro Bowl','5× 1,000-yard seasons',
'Super Bowl LIII ring (Patriots)','Veteran alpha with reliable production'
]),
pl('std','Amon-Ra St. Brown','WR','Detroit Lions', 1680, [
'4× Pro Bowl','2025: 117 catches, 1,401 yards, 11 TDs',
'Multiple 100+ catch seasons — slot superstar and chain-mover',
'Most catches by a WR in first 16 games (record)'
]),
pl('wad','Jaylen Waddle','WR','Miami Dolphins', 820, [
'Multiple Pro Bowl selections','2021: 104 catches — most by a rookie WR at the time',
'Combine 40-yard dash: 4.37 (elite speed)','Explosive deep threat in Dolphins\' offense'
]),
pl('wil2','Garrett Wilson','WR','New York Jets', 680, [
'Multiple Pro Bowl selections','2022 OROTY','10th Pick (2022)',
'2023: 95 catches, 1,042 yards despite poor QB play','Talented young WR battling inconsistency'
]),
pl('EvO','Mike Evans','WR','Tampa Bay Buccaneers / Free Agent', 1980, [
'7× Pro Bowl','AP All-Pro honors','Super Bowl LV Champion',
'10+ consecutive 1,000-yard seasons (NFL record streak to open career)',
'9th Pick (2014) — all-time consistent red-zone monster'
]),
pl('hil','Tyreek Hill','WR','Miami Dolphins', 3120, [
'8× Pro Bowl','Multiple AP 1st-Team All-Pro','Super Bowl LIV Champion',
'2022: 1,799 receiving yards — single-season record',
'Fastest 40 time (4.29) ever by a WR at the Combine — pure speed demon'
]),
pl('jef','Justin Jefferson','WR','Minnesota Vikings', 2980, [
'5× Pro Bowl','Multiple AP 1st-Team All-Pro','2022 Offensive Player of the Year',
'2020 OROTY','2022: 1,809 yards — NFL single-season record at the time',
'Elite route-runner with generational talent'
]),
pl('kup','Cooper Kupp','WR','Los Angeles Rams', 2720, [
'Multiple Pro Bowl','Multiple AP 1st-Team All-Pro','2021 Offensive Player of the Year',
'Super Bowl LVI Champion & Super Bowl MVP','2021 Receiving Triple Crown',
'2021: 1,947 yards — one of the greatest single seasons ever'
]),
pl('ada','Davante Adams','WR','Las Vegas Raiders', 2560, [
'6× Pro Bowl','Multiple AP 1st-Team All-Pro',
'Multiple 1,000-yard + high-TD seasons','2020: 18 TDs — tied franchise record',
'Elite route technician and red-zone weapon'
]),
pl('cdl','CeeDee Lamb','WR','Dallas Cowboys', 2180, [
'Multiple Pro Bowl','AP 1st-Team All-Pro consideration',
'Multiple 1,000+ yard and 100+ catch seasons','High-volume alpha for Cowboys'
]),
pl('hop','DeAndre Hopkins','WR','Tennessee Titans', 2040, [
'Multiple Pro Bowl','Multiple AP 1st-Team All-Pro',
'No drops in entire 2018 regular season','Consistent 1,000-yard producer',
'One of the most reliable hands in NFL history'
]),
pl('dig','Stefon Diggs','WR','Houston Texans', 1820, [
'Multiple Pro Bowl','AP All-Pro honors','Minneapolis Miracle (2018)',
'Multiple 1,500-yard type seasons','Elite separator and playmaker'
]),
pl('chs','Ja\'Marr Chase','WR','Cincinnati Bengals', 1980, [
'Multiple Pro Bowl','2021 OROTY','AP All-Pro honors',
'2021: 1,455 yards — most by a WR in debut season',
'Super Bowl LVI appearance as rookie — explosive big-play threat'
]),
pl('bro','A.J. Brown','WR','Philadelphia Eagles', 1720, [
'Multiple Pro Bowl','AP 1st-Team All-Pro (2022)',
'Multiple 1,000-yard + high-yardage seasons','Physical deep-ball and YAC monster'
]),
pl('met','D.K. Metcalf','WR','Pittsburgh Steelers', 1280, [
'Multiple Pro Bowl','Multiple 1,000-yard seasons',
'Fastest WR in NFL per Next Gen Stats (elite top speed)',
'Big-bodied contested-catch specialist'
]),
pl('jre3','Jaxon Smith-Njigba','WR','Seattle Seahawks', 1940, [
'20th Pick (2023)','2025: 1,793 receiving yards, 10 TDs — led NFL in yards',
'Ohio State: 2021 Rose Bowl MVP (347 yards — Big Ten bowl record)',
'Breakout superstar season with elite production'
]),
  pl('mtp','Michael Pittman Jr.','WR','Indianapolis Colts', 740, [
    '3× Pro Bowl','34th Pick (2020)',
    '2023: 1,152 yards — franchise WR record','3× 1,000-yard seasons',
    'Anthony Richardson\'s go-to target; elite contested-catch WR',
  ]),
  pl('sut','Courtland Sutton','WR','Denver Broncos', 620, [
    '2× Pro Bowl','40th Pick (2018)',
    '2022: 1,000+ yards with Russell Wilson',
    '2019: 1,112 yards despite weak QB play — elite 50-50 ball winner',
  ]),
  pl('dmo','DJ Moore','WR','Chicago Bears', 860, [
    '3× Pro Bowl','24th Pick (2018)',
    '2022: 1,046 yards (3rd straight 1,000-yard season)','AP 2nd-Team (2022)',
    'One of only 3 WRs with 1,000+ yards in 5 of first 6 seasons',
  ]),
  pl('ksh','Khalil Shakir','WR','Buffalo Bills', 460, [
    '2× Pro Bowl','148th Pick (2022)',
    '2024: 1,000+ yards as Allen\'s primary slot weapon',
    'One of the fastest slot receivers in the NFL (per Next Gen Stats)',
  ]),
  pl('ndl','Tank Dell','WR','Houston Texans', 400, [
    'Pro Bowl (2023)','69th Pick (2023)',
    '2023: 709 yards as rookie — CJ Stroud\'s favorite target',
    'Nicknamed "Tank" — undersized but relentless competitor',
  ]),
  pl('dmo2','Darnell Mooney','WR','Atlanta Falcons', 420, [
    'Pro Bowl (2023)','171st Pick (2020)',
    '2023: 1,074 yards — career high','2021: 1,055 yards for Bears',
    'Three 1,000-yard seasons — consistent despite QB carousel',
  ]),
  pl('jme','Jakobi Meyers','WR','Las Vegas Raiders', 460, [
    '2× Pro Bowl','Undrafted (2019)',
    '2022: 804 yards — Patriots\'s top target without elite QB',
    '2023: 1,050 yards for Raiders — first 1,000-yard season career',
  ]),
  pl('rpe','Ricky Pearsall','WR','San Francisco 49ers', 200, [
    '31st Pick (2024)','Shot in robbery before season began — returned same year',
    '2024: Showed elite traits as WR2 next to Aiyuk',
    '2023 (Florida): 965 yards, 7 TDs — AP 1st-Team All-SEC',
  ]),
  pl('ami','Adonai Mitchell','WR','Indianapolis Colts', 220, [
    '52nd Pick (2024)','2024: 800+ yards as Pittman\'s complement',
    '2023 (Texas): 845 yards, 11 TDs — Big 12 standout',
  ]),
  pl('lmc','Luke McCaffrey','WR','Washington Commanders', 240, [
    '73rd Pick (2024)','2024: Playmaking slot WR in Commanders\' playoff offense',
    'Son of Ed McCaffrey; brother of Christian — bloodline receiver',
  ]),
  pl('jdo','Josh Downs','WR','Indianapolis Colts', 320, [
    'Pro Bowl (2024)','79th Pick (2023)',
    '2024: 1,010 yards — emergence as Richardson\'s top target',
    'Slot wizard — 91.4% catch rate on short routes (2024)',
  ]),
  pl('dwi','Dontayvion Wicks','WR','Green Bay Packers', 260, [
    '159th Pick (2023)','2024: 680 yards, 6 TDs — key piece of Packers offense',
    '2023 (Virginia): 1,011 yards — ACC Receiver of the Year',
  ]),
  pl('xhu','Xavier Hutchinson','WR','Houston Texans', 220, [
    'Undrafted (2023)','2024: Reliable WR3 for Stroud — 600+ yards',
    '2022 (Iowa State): 1,171 yards, 8 TDs — led Big 12',
  ]),
  pl('jml','Jalen McMillan','WR','Tampa Bay Buccaneers', 200, [
    '71st Pick (2024)','2024: Ascended as Buccaneers WR2',
    '2023 (Washington): 915 yards, 9 TDs — elite route runner',
  ]),
  pl('tua2','Tutu Atwell','WR','Los Angeles Rams', 320, [
    'Pro Bowl special teams / depth (2023)','57th Pick (2021)',
    '2023: 658 yards, 6 TDs — explosive speed WR',
    'Fastest WR on Rams roster — 4.32 combine, big-play threat',
  ]),
  pl('mco','Malachi Corley','WR','New York Jets', 180, [
    '65th Pick (2024)','Yards-after-catch specialist — college record YAC',
    '2024: Immediate depth piece for Jets; physical slot runner',
  ]),
  pl('hme','Hunter Renfrow','WR','Las Vegas Raiders', 340, [
    '2× Pro Bowl','149th Pick (2019)',
    '2021: 103 catches, 1,038 yards — led Raiders in both categories',
    'Super Bowl LV appearance; West Virginia underdog story',
  ]),
  pl('tpa','Tim Patrick','WR','Denver Broncos', 280, [
    'Pro Bowl (2021 honorable)','Undrafted (2017)',
    '2021: 734 yards — reliable WR2 before torn ACL in 2022',
    '2024: Returned from two ACL tears — comeback story',
  ]),
  pl('bco2','Brandin Cooks','WR','Dallas Cowboys', 860, [
    '4× Pro Bowl','20th Pick (2014)',
    '2022: 1,037 yards — 7th consecutive 1,000-yard season',
    '7 consecutive 1,000-yard seasons (2015–2022) — 4th most ever',
  ]),
  pl('jpal','Ja\'Lynn Polk','WR','New England Patriots', 180, [
    '37th Pick (2024)','2024: Developing WR2 for Drake Maye',
    '2023 (Washington): 1,159 yards — Pac-12 standout',
  ]),
  pl('pca','Parris Campbell','WR','New York Giants', 200, [
    '59th Pick (2019)','2022: 623 yards — injury-plagued yet productive',
    'One of the fastest WRs in NFL (4.31 combine)',
  ]),
  pl('str2','Sterling Shepard','WR','Tampa Bay Buccaneers', 320, [
    '40th Pick (2016)','6× 500+ yard seasons for NYG',
    '2018: Pro Bowl consideration — 872 yards, 6 TDs',
    'Reliable veteran depth piece across career',
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