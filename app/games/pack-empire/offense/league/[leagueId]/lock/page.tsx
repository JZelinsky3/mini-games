'use client';
// nfl-minigames-hub/app/games/pack-empire/offense/league/[leagueId]/lock/page.tsx
// Shown after midnight reveal — member picks one player from last week's roster to lock.

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getLeague, getMyMembership, saveLockChoice, savePermanentLock } from '@/lib/league/db';
import type { DBLeague, DBLeagueMember } from '@/lib/league/db';

const supabase = createClient();

type Rarity = 'common' | 'rare' | 'dynasty' | 'transcendent' | 'immortal';
interface Player { id: string; name: string; pos: string; team: string; score: number; rarity: Rarity; accolades: string[]; }

const RC: Record<Rarity, { color: string }> = {
  common:       { color: '#c87840' },
  rare:         { color: '#42c0f8' },
  dynasty:      { color: '#ffd700' },
  transcendent: { color: '#e040ff' },
  immortal:     { color: '#28dc78' },
};

// Lock border colors — cycles through gold, near-black, dark green per week
const LOCK_COLORS = ['#c8a020', '#1a3020', '#1a4020'];

export default function LockPickPage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const router = useRouter();

  const [userId, setUserId]   = useState<string | null>(null);
  const [league, setLeague]   = useState<DBLeague | null>(null);
  const [me, setMe]           = useState<DBLeagueMember | null>(null);
  const [lastRoster, setLastRoster] = useState<Player[]>([]);
  const [alreadyLocked, setAlreadyLocked] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      setUserId(user.id);

      const [lg, membership] = await Promise.all([
        getLeague(leagueId),
        getMyMembership(leagueId, user.id),
      ]);
      setLeague(lg);
      setMe(membership);

      if (membership) {
        const locks = membership.permanent_locks as Player[];
        setAlreadyLocked(locks.map(p => p.id));

        // Load last week's draft roster
        const prevWeek = (lg?.current_week ?? 2) - 1;
        const { data: draft } = await supabase
          .from('league_drafts')
          .select('roster, locked_this_week, id')
          .eq('league_id', leagueId)
          .eq('user_id', user.id)
          .eq('week_number', prevWeek)
          .eq('phase', 'regular')
          .single();

        if (draft) {
          setLastRoster((draft.roster as Player[]) ?? []);
          // If already picked this week, redirect
          if (draft.locked_this_week) {
            router.replace(`/games/pack-empire/offense/league/${leagueId}`);
          }
        }
      }

      setLoading(false);
    })();
  }, [leagueId]);

  async function handleConfirm() {
    if (!selected || !me || !userId) return;
    setSaving(true);

    try {
      // Get the draft id for last week
      const prevWeek = (league?.current_week ?? 2) - 1;
      const { data: draft } = await supabase
        .from('league_drafts')
        .select('id')
        .eq('league_id', leagueId)
        .eq('user_id', userId)
        .eq('week_number', prevWeek)
        .eq('phase', 'regular')
        .single();

      if (!draft) throw new Error('Draft not found');

      // Save lock choice on the draft
      await saveLockChoice(draft.id, selected);

      // Add to permanent_locks on member
      const player = lastRoster.find(p => p.id === selected)!;
      const newLocks = [...(me.permanent_locks as Player[]), player];
      await savePermanentLock(me.id, newLocks);

      router.push(`/games/pack-empire/offense/league/${leagueId}`);
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  }

  if (loading) return <div className="pe-lg-loading">Loading…</div>;
  if (!league || !me) return <div className="pe-lg-loading">Not found.</div>;

  const lockWeekIndex = (me.permanent_locks as any[]).length % LOCK_COLORS.length;
  const lockColor = LOCK_COLORS[lockWeekIndex];

  const eligible = lastRoster.filter(p => !alreadyLocked.includes(p.id));

  return (
    <>
      <div className="pe-lock-wrap">
        <div className="pe-lg-eyebrow">WEEK {(league.current_week) - 1} COMPLETE</div>
        <h1 className="pe-lock-title">LOCK A PLAYER</h1>
        <p className="pe-lock-sub">
          Pick one player from last week's roster to lock into your team for the rest of the season.
          Locked players cannot be changed and don't take up a pack slot.
        </p>

        <div className="pe-lock-count">
          {(me.permanent_locks as any[]).length} / 8 locked
        </div>

        {eligible.length === 0 ? (
          <div className="pe-lg-loading">No eligible players found from last week.</div>
        ) : (
          <div className="pe-lock-grid">
            {eligible.map(player => {
              const isSelected = selected === player.id;
              const rc = RC[player.rarity] ?? RC.common;
              return (
                <button
                  key={player.id}
                  className={`pe-lock-card ${isSelected ? 'selected' : ''}`}
                  style={{
                    '--rc': rc.color,
                    '--lock-color': lockColor,
                  } as React.CSSProperties}
                  onClick={() => setSelected(isSelected ? null : player.id)}
                >
                  <div className="pe-lock-card-pos">{player.pos}</div>
                  <div className="pe-lock-card-name">{player.name}</div>
                  <div className="pe-lock-card-team">{player.team}</div>
                  <div className="pe-lock-card-score">{player.score.toLocaleString()}</div>
                  <div className="pe-lock-card-rarity" style={{ color: rc.color }}>
                    {player.rarity.toUpperCase()}
                  </div>
                  {isSelected && <div className="pe-lock-card-check">🔒 SELECTED</div>}
                </button>
              );
            })}
          </div>
        )}

        {selected && (
          <div className="pe-lock-confirm-bar">
            <div className="pe-lock-confirm-name">
              🔒 {lastRoster.find(p => p.id === selected)?.name}
            </div>
            <button
              className="pe-lg-create-btn pe-lock-confirm-btn"
              onClick={handleConfirm}
              disabled={saving}
            >
              {saving ? 'SAVING…' : 'LOCK THIS PLAYER'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .pe-lock-wrap{max-width:600px;margin:0 auto;padding:1.5rem 1rem 5rem;font-family:'Barlow Condensed',sans-serif}
        .pe-lg-eyebrow{font-size:.65rem;letter-spacing:.22em;color:#2a5070}
        .pe-lg-loading{color:#3a6080;text-align:center;padding:2rem;font-family:'Barlow Condensed',sans-serif}
        .pe-lock-title{font-family:'Orbitron',sans-serif;font-size:1.4rem;font-weight:800;color:#d4e8f8;margin:.1rem 0 .5rem}
        .pe-lock-sub{color:#3a6080;font-size:.85rem;line-height:1.5;margin-bottom:.8rem}
        .pe-lock-count{font-size:.68rem;letter-spacing:.14em;color:#2a5070;margin-bottom:1rem;border:1px solid #0d1835;border-radius:4px;display:inline-block;padding:.2rem .5rem}

        .pe-lock-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:.5rem;margin-bottom:5rem}
        .pe-lock-card{background:rgba(8,14,30,.9);border:1px solid #0d1835;border-radius:10px;padding:.8rem .7rem;text-align:left;cursor:pointer;transition:.15s;position:relative;overflow:hidden;font-family:'Barlow Condensed',sans-serif}
        .pe-lock-card:hover{border-color:var(--rc)}
        .pe-lock-card.selected{border:2px solid var(--lock-color);box-shadow:0 0 12px rgba(0,0,0,.5);background:rgba(12,20,42,.95)}
        .pe-lock-card-pos{font-size:.6rem;letter-spacing:.14em;color:#2a5070;margin-bottom:.2rem}
        .pe-lock-card-name{font-weight:700;font-size:.9rem;color:#d4e8f8;line-height:1.2;margin-bottom:.2rem}
        .pe-lock-card-team{font-size:.68rem;color:#2a5070;margin-bottom:.4rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .pe-lock-card-score{font-family:'Orbitron',sans-serif;font-size:.75rem;color:var(--rc);font-weight:700}
        .pe-lock-card-rarity{font-size:.58rem;letter-spacing:.12em;margin-top:.15rem}
        .pe-lock-card-check{position:absolute;top:.4rem;right:.4rem;font-size:.6rem;letter-spacing:.08em;color:var(--lock-color)}

        .pe-lock-confirm-bar{position:fixed;bottom:0;left:0;right:0;background:rgba(4,8,18,.97);border-top:1px solid rgba(255,215,0,.2);padding:1rem;display:flex;align-items:center;gap:1rem;z-index:50}
        .pe-lock-confirm-name{flex:1;font-weight:700;font-size:.95rem;color:#d4e8f8}
        .pe-lock-confirm-btn{background:linear-gradient(135deg,#a07020,#ffd700);color:#050a18;border:none;border-radius:8px;padding:.7rem 1.2rem;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.88rem;letter-spacing:.1em;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:.2s}
        .pe-lock-confirm-btn:hover:not(:disabled){filter:brightness(1.1)}
        .pe-lock-confirm-btn:disabled{opacity:.5;cursor:default}
      `}</style>
    </>
  );
}