"use client";
// Подбор комплекта: 4 вопроса → связка из реальных товаров каталога (content/products/*.json).
// Правила прозрачные и записаны ниже; цены — ориентиры из карточек товаров, позиции без ориентира — «по запросу».
import { useMemo, useState } from "react";
import { Check, Minus } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { cn } from "@/lib/utils";

export type SelectorProduct = {
  slug: string;
  name: string;
  brand: string;
  tagline: string;
  price: number | null;
  image?: string;
  alice: string;
  homekit: string;
};

type Answers = { home: "small" | "mid" | "house"; thresholds: "none" | "low" | "high"; pets: "yes" | "no"; eco: "alice" | "apple" | "any" };

const Q: { key: keyof Answers; title: string; options: { v: string; label: string }[] }[] = [
  { key: "home", title: "Где будет работать техника?", options: [{ v: "small", label: "Квартира до 60 м²" }, { v: "mid", label: "Квартира 60⁠–⁠120 м²" }, { v: "house", label: "Дом от 120 м²" }] },
  { key: "thresholds", title: "Какие пороги между комнатами?", options: [{ v: "none", label: "Без порогов" }, { v: "low", label: "Низкие, до 2 см" }, { v: "high", label: "Высокие или двойные" }] },
  { key: "pets", title: "Есть ли домашние животные?", options: [{ v: "yes", label: "Да" }, { v: "no", label: "Нет" }] },
  { key: "eco", title: "Через что будете управлять домом?", options: [{ v: "alice", label: "Яндекс Алиса" }, { v: "apple", label: "Apple Home" }, { v: "any", label: "Пока не решил" }] },
];

// Правила подбора — только по официальным характеристикам моделей
function pick(a: Answers): { slug: string; role: string }[] {
  const vacuum =
    a.thresholds === "high" ? "dreame-x50-ultra-complete" // ProLeap: две ступени до 60 мм, одиночный порог до 42 мм
    : a.home === "small" ? "dreame-l50-ultra"
    : a.pets === "yes" ? "roborock-saros-z70" // рука OmniGrip убирает мелкие предметы с пола
    : "roborock-qrevo-curv-2-flow";
  const set = [
    { slug: vacuum, role: "Уборка" },
    { slug: "aqara-hub-m3", role: "Центр умного дома" },
    { slug: "aqara-fp400", role: "Датчик присутствия" },
    { slug: a.home === "house" ? "aqara-smart-lock-u200" : "aqara-smart-lock-u300", role: "Доступ без ключей" },
  ];
  if (a.home === "house") set.push({ slug: "hobot-sp10", role: "Мойка окон" });
  return set;
}

const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/ /g, " ");
const state: Record<string, string> = { yes: "работает", "via-hub": "через хаб", no: "нет", unknown: "нет данных" };

export function Selector({ products }: { products: SelectorProduct[] }) {
  const [a, setA] = useState<Partial<Answers>>({});
  const [added, setAdded] = useState(false);
  const { addItem, openCart } = useCart();
  const done = Q.every((q) => a[q.key]);
  const kit = useMemo(() => {
    if (!done) return [];
    return pick(a as Answers)
      .map((x) => ({ ...x, p: products.find((p) => p.slug === x.slug) }))
      .filter((x): x is { slug: string; role: string; p: SelectorProduct } => !!x.p);
  }, [a, done, products]);
  const total = kit.reduce((s, x) => s + (x.p.price ?? 0), 0);
  const unpriced = kit.filter((x) => !x.p.price).length;
  const ecoKey = a.eco === "alice" ? "alice" : a.eco === "apple" ? "homekit" : null;

  return (
    <div className="grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-14">
      <form className="space-y-8" onSubmit={(e) => e.preventDefault()} aria-label="Вопросы для подбора">
        {Q.map((q, i) => (
          <fieldset key={q.key}>
            <legend className="text-lg font-semibold"><span className="mr-2 font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>{q.title}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {q.options.map((o) => {
                const on = a[q.key] === o.v;
                return (
                  <label key={o.v} className={cn("inline-flex min-h-11 cursor-pointer items-center rounded-full border px-5 text-sm font-semibold transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring", on ? "border-foreground bg-foreground text-background" : "border-border-strong hover:border-foreground")}>
                    <input type="radio" name={q.key} value={o.v} checked={on} onChange={() => { setA((x) => ({ ...x, [q.key]: o.v })); setAdded(false); }} className="sr-only" />
                    {o.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </form>

      <div aria-live="polite">
        {!done ? (
          <div className="flex h-full min-h-64 flex-col justify-center bg-muted p-8">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">Ответьте на {Q.length - Q.filter((q) => a[q.key]).length} из {Q.length} вопросов</p>
            <p className="mt-3 text-xl font-semibold">Комплект соберётся из моделей каталога, которые работают вместе.</p>
          </div>
        ) : (
          <div className="bg-muted p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">Ваш комплект</p>
            <ul className="mt-4 divide-y divide-border">
              {kit.map(({ slug, role, p }) => {
                const eco = ecoKey ? (ecoKey === "alice" ? p.alice : p.homekit) : null;
                const ok = eco === "yes" || eco === "via-hub";
                return (
                  <li key={slug} className="grid grid-cols-[64px_1fr] gap-4 py-4 sm:grid-cols-[72px_1fr_auto]">
                    <span className="flex size-16 items-center justify-center bg-surface p-1.5 sm:size-[72px]">
                      {p.image && <img src={p.image} alt={p.name} width={72} height={72} loading="lazy" className="size-full object-contain" />}
                    </span>
                    <span>
                      <span className="block font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">{role}</span>
                      <a href={`/products/${slug}/`} className="mt-0.5 block font-semibold hover:underline underline-offset-4">{p.name}</a>
                      <span className="mt-1 block text-sm text-foreground-2">{p.tagline}</span>
                      {eco && (
                        <span className={cn("mt-2 inline-flex items-center gap-1.5 text-xs", ok ? "text-foreground" : "text-muted-foreground")}>
                          {ok ? <Check className="size-3.5" strokeWidth={2} aria-hidden="true" /> : <Minus className="size-3.5" strokeWidth={2} aria-hidden="true" />}
                          {ecoKey === "alice" ? "Алиса" : "Apple Home"}: {state[eco] ?? eco}
                        </span>
                      )}
                    </span>
                    <span className="col-start-2 font-mono text-sm tabular sm:col-start-auto sm:text-right">{p.price ? `от ${fmt(p.price)} ₽` : "по запросу"}</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex flex-col gap-4 border-t border-foreground pt-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ориентир за комплект{unpriced ? `, без ${unpriced} поз. по запросу` : ""}</p>
                <p className="font-mono text-3xl font-medium tracking-tight tabular">от {fmt(total)} ₽</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  kit.forEach(({ p }) => addItem({ slug: p.slug, name: p.name, brand: p.brand, priceEstimate: p.price, hasLanding: true }));
                  setAdded(true);
                  openCart();
                }}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-85"
              >
                {added ? "Комплект в корзине" : "Добавить комплект в корзину"}
              </button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Цены — ориентиры из карточек товаров. Точную сумму, наличие и срок подтвердит менеджер до оплаты.</p>
          </div>
        )}
      </div>
    </div>
  );
}
