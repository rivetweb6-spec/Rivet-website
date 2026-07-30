import { RivetImage } from '@/components/ui/rivet-image';
import { assets } from '@/lib/assets';

/**
 * Fixed hero-style backdrop for admin login — same flagship image and overlay
 * treatment as the public homepage.
 */
export function AdminBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <RivetImage
        src={assets.hero.image}
        alt=""
        fill
        sizes="100vw"
        className="scale-105 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/90 via-navy/65 to-navy-deep/95 dark:from-navy-deep/95 dark:via-navy/85 dark:to-navy-deep/98" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(214,154,46,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,transparent,rgba(0,26,48,0.55))]" />
      <div className="absolute inset-0 bg-canvas/30 dark:bg-transparent" />
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
      <div className="absolute inset-0 luxury-grain" />
    </div>
  );
}
