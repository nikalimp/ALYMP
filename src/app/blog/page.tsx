import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { blogRubrics, formatDate, getPosts } from "@/lib/posts";
import { Container, Eyebrow, Section } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { BlogExplorer, type BlogCard } from "@/components/blog/blog-explorer";
import { graph, itemListSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Блог ALYMP — гайды по роботам, умному дому и ИИ",
  description:
    "Практические гайды редакции ALYMP: как выбрать робот-пылесос, мойщик окон, умный замок и хаб; как связать устройства с Алисой, Zigbee и Matter.",
  alternates: { canonical: "/blog/" },
  ...(!site.features.blog && { robots: { index: false, follow: true } }),
};

export default function Blog() {
  const posts = getPosts();
  const cards: BlogCard[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    date: p.date,
    dateFormatted: formatDate(p.date),
    rubric: p.rubric,
    rubricLabel: blogRubrics[p.rubric],
    author: p.author,
  }));

  return (
    <>
      <JsonLd
        data={graph(
          { "@type": "Blog", name: `Блог ${site.name}`, url: `${site.url}/blog/`, inLanguage: "ru-RU" },
          itemListSchema("Статьи блога ALYMP", posts.map((p) => ({ name: p.title, url: `/blog/${p.slug}/` }))),
        )}
      />

      <Section className="border-b pb-12 pt-14">
        <Container>
          <Eyebrow>Журнал ALYMP · {posts.length} гайдов</Eyebrow>
          <h1 className="mt-3 text-[clamp(40px,6vw,84px)] font-bold leading-[0.94] tracking-[-0.04em]">
            Блог и гайды
          </h1>
          <p className="mt-6 max-w-4xl text-xl leading-relaxed text-foreground-2">
            Разборы технологий и практические руководства редакции ALYMP по выбору роботов-пылесосов, мойщиков окон, умных замков и хабов умного дома. Все цифры проверены по официальным спецификациям брендов, без рекламной воды.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/news/"
              className="inline-flex min-h-11 items-center rounded-full border border-border-strong px-6 text-sm font-semibold transition-colors duration-200 hover:border-foreground"
            >
              Новости робототехники
            </Link>
            <Link
              href="/glossary/"
              className="inline-flex min-h-11 items-center rounded-full border border-border-strong px-6 text-sm font-semibold transition-colors duration-200 hover:border-foreground"
            >
              Глоссарий 50 терминов
            </Link>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <BlogExplorer posts={cards} />
        </Container>
      </Section>
    </>
  );
}
