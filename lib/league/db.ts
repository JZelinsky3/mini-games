// nfl-minigames-hub/lib/league/db.ts
// All Supabase reads/writes for league mode. Import createClient from your existing path.

import { createClient } from '@/lib/supabase/client';
import type { PackTier } from './packs';
import type { ChemResult } from './chemistry';

// Lazy singleton — client is created on first call, not at module import time.
// This ensures localStorage is available when createBrowserClient reads the session.
// Module-level instantiation runs during SSR where localStorage doesn't exist,
// producing an unauthenticated client that makes auth.uid() return null in RLS.
let _client: ReturnType<typeof createClient> | null = null;
const sb = () => {
  if (!_client) _client = createClient();
  return _client;
};

// ─── Types mirroring DB rows ──────────────────────────────────────────────────

export interface DBLeague {
  id: string;
  name: string;
  commissioner_id: string;
  visibility: 'public' | 'invite';
  join_code: string;
  min_players: number;
  max_players: number;
  playoff_size: string;
  phase: 'pregame' | 'regular' | 'gauntlet' | 'finals' | 'complete';
  current_week: number;
  next_reset_at: string | null;
  created_at: string;
}

export interface DBLeagueMember {
  id: string;
  league_id: string;
  user_id: string;
  team_score: number;
  next_pack_tier: PackTier;
  permanent_locks: object[];
  team_name: string | null;
  playoff_active: boolean;
  playoff_seed: number | null;
  joined_at: string;
  // joined via query:
  profiles?: { username: string; avatar_url: string | null };
}

export interface DBLeagueDraft {
  id: string;
  league_id: string;
  member_id: string;
  user_id: string;
  week_number: number;
  phase: string;
  roster: object[];
  locked_player_ids: string[];
  draft_score: number;
  chemistry: ChemResult;
  final_score: number;
  pack_tier_earned: PackTier;
  locked_this_week: string | null;
  completed_at: string;
}

// ─── League CRUD ──────────────────────────────────────────────────────────────

export async function createLeague(params: {
  name: string;
  commissionerId: string;
  visibility: 'public' | 'invite';
  maxPlayers: number;
  playoffSize: string;
}): Promise<DBLeague> {
  const id       = Math.random().toString(36).slice(2, 8).toUpperCase();
  const joinCode = Math.random().toString(36).slice(2, 10).toUpperCase();

  const { data, error } = await sb()
    .from('leagues')
    .insert({
      id,
      name:            params.name,
      commissioner_id: params.commissionerId,
      visibility:      params.visibility,
      join_code:       joinCode,
      max_players:     params.maxPlayers,
      playoff_size:    params.playoffSize,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getLeague(leagueId: string): Promise<DBLeague | null> {
  const { data } = await sb()
    .from('leagues')
    .select('*')
    .eq('id', leagueId)
    .single();
  return data;
}

export async function getLeagueByJoinCode(code: string): Promise<DBLeague | null> {
  const { data } = await sb()
    .from('leagues')
    .select('*')
    .eq('join_code', code.toUpperCase())
    .single();
  return data;
}

/** All leagues the current user is in */
export async function getMyLeagues(userId: string): Promise<DBLeague[]> {
  const { data } = await sb()
    .from('league_members')
    .select('league_id, leagues(*)')
    .eq('user_id', userId);
  return (data ?? []).map((row: any) => row.leagues).filter(Boolean);
}

// ─── Members ─────────────────────────────────────────────────────────────────

export async function joinLeague(leagueId: string, userId: string): Promise<DBLeagueMember> {
  const { data, error } = await sb()
    .from('league_members')
    .upsert(
      { league_id: leagueId, user_id: userId },
      { onConflict: 'league_id,user_id', ignoreDuplicates: false }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getLeagueMembers(leagueId: string): Promise<DBLeagueMember[]> {
  const client = sb();
  const { data: { session } } = await client.auth.getSession();
  
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/league-members?leagueId=${leagueId}`,
    {
      headers: {
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      }
    }
  );
  
  if (!res.ok) return [];
  return res.json();
}

export async function getMyMembership(
  leagueId: string,
  userId: string,
): Promise<DBLeagueMember | null> {
  const { data } = await sb()
    .from('league_members')
    .select('*')
    .eq('league_id', leagueId)
    .eq('user_id', userId)
    .single();
  return data;
}

export async function updateMemberScore(
  memberId: string,
  teamScore: number,
  nextPackTier: PackTier,
): Promise<void> {
  await sb()
    .from('league_members')
    .update({ team_score: teamScore, next_pack_tier: nextPackTier })
    .eq('id', memberId);
}

export async function savePermanentLock(
  memberId: string,
  locks: object[],
): Promise<void> {
  await sb()
    .from('league_members')
    .update({ permanent_locks: locks })
    .eq('id', memberId);
}

// ─── Drafts ──────────────────────────────────────────────────────────────────

export async function submitDraft(params: {
  leagueId: string;
  memberId: string;
  userId: string;
  weekNumber: number;
  phase: string;
  roster: object[];
  lockedPlayerIds: string[];
  draftScore: number;
  chemistry: ChemResult;
  finalScore: number;
  packTierEarned: PackTier;
}): Promise<DBLeagueDraft> {
  const { data, error } = await sb()
    .from('league_drafts')
    .insert({
      league_id:         params.leagueId,
      member_id:         params.memberId,
      user_id:           params.userId,
      week_number:       params.weekNumber,
      phase:             params.phase,
      roster:            params.roster,
      locked_player_ids: params.lockedPlayerIds,
      draft_score:       params.draftScore,
      chemistry:         params.chemistry,
      final_score:       params.finalScore,
      pack_tier_earned:  params.packTierEarned,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** My draft for a specific week */
export async function getMyDraft(
  leagueId: string,
  memberId: string,
  weekNumber: number,
  phase: string,
): Promise<DBLeagueDraft | null> {
  const { data } = await sb()
    .from('league_drafts')
    .select('*')
    .eq('league_id', leagueId)
    .eq('member_id', memberId)
    .eq('week_number', weekNumber)
    .eq('phase', phase)
    .single();
  return data;
}

/** All revealed drafts for a league (previous weeks — RLS enforces this) */
export async function getRevealedDrafts(
  leagueId: string,
  weekNumber: number,
): Promise<DBLeagueDraft[]> {
  const { data } = await sb()
    .from('league_drafts')
    .select('*')
    .eq('league_id', leagueId)
    .eq('week_number', weekNumber);
  return data ?? [];
}

/** Save the player a member chose to lock after draft reveal */
export async function saveLockChoice(
  draftId: string,
  lockedPlayerId: string,
): Promise<void> {
  await sb()
    .from('league_drafts')
    .update({ locked_this_week: lockedPlayerId })
    .eq('id', draftId);
}

export async function updateTeamName(
  memberId: string,
  teamName: string,
): Promise<void> {
  const { error } = await sb()
    .from('league_members')
    .update({ team_name: teamName.trim() })
    .eq('id', memberId);
  if (error) throw error;
}

// ─── League phase / week updates (commissioner or server action) ──────────────

export async function advanceLeagueWeek(
  leagueId: string,
  nextWeek: number,
  nextResetAt: string,
): Promise<void> {
  await sb()
    .from('leagues')
    .update({ current_week: nextWeek, next_reset_at: nextResetAt })
    .eq('id', leagueId);
}

export async function setLeaguePhase(
  leagueId: string,
  phase: DBLeague['phase'],
): Promise<void> {
  await sb()
    .from('leagues')
    .update({ phase })
    .eq('id', leagueId);
}

export async function leaveLeague(leagueId: string, userId: string): Promise<void> {
  const { error } = await sb()
    .from('league_members')
    .delete()
    .eq('league_id', leagueId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function deleteLeague(leagueId: string): Promise<void> {
  const { error } = await sb()
    .from('leagues')
    .delete()
    .eq('id', leagueId);
  if (error) throw error;
}