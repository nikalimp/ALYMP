import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, Eyebrow, Section } from "@/components/container";
import { FaqList } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { brandProfiles, brandSlugs } from "@/content/brands";
import { getProducts } from "@/lib/products";
import { faqSchema, graph, itemListSchema } from "@/lib/schema";
import type { Faq } from "@/content/types";

const BRANDS_FAQ: Faq[] = [
  {
    q: "Почему в каталоге ALYMP представлены именно эти производители?",
    a: "Мы отбираем бренды, которые лидируют в своих сегментах в 2025⁠–⁠2026 годах и поддерживают открытые стандарты умного дома (Matter, Thread, Zigbee 3.0) либо выпускают серийные робототехнические платформы с понятной поддержкой.",
  },
  {
    q: "Чем официальные RU/Global версии отличаются от китайских?",
    a: "Для роботов-пылесосов Roborock и Dreame и хабов Aqara глобальные и российские версии работают в приложении на регионе Россия без региональных блокировок и официально подключаются к «Умному дому с Алисой».",
  },
  {
    q: "Где посмотреть совместимость всех брендов между собой?",
    a: "На странице матрицы совместимости собраны все 17 устройств каталога с проверкой поддержки Алисы, Matter, Thread, Zigbee, Apple HomeKit и Home Assistant и ссылками на официальные источники.",
  },
];

export const metadata: Metadata = {
  title: "Бренды ALYMP: Roborock, Dreame, Aqara, Unitree",
  description: "5 ключевых производителей каталога ALYMP: Roborock, Dreame, Aqara, Unitree Robotics и KaringBee. Официальные факты, технологии и устройства в России.",
  alternates: { canonical: "/brands/" },
};

export default function BrandsPage() {
  const products = getProducts();
  const list = brandSlugs.map((slug) => ({
    name: brandProfiles[slug].name,
    url: `/brands/${slug}/`,
  }));

  return (
    <>
      <JsonLd data={graph(itemListSchema("Бренды ALYMP", list), faqSchema(BRANDS_FAQ))} />

      <Section className="border-b pb-12 pt-14">
        <Container>
          <Eyebrow>Производители · 5 профилей</Eyebrow>
          <h1 className="mt-3 text-[clamp(40px,6vw,84px)] font-bold leading-[0.94] tracking-[-0.04em]">Бренды ALYMP</h1>
          <p className="mt-6 max-w-4xl text-xl leading-relaxed text-foreground-2">
            В каталоге ALYMP представлены производители, которые задают стандарты в домашней робототехнике и умном доме: Roborock, Dreame, Aqara, Unitree Robotics и KaringBee (а также флагманские мойщики окон Ecovacs и HOBOT). На странице каждого бренда собраны проверенные факты с официальных сайтов, ключевые технологии и список доступных моделей.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {brandSlugs.map((slug) => {
              const b = brandProfiles[slug];
              const count = products.filter((p) => p.brand === slug).length;
              return (
                <article key={slug} className="flex flex-col justify-between bg-card p-7">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
                      {b.country} · {count} {count === 1 ? "модель" : count < 5 ? "модели" : "моделей"}
                    </p>
                    <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em]">
                      <Link href={`/brands/${slug}/`} className="hover:underline underline-offset-4">
                        {b.name}
                      </Link>
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-foreground-2">{b.short}</p>
                  </div>
                  <div className="mt-6 border-t pt-4">
                    <Link href={`/brands/${slug}/`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                      <span>Страница бренда</span>
                      <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section className="border-t bg-muted/40">
        <Container className="max-w-4xl">
          <h2 className="text-[clamp(26px,3.6vw,40px)] font-bold leading-tight tracking-[-0.03em]">Как мы работаем с брендами</h2>
          <p className="mt-4 text-foreground-2">
            Все характеристики устройств на страницах ALYMP сверяются с глобальными и региональными сайтами производителей. Если официальные данные отсутствуют или противоречат друг другу, мы прямо указываем это в карточке товара и не копируем неподтверждённые цифры из сторонних обзоров.
          </p>
          <p className="mt-3 text-foreground-2">
            В дополнение к пяти основным профилям в разделе автономной уборки доступны два флагманских мойщика окон — Ecovacs WINBOT W3 OMNI и HOBOT SP10, которые также участвуют в общей матрице совместимости и доступны к заказу через корзину.
          </p>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-[clamp(26px,3.6vw,40px)] font-bold leading-none tracking-[-0.03em]">Вопросы о брендах</h2>
          <FaqList items={BRANDS_FAQ} />
        </Container>
      </Section>
    </>
  );
}
