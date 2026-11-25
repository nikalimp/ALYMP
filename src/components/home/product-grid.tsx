"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { cn } from "@/lib/utils";

export type GridProduct = {
  slug: string;
  name: string;
  brandLabel: string;
  category: "cleaning-robots" | "smart-home" | "robots";
  categoryLabel: string;
  status: "in_stock" | "preorder" | "unknown";
  priceEstimate: number | null;
  priceDate: string | null;
  hasLanding: boolean;
  highlight: string;
  keySpec: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageFit?: "cover" | "contain";
};

const TABS = [
  { id: "all", label: "Все модели" },
  { id: "cleaning-robots", label: "Автономная уборка" },
  { id: "smart-home", label: "Умный дом" },
  { id: "robots", label: "Роботы Unitree" },
] as const;

type TabId = (typeof TABS)[number]["id"];
const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/\u00A0/g, " ");
const statusLabel = { in_stock: "в продаже", preorder: "под заказ", unknown: "под заказ" } as const;

export function ProductGrid({ products }: { products: GridProduct[] }) {
  const [active, setActive] = useState<TabId>("all");

  useEffect(() => {
    const syncHash = () => {
      const h = window.location.hash;
      if (h === "#catalog-cleaning-robots") setActive("cleaning-robots");
      else if (h === "#catalog-smart-home") setActive("smart-home");
      else if (h === "#catalog-robots") setActive("robots");
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const filtered = active === "all" ? products : products.filter((p) => p.category === active);

  return (
    <div>
      {/* Якоря для переходов из выпадающего меню шапки */}
      <span id="catalog-cleaning-robots" className="sr-only" />
      <span id="catalog-smart-home" className="sr-only" />
      <span id="catalog-robots" className="sr-only" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Фильтр категорий каталога">
          {TABS.map((t) => {
            const count = t.id === "all" ? products.length : products.filter((p) => p.category === t.id).length;
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
        <p className="font-mono text-xs text-muted-foreground tabular">Показано: {filtered.length} из {products.length}</p>
      </div>

      <div className="mt-8 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <article key={p.slug} className="flex flex-col justify-between bg-card p-6 sm:p-7">
            <div>
              {p.image && (
                <Link
                  href={`/products/${p.slug}/`}
                  className="mb-5 flex aspect-[16/10] items-center justify-center overflow-hidden bg-muted/60"
                >
                  <img
                    src={p.image}
                    alt={p.imageAlt ?? p.name}
                    width={p.imageWidth ?? 640}
                    height={p.imageHeight ?? 400}
                    loading="lazy"
                    className={cn("size-full", p.imageFit === "contain" ? "object-contain p-4" : "object-cover")}
                  />
                </Link>
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
                  {p.brandLabel} · {p.categoryLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                  <i aria-hidden="true" className={cn("size-1.5 rounded-full", p.status === "in_stock" ? "bg-ok" : "bg-warn")} />
                  {statusLabel[p.status]}
                </span>
              </div>

              <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em]">
                {p.hasLanding ? (
                  <Link href={`/products/${p.slug}/`} className="hover:underline underline-offset-4">
                    {p.name}
                  </Link>
                ) : (
                  p.name
                )}
              </h3>

              <p className="mt-2 font-mono text-xs text-brand">{p.keySpec}</p>
              <p className="mt-3 text-sm leading-relaxed text-foreground-2">{p.highlight}</p>
            </div>

            <div className="mt-6 border-t pt-5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-lg font-semibold tabular">
                  {p.priceEstimate ? `от ${fmt(p.priceEstimate)} ₽` : "Цена по запросу"}
                </span>
                {p.priceEstimate && p.priceDate && (
                  <span className="font-mono text-[11px] text-muted-foreground">ориентир</span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {p.hasLanding ? (
                  <>
                    <Link
                      href={`/products/${p.slug}/`}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-85"
                    >
                      <span>Подробнее</span>
                      <ArrowRight className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                    </Link>
                    <AddToCartButton
                      item={{ slug: p.slug, name: p.name, brand: p.brandLabel, priceEstimate: p.priceEstimate, hasLanding: true }}
                    />
                  </>
                ) : (
                  <>
                    <AddToCartButton
                      variant="primary"
                      item={{ slug: p.slug, name: p.name, brand: p.brandLabel, priceEstimate: p.priceEstimate, hasLanding: false }}
                    />
                    <span className="text-xs text-muted-foreground">Подтвердим цену до оплаты</span>
                  </>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
