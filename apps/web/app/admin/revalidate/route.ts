import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

const TAG_PATHS: Record<string, { path: string; type?: 'layout' | 'page' }[]> = {
  home: [{ path: '/' }],
  'contact-info': [{ path: '/contact' }],
  news: [{ path: '/news', type: 'layout' }],
  certificates: [{ path: '/company' }, { path: '/company/certificate-portfolio' }],
  team: [{ path: '/company/team' }],
  gallery: [{ path: '/company/gallery' }],
  vacancies: [{ path: '/careers', type: 'layout' }],
  company: [{ path: '/company', type: 'layout' }],
  products: [{ path: '/products', type: 'layout' }],
  categories: [{ path: '/products', type: 'layout' }],
  services: [{ path: '/services', type: 'layout' }],
  'page-seo': [
    { path: '/' },
    { path: '/products' },
    { path: '/services' },
    { path: '/company' },
    { path: '/company/certificate-portfolio' },
    { path: '/company/team' },
    { path: '/company/gallery' },
    { path: '/news' },
    { path: '/careers' },
    { path: '/contact' },
    { path: '/request-quotation' },
  ],
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

/**
 * The web app does not hold the JWT signing secret, so the bearer token is
 * verified by asking the API who it belongs to. Checking only for a "Bearer "
 * prefix would let anyone purge the entire public cache at will.
 */
async function isAuthorized(auth: string | null): Promise<boolean> {
  if (!auth?.startsWith('Bearer ')) return false;
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: auth },
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const { user } = (await res.json()) as { user?: { role?: string } };
    return user?.role === 'ADMIN' || user?.role === 'EDITOR';
  } catch {
    return false;
  }
}

/** Bust public ISR after admin updates to contact, news, and similar content. */
export async function POST(request: Request) {
  if (!(await isAuthorized(request.headers.get('authorization')))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let tag = 'contact-info';
  try {
    const body = (await request.json()) as { tag?: string };
    if (body.tag) tag = body.tag;
  } catch {
    /* default tag */
  }

  revalidateTag(tag, 'max');
  revalidatePath('/', 'layout');
  revalidatePath('/sitemap.xml');

  for (const entry of TAG_PATHS[tag] ?? []) {
    revalidatePath(entry.path, entry.type ?? 'page');
  }

  return NextResponse.json({ ok: true });
}
