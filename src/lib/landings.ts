// Тексты лендингов — content/landings/<slug>.json. Факты и цифры — в content/products/<slug>.json.
// Страница товара собирается, только когда есть оба файла (spec §4.2): без текста лендинг не публикуем.
import fs from "node:fs";
import path from "node:path";
import { getProduct, type Product } from "./products";
import type { Faq } from "@/content/types";

export type Landing = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  tagline: string;
  answer: string;
  hero: { image?: string; alt: string; width?: number; height?: number; dark?: boolean; fit?: "cover" | "contain"; credit?: string; source?: string };
  keyNumbers: { value: string; label: string; src: string }[];
  tech: { eyebrow: string; title: string; titleMuted?: string; text: string; zoom?: number; hud?: string[]; src: string }[];
  versions?: { title: string; lead: string; heads: string[]; rows: { label: string; values: string[] }[]; verdict: string[]; src: string };
  pairs: { title: string; with: string[]; text: string; src?: string }[];
  faq: Faq[];
  related?: { terms?: string[]; compare?: string[] };
};

const DIR = path.join(process.cwd(), "content/landings");

export function getLandings(): (Landing & { product: Product })[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as Landing)
    .map((l) => {
      const product = getProduct(l.slug);
      if (!product) throw new Error(`content/landings/${l.slug}.json: нет content/products/${l.slug}.json`);
      const missing = [...l.keyNumbers, ...l.tech].filter((x) => !product.sources[x.src]);
      if (missing.length) throw new Error(`${l.slug}: источник не найден в products — ${missing.map((m) => m.src).join(", ")}`);
      return { ...l, product };
    });
}

export const getLanding = (slug: string) => getLandings().find((l) => l.slug === slug);

export const categoryLabel: Record<Product["category"], string> = {
  "cleaning-robots": "Уборка",
  "smart-home": "Умный дом",
  robots: "Роботы",
};
