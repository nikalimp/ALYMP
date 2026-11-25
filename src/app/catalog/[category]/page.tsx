import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Container, Eyebrow, Section } from "@/components/container";
import { FaqList } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { categories } from "@/content/catalog";
import { getProducts, type Product } from "@/lib/products";
import { getLandings } from "@/lib/landings";
import { brandName } from "@/lib/brands";
import { breadcrumbs, faqSchema, graph, itemListSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";

export const dynamicParams = false;
export function generateStaticParams() {
  return (Object.keys(categories) as Product["category"][]).map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const meta = categories[(await params).category as Product["category"]];
  if (!meta) return {};
  return {
    title: meta.metaTitle,
    description: meta.metaDescription,
    alternates: { canonical: `/catalog/${meta.slug}/` },
  };
}

const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/\u00A0/g, " ");
const statusLabel = { in_stock: "в продаже", preorder: "под заказ", unknown: "под заказ" } as const;

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const slug = (await params).category as Product["category"];
  const meta = categories[slug];
  if (!meta) notFound();

  const products = getProducts().filter((p) => p.category === slug);
  const readySlugs = new Set(getLandings().map((l) => l.slug));

  const crumbs = [
    { name: "Каталог", path: "/catalog/" },
    { name: meta.title, path: `/catalog/${meta.slug}/` },
  ];

  const listItems = products.map((p) => ({
    name: p.name,
    url: readySlugs.has(p.slug) ? `/products/${p.slug}/` : `/catalog/${meta.slug}/`,
  }));

  return (
    <>
      <JsonLd data={graph(itemListSchema(meta.title, listItems), faqSchema(meta.faq), breadcrumbs(crumbs))} />

      <Section className="border-b pb-12 pt-10">
        <Container>
          <nav aria-label="Хлебные крошки" className="text-sm text-foreground-2">
            <Link href="/catalog/" className="hover:text-foreground">Каталог</Link> / <span>{meta.title}</span>
          </nav>
          <div className="mt-6">
            <Eyebrow>{meta.eyebrow}</Eyebrow>
            <h1 className="mt-3 text-[clamp(40px,6vw,84px)] font-bold leading-[0.94] tracking-[-0.04em]">{meta.h1}</h1>
            <p className="mt-6 max-w-4xl text-xl leading-relaxed text-foreground-2">{meta.answer}</p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const hasLanding = readySlugs.has(p.slug);
              const bLabel = brandName[p.brand] ?? p.brand;
              const spec = p.specs[0];
              return (
                <article key={p.slug} className="flex flex-col justify-between bg-card p-6 sm:p-7">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">{bLabel}</span>
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                        <i aria-hidden="true" className={cn("size-1.5 rounded-full", p.status === "in_stock" ? "bg-ok" : "bg-warn")} />
                        {statusLabel[p.status]}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em]">
                      {hasLanding ? (
                        <Link href={`/products/${p.slug}/`} className="hover:underline underline-offset-4">{p.name}</Link>
                      ) : (
                        p.name
                      )}
                    </h2>
                    {spec && (
                      <p className="mt-2 font-mono text-xs text-brand">
                        {spec.label}: {spec.value}{spec.unit ? ` ${spec.unit}` : ""}
                      </p>
                    )}
                    <p className="mt-3 text-sm leading-relaxed text-foreground-2">
                      {p.facts[0]?.text ?? "Устройство доступно к заказу по заявке; точную цену подтвердит менеджер."}
                    </p>
                  </div>

                  <div className="mt-6 border-t pt-5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-lg font-semibold tabular">
                        {p.priceEstimate ? `от ${fmt(p.priceEstimate)} ₽` : "Цена по запросу"}
                      </span>
                      {p.priceEstimate && <span className="font-mono text-[11px] text-muted-foreground">ориентир</span>}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {hasLanding ? (
                        <>
                          <Link
                            href={`/products/${p.slug}/`}
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-85"
                          >
                            <span>Подробнее</span>
                            <ArrowRight className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                          </Link>
                          <AddToCartButton
                            item={{ slug: p.slug, name: p.name, brand: bLabel, priceEstimate: p.priceEstimate, hasLanding: true }}
                          />
                        </>
                      ) : (
                        <AddToCartButton
                          variant="primary"
                          item={{ slug: p.slug, name: p.name, brand: bLabel, priceEstimate: p.priceEstimate, hasLanding: false }}
                        />
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section className="border-t bg-muted/40">
        <Container>
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold leading-none tracking-[-0.03em]">{meta.howToChooseTitle}</h2>
          <div className="mt-8 grid gap-px bg-border sm:grid-cols-3">
            {meta.howToChoose.map((item, i) => (
              <div key={item.title} className="bg-background p-6 sm:p-7">
                <p className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-foreground-2">{item.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold leading-none tracking-[-0.03em]">Частые вопросы</h2>
          <FaqList items={meta.faq} />
        </Container>
      </Section>
    </>
  );
}
