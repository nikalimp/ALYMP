import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, Eyebrow, Section } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { comparisons } from "@/content/comparisons";
import { graph, itemListSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Сравнения роботов и умного дома — ALYMP",
  description: "6 инженерных сравнений флагманов 2025⁠–⁠2026 по официальным данным: Roborock Saros Z70 vs Dreame X50 Ultra, L50 vs X50, Aqara U200 vs U300, FP400 vs FP2.",
  alternates: { canonical: "/compare/" },
};

export default function CompareHubPage() {
  const list = comparisons.map((c) => ({ name: c.h1, url: `/compare/${c.slug}/` }));

  return (
    <>
      <JsonLd data={graph(itemListSchema("Сравнения моделей ALYMP", list))} />

      <Section className="border-b pb-12 pt-14">
        <Container>
          <Eyebrow>Честные сравнения · 6 ключевых пар</Eyebrow>
          <h1 className="mt-3 text-[clamp(40px,6vw,84px)] font-bold leading-[0.94] tracking-[-0.04em]">
            Сравнения. <span className="text-muted-foreground">Без маркетинга.</span>
          </h1>
          <p className="mt-6 max-w-4xl text-xl leading-relaxed text-foreground-2">
            Мы сравниваем соседние флагманы каталога ALYMP по официальным спецификациям брендов: реальной проходимости порогов, высоте корпуса, протоколам умного дома и ориентиру цены в России. На каждой странице — прямой вердикт в первых строках и сводная таблица без выдуманных баллов.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-px bg-border sm:grid-cols-2">
            {comparisons.map((c, i) => (
              <article key={c.slug} className="flex flex-col justify-between bg-card p-7">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">ПАРА {String(i + 1).padStart(2, "0")}</p>
                  <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em]">
                    <Link href={`/compare/${c.slug}/`} className="hover:underline underline-offset-4">
                      {c.h1}
                    </Link>
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-foreground-2">{c.verdict}</p>
                </div>
                <div className="mt-6 border-t pt-4">
                  <Link href={`/compare/${c.slug}/`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                    <span>Открыть таблицу и разбор</span>
                    <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t bg-muted/40">
        <Container className="max-w-4xl">
          <h2 className="text-[clamp(26px,3.6vw,40px)] font-bold leading-tight tracking-[-0.03em]">Как мы строим сравнения</h2>
          <p className="mt-4 text-foreground-2">
            В таблицы попадают только характеристики с официальных сайтов Roborock, Dreame и Aqara и актуальные ориентиры цен в РФ. Если производитель указывает параметр со сноской — например, 60 мм для двух ступеней против 42 мм для одиночного порога у Dreame X50 Ultra — мы выносим эту оговорку прямо в строку таблицы.
          </p>
          <p className="mt-3 text-foreground-2">
            Отдельно можно сверить поддержку Яндекс Алисы, Matter, Thread, Apple Home и Home Assistant сразу по всем 17 устройствам на странице{" "}
            <Link href="/compatibility/" className="text-brand underline underline-offset-4">матрицы совместимости</Link>.
          </p>
        </Container>
      </Section>
    </>
  );
}
