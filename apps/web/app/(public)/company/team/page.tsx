import type { Metadata } from 'next';
import { Mail, Phone, Linkedin } from 'lucide-react';
import { PageHero } from '@/components/site/page-hero';
import { CompanySubnav } from '@/components/company/company-subnav';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { FadeUp, Stagger, StaggerItem } from '@/components/motion/reveal';
import { RivetImage } from '@/components/ui/rivet-image';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { api, type TeamMember, type TeamSection } from '@/lib/api';
import { metadataForStaticPage } from '@/lib/page-seo';

export async function generateMetadata(): Promise<Metadata> {
  return metadataForStaticPage('team');
}

const SECTION_COPY: Record<
  TeamSection,
  { eyebrow: string; title: string; description: string }
> = {
  LEADERSHIP: {
    eyebrow: 'Leadership',
    title: 'General management',
    description: 'The people who set direction, hold the standard, and represent River Company.',
  },
  ENGINEERING: {
    eyebrow: 'Engineering',
    title: 'Technical direction',
    description: 'Specification, installation quality, and engineering support from survey to handover.',
  },
  TEAM: {
    eyebrow: 'People',
    title: 'The wider team',
    description: 'Colleagues across operations, showroom, and site who keep every project moving.',
  },
};

function MemberCard({ member, featured = false }: { member: TeamMember; featured?: boolean }) {
  const socials = [
    member.email ? { href: `mailto:${member.email}`, label: 'Email', Icon: Mail } : null,
    member.phone ? { href: `tel:${member.phone}`, label: 'Phone', Icon: Phone } : null,
    member.linkedin ? { href: member.linkedin, label: 'LinkedIn', Icon: Linkedin } : null,
  ].filter(Boolean) as { href: string; label: string; Icon: typeof Mail }[];

  return (
    <article
      className={
        featured
          ? 'grid items-center gap-10 overflow-hidden rounded-[20px] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] md:grid-cols-[minmax(0,0.9fr)_1.1fr] md:p-10'
          : 'h-full overflow-hidden rounded-[16px] border border-border bg-surface shadow-[var(--shadow-sm)]'
      }
    >
      <div
        className={
          featured
            ? 'relative aspect-[4/5] overflow-hidden rounded-[12px] bg-navy/5'
            : 'relative aspect-[4/5] overflow-hidden bg-navy/5'
        }
      >
        {member.photo ? (
          <RivetImage
            src={member.photo}
            alt={`${member.fullName}, ${member.position} at River Company (RIVET)`}
            fill
            sizes={featured ? '(max-width: 768px) 100vw, 40vw' : '(max-width: 768px) 100vw, 33vw'}
            className="object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-[0.875rem] text-muted">Portrait</div>
        )}
      </div>
      <div className={featured ? '' : 'p-6'}>
        <p className="eyebrow text-gold">{member.position}</p>
        <h3 className={`mt-2 text-navy ${featured ? 'text-[2rem]' : 'text-[1.25rem]'}`}>
          {member.fullName}
        </h3>
        {member.bio && (
          <p className={`mt-4 leading-relaxed text-muted ${featured ? 'text-[1.0625rem]' : 'text-[0.9375rem]'}`}>
            {member.bio}
          </p>
        )}
        {socials.length > 0 && (
          <div className="mt-6 flex gap-2">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noreferrer' : undefined}
                aria-label={`${member.fullName} ${label}`}
                className="grid h-10 w-10 place-items-center rounded-full border border-border text-navy transition-colors hover:border-gold hover:text-gold"
              >
                <Icon size={16} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default async function TeamPage() {
  let members: TeamMember[] = [];
  try {
    ({ members } = await api.team.list());
  } catch {
    /* empty state if API is unavailable */
  }

  const leadership = members.filter((m) => m.section === 'LEADERSHIP');
  const engineering = members.filter((m) => m.section === 'ENGINEERING');
  const team = members.filter((m) => m.section === 'TEAM');

  return (
    <>
      <PageHero
        eyebrow="Company"
        title="Meet Our Team"
        description="The people who specify, import, install, and stand behind River Company’s work in Ethiopia."
      />
      <CompanySubnav />
      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Company', path: '/company' },
            { name: 'Meet Our Team', path: '/company/team' },
          ]}
        />
      </Container>

      {members.length === 0 ? (
        <Section>
          <Container>
            <p className="text-center text-muted">Team profiles will appear here once they are published.</p>
          </Container>
        </Section>
      ) : (
        <>
          {leadership.length > 0 && (
            <Section>
              <Container>
                <FadeUp>
                  <Eyebrow>{SECTION_COPY.LEADERSHIP.eyebrow}</Eyebrow>
                  <h2 className="mt-3 text-[2rem]">{SECTION_COPY.LEADERSHIP.title}</h2>
                  <p className="mt-4 max-w-2xl text-muted">{SECTION_COPY.LEADERSHIP.description}</p>
                </FadeUp>
                <div className="mt-12 space-y-8">
                  {leadership.map((member) => (
                    <FadeUp key={member.id}>
                      <MemberCard member={member} featured />
                    </FadeUp>
                  ))}
                </div>
              </Container>
            </Section>
          )}

          {engineering.length > 0 && (
            <Section className="bg-bg">
              <Container>
                <FadeUp>
                  <Eyebrow>{SECTION_COPY.ENGINEERING.eyebrow}</Eyebrow>
                  <h2 className="mt-3 text-[2rem]">{SECTION_COPY.ENGINEERING.title}</h2>
                  <p className="mt-4 max-w-2xl text-muted">{SECTION_COPY.ENGINEERING.description}</p>
                </FadeUp>
                <div className="mt-12 space-y-8">
                  {engineering.map((member) => (
                    <FadeUp key={member.id}>
                      <MemberCard member={member} featured />
                    </FadeUp>
                  ))}
                </div>
              </Container>
            </Section>
          )}

          {team.length > 0 && (
            <Section>
              <Container>
                <FadeUp>
                  <Eyebrow>{SECTION_COPY.TEAM.eyebrow}</Eyebrow>
                  <h2 className="mt-3 text-[2rem]">{SECTION_COPY.TEAM.title}</h2>
                  <p className="mt-4 max-w-2xl text-muted">{SECTION_COPY.TEAM.description}</p>
                </FadeUp>
                <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {team.map((member) => (
                    <StaggerItem key={member.id}>
                      <MemberCard member={member} />
                    </StaggerItem>
                  ))}
                </Stagger>
              </Container>
            </Section>
          )}
        </>
      )}
    </>
  );
}
