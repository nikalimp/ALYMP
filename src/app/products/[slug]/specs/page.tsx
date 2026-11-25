import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLanding, getLandings } from "@/lib/landings";
import { brandName } from "@/lib/brands";
import { graph, productSchema } from "@/lib/schema";
import { Container, Section } from "@/components/container";
import { JsonLd } from "@/components/json-ld";

// Полные характеристики (spec §4.2, §9): noindex, вне sitemap, canonical — на лендинг.
export const dynamicParams = false;
export function generateStaticParams() {
  return getLandings().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const l = getLanding((await params).slug);
  if (!l) return {};
  return {
    title: { absolute: `${l.product.name}: все характеристики — ALYMP` },
    description: `Полная таблица характеристик ${l.product.name} по официальным данным производителя: габариты, датчики, батарея, связь.`,
    alternates: { canonical: `/products/${l.slug}/` },
    robots: { index: false, follow: true },
  };
}

export default async function SpecsPage({ params }: { params: Promise<{ slug: string }> }) {
  const l = getLanding((await params).slug);
  if (!l) notFound();
  const p = l.product;
  const groups = [...new Set(p.specs.map((s) => s.group))];
  return (
    <>
      <JsonLd data={graph(productSchema({ slug: p.slug, name: p.name, brand: brandName[p.brand] ?? p.brand, description: l.answer, image: l.hero.image, price: p.price, specs: p.specs }))} />
      <Section className="pt-12">
        <Container className="max-w-4xl">
          <p className="text-sm text-muted-foreground"><a href={`/products/${p.slug}/`} className="underline underline-offset-4">← {p.name}</a></p>
          <h1 className="mt-4 text-[clamp(36px,5vw,64px)] font-bold leading-none tracking-[-0.035em]">{p.name}: характеристики</h1>
          {groups.map((g) => (
            <section key={g} className="mt-12">
              <h2 className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">{g}</h2>
              <dl className="mt-3 divide-y border-y">
                {p.specs.filter((s) => s.group === g).map((s) => (
                  <div key={s.label} className="grid grid-cols-[1fr_auto] gap-4 py-3.5">
                    <dt className="text-foreground-2">{s.label}</dt>
                    <dd className="text-right font-medium tabular">
                      {s.value}{s.unit ? `\u00A0${s.unit}` : ""}{" "}
                      <a href={p.sources[s.src]?.url} target="_blank" rel="noopener nofollow" className="font-mono text-xs text-muted-foreground" aria-label="Источник">[{s.src}]</a>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
          <p className="mt-10 text-sm text-muted-foreground">
            Источники: {Object.entries(p.sources).map(([k, s]) => <span key={k}>[{k}] <a href={s.url} target="_blank" rel="noopener nofollow" className="underline underline-offset-4">{s.title}</a>, проверено {s.checkedAt}. </span>)}
          </p>
        </Container>
      </Section>
    </>
  );
}
