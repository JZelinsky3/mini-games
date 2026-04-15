import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,           // This is what actually controls "Remember Me"
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: typeof window !== 'undefined' ? localStorage : undefined,
      },
    }
  )
}