import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";
import { formatNewsDate, getNews } from "@/lib/news";
import { Container, Eyebrow, Section } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { graph, itemListSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Новости робототехники и умного дома — ALYMP",
  description:
    "Главные новости индустрии роботов и умного дома: Roborock, Dreame, Aqara, Unitree, Ecovacs, Matter и Thread. Краткий пересказ и разбор для России.",
  alternates: { canonical: "/news/" },
  ...(!site.features.news && { robots: { index: false, follow: true } }),
};

export default function NewsHubPage() {
  const items = getNews();

  return (
    <>
      <JsonLd
        data={graph(
          {
            "@type": "CollectionPage",
            name: "Новости робототехники и умного дома — ALYMP",
            url: `${site.url}/news/`,
            inLanguage: "ru-RU",
          },
          itemListSchema("Новости ALYMP", items.map((n) => ({ name: n.title, url: `/news/${n.slug}/` }))),
        )}
      />

      <Section className="border-b pb-12 pt-14">
        <Container>
          <Eyebrow>Журнал ALYMP · {items.length} новостей</Eyebrow>
          <h1 className="mt-3 text-[clamp(40px,6vw,84px)] font-bold leading-[0.94] tracking-[-0.04em]">
            Новости индустрии
          </h1>
          <p className="mt-6 max-w-4xl text-xl leading-relaxed text-foreground-2">
            Следим за релизами Roborock, Dreame, Aqara, Unitree, Ecovacs и обновлениями стандартов Matter и Thread. Каждая заметка проверена по официальному первоисточнику и содержит блок «Что это значит для покупателя в России».
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/blog/"
              className="inline-flex min-h-11 items-center rounded-full border border-border-strong px-6 text-sm font-semibold transition-colors duration-200 hover:border-foreground"
            >
              Гайды и статьи блога
            </Link>
            <Link
              href="/catalog/"
              className="inline-flex min-h-11 items-center rounded-full border border-border-strong px-6 text-sm font-semibold transition-colors duration-200 hover:border-foreground"
            >
              Каталог 17 флагманов
            </Link>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-px bg-border md:grid-cols-2">
            {items.map((n) => (
              <Link
                key={n.slug}
                href={`/news/${n.slug}/`}
                className="group flex flex-col justify-between bg-card p-6 transition-colors duration-150 hover:bg-muted/60 sm:p-8"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
                    <span className="uppercase tracking-[0.06em] text-brand">{n.brand}</span>
                    <time dateTime={n.date}>{formatNewsDate(n.date)}</time>
                  </div>
                  <h2 className="mt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-foreground sm:text-2xl">
                    {n.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-foreground-2">{n.summary}</p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                  <span>Источник: {n.sourceName}</span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                    <span>Читать</span>
                    <ArrowRight className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
