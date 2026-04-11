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
   QUARTERBACKS — 18 new entries
   Focus: 2024 draft class starters, veterans still active in 2025
══════════════════════════════════════════════════════════════════════ */
export const QB_POOL_V1: NFLPlayer[] = [
  pl('dma','Drake Maye','QB','New England Patriots', 2480, [
    '3rd Overall Pick (2024)','2025: Led NFL in completion % (72.0), YPA (8.9), and passer rating (113.5)',
    '4394 pass yds, 31 TD, 8 INT + 450 rush yds & 4 rush TD','Runner-up for 2025 NFL MVP',
    'Patriots reached Super Bowl LX in Year 2 — franchise cornerstone',
    'UNC single-season record 38 TDs (2023) — elite arm talent + mobility'
  ]),
  pl('jjm','J.J. McCarthy','QB','Minnesota Vikings', 240, [
    '10th Overall Pick (2024)','National Championship winner (Michigan 2023)',
    '2023: 22-3 as starter — highest win % in Big Ten history',
    'Elite pocket presence — advanced beyond his draft slot',
  ]),
  pl('mpe','Michael Penix Jr.','QB','Atlanta Falcons', 320, [
    '8th Overall Pick (2024)','Biletnikoff-era dual threat at Washington',
    '2023: 4,903 pass yards — led Huskies to CFP Championship Game',
    'Took over from Kirk Cousins mid-2024 season',
  ]),
  pl('how','Sam Howell','QB','Seattle Seahawks', 340, [
    'Pro Bowl (2023 honorable mention)','13th Pick (2022)',
    '2023: Full-time starter — 3,807 yards, 21 TDs for Washington',
    '2023: Most sacks allowed by a QB (65) — still showed toughness',
  ]),
  pl('och','Aidan O\'Connell','QB','Las Vegas Raiders', 240, [
    '135th Pick (2023)','2023: 1,646 yards as rookie starter in 6 games',
    '2024: Full-time starter for Raiders — showed pocket composure',
  ]),
  pl('wal2','Tommy DeVito','QB','New York Giants', 140, [
    'Undrafted (2023)','2023: Went viral — 6-2 as starter in feel-good run',
    'Italian-American heritage made him a fan favorite in New York',
  ]),
  pl('thl','Tyler Huntley','QB','Baltimore Ravens', 180, [
    '257th Pick (2020) — Mr. Irrelevant','Dual-threat backup for Ravens',
    '2021: 2-1 as starter filling in for Lamar — team-first leader',
  ]),
  pl('hoo','Hendon Hooker','QB','Detroit Lions', 160, [
    '68th Pick (2023)','2022 (Tennessee): 3,135 yards before torn ACL',
    '2024: Limited action behind Goff — developing behind elite starter',
  ]),
  pl('mwi','Malik Willis','QB','Miami Dolphins', 420, [
    '86th Pick (2022)','2025: Electric backup in Green Bay — strong dual-threat play',
    '2026: Signed as starter for Dolphins after strong backup seasons',
    'Known for elite athleticism and deep-ball ability — high-upside veteran backup turned starter'
  ]),
  pl('tbr','Tanner McKee','QB','Philadelphia Eagles', 120, [
    '188th Pick (2023)','Backup to Jalen Hurts on Super Bowl-caliber roster',
    'Stanford product — cerebral pocket passer',
  ]),
  pl('sra','Spencer Rattler','QB','New Orleans Saints', 160, [
    '150th Pick (2024)','2024: Started 3 games after Carr injury — 3 TDs',
    'Former No. 1 overall recruit; found footing as reliable backup',
  ]),
  pl('kca','Caleb Williams','QB','Chicago Bears', 1680, [
    '1st Overall Pick (2024)','Heisman Trophy (2022)',
    '2025: Franchise-record 3,942 pass yds, 27 TD, 7 INT — led Bears to NFC North title',
    'Improved decision-making and mobility under new coaching — franchise QB with elite arm talent',
    'Multiple Offensive Player of the Week honors'
  ]),
  pl('jdb','Jacoby Brissett','QB','Washington Commanders', 300, [
    'Pro Bowl (2017)','29th Pick (2016)',
    'Reliable starter in 3 cities — multiple bridge-starter seasons',
    '2022 (CLE): 1,688 yards filling in for Watson — steady caretaker',
  ]),
  pl('aba','Andy Dalton','QB','Carolina Panthers', 380, [
    '35th Pick (2011)','3× Pro Bowl','2015: Led Bengals to 12-4',
    '30,000+ career passing yards — respected vet leader',
  ]),
  pl('mma','Marcus Mariota','QB','Washington Commanders', 520, [
    '3× Pro Bowl','2nd Overall Pick (2015)','2022 OROTY finalist (ATL)',
    '2022 (ATL): 2,219 rush yards — highest ever for a starting QB in first 8 weeks',
  ]),
  pl('jga','Jimmy Garoppolo','QB','Los Angeles Rams', 540, [
    '3× Pro Bowl (backup context)','62nd Pick (2014)',
    '2021 (SF): Led 49ers to NFC Championship — 3,810 yards, 20 TDs',
    'Brady\'s heir apparent in New England; elite when healthy',
  ]),
  pl('cas','Carson Wentz','QB','Los Angeles Rams', 580, [
    '2× Pro Bowl','2nd Overall Pick (2016)',
    '2017 MVP pace (33 TD, 7 INT) before torn ACL',
    'Super Bowl LII Champion (backup, PHI)',
  ]),
  pl('rgr', 'Ryan Tannehill',     'QB', 'Free Agent',               480, [
    '2× Pro Bowl', 'AP 2nd-Team All-Pro 2019',
    '2019: 117.5 passer rating (2nd-highest ever for a season)',
  ]),
  pl('zco', 'Zach Wilson',        'QB', 'Denver Broncos',           180, [
    '2nd Overall Pick 2021', 'BYU: 33 TDs / 3 INTs in final college season',
    'Versatile scrambler — still just 25 in 2025',
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
  pl('jdo2','Joshua Dobbs',         'QB', 'San Francisco 49ers',      240, [
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
  pl('jdx', 'Jacoby Brissett',    'QB', 'Washington Commanders',    360, [
    '91st Pick 2016', '2022 (CLE): 5-7 as starter — led Browns competently',
    '9-year veteran backup — steady presence in every locker room',
  ]),
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
  pl('jha','Jake Haener','QB','New Orleans Saints', 140, [
    '134th Pick (2023)','Emergency starter experience',
    'Fresno State: 2× Mountain West OPOY',
  ]),
  pl('nro','Nathan Rourke','QB','Jacksonville Jaguars', 120, [
    'Undrafted (2022) — from Canadian Football League',
    '2022 (CFL): Grey Cup MVP — dominant passer before NFL shot',
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
  pl('rwi','Russell Wilson','QB','Pittsburgh Steelers', 1680, [
    '9× Pro Bowl','AP 1st-Team (2019)','Super Bowl XLVIII Champion',
    '2012: Led Seahawks to back-to-back SB — youngest QB to win (then)',
    '300+ rushing yards in multiple seasons — elite dual-threat',
  ]),
  pl('sta','Matthew Stafford','QB','Los Angeles Rams', 1920, [
    '3× Pro Bowl','Super Bowl LVI Champion & MVP',
    '40,000+ career passing yards','2021: 41 TD — highest single-season total for LAR',
    '2025 AP NFL MVP — 4,707 pass yards & 46 TDs (league leader) in 17th season',
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
  pl('joh2','Bryce Young (HC)','QB','Carolina Panthers', 160, [
    '1st Overall Pick (2023)','Heisman Trophy (2021)',
    '2023: Led Panthers to several competitive games despite weak support',
  ]),
  pl('mah','Patrick Mahomes','QB','Kansas City Chiefs', 4120, [
    '3× Super Bowl Champion','3× Super Bowl MVP','2× League MVP','1× Offensive Player of the Year',
    '6× Pro Bowl','3× AP 1st-Team All-Pro (plus multiple 2nd-Team)',
    'NFL single-season TD record (2022, 50 TD)','Still the standard at QB — generational talent'
  ]),
  pl('laj','Lamar Jackson','QB','Baltimore Ravens', 3180, [
    '2× League MVP (unanimous 2019 & 2023)','3× AP 1st-Team All-Pro',
    '4× Pro Bowl','Fastest QB to 1,000 rushing yards',
    '2019: 36 TD / 6 INT — one of the most dominant dual-threat seasons ever',
  ]),
  pl('rod','Aaron Rodgers','QB','New York Jets', 3420, [
    '4× League MVP','Super Bowl XLV Champion','Super Bowl XLV MVP',
    '4× AP 1st-Team All-Pro','1× AP 2nd-Team All-Pro','10× Pro Bowl',
    'Highest single-season passer rating in NFL history (122.5 in 2011)',
  ]),
  pl('all','Josh Allen','QB','Buffalo Bills', 1740, [
    '5× Pro Bowl','2× AP 1st-Team','2020 Offensive Player of Year finalist',
    '1st QB with 4,000+ pass & 700+ rush yds in multiple seasons',
  ]),
  pl('bur','Joe Burrow','QB','Cincinnati Bengals', 1520, [
    '3× Pro Bowl','Super Bowl LVI Appearance','2× AP 2nd-Team',
    '2022 Comeback Player of Year','2nd pick (2020 Draft)',
  ]),
  pl('hur','Jalen Hurts','QB','Philadelphia Eagles', 1460, [
    '3× Pro Bowl','Super Bowl LVII Appearance','AP 2nd-Team',
    '2× 700+ rushing yards (QB record pace)','1st QB with 30 TD / 10 rush TD',
  ]),
  pl('dak','Dak Prescott','QB','Dallas Cowboys', 960, [
    '4× Pro Bowl','2021 Comeback Player of Year','2016 OROTY',
    '2023: 36 TD, highest passer rating in Cowboys history',
  ]),
  pl('her','Justin Herbert','QB','Los Angeles Chargers', 860, [
    '3× Pro Bowl','2020 OROTY','AP 2nd-Team',
    'Most TD passes through first 3 seasons (87) in NFL history',
  ]),
  pl('tua','Tua Tagovailoa','QB','Miami Dolphins', 740, [
    '3× Pro Bowl','2023 Passing Yards Leader (4,600)',
    '80.9 completion % (2023, 2nd all-time)',
  ]),
  pl('bro','Brock Purdy','QB','San Francisco 49ers', 680, [
    '2× Pro Bowl','Mr. Irrelevant (262nd pick, 2022)',
    'Highest win % as starter through first 2 seasons (min. 25 starts)',
  ]),
  pl('law','Trevor Lawrence','QB','Jacksonville Jaguars', 520, [
    '2× Pro Bowl','1st Overall Pick (2021)','1 comeback season (9-8)',
  ]),
  pl('str','C.J. Stroud','QB','Houston Texans', 480, [
    'Pro Bowl','2023 OROTY','2nd pick (2023 Draft)',
    '2023: 4,108 yds — highest rookie passing total in Texans history',
  ]),
  pl('lov','Jordan Love','QB','Green Bay Packers', 380, [
    'Pro Bowl','26th pick (2020)','2023: 32 TD, first full season starter',
  ]),
  pl('sab', 'Sam Darnold', 'QB', 'Seattle Seahawks', 910, [
    'Pro Bowl 2024', '35 TDs / 12 INTs in first full healthy season',
    '3rd Overall Pick 2018', 'Career revival at 27 — best passer rating of career (102.5)',
    'Super Bowl LX Champion (2026) — starting QB for Seahawks',
  ]),
  pl('fie','Kirk Cousins','QB','Atlanta Falcons', 420, [
    '2× Pro Bowl','3,000+ yards in 8 straight seasons',
    'One of only 4 QBs to throw 20+ TD in 9 consecutive seasons',
  ]),
  pl('gof','Jared Goff','QB','Detroit Lions', 640, [
    '2× Pro Bowl','Super Bowl LIII Appearance',
    '2023: 4,575 yds, 30 TD — franchise records',
  ]),
  pl('mai','Daniel Jones','QB','Indianapolis Colts', 920, [
    '6th Overall Pick (2019)','2025: Career resurgence — efficient starter (68% comp, 8.1 YPA, 100.2 rating)',
    'Led Colts to strong early-season record before injury','Proven dual-threat veteran with renewed momentum'
  ]),
  pl('wil','Kyler Murray','QB','Minnesota Vikings', 540, [
    '2× Pro Bowl','2019 OROTY','1st Overall Pick (2019)',
    '2 Heisman-era dual-threat records entering NFL',
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