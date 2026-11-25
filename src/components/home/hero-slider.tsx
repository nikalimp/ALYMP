"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "@/components/container";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  slug: string;
  name: string;
  brandLabel: string;
  categoryLabel: string;
  tagline: string;
  keyValue: string;
  keyLabel: string;
  secondaryValue: string;
  secondaryLabel: string;
  priceEstimate: number | null;
  priceSource: string | null;
  priceDate: string | null;
  status: "in_stock" | "preorder" | "unknown";
  image?: string;
};

const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/\u00A0/g, " ");
const statusLabel = { in_stock: "в продаже", preorder: "под заказ", unknown: "под заказ" } as const;

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  const s = slides[index];
  if (!s) return null;

  return (
    <section
      aria-label="Флагманские новинки ALYMP"
      className="is-dark relative overflow-hidden border-b"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Container className="py-12 sm:py-16 lg:py-20">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Флагманы 2025⁠–⁠2026 · 17 устройств в каталоге
            </p>
            <h1 className="mt-1 text-lg font-medium text-foreground-2 sm:text-xl">
              Роботы и умный дом нового поколения
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              aria-label="Предыдущий флагман"
              className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-border-strong text-foreground transition-colors duration-200 hover:border-foreground"
            >
              <ArrowLeft className="size-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Следующий флагман"
              className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-border-strong text-foreground transition-colors duration-200 hover:border-foreground"
            >
              <ArrowRight className="size-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div key={s.slug} className="transition-opacity duration-300">
            <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-foreground-2">
              <i aria-hidden="true" className={cn("size-1.5 rounded-full", s.status === "in_stock" ? "bg-ok" : "bg-warn")} />
              {statusLabel[s.status]} · {s.brandLabel} · {s.categoryLabel}
            </p>
            <h2 className="mt-4 text-[clamp(38px,6.5vw,84px)] font-bold leading-[0.94] tracking-[-0.04em] text-balance">
              {s.name}
            </h2>
            <p className="mt-5 max-w-xl text-lg text-foreground-2 sm:text-xl">{s.tagline}</p>

            <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {s.priceEstimate ? (
                <>
                  <span className="font-mono text-2xl font-semibold tracking-tight tabular">от {fmt(s.priceEstimate)} ₽</span>
                  <span className="text-xs text-muted-foreground">
                    Ориентир ({s.priceSource}, {s.priceDate})
                  </span>
                </>
              ) : (
                <span className="font-mono text-2xl font-semibold tracking-tight">Цена по запросу</span>
              )}
            </div>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link
                href={`/products/${s.slug}/`}
                className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-85"
              >
                Подробнее
              </Link>
              <AddToCartButton
                item={{
                  slug: s.slug,
                  name: s.name,
                  brand: s.brandLabel,
                  priceEstimate: s.priceEstimate,
                  hasLanding: true,
                }}
              />
            </div>
          </div>

          <div className="border bg-card p-6 sm:p-8">
            {s.image ? (
              <div className="relative mb-6 aspect-[16/10] overflow-hidden bg-background">
                <img src={s.image} alt={s.name} width={780} height={439} className="size-full object-cover" />
              </div>
            ) : null}
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-brand">Ключевые показатели</p>
            <dl className="mt-5 grid grid-cols-2 gap-6 border-t pt-5">
              <div>
                <dd className="font-mono text-[clamp(28px,3.6vw,44px)] font-semibold leading-none tracking-[-0.03em] tabular">
                  {s.keyValue}
                </dd>
                <dt className="mt-2 text-xs text-muted-foreground">{s.keyLabel}</dt>
              </div>
              <div>
                <dd className="font-mono text-[clamp(28px,3.6vw,44px)] font-semibold leading-none tracking-[-0.03em] tabular">
                  {s.secondaryValue}
                </dd>
                <dt className="mt-2 text-xs text-muted-foreground">{s.secondaryLabel}</dt>
              </div>
            </dl>
          </div>
        </div>

        {/* Индикаторы слайдов */}
        <div className="mt-10 flex flex-wrap items-center gap-2 border-t pt-5" role="tablist" aria-label="Выбор флагмана">
          {slides.map((item, i) => (
            <button
              key={item.slug}
              type="button"
              role="tab"
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full px-3.5 font-mono text-xs transition-colors duration-200",
                i === index
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "border border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <span className="hidden sm:inline">{item.name}</span>
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
