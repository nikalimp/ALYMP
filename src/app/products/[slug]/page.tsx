import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { preload } from "react-dom";
import { getLanding, getLandings, categoryLabel } from "@/lib/landings";
import { getProduct } from "@/lib/products";
import { brandName } from "@/lib/brands";
import { linkTerms } from "@/lib/link-terms";
import { breadcrumbs, faqSchema, graph, productSchema } from "@/lib/schema";
import { Container, Eyebrow, Section } from "@/components/container";
import { FaqList } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { StickyTech } from "@/components/product/sticky-tech";
import { ProductSubNav } from "@/components/product/sub-nav";
import { KeyBento } from "@/components/product/key-bento";
import { VersionSwitch } from "@/components/product/version-switch";
import { Scenarios } from "@/components/product/scenarios";
import { CompatBadges } from "@/components/product/compat-badges";
import { TrustLine } from "@/components/product/trust-line";
import { ClearanceWidget } from "@/components/product/clearance-widget";
import { InTheBox } from "@/components/product/in-the-box";
import { AppInfoCard } from "@/components/product/app-info";
import { VideoFacade } from "@/components/product/video-facade";
import { getClearance } from "@/lib/clearance";
import { Clock, Wallet } from "lucide-react";
import { OrderForm } from "@/components/product/order-form";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { cn } from "@/lib/utils";

export const dynamicParams = false;
export function generateStaticParams() {
  return getLandings().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const l = getLanding((await params).slug);
  if (!l) return {};
  const ogImg = l.hero.image
    ? { url: l.hero.image, width: l.hero.width ?? 1200, height: l.hero.height ?? 630 }
    : { url: "/og.png", width: 1200, height: 630 };
  return {
    title: { absolute: `${l.title} — ALYMP` },
    description: l.description,
    alternates: { canonical: `/products/${l.slug}/` },
    openGraph: { title: l.title, description: l.description, images: [ogImg] },
  };
}

const statusLabel = { in_stock: "в продаже", preorder: "под заказ", unknown: "под заказ" } as const;
const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/\u00A0/g, " ");

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const l = getLanding((await params).slug);
  if (!l) notFound();
  if (l.hero.image) preload(l.hero.image, { as: "image", fetchPriority: "high" });
  const p = l.product;
  const brand = brandName[p.brand] ?? p.brand;
  const crumbs = [
    { name: "Каталог", path: "/catalog/" },
    { name: categoryLabel[p.category], path: `/catalog/${p.category}/` },
    { name: p.name, path: `/products/${p.slug}/` },
  ];
  const b2b = p.brand === "unitree";
  const usedSources = Object.entries(p.sources);
  const readySlugs = new Set(getLandings().map((x) => x.slug));
  const usedTerms = new Set<string>();
  const clearance = getClearance(p);
  const box = p.inTheBox ?? p.inBox;
  // Переключатель версий подставляет выбор в форму и корзину, когда колонки таблицы — это версии товара
  const isVariants = !!l.versions && p.variants.length === l.versions.heads.length && p.variants.length > 1;
  const subLinks = [
    { id: "overview", label: "Обзор" },
    ...(l.tech.length ? [{ id: "tech", label: "Технологии" }] : []),
    ...(l.versions ? [{ id: "versions", label: isVariants ? "Версии" : "Сравнение" }] : []),
    ...(l.pairs.length ? [{ id: "pairs", label: "Связки" }] : []),
    { id: "specs", label: "Характеристики" },
  ];

  const priceHost = (src: string | null) => {
    if (!src) return null;
    if (/^https?:\/\//.test(src)) {
      const host = new URL(src).hostname.replace(/^www\./, "");
      return <a href={src} target="_blank" rel="noopener nofollow" className="underline underline-offset-4">{host}</a>;
    }
    return src;
  };
  const ruDate = (d: string | null) => (d ? new Date(`${d}T12:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }).replace(" г.", "") : "");

  const heroText = (
    <>
      <nav aria-label="Хлебные крошки" className="text-sm text-foreground-2">
        {crumbs.slice(0, 2).map((c) => (
          <span key={c.path}>
            <a href={c.path} className="hover:text-foreground">{c.name}</a> /{" "}
          </span>
        ))}
        <span>{p.name}</span>
      </nav>
      <p className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-foreground-2">
        <i aria-hidden="true" className={cn("size-1.5 rounded-full", p.status === "in_stock" ? "bg-ok" : "bg-warn")} />
        {statusLabel[p.status]} · {brand}
      </p>
      <h1 className="mt-3 text-[clamp(44px,6.4vw,96px)] font-bold leading-[0.92] tracking-[-0.045em]">{l.h1}</h1>
      <p className="mt-5 max-w-xl text-[clamp(18px,2vw,22px)] text-foreground-2">{l.tagline}</p>
      <div className="mt-6">
        {p.priceEstimate ? (
          <>
            <b className="font-mono text-2xl font-semibold tracking-tight tabular">от {fmt(p.priceEstimate)} ₽</b>
            <small className="mt-1 block text-sm text-muted-foreground">
              Ориентир по данным {priceHost(p.priceSource)} на {ruDate(p.priceDate)}. Точную цену подтвердит менеджер.
            </small>
          </>
        ) : (
          <b className="text-2xl font-semibold tracking-tight">Цена по запросу</b>
        )}
      </div>
      <div className="mt-7 flex flex-wrap gap-2.5">
        <a href="#order" className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-85">Заказать</a>
        <AddToCartButton item={{ slug: p.slug, name: p.name, brand, priceEstimate: p.priceEstimate, hasLanding: true }} />
      </div>
      <TrustLine status={p.status} className="mt-4" />
      {l.keyNumbers.length > 0 && (
        <dl className="mt-10 flex gap-10 border-t pt-6">
          {l.keyNumbers.slice(0, 2).map((k) => (
            <div key={k.label} className="flex flex-col">
              <dt className="order-last mt-2 max-w-40 text-sm text-muted-foreground">{k.label}</dt>
              <dd className="font-mono text-3xl font-medium tracking-tight tabular sm:text-4xl">{k.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </>
  );

  return (
    <>
      <JsonLd
        data={graph(
          productSchema({
            slug: p.slug,
            name: p.name,
            brand,
            description: l.answer,
            image: l.hero.image ?? "/og.png",
            price: p.price,
          }),
          faqSchema(l.faq),
          breadcrumbs(crumbs),
        )}
      />

      {/* 1. Первый экран. Светлое студийное фото — чистые 2 колонки без пелены; тёмное — полноэкранная сцена */}
      {l.hero.dark ? (
        <section id="product-hero" className="is-dark relative isolate flex min-h-[min(85svh,820px)] flex-col justify-end overflow-hidden border-b">
          {l.hero.image && (
            <>
              <img src={l.hero.image} alt={l.hero.alt} width={l.hero.width ?? 780} height={l.hero.height ?? 439} fetchPriority="high" className="absolute inset-0 -z-10 size-full object-cover object-[60%_40%]" />
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,var(--background)_4%,color-mix(in_oklch,var(--background)_35%,transparent)_45%,color-mix(in_oklch,var(--background)_55%,transparent)_100%)]" />
            </>
          )}
          <Container className="pb-12 pt-24">{heroText}</Container>
        </section>
      ) : (
        <section id="product-hero" className="border-b bg-surface">
          <Container className="grid items-center gap-8 py-10 lg:min-h-[min(80svh,760px)] lg:grid-cols-2 lg:gap-12 lg:py-14">
            <div className="order-2 lg:order-1">{heroText}</div>
            <div className="order-1 flex aspect-[4/3] items-center justify-center lg:order-2 lg:aspect-square">
              {l.hero.image && (
                <img src={l.hero.image} alt={l.hero.alt} width={l.hero.width ?? 780} height={l.hero.height ?? 439} fetchPriority="high" className="size-full max-h-[640px] object-contain" />
              )}
            </div>
          </Container>
        </section>
      )}

      <ProductSubNav name={p.name} links={subLinks} />

      {/* 2. Обзор: прямой ответ, совместимость, bento ключевых цифр */}
      <Section id="overview" className="scroll-mt-28">
        <Container>
          <p className="max-w-5xl text-[clamp(22px,3vw,38px)] font-medium leading-[1.25] tracking-[-0.02em] text-foreground-2">
            <span className="text-foreground">{linkTerms(`${l.answer.split(". ")[0]}.`, { used: usedTerms, maxLinks: 3 })}</span>{" "}
            {linkTerms(l.answer.split(". ").slice(1).join(". "), { used: usedTerms, maxLinks: 5 })}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CompatBadges c={p.compatibility} />
            <a href="/compatibility/" className="shrink-0 text-sm text-foreground-2 underline underline-offset-4 hover:text-foreground">Таблица совместимости</a>
          </div>
          {l.keyNumbers.length > 0 && (
            <div className="mt-12">
              <KeyBento items={l.keyNumbers} />
            </div>
          )}
        </Container>
      </Section>

      {/* 3 и 5. Технологии — закреплённая сцена */}
      {l.tech.length > 0 && (
        <section id="tech" aria-label="Технологии" className={cn("scroll-mt-28 py-12 lg:py-0", l.hero.dark && "is-dark")}>
          <Container>
            <StickyTech
              steps={l.tech}
              image={l.hero.image}
              alt={l.hero.alt ?? p.name}
              credit={l.hero.credit}
              width={l.hero.width}
              height={l.hero.height}
              fit={l.hero.fit}
            />
          </Container>
        </section>
      )}

      {/* 8. Версии — переключатель */}
      {l.versions && (
        <Section id="versions" className="scroll-mt-28">
          <Container>
            <h2 className="text-[clamp(36px,5vw,64px)] font-bold leading-[0.98] tracking-[-0.035em]">{l.versions.title}</h2>
            <p className="mt-4 max-w-2xl text-lg text-foreground-2">{l.versions.lead}</p>
            <div className="mt-10">
              <VersionSwitch v={l.versions} isVariants={isVariants} product={{ slug: p.slug, name: p.name, brand, priceEstimate: p.priceEstimate }} />
            </div>
          </Container>
        </Section>
      )}

      {/* Пороги и зазор под мебелью — для роботов-пылесосов с официальными цифрами */}
      {clearance.length > 0 && (
        <Section id="clearance" className="scroll-mt-28 border-t">
          <Container>
            <h2 className="text-[clamp(32px,4vw,52px)] font-bold leading-none tracking-[-0.03em]">Пройдёт ли {p.name} у вас дома</h2>
            <p className="mt-4 max-w-2xl text-lg text-foreground-2">Задайте высоту порога и зазор под диваном — сравним с паспортными цифрами модели.</p>
            <div className="mt-10"><ClearanceWidget name={p.name} configs={clearance} /></div>
          </Container>
        </Section>
      )}

      {/* Что в коробке */}
      {box.length > 0 && (
        <Section id="in-the-box" className="scroll-mt-28 pt-0">
          <Container>
            <h2 className="text-[clamp(32px,4vw,52px)] font-bold leading-none tracking-[-0.03em]">Что в коробке</h2>
            <div className="mt-10"><InTheBox items={box} /></div>
          </Container>
        </Section>
      )}

      {/* Видео производителя и приложение — когда данные есть в карточке товара */}
      {(p.officialVideo || p.appInfo) && (
        <Section className="pt-0">
          <Container className="grid gap-6">
            {p.officialVideo && <VideoFacade id={p.officialVideo.youtubeId} title={p.officialVideo.title} poster={p.officialVideo.poster} />}
            {p.appInfo && <AppInfoCard app={p.appInfo} />}
          </Container>
        </Section>
      )}

      {/* 6. Как работает в паре — сценарии «событие → реакция» */}
      {l.pairs.length > 0 && (
        <Section id="pairs" className="scroll-mt-28 pt-0">
          <Container>
            <h2 className="text-[clamp(32px,4vw,52px)] font-bold leading-none tracking-[-0.03em]">Как работает в паре</h2>
            <p className="mt-4 max-w-2xl text-lg text-foreground-2">Сценарии с другими устройствами каталога: что происходит в доме и кто на это отвечает.</p>
            <div className="mt-10">
              <Scenarios product={p} pairs={l.pairs} ready={readySlugs} used={usedTerms} />
            </div>
          </Container>
        </Section>
      )}

      {/* 10. Характеристики — коротко */}
      <Section id="specs" className="scroll-mt-28 border-t">
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-[clamp(32px,4vw,52px)] font-bold leading-none tracking-[-0.03em]">Характеристики</h2>
            <a
              href={`/products/${p.slug}/specs/`}
              className="mt-6 inline-flex min-h-11 items-center rounded-full border border-border-strong px-6 font-semibold hover:border-foreground"
            >
              Все характеристики
            </a>
          </div>
          <dl className="divide-y border-y">
            {p.specs.slice(0, 10).map((s) => (
              <div key={s.label} className="grid grid-cols-[1fr_auto] gap-4 py-3.5">
                <dt className="text-foreground-2">{s.label}</dt>
                <dd className="text-right font-medium tabular">
                  {s.value}
                  {s.unit ? `\u00A0${s.unit}` : ""}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      {/* 11. FAQ */}
      <Section className="pt-0">
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-[clamp(32px,4vw,52px)] font-bold leading-none tracking-[-0.03em]">Вопросы о {p.name}</h2>
          <FaqList items={l.faq} size="lg" />
        </Container>
      </Section>

      {/* 12. Заказ — бутиковая подача */}
      <Section id="order" className="scroll-mt-28 border-t bg-muted/60">
        <Container className="grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow>Заказ</Eyebrow>
            <h2 className="text-[clamp(32px,4vw,52px)] font-bold leading-none tracking-[-0.03em]">{p.name}</h2>
            {p.media?.card && (
              <div className="mt-8 flex aspect-[4/3] items-center justify-center bg-surface p-8">
                <img src={p.media.card} alt={p.media.alt ?? p.name} width={p.media.cardWidth} height={p.media.cardHeight} loading="lazy" className="size-full object-contain" />
              </div>
            )}
            <p className="mt-6 font-mono text-xl font-medium tabular">
              {p.priceEstimate ? `от ${fmt(p.priceEstimate)} ₽` : "Цена по запросу"}
            </p>
            <TrustLine status={p.status} className="mt-4 flex-col" />
            <ul className="mt-6 space-y-3 text-[15px] text-foreground-2">
              <li className="flex gap-3"><Clock className="mt-0.5 size-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />Менеджер подтвердит цену, наличие и срок поставки</li>
              <li className="flex gap-3"><Wallet className="mt-0.5 size-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />Оплата — только после подтверждения заказа</li>
            </ul>
          </aside>
          <div className="bg-background p-6 sm:p-10">
            <OrderForm product={p.name} variants={p.variants} b2b={b2b} />
          </div>
        </Container>
      </Section>

      {/* Источники фактов */}
      {usedSources.length > 0 && (
        <Section className="py-10">
          <Container>
            <p className="text-sm text-muted-foreground">
              Характеристики — по официальным данным {brand}:{" "}
              {usedSources.map(([k, s], i) => (
                <span key={k}>
                  <a href={s.url} target="_blank" rel="noopener nofollow" className="underline underline-offset-4">
                    {s.title}
                  </a>
                  {i < usedSources.length - 1 ? ", " : ""}
                </span>
              ))}
              . Проверено {usedSources[0]?.[1].checkedAt.split("-").reverse().join(".")}.
            </p>
          </Container>
        </Section>
      )}
    </>
  );
}
