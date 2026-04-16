// nfl-minigames-hub/app/api/advance-week/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

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

    // Cookie client just for auth check
    const supabase = await createClient();
    const { data: { user }, error: ue } = await supabase.auth.getUser();
    if (ue || !user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

    const { data: league, error: le } = await supabase
      .from('leagues').select('*').eq('id', leagueId).single();
    if (le || !league) return NextResponse.json({ error: 'League not found' }, { status: 404 });
    if (league.commissioner_id !== user.id)
      return NextResponse.json({ error: 'Not commissioner' }, { status: 403 });

    // Must be in an active phase
    const activePhases = ['regular', 'gauntlet', 'finals'];
    if (!activePhases.includes(league.phase))
      return NextResponse.json({ error: 'League is not in an active phase' }, { status: 400 });

    // Service role for all DB ops — bypasses RLS
    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: allMembers } = await admin
      .from('league_members').select('*').eq('league_id', leagueId);
    if (!allMembers?.length)
      return NextResponse.json({ error: 'No members' }, { status: 400 });

    // For playoffs only count active (seeded) members
    const members = league.phase === 'regular'
      ? allMembers
      : allMembers.filter((m: any) => m.playoff_active);
    const total = members.length;

    // Read drafts for this week + phase
    const { data: drafts } = await admin
      .from('league_drafts')
      .select('member_id, final_score')
      .eq('league_id', leagueId)
      .eq('week_number', league.current_week)
      .eq('phase', league.phase);

    const scoreMap: Record<string, number> = {};
    for (const d of (drafts ?? [])) {
      scoreMap[d.member_id] = d.final_score ?? 0;
    }

    // Rank playoff members by this week's score
    const ranked = [...members]
      .map((m: any) => ({ ...m, weekScore: scoreMap[m.id] ?? 0 }))
      .sort((a: any, b: any) => b.weekScore - a.weekScore);

    // Update pack tiers for active members
    for (let i = 0; i < ranked.length; i++) {
      await admin.from('league_members').update({
        next_pack_tier: packTierForRank(i + 1, total),
      }).eq('id', ranked[i].id);
    }

    // Clear draft progress
    await admin.from('league_draft_progress')
      .delete()
      .eq('league_id', leagueId)
      .eq('week_number', league.current_week)
      .eq('phase', league.phase);

    // ── Phase transitions ──────────────────────────────────────────────────

    if (league.phase === 'regular') {
      if (league.current_week >= 8) {
        // End of regular season → seed playoffs
        const raw = league.playoff_size;
        const playoffSize = raw === 'half'
          ? Math.floor(allMembers.length / 2)
          : Math.min(parseInt(String(raw)) || Math.floor(allMembers.length / 2), allMembers.length);

        // Rank ALL members by cumulative team_score for seeding
        const allRanked = [...allMembers]
          .map((m: any) => ({ ...m, weekScore: scoreMap[m.id] ?? 0 }))
          .sort((a: any, b: any) => b.weekScore - a.weekScore);

        for (let i = 0; i < allRanked.length; i++) {
          const inPlayoffs = i < playoffSize;
          await admin.from('league_members').update({
            // Also save week 8 score
            team_score: scoreMap[allRanked[i].id] ?? allRanked[i].team_score ?? 0,
            playoff_active: inPlayoffs,
            playoff_seed: inPlayoffs ? i + 1 : null,
          }).eq('id', allRanked[i].id);
        }

        await admin.from('leagues').update({
          phase: 'gauntlet',
          current_week: 1,
        }).eq('id', leagueId);

        return NextResponse.json({ ok: true, advanced_to: 'gauntlet', playoff_size: playoffSize });
      } else {
        // Normal week advance — save scores too
        for (const m of ranked) {
          await admin.from('league_members').update({
            team_score: scoreMap[m.id] ?? m.team_score ?? 0,
          }).eq('id', m.id);
        }
        await admin.from('leagues').update({
          current_week: league.current_week + 1,
        }).eq('id', leagueId);
        return NextResponse.json({ ok: true, advanced_to: `week_${league.current_week + 1}` });
      }
    }

    if (league.phase === 'gauntlet') {
      if (total <= 2) {
        // Only 2 playoff teams — go straight to finals
        await admin.from('leagues').update({
          phase: 'finals',
          current_week: 1,
        }).eq('id', leagueId);
        return NextResponse.json({ ok: true, advanced_to: 'finals' });
      }

      // Eliminate bottom half, keep top half for finals
      const finalistsCount = Math.ceil(total / 2);
      for (let i = 0; i < ranked.length; i++) {
        const advances = i < finalistsCount;
        await admin.from('league_members').update({
          playoff_active: advances,
          playoff_seed: advances ? i + 1 : null,
        }).eq('id', ranked[i].id);
      }

      await admin.from('leagues').update({
        phase: 'finals',
        current_week: 1,
      }).eq('id', leagueId);

      return NextResponse.json({ ok: true, advanced_to: 'finals', finalists: finalistsCount });
    }

    if (league.phase === 'finals') {
      // Crown the champion — #1 seed wins
      const champion = ranked[0];
      await admin.from('league_members').update({
        playoff_seed: 1, // champion keeps seed 1
      }).eq('id', champion.id);

      await admin.from('leagues').update({
        phase: 'complete',
      }).eq('id', leagueId);

      return NextResponse.json({ ok: true, advanced_to: 'complete', champion_member_id: champion.id });
    }

    return NextResponse.json({ error: 'Unexpected phase' }, { status: 400 });

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}