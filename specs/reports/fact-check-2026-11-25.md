# Fact-check 2026-11-25

Scope: 13 product files (karingbee-hcr011 and dreame-x50-ultra-complete skipped). No contradictions found, so nothing was moved to disputes. Two items were removed as not found. No marketing adjectives ("лучший", "инновационный", "революционный", "уникальный") were present in facts.

## Unreachable sources
- https://us.aqara.com/products/camera-hub-g5-pro (HTTP 403 on two attempts). No item in aqara-camera-hub-g5-pro.json cites it (s2 is unused); all items are confirmed on s1.
- Direct curl to global.dreametech.com and global.roborock.com returned 403. Both were read through WebFetch instead, so nothing is unverifiable.
- Alice help page, Aqara, Unitree and ru.roborock.com pages were read directly.

## Per product

### aqara-camera-hub-g5-pro
- Confirmed: all 8 facts, 17 specs, compatibility thread/zigbee/wifi (s1).
- Disputes: none. Removed: none.

### aqara-fp400
- Confirmed: all 8 facts, 22 specs (FP400 on s1, FP2 on s2/s3), 7 inBox, compatibility matter/thread/zigbee/homeAssistant/wifi.
- Remarks: homeAssistant "yes" rests on the page saying Absence Confirmation Period is supported on Home Assistant only. wifi "no" is inferred from the protocol list (Thread, Zigbee).
- Disputes: none. Removed: none.

### aqara-hub-m3
- Confirmed: all 6 facts, 10 specs, 5 inBox, compatibility matter (s2)/thread/zigbee/wifi.
- Disputes: none. Removed: none.

### aqara-panel-hub-s1-plus
- Confirmed: all 3 facts, compatibility zigbee. The specs table on the page is an image, so specs stays empty.
- Disputes: none. Removed: none.

### aqara-smart-lock-u200
- Confirmed: all 7 facts, 9 specs, compatibility thread/zigbee/wifi (s1) and alice "no" (s2).
- Remark: alice "no" means the model is absent from the Yandex list (A100, D100, D200). The page does not state the incompatibility directly.
- Disputes: none. Removed: none.

### aqara-smart-lock-u300
- Confirmed: all 7 facts, 9 specs, 7 inBox, compatibility thread/zigbee/wifi and alice "no".
- Fix: facts 0-4 mixed U300 data (s1) with U200 data, which s1 does not contain. Each was split into a U300 part (src s1) and a U200 part (src s3). No new data added.
- Disputes: none. Removed: none.

### dreame-l50-ultra
- Confirmed: facts (28 000 Pa, 5200 mAh, mop lift 10,5 mm, Matter, voice "OK, Dreame" plus Alexa/Siri/Google Home), specs (suction, mop lift, battery), all 15 inBox items, compatibility matter.
- Removed: "Вылет боковой щётки 40 мм" (fact and spec). The "40 mm Extended Cleaning Reach" stat is unlabelled on the page and sits next to the mop section, so it cannot be tied to the side brush. A line was added to notes.
- Disputes: none.

### roborock-qrevo-curv-2-flow
- Confirmed: all 11 facts, 11 specs, compatibility matter (future OTA)/wifi.
- Disputes: none. Removed: none.

### roborock-saros-10
- Confirmed: all 12 facts, 15 specs (Saros 10 on s3, 10R on s4/s5), compatibility matter/wifi.
- Disputes: none. Removed: none.

### roborock-saros-z70
- Confirmed: all 11 facts, 11 specs, compatibility matter (future OTA).
- Disputes: none. Removed: none.

### smart-sunrise-kit
- Confirmed: facts 0-5, all 15 specs, compatibility matter (via-hub)/thread/zigbee/wifi.
- Removed: fact "Комплект включает мотор … и ленту …; состав выбран исполнителем и требует подтверждения владельцем" (not on s2; the bundle is not an official Aqara product). A line was added to notes.
- Disputes: none.

### unitree-g1
- Confirmed: all 9 facts, 22 specs, compatibility wifi. The per-limb degrees-of-freedom values were read from the page HTML.
- Disputes: none. Removed: none.

### unitree-go2
- Confirmed: all 9 facts, 20 specs, compatibility wifi.
- Disputes: none. Removed: none.

## Notes
- Matter "yes" for Roborock models means "announced, arrives via a future OTA". The notes fields say so.
- Edited files were rewritten with json.dump (indent=2), so their formatting differs from the original compact style. All files pass json.load and every src exists in sources.
