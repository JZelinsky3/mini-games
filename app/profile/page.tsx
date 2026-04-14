'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/* ─── Types ─────────────────────────────────────────────────────────── */
const GAME_LABELS: Record<string, string> = {
  'stat-shadow': 'Stat Shadow',
  'career-path': 'Career Path',
  'draft-day':   'Draft Day',
  'blitz-quiz':  'Blitz Quiz',
};

type Rarity = 'common' | 'rare' | 'dynasty' | 'transcendent' | 'immortal';
type Tab = 'overview' | 'drafts' | 'versus' | 'friends';
type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted';

interface Player {
  id: string; name: string; pos: string; team: string;
  score: number; rarity: Rarity; accolades: string[];
}
interface SavedDraft {
  id: string; name: string; score: number; tier: string;
  icon: string; lineup: (Player | null)[]; timestamp: number;
}
interface VersusMatch {
  id: string;
  my_score: number;
  opp_score: number;
  opp_name: string;
  my_name: string;
  completed_at: string;
  i_won: boolean;
  is_tie: boolean;
}
interface Friend {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  status: FriendStatus;
  friendship_id: string;
}
interface Notification {
  id: string;
  type: string;
  from_username: string;
  from_user_id: string;
  data: any;
  read: boolean;
  created_at: string;
}

/* ─── Rarity / Tier config ───────────────────────────────────────────── */
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

const RANK_TIERS = [
  { min: 10000, label: 'Hall of Famer', color: '#f59e0b', bg: '#451a03' },
  { min: 5000,  label: 'All-Pro',       color: '#a78bfa', bg: '#2e1065' },
  { min: 2000,  label: 'Pro Bowler',    color: '#34d399', bg: '#064e3b' },
  { min: 500,   label: 'Starter',       color: '#60a5fa', bg: '#1e3a5f' },
  { min: 0,     label: 'Rookie',        color: '#94a3b8', bg: '#1e293b' },
];

const SLOTS_SHORT = ['QB','HB','WR','WR','WR','TE','LT','LG','C','RG','RT'];

function getTierColor(label: string) {
  return PE_TIERS.find(t => t.label === label)?.color ?? '#3a6080';
}
function getRank(s: number) { return RANK_TIERS.find(t => s >= t.min) ?? RANK_TIERS[RANK_TIERS.length - 1]; }
function getNextRank(s: number) {
  const idx = RANK_TIERS.findIndex(t => s >= t.min);
  return idx > 0 ? RANK_TIERS[idx - 1] : null;
}
function getDisplayName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  const suffixes = new Set(['jr.','jr','sr.','sr','ii','iii','iv','v','vi']);
  const last = parts[parts.length - 1];
  if (suffixes.has(last.toLowerCase()) && parts.length >= 3) return `${parts[parts.length - 2]} ${last}`;
  return last;
}

/* ─── Sub-components ─────────────────────────────────────────────────── */
function RankBadge({ score }: { score: number }) {
  const rank = getRank(score);
  const next = getNextRank(score);
  const currentMin = rank.min;
  const nextMin = next?.min ?? currentMin;
  const progress = next ? Math.min(((score - currentMin) / (nextMin - currentMin)) * 100, 100) : 100;
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

function SavedDraftCard({ draft, onDelete }: { draft: SavedDraft; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const tierColor = getTierColor(draft.tier);
  const date = new Date(draft.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div style={{ background: '#0b1120', border: '1px solid #1f2937', borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
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
          <button onClick={e => { e.stopPropagation(); onDelete(draft.id); }} style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: 13, padding: '4px 6px', borderRadius: 4 }}>✕</button>
          <span style={{ color: '#374151', fontSize: 12 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: '1px solid #1f2937', padding: '14px 18px', background: 'rgba(4,8,16,.5)' }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
            {draft.lineup.map((player, i) => <TinyCard key={i} player={player} slotShort={SLOTS_SHORT[i] ?? '?'} />)}
          </div>
          <Link href="/games/pack-empire/offense" style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, color: '#ffd700', textDecoration: 'none' }}>Play Again →</Link>
        </div>
      )}
    </div>
  );
}

/* ─── Versus Match Row ───────────────────────────────────────────────── */
function MatchRow({ match }: { match: VersusMatch }) {
  const date = new Date(match.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const time = new Date(match.completed_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const resultColor = match.is_tie ? '#42c0f8' : match.i_won ? '#28dc78' : '#e04040';
  const resultLabel = match.is_tie ? 'TIE' : match.i_won ? 'WIN' : 'LOSS';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #0d1835' }}>
      {/* Result badge */}
      <div style={{ width: 44, height: 44, borderRadius: 10, background: `${resultColor}15`, border: `1.5px solid ${resultColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 900, color: resultColor, letterSpacing: '.08em' }}>{resultLabel}</span>
      </div>

      {/* Scores */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* My side */}
        <div style={{ textAlign: 'right', flex: 1 }}>
          <div style={{ fontSize: 11, color: '#3a6080', marginBottom: 1 }}>YOU</div>
          <div style={{ fontSize: 15, fontWeight: 900, fontFamily: 'monospace', color: match.i_won ? '#28dc78' : '#d4e8f8' }}>
            {match.my_score.toLocaleString()}
          </div>
        </div>

        {/* Arrow */}
        <div style={{ fontSize: 14, color: resultColor, flexShrink: 0, minWidth: 24, textAlign: 'center' }}>
          {match.is_tie ? '=' : match.i_won ? '◄' : '►'}
        </div>

        {/* Opp side */}
        <div style={{ textAlign: 'left', flex: 1 }}>
          <div style={{ fontSize: 11, color: '#3a6080', marginBottom: 1 }}>{match.opp_name.toUpperCase()}</div>
          <div style={{ fontSize: 15, fontWeight: 900, fontFamily: 'monospace', color: !match.i_won && !match.is_tie ? '#e04040' : '#d4e8f8' }}>
            {match.opp_score.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Date */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: '#1a3050' }}>{date}</div>
        <div style={{ fontSize: 10, color: '#0d1835' }}>{time}</div>
      </div>
    </div>
  );
}

/* ─── Friend Row ─────────────────────────────────────────────────────── */
function FriendRow({ friend, onAccept, onDecline, onRemove, onChallenge }: {
  friend: Friend;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onRemove: (id: string) => void;
  onChallenge: (userId: string, username: string) => void;
}) {
  const initials = (friend.full_name || friend.username || '?').slice(0, 2).toUpperCase();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #0d1835' }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: '#0a1428', border: '1px solid #1a3050', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#42c0f8', flexShrink: 0 }}>
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#d4e8f8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {friend.full_name || friend.username}
        </div>
        <div style={{ fontSize: 11, color: '#2a4060' }}>@{friend.username}</div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {friend.status === 'pending_received' && (
          <>
            <button onClick={() => onAccept(friend.friendship_id)} style={{ background: 'rgba(40,220,120,.15)', border: '1px solid rgba(40,220,120,.3)', color: '#28dc78', borderRadius: 6, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>Accept</button>
            <button onClick={() => onDecline(friend.friendship_id)} style={{ background: 'rgba(224,64,64,.1)', border: '1px solid rgba(224,64,64,.2)', color: '#e04040', borderRadius: 6, padding: '5px 10px', fontSize: 11, cursor: 'pointer' }}>Decline</button>
          </>
        )}
        {friend.status === 'pending_sent' && (
          <span style={{ fontSize: 11, color: '#2a4060', padding: '5px 10px' }}>Pending...</span>
        )}
        {friend.status === 'accepted' && (
          <>
            <button onClick={() => onChallenge(friend.user_id, friend.username)} style={{ background: 'linear-gradient(135deg,#a07020,#ffd700)', border: 'none', color: '#050a18', borderRadius: 6, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 800 }}>⚔️ Challenge</button>
            <button onClick={() => onRemove(friend.friendship_id)} style={{ background: 'none', border: '1px solid #1a3050', color: '#2a4060', borderRadius: 6, padding: '5px 8px', fontSize: 11, cursor: 'pointer' }}>✕</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const [user, setUser]               = useState<any>(null);
  const [profile, setProfile]         = useState<any>(null);
  const [progress, setProgress]       = useState<any>(null);
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([]);
  const [versusHistory, setVersusHistory] = useState<VersusMatch[]>([]);
  const [friends, setFriends]         = useState<Friend[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState<Tab>('overview');
  const [error, setError]             = useState<string | null>(null);

  // Username editing
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername]         = useState('');
  const [usernameError, setUsernameError]     = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameSaving, setUsernameSaving]   = useState(false);

  // Friends
  const [friendSearch, setFriendSearch]   = useState('');
  const [friendResults, setFriendResults] = useState<any[]>([]);
  const [friendSearching, setFriendSearching] = useState(false);
  const [showNotifs, setShowNotifs]       = useState(false);

  const router  = useRouter();
  const supabase = createClient();

  /* ── Load everything ── */
  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }
        setUser(user);

        // Profile
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(prof);

        // Progress
        const { data: prog, error: progErr } = await supabase.from('user_progress').select('*').eq('user_id', user.id).single();
        if (progErr && progErr.code !== 'PGRST116') setError(progErr.message);
        setProgress(prog || { streak_count: 0, total_score: 0, games_played: 0, high_scores: {} });

        // Saved drafts
        try {
          const key = `pe-saved-drafts-${user.id}`;
          const raw = localStorage.getItem(key) || localStorage.getItem('pe-saved-drafts') || '[]';
          setSavedDrafts(JSON.parse(raw));
        } catch { }

        // Versus match history — challenges where user is host or opponent
        const { data: challenges } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .or(`username.ilike.%${friendSearch.trim()}%,full_name.ilike.%${friendSearch.trim()}%`)
          .not('host_result', 'is', null)
          .not('opponent_result', 'is', null)
          .order('created_at', { ascending: false })
          .limit(30);

        if (challenges) {
          const matches: VersusMatch[] = challenges.map((ch: any) => {
            const iAmHost = ch.creator_id === user.id;
            const myResult  = iAmHost ? ch.host_result     : ch.opponent_result;
            const oppResult = iAmHost ? ch.opponent_result : ch.host_result;
            const myScore   = myResult?.score  ?? 0;
            const oppScore  = oppResult?.score ?? 0;
            return {
              id: ch.id,
              my_score: myScore,
              opp_score: oppScore,
              my_name: myResult?.name  ?? 'You',
              opp_name: oppResult?.name ?? 'Opponent',
              completed_at: ch.completed_at ?? ch.created_at,
              i_won: myScore > oppScore,
              is_tie: myScore === oppScore,
            };
          });
          setVersusHistory(matches);
        }

        // Friends
        await loadFriends(user.id);

        // Notifications
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
      const otherUserId = f.requester_id === userId ? f.addressee_id : f.requester_id;
      const { data: prof } = await supabase.from('profiles').select('username, full_name').eq('id', otherUserId).single();
      let status: FriendStatus = 'none';
      if (f.status === 'accepted') status = 'accepted';
      else if (f.status === 'pending' && f.requester_id === userId) status = 'pending_sent';
      else if (f.status === 'pending' && f.addressee_id === userId) status = 'pending_received';
      return {
        id: otherUserId,
        user_id: otherUserId,
        username: prof?.username ?? '',
        full_name: prof?.full_name ?? '',
        status,
        friendship_id: f.id,
      };
    }));

    setFriends(enriched);
  };

  /* ── Username availability check ── */
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

  /* ── Save username ── */
  const saveUsername = async () => {
    if (!newUsername.trim() || !user) return;
    setUsernameError('');

    // Check 7-day restriction
    if (profile?.username_changed_at) {
      const lastChange = new Date(profile.username_changed_at);
      const daysSince = (Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        const daysLeft = Math.ceil(7 - daysSince);
        setUsernameError(`You can change your username again in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}.`);
        return;
      }
    }

    if (!usernameAvailable) { setUsernameError('That username is already taken.'); return; }
    if (newUsername.length < 3) { setUsernameError('Username must be at least 3 characters.'); return; }

    setUsernameSaving(true);
    const { error } = await supabase.from('profiles').update({
      username: newUsername.toLowerCase().trim(),
      username_changed_at: new Date().toISOString(),
    }).eq('id', user.id);

    if (error) { setUsernameError(error.message); }
    else {
      setProfile((p: any) => ({ ...p, username: newUsername.toLowerCase().trim(), username_changed_at: new Date().toISOString() }));
      setEditingUsername(false);
      setNewUsername('');
    }
    setUsernameSaving(false);
  };

  /* ── Friends actions ── */
  const searchFriends = async () => {
    if (!friendSearch.trim()) return;
    setFriendSearching(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .ilike('username', `%${friendSearch.trim()}%`)
      .neq('id', user?.id)
      .limit(8);
    setFriendResults(data ?? []);
    setFriendSearching(false);
  };

  const sendFriendRequest = async (toUserId: string, toUsername: string) => {
    await supabase.from('friends').insert({ requester_id: user.id, addressee_id: toUserId, status: 'pending' });
    await supabase.from('notifications').insert({
      user_id: toUserId,
      type: 'friend_request',
      from_user_id: user.id,
      from_username: profile?.username ?? user.email,
      data: {},
    });
    setFriendResults(r => r.filter(u => u.id !== toUserId));
    await loadFriends(user.id);
  };

  const acceptFriend = async (friendshipId: string) => {
    await supabase.from('friends').update({ status: 'accepted' }).eq('id', friendshipId);
    await loadFriends(user.id);
  };

  const declineFriend = async (friendshipId: string) => {
    await supabase.from('friends').delete().eq('id', friendshipId);
    await loadFriends(user.id);
  };

  const removeFriend = async (friendshipId: string) => {
    if (!confirm('Remove this friend?')) return;
    await supabase.from('friends').delete().eq('id', friendshipId);
    await loadFriends(user.id);
  };

  const challengeFriend = async (friendUserId: string, friendUsername: string) => {
    // Create a challenge in Supabase
    const newId = 'vs-' + Date.now().toString(36).slice(0, 9);
    await supabase.from('versus_challenges').insert({
      id: newId,
      creator_id: user.id,
      host_name: profile?.username ?? user.email,
      status: 'waiting',
    });
    // Notify the friend
    await supabase.from('notifications').insert({
      user_id: friendUserId,
      type: 'challenge_invite',
      from_user_id: user.id,
      from_username: profile?.username ?? user.email,
      data: { challenge_id: newId },
    });
    // Save locally too
    const entry = { id: newId, status: 'waiting', createdAt: Date.now(), creatorId: user.id, opponentName: friendUsername };
    const current = JSON.parse(localStorage.getItem('versus-active-challenges') || '[]');
    localStorage.setItem('versus-active-challenges', JSON.stringify([entry, ...current]));
    // Go to draft
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

  /* ── Derived ── */
  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingReceived = friends.filter(f => f.status === 'pending_received');
  const acceptedFriends = friends.filter(f => f.status === 'accepted');
  const pendingSent     = friends.filter(f => f.status === 'pending_sent');

  const canChangeUsername = () => {
    if (!profile?.username_changed_at) return true;
    const daysSince = (Date.now() - new Date(profile.username_changed_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 7;
  };
  const daysUntilChange = () => {
    if (!profile?.username_changed_at) return 0;
    const daysSince = (Date.now() - new Date(profile.username_changed_at).getTime()) / (1000 * 60 * 60 * 24);
    return Math.ceil(7 - daysSince);
  };

  const totalScore  = progress?.total_score ?? 0;
  const highScores  = progress?.high_scores ?? {};
  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Player';
  const initials    = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const bestDraft   = savedDrafts.length > 0 ? [...savedDrafts].sort((a, b) => b.score - a.score)[0] : null;

  const versus_wins   = versusHistory.filter(m => m.i_won).length;
  const versus_losses = versusHistory.filter(m => !m.i_won && !m.is_tie).length;
  const versus_ties   = versusHistory.filter(m => m.is_tie).length;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#4b5563', fontSize: 14 }}>Loading profile...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#ef4444' }}>Error: {error}</div>
    </div>
  );

  /* ════════════════ RENDER ════════════════ */
  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Top nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
          <button onClick={() => window.history.back()} style={{ color: '#34d399', textDecoration: 'none', fontSize: 14}}>← Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Notification bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setShowNotifs(s => !s); if (!showNotifs) markNotificationsRead(); }}
                style={{ background: 'transparent', border: '1px solid #1f2937', borderRadius: 8, color: unreadCount > 0 ? '#ffd700' : '#6b7280', padding: '6px 10px', fontSize: 14, cursor: 'pointer', position: 'relative' }}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, background: '#e04040', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {/* Dropdown */}
              {showNotifs && (
                <div style={{ position: 'absolute', right: 0, top: 40, background: '#0b1120', border: '1px solid #1f2937', borderRadius: 12, width: 300, zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,.5)', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #1f2937', fontSize: 12, fontWeight: 700, color: '#374151', letterSpacing: '.08em' }}>NOTIFICATIONS</div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: '#374151', fontSize: 13 }}>All caught up!</div>
                  ) : notifications.slice(0, 8).map(n => (
                    <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #0d1835', background: n.read ? 'transparent' : 'rgba(255,215,0,.03)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>
                        {n.type === 'friend_request' ? '👋' : n.type === 'challenge_invite' ? '⚔️' : '🔔'}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: '#d4e8f8', marginBottom: 2 }}>
                          {n.type === 'friend_request' && <><strong style={{ color: '#ffd700' }}>@{n.from_username}</strong> sent you a friend request</>}
                          {n.type === 'challenge_invite' && <><strong style={{ color: '#ffd700' }}>@{n.from_username}</strong> challenged you to a versus draft!</>}
                        </div>
                        {n.type === 'challenge_invite' && n.data?.challenge_id && (
                          <Link href={`/games/pack-empire/offense/versus/draft?challenge=${n.data.challenge_id}`}
                            style={{ fontSize: 11, color: '#28dc78', textDecoration: 'none', fontWeight: 700 }}>
                            Accept Challenge →
                          </Link>
                        )}
                        {n.type === 'friend_request' && (
                          <button onClick={() => { setActiveTab('friends'); setShowNotifs(false); }}
                            style={{ background: 'none', border: 'none', fontSize: 11, color: '#42c0f8', cursor: 'pointer', padding: 0, fontWeight: 700 }}>
                            View request →
                          </button>
                        )}
                      </div>
                      {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffd700', flexShrink: 0, marginTop: 4 }} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleSignOut} style={{ background: 'transparent', border: '1px solid #1f2937', borderRadius: 8, color: '#6b7280', padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>Sign out</button>
          </div>
        </div>

        {/* Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg,#065f46,#0c4a6e)', border: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#34d399', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{displayName}</div>
            {/* Username row */}
            {!editingUsername ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 13, color: '#4b5563' }}>@{profile?.username ?? '—'}</span>
                <button
                  onClick={() => {
                    if (!canChangeUsername()) {
                      setUsernameError(`You can change your username again in ${daysUntilChange()} day${daysUntilChange() !== 1 ? 's' : ''}.`);
                      return;
                    }
                    setNewUsername(profile?.username ?? '');
                    setEditingUsername(true);
                    setUsernameError('');
                  }}
                  style={{ background: 'none', border: '1px solid #1f2937', borderRadius: 5, color: '#374151', fontSize: 11, padding: '2px 8px', cursor: 'pointer' }}
                >
                  Edit
                </button>
                {!canChangeUsername() && (
                  <span style={{ fontSize: 10, color: '#2a4060' }}>({daysUntilChange()}d)</span>
                )}
              </div>
            ) : (
              <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={newUsername}
                    onChange={e => { setNewUsername(e.target.value.trim()); setUsernameError(''); }}
                    placeholder="New username"
                    maxLength={20}
                    style={{ flex: 1, background: '#0a1428', border: `1px solid ${usernameAvailable === false ? '#e04040' : usernameAvailable === true ? '#28dc78' : '#1a3050'}`, borderRadius: 6, padding: '6px 10px', color: '#fff', fontSize: 13, outline: 'none' }}
                    autoFocus
                  />
                  <button onClick={saveUsername} disabled={usernameSaving || !usernameAvailable} style={{ background: usernameAvailable ? 'linear-gradient(135deg,#20a050,#28dc78)' : '#0d1835', border: 'none', borderRadius: 6, color: usernameAvailable ? '#050a18' : '#2a4060', padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: usernameAvailable ? 'pointer' : 'default' }}>
                    {usernameSaving ? '...' : 'Save'}
                  </button>
                  <button onClick={() => { setEditingUsername(false); setUsernameError(''); }} style={{ background: 'none', border: '1px solid #1a3050', borderRadius: 6, color: '#2a4060', padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>✕</button>
                </div>
                {usernameChecking && <span style={{ fontSize: 11, color: '#3a6080' }}>Checking...</span>}
                {usernameAvailable === true && <span style={{ fontSize: 11, color: '#28dc78' }}>✓ Available</span>}
                {usernameAvailable === false && <span style={{ fontSize: 11, color: '#e04040' }}>✕ Taken</span>}
                {usernameError && <span style={{ fontSize: 11, color: '#e04040' }}>{usernameError}</span>}
                <span style={{ fontSize: 10, color: '#1a3050' }}>⚠ You can only change your username once every 7 days</span>
              </div>
            )}
            {usernameError && !editingUsername && <div style={{ fontSize: 11, color: '#e04040', marginTop: 3 }}>{usernameError}</div>}
            <div style={{ fontSize: 12, color: '#374151', marginTop: 2 }}>{user?.email}</div>
          </div>
        </div>

        {/* Rank */}
        <div style={{ marginBottom: 20 }}><RankBadge score={totalScore} /></div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1f2937', marginBottom: 24, gap: 0 }}>
          {(['overview', 'drafts', 'versus', 'friends'] as Tab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ flex: 1, background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab ? '#34d399' : 'transparent'}`, color: activeTab === tab ? '#34d399' : '#374151', padding: '10px 4px', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '.06em', textTransform: 'uppercase', transition: 'color .15s', position: 'relative' }}>
              {tab}
              {tab === 'friends' && (pendingReceived.length > 0 || unreadCount > 0) && (
                <span style={{ position: 'absolute', top: 6, right: 8, background: '#e04040', color: '#fff', borderRadius: '50%', width: 14, height: 14, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {pendingReceived.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { value: progress?.streak_count ?? 0, label: 'Day streak', color: '#f97316', suffix: '🔥' },
                { value: totalScore, label: 'Total score', color: '#34d399' },
                { value: progress?.games_played ?? 0, label: 'Games played', color: '#60a5fa' },
              ].map(s => (
                <div key={s.label} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 14, padding: 20 }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}{s.suffix ?? ''}</div>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Versus summary */}
            {versusHistory.length > 0 && (
              <div style={{ background: '#050a18', border: '1px solid #0d1835', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12, fontWeight: 700 }}>⚔️ Versus Record</div>
                <div style={{ display: 'flex', gap: 0 }}>
                  {[
                    { value: versus_wins,   label: 'W', color: '#28dc78' },
                    { value: versus_ties,   label: 'T', color: '#42c0f8' },
                    { value: versus_losses, label: 'L', color: '#e04040' },
                  ].map(s => (
                    <div key={s.label} style={{ flex: 1, textAlign: 'center', borderRight: s.label !== 'L' ? '1px solid #0d1835' : 'none' }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: '#2a4060', letterSpacing: '.1em' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* High scores */}
            <div style={{ background: '#0b1120', border: '1px solid #1f2937', borderRadius: 16, padding: '20px 24px', marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>High Scores</div>
              {Object.keys(highScores).length > 0 ? (
                Object.entries(highScores).sort(([,a],[,b]) => (b as number)-(a as number)).map(([gameId, score]) => (
                  <Link key={gameId} href={`/games/${gameId}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1f2937', textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{GAME_LABELS[gameId] ?? gameId.replace(/-/g,'  ')}</span>
                    <span style={{ fontWeight: 700, color: '#34d399', fontSize: 15 }}>{(score as number).toLocaleString()} pts</span>
                  </Link>
                ))
              ) : (
                <div style={{ padding: '24px 0', textAlign: 'center', color: '#374151', fontSize: 13 }}>No scores yet</div>
              )}
            </div>

            {/* Best draft */}
            {bestDraft && (
              <div style={{ background: 'rgba(255,215,0,.04)', border: '1px solid rgba(255,215,0,.12)', borderRadius: 14, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 10, color: '#a07020', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 2 }}>Best Pack Empire Draft</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{bestDraft.name}</div>
                  <div style={{ fontSize: 11, color: getTierColor(bestDraft.tier), fontWeight: 700, marginTop: 1 }}>{bestDraft.icon} {bestDraft.tier}</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'monospace', color: '#ffd700' }}>{bestDraft.score.toLocaleString()}</div>
              </div>
            )}
          </div>
        )}

        {/* ══ DRAFTS TAB ══ */}
        {activeTab === 'drafts' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>🏈 Saved Drafts ({savedDrafts.length}/5)</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href="/games/pack-empire/leaderboard" style={{ fontSize: 12, fontWeight: 700, color: '#ffd700', textDecoration: 'none', border: '1px solid rgba(255,215,0,.25)', borderRadius: 6, padding: '5px 12px' }}>🏆 Leaderboard</Link>
                <Link href="/games/pack-empire/offense" style={{ fontSize: 12, fontWeight: 700, color: '#050a18', background: 'linear-gradient(135deg,#a07020,#ffd700)', textDecoration: 'none', borderRadius: 6, padding: '5px 12px' }}>New Draft →</Link>
              </div>
            </div>
            {savedDrafts.length === 0 ? (
              <div style={{ padding: '48px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🏈</div>
                <div style={{ color: '#2a4060', fontSize: 13, marginBottom: 12 }}>No saved drafts yet</div>
                <Link href="/games/pack-empire/offense" style={{ fontSize: 13, fontWeight: 700, color: '#ffd700', textDecoration: 'none', border: '1px solid rgba(255,215,0,.25)', borderRadius: 6, padding: '8px 16px' }}>Build My Offense →</Link>
              </div>
            ) : (
              savedDrafts.sort((a,b) => b.score-a.score).map(d => <SavedDraftCard key={d.id} draft={d} onDelete={deleteDraft} />)
            )}
          </div>
        )}

        {/* ══ VERSUS TAB ══ */}
        {activeTab === 'versus' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>⚔️ Match History</div>
              <Link href="/games/pack-empire/offense/versus" style={{ fontSize: 12, fontWeight: 700, color: '#28dc78', textDecoration: 'none', border: '1px solid rgba(40,220,120,.25)', borderRadius: 6, padding: '5px 12px' }}>New Match →</Link>
            </div>

            {/* W/L/T summary */}
            {versusHistory.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
                {[
                  { value: versus_wins,   label: 'Wins',   color: '#28dc78' },
                  { value: versus_ties,   label: 'Ties',   color: '#42c0f8' },
                  { value: versus_losses, label: 'Losses', color: '#e04040' },
                ].map(s => (
                  <div key={s.label} style={{ background: '#0b1120', border: '1px solid #1f2937', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: '#374151', letterSpacing: '.06em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: '#0b1120', border: '1px solid #1f2937', borderRadius: 16, padding: '4px 20px' }}>
              {versusHistory.length === 0 ? (
                <div style={{ padding: '48px 0', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>⚔️</div>
                  <div style={{ color: '#2a4060', fontSize: 13, marginBottom: 12 }}>No matches played yet</div>
                  <Link href="/games/pack-empire/offense/versus" style={{ fontSize: 13, fontWeight: 700, color: '#28dc78', textDecoration: 'none', border: '1px solid rgba(40,220,120,.25)', borderRadius: 6, padding: '8px 16px' }}>Start a Match →</Link>
                </div>
              ) : (
                versusHistory.map(m => <MatchRow key={m.id} match={m} />)
              )}
            </div>
          </div>
        )}

        {/* ══ FRIENDS TAB ══ */}
        {activeTab === 'friends' && (
          <div>
            {/* Search */}
            <div style={{ background: '#0b1120', border: '1px solid #1f2937', borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700, marginBottom: 12 }}>Find Friends</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={friendSearch}
                  onChange={e => setFriendSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchFriends()}
                  placeholder="Search by username..."
                  style={{ flex: 1, background: '#040810', border: '1px solid #1a3050', borderRadius: 8, padding: '8px 12px', color: '#d4e8f8', fontSize: 13, outline: 'none' }}
                />
                <button onClick={searchFriends} disabled={friendSearching} style={{ background: 'linear-gradient(135deg,#065f46,#34d399)', border: 'none', borderRadius: 8, color: '#fff', padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {friendSearching ? '...' : 'Search'}
                </button>
              </div>
              {friendResults.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {friendResults.map(u => {
                    const alreadyFriend = friends.some(f => f.user_id === u.id);
                    return (
                      <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #0d1835' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0a1428', border: '1px solid #1a3050', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#42c0f8' }}>
                          {(u.full_name || u.username || '?').slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#d4e8f8' }}>{u.full_name || u.username}</div>
                          <div style={{ fontSize: 11, color: '#2a4060' }}>@{u.username}</div>
                        </div>
                        {alreadyFriend ? (
                          <span style={{ fontSize: 11, color: '#2a4060' }}>Already friends</span>
                        ) : (
                          <button onClick={() => sendFriendRequest(u.id, u.username)} style={{ background: 'rgba(40,220,120,.1)', border: '1px solid rgba(40,220,120,.3)', color: '#28dc78', borderRadius: 6, padding: '5px 12px', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>
                            + Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending requests */}
            {pendingReceived.length > 0 && (
              <div style={{ background: 'rgba(255,215,0,.04)', border: '1px solid rgba(255,215,0,.15)', borderRadius: 14, padding: '14px 18px', marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#a07020', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700, marginBottom: 8 }}>
                  Pending Requests ({pendingReceived.length})
                </div>
                {pendingReceived.map(f => (
                  <FriendRow key={f.friendship_id} friend={f} onAccept={acceptFriend} onDecline={declineFriend} onRemove={removeFriend} onChallenge={challengeFriend} />
                ))}
              </div>
            )}

            {/* Friends list */}
            <div style={{ background: '#0b1120', border: '1px solid #1f2937', borderRadius: 14, padding: '14px 18px' }}>
              <div style={{ fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700, marginBottom: 8 }}>
                Friends ({acceptedFriends.length})
              </div>
              {acceptedFriends.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: '#1a3050', fontSize: 13 }}>No friends yet — search above to add some</div>
              ) : (
                acceptedFriends.map(f => <FriendRow key={f.friendship_id} friend={f} onAccept={acceptFriend} onDecline={declineFriend} onRemove={removeFriend} onChallenge={challengeFriend} />)
              )}
              {/* Pending sent */}
              {pendingSent.length > 0 && (
                <>
                  <div style={{ fontSize: 11, color: '#1a3050', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700, marginTop: 16, marginBottom: 8 }}>Sent ({pendingSent.length})</div>
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