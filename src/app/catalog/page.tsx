import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, Eyebrow, Section } from "@/components/container";
import { FaqList } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { ProductGrid, type GridProduct } from "@/components/home/product-grid";
import { catalogHub, categories } from "@/content/catalog";
import { getProducts } from "@/lib/products";
import { categoryLabel, getLandings } from "@/lib/landings";
import { brandName } from "@/lib/brands";
import { faqSchema, graph, itemListSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: catalogHub.metaTitle,
  description: catalogHub.metaDescription,
  alternates: { canonical: "/catalog/" },
};

export default function CatalogPage() {
  const products = getProducts();
  const readySlugs = new Set(getLandings().map((l) => l.slug));

  const gridProducts: GridProduct[] = products.map((p) => {
    const firstSpec = p.specs[0];
    const keySpec = firstSpec
      ? `${firstSpec.label}: ${firstSpec.value}${firstSpec.unit ? ` ${firstSpec.unit}` : ""}`
      : `${brandName[p.brand] ?? p.brand} · официальная поставка`;
    return {
      slug: p.slug,
      name: p.name,
      brandLabel: brandName[p.brand] ?? p.brand,
      category: p.category,
      categoryLabel: categoryLabel[p.category],
      status: p.status,
      priceEstimate: p.priceEstimate,
      priceDate: p.priceDate,
      hasLanding: readySlugs.has(p.slug),
      highlight: p.facts[0]?.text ?? "Подробный разбор модели готовится — устройство доступно к заказу по заявке.",
      keySpec,
      image: p.media?.card,
      imageAlt: p.media?.alt,
      imageWidth: p.media?.cardWidth,
      imageHeight: p.media?.cardHeight,
      imageFit: p.media?.fit,
    };
  });

  const listItems = products.map((p) => ({
    name: p.name,
    url: readySlugs.has(p.slug) ? `/products/${p.slug}/` : `/catalog/${p.category}/`,
  }));

  return (
    <>
      <JsonLd data={graph(itemListSchema("Каталог ALYMP", listItems), faqSchema(catalogHub.faq))} />

      <Section className="border-b pb-12 pt-14">
        <Container>
          <Eyebrow>{catalogHub.eyebrow}</Eyebrow>
          <h1 className="mt-3 text-[clamp(40px,6vw,84px)] font-bold leading-[0.94] tracking-[-0.04em]">{catalogHub.h1}</h1>
          <p className="mt-6 max-w-4xl text-xl leading-relaxed text-foreground-2">{catalogHub.answer}</p>

          <div className="mt-10 grid gap-px bg-border sm:grid-cols-3">
            {Object.values(categories).map((c) => {
              const count = products.filter((p) => p.category === c.slug).length;
              return (
                <Link key={c.slug} href={`/catalog/${c.slug}/`} className="group flex flex-col justify-between bg-card p-6 transition-colors duration-200 hover:bg-muted">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">{count} устройств</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em]">{c.title}</h2>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                    <span>Открыть раздел</span>
                    <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <ProductGrid products={gridProducts} />
        </Container>
      </Section>

      <Section className="border-t bg-muted/40">
        <Container>
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold leading-none tracking-[-0.03em]">Как выбрать устройства</h2>
          <div className="mt-8 grid gap-px bg-border sm:grid-cols-3">
            {catalogHub.howToChoose.map((item, i) => (
              <div key={item.title} className="bg-background p-6 sm:p-7">
                <p className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-foreground-2">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/compatibility/" className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground">
              Матрица совместимости
            </Link>
            <Link href="/compare/" className="inline-flex min-h-11 items-center rounded-full border border-border-strong px-6 text-sm font-semibold hover:border-foreground">
              Сравнения моделей
            </Link>
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold leading-none tracking-[-0.03em]">Вопросы о каталоге</h2>
          <FaqList items={catalogHub.faq} />
        </Container>
      </Section>
    </>
  );
}
