import Link from "next/link";
import { Menu, X } from "lucide-react";
import { nav, site } from "@/content/site";
import { Container } from "./container";
import { Logo } from "./logo";

// Мобильное меню на <details>: открывается без JavaScript, ссылки — обычные <a>.
function MobileMenu() {
  return (
    <details className="group/m md:hidden">
      <summary aria-label="Открыть меню" className="inline-flex size-11 cursor-pointer list-none items-center justify-center rounded-full hover:bg-accent [&::-webkit-details-marker]:hidden">
        <Menu className="size-5 group-open/m:hidden" strokeWidth={1.5} />
        <X className="hidden size-5 group-open/m:block" strokeWidth={1.5} />
      </summary>
      <div className="absolute inset-x-0 top-14 h-[calc(100dvh-3.5rem)] overflow-y-auto bg-background px-4 pb-8 pt-4">
        <ul>
          {nav.map((n) => (
            <li key={n.href} className="border-b"><a href={n.href} className="block py-4 text-2xl font-semibold tracking-tight">{n.label}</a></li>
          ))}
        </ul>
        <a href={site.cta.href} className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-6 font-semibold text-primary-foreground">{site.cta.label}</a>
      </div>
    </details>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg backdrop-saturate-150">
      <Container className="flex h-14 items-center gap-8">
        <Link href="/" aria-label="ALYMP — на главную" className="shrink-0 text-foreground"><Logo className="h-3.5 w-auto" /></Link>
        <nav aria-label="Основное меню" className="hidden flex-1 items-center gap-6 text-sm text-foreground-2 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="transition-colors duration-200 hover:text-foreground">{n.label}</Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <a href={site.cta.href} className="hidden min-h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-85 sm:inline-flex">{site.cta.label}</a>
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}
