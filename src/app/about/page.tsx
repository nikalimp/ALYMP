import type { Metadata } from "next";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { about, home } from "@/content/home";
import { Container, Section } from "@/components/container";
import { Cta } from "@/components/cta";
import { FaqList } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { faqSchema, graph, orgId } from "@/lib/schema";

export const metadata: Metadata = {
  title: about.metaTitle,
  description: about.metaDescription,
  alternates: { canonical: "/about/" },
};

// «О магазине»: прямой ответ, 4 принципа и FAQ перенесены с главной (решение Ника 25.11.2026).
export default function About() {
  return (
    <>
      <JsonLd data={graph({ "@type": "AboutPage", mainEntity: { "@id": orgId } }, faqSchema(home.faq))} />
      <Section className="pt-12 sm:pt-16">
        <Container>
          <h1 className="text-[clamp(40px,6vw,80px)] font-bold leading-[0.95] tracking-[-0.04em]">{about.h1}</h1>
          <p className="mt-8 max-w-5xl text-[clamp(22px,3vw,36px)] font-medium leading-[1.24] tracking-[-0.02em] text-foreground-2">
            <span className="text-foreground">{home.answer.split(". ")[0]}.</span> {home.answer.split(". ").slice(1).join(". ")}
          </p>
          <div className="mt-12 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {home.principles.map((p, i) => (
              <div key={p.title} className="bg-background p-6 sm:p-7">
                <p className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="mt-6 text-lg font-semibold">{p.title}</h2>
                <p className="mt-2 text-sm text-foreground-2">{p.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
      <Section className="border-t">
        <Container className="max-w-3xl">
          <div className="prose-site">
            <Markdown remarkPlugins={[remarkGfm]}>{about.body.split("\n").slice(1).join("\n")}</Markdown>
          </div>
        </Container>
      </Section>
      <Section id="faq" className="border-t">
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-[clamp(32px,4vw,52px)] font-bold leading-none tracking-[-0.03em]">Частые вопросы</h2>
          <FaqList items={home.faq} />
        </Container>
      </Section>
      <Cta />
    </>
  );
}
