'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';

interface Player {
  name: string;
  career: string[];        // team journey
  positions: string[];
  draftYear?: number;
  notableFact?: string;
}

const CareerPathGuesser = () => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [revealedSteps, setRevealedSteps] = useState<number>(1);
  const [guess, setGuess] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/players.csv')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load CSV');
        return res.text();
      })
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const rawPlayers = results.data as any[];

            // Transform CSV rows into game-friendly format
            const transformed: Player[] = rawPlayers
              .filter(row => row.display_name && row.position)
              .map(row => {
                const name = row.display_name.trim();
                const draftTeam = row.draft_team ? row.draft_team.trim() : '';
                const latestTeam = row.latest_team ? row.latest_team.trim() : '';

                // Build a simple career path (you can expand this later)
                let career: string[] = [];
                if (draftTeam) career.push(draftTeam);
                if (latestTeam && latestTeam !== draftTeam) career.push(latestTeam);

                // Fallback if career is empty
                if (career.length === 0) {
                  career = [row.latest_team || 'Unknown Team'];
                }

                return {
                  name,
                  career,
                  positions: [row.position].filter(Boolean),
                  draftYear: row.draft_year ? parseInt(row.draft_year) : undefined,
                  notableFact: row.college_name 
                    ? `College: ${row.college_name}` 
                    : undefined,
                };
              });

            console.log(`Loaded ${transformed.length} players from CSV`);

            // Daily player selection (same player every day)
            const today = new Date().toISOString().split('T')[0];
            const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
            const index = seed % transformed.length;

            setPlayer(transformed[index]);
            setRevealedSteps(1);
            setGuess('');
            setIsCorrect(false);
            setMessage('');
            setLoading(false);
          },
          error: (error: any) => {
            console.error(error);
            setMessage("Error parsing CSV file.");
            setLoading(false);
          }
        });
      })
      .catch(err => {
        console.error(err);
        setMessage("Could not load players.csv. Make sure it's in the public folder.");
        setLoading(false);
      });
  }, []);

  const normalizeName = (name: string) => 
    name.toLowerCase().trim().replace(/[^a-z\s]/g, '');

  const isNameMatch = (guessName: string, correctName: string) => {
    const g = normalizeName(guessName);
    const c = normalizeName(correctName);
    if (!g || !c) return false;

    const gParts = g.split(/\s+/).filter(Boolean);
    const cParts = c.split(/\s+/).filter(Boolean);

    if (gParts.length === 1) {
      return cParts.some(part => part === gParts[0]);
    }

    return g === c || gParts.every(part => cParts.includes(part));
  };

  const handleGuess = () => {
    if (!player || !guess.trim()) return;

    const correct = isNameMatch(guess, player.name);

    if (correct) {
      setIsCorrect(true);
      setMessage(`🎉 Correct! It's ${player.name}`);
    } else {
      if (revealedSteps < player.career.length) {
        setRevealedSteps(revealedSteps + 1);
        setMessage("Not quite... Here's another clue.");
      } else {
        setMessage(`Game Over. The player was ${player.name}`);
      }
    }
    setGuess('');
  };

  const revealMore = () => {
    if (player && revealedSteps < player.career.length) {
      setRevealedSteps(revealedSteps + 1);
    }
  };

  if (loading) {
    return <div className="text-center p-12 text-zinc-400">Loading today's Career Path from CSV...</div>;
  }

  if (!player) {
    return <div className="text-center p-12 text-red-400">{message || "No player data available"}</div>;
  }

  const visiblePath = player.career.slice(0, revealedSteps);

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-zinc-400 hover:text-white flex items-center gap-2">
            ← Back to Hub
          </Link>
          <h1 className="text-4xl font-bold">Career Path Guesser 🛤️</h1>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-10">
          <div className="text-center mb-10">
            <p className="text-zinc-400 text-lg">Guess the player from their team journey</p>
          </div>

          {/* Career Path */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 mb-10">
            <p className="text-sm text-zinc-500 mb-4">CAREER PATH REVEALED</p>
            <div className="flex flex-wrap gap-4 justify-center text-xl">
              {visiblePath.map((team, i) => (
                <div key={i} className="bg-zinc-800 px-6 py-3 rounded-xl font-medium">
                  {team}
                  {i < visiblePath.length - 1 && <span className="ml-3 text-zinc-600">→</span>}
                </div>
              ))}
              {revealedSteps < player.career.length && <div className="text-3xl text-zinc-600">⋯</div>}
            </div>
          </div>

          {!isCorrect && (
            <div className="space-y-6">
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                placeholder="Player name (first, last, or full)"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-5 text-xl focus:outline-none focus:border-emerald-500"
              />

              <div className="flex gap-4">
                <button
                  onClick={handleGuess}
                  disabled={!guess.trim()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 py-5 rounded-2xl font-semibold text-lg transition"
                >
                  Submit Guess
                </button>
                <button
                  onClick={revealMore}
                  disabled={revealedSteps >= player.career.length}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 py-5 rounded-2xl font-semibold text-lg transition"
                >
                  Reveal Next Team
                </button>
              </div>
            </div>
          )}

          {message && (
            <div className={`mt-10 p-8 rounded-3xl text-center text-2xl font-medium ${isCorrect ? 'bg-green-950 border border-green-500 text-green-300' : 'bg-zinc-800'}`}>
              {message}
              {isCorrect && player.notableFact && (
                <p className="text-lg text-zinc-400 mt-6">{player.notableFact}</p>
              )}
            </div>
          )}
        </div>

        <div className="text-center mt-12 text-zinc-500 text-sm">
          New player every day • Partial name accepted • Powered by your players.csv
        </div>
      </div>
    </div>
  );
};

export default CareerPathGuesser;