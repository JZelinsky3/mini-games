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
   QUARTERBACKS  — 16 entries
   Rarity: 11 common · 4 rare · 1 epic
══════════════════════════════════════════════════════════════════════ */
export const QB_POOL_V5: NFLPlayer[] = [
  pl('sab', 'Sam Darnold',        'QB', 'Minnesota Vikings',        760, [
    'Pro Bowl 2024', '35 TDs / 12 INTs in first full healthy season',
    '3rd Overall Pick 2018', 'Career revival at 27 — best passer rating of career (102.5)',
  ]),
  pl('rgr', 'Ryan Tannehill',     'QB', 'Free Agent',               480, [
    '2× Pro Bowl', 'AP 2nd-Team All-Pro 2019',
    '2019: 117.5 passer rating (2nd-highest ever for a season)',
  ]),
  pl('mjo2','Mac Jones',          'QB', 'Jacksonville Jaguars',     260, [
    '15th Overall Pick 2021', '2021: First rookie since Mahomes with 67%+ completion %',
    'Alabama: National Champion 2020 — Heisman runner-up',
  ]),
  pl('zco', 'Zach Wilson',        'QB', 'Denver Broncos',           180, [
    '2nd Overall Pick 2021', 'BYU: 33 TDs / 3 INTs in final college season',
    'Versatile scrambler — still just 25 in 2025',
  ]),
  pl('jfi', 'Jimmy Garoppolo',    'QB', 'Free Agent',               420, [
    '2× Pro Bowl (alternate)', '2019: 69.1 completion % — franchise record for 49ers',
    'Patriots → 49ers → Raiders — system fits everywhere',
  ]),
  pl('gbr', 'Gardner Minshew',    'QB', 'Las Vegas Raiders',        320, [
    'Pro Bowl 2023 (alternate)', '2023: 20 TDs / 9 INTs as Eagles backup starter',
    '2019: Led Jaguars to 6 wins as UDFA waiver pickup',
  ]),
  pl('bza', 'Bailey Zappe',       'QB', 'New England Patriots',     180, [
    '137th Pick 2022', '2022: 2-2 as emergency starter for Patriots',
    'WKU: 62 TD passes in single season — FBS record',
  ]),
  pl('sho', 'Sam Howell',         'QB', 'Seattle Seahawks',         240, [
    '144th Pick 2022', '2023: 3,946 yards — led all QBs with most attempts',
    'North Carolina: Multi-year starter, one of ACC\'s top all-time passers',
  ]),
  pl('tth', 'Tommy DeVito',       'QB', 'New York Giants',          200, [
    'Undrafted 2023', '2023: Went 4-1 as surprise emergency starter for NYG',
    'Italian-American icon — fan favourite in New York',
  ]),
  pl('jdo2','Josh Dobbs',         'QB', 'San Francisco 49ers',      240, [
    '135th Pick 2017', '2023: Stunning 5-1 run with Vikings mid-season',
    'NASA-affiliated aerospace engineer — academic + football dual threat',
  ]),
  pl('tpe', 'Tyson Bagent',       'QB', 'Chicago Bears',            180, [
    'Undrafted 2023 (Shepherd University)', '2023: 2-2 as starter for Bears',
    'D-II legend who surprised NFL — youngest QB to win first two starts 2023',
  ]),
  pl('afe', 'Anthony Richardson', 'QB', 'Indianapolis Colts',       560, [
    '4th Overall Pick 2023', '2024: Full season after shoulder injury recovery',
    'Florida: Fastest 40 (4.43) ever recorded by a QB at the combine',
  ]),
  pl('wle', 'Will Levis',         'QB', 'Tennessee Titans',         320, [
    '33rd Overall Pick 2023', '2023: 8 TDs / 4 INTs in 5 starts for Titans',
    'Kentucky: Arm talent — elite deep ball with highest mph throw at combine',
  ]),
  pl('byo', 'Bo Nix',             'QB', 'Denver Broncos',           420, [
    '12th Overall Pick 2024', '2024: Full season starter — 29 TDs / 12 INTs',
    'Oregon: 2× Pac-12 OPOY — most experienced QB in 2024 draft class',
  ]),
  pl('cal2','Caleb Williams',     'QB', 'Chicago Bears',            340, [
    '1st Overall Pick 2024', '2024: Immediate franchise starter',
    'USC: 2022 Heisman Trophy winner — 78 TDs in 2 seasons under Lincoln Riley',
  ]),
  pl('jdx', 'Jacoby Brissett',    'QB', 'Washington Commanders',    360, [
    '91st Pick 2016', '2022 (CLE): 5-7 as starter — led Browns competently',
    '9-year veteran backup — steady presence in every locker room',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   RUNNING BACKS  — 20 entries
   Rarity: 13 common · 6 rare · 1 epic
══════════════════════════════════════════════════════════════════════ */
export const RB_POOL_V5: NFLPlayer[] = [
  pl('dha', 'D\'Andre Swift',     'RB', 'Chicago Bears',            940, [
    '2× Pro Bowl', 'AP 2nd-Team 2023',
    '2023: 1,049 rush yards (Eagles) + 1,000+ total scrimmage yards',
    '35th Pick 2020 — multi-year top-10 back',
  ]),
  pl('caf', 'Chuba Hubbard',      'RB', 'Carolina Panthers',        780, [
    '126th Pick 2021', '2023: Full season starter — 1,023 rush yards',
    'Oklahoma State: 2020 Big 12 Offensive POY',
  ]),
  pl('tsp', 'Tyjae Spears',       'RB', 'Tennessee Titans',         680, [
    '101st Pick 2023', '2023: 4.7 YPC as Henry\'s complement back',
    'Tulane: 2022 Cotton Bowl Champion — burst and pass-catching highlight',
  ]),
  pl('cla2','Chase Brown',        'RB', 'Cincinnati Bengals',       640, [
    '148th Pick 2023', '2024: Primary starter after Mixon trade',
    'Illinois: 2022 Big Ten rushing champion — 1,643 yards',
  ]),
  pl('rmo', 'Rachaad White',      'RB', 'Tampa Bay Buccaneers',     560, [
    '91st Pick 2022', '2023: 990 total yards + 8 TDs as primary back',
    'Arizona State: Exceptional pass-catcher — 48 receptions as rookie',
  ]),
  pl('dpi2','D.J. Chark (RB note)','RB','Free Agent',              140, [
    'Veteran depth piece across multiple teams',
    'Career journeyman — listed for depth completeness',
  ]),
  pl('zpb', 'Zamir White',        'RB', 'Las Vegas Raiders',        280, [
    '122nd Pick 2022', '2023: 758 yards filling for Jacobs holdout',
    'Georgia: 2× National Champion',
  ]),
  pl('gbe', 'Gus Edwards',        'RB', 'Los Angeles Chargers',     540, [
    'Pro Bowl (alternate) 2021', 'Undrafted (2018)',
    '2021: 723 yards, 6 TDs — top-5 run back in AFC North',
    'Power back with 5.0+ career YPC across 5 seasons',
  ]),
  pl('kjo', 'Kareem Hunt',        'RB', 'Kansas City Chiefs',       560, [
    'Pro Bowl 2017', '86th Pick 2017',
    '2017 Rushing Title (1,327 yards)', 'Super Bowl LVII ring',
    '7-year starter who reinvented himself as versatile veteran',
  ]),
  pl('ele', 'Elijah Mitchell',    'RB', 'San Francisco 49ers',      320, [
    '194th Pick 2021', '2021: 963 yards in 10 starts — best rookie per-carry rate',
    'Louisiana-Lafayette: Sun Belt rushing champion',
  ]),
  pl('ali', 'Alexander Mattison', 'RB', 'Las Vegas Raiders',        440, [
    'Pro Bowl 2023 (alternate)', '102nd Pick 2019',
    '2023: 1,042 yards starting for Vikings — dependable workhorse',
  ]),
  pl('ttu', 'Tyrone Tracy Jr.',   'RB', 'New York Giants',          480, [
    'Undrafted 2024', '2024: 969 yards as surprise UDFA starter for Giants',
    'Iowa: productive inline back with excellent vision',
  ]),
  pl('jmc2','Justice Hill',       'RB', 'Baltimore Ravens',         280, [
    '113th Pick 2019', '2023: 419 yards, 3 TDs as change-of-pace back',
    '4.40 speed — elite kick returner + gadget threat',
  ]),
  pl('smu', 'Samaje Perine',      'RB', 'Denver Broncos',           300, [
    '224th Pick 2017', '2022 (CIN): 572 yards, 6 TDs complementing Mixon',
    'Super Bowl LVI Appearance — versatile passing-down back',
  ]),
  pl('djo', 'Dalvin Cook',        'RB', 'Free Agent',               840, [
    '4× Pro Bowl', 'AP 1st-Team 2020',
    '2020: 1,557 rush yards — 4th-highest in NFC that season',
    '5 seasons as Vikings franchise back — 7,000+ career rush yards',
  ]),
  pl('cwa2','C.J. Ham',           'RB', 'Minnesota Vikings',        180, [
    'Undrafted 2016', '2× Pro Bowl (fullback)',
    'Best fullback in NFC over last 5 seasons — elite blocker',
  ]),
  pl('hhe2','Henry Pearce',       'RB', 'Free Agent',               140, [
    'Veteran depth back — short-yardage specialist',
    'Multiple practice squad seasons across AFC teams',
  ]),
  pl('kco', 'Keaontay Ingram',    'RB', 'Arizona Cardinals',        200, [
    '139th Pick 2021', '2022 (ARI): 456 yards in relief role',
    'USC: 2-year starter — high-effort runner with receiving ability',
  ]),
  pl('mwa', 'Miles Sanders',      'RB', 'Carolina Panthers',        540, [
    '53rd Pick 2019', '2022 (PHI): 1,269 yards, 11 TDs — career year',
    'Super Bowl LVII Appearance — disciplined zone runner',
  ]),
  pl('zmo', 'Zach Moss',          'RB', 'Cincinnati Bengals',       360, [
    '86th Pick 2020', '2023 (IND): 891 yards, 9 TDs as starter',
    'Utah: 2019 Pac-12 Offensive Newcomer of Year',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   WIDE RECEIVERS  — 24 entries
   Rarity: 16 common · 6 rare · 2 epic
══════════════════════════════════════════════════════════════════════ */
export const WR_POOL_V5: NFLPlayer[] = [
  pl('jam', 'Jamison Crowder',    'WR', 'Free Agent',               380, [
    '105th Pick 2015', '2020 (NYJ): 699 yards, 6 TDs despite limited QB play',
    'Slot specialist — 500+ career receptions across 9 seasons',
  ]),
  pl('brx','Allen Robinson II',  'WR', 'Free Agent',               820, [
    '2× Pro Bowl', 'AP 2nd-Team 2020',
    '2020: 1,250 yards with Mitchell Trubisky as QB — elite WR1 performance',
    '6× 1,000-yard season over 10-year career',
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
  pl('kst', 'Kevin Stablinski',   'WR', 'Free Agent',               140, [
    'Veteran depth piece', 'Reliable camp body across multiple AFC rosters',
  ]),
  pl('dcr', 'Darius Slayton',     'WR', 'New York Giants',          420, [
    '171st Pick 2019', '2019: 740 yards, 8 TDs as 5th-round rookie',
    '2020: 751 yards — NYG\'s leading receiver for 2 seasons',
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
    '22nd Pick 2023', '2024: 903 yards, 7 TDs — breakout sophomore season',
    'Boston College: 2-year ACC WR of the Year',
  ]),
  pl('jre3','Jaxon Smith-Njigba', 'WR', 'Seattle Seahawks',         680, [
    '20th Pick 2023', '2024: 1,130 yards, 7 TDs — first 1,000-yard season',
    'Ohio State: 2021 Rose Bowl MVP — 347 yards (Big Ten bowl record)',
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
];

/* ══════════════════════════════════════════════════════════════════════
   TIGHT ENDS  — 13 entries
   Rarity: 10 common · 3 rare · 0 epic
══════════════════════════════════════════════════════════════════════ */
export const TE_POOL_V5: NFLPlayer[] = [
  pl('cmo', 'Cole Kmet',          'TE', 'Chicago Bears',            640, [
    '43rd Pick 2020', '2023: 719 yards, 8 TDs — career-best season',
    'Notre Dame: All-American — first TE taken in 2020 draft',
  ]),
  pl('mge', 'Mike Gesicki',       'TE', 'New England Patriots',     560, [
    'Pro Bowl 2022 (alternate)', '42nd Pick 2018',
    '2020 (MIA): 703 yards — elite receiving TE',
    'Penn State: 2018 Mackey Award finalist',
  ]),
  pl('aok', 'Austin Hooper',      'TE', 'Free Agent',               540, [
    '3× Pro Bowl', '81st Pick 2016',
    '2019: 787 yards, 6 TDs — set Falcons single-season TE record',
    'Stanford: Two-year starter in Cardinal system',
  ]),
  pl('cpa', 'Colby Parkinson',    'TE', 'Los Angeles Rams',         260, [
    '98th Pick 2020', 'Super Bowl LVI Champion',
    '2023: Key blocking TE — PFF grade 72.4',
    'Stanford: Academic All-Pac-12 — cerebral blocker',
  ]),
  pl('par4','Pat Freiermuth',     'TE', 'Pittsburgh Steelers',      700, [
    '55th Pick 2021', '2× Pro Bowl', '2022: 732 yards, 3 TDs for Steelers',
    'Penn State: 16 TDs in final two seasons — "Freiermuth the Dragon"',
  ]),
  pl('jha2','Josh Hill',          'TE', 'Free Agent',               180, [
    'Undrafted 2013', '10-year Saints career — elite blocking designation',
    'Jacksonville State (FCS): Ironman durability across a decade',
  ]),
  pl('tha', 'Theo Johnson',       'TE', 'New York Giants',          200, [
    '109th Pick 2024', 'Penn State: Athletic pass-catching TE with upside',
    'Immediate depth piece — growing rapport with Daniel Jones',
  ]),
  pl('tgr2','Tucker Kraft',       'TE', 'Green Bay Packers',        380, [
    '93rd Pick 2023', '2024: 511 yards — becoming Jordan Love\'s safety valve',
    'South Dakota State (FCS): 2-year leading receiver and blocker',
  ]),
  pl('csp', 'Cade Stover',        'TE', 'Houston Texans',           260, [
    '100th Pick 2024', 'Ohio State: Switched from LB to TE — versatile blocker',
    '2024: Competing for TE1 role with Texans',
  ]),
  pl('jny', 'Josh Whyle',         'TE', 'Cincinnati Bengals',       200, [
    '148th Pick 2023', '2024: Backup with growing pass-catching role',
    'Penn State: 2-year starter — solid hands and athleticism',
  ]),
  pl('mmi', 'Michael Mayer',      'TE', 'Las Vegas Raiders',        280, [
    '35th Pick 2023', '2024: Full starter in Raiders offense',
    'Notre Dame: 2× All-American — most productive TE in school history',
  ]),
  pl('bla2','Brevyn Spann-Ford',  'TE', 'Minnesota Vikings',        220, [
    '102nd Pick 2023', '2024: Depth role with growing snaps',
    'Illinois: 3-year starter — physical blocker',
  ]),
  pl('dal2','Dalton Schultz',     'TE', 'Houston Texans',           760, [
    '2× Pro Bowl', '137th Pick 2018',
    '2021: 808 yards, 8 TDs — set Cowboys TE single-season TD record',
    '2022 (HOU): 577 yards helping launch Stroud era',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   OFFENSIVE TACKLES  — 16 entries
   Rarity: 11 common · 4 rare · 1 epic
══════════════════════════════════════════════════════════════════════ */
export const OT_POOL_V5: NFLPlayer[] = [
  pl('lla', 'Laken Tomlinson (OT)','OT','Free Agent',               400, [
    '28th Pick 2015', 'Started at LT, LG across 9-year career',
    'Duke: 2-year starter — athletic enough to play both tackle and guard',
  ]),
  pl('mca2','Mike Onwenu (OT)',   'OT', 'New England Patriots',     480, [
    'Pro Bowl 2023 (alternate)', '233rd Pick 2020',
    '2022: Started at both OT spots in same season for Patriots',
    'Elite tackle/guard flexibility — one of NFL\'s most versatile OL',
  ]),
  pl('tco', 'Teven Jenkins',      'OT', 'Chicago Bears',            380, [
    '39th Pick 2021', '2023: Moved back to OT — improved significantly',
    'Oklahoma State: Dominant 2-year starter in Big 12',
  ]),
  pl('lko', 'Landon Young',       'OT', 'Los Angeles Rams',         220, [
    '195th Pick 2021', '2024: Depth swing tackle for Rams',
    'Kentucky: 2020 SEC blocker of the year — physical run blocker',
  ]),
  pl('dcx', 'Dan Moore Jr.',      'OT', 'Pittsburgh Steelers',      440, [
    '128th Pick 2021', '2022–24: Full-time LT protecting Russell Wilson and others',
    'Texas A&M: 3-year starter — played left tackle from day 1 in NFL',
  ]),
  pl('sst', 'Storm Norton',       'OT', 'Free Agent',               260, [
    'Undrafted 2017', '2021 (LAC): Started 15 games at RT for Chargers',
    'One of best UDFA OT success stories of the 2020s',
  ]),
  pl('mbe', 'Max Pircher',        'OT', 'Denver Broncos',           180, [
    'Undrafted 2023', '2024: Practice squad to roster contributor',
    'Austrian-born — international player development programme',
  ]),
  pl('tri', 'Trent Brown',        'OT', 'New England Patriots',     680, [
    '88th Pick 2015', 'Pro Bowl 2018',
    '2018: Protected Tom Brady with Pats — Super Bowl LIII ring',
    '6\'8\" 380 lbs — physically imposing tackle with Pro Bowl pedigree',
  ]),
  pl('gfl2','George Fant',        'OT', 'Free Agent',               280, [
    '190th Pick 2016', 'Former pro basketball player → NFL OT',
    '2021 (NYJ): Starting LT — remarkable sport-crossing success story',
  ]),
  pl('rgi', 'Rashod Hill',        'OT', 'Free Agent',               180, [
    'Undrafted 2016', 'Veteran swing tackle across PIT, MIN, CHI, BUF',
    '2022: Started 10 games as emergency fill-in — reliable veteran',
  ]),
  pl('jmo', 'Jimmy Morrissey',    'OT', 'Pittsburgh Steelers',      200, [
    'Undrafted 2021', '2024: Utility OL for Steelers — snaps at OT and OG',
    'Louisville: Multi-position starter in ACC',
  ]),
  pl('aco', 'Abraham Lucas',      'OT', 'Seattle Seahawks',         520, [
    '72nd Pick 2022', '2022–24: Full-time RT for Seahawks',
    'Washington State: 2-year Pac-12 All-Conference selection',
  ]),
  pl('cfl2','Calvin Anderson',    'OT', 'Denver Broncos',           220, [
    'Undrafted 2019', '2023: Starting LT for Broncos in multiple games',
    'Texas: 4-year starting tackle — earned roster spot on merit',
  ]),
  pl('mne', 'Morgan Moses',       'OT', 'New York Jets',            640, [
    '66th Pick 2014', '2× Pro Bowl (alternate)',
    '2022: 10-year veteran — 0 sacks allowed in 9 of 17 games',
    'Virginia: 2-year All-ACC starter',
  ]),
  pl('jje', 'Jake Johansen',      'OT', 'Houston Texans',           200, [
    '252nd Pick 2023', '2024: Depth RT for Texans',
    'Washington: 4-year starter — Pac-12 All-Conference honorable mention',
  ]),
  pl('oco2','Oluwatimi-linked OT','OT','Detroit Lions',             340, [
    '2024: Depth tackle for Lions\' Super Bowl LVIII runner-up roster',
    'Georgia: SEC All-Freshman — physically imposing interior/exterior option',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   OFFENSIVE GUARDS  — 16 entries
   Rarity: 12 common · 4 rare · 0 epic
══════════════════════════════════════════════════════════════════════ */
export const OG_POOL_V5: NFLPlayer[] = [
  pl('hhu', 'Hakeem Adeniji',     'OG', 'Cleveland Browns',         280, [
    '163rd Pick 2020', '2022: Started 11 games at guard for Browns',
    'Kansas: 3-year starter — versatile guard/tackle',
  ]),
  pl('nco', 'Nick Allegretti',    'OG', 'Kansas City Chiefs',       360, [
    '224th Pick 2019', '3× Super Bowl Champion (LVII, LVIII, pre-2025)',
    'Illinois: 3-year starter — part of Chiefs\' dynasty interior line',
  ]),
  pl('ale2','Alex Bars',          'OG', 'Carolina Panthers',        200, [
    'Undrafted 2019', '2022: Starting RG for Panthers',
    'Notre Dame: 2-year starter at multiple positions',
  ]),
  pl('owa', 'Owen Carney Jr.',    'OG', 'Las Vegas Raiders',        180, [
    '241st Pick 2022', '2024: Depth interior lineman for Raiders',
    'Illinois: Utility interior OL — versatile snapper',
  ]),
  pl('tse', 'Teven Jenkins (OG)','OG', 'Chicago Bears',             320, [
    '39th Pick 2021', '2022: Played primarily guard for Bears',
    'High athleticism — can play G or T depending on scheme',
  ]),
  pl('mou', 'Michael Deiter',     'OG', 'Miami Dolphins',           240, [
    '93rd Pick 2019', '2022: Starting C/G for Dolphins',
    'Wisconsin: 2-year captain — winner\'s mentality',
  ]),
  pl('eha', 'Elijah Higgins',     'OG', 'Free Agent',               180, [
    'Undrafted 2023 (Stanford)', '2024: Competed for practice squad spots',
    'Crossover athlete — TE-converted to OG prototype',
  ]),
  pl('jha3','Jahee Larkin',       'OG', 'Tennessee Titans',         200, [
    'Undrafted 2023', '2024: Part of Titans\' rebuilt offensive line',
    'Georgia Tech: 3-year starter',
  ]),
  pl('ami2','Austin Corbett',     'OG', 'Free Agent',               600, [
    'Pro Bowl 2021', '33rd Pick 2018',
    '2020 (LAR): Super Bowl LVI ring — key piece of dominant OL',
    '2021 (CAR): Starting RG, Pro Bowl level play all season',
  ]),
  pl('bpa', 'Ben Powers',         'OG', 'Denver Broncos',           640, [
    '127th Pick 2019', '2× Pro Bowl (alternate)',
    '2022 (BAL): Starting LG for Ravens — 73.8 PFF run-block grade',
    '2023: Signed to large deal by Denver — one of top guards in AFC',
  ]),
  pl('gre2','Graham Glasgow',     'OG', 'Free Agent',               400, [
    '100th Pick 2016', '2019: Starting RG for Lions — 83.4 PFF grade',
    'Michigan: 3-year starting center converted to guard in NFL',
  ]),
  pl('kco2','Kenyon Green',       'OG', 'Houston Texans',           340, [
    '15th Pick 2022', '2024: Returning starter for Texans\' postseason OL',
    'Texas A&M: 2021 All-SEC — high pedigree',
  ]),
  pl('nde', 'Nick Easton',        'OG', 'Free Agent',               260, [
    'Undrafted 2015', '2021 (NO): Starting LG for Saints',
    'Harvard: Ivy League ironman — 8-year career in NFL',
  ]),
  pl('dbu', 'Dylan Bu\'uhulu',    'OG', 'San Francisco 49ers',      200, [
    'Undrafted 2021', 'Super Bowl LVIII Appearance',
    'Stanford: 2-year starter — part of 49ers\' exceptional OL depth',
  ]),
  pl('jmc3','Jarvis Jenkins',     'OG', 'Indianapolis Colts',       220, [
    'Undrafted 2023', '2024: Part of Colts\' interior rebuild under new regime',
    'Georgia: 2-year starter on SEC championship line',
  ]),
  pl('sbi', 'Spencer Brown',      'OG', 'Buffalo Bills',            760, [
    '93rd Pick 2021', '2× Pro Bowl (alternate)', '2023: Starting RT/RG for Bills',
    'Northern Iowa (FCS): Record-setting DI-to-NFL development story',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   CENTERS  — 13 entries
   Rarity: 11 common · 2 rare · 0 epic
══════════════════════════════════════════════════════════════════════ */
export const C_POOL_V5: NFLPlayer[] = [
  pl('bha2','Ben Bredeson',       'C', 'New York Giants',           220, [
    '117th Pick 2020', '2022: Starting G/C for Giants playoff team',
    'Michigan: 2-year starter in Big Ten — athletic interior lineman',
  ]),
  pl('nca', 'Nick Harris',        'C', 'Cleveland Browns',          200, [
    '160th Pick 2020', '2022: Starting C for Browns before injury',
    'Washington: 2-year starting center — smart pre-snap communicator',
  ]),
  pl('bcx','Brett Toth',         'C', 'Free Agent',               160, [
    'Undrafted 2017', '8-year veteran journeyman across 5 teams',
    'Army: Service academy-to-NFL model of hard work and longevity',
  ]),
  pl('tro','Tanner Hudson',       'C', 'Tampa Bay Buccaneers',      200, [
    'Undrafted 2018', '2022: Depth C/TE for Tampa Bay',
    'Southern Arkansas (D2): Developmental success story',
  ]),
  pl('mco3','Matt Gono',          'C', 'Free Agent',               180, [
    '247th Pick 2019', 'Versatile OL — started at C, LG, LT across career',
    'Richmond: FCS All-American tackle',
  ]),
  pl('kbo', 'Kyle Bosch',         'C', 'Los Angeles Chargers',      200, [
    'Undrafted 2019', '2023: Backup C/G for Chargers under Brandon Staley',
    'Michigan: Multi-year starter in Big Ten interior',
  ]),
  pl('gco', 'Greg Van Roten',     'C', 'Free Agent',               220, [
    'Undrafted 2012', '10-year career — started at C and G across 6 teams',
    'Penn: Ivy League → NFL — one of longest-tenured players from program',
  ]),
  pl('rba', 'Ryan Bates',         'C', 'Buffalo Bills',             580, [
    'Undrafted 2019', 'Pro Bowl alternate 2022',
    '2022: Starting LG for Bills AFC Championship team',
    'Penn State: Utility OL who earned multi-year starting contract',
  ]),
  pl('mmu', 'Michael Deiter (C)', 'C', 'Tennessee Titans',          240, [
    '93rd Pick 2019', '2023: Starting C/G for Titans',
    'Wisconsin: 3-year starting center converted in NFL',
  ]),
  pl('bfa', 'Brian Allen',        'C', 'Los Angeles Rams',          540, [
    '98th Pick 2018', 'Super Bowl LVI Champion',
    '2023: Starting C for Rams — part of Stafford\'s protection unit',
    'Michigan State: 2-year captain and anchor',
  ]),
  pl('sba', 'Sam Mustipher',      'C', 'Free Agent',               200, [
    'Undrafted 2019', '2021–22: Full-time starting C for Chicago Bears',
    'Notre Dame: 2-year starter — reliable long snapper + center',
  ]),
  pl('jha4','Josh Andrews',       'C', 'Free Agent',               180, [
    'Undrafted 2014', 'Veteran backup across NYG, PHI, IND, NYJ',
    'Western Oregon (D2): Undersized but smart — reads defenses well',
  ]),
  pl('lmi', 'Lloyd Cushenberry',  'C', 'Tennessee Titans',          720, [
    '83rd Pick 2020', '2× Pro Bowl (alternate)',
    '2022: Full-time starter — highest-graded C on Broncos line',
    'LSU: National Champion 2019 — won in SEC biggest games',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   MASTER EXPORT  — Vol 5
══════════════════════════════════════════════════════════════════════ */
export const ALL_PLAYERS_V5: Record<PositionGroup, NFLPlayer[]> = {
  QB: QB_POOL_V5,
  RB: RB_POOL_V5,
  WR: WR_POOL_V5,
  TE: TE_POOL_V5,
  OT: OT_POOL_V5,
  OG: OG_POOL_V5,
  C:  C_POOL_V5,
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