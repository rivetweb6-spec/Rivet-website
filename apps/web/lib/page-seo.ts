import type { Metadata } from 'next';
import { api, type PageSeo } from '@/lib/api';
import { type PageSeoKey } from '@/lib/page-seo-defaults';
import { staticPageMetadata } from '@/lib/seo';

/** Load CMS PageSeo for a static route; null when unset or the API is down. */
export async function loadPageSeo(pageKey: PageSeoKey): Promise<PageSeo | null> {
  try {
    const { page } = await api.pageSeo.byKey(pageKey);
    return page;
  } catch {
    return null;
  }
}

/** Static public page metadata: shared defaults + optional CMS overrides. */
export async function metadataForStaticPage(
  pageKey: PageSeoKey,
  extra?: {
    title?: string;
    description?: string;
    image?: string | null;
  },
): Promise<Metadata> {
  return staticPageMetadata(pageKey, await loadPageSeo(pageKey), extra);
}
