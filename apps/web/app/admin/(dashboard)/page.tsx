'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { adminApi } from '@/lib/admin-api';
import { AdminCard, AdminPageHeader, StatusBadge } from '@/components/admin/ui';

export default function AdminDashboardPage() {
  const [data, setData] = React.useState<Awaited<ReturnType<typeof adminApi.analytics>> | null>(
    null,
  );
  const [error, setError] = React.useState<string | null>(null);

  // State is only set when the request settles (never synchronously in the effect).
  const load = React.useCallback(() => {
    adminApi
      .analytics()
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const header = (
    <AdminPageHeader title="Dashboard" description="Overview of catalog, content, and inbound leads." />
  );

  if (error) {
    return (
      <div>
        {header}
        <div role="alert" className="rounded-lg border border-error/20 bg-error/10 p-5">
          <p className="text-sm text-error">Could not load the dashboard: {error}</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setData(null);
              load();
            }}
            className="mt-3 inline-flex h-10 items-center rounded-md bg-navy px-4 text-xs font-medium text-white hover:bg-navy-600"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div>
        {header}
        <div role="status" aria-busy="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <span className="sr-only">Loading dashboard…</span>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="h-28 animate-pulse rounded-lg bg-surface shadow-[var(--shadow-sm)]"
            />
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Products', value: data.cards.products, href: '/admin/products' },
    { label: 'Categories', value: data.cards.categories, href: '/admin/categories' },
    { label: 'Services', value: data.cards.services, href: '/admin/services' },
    { label: 'Certificates & Portfolio', value: data.cards.certificates, href: '/admin/certificates' },
    { label: 'Team', value: data.cards.team ?? 0, href: '/admin/team' },
    { label: 'Gallery', value: data.cards.gallery ?? 0, href: '/admin/gallery' },
    { label: 'News', value: data.cards.news, href: '/admin/news' },
    { label: 'Open vacancies', value: data.cards.vacanciesOpen ?? 0, href: '/admin/vacancies' },
    { label: 'Job applications', value: data.cards.applicationsTotal ?? 0, href: '/admin/vacancies' },
    { label: 'Quotation requests', value: data.cards.quotationTotal, href: '/admin/quotation-requests' },
    { label: 'New quotations', value: data.cards.quotationNew, href: '/admin/quotation-requests' },
  ];

  const chartData = data.quotationsByStatus.map((row) => ({
    status: row.status,
    count: row._count,
  }));

  return (
    <div>
      {header}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <AdminCard className="transition-shadow hover:shadow-[var(--shadow-md)]">
              <p className="text-2xs text-muted">{c.label}</p>
              <p className="mt-2 font-display text-4xl text-navy">{c.value}</p>
            </AdminCard>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <AdminCard className="lg:col-span-3">
          <h2 className="text-lg text-navy">Quotation requests by status</h2>
          {/* Visual only: the status list below carries the same numbers for assistive tech. */}
          <div className="mt-4 h-64" aria-hidden={chartData.length > 0 ? true : undefined}>
            {chartData.length === 0 ? (
              <p className="text-xs text-muted">No quotation requests yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#D69A2E" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <ul className="mt-2 flex flex-wrap gap-3" aria-label="Quotation requests by status">
            {data.quotationsByStatus.map((row) => (
              <li key={row.status} className="flex items-center gap-2 text-2xs">
                <StatusBadge status={row.status} />
                <span className="font-medium text-ink">{row._count}</span>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg text-navy">Recent quotation requests</h2>
            <Link
              href="/admin/quotation-requests"
              className="inline-block py-1.5 text-2xs font-medium text-navy underline-offset-4 hover:text-gold hover:underline"
            >
              View all<span className="sr-only"> quotation requests</span>
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-divider">
            {data.recentQuotations.length === 0 && (
              <li className="py-4 text-xs text-muted">No recent requests.</li>
            )}
            {data.recentQuotations.map((d) => (
              <li key={d.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="text-xs font-medium text-ink">{d.fullName}</p>
                  <p className="text-3xs text-muted">
                    {d.productName ?? d.productInterest} · {new Date(d.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={d.status} />
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>
    </div>
  );
}
