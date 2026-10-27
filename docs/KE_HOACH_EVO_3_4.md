# KẾ HOẠCH: EVO 3, EVO 4 (SKILL + NỘ), FULL EVO THEO TỔ HỢP & G.E.A.R MỚI

> Tài liệu CHỈ LẬP KẾ HOẠCH, chưa đụng tới code game. Số liệu là mức khởi điểm để chỉnh khi playtest.
> Nguồn tham chiếu: `js/data/modules.js` (91 body), `js/data/evolutions.js` (Evo 1, Evo 2, thẻ ★ FULL EVO), `js/data/body-guides.js` (điều khiển).
> Quy ước: **Evo 1 / Evo 2** = hai evo hiện có trong `EVOLUTIONS[bodyId]` (thứ tự mảng). **Evo 3 / Evo 4** = hai evo mới. Giá tính bằng $ trong shop (thang hiện tại 60 → 480).

---

## 1. Khung hệ thống

### 1.1 Luật chung (dịch nguyên văn ý tưởng thiết kế)

1. Thêm hai bậc tiến hoá mới: **Evo 3** và **Evo 4**, cùng một **NÚT SKILL** mới đặt cạnh nút Bắn.
2. **Evo 3 = thêm một cơ chế mới cho body.** Ba dạng:
   - (a) Body chỉ có thao tác **nhấp** thì được thêm một thao tác **giữ** (ví dụ Pháo Băng được thêm "giữ").
   - (b) Body đã có thao tác giữ thì được thêm **một kiểu giữ khác** (hoặc giữ-rồi-nhả với biến thể mới).
   - (c) **Nội tại bị động** kiểu "cứ X phát bắn thì ...", "mỗi lần ... thì ...".
3. **Evo 4 = SKILL + NỘ (Rage).**
   - **Skill**: một nút riêng cạnh nút Bắn, **chỉ xuất hiện khi người chơi sở hữu Evo 4** của body đó. Skill ở mức cơ bản: hỗ trợ cơ chế cũ hoặc thêm hiệu ứng nhỏ, có hồi chiêu (CD).
   - **Nộ**: thanh nộ tăng theo thời gian / khi nhận sát thương / theo điều kiện riêng của body. **Khi Nộ đầy, nút Skill biến hình thành chiêu cuối Nộ (Ultimate)**; dùng xong Nộ về 0 và nút trở lại Skill thường.
4. **Full Evo theo tổ hợp**: khi người chơi sở hữu **BẤT KỲ 2 evo nào** (trong 4), cửa hàng hiện mục mua **Full Evo**. Tuỳ **2 evo nào được ghép**, Full Evo thêm/đổi một thứ cụ thể (hoặc không thêm gì). Có 6 tổ hợp: 1+2, 1+3, 1+4, 2+3, 2+4, 3+4.
5. **Evo 3-4 không nhất thiết đắt hơn Evo 2**; Evo 3 có thể rẻ hơn cả Evo 1 (để người chơi có lối "đi Evo 3 sớm").
6. Thêm các vật phẩm **G.E.A.R** mới liên quan skill / nộ / tổ hợp evo (mục 2).

### 1.2 Nút Skill: UI và vị trí

**Nguyên tắc:** nút Skill không bao giờ che nút Bắn / joystick, chỉ hiện khi `owned.has(evo4)`; ẩn hoàn toàn nếu chưa có (không để nút xám gây rối).

| Mục | Đề xuất |
|---|---|
| Kích thước | Đường kính 0.62 × nút Bắn (nút Bắn hiện tại làm chuẩn), tối thiểu 52px vùng chạm (đạt chuẩn ngón tay), tối đa 72px. |
| Vị trí P1 (mobile, dọc, đáy màn) | Ngay **bên trái-trên** nút Bắn, lệch 0.9 × bán kính nút Bắn theo đường chéo 45° (thế "ngón cái xoay"), cách mép dưới ≥ 24px, không đè vùng joystick. Nếu lệch ra ngoài màn: dịch vào trong, không thu nhỏ. |
| Vị trí P2 | **Xoay 180° quanh tâm sân** như toàn bộ HUD P2 (P2 ngồi đối diện): nút Skill nằm bên phải-dưới nút Bắn của P2 xét theo hướng người P2 nhìn, chữ/icon xoay 180°. |
| Desktop | Phím mặc định `Q` (P1) / `/` hoặc `.` (P2, chỉnh được trong cài đặt); nút trên màn hình vẫn bấm được bằng chuột. |
| Vòng CD | Vòng cung (conic) quanh nút, chạy ngược chiều kim đồng hồ từ 100% → 0%; giữa nút hiện số giây còn lại (làm tròn lên, 1 chữ số thập phân khi < 3s). Khi sẵn sàng: viền sáng nhấp nháy 1 nhịp + rung nhẹ (haptic 10ms). |
| Thanh Nộ | Vòng **ngoài** thứ hai (mỏng hơn) bao quanh vòng CD, đổ từ dưới lên bằng màu cam→đỏ; đồng thời một thanh nhỏ 4px dưới nút để dễ đọc khi đang nhìn nút. Nộ hiển thị cả khi Skill đang CD. |
| Biến hình khi Nộ đầy | 0.4s: nút phồng 1.25×, vỡ viền, đổi icon Skill → icon Ultimate, viền chuyển nhịp đập đỏ vàng, hạt lửa quanh nút, SFX "ting + gầm". Nút to thêm 15% khi ở dạng Ultimate. Ultimate **không dùng CD của Skill** (Skill CD vẫn chạy ngầm; xem 1.3). |
| Trạng thái | `LOCKED` (ẩn) → `READY` → `COOLDOWN` → (Nộ đầy) `RAGE_READY` → `RAGE_ACTIVE` (nếu chiêu kéo dài, hiện đếm ngược thay vòng CD). |
| Khả năng tiếp cận | Chạm giữ nút để xem tooltip tên + mô tả (0.5s); tuỳ chọn "Nút Skill lớn / vị trí đảo trái-phải" cho người thuận tay trái. |

### 1.3 Quy tắc Skill ↔ Nộ

- Skill và Nộ độc lập: Skill có CD riêng, **Nộ đầy thì nút hiện Ultimate** (ưu tiên hơn Skill). Dùng Ultimate xong, nút quay lại Skill với CD **đang chạy tiếp** (không reset) để tránh "spam".
- Khi Nộ đầy mà Skill còn CD: nút vẫn biến hình, Ultimate dùng được ngay (không cần Skill sẵn sàng).
- Nộ không tăng khi đang ở trạng thái Ultimate (`RAGE_ACTIVE`); Nộ bị giữ nếu bị choáng/đóng băng nhưng **không** tăng.
- Hết hiệp: Nộ **giữ nguyên 50%** sang hiệp sau (làm tròn xuống), Skill CD reset. Đổi mạng/hồi sinh: Nộ giữ 100% nếu hồi sinh từ HỒI ỨC; còn lại về 0.
- Một lần nhấn nút = một lần dùng; không có cơ chế "giữ nút Skill" trừ khi nêu riêng (tránh xung đột với giữ-Bắn).

### 1.4 Nguồn Nộ và số mặc định (thang 0–100)

| Nguồn | Mặc định | Ghi chú |
|---|---|---|
| Theo thời gian | **+1.2 / giây** (≈ 83s đầy nếu không làm gì) | Nền tối thiểu để không body nào "kẹt". Body dựa điều kiện riêng chỉ lấy +0.5/s. |
| Nhận sát thương | **+6 / mỗi 1 HP mất** (tối đa +18 mỗi đòn) | Chống bị "lội ngược dòng": đang thua nhận Nộ nhanh hơn. Sát thương lên khiên = ½. |
| Gây sát thương | **+1.5 / mỗi 1 dame gây ra** (tối đa +6 mỗi phát) | Cho body hung hãn. Bị giới hạn 25/giây để tránh nuôi bằng spam. |
| Điều kiện riêng | **+8 đến +20 mỗi lần** | Tuỳ body (ví dụ ghim đủ 4 ấn, chạm tường, hết đạn). Là "đặc trưng" của Nộ. |
| Giết / phá vật thể | +10 (phá hòm/xe/Ụ) | Chỉ body cần farm. |

Mỗi body chọn **1 nguồn chính + 1 nguồn phụ**, các nguồn còn lại về 0 (mục 3 ghi sẵn). Công thức chung: `rage = clamp(rage + Σ nguồn × hệ_số_body × gearMult, 0, 100)`. Thời gian đầy mục tiêu: **trận hiệp ~60s → có thể đầy 1 lần/hiệp khi chơi bình thường, 2 lần khi chơi rất tốt**.

### 1.5 Định giá theo bậc

| Bậc | Khoảng giá | Ghi chú |
|---|---|---|
| Evo 1 (hiện có) | 60–260 | Không đổi. |
| Evo 2 (hiện có) | 120–480 | Không đổi. |
| **Evo 3** | **90–220** (mặc định 130–180) | Cơ chế mới, rẻ hơn Evo 2 cho body yếu thế; có thể rẻ hơn Evo 1 (khoảng 90–140) với cơ chế nhẹ. |
| **Evo 4** | **120–260** | Skill + Nộ; hiệu quả thấp hơn lúc đầu, nên ngang Evo 2 trung bình. Body vốn mạnh/giá Evo cao đặt Evo 4 ở 200+. |
| **Full Evo** (mới, theo tổ hợp) | **150–260** (≈ giá thẻ ★ FULL EVO hiện tại ± 20%) | Giá = `fullEvoCostBase` của body (đã có) + phụ trội tổ hợp: 1+2 +0, tổ hợp có Evo 3/4 +10..+40 nếu có hiệu ứng riêng. |
| Tổng 4 evo + Full Evo | Kỳ vọng ≈ 650–1100$ | Cao hơn hiện tại ~25%, cần kinh tế tiền thưởng hiệp tương ứng (xem 1.10). |

Quy tắc: tổng giá 4 evo của một body nên ≤ **2.2 ×** tổng Evo1+Evo2 hiện tại; body yếu giữ Evo 3 rẻ để có tầm với.

### 1.6 Full Evo theo tổ hợp

**Nguyên tắc:** sở hữu **bất kỳ 2 evo** → hiện thẻ **★ FULL EVO ★** trong shop. Tổ hợp **1+2** giữ nguyên Full Evo hiện tại (tương thích ngược, không phá cân bằng cũ). Bốn tổ hợp còn lại dùng "hiệu ứng riêng" nếu body có định nghĩa; **không định nghĩa = Full Evo chỉ cho phần thưởng chung** (+1 HP, +10% dame, hồi 1 khiên; "không thêm gì đặc biệt" như yêu cầu).

6 tổ hợp:

| Tổ hợp | Vai trò gợi ý (chuẩn chung để viết riêng từng body) |
|---|---|
| **1+2** | Full Evo hiện tại (giữ nguyên). |
| **1+3** | Nâng cơ chế Evo 3 bằng sức mạnh Evo 1: Evo 3 mạnh hơn / nhanh hơn / thêm đạn. |
| **1+4** | Skill mạnh hơn hoặc CD −25%, hoặc Skill thêm nội dung của Evo 1. |
| **2+3** | Hiệp đồng cơ chế: Evo 3 kích hoạt đòn Evo 2 (liên hoàn). |
| **2+4** | Nộ tăng nhanh hơn (+30%) hoặc Ultimate có thêm hiệu ứng của Evo 2. |
| **3+4** | Evo 3 nạp Nộ khi kích hoạt (+X Nộ mỗi lần) → "vòng Nộ" kín. Thường là tổ hợp mạnh nhất, giá phụ trội +30..40. |

**Cách định nghĩa gọn trong dữ liệu** (đề xuất, thêm vào `evolutions.js`; thẻ Full Evo gom từ đây):

```js
// body.evoSlots: thứ tự id evo 1..4
EVOLUTIONS.ice = [ evo1, evo2, evo3, evo4, fullEvoCard ];
FULL_EVO_COMBOS.ice = {
  base: { hp: 1, dmgMul: 1.1 },            // phần chung khi không có combo riêng
  '12': 'legacy',                          // dùng Full Evo cũ
  '13': { flag: 'fe_ice_13', desc: '...' },// chỉ cần cờ + mô tả; logic đọc cờ
  '14': null,                              // null = chỉ nhận base
  '23': { flag: 'fe_ice_23', desc: '...' },
  '24': { rageGainMul: 1.3 },              // hiệu ứng dạng số: dùng bảng khoá chuẩn
  '34': { rageOnEvo3: 12, costExtra: 30 }
};
```

- Khoá combo = 2 chữ số tăng dần (`'12'..'34'`). Hàm `fullEvoCombo(body, owned)` trả về khoá và đối tượng hiệu ứng.
- **Khoá số chuẩn** (xử lý chung, không cần code riêng từng body): `rageGainMul`, `skillCdMul`, `ultMul`, `evo3Mul`, `rageOnEvo3`, `rageOnSkill`, `dmgMul`, `hpAdd`. Chỉ khi cần hành vi đặc thù mới dùng `flag` rồi code trong file nhân vật.
- Nếu người chơi sở hữu **3 hoặc 4 evo**: dùng tổ hợp **ưu tiên** theo thứ tự `34 > 24 > 23 > 14 > 13 > 12` để tránh cộng dồn quá tay; hoặc cho phép cộng dồn tối đa 2 combo (quyết định ở mục 4).

### 1.7 Tương tác với thẻ ★ FULL EVO hiện có

- Thẻ hiện nay yêu cầu `Evo 1 + Evo 2`. Đổi cổng điều kiện từ `hasEvo1 && hasEvo2` thành `ownedEvoCount >= 2` (đếm trong 4 evo).
- Mô tả thẻ **động**: hiện tên tổ hợp đang có ("★ FULL EVO ★ [Evo 2 + Evo 4]: ...") và, nếu mua thêm evo khác, hiện "Nâng cấp tổ hợp" (xem câu hỏi mở).
- Giá thẻ giữ `fullEvoCost` hiện có + phụ trội tổ hợp. Người đã mua Full Evo bản cũ (trận đang chạy) không bị đổi: tổ hợp được **chốt lúc mua**.
- Các hiệu ứng "Full Evo" hiện nằm rải rác trong mô tả Evo 1/2 (ví dụ Xe Tiền, Tank): giữ nguyên, ánh xạ vào tổ hợp `'12'`.
- Body bản MAIN (Cơ Bản) có sẵn Full Evo: coi như đã sở hữu tổ hợp `'12'`; Evo 3/4 mua thêm vẫn mở combo `13/14/...` theo thông thường (xem câu hỏi mở).

### 1.8 Bot AI

- Bot mua evo theo danh sách ưu tiên từng body: ưu tiên Evo cũ rẻ → Evo 3 (nếu rẻ) → Evo 4. Có tham số `botEvoOrder` mặc định `[3,1,4,2]` cho body cơ động, `[1,2,4,3]` cho body tank.
- **Dùng Skill**: bot kiểm tra điều kiện "kích hoạt hợp lý" theo mẫu: `ready && distance/line-of-sight && !defensiveSkillWhenHighHP`. Mỗi skill khai báo `botUse(ctx)` trả về true/false; mặc định "dùng khi CD xong và có địch trong tầm".
- **Dùng Ultimate**: bot dùng khi Nộ đầy và (HP ≤ 50% **hoặc** địch đang trong tầm nhìn rõ **hoặc** đã đầy quá 6s). Thêm độ trễ phản ứng người 0.2–0.5s theo độ khó.
- Độ khó: Dễ chỉ mua tối đa Evo 3; Thường tối đa Evo 4 sau hiệp 2; Khó mua Full Evo và dùng ultimate chủ động.
- Không để bot "biết trước" thanh Nộ của người chơi; chỉ đọc thông tin công khai (hiệu ứng biến hình hiện ở nút của mình, nhưng viền nhân vật phát sáng đỏ cho đối thủ thấy).

### 1.9 Đồng bộ online

- Lockstep/State: Skill và Ultimate là **sự kiện đầu vào** (`input: skill`), không gửi hiệu ứng; mọi client chạy cùng logic xác định. Cần một bit mới `skillPressed` trong gói input (cùng khung với `fire`/`dash`).
- Trạng thái đồng bộ tối thiểu mỗi khung hình hoặc mỗi 100ms: `rage (uint8)`, `skillCd (uint16 ms)`, `ultActive (bool)`, `evoMask (4 bit)`, `fullEvoCombo (3 bit)`.
- Nộ phải tính bằng số nguyên cố định (không dùng `Math.random` / số thực trôi) để không lệch trạng thái; dùng RNG seed chung đã có cho chiêu ngẫu nhiên.
- Mua evo qua shop: dùng cùng kênh mua hiện tại, thêm mã evo 3/4 và `buyFullEvo{combo}`; chốt tổ hợp ở **máy chủ/host** để tránh hai máy hiểu khác nhau.
- Kiểm thử bắt buộc: replay 2 máy, 5 trận, so khớp `rage`/`cd`/HP mỗi 10 giây; trường hợp rớt mạng giữa lúc Ultimate đang chạy.

### 1.10 Nguyên tắc cân bằng

1. Skill = **hỗ trợ**, sát thương trực tiếp tối đa ≈ 1.5 × một phát bắn tiêu chuẩn của body; ưu tiên hiệu ứng điều hướng/kiểm soát/hồi phục nhỏ.
2. Ultimate = **cảnh quan trận**: giá trị ≈ 3–4 phát bắn mạnh, hoặc một hiệu ứng khoá khu vực ngắn (≤ 4s), **không bao giờ giết ngay** một mục tiêu đầy máu (đỉnh sát thương ≤ 60% máu tối đa chuẩn của đối thủ).
3. CD Skill tham khảo: nhẹ 6–8s, trung bình 10–14s, nặng 16–22s. Skill không nên dùng được hơn 8 lần/hiệp.
4. Nộ lên **nhanh hơn khi đang thua** (nguồn nhận sát thương) nhưng không đủ để lật kèo một mình: Ultimate là cơ hội, không phải nút thắng.
5. Evo 3 phải thay đổi cách chơi, không chỉ "+10% dame". Mỗi cơ chế có "điểm yếu": cửa sổ phản công, chi phí đạn, hoặc thời gian tụ.
6. Mỗi body chỉ **1 Skill + 1 Ultimate**; không chồng thêm cờ. Hạn chế chiêu "miễn nhiễm toàn phần" (tối đa 1.5s, body Sinh Tồn mới có).
7. Giá: tổng 4 evo + Full Evo không vượt **2.2×** hiện tại; kiểm tra bằng bảng tính (tổng tiền kiếm/hiệp × 4 hiệp).
8. Kiểm thử: win-rate từng body vs body Cơ Bản trong khoảng **45–55%** ở cả "mua đủ 2 evo" và "mua đủ 4 evo + Full Evo"; body nào lệch > 8% thì chỉnh giá trước, chỉnh số sau.
9. Tránh trùng lặp trải nghiệm: không hai body có cùng cặp (Skill, Ultimate) trong cùng vai trò (xem bảng body).

### 1.11 Lộ trình triển khai (phase)

| Phase | Nội dung | Tiêu chí hoàn thành |
|---|---|---|
| **P0 – Khung (framework)** | Dữ liệu `evo3/evo4` rỗng cho mọi body; nút Skill UI (P1 + P2 xoay), vòng CD, thanh Nộ, hệ thống `Rage` chung, mã Skill/Ultimate mẫu, thẻ Full Evo đếm ≥ 2 evo, `FULL_EVO_COMBOS`, đồng bộ input `skill`, bot dùng Skill mặc định, cờ tính năng `FEATURE_EVO34`. | Chạy được 1 body demo (Cơ Bản) 4 hiệp, bot + online, tắt cờ vẫn như cũ. |
| **P1 – 10 body thí điểm** | Gợi ý: `basic`, `tank`, `ice`, `shotgun`, `smg`, `ghost`, `engineer`, `sniper`, `berserker`, `healer` (đủ 4 vai trò, có tap-only, có hold, có nội tại, có sinh tồn). Cân bằng bảng giá, playtest 20 trận mỗi body. | Win-rate 45–55%, không lỗi đồng bộ, bot dùng đúng. |
| **P2 – Phần còn lại (~81 body)** | Làm theo nhóm vai trò (Đối Đầu → Kiểm Soát → Cơ Động → Sinh Tồn), mỗi lô 10–12 body, kèm G.E.A.R mới. | Mỗi lô: ghi nhận lỗi, chỉnh giá, cập nhật `body-guides.js`. |
| **P3 – Hoàn thiện** | Hiệu ứng/âm thanh Ultimate, hướng dẫn trong `body-guides.js`, cài đặt vị trí nút, bảng chỉ số cuối, ghi chú phiên bản. | Hoàn thành checklist QA mobile (cỡ máy nhỏ) + đồng bộ online. |

---

## 2. G.E.A.R mới (10 món)

> Định dạng: **Tên** — tầng (Thường / Hiếm / Sử Thi) — hiệu ứng — gắn với skill / nộ / tổ hợp evo.
> Tầng chỉ gợi ý theo cách phân tầng G.E.A.R hiện có; tên giữ phong cách game.

1. **Bình Nhiên Liệu Nộ** — Thường — Nộ tăng thêm **+20%** từ mọi nguồn. Gắn: **Nộ**.
2. **Đồng Hồ Cát Chiến Thuật** — Thường — Skill hồi chiêu nhanh hơn **15%**. Gắn: **Skill**.
3. **Chuông Thức Tỉnh** — Hiếm — Khi Nộ đầy: nhận ngay khiên 1 máu và +20% tốc đánh trong 4s. Gắn: **Nộ → Ultimate**.
4. **Huy Hiệu Đa Năng** — Hiếm — Mua evo thứ 2 trong 1 trận **giảm 25% giá** (chỉ 1 lần). Gắn: **tổ hợp evo / Full Evo** (đạt mốc 2 evo sớm).
5. **Mảnh Ghép Tổ Hợp** — Hiếm — Giảm **30% phụ trội** của Full Evo; nếu tổ hợp không có hiệu ứng riêng, nhận base ×1.5. Gắn: **Full Evo combo**.
6. **Lõi Cộng Hưởng** — Sử Thi — Nếu sở hữu **Evo 3 + Evo 4**: mỗi lần kích hoạt cơ chế Evo 3 nạp **+8 Nộ**. (Khớp tổ hợp `34`.) Gắn: **Evo 3, Nộ, combo 3+4**.
7. **Hộp Sạc Phản Đòn** — Thường — Nhận sát thương nạp thêm **+3 Nộ** (cộng vào +6/HP), nhưng Nộ theo thời gian −25%. Gắn: **Nộ (nguồn nhận sát thương)**.
8. **Cò Hai Nhịp** — Hiếm — Sau khi dùng Skill, **phát bắn kế tiếp** gây +50% dame và nạp +5 Nộ. Gắn: **Skill ↔ Nộ**.
9. **Dây Chuyền Dư Chấn** — Sử Thi — Ultimate để lại **dư chấn**: 3s sau đó, hồi 1 máu và Skill hồi ngay 50% CD. Gắn: **Ultimate/Skill**.
10. **Bản Đồ Chiến Thuật Nộ** — Thường — Hiển thị Nộ đối thủ dạng viền (chỉ lúc ≥ 80%), đổi lại Nộ bản thân −10% theo thời gian. Gắn: **Nộ (thông tin)**.
11. **Kính Soi Tổ Hợp** — Thường — Thẻ Full Evo hiện **trước** tên tổ hợp và hiệu ứng của MỌI tổ hợp trong shop (xem trước), + giảm 15$ phí Full Evo. Gắn: **Full Evo combo**.
12. **Tim Dự Phòng** — Sử Thi — Lần đầu HP chạm 0 trong hiệp: nếu Nộ ≥ 50%, tiêu 50 Nộ để hồi 40% máu và bất tử 1.5s. Gắn: **Nộ ↔ sinh tồn**.

Gợi ý tầng cho cửa hàng: Thường 4, Hiếm 4, Sử Thi 3, còn một ô tuỳ ý; tỷ lệ rơi dưới 12% cho Sử Thi.

---

## 3. Gợi ý theo từng BODY

> Mỗi body: **Evo 3** (tên, cơ chế, giá) · **Evo 4 Skill** (tên, CD, hiệu ứng, giá) · **Nộ** (nguồn → Ultimate) · **Combo** (chỉ combo đáng chú ý; combo không ghi = nhận phần chung).
> Điểm danh: 91 body theo thứ tự `MODULES.BODY`. Quy ước số: dmg theo "phát bắn chuẩn" của body; thời lượng tính bằng giây.
> Điều khiển tham chiếu `body-guides.js`: "nhấp" = chạm nhanh nút Bắn, "giữ" = giữ nút Bắn.

### 3.1 Nhóm cơ bản và cổ điển

**1. Cơ Bản (`basic`)** — Đối Đầu/Sinh Tồn
- Evo 3 *Nhịp Chuẩn* (110$): cứ 5 phát bắn, phát thứ 5 là đạn Hợp Nhất xuyên 1 mục tiêu (nội tại).
- Evo 4 Skill *Lướt Cơ Bản* (CD 9s, 140$): lướt ngang 1 ô, đạn kế tiếp +30% tốc.
- Nộ: thời gian + nhận dame. Ultimate *Cơ Hội Cuối Mini*: 4s tốc chạy/tốc bắn +40%, đạn nổ lan.
- Combo: 3+4 Nộ +8 mỗi phát thứ 5; MAIN bản có sẵn 12 → mở 14 thưởng "Hồi Ức" nạp 30 Nộ.

**2. Xe Tiền (`money_tank`)** — Sinh Tồn/Đối Đầu
- Evo 3 *Lãi Kép* (100$): mỗi 20$ nhặt được → +1 đạn (tối đa +3), cứ 10 viên bắn trúng thì rơi 5$.
- Evo 4 Skill *Rút Thẻ Tín Dụng* (CD 14s, 180$): tiêu 40$ ngay → khiên 2 máu 4s.
- Nộ: +4 mỗi 50$ tiêu. Ultimate *Đế Chế Sụp Đổ*: 3 xe tiền lao cùng lúc (không cảnh báo 2s, cảnh báo 0.8s), mỗi xe 1.5 dame.
- Combo: 2+4 Nộ theo $ tiêu ×1.3; 1+3 Lãi Kép gấp đôi.

**3. Xe TANK (`tank`)** — Đối Đầu/Cơ Động
- Evo 3 *Giữ Là Húc* (120$): giữ Bắn tụ lực 1s rồi nhả → húc xa gấp rưỡi, không CD húc 2s lần kế.
- Evo 4 Skill *Còi Hơi Cảnh Báo* (CD 12s, 150$): 2s đẩy lùi đạn thường tới trước mặt, hồi 1 khiên.
- Nộ: +6 mỗi lần húc trúng, thêm theo dame nhận. Ultimate *Xe Lu Địa Chấn*: 3s lao liên tục, chạm là nổ lan + nứt sàn làm chậm.
- Combo: 1+3 Giữ Là Húc đổi thành 3 lần húc; 2+4 Ultimate hồi 3 khiên.

**4. Pháo Băng (`ice`)** — Kiểm Soát/Đối Đầu
- Evo 3 *Giữ Cho Đóng Băng* (100$): GIỮ bắn tạo vùng sương lạnh trước mũi xe (mới có thao tác giữ), phát bắn trong vùng thêm làm chậm 20%.
- Evo 4 Skill *Mảnh Băng* (CD 8s, 130$): bắn tia băng đông cứng 1s mục tiêu đầu tiên.
- Nộ: +12 mỗi lần "Bão Tuyết" kích hoạt, nền +0.5/s. Ultimate *Kỷ Băng Hà*: 4s toàn sân địch bị làm chậm 50%, vùng băng gây dame.
- Combo: 1+3 vùng sương lan 2×; 3+4 mỗi lần giữ nạp 6 Nộ.

**5. Đạn Lớn (`big_bullet`)** — Đối Đầu
- Evo 3 *Nặng Như Chì* (120$): cứ 3 viên thì viên thứ 3 nặng gấp 1.5 dame và đẩy lùi.
- Evo 4 Skill *Co Rút* (CD 9s, 150$): viên kế tiếp co nhỏ, nhanh gấp 2, xuyên 1 địch.
- Nộ: +10 mỗi lần đạn nảy tường 3 lần liền. Ultimate *Quả Cầu Thảm Họa*: 1 viên cầu khổng lồ nảy 9 lần, mỗi lần nảy nổ 360° mảnh.
- Combo: 2+3 viên nặng nảy 2 lần thêm; 3+4 nảy tường nạp Nộ.

**6. Shotgun (`shotgun`)** — Đối Đầu
- Evo 3 *Nòng Chụm* (110$): GIỮ nhả → chụm 5 viên thành 1 tia (xa, dame ×2 viên gần, cần tụ 0.6s).
- Evo 4 Skill *Đạn Mồi* (CD 10s, 140$): nạp ngay 1 băng, phát kế tiếp bắn 7 viên.
- Nộ: +14 mỗi khi cả 5 viên trúng. Ultimate *Bão Chì*: 3s xả 3 loạt bắn 7 viên, hất lùi địch.
- Combo: 1+4 Skill CD −25%; 2+4 Đạn Dự Phòng hồi 1 băng/Ultimate.

**7. Cuộn Quá Tải (`overload`)** — Đối Đầu
- Evo 3 *Xả Áp* (130$): khi thanh năng lượng đầy, GIỮ nhả sớm → xung nhỏ (3 dame) thay vì đợi Đạn Sạc.
- Evo 4 Skill *Siêu Tụ Điện* (CD 12s, 160$): thanh năng lượng đầy ngay lập tức.
- Nộ: +10 mỗi lần Đạn Sạc bắn trúng. Ultimate *EMP Tổng Lực*: 2s tắt hết skill và nút bắn của địch (silence), gây 3 dame.
- Combo: 3+4 Xả Áp nạp 8 Nộ; 1+3 xung nhỏ xuyên.

**8. Tiểu Liên (`smg`)** — Đối Đầu
- Evo 3 *Đạn Lướt Ma* (100$): cứ 18 viên, viên cuối của băng bay xuyên + nổ nhỏ.
- Evo 4 Skill *Nạp Siêu Tốc* (CD 8s, 130$): nạp lại tức thì và +30% tốc bắn 3s.
- Nộ: +1 mỗi 4 viên trúng. Ultimate *Mưa Đạn*: 4s bắn không dừng, không giật lệch, đạn xuyên 1 mục tiêu.
- Combo: 1+4 Skill CD −25%; 2+3 Băng Đạn X làm "viên cuối nổ lớn".

**9. Lazer Xuyên Phá (`lazer_charge`)** — Đối Đầu
- Evo 3 *Chớp Cực Nhanh* (120$): GIỮ 0.4s bật chế độ nạp nhanh, nạp đầy trong 3s đổi lấy dame tia −25%.
- Evo 4 Skill *Tụ Quang* (CD 14s, 170$): nạp đầy ngay, tia kế tiếp đủ rộng gấp đôi.
- Nộ: +20 mỗi lần tia xuyên ≥ 2 mục tiêu/vật thể. Ultimate *Tia Diệt Tinh*: tia khổng lồ 1.5s quét ngang sân (dame 8).
- Combo: 1+4 tia Skill hạ CD −3s; 3+4 mỗi nạp nhanh tăng 6 Nộ.

**10. Lazer Pháo (`lazer_auto`)** — Đối Đầu
- Evo 3 *Quá Nhiệt Có Kiểm Soát* (110$): GIỮ bắn 3s liên tục → xả 1 xung nhiệt đẩy lùi (thao tác giữ có thể nhả).
- Evo 4 Skill *Làm Mát* (CD 11s, 140$): xoá nhiệt, 2s nhịp bắn tối đa ngay.
- Nộ: +1 mỗi 0.5s giữ bắn tối đa nhịp. Ultimate *Pháo Lazer Vô Tận*: 4s tia dày xuyên thấu.
- Combo: 2+3 Phá Hủy làm xung nhiệt gây thiêu.

**11. Pháo Tên Lửa (`rocket`)** — Đối Đầu/Kiểm Soát
- Evo 3 *Dẫn Đường Nhẹ* (120$): cứ 3 tên lửa, tên lửa thứ 3 tự dẫn nhẹ về địch.
- Evo 4 Skill *Tên Lửa Mồi* (CD 10s, 150$): ném 1 tên lửa chậm nổ sau 1.5s tại điểm chọn (làm mồi nhử địch).
- Nộ: +12 mỗi lần tên lửa nổ trúng. Ultimate *Giàn Phóng*: 6 tên lửa trải quạt, mỗi quả nổ lan.
- Combo: 1+3 tên lửa dẫn thứ 3 thành đầu đạn lớn; 2+4 Ultimate thêm 2 quả.

**12. Cổng Không Gian (`portal`)** — Cơ Động/Đối Đầu
- Evo 3 *Cổng Phản Hồi* (110$): GIỮ bắn đặt cổng thứ hai "ra" gần địch; đạn qua cổng thứ hai tăng 30% dame.
- Evo 4 Skill *Dịch Chuyển Tức Thời* (CD 11s, 150$): dịch chuyển tới cổng đã đặt.
- Nộ: +8 mỗi viên xuyên cổng trúng địch. Ultimate *Cổng Đôi*: 4s mở cổng song song, mọi đạn qua cổng nhân đôi.
- Combo: 1+3 cổng thứ hai tồn tại +3s; 3+4 mỗi lần qua cổng +6 Nộ.

**13. Phong Trảm (`wind_slash`)** — Đối Đầu/Kiểm Soát
- Evo 3 *Kiếm Khí Chéo* (110$): cứ 3 nhát tụ lực, nhát thứ 3 chém chéo tạo vệt cản đạn (giữ biến thể).
- Evo 4 Skill *Lá Chắn Gió* (CD 9s, 140$): 1.5s phản đạn thường trước mặt.
- Nộ: +10 mỗi lần chém trúng tụ đủ. Ultimate *Bão Kiếm Khí*: 3s chém quét 360° 4 lần.
- Combo: 2+4 Nghịch Phong làm Skill phản gây dame bằng 50% đạn phản.

**14. Cuồng Phong (`storm`)** — Cơ Động/Đối Đầu
- Evo 3 *Lướt Gió* (100$): nhả sớm (<50%) lao ngắn có thể xoay hướng; sau lao 1s nhận +20% tốc.
- Evo 4 Skill *Mắt Bão Rút Gọn* (CD 12s, 160$): tụ lực tức thì đến 50%.
- Nộ: +8 mỗi lần tụ 100% xong lao trúng. Ultimate *Siêu Bão*: 3s Gió Lốc di chuyển hút địch về tâm.
- Combo: 1+4 Skill CD −25%; 2+4 Phong Ảnh Trảm thêm trong Ultimate.

**15. Axit Hóa (`acid`)** — Kiểm Soát/Đối Đầu
- Evo 3 *Vũng Axit* (110$): viên thứ 5 để lại vũng 3s ăn mòn Max HP chậm (nội tại).
- Evo 4 Skill *Bình Phun Axit* (CD 10s, 140$): tạo vũng tại chân địch.
- Nộ: +10 mỗi stack ăn mòn đầy 5. Ultimate *Mưa Axit*: 4s tạo nhiều vũng khắp làn địch.
- Combo: 2+3 vũng tăng bào mòn gấp đôi.

**16. Kỹ Sư (`engineer`)** — Kiểm Soát/Sinh Tồn
- Evo 3 *Ụ Gắn Mồi* (130$): GIỮ bắn 2s đặt Ụ "Tự Sửa" hồi 1 máu mỗi 5s cho bản thân khi đứng gần.
- Evo 4 Skill *Sửa Chữa Nhanh* (CD 12s, 170$): hồi 100% máu cho Ụ đang có + hồi 1 máu bản thân.
- Nộ: +10 mỗi Ụ sống thêm 10s hoặc bị phá. Ultimate *Pháo Đài*: 4s mọi Ụ nhận khiên và nhân đôi tốc bắn.
- Combo: 3+4 mỗi Ụ Tự Sửa nạp 5 Nộ; 2+4 Mạng LAN truyền hiệu ứng Ultimate.

**17. Ghost (`ghost`)** — Cơ Động/Đối Đầu
- Evo 3 *Dư Ảnh* (100$): mỗi lần hết Vô Ảnh để lại tàn ảnh bắn 1 viên đúng quỹ đạo 1.5s.
- Evo 4 Skill *Lẩn Khuất* (CD 12s, 150$): vô ảnh tức thì 1.5s.
- Nộ: +15 mỗi lần né sát thương nhờ Vô Ảnh. Ultimate *Vòng Linh*: 3s phân thân 3 tàn ảnh cùng bắn.
- Combo: 1+3 tàn ảnh nhân đôi; 3+4 mỗi tàn ảnh trúng nạp 4 Nộ.

**18. Pháo Cao Xạ (`aaa`)** — Kiểm Soát/Đối Đầu
- Evo 3 *Vùng Cấm Bay* (120$): GIỮ đặt vùng cấm 3s; mọi đạn địch bay qua bị giảm 40% tốc.
- Evo 4 Skill *Đạn Pháo Sáng* (CD 10s, 150$): đánh dấu toàn làn địch 3s (đạn của mình tự hướng nhẹ).
- Nộ: +1 mỗi mục tiêu bị đánh dấu trúng. Ultimate *Bầu Trời Rực Lửa*: 6 loạt tên lửa rơi dần xuống làn địch.
- Combo: 2+3 vùng cấm gây dame 0.2/tick.

**19. Kiếm Tôn (`blade_god`)** — Đối Đầu/Kiểm Soát
- Evo 3 *Luân Chuyển Hoàn Mỹ* (130$): luân phiên Quang Kiếm ↔ phát kế tiếp gây +40% khi đổi đúng nhịp.
- Evo 4 Skill *Kiếm Giải* (CD 10s, 160$): gọi 2 thanh kiếm quanh xe 3s.
- Nộ: +12 mỗi lần luân phiên đúng nhịp. Ultimate *Tôn Kiếm Thiên Hạ*: 3s mọi kiếm thành xuyên thấu, vòng quét lớn.
- Combo: 1+4 Skill thêm +1 kiếm; 3+4 luân phiên nạp Nộ.

**20. Kiếm Trận (`van_kiem`)** — Kiểm Soát/Đối Đầu
- Evo 3 *Kiếm Thế Tiến Công* (110$): nhấp đôi đổi hướng kiếm đang bay một lần.
- Evo 4 Skill *Triệu Kiếm* (CD 9s, 150$): triệu thêm 3 thanh kiếm tại chỗ ngay.
- Nộ: +1 mỗi thanh kiếm trúng. Ultimate *Vạn Kiếm Quy Tông*: 4s mưa kiếm ghim làn địch.
- Combo: 2+3 Kiếm Thế Hoàn Chỉnh thêm tần suất; 3+4 đổi hướng nạp 4 Nộ.

**21. Súng Nước (`water_gun`)** — Kiểm Soát/Đối Đầu
- Evo 3 *Nước Dâng* (100$): GIỮ dài hơn 1s đẩy lùi địch bằng tia nước (không chỉ laser).
- Evo 4 Skill *Vòi Rồng* (CD 11s, 150$): tia nước rộng đẩy lùi và làm ướt (+20% dame).
- Nộ: +1 mỗi giây tia liên tục trúng. Ultimate *Lũ Quét*: 3s sóng nước quét làn địch.
- Combo: 1+3 nước dâng xuyên.

**22. Lò Nung (`furnace`)** — Đối Đầu/Kiểm Soát
- Evo 3 *Than Hồng* (110$): mỗi 5 stack Đốt nổ → để lại than 3s tiếp tục đốt.
- Evo 4 Skill *Thổi Lửa* (CD 10s, 140$): thêm 3 stack Đốt tức thời.
- Nộ: +12 mỗi lần nổ 5 stack. Ultimate *Núi Lửa*: 3s phun lửa vòng quanh, mọi địch trong tầm +5 Đốt/s.
- Combo: 2+3 than hồng cộng dồn không giới hạn 1 lần.

### 3.2 Nhóm ma thuật và chú lực

**23. Âm Dương Sư (`am_duong_su`)** — Kiểm Soát/Đối Đầu
- Evo 3 *Hợp Nhất Âm Dương* (120$): GIỮ ghép 1 bùa Âm + 1 bùa Dương thành bùa nổ lớn.
- Evo 4 Skill *Đảo Chú* (CD 9s, 140$): đảo toàn bộ bùa trong sân Âm↔Dương, kích nổ ngay.
- Nộ: +10 mỗi lần kích nổ bùa kép. Ultimate *Thái Cực Đồ*: 4s vòng xoay Âm Dương trên làn địch.
- Combo: 3+4 hợp nhất nạp 8 Nộ.

**24. 6 Nòng (`six_barrel`)** — Đối Đầu/Sinh Tồn
- Evo 3 *Khởi Động Nhanh* (100$): nhấp đôi bỏ qua 0.5s khởi động, ngược lại nhịp bắn thấp hơn 30% trong 2s đầu.
- Evo 4 Skill *Làm Nguội Nòng* (CD 10s, 140$): hồi 1 khiên, xoá nhiệt.
- Nộ: +1 mỗi 8 viên bắn liên tục. Ultimate *Giàn Pháo Điên*: 4s 6 nòng quay tối đa, đạn xuyên.
- Combo: 1+4 Skill CD −25%.

**25. Kẻ Mạnh Nhất (`the_strongest`)** — Sinh Tồn/Đối Đầu
- Evo 3 *Vô Hạn Tích Tụ* (150$): cứ 3 lần vô hiệu sát thương → nạp thêm 1 Chú Lực.
- Evo 4 Skill *Thuật Thức Đảo Nghịch* (CD 16s, 220$): hồi 2 máu, vô hiệu 1 đòn kế.
- Nộ: +15 mỗi đòn Vô Hạn chặn được. Ultimate *Lãnh Địa Triển Khai*: 3s mọi địch trong tầm bị khóa Chú Lực, đòn Đỏ không tốn.
- Combo: 1+4 Skill CD −3s; 3+4 Chú Lực nạp 5 Nộ.

**26. Sniper (`sniper`)** — Đối Đầu/Kiểm Soát
- Evo 3 *Soi Chuẩn* (120$): GIỮ Bắn lâu hơn mở tia ngắm; phát tiếp +50% dame nếu giữ ≥ 1s.
- Evo 4 Skill *Tường Chắn Nhanh* (CD 10s, 150$): dựng tường 2s tức thì (không cần giữ).
- Nộ: +20 mỗi lần bắn đúng đầu/đúng mục tiêu giữ-ngắm. Ultimate *Phát Bắn Định Mệnh*: viên cực mạnh xuyên toàn sân (dame 6).
- Combo: 2+3 Xuyên Thủng cho tia ngắm xuyên 2.

**27. Bow (`cung`)** — Cơ Động/Đối Đầu
- Evo 3 *Tên Phân Hạng* (110$): cứ 4 mũi tên, mũi thứ 4 tách làm 3 trong tầm giữa sân.
- Evo 4 Skill *Mũi Tên Mồi* (CD 8s, 130$): bắn mũi tên bay chậm, hút mọi địch gần nó về một điểm.
- Nộ: +1 mỗi mũi tên trúng liên tiếp. Ultimate *Mưa Tên Thần*: 4s mưa tên dày, mỗi mũi xuyên.
- Combo: 1+4 Skill CD −25%.

**28. Mirror (`mirror`)** — Cơ Động/Đối Đầu
- Evo 3 *Phản Chiếu Lệch* (120$): GIỮ 0.5s đặt bản sao tạm lệch chéo, bắn cùng lúc 3s.
- Evo 4 Skill *Hoán Vị* (CD 9s, 140$): đổi chỗ với bản sao ngay, bản sao thành bất động giả.
- Nộ: +1 mỗi cặp đạn gốc-sao cùng trúng. Ultimate *Vạn Hoa Kính*: 4s ba bản sao.
- Combo: 3+4 đặt bản sao nạp 6 Nộ.

**29. Vua Đầu Bếp (`sukuna`)** — Đối Đầu/Sinh Tồn
- Evo 3 *Thái Thịt* (120$): nhát Giải thứ 4 liên tiếp trúng gây dame ×2.
- Evo 4 Skill *Phách Rách* (CD 11s, 170$): 1 nhát Phách xuyên không tốn Chú Lực.
- Nộ: +1.2 mỗi dame gây ra, nhận dame ×1.5. Ultimate *Lãnh Địa: Phủ Chết*: 3s mọi địch trong tầm nhận chém liên tiếp.
- Combo: 2+3 nhát Giải lan cả hàng.

**30. Paradox (`paradox`)** — Sinh Tồn/Cơ Động/Kiểm Soát
- Evo 3 *Dư Âm Kép* (120$): cứ 4 phát, phát thứ 4 lặp lại 2 lần (thay vì 1).
- Evo 4 Skill *Tua Ngược Ngắn* (CD 14s, 180$): quay về vị trí 2s trước, hồi 1 máu.
- Nộ: +1 mỗi lần Dư Âm trúng. Ultimate *Nghịch Thời*: 3s đạn của địch bay ngược quỹ đạo 50%.
- Combo: 3+4 Dư Âm kép nạp 5 Nộ.

**31. Nhà Ảo Thuật (`magician`)** — Cơ Động/Sinh Tồn
- Evo 3 *Chiếc Mũ Biến Hóa* (120$): mỗi 5 lá bài, 1 lá trở thành "bài lạ" bắn kiểu bất kỳ.
- Evo 4 Skill *Bay Màn* (CD 12s, 160$): thả khói che xe 1.5s và đổi chỗ phân thân.
- Nộ: +10 mỗi lần hoán đổi chủ động. Ultimate *Màn Tiếp Theo*: 4s mỗi lá bài bắn thêm hai lá phụ.
- Combo: 2+4 Suy Yếu giữ trong Ultimate.

**32. Nhà Phát Minh (`inventor`)** — Kiểm Soát/Sinh Tồn
- Evo 3 *Linh Kiện Dự Trữ* (120$): cứ 6 phát, tự nhặt 1 Linh Kiện ngẫu nhiên.
- Evo 4 Skill *Cú Máy* (CD 12s, 160$): Drone nổ ngay vị trí chọn.
- Nộ: +8 mỗi Linh Kiện dùng. Ultimate *Phi Đội Drone*: 3 Drone cùng không kích.
- Combo: 3+4 nhặt Linh Kiện nạp 6 Nộ.

**33. Shadow Hunter (`shadow_hunter`)** — Cơ Động/Đối Đầu
- Evo 3 *Dấu Săn* (100$): đánh dấu mục tiêu 4 phát liên tiếp → mục tiêu chịu thêm 30% dame.
- Evo 4 Skill *Biến Mất* (CD 10s, 140$): vô hình 1.5s, phát bắn kế chảy máu mạnh.
- Nộ: +12 mỗi lần chảy máu kết thúc. Ultimate *Cuộc Săn*: 4s địch hiển thị, tất cả đạn tự hướng.
- Combo: 1+3 dấu săn lên 5 lần.

**34. Shortgun (`shortgunATK`)** — Đối Đầu/Sinh Tồn
- Evo 3 *Áp Sát Cuồng* (120$): lao áp sát lần 2 cách 2s, mỗi lần nón nổ nhỏ.
- Evo 4 Skill *Thở Hổn Hển* (CD 11s, 150$): tức thì quét tới 100px, nón bộc phá nhanh hơn.
- Nộ: +14 mỗi lần nón bộc phá trúng. Ultimate *Dragon Strike Tối Thượng*: 3 nón liên tiếp lan toàn làn.
- Combo: 2+3 lao nối nhau không CD.

**35. Sấm Chớp (`thunder`)** — Đối Đầu/Cơ Động
- Evo 3 *Dòng Điện Rải* (110$): thương cắm tường lan điện 1 lần sang tường kế.
- Evo 4 Skill *Cột Sét* (CD 10s, 150$): sét đánh xuống một cột đã chọn sau 0.8s.
- Nộ: +12 mỗi thương nổ AoE trúng. Ultimate *Thiên Lôi*: 5 cột sét giáng liên tục.
- Combo: 3+4 sét lan nạp 6 Nộ.

**36. Nam Châm (`magnet`)** — Kiểm Soát/Cơ Động
- Evo 3 *Đảo Cực Tức Thời* (110$): nhấp đôi đảo cực mọi cột từ trường, đẩy/hút đạn.
- Evo 4 Skill *Xung Từ* (CD 10s, 140$): hút/đẩy tất cả vật thể và đạn.
- Nộ: +8 mỗi viên bị đổi hướng bởi cột. Ultimate *Siêu Từ Trường*: 3s mọi đạn địch bị hút về một điểm và nổ.
- Combo: 2+3 cột từ lan 2 lần.

**37. Tiến Hóa (`evolution`)** — Sinh Tồn/Đối Đầu
- Evo 3 *Tế Bào Mồi* (130$): mỗi 2 rương/xe phá được → +1 chỉ số ngẫu nhiên cộng thêm.
- Evo 4 Skill *Đột Biến* (CD 15s, 180$): đổi tạm 1 chỉ số lên cao nhất 5s.
- Nộ: +10 mỗi chỉ số nhận. Ultimate *Dị Thể Tối Hậu*: 4s nhận mọi chỉ số tạm +30%.
- Combo: 2+3 chỉ số vĩnh viễn nhân 1.3.

**38. Trối Chết (`death_lock`)** — Kiểm Soát/Đối Đầu
- Evo 3 *Ràng Buộc Nhanh* (110$): ấn thứ 2 xuất hiện ngay sau 3 phát liên tiếp.
- Evo 4 Skill *Xiềng Xích* (CD 12s, 160$): giữ chân địch 1s, dồn 2 tầng ấn.
- Nộ: +12 mỗi 4 tầng ấn đầy. Ultimate *Quản Chế Tuyệt Đối*: 3s địch không đổi làn và nhận gấp đôi ấn.
- Combo: 2+3 Quản Chế tự áp ấn.

### 3.3 Nhóm chế tạo, triệu hồi, nhân vật có tài nguyên riêng

**39. Kẻ Sáng Tạo (`creator`)** — Kiểm Soát/Sinh Tồn
- Evo 3 *Bản Vẽ Nhanh* (130$): GIỮ bắn 1.5s vẽ nhanh Ụ Súng với 50% máu (nửa thời gian triển khai).
- Evo 4 Skill *Sản Xuất Hàng Loạt* (CD 14s, 180$): nhân bản món Bản Thiết Kế gần nhất (Ụ/Khiên) tại chỗ cạnh.
- Nộ: +10 mỗi sản phẩm được tạo. Ultimate *Dây Chuyền Sản Xuất*: 4s tự tạo Ụ/Khiên mỗi 1s.
- Combo: 3+4 Bản Vẽ Nhanh nạp 6 Nộ.

**40. Chiêu Hồn Sư (`necromancer`)** — Kiểm Soát/Sinh Tồn
- Evo 3 *Hồn Bám Víu* (130$): cứ 5 Linh Hồn tiêu, 1 hồn nhập vào đạn tiếp theo (đạn tự dẫn).
- Evo 4 Skill *Gọi Hồn* (CD 12s, 170$): lấy lại 2 Linh Hồn tức thì.
- Nộ: +1 mỗi Linh Hồn tiêu. Ultimate *Quân Đoàn Âm Phủ*: 4s triệu 5 hồn bay quanh bắn đạn tự động.
- Combo: 3+4 hồn nhập đạn nạp 5 Nộ.

**41. Thiên Tài (`genius`)** — Sinh Tồn/Kiểm Soát
- Evo 3 *Máy Gia Công* (140$): cứ 6 Bánh Răng ⚙️, chế tạo 1 phụ kiện ngẫu nhiên miễn phí.
- Evo 4 Skill *Mạch Quá Tải* (CD 13s, 170$): dùng 3 Bánh Răng đổi lấy khiên và +25% tốc bắn 4s.
- Nộ: +4 mỗi Bánh Răng nhặt. Ultimate *Vũ Khí Tối Thượng*: 4s mọi phụ kiện đã chế tạo kích hoạt cùng lúc.
- Combo: 2+3 Vũ Trang Hóa nhận thêm phụ kiện.

**42. Kiếm Khách (`kiem_khach`)** — Sinh Tồn/Đối Đầu
- Evo 3 *Luyện Kiếm Nhanh* (110$): mỗi Bài Tập hoàn thành thì phi kiếm kế tiếp bay xuyên.
- Evo 4 Skill *Kiếm Ý* (CD 11s, 150$): tụ khí 1s, miễn nhiễm sát thương 0.5s và hồi 1 khiên.
- Nộ: +14 mỗi Bài Tập hoàn thành. Ultimate *Vạn Kiếm Tâm*: 3s phi kiếm tự động bay đến mọi mục tiêu.
- Combo: 3+4 hoàn thành Bài Tập nạp 8 Nộ.

**43. Bình Phun (`sprayer`)** — Kiểm Soát/Đối Đầu
- Evo 3 *Hỗn Hợp Mới* (120$): GIỮ nhấp để đổi loại chất lỏng (độc ↔ dính chậm).
- Evo 4 Skill *Vệt Dầu* (CD 10s, 140$): trải vệt dầu trên làn địch, nổ khi dính lửa/điện.
- Nộ: +1 mỗi giây phun trúng. Ultimate *Cơn Mưa Độc*: 3s phủ độc cả làn địch.
- Combo: 2+3 hai chất cùng lúc.

**44. Tùy Biến (`customize`)** — Đối Đầu/Sinh Tồn
- Evo 3 *Ô Phụ Kiện* (130$): +1 điểm tùy chỉnh mỗi hiệp, có ô "tự chọn" miễn phí.
- Evo 4 Skill *Đổi Cấu Hình* (CD 13s, 160$): đổi nhanh 1 điểm tùy chỉnh giữa hai chỉ số trong 4s.
- Nộ: +10 mỗi lần đổi cấu hình. Ultimate *Cấu Hình Tối Thượng*: 4s mọi điểm tùy chỉnh x2 hiệu lực.
- Combo: 2+3 điểm tùy chỉnh tối đa +2.

**45. Kiếm Sư (`kiem_su`)** — Đối Đầu/Kiểm Soát
- Evo 3 *Nguyên Tố Tương Sinh* (130$): phi kiếm cùng nguyên tố liền nhau tăng dame 20%.
- Evo 4 Skill *Đổi Nguyên Tố* (CD 8s, 130$): chọn nguyên tố cho phi kiếm kế tiếp.
- Nộ: +8 mỗi cặp tương sinh. Ultimate *Ngũ Hành Hội Tụ*: 3s phi kiếm mang cả năm nguyên tố.
- Combo: 3+4 tương sinh nạp 5 Nộ.

**46. Cao Bồi (`revolver`)** — Đối Đầu/Cơ Động
- Evo 3 *Quay Nòng* (110$): GIỮ nhẹ quay nòng, viên kế tiếp nảy tường nhận dame ×1.5.
- Evo 4 Skill *Rút Súng Chớp* (CD 9s, 140$): bắn 3 viên liên hoàn tức thì bằng 1 lần bấm.
- Nộ: +8 mỗi lần bắn cạn cả ổ. Ultimate *6 Viên Đủ Rồi*: 6 viên tự dẫn, mỗi viên 1.5×.
- Combo: 1+4 Skill CD −25%.

**47. DJ (`dj`)** — Đối Đầu/Cơ Động/Sinh Tồn
- Evo 3 *Beat Drop* (120$): cứ 8 nhịp bắn đúng, tạo sóng âm đẩy lùi đạn địch.
- Evo 4 Skill *Remix* (CD 10s, 150$): đổi bài nhạc: tăng tốc/dame/phòng thủ cho nhịp kế 4s.
- Nộ: +1 mỗi nhịp đúng liên tiếp. Ultimate *Đêm Nhạc Lớn*: 4s toàn sân rung, đạn địch lệch hướng.
- Combo: 3+4 beat drop nạp 8 Nộ.

**48. Móc Thép (`steel_hook`)** — Kiểm Soát/Đối Đầu/Sinh Tồn
- Evo 3 *Cuộn Dây Đôi* (130$): nhấp đôi thu móc về nhanh, kéo theo mục tiêu nhẹ.
- Evo 4 Skill *Quăng Móc* (CD 11s, 160$): quăng móc tới điểm xa, kéo xe về điểm đó.
- Nộ: +14 mỗi lần kéo trúng. Ultimate *Móc Thần*: 3s kéo mọi địch về trước mặt.
- Combo: 2+3 kéo kèm hất lên.

**49. Hoa Ảnh (`flower_shadow`)** — Cơ Động/Đối Đầu/Kiểm Soát
- Evo 3 *Điệu Múa Thứ Hai* (120$): cứ 4 lần Giữ Bắn, một lần phát cánh hoa đôi.
- Evo 4 Skill *Mưa Hoa* (CD 10s, 140$): rải cánh hoa quanh, hồi Thanh Hoa 30%.
- Nộ: +1 mỗi 10% Thanh Hoa tiêu. Ultimate *Vũ Điệu Cuối*: 4s xe lướt tự do, cánh hoa bay theo bắn.
- Combo: 3+4 cánh hoa đôi nạp 5 Nộ.

**50. Kiếm Vũ (`kiem_vu`)** — Đối Đầu/Sinh Tồn/Kiểm Soát
- Evo 3 *Lưu Thủy* (110$): thanh kiếm cắm xuống để lại vết cản 2s.
- Evo 4 Skill *Rút Kiếm* (CD 9s, 140$): triệu hồi kiếm về tay ngay, dame +50% phát kế.
- Nộ: +14 mỗi lần cắm trúng. Ultimate *Kiếm Vũ Điệp Khúc*: 3s 5 thanh kiếm cắm liên tục.
- Combo: 2+3 vết cản gây dame.

**51. T-Zero (`t_zero`)** — Sinh Tồn/Đối Đầu/Kiểm Soát
- Evo 3 *Kích Hoạt Sớm* (110$): GIỮ nhẹ để T-ZERO ON ngay lập tức (không nạp 1s đầu).
- Evo 4 Skill *Tái Khởi Động* (CD 14s, 170$): xoá hiệu ứng xấu, nhận khiên 2.
- Nộ: +8 mỗi giây ở T-ZERO ON. Ultimate *Quá Tải T-ZERO*: 4s dame ×1.5, tốc ×1.2.
- Combo: 3+4 kích hoạt sớm nạp 10 Nộ.

**52. Raven - Oca (`raven_oca`)** — Đối Đầu/Cơ Động/Kiểm Soát
- Evo 3 *Đánh Dấu Mục Tiêu* (130$): đạn nhẹ đánh dấu → hỏa lực lớn tự dẫn đến mục tiêu.
- Evo 4 Skill *Gọi Quạ* (CD 12s, 170$): quạ bay trinh sát làn địch, hiện vị trí và làm chậm.
- Nộ: +10 mỗi lần chiến thuật kích hoạt. Ultimate *Không Kích Toàn Diện*: 4 đợt không kích kéo dài.
- Combo: 2+3 đánh dấu thành điểm không kích.

**53. Tia Lazer (`lazer_beam`)** — Đối Đầu
- Evo 3 *Đa Tia* (100$): GIỮ 1s tách tia chính thành 2 tia phụ.
- Evo 4 Skill *Chớp Nhoáng* (CD 9s, 130$): tia cực ngắn, dame tick ×3 trong 0.6s.
- Nộ: +1 mỗi 0.5s tia liên tục trúng. Ultimate *Tia Hủy Diệt*: tia dày quét 2.5s toàn làn.
- Combo: 2+3 tia phụ gây hiệu ứng nhiệt.

**54. Y Sư (`healer`)** — Sinh Tồn/Kiểm Soát
- Evo 3 *Vòng Hồi Phục* (120$): mỗi 5 viên Hấp Huyết trúng → hồi 0.5 máu cộng thêm.
- Evo 4 Skill *Thuốc Tiên* (CD 14s, 170$): hồi 1.5 máu, xoá hiệu ứng xấu.
- Nộ: +12 mỗi khi hồi phục. Ultimate *Phép Lạ*: 3s hồi liên tục 0.5 máu/s và đạn gây hồi.
- Combo: 3+4 hồi nạp 6 Nộ.

**55. Chrono & Neo (`chrononeo`)** — Đối Đầu/Cơ Động/Sinh Tồn
- Evo 3 *Hoán Vị Thời Đại* (130$): nhấp đôi đổi nhanh giữa Chrono ↔ Neo, đạn kế buff.
- Evo 4 Skill *Khoảnh Khắc* (CD 12s, 170$): chậm thời gian đối thủ 1.5s.
- Nộ: +10 mỗi lần hoán vị. Ultimate *Dòng Chảy*: 4s hai nhân vật cùng chiến đấu.
- Combo: 3+4 hoán vị nạp 8 Nộ.

**56. Gemini (`gemini`)** — Sinh Tồn/Kiểm Soát/Đối Đầu
- Evo 3 *Cộng Hưởng Song Sinh* (120$): hai xe bắn cùng lúc 5 phát tạo xung điện giữa hai xe.
- Evo 4 Skill *Đổi Vai* (CD 10s, 150$): đổi vị trí hai xe, mỗi xe nhận khiên 1.
- Nộ: +6 mỗi khi một xe bị mất máu. Ultimate *Song Tinh*: 4s hai xe hợp thể thành một xe lớn.
- Combo: 2+3 xung điện tăng dame với địch giữa.

**57. Huyết Ma (`blood_lord`)** — Sinh Tồn/Đối Đầu/Cơ Động
- Evo 3 *Máu Chảy Thành Sông* (120$): cứ 5 phát, một phát tiêu 0.5 máu đổi dame ×2 và hồi gấp đôi.
- Evo 4 Skill *Hiến Tế* (CD 12s, 150$): tiêu 1 máu để nhận +40% tốc bắn 4s.
- Nộ: +1.5 mỗi dame hút máu. Ultimate *Huyết Nguyệt*: 4s hút máu 30%, tốc tăng.
- Combo: 3+4 phát tiêu máu nạp 8 Nộ.

**58. Cuồng Chiến Binh (`berserker`)** — Đối Đầu/Sinh Tồn
- Evo 3 *Vết Thương Cũ* (110$): mỗi 4 máu đã mất tích thêm 1 tầng cuồng nộ (+5% dame).
- Evo 4 Skill *Hét Lớn* (CD 12s, 150$): 2s đẩy lùi + hồi 1 máu, tốc bắn +20%.
- Nộ: +8 mỗi 1 máu mất. Ultimate *Điên Cuồng*: 5s dame ×2, miễn khống chế.
- Combo: 2+4 nhận dame nạp Nộ ×1.3.

**59. Kazuki (`kazuki`)** — Đối Đầu/Cơ Động/Kiểm Soát
- Evo 3 *Ý Niệm Tụ* (130$): cứ 3 nhát trái-phải, nhát kế tiếp xuyên.
- Evo 4 Skill *Song Trảm* (CD 9s, 150$): hai nhát liên tiếp tức thì.
- Nộ: +10 mỗi lần kết hợp đủ tả-hữu trúng. Ultimate *Vô Niệm Bách Trảm*: 3s chém liên tiếp 12 nhát.
- Combo: 3+4 tụ ý nạp 6 Nộ.

**60. Tsukiyo (`tsukiyo`)** — Cơ Động/Đối Đầu/Kiểm Soát
- Evo 3 *Phi Tiêu Ẩn* (120$): cứ 4 phát, bắn thêm 3 phi tiêu quạt.
- Evo 4 Skill *Ẩn Thân* (CD 11s, 160$): tàng hình 1.5s, hồi Nội Năng 30%.
- Nộ: +1 mỗi Nội Năng tiêu 5. Ultimate *Nhẫn Thuật Tối Thượng*: 4s phân thân.
- Combo: 2+3 phi tiêu mang hiệu ứng.

**61. Joker (`joker`)** — Cơ Động/Kiểm Soát/Đối Đầu
- Evo 3 *Lá Bài Thứ Sáu* (130$): cứ 5 lá rút, nhận 1 lá miễn phí.
- Evo 4 Skill *Xáo Bài* (CD 10s, 150$): đổi toàn tay bài.
- Nộ: +8 mỗi lá đặc biệt rút. Ultimate *Joker Wild*: 4s mọi lá thành Joker.
- Combo: 3+4 lá thứ sáu nạp 8 Nộ.

**62. Juggernaut (`juggernaut`)** — Sinh Tồn/Đối Đầu
- Evo 3 *Thân Sắt* (110$): sau mỗi đòn miễn nhiễm, nhận khiên 0.5.
- Evo 4 Skill *Lì Đòn* (CD 13s, 160$): 1.5s giảm 70% sát thương nhận.
- Nộ: +10 mỗi đòn miễn nhiễm. Ultimate *Vô Địch*: 3s miễn nhiễm toàn phần và phản sát thương.
- Combo: 2+4 phản đòn thêm 1 máu.

### 3.4 Nhóm pháo, hóa chất, vật lý

**63. Pháo Phân Mảnh (`cluster_gun`)** — Đối Đầu/Kiểm Soát
- Evo 3 *Mảnh Thứ Cấp* (120$): mảnh vỡ ra thêm lần vỡ thứ hai (chỉ mảnh lớn).
- Evo 4 Skill *Lựu Đạn* (CD 10s, 150$): ném lựu đạn nổ phân mảnh tại vị trí.
- Nộ: +1 mỗi mảnh trúng. Ultimate *Mưa Mảnh*: 3s mọi đạn tách thành 5.
- Combo: 3+4 mảnh thứ cấp nạp 5 Nộ.

**64. Nhân Bản (`clone`)** — Kiểm Soát/Đối Đầu/Sinh Tồn
- Evo 3 *Bản Sao Bền* (130$): bản sao tồn tại +30%, bản sao thứ ba xuất hiện sớm.
- Evo 4 Skill *Phân Thân* (CD 12s, 160$): tạo ngay 1 bản sao tạm 4s.
- Nộ: +6 mỗi bản sao chết. Ultimate *Quân Đoàn Bản Sao*: 4s 4 bản sao.
- Combo: 3+4 bản sao bền nạp 4 Nộ.

**65. Phi Công (`jet_pilot`)** — Kiểm Soát/Cơ Động/Đối Đầu
- Evo 3 *Bay Thấp* (120$): lướt thấp né đạn thường 0.8s (giữ).
- Evo 4 Skill *Chiến Đấu Cơ Phụ* (CD 14s, 180$): gọi 1 máy bay bay ngang bắn.
- Nộ: +10 mỗi lần AI Tự Hành hạ mục tiêu. Ultimate *Không Quân Toàn Diện*: 3 máy bay tấn công.
- Combo: 2+4 AI mạnh hơn.

**66. Tất Sát (`tat_sat`)** — Đối Đầu/Cơ Động
- Evo 3 *Thuấn Bộ* (120$): nhấp đôi lướt ngắn, nhát kế +40% dame.
- Evo 4 Skill *Nhất Kiếm* (CD 12s, 170$): nhát chém đã tụ sẵn 50% ngay.
- Nộ: +20 mỗi lần chém tụ đầy trúng. Ultimate *Tất Sát Vô Địch*: 1 nhát cực lớn, xuyên mọi thứ.
- Combo: 3+4 thuấn bộ nạp 8 Nộ.

**67. Nhất Quyền (`one_punch`)** — Đối Đầu/Sinh Tồn
- Evo 3 *Chuỗi Quyền* (140$): mỗi 4 đòn, đòn thứ 4 hất lùi mạnh.
- Evo 4 Skill *Đấm Mạnh* (CD 12s, 170$): đấm tức thì dame ×2, tốn 1 đạn.
- Nộ: +1.5 mỗi dame gây ra. Ultimate *Nghiêm Túc*: một quyền dame cực cao (kèm cảnh báo 0.5s).
- Combo: 3+4 chuỗi quyền nạp 8 Nộ.

**68. Boomerang (`boomerang`)** — Kiểm Soát/Cơ Động
- Evo 3 *Quay Vòng Hẹp* (110$): giữ để đổi quỹ đạo từ rộng sang hẹp.
- Evo 4 Skill *Ném Đôi* (CD 9s, 140$): ném 2 boomerang cùng lúc.
- Nộ: +8 mỗi lần boomerang trúng khi quay về. Ultimate *Cơn Lốc Boomerang*: 4 boomerang bay vòng.
- Combo: 2+3 quỹ đạo hẹp xuyên.

**69. Nhện Độc (`arachnid`)** — Đối Đầu/Kiểm Soát
- Evo 3 *Giăng Lưới* (110$): GIỮ đặt lưới tơ ở làn địch, làm chậm.
- Evo 4 Skill *Nhện Con* (CD 10s, 140$): thả 3 nhện con tự bò đến địch.
- Nộ: +12 mỗi mục tiêu bị kén. Ultimate *Ổ Nhện Khổng Lồ*: 3s tơ phủ toàn làn.
- Combo: 2+3 lưới tơ thêm độc.

**70. Siêu Năng (`psychokinesis`)** — Kiểm Soát
- Evo 3 *Nâng Vật* (120$): GIỮ nâng 1 viên đạn địch ném lại.
- Evo 4 Skill *Đóng Băng Không Gian* (CD 13s, 160$): đóng băng mọi đạn trong sân 1s.
- Nộ: +10 mỗi vật nâng. Ultimate *Dừng Lại!*: 2.5s toàn sân đạn địch dừng.
- Combo: 3+4 nâng vật nạp 6 Nộ.

**71. Thợ May (`tailor`)** — Kiểm Soát
- Evo 3 *Sợi Chỉ Nối* (110$): nối hai điểm kim → dây chỉ cản đạn.
- Evo 4 Skill *Vá Lại* (CD 12s, 150$): vá lỗ trống, hồi 1 khiên.
- Nộ: +1 mỗi kim trúng. Ultimate *Y Phục Chiến Binh*: 4s khoác áo giáp +2 khiên.
- Combo: 2+3 dây chỉ gây dame.

**72. Jack - 6 Lỗ (`jack_6_lo`)** — Đối Đầu/Cơ Động
- Evo 3 *Xoay Ổ Lỗ* (120$): mỗi 6 viên, lỗ ngẫu nhiên thành "lỗ vàng" dame ×3.
- Evo 4 Skill *Cược Lớn* (CD 11s, 150$): đặt cược máu để nhân dame.
- Nộ: +12 mỗi "lỗ vàng" trúng. Ultimate *Cược Tất*: một viên với 50% x4 dame hoặc x0.
- Combo: 3+4 lỗ vàng nạp 6 Nộ.

**73. Kusarigama (`kusarigama`)** — Đối Đầu/Sinh Tồn
- Evo 3 *Xích Kéo* (120$): GIỮ vung xích, kéo địch lại gần.
- Evo 4 Skill *Cắt Xích* (CD 11s, 150$): xích cắt ngang, hút máu.
- Nộ: +1.5 mỗi dame gây ra. Ultimate *Khát Máu*: 4s vung xích liên tục, hút máu.
- Combo: 2+3 xích kéo gây chảy máu.

**74. The Clock (`the_clock`)** — Kiểm Soát/Cơ Động
- Evo 3 *Kim Phút* (110$): cứ 12 nhịp, kim phút chạy một vòng gây dame.
- Evo 4 Skill *Dừng Giây* (CD 14s, 160$): dừng 1 giây thời gian của địch.
- Nộ: +1 mỗi nhịp kim. Ultimate *Giờ Tận*: 20 nhịp lập tức gõ.
- Combo: 3+4 kim phút nạp 8 Nộ.

**75. COC (`coc`)** — Đối Đầu/Cơ Động
- Evo 3 *Tung Đồng Xu* (120$): mỗi hiệp 1 lần đổi vũ khí tự chọn.
- Evo 4 Skill *Đổi Vận* (CD 10s, 150$): reroll vũ khí hiện tại.
- Nộ: +10 mỗi lần vũ khí 1 và 6 xuất hiện. Ultimate *Đỉnh Cao Vận Mệnh*: 4s mọi vũ khí đồng thời.
- Combo: 3+4 tung xu nạp 6 Nộ.

**76. Phản Chiếu (`prism`)** — Sinh Tồn/Kiểm Soát
- Evo 3 *Lăng Kính Kép* (120$): tia chia đôi khi qua lăng kính thứ hai.
- Evo 4 Skill *Gương Bảo Vệ* (CD 12s, 150$): dựng gương phản đạn 1.5s.
- Nộ: +14 mỗi lần phản đạn thành công. Ultimate *Quang Phổ*: 3s mọi tia phản chiếu nhân ba.
- Combo: 2+3 gương vỡ lan.

**77. The Adapter (`the_adapter`)** — Sinh Tồn/Đối Đầu
- Evo 3 *Ghi Nhớ* (120$): lưu 1 loại đòn địch và kháng nó 20%.
- Evo 4 Skill *Thích Ứng Ngay* (CD 13s, 160$): lập tức kháng 80% loại đòn gần nhất 3s.
- Nộ: +10 mỗi loại đòn học. Ultimate *Tử Huyệt*: 3s mọi đòn gây +50% lên địch.
- Combo: 2+4 Ultimate dùng Phá Giải.

**78. Tỉnh (`tinh`)** — Kiểm Soát/Đối Đầu
- Evo 3 *Ánh Nhìn Sắc* (110$): địch lướt/lao lần đầu bị đẩy lùi.
- Evo 4 Skill *Khóa Chân* (CD 12s, 150$): làm địch không lướt/lao trong 3s.
- Nộ: +14 mỗi lần chặn lướt thành công. Ultimate *Lĩnh Vực Tĩnh*: 3s địch đứng yên.
- Combo: 3+4 chặn nạp Nộ 8.

**79. Wind (`wind`)** — Đối Đầu/Cơ Động
- Evo 3 *Gió Xoáy* (110$): giữ để xoáy tạo lốc nhỏ.
- Evo 4 Skill *Gió Nhẹ* (CD 9s, 130$): đẩy lùi đạn thường.
- Nộ: +10 mỗi lốc trúng. Ultimate *Cuồng Phong*: 3s lốc lớn.
- Combo: 2+3 lốc xuyên.

**80. Diệp Thanh Phong (`diep_thanh_phong`)** — Kiểm Soát/Cơ Động
- Evo 3 *Lá Rụng* (120$): cứ 5 phát, vòng lá bay quanh 3s.
- Evo 4 Skill *Cuốn Gió* (CD 11s, 160$): hút đạn địch gần.
- Nộ: +8 mỗi lá trúng. Ultimate *Phong Thần*: 4s toàn sân lá xoáy.
- Combo: 3+4 lá rụng nạp 6 Nộ.

**81. Railgun (`railgun`)** — Kiểm Soát/Đối Đầu
- Evo 3 *Cuộn Từ Phụ* (120$): GIỮ tụ lực tia thêm 0.5s, dame tăng.
- Evo 4 Skill *Xung Điện* (CD 11s, 150$): phóng xung điện làm choáng 0.5s.
- Nộ: +12 mỗi tia tụ đầy trúng. Ultimate *Siêu Súng Điện Từ*: tia khổng lồ xuyên toàn sân.
- Combo: 3+4 tụ phụ nạp 6 Nộ.

**82. Skinwalker (`skinwalker`)** — Đối Đầu
- Evo 3 *Lớp Da Thứ Hai* (120$): lưu 1 lớp da, đổi nhanh khi nhấp đôi.
- Evo 4 Skill *Lột Da* (CD 12s, 160$): đổi sang da khác ngay, nhận khiên 1.
- Nộ: +10 mỗi lần thay da. Ultimate *Thay Da Tối Thượng*: 4s kết hợp hai da.
- Combo: 3+4 lớp da thứ hai nạp 6 Nộ.

**83. Idol (`idol`)** — Kiểm Soát/Cơ Động
- Evo 3 *Fan Cuồng* (110$): mỗi 8 phát, gọi fan hỗ trợ bắn.
- Evo 4 Skill *Biểu Diễn Nhanh* (CD 12s, 150$): làm choáng địch 0.8s bằng ánh đèn.
- Nộ: +1 mỗi fan bắn trúng. Ultimate *Concert*: 4s dàn fan lớn.
- Combo: 3+4 fan cuồng nạp 6 Nộ.

**84. Dynamite (`dynamite`)** — Kiểm Soát/Đối Đầu
- Evo 3 *Ngòi Nổ Chậm* (110$): GIỮ điều chỉnh thời gian nổ.
- Evo 4 Skill *Bó Thuốc Nổ Mồi* (CD 10s, 140$): thả 1 bó TNT cố định.
- Nộ: +14 mỗi vụ nổ trúng. Ultimate *Đại Nổ*: bó TNT khổng lồ.
- Combo: 2+3 ngòi nổ lan.

**85. Hai Nòng (`twin_gun`)** — Đối Đầu
- Evo 3 *Song Song Chụm* (110$): GIỮ chụm hai nòng thành một tia mạnh.
- Evo 4 Skill *Nạp Kép* (CD 9s, 140$): nạp lại tức thì cả hai nòng.
- Nộ: +1 mỗi cặp trúng. Ultimate *Bão Hai Nòng*: 4s hai nòng xả đạn, xuyên.
- Combo: 3+4 chụm nạp 6 Nộ.

**86. Mortar (`mortar`)** — Kiểm Soát/Đối Đầu
- Evo 3 *Hiệu Chỉnh* (120$): GIỮ ngắm điểm rơi, nhấp nhả.
- Evo 4 Skill *Pháo Sáng* (CD 11s, 150$): chiếu sáng vùng, làm lộ địch.
- Nộ: +12 mỗi lần trúng. Ultimate *Pháo Kích Dồn Dập*: 6 quả đạn rơi nhanh.
- Combo: 2+3 điểm rơi mở rộng.

**87. Pháo Lửa (`fire_cannon`)** — Kiểm Soát/Đối Đầu
- Evo 3 *Cầu Lửa Kẹp* (110$): GIỮ nhả cầu lửa lớn.
- Evo 4 Skill *Tường Lửa* (CD 10s, 140$): tường lửa 2s.
- Nộ: +1 mỗi giây địch bị đốt. Ultimate *Địa Ngục Thiêu*: 3s toàn làn bốc cháy.
- Combo: 2+3 cầu lửa lan.

**88. Batter (`batter`)** — Sinh Tồn/Đối Đầu
- Evo 3 *Vung Gậy Kép* (120$): GIỮ vung gậy hai lần.
- Evo 4 Skill *Đánh Bóng Phản* (CD 10s, 150$): phản đạn bay gần.
- Nộ: +14 mỗi lần phản đạn. Ultimate *Home Run*: 1 cú đánh dội lại mọi đạn.
- Combo: 3+4 vung kép nạp 6 Nộ.

**89. Hellrider (`hellrider`)** — Cơ Động/Đối Đầu
- Evo 3 *Phanh Gấp* (110$): nhả gia tốc bỏ lại vệt lửa.
- Evo 4 Skill *Tăng Áp* (CD 10s, 140$): tăng tốc ngay tối đa 2s.
- Nộ: +1 mỗi giây ở tốc cao. Ultimate *Địa Ngục Xông Lên*: 4s tốc tối đa, húc gây dame.
- Combo: 3+4 vệt lửa nạp 6 Nộ.

**90. Kẻ Thu Thập (`collector`)** — Đối Đầu/Kiểm Soát
- Evo 3 *Mẫu Vật Quý* (120$): sau 5 phát, lấy 1 mẫu vật từ đạn địch.
- Evo 4 Skill *Triển Lãm Nhanh* (CD 13s, 160$): phát mẫu vật gần nhất.
- Nộ: +10 mỗi mẫu vật. Ultimate *Bảo Tàng Sống*: 4s phát mọi mẫu vật.
- Combo: 3+4 mẫu vật nạp 6 Nộ.

**91. The Admin (`the_admin`)** — Sinh Tồn/Cơ Động
- Evo 3 *Luật Tạm* (120$): GIỮ chọn 1 luật tạm 8s.
- Evo 4 Skill *Chỉnh Luật* (CD 13s, 160$): đảo 1 luật hiện hành.
- Nộ: +10 mỗi luật kích hoạt. Ultimate *Quyền Root*: 4s đặt 2 luật cùng lúc.
- Combo: 3+4 luật tạm nạp 6 Nộ.

---

## 4. Câu hỏi mở cho người dùng

1. **Đa combo hay chỉ combo ưu tiên?** Khi sở hữu 3–4 evo, Full Evo có cộng dồn nhiều combo (tối đa 2) hay chỉ nhận combo ưu tiên `34 > 24 > 23 > 14 > 13 > 12`?
2. **Full Evo một lần hay nâng cấp được?** Nếu mua Full Evo khi có 2 evo rồi mua thêm evo thứ 3, có "nâng cấp tổ hợp" (trả phụ phí) hay giữ nguyên combo đã chốt?
3. **Cơ Bản bản MAIN**: tổ hợp `12` có sẵn, nên Evo 3/4 mở combo ngay hay bị khoá cho đến khi mua?
4. **Phím tắt Skill desktop** (đề xuất Q / `/`): đồng ý hay đổi?
5. **Nộ qua hiệp**: giữ 50% sang hiệp sau (mặc định) hay reset về 0 cho dễ cân bằng?
6. **Ultimate có kết liễu được không?** Mặc định không giết ngay mục tiêu đầy máu. Có muốn một vài body "nhất kích" (Tất Sát, Nhất Quyền) ngoại lệ?
7. **Giá Evo 3** rẻ hơn Evo 1 cho bao nhiêu body (hiện đề xuất 90–110$ cho một nhóm nhẹ)? Có muốn mọi Evo 3 đồng giá cho dễ nhớ?
8. **G.E.A.R mới (mục 2)**: giữ cả 12 hay chỉ 8–10? Tầng và tỷ lệ rơi có theo bảng hiện tại không?
9. **Bot**: mức độ Dễ có cần bị chặn mua Evo 4 để không áp đảo người mới?
10. **Online**: ưu tiên lockstep (như hiện tại) hay chuyển nhẹ sang host-authoritative cho phần Nộ/Skill?
11. **Thí điểm 10 body**: danh sách đề xuất (mục 1.11) đã hợp lý chưa, hay muốn đổi body nào?
12. **Thông tin Nộ của đối thủ**: có hiển thị viền phát sáng khi Nộ ≥ 80% để đối thủ biết không?

---
## 5. Bổ sung (người dùng)

- **Giới hạn Evo:** mỗi trận chỉ mua được **2 Evo** (trong 4). Muốn lên **3 Evo** phải có G.E.A.R cấp **Lăng Kính (PRISMATIC)** mở thêm 1 ô Evo.
- **G.E.A.R Lăng Kính mới — "Con Đường Tiến Hóa":**
  - Mở khóa ô Evo thứ 3 (và Full Evo theo tổ hợp vẫn tính theo 2 Evo bất kỳ đã sở hữu).
  - Bạn **mạnh hơn theo mỗi Evo đang có** (gợi ý: +8% sát thương & +0.5 Max HP mỗi Evo).
  - Đổi lại: **không được mua FEET** (trừ **Lợi Tức**).
  - Đối thủ được bồi thường ngay **+$200** và **nhận thêm 1 lượt chọn G.E.A.R**.
