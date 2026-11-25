import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getPosts } from "@/lib/posts";
import { getLandings } from "@/lib/landings";
import { categories } from "@/content/catalog";
import { comparisons } from "@/content/comparisons";
import { brandSlugs } from "@/content/brands";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts();
  return [
    { url: `${site.url}/`, priority: 1 },
    { url: `${site.url}/catalog/`, priority: 0.9 },
    ...Object.keys(categories).map((c) => ({ url: `${site.url}/catalog/${c}/`, priority: 0.85 })),
    ...getLandings().map((l) => ({
      url: `${site.url}/products/${l.slug}/`,
      lastModified: Object.values(l.product.sources)[0]?.checkedAt,
      priority: 0.9,
    })),
    { url: `${site.url}/compatibility/`, priority: 0.9 },
    { url: `${site.url}/compare/`, priority: 0.85 },
    ...comparisons.map((c) => ({ url: `${site.url}/compare/${c.slug}/`, priority: 0.8 })),
    { url: `${site.url}/brands/`, priority: 0.8 },
    ...brandSlugs.map((b) => ({ url: `${site.url}/brands/${b}/`, priority: 0.8 })),
    { url: `${site.url}/about/`, priority: 0.6 },
    { url: `${site.url}/contacts/`, priority: 0.6 },
    ...(site.features.blog && posts.length ? [{ url: `${site.url}/blog/`, lastModified: posts.map((p) => p.updated ?? p.date).sort().at(-1), priority: 0.7 }] : []),
    ...(site.features.blog ? posts : []).map((p) => ({ url: `${site.url}/blog/${p.slug}/`, lastModified: p.updated ?? p.date, priority: 0.7 })),
  ];
}
