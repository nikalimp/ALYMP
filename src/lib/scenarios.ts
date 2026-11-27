import fs from "node:fs";
import path from "node:path";
import type { Faq } from "@/content/types";

export type ScenarioStep = { trigger: string; action: string };

export type Scenario = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  summary: string;
  body: string[];
  steps: ScenarioStep[];
  productSlugs: string[];
  protocols: string[];
  faq: Faq[];
};

const FILE = path.join(process.cwd(), "content/scenarios/scenarios.json");

let cache: Scenario[] | null = null;

export function getScenarios(): Scenario[] {
  if (cache) return cache;
  if (!fs.existsSync(FILE)) return (cache = []);
  const raw = JSON.parse(fs.readFileSync(FILE, "utf8")) as { scenarios: Scenario[] };
  cache = raw.scenarios ?? [];
  return cache;
}

export function getScenario(slug: string): Scenario | undefined {
  return getScenarios().find((s) => s.slug === slug);
}
