import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { blogRubrics, formatDate, getPost, getPosts } from "@/lib/posts";
import { site } from "@/content/site";
import { Container, Eyebrow, Section } from "@/components/container";
import { Crumbs } from "@/components/crumbs";
import { SelectorCta } from "@/components/selector-cta";
import { JsonLd } from "@/components/json-ld";
import { articleSchema, breadcrumbs, faqSchema, graph } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  const posts = getPosts();
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "_" }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getPost((await params).slug);
  if (!p) return { robots: { index: false } };
  return {
    title: { absolute: `${p.title} — ALYMP` },
    description: p.description,
    alternates: { canonical: `/blog/${p.slug}/` },
    openGraph: {
      type: "article",
      title: p.title,
      description: p.description,
      url: `${site.url}/blog/${p.slug}/`,
      publishedTime: p.date,
      modifiedTime: p.updated ?? p.date,
      images: ["/og.png"],
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getPost((await params).slug);
  if (!p) notFound();
  const others = getPosts().filter((x) => x.slug !== p.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={graph(
          articleSchema(p),
          p.faq.length ? faqSchema(p.faq) : null,
          breadcrumbs([
            { name: "Главная", path: "/" },
            { name: "Блог", path: "/blog/" },
            { name: p.title, path: `/blog/${p.slug}/` },
          ]),
        )}
      />
      <Section className="pt-12">
        <Container className="max-w-3xl">
          <Crumbs items={[{ name: "Главная", path: "/" }, { name: "Блог", path: "/blog/" }, { name: p.title }]} />
          <div className="mt-4">
            <Eyebrow>{blogRubrics[p.rubric]}</Eyebrow>
          </div>
          <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{p.title}</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {p.author} · опубликовано <time dateTime={p.date}>{formatDate(p.date)}</time>
            {p.updated && <> · обновлено <time dateTime={p.updated}>{formatDate(p.updated)}</time></>}
          </p>
          <article className="prose-site mt-10">
            <Markdown remarkPlugins={[remarkGfm]}>{p.body}</Markdown>
          </article>

          {others.length > 0 && (
            <div className="mt-14 border-t pt-8">
              <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">Читайте также</p>
              <ul className="mt-4 space-y-3">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link href={`/blog/${o.slug}/`} className="font-medium text-foreground underline underline-offset-4 hover:opacity-75">
                      {o.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Container>
      </Section>
      <SelectorCta />
    </>
  );
}
