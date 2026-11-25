"use client";
// Переключатель версий (segmented control). Таблица отличий остаётся в HTML целиком;
// выбор подсвечивает колонку, обновляет акценты и подставляет версию в форму заказа и корзину.
import { useId, useState } from "react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { cn } from "@/lib/utils";

type Versions = { title: string; lead: string; heads: string[]; rows: { label: string; values: string[] }[]; verdict: string[] };

export function VersionSwitch({ v, product, isVariants }: { v: Versions; product: { slug: string; name: string; brand: string; priceEstimate: number | null }; isVariants: boolean }) {
  const [sel, setSel] = useState(0);
  const id = useId();
  const pick = (i: number) => {
    setSel(i);
    if (isVariants) window.dispatchEvent(new CustomEvent("alymp:variant", { detail: i }));
  };
  const accent = v.rows.slice(0, 3);
  return (
    <div>
      <div role="radiogroup" aria-label={v.title} className="inline-flex max-w-full overflow-x-auto rounded-full bg-muted p-1">
        {v.heads.map((h, i) => (
          <button
            key={h}
            type="button"
            role="radio"
            aria-checked={sel === i}
            onClick={() => pick(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                const n = (sel + (e.key === "ArrowRight" ? 1 : v.heads.length - 1)) % v.heads.length;
                pick(n);
                (e.currentTarget.parentElement?.children[n] as HTMLElement | undefined)?.focus();
              }
            }}
            tabIndex={sel === i ? 0 : -1}
            className={cn(
              "min-h-10 cursor-pointer whitespace-nowrap rounded-full px-5 text-sm font-semibold transition-colors duration-200",
              sel === i ? "bg-background text-foreground ring-1 ring-border" : "text-foreground-2 hover:text-foreground",
            )}
          >
            {h}
          </button>
        ))}
      </div>

      <dl className="mt-8 grid gap-px bg-border sm:grid-cols-3" aria-live="polite">
        {accent.map((r) => (
          <div key={r.label} className="flex flex-col bg-background p-6">
            <dt className="order-last mt-2 text-sm text-muted-foreground">{r.label}</dt>
            <dd key={`${r.label}-${sel}`} className="animate-[fade-in_.3s_ease-out] font-mono text-[clamp(22px,2.6vw,34px)] font-medium leading-tight tracking-[-0.02em] tabular motion-reduce:animate-none">
              {r.values[sel]}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left" aria-describedby={`${id}-lead`}>
          <caption id={`${id}-lead`} className="sr-only">{v.lead}</caption>
          <thead>
            <tr className="border-b-2 border-foreground">
              <th scope="col" className="py-3 pr-4 font-mono text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Характеристика</th>
              {v.heads.map((h, i) => (
                <th key={h} scope="col" className={cn("py-3 pr-4 text-lg font-semibold transition-colors duration-200", sel === i ? "text-foreground" : "text-muted-foreground")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {v.rows.map((r) => (
              <tr key={r.label} className="border-b">
                <th scope="row" className="py-4 pr-4 font-normal text-foreground-2">{r.label}</th>
                {r.values.map((val, i) => (
                  <td key={i} className={cn("py-4 pr-4 tabular transition-colors duration-200", sel === i ? "font-semibold text-foreground" : "text-muted-foreground")}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <ul className="grid flex-1 gap-3 sm:grid-cols-2">
          {v.verdict.map((t, i) => (
            <li key={t} className={cn("p-6 transition-colors duration-200", sel === i ? "bg-foreground text-background" : "bg-muted")}>{t}</li>
          ))}
        </ul>
        {isVariants && (
          <div className="flex shrink-0 flex-wrap gap-2.5">
            <AddToCartButton variant="primary" item={{ slug: product.slug, name: `${product.name} · ${v.heads[sel]}`, brand: product.brand, priceEstimate: product.priceEstimate, hasLanding: true }} />
            <a href="#order" className="inline-flex min-h-11 items-center rounded-full border border-border-strong px-5 text-sm font-semibold hover:border-foreground">Заказать {v.heads[sel]}</a>
          </div>
        )}
      </div>
    </div>
  );
}
