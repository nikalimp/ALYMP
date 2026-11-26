import Link from "next/link";
import { site } from "@/content/site";
import { Container, Section } from "./container";

// Нативный коммерческий блок в конце статей и терминов: подбор комплекта и Telegram
export function SelectorCta() {
  return (
    <Section className="pt-0">
      <Container>
        <div className="flex flex-col gap-6 bg-muted p-7 sm:p-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">Подбор комплекта</p>
            <h2 className="mt-3 text-[clamp(26px,3vw,38px)] font-semibold leading-tight tracking-[-0.03em]">Нужна помощь с подбором совместимого комплекта?</h2>
            <p className="mt-3 text-foreground-2">Четыре вопроса — и мы соберём связку из робота-пылесоса, хаба, датчика и замка, которые работают вместе. Или напишите нам в Telegram.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2.5">
            <Link href="/selector/" className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-85">Подобрать комплект</Link>
            {site.contacts.telegram && (
              <a href={site.contacts.telegram} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center rounded-full border border-border-strong px-6 font-semibold transition-colors duration-200 hover:border-foreground">Написать в Telegram</a>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
