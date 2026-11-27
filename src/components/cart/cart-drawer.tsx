"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "./cart-context";
import type { CatalogItemSummary } from "../search-modal";
import { site } from "@/content/site";

const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/\u00A0/g, " ");

// Кросс-селл «Хорошо дополняют заказ» — 1–2 товара, которых нет в корзине (решение Ника 27.11.2026)
const SUGGEST: { slug: string; note: string; when: (slugs: Set<string>, brands: Set<string>, cats: Set<string>) => boolean }[] = [
  { slug: "aqara-hub-m3", note: "Нужен для Matter и сценариев с Алисой", when: (s, b) => b.has("Aqara") && !s.has("aqara-hub-m3") },
  { slug: "aqara-fp400", note: "Запуск уборки, когда никого нет дома", when: (s, _b, c) => c.has("cleaning-robots") },
  { slug: "hobot-sp10", note: "Чистые окна без усилий", when: (s, _b, c) => c.has("cleaning-robots") },
];

export function CartDrawer({ catalog = [] }: { catalog?: CatalogItemSummary[] }) {
  const { items, isOpen, closeCart, setQty, removeItem, clear, estimatedTotal, hasUnpriced, addItem } = useCart();
  const inCart = new Set(items.map((i) => i.slug));
  const cats = new Set(items.map((i) => catalog.find((c) => c.slug === i.slug)?.category).filter(Boolean) as string[]);
  const brands = new Set(items.map((i) => i.brand));
  const suggestions = SUGGEST.filter((x) => !inCart.has(x.slug) && x.when(inCart, brands, cats))
    .map((x) => ({ ...x, p: catalog.find((c) => c.slug === x.slug) }))
    .filter((x): x is typeof x & { p: CatalogItemSummary } => !!x.p)
    .slice(0, 2);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "fallback" | "error">("idle");
  const [orderText, setOrderText] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = Object.fromEntries(f.entries()) as Record<string, string>;
    const lines = items.map(
      (i) => `• ${i.name} × ${i.qty}${i.priceEstimate ? ` (ориентир от ${fmt(i.priceEstimate * i.qty)} ₽)` : " (цена по запросу)"}`,
    );
    const totalLine =
      estimatedTotal > 0
        ? `Ориентировочная сумма: от ${fmt(estimatedTotal)} ₽${hasUnpriced ? " + позиции по запросу" : ""}`
        : "Ориентировочная сумма: по запросу";
    const msg = [
      "Заявка из корзины alymp.ru:",
      ...lines,
      totalLine,
      `Имя: ${data.name}`,
      `Контакт: ${data.contact}`,
      data.comment && `Комментарий: ${data.comment}`,
    ]
      .filter(Boolean)
      .join("\n");

    setOrderText(msg);
    if (!site.features.leadApi) {
      setState("fallback");
      return;
    }
    setState("sending");
    try {
      const r = await fetch("/api/lead.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items,
          estimatedTotal,
          offer: "cart",
          consent: Boolean(f.get("consent")),
          page: window.location.pathname,
          via: "cart",
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setState("sent");
      clear();
      (window as unknown as { ym?: (...a: unknown[]) => void }).ym?.(site.metrikaId, "reachGoal", "lead");
    } catch {
      setState("error");
    }
  }

  const field = "mt-1 block min-h-11 w-full rounded-md border border-border-strong bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-ring";

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Корзина">
      <div className="fixed inset-0 bg-foreground/40" onClick={closeCart} aria-hidden="true" />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-background text-foreground overscroll-contain">
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-5">
          <div className="flex items-center gap-2 font-semibold">
            <ShoppingBag className="size-4" strokeWidth={1.5} aria-hidden="true" />
            <span>Корзина</span>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Закрыть корзину"
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-accent"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 overscroll-contain">
          {items.length === 0 && state === "idle" ? (
            <div className="py-16 text-center">
              <p className="text-lg font-medium">Корзина пока пуста</p>
              <p className="mt-2 text-sm text-muted-foreground">Добавьте устройства из каталога — соберём заявку и подтвердим цену до оплаты.</p>
              <button
                type="button"
                onClick={closeCart}
                className="mt-6 inline-flex min-h-11 cursor-pointer items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
              >
                Перейти к каталогу
              </button>
            </div>
          ) : state === "sent" ? (
            <div className="space-y-4 py-8">
              <p className="text-lg font-semibold">Заявка отправлена</p>
              <p className="text-foreground-2">Менеджер свяжется с вами, подтвердит цену, наличие и срок поставки.</p>
              <button type="button" onClick={() => { setState("idle"); closeCart(); }} className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground">
                Закрыть
              </button>
            </div>
          ) : state === "fallback" || state === "error" ? (
            <div className="space-y-4 py-2">
              <p className="font-medium">
                {state === "error" ? "Не удалось отправить заявку автоматически." : "Заявка сформирована."} Отправьте текст в Telegram — менеджер подтвердит цену, наличие и срок до оплаты.
              </p>
              <pre className="whitespace-pre-wrap bg-muted p-4 font-mono text-xs leading-relaxed">{orderText}</pre>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`${site.contacts.telegram}?text=${encodeURIComponent(orderText)}`}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
                >
                  Отправить в Telegram
                </a>
                <button
                  type="button"
                  onClick={() => setState("idle")}
                  className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-border-strong px-5 text-sm font-semibold"
                >
                  Назад
                </button>
              </div>
            </div>
          ) : (
            <>
              <ul className="divide-y border-b">
                {items.map((item) => (
                  <li key={item.slug} className="flex flex-col gap-3 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">{item.brand}</p>
                        {item.hasLanding ? (
                          <Link href={`/products/${item.slug}/`} onClick={closeCart} className="font-semibold hover:underline underline-offset-4">
                            {item.name}
                          </Link>
                        ) : (
                          <p className="font-semibold">{item.name}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.slug)}
                        aria-label={`Удалить ${item.name}`}
                        className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <Trash2 className="size-4" strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="inline-flex items-center border border-border-strong rounded-full">
                        <button
                          type="button"
                          onClick={() => setQty(item.slug, item.qty - 1)}
                          aria-label="Уменьшить количество"
                          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full hover:bg-accent"
                        >
                          <Minus className="size-3.5" strokeWidth={1.5} />
                        </button>
                        <span className="min-w-8 text-center font-mono text-sm tabular">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(item.slug, item.qty + 1)}
                          aria-label="Увеличить количество"
                          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full hover:bg-accent"
                        >
                          <Plus className="size-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                      <p className="font-mono text-sm font-medium tabular">
                        {item.priceEstimate ? `от ${fmt(item.priceEstimate * item.qty)} ₽` : "по запросу"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              {suggestions.length > 0 && (
                <section aria-labelledby="cart-xsell" className="mt-5">
                  <h3 id="cart-xsell" className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">Хорошо дополняют заказ</h3>
                  <ul className="mt-2 divide-y border-y">
                    {suggestions.map(({ slug, note, p }) => (
                      <li key={slug} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <Link href={`/products/${slug}/`} onClick={closeCart} className="block truncate text-sm font-semibold hover:underline underline-offset-4">{p.name}</Link>
                          <p className="text-xs text-foreground-2">{note}{p.priceEstimate ? ` · от ${fmt(p.priceEstimate)} ₽` : ""}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addItem({ slug, name: p.name, brand: p.brandLabel, priceEstimate: p.priceEstimate, hasLanding: p.hasLanding })}
                          aria-label={`Добавить ${p.name} в корзину`}
                          className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-strong hover:border-foreground"
                        >
                          <Plus className="size-4" strokeWidth={1.5} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="mt-5 flex items-baseline justify-between gap-4 bg-muted p-4">
                <span className="text-sm text-foreground-2">Ориентировочно</span>
                <span className="font-mono text-lg font-semibold tabular">
                  {estimatedTotal > 0 ? `от ${fmt(estimatedTotal)} ₽` : "по запросу"}
                  {hasUnpriced && estimatedTotal > 0 ? " +" : ""}
                </span>
              </div>

              <form onSubmit={submit} className="mt-6 space-y-4" aria-label="Оформление заявки из корзины">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                <label className="block">
                  <span className="text-sm font-medium">Имя</span>
                  <input name="name" required autoComplete="name" className={field} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Телефон или Telegram</span>
                  <input name="contact" required autoComplete="tel" className={field} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Комментарий (необязательно)</span>
                  <input name="comment" className={field} />
                </label>
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" name="consent" required className="mt-0.5 size-5 shrink-0 accent-[var(--primary)]" />
                  <span>
                    Согласен на обработку персональных данных —{" "}
                    <Link href="/consent/" onClick={closeCart} className="underline underline-offset-4">
                      текст согласия
                    </Link>
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-85 disabled:opacity-60"
                >
                  Оформить заявку
                </button>
                <p className="text-xs text-muted-foreground">Менеджер подтвердит цену, наличие и срок. Оплата — после подтверждения.</p>
              </form>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
