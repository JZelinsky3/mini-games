'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';

interface Player {
  name: string;
  position: string;
  rookie_season: number;
  last_season?: number;
  draft_round?: string;
  draft_pick?: string;
  draft_team?: string;
  headshot?: string;
  college_name?: string;
}

const TimelineBuilder = () => {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [userOrder, setUserOrder] = useState<Player[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctOrder, setCorrectOrder] = useState<Player[]>([]);
  const [mode, setMode] = useState<'easy' | 'hard' | 'extreme'>('easy');

  useEffect(() => {
    fetch('/players.csv')
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const parsed = (result.data as any[])
              .filter(p => p.display_name && p.rookie_season && p.position)
              .map(p => ({
                name: p.display_name.trim(),
                position: p.position,
                rookie_season: parseInt(p.rookie_season),
                last_season: p.last_season ? parseInt(p.last_season) : undefined,
                draft_round: p.draft_round || undefined,
                draft_pick: p.draft_pick || undefined,
                draft_team: p.draft_team || undefined,
                headshot: p.headshot || undefined,
                college_name: p.college_name || undefined,
              }));

            setAllPlayers(parsed);
            generateNewRound(parsed, 'easy');
          }
        });
      });
  }, []);

  const filterPlayersByMode = (players: Player[], selectedMode: 'easy' | 'hard' | 'extreme') => {
    const currentYear = 2026;
    const bigColleges = ['Alabama', 'Ohio State', 'LSU', 'Georgia', 'Texas', 'USC', 'Michigan', 'Florida', 'Clemson', 'Notre Dame', 'Oklahoma', 'Penn State', 'Wisconsin', 'Iowa', 'Oregon', 'Washington', 'Miami', 'Auburn', 'Tennessee'];

    if (selectedMode === 'easy') {
      return players.filter(p => {
        const lastPlayed = p.last_season || 0;
        const careerLength = (lastPlayed || currentYear) - p.rookie_season;
        const draftRound = p.draft_round ? parseInt(p.draft_round) : 999;
        const isBigCollege = bigColleges.some(c => p.college_name?.includes(c));
        return lastPlayed >= 2024 && careerLength >= 6 && draftRound <= 3 && isBigCollege;
      });
    } 
    else if (selectedMode === 'hard') {
      return players.filter(p => {
        const careerLength = (p.last_season || currentYear) - p.rookie_season;
        const draftRound = p.draft_round ? parseInt(p.draft_round) : 999;
        const lastPlayed = p.last_season || 0;
        const isBigCollege = bigColleges.some(c => p.college_name?.includes(c));
        const playedSince1990 = p.rookie_season >= 1990;

        const group1 = isBigCollege && careerLength > 11 && playedSince1990;
        const group2 = draftRound <= 1 && lastPlayed >= 2022;

        return group1 || group2;
      });
    } 
    else {
      return players;
    }
  };

  const sortByRookieWithTiebreakers = (players: Player[]) => {
    return [...players].sort((a, b) => {
      if (a.rookie_season !== b.rookie_season) return a.rookie_season - b.rookie_season;
      const roundA = a.draft_round ? parseInt(a.draft_round) : 999;
      const roundB = b.draft_round ? parseInt(b.draft_round) : 999;
      if (roundA !== roundB) return roundA - roundB;
      const pickA = a.draft_pick ? parseInt(a.draft_pick) : 999;
      const pickB = b.draft_pick ? parseInt(b.draft_pick) : 999;
      return pickA - pickB;
    });
  };

  const generateNewRound = (playersPool: Player[], selectedMode: 'easy' | 'hard' | 'extreme') => {
    const filtered = filterPlayersByMode(playersPool, selectedMode);
    const roundPlayers = [...filtered].sort(() => Math.random() - 0.5).slice(0, 8);

    setSelectedPlayers(roundPlayers);
    setAvailablePlayers([...roundPlayers].sort(() => Math.random() - 0.5));
    setUserOrder([]);
    setIsSubmitted(false);
    setScore(0);
    setCorrectOrder([]);
    setMode(selectedMode);
  };

  const handleDragStart = (e: React.DragEvent, player: Player, from: 'available' | 'timeline') => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ player, from }));
  };

  const handleDrop = (e: React.DragEvent, targetIndex?: number) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { player, from } = data;

      if (from === 'available' && !userOrder.some(p => p.name === player.name)) {
        const newOrder = [...userOrder];
        if (targetIndex !== undefined) newOrder.splice(targetIndex, 0, player);
        else newOrder.push(player);
        setUserOrder(newOrder);
        setAvailablePlayers(prev => prev.filter(p => p.name !== player.name));
      } else if (from === 'timeline' && targetIndex !== undefined) {
        const currentIndex = userOrder.findIndex(p => p.name === player.name);
        if (currentIndex === -1) return;
        const newOrder = [...userOrder];
        newOrder.splice(currentIndex, 1);
        newOrder.splice(targetIndex, 0, player);
        setUserOrder(newOrder);
      }
    } catch (_) {}
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const removeFromTimeline = (player: Player) => {
    setUserOrder(prev => prev.filter(p => p.name !== player.name));
    setAvailablePlayers(prev => [...prev, player]);
  };

  const submitTimeline = () => {
    if (userOrder.length !== 8) {
      alert("Please add all 8 players to the timeline.");
      return;
    }

    const sortedCorrect = sortByRookieWithTiebreakers(selectedPlayers);
    setCorrectOrder(sortedCorrect);

    let correctCount = 0;
    userOrder.forEach((player, index) => {
      if (sortedCorrect[index]?.name === player.name) correctCount++;
    });

    setScore(Math.round((correctCount / 8) * 100));
    setIsSubmitted(true);
  };

  const modeDescriptions = {
    easy: "Current active players from major colleges, drafted in round 3 or earlier, with at least 6 seasons played.",
    hard: "Players from big schools with over 11 years of experience (since 1990), or recent first-round picks.",
    extreme: "All players in the database — from legends to one-game wonders."
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-zinc-400 hover:text-white">← Back to Games</Link>
          <h1 className="text-4xl font-bold">NFL Timeline Builder ⏳</h1>
          <button 
            onClick={() => generateNewRound(allPlayers, mode)}
            className="bg-zinc-800 hover:bg-zinc-700 px-6 py-2 rounded-xl"
          >
            New Round
          </button>
        </div>

        <div className="flex justify-center gap-3 mb-6 flex-wrap">
          {(['easy', 'hard', 'extreme'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); generateNewRound(allPlayers, m); }}
              className={`px-10 py-3 rounded-2xl font-semibold transition ${
                mode === m 
                  ? m === 'easy' ? 'bg-emerald-600' 
                  : m === 'hard' ? 'bg-orange-600' 
                  : 'bg-red-600'
                  : 'bg-zinc-800 hover:bg-zinc-700'
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        <div className="text-center text-zinc-400 text-sm max-w-2xl mx-auto mb-4">
          {modeDescriptions[mode]}
        </div>

        {!isSubmitted ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Available Players */}
            <div className="lg:col-span-5">
              <h3 className="text-zinc-400 mb-4 text-lg">Available Players</h3>
              <div className="grid grid-cols-2 gap-3">
                {availablePlayers.map(player => (
                  <div
                    key={player.name}
                    draggable
                    onDragStart={(e) => handleDragStart(e, player, 'available')}
                    onClick={() => {
                      if (!userOrder.some(p => p.name === player.name)) {
                        setUserOrder([...userOrder, player]);
                        setAvailablePlayers(prev => prev.filter(p => p.name !== player.name));
                      }
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-emerald-500 p-3 rounded-2xl cursor-grab active:cursor-grabbing transition flex flex-col items-center text-center"
                  >
                    {player.headshot && (
                      <img 
                        src={player.headshot} 
                        alt={player.name} 
                        className="w-16 h-16 rounded-full object-cover mb-2 border border-zinc-700" 
                      />
                    )}
                    <div className="font-medium text-sm text-center">{player.name}</div>
                    <div className="text-[10px] text-zinc-500 mt-1">
                      {player.position} • {player.draft_team || '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Your Timeline */}
            <div className="lg:col-span-7">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-zinc-400 text-lg">Your Timeline</h3>
                <span className="text-sm text-zinc-500">Earliest → Latest (Rookie Year)</span>
              </div>

              <div 
                className="min-h-[560px] bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-3xl p-8"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e)}
              >
                {userOrder.length === 0 ? (
                  <div className="text-center py-32 text-zinc-500">Drag or click players from the left</div>
                ) : (
                  <div className="space-y-3">
                    {userOrder.map((player, index) => (
                      <div
                        key={index}
                        draggable
                        onDragStart={(e) => handleDragStart(e, player, 'timeline')}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="flex items-center gap-4 bg-zinc-800 p-4 rounded-2xl group"
                      >
                        <div className="font-mono text-zinc-500 w-6 text-lg">{index + 1}</div>
                        {player.headshot && (
                          <img src={player.headshot} alt={player.name} className="w-11 h-11 rounded-full object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{player.name}</div>
                          <div className="text-xs text-zinc-500">
                            {player.position} • {player.draft_team || '—'}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromTimeline(player)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 text-2xl px-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-center mt-8">
                <button
                  onClick={submitTimeline}
                  disabled={userOrder.length !== 8}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 px-16 py-5 rounded-2xl text-xl font-semibold"
                >
                  Submit Timeline
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Results View — full width, centered */
          <div className="max-w-3xl mx-auto">
            {/* Score header */}
            <div className="text-center mb-4">
              <div className="text-6xl mb-3">{score === 100 ? "🏆" : ""}</div>
              <p className="text-3xl font-bold">
                You scored <span className="text-emerald-400">{score}%</span>
              </p>
            </div>

            {/* Column labels */}
            <div className="flex items-center gap-3 mb-3 px-3">
              <div className="w-32 shrink-0 text-center text-xs text-zinc-500 uppercase tracking-wider">Your Guess</div>
              <div className="w-6 shrink-0" />
              <div className="flex-1 text-xs text-emerald-400 uppercase tracking-wider">Correct Order — Earliest to Latest</div>
            </div>

            {/* Result rows */}
            <div className="space-y-2">
              {correctOrder.map((player, index) => {
                const guessed = userOrder[index];
                const isCorrect = guessed?.name === player.name;

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-2xl border ${
                      isCorrect
                        ? 'border-emerald-500 bg-emerald-950/30'
                        : 'border-red-500 bg-red-950/30'
                    }`}
                  >
                    {/* Your guess — smaller thumbnail on the left */}
                    <div className={`flex items-center gap-1.5 w-42 shrink-0 rounded-xl px-2 py-1 ${isCorrect ? 'opacity-30' : 'bg-zinc-800/70'}`}>
                      {guessed?.headshot ? (
                        <img
                          src={guessed.headshot}
                          alt={guessed.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-zinc-700 shrink-0" />
                      )}
                      <span className="text-[10px] text-zinc-300 truncate leading-tight">{guessed?.name ?? '—'}</span>
                    </div>

                    {/* Indicator */}
                    <div className={`text-base shrink-0 w-6 text-center ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isCorrect ? '✓' : '→'}
                    </div>

                    {/* Correct player — larger, main result */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="font-mono text-zinc-500 text-sm w-4 shrink-0">{index + 1}</span>
                      {player.headshot && (
                        <img
                          src={player.headshot}
                          alt={player.name}
                          className="w-11 h-11 rounded-full object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{player.name}</div>
                        <div className="text-xs text-zinc-500 truncate">
                          {player.position} • {player.draft_team || '—'}
                        </div>
                      </div>
                      <div className="font-mono text-emerald-400 text-sm whitespace-nowrap shrink-0">
                        {player.rookie_season}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center mt-10">
              <button
                onClick={() => generateNewRound(allPlayers, mode)}
                className="bg-white text-black px-10 py-4 rounded-full font-semibold text-lg hover:bg-zinc-200"
              >
                Play New Round
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineBuilder;