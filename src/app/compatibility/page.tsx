import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow, Section } from "@/components/container";
import { FaqList } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { getProducts, type Compat } from "@/lib/products";
import { categoryLabel, getLandings } from "@/lib/landings";
import { brandName } from "@/lib/brands";
import { faqSchema, graph } from "@/lib/schema";
import { site } from "@/content/site";
import type { Faq } from "@/content/types";

export const metadata: Metadata = {
  title: "Совместимость с Алисой, Matter, Thread и HomeKit",
  description: "Таблица совместимости всех 17 устройств ALYMP с Яндекс Алисой, Matter, Thread, Zigbee, Apple HomeKit, Home Assistant и Wi-Fi. Проверено по официальным данным.",
  alternates: { canonical: "/compatibility/" },
};

const COLS = [
  { key: "alice", label: "Алиса" },
  { key: "matter", label: "Matter" },
  { key: "thread", label: "Thread" },
  { key: "zigbee", label: "Zigbee" },
  { key: "homekit", label: "HomeKit" },
  { key: "homeAssistant", label: "Home Assistant" },
  { key: "wifi", label: "Wi-Fi" },
] as const;

const badgeText: Record<Compat["v"], string> = {
  yes: "Да",
  "via-hub": "Через хаб",
  no: "Нет",
  unknown: "Нет данных",
};

const SCHEMAS = [
  {
    num: "01",
    title: "Умный дом с Яндекс Алисой",
    chain: "Устройства Aqara → Aqara Hub M3 → Аккаунт Aqara Home → Умный дом с Алисой",
    text: "Роботы-пылесосы Roborock и Dreame (версии RU и Global) подключаются к Алисе напрямую через привязку аккаунта в приложении «Дом с Алисой». Датчики, шторы и свет Aqara объединяются через хаб Aqara Hub M3. Умные замки U200 и U300 Яндекс не поддерживает — для них используйте Apple Home Key или Home Assistant.",
  },
  {
    num: "02",
    title: "Apple Home и Matter over Thread",
    chain: "Замки U200/U300 + Датчик FP400 → Aqara Hub M3 / Apple TV → Приложение «Дом»",
    text: "Стандарт Matter позволяет собрать единый локальный дом без привязки к одному бренду. Хаб M3 выступает Thread Border Router и Matter-контроллером, а роботы-пылесосы Roborock и Dreame добавляются в Apple Home напрямую по Matter over Wi-Fi (требуется iOS 18.4+ и домашний центр Apple).",
  },
  {
    num: "03",
    title: "Локальный Home Assistant без облака",
    chain: "Zigbee / Thread устройства → Matter Bridge (Hub M3) или ZHA → Home Assistant",
    text: "Если нужна полная автономность без зависимости от внешних серверов, подключайте хаб Aqara Hub M3 через Matter Bridge или HomeKit Device, а роботы Roborock и Dreame — через официальную интеграцию Roborock, Matter или локальный плагин HACS. Сценарии выполняются внутри домашней сети за доли секунды.",
  },
];

const FAQ: Faq[] = [
  {
    q: "Почему умные замки Aqara U200 и U300 не работают с Яндекс Алисой?",
    a: "По официальной справке Яндекса, среди замков Aqara в «Умном доме с Алисой» поддерживаются только модели A100, D100 и D200. Замки U-серии с протоколом Matter over Thread работают с Apple Home, Apple Home Key и Home Assistant, но не с Алисой.",
  },
  {
    q: "Обязательно ли покупать Aqara Hub M3, если дома уже есть Яндекс Станция?",
    a: "Для замков U200/U300, датчика FP400 и полного набора функций Aqara хаб M3 нужен как Thread Border Router и Matter-контроллер. Яндекс Станция с Zigbee закрывает только базовые датчики Zigbee и не заменяет полноценный контроллер Aqara.",
  },
  {
    q: "Как подключить робот-пылесос Roborock или Dreame к Apple Home?",
    a: "Начиная с iOS 18.4, Apple Home нативно поддерживает роботы-пылесосы по стандарту Matter. Достаточно обновить прошивку пылесоса, сгенерировать код Matter в приложении Roborock или Dreamehome и добавить устройство в приложение «Дом».",
  },
  {
    q: "Можно ли подключить роботов Unitree Go2 и G1 к умному дому?",
    a: "Нет. Unitree Go2 и G1 — самостоятельные робототехнические платформы с Wi-Fi 6 и Bluetooth. Они не поддерживают протоколы Matter, Thread, Zigbee, Apple HomeKit и Яндекс Алису.",
  },
  {
    q: "Что означает статус «Нет данных» в таблице?",
    a: "Мы не додумываем совместимость: если производитель не указал поддержку протокола на официальной странице или в справке Яндекса, ячейка остаётся со статусом «Нет данных» до официального подтверждения.",
  },
];

export default function CompatibilityPage() {
  const products = getProducts();
  const readySlugs = new Set(getLandings().map((l) => l.slug));

  const datasetSchema = {
    "@type": "Dataset",
    name: "Матрица совместимости устройств ALYMP с Алисой, Matter, Thread, Zigbee, HomeKit и Home Assistant",
    description: "Проверенные по официальным источникам данные о поддержке протоколов умного дома для 17 устройств каталога ALYMP.",
    url: `${site.url}/compatibility/`,
    dateModified: "2026-11-25",
    creator: { "@id": `${site.url}/#org` },
  };

  return (
    <>
      <JsonLd data={graph(datasetSchema, faqSchema(FAQ))} />

      <Section className="border-b pb-12 pt-14">
        <Container>
          <Eyebrow>Матрица протоколов · Проверено 25.11.2026</Eyebrow>
          <h1 className="mt-3 text-[clamp(36px,5.5vw,76px)] font-bold leading-[0.95] tracking-[-0.04em]">
            Совместимость. <span className="text-muted-foreground">Алиса, Matter, Thread, HomeKit.</span>
          </h1>
          <p className="mt-6 max-w-4xl text-xl leading-relaxed text-foreground-2">
            Таблица показывает, с какими экосистемами и протоколами работает каждое из 17 устройств каталога ALYMP. Каждое «Да», «Через хаб» и «Нет» подкреплено ссылкой на официальную страницу производителя, справку Яндекса или документацию Home Assistant.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="overflow-x-auto border">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-2 border-foreground bg-muted/60">
                  <th scope="col" className="px-4 py-3.5 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">Устройство</th>
                  {COLS.map((c) => (
                    <th key={c.key} scope="col" className="px-3 py-3.5 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => {
                  const hasLanding = readySlugs.has(p.slug);
                  return (
                    <tr key={p.slug} className="bg-background hover:bg-muted/30">
                      <th scope="row" className="px-4 py-3.5 font-medium">
                        <span className="block font-mono text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
                          {brandName[p.brand] ?? p.brand} · {categoryLabel[p.category]}
                        </span>
                        {hasLanding ? (
                          <Link href={`/products/${p.slug}/`} className="font-semibold hover:underline underline-offset-4">
                            {p.name}
                          </Link>
                        ) : (
                          <span className="font-semibold">{p.name}</span>
                        )}
                      </th>
                      {COLS.map((c) => {
                        const cell = p.compatibility[c.key];
                        const src = cell.src ? p.sources[cell.src] : null;
                        return (
                          <td key={c.key} className="px-3 py-3.5 align-top">
                            <span
                              className={
                                cell.v === "yes"
                                  ? "inline-flex items-center gap-1.5 font-medium text-foreground"
                                  : cell.v === "via-hub"
                                    ? "inline-flex items-center gap-1.5 font-medium text-brand"
                                    : "text-muted-foreground"
                              }
                            >
                              {cell.v === "yes" && <i aria-hidden="true" className="size-1.5 rounded-full bg-ok" />}
                              {cell.v === "via-hub" && <i aria-hidden="true" className="size-1.5 rounded-full bg-warn" />}
                              {badgeText[cell.v]}
                            </span>
                            {src && (
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noopener nofollow"
                                className="mt-1 block font-mono text-[10px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
                              >
                                источник
                              </a>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            Дата последней проверки: 25.11.2026. Обозначения: «Да» — прямая или нативная поддержка, «Через хаб» — нужен контроллер (например, Aqara Hub M3 или Thread Border Router), «Нет данных» — официального подтверждения нет.
          </p>
        </Container>
      </Section>

      <Section className="border-t bg-muted/40">
        <Container>
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold leading-none tracking-[-0.03em]">Три рабочие схемы подключения</h2>
          <div className="mt-10 grid gap-px bg-border lg:grid-cols-3">
            {SCHEMAS.map((s) => (
              <article key={s.num} className="flex flex-col justify-between bg-background p-7">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{s.num}</p>
                  <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-3 bg-muted p-3 font-mono text-xs leading-relaxed text-foreground">{s.chain}</p>
                  <p className="mt-4 text-sm leading-relaxed text-foreground-2">{s.text}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold leading-none tracking-[-0.03em]">Вопросы об Алисе и Matter</h2>
          <FaqList items={FAQ} />
        </Container>
      </Section>
    </>
  );
}
