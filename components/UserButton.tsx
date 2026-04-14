'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const UserIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const LogOutIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

function NotificationBell({ userId }: { userId: string }) {
  const supabase = createClient();
  const router   = useRouter();
  const [unread, setUnread]   = useState(0);
  const [open, setOpen]       = useState(false);
  const [notifs, setNotifs]   = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    setNotifs(data ?? []);
    setUnread((data ?? []).filter((n: any) => !n.read).length);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const markRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    setUnread(0);
    setNotifs(n => n.map(x => ({ ...x, read: true })));
  };

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open && unread > 0) markRead();
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleOpen}
        title="Notifications"
        className="w-8 h-8 rounded-full flex items-center justify-center border border-transparent transition-all duration-200"
        style={{
          background: unread > 0 ? 'rgba(255,215,0,.08)' : 'transparent',
          borderColor: unread > 0 ? 'rgba(255,215,0,.25)' : 'transparent',
          color: unread > 0 ? '#ffd700' : '#52525b',
          position: 'relative',
        }}
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -3, right: -3,
            background: '#ef4444', color: '#fff',
            borderRadius: '50%', width: 15, height: 15,
            fontSize: 8, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid #09090b',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div style={{
            position: 'absolute', right: 0, top: 40, zIndex: 50,
            background: '#18181b', border: '1px solid #27272a',
            borderRadius: 14, width: 300, boxShadow: '0 8px 32px rgba(0,0,0,.6)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #27272a', fontSize: 11, fontWeight: 700, color: '#52525b', letterSpacing: '.1em' }}>
              NOTIFICATIONS
            </div>
            {notifs.length === 0 ? (
              <div style={{ padding: '24px 14px', textAlign: 'center', color: '#52525b', fontSize: 13 }}>
                All caught up!
              </div>
            ) : (
              notifs.map(n => (
                <div key={n.id} style={{
                  display: 'flex', gap: 10, padding: '11px 14px',
                  borderBottom: '1px solid #27272a',
                  background: n.read ? 'transparent' : 'rgba(255,215,0,.03)',
                  alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>
                    {n.type === 'friend_request' ? '👋' : n.type === 'challenge_invite' ? '⚔️' : '🔔'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: '#d4d4d8', lineHeight: 1.4, marginBottom: 4 }}>
                      {n.type === 'friend_request' && (
                        <><strong style={{ color: '#34d399' }}>@{n.from_username}</strong> sent you a friend request</>
                      )}
                      {n.type === 'challenge_invite' && (
                        <><strong style={{ color: '#ffd700' }}>@{n.from_username}</strong> challenged you to a Versus Draft!</>
                      )}
                      {n.type === 'match_result' && (
                        <>Match result ready</>
                      )}
                    </div>
                    {n.type === 'challenge_invite' && n.data?.challenge_id && (
                      <button
                        onClick={() => { setOpen(false); router.push(`/games/pack-empire/offense/versus/draft?challenge=${n.data.challenge_id}`); }}
                        style={{ background: 'linear-gradient(135deg,#20a050,#34d399)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', cursor: 'pointer' }}
                      >
                        Accept Challenge →
                      </button>
                    )}
                    {n.type === 'friend_request' && (
                      <button
                        onClick={() => { setOpen(false); router.push('/profile?tab=friends'); }}
                        style={{ background: 'none', border: '1px solid #27272a', borderRadius: 6, color: '#60a5fa', fontSize: 11, fontWeight: 700, padding: '4px 10px', cursor: 'pointer' }}
                      >
                        View request →
                      </button>
                    )}
                  </div>
                  {!n.read && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffd700', flexShrink: 0, marginTop: 4 }} />
                  )}
                </div>
              ))
            )}
            <button
              onClick={() => { setOpen(false); router.push('/profile?tab=friends'); }}
              style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', borderTop: '1px solid #27272a', color: '#52525b', fontSize: 12, cursor: 'pointer', textAlign: 'center', transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#d4d4d8')}
              onMouseLeave={e => (e.currentTarget.style.color = '#52525b')}
            >
              View all in Profile →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function UserButton() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (loading) {
    return <div className="w-36 h-10 bg-zinc-800 rounded-full animate-pulse" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="group relative inline-flex items-center gap-2.5 bg-zinc-900 border border-zinc-700 hover:border-emerald-500/60 rounded-full pl-3 pr-5 py-2.5 text-sm font-bold transition-all duration-200 hover:bg-zinc-800"
      >
        {/* Icon circle */}
        <span className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 flex items-center justify-center text-zinc-500 group-hover:text-emerald-400 transition-all duration-200">
          <UserIcon />
        </span>
        <span className="text-zinc-300 group-hover:text-white transition-colors">Login</span>
        <span className="text-zinc-600 group-hover:text-emerald-500 transition-colors text-xs">→</span>
      </Link>
    );
  }

  const displayName =
    user.user_metadata?.full_name?.split(' ')[0] ||
    user.email?.split('@')[0] ||
    'Player';

  return (
<div className="flex items-center gap-3">
  {/* Notification bell */}
  <NotificationBell userId={user.id} />

  <Link
        href="/profile"
        className="group flex items-center gap-3 bg-zinc-900 border border-zinc-700 hover:border-emerald-500/50 rounded-2xl px-4 py-2.5 transition-all duration-200 hover:bg-zinc-800"
>
        {/* Initial avatar */}
<div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[11px] font-black text-emerald-400">
          {displayName.charAt(0).toUpperCase()}
</div>
<div>
<div className="text-xs font-bold leading-tight">Hi, {displayName}</div>
<div className="text-[10px] text-emerald-500 group-hover:text-emerald-400 transition-colors mt-0.5">
            View Profile →
</div>
</div>
</Link>
<button
        onClick={handleSignOut}
        title="Sign out"
        className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
>
<LogOutIcon />
</button>
</div>
  );
}