'use client';

import * as React from 'react';
import { adminApi, getStoredToken } from '@/lib/admin-api';

type QuotationNotificationsValue = {
  unreadCount: number;
  applicationUnread: number;
  applyUnreadCount: (count: number) => void;
  applyApplicationUnread: (count: number) => void;
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
  const [applicationUnread, setApplicationUnread] = React.useState(0);

  const applyUnreadCount = React.useCallback((count: number) => {
    setUnreadCount(Math.max(0, count));
  }, []);

  const applyApplicationUnread = React.useCallback((count: number) => {
    setApplicationUnread(Math.max(0, count));
  }, []);

  const refresh = React.useCallback(async () => {
    try {
      const data = await adminApi.analytics();
      setUnreadCount(data.cards.quotationUnread);
      setApplicationUnread(data.cards.applicationsUnread ?? 0);
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
        if (!cancelled) {
          setUnreadCount(data.cards.quotationUnread);
          setApplicationUnread(data.cards.applicationsUnread ?? 0);
        }
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
      es.addEventListener('job-application', () => {
        setApplicationUnread((c) => c + 1);
      });
      es.addEventListener('job-application-read', () => {
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
    () => ({ unreadCount, applicationUnread, applyUnreadCount, applyApplicationUnread, refresh }),
    [unreadCount, applicationUnread, applyUnreadCount, applyApplicationUnread, refresh],
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
