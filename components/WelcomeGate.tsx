'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Drop this component inside your home page (app/page.tsx).
 * On first visit of a session, it redirects the user to /welcome.
 * After they dismiss the welcome page, sessionStorage is set and
 * they land here normally on subsequent navigations.
 *
 * Swap sessionStorage -> localStorage if you want "show once ever"
 * instead of "show once per session."
 */
export default function WelcomeGate() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem('packempire_welcome_seen');
      if (!seen) {
        router.replace('/games/pack-empire/welcome');
        return;
      }
    } catch (e) {
      // sessionStorage blocked — just render the page
    }
    setChecked(true);
  }, [router]);

  // Prevents a flash of the home page before the redirect kicks in.
  // If sessionStorage is blocked we still end up rendering (checked=true).
  if (!checked) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#f4ecd8',
          zIndex: 9999,
        }}
      />
    );
  }

  return null;
}