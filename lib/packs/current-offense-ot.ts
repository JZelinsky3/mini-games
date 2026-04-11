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
    '2× Super Bowl Champion (LVII, LVIII)',
    'Right tackle anchor for Chiefs dynasty O-Line',
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
   OFFENSIVE TACKLES  (pool: OT — feeds LT & RT slots)
   Target spread → 2 legendary · 4 epic · 5 rare · 5 common
══════════════════════════════════════════════════════════════════════ */
export const OT_POOL: NFLPlayer[] = [
  pl('twi','Trent Williams','OT','San Francisco 49ers', 3040, [
    '11× Pro Bowl (most ever by an OT)','4× AP 1st-Team',
    'Unanimous All-Pro 2021 & 2022','AP 2nd-Team ×2',
    'Widely considered the best OT in NFL history (active era)',
  ]),
  pl('ljo','Lane Johnson','OT','Philadelphia Eagles', 2060, [
    '6× Pro Bowl','3× AP 1st-Team','Super Bowl LII Champion',
    'Super Bowl LVII appearance','Anchor of Eagles\' dominant O-Line',
    '4th Overall Pick (2013)',
  ]),
  pl('bak','David Bakhtiari','OT','Green Bay Packers', 1820, [
    '4× Pro Bowl','3× AP 1st-Team',
    'Highest paid OL in NFL history (when signed, 2020)',
    '2020: Allowed 0 sacks in 16 games',
  ]),
  pl('smi','Tyron Smith','OT','New York Jets', 1660, [
    '9× Pro Bowl','AP 1st-Team',
    '1st Overall Pick candidate — 9th pick (2011)',
    'Most Pro Bowls by a Cowboys OT (franchise record)',
  ]),
  pl('sla','Rashawn Slater','OT','Los Angeles Chargers', 1480, [
    '3× Pro Bowl','AP 1st-Team (2022)','AP 2nd-Team',
    '13th Pick (2021)','First OT to make Pro Bowl in each of first 3 seasons',
  ]),
  pl('sew','Penei Sewell','OT','Detroit Lions', 1640, [
    '4× Pro Bowl','3× AP 1st-Team All-Pro (2023-2025)',
    '7th Pick (2021)','Bednarik Award winner (college)',
    'Cornerstone of Lions\' elite offensive line',
    '2025 First-Team All-Pro (Right Tackle) — PFF\'s highest-graded tackle (95.2 overall)',
  ]),
  pl('tho','Andrew Thomas','OT','New York Giants', 1020, [
    '2× Pro Bowl','AP 1st-Team (2023)','AP 2nd-Team',
    '4th Pick (2020)','2023: Surrendered 0 sacks in first 10 weeks',
  ]),
  pl('dar','Christian Darrisaw','OT','Minnesota Vikings', 680, [
    '2× Pro Bowl','23rd Pick (2021)',
    'Pro Bowl 2022 & 2023 — ascending starter',
  ]),
  pl('tun','Laremy Tunsil','OT','Houston Texans', 940, [
    '3× Pro Bowl','Highest paid OL when extended (2020)',
    '13th Pick (2016 Draft)',
  ]),
  pl('mil','Kolton Miller','OT','Las Vegas Raiders', 560, [
    '2× Pro Bowl','15th Pick (2018 Draft)',
    '2022: Allowed just 1 sack all season',
  ]),
  pl('cam','Cam Robinson','OT','Jacksonville Jaguars', 400, [
    'Pro Bowl (2021)','34th Pick (2017)',
    'Anchored rebuilt Jags O-Line 2022',
  ]),
  pl('ber','Bernhard Raimann','OT','Indianapolis Colts', 200, [
    '3rd Round Pick (2022)','Starting LT by Week 1 of rookie season',
    'Consistent starter — ascending',
  ]),
  pl('dw','Darnell Wright','OT','Chicago Bears', 140, [
    '10th Pick (2023)','Immediate starter — highest-drafted Bears OT in decades',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   OFFENSIVE TACKLES  — 16 entries
   Rarity: 11 common · 4 rare · 1 epic
══════════════════════════════════════════════════════════════════════ */
export const OT_POOL_V5: NFLPlayer[] = [
  pl('lla', 'Laken Tomlinson','OT','Free Agent',               400, [
    '28th Pick 2015', 'Started at LT, LG across 9-year career',
    'Duke: 2-year starter — athletic enough to play both tackle and guard',
  ]),
  pl('mca2','Mike Onwenu',   'OT', 'New England Patriots',     480, [
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
  pl('aco','Abraham Lucas','OT','Seattle Seahawks', 670, [
    '72nd Pick 2022', '2022–24: Full-time RT for Seahawks',
    'Washington State: 2-year Pac-12 All-Conference selection',
    'Super Bowl LX Champion (2026) — starting right tackle for the Seahawks',
  ]),
  pl('cfl2','Calvin Anderson',    'OT', 'Denver Broncos',           220, [
    'Undrafted 2019', '2023: Starting LT for Broncos in multiple games',
    'Texas: 4-year starting tackle — earned roster spot on merit',
  ]),
  pl('mne', 'Morgan Moses',       'OT', 'New York Jets',            640, [
    'Pro Bowl (2021)','66th Pick (2014)',
    '10-year starter; most consecutive starts among active OTs (2023)',
    'Underappreciated veteran who anchors any O-Line he joins',
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
  pl('tmo','Taylor Moton','OT','Carolina Panthers', 1040, [
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
  pl('mbec','Mekhi Becton','OT','Philadelphia Eagles', 400, [
    '11th Pick (2020)','Super Bowl LIX Champion (2024)',
    '2020: Pro Bowl trajectory before injury derailed 3 seasons',
    'Switched to guard role 2023; versatile and imposing at 363 lbs',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   OFFENSIVE TACKLES — 18 new entries
══════════════════════════════════════════════════════════════════════ */
export const OT_POOL_V3: NFLPlayer[] = [
  pl('rst','Ronnie Stanley','OT','Baltimore Ravens', 1020, [
    '3× Pro Bowl','AP 1st-Team (2019)','6th Pick (2016)',
    '2019: Highest-graded LT in NFL per PFF — 87.3',
    'Missed most of 2020–2022 with ankle injuries; returned 2023',
  ]),
  pl('ena','Evan Neal','OT','New York Giants', 360, [
    '7th Overall Pick (2022)','2023: Improved dramatically in 2nd season',
    '2024: Emerged as reliable LT — NYG franchise cornerstone',
    'Physical specimen at 6\'7", 337 lbs with elite wingspan',
  ]),
  pl('joW','Jonah Williams','OT','New York Giants', 480, [
    '11th Pick (2019)','3× starter for Bengals at LT',
    '2021: Part of CIN O-Line that protected Burrow to Super Bowl',
    '2024: Signed with Giants; reliable veteran anchor',
  ]),
  pl('daw2','Dawand Jones','OT','Cleveland Browns', 280, [
    '100th Pick (2023)','Largest player in NFL at 6\'8", 374 lbs',
    '2024: Starting RT for Browns — mammoth right-side anchor',
  ]),
  pl('cmd','Cody Mauch','OT','Tennessee Titans', 300, [
    '35th Pick (2023)','Immediate LG/LT starter for Tennessee',
    '2023 (NDSU): Most athletic OL in draft — 4.89 combine',
  ]),
  pl('bfr','Blake Freeland','OT','Indianapolis Colts', 260, [
    '37th Pick (2023)','2024: Starting LT protecting Anthony Richardson',
    '6\'8" frame — one of tallest OTs in NFL',
  ]),
  pl('wmr','Wanya Morris','OT','Kansas City Chiefs', 280, [
    '130th Pick (2022)','2× Super Bowl Champion (LVII, LVIII)',
    '2024: Key backup turned spot starter on Chiefs dynasty line',
  ]),
  pl('npf','Nicholas Petit-Frere','OT','Tennessee Titans', 240, [
    '69th Pick (2022)','Ohio State All-American',
    '2024: Anchoring Titans rebuild as full-time RT starter',
  ]),
  pl('cho','Chukwuma Okorafor','OT','Pittsburgh Steelers', 340, [
    '3× Pro Bowl consideration','97th Pick (2018)',
    '2023: Solid RT starter allowing 0 sacks across 6-game stretch',
    'Reliable multi-year starter on Pittsburgh line',
  ]),
  pl('jos2','Josh Jones','OT','Houston Texans', 460, [
    '2× Pro Bowl','73rd Pick (2020)',
    '2022: Pro Bowl LT for Houston — allowed just 1 sack all year',
    '2023: Key piece of Texans\' surprise playoff run',
  ]),
  pl('vcl','Vederian Lowe','OT','Chicago Bears', 220, [
    '109th Pick (2022)','Starting LT for Bears protecting Caleb Williams',
    '2024: Ascended into reliable starter — anchoring rebuilt line',
  ]),
  pl('sfo','Stone Forsythe','OT','Seattle Seahawks', 200, [
    '186th Pick (2021)','Starting RT for Seattle 2023–2024',
    'Quietly consistent — never missed a start in 2023',
  ]),
  pl('jdr','Jack Driscoll','OT','Buffalo Bills', 260, [
    '101st Pick (2020)','2× Super Bowl appearance roster (BUF)',
    'Versatile swing T/G — valuable depth on Bills line',
  ]),
  pl('ter2','Terell Smith','OT','Minnesota Vikings', 180, [
    '105th Pick (2023)','2024: Spot starter filling injuries on Vikings line',
  ]),
  pl('jay2','Jaelyn Duncan','OT','Los Angeles Rams', 200, [
    '96th Pick (2023)','Immediate depth for Rams\' Super Bowl-contending line',
    'Maryland product with rare length — 36" arms',
  ]),
  pl('jac3','Jack Conklin','OT','Cleveland Browns', 720, [
    '3× Pro Bowl','AP 1st-Team (2016)','8th Pick (2016)',
    '2016 Super Bowl run (TEN)','2020: AP 1st-Team — anchored Browns\' best O-Line',
    'Missed 2023–24 with injuries but former elite RT',
  ]),
  pl('fmi','Fred Miller','OT','Chicago Bears', 140, [
    'Veteran swing tackle in system — 2024 depth piece',
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
  pl('crs','Charles Cross','OT','Seattle Seahawks', 590, [
    '9th Pick (2022)','2× Pro Bowl','2023: Surrendered fewest pressures among LTs (per PFF)',
    'One of the most pro-ready OL prospects in recent draft history',
    'Super Bowl LX Champion (2026) — starting left tackle for the Seahawks',
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
   MASTER EXPORT  — Vol 5
══════════════════════════════════════════════════════════════════════ */
export const ALL_PLAYERS_V5: Record<PositionGroup, NFLPlayer[]> = {
  QB: [],
  RB: [],
  WR: [],
  TE: [],
  OT: OT_POOL_V5,
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