'use server';

import { createClient } from '@/lib/supabase/server';

export async function saveGameProgress(gameId: string, score: number, isCorrect: boolean) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not logged in' };

  const today = new Date().toISOString().split('T')[0];

  // Get current progress
  let { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const newStreak = progress?.last_played_date === today 
    ? progress.streak_count 
    : (progress?.streak_count || 0) + (isCorrect ? 1 : 0);

  const newTotalScore = (progress?.total_score || 0) + score;
  const newGamesPlayed = (progress?.games_played || 0) + 1;

  // Update or insert
  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: user.id,
      streak_count: newStreak,
      last_played_date: today,
      total_score: newTotalScore,
      games_played: newGamesPlayed,
      high_scores: {
        ...(progress?.high_scores || {}),
        [gameId]: Math.max(progress?.high_scores?.[gameId] || 0, score)
      },
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error(error);
    return { success: false, error: error.message };
  }

  return { success: true, newStreak };
}