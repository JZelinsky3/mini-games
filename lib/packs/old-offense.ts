/* ─────────────────────────────────────────────────────────────────────────────
   old-offense.ts
   Old batch — all players are NEW (not in vol 1).
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
   QUARTERBACKS  — 20 new entries
══════════════════════════════════════════════════════════════════════ */
export const QB_POOL_OLD: NFLPlayer[] = [
  pl('lun', 'Len Dawson',          'QB', 'Retired (HOF 1987)',    2200, [
    'Super Bowl IV Champion + MVP', '7× Pro Bowl',
    '1962 AFL MVP', 'KC Chiefs dynasty anchor across 13 seasons',
    '182 career TDs vs. only 151 INTs across 19 professional seasons',
  ]),
  pl('tra3','Troy Aikman',         'QB', 'Retired (HOF 2006)',    3200, [
    '3× Super Bowl Champion (XXVII, XXVIII, XXX)', 'Super Bowl XXVII MVP',
    '6× Pro Bowl', 'AP 2nd-Team 1992',
    '1992–95: Led Cowboys to three titles in four years — dynasty architect',
  ]),
  pl('ste2','Steve McNair',        'QB', 'Retired (HOF 2024)',    2100, [
    'Co-League MVP 2003 (shared with Manning)', '3× Pro Bowl',
    '1999: Led Titans to Super Bowl XXXIV — "One Yard Short" ending',
    '2003: 100.4 passer rating — career peak alongside McNair-era dominance',
  ]),
  pl('jke2','Jim Kelly',           'QB', 'Retired (HOF 2002)',    2800, [
    '5× Pro Bowl', 'AP 2nd-Team 1991',
    '4 consecutive Super Bowl appearances (XXVII–XXX) — unprecedented',
    '35,467 career yards, 237 TDs across 11 seasons',
    'Buffalo K-Gun offense — revolutionary no-huddle system',
  ]),
  pl('kwa3','Kurt Warner',         'QB', 'Retired (HOF 2017)',    3100, [
    '2× League MVP', 'Super Bowl XXXIV Champion + MVP',
    '4× Pro Bowl', '2× AP 1st-Team', 'Super Bowl XLIII appearance',
    'From grocery bagger to NFL MVP — greatest undrafted story in NFL history',
    '2009 (ARI): 4,025 yards, 26 TDs at age 38',
  ]),
  pl('pvo', 'Norm Van Brocklin',   'QB', 'Retired (HOF 1971)',    680, [
    '9× Pro Bowl', '2× NFL Champion (1951 LAR, 1960 PHI)',
    '1951: 554 yards in single game — NFL record for 73 years (until 2024)',
    'Dual-threat leader who could also punt — true pioneer',
  ]),
  pl('sti', 'Sammy Baugh',         'QB', 'Retired (HOF 1963)',    660, [
    '6× Pro Bowl', '6× NFL Champion (Washington)',
    '1945: 70.3% completion — record that stood for 35+ years',
    'Pioneer of the forward pass as primary weapon; changed football forever',
  ]),
    pl('jel', 'John Elway', 'QB', 'Retired (HOF 2004)', 3800, [
    '2× Super Bowl Champion', 'Super Bowl XXXIII MVP',
    '9× Pro Bowl', '2× AP 1st-Team',
    '5× Super Bowl appearance — more than any QB in AFC history',
    'The Drive (1987) — 98-yard march to tie Cleveland in the cold',
  ]),
  pl('ste7', 'Steve Young', 'QB', 'Retired (HOF 2005)', 3600, [
    'Super Bowl XXIX Champion + MVP (6 TDs — record)',
    '7× Pro Bowl', '2× AP 1st-Team', '2× League MVP',
    '96.8 career passer rating — highest in NFL history at retirement',
    'Replaced Joe Montana and still won a Super Bowl',
  ]),
  pl('ter7', 'Terry Bradshaw', 'QB', 'Retired (HOF 1989)', 3400, [
    '4× Super Bowl Champion (IX, X, XIII, XIV)', '2× Super Bowl MVP',
    '3× Pro Bowl', 'AP 1st-Team 1978',
    '1978: 28 TDs — led Steelers to NFL\'s first back-to-back-to-back dominance',
    '3,833 Super Bowl passing yards — record at retirement',
  ]),
  pl('rta2','Ryan Tannehill',       'QB', 'Free Agent',           620, [
    '2× Pro Bowl', 'AP 2nd-Team All-Pro 2019',
    '2019: 117.5 passer rating — 2nd-highest ever recorded in single season',
    '8th Pick 2012 — 12-year starter for two franchises',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   RUNNING BACKS  — 20 new entries
══════════════════════════════════════════════════════════════════════ */
export const RB_POOL_OLD: NFLPlayer[] = [
  pl('gro','Todd Gurley','RB','Free Agent (Ret.)', 1680, [
    '4× Pro Bowl','AP 1st-Team (2017)','2017 Offensive POY',
    '2016 OROTY','10th Pick (2015)',
    '2017: 2,093 scrimmage yards — highest in NFL that season',
  ]),
  pl('bel','Le\'Veon Bell','RB','Free Agent (Ret.)', 1240, [
    '4× Pro Bowl','AP 1st-Team (2017)','AP 2nd-Team',
    '2017: Highest yards after contact per attempt in NFL (4.1)',
    '2014: 2,215 scrimmage yards — Steelers franchise record',
  ]),
  pl('fta', 'Frank Thomas (RB)',   'RB', 'Retired (HOF 1954)',    500, [
    'Pro Football Hall of Fame 1954 (charter member)',
    '1930s–40s: Dominant fullback of Chicago Bears dynasty',
    '3× NFL Champion — Bear dynasty cornerstone',
  ]),
  pl('tda', 'Tony Dorsett',        'RB', 'Retired (HOF 1994)',    3000, [
    'Super Bowl XII Champion', '4× Pro Bowl', 'AP 2nd-Team 1981',
    '1977 OROTY', '12,739 career rushing yards',
    '1983: 99-yard TD run — tied for NFL longest TD run ever',
  ]),
  pl('cfu', 'Curtis Martin',       'RB', 'Retired (HOF 2012)',    2900, [
    '5× Pro Bowl', '2× AP 2nd-Team',
    '2004: NFL Rushing Title at age 31 — oldest ever to win it',
    '14,101 career rushing yards — 4th all-time',
    'Super Bowl XXXI appearance (NE)',
  ]),
  pl('sto4','Steven Jackson',      'RB', 'Retired (2016)',        1600, [
    '3× Pro Bowl', 'AP 2nd-Team 2006',
    '2006: 1,528 yards — 11 consecutive 1,000-yard seasons',
    'Most yards gained solo without a Super Bowl appearance of his era',
  ]),
  pl('cja', 'Chris Johnson',       'RB', 'Retired (2016)',        1800, [
    '2× Pro Bowl', 'AP 2nd-Team 2009', '2009 OROTY',
    '2009: 2,509 scrimmage yards — NFL record (surpassing Barry Sanders)',
    '4.24 combine 40 — fastest ever recorded at combine',
  ]),
  pl('cfu2','Clinton Portis',      'RB', 'Retired (2011)',        1700, [
    '2× Pro Bowl', 'AP 2nd-Team 2003',
    '2003 (DEN): 1,591 yards, 17 TDs — career best under Mike Shanahan',
    '2005: 1,516 yards for Redskins — dual franchise star',
  ]),
  pl('tri2','Tiki Barber',         'RB', 'Retired (2007)',        2000, [
    '3× Pro Bowl', 'AP 2nd-Team 2005',
    '2005: 1,860 yards — Giants franchise record',
    '2006: 1,662 yards — back-to-back 1,800+ yard seasons (second ever)',
    '10,449 career rushing yards',
  ]),
  pl('jmo2','John Henry Johnson',  'RB', 'Retired (HOF 1987)',    680, [
    '4× Pro Bowl', '2× NFL All-Star (pre-AFL merger era)',
    '1962: 1,141 yards — led Pittsburgh franchise in their dominant stretch',
    'Cornerstone of 49ers "Million Dollar Backfield"',
  ]),
  pl('odo', 'O.J. Simpson', 'RB', 'Retired (HOF 1985)', 3200, [
    '5× Pro Bowl', '2× AP 1st-Team', '2× League MVP',
    '1973: 2,003 rushing yards — first ever to rush for 2,000 yards',
    '1975: 23 rushing TDs — NFL record at time',
    '11,236 career rushing yards',
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
  pl('ell','Ezekiel Elliott','RB','New England Patriots', 860, [
    '3× Pro Bowl','2× Rushing Title (2016, 2018)','AP 1st-Team',
    '4th Overall Pick (2016)','2016: 1,631 rush yards as rookie',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   WIDE RECEIVERS  — 26 new entries
══════════════════════════════════════════════════════════════════════ */
export const WR_POOL_OLD: NFLPlayer[] = [
  pl('tin', 'Tim Brown',           'WR', 'Retired (HOF 2015)',    2800, [
    '9× Pro Bowl', '2× AP 2nd-Team', '1988 Heisman Trophy winner',
    '14,934 career yards — 4th all-time at retirement',
    '100 career TDs', 'Super Bowl XXXVII appearance (Oakland)',
  ]),
  pl('mth','Michael Thomas','WR','New Orleans Saints', 1200, [
    '3× Pro Bowl','AP 1st-Team (2019)','47th Pick (2016)',
    '2019: 149 catches — NFL all-time single-season reception record',
    '2019 OPOY','2019 AP 1st-Team Unanimous — best WR season in history',
  ]),
  pl('brx','Allen Robinson II',  'WR', 'Free Agent',               820, [
    '2× Pro Bowl', 'AP 2nd-Team 2020',
    '2020: 1,250 yards with Mitchell Trubisky as QB — elite WR1 performance',
    '6× 1,000-yard season over 10-year career',
  ]),
  pl('ste3','Steve Largent',       'WR', 'Retired (HOF 1995)',    2600, [
    '7× Pro Bowl', 'AP 2nd-Team 1983',
    '100 career TDs — all-time record at retirement',
    '13,089 career yards — held multiple records at retirement',
    '177 consecutive games with a reception — broken only by Rice',
  ]),
  pl('dma2','Drew Hill',           'WR', 'Retired (1993)',        760, [
    '2× Pro Bowl', 'AP 2nd-Team 1988',
    '1988: 1,141 yards for Oilers — career best with Warren Moon',
    'Super Bowl XIV appearance (LAR) — deep threat specialist',
  ]),
  pl('cha27','Charlie Joiner',      'WR', 'Retired (HOF 1996)',    1800, [
    '3× Pro Bowl', 'AP 2nd-Team 1976',
    '12,146 career yards — all-time record when retired',
    '18-year career — played with Dan Fouts in "Air Coryell"',
  ]),
  pl('hca', 'Harold Carmichael',   'WR', 'Retired (HOF 2020)',    1900, [
    '4× Pro Bowl', 'AP 1st-Team 1979',
    '127 consecutive games with a reception — held record 24 years',
    'Super Bowl XV appearance (Philadelphia)',
    '8,985 career yards across 14 seasons',
  ]),
  pl('lan', 'Lance Alworth',       'WR', 'Retired (HOF 1978)',    3200, [
    '7× Pro Bowl', '5× AFL All-League', 'Super Bowl VI Champion',
    '1963–69: 7 consecutive 1,000-yard seasons to start career',
    '1965: 14 TDs, 1,602 yards — highest AFL single-season total',
    '"Bambi" — considered greatest AFL WR ever',
  ]),
  pl('ste4','Sterling Sharpe',     'WR', 'Retired (1994)',        2400, [
    '5× Pro Bowl', 'AP 1st-Team 1992',
    '1992: 108 catches — set NFL record (broken by Rice)',
    '1993: 112 catches, 1,274 yards, 11 TDs — led all WRs',
    'Career cut short by neck injury; one of the greatest "what-ifs"',
  ]),
  pl('dwe', 'Dwight Clark',        'WR', 'Retired (HOF 1999)',    2200, [
    '2× Pro Bowl', '2× Super Bowl Champion (XIX, XXIII)',
    '1982 NFL receptions leader (60 catches)',
    '"The Catch" — 6-yard TD vs. Dallas (1982 NFC title) — changed 49ers dynasty',
  ]),
  pl('pwa', 'Paul Warfield',       'WR', 'Retired (HOF 1983)',    2900, [
    '8× Pro Bowl', '2× AP 1st-Team', '2× Super Bowl Champion (VII, VIII)',
    '20.1 yards per catch career — highest average in HOF class',
    'Miami Dolphins undefeated 1972 season contributor',
  ]),
  pl('cbu', 'Charley Taylor',      'WR', 'Retired (HOF 1984)',    1700, [
    '8× Pro Bowl', 'AP 1st-Team 1967',
    '1975: Led league in catches — 7,200+ career yards',
    'Started as RB and converted to WR — dual-threat pioneer',
  ]),
  pl('art', 'Art Monk',            'WR', 'Retired (HOF 2008)',    1800, [
    '3× Pro Bowl', '3× Super Bowl Champion (XVII, XXII, XXVI)',
    '1984: 106 catches — NFL record at time',
    '12,721 career yards across 16 seasons',
  ]),
  pl('jna', 'John Stallworth',     'WR', 'Retired (HOF 2002)',    2200, [
    '4× Super Bowl Champion (IX, X, XIII, XIV)', '3× Pro Bowl',
    '1979: Super Bowl XIV — 73-yard TD still stands as iconic play',
    '8,723 career yards as Pittsburgh\'s deep threat across 14 seasons',
  ]),
  pl('jja3','John Jefferson',      'WR', 'Retired (1985)',        1000, [
    '3× Pro Bowl', 'AP 2nd-Team 1978',
    '1978–80: 3 consecutive 1,000-yard seasons — first WR ever to do it',
    '"Air Coryell" system cornerstone alongside Charlie Joiner',
  ]),
  pl('owe', 'Otis Taylor',         'WR', 'Retired (HOF 2009)',    800, [
    '3× Pro Bowl', 'Super Bowl IV Champion (Kansas City)',
    '1966 AFL MVP', '1966: 1,297 yards — AFL single-season record at time',
    'Physical freak of his era — 6\'3\" and 215 lbs with rare speed',
  ]),
  pl('irv7', 'Michael Irvin', 'WR', 'Retired (HOF 2007)', 3600, [
    '3× Super Bowl Champion (XXVII, XXVIII, XXX)',
    '5× Pro Bowl', '3× AP 1st-Team',
    '1995: 1,603 yards — Cowboys franchise record',
    '"The Playmaker" — 111 catches in 1995 (led NFL)',
  ]),
  pl('dpa','DeVante Parker','WR','Los Angeles Rams', 720, [
    '2× Pro Bowl','14th Pick (2014)',
    '2019: 1,202 yards, 9 TDs — Pro Bowl','2021: 996 yards for Miami',
    '2022 (NE): 635 yards despite weak QB play — still showing up',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   TIGHT ENDS  — 14 new entries
══════════════════════════════════════════════════════════════════════ */
export const TE_POOL_OLD: NFLPlayer[] = [
  pl('gra','Jimmy Graham','TE','Free Agent (Ret.)', 1620, [
    '5× Pro Bowl','AP 1st-Team (2013)',
    'Highest-paid TE in NFL history (at signing, 2014)',
    '2011: 11 TDs — Saints franchise TE record',
    '6,000+ career receiving yards',
  ]),
  pl('dar2','Dave Casper',         'TE', 'Retired (HOF 1988)',    2400, [
    '5× Pro Bowl', '2× AP 1st-Team', 'Super Bowl XI Champion',
    '1977: Led NFL TEs in receiving yards — dominant season',
    '"The Ghost" — key component of Raiders dynasty TE blueprint',
  ]),
  pl('ben7', 'Ben Coates',          'TE', 'Retired (2000)',        1600, [
    '5× Pro Bowl', '2× AP 1st-Team', '2× Super Bowl runner-up (XXXI, XXXIII)',
    '1994: 96 catches — set NFL record for TEs at time',
    '114 catches in 2 seasons (1994–95) — defining pass-catching TE',
  ]),
  pl('ch2', 'Charlie Sanders',     'TE', 'Retired (HOF 2007)',    1700, [
    '7× Pro Bowl', '3× AP 1st-Team',
    'Detroit Lions franchise record-holder at TE',
    'One of the first "receiving" TEs in the AFL-NFL merger era',
  ]),
  pl('jmac','Jackie MacMurdo',     'TE', 'Retired (HOF 1952)',    460, [
    'Pre-merger era pioneer', 'Multiple All-Pro selections in 1940s',
    'Helped establish tight end as a distinct offensive weapon',
  ]),
  pl('jwa','Jeremy Shockey',       'TE', 'Retired (2011)',        1300, [
    '4× Pro Bowl', 'AP 2nd-Team 2002',
    '2007 OROTY candidate', 'Super Bowl XLII Champion (NYG)',
    '2002: 894 yards as rookie — best TE debut of his era',
  ]),
  pl('jmo3','Jimmie Giles',        'TE', 'Retired (1988)',        820, [
    '4× Pro Bowl', '2× AP 1st-Team',
    '1980: Led all TEs in touchdowns', 'Tampa Bay Buccaneers franchise icon',
    'First great TE in Tampa Bay history',
  ]),
  pl('che', 'Brent Jones',         'TE', 'Retired (HOF eligible)', 760, [
    '3× Pro Bowl', '3× Super Bowl Champion (XIX, XXIII, XXIX)',
    '1992: 45 catches in Steve Youngs first full season as starter',
    'Key piece of 49ers dynasty alongside Jerry Rice',
  ]),
  pl('oti', 'Ozzie Newsome', 'TE', 'Retired (HOF 1999)', 3800, [
    '3× Pro Bowl', '2× AP 2nd-Team',
    '7,980 career yards — led all TEs at time of retirement',
    '"The Wizard of Oz" — first great receiving TE of modern era',
    'Later built Ravens into dynasty as GM — two Super Bowl rings as exec',
    'HOF-caliber — closer to elite tier',
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   OFFENSIVE TACKLES  — 18 new entries
══════════════════════════════════════════════════════════════════════ */
export const OT_POOL_OLD: NFLPlayer[] = [
  pl('lew','Taylor Lewan','OT','Tennessee Titans (ret.)', 720, [
    '3× Pro Bowl','11th Pick (2014)',
    '2018: AP 1st-Team — anchored Titans\' league-best run game',
  ]),
  pl('gba2','Gary Zimmerman',      'OT', 'Retired (HOF 2008)',    3200, [
    '7× Pro Bowl', '3× AP 1st-Team', 'Super Bowl XXXII Champion (DEN)',
    '2× All-USFL (1984–85) before NFL',
    'Protected John Elway and allowed him to finish career with title',
  ]),
  pl('lla2','Lincoln Kennedy',     'OT', 'Retired (2003)',        880, [
    'Pro Bowl 1998 (alternate)', '5th Pick 1993',
    '1997–2003: Starting RT for Raiders in prime years',
    'Washington Huskies: 2-year All-Pac-10 starter',
  ]),
  pl('jer2','Jerome Williams',     'OT', 'Retired (1975)',        420, [
    '4× Pro Bowl (pre-Super Bowl era)', 'Multiple AFL All-League',
    'Buffalo Bills OL anchor during early AFL years',
  ]),
  pl('kie', 'Kick Lucarelli',      'OT', 'Retired (1980)',        400, [
    '3× Pro Bowl', 'NFC Championship appearance',
    'Veteran swing tackle across 10 seasons',
  ]),
  pl('tco2','Tom Newberry',        'OT', 'Retired (1995)',        760, [
    '2× Pro Bowl', 'Super Bowl XIV appearance (Los Angeles Rams)',
    '1988: Named to multiple All-Pro lists — elite interior/exterior OL',
    'Wisconsin-La Crosse: Undersized prospect who outperformed draft position',
  ]),
  pl('jwa2','Jim Tyrer',           'OT', 'Retired (HOF eligible)', 1600, [
    '6× Pro Bowl', '5× AFL All-League', 'Super Bowl IV Champion',
    '1962–73: KC Chiefs dynasty LT — one of the best OTs in AFL history',
    'Should be in Canton — widely considered the most deserving snub',
  ]),
  pl('bbi', 'Bob Brown',           'OT', 'Retired (HOF 2004)',    2000, [
    '6× Pro Bowl', '3× AP 1st-Team',
    '1964 Rose Bowl Champion', 'Known as the most physically dominant OT of 1960s',
    'Played for 3 franchises; dominated regardless of system',
  ]),
  pl('rba2','Ron Mix',             'OT', 'Retired (HOF 1979)',    1700, [
    '8× Pro Bowl (AFL/NFL)', '6× AFL All-League', 'Super Bowl III era AFL',
    'Only 2 holding penalties in 10 AFL seasons — cleanest blocker in history',
    'San Diego Chargers dynasty anchor',
  ]),
  pl('ema', 'Erik Williams',       'OT', 'Retired (1999)',        1500, [
    '4× Pro Bowl', '3× Super Bowl Champion (XXVII, XXVIII, XXX)',
    '1992–1996: Blocked for Emmitt Smith in Cowboys dynasty',
    'Part of Cowboys "Great Wall" — arguably best OL in NFL history',
  ]),
  pl('rbu', 'Rayfield Wright',     'OT', 'Retired (HOF 2006)',    2200, [
    '6× Pro Bowl', '2× AP 1st-Team', '2× Super Bowl Champion (XII, XII)',
    '"The Big Cat" — 6\'6\" 255 lbs — physically ahead of his era',
    'Dallas Cowboys dynasty RT for their first championship era',
  ]),
    pl('cfl','Cam Fleming','OT','New York Giants', 240, [
    '123rd Pick (2014)','10-year veteran swing tackle across 6 teams',
    'Patriots: 2× Super Bowl Champion (XLIX, LI)',
    'Reliable veteran depth — started at both tackle spots in career',
  ]),
  pl('yni','Yosuah Nijman','OT','Retired (2026)', 420, [
    'Versatile swing OT','Long athletic frame'
  ]),
];

/* ══════════════════════════════════════════════════════════════════════
   OFFENSIVE GUARDS  — 16 new entries
══════════════════════════════════════════════════════════════════════ */
export const OG_POOL_OLD: NFLPlayer[] = [
  pl('inc','Richie Incognito','OG','Free Agent (Ret.)', 940, [
    '4× Pro Bowl','AP 1st-Team (2015)','AP 2nd-Team ×2',
    '36th Pick (2005)','5× 1,000-snap seasons — physical dominant guard',
  ]),

  pl('bro3','Brandon Brooks','OG','Philadelphia Eagles (Ret.)', 1040, [
    '3× Pro Bowl','AP 1st-Team (2018)','Super Bowl LII Champion',
    '85th Pick (2012)','2018: Top-rated guard by PFF (90.5)',
    'Retired at prime due to Achilles injury',
  ]),
  pl('sea2','Rodger Saffold','OG','Free Agent (Ret.)', 700, [
    'Pro Bowl (2018)','Super Bowl LIII appearance (LAR)',
    '33rd Pick (2010)','9 seasons starting for one franchise',
  ]),
  pl('war2','Larry Warford','OG','New Orleans Saints (Ret.)', 760, [
    '3× Pro Bowl','AP 2nd-Team','65th Pick (2013)',
    '2018: 89.7 PFF grade — 2nd among all guards',
  ]),
  pl('ral', 'Randy Cross',         'OG', 'Retired (HOF eligible)', 1800, [
    '3× Pro Bowl', '3× Super Bowl Champion (XIX, XXIII, XXIX)',
    'Blocked for Joe Montana across championship runs',
    'Part of 49ers OL that many consider the best unit of the 1980s',
  ]),
  pl('mpa', 'Mike Munchak',        'OG', 'Retired (HOF 2001)',    3200, [
    '9× Pro Bowl', '4× AP 1st-Team',
    '8th Overall Pick 1982', 'Houston Oilers dynasty lineman',
    'Blocked for Warren Moon across career — anchored "Run & Shoot" era',
  ]),
  pl('dga', 'Dennis Harrah',       'OG', 'Retired (HOF eligible)', 1200, [
    '5× Pro Bowl', '2× AP 1st-Team', 'Super Bowl XIV appearance',
    '1975–1987: LA Rams franchise guard for their NFC championship era',
  ]),
  pl('kgu', 'Keith Dorney',        'OG', 'Retired (1985)',        740, [
    '3× Pro Bowl', '4× Super Bowl Champion (IX, X, XIII, XIV)',
    'Pittsburgh Steelers dynasty OG — part of one of the all-time great units',
  ]),
  pl('bha3','Billy Shaw',          'OG', 'Retired (HOF 1999)',    2400, [
    '8× Pro Bowl (AFL)', '6× AFL All-League',
    'Only player in HOF who played exclusively in AFL (never played in NFL)',
    'Buffalo Bills AFL championship run cornerstone — 1964, 1965 titles',
  ]),
  pl('rew', 'Reggie McKenzie',     'OG', 'Retired (1978)',        680, [
    'Pro Bowl 1975', 'Super Bowl XI appearance (Oakland)',
    '1972–78: Dominant Raiders LG during their 1970s dynasty',
    'Michigan: Rose Bowl champion — Big Ten pedigree to AFL',
  ]),
  pl('jim', 'Jim Ringo',           'OG', 'Retired (HOF 1981)',    2800, [
    '10× Pro Bowl', '5× AP 1st-Team', '4× NFL Champion (Green Bay)',
    'Lombardi Packers dynasty center and guard — played all interior positions',
    'Blocked for Paul Hornung, Jim Taylor across championship runs',
  ]),
  pl('jco4','Joe DeLamielleure',   'OG', 'Retired (HOF 2003)',    2200, [
    '6× Pro Bowl', '5× AP 1st-Team',
    'Blocked for O.J. Simpson\'s 2,003-yard season (1973)',
    'Part of Buffalo Bills "Electric Company" OL — set the table for O.J.',
  ]),
  pl('hba', 'Hank Fraley',         'OG', 'Retired (2008)',        500, [
    'Undrafted 2000', 'Pro Bowl 2004 (alternate)',
    '2004: Starting C/G for Eagles Super Bowl XXXIX run',
    'College of William & Mary: Smallest school → steady NFL career',
  ]),
  pl('tgu', 'Tom Mack', 'OG', 'Retired (HOF 1999)', 3600, [
    '11× Pro Bowl', '3× AP 1st-Team', 'Super Bowl IV appearance (LAR)',
    '184 consecutive starts — dominated from 1966–1978',
    '"Fearsome Foursome" opposing DL never got past him',
  ]),
];
/* ══════════════════════════════════════════════════════════════════════
   CENTERS  — 12 new entries
══════════════════════════════════════════════════════════════════════ */
export const C_POOL_OLD: NFLPlayer[] = [
  pl('joh4','Ben Jones','C','Free Agent (Ret.)', 480, [
    'Pro Bowl (2019)','91st Pick (2012)',
    '7× 1,000-snap seasons — iron man of the Titans O-Line',
    'Never missed a start in 10 seasons',
  ]),
  pl('tra','Travis Frederick','C','Dallas Cowboys (Ret.)', 3500, [
    '5× Pro Bowl','1× AP 1st-Team (2016)','2× AP 2nd-Team',
    '2016: Considered best center in NFL — Cowboys Hall of Honor',
    'Retired 2020 due to Guillain-Barré syndrome — courageous exit',
    'HOF-caliber boost per request',
  ]),
  pl('rhu','Rodney Hudson','C','Free Agent (Ret.)', 860, [
    '55th Pick (2011)','4× Pro Bowl','AP 1st-Team (2019)',
    '2019: Highest-graded center in AFC per PFF (89.7)',
    '2016–21: Highest-rated long-term starter at C for Raiders',
  ]),
  pl('bco3','Bart Oates',          'C', 'Retired (1996)',         1900, [
    'Pro Bowl 1991', '3× Super Bowl Champion (XXI, XXV, XXIX)',
    'NY Giants 2× Super Bowl C; later San Francisco ring (XXIX)',
    'Brigham Young: Academic All-American; high-IQ quarterback of the OL',
  ]),
  pl('mhig','Mark Hubbard',        'C', 'Retired (1980)',         540, [
    'Pro Bowl 1974', 'Super Bowl XI Champion (Oakland)',
    '1970–80: Raiders interior anchor during their AFL/NFL rise',
  ]),
  pl('tom7', 'Tom Rafferty',        'C', 'Retired (1993)',         680, [
    'Pro Bowl 1986', 'Super Bowl XII Champion (Dallas Cowboys)',
    '11-year Cowboys starter — part of their 1970s–80s dynasty unit',
  ]),
  pl('dbe', 'Dave Rimington',      'C', 'Retired (1989)',         980, [
    '2× Pro Bowl', 'AP 2nd-Team 1985',
    '1982: 2× Rimington Award winner (award later named for him)',
    '2× Outland Trophy winner — first player to win it twice consecutively',
  ]),
  pl('mce', 'Maurits Cornelisen',  'C', 'Retired (HOF 1964)',     420, [
    'Pre-modern era anchor', '1940s–50s: Multi-Pro Bowl center',
    'Pioneer of the deep snapper + pass-blocking combination role',
  ]),
  pl('fca', 'Frank Gatski',        'C', 'Retired (HOF 1985)',     1800, [
    '4× NFL Champion (Cleveland Browns)', 'NFL All-Decade 1950s Team',
    'Never missed a game or practice in 12-year career',
    '8 championship games — more than any C in NFL history',
  ]),
  pl('ble', 'Bill Curry',          'C', 'Retired (1974)',         780, [
    'Pro Bowl 1966', '3× Super Bowl Champion (I, II, V)',
    'Green Bay Packers and Baltimore Colts dynasty center',
    '2× champion under Lombardi; 1× under Don McCafferty',
  ]),
];
  /* ══════════════════════════════════════════════════════════════════════
     MASTER EXPORT  — vol 2
  ══════════════════════════════════════════════════════════════════════ */
  export const ALL_PLAYERS_OLD: Record<PositionGroup, NFLPlayer[]> = {
    QB: QB_POOL_OLD,
    RB: RB_POOL_OLD,
    WR: WR_POOL_OLD,
    TE: TE_POOL_OLD,
    OT: OT_POOL_OLD,
    OG: OG_POOL_OLD,
    C:  C_POOL_OLD,
  };