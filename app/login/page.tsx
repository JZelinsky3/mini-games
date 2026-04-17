'use client';
import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

// ─── Icons ────────────────────────────────────────────────────────────────────

const FootballIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
    <ellipse cx="12" cy="12" rx="10" ry="6" transform="rotate(-45 12 12)"/>
    <path d="m9.5 9.5 5 5M7 7l2 2M15 15l2 2"/>
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" style={{ width: 15, height: 15 }} fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

// ─── Field component ──────────────────────────────────────────────────────────

function Field({
  label, type = 'text', value, onChange, placeholder, suffix, required, maxLength,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: React.ReactNode;
  required?: boolean;
  maxLength?: number;
}) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label style={{
        display: 'block',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: focused ? 'var(--amber, #e8a84b)' : 'var(--ink-mute, #7d7463)',
        marginBottom: 7,
        transition: 'color 0.2s',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={isPassword && showPw ? 'text' : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          maxLength={maxLength}
          placeholder={placeholder}
          style={{
            width: '100%',
            background: 'var(--bg, #141311)',
            border: `1px solid ${focused ? 'var(--amber, #e8a84b)' : 'var(--line, #3a3630)'}`,
            borderRadius: '2px',
            padding: isPassword || suffix ? '11px 40px 11px 14px' : '11px 14px',
            color: 'var(--ink, #f4ebd8)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 14,
            outline: 'none',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box',
          }}
        />
        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw(s => !s)}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--ink-mute, #7d7463)',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
            }}
          >
            <EyeIcon open={showPw} />
          </button>
        )}
        {/* Status suffix (check / x / checking) */}
        {suffix && !isPassword && (
          <div style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            pointerEvents: 'none',
          }}>
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main login page ──────────────────────────────────────────────────────────

function LoginPage() {
  const [isLogin, setIsLogin]       = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [username, setUsername]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername]   = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get('redirect');
  const supabase     = createClient();

  // Live username check
  useEffect(() => {
    if (isLogin || !username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    const check = async () => {
      setCheckingUsername(true);
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .single();
      setUsernameAvailable(!data);
      setCheckingUsername(false);
    };
    const t = setTimeout(check, 600);
    return () => clearTimeout(t);
  }, [username, isLogin, supabase]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (isLogin) {
        let loginEmail = identifier;
        if (!identifier.includes('@')) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', identifier.toLowerCase())
            .single();
          if (!profile?.email) throw new Error('Username not found');
          loginEmail = profile.email;
        }
        const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
        if (error) throw error;
        router.push(redirectTo ? decodeURIComponent(redirectTo) : '/');
        router.refresh();
      } else {
        if (!username || username.length < 3) throw new Error('Username must be at least 3 characters');
        if (usernameAvailable === false)       throw new Error('That username is already taken');
        if (!email)                            throw new Error('Email is required');
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: username.toLowerCase() } },
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Account created — you can now sign in.' });
        setTimeout(() => {
          setIsLogin(true);
          setIdentifier('');
          setPassword('');
          setUsername('');
        }, 1500);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
      setLoading(false);
    }
  };

  const usernameSuffix = checkingUsername
    ? <span style={{ color: 'var(--ink-mute)' }}>···</span>
    : usernameAvailable === true
    ? <span style={{ color: 'var(--amber, #e8a84b)' }}>✓</span>
    : usernameAvailable === false
    ? <span style={{ color: 'var(--rust, #c04820)' }}>✕</span>
    : null;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        :root {
          --bg: #141311;
          --bg-soft: #1c1b18;
          --bg-card: #201e1a;
          --ink: #f4ebd8;
          --ink-soft: #bfb5a0;
          --ink-mute: #7d7463;
          --amber: #e8a84b;
          --amber-bright: #f4c06a;
          --rust: #c04820;
          --line: #3a3630;
        }
        html, body {
          background: var(--bg);
          color: var(--ink);
          font-family: 'Space Grotesk', sans-serif;
        }
        input::placeholder { color: var(--ink-mute); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px var(--bg) inset !important;
          -webkit-text-fill-color: var(--ink) !important;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle at 25% 35%, rgba(232,168,75,0.06) 0%, transparent 50%), radial-gradient(circle at 75% 70%, rgba(192,72,32,0.04) 0%, transparent 45%)',
        }} />

        <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

          {/* Masthead */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 20 }}>
              <span style={{ color: 'var(--amber)' }}><FootballIcon /></span>
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: 'var(--amber)',
                }}>
                  NFL Minigames Hub
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 8.5,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-mute)',
                  marginTop: 2,
                }}>
                  The Almanac · Vol. 01
                </div>
              </div>
            </Link>

            <div style={{
              width: '100%',
              height: 1,
              background: 'var(--line)',
              marginBottom: 24,
            }} />

            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 'clamp(2rem, 6vw, 2.8rem)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              color: 'var(--ink)',
              margin: 0,
              marginBottom: 6,
            }}>
              {isLogin ? 'Welcome back.' : 'Join the hub.'}
            </h1>
            <p style={{
              fontFamily: "'DM Serif Display', serif",
              fontStyle: 'italic',
              fontSize: 14,
              color: 'var(--ink-mute)',
              margin: 0,
            }}>
              {isLogin
                ? 'Sign in to pick up your streak.'
                : 'Create your account and start competing.'}
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--line)',
            borderTop: '2px solid var(--amber)',
            padding: '28px 28px 24px',
          }}>

            {/* Tab switcher */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              borderBottom: '1px solid var(--line)',
              marginBottom: 26,
            }}>
              {(['Login', 'Create Account'] as const).map((label, i) => {
                const active = i === 0 ? isLogin : !isLogin;
                return (
                  <button
                    key={label}
                    onClick={() => { setIsLogin(i === 0); setMessage(null); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: `2px solid ${active ? 'var(--amber)' : 'transparent'}`,
                      marginBottom: -1,
                      padding: '0 0 12px',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: active ? 'var(--amber)' : 'var(--ink-mute)',
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Username — sign up only */}
              {!isLogin && (
                <Field
                  label="Username"
                  value={username}
                  onChange={v => setUsername(v.trim())}
                  placeholder="Pick a unique handle"
                  required
                  maxLength={20}
                  suffix={usernameSuffix}
                />
              )}

              <Field
                label={isLogin ? 'Email or Username' : 'Email'}
                value={isLogin ? identifier : email}
                onChange={isLogin ? setIdentifier : setEmail}
                placeholder={isLogin ? 'you@email.com or username' : 'you@email.com'}
                required
              />

              <Field
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                required
              />

              {/* Message */}
              {message && (
                <div style={{
                  padding: '10px 14px',
                  border: `1px solid ${message.type === 'success' ? 'rgba(232,168,75,0.3)' : 'rgba(192,72,32,0.3)'}`,
                  background: message.type === 'success' ? 'rgba(232,168,75,0.06)' : 'rgba(192,72,32,0.06)',
                  borderLeft: `3px solid ${message.type === 'success' ? 'var(--amber)' : 'var(--rust)'}`,
                }}>
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 12,
                    color: message.type === 'success' ? 'var(--amber)' : 'var(--rust)',
                  }}>
                    {message.text}
                  </span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || (!isLogin && usernameAvailable === false)}
                style={{
                  width: '100%',
                  padding: '13px',
                  background: loading ? 'transparent' : 'var(--amber)',
                  border: `1px solid ${loading ? 'var(--line)' : 'var(--amber)'}`,
                  borderRadius: '2px',
                  color: loading ? 'var(--ink-mute)' : 'var(--bg)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  marginTop: 4,
                }}
              >
                {loading ? '···' : isLogin ? 'Sign In →' : 'Create Account →'}
              </button>
            </form>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '20px 0',
            }}>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: 'var(--ink-mute)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}>
                or
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '11px',
                background: 'transparent',
                border: '1px solid var(--line)',
                borderRadius: '2px',
                color: 'var(--ink-soft)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(232,168,75,0.3)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-soft)';
              }}
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </div>

          {/* Footer nav */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 20,
            paddingTop: 20,
            borderTop: '1px solid var(--line)',
          }}>
            <Link href="/" style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ink-mute)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--amber)'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-mute)'}
            >
              ← Back to hub
            </Link>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              color: 'var(--ink-mute)',
              letterSpacing: '0.12em',
            }}>
              Free to play · Always
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

function LoginFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#141311',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <span style={{
        fontFamily: 'monospace',
        fontSize: 11,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: '#7d7463',
      }}>
        Loading···
      </span>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPage />
    </Suspense>
  );
}