import { home } from "@/content/home";
import { site } from "@/content/site";
import { Container, Eyebrow, Section } from "@/components/container";
import { FaqList } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { faqSchema, graph } from "@/lib/schema";

// Главная — прототип «День» (specs/prototypes/home.html?__variant=day), spec §5.
// Первая версия: без фото пресс-китов — они придут вместе с лендингами (T15, T50).
export default function Home() {
  return (
    <>
      <JsonLd data={graph(faqSchema(home.faq))} />

      <section className="relative overflow-hidden border-b">
        <Container className="grid min-h-[min(70svh,680px)] content-end gap-10 pb-14 pt-24 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Eyebrow>{home.eyebrow}</Eyebrow>
            <h1 className="max-w-[14ch] text-[clamp(48px,8vw,120px)] font-bold leading-[0.9] tracking-[-0.04em] text-balance">{home.h1}</h1>
            <p className="mt-6 max-w-xl text-xl text-foreground-2">{home.lead}</p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <a href="#catalog" className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-85">Смотреть каталог</a>
              <a href="#order" className="inline-flex min-h-11 items-center rounded-full border border-border-strong px-6 font-semibold transition-colors duration-200 hover:border-foreground">Как заказать</a>
            </div>
          </div>
          <dl className="flex gap-10">
            <div className="flex flex-col"><dt className="text-sm text-muted-foreground">устройств в каталоге</dt><dd className="order-first text-5xl font-semibold tracking-tight tabular">15</dd></div>
            <div className="flex flex-col"><dt className="text-sm text-muted-foreground">брендов</dt><dd className="order-first text-5xl font-semibold tracking-tight tabular">5</dd></div>
          </dl>
        </Container>
      </section>

      <Section className="reveal">
        <Container>
          <p className="max-w-5xl text-[clamp(24px,3.2vw,40px)] font-medium leading-[1.22] tracking-[-0.02em] text-foreground-2">
            <span className="text-foreground">{home.answer.split(". ")[0]}.</span> {home.answer.split(". ").slice(1).join(". ")}
          </p>
        </Container>
      </Section>

      <Section id="catalog" className="pt-0">
        <Container>
          <h2 className="text-[clamp(40px,6vw,80px)] font-bold leading-[0.95] tracking-[-0.04em]">Каталог. <span className="text-muted-foreground">Три направления.</span></h2>
          <div className="mt-12 grid gap-3 lg:grid-cols-3">
            {home.categories.map((c) => (
              <article key={c.id} className="flex flex-col bg-muted p-7 sm:p-8">
                <p className="font-mono text-sm text-muted-foreground">{c.num} · {c.items.length} {c.items.length > 4 ? "моделей" : "модели"}</p>
                <h3 className="mt-3 text-3xl font-bold tracking-[-0.03em]">{c.title}</h3>
                <p className="mt-2 text-foreground-2">{c.text}</p>
                <ul className="mt-6 border-t">
                  {c.items.map((i) => <li key={i} className="border-b py-3 font-medium">{i}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <section className="is-dark py-20 sm:py-28">
        <Container>
          <h2 className="max-w-4xl text-[clamp(40px,6vw,80px)] font-bold leading-[0.95] tracking-[-0.04em]">Меньше моделей. <span className="text-muted-foreground">Больше фактов.</span></h2>
          <div className="mt-12 grid gap-0.5 sm:grid-cols-2 lg:grid-cols-4">
            {home.principles.map((p, i) => (
              <div key={p.title} className={i === 0 ? "bg-foreground p-7 text-background" : "bg-card p-7"}>
                <p className={i === 0 ? "font-mono text-sm opacity-60" : "font-mono text-sm text-muted-foreground"}>{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-10 text-xl font-semibold">{p.title}</h3>
                <p className={i === 0 ? "mt-2 text-sm opacity-75" : "mt-2 text-sm text-foreground-2"}>{p.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Section id="order" className="reveal">
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-[clamp(32px,4vw,52px)] font-bold leading-none tracking-[-0.03em]">Как заказать</h2>
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {home.steps.map((s, i) => (
              <li key={s.title} className="border-t-2 border-foreground pt-4">
                <p className="font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-[15px] text-foreground-2">{s.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-[clamp(32px,4vw,52px)] font-bold leading-none tracking-[-0.03em]">Вопросы</h2>
          <FaqList items={home.faq} />
        </Container>
      </Section>

      <Section className="border-t bg-muted/60">
        <Container className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <h2 className="max-w-2xl text-[clamp(28px,3.4vw,44px)] font-bold leading-tight tracking-[-0.03em]">Подберём модель под ваш дом и подтвердим цену до оплаты.</h2>
          <a href="/contacts/" className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-85">Связаться</a>
        </Container>
      </Section>
    </>
  );
}
