'use client';

import * as React from 'react';
import { adminApi, getStoredToken } from '@/lib/admin-api';

/**
 * Live SSE notifications for new demo requests.
 * Falls back to a silent no-op if EventSource auth via query isn't available —
 * we pass the token as a query param since EventSource can't set headers.
 * If the API requires Bearer only, we poll analytics for demoNew as fallback.
 */
export function useDemoNotifications() {
  const [newCount, setNewCount] = React.useState(0);

  const clear = React.useCallback(() => setNewCount(0), []);

  React.useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    // Prefer SSE with token query (middleware also accepts Authorization;
    // EventSource can't set headers, so we poll as the reliable path).
    let cancelled = false;
    const poll = async () => {
      try {
        const data = await adminApi.analytics();
        if (!cancelled) setNewCount(data.cards.demoNew);
      } catch {
        /* ignore */
      }
    };
    poll();
    const id = window.setInterval(poll, 15000);

    // Also try SSE — if the server accepts cookie auth or we add token later
    let es: EventSource | null = null;
    try {
      es = new EventSource(`${adminApi.eventsUrl()}?token=${encodeURIComponent(token)}`);
      es.addEventListener('demo-request', () => {
        setNewCount((c) => c + 1);
      });
    } catch {
      /* EventSource unavailable */
    }

    return () => {
      cancelled = true;
      window.clearInterval(id);
      es?.close();
    };
  }, []);

  return { newCount, clear, bump: () => setNewCount((c) => c + 1) };
}
