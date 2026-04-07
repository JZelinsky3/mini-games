// app/page.tsx
import Link from 'next/link';

const games = [
  {
    id: 'career-path',
    title: 'Career Path Guesser',
    emoji: '🛤️',
    desc: 'Guess the player from their team journey',
    color: 'from-blue-600 to-cyan-500',
  },
  {
    id: 'stat-shadow',
    title: 'Stat Shadow',
    emoji: '📊',
    desc: 'Reveal clues to guess the mystery player',
    color: 'from-purple-600 to-pink-500',
  },
  {
    id: 'timeline-builder',
    title: 'NFL Timeline Builder',
    emoji: '⏳',
    desc: 'Drag events into correct chronological order',
    color: 'from-amber-600 to-orange-500',
  },
  {
    id: 'penalty-flag',
    title: 'Penalty Flag',
    emoji: '🚩',
    desc: 'Spot the penalty in NFL play descriptions',
    color: 'from-red-600 to-rose-500',
  },
  {
    id: 'rivalry-chain',
    title: 'Rivalry Chain',
    emoji: '🔗',
    desc: 'Build the longest rival connection chain',
    color: 'from-emerald-600 to-teal-500',
  },
  {
    id: 'play-sim',
    title: 'Play Simulator',
    emoji: '🏈',
    desc: 'Mini text-based Madden drive simulator',
    color: 'from-green-600 to-lime-500',
  },
  {
    id: 'emoji-recap',
    title: 'Emoji Recap',
    emoji: '😎',
    desc: 'Guess the game from emoji stories',
    color: 'from-violet-600 to-fuchsia-500',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-16">
          <h1 className="text-7xl font-bold mb-4 tracking-tight">🏈 NFL MiniGames</h1>
          <p className="text-2xl text-zinc-400 max-w-2xl mx-auto">
            Fresh, addictive NFL mini-games you won't find everywhere.<br />
            Built for real fans who love trivia, tactics, and history.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="group bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-8 transition-all duration-300 flex flex-col h-full"
            >
              <div className={`text-7xl mb-6 transition-transform group-hover:scale-110`}>{game.emoji}</div>
              <h3 className="text-3xl font-semibold mb-3">{game.title}</h3>
              <p className="text-zinc-400 flex-1">{game.desc}</p>
              <div className="mt-8 inline-flex items-center text-sm font-medium text-emerald-400 group-hover:text-emerald-300">
                Play Now →
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-16 text-zinc-500 text-sm">
          More games coming soon • All free • New daily challenges
        </div>
      </div>
    </div>
  );
}