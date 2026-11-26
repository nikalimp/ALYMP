// «Как работает в паре»: сценарии «событие → реакция дома» с фото устройств-участников.
import { linkTerms } from "@/lib/link-terms";
import { getProduct, type Product } from "@/lib/products";

type Pair = { title: string; with: string[]; text: string };

function Thumb({ p }: { p?: Product }) {
  return (
    <span className="flex size-14 shrink-0 items-center justify-center bg-surface p-1.5 ring-1 ring-border">
      {p?.media?.card ? <img src={p.media.card} alt={p.media.alt ?? p.name} width={56} height={56} loading="lazy" className="size-full object-contain" /> : <span className="font-mono text-[10px] text-muted-foreground">—</span>}
    </span>
  );
}

export function Scenarios({ product, pairs, ready, used }: { product: Product; pairs: Pair[]; ready: Set<string>; used: Set<string> }) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {pairs.map((pair, n) => {
        const partners = pair.with.map((w) => ({ slug: w, p: getProduct(w) }));
        return (
          <article key={pair.title} className="flex flex-col bg-muted p-6 sm:p-7">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">Сценарий {String(n + 1).padStart(2, "0")}</p>
            <div className="mt-5 flex items-center gap-2" aria-label={`Участвуют: ${[...partners.map((x) => x.p?.name ?? x.slug), product.name].join(", ")}`}>
              {partners.map((x) => <Thumb key={x.slug} p={x.p} />)}
              <svg aria-hidden="true" viewBox="0 0 32 12" className="h-3 w-8 shrink-0 text-foreground-2"><path d="M0 6h28M23 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
              <Thumb p={product} />
            </div>
            <h3 className="mt-5 text-xl font-semibold tracking-[-0.01em]">{pair.title}</h3>
            <p className="mt-2 flex-1 text-foreground-2">{linkTerms(pair.text, { used, maxLinks: 3 })}</p>
            <p className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {partners.map((x) =>
                ready.has(x.slug) ? (
                  <a key={x.slug} href={`/products/${x.slug}/`} className="underline underline-offset-4">{x.p?.name ?? x.slug}</a>
                ) : (
                  <span key={x.slug} className="text-muted-foreground">{x.p?.name ?? x.slug}</span>
                ),
              )}
            </p>
          </article>
        );
      })}
    </div>
  );
}
