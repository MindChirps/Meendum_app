import { useState, useEffect } from 'react';
import type { SessionType } from '../types/database';

/**
 * Returns the current session type based on local time.
 *  - 06:00–11:59 → 'morning'
 *  - 12:00–16:59 → 'afternoon'
 *  - 17:00–21:00 → 'evening'
 *  - otherwise   → null (outside session hours)
 *
 * Re-checks every minute so a session change crosses naturally.
 */
export function useCurrentSession(): SessionType | null {
  const [session, setSession] = useState<SessionType | null>(() => computeSession());

  useEffect(() => {
    const id = setInterval(() => {
      setSession(computeSession());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  return session;
}

function computeSession(): SessionType | null {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return null;
}
