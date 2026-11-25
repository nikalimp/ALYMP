import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, Eyebrow, Section } from "@/components/container";
import { FaqList } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { howToOrder } from "@/content/how-to-order";
import { faqSchema, graph, howToSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: howToOrder.metaTitle,
  description: howToOrder.metaDescription,
  alternates: { canonical: "/how-to-order/" },
};

export default function HowToOrderPage() {
  return (
    <>
      <JsonLd
        data={graph(
          howToSchema({
            name: howToOrder.h1,
            description: howToOrder.answer,
            steps: howToOrder.steps,
          }),
          faqSchema(howToOrder.faq),
        )}
      />

      <Section className="border-b pb-12 pt-14">
        <Container>
          <Eyebrow>{howToOrder.eyebrow}</Eyebrow>
          <h1 className="mt-3 text-[clamp(40px,6vw,84px)] font-bold leading-[0.94] tracking-[-0.04em]">
            {howToOrder.h1}
          </h1>
          <p className="mt-6 max-w-4xl text-xl leading-relaxed text-foreground-2">{howToOrder.answer}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalog/"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-85"
            >
              <span>Перейти в каталог</span>
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </Link>
            <Link
              href="/compatibility/"
              className="inline-flex min-h-11 items-center rounded-full border border-border-strong px-6 text-sm font-semibold transition-colors duration-200 hover:border-foreground"
            >
              Проверить совместимость
            </Link>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold leading-none tracking-[-0.03em]">
            Четыре шага от заявки до получения
          </h2>
          <ol className="mt-10 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {howToOrder.steps.map((s) => (
              <li key={s.num} className="flex flex-col justify-between bg-card p-6 sm:p-7">
                <div>
                  <span className="font-mono text-xs text-brand">{s.num}</span>
                  <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em]">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground-2">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section className="border-t bg-muted/40">
        <Container>
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold leading-none tracking-[-0.03em]">
            Условия цены, доставки и гарантии
          </h2>
          <div className="mt-10 grid gap-px bg-border sm:grid-cols-3">
            {howToOrder.details.map((d, i) => (
              <div key={d.title} className="bg-background p-6 sm:p-7">
                <p className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-lg font-semibold">{d.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground-2">{d.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contacts/"
              className="inline-flex min-h-11 items-center rounded-full border border-border-strong bg-background px-6 text-sm font-semibold transition-colors duration-200 hover:border-foreground"
            >
              Связаться с менеджером
            </Link>
            <Link
              href="/compare/"
              className="inline-flex min-h-11 items-center rounded-full border border-border-strong bg-background px-6 text-sm font-semibold transition-colors duration-200 hover:border-foreground"
            >
              Сравнить модели
            </Link>
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-[clamp(28px,4vw,48px)] font-bold leading-none tracking-[-0.03em]">
              Вопросы о заказе
            </h2>
            <p className="mt-4 text-sm text-foreground-2">
              Короткие ответы про оплату, подтверждение цены, доставку и официальную гарантию в России.
            </p>
          </div>
          <FaqList items={howToOrder.faq} />
        </Container>
      </Section>
    </>
  );
}
