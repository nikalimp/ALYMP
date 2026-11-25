import fs from "node:fs";
import path from "node:path";
import { site } from "@/content/site";

export type NewsItem = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  brand: string;
  sourceName: string;
  sourceUrl: string;
  summary: string;
  body: string[];
  forRussia: string;
  relatedProducts?: string[];
};

const DIR = path.join(process.cwd(), "content/news");

export function getNews(): NewsItem[] {
  if (!site.features.news || !fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as NewsItem)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function getNewsItem(slug: string): NewsItem | undefined {
  return getNews().find((n) => n.slug === slug);
}

export function formatNewsDate(d: string) {
  return new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}
