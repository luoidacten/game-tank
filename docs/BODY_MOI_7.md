# Đặc tả đợt 7 (người dùng gửi)

## A. Jack (`jack_6_lo`) — làm lại

- Các phát bắn của Jack **bắn thẳng** (chỉ có độ lệch nhỏ) — áp dụng cả ở The Hand.
- **The Hand** lên **6 viên**; mỗi lần nạp, Jack nạp **6 loại đạn đặc biệt** random từ **12 loại** dưới đây (mạnh / yếu / buff / debuff / phản chủ).
- **The Boy**: hiệu ứng mạnh hơn — tăng dame toàn diện và sức mạnh cho mặt 1–5, hình phạt mạnh hơn ở mặt 6.

| # | Tên đạn | Phân loại | Hiệu ứng khi khai hỏa |
|---|---|---|---|
| 1 | Đạn Hoàng Kim | 🌟 Siêu Mạnh | Bay cực nhanh, gây 2.4 Dame và phá vỡ ngay 1 lớp Khiên của địch. |
| 2 | Đạn Bộc Phá | 🔥 Mạnh | Nổ rộng khi trúng đích, gây 1.8 Dame và hất trượt địch sang ngang 60px. |
| 3 | Đạn Xuyên Phá | ⚡ Mạnh | Tốc độ bay x2.0, xuyên qua mọi tường/vật cản, gây 1.6 Dame. |
| 4 | Đạn Băng Hàn | ❄️ Debuff Địch | Gây 1.1 Dame và Làm Chậm 45% tốc chạy ngang của địch trong 2.0s. |
| 5 | Đạn Độc Rỉa | 🧪 Debuff Địch | Gây 0.9 Dame + rút độc 0.3 HP/s trong 3.0s và giảm 40% hồi máu của địch. |
| 6 | Đạn Điện Giật | 💫 Debuff Địch | Gây 1.0 Dame và Choáng 0.6s (kèm ngắt kỹ năng đang tụ lực). |
| 7 | Đạn Huyết Tệ | 💚 Buff Jack | Gây 1.2 Dame; trúng đích giúp Jack hồi ngay +0.5 HP. |
| 8 | Đạn Hưng Phấn | 🛡️ Buff Jack | Gây 1.0 Dame; ngay khi khai hỏa Jack nhận +0.4 Giáp Trắng & +35% tốc chạy ngang trong 2.0s. |
| 9 | Đạn Khói Mù | 💨 Yếu / Quấy rối | Chỉ gây 0.4 Dame nhưng làm Mù HUD của địch trong 1.2s. |
| 10 | Đạn Nhựa Đồ Chơi | 🤡 Yếu (Xịt) | Bay lờ đờ kèm tiếng kèn nhựa, chỉ gây 0.2 Dame. |
| 11 | Đạn Nổ Ngược Nòng | 💥 Phản Chủ #1 | Nổ ngay tại nòng (không bay đi), Jack tự mất 0.6 HP và khựng 0.25s. |
| 12 | Đạn Nguyền Phản Phệ | 💀 Phản Chủ #2 | Luồng khói xám chỉ gây 0.3 Dame, nhưng Jack bị Làm Chậm 35% & Lộ Điểm Yếu (+20% st nhận vào) trong 2.0s. |

## B. Lỗi shop riêng của body

Một vài nhân vật có shop riêng nhưng giá **tự gấp đôi cho mọi món** mỗi lần mua — sai. Chỉ món vừa mua mới tăng giá (gấp đôi) nếu món đó có nhiều Lv.

## C. 96. Idol — Siêu Sao Thần Tượng (`idol`) 🆕 (bản đầy đủ)

*"Ánh đèn sân khấu đã bật... Đêm nay, mọi ánh nhìn đều thuộc về ta!"*
Vai trò chính: Kiểm Soát / Cơ Động (tương tác với Joker & Skinwalker). Độ khó 5/5.
HP 4.5 · Dame 0.9 · Đạn: 100 Náo Nhiệt (Hype — tự hồi 6/s + hồi khi đánh trúng) · Tốc 3.9 · 26×26.
Vật triệu hồi/hiệu ứng: 3 Sân Khấu Toàn Sân, Sóng Âm, Lazer Tâm Điểm, Trái Tim Mê Hoặc, Hệ thống Fan & Cửa Hàng Yêu Thích.

### Nội tại 1 — Thanh Náo Nhiệt (0–100, khởi đầu 50)
- Tự tăng +6/s, +12 mỗi khi đòn đánh trúng tướng địch. Phong Cách 1/2/3 tiêu hao Náo Nhiệt.
- Khi Phong Cách đang CD: nhấp bắn phóng 1 **Đạn Sóng Âm** bay dọc sân (0.8 Dame, không tốn Náo Nhiệt, +8 Náo Nhiệt khi trúng).

### Nội tại 2 — Fan Hâm Mộ & Cửa Hàng Yêu Thích
- Tích Fan: giữ Náo Nhiệt ≥ 80 trong 4.0s → +1 Fan; mỗi kỹ năng Phong Cách trúng đích +1 Fan; thắng hiệp +5 Fan.
- Mất Fan: không đánh trúng địch 6.0s liên tục → −1 Fan mỗi 3s tiếp theo (đến khi trúng lại). Thua hiệp −4 Fan (min 0).
- Cuối hiệp: mỗi 1 Fan tặng +2 Điểm Yêu Thích (💗) để mua trong **Idol Shop**.
- ⚠️ Evo 1 / Evo 2 / Full Evo yêu cầu **mốc Fan tối thiểu** để mua; kể cả đã mua, nếu Fan tụt dưới mức yêu cầu thì hiệu ứng Evo đó **bị vô hiệu** (tắt sáng) cho đến khi đủ Fan lại.

### Điều khiển 1 nút
- **Giữ 1.0s → nhấp**: mở **Buổi Trình Diễn** (Sân Khấu Toàn Sân) 15.0s, CD 30.0s tính từ lúc kích hoạt. Trong lúc giữ, biểu tượng 3 Sân Khấu xoay vòng trên đầu xe (mỗi 0.33s đổi 1 màu), nhấp ở màu nào mở Sân Khấu đó.
- **Giữ 0.5s rồi nhả**: đổi Phong Cách theo vòng 1 (Vũ Đạo) → 2 (Tâm Điểm) → 3 (Quyến Rũ).
- **Nhấp**: tung kỹ năng của Phong Cách hiện tại (nếu đang CD thì bắn Đạn Sóng Âm).

### 3 Sân Khấu (15s | CD 30s) — đổi màu ánh đèn nền sân
1. 🔥 **Rock Rực Lửa (Đỏ Neon)**: Náo Nhiệt khi trúng x2 (+24/hit). Bản thân +20% Sát thương & đạn nhanh +25%. Địch Suy Yếu (+15% st nhận) & −20% hiệu quả Khiên/Giáp trắng.
2. 💎 **Pop Lấp Lánh (Xanh Hồng)**: tự hồi Náo Nhiệt x2 (+12/s). Bản thân +25% tốc chạy ngang & −20% CD cả 3 Phong Cách. Địch −20% tốc đạn bay & chậm nạp đạn 15%.
3. 💜 **Ballad Huyền Ảo (Tím Ngân Hà)**: +8 Náo Nhiệt/s & hoàn 30% Náo Nhiệt tiêu hao khi dùng kỹ năng. Bản thân 20% Giảm Sát Thương & mỗi kỹ năng Phong Cách hồi +0.25 HP. Địch chậm 20% tốc chạy ngang & thời gian chịu khống chế (Choáng/Mê Hoặc) +25%.

### 3 Phong Cách
1. **Vũ Đạo Xung Kích** (20 Náo Nhiệt, CD 5.0s): lướt dọc lên trước; chạm địch (hoặc vật cản/hết tầm trên làn địch) nổ **Vòng Sóng Âm** 1.2 Dame, đẩy trượt địch sang ngang, Làm Chậm 35% (1.5s) + Choáng 0.5s, rồi bật lướt ngược về đúng làn mình.
   - Rock: vùng lửa âm nhạc đốt thêm 0.6 Dame & phá ngay 1 lớp Khiên địch.
   - Pop: khi lướt về nhận 1 Khiên Ánh Sáng (2.5s) & xóa đạn thường địch gần điểm nổ.
   - Ballad: bán kính nổ +40%, Choáng 0.5s → 1.0s.
2. **Tia Lazer Tâm Điểm** (30 Náo Nhiệt, CD 5.0s — dame chính): Spotlight cảnh báo dọc sân 0.7s (người bắn đứng yên theo luật laser cảnh báo), rồi Lazer Âm Nhạc xuyên mọi vật cản 2.4 Dame.
   - Rock: 3.0 Dame + 2 tia phụ nhỏ hai bên mép.
   - Pop: cảnh báo còn 0.45s; trúng đích giảm ngay 2.5s CD kỹ năng này.
   - Ballad: trúng đích hồi +0.6 HP & để lại vệt sáng làm chậm 40% trên làn địch 2s.
3. **Trái Tim Mê Hoặc** (35 Náo Nhiệt, CD 8.0s): 1 Trái Tim Hồng bay dọc sân (0.8 Dame). Trúng tướng địch → **MÊ HOẶC 1.75s**: địch không thể bắn và mất điều khiển — xe địch tự chạy ngang để luôn **thẳng hàng trục X với Idol**.
   - Rock: địch đang Mê Hoặc chịu +30% st từ đòn kế tiếp của Idol.
   - Pop: Trái Tim nhanh +40%, to +30%, trúng đích +2 Fan.
   - Ballad: Mê Hoặc 1.75s → 2.4s.

### Cửa Hàng Yêu Thích (💗, cuối mỗi hiệp)
1. Lightstick Cổ Vũ (8💗): Đạn Sóng Âm +0.25 Dame & nhanh +25%.
2. Bảo Vệ Thần Tượng (12💗): mỗi khi mở Buổi Trình Diễn nhận 1 Khiên & xóa mọi hiệu ứng xấu.
3. Hợp Đồng Quảng Cáo (14💗): cuối hiệp mỗi 3 Fan +$5 (tối đa +$25/hiệp).
4. Encore! (18💗): Buổi Trình Diễn 15s → 20s.

### Tiến hoá
| Evo | Giá & điều kiện | Hiệu ứng |
|---|---|---|
| Chuyến Lưu Diễn Toàn Cầu (`evo_idol_1`) | $95, cần ≥ 6 Fan (tụt dưới 6 → tạm khóa) | CD Buổi Trình Diễn 30s → 22s; giữ mở Sân Khấu 1.0s → 0.6s. Giữ đổi Phong Cách 0.5s → 0.25s và mỗi lần đổi giảm 1.0s CD của Phong Cách vừa chuyển tới. Thời gian trước khi mất Fan 6s → 10s. |
| Hiện Tượng Mạng (`evo_idol_2`) | $125, cần ≥ 12 Fan (tụt dưới 12 → tạm khóa) | Cứ mỗi 2 Fan +2% Sát thương & +1.5% tốc chạy ngang (tối đa ở 20 Fan: +20% / +15%). Ba Phong Cách tách thành 3 CD riêng biệt (combo Tim → Lazer → Vũ Đạo). |
| **FULL EVO — Huyền Thoại Sân Khấu** | duy trì ≥ 18 Fan (tụt dưới → tạm ngắt) | Buổi Trình Diễn: 100% Sân Khấu đã chọn + 50% của 2 Sân Khấu còn lại. Mỗi 5.0s khi Sân Khấu mở: ném về làn Idol 1 Hộp Quà Fan (nhặt +0.4 HP & +20 Náo Nhiệt) và 1 Lightstick Phát Nổ xuống vị trí địch (vòng cảnh báo 0.8s, nổ 1.0 Dame + chậm 30%). |

**Kết liễu:** BỨC MÀN NHUNG KHÉP LẠI (GRAND FINALE) — toàn bộ Spotlight hội tụ vào xe địch, pháo giấy & hàng ngàn Lightstick nổ tung trong tiếng reo hò, rồi rèm nhung đỏ khép lại với chữ `SOLD OUT!`.
**Mã nguồn dự kiến:** `js/characters/idol/logic.js`, `render.js`, `fan_shop.js`.
