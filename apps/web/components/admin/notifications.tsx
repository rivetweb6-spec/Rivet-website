'use client';

import * as React from 'react';
import { adminApi, getStoredToken } from '@/lib/admin-api';

type QuotationNotificationsValue = {
  unreadCount: number;
  applyUnreadCount: (count: number) => void;
  refresh: () => Promise<void>;
};

const QuotationNotificationsContext = React.createContext<QuotationNotificationsValue | null>(
  null,
);

/**
 * Live unread quotation count for the admin badge.
 * Count comes from persisted `readAt` on the server — not a local hide.
 */
export function QuotationNotificationsProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = React.useState(0);

  const applyUnreadCount = React.useCallback((count: number) => {
    setUnreadCount(Math.max(0, count));
  }, []);

  const refresh = React.useCallback(async () => {
    try {
      const data = await adminApi.analytics();
      setUnreadCount(data.cards.quotationUnread);
    } catch {
      /* ignore transient poll errors */
    }
  }, []);

  React.useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const data = await adminApi.analytics();
        if (!cancelled) setUnreadCount(data.cards.quotationUnread);
      } catch {
        /* ignore */
      }
    };
    poll();
    const id = window.setInterval(poll, 15000);

    let es: EventSource | null = null;
    try {
      es = new EventSource(`${adminApi.eventsUrl()}?token=${encodeURIComponent(token)}`);
      es.addEventListener('quotation-request', () => {
        setUnreadCount((c) => c + 1);
      });
      es.addEventListener('quotation-read', () => {
        void poll();
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

  const value = React.useMemo(
    () => ({ unreadCount, applyUnreadCount, refresh }),
    [unreadCount, applyUnreadCount, refresh],
  );

  return (
    <QuotationNotificationsContext.Provider value={value}>
      {children}
    </QuotationNotificationsContext.Provider>
  );
}

export function useQuotationNotifications() {
  const ctx = React.useContext(QuotationNotificationsContext);
  if (!ctx) {
    throw new Error('useQuotationNotifications must be used within QuotationNotificationsProvider');
  }
  return ctx;
}
