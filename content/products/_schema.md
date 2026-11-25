# Формат `content/products/<slug>.json`

Один файл — один товар. Источник правды для лендинга, `/specs/`, сравнений, совместимости, JSON-LD и llms.txt.
Правило: **у каждой цифры и каждого утверждения — источник** (`src` — ключ из `sources`). Нет источника — строку не пишем.
Источники — только официальные: сайт бренда (глобальный или RU), официальный пресс-релиз бренда, официальный магазин бренда. Обзоры — только для поля `notes`, не для `specs`.

```json
{
  "slug": "roborock-saros-z70",
  "brand": "roborock",                      // roborock | dreame | aqara | unitree | karingbee | hobot | ecovacs
  "category": "cleaning-robots",            // cleaning-robots | smart-home | robots
  "name": "Roborock Saros Z70",
  "variants": ["Saros 10", "Saros 10R"],    // если на странице несколько версий; иначе []
  "announced": "2025-01",                   // год-месяц анонса, с источником в facts
  "sources": {
    "s1": { "url": "https://…", "title": "Официальная страница товара", "checkedAt": "2026-11-25" }
  },
  "facts": [                                 // ключевые факты для текста: 5–12 штук
    { "text": "Механическая рука OmniGrip с пятью осями поднимает предметы до 300 г", "src": "s1" }
  ],
  "specs": [                                 // таблица характеристик
    { "group": "Уборка", "label": "Сила всасывания", "value": "22 000", "unit": "Па", "src": "s1" }
  ],
  "compatibility": {                         // "yes" | "via-hub" | "no" | "unknown"
    "alice":         { "v": "unknown", "src": null, "note": "" },
    "matter":        { "v": "yes", "src": "s1", "note": "" },
    "thread":        { "v": "unknown", "src": null, "note": "" },
    "zigbee":        { "v": "no", "src": "s1", "note": "" },
    "homekit":       { "v": "unknown", "src": null, "note": "" },
    "homeAssistant": { "v": "unknown", "src": null, "note": "" },
    "wifi":          { "v": "yes", "src": "s1", "note": "2,4 ГГц" }
  },
  "inBox": [ { "text": "…", "src": "s1" } ],
  "price": null,                             // цена из прайса дистрибьютора — пока null
  "priceEstimate": null,                     // ориентир «от», ₽ — T13
  "priceSource": null, "priceDate": null,
  "status": "unknown",                       // in_stock | preorder | unknown
  "disputes": [                              // расхождения источников — НЕ публикуются, пока Ник не решит
    { "label": "Высота порога", "values": ["6 см (s1)", "4,2 см (обзор)"], "comment": "" }
  ],
  "notes": "что не нашли и почему"
}
```
