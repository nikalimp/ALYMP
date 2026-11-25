"use client";
// Сцена технологии (DESIGN.md «Движение», spec §9): весь текст — в HTML; GSAP ScrollTrigger грузится
// динамически только здесь (только /products/*) и не включается при prefers-reduced-motion и на узких экранах.
import { useEffect, useRef } from "react";

type Step = { eyebrow: string; title: string; titleMuted?: string; text: string; zoom?: number; hud?: string[] };

export function StickyTech({ steps, image, alt, credit }: { steps: Step[]; image: string; alt: string; credit?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const hud = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches || innerWidth < 900) return;
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const items = Array.from(el.querySelectorAll<HTMLElement>("[data-step]"));
      ctx = gsap.context(() => {
        items.forEach((item, i) => {
          gsap.set(item, { opacity: i === 0 ? 1 : 0.25 });
          ScrollTrigger.create({
            trigger: item,
            start: "top 55%",
            end: "bottom 45%",
            onToggle: (self) => {
              gsap.to(item, { opacity: self.isActive ? 1 : 0.25, duration: 0.4, ease: "power2.out" });
              if (self.isActive) {
                gsap.to(img.current, { scale: steps[i]?.zoom ?? 1.05, duration: 0.8, ease: "power2.out" });
                if (hud.current) hud.current.textContent = (steps[i]?.hud ?? []).join(" · ");
              }
            },
          });
        });
      }, el);
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [steps]);

  return (
    <div ref={root} className="grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-12">
      <div className="lg:py-[18vh]">
        {steps.map((s) => (
          <article key={s.eyebrow} data-step className="flex flex-col justify-center py-10 lg:min-h-[70vh] lg:py-0">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">{s.eyebrow}</p>
            <h2 className="mt-3 text-[clamp(32px,4.2vw,60px)] font-bold leading-[0.98] tracking-[-0.035em]">
              {s.title} {s.titleMuted && <span className="text-muted-foreground">{s.titleMuted}</span>}
            </h2>
            <p className="mt-4 max-w-md text-lg text-foreground-2">{s.text}</p>
          </article>
        ))}
      </div>
      <div className="order-first lg:order-none">
        <div className="lg:sticky lg:top-14 lg:flex lg:h-[calc(100svh-3.5rem)] lg:items-center">
          <figure className="relative aspect-[4/3] w-full overflow-hidden bg-card">
            <img ref={img} src={image} alt={alt} width={780} height={439} loading="lazy" className="size-full scale-105 object-cover" />
            <div ref={hud} aria-hidden="true" className="absolute right-4 top-4 font-mono text-xs text-brand">{(steps[0]?.hud ?? []).join(" · ")}</div>
            {credit && <figcaption className="absolute bottom-3 left-4 font-mono text-[11px] text-muted-foreground">{credit}</figcaption>}
          </figure>
        </div>
      </div>
    </div>
  );
}
