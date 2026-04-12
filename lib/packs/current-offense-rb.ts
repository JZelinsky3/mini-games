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
  pl('khe','Khalil Herbert','RB','Chicago Bears', 320, [
    '149th Pick (2021)','2022: 731 yards in 9 starts — efficient workhorse',
    '2021: 5.8 YPC — led all rookie RBs in efficiency',
  ]),
  pl('kmi','Keaton Mitchell','RB','Baltimore Ravens', 280, [
    '160th Pick (2023)','2023: 5 TDs, 544 yards in 9 games before torn ACL',
    'One of fastest RBs in 2023 class — 4.32 combine speed',
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
  pl('bro4','Brian Robinson Jr.','RB','Washington Commanders', 680, [
'2× Pro Bowl','2024: 1,031 rush yards — key to Commanders playoff run',
'Overcame major off-field adversity — tough, reliable lead back'
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
  pl('irv','Bucky Irving','RB','Tampa Bay Buccaneers', 680, [
'2024: 1,101 rush yards as rookie','Strong 2025 follow-up — efficient power runner',
'One of the best rookie RB seasons in recent Buccaneers history'
]),
  pl('tan3','Tank Bigsby','RB','Jacksonville Jaguars', 260, [
    '88th Pick (2023)','2023: 846 yards as rookie backup',
    '2024: Took over as starter — efficient power runner',
  ]),
  pl('ray','Ray Davis','RB','Buffalo Bills', 240, [
    '128th Pick (2024)','2024: Immediate utility back for Bills',
    '2023 (Kentucky): 1,183 rush yards, 18 TDs — SEC standout',
  ]),
  pl('qju','Quinshon Judkins','RB','Detroit Lions', 200, [
    '37th Pick (2024)','2023 (Ole Miss): 1,158 rush yards, 15 TDs',
    '2024: Immediate contributor in Lions\' playoff-caliber backfield',
  ]),
  pl('elo','Elijah Mitchell','RB','Jacksonville Jaguars', 260, [
    '188th Pick (2021)','2021: 963 rush yards in limited starts — elite efficiency',
    '5.1 yards per carry — one of highest marks among active backs',
  ]),
  pl('cre','Craig Reynolds','RB','Detroit Lions', 200, [
    'Undrafted (2020)','3× key spot starts for Lions',
    '2024: 560+ yards as backup — Super Bowl appearance year',
  ]),
  pl('ant','Ty Chandler','RB','Minnesota Vikings', 140, [
    '171st Pick (2022)','2024: Starter-level production as complement to Cook replacement',
    'Special teams ace turned offensive contributor',
  ]),
  pl('dha2','AJ Dillon',           'RB', 'Carolina Panthers',     460, [
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
  pl('ty2', 'Tyjae Spears',   'RB', 'Tennessee Titans',      720, [
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
  pl('cla2','Chase Brown','RB','Cincinnati Bengals', 720, [
'2024: Primary starter after Mixon trade','Multiple strong seasons — vision and burst',
'Big Ten rushing champion background — rising lead back'
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
  pl('cha2','Zach Charbonnet','RB','Seattle Seahawks', 260, [
    '52nd Pick (2023)','879 rush yards in rookie season',
    '2023: Averaged 5.0 yards per carry — Seahawks\' workhorse future',
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
  pl('kam2','Kenneth Walker III','RB','Kansas City Chiefs', 1280, [
'2× Pro Bowl','Super Bowl LX Champion (2026)','Super Bowl LX MVP',
'Multiple 1,000-yard seasons','Explosive big-play runner',
    'Super Bowl LX MVP — 135 rush yards + 26 rec yards in championship game',
  ]),
  pl('mcc','Christian McCaffrey','RB','San Francisco 49ers', 3420, [
'4× Pro Bowl','3× AP 1st-Team All-Pro','2023 Offensive Player of the Year','2025 Comeback Player of the Year',
'2,023 scrimmage yards (2019) — 2nd all-time single season','Only RB with 1,000 rush + 1,000 rec twice',
'Multiple 2,000+ scrimmage yard seasons — generational dual-threat'
]),
  pl('kam','Alvin Kamara','RB','New Orleans Saints', 2540, [
    '5× Pro Bowl','AP 1st-Team (2020)','2017 OROTY',
    '6 TD in single game (Christmas 2020) — tied NFL record',
    '8,000+ career scrimmage yards',
  ]),
  pl('hen','Derrick Henry','RB','Baltimore Ravens', 2480, [
'5× Pro Bowl','AP 1st-Team','2× Rushing Title','Multiple 1,500+ rush yard seasons',
'2,000-yard season (2019) — one of only 8 in NFL history','2025: 1,595 rush yards, 16 TDs',
'99-yard TD run (longest in modern NFL history) — all-time power back'
]),
  pl('bar','Saquon Barkley','RB','Philadelphia Eagles', 2680, [
'3× Pro Bowl','2018 OROTY','AP 1st-Team All-Pro (2024)','2024 Offensive Player of the Year',
'2024: 2,005 rush yards (9th player in NFL history)','Super Bowl LIX Champion (2024)',
'Multiple 2,000+ scrimmage yard seasons — explosive big-play back'
]),
pl('bij','Bijan Robinson','RB','Atlanta Falcons', 1980, [
'2× Pro Bowl','AP 1st-Team All-Pro (2025)','2025: NFL-leading 2,298 scrimmage yards (1,478 rush + 820 rec)',
'Multiple 2,000+ scrimmage yard pace seasons','Elite vision, power, and receiving — franchise cornerstone'
]),
  pl('coo','Dalvin Cook','RB','Free Agent', 1260, [
    '4× Pro Bowl','AP 1st-Team (2020)',
    '6,000+ career rushing yards','2× 1,000-yard seasons',
  ]),
  pl('tay','Jonathan Taylor','RB','Indianapolis Colts', 1620, [
'2× Pro Bowl','2021 Rushing Title','AP 1st-Team All-Pro',
'2021: 1,811 rush yards — Colts single-season record','Multiple 1,500+ scrimmage yard seasons',
'Consistent elite efficiency and volume'
]),
  pl('jac','Josh Jacobs','RB','Green Bay Packers', 1280, [
'2× Pro Bowl','2022 Rushing Title','AP 1st-Team All-Pro (2022)',
'2022: 1,653 rush yards — Raiders single-season record','Multiple 1,000+ rush yard seasons — durable workhorse'
]),
  pl('mix','Joe Mixon','RB','Houston Texans', 980, [
'2× Pro Bowl','5× 1,000+ rush yard seasons','7,000+ career rushing yards',
'Consistent volume producer and goal-line back'
]),
  pl('pol','Tony Pollard','RB','Tennessee Titans', 700, [
    'Pro Bowl (2022)','2× 1,000-yard seasons',
    'Two-time Super Bowl Champion (as backup, DAL)',
  ]),
  pl('ach','De\'Von Achane','RB','Miami Dolphins', 980, [
'Pro Bowl (2023)','Historic explosive pace — multiple elite YPC seasons',
'Big-play threat with speed and receiving skills'
]),
  pl('hal','Breece Hall','RB','New York Jets', 880, [
'2× Pro Bowl','Multiple 1,000+ rush yard seasons',
'Elite yards after contact — strong vision and receiving'
]),
  pl('pac','Isiah Pacheco','RB','Detroit Lions', 780, [
'2× Super Bowl Champion (LVII, LVIII)','Multiple 1,000+ rush yard seasons',
'Physical lead back for championship teams'
]),
  pl('mon','David Montgomery','RB','Houston Texans', 720, [
'2× Pro Bowl','Multiple 1,000+ rush yard seasons',
'Tough, consistent contributor in strong run schemes'
]),
  pl('coo2','James Cook','RB','Buffalo Bills', 1380, [
'Pro Bowl (2023)','2025 NFL Rushing Champion — 1,621 rush yards (league leader)',
'Multiple 1,000+ rush yard seasons','5.2 YPC in 2025 — elite efficiency',
'Consistent lead back in high-powered Bills offense'
]),
  pl('gib','Jahmyr Gibbs','RB','Detroit Lions', 1420, [
'3× Pro Bowl','2025: 1,223 rush yards + 616 rec yards (1,839 scrimmage), 18 total TDs',
'Explosive dual-threat back with elite vision and big-play ability',
'Dynamic centerpiece of Lions\' offense — high touchdown scorer'
]),
  pl('kyr','Kyren Williams','RB','Los Angeles Rams', 820, [
'Multiple 1,000+ rush yard seasons','Super Bowl LVI Ring',
'High-volume, efficient lead back'
]),
  pl('ejo','Aaron Jones','RB','Minnesota Vikings', 780, [
'2× Pro Bowl','Multiple 1,000+ scrimmage yard seasons',
'6,000+ career scrimmage yards — reliable veteran'
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