import { describe, it, expect } from 'vitest';
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  buildProductAltText,
  isIndexableSlug,
  pageMetadata,
  parseFaqs,
  resolveCanonicalUrl,
  resolveSeo,
  staticPageMetadata,
  truncateMetaDescription,
  withBrand,
} from './seo';

describe('pageMetadata', () => {
  it('builds a canonical URL from the path', () => {
    const meta = pageMetadata({ title: 'Products', path: '/products' });
    expect(meta.alternates?.canonical).toContain('/products');
    expect(meta.title).toEqual({ absolute: 'Products | RIVET' });
  });

  it('uses an absolute title so the root template does not double the brand', () => {
    const meta = pageMetadata({ title: 'RIVET Careers', path: '/careers' });
    expect(meta.title).toEqual({ absolute: 'RIVET Careers' });
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

  it('honors a custom canonical URL override', () => {
    const meta = pageMetadata({
      title: 'Custom',
      path: '/products/x',
      canonicalUrl: 'https://example.com/preferred',
    });
    expect(meta.alternates?.canonical).toBe('https://example.com/preferred');
  });
});

describe('buildProductAltText', () => {
  it('includes product, category, and Rivet Ethiopia context', () => {
    expect(buildProductAltText('Meridian Elevator', 'Elevators')).toContain('Elevators');
    expect(buildProductAltText('Meridian Elevator', 'Elevators')).toContain('Rivet in Ethiopia');
  });
});

describe('parseFaqs', () => {
  it('filters invalid FAQ entries', () => {
    expect(parseFaqs([{ question: 'Q?', answer: 'A.' }, { question: 'bad' }])).toEqual([
      { question: 'Q?', answer: 'A.' },
    ]);
  });
});

describe('truncateMetaDescription', () => {
  it('leaves short copy unchanged', () => {
    expect(truncateMetaDescription('Short description.')).toBe('Short description.');
  });

  it('truncates on a word boundary', () => {
    const long = 'A'.repeat(80) + ' extra words that should be clipped from the meta description window because it is far too long for a typical SERP snippet display.';
    const result = truncateMetaDescription(long, 160);
    expect(result.endsWith('…')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(160);
    expect(result).not.toContain('snippet display');
  });
});

describe('resolveCanonicalUrl', () => {
  it('omits a trailing slash on the homepage', () => {
    expect(resolveCanonicalUrl('/')).toBe(SITE_URL);
  });

  it('builds an absolute path canonical', () => {
    expect(resolveCanonicalUrl('/products')).toBe(`${SITE_URL}/products`);
  });

  it('keeps an absolute override', () => {
    expect(resolveCanonicalUrl('/x', 'https://example.com/preferred')).toBe(
      'https://example.com/preferred',
    );
  });

  it('resolves a relative override against the site URL', () => {
    expect(resolveCanonicalUrl('/x', '/preferred')).toBe(`${SITE_URL}/preferred`);
  });
});

describe('staticPageMetadata', () => {
  it('uses unique titles and page-specific keywords', () => {
    const meta = staticPageMetadata('contact');
    expect(meta.title).toEqual({ absolute: 'Contact Rivet in Addis Ababa, Ethiopia' });
    expect(meta.keywords).toEqual(expect.arrayContaining(['contact RIVET', 'Addis Ababa']));
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/contact`);
  });
});

describe('article open graph', () => {
  it('sets article timestamps when provided through pageMetadata', () => {
    const meta = pageMetadata({
      title: 'Showroom opening',
      path: '/news/showroom',
      type: 'article',
      publishedTime: '2026-01-01T00:00:00.000Z',
      section: 'Company',
    });
    const og = meta.openGraph as { type?: string; publishedTime?: string; section?: string };
    expect(og.type).toBe('article');
    expect(og.publishedTime).toBe('2026-01-01T00:00:00.000Z');
    expect(og.section).toBe('Company');
  });
});

describe('isIndexableSlug', () => {
  it('rejects empty or punctuation-only slugs', () => {
    expect(isIndexableSlug('-')).toBe(false);
    expect(isIndexableSlug('')).toBe(false);
    expect(isIndexableSlug('elevators')).toBe(true);
  });
});

describe('withBrand', () => {
  it('appends the brand when the title does not mention Rivet', () => {
    expect(withBrand('Products')).toBe('Products | RIVET');
  });

  it('does not double the brand when RIVET is already in the title', () => {
    expect(withBrand('RIVET Careers')).toBe('RIVET Careers');
  });
});

describe('resolveSeo keywords', () => {
  it('splits a comma-separated primary keyword into unique tags', () => {
    const meta = resolveSeo(
      { primaryKeyword: 'Rivet, granite, doors' },
      { title: 'Stone', description: 'Granite from Rivet.', path: '/products/granite', keywords: ['Ethiopia'] },
    );
    expect(meta.keywords).toEqual(['Rivet', 'granite', 'doors', 'Ethiopia']);
  });
});
