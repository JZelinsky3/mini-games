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

    const supabase = await createClient();
    const { data: { user }, error: ue } = await supabase.auth.getUser();
    if (ue || !user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

    const { data: league, error: le } = await supabase
      .from('leagues').select('*').eq('id', leagueId).single();
    if (le || !league) return NextResponse.json({ error: 'League not found' }, { status: 404 });
    if (league.commissioner_id !== user.id)
      return NextResponse.json({ error: 'Not commissioner' }, { status: 403 });

    const activePhases = ['regular', 'gauntlet', 'finals'];
    if (!activePhases.includes(league.phase))
      return NextResponse.json({ error: 'League is not in an active phase' }, { status: 400 });

    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: allMembers } = await admin
      .from('league_members').select('*').eq('league_id', leagueId);
    if (!allMembers?.length)
      return NextResponse.json({ error: 'No members' }, { status: 400 });

    const members = league.phase === 'regular'
      ? allMembers
      : allMembers.filter((m: any) => m.playoff_active);
    const total = members.length;

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

    const ranked = [...members]
      .map((m: any) => ({ ...m, weekScore: scoreMap[m.id] ?? 0 }))
      .sort((a: any, b: any) => b.weekScore - a.weekScore);

    // Update pack tiers for active members
    for (let i = 0; i < ranked.length; i++) {
      await admin.from('league_members').update({
        next_pack_tier: packTierForRank(i + 1, total),
      }).eq('id', ranked[i].id);
    }

    await admin.from('league_draft_progress')
      .delete()
      .eq('league_id', leagueId)
      .eq('week_number', league.current_week)
      .eq('phase', league.phase);

    // ── REGULAR SEASON ─────────────────────────────────────────────────────

    if (league.phase === 'regular') {
      if (league.current_week >= 8) {
        // End of regular season — seed playoffs, reset playoff_score to 0
        const raw = league.playoff_size;
        const playoffSize = raw === 'half'
          ? Math.floor(allMembers.length / 2)
          : Math.min(parseInt(String(raw)) || Math.floor(allMembers.length / 2), allMembers.length);

        const allRanked = [...allMembers]
          .map((m: any) => ({ ...m, weekScore: scoreMap[m.id] ?? 0 }))
          .sort((a: any, b: any) => (b.team_score + b.weekScore) - (a.team_score + a.weekScore));

        for (let i = 0; i < allRanked.length; i++) {
          const inPlayoffs = i < playoffSize;
          await admin.from('league_members').update({
            team_score: scoreMap[allRanked[i].id] ?? allRanked[i].team_score ?? 0,
            playoff_active: inPlayoffs,
            playoff_seed: inPlayoffs ? i + 1 : null,
            playoff_score: 0,     // fresh playoff score starts at 0
            playoff_lock: null,   // clear any old playoff lock
          }).eq('id', allRanked[i].id);
        }

        // Issue 4: if only 2 playoff teams, skip gauntlet → go straight to finals
        const nextPhase = playoffSize <= 2 ? 'finals' : 'gauntlet';

        await admin.from('leagues').update({
          phase: nextPhase,
          current_week: 1,
        }).eq('id', leagueId);

        return NextResponse.json({ ok: true, advanced_to: nextPhase, playoff_size: playoffSize });
      } else {
        // Normal week advance
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

    // ── GAUNTLET ──────────────────────────────────────────────────────────

    if (league.phase === 'gauntlet') {
      // Accumulate playoff_score for this week
      for (const m of ranked) {
        const weekScore = scoreMap[m.id] ?? 0;
        await admin.from('league_members').update({
          playoff_score: (m.playoff_score ?? 0) + weekScore,
          next_pack_tier: packTierForRank(ranked.indexOf(m) + 1, total),
        }).eq('id', m.id);
      }

      // Re-rank by cumulative playoff_score to determine who advances
      const { data: freshMembers } = await admin
        .from('league_members').select('*')
        .eq('league_id', leagueId).eq('playoff_active', true);

      const reRanked = (freshMembers ?? [])
        .sort((a: any, b: any) => b.playoff_score - a.playoff_score);

      const finalistsCount = Math.ceil(total / 2);
      for (let i = 0; i < reRanked.length; i++) {
        const advances = i < finalistsCount;
        await admin.from('league_members').update({
          playoff_active: advances,
          playoff_seed: advances ? i + 1 : null,
        }).eq('id', reRanked[i].id);
      }

      await admin.from('leagues').update({
        phase: 'finals',
        current_week: 1,
      }).eq('id', leagueId);

      return NextResponse.json({ ok: true, advanced_to: 'finals', finalists: finalistsCount });
    }

    // ── FINALS ────────────────────────────────────────────────────────────

    if (league.phase === 'finals') {
      // Accumulate playoff_score for finals week
      for (const m of ranked) {
        const weekScore = scoreMap[m.id] ?? 0;
        await admin.from('league_members').update({
          playoff_score: (m.playoff_score ?? 0) + weekScore,
        }).eq('id', m.id);
      }

      // Champion = highest cumulative playoff_score in finals
      const { data: finalistsData } = await admin
        .from('league_members').select('*')
        .eq('league_id', leagueId).eq('playoff_active', true);

      const finalists = (finalistsData ?? [])
        .sort((a: any, b: any) => b.playoff_score - a.playoff_score);

      const champion = finalists[0];

      // Mark champion with seed 1, others get null seed
      for (let i = 0; i < finalists.length; i++) {
        await admin.from('league_members').update({
          playoff_seed: i === 0 ? 1 : null,
          playoff_active: i === 0,  // only champion stays active
        }).eq('id', finalists[i].id);
      }

      await admin.from('leagues').update({
        phase: 'complete',
      }).eq('id', leagueId);

      return NextResponse.json({
        ok: true,
        advanced_to: 'complete',
        champion_member_id: champion?.id,
        champion_score: champion?.playoff_score,
      });
    }

    return NextResponse.json({ error: 'Unexpected phase' }, { status: 400 });

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}