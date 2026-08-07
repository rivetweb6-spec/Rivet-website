import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Permanent redirects for legacy and alias URLs. */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Legacy category query → path-based category URL
  if (pathname === '/products') {
    const category = searchParams.get('category');
    if (category) {
      const url = request.nextUrl.clone();
      url.pathname = `/products/${encodeURIComponent(category)}`;
      url.searchParams.delete('category');
      // Preserve search/page if present on mixed URLs
      return NextResponse.redirect(url, 308);
    }
  }

  if (pathname === '/about') {
    const url = request.nextUrl.clone();
    url.pathname = '/company';
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/products', '/about'],
};
