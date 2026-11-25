import { home } from "@/content/home";
import { Container, Section } from "@/components/container";
import { FaqList } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { HeroSlider, type HeroSlide } from "@/components/home/hero-slider";
import { ProductGrid, type GridProduct } from "@/components/home/product-grid";
import { faqSchema, graph } from "@/lib/schema";
import { getProducts } from "@/lib/products";
import { categoryLabel, getLanding, getLandings } from "@/lib/landings";
import { brandName } from "@/lib/brands";

const HERO_ORDER = [
  "roborock-saros-z70",
  "dreame-x50-ultra-complete",
  "unitree-go2",
  "aqara-hub-m3",
  "aqara-smart-lock-u200",
];

export default function Home() {
  const allProducts = getProducts();
  const landings = getLandings();
  const readySlugs = new Set(landings.map((l) => l.slug));

  const slides: HeroSlide[] = HERO_ORDER.flatMap((slug) => {
    const l = getLanding(slug);
    if (!l) return [];
    const p = l.product;
    return [
      {
        slug: p.slug,
        name: p.name,
        brandLabel: brandName[p.brand] ?? p.brand,
        categoryLabel: categoryLabel[p.category],
        tagline: l.tagline,
        keyValue: l.keyNumbers[0]?.value ?? "—",
        keyLabel: l.keyNumbers[0]?.label ?? "",
        secondaryValue: l.keyNumbers[1]?.value ?? "—",
        secondaryLabel: l.keyNumbers[1]?.label ?? "",
        priceEstimate: p.priceEstimate,
        priceSource: p.priceSource,
        priceDate: p.priceDate,
        status: p.status,
        image: p.media?.hero ?? l.hero.image,
        imageWidth: p.media?.width ?? l.hero.width,
        imageHeight: p.media?.height ?? l.hero.height,
        imageFit: p.media?.fit ?? l.hero.fit,
        imageHasAlpha: p.media?.hasAlpha,
      },
    ];
  });

  // Сначала 5 готовых флагманов, затем остальные 12 моделей по категориям
  const orderedProducts = [
    ...HERO_ORDER.map((s) => allProducts.find((p) => p.slug === s)).filter((x): x is NonNullable<typeof x> => Boolean(x)),
    ...allProducts.filter((p) => !HERO_ORDER.includes(p.slug)),
  ];

  const gridProducts: GridProduct[] = orderedProducts.map((p) => {
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

  return (
    <>
      <JsonLd data={graph(faqSchema(home.faq))} />

      {/* 1. Hero-слайдер из 5 готовых флагманов (.is-dark — единственная тёмная сцена на главной) */}
      <HeroSlider slides={slides} />

      {/* 2. Витрина всех 17 товаров с фильтрами по категориям */}
      <Section id="catalog">
        <Container>
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="text-[clamp(36px,5.5vw,72px)] font-bold leading-[0.95] tracking-[-0.04em]">
              Каталог. <span className="text-muted-foreground">17 флагманов.</span>
            </h2>
            <p className="max-w-md text-sm text-foreground-2">
              У всех 17 моделей готовы подробные обзоры технологий и совместимости. Любое устройство можно добавить в корзину и оформить заявку.
            </p>
          </div>
          <ProductGrid products={gridProducts} />
        </Container>
      </Section>

      {/* 3. Компактный SEO/GEO-блок: прямой ответ и 4 факта */}
      <Section className="border-t bg-muted/40">
        <Container>
          <p className="max-w-5xl text-[clamp(22px,3vw,36px)] font-medium leading-[1.24] tracking-[-0.02em] text-foreground-2">
            <span className="text-foreground">{home.answer.split(". ")[0]}.</span> {home.answer.split(". ").slice(1).join(". ")}
          </p>

          <div className="mt-12 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {home.principles.map((p, i) => (
              <div key={p.title} className="bg-background p-6 sm:p-7">
                <p className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-6 text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-foreground-2">{p.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 4. FAQ с JSON-LD */}
      <Section id="faq">
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-[clamp(32px,4vw,52px)] font-bold leading-none tracking-[-0.03em]">Частые вопросы</h2>
            <p className="mt-4 text-sm text-foreground-2">
              Как устроена заявка, почему в каталоге 17 устройств и как подтверждается цена до оплаты.
            </p>
          </div>
          <FaqList items={home.faq} />
        </Container>
      </Section>
    </>
  );
}
