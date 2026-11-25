// llms.txt и llms-full.txt (https://llmstxt.org) — генерируются из того же контента, что и страницы.
import { site } from "@/content/site";
import { about, home } from "@/content/home";
import { getPosts } from "./posts";
import { getLandings } from "./landings";

// Простой текст для нейросетей: неразрывные пробелы типографа заменяем обычными
const plain = (s: string) => s.replace(/ /g, " ").replace(/⁠/g, "");
const c = site.contacts;

function contacts() {
  return [
    c.phone && `- Телефон: ${c.phoneDisplay || c.phone}`,
    c.email && `- Почта: ${c.email}`,
    c.telegram && `- Telegram: ${c.telegram}`,
    `- Сайт: ${site.url}`,
  ]
    .filter(Boolean)
    .join("\n");
}

const posts = () => (site.features.blog ? getPosts() : []);

export function llmsTxt() {
  const p = posts();
  return plain(`# ${site.name}

> ${home.answer}

## Каталог и разделы
- [Каталог (17 устройств)](${site.url}/catalog/): [Автономная уборка](${site.url}/catalog/cleaning-robots/), [Умный дом Aqara](${site.url}/catalog/smart-home/), [Роботы Unitree](${site.url}/catalog/robots/)
- [Матрица совместимости](${site.url}/compatibility/): Алиса, Matter, Thread, Zigbee, Apple HomeKit, Home Assistant, Wi-Fi
- [Сравнения моделей](${site.url}/compare/): 6 прямых пар флагманов по официальным данным
- [Бренды ALYMP](${site.url}/brands/): Roborock, Dreame, Aqara, Unitree Robotics, KaringBee
${home.categories.map((x) => `- ${x.title}: ${x.items.join(", ")}. ${x.text}`).join("\n")}

${getLandings().length ? `## Товары\n${getLandings().map((l) => `- [${l.product.name}](${site.url}/products/${l.slug}/): ${l.tagline} Характеристики: ${site.url}/products/${l.slug}/specs/`).join("\n")}\n\n` : ""}## Как заказать
${home.steps.map((s, i) => `${i + 1}. ${s.title}: ${s.text}`).join("\n")}
${p.length ? `\n## Статьи\n${p.map((x) => `- [${x.title}](${site.url}/blog/${x.slug}/): ${x.description}`).join("\n")}\n` : ""}
## О компании
- [О ALYMP](${site.url}/about/): ${site.tagline}
- [Контакты](${site.url}/contacts/)
- Подробная версия для LLM: ${site.url}/llms-full.txt

## Контакты
${contacts()}
`);
}

export function llmsFullTxt() {
  const p = posts().map((x) => `## ${x.title}\nURL: ${site.url}/blog/${x.slug}/\nДата: ${x.updated ?? x.date}\n\n${x.body}`);
  return plain(
    `${llmsTxt()}\n---\n\n${getLandings().map((l) => `# ${l.product.name}\nURL: ${site.url}/products/${l.slug}/\n\n${l.answer}\n\nФакты (источник — официальный сайт производителя):\n${l.product.facts.map((f) => `- ${f.text}`).join("\n")}\n\nВопросы:\n${l.faq.map((f) => `- ${f.q} ${f.a}`).join("\n")}`).join("\n\n---\n\n")}\n\n---\n\n# Частые вопросы\n\n${home.faq.map((f) => `- ${f.q} ${f.a}`).join("\n")}\n\n---\n\n# О компании\n\n${about.body}\n${p.length ? `\n---\n\n# Статьи\n\n${p.join("\n\n")}\n` : ""}`,
  );
}
