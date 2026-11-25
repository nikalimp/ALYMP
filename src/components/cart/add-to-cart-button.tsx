"use client";
import { Check, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart, type CartItem } from "./cart-context";
import { cn } from "@/lib/utils";

type Props = {
  item: Omit<CartItem, "qty">;
  variant?: "primary" | "outline";
  className?: string;
  openOnAdd?: boolean;
};

export function AddToCartButton({ item, variant = "outline", className, openOnAdd = false }: Props) {
  const { addItem, openCart, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const inCart = items.some((i) => i.slug === item.slug);

  function handleClick() {
    addItem(item);
    setJustAdded(true);
    if (openOnAdd) openCart();
    setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors duration-200",
        variant === "primary"
          ? "bg-primary text-primary-foreground hover:opacity-85"
          : "border border-border-strong bg-transparent text-foreground hover:border-foreground",
        className,
      )}
    >
      {justAdded ? <Check className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" /> : <ShoppingBag className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />}
      <span>{justAdded ? "Добавлено" : inCart ? "В корзине +" : "В корзину"}</span>
    </button>
  );
}
