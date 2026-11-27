import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Container, Eyebrow, Section } from "@/components/container";
import { Crumbs } from "@/components/crumbs";
import { FaqList } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { AddScenarioToCart } from "@/components/scenarios/add-scenario-to-cart";
import { getScenario, getScenarios } from "@/lib/scenarios";
import { getProduct } from "@/lib/products";
import { brandName } from "@/lib/brands";
import { linkTerms } from "@/lib/link-terms";
import { breadcrumbs, faqSchema, graph, howToSchema } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return getScenarios().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = getScenario((await params).slug);
  if (!s) return {};
  return {
    title: { absolute: `${s.metaTitle} — ALYMP` },
    description: s.metaDescription,
    alternates: { canonical: `/scenarios/${s.slug}/` },
  };
}

const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/\u00A0/g, " ");

export default async function ScenarioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const s = getScenario((await params).slug);
  if (!s) notFound();

  const products = s.productSlugs
    .map((slug) => getProduct(slug))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const bundleItems = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: brandName[p.brand] ?? p.brand,
    priceEstimate: p.priceEstimate,
    hasLanding: true,
  }));

  const totalEst = products.reduce((acc, p) => acc + (p.priceEstimate ?? 0), 0);
  const usedTerms = new Set<string>();
  const others = getScenarios().filter((x) => x.slug !== s.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={graph(
          howToSchema({
            name: s.title,
            description: s.summary,
            steps: s.steps.map((st) => ({ title: st.trigger, text: st.action })),
          }),
          faqSchema(s.faq),
          breadcrumbs([
            { name: "Главная", path: "/" },
            { name: "Сценарии", path: "/scenarios/" },
            { name: s.title, path: `/scenarios/${s.slug}/` },
          ]),
        )}
      />

      <Section className="border-b pb-12 pt-10">
        <Container>
          <Crumbs items={[{ name: "Главная", path: "/" }, { name: "Сценарии", path: "/scenarios/" }, { name: s.title }]} />
          <div className="mt-5">
            <Eyebrow>Сценарий умного дома · {products.length} устройства</Eyebrow>
            <h1 className="mt-3 text-[clamp(36px,5.5vw,76px)] font-bold leading-[0.94] tracking-[-0.04em]">
              {s.title}
            </h1>
            <p className="mt-6 max-w-4xl text-xl leading-relaxed text-foreground-2">
              {linkTerms(s.summary, { used: usedTerms, maxLinks: 4 })}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {s.protocols.map((proto) => (
                <span key={proto} className="border bg-muted/60 px-3 py-1 font-mono text-xs text-foreground-2">
                  {proto}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <AddScenarioToCart items={bundleItems} />
              {totalEst > 0 && (
                <span className="font-mono text-sm text-muted-foreground tabular">
                  Ориентир комплекта: от {fmt(totalEst)} ₽ (менеджер подтвердит цену до оплаты)
                </span>
              )}
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold leading-none tracking-[-0.03em]">
            Как работает цепочка: Триггер → Действие
          </h2>
          <ol className="mt-8 grid gap-px bg-border lg:grid-cols-3">
            {s.steps.map((st, i) => (
              <li key={st.trigger} className="flex flex-col justify-between bg-card p-6 sm:p-7">
                <div>
                  <span className="font-mono text-xs text-brand">Шаг {String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-3 text-sm font-semibold text-foreground">{st.trigger}</p>
                  <p className="mt-3 border-t pt-3 text-sm leading-relaxed text-foreground-2">{st.action}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section className="border-t bg-muted/40">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-[clamp(28px,4vw,48px)] font-bold leading-none tracking-[-0.03em]">
                Устройства в сценарии
              </h2>
              <p className="mt-3 text-sm text-foreground-2">
                Все модели проверены на взаимную совместимость по протоколам из матрицы ALYMP.
              </p>
            </div>
            <AddScenarioToCart items={bundleItems} label="Добавить весь сценарий в корзину" />
          </div>

          <div className="mt-8 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <Link
                key={p.slug}
                href={`/products/${p.slug}/`}
                className="group flex flex-col justify-between bg-surface p-6 transition-colors duration-150 hover:bg-muted/40"
              >
                <div>
                  {p.media?.card && (
                    <div className="mb-5 flex aspect-square items-center justify-center bg-surface p-4">
                      <img
                        src={p.media.card}
                        alt={p.media.alt}
                        width={p.media.cardWidth}
                        height={p.media.cardHeight}
                        loading="lazy"
                        className="size-full object-contain"
                      />
                    </div>
                  )}
                  <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                    {brandName[p.brand] ?? p.brand}
                  </p>
                  <h3 className="mt-1.5 text-lg font-semibold text-foreground group-hover:underline underline-offset-4">
                    {p.name}
                  </h3>
                </div>
                <div className="mt-4 flex items-center justify-between border-t pt-3">
                  <span className="font-mono text-sm font-semibold tabular">
                    {p.priceEstimate ? `от ${fmt(p.priceEstimate)} ₽` : "По запросу"}
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="max-w-3xl">
          <h2 className="text-[clamp(28px,4vw,44px)] font-bold leading-tight tracking-[-0.03em]">
            Подробный разбор сценария
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-foreground-2">
            {s.body.map((para, i) => (
              <p key={i}>{linkTerms(para, { used: usedTerms, maxLinks: 3 })}</p>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t bg-muted/40">
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-[clamp(28px,4vw,44px)] font-bold leading-none tracking-[-0.03em]">Частые вопросы</h2>
            <p className="mt-4 text-sm text-foreground-2">
              Ответы по настройке, питанию и совместимости устройств в сценарии «{s.title}».
            </p>
          </div>
          <FaqList items={s.faq} />
        </Container>
      </Section>

      {others.length > 0 && (
        <Section className="border-t">
          <Container>
            <h2 className="text-2xl font-bold tracking-[-0.025em]">Другие сценарии умного дома</h2>
            <div className="mt-6 grid gap-px bg-border sm:grid-cols-3">
              {others.map((o) => (
                <Link key={o.slug} href={`/scenarios/${o.slug}/`} className="bg-card p-6 transition-colors hover:bg-muted/60">
                  <h3 className="text-lg font-semibold text-foreground">{o.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-foreground-2">{o.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                    <span>Открыть</span>
                    <ArrowRight className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
