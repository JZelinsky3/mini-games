import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {          // ← made async
  const cookieStore = await cookies()           // ← added await (fixes the error)

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,   // ← matches your .env
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore — this happens in Server Components (middleware handles cookies)
          }
        },
      },
    }
  )
}