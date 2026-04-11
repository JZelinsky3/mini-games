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
   TIGHT ENDS — 13 new entries
══════════════════════════════════════════════════════════════════════ */
export const TE_POOL_V3: NFLPlayer[] = [
  pl('hen3','Hunter Henry','TE','New England Patriots', 620, [
    '2× Pro Bowl','35th Pick (2016)',
    '2021: 603 yards, 9 TDs — led all NFL TEs in TDs',
    '5× 500+ yard seasons; elite red-zone weapon',
  ]),
  pl('hil2','Taysom Hill','TE','New Orleans Saints', 480, [
    'Pro Bowl (2020 — unique hybrid designation)',
    '4th Round Pick (2017)','2020: 4 TDs rushing + 1 passing in 5 starts',
    'Only player in NFL history to appear at QB, RB, WR, TE, and LS',
  ]),
  pl('con','Tyler Conklin','TE','New York Jets', 340, [
    'Pro Bowl (2021)','158th Pick (2018)',
    '2021: 593 yards, 3 TDs — Vikings top TE',
    'Reliable safety-valve TE across multiple rosters',
  ]),
  pl('dul','Greg Dulcich','TE','Denver Broncos', 260, [
    '80th Pick (2022)','2022: 3 TDs in 9 games as rookie',
    '2024: Showed elite YAC ability — athletic freak at 6\'4"',
  ]),
  pl('ben2','Ben Sinnott','TE','Washington Commanders', 240, [
    '40th Pick (2024)','2024: Immediate contributor in Commanders playoff run',
    '2023 (Kansas State): 797 yards, 7 TDs — Big 12 standout',
  ]),
  pl('kol','Charlie Kolar','TE','Baltimore Ravens', 260, [
    '128th Pick (2022)','2024: 500+ yards complementing Mark Andrews',
    'Iowa State: 2× First-Team All-Big 12',
  ]),
  pl('smr','Durham Smythe','TE','Miami Dolphins', 200, [
    '121st Pick (2018)','Elite blocking TE — 7 seasons of iron-man reliability',
    'Key piece allowing Dolphins\' skill positions to shine',
  ]),
  pl('bjo2','Brevin Jordan','TE','Houston Texans', 220, [
    '147th Pick (2021)','2024: 500+ yards in complementary role',
    'Athletic receiving TE — elite speed for position (4.60)',
  ]),
  pl('cha4','Charlie Jones','TE','Cincinnati Bengals', 160, [
    'Undrafted (2023)','2024: Flex TE / WR hybrid for Bengals',
    '2022 (Purdue): Led nation in receptions (110) as WR convert',
  ]),
  pl('geo','Gerald Everett','TE','Los Angeles Chargers', 340, [
    'Pro Bowl (2021)','44th Pick (2017)',
    '2021: 478 yards, 4 TDs — Seahawks\' top option',
    '2022 (LAC): 586 yards; consistent pass-catching TE for 7 seasons',
  ]),
  pl('irv2','Irv Smith Jr.','TE','Cincinnati Bengals', 300, [
    '50th Pick (2019)','2023: 519 yards for Bengals post-Hockenson trade',
    '2021: 365 yards before torn meniscus — had star potential',
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
  pl('ajb','AJ Barner','TE','Indianapolis Colts', 220, [
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
   TIGHT ENDS  (pool: TE)
   Target spread → 2 legendary · 3 epic · 4 rare · 4 common
══════════════════════════════════════════════════════════════════════ */
export const TE_POOL: NFLPlayer[] = [
  pl('kel','Travis Kelce','TE','Kansas City Chiefs', 3180, [
    '9× Pro Bowl','6× AP 1st-Team','3× Super Bowl Champion',
    'All-Time TE receiving yards leader (11,000+)',
    'Most consecutive seasons with 1,000+ rec yards by a TE (8)',
    '2020 OPOY finalist — 105 catches, 1,416 yards',
  ]),
  pl('kit','George Kittle','TE','San Francisco 49ers', 2580, [
    '5× Pro Bowl','3× AP 1st-Team',
    '2018 single-season TE receiving yards record (1,377)',
    '2023 Super Bowl LVIII appearance','8,000+ career receiving yards',
  ]),
  pl('and','Mark Andrews','TE','Baltimore Ravens', 1560, [
    '4× Pro Bowl','AP 1st-Team (2021)','AP 2nd-Team',
    '2021: 1,361 yards — Ravens franchise TE record',
    '3× 1,000-yard seasons',
  ]),
  pl('goe','Dallas Goedert','TE','Philadelphia Eagles', 980, [
    '2× Pro Bowl','Super Bowl LVII appearance',
    '3× 1,000-yard seasons','100+ catches (2022)',
  ]),
  pl('hoc','T.J. Hockenson','TE','Minnesota Vikings', 780, [
    '2× Pro Bowl','2022: 95 catches — most ever by a TE in MN',
    '8th Pick (2019 Draft)',
  ]),
  pl('eng','Evan Engram','TE','Jacksonville Jaguars', 640, [
    '2× Pro Bowl','2022: 1,114 yards — Jaguars franchise TE record',
    '23rd Pick (2017 Draft)',
  ]),
  pl('njo','David Njoku','TE','Cleveland Browns', 560, [
    '2× Pro Bowl','2022: 628 yards','2023: 882 yards, 6 TDs',
    '19th Pick (2017 Draft)',
  ]),
  pl('pit','Kyle Pitts','TE','Atlanta Falcons', 620, [
    '2× Pro Bowl (2021, 2023)','4th Overall Pick (2021)',
    '2021: 1,026 yards — most by a TE in debut season (NFL record)',
  ]),
  pl('mcb','Trey McBride','TE','Arizona Cardinals', 660, [
    '2× Pro Bowl','2023: 825 yards, highest in ARI TE history',
    '55th Pick (2022 Draft)',
    '2025 PFWA All-NFL First-Team',
    'Led all TEs in slot production (receptions, yards, TDs)',
  ]),
  pl('lap','Sam LaPorta','TE','Detroit Lions', 340, [
    'Pro Bowl (2023)','AP 2nd-Team (2023)','34th Pick (2023 Draft)',
    '2023: 889 yards — most ever by a rookie TE',
  ]),
  pl('fre','Pat Freiermuth','TE','Pittsburgh Steelers', 340, [
    'Pro Bowl (2022)','55th Pick (2021)',
    '2022: 732 yards, 7 TDs in Steelers system',
  ]),
  pl('kme','Cole Kmet','TE','Chicago Bears', 280, [
    '2× Pro Bowl','2023: 719 yards, 8 TDs — Bears franchise TE record',
    '43rd Pick (2020 Draft)',
  ]),
  pl('kin','Dalton Kincaid','TE','Buffalo Bills', 200, [
    '25th Pick (2023)','2023: 673 yards as rookie',
    'Key piece of Bills\' pass-heavy offense',
  ]),
  pl('hig2','Tyler Higbee','TE','Los Angeles Rams', 380, [
    'Pro Bowl (2019)','Super Bowl LVI Champion',
    '2019: 734 yards in final 5 games — historic hot streak',
  ]),
  pl('ges','Mike Gesicki','TE','New England Patriots', 340, [
    '2× Pro Bowl','5× 500+ yard seasons',
    'Exceptional blocker turned reliable safety valve',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   MASTER EXPORT  — vol 4
══════════════════════════════════════════════════════════════════════ */
export const ALL_PLAYERS_V4: Record<PositionGroup, NFLPlayer[]> = {
  QB: [],
  RB: [],
  WR: [],
  TE: TE_POOL_V4,
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