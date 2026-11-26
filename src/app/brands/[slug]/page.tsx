import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Container, Eyebrow, Section } from "@/components/container";
import { FaqList } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { brandProfiles, brandSlugs, type BrandProfile } from "@/content/brands";
import { brandName } from "@/lib/brands";
import { getProducts } from "@/lib/products";
import { getLandings } from "@/lib/landings";
import { brandSchema, breadcrumbs, faqSchema, graph, itemListSchema } from "@/lib/schema";

export const dynamicParams = false;
export function generateStaticParams() {
  return brandSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const b = brandProfiles[(await params).slug as BrandProfile["slug"]];
  if (!b) return {};
  return {
    title: b.metaTitle,
    description: b.metaDescription,
    alternates: { canonical: `/brands/${b.slug}/` },
  };
}

const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/\u00A0/g, " ");

export default async function BrandDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug as BrandProfile["slug"];
  const b = brandProfiles[slug];
  if (!b) notFound();

  const allProducts = getProducts();
  const products = b.isMediaBrand
    ? (b.alternativesInCatalog ?? [])
        .map((s) => allProducts.find((p) => p.slug === s))
        .filter((x): x is NonNullable<typeof x> => Boolean(x))
    : allProducts.filter((p) => p.brand === slug);
  const readySlugs = new Set(getLandings().map((l) => l.slug));

  const crumbs = [
    { name: "Бренды", path: "/brands/" },
    { name: b.name, path: `/brands/${b.slug}/` },
  ];

  const listItems = products.map((p) => ({
    name: p.name,
    url: readySlugs.has(p.slug) ? `/products/${p.slug}/` : `/catalog/${p.category}/`,
  }));

  return (
    <>
      <JsonLd
        data={graph(
          brandSchema({ slug: b.slug, name: b.name, description: b.answer, url: b.officialUrl }),
          listItems.length > 0 && !b.isMediaBrand ? itemListSchema(`Устройства ${b.name} в ALYMP`, listItems) : null,
          faqSchema(b.faq),
          breadcrumbs(crumbs),
        )}
      />

      <Section className="border-b pb-12 pt-10">
        <Container>
          <nav aria-label="Хлебные крошки" className="text-sm text-foreground-2">
            <Link href="/brands/" className="hover:text-foreground">Бренды</Link> / <span>{b.name}</span>
          </nav>
          <div className="mt-6">
            <Eyebrow>{b.country}{b.founded !== "—" ? ` · Основан в ${b.founded}` : ""}</Eyebrow>
            <h1 className="mt-3 text-[clamp(40px,6vw,84px)] font-bold leading-[0.94] tracking-[-0.04em]">{b.name}</h1>
            <p className="mt-6 max-w-4xl text-xl leading-relaxed text-foreground-2">{b.answer}</p>
            {b.isMediaBrand && b.availabilityRu && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-l-2 border-brand bg-muted/60 p-4 text-sm">
                <p className="font-medium text-foreground">Статус в РФ: {b.availabilityRu}</p>
                <Link href={b.newsLink ?? "/news/"} className="font-semibold text-brand underline underline-offset-4">
                  Следить за релизами в новостях →
                </Link>
              </div>
            )}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold leading-none tracking-[-0.03em]">
            {b.isMediaBrand
              ? `Серийные альтернативы в каталоге ALYMP (${products.length})`
              : `Устройства ${b.name} в каталоге (${products.length})`}
          </h2>
          {b.isMediaBrand && (
            <p className="mt-3 max-w-3xl text-foreground-2">
              Пока {b.name} не продаётся официально в России, в ALYMP под заказ в собственность доступны серийные робототехнические платформы Unitree с подтверждёнными характеристиками.
            </p>
          )}
          <div className="mt-8 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const hasLanding = readySlugs.has(p.slug);
              return (
                <article key={p.slug} className="flex flex-col justify-between bg-card p-6">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {hasLanding ? (
                        <Link href={`/products/${p.slug}/`} className="hover:underline underline-offset-4">{p.name}</Link>
                      ) : (
                        p.name
                      )}
                    </h3>
                    <p className="mt-2 text-sm text-foreground-2">
                      {p.facts[0]?.text ?? "Устройство доступно к заказу по заявке."}
                    </p>
                  </div>
                  <div className="mt-6 border-t pt-4">
                    <p className="font-mono text-base font-semibold tabular">
                      {p.priceEstimate ? `от ${fmt(p.priceEstimate)} ₽` : "Цена по запросу"}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {hasLanding && (
                        <Link
                          href={`/products/${p.slug}/`}
                          className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
                        >
                          <span>Подробнее</span>
                          <ArrowRight className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                        </Link>
                      )}
                      <AddToCartButton
                        variant={hasLanding ? "outline" : "primary"}
                        item={{ slug: p.slug, name: p.name, brand: brandName[p.brand] ?? b.name, priceEstimate: p.priceEstimate, hasLanding }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section className="border-t bg-muted/40">
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-[clamp(28px,4vw,44px)] font-bold leading-tight tracking-[-0.03em]">О производителе и технологиях</h2>
            <p className="mt-4 text-sm text-foreground-2">{b.compatibilityNote}</p>
            <Link href="/compatibility/" className="mt-5 inline-flex text-sm font-semibold text-brand underline underline-offset-4">
              Смотреть матрицу совместимости →
            </Link>
          </div>
          <div className="space-y-4">
            {b.story.map((para) => (
              <p key={para.slice(0, 24)} className="text-base leading-relaxed text-foreground-2">
                {para}
              </p>
            ))}
            <div className="mt-6 grid gap-px bg-border sm:grid-cols-3">
              {b.technologies.map((t) => (
                <div key={t.name} className="bg-background p-5">
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="mt-2 text-sm text-foreground-2">{t.text}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-[clamp(28px,4vw,44px)] font-bold leading-none tracking-[-0.03em]">Вопросы о {b.name}</h2>
          <FaqList items={b.faq} />
        </Container>
      </Section>
    </>
  );
}
