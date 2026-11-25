"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogRubric } from "@/lib/posts";
import { cn } from "@/lib/utils";

export type BlogCard = {
  slug: string;
  title: string;
  description: string;
  date: string;
  dateFormatted: string;
  rubric: BlogRubric;
  rubricLabel: string;
  author: string;
};

const TABS: { id: "all" | BlogRubric; label: string }[] = [
  { id: "all", label: "Все статьи" },
  { id: "cleaning", label: "Уборка" },
  { id: "smart-home", label: "Умный дом" },
  { id: "robots", label: "Роботы и ИИ" },
  { id: "guides", label: "Гайды" },
];

export function BlogExplorer({ posts }: { posts: BlogCard[] }) {
  const [active, setActive] = useState<"all" | BlogRubric>("all");
  const filtered = active === "all" ? posts : posts.filter((p) => p.rubric === active);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Рубрики блога">
          {TABS.map((t) => {
            const count = t.id === "all" ? posts.length : posts.filter((p) => p.rubric === t.id).length;
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
        <p className="font-mono text-xs text-muted-foreground tabular">Статей: {filtered.length} из {posts.length}</p>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 border bg-card p-8 text-sm text-muted-foreground">
          В этой рубрике материалы готовятся к публикации. Посмотрите все статьи или свежие{" "}
          <Link href="/news/" className="text-foreground underline underline-offset-4">новости робототехники</Link>.
        </p>
      ) : (
        <div className="mt-8 grid gap-px bg-border md:grid-cols-2">
          {filtered.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}/`}
              className="group flex flex-col justify-between bg-card p-6 transition-colors duration-150 hover:bg-muted/60 sm:p-8"
            >
              <div>
                <div className="flex items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
                  <span className="uppercase tracking-[0.06em] text-brand">{p.rubricLabel}</span>
                  <time dateTime={p.date}>{p.dateFormatted}</time>
                </div>
                <h2 className="mt-4 text-2xl font-semibold leading-snug tracking-[-0.02em] text-foreground">
                  {p.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground-2">{p.description}</p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t pt-4 text-sm">
                <span className="text-xs text-muted-foreground">{p.author}</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-brand">
                  <span>Читать гайд</span>
                  <ArrowRight className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
