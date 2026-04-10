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
     epic      → 1 500 – 2 799
     legendary → 2 800 +
───────────────────────────────────────────────────────────────────────────── */

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type PositionGroup = 'QB' | 'RB' | 'WR' | 'TE' | 'OT' | 'OG' | 'C';

export interface NFLPlayer {
  id:        string;
  name:      string;
  pos:       PositionGroup;   // pool position (OT covers LT & RT; OG covers LG & RG)
  team:      string;
  score:     number;
  rarity:    Rarity;
  accolades: string[];        // human-readable bullets shown on card
}

/* ─── helper so we don't repeat the rarity calc ─────────────────────── */
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
   QUARTERBACKS  (pool: QB)
   Target spread → 3 legendary · 4 epic · 5 rare · 5 common
══════════════════════════════════════════════════════════════════════ */
export const QB_POOL: NFLPlayer[] = [
  pl('mah','Patrick Mahomes','QB','Kansas City Chiefs', 3280, [
    '3× Super Bowl Champion','2× Super Bowl MVP','2× League MVP',
    '6× Pro Bowl','3× AP 1st-Team','NFL single-season TD record (2022, 50 TD)',
  ]),
  pl('laj','Lamar Jackson','QB','Baltimore Ravens', 2940, [
    '2× League MVP (unanimous 2019 & 2023)','4× Pro Bowl','2× AP 1st-Team',
    'Fastest QB to 1,000 rushing yards','2019: 36 TD / 6 INT — historic',
  ]),
  pl('rod','Aaron Rodgers','QB','New York Jets', 2860, [
    '4× League MVP','Super Bowl XLV Champion','Super Bowl XLV MVP',
    '10× Pro Bowl','2× AP 1st-Team','Highest single-season passer rating (2011)',
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
  pl('sam','Sam Darnold','QB','Minnesota Vikings', 180, [
    '3rd pick (2018)','Journeyman starter (NYJ · CAR · SF · MIN)',
  ]),
  pl('fie','Kirk Cousins','QB','Atlanta Falcons', 420, [
    '2× Pro Bowl','3,000+ yards in 8 straight seasons',
    'One of only 4 QBs to throw 20+ TD in 9 consecutive seasons',
  ]),
  pl('gof','Jared Goff','QB','Detroit Lions', 640, [
    '2× Pro Bowl','Super Bowl LIII Appearance',
    '2023: 4,575 yds, 30 TD — franchise records',
  ]),
  pl('mai','Daniel Jones','QB','New York Giants', 140, [
    '6th Overall Pick (2019)','2022 playoff run',
  ]),
  pl('wil','Kyler Murray','QB','Arizona Cardinals', 540, [
    '2× Pro Bowl','2019 OROTY','1st Overall Pick (2019)',
    '2 Heisman-era dual-threat records entering NFL',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   RUNNING BACKS  (pool: RB)
   Target spread → 2 legendary · 4 epic · 6 rare · 6 common
══════════════════════════════════════════════════════════════════════ */
export const RB_POOL: NFLPlayer[] = [
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
   WIDE RECEIVERS  (pool: WR — feeds WR1, WR2, WR3 slots)
   Target spread → 3 legendary · 6 epic · 8 rare · 8 common
══════════════════════════════════════════════════════════════════════ */
export const WR_POOL: NFLPlayer[] = [
  pl('hil','Tyreek Hill','WR','Miami Dolphins', 2980, [
    '7× Pro Bowl','3× AP 1st-Team','Super Bowl LIV Champion',
    '2022 single-season receiving yards record (1,799)',
    'Fastest 40 time (4.29) ever by a WR at combine',
  ]),
  pl('jef','Justin Jefferson','WR','Minnesota Vikings', 2840, [
    '4× Pro Bowl','3× AP 1st-Team','2022 OPOY','2020 OROTY',
    '2022: 1,809 receiving yards — NFL single-season record at time',
    '8,000+ career receiving yards in fewest games ever',
  ]),
  pl('kup','Cooper Kupp','WR','Los Angeles Rams', 2640, [
    '4× Pro Bowl','3× AP 1st-Team','2021 Offensive POY',
    'Super Bowl LVI Champion & MVP','2021 Receiving Triple Crown',
    '2021: 1,947 yards — 2nd most in single season (all-time)',
  ]),
  pl('ada','Davante Adams','WR','Las Vegas Raiders', 2480, [
    '6× Pro Bowl','4× AP 1st-Team','Super Bowl LV finalist (Green Bay run)',
    '5× 1,000-yard seasons','2020: 18 TD — tied GB single-season record',
  ]),
  pl('cdl','CeeDee Lamb','WR','Dallas Cowboys', 2100, [
    '3× Pro Bowl','AP 1st-Team (2023)','2023: 1,749 yards — 3rd most ever',
    '100+ catches in 3 consecutive seasons','17th pick (2020 Draft)',
  ]),
  pl('hop','DeAndre Hopkins','WR','Tennessee Titans', 1960, [
    '5× Pro Bowl','3× AP 1st-Team','Most receiving yards without a Pro Bowl (2016)',
    'No drops in 2018 entire regular season','9,000+ career receiving yards',
  ]),
  pl('dig','Stefon Diggs','WR','Houston Texans', 1740, [
    '4× Pro Bowl','AP 1st-Team','Minneapolis Miracle (2018 playoffs)',
    '2020: 1,535 yards — tied Bills single-season record',
  ]),
  pl('chs','Ja\'Marr Chase','WR','Cincinnati Bengals', 1620, [
    '3× Pro Bowl','2021 OROTY','AP 1st-Team',
    '2021: 1,455 yards — most by a WR in debut season (history)',
    'Super Bowl LVI appearance as rookie',
  ]),
  pl('bro','A.J. Brown','WR','Philadelphia Eagles', 1540, [
    '3× Pro Bowl','AP 1st-Team (2022)','5× 1,000-yard seasons',
    '2022: 1,496 yards — 5th most in Eagles history',
  ]),
  pl('met','D.K. Metcalf','WR','Pittsburgh Steelers', 1120, [
    '3× Pro Bowl','1,000+ yards in 5 seasons',
    'Fastest WR in NFL per Next Gen Stats (22.64 mph chase play)',
  ]),
  pl('sam','Deebo Samuel','WR','San Francisco 49ers', 960, [
    '2× Pro Bowl','2021: 1,405 yards + 8 rush TDs — "wide receiver / RB hybrid"',
    '2022 Super Bowl appearance',
  ]),
  pl('EvO','Mike Evans','WR','Tampa Bay Buccaneers', 1880, [
    '7× Pro Bowl','AP 2nd-Team','Super Bowl LV Champion',
    '10 consecutive 1,000-yard seasons to open career (NFL record)',
    '9th Pick (2014 Draft)',
  ]),
  pl('all2','Keenan Allen','WR','Chicago Bears', 1380, [
    '5× Pro Bowl','AP 2nd-Team',
    '1,000+ yards in 7 seasons','2022: 108 catches at age 30',
  ]),
  pl('std','Amon-Ra St. Brown','WR','Detroit Lions', 760, [
    '2× Pro Bowl','2022: 106 catches, 1,161 yards',
    'Most catches by a WR in their first 16 games (record)',
  ]),
  pl('wad','Jaylen Waddle','WR','Miami Dolphins', 640, [
    '2× Pro Bowl','2021: 104 catches — most by a rookie WR ever',
    'Combine 40-yard dash: 4.37 (fastest among WR that year)',
  ]),
  pl('wil2','Garrett Wilson','WR','New York Jets', 580, [
    '2× Pro Bowl','2022 OROTY','10th Pick (2022 Draft)',
    '2023: 95 catches, 1,042 yards despite poor QB play',
  ]),
  pl('aiy','Brandon Aiyuk','WR','San Francisco 49ers', 780, [
    'Pro Bowl','AP 2nd-Team (2023)','2023: 1,342 yards, 7 TDs',
    'Super Bowl LVIII appearance',
  ]),
  pl('hig','Tee Higgins','WR','Cincinnati Bengals', 560, [
    'Pro Bowl','3× 1,000-yard seasons','Super Bowl LVI appearance',
  ]),
  pl('ter','Terry McLaurin','WR','Washington Commanders', 720, [
    '3× Pro Bowl','5× 1,000-yard seasons (in weak QB situations)',
    '2020: 1,118 yards — most ever by a CMDs WR in first 2 seasons',
  ]),
  pl('coo3','Amari Cooper','WR','Cleveland Browns', 820, [
    '4× Pro Bowl','Super Bowl LIII ring (with New England as later trade)',
    '5× 1,000-yard seasons','2021: 1,104 yards for Browns',
  ]),
  pl('goo','Chris Godwin','WR','Tampa Bay Buccaneers', 680, [
    '2× Pro Bowl','Super Bowl LV Champion',
    '2019: 1,333 yards, 9 TDs — set Bucs single-season record',
  ]),
  pl('nac','Puka Nacua','WR','Los Angeles Rams', 380, [
    'Pro Bowl (2023)','2023: 105 catches — most ever by a rookie WR (record)',
    'Undrafted/late round — 5th round pick',
  ]),
  pl('lon','Drake London','WR','Atlanta Falcons', 320, [
    '8th Overall Pick (2022)','2023: 905 yards, 8 TDs',
  ]),
  pl('add','Jordan Addison','WR','Minnesota Vikings', 280, [
    '23rd Pick (2023)','2023: 911 yards, 10 TDs as rookie',
    'Biletnikoff Award winner (college)',
  ]),
  pl('odz','Rome Odunze','WR','Chicago Bears', 120, [
    '9th Overall Pick (2024)','Biletnikoff Award winner (2023)',
    'Expected to pair with Caleb Williams long-term',
  ]),
  pl('jeu','Jerry Jeudy','WR','Cleveland Browns', 280, [
    '15th Pick (2020)','2023: 1,000+ receiving yards (first of career)',
  ]),
  pl('mcl','Rashod Bateman','WR','Baltimore Ravens', 160, [
    '27th Pick (2021)','Injury-limited career — showed promise in 2022',
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
  pl('mcb','Trey McBride','TE','Arizona Cardinals', 460, [
    '2× Pro Bowl','2023: 825 yards, highest in ARI TE history',
    '55th Pick (2022 Draft)',
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
  pl('sew','Penei Sewell','OT','Detroit Lions', 1200, [
    '3× Pro Bowl','AP 2nd-Team (2023)',
    '7th Pick (2021)','Bednarik Award winner (college)',
    'Cornerstone of Lions\' Super Bowl–caliber O-Line',
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
  pl('tay','Jawaan Taylor','OT','Kansas City Chiefs', 480, [
    '2× Super Bowl Champion (LVII, LVIII)','35th Pick (2019)',
    'Right tackle anchor for Chiefs dynasty O-Line',
  ]),
  pl('bro2','Orlando Brown Jr.','OT','Cincinnati Bengals', 640, [
    '3× Pro Bowl','Super Bowl LVII appearance',
    'Part of Ravens dynasty; multiple Pro Bowls at LT for KC/CIN',
  ]),
  pl('cam','Cam Robinson','OT','Jacksonville Jaguars', 400, [
    'Pro Bowl (2021)','34th Pick (2017)',
    'Anchored rebuilt Jags O-Line 2022',
  ]),
  pl('mog','Mike McGlinchey','OT','Denver Broncos', 340, [
    'Pro Bowl (2019)','9th Pick (2018)',
    'Quality starter across multiple teams',
  ]),
  pl('ber','Bernhard Raimann','OT','Indianapolis Colts', 200, [
    '3rd Round Pick (2022)','Starting LT by Week 1 of rookie season',
    'Consistent starter — ascending',
  ]),
  pl('ten','Teven Jenkins','OT','Chicago Bears', 160, [
    '39th Pick (2021)','Strong pass-protection metrics 2023',
  ]),
  pl('dw','Darnell Wright','OT','Chicago Bears', 140, [
    '10th Pick (2023)','Immediate starter — highest-drafted Bears OT in decades',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   OFFENSIVE GUARDS  (pool: OG — feeds LG & RG slots)
   Target spread → 2 legendary · 3 epic · 5 rare · 4 common
══════════════════════════════════════════════════════════════════════ */
export const OG_POOL: NFLPlayer[] = [
  pl('zma','Zack Martin','OG','Dallas Cowboys', 3160, [
    '9× Pro Bowl','7× AP 1st-Team (most ever by a guard)',
    'Only player named to Pro Bowl in all of first 9 NFL seasons',
    '16th Pick (2014 Draft) — greatest guard of his era',
  ]),
  pl('nel','Quenton Nelson','OG','Indianapolis Colts', 2860, [
    '7× Pro Bowl','4× AP 1st-Team',
    '6th Pick (2018) — considered best OG prospect ever by scouts',
    'AP 1st-Team in each of first 4 seasons — unprecedented for a guard',
  ]),
  pl('bit','Joel Bitonio','OG','Cleveland Browns', 2140, [
    '7× Pro Bowl','2× AP 1st-Team','AP 2nd-Team ×2',
    '35th Pick (2014)','Most Pro Bowls by a Browns OL in franchise history',
  ]),
  pl('sch','Brandon Scherff','OG','Free Agent', 1820, [
    '6× Pro Bowl','AP 1st-Team (2020)','AP 2nd-Team ×2',
    '5th Pick (2015)','Only Washington/Commanders OG with 5+ Pro Bowls',
  ]),
  pl('thu','Joe Thuney','OG','Kansas City Chiefs', 1540, [
    '4× Pro Bowl','3× Super Bowl Champion (NE ×2, KC ×1)',
    'Highest paid guard in NFL history (at signing 2021)',
    'Key piece of Patriots & Chiefs dynasty O-Lines',
  ]),
  pl('tel','Wyatt Teller','OG','Cleveland Browns', 1020, [
    '2× Pro Bowl','AP 2nd-Team (2020)',
    '2020: Only OG with a 90+ PFF grade — best run-blocking guard',
  ]),
  pl('lin','Chris Lindstrom','OG','Atlanta Falcons', 960, [
    '3× Pro Bowl','AP 2nd-Team (2023)',
    '14th Pick (2019)','2023: Highest paid guard at time of extension',
  ]),
  pl('zel','Kevin Zeitler','OG','Baltimore Ravens', 780, [
    '3× Pro Bowl','11-year starter — one of most consistent guards',
    'Highest paid guard in NFL history (at signing, 2012)',
  ]),
  pl('pow','Ben Powers','OG','Denver Broncos', 480, [
    'Pro Bowl (2022) with Baltimore','Solid starter 2019–present',
  ]),
  pl('mas','Shaq Mason','OG','Washington Commanders', 680, [
    '2× Pro Bowl','2× Super Bowl Champion (NE)',
    'Undrafted-level pick (4th round, 2015) — massive overperformer',
  ]),
  pl('onw','Michael Onwenu','OG','New England Patriots', 560, [
    'Pro Bowl (2023)','6th Round Pick (2020) — one of biggest steals',
    '2020: Filled in at 4 positions, allowed 0 sacks',
  ]),
  pl('sea','Isaac Seumalo','OG','Pittsburgh Steelers', 640, [
    '2× Pro Bowl','Super Bowl LVII appearance (PHI)',
    '3rd Round (2016)','Anchored Eagles\' 2022 Super Bowl run',
  ]),
  pl('hug','Elgton Jenkins','OG','Green Bay Packers', 720, [
    '3× Pro Bowl','AP 2nd-Team (2020)',
    '44th Pick (2019)','Versatile — started at LT, LG, C, and RG',
  ]),
  pl('ski','Will Hernandez','OG','New York Giants', 200, [
    '34th Pick (2018)','Reliable starter 2018–2023',
  ]),
  pl('cro','Dalton Risner','OG','Free Agent', 300, [
    '41st Pick (2019)','Starting guard for multiple Denver playoff seasons',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   CENTERS  (pool: C)
   Target spread → 2 legendary · 2 epic · 4 rare · 3 common
══════════════════════════════════════════════════════════════════════ */
export const C_POOL: NFLPlayer[] = [
  pl('hum','Creed Humphrey','C','Kansas City Chiefs', 2000, [
    '3× Pro Bowl','AP 1st-Team (2022)','AP 2nd-Team',
    '2× Super Bowl Champion (LVII, LVIII)',
    '63rd Pick (2021) — 2nd round steal, immediate All-Pro',
  ]),
  pl('rag','Frank Ragnow','C','Detroit Lions', 1740, [
    '3× Pro Bowl','AP 1st-Team (2023)','AP 2nd-Team',
    '20th Pick (2018)','Cornerstone of Lions\' Lions run-heavy O-Line',
    '2021 Comeback Player of Year finalist after foot surgery',
  ]),
  pl('lin2','Corey Linsley','C','Free Agent', 1080, [
    '2× Pro Bowl','AP 1st-Team (2020)',
    '5th Round (2014) — huge value pick',
    '2020: 0 QB pressures in 16 games — perfect season',
  ]),
  pl('jen','Ryan Jensen','C','Tampa Bay Buccaneers', 740, [
    'Pro Bowl (2017)','Super Bowl LV Champion',
    '6th Round Pick — massive late-round overperformer',
  ]),
  pl('bia','Tyler Biadasz','C','Dallas Cowboys', 380, [
    'Pro Bowl (2023)','110th Pick (2020)',
    '2022: Cowboys O-Line allowed fewest sacks in NFC',
  ]),
  pl('jur','Ted Karras','C','Cincinnati Bengals', 480, [
    '2× Super Bowl Champion (NE 2018 & 2019)','Undrafted (2016)',
    'Key piece of Bengals\' 2021 Super Bowl run at center',
  ]),
  pl('cus','Lloyd Cushenberry III','C','Denver Broncos', 280, [
    '3rd Round Pick (2020)','Starting center since day 1',
    'Reliable anchor — solid run-blocking grade',
  ]),
  pl('jur2','Cam Jurgens','C','Philadelphia Eagles', 360, [
    '51st Pick (2022)','Took over from Kelce seamlessly (2024)',
    'AP 2nd-Team consideration in first full year starting',
  ]),
  pl('gar','Garrett Bradbury','C','Minnesota Vikings', 220, [
    '18th Pick (2019)','5-year starter in Minnesota system',
  ]),
  pl('mcg','Connor McGovern','C','Free Agent', 180, [
    'Long-time starter in NYJ / BUF / DAL system',
    '3rd Round (2016) — durable, smart center',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   MASTER EXPORT  —  all pools in one object for easy lookup
══════════════════════════════════════════════════════════════════════ */
export const ALL_PLAYERS: Record<PositionGroup, NFLPlayer[]> = {
  QB: QB_POOL,
  RB: RB_POOL,
  WR: WR_POOL,
  TE: TE_POOL,
  OT: OT_POOL,
  OG: OG_POOL,
  C:  C_POOL,
};

/* Quick stats */
export const POOL_SIZES: Record<PositionGroup, number> = Object.fromEntries(
  Object.entries(ALL_PLAYERS).map(([k, v]) => [k, v.length]),
) as Record<PositionGroup, number>;

/* Total players: */
// QB: 18 · RB: 19 · WR: 27 · TE: 15 · OT: 18 · OG: 15 · C: 11  →  123 total