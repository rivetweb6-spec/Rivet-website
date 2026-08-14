'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { FadeUp, Stagger, StaggerItem } from '@/components/motion/reveal';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { RivetImage } from '@/components/ui/rivet-image';
import type { Certificate } from '@/lib/api';

export function CertificateGallery({ certificates }: { certificates: Certificate[] }) {
  const items = certificates.filter((c) => c.image);
  const [active, setActive] = React.useState<number | null>(null);

  if (items.length === 0) return null;

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
                      alt={cert.title}
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
        <CertificateLightbox
          items={items}
          index={active}
          onClose={() => setActive(null)}
          onIndexChange={setActive}
        />
      )}
    </>
  );
}

function CertificateLightbox({
  items,
  index,
  onClose,
  onIndexChange,
}: {
  items: Certificate[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const cert = items[index];
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onIndexChange((index - 1 + items.length) % items.length);
      if (e.key === 'ArrowRight') onIndexChange((index + 1) % items.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, items.length, onClose, onIndexChange]);

  if (!mounted || !cert?.image) return null;

  const content = (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-navy/92 p-4 md:p-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-lightbox-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-zoom-out"
        aria-label="Close certificate"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-full w-full max-w-5xl flex-col">
        <div className="relative h-[70vh] w-full overflow-hidden rounded-[16px] bg-white">
          <RivetImage
            src={cert.image}
            alt={cert.title}
            fill
            sizes="(max-width: 1024px) 100vw, 960px"
            className="object-contain p-4 sm:p-8"
          />
        </div>
        <div className="mt-5 flex items-start justify-between gap-4 text-white">
          <div>
            <h3 id="certificate-lightbox-title" className="text-[1.25rem]">
              {cert.title}
            </h3>
            {cert.description && (
              <p className="mt-1 max-w-2xl text-[0.9375rem] text-white/70">{cert.description}</p>
            )}
          </div>
          <p className="shrink-0 text-[0.75rem] uppercase tracking-[0.16em] text-gold">
            {index + 1} / {items.length}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white hover:border-gold hover:text-gold"
        aria-label="Close"
      >
        <X size={18} />
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => onIndexChange((index - 1 + items.length) % items.length)}
            className="absolute top-1/2 left-3 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 text-white hover:border-gold hover:text-gold md:left-6"
            aria-label="Previous certificate"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => onIndexChange((index + 1) % items.length)}
            className="absolute top-1/2 right-3 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 text-white hover:border-gold hover:text-gold md:right-6"
            aria-label="Next certificate"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );

  return createPortal(content, document.body);
}
