import Link from "next/link";
import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { ShowcaseCard, toShowcaseItem } from "@/components/showcase";
import { getProducts } from "@/lib/products";
import { getLanding } from "@/lib/landings";
import { graph, itemListSchema } from "@/lib/schema";

// Главная — витрина в духе apple.com (решение Ника 25.11.2026): белый первый экран, плитки на всю ширину
// с зазором 12 px. Тексты «о магазине», 4 факта и FAQ живут на /about/.
const FLAGSHIPS = ["roborock-saros-z70", "unitree-go2"];
const FEATURED = ["dreame-x50-ultra-complete", "aqara-hub-m3", "unitree-g1", "aqara-fp400"];

export default function Home() {
  const products = getProducts();
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const item = (slug: string, big = false) => {
    const p = bySlug.get(slug);
    return p ? toShowcaseItem(p, getLanding(slug)?.tagline, big) : null;
  };
  const flagships = FLAGSHIPS.map((s) => item(s, true)).filter((x) => x !== null);
  const featured = FEATURED.map((s) => item(s)).filter((x) => x !== null);
  const rest = products.filter((p) => ![...FLAGSHIPS, ...FEATURED].includes(p.slug)).map((p) => toShowcaseItem(p, getLanding(p.slug)?.tagline));

  return (
    <div className="bg-surface text-foreground">
      <JsonLd data={graph(itemListSchema("Флагманы ALYMP", products.map((p) => ({ name: p.name, url: `/products/${p.slug}/` }))))} />

      <Container className="pb-8 pt-10 text-center sm:pt-14">
        <h1 className="text-[clamp(28px,3.4vw,44px)] font-semibold leading-tight tracking-[-0.03em]">
          Роботы и умный дом. <span className="text-muted-foreground">17 флагманов с официальной гарантией в России.</span>
        </h1>
      </Container>

      <div className="grid gap-3 bg-muted p-3">
        {flagships.map((f, i) => <ShowcaseCard key={f.slug} item={f} size="lg" priority={i === 0} />)}
        <div className="grid gap-3 md:grid-cols-2">
          {featured.map((f) => <ShowcaseCard key={f.slug} item={f} size="md" />)}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((f) => <ShowcaseCard key={f.slug} item={f} size="sm" />)}
        </div>
      </div>

      <Container className="py-14 text-center">
        <Link href="/catalog/" className="inline-flex min-h-11 items-center rounded-full border border-border-strong px-6 font-semibold transition-colors duration-200 hover:border-foreground">
          Весь каталог
        </Link>
        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/about/" className="underline underline-offset-4">О магазине</Link> · <Link href="/compare/" className="underline underline-offset-4">Сравнения</Link> · <Link href="/compatibility/" className="underline underline-offset-4">Совместимость</Link>
        </p>
      </Container>
    </div>
  );
}
