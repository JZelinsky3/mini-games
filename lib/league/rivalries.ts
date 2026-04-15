// Each entry: [teamA, teamB] — rivalry is bidirectional
export const NFL_RIVALRIES: [string, string][] = [
  // AFC East
  ['New England Patriots', 'New York Jets'],
  ['New England Patriots', 'Buffalo Bills'],
  ['New England Patriots', 'Miami Dolphins'],
  ['Buffalo Bills', 'Miami Dolphins'],
  ['Buffalo Bills', 'New York Jets'],
  ['Miami Dolphins', 'New York Jets'],

  // AFC North
  ['Baltimore Ravens', 'Pittsburgh Steelers'],
  ['Baltimore Ravens', 'Cleveland Browns'],
  ['Pittsburgh Steelers', 'Cleveland Browns'],
  ['Cincinnati Bengals', 'Pittsburgh Steelers'],
  ['Cincinnati Bengals', 'Baltimore Ravens'],

  // AFC South
  ['Houston Texans', 'Tennessee Titans'],
  ['Indianapolis Colts', 'Tennessee Titans'],
  ['Jacksonville Jaguars', 'Tennessee Titans'],
  ['Houston Texans', 'Indianapolis Colts'],

  // AFC West
  ['Kansas City Chiefs', 'Las Vegas Raiders'],
  ['Kansas City Chiefs', 'Los Angeles Chargers'],
  ['Las Vegas Raiders', 'Los Angeles Chargers'],
  ['Denver Broncos', 'Kansas City Chiefs'],
  ['Denver Broncos', 'Las Vegas Raiders'],

  // NFC East
  ['Dallas Cowboys', 'Philadelphia Eagles'],
  ['Dallas Cowboys', 'New York Giants'],
  ['Dallas Cowboys', 'Washington Commanders'],
  ['Philadelphia Eagles', 'New York Giants'],
  ['Philadelphia Eagles', 'Washington Commanders'],
  ['New York Giants', 'Washington Commanders'],

  // NFC North
  ['Green Bay Packers', 'Chicago Bears'],
  ['Green Bay Packers', 'Minnesota Vikings'],
  ['Chicago Bears', 'Minnesota Vikings'],
  ['Detroit Lions', 'Green Bay Packers'],
  ['Detroit Lions', 'Chicago Bears'],

  // NFC South
  ['New Orleans Saints', 'Atlanta Falcons'],
  ['New Orleans Saints', 'Tampa Bay Buccaneers'],
  ['Atlanta Falcons', 'Tampa Bay Buccaneers'],
  ['Carolina Panthers', 'New Orleans Saints'],

  // NFC West
  ['San Francisco 49ers', 'Seattle Seahawks'],
  ['San Francisco 49ers', 'Los Angeles Rams'],
  ['Seattle Seahawks', 'Los Angeles Rams'],
  ['Arizona Cardinals', 'San Francisco 49ers'],
  ['Arizona Cardinals', 'Seattle Seahawks'],
];

// Build a fast lookup set: "TeamA||TeamB" always alphabetically sorted
const rivalrySet = new Set<string>();
for (const [a, b] of NFL_RIVALRIES) {
  const key = [a, b].sort().join('||');
  rivalrySet.add(key);
}

export function areRivals(teamA: string, teamB: string): boolean {
  if (teamA === teamB) return false;
  const key = [teamA, teamB].sort().join('||');
  return rivalrySet.has(key);
}