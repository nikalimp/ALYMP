"use client";
import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart, type CartItem } from "@/components/cart/cart-context";

type BundleItem = Omit<CartItem, "qty">;

export function AddScenarioToCart({ items, label }: { items: BundleItem[]; label?: string }) {
  const { addItem, openCart } = useCart();
  const [added, setAdded] = useState(false);

  const onClick = () => {
    items.forEach((it) => addItem(it));
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-85"
    >
      {added ? (
        <>
          <Check className="size-4" strokeWidth={2} aria-hidden="true" />
          <span>Сценарий добавлен в корзину</span>
        </>
      ) : (
        <>
          <ShoppingBag className="size-4" strokeWidth={1.75} aria-hidden="true" />
          <span>{label ?? `Добавить весь сценарий в корзину (${items.length})`}</span>
        </>
      )}
    </button>
  );
}
