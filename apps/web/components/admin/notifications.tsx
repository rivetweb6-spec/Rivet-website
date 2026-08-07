'use client';

import * as React from 'react';
import { adminApi, getStoredToken } from '@/lib/admin-api';

/**
 * Live SSE notifications for new quotation requests.
 * EventSource can't set headers, so we pass the token as a query param and
 * also poll analytics for the reliable new-request count.
 */
export function useQuotationNotifications() {
  const [newCount, setNewCount] = React.useState(0);

  const clear = React.useCallback(() => setNewCount(0), []);

  React.useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const data = await adminApi.analytics();
        if (!cancelled) setNewCount(data.cards.quotationNew);
      } catch {
        /* ignore */
      }
    };
    poll();
    const id = window.setInterval(poll, 15000);

    // Also try SSE for instant updates.
    let es: EventSource | null = null;
    try {
      es = new EventSource(`${adminApi.eventsUrl()}?token=${encodeURIComponent(token)}`);
      es.addEventListener('quotation-request', () => {
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
