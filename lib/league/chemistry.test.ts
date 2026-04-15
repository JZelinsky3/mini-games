/**
 * chemistry.test.ts — run with: npx ts-node chemistry.test.ts
 * (or compile and run with node)
 */
import { pl } from './player';
import { calculateChemistry, chemistryLabel } from './chemistry';
import { areRivals } from './rivalries';

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

// ─── Rivalry lookup ───────────────────────────────────────────────────────────
console.log('\n[Rivalries]');
assert('Chiefs vs Raiders',        areRivals('Kansas City Chiefs', 'Las Vegas Raiders'));
assert('Raiders vs Chiefs (swap)',  areRivals('Las Vegas Raiders', 'Kansas City Chiefs'));
assert('Cowboys vs Eagles',        areRivals('Dallas Cowboys', 'Philadelphia Eagles'));
assert('Ravens vs Steelers',       areRivals('Baltimore Ravens', 'Pittsburgh Steelers'));
assert('Chiefs vs Cowboys = false', !areRivals('Kansas City Chiefs', 'Dallas Cowboys'));
assert('Same team = false',         !areRivals('Kansas City Chiefs', 'Kansas City Chiefs'));

// ─── Pure synergy (all same team, no rivals) ──────────────────────────────────
console.log('\n[Synergy — same team]');

const chiefsQB  = pl('mah1', 'Patrick Mahomes', 'QB', 'Kansas City Chiefs', 2200, []);
const chiefsWR  = pl('hil1', 'Tyreek Hill',     'WR', 'Kansas City Chiefs', 2100, []);
const chiefsTE  = pl('kel1', 'Travis Kelce',    'TE', 'Kansas City Chiefs', 2150, []);
const chiefsOT  = pl('rea1', 'Orlando Brown',   'OT', 'Kansas City Chiefs', 1900, []);

const twoManRoster = [chiefsQB, chiefsWR];
const chem2 = calculateChemistry(twoManRoster);
assert('QB+WR same team = +250',  chem2.synergyPoints === 250);
assert('No rivalry on same team', chem2.rivalryPoints === 0);
assert('Total = 250',             chem2.totalChemistryPoints === 250);

const fourManRoster = [chiefsQB, chiefsWR, chiefsTE, chiefsOT];
const chem4 = calculateChemistry(fourManRoster);
// Pairs: QB+WR(250), QB+TE(250), QB+OT(250), WR+TE(0), WR+OT(0), TE+OT(conservative=150)
assert('4 Chiefs: QB+WR+TE+OT synergy = 900', chem4.synergyPoints === 900);

// ─── Rivalry penalty ─────────────────────────────────────────────────────────
console.log('\n[Rivalry penalty]');

const raidersWR = pl('ada1', 'Davante Adams', 'WR', 'Las Vegas Raiders', 2050, []);
const rivalRoster = [chiefsQB, raidersWR];
const chemRival = calculateChemistry(rivalRoster);
assert('Chiefs QB + Raiders WR = −100 rivalry', chemRival.rivalryPoints === -100);
assert('No synergy (different teams)',           chemRival.synergyPoints === 0);
assert('Total = −100',                           chemRival.totalChemistryPoints === -100);

// ─── Mixed: synergy + rivalry ─────────────────────────────────────────────────
console.log('\n[Mixed synergy + rivalry]');

const mixedRoster = [chiefsQB, chiefsWR, raidersWR]; // QB+WR synergy, but also Chiefs+Raiders rivalry
const chemMixed = calculateChemistry(mixedRoster);
// QB+chiefsWR = +250 (synergy), QB+raidersWR = −100 (rival, no synergy as diff team), chiefsWR+raidersWR = −100 (rival)
assert('Mixed: synergy = 250',                    chemMixed.synergyPoints === 250);
assert('Mixed: rivalry = −200',                   chemMixed.rivalryPoints === -200);
assert('Mixed: total = 50',                       chemMixed.totalChemistryPoints === 50);

// ─── OG/C + RB medium synergy ─────────────────────────────────────────────────
console.log('\n[OG/C + RB synergy]');

const brownsOG = pl('joh2', 'Zion Johnson', 'OG', 'Cleveland Browns', 1980, []);
const brownsRB = pl('car1', 'Nick Chubb',   'RB', 'Cleveland Browns', 2080, []);
const brownsCen = pl('eth1', 'Ethan Pocic',  'C',  'Cleveland Browns', 1850, []);

const ogRbChem = calculateChemistry([brownsOG, brownsRB]);
assert('OG+RB same team = +250 (medium)', ogRbChem.synergyPoints === 250);

const cRbChem = calculateChemistry([brownsCen, brownsRB]);
assert('C+RB same team = +250 (medium)',  cRbChem.synergyPoints === 250);

// ─── Label helper ─────────────────────────────────────────────────────────────
console.log('\n[Label]');
const label = chemistryLabel(chemMixed);
assert('Label contains total points', label.includes('50'));
assert('Label mentions synergy',      label.includes('synergie') || label.includes('synergy'));

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} tests — ${passed} passed, ${failed} failed\n`);
if (failed > 0) { throw new Error(`${failed} test(s) failed`); }