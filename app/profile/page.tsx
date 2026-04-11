'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/* ─── Types ─────────────────────────────────────────────────────────── */
const GAME_LABELS: Record<string, string> = {
  'stat-shadow':      'Stat Shadow',
  'career-path':      'Career Path',
  'draft-day':        'Draft Day',
  'blitz-quiz':       'Blitz Quiz',
};

type Rarity = 'common' | 'rare' | 'dynasty' | 'transcendent' | 'immortal';
interface Player {
  id: string; name: string; pos: string; team: string;
  score: number; rarity: Rarity; accolades: string[];
}
interface SavedDraft {
  id: string; name: string; score: number; tier: string;
  icon: string; lineup: (Player | null)[]; timestamp: number;
}

const RC: Record<Rarity, { label: string; color: string; art: string }> = {
  common:       { label: 'COMMON',       color: '#c87840', art: 'linear-gradient(150deg,#3d2210,#7a4820)' },
  rare:         { label: 'RARE',         color: '#42c0f8', art: 'linear-gradient(150deg,#062840,#104870)' },
  dynasty:      { label: 'DYNASTY',      color: '#ffd700', art: 'linear-gradient(150deg,#3a2800,#806010)' },
  transcendent: { label: 'TRANSCENDENT', color: '#e040ff', art: 'linear-gradient(150deg,#280048,#6010b0)' },
  immortal:     { label: 'IMMORTAL',     color: '#28dc78', art: 'linear-gradient(150deg,#021a0a,#04401a)' },
};

const PE_TIERS = [
  { min: 20001, label: 'GOAT OFFENSE',      color: '#e040ff' },
  { min: 17001, label: 'HALL OF FAME',       color: '#ffd700' },
  { min: 14001, label: 'SUPER BOWL DYNASTY', color: '#f0c030' },
  { min: 11001, label: 'ALL-PRO ELITE',      color: '#42c0f8' },
  { min: 8001,  label: 'PRO BOWL CALIBER',   color: '#50d870' },
  { min: 5001,  label: 'STARTER QUALITY',    color: '#a0b8d0' },
  { min: 2001,  label: 'BACKUP UNIT',        color: '#808080' },
  { min: 0,     label: 'PRACTICE SQUAD',     color: '#e8a060' },
];

const SLOTS_SHORT = ['QB','HB','WR','WR','WR','TE','LT','LG','C','RG','RT'];

function getTierColor(label: string) {
  return PE_TIERS.find(t => t.label === label)?.color ?? '#3a6080';
}

function getDisplayName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  const suffixes = new Set(['jr.','jr','sr.','sr','ii','iii','iv','v','vi']);
  const last = parts[parts.length - 1];
  if (suffixes.has(last.toLowerCase()) && parts.length >= 3)
    return `${parts[parts.length - 2]} ${last}`;
  return last;
}

/* ─── Rank system ────────────────────────────────────────────────────── */
const RANK_TIERS = [
  { min: 10000, label: 'Hall of Famer', color: '#f59e0b', bg: '#451a03' },
  { min: 5000,  label: 'All-Pro',       color: '#a78bfa', bg: '#2e1065' },
  { min: 2000,  label: 'Pro Bowler',    color: '#34d399', bg: '#064e3b' },
  { min: 500,   label: 'Starter',       color: '#60a5fa', bg: '#1e3a5f' },
  { min: 0,     label: 'Rookie',        color: '#94a3b8', bg: '#1e293b' },
];

function getRank(totalScore: number) {
  return RANK_TIERS.find(t => totalScore >= t.min) ?? RANK_TIERS[RANK_TIERS.length - 1];
}

function getNextRank(totalScore: number) {
  const idx = RANK_TIERS.findIndex(t => totalScore >= t.min);
  return idx > 0 ? RANK_TIERS[idx - 1] : null;
}

/* ─── Sub-components ─────────────────────────────────────────────────── */
function RankBadge({ score }: { score: number }) {
  const rank = getRank(score);
  const next = getNextRank(score);
  const current = RANK_TIERS.find(t => score >= t.min) ?? RANK_TIERS[RANK_TIERS.length - 1];
  const currentMin = current.min;
  const nextMin = next?.min ?? currentMin;
  const progress = next
    ? Math.min(((score - currentMin) / (nextMin - currentMin)) * 100, 100)
    : 100;
  return (
    <div style={{ background: rank.bg, border: `1px solid ${rank.color}33`, borderRadius: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', color: rank.color, textTransform: 'uppercase', marginBottom: 4 }}>Current Rank</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: rank.color }}>{rank.label}</div>
        </div>
        <div style={{ width: 52, height: 52, borderRadius: '50%', border: `2px solid ${rank.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
          {rank.label === 'Hall of Famer' ? '🏆' : rank.label === 'All-Pro' ? '⭐' : rank.label === 'Pro Bowler' ? '🎯' : rank.label === 'Starter' ? '🏈' : '📋'}
        </div>
      </div>
      {next && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}>
            <span>{score.toLocaleString()} pts</span>
            <span>{next.min.toLocaleString()} for {next.label}</span>
          </div>
          <div style={{ height: 4, background: '#1e293b', borderRadius: 2 }}>
            <div style={{ height: '100%', background: rank.color, borderRadius: 2, width: `${progress}%`, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ value, label, color, suffix = '' }: { value: number | string; label: string; color: string; suffix?: string }) {
  return (
    <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 14, padding: '20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1.1 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </div>
      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
    </div>
  );
}

function HighScoreRow({ gameId, score }: { gameId: string; score: number }) {
  const label = GAME_LABELS[gameId] ?? gameId.replace(/-/g, ' ');
  return (
    <Link href={`/games/${gameId}`}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #1f2937', textDecoration: 'none', color: 'inherit', transition: 'opacity 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', flexShrink: 0 }} />
        <span style={{ fontWeight: 600, fontSize: 15 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontWeight: 700, color: '#34d399', fontSize: 17 }}>{score.toLocaleString()} pts</span>
        <span style={{ color: '#374151', fontSize: 12 }}>›</span>
      </div>
    </Link>
  );
}

/* ─── Tiny card for draft preview ───────────────────────────────────── */
function TinyCard({ player, slotShort }: { player: Player | null; slotShort: string }) {
  if (!player) return (
    <div style={{ width: 52, height: 76, borderRadius: 5, background: 'rgba(8,14,30,.8)', border: '1px solid #0d1835', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: 8, color: '#1a3050', fontFamily: 'monospace' }}>{slotShort}</span>
    </div>
  );
  const rc = RC[player.rarity] ?? RC.common;
  return (
    <div style={{ width: 52, height: 76, borderRadius: 5, overflow: 'hidden', flexShrink: 0, border: `1.5px solid ${rc.color}`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 11, background: 'rgba(4,8,16,.95)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3px', flexShrink: 0 }}>
        <span style={{ fontSize: 6, fontWeight: 800, color: '#fff', background: rc.color, padding: '0 3px', borderRadius: 1 }}>{player.pos}</span>
      </div>
      <div style={{ flex: 1, background: rc.art, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <span style={{ fontSize: 18, fontWeight: 900, color: 'rgba(255,255,255,.12)', fontFamily: 'monospace' }}>{player.name.charAt(0)}</span>
      </div>
      <div style={{ padding: '2px 3px', background: 'rgba(4,8,16,.95)', borderTop: `1px solid ${rc.color}`, flexShrink: 0 }}>
        <div style={{ fontSize: 7, fontWeight: 800, color: rc.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getDisplayName(player.name)}</div>
        <div style={{ fontSize: 7, color: '#d4e8f8', fontFamily: 'monospace', fontWeight: 900 }}>{player.score.toLocaleString()}</div>
      </div>
    </div>
  );
}

/* ─── Saved draft card ───────────────────────────────────────────────── */
function SavedDraftCard({ draft, onDelete }: { draft: SavedDraft; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const tierColor = getTierColor(draft.tier);
  const date = new Date(draft.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ background: '#0b1120', border: '1px solid #1f2937', borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
      {/* Header row */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#f9fafb', marginBottom: 2 }}>{draft.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: tierColor }}>{draft.icon} {draft.tier}</span>
            <span style={{ fontSize: 11, color: '#4b5563' }}>·</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{draft.score.toLocaleString()} pts</span>
            <span style={{ fontSize: 11, color: '#4b5563' }}>·</span>
            <span style={{ fontSize: 11, color: '#4b5563' }}>{date}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={e => { e.stopPropagation(); onDelete(draft.id); }}
            style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: 13, padding: '4px 6px', borderRadius: 4, transition: 'color .15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = '#374151')}
          >✕</button>
          <span style={{ color: '#374151', fontSize: 12 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded lineup */}
      {expanded && (
        <div style={{ borderTop: '1px solid #1f2937', padding: '14px 18px', background: 'rgba(4,8,16,.5)' }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
            {draft.lineup.map((player, i) => (
              <TinyCard key={i} player={player} slotShort={SLOTS_SHORT[i] ?? '?'} />
            ))}
          </div>
          <Link
            href="/games/pack-empire/offense"
            style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, color: '#ffd700', textDecoration: 'none', letterSpacing: '.04em' }}
          >
            Play Again →
          </Link>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }
        setUser(user);

        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') setError(error.message);
        setProgress(data || { streak_count: 0, total_score: 0, games_played: 0, high_scores: {} });

        // load pack empire saved drafts from localStorage (keyed per user)
        try {
          const key = `pe-saved-drafts-${user.id}`;
          const raw = localStorage.getItem(key) || localStorage.getItem('pe-saved-drafts') || '[]';
          setSavedDrafts(JSON.parse(raw) as SavedDraft[]);
        } catch { }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const deleteDraft = (id: string) => {
    const updated = savedDrafts.filter(d => d.id !== id);
    setSavedDrafts(updated);
    // update both possible storage keys
    const key = user?.id ? `pe-saved-drafts-${user.id}` : 'pe-saved-drafts';
    localStorage.setItem(key, JSON.stringify(updated));
    localStorage.setItem('pe-saved-drafts', JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#4b5563', fontSize: 14 }}>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#ef4444' }}>Error: {error}</div>
      </div>
    );
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Player';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const totalScore = progress?.total_score ?? 0;
  const highScores = progress?.high_scores ?? {};
  const hasHighScores = Object.keys(highScores).length > 0;
  const bestGame = hasHighScores
    ? Object.entries(highScores).sort(([, a], [, b]) => (b as number) - (a as number))[0]
    : null;
  const bestDraft = savedDrafts.length > 0
    ? [...savedDrafts].sort((a, b) => b.score - a.score)[0]
    : null;

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Top nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ color: '#34d399', textDecoration: 'none', fontSize: 14 }}>← Home</Link>
          <button onClick={handleSignOut}
            style={{ background: 'transparent', border: '1px solid #1f2937', borderRadius: 8, color: '#6b7280', padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>
            Sign out
          </button>
        </div>

        {/* Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #065f46, #0c4a6e)', border: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#34d399', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.2 }}>{displayName}</div>
            <div style={{ fontSize: 13, color: '#4b5563', marginTop: 2 }}>{user?.email}</div>
          </div>
        </div>

        {/* Rank */}
        <div style={{ marginBottom: 20 }}><RankBadge score={totalScore} /></div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
          <StatCard value={progress?.streak_count ?? 0} label="Day streak" color="#f97316" suffix="🔥" />
          <StatCard value={totalScore} label="Total score" color="#34d399" />
          <StatCard value={progress?.games_played ?? 0} label="Games played" color="#60a5fa" />
        </div>

        {/* Best game */}
        {bestGame && (
          <div style={{ background: '#0f172a', border: '1px solid #1e3a5f', borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Best game</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{GAME_LABELS[bestGame[0]] ?? bestGame[0].replace(/-/g, ' ')}</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#60a5fa' }}>{(bestGame[1] as number).toLocaleString()} pts</div>
          </div>
        )}

        {/* High scores */}
        <div style={{ background: '#0b1120', border: '1px solid #1f2937', borderRadius: 16, padding: '20px 24px', marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>High Scores</div>
          {hasHighScores ? (
            <div>
              {Object.entries(highScores)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([gameId, score]) => (
                  <HighScoreRow key={gameId} gameId={gameId} score={score as number} />
                ))}
            </div>
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#374151' }}>
              <div style={{ fontSize: 13, marginBottom: 6 }}>No scores yet</div>
              <Link href="/" style={{ color: '#34d399', fontSize: 13, textDecoration: 'none' }}>Play a game →</Link>
            </div>
          )}
        </div>

        {/* ── PACK EMPIRE SECTION ── */}
        <div style={{ background: '#050a18', border: '1px solid #0d1835', borderRadius: 16, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                🏈 Pack Empire — Saved Drafts
              </div>
              <div style={{ fontSize: 11, color: '#1a3050' }}>{savedDrafts.length}/5 slots used</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href="/games/pack-empire/leaderboard"
                style={{ fontSize: 12, fontWeight: 700, color: '#ffd700', textDecoration: 'none', border: '1px solid rgba(255,215,0,.25)', borderRadius: 6, padding: '5px 12px', letterSpacing: '.06em' }}>
                🏆 Leaderboard
              </Link>
              <Link href="/games/pack-empire/offense"
                style={{ fontSize: 12, fontWeight: 700, color: '#050a18', background: 'linear-gradient(135deg,#a07020,#ffd700)', textDecoration: 'none', borderRadius: 6, padding: '5px 12px', letterSpacing: '.06em' }}>
                New Draft →
              </Link>
            </div>
          </div>

          {/* Best draft callout */}
          {bestDraft && (
            <div style={{ background: 'rgba(255,215,0,.05)', border: '1px solid rgba(255,215,0,.15)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 10, color: '#a07020', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 2 }}>Best Pack Empire Draft</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f9fafb' }}>{bestDraft.name}</div>
                <div style={{ fontSize: 11, color: getTierColor(bestDraft.tier), fontWeight: 700, marginTop: 1 }}>{bestDraft.icon} {bestDraft.tier}</div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'monospace', color: '#ffd700' }}>{bestDraft.score.toLocaleString()}</div>
            </div>
          )}

          {savedDrafts.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: '#1a3050' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🏈</div>
              <div style={{ fontSize: 13, marginBottom: 4, color: '#2a4060' }}>No saved drafts yet</div>
              <div style={{ fontSize: 11, color: '#1a3050', marginBottom: 16 }}>Build an offense and save your best lineup</div>
              <Link href="/games/pack-empire/offense"
                style={{ fontSize: 12, fontWeight: 700, color: '#ffd700', textDecoration: 'none', border: '1px solid rgba(255,215,0,.25)', borderRadius: 6, padding: '6px 14px' }}>
                Build My Offense →
              </Link>
            </div>
          ) : (
            <div>
              {savedDrafts
                .sort((a, b) => b.score - a.score)
                .map(draft => (
                  <SavedDraftCard key={draft.id} draft={draft} onDelete={deleteDraft} />
                ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}