"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { GlossaryCategory } from "@/lib/glossary";
import { cn } from "@/lib/utils";

export type GlossaryCard = {
  slug: string;
  category: GlossaryCategory;
  categoryLabel: string;
  name: string;
  englishName: string;
  definition: string;
  productCount: number;
};

const TABS: { id: "all" | GlossaryCategory; label: string }[] = [
  { id: "all", label: "Все термины" },
  { id: "protocols", label: "Протоколы и связь" },
  { id: "automation-locks", label: "Сценарии и замки" },
  { id: "sensors-navigation", label: "Датчики и навигация" },
  { id: "cleaning-robotics", label: "Уборка и роботы" },
];

export function GlossaryExplorer({ terms }: { terms: GlossaryCard[] }) {
  const [active, setActive] = useState<"all" | GlossaryCategory>("all");
  const filtered = active === "all" ? terms : terms.filter((t) => t.category === active);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Категории глоссария">
          {TABS.map((t) => {
            const count = t.id === "all" ? terms.length : terms.filter((x) => x.category === t.id).length;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active === t.id}
                onClick={() => setActive(t.id)}
                className={cn(
                  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-5 text-sm font-medium transition-colors duration-200",
                  active === t.id
                    ? "bg-primary text-primary-foreground"
                    : "border border-border-strong bg-background text-foreground-2 hover:border-foreground hover:text-foreground",
                )}
              >
                <span>{t.label}</span>
                <span className={cn("font-mono text-xs tabular", active === t.id ? "opacity-75" : "text-muted-foreground")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <p className="font-mono text-xs text-muted-foreground tabular">Показано: {filtered.length} из {terms.length}</p>
      </div>

      <div className="mt-8 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <Link
            key={t.slug}
            href={`/glossary/${t.slug}/`}
            className="group flex flex-col justify-between bg-card p-6 transition-colors duration-150 hover:bg-muted/60"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                  {t.categoryLabel}
                </span>
                {t.productCount > 0 && (
                  <span className="font-mono text-[11px] text-brand tabular">{t.productCount} мод.</span>
                )}
              </div>
              <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-foreground">{t.name}</h2>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{t.englishName}</p>
              <p className="mt-3 text-sm leading-relaxed text-foreground-2">{t.definition}</p>
            </div>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
              <span>Читать разбор</span>
              <ArrowRight className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
