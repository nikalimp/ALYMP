// Компактный виджет совместимости: значение — из content/products/<slug>.json (у каждого «да» есть источник).
import { Check, Minus } from "lucide-react";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

const ORDER: { key: keyof Product["compatibility"]; label: string }[] = [
  { key: "alice", label: "Алиса" },
  { key: "matter", label: "Matter" },
  { key: "thread", label: "Thread" },
  { key: "zigbee", label: "Zigbee" },
  { key: "homekit", label: "Apple Home" },
  { key: "homeAssistant", label: "Home Assistant" },
];
const state = { yes: "работает", "via-hub": "через хаб", no: "нет", unknown: "нет данных" } as const;

export function CompatBadges({ c }: { c: Product["compatibility"] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {ORDER.map(({ key, label }) => {
        const v = c[key]?.v ?? "unknown";
        const on = v === "yes" || v === "via-hub";
        return (
          <li key={key} className={cn("inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm", on ? "border-foreground text-foreground" : "text-muted-foreground")}>
            {on ? <Check className="size-4" strokeWidth={1.75} aria-hidden="true" /> : <Minus className="size-4" strokeWidth={1.5} aria-hidden="true" />}
            <span className="font-medium">{label}</span>
            <span className="font-mono text-xs opacity-70">{state[v]}</span>
          </li>
        );
      })}
    </ul>
  );
}
