'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUser(user);

        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          setError(error.message);
        }

        setProgress(data || {
          streak_count: 0,
          total_score: 0,
          games_played: 0,
          high_scores: {}
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white text-xl">
        Loading your stats...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-12">
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <Link href="/" className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-2 mb-8">
          ← Back to Home
        </Link>

        <div className="flex items-center gap-6 mb-10">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl flex items-center justify-center text-5xl shadow-xl">
            {user?.user_metadata?.full_name?.[0] || '🏈'}
          </div>
          <div>
            <h1 className="text-5xl font-black">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </h1>
            <p className="text-zinc-500 mt-1">{user?.email}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
            <div className="text-6xl font-black text-orange-400 mb-2">
              {progress?.streak_count || 0}
            </div>
            <div className="uppercase text-sm tracking-widest text-orange-400">Day Streak</div>
            <div className="text-3xl mt-2">🔥</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
            <div className="text-6xl font-black text-emerald-400 mb-2">
              {(progress?.total_score || 0).toLocaleString()}
            </div>
            <div className="uppercase text-sm tracking-widest text-emerald-400">Total Score</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
            <div className="text-6xl font-black text-cyan-400 mb-2">
              {progress?.games_played || 0}
            </div>
            <div className="uppercase text-sm tracking-widest text-cyan-400">Games Played</div>
          </div>
        </div>

        {/* High Scores */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-6">Your High Scores</h2>
          
          {progress?.high_scores && Object.keys(progress.high_scores).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(progress.high_scores).map(([gameId, score]) => (
                <div 
                  key={gameId} 
                  className="flex justify-between items-center py-4 border-b border-zinc-800 last:border-none"
                >
                  <span className="capitalize text-lg font-medium">
                    {gameId.replace(/-/g, ' ')}
                  </span>
                  <span className="font-bold text-2xl text-emerald-400">
                    {(score as number).toLocaleString()} pts
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-zinc-500">
              <div className="text-5xl mb-4">🏈</div>
              <p className="text-lg">No high scores yet</p>
              <p className="text-sm mt-2">Play some games to fill this up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}