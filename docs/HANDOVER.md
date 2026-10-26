# 🔁 Bàn giao (để phiên làm việc mới tiếp tục)

## Trạng thái
- Nhánh làm việc: `claude/peaceful-goodall-w1qjps` — mọi thứ đã push.
- 67 body + **Hệ thống 150 Lõi Công Nghệ G.E.A.R (`#1 – #150`)** tại `js/data/gears.js` & `js/game/gear-system.js` (chi tiết nhật ký ở `NOTE_Antigravity.md`).
- Danh sách việc còn lại: **`docs/TODO.md`** (theo thứ tự ưu tiên).
- Cẩm nang body (tự sinh): `docs/BODIES.md`. Các bản đặc tả người dùng gửi đã làm xong và đã xoá khỏi `docs/` (xem lịch sử git nếu cần).
- Người dùng muốn: **làm từng việc một** (tiết kiệm token), xong việc nào thì gộp → smoke test → push → cập nhật `docs/TODO.md` + `docs/BODIES.md`, rồi tự làm việc kế tiếp.

## Công cụ (thư mục `tools/`)
| File | Dùng để |
|---|---|
| `tools/smoke.js` | Chạy thử mọi body (Playwright, bắn/đi ngẫu nhiên). In `done N` là không có lỗi trang. Chạy: `node tools/smoke.js` |
| `tools/sim.js` | Chứa chuỗi `INIT` (đồng hồ giả: `window.__advance(ms)`, `__clearTimers`) để viết test tất định. |
| `tools/docs/extract.js` + `tools/docs/gen.py` | Tạo lại `docs/BODIES.md`: `node tools/docs/extract.js && python3 tools/docs/gen.py tools/docs/simavg.json` |
| `tools/docs/changes.json` | Ghi chú thay đổi theo body (hiện trong BODIES.md). Thêm/sửa khi đổi body. |
| `tools/union.py` | Gộp xung đột kiểu "cả 2 nhánh cùng thêm vào cuối danh sách" (index.html, modules.js, evolutions.js, netstate.js, smart-bot.js). |
| `tools/agents/common.md` | Hướng dẫn cho agent khi **thêm body mới**. |
| `tools/agents/mod.md` | Hướng dẫn cho agent khi **sửa body có sẵn**. |
| `tools/agents/art.md` + `art-spec.md` | Hướng dẫn & đặc tả vẽ xe/đạn (registerTankArt / registerBulletArt). |

Chromium: `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, Playwright: `require('/opt/node22/lib/node_modules/playwright')`.

## Kiến trúc nhanh
- Script thường (không module), thứ tự nạp trong `index.html`. Body: `js/characters/<id>/logic.js` + `render.js` (+ `summons.js`).
- Hook: `CharHooks.register(id, {setup, update, shoot, draw, ...})`, `BulletHooks`.
- Thực thể dùng chung: mảng `bodyEffects` (mỗi class mới phải thêm vào `NET_CLASSES` trong `js/online/netstate.js` để online đồng bộ).
- Online: host quyết định, guest chỉ vẽ → state phải là dữ liệu thuần (không hàm/Map).
  Gói SYNC 30/giây = keyframe (~5s/lần hoặc khi guest xin `SYNC_KEY`) + delta: chỉ gửi trường Player / mảng gốc / key gameState có chuỗi mã hoá đổi
  (`NetState.captureSync/applySync`); mốc Date.now() mã hoá theo mốc cố định của host nên không tự đổi mỗi gói. Guest nội suy x/y của xe đối thủ,
  đạn và thực thể có `_nid` theo thời gian host với độ trễ đệm (`NetSmooth`). Trường Player chỉ của máy cục bộ: `NET_LOCAL_PLAYER_KEYS` / `NET_SKIP_PLAYER_KEYS`.
- Vẽ xe: `js/render/tank-art.js` (`registerTankArt`), nhóm art ở `js/render/tank-art/*.js`. Đạn: `js/render/bullet-art.js` (`registerBulletArt`).
- HUD: `js/render/tank-hud.js` (thanh máu/đạn/trạng thái, `hudRowY`), `js/render/empower-hud.js` + `empower-providers.js` (vòng & biểu tượng trên nút bắn, `registerEmpowerHUD`).
- Đạn tự tìm dùng chung `homingTurnScale()` trong `js/core/hooks.js`.
- Đòn hitscan phải có cảnh báo (`scheduleHitscan`) và bị tường Sniper chặn (`sniperWallBlockY`).

## Việc kế tiếp
Xem `docs/TODO.md`. Đang chờ người dùng chơi thử các mục ở phần "Ghi chú / cần xác nhận"; hệ thống G.E.A.R mới cần kiểm tra lỗi & bổ sung hình ảnh hiệu ứng.
