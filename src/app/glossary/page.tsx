import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow, Section } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { GlossaryExplorer, type GlossaryCard } from "@/components/glossary/glossary-explorer";
import { getGlossaryTerms, glossaryCategories } from "@/lib/glossary";
import { definedTermSetSchema, graph, itemListSchema } from "@/lib/schema";

const HUB_TITLE = "Глоссарий умного дома и робототехники — 50 терминов";
const HUB_DESC =
  "50 терминов умного дома и роботов простым языком: Matter, Thread, Zigbee, LiDAR, mmWave, SLAM, DoF, станции самоочистки. Примеры в каталоге ALYMP.";
const HUB_ANSWER =
  "Глоссарий ALYMP объясняет 50 ключевых терминов умного дома, автономной уборки и робототехники без маркетинговой воды. Каждая статья даёт короткое определение, принцип работы, проверенную историю стандарта, отличие от соседнего понятия и список устройств из каталога ALYMP с этой технологией.";

export const metadata: Metadata = {
  title: HUB_TITLE,
  description: HUB_DESC,
  alternates: { canonical: "/glossary/" },
};

export default function GlossaryHubPage() {
  const terms = getGlossaryTerms();

  const cards: GlossaryCard[] = terms.map((t) => ({
    slug: t.slug,
    category: t.category,
    categoryLabel: glossaryCategories[t.category].shortLabel,
    name: t.name,
    englishName: t.englishName,
    definition: t.definition,
    productCount: t.products.length,
  }));

  const listItems = terms.map((t) => ({ name: t.name, url: `/glossary/${t.slug}/` }));

  return (
    <>
      <JsonLd
        data={graph(
          definedTermSetSchema("Глоссарий ALYMP", HUB_DESC, terms),
          itemListSchema("Глоссарий терминов умного дома и робототехники", listItems),
        )}
      />

      <Section className="border-b pb-12 pt-14">
        <Container>
          <Eyebrow>Справочник · {terms.length} терминов</Eyebrow>
          <h1 className="mt-3 text-[clamp(40px,6vw,84px)] font-bold leading-[0.94] tracking-[-0.04em]">
            Глоссарий технологий
          </h1>
          <p className="mt-6 max-w-4xl text-xl leading-relaxed text-foreground-2">{HUB_ANSWER}</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <GlossaryExplorer terms={cards} />
        </Container>
      </Section>

      <Section className="border-t bg-muted/40">
        <Container>
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold leading-none tracking-[-0.03em]">
            Четыре раздела справочника
          </h2>
          <div className="mt-8 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {Object.values(glossaryCategories).map((c, i) => {
              const count = terms.filter((t) => t.category === c.id).length;
              return (
                <div key={c.id} className="bg-background p-6">
                  <p className="font-mono text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, "0")} · {count} терминов
                  </p>
                  <h3 className="mt-4 text-lg font-semibold">{c.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-2">{c.description}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/compatibility/"
              className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
            >
              Матрица совместимости
            </Link>
            <Link
              href="/catalog/"
              className="inline-flex min-h-11 items-center rounded-full border border-border-strong bg-background px-6 text-sm font-semibold hover:border-foreground"
            >
              Каталог 17 флагманов
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
