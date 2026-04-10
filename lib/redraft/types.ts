export type CareerGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface DraftPlayer {
  id: string;
  name: string;
  position: string;
  actualPick: number;
  actualRound: number;
  draftedBy: string;
  careerGrade: CareerGrade;
  careerNote: string;
  headshot?: string;
}

export interface TeamInfo {
  n: string[];  // top needs (positions)
  s: string[];  // key stars
  w: string;    // record (e.g. '13-3')
}

export interface DraftPick {
  pickNumber: number;   // 1–32
  teamAbbr: string;
  player: DraftPlayer | null;
}

export const GRADE_VALUE: Record<CareerGrade, number> = {
  S: 100, A: 80, B: 55, C: 30, D: 10,
};

export const GRADE_STYLES: Record<CareerGrade, {
  bg: string; border: string; text: string; label: string; glow: string;
}> = {
  S: { bg: 'bg-yellow-500/20',  border: 'border-yellow-500/50',  text: 'text-yellow-300',  label: 'Elite',  glow: 'shadow-yellow-500/30' },
  A: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-300', label: 'Star',   glow: 'shadow-emerald-500/20' },
  B: { bg: 'bg-blue-500/20',    border: 'border-blue-500/50',    text: 'text-blue-300',    label: 'Solid',  glow: 'shadow-blue-500/20' },
  C: { bg: 'bg-zinc-500/20',    border: 'border-zinc-500/50',    text: 'text-zinc-400',    label: 'Backup', glow: '' },
  D: { bg: 'bg-red-500/20',     border: 'border-red-500/50',     text: 'text-red-400',     label: 'Bust',   glow: '' },
};

export const POS_COLOR: Record<string, string> = {
  QB:   'bg-red-500/25 text-red-300 border-red-500/40',
  WR:   'bg-sky-500/25 text-sky-300 border-sky-500/40',
  RB:   'bg-emerald-500/25 text-emerald-300 border-emerald-500/40',
  TE:   'bg-orange-500/25 text-orange-300 border-orange-500/40',
  OT:   'bg-purple-500/25 text-purple-300 border-purple-500/40',
  OG:   'bg-purple-500/25 text-purple-300 border-purple-500/40',
  C:    'bg-purple-500/25 text-purple-300 border-purple-500/40',
  CB:   'bg-cyan-500/25 text-cyan-300 border-cyan-500/40',
  S:    'bg-teal-500/25 text-teal-300 border-teal-500/40',
  LB:   'bg-yellow-500/25 text-yellow-300 border-yellow-500/40',
  DE:   'bg-pink-500/25 text-pink-300 border-pink-500/40',
  DT:   'bg-pink-500/25 text-pink-300 border-pink-500/40',
  EDGE: 'bg-pink-500/25 text-pink-300 border-pink-500/40',
  K:    'bg-zinc-500/25 text-zinc-300 border-zinc-500/40',
};

export const TEAM_NAMES: Record<string, string> = {
  ARI: 'Arizona Cardinals',    ATL: 'Atlanta Falcons',
  BAL: 'Baltimore Ravens',     BUF: 'Buffalo Bills',
  CAR: 'Carolina Panthers',    CHI: 'Chicago Bears',
  CIN: 'Cincinnati Bengals',   CLE: 'Cleveland Browns',
  DAL: 'Dallas Cowboys',       DEN: 'Denver Broncos',
  DET: 'Detroit Lions',        GB:  'Green Bay Packers',
  HOU: 'Houston Texans',       IND: 'Indianapolis Colts',
  JAX: 'Jacksonville Jaguars', KC:  'Kansas City Chiefs',
  LAC: 'LA Chargers',          LAR: 'LA Rams',
  LV:  'Las Vegas Raiders',    MIA: 'Miami Dolphins',
  MIN: 'Minnesota Vikings',    NE:  'New England Patriots',
  NO:  'New Orleans Saints',   NYG: 'New York Giants',
  NYJ: 'New York Jets',        OAK: 'Oakland Raiders',
  PHI: 'Philadelphia Eagles',  PIT: 'Pittsburgh Steelers',
  SD:  'San Diego Chargers',   SEA: 'Seattle Seahawks',
  SF:  'San Francisco 49ers',  TB:  'Tampa Bay Buccaneers',
  TEN: 'Tennessee Titans',     WAS: 'Washington Commanders',
};

export const TEAM_COLORS: Record<string, { primary: string; secondary: string }> = {
  ARI: { primary: '#97233F', secondary: '#FFB612' },
  ATL: { primary: '#A71930', secondary: '#000000' },
  BAL: { primary: '#241773', secondary: '#9E7C0C' },
  BUF: { primary: '#00338D', secondary: '#C60C30' },
  CAR: { primary: '#0085CA', secondary: '#101820' },
  CHI: { primary: '#0B162A', secondary: '#C83803' },
  CIN: { primary: '#FB4F14', secondary: '#000000' },
  CLE: { primary: '#311D00', secondary: '#FF3C00' },
  DAL: { primary: '#003594', secondary: '#869397' },
  DEN: { primary: '#FB4F14', secondary: '#002244' },
  DET: { primary: '#0076B6', secondary: '#B0B7BC' },
  GB:  { primary: '#203731', secondary: '#FFB612' },
  HOU: { primary: '#03202F', secondary: '#A71930' },
  IND: { primary: '#002C5F', secondary: '#A2AAAD' },
  JAX: { primary: '#006778', secondary: '#D7A22A' },
  KC:  { primary: '#E31837', secondary: '#FFB81C' },
  LAC: { primary: '#002A5E', secondary: '#FFC20E' },
  LAR: { primary: '#003594', secondary: '#FFA300' },
  LV:  { primary: '#000000', secondary: '#A5ACAF' },
  MIA: { primary: '#008E97', secondary: '#FC4C02' },
  MIN: { primary: '#4F2683', secondary: '#FFC62F' },
  NE:  { primary: '#002244', secondary: '#C60C30' },
  NO:  { primary: '#101820', secondary: '#D3BC8D' },
  NYG: { primary: '#0B2265', secondary: '#A71930' },
  NYJ: { primary: '#125740', secondary: '#000000' },
  OAK: { primary: '#000000', secondary: '#A5ACAF' },
  PHI: { primary: '#004C54', secondary: '#A5ACAD' },
  PIT: { primary: '#FFB612', secondary: '#101820' },
  SD:  { primary: '#002A5E', secondary: '#FFC20E' },
  SEA: { primary: '#002244', secondary: '#69BE28' },
  SF:  { primary: '#AA0000', secondary: '#B3995D' },
  TB:  { primary: '#D50A0A', secondary: '#34302B' },
  TEN: { primary: '#0C2340', secondary: '#4B92DB' },
  WAS: { primary: '#5A1414', secondary: '#FFB612' },
};

export const YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

// The draft order for each year (first round, 32 picks in order)
// These are the actual team orders that year
export const DRAFT_ORDER: Record<number, string[]> = {
  2016: ['TEN','CLE','SD','DAL','JAX','BAL','SF','PHI','TB','NYG','CHI','NO','MIA','OAK','JAX','LAR','ATL','IND','BUF','NYJ','WAS','HOU','MIN','CIN','NE','SEA','GB','KC','ARI','SEA','PIT','SD'],
  2017: ['CLE','SF','CHI','JAX','TEN','NYJ','LAC','CAR','CIN','BUF','NO','CLE','ARI','PHI','IND','BAL','WAS','TEN','TB','DEN','GB','CLE','NYG','OAK','ATL','BUF','SEA','DET','KC','WAS','HOU','NE'],
  2018: ['CLE','NYG','IND','CLE','DEN','IND','TB','CHI','SF','OAK','MIA','DET','WAS','GB','ARI','BAL','LAC','SEA','DAL','DET','BUF','BUF','NYJ','CAR','CIN','ATL','NE','PIT','JAX','MIN','NE','BAL'],
  2019: ['ARI','SF','NYJ','OAK','TB','NYG','JAX','DET','BUF','DEN','CIN','GB','MIA','ATL','WAS','CAR','CLE','MIN','TEN','DEN','PHI','BUF','LAC','OAK','PHI','MIA','OAK','NO','SEA','LAR','KC','NE'],
  2020: ['CIN','WAS','DET','NYG','MIA','LAC','CAR','ARI','JAX','CLE','NYJ','LV','SF','TB','DEN','ATL','DAL','MIA','PHI','JAX','PHI','MIN','NE','NO','SF','MIA','SEA','BAL','TEN','GB','MIN','KC'],
  2021: ['JAX','NYJ','SF','ATL','CIN','MIA','DET','CAR','DEN','DAL','NYG','PHI','LAC','MIN','NE','ARI','LV','MIA','WAS','CHI','IND','TEN','NYJ','PIT','JAX','CLE','BAL','NO','GB','BUF','BAL','TB'],
  2022: ['JAX','DET','HOU','NYJ','NYG','CAR','GB','ATL','SEA','NYJ','WAS','MIN','CLE','BAL','PHI','NO','LAC','PHI','NE','PIT','NE','GB','ARI','DAL','BUF','TEN','MIA','CIN','DAL','KC','CIN','SF'],
  2023: ['CAR','HOU','ARI','IND','SEA','DET','LV','ATL','CHI','PHI','TEN','HOU','GB','NE','NYJ','WAS','PIT','DET','TB','SEA','LAC','BAL','MIN','JAX','NYG','DAL','BUF','CIN','SF','LAR','BAL','KC'],
  2024: ['CHI','WAS','NE','ARI','LAC','NYG','TEN','ATL','CHI','NYJ','MIN','DEN','LV','IND','JAX','PIT','JAX','MIA','BUF','LAR','MIA','PHI','JAX','DET','LAC','SEA','TB','NO','GB','BAL','SF','KC'],
  2025: ['TEN','JAX','NYG','NE','CLE','LV','SF','CAR','LV','CHI','NO','IND','MIA','KC','SEA','IND','HOU','CLE','DEN','ATL','PIT','LAC','GB','TEN','MIN','NYJ','BAL','NYG','GB','LAR','PHI','BUF'],
};