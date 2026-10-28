# KẾ HOẠCH: EVO 3, EVO 4 (SKILL + NỘ), FULL EVO THEO TỔ HỢP & G.E.A.R MỚI

> Tài liệu CHỈ LẬP KẾ HOẠCH, chưa đụng tới code game. Số liệu là mức khởi điểm để chỉnh khi playtest.
> Nguồn tham chiếu: `js/data/modules.js` (91 body), `js/data/evolutions.js` (Evo 1, Evo 2, thẻ ★ FULL EVO, `FULL_EVO_GATE`), `js/data/body-guides.js` (điều khiển), `js/data/gears.js` (tầng Bạc / Vàng / Lăng Kính).
> Quy ước: **Evo 1 / Evo 2** = hai evo hiện có trong `EVOLUTIONS[bodyId]` (thứ tự mảng). **Evo 3 / Evo 4** = hai evo mới. Giá tính bằng $ trong shop (thang hiện tại 60 → 480).

---

## 1. Khung hệ thống

### 1.1 Luật chung (bản mới nhất của người dùng — thay mọi luật cũ mâu thuẫn)

1. Mỗi body có **4 Evo** (Evo 1–2 hiện có + Evo 3–4 mới) và một **NÚT SKILL** mới cạnh nút Bắn (chỉ hiện khi sở hữu Evo 4).
2. **GIỚI HẠN Ô EVO: mặc định mỗi trận chỉ mua tối đa 2 Evo (trong 4).** Mua đủ 2 thì các thẻ Evo còn lại hiện khoá `🔒 Hết ô Evo — cần G.E.A.R Lăng Kính` (vẫn đọc được mô tả để lên kế hoạch). Đã mua thì không bán lại / đổi.
3. **Evo 3 = một cơ chế mới gắn với bản sắc body** — thêm thao tác (nhấp → thêm giữ / nhấp đúp; giữ → thêm kiểu giữ khác) hoặc nội tại bị động "cứ X thì ...".
4. **Evo 4 = SKILL + NỘ.** Skill có CD, thường biến một cơ chế sẵn có của body thành **một nút bấm tức thì, đã tay** (ví dụ Paradox: về Neo ngay không cần giữ; Phản Chiếu: bật Kính phản ngay không cần canh giữ). Nộ đầy → nút Skill biến thành **Chiêu Cuối (Ultimate)**.
5. **Full Evo theo tổ hợp**: có **2 Evo bất kỳ** → shop hiện thẻ ★ FULL EVO ★. Tổ hợp (khoá `'12'..'34'`) quyết định Full Evo thêm/đổi gì. Khi sở hữu nhiều hơn 2 Evo (nhờ G.E.A.R) xem luật 6–7.
6. **G.E.A.R Lăng Kính "Tiến Hóa Lần Nữa"**: mở **ô Evo thứ 3**. Full Evo **vẫn tính theo 2 Evo MUA ĐẦU TIÊN** (khoá tổ hợp chốt theo thứ tự mua, Evo thứ 3 không đổi combo).
7. **G.E.A.R Lăng Kính "Con Đường Tiến Hóa"**: mở **ô Evo thứ 3 VÀ thứ 4**.
   - Có đủ 4 Evo + Full Evo → tổ hợp đặc biệt **`'1234'`** (mỗi body định nghĩa riêng ở mục 3; chưa định nghĩa = gộp hiệu ứng `'12'` + `'34'`). Khi mới có 3 Evo: Full Evo vẫn theo 2 Evo mua đầu.
   - **Mạnh lên theo mỗi Evo đang có** (cộng dồn): mỗi Evo **+12% sát thương**, **−4% sát thương nhận**, **+3% tốc chạy**, **−7% thời lượng khống chế nhận**; **Max HP** tổng theo mốc: 1 Evo **+3**, 2 Evo **+5**, 3 Evo **+6**, 4 Evo **+10**. (4 Evo = +48% dame, −16% st nhận, +12% tốc, −28% khống chế, +10 Max HP.)
   - Đổi lại: **không được mua FEET** (Động Cơ, Giáp Thép, Bánh Xích) — **trừ Lợi Tức**. FEET đã mua trước đó giữ nguyên cấp, chỉ khoá mua thêm.
   - Đối thủ được bồi thường ngay **+$200** và **1 lượt chọn G.E.A.R tầng Vàng (GOLD)**.
   - Hai món cùng dòng `fam_evo_slot` (không cầm cùng lúc); đang có "Tiến Hóa Lần Nữa" mà chọn "Con Đường Tiến Hóa" → nâng cấp thay thế.
8. **Cơ Bản (`basic`)**: bản thường **KHÔNG có Evo 3/4** (giữ đúng tinh thần "xe chuẩn mực", không ô Skill; hai G.E.A.R ô Evo không xuất hiện cho bản thường). **Bản MAIN** sở hữu **đủ 4 Evo** (không tốn ô) + Full Evo `'1234'` + **2 Evo ĐẶC BIỆT độc quyền MAIN** bày bán trong shop (không tính ô). Khi bản MAIN xuất hiện (roll 8% đầu trận / chọn ở Phòng Tập), đối thủ nhận ngay **+$200 và 1 lượt chọn G.E.A.R Vàng**. Đề xuất 2 Evo MAIN ở mục 3, body #1.
9. **Chiêu Cuối có thể KẾT LIỄU** ở một số body, nhưng luôn cần **điều kiện phụ ngoài Nộ đầy** (ví dụ địch dưới X% máu, địch đang mang đủ ấn). Không thoả điều kiện thì Ultimate vẫn tung, chỉ gây sát thương thường (≤ 60% Max HP chuẩn).
10. **Điều kiện tung riêng**: một số body chỉ tung được Ultimate khi thoả điều kiện bản sắc (ví dụ **Kỹ Sư phải có 3 ụ trên sân**). Nộ đầy mà chưa đủ điều kiện → nút Ultimate hiện viền xám + icon điều kiện còn thiếu (ví dụ `🔩 2/3`).
11. **Evo 3–4 không nhất thiết đắt hơn Evo 2**; Evo 3 có thể rẻ hơn cả Evo 1 (lối "đi Evo 3 sớm"). Vì chỉ có 2 ô, mỗi Evo phải là **lựa chọn chiến thuật**, không phải bậc thang bắt buộc.

### 1.2 Nút Skill, vòng Nộ & biểu diễn Chiêu Cuối

**Nguyên tắc:** nút Skill không bao giờ che nút Bắn / joystick, chỉ hiện khi `owned.has(evo4)`; ẩn hoàn toàn nếu chưa có.

| Mục | Đề xuất |
|---|---|
| Kích thước | Đường kính 0.62 × nút Bắn, vùng chạm ≥ 52px, tối đa 72px. Ở dạng Ultimate to thêm 15%. |
| Vị trí P1 (đáy màn) | Bên trái-trên nút Bắn, lệch 0.9 × bán kính nút Bắn theo đường chéo 45°, cách mép dưới ≥ 24px, không đè joystick. |
| Vị trí P2 | Xoay 180° quanh tâm sân như toàn bộ HUD P2 (chữ/icon xoay 180°). |
| Desktop | Phím mặc định `Q` (P1) / `/` (P2), đổi được trong cài đặt. |
| Vòng CD | Vòng cung conic **bên trong** viền nút, chạy ngược chiều kim đồng hồ 100% → 0%; giữa nút hiện số giây (1 chữ số thập phân khi < 3s). Sẵn sàng: viền sáng 1 nhịp + rung 10ms. |
| **Vòng Nộ** | **Vòng ngoài bao quanh nút Skill** (dày 4px), đổ từ đáy lên theo chiều kim đồng hồ, màu cam → đỏ; ≥ 80% vòng đập nhẹ. Nộ hiện cả khi Skill đang CD. Không có thanh Nộ nào khác trên HUD. |
| Biến hình khi Nộ đầy | 0.4s: nút phồng 1.25×, vỡ viền, icon Skill → icon Ultimate, viền nhịp đập đỏ-vàng, hạt lửa quanh nút, SFX "ting + gầm". Thiếu điều kiện tung riêng → viền xám + icon điều kiện. |
| **Khi tung Ultimate** | (1) **Hình ảnh đặc trưng** của body (mô tả ở mục 3, dòng "Dấu ấn") phát tại xe / sân; (2) **BĂNG TÊN CHIÊU** chạy ngang ở **mép màn phía người tung** (P1: mép dưới, P2: mép trên, chữ xoay theo P2), cao ≤ 12% màn, nền màu body, chữ to + khẩu hiệu nhỏ, trượt vào 0.15s – giữ 1.0s – mờ 0.25s. **Không bao giờ che giữa sân** và không che nút. Hai Ultimate cùng lúc: mỗi băng ở mép của mình. |
| Trạng thái | `LOCKED` (ẩn) → `READY` → `COOLDOWN` → (Nộ đầy) `RAGE_READY` / `RAGE_BLOCKED` (thiếu điều kiện) → `RAGE_ACTIVE` (đếm ngược thay vòng CD). |
| Tiếp cận | Chạm giữ nút 0.5s xem tooltip tên + mô tả + điều kiện; tuỳ chọn "Nút Skill lớn / đảo trái-phải". |

### 1.3 Quy tắc Skill ↔ Nộ

- Skill và Nộ độc lập; Nộ đầy thì nút hiện Ultimate (ưu tiên hơn Skill). Dùng Ultimate xong, nút về Skill với CD **đang chạy tiếp** (không reset).
- Nộ đầy mà Skill còn CD: vẫn tung được Ultimate (nếu thoả điều kiện riêng).
- Nộ không tăng khi `RAGE_ACTIVE`; bị choáng/đóng băng thì Nộ giữ nhưng không tăng.
- Hết hiệp: Nộ giữ **50%** sang hiệp sau (làm tròn xuống), Skill CD reset. Hồi sinh từ HỒI ỨC (MAIN): Nộ giữ 100%.
- Một lần nhấn = một lần dùng; không "giữ nút Skill" trừ khi nêu riêng.

### 1.4 Nguồn Nộ và số mặc định (thang 0–100)

| Nguồn | Mặc định | Ghi chú |
|---|---|---|
| Theo thời gian | **+1.2 / giây** (≈ 83s đầy) | Body dựa điều kiện riêng chỉ lấy +0.5/s. |
| Nhận sát thương | **+6 / mỗi 1 HP mất** (tối đa +18 mỗi đòn) | Đang thua nhận Nộ nhanh hơn. Sát thương lên khiên = ½. |
| Gây sát thương | **+1.5 / mỗi 1 dame** (tối đa +6 mỗi phát, trần 25/giây) | Cho body hung hãn. |
| **Điều kiện riêng** | **+4 đến +25 mỗi lần** | Là "chữ ký" Nộ của body — ghi ở mục 3. |

Mỗi body dùng **nguồn riêng (chính) + 1 nguồn chung (phụ)**; còn lại về 0. Công thức: `rage = clamp(rage + Σ nguồn × hệ_số_body × gearMult, 0, 100)`. Mục tiêu: **đầy ~1 lần/hiệp khi chơi bình thường, 2 lần khi chơi rất tốt**.

### 1.5 Định giá

| Bậc | Khoảng giá | Ghi chú |
|---|---|---|
| Evo 1 / Evo 2 (hiện có) | 60–480 | Không đổi. |
| **Evo 3** | **90–220** (thường 130–180) | Có thể rẻ hơn Evo 1 với cơ chế nhẹ. |
| **Evo 4** | **120–260** | Skill + Nộ; body vốn mạnh đặt 200+. |
| **Full Evo** | `fullEvoCost` hiện có ± phụ trội tổ hợp | `'12'` +0; tổ hợp có Evo 3/4 +10..+40; `'1234'` +60. |
| **Evo MAIN** (chỉ Cơ Bản) | 180–280 | Không tính ô, không giảm giá bởi G.E.A.R. |

Vì chỉ có 2 ô, tổng chi cho Evo mặc định ≈ (2 Evo + Full Evo) — gần như hiện tại. Lối 4 Evo (Con Đường Tiến Hóa) đắt ~650–1100$ và bị bù bằng việc mất FEET + đối thủ được $200 + G.E.A.R Vàng.

### 1.6 Full Evo theo tổ hợp

**Nguyên tắc:** `'12'` giữ nguyên Full Evo hiện tại (tương thích ngược). Tổ hợp không định nghĩa riêng = **phần chung** (+1 HP, +10% dame, hồi 1 khiên).

| Tổ hợp | Vai trò gợi ý |
|---|---|
| **12** | Full Evo hiện tại (giữ nguyên). |
| **13** | Nâng cơ chế Evo 3 bằng sức mạnh Evo 1. |
| **14** | Skill mạnh hơn / CD −25% / Skill mang nội dung Evo 1. |
| **23** | Hiệp đồng: Evo 3 kích hoạt đòn Evo 2 (liên hoàn). |
| **24** | Nộ +30% hoặc Ultimate mang hiệu ứng Evo 2. |
| **34** | Evo 3 nạp Nộ → "vòng Nộ" kín (thường mạnh nhất, phụ trội +30..40). |
| **1234** | **Chỉ có với Con Đường Tiến Hóa (hoặc MAIN)**: hiệu ứng "đỉnh" đổi cách Ultimate vận hành; luôn gồm `'12'` + nâng cấp riêng ở mục 3. |

```js
FULL_EVO_COMBOS.ice = {
  base: { hp: 1, dmgMul: 1.1 },
  '12': 'legacy',
  '13': { flag: 'fe_ice_13', desc: '...' },
  '24': { rageGainMul: 1.3 },
  '34': { rageOnEvo3: 12, costExtra: 30 },
  '1234': { flag: 'fe_ice_1234', includes: ['12'], costExtra: 60, desc: '...' }
};
// p.evoOrder = ['ice_2','ice_4', ...]  — thứ tự mua; comboKey = đủ 4 && gear Con Đường ? '1234' : sort(evoOrder.slice(0,2))
```

- Khoá số chuẩn xử lý chung: `rageGainMul`, `skillCdMul`, `ultMul`, `evo3Mul`, `rageOnEvo3`, `rageOnSkill`, `dmgMul`, `hpAdd`. Hành vi đặc thù dùng `flag` và code trong file nhân vật.
- **Combo chốt lúc mua thẻ Full Evo** theo 2 Evo mua đầu. Riêng khi Con Đường Tiến Hóa đủ 4 Evo: thẻ Full Evo đã mua **tự nâng lên `'1234'`** (không trả thêm, phụ trội tính lúc mua Evo thứ 4).

### 1.7 Tương tác với thẻ ★ FULL EVO hiện có

- Cổng điều kiện đổi từ `hasEvo1 && hasEvo2` → `ownedEvoCount >= 2`. `hasFullEvo(p, id)` vẫn là điểm kiểm tra duy nhất; thêm `fullEvoCombo(p, id)` trả khoá tổ hợp.
- Mô tả thẻ **động**: "★ FULL EVO ★ [Evo 2 + Evo 4]: ...".
- Hiệu ứng "Full Evo" rải trong mô tả Evo 1/2 hiện tại ánh xạ vào `'12'`.
- Bản MAIN (Cơ Bản): có sẵn `'1234'` (vì có đủ 4 Evo), 2 Evo MAIN không ảnh hưởng khoá tổ hợp.

### 1.8 Bot AI

- Bot mua tối đa 2 Evo theo ưu tiên body (`botEvoPick`, mặc định chọn cặp có combo định nghĩa riêng). Bot chọn G.E.A.R ô Evo chỉ ở độ khó Khó trở lên, và Con Đường Tiến Hóa chỉ khi tiền ≥ 500$.
- **Skill**: mỗi skill khai báo `botUse(ctx)`; mặc định "CD xong và có địch trong tầm".
- **Ultimate**: dùng khi Nộ đầy **và đủ điều kiện riêng** và (HP ≤ 50% **hoặc** địch rõ trong tầm **hoặc** điều kiện kết liễu đang thoả **hoặc** đã đầy quá 6s). Trễ phản ứng 0.2–0.5s theo độ khó.
- Bot chỉ đọc thông tin công khai (viền xe đối thủ phát sáng đỏ khi Nộ ≥ 80%).
- Code bot: IIFE bọc `SmartBot.prototype.fire` ở **cuối** `js/ai/smart-bot.js` như quy ước.

### 1.9 Đồng bộ online (host-authoritative như hiện tại)

- Input mới `skillPressed`; host xử lý Skill/Ultimate, đồng bộ `rage (uint8)`, `skillCd (uint16 ms)`, `ultActive`, `evoMask (4 bit)`, `fullEvoCombo (3 bit, thêm giá trị '1234')`, `evoSlots (2 bit)`.
- Thực thể Skill/Ultimate dùng chung trong `bodyEffects` phải vào `NET_CLASSES` (`js/online/netstate.js`), chỉ dữ liệu thuần. Banner tên chiêu là sự kiện UI một lần (`ultBanner{side, name}`).
- Kết liễu bằng Ultimate dùng hằng duy nhất `FINISHER_FX_CLASSES` + `xxFxOver()` như quy ước.
- Mua evo/G.E.A.R ô Evo, bồi thường +$200 & lượt chọn Vàng cho đối thủ: chốt ở host.

### 1.10 Nguyên tắc cân bằng

1. Skill = hỗ trợ / "nút đã tay": sát thương trực tiếp ≤ 1.5 × phát chuẩn của body.
2. Ultimate = khoảnh khắc trận: ≈ 3–4 phát mạnh hoặc khoá vùng ≤ 4s. **Không giết ngay mục tiêu đầy máu**; kết liễu chỉ khi thoả điều kiện phụ (thường địch ≤ 15–40% máu tuỳ độ khó đạt điều kiện).
3. CD Skill: nhẹ 6–8s, trung bình 10–14s, nặng 16–22s; ≤ 8 lần/hiệp.
4. Nộ lên nhanh hơn khi thua nhưng không đủ lật kèo một mình.
5. Evo 3 phải đổi cách chơi; mỗi cơ chế có điểm yếu (cửa sổ phản công, chi phí, thời gian tụ).
6. Mỗi body 1 Skill + 1 Ultimate; miễn nhiễm toàn phần ≤ 1.5s (trừ chiêu ghi rõ).
7. Laser/hitscan trong Skill/Ultimate luôn qua `scheduleHitscan` / `HitscanWarning` (người bắn đứng yên khi cảnh báo). Kiểm tra cả P1 (dưới, bắn lên) và P2 (trên, bắn xuống).
8. Win-rate từng body vs Cơ Bản 45–55% ở "2 Evo + Full Evo" và "4 Evo + `'1234'`"; lệch > 8% chỉnh giá trước, số sau.
9. **Không hai body trùng ý tưởng Skill/Ultimate** (mục 3 đã rà trùng).

### 1.11 Lộ trình triển khai

| Phase | Nội dung | Tiêu chí hoàn thành |
|---|---|---|
| **P0 – Khung** | Ô Evo (2 mặc định), `evoOrder`, 2 G.E.A.R ô Evo, nút Skill + vòng Nộ + băng tên chiêu, `Rage` chung, điều kiện tung/kết liễu, `FULL_EVO_COMBOS` (+`'1234'`), input `skill`, bot mặc định, cờ `FEATURE_EVO34`. | Body demo chạy 4 hiệp, bot + online; tắt cờ như cũ. |
| **P1 – 10 body thí điểm** | `basic` (MAIN), `tank`, `ice`, `paradox`, `prism`, `engineer`, `sniper`, `berserker`, `healer`, `one_punch` (đủ vai trò, có kết liễu, có điều kiện tung riêng). | Win-rate 45–55%, không lỗi đồng bộ. |
| **P2 – Phần còn lại** | Theo nhóm vai trò, lô 10–12 body, kèm G.E.A.R mới. | Mỗi lô: `node tools/smoke.js` sạch, cập nhật `body-guides.js`. |
| **P3 – Hoàn thiện** | Hiệu ứng/âm thanh Ultimate, băng tên, hướng dẫn, QA mobile + online. | Checklist QA xong. |

---

## 2. G.E.A.R mới

> Định dạng: **Tên** — tầng (Bạc / Vàng / Lăng Kính, theo `GEAR_TIERS`) — hiệu ứng — gắn với.

**Nhóm ô Evo (luật mới, dòng `fam_evo_slot`)**

1. **Tiến Hóa Lần Nữa** — **Lăng Kính** — Mở ô Evo thứ 3. Full Evo vẫn tính theo 2 Evo mua đầu tiên. Không xuất hiện cho Cơ Bản bản thường. Gắn: **ô Evo**.
2. **Con Đường Tiến Hóa** — **Lăng Kính** — Mở ô Evo thứ 3 và 4; đủ 4 Evo → Full Evo `'1234'`. Mỗi Evo đang có: +12% dame, −4% st nhận, +3% tốc, −7% thời lượng khống chế; Max HP +3/+5/+6/+10 (mốc 1/2/3/4 Evo). Cấm mua FEET trừ Lợi Tức. Đối thủ ngay lập tức +$200 và 1 lượt chọn G.E.A.R Vàng. Gắn: **ô Evo, Full Evo `'1234'`**.
3. **Bản Đồ Tiến Hóa** — Bạc — Thẻ Evo bị khoá (hết ô) vẫn cho xem trước combo với Evo đã có; Evo thứ 2 mua trong trận giảm 15%. Gắn: **chọn tổ hợp**.

**Nhóm Skill / Nộ / Full Evo (giữ từ bản trước, đã đổi tầng sang hệ hiện tại)**

4. **Bình Nhiên Liệu Nộ** — Bạc — Nộ +20% từ mọi nguồn.
5. **Đồng Hồ Cát Chiến Thuật** — Bạc — Skill hồi nhanh hơn 15%.
6. **Chuông Thức Tỉnh** — Vàng — Khi Nộ đầy: khiên 1 máu + 20% tốc đánh 4s.
7. **Huy Hiệu Đa Năng** — Vàng — Evo thứ 2 trong trận giảm 25% (1 lần).
8. **Mảnh Ghép Tổ Hợp** — Vàng — Giảm 30% phụ trội Full Evo; tổ hợp không có hiệu ứng riêng nhận phần chung ×1.5.
9. **Lõi Cộng Hưởng** — Lăng Kính — Có Evo 3 + Evo 4: mỗi lần kích cơ chế Evo 3 nạp +8 Nộ (cộng dồn với combo `'34'`).
10. **Hộp Sạc Phản Đòn** — Bạc — Nhận sát thương +3 Nộ mỗi đòn, Nộ theo thời gian −25%.
11. **Cò Hai Nhịp** — Vàng — Sau Skill, phát kế +50% dame và +5 Nộ.
12. **Dây Chuyền Dư Chấn** — Lăng Kính — Ultimate xong 3s: hồi 1 máu, Skill hồi ngay 50% CD.
13. **Bản Đồ Chiến Thuật Nộ** — Bạc — Thấy Nộ đối thủ dạng viền khi ≥ 80%; Nộ bản thân theo thời gian −10%.
14. **Kính Soi Tổ Hợp** — Bạc — Xem trước mọi tổ hợp Full Evo, phí Full Evo −15$.
15. **Tim Dự Phòng** — Lăng Kính — Lần đầu HP chạm 0 trong hiệp, nếu Nộ ≥ 50: tiêu 50 Nộ hồi 40% máu, bất tử 1.5s.

**Nhóm Chiêu Cuối mới (luật kết liễu / điều kiện tung)**

16. **Lưỡi Hái Định Mệnh** — Vàng — Ngưỡng kết liễu của Ultimate +5% Max HP địch (ví dụ 25% → 30%). Không có tác dụng với body không có kết liễu: thay bằng Ultimate +15% dame.
17. **Điều Kiện Nới Lỏng** — Vàng — Điều kiện tung riêng giảm 1 nấc (Kỹ Sư 3 ụ → 2 ụ, ấn 3 tầng → 2 tầng...), nhưng Nộ cần đầy 110 (vòng Nộ đổ thêm 1 vòng mảnh).
18. **Bùa Hộ Mệnh Phản Kết Liễu** — Bạc — Lần đầu mỗi hiệp bị Ultimate kết liễu: sống lại với 1 HP (không chặn sát thương thường của Ultimate). Gắn: **đối trọng kết liễu**.

Tỷ lệ rơi: hai món ô Evo theo tỷ lệ Lăng Kính hiện tại nhưng **không xuất hiện ở lượt chọn đầu tiên của trận** (để không định đoạt quá sớm).

---

## 3. Gợi ý theo từng BODY (viết lại toàn bộ)

> Mỗi body: **Evo 3** (tên, cơ chế, giá) · **Skill Evo 4** (tên, CD, hiệu ứng; giá Evo 4 ghi kèm) · **Nộ** (nguồn riêng chính + phụ; điều kiện tung nếu có) · **Ultimate** (tên, hiệu ứng, kết liễu nếu có) · **Dấu ấn** (hình ảnh đặc trưng lúc tung; băng tên chiêu luôn hiện ở mép màn phía người tung, xem 1.2) · **Combo** Full Evo đáng chú ý.
> "nhấp" = chạm nhanh nút Bắn, "giữ" = giữ nút Bắn. Số liệu theo "phát bắn chuẩn" của body. Thứ tự theo `MODULES.BODY`.
> Mỗi ý tưởng Skill / Ultimate là **duy nhất** trong toàn bộ danh sách (đã rà trùng).

### 3.1 Lô 1 (#1–#23)

**1. Cơ Bản (`basic`)** — Nhân vật chính. **Bản thường: chỉ Evo 1/2, không Skill.** Mọi thứ dưới đây là của **bản MAIN** (có sẵn 4 Evo + `'1234'`).
- Evo 3 *Bước Chân Chính Diện* (MAIN, có sẵn): chạm đúp ←/→ để lướt ở **mọi hiệp** (CD 2.5s), 0.15s đầu lướt xuyên đạn.
- Skill *Đạn Hợp Nhất* (MAIN, có sẵn; CD 10s): dồn **toàn bộ đạn còn trong băng** thành 1 viên Hợp Nhất khổng lồ (dame = tổng × 0.8, xuyên 1 mục tiêu); băng nạp lại bình thường.
- Nộ: nhận sát thương (chính) + **né sát** (đạn địch lướt qua trong 20px: +6).
- Ultimate *LỬA CHƯA TÀN*: bật **Cơ Hội Cuối 6s ở bất kỳ hiệp nào**, kết thúc bằng 1 Hợp Nhất cỡ nửa sân. Kết liễu: viên cuối hạ gục địch ≤ 25% máu.
- Dấu ấn: ngọn lửa cam bùng quanh xe, băng tên kèm khẩu hiệu "Chiến đấu đến khi lửa tàn!!".
- **Evo MAIN α — *Hào Quang Nhân Vật Chính*** (220$): mỗi lần né sát +1 Hào Quang (tối đa 5, mất 1 tầng mỗi lần trúng đòn): +6% dame & tốc mỗi tầng; đủ 5 → phát kế tiếp là Hợp Nhất + hồi 1 khiên.
- **Evo MAIN β — *Ký Ức Thứ Hai*** (260$): sau khi HỒI ỨC đã dùng, mỗi hiệp thắng +1 Mảnh Ký Ức; đủ 2 → HỒI ỨC nạp lại một lần (hồi sinh 50% máu, bất tử 1.5s, không thức tỉnh thêm).
- Combo `'1234'` (MAIN): Đạn Hợp Nhất của Skill nổ lan + làm chậm; Lửa Chưa Tàn kéo dài 8s.

**2. Xe Tiền (`money_tank`)** — Tiền là đạn, tiền là giáp.
- Evo 3 *Bắn Bằng Vàng* (110$): **giữ 0.5s bật/tắt** chế độ đạn vàng: mỗi phát tốn $1, +40% dame, trúng xe tiền rơi gấp đôi.
- Skill *Mua Chuộc* (CD 16s, 170$): tiêu $30 → **mọi đạn địch đang ở nửa sân bạn hoá thành đồng xu** ($1 mỗi viên, tự hút về xe).
- Nộ: +1 mỗi $ tiêu hoặc nhặt (×0.5) + gây sát thương.
- Ultimate *THU MUA THÙ ĐỊCH*: 4s trời trút bao tiền & xe tiền mini xuống làn địch (vòng cảnh báo 0.8s), mỗi quả 1 dame và **cướp $5** của địch.
- Dấu ấn: màn vàng rực, ký hiệu $ xoay lớn trên xe, tiếng máy đếm tiền.
- Combo: `'24'` Mua Chuộc miễn phí khi đang có ≥ $300; `'13'` đạn vàng chỉ tốn $0.5; `'1234'` xe tiền Evo 1 lao kèm suốt Ultimate.

**3. Xe TANK (`tank`)** — Húc, gánh, hồi khiên.
- Evo 3 *Cần Lái Thủy Lực* (130$): **giữ Bắn = lao liên tục tối đa 1.5s**, bẻ lái ←/→ khi đang lao (đường húc cong).
- Skill *Xả Khiên Dự Phòng* (CD 12s, 150$): **lấy ngay vòng hồi khiên nội tại** (không chờ 6s): +1 khiên tức thì, khiên mới nổ đẩy lùi đạn quanh xe.
- Nộ: +12 mỗi cú húc trúng; sát thương nhận khi đang lao tính ×2.
- Ultimate *XE ỦI*: 3s lao thẳng **băng qua vạch giữa vào tận làn địch**, ủi đạn/triệu hồi/công trình, chạm địch ép dính vào biên 2.5 dame + choáng 1s. Kết liễu: địch ≤ 20% bị ủi nát.
- Dấu ấn: vệt xích nứt sàn, bụi đá văng, còi hơi rền.
- Combo: `'13'` lao Thủy Lực không giảm tốc khi bẻ lái; `'24'` khiên nổ của Skill kèm băng; `'1234'` Xe Ủi để lại 2 vệt băng hai bên.

**4. Pháo Băng (`ice`)** — Chậm dần rồi đóng băng.
- Evo 3 *Hơi Thở Băng Giá* (100$): **giữ 1s** bắn mũi băng xuyên; đường bay thành **làn băng trơn** 4s (địch đi qua bị trượt quán tính).
- Skill *Đông Cứng Tức Thì* (CD 12s, 140$): mọi địch **đang bị chậm** đóng băng ngay 0.8s (Juggernaut miễn, chỉ giữ chậm).
- Nộ: +10 mỗi lần gây chậm mới, +20 mỗi Bão Tuyết.
- Ultimate *ĐỘ KHÔNG TUYỆT ĐỐI*: đóng băng địch 2s, rồi băng vỡ gây dame theo số giây địch đã bị chậm trong hiệp (tối đa 3). Kết liễu: địch đang đóng băng ≤ 20% → vỡ vụn.
- Dấu ấn: tinh thể băng bò từ mép màn vào, khói lạnh trắng xanh, tiếng nứt kính.
- Combo: `'13'` Bão Tuyết nở dọc làn băng; `'24'` Hàn Băng x1.5 cả với địch đóng băng; `'1234'` Ultimate đóng băng luôn mọi đạn địch đang bay.

**5. Đạn Lớn (`big_bullet`)** — Quả cầu là khiên, là bóng, là thiên thạch.
- Evo 3 *Ôm Bóng* (140$): **giữ Bắn** = quả cầu lăn trước mũi xe làm **khiên chặn đạn** (nuốt đạn để to dần), nhả = sút đi.
- Skill *Cú Sút Bẻ Lái* (CD 9s, 150$): mọi quả cầu đang bay **bẻ hướng nhắm thẳng địch** và +1 lần nảy.
- Nộ: +8 mỗi lần nảy tường, +15 mỗi đạn bị cầu chặn (Evo 3).
- Ultimate *HÀNH TINH*: 1 quả cầu rộng 1/3 sân lăn chậm qua làn địch, hút nhẹ, ăn đạn để to thêm, chạm biên nổ 360° mảnh.
- Dấu ấn: bóng đổ khổng lồ phủ làn địch trước khi cầu tới, rung màn.
- Combo: `'13'` cầu ôm to gấp rưỡi; `'23'` mỗi đạn bị ôm +1 lần nảy; `'1234'` Hành Tinh nảy 3 lần giữa hai biên.

**6. Shotgun (`shotgun`)** — Cự ly gần là chân lý.
- Evo 3 *Song Phát* (120$): **giữ 0.4s** nạp cả 2 đạn vào 1 phát: 10 viên + **giật lùi xe** 60px (vừa bắn vừa lùi né).
- Skill *Giật Báng Áp Sát* (CD 8s, 140$): bắn 1 phát ra sau lưng → **lực giật phóng xe vọt lên trước** 120px, phát kế tiếp bắn ngay khi đang lướt.
- Nộ: +3 mỗi viên trúng ở cự ly < 150px + sát thương nhận.
- Ultimate *MIỆNG RỒNG*: 2s phun nón chì-lửa liên tục ở cự ly gần (30 viên ngắn), đẩy địch dính tường. Kết liễu: địch ≤ 25% trong 150px.
- Dấu ấn: đầu rồng lửa há miệng ở nòng, vỏ đạn đỏ văng.
- Combo: `'13'` Song Phát 12 viên; `'24'` Skill nạp lại 1 băng; `'1234'` Miệng Rồng hút nhẹ địch vào nón.

**7. Cuộn Quá Tải (`overload`)** — Chơi với điện áp.
- Evo 3 *Trữ Áp* (150$): **giữ Bắn** khi thanh đầy để đẩy năng lượng lên 200% (Đạn Sạc to, nổ x2); quá 150% xe tự giật 0.2 HP mỗi giây.
- Skill *Đoản Mạch* (CD 10s, 160$): **xả ngay toàn bộ năng lượng đang có** thành vòng nổ điện quanh xe (dame theo %), xoá đạn thường gần.
- Nộ: +12 mỗi Đạn Sạc trúng, +6 mỗi giây ở trạng thái quá áp.
- Ultimate *SIÊU TÂN TINH ĐIỆN*: 4s thanh luôn đầy — mọi phát là Đạn Sạc; các vụ nổ nối nhau bằng tia sét.
- Dấu ấn: cuộn dây rực tím, sét chạy dọc viền sân.
- Combo: `'13'` thanh phụ cũng trữ áp; `'24'` Đoản Mạch câm lặng 1s; `'1234'` mỗi Đạn Sạc nổ dây chuyền thêm 1 lần.

**8. Tiểu Liên (`smg`)** — Băng đạn là nhịp sống.
- Evo 3 *Thay Băng Chiến Thuật* (100$): **nhấp đúp** thay băng sớm; thay khi còn ≤ 3 viên → băng mới có 6 viên đầu nổ nhỏ.
- Skill *Ném Băng Rỗng* (CD 9s, 130$): ném băng đang dùng như lựu đạn (1.2 dame, choáng 0.4s) và **nạp đầy tức thì**.
- Nộ: +1 mỗi 3 viên trúng, +10 mỗi lần thay băng "đúng lúc".
- Ultimate *SẤY KHÔNG NGHỈ*: 5s băng vô hạn, không lắc, tốc bắn tăng tới x2.5, đạn xuyên 1 mục tiêu.
- Dấu ấn: vỏ đạn vàng đổ tràn làn mình, nòng đỏ rực.
- Combo: `'13'` thay đúng lúc còn tăng +20% tốc bắn 3s; `'23'` Băng Đạn X: 6 viên nổ thành 10; `'1234'` hết Ultimate tự ném 3 băng rỗng.

**9. Lazer Xuyên Phá (`lazer_charge`)** — Một tia, một lần, chính xác.
- Evo 3 *Tách Tia* (150$): khi đầy, **giữ 0.4s rồi nhả** → chia năng lượng thành 3 tia quạt (mỗi tia 35% dame, cảnh báo riêng).
- Skill *Nạp Khẩn Cấp* (CD 18s, 200$): **nạp đầy ngay** đổi lấy 0.5 HP; tia kế tiếp cảnh báo dài hơn 0.2s.
- Nộ: +25 mỗi Tia Xuyên Phá trúng, nền +0.5/s.
- Ultimate *ĐƯỜNG CHÂN TRỜI*: vạch cảnh báo 0.6s rồi tia **quét ngang toàn sân** trái → phải trong 1.2s (xe đứng yên, `scheduleHitscan`). Kết liễu: trúng địch ≤ 50% máu (tia đắt nhất game).
- Dấu ấn: màn tối sập xuống, một đường trắng chói cắt ngang sân.
- Combo: `'13'` 3 tia tách mỗi tia 50%; `'24'` Ultimate lưu ảnh 2s gây dame; `'1234'` Đường Chân Trời quét 2 lượt (đi + về).

**10. Lazer Pháo (`lazer_auto`)** — Nhiệt là tài nguyên.
- Evo 3 *Xả Van* (110$): **nhả nút khi Nhiệt ở 80–95%** (vùng vàng trên vòng) → phun hơi nóng hình nón 0.8 dame và Nhiệt về 0 ngay.
- Skill *Quá Nhiệt Có Chủ Đích* (CD 14s, 150$): đẩy Nhiệt lên 100% **mà không bị khoá**: 3s tia Nóng Trắng +70% dame, sau đó khoá 1.5s như thường.
- Nộ: +1 mỗi tia bắn khi Nhiệt ≥ 60%, +15 mỗi lần Xả Van đúng vùng.
- Ultimate *LÕI NÓNG CHẢY*: 4s Nhiệt khoá ở 99%, tia đỏ dày xuyên mọi thứ, để lại rãnh nham thạch trên làn địch.
- Dấu ấn: nòng chảy đỏ, không khí méo vì nhiệt.
- Combo: `'13'` Xả Van đẩy lùi; `'23'` Phá Hủy: rãnh nham thạch rộng gấp đôi; `'1234'` hết Ultimate tự Xả Van miễn phí.

**11. Pháo Tên Lửa (`rocket`)** — Pháo thủ có tay lái.
- Evo 3 *Đầu Dò Lái Tay* (130$): **giữ Bắn sau khi phóng** để lái tên lửa bằng ←/→ (xe đứng yên trong lúc lái).
- Skill *Kích Nổ Từ Xa* (CD 6s, 140$): mọi tên lửa đang bay **nổ ngay tại chỗ**, bán kính ×1.3.
- Nộ: +12 mỗi vụ nổ trúng, +5 mỗi vật thể bị phá.
- Ultimate *TÊN LỬA LIÊN LỤC ĐỊA*: 1 tên lửa khổng lồ phóng vọt khỏi màn; 2s sau rơi xuống với vòng cảnh báo co dần (địch thấy) — trong 2s đó bạn **lái điểm rơi bằng ←/→**; nổ cực rộng 3 dame ở tâm.
- Dấu ấn: giàn phóng bật lên khỏi nóc xe, vệt khói trắng thẳng đứng, còi đếm ngược.
- Combo: `'13'` tên lửa lái tay +50% dame; `'24'` Hạt Nhân: tâm nổ để lại phóng xạ 4s; `'1234'` tên lửa tách 3 đầu đạn khi rơi.

**12. Cổng Không Gian (`portal`)** — Xuyên biên, xuất hiện từ phía kia.
- Evo 3 *Đạn Xuyên Biên* (120$): đạn chạm biên trái/phải **chui ra biên đối diện** (wrap như xe), +20% dame sau mỗi lần xuyên.
- Skill *Gấp Không Gian* (CD 7s, 150$): **dịch chuyển tức thì sang vị trí đối xứng** ở biên kia (X → W−X), kích hoạt luôn hiệu ứng xuyên biên (Evo 1/2).
- Nộ: +8 mỗi lần xe xuyên biên, +6 mỗi đạn đã xuyên biên trúng địch.
- Ultimate *KHÔNG GIAN GẤP KHÚC*: 4s **đạn của bạn xuất hiện từ phía sau làn địch** (sinh ra ở biên xa, bay ngược về địch) xen kẽ đạn thường.
- Dấu ấn: sân nứt thành ô kính tím, viền biên nhấp nháy cổng.
- Combo: `'13'` Cổng Bắn cũng xuyên biên; `'23'` Skill hồi đầy đạn; `'1234'` Ultimate kéo dài 6s và đạn sau lưng nổ.

**13. Phong Trảm (`wind_slash`)** — Chờ đợi là sức mạnh.
- Evo 3 *Tra Kiếm Vào Vỏ* (120$): **giữ Bắn** = đứng yên tra kiếm, thanh tụ nhanh gấp 3; nhả = Bạt Đao chém ngay.
- Skill *Nhất Thiểm* (CD 14s, 150$): tung **ngay một nhát chém lực tối đa** mà không tiêu thanh tụ đang có.
- Nộ: +10 mỗi kiếm khí phá đạn, +15 mỗi nhát lực tối đa.
- Ultimate *VẠN PHONG TRẢM*: 8 kiếm khí full lực đan chéo xoá mọi đạn trên sân, mỗi nhát 0.8. Kết liễu: nhát cuối hạ địch ≤ 20%.
- Dấu ấn: gió xám cuộn lá, vết chém trắng đọng trên màn 0.3s.
- Combo: `'13'` Bạt Đao luôn Full Lực; `'23'` Nghịch Phong: kiếm khí Ultimate phản đạn bị chém; `'1234'` Ultimate 12 nhát.

**14. Cuồng Phong (`storm`)** — Lao lên, lốc xoáy, trở về.
- Evo 3 *Gió Đổi Chiều* (130$): đang lao, bấm ←/→ để **bẻ góc 1 lần** (đường lao hình chữ V).
- Skill *Hồi Phong* (CD 10s, 150$): ngay sau cú lao, bấm để **bay ngược về đúng điểm xuất phát**, chém thêm 1 lượt trên đường về.
- Nộ: +10 mỗi lần lao phản đạn + sát thương nhận.
- Ultimate *CUỒNG PHONG LÔI BẠO*: 4s hoá lốc khổng lồ lái tự do khắp sân (bất tử 1.5s đầu), hút đạn và địch, sét giáng mỗi 0.5s. Kết liễu: địch ≤ 25% bị lốc nuốt.
- Dấu ấn: mây đen kéo ngang trời, chớp xanh liên tục.
- Combo: `'13'` Mắt Bão: bẻ góc xoá đạn quanh xe; `'24'` Ultimate kèm Phân Thân lao chém; `'1234'` Hồi Phong không CD trong Ultimate.

**15. Axit Hóa (`acid`)** — Ăn mòn từ gốc.
- Evo 3 *Hũ Axit* (110$): **giữ 0.5s** ném hũ vòng cung (vượt vật cản) vỡ thành vũng ăn mòn nhỏ 3s.
- Skill *Rút Tinh Chất* (CD 14s, 160$): **hút về toàn bộ Max HP địch đã bị ăn mòn trong 6s gần nhất** thành Max HP tạm cho bạn (hết hiệp mất).
- Nộ: +8 mỗi 0.25 Max HP ăn mòn được.
- Ultimate *MƯA AXIT*: 4s mưa axit khắp làn địch: −0.25 Max HP/giây, khiên & Giáp Trắng tan nhanh gấp đôi. Kết liễu: địch Max HP còn ≤ 2 → tan chảy.
- Dấu ấn: mây tím rỉ giọt, sàn sủi bọt.
- Combo: `'13'` Hũ tạo vùng như Bào Mòn; `'24'` Độc Hại: ngưỡng kết liễu Ultimate thành 2.5 Max HP; `'1234'` mưa kéo dài 6s.

**16. Kỹ Sư (`engineer`)** — Pháo đài lắp ghép.
- Evo 3 *Ụ Gắn Nóc* (150$): **nhấp đúp** gắn Ụ Thông Minh gần nhất lên nóc xe (bắn khi di chuyển, 60% tốc bắn), nhấp đúp lần nữa đặt lại xuống.
- Skill *Đồng Loạt Khai Hoả* (CD 10s, 160$): mọi ụ bắn ngay 1 loạt x2 dame về địch và hồi 30% máu ụ.
- Nộ: +6 mỗi Phụ Tùng nhận, +1/s cho mỗi ụ đang sống. **Điều kiện tung: có ≥ 3 ụ trên sân.**
- Ultimate *PHÁO ĐÀI*: 3 ụ gần nhất hợp thể thành **Ụ Siêu Pháo** 6s, bắn tia raycast cảnh báo mỗi 0.6s, hết giờ tách lại 3 ụ đầy máu.
- Dấu ấn: tay máy kéo các ụ về giữa, tia hàn xanh, khung thép dựng lên.
- Combo: `'13'` ụ gắn nóc bắn 100%; `'24'` Siêu Pháo có vòng Mạng LAN hồi máu; `'1234'` Siêu Pháo bắn xuyên tường.

**17. Ghost (`ghost`)** — Lúc có lúc không.
- Evo 3 *Nhập Hồn* (110$): **nhấp đúp** đổi chỗ với Tàn Ảnh gần nhất (CD 3s), để lại tàn ảnh ở chỗ cũ.
- Skill *Vô Ảnh Tức Thì* (CD 9s, 140$): vào Vô Ảnh **ngay lập tức** bất kể chu kỳ (1.5s), phát kế tiếp xuyên.
- Nộ: +10 mỗi phát trúng khi đang vô hình, +5 mỗi lần né đạn trong 30px.
- Ultimate *QUỶ NHẬP TRÀNG*: Ghost tan biến, **nhập vào bóng xe địch** 2.5s: địch bị đảo điều khiển trái-phải (Juggernaut miễn) và mất 0.4 dame mỗi 0.5s; thoát ra nổ đẩy lùi. Kết liễu: địch ≤ 20% lúc thoát ra.
- Dấu ấn: màn ngả xanh lam, tiếng thì thầm, xe địch phủ bóng đen có đôi mắt trắng.
- Combo: `'13'` Nhập Hồn kích Vô Ảnh 0.5s; `'24'` Ảo Ảnh: Tàn Ảnh bắn vào địch đang bị nhập; `'1234'` nhập hồn 3.5s.

**18. Pháo Cao Xạ (`aaa`)** — Đồng hồ pháo kích.
- Evo 3 *Hiệu Chỉnh Toạ Độ* (130$): **giữ Bắn** để giữ vòng pháo kích lại tối đa 1.5s, vòng bám trục X của bạn; nhả = nổ.
- Skill *Khai Hoả Ngay* (CD 8s, 140$): **kích ngay chu kỳ tự bắn 4s** (không chờ vòng đếm), phát này x1.5 và vòng đếm bắt đầu lại.
- Nộ: +10 mỗi pháo kích trúng, +4 mỗi vật thể bay bị bắn hạ.
- Ultimate *LƯỚI PHÒNG KHÔNG*: 4s tự bắn hạ mọi vật thể bay của địch (đạn đạo, drone, phi ảnh, bom) + 8 quả pháo kích rơi theo địch.
- Dấu ấn: đèn pha quét trời, còi báo động, pháo sáng đỏ.
- Combo: `'13'` vòng giữ lại nổ to hơn 30%; `'24'` Ultimate kèm Mưa Tên Lửa; `'1234'` mỗi vật thể bị bắn hạ rơi thành 1 quả pháo kích.

**19. Kiếm Tôn (`blade_god`)** — Quang / Ám và nhát thứ 10.
- Evo 3 *Kiếm Tâm Tự Chọn* (140$): **giữ 0.4s** chọn trước loại kiếm kế tiếp (phá luân phiên), đổi lại nhát đó không tính bộ đếm.
- Skill *Quy Tông* (CD 10s, 170$): mọi Quang Kiếm đang lơ lửng **phóng tia đồng loạt ngay** (bỏ 2s ngắm).
- Nộ: +4 mỗi nhát kiếm trúng, +12 mỗi Phá Thiên tự nhiên. **Điều kiện tung: bộ đếm ≥ 5/10.**
- Ultimate *PHÁ THIÊN GIÁNG THẾ*: tung Phá Thiên Kiếm ngay, cỡ x2, rơi từ trời, câm lặng 2s; bộ đếm về 0. Kết liễu: địch ≤ 30% bị chém đôi.
- Dấu ấn: trời nứt đôi, thanh kiếm vàng-đen khổng lồ hạ xuống.
- Combo: `'13'` Quang Kiếm Loạn Ảnh tự chọn đúng loại; `'24'` Phá Thiên kéo theo 4 kiếm Tuyệt Diệt; `'1234'` sau Ultimate bộ đếm bắt đầu ở 5.

**20. Kiếm Trận (`van_kiem`)** — Đạo quân kiếm.
- Evo 3 *Kiếm Trận Hộ Thân* (130$): **nhấp** (khi không giữ) → kiếm đang treo xếp vòng xoay quanh xe 3s, chặn đạn thường (mỗi kiếm chặn 1).
- Skill *Vạn Kiếm Quy Nhất* (CD 12s, 160$): mọi kiếm đang bay/treo **hợp thành 1 Đại Kiếm** phóng thẳng (dame theo số kiếm, tối đa x4).
- Nộ: +1 mỗi kiếm trúng, +10 mỗi lần vào Kiếm Thế.
- Ultimate *KIẾM THẾ VẠN TƯỢNG*: 4s Kiếm Thế tối đa **không cần giữ và đi lại tự do**, kiếm phóng từ 3 cửa sau lưng (trái/giữa/phải) với tốc x3; kết thúc bằng Đại Kiếm.
- Dấu ấn: ba vòng trận pháp kiếm xoay sau lưng xe như hào quang.
- Combo: `'13'` vòng hộ thân phản đạn; `'23'` Đại Kiếm xuyên thấu; `'1234'` Ultimate thêm 2 cửa kiếm.

**21. Súng Nước (`water_gun`)** — Áp lực nước.
- Evo 3 *Phản Lực Nước* (120$): đang giữ phun, bấm ←/→ → **vòi đẩy xe lướt ngang** (tốn 8% nội năng).
- Skill *Áp Suất Cực Đại* (CD 8s, 140$): bắn **Laser nước ngay**, không cần giữ 1s (vẫn cột cảnh báo 0.5s, `scheduleHitscan`).
- Nộ: +2 mỗi giây Vòi Rồng trúng, +8 mỗi Laser nước trúng.
- Ultimate *SÓNG THẦN*: một bức tường nước rộng toàn sân tràn từ làn bạn sang làn địch: xoá đạn, dập lửa/vũng, đẩy địch ép biên 1.5 dame.
- Dấu ấn: mực nước dâng ở mép màn phía bạn rồi ập qua.
- Combo: `'13'` lướt phản lực không tốn nội năng; `'24'` Sóng Thần làm chậm 2s; `'1234'` sóng dội ngược lần 2 về phía địch.

**22. Lò Nung (`furnace`)** — Năm tầng lửa.
- Evo 3 *Than Hồng* (120$): mỗi vụ Nổ 5 tầng để lại bãi than 3s trên làn địch (+1 tầng Đốt mỗi giây đứng trên).
- Skill *Mở Cửa Lò* (CD 10s, 150$): **kích nổ ngay** mọi địch đang có ≥ 2 tầng Đốt (dame theo số tầng, như nổ 5 tầng thu nhỏ).
- Nộ: +10 mỗi vụ Nổ, +1 mỗi tầng Đốt đặt lên.
- Ultimate *LÒ LUYỆN NGỤC*: 5s xe hoá lò đỏ: mọi đòn +2 tầng, vòng lửa toả quanh xe, địch trong 200px bị kéo nhẹ về trục X của bạn. Kết liễu: Nổ 5 tầng lên địch ≤ 25%.
- Dấu ấn: nắp lò bật mở, tia lửa phun lên trời.
- Combo: `'13'` than hồng tồn tại 5s; `'23'` Tích Tụ: Mở Cửa Lò để lại Vùng Lửa; `'1234'` Ultimate kéo dài 7s.

**23. Âm Dương Sư (`am_duong_su`)** — Cân bằng Âm – Dương.
- Evo 3 *Đảo Cực* (130$): **giữ 0.4s** đảo cực mọi bùa đang dán (Âm ↔ Dương) để ép cặp lệch thành cặp kích nổ.
- Skill *Thái Cực Đồ* (CD 14s, 160$): đặt pháp đồ âm dương dưới chân 3s: đạn địch vào nửa Âm bị chậm 60%, vào nửa Dương bị **đảo ngược** về chủ.
- Nộ: +10 mỗi cặp bùa nổ.
- Ultimate *CỬU VĨ THỨC THẦN*: gọi Thức Thần cáo chín đuôi 5s — mỗi đuôi là 1 lá bùa tự dán lên địch theo cặp Âm-Dương, nổ liên hoàn. Kết liễu: lá thứ 9 nổ khi địch ≤ 30%.
- Dấu ấn: hồ ly trắng chín đuôi hiện sau xe, đuôi xoè thành quạt bùa.
- Combo: `'13'` đảo cực gây choáng 0.3s; `'23'` Thái Cực Đồ để lại Pháp Trận; `'1234'` 12 đuôi bùa.

### 3.2 Lô 2 (#24–#46)

**24. 6 Nòng (`six_barrel`)** — Nòng quay, nhiệt thành đạn.
- Evo 3 *Quay Không Tải* (120$): **giữ khi không bắn (nhấp đúp rồi giữ)** = nòng quay sẵn không tăng Nhiệt, tạo lá chắn quay gạt đạn nhỏ phía trước (đi chậm 30%).
- Skill *Xả Nhiệt Thành Đạn* (CD 10s, 150$): tiêu **toàn bộ Nhiệt** → bắn 1 loạt đạn nóng chảy (Nhiệt/5 viên), Nhiệt về 0, không câm lặng.
- Nộ: +1 mỗi 0.5s bắn liên tục + sát thương nhận.
- Ultimate *BÃO KIM LOẠI*: 5s không sinh Nhiệt, đi tốc thường, 6 nòng tách 3 hướng quạt.
- Dấu ấn: 6 nòng tách khỏi trục xoè như cánh hoa thép, vỏ đạn mưa.
- Combo: `'13'` lá chắn quay gây 0.2 dame khi chạm; `'23'` Quá Nhiệt: đạn nóng chảy gây Đốt; `'1234'` Ultimate 4 hướng.

**25. Kẻ Mạnh Nhất (`the_strongest`)** — Vô Hạn & Lục Nhãn.
- Evo 3 *Hắc Thiểm Liên Hoàn* (160$): Hắc Thiểm trúng → mở cửa sổ 0.5s **nhấp đúp lần 2** tung Hắc Thiểm nữa không hồi chiêu (tối đa 2 lần nối).
- Skill *Vô Hạn* (CD 12s, 200$): 2s **không đòn nào chạm tới** — đạn, tia, cận chiến dừng ở cách xe 30px rồi tan (không bắt, không trả); không tốn Chú Lực, không ngắt niệm.
- Nộ: +1 mỗi Chú Lực tiêu, +10 mỗi đòn bị vô hiệu bằng Chú Lực. **Điều kiện tung: Chú Lực ≥ 80.**
- Ultimate *LĨNH VỰC: VÔ LƯỢNG KHÔNG XỨ*: 3s địch "quá tải thông tin": không bắn, không di chuyển, HUD trắng (Juggernaut chỉ chậm 50%). Không gây dame — là cửa sổ để bạn tung chiêu.
- Dấu ấn: sân chìm vào vũ trụ đen tím, đôi mắt xanh mở ở mép màn.
- Combo: `'13'` Hư Thức Tử: Hắc Thiểm nối lần 2 hoàn 30 CL; `'24'` Lục Nhãn: Lĩnh Vực hồi đầy Chú Lực; `'1234'` Lĩnh Vực 4s.

**26. Sniper (`sniper`)** — Tường và một viên đạn.
- Evo 3 *Lỗ Châu Mai* (130$): đạn bắn **xuyên qua tường của mình** được +40% dame & +30% tốc bay (tường thành điểm tựa bắn tỉa).
- Skill *Dời Tường* (CD 6s, 150$): tường gần nhất của mình **trượt ngay tới trục X hiện tại** của xe.
- Nộ: +12 mỗi phát trúng, +6 mỗi đòn tường chặn. **Điều kiện tung: đã bắn trúng địch ≥ 2 lần trong hiệp.**
- Ultimate *ĐIỂM ĐẦU*: 2.5s ống ngắm khoá (vạch đỏ bám địch, địch thấy), nhả → hitscan x3 xuyên mọi thứ kể cả tường. Kết liễu: trúng địch ≤ 40% → HEADSHOT.
- Dấu ấn: hai mép màn đen thành khung ống ngắm tròn, tiếng thở chậm.
- Combo: `'13'` Tường Thép: Lỗ Châu Mai +60%; `'23'` Xuyên Thủng: đạn qua tường luôn thành Raycast; `'1234'` Điểm Đầu bắn 2 phát.

**27. Bow (`cung`)** — Nhạy bén, lùi và bắn.
- Evo 3 *Tên Ghim* (110$): mũi tên trúng tường/biên **ghim lại 4s**; mũi tên sau trúng mũi đã ghim → tách 3 mũi về phía địch.
- Skill *Lùi Bước Bắn Tỉa* (CD 9s, 140$): lướt lùi 80px + bắn ngay 3 mũi về địch + **kích Nhạy Bén ngay** (né đòn kế tiếp) dù chưa đủ 8s.
- Nộ: +10 mỗi lần Nhạy Bén né, +6 mỗi mũi Tụ Lực trúng.
- Ultimate *VẠN TIỄN XUYÊN VÂN*: 3 Thiên Tiễn liên tiếp, mỗi mũi sau to hơn và hồng tâm hẹp hơn (khoá đỏ 0.5s mỗi mũi), bỏ qua thời gian Ngắm. Kết liễu: mũi thứ 3 hạ địch ≤ 25%.
- Dấu ấn: cung giương lên trời, mây xé thành lỗ sáng nơi tên rơi.
- Combo: `'13'` mũi ghim tách 5; `'24'` Mưa Tên theo cả 3 Thiên Tiễn; `'1234'` Lùi Bước không CD trong Ultimate.

**28. Mirror (`mirror`)** — Bản sao đối xứng.
- Evo 3 *Ảnh Kép* (120$): đạn bản sao trúng địch gắn "Ảnh Kép" 3s: phát kế tiếp của bản thể trúng địch x1.5.
- Skill *Vỡ Gương* (CD 10s, 150$): bản sao **vỡ thành 6 mảnh kính** bay về địch (0.4 dame mỗi mảnh), tái tạo sau 3s.
- Nộ: +8 mỗi đạn bản sao trúng, +10 mỗi lần Hoán Đổi né được đòn.
- Ultimate *MÊ CUNG GƯƠNG*: 5s xuất hiện 4 bản sao theo 2 trục đối xứng, tất cả bắn 50% dame; địch bắn trúng bản sao bị phản 50% sát thương.
- Dấu ấn: sân tách thành 4 ô gương phản chiếu nhau.
- Combo: `'13'` Ảnh Kép x1.8; `'23'` Hình Chiếu: mảnh kính tạo Ảnh chiếu; `'1234'` bản sao Ultimate cũng Hoán Đổi được.

**29. Vua Đầu Bếp (`sukuna`)** — Giải, Phách, và Lĩnh Vực.
- Evo 3 *Giải Lưới* (150$): **giữ ngay sau một nhát Giải** → 3 nhát Giải tự cắt thành lưới chéo (tốn 3×CL).
- Skill *Phách Thích Ứng* (CD 9s, 200$): nhát chém gây **0.3 + 8% Max HP địch**, xuyên khiên.
- Nộ: +1 mỗi Chú Lực tiêu, +12 mỗi Hắc Thiểm. **Điều kiện tung: Chú Lực ≥ 60.**
- Ultimate *PHỤC MA NGỰ TRÙ TỬ*: Lĩnh Vực 4s: toàn làn địch bị Giải liên tục (0.15 dame/0.25s), không thể chặn/phản. Kết liễu: địch ≤ 25% bị băm nát.
- Dấu ấn: miếu thờ xương đỏ mọc ở mép làn địch, vết chém trắng khắp sân.
- Combo: `'13'` Fuga: lưới Giải để lại lửa; `'24'` Phách Diện Rộng: Lĩnh Vực xoá đạn thường; `'1234'` Lĩnh Vực 5s và kết thúc bằng Fuga miễn phí.

**30. Paradox (`paradox`)** — Thời gian là vũ khí.
- Evo 3 *Dấu Nhân Quả* (160$): mỗi Dư Âm trúng khắc 1 Dấu lên địch (tối đa 4); lần tua ngược/về neo kế tiếp, mọi Dấu nổ 0.3 dame.
- Skill *Quy Neo* (CD 12s, 200$): **về Neo Thời Không ngay lập tức, không cần giữ**; nếu chưa có neo → đặt neo tại chỗ.
- Nộ: +10 mỗi lần tua ngược/về neo, +4 mỗi Dư Âm trúng.
- Ultimate *VÒNG LẶP VÔ TẬN*: kéo địch về **vị trí của 5s trước**, và mọi phát bạn đã bắn trong 5s qua **tái hiện đồng loạt** từ đúng chỗ bắn (100% dame).
- Dấu ấn: màn tua ngược (vệt nhiễu VHS), đồng hồ cát đảo chiều trên xe.
- Combo: `'13'` Dấu Ấn Thời Gian tính cả Dấu Nhân Quả; `'24'` Nghịch Đảo: Vòng Lặp tái hiện cả bóng 3s; `'1234'` mọi Vết Nứt khai hoả theo Vòng Lặp.

**31. Nhà Ảo Thuật (`magician`)** — Màn diễn, không phải trận đấu.
- Evo 3 *Lá Bài Giấu Tay* (130$): phân ảnh bị phá → nổ thành lá bài choáng 0.5s.
- Skill *Màn Nhung* (CD 13s, 160$): kéo rèm đỏ phủ làn mình 1.5s — địch không thấy bạn & phân ảnh; rèm mở ra, mọi phân ảnh **xáo vị trí**.
- Nộ: +10 mỗi lần địch bắn trúng phân ảnh/mồi, +15 khi Thoát Chết.
- Ultimate *CƯA NGƯỜI*: nhốt địch trong hộp ảo thuật 2s, 3 lưỡi cưa xuyên hộp (0.8 dame mỗi lưỡi). Kết liễu: địch ≤ 25% → "Biến mất!".
- Dấu ấn: đèn sân khấu chiếu xuống, mưa mũ & bồ câu trắng.
- Combo: `'13'` lá bài Hoán Đổi Chủ Động 3 lá; `'24'` Loạn Ảnh: Màn Nhung sinh thêm 1 Ảo Ảnh; `'1234'` hộp nhốt 3s.

**32. Nhà Phát Minh (`inventor`)** — Drone và sáng chế.
- Evo 3 *Tay Cầm Điều Khiển* (130$): **giữ Bắn** = lái drone trực tiếp (xe đứng yên), nhấp khi đang lái = drone bắn.
- Skill *Drone Cảm Tử* (CD 12s, 150$): drone lao vào địch nổ 2 dame, **hồi sinh miễn phí sau 4s**.
- Nộ: +6 mỗi Linh Kiện, +8 mỗi phát drone trúng.
- Ultimate *PHÁT MINH THẾ KỶ*: dựng Pháo Tesla trên làn mình 6s, nối sét với mọi drone thành **lưới điện**; địch chạm lưới choáng 0.6s.
- Dấu ấn: bản vẽ xanh trải trên sân rồi bật thành vật thật.
- Combo: `'13'` drone lái tay 100% chỉ số; `'23'` 2 drone cùng lái theo đội hình; `'1234'` lưới điện chặn đạn thường.

**33. Shadow Hunter (`shadow_hunter`)** — Thợ săn trong bóng tối.
- Evo 3 *Dấu Máu* (120$): địch đang Chảy Máu để lại vệt; Đòn Cường Hoá **tự tìm nhẹ** kẻ đang Chảy Máu.
- Skill *Màn Đêm* (CD 14s, 160$): 2.5s màn hình địch tối dần, chỉ thấy vòng nhỏ quanh xe mình — đạn bạn chỉ hiện khi vào vòng đó.
- Nộ: +10 mỗi Đòn Cường Hoá trúng.
- Ultimate *SĂN ĐÊM*: 5s Vô Hình liên tục, mọi đạn là Đòn Cường Hoá, Chảy Máu x2. Kết liễu: trúng địch ≤ 25% đang Chảy Máu.
- Dấu ấn: trăng đỏ ở mép màn, đôi mắt vàng loé trong bóng.
- Combo: `'13'` Dấu Máu kéo dài Mù HUD; `'24'` Phục Kích: Ultimate rải 4 cạm bẫy; `'1234'` Màn Đêm tự bật đầu Ultimate.

**34. Shortgun (`shortgunATK`)** — Áp sát, bộc phá, rút.
- Evo 3 *Rút Lui Chiến Thuật* (120$): **giữ Bắn ngay sau nón bộc phá** → bật về chỗ cũ, bắn 1 viên trên đường lùi.
- Skill *Đột Kích Thẳng* (CD 10s, 150$): **lao áp sát mục tiêu gần nhất ngay** (bỏ quét 180px, tầm cả sân), đến nơi nổ nón.
- Nộ: +12 mỗi nón trúng, +6 mỗi lần phá huỷ.
- Ultimate *CHIẾN TRANH CHỚP NHOÁNG*: 4s mỗi nhấp là lao + nón không hồi chiêu, bất tử 0.2s giữa các lần lao. Kết liễu: địch ≤ 30% trong nón.
- Dấu ấn: vệt lửa zig-zag nối các điểm lao, chữ "BREACH!".
- Combo: `'13'` Dragon Strike: đường lùi để lại biển lửa; `'24'` Tàn Phá: xác bị hạ văng nổ trong Ultimate; `'1234'` Ultimate 5s.

**35. Sấm Chớp (`thunder`)** — Ba ngọn Lôi Phong Thương.
- Evo 3 *Lưới Dẫn Lôi* (150$): thương cắm tường **nối sét với nhau**; đạn địch đi qua dây sét bị phá, địch chạm dây 0.2 dame.
- Skill *Triệu Thương* (CD 9s, 160$): **3 thương bay về tay ngay** (chém trên đường về) + 1 Lôi Minh — thay thao tác giữ Thu thương.
- Nộ: +10 mỗi Lôi Minh, +5 mỗi thương trúng.
- Ultimate *LÔI ĐỘN VẠN DẶM*: 3s hoá sét **nhảy qua lại giữa mọi cây thương trên sân** (bất tử), mỗi đường nhảy cắt qua địch 0.6 dame; kết thúc bằng Thiên Lôi Giáng. Kết liễu: địch ≤ 25%.
- Dấu ấn: sấm rền, các thương nối nhau bằng đường sét chữ chi.
- Combo: `'13'` Phá Sấm: lưới sét gây choáng 0.3s; `'24'` Rẽ Mây: cột sét kèm chém phụ; `'1234'` vào Thiên Kiếp ngay sau Ultimate.

**36. Nam Châm (`magnet`)** — Hút và đẩy.
- Evo 3 *Lá Chắn Từ* (130$): đạn địch đi gần Cột Từ cùng cực với bạn bị **bẻ lệch** khỏi xe.
- Skill *Đảo Cực Toàn Sân* (CD 7s, 150$): mọi Cột & Ấn Từ **đảo cực ngay** — hút thành đẩy, đẩy thành hút.
- Nộ: +10 mỗi Lướt Cực Tính, +6 mỗi Ấn Từ gắn.
- Ultimate *SIÊU HỐ TỪ*: 3s tâm làn địch thành hố từ hút địch, đạn địch, thùng; rồi nổ đẩy văng, địch va tường +1 dame.
- Dấu ấn: đường sức từ xanh-đỏ cong khắp sân, mạt sắt bay.
- Combo: `'13'` Lá Chắn Từ đẩy đạn ngược về địch; `'23'` Lưới Từ Cực: đảo cực gây giật điện; `'1234'` Siêu Hố Từ 2 lần liên tiếp.

**37. Tiến Hóa (`evolution`)** — Ăn để lớn.
- Evo 3 *Lưỡi Dài* (110$): **giữ 0.5s** hút rương/xe gần nhất trong 220px về xe (nuốt từ xa).
- Skill *Lột Xác* (CD 20s, 150$): **hồi đầy máu** & xoá hiệu ứng xấu, đổi lại mất 10% chỉ số tích luỹ đến hết hiệp.
- Nộ: +8 mỗi rương ăn, +12 mỗi Mimic.
- Ultimate *ĐỈNH CHUỖI THỨC ĂN*: 6s to x1.5, mọi chỉ số tích luỹ x2, đạn hút máu 20%.
- Dấu ấn: vỏ xe nứt, lớp vỏ mới ánh xanh sinh học trồi ra.
- Combo: `'13'` Mưa Tiến Hóa: Lưỡi Dài 300px; `'23'` Dị Thể: Lột Xác bắn mảnh Mimic; `'1234'` Lột Xác không mất chỉ số.

**38. Trối Chết (`death_lock`)** — Xiềng xích và ấn.
- Evo 3 *Xích Nặng* (120$): mỗi tầng Ràng Buộc làm địch −8% tốc bắn & tốc nạp.
- Skill *Siết Ấn* (CD 12s, 160$): **+1 tầng Ràng Buộc ngay** lên địch đang có ≥ 1 tầng (kích đầy đủ hiệu ứng tầng).
- Nộ: +12 khi đạt tầng 3, +15 khi nổ tầng 4. **Điều kiện tung: địch đang mang ≥ 3 tầng.**
- Ultimate *TỬ XIỀNG*: xích từ 4 góc khoá địch 2.5s (Juggernaut chỉ bị chậm), siết 0.5 dame mỗi 0.5s. Kết liễu: địch ≤ 30% khi hết giờ.
- Dấu ấn: 4 sợi xích đen lao từ 4 góc màn, ổ khoá đỏ.
- Combo: `'13'` Trói: Xích Nặng −12%/tầng; `'23'` Quản Chế: Tử Xiềng kéo địch vào Lồng; `'1234'` Tử Xiềng 3.5s.

**39. Kẻ Sáng Tạo (`creator`)** — Xưởng chế tạo.
- Evo 3 *Bản Vẽ Nhanh* (130$): **giữ 0.5s** đổi bản thiết kế sẽ đặt kế tiếp (Ụ / Khiên / Drone), không phải chờ vòng.
- Skill *Tái Chế Nổ* (CD 12s, 150$): phá huỷ 1 vật triệu hồi của mình → nổ lớn tại chỗ (dame theo máu còn lại) + hoàn Tinh Hoa.
- Nộ: +6 mỗi Tinh Hoa. **Điều kiện tung: có ≥ 2 công trình trên sân.**
- Ultimate *DÂY CHUYỀN KHẨN CẤP*: 6s mọi vật triệu hồi bất tử & x2 tốc bắn; Robot xuất xưởng ngay.
- Dấu ấn: băng chuyền chạy ngang làn mình, đèn vàng nhấp nháy.
- Combo: `'13'` Sản Phẩm Mới: đổi bản vẽ hồi 2s; `'24'` Robot Ultimate x2 kích thước; `'1234'` Tái Chế không mất Tinh Hoa.

**40. Chiêu Hồn Sư (`necromancer`)** — Linh hồn là máu.
- Evo 3 *Hiến Tế* (120$): **nhấp đúp** cho nổ vong linh gần địch nhất (dame theo mốc), hoàn 1 Linh Hồn.
- Skill *Đội Mồ* (CD 16s, 160$): mọi vong linh đã chết trong hiệp (tối đa 3) **sống dậy 4s**.
- Nộ: +6 mỗi vong linh gây dame, +10 mỗi Linh Hồn mất. **Điều kiện tung: có ≥ 4 Linh Hồn.**
- Ultimate *CỔNG ĐỊA NGỤC*: 8 bộ xương bò lên từ làn địch (cảnh báo 0.6s) tự lao vào địch.
- Dấu ấn: mặt đất nứt xanh lục, bàn tay xương vươn lên.
- Combo: `'13'` Linh Thể: Hiến Tế hoàn 2 Linh Hồn; `'24'` Thống Trị: xương Ultimate có nội tại; `'1234'` Đội Mồ hồi sinh cả xương Ultimate.

**41. Thiên Tài (`genius`)** — Bánh răng và Mecha.
- Evo 3 *Ném Bánh Răng* (110$): **nhấp đúp** ném 1 Bánh Răng như phi tiêu xoay (1 dame, nảy 1 lần, nhặt lại được).
- Skill *Ghế Phóng* (CD 15s, 170$): khi lái → bật ra, Mecha tự lao nổ 3 dame, bạn bất tử 1s, hoàn 50% BR; khi không lái → gọi Mecha rẻ hơn 3 BR.
- Nộ: +5 mỗi BR thu, +10 mỗi kỹ năng Mecha trúng. **Điều kiện tung: đang lái Mecha.**
- Ultimate *SIÊU MECHA HỢP THỂ*: 6s Mecha x2 cỡ, pháo vai, đấm tên lửa. Kết liễu: đấm tên lửa hạ địch ≤ 20%.
- Dấu ấn: các mảnh giáp bay tới ghép quanh Mecha, mắt robot loé đỏ.
- Combo: `'13'` Tối Ưu: Bánh Răng ném xong tự về; `'24'` Vũ Trang: Siêu Mecha có 4 module; `'1234'` Ghế Phóng không mất Mecha.

**42. Kiếm Khách (`kiem_khach`)** — Luyện kiếm giữa trận.
- Evo 3 *Kiếm Hộ Thân* (120$): mỗi bài tập hoàn thành tặng 1 phi kiếm bay quanh xe, chặn 1 đạn (tối đa 3).
- Skill *Nhập Định* (CD 14s, 160$): vào **Tập Trung ngay** 2s (né mọi đòn); mỗi đòn né +1 tiến độ bài tập.
- Nộ: +15 mỗi bài tập xong, +8 mỗi lần né trong Tập Trung.
- Ultimate *KIẾM THÁNH XUẤT SƠN*: 4s **mọi bài tập đang làm tính như đã xong** (nhận toàn bộ buff), phi kiếm x3 mỗi phát.
- Dấu ấn: tán lá rơi chậm, bóng kiếm sư phụ hiện sau xe.
- Combo: `'13'` Lấy Tâm Luyện Kiếm: kiếm hộ thân tối đa 5; `'24'` Thí Luyện: Ultimate hoàn thành thật 1 bài; `'1234'` Ultimate mở 1 Bài Tập Cuối.

**43. Bình Phun (`sprayer`)** — Ba chất, một luồng.
- Evo 3 *Đầu Phun Kim* (120$): đang phun, **giữ Bắn** → nón thu hẹp thành tia dài x2 tầm (tốc phủ −30%).
- Skill *Hỗn Hợp Phản Ứng* (CD 12s, 160$): 1.5s phun **cả 3 chất cùng lúc**, tính 3 lần đổi chất cho Ngấm Sâu.
- Nộ: +12 mỗi lớp phủ bùng.
- Ultimate *ĐÁM MÂY ĐỘC*: 5s mây 3 màu phủ làn địch, lớp phủ tự tăng và tự đổi chất mỗi giây.
- Dấu ấn: bình áp suất phình, khói 3 màu xoáy lên.
- Combo: `'13'` tia dài xuyên vật cản; `'23'` Dấu Vết: Skill để lại 3 loại vũng; `'1234'` mây đi theo địch.

**44. Tùy Biến (`customize`)** — Xe tự lắp.
- Evo 3 *Khe Lối Bắn Thứ Hai* (130$): lắp 2 Lối Bắn, **giữ 0.4s** để đổi qua lại.
- Skill *Ép Xung Mô-đun* (CD 16s, 170$): 4s mọi mô-đun đã lắp +2 cấp (vượt trần).
- Nộ: +4 mỗi đòn trúng có Tính Chất kích hoạt + sát thương gây ra.
- Ultimate *BẢN THỬ NGHIỆM*: 6s mở **mọi Tính Chất chưa lắp** ở cấp 1 cùng lúc.
- Dấu ấn: xe tháo rời từng mảnh rồi lắp lại phát sáng.
- Combo: `'13'` Gói VIP: đổi Lối Bắn tức thì; `'24'` Cá Nhân Hóa: Ép Xung +3 cấp; `'1234'` Ultimate giữ lại 1 Tính Chất ngẫu nhiên đến hết hiệp.

**45. Kiếm Sư (`kiem_su`)** — Ngũ Hành.
- Evo 3 *Ngũ Hành Hộ Thể* (130$): mỗi nguyên tố trúng thêm 1 hạt quanh xe; đủ 5 hạt khác nhau → Khiên Ngũ Hành 1 máu.
- Skill *Vòng Tương Sinh* (CD 12s, 160$): phóng **5 phi kiếm cùng lúc** theo thứ tự tương sinh (Mộc → Hỏa → Thổ → Kim → Thủy), mỗi kiếm kích hiệu ứng.
- Nộ: +10 mỗi phản ứng nguyên tố, +6 mỗi bộ 3 nguyên tố khác nhau trúng.
- Ultimate *NGŨ HÀNH ĐẠI TRẬN*: 5 trụ nguyên tố dựng quanh địch 4s, mỗi giây một trụ kích (trói, nổ, đá, hồi máu cho bạn, chém). Kết liễu: trụ Kim cuối hạ địch ≤ 25%.
- Dấu ấn: ngôi sao ngũ hành vẽ sáng trên làn địch.
- Combo: `'13'` Điều Tức: khiên Ngũ Hành 2 máu; `'23'` Giao Thoa: 5 kiếm tạo 4 phản ứng; `'1234'` Đại Trận 2 vòng.

**46. Cao Bồi (`revolver`)** — Sáu viên là đủ.
- Evo 3 *Xoay Ổ* (110$): **nhấp đúp** xoay ổ — viên kế tiếp nhảy thẳng tới viên thứ 6 (bỏ các viên giữa).
- Skill *Nạp Một Tay* (CD 9s, 150$): **nạp đầy ổ ngay** không cần bắn cạn; viên đầu cũng là đạn đồng.
- Nộ: +5 mỗi viên trúng, +15 mỗi lần trúng 6/6. **Điều kiện tung: ổ đang đầy 6 viên.**
- Ultimate *GIỜ NGỌ*: thời gian chậm 1.5s, 6 hồng tâm đánh dấu trên địch, rồi 6 phát đạn đồng tự trúng. Kết liễu: sau phát 6 địch ≤ 35%.
- Dấu ấn: mặt trời đỏ ở mép màn, tiếng chuông nhà thờ, bụi cỏ lăn.
- Combo: `'13'` Đạn Độc Đắc: viên 6 nhảy tới luôn nổ lớn; `'24'` Rút Súng: Giờ Ngọ hồi đầy ổ; `'1234'` Giờ Ngọ 12 hồng tâm.

### 3.3 Lô 3 (#47–#69)

**47. DJ (`dj`)** — Nhịp là tất cả.
- Evo 3 *Bass Drop* (120$): mỗi 10 Combo, phát Hoàn Hảo kế tiếp là Bass Drop (sóng to x2, đẩy lùi, rung màn địch).
- Skill *Remix* (CD 16s, 160$): 4s **mọi nốt đều rơi vào vùng ĐỎ** (mọi lần bấm = Hoàn Hảo, Combo tăng đều).
- Nộ: +1 mỗi Combo, +10 mỗi mốc 15 Combo.
- Ultimate *SÀN NHẢY ĐIỆN TỬ*: 6s làn địch thành sàn ô màu đổi theo nhịp: địch đứng sai màu bị khựng 0.3s + 0.3 dame; bạn tự bắn đúng nhịp.
- Dấu ấn: đèn laser quét, quả cầu disco hạ xuống giữa sân (không che: treo ở mép).
- Combo: `'13'` Dung Sai: Bass Drop mỗi 8 Combo; `'23'` Thăng Hoa: Remix tính mốc Combo x2; `'1234'` Ultimate kết thúc bằng Bass Drop toàn sân.

**48. Móc Thép (`steel_hook`)** — Xích, nảy, kéo.
- Evo 3 *Xích Căng* (150$): móc đã neo, **nhấp** phóng móc thứ 2 → xích căng giữa 2 điểm thành tường chặn đạn 4s.
- Skill *Lưới Xích* (CD 12s, 170$): móc bung thành **3 xích ngắn hình quạt** (mỗi xích nảy 2 lần, có cảnh báo); xích nào trúng địch thì Lôi Xích ngay.
- Nộ: +4 mỗi lần nảy, +15 mỗi Lôi Xích trúng.
- Ultimate *ĐỊA NGỤC XÍCH SẮT*: 4s xích đan kín bản đồ (15 nảy) khoá địch vào mạng, mỗi giây giật địch đập vào 1 điểm (+1 dame). Kết liễu: lần giật cuối hạ địch ≤ 25%.
- Dấu ấn: tiếng xích rít, tia lửa toé ở mọi điểm nảy.
- Combo: `'13'` Tời: xích căng phản đạn; `'23'` Quặp Sắt: Lưới Xích quặp cả Xe Tiền; `'1234'` Ultimate 5s.

**49. Hoa Ảnh (`flower_shadow`)** — Ba vũ điệu.
- Evo 3 *Hoa Nở Ngược* (130$): cánh Khai trên đường trôi về chạm địch thì nở bông nhỏ (0.3 dame, chậm 20%).
- Skill *Thu Hoa* (CD 10s, 160$): **mọi cánh hoa trên sân bay về ngay** (gây dame trên đường về, hoàn Hoa) — không chờ 3s nghỉ.
- Nộ: +2 mỗi cánh trúng, +12 mỗi đòn Cường Hoá. **Điều kiện tung: ≥ 8 cánh hoa trên sân.**
- Ultimate *THIÊN HOA LOẠN VŨ*: mọi cánh xoáy thành vòi rồng hoa quanh địch 3s (khoá chân, chém liên tục), kết thúc Thiên giáng với vòng khoá 0.3s. Kết liễu: địch ≤ 25%.
- Dấu ấn: cánh hồng phủ mép màn, nhạc múa quạt.
- Combo: `'13'` Song Hành: cánh nở x2 cỡ; `'23'` Hương Sắc: Thu Hoa xoá đạn trên đường về; `'1234'` Ultimate được Cường Hoá (xuyên mọi thứ).

**50. Kiếm Vũ (`kiem_vu`)** — Bản Mệnh Kiếm.
- Evo 3 *Kiếm Xoáy* (130$): kiếm đang cắm trên sân địch, **giữ Bắn** → kiếm xoay tại chỗ thành vòng chém 1.5s rồi mới thu.
- Skill *Ngự Kiếm Bộ* (CD 14s, 160$): 3s **di chuyển mà vẫn tính là đứng yên** (Tâm Định tích bình thường, trúng đòn vẫn phản).
- Nộ: +10 mỗi lần phản đạn. **Điều kiện tung: Sát Ý ≥ 50.**
- Ultimate *TÂM KIẾM VÔ NGÃ*: 3s Tập Trung liên tục — **mọi đòn tới đều bị phản**, mỗi đòn phản đọng thành 1 Tâm Kiếm; hết giờ phóng tất cả (hitscan xuyên Khiên & Tường, cảnh báo 0.3s). Kết liễu: địch ≤ 30%.
- Dấu ấn: mặt nước lặng dưới xe, mỗi đòn phản để lại một gợn sóng.
- Combo: `'13'` Tâm Nhãn: vòng xoáy tỏa kiếm khí; `'24'` Lưu Thủy: Ultimate 4s; `'1234'` mỗi Tâm Kiếm hồi 0.2 HP.

**51. T-Zero (`t_zero`)** — Ba Thiết Luật.
- Evo 3 *Cắm Khiên* (140$): ở THỦ, **giữ 0.6s** cắm khiên xuống đất thành tường phản đạn 3s (tốn 10% NL).
- Skill *Khởi Động Lại Hệ Thống* (CD 18s, 170$): **hồi ngay 60% NL**, xoá khoá hồi NL.
- Nộ: +10 mỗi lần phản đạn, +8 mỗi lần đáp nổ.
- Ultimate *T-ZERO: OVERDRIVE*: 5s chạy **cả 3 Thiết Luật cùng lúc** (khiên phản trên tay, lao đấm, pháo tự dội), không tốn NL.
- Dấu ấn: dòng chữ hệ thống chạy, mắt cảm biến đỏ chuyển trắng.
- Combo: `'13'` Năng Lượng Xanh: cắm khiên 5%; `'23'` Hủy Diệt: tường khiên để vệt điện; `'1234'` hết Ultimate tự bay lên Thiên Luật Thức miễn phí.

**52. Raven - Oca (`raven_oca`)** — Thợ săn và bạn đồng hành.
- Evo 3 *Ăn Ý* (130$): mỗi lần Oca cắn trúng → phát kế tiếp của Raven x1.5 và tự khoá mục tiêu.
- Skill *Oca! Vồ!* (CD 10s, 160$): Oca lao cắn **ngay 2 lần liên tiếp** (khoá vị trí 0.3s mỗi lần); Oca đang chết → hồi sinh lập tức.
- Nộ: +10 mỗi lần Oca cắn, +12 mỗi phát Sniper trúng.
- Ultimate *CUỘC SĂN CUỐI*: Oca bay cao khoá radar 4s: **mọi đạn Raven (cả 2 súng) tự khoá, xuyên vật cản**, mỗi phát trúng Oca lao cắn theo. Kết liễu: địch ≤ 30%.
- Dấu ấn: vòng radar đỏ quét sân, tiếng Oca rít trên cao.
- Combo: `'13'` Đặc Nhiệm: phát Ăn Ý gây Chảy Máu; `'24'` Không Kích: Oca thả bom mỗi 1s; `'1234'` đổi súng không hồi trong Ultimate.

**53. Tia Lazer (`lazer_beam`)** — Chùm sáng liên tục.
- Evo 3 *Bẻ Tia* (130$): đang chiếu, bấm ←/→ để **quét tia xiên** ±25° (thay vì chỉ dọc cột).
- Skill *Tụ Quang Nổ* (CD 10s, 150$): ngắt tia, **toàn bộ Năng Lượng còn lại** phóng thành 1 cầu sáng nổ (dame theo NL).
- Nộ: +2 mỗi giây tia trúng.
- Ultimate *NHẬT THỰC*: 3.5s tia **chiếu thẳng từ trời xuống** thành vòng sáng bám địch (vòng cảnh báo co lại 0.5s trước khi đốt), vòng to dần khi trúng liên tục; không tốn NL. Kết liễu: địch ≤ 20% đứng trong vòng 1s liên tục.
- Dấu ấn: mặt trời bị che thành vành nhật hoa ở mép màn, sân tối trừ vòng sáng.
- Combo: `'13'` Năng Lượng Xanh: quét tia không giảm tốc; `'23'` Khuếch Đại: cầu sáng Thiêu Đốt; `'1234'` Ultimate 5s.

**54. Y Sư (`healer`)** — Hồi máu là vũ khí.
- Evo 3 *Kim Đảo Mệnh* (120$): **giữ 0.5s** bắn kim đổi 0.5 HP của mình thành 1 dame chuẩn (trả giá máu, không dưới 1 HP).
- Skill *Truyền Máu Khẩn* (CD 16s, 160$): **hồi ngay 1 HP** và nếu Năng Lượng Sinh Mệnh ≥ 50% → nạp đầy ngay.
- Nộ: +10 mỗi 0.5 HP hồi được.
- Ultimate *SINH TỬ ĐẢO NGƯỢC*: 4s **mọi hồi máu của địch thành sát thương** và mọi sát thương địch nhận hồi cho bạn 50%.
- Dấu ấn: chữ thập xanh lật thành đỏ, nhịp tim đảo trên HUD hai bên.
- Combo: `'13'` Vượt Ngưỡng: Kim Đảo Mệnh trả bằng Giáp Trắng trước; `'24'` Nghịch Lý: Ultimate bắn Tia Xung theo mỗi lượng hồi; `'1234'` Ultimate 6s.

**55. Chrono & Neo (`chrononeo`)** — Hai thời đại.
- Evo 3 *Đổi Thế Giữa Loạt* (140$): đổi thế khi đang bắn → viên đầu của thế mới kế thừa hiệu ứng thế cũ (Xé Giáp + lướt).
- Skill *Song Thời Đại* (CD 14s, 170$): 3s **cả Chrono và Neo cùng lúc** — mỗi nhấp bắn cả đạn đồng lẫn 2 viên Neo.
- Nộ: +8 mỗi Thời Khắc, +6 mỗi lần đổi thế.
- Ultimate *HỘI TỤ THỜI KHÔNG*: Chrono radar xả cả băng tự tìm + Ảnh Chiếu Neo 5s bất tử tự bắn, cùng lúc.
- Dấu ấn: hai đồng hồ đồng-bạc chồng lên nhau quay ngược chiều.
- Combo: `'13'` Bước Thời Gian: đổi thế giữa loạt nạp đầy băng; `'24'` Dòng Chảy: Ultimate +3 viên mỗi băng; `'1234'` Song Thời Đại kéo dài 5s.

**56. Gemini (`gemini`)** — Hai cá thể, một ý thức.
- Evo 3 *Lá Chắn Song Sinh* (130$): 2 xe ở trong 80px → đạn trúng 1 xe **chia đôi sát thương** cho cả 2.
- Skill *Cộng Hưởng Cưỡng Bức* (CD 12s, 160$): 3s mọi đạn của Alpha/Beta **tự kích Song Hưởng** (không cần lần lượt trúng).
- Nộ: +8 mỗi Song Hưởng, +15 mỗi lần cứu đồng đội.
- Ultimate *NHẤT THỂ*: 2 xe nhập làm 1 trong 6s: HP gộp, to x1.4, mỗi phát 2 viên Song Hưởng; hết giờ tách ra chia máu đều.
- Dấu ấn: hai vệt xanh-cam xoắn vào nhau như chuỗi ADN.
- Combo: `'13'` Liên Kết: lá chắn 120px; `'24'` Đệ Quy: Nhất Thể +1 tầng Đệ Quy; `'1234'` Nhất Thể hồi sinh đồng đội đang gục.

**57. Huyết Ma (`blood_lord`)** — Máu = sức mạnh.
- Evo 3 *Hiến Huyết* (120$): **nhấp đúp** tiêu 0.5 HP → +30% Bể Máu (nạp nhanh cho Huyết Cầu).
- Skill *Rút Huyết Ngay* (CD 14s, 170$): chuyển **ngay toàn bộ Bể Máu thành HP** (3 Bể = 1 HP), không cần 8s yên ổn.
- Nộ: +1 mỗi 0.1 HP hút.
- Ultimate *HUYẾT NGUYỆT*: 5s trăng máu: mọi mục tiêu trên sân mất máu đều chảy về bạn x2, Bể Máu không trần; kết thúc bằng Huyết Cầu miễn phí. Kết liễu: Huyết Cầu hạ địch ≤ 25%.
- Dấu ấn: trăng đỏ ở mép màn, giọt máu bay ngược lên trời.
- Combo: `'13'` Đào Thoát: Hiến Huyết không tốn HP khi Bể ≥ 50%; `'24'` Cường Hóa: Huyết Nguyệt mở Bóng Ma Màn Đêm; `'1234'` Ultimate 7s.

**58. Cuồng Chiến Binh (`berserker`)** — Càng đau càng mạnh.
- Evo 3 *Tự Rạch* (110$): **nhấp đúp** tự mất 0.5 HP → +12 Huyết Chiến và viên kế là Huyết Đạn.
- Skill *Gào Thét* (CD 18s, 170$): 4s **hưởng ngay mốc ≤ 25%** (buff mạnh nhất) bất kể máu đang có.
- Nộ: sát thương nhận x1.5 (chính) + gây sát thương. **Điều kiện tung: HP ≤ 50%.**
- Ultimate *CUỒNG HUYẾT VÔ TẬN*: vào Huyết Chiến ngay, thanh giữ 100 trong 4s đầu, mỗi đòn trúng hồi 0.1 HP. Kết liễu: Huyết Đạn hạ địch ≤ 20%.
- Dấu ấn: màn đỏ rung theo nhịp tim, tiếng gầm.
- Combo: `'13'` Khát Máu: Tự Rạch còn cho +10% tốc bắn 3s; `'24'` Huyết Địa: Ultimate dựng đấu trường; `'1234'` Gào Thét không CD trong Ultimate.

**59. Kazuki (`kazuki`)** — Song kiếm vô niệm.
- Evo 3 *Tàn Ảnh Kiếm* (160$): sau Kiếm Thế Quyết, **giữ 0.4s** → Hư Ảnh lặp lại đúng đòn vừa tung (50%).
- Skill *Nhất Niệm* (CD 12s, 200$): tung **ngay 1 Kiếm Thế Quyết tự chọn** theo hướng joystick (← AA, ↑ AB, → BA, ↓ BB) không cần 2 nhịp.
- Nộ: +6 mỗi Kiếm Thế Quyết, +15 mỗi Nghịch Trảm đỡ trúng. **Điều kiện tung: Kiếm Ý ≥ 5.**
- Ultimate *VÔ TƯỚNG KIẾM VỰC*: bản thể + 2 Hư Ảnh tung liền **cả 4 Kiếm Thế Quyết** trong 2s. Kết liễu: địch ≤ 25%.
- Dấu ấn: mực tàu loang trên sân, hai thanh kiếm vẽ chữ "無".
- Combo: `'13'` Vô Niệm: Tàn Ảnh 70%; `'24'` Bách Biến: Ultimate mang hiệu ứng nâng cấp mọi thế; `'1234'` sau Ultimate Nghịch Trảm sẵn sàng.

**60. Tsukiyo (`tsukiyo`)** — Nhẫn giả thích ứng.
- Evo 3 *Liên Hoàn Nhẫn Thuật* (150$): dùng kỹ năng của **cả 3 phong cách trong 3s** → Nhẫn Thuật Tổng Hợp: phi tiêu lửa + lướt chém miễn phí.
- Skill *Phi Lôi Thần* (CD 10s, 180$): ném kunai đánh dấu; bấm lại trong 4s → **dịch chuyển tới kunai** và chém.
- Nộ: +8 mỗi phi tiêu trúng, +12 mỗi Hỏa Cầu trúng.
- Ultimate *NGUYỆT ẢNH*: 3s thời gian chậm dưới trăng, Tsukiyo lướt Tất Sát **5 lần liên tiếp** không tốn Nội Năng (bất tử khi lướt). Kết liễu: địch ≤ 25% → NGUYỆT TRẢM ngay.
- Dấu ấn: trăng tròn bạc ở mép màn, vệt chém bạc đọng lại hình chữ "月".
- Combo: `'13'` Sắc Bén: Tổng Hợp chỉ cần 2 phong cách; `'24'` Nhẫn Đạo: mỗi lần lướt mang nhánh đã chọn; `'1234'` 7 lần lướt.

**61. Joker (`joker`)** — Lá bài định mệnh.
- Evo 3 *Bộ Ba Đồng Chất* (130$): ném 3 lá cùng chất liên tiếp → lá thứ 3 hiệu ứng x3.
- Skill *Lật Bài Tẩy* (CD 18s, 180$): lá kế tiếp **chắc chắn là JOKER**.
- Nộ: +10 mỗi Joker, +5 mỗi lá chất được Lá Bài A cường hoá. **Điều kiện tung: tay còn ≥ 3 lá.**
- Ultimate *ROYAL FLUSH*: ném 10-J-Q-K-A liên tiếp tự tìm, mỗi lá 1 chất, lá A = Joker x3. Kết liễu: địch ≤ 30% → ALL IN.
- Dấu ấn: 5 lá bài khổng lồ lật ngửa ở mép màn, tiếng cười Joker.
- Combo: `'13'` Gian Lận: Bộ Ba chỉ cần 2 lá; `'24'` Sao Chép: Royal Flush chép Vai Trò địch; `'1234'` Lật Bài Tẩy cho 2 lá Joker.

**62. Juggernaut (`juggernaut`)** — Không gì cản nổi.
- Evo 3 *Bá Khí Chồng Chất* (130$): Bá Khí tối đa 5; Đạn Bá Khí từ tầng 3 xuyên tường.
- Skill *Gầm Uy* (CD 12s, 160$): sóng chấn động **ngắt mọi đòn tụ lực / cảnh báo** địch đang chuẩn bị, đẩy lùi đạn gần, +1 Bá Khí.
- Nộ: +15 mỗi lần hấp thụ khống chế (chính) + sát thương nhận.
- Ultimate *BÁ THỂ GIÁNG LÂM*: 4s to x1.5, đi xuyên mọi vật cản, mọi phát là Đạn Bá Khí tối đa, sát thương nhận −60%. Kết liễu: PHÁ XIỀNG khi địch ≤ 20%.
- Dấu ấn: xiềng xích vỡ tung quanh xe, mặt đất lún theo bước.
- Combo: `'13'` Kháng Thể: Bá Khí 5 cho miễn DoT; `'23'` Gậy Ông: Gầm Uy trả ngược khống chế đã hấp thụ; `'1234'` Ultimate 6s.

**63. Pháo Phân Mảnh (`cluster_gun`)** — Một thành nhiều.
- Evo 3 *Lái Mảnh* (130$): **giữ Bắn** khi đạn đang bay → chọn hướng toả mảnh bằng ←/→, nhả = tách.
- Skill *Tách Dây Chuyền* (CD 10s, 160$): mọi mảnh đang bay **tách thêm 1 lần** (mỗi mảnh → 3, chia dame).
- Nộ: +2 mỗi mảnh trúng, +15 mỗi Dễ Vỡ bị kích.
- Ultimate *SAO CHỔI PHÂN MẢNH*: viên mẹ khổng lồ treo giữa sân 3s, liên tục nhả mảnh 360° (ưu tiên nửa sân địch).
- Dấu ấn: vết nứt sáng trên viên mẹ trước khi vỡ.
- Combo: `'13'` Vỡ Vụn: mảnh lái tay nhanh x2; `'23'` Phân Chia: Tách Dây Chuyền 5 mảnh; `'1234'` Sao Chổi tách dây chuyền khi kết thúc.

**64. Nhân Bản (`clone`)** — 1 thành 2, rồi 4...
- Evo 3 *Ý Thức Tập Thể* (130$): mỗi clone đang sống +5% dame cho bạn; clone chết → clone gần nhất +30% máu.
- Skill *Đồng Bộ Đội Hình* (CD 9s, 160$): mọi clone **dịch chuyển xếp hàng ngang trên trục của bạn** và bắn 1 loạt đồng thời.
- Nộ: +8 mỗi clone tạo, +12 mỗi clone chết. **Điều kiện tung: ≥ 2 clone.**
- Ultimate *VÔ HẠN NHÂN BẢN*: 6 clone mới hiện tức thì, 6s không phản phệ, tất cả bắn x2 tốc. Kết liễu: VÔ HẠN khi địch ≤ 20%.
- Dấu ấn: xe nhân ra theo hiệu ứng gương vô tận, đếm số chạy ở băng tên.
- Combo: `'13'` Song Song: Clone Hoàn Hảo cũng tính Ý Thức x2; `'24'` Khuếch Đại: clone Ultimate cấp Cao Thủ; `'1234'` clone Ultimate ở lại hết hiệp với 50% máu.

**65. Phi Công (`jet_pilot`)** — Chân và Phi Ảnh.
- Evo 3 *Lệnh Yểm Trợ* (140$): khi tách, **nhấp đúp** ra lệnh phần AI bắn ngay 1 đợt (bỏ chu kỳ).
- Skill *Pháo Sáng Nhiễu* (CD 10s, 160$): thả pháo sáng — mọi đạn tự tìm / tên lửa địch đổi mục tiêu vào pháo sáng; 1s miễn đạn tự tìm.
- Nộ: +8 mỗi bom oanh tạc trúng. **Điều kiện tung: đang tách.**
- Ultimate *BÁ CHỦ BẦU TRỜI*: Phi Ảnh bay vòng rải thảm bom 3 làn + Chân bắn 6 pháo cối (đều có vòng ⚠ 1s). Kết liễu: địch ≤ 20%.
- Dấu ấn: tiếng phản lực xé trời, vệt khói trắng vẽ chữ V.
- Combo: `'13'` Phi Đội: Lệnh Yểm Trợ x2 đợt; `'24'` AI Tự Hành: Ultimate kèm oanh tạc liên tục; `'1234'` hết Ultimate tự Hợp Nhất +2 Khiên.

**66. Tất Sát (`tat_sat`)** — Nhất kiếm tất sát.
- Evo 3 *Vết Chém Đọng* (140$): chém trượt nhánh 3 → đường kiếm đọng 2s, địch bước vào nhận 1x dame.
- Skill *Thuấn Tụ* (CD 20s, 200$): thanh tụ **nhảy thẳng lên 86%** (nhánh 3 sẵn sàng).
- Nộ: +15 mỗi đòn nhánh 2/3 trúng.
- Ultimate *TẤT SÁT: VÔ ẢNH*: cột cảnh báo 0.4s rộng 32px rồi chém hitscan toàn sân (`scheduleHitscan`). Kết liễu: **trúng địch ≤ 40% → hạ gục**; còn lại x6 dame.
- Dấu ấn: màn chuyển đen-trắng, một nét mực chém đôi khung hình.
- Combo: `'13'` Thuấn Kiếm: vết chém 3s; `'24'` Phá Vọng: Ultimate xoá đạn trên đường kiếm; `'1234'` ngưỡng kết liễu 45%.

**67. Nhất Quyền / Một Đấm (`one_punch`)** — Chỉ cần một đấm.
- Evo 3 *Chạy Bộ Mỗi Ngày* (110$): di chuyển liên tục 3s → +5% Thú Vị (không cần bị đánh).
- Skill *Né Bình Thường* (CD 6s, 150$): bước ngang né **tức thì** 1 đòn (bất tử 0.25s), +10% Thú Vị.
- Nộ: +1 mỗi 1% Thú Vị tích. **Điều kiện tung: Thú Vị 100%.**
- Ultimate *ĐẤM NGHIÊM TÚC: CHẾT ĐI*: cảnh báo 0.8s rồi hitscan rộng 1/3 sân xuyên MỌI tường. Kết liễu: **trúng địch ≤ 50% → hạ gục**; còn lại 3 dame.
- Dấu ấn: mặt nghiêm túc hiện ở băng tên, mây trên trời rẽ đôi.
- Combo: `'13'` Đấm Bồi: chạy bộ +8%; `'24'` Nhảy Liên Hoàn: bật ngang khi tụ Ultimate; `'1234'` Ultimate không cần Thú Vị 100% (≥ 80%).

**68. Boomerang (`boomerang`)** — Ném đi, luôn quay về.
- Evo 3 *Gọi Gió Về* (120$): Trọng Luân đang xoay ở làn địch, **nhấp** → dừng sớm và bay về ngay.
- Skill *Bàn Tay Hút* (CD 9s, 150$): 2s **phạm vi BẮT x3** và boomerang đang về bị hút thẳng vào tay; mỗi lần bắt trong lúc này Hứng Khởi x2.
- Nộ: +10 mỗi lần bắt, +3 mỗi lượt trúng.
- Ultimate *KHÔNG LỐI THOÁT*: 4s cả 2 boomerang phóng to xoay quanh địch theo vòng thu hẹp; địch ra khỏi vòng bị chém x2. Kết liễu: vòng khép hạ địch ≤ 20%.
- Dấu ấn: hai vệt xanh lá - vàng vẽ vòng tròn quanh địch.
- Combo: `'13'` Đón Gió: dừng sớm hút nhẹ địch; `'24'` Song Luân: vòng Ultimate Xé Giáp; `'1234'` Ultimate 6s.

**69. Nhện Độc (`arachnid`)** — Hoá kén rồi kết liễu.
- Evo 3 *Mạng Nối* (140$): các Vùng Tơ nối sợi với nhau; địch băng qua sợi +1 tầng Tơ Quấn (1 lần/1s).
- Skill *Kéo Tơ* (CD 11s, 160$): mọi Vùng Tơ **co về dưới chân địch**, +1 tầng mỗi vùng.
- Nộ: +6 mỗi tầng Tơ, +25 mỗi lần Hoá Kén. **Điều kiện tung: địch có ≥ 2 tầng Tơ.**
- Ultimate *TỔ NHỆN CHÚA*: Hoá Kén ngay 2.5s, 4 nhện con bò ra cắn. Kết liễu: XỬ TỬ ngưỡng 15% → 30% trong suốt Ultimate.
- Dấu ấn: tơ trắng giăng từ 4 góc màn, bóng nhện khổng lồ lướt qua.
- Combo: `'13'` Tơ Trói: Mạng Nối +1 tầng/0.5s; `'23'` Ổ Nhện: Kéo Tơ nở nhện con; `'1234'` kén 3.5s.

### 3.4 Lô 4 (#70–#91)

**70. Siêu Năng (`psychokinesis`)** — Mọi thứ dừng lại cho ta.
- Evo 3 *Sóng Niệm Gạt* (130$): **nhấp đúp** phát sóng niệm đẩy lệch mọi đạn địch trong 120px sang ngang.
- Skill *Nhấc Vật* (CD 10s, 160$): nhấc **thùng / xe tiền / vật triệu hồi** gần nhất (của bất kỳ ai) và ném về địch (dame theo cỡ vật, vật triệu hồi địch bị phá).
- Nộ: +2 mỗi đạn bắt trong Vùng Niệm Lực.
- Ultimate *TÂM NIỆM NGHIỀN NÁT*: nhấc bổng địch 2s (bất động; Juggernaut chỉ chậm), ép nén 1.5 dame rồi quật xuống. Kết liễu: địch ≤ 25% bị nghiền nát.
- Dấu ấn: không khí méo như thấu kính, vật nhỏ trên sân bay lơ lửng.
- Combo: `'13'` Tương Thông: sóng gạt bắt luôn 3 viên vào vùng; `'24'` Trường Lực: Ultimate ném địch đập vào đạn đang treo; `'1234'` Nhấc Vật 2 vật cùng lúc.

**71. Thợ May (`tailor`)** — Kim, chỉ và búp bê.
- Evo 3 *Thêu Tam Giác* (140$): 3 cọc tạo tam giác → vùng bên trong làm chậm 60% và cấm lướt.
- Skill *Kim Xuyên Định Mệnh* (CD 14s, 170$): 1 kim hitscan dọc sân (cảnh báo 0.3s); trúng → **khâu địch vào Búp Bê Đen** 4s: mọi sát thương lên Búp Bê Đen truyền sang địch.
- Nộ: +3 mỗi giây địch chạm chỉ, +10 mỗi Mũi Khâu. **Điều kiện tung: ≥ 3 Cọc Chỉ trên sân.**
- Ultimate *ĐƯỜNG KIM MŨI CHỈ*: chỉ từ mọi cọc **khâu chân địch dính xuống sàn** 2.5s (Trói, vẫn bắn được), rồi Rút Chỉ 3 lượt liền với lực x2. Kết liễu: lượt 3 hạ địch ≤ 25%.
- Dấu ấn: đường may chỉ đỏ chạy viền màn, kéo cắt "xoẹt".
- Combo: `'13'` Hoàng Kim: tam giác cũng làm chậm đạn; `'23'` Búp Bê Thế Mạng: Kim Định Mệnh nối cả Búp Bê Trắng; `'1234'` Rút Chỉ 4 lượt.

**72. Jack - 6 Lỗ (`jack_6_lo`)** — Cược đi, cược đi nào.
- Evo 3 *Ổ Đạn Gian* (130$): mỗi lần nạp được **giữ lại 1 viên tốt nhất** của ổ trước cho ổ sau.
- Skill *Cò Quay Nợ* (CD 12s, 160$): bóp 1 lỗ: 5/6 **chuyển toàn bộ Nợ sang địch** (địch chịu phạt Nợ 6s); 1/6 Nợ của bạn x2.
- Nộ: +6 mỗi lần tung xu, +10 mỗi tầng Nợ nhận/chuyển.
- Ultimate *JACKPOT 777*: máy slot 3 ô quay trên băng tên: **777** (25%) Lục Liên Phát x2; **BAR** (50%) loạt 12 viên tự ngắm; **CHERRY** (25%) hồi 2 HP + Luck. Kết liễu: chỉ khi ra 777 và địch ≤ 40%.
- Dấu ấn: đèn casino nhấp nháy viền màn, tiếng xèng rơi.
- Combo: `'13'` Thú Vị: giữ 2 viên; `'24'` High Risk: 777 thành 35%; `'1234'` được quay lại 1 lần nếu ra CHERRY.

**73. Kusarigama (`kusarigama`)** — Nếm máu.
- Evo 3 *Mùi Máu* (130$): Trảm tự bẻ hướng nhẹ về địch đang Chảy Máu; mỗi lượt giật trúng +1 tầng Tích Luỹ (không reset).
- Skill *Liềm Xoáy Huyết* (CD 10s, 160$): liềm & tạ **xoay quanh xe 1.5s** chém mọi thứ xung quanh, xoá đạn thường, mỗi trúng hút máu.
- Nộ: +1 mỗi 0.1 HP hút. **Điều kiện tung: HP ≤ 40%.**
- Ultimate *HUYẾT LIÊM ĐOẠT MỆNH*: bật Cuồng Huyết ngay (kể cả đã dùng trong hiệp, không khoá máu lần 2), liềm phóng 3 lượt kéo-chém liên tiếp. Kết liễu: lượt 3 hạ địch ≤ 25%.
- Dấu ấn: vòng máu xoay quanh xe, xích đỏ quất qua màn.
- Combo: `'13'` Huyết Xích: Mùi Máu bẻ mạnh hơn; `'24'` Bất Tử Huyết Ma: Ultimate +2 Giáp Trắng; `'1234'` Liềm Xoáy không CD trong Cuồng Huyết.

**74. The Clock (`the_clock`)** — Hai mươi nhịp kim.
- Evo 3 *Chuông Báo Thức* (130$): khi địch đạt nhịp 10 và 15 → chuông reo, địch chậm 50% 1.5s.
- Skill *Đảo Kim* (CD 10s, 160$): **lập tức đảo chiều** tối đa 6 đạn địch đang lao về bạn thành Kim Giờ (Kim Nghịch Chuyển không cần Time Zone kết thúc).
- Nộ: +4 mỗi nhịp gõ. **Điều kiện tung: địch ≥ 12 nhịp.**
- Ultimate *ĐỒNG HỒ ĐIỂM 12 GIỜ*: Time Zone 3s + kim đồng hồ khổng lồ quay, **+6 nhịp ngay** lên địch. Kết liễu: đạt 20 nhịp → KẾT LIỄU TỨC THÌ (luật sẵn có của body).
- Dấu ấn: mặt đồng hồ La Mã trùm nền sân, tiếng tích tắc dồn dập.
- Combo: `'13'` Dây Cót: chuông reo cả nhịp 5; `'24'` Kim Giờ Gia Tốc: Ultimate +8 nhịp; `'1234'` điều kiện tung chỉ cần 10 nhịp.

**75. COC (`coc`)** — Vận mệnh trong tay.
- Evo 3 *Hai Mặt Xúc Xắc* (140$): đổi vũ khí → 3s đầu **giữ lại phát cuối** của vũ khí cũ (1 lần bắn kiểu cũ).
- Skill *Chọn Mặt* (CD 16s, 170$): **tự chọn vũ khí kế tiếp** theo hướng joystick (vòng 6 mặt), đổi ngay.
- Nộ: +10 mỗi lần đổi vũ khí.
- Ultimate *ĐỊNH MỆNH AN BÀI*: 6s xoay cả 6 vũ khí mỗi 1s, mỗi lần đổi bắn ngay phát đặc trưng. Kết liễu: Súng Vàng phát cuối hạ địch ≤ 30%.
- Dấu ấn: xúc xắc vàng lăn ngang băng tên, 6 mặt sáng lần lượt.
- Combo: `'13'` Reroll: giữ phát cuối 5s; `'24'` 1 Và 6: Ultimate vũ khí cường hoá; `'1234'` Chọn Mặt không CD trong Ultimate.

**76. Phản Chiếu (`prism`)** — Kính phản nguyên bản.
- Evo 3 *Khúc Xạ Kép* (120$): Tia Khúc Xạ nảy tường lần 2 và tách đôi sau lần nảy đầu.
- Skill *Lăng Kính Tức Thì* (CD 10s, 170$): **bật ngay Cửa Sổ Vàng 0.35s** (miễn sát thương, phản 100% + đạn phản tăng tốc) không cần giữ, không tốn hồi Mở Kính.
- Nộ: +10 mỗi đòn phản, +20 mỗi lần Cửa Sổ Vàng phản trúng.
- Ultimate *VẠN KÍNH QUY QUANG*: 4s vòng 8 tấm kính xoay quanh xe phản mọi đòn x1.5; hết giờ mọi tia đã phản hội tụ thành 1 tia lớn (cảnh báo 0.4s). Kết liễu: tia hội tụ hạ địch ≤ 25%.
- Dấu ấn: sân khúc xạ cầu vồng, tiếng chuông pha lê.
- Combo: `'13'` Khuếch Đại: tia tách đôi 70% mỗi tia; `'24'` Gương Vỡ: kính Ultimate vỡ ra 5 mảnh mỗi tấm; `'1234'` Lăng Kính Tức Thì 0.5s.

**77. The Adapter (`the_adapter`)** — Đánh càng lâu, càng lộ tử huyệt.
- Evo 3 *Ghi Nhớ Mẫu Đòn* (140$): đòn địch đã trúng bạn ≥ 2 lần được ghi lại; lần sau địch dùng đòn đó → tự lướt né (1 lần / 6s).
- Skill *Đổi Mô Hình* (CD 20s, 170$): **đổi ngay Thích Ứng Vai Trò** sang Vai Trò Phụ của địch (giữ cả 2 tới hết hiệp).
- Nộ: +8 mỗi nấc Vòng Xoay, +10 mỗi tầng Lộ Điểm Yếu. **Điều kiện tung: Lộ Điểm Yếu ≥ 4.**
- Ultimate *PHÂN TÍCH HOÀN TẤT*: 6s khoá nấc tối đa, mọi phát là Đạn Khai Thác Tử Huyệt. Kết liễu: 100% LỖI khi địch ≤ 25%.
- Dấu ấn: lưới dữ liệu xanh phủ lên xe địch, % tải chạy ở băng tên.
- Combo: `'13'` Học Sâu: ghi nhớ sau 1 lần; `'24'` Phá Giải: Ultimate +2 tầng; `'1234'` Ultimate 8s.

**78. Tỉnh (`tinh`)** — Ngươi đang cố chạy sao?
- Evo 3 *Cấm Bước* (130$): địch mang ≥ 2 tầng Ngưng → lướt/dịch chuyển **bị huỷ** (vẫn tốn hồi chiêu) + +2 Khó Chịu.
- Skill *Đứng Im!* (CD 10s, 160$): **đóng ngay 1 tầng Ngưng** + 3 Khó Chịu; địch đang di chuyển → 2 tầng.
- Nộ: +5 mỗi điểm Khó Chịu.
- Ultimate *NGƯNG ĐỌNG VĨNH HẰNG*: Vùng Cấm Chế phủ toàn làn địch 4s: mỗi bước địch đi +1 Khó Chịu, đủ 3 tầng Ngưng → Choáng Cứng. Kết liễu: địch đang Choáng Cứng & ≤ 30%.
- Dấu ấn: mọi chuyển động trên màn chậm lại, ánh mắt trắng ở mép.
- Combo: `'13'` Ánh Nhìn: Cấm Bước từ 1 tầng; `'23'` Lĩnh Vực: Đứng Im tạo Vùng Cấm Chế nhỏ; `'1234'` Ultimate 5s.

**79. Wind (`wind`)** — Mỏng manh và cuồng phong.
- Evo 3 *Gió Ngược Chiều* (120$): phát Ngưng Phong đầy trúng địch → 2s đạn địch bay chậm 30%.
- Skill *Rải Nút Gió* (CD 9s, 150$): tạo **ngay 3 nút Vệt Gió Cắt** theo hàng ngang tại chỗ, không cần Hoá Gió.
- Nộ: +8 mỗi Lưỡi Gió trúng.
- Ultimate *THIÊN PHONG BẠO TẨU*: 4s Hoá Gió không cần di chuyển, mỗi 0.3s một Lưỡi Gió tự phóng tới địch; hiện hình được Cuồng Phong Tốc Xạ x2.
- Dấu ấn: vệt gió trắng mảnh chém ngang màn, xe tan vào gió.
- Combo: `'13'` Thuận Chiều: gió ngược 3s; `'24'` Vô Hình: Ultimate mỗi đạn xuyên qua +1 Lưỡi Gió; `'1234'` Rải Nút 5 nút.

**80. Diệp Thanh Phong (`diep_thanh_phong`)** — Khí áp và quạt.
- Evo 3 *Quạt Khép Hộ Thể* (140$): đạt 3 tầng Hợp Phong → +1 Khiên Gió.
- Skill *Đảo Khí Áp* (CD 12s, 170$): Khí Áp **lập tức đảo thành 100 − hiện tại** (Thuận ↔ Nghịch) và kích ngay hiệu ứng vùng mới (sang Nghịch → Toàn Phong 4s).
- Nộ: +8 mỗi tầng Hợp Phong, +12 mỗi lần đổi Khí Áp. **Điều kiện tung: Hợp Phong 3 tầng.**
- Ultimate *PHONG THẦN TUYỆT TỨC*: Cửu Thiên Phong Vũ cấp tối đa (THIÊN PHONG BÃO VŨ) ngay lập tức + 2 Ảo Ảnh Gió múa cùng. Kết liễu: địch ≤ 25%.
- Dấu ấn: chiếc quạt ngọc mở xoè ở mép màn, lá trúc bay.
- Combo: `'13'` Khí Lưu: Khiên Gió nổ to; `'24'` Phong Thần: Ultimate bắn trả đạn đã nuốt; `'1234'` điều kiện tung còn 2 tầng.

**81. Railgun (`railgun`)** — Only my railgun.
- Evo 3 *Cộng Hưởng Cầu* (130$): 2 cầu cùng cấp chạm nhau → hợp thành 1 cầu cấp kế tiếp.
- Skill *Búng Xu* (CD 10s, 170$): búng đồng xu lên trước mũi xe; 0.6s sau bắn trúng xu bằng Cầu → **Railgun đồng xu** hitscan 3 dame (cảnh báo 0.3s).
- Nộ: +10 mỗi cầu Lõi Lazer trúng, +2 mỗi đạn bắt trong Vùng Điện Tích.
- Ultimate *LEVEL 5: RAILGUN*: 3 đồng xu liên tiếp → 3 tia railgun xuyên toàn sân (mỗi tia cảnh báo 0.35s). Kết liễu: tia 3 hạ địch ≤ 30%.
- Dấu ấn: tia điện cam chạy dọc cánh tay nòng, đồng xu xoay chậm giữa không trung.
- Combo: `'13'` Siêu Dẫn: cầu hợp thành nạp nhanh; `'24'` Lưới Điện: Ultimate bắt đạn thành xu; `'1234'` 4 tia.

**82. Skinwalker (`skinwalker`)** — Lớp da vừa vặn.
- Evo 3 *Lột Da Giữa Hiệp* (130$): **giữ 0.6s** đổi sang Hình Thái khắc chế kế tiếp, 1 lần/hiệp (body vốn chỉ nhấp).
- Skill *Bản Năng Săn Mồi* (CD 12s, 160$): kích ngay **chiêu đặc trưng của Hình Thái hiện tại**: Phá Giáp → phá 1 Khiên địch từ xa; Hư Không → tia xuyên phá mọi triệu hồi; Tróc Ảnh → khoá chân 0.75s; Độc → Hoại Tử ngay 3s.
- Nộ: +8 mỗi hiệu ứng Hình Thái kích.
- Ultimate *SĂN MỒI TỐI THƯỢNG*: 6s hoá **Hình Thái Tối Thượng gộp cả 4** (gai xương + tia xuyên + nanh truy kích + dịch độc). Kết liễu: THÔN PHỆ khi địch ≤ 20%.
- Dấu ấn: da xe rách toạc lộ thịt đen, 4 màu hình thái loé lần lượt.
- Combo: `'13'` Gen Cực Hạn: Hình Thái mới cũng được cường hoá; `'24'` Song Thể: Ultimate giữ Da Phụ; `'1234'` Ultimate 8s.

**83. Idol (`idol`)** — Mọi ánh nhìn thuộc về ta.
- Evo 3 *Fan Cuồng* (120$): mỗi 6 Fan → 1 Fan Cuồng (lightstick) bay quanh xe, chặn 1 đạn rồi tái sinh sau 8s.
- Skill *Encore* (CD 10s, 160$): **lặp lại ngay** kỹ năng Phong Cách vừa dùng, miễn Náo Nhiệt.
- Nộ: +1 mỗi 5 Náo Nhiệt tiêu, +10 mỗi Fan nhận. **Điều kiện tung: ≥ 6 Fan.**
- Ultimate *ĐÊM CONCERT*: 6s bật cả 3 Sân Khấu cùng lúc (Rock + Pop + Ballad) và Quyến Rũ toàn sân 1.5s đầu.
- Dấu ấn: đèn sân khấu nhiều màu quét, biển lightstick ở mép màn.
- Combo: `'13'` Lưu Diễn: Fan Cuồng mỗi 4 Fan; `'24'` Hiện Tượng Mạng: Ultimate +3 Fan; `'1234'` Encore lặp 2 lần.

**84. Dynamite (`dynamite`)** — Hầm càng sâu, vàng càng sáng.
- Evo 3 *Mìn Chôn* (120$): bó TNT nằm trên sân > 2s **chui xuống đất** (địch không thấy vòng cảnh báo, chỉ thấy vết đất).
- Skill *Đào Hầm* (CD 11s, 150$): chui xuống đất 1.2s (bất tử, không bắn), **trồi lên tại X khác** kèm vụ nổ quanh xe.
- Nộ: +10 mỗi Nổ Lan, +4 mỗi $ đào được.
- Ultimate *SIÊU MỎ VÀNG*: 8 bó TNT nối dây rơi thành hàng trên làn địch (vòng cảnh báo 1s), nổ chuỗi; mỗi bó trúng +$5.
- Dấu ấn: đường ngòi lửa chạy ngang băng tên, mũ thợ mỏ loé đèn.
- Combo: `'13'` Kho Mở Rộng: mìn chôn tối đa 3; `'23'` Nhiệt Nhôm: trồi lên gây choáng; `'1234'` Siêu Mỏ Vàng 12 bó.

**85. Hai Nòng (`twin_gun`)** — Hai viên song song.
- Evo 3 *Khép Nòng* (120$): **giữ 0.4s** bật/tắt khép nòng: 2 viên chồng lên thành 1 viên x2.2 (mất khả năng kẹp hai bên).
- Skill *Gọng Kìm* (CD 8s, 150$): 2 viên bay xoè chéo rồi **cắt nhau đúng tại vị trí địch**; trúng cả 2 → choáng 0.4s.
- Nộ: +10 mỗi lần cả 2 viên trúng.
- Ultimate *SONG LONG*: 4s 2 dòng đạn liên tục uốn lượn như 2 con rồng quấn nhau, kẹp địch từ hai phía.
- Dấu ấn: rồng xanh và rồng đỏ cuộn quanh hai nòng.
- Combo: `'13'` Nòng Xoay: khép nòng x2.5; `'24'` Từ Tính: Song Long hút địch vào giữa; `'1234'` Ultimate 6s.

**86. Mortar (`mortar`)** — Ngước nhìn bầu trời.
- Evo 3 *Nã Bồi* (130$): trúng Hồng Tâm (≤ 18px) → 0.5s sau rơi bồi 1 quả mini cùng chỗ.
- Skill *Bắn Đón Đầu* (CD 7s, 150$): quả kế tiếp rơi vào **vị trí dự đoán** của địch theo vận tốc hiện tại (vòng cảnh báo vẫn hiện).
- Nộ: +12 mỗi Hồng Tâm, +4 mỗi quả trúng.
- Ultimate *CÔNG THÀNH*: chia làn địch thành lưới 9 ô, 8 ô lần lượt rơi pháo trong 3s, chừa **1 ô an toàn** (địch phải đọc ra).
- Dấu ấn: bóng đạn cối khổng lồ đổ xuống, tiếng rít từ trên cao.
- Combo: `'13'` Áp Suất Cao: nã bồi 2 quả; `'23'` Nhiệt Nhôm: mỗi ô Công Thành để Hố Nóng Đỏ; `'1234'` ô an toàn đổi chỗ 1 lần giữa chừng.

**87. Pháo Lửa (`fire_cannon`)** — Lửa thiêu rụi.
- Evo 3 *Hoả Cầu Chủ Động* (120$): **giữ 0.5s** tụ ngay Hoả Cầu (bỏ đếm phát thứ 3), bộ đếm về 0.
- Skill *Tường Lửa Phòng Thủ* (CD 12s, 150$): dựng tường lửa ngang trên **làn mình** 2s: đạn thường của địch bay qua bị thiêu tan.
- Nộ: +1 mỗi giây địch đang cháy, +8 mỗi lần Hoả Cầu kích nổ tầng.
- Ultimate *HOẢ NGỤC TRẬN*: 4s mỗi 0.5s một vùng Đại Hoả rơi dưới chân địch (vòng cảnh báo 0.5s).
- Dấu ấn: trời đỏ cam, tro bay ngược lên.
- Combo: `'13'` Hoả Diệm Sơn: Hoả Cầu chủ động luôn tạo Đại Hoả; `'23'` Bạo Viêm: tường lửa đốt cả địch lướt qua; `'1234'` các vùng Ultimate hợp thành Tường Lửa.

**88. Batter (`batter`)** — Home Run!
- Evo 3 *Cú Vung Ngược* (130$): trong 0.4s sau Vung Gậy, **nhấp** → vung ngược chiều lần 2 (không tốn CD).
- Skill *Bóng Xoáy* (CD 7s, 150$): pitch kế tiếp là **curveball bẻ cong** về địch, 1.6 dame, xuyên khiên.
- Nộ: +14 mỗi Home Run.
- Ultimate *HOME RUN DERBY*: 4s Vung Gậy không hồi chiêu, mỗi đạn đập trúng hoá Bóng Lửa nhắm địch; kết thúc mọi bóng trên sân dội về địch. Kết liễu: địch ≤ 20% → "OUT!".
- Dấu ấn: đèn sân vận động bật, khán đài reo ở mép màn.
- Combo: `'13'` Gậy Nhôm: vung ngược cũng Home Run; `'24'` Grand Slam: Ultimate phản TẤT CẢ đạn mỗi cú; `'1234'` Ultimate 6s.

**89. Hellrider (`hellrider`)** — Tốc độ chính là sát thương.
- Evo 3 *Drift Tự Chủ* (120$): đang giữ chạy, bấm ngược hướng → **drift đảo chiều tại chỗ** giữ nguyên đà, để lại vệt lửa 1.5s.
- Skill *Bốc Đầu* (CD 12s, 150$): **đạt ngay tốc tối đa** + Bốc Lửa 3s.
- Nộ: +1 mỗi 0.5s ở tốc ≥ 4.8, +6 mỗi lần Drift.
- Ultimate *HIGHWAY TO HELL*: 4s tốc không trần, xe vẽ đường cao tốc lửa trên làn mình, mỗi Drift bắn 1 vòng 8 đạn lửa. Kết liễu: đạn lửa hạ địch ≤ 20%.
- Dấu ấn: đầu lâu lửa trên mui, vệt bánh rực đỏ, guitar điện.
- Combo: `'13'` Tăng Áp: Drift Tự Chủ +0.6 tốc; `'24'` Bất Khuất: Ultimate miễn mọi khống chế; `'1234'` Bốc Đầu không CD trong Ultimate.

**90. Kẻ Thu Thập (`collector`)** — Bảo tàng chiến tranh.
- Evo 3 *Bộ Sưu Tập Hoàn Chỉnh* (140$): ghi lại mọi loại đạn đã Khui; Khui ưu tiên loại chưa có; đủ 10 loại → +20% dame đến hết trận.
- Skill *Hiện Vật Đối Thủ* (CD 13s, 170$): triệu hồi **Hologram của chính body đối thủ** thực hiện 1 lượt tấn công cơ bản của nó.
- Nộ: +6 mỗi Hologram trúng.
- Ultimate *BẢO TÀNG MỞ CỬA*: 5s cả 10 Hologram hiện cùng lúc, mỗi cái 1 lượt tấn công, xếp hàng như phòng trưng bày.
- Dấu ấn: khung tranh vàng hiện quanh từng Hologram, biển "TRIỂN LÃM".
- Combo: `'13'` Mở Rộng: đủ 6 loại đã thưởng; `'24'` Triển Lãm: Hologram Ultimate mang Evo 1; `'1234'` Hiện Vật Đối Thủ mang cả Evo đối thủ đang có.

**91. The Admin (`the_admin`)** — My Game, My Rules.
- Evo 3 *Điều Kiện Kép* (130$): Luật vừa chạy mà trong 2s có ĐK khác nổ → chạy lại lần 2 (50% hiệu lực).
- Skill *Thu Hồi Quyền* (CD 18s, 180$): **khoá thao tác GIỮ của địch** 3s (chỉ còn nhấp — nút giữ của địch xám).
- Nộ: +6 mỗi lần một Luật chạy.
- Ultimate *QUYỀN ROOT*: 5s viết lại luật sân, chọn 1 trong 3: đạn địch chậm 40% / bạn hồi 0.2 HP mỗi phát trúng / địch nạp đạn & hồi chiêu chậm 50%. Kết liễu: `rm -rf` khi địch ≤ 15%.
- Dấu ấn: cửa sổ terminal xanh lá trượt ở băng tên, con trỏ nhấp nháy.
- Combo: `'13'` Mở Rộng Cổng: Điều Kiện Kép 75%; `'24'` Quản Trị Cấp Cao: Root áp 2 luật sân; `'1234'` Root áp cả 3.

---

## 4. Câu hỏi mở cho người dùng

> Đã trả lời & bỏ: đa combo khi có 3–4 Evo (→ theo 2 Evo mua đầu, `'1234'` khi đủ 4), giới hạn Evo (→ 2, mở bằng G.E.A.R Lăng Kính), Cơ Bản MAIN (→ đủ 4 Evo + 2 Evo MAIN), Ultimate kết liễu (→ có, kèm điều kiện phụ).

1. **Max HP của Con Đường Tiến Hóa**: hiểu `+3/+5/+6/+10` là **tổng theo mốc** (4 Evo = +10) như đã ghi, hay **cộng từng Evo** (4 Evo = +24)? Với HP gốc 1–9 của game, bản cộng từng Evo rất mạnh.
2. **FEET đã mua trước khi lấy Con Đường Tiến Hóa**: giữ nguyên (đề xuất) hay bị gỡ/hoàn tiền?
3. **MAIN Cơ Bản**: 4 Evo có sẵn ngay đầu trận (đề xuất) hay Evo 3/4 chỉ mở **sau khi Thức Tỉnh (HỒI ỨC)**? 2 Evo MAIN mua được cả hai hay chỉ chọn 1?
4. **Ngưỡng kết liễu**: dải đề xuất 15–50% (cao nhất Nhất Quyền 50%, Lazer Xuyên Phá 50%) — có muốn trần chung (ví dụ ≤ 40%) không?
5. **Băng tên chiêu**: chỉ hiện ở mép phía người tung (đề xuất), hay hiện cả hai mép để đối thủ cũng đọc được?
6. **Phím tắt Skill desktop** (Q / `/`): đồng ý hay đổi?
7. **Nộ qua hiệp**: giữ 50% (mặc định) hay reset 0?
8. **Giá Evo 3**: giữ khoảng 100–160$ theo body như mục 3, hay đồng giá cho dễ nhớ?
9. **G.E.A.R mới (mục 2)**: giữ cả 18 hay rút còn 10–12? Có muốn chặn Tiến Hóa Lần Nữa / Con Đường Tiến Hóa ở lượt chọn đầu trận (đề xuất) không?
10. **Bot**: độ Dễ có được chọn G.E.A.R ô Evo / dùng Ultimate kết liễu không?
11. **Thí điểm 10 body** (mục 1.11): danh sách đã ổn hay muốn đổi?
12. **Viền Nộ của đối thủ**: hiện viền đỏ quanh xe khi Nộ ≥ 80% (mặc định) có giữ không?
