# 04 · План — ALYMP

> Как spec v0.4 и дизайн «День» ложатся на код стартера.
> Статус: **утверждено Ником 25.11.2026** (долги pre-flight: SSL Let's Encrypt, первая выкладка FTP)

## 1. Основа
- **Стартер:** NikitOS `.starter/` (`ai-ready-site` 1.0.0): Next.js 16.3, React 19.2, Tailwind 4, статический экспорт в `out/`.
- **Репозиторий:** `~/Desktop/ALYMP Claude/site/`, GitHub `nikalimp/ALYMP` (публичный). Работа агента — ветки `claude/*` и PR. До этапа 6 PR только со `specs/` сливаются вручную, с этапа 6 — после зелёного `npm run check`.
- **Хостинг и деплой:** REG.RU, виртуальный хостинг (ISPmanager), сервер 31.31.197.26 — тот же, что у nikalimp.ru. deploy-kit 2.0.0, адаптер `ssh-ftp`: SSH из Actions на REG.RU закрыт, рабочий путь — FTP.
- **Тестового адреса нет** (решение Ника 25.11.2026): слитый PR с зелёным check выкладывается сразу на прод. Риск — ошибка видна посетителям; защита — `npm run check` и проверка цели deploy-kit (200, 404, sitemap, robots, llms.txt), при сбое — revert-PR.
- **Прод:** `https://alymp.ru` — открыт для индексации сразу после сборки (решение Ника, /grill Q1). Домен в REG.RU, A-запись уже указывает на 31.31.197.26, оплачен до 24.11.2027.
- **Паспорт публикации:** `publish.json` только с `targets.prod`; в `deploy.yml` и `pr.yml` нет job `test`.

### Pre-flight хостинга
По «Хостинги — что проверено». Пока не зелёное — первую выкладку не делаем.

| Проверка | Результат | Дата |
|---|---|---|
| Выкладка из Actions: SSH / FTP | ⏳ Пробный Deploy (run 45546555759) остановился на `npm run check` — стартер с `TODO`, до выкладки не дошёл. Путь подтвердит первый PR сборки (блок 1) | 25.11.2026 |
| HTTPS-редирект | ⏳ Только галочкой «Перенаправлять HTTP в HTTPS» в ISPmanager; в `.htaccess` правила по `%{HTTPS}` нет (стартер) | — |
| `.htaccess` для 301 и 404 | ✅ Apache на REG.RU; `public/.htaccess` из стартера. Нужен 301 `/products/` → `/catalog/` (spec §4.2) | 25.11.2026 |
| PHP для формы | ⏳ Нужен `lead.php`: запись заявки в файл на хостинге, затем Telegram и почта. Проверить версию PHP и исходящие запросы к api.telegram.org | — |
| Поддомен теста | — не нужен (решение Ника) | 25.11.2026 |
| Домен `alymp.ru`: A-запись | ✅ 31.31.197.26, NS — reg.ru | 25.11.2026 |
| SSL `alymp.ru` | ❌ Самоподписанный сертификат; HTTP → HTTPS уже работает. Выпустить Let's Encrypt в ISPmanager | 25.11.2026 |
| Доступ без пароля | ✅ Секреты в GitHub: FTP_HOST/USER/PASS, FTP_DIR, FTP_DIR_PROD, SSH_*, NOTIFY_*, TELEGRAM_* | 25.11.2026 |

**Ник запустил мастер** `setup-site.sh` 25.11.2026 — создаёт оба сайта в ISPmanager (индекс `index.html index.php`, Let's Encrypt, редирект HTTPS галочкой, www → без www), A-запись поддомена, заводит секреты и делает пробную выкладку.

- Исключения из стандарта — spec §9.

## 2. Контент-модель в коде
Один факт — одно место. Страницы, JSON-LD, `llms.txt`, `sitemap.xml` собираются из этих файлов.

| Данные | Файл | Что меняется относительно стартера |
|---|---|---|
| Компания, контакты, реквизиты (самозанятый), sameAs, `orgType: "OnlineStore"` | `src/content/site.ts` | ALYMP, `features: { blog, cart:false, news, glossary, compare }` |
| Главная | `src/content/home.ts` | блоки spec §5 «Главная» |
| Товары (15) | `content/products/<slug>.json` + тип `src/lib/products.ts` | новое: контент-модель spec §5, `specs{}` с источником у каждой строки, `priceEstimate/priceSource/priceDate`, `compatibility{}` |
| Категории (3) | `src/content/categories.ts` | новое |
| Сравнения (6) | `src/content/compare.ts` — пары slug + вывод «кому что» | новое: таблица собирается из JSON двух товаров |
| Бренды (5) | `content/brands/<brand>.md` (frontmatter + текст) | новое |
| Глоссарий (50 → 300+) | `content/glossary/<term>.md`: `term`, `en`, `expansion`, `answer`, `related[]`, `products[]`, `sources[]` | новое; автоссылки `linkTerms()` в `src/lib/glossary.ts` |
| Новости | `content/news/<YYYY-MM-DD>-<slug>.md`: `brand`, `source`, `sourceDate`, `isBasedOn` | новое; пишет автосбор |
| Блог | `content/blog/<slug>.md` | стартер; рубрика `category` во frontmatter |
| Совместимость | собирается из `compatibility{}` товаров + `content/compatibility.md` (тексты, дата проверки) | новое |
| Удаляем из стартера | `src/content/services.ts`, `/services/*` | у ALYMP нет услуг; флаг не нужен — сущность не наша |

## 3. Маршруты
| URL из spec | Файл | Шаблон / новый | Schema-функции |
|---|---|---|---|
| `/` | `src/app/page.tsx` | стартер, переписать | `websiteSchema`, `orgSchema`, `faqSchema` |
| `/catalog/` | `src/app/catalog/page.tsx` | новый | `itemListSchema` |
| `/catalog/[category]/` | `src/app/catalog/[category]/page.tsx` | новый | `itemListSchema`, `breadcrumbSchema`, `faqSchema` |
| `/products/[slug]/` | `src/app/products/[slug]/page.tsx` | новый, лендинг | `productSchema` (Offer — только с ценой прайса), `faqSchema`, `breadcrumbSchema` |
| `/products/[slug]/specs/` | `src/app/products/[slug]/specs/page.tsx` | новый, `noindex` | `productSchema` (тот же `@id`, `additionalProperty`) |
| `/compare/`, `/compare/[pair]/` | `src/app/compare/…` | новый | `itemListSchema`, `faqSchema`, `breadcrumbSchema` |
| `/compatibility/` | `src/app/compatibility/page.tsx` | новый | `faqSchema` |
| `/brands/`, `/brands/[brand]/` | `src/app/brands/…` | новый | `brandSchema`, `itemListSchema`, `breadcrumbSchema` |
| `/glossary/`, `/glossary/[term]/` | `src/app/glossary/…` | новый | `definedTermSetSchema`, `definedTermSchema`, `breadcrumbSchema` |
| `/news/`, `/news/[slug]/` | `src/app/news/…` | новый | `newsArticleSchema`, `breadcrumbSchema` |
| `/blog/`, `/blog/[slug]/` | стартер | правка: рубрики-фильтр, автор «Редакция ALYMP» | `blogPostingSchema`, `faqSchema` |
| `/how-to-order/` | `src/app/how-to-order/page.tsx` | новый | `howToSchema`, `faqSchema` |
| `/about/`, `/contacts/`, `/privacy-policy/`, `/consent/` | стартер | правка текстов | `aboutPageSchema`, `contactPageSchema` |
| `/products/` | `public/.htaccess` | 301 → `/catalog/` | — |
| `/llms.txt`, `/llms-full.txt`, `sitemap.xml`, `robots.txt` | стартер | правка генераторов: товары, термины, сравнения, новости | — |

## 4. Компоненты
| Компонент | Откуда | Зачем |
|---|---|---|
| Токены, шрифты Onest + JetBrains Mono, логотип SVG | `globals.css`, `@fontsource-variable/onest`, `@fontsource/jetbrains-mono`, `public/logos/alymp.svg` | `DESIGN.md`; Inter стартера удаляем |
| `Header`, `Footer`, мобильное меню | стартер, переделка | шапка как в прототипе «День», полупрозрачная |
| `Scene` (`.is-dark` / светлая) | своё по прототипу | полноэкранная сцена товара |
| `KeyNumbers`, `SpecTable`, `CompatRow`, `StatusBadge`, `PriceEstimate` | своё | лендинг, сравнения, совместимость |
| `StickyTech` | своё; GSAP ScrollTrigger только на `/products/*` | сцена технологии (spec §9) |
| `ProductCard`, `CategoryTile`, `CompareCard`, `JournalList`, `TermChips` | своё | главная, каталог |
| `OrderForm` + `ConsentCheckbox` | стартер (чекбокс) + своё | заявка → `lead.php` |
| `Faq`, `Crumbs`, `JsonLd`, `CookieBanner` | стартер | без изменений логики |
| `ui/*` | shadcn/ui (button, badge, tabs, accordion, input) | базовые элементы |

## 5. Интеграции
| Что | Как | Секреты / доступы |
|---|---|---|
| Метрика | `site.metrikaId`; цели `lead`, клик «Заказать», переход в сравнение | номер счётчика — Ник (этап 8) |
| Форма | `public/api/lead.php`: валидация → запись в `api/leads/*.jsonl` на хостинге (РФ) → Telegram-бот → почта | `LEAD_TG_TOKEN`, `LEAD_TG_CHAT`, `LEAD_EMAIL` — в `api/config.php` на сервере, не в git; `rsync_exclude: "api/config.php api/leads/"` |
| Автосбор новостей | `.github/workflows/news.yml` (cron каждые 6 ч) → `scripts/news/collect.mjs`: RSS и страницы новостей ~15 брендов → дубли по URL и заголовку → Gemini: пересказ ≥ 250 слов + «что это значит для России» → `content/news/*.md` → PR `claude/news-*`; первые 20 PR — метка `needs-nik`; сверка: каждое число текста есть в источнике | `GEMINI_API_KEY` — Ник |
| Контент-завод | `/content-factory-init` на этапе 9: блог по будням, рост глоссария | — |
| Деплой | `.github/workflows/deploy.yml`, `pr.yml`, `deploy-prod.yml` из deploy-kit 2.0.0; `publish.json` | `FTP_HOST`, `FTP_USER`, `FTP_PASS`, `FTP_DIR`, `FTP_DIR_PROD` — мастер `setup-site.sh` |
| Уведомления о выкладке | deploy-kit → Telegram Нику | `NOTIFY_*` — мастер |

## 6. Порядок работ
1. **Каркас:** `publish.json` и workflows deploy-kit 2.0.0, `site.ts`, токены и шрифты, логотип и фавикон, шапка, футер. Первая выкладка на тест — пустой каркас.
2. **Данные:** контент-модель товаров и сбор фактов 15 товаров с официальных сайтов (агент-сборщик на Haiku, агент-проверяющий сверяет каждую цифру с источником).
3. **Шаблоны:** лендинг (на Go2 как эталоне) → `/specs/` → категория → каталог → сравнение → совместимость → бренд → термин → новость.
4. **Главная** по прототипу «День».
5. **Контент P0:** 15 лендингов, 6 сравнений, 5 брендов, 50 терминов, 7 статей, `/how-to-order/`, `/about/`, `/contacts/`, политика, согласие. Главред — внутри каждой задачи.
6. **Форма и `lead.php`**, cookie-баннер, реквизиты.
7. **Автосбор новостей** и первые 10 новостей.
8. **GEO и SEO:** `llms.txt`, sitemap, robots, title и description по шаблонам spec §4.5, JSON-LD на каждом типе.
9. **Качество:** адаптив 360–1440, Lighthouse (лендинги ≥ 85, остальное ≥ 95), доступность, `slop-check`.
10. **Запуск прода** `alymp.ru`, Метрика, Вебмастер, Search Console.

## 7. Риски
| Риск | Что делаем |
|---|---|
| Нет пресс-китов для части товаров | Официальные фото с сайта бренда (решение /grill Q12); лендинг держится на типографике и цифрах |
| Характеристики расходятся между источниками (X50 Ultra: 6 vs 4,2 см; Па) | Берём только официальную страницу бренда; спорная строка не публикуется, вопрос — в «Вопросы» |
| Ориентир цены устаревает | `priceDate` на странице; задача ежемесячного аудита — обновить ориентиры |
| Gemini пишет неточный пересказ | Метка `needs-nik` на первых 20 PR, сверка чисел с источником в check |
| 300+ тонких терминов (опыт nikalimp.ru: 89 коротких страниц не индексировались) | Каждый термин ≥ 250 слов по шаблону spec §4.3; без фактов — `noindex` |
| GSAP роняет PageSpeed лендингов | GSAP только после первого экрана, динамический импорт; замер после каждого блока |
| Форма до ИП | Подпись «Менеджер подтвердит цену… Оплата — после подтверждения»; оферта — с ИП |
| SSH из Actions закрыт на REG.RU | Рабочий путь — FTP, это норма для сервера |
