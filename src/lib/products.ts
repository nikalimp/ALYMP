// Товары ALYMP — content/products/<slug>.json (формат — content/products/_schema.md).
// Сборка падает, если у строки характеристик или факта нет источника (spec §5, «Контент-модель»).
import fs from "node:fs";
import path from "node:path";

export type Src = { url: string; title: string; checkedAt: string };
export type Compat = { v: "yes" | "via-hub" | "no" | "unknown"; src: string | null; note?: string };
export type Product = {
  slug: string;
  brand: "roborock" | "dreame" | "aqara" | "unitree" | "karingbee" | "hobot" | "ecovacs";
  category: "cleaning-robots" | "smart-home" | "robots";
  name: string;
  variants: string[];
  announced?: string;
  sources: Record<string, Src>;
  facts: { text: string; src: string }[];
  specs: { group: string; label: string; value: string; unit?: string; src: string }[];
  compatibility: Record<"alice" | "matter" | "thread" | "zigbee" | "homekit" | "homeAssistant" | "wifi", Compat>;
  inBox: { text: string; src: string }[];
  price: number | null;
  priceEstimate: number | null;
  priceSource: string | null;
  priceDate: string | null;
  status: "in_stock" | "preorder" | "unknown";
  disputes: { label: string; values: string[]; comment?: string }[];
  notes?: string;
};

const DIR = path.join(process.cwd(), "content/products");

function validate(p: Product, file: string) {
  const bad: string[] = [];
  const has = (k: string | null | undefined) => !!k && !!p.sources[k];
  p.facts.forEach((f, i) => !has(f.src) && bad.push(`facts[${i}] «${f.text.slice(0, 40)}» без источника`));
  p.specs.forEach((s, i) => !has(s.src) && bad.push(`specs[${i}] «${s.label}» без источника`));
  p.inBox.forEach((s, i) => !has(s.src) && bad.push(`inBox[${i}] без источника`));
  Object.entries(p.compatibility).forEach(([k, c]) => c.v !== "unknown" && !has(c.src) && bad.push(`compatibility.${k}=${c.v} без источника`));
  if (p.priceEstimate && (!p.priceSource || !p.priceDate)) bad.push("priceEstimate без priceSource и priceDate");
  if (bad.length) throw new Error(`${file}: ${bad.join("; ")}`);
}

let cache: Product[] | null = null;
export function getProducts(): Product[] {
  if (cache) return cache;
  if (!fs.existsSync(DIR)) return (cache = []);
  cache = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const p = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as Product;
      validate(p, f);
      return p;
    });
  return cache;
}

export const getProduct = (slug: string) => getProducts().find((p) => p.slug === slug);
