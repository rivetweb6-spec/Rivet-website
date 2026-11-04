import { SmoothScroll } from '@/components/providers/smooth-scroll';
import { QuotationModalProvider } from '@/components/quotation/quotation-modal-provider';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { LocalBusinessJsonLd, OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/json-ld';
import { api } from '@/lib/api';

/** Default ISR window for public marketing pages (overridable per route). */
export const revalidate = 60;

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [contactRes, categoriesRes, servicesRes] = await Promise.allSettled([
    api.contactInfo(),
    api.categories.list(),
    api.services.list(),
  ]);
  const contact = contactRes.status === 'fulfilled' ? contactRes.value.info : null;

  // Footer links come from the CMS so renamed slugs never 404; if the API is
  // unavailable the footer falls back to the top-level /products and /services.
  const footerProducts =
    categoriesRes.status === 'fulfilled'
      ? categoriesRes.value.categories
          .filter((c) => !c.parentId)
          .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
          .slice(0, 4)
          .map((c) => ({ label: c.name, href: `/products/${c.slug}` }))
      : [];
  const footerServices =
    servicesRes.status === 'fulfilled'
      ? servicesRes.value.services.slice(0, 3).map((s) => ({ label: s.title, href: `/services/${s.slug}` }))
      : [];

  const sameAs = [contact?.facebook, contact?.linkedin, contact?.telegram, contact?.whatsapp];

  return (
    <SmoothScroll>
      <QuotationModalProvider>
        <WebSiteJsonLd />
        <OrganizationJsonLd
          phone={contact?.phone}
          email={contact?.email}
          address={contact?.address}
          sameAs={sameAs}
        />
        <LocalBusinessJsonLd
          phone={contact?.phone}
          email={contact?.email}
          address={contact?.address}
          latitude={contact?.mapLat}
          longitude={contact?.mapLng}
          sameAs={sameAs}
        />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer contact={contact} products={footerProducts} services={footerServices} />
      </QuotationModalProvider>
    </SmoothScroll>
  );
}
