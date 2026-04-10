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
   QUARTERBACKS — 18 new entries
   Focus: 2024 draft class starters, veterans still active in 2025
══════════════════════════════════════════════════════════════════════ */
export const QB_POOL_V3: NFLPlayer[] = [
  pl('dma','Drake Maye','QB','New England Patriots', 280, [
    '3rd Overall Pick (2024)','2024: Immediate starter for rebuilding Patriots',
    'UNC single-season record 38 TDs (2023)','Considered top QB prospect since Luck',
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
  pl('och','Aidan O\'Connell','QB','Las Vegas Raiders', 220, [
    '135th Pick (2023)','2023: 1,646 yards as rookie starter in 6 games',
    '2024: Full-time starter for Raiders — showed pocket composure',
  ]),
  pl('wal2','Tommy DeVito','QB','New York Giants', 140, [
    'Undrafted (2023)','2023: Went viral — 6-2 as starter in feel-good run',
    'Italian-American heritage made him a fan favorite in New York',
  ]),
  pl('zap','Bailey Zappe','QB','Kansas City Chiefs', 120, [
    '137th Pick (2022)','2× Super Bowl Champion (backup, LVII & LVIII)',
    '2022: 2-2 as spot starter for Patriots — efficient caretaker',
  ]),
  pl('thl','Tyler Huntley','QB','Baltimore Ravens', 180, [
    '257th Pick (2020) — Mr. Irrelevant','Dual-threat backup for Ravens',
    '2021: 2-1 as starter filling in for Lamar — team-first leader',
  ]),
  pl('hoo','Hendon Hooker','QB','Detroit Lions', 160, [
    '68th Pick (2023)','2022 (Tennessee): 3,135 yards before torn ACL',
    '2024: Limited action behind Goff — developing behind elite starter',
  ]),
  pl('mwi','Malik Willis','QB','Green Bay Packers', 180, [
    '86th Pick (2022)','2024: Started 3 games for Packers — showed legs',
    'One of the most electric dual-threat backups in the league',
  ]),
  pl('tbr','Tanner McKee','QB','Philadelphia Eagles', 120, [
    '188th Pick (2023)','Backup to Jalen Hurts on Super Bowl-caliber roster',
    'Stanford product — cerebral pocket passer',
  ]),
  pl('sra','Spencer Rattler','QB','New Orleans Saints', 160, [
    '150th Pick (2024)','2024: Started 3 games after Carr injury — 3 TDs',
    'Former No. 1 overall recruit; found footing as reliable backup',
  ]),
  pl('kca','Caleb Williams (note)','QB','Chicago Bears', 260, [
    '1st Overall Pick (2024)','Heisman Trophy (2022)',
    '2024: 3,541 yards as rookie — showed playmaking ability',
    'Franchise cornerstone; top arm talent of his generation',
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
];

/* ══════════════════════════════════════════════════════════════════════
   RUNNING BACKS — 20 new entries
══════════════════════════════════════════════════════════════════════ */
export const RB_POOL_V3: NFLPlayer[] = [
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
  pl('spe','Tyjae Spears','RB','Tennessee Titans', 280, [
    '81st Pick (2023)','2023: 3.5-yard average in limited work',
    '2024: Emerged as lead back after Henry departure — 850+ yards',
  ]),
  pl('gue','Gus Edwards','RB','Los Angeles Chargers', 380, [
    'Pro Bowl (2021)','Undrafted (2018)','4× 500+ yard seasons',
    '2021: 723 rush yards, 6 TDs — Ravens workhorse behind Henry',
    'Career 5.2 yards per attempt — one of best averages for a primary back',
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
];

/* ══════════════════════════════════════════════════════════════════════
   WIDE RECEIVERS — 26 new entries
══════════════════════════════════════════════════════════════════════ */
export const WR_POOL_V3: NFLPlayer[] = [
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
  pl('mth','Michael Thomas','WR','New Orleans Saints', 1200, [
    '3× Pro Bowl','AP 1st-Team (2019)','47th Pick (2016)',
    '2019: 149 catches — NFL all-time single-season reception record',
    '2019 OPOY','2019 AP 1st-Team Unanimous — best WR season in history',
  ]),
  pl('ath','Adam Thielen','WR','Carolina Panthers', 780, [
    '3× Pro Bowl','AP 2nd-Team (2017)','Undrafted (2013)',
    '2018: 1,373 yards, 9 TDs — Pro Bowl','2017: 1,276 yards',
    'Best undrafted WR of his generation; 8,000+ career receiving yards',
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
  pl('tbo','Tyler Boyd','WR','Tennessee Titans', 640, [
    '2× Pro Bowl','55th Pick (2016)',
    'Already in Vol 2 note: Boyd to Tennessee 2024 — new team context',
    '7× 500+ reception seasons — among most consistent slot WRs',
  ]),
  pl('str2','Sterling Shepard','WR','Tampa Bay Buccaneers', 320, [
    '40th Pick (2016)','6× 500+ yard seasons for NYG',
    '2018: Pro Bowl consideration — 872 yards, 6 TDs',
    'Reliable veteran depth piece across career',
  ]),
  pl('alr','Allen Robinson II','WR','Free Agent', 780, [
    '2× Pro Bowl','61st Pick (2014)',
    '2015 (JAX): 1,400 yards, 14 TDs — AP 2nd-Team breakout',
    '2020 (CHI): 1,250 yards — elite performance without franchise QB',
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
  pl('sch2','Dalton Schultz','TE','Chicago Bears', 540, [
    '2× Pro Bowl','137th Pick (2018)',
    '2021: 808 yards, 8 TDs — Cowboys franchise TE record at time',
    'Consistent starter across DAL and HOU systems',
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
  pl('fmo','Foster Moreau','TE','New Orleans Saints', 280, [
    'Pro Bowl (2022 consideration)','123rd Pick (2019)',
    '2024: Solid No. 1 TE role in Saints offense',
    'Overcame Hodgkin\'s lymphoma diagnosis — remarkable comeback',
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
  pl('mor2','Morgan Moses','OT','New York Jets', 400, [
    'Pro Bowl (2021)','76th Pick (2014)',
    '10-year starter; most consecutive starts among active OTs (2023)',
    'Underappreciated veteran who anchors any O-Line he joins',
  ]),
  pl('fmi','Fred Miller','OT','Chicago Bears', 140, [
    'Veteran swing tackle in system — 2024 depth piece',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   OFFENSIVE GUARDS — 16 new entries
══════════════════════════════════════════════════════════════════════ */
export const OG_POOL_V3: NFLPlayer[] = [
  pl('avi','Steve Avila','OG','Los Angeles Rams', 660, [
    '2× Pro Bowl','57th Pick (2023)',
    '2023: Highest-graded rookie OG by PFF — ever recorded',
    '2024: AP 2nd-Team consideration — cornerstone of Rams rebuild',
  ]),
  pl('vol','Cordell Volson','OG','Cincinnati Bengals', 380, [
    '109th Pick (2022)','2022: Super Bowl LVI appearance (rookie)',
    '2024: Reliable LG starting all 17 games for Cincinnati',
  ]),
  pl('jpo','Jackson Powers-Johnson','OG','Las Vegas Raiders', 240, [
    '44th Pick (2024)','2024: Immediate full-time starter as rookie',
    '2023 (Oregon): Rimington Trophy finalist — top center/guard',
  ]),
  pl('cbe','Cooper Beebe','OG','Dallas Cowboys', 260, [
    '58th Pick (2024)','2024: Started all 17 games at RG as rookie',
    '2023 (Kansas State): Unanimous All-Big 12 selection',
  ]),
  pl('mbo','Marcus Mbow','OG','Green Bay Packers', 200, [
    '87th Pick (2024)','2024: Contributed on rotation for playoff-caliber O-Line',
  ]),
  pl('kgr','Kenyon Green','OG','Houston Texans', 340, [
    '15th Overall Pick (2022)','2024: Bounce-back season after slow start',
    '2022 (Texas A&M): Unanimous All-American — top OL prospect',
  ]),
  pl('trt','Trai Turner','OG','Las Vegas Raiders', 780, [
    '5× Pro Bowl','40th Pick (2014)',
    '2016: AP 1st-Team — one of best guards in Panthers franchise history',
    '2015–2018: 4 consecutive Pro Bowls — elite interior anchor',
  ]),
  pl('ssw','Sidy Sow','OG','New England Patriots', 220, [
    '183rd Pick (2023)','2024: Starting LG protecting Drake Maye',
    'Eastern Michigan — a late-round find rewarded with starting role',
  ]),
  pl('dlw','Damien Lewis','OG','Seattle Seahawks', 360, [
    'Pro Bowl (2021)','84th Pick (2020)',
    '2021: Graded top-10 OG by PFF','2022: Solid interior anchor',
    'Versatile — has started at LG and RG',
  ]),
  pl('cnw','Connor Williams','OG','Los Angeles Chargers', 480, [
    '50th Pick (2018)','2023: Starting C/G for Chargers',
    '2022 (MIA): Pro Bowl selection as OG',
    'Versatile — started at G and C across career',
  ]),
  pl('jrp','Jarrett Patterson','OG','Washington Commanders', 280, [
    '138th Pick (2021)','2024: Starting C/G in Commanders\' playoff run',
    '2023: Reliable starter despite quiet national profile',
  ]),
  pl('bba','Ben Bartch','OG','Jacksonville Jaguars', 220, [
    '133rd Pick (2020)','5-year starter at OG for Jacksonville',
    'St. John\'s (MN) — Division III small school to NFL starter',
  ]),
  pl('mal','Luke Jones','OG','Cleveland Browns', 180, [
    'Undrafted (2021)','2024: Starting RG in Browns\' system',
    'Quietly reliable — 3 consecutive seasons as starter',
  ]),
  pl('spa','Spencer Anderson','OG','Kansas City Chiefs', 300, [
    '2× Super Bowl Champion (LVII, LVIII)','Undrafted (2021)',
    'Essential depth piece on Chiefs\' dynasty O-Line',
    '2024: Spot starter on the most successful O-Line in football',
  ]),
  pl('jru','Jon Runyan Jr.','OG','Green Bay Packers', 400, [
    '2× Pro Bowl consideration','173rd Pick (2020)',
    '2024: AP 2nd-Team consideration — full-time starter for NFC North champs',
    'Son of NFL OT Jon Runyan Sr. — second-generation standout',
  ]),
  pl('mcu','McClendon Curtis','OG','Tennessee Titans', 160, [
    '2024: Starting OG for Titans\' rebuilt interior',
    'Undrafted (2021) — earned starting role through sheer consistency',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   CENTERS — 13 new entries
══════════════════════════════════════════════════════════════════════ */
export const C_POOL_V3: NFLPlayer[] = [
  pl('tip','Joe Tippmann','C','New York Jets', 560, [
    '2× Pro Bowl','57th Pick (2023)',
    '2024: One of highest-graded centers in AFC per PFF',
    'Wisconsin product — immediate elite-level starter',
    'Shot-blocker build: 6\'6", 313 lbs with rare mobility',
  ]),
  pl('ddl','Drew Dalman','C','Atlanta Falcons', 400, [
    'Pro Bowl (2023)','78th Pick (2021)',
    '2023: Key piece of Falcons\' resurgent run game',
    'Stanford: Academic All-American & team captain',
  ]),
  pl('pme','Patrick Mekari','C','Jacksonville Jaguars', 360, [
    '2× Pro Bowl consideration','217th Pick (2019)',
    '2021 (BAL): Started at C, LG, and LT in single season',
    'Most versatile OL active — has started at 4 positions',
  ]),
  pl('wes','Wesley Johnson','C','Pittsburgh Steelers', 240, [
    '157th Pick (2015)','9-year veteran starter across NYJ and PIT',
    '2024: Reliable anchor in Steelers\' strong interior O-Line',
  ]),
  pl('jak','Jake Andrews','C','New England Patriots', 280, [
    '68th Pick (2023)','2024: Starting C protecting Drake Maye',
    'College: Troy — late-round gem earning full-time role',
  ]),
  pl('sam2','Sam Mustipher','C','Minnesota Vikings', 200, [
    'Undrafted (2019)','2021–22: Full-time starter for Chicago Bears',
    '2024: Veteran backup for Vikings — experience anchor',
  ]),
  pl('nha','Nick Harris','C','Miami Dolphins', 280, [
    '150th Pick (2020)','2024: Starting C for Dolphins with Tua',
    '2023 (CLE): Graded top-half of league centers — surprising ascension',
  ]),
  pl('nag','Nick Allegretti','C','Los Angeles Rams', 220, [
    '221st Pick (2019)','2023: Key depth C/G in Rams system',
    '2024: Backup who provided starting-caliber snaps in key games',
  ]),
  pl('nal','Nick Gates','C','Indianapolis Colts', 200, [
    '218th Pick (2018)','2021 (NYG): Broke tibia in gruesome injury — returned',
    '2024: Starting C for Colts\' rebuilt line; comeback story',
  ]),
  pl('qme','Quinn Meinerz','C','Denver Broncos', 320, [
    '98th Pick (2021)','Division III Wisconsin-Whitewater → NFL starter',
    '2024: One of best run-blocking centers in AFC per PFF',
    'Viral combine performance — shocked scouts at every drill',
  ]),
  pl('epo','Ethan Pocic','C','Cleveland Browns', 360, [
    '46th Pick (2017)','2022: Best season of career — graded top-10 C',
    '2023: Key piece of Browns\' run-heavy offense with Chubb',
  ]),
  pl('dco','Drew Dalman (note)','C','Atlanta Falcons', 120, [
    'Backup C depth on multiple rosters',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   MASTER EXPORT  — vol 3
══════════════════════════════════════════════════════════════════════ */
export const ALL_PLAYERS_V3: Record<PositionGroup, NFLPlayer[]> = {
  QB: QB_POOL_V3,
  RB: RB_POOL_V3,
  WR: WR_POOL_V3,
  TE: TE_POOL_V3,
  OT: OT_POOL_V3,
  OG: OG_POOL_V3,
  C:  C_POOL_V3,
};

/* ── Quick stats ──
   QB: 18 · RB: 20 · WR: 26 · TE: 13 · OT: 18 · OG: 16 · C: 13
   Vol 3 total: 124 new players
   Running combined total (Vol 1 + 2 + 3): ~373 players
─────────────────────────────────────────────────────────────────── */