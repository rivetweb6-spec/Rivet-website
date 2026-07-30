/**
 * Authenticated admin API client — Bearer JWT from localStorage.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
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

async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const isForm = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

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

  updateProfile: (data: { name?: string; email?: string }) =>
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
        news: number;
        demoTotal: number;
        demoNew: number;
        contactMessages: number;
      };
      demoByStatus: { status: string; _count: number }[];
      recentDemos: {
        id: string;
        fullName: string;
        email: string;
        productInterest: string;
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
    remove: (id: string) =>
      adminRequest<{ ok: boolean }>(`/categories/${id}`, { method: 'DELETE' }),
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

  demos: {
    list: (status?: string) =>
      adminRequest<{
        requests: DemoRequest[];
        counts: { status: string; _count: number }[];
      }>(`/demo-requests${status ? `?status=${status}` : ''}`),
    update: (id: string, data: { status?: string; adminNotes?: string }) =>
      adminRequest<{ demo: DemoRequest }>(`/demo-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    exportUrl: () => `${API_URL}/demo-requests/export`,
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

  uploads: {
    upload: (files: File[]) => {
      const form = new FormData();
      files.forEach((f) => form.append('files', f));
      return adminRequest<{ images: { url: string; publicId: string }[] }>('/uploads', {
        method: 'POST',
        body: form,
      });
    },
  },

  eventsUrl: () => `${API_URL}/events`,
};

/* ── Types ─────────────────────────────────────────────────────────────── */

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  order: number;
};

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
};

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
};

export type AdminService = {
  id: string;
  title: string;
  slug: string;
  narrative: string;
  icon: string | null;
  image: string | null;
  order: number;
  status: string;
};

export type ServiceInput = {
  title: string;
  slug?: string;
  narrative: string;
  icon?: string;
  image?: string;
  order?: number;
  status?: 'DRAFT' | 'PUBLISHED';
};

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
};

export type ArticleInput = {
  title: string;
  slug?: string;
  excerpt?: string;
  body: string;
  coverImage?: string;
  category?: string;
  status?: 'DRAFT' | 'PUBLISHED';
};

export type DemoRequest = {
  id: string;
  fullName: string;
  company: string | null;
  email: string;
  phone: string;
  productInterest: string;
  message: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
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
