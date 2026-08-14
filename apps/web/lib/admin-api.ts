/**
 * Authenticated admin API client — Bearer JWT from localStorage.
 *
 * In the browser we always hit same-origin `/api` (proxied by Next.js to the
 * Express backend). That keeps login working when the API is hosted separately.
 */

function getApiUrl(): string {
  if (typeof window !== 'undefined') return '/api';
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
}

/** Direct API origin so multipart uploads bypass the Next.js/Vercel proxy size cap. */
function getDirectApiUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (explicit) return explicit;
  if (typeof window !== 'undefined') return '/api';
  return 'http://localhost:4000/api';
}

const TOKEN_KEY = 'rivet_admin_token';
const USER_KEY = 'rivet_admin_user';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
};

export class AdminApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Bust public ISR so homepage / news pages pick up admin changes immediately. */
export async function revalidatePublicCache(tag: string) {
  const token = getStoredToken();
  await fetch('/admin/revalidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ tag }),
  });
}

export function getStoredUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: AdminUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function adminRequest<T>(
  path: string,
  init?: RequestInit & { apiBase?: string },
): Promise<T> {
  const token = getStoredToken();
  const isForm = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  const { apiBase, headers: initHeaders, ...rest } = init ?? {};
  let res: Response;
  try {
    res = await fetch(`${apiBase ?? getApiUrl()}${path}`, {
      ...rest,
      credentials: 'include',
      headers: {
        ...(isForm ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(initHeaders ?? {}),
      },
      cache: 'no-store',
    });
  } catch {
    throw new AdminApiError(
      0,
      'Cannot reach the API. Confirm NEXT_PUBLIC_API_URL points at your hosted API (including /api) and redeploy the web app.',
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
    throw new AdminApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export const adminApi = {
  login: async (email: string, password: string) => {
    const data = await adminRequest<{ accessToken: string; user: AdminUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setSession(data.accessToken, data.user);
    return data;
  },

  logout: async () => {
    try {
      await adminRequest('/auth/logout', { method: 'POST' });
    } finally {
      clearSession();
    }
  },

  me: () => adminRequest<{ user: AdminUser }>('/auth/me'),

  updateProfile: (data: { name?: string; email?: string; avatarUrl?: string | null }) =>
    adminRequest<{ user: AdminUser }>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updatePassword: (currentPassword: string, newPassword: string) =>
    adminRequest<{ ok: boolean }>('/auth/me/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  analytics: () =>
    adminRequest<{
      cards: {
        products: number;
        categories: number;
        services: number;
        certificates: number;
        news: number;
        quotationTotal: number;
        quotationNew: number;
        quotationUnread: number;
        contactMessages: number;
      };
      quotationsByStatus: { status: string; _count: number }[];
      recentQuotations: {
        id: string;
        fullName: string;
        email: string;
        productInterest: string;
        productName: string | null;
        status: string;
        createdAt: string;
      }[];
    }>('/analytics/overview'),

  categories: {
    list: () => adminRequest<{ categories: Category[] }>('/categories'),
    create: (data: Partial<Category> & { name: string }) =>
      adminRequest<{ category: Category }>('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Category>) =>
      adminRequest<{ category: Category }>(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: string, reassignToCategoryId?: string) => {
      const query = reassignToCategoryId
        ? `?reassignToCategoryId=${encodeURIComponent(reassignToCategoryId)}`
        : '';
      return adminRequest<{ ok: boolean }>(`/categories/${id}${query}`, { method: 'DELETE' });
    },
  },

  products: {
    list: () => adminRequest<{ products: AdminProduct[] }>('/products/admin/all'),
    create: (data: ProductInput) =>
      adminRequest<{ product: AdminProduct }>('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<ProductInput>) =>
      adminRequest<{ product: AdminProduct }>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      adminRequest<{ ok: boolean }>(`/products/${id}`, { method: 'DELETE' }),
  },

  services: {
    list: () => adminRequest<{ services: AdminService[] }>('/services/admin/all'),
    create: (data: ServiceInput) =>
      adminRequest<{ service: AdminService }>('/services', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<ServiceInput>) =>
      adminRequest<{ service: AdminService }>(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      adminRequest<{ ok: boolean }>(`/services/${id}`, { method: 'DELETE' }),
  },

  certificates: {
    list: () => adminRequest<{ certificates: AdminCertificate[] }>('/certificates/admin/all'),
    create: (data: CertificateInput) =>
      adminRequest<{ certificate: AdminCertificate }>('/certificates', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<CertificateInput>) =>
      adminRequest<{ certificate: AdminCertificate }>(`/certificates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    reorder: (ids: string[]) =>
      adminRequest<{ certificates: AdminCertificate[] }>('/certificates/reorder', {
        method: 'PUT',
        body: JSON.stringify({ ids }),
      }),
    remove: (id: string) =>
      adminRequest<{ ok: boolean }>(`/certificates/${id}`, { method: 'DELETE' }),
  },

  news: {
    list: () => adminRequest<{ articles: AdminArticle[] }>('/news/admin/all'),
    create: (data: ArticleInput) =>
      adminRequest<{ article: AdminArticle }>('/news', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<ArticleInput>) =>
      adminRequest<{ article: AdminArticle }>(`/news/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      adminRequest<{ ok: boolean }>(`/news/${id}`, { method: 'DELETE' }),
  },

  quotations: {
    list: (status?: string) =>
      adminRequest<{
        requests: QuotationRequest[];
        counts: { status: string; _count: number }[];
        unread: number;
      }>(`/quotation-requests${status ? `?status=${status}` : ''}`),
    update: (id: string, data: { status?: string; adminNotes?: string }) =>
      adminRequest<{ quotation: QuotationRequest }>(`/quotation-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    markRead: (id: string) =>
      adminRequest<{ quotation: QuotationRequest; unread: number }>(
        `/quotation-requests/${id}/read`,
        { method: 'PATCH' },
      ),
    markAllRead: () =>
      adminRequest<{ unread: number }>('/quotation-requests/read-all', {
        method: 'PATCH',
      }),
    exportUrl: () => `${getApiUrl()}/quotation-requests/export`,
  },

  company: {
    get: () => adminRequest<{ company: CompanyInfo | null }>('/company'),
    update: (data: Partial<CompanyInfo>) =>
      adminRequest<{ company: CompanyInfo }>('/company', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  home: {
    get: () => adminRequest<{ home: HomePageContent | null }>('/home'),
    update: (data: Partial<HomePageContent>) =>
      adminRequest<{ home: HomePageContent }>('/home', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  contactInfo: {
    get: () => adminRequest<{ info: ContactInfo | null }>('/contact-info'),
    update: (data: Partial<ContactInfo>) =>
      adminRequest<{ info: ContactInfo }>('/contact-info', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  contactMessages: {
    list: () => adminRequest<{ messages: ContactMessage[] }>('/contact'),
  },

  pageSeo: {
    list: () => adminRequest<{ pages: PageSeoRecord[] }>('/page-seo'),
    upsert: (pageKey: string, data: SeoFieldsPayload) =>
      adminRequest<{ page: PageSeoRecord }>(`/page-seo/${pageKey}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  uploads: {
    upload: async (files: File[]) => {
      const buildForm = () => {
        const form = new FormData();
        files.forEach((f) => form.append('files', f));
        return form;
      };
      try {
        return await adminRequest<{ images: { url: string; publicId: string }[] }>('/uploads', {
          method: 'POST',
          body: buildForm(),
          apiBase: getDirectApiUrl(),
        });
      } catch (err) {
        // CORS / network to the API origin — retry through the Next.js proxy.
        if (err instanceof AdminApiError && err.status === 0 && getDirectApiUrl() !== getApiUrl()) {
          return adminRequest<{ images: { url: string; publicId: string }[] }>('/uploads', {
            method: 'POST',
            body: buildForm(),
          });
        }
        throw err;
      }
    },
    remove: (url: string) =>
      adminRequest<{ ok: boolean }>('/uploads', {
        method: 'DELETE',
        body: JSON.stringify({ url }),
        apiBase: getDirectApiUrl(),
      }),
  },

  eventsUrl: () => `${getApiUrl()}/events`,
};

/* ── Types ─────────────────────────────────────────────────────────────── */

export type SeoFieldsInput = {
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  primaryKeyword?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
};

/** Payload shape sent to the API (empty strings normalized to null). */
export type SeoFieldsPayload = {
  slug?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  primaryKeyword?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
};

export type PageSeoRecord = {
  id: string;
  pageKey: string;
} & SeoFieldsPayload;

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
} & SeoFieldsPayload;

export type AdminProduct = {
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
  images: { id: string; url: string; alt: string | null; order: number }[];
} & SeoFieldsPayload;

export type ProductInput = {
  name: string;
  slug?: string;
  categoryId: string;
  shortDescription?: string;
  description?: string;
  brand?: string;
  countryOfOrigin?: string;
  specs?: { label: string; value: string }[];
  features?: string[];
  featured?: boolean;
  status?: 'DRAFT' | 'PUBLISHED';
  images?: { url: string; alt?: string }[];
} & SeoFieldsPayload;

export type AdminService = {
  id: string;
  title: string;
  slug: string;
  narrative: string;
  icon: string | null;
  image: string | null;
  order: number;
  status: string;
  faqs?: FaqItem[] | null;
} & SeoFieldsPayload;

export type AdminCertificate = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  order: number;
  status: string;
};

export type CertificateInput = {
  title: string;
  description?: string | null;
  image?: string | null;
  order?: number;
  status?: 'DRAFT' | 'PUBLISHED';
};

export type ServiceInput = {
  title: string;
  slug?: string;
  narrative: string;
  icon?: string;
  image?: string | null;
  order?: number;
  status?: 'DRAFT' | 'PUBLISHED';
  faqs?: FaqItem[] | null;
} & SeoFieldsPayload;

export type AdminArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  coverImage: string | null;
  category: string | null;
  status: string;
  publishedAt: string | null;
} & SeoFieldsPayload;

export type ArticleInput = {
  title: string;
  slug?: string;
  excerpt?: string;
  body: string;
  coverImage?: string | null;
  category?: string;
  status?: 'DRAFT' | 'PUBLISHED';
} & SeoFieldsPayload;

export type QuotationRequest = {
  id: string;
  fullName: string;
  company: string | null;
  email: string;
  phone: string;
  productInterest: string;
  productId: string | null;
  productName: string | null;
  productSlug: string | null;
  productImage: string | null;
  quantity: string | null;
  message: string | null;
  status: string;
  adminNotes: string | null;
  readAt: string | null;
  createdAt: string;
};

export const QUOTATION_STATUSES = [
  'NEW',
  'UNDER_REVIEW',
  'CONTACTED',
  'QUOTATION_SENT',
  'APPROVED',
  'REJECTED',
  'COMPLETED',
] as const;

export const QUOTATION_STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  UNDER_REVIEW: 'Under Review',
  CONTACTED: 'Contacted',
  QUOTATION_SENT: 'Quotation Sent',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
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

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  handled: boolean;
  createdAt: string;
};
