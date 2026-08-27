import type { Metadata } from 'next';
import { PageHero } from '@/components/site/page-hero';
import { CompanySubnav } from '@/components/company/company-subnav';
import { CertificateGallery, PortfolioGallery } from '@/components/company/certificate-gallery';
import { Container, Section } from '@/components/ui/container';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { api, type Certificate } from '@/lib/api';
import { metadataForStaticPage } from '@/lib/page-seo';

export async function generateMetadata(): Promise<Metadata> {
  return metadataForStaticPage('certificate-portfolio');
}

export default async function CertificatePortfolioPage() {
  let certificates: Certificate[] = [];
  let portfolio: Certificate[] = [];
  try {
    const [certs, projects] = await Promise.all([
      api.certificates.list('CERTIFICATE'),
      api.certificates.list('PORTFOLIO'),
    ]);
    certificates = certs.certificates;
    portfolio = projects.certificates;
  } catch {
    /* page still renders if the API is unavailable */
  }

  const empty = certificates.length === 0 && portfolio.length === 0;

  return (
    <>
      <PageHero
        eyebrow="Company"
        title="Certificate & Portfolio"
        description="Credentials that stand behind every supply, and the projects that show how those standards look on site."
      />
      <CompanySubnav />
      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Company', path: '/company' },
            { name: 'Certificate & Portfolio', path: '/company/certificate-portfolio' },
          ]}
        />
      </Container>
      {empty ? (
        <Section>
          <Container>
            <p className="text-center text-muted">
              Certificates and portfolio items will appear here once they are published.
            </p>
          </Container>
        </Section>
      ) : (
        <>
          <CertificateGallery certificates={certificates} />
          <PortfolioGallery items={portfolio} />
        </>
      )}
    </>
  );
}
