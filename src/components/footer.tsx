import Link from "next/link";
import { nav, site } from "@/content/site";
import { Container } from "./container";
import { Logo } from "./logo";

// Подвал по центру, все ссылки — одной строкой с переносом (решение Ника 25.11.2026)
export function Footer() {
  const c = site.contacts;
  const links = [
    ...nav,
    { href: "/selector/", label: "Подбор комплекта" },
    { href: "/scenarios/", label: "Сценарии" },
    { href: "/how-to-order/", label: "Как заказать" },
    { href: "/compatibility/", label: "Совместимость" },
    { href: "/brands/", label: "Бренды" },
    { href: "/glossary/", label: "Глоссарий" },
    { href: "/about/", label: "О магазине" },
    { href: "/contacts/", label: "Контакты" },
  ].filter((l, i, a) => a.findIndex((x) => x.href === l.href) === i);
  const contacts = [
    c.phone && { href: `tel:${c.phone}`, label: c.phoneDisplay || c.phone },
    c.email && { href: `mailto:${c.email}`, label: c.email },
    c.telegram && { href: c.telegram, label: "Telegram" },
  ].filter(Boolean) as { href: string; label: string }[];
  // Реквизиты: самозанятый — ИНН без ОГРН; после ИП — ОГРНИП (spec §11)
  const legal = [site.legalName, site.legal.status, `ИНН ${site.legal.inn}`, site.legal.ogrn && `ОГРНИП ${site.legal.ogrn}`].filter(Boolean).join(" · ");
  return (
    <footer className="border-t bg-muted/60 py-12 text-center text-sm text-foreground-2">
      <Container className="flex flex-col items-center gap-6">
        <Logo className="h-3.5 w-auto text-foreground" />
        <p>{site.tagline}. Официальная гарантия в России.</p>
        <nav aria-label="Разделы сайта" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {links.map((n) => <Link key={n.href} href={n.href} className="hover:text-foreground">{n.label}</Link>)}
        </nav>
        <p className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {contacts.map((x) => <a key={x.href} href={x.href} className="hover:text-foreground">{x.label}</a>)}
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 border-t pt-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} {legal}</span>
          <Link href="/privacy-policy/" className="hover:text-foreground">Политика обработки данных</Link>
          <Link href="/consent/" className="hover:text-foreground">Согласие на обработку ПДн</Link>
          {site.metaNote && <span className="w-full">{site.metaNote}</span>}
        </div>
      </Container>
    </footer>
  );
}
