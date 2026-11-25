import fs from "node:fs";
import path from "node:path";
import type { Faq } from "@/content/types";

export type GlossaryCategory =
  | "protocols"
  | "automation-locks"
  | "sensors-navigation"
  | "cleaning-robotics";

export const glossaryCategories: Record<
  GlossaryCategory,
  { id: GlossaryCategory; label: string; shortLabel: string; description: string }
> = {
  protocols: {
    id: "protocols",
    label: "Протоколы и связь",
    shortLabel: "Протоколы",
    description: "Стандарты Matter, Thread, Zigbee, Wi-Fi, Bluetooth LE, хабы и экосистемы управления.",
  },
  "automation-locks": {
    id: "automation-locks",
    label: "Питание, сценарии и замки",
    shortLabel: "Сценарии и замки",
    description: "PoE, локальная и облачная автоматизация, сцены, настенные панели и умные дверные замки.",
  },
  "sensors-navigation": {
    id: "sensors-navigation",
    label: "Датчики и навигация",
    shortLabel: "Датчики и навигация",
    description: "Радары присутствия mmWave, PIR, LiDAR, SLAM, карты помещений и зоны запрета.",
  },
  "cleaning-robotics": {
    id: "cleaning-robotics",
    label: "Уборка и робототехника",
    shortLabel: "Уборка и роботы",
    description: "Паскали всасывания, станции самоочистки, преодоление порогов, манипуляторы и степени свободы.",
  },
};

export type GlossaryTerm = {
  slug: string;
  category: GlossaryCategory;
  name: string;
  englishName: string;
  shortDecryption: string;
  title: string;
  description: string;
  definition: string;
  howItWorks: string;
  history: string;
  compareWith: { slug: string; name: string; text: string };
  homonym?: { other: string; text: string };
  products: string[];
  aliases: string[];
  faq: Faq[];
};

const DIR = path.join(process.cwd(), "content/glossary");

let cache: GlossaryTerm[] | null = null;

export function getGlossaryTerms(): GlossaryTerm[] {
  if (cache) return cache;
  if (!fs.existsSync(DIR)) return (cache = []);
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".json")).sort();
  const terms: GlossaryTerm[] = [];
  const seen = new Set<string>();
  for (const f of files) {
    const list = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as GlossaryTerm[];
    for (const t of list) {
      if (seen.has(t.slug)) throw new Error(`Дубликат slug в глоссарии: ${t.slug}`);
      seen.add(t.slug);
      terms.push(t);
    }
  }
  cache = terms;
  return cache;
}

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return getGlossaryTerms().find((t) => t.slug === slug);
}
