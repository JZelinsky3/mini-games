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
        <span className="text-zinc-300 group-hover:text-white transition-colors">Sign In</span>
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