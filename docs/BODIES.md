# 📘 Cẩm nang Body — CYBER TANK 1v1

> Tạo tự động từ dữ liệu trong game (`js/data/*.js`) và đo chỉ số thực bằng cách chạy `setupForNewRound()`.
> Khi sửa chỉ số trong code, chạy lại công cụ tạo tài liệu cho khớp.

## Luật chung

- Hiệp 1 chọn **1 Body**. Các hiệp sau mua Module / Tiến hoá (Evo) trong shop bằng tiền.
- Tiền mỗi hiệp: thắng +50$, thua +15$, hoà +10$. Thua liên tiếp (≥2) +60$; nếu hiệp sau là **cơ hội cuối** (đối thủ chỉ cần 1 hiệp nữa) +120$; thắng liên tiếp (≥2) +30$ mỗi trận thắng.
- Gốc: xe 30×30, tốc độ 3.5, tốc đạn 4.8, nạp đạn 1.5s. Sau 60s **Đột Tử**: vùng an toàn thu hẹp.
- Xe to được cộng máu: rộng 31–33 → +1, 34–35 → +2, 36 → +3, 37 → +4, ≥38 → +5 HP.
- Mỗi Body có 2 Evo. Có **cả 2 = FULL EVO**.
- **Thùng tiếp tế:** Thùng Nổ (!) phản 1.5 sát thương vào người phá - không thể né, khiên chặn được. Thùng Đạn (✸) bắn 16 viên ra 360°, trúng cả 2 xe (body Tiến Hóa phá thì chỉ trúng đối thủ). Thùng Giả chỉ xuất hiện khi trận có body Tiến Hóa; Thùng Bánh Răng chỉ khi có Kỹ Sư / Kẻ Sáng Tạo / Thiên Tài / Nhà Phát Minh.
- **Vùng hiệu ứng mặt đất** là hình chữ nhật nằm ngang (rộng 2.6r × cao 1.5r), luôn nằm trọn trong sân (vùng tạo sát mép được đẩy vào trong, không tràn ra sau lưng xe). Pháo kích (map Pháo Kích), sét Full Evo Lôi Thần, bom Evo 2 Pháo Cao Xạ và Mưa Tên toàn sân rơi đúng làn xe mục tiêu.
- **Chế độ chơi:** Chơi → Chế Độ Cổ Điển → Online / Offline. Offline gồm 1v1 cùng máy, Phòng Tập (bot 5 cấp), **Giải Đấu PVE** 5 vòng (Vòng Loại → Chung Kết) với bot thông minh mạnh dần: dự đoán điểm rơi đạn & pháo để né, bắn thùng có lợi và tránh thùng nổ, bắn chặn khe né để ép góc, tự mua đồ trong shop.
- Module chân: mỗi lần đã mua làm giá tăng thêm 50% giá gốc. **Động Cơ tối đa 3 lần** (đủ thì không xuất hiện trong shop). **Bánh Xích** x1.25 cho 3 lần đầu, sau đó giảm dần (x1.15, x1.09, x1.05…). **Lợi Tức** cộng dồn và nhân giá trị: 1/2/3/4/5 tầng = 30/72/126/192/270$ mỗi hiệp (Xe Tiền x2).

- **Đạn tự tìm (homing)** của mọi body: bẻ lái kém linh hoạt; qua giữa sân hơn một chút chỉ còn bẻ rất yếu; khi tới gần mục tiêu (~110px) thì không bẻ nữa → dễ né bằng cách lách ngang.

## Bảng tổng hợp

| # | Body | ID | HP | Sát thương | Đạn | Tốc độ | Kích thước | Triệu hồi | Tỉ lệ thắng mô phỏng |
|---|------|----|---:|---:|---:|---:|:---:|:---:|---:|
| 1 | **Cơ Bản** | `basic` | 9 | 1.2 | 8 | 3.85 | 30×30 |  | 60% |
| 2 | **Xe Tiền** | `money_tank` | 9 | 1.5 | 2 | 3.5 | 28×28 |  | 24% |
| 3 | **Xe TANK** | `tank` | 9.5 | 2.5 | — (năng lượng riêng) | 3.32 | 38×38 |  | 84% |
| 4 | **Pháo Băng** | `ice` | 5 | 1 | 5 | 3.5 | 30×30 |  | 43% |
| 5 | **Đạn Lớn** | `big_bullet` | 5 | 2 | 2 | 3.5 | 30×30 |  | 53% |
| 6 | **Shotgun** | `shotgun` | 5.5 | 1 | 2 | 3.5 | 26×26 |  | 36% |
| 7 | **Cuộn Quá Tải** | `overload` | 4.5 | 0.7 | 6 | 3.5 | 30×30 |  | 83% |
| 8 | **Tiểu Liên** | `smg` | 5 | 0.9 | 18 | 3.5 | 24×24 |  | 29% |
| 9 | **Lazer Xuyên Phá** | `lazer_charge` | 4 | 0.5 | 12 | 3.5 | 30×30 |  | 66% |
| 10 | **Lazer Pháo** | `lazer_auto` | 5 | 1 | — (năng lượng riêng) | 3.5 | 30×30 |  | 32% |
| 11 | **Pháo Tên Lửa** | `rocket` | 5 | 1.15 | 3 | 3.5 | 30×30 |  | 80% |
| 12 | **Cổng Không Gian** | `portal` | 5 | 1 | 7 | 5 | 30×30 |  | 40% |
| 13 | **Phong Trảm** | `wind_slash` | 4 | 0.9 | 1 | 3.5 | 30×30 | ✅ | 64% |
| 14 | **Cuồng Phong** | `storm` | 3.5 | 2 | — (năng lượng riêng) | 5 | 30×30 | ✅ | 38% |
| 15 | **Axit Hóa** | `acid` | 4 | 0.5 | 1 | 3.5 | 30×30 | ✅ | 46% |
| 16 | **Kỹ Sư** | `engineer` | 5 | 0.5 | 2 | 3.5 | 34×34 | ✅ | 59% |
| 17 | **Ghost** | `ghost` | 2.5 | 1.75 | 4 | 5.5 | 24×24 | ✅ | 38% |
| 18 | **Pháo Cao Xạ** | `aaa` | 7.5 | 1.15 | 1 | 2.1 | 37×37 | ✅ | 82% |
| 19 | **Kiếm Tôn** | `blade_god` | 5 | 1.05 | 4 | 3.5 | 30×30 |  | 70% |
| 20 | **Kiếm Trận** | `van_kiem` | 4.5 | 0.6 | ∞ | 5.5 | 26×26 |  | 32% |
| 21 | **Súng Nước** | `water_gun` | 6 | 1.5 | — (năng lượng riêng) | 3.5 | 34×34 |  | 63% |
| 22 | **Lò Nung** | `furnace` | 9 | 0.25 | — (năng lượng riêng) | 3.5 | 36×36 |  | 55% |
| 23 | **Âm Dương Sư** | `am_duong_su` | 5 | 0.5 | 4 | 3.5 | 30×30 | ✅ | 50% |
| 24 | **6 Nòng** | `six_barrel` | 9 | 0.4 | ∞ | 3.5 | 36×36 |  | 38% |
| 25 | **Kẻ Mạnh Nhất** | `the_strongest` | 1 | 2 | — (năng lượng riêng) | 3.5 | 30×30 |  | 32% |
| 26 | **Sniper** | `sniper` | 3 | 2 | 5 | 2.62 | 24×24 | ✅ | 40% |
| 27 | **Bow** | `cung` | 3 | 0.5 | 3 | 4.38 | 24×24 | ✅ | 35% |
| 28 | **Mirror** | `mirror` | 5.5 | 1.3 | 6 | 3.5 | 30×30 |  | 32% |
| 29 | **Vua Đầu Bếp** | `sukuna` | 7.5 | 2 | ∞ | 3.5 | 36×36 |  | 83% |
| 30 | **Paradox** | `paradox` | 6 | 1.2 | 5 | 3.5 | 30×30 |  | 33% |
| 31 | **Nhà Ảo Thuật** | `magician` | 3 | 1 | 7 | 4.73 | 26×26 | ✅ | 75% |
| 32 | **Nhà Phát Minh** | `inventor` | 5.5 | 0.7 | 4 | 2.24 | 30×30 | ✅ | 24% |
| 33 | **Shadow Hunter** | `shadow_hunter` | 2 | 1 | 6 | 5.92 | 24×24 | ✅ | 42% |
| 34 | **Shortgun** | `shortgunATK` | 5.5 | 1.3 | 2 | 5.47 | 34×34 | ✅ | 87% |
| 35 | **Sấm Chớp** | `thunder` | 2 | 1 | — (năng lượng riêng) | 5.92 | 26×26 | ✅ | 46% |
| 36 | **Nam Châm** | `magnet` | 6.5 | 0.5 | 6 | 3.5 | 34×34 | ✅ | 68% |
| 37 | **Tiến Hóa** | `evolution` | 5.5 | 1 | 1 | 3.5 | 30×30 |  | 33% |
| 38 | **Trối Chết (DeathLock)** | `death_lock` | 8 | 0.8 | 3 | 2.8 | 34×34 | ✅ | 35% |
| 39 | **Kẻ Sáng Tạo** | `creator` | 3 | 0.25 | 1 | 3.5 | 24×24 | ✅ | 42% |
| 40 | **Chiêu Hồn Sư** | `necromancer` | 1 (+5 Linh Hồn) | 1 | 1 | 2.8 | 32×32 | ✅ | 68% |
| 41 | **Thiên Tài** | `genius` | 2.5 | 1 | 1 | 4.55 | 24×24 | ✅ | 37% |
| 42 | **Kiếm Khách** 🆕 | `kiem_khach` | 3 | 1.2 | 3 | 3.5 | 30×30 | ✅ | 35% |
| 43 | **Bình Phun** 🆕 | `sprayer` | 7 | 0 | — (năng lượng riêng) | 2.89 | 34×34 | ✅ | 56% |
| 44 | **Tùy Biến** 🆕 | `customize` | 6 | 1.5 | 4 | 3.5 | 30×30 | ✅ | 33% |
| 45 | **Kiếm Sư** 🆕 | `kiem_su` | 4 | 1 | 5 | 3.85 | 28×28 | ✅ | 46% |
| 46 | **Cao Bồi** | `revolver` | 3.5 | 1.25 | 6 | 4.2 | 26×26 |  | — |
| 47 | **DJ** | `dj` | 4 | 0.75 | 2 | 4.02 | 28×28 |  | — |
| 48 | **Móc Thép** | `steel_hook` | 6 | 2 | 1 | 2.98 | 36×36 |  | — |
| 49 | **Hoa Ảnh** | `flower_shadow` | 3 | 0.5 | — (năng lượng riêng) | 4.73 | 24×24 |  | — |
| 50 | **Kiếm Vũ** | `kiem_vu` | 1.5 | 1.5 | ∞ | 3.5 | 28×28 |  | — |
| 51 | **T-Zero** | `t_zero` | 8 | 1 | — (năng lượng riêng) | 3.15 | 34×34 |  | — |
| 52 | **Raven - Oca** | `raven_oca` | 4 | 0.5 | 10 | 3.8 | 26×26 |  | — |
| 53 | **Tia Lazer** | `lazer_beam` | 3 | 0.2 | — (năng lượng riêng) | 3.8 | 28×28 |  | — |
| 54 | **Y Sư** | `healer` | 3.5 | 0.75 | 4 | 3.5 | 30×30 |  | — |
| 55 | **Chrono & Neo** | `chrononeo` | 4.5 | 1 | 3 | 3.3 | 28×28 |  | — |
| 56 | **Gemini** | `gemini` | 3.5 | 0.75 | 4 | 3.6 | 26×26 |  | — |

> *Tỉ lệ thắng mô phỏng*: trung bình của 2 mức (chỉ có body / có Full Evo + 2 module), mỗi body đấu vòng tròn với mọi body khác, hai bên cùng một AI tự động. AI không biết chơi kinh tế hay combo phức tạp nên con số chỉ mang tính tham khảo cho độ mạnh tương đối.

## Nhật ký cân bằng

| Body | Thay đổi |
|---|---|
| Xe TANK | Chạy nhanh hơn; húc thùng tiếp tế không mất máu; khi lao chỉ nhận 35% sát thương (Evo 1: 20%); HUD hồi nội tại |
| Shortgun | Mỗi viên 1x → 0.35x (bắn sát mặt nên viên nào cũng trúng), Double Tap 8 viên x2 → 7 viên x1.5, hồi chiêu 0.4s → 0.9s, HP 5 → 3.5, Dame 2 → 1.3. Sửa lỗi sập game khi hạ gục (Evo 2) |
| Vua Đầu Bếp | Nhát chém 1 → 0.5 dmg, hồi 0.3s → 0.45s, HP 7 → 4.5, Dame 3 → 2 |
| Pháo Cao Xạ | Sửa lỗi nổ lặp; Evo: nổ lặp 1 lần (Full 2 lần) có cảnh báo, 1/2 dame; HUD đếm ngược tự bắn |
| Cuộn Quá Tải | Evo 1: thêm thanh năng lượng phụ (2 phát cường hóa liên tiếp); Evo 2: vòng EMP câm lặng địch + đơ vật triệu hồi 2s (chủ trúng EMP thì vật triệu hồi cũng đơ); Full Evo: +4 thanh phụ nạp cùng lúc, nổ & EMP rộng hơn; giảm dame nổ |
| Pháo Tên Lửa | Dame 2 → 1.15 |
| Nhà Ảo Thuật | Dame 1.5 → 1, HP 3.5 → 3. Sửa lỗi phân bóng làm mờ cả bản đồ |
| Kiếm Tôn | Quang Kiếm lơ lửng 2s rồi tự bắn (+1 dame); Ám Kiếm thành kiếm bay; Evo 1: Quang Kiếm tự triển khai + Loạn Ảnh chém đạn; Evo 2: hố đen + Ám Kiếm Tuyệt Diệt; Full Evo: kiếm tự xuất hiện & nội tại mạnh hơn; Phá Thiên giảm còn 3.5x |
| Chiêu Hồn Sư | Linh Hồn khởi đầu 6 → 5. Lính Xạ Thủ/Cảm Tử biết ngắm; Lính Cao Cấp lao húc kiểu TANK rồi về chỗ |
| Nam Châm | Khác dấu: lao húc như TANK + hút mục tiêu; lực từ mạnh 2s đầu rồi yếu hẳn; vùng từ nhỏ hơn |
| Phong Trảm | Dame 1 → 0.9 |
| Lazer Xuyên Phá | Tự nạp năng lượng (giữ 0.4s bật/tắt); tắt tự nạp thì bắn đạn thường 0.01; Full Evo: phát lazer one-shot mọi lượng máu, xuyên khiên |
| Xe Tiền | Mỗi cấp đạn bay nhanh hơn; Evo 2 Sức Mạnh Đồng Tiền (-25% giá, mốc thưởng mỗi 100$); Full Evo -50% giá |
| Mirror | Sửa lỗi không bắn được, hồi bắn 1.5s → 0.35s, HP 4 → 5.5, Dame 1 → 1.3. Ngay sau khi dịch chuyển: 1.5s bắn ngay, nhịp bắn & tốc độ đạn x2 |
| Nhà Phát Minh | HP 2 → 5.5, Dame 0.5 → 0.7, sát thương Drone 50% → 100% chỉ số chủ. Drone ngắm chính xác (có đón đầu) |
| Thiên Tài | HP 1 → 2.5, mỗi hiệp có sẵn 6 Bánh Răng. Tự Hủy: ném Robot lao tới, chạm tường mới nổ |
| Kẻ Sáng Tạo | Sửa lỗi khiên không chặn sát thương (giờ chặn đạn, đạn xuyên và tia) |
| Tiến Hóa | HP 1 → 5.5 |
| Tùy Biến | Bỏ kiểu bắn Hold (tia); thêm Loạt Đạn, Đạn Tách, Chí Mạng, Hút Máu, Song Nòng và nhóm CHỈ SỐ (Máu/Dame/Đạn/Tốc/Nạp/Khiên) để luôn tiêu được điểm; điểm CP mỗi hiệp nhiều hơn; shop chia cột, hiện cấp & trạng thái rõ, nút TỰ LẮP; sửa Gói VIP (Nảy Tường thật sự nảy, Tự Ngắm/Đạn Hút mạnh theo cấp) + nâng 1 cấp mọi tùy chọn cũ |
| Kiếm Trận | HP 3.5 → 4.5, Dame 0.25 → 0.6 |
| Shotgun | 5 viên bay nhanh hơn, dame 1; Evo 1: 6 viên + đợt hai 3 viên |
| Tiểu Liên | Nạp theo băng (18/22/30 viên) có vòng nạp; Full Evo: 6 viên đầu mỗi băng xuyên |
| Trối Chết (DeathLock) | HP 5 → 6, Dame 0.5 → 0.8 |
| Paradox | HP 5 → 6, Dame 1 → 1.2. Tua ngược chỉ cần giữ 0.2s; thêm mốc Neo Thời Không (10s, CD 20s): lần tua tới về neo (vị trí, máu, đạn) |
| Lazer Pháo | Không cần đạn: giữ bắn xả lazer xuyên ngày càng nhanh, nóng ≥60% thì +35% dame, quá nhiệt khóa 1.5s |
| Kiếm Khách | HP 2 → 3, Dame 1 → 1.2 (so với bản thiết kế). Làm 3 bài cùng lúc, +1 ô mỗi hiệp (Evo 2 +1, Full +2); đầu trận tự nhận 3 bài ngẫu nhiên |
| Bow | Giữ nút để kéo cung, nhả để bắn (trước: nhấp để tự nạp); nạp nhanh x1.6, đầy lực không tự bắn |
| Cuồng Phong | Giữ nút để tụ lực, nhả để xuất chiêu (trước: tự nạp 14s); đầy lực sau 3.5s |
| 6 Nòng | Phải giữ 0.5s khởi động nòng; đã quay thì nhấp vẫn bắn (nhả >1s nòng dừng) |
| Bình Phun | Vòi phun đốt xe tiền nhanh hơn nhiều; axit gây 10x lên vật thể |
| Sấm Chớp | Thiên Kiếp: hóa sét lao húc + hút địch, hạ màn bay lên trời điều khiển vòng (khóa 0.5s rồi đáp); Full Evo: Lôi Vực + sét trời. Mất hết thương → hồi sau 5s. Lôi Minh chỉ tích từ thu thương / Lôi Trảm / thương trúng địch. Lôi Trảm nhanh & rộng hơn, buff tốc+dame, 1-3 thương rơi từ trời (cảnh báo 3s); Evo 2 chém phụ. Thương cầm tay tối đa 3 (cả Full Evo). Giảm dame |
| Hoa Ảnh | Giới hạn hoa trên sân 12/24/vô hạn, hoa tự thu sau 3s (Full 2s), xe địch đè lên phá hoa, hoa bay trúng vật cản thì vỡ; kho hoa 100/200/300%; hồi hoa sau 0.5s; cường hóa cần 75%/50% và reset; Khai cường hóa không bị phá, xuyên cả đi lẫn về; giảm dame |
| Kiếm Vũ | Tâm Định chỉ hồi sau 1.25s không dùng chiêu; chỉ phóng kiếm khi kiếm ở nửa sân mình |
| Móc Thép | Giữ càng lâu móc càng nhanh (1.25s → 0.5s hết quãng đường); giữ 0.75s khi móc đã cắm để cắt xích; xích phụ máu thấp; Evo đắt hơn |
| DJ | Vùng bấm rộng hơn nhiều, 4 bản nhạc cân lại (Trung Bình có nốt đôi); bấm vùng vàng vẫn bắn nhưng không +combo; để lọt nốt = mất đạn + mất combo |
| T-Zero | Tên lửa đuổi chậm hơn, bắn hạ được; thêm tên lửa không kích (cảnh báo 2s, bay vào từ trái/phải); NL tụt tăng dần khi bay; chờ 2.5s mới bay lại; khóa vòng 0.5s trước khi đáp |
| Sniper | Tường chặn mọi đạn địch kể cả hitscan & đạn xuyên; tường tự mất máu sau 5s (nhanh hơn), Full Evo tường dài, trâu, không tự mất máu, bất tử 2s đầu; đạn nhanh x3; đường ngắm chuẩn; vòng nạp đạn |
| Đạn Lớn | Đạn to hơn nhiều (20/32/44px); Full Evo: nảy 1 lần thì xuyên vật cản, tự biến mất giữa map rồi nổ 20 viên 360° |
| Kỹ Sư | Ụ súng tự mất máu chậm sau 10s |
| Cơ Bản | HP 9, dame 1.2, tốc +10%, nạp nhanh hơn 20%, đạn nhanh hơn |
| Súng Nước | Tia nước có cảnh báo 0.5s |
| Axit Hóa | Phát cường hóa tạo vùng ăn mòn tím (trừ máu & máu tối đa, chậm); mọi đòn axit gây 10x + 50% máu tối đa lên vật cản/xe tiền/triệu hồi |
| Raven - Oca | MỚI: Collab Raven-Oca — giữ 0.4s đổi Tiểu Liên (loạt 3 viên, lướt né) ↔ Sniper (4 dame, bom khói né đạn), chim Oca đồng hành (tàng hình cắn làm chậm / radar khóa mục tiêu, đạn Sniper xuyên vật thể) |
| Tia Lazer | MỚI: Tia Lazer — giữ bắn: tích 0.5s + cảnh báo 0.5s rồi chiếu tia liên tục (0.2/nhịp, chậm khi chiếu, tụt năng lượng, chớp tắt); Evo 2 tia phình to + dame tăng dần + đốt; Full Evo không chậm + tia xung kích mỗi 2s • Sửa lỗi: tia gây sát thương lên vật triệu hồi của địch |
| Y Sư | MỚI: Y Sư — tự hồi 0.5 HP sau 3s không mất máu, đạn hấp huyết (CD 20s), thanh Năng Lượng Sinh Mệnh → đạn cường hóa 50% Max HP + dame gốc; Evo 1 giáp trắng; Evo 2 mỗi lần hồi bắn tia tự ngắm; Full Evo cướp máu hồi của địch • NERF: HP 5 → 3.5 |
| Chrono & Neo | MỚI: Collab Chrono & Neo — Tham Farm tăng băng đạn vĩnh viễn (4→10 / 10→20), giữ 0.4s đổi thế Chrono (đạn đồng xuyên, sóng đẩy) ↔ Neo (2 viên, lướt tăng tốc), đồng hồ cát Thời Khắc → Liên Xạ tự tìm / Mưa Đạn Hình Nón + Ảnh Chiếu; Full Evo: AI phụ cầm thế ngược lại + bão Liên Hoa • NERF: băng đạn 3→7 / 8→14, CD đổi thế 6s (Full 4s), Liên Xạ +2, nón 6-8 viên yếu hơn, Liên Hoa 2.5s, Nở Rộ còn 3 cột có khe né |
| Gemini | MỚI: Gemini — 2 xe song sinh (bạn + AI tự hành), gục thì có vòng cứu 2s (nhân đôi mỗi lần), chỉ thua khi cả 2 cùng gục; giữ 0.4s Chuyển Giao Ý Thức đổi quyền điều khiển; Evo 2 mạnh dần theo hiệp; Full Evo tự khởi động lại + đạn tự ngắm sau chuyển giao |

## Module chân (FEET)

| Module | ID | Giá gốc | Lần 2 / 3 / 4 | Hiệu ứng |
|---|---|---:|---:|---|
| Động Cơ | `speed` | $30 | 45$ / 60$ / 75$ | Tăng tốc độ di chuyển. Tối đa 3 lần. |
| Giáp Thép | `armor` | $15 | 23$ / 30$ / 38$ | +1 Máu tối đa. |
| Bánh Xích | `damage` | $20 | 30$ / 40$ / 50$ | x1.25 Sát thương (3 lần đầu), sau đó giảm dần. |
| Lợi Tức | `interest` | $10 | 15$ / 20$ / 25$ | Sau mỗi round nhận tiền; càng nhiều tầng mỗi tầng càng sinh lời (30$/72$/126$/192$..., Xe Tiền x2). |

## Chi tiết từng Body

### 1. Cơ Bản (`basic`)

HP:9 | Dame:1.2 | Đạn:8 | Tốc +10%. Chuẩn mực vững vàng: nạp đạn nhanh hơn 20%, đạn bay nhanh hơn.

- **Chỉ số thực đầu hiệp:** HP 9 · Sát thương 1.2 · Đạn 8 · Tốc độ 3.85 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Công Thủ Toàn Diện (`evo_basic_1`) | $15 | HP +2, Dame ×1.25 |
  | Thập Tử Nhất Sinh (`evo_basic_2`) | $30 | Về 0 HP -> Hồi 1 HP + Bất tử 3s |

- **Mã nguồn:** `js/characters/basic/logic.js`

### 2. Xe Tiền (`money_tank`)

HP:9 | Dame:1.5 | Đạn:2. Farm tiền, mua CẤP ĐỘ trong shop (mỗi cấp đạn bay nhanh hơn; Cấp 3: Khiên +2 HP, Cấp 4: Xuyên +0.5 dame, Cấp 5: Đạn nổ, Cấp 6: Đế Chế Tiền Tệ). Lợi Tức & tiền nhặt x2.

- **Chỉ số thực đầu hiệp:** HP 9 · Sát thương 1.5 · Đạn 2 · Tốc độ 3.5 · Kích thước 28×28
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Tiền Tấn Công (`evo_money_atk`) | $150 | Mỗi 8s phóng 2 xe tiền từ làn bạn lao thẳng về phía địch (tông trúng 1.5 dame, chạm tường nổ 1.5 dame, phá xe tiền/thùng trên đường). Phá xe tiền bằng đạn -> bắn chùm đạn vào địch. |
  | Sức Mạnh Đồng Tiền (`evo_money_2`) | $120 | Mọi nâng cấp giảm 25%. Mỗi 100$ tiêu (tối đa 2500$, tính từ lúc mua) nhận 1 mốc thưởng vĩnh viễn: HP, Dame, Đạn, Tốc, Khiên. FULL EVO: mọi mặt hàng giảm 50%, thêm xe tiền trên sân, 3 xe tấn công mỗi 5s (mạnh hơn). |

- **Mã nguồn:** `js/characters/money_tank/logic.js`

### 3. Xe TANK (`tank`)

HP:4.5 (+5 máu xe lớn) | Dame:2.5 | Tốc: Khá. Nhấn Bắn: Lao húc (1.1x dame, hồi chiêu 2s; tông hòm tiếp tế không mất máu; khi lao chỉ nhận 35% sát thương). Nội tại: tự hồi 1 khiên mỗi 6s (vòng quanh xe báo tiến độ).

- **Chỉ số thực đầu hiệp:** HP 9.5 · Sát thương 2.5 · Đạn — (năng lượng riêng) · Tốc độ 3.32 · Kích thước 38×38
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Không Thể Cản Phá (`evo_tank_1`) | $100 | Lao húc x1.5 dame, không bị phản chấn khi tông tường/vật thể, khi lao chỉ nhận 20% sát thương |
  | Tàn Phá!!! (`evo_tank_2`) | $45 | Húc nổ lan + băng (khi còn khiên) + Hồi khiên nội tại nhanh hơn (6s -> 4s, Full Evo 2s, +15 HP) |

- **Mã nguồn:** `js/characters/tank/logic.js`, `js/characters/tank/render.js`

### 4. Pháo Băng (`ice`)

HP:5 | Dame:1 | Đạn:5 (Làm chậm)

- **Chỉ số thực đầu hiệp:** HP 5 · Sát thương 1 · Đạn 5 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Bão Tuyết (`evo_ice_1`) | $100 | Mỗi 3 lần kích hoạt -> Tạo vùng Băng Cực Đại |
  | Hàn Băng (`evo_ice_2`) | $60 | x1.5 Dame lên kẻ bị chậm, Vùng băng gây dame |

- **Mã nguồn:** `js/characters/ice/logic.js`

### 5. Đạn Lớn (`big_bullet`)

HP:5 | Dame:2 | Đạn:2. Quả cầu đạn khổng lồ (gấp đôi cỡ cũ, Evo 1 & Full Evo càng to hơn). Full Evo: nảy 1 lần hóa Xuyên Thấu, tan ở giữa sân & nổ 360° mảnh đạn.

- **Chỉ số thực đầu hiệp:** HP 5 · Sát thương 2 · Đạn 2 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | To Hơn Nữa (`evo_big_1`) | $20 | Đạn siêu to khổng lồ (gấp đôi: 32px). Full Evo: sau lần nảy đầu đạn hóa Xuyên Thấu (xuyên vật cản, vẫn trúng địch), không nảy nữa mà tan ở giữa sân |
  | Bóng Cao Su (`evo_big_2`) | $100 | Đạn nảy lại khi chạm tường. Full Evo: đạn kết thúc/bị phá sẽ nổ thành vòng mảnh đạn 360° (chỉ hại địch) |

- **Mã nguồn:** `js/characters/big_bullet/logic.js`

### 6. Shotgun (`shotgun`)

HP:5.5 | Dame:1 | Đạn:2. Mỗi phát tỏa 5 viên bay nhanh.

- **Chỉ số thực đầu hiệp:** HP 5.5 · Sát thương 1 · Đạn 2 · Tốc độ 3.5 · Kích thước 26×26
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Mưa Đạn (`evo_shot_1`) | $45 | Tỏa 6 viên; ngay sau mỗi phát bắn thêm đợt 2 gồm 3 viên tụm giữa |
  | Đạn Dự Phòng (`evo_shot_2`) | $30 | Băng đạn 4 viên |

- **Mã nguồn:** `js/characters/shotgun/logic.js`

### 7. Cuộn Quá Tải (`overload`)

HP:4.5 | Dame:0.7-7 (Tự tụ) | Đạn:6. Thanh năng lượng tự tụ 2.4s; đầy -> phát kế tiếp là Đạn Sạc nổ xung kích điện (vụ nổ 0.5 dame, Full Evo 1.25).

- **Chỉ số thực đầu hiệp:** HP 4.5 · Sát thương 0.7 · Đạn 6 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Thanh Năng Lượng Phụ (`evo_over_1`) | $50 | +1 thanh phụ, nạp sau khi thanh chính đầy. Đầy -> trữ 2 Đạn Sạc, bắn liền 2 phát. |
  | Vụ Nổ EMP (`evo_over_2`) | $60 | Đạn Sạc nổ phát vòng EMP rộng hơn vụ nổ: không gây dame nhưng Câm Lặng địch 2s & đóng băng trụ/drone/robot/bẫy/xe... của địch 2s (đứng im, không bắn, không di chuyển). Trúng EMP vào CHỦ -> TOÀN BỘ vật triệu hồi của chủ cũng bị đóng băng. FULL EVO (Lõi Tứ Quá Tải): +4 thanh phụ (5 thanh nạp đồng thời), vụ nổ & vòng EMP to hơn hẳn. |

- **Mã nguồn:** `js/characters/overload/logic.js`, `js/characters/overload/render.js`

### 8. Tiểu Liên (`smg`)

HP:5 | Dame:0.9 | Băng 18 viên (Lắc). Giữ để sấy; hết băng -> nạp nguyên băng 1.8s (vòng nạp quanh xe). Nghỉ bắn 2.5s tự thay băng.

- **Chỉ số thực đầu hiệp:** HP 5 · Sát thương 0.9 · Đạn 18 · Tốc độ 3.5 · Kích thước 24×24
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Hỏa Lực +++ (`evo_smg_1`) | $80 | Sấy càng lâu: Dame tăng (tối đa +0.5), Tốc bắn tăng gấp đôi, Đạn bay nhanh. Băng 22 viên, dame gốc ×0.9. |
  | Băng Đạn X (`evo_smg_2`) | $120 | Băng 30 viên, nạp băng 1.2s. FULL EVO: nạp 0.8s, 6 viên đầu mỗi băng xuyên thấu. |

- **Mã nguồn:** `js/characters/smg/logic.js`

### 9. Lazer Xuyên Phá (`lazer_charge`)

HP:4 | Đạn:12. Năng lượng TỰ NẠP đầy sau 5s -> nhấp phóng Tia Xuyên Phá 20 dame. Giữ 0.4s: bật/tắt Tự Nạp (tắt: nhấp bắn đạn thường 0.01 dame, năng lượng ngừng nạp). Full Evo: tia hạ gục ngay bất kể máu, xuyên khiên.

- **Chỉ số thực đầu hiệp:** HP 4 · Sát thương 0.5 · Đạn 12 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Pháo Diệt Tinh (`evo_lazer_c_1`) | $150 | Tia Xuyên Phá to gấp 3, lưu ảnh 2s |
  | Năng Lượng Xanh (`evo_lazer_c_2`) | $50 | Tự Nạp nhanh hơn (4s), đạn thường nạp 0.4s/viên. FULL EVO: Tự Nạp 3.5s, Tia Xuyên Phá HẠ GỤC NGAY bất kể máu & xuyên khiên. |

- **Mã nguồn:** `js/characters/lazer_charge/logic.js`

### 10. Lazer Pháo (`lazer_auto`)

HP:5 | Dame:1 | Không cần đạn: GIỮ bắn xả dòng laser xuyên thấu, nhịp bắn tăng dần (0.43s -> 0.17s/tia). Mỗi tia +9% Nhiệt; Nhiệt >= 60%: tia Nóng Đỏ +35% dame. Đầy 100% -> QUÁ NHIỆT khóa bắn 1.5s. Nhả nút để hạ nhiệt; hòm đạn xả sạch nhiệt.

- **Chỉ số thực đầu hiệp:** HP 5 · Sát thương 1 · Đạn — (năng lượng riêng) · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Xuyên Phá (`evo_lazer_a_1`) | $30 | Laser bay cực nhanh, nhịp bắn tối đa 0.13s/tia. FULL EVO: mỗi tia chỉ +7% Nhiệt, Quá Nhiệt chỉ 0.8s. |
  | Phá Hủy (`evo_lazer_a_2`) | $45 | Dame ×1.5, laser to hơn, Nóng Đỏ từ 50% Nhiệt. |

- **Mã nguồn:** `js/characters/lazer_auto/logic.js`

### 11. Pháo Tên Lửa (`rocket`)

HP:5 | Dame:1.15 (Nổ lan) | Đạn:3

- **Chỉ số thực đầu hiệp:** HP 5 · Sát thương 1.15 · Đạn 3 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Đầu Đạn Hạt Nhân (`evo_rocket_1`) | $220 | Vùng nổ siêu rộng + Phóng xạ |
  | Đầu Đạn Lớn (`evo_rocket_2`) | $40 | Tăng dame nổ + Phạm vi |

- **Mã nguồn:** `js/characters/rocket/logic.js`

### 12. Cổng Không Gian (`portal`)

HP:5 | Dame:1 | Đạn:7 (Dịch chuyển)

- **Chỉ số thực đầu hiệp:** HP 5 · Sát thương 1 · Đạn 7 · Tốc độ 5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Cổng Cường Hóa (`evo_portal_1`) | $55 | Dịch chuyển nhận đạn nổ. Mỗi 6s tự mở 2 Cổng Bắn trên sân, mỗi cổng nhắm & bắn 3 viên vào kẻ thù. Đi xuyên mép màn hình -> hồi chiêu mở cổng ngay. FULL EVO: mở x3 cổng (6 cổng). |
  | Cổng Gia Tốc (`evo_portal_2`) | $40 | Dịch chuyển hồi đầy đạn + Tốc |

- **Mã nguồn:** `js/characters/portal/logic.js`

### 13. Phong Trảm (`wind_slash`)

HP:4 | Tụ lực bắn Kiếm Khí (Phá đạn)

- **Chỉ số thực đầu hiệp:** HP 4 · Sát thương 0.9 · Đạn 1 · Tốc độ 3.5 · Kích thước 30×30
- **Vật triệu hồi / hiệu ứng:** Tường Gió
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Cuồng Phong Tích Tụ (`evo_wind_1`) | $120 | Mỗi phát bắn thứ 5 -> Tự động Full Lực |
  | Nghịch Phong (`evo_wind_2`) | $100 | Chém vào đạn địch -> Phản lại về phía địch |

- **Mã nguồn:** `js/characters/wind_slash/logic.js`, `js/characters/wind_slash/render.js`, `js/characters/wind_slash/summons.js`

### 14. Cuồng Phong (`storm`)

HP:3.5 | Giữ nút tụ lực 3.5s, nhả -> Lao & Chém Tròn (Phản đạn)

- **Chỉ số thực đầu hiệp:** HP 3.5 · Sát thương 2 · Đạn — (năng lượng riêng) · Tốc độ 5 · Kích thước 30×30
- **Vật triệu hồi / hiệu ứng:** Lốc Xoáy Chém
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Mắt Bão (`evo_storm_1`) | $80 | Tụ >50% + Khiên: Xóa đạn quanh người. Chém xong hút địch. |
  | Phong Ảnh Trảm (`evo_storm_2`) | $100 | Mỗi 3-8s bóng lao lên chém. Full lực + Khiên: Chém bồi thêm phát nữa. |

- **Mã nguồn:** `js/characters/storm/logic.js`, `js/characters/storm/render.js`, `js/characters/storm/summons.js`

### 15. Axit Hóa (`acid`)

HP:4 | Dame:0.5 | Đạn:1. Ăn mòn Max HP (Max HP<=1 nhận 4 Dame). Mỗi viên thứ 5 (đạn cường hóa) tạo VÙNG ĂN MÒN tím: rút cả HP lẫn Max HP & làm chậm. Mọi đạn/vùng Axit gây x10 dame + 50% Max HP lên vật cản, công trình, xe tiền/phương tiện & vật triệu hồi.

- **Chỉ số thực đầu hiệp:** HP 4 · Sát thương 0.5 · Đạn 1 · Tốc độ 3.5 · Kích thước 30×30
- **Vật triệu hồi / hiệu ứng:** Vùng Axit
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Bào Mòn (`evo_acid_1`) | $40 | Vùng Ăn Mòn rộng hơn & tồn tại lâu hơn, tốc độ rút HP / Max HP gấp đôi. |
  | Độc Hại (`evo_acid_2`) | $60 | Ngưỡng kết liễu tăng lên 2 Max HP. |

- **Mã nguồn:** `js/characters/acid/summons.js`

### 16. Kỹ Sư (`engineer`)

HP:3 (+2 máu xe lớn) | Dame:0.5 | Đạn:2. Tự tạo Ụ Thường. Giữ 1s đặt Ụ Thông Minh. Ụ tồn tại quá 10s tự mất máu chậm.

- **Chỉ số thực đầu hiệp:** HP 5 · Sát thương 0.5 · Đạn 2 · Tốc độ 3.5 · Kích thước 34×34
- **Vật triệu hồi / hiệu ứng:** Ụ Súng thường & thông minh
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Cải Tiến Hệ Thống (`evo_eng_1`) | $100 | Ụ súng thường VIP (75% chỉ số). Ụ súng thông minh VIP tối đa 3 cái, đạn Xuyên. Tương tác Mạng LAN. |
  | Quá Tải / Mạng LAN (`evo_eng_2`) | $200 | Vòng Mạng LAN hồi máu & giúp ụ thường tự ngắm. Giữ bắn 2s bật Quá Tải 600s (-1 Max HP, Ụ thông minh bắn Raycast mỗi 2s). Hết quá tải câm lặng 1s & chậm 5s (CD 8s). |

- **Mã nguồn:** `js/characters/engineer/logic.js`, `js/characters/engineer/summons.js`

### 17. Ghost (`ghost`)

HP:2.5 | Tốc: Rất Nhanh | Đạn:4. Vô Ảnh 2s (CD 3s). Tàn Ảnh phân thân.

- **Chỉ số thực đầu hiệp:** HP 2.5 · Sát thương 1.75 · Đạn 4 · Tốc độ 5.5 · Kích thước 24×24
- **Vật triệu hồi / hiệu ứng:** Tàn Ảnh
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Bóng Mờ (`evo_ghost_1`) | $60 | Vô ảnh: 2s (Hồi 1s). Đạn tàng hình khi buff. Đạn chớp tắt giữa map. |
  | Ảo Ảnh (`evo_ghost_2`) | $120 | Chu kỳ Vô ảnh nhanh hơn. Mỗi 12s triệu hồi Hư Ảnh bắn phụ. |

- **Mã nguồn:** `js/characters/ghost/logic.js`, `js/characters/ghost/render.js`, `js/characters/ghost/summons.js`

### 18. Pháo Cao Xạ (`aaa`)

HP:3.5 (+4 máu xe lớn) | Tốc: Chậm | Dame:1.15 Pháo Kích (1.5s nổ) + Xả nhanh khi có đạn. Tự bắn mỗi 4s (vòng đếm ngược quanh xe để canh thời điểm).

- **Chỉ số thực đầu hiệp:** HP 7.5 · Sát thương 1.15 · Đạn 1 · Tốc độ 2.1 · Kích thước 37×37
- **Vật triệu hồi / hiệu ứng:** Pháo cối đánh dấu
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Nhắm Đánh Dấu (`evo_aaa_1`) | $80 | Pháo kích tự ghim mục tiêu. Tự bắn thường: 3 tia liên tiếp. Pháo kích nổ bồi 1 lần tại chỗ (có cảnh báo, 50% dame). FULL EVO: nổ bồi 2 lần. |
  | Mưa Tên Lửa (`evo_aaa_2`) | $100 | Tự bắn -> Rơi 3 bom ngẫu nhiên trên làn địch. Pháo kích nổ bồi 1 lần tại chỗ (có cảnh báo, 50% dame). FULL EVO: nổ bồi 2 lần, nổ nhanh hơn. |

- **Mã nguồn:** `js/characters/aaa/logic.js`, `js/characters/aaa/summons.js`

### 19. Kiếm Tôn (`blade_god`)

HP:5 | Dame:1.05 | Đạn:4. Luân phiên: Quang Kiếm (lơ lửng tại chỗ, ngắm 2s rồi tự phóng tia sáng) / Ám Kiếm (kiếm bay, nổ + câm lặng). Nhát thứ 10: Phá Thiên Kiếm.

- **Chỉ số thực đầu hiệp:** HP 5 · Sát thương 1.05 · Đạn 4 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Kiếm Thế Vô Chủ (`evo_blade_1`) | $150 | Quang Kiếm tự rải ngẫu nhiên trên sân. Nội tại Quang Kiếm Loạn Ảnh: mỗi 10s 1 Quang Kiếm VIP bay quanh xe 3s, lao tới chém tan mọi loại đạn bay. Full Evo: Quang & Ám Kiếm tự xuất hiện, lơ lửng 2s rồi tự phóng; 2 nội tại mạnh hơn. |
  | Kiếm Thể Phòng Hộ (`evo_blade_2`) | $150 | Ám Kiếm tạo hố đen hút mạnh rồi hút yếu về tâm. Nội tại Ám Kiếm Tuyệt Diệt: mỗi 10s mưa kiếm cảnh báo 0.5s rơi xuống địch; sau 3s 1 Ám Kiếm VIP khổng lồ cảnh báo 1.25s rồi giáng, cắm 2s hút + gây sát thương. |

- **Mã nguồn:** `js/characters/blade_god/logic.js`, `js/characters/blade_god/summons.js`

### 20. Kiếm Trận (`van_kiem`)

HP:4.5 | Dame:0.6 | Đạn: Vô Hạn. Tự gọi kiếm. Giữ bắn để vào Kiếm Thế.

- **Chỉ số thực đầu hiệp:** HP 4.5 · Sát thương 0.6 · Đạn ∞ · Tốc độ 5.5 · Kích thước 26×26
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Mưa Kiếm (`evo_vk_1`) | $150 | Tự động gọi kiếm ngẫu nhiên sau lưng. Gọi càng nhanh khi đã bắn nhiều kiếm. |
  | Kiếm Thế Hoàn Chỉnh (`evo_vk_2`) | $150 | Trong Kiếm Thế: Có thể di chuyển siêu chậm, đạn xuyên thấu. Nhả nút phóng Đại Kiếm. |

- **Mã nguồn:** `js/characters/van_kiem/logic.js`

### 21. Súng Nước (`water_gun`)

HP:4 (+2 máu xe lớn) | Dame:1.5 Đạn: Nội năng (100%). Bấm: Tia nước. Giữ 1s: Laser nước (hiện cột cảnh báo 0.5s rồi mới bắn).

- **Chỉ số thực đầu hiệp:** HP 6 · Sát thương 1.5 · Đạn — (năng lượng riêng) · Tốc độ 3.5 · Kích thước 34×34
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Vòi Rồng (`evo_water_1`) | $100 | Giữ bắn -> Phun liên tục (10%/0.5s), vừa đi vừa phun chậm. Nghỉ bắn hồi nội năng nhanh (15%/s). |
  | Vòi Cao Áp (`evo_water_2`) | $120 | Tự hồi nội năng (0.5%/s) kể cả khi đang bắn. Đạn làm chậm và xuyên thấu. |

- **Mã nguồn:** `js/characters/water_gun/logic.js`

### 22. Lò Nung (`furnace`)

HP:6 (+3 máu xe lớn) | Chậm | Dame:0.25 Đạn: Nội năng. Gây Đốt. 5 stack Đốt -> Nổ 5 dame.

- **Chỉ số thực đầu hiệp:** HP 9 · Sát thương 0.25 · Đạn — (năng lượng riêng) · Tốc độ 3.5 · Kích thước 36×36
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Nhiệt Năng (`evo_furnace_1`) | $100 | Giữ bắn 1s -> Bắn tia lửa liên tục, hao năng lượng cực nhanh. |
  | Tích Tụ (`evo_furnace_2`) | $150 | Đốt kéo dài 6s. Cứ tiêu hao 30% nội năng -> Đạn kế tiếp gây nổ tạo Vùng Lửa. |

- **Mã nguồn:** `js/characters/furnace/logic.js`

### 23. Âm Dương Sư (`am_duong_su`)

HP:5 | Dame:0.5 | Đạn:4. Luân phiên Âm/Dương chú. Bùa kích nổ nhanh.

- **Chỉ số thực đầu hiệp:** HP 5 · Sát thương 0.5 · Đạn 4 · Tốc độ 3.5 · Kích thước 30×30
- **Vật triệu hồi / hiệu ứng:** Bùa chú, Pháp trận, Vùng hư vô, Vùng phóng xạ
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Pháp Chú (`evo_ads_1`) | $80 | Nổ/Choáng rộng và lâu hơn. Bùa tồn tại lâu hơn. |
  | Pháp Trận (`evo_ads_2`) | $100 | Bùa kết hợp nổ để lại Pháp Trận sát thương liên tục. |

- **Mã nguồn:** `js/characters/am_duong_su/logic.js`, `js/characters/am_duong_su/render.js`, `js/characters/am_duong_su/summons.js`

### 24. 6 Nòng (`six_barrel`)

HP:6 (+3 máu xe lớn) | Dame:0.4 | Đạn: Vô hạn. Giữ 0.5s khởi động nòng rồi mới bắn (đã quay thì nhấp vẫn bắn). Bắn liên tục tăng Nhiệt, đi chậm. Quá nhiệt gây câm lặng.

- **Chỉ số thực đầu hiệp:** HP 9 · Sát thương 0.4 · Đạn ∞ · Tốc độ 3.5 · Kích thước 36×36
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Bão Đạn (`evo_six_1`) | $80 | Nhiệt >50%: Bắn 2 viên. Nhiệt >75%: Bắn 3 viên. |
  | Quá Nhiệt (`evo_six_2`) | $100 | Nhiệt >50% đã gây Đốt. Hạ nhiệt cực nhanh khi <50%. Lâu quá tải hơn. Nhược điểm: Quá tải trừ 5 Max HP. |

- **Mã nguồn:** `js/characters/six_barrel/logic.js`

### 25. Kẻ Mạnh Nhất (`the_strongest`)

HP 1. Dùng Chú Lực vô hiệu sát thương. Nhấp: Lướt (Thương). Giữ: Hit-scan (Hách). Bị trúng đòn ngắt niệm.

- **Chỉ số thực đầu hiệp:** HP 1 · Sát thương 2 · Đạn — (năng lượng riêng) · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | HÆ° Thá»©c: Tá»­ (TĂ­m) (`evo_strongest_1`) | $90 | KĂ­ch hoáº¡t cáº£ 2 ná»™i táº¡i khi ChĂº lá»±c >50% táº¡o cáº§u há»§y diá»‡t ná»• diá»‡n rá»™ng. |
  | Lá»¥c NhĂ£n (Máº¯t Xanh) (`evo_strongest_2`) | $90 | TÄƒng max & há»“i ChĂº lá»±c. Nháº¥p: Äáº¡n Xanh hĂºt Ä‘á»‹ch. Giá»¯: Tia Äá» choĂ¡ng. |

- **Mã nguồn:** `js/characters/the_strongest/logic.js`

### 26. Sniper (`sniper`)

HP:3 | Dame:2 | Đạn:5. Tốc chậm. Giữ bắn tạo tường chặn MỌI đòn địch (cả tia hitscan & đạn xuyên); đạn mình bay qua. Tường tự mục sau 5s. Xuyên giảm dame. Đạn bay cực nhanh, tia ngắm chỉ đúng hướng bắn. Hết đạn nạp cả băng (vòng nạp).

- **Chỉ số thực đầu hiệp:** HP 3 · Sát thương 2 · Đạn 5 · Tốc độ 2.62 · Kích thước 24×24
- **Vật triệu hồi / hiệu ứng:** Tường Sniper
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Tường Thép (`evo_sniper_1`) | $80 | Tường HP x5. Đạn Sniper đi qua tường phe mình KHÔNG bị giảm sát thương. Full Evo: tường dài & cứng hơn (HP x7), không tự mục, bất tử 2s đầu, đạn phe mình không làm hại tường. |
  | Xuyên Thủng (`evo_sniper_2`) | $100 | 25% đạn thành tia Raycast (chạm tường/chướng ngại vật sẽ thành đạn thường). |

- **Mã nguồn:** `js/characters/sniper/logic.js`, `js/characters/sniper/render.js`, `js/characters/sniper/summons.js`

### 27. Bow (`cung`)

HP:3 | Dame:0.5 | Đạn:3 | Tốc: Nhanh. Giữ nút kéo cung (đầy lực ~1.5s), nhả để bắn: Tăng sát thương/Tốc đạn. Nội tại Nhạy Bén: Tự né 1 lần đạn mỗi 8s (Full Evo 5s).

- **Chỉ số thực đầu hiệp:** HP 3 · Sát thương 0.5 · Đạn 3 · Tốc độ 4.38 · Kích thước 24×24
- **Vật triệu hồi / hiệu ứng:** Mưa Tên
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Xuyên Thủng (`evo_cung_1`) | $80 | Tụ >2s: Đạn xuyên qua mục tiêu nhưng giảm 50% dame. |
  | Mưa Tên (`evo_cung_2`) | $120 | Tụ >3s: Tạo hồng tâm đuổi địch. Nhả bắn rơi Mưa Tên (CD: 10s). |

- **Mã nguồn:** `js/characters/cung/logic.js`, `js/characters/cung/render.js`, `js/characters/cung/summons.js`

### 28. Mirror (`mirror`)

HP:5.5 | Dame:1.3 | Đạn:6. Tạo bản sao đối xứng bắn cùng lúc (50% dame). Giữ bắn 1s để hoán đổi vị trí.

- **Chỉ số thực đầu hiệp:** HP 5.5 · Sát thương 1.3 · Đạn 6 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Tái Lập (`evo_mirror_1`) | $80 | CD Đổi còn 3s. Sau khi đổi: Tăng Tốc, Dame và Bất tử 0.5s. |
  | Hình Chiếu (`evo_mirror_2`) | $100 | Tạo Ảnh chiếu cho địch. Đánh vào Ảnh chiếu địch chịu 50% dame. |

- **Mã nguồn:** `js/characters/mirror/logic.js`, `js/characters/mirror/render.js`

### 29. Vua Đầu Bếp (`sukuna`)

HP:4.5 (+3 máu xe lớn) | Chú Lực tấn công. Giữ bắn Phản Chuyển (+1.25 HP). Bị trúng đòn ngắt niệm Lãnh Địa.

- **Chỉ số thực đầu hiệp:** HP 7.5 · Sát thương 2 · Đạn ∞ · Tốc độ 3.5 · Kích thước 36×36
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Hỏa Mũi Tên (Fuga) (`evo_sukuna_1`) | $100 | Khi đầy 100 Chú Lực, giữ bắn 2s phóng đại hồng tâm lửa gây 3.5 dame. |
  | Phách Diện Rộng (`evo_sukuna_2`) | $100 | Nhát chém to gấp đôi, có thể triệt tiêu đạn thường của kẻ địch. |

- **Mã nguồn:** `js/characters/sukuna/logic.js`, `js/characters/sukuna/render.js`

### 30. Paradox (`paradox`)

HP:6 | Dame:1.2 | Đạn:5. Có bóng đi sau 3s. Giữ 0.2s tua ngược & tự xả đạn lặp lại (CD: 12s/7s). Giữ tới mốc trống cuối: đặt Neo Thời Không (10s, CD 20s) - lần tua tới về neo (vị trí, máu, đạn).

- **Chỉ số thực đầu hiệp:** HP 6 · Sát thương 1.2 · Đạn 5 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Dấu Ấn Thời Gian (`evo_paradox_1`) | $100 | Bắn trúng địch tích ấn (Max 3). Đủ ấn tạo Bóng Đứng Yên + Choáng. Kích hoạt tua ngược kéo địch về Bóng Đứng. |
  | Nghịch Đảo (`evo_paradox_2`) | $120 | Hồi chiêu Tua Ngược còn 10s. Kéo địch về gây Làm Chậm. Đủ 2 Evo: Kéo địch về Bóng 5s (Choáng 0.5s) hoặc Bóng Đứng (Choáng 1.5s, 2 hit tạo bóng). |

- **Mã nguồn:** `js/characters/paradox/logic.js`, `js/characters/paradox/render.js`

### 31. Nhà Ảo Thuật (`magician`)

HP:3 | Dame:1 | Rất Nhanh | Đạn:7. Giữ bắn+Đi: Lướt, Khiên, Tàng hình. Giữ bắn+Đứng: Khiên & Vô địch. Giữ 1s: Hoán đổi & Khiên.

- **Chỉ số thực đầu hiệp:** HP 3 · Sát thương 1 · Đạn 7 · Tốc độ 4.73 · Kích thước 26×26
- **Vật triệu hồi / hiệu ứng:** Phân Ảnh, Hòm ảo
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Hoán Đổi Chủ Động (`evo_mag_1`) | $100 | Giữ bắn 1s: Tàng hình & Đổi vị trí với Phân ảnh. Đổi với bóng Đứng: Bóng tự đi. Đổi bóng Đi: Cả hai tăng tốc. |
  | Loạn Ảnh & Suy Yếu (`evo_mag_2`) | $120 | Bắn trúng +1, Địch phá bóng +3 stack Suy Yếu (Nhận thêm dame). Đủ 3 stack: Địch bị Slow. Đạn trúng địch gây Loạn Phím. |

- **Mã nguồn:** `js/characters/magician/logic.js`, `js/characters/magician/render.js`

### 32. Nhà Phát Minh (`inventor`)

HP:5.5 | Tốc: 0.8x | Dame:0.7 | Đạn: 4. Dùng Linh Kiện (LK) nâng cấp. Sở hữu Drone Không Kích.

- **Chỉ số thực đầu hiệp:** HP 5.5 · Sát thương 0.7 · Đạn 4 · Tốc độ 2.24 · Kích thước 30×30
- **Vật triệu hồi / hiệu ứng:** Drone Không Kích (1/2/4 chiếc)
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Cải Tiến Và Tiến Hóa (`evo_inv_1`) | $80 | Drone nhận 75% chỉ số. Drone hồi sinh nhanh. Thắng +6 LK, Crate +2 LK, Xe tiền +3 LK. |
  | Bản Thiết Kế ++ (`evo_inv_2`) | $100 | Có 2 Drone. Hồi sinh 8s. Mở khóa Tụ Gió & Khiên Drone trong Chợ LK. |

- **Mã nguồn:** `js/characters/inventor/logic.js`, `js/characters/inventor/render.js`, `js/characters/inventor/summons.js`

### 33. Shadow Hunter (`shadow_hunter`)

HP:2 | Dame:1 | Đạn:6. Vô Hình (Nhấn Bắn: +40% Tốc, +50% Dame, Đòn Cường Hóa). Chảy máu & Chậm.

- **Chỉ số thực đầu hiệp:** HP 2 · Sát thương 1 · Đạn 6 · Tốc độ 5.92 · Kích thước 24×24
- **Vật triệu hồi / hiệu ứng:** Bẫy Bóng Tối
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Bóng Mờ (`evo_sh_1`) | $90 | Đòn cường hóa xuyên thấu. Gây Mù HUD điều khiển đối thủ trong 1.5s. |
  | Phục Kích (`evo_sh_2`) | $110 | Vào Vô Hình: Nạp đầy đạn, +60% tốc, +100% dame. Đạn câm lặng 1.5s. Rải 2 cạm bẫy bóng đêm. |

- **Mã nguồn:** `js/characters/shadow_hunter/logic.js`, `js/characters/shadow_hunter/summons.js`

### 34. Shortgun (`shortgunATK`)

HP:3.5 | Dame:1.3 | Đạn:2. Quét 180px -> Lao áp sát (cách 40px) -> Nón bộc phá 0.5s. Nhấp đúp: x2 đạn & x2 dame. Phá hủy hồi 1 đạn.

- **Chỉ số thực đầu hiệp:** HP 5.5 · Sát thương 1.3 · Đạn 2 · Tốc độ 5.47 · Kích thước 34×34
- **Vật triệu hồi / hiệu ứng:** Biển Lửa
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Dragon Strike (`evo_sg_1`) | $90 | Đạn gây Đốt 2 tầng. Vùng nón cảnh báo để lại Vùng Biển Lửa (FireZone) 3s. |
  | Tàn Phá (`evo_sg_2`) | $110 | Tiêu diệt mục tiêu biến xác thành đạn pháo quán tính văng thẳng phía trước nổ AoE. |

- **Mã nguồn:** `js/characters/shortgunATK/logic.js`, `js/characters/shortgunATK/render.js`, `js/characters/shortgunATK/summons.js`

### 35. Sấm Chớp (`thunder`)

HP:2 | Dame:1 | Đạn:0 (3 Lôi Phong Thương). Nhấp: Phóng thương cắm tường nổ AoE. Giữ 0.5-1s: Thu thương. Giữ >1s: Lôi Trảm (chém rộng ở từng cây thương, càng nhiều thương càng nhanh, tối đa 3s; xong được buff tốc chạy + sát thương ngắn & 1-3 thương rơi từ trời xuống địch, báo trước 3s). Mất hết thương: hồi lại sau 5s. Lôi Minh chỉ tích khi Thu thương, Lôi Trảm, hoặc thương phóng trúng địch. Thiên Kiếp (Lôi Minh 3/3): Nhấp = Lôi Độn (hóa sét lao tới, hút địch, chém nhanh, bất tử); kết thúc bằng Thiên Lôi Giáng (bay lên trời, lái vòng, giáng gây choáng).

- **Chỉ số thực đầu hiệp:** HP 2 · Sát thương 1 · Đạn — (năng lượng riêng) · Tốc độ 5.92 · Kích thước 26×26
- **Vật triệu hồi / hiệu ứng:** Lôi Phong Thương cắm đất
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Phá Sấm (`evo_thun_1`) | $90 | Nổ tường & Lôi Trảm gây Choáng 0.75s (1 lần mỗi chuỗi); càng gom nhiều thương, nhát Lôi Trảm chính càng to & mạnh; nhát chém cuối Lôi Độn gây Choáng 0.5s. Full Evo: Thiên Lôi Giáng để lại Lôi Vực & sét trời ngẫu nhiên đánh nửa sân địch mỗi 4-6s. |
  | Rẽ Mây (`evo_thun_2`) | $110 | Mỗi nhát Lôi Trảm, mọi cây thương còn lại trên sân chém phụ (có cảnh báo, 1/2 sát thương). Thiên Kiếp kéo dài 8s & 3 lần miễn nhiễm sát thương. Full Evo: chém phụ = sát thương nhát chính. |

- **Mã nguồn:** `js/characters/thunder/logic.js`, `js/characters/thunder/render.js`, `js/characters/thunder/summons.js`

### 36. Nam Châm (`magnet`)

HP:4.5 | Dame:0.5 | Đạn:6. Giữ: Đổi Cực Âm/Dương (+/-). Bắn cắm Cột Từ Trường (từ trường cực mạnh 2s đầu rồi yếu dần). Hút/Đẩy kẻ địch nhiễm từ. Nhấp đúp khi Cột/kẻ địch nhiễm từ phía trước KHÁC CỰC: Lướt Cực Tính lao thẳng tới húc như xe TANK, vừa hút mục tiêu về phía mình.

- **Chỉ số thực đầu hiệp:** HP 6.5 · Sát thương 0.5 · Đạn 6 · Tốc độ 3.5 · Kích thước 34×34
- **Vật triệu hồi / hiệu ứng:** Nút Từ Trường
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Từ Trường Tăng Cường (`evo_mag_net_1`) | $90 | Giật điện từ trường gây 0.5 dame (x2); Lướt Cực Tính: húc 1.5 dame, nổ cột 2 dame. |
  | Lưới Từ Cực (`evo_mag_net_2`) | $110 | Tối đa 3 Cột Từ Trường, lực hút/đẩy x1.5. FULL EVO: 4 cột, bán kính từ trường lớn hơn, đảo cực giật kẻ địch lại gần. |

- **Mã nguồn:** `js/characters/magnet/logic.js`, `js/characters/magnet/render.js`, `js/characters/magnet/summons.js`

### 37. Tiến Hóa (`evolution`)

HP:5.5 | Dame:1 | Đạn:1 (Thuần Farm). Ăn/Phá Rương cộng vĩnh viễn chỉ số. Rương Giả Mạo (Mimic). Late game bất khả chiến bại.

- **Chỉ số thực đầu hiệp:** HP 5.5 · Sát thương 1 · Đạn 1 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Mưa Tiến Hóa (`evo_evo_1`) | $90 | Tăng mạnh tỉ lệ rương; Chỉ số nhận từ thùng đồ tăng +30%. |
  | Dị Thể Cộng Hưởng (`evo_evo_2`) | $110 | Mảnh văng Mimic x2 số lượng & gây 100% Dame của xe. |

- **Mã nguồn:** `js/characters/evolution/logic.js`, `js/characters/evolution/render.js`

### 38. Trối Chết (DeathLock) (`death_lock`)

HP:6 (+2 máu xe lớn) | Dame:0.8 | Đạn:3 | Tốc: 0.8x. Nội tại Ràng Buộc: 4 tầng ấn. Đạn Cấm Chế: Lồng Xích hút & giam giữ.

- **Chỉ số thực đầu hiệp:** HP 8 · Sát thương 0.8 · Đạn 3 · Tốc độ 2.8 · Kích thước 34×34
- **Vật triệu hồi / hiệu ứng:** Lồng Cấm Chế
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Trói (`evo_dl_1`) | $90 | Thời gian duy trì ấn Ràng Buộc tăng từ 5s lên 8s (Full Evo: 12s). |
  | Quản Chế (`evo_dl_2`) | $110 | Lực kéo tâm xích mạnh & xa hơn; Chiều rộng Lồng thu hẹp còn 140px (Full: 100px). |

- **Mã nguồn:** `js/characters/death_lock/logic.js`, `js/characters/death_lock/summons.js`

### 39. Kẻ Sáng Tạo (`creator`)

HP:3 | Dame:0.25 | Đạn:1 | Tốc: 1.0x. Bản Thiết Kế Toàn Năng: Ụ Súng Tự Ngắm (max 2), Khiên Thép Chắn Đạn (5 HP), Drone Không Kích.

- **Chỉ số thực đầu hiệp:** HP 3 · Sát thương 0.25 · Đạn 1 · Tốc độ 3.5 · Kích thước 24×24
- **Vật triệu hồi / hiệu ứng:** Ụ Súng Tự Ngắm, Khiên Thép, Drone, Robot Chiến Đấu (Evo 2)
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Sản Phẩm Mới (`evo_cr_1`) | $90 | Ụ súng và Khiên thép nhận 100% chỉ số (Ụ súng x2 dame, Khiên 10 HP). |
  | Robot Tự Động (`evo_cr_2`) | $120 | Sau 10s xuất xưởng Robot Chiến Đấu (36x36, 10 HP, SMG/Rocket/Dash, Hồi sinh 30s). |

- **Mã nguồn:** `js/characters/creator/logic.js`, `js/characters/creator/summons.js`

### 40. Chiêu Hồn Sư (`necromancer`)

HP:1 | Dame:1 | Đạn:1 | Tốc: 0.8x. Linh Minh Hộ Thể: Khởi đầu 6 Linh Hồn (Linh Giáp đỡ đòn). Tụ lực phím Bắn triệu hồi 3 mốc Vong Linh.

- **Chỉ số thực đầu hiệp:** HP 1 + 5 Linh Hồn · Sát thương 1 · Đạn 1 · Tốc độ 2.8 · Kích thước 32×32
- **Vật triệu hồi / hiệu ứng:** Vong Linh: Cảm Tử / Xạ Thủ / Cao Cấp (lao húc)
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Linh Thể (`evo_necro_1`) | $90 | Tốc độ hồi Linh Hồn nhanh hơn (3 Linh Hồn mỗi 3s). |
  | Thống Trị (`evo_necro_2`) | $110 | +4 Linh Hồn tối đa. Quái triệu hồi nhận nội tại bổ sung (Cảm Tử +50% bán kính nổ; Xạ Thủ bắn đạn Xuyên; Cao Cấp có khiên đỡ 3 đòn). |

- **Mã nguồn:** `js/characters/necromancer/logic.js`, `js/characters/necromancer/render.js`, `js/characters/necromancer/summons.js`

### 41. Thiên Tài (`genius`)

HP:2.5 | Dame:1 | Đạn:1 | Tốc: 1.3x. Thu thập Bánh Răng & Linh Kiện. Mở Chợ Đen nâng cấp Robot. Đủ Bánh Răng nhấn giữ để trực tiếp Lái Mecha!

- **Chỉ số thực đầu hiệp:** HP 2.5 · Sát thương 1 · Đạn 1 · Tốc độ 4.55 · Kích thước 24×24
- **Vật triệu hồi / hiệu ứng:** Mecha (lái được, Full Evo: ném Robot tự hủy)
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Tối Ưu Hóa (`evo_gen_1`) | $90 | Giảm tiêu hao Bánh Răng vào Mecha còn 6 BR; Kỹ năng giảm 1 NL; Hoàn lại 4 BR khi Mecha vỡ; Hồi 2 NL/s khi không dùng kỹ năng 2s. |
  | Vũ Trang Hóa (`evo_gen_2`) | $110 | Bắn thường Mecha có Xuyên Thấu. Trang bị 4 module tự động (Bắn phụ 3s, Radar AAA 8s, Chấn Động 10s, Pháo Thủy Lực 8 NL). |

- **Mã nguồn:** `js/characters/genius/logic.js`, `js/characters/genius/render.js`, `js/characters/genius/summons.js`

### 42. Kiếm Khách (`kiem_khach`) 🆕

HP:3 | Dame:1.2 | Đạn:3. Bắn phi kiếm. Mất khiên -> Tập Trung 3s (né mọi đòn). Làm 3 Bài Tập Luyện Kiếm cùng lúc (+1 ô mỗi hiệp), đầu trận tự nhận 3 bài ngẫu nhiên; xong bài tăng sức mạnh vĩnh viễn.

- **Chỉ số thực đầu hiệp:** HP 3 · Sát thương 1.2 · Đạn 3 · Tốc độ 3.5 · Kích thước 30×30
- **Vật triệu hồi / hiệu ứng:** Đại kiếm giáng trời (Vân Tinh Vũ)
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Lấy Tâm Luyện Kiếm (`evo_kk_1`) | $90 | Giảm 50% yêu cầu của mọi bài tập. Tập Trung khi mất khiên kéo dài 5s (thay vì 3s). |
  | Thí Luyện (`evo_kk_2`) | $110 | +1 ô bài tập làm cùng lúc. Đầu mỗi hiệp nhận sẵn 1 Khiên. FULL EVO: +2 ô bài tập, yêu cầu giảm sâu, mở 5 Bài Tập Cuối -> Hóa Thần. |

- **Mã nguồn:** `js/characters/kiem_khach/logic.js`, `js/characters/kiem_khach/render.js`, `js/characters/kiem_khach/quests.js`

### 43. Bình Phun (`sprayer`) 🆕

HP:5 (+2 xe lớn) | Năng lượng. Nhấp: Bật/Tắt phun hình nón. Giữ 0.5s: đổi chất Lửa/Axit/Băng. Lớp phủ đầy 100% -> Nổ / Câm Lặng / Đóng Băng. Axit ăn mòn mọi vật không phải body (thùng, xe tiền, triệu hồi, công trình): x10 dame + mất 50% Max HP mỗi giây hứng luồng; xe tiền/xe bị đốt nhanh gấp 3. Vật cản chặn luồng phun.

- **Chỉ số thực đầu hiệp:** HP 7 · Sát thương 0 · Đạn — (năng lượng riêng) · Tốc độ 2.89 · Kích thước 34×34
- **Vật triệu hồi / hiệu ứng:** Vũng Lửa / Axit / Băng (Evo 2)
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Năng Lượng Xanh (`evo_spray_1`) | $80 | Hồi năng lượng nhanh hơn 50%, phun tiêu hao chậm hơn 30%. |
  | Dấu Vết Độc Địa (`evo_spray_2`) | $110 | Lớp phủ bám lâu hơn. Phun liên tục để lại vũng Lửa/Axit/Băng 3s. FULL EVO: phun cùng lúc cả 3 chất, góc phun rộng hơn, phun lâu hơn; Nổ 7 dmg lan, Axit ăn mòn x2 & câm thêm 1s, Đóng băng 2.5s. |

- **Mã nguồn:** `js/characters/sprayer/logic.js`, `js/characters/sprayer/render.js`

### 44. Tùy Biến (`customize`) 🆕

HP:6 | Dame:1.5. Xe lắp ghép: mỗi hiệp nhận 2+ Điểm Tùy Chỉnh (thua / chuỗi thua nhận thêm) để lắp & nâng cấp Lối Bắn (Tap, Loạt, Shotgun, SMG, Tích Tụ, Tiến Công), Dạng Đạn, Tính Chất (Nổ, Xuyên, Chí Mạng, Hút Máu, Song Nòng, Vũng...), Kích Thước và Chỉ Số nâng mãi.

- **Chỉ số thực đầu hiệp:** HP 6 · Sát thương 1.5 · Đạn 4 · Tốc độ 3.5 · Kích thước 30×30
- **Vật triệu hồi / hiệu ứng:** Vũng hiệu ứng theo mô-đun
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Gói VIP (`evo_cu_1`) | $80 | Mọi mô-đun đã lắp lên +1 cấp ngay, +2 Điểm Tùy Chỉnh, cấp tối đa +1. Mở mô-đun VIP: Tự Ngắm, Đạn Hút (kéo & làm chậm), Nảy Tường (bắn chéo, +dame mỗi lần nảy). |
  | Cá Nhân Hóa (`evo_cu_2`) | $110 | Nổ, Vũng, Hút Máu, Đạn Hút, Nảy Tường, Tiến Công mạnh hơn 30%. +1 Điểm Tùy Chỉnh mỗi hiệp. FULL EVO: chọn miễn phí 1 Nội Tại Độc Quyền (Hồi Sinh, Vô Ảnh, Tập Trung, Phản Lực). |

- **Mã nguồn:** `js/characters/customize/logic.js`, `js/characters/customize/render.js`

### 45. Kiếm Sư (`kiem_su`) 🆕

HP:4 | Dame:1 | Đạn:5 | Tốc: 1.1x. Ngũ Hành: mỗi phi kiếm mang 1 nguyên tố ngẫu nhiên (Kim tiền, Mộc trói, Hỏa nổ, Thổ dựng đá, Thủy hồi máu).

- **Chỉ số thực đầu hiệp:** HP 4 · Sát thương 1 · Đạn 5 · Tốc độ 3.85 · Kích thước 28×28
- **Vật triệu hồi / hiệu ứng:** Khối Đá, Vùng Rễ, Bùn, Gai, Biển Lửa
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Điều Tức Chuyển Khí (`evo_ks_1`) | $90 | Cường hóa mọi nguyên tố. Giữ Bắn 0.25s: đổi chỗ viên đạn hiện tại và viên kế tiếp (trùng màu thì tự đổi màu). |
  | Ngũ Hành Giao Thoa (`evo_ks_2`) | $120 | 2 phi kiếm liên tiếp tạo phản ứng: Đồng nguyên tố / Tương sinh / Tương khắc (15 phản ứng). FULL EVO: mỗi phát kèm 2 kiếm hộ tống, phản ứng mạnh hơn. |

- **Mã nguồn:** `js/characters/kiem_su/logic.js`, `js/characters/kiem_su/render.js`

### 46. Cao Bồi (`revolver`)

HP:3.5 | Dame:1.25 | Đạn:6 (ổ cố định) | Tốc: 1.2x. "6 viên là đủ!" Chỉ nạp khi bắn cạn cả ổ (1.8s). Nhấp: đạn xuyên thủng; viên thứ 6 là đạn đồng x2 dame, xuyên khiên. Giữ 0.4s: Quạt Cò — khóa hồng tâm 1s rồi xả hết ổ (0.1s/viên).

- **Chỉ số thực đầu hiệp:** HP 3.5 · Sát thương 1.25 · Đạn 6 · Tốc độ 4.2 · Kích thước 26×26
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Đạn Độc Đắc (`evo_rev_1`) | $90 | Viên 1-5 có 50% Nổ khi trúng đích. Viên thứ 6 luôn Nổ lớn và gây Choáng. |
  | Rút Súng Thần Tốc (`evo_rev_2`) | $110 | Nạp ổ còn 0.9s. Bắn điểm xạ trúng 6/6 -> hồi đầy ổ ngay + 1 dame cho ổ kế tiếp. Quạt Cò trúng >= 50% -> hồi đầy ổ. FULL EVO: Ổ Đạn Ngũ Sắc (viên 1-2 Chậm, 3-4 Chảy Máu, 5 Choáng 0.3s, 6 Chí Mạng x2.5), nạp nhanh hơn nữa, Quạt Cò Song Lục (gấp đôi đạn) & mọi đạn quạt đều Xuyên Thấu. |

- **Mã nguồn:** `js/characters/revolver/logic.js`, `js/characters/revolver/render.js`

### 47. DJ (`dj`)

HP:4 | Dame:0.75 | Đạn:2 (∞ khi đúng nhịp) | Tốc: 1.15x. "Lắng nghe nhịp điệu nào!" Nút Bắn đổi màu theo nhịp Xanh -> Vàng -> Đỏ: bấm lúc ĐỎ (vùng rộng, dễ bấm trên điện thoại) = Cảm Âm Hoàn Hảo (sóng âm rộng, không tốn đạn, làm chậm, +1 Combo). Bấm lúc VÀNG = vẫn bắn sóng âm nhưng KHÔNG cộng Combo. Bấm sai = Loạn Âm (đứt combo, nửa dame, tốn đạn). Để nốt trôi qua vùng mà không bấm = LỠ NHỊP: mất phát bắn (tốn 1 đạn) & đứt Combo. Hết đạn khóa 1.5s. Giữ 0.4s: đổi bản nhạc Dễ (nốt chậm, thưa, Hoàn Hảo rất dễ) / Trung Bình (vừa phải, thỉnh thoảng Nốt Đôi: bấm 2 lần liên tiếp) / Khó (nhanh, cho người đã luyện). Combo tăng tốc & dame; mỗi 30 combo +1 Khiên, mỗi 45 combo +1 HP.

- **Chỉ số thực đầu hiệp:** HP 4 · Sát thương 0.75 · Đạn 2 · Tốc độ 4.02 · Kích thước 28×28
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Cảm Âm Dung Sai (`evo_dj_1`) | $90 | Được bấm sai / lỡ nhịp tối đa 3 lần mới mất chuỗi Combo. Hồi lại đủ 3 lượt bảo hộ sau mỗi 30 Combo. |
  | Giai Điệu Thăng Hoa (`evo_dj_2`) | $120 | Sóng Âm mở khóa theo Combo: 15 Xuyên Thấu, 30 Phát Nổ, 60 để lại Vùng Âm Nhiệt (thiêu đốt + làm chậm), 120 hóa tia Hitscan. FULL EVO: vào hiệp sẵn 30 Combo, bấm chuẩn Combo x2, buff mạnh hơn; sai 6 lần, lần thứ 6 tự đánh chuẩn; 2 Loa nổi bắn sóng phụ mỗi nhịp; mở Bản Nhạc Huyền Thoại (rất nhanh, dày đặc Nốt Đôi - thử thách cực hạn). |

- **Mã nguồn:** `js/characters/dj/logic.js`, `js/characters/dj/render.js`

### 48. Móc Thép (`steel_hook`)

HP:3 (+3 xe lớn) | Dame:2 | Đạn:1 | Chậm. Móc lắc trái-phải ±70° trước mũi xe. Giữ Bắn tụ lực 4 mốc (+2 lần nảy mỗi mốc, tối đa 9), nhả để phóng xích nảy tường; giữ càng lâu móc bay càng nhanh (đi hết đường xích trong 1.25s -> 0.5s). Xuyên & phá hòm, 2 dame lên triệu hồi/công trình, ghim Xe Tiền làm trụ phản xạ (hết lượt nảy: ngoạm & spam Bắn để kéo về ăn tiền). Móc dừng: Bắn lần nữa -> Đu Dây Đột Kích (lao theo xích húc mọi thứ, nổ 2 dame) hoặc Lôi Xích Hành Hình nếu trúng địch (kéo địch ngược đường xích, +1 dame mỗi vật bị đập, nổ 2 dame). Móc đã neo: giữ Bắn 0.75s để tự cắt xích và phóng lại. Đầu móc có máu = 50% máu xe: bắn trúng sẽ đứt xích.

- **Chỉ số thực đầu hiệp:** HP 6 · Sát thương 2 · Đạn 1 · Tốc độ 2.98 · Kích thước 36×36
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Tời Thủy Lực (`evo_hook_1`) | $125 | Đu dây & kéo nhanh hơn. Tụ lực tối đa 15 lần nảy (mạng nhện xích kín bản đồ). |
  | Quặp Sắt Trọng Lực (`evo_hook_2`) | $150 | Đầu móc to gấp rưỡi. Va đập khi kéo địch x2 (+2 dame/vật thể). Mỗi 7s móc phụ tự quặp Xe Tiền/vật thể trên sân rồi ném thẳng vào địch gây nổ lớn. FULL EVO: x2 Máu tối đa, đầu móc máu 100%, tối đa 17 lần nảy, mỗi lần phóng 3 móc cùng lúc (2 móc phụ chỉ có 25% máu, dễ bắn đứt hơn). |

- **Mã nguồn:** `js/characters/steel_hook/logic.js`, `js/characters/steel_hook/render.js`

### 49. Hoa Ảnh (`flower_shadow`)

"Khiêu vũ nào!" HP:3 | Dame:0.5 | Thanh Hoa 100% (hồi sau 0.5s không múa) | Tốc: 1.35x. Giữ Bắn 0.25s đổi Vũ Điệu Khai → Phá → Thiên, nhấp để múa. KHAI (10%): 3 cánh hoa bay tới cuối sân, nghỉ 3s rồi trôi về (gây dame, mỗi cánh về tới hoàn 5%); tối đa 12 cánh trên sân. Cánh bay ra / thu về chạm vật cản, công trình, triệu hồi, xe tiền thì gây dame rồi vỡ; cánh đang nằm trên sân địch bị xe địch lăn qua sẽ nát. PHÁ (25%): lướt xuyên thẳng tới cuối sân rồi về, 1s sau mọi mục tiêu bị xuyên chịu 5 nhát chém. THIÊN (50%): biến mất, lái Vòng Cảnh Báo (hút & làm chậm) tối đa 5s, nhấp để đáp: vòng khóa đỏ 0.5s rồi giáng 2.7 dame + choáng 1.5s. Tiêu hao 75% Hoa: vũ điệu kế tiếp được Cường Hóa (Bách Hoa Nở Rộ: cánh hoa hồng nhạt ánh kim, không thể bị chặn hay đè nát, xuyên vật cản cả lượt bay ra lẫn lượt thu về), đòn cường hóa không tính vào bộ đếm và bộ đếm về 0 sau đó.

- **Chỉ số thực đầu hiệp:** HP 3 · Sát thương 0.5 · Đạn — (năng lượng riêng) · Tốc độ 4.73 · Kích thước 24×24
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Hoa Ảnh Song Hành (`evo_flw_1`) | $100 | Thanh Hoa hồi nhanh hơn mạnh. Tối đa 24 cánh Khai trên sân. Kho Hoa mở rộng 200% (phần trên 100% chỉ nạp được bằng thu hồi cánh hoa). Bách Hoa Nở Rộ chỉ cần tiêu hao 50% Hoa. 1 Bóng Hoa đi theo đường cũ của bạn, lặp lại Vũ Điệu bạn vừa múa sau 3 giây. |
  | Hương Sắc Tuyệt Trần (`evo_flw_2`) | $120 | Khai: cánh hoa nằm nghỉ tỏa phấn làm chậm. Phá: chém nát đạn thường của địch trên đường lướt. Thiên: hút & làm chậm mạnh hơn, +1 dame. FULL EVO: không giới hạn cánh Khai, cánh nằm nghỉ 2s rồi thu về, Kho Hoa tự hồi tới 200% và thu hồi cánh nạp được tới 300%, cánh bay ra xuyên vật cản (lượt thu về vẫn bị chặn), Bách Hoa Nở Rộ trọn vẹn (Khai 5 cánh x1.5, Phá 2 bản sao, Ngôi Sao Trảm 2s); hoa rơi khắp màn hình, định kỳ hoa tự ngắm lao vào địch, mọi Vũ Điệu mạnh hơn, thêm Bóng Hoa thứ hai trễ 5s. |

- **Mã nguồn:** `js/characters/flower_shadow/logic.js`, `js/characters/flower_shadow/render.js`

### 50. Kiếm Vũ (`kiem_vu`)

HP:1.5 | Dame:1.5 | Đạn:1 (Bản Mệnh Kiếm). Nhấp: phóng kiếm tới trục X của địch rồi cắm xuống; nhấp lần 2: thu kiếm về (dame cả 2 lượt). Chỉ phóng được khi kiếm trên tay hoặc đã thu về nửa sân mình (đang bay về mà qua giữa sân -> nhấp để phóng lại ngay). Đứng yên tích Tâm Định (chỉ hồi sau 1.25s không dùng kỹ năng / tiêu Tâm Định): trúng đòn khi đứng yên (≥25%) -> phản đạn & Tập Trung 0.5s (đạn tiếp theo tự phản). Phản đạn tích Sát Ý; đầy 100% -> Tâm Kiếm hitscan xuyên Khiên & Tường.

- **Chỉ số thực đầu hiệp:** HP 1.5 · Sát thương 1.5 · Đạn ∞ · Tốc độ 3.5 · Kích thước 28×28
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Tâm Nhãn (`evo_kv_1`) | $100 | Tâm Định đầy nhanh hơn (0.8s, vẫn chờ 1.25s sau khi dùng kỹ năng), +50% Sát Ý mỗi lần phản đạn. Bản Mệnh Kiếm cắm trên sân địch tỏa kiếm khí làm chậm đối thủ đi ngang qua. |
  | Lưu Thủy Phản Chiếu (`evo_kv_2`) | $120 | Tập Trung kéo dài 1.0s. Đạn phản bay thẳng chuẩn xác về phía địch. Vẫn điều khiển Bản Mệnh Kiếm khi đang Tập Trung. FULL EVO (Vạn Kiếm Quy Tâm): kiếm bay nhanh hơn, dame x1.15 + Chảy Máu; đi ngang chậm khi Tập Trung; mỗi 5 lần Điều Kiếm, lần kế tiếp triệu hồi 4 Kiếm Phụ tấn công rồi tự thu về. |

- **Mã nguồn:** `js/characters/kiem_vu/logic.js`, `js/characters/kiem_vu/render.js`

### 51. T-Zero (`t_zero`)

HP:6 (+2 xe lớn) | Dame:1 | Năng Lượng | Tốc: 0.9x. "Hệ Thống KÍCH HOẠT: T-ZERO ON". Giữ nhẹ Bắn 0.25s đổi Thiết Luật: THỦ (ném Khiên Boomerang 5% NL; khiên trên tay phản đạn địch 15%+dame×10% NL) -> CÔNG (tăng tốc & dame, lao đấm như Xe TANK 10% NL) -> THIÊN LUẬT THỨC (bay lên 25% NL, duy trì 9%/s và GẤP ĐÔI mỗi 2.5s bay, không thể bị bắn, tự dội pháo; nhấp lần nữa -> tâm ngắm KHÓA 0.5s rồi đáp xuống nổ choáng; đáp xong chờ 2.5s mới bay lại). Mỗi lần tiêu hao khóa hồi NL 1s.

- **Chỉ số thực đầu hiệp:** HP 8 · Sát thương 1 · Đạn — (năng lượng riêng) · Tốc độ 3.15 · Kích thước 34×34
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Năng Lượng Xanh (`evo_tzero_1`) | $90 | Hồi NL nhanh hơn mạnh (sau 1s nghỉ). Giảm mọi tiêu hao: Ném khiên 3%, Phản đạn 10% + dame×7%, Đấm 7%, Bay lên 18% và duy trì 6%/s (vẫn gấp đôi mỗi 2.5s bay). |
  | Trạng Thái Hủy Diệt (`evo_tzero_2`) | $120 | THỦ: khiên to & nhanh hơn, để lại vệt điện làm chậm. CÔNG: cú đấm tạo sóng xung kích nổ lan phía trước & phá đạn địch trên đường lao. THIÊN: dội pháo dày hơn, đáp xuống để lại vùng từ trường đốt máu & hút địch. FULL EVO: định kỳ phóng tên lửa tầm nhiệt bay RẤT chậm, rẽ nhẹ (né được; đạn địch bắn hạ được) và tên lửa KHÔNG KÍCH vút lên trời, hiện ra ở cạnh trái/phải mục tiêu rồi bay chậm dọc làn tới vòng cảnh báo (2s, thấy rõ đường bay) mới cắm xuống; THỦ: khi khiên đang bay tự xả Tiểu Liên (1% NL/s). |

- **Mã nguồn:** `js/characters/t_zero/logic.js`, `js/characters/t_zero/render.js`

### 52. Raven - Oca (`raven_oca`)

"Cuộc săn bắt đầu, Oca tìm chúng!" HP:4 | Dame:0.5 (Tiểu Liên) / 4 (Sniper) | Đạn:10 / 4 | Tốc: 3.8. Giữ Bắn 0.4s đổi súng (hồi 4s). TIỂU LIÊN: nhấp xả loạt 3 viên; đổi sang -> lướt ngang. SNIPER: nhấp -> đứng yên ngắm 0.4s rồi bắn đạn cực nhanh; đổi sang -> thả Bom Khói 2s (đứng trong khói né mọi đạn). OCA (máu = 50% Raven, tự hồi sinh): khi cầm Tiểu Liên thì tàng hình, định kỳ lao cắn địch gây dame + làm chậm; khi cầm Sniper thì bay cao đánh dấu radar -> đạn Sniper tự khóa mục tiêu, xuyên vật thể & bay nhanh hơn.

- **Chỉ số thực đầu hiệp:** HP 4 · Sát thương 0.5 · Đạn 10 · Tốc độ 3.8 · Kích thước 26×26
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Chiến Thuật Đặc Nhiệm (`evo_raven_1`) | $100 | Đạn Răng Cưa: mọi viên đạn (cả 2 súng) gây Chảy Máu. Khói Đặc Quánh: Bom Khói +2s (4s). Bộ Pháp Xung Kích: cầm Tiểu Liên tăng mạnh tốc độ. Thay Đạn Tức Thì: đổi súng là nạp đầy băng súng mới. |
  | Hỏa Lực Không Kích (`evo_raven_2`) | $120 | Oca máu 80% Raven & định kỳ hiện vòng cảnh báo đỏ rồi thả Bom xuống địch. Tiểu Liên xả loạt 5 viên, băng 15. Sniper bay nhanh hơn, mạnh hơn & gây Trọng Thương: máu bị mất do Sniper không thể hồi trong 10s. FULL EVO: Oca Bất Tử (không bị tiêu diệt, không chặn đạn), đổi súng hồi 2s, Oca vừa lao cắn làm chậm vừa thả mưa bom liên hoàn vừa giữ khóa mục tiêu vĩnh viễn cho cả 2 súng. |

- **Mã nguồn:** `js/characters/raven_oca/logic.js`, `js/characters/raven_oca/render.js`

### 53. Tia Lazer (`lazer_beam`)

HP:3 | Dame:0.2/tick (6 tick/s) | Năng Lượng | Tốc: 3.8. Giữ Bắn: tích tụ 0.5s -> cảnh báo 0.5s -> chiếu tia liên tục (chậm khi chiếu, tụt Năng Lượng; nghỉ 0.5s mới hồi). Tường Sniper địch chặn tia.

- **Chỉ số thực đầu hiệp:** HP 3 · Sát thương 0.2 · Đạn — (năng lượng riêng) · Tốc độ 3.8 · Kích thước 28×28
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Năng Lượng Xanh (`evo_beam_1`) | $40 | Tích tụ khởi động chỉ 0.125s. Chiếu tia tiêu hao chậm hơn, hồi Năng Lượng nhanh hơn. |
  | Khuếch Đại Nhiệt Quang (`evo_beam_2`) | $90 | Tia phình rộng dần khi chiếu lâu. Trúng liên tục -> sát thương tăng tiến (tới x2.5) & Thiêu Đốt. FULL EVO: Quá Tải Quang Học — không còn giảm tốc khi chiếu; mỗi 2s chiếu liên tục phóng thêm 1 Tia Bùng Nổ (1.5 dmg). |

- **Mã nguồn:** `js/characters/lazer_beam/logic.js`, `js/characters/lazer_beam/render.js`

### 54. Y Sư (`healer`)

HP:3.5 | Dame:0.75 | Đạn:4 | Tốc: 3.5. "Hồi Phục": 3s không mất máu +0.5 HP. Đạn Hấp Huyết +0.25 HP (hồi 20s). Mọi lượng máu được hồi nạp Năng Lượng Sinh Mệnh -> đầy: phát kế tiếp là Đạn Cường Hóa (50% MaxHP + dame, nổ lan).

- **Chỉ số thực đầu hiệp:** HP 3.5 · Sát thương 0.75 · Đạn 4 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Hồi Phục Vượt Ngưỡng (`evo_heal_1`) | $90 | Đầy máu: lượng hồi dư chuyển thành Giáp Trắng (tối đa 4 + 50% MaxHP), đỡ đòn trước máu. Đạn Cường Hóa mạnh hơn (65% MaxHP, nổ lan 30%). |
  | Nghịch Lý Y Đạo (`evo_heal_2`) | $110 | Mỗi lần được hồi máu (mọi nguồn, kể cả vào Giáp Trắng) phóng 1 Tia Xung tự ngắm gây dame = lượng vừa hồi. Giảm Năng Lượng cần cho Đạn Cường Hóa. FULL EVO: Bất Tử Y Thần — Tái Tạo nhanh gấp đôi (1.5s); đạn gắn ấn Kháng Hồi Phục 5s: địch hồi máu bị cướp sang bạn; Đạn Cường Hóa = 100% MaxHP + dame. |

- **Mã nguồn:** `js/characters/healer/logic.js`, `js/characters/healer/render.js`

### 55. Chrono & Neo (`chrononeo`)

"Hai thời đại, một dòng chảy!" HP:4.5 | Dame:1 | Đạn:3 (Chrono) / 8 (Neo) | Tốc: 3.3. THAM FARM: phá thùng, xe tiền, triệu hồi địch & qua mỗi hiệp -> băng đạn tăng vĩnh viễn (Chrono 3->7, Neo 8->14). Giữ Bắn 0.4s đổi thế (hồi 6s), 2 băng riêng (băng kia tự nạp ngầm). CHRONO: đạn đồng x1.5 xuyên vật cản, Xé Giáp; vào thế -> sóng đẩy lùi + giảm 25% sát thương 1.5s. NEO: nhấp bắn 2 viên x0.75, nhanh hơn; vào thế -> lướt ngang +40% tốc 1.5s. THỜI KHẮC: giữ 1 thế 4s -> phát kế tiếp cường hóa: Chrono radar khóa mọi mục tiêu & xả cả băng đạn tự tìm (không thể cản phá); Neo chùm 6-8 viên hình nón (Xé Giáp, chậm 35%) + Ảnh Chiếu bất tử 5s tự bắn.

- **Chỉ số thực đầu hiệp:** HP 4.5 · Sát thương 1 · Đạn 3 · Tốc độ 3.3 · Kích thước 28×28
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Bước Thời Gian (`evo_cn_1`) | $100 | Thời Khắc chỉ cần giữ thế 2.5s. Đổi Thế Hoàn Hảo: đổi thế trong 3s sau đòn Thời Khắc -> băng thế mới nạp đầy ngay; nếu đang có Ảnh Chiếu -> hoán đổi vị trí với nó. |
  | Dòng Chảy Hội Tụ (`evo_cn_2`) | $120 | Đầu hiệp +2 đạn Chrono / +3 đạn Neo; điểm Thời Đại từ thùng & xe tiền x2. Liên Xạ +2 viên, viên cuối nổ choáng 0.5s. Mưa Đạn bắn 2 đợt, Ảnh Chiếu 8s bắn đạn làm chậm. FULL EVO: Liên Hoa Thời Gian — băng tối đa ngay (7/14), đổi thế hồi 4s; Phân Thân Nghịch Đảo (AI cầm thế ngược trên làn bạn, đổi thế đồng bộ kèm hiệu ứng); cứ 2 lần Thời Khắc -> 2.5s bão đạn Liên Hoa rồi 3 cột đại pháo Nở Rộ (có cảnh báo, có khe để né). |

- **Mã nguồn:** `js/characters/chrononeo/logic.js`, `js/characters/chrononeo/render.js`

### 56. Gemini (`gemini`)

"Hai cá thể, một ý thức!" HP:3.5 x2 xe | Dame:0.75 | Đạn:4 | Tốc: 3.6. Làn của bạn có thêm Bản Sao AI (chỉ số 100% như bạn, kể cả module chân) tự né đạn, phá thùng/xe tiền & bắn địch. Về 0 HP -> GỤC: đồng đội đứng trong Vòng Cứu 2s để hồi sinh 50% HP (rời vòng >1s thanh tụt; mỗi lần cứu thời gian x2). Chỉ thua khi CẢ HAI cùng gục. Giữ Bắn 0.4s: Chuyển Giao Ý Thức — đổi quyền điều khiển sang xe kia (hồi 3s).

- **Chỉ số thực đầu hiệp:** HP 3.5 · Sát thương 0.75 · Đạn 4 · Tốc độ 3.6 · Kích thước 26×26
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Liên Kết Thần Kinh (`evo_gem_1`) | $90 | AI phối hợp: giữ giãn cách tránh nổ lan, bắn ép góc, ưu tiên chạy lại cứu bạn (bám vòng cứu). Chuyển Giao hồi chỉ 1.2s; thanh cứu không bị tụt khi rời vòng. Vòng cứu rộng +50%; lần cứu đầu tiên mỗi hiệp chỉ 1s và không tính nhân đôi. |
  | Đệ Quy Vô Tận (`evo_gem_2`) | $120 | Cả 2 xe tăng dần tốc chạy & tốc bắn theo thời gian giao tranh; mỗi hiệp đã qua cộng dồn +0.25 MaxHP, +6% dame, đạn to hơn (tối đa 8 tầng). Sau Chuyển Giao: 1s cả 2 xe +50% tốc chạy, x1.8 tốc bắn, x1.3 dame. FULL EVO: Siêu Trí Tuệ Song Hành — AI tối thượng (tự cân đối cứu / kết liễu); lần gục đầu tiên của mỗi xe tự khởi động lại, các lần sau thanh cứu tự tăng tới 99% (chạm là dậy); 0.5s sau Chuyển Giao mọi đạn của 2 xe tự khoá mục tiêu. |

- **Mã nguồn:** `js/characters/gemini/logic.js`, `js/characters/gemini/render.js`

## Phụ lục: cơ chế các body mới

### Kiếm Khách — Bài Tập Luyện Kiếm
- Shop có nút **📜 LUYỆN KIẾM**: mỗi hiệp nhận 1 lượt chọn bài (Evo 2: 2 lượt, Full Evo: 4). Hiệp 1 tự nhận *Mưa Kiếm I* + *Mài Kiếm*.
- **Kỹ năng:** Mưa Kiếm I–III (+1/2/3 kiếm mỗi loạt) · Kiếm Vũ I–III (bắn chùm) · Phá Trời (xuyên) · Kiếm Ảnh I–III (Tập Trung: kiếm x2 tốc, +1/2/3s) · Bảo Kiếm (Tập Trung: vô hạn đạn, giữ để xả; cần 3 bài kỹ năng).
- **Chỉ số (làm lại được, yêu cầu tăng dần):** Thối Thể (+1 HP) · Mài Kiếm (+0.25 dmg) · Tích Lũy (+50$) · Bộ Pháp (+0.2 tốc) · Băng Đạn (+1 đạn).
- **5 Bài Cuối (Full Evo):** Vân Tinh Vũ · Phân Ảnh · Phá · Kiếm Thế Cường · Cơ Hội Cuối → xong cả 5 thành **Hóa Thần**.
- Evo 1 giảm 50% yêu cầu; Full Evo giảm còn 35%.

### Bình Phun — Lớp phủ
| Chất | Khi đang phủ | Đầy 100% |
|---|---|---|
| Lửa | Thiêu 0.25 HP/s | Nổ 5 dmg (Full: 7, lan rộng) |
| Axit | Ăn mòn 1.25% HP tối đa/s, Suy Yếu tới +30% sát thương nhận | Câm Lặng đến khi tụt dưới 99% (Full: +1s) |
| Băng | 0.125 HP/s, chậm dần tới -60% | Đóng băng 2s (Full: 2.5s), còn 25% |

Luồng phun bị chặn bởi Tường Sniper, thanh cản, tường thành, Xe Tiền, Khiên Thép, Khối Đá. Axit làm tan vật cản/ụ súng rất nhanh, Lửa đốt nổ vật cản, Băng làm chậm vật cản di động.

### Tùy Biến — Điểm Tùy Chỉnh (CP)
- Mỗi hiệp +1 CP; thắng +1; thua liên tiếp ≥2 hiệp +2; Evo 2 +1. Mỗi mô-đun tốn 1 CP.
- Lối Bắn: Tap / Shotgun / SMG / Tích Tụ / Hold (tia) / Tiến Công (lao húc). Dạng Đạn: Tròn / Thẳng / Kiếm / Pháo.
- Tính chất (cộng dồn): Nổ, Xuyên, 1 loại Vùng (Axit/Băng/Lửa/Câm Lặng), Hitscan. VIP (Evo 1): Tự Ngắm, Đạn Hút, Nảy Tường.
- Kích thước: Thu Nhỏ (24×24, +30% tốc, -1 HP) / Phóng To (38×38, -20% tốc, +4 HP). Full Evo: chọn 1 Nội Tại độc quyền.

### Kiếm Sư — 15 phản ứng Ngũ Hành (Evo 2)
| Nhóm | Phản ứng |
|---|---|
| Đồng nguyên tố | Kim+Kim: kiếm to xuyên +1 dmg · Mộc+Mộc: hồi 0.5 HP, +20% tốc 2s · Thủy+Thủy: khiên nước, vỡ đẩy lùi · Hỏa+Hỏa: nổ x2, xóa đạn địch · Thổ+Thổ: đá x2 máu & thời gian |
| Tương sinh | Kim+Thủy: hồi 0.5 HP + 2 đạn · Thủy+Mộc: rễ lan rộng hút máu · Mộc+Hỏa: biển lửa 3s · Hỏa+Thổ: tường nham thạch phản đòn · Thổ+Kim: +30$, 3 phát nhanh hơn 40% |
| Tương khắc | Kim+Mộc: gai gây Chảy Máu · Mộc+Thổ: xuyên & phá vật cản nhân tạo · Thổ+Thủy: đầm lầy -70% tốc · Thủy+Hỏa: hơi nước làm mù HUD 1.5s · Hỏa+Kim: Câm Lặng 1.5s |

## Cửa hàng riêng

### ⚙ Chợ Linh Kiện — Nhà Phát Minh

| Món | ID | Nhóm | Giá (LK) | Cấp tối đa | Hiệu ứng |
|---|---|---|---:|---:|---|
| Bộ Đàm | `inv_bodam` | body | 1 | 3 | Tốc chạy +10%, Drone hồi sinh nhanh hơn 0.5s. |
| Giáp Hợp Kim | `inv_giap` | body | 3 | 1 | +1 Max HP. Nhặt Crate nhận Giáp Ảo tồn tại 5s. |
| Tăng Cường HT | `inv_tangcuong` | body | 5 | 1 | +2 Đạn. Đạn chủ thừa hưởng hiệu ứng của Drone. |
| Lưới Điện | `inv_luoidien` | body | 4 | 1 | Đứng yên 2s tạo lưới chặn đạn -> 1 LK (CD: 12s). |
| Ép Xung | `inv_epxung` | body | 5 | 1 | Giữ S: Câm lặng mình 4s, Drone +50% tốc, x2 tốc bắn (CD: 15s). |
| Pháo Drone | `inv_phao` | drone | 2 | 1 | Mỗi 3s bắn đạn nổ lan AoE diện rộng. |
| Khiên Chắn | `inv_khien` | drone | 5 | 1 | Drone hồi 1 Khiên bảo vệ chủ mỗi 20s. |
| Tăng Số Đạn | `inv_dan` | drone | 1 | 3 | +1 viên đạn cho Drone mỗi loạt bắn. |
| TB Ổn Định | `inv_ondinh` | drone | 1 | 3 | Tăng tốc bắn & tốc bay qua lại của Drone. |
| Thiết Bị Ngắm | `inv_ngam` | drone | 3 | 1 | Drone tự ngắm xoay nòng vào kẻ địch. |
| Nhiễu Sóng | `inv_nhieu` | drone | 3 | 1 | Đạn làm chậm, tích 3 hit choáng 1.5s. |
| Bộ Hồi Phục | `inv_hoiphuc` | drone | 5 | 1 | Tự hồi 1 HP cho chủ thể mỗi 5s. |
| Drone Tiểu Liên | `inv_smg` | drone | 4 | 1 | Mỗi 5s xả 12 viên đạn tỏa nón như SMG. |
| Drone Laser | `inv_lazer` | drone | 4 | 1 | Đạn đổi thành Laser xuyên tường & vật thể. |
| Drone Pháo Băng | `inv_bang` | drone | 4 | 1 | Mỗi 4s bắn cầu băng tạo vùng làm chậm. |
| Drone Lửa | `inv_lua` | drone | 4 | 1 | Mỗi 4s bắn cầu lửa tạo vùng thiêu đốt. |
| Tụ Gió (Evo 2) | `inv_tugio` | evo2 | 4 | 1 | Mỗi 2s chém nát đạn địch bay tới. |
| Khiên Drone (Evo) | `inv_khien_drone` | evo2 | 2 | 3 | Tăng máu, giáp ảo trực tiếp cho Drone. |
| Nâng Cấp Cuối Cùng | `inv_full_evo` | fullevo | 15 | 1 | FULL EVO: 4 Drone (200% chỉ số), giảm 60% CD nòng phụ, xe chủ tích hợp toàn bộ vũ khí! |

### 🤖 Chợ Đen Robot — Thiên Tài

| Món | ID | Hiệu ứng |
|---|---|---|
| Gia Cố Thân Vỏ | `gen_hp` | +3 Máu Robot |
| Lõi Xung Kích | `gen_dmg` | +0.25 Sát Thương Robot |
| Pin Lượng Tử | `gen_energy` | +15 Năng Lượng Tối Đa |
| Động Cơ Turbo | `gen_speed` | +15% Tốc Độ Di Chuyển Robot |
| Tụ Điện Phục Hồi | `gen_regen` | +1 Năng Lượng Hồi Phục/s |
| Đạn Hàn Băng | `gen_slow` | Đạn làm chậm đối thủ 40% trong 2s |
| Đạn Nhiệt Hạch | `gen_fire` | Đạn gây thiêu đốt trong 3s |
| Ngòi Nổ Phá Khối | `gen_explosive` | Tăng 50% bán kính nổ đạn |
| Lá Chắn Khởi Đầu | `gen_shield` | Bắt đầu trận có 1 lớp khiên chặn 1 đòn |
