import Link from "next/link";
import { nav, site } from "@/content/site";
import { Container } from "./container";
import { Logo } from "./logo";

export function Footer() {
  const c = site.contacts;
  const contacts = [
    c.phone && { href: `tel:${c.phone}`, label: c.phoneDisplay || c.phone },
    c.email && { href: `mailto:${c.email}`, label: c.email },
    c.telegram && { href: c.telegram, label: "Telegram" },
  ].filter(Boolean) as { href: string; label: string }[];
  // Реквизиты: самозанятый — ИНН без ОГРН; после ИП — ОГРНИП (spec §11)
  const legal = [site.legalName, site.legal.status, `ИНН ${site.legal.inn}`, site.legal.ogrn && `ОГРНИП ${site.legal.ogrn}`].filter(Boolean).join(" · ");
  return (
    <footer className="border-t bg-muted/60 py-14 text-sm text-foreground-2">
      <Container className="grid gap-10 sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Logo className="h-3.5 w-auto text-foreground" />
          <p className="mt-4 max-w-xs">{site.tagline}. Официальная гарантия в России.</p>
        </div>
        <div>
          <p className="mb-3 font-medium text-foreground">Разделы</p>
          <ul className="space-y-2">
            {nav.map((n) => (
              <li key={n.href}><Link href={n.href} className="hover:text-foreground">{n.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 font-medium text-foreground">Связаться</p>
          <ul className="space-y-2">
            {contacts.map((x) => (
              <li key={x.href}><a href={x.href} className="hover:text-foreground">{x.label}</a></li>
            ))}
            <li><Link href="/contacts/" className="hover:text-foreground">Все контакты</Link></li>
          </ul>
        </div>
      </Container>
      <Container className="mt-12 flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:justify-between">
        <span>© {new Date().getFullYear()} {legal}</span>
        <span className="flex gap-4">
          <Link href="/privacy-policy/" className="hover:text-foreground">Политика обработки данных</Link>
          <Link href="/consent/" className="hover:text-foreground">Согласие на обработку ПДн</Link>
        </span>
        {site.metaNote && <span className="w-full">{site.metaNote}</span>}
      </Container>
    </footer>
  );
}
