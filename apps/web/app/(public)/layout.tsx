import { SmoothScroll } from '@/components/providers/smooth-scroll';
import { DemoModalProvider } from '@/components/demo/demo-modal-provider';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { OrganizationJsonLd } from '@/components/seo/json-ld';
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

  return (
    <SmoothScroll>
      <DemoModalProvider>
        <OrganizationJsonLd
          phone={contact?.phone}
          email={contact?.email}
          address={contact?.address}
          sameAs={[contact?.facebook, contact?.linkedin, contact?.telegram, contact?.whatsapp]}
        />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </DemoModalProvider>
    </SmoothScroll>
  );
}
