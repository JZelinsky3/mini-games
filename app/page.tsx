'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import UserButton from '@/components/UserButton';
import SiteWelcomeGate from '@/components/SiteWelcomeGate';

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
  { id: 'career-path',      title: 'Career Path',       icon: RouteIcon,    desc: 'Guess the player from their team journey',       tag: 'Trivia'   },
  { id: 'stat-shadow',      title: 'Stat Shadow',       icon: ChartIcon,    desc: 'Reveal clues to identify the mystery player',    tag: 'Trivia'   },
  { id: 'timeline-builder', title: 'Timeline Builder',  icon: ClockIcon,    desc: 'Sort 8 players in order of their rookie season', tag: 'History'  },
  { id: 'play-sim',         title: 'Play Simulator',    icon: TargetIcon,   desc: 'Call plays, drive the field, find the end zone', tag: 'Strategy' },
  { id: 'penalty-flag',     title: 'Penalty Flag',      icon: FlagIcon,     desc: 'Spot the foul buried in real play descriptions', tag: 'Rules'    },
  { id: 'rivalry-chain',    title: 'Rivalry Chain',     icon: LinkIcon,     desc: 'Build the longest rival connection chain',       tag: 'History'  },
  { id: 'draft-room',       title: 'Draft Room',        icon: StarIcon,     desc: 'Guess the draft pick from combine stats alone',  tag: 'History'  },
  { id: 'pack-empire',      title: 'Pack Empire',       icon: GridIcon,     desc: 'Build your own team with random packs',          tag: 'Strategy' },
  { id: 'nfl-redraft',      title: 'NFL Redraft',       icon: FootballIcon, desc: 'Redo history — pick better than the pros',       tag: 'Strategy' },
];

const DAILY_CHALLENGES = [
  { icon: ClockIcon, label: "Today's Timeline",       detail: '8 players · Hard mode', id: 'timeline-builder' },
  { icon: ChartIcon, label: "Today's Mystery Player", detail: '3 clues remaining',     id: 'stat-shadow'      },
  { icon: RouteIcon, label: "Today's Career Path",    detail: 'Unsolved',              id: 'career-path'      },
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

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

        :root {
          --bg: #141311;
          --bg-soft: #1c1b18;
          --bg-card: #201e1a;
          --ink: #f4ebd8;
          --ink-soft: #bfb5a0;
          --ink-mute: #7d7463;
          --amber: #e8a84b;
          --amber-bright: #f4c06a;
          --amber-deep: #a87420;
          --rust: #c04820;
          --line: #3a3630;
        }

        html, body {
          background: var(--bg);
          color: var(--ink);
          font-family: 'Space Grotesk', sans-serif;
        }

        .ticker-track {
    animation: scroll 40s linear infinite;
  }
  @keyframes scroll {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
    
      `}</style>

      <div className="min-h-screen relative" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
        <SiteWelcomeGate />

        {/* Grain + glow backdrop */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(232, 168, 75, 0.05) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(192, 72, 32, 0.03) 0%, transparent 50%)',
          }}
        />
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-60"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence baseFrequency='0.85' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 0.92 0 0 0 0 0.8 0 0 0 0.04 0'/></filter><rect width='180' height='180' filter='url(%23n)'/></svg>\")",
          }}
        />

        {/* ═══ TICKER ═══ */}
        <div
          className="relative z-10 h-[38px] overflow-hidden flex items-center"
          style={{ background: 'var(--amber)', color: 'var(--bg)', borderBottom: '3px solid var(--bg)' }}
        >
          <div className="flex gap-12 whitespace-nowrap pl-12 ticker-track">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-12">
                <span className="font-mono text-[0.72rem] font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                  <span style={{ color: 'var(--rust)' }}>★</span> DAILY CHALLENGES LIVE
                </span>
                <span className="font-mono text-[0.72rem] font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                  <span style={{ color: 'var(--rust)' }}>★</span> 9 GAMES · ONE HUB
                </span>
                <span className="font-mono text-[0.72rem] font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                  <span style={{ color: 'var(--rust)' }}>★</span> PACK EMPIRE — NOW OPEN
                </span>
                <span className="font-mono text-[0.72rem] font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                  <span style={{ color: 'var(--rust)' }}>★</span> BUILD YOUR STREAK
                </span>
                <span className="font-mono text-[0.72rem] font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                  <span style={{ color: 'var(--rust)' }}>★</span> FREE TO PLAY
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-8 pb-20">

          {/* ═══ MASTHEAD / NAV ═══ */}
          <div className="flex justify-between items-start pb-6 mb-10" style={{ borderBottom: '1px solid var(--line)' }}>
            <div className="flex items-center gap-4">
              <span style={{ color: 'var(--amber)' }}><FootballIcon /></span>
              <div>
                <div className="font-mono text-[0.72rem] font-bold tracking-[0.24em] uppercase" style={{ color: 'var(--amber)' }}>
                  NFL MINIGAMES HUB
                </div>
                <div className="font-mono text-[0.65rem] tracking-[0.18em] uppercase mt-1" style={{ color: 'var(--ink-mute)' }}>
                  The Almanac — Vol. 01 · Daily Edition
                </div>
              </div>
            </div>
            <UserButton />
          </div>

          {/* ═══ HERO ═══ */}
          <section className="mb-20">
            <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-sm"
              style={{ background: 'rgba(232, 168, 75, 0.08)', border: '1px solid rgba(232, 168, 75, 0.25)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--rust)' }} />
              <span className="font-mono text-[0.7rem] font-bold tracking-[0.3em] uppercase" style={{ color: 'var(--amber)' }}>
                Daily challenges live now
              </span>
            </div>

            <h1
              className="mb-8"
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 'clamp(3.5rem, 9vw, 8rem)',
                lineHeight: 0.92,
                letterSpacing: '-0.025em',
                color: 'var(--ink)',
              }}
            >
              The only NFL<br />
              <span style={{ fontStyle: 'italic', color: 'var(--amber)' }}>trivia hub</span><br />
              you&apos;ll ever need.
            </h1>

            <div className="grid md:grid-cols-2 gap-10 pt-8" style={{ borderTop: '1px solid var(--line)' }}>
              <p
                className="text-lg leading-relaxed italic"
                style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--ink-soft)' }}
              >
                <span style={{ fontSize: '2.2em', float: 'left', lineHeight: 0.9, paddingRight: '0.12em', color: 'var(--amber)', fontStyle: 'normal' }}>
                  N
                </span>
                ine games. Daily puzzles. Real NFL history. Built for fans who know their stuff —
                and for everyone still learning the sport.
              </p>

              <div className="flex gap-3 self-end flex-wrap md:flex-nowrap">
                {mounted && siteStats ? (
                  <>
                    <StatCard icon={<ActivityIcon />} label="Games today" value={siteStats.games.toLocaleString()} />
                    <StatCard icon={<UsersIcon />} label="Active players" value={siteStats.players.toLocaleString()} />
                    <StatCard icon={<TrophyIconSm />} label="Top streak" value={`${siteStats.topStreak}d`} />
                  </>
                ) : (
                  [0, 1, 2].map(i => (
                    <div key={i} className="animate-pulse" style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--line)',
                      minWidth: '130px',
                      height: '96px',
                    }} />
                  ))
                )}
              </div>
            </div>
          </section>

          {/* ═══ DAILY CHALLENGES ═══ */}
          <section className="mb-20">
            <SectionHeader
              number="§ 01 · Daily"
              title="Fresh puzzles, midnight ET —"
              meta={mounted && userStreak > 0 ? `${userStreak}d active streak` : 'Resets every 24h'}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DAILY_CHALLENGES.map((c) => {
                const Icon = c.icon;
                return (
                  <Link
                    key={c.id}
                    href={`/games/${c.id}`}
                    className="group relative p-6 transition-all duration-300"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <div
                      className="absolute top-0 left-0 h-full w-1 transition-all duration-300 group-hover:w-1.5"
                      style={{ background: 'var(--amber)' }}
                    />
                    <div className="flex items-start justify-between mb-5">
                      <span style={{ color: 'var(--amber)' }}><Icon /></span>
                      <span className="font-mono text-[0.6rem] font-bold tracking-[0.2em] uppercase px-2 py-1"
                        style={{ color: 'var(--rust)', border: '1px solid var(--rust)', borderRadius: '2px' }}>
                        Daily
                      </span>
                    </div>
                    <div
                      className="mb-1"
                      style={{
                        fontFamily: "'DM Serif Display', serif",
                        fontSize: '1.5rem',
                        lineHeight: 1.1,
                        color: 'var(--ink)',
                      }}
                    >
                      {c.label}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--ink-mute)' }}>{c.detail}</div>
                    <div
                      className="mt-6 font-mono text-[0.7rem] font-bold tracking-[0.2em] uppercase transition-colors"
                      style={{ color: 'var(--amber)' }}
                    >
                      Play today&apos;s →
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ═══ PACK EMPIRE FEATURE ═══ */}
          <section className="mb-20">
            <SectionHeader
              number="§ 02 · Cover Story"
              title="The flagship —"
              meta="Est. 2025"
            />

            <Link href="/games/pack-empire" className="block group">
              <div
                className="grid md:grid-cols-[1.1fr_1fr] gap-10 p-8 sm:p-10 transition-all duration-500"
                style={{
                  background: 'linear-gradient(160deg, var(--bg-card) 0%, var(--bg-soft) 100%)',
                  border: '1px solid var(--line)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  className="absolute top-0 right-0 w-[240px] h-[240px] pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'radial-gradient(circle, rgba(232, 168, 75, 0.2) 0%, transparent 70%)',
                  }}
                />

                {/* Left — big typographic card */}
                <div className="relative flex flex-col" style={{ minHeight: '380px' }}>
                  <div className="flex justify-between mb-4">
                    <span className="font-mono text-[0.62rem] tracking-[0.3em] uppercase" style={{ color: 'var(--amber)' }}>
                      ★ PACK EMPIRE ★
                    </span>
                    <span className="font-mono text-[0.62rem] tracking-[0.3em] uppercase" style={{ color: 'var(--amber)' }}>
                      № 01
                    </span>
                  </div>
                  <div
                    className="my-auto"
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
                      lineHeight: 0.95,
                      letterSpacing: '-0.02em',
                      color: 'var(--ink)',
                    }}
                  >
                    Pack<br />
                    <span style={{ fontStyle: 'italic', color: 'var(--amber)' }}>Empire.</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-6">
                    {[
                      { name: 'Empire Builder', desc: 'Solo draft' },
                      { name: 'Versus',         desc: 'Head-to-head' },
                      { name: 'Mega Draft',     desc: 'Full rounds' },
                      { name: 'League',         desc: 'Full season' },
                    ].map(m => (
                      <div
                        key={m.name}
                        className="px-3 py-2"
                        style={{
                          background: 'rgba(232, 168, 75, 0.06)',
                          borderLeft: '2px solid var(--amber)',
                        }}
                      >
                        <div className="font-bold text-[0.78rem]" style={{ color: 'var(--ink)' }}>{m.name}</div>
                        <div className="font-mono text-[0.56rem] tracking-[0.08em] uppercase" style={{ color: 'var(--ink-mute)' }}>
                          {m.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right — editorial article */}
                <div className="flex flex-col gap-5 relative">
                  <div className="font-mono text-[0.65rem] font-bold tracking-[0.25em] uppercase" style={{ color: 'var(--rust)' }}>
                    ★ Cover Feature · The Main Event
                  </div>
                  <h2
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)',
                      lineHeight: 1.05,
                      letterSpacing: '-0.015em',
                      color: 'var(--ink)',
                      margin: 0,
                    }}
                  >
                    A card collector&apos;s world, <span style={{ fontStyle: 'italic', color: 'var(--amber)' }}>built inside an NFL trivia hub.</span>
                  </h2>
                  <p style={{ color: 'var(--ink-soft)', lineHeight: 1.65 }}>
                    The deepest game on the site — and the one that rewards coming back. Rip packs, pull rarities
                    from Common up to Immortal, and build a roster that actually scores against real NFL stats.
                  </p>
                  <p style={{ color: 'var(--ink-soft)', lineHeight: 1.65 }}>
                    Play solo, challenge a friend, run a Mega Draft, or commit to League play. Four modes, one
                    collector&apos;s obsession.
                  </p>
                  <div
                    className="inline-flex items-center gap-2 pt-3 mt-2 self-start font-mono text-[0.75rem] font-bold tracking-[0.18em] uppercase transition-transform group-hover:translate-x-1"
                    style={{ color: 'var(--amber)', borderTop: '1px solid var(--line)', width: '100%' }}
                  >
                    <span>Enter Pack Empire</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </Link>
          </section>

          {/* ═══ ALL GAMES ═══ */}
          <section className="mb-20">
            <SectionHeader
              number="§ 03 · Full Index"
              title="Every game in the hub —"
              meta={`${filtered.length} showing`}
            />

            {/* Tag filter */}
            <div className="flex gap-2 flex-wrap mb-8">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className="font-mono text-[0.68rem] font-bold tracking-[0.2em] uppercase px-4 py-2 transition-all"
                  style={{
                    background: activeTag === tag ? 'var(--amber)' : 'transparent',
                    color: activeTag === tag ? 'var(--bg)' : 'var(--ink-mute)',
                    border: `1px solid ${activeTag === tag ? 'var(--amber)' : 'var(--line)'}`,
                    borderRadius: '2px',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-0">
              {filtered.map((game, idx) => {
                const Icon = game.icon;
                const num = String(idx + 1).padStart(2, '0');
                return (
                  <Link
                    key={game.id}
                    href={`/games/${game.id}`}
                    className="group grid items-baseline gap-4 py-5 transition-all duration-300 hover:pl-2"
                    style={{
                      gridTemplateColumns: 'auto 1fr auto',
                      borderBottom: '1px solid var(--line)',
                    }}
                  >
                    <span className="font-mono text-[0.7rem] tracking-[0.12em] min-w-[2rem]" style={{ color: 'var(--ink-mute)' }}>
                      {num} ·
                    </span>
                    <div className="flex flex-col gap-1">
                      <div
                        className="flex items-center gap-3 transition-colors"
                        style={{
                          fontFamily: "'DM Serif Display', serif",
                          fontSize: '1.4rem',
                          lineHeight: 1.1,
                          letterSpacing: '-0.01em',
                          color: 'var(--ink)',
                        }}
                      >
                        <span className="transition-colors group-hover:text-[var(--amber)]" style={{ color: 'var(--ink-mute)' }}>
                          <Icon />
                        </span>
                        <span className="group-hover:text-[var(--amber)] transition-colors">{game.title}</span>
                      </div>
                      <div className="text-sm" style={{ color: 'var(--ink-mute)', lineHeight: 1.4 }}>
                        {game.desc}
                      </div>
                    </div>
                    <span
                      className="font-mono text-[0.58rem] font-bold tracking-[0.15em] uppercase px-2.5 py-1"
                      style={{
                        color: 'var(--ink-soft)',
                        border: '1px solid var(--line)',
                        borderRadius: '2px',
                      }}
                    >
                      {game.tag}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ═══ HOW IT WORKS ═══ */}
          <section className="mb-20">
            <SectionHeader
              number="§ 04 · Primer"
              title="How the hub works —"
              meta="New here? Start here."
            />

            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
              style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}
            >
              {[
                { num: 'I.',   title: 'Pick a game',      desc: 'Choose from 9 distinct NFL trivia formats, each testing a different slice of football knowledge.' },
                { num: 'II.',  title: 'Play daily',       desc: 'Three games reset every midnight ET with fresh challenges. Your streak grows each day you play.' },
                { num: 'III.', title: 'Earn points',      desc: 'Score for correct answers. Speed bonuses, daily multipliers, and streak rewards can triple your haul.' },
                { num: 'IV.',  title: 'Climb the board',  desc: 'Your cumulative score is public. See exactly where you stand against every player on the platform.' },
              ].map((step, i, arr) => (
                <div
                  key={step.num}
                  className="p-6 flex flex-col gap-2"
                  style={{
                    borderRight: i < arr.length - 1 ? '1px solid var(--line)' : 'none',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontStyle: 'italic',
                      fontSize: '2.4rem',
                      lineHeight: 1,
                      color: 'var(--amber)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {step.num}
                  </div>
                  <div className="font-bold mt-2" style={{ color: 'var(--ink)' }}>{step.title}</div>
                  <p className="text-sm" style={{ color: 'var(--ink-mute)', lineHeight: 1.55 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ═══ LEADERBOARD + SIDEBAR ═══ */}
          <section className="mb-20 grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Leaderboard */}
            <div className="lg:col-span-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--line)' }}>
              <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--line)' }}>
                <div>
                  <div className="font-mono text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--amber)' }}>
                    § 05 · Standings
                  </div>
                  <h2 style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: '1.75rem',
                    fontStyle: 'italic',
                    color: 'var(--ink)',
                    lineHeight: 1,
                  }}>
                    The Leaderboard
                  </h2>
                </div>
                <div className="flex items-center gap-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--ink-mute)' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--rust)' }} />
                  Live
                </div>
              </div>
              <div>
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 px-6 py-4"
                      style={{
                        borderBottom: index < leaderboard.length - 1 ? '1px solid var(--line)' : 'none',
                        background: index < 3 ? 'rgba(232, 168, 75, 0.04)' : 'transparent',
                      }}
                    >
                      <div
                        className="w-8 text-center"
                        style={{
                          fontFamily: "'DM Serif Display', serif",
                          fontSize: '1.6rem',
                          fontStyle: 'italic',
                          lineHeight: 1,
                          color: index === 0 ? 'var(--amber)' : index === 1 ? 'var(--ink-soft)' : index === 2 ? 'var(--amber-deep)' : 'var(--ink-mute)',
                        }}
                      >
                        {index + 1}
                      </div>
                      <div
                        className="w-8 h-8 flex items-center justify-center text-[11px] font-black shrink-0"
                        style={{
                          background: 'var(--bg-soft)',
                          border: '1px solid var(--line)',
                          color: 'var(--ink-soft)',
                          borderRadius: '2px',
                        }}
                      >
                        {(entry.display_name || 'P').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 font-bold text-sm" style={{ color: 'var(--ink)' }}>
                        {entry.display_name || `Player ${entry.user_id?.slice(0, 6)}`}
                      </div>
                      <div className="text-right">
                        <div
                          style={{
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: '1.15rem',
                            lineHeight: 1,
                            color: 'var(--ink)',
                          }}
                        >
                          {entry.total_score.toLocaleString()}
                        </div>
                        <div className="font-mono text-[0.58rem] tracking-[0.1em] uppercase mt-1" style={{ color: 'var(--ink-mute) '}}>
                          {entry.streak_count}d streak
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-16 text-center italic" style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', color: 'var(--ink-mute)' }}>
                    No scores yet — be the first to sign the ledger.
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-5">
              {/* How points work */}
              <div className="p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--line)' }}>
                <div className="font-mono text-[0.6rem] font-bold tracking-[0.25em] uppercase mb-1" style={{ color: 'var(--amber)' }}>
                  ★ Scoring
                </div>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.35rem', fontStyle: 'italic', color: 'var(--ink)', marginBottom: '1rem' }}>
                  How points work
                </h3>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Correct answer',  pts: '+100',      accent: 'var(--amber)' },
                    { label: 'Daily challenge', pts: '2× points', accent: 'var(--rust)' },
                    { label: 'Streak bonus',    pts: '+50 / day', accent: 'var(--amber)' },
                    { label: 'Speed bonus',     pts: 'up to +50', accent: 'var(--amber-bright)' },
                    { label: 'Wrong answer',    pts: '−25',       accent: 'var(--ink-mute)' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between text-sm py-2" style={{ borderBottom: '1px dashed var(--line)' }}>
                      <span style={{ color: 'var(--ink-soft)' }}>{row.label}</span>
                      <span className="font-mono text-[0.78rem] font-bold tracking-wide" style={{ color: row.accent }}>{row.pts}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coming soon */}
              <div className="p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--line)' }}>
                <div className="font-mono text-[0.6rem] font-bold tracking-[0.25em] uppercase mb-1" style={{ color: 'var(--rust)' }}>
                  ★ In Development
                </div>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.35rem', fontStyle: 'italic', color: 'var(--ink)', marginBottom: '1rem' }}>
                  Coming soon
                </h3>
                <div className="flex flex-col gap-4">
                  {[
                    { icon: HandshakeIcon, title: 'Head to Head',   desc: 'Challenge a friend in real time' },
                    { icon: GridIcon,      title: 'Immaculate Grid', desc: 'Classic 3×3 crossword format' },
                    { icon: CalendarIcon,  title: 'Draft Simulator', desc: 'Build your all-time roster' },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 flex items-center justify-center shrink-0"
                          style={{ background: 'var(--bg-soft)', border: '1px solid var(--line)', color: 'var(--amber)', borderRadius: '2px' }}
                        >
                          <Icon />
                        </div>
                        <div>
                          <div className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{item.title}</div>
                          <div className="text-[0.72rem]" style={{ color: 'var(--ink-mute)' }}>{item.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ═══ CTA BANNER ═══ */}
          <section
            className="relative px-8 sm:px-12 py-14 sm:py-16 text-center mb-20 overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, var(--bg-card) 0%, var(--bg-soft) 100%)',
              border: '1px solid var(--line)',
            }}
          >
            <div
              className="absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(232, 168, 75, 0.15) 0%, transparent 70%)' }}
            />
            <div className="relative">
              <div
                className="inline-flex items-center gap-2 mb-5 px-3 py-1.5"
                style={{ background: 'rgba(232, 168, 75, 0.08)', border: '1px solid rgba(232, 168, 75, 0.25)', borderRadius: '2px' }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--rust)' }} />
                <span className="font-mono text-[0.68rem] font-bold tracking-[0.25em] uppercase" style={{ color: 'var(--amber)' }}>
                  Free to play · Always
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
                  lineHeight: 1.05,
                  letterSpacing: '-0.015em',
                  color: 'var(--ink)',
                  marginBottom: '1rem',
                }}
              >
                Think you <span style={{ fontStyle: 'italic', color: 'var(--amber)' }}>know</span> the NFL?
              </h2>
              <p
                className="mx-auto mb-8 text-base leading-relaxed italic"
                style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--ink-soft)', maxWidth: '36ch' }}
              >
                Create a free account to save your streak, track progress across all 9 games, and appear on the leaderboard.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-3 px-8 py-4 font-bold transition-all hover:-translate-y-0.5"
                style={{
                  background: 'var(--amber)',
                  color: 'var(--bg)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '0.95rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  borderRadius: '2px',
                  boxShadow: '0 10px 25px rgba(232, 168, 75, 0.15)',
                }}
              >
                <span>Start playing free</span>
                <span>→</span>
              </Link>
            </div>
          </section>

          {/* ═══ FOOTER ═══ */}
          <footer
            className="pt-8 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ borderTop: '1px solid var(--line)' }}
          >
            <div className="flex items-center gap-3">
              <span style={{ color: 'var(--amber)' }}><FootballIcon /></span>
              <div>
                <div className="font-mono text-[0.68rem] font-bold tracking-[0.22em] uppercase" style={{ color: 'var(--ink-soft)' }}>
                  NFL MINIGAMES HUB
                </div>
                <div className="font-mono text-[0.6rem] tracking-[0.15em] uppercase mt-0.5" style={{ color: 'var(--ink-mute)' }}>
                  All free · New daily challenges
                </div>
              </div>
            </div>
            <div className="flex gap-8 font-mono text-[0.68rem] font-bold tracking-[0.18em] uppercase" style={{ color: 'var(--ink-mute)' }}>
              <span className="cursor-pointer transition-colors hover:text-[var(--amber)]">About</span>
              <span className="cursor-pointer transition-colors hover:text-[var(--amber)]">Submit an idea</span>
              <span className="cursor-pointer transition-colors hover:text-[var(--amber)]">Twitter / X</span>
            </div>
          </footer>
        </div>

      </div>
    </>
  );
}

// ─── SUBCOMPONENTS ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="px-5 py-4 min-w-[130px]"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--line)',
        borderTop: '2px solid var(--amber)',
      }}
    >
      <div className="flex items-center gap-1.5 mb-1" style={{ color: 'var(--ink-mute)' }}>
        {icon}
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] font-bold">{label}</span>
      </div>
      <div
        style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '2rem',
          lineHeight: 1,
          color: 'var(--ink)',
          letterSpacing: '-0.02em',
          marginTop: '0.3rem',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SectionHeader({ number, title, meta }: { number: string; title: string; meta: string }) {
  return (
    <div
      className="flex flex-wrap justify-between items-baseline gap-3 pb-4 mb-8"
      style={{ borderBottom: '3px double var(--line)' }}
    >
      <span className="font-mono text-[0.7rem] font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--amber)' }}>
        {number}
      </span>
      <h2
        style={{
          fontFamily: "'DM Serif Display', serif",
          fontStyle: 'italic',
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          letterSpacing: '-0.01em',
          color: 'var(--ink)',
          margin: 0,
        }}
      >
        {title}
      </h2>
      <span className="font-mono text-[0.68rem] tracking-[0.18em] uppercase" style={{ color: 'var(--ink-mute)' }}>
        {meta}
      </span>
    </div>
  );
}