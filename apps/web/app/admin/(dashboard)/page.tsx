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

  React.useEffect(() => {
    adminApi
      .analytics()
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p className="text-error">{error}</p>;
  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-[16px] bg-surface shadow-[var(--shadow-sm)]" />
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Products', value: data.cards.products, href: '/admin/products' },
    { label: 'Categories', value: data.cards.categories, href: '/admin/categories' },
    { label: 'Services', value: data.cards.services, href: '/admin/services' },
    { label: 'Certificates', value: data.cards.certificates, href: '/admin/certificates' },
    { label: 'News', value: data.cards.news, href: '/admin/news' },
    { label: 'Quotation requests', value: data.cards.quotationTotal, href: '/admin/quotation-requests' },
    { label: 'New quotations', value: data.cards.quotationNew, href: '/admin/quotation-requests' },
  ];

  const chartData = data.quotationsByStatus.map((row) => ({
    status: row.status,
    count: row._count,
  }));

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Overview of catalog, content, and inbound leads."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <AdminCard className="transition-shadow hover:shadow-[var(--shadow-md)]">
              <p className="text-[0.8125rem] text-muted">{c.label}</p>
              <p className="mt-2 font-display text-[2rem] text-navy">{c.value}</p>
            </AdminCard>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <AdminCard className="lg:col-span-3">
          <h2 className="text-[1.125rem] text-navy">Quotation requests by status</h2>
          <div className="mt-4 h-64">
            {chartData.length === 0 ? (
              <p className="text-[0.875rem] text-muted">No quotation requests yet.</p>
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
          <ul className="mt-2 flex flex-wrap gap-3">
            {data.quotationsByStatus.map((row) => (
              <li key={row.status} className="flex items-center gap-2 text-[0.8125rem]">
                <StatusBadge status={row.status} />
                <span className="font-medium text-ink">{row._count}</span>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[1.125rem] text-navy">Recent quotation requests</h2>
            <Link href="/admin/quotation-requests" className="text-[0.8125rem] text-gold hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-divider">
            {data.recentQuotations.length === 0 && (
              <li className="py-4 text-[0.875rem] text-muted">No recent requests.</li>
            )}
            {data.recentQuotations.map((d) => (
              <li key={d.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="text-[0.875rem] font-medium text-ink">{d.fullName}</p>
                  <p className="text-[0.75rem] text-muted">
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
