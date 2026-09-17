import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero } from '@/components/site/page-hero';
import { Container, Section } from '@/components/ui/container';
import { Stagger, StaggerItem } from '@/components/motion/reveal';
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
        title="Join the work behind the landmarks"
        description="Open roles in import, engineering, installation, and commercial operations. Each vacancy lists the specification, the requirements, and a closing date."
      />
      <Section>
        <Container>
          {vacancies.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-[20px] border border-border bg-surface px-8 py-16 text-center">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-gold">
                Roster
              </p>
              <h2 className="mt-4 text-[1.75rem]">No open vacancies right now</h2>
              <p className="mt-3 text-muted">
                When a role is posted, it will appear here with a closing date. You can also reach
                the team through Contact.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-flex text-[0.9375rem] font-medium text-navy hover:text-gold"
              >
                Contact RIVET →
              </Link>
            </div>
          ) : (
            <Stagger className="space-y-5">
              {vacancies.map((v) => {
                const remaining = daysUntilDeadline(v.deadline);
                const excerpt = stripHtml(v.description).slice(0, 180);
                return (
                  <StaggerItem key={v.id}>
                    <Link href={`/careers/${v.slug}`} className="group block scroll-mt-28">
                      <article className="relative overflow-hidden rounded-[16px] border border-border bg-surface transition-all duration-500 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-[var(--shadow-lg)]">
                        <div className="absolute inset-y-0 left-0 w-[3px] bg-gold" aria-hidden="true" />
                        <div className="grid gap-6 p-6 pl-8 md:grid-cols-[1fr_auto] md:items-start md:p-8 md:pl-10">
                          <div>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[0.75rem] uppercase tracking-[0.14em] text-muted">
                              {v.department && <span>{v.department}</span>}
                              {v.location && <span>{v.location}</span>}
                              {v.employmentType && <span>{v.employmentType}</span>}
                            </div>
                            <h2 className="mt-3 text-[1.5rem] leading-snug md:text-[1.75rem]">
                              {v.title}
                            </h2>
                            {excerpt && (
                              <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
                                {excerpt}
                                {excerpt.length >= 180 ? '…' : ''}
                              </p>
                            )}
                            <p className="mt-5 text-[0.875rem] font-medium text-gold">
                              View role and apply →
                            </p>
                          </div>
                          <div className="shrink-0 border border-gold/35 bg-navy px-5 py-4 text-white md:min-w-[11.5rem]">
                            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-gold">
                              Close
                            </p>
                            <p className="mt-1 font-display text-[1.125rem] leading-tight">
                              {formatDeadline(v.deadline)}
                            </p>
                            {remaining >= 0 && remaining <= 14 && (
                              <p className="mt-2 text-[0.75rem] text-white/65">
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
