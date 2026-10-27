# AGENTS.md — hướng dẫn cho AI coding agent (Codex, Claude, ...)

Game: **Cyber Tank 1v1** — HTML5 canvas, JS thuần (không build), mở `index.html` là chạy.

## Đọc trước
- `docs/HANDOVER.md` — kiến trúc, hệ thống chung, online.
- `docs/TODO.md` — việc đang chờ.
- `docs/KE_HOACH_EVO_3_4.md` — kế hoạch Evo 3/4, Skill, Nộ.
- Hướng dẫn theo loại việc (đọc đúng file):
  - Thêm body mới: `tools/agents/common.md`
  - Sửa / cân bằng body có sẵn: `tools/agents/mod.md`
  - Đồ hoạ / hiệu ứng: `tools/agents/art.md` (+ `art-spec.md`)

## Quy ước quan trọng
- Mỗi body: `js/characters/<id>/logic.js` + `render.js`, đăng ký bằng `CharHooks.register(id, {...})`; dữ liệu ở `js/data/modules.js`, `evolutions.js`, `body-guides.js`.
- Thực thể dùng chung trong `bodyEffects` phải thêm vào `NET_CLASSES` (`js/online/netstate.js`) và chỉ chứa dữ liệu thuần (online host-authoritative).
- Kết liễu: class trong hằng **duy nhất** `FINISHER_FX_CLASSES` (`js/render/render.js`) + hàm `xxFxOver()`.
- Full Evo luôn kiểm tra qua `hasFullEvo(p, 'body_id')` (thẻ ★ FULL EVO, `FULL_EVO_GATE` trong `js/data/evolutions.js`).
- Bot: thêm IIFE bọc `SmartBot.prototype.fire` ở **cuối** `js/ai/smart-bot.js`.
- P1 ở dưới bắn lên, P2 ở trên bắn xuống — luôn kiểm tra cả 2 phía.
- Laser có cảnh báo dùng `scheduleHitscan` / `HitscanWarning` (người bắn tự đứng yên khi cảnh báo).
- Viết mô tả / chữ trong game bằng tiếng Việt.

## Kiểm tra trước khi commit
```bash
for f in js/*/*.js js/*/*/*.js; do node --check $f || echo BAD $f; done
node tools/smoke.js        # chạy mọi body ngẫu nhiên, phải in "done N" không lỗi
```
- Mô phỏng cân bằng: `tools/sim.js` (bot vs bot, đồng hồ giả).
- Playwright có sẵn: `require('playwright')`; dùng `INIT` trong `tools/sim.js` để chạy bằng đồng hồ giả.

## Git
- Làm trên nhánh được giao, commit nhỏ, thông điệp tiếng Việt mô tả rõ thay đổi.
- Không tạo PR nếu không được yêu cầu.
