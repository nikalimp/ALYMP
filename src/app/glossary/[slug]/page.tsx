import { SelectorCta } from "@/components/selector-cta";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Container, Eyebrow, Section } from "@/components/container";
import { FaqList } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { getGlossaryTerm, getGlossaryTerms, glossaryCategories } from "@/lib/glossary";
import { getProduct } from "@/lib/products";
import { brandName } from "@/lib/brands";
import { linkTerms } from "@/lib/link-terms";
import { breadcrumbs, definedTermSchema, faqSchema, graph } from "@/lib/schema";

export const dynamicParams = false;
export function generateStaticParams() {
  return getGlossaryTerms().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = getGlossaryTerm((await params).slug);
  if (!t) return {};
  return {
    title: { absolute: `${t.title} — ALYMP` },
    description: t.description,
    alternates: { canonical: `/glossary/${t.slug}/` },
  };
}

const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/\u00A0/g, " ");

export default async function GlossaryTermPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = getGlossaryTerm((await params).slug);
  if (!t) notFound();

  const cat = glossaryCategories[t.category];
  const neighbor = getGlossaryTerm(t.compareWith.slug);
  const products = t.products.map((s) => getProduct(s)).filter((x): x is NonNullable<typeof x> => Boolean(x));
  const used = new Set<string>([t.slug]);

  const crumbs = [
    { name: "Глоссарий", path: "/glossary/" },
    { name: t.name, path: `/glossary/${t.slug}/` },
  ];

  return (
    <>
      <JsonLd data={graph(definedTermSchema(t), faqSchema(t.faq), breadcrumbs(crumbs))} />

      <Section className="border-b pb-12 pt-10">
        <Container>
          <nav aria-label="Хлебные крошки" className="text-sm text-foreground-2">
            <Link href="/glossary/" className="hover:text-foreground">Глоссарий</Link> / <span>{t.name}</span>
          </nav>

          <div className="mt-6 grid gap-10 lg:grid-cols-[2fr_1fr] lg:items-start">
            <div>
              <Eyebrow>{cat.label}</Eyebrow>
              <h1 className="mt-3 text-[clamp(36px,5.5vw,72px)] font-bold leading-[0.95] tracking-[-0.04em]">
                {t.name}
              </h1>
              <p className="mt-3 font-mono text-sm text-muted-foreground">
                {t.englishName} · {t.shortDecryption}
              </p>
              <p className="mt-6 max-w-3xl text-xl leading-relaxed text-foreground">
                {linkTerms(t.definition, { used, excludeSlug: t.slug, maxLinks: 4 })}
              </p>

              {t.homonym && (
                <div className="mt-6 border-l-2 border-brand bg-muted/60 p-4 text-sm text-foreground-2">
                  <p className="font-mono text-xs uppercase tracking-[0.06em] text-brand">
                    Не путать с {t.homonym.other}
                  </p>
                  <p className="mt-1.5 leading-relaxed">{t.homonym.text}</p>
                </div>
              )}
            </div>

            <aside className="border bg-card p-6">
              <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
                Где в каталоге ALYMP
              </p>
              {products.length > 0 ? (
                <ul className="mt-4 divide-y">
                  {products.map((p) => (
                    <li key={p.slug} className="py-3 first:pt-0 last:pb-0">
                      <Link href={`/products/${p.slug}/`} className="group flex items-center justify-between gap-2">
                        <div>
                          <span className="block text-sm font-semibold text-foreground group-hover:underline underline-offset-4">
                            {p.name}
                          </span>
                          <span className="block font-mono text-xs text-muted-foreground">
                            {brandName[p.brand] ?? p.brand} ·{" "}
                            {p.priceEstimate ? `от ${fmt(p.priceEstimate)} ₽` : "по запросу"}
                          </span>
                        </div>
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-foreground-2">
                  Общее понятие для выбора и настройки техники из каталога ALYMP.
                </p>
              )}
              <Link
                href="/compatibility/"
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline underline-offset-4"
              >
                <span>Таблица совместимости всех 17 моделей</span>
                <ArrowRight className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
              </Link>
            </aside>
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="text-2xl font-bold tracking-[-0.025em] sm:text-3xl">Как это работает</h2>
              <p className="mt-4 text-base leading-relaxed text-foreground-2">
                {linkTerms(t.howItWorks, { used, excludeSlug: t.slug, maxLinks: 5 })}
              </p>
            </div>

            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold tracking-[-0.025em] sm:text-3xl">История и происхождение</h2>
              <p className="mt-4 text-base leading-relaxed text-foreground-2">
                {linkTerms(t.history, { used, excludeSlug: t.slug, maxLinks: 3 })}
              </p>
            </div>
          </div>

          <div className="border bg-muted/40 p-6 sm:p-7">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Отличие от соседнего термина
            </p>
            <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em]">
              {t.name} и {t.compareWith.name}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground-2">
              {linkTerms(t.compareWith.text, { used, excludeSlug: t.slug, maxLinks: 3 })}
            </p>
            {neighbor && (
              <Link
                href={`/glossary/${neighbor.slug}/`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline underline-offset-4"
              >
                <span>Открыть термин «{neighbor.name}»</span>
                <ArrowRight className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
              </Link>
            )}
          </div>
        </Container>
      </Section>

      <Section className="border-t bg-muted/40">
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-[clamp(28px,4vw,44px)] font-bold leading-none tracking-[-0.03em]">Частые вопросы</h2>
            <p className="mt-4 text-sm text-foreground-2">
              Короткие ответы по теме «{t.name}» и практическому применению дома.
            </p>
          </div>
          <FaqList items={t.faq} />
        </Container>
      </Section>
      <SelectorCta />
    </>
  );
}
