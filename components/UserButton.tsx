'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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
        className="px-6 py-2.5 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition"
      >
        Sign In / Sign Up
      </Link>
    );
  }

  const displayName = user.user_metadata?.full_name?.split(' ')[0] || 
                     user.email?.split('@')[0] || 'Player';

  return (
    <div className="flex items-center gap-4">
      <Link 
        href="/profile"
        className="flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-emerald-500 rounded-2xl px-5 py-2.5 transition-all"
      >
        <div>
          <div className="font-bold text-sm">Hi, {displayName}</div>
          <div className="text-[10px] text-emerald-400 -mt-0.5">View Profile →</div>
        </div>
      </Link>

      <button
        onClick={handleSignOut}
        className="text-xs text-zinc-500 hover:text-red-400 transition"
      >
        Sign Out
      </button>
    </div>
  );
}