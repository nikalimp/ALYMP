"use client";
// Пороги и зазор под мебелью: два ползунка, SVG-схема и статус по официальным цифрам модели.
import { useId, useState } from "react";
import type { ClearanceConfig } from "@/lib/clearance";
import { cn } from "@/lib/utils";

const f = (mm: number) => (mm / 10).toLocaleString("ru-RU", { maximumFractionDigits: 1 });

export function ClearanceWidget({ name, configs }: { name: string; configs: ClearanceConfig[] }) {
  const [ci, setCi] = useState(0);
  const [thr, setThr] = useState(20); // мм
  const [gap, setGap] = useState(100); // мм
  const id = useId();
  const c = configs[ci];

  let thrStatus: { ok: boolean | null; text: string };
  if (c.singleMm === null && c.doubleMm === null) thrStatus = { ok: null, text: "Нет официальных данных о высоте порога" };
  else if (c.singleMm !== null && thr <= c.singleMm) thrStatus = { ok: true, text: "Пройдёт" };
  else if (c.doubleMm !== null && thr <= c.doubleMm) thrStatus = { ok: true, text: "Пройдёт, если порог из двух ступеней" };
  else thrStatus = { ok: false, text: "Нужен запас: порог выше паспортного" };
  const margin = gap - c.heightMm;
  const gapStatus = margin >= 5 ? { ok: true, text: "Пройдёт" } : margin >= 0 ? { ok: null, text: "Впритык — нужен запас" } : { ok: false, text: "Не пройдёт под мебель" };

  // SVG-схема: пол, порог слева, мебель справа, силуэт робота
  const W = 640, H = 220, floor = 190, s = 1.3; // 1 мм = 1,3 px
  const robotH = c.heightMm * s, thrH = thr * s, gapH = gap * s;

  return (
    <div className="grid gap-8 lg:grid-cols-[5fr_7fr] lg:items-center">
      <div className="space-y-7">
        {configs.length > 1 && (
          <div role="radiogroup" aria-label="Конфигурация" className="inline-flex rounded-full bg-muted p-1">
            {configs.map((x, i) => (
              <button key={x.config} type="button" role="radio" aria-checked={ci === i} onClick={() => setCi(i)} className={cn("min-h-10 cursor-pointer rounded-full px-4 text-sm font-semibold transition-colors duration-200", ci === i ? "bg-background ring-1 ring-border" : "text-foreground-2 hover:text-foreground")}>
                {x.config}
              </button>
            ))}
          </div>
        )}
        <label className="block" htmlFor={`${id}-t`}>
          <span className="flex items-baseline justify-between text-sm font-medium"><span>Высота вашего порога</span><span className="font-mono tabular">{f(thr)} см</span></span>
          <input id={`${id}-t`} type="range" min={0} max={70} step={1} value={thr} onChange={(e) => setThr(+e.target.value)} className="mt-3 w-full accent-[var(--primary)]" />
          <span className={cn("mt-2 block text-sm", thrStatus.ok === true ? "text-foreground" : thrStatus.ok === false ? "text-warn" : "text-muted-foreground")} aria-live="polite">
            {thrStatus.ok === true ? "✓ " : thrStatus.ok === false ? "! " : ""}{thrStatus.text}
            {c.singleMm !== null && ` · паспорт: ${f(c.singleMm)} см`}{c.doubleMm !== null && ` · две ступени: ${f(c.doubleMm)} см`}
          </span>
        </label>
        <label className="block" htmlFor={`${id}-g`}>
          <span className="flex items-baseline justify-between text-sm font-medium"><span>Зазор под диваном или кроватью</span><span className="font-mono tabular">{f(gap)} см</span></span>
          <input id={`${id}-g`} type="range" min={70} max={130} step={1} value={gap} onChange={(e) => setGap(+e.target.value)} className="mt-3 w-full accent-[var(--primary)]" />
          <span className={cn("mt-2 block text-sm", gapStatus.ok === true ? "text-foreground" : gapStatus.ok === false ? "text-warn" : "text-muted-foreground")} aria-live="polite">
            {gapStatus.ok === true ? "✓ " : gapStatus.ok === false ? "! " : ""}{gapStatus.text} · высота {name}{c.config ? ` (${c.config})` : ""}: {f(c.heightMm)} см
          </span>
        </label>
      </div>

      <figure className="bg-surface p-4 sm:p-6">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Схема: порог ${f(thr)} см, зазор ${f(gap)} см, высота робота ${f(c.heightMm)} см`}>
          <line x1="0" x2={W} y1={floor} y2={floor} stroke="var(--border-strong)" strokeWidth="1.5" />
          {/* порог */}
          <rect x="40" y={floor - thrH} width="70" height={thrH} fill="var(--muted)" stroke="var(--border-strong)" />
          <text x="75" y={floor - thrH - 8} textAnchor="middle" className="fill-muted-foreground font-mono text-[12px]">порог</text>
          {/* робот */}
          <rect x="190" y={floor - robotH} width="190" height={robotH} rx={Math.min(robotH / 2, 18)} fill="var(--foreground)" />
          <circle cx="215" cy={floor - 6} r="6" fill="var(--background)" />
          <circle cx="355" cy={floor - 6} r="6" fill="var(--background)" />
          {/* мебель */}
          <rect x="420" y={floor - gapH - 28} width="200" height="28" fill="var(--muted)" stroke="var(--border-strong)" />
          <line x1="430" x2="430" y1={floor - gapH} y2={floor} stroke="var(--border-strong)" />
          <line x1="610" x2="610" y1={floor - gapH} y2={floor} stroke="var(--border-strong)" />
          <line x1="520" x2="520" y1={floor - gapH} y2={floor} stroke={margin >= 0 ? "var(--foreground)" : "var(--warn)"} strokeDasharray="4 4" />
          <text x="526" y={floor - gapH / 2} className="fill-muted-foreground font-mono text-[12px]">{f(gap)} см</text>
          <text x="285" y={floor - robotH - 8} textAnchor="middle" className="fill-muted-foreground font-mono text-[12px]">{f(c.heightMm)} см</text>
        </svg>
        <figcaption className="mt-2 font-mono text-[11px] text-muted-foreground">Схема в масштабе · цифры — официальные данные производителя</figcaption>
      </figure>
    </div>
  );
}
