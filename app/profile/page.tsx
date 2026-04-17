'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

const GAME_LABELS: Record<string, string> = {
  'stat-shadow': 'Stat Shadow',
  'career-path': 'Career Path',
  'draft-day':   'Draft Day',
  'blitz-quiz':  'Blitz Quiz',
};

type Rarity       = 'common' | 'rare' | 'dynasty' | 'transcendent' | 'immortal';
type Tab          = 'overview' | 'drafts' | 'versus' | 'friends';
type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted';

interface Player     { id: string; name: string; pos: string; team: string; score: number; rarity: Rarity; accolades: string[]; }
interface SavedDraft { id: string; name: string; score: number; tier: string; icon: string; lineup: (Player | null)[]; timestamp: number; }
interface VersusMatch { id: string; my_score: number; opp_score: number; opp_name: string; my_name: string; completed_at: string; i_won: boolean; is_tie: boolean; }
interface Friend     { id: string; user_id: string; username: string; full_name: string; status: FriendStatus; friendship_id: string; }
interface Notification { id: string; type: string; from_username: string; from_user_id: string; data: any; read: boolean; created_at: string; }

// ─── Config ───────────────────────────────────────────────────────────────────

const RC: Record<Rarity, { label: string; color: string; art: string }> = {
  common:       { label: 'COMMON',       color: '#c87840', art: 'linear-gradient(150deg,#3d2210,#7a4820)' },
  rare:         { label: 'RARE',         color: '#42c0f8', art: 'linear-gradient(150deg,#062840,#104870)' },
  dynasty:      { label: 'DYNASTY',      color: '#ffd700', art: 'linear-gradient(150deg,#3a2800,#806010)' },
  transcendent: { label: 'TRANSCENDENT', color: '#e040ff', art: 'linear-gradient(150deg,#280048,#6010b0)' },
  immortal:     { label: 'IMMORTAL',     color: '#28dc78', art: 'linear-gradient(150deg,#021a0a,#04401a)' },
};

const PE_TIERS = [
  { min: 20001, label: 'GOAT OFFENSE',       color: '#e040ff' },
  { min: 17001, label: 'HALL OF FAME',        color: '#ffd700' },
  { min: 14001, label: 'SUPER BOWL DYNASTY',  color: '#f0c030' },
  { min: 11001, label: 'ALL-PRO ELITE',       color: '#42c0f8' },
  { min: 8001,  label: 'PRO BOWL CALIBER',    color: '#50d870' },
  { min: 5001,  label: 'STARTER QUALITY',     color: '#a0b8d0' },
  { min: 2001,  label: 'BACKUP UNIT',         color: '#808080' },
  { min: 0,     label: 'PRACTICE SQUAD',      color: '#e8a060' },
];

const RANK_TIERS = [
  { min: 10000, label: 'Hall of Famer', color: '#e8a84b', bg: 'rgba(232,168,75,0.08)'  },
  { min: 5000,  label: 'All-Pro',       color: '#c04820', bg: 'rgba(192,72,32,0.08)'   },
  { min: 2000,  label: 'Pro Bowler',    color: '#bfb5a0', bg: 'rgba(191,181,160,0.06)' },
  { min: 500,   label: 'Starter',       color: '#9a8f7e', bg: 'rgba(154,143,126,0.06)' },
  { min: 0,     label: 'Rookie',        color: '#7d7463', bg: 'rgba(125,116,99,0.05)'  },
];

const SLOTS_SHORT = ['QB','HB','WR','WR','WR','TE','LT','LG','C','RG','RT'];

function getTierColor(label: string) { return PE_TIERS.find(t => t.label === label)?.color ?? '#7d7463'; }
function getRank(s: number)     { return RANK_TIERS.find(t => s >= t.min) ?? RANK_TIERS[RANK_TIERS.length - 1]; }
function getNextRank(s: number) { const idx = RANK_TIERS.findIndex(t => s >= t.min); return idx > 0 ? RANK_TIERS[idx - 1] : null; }
function getDisplayName(fullName: string) {
  const parts = fullName.trim().split(' ');
  const suffixes = new Set(['jr.','jr','sr.','sr','ii','iii','iv','v','vi']);
  const last = parts[parts.length - 1];
  if (suffixes.has(last.toLowerCase()) && parts.length >= 3) return `${parts[parts.length - 2]} ${last}`;
  return last;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const FootballIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <ellipse cx="12" cy="12" rx="10" ry="6" transform="rotate(-45 12 12)"/>
    <path d="m9.5 9.5 5 5M7 7l2 2M15 15l2 2"/>
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const LogOutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

// ─── Shared style helpers ─────────────────────────────────────────────────────

const card = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: 'var(--bg-card)',
  border: '1px solid var(--line)',
  ...extra,
});

const monoLabel = (extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  color: 'var(--ink-mute)',
  ...extra,
});

const serifTitle = (extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: "'DM Serif Display', serif",
  fontStyle: 'italic',
  color: 'var(--ink)',
  ...extra,
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionRule({ label, right }: { label: string; right?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 10, marginBottom: 16, borderBottom: '3px double var(--line)' }}>
      <span style={monoLabel({ color: 'var(--amber)' })}>{label}</span>
      {right && <span style={monoLabel()}>{right}</span>}
    </div>
  );
}

function RankBadge({ score }: { score: number }) {
  const rank = getRank(score);
  const next = getNextRank(score);
  const progress = next
    ? Math.min(((score - rank.min) / (next.min - rank.min)) * 100, 100)
    : 100;

  const rankEmoji =
    rank.label === 'Hall of Famer' ? '★' :
    rank.label === 'All-Pro'       ? '◆' :
    rank.label === 'Pro Bowler'    ? '●' :
    rank.label === 'Starter'       ? '▲' : '·';

  return (
    <div style={{ ...card(), borderLeft: `3px solid ${rank.color}`, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={monoLabel({ color: rank.color, marginBottom: 4 })}>Current Rank</div>
          <div style={{ ...serifTitle(), fontSize: '1.6rem', fontStyle: 'normal', fontWeight: 800, color: rank.color }}>{rank.label}</div>
        </div>
        <div style={{
          width: 48, height: 48,
          border: `1px solid ${rank.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Serif Display', serif",
          fontSize: 22, color: rank.color,
          background: rank.bg,
        }}>
          {rankEmoji}
        </div>
      </div>
      {next && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={monoLabel()}>{score.toLocaleString()} pts</span>
            <span style={monoLabel()}>{next.min.toLocaleString()} → {next.label}</span>
          </div>
          <div style={{ height: 3, background: 'var(--bg-soft)' }}>
            <div style={{ height: '100%', background: rank.color, width: `${progress}%`, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      )}
    </div>
  );
}

function TinyCard({ player, slotShort }: { player: Player | null; slotShort: string }) {
  if (!player) return (
    <div style={{ width: 52, height: 76, background: 'var(--bg)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: 8, color: 'var(--line)', fontFamily: "'JetBrains Mono', monospace" }}>{slotShort}</span>
    </div>
  );
  const rc = RC[player.rarity] ?? RC.common;
  return (
    <div style={{ width: 52, height: 76, overflow: 'hidden', flexShrink: 0, border: `1.5px solid ${rc.color}`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 11, background: 'var(--bg)', display: 'flex', alignItems: 'center', padding: '0 3px', flexShrink: 0 }}>
        <span style={{ fontSize: 6, fontWeight: 800, color: '#fff', background: rc.color, padding: '0 3px' }}>{player.pos}</span>
      </div>
      <div style={{ flex: 1, background: rc.art, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: 900, color: 'rgba(255,255,255,.12)', fontFamily: 'monospace' }}>{player.name.charAt(0)}</span>
      </div>
      <div style={{ padding: '2px 3px', background: 'var(--bg)', borderTop: `1px solid ${rc.color}`, flexShrink: 0 }}>
        <div style={{ fontSize: 7, fontWeight: 800, color: rc.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getDisplayName(player.name)}</div>
        <div style={{ fontSize: 7, color: 'var(--ink-soft)', fontFamily: 'monospace', fontWeight: 900 }}>{player.score.toLocaleString()}</div>
      </div>
    </div>
  );
}

function SavedDraftCard({ draft, onDelete }: { draft: SavedDraft; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const tierColor = getTierColor(draft.tier);
  const date = new Date(draft.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div style={{ ...card(), marginBottom: 8, overflow: 'hidden', borderLeft: `3px solid ${tierColor}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 3 }}>{draft.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={monoLabel({ color: tierColor })}>{draft.icon} {draft.tier}</span>
            <span style={monoLabel()}>·</span>
            <span style={monoLabel({ color: 'var(--amber)' })}>{draft.score.toLocaleString()} pts</span>
            <span style={monoLabel()}>·</span>
            <span style={monoLabel()}>{date}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={e => { e.stopPropagation(); onDelete(draft.id); }}
            style={{ background: 'none', border: 'none', color: 'var(--ink-mute)', cursor: 'pointer', fontSize: 12, padding: '2px 6px' }}
          >✕</button>
          <span style={{ color: 'var(--ink-mute)', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: '1px solid var(--line)', padding: '12px 16px', background: 'var(--bg)' }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
            {draft.lineup.map((player, i) => <TinyCard key={i} player={player} slotShort={SLOTS_SHORT[i] ?? '?'} />)}
          </div>
          <Link href="/games/pack-empire/offense" style={{ ...monoLabel({ color: 'var(--amber)' }), textDecoration: 'none' }}>
            Play Again →
          </Link>
        </div>
      )}
    </div>
  );
}

function MatchRow({ match }: { match: VersusMatch }) {
  const date = new Date(match.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const resultColor = match.is_tie ? 'var(--ink-soft)' : match.i_won ? 'var(--amber)' : 'var(--rust)';
  const resultLabel = match.is_tie ? 'TIE' : match.i_won ? 'WIN' : 'LOSS';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{
        width: 40, height: 40, flexShrink: 0,
        border: `1px solid ${resultColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={monoLabel({ color: resultColor, letterSpacing: '0.08em' })}>{resultLabel}</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ textAlign: 'right', flex: 1 }}>
          <div style={monoLabel({ marginBottom: 2 })}>You</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', color: match.i_won ? 'var(--amber)' : 'var(--ink)' }}>
            {match.my_score.toLocaleString()}
          </div>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: resultColor, flexShrink: 0, minWidth: 20, textAlign: 'center' }}>
          {match.is_tie ? '=' : match.i_won ? '◄' : '►'}
        </div>
        <div style={{ textAlign: 'left', flex: 1 }}>
          <div style={monoLabel({ marginBottom: 2 })}>{match.opp_name}</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', color: (!match.i_won && !match.is_tie) ? 'var(--rust)' : 'var(--ink)' }}>
            {match.opp_score.toLocaleString()}
          </div>
        </div>
      </div>
      <div style={monoLabel({ flexShrink: 0, textAlign: 'right' })}>{date}</div>
    </div>
  );
}

function FriendRow({ friend, onAccept, onDecline, onRemove, onChallenge }: {
  friend: Friend;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onRemove: (id: string) => void;
  onChallenge: (userId: string, username: string) => void;
}) {
  const initials = (friend.full_name || friend.username || '?').slice(0, 2).toUpperCase();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{
        width: 36, height: 36, flexShrink: 0,
        background: 'rgba(232,168,75,0.08)',
        border: '1px solid rgba(232,168,75,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, color: 'var(--amber)',
      }}>
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {friend.full_name || friend.username}
        </div>
        <div style={monoLabel({ marginTop: 1 })}>@{friend.username}</div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {friend.status === 'pending_received' && (
          <>
            <button onClick={() => onAccept(friend.friendship_id)} style={{ background: 'transparent', border: '1px solid var(--amber)', color: 'var(--amber)', padding: '4px 10px', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer' }}>Accept</button>
            <button onClick={() => onDecline(friend.friendship_id)} style={{ background: 'transparent', border: '1px solid var(--rust)', color: 'var(--rust)', padding: '4px 10px', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer' }}>Decline</button>
          </>
        )}
        {friend.status === 'pending_sent' && (
          <span style={monoLabel({ padding: '4px 0' })}>Pending···</span>
        )}
        {friend.status === 'accepted' && (
          <>
            <button onClick={() => onChallenge(friend.user_id, friend.username)} style={{ background: 'var(--amber)', border: 'none', color: 'var(--bg)', padding: '4px 10px', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer' }}>⚔ Challenge</button>
            <button onClick={() => onRemove(friend.friendship_id)} style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink-mute)', padding: '4px 8px', fontSize: 10, cursor: 'pointer' }}>✕</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [user, setUser]                   = useState<any>(null);
  const [profile, setProfile]             = useState<any>(null);
  const [progress, setProgress]           = useState<any>(null);
  const [savedDrafts, setSavedDrafts]     = useState<SavedDraft[]>([]);
  const [versusHistory, setVersusHistory] = useState<VersusMatch[]>([]);
  const [friends, setFriends]             = useState<Friend[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState<Tab>('overview');
  const [error, setError]                 = useState<string | null>(null);

  const [editingUsername, setEditingUsername]     = useState(false);
  const [newUsername, setNewUsername]             = useState('');
  const [usernameError, setUsernameError]         = useState('');
  const [usernameChecking, setUsernameChecking]   = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameSaving, setUsernameSaving]       = useState(false);

  const [friendSearch, setFriendSearch]     = useState('');
  const [friendResults, setFriendResults]   = useState<any[]>([]);
  const [friendSearching, setFriendSearching] = useState(false);
  const [showNotifs, setShowNotifs]         = useState(false);

  const router   = useRouter();
  const supabase = createClient();

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }
        setUser(user);

        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(prof);

        const { data: prog, error: progErr } = await supabase.from('user_progress').select('*').eq('user_id', user.id).single();
        if (progErr && progErr.code !== 'PGRST116') setError(progErr.message);
        setProgress(prog || { streak_count: 0, total_score: 0, games_played: 0, high_scores: {} });

        try {
          const key = `pe-saved-drafts-${user.id}`;
          const raw = localStorage.getItem(key) || localStorage.getItem('pe-saved-drafts') || '[]';
          setSavedDrafts(JSON.parse(raw));
        } catch { /* ignore */ }

        // ── FIXED: query versus_challenges, not profiles ──────────────────
        const { data: challenges } = await supabase
          .from('versus_challenges')
          .select('*')
          .or(`creator_id.eq.${user.id},opponent_id.eq.${user.id}`)
          .not('host_result', 'is', null)
          .not('opponent_result', 'is', null)
          .order('created_at', { ascending: false })
          .limit(30);

        if (challenges) {
          const matches: VersusMatch[] = challenges.map((ch: any) => {
            const iAmHost   = ch.creator_id === user.id;
            const myResult  = iAmHost ? ch.host_result     : ch.opponent_result;
            const oppResult = iAmHost ? ch.opponent_result : ch.host_result;
            const myScore   = myResult?.score  ?? 0;
            const oppScore  = oppResult?.score ?? 0;
            return {
              id:           ch.id,
              my_score:     myScore,
              opp_score:    oppScore,
              my_name:      myResult?.name  ?? 'You',
              opp_name:     oppResult?.name ?? 'Opponent',
              completed_at: ch.completed_at ?? ch.created_at,
              i_won:        myScore > oppScore,
              is_tie:       myScore === oppScore,
            };
          });
          setVersusHistory(matches);
        }

        await loadFriends(user.id);

        const { data: notifs } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
        setNotifications(notifs ?? []);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFriends = async (userId: string) => {
    const { data } = await supabase
      .from('friends')
      .select('id, requester_id, addressee_id, status')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
    if (!data) return;
    const enriched: Friend[] = await Promise.all(data.map(async (f: any) => {
      const otherId = f.requester_id === userId ? f.addressee_id : f.requester_id;
      const { data: prof } = await supabase.from('profiles').select('username, full_name').eq('id', otherId).single();
      let status: FriendStatus = 'none';
      if (f.status === 'accepted')                                    status = 'accepted';
      else if (f.status === 'pending' && f.requester_id === userId)   status = 'pending_sent';
      else if (f.status === 'pending' && f.addressee_id === userId)   status = 'pending_received';
      return { id: otherId, user_id: otherId, username: prof?.username ?? '', full_name: prof?.full_name ?? '', status, friendship_id: f.id };
    }));
    setFriends(enriched);
  };

  // ── Username check ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!newUsername || newUsername.length < 3) { setUsernameAvailable(null); return; }
    const t = setTimeout(async () => {
      setUsernameChecking(true);
      const { data } = await supabase.from('profiles').select('username').eq('username', newUsername.toLowerCase()).single();
      setUsernameAvailable(!data);
      setUsernameChecking(false);
    }, 500);
    return () => clearTimeout(t);
  }, [newUsername, supabase]);

  const saveUsername = async () => {
    if (!newUsername.trim() || !user) return;
    setUsernameError('');
    if (profile?.username_changed_at) {
      const daysSince = (Date.now() - new Date(profile.username_changed_at).getTime()) / 86400000;
      if (daysSince < 7) { setUsernameError(`Change available in ${Math.ceil(7 - daysSince)}d.`); return; }
    }
    if (!usernameAvailable) { setUsernameError('Username taken.'); return; }
    if (newUsername.length < 3) { setUsernameError('Must be 3+ characters.'); return; }
    setUsernameSaving(true);
    const { error } = await supabase.from('profiles').update({
      username: newUsername.toLowerCase().trim(),
      username_changed_at: new Date().toISOString(),
    }).eq('id', user.id);
    if (error) { setUsernameError(error.message); }
    else {
      setProfile((p: any) => ({ ...p, username: newUsername.toLowerCase().trim(), username_changed_at: new Date().toISOString() }));
      setEditingUsername(false); setNewUsername('');
    }
    setUsernameSaving(false);
  };

  // ── Friends ───────────────────────────────────────────────────────────────

  const searchFriends = async () => {
    if (!friendSearch.trim()) return;
    setFriendSearching(true);
    const { data } = await supabase.from('profiles').select('id, username, full_name').ilike('username', `%${friendSearch.trim()}%`).neq('id', user?.id).limit(8);
    setFriendResults(data ?? []);
    setFriendSearching(false);
  };

  const sendFriendRequest = async (toUserId: string, toUsername: string) => {
    await supabase.from('friends').insert({ requester_id: user.id, addressee_id: toUserId, status: 'pending' });
    await supabase.from('notifications').insert({ user_id: toUserId, type: 'friend_request', from_user_id: user.id, from_username: profile?.username ?? user.email, data: {} });
    setFriendResults(r => r.filter(u => u.id !== toUserId));
    await loadFriends(user.id);
  };

  const acceptFriend  = async (id: string) => { await supabase.from('friends').update({ status: 'accepted' }).eq('id', id); await loadFriends(user.id); };
  const declineFriend = async (id: string) => { await supabase.from('friends').delete().eq('id', id); await loadFriends(user.id); };
  const removeFriend  = async (id: string) => { if (!confirm('Remove this friend?')) return; await supabase.from('friends').delete().eq('id', id); await loadFriends(user.id); };

  const challengeFriend = async (friendUserId: string, friendUsername: string) => {
    const newId = 'vs-' + Date.now().toString(36).slice(0, 9);
    await supabase.from('versus_challenges').insert({ id: newId, creator_id: user.id, host_name: profile?.username ?? user.email, status: 'waiting' });
    await supabase.from('notifications').insert({ user_id: friendUserId, type: 'challenge_invite', from_user_id: user.id, from_username: profile?.username ?? user.email, data: { challenge_id: newId } });
    const current = JSON.parse(localStorage.getItem('versus-active-challenges') || '[]');
    localStorage.setItem('versus-active-challenges', JSON.stringify([{ id: newId, status: 'waiting', createdAt: Date.now(), creatorId: user.id, opponentName: friendUsername }, ...current]));
    router.push(`/games/pack-empire/offense/versus/draft?challenge=${newId}`);
  };

  const markNotificationsRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    setNotifications(n => n.map(x => ({ ...x, read: true })));
  };

  const deleteDraft = (id: string) => {
    const updated = savedDrafts.filter(d => d.id !== id);
    setSavedDrafts(updated);
    const key = user?.id ? `pe-saved-drafts-${user.id}` : 'pe-saved-drafts';
    localStorage.setItem(key, JSON.stringify(updated));
    localStorage.setItem('pe-saved-drafts', JSON.stringify(updated));
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/'); };

  // ── Derived ───────────────────────────────────────────────────────────────

  const unreadCount     = notifications.filter(n => !n.read).length;
  const pendingReceived = friends.filter(f => f.status === 'pending_received');
  const acceptedFriends = friends.filter(f => f.status === 'accepted');
  const pendingSent     = friends.filter(f => f.status === 'pending_sent');
  const totalScore      = progress?.total_score ?? 0;
  const highScores      = progress?.high_scores ?? {};
  const displayName     = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Player';
  const initials        = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const bestDraft       = savedDrafts.length > 0 ? [...savedDrafts].sort((a, b) => b.score - a.score)[0] : null;
  const versus_wins     = versusHistory.filter(m => m.i_won).length;
  const versus_losses   = versusHistory.filter(m => !m.i_won && !m.is_tie).length;
  const versus_ties     = versusHistory.filter(m => m.is_tie).length;

  const canChangeUsername = () => {
    if (!profile?.username_changed_at) return true;
    return (Date.now() - new Date(profile.username_changed_at).getTime()) / 86400000 >= 7;
  };
  const daysUntilChange = () => Math.ceil(7 - (Date.now() - new Date(profile.username_changed_at).getTime()) / 86400000);

  // ── Loading / Error states ────────────────────────────────────────────────

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #141311)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--ink-mute, #7d7463)' }}>
        Loading···
      </span>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #141311)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: 'var(--rust, #c04820)' }}>Error: {error}</span>
    </div>
  );

  // ══ RENDER ════════════════════════════════════════════════════════════════

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)', fontFamily: "'Space Grotesk', sans-serif" }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* ── Top nav ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 20, marginBottom: 28, borderBottom: '1px solid var(--line)' }}>
          {/* Left: hub link */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <span style={{ color: 'var(--amber)' }}><FootballIcon /></span>
            <div>
              <div style={monoLabel({ color: 'var(--amber)' })}>NFL Minigames Hub</div>
              <div style={monoLabel({ marginTop: 1 })}>The Almanac · Vol. 01</div>
            </div>
          </Link>

          {/* Right: bell + sign out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setShowNotifs(s => !s); if (!showNotifs) markNotificationsRead(); }}
                style={{
                  width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: unreadCount > 0 ? 'rgba(232,168,75,0.08)' : 'transparent',
                  border: `1px solid ${unreadCount > 0 ? 'rgba(232,168,75,0.3)' : 'var(--line)'}`,
                  color: unreadCount > 0 ? 'var(--amber)' : 'var(--ink-mute)',
                  cursor: 'pointer', position: 'relative',
                }}
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--rust)', color: 'var(--ink)', borderRadius: '2px', width: 15, height: 15, fontSize: 8, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--bg)' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowNotifs(false)} />
                  <div style={{ position: 'absolute', right: 0, top: 42, zIndex: 50, background: 'var(--bg-card)', border: '1px solid var(--line)', borderTop: '2px solid var(--amber)', width: 300, boxShadow: '0 16px 48px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
                    <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--line)' }}>
                      <span style={monoLabel({ color: 'var(--amber)' })}>Dispatches</span>
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px 14px', textAlign: 'center', fontFamily: "'DM Serif Display', serif", fontStyle: 'italic', color: 'var(--ink-mute)', fontSize: 13 }}>Nothing new to report.</div>
                    ) : notifications.slice(0, 8).map(n => (
                      <div key={n.id} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--line)', background: n.read ? 'transparent' : 'rgba(232,168,75,0.04)', alignItems: 'flex-start' }}>
                        <div style={{ width: 3, alignSelf: 'stretch', background: n.type === 'friend_request' ? 'var(--amber)' : n.type === 'challenge_invite' ? 'var(--rust)' : 'var(--ink-mute)', borderRadius: 1, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.45, marginBottom: 5, fontFamily: "'Space Grotesk', sans-serif" }}>
                            {n.type === 'friend_request'   && <><strong style={{ color: 'var(--amber)' }}>@{n.from_username}</strong> sent you a friend request</>}
                            {n.type === 'challenge_invite' && <><strong style={{ color: 'var(--rust)' }}>@{n.from_username}</strong> challenged you to a Versus Draft!</>}
                            {n.type === 'match_result'     && <>Match result ready</>}
                          </div>
                          {n.type === 'challenge_invite' && n.data?.challenge_id && (
                            <button onClick={() => { setShowNotifs(false); router.push(`/games/pack-empire/offense/versus/draft?challenge=${n.data.challenge_id}`); }} style={{ background: 'transparent', border: '1px solid var(--rust)', color: 'var(--rust)', padding: '3px 8px', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer' }}>Accept →</button>
                          )}
                          {n.type === 'friend_request' && (
                            <button onClick={() => { setActiveTab('friends'); setShowNotifs(false); }} style={{ background: 'transparent', border: '1px solid var(--amber)', color: 'var(--amber)', padding: '3px 8px', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer' }}>View →</button>
                          )}
                        </div>
                        {!n.read && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--amber)', flexShrink: 0, marginTop: 4 }} />}
                      </div>
                    ))}
                    <button onClick={() => { setShowNotifs(false); router.push('/profile?tab=friends'); }}
                      style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', borderTop: '1px solid var(--line)', cursor: 'pointer', ...monoLabel() }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--amber)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-mute)')}>
                      View all dispatches →
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              title="Sign out"
              style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink-mute)', cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(192,72,32,0.4)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--rust)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-mute)'; }}
            >
              <LogOutIcon />
            </button>
          </div>
        </div>

        {/* ── Identity block ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
          {/* Avatar */}
          <div style={{
            width: 60, height: 60, flexShrink: 0,
            background: 'rgba(232,168,75,0.1)',
            border: '1px solid rgba(232,168,75,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: 'var(--amber)',
          }}>
            {initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', lineHeight: 1.1, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{displayName}</div>

            {/* Username row */}
            {!editingUsername ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                <span style={monoLabel()}>@{profile?.username ?? '—'}</span>
                <button
                  onClick={() => {
                    if (!canChangeUsername()) { setUsernameError(`Change available in ${daysUntilChange()}d.`); return; }
                    setNewUsername(profile?.username ?? ''); setEditingUsername(true); setUsernameError('');
                  }}
                  style={{ background: 'none', border: '1px solid var(--line)', color: 'var(--ink-mute)', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: '0.1em', padding: '2px 7px', cursor: 'pointer' }}
                >
                  Edit
                </button>
                {!canChangeUsername() && <span style={monoLabel()}>({daysUntilChange()}d)</span>}
              </div>
            ) : (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={newUsername}
                    onChange={e => { setNewUsername(e.target.value.trim()); setUsernameError(''); }}
                    placeholder="New username"
                    maxLength={20}
                    autoFocus
                    style={{ flex: 1, background: 'var(--bg)', border: `1px solid ${usernameAvailable === false ? 'var(--rust)' : usernameAvailable === true ? 'var(--amber)' : 'var(--line)'}`, padding: '6px 10px', color: 'var(--ink)', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, outline: 'none' }}
                  />
                  <button onClick={saveUsername} disabled={usernameSaving || !usernameAvailable} style={{ background: usernameAvailable ? 'var(--amber)' : 'transparent', border: `1px solid ${usernameAvailable ? 'var(--amber)' : 'var(--line)'}`, color: usernameAvailable ? 'var(--bg)' : 'var(--ink-mute)', padding: '6px 12px', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: '0.1em', cursor: usernameAvailable ? 'pointer' : 'default' }}>
                    {usernameSaving ? '···' : 'Save'}
                  </button>
                  <button onClick={() => { setEditingUsername(false); setUsernameError(''); }} style={{ background: 'none', border: '1px solid var(--line)', color: 'var(--ink-mute)', padding: '6px 10px', fontSize: 11, cursor: 'pointer' }}>✕</button>
                </div>
                {usernameChecking && <span style={monoLabel()}>Checking···</span>}
                {usernameAvailable === true  && <span style={monoLabel({ color: 'var(--amber)' })}>✓ Available</span>}
                {usernameAvailable === false && <span style={monoLabel({ color: 'var(--rust)' })}>✕ Taken</span>}
                {usernameError && <span style={monoLabel({ color: 'var(--rust)' })}>{usernameError}</span>}
                <span style={monoLabel()}>⚠ Changeable once every 7 days</span>
              </div>
            )}
            {usernameError && !editingUsername && <div style={monoLabel({ color: 'var(--rust)', marginTop: 3 })}>{usernameError}</div>}
            <div style={monoLabel({ marginTop: 4 })}>{user?.email}</div>
          </div>
        </div>

        {/* ── Rank badge ── */}
        <div style={{ marginBottom: 24 }}><RankBadge score={totalScore} /></div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', marginBottom: 24 }}>
          {(['overview', 'drafts', 'versus', 'friends'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, background: 'none', border: 'none',
                borderBottom: `2px solid ${activeTab === tab ? 'var(--amber)' : 'transparent'}`,
                marginBottom: -1,
                color: activeTab === tab ? 'var(--amber)' : 'var(--ink-mute)',
                padding: '10px 4px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
                position: 'relative', transition: 'color 0.2s',
              }}
            >
              {tab}
              {tab === 'friends' && pendingReceived.length > 0 && (
                <span style={{ position: 'absolute', top: 6, right: 8, background: 'var(--rust)', color: 'var(--ink)', width: 14, height: 14, fontSize: 8, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--bg)' }}>
                  {pendingReceived.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW ══ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[
                { value: `${progress?.streak_count ?? 0}`, label: 'Day Streak',    accent: 'var(--rust)'   },
                { value: totalScore.toLocaleString(),       label: 'Total Score',   accent: 'var(--amber)'  },
                { value: `${progress?.games_played ?? 0}`, label: 'Games Played',  accent: 'var(--ink-soft)' },
              ].map(s => (
                <div key={s.label} style={{ ...card({ borderTop: `2px solid ${s.accent}`, padding: '16px' }) }}>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', lineHeight: 1, color: s.accent, letterSpacing: '-0.02em' }}>{s.value}</div>
                  <div style={monoLabel({ marginTop: 6 })}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Versus summary */}
            {versusHistory.length > 0 && (
              <div style={card({ padding: '16px 20px' })}>
                <SectionRule label="⚔ Versus Record" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
                  {[
                    { value: versus_wins,   label: 'W', color: 'var(--amber)' },
                    { value: versus_ties,   label: 'T', color: 'var(--ink-soft)' },
                    { value: versus_losses, label: 'L', color: 'var(--rust)' },
                  ].map((s, i, arr) => (
                    <div key={s.label} style={{ textAlign: 'center', borderRight: i < arr.length - 1 ? '1px solid var(--line)' : 'none' }}>
                      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: s.color }}>{s.value}</div>
                      <div style={monoLabel({ color: s.color })}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* High scores */}
            <div style={card({ padding: '18px 20px' })}>
              <SectionRule label="High Scores" />
              {Object.keys(highScores).length > 0 ? (
                Object.entries(highScores).sort(([,a],[,b]) => (b as number) - (a as number)).map(([gameId, score]) => (
                  <Link key={gameId} href={`/games/${gameId}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)', textDecoration: 'none' }}>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, color: 'var(--ink-soft)' }}>{GAME_LABELS[gameId] ?? gameId.replace(/-/g, ' ')}</span>
                    <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', color: 'var(--amber)' }}>{(score as number).toLocaleString()}</span>
                  </Link>
                ))
              ) : (
                <div style={{ padding: '24px 0', textAlign: 'center', fontFamily: "'DM Serif Display', serif", fontStyle: 'italic', color: 'var(--ink-mute)', fontSize: 14 }}>
                  No scores recorded yet.
                </div>
              )}
            </div>

            {/* Best draft */}
            {bestDraft && (
              <div style={{ ...card({ padding: '14px 18px', borderLeft: `3px solid ${getTierColor(bestDraft.tier)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }) }}>
                <div>
                  <div style={monoLabel({ color: getTierColor(bestDraft.tier), marginBottom: 4 })}>Best Pack Empire Draft</div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{bestDraft.name}</div>
                  <div style={monoLabel({ color: getTierColor(bestDraft.tier), marginTop: 3 })}>{bestDraft.icon} {bestDraft.tier}</div>
                </div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', color: 'var(--amber)', letterSpacing: '-0.02em' }}>{bestDraft.score.toLocaleString()}</div>
              </div>
            )}
          </div>
        )}

        {/* ══ DRAFTS ══ */}
        {activeTab === 'drafts' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={monoLabel({ color: 'var(--amber)' })}>Saved Drafts ({savedDrafts.length}/5)</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href="/games/pack-empire/leaderboard" style={{ ...monoLabel({ color: 'var(--amber)', textDecoration: 'none', border: '1px solid rgba(232,168,75,0.3)', padding: '5px 12px' }) }}>Leaderboard →</Link>
                <Link href="/games/pack-empire/offense" style={{ ...monoLabel({ color: 'var(--bg)', background: 'var(--amber)', textDecoration: 'none', padding: '5px 12px', border: '1px solid var(--amber)' }) }}>New Draft →</Link>
              </div>
            </div>
            {savedDrafts.length === 0 ? (
              <div style={{ ...card({ padding: '48px 20px', textAlign: 'center' }) }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--ink-mute)', marginBottom: 16 }}>No saved drafts yet.</div>
                <Link href="/games/pack-empire/offense" style={monoLabel({ color: 'var(--amber)', textDecoration: 'none', border: '1px solid rgba(232,168,75,0.3)', padding: '8px 16px' })}>Build My Offense →</Link>
              </div>
            ) : (
              savedDrafts.sort((a, b) => b.score - a.score).map(d => <SavedDraftCard key={d.id} draft={d} onDelete={deleteDraft} />)
            )}
          </div>
        )}

        {/* ══ VERSUS ══ */}
        {activeTab === 'versus' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={monoLabel({ color: 'var(--amber)' })}>Match History</span>
              <Link href="/games/pack-empire/offense/versus" style={monoLabel({ color: 'var(--amber)', textDecoration: 'none', border: '1px solid rgba(232,168,75,0.3)', padding: '5px 12px' })}>New Match →</Link>
            </div>

            {versusHistory.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { value: versus_wins,   label: 'Wins',   color: 'var(--amber)' },
                  { value: versus_ties,   label: 'Ties',   color: 'var(--ink-soft)' },
                  { value: versus_losses, label: 'Losses', color: 'var(--rust)' },
                ].map(s => (
                  <div key={s.label} style={{ ...card({ padding: 14, textAlign: 'center' }) }}>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: s.color }}>{s.value}</div>
                    <div style={monoLabel({ marginTop: 4 })}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={card({ padding: '4px 20px' })}>
              {versusHistory.length === 0 ? (
                <div style={{ padding: '48px 0', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--ink-mute)', marginBottom: 16 }}>No matches played yet.</div>
                  <Link href="/games/pack-empire/offense/versus" style={monoLabel({ color: 'var(--amber)', textDecoration: 'none', border: '1px solid rgba(232,168,75,0.3)', padding: '8px 16px' })}>Start a Match →</Link>
                </div>
              ) : (
                versusHistory.map(m => <MatchRow key={m.id} match={m} />)
              )}
            </div>
          </div>
        )}

        {/* ══ FRIENDS ══ */}
        {activeTab === 'friends' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Search */}
            <div style={card({ padding: '16px 18px' })}>
              <SectionRule label="Find Friends" />
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={friendSearch}
                  onChange={e => setFriendSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchFriends()}
                  placeholder="Search by username···"
                  style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--line)', padding: '9px 12px', color: 'var(--ink)', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, outline: 'none' }}
                />
                <button
                  onClick={searchFriends}
                  disabled={friendSearching}
                  style={{ background: 'var(--amber)', border: 'none', color: 'var(--bg)', padding: '9px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', cursor: 'pointer' }}
                >
                  {friendSearching ? '···' : 'Search'}
                </button>
              </div>
              {friendResults.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column' }}>
                  {friendResults.map(u => {
                    const already = friends.some(f => f.user_id === u.id);
                    return (
                      <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                        <div style={{ width: 32, height: 32, background: 'rgba(232,168,75,0.08)', border: '1px solid rgba(232,168,75,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: 'var(--amber)', flexShrink: 0 }}>
                          {(u.full_name || u.username || '?').slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{u.full_name || u.username}</div>
                          <div style={monoLabel({ marginTop: 1 })}>@{u.username}</div>
                        </div>
                        {already ? (
                          <span style={monoLabel()}>Already friends</span>
                        ) : (
                          <button onClick={() => sendFriendRequest(u.id, u.username)} style={{ background: 'transparent', border: '1px solid var(--amber)', color: 'var(--amber)', padding: '4px 10px', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer' }}>+ Add</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending received */}
            {pendingReceived.length > 0 && (
              <div style={{ ...card({ padding: '14px 18px', borderLeft: '3px solid var(--amber)' }) }}>
                <SectionRule label={`Pending Requests (${pendingReceived.length})`} />
                {pendingReceived.map(f => <FriendRow key={f.friendship_id} friend={f} onAccept={acceptFriend} onDecline={declineFriend} onRemove={removeFriend} onChallenge={challengeFriend} />)}
              </div>
            )}

            {/* Accepted friends */}
            <div style={card({ padding: '14px 18px' })}>
              <SectionRule label={`Friends (${acceptedFriends.length})`} />
              {acceptedFriends.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', fontFamily: "'DM Serif Display', serif", fontStyle: 'italic', color: 'var(--ink-mute)', fontSize: 13 }}>
                  No friends yet — search above to add some.
                </div>
              ) : (
                acceptedFriends.map(f => <FriendRow key={f.friendship_id} friend={f} onAccept={acceptFriend} onDecline={declineFriend} onRemove={removeFriend} onChallenge={challengeFriend} />)
              )}
              {pendingSent.length > 0 && (
                <>
                  <div style={{ ...monoLabel(), marginTop: 16, marginBottom: 10 }}>Sent ({pendingSent.length})</div>
                  {pendingSent.map(f => <FriendRow key={f.friendship_id} friend={f} onAccept={acceptFriend} onDecline={declineFriend} onRemove={removeFriend} onChallenge={challengeFriend} />)}
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}