// Маркеры доверия и сроков рядом с кнопкой заказа: компактно, без иконок-шума.
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

export function TrustLine({ status, className }: { status: Product["status"]; className?: string }) {
  const term = status === "in_stock" ? "В продаже · уточним срок доставки" : "Под заказ · срок уточним при подтверждении";
  return (
    <ul className={cn("flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-foreground-2", className)}>
      <li className="inline-flex items-center gap-2"><i aria-hidden="true" className={cn("size-1.5 rounded-full", status === "in_stock" ? "bg-ok" : "bg-warn")} />{term}</li>
      <li>Официальная версия для России</li>
      <li>Гарантия в России</li>
    </ul>
  );
}
