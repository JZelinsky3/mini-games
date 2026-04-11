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
   RUNNING BACKS — 20 entries
   Rarity split: 13 common · 6 rare · 1 epic
══════════════════════════════════════════════════════════════════════ */
export const RB_POOL_V1: NFLPlayer[] = [
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
  pl('jma','Jordan Mason','RB','San Francisco 49ers', 480, [
    'Pro Bowl (2024)','232nd Pick (2023)',
    '2024: 1,032 rush yards filling in for injured McCaffrey',
    'One of best UDFA/late-round RB stories of the 2024 season',
  ]),
  pl('jav','Javonte Williams','RB','Denver Broncos', 480, [
    'Pro Bowl (2021)','35th Pick (2021)',
    '2021: 903 rush yards as rookie — efficient workhorse',
    'Returned from torn ACL (2022) to reclaim starter role 2024',
  ]),
  pl('bro4','Brian Robinson Jr.','RB','Washington Commanders', 440, [
    '2× Pro Bowl (2023, 2024)','98th Pick (2022)',
    '2024: 1,031 rush yards — cornerstone of Commanders playoff run',
    'Shot twice in armed robbery (2022) — returned same season',
  ]),
  pl('san','Miles Sanders','RB','Carolina Panthers', 480, [
    '53rd Pick (2019)','2022 Pro Bowl',
    '2022: 1,269 rush yards — Eagles franchise RB record in a single season',
    '2021 AP 2nd-Team consideration',
  ]),
  pl('kah','Kareem Hunt','RB','Cleveland Browns', 580, [
    '3× Pro Bowl','2017: Rushing title as a rookie (1,327 yards)',
    '2022: 1,000+ scrimmage yards alongside Chubb',
    '86th Pick (2017) — one of best 3rd-round RB picks in recent history',
  ]),
  pl('sin','Devin Singletary','RB','New York Giants', 380, [
    'Pro Bowl (2022)','74th Pick (2019)',
    '2022: 1,057 rush yards for Bills','2024: 1,000+ yards for Giants',
    '3× 1,000-yard seasons — model of consistency',
  ]),
  pl('irv','Bucky Irving','RB','Tampa Bay Buccaneers', 320, [
    '125th Pick (2024)','2024: 1,101 rush yards as rookie — 3rd most by TB RB ever',
    'Most yards after contact per attempt among 2024 rookie RBs',
  ]),
  pl('tan3','Tank Bigsby','RB','Jacksonville Jaguars', 260, [
    '88th Pick (2023)','2023: 846 yards as rookie backup',
    '2024: Took over as starter — efficient power runner',
  ]),
  pl('ray','Ray Davis','RB','Buffalo Bills', 240, [
    '128th Pick (2024)','2024: Immediate utility back for Bills',
    '2023 (Kentucky): 1,183 rush yards, 18 TDs — SEC standout',
  ]),
  pl('bco','Blake Corum','RB','Los Angeles Rams', 220, [
    '88th Pick (2024)','2× Rose Bowl champion (Michigan)',
    '2024: Versatile back in Rams committee — contributed in Year 1',
  ]),
  pl('qju','Quinshon Judkins','RB','Detroit Lions', 200, [
    '37th Pick (2024)','2023 (Ole Miss): 1,158 rush yards, 15 TDs',
    '2024: Immediate contributor in Lions\' playoff-caliber backfield',
  ]),
  pl('rob','Roschon Johnson','RB','Chicago Bears', 220, [
    '115th Pick (2023)','2024: Lead back for Bears behind Caleb Williams',
    '2023 (Texas): Consistent two-down back — 700+ yards as Bijan backup',
  ]),
  pl('elo','Elijah Mitchell','RB','Jacksonville Jaguars', 260, [
    '188th Pick (2021)','2021: 963 rush yards in limited starts — elite efficiency',
    '5.1 yards per carry — one of highest marks among active backs',
  ]),
  pl('dem','Emari Demercado','RB','Arizona Cardinals', 160, [
    'Undrafted (2022)','2023: 588 yards as lead back in Arizona',
    'Versatile pass-catcher — quality bridge starter',
  ]),
  pl('mar2','Marshawn Lloyd','RB','Houston Texans', 180, [
    '65th Pick (2023)','2024: Solid backup role behind Achane era',
    '2022 (USC): 1,421 rush yards before injury — elite prospect',
  ]),
  pl('cre','Craig Reynolds','RB','Detroit Lions', 200, [
    'Undrafted (2020)','3× key spot starts for Lions',
    '2024: 560+ yards as backup — Super Bowl appearance year',
  ]),
  pl('gie','Antonio Gibson','RB','New England Patriots', 320, [
    'Pro Bowl (2021)','66th Pick (2020)',
    '2020: 795 yards, 11 TDs as rookie — WAS franchise RB record start',
    '2021: 1,037 rush yards','Transitioned to WR role in 2024',
  ]),
  pl('ant','Ty Chandler','RB','Minnesota Vikings', 140, [
    '171st Pick (2022)','2024: Starter-level production as complement to Cook replacement',
    'Special teams ace turned offensive contributor',
  ]),
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
  pl('kne', 'Kimani Vidal',        'RB', 'Los Angeles Chargers',  260, [
    '248th Pick 2024', '2024: Depth back in Chargers system',
    'Troy: FBS-record 25 100-yard games in career',
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
  pl('dha', 'D\'Andre Swift',     'RB', 'Chicago Bears',            940, [
    '2× Pro Bowl', 'AP 2nd-Team 2023',
    '2023: 1,049 rush yards (Eagles) + 1,000+ total scrimmage yards',
    '35th Pick 2020 — multi-year top-10 back',
  ]),
  pl('caf', 'Chuba Hubbard',      'RB', 'Carolina Panthers',        780, [
    '126th Pick 2021', '2023: Full season starter — 1,023 rush yards',
    'Oklahoma State: 2020 Big 12 Offensive POY',
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
    'Pro Bowl (2021)','Undrafted (2018)','4× 500+ yard seasons',
    '2021: 723 rush yards, 6 TDs — Ravens workhorse behind Henry',
    'Career 5.2 yards per attempt — one of best averages for a primary back',
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
  pl('hub','Chuba Hubbard','RB','Carolina Panthers', 200, [
    '69th Pick (2021)','726 rush yards (2023) filling for Miles Sanders',
  ]),
  pl('sto','Tony Jones Jr.','RB','Free Agent', 120, [
    'Undrafted gem; versatile pass-catcher out of Notre Dame',
  ]),
  pl('kam2','Kenneth Walker III','RB','Seattle Seahawks', 1090, [
    '2× Pro Bowl','41st Pick (2022)',
    '2022: 1,050 rush yards as rookie despite late start',
    '2023: 905 rush yards — Seahawks\' franchise RB of future',
    'Super Bowl LX Champion (2026)',
    'Super Bowl LX MVP — 135 rush yards + 26 rec yards in championship game',
  ]),
  pl('mcc','Christian McCaffrey','RB','San Francisco 49ers', 2860, [
    '3× Pro Bowl','AP 1st-Team','2023 Offensive Player of Year',
    '2,023 scrimmage yards (2019) — 2nd all-time single season',
    'Only RB with 1,000 rush + 1,000 rec in same season (twice)',
  ]),
  pl('kam','Alvin Kamara','RB','New Orleans Saints', 2540, [
    '5× Pro Bowl','AP 1st-Team (2020)','2017 OROTY',
    '6 TD in single game (Christmas 2020) — tied NFL record',
    '8,000+ career scrimmage yards',
  ]),
  pl('hen','Derrick Henry','RB','Baltimore Ravens', 1960, [
    '4× Pro Bowl','2× Rushing Title (2019–20)','AP 1st-Team',
    '2,000-yard season (2019) — one of 8 in NFL history',
    '99-yard TD run (longest in modern NFL history)',
  ]),
  pl('bar','Saquon Barkley','RB','Philadelphia Eagles', 1580, [
    '3× Pro Bowl','2018 OROTY','AP 1st-Team',
    '2018: 2,028 scrimmage yards','Super Bowl LIX Champion (2024)',
  ]),
  pl('coo','Dalvin Cook','RB','Free Agent', 1260, [
    '4× Pro Bowl','AP 1st-Team (2020)',
    '6,000+ career rushing yards','2× 1,000-yard seasons',
  ]),
  pl('tay','Jonathan Taylor','RB','Indianapolis Colts', 1100, [
    '2× Pro Bowl','2021 Rushing Title','AP 1st-Team',
    '2021: 1,811 rush yards — Colts single-season record',
  ]),
  pl('jac','Josh Jacobs','RB','Green Bay Packers', 980, [
    '2× Pro Bowl','2022 Rushing Title','AP 1st-Team (2022)',
    '2022: 1,653 rush yards — Raiders single-season record',
  ]),
  pl('mix','Joe Mixon','RB','Houston Texans', 760, [
    '2× Pro Bowl','7,000+ career rushing yards',
    'Only RB with 2,000+ rush yards for Cincinnati franchise',
  ]),
  pl('pol','Tony Pollard','RB','Tennessee Titans', 700, [
    'Pro Bowl (2022)','2× 1,000-yard seasons',
    'Two-time Super Bowl Champion (as backup, DAL)',
  ]),
  pl('ach','De\'Von Achane','RB','Miami Dolphins', 620, [
    'Pro Bowl (2023)','2023: 800+ yards in first 6 games',
    '72.4 yards-per-game — fastest to 500 rush yards (history)',
  ]),
  pl('hal','Breece Hall','RB','New York Jets', 540, [
    '2× Pro Bowl','1,000+ rush yards (2023)',
    'Most yards after contact per attempt among active RBs',
  ]),
  pl('pac','Isiah Pacheco','RB','Kansas City Chiefs', 460, [
    '2× Super Bowl Champion (LVII, LVIII)','1,000+ rush yards (2023)',
  ]),
  pl('mon','David Montgomery','RB','Detroit Lions', 420, [
    '2× Pro Bowl','1,000+ rush yards (2023 NFC Championship run)',
  ]),
  pl('gib','Jahmyr Gibbs','RB','Detroit Lions', 380, [
    '12th Pick (2023 Draft)','945 rush + rec yards in rookie season',
  ]),
  pl('coo2','James Cook','RB','Buffalo Bills', 360, [
    'Pro Bowl (2023)','1,122 rush yards (2023)',
  ]),
  pl('whi','Rachaad White','RB','Tampa Bay Buccaneers', 280, [
    '1,000+ scrimmage yards (2023)',
    '2022: 1,000+ yards in limited work — led TampaBay rushing',
  ]),
  pl('kyr','Kyren Williams','RB','Los Angeles Rams', 320, [
    '1,144 rush yards (2023)','Super Bowl LVI Ring',
    '17 total TDs (2023) — 2nd most by an RB',
  ]),
  pl('ejo','Aaron Jones','RB','Minnesota Vikings', 580, [
    '2× Pro Bowl','2020: 9 TDs, 1,000+ rush yards',
    '6,000+ career scrimmage yards',
  ]),
  pl('ell','Ezekiel Elliott','RB','New England Patriots', 860, [
    '3× Pro Bowl','2× Rushing Title (2016, 2018)','AP 1st-Team',
    '4th Overall Pick (2016)','2016: 1,631 rush yards as rookie',
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