"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import { AddToCartButton } from "./cart/add-to-cart-button";

export type CatalogItemSummary = {
  slug: string;
  name: string;
  brand: string;
  brandLabel: string;
  category: "cleaning-robots" | "smart-home" | "robots";
  categoryLabel: string;
  priceEstimate: number | null;
  status: "in_stock" | "preorder" | "unknown";
  hasLanding: boolean;
  summary: string;
};

const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/\u00A0/g, " ");

export function SearchModal({ open, onClose, products }: { open: boolean; onClose: () => void; products: CatalogItemSummary[] }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 8);
    return products.filter((p) =>
      [p.name, p.brandLabel, p.categoryLabel, p.summary].join(" ").toLowerCase().includes(q),
    );
  }, [query, products]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16 sm:pt-24" role="dialog" aria-modal="true" aria-label="Поиск по каталогу">
      <div className="fixed inset-0 bg-foreground/40" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 flex max-h-[75dvh] w-full max-w-2xl flex-col border bg-background text-foreground overscroll-contain">
        <div className="flex items-center gap-3 border-b px-4">
          <Search className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти модель, бренд или технологию (Roborock, Matter, Unitree…)"
            className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть поиск"
            className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-accent"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y overscroll-contain">
          {results.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">По запросу «{query}» ничего не найдено.</p>
          ) : (
            results.map((p) => (
              <div key={p.slug} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 hover:bg-muted/60">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
                    {p.brandLabel} · {p.categoryLabel}
                  </p>
                  {p.hasLanding ? (
                    <Link href={`/products/${p.slug}/`} onClick={onClose} className="mt-0.5 inline-flex items-center gap-1.5 font-semibold hover:underline underline-offset-4">
                      <span>{p.name}</span>
                      <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                    </Link>
                  ) : (
                    <p className="mt-0.5 font-semibold">{p.name}</p>
                  )}
                  <p className="mt-0.5 truncate text-xs text-foreground-2">{p.summary}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm tabular text-foreground-2">
                    {p.priceEstimate ? `от ${fmt(p.priceEstimate)} ₽` : "по запросу"}
                  </span>
                  <AddToCartButton
                    item={{ slug: p.slug, name: p.name, brand: p.brandLabel, priceEstimate: p.priceEstimate, hasLanding: p.hasLanding }}
                    className="min-h-9 px-4 text-xs"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
