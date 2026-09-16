import type { Metadata } from 'next';
import Link from 'next/link';
import { Award, Images, Users } from 'lucide-react';
import { PageHero } from '@/components/site/page-hero';
import { CompanySubnav } from '@/components/company/company-subnav';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { FadeUp, Stagger, StaggerItem } from '@/components/motion/reveal';
import { api } from '@/lib/api';
import { isMediaUrl } from '@/lib/media';
import { metadataForStaticPage } from '@/lib/page-seo';
import { AboutPageJsonLd } from '@/components/seo/json-ld';
import { truncateMetaDescription } from '@/lib/seo';

/** CMS-backed; skip static prerender so `next build` does not require a live API. */
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  let history: string | null = null;
  try {
    const { company } = await api.company();
    history = company?.history ?? null;
  } catch {
    /* defaults */
  }
  return metadataForStaticPage('company', {
    description: history ? truncateMetaDescription(history) : undefined,
  });
}

export default async function CompanyPage() {
  const { company } = await api.company();
  const timeline = company?.timeline ?? [];
  const values = company?.coreValues ?? [];
  const achievements = company?.achievements ?? [];
  const certLabels = (company?.certifications ?? []).filter((c) => c && !isMediaUrl(c));

  return (
    <>
      <AboutPageJsonLd description={company?.history ?? company?.mission} />
      <PageHero
        eyebrow="Our story"
        title="About River Company"
        description={
          company?.history ??
          'RIVET imports and supplies premium construction and architectural products with precision and care.'
        }
      />
      <CompanySubnav />

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <FadeUp>
              <Eyebrow>Vision</Eyebrow>
              <h2 className="mt-3 text-[2rem]">Where we are going</h2>
              <p className="mt-5 text-[1.125rem] leading-relaxed text-muted">
                {company?.vision ?? 'To be the region’s most trusted name in imported engineering excellence.'}
              </p>
            </FadeUp>
            <FadeUp delay={0.1}>
              <Eyebrow>Mission</Eyebrow>
              <h2 className="mt-3 text-[2rem]">How we work</h2>
              <p className="mt-5 text-[1.125rem] leading-relaxed text-muted">
                {company?.mission ??
                  'To supply and install world-class products with precision, reliability and care.'}
              </p>
            </FadeUp>
          </div>
        </Container>
      </Section>

      {values.length > 0 && (
        <Section className="bg-bg">
          <Container>
            <FadeUp>
              <Eyebrow>Principles</Eyebrow>
              <h2 className="mt-3 text-[2rem]">Core values</h2>
            </FadeUp>
            <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v) => (
                <StaggerItem key={v}>
                  <div className="rounded-[16px] border border-border bg-surface px-6 py-8 text-center">
                    <div className="mx-auto h-[2px] w-8 bg-gold" />
                    <h3 className="mt-5 text-[1.125rem]">{v}</h3>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </Section>
      )}

      {timeline.length > 0 && (
        <Section>
          <Container>
            <FadeUp>
              <Eyebrow>History</Eyebrow>
              <h2 className="mt-3 text-[2rem]">Timeline</h2>
            </FadeUp>
            <div className="relative mt-14">
              <div className="absolute top-0 bottom-0 left-[7px] w-px bg-divider md:left-1/2 md:-translate-x-px" />
              <div className="space-y-10">
                {timeline.map((item, i) => (
                  <FadeUp key={`${item.year}-${item.title}-${i}`} delay={i * 0.05}>
                    <div
                      className={`relative grid gap-4 md:grid-cols-2 md:gap-12 ${
                        i % 2 === 0 ? '' : 'md:[&>*:first-child]:order-2'
                      }`}
                    >
                      <div className={`pl-8 md:pl-0 ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:pl-12'}`}>
                        <span className="eyebrow text-navy">{item.year}</span>
                        <h3 className="mt-2 text-[1.375rem]">{item.title}</h3>
                        <p className="mt-2 text-muted">{item.description}</p>
                      </div>
                      <div className="absolute top-1 left-0 h-4 w-4 rounded-full border-2 border-gold bg-surface md:left-1/2 md:-translate-x-1/2" />
                      <div />
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </Container>
        </Section>
      )}

      {(achievements.length > 0 || certLabels.length > 0) && (
        <Section className="bg-navy">
          <Container>
            <div className="grid gap-12 lg:grid-cols-2">
              {achievements.length > 0 && (
                <FadeUp>
                  <Eyebrow className="text-gold">Milestones</Eyebrow>
                  <h2 className="mt-3 text-[2rem] text-white">Achievements</h2>
                  <ul className="mt-6 space-y-3">
                    {achievements.map((a) => (
                      <li key={a} className="flex items-center gap-3 text-white/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </FadeUp>
              )}
              {certLabels.length > 0 && (
                <FadeUp delay={0.1}>
                  <Eyebrow className="text-gold">Credentials</Eyebrow>
                  <h2 className="mt-3 text-[2rem] text-white">Certifications</h2>
                  <ul className="mt-6 space-y-3">
                    {certLabels.map((c) => (
                      <li key={c} className="flex items-center gap-3 text-white/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                        {c}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/company/certificate-portfolio"
                    className="mt-6 inline-block text-[0.875rem] text-gold hover:underline"
                  >
                    View certificate & portfolio →
                  </Link>
                </FadeUp>
              )}
            </div>
          </Container>
        </Section>
      )}

      <Section className="bg-bg">
        <Container>
          <FadeUp>
            <Eyebrow>Company</Eyebrow>
            <h2 className="mt-3 text-[2rem]">Explore River Company</h2>
          </FadeUp>
          <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                href: '/company/certificate-portfolio',
                icon: Award,
                title: 'Certificate & Portfolio',
                body: 'Credentials, partner certifications, and selected project work.',
              },
              {
                href: '/company/team',
                icon: Users,
                title: 'Meet Our Team',
                body: 'Leadership, engineering, and the people behind every installation.',
              },
              {
                href: '/company/gallery',
                icon: Images,
                title: 'Gallery',
                body: 'Photos from the showroom, sites, events, and company life.',
              },
            ].map((card) => (
              <StaggerItem key={card.href}>
                <Link
                  href={card.href}
                  className="group flex h-full flex-col rounded-[16px] border border-border bg-surface p-7 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[var(--shadow-md)]"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-[12px] bg-navy/5 text-navy transition-colors group-hover:bg-gold">
                    <card.icon size={22} strokeWidth={1.5} />
                  </span>
                  <h3 className="mt-5 text-[1.25rem]">{card.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{card.body}</p>
                  <span className="mt-5 text-[0.8125rem] font-medium text-gold">Open →</span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>
    </>
  );
}
