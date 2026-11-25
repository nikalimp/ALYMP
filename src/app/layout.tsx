import type { Metadata } from "next";
import "@fontsource/jetbrains-mono/400.css"; // цифры и метки
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";
import { site } from "@/content/site";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CookieBanner } from "@/components/cookie-banner";
import { JsonLd } from "@/components/json-ld";
import { graph, orgSchema, personSchema, websiteSchema } from "@/lib/schema";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: site.locale, siteName: site.name, title: site.title, description: site.description, url: site.url, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  robots: { index: true, follow: true },
};

// Метрика грузится после события load (+1,5 с): не мешает первой отрисовке (LCP). Счётчик и цели работают как прежде.
const metrikaScript = (id: number) =>
  `window.addEventListener('load',function(){setTimeout(function(){(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${id}','ym');ym(${id},'init',{ssr:true,webvisor:true,clickmap:true,referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});},1500)});`;

const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.lang} suppressHydrationWarning>
      <head>
        {/* Шрифт текста — локально из public/fonts, кириллица предзагружается: быстрее первый экран (LCP) */}
        <link rel="preload" href="/fonts/onest-cyrillic-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="" />
        {site.darkTheme && <script dangerouslySetInnerHTML={{ __html: themeScript }} />}
        {site.metrikaId > 0 && <script dangerouslySetInnerHTML={{ __html: metrikaScript(site.metrikaId) }} />}
        <JsonLd data={graph(websiteSchema, orgSchema, personSchema)} />
      </head>
      <body className="flex min-h-screen flex-col">
        {site.metrikaId > 0 && (
          <noscript><div><img src={`https://mc.yandex.ru/watch/${site.metrikaId}`} style={{ position: "absolute", left: "-9999px" }} alt="" /></div></noscript>
        )}
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2">К содержанию</a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
