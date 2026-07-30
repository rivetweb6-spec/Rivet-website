import { describe, it, expect } from 'vitest';
import { DEFAULT_DESCRIPTION, SITE_NAME, pageMetadata } from './seo';

describe('pageMetadata', () => {
  it('builds a canonical URL from the path', () => {
    const meta = pageMetadata({ title: 'Products', path: '/products' });
    expect(meta.alternates?.canonical).toContain('/products');
    expect(meta.title).toBe('Products');
  });

  it('falls back to the default description', () => {
    const meta = pageMetadata({ title: 'Home' });
    expect(meta.description).toBe(DEFAULT_DESCRIPTION);
  });

  it('populates Open Graph with the site name and an image', () => {
    const meta = pageMetadata({ title: 'Contact', path: '/contact' });
    expect(meta.openGraph?.siteName).toBe(SITE_NAME);
    const images = meta.openGraph?.images as { url: string }[] | undefined;
    expect(images?.[0]?.url).toBeTruthy();
  });

  it('sets a summary_large_image Twitter card', () => {
    const meta = pageMetadata({ title: 'News', path: '/news' });
    const twitter = meta.twitter as { card?: string } | null | undefined;
    expect(twitter?.card).toBe('summary_large_image');
  });

  it('adds noindex robots when requested', () => {
    const meta = pageMetadata({ title: 'Hidden', noIndex: true });
    expect(meta.robots).toMatchObject({ index: false, follow: false });
  });
});
