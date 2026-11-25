import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { preload } from "react-dom";
import { getLanding, getLandings, categoryLabel } from "@/lib/landings";
import { getProduct } from "@/lib/products";
import { brandName } from "@/lib/brands";
import { breadcrumbs, faqSchema, graph, productSchema } from "@/lib/schema";
import { Container, Eyebrow, Section } from "@/components/container";
import { FaqList } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { StickyTech } from "@/components/product/sticky-tech";
import { OrderForm } from "@/components/product/order-form";
import { cn } from "@/lib/utils";

export const dynamicParams = false;
export function generateStaticParams() {
  return getLandings().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const l = getLanding((await params).slug);
  if (!l) return {};
  return {
    title: { absolute: `${l.title} — ALYMP` },
    description: l.description,
    alternates: { canonical: `/products/${l.slug}/` },
    openGraph: { title: l.title, description: l.description, images: [{ url: l.hero.image, width: l.hero.width, height: l.hero.height }] },
  };
}

const statusLabel = { in_stock: "в продаже", preorder: "под заказ", unknown: "под заказ" } as const;
const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/\u00A0/g, " ");

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const l = getLanding((await params).slug);
  if (!l) notFound();
  preload(l.hero.image, { as: "image", fetchPriority: "high" }); // LCP первого экрана
  const p = l.product;
  const brand = brandName[p.brand] ?? p.brand;
  const crumbs = [
    { name: "Каталог", path: "/catalog/" },
    { name: categoryLabel[p.category], path: `/catalog/${p.category}/` },
    { name: p.name, path: `/products/${p.slug}/` },
  ];
  const b2b = p.brand === "unitree";
  const usedSources = Object.entries(p.sources);

  return (
    <>
      <JsonLd data={graph(productSchema({ slug: p.slug, name: p.name, brand, description: l.answer, image: l.hero.image, price: p.price }), faqSchema(l.faq), breadcrumbs(crumbs))} />

      {/* 1. Первый экран — сцена товара */}
      <section className={cn("relative isolate flex min-h-[min(100svh,940px)] flex-col justify-end overflow-hidden", l.hero.dark && "is-dark")}>
        <img src={l.hero.image} alt={l.hero.alt} width={l.hero.width} height={l.hero.height} fetchPriority="high" className="absolute inset-0 -z-10 size-full object-cover object-[60%_40%]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,var(--background)_4%,color-mix(in_oklch,var(--background)_35%,transparent)_45%,color-mix(in_oklch,var(--background)_55%,transparent)_100%)]" />
        <Container className="absolute inset-x-0 top-5">
          <nav aria-label="Хлебные крошки" className="text-sm text-foreground-2">
            {crumbs.slice(0, 2).map((c) => <span key={c.path}><a href={c.path} className="hover:text-foreground">{c.name}</a> / </span>)}
            <span>{p.name}</span>
          </nav>
        </Container>
        <Container className="grid gap-8 pb-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-foreground-2"><i aria-hidden="true" className="size-1.5 rounded-full bg-warn" />{statusLabel[p.status]} · {brand}</p>
            <h1 className="mt-3 text-[clamp(56px,10vw,144px)] font-bold leading-[0.88] tracking-[-0.045em]">{l.h1}</h1>
            <p className="mt-5 max-w-xl text-[clamp(18px,2vw,22px)] text-foreground-2">{l.tagline}</p>
            <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {p.priceEstimate ? (
                <>
                  <b className="text-2xl font-semibold tracking-tight">от {fmt(p.priceEstimate)} ₽</b>
                  <small className="text-sm text-muted-foreground">Ориентир по данным {p.priceSource} на {p.priceDate} · точную цену подтвердит менеджер</small>
                </>
              ) : (
                <b className="text-2xl font-semibold tracking-tight">Цена по запросу</b>
              )}
            </div>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <a href="#order" className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-85">Заказать</a>
              {l.versions && <a href="#versions" className="inline-flex min-h-11 items-center rounded-full border border-border-strong px-6 font-semibold transition-colors duration-200 hover:border-foreground">{l.versions.title}</a>}
            </div>
          </div>
          <dl className="hidden gap-8 sm:flex">
            {l.keyNumbers.slice(0, 2).map((k) => (
              <div key={k.label} className="flex flex-col"><dt className="order-last mt-2 max-w-36 text-sm text-muted-foreground">{k.label}</dt><dd className="font-mono text-4xl font-medium tracking-tight">{k.value}</dd></div>
            ))}
          </dl>
        </Container>
      </section>

      {/* 2. Прямой ответ */}
      <Section>
        <Container>
          <p className="max-w-5xl text-[clamp(22px,3vw,38px)] font-medium leading-[1.25] tracking-[-0.02em] text-foreground-2">
            <span className="text-foreground">{l.answer.split(". ")[0]}.</span> {l.answer.split(". ").slice(1).join(". ")}
          </p>
        </Container>
      </Section>

      {/* 4. Ключевые цифры */}
      <Section className="pt-0">
        <Container>
          <dl className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
            {l.keyNumbers.map((k) => (
              <div key={k.label} className="flex flex-col bg-background p-6 sm:p-8">
                <dt className="order-last mt-3 text-sm text-muted-foreground">{k.label}</dt>
                <dd className="text-[clamp(32px,4vw,52px)] font-semibold leading-none tracking-[-0.03em] tabular">{k.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      {/* 3 и 5. Технологии — закреплённая сцена */}
      <section aria-label="Технологии" className={cn("py-8 lg:py-0", l.hero.dark && "is-dark")}>
        <Container>
          <StickyTech steps={l.tech} image={l.hero.image} alt="" credit={l.hero.credit} />
        </Container>
      </section>

      {/* 8. Версии */}
      {l.versions && (
        <Section id="versions">
          <Container>
            <h2 className="text-[clamp(36px,5vw,64px)] font-bold leading-[0.98] tracking-[-0.035em]">{l.versions.title}</h2>
            <p className="mt-4 max-w-2xl text-lg text-foreground-2">{l.versions.lead}</p>
            <div className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="border-b-2 border-foreground">
                    <th scope="col" className="py-3 pr-4 font-mono text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Характеристика</th>
                    {l.versions.heads.map((h) => <th key={h} scope="col" className="py-3 pr-4 text-lg font-semibold">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {l.versions.rows.map((r) => (
                    <tr key={r.label} className="border-b">
                      <th scope="row" className="py-4 pr-4 font-normal text-foreground-2">{r.label}</th>
                      {r.values.map((v, i) => <td key={i} className="py-4 pr-4 font-medium tabular">{v}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {l.versions.verdict.map((v) => <li key={v} className="bg-muted p-6">{v}</li>)}
            </ul>
          </Container>
        </Section>
      )}

      {/* 6. Как работает в паре */}
      {l.pairs.length > 0 && (
        <Section className="pt-0">
          <Container>
            <h2 className="text-[clamp(32px,4vw,52px)] font-bold leading-none tracking-[-0.03em]">Как работает в паре</h2>
            <div className="mt-10 grid gap-3 lg:grid-cols-3">
              {l.pairs.map((pair) => (
                <article key={pair.title} className="bg-muted p-7">
                  <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
                    {[p.name, ...pair.with.map((w) => getProduct(w)?.name ?? w)].join(" + ")}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold">{pair.title}</h3>
                  <p className="mt-2 text-foreground-2">{pair.text}</p>
                  <p className="mt-4 flex flex-wrap gap-3 text-sm">
                    {pair.with.map((w) => <a key={w} href={`/products/${w}/`} className="underline underline-offset-4">{getProduct(w)?.name ?? w}</a>)}
                  </p>
                </article>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* 10. Характеристики — коротко */}
      <Section className="border-t">
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-[clamp(32px,4vw,52px)] font-bold leading-none tracking-[-0.03em]">Характеристики</h2>
            <a href={`/products/${p.slug}/specs/`} className="mt-6 inline-flex min-h-11 items-center rounded-full border border-border-strong px-6 font-semibold hover:border-foreground">Все характеристики</a>
          </div>
          <dl className="divide-y border-y">
            {p.specs.slice(0, 10).map((s) => (
              <div key={s.label} className="grid grid-cols-[1fr_auto] gap-4 py-3.5">
                <dt className="text-foreground-2">{s.label}</dt>
                <dd className="text-right font-medium tabular">{s.value}{s.unit ? `\u00A0${s.unit}` : ""}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      {/* 11. FAQ */}
      <Section className="pt-0">
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-[clamp(32px,4vw,52px)] font-bold leading-none tracking-[-0.03em]">Вопросы о {p.name}</h2>
          <FaqList items={l.faq} />
        </Container>
      </Section>

      {/* 12. Заказ */}
      <Section id="order" className="border-t bg-muted/60">
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <Eyebrow>Заказ</Eyebrow>
            <h2 className="text-[clamp(32px,4vw,52px)] font-bold leading-none tracking-[-0.03em]">Заказать {p.name}</h2>
            <p className="mt-4 text-foreground-2">Оставьте заявку. Менеджер подтвердит цену, наличие и срок поставки. Оплата — только после подтверждения. Официальная гарантия в России.</p>
          </div>
          <OrderForm product={p.name} variants={p.variants} b2b={b2b} />
        </Container>
      </Section>

      {/* Источники фактов */}
      <Section className="py-10">
        <Container>
          <p className="text-sm text-muted-foreground">
            Характеристики — по официальным данным {brand}:{" "}
            {usedSources.map(([k, s], i) => <span key={k}><a href={s.url} target="_blank" rel="noopener nofollow" className="underline underline-offset-4">{s.title}</a>{i < usedSources.length - 1 ? ", " : ""}</span>)}
            . Проверено {usedSources[0]?.[1].checkedAt.split("-").reverse().join(".")}.
          </p>
        </Container>
      </Section>
    </>
  );
}
