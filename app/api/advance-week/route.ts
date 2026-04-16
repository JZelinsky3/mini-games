// nfl-minigames-hub/app/api/advance-week/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function packTierForRank(rank: number, total: number): string {
  if (rank === 1) return 'elite_drop';
  if (rank <= Math.max(2, Math.ceil(total * 0.2))) return 'prime_pack';
  if (rank <= Math.max(4, Math.ceil(total * 0.5))) return 'rising_pack';
  return 'standard_pack';
}

export async function POST(req: NextRequest) {
  try {
    const { leagueId } = await req.json();
    if (!leagueId) return NextResponse.json({ error: 'Missing leagueId' }, { status: 400 });

    const supabase = await createClient();

    // Verify auth
    const { data: { user }, error: ue } = await supabase.auth.getUser();
    if (ue || !user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

    // Load league
    const { data: league, error: le } = await supabase
      .from('leagues').select('*').eq('id', leagueId).single();
    if (le || !league) return NextResponse.json({ error: 'League not found' }, { status: 404 });
    if (league.commissioner_id !== user.id)
      return NextResponse.json({ error: 'Not commissioner' }, { status: 403 });
    if (league.phase !== 'regular')
      return NextResponse.json({ error: 'Only works during regular season' }, { status: 400 });

    // Load members
    const { data: members, error: me } = await supabase
      .from('league_members').select('*').eq('league_id', leagueId);
    if (me || !members?.length)
      return NextResponse.json({ error: 'No members' }, { status: 400 });
    const total = members.length;

    // Load drafts for this week
    const { data: drafts } = await supabase
      .from('league_drafts')
      .select('member_id, final_score')
      .eq('league_id', leagueId)
      .eq('week_number', league.current_week)
      .eq('phase', 'regular');

    // Build score map: member_id -> final_score
    const scoreMap: Record<string, number> = {};
    for (const d of (drafts ?? [])) {
      scoreMap[d.member_id] = d.final_score ?? 0;
    }

    // Rank members by this week's score
    const ranked = [...members]
      .map(m => ({ ...m, weekScore: scoreMap[m.id] ?? 0 }))
      .sort((a, b) => b.weekScore - a.weekScore);

    // Update each member's team_score and next_pack_tier
    for (let i = 0; i < ranked.length; i++) {
      const m = ranked[i];
      await supabase.from('league_members').update({
        team_score: scoreMap[m.id] ?? m.team_score ?? 0,
        next_pack_tier: packTierForRank(i + 1, total),
      }).eq('id', m.id);
    }

    // Clear draft progress for this week
    await supabase.from('league_draft_progress')
      .delete()
      .eq('league_id', leagueId)
      .eq('week_number', league.current_week)
      .eq('phase', 'regular');

    // Advance or transition to playoffs
    if (league.current_week >= 8) {
      const raw = league.playoff_size;
      const playoffSize = raw === 'half'
        ? Math.floor(total / 2)
        : Math.min(parseInt(String(raw)) || Math.floor(total / 2), total);

      for (let i = 0; i < ranked.length; i++) {
        const inPlayoffs = i < playoffSize;
        await supabase.from('league_members').update({
          playoff_active: inPlayoffs,
          playoff_seed: inPlayoffs ? i + 1 : null,
        }).eq('id', ranked[i].id);
      }

      await supabase.from('leagues').update({
        phase: 'gauntlet',
        current_week: 1,
      }).eq('id', leagueId);

      return NextResponse.json({ ok: true, advanced_to: 'gauntlet', playoff_size: playoffSize });
    } else {
      await supabase.from('leagues').update({
        current_week: league.current_week + 1,
      }).eq('id', leagueId);

      return NextResponse.json({ ok: true, advanced_to: `week_${league.current_week + 1}` });
    }
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}