"use client";
// Форма «Заказать» (spec §7, T18). Чекбокс согласия — отдельный и не отмечен (152-ФЗ, стандарт §8.1).
// Обработчик /api/lead.php — задача T54. Пока его нет (site.features.leadApi = false), заявка уходит в Telegram с готовым текстом.
import { useState } from "react";
import { site } from "@/content/site";

export function OrderForm({ product, variants, b2b }: { product: string; variants: string[]; b2b: boolean }) {
  const [org, setOrg] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "fallback" | "error">("idle");
  const [text, setText] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = Object.fromEntries(f.entries()) as Record<string, string>;
    const msg = [`Заявка с alymp.ru: ${product}`, data.variant && `Версия: ${data.variant}`, `Имя: ${data.name}`, `Контакт: ${data.contact}`, org && `Организация: ${data.company || "—"}`, data.comment && `Комментарий: ${data.comment}`].filter(Boolean).join("\n");
    setText(msg);
    if (!site.features.leadApi) {
      setState("fallback");
      return;
    }
    setState("sending");
    try {
      const r = await fetch("/api/lead.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, product, organization: org, via: "site" }) });
      if (!r.ok) throw new Error(String(r.status));
      setState("sent");
      (window as unknown as { ym?: (...a: unknown[]) => void }).ym?.(site.metrikaId, "reachGoal", "lead");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") return <p className="text-lg">Заявка отправлена. Менеджер свяжется с вами, подтвердит цену, наличие и срок поставки.</p>;
  if (state === "fallback" || state === "error")
    return (
      <div className="space-y-4">
        <p className="text-lg">{state === "error" ? "Не удалось отправить заявку." : "Почти готово."} Отправьте этот текст в Telegram — менеджер ответит и подтвердит цену до оплаты.</p>
        <pre className="whitespace-pre-wrap bg-muted p-4 font-mono text-sm">{text}</pre>
        <div className="flex flex-wrap gap-2.5">
          <a href={`${site.contacts.telegram}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground">Отправить в Telegram</a>
          {site.contacts.phone && <a href={`tel:${site.contacts.phone}`} className="inline-flex min-h-11 items-center rounded-full border border-border-strong px-6 font-semibold">{site.contacts.phoneDisplay}</a>}
        </div>
      </div>
    );

  const field = "mt-1.5 block min-h-11 w-full rounded-md border border-border-strong bg-background px-3.5 text-base focus-visible:outline-2 focus-visible:outline-ring";
  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2" aria-label={`Заявка на ${product}`}>
      {variants.length > 0 && (
        <label className="sm:col-span-2">
          <span className="text-sm font-medium">Версия</span>
          <select name="variant" className={field} defaultValue={variants[0]}>
            {variants.map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
      )}
      <label>
        <span className="text-sm font-medium">Имя</span>
        <input name="name" required autoComplete="name" className={field} />
      </label>
      <label>
        <span className="text-sm font-medium">Телефон или Telegram</span>
        <input name="contact" required autoComplete="tel" className={field} />
      </label>
      {b2b && (
        <label className="flex items-center gap-3 sm:col-span-2">
          <input type="checkbox" checked={org} onChange={(e) => setOrg(e.target.checked)} className="size-5 accent-[var(--primary)]" />
          <span>Для организации — школа, вуз, компания</span>
        </label>
      )}
      {b2b && org && (
        <label className="sm:col-span-2">
          <span className="text-sm font-medium">Компания</span>
          <input name="company" autoComplete="organization" className={field} />
        </label>
      )}
      <label className="sm:col-span-2">
        <span className="text-sm font-medium">Комментарий</span>
        <textarea name="comment" rows={3} className={field.replace("min-h-11", "min-h-24 py-2.5")} />
      </label>
      <label className="flex items-start gap-3 text-sm sm:col-span-2">
        <input type="checkbox" name="consent" required className="mt-0.5 size-5 shrink-0 accent-[var(--primary)]" />
        <span>Согласен на обработку персональных данных — <a href="/consent/" className="underline underline-offset-4">текст согласия</a></span>
      </label>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
        <button type="submit" disabled={state === "sending"} className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-primary px-7 font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-85 disabled:opacity-60">Отправить заявку</button>
        <p className="text-sm text-muted-foreground">Менеджер подтвердит цену, наличие и срок. Оплата — после подтверждения.</p>
      </div>
    </form>
  );
}
