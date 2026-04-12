'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function VersusChallenge() {
  const [phase, setPhase] = useState<'loading' | 'sign-in' | 'lobby' | 'invite' | 'waiting'>('loading');
  const [user, setUser] = useState<any>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [activeChallenges, setActiveChallenges] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setPhase('sign-in');
      } else {
        setPhase('lobby');
        loadActiveChallenges();
      }
    }
    init();
  }, [supabase]);

  const loadActiveChallenges = () => {
    try {
      const active = JSON.parse(localStorage.getItem('versus-active-challenges') || '[]');
      setActiveChallenges(active);
    } catch {}
  };

  const createNewChallenge = () => {
    const newId = 'vs-' + Date.now().toString(36).slice(0, 9);
    setChallengeId(newId);
    setPhase('invite');

    const newChallenge = {
      id: newId,
      status: 'waiting',
      createdAt: Date.now(),
      creatorId: user?.id,
      myScore: null,
      opponentScore: null,
      opponentName: 'Waiting for opponent...'
    };

    const current = JSON.parse(localStorage.getItem('versus-active-challenges') || '[]');
    localStorage.setItem('versus-active-challenges', JSON.stringify([newChallenge, ...current]));
  };

  const copyInviteLink = () => {
    if (!challengeId) return;
    const link = `${window.location.origin}/games/pack-empire/offense/versus/draft?challenge=${challengeId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteChallenge = (id: string) => {
    if (!confirm("Delete this challenge?")) return;
    const updated = activeChallenges.filter(c => c.id !== id);
    localStorage.setItem('versus-active-challenges', JSON.stringify(updated));
    setActiveChallenges(updated);
  };

  return (
    <div className="pe-versus-root">
      <style dangerouslySetInnerHTML={{ __html: VERSUS_STYLES }} />

      <nav className="pe-hub-nav">
        <Link href="/games/pack-empire" className="pe-hub-back">← Hub</Link>
        <div className="pe-hub-nav-title">VERSUS CHALLENGE</div>
        <Link href="/games/pack-empire/leaderboard" className="pe-hub-lb-nav">🏆 Leaderboard</Link>
      </nav>

      <div className="pe-versus-container">

  {phase === 'sign-in' && (
    <div className="pe-versus-card">
      <div className="pe-versus-icon">⚔️</div>
      <h1>Versus Challenge</h1>
      <p className="pe-versus-desc">Sign in to challenge friends head-to-head.</p>
      <Link href="/login?redirect=/games/pack-empire/offense/versus" className="pe-versus-btn primary">
        Sign In
      </Link>
    </div>
  )}

  {phase === 'lobby' && (
    <div className="pe-versus-card">
      <div className="pe-versus-icon">🏟️</div>
      <h1>Ready for Battle?</h1>

      <button 
        onClick={createNewChallenge} 
        className="pe-versus-btn primary" 
        style={{ marginBottom: '2rem' }}
      >
        Create New Challenge
      </button>

      {activeChallenges.length > 0 && (
        <div>
          <div className="pe-versus-section-title">Active Challenges</div>
          {activeChallenges.map(ch => (
            <div key={ch.id} className="pe-challenge-row">
              <div>
                <div>vs {ch.opponentName}</div>
                <div className="text-xs text-zinc-500">
                  {new Date(ch.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
  const roleKey = ch.creatorId === user?.id ? 'host' : 'opponent';
  const alreadyDone = localStorage.getItem(`versus-result-${ch.id}-${roleKey}`);
  if (alreadyDone) {
    router.push(`/games/pack-empire/offense/versus/results?challenge=${ch.id}`);
  } else {
    router.push(`/games/pack-empire/offense/versus/draft?challenge=${ch.id}`);
  }
}}
                  className="pe-versus-btn secondary"
                >
                  Continue Draft
                </button>
                <button 
                  onClick={() => deleteChallenge(ch.id)} 
                  className="text-red-400"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}

  {phase === 'invite' && challengeId && (
    <div className="pe-versus-card">
      <h2>Challenge Created!</h2>
      <p className="pe-versus-desc">Share this link with a friend to start the battle.</p>

      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 my-6 text-center">
        <div className="text-sm text-zinc-500 mb-2">INVITE LINK</div>
        <div className="font-mono text-sm break-all text-emerald-400">
          {window.location.origin}/games/pack-empire/offense/versus/draft?challenge={challengeId}
        </div>
      </div>

      <button 
        onClick={copyInviteLink}
        className="pe-versus-btn primary w-full mb-4"
      >
        {copied ? '✓ Copied!' : 'Copy Invite Link'}
      </button>

      <button 
        onClick={() => router.push(`/games/pack-empire/offense/versus/draft?challenge=${challengeId}`)}
        className="pe-versus-btn secondary w-full"
      >
        Start My Draft →
      </button>

      <button 
        onClick={() => setPhase('lobby')} 
        className="text-zinc-500 mt-6"
      >
        Cancel Challenge
      </button>
    </div>
  )}

</div>
    </div>
  );
}

/* Styles */
const VERSUS_STYLES = `
.pe-versus-root { min-height: 100vh; background: #050a18; color: #d4e8f8; font-family: 'Barlow Condensed', sans-serif; }
.pe-versus-container { max-width: 620px; margin: 40px auto; padding: 0 20px; }
.pe-versus-card { background: #0a1830; border: 2px solid #1a3050; border-radius: 16px; padding: 2.5rem 2rem; text-align: center; }
.pe-versus-icon { font-size: 4.5rem; margin-bottom: 1.2rem; }
.pe-versus-card h1, h2 { font-family: 'Orbitron', sans-serif; font-weight: 900; letter-spacing: 0.06em; }
.pe-versus-desc { color: #3a6080; line-height: 1.6; }
.pe-versus-btn { padding: 16px 24px; font-weight: 800; font-size: 1.05rem; letter-spacing: 0.08em; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
.pe-versus-btn.primary { background: linear-gradient(135deg, #a07020, #ffd700); color: #050a18; }
.pe-versus-btn.secondary { background: transparent; border: 2px solid #3a6080; color: #3a6080; }
.pe-versus-section-title { font-family: 'Orbitron', sans-serif; color: #ffd700; text-align: left; margin: 2rem 0 1rem; letter-spacing: 0.08em; }
.pe-challenge-row { background: rgba(8,14,30,0.8); border: 1px solid #1a3050; border-radius: 10px; padding: 1rem; margin-bottom: 0.8rem; display: flex; justify-content: space-between; align-items: center; }
`;