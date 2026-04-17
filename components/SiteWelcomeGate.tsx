'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Drop this component at the top of your site home page
 * (app/page.tsx).
 *
 * On a user's very first visit ever, it redirects them to /welcome.
 * Uses localStorage, so once they've seen it once, they never see it again —
 * even across new sessions, new tabs, etc.
 *
 * This is SEPARATE from the Pack Empire welcome gate — each uses its own
 * storage key so they don't interfere with each other.
 *
 * To reset during testing, open DevTools console and run:
 *   localStorage.removeItem('nflhub_welcome_seen')
 */
export default function SiteWelcomeGate() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem('nflhub_welcome_seen');
      if (!seen) {
        router.replace('/welcome');
        return;
      }
    } catch (e) {
      // localStorage blocked — just render the home page
    }
    setChecked(true);
  }, [router]);

  // Prevents a flash of the home page before the redirect kicks in.
  if (!checked) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#141311',
          zIndex: 9999,
        }}
      />
    );
  }

  return null;
}