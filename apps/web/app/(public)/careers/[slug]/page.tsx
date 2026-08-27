import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container, Section } from '@/components/ui/container';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { JobPostingJsonLd } from '@/components/seo/json-ld';
import { ApplicationForm } from '@/components/careers/application-form';
import { RichText } from '@/components/ui/rich-text';
import { api } from '@/lib/api';
import { vacancyMetadata, notFoundMetadata } from '@/lib/seo';
import { daysUntilDeadline, formatDeadline, stripHtml } from '@/lib/vacancies';

type Params = Promise<{ slug: string }>;

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const { vacancies } = await api.vacancies.list();
    return vacancies.map((v) => ({ slug: v.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  try {
    const { vacancy } = await api.vacancies.bySlug((await params).slug);
    return vacancyMetadata(vacancy);
  } catch {
    return notFoundMetadata('Vacancy');
  }
}

export default async function VacancyPage({ params }: { params: Params }) {
  const { slug } = await params;
  let vacancy;
  try {
    ({ vacancy } = await api.vacancies.bySlug(slug));
  } catch {
    notFound();
  }

  const accepting = vacancy.acceptingApplications !== false;
  const remaining = daysUntilDeadline(vacancy.deadline);

  return (
    <>
      <JobPostingJsonLd
        title={vacancy.title}
        description={stripHtml(vacancy.description)}
        slug={vacancy.slug}
        datePosted={vacancy.createdAt}
        validThrough={vacancy.deadline}
        employmentType={vacancy.employmentType}
        location={vacancy.location}
      />
      <section className="bg-navy pt-32 pb-16 md:pt-40">
        <Container>
          <div className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-gold [&_[aria-current]]:text-white">
            <Breadcrumbs
              items={[
                { name: 'Home', path: '/' },
                { name: 'Careers', path: '/careers' },
                { name: vacancy.title, path: `/careers/${vacancy.slug}` },
              ]}
            />
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[0.75rem] uppercase tracking-[0.14em] text-gold/80">
                {vacancy.department && <span>{vacancy.department}</span>}
                {vacancy.location && <span>{vacancy.location}</span>}
                {vacancy.employmentType && <span>{vacancy.employmentType}</span>}
              </div>
              <h1 className="mt-4 text-[2.25rem] text-white sm:text-[3rem]">{vacancy.title}</h1>
            </div>
            <div className="border border-gold/40 bg-navy-deep px-5 py-4 text-white">
              <p className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-gold">
                Close
              </p>
              <p className="mt-1 font-display text-[1.25rem]">{formatDeadline(vacancy.deadline)}</p>
              {accepting && remaining >= 0 && remaining <= 14 && (
                <p className="mt-1 text-[0.75rem] text-white/60">
                  {remaining === 0 ? 'Closes today' : `${remaining} day${remaining === 1 ? '' : 's'} left`}
                </p>
              )}
              {!accepting && (
                <p className="mt-1 text-[0.75rem] text-white/60">No longer accepting applications</p>
              )}
            </div>
          </div>
        </Container>
      </section>

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <h2 className="text-[1.5rem]">The role</h2>
              <RichText
                className="prose prose-lg mt-5 max-w-none text-ink prose-headings:font-display prose-headings:text-navy prose-a:text-navy prose-li:marker:text-gold"
                html={vacancy.description}
              />
              <h2 className="mt-12 text-[1.5rem]">Requirements</h2>
              <RichText
                className="prose prose-lg mt-5 max-w-none text-ink prose-headings:font-display prose-headings:text-navy prose-a:text-navy prose-li:marker:text-gold"
                html={vacancy.requirements}
              />
              <p className="mt-12">
                <Link href="/careers" className="text-[0.9375rem] font-medium text-navy hover:text-gold">
                  ← All vacancies
                </Link>
              </p>
            </div>
            <div className="lg:sticky lg:top-28">
              {accepting ? (
                <ApplicationForm slug={vacancy.slug} title={vacancy.title} />
              ) : (
                <div className="rounded-[20px] border border-border bg-surface p-8">
                  <h2 className="text-[1.5rem]">Applications closed</h2>
                  <p className="mt-3 text-muted">
                    This vacancy is no longer accepting CVs. See other open roles, or check back
                    when a new listing is posted.
                  </p>
                  <Link
                    href="/careers"
                    className="mt-6 inline-flex text-[0.9375rem] font-medium text-navy hover:text-gold"
                  >
                    View open vacancies →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
