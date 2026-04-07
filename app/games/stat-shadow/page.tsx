'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Player {
  name: string;
  career: string[];
  positions: string[];
  draftYear: number;
  notableFact?: string;
  clues: string[];   // We'll add good clues for each player
}

const StatShadow = () => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [revealedClues, setRevealedClues] = useState<number>(1);
  const [guess, setGuess] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState<number | null>(null);

    // Updated useEffect - fetches from public/players.json
  useEffect(() => {
    fetch('/players.json')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load players: ${res.status}`);
        }
        return res.json();
      })
      .then((data: any[]) => {
        // Filter to only players that have enough clues for the game
        // For now, we'll use the hardcoded players with good clues
        // You can later add "clues" field to your public/players.json

        const playersWithClues: Player[] = [
          {
            name: "Tom Brady",
            career: ["NE", "TB"],
            positions: ["QB"],
            draftYear: 2000,
            notableFact: "7x Super Bowl Champion",
            clues: [
              "Drafted in the 6th round (199th overall)",
              "Has won more Super Bowls than any other player in NFL history",
              "Played 20 seasons with the New England Patriots",
              "Led the Tampa Bay Buccaneers to a Super Bowl victory in his first season there",
              "Holds the record for most career passing touchdowns and passing yards"
            ]
          },
          {
            name: "Patrick Mahomes",
            career: ["KC"],
            positions: ["QB"],
            draftYear: 2017,
            notableFact: "3x Super Bowl MVP",
            clues: [
              "Won MVP in his first full season as a starter",
              "Known for his incredible arm talent and no-look passes",
              "Has already won multiple Super Bowls with the Kansas City Chiefs",
              "Son of a former Major League Baseball pitcher",
              "Led the league in passing yards and touchdowns multiple times"
            ]
          },
          {
            name: "DeAndre Hopkins",
            career: ["HOU", "ARI", "TEN", "KC"],
            positions: ["WR"],
            draftYear: 2013,
            notableFact: "4x Pro Bowler",
            clues: [
              "Nicknamed 'Nuk'",
              "Famous for his one-handed catches",
              "Played for the Houston Texans early in his career",
              "Was traded to the Arizona Cardinals and immediately became their top receiver",
              "Has over 10,000 career receiving yards"
            ]
          },
          {
            name: "Christian McCaffrey",
            career: ["CAR", "SF"],
            positions: ["RB"],
            draftYear: 2017,
            notableFact: "All-Purpose threat",
            clues: [
              "Extremely versatile — excels as both a runner and receiver",
              "Had one of the greatest fantasy football seasons ever in 2023",
              "Played college football at Stanford",
              "Traded from the Carolina Panthers to the San Francisco 49ers",
              "Son of former NFL player Ed McCaffrey"
            ]
          },
          {
            name: "Odell Beckham Jr",
            career: ["NYG", "CLE", "LAR", "BAL", "MIA"],
            positions: ["WR"],
            draftYear: 2014,
            notableFact: "3x Pro Bowler",
            clues: [
              "Famous for the 'catch' against the Cowboys in 2014",
              "Known for his flashy celebrations and style",
              "Has played for five different NFL teams",
              "Won a Super Bowl with the Los Angeles Rams",
              "Often called 'OBJ'"
            ]
          }
        ];

        const today = new Date().toISOString().split('T')[0];
        const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
        const index = seed % playersWithClues.length;

        setPlayer(playersWithClues[index]);
        resetGame();
      })
      .catch((err) => {
        console.error("Failed to load players:", err);
        setMessage("Error loading player data. Please refresh the page.");
      });
  }, []);

  const resetGame = () => {
    setRevealedClues(1);
    setGuess('');
    setIsCorrect(false);
    setMessage('');
    setScore(null);
  };

  const normalizeName = (name: string) => {
    return name.toLowerCase().trim().replace(/[^a-z\s]/g, '');
  };

  const isNameMatch = (guessName: string, correctName: string) => {
    const g = normalizeName(guessName);
    const c = normalizeName(correctName);
    const gParts = g.split(/\s+/);
    const cParts = c.split(/\s+/);

    if (gParts.length === 1) {
      return cParts.some(part => part.includes(gParts[0]) || gParts[0].includes(part));
    }
    return g === c || gParts.every(part => cParts.includes(part));
  };

  const handleGuess = () => {
    if (!player || !guess.trim()) return;

    const correct = isNameMatch(guess, player.name);

    if (correct) {
      setIsCorrect(true);
      const finalScore = Math.max(100 - (revealedClues - 1) * 15, 40);
      setScore(finalScore);
      setMessage(`🎉 Correct! You guessed ${player.name} using ${revealedClues} clues.`);
    } else {
      if (revealedClues < player.clues.length) {
        setRevealedClues(revealedClues + 1);
        setMessage("Not quite... Here's another clue.");
      } else {
        setMessage(`Game Over. The player was ${player.name}`);
      }
    }
    setGuess('');
  };

  const revealMore = () => {
    if (player && revealedClues < player.clues.length) {
      setRevealedClues(revealedClues + 1);
    }
  };

  if (!player) {
    return <div className="text-center p-12 text-zinc-400">Loading today's Stat Shadow...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-zinc-400 hover:text-white flex items-center gap-2">
            ← Back to Hub
          </Link>
          <h1 className="text-4xl font-bold">Stat Shadow 📊</h1>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-10">
          <div className="text-center mb-8">
            <p className="text-zinc-400">Guess the NFL player from the revealed stats and clues</p>
            <div className="mt-2 text-sm text-emerald-400">
              Score: {score !== null ? score : '???'} points • Clues used: {revealedClues}
            </div>
          </div>

          {/* Clues Area */}
          <div className="space-y-4 mb-10">
            {player.clues.slice(0, revealedClues).map((clue, index) => (
              <div key={index} className="bg-zinc-950 border-l-4 border-emerald-500 pl-6 py-4 rounded-r-2xl">
                <span className="text-emerald-400 font-medium">Clue {index + 1}:</span> {clue}
              </div>
            ))}
          </div>

          {!isCorrect && (
            <div className="space-y-6">
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                placeholder="Who is this player? (first, last, or full name)"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-5 text-xl focus:outline-none focus:border-emerald-500"
              />

              <div className="flex gap-4">
                <button
                  onClick={handleGuess}
                  disabled={!guess.trim()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 py-5 rounded-2xl font-semibold text-lg"
                >
                  Submit Guess
                </button>
                <button
                  onClick={revealMore}
                  disabled={revealedClues >= player.clues.length}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 py-5 rounded-2xl font-semibold text-lg"
                >
                  Reveal Next Clue
                </button>
              </div>
            </div>
          )}

          {message && (
            <div className={`mt-10 p-8 rounded-3xl text-center text-2xl ${isCorrect ? 'bg-green-950 border border-green-500' : 'bg-zinc-800'}`}>
              {message}
              {isCorrect && player.notableFact && (
                <p className="text-lg text-zinc-400 mt-6">Notable Fact: {player.notableFact}</p>
              )}
              {isCorrect && (
                <button
                  onClick={resetGame}
                  className="mt-6 bg-zinc-700 hover:bg-zinc-600 px-8 py-3 rounded-xl text-sm"
                >
                  Play Again (New Player)
                </button>
              )}
            </div>
          )}
        </div>

        <div className="text-center mt-12 text-zinc-500 text-sm">
          New mystery player every day • The fewer clues you need, the higher your score
        </div>
      </div>
    </div>
  );
};

export default StatShadow;