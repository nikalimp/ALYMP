// Ключевые цифры — асимметричное bento (DESIGN.md): главная фишка — тёмная плитка .is-dark с крупной цифрой
// JetBrains Mono, остальные — светлые. Шкала на тёмной плитке — декоративная разметка, не данные (aria-hidden).
import { cn } from "@/lib/utils";

type K = { value: string; label: string };

function Ruler() {
  return (
    <svg aria-hidden="true" viewBox="0 0 240 16" className="h-4 w-full max-w-[280px] text-muted-foreground" preserveAspectRatio="none">
      {Array.from({ length: 25 }, (_, i) => (
        <line key={i} x1={i * 10 + 0.5} x2={i * 10 + 0.5} y1={i % 5 === 0 ? 0 : 8} y2={16} stroke="currentColor" strokeWidth={1} />
      ))}
    </svg>
  );
}

export function KeyBento({ items }: { items: K[] }) {
  if (items.length === 0) return null;
  const [main, ...rest] = items;
  return (
    <dl className="grid gap-3 lg:grid-cols-4 lg:grid-rows-2">
      <div className="is-dark flex min-h-[260px] flex-col justify-between p-7 sm:p-9 lg:col-span-2 lg:row-span-2">
        <dt className="order-last mt-4 max-w-sm text-base text-foreground-2">{main.label}</dt>
        <div className="flex flex-col gap-6">
          <Ruler />
          <dd className="font-mono text-[clamp(56px,8vw,112px)] font-medium leading-[0.9] tracking-[-0.04em] tabular">{main.value}</dd>
        </div>
      </div>
      {rest.map((k, i) => (
        <div key={k.label} className={cn("flex min-h-[150px] flex-col justify-between bg-muted p-6 sm:p-7", i === 0 && "lg:col-span-2")}>
          <dt className="order-last mt-3 text-sm text-foreground-2">{k.label}</dt>
          <dd className="font-mono text-[clamp(30px,3.4vw,46px)] font-medium leading-none tracking-[-0.03em] tabular">{k.value}</dd>
        </div>
      ))}
    </dl>
  );
}
