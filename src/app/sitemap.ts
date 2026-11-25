import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getPosts } from "@/lib/posts";
import { getLandings } from "@/lib/landings";

export const dynamic = "force-static";

// Новая страница = новая строка здесь. Правила (стандарт AI-Ready сайта, §2 «Индексация»):
// - только страницы, открытые для индексации: noindex-страниц и политики конфиденциальности здесь нет;
// - lastmod — только настоящая дата изменения (у статей — updated/date из frontmatter). Дату сборки не ставим:
//   сайт пересобирается при каждом push, и «всё обновилось сегодня» приучает Google игнорировать lastmod.
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts();
  return [
    { url: `${site.url}/`, priority: 1 },
    ...getLandings().map((l) => ({ url: `${site.url}/products/${l.slug}/`, lastModified: Object.values(l.product.sources)[0]?.checkedAt, priority: 0.9 })),
    { url: `${site.url}/about/`, priority: 0.6 },
    { url: `${site.url}/contacts/`, priority: 0.6 },
    ...(site.features.blog && posts.length ? [{ url: `${site.url}/blog/`, lastModified: posts.map((p) => p.updated ?? p.date).sort().at(-1), priority: 0.7 }] : []),
    ...(site.features.blog ? posts : []).map((p) => ({ url: `${site.url}/blog/${p.slug}/`, lastModified: p.updated ?? p.date, priority: 0.7 })),
  ];
}
