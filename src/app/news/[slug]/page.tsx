import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import { formatNewsDate, getNews, getNewsItem } from "@/lib/news";
import { getProduct } from "@/lib/products";
import { linkTerms } from "@/lib/link-terms";
import { site } from "@/content/site";
import { Container, Eyebrow, Section } from "@/components/container";
import { Crumbs } from "@/components/crumbs";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbs, graph, newsArticleSchema } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  const items = getNews();
  return items.length ? items.map((n) => ({ slug: n.slug })) : [{ slug: "_" }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const n = getNewsItem((await params).slug);
  if (!n) return { robots: { index: false } };
  return {
    title: { absolute: `${n.title} — ALYMP` },
    description: n.description,
    alternates: { canonical: `/news/${n.slug}/` },
    openGraph: {
      type: "article",
      title: n.title,
      description: n.description,
      url: `${site.url}/news/${n.slug}/`,
      publishedTime: n.date,
      modifiedTime: n.updated ?? n.date,
      images: ["/og.png"],
    },
  };
}

export default async function NewsItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const n = getNewsItem((await params).slug);
  if (!n) notFound();

  const used = new Set<string>();
  const related = (n.relatedProducts ?? []).map((s) => getProduct(s)).filter((x): x is NonNullable<typeof x> => Boolean(x));

  return (
    <>
      <JsonLd
        data={graph(
          newsArticleSchema(n),
          breadcrumbs([
            { name: "Главная", path: "/" },
            { name: "Новости", path: "/news/" },
            { name: n.title, path: `/news/${n.slug}/` },
          ]),
        )}
      />

      <Section className="pt-12">
        <Container className="max-w-3xl">
          <Crumbs items={[{ name: "Главная", path: "/" }, { name: "Новости", path: "/news/" }, { name: n.title }]} />
          <div className="mt-4">
            <Eyebrow>{n.brand}</Eyebrow>
          </div>
          <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{n.title}</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Редакция ALYMP · <time dateTime={n.date}>{formatNewsDate(n.date)}</time>
            {n.updated && n.updated !== n.date && <> · обновлено <time dateTime={n.updated}>{formatNewsDate(n.updated)}</time></>}
          </p>

          <p className="mt-8 text-lg font-medium leading-relaxed text-foreground">
            {linkTerms(n.summary, { used, maxLinks: 4 })}
          </p>

          <div className="mt-6 space-y-5 text-base leading-relaxed text-foreground-2">
            {n.body.map((para, i) => (
              <p key={i}>{linkTerms(para, { used, maxLinks: 3 })}</p>
            ))}
          </div>

          <div className="mt-10 border-l-2 border-brand bg-muted/60 p-6">
            <h2 className="font-mono text-xs uppercase tracking-[0.08em] text-brand">
              Что это значит для покупателя в России
            </h2>
            <p className="mt-3 text-base leading-relaxed text-foreground">
              {linkTerms(n.forRussia, { used, maxLinks: 3 })}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y py-4 text-sm text-muted-foreground">
            <span>
              Первоисточник:{" "}
              <a
                href={n.sourceUrl}
                target="_blank"
                rel="noopener nofollow"
                className="inline-flex items-center gap-1 text-foreground underline underline-offset-4 hover:opacity-75"
              >
                <span>{n.sourceName}</span>
                <ExternalLink className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
              </a>
            </span>
            <time dateTime={n.date}>Проверено {formatNewsDate(n.date)}</time>
          </div>

          {related.length > 0 && (
            <div className="mt-10">
              <h2 className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
                Связанные модели в каталоге ALYMP
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {related.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/products/${p.slug}/`}
                    className="flex items-center justify-between border bg-card p-5 transition-colors hover:bg-muted/60"
                  >
                    <span className="font-semibold text-foreground">{p.name}</span>
                    <ArrowRight className="size-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
