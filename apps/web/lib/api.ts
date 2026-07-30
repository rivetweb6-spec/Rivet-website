/**
 * Typed API client for the RIVET Express backend.
 * Works in Server Components and browser forms.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = RequestInit & {
  /** Next.js ISR revalidate (server only). */
  revalidate?: number | false;
};

async function request<T>(path: string, init?: RequestOptions): Promise<T> {
  const { revalidate, ...rest } = init ?? {};
  const isServer = typeof window === 'undefined';

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(rest.headers ?? {}),
    },
    ...(isServer && revalidate !== undefined
      ? { next: { revalidate: revalidate === false ? 0 : revalidate } }
      : isServer
        ? { next: { revalidate: 60 } }
        : { cache: 'no-store' }),
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

/* ── Types mirroring API responses ─────────────────────────────────────── */

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  order: number;
  _count?: { products: number };
};

export type ProductImage = {
  id: string;
  url: string;
  publicId: string | null;
  alt: string | null;
  order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  shortDescription: string | null;
  description: string | null;
  brand: string | null;
  countryOfOrigin: string | null;
  specs: { label: string; value: string }[] | null;
  features: string[] | null;
  featured: boolean;
  status: string;
  category?: Category;
  images: ProductImage[];
};

export type Service = {
  id: string;
  title: string;
  slug: string;
  narrative: string;
  icon: string | null;
  image: string | null;
  order: number;
};

export type NewsArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  coverImage: string | null;
  category: string | null;
  publishedAt: string | null;
};

export type CompanyInfo = {
  id: string;
  history: string | null;
  vision: string | null;
  mission: string | null;
  coreValues: string[] | null;
  timeline: { year: string; title: string; description: string }[] | null;
  achievements: string[] | null;
  certifications: string[] | null;
};

export type ContactInfo = {
  id: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  facebook: string | null;
  linkedin: string | null;
  telegram: string | null;
  mapLat: number | null;
  mapLng: number | null;
};

export type HomePageContent = {
  id: string;
  eyebrow: string | null;
  headline: string | null;
  headlineAccent: string | null;
  subheadline: string | null;
  heroImage: string | null;
  introEyebrow: string | null;
  introTitle: string | null;
  introBody: string | null;
  introBodySecondary: string | null;
  introImage: string | null;
};

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
};

/* ── Public endpoints ──────────────────────────────────────────────────── */

export const api = {
  categories: {
    list: () => request<{ categories: Category[] }>('/categories'),
    bySlug: (slug: string) => request<{ category: Category }>(`/categories/${slug}`),
  },

  products: {
    list: (params?: {
      search?: string;
      category?: string;
      featured?: boolean;
      page?: number;
      pageSize?: number;
    }) => {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      if (params?.category) q.set('category', params.category);
      if (params?.featured !== undefined) q.set('featured', String(params.featured));
      if (params?.page) q.set('page', String(params.page));
      if (params?.pageSize) q.set('pageSize', String(params.pageSize));
      const qs = q.toString();
      return request<{ products: Product[]; pagination: Pagination }>(
        `/products${qs ? `?${qs}` : ''}`,
      );
    },
    bySlug: (slug: string) =>
      request<{ product: Product; related: Product[] }>(`/products/${slug}`),
  },

  services: {
    list: () => request<{ services: Service[] }>('/services'),
    bySlug: (slug: string) => request<{ service: Service }>(`/services/${slug}`),
  },

  news: {
    list: (params?: { category?: string; page?: number; pageSize?: number }) => {
      const q = new URLSearchParams();
      if (params?.category) q.set('category', params.category);
      if (params?.page) q.set('page', String(params.page));
      if (params?.pageSize) q.set('pageSize', String(params.pageSize));
      const qs = q.toString();
      return request<{ articles: NewsArticle[]; pagination: Pagination }>(
        `/news${qs ? `?${qs}` : ''}`,
      );
    },
    bySlug: (slug: string) => request<{ article: NewsArticle }>(`/news/${slug}`),
  },

  company: () => request<{ company: CompanyInfo | null }>('/company'),

  home: () => request<{ home: HomePageContent | null }>('/home'),

  contactInfo: () => request<{ info: ContactInfo | null }>('/contact-info'),

  demoRequest: (data: {
    fullName: string;
    company?: string;
    email: string;
    phone: string;
    productInterest: string;
    message?: string;
  }) =>
    request<{ ok: boolean; id: string }>('/demo-requests', {
      method: 'POST',
      body: JSON.stringify(data),
      revalidate: false,
    }),

  contact: (data: { name: string; email: string; phone?: string; message: string }) =>
    request<{ ok: boolean }>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
      revalidate: false,
    }),
};
