import fs from "node:fs";
import path from "node:path";
import { typograf } from "./typograf.mjs";
import { site } from "@/content/site";
import { getGlossaryTerms } from "./glossary";
import type { Faq } from "@/content/types";

export type BlogRubric = "cleaning" | "smart-home" | "robots" | "guides";

export const blogRubrics: Record<BlogRubric, string> = {
  cleaning: "Уборка",
  "smart-home": "Умный дом",
  robots: "Роботы и ИИ",
  guides: "Гайды",
};

// Статьи: content/blog/<slug>.md с frontmatter title, description, date (YYYY-MM-DD), rubric, author, опционально updated.
export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  rubric: BlogRubric;
  author: string;
  faq: Faq[];
  body: string;
};

const dir = path.join(process.cwd(), "content/blog");

function extractFaq(body: string): Faq[] {
  const m = body.match(/##\s+Частые вопросы\s*\n([\s\S]*)$/i);
  if (!m) return [];
  const items: Faq[] = [];
  const blocks = m[1].split(/\n###\s+/).slice(1);
  for (const b of blocks) {
    const lines = b.trim().split("\n");
    const q = lines[0]?.trim();
    const a = lines
      .slice(1)
      .join(" ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .trim();
    if (q && a) items.push({ q: typograf(q), a: typograf(a) });
  }
  return items;
}

function linkTermsInMarkdown(md: string): string {
  const terms = getGlossaryTerms();
  if (!terms.length) return md;
  const entries: { slug: string; alias: string; regex: RegExp }[] = [];
  for (const t of terms) {
    for (const a of t.aliases) {
      if (a.trim().length >= 4) {
        const esc = a.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        entries.push({
          slug: t.slug,
          alias: a.trim(),
          regex: new RegExp(`(?<![А-Яа-яЁёA-Za-z0-9-\\[/])${esc}(?![А-Яа-яЁёA-Za-z0-9-\\]])`, "i"),
        });
      }
    }
  }
  entries.sort((a, b) => b.alias.length - a.alias.length);

  // Отмечаем термины, на которые в тексте уже есть ручные ссылки
  const used = new Set<string>();
  for (const m of md.matchAll(/\/glossary\/([a-z0-9-]+)\//g)) used.add(m[1]);

  let added = 0;
  const lines = md.split("\n").map((line) => {
    // Не трогаем заголовки, таблицы, разделители и строки, уже насыщенные ссылками
    if (/^(#|\||---|\s*$)/.test(line) || added >= 8) return line;
    // Разбиваем строку на фрагменты ссылок и обычный текст
    const parts = line.split(/(\[[^\]]+\]\([^)]+\))/g);
    let changed = false;
    const nextParts = parts.map((part) => {
      if (part.startsWith("[") || added >= 8) return part;
      let chunk = part;
      for (const e of entries) {
        if (used.has(e.slug) || added >= 8) continue;
        const hit = e.regex.exec(chunk);
        if (!hit) continue;
        chunk = `${chunk.slice(0, hit.index)}[${hit[0]}](/glossary/${e.slug}/)${chunk.slice(hit.index + hit[0].length)}`;
        used.add(e.slug);
        added++;
        changed = true;
        break;
      }
      return chunk;
    });
    return changed ? nextParts.join("") : line;
  });
  return lines.join("\n");
}

function parse(file: string): Post {
  const raw = fs.readFileSync(path.join(dir, file), "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`Нет frontmatter: ${file}`);
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"|"$/g, "");
  }
  const rubric = (meta.rubric && meta.rubric in blogRubrics ? meta.rubric : "guides") as BlogRubric;
  const rawBody = m[2].trim();
  const faq = extractFaq(rawBody);
  const linkedBody = linkTermsInMarkdown(rawBody);
  return {
    slug: file.replace(/\.md$/, ""),
    title: typograf(meta.title),
    description: typograf(meta.description),
    date: meta.date,
    updated: meta.updated,
    rubric,
    author: meta.author || "Редакция ALYMP",
    faq,
    body: typograf(linkedBody),
  };
}

export function getPosts(): Post[] {
  if (!site.features.blog || !fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map(parse)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}
