# 📋 Việc còn lại (TODO)

> Danh sách các yêu cầu **chưa làm / đang làm dở**. Làm xong mục nào thì xoá khỏi đây và ghi vào `docs/BODIES.md`.
> Thứ tự = thứ tự ưu tiên. Mỗi lần chỉ làm 1 mục để tiết kiệm token.
> Phiên mới: đọc `docs/HANDOVER.md` trước (công cụ test ở `tools/`).

## 0. Chỉnh sửa gấp (làm TRƯỚC mục 1)
- [x] Hệ thống 150 Lõi Công Nghệ G.E.A.R (`#1 – #150`), lọc theo giai đoạn (`EARLY`, `EARLY_MID`, `MID_LATE`, `ALL`), khóa dòng (`familyId`), khóa chéo (`incompatibleWith`), nút Đổi lại (`🔄 ĐỔI LẠI`) từng ô nâng cấp và chặn bấm Bắn bỏ qua chọn G.E.A.R (chi tiết: `NOTE_Antigravity.md`).
- [x] Nâng cấp Phòng Tập (Sandbox 2.0): Hệ thống Test Box & Xe Bản Đồ (`#sandboxBoxModal` với đủ 16 loại thùng Gacha + 9 loại xe/vật thể, 5 chế độ thả/kích nổ tức thì), bộ lọc Hệ/Vai trò + Tìm kiếm + Preset Evo cho 67 Body, nút Đổi Evo nhanh trên sân, Đổi Map trực tiếp, Khóa thùng tự nhiên, Bạn Bất Tử, Vô Hạn Đạn, Test Kết Liễu, Mở Shop, Dọn Sân (chi tiết: `NOTE_Antigravity.md`).
- [x] Cân bằng Kinh Tế & Phân Tầng Giá Tiến Hóa (`js/data/evolutions.js`, `js/game/shop-ui.js`, `js/game/round.js`, `js/game/combat.js`, `js/ai/smart-bot.js`): Phân 4 bậc giá Evo (`$60–$140` Đầu trận / `$150–$270` Chiến thuật / `$280–$360` Cuối trận / `$380–$480` Phá game), nâng cấp Lợi Tức kèm Lãi Tiết Kiệm (+15% tiền giữ trong ví/tầng), tăng thưởng Thùng Xu (`$35`) & Xe Tiền (`$50`), và dạy AI Bot tiết kiệm tiền mua Evo (chi tiết: `NOTE_Antigravity.md`).
- G.E.A.R — kết quả kiểm tra (đã sửa: crash đạn xuyên thiếu hitIds; Sandbox chồng triệu hồi khi bật/tắt lõi; #106 online không cộng $200; thêm code #55/#94/#96; sửa #112 tạo `BodyZone` axit; sửa #119 đi qua `takeDamage`; khóa nhận thưởng lặp khi bật/tắt lõi trong Sandbox; dọn sạch 14 chỗ `hasGear` ID cũ). Còn lại:
  - Thiếu hình ảnh: Giáp Trắng (`gearWhiteShield`) không vẽ; #127 đường ray, #138 vùng Bullet Time, #45 màng hấp thụ, #141 buff Hộp Bí Ẩn, #119 không có phản hồi; #116/#81/#137/#108/#115 hình sơ sài; các buff theo thời gian/cộng dồn không có chỉ báo (#23 #24 #136 #142 #51 #52 #53 #59 #98 #148).
- 5 body mới (đặc tả `docs/BODY_MOI_3.md`), làm từ dễ đến khó, xong cái nào push cái đó: ~~Nhện Độc~~ ✅ → ~~Boomerang~~ ✅ → ~~Thợ May~~ ✅ → ~~Siêu Năng~~ ✅ → ~~Kusarigama~~ ✅.
- Nhóm Cờ Bạc + 2 body mới (đặc tả `docs/BODY_MOI_4.md`): ~~nội tại Cờ Bạc~~ ✅; ~~Jack - 6 Lỗ~~ ✅; COC (`coc`).
- Sau đó: thêm hiệu ứng kết liễu cho mọi body còn thiếu (trừ Cơ Bản); chữ thắng hiệp ("PLAYER X THẮNG") chỉ hiện sau khi kết liễu kết thúc 3s.
- Còn lại: các mục bên dưới.


## 3. Ghi chú / cần xác nhận
- Shotgun Evo 1: đang làm **mọi** phát bắn đều có đợt hai 3 viên. (Đúng đã sát nhận)
- Tường Sniper chặn cả Đạn Lớn Full Evo (dù Đạn Lớn "xuyên mọi vật cản").(Đúng)
- Gemini: AI mệt dần khi né nhiều, né kém đòn tia; đòn đặc biệt trúng xe AI. Mô phỏng: cơ bản 59%, Full Evo 75% (vẫn hơi cao) — cần chơi thử.
- Cuồng Phong: Lôi Bão gây 9.6–14.5 sát thương lên địch đứng yên (đúng theo số đặc tả nhưng có thể quá mạnh) — cần chơi thử.
- Boomerang Full Evo ~1.8 sát thương/s lên mục tiêu đứng yên — có thể hơi mạnh, cần chơi thử.
- Siêu Năng Full Evo: Khóa Tâm có thể gây ~25 sát thương nếu địch xả liên tục vào vùng — cần chơi thử.
- Thợ May Full Evo: Rút Chỉ ~4.2–4.5 sát thương mỗi 4.5s — cần chơi thử.
- Phi Công thắng ~68-72% trong mô phỏng bot (hơi mạnh) — cần chơi thử, có thể giảm sát thương tự ngắm của Phi Ảnh / tần suất ném bom.
- Online: đã sửa xe P2 bên khách bị giật/nhảy (dự đoán đầu vào), mốc thời gian, thanh máu đỏ, vòng HUD lệch khi rung màn hình — cần chơi thử thật 2 máy. Xe P1 bên khách còn hơi bước nhảy (~30 lần/s).
## 4. Y Cầu Cân bằng/chỉnh sửa
