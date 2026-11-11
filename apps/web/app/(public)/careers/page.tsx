import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero } from '@/components/site/page-hero';
import { Container, Section } from '@/components/ui/container';
import { Stagger, StaggerItem } from '@/components/motion/reveal';
import { BriefcaseBusiness } from 'lucide-react';
import { StateMessage } from '@/components/ui/state-message';
import { buttonVariants } from '@/components/ui/button-variants';
import { api } from '@/lib/api';
import { metadataForStaticPage } from '@/lib/page-seo';
import { daysUntilDeadline, formatDeadline, stripHtml } from '@/lib/vacancies';

/** CMS-backed; skip static prerender so `next build` does not require a live API. */
export const dynamic = 'force-dynamic';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return metadataForStaticPage('careers');
}

export default async function CareersPage() {
  let vacancies: Awaited<ReturnType<typeof api.vacancies.list>>['vacancies'] = [];
  try {
    ({ vacancies } = await api.vacancies.list());
  } catch {
    /* API unavailable */
  }

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Build your career with RIVET COMPANY"
        description="Open roles in engineering, installation, sales and operations. Each vacancy lists the responsibilities, the requirements and a closing date."
      />
      <Section>
        <Container>
          {vacancies.length === 0 ? (
            <StateMessage
              icon={BriefcaseBusiness}
              title="No open vacancies right now"
              actions={
                <Link href="/contact" className={buttonVariants({ variant: 'outline', size: 'md' })}>
                  Introduce yourself
                </Link>
              }
            >
              New roles are published here with a closing date. You can also contact our team to
              introduce yourself.
            </StateMessage>
          ) : (
            <Stagger className="space-y-5">
              {vacancies.map((v) => {
                const remaining = daysUntilDeadline(v.deadline);
                const excerpt = stripHtml(v.description).slice(0, 180);
                return (
                  <StaggerItem key={v.id}>
                    <Link href={`/careers/${v.slug}`} className="group block scroll-mt-28 rounded-lg ">
                      <article className="luxury-card relative overflow-hidden rounded-lg bg-canvas">
                        <div className="absolute inset-y-0 left-0 w-[3px] bg-gold" aria-hidden="true" />
                        <div className="grid gap-6 p-6 pl-8 md:grid-cols-[1fr_auto] md:items-start md:p-8 md:pl-10">
                          <div>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-3xs uppercase tracking-[0.14em] text-muted">
                              {v.department && <span>{v.department}</span>}
                              {v.location && <span>{v.location}</span>}
                              {v.employmentType && <span>{v.employmentType}</span>}
                            </div>
                            <h2 className="mt-3 text-2xl leading-snug group-hover:underline group-focus-visible:underline group-hover:underline-offset-4 md:text-2xl">
                              {v.title}
                            </h2>
                            {excerpt && (
                              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                                {excerpt}
                                {excerpt.length >= 180 ? '…' : ''}
                              </p>
                            )}
                            <p className="mt-5 text-sm font-semibold text-navy group-hover:underline group-focus-visible:underline group-hover:underline-offset-4">
                              View role and apply →
                            </p>
                          </div>
                          <div className="shrink-0 rounded-md border border-border bg-bg px-5 py-4 text-ink md:min-w-[11.5rem]">
                            <p className="eyebrow text-gold-ink">
                              Close
                            </p>
                            <p className="mt-1 font-display text-lg font-bold leading-tight">
                              {formatDeadline(v.deadline)}
                            </p>
                            {remaining >= 0 && remaining <= 14 && (
                              <p className="mt-2 text-2xs text-muted">
                                {remaining === 0
                                  ? 'Closes today'
                                  : remaining === 1
                                    ? '1 day left'
                                    : `${remaining} days left`}
                              </p>
                            )}
                          </div>
                        </div>
                      </article>
                    </Link>
                  </StaggerItem>
                );
              })}
            </Stagger>
          )}
        </Container>
      </Section>
    </>
  );
}
