"use client";
// Подменю модели как на apple.com: появляется под шапкой, когда первый экран ушёл вверх.
// Ссылки — обычные якоря (работают без JS); JS только показывает полоску и подсвечивает текущий раздел.
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ProductSubNav({ name, links, orderHref = "#order" }: { name: string; links: { id: string; label: string }[]; orderHref?: string }) {
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const hero = document.getElementById("product-hero");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setShown(!e.isIntersecting), { rootMargin: "-56px 0px 0px 0px" });
    io.observe(hero);
    const secs = links.map((l) => document.getElementById(l.id)).filter((x): x is HTMLElement => !!x);
    const spy = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    secs.forEach((s) => spy.observe(s));
    return () => {
      io.disconnect();
      spy.disconnect();
    };
  }, [links]);

  return (
    <div
      className={cn(
        "sticky top-14 z-30 -mb-12 h-12 border-b bg-background/80 backdrop-blur-lg backdrop-saturate-150 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
      )}
      aria-hidden={!shown}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center gap-6 px-4 sm:px-6">
        <p className="shrink-0 truncate text-[15px] font-semibold tracking-[-0.01em]">{name}</p>
        <nav aria-label={`Разделы страницы ${name}`} className="ml-auto hidden items-center gap-5 text-[13px] text-foreground-2 md:flex">
          {links.map((l) => (
            <a key={l.id} href={`#${l.id}`} tabIndex={shown ? 0 : -1} className={cn("transition-colors duration-200 hover:text-foreground", active === l.id && "text-foreground")}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href={orderHref} tabIndex={shown ? 0 : -1} className="ml-auto inline-flex min-h-8 items-center rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-85 md:ml-0">
          Заказать
        </a>
      </div>
    </div>
  );
}
