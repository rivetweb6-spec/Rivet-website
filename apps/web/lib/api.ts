/**
 * Typed API client for the RIVET Express backend.
 * Works in Server Components and browser forms.
 *
 * In the browser we always hit same-origin `/api` (proxied by Next.js to the
 * Express backend) so public forms work when the API is on a different host.
 */

function getApiUrl(): string {
  if (typeof window !== 'undefined') return '/api';
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

type RequestOptions = RequestInit & {
  /** Next.js ISR revalidate (server only). */
  revalidate?: number | false;
};

async function request<T>(path: string, init?: RequestOptions): Promise<T> {
  const { revalidate, ...rest } = init ?? {};
  const isServer = typeof window === 'undefined';

  let res: Response;
  try {
    res = await fetch(`${getApiUrl()}${path}`, {
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
  } catch {
    throw new ApiError(
      0,
      'Cannot reach the server. Please check your connection and try again.',
    );
  }

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

export type SeoFields = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  primaryKeyword?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
};

export type FaqItem = { question: string; answer: string };

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  order: number;
  faqs?: FaqItem[] | null;
  _count?: { products: number };
} & SeoFields;

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
} & SeoFields;

export type Service = {
  id: string;
  title: string;
  slug: string;
  narrative: string;
  icon: string | null;
  image: string | null;
  order: number;
  faqs?: FaqItem[] | null;
} & SeoFields;

export type NewsArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  coverImage: string | null;
  category: string | null;
  publishedAt: string | null;
} & SeoFields;

export type PageSeo = {
  id: string;
  pageKey: string;
} & SeoFields;

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

export type SearchSuggestion = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  image: string | null;
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
    suggest: (q: string) =>
      request<{
        products: SearchSuggestion[];
        categories: { name: string; slug: string }[];
      }>(`/products/suggest?q=${encodeURIComponent(q)}`),
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

  pageSeo: {
    list: () => request<{ pages: PageSeo[] }>('/page-seo'),
    byKey: (pageKey: string) => request<{ page: PageSeo | null }>(`/page-seo/${pageKey}`),
  },

  contactInfo: () => request<{ info: ContactInfo | null }>('/contact-info'),

  quotationRequest: (data: {
    fullName: string;
    company?: string;
    email: string;
    phone: string;
    productInterest: string;
    productId?: string;
    productName?: string;
    productSlug?: string;
    productImage?: string;
    quantity?: string;
    message?: string;
  }) =>
    request<{ ok: boolean; id: string }>('/quotation-requests', {
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
