# 📋 Việc còn lại (TODO)

> Danh sách các yêu cầu **chưa làm / đang làm dở**. Làm xong mục nào thì xoá khỏi đây và ghi vào `docs/BODIES.md`.
> Thứ tự = thứ tự ưu tiên. Mỗi lần chỉ làm 1 mục để tiết kiệm token.
> Phiên mới: đọc `docs/HANDOVER.md` trước (công cụ test ở `tools/`).

## 0. Chỉnh sửa gấp (làm TRƯỚC mục 1)
- [x] Hệ thống 150 Lõi Công Nghệ G.E.A.R (`#1 – #150`), lọc theo giai đoạn (`EARLY`, `EARLY_MID`, `MID_LATE`, `ALL`), khóa dòng (`familyId`), khóa chéo (`incompatibleWith`), nút Đổi lại (`🔄 ĐỔI LẠI`) từng ô nâng cấp và chặn bấm Bắn bỏ qua chọn G.E.A.R (chi tiết: `NOTE_Antigravity.md`).
- G.E.A.R — kết quả kiểm tra (đã sửa: crash đạn xuyên thiếu hitIds; Sandbox chồng triệu hồi khi bật/tắt lõi; #106 online không cộng $200). Còn lại:
  - Lõi chưa có code: #55 `gear_ctrl_zone_s`, #94 `gear_hero_time_g`, #96 `gear_hero_dj_g`; #56 thiếu phần +30% kích thước vùng.
  - #112 Dịch Hạch tạo `AcidPool` không tồn tại → vũng không bao giờ xuất hiện.
  - #119 Đốt Hồn trừ thẳng `hp` (bỏ qua takeDamage: không số sát thương, bỏ qua khiên/bất tử, không kết liễu được).
  - Sandbox: bật/tắt lõi tiền/lãi thì nhận thưởng lại nhiều lần.
  - ~14 chỗ `hasGear('...')` trỏ tới id không tồn tại (đổi tên?).
  - Thiếu hình ảnh: Giáp Trắng (`gearWhiteShield`) không vẽ; #127 đường ray, #138 vùng Bullet Time, #45 màng hấp thụ, #141 buff Hộp Bí Ẩn, #119 không có phản hồi; #116/#81/#137/#108/#115 hình sơ sài; các buff theo thời gian/cộng dồn không có chỉ báo (#23 #24 #136 #142 #51 #52 #53 #59 #98 #148).
- 5 body mới (đặc tả `docs/BODY_MOI_3.md`), làm từ dễ đến khó, xong cái nào push cái đó: ~~Nhện Độc~~ ✅ → ~~Boomerang~~ ✅ → Thợ May (`tailor`) → Siêu Năng (`psychokinesis`) → Kusarigama (`kusarigama`).
- Nhóm Cờ Bạc + 2 body mới (đặc tả `docs/BODY_MOI_4.md`): nội tại Cờ Bạc (Joker/Jack/COC: Reroll shop miễn phí lần đầu mỗi hiệp, +1 ô lựa chọn); Jack - 6 Lỗ (`jack_6_lo`); COC (`coc`).
- Sau đó: thêm hiệu ứng kết liễu cho mọi body còn thiếu (trừ Cơ Bản); chữ thắng hiệp ("PLAYER X THẮNG") chỉ hiện sau khi kết liễu kết thúc 3s.
- Còn lại: các mục bên dưới.


## 3. Ghi chú / cần xác nhận
- Shotgun Evo 1: đang làm **mọi** phát bắn đều có đợt hai 3 viên. (Đúng đã sát nhận)
- Tường Sniper chặn cả Đạn Lớn Full Evo (dù Đạn Lớn "xuyên mọi vật cản").(Đúng)
- Gemini: AI mệt dần khi né nhiều, né kém đòn tia; đòn đặc biệt trúng xe AI. Mô phỏng: cơ bản 59%, Full Evo 75% (vẫn hơi cao) — cần chơi thử.
- Cuồng Phong: Lôi Bão gây 9.6–14.5 sát thương lên địch đứng yên (đúng theo số đặc tả nhưng có thể quá mạnh) — cần chơi thử.
- Boomerang Full Evo ~1.8 sát thương/s lên mục tiêu đứng yên — có thể hơi mạnh, cần chơi thử.
- Phi Công thắng ~68-72% trong mô phỏng bot (hơi mạnh) — cần chơi thử, có thể giảm sát thương tự ngắm của Phi Ảnh / tần suất ném bom.
- Online: đã sửa xe P2 bên khách bị giật/nhảy (dự đoán đầu vào), mốc thời gian, thanh máu đỏ, vòng HUD lệch khi rung màn hình — cần chơi thử thật 2 máy. Xe P1 bên khách còn hơi bước nhảy (~30 lần/s).
## 4. Y Cầu Cân bằng/chỉnh sửa
