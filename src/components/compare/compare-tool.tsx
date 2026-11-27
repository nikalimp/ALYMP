"use client";
// Интерактивное сравнение 2–3 моделей (как apple.com/compare): данные — из content/products/*.json.
import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { cn } from "@/lib/utils";

export type CompareProduct = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  image?: string;
  price: number | null;
  status: string;
  compat: Record<string, string>;
  specs: { label: string; value: string }[];
};

const COMPAT: [string, string][] = [["alice", "Алиса"], ["matter", "Matter"], ["thread", "Thread"], ["zigbee", "Zigbee"], ["homekit", "Apple Home"], ["homeAssistant", "Home Assistant"], ["wifi", "Wi-Fi"]];
const CV: Record<string, string> = { yes: "да", "via-hub": "через хаб", no: "нет", unknown: "—" };
const ST: Record<string, string> = { in_stock: "в продаже", preorder: "под заказ", unknown: "под заказ" };
const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/ /g, " ");

export function CompareTool({ products, initial }: { products: CompareProduct[]; initial: string[] }) {
  const [sel, setSel] = useState<string[]>(initial);
  const [diffOnly, setDiffOnly] = useState(false);
  const cols = sel.map((s) => products.find((p) => p.slug === s)).filter((p): p is CompareProduct => !!p);

  const groups = useMemo(() => {
    const val = (p: CompareProduct, label: string) => p.specs.find((s) => s.label === label)?.value ?? "—";
    const main: { label: string; values: string[] }[] = [
      { label: "Статус", values: cols.map((p) => ST[p.status] ?? p.status) },
      { label: "Ориентир цены", values: cols.map((p) => (p.price ? `от ${fmt(p.price)} ₽` : "по запросу")) },
    ];
    const compat = COMPAT.map(([k, l]) => ({ label: l, values: cols.map((p) => CV[p.compat[k] ?? "unknown"]) }));
    const labels = [...new Set(cols.flatMap((p) => p.specs.map((s) => s.label)))];
    const specs = labels.map((l) => ({ label: l, values: cols.map((p) => val(p, l)) }));
    const filt = (rows: typeof main) => (diffOnly ? rows.filter((r) => new Set(r.values).size > 1) : rows);
    return [
      { title: "Главное", rows: filt(main) },
      { title: "Совместимость", rows: filt(compat) },
      { title: "Характеристики", rows: filt(specs) },
    ];
  }, [cols, diffOnly]);

  const setAt = (i: number, slug: string) => setSel((s) => { const n = [...s]; if (slug) n[i] = slug; else n.splice(i, 1); return n; });
  const grid = cols.length === 3 ? "grid-cols-[minmax(140px,1fr)_repeat(3,minmax(150px,1fr))]" : "grid-cols-[minmax(140px,1fr)_repeat(2,minmax(150px,1fr))]";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium">
          <span className="relative inline-flex h-6 w-11 items-center">
            <input type="checkbox" role="switch" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} className="peer sr-only" />
            <span className="absolute inset-0 rounded-full bg-border-strong transition-colors duration-200 peer-checked:bg-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-ring" />
            <span className="relative ml-0.5 size-5 rounded-full bg-background transition-transform duration-200 ease-out peer-checked:translate-x-5" />
          </span>
          Показать только отличия
        </label>
        {cols.length < 3 && (
          <button type="button" onClick={() => setSel((s) => [...s, products.find((p) => !s.includes(p.slug))!.slug])} className="inline-flex min-h-10 cursor-pointer items-center rounded-full border border-border-strong px-4 text-sm font-semibold hover:border-foreground">
            + Добавить модель
          </button>
        )}
      </div>

      <div className="relative mt-8 overflow-x-auto">
        <div className={cn("grid min-w-[560px] gap-x-4", grid)}>
          <div />
          {cols.map((p, i) => (
            <div key={`${p.slug}-${i}`} className="flex flex-col">
              <label className="sr-only" htmlFor={`cmp-${i}`}>Модель {i + 1}</label>
              <select id={`cmp-${i}`} value={p.slug} onChange={(e) => setAt(i, e.target.value)} className="min-h-11 w-full rounded-md border border-border-strong bg-background px-3 text-sm font-semibold">
                {products.map((o) => <option key={o.slug} value={o.slug} disabled={o.slug !== p.slug && sel.includes(o.slug)}>{o.name}</option>)}
              </select>
              <div className="mt-4 flex aspect-square items-center justify-center bg-surface p-4">
                {p.image && <img src={p.image} alt={p.name} width={240} height={240} loading="lazy" className="size-full object-contain" />}
              </div>
              <p className="mt-3 font-mono text-sm tabular">{p.price ? `от ${fmt(p.price)} ₽` : "Цена по запросу"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <AddToCartButton item={{ slug: p.slug, name: p.name, brand: p.brand, priceEstimate: p.price, hasLanding: true }} />
                {cols.length > 2 && <button type="button" onClick={() => setAt(i, "")} className="min-h-11 cursor-pointer px-2 text-sm text-muted-foreground hover:text-foreground">Убрать</button>}
              </div>
              <a href={`/products/${p.slug}/`} className="mt-2 text-sm underline underline-offset-4">Подробнее</a>
            </div>
          ))}
          {groups.map((g) => g.rows.length > 0 && (
            <div key={g.title} className="contents">
              <h3 className="col-span-full mt-10 border-b-2 border-foreground pb-2 font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">{g.title}</h3>
              {g.rows.map((r) => (
                <div key={r.label} className="contents">
                  <div className="border-b py-3 pr-2 text-sm text-foreground-2">{r.label}</div>
                  {r.values.map((v, i) => <div key={i} className={cn("border-b py-3 text-sm tabular", v === "—" ? "text-muted-foreground" : "font-medium")}>{v}</div>)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
