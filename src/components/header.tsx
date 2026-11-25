"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, Search, ShoppingBag, X } from "lucide-react";
import { Container } from "./container";
import { Logo } from "./logo";
import { useCart } from "./cart/cart-context";
import { SearchModal, type CatalogItemSummary } from "./search-modal";

const CATEGORY_META = [
  { id: "cleaning-robots", label: "Автономная уборка", href: "/catalog/cleaning-robots/", desc: "Роботы-пылесосы и мойщики окон" },
  { id: "smart-home", label: "Умный дом", href: "/catalog/smart-home/", desc: "Хабы, панели, замки и датчики Aqara" },
  { id: "robots", label: "Роботы Unitree", href: "/catalog/robots/", desc: "Бионические и гуманоидные роботы" },
] as const;

const EXTRA_LINKS = [
  { href: "/catalog/", label: "Весь каталог" },
  { href: "/compatibility/", label: "Совместимость" },
  { href: "/compare/", label: "Сравнения" },
  { href: "/brands/", label: "Бренды" },
  { href: "/about/", label: "О ALYMP" },
  { href: "/contacts/", label: "Контакты" },
] as const;

export function Header({ products }: { products: CatalogItemSummary[] }) {
  const { totalCount, openCart } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const flagships = products.filter((p) => p.hasLanding);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-lg backdrop-saturate-150">
        <Container className="grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-2">
          {/* Слева: Каталог (dropdown на desktop) и мобильное меню */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={mobileOpen}
              className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-accent md:hidden"
            >
              {mobileOpen ? <X className="size-5" strokeWidth={1.5} /> : <Menu className="size-5" strokeWidth={1.5} />}
            </button>

            <div ref={dropdownRef} className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-accent"
              >
                <span>Каталог</span>
                <ChevronDown
                  className={`size-4 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 top-12 w-[640px] border bg-background p-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">Направления</p>
                      <ul className="mt-3 space-y-1">
                        {CATEGORY_META.map((c) => (
                          <li key={c.id}>
                            <Link
                              href={c.href}
                              onClick={() => setDropdownOpen(false)}
                              className="block rounded-md px-3 py-2.5 transition-colors duration-150 hover:bg-muted"
                            >
                              <span className="block text-sm font-semibold text-foreground">{c.label}</span>
                              <span className="block text-xs text-muted-foreground">{c.desc}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t px-3 pt-4 text-xs text-foreground-2">
                        {EXTRA_LINKS.map((l) => (
                          <Link key={l.href} href={l.href} onClick={() => setDropdownOpen(false)} className="hover:text-foreground">
                            {l.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="border-l pl-6">
                      <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">Флагманы с обзором</p>
                      <ul className="mt-3 space-y-1">
                        {flagships.map((f) => (
                          <li key={f.slug}>
                            <Link
                              href={`/products/${f.slug}/`}
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors duration-150 hover:bg-muted"
                            >
                              <span className="font-medium text-foreground">{f.name}</span>
                              <span className="font-mono text-xs text-muted-foreground">{f.brandLabel}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* По центру: логотип ALYMP */}
          <Link href="/" aria-label="ALYMP — на главную" className="justify-self-center text-foreground">
            <Logo className="h-3.5 w-auto" />
          </Link>

          {/* Справа: поиск и корзина со счётчиком */}
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Поиск по каталогу"
              className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors duration-200 hover:bg-accent"
            >
              <Search className="size-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={openCart}
              aria-label={`Корзина${totalCount > 0 ? `, товаров: ${totalCount}` : ""}`}
              className="relative inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors duration-200 hover:bg-accent"
            >
              <ShoppingBag className="size-5" strokeWidth={1.5} />
              {totalCount > 0 && (
                <span className="absolute right-1 top-1 flex min-w-4.5 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-semibold leading-4 text-primary-foreground tabular">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </Container>

        {/* Мобильное меню */}
        {mobileOpen && (
          <div className="border-t bg-background px-4 pb-8 pt-4 md:hidden">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">Категории</p>
            <ul className="mt-2 divide-y">
              {CATEGORY_META.map((c) => (
                <li key={c.id}>
                  <Link href={c.href} onClick={() => setMobileOpen(false)} className="block py-3.5 text-xl font-semibold tracking-tight">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">Флагманы</p>
            <ul className="mt-2 space-y-2">
              {flagships.map((f) => (
                <li key={f.slug}>
                  <Link href={`/products/${f.slug}/`} onClick={() => setMobileOpen(false)} className="block py-1 text-base font-medium text-foreground-2">
                    {f.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-sm text-foreground-2">
              {EXTRA_LINKS.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>{l.label}</Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} products={products} />
    </>
  );
}
