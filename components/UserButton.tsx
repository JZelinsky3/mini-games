'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// ─── Icons (matching home page stroke style) ──────────────────────────────────

const UserIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const LogOutIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

// Newspaper-style bell — clean, editorial, matches the site's stroke weight
const BellIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

// ─── Notification Bell ────────────────────────────────────────────────────────

function NotificationBell({ userId }: { userId: string }) {
  const supabase = createClient();
  const router   = useRouter();
  const [unread, setUnread] = useState(0);
  const [open, setOpen]     = useState(false);
  const [notifs, setNotifs] = useState<any[]>([]);

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
        style={{
          width: 34,
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: unread > 0 ? 'rgba(232,168,75,0.08)' : 'transparent',
          border: `1px solid ${unread > 0 ? 'rgba(232,168,75,0.3)' : 'var(--line, #3a3630)'}`,
          borderRadius: '2px',
          color: unread > 0 ? 'var(--amber, #e8a84b)' : 'var(--ink-mute, #7d7463)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          if (unread === 0) {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(232,168,75,0.3)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-soft, #bfb5a0)';
          }
        }}
        onMouseLeave={e => {
          if (unread === 0) {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line, #3a3630)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-mute, #7d7463)';
          }
        }}
      >
        <BellIcon />
        {unread > 0 && (
          <span style={{
            position: 'absolute',
            top: -4,
            right: -4,
            background: 'var(--rust, #c04820)',
            color: 'var(--ink, #f4ebd8)',
            borderRadius: '2px',
            width: 15,
            height: 15,
            fontSize: 8,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid var(--bg, #141311)',
            letterSpacing: 0,
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
          {/* Dropdown — newspaper card style */}
          <div style={{
            position: 'absolute',
            right: 0,
            top: 42,
            zIndex: 50,
            background: 'var(--bg-card, #201e1a)',
            border: '1px solid var(--line, #3a3630)',
            borderTop: '2px solid var(--amber, #e8a84b)',
            width: 300,
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              padding: '8px 14px',
              borderBottom: '1px solid var(--line, #3a3630)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--amber, #e8a84b)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}>
                Dispatches
              </span>
              {unread === 0 && (
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  color: 'var(--ink-mute, #7d7463)',
                  letterSpacing: '0.1em',
                }}>
                  All clear
                </span>
              )}
            </div>

            {notifs.length === 0 ? (
              <div style={{
                padding: '28px 14px',
                textAlign: 'center',
                fontFamily: "'DM Serif Display', serif",
                fontStyle: 'italic',
                color: 'var(--ink-mute, #7d7463)',
                fontSize: 14,
              }}>
                Nothing new to report.
              </div>
            ) : (
              notifs.map(n => (
                <div key={n.id} style={{
                  display: 'flex',
                  gap: 10,
                  padding: '11px 14px',
                  borderBottom: '1px solid var(--line, #3a3630)',
                  background: n.read ? 'transparent' : 'rgba(232,168,75,0.04)',
                  alignItems: 'flex-start',
                }}>
                  {/* Type marker */}
                  <div style={{
                    width: 3,
                    alignSelf: 'stretch',
                    background: n.type === 'friend_request'
                      ? 'var(--amber, #e8a84b)'
                      : n.type === 'challenge_invite'
                      ? 'var(--rust, #c04820)'
                      : 'var(--ink-mute, #7d7463)',
                    flexShrink: 0,
                    borderRadius: 1,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12,
                      color: 'var(--ink-soft, #bfb5a0)',
                      lineHeight: 1.45,
                      marginBottom: 5,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}>
                      {n.type === 'friend_request' && (
                        <><strong style={{ color: 'var(--amber, #e8a84b)' }}>@{n.from_username}</strong> sent you a friend request</>
                      )}
                      {n.type === 'challenge_invite' && (
                        <><strong style={{ color: 'var(--rust, #c04820)' }}>@{n.from_username}</strong> challenged you to a Versus Draft!</>
                      )}
                      {n.type === 'match_result' && (
                        <>Match result is ready</>
                      )}
                    </div>
                    {n.type === 'challenge_invite' && n.data?.challenge_id && (
                      <button
                        onClick={() => { setOpen(false); router.push(`/games/pack-empire/offense/versus/draft?challenge=${n.data.challenge_id}`); }}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--rust, #c04820)',
                          color: 'var(--rust, #c04820)',
                          borderRadius: '2px',
                          fontSize: 10,
                          fontWeight: 700,
                          fontFamily: "'JetBrains Mono', monospace",
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          cursor: 'pointer',
                        }}
                      >
                        Accept →
                      </button>
                    )}
                    {n.type === 'friend_request' && (
                      <button
                        onClick={() => { setOpen(false); router.push('/profile?tab=friends'); }}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--amber, #e8a84b)',
                          color: 'var(--amber, #e8a84b)',
                          borderRadius: '2px',
                          fontSize: 10,
                          fontWeight: 700,
                          fontFamily: "'JetBrains Mono', monospace",
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          cursor: 'pointer',
                        }}
                      >
                        View →
                      </button>
                    )}
                  </div>
                  {!n.read && (
                    <div style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: 'var(--amber, #e8a84b)',
                      flexShrink: 0,
                      marginTop: 5,
                    }} />
                  )}
                </div>
              ))
            )}

            <button
              onClick={() => { setOpen(false); router.push('/profile?tab=friends'); }}
              style={{
                width: '100%',
                padding: '9px 14px',
                background: 'none',
                border: 'none',
                borderTop: '1px solid var(--line, #3a3630)',
                color: 'var(--ink-mute, #7d7463)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--amber, #e8a84b)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-mute, #7d7463)')}
            >
              View all dispatches →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main UserButton ──────────────────────────────────────────────────────────

export default function UserButton() {
  const [user, setUser]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router  = useRouter();
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
    return (
      <div style={{
        width: 140,
        height: 36,
        background: 'var(--bg-card, #201e1a)',
        border: '1px solid var(--line, #3a3630)',
        borderRadius: '2px',
        animation: 'pulse 1.5s ease-in-out infinite',
      }} />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 14px 7px 10px',
          background: 'transparent',
          border: '1px solid var(--line, #3a3630)',
          borderRadius: '2px',
          color: 'var(--ink-soft, #bfb5a0)',
          textDecoration: 'none',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--amber, #e8a84b)';
          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--amber, #e8a84b)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--line, #3a3630)';
          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-soft, #bfb5a0)';
        }}
      >
        <span style={{ color: 'var(--ink-mute, #7d7463)' }}><UserIcon /></span>
        Sign in
        <span style={{ color: 'var(--amber, #e8a84b)', fontSize: 10 }}>→</span>
      </Link>
    );
  }

  const displayName =
    user.user_metadata?.full_name?.split(' ')[0] ||
    user.email?.split('@')[0] ||
    'Player';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* Bell */}
      <NotificationBell userId={user.id} />

      {/* Profile link — editorial card style */}
      <Link
        href="/profile"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '5px 12px 5px 7px',
          background: 'var(--bg-card, #201e1a)',
          border: '1px solid var(--line, #3a3630)',
          borderRadius: '2px',
          textDecoration: 'none',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(232,168,75,0.4)'}
        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--line, #3a3630)'}
      >
        {/* Initial avatar */}
        <div style={{
          width: 26,
          height: 26,
          background: 'rgba(232,168,75,0.1)',
          border: '1px solid rgba(232,168,75,0.25)',
          borderRadius: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--amber, #e8a84b)',
          flexShrink: 0,
        }}>
          {displayName.charAt(0).toUpperCase()}
        </div>

        <div>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--ink, #f4ebd8)',
            lineHeight: 1.2,
          }}>
            {displayName}
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            fontWeight: 700,
            color: 'var(--amber, #e8a84b)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginTop: 1,
          }}>
            Profile →
          </div>
        </div>
      </Link>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        title="Sign out"
        style={{
          width: 34,
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: '1px solid var(--line, #3a3630)',
          borderRadius: '2px',
          color: 'var(--ink-mute, #7d7463)',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(192,72,32,0.4)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--rust, #c04820)';
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(192,72,32,0.06)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line, #3a3630)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-mute, #7d7463)';
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
      >
        <LogOutIcon />
      </button>
    </div>
  );
}