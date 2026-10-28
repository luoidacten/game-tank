# 📋 Việc còn lại (TODO)

> Danh sách các yêu cầu **chưa làm / đang làm dở**. Làm xong mục nào thì xoá khỏi đây và ghi vào `docs/BODIES.md`.
> Thứ tự = thứ tự ưu tiên. Mỗi lần chỉ làm 1 mục để tiết kiệm token.
> Phiên mới: đọc `docs/HANDOVER.md` trước (công cụ test ở `tools/`).

## 0. Chỉnh sửa gấp (làm TRƯỚC mục 1)
- [x] Issue #1: khung ô Evo 2/3/4, tổ hợp Full Evo, Skill/Nộ, hai lõi Lăng Kính và body mẫu `big_bullet`; xem `docs/EVO_FRAMEWORK.md`. Nội dung MAIN và các body thí điểm còn lại làm ở giai đoạn sau.
- [x] Hệ thống 150 Lõi Công Nghệ G.E.A.R (`#1 – #150`), lọc theo giai đoạn (`EARLY`, `EARLY_MID`, `MID_LATE`, `ALL`), khóa dòng (`familyId`), khóa chéo (`incompatibleWith`), nút Đổi lại (`🔄 ĐỔI LẠI`) từng ô nâng cấp và chặn bấm Bắn bỏ qua chọn G.E.A.R (chi tiết: `NOTE_Antigravity.md`).
- [x] Nâng cấp Phòng Tập (Sandbox 2.0): Hệ thống Test Box & Xe Bản Đồ (`#sandboxBoxModal` với đủ 16 loại thùng Gacha + 9 loại xe/vật thể, 5 chế độ thả/kích nổ tức thì), bộ lọc Hệ/Vai trò + Tìm kiếm + Preset Evo cho 67 Body, nút Đổi Evo nhanh trên sân, Đổi Map trực tiếp, Khóa thùng tự nhiên, Bạn Bất Tử, Vô Hạn Đạn, Test Kết Liễu, Mở Shop, Dọn Sân (chi tiết: `NOTE_Antigravity.md`).
- [x] Cân bằng Kinh Tế & Phân Tầng Giá Tiến Hóa (`js/data/evolutions.js`, `js/game/shop-ui.js`, `js/game/round.js`, `js/game/combat.js`, `js/ai/smart-bot.js`): Phân 4 bậc giá Evo (`$60–$140` Đầu trận / `$150–$270` Chiến thuật / `$280–$360` Cuối trận / `$380–$480` Phá game), nâng cấp Lợi Tức kèm Lãi Tiết Kiệm (+15% tiền giữ trong ví/tầng), tăng thưởng Thùng Xu (`$35`) & Xe Tiền (`$50`), và dạy AI Bot tiết kiệm tiền mua Evo (chi tiết: `NOTE_Antigravity.md`).
- G.E.A.R — kết quả kiểm tra (đã sửa: crash đạn xuyên thiếu hitIds; Sandbox chồng triệu hồi khi bật/tắt lõi; #106 online không cộng $200; thêm code #55/#94/#96; sửa #112 tạo `BodyZone` axit; sửa #119 đi qua `takeDamage`; khóa nhận thưởng lặp khi bật/tắt lõi trong Sandbox; dọn sạch 14 chỗ `hasGear` ID cũ). Còn lại:
  - Thiếu hình ảnh: Giáp Trắng (`gearWhiteShield`) không vẽ; #127 đường ray, #138 vùng Bullet Time, #45 màng hấp thụ, #141 buff Hộp Bí Ẩn, #119 không có phản hồi; #116/#81/#137/#108/#115 hình sơ sài; các buff theo thời gian/cộng dồn không có chỉ báo (#23 #24 #136 #142 #51 #52 #53 #59 #98 #148).
- **Đợt chỉnh mới (làm TRƯỚC):**
  - Nhất Quyền: Đấm Thường gồng 0.35s, vạch cảnh báo đỏ khóa trục X lúc nhấp rồi mới phóng; giảm sát thương (dễ né, cần kỹ năng).
  - Siêu Năng (& Railgun sau này): vùng chặn hầu hết đạn đạo (đạn thường, đạn lớn, tên lửa, pháo, phi kiếm, cầu lửa/băng, mìn bay, kim khâu…); KHÔNG chặn hitscan/lazer (Evo 2 Siêu Năng mới chặn được hitscan, đổi 1s thời gian vùng / 1.0 dame) & cận chiến. Siêu Năng: địch lao cận chiến mặt đất chạm vùng → chặn tại rìa, 1.0 dame phản chấn, hất về làn, Choáng 1.25s (đòn từ trên trời như Thiên của Hoa Ảnh bỏ qua). Bảng chi tiết trong `docs/BODY_MOI_5.md`.
  - Thợ May: Song Búp Bê — Trắng (Hộ Mệnh, sân mình, HP 50%/Full 75% Max HP, gánh sát thương x2.0/Full x1.5, hồi máu ưu tiên búp bê, kim nối gây sát thương hồi +0.35/Full +0.55 HP cho búp bê) & Đen (Nguyền Rủa, làn địch; kim trúng → địch Choáng 0.75s (hồi 3.5s); dây chỉ qua búp bê đen → +40%/Full +65% sát thương dây & giật chỉ).
  - Các đòn lazer có cảnh báo: người bắn đứng yên tới khi hết cảnh báo (trừ Kiếm Tôn).
  - Kẻ Mạnh Nhất (`the_strongest`): lỗi input tấn công; Bành Trướng Lãnh Địa lâu hơn (4s đầu đứng yên, 1s cuối mới di chuyển); Tím (Hollow Purple) đẹp hơn, HUD thông báo, mạnh hơn.
  - Đầu Bếp = Sukuna (`sukuna`): nerf nặng (đang quá OP); không dùng được Fuga (mũi tên lửa) & Nhát Chém Thế Giới — sửa lỗi.
  - Kẻ Mạnh Nhất & Sukuna: không dùng được Hắc Thiểm — sửa lỗi.
  - Boomerang: nerf toàn diện; phạm vi sát thương & hiệu ứng khi bắt thành công.
  - Trối Chết (`death_lock`) buff: Tầng 3 Ràng Buộc → Khóa Cơ Động (cấm lướt/nhảy/lao/bay/dịch chuyển) tới khi hết ấn hoặc nổ tầng 4; trong Lồng Cấm Chế luôn bị Khóa Cơ Động (trừ Juggernaut).
- 6 body mới (đặc tả `docs/BODY_MOI_5.md`): The Clock (`the_clock`), The Adapter (`the_adapter`), Phản Chiếu (`prism`), Tỉnh (`tinh`), Wind (`wind`), Railgun (`railgun`). Idol: thiếu phần cơ chế chính — chờ người dùng gửi đủ.
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

## Thí điểm Evo 3/4 (issue #2)

Đã triển khai đúng 10 body trong comment cập nhật. Xem [báo cáo, số liệu và giới hạn kiểm chứng](EVO_PILOT_RESULTS.md). API body thí điểm: `js/game/evo-body-kit.js`; module riêng: `js/characters/<body>/evo.js`. Chơi thử thêm các matchup hồi máu/phản đòn và mạng WebRTC giữa hai máy.
