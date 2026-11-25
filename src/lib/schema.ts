// JSON-LD по стандарту AI-Ready сайта, §5. Один @graph на страницу, сущности связаны через @id.
import { site } from "@/content/site";
import type { Faq } from "@/content/types";

export const orgId = `${site.url}/#org`;
export const websiteId = `${site.url}/#website`;
export const personId = `${site.url}/#person`;

const c = site.contacts;

export const orgSchema: Record<string, unknown> = {
  "@type": site.orgType,
  "@id": orgId,
  name: site.name,
  legalName: site.legalName,
  url: site.url,
  description: site.description,
  ...(site.foundingYear && { foundingDate: String(site.foundingYear) }),
  logo: `${site.url}/logos/alymp.svg`,
  areaServed: site.areaServed,
  ...(site.sameAs.length && { sameAs: site.sameAs }),
  ...(c.phone && { telephone: c.phone }),
  ...(c.email && { email: c.email }),
  ...(c.address.street && {
    address: { "@type": "PostalAddress", streetAddress: c.address.street, addressLocality: c.address.city, addressRegion: c.address.region, postalCode: c.address.postalCode, addressCountry: c.address.country },
  }),
  ...(c.geo && { geo: { "@type": "GeoCoordinates", latitude: c.geo.lat, longitude: c.geo.lng } }),
  ...(c.openingHours.length && {
    openingHoursSpecification: c.openingHours.map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: h.days, opens: h.opens, closes: h.closes })),
  }),
  ...(site.person && { founder: { "@id": personId } }),
};

export const personSchema: Record<string, unknown> | null = site.person && {
  "@type": "Person",
  "@id": personId,
  name: site.person.name,
  jobTitle: site.person.jobTitle,
  description: site.person.description,
  worksFor: { "@id": orgId },
  url: `${site.url}/about/`,
  ...(site.person.sameAs.length && { sameAs: site.person.sameAs }),
};

export const websiteSchema = { "@type": "WebSite", "@id": websiteId, url: site.url, name: site.name, inLanguage: "ru-RU", publisher: { "@id": orgId } };

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${site.url}${it.path}` })),
  };
}

export function faqSchema(faq: Faq[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function howToSchema(h: { name: string; description: string; steps: { title: string; text: string }[] }) {
  return {
    "@type": "HowTo",
    name: h.name,
    description: h.description,
    step: h.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.text,
    })),
  };
}

export function articleSchema(p: { slug: string; title: string; description: string; date: string; updated?: string }) {
  return {
    "@type": "BlogPosting",
    headline: p.title,
    description: p.description,
    url: `${site.url}/blog/${p.slug}/`,
    datePublished: p.date,
    dateModified: p.updated ?? p.date,
    inLanguage: "ru-RU",
    author: site.person ? { "@id": personId } : { "@id": orgId },
    publisher: { "@id": orgId },
    mainEntityOfPage: `${site.url}/blog/${p.slug}/`,
  };
}

export function graph(...nodes: (Record<string, unknown> | null | false | undefined)[]) {
  return { "@context": "https://schema.org", "@graph": nodes.filter(Boolean) };
}

export function itemListSchema(name: string, items: { name: string; url: string }[]) {
  return {
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: it.url.startsWith("http") ? it.url : `${site.url}${it.url}`,
    })),
  };
}

export function brandSchema(b: { slug: string; name: string; description: string; url: string }) {
  return {
    "@type": "Brand",
    "@id": `${site.url}/brands/${b.slug}/#brand`,
    name: b.name,
    description: b.description,
    url: `${site.url}/brands/${b.slug}/`,
    sameAs: [b.url],
  };
}

export const glossarySetId = `${site.url}/glossary/#set`;

export function definedTermSetSchema(name: string, description: string, terms: { slug: string; name: string; definition: string }[]) {
  return {
    "@type": "DefinedTermSet",
    "@id": glossarySetId,
    name,
    description,
    url: `${site.url}/glossary/`,
    inLanguage: "ru-RU",
    hasDefinedTerm: terms.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `${site.url}/glossary/${t.slug}/#term`,
      name: t.name,
      description: t.definition,
      url: `${site.url}/glossary/${t.slug}/`,
    })),
  };
}

export function definedTermSchema(t: { slug: string; name: string; englishName: string; definition: string }) {
  return {
    "@type": "DefinedTerm",
    "@id": `${site.url}/glossary/${t.slug}/#term`,
    name: t.name,
    alternateName: t.englishName,
    description: t.definition,
    url: `${site.url}/glossary/${t.slug}/`,
    inLanguage: "ru-RU",
    inDefinedTermSet: { "@id": glossarySetId },
  };
}

// Товар (spec §4.2): Offer — только с ценой из прайса дистрибьютора. Ориентир «от» в Offer не идёт (spec §9).
export function productSchema(p: { slug: string; name: string; brand: string; description: string; image: string; price: number | null; specs?: { label: string; value: string; unit?: string }[] }) {
  const url = `${site.url}/products/${p.slug}/`;
  return {
    "@type": "Product",
    "@id": `${url}#product`,
    name: p.name,
    url,
    description: p.description,
    image: `${site.url}${p.image}`,
    brand: { "@type": "Brand", name: p.brand },
    ...(p.specs && { additionalProperty: p.specs.map((s) => ({ "@type": "PropertyValue", name: s.label, value: [s.value, s.unit].filter(Boolean).join(" ") })) }),
    ...(p.price && { offers: { "@type": "Offer", price: String(p.price), priceCurrency: "RUB", availability: "https://schema.org/PreOrder", url, seller: { "@id": orgId } } }),
  };
}
