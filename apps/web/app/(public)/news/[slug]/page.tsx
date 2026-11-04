import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container, Eyebrow, Section } from '@/components/ui/container';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { ArticleJsonLd } from '@/components/seo/json-ld';
import { RivetImage } from '@/components/ui/rivet-image';
import { RichText } from '@/components/ui/rich-text';
import { api } from '@/lib/api';
import { assets } from '@/lib/assets';
import { articleMetadata, notFoundMetadata } from '@/lib/seo';

type Params = Promise<{ slug: string }>;

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const first = await api.news.list({ pageSize: 100, page: 1 });
    const articles = [...first.articles];
    for (let page = 2; page <= first.pagination.pages; page += 1) {
      const next = await api.news.list({ pageSize: 100, page });
      articles.push(...next.articles);
    }
    return articles.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  try {
    const { article } = await api.news.bySlug((await params).slug);
    return articleMetadata(article);
  } catch {
    return notFoundMetadata('Article');
  }
}

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function NewsArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  let article;
  try {
    ({ article } = await api.news.bySlug(slug));
  } catch {
    notFound();
  }

  const cover = article.coverImage ?? assets.news.n1;

  return (
    <>
      <ArticleJsonLd
        title={article.title}
        description={article.excerpt}
        slug={article.slug}
        image={cover}
        publishedAt={article.publishedAt}
        updatedAt={article.updatedAt}
        category={article.category}
      />
      <section className="border-b border-border bg-bg pt-28 pb-24 md:pt-32 md:pb-28">
        <Container className="max-w-3xl">
          <div>
            <Breadcrumbs
              items={[
                { name: 'Home', path: '/' },
                { name: 'News', path: '/news' },
                { name: article.title, path: `/news/${article.slug}` },
              ]}
            />
          </div>
          {article.category && <Eyebrow className="mt-8 block">{article.category}</Eyebrow>}
          <h1 className="headline-display mt-3 text-[2.25rem] sm:text-[2.75rem]">{article.title}</h1>
          <time className="mt-5 block text-[0.9375rem] text-muted">
            {formatDate(article.publishedAt)}
          </time>
        </Container>
      </section>

      <div className="relative mx-auto -mt-16 max-w-[860px] px-5 sm:px-6">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[8px] border border-border bg-bg">
          <RivetImage
            src={cover}
            alt={`${article.title} — RIVET news in Ethiopia`}
            fill
            priority
            sizes="(max-width: 860px) 100vw, 860px"
            className="object-cover"
          />
        </div>
      </div>

      <Section>
        <Container className="max-w-3xl">
          {article.excerpt && (
            <p className="text-[1.25rem] leading-relaxed text-muted">{article.excerpt}</p>
          )}
          <RichText
            className="prose prose-lg mt-8 max-w-none text-ink prose-headings:font-display prose-headings:text-navy prose-a:text-navy dark:prose-invert dark:prose-headings:text-ink dark:prose-a:text-gold prose-a:underline prose-a:decoration-gold prose-a:underline-offset-4"
            html={article.body}
          />
          <p className="mt-12">
            <Link href="/news" className="text-[0.9375rem] font-medium text-navy underline-offset-4 hover:underline">
              ← All news
            </Link>
          </p>
        </Container>
      </Section>
    </>
  );
}
