"use client";
// Главы технологий — интерактивная презентация (DESIGN.md «Движение», spec §9).
// Весь текст в HTML. Десктоп: закреплённый кадр, главы переключает прокрутка (GSAP ScrollTrigger, динамический
// импорт, только /products/*) и клик по шкале глав. Мобильный: вкладки глав. Без анимаций при prefers-reduced-motion.
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Step = { eyebrow: string; title: string; titleMuted?: string; text: string; zoom?: number; hud?: string[] };

const label = (s: Step) => s.eyebrow.replace(/^\d+\s*·\s*/, "");

export function StickyTech({
  steps,
  image,
  alt,
  credit,
  width,
  height,
  fit = "cover",
}: {
  steps: Step[];
  image?: string;
  alt: string;
  credit?: string;
  width?: number;
  height?: number;
  fit?: "cover" | "contain";
}) {
  const root = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [enhanced, setEnhanced] = useState(false); // мобильные вкладки включаются только с JS

  useEffect(() => setEnhanced(true), []);

  useEffect(() => {
    const el = root.current;
    if (!el || innerWidth < 1024) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const items = Array.from(el.querySelectorAll<HTMLElement>("[data-step]"));
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 60%",
          end: "bottom 60%",
          onUpdate: (self) => setProgress(self.progress),
        });
        items.forEach((item, i) => {
          ScrollTrigger.create({
            trigger: item,
            start: "top 55%",
            end: "bottom 45%",
            onToggle: (self) => {
              if (!self.isActive) return;
              setActive(i);
              if (img.current && !reduce) gsap.to(img.current, { scale: steps[i]?.zoom ?? 1.04, duration: 0.8, ease: "power2.out" });
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

  const go = useCallback((i: number) => {
    setActive(i);
    if (innerWidth >= 1024) {
      const t = root.current?.querySelectorAll<HTMLElement>("[data-step]")[i];
      t?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    }
  }, []);

  const cur = steps[active] ?? steps[0];

  return (
    <div ref={root} className="grid gap-8 lg:grid-cols-[5fr_7fr] lg:gap-12">
      {/* Мобильные вкладки глав */}
      {enhanced && (
        <div role="tablist" aria-label="Главы технологий" className="-mx-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
          {steps.map((s, i) => (
            <button
              key={s.eyebrow}
              role="tab"
              type="button"
              aria-selected={active === i}
              onClick={() => go(i)}
              className={cn(
                "min-h-10 shrink-0 cursor-pointer rounded-full px-4 text-sm font-semibold transition-colors duration-200",
                active === i ? "bg-foreground text-background" : "bg-muted text-foreground-2",
              )}
            >
              <span className="font-mono text-xs opacity-60">{String(i + 1).padStart(2, "0")}</span> {label(s)}
            </button>
          ))}
        </div>
      )}

      <div className="lg:py-[16vh]">
        {steps.map((s, i) => (
          <article
            key={s.eyebrow}
            data-step
            className={cn(
              "flex-col justify-center py-6 transition-opacity duration-500 ease-out lg:flex lg:min-h-[68vh] lg:py-0",
              enhanced && active !== i ? "hidden lg:flex lg:opacity-30" : "flex",
            )}
          >
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">{s.eyebrow}</p>
            <h2 className="mt-3 text-[clamp(32px,4.2vw,60px)] font-bold leading-[0.98] tracking-[-0.035em]">
              {s.title} {s.titleMuted && <span className="text-muted-foreground">{s.titleMuted}</span>}
            </h2>
            <p className="mt-4 max-w-md text-lg text-foreground-2">{s.text}</p>
            {s.hud && s.hud.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Ключевые параметры главы">
                {s.hud.map((h) => (
                  <li key={h} className="rounded-full border px-3 py-1 font-mono text-xs tabular text-foreground-2">{h}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>

      <div className="order-first lg:order-none">
        <div className="lg:sticky lg:top-[6.5rem] lg:flex lg:h-[calc(100svh-7rem)] lg:flex-col lg:justify-center">
          <figure className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-surface">
            {image ? (
              <img
                ref={img}
                src={image}
                alt={alt}
                width={width ?? 780}
                height={height ?? 439}
                loading="lazy"
                className={fit === "contain" ? "size-full object-contain p-8" : "size-full scale-[1.04] object-cover"}
              />
            ) : (
              <div className="flex size-full flex-col justify-between p-8 sm:p-10">
                <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">{cur?.eyebrow}</span>
                <p className="font-mono text-[clamp(28px,4vw,48px)] font-semibold leading-tight tracking-[-0.03em] tabular">{(cur?.hud ?? []).join(" · ")}</p>
                <span className="font-mono text-xs text-muted-foreground">Официальные спецификации бренда</span>
              </div>
            )}
            <div aria-hidden="true" className="absolute left-4 top-4 font-mono text-xs text-muted-foreground tabular">
              {String(active + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
            </div>
            {credit && <figcaption className="absolute bottom-3 left-4 font-mono text-[11px] text-muted-foreground">{credit}</figcaption>}
          </figure>

          {/* Шкала глав: прогресс прокрутки + кликабельные шаги (десктоп) */}
          <div className="mt-5 hidden lg:block">
            <div className="relative h-px bg-border" aria-hidden="true">
              <div className="absolute inset-y-0 left-0 w-full origin-left bg-foreground transition-transform duration-150 ease-out" style={{ transform: `scaleX(${progress})` }} />
            </div>
            <ol className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
              {steps.map((s, i) => (
                <li key={s.eyebrow}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={active === i ? "step" : undefined}
                    className={cn("w-full cursor-pointer text-left text-sm transition-colors duration-200", active === i ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
                  >
                    <span className="block font-mono text-xs tabular">{String(i + 1).padStart(2, "0")}</span>
                    <span className="mt-0.5 block truncate font-medium">{label(s)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
