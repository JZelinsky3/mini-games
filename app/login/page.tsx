'use client';
import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState(''); // email OR username
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Only for sign up
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [lastEmail, setLastEmail] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const supabase = createClient();

  // Live username check for sign up
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

    const timeout = setTimeout(check, 600);
    return () => clearTimeout(timeout);
  }, [username, isLogin, supabase]);

  const handleAuth = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setMessage(null);

  try {
    if (isLogin) {
      // Login with email OR username
      let loginEmail = identifier;

      if (!identifier.includes('@')) {
        // If no @, treat as username and lookup the real email
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', identifier.toLowerCase())
          .single();

        if (!profile?.email) throw new Error('Username not found');
        loginEmail = profile.email;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) throw error;

router.push(redirectTo ? decodeURIComponent(redirectTo) : '/');
router.refresh();
    } else {
      // SIGN UP
      if (!username || username.length < 3) {
        throw new Error('Username must be at least 3 characters');
      }
      if (usernameAvailable === false) {
        throw new Error('This username is already taken');
      }
      if (!email) {                    // ← This was the main error
        throw new Error('Email is required');
      }

      const { error } = await supabase.auth.signUp({
        email,                         // ← Now correctly using the email variable
        password,
        options: {
          data: { username: username.toLowerCase() },
        },
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Account created successfully! You can now sign in.',
      });

      // Auto switch to login tab and clear fields
      setTimeout(() => {
        setIsLogin(true);
        setIdentifier('');
        setPassword('');
        setUsername('');
      }, 1500);
    }
  } catch (error: any) {
    setMessage({
      type: 'error',
      text: error.message || 'Something went wrong',
    });
  } finally {
    setLoading(false);
  }
};

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <span className="text-6xl">🏈</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">NFL MiniGames Hub</h1>
          <p className="text-zinc-500 mt-3 text-lg">Save your progress. Compete with friends.</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 shadow-2xl">
          <div className="flex border-b border-zinc-800 mb-8">
            <button
              onClick={() => { setIsLogin(true); setMessage(null); }}
              className={`flex-1 pb-4 text-lg font-semibold transition-all ${isLogin ? 'border-b-2 border-white text-white' : 'text-zinc-500 hover:text-zinc-400'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setMessage(null); }}
              className={`flex-1 pb-4 text-lg font-semibold transition-all ${!isLogin ? 'border-b-2 border-white text-white' : 'text-zinc-500 hover:text-zinc-400'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="text-xs uppercase tracking-widest text-zinc-500 block mb-2">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.trim())}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-emerald-500 text-lg"
                    placeholder="Choose a unique username"
                    maxLength={20}
                  />
                  {checkingUsername && <span className="absolute right-5 top-4 text-zinc-500">Checking...</span>}
                  {usernameAvailable === true && <span className="absolute right-5 top-4 text-emerald-500">✓</span>}
                  {usernameAvailable === false && <span className="absolute right-5 top-4 text-red-500">✕</span>}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs uppercase tracking-widest text-zinc-500 block mb-2">
                {isLogin ? 'Email or Username' : 'Email'}
              </label>
              <input
                type="text"
                value={isLogin ? identifier : email}
                onChange={(e) => isLogin ? setIdentifier(e.target.value) : setEmail(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-emerald-500 text-lg"
                placeholder={isLogin ? "you@email.com or username" : "you@email.com"}
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-zinc-500 block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-emerald-500 text-lg"
                placeholder="••••••••"
              />
            </div>

            {message && (
              <div className={`text-sm p-4 rounded-2xl ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {message.text}
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 accent-emerald-500"
              />
              <label htmlFor="remember" className="ml-3 text-zinc-400 text-sm cursor-pointer">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || (!isLogin && usernameAvailable === false)}
              className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-zinc-200 transition disabled:opacity-70 text-lg"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full mt-6 flex items-center justify-center gap-3 border border-zinc-700 hover:border-zinc-500 py-4 rounded-2xl font-medium transition text-lg"
          >
            Continue with Google
          </button>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-zinc-500 hover:text-white text-sm transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-zinc-600 text-sm tracking-widest">LOADING...</div>
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