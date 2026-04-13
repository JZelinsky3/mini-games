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
  if (score >= 2800) return 'transcendent';
  if (score >= 1600) return 'dynasty';
  if (score >= 700) return 'rare';
  return 'common';
}

function pl(
  id: string, 
  name: string, 
  pos: PositionGroup, 
  team: string,
  score: number, 
  accolades: string[]
): NFLPlayer {
  return { id, name, pos, team, score, rarity: r(score), accolades };
}

/* ══════════════════════════════════════════════════════════════════════
   INTERIOR OFFENSIVE LINEMEN (OG + C) — Updated V2
   Scoring based on current 2025–2026 skill level and impact
══════════════════════════════════════════════════════════════════════ */

export const OG_POOL_V1: NFLPlayer[] = [
  // === TOP TIER GUARDS ===
  pl('smi','Trey Smith','OG','Kansas City Chiefs', 3380, [
    'Elite run blocker for Mahomes','Multiple All-Pro consideration'
  ]),
  pl('smi2','Tyler Smith','OG','Dallas Cowboys', 3250, [
    'Young superstar guard','Dominant in run and pass game'
  ]),
  pl('nel','Quenton Nelson','OG','Indianapolis Colts', 3420, [
    'Best OG prospect ever','Consistent All-Pro level force'
  ]),
  pl('qme','Quinn Meinerz','OG','Denver Broncos', 3180, [
    '2× AP 1st-Team All-Pro (2024-2025)','PFF highest-graded guard in 2025'
  ]),

  // === DYNASTY TIER ===
  pl('bit','Joel Bitonio','OG','Cleveland Browns', 2680, [
    'Multiple All-Pro seasons','Franchise cornerstone for Browns'
  ]),
  pl('thu','Joe Thuney','OG','Chicago Bears', 2550, [
    'Elite pass protector','Super Bowl veteran leader'
  ]),
  pl('vor','Andrew Vorhees','OG','Baltimore Ravens', 2120, [
    'Strong recent starter','Powerful run blocker'
  ]),
  pl('edw','David Edwards','OG','Free Agent', 2050, [
    'Reliable veteran anchor','Consistent high-level starter'
  ]),
  pl('joh2','Zion Johnson','OG','Cleveland Browns', 1980, [
    'High draft pedigree','Rising athletic guard'
  ]),
  pl('smi4','Braden Smith','OG','Indianapolis Colts', 1820, [
    'Physical presence','Pro Bowl level consistency'
  ]),
  pl('str2','Cole Strange','OG','Los Angeles Chargers', 1780, [
    'Athletic with upside','Solid contributor in recent seasons'
  ]),
  pl('onw2','Mike Onwenu','OG','New England Patriots', 1740, [
    'Versatile multi-position starter','Pro Bowl caliber anchor'
  ]),

  // === RARE TIER GUARDS ===
  pl('tel','Wyatt Teller','OG','Cleveland Browns', 1480, [
    'Dominant run blocker','Former elite PFF grades'
  ]),
  pl('lin','Chris Lindstrom','OG','Atlanta Falcons', 1420, [
    'Highest-graded guard contender','Consistent Pro Bowl alternate'
  ]),
  pl('bre','Aaron Brewer','OG','Miami Dolphins', 1380, [
    'Versatile interior force','Strong recent PFF grades'
  ]),
  pl('tan','Tanor Bortolini','OG','Indianapolis Colts', 1350, [
    'Breakout starter','High-upside young guard'
  ]),
  pl('neu','Ryan Neuzil','OG','Atlanta Falcons', 1280, [
    'Reliable run blocker','Steady starter in Falcons system'
  ]),
  pl('sim','John Simpson','OG','Baltimore Ravens', 1250, [
    'Physical guard','Recent high-value contributor'
  ]),
  pl('avi','Steve Avila','OG','Los Angeles Rams', 1220, [
    'Rising young starter','Elite rookie grades in recent past'
  ]),
  pl('car2','Jonah Jackson','OG','Los Angeles Rams', 1180, [
    'High-graded in recent seasons','Key piece for Stafford'
  ]),
  pl('hug','Elgton Jenkins','OG','Green Bay Packers', 1080, [
    'Ultra-versatile starter','Multiple Pro Bowl nods'
  ]),
  pl('sea','Isaac Seumalo','OG','Pittsburgh Steelers', 1020, [
    'Solid veteran starter','Super Bowl experience'
  ]),
  pl('mas','Shaq Mason','OG','Washington Commanders', 980, [
    'Super Bowl champion guard','Consistent performer'
  ]),
  pl('zel','Kevin Zeitler','OG','Baltimore Ravens', 950, [
    'Long-time reliable starter','High consistency'
  ]),
  pl('bpa','Ben Powers','OG','Denver Broncos', 920, [
    'Strong run blocker','Recent large contract signee'
  ]),
  pl('sbi','Spencer Brown','OG','Buffalo Bills', 880, [
    'Athletic development story','Pro Bowl alternate level'
  ]),
  pl('kdo','Kevin Dotson','OG','Los Angeles Rams', 780, [
'Strong run blocker','High PFF grades in recent seasons'
]),
pl('rhu','Robert Hunt','OG','Los Angeles Chargers', 720, [
'Powerful interior presence','Massive run-game contributor'
]),
pl('jda','James Daniels','OG','Pittsburgh Steelers', 880, [
'Experienced starter','Pro Bowl alternate level'
]),
pl('lto','Laken Tomlinson','OG','New York Jets', 700, [
'Veteran reliable anchor','Long-time consistent performer'
]),
pl('cwh','Cody Whitehair','OG','Chicago Bears', 720, [
'Multi-position veteran','Former high-level starter'
]),
pl('mbe','Matthew Bergeron','OG','Atlanta Falcons', 680, [
'Developing young guard','Solid ascending piece'
]),
pl('nle','Nick Leverett','OG','Tampa Bay Buccaneers', 620, [
'Super Bowl champion depth','Resilient interior player'
]),
pl('wfr','Will Fries','OG','Indianapolis Colts', 850, [
'Consistent right guard','Strong recent production'
]),
pl('gbr','Graham Barton','OG','Tampa Bay Buccaneers', 630, [
'Versatile young interior','Athletic contributor'
]),
  // === COMMON / DEPTH GUARDS (selected examples — add more as needed) ===
  pl('jga','Jon Gaines II','OG','Pittsburgh Steelers', 650, [
'Versatile interior depth','Reliable reserve guard'
]),
pl('ast','Andrew Stueber','OG','Atlanta Falcons', 620, [
'Solid backup guard','Developing depth piece'
]),
pl('jpe','Jared Penning','OG','Baltimore Ravens', 580, [
'Physical run blocker','Spot starter potential'
]),
pl('lcu','Liam Fornadel','OG','New York Jets', 550, [
'Athletic depth option','Recent contributor'
]),
pl('gca','Gus Hartwig','OG','Green Bay Packers', 520, [
'Young interior prospect','Developing reserve'
]),
pl('jdd','Justin Dedich','OG','Los Angeles Rams', 420, [
'Developing guard','Run-game contributor'
]),
pl('khi','Kyle Hinton','OG','Atlanta Falcons', 390, [
'Multi-position depth','Former college starter'
]),
pl('jgw','Jovaughn Gwyn','OG','Cleveland Browns', 340, [
'Small-school gem','Rotational depth'
]),
pl('lro','Layden Robinson','OG','Las Vegas Raiders', 320, [
'Powerful rookie depth','College production'
]),
  pl('ami2','Austin Corbett','OG','Free Agent', 640, [
    'Super Bowl champion','Former Pro Bowl level'
  ]),
  pl('new','Xavier Newman-Johnson','OG','San Francisco 49ers', 560, [
    'Reliable reserve','Super Bowl appearance'
  ]),
  pl('ont','Netane Muti','OG','San Francisco 49ers', 500, [
    'Powerful run blocker','Key depth piece'
  ]),
  pl('gba','Germain Ifedi','OG','Free Agent', 480, [
    'Former high pick','Playoff starter experience'
  ]),
  pl('abi','Alex Bars','OG','Carolina Panthers', 460, [
    'Utility lineman','Notre Dame product'
  ]),
  pl('jca4','Jack Anderson','OG','Tampa Bay Buccaneers', 440, [
    'Emerging interior piece','College starter'
  ]),
  pl('mbec','Mekhi Becton','OG','Philadelphia Eagles', 420, [
    'Imposing size','Versatile when healthy'
  ]),
  pl('dbu2','D.J. Fluker','OG','Free Agent', 420, [
    'Physical veteran','Elite college pedigree'
  ]),
  pl('ati','Ahmad Thomas','OG','Cleveland Browns', 400, [
    'Young depth','Oklahoma product'
  ]),
  pl('sca','Shaq Calhoun','OG','Miami Dolphins', 390, [
    'Recent starter','Small-school success'
  ]),
  pl('cbl','Cameron Erving','OG','Free Agent', 380, [
    'Super Bowl ring','Versatile veteran'
  ]),
  pl('nel3','Nate Davis','OG','Free Agent', 370, [
    'Former playoff starter','Outperformed draft spot'
  ]),
  pl('aba2','Aaron Banks','OG','San Francisco 49ers', 360, [
    'Run-heavy contributor','Super Bowl appearance'
  ]),
  pl('vol','Cordell Volson','OG','Cincinnati Bengals', 350, [
    'Full-time starter','Reliable LG'
  ]),
  pl('jpo','Jackson Powers-Johnson','OG','Las Vegas Raiders', 340, [
    'Rookie starter','High college pedigree'
  ]),
  pl('cbe','Cooper Beebe','OG','Dallas Cowboys', 330, [
    'Rookie full-time starter','All-Big 12 selection'
  ]),
  pl('kgr','Kenyon Green','OG','Houston Texans', 320, [
    'Bounce-back candidate','High draft pedigree'
  ]),
  pl('trt','Trai Turner','OG','Las Vegas Raiders', 310, [
    'Veteran Pro Bowl guard','Former elite anchor'
  ]),
  pl('dlw','Damien Lewis','OG','Seattle Seahawks', 300, [
    'Former Pro Bowl alternate','Versatile starter'
  ]),
  pl('cnw','Connor Williams','OG','Los Angeles Chargers', 290, [
    'Multi-position veteran','Former Pro Bowl OG'
  ]),
  pl('jrp','Jarrett Patterson','OG','Washington Commanders', 280, [
    'Recent starter','Quietly reliable'
  ]),
  pl('bba','Ben Bartch','OG','Jacksonville Jaguars', 270, [
    'Small-school success','Multi-year starter'
  ]),
  pl('spa','Spencer Anderson','OG','Kansas City Chiefs', 260, [
    'Super Bowl depth','Undrafted contributor'
  ]),
  pl('jru','Jon Runyan Jr.','OG','Green Bay Packers', 250, [
    'Second-generation OL','Recent starter'
  ]),
  pl('mcu','McClendon Curtis','OG','Tennessee Titans', 240, [
    'Undrafted starter','Consistency earner'
  ]),
  pl('ssw','Sidy Sow','OG','New England Patriots', 230, [
    'Young protector','Late-round find'
  ]),
  pl('nhe','Nate Herbig','OG','New York Jets', 220, [
    'Smart veteran depth','High football IQ'
  ]),
  pl('rha','Ryan Hayes','OG','Minnesota Vikings', 210, [
    'National champion','Recent full-time starter'
  ]),
  pl('olu','Olu Oluwatimi','OG','Detroit Lions', 205, [
    'Rimington winner','Moved to guard'
  ]),
  pl('ken2','Kendrick Green','OG','Pittsburgh Steelers', 200, [
    'Versatile interior','Rookie starter experience'
  ]),
];

  export const C_POOL_V1: NFLPlayer[] = [
  // === TOP TIER CENTERS ===
  pl('hum','Creed Humphrey','C','Kansas City Chiefs', 3650, [
    'Best center in football','Multiple All-Pro & Super Bowl champion'
  ]),
  pl('bre2','Aaron Brewer','C','Miami Dolphins', 3120, [
    'Elite run blocker','Career-high PFF grades in 2025'
  ]),

  // === DYNASTY TIER CENTERS ===
  pl('lin4','Tyler Linderbaum','C','Baltimore Ravens', 2580, [
    'One of the best young centers','Multiple Pro Bowl level'
  ]),
  pl('rag','Frank Ragnow','C','Detroit Lions', 2420, [
    'Franchise cornerstone','All-Pro caliber anchor'
  ]),
  pl('dal','Drew Dalman','C','Chicago Bears', 1980, [
    'Key to Bears resurgence','Pro Bowl selections'
  ]),

  // === RARE TIER CENTERS ===
  pl('bor','Tanor Bortolini','C','Indianapolis Colts', 1380, [
    'Breakout 2025 season','High PFF grades as full-time starter'
  ]),
  pl('neu2','Ryan Neuzil','C','Atlanta Falcons', 1220, [
    'Reliable interior anchor','Strong run-block grades'
  ]),
  pl('lin2','Corey Linsley','C','Free Agent', 1150, [
    'Elite pass protection seasons','Veteran All-Pro level'
  ]),
  pl('kel2','Ryan Kelly','C','Minnesota Vikings', 1080, [
    'Veteran anchor','Pro Bowl alternate consistency'
  ]),
  pl('cam2','Cam Jurgens','C','Philadelphia Eagles', 1050, [
    'Seamless high-level play','Pro Bowl consideration'
  ]),
  pl('tbo','Tyler Biadasz','C','Los Angeles Chargers', 1180, [
'Veteran steady anchor','Reliable interior leader'
]),
pl('lwa','Luke Wattenberg','C','Denver Broncos', 980, [
'Solid run-game contributor','Consistent starter'
]),
pl('csh','Coleman Shelton','C','Los Angeles Rams', 880, [
'Versatile veteran','Reliable depth-to-starter'
]),
  pl('tip','Joe Tippmann','C','New York Jets', 880, [
    'Highest-graded young center','Elite mobility and size'
  ]),

  // === MORE COMMON / DEPTH (examples) ===
  pl('ame','Andrew Meyer','C','Miami Dolphins', 650, [
'Young backup center','Athletic reserve'
]),
pl('jwi','Jared Wilson','C','New York Jets', 610, [
'Developing interior anchor','Recent depth contributor'
]),
pl('jba','Jacob Bayer','C','New England Patriots', 540, [
'Solid reserve center','Undrafted contributor'
]),
pl('hco','Hayden Conner','C','New Orleans Saints', 500, [
'Powerful college product','Backup interior'
]),
pl('cbu2','Corey Bullock','C','Baltimore Ravens', 460, [
'Emerging depth center','Reliable hands'
]),
pl('jka2','Josh Kaltenberger','C','Los Angeles Chargers', 430, [
'Versatile swing center','Spot starter potential'
]),
pl('sed','Sedrick Van Pran-Granger','C','Buffalo Bills', 400, [
'High-upside backup','Former high draft pedigree'
]),
pl('hun','Hunter Nourzad','C','Kansas City Chiefs', 370, [
'Young depth piece','Developing reserve'
]),
pl('dmc2','Dylan McMahon','C','Los Angeles Rams', 340, [
'Quiet utility center','Rotational option'
]),
  pl('lft','Luke Fortner','C','Jacksonville Jaguars', 690, [
    'Full-time starter','College captain pedigree'
  ]),
  pl('pme','Patrick Mekari','C','Jacksonville Jaguars', 660, [
    'Ultra-versatile OL','Started at multiple positions'
  ]),
  pl('bfa','Brian Allen','C','Los Angeles Rams', 580, [
    'Super Bowl champion','Reliable Rams starter'
  ]),
  pl('wes','Wesley Johnson','C','Pittsburgh Steelers', 520, [
    'Veteran depth piece','Long-time contributor'
  ]),
  pl('jak','Jake Andrews','C','New England Patriots', 480, [
    'Protector for Maye','Late-round gem'
  ]),
  pl('nha','Nick Harris','C','Miami Dolphins', 460, [
    'Recent starter','Surprising ascension'
  ]),
  pl('epo','Ethan Pocic','C','Cleveland Browns', 440, [
    'Run-game contributor','Top-10 C season previously'
  ]),
  pl('nag','Nick Allegretti','C','Los Angeles Rams', 420, [
    'Key depth piece','Super Bowl experience'
  ]),
  pl('nal','Nick Gates','C','Indianapolis Colts', 400, [
    'Comeback story','Injury-resilient starter'
  ]),
  pl('mmn','Michal Menet','C','Arizona Cardinals', 380, [
    'Rebuild starter','Penn State product'
  ]),
  pl('dki','Darian Kinnard','C','New York Jets', 360, [
    'Rimington finalist','Raw athleticism'
  ]),
  pl('gmc','Greg Mancz','C','Tampa Bay Buccaneers', 340, [
    '10-year veteran','Playoff experience'
  ]),
  pl('hfr','Hjalte Froholdt','C','New England Patriots', 320, [
    'Reliable backup','SEC starter background'
  ]),
  pl('msk','Matt Skura','C','New York Giants', 300, [
    'Veteran depth','Former Ravens starter'
  ]),
  pl('mco2','Mason Cole','C','Pittsburgh Steelers', 290, [
    'Playoff starter','Long-tenured veteran'
  ]),
  pl('bil','Billy Turner','C','Free Agent', 280, [
    'Super Bowl ring','Versatile G/C'
  ]),
  pl('sam2','Sam Mustipher','C','Minnesota Vikings', 270, [
    'Undrafted success','Former Bears starter'
  ]),
  pl('bcx','Brett Toth','C','Free Agent', 250, [
    'Service academy story','Hard-working veteran'
  ]),
  pl('tro','Tanner Hudson','C','Tampa Bay Buccaneers', 240, [
    'D2 success','Developmental depth'
  ]),
  pl('mco3','Matt Gono','C','Free Agent', 230, [
    'Versatile across positions','FCS All-American'
  ]),
  pl('gco','Greg Van Roten','C','Free Agent', 220, [
    'Ivy League to NFL','Long career veteran'
  ]),
  pl('rba','Ryan Bates','C','Buffalo Bills', 210, [
    'Undrafted success','Pro Bowl alternate'
  ]),
  pl('mmu','Michael Deiter','C','Tennessee Titans', 205, [
    'Converted center','Wisconsin product'
  ]),
  pl('sba','Sam Mustipher','C','Free Agent', 200, [
    'Reliable backup','Cerebral anchor'
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