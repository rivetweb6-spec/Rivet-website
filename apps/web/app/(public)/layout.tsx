import { SmoothScroll } from '@/components/providers/smooth-scroll';
import { QuotationModalProvider } from '@/components/quotation/quotation-modal-provider';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { LocalBusinessJsonLd, OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/json-ld';
import { api } from '@/lib/api';

/** Default ISR window for public marketing pages (overridable per route). */
export const revalidate = 60;

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let contact: Awaited<ReturnType<typeof api.contactInfo>>['info'] = null;
  try {
    ({ info: contact } = await api.contactInfo());
  } catch {
    /* optional for JSON-LD */
  }

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
        <Footer />
      </QuotationModalProvider>
    </SmoothScroll>
  );
}
