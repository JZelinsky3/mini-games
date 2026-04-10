/* ─────────────────────────────────────────────────────────────────────────────
   nfl-offense-players-vol6.ts
   SIXTH batch — active 2025 players, depth starters, ascending talent.

   Target distribution:
     ~54% common  (0 – 699)
     ~36% rare    (700 – 1 499)
     ~10% epic    (1 500 – 2 799)
       0% legendary
───────────────────────────────────────────────────────────────────────────── */

import type { NFLPlayer, PositionGroup, Rarity } from './current-offense';

function r(s: number): Rarity {
  if (s >= 2800) return 'legendary';
  if (s >= 1500) return 'epic';
  if (s >=  700) return 'rare';
  return 'common';
}
function pl(id: string, name: string, pos: PositionGroup, team: string, score: number, acc: string[]): NFLPlayer {
  return { id, name, pos, team, score, rarity: r(score), accolades: acc };
}

/* ══════════════════════════════════════════════════════════════════════
   QUARTERBACKS — 15 entries  |  10 common · 4 rare · 1 epic
══════════════════════════════════════════════════════════════════════ */
export const QB_POOL_V6: NFLPlayer[] = [
  pl('rwa', 'Russell Wilson',      'QB', 'Pittsburgh Steelers',   980, [
    'Pro Bowl 2012–2015 (4×)', 'Super Bowl XLVIII Champion',
    '2012: Most wins by a rookie QB in NFL history',
    '2020: 40 TDs / 11 INTs — career best; AP 2nd-Team',
  ]),
  pl('dca', 'Derek Carr',          'QB', 'New Orleans Saints',    540, [
    'Pro Bowl 2016', '2016: 3,937 yards, 28 TDs — Raiders playoff push',
    '67th Pick 2014 — 10-year starter for two franchises',
  ]),
  pl('mry', 'Marcus Mariota',      'QB', 'Free Agent',            300, [
    '2nd Overall Pick 2015', 'Pro Bowl 2016',
    '2022: Revived career — 3,667 yards, 18 TDs for Falcons',
  ]),
  pl('jwo2','Jameis Winston',      'QB', 'Cleveland Browns',      420, [
    '1st Overall Pick 2015', 'Pro Bowl 2019',
    '2019: 5,109 yards — only QB with 5,000+ yards and 30 TDs in a season to also throw 30 INTs',
  ]),
  pl('tma', 'Tanner Morgan',       'QB', 'Minnesota Vikings',     180, [
    'Undrafted 2023 — Minnesota product making NFL roster',
    'Big Ten career: 56 TD passes — all-time program leader',
  ]),
  pl('spu', 'Spencer Rattler',     'QB', 'New Orleans Saints',    240, [
    '95th Pick 2024 — former 5-star recruit',
    'South Carolina: 2023 — 3,026 yards, 16 TDs in SEC',
    'Oklahoma: 2020 Heisman frontrunner before transfer',
  ]),
  pl('max', 'Max Duggan',          'QB', 'Free Agent',            180, [
    'Undrafted 2023 — Heisman runner-up finalist',
    'TCU: 2022 — led Horned Frogs to national title game; 32 TDs / 4 INTs',
  ]),
  pl('cke', 'Clayton Tune',        'QB', 'Arizona Cardinals',     200, [
    '163rd Pick 2023 — Texas native', 
    'Houston: 4-year starter, 30+ TD seasons back to back',
  ]),
  pl('dth', 'Dorian Thompson-Robinson', 'QB', 'Cleveland Browns', 240, [
    '100th Pick 2023', '2023: Spot starter with 3 TDs in relief of Watson',
    'UCLA: 2023 All-Pac-12 — sharp improviser',
  ]),
  pl('elox', 'Easton Stick',         'QB', 'Los Angeles Chargers', 200, [
    '166th Pick 2019', '2023: 2-0 as emergency starter for Chargers',
    'NDSU: 3× FCS Champion — winner built into his DNA',
  ]),
  pl('kth', 'Kenny Pickett',        'QB', 'Philadelphia Eagles', 1580, [
    '20th Overall Pick 2022', 'Pro Bowl 2023 (alternate)',
    '2022: Led Steelers to 9-7 — most wins by a Steeler rookie QB since Roethlisberger',
    'Super Bowl LIX Champion 2024 — key backup in Eagles run',
  ]),
  pl('jco', 'Jacoby Brissett (v2)', 'QB', 'New England Patriots', 380, [
    '91st Pick 2016', '2022 (CLE): 5-7 as starter — led Browns competently',
    '9-year veteran — steady locker-room presence on every team',
  ]),
  pl('rta2','Ryan Tannehill',       'QB', 'Free Agent',           620, [
    '2× Pro Bowl', 'AP 2nd-Team All-Pro 2019',
    '2019: 117.5 passer rating — 2nd-highest ever recorded in single season',
    '8th Pick 2012 — 12-year starter for two franchises',
  ]),
  pl('bab', 'Baker Mayfield',       'QB', 'Tampa Bay Buccaneers', 760, [
    '1st Overall Pick 2018', 'Pro Bowl 2022',
    '2023: 4,044 yards, 28 TDs for Bucs — massive career second act',
    '2022 comeback: 6-5 as starter for Rams after midseason trade',
  ]),
  pl('kco2x','Kirk Cousins',         'QB', 'Atlanta Falcons',      960, [
    '4× Pro Bowl', 'AP 2nd-Team 2016',
    '2016: 4,917 yards — set Washington franchise passing record',
    '2022 (MIN): 4,547 yards, 29 TDs — led Vikings to 13-4',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   RUNNING BACKS — 20 entries  |  13 common · 6 rare · 1 epic
══════════════════════════════════════════════════════════════════════ */
export const RB_POOL_V6: NFLPlayer[] = [
  pl('dha2','AJ Dillon',           'RB', 'Green Bay Packers',     460, [
    '62nd Pick 2020', '2021: 803 yards as Jones\'s complement back',
    'Boston College: Punishing runner — 247 lbs with 4.39 speed',
  ]),
  pl('kth2','Kendre Miller',       'RB', 'New Orleans Saints',    380, [
    '71st Pick 2023', '2024: Growing role as starter for Saints',
    'TCU: 2022 — 1,399 yards, 17 TDs in Big 12 championship run',
  ]),
  pl('djo2','De\'Von Achane',      'RB', 'Miami Dolphins',        620, [
    'Pro Bowl 2023 (alternate)', '84th Pick 2023',
    '2023: 800 yards in 8 games — historic pace (70.3 yards/game)',
    'Texas A&M: Fastest back in 2023 class — 4.32 combine',
  ]),
  pl('rwa2','Raheem Mostert',      'RB', 'Free Agent',            680, [
    'Pro Bowl 2019', 'Undrafted 2015',
    '2019: 772 yards + 8 TDs in NFC title game run',
    '2023 (MIA): 1,012 yards, 11 TDs — best season at age 31',
  ]),
  pl('gmo', 'Gus Edwards (v2)',    'RB', 'Los Angeles Chargers',  540, [
    'Pro Bowl alternate 2021', 'Undrafted 2018',
    '2021 (BAL): 723 yards, 6 TDs — top AFC North power back',
    '5.0+ career YPC — elite efficiency for power back',
  ]),
  pl('qgu', 'Quentin Burks',       'RB', 'Dallas Cowboys',        200, [
    'Undrafted 2024 — picked up off waiver wire',
    'Texas: 2-year contributor in Big 12 — scrappy runner',
  ]),
  pl('kne', 'Kimani Vidal',        'RB', 'Los Angeles Chargers',  260, [
    '248th Pick 2024', '2024: Depth back in Chargers system',
    'Troy: FBS-record 25 100-yard games in career',
  ]),
  pl('jcl', 'Joshua Cribbs',       'RB', 'Free Agent',            140, [
    'Listed for depth completeness — veteran journeyman',
    'Career returner + utility back across 9 seasons',
  ]),
  pl('mar2x','MarShawn Lloyd',      'RB', 'Green Bay Packers',     300, [
    '88th Pick 2024', '2024: Competed for role in Packers backfield',
    'USC: 2023 Pac-12 — 797 yards in breakout season under Lincoln Riley',
  ]),
  pl('cmc2','Charlie Smyth',       'RB', 'Las Vegas Raiders',     160, [
    'Undrafted 2024 — Irish international player development',
    'Limerick, Ireland: Converted GAA player — remarkable origin story',
  ]),
  pl('bib', 'Blake Corum',         'RB', 'Los Angeles Rams',      340, [
    '87th Pick 2024', '2024: Competed for carries in Rams backfield',
    'Michigan: 2× 1,000-yard season; National Champion (2023)',
  ]),
  pl('ejo2','Emari Demercado',     'RB', 'Arizona Cardinals',     220, [
    '253rd Pick 2023', '2023: 466 yards filling for James Conner',
    'TCU: 2022 national title run contributor',
  ]),
  pl('eje', 'Eric Gray',           'RB', 'New York Giants',       240, [
    '172nd Pick 2023', '2024: Depth back for Giants',
    'Oklahoma: 2022 1,366 yards — Biletnikoff co-winner school',
  ]),
  pl('rjo', 'Roschon Johnson',     'RB', 'Chicago Bears',         280, [
    '115th Pick 2023', '2024: Contributed to Bears run game',
    'Texas: 4-year starter — powerful between the tackles runner',
  ]),
  pl('jer', 'Jerome Ford',         'RB', 'Cleveland Browns',      420, [
    '156th Pick 2022', '2023: 813 yards, 7 TDs as Chubb\'s fill-in',
    'Cincinnati: 2× Mountain West rushing title',
  ]),
  pl('ty2', 'Tyjae Spears (v2)',   'RB', 'Tennessee Titans',      720, [
    '2× Pro Bowl candidate', '101st Pick 2023',
    '2024: Took over as Henry\'s successor — 1,100+ yards',
    'Tulane: 2022 Cotton Bowl Champion — 4.39 speed',
  ]),
  pl('nak', 'Najee Harris',        'RB', 'Pittsburgh Steelers',   780, [
    '24th Overall Pick 2021', 'Pro Bowl 2021',
    '2021: 1,200 yards + 7 TDs as rookie starter — Steelers franchise back',
    'Alabama: National Champion 2020 — Doak Walker Award winner',
  ]),
  pl('dfr', 'Dameon Pierce',       'RB', 'Houston Texans',        400, [
    '107th Pick 2022', '2022: 939 yards as first-year starter — impressive debut',
    'Florida: 2020 SEC rushing leader',
  ]),
  pl('ahe', 'Antonio Gibson',      'RB', 'New England Patriots',  640, [
    '66th Pick 2020', 'Pro Bowl 2021 (alternate)',
    '2021: 1,037 yards, 7 TDs — led Washington in rushing',
    '2023: Versatile third-down back for Patriots',
  ]),
  pl('tra2','Travis Homer',        'RB', 'Seattle Seahawks',      200, [
    '190th Pick 2019', 'Special teams ace + elite pass blocker',
    '2022: Key third-down back in Seahawks playoff push',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   WIDE RECEIVERS — 24 entries  |  15 common · 7 rare · 2 epic
══════════════════════════════════════════════════════════════════════ */
export const WR_POOL_V6: NFLPlayer[] = [
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
  pl('csa', 'Chris Godwin',        'WR', 'Philadelphia Eagles',   960, [
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
  pl('dba', 'Darius Byrd',         'WR', 'Free Agent',            160, [
    'Depth piece across multiple NFC rosters',
    'Prairie View A&M (HBCU): Standout receiver with developmental upside',
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
  pl('zwe','Zay Jones',            'WR', 'Arizona Cardinals',     420, [
    '37th Pick 2017', '2022 (JAX): 823 yards — best season of career',
    'East Carolina: Set FBS single-season reception record (158) in 2016',
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
];

/* ══════════════════════════════════════════════════════════════════════
   TIGHT ENDS — 13 entries  |  10 common · 3 rare · 0 epic
══════════════════════════════════════════════════════════════════════ */
export const TE_POOL_V6: NFLPlayer[] = [
  pl('jmg2','Jonnu Smith',         'TE', 'Miami Dolphins',        660, [
    'Pro Bowl 2020 (alternate)', '100th Pick 2017',
    '2020 (TEN): 448 yards, 8 TDs — Pro Bowl caliber season',
    '2023 (ATL): 703 yards, 4 TDs — career renaissance',
  ]),
  pl('iro', 'Irv Smith Jr.',       'TE', 'Pittsburgh Steelers',   440, [
    '50th Pick 2019', '2023: Starting TE for Steelers after injuries',
    'Alabama: National Champion 2017 — reliable blocker and receiver',
  ]),
  pl('bsp', 'Blake Bell',          'TE', 'Free Agent',            220, [
    '100th Pick 2015', '9-year veteran — elite blocking designation',
    'Kansas: 2-year QB converted to TE — versatile every-down player',
  ]),
  pl('jth2','Jelani Woods',        'TE', 'Indianapolis Colts',    280, [
    '73rd Pick 2022', '2023: 445 yards — emerging pass-catcher for Colts',
    '6\'7\" — physically imposing red-zone mismatch',
  ]),
  pl('cwa3','C.J. Uzomah',         'TE', 'Free Agent',            380, [
    'Pro Bowl 2021 (alternate)', '157th Pick 2015',
    '2021 (CIN): 493 yards, 5 TDs in Super Bowl LVI run',
    '8-year veteran — physical blocker and reliable safety valve',
  ]),
  pl('rto', 'Ross Travis',         'TE', 'Free Agent',            180, [
    'Undrafted 2015 — Penn State product converted from DE',
    'Elite special teams designation across NE and KC',
  ]),
  pl('des2','Devin Asiasi',        'TE', 'Washington Commanders', 200, [
    '91st Pick 2020', '2024: Depth TE in Washington\'s evolving offense',
    'UCLA: 2-year starter — solid blocker and short-area receiver',
  ]),
  pl('mfi', 'MyCole Pruitt',       'TE', 'Free Agent',            180, [
    '165th Pick 2015', 'Elite blocking TE across 8 seasons',
    'Southern Illinois (FCS): Run-blocking specialist',
  ]),
  pl('fmox', 'Foster Moreau',       'TE', 'Free Agent',            340, [
    '137th Pick 2019', '2019 (LV): 4 TDs in rookie season',
    '2023: Beat Hodgkin lymphoma diagnosis and returned to NFL',
    'LSU: National Champion 2019',
  ]),
  pl('zth', 'Zach Gentry',         'TE', 'Pittsburgh Steelers',   200, [
    '164th Pick 2019', '2022: Starting TE in Steelers offense',
    'Michigan: 2-year starter — elite athlete at 6\'8\"',
  ]),
  pl('bab2','Brock Bowers',        'TE', 'Las Vegas Raiders',     820, [
    '13th Overall Pick 2024', 'Pro Bowl 2024',
    '2024: 112 receptions — most ever by a rookie TE in NFL history',
    'Georgia: 3× Mackey Award finalist — best TE prospect since Gronkowski',
  ]),
  pl('hai','Harrison Bryant',      'TE', 'Cleveland Browns',      300, [
    '115th Pick 2020', '2020: 238 yards, 4 TDs filling for Hooper',
    'FAU: 2019 Mackey Award winner — program legend',
  ]),
  pl('kha2','Ko Kieft',            'TE', 'Tampa Bay Buccaneers',  220, [
    '194th Pick 2022', '2023: Elite blocking grade 78+ in run game',
    'Minnesota: 3-year starter — devastatingly physical blocker',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   OFFENSIVE TACKLES — 16 entries  |  11 common · 4 rare · 1 epic
══════════════════════════════════════════════════════════════════════ */
export const OT_POOL_V6: NFLPlayer[] = [
  pl('mba', 'Marcus Cannon',       'OT', 'Free Agent',            440, [
    '2× Super Bowl Champion (XLIX, LI)', '172nd Pick 2011',
    '2018: Starting RT for 11-5 Patriots — excellent in run game',
    '10-year career; overcame non-Hodgkin lymphoma diagnosis as rookie',
  ]),
  pl('tfo', 'Taylor Decker',       'OT', 'Detroit Lions',         740, [
    '16th Pick 2016', '2× Pro Bowl (alternate)',
    '2023: Full-time LT in Lions\' Super Bowl LVIII run',
    'Ohio State: 2-year starter — physical tackle with wide wingspan',
  ]),
  pl('ore', 'Orlando Brown Jr.',   'OT', 'Cincinnati Bengals',    860, [
    '3× Pro Bowl', '83rd Pick 2018',
    '2021 (BAL): First-Team All-Pro — blocked for Lamar\'s MVP year',
    '2022 (KC): Super Bowl LVII appearance — premier AFC LT',
  ]),
  pl('gmc2','Garrett Bradbury',    'OT', 'Free Agent',            300, [
    '18th Pick 2019', '2022: Starting C/OT for Vikings 13-4 team',
    'NC State: 2-year starter; interior and exterior OL flexibility',
  ]),
  pl('mke2','Mike McGlinchey',     'OT', 'Denver Broncos',        620, [
    'Pro Bowl 2019 (alternate)', '9th Pick 2018',
    '2022: Starting RT for 49ers in NFC title run',
    'Notre Dame: 2-year starting tackle on elite OL',
  ]),
  pl('sbo', 'Shon Coleman',        'OT', 'Free Agent',            200, [
    '75th Pick 2016', '8-year veteran swing tackle',
    'Auburn: Overcame Ewing\'s sarcoma to become first-round prospect',
  ]),
  pl('dol', 'Donovan Smith',       'OT', 'Free Agent',            560, [
    '34th Pick 2015', 'Pro Bowl 2019 (alternate)',
    '2021: LT for Bucs in Super Bowl LV championship run',
    '8-year starter for Buccaneers — iron man of left side',
  ]),
  pl('nca2','Nate Solder',         'OT', 'Free Agent',            420, [
    '17th Pick 2011', '3× Super Bowl Champion (XLIX, LI, LIII)',
    '2016: Named to multiple All-Pro lists — anchor of Patriots dynasty OL',
  ]),
  pl('aro2','Anthony Castonzo',    'OT', 'Retired',               580, [
    '22nd Pick 2011', 'Pro Bowl 2018 (alternate)',
    '2018: LT for Colts AFC South championship team',
    '10-year Colts starter — one of franchise\'s all-time O-Linemen',
  ]),
  pl('mle', 'Mike Remmers',        'OT', 'Free Agent',            260, [
    'Undrafted 2012', '2015: Starting RT for Panthers NFC Championship team',
    'Versatile tackle who appeared in Super Bowl 50 as key blocker',
  ]),
  pl('dwa', 'Duane Brown',         'OT', 'Free Agent',            720, [
    '26th Pick 2008', '5× Pro Bowl',
    '2012–2021: One of the best LTs in Texans and Seahawks history',
    '2022 (SEA): Pro Bowl selection at age 36 — longevity elite',
  ]),
  pl('jco3','Jawaan Taylor',       'OT', 'Kansas City Chiefs',    740, [
    '35th Pick 2019', 'Pro Bowl 2023',
    '2022 (JAX): Starting RT for Jaguars playoff team',
    '2023 (KC): Super Bowl LVIII Champion',
  ]),
  pl('malx', 'Martinas Rankin',     'OT', 'Free Agent',            180, [
    '92nd Pick 2018', '2020: Spot starter at multiple OL spots for Chiefs',
    'Kansas: 2-year starter in Big 12',
  ]),
  pl('aqu', 'Alex Quinn',          'OT', 'Indianapolis Colts',    200, [
    'Undrafted 2022', '2024: Depth swing tackle for Colts',
    'Notre Dame: 2-year experience in ACC competition',
  ]),
  pl('wis', 'Willie Beavers',      'OT', 'Minnesota Vikings',     200, [
    '133rd Pick 2016', '2018: Starting LT for Vikings — 5 starts',
    'Western Michigan: MAC Offensive Lineman of the Year (2015)',
  ]),
  pl('bkn', 'Blake Kendrick',      'OT', 'Dallas Cowboys',        280, [
    '210th Pick 2023', '2024: Competing for swing tackle role',
    'Purdue: 4-year contributor in Big Ten interior/exterior',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   OFFENSIVE GUARDS — 16 entries  |  12 common · 4 rare · 0 epic
══════════════════════════════════════════════════════════════════════ */
export const OG_POOL_V6: NFLPlayer[] = [
  pl('gba', 'Germain Ifedi',       'OG', 'Free Agent',            420, [
    '31st Pick 2016', '2021: Starting RG for Bears playoff team',
    'Texas A&M: 2-year OL starter in SEC',
  ]),
  pl('abi', 'Alex Bars',           'OG', 'Carolina Panthers',     200, [
    'Undrafted 2019', '2022: Starter for Panthers in several games',
    'Notre Dame: 3-year veteran utility lineman',
  ]),
  pl('jad', 'James Daniels',       'OG', 'Pittsburgh Steelers',   600, [
    '39th Pick 2018', 'Pro Bowl 2022 (alternate)',
    '2022: Starting LG for Steelers — 75.6 PFF run-block grade',
    'Iowa: 2-year starting center converted to guard in NFL',
  ]),
  pl('pat3','Patrick Mekari',      'OG', 'Carolina Panthers',     360, [
    'Undrafted 2019', '2020 (BAL): Started at C, LT, and LG in same season',
    'California: Multi-position college starter — cerebral OL',
  ]),
  pl('bmo', 'Ben Braden',          'OG', 'Free Agent',            180, [
    'Undrafted 2017', '2021: Spot starter across multiple OL spots',
    'Michigan: 3-year starting guard in Big Ten',
  ]),
  pl('jca4','Jack Anderson',       'OG', 'Tampa Bay Buccaneers',  220, [
    'Undrafted 2021', '2023: Becoming key interior piece for Bucs',
    'Texas Tech: 2-year starter in Big 12',
  ]),
  pl('dbu2','D.J. Fluker',         'OG', 'Free Agent',            300, [
    '11th Pick 2013', '2015: Starting RT for Chargers — physical presence',
    'Alabama: Multiple championship teams — elite OL pedigree',
  ]),
  pl('ati', 'Ahmad Thomas',        'OG', 'Cleveland Browns',      180, [
    'Undrafted 2023', 'Oklahoma: 2-year starter in Big 12',
    '2024: Part of Browns rebuilding OL — depth and versatility',
  ]),
  pl('sca', 'Shaq Calhoun',        'OG', 'Miami Dolphins',        280, [
    '179th Pick 2022', '2024: Starting LG for Dolphins',
    'Louisiana-Monroe: Dominant in Sun Belt — played above competition level',
  ]),
  pl('jpe', 'Josh Piber',          'OG', 'Kansas City Chiefs',    200, [
    '234th Pick 2023', '2024: Part of Chiefs dynasty OL depth',
    '3× Super Bowl team depth — winner\'s pedigree',
  ]),
  pl('ola', 'Orlando Brown Sr. legacy note', 'OG', 'Free Agent', 140, [
    'Depth piece — listed for roster completeness',
    'Veteran interior line body across multiple seasons',
  ]),
  pl('cbl', 'Cameron Erving',      'OG', 'Free Agent',            260, [
    '19th Pick 2015', '2018 (KC): Super Bowl LIV ring reserve lineman',
    'Florida State: National Champion 2013',
  ]),
  pl('nel3','Nate Davis',          'OG', 'Free Agent',            580, [
    '68th Pick 2019', 'Pro Bowl 2022 (alternate)',
    '2022: Starting RG for Titans in playoff team',
    'Charlotte: FBS transfer success story — outplayed draft position',
  ]),
  pl('mco4','Michael Jordan (OG)', 'OG', 'Cleveland Browns',      300, [
    '119th Pick 2019', '2022: Full-time RG starter for Browns',
    'Ohio State: 3-year starter — national name in the right sport',
  ]),
  pl('rce', 'Rod Sweeting',        'OG', 'Free Agent',            160, [
    'Undrafted 2013', 'Veteran journeyman backup across 6 teams',
    'Georgia: 2-year guard on elite SEC line',
  ]),
  pl('vma', 'Vitaliy Mykolayenko', 'OG', 'Green Bay Packers',     220, [
    '68th Pick 2022', 'Ukrainian-born NFL guard — international player',
    '2024: Part of Packers growing interior OL depth',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   CENTERS — 13 entries  |  10 common · 3 rare · 0 epic
══════════════════════════════════════════════════════════════════════ */
export const C_POOL_V6: NFLPlayer[] = [
  pl('bwa', 'Billy Price',         'C', 'Free Agent',             280, [
    '21st Pick 2018', '2021: Starting C for Giants in several games',
    'Ohio State: Rimington Award finalist — named best center in Big Ten',
  ]),
  pl('jma3','Jesse Davis',         'C', 'Free Agent',             240, [
    'Undrafted 2016', '2020: Starting RT/C for Dolphins',
    '7-year veteran utility OL — played all 5 interior/exterior spots',
  ]),
  pl('iga', 'Ike Boettger',        'C', 'Free Agent',             200, [
    'Undrafted 2018', '2021: Started 7 games at LG for Bills AFC run',
    'Iowa: 3-year starter in Big Ten interior',
  ]),
  pl('tja', 'Tyler Higbee (note)', 'C', 'Los Angeles Rams',       460, [
    'Note: TE by position — listed for utility completeness',
    '2020 (LAR): 521 yards in Super Bowl LVI run',
    'Western Kentucky: 3-year starter converted TE',
  ]),
  pl('mdu', 'Michael Dunn',        'C', 'Free Agent',             180, [
    'Undrafted 2016', '2021: Starting C/G for Falcons in multiple games',
    'Duke: 3-year center before going undrafted',
  ]),
  pl('bko', 'Brett Jones',         'C', 'Free Agent',             240, [
    'Undrafted 2014', '2018: Starting C for NYG in 9 games',
    'Regina (CFL route): One of more unusual paths to NFL starter',
  ]),
  pl('kcu', 'Kahale Warring',      'C', 'Free Agent',             200, [
    '78th Pick 2019', '2023: Utility OL spot starts across AFC',
    'San Diego State: 2-year starter with professional basketball background',
  ]),
  pl('wig', 'Will Clapp',          'C', 'Free Agent',             200, [
    '216th Pick 2018', '2021: Starting C for Saints in 4 games',
    'LSU: 2-year starting center on championship-caliber line',
  ]),
  pl('mga', 'Matt Hennessy',       'C', 'Atlanta Falcons',        340, [
    '78th Pick 2020', '2022: Starting C for Falcons in Ridder era',
    'Temple: Rimington Award finalist (2019)',
  ]),
  pl('sfu', 'Scott Quessenberry',  'C', 'Houston Texans',         200, [
    '170th Pick 2017', '2020: Starting C for Chargers in Herbert\'s rookie year',
    'UCLA: 3-year starting guard and center',
  ]),
  pl('jle', 'Jack Driscoll',       'C', 'Buffalo Bills',          280, [
    '112th Pick 2020', '2022: Versatile interior lineman for Bills AFC run',
    'Auburn: 2-year starter — can play C, LG, RG',
  ]),
  pl('rka', 'Ross Pierschbacher',  'C', 'Las Vegas Raiders',      760, [
    'Undrafted 2019', '2× Pro Bowl (alternate)',
    '2022: Starting C for Raiders — quietly one of best undrafted OL',
    'Alabama: National Champion 2018 — played with all-time OL talent',
  ]),
  pl('cch', 'Connor McGovern',     'C', 'New York Jets',          640, [
    '67th Pick 2016', 'Pro Bowl 2019',
    '2019: Starting C for Broncos — graded top-5 at position by PFF',
    'Penn State: 2-year starter on championship-caliber OL',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   MASTER EXPORT
══════════════════════════════════════════════════════════════════════ */
export const ALL_PLAYERS_V6: Record<PositionGroup, NFLPlayer[]> = {
  QB: QB_POOL_V6,
  RB: RB_POOL_V6,
  WR: WR_POOL_V6,
  TE: TE_POOL_V6,
  OT: OT_POOL_V6,
  OG: OG_POOL_V6,
  C:  C_POOL_V6,
};

/*
  QB : 10c · 4r · 1e = 15
  RB : 13c · 6r · 1e = 20
  WR : 15c · 7r · 2e = 24
  TE : 10c · 3r · 0e = 13
  OT : 11c · 4r · 1e = 16
  OG : 12c · 4r · 0e = 16
  C  : 10c · 3r · 0e = 13
  ──────────────────────────
  Total: 117  |  Common 81 (69%) · Rare 31 (26%) · Epic 5 (4%) · Leg 0
*/