import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Page not found',
  description:
    'The page you are looking for may have moved or no longer exists. Browse RIVET products, services, or request a quotation for your project in Ethiopia.',
  path: '/',
  noIndex: true,
});

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-bg pt-28 pb-16">
      <Container>
        <p className="text-[0.75rem] font-medium tracking-[0.2em] text-gold uppercase">404</p>
        <h1 className="mt-4 max-w-xl text-[2.5rem] sm:text-[3rem]">Page not found</h1>
        <p className="mt-4 max-w-lg text-[1.0625rem] leading-relaxed text-muted">
          The page you are looking for may have moved or no longer exists. Browse our products,
          services, or request a quotation for your project in Ethiopia.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className={cn(buttonVariants({ variant: 'primary', size: 'md' }))}>
            Back to home
          </Link>
          <Link href="/products" className={cn(buttonVariants({ variant: 'outline', size: 'md' }))}>
            View products
          </Link>
          <Link
            href="/request-quotation"
            className={cn(buttonVariants({ variant: 'outline', size: 'md' }))}
          >
            Request a quotation
          </Link>
        </div>
      </Container>
    </section>
  );
}
