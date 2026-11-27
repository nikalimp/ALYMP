// «Приложение и работа в России» — появляется, когда в товаре заполнено поле appInfo.
import type { Product } from "@/lib/products";

export function AppInfoCard({ app }: { app: NonNullable<Product["appInfo"]> }) {
  return (
    <div className="grid gap-6 bg-muted p-7 sm:p-9 lg:grid-cols-[1fr_2fr]">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">Приложение</p>
        <p className="mt-3 text-2xl font-semibold tracking-[-0.02em]">{app.name}</p>
        <p className="mt-4 flex flex-wrap gap-3 text-sm">
          {app.ios && <a href={app.ios} target="_blank" rel="noopener nofollow" className="underline underline-offset-4">App Store</a>}
          {app.android && <a href={app.android} target="_blank" rel="noopener nofollow" className="underline underline-offset-4">Google Play / RuStore</a>}
        </p>
      </div>
      {app.ruNotes && app.ruNotes.length > 0 && (
        <ul className="space-y-3 text-foreground-2">
          {app.ruNotes.map((n) => <li key={n} className="border-t pt-3 first:border-0 first:pt-0">{n}</li>)}
        </ul>
      )}
    </div>
  );
}
