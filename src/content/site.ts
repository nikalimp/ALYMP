// Единый источник правды о компании. Заполняется по specs/00-brief.md и specs/02-spec.md.
// Всё, что помечено TODO(клиент), должно быть заменено фактами до запуска: `npm run check` не пропустит TODO.

export type OrgType =
  | "Organization"
  | "LocalBusiness"
  | "ProfessionalService"
  | "Dentist"
  | "MedicalClinic"
  | "LegalService"
  | "EducationalOrganization"
  | "HomeAndConstructionBusiness"
  | "Store"
  | "OnlineStore";

export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://alymp.ru",
  name: "ALYMP",
  legalName: "Алимпиев Никита Евгеньевич", // после ИП — «ИП Алимпиев Никита Евгеньевич»
  // Тип организации в Schema.org — самый точный из подходящих: https://schema.org/LocalBusiness#subtypes
  orgType: "OnlineStore" as OrgType,
  title: "Роботы и умный дом: Roborock, Dreame, Aqara, Unitree — ALYMP", // 40–65 символов (spec §4.5)
  description: "15 флагманских роботов и устройств умного дома 2025⁠–⁠2026: Roborock, Dreame, Aqara, Unitree. Официальная гарантия в России, честные сравнения моделей.",
  // Одна фраза о компании для llms.txt и футера
  tagline: "Роботы и умный дом нового поколения",
  lang: "ru",
  locale: "ru_RU",
  foundingYear: null as number | null, // год регистрации бизнеса — после ИП
  areaServed: ["RU"],

  contacts: {
    phone: "+79090199780",
    phoneDisplay: "+7 909 019-97-80",
    email: "nikitaalimpiev@mail.ru", // временная почта — заменить на адрес на alymp.ru
    telegram: "https://t.me/nikalimp",
    whatsapp: "", // https://wa.me/7XXXXXXXXXX
    address: {
      street: "",
      city: "",
      region: "",
      postalCode: "",
      country: "RU",
    },
    geo: null as null | { lat: number; lng: number },
    hours: "", // для людей: «Пн–Пт 9:00–19:00»
    openingHours: [] as { days: string[]; opens: string; closes: string }[], // для Schema: days — Monday…Sunday
  },

  // Главное целевое действие — на него ведут все CTA
  cta: {
    label: "Каталог",
    href: "/#catalog", // после сборки каталога — «Заказать» на лендингах (spec §7)
  },

  // Реквизиты для футера и политики ПДн (152-ФЗ)
  legal: {
    status: "самозанятый (НПД)", // после открытия ИП — заменить, добавить ogrnip
    inn: "667109362983",
    ogrn: "",
    privacyEmail: "", // почта для запросов по персональным данным; пусто — берётся contacts.email
  },

  // Профили бренда на внешних площадках: одинаковые название, адрес и телефон везде
  sameAs: ["https://t.me/nikalimp"] as string[],
  socials: [] as { label: string; href: string }[], // Instagram и Facebook — с «*» в label
  metaNote: "", // «*Meta Platforms Inc. признана экстремистской и запрещена в РФ» — если есть ссылки на Instagram/Facebook

  // Лицо компании — основатель или эксперт. null, если не нужен
  person: null as null | { name: string; jobTitle: string; description: string; sameAs: string[] },

  metrikaId: 114661158, // номер счётчика Яндекс Метрики; 0 — счётчик не подключается (на боевом домене npm run check этого не пропустит)
  darkTheme: false, // база светлая (DESIGN.md); тёмная тема сайта — P1

  // Функции включаются и выключаются флагами, а не удалением кода (стандарт §1.9):
  // снятый с сайта блок остаётся в репозитории и возвращается одной строкой.
  features: {
    blog: true, // блог и 7 гайдов — T47–T49
    catalog: true, // каталог и категории — T35
    compare: true, // сравнения — T36
    glossary: true, // глоссарий — блок 6 (T39–T43)
    news: true, // новости и автопарсер — T44–T46
    cart: true, // корзина-заявка без онлайн-оплаты (Спринт 1)
    leadApi: true, // /api/lead.php — общий стандарт NikitOS (leads.jsonl + Telegram + почта)
  },
};

// Пункт меню показывается, когда раздел собран (флаги site.features) — на проде нет ссылок в пустоту
export const nav = [
  ...(site.features.catalog ? [
    { href: "/catalog/", label: "Каталог" },
    { href: "/catalog/cleaning-robots/", label: "Уборка" },
    { href: "/catalog/smart-home/", label: "Умный дом" },
    { href: "/catalog/robots/", label: "Роботы" },
    { href: "/compatibility/", label: "Совместимость" },
    { href: "/brands/", label: "Бренды" },
  ] : []),
  ...(site.features.compare ? [{ href: "/compare/", label: "Сравнения" }] : []),
  ...(site.features.glossary ? [{ href: "/glossary/", label: "Глоссарий" }] : []),
  ...(site.features.blog ? [{ href: "/blog/", label: "Блог" }] : []),
  ...(site.features.news ? [{ href: "/news/", label: "Новости" }] : []),
  { href: "/how-to-order/", label: "Как заказать" },
  { href: "/about/", label: "О ALYMP" },
  { href: "/contacts/", label: "Контакты" },
];
