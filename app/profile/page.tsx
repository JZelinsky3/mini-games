'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const GAME_LABELS: Record<string, string> = {
  'stat-shadow': 'Stat Shadow',
  'career-path': 'Career Path',
  'draft-day': 'Draft Day',
  'blitz-quiz': 'Blitz Quiz',
};

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
    <div style={{
      background: rank.bg,
      border: `1px solid ${rank.color}33`,
      borderRadius: 16,
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', color: rank.color, textTransform: 'uppercase', marginBottom: 4 }}>Current Rank</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: rank.color }}>{rank.label}</div>
        </div>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          border: `2px solid ${rank.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24,
        }}>
          {rank.label === 'Hall of Famer' ? '🏆' :
           rank.label === 'All-Pro' ? '⭐' :
           rank.label === 'Pro Bowler' ? '🎯' :
           rank.label === 'Starter' ? '🏈' : '📋'}
        </div>
      </div>
      {next && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}>
            <span>{score.toLocaleString()} pts</span>
            <span>{next.min.toLocaleString()} for {next.label}</span>
          </div>
          <div style={{ height: 4, background: '#1e293b', borderRadius: 2 }}>
            <div style={{
              height: '100%', background: rank.color,
              borderRadius: 2, width: `${progress}%`,
              transition: 'width 0.6s ease'
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ value, label, color, prefix = '', suffix = '' }: {
  value: number | string; label: string; color: string; prefix?: string; suffix?: string;
}) {
  return (
    <div style={{
      background: '#111827',
      border: '1px solid #1f2937',
      borderRadius: 14,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1.1 }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </div>
      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
    </div>
  );
}

function HighScoreRow({ gameId, score }: { gameId: string; score: number }) {
  const label = GAME_LABELS[gameId] ?? gameId.replace(/-/g, ' ');
  return (
    <Link
      href={`/games/${gameId}`}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 0',
        borderBottom: '1px solid #1f2937',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', background: '#34d399', flexShrink: 0
        }} />
        <span style={{ fontWeight: 600, fontSize: 15 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontWeight: 700, color: '#34d399', fontSize: 17 }}>
          {score.toLocaleString()} pts
        </span>
        <span style={{ color: '#374151', fontSize: 12 }}>›</span>
      </div>
    </Link>
  );
}

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
        if (!user) { router.push('/login'); return; }
        setUser(user);

        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') setError(error.message);

        setProgress(data || { streak_count: 0, total_score: 0, games_played: 0, high_scores: {} });
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

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Top nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ color: '#34d399', textDecoration: 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Home
          </Link>
          <button
            onClick={handleSignOut}
            style={{
              background: 'transparent', border: '1px solid #1f2937',
              borderRadius: 8, color: '#6b7280', padding: '6px 14px',
              fontSize: 13, cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>

        {/* Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, #065f46, #0c4a6e)',
            border: '1px solid #1f2937',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: '#34d399', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.2 }}>{displayName}</div>
            <div style={{ fontSize: 13, color: '#4b5563', marginTop: 2 }}>{user?.email}</div>
          </div>
        </div>

        {/* Rank card */}
        <div style={{ marginBottom: 20 }}>
          <RankBadge score={totalScore} />
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
          <StatCard value={progress?.streak_count ?? 0} label="Day streak" color="#f97316" suffix="🔥" />
          <StatCard value={totalScore} label="Total score" color="#34d399" />
          <StatCard value={progress?.games_played ?? 0} label="Games played" color="#60a5fa" />
        </div>

        {/* Best game callout */}
        {bestGame && (
          <div style={{
            background: '#0f172a',
            border: '1px solid #1e3a5f',
            borderRadius: 14,
            padding: '16px 20px',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 11, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Best game</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {GAME_LABELS[bestGame[0]] ?? bestGame[0].replace(/-/g, ' ')}
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#60a5fa' }}>
              {(bestGame[1] as number).toLocaleString()} pts
            </div>
          </div>
        )}

        {/* High scores */}
        <div style={{
          background: '#0b1120',
          border: '1px solid #1f2937',
          borderRadius: 16,
          padding: '20px 24px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            High Scores
          </div>

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
              <Link href="/" style={{ color: '#34d399', fontSize: 13, textDecoration: 'none' }}>
                Play a game →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}