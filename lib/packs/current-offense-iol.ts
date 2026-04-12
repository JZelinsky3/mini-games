/* ─────────────────────────────────────────────────────────────────────────────
   nfl-offense-players-vol6.ts
   SIXTH batch — active 2025 players, depth starters, ascending talent.

   Target distribution:
     ~54% common  (0 – 699)
     ~36% rare    (700 – 1 499)
     ~10% epic    (1 500 – 2 799)
       0% legendary
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
   OFFENSIVE GUARDS  — 16 new entries
══════════════════════════════════════════════════════════════════════ */
export const OG_POOL_V1: NFLPlayer[] = [
  pl('dot','Kevin Dotson','OG','Los Angeles Rams', 880, [
    '2× Pro Bowl','AP 2nd-Team (2023)',
    '129th Pick (2020)','2023: Highest-graded guard in NFC per PFF',
    'Pillar of Rams\' rebuilt O-Line with Stafford',
    '2025 All-Pro consideration — elite interior anchor for Rams'
  ]),
  pl('hun','Robert Hunt','OG','Los Angeles Chargers', 840, [
    '3× Pro Bowl','39th Pick (2020)',
    '2022 AP 2nd-Team','Massive (6\'5", 323) dominant run blocker',
    '2023: Key piece allowing Herbert\'s strong season',
  ]),
  pl('tom','Laken Tomlinson','OG','New York Jets', 620, [
    '2× Pro Bowl','28th Pick (2015)',
    'SF 49ers: AP 2nd-Team consideration 2021',
    '2022: Anchored Jets\' best O-Line in years',
  ]),
  pl('whi2','Cody Whitehair','OG','Chicago Bears', 580, [
    '2× Pro Bowl','56th Pick (2016)',
    'Played C & G across career; 2× Pro Bowl at C (vol 1 eligible)',
    'Bears franchise O-Line leader 2016–2023',
  ]),
  pl('new','Xavier Newman-Johnson','OG','San Francisco 49ers', 380, [
    '148th Pick (2021)','Key reserve piece for 49ers\' run-dominant O-Line',
    '2023: Super Bowl LVIII appearance',
  ]),
  pl('ber2','Matthew Bergeron','OG','Atlanta Falcons', 260, [
    '38th Pick (2023)','2023: Immediate starter as rookie LG',
  ]),
  pl('may2','Jalen Mayfield','OG','Atlanta Falcons', 180, [
    '68th Pick (2021)','Developing starter in Falcons rebuild',
  ]),
  pl('lev2','Nick Leverett','OG','Tampa Bay Buccaneers', 280, [
    '2× Super Bowl Champion (KC LVII, LV as TB backup)',
    'Undrafted (2020) — resilient depth piece turned starter',
  ]),
  pl('ont','Netane Muti','OG','San Francisco 49ers', 220, [
    '189th Pick (2020)','Super Bowl LVIII appearance',
    'Powerful run blocker — key depth in 49ers\' system',
  ]),
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
  pl('cbl', 'Cameron Erving',      'OG', 'Free Agent',            260, [
    '19th Pick 2015', '2018 (KC): Super Bowl LIV ring reserve lineman',
    'Florida State: National Champion 2013',
  ]),
  pl('nel3','Nate Davis',          'OG', 'Free Agent',            580, [
    '68th Pick 2019', 'Pro Bowl 2022 (alternate)',
    '2022: Starting RG for Titans in playoff team',
    'Charlotte: FBS transfer success story — outplayed draft position',
  ]),
  pl('rce', 'Rod Sweeting',        'OG', 'Free Agent',            160, [
    'Undrafted 2013', 'Veteran journeyman backup across 6 teams',
    'Georgia: 2-year guard on elite SEC line',
  ]),
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
  pl('thu','Joe Thuney','OG','Chicago Bears', 1960, [
    '4× Pro Bowl','3× Super Bowl Champion (NE ×2, KC ×1)',
    'Highest paid guard in NFL history (at signing 2021)',
    'Key piece of Patriots & Chiefs dynasty O-Lines',
    '2025 Protector of the Year (inaugural award)',
    '2025 AP 1st-Team All-Pro (Left Guard)',
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
  pl('hhu', 'Hakeem Adeniji',     'OG', 'Cleveland Browns',         280, [
    '163rd Pick 2020', '2022: Started 11 games at guard for Browns',
    'Kansas: 3-year starter — versatile guard/tackle',
  ]),
  pl('nco', 'Nick Allegretti',    'OG', 'Kansas City Chiefs',       360, [
    '224th Pick 2019', '3× Super Bowl Champion (LVII, LVIII, pre-2025)',
    'Illinois: 3-year starter — part of Chiefs\' dynasty interior line',
  ]),
  pl('ale2','Alex Bars',          'OG', 'Carolina Panthers',        200, [
    'Undrafted 2019', '2022: Starting RG for Panthers',
    'Notre Dame: 2-year starter at multiple positions',
  ]),
  pl('owa', 'Owen Carney Jr.',    'OG', 'Las Vegas Raiders',        180, [
    '241st Pick 2022', '2024: Depth interior lineman for Raiders',
    'Illinois: Utility interior OL — versatile snapper',
  ]),
  pl('tse', 'Teven Jenkins','OG', 'Chicago Bears',             320, [
    '39th Pick 2021', '2022: Played primarily guard for Bears',
    'High athleticism — can play G or T depending on scheme',
  ]),
  pl('mou', 'Michael Deiter',     'OG', 'Miami Dolphins',           240, [
    '93rd Pick 2019', '2022: Starting C/G for Dolphins',
    'Wisconsin: 2-year captain — winner\'s mentality',
  ]),
  pl('eha', 'Elijah Higgins',     'OG', 'Free Agent',               180, [
    'Undrafted 2023 (Stanford)', '2024: Competed for practice squad spots',
    'Crossover athlete — TE-converted to OG prototype',
  ]),
  pl('jha3','Jahee Larkin',       'OG', 'Tennessee Titans',         200, [
    'Undrafted 2023', '2024: Part of Titans\' rebuilt offensive line',
    'Georgia Tech: 3-year starter',
  ]),
  pl('ami2','Austin Corbett',     'OG', 'Free Agent',               600, [
    'Pro Bowl 2021', '33rd Pick 2018',
    '2020 (LAR): Super Bowl LVI ring — key piece of dominant OL',
    '2021 (CAR): Starting RG, Pro Bowl level play all season',
  ]),
  pl('bpa', 'Ben Powers',         'OG', 'Denver Broncos',           640, [
    '127th Pick 2019', '2× Pro Bowl (alternate)',
    '2022 (BAL): Starting LG for Ravens — 73.8 PFF run-block grade',
    '2023: Signed to large deal by Denver — one of top guards in AFC',
  ]),
  pl('gre2','Graham Glasgow',     'OG', 'Free Agent',               400, [
    '100th Pick 2016', '2019: Starting RG for Lions — 83.4 PFF grade',
    'Michigan: 3-year starting center converted to guard in NFL',
  ]),
  pl('kco2','Kenyon Green',       'OG', 'Houston Texans',           340, [
    '15th Pick 2022', '2024: Returning starter for Texans\' postseason OL',
    'Texas A&M: 2021 All-SEC — high pedigree',
  ]),
  pl('nde', 'Nick Easton',        'OG', 'Free Agent',               260, [
    'Undrafted 2015', '2021 (NO): Starting LG for Saints',
    'Harvard: Ivy League ironman — 8-year career in NFL',
  ]),
  pl('jmc3','Jarvis Jenkins',     'OG', 'Indianapolis Colts',       220, [
    'Undrafted 2023', '2024: Part of Colts\' interior rebuild under new regime',
    'Georgia: 2-year starter on SEC championship line',
  ]),
  pl('sbi', 'Spencer Brown',      'OG', 'Buffalo Bills',            760, [
    '93rd Pick 2021', '2× Pro Bowl (alternate)', '2023: Starting RT/RG for Bills',
    'Northern Iowa (FCS): Record-setting DI-to-NFL development story',
  ]),
  pl('bre', 'Aaron Brewer', 'OG', 'Miami Dolphins', 980, [
    'High PFF grades in recent seasons','Versatile interior lineman — strong run blocker',
    'Key contributor to Dolphins\' O-Line'
  ]),
  pl('tan', 'Tanor Bortolini', 'OG', 'Indianapolis Colts', 920, [
    'Breakout 2025 season','Improved dramatically as starter',
    'High-upside young interior player'
  ]),
  pl('neu', 'Ryan Neuzil', 'OG', 'Atlanta Falcons', 880, [
    'Strong replacement/starting play','Reliable run blocker in Falcons system',
    'Consistent contributor'
  ]),
  pl('sim', 'John Simpson', 'OG', 'Baltimore Ravens', 850, [
    'Recent high-value signing','Physical guard with starting experience',
    'Helped stabilize interior lines'
  ]),
  pl('aba2','Aaron Banks','OG','San Francisco 49ers', 380, [
    '48th Pick (2021)','Super Bowl LVIII appearance',
    '2023: Key interior piece of 49ers\' dominant run-blocking O-Line',
    'Notre Dame: Two-year starter before being selected',
  ]),
  pl('cst','Cole Strange','OG','New England Patriots', 320, [
    '29th Pick (2022)','Starting LG protecting Drake Maye',
    '2023: Full-time starter for Patriots\' rebuilt interior',
    'Chattanooga (FCS): Scout favorite for athleticism',
  ]),
  pl('jca3','Jackson Carman','OG','Cincinnati Bengals', 240, [
    '46th Pick (2021)','2022: Super Bowl LVI appearance',
    '2024: Fighting for starting role in CIN\'s strong interior',
    'Clemson: 2× National Champion — winning culture background',
  ]),
  pl('ato','Atonio Mafi','OG','Los Angeles Rams', 280, [
    '68th Pick (2023)','2024: Growing role in Rams\' interior line',
    'Utah: 2-year starter; mauling run blocker with elite power',
  ]),
  pl('mglo','Mark Glowinski','OG','Denver Broncos', 400, [
    '2× Pro Bowl','35th Pick (2015)',
    '2021: Starting RG for 13-4 Colts — Pro Bowl',
    '8-year starter across SEA, IND, NYG, DEN',
  ]),
  pl('lei','Liam Eichenberg','OG','Miami Dolphins', 280, [
    '42nd Pick (2021)','2022: Starting LG for Dolphins playoff team',
    'Notre Dame: 2-year All-ACC starter before draft',
  ]),
  pl('cof','Cody Ford','OG','Buffalo Bills', 240, [
    '38th Pick (2019)','Versatile G/T — started at both positions',
    '2021: Key depth on Bills\' strong O-Line',
    'Oklahoma: Started on Big 12 championship line',
  ]),
  pl('elw','Elijah Wilkinson','OG','Carolina Panthers', 200, [
    'Undrafted (2017)','8-year veteran across 5 teams',
    '2021: Started 15 games for Chicago Bears',
  ]),
  pl('nhe','Nate Herbig','OG','New York Jets', 240, [
    'Undrafted (2020)','2022: Starting RG for Jets',
    'Stanford: Academic All-Pac-12 — high-football IQ lineman',
  ]),
  pl('rha','Ryan Hayes','OG','Minnesota Vikings', 220, [
    '177th Pick (2022)','2024: Full-time starter for Vikings',
    'Michigan: National Champion (2023) before entering NFL',
  ]),
  pl('olu','Olu Oluwatimi','C','Detroit Lions', 320, [
    '65th Pick (2023)','Rimington Award winner (2022) — best center in college',
    '2024: Moved to guard in Detroit; Super Bowl LVIII appearance',
    'Michigan: National Champion — winning pedigree',
  ]),
  pl('ken2','Kendrick Green','OG','Pittsburgh Steelers', 220, [
    '87th Pick (2021)','Started 17 games at C as rookie; moved to G',
    'Illinois: Two-year starter — versatile interior lineman',
  ]),
  pl('luk','Lucas Patrick','OG','Free Agent', 240, [
    'Undrafted (2016)','2× Super Bowl ring (Green Bay runs)',
    '2021: Starting C/G for Packers — reliable system piece',
  ]),
  pl('dan3','Dan Feeney','OG','New York Jets', 220, [
    '72nd Pick (2017)','2023: Starting C/G for Jets',
    '2020: Starting LG for Justin Herbert\'s first year',
    'Indiana: Multi-year starter who outplayed draft position',
  ]),
  pl('joh5','Jon Feliciano','OG','Free Agent', 260, [
    '141st Pick (2015)','2021: Starting G for Bills in AFC Championship run',
    'Miami: 3-year starter; vocal locker-room leader',
  ]),
  pl('car2','Jonah Jackson','OG','Los Angeles Rams', 720, [
    '3× Pro Bowl','75th Pick (2020)','AP 2nd-Team (2023)',
    '2023: Highest-graded guard in NFC West per PFF',
    '2024: Signed with Rams; key piece of Stafford\'s protection',
  ]),
  pl('smi3', 'Peter Skoronski', 'OG', 'Tennessee Titans', 2180, [
    'Pro Bowl alternate / consideration','Rising star guard with elite pass-blocking metrics',
    'High football IQ and technique — immediate impact since draft',
    'Key protector in Titans\' offensive scheme'
  ]),
  pl('vor', 'Andrew Vorhees', 'OG', 'Baltimore Ravens', 1920, [
    'Strong recent starter','Versatile and powerful interior lineman',
    'Key contributor to Ravens\' run-heavy attack',
    'Developing into a top-tier guard'
  ]),
  pl('edw', 'David Edwards', 'OG', 'Free Agent / recent high-value signing', 1850, [
    'Multiple seasons as reliable starter','Pro Bowl alternate level play',
    'Versatile guard with experience across systems',
    'Solid veteran anchor'
  ]),
  pl('joh2', 'Zion Johnson', 'OG', 'Cleveland Browns', 1780, [
    'High draft pedigree','Athletic and powerful — rising in 2025–2026',
    'Key piece in Browns\' interior rebuild',
    'Strong run blocker with improving pass pro'
  ]),
  pl('smi4', 'Braden Smith', 'OG', 'Indianapolis Colts', 1720, [
    'Pro Bowl level play in recent seasons','Consistent starter with good PFF grades',
    'Physical presence on the interior'
  ]),
  pl('str2', 'Cole Strange', 'OG', 'Los Angeles Chargers', 1580, [
    'Recent starter with upside','Athletic guard with good mobility',
    'Contributed to strong offensive lines'
  ]),
  pl('onw2', 'Mike Onwenu', 'OG', 'New England Patriots', 1540, [
    'Pro Bowl (2023) + strong follow-up seasons','Versatile multi-position starter',
    'Big steal in the draft — reliable anchor'
  ]),
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
  pl('smi', 'Trey Smith', 'OG', 'Kansas City Chiefs', 3120, [
    'Multiple Pro Bowl selections','Consistent AP All-Pro consideration (2024–2025)',
    'Key piece of Chiefs\' multiple Super Bowl O-Lines (LVII, LVIII, and beyond)',
    'Elite run blocker and pass protector — anchors KC\'s interior for Patrick Mahomes',
    'One of the most dominant young guards in the NFL'
  ]),
  pl('smi2', 'Tyler Smith', 'OG', 'Dallas Cowboys', 2950, [
    'Multiple Pro Bowl selections','AP 2nd-Team All-Pro nods',
    'Young superstar guard — dominant in both run and pass game',
    'Cornerstone of Cowboys\' offensive line for years',
    'High-impact player with massive upside still in his prime'
  ])
];

/* ══════════════════════════════════════════════════════════════════════
   CENTERS — 13 new entries
══════════════════════════════════════════════════════════════════════ */
export const C_POOL_V1: NFLPlayer[] = [
  pl('tip','Joe Tippmann','C','New York Jets', 560, [
    '2× Pro Bowl','57th Pick (2023)',
    '2024: One of highest-graded centers in AFC per PFF',
    'Wisconsin product — immediate elite-level starter',
    'Shot-blocker build: 6\'6", 313 lbs with rare mobility',
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
  pl('qme','Quinn Meinerz','OG','Denver Broncos', 820, [
    'Pro Bowl (2022)','98th Pick (2021) — Division III Wisconsin-Whitewater',
    '2022: Full-time starter, one of best small-school success stories',
    '2023: Graded as top-15 C by PFF in strong run-block year',
    '2025 AP 1st-Team All-Pro (Right Guard) — elite run & pass blocker',
  ]),
  pl('epo','Ethan Pocic','C','Cleveland Browns', 360, [
    '46th Pick (2017)','2022: Best season of career — graded top-10 C',
    '2023: Key piece of Browns\' run-heavy offense with Chubb',
  ]),
  pl('bre2', 'Aaron Brewer', 'C', 'Miami Dolphins', 2850, [
    'Career-high PFF grades (top run blocker in 2025)','Multiple Pro Bowl / All-Pro consideration',
    'Elite anchor for Dolphins\' interior',
    'Standout 2025–2026 performer'
  ]),
  pl('lin4', 'Tyler Linderbaum', 'C', 'Baltimore Ravens', 2650, [
    'Multiple Pro Bowl selections','AP 2nd-Team level play',
    'One of the best young centers in the league',
    'High-graded in both run and pass'
  ]),
  pl('dal', 'Drew Dalman', 'C', 'Chicago Bears', 820, [
    'Pro Bowl selections (including 2025–2026)','Key to Bears\' resurgent line and run game',
  'Top vote-getter / high-impact starter'
  ]),
  pl('lft','Luke Fortner','C','Jacksonville Jaguars', 340, [
    '72nd Pick (2022)','2022–24: Full-time starter for Jaguars',
    'Kentucky: 2-year captain; 2021 team MVP',
  ]),
  pl('mmn','Michal Menet','C','Arizona Cardinals', 200, [
    '200th Pick (2021)','2024: Starting C in Arizona\'s rebuild',
    'Penn State: Multi-year starter in Big Ten',
  ]),
  pl('dki','Darian Kinnard','C','New York Jets', 220, [
    '209th Pick (2022)','2024: Starting interior lineman for Jets',
    'Kentucky: Rimington Award finalist — elite raw center prospect',
  ]),
  pl('gmc','Greg Mancz','C','Tampa Bay Buccaneers', 200, [
    'Undrafted (2015)','10-year veteran across 6 teams',
    '2019: Starting C for Houston Texans playoff team',
  ]),
  pl('hfr','Hjalte Froholdt','C','New England Patriots', 180, [
    '108th Pick (2019)','5-year backup / spot starter',
    'Arkansas: Multi-year SEC starter — reliable veteran depth',
  ]),
  pl('msk','Matt Skura','C','New York Giants', 180, [
    '183rd Pick (2016)','2019: Started 14 games for Ravens',
    'Duke: 3-year starter with strong size-speed profile',
  ]),
  pl('mco2','Mason Cole','C','Pittsburgh Steelers', 240, [
    '100th Pick (2018)','2023: Starting C for Steelers playoff team',
    'Michigan: 3-year starter — one of longest-tenured starters in draft class',
  ]),
  pl('bil','Billy Turner','C','Free Agent', 260, [
    '117th Pick (2014)','2020: Super Bowl LV ring (GB alternate)',
    'Versatile G/C across GB, DEN, MIA — reliable multi-year starter',
    'North Dakota State: 3× FCS Champion',
  ]),
  pl('smu2','Sam Mustipher','C','Minnesota Vikings', 200, [
    'Undrafted (2019)','3-year starter for Chicago Bears',
    '2021–22: Full-time starting C; cerebral interior anchor',
  ]),
  pl('jfe','Joel Feeney','C','Free Agent', 140, [
    'Long-tenured backup across multiple AFC systems',
    'Undrafted find who earned roster spot through sheer consistency',
  ]),
  pl('bor', 'Tanor Bortolini', 'C', 'Indianapolis Colts', 1180, [
    'Breakout 2025 season — big improvement','Strong PFF grades as full-time starter',
    'Versatile and smart interior player'
  ]),
  pl('neu2', 'Ryan Neuzil', 'C', 'Atlanta Falcons', 950, [
    ' Reliable starter / high run-block grades','Steady contributor in Falcons system'
  ]),
  pl('kel2', 'Ryan Kelly', 'C', 'Minnesota Vikings', 920, [
    'Long-time Pro Bowl alternate / veteran anchor','Solid 2025 play after move to Vikings'
  ]),
  pl('cam2', 'Cam Jurgens', 'C', 'Philadelphia Eagles', 880, [
    'Pro Bowl consideration','Seamless high-level play replacing veterans',
    'Consistent starter'
  ]),
  pl('bha2','Ben Bredeson',       'C', 'New York Giants',           220, [
    '117th Pick 2020', '2022: Starting G/C for Giants playoff team',
    'Michigan: 2-year starter in Big Ten — athletic interior lineman',
  ]),
  pl('nca', 'Nick Harris',        'C', 'Cleveland Browns',          200, [
    '160th Pick 2020', '2022: Starting C for Browns before injury',
    'Washington: 2-year starting center — smart pre-snap communicator',
  ]),
  pl('bcx','Brett Toth',         'C', 'Free Agent',               160, [
    'Undrafted 2017', '8-year veteran journeyman across 5 teams',
    'Army: Service academy-to-NFL model of hard work and longevity',
  ]),
  pl('tro','Tanner Hudson',       'C', 'Tampa Bay Buccaneers',      200, [
    'Undrafted 2018', '2022: Depth C/TE for Tampa Bay',
    'Southern Arkansas (D2): Developmental success story',
  ]),
  pl('mco3','Matt Gono',          'C', 'Free Agent',               180, [
    '247th Pick 2019', 'Versatile OL — started at C, LG, LT across career',
    'Richmond: FCS All-American tackle',
  ]),
  pl('gco', 'Greg Van Roten',     'C', 'Free Agent',               220, [
    'Undrafted 2012', '10-year career — started at C and G across 6 teams',
    'Penn: Ivy League → NFL — one of longest-tenured players from program',
  ]),
  pl('rba', 'Ryan Bates',         'C', 'Buffalo Bills',             580, [
    'Undrafted 2019', 'Pro Bowl alternate 2022',
    '2022: Starting LG for Bills AFC Championship team',
    'Penn State: Utility OL who earned multi-year starting contract',
  ]),
  pl('mmu', 'Michael Deiter', 'C', 'Tennessee Titans',          240, [
    '93rd Pick 2019', '2023: Starting C/G for Titans',
    'Wisconsin: 3-year starting center converted in NFL',
  ]),
  pl('bfa', 'Brian Allen',        'C', 'Los Angeles Rams',          540, [
    '98th Pick 2018', 'Super Bowl LVI Champion',
    '2023: Starting C for Rams — part of Stafford\'s protection unit',
    'Michigan State: 2-year captain and anchor',
  ]),
  pl('sba', 'Sam Mustipher',      'C', 'Free Agent',               200, [
    'Undrafted 2019', '2021–22: Full-time starting C for Chicago Bears',
    'Notre Dame: 2-year starter — reliable long snapper + center',
  ]),
  pl('jha4','Josh Andrews',       'C', 'Free Agent',               180, [
    'Undrafted 2014', 'Veteran backup across NYG, PHI, IND, NYJ',
    'Western Oregon (D2): Undersized but smart — reads defenses well',
  ]),
  pl('lmi', 'Lloyd Cushenberry',  'C', 'Tennessee Titans',          720, [
    '83rd Pick 2020', '2× Pro Bowl (alternate)',
    '2022: Full-time starter — highest-graded C on Broncos line',
    'LSU: National Champion 2019 — won in SEC biggest games',
  ]),
  pl('hum','Creed Humphrey','C','Kansas City Chiefs', 2420, [
    '3× Pro Bowl','AP 1st-Team (2022)','AP 2nd-Team',
    '2× Super Bowl Champion (LVII, LVIII)',
    '63rd Pick (2021) — 2nd round steal, immediate All-Pro',
    '2025 AP 1st-Team All-Pro (Center)',
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
  pl('lin3','Tyler Linderbaum','C','Baltimore Ravens', 1080, [
    '2× Pro Bowl','AP 2nd-Team (2023)','25th Pick (2022)',
    '2023: Highest-graded rookie C by PFF — ever',
    'Unanimous All-American at Iowa; immediate NFL starter',
  ]),
  pl('mor','Mitch Morse','C','Buffalo Bills', 740, [
    '2× Pro Bowl','58th Pick (2015)',
    'Considered top-5 C in AFC','2022: 0 penalties in entire season',
    'Key piece in Bills\' O-Line protecting Josh Allen',
  ]),
  pl('mcc2','Erik McCoy','C','New Orleans Saints', 640, [
    '2× Pro Bowl','48th Pick (2019)',
    '2021: Top-10 center by PFF grade','2022: Allowed just 1 sack all season',
  ]),
  pl('kel3','Ryan Kelly','C','Indianapolis Colts', 560, [
    'Pro Bowl (2021)','18th Pick (2016)',
    '2021: Highest-rated season for a Colts C in years',
    '5-year full-time starter; reliable anchor for Taylor\'s run game',
  ]),
  pl('zto','Zach Tom','C','Green Bay Packers', 460, [
    '185th Pick (2022)','Started at 4 positions in his first 2 seasons',
    '2023: Graded as top-5 C when starting — versatile standout',
  ]),
  pl('jsc','John Michael Schmitz','C','New York Giants', 280, [
    '43rd Pick (2023)','Immediate starter as rookie',
    '2023: Bright spot on otherwise struggling NYG line',
  ]),
  pl('hen2','Matt Hennessey','C','Atlanta Falcons', 260, [
    '78th Pick (2020)','Starting center for rebuilt Falcons O-Line',
    '2023: Highest-graded season of career per PFF',
  ]),
  pl('poc','Ethan Pocic','C','Cleveland Browns', 340, [
    '46th Pick (2017)','2022: Best season of career — Browns run game top-5',
    'Graded as top-10 center by PFF in 2022',
  ]),
  pl('jur3','Cam Jurgens','C','Philadelphia Eagles', 420, [
    '51st Pick (2022)','2024: Seamlessly replaced Jason Kelce',
    '2024 AP 2nd-Team consideration — immediate impact starter',
  ]),
  pl('mei','Quinn Meinerz','C','Denver Broncos', 300, [
    '98th Pick (2021) — out of Division III Wisconsin-Whitewater',
    '2022: Full-time starter, one of best small-school success stories',
    '2023: Graded as top-15 C by PFF in strong run-block year',
  ]),
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
  QB: [],
  RB: [],
  WR: [],
  TE: [],
  OT: [],
  OG: OG_POOL_V1,
  C:  C_POOL_V1,
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