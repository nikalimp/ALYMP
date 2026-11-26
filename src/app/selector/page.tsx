import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import { getLanding } from "@/lib/landings";
import { brandName } from "@/lib/brands";
import { faqSchema, graph } from "@/lib/schema";
import { Container, Eyebrow, Section } from "@/components/container";
import { FaqList } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { Selector, type SelectorProduct } from "@/components/selector/selector";

export const metadata: Metadata = {
  title: "Подбор комплекта умного дома и робота-пылесоса",
  description: "Ответьте на 4 вопроса — соберём совместимый комплект: робот-пылесос, хаб Aqara, датчик присутствия и умный замок. Ориентир суммы и заказ в один клик.",
  alternates: { canonical: "/selector/" },
};

const faq = [
  { q: "Как работает подбор комплекта?", a: "Вы отвечаете на четыре вопроса: площадь жилья, пороги, животные и экосистема. По ответам мы собираем связку из моделей каталога ALYMP, которые работают вместе через хаб Aqara Hub M3." },
  { q: "Откуда цены в комплекте?", a: "Это ориентиры из карточек товаров: официальные магазины брендов в России или крупные магазины, с датой проверки. Точную сумму, наличие и срок поставки менеджер подтвердит до оплаты." },
  { q: "Работает ли комплект с Алисой?", a: "У каждого устройства в комплекте показано, работает ли оно с Алисой или Apple Home, по данным производителя. Если связи нет, мы так и пишем — например, у умных замков Aqara нет прямой интеграции с Алисой." },
  { q: "Можно ли заменить модель в комплекте?", a: "Да. Добавьте комплект в корзину и напишите в комментарии, что заменить. Менеджер предложит совместимую модель из каталога." },
];

export default function SelectorPage() {
  const products: SelectorProduct[] = getProducts().map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: brandName[p.brand] ?? p.brand,
    tagline: getLanding(p.slug)?.tagline ?? p.facts[0]?.text ?? "",
    price: p.priceEstimate,
    image: p.media?.card,
    alice: p.compatibility.alice?.v ?? "unknown",
    homekit: p.compatibility.homekit?.v ?? "unknown",
  }));
  return (
    <>
      <JsonLd data={graph(faqSchema(faq))} />
      <Section className="pb-10 pt-12 sm:pt-16">
        <Container>
          <Eyebrow>Подбор комплекта</Eyebrow>
          <h1 className="max-w-4xl text-[clamp(40px,6vw,80px)] font-bold leading-[0.95] tracking-[-0.04em]">Соберите дом, который работает сам</h1>
          <p className="mt-6 max-w-3xl text-xl text-foreground-2">
            Подбор комплекта ALYMP — четыре вопроса о вашем доме. В ответ — связка из моделей каталога: робот-пылесос под ваши пороги, хаб Aqara Hub M3, датчик присутствия и умный замок. Для каждой модели видно, работает ли она с Алисой или Apple Home, и ориентир суммы. Комплект добавляется в корзину одной кнопкой.
          </p>
        </Container>
      </Section>
      <Section className="pt-0">
        <Container>
          <Selector products={products} />
        </Container>
      </Section>
      <Section className="border-t">
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-[clamp(32px,4vw,52px)] font-bold leading-none tracking-[-0.03em]">Как мы подбираем</h2>
          <div className="space-y-4 text-lg text-foreground-2">
            <p>Робот-пылесос выбираем по порогам и площади. Высокие и двойные пороги берёт Dreame X50 Ultra Complete: опоры ProLeap поднимают его на две ступени до 60 мм. Для небольшой квартиры подходит Dreame L50 Ultra, для большой — Roborock Saros Z70 или Qrevo Curv 2 Flow.</p>
            <p>Центр комплекта — Aqara Hub M3: он связывает датчик присутствия FP400 и замок по Thread и Zigbee и передаёт их в Apple Home и другие системы через Matter. Для дома добавляем робот-мойщик окон HOBOT SP10.</p>
          </div>
        </Container>
      </Section>
      <Section className="pt-0">
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-[clamp(32px,4vw,52px)] font-bold leading-none tracking-[-0.03em]">Вопросы</h2>
          <FaqList items={faq} size="lg" />
        </Container>
      </Section>
    </>
  );
}
