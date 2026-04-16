// nfl-minigames-hub/app/api/new-season/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { leagueId } = await req.json();
    if (!leagueId) return NextResponse.json({ error: 'Missing leagueId' }, { status: 400 });

    const supabase = await createClient();
    const { data: { user }, error: ue } = await supabase.auth.getUser();
    if (ue || !user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

    const { data: league } = await supabase.from('leagues').select('*').eq('id', leagueId).single();
    if (!league) return NextResponse.json({ error: 'League not found' }, { status: 404 });
    if (league.commissioner_id !== user.id)
      return NextResponse.json({ error: 'Not commissioner' }, { status: 403 });
    if (league.phase !== 'complete')
      return NextResponse.json({ error: 'Season is not complete yet' }, { status: 400 });

    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const newSeasonNumber = (league.season_number ?? 1) + 1;

    // Reset the league to pregame with incremented season number
    await admin.from('leagues').update({
      phase: 'regular',        // jump straight to regular so commish can start fresh
      current_week: 0,         // 0 = pregame effectively; commish presses START to go to week 1
      season_number: newSeasonNumber,
    }).eq('id', leagueId);

    // Actually set to pregame so members can see the start button
    await admin.from('leagues').update({ phase: 'pregame', current_week: 1 }).eq('id', leagueId);

    // Reset all members: clear scores, locks, playoff data, pack tier
    const { data: members } = await admin
      .from('league_members').select('id').eq('league_id', leagueId);

    for (const m of (members ?? [])) {
      await admin.from('league_members').update({
        team_score: 0,
        playoff_score: 0,
        next_pack_tier: 'standard_pack',
        permanent_locks: [],
        playoff_lock: null,
        playoff_active: false,
        playoff_seed: null,
      }).eq('id', m.id);
    }

    // Delete all draft progress for this league (old season's in-progress drafts)
    await admin.from('league_draft_progress').delete().eq('league_id', leagueId);

    // Note: we do NOT delete league_drafts — they stay as historical record
    // Drafts are filtered by week_number + phase so they won't interfere

    return NextResponse.json({ ok: true, season_number: newSeasonNumber });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}