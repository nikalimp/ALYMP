# Стратегия контент-завода ALYMP (`alymp.ru`)

Проект: блог `alymp.ru/blog/` — SEO/GEO-двигатель каталога флагманских роботов и умного дома.
Пропорция тем (решение Ника 25.11.2026): **~60 %** практические гайды под каталог (уборка, умный дом, роботы), **~40 %** общие разборы технологий, протоколов и мировой робототехники.
Частота выпуска: будни (Пн–Пт), 20 статей в месяц, публикация через `content/blog/<slug>.md` → PR/push в `main` → автодеплой на `alymp.ru`.

## Кластеры и спрос (Яндекс Вордстат РФ, 18.10–16.11.2026)

| Кластер | Главный запрос | Частотность / мес | Рубрика | Целевые страницы сайта |
|---|---|---:|---|---|
| K1. Роботы-пылесосы: выбор | какой робот-пылесос выбрать | 6 360 | `cleaning` | `/catalog/cleaning-robots/`, `/blog/how-to-choose-robot-vacuum-2026-pets/` |
| K2. Пороги и проходимость | робот-пылесос пороги | 2 117 | `guides` | `/products/dreame-x50-ultra-complete/`, `/blog/robot-vacuum-thresholds-4cm-6cm/` |
| K3. Механическая рука | робот-пылесос с механической рукой | 45 | `cleaning` | `/products/roborock-saros-z70/`, `/glossary/robotic-arm/` |
| K4. Станция самоочистки | робот-пылесос с станцией самоочистки | 24 661 | `cleaning` | `/catalog/cleaning-robots/`, `/blog/robot-vacuum-with-self-emptying-station/` |
| K5. Линейка Dreame | робот-пылесос dreame | 63 813 | `cleaning` | `/brands/dreame/`, `/products/dreame-x50-ultra-complete/`, `/products/dreame-l50-ultra/` |
| K6. Линейка Roborock Saros | roborock saros z70 | 1 590 | `cleaning` | `/brands/roborock/`, `/products/roborock-saros-z70/`, `/products/roborock-saros-10/` |
| K7. Roborock Qrevo Curv 2 Flow | roborock qrevo curv 2 flow | 1 789 | `cleaning` | `/products/roborock-qrevo-curv-2-flow/` |
| K8. Робот-мойщик окон | мойщик окон робот | 82 615 | `cleaning` | `/products/hobot-sp10/`, `/products/ecovacs-winbot-w3-omni/`, `/products/karingbee-hcr011/` |
| K9. Хаб умного дома | хаб умного дома | 5 282 | `smart-home` | `/products/aqara-hub-m3/`, `/compatibility/`, `/blog/smart-home-alice-zigbee-matter-hub/` |
| K10. Умный дом с нуля | умный дом с нуля | 203 | `guides` | `/blog/smart-home-from-scratch-first-devices/`, `/scenarios/` |
| K11. Умные замки | умный замок | 26 455 | `smart-home` | `/products/aqara-smart-lock-u200/`, `/products/aqara-smart-lock-u300/`, `/blog/how-to-choose-smart-door-lock/` |
| K12. Датчик присутствия | датчик присутствия | 15 174 | `smart-home` | `/products/aqara-fp400/`, `/glossary/mmwave/` |
| K13. Умные шторы и свет | умные шторы | 14 455 | `smart-home` | `/products/smart-sunrise-kit/`, `/scenarios/` |
| K14. Сценарии умного дома | умный дом сценарии | 2 619 | `smart-home` | `/scenarios/`, `/compatibility/` |
| K15. Уличная камера-хаб | aqara camera hub g5 | 31 | `smart-home` | `/products/aqara-camera-hub-g5-pro/` |
| K16. Unitree Go2 | unitree go2 | 1 073 | `robots` | `/products/unitree-go2/`, `/brands/unitree/` |
| K17. Unitree G1 | unitree g1 | 1 995 | `robots` | `/products/unitree-g1/`, `/brands/unitree/` |
| K18. Роботы-собаки и гуманоиды | робот собака купить | 2 104 | `robots` | `/catalog/robots/`, `/brands/boston-dynamics/`, `/brands/figure-ai/`, `/brands/1x/` |
| K19. Протоколы Matter и Thread | matter умный дом | 496 | `guides` | `/compatibility/`, `/glossary/matter/`, `/glossary/thread/`, `/compare/` |
| K20. Бренд Aqara | aqara | 45 207 | `smart-home` | `/brands/aqara/`, `/catalog/smart-home/` |

## Роли по дням недели
- **Пн — Опора:** фундаментальный гайд под высокочастотный кластер (1 200–1 800 слов, таблица сравнения).
- **Вт — Разбор:** глубокий технический разбор одной технологии или пары моделей (900–1 400 слов).
- **Ср — Сравнение / Протоколы:** честное сопоставление стандартов, версий или сценариев.
- **Чт — Робототехника и ИИ:** обзор мирового рынка роботов, Unitree, гуманоидов, физического ИИ.
- **Пт — Чек-лист / Практика:** пошаговая инструкция перед покупкой, замером или настройкой.

## Пул из 30 GEO-запросов (из `specs/01-research.md`)

| # | Запрос | Тип | Целевая страница ALYMP |
|---|---|---|---|
| 1 | какой робот-пылесос купить в 2026 | категория | `/catalog/cleaning-robots/` + `/blog/how-to-choose-robot-vacuum-2026-pets/` |
| 2 | робот-пылесос с влажной уборкой и станцией самоочистки какой выбрать | категория | `/blog/robot-vacuum-with-self-emptying-station/` |
| 3 | Roborock Saros Z70 или Dreame X50 Ultra | сравнение | `/compare/` + статья `roborock-saros-z70-vs-dreame-x50-ultra-guide` |
| 4 | Dreame X50 Ultra или L50 Ultra что выбрать | сравнение | `/compare/` + статья `dreame-x50-ultra-vs-l50-ultra-guide` |
| 5 | робот-пылесос который перешагивает пороги | проблема | `/blog/robot-vacuum-thresholds-4cm-6cm/` + `/products/dreame-x50-ultra-complete/` |
| 6 | робот-пылесос с механической рукой | категория | `/products/roborock-saros-z70/` |
| 7 | робот-пылесос для дома с животными | проблема | `/blog/how-to-choose-robot-vacuum-2026-pets/` |
| 8 | что такое LiDAR в роботе-пылесосе | определение | `/glossary/lidar/` |
| 9 | что такое Matter и Thread | определение | `/glossary/matter/`, `/glossary/thread/` + статья `matter-thread-zigbee-protocol-guide` |
| 10 | Zigbee или Matter что выбрать | сравнение | `/compatibility/` + статья `matter-thread-zigbee-protocol-guide` |
| 11 | нужен ли хаб для умного дома с Matter | проблема | `/blog/smart-home-alice-zigbee-matter-hub/` + `/products/aqara-hub-m3/` |
| 12 | умный дом с нуля что купить | проблема | `/blog/smart-home-from-scratch-first-devices/` + `/scenarios/` |
| 13 | Aqara Hub M3 обзор | продукт | `/products/aqara-hub-m3/` |
| 14 | Aqara FP2 или FP400 | сравнение | `/products/aqara-fp400/` + статья `mmwave-presence-sensor-vs-pir` |
| 15 | что такое датчик присутствия mmWave | определение | `/glossary/mmwave/` + статья `mmwave-presence-sensor-vs-pir` |
| 16 | умный замок без ключа какой выбрать | проблема | `/blog/how-to-choose-smart-door-lock/` + `/products/aqara-smart-lock-u300/` |
| 17 | Aqara U200 или U300 что выбрать | сравнение | `/compare/` + `/blog/how-to-choose-smart-door-lock/` |
| 18 | Unitree Go2 купить в России | коммерция | `/products/unitree-go2/` + статья `unitree-go2-air-pro-edu-differences` |
| 19 | Unitree G1 цена в России | коммерция | `/products/unitree-g1/` + статья `humanoid-robots-2026-unitree-g1-to-neo` |
| 20 | Unitree Go2 для школы, вуза и выставок (покупка B2B) | B2B | `/products/unitree-go2/` + `/how-to-order/` |
| 21 | робот-собака купить для дома | категория | `/catalog/robots/` + `/products/unitree-go2/` |
| 22 | робот гуманоид купить в России | категория | `/catalog/robots/` + статья `humanoid-robots-2026-unitree-g1-to-neo` |
| 23 | Алиса и Matter: совместимость | проблема | `/compatibility/` + `/blog/smart-home-alice-zigbee-matter-hub/` |
| 24 | умные шторы с Алисой как выбрать | категория | `/products/smart-sunrise-kit/` + статья `smart-curtains-alice-and-sunrise-setup` |
| 25 | умный рассвет: как настроить | сценарий | `/scenarios/` + статья `smart-curtains-alice-and-sunrise-setup` |
| 26 | мойщик окон робот какой выбрать | категория | `/blog/how-to-choose-window-cleaning-robot-2026/` |
| 27 | Aqara Camera Hub G5 Pro что умеет | продукт | `/products/aqara-camera-hub-g5-pro/` + статья `aqara-camera-hub-g5-pro-poe-vs-wifi` |
| 28 | Dreame X50 Ultra Complete обзор и характеристики | продукт | `/products/dreame-x50-ultra-complete/` |
| 29 | Roborock Qrevo Curv 2 Flow характеристики | продукт | `/products/roborock-qrevo-curv-2-flow/` |
| 30 | Aqara официальный каталог умного дома | бренд | `/brands/aqara/` |

## Уже опубликованные стартовые гайды (7 шт., 25.11.2026 — не повторять)
1. `how-to-choose-robot-vacuum-2026-pets` (`cleaning`)
2. `how-to-choose-smart-door-lock` (`smart-home`)
3. `how-to-choose-window-cleaning-robot-2026` (`cleaning`)
4. `robot-vacuum-thresholds-4cm-6cm` (`guides`)
5. `robot-vacuum-with-self-emptying-station` (`cleaning`)
6. `smart-home-alice-zigbee-matter-hub` (`smart-home`)
7. `smart-home-from-scratch-first-devices` (`guides`)
