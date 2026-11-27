// Данные для виджета «пороги и зазор под мебелью»: какие строки характеристик брать для каждой модели.
// Числа читаются из content/products/<slug>.json (официальные данные с источником), здесь — только адреса строк.
import type { Product } from "./products";

type Ref = { label: string; dim?: 2 }; // dim: 2 — взять третье число из «Д × Ш × В»
const MAP: Record<string, { config?: string; height: Ref; single?: Ref; double?: Ref }[]> = {
  "roborock-saros-z70": [{ height: { label: "Робот (Д × Ш × В)", dim: 2 } }],
  "roborock-qrevo-curv-2-flow": [{ height: { label: "Робот (Д × Ш × В)", dim: 2 } }],
  "roborock-saros-10": [{ config: "Saros 10", height: { label: "Высота робота (лидар убран)" }, single: { label: "Высота преодолеваемых препятствий (Saros 10)" } }],
  "dreame-x50-ultra-complete": [{ height: { label: "Размер робота (лидар убран)", dim: 2 }, single: { label: "Одиночный порог" }, double: { label: "Препятствие, две ступени" } }],
  "dreame-l50-ultra": [
    { config: "L50 Ultra AE", height: { label: "L50 Ultra AE · Робот", dim: 2 }, single: { label: "L50 Ultra AE · Высота препятствия" } },
    { config: "L50s Pro Ultra", height: { label: "L50s Pro Ultra · Робот", dim: 2 }, single: { label: "L50s Pro Ultra · Одиночный порог" }, double: { label: "L50s Pro Ultra · Препятствие, две ступени" } },
  ],
};

const num = (s: string) => parseFloat(s.replace(/\s/g, "").replace(",", "."));
function read(p: Product, r?: Ref): number | null {
  if (!r) return null;
  const s = p.specs.find((x) => x.label === r.label);
  if (!s) return null;
  const raw = r.dim !== undefined ? s.value.split("×")[r.dim] : s.value;
  if (!raw) return null;
  const v = num(raw);
  if (Number.isNaN(v)) return null;
  return s.unit === "см" ? v * 10 : v; // всё в миллиметрах
}

export type ClearanceConfig = { config?: string; heightMm: number; singleMm: number | null; doubleMm: number | null };
export function getClearance(p: Product): ClearanceConfig[] {
  return (MAP[p.slug] ?? [])
    .map((m) => ({ config: m.config, heightMm: read(p, m.height), singleMm: read(p, m.single), doubleMm: read(p, m.double) }))
    .flatMap((c) => (c.heightMm === null ? [] : [{ ...c, heightMm: c.heightMm }]));
}
