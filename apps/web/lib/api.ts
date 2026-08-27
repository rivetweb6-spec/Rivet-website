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

/** Direct API origin so CV uploads can bypass the Next.js/Vercel proxy size cap. */
function getDirectApiUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (explicit) return explicit;
  if (typeof window !== 'undefined') return '/api';
  return 'http://localhost:4000/api';
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
  /** Next.js cache tags (server only). */
  tags?: string[];
};

async function request<T>(path: string, init?: RequestOptions): Promise<T> {
  const { revalidate, tags, ...rest } = init ?? {};
  const isServer = typeof window === 'undefined';

  let res: Response;
  try {
    res = await fetch(`${getApiUrl()}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(rest.headers ?? {}),
      },
      ...(isServer
        ? {
            next: {
              revalidate: revalidate === false ? 0 : (revalidate ?? 60),
              ...(tags ? { tags } : {}),
            },
          }
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

async function parseError(res: Response): Promise<string> {
  let message = res.statusText;
  try {
    const body = (await res.json()) as { error?: string };
    if (body.error) message = body.error;
  } catch {
    /* ignore */
  }
  return message;
}

async function requestForm<T>(path: string, form: FormData): Promise<T> {
  const bases =
    typeof window !== 'undefined' && getDirectApiUrl() !== getApiUrl()
      ? [getDirectApiUrl(), getApiUrl()]
      : [getApiUrl()];

  let lastError: ApiError | null = null;
  for (const base of bases) {
    let res: Response;
    try {
      res = await fetch(`${base}${path}`, {
        method: 'POST',
        body: form,
        credentials: 'include',
        cache: 'no-store',
      });
    } catch {
      lastError = new ApiError(
        0,
        'Cannot reach the server. Please check your connection and try again.',
      );
      continue;
    }
    if (!res.ok) {
      throw new ApiError(res.status, await parseError(res));
    }
    return res.json() as Promise<T>;
  }
  throw lastError ?? new ApiError(0, 'Cannot reach the server. Please check your connection and try again.');
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
  updatedAt?: string;
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
  updatedAt?: string;
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
  updatedAt?: string;
} & SeoFields;

export type CertificateKind = 'CERTIFICATE' | 'PORTFOLIO';

export type Certificate = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  images: string[] | null;
  kind: CertificateKind;
  order: number;
};

export type TeamSection = 'LEADERSHIP' | 'ENGINEERING' | 'TEAM';

export type TeamMember = {
  id: string;
  fullName: string;
  position: string;
  bio: string | null;
  photo: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  section: TeamSection;
  order: number;
};

export type GalleryCategory = 'PHOTOS' | 'ACTIVITIES' | 'PROJECTS' | 'EVENTS' | 'OTHER';

export type GalleryImage = {
  id: string;
  title: string;
  description: string | null;
  image: string;
  category: GalleryCategory;
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
  updatedAt?: string;
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
  gmName: string | null;
  gmPosition: string | null;
  gmPhoto: string | null;
  gmMessage: string | null;
  engName: string | null;
  engPosition: string | null;
  engPhoto: string | null;
  engMessage: string | null;
};

export type Vacancy = {
  id: string;
  title: string;
  slug: string;
  department: string | null;
  location: string | null;
  employmentType: string | null;
  description: string;
  requirements: string;
  deadline: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  acceptingApplications?: boolean;
} & SeoFields;

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
    list: () => request<{ categories: Category[] }>('/categories', { tags: ['categories'] }),
    bySlug: (slug: string) =>
      request<{ category: Category }>(`/categories/${slug}`, { tags: ['categories'] }),
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
        { tags: ['products'] },
      );
    },
    bySlug: (slug: string) =>
      request<{ product: Product; related: Product[] }>(`/products/${slug}`, {
        tags: ['products'],
      }),
    suggest: (q: string) =>
      request<{
        products: SearchSuggestion[];
        categories: { name: string; slug: string }[];
      }>(`/products/suggest?q=${encodeURIComponent(q)}`),
  },

  services: {
    list: () => request<{ services: Service[] }>('/services', { tags: ['services'] }),
    bySlug: (slug: string) =>
      request<{ service: Service }>(`/services/${slug}`, { tags: ['services'] }),
  },

  certificates: {
    list: (kind?: CertificateKind) =>
      request<{ certificates: Certificate[] }>(
        `/certificates${kind ? `?kind=${kind}` : ''}`,
        { tags: ['certificates'] },
      ),
  },

  team: {
    list: () => request<{ members: TeamMember[] }>('/team', { tags: ['team'] }),
  },

  gallery: {
    list: (category?: GalleryCategory) =>
      request<{ images: GalleryImage[] }>(
        `/gallery${category ? `?category=${category}` : ''}`,
        { tags: ['gallery'] },
      ),
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
        { tags: ['news'] },
      );
    },
    bySlug: (slug: string) =>
      request<{ article: NewsArticle }>(`/news/${slug}`, { tags: ['news'] }),
  },

  company: () => request<{ company: CompanyInfo | null }>('/company', { tags: ['company'] }),

  home: () => request<{ home: HomePageContent | null }>('/home', { tags: ['home'] }),

  vacancies: {
    list: () => request<{ vacancies: Vacancy[] }>('/vacancies', { tags: ['vacancies'] }),
    bySlug: (slug: string) =>
      request<{ vacancy: Vacancy }>(`/vacancies/${slug}`, { tags: ['vacancies'] }),
    apply: (slug: string, form: FormData) =>
      requestForm<{ ok: boolean; id: string }>(`/vacancies/${slug}/apply`, form),
  },

  pageSeo: {
    list: () => request<{ pages: PageSeo[] }>('/page-seo', { tags: ['page-seo'] }),
    byKey: (pageKey: string) =>
      request<{ page: PageSeo | null }>(`/page-seo/${pageKey}`, {
        tags: ['page-seo', `page-seo-${pageKey}`],
      }),
  },

  contactInfo: () =>
    request<{ info: ContactInfo | null }>('/contact-info', { tags: ['contact-info'] }),

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
