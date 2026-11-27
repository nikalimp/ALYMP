import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, Eyebrow, Section } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { getScenarios } from "@/lib/scenarios";
import { getProduct } from "@/lib/products";
import { site } from "@/content/site";
import { graph, itemListSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Сценарии умного дома ALYMP — 6 готовых связок",
  description:
    "6 проверенных жизненных сценариев умного дома и автономной уборки: Умный рассвет, уборка без людей, дом без ключей, свет по присутствию и контроль входа.",
  alternates: { canonical: "/scenarios/" },
};

const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/\u00A0/g, " ");

export default function ScenariosHubPage() {
  const scenarios = getScenarios();

  return (
    <>
      <JsonLd
        data={graph(
          {
            "@type": "CollectionPage",
            name: "Сценарии умного дома ALYMP",
            url: `${site.url}/scenarios/`,
            inLanguage: "ru-RU",
          },
          itemListSchema(
            "Сценарии умного дома ALYMP",
            scenarios.map((s) => ({ name: s.title, url: `/scenarios/${s.slug}/` })),
          ),
        )}
      />

      <Section className="border-b pb-12 pt-14">
        <Container>
          <Eyebrow>Готовые связки · {scenarios.length} сценариев</Eyebrow>
          <h1 className="mt-3 text-[clamp(40px,6vw,84px)] font-bold leading-[0.94] tracking-[-0.04em]">
            Сценарии умного дома
          </h1>
          <p className="mt-6 max-w-4xl text-xl leading-relaxed text-foreground-2">
            Шесть проверенных бытовых сценариев на базе открытых протоколов Matter, Thread и Zigbee 3.0. Каждая связка собрана только из официально совместимых устройств каталога ALYMP — с пошаговой схемой «Триггер → Действие», ориентиром бюджета и добавлением всего комплекта в корзину в один клик.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/selector/"
              className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-85"
            >
              Подобрать комплект под квартиру
            </Link>
            <Link
              href="/compatibility/"
              className="inline-flex min-h-11 items-center rounded-full border border-border-strong px-6 text-sm font-semibold transition-colors duration-200 hover:border-foreground"
            >
              Матрица совместимости
            </Link>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-px bg-border md:grid-cols-2">
            {scenarios.map((s) => {
              const prods = s.productSlugs
                .map((slug) => getProduct(slug))
                .filter((x): x is NonNullable<typeof x> => Boolean(x));
              const totalEst = prods.reduce((acc, p) => acc + (p.priceEstimate ?? 0), 0);

              return (
                <Link
                  key={s.slug}
                  href={`/scenarios/${s.slug}/`}
                  className="group flex flex-col justify-between bg-surface p-6 transition-colors duration-150 hover:bg-muted/40 sm:p-8"
                >
                  <div>
                    <div className="flex flex-wrap gap-1.5">
                      {s.protocols.slice(0, 4).map((proto) => (
                        <span
                          key={proto}
                          className="border bg-muted/60 px-2.5 py-0.5 font-mono text-[11px] text-foreground-2"
                        >
                          {proto}
                        </span>
                      ))}
                    </div>

                    <h2 className="mt-4 text-2xl font-bold tracking-[-0.025em] text-foreground sm:text-3xl">
                      {s.title}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-foreground-2">{s.summary}</p>

                    <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {prods.slice(0, 4).map((p) => (
                        <div key={p.slug} className="flex aspect-square items-center justify-center border bg-surface p-2">
                          {p.media?.card ? (
                            <img
                              src={p.media.card}
                              alt={p.name}
                              width={p.media.cardWidth}
                              height={p.media.cardHeight}
                              loading="lazy"
                              className="size-full object-contain"
                            />
                          ) : (
                            <span className="text-center font-mono text-[10px] text-muted-foreground">{p.name}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t pt-4 text-sm">
                    <span className="font-mono text-xs text-muted-foreground tabular">
                      {prods.length} устр.{totalEst > 0 ? ` · от ${fmt(totalEst)} ₽` : ""}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-brand">
                      <span>Открыть сценарий</span>
                      <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>
    </>
  );
}
