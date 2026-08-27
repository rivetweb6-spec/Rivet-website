'use client';

import * as React from 'react';
import { FadeUp, Stagger, StaggerItem } from '@/components/motion/reveal';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import { ImageLightbox, allItemImages } from '@/components/company/image-lightbox';
import type { Certificate } from '@/lib/api';

export function CertificateGallery({ certificates }: { certificates: Certificate[] }) {
  const items = certificates.filter((c) => c.image);
  const [active, setActive] = React.useState<number | null>(null);

  if (items.length === 0) return null;

  const lightboxItems = items.map((cert) => ({
    src: cert.image!,
    title: cert.title,
    description: cert.description,
  }));

  return (
    <>
      <Section id="certificates" className="scroll-mt-24 bg-bg">
        <Container>
          <FadeUp>
            <Eyebrow>Credentials</Eyebrow>
            <h2 className="mt-3 max-w-xl text-[2rem] md:text-[2.5rem]">Certificates</h2>
            <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-muted">
              Verified standards and partner credentials that underpin every Rivet supply and
              installation.
            </p>
          </FadeUp>

          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((cert, index) => (
              <StaggerItem key={cert.id}>
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  className="group flex h-full w-full flex-col rounded-[16px] border border-border bg-surface p-4 text-left shadow-[var(--shadow-sm)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] bg-white">
                    <span
                      className="pointer-events-none absolute inset-2 z-10 border border-gold/25"
                      aria-hidden="true"
                    />
                    <RivetImage
                      src={cert.image!}
                      alt={`${cert.title} — River Company certificate`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain p-5"
                    />
                  </div>
                  <h3 className="mt-5 text-[1.125rem] text-navy">{cert.title}</h3>
                  {cert.description && (
                    <p className="mt-2 line-clamp-3 text-[0.9375rem] leading-relaxed text-muted">
                      {cert.description}
                    </p>
                  )}
                  <span className="mt-4 text-[0.8125rem] font-medium text-gold sm:opacity-0 sm:transition-opacity sm:duration-300 sm:group-hover:opacity-100">
                    View certificate
                  </span>
                </button>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      {active !== null && (
        <ImageLightbox
          items={lightboxItems}
          index={active}
          onClose={() => setActive(null)}
          onIndexChange={setActive}
          labelledBy="certificate-lightbox-title"
        />
      )}
    </>
  );
}

export function PortfolioGallery({ items }: { items: Certificate[] }) {
  const projects = items.filter((p) => allItemImages(p).length > 0);
  const [active, setActive] = React.useState<{ project: number; image: number } | null>(null);

  if (projects.length === 0) return null;

  const lightboxItems =
    active === null
      ? []
      : allItemImages(projects[active.project]!).map((src) => ({
          src,
          title: projects[active.project]!.title,
          description: projects[active.project]!.description,
        }));

  return (
    <>
      <Section id="portfolio" className="scroll-mt-24">
        <Container>
          <FadeUp>
            <Eyebrow>Work</Eyebrow>
            <h2 className="mt-3 max-w-xl text-[2rem] md:text-[2.5rem]">Portfolio</h2>
            <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-muted">
              Selected projects and installations — the spaces, systems, and finishes River Company
              has delivered.
            </p>
          </FadeUp>

          <Stagger className="mt-12 grid gap-8 lg:grid-cols-2">
            {projects.map((project, projectIndex) => {
              const images = allItemImages(project);
              return (
                <StaggerItem key={project.id}>
                  <article className="group overflow-hidden rounded-[16px] border border-border bg-surface shadow-[var(--shadow-sm)] transition-all duration-500 hover:border-gold/40 hover:shadow-[var(--shadow-md)]">
                    <button
                      type="button"
                      onClick={() => setActive({ project: projectIndex, image: 0 })}
                      className="relative block aspect-[16/10] w-full overflow-hidden bg-navy/5 text-left"
                    >
                      <RivetImage
                        src={images[0]!}
                        alt={`${project.title} — River Company project portfolio`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                      />
                      {images.length > 1 && (
                        <span className="absolute right-4 bottom-4 rounded-full bg-navy/80 px-3 py-1 text-[0.75rem] text-white backdrop-blur">
                          {images.length} images
                        </span>
                      )}
                    </button>
                    <div className="p-6 md:p-8">
                      <h3 className="text-[1.375rem] text-navy">{project.title}</h3>
                      {project.description && (
                        <p className="mt-3 text-[1rem] leading-relaxed text-muted">
                          {project.description}
                        </p>
                      )}
                      {images.length > 1 && (
                        <div className="mt-5 flex gap-2 overflow-x-auto">
                          {images.slice(1, 5).map((src, imageIndex) => (
                            <button
                              key={src}
                              type="button"
                              onClick={() =>
                                setActive({ project: projectIndex, image: imageIndex + 1 })
                              }
                              className="relative h-16 w-20 shrink-0 overflow-hidden rounded-[8px] border border-border"
                            >
                              <RivetImage
                                src={src}
                                alt={`${project.title} — additional photo ${imageIndex + 2}`}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        </Container>
      </Section>

      {active !== null && lightboxItems.length > 0 && (
        <ImageLightbox
          items={lightboxItems}
          index={active.image}
          onClose={() => setActive(null)}
          onIndexChange={(image) => setActive({ ...active, image })}
          labelledBy="portfolio-lightbox-title"
        />
      )}
    </>
  );
}
