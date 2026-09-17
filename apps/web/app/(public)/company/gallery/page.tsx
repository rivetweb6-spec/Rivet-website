import type { Metadata } from 'next';
import { PageHero } from '@/components/site/page-hero';
import { CompanySubnav } from '@/components/company/company-subnav';
import { CompanyGalleryGrid } from '@/components/company/company-gallery';
import { Container } from '@/components/ui/container';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { api, type GalleryImage } from '@/lib/api';
import { metadataForStaticPage } from '@/lib/page-seo';

/** CMS-backed; skip static prerender so `next build` does not require a live API. */
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return metadataForStaticPage('gallery');
}

export default async function GalleryPage() {
  let images: GalleryImage[] = [];
  try {
    ({ images } = await api.gallery.list());
  } catch {
    /* empty gallery if the API is unavailable */
  }

  return (
    <>
      <PageHero
        eyebrow="Company"
        title="Gallery"
        description="A visual record of River Company — the showroom, the sites, the teams, and the work itself."
      />
      <CompanySubnav />
      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Company', path: '/company' },
            { name: 'Gallery', path: '/company/gallery' },
          ]}
        />
      </Container>
      <CompanyGalleryGrid images={images} />
    </>
  );
}
