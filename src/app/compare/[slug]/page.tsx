import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow, Section } from "@/components/container";
import { FaqList } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { comparisons, getComparison } from "@/content/comparisons";
import { getProduct } from "@/lib/products";
import { getLandings } from "@/lib/landings";
import { brandName } from "@/lib/brands";
import { breadcrumbs, faqSchema, graph, itemListSchema } from "@/lib/schema";

export const dynamicParams = false;
export function generateStaticParams() {
  return comparisons.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = getComparison((await params).slug);
  if (!c) return {};
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: `/compare/${c.slug}/` },
  };
}

export default async function ComparisonDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const c = getComparison((await params).slug);
  if (!c) notFound();

  const prodA = getProduct(c.productA.slug);
  const prodB = getProduct(c.productB.slug);
  const readySlugs = new Set(getLandings().map((l) => l.slug));

  const crumbs = [
    { name: "Сравнения", path: "/compare/" },
    { name: c.h1, path: `/compare/${c.slug}/` },
  ];

  const listItems = [
    { name: c.productA.name, url: readySlugs.has(c.productA.slug) ? `/products/${c.productA.slug}/` : `/compare/${c.slug}/` },
    { name: c.productB.name, url: readySlugs.has(c.productB.slug) ? `/products/${c.productB.slug}/` : `/compare/${c.slug}/` },
  ];

  return (
    <>
      <JsonLd data={graph(itemListSchema(c.h1, listItems), faqSchema(c.faq), breadcrumbs(crumbs))} />

      <Section className="border-b pb-12 pt-10">
        <Container>
          <nav aria-label="Хлебные крошки" className="text-sm text-foreground-2">
            <Link href="/compare/" className="hover:text-foreground">Сравнения</Link> / <span>{c.h1}</span>
          </nav>
          <div className="mt-6">
            <Eyebrow>Честное сравнение · Проверено 25.11.2026</Eyebrow>
            <h1 className="mt-3 text-[clamp(34px,5.2vw,72px)] font-bold leading-[0.96] tracking-[-0.04em]">{c.h1}</h1>
            <p className="mt-6 max-w-4xl text-xl leading-relaxed text-foreground-2">{c.verdict}</p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="text-[clamp(26px,3.6vw,44px)] font-bold leading-none tracking-[-0.03em]">Сводная таблица характеристик</h2>
          <div className="mt-8 overflow-x-auto border">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-2 border-foreground bg-muted/60">
                  <th scope="col" className="px-4 py-3.5 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">Параметр</th>
                  <th scope="col" className="px-4 py-3.5 text-base font-semibold">{c.productA.name}</th>
                  <th scope="col" className="px-4 py-3.5 text-base font-semibold">{c.productB.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {c.table.map((row) => (
                  <tr key={row.label} className="bg-background">
                    <th scope="row" className="px-4 py-3.5 font-normal text-foreground-2">{row.label}</th>
                    <td className="px-4 py-3.5 font-medium tabular">{row.a}</td>
                    <td className="px-4 py-3.5 font-medium tabular">{row.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>

      <Section className="border-t bg-muted/40">
        <Container className="max-w-4xl space-y-10">
          {c.sections.map((sec, i) => (
            <article key={sec.title}>
              <p className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em] sm:text-3xl">{sec.title}</h2>
              <p className="mt-3 text-base leading-relaxed text-foreground-2">{sec.text}</p>
            </article>
          ))}
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="text-[clamp(26px,3.6vw,44px)] font-bold leading-none tracking-[-0.03em]">Итог: кому что подходит</h2>
          <div className="mt-8 grid gap-px bg-border sm:grid-cols-2">
            <div className="flex flex-col justify-between bg-card p-7">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">Выбор A</p>
                <h3 className="mt-2 text-xl font-semibold">{c.productA.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground-2">{c.chooseA}</p>
              </div>
              {prodA && (
                <div className="mt-6 flex flex-wrap gap-2 border-t pt-5">
                  {readySlugs.has(prodA.slug) && (
                    <Link href={`/products/${prodA.slug}/`} className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
                      Обзор модели
                    </Link>
                  )}
                  <AddToCartButton
                    variant={readySlugs.has(prodA.slug) ? "outline" : "primary"}
                    item={{ slug: prodA.slug, name: prodA.name, brand: brandName[prodA.brand] ?? prodA.brand, priceEstimate: prodA.priceEstimate, hasLanding: readySlugs.has(prodA.slug) }}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between bg-card p-7">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">Выбор B</p>
                <h3 className="mt-2 text-xl font-semibold">{c.productB.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground-2">{c.chooseB}</p>
              </div>
              {prodB && (
                <div className="mt-6 flex flex-wrap gap-2 border-t pt-5">
                  {readySlugs.has(prodB.slug) && (
                    <Link href={`/products/${prodB.slug}/`} className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
                      Обзор модели
                    </Link>
                  )}
                  <AddToCartButton
                    variant={readySlugs.has(prodB.slug) ? "outline" : "primary"}
                    item={{ slug: prodB.slug, name: prodB.name, brand: brandName[prodB.brand] ?? prodB.brand, priceEstimate: prodB.priceEstimate, hasLanding: readySlugs.has(prodB.slug) }}
                  />
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="border-t">
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-[clamp(26px,3.6vw,44px)] font-bold leading-none tracking-[-0.03em]">Частые вопросы</h2>
          <FaqList items={c.faq} />
        </Container>
      </Section>
    </>
  );
}
