#!/usr/bin/env node
/**
 * Автопарсер новостей ALYMP (T45, spec §4.3 и plan §5).
 * Читает RSS/Atom-ленты ~15 профильных источников, фильтрует дубли по sourceUrl и заголовкам,
 * переписывает свежие релизы на русском через Gemini API (GEMINI_API_KEY) с блоком
 * «Что это значит для покупателя в России» и сохраняет в content/news/<slug>.json.
 *
 * Запуск: GEMINI_API_KEY=... node scripts/news/collect.mjs [--dry-run] [--limit 3]
 */
import fs from "node:fs";
import path from "node:path";

const NEWS_DIR = path.join(process.cwd(), "content/news");
const DRY_RUN = process.argv.includes("--dry-run");
const LIMIT_IDX = process.argv.indexOf("--limit");
const LIMIT = LIMIT_IDX > -1 ? Number(process.argv[LIMIT_IDX + 1] || 3) : 3;

const SOURCES = [
  { name: "The Verge — Smart Home", brand: "Умный дом", url: "https://www.theverge.com/rss/smart-home/index.xml" },
  { name: "HomeKit News", brand: "Apple Home / Matter", url: "https://homekitnews.com/feed/" },
  { name: "Matter Alpha", brand: "Matter / Thread", url: "https://www.matteralpha.com/rss.xml" },
  { name: "IEEE Spectrum Robotics", brand: "Робототехника", url: "https://spectrum.ieee.org/feeds/topic/robotics.rss" },
  { name: "The Robot Report", brand: "Робототехника", url: "https://www.therobotreport.com/feed/" },
  { name: "Aqara Newsroom", brand: "Aqara", url: "https://www.aqara.com/en/feed/" },
  { name: "Roborock Global News", brand: "Roborock", url: "https://global.roborock.com/blogs/news.atom" },
  { name: "Dreame Global Blog", brand: "Dreame", url: "https://global.dreametech.com/blogs/news.atom" },
  { name: "Home Assistant Blog", brand: "Home Assistant", url: "https://www.home-assistant.io/atom.xml" },
  { name: "CSA / Matter News", brand: "Matter", url: "https://csa-iot.org/feed/" },
  { name: "Thread Group News", brand: "Thread", url: "https://www.threadgroup.org/news-events/blog/rss" },
  { name: "TechCrunch Robotics", brand: "Роботы и ИИ", url: "https://techcrunch.com/category/robotics/feed/" },
  { name: "Engadget Smart Home", brand: "Умный дом", url: "https://www.engadget.com/rss.xml" },
  { name: "Stacey on IoT", brand: "Умный дом", url: "https://staceyoniot.com/feed/" },
  { name: "9to5Mac HomeKit", brand: "Apple Home", url: "https://9to5mac.com/guides/homekit/feed/" },
];

const RELEVANT_RE =
  /roborock|dreame|aqara|unitree|ecovacs|winbot|hobot|matter\s*1\.|thread\s*border|mmwave|smart\s*lock|home\s*key|home\s*assistant|humanoid|quadruped|robot\s*vacuum|lidar/i;

function extractItems(xml) {
  const items = [];
  const blocks = xml.match(/<(item|entry)[\s\S]*?<\/\1>/gi) || [];
  for (const b of blocks.slice(0, 10)) {
    const title = (b.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1] || "")
      .replace(/<[^>]+>/g, "")
      .trim();
    const link =
      b.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] ||
      b.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]?.trim() ||
      "";
    const desc = (
      b.match(/<(?:description|summary|content)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:description|summary|content)>/i)?.[1] ||
      ""
    )
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1500);
    if (title && link) items.push({ title, link, desc });
  }
  return items;
}

function loadExistingUrls() {
  if (!fs.existsSync(NEWS_DIR)) return new Set();
  const urls = new Set();
  for (const f of fs.readdirSync(NEWS_DIR).filter((x) => x.endsWith(".json"))) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(NEWS_DIR, f), "utf8"));
      if (j.sourceUrl) urls.add(j.sourceUrl);
    } catch {}
  }
  return urls;
}

async function rewriteWithGemini(item, source) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY не задан");
  const today = new Date().toISOString().slice(0, 10);
  const prompt = `Ты — редактор технологического медиа ALYMP (alymp.ru). Перескажи новость своими словами на чистом русском языке (Главред 8+, без канцелярита и слов «лучший/уникальный/инновационный/революционный», без выдуманных цифр, без упоминания дистрибьюторов).
Верни СТРОГО валидный JSON без markdown-обёртки:
{
  "slug": "english-kebab-case-slug-max-6-words",
  "title": "Заголовок 40-55 символов на русском",
  "description": "Описание 125-155 символов на русском с ключевым фактом",
  "date": "${today}",
  "brand": "${source.brand}",
  "sourceName": "${source.name}",
  "sourceUrl": "${item.link}",
  "summary": "Прямой ответ 1-2 предложения (35-50 слов)",
  "body": ["Абзац 1 (~70 слов)", "Абзац 2 (~70 слов)", "Абзац 3 (~60 слов)"],
  "forRussia": "Что это значит для покупателя в России (~70-90 слов: совместимость с Алисой/Matter/РФ, доступность, практический вывод)",
  "relatedProducts": []
}

Заголовок оригинала: ${item.title}
Текст/анонс оригинала: ${item.desc}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
      }),
      signal: AbortSignal.timeout(30000),
    },
  );
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Пустой ответ Gemini");
  return JSON.parse(text);
}

async function main() {
  fs.mkdirSync(NEWS_DIR, { recursive: true });
  const existing = loadExistingUrls();
  const candidates = [];

  for (const src of SOURCES) {
    try {
      const res = await fetch(src.url, {
        headers: { "User-Agent": "ALYMP-NewsBot/1.0 (+https://alymp.ru)" },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) continue;
      const xml = await res.text();
      for (const it of extractItems(xml)) {
        if (existing.has(it.link)) continue;
        if (!RELEVANT_RE.test(`${it.title} ${it.desc}`)) continue;
        candidates.push({ item: it, source: src });
      }
    } catch (e) {
      console.warn(`Пропуск ${src.name}: ${e.message}`);
    }
  }

  console.log(`Найдено релевантных новых материалов: ${candidates.length}`);
  if (DRY_RUN) {
    candidates.slice(0, LIMIT).forEach((c) => console.log(" -", c.source.name, "|", c.item.title));
    return;
  }

  let created = 0;
  for (const c of candidates.slice(0, LIMIT)) {
    try {
      const article = await rewriteWithGemini(c.item, c.source);
      if (!article.slug || !/^[a-z0-9-]+$/.test(article.slug)) continue;
      const outPath = path.join(NEWS_DIR, `${article.slug}.json`);
      if (fs.existsSync(outPath)) continue;
      fs.writeFileSync(outPath, JSON.stringify(article, null, 2) + "\n", "utf8");
      console.log(`Создана новость: content/news/${article.slug}.json`);
      created++;
    } catch (e) {
      console.warn(`Ошибка обработки "${c.item.title}": ${e.message}`);
    }
  }
  console.log(`Итого создано: ${created}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
