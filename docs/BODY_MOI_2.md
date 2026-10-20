# Đặc tả 2 body mới (người dùng gửi)

# THÔNG SỐ LOGIC: TẤT SÁT (`tat_sat` — "Quên ta rồi sao NHẤT KIẾM TẤT SÁT!")

* **Chỉ số gốc:** `HP: 3.5 | Dame: 2.0 | Năng lượng: Tụ lực (3.5s đầy 100%) | Tốc độ: 5.0 | Size: 30×30`

## 1. Cơ Chế Tụ Lực Nút Bắn (3 Mốc Xuất Chiêu)
* **Giữ nút Bắn:** Tăng `chargePct` từ `0%` lên `100%` trong `4.5s` (Có `evo_ts_1`: giảm còn `3.5s`).
* **Nhả nút Bắn:** Kiểm tra giá trị `chargePct` để thực thi 1 trong 3 nhánh kỹ năng:

### NHÁNH 1: `1% <= chargePct <= 49%` (Lướt Chém Cảnh Báo)
1. Lưu vị trí xuất phát `(startX, startY)`. Lao thẳng dọc lên phía sân địch với tốc độ cao (`14.0`).
2. Khi chạm mục tiêu đầu tiên (tướng địch, vật triệu hồi, thùng, tường) HOẶC chạm tường biên phía địch:
   * Dừng lại tại điểm chạm `(hitX, hitY)` và tạo **Vùng Cảnh Báo Đỏ** tồn tại **`0.5s`**.
   * Bán kính Vùng Cảnh Báo tỷ lệ thuận với `chargePct`: `radius = 45px + (chargePct / 49) * 55px` (từ `45px` đến `100px`).
   * Bản thể lập tức **giật lùi về `(startX, startY)`**.
   * Sau `0.5s` cảnh báo: Vùng đỏ phát nổ kiếm khí gây **`1.0x` sát thương (`2.0` dame)** (Có `evo_ts_2`: Xóa đạn thường trong vùng & làm chậm `35%` trong `2s`).

### NHÁNH 2: `50% <= chargePct <= 85%` (Có Full Evo: `50% -> 74%`) — (Phân Ảnh Đoạt Mệnh)
1. Kích hoạt hiệu ứng **Làm Chậm Thời Gian (Slow-motion nhẹ `0.4s`)** khi vừa thả nút, phóng **1 Phân Ảnh** lao thẳng dọc lên phía trước với tốc độ rất nhanh (`18.0`). (Có `evo_ts_2`: Phân Ảnh đi xuyên qua Thùng Tiếp Tế và Xe Tiền).
2. **Xét va chạm đầu tiên của Phân Ảnh:**
   * **2A — Trúng Tướng Địch:** Bản thể Tất Sát **biến mất (Bất Tử & Untargetable trong `2.0s`)**. Chạy hoạt ảnh **Liên Hoàn Trảm & Chém Nát Màn Hình** kéo dài **`2.0s`** ngay trên người kẻ địch (khóa nhẹ mục tiêu tại chỗ trong lúc chém). Kết thúc `2.0s`: Gây tổng sát thương **`x3` sát thương cơ bản (`6.0` dame)** rồi hiện thân lại ở vị trí cũ trên làn mình!
   * **2B — Trúng bất kỳ thứ gì khác (Tường chắn, Vật triệu hồi, Thùng đồ, hoặc Tường biên cuối sân):** Tại điểm va chạm, tạo **2 Vùng Cảnh Báo đồng tâm**:
     1. **Vùng 1 (Nhỏ — Bán kính `60px`, Cảnh báo `0.25s`):** Chém sau `0.25s`, gây **`0` sát thương** nhưng làm **CHOÁNG tướng địch `2.0 giây`**! (Có `evo_ts_2`: Phá hủy vật triệu hồi va chạm và kéo nhẹ địch vào tâm).
     2. **Vùng 2 (Lớn — Bán kính `110px`, Cảnh báo `0.5s`):** Phân Ảnh giật về chỗ chủ thể, đúng mốc `0.5s` chém nổ Vùng 2 gây **`1.0x` sát thương (`2.0` dame)**!

### NHÁNH 3: `86% <= chargePct <= 100%` (Có Full Evo: `75% -> 100%`) — (Nhất Kiếm Tất Sát Hitscan `x6`)
1. Hiển thị **1 Đường Cảnh Báo Thẳng** dọc từ mũi xe tới cuối sân địch trong **`0.35s`** (rộng `36px`; có `evo_ts_2`: rộng `48px`).
2. Hết `0.35s`, chém 1 nhát **Hitscan** dọc theo đường cảnh báo:
   * **Nếu TRÚNG TƯỚNG ĐỊCH:** chuỗi biến mất `2.0s` chém liên hoàn và **chém nát màn hình** giống 2A, tổng sát thương **`x6` (`12.0` dame)**! (Có `evo_ts_2`: Xuyên `100%` Khiên).
   * **Nếu KHÔNG trúng:** Tất Sát lướt vút lên theo đường kiếm rồi **lướt giật về vị trí cũ** (Có `evo_ts_1`: Hoàn lại `35%` thanh tụ lực; Có `Full Evo`: Để lại vùng nổ kép Choáng `2s` + Dame như 2B tại cuối đường kiếm).

## 2. Tiến Hóa
* **Evo 1 — Thuấn Kiếm Sát Ý (`evo_ts_1` — `$100`):** Tụ đầy còn `3.5s`. Khi tụ `>= 50%` giảm `30%` sát thương nhận vào. Chém trượt tướng địch ở Nhánh 2 hoặc 3 được hoàn `35%` thanh tụ lực.
* **Evo 2 — Phá Vọng Đoạt Hồn (`evo_ts_2` — `$130`):** Nhánh 1 xóa đạn thường & làm chậm `35%`. Nhánh 2 xuyên Thùng/Xe tiền và hút nhẹ địch vào Vùng 2. Nhánh 3 tăng độ rộng tia và **Xuyên Khiên**.
* **FULL EVO — Vô Thượng Nhất Kiếm:** `+1.5 Max HP`, mỗi lần *Chém Nát Màn Hình* thành công hồi `+1.0 HP`. Ngưỡng Nhánh 3 giảm còn **`75%`**. Nhánh 3 trượt vẫn để lại **2 vùng cảnh báo (Choáng 2s + Nổ dame)** tại điểm cuối.

---

# THÔNG SỐ LOGIC: NHẤT QUYỀN / MỘT ĐẤM (`one_punch`)

* **Chỉ số gốc:** `HP: 8.0 | Dame: 2.5 | Đạn: 1 (Nạp 2.2s, Evo 1: 1.5s) | Tốc độ: 3.6 | Size: 30×30`

## 1. Nội Tại: Một Đấm & Thanh "Thú Vị" (`excitement`: 0% – 100%)
* **Chuyển hóa Đạn:** Cố định `maxAmmo = 1`. Mọi nguồn cộng thêm đạn chuyển thành `+20%` tốc nạp đạn và `+15%` sát thương.
* **Tích Thú Vị khi nhận sát thương** (tính trên sát thương gốc trước khi giảm `rawDamage`): `excitement += rawDamage * 22` (evo_punch_1: `30` / 1.0 dame; Full Evo: `40` / 1.0 dame). Tối đa `100%`.
* **Buff theo `excitement`:** tốc chạy `+(excitement * 0.35)%` (tối đa +35%); giảm sát thương nhận `-(excitement * 0.30)%` (tối đa 30%).
* **Hồi máu khi không nhận sát thương `5.0s`:**
  * Base: tiêu `10%` Thú Vị → `+1.0 HP` (xả `20%/s` = `+2.0 HP/s`).
  * Evo 1: chỉ tốn `7%` Thú Vị → `+1.0 HP`.
  * Full Evo: Thú Vị KHÔNG giảm khi hồi; sau `5s` không nhận sát thương tự hồi `+0.5 HP/s` nếu `excitement > 0`.

## 2. Nhấp Bắn — Đấm Thường
* Quét luồng áp lực dọc bản đồ: trúng tâm (`|dx| < 30px`) `1.0x` (`2.5` dame), đẩy lùi nhẹ và **phá 1 lớp Khiên**; trúng rìa (`30–85px`) `0.32x` (`0.8` dame). Xóa đạn thường trên đường quyền, `x3` sát thương lên Tường chắn / Vật triệu hồi.
* **Evo 1 (Đấm Bồi Hai Tay):** trong `0.4s` sau Đấm Thường, giữ hoặc nhấp tiếp → phóng thêm `4` luồng quyền phong nhỏ liên tiếp (tổng `+1.2` sát thương).

## 3. Giữ Bắn (`1.0s` / Full Evo `0.5s`) — Đấm Nghiêm Túc
* **Mở khóa:** `seriousPunchCD <= 0` (CD `12s`, Full Evo `8s`) **VÀ `excitement >= 55%`**.
* **Trong lúc tụ:** giảm `50%` sát thương nhận, miễn Đẩy/Kéo (vẫn tích Thú Vị). Đường cảnh báo đỏ rộng dọc màn hình (Full Evo: hút ngang nhẹ địch về tâm đường cảnh báo). Evo 2: bấm Trái/Phải → bật nhảy ngang `120px`, đường cảnh báo di chuyển theo.
* **Khi nhả:** `consumed = excitement`, `excitement = 0`. Nhận **Giáp Ảo** = `(consumed / 100) * 4.0` (55% → 2.2; 100% → 4.0). Base/Evo1/Evo2: Giáp Ảo giảm dần về 0 trong `12s`; Full Evo: tồn tại vĩnh viễn (chỉ mất khi bị bắn).
* **Đường quyền Hitscan:** `4.0` sát thương, xuyên mọi Tường (kể cả Tường Sniper), xóa mọi đạn/triệu hồi/vũng mặt đất trên đường quyền.
* **Full Evo (DEATH PUNCH):** địch trúng vùng tâm mà `hp <= 35% maxHp` → hiện `"DEATH (TỬ)"` và **HẠ GỤC NGAY** (xuyên Khiên & Bất tử tạm thời).

## Kết liễu — "Cú Đấm Rẽ Đôi Bầu Trời"
1. Màn hình chuyển tông trắng đen kiểu Manga, chữ Hán khổng lồ `【 死 — TỬ 】` đỏ thẫm toàn màn hình `0.4s`.
2. Găng Tay Đỏ đấm thẳng — nắm đấm chưa chạm nhưng luồng áp lực hình chữ V đã thổi bẹp xe đối phương.
3. Áp lực quyền phong xé toạc nền sân lẫn mây trời thành vệt trống khổng lồ, thổi bay mục tiêu khỏi màn hình.
