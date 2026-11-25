import Link from "next/link";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

// Витрина в духе apple.com: карточка целиком — ссылка; внутри только фото, название и 1–2 строки описания.
// Контейнер фото — чисто белый, без теней, единое кадрирование object-contain с одинаковыми полями.
export type ShowcaseItem = { slug: string; name: string; text: string; image?: string; alt?: string; width?: number; height?: number };

export function toShowcaseItem(p: Product, tagline?: string, big = false): ShowcaseItem {
  const m = p.media;
  return {
    slug: p.slug,
    name: p.name,
    text: tagline ?? p.facts[0]?.text ?? "",
    image: big ? m?.hero ?? m?.card : m?.card,
    alt: m?.alt ?? p.name,
    width: big ? m?.width : m?.cardWidth,
    height: big ? m?.height : m?.cardHeight,
  };
}

export function ShowcaseCard({ item, size = "md", priority = false }: { item: ShowcaseItem; size?: "lg" | "md" | "sm"; priority?: boolean }) {
  return (
    <Link
      href={`/products/${item.slug}/`}
      className="group flex flex-col items-center bg-surface px-6 pt-10 text-center text-foreground outline-offset-[-2px] sm:px-10 sm:pt-14"
    >
      <h3 className={cn("font-semibold tracking-[-0.025em]", size === "lg" ? "text-[clamp(32px,4.4vw,56px)] leading-none" : size === "md" ? "text-[clamp(26px,3vw,40px)] leading-tight" : "text-2xl leading-tight")}>
        {item.name}
      </h3>
      <p className={cn("mt-3 line-clamp-2 max-w-xl text-foreground-2", size === "lg" ? "text-xl" : "text-[17px]")}>{item.text}</p>
      <div className={cn("mt-8 flex w-full items-center justify-center bg-surface p-6 sm:p-8", size === "lg" ? "aspect-[16/9] max-h-[640px]" : size === "md" ? "aspect-[4/3]" : "aspect-square")}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.alt}
            width={item.width}
            height={item.height}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            className="size-full object-contain"
          />
        ) : (
          <span className="font-mono text-xs text-muted-foreground">Фото — после паспорта дистрибьютора</span>
        )}
      </div>
    </Link>
  );
}
