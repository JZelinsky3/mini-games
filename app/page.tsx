'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import UserButton from '@/components/UserButton';

// ─── ICONS ────────────────────────────────────────────────────────────────────

const RouteIcon     = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M6 17V9a6 6 0 0 1 6-6h2M18 7v8a6 6 0 0 1-6 6h-2"/></svg>;
const ChartIcon     = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="18" y="3" width="3" height="18" rx="1"/><rect x="10.5" y="8" width="3" height="13" rx="1"/><rect x="3" y="13" width="3" height="8" rx="1"/></svg>;
const ClockIcon     = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>;
const TargetIcon    = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>;
const FlagIcon      = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
const LinkIcon      = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const StarIcon      = () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const FlameIconSm   = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
const UsersIcon     = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ActivityIcon  = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const TrophyIconSm  = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>;
const HandshakeIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>;
const GridIcon      = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const CalendarIcon  = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const FootballIcon  = () => <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="12" rx="10" ry="6" transform="rotate(-45 12 12)"/><path d="m9.5 9.5 5 5M7 7l2 2M15 15l2 2"/></svg>;

// ─── DATA ─────────────────────────────────────────────────────────────────────

const games = [
  { id: 'career-path',      title: 'Career Path',      icon: RouteIcon,   desc: 'Guess the player from their team journey',         color: 'from-blue-600 to-cyan-500',      tag: 'Trivia'   },
  { id: 'stat-shadow',      title: 'Stat Shadow',       icon: ChartIcon,   desc: 'Reveal clues to identify the mystery player',      color: 'from-purple-600 to-pink-500',    tag: 'Trivia'   },
  { id: 'timeline-builder', title: 'Timeline Builder',  icon: ClockIcon,   desc: 'Sort 8 players in order of their rookie season',   color: 'from-amber-500 to-orange-500',   tag: 'History'  },
  { id: 'play-sim',         title: 'Play Simulator',    icon: TargetIcon,  desc: 'Call plays, drive the field, find the end zone',   color: 'from-green-600 to-lime-500',     tag: 'Strategy' },
  { id: 'penalty-flag',     title: 'Penalty Flag',      icon: FlagIcon,    desc: 'Spot the foul buried in real play descriptions',   color: 'from-red-600 to-rose-500',       tag: 'Rules'    },
  { id: 'rivalry-chain',    title: 'Rivalry Chain',     icon: LinkIcon,    desc: 'Build the longest rival connection chain',         color: 'from-emerald-600 to-teal-500',   tag: 'History'  },
  { id: 'draft-room',       title: 'Draft Room',        icon: StarIcon,    desc: 'Guess the draft pick from combine stats alone',    color: 'from-violet-600 to-fuchsia-500', tag: 'History'  },
];

const DAILY_CHALLENGES = [
  { icon: ClockIcon,  label: "Today's Timeline",       detail: '8 players · Hard mode', id: 'timeline-builder', color: 'amber'  },
  { icon: ChartIcon,  label: "Today's Mystery Player",  detail: '3 clues remaining',     id: 'stat-shadow',      color: 'purple' },
  { icon: RouteIcon,  label: "Today's Career Path",     detail: 'Unsolved',              id: 'career-path',      color: 'blue'   },
];

const TAGS = ['All', 'Trivia', 'Strategy', 'History', 'Rules'];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeTag, setActiveTag]     = useState('All');
  const [userStreak, setUserStreak]   = useState(0);
  const [mounted, setMounted]         = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [siteStats, setSiteStats]     = useState<{ games: number; players: number; topStreak: number } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    setMounted(true);

    async function getUserProgress() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_progress')
          .select('streak_count')
          .eq('user_id', user.id)
          .single();
        if (data) setUserStreak(data.streak_count);
      }
    }

    async function fetchLeaderboard() {
      const { data } = await supabase
        .from('user_progress')
        .select('streak_count, total_score, user_id, display_name')
        .order('total_score', { ascending: false })
        .limit(7);
      if (data) setLeaderboard(data);
    }

    async function fetchSiteStats() {
      const today = new Date().toISOString().split('T')[0];
      const { count: gamesCount } = await supabase
        .from('game_sessions')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today);

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: playersCount } = await supabase
        .from('user_progress')
        .select('user_id', { count: 'exact', head: true })
        .gte('last_played_at', weekAgo);

      const { data: topStreakData } = await supabase
        .from('user_progress')
        .select('streak_count')
        .order('streak_count', { ascending: false })
        .limit(1)
        .single();

      setSiteStats({
        games: gamesCount ?? 0,
        players: playersCount ?? 0,
        topStreak: topStreakData?.streak_count ?? 0,
      });
    }

    getUserProgress();
    fetchLeaderboard();
    fetchSiteStats();
  }, [supabase]);

  const filtered = activeTag === 'All' ? games : games.filter(g => g.tag === activeTag);

  const colorChip: Record<string, string> = {
    amber:    'bg-amber-500/15 text-amber-400 border-amber-500/30',
    purple:   'bg-purple-500/15 text-purple-400 border-purple-500/30',
    blue:     'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Trivia:   'bg-violet-500/15 text-violet-400 border-violet-500/30',
    Strategy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    History:  'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Rules:    'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };

  const iconColor: Record<string, string> = {
    amber:  'text-amber-400',
    purple: 'text-purple-400',
    blue:   'text-blue-400',
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, #fff 39px, #fff 40px)' }}
        />

        <div className="max-w-7xl mx-auto px-6 pt-8 pb-12">
          {/* Nav */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <span className="text-zinc-500"><FootballIcon /></span>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500">NFL MiniGames Hub</span>
            </div>
            <UserButton />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            {/* Headline */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-500">Daily challenges live now</span>
              </div>
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

            {/* Live stats — real Supabase data, skeleton while loading */}
            <div className="flex gap-3 flex-wrap lg:flex-nowrap">
              {mounted && siteStats ? (
                <>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 min-w-[130px]">
                    <div className="flex items-center gap-1.5 mb-1 text-zinc-600"><ActivityIcon /><span className="text-[10px] uppercase tracking-wider font-bold">Today</span></div>
                    <div className="text-2xl font-black text-white">{siteStats.games.toLocaleString()}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Games played</div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 min-w-[130px]">
                    <div className="flex items-center gap-1.5 mb-1 text-zinc-600"><UsersIcon /><span className="text-[10px] uppercase tracking-wider font-bold">Active</span></div>
                    <div className="text-2xl font-black text-white">{siteStats.players.toLocaleString()}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Players this week</div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 min-w-[130px]">
                    <div className="flex items-center gap-1.5 mb-1 text-zinc-600"><TrophyIconSm /><span className="text-[10px] uppercase tracking-wider font-bold">Record</span></div>
                    <div className="text-2xl font-black text-white">{siteStats.topStreak}d</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Top streak</div>
                  </div>
                </>
              ) : (
                [0, 1, 2].map(i => (
                  <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 min-w-[130px] h-[96px] animate-pulse" />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-14">

        {/* ── DAILY CHALLENGES ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black">Daily Challenges</h2>
              <p className="text-zinc-500 text-sm mt-0.5">Fresh puzzles every day at midnight ET</p>
            </div>
            {mounted && userStreak > 0 && (
              <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2">
                <span className="text-orange-400"><FlameIconSm /></span>
                <span className="text-orange-400 font-bold text-sm">{userStreak} day streak</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DAILY_CHALLENGES.map((c) => {
              const Icon = c.icon;
              return (
                <Link key={c.id} href={`/games/${c.id}`}
                  className="group relative overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className={iconColor[c.color]}><Icon /></span>
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
              );
            })}
          </div>
        </section>

        {/* ── ALL GAMES ────────────────────────────────────────────────────── */}
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
            {filtered.map((game) => {
              const Icon = game.icon;
              return (
                <Link
                  key={game.id}
                  href={`/games/${game.id}`}
                  className="group relative overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 flex flex-col transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-300`} />
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-zinc-400 group-hover:text-white transition-colors duration-200">
                      <Icon />
                    </span>
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
              );
            })}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-black">How It Works</h2>
            <p className="text-zinc-500 text-sm mt-0.5">New here? Here's the format.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { num: '01', title: 'Pick a game',     desc: 'Choose from 7 distinct NFL trivia formats, each testing a different slice of your football knowledge.' },
              { num: '02', title: 'Play daily',      desc: 'Three games reset every midnight ET with fresh challenges. Your streak grows each day you play.' },
              { num: '03', title: 'Earn points',     desc: 'Score for correct answers. Speed bonuses, daily multipliers, and streak rewards can triple your haul.' },
              { num: '04', title: 'Climb the board', desc: 'Your cumulative score is public. See exactly where you stand against every player on the platform.' },
            ].map(step => (
              <div key={step.num} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="text-4xl font-black text-zinc-800 mb-3">{step.num}</div>
                <div className="font-bold text-sm mb-2">{step.title}</div>
                <p className="text-zinc-500 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── LEADERBOARD + SIDEBAR ─────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Leaderboard */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">Leaderboard</h2>
                <p className="text-zinc-500 text-xs mt-0.5">All-time top players this season</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </div>
            </div>
            <div className="divide-y divide-zinc-800">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry, index) => (
                  <div key={index} className={`flex items-center gap-4 px-6 py-3.5 ${index < 3 ? 'bg-zinc-800/40' : ''}`}>
                    <div className={`text-sm font-black w-6 text-center ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-zinc-300' :
                      index === 2 ? 'text-amber-600' : 'text-zinc-600'
                    }`}>{index + 1}</div>
                    <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[11px] font-black text-zinc-400 shrink-0">
                      {(entry.display_name || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 font-bold text-sm">
                      {entry.display_name || `Player ${entry.user_id?.slice(0, 6)}`}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-white">{entry.total_score.toLocaleString()}</div>
                      <div className="text-[10px] text-zinc-600">{entry.streak_count}d streak</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-zinc-500">No scores yet — be the first!</div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-black text-base mb-4">How Points Work</h3>
              <div className="space-y-3">
                {[
                  { label: 'Correct answer',  pts: '+100',      color: 'text-emerald-400' },
                  { label: 'Daily challenge', pts: '2× points', color: 'text-yellow-400'  },
                  { label: 'Streak bonus',    pts: '+50 / day', color: 'text-orange-400'  },
                  { label: 'Speed bonus',     pts: 'up to +50', color: 'text-cyan-400'    },
                  { label: 'Wrong answer',    pts: '−25',       color: 'text-red-400'     },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">{row.label}</span>
                    <span className={`font-black ${row.color}`}>{row.pts}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-black text-base mb-1">Coming Soon</h3>
              <p className="text-zinc-600 text-xs mb-4">Next drops</p>
              <div className="space-y-4">
                {[
                  { icon: HandshakeIcon, title: 'Head to Head',    desc: 'Challenge a friend in real time' },
                  { icon: GridIcon,      title: 'Immaculate Grid',  desc: 'Classic 3×3 crossword format'   },
                  { icon: CalendarIcon,  title: 'Draft Simulator',  desc: 'Build your all-time roster'      },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 shrink-0">
                        <Icon />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-300">{item.title}</div>
                        <div className="text-[11px] text-zinc-600">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-3xl px-8 py-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-transparent to-cyan-600/10 pointer-events-none rounded-3xl" />
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 mb-5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3.5 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-400 tracking-widest uppercase">Free to play</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-3">Think you know the NFL?</h2>
            <p className="text-zinc-400 mb-7 max-w-md mx-auto text-sm leading-relaxed">
              Create a free account to save your streak, track progress across all 7 games, and appear on the leaderboard.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white text-black font-black text-sm px-8 py-3.5 rounded-full hover:bg-zinc-100 transition-colors"
            >
              Start playing free →
            </Link>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer className="border-t border-zinc-800 pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-600 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-700"><FootballIcon /></span>
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