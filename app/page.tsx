'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import UserButton from '@/components/UserButton';

// ─── DATA ─────────────────────────────────────────────────────────────────────

const games = [
  { id: 'career-path',      title: 'Career Path',       emoji: '🛤️', desc: 'Guess the player from their team journey',        color: 'from-blue-600 to-cyan-500',       tag: 'Trivia' },
  { id: 'stat-shadow',      title: 'Stat Shadow',        emoji: '📊', desc: 'Reveal clues to guess the mystery player',        color: 'from-purple-600 to-pink-500',     tag: 'Trivia' },
  { id: 'timeline-builder', title: 'Timeline Builder',   emoji: '⏳', desc: 'Sort 8 players by rookie season',                color: 'from-amber-500 to-orange-500',    tag: 'History' },
  { id: 'play-sim',         title: 'Play Simulator',     emoji: '🏈', desc: 'Call plays, drive the field, score',             color: 'from-green-600 to-lime-500',      tag: 'Strategy' },
  { id: 'penalty-flag',     title: 'Penalty Flag',       emoji: '🚩', desc: 'Spot the foul in real play descriptions',        color: 'from-red-600 to-rose-500',        tag: 'Rules' },
  { id: 'rivalry-chain',    title: 'Rivalry Chain',      emoji: '🔗', desc: 'Build the longest rival connection chain',       color: 'from-emerald-600 to-teal-500',    tag: 'History' },
  { id: 'emoji-recap',      title: 'Emoji Recap',        emoji: '😎', desc: 'Guess the famous game from emoji stories',       color: 'from-violet-600 to-fuchsia-500',  tag: 'History' },
];

const DAILY_CHALLENGES = [
  { game: 'Timeline Builder', emoji: '⏳', label: "Today's Timeline", detail: '8 players · Hard mode', id: 'timeline-builder', color: 'amber' },
  { game: 'Stat Shadow',      emoji: '📊', label: "Today's Mystery Player", detail: '3 clues remaining',  id: 'stat-shadow',      color: 'purple' },
  { game: 'Career Path',      emoji: '🛤️', label: "Today's Career Path",    detail: 'Unsolved',           id: 'career-path',      color: 'blue' },
];

const LEADERBOARD = [
  { rank: 1,  name: 'GridironGuru',   score: 14820, streak: 22, badge: '🔥' },
  { rank: 2,  name: 'BlitzKing99',    score: 13550, streak: 18, badge: '⚡' },
  { rank: 3,  name: 'TouchdownTed',   score: 12200, streak: 15, badge: '🏆' },
  { rank: 4,  name: 'SackMaster',     score: 11400, streak: 11, badge: '' },
  { rank: 5,  name: 'RedZoneRex',     score: 10900, streak: 9,  badge: '' },
  { rank: 6,  name: 'FourthAndFarr',  score: 9800,  streak: 7,  badge: '' },
  { rank: 7,  name: 'PocketPresence', score: 8750,  streak: 5,  badge: '' },
];

const STATS = [
  { label: 'Games Played Today', value: '2,841' },
  { label: 'Active Streaks',     value: '934' },
  { label: 'Perfect Scores',     value: '187' },
  { label: 'Top Streak',         value: '22 days' },
];

const TAGS = ['All', 'Trivia', 'Strategy', 'History', 'Rules'];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeTag, setActiveTag] = useState('All');
  const [userStreak, setUserStreak] = useState(0);
  const [userName, setUserName] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    setMounted(true);

    async function getUserProgress() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player');

        const { data } = await supabase
          .from('user_progress')
          .select('streak_count')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setUserStreak(data.streak_count);
        }
      }
    }

    getUserProgress();
  }, [supabase]);

  const [leaderboard, setLeaderboard] = useState<any[]>([]);

useEffect(() => {
  async function fetchLeaderboard() {
    const { data } = await supabase
      .from('user_progress')
      .select('streak_count, total_score, user_id')
      .order('total_score', { ascending: false })
      .limit(7);

    if (data) {
      setLeaderboard(data);
    }
  }
  fetchLeaderboard();
}, [supabase]);

  const filtered = activeTag === 'All' ? games : games.filter(g => g.tag === activeTag);

  const colorChip: Record<string, string> = {
  amber:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
  purple:  'bg-purple-500/15 text-purple-400 border-purple-500/30',
  blue:    'bg-blue-500/15 text-blue-400 border-blue-500/30',
  // New colors for All Games section
  Trivia:    'bg-violet-500/15 text-violet-400 border-violet-500/30',
  Strategy:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  History:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Rules:     'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
<div className="relative overflow-hidden border-b border-zinc-800">
  <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
    style={{
      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, #fff 39px, #fff 40px)',
    }}
  />
  
  <div className="max-w-7xl mx-auto px-6 pt-8 pb-12">
    
    {/* Top Navigation + Logo in same row on large screens */}
    <div className="flex justify-between items-start mb-8 lg:mb-6">
      {/* Logo / Brand (moved here so it's aligned) */}
      <div className="flex items-center gap-3">
        <span className="text-4xl">🏈</span>
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500">NFL MiniGames Hub</span>
      </div>

      {/* User Button */}
      <UserButton />
    </div>

    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
      <div>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-4">
          The only NFL<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            trivia hub
          </span>{' '}
          you need.
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl">
          7 games. Daily challenges. Real NFL history. Built for fans who know their stuff — and want to prove it.
        </p>
      </div>

      {/* Streak / quick stats */}
      <div className="flex gap-4 flex-wrap lg:flex-nowrap">
        {STATS.map(s => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 min-w-[120px]">
            <div className="text-2xl font-black text-white">{s.value}</div>
            <div className="text-xs text-zinc-500 mt-0.5 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-14">

        {/* ── DAILY CHALLENGES ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black">Daily Challenges</h2>
              <p className="text-zinc-500 text-sm mt-0.5">Fresh puzzles every day at midnight ET</p>
            </div>
            {mounted && userStreak > 0 && (
  <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2">
    <span className="text-lg">🔥</span>
    <span className="text-orange-400 font-bold text-sm">{userStreak} day streak</span>
  </div>
)}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DAILY_CHALLENGES.map((c) => (
              <Link key={c.id} href={`/games/${c.id}`}
                className="group relative overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{c.emoji}</span>
                  <span className={`text-[11px] font-bold px-2 py-1 rounded-full border ${colorChip[c.color]}`}>
                    Daily
                  </span>
                </div>
                <div className="font-bold text-base mb-1">{c.label}</div>
                <div className="text-zinc-500 text-xs">{c.detail}</div>
                <div className="mt-4 text-emerald-400 text-xs font-bold group-hover:text-emerald-300 transition">
                  Play Today's →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── GAME GRID ────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-2xl font-black">All Games</h2>
            <div className="flex gap-2 flex-wrap">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`text-xs font-bold px-4 py-1.5 rounded-full border transition ${
                    activeTag === tag
                      ? 'bg-white text-black border-white'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="group relative overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 flex flex-col transition-all duration-200 hover:scale-[1.02]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-300`} />
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{game.emoji}</span>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${colorChip[game.tag] || 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                      {game.tag}
                    </span>
                </div>
                <div className="font-bold text-base mb-1">{game.title}</div>
                <p className="text-zinc-500 text-sm flex-1 leading-snug">{game.desc}</p>
                <div className="mt-4 text-sm font-bold text-zinc-400 group-hover:text-emerald-400 transition">
                  Play Now →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── LEADERBOARD + SIDE INFO ───────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Leaderboard */}
<div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
  <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
    <div>
      <h2 className="text-xl font-black">Leaderboard</h2>
      <p className="text-zinc-500 text-xs mt-0.5">All-time top players this season</p>
    </div>
    <span className="text-xs text-zinc-600">Updated live</span>
  </div>
  <div className="divide-y divide-zinc-800">
    {leaderboard.length > 0 ? (
      leaderboard.map((entry, index) => (
        <div key={index} className={`flex items-center gap-4 px-6 py-3.5 ${index < 3 ? 'bg-zinc-800/40' : ''}`}>
          <div className={`text-sm font-black w-6 text-center ${
            index === 0 ? 'text-yellow-400' :
            index === 1 ? 'text-zinc-300' :
            index === 2 ? 'text-amber-600' : 'text-zinc-600'
          }`}>
            {index + 1}
          </div>
          <div className="flex-1 font-bold text-sm">Player {entry.user_id.slice(0,8)}</div>
          <div className="text-right">
            <div className="text-sm font-black text-white">{entry.total_score.toLocaleString()}</div>
            <div className="text-[10px] text-zinc-600">{entry.streak_count}d streak</div>
          </div>
        </div>
      ))
    ) : (
      <div className="px-6 py-12 text-center text-zinc-500">No scores yet. Be the first!</div>
    )}
  </div>
</div>

          {/* Right column */}
          <div className="space-y-4">

            {/* How scoring works */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-black text-base mb-4">How Points Work</h3>
              <div className="space-y-3">
                {[
                  { label: 'Correct answer',    pts: '+100', color: 'text-emerald-400' },
                  { label: 'Daily challenge',    pts: '+2×',  color: 'text-yellow-400' },
                  { label: 'Streak bonus',       pts: '+50/day', color: 'text-orange-400' },
                  { label: 'Speed bonus',        pts: 'up to +50', color: 'text-cyan-400' },
                  { label: 'Wrong answer',       pts: '−25',  color: 'text-red-400' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">{row.label}</span>
                    <span className={`font-black ${row.color}`}>{row.pts}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coming soon */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-black text-base mb-1">Coming Soon</h3>
              <p className="text-zinc-600 text-xs mb-4">Next drops</p>
              <div className="space-y-3">
                {[
                  { emoji: '🤝', title: 'Head to Head',    desc: 'Challenge a friend live' },
                  { emoji: '🧠', title: 'Immaculate Grid',  desc: 'Classic crossword format' },
                  { emoji: '📅', title: 'Draft Simulator',  desc: 'Build your all-time roster' },
                ].map(item => (
                  <div key={item.title} className="flex items-center gap-3">
                    <span className="text-xl w-7">{item.emoji}</span>
                    <div>
                      <div className="text-sm font-bold text-zinc-300">{item.title}</div>
                      <div className="text-[11px] text-zinc-600">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <footer className="border-t border-zinc-800 pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-600 text-xs">
          <div className="flex items-center gap-2">
            <span>🏈</span>
            <span className="font-bold text-zinc-500">NFL MiniGames</span>
            <span>· All free · New daily challenges</span>
          </div>
          <div className="flex gap-6">
            <span className="hover:text-zinc-400 cursor-pointer transition">About</span>
            <span className="hover:text-zinc-400 cursor-pointer transition">Submit a game idea</span>
            <span className="hover:text-zinc-400 cursor-pointer transition">Twitter / X</span>
          </div>
        </footer>

      </div>
    </div>
  );
}