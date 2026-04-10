/* ─────────────────────────────────────────────────────────────────────────────
   nfl-offense-players-vol7.ts
   SEVENTH batch — NFL LEGENDS & HALL OF FAMERS.

   This volume is intentionally top-heavy. Pulling from this pool should feel
   like cracking open a vintage box. Rarity distribution is the inverse of the
   current-player volumes:

     ~10% common   — fringe Hall of Famers, bubble candidates
     ~28% rare     — very good; multiple Pro Bowls, long-time starters
     ~36% epic     — elite; HOF-level; multiple All-Pro seasons
     ~26% legendary — the GOATs; consensus all-time greats

   Scoring system is the same as previous vols but skewed higher because these
   players accumulated accolades over longer, more decorated careers.
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
   QUARTERBACKS — 16 entries
   2 common · 3 rare · 4 epic · 7 legendary
══════════════════════════════════════════════════════════════════════ */
export const QB_POOL_V7: NFLPlayer[] = [
  pl('tbr7', 'Tom Brady',           'QB', 'Retired (GOAT)',        7200, [
    '7× Super Bowl Champion (most in NFL history)',
    '5× Super Bowl MVP', '3× League MVP', '15× Pro Bowl',
    '3× AP 1st-Team', '89,214 career passing yards (all-time record)',
    '649 career TDs (all-time record)', 'Greatest of All Time — consensus',
  ]),
  pl('pey', 'Peyton Manning',      'QB', 'Retired (HOF 2021)',    5800, [
    '2× Super Bowl Champion', '5× League MVP (most ever)',
    '14× Pro Bowl', '7× AP 1st-Team',
    '2013: 55 TDs — NFL single-season record (at time)',
    '2013: 5,477 yards — NFL single-season record (at time)',
  ]),
  pl('dfa', 'Dan Marino',          'QB', 'Retired (HOF 2005)',    4900, [
    '9× Pro Bowl', '3× AP 1st-Team',
    '1984: 48 TDs — NFL record that stood for 20 years',
    '1984: 5,084 yards — NFL record that stood for 27 years',
    '61,361 career yards; only QB with multiple 5,000-yard seasons (at time)',
  ]),
  pl('jmo7', 'Joe Montana',         'QB', 'Retired (HOF 1994)',    5600, [
    '4× Super Bowl Champion', '3× Super Bowl MVP',
    '8× Pro Bowl', '2× AP 1st-Team', 'Never threw an INT in 4 Super Bowls',
    '127.8 career postseason passer rating — highest ever',
    'The Drive (1987 AFCCG) — greatest clutch moment in QB history',
  ]),
  pl('bre27','Brett Favre',         'QB', 'Retired (HOF 2016)',    4400, [
    '3× Consecutive League MVP (1995–97, only ever done once)',
    'Super Bowl XXXI Champion', '11× Pro Bowl', '3× AP 1st-Team',
    '508 consecutive starts — NFL Iron Man record at QB',
    '71,838 career yards; 508 TDs across 20 seasons',
  ]),
  pl('jel', 'John Elway',          'QB', 'Retired (HOF 2004)',    3800, [
    '2× Super Bowl Champion', 'Super Bowl XXXIII MVP',
    '9× Pro Bowl', '2× AP 1st-Team',
    '5× Super Bowl appearance — more than any QB in AFC history',
    'The Drive (1987) — 98-yard march to tie Cleveland in the cold',
  ]),
  pl('ste7', 'Steve Young',         'QB', 'Retired (HOF 2005)',    3600, [
    'Super Bowl XXIX Champion + MVP (6 TDs — record)',
    '7× Pro Bowl', '2× AP 1st-Team', '2× League MVP',
    '96.8 career passer rating — highest in NFL history at retirement',
    'Replaced Joe Montana and still won a Super Bowl',
  ]),
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
  pl('ter7', 'Terry Bradshaw',      'QB', 'Retired (HOF 1989)',    3400, [
    '4× Super Bowl Champion (IX, X, XIII, XIV)', '2× Super Bowl MVP',
    '3× Pro Bowl', 'AP 1st-Team 1978',
    '1978: 28 TDs — led Steelers to NFL\'s first back-to-back-to-back dominance',
    '3,833 Super Bowl passing yards — record at retirement',
  ]),
  pl('dco2','Drew Brees',          'QB', 'Retired (HOF 2024)',    4200, [
    '13× Pro Bowl', '2× AP 1st-Team', 'Super Bowl XLIV Champion + MVP',
    '80,358 career yards — all-time record (surpassed by Brady)',
    '571 career TDs', '2018: 74.4% completion — NFL record at time',
    'Rebuilt New Orleans post-Katrina — franchise icon',
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
];

/* ══════════════════════════════════════════════════════════════════════
   RUNNING BACKS — 18 entries
   1 common · 4 rare · 5 epic · 8 legendary
══════════════════════════════════════════════════════════════════════ */
export const RB_POOL_V7: NFLPlayer[] = [
  pl('jbr', 'Jim Brown',           'RB', 'Retired (HOF 1971)',    7800, [
    '9× Pro Bowl', '8× AP 1st-Team', '3× League MVP',
    '8× NFL Rushing Title — in 9 seasons (retired at peak)',
    '5.2 career YPC — highest ever for a primary back',
    'Consensus greatest RB in NFL history; never fumbled under pressure',
  ]),
  pl('bpa2','Barry Sanders',       'RB', 'Retired (HOF 2004)',    7400, [
    '10× Pro Bowl', '6× AP 1st-Team', '2× League MVP',
    '4× NFL Rushing Title', '1997: 2,358 yards — 2nd most ever',
    'Retired 2nd on all-time list (15,269 yards) — purely by choice',
    'Consensus #2 RB ever — the most elusive runner in NFL history',
  ]),
  pl('wal','Walter Payton',        'RB', 'Retired (HOF 1993)',    7000, [
    'Super Bowl XX Champion', '9× Pro Bowl', '2× AP 1st-Team',
    '1977: 275 yards in one game — NFL record (stood 23 years)',
    '16,726 career rushing yards — held all-time record for 18 years',
    '"Sweetness" — combined rushing, receiving, and passing across career',
  ]),
  pl('eme', 'Emmitt Smith',        'RB', 'Retired (HOF 2010)',    6200, [
    '3× Super Bowl Champion (XXVII, XXVIII, XXX)', 'Super Bowl XXVIII MVP',
    '8× Pro Bowl', '4× AP 1st-Team', '4× NFL Rushing Title',
    '18,355 career rushing yards — all-time record',
    '164 career rushing TDs — all-time record',
  ]),
  pl('eal2','Earl Campbell',       'RB', 'Retired (HOF 1991)',    4200, [
    'League MVP 1979', '5× Pro Bowl', '3× AP 1st-Team',
    '3× NFL Rushing Title', '1980: 1,934 yards — Oilers franchise record',
    'Most physically powerful runner in NFL history — one of 3 unanimous MVP RBs',
  ]),
  pl('lor', 'LaDainian Tomlinson', 'RB', 'Retired (HOF 2017)',    5800, [
    '5× Pro Bowl', '3× AP 1st-Team', 'League MVP 2006',
    '2006: 28 rushing TDs — NFL record', '2006: 186 points scored — NFL record',
    '13,684 career rushing yards', '162 career TDs',
  ]),
  pl('mef', 'Marshall Faulk',      'RB', 'Retired (HOF 2011)',    4800, [
    'League MVP 2000', '7× Pro Bowl', '3× AP 1st-Team',
    'Super Bowl XXXIV Champion', '2000: 2,189 scrimmage yards',
    '2000: "The Greatest Show on Turf" centerpiece — revolutionary dual threat',
    '12,279 career rushing + 6,875 receiving yards',
  ]),
  pl('fta', 'Frank Thomas (RB)',   'RB', 'Retired (HOF 1954)',    500, [
    'Pro Football Hall of Fame 1954 (charter member)',
    '1930s–40s: Dominant fullback of Chicago Bears dynasty',
    '3× NFL Champion — Bear dynasty cornerstone',
  ]),
  pl('odo', 'O.J. Simpson',        'RB', 'Retired (HOF 1985)',    3200, [
    '5× Pro Bowl', '2× AP 1st-Team', '2× League MVP',
    '1973: 2,003 rushing yards — first ever to rush for 2,000 yards',
    '1975: 23 rushing TDs — NFL record at time',
    '11,236 career rushing yards',
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
  pl('eed', 'Eric Dickerson',      'RB', 'Retired (HOF 1999)',    4600, [
    '6× Pro Bowl', '4× AP 1st-Team', '2× NFL Rushing Title',
    '1984: 2,105 yards — NFL single-season record (still stands)',
    '1984 OROTY', '13,259 career rushing yards',
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
  pl('aha', 'Adrian Peterson (v2)','RB', 'Retired (HOF 2024)',   5400, [
    '7× Pro Bowl', '4× AP 1st-Team', 'League MVP 2012', '4× Rushing Title',
    '2012: 2,097 yards — 2nd-highest single-season total ever',
    '2012: Returned from torn ACL in under a year — miraculous comeback',
    '14,918 career rushing yards — 4th all-time',
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
];

/* ══════════════════════════════════════════════════════════════════════
   WIDE RECEIVERS — 20 entries
   2 common · 3 rare · 7 epic · 8 legendary
══════════════════════════════════════════════════════════════════════ */
export const WR_POOL_V7: NFLPlayer[] = [
  pl('jri', 'Jerry Rice',          'WR', 'Retired (HOF 2010)',    8200, [
    '3× Super Bowl Champion (XIX, XXIII, XXIX)', 'Super Bowl XXIII MVP',
    '13× Pro Bowl', '10× AP 1st-Team', '2× OPOY', 'League MVP 1987',
    '22,895 career receiving yards — all-time record by a massive margin',
    '208 career receiving TDs — all-time record',
    'Consensus greatest WR and greatest skill position player in NFL history',
  ]),
  pl('ran', 'Randy Moss',          'WR', 'Retired (HOF 2018)',    6800, [
    'Super Bowl XLII appearance', '6× Pro Bowl', '4× AP 1st-Team',
    '1998 OROTY', '2007: 23 receiving TDs — NFL record',
    '2007: 1,493 yards alongside Brady\'s perfect season',
    '156 career TDs — 2nd all-time',
  ]),
  pl('ter27','Terrell Owens',       'WR', 'Retired (HOF 2018)',    6200, [
    '6× Pro Bowl', '3× AP 1st-Team',
    '15,934 career receiving yards — 3rd all-time',
    '153 career TDs — 3rd all-time',
    '2004 (PHI): 77 catches, 1,200 yards — Super Bowl XXXIX appearance',
    '2000 (SF): 20 catches vs. Bears — NFL record',
  ]),
  pl('cca', 'Cris Carter',         'WR', 'Retired (HOF 2013)',    4200, [
    '8× Pro Bowl', '3× AP 1st-Team',
    '130 TDs — 2nd all-time at retirement', '13,899 career yards',
    '1994: 122 catches — NFL record at time',
    'Known for greatest hands of any WR in NFL history',
  ]),
  pl('don2','Don Hutson',          'WR', 'Retired (HOF 1963)',    4800, [
    '9× Pro Bowl (pre-war era)', '3× League MVP',
    '2× NFL Champion (Green Bay 1939, 1944)',
    '99 career TDs — held record for 44 years',
    'Invented most WR routes still used today — the original WR blueprint',
    '1942: Led league in TDs — historic pre-modern dominance',
  ]),
  pl('tin', 'Tim Brown',           'WR', 'Retired (HOF 2015)',    2800, [
    '9× Pro Bowl', '2× AP 2nd-Team', '1988 Heisman Trophy winner',
    '14,934 career yards — 4th all-time at retirement',
    '100 career TDs', 'Super Bowl XXXVII appearance (Oakland)',
  ]),
  pl('irv7', 'Michael Irvin',       'WR', 'Retired (HOF 2007)',    3600, [
    '3× Super Bowl Champion (XXVII, XXVIII, XXX)',
    '5× Pro Bowl', '3× AP 1st-Team',
    '1995: 1,603 yards — Cowboys franchise record',
    '"The Playmaker" — 111 catches in 1995 (led NFL)',
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
];

/* ══════════════════════════════════════════════════════════════════════
   TIGHT ENDS — 12 entries
   1 common · 3 rare · 4 epic · 4 legendary
══════════════════════════════════════════════════════════════════════ */
export const TE_POOL_V7: NFLPlayer[] = [
  pl('tke', 'Mike Ditka',          'TE', 'Retired (HOF 1988)',    4200, [
    'Super Bowl VI Champion', '5× Pro Bowl', '3× AP 1st-Team',
    '1961: 56 catches — redefined the TE position forever',
    'Invented the modern tight end — first true pass-catching TE in NFL',
    'Also became legendary as head coach (Bears Super Bowl XX)',
  ]),
  pl('sha2','Shannon Sharpe',      'TE', 'Retired (HOF 2011)',    4800, [
    '3× Super Bowl Champion (XXXII, XXXIII, XXXVII)', '8× Pro Bowl', '3× AP 1st-Team',
    '10,060 career yards — most ever by a TE at retirement',
    '62 career TDs', '2000: 1,002 yards — first TE with three 1,000-yard seasons',
  ]),
  pl('kte', 'Kellen Winslow Sr.',  'TE', 'Retired (HOF 1995)',    3800, [
    '5× Pro Bowl', '3× AP 1st-Team',
    '1981 Playoffs vs. Miami: 13 catches, 166 yards — legendary performance',
    'Revolutionized TE as a receiving weapon — "Air Coryell" pillar',
  ]),
  pl('oti', 'Ozzie Newsome',       'TE', 'Retired (HOF 1999)',    3200, [
    '3× Pro Bowl', '2× AP 2nd-Team',
    '7,980 career yards — led all TEs at time of retirement',
    '"The Wizard of Oz" — first great receiving TE of modern era',
    'Later built Ravens into dynasty as GM — two Super Bowl rings as exec',
  ]),
  pl('dar2','Dave Casper',         'TE', 'Retired (HOF 1988)',    2400, [
    '5× Pro Bowl', '2× AP 1st-Team', 'Super Bowl XI Champion',
    '1977: Led NFL TEs in receiving yards — dominant season',
    '"The Ghost" — key component of Raiders dynasty TE blueprint',
  ]),
  pl('ant7', 'Antonio Gates',       'TE', 'Retired (HOF 2024)',    3800, [
    '8× Pro Bowl', '4× AP 1st-Team',
    '116 career TDs — all-time TE record',
    '11,841 career yards — 2nd all-time at TE at retirement',
    'Undrafted: NBA player who never played college football → HOF TE',
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
];

/* ══════════════════════════════════════════════════════════════════════
   OFFENSIVE TACKLES — 15 entries
   2 common · 4 rare · 5 epic · 4 legendary
══════════════════════════════════════════════════════════════════════ */
export const OT_POOL_V7: NFLPlayer[] = [
  pl('ant2','Anthony Munoz',       'OT', 'Retired (HOF 1998)',    7600, [
    '11× Pro Bowl', '9× AP 1st-Team',
    'Consensus greatest offensive lineman in NFL history',
    '1991: Final Pro Bowl at age 33 — consistent dominance across entire career',
    '3× Super Bowl appearance (XVI, XXIII, XLII) via Bengals dynasties',
  ]),
  pl('jog', 'Jonathan Ogden',      'OT', 'Retired (HOF 2013)',    6200, [
    '11× Pro Bowl', '9× AP 1st-Team', 'Super Bowl XXXV Champion',
    '4th Overall Pick 1996 — never allowed more than 4 sacks in a season',
    'Consensus top-3 LT in NFL history — anchored Ravens dynasty',
  ]),
  pl('osa', 'Orlando Pace',        'OT', 'Retired (HOF 2009)',    5600, [
    '7× Pro Bowl', '4× AP 1st-Team', 'Super Bowl XXXIV Champion',
    '1st Overall Pick 1997', '"The Greatest Show on Turf" bodyguard',
    'Allowed 0 sacks in multiple full seasons — physically dominant',
  ]),
  pl('oal', 'Forrest Gregg',       'OT', 'Retired (HOF 1977)',    4200, [
    '9× Pro Bowl', '5× AP 1st-Team', '5× NFL Champion (Green Bay)',
    'Super Bowl I + II Champion', 'Vince Lombardi called him "the finest player I ever coached"',
    'Lombardi Packers dynasty cornerstone',
  ]),
  pl('gba2','Gary Zimmerman',      'OT', 'Retired (HOF 2008)',    3200, [
    '7× Pro Bowl', '3× AP 1st-Team', 'Super Bowl XXXII Champion (DEN)',
    '2× All-USFL (1984–85) before NFL',
    'Protected John Elway and allowed him to finish career with title',
  ]),
  pl('wro', 'Walter Jones',        'OT', 'Retired (HOF 2014)',    5200, [
    '9× Pro Bowl', '6× AP 1st-Team',
    '6th Pick 1997 — played 12 seasons, allowed fewer than 30 sacks total',
    'Anchored Seahawks OL for their first Super Bowl appearance (XL)',
    'PFF retroactively grades him as one of the 3 best OTs ever',
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
];

/* ══════════════════════════════════════════════════════════════════════
   OFFENSIVE GUARDS — 15 entries
   1 common · 4 rare · 5 epic · 5 legendary
══════════════════════════════════════════════════════════════════════ */
export const OG_POOL_V7: NFLPlayer[] = [
  pl('jgu', 'John Hannah',         'OG', 'Retired (HOF 1991)',    7400, [
    '9× Pro Bowl', '10× AP 1st-Team', 'Super Bowl XX Champion',
    'Sports Illustrated 1981: "The Best Offensive Lineman of All Time" (cover story)',
    'Consensus greatest guard in NFL history',
    'Blocked for Patriots running game that dominated the 1970s–80s',
  ]),
  pl('bgu', 'Bruce Matthews',      'OG', 'Retired (HOF 2007)',    6800, [
    '14× Pro Bowl', '7× AP 1st-Team',
    'Played C, G, and T across 19 seasons — most versatile OL in history',
    'Super Bowl XXXIV appearance (TEN)',
    '296 career games — most ever by an offensive lineman',
  ]),
  pl('lar', 'Larry Allen',         'OG', 'Retired (HOF 2013)',    6200, [
    '11× Pro Bowl', '7× AP 1st-Team', '3× Super Bowl Champion (XXVII, XXVIII, XXX)',
    'Considered the strongest player in NFL history — benchpressed 700 lbs',
    '1994–2001: 8 consecutive seasons named to All-Pro team',
    'Part of Cowboys "Great Wall" alongside Rayfield Wright and company',
  ]),
  pl('ggu', 'Gene Upshaw',         'OG', 'Retired (HOF 1987)',    5200, [
    '6× Pro Bowl', '3× AP 1st-Team', '2× Super Bowl Champion (XI, XV)',
    '1967–1981: Raiders dynasty left guard for 15 seasons',
    'Later became NFL Players Association executive director — double legacy',
  ]),
  pl('rmu', 'Russ Grimm',          'OG', 'Retired (HOF 2010)',    4600, [
    '4× Pro Bowl', '3× AP 1st-Team', '3× Super Bowl Champion (XVII, XXII, XXVI)',
    'Part of Washington "Hogs" OL — greatest OL unit in NFL history',
    'Key to John Riggins\'s Super Bowl MVP season',
  ]),
  pl('tgu', 'Tom Mack',            'OG', 'Retired (HOF 1999)',    3600, [
    '11× Pro Bowl', '3× AP 1st-Team', 'Super Bowl IV appearance (LAR)',
    '184 consecutive starts — dominated from 1966–1978',
    '"Fearsome Foursome" opposing DL never got past him',
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
];

/* ══════════════════════════════════════════════════════════════════════
   CENTERS — 12 entries
   1 common · 3 rare · 4 epic · 4 legendary
══════════════════════════════════════════════════════════════════════ */
export const C_POOL_V7: NFLPlayer[] = [
  pl('mwe', 'Mike Webster',        'C', 'Retired (HOF 1997)',     7200, [
    '9× Pro Bowl', '4× AP 1st-Team', '4× Super Bowl Champion (IX, X, XIII, XIV)',
    'Consensus greatest center in NFL history',
    '"Iron Mike" — 245 consecutive starts; played through devastating injuries',
    'Anchored the Pittsburgh Steelers dynasty offensive line',
  ]),
  pl('dli', 'Dwight Stephenson',   'C', 'Retired (HOF 1998)',     5600, [
    '5× Pro Bowl', '5× AP 1st-Team',
    'Consensus 2nd-greatest center ever — career ended by knee injury',
    '1985: Named to multiple All-Time teams; Dan Marino called him "the best"',
    'Alabama: 2× National Champion before going pro',
  ]),
  pl('che2','Jim Otto',            'C', 'Retired (HOF 1980)',     4400, [
    '12× Pro Bowl', '9× AP 1st-Team', 'Super Bowl XI appearance',
    '1960–1974: Never missed a game (never missed a start in 15 AFL/NFL seasons)',
    '"Double Zero" — AFL All-Time First Team C',
    'Oakland Raiders franchise anchor for their championship dynasty',
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
  pl('kce', 'Kevin Mawae',         'C', 'Retired (HOF 2019)',     4200, [
    '8× Pro Bowl', '4× AP 1st-Team',
    '1996–2009: 14 seasons as dominant starting C across 4 teams',
    '191 consecutive starts — tied for iron man at center position',
    'Blocked for multiple Hall of Fame QBs across career',
  ]),
  pl('tom7', 'Tom Rafferty',        'C', 'Retired (1993)',         680, [
    'Pro Bowl 1986', 'Super Bowl XII Champion (Dallas Cowboys)',
    '11-year Cowboys starter — part of their 1970s–80s dynasty unit',
  ]),
  pl('jpa', 'Jeff Saturday',       'C', 'Retired (HOF 2023)',     3200, [
    '6× Pro Bowl', '3× AP 1st-Team', 'Super Bowl XLI Champion (IND)',
    'Undrafted 1998', '2006: Protected Manning\'s blind side and center',
    'Peyton Manning\'s personal protector — QB called him best ever',
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
   MASTER EXPORT
══════════════════════════════════════════════════════════════════════ */
export const ALL_PLAYERS_V7: Record<PositionGroup, NFLPlayer[]> = {
  QB: QB_POOL_V7,
  RB: RB_POOL_V7,
  WR: WR_POOL_V7,
  TE: TE_POOL_V7,
  OT: OT_POOL_V7,
  OG: OG_POOL_V7,
  C:  C_POOL_V7,
};

/*
  QB  : 2c · 3r · 4e · 7L  = 16
  RB  : 1c · 4r · 5e · 8L  = 18
  WR  : 2c · 3r · 7e · 8L  = 20
  TE  : 1c · 3r · 4e · 4L  = 12
  OT  : 2c · 4r · 5e · 4L  = 15
  OG  : 1c · 4r · 5e · 5L  = 15
  C   : 1c · 3r · 4e · 4L  = 12
  ─────────────────────────────────
  Vol 7 total: 108 players
  Common: 10 (9%) · Rare: 24 (22%) · Epic: 34 (31%) · Legendary: 40 (37%)
*/