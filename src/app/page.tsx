import Link from "next/link";
import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { ShowcaseCard, toShowcaseItem } from "@/components/showcase";
import { getProducts } from "@/lib/products";
import { getLanding } from "@/lib/landings";
import { graph, itemListSchema } from "@/lib/schema";
import { getNews, formatNewsDate } from "@/lib/news";
import { getPosts, formatDate } from "@/lib/posts";
import { brandName } from "@/lib/brands";

// Главная — витрина в духе apple.com (решение Ника 25.11.2026): белый первый экран, плитки на всю ширину
// с зазором 12 px. Тексты «о магазине», 4 факта и FAQ живут на /about/.
const FLAGSHIPS = ["roborock-saros-z70", "unitree-go2"];
// KaringBee HCR011 — без фото на белом фоне: только в /catalog/ (решение Ника 26.11.2026)
const HIDDEN = ["karingbee-hcr011"];
const RUBRIC = { cleaning: "Уборка", "smart-home": "Умный дом", robots: "Роботы и ИИ", guides: "Гайд" } as const;
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
  const rest = products.filter((p) => ![...FLAGSHIPS, ...FEATURED, ...HIDDEN].includes(p.slug)).map((p) => toShowcaseItem(p, getLanding(p.slug)?.tagline));

  const news = getNews().slice(0, 3);
  const posts = getPosts().slice(0, 3);

  return (
    <div className="bg-surface text-foreground">
      <JsonLd data={graph(itemListSchema("Флагманы ALYMP", products.map((p) => ({ name: p.name, url: `/products/${p.slug}/` }))))} />

      <Container className="pb-8 pt-10 text-center sm:pt-14">
        <h1 className="mx-auto max-w-4xl text-[clamp(28px,3.4vw,44px)] font-semibold leading-tight tracking-[-0.03em] text-balance">
          Дом, который работает сам. <span className="text-muted-foreground">17 флагманских роботов и систем умного дома с гарантией в России.</span>
        </h1>
      </Container>

      <div className="grid gap-3 bg-muted p-3">
        {flagships.map((f, i) => <ShowcaseCard key={f.slug} item={f} size="lg" priority={i === 0} />)}
        <div className="grid gap-3 md:grid-cols-2">
          {featured.map((f) => <ShowcaseCard key={f.slug} item={f} size="md" />)}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
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

      {/* Журнал: 3 последние новости и 3 статьи — плашки на светло-сером, внутри контейнера (решение Ника 26.11.2026) */}
      {(news.length > 0 || posts.length > 0) && (
        <Container className="pb-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            {news.length > 0 && (
              <section aria-labelledby="home-news">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 id="home-news" className="text-[clamp(26px,3vw,36px)] font-semibold tracking-[-0.03em]">Новости</h2>
                  <Link href="/news/" className="text-sm text-foreground-2 underline underline-offset-4 hover:text-foreground">Все новости</Link>
                </div>
                <ul className="mt-6 grid gap-3">
                  {news.map((n) => (
                    <li key={n.slug}>
                      <Link href={`/news/${n.slug}/`} className="block bg-muted p-6 transition-colors duration-200 hover:bg-border">
                        <p className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">{brandName[n.brand] ?? n.brand} · {formatNewsDate(n.date)}</p>
                        <h3 className="mt-2 text-lg font-semibold leading-snug tracking-[-0.01em]">{n.title}</h3>
                        <p className="mt-1.5 line-clamp-2 text-[15px] text-foreground-2">{n.description}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {posts.length > 0 && (
              <section aria-labelledby="home-blog">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 id="home-blog" className="text-[clamp(26px,3vw,36px)] font-semibold tracking-[-0.03em]">Статьи</h2>
                  <Link href="/blog/" className="text-sm text-foreground-2 underline underline-offset-4 hover:text-foreground">Весь блог</Link>
                </div>
                <ul className="mt-6 grid gap-3">
                  {posts.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/blog/${p.slug}/`} className="block bg-muted p-6 transition-colors duration-200 hover:bg-border">
                        <p className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">{RUBRIC[p.rubric]} · {formatDate(p.date)}</p>
                        <h3 className="mt-2 text-lg font-semibold leading-snug tracking-[-0.01em]">{p.title}</h3>
                        <p className="mt-1.5 line-clamp-2 text-[15px] text-foreground-2">{p.description}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </Container>
      )}
    </div>
  );
}
