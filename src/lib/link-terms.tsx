import type { ReactNode } from "react";
import Link from "next/link";
import { getGlossaryTerms } from "./glossary";

type PatternEntry = {
  slug: string;
  termName: string;
  alias: string;
  regex: RegExp;
};

let patternCache: PatternEntry[] | null = null;

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getPatterns(): PatternEntry[] {
  if (patternCache) return patternCache;
  const terms = getGlossaryTerms();
  const entries: { slug: string; termName: string; alias: string }[] = [];
  for (const t of terms) {
    for (const a of t.aliases) {
      if (a.trim().length >= 3) entries.push({ slug: t.slug, termName: t.name, alias: a.trim() });
    }
  }
  // Длинные фразы раньше коротких: «Matter over Thread» раньше «Matter» и «Thread»
  entries.sort((a, b) => b.alias.length - a.alias.length);
  patternCache = entries.map((e) => ({
    ...e,
    regex: new RegExp(`(?<![А-Яа-яЁёA-Za-z0-9-])${escapeRegex(e.alias)}(?![А-Яа-яЁёA-Za-z0-9-])`, "i"),
  }));
  return patternCache;
}

/**
 * Превращает первое упоминание каждого термина глоссария в тексте в ссылку на /glossary/<slug>/.
 * Передайте общий Set `used`, чтобы на всей странице каждый термин ссылался ровно один раз.
 */
export function linkTerms(
  text: string,
  options?: { used?: Set<string>; excludeSlug?: string; maxLinks?: number },
): ReactNode[] {
  const used = options?.used ?? new Set<string>();
  const exclude = options?.excludeSlug;
  const maxLinks = options?.maxLinks ?? 12;
  const patterns = getPatterns();

  type Match = { start: number; end: number; slug: string; termName: string; raw: string };
  const matches: Match[] = [];

  for (const p of patterns) {
    if (matches.length >= maxLinks) break;
    if (p.slug === exclude || used.has(p.slug)) continue;
    const m = p.regex.exec(text);
    if (!m || m.index === undefined) continue;
    const start = m.index;
    const end = start + m[0].length;
    if (matches.some((x) => start < x.end && end > x.start)) continue;
    matches.push({ start, end, slug: p.slug, termName: p.termName, raw: m[0] });
    used.add(p.slug);
  }

  if (!matches.length) return [text];
  matches.sort((a, b) => a.start - b.start);

  const nodes: ReactNode[] = [];
  let cursor = 0;
  matches.forEach((m, i) => {
    if (m.start > cursor) nodes.push(text.slice(cursor, m.start));
    nodes.push(
      <Link
        key={`${m.slug}-${i}`}
        href={`/glossary/${m.slug}/`}
        title={`Что такое ${m.termName} — глоссарий ALYMP`}
        className="underline decoration-border-strong underline-offset-4 transition-colors duration-150 hover:text-foreground hover:decoration-foreground"
      >
        {m.raw}
      </Link>,
    );
    cursor = m.end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}
