'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Mode = 'arcade' | 'sim' | 'broadcast' | 'coaching';
type PlayType = 'run' | 'short_pass' | 'deep_pass' | 'option' | 'screen' | 'play_action';
type DefenseType = 'blitz' | 'zone' | 'man' | 'prevent' | 'base';
type DriveResult = 'td' | 'fg' | 'punt' | 'turnover' | 'turnover_on_downs' | 'safety';

interface Player {
  name: string;
  era: string;
  team: string;
  role: 'qb' | 'wr' | 'rb' | 'te';
}

interface PlayOutcome {
  yards: number;
  result: 'gain' | 'loss' | 'td' | 'fumble' | 'interception' | 'incomplete';
  narrative: string;
  stylePoints?: number;
}

interface DrivePlay {
  down: number;
  toGo: number;
  yardsToEnd: number;
  playType: PlayType;
  defense: DefenseType;
  outcome: PlayOutcome;
}

interface GameState {
  mode: Mode | null;
  down: number;
  toGo: number;
  yardsToEnd: number; // yards to endzone
  firstDownMarker: number; // yards to end for first down
  driveYards: number;
  score: { offense: number; defense: number };
  quarter: number;
  timeLeft: number; // seconds
  plays: DrivePlay[];
  driveOver: boolean;
  driveResult: DriveResult | null;
  totalDrives: number;
  turnovers: number;
  tds: number;
  currentDefense: DefenseType;
  offenseTeam: OffenseTeam;
  defenseTeam: DefenseTeam;
  stylePoints: number;
  arcadeCombo: number;
}

interface OffenseTeam {
  name: string;
  era: string;
  qb: Player;
  wr: Player;
  rb: Player;
  te: Player;
  runBonus: number;   // -10 to +10
  passBonus: number;
  deepBonus: number;
}

interface DefenseTeam {
  name: string;
  era: string;
  overall: number;
  tendencies: Record<DefenseType, number>; // likelihood 0-100
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const OFFENSE_TEAMS: OffenseTeam[] = [
  {
    name: "2007 New England Patriots", era: "Modern Legend",
    qb: { name: "Tom Brady", era: "Legend", team: "NE", role: "qb" },
    wr: { name: "Randy Moss", era: "Legend", team: "NE", role: "wr" },
    rb: { name: "Laurence Maroney", era: "2000s", team: "NE", role: "rb" },
    te: { name: "Ben Watson", era: "2000s", team: "NE", role: "te" },
    runBonus: -2, passBonus: 12, deepBonus: 15,
  },
  {
    name: "2018 Kansas City Chiefs", era: "Modern",
    qb: { name: "Patrick Mahomes", era: "Modern", team: "KC", role: "qb" },
    wr: { name: "Tyreek Hill", era: "Modern", team: "KC", role: "wr" },
    rb: { name: "Kareem Hunt", era: "Modern", team: "KC", role: "rb" },
    te: { name: "Travis Kelce", era: "Modern", team: "KC", role: "te" },
    runBonus: 4, passBonus: 10, deepBonus: 12,
  },
  {
    name: "1984 San Francisco 49ers", era: "Legend",
    qb: { name: "Joe Montana", era: "Legend", team: "SF", role: "qb" },
    wr: { name: "Jerry Rice", era: "Legend", team: "SF", role: "wr" },
    rb: { name: "Roger Craig", era: "Legend", team: "SF", role: "rb" },
    te: { name: "Russ Francis", era: "Legend", team: "SF", role: "te" },
    runBonus: 8, passBonus: 10, deepBonus: 6,
  },
  {
    name: "2011 Green Bay Packers", era: "Modern Legend",
    qb: { name: "Aaron Rodgers", era: "Modern Legend", team: "GB", role: "qb" },
    wr: { name: "Greg Jennings", era: "2010s", team: "GB", role: "wr" },
    rb: { name: "Ryan Grant", era: "2010s", team: "GB", role: "rb" },
    te: { name: "Jermichael Finley", era: "2010s", team: "GB", role: "te" },
    runBonus: 2, passBonus: 11, deepBonus: 10,
  },
  {
    name: "2012 Atlanta Falcons", era: "Modern Legend",
    qb: { name: "Matt Ryan", era: "Modern", team: "ATL", role: "qb" },
    wr: { name: "Julio Jones", era: "Modern", team: "ATL", role: "wr" },
    rb: { name: "Michael Turner", era: "2010s", team: "ATL", role: "rb" },
    te: { name: "Tony Gonzalez", era: "Legend", team: "ATL", role: "te" },
    runBonus: 6, passBonus: 8, deepBonus: 9,
  },
  {
    name: "2015 Carolina Panthers", era: "Modern",
    qb: { name: "Cam Newton", era: "Modern", team: "CAR", role: "qb" },
    wr: { name: "Kelvin Benjamin", era: "Modern", team: "CAR", role: "wr" },
    rb: { name: "Jonathan Stewart", era: "Modern", team: "CAR", role: "rb" },
    te: { name: "Greg Olsen", era: "Modern", team: "CAR", role: "te" },
    runBonus: 14, passBonus: 4, deepBonus: 5,
  },
  {
    name: "2022 Philadelphia Eagles", era: "Modern",
    qb: { name: "Jalen Hurts", era: "Modern", team: "PHI", role: "qb" },
    wr: { name: "A.J. Brown", era: "Modern", team: "PHI", role: "wr" },
    rb: { name: "Miles Sanders", era: "Modern", team: "PHI", role: "rb" },
    te: { name: "Dallas Goedert", era: "Modern", team: "PHI", role: "te" },
    runBonus: 12, passBonus: 6, deepBonus: 7,
  },
  {
    name: "1999 St. Louis Rams", era: "Legend",
    qb: { name: "Kurt Warner", era: "Legend", team: "STL", role: "qb" },
    wr: { name: "Isaac Bruce", era: "Legend", team: "STL", role: "wr" },
    rb: { name: "Marshall Faulk", era: "Legend", team: "STL", role: "rb" },
    te: { name: "Roland Williams", era: "Legend", team: "STL", role: "te" },
    runBonus: 10, passBonus: 12, deepBonus: 8,
  },
  {
    name: "2024 Detroit Lions", era: "Modern",
    qb: { name: "Jared Goff", era: "Modern", team: "DET", role: "qb" },
    wr: { name: "Amon-Ra St. Brown", era: "Modern", team: "DET", role: "wr" },
    rb: { name: "David Montgomery", era: "Modern", team: "DET", role: "rb" },
    te: { name: "Sam LaPorta", era: "Modern", team: "DET", role: "te" },
    runBonus: 8, passBonus: 7, deepBonus: 4,
  },
  {
    name: "1985 Chicago Bears", era: "Legend",
    qb: { name: "Jim McMahon", era: "Legend", team: "CHI", role: "qb" },
    wr: { name: "Willie Gault", era: "Legend", team: "CHI", role: "wr" },
    rb: { name: "Walter Payton", era: "Legend", team: "CHI", role: "rb" },
    te: { name: "Emery Moorehead", era: "Legend", team: "CHI", role: "te" },
    runBonus: 16, passBonus: 2, deepBonus: 3,
  },
];

const DEFENSE_TEAMS: DefenseTeam[] = [
  {
    name: "2000 Baltimore Ravens", era: "Legend", overall: 95,
    tendencies: { blitz: 30, zone: 20, man: 35, prevent: 5, base: 10 },
  },
  {
    name: "2015 Denver Broncos", era: "Modern Legend", overall: 92,
    tendencies: { blitz: 25, zone: 30, man: 25, prevent: 5, base: 15 },
  },
  {
    name: "1985 Chicago Bears", era: "Legend", overall: 97,
    tendencies: { blitz: 35, zone: 15, man: 30, prevent: 5, base: 15 },
  },
  {
    name: "2013 Seattle Seahawks", era: "Modern Legend", overall: 94,
    tendencies: { blitz: 20, zone: 25, man: 40, prevent: 5, base: 10 },
  },
  {
    name: "2023 San Francisco 49ers", era: "Modern", overall: 88,
    tendencies: { blitz: 28, zone: 32, man: 20, prevent: 8, base: 12 },
  },
  {
    name: "2002 Tampa Bay Buccaneers", era: "Legend", overall: 93,
    tendencies: { blitz: 22, zone: 28, man: 35, prevent: 5, base: 10 },
  },
  {
    name: "2024 Kansas City Chiefs", era: "Modern", overall: 86,
    tendencies: { blitz: 20, zone: 35, man: 25, prevent: 10, base: 10 },
  },
  {
    name: "1976 Pittsburgh Steelers", era: "Legend", overall: 96,
    tendencies: { blitz: 30, zone: 20, man: 30, prevent: 5, base: 15 },
  },
];

// ─── PROBABILITY ENGINE ───────────────────────────────────────────────────────

const PLAY_BASE_STATS: Record<PlayType, { avgYards: number; stdDev: number; incompleteChance: number; fumbleChance: number; intChance: number; tdChance: number }> = {
  run:         { avgYards: 4.3,  stdDev: 4.5,  incompleteChance: 0,    fumbleChance: 0.012, intChance: 0,     tdChance: 0.025 },
  short_pass:  { avgYards: 6.1,  stdDev: 4.0,  incompleteChance: 0.18, fumbleChance: 0.003, intChance: 0.022, tdChance: 0.045 },
  deep_pass:   { avgYards: 14.2, stdDev: 9.0,  incompleteChance: 0.42, fumbleChance: 0.002, intChance: 0.055, tdChance: 0.085 },
  option:      { avgYards: 5.8,  stdDev: 5.5,  incompleteChance: 0,    fumbleChance: 0.018, intChance: 0,     tdChance: 0.04  },
  screen:      { avgYards: 5.2,  stdDev: 6.0,  incompleteChance: 0.08, fumbleChance: 0.008, intChance: 0.015, tdChance: 0.035 },
  play_action: { avgYards: 9.4,  stdDev: 7.0,  incompleteChance: 0.28, fumbleChance: 0.004, intChance: 0.03,  tdChance: 0.065 },
};

// Defense vs play type modifiers (yards gained multiplier)
const DEFENSE_MODIFIERS: Record<DefenseType, Record<PlayType, number>> = {
  blitz:   { run: 0.75, short_pass: 0.65, deep_pass: 1.35, option: 0.70, screen: 1.40, play_action: 1.20 },
  zone:    { run: 1.05, short_pass: 0.85, deep_pass: 0.80, option: 1.00, screen: 0.75, play_action: 0.90 },
  man:     { run: 1.10, short_pass: 0.90, deep_pass: 0.85, option: 1.05, screen: 1.15, play_action: 1.05 },
  prevent: { run: 0.85, short_pass: 0.70, deep_pass: 0.55, option: 0.80, screen: 0.80, play_action: 0.75 },
  base:    { run: 1.00, short_pass: 1.00, deep_pass: 1.00, option: 1.00, screen: 1.00, play_action: 1.00 },
};

function randn(): number {
  // Box-Muller transform for normal distribution
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function simulatePlay(
  playType: PlayType,
  defense: DefenseType,
  offense: OffenseTeam,
  defenseTeam: DefenseTeam,
  yardsToEnd: number,
  down: number,
  toGo: number,
): PlayOutcome {
  const base = PLAY_BASE_STATS[playType];
  const defMod = DEFENSE_MODIFIERS[defense][playType];
  const defOverallMod = (100 - defenseTeam.overall) / 100 + 0.05; // weaker defense = bigger gains

  // Offense bonuses
  let offBonus = 0;
  if (playType === 'run' || playType === 'option') offBonus = offense.runBonus / 100;
  else if (playType === 'deep_pass') offBonus = (offense.passBonus + offense.deepBonus) / 200;
  else offBonus = offense.passBonus / 100;

  const effectiveAvg = base.avgYards * defMod * (1 + defOverallMod + offBonus);

  // Roll for special outcomes first
  const roll = Math.random();
  let cumulative = 0;

  // Fumble
  cumulative += base.fumbleChance * (defense === 'blitz' ? 1.3 : 1.0);
  if (roll < cumulative) {
    return {
      yards: -2,
      result: 'fumble',
      narrative: generateNarrative(playType, 'fumble', offense, yardsToEnd, defense),
    };
  }

  // Interception (pass plays only)
  if (playType !== 'run' && playType !== 'option') {
    cumulative += base.intChance * (defMod < 1 ? 1.4 : 0.8);
    if (roll < cumulative) {
      return {
        yards: 0,
        result: 'interception',
        narrative: generateNarrative(playType, 'interception', offense, yardsToEnd, defense),
      };
    }
  }

  // Incomplete
  if (playType !== 'run' && playType !== 'option') {
    cumulative += base.incompleteChance * (defMod < 0.9 ? 1.3 : 0.9);
    if (roll < cumulative) {
      return {
        yards: 0,
        result: 'incomplete',
        narrative: generateNarrative(playType, 'incomplete', offense, yardsToEnd, defense),
      };
    }
  }

  // Yardage
  const rawYards = Math.round(effectiveAvg + randn() * base.stdDev);
  const yards = Math.max(-5, Math.min(yardsToEnd, rawYards));

  // TD?
  if (yards >= yardsToEnd || (yardsToEnd <= 5 && Math.random() < base.tdChance * (1 + offBonus))) {
    return {
      yards: yardsToEnd,
      result: 'td',
      narrative: generateNarrative(playType, 'td', offense, yardsToEnd, defense),
      stylePoints: yardsToEnd > 20 ? 3 : 1,
    };
  }

  const stylePoints = yards >= 15 ? 2 : yards >= 10 ? 1 : 0;

  return {
    yards,
    result: 'gain',
    narrative: generateNarrative(playType, yards > 0 ? 'gain' : 'loss', offense, yardsToEnd, defense, yards),
    stylePoints,
  };
}

// ─── NARRATIVE ENGINE ─────────────────────────────────────────────────────────

function generateNarrative(
  playType: PlayType,
  result: string,
  offense: OffenseTeam,
  yardsToEnd: number,
  defense: DefenseType,
  yards?: number,
): string {
  const qb = offense.qb.name;
  const wr = offense.wr.name;
  const rb = offense.rb.name;
  const te = offense.te.name;

  const defPressure = defense === 'blitz' ? 'under heavy pressure' : defense === 'man' ? 'with tight coverage' : 'against a soft shell';

  const runNarratives: Record<string, string[]> = {
    gain: [
      `${rb} takes the handoff and grinds out ${yards} yards before the pile stops moving.`,
      `${rb} finds a crease and churns forward for ${yards} yards.`,
      `Power up the middle — ${rb} falls forward for ${yards}.`,
      `${rb} bounces it outside and picks up ${yards} yards on the perimeter.`,
      `${qb} hands off to ${rb} who barrels through contact for ${yards} yards.`,
    ],
    loss: [
      `${rb} is stuffed at the line — loses ${Math.abs(yards || 0)} yards on contact.`,
      `The defense reads the run perfectly. ${rb} goes nowhere.`,
      `${rb} meets a wall of defenders and goes down for a loss.`,
    ],
    td: [
      `${rb} punches it in! Touchdown! ${rb} finds the corner of the end zone!`,
      `${rb} gets the carry and SCORES! The crowd erupts!`,
      `Power run — ${rb} breaks through and falls into the end zone! TOUCHDOWN!`,
    ],
    fumble: [
      `${rb} takes the handoff but the ball is out! FUMBLE! The defense recovers!`,
      `${rb} loses the handle during contact — the ball is on the ground and it's chaos!`,
    ],
  };

  const shortPassNarratives: Record<string, string[]> = {
    gain: [
      `${qb} fires quickly to ${wr} on the slant — ${yards} yards, solid pickup.`,
      `${te} is open over the middle. ${qb} hits him for ${yards} yards.`,
      `Quick out to ${wr}, who turns upfield for ${yards} yards ${defPressure}.`,
      `${qb} checks down to ${rb} in the flat — ${yards} yards after contact.`,
      `${te} wins his route. ${qb} delivers — ${yards} yard gain.`,
    ],
    td: [
      `${qb} finds ${te} in the back of the end zone — TOUCHDOWN! Perfect ball!`,
      `${wr} on the quick slant and he's in! Touchdown! ${qb} was surgical!`,
      `${rb} out of the backfield and ${qb} hits him in stride — SCORE!`,
    ],
    incomplete: [
      `${qb} fires for ${wr} but it's off his fingertips — incomplete.`,
      `${qb} is ${defPressure}. Forced throw for ${te}, knocked away — incomplete.`,
      `Pressure up the middle. ${qb} throws it away — incomplete.`,
    ],
    interception: [
      `${qb} throws ${defPressure} — INTERCEPTED! The corner jumps the route!`,
      `${qb} forces it to ${wr} and it's picked off! Turnover!`,
    ],
    fumble: [
      `${qb} drops back — hit as he throws — FUMBLE! The defense is on it!`,
    ],
  };

  const deepPassNarratives: Record<string, string[]> = {
    gain: [
      `${qb} launches it deep — ${wr} tracks it down for ${yards} yards! What a throw!`,
      `${wr} beats his man and ${qb} drops it in the bucket — ${yards} yards!`,
      `Play-action fake, ${qb} goes deep to ${wr} — ${yards} yards! The defense bit!`,
      `${qb} heaves it — ${wr} comes down with it for ${yards} yards in traffic!`,
    ],
    td: [
      `${qb} LAUNCHES IT — ${wr} is GONE! TOUCHDOWN! That's a 1-on-1 he wins every time!`,
      `Bomb from ${qb}! ${wr} outruns everyone and hauls it in — TOUCHDOWN!`,
      `${wr} burns his corner and ${qb} finds him in stride — SIX POINTS!`,
    ],
    incomplete: [
      `${qb} airs it out for ${wr} — overthrown. Incomplete.`,
      `${wr} had a step but the safety closes fast — incomplete, almost picked.`,
      `${qb} scrambles and heaves it deep — too far, sails out of bounds.`,
    ],
    interception: [
      `${qb} goes deep to ${wr} — the safety reads it perfectly. INTERCEPTION! Pick off!`,
      `Under pressure, ${qb} throws deep — the corner undercuts the route. INTERCEPTED!`,
      `${wr} and the DB go up for it — the defender comes down with the ball. Turnover!`,
    ],
    fumble: [
      `${wr} hauls in the catch but gets stripped on contact — FUMBLE! The ball is loose!`,
    ],
  };

  const optionNarratives: Record<string, string[]> = {
    gain: [
      `${qb} runs the option — keeps it himself and picks up ${yards} yards.`,
      `Option play — ${qb} pitches to ${rb} who scampers for ${yards}.`,
      `Read option: ${qb} pulls it and runs — ${yards} yards before the corner forces him out.`,
    ],
    td: [
      `Option keeper! ${qb} keeps it and streaks into the end zone — TOUCHDOWN!`,
      `${qb} fakes the pitch and dashes to the corner — SCORE! Option football at its finest!`,
    ],
    fumble: [
      `Fumbled exchange on the option! The pitch is on the ground — the defense pounces!`,
      `${qb} bobbles the snap on the option — ball loose, recovered by the defense!`,
    ],
    loss: [
      `The defense crashes the option — ${qb} has nowhere to go, loss of yards.`,
    ],
  };

  const screenNarratives: Record<string, string[]> = {
    gain: [
      `Screen pass to ${rb} — he follows his blockers for ${yards} yards.`,
      `${qb} dumps it off on the screen — ${rb} picks up ${yards} after the catch.`,
      `Screen to the flat — ${rb} bounces outside for ${yards} yards.`,
    ],
    td: [
      `Screen pass — ${rb} gets into open space and RUNS IT IN! Nobody touches him! Touchdown!`,
    ],
    incomplete: [
      `Screen play snuffed out — the defense read it. ${qb} throws it away.`,
    ],
    interception: [
      `The linebacker reads the screen perfectly — steps in front and picks it off!`,
    ],
    fumble: [
      `${rb} catches the screen but gets stripped before he can turn — FUMBLE!`,
    ],
    loss: [
      `Screen is blown up immediately — ${rb} goes down behind the line.`,
    ],
  };

  const playActionNarratives: Record<string, string[]> = {
    gain: [
      `${qb} fakes the run — ${te} is wide open over the middle for ${yards} yards! The linebackers bit!`,
      `Play-action freezes the defense. ${qb} finds ${wr} for ${yards} yards with room to run.`,
      `${qb} sells the run fake beautifully — hits ${wr} in stride for ${yards} yards.`,
    ],
    td: [
      `Play-action fake — EVERYONE bit! ${wr} is alone in the end zone. TOUCHDOWN! Perfect execution!`,
      `${qb} fakes the handoff and finds ${te} wide open — TOUCHDOWN! The linebackers never recovered!`,
    ],
    incomplete: [
      `Play-action — ${qb} pulls it down looking for ${wr}. Can't find him, throws it away.`,
      `Play-action busted — ${qb} holds too long ${defPressure} and the pass falls incomplete.`,
    ],
    interception: [
      `Play-action didn't fool anyone — ${qb} forced it to ${wr} and it's PICKED! They read it from the snap!`,
    ],
    fumble: [
      `${qb} fumbles the snap on the play-action fake — ball is loose! Defense recovers!`,
    ],
    loss: [
      `Play-action gets no one open — ${qb} scrambles and loses ${Math.abs(yards || 0)} yards.`,
    ],
  };

  const map: Record<PlayType, Record<string, string[]>> = {
    run: runNarratives,
    short_pass: shortPassNarratives,
    deep_pass: deepPassNarratives,
    option: optionNarratives,
    screen: screenNarratives,
    play_action: playActionNarratives,
  };

  const pool = map[playType][result] || [`Gain of ${yards} yards.`];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function pickDefense(defenseTeam: DefenseTeam, down: number, toGo: number, yardsToEnd: number): DefenseType {
  // Situational adjustments
  const tendencies = { ...defenseTeam.tendencies };

  if (yardsToEnd <= 10 && down >= 3) tendencies.prevent += 20;
  if (down === 3 && toGo <= 3) { tendencies.blitz += 15; tendencies.man += 10; }
  if (down === 1) tendencies.base += 15;
  if (yardsToEnd >= 60) { tendencies.zone += 10; tendencies.blitz += 5; }

  const total = Object.values(tendencies).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (const [def, weight] of Object.entries(tendencies)) {
    roll -= weight;
    if (roll <= 0) return def as DefenseType;
  }
  return 'base';
}

function ordinal(n: number) {
  return ['1st', '2nd', '3rd', '4th'][n - 1] ?? `${n}th`;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function initGame(mode: Mode): GameState {
  const offenseTeam = randomFrom(OFFENSE_TEAMS);
  const defenseTeam = randomFrom(DEFENSE_TEAMS.filter(d => d.name !== offenseTeam.name));
  const yardsToEnd = Math.floor(Math.random() * 55) + 25; // 25–80 yard drive to start

  return {
    mode,
    down: 1,
    toGo: 10,
    yardsToEnd,
    firstDownMarker: yardsToEnd - 10,
    driveYards: 0,
    score: { offense: 0, defense: 0 },
    quarter: 1,
    timeLeft: 15 * 60,
    plays: [],
    driveOver: false,
    driveResult: null,
    totalDrives: 1,
    turnovers: 0,
    tds: 0,
    currentDefense: pickDefense(defenseTeam, 1, 10, yardsToEnd),
    offenseTeam,
    defenseTeam,
    stylePoints: 0,
    arcadeCombo: 0,
  };
}

function newDrive(prev: GameState): GameState {
  const yardsToEnd = Math.floor(Math.random() * 55) + 25;
  return {
    ...prev,
    down: 1,
    toGo: 10,
    yardsToEnd,
    firstDownMarker: yardsToEnd - 10,
    driveYards: 0,
    plays: [],
    driveOver: false,
    driveResult: null,
    totalDrives: prev.totalDrives + 1,
    currentDefense: pickDefense(prev.defenseTeam, 1, 10, yardsToEnd),
  };
}

// ─── PLAY BUTTONS CONFIG ──────────────────────────────────────────────────────

const PLAYS: { type: PlayType; label: string; emoji: string; desc: string }[] = [
  { type: 'run',         label: 'Run',         emoji: '🏃', desc: 'Handoff up the middle or outside' },
  { type: 'short_pass',  label: 'Short Pass',  emoji: '↗️', desc: 'Quick routes under 10 yards' },
  { type: 'deep_pass',   label: 'Deep Pass',   emoji: '🚀', desc: 'Bomb downfield, high risk/reward' },
  { type: 'option',      label: 'Option',      emoji: '🔀', desc: 'Read the defense, keep or pitch' },
  { type: 'screen',      label: 'Screen',      emoji: '🎯', desc: 'Dump-off with blockers set up' },
  { type: 'play_action', label: 'Play Action', emoji: '🎭', desc: 'Fake the run, exploit the linebackers' },
];

const DEFENSE_INFO: Record<DefenseType, { label: string; emoji: string; weakness: string }> = {
  blitz:   { label: 'Blitz',   emoji: '⚡', weakness: 'Screen & Deep Pass' },
  zone:    { label: 'Zone',    emoji: '🛡️', weakness: 'Screen & Run' },
  man:     { label: 'Man',     emoji: '🔒', weakness: 'Option & Screen' },
  prevent: { label: 'Prevent', emoji: '🧱', weakness: 'Run & Short Pass' },
  base:    { label: 'Base',    emoji: '⚖️', weakness: 'Balanced attack' },
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const MODE_CONFIG = {
  arcade:   { label: 'Arcade',    emoji: '🕹️', color: 'from-yellow-500 to-orange-500', desc: 'Fast plays, style points, chain combos' },
  sim:      { label: 'Sim',       emoji: '📊', color: 'from-blue-600 to-cyan-500',     desc: 'Stats-heavy, real down & distance, chess-like' },
  broadcast:{ label: 'Broadcast', emoji: '📺', color: 'from-red-600 to-rose-500',      desc: 'Full play-by-play like you\'re watching ESPN' },
  coaching: { label: 'Coaching',  emoji: '📋', color: 'from-emerald-600 to-teal-500',  desc: 'See the defense first, counter the call' },
};

export default function PlaySimulator() {
  const [game, setGame] = useState<GameState | null>(null);
  const [animating, setAnimating] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<PlayOutcome | null>(null);
  const [showResult, setShowResult] = useState(false);
  const playLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (playLogRef.current && game?.plays.length) {
      playLogRef.current.scrollTop = playLogRef.current.scrollHeight;
    }
  }, [game?.plays.length]);

  function startGame(mode: Mode) {
    setGame(initGame(mode));
    setLastOutcome(null);
    setShowResult(false);
  }

  function callPlay(playType: PlayType) {
    if (!game || animating || game.driveOver) return;

    setAnimating(true);
    setShowResult(false);

    setTimeout(() => {
      setGame(prev => {
        if (!prev) return prev;

        const outcome = simulatePlay(
          playType,
          prev.currentDefense,
          prev.offenseTeam,
          prev.defenseTeam,
          prev.yardsToEnd,
          prev.down,
          prev.toGo,
        );

        setLastOutcome(outcome);
        setShowResult(true);

        const newPlay: DrivePlay = {
          down: prev.down,
          toGo: prev.toGo,
          yardsToEnd: prev.yardsToEnd,
          playType,
          defense: prev.currentDefense,
          outcome,
        };

        // Turnover
        if (outcome.result === 'fumble' || outcome.result === 'interception') {
          return {
            ...prev,
            plays: [...prev.plays, newPlay],
            driveOver: true,
            driveResult: 'turnover',
            turnovers: prev.turnovers + 1,
            score: { ...prev.score, defense: prev.score.defense + 0 },
            arcadeCombo: 0,
          };
        }

        // TD
        if (outcome.result === 'td') {
          const newScore = prev.score.offense + 7;
          return {
            ...prev,
            plays: [...prev.plays, newPlay],
            driveOver: true,
            driveResult: 'td',
            tds: prev.tds + 1,
            score: { ...prev.score, offense: newScore },
            stylePoints: prev.stylePoints + (outcome.stylePoints || 0),
            arcadeCombo: 0,
          };
        }

        // Update yards
        const newYardsToEnd = prev.yardsToEnd - outcome.yards;
        const newDriveYards = prev.driveYards + outcome.yards;
        let newDown = prev.down;
        let newToGo = prev.toGo - outcome.yards;
        let newFirstDownMarker = prev.firstDownMarker;

        // First down?
        if (outcome.yards >= prev.toGo || newYardsToEnd <= 0) {
          newDown = 1;
          newToGo = Math.min(10, newYardsToEnd);
          newFirstDownMarker = newYardsToEnd - 10;
        } else {
          newDown = prev.down + 1;
        }

        // Turnover on downs
        if (newDown === 5) {
          // 4th down check — field goal range?
          if (newYardsToEnd <= 35) {
            const fgPoints = prev.score.offense + 3;
            return {
              ...prev,
              plays: [...prev.plays, newPlay],
              driveOver: true,
              driveResult: 'fg',
              score: { ...prev.score, offense: fgPoints },
              arcadeCombo: 0,
            };
          }
          // Punt
          return {
            ...prev,
            plays: [...prev.plays, newPlay],
            driveOver: true,
            driveResult: 'punt',
            arcadeCombo: 0,
          };
        }

        const newCombo = outcome.yards >= 10 ? prev.arcadeCombo + 1 : 0;
        const bonusStyle = newCombo >= 2 ? newCombo - 1 : 0;

        const newDefense = pickDefense(prev.defenseTeam, newDown, newToGo, newYardsToEnd);

        return {
          ...prev,
          down: newDown,
          toGo: Math.max(1, newToGo),
          yardsToEnd: newYardsToEnd,
          firstDownMarker: newFirstDownMarker,
          driveYards: newDriveYards,
          plays: [...prev.plays, newPlay],
          currentDefense: newDefense,
          stylePoints: prev.stylePoints + (outcome.stylePoints || 0) + bonusStyle,
          arcadeCombo: newCombo,
        };
      });
      setAnimating(false);
    }, 600);
  }

  // ─── RENDER: MODE SELECT ───────────────────────────────────────────────────

  if (!game) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
        <div className="max-w-5xl mx-auto px-4 py-10 w-full flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-12">
            <Link href="/" className="text-zinc-500 hover:text-white text-sm transition">← Back to Games</Link>
            <h1 className="text-3xl font-black tracking-tight">🏈 Play Simulator</h1>
            <div className="w-24" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-zinc-400 text-center mb-2 text-sm uppercase tracking-widest">Choose your game mode</p>
            <h2 className="text-5xl font-black text-center mb-12">How do you want to play?</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-3xl">
              {(Object.entries(MODE_CONFIG) as [Mode, typeof MODE_CONFIG[Mode]][]).map(([mode, cfg]) => (
                <button
                  key={mode}
                  onClick={() => startGame(mode)}
                  className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 p-7 text-left hover:border-zinc-600 transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${cfg.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="text-4xl mb-3">{cfg.emoji}</div>
                  <div className="text-xl font-black mb-1">{cfg.label}</div>
                  <div className="text-sm text-zinc-400">{cfg.desc}</div>
                  <div className={`mt-4 text-xs font-bold bg-gradient-to-r ${cfg.color} bg-clip-text text-transparent`}>
                    {mode === 'arcade' ? 'Chain big plays for bonuses →' :
                     mode === 'sim' ? 'Real probabilities, real decisions →' :
                     mode === 'broadcast' ? 'Full narration every play →' :
                     'Read the defense before calling →'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cfg = MODE_CONFIG[game.mode!];
  const defInfo = DEFENSE_INFO[game.currentDefense];

  // ─── RENDER: GAME ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setGame(null)} className="text-zinc-500 hover:text-white text-sm transition">← Modes</button>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${cfg.color} text-white`}>
              {cfg.emoji} {cfg.label}
            </span>
            <span className="text-zinc-400 text-sm">Drive #{game.totalDrives}</span>
          </div>
          <Link href="/games" className="text-zinc-500 hover:text-white text-sm transition">All Games</Link>
        </div>

        {/* Scoreboard */}
        <div className="bg-zinc-900 rounded-2xl p-4 mb-5 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="text-xs text-zinc-500 mb-1 truncate">{game.offenseTeam.name}</div>
              <div className="text-4xl font-black text-emerald-400">{game.score.offense}</div>
            </div>
            <div className="px-6 text-center">
              <div className="text-xs text-zinc-500">Q{game.quarter}</div>
              <div className="text-lg font-mono text-zinc-300">{formatTime(game.timeLeft)}</div>
              <div className="text-xs text-zinc-600 mt-1">{game.tds} TD • {game.turnovers} TO</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-xs text-zinc-500 mb-1 truncate">{game.defenseTeam.name}</div>
              <div className="text-4xl font-black text-red-400">{game.score.defense}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left: Field Situation + Play Caller */}
          <div className="lg:col-span-2 space-y-4">

            {/* Down & Distance */}
            <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-black">
                    {ordinal(game.down)} & {game.toGo}
                  </div>
                  <div className="text-zinc-500 text-sm mt-0.5">
                    Ball on the {100 - game.yardsToEnd} yard line • {game.yardsToEnd} to end zone
                  </div>
                </div>
                {game.mode === 'arcade' && game.arcadeCombo >= 2 && (
                  <div className="text-right">
                    <div className="text-yellow-400 font-black text-lg">🔥 {game.arcadeCombo}x COMBO</div>
                    <div className="text-xs text-zinc-500">Style: {game.stylePoints} pts</div>
                  </div>
                )}
                {game.mode === 'sim' && (
                  <div className="text-right text-xs text-zinc-500">
                    <div>Drive: +{game.driveYards} yds</div>
                    <div>Plays: {game.plays.length}</div>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(2, ((100 - game.yardsToEnd) / 100) * 100)}%` }}
                />
                <div
                  className="absolute inset-y-0 w-0.5 bg-yellow-400"
                  style={{ left: `${Math.max(0, ((100 - (game.firstDownMarker + 10)) / 100) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                <span>Own 1</span>
                <span className="text-yellow-500 text-[9px]">↑ 1st down</span>
                <span>End Zone</span>
              </div>
            </div>

            {/* Defense indicator (coaching mode shows full info; others show partial) */}
            {!game.driveOver && (
              <div className={`rounded-2xl p-4 border ${game.mode === 'coaching' ? 'border-amber-600/50 bg-amber-950/20' : 'border-zinc-800 bg-zinc-900'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{defInfo.emoji}</span>
                    <div>
                      {game.mode === 'coaching' ? (
                        <>
                          <div className="font-bold text-amber-400">Defense: {defInfo.label}</div>
                          <div className="text-xs text-zinc-400">Weakness: {defInfo.weakness}</div>
                        </>
                      ) : game.mode === 'sim' ? (
                        <>
                          <div className="font-bold text-zinc-300">Defense #{game.defenseTeam.overall} OVR</div>
                          <div className="text-xs text-zinc-500">{game.defenseTeam.name}</div>
                        </>
                      ) : (
                        <div className="font-bold text-zinc-400">Defense is set</div>
                      )}
                    </div>
                  </div>
                  {game.mode === 'sim' && (
                    <div className="text-xs text-zinc-500 text-right">
                      <div>OVR {game.defenseTeam.overall}</div>
                      <div>{game.defenseTeam.era}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Last play outcome */}
            {showResult && lastOutcome && (
              <div className={`rounded-2xl p-5 border transition-all ${
                lastOutcome.result === 'td' ? 'border-yellow-500 bg-yellow-950/20' :
                lastOutcome.result === 'fumble' || lastOutcome.result === 'interception' ? 'border-red-600 bg-red-950/20' :
                lastOutcome.result === 'incomplete' ? 'border-zinc-700 bg-zinc-900' :
                'border-emerald-700 bg-emerald-950/10'
              }`}>
                {lastOutcome.result === 'td' && <div className="text-yellow-400 font-black text-xl mb-1">🏆 TOUCHDOWN!</div>}
                {lastOutcome.result === 'fumble' && <div className="text-red-400 font-black text-xl mb-1">💥 FUMBLE!</div>}
                {lastOutcome.result === 'interception' && <div className="text-red-400 font-black text-xl mb-1">🔴 INTERCEPTED!</div>}
                {lastOutcome.result === 'incomplete' && <div className="text-zinc-400 font-bold text-base mb-1">Incomplete Pass</div>}
                {lastOutcome.result === 'gain' && (
                  <div className="text-emerald-400 font-bold text-base mb-1">
                    +{lastOutcome.yards} yards
                    {lastOutcome.stylePoints && lastOutcome.stylePoints > 0 ? ` ⭐ +${lastOutcome.stylePoints} style` : ''}
                  </div>
                )}
                {lastOutcome.result === 'loss' && <div className="text-red-400 font-bold text-base mb-1">{lastOutcome.yards} yards</div>}
                <p className="text-zinc-300 text-sm leading-relaxed">{lastOutcome.narrative}</p>
              </div>
            )}

            {/* Drive over */}
            {game.driveOver && (
              <div className={`rounded-2xl p-6 border text-center ${
                game.driveResult === 'td' ? 'border-yellow-500 bg-yellow-950/20' :
                game.driveResult === 'fg' ? 'border-blue-500 bg-blue-950/20' :
                game.driveResult === 'turnover' ? 'border-red-600 bg-red-950/20' :
                'border-zinc-700 bg-zinc-900'
              }`}>
                <div className="text-4xl mb-2">
                  {game.driveResult === 'td' ? '🏆' :
                   game.driveResult === 'fg' ? '🎯' :
                   game.driveResult === 'turnover' ? '💔' : '👟'}
                </div>
                <div className="font-black text-2xl mb-1">
                  {game.driveResult === 'td' ? 'TOUCHDOWN! +7' :
                   game.driveResult === 'fg' ? 'FIELD GOAL! +3' :
                   game.driveResult === 'turnover' ? 'TURNOVER' : 'PUNT'}
                </div>
                <div className="text-zinc-400 text-sm mb-5">
                  Drive: {game.plays.length} plays, {game.driveYards} yards
                </div>
                <button
                  onClick={() => setGame(prev => prev ? newDrive(prev) : prev)}
                  className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition"
                >
                  Next Drive →
                </button>
              </div>
            )}

            {/* Play caller */}
            {!game.driveOver && (
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
                  {game.mode === 'coaching' ? '📋 Call your play — counter the defense' : 'Call your play'}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PLAYS.map(play => (
                    <button
                      key={play.type}
                      onClick={() => callPlay(play.type)}
                      disabled={animating}
                      className={`group relative overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 p-4 text-left hover:border-emerald-600 hover:bg-zinc-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      <div className="text-2xl mb-1">{play.emoji}</div>
                      <div className="font-bold text-sm">{play.label}</div>
                      {(game.mode === 'sim' || game.mode === 'coaching') && (
                        <div className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{play.desc}</div>
                      )}
                      {game.mode === 'coaching' && (
                        <div className="text-[10px] mt-1">
                          {/* Highlight plays that counter current defense */}
                          {DEFENSE_INFO[game.currentDefense].weakness.toLowerCase().includes(play.label.toLowerCase()) && (
                            <span className="text-amber-400 font-bold">✓ COUNTERS DEFENSE</span>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Roster + Play Log */}
          <div className="space-y-4">

            {/* Teams */}
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Your Offense</div>
              <div className="text-sm font-bold text-emerald-400 mb-3 leading-tight">{game.offenseTeam.name}</div>
              {[game.offenseTeam.qb, game.offenseTeam.wr, game.offenseTeam.rb, game.offenseTeam.te].map(p => (
                <div key={p.name} className="flex items-center justify-between py-1.5 border-b border-zinc-800 last:border-0">
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-[10px] text-zinc-500">{p.era}</div>
                  </div>
                  <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400 uppercase">{p.role}</span>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-zinc-800">
                <div className="text-xs text-zinc-500 mb-1">vs.</div>
                <div className="text-sm font-bold text-red-400">{game.defenseTeam.name}</div>
                <div className="text-[10px] text-zinc-600">{game.defenseTeam.era} • {game.defenseTeam.overall} OVR</div>
              </div>
            </div>

            {/* Play log */}
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Play Log</div>
              <div ref={playLogRef} className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {game.plays.length === 0 && (
                  <div className="text-zinc-600 text-xs text-center py-4">No plays yet</div>
                )}
                {game.plays.map((p, i) => (
                  <div key={i} className={`text-xs p-2 rounded-xl border ${
                    p.outcome.result === 'td' ? 'border-yellow-700 bg-yellow-950/20 text-yellow-300' :
                    p.outcome.result === 'fumble' || p.outcome.result === 'interception' ? 'border-red-800 bg-red-950/20 text-red-300' :
                    p.outcome.result === 'incomplete' ? 'border-zinc-700 text-zinc-500' :
                    'border-zinc-800 text-zinc-400'
                  }`}>
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold">{ordinal(p.down)} & {p.toGo}</span>
                      <span className={p.outcome.yards > 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {p.outcome.result === 'incomplete' ? '—' :
                         p.outcome.result === 'td' ? 'TD!' :
                         p.outcome.result === 'fumble' ? 'FUM' :
                         p.outcome.result === 'interception' ? 'INT' :
                         `${p.outcome.yards > 0 ? '+' : ''}${p.outcome.yards}`}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-600 flex justify-between">
                      <span>{PLAYS.find(pl => pl.type === p.playType)?.label}</span>
                      <span>{DEFENSE_INFO[p.defense].label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Arcade style tracker */}
            {game.mode === 'arcade' && (
              <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Style Points</div>
                <div className="text-3xl font-black text-yellow-400">{game.stylePoints}</div>
                <div className="text-xs text-zinc-600 mt-1">Earned from big plays & combos</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}