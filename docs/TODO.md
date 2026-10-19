# 📋 Việc còn lại (TODO)

> Danh sách các yêu cầu **chưa làm / đang làm dở**. Làm xong mục nào thì xoá khỏi đây và ghi vào `docs/BODIES.md`.
> Thứ tự = thứ tự ưu tiên. Mỗi lần chỉ làm 1 mục để tiết kiệm token.
> Phiên mới: đọc `docs/HANDOVER.md` trước (công cụ test ở `tools/`).

## 0. Chỉnh sửa gấp (làm TRƯỚC mục 1)
- Nhà Phát Minh: drone chưa có art mới.
- Cổng Không Gian: skill mở Cổng Bắn có CD 5s, giới hạn số cổng, chỉ mở bên sân mình (đối thủ né được); tăng giá Evo 2.
- Cuồng Chiến Binh: thêm thanh Nhiệt — sấy/bắn nhanh & nhiều thì nóng, quá nhiệt phải nghỉ.
- Nhà Ảo Thuật: tạo phân thân có khiên CD riêng 10s; Thoát Chết dịch chuyển chỗ khác, để lại 1 phân thân (1 lần/hiệp, Full Evo 2 lần); hiệu ứng mũ ảo thuật rơi từ trời khi phân thân & thoát chết.
- Nam Châm: không bị hiệu ứng từ của chính mình hút/đẩy; tách Nhiễm Từ (chạm vùng từ, chỉ là dấu) và Ấn Từ (bắn trúng trực tiếp, tồn tại lâu, tạo vùng từ quanh địch); bấm bắn khi phía trước có mục tiêu khác cực: Cột → lao tới húc nổ như TANK rồi về chỗ cũ; địch có Ấn Từ → cả hai bị hút vào giữa map va chạm gây sát thương rồi rơi về chỗ cũ.

## 1. Body mới ưu tiên (phần Đồ họa đã XONG → làm tiếp mục này)
Đặc tả đầy đủ: **`docs/BODY_MOI_UU_TIEN.md`**. Làm lần lượt từng body (theo `tools/agents/common.md`), mỗi body xong thì gộp → smoke test → push:
- Kazuki (`kazuki`) — song kiếm, nhịp A/B → Kiếm Thế Quyết, Nghịch Trảm, Ý Niệm & Kiếm Ý.
- Tsukiyo (`tsukiyo`) — nhẫn giả 3 phong cách, Nhẫn Đạo theo mốc Tốc độ/Sát thương/Máu.
- Kẻ Bất Khuất / Phá Xiềng (`juggernaut`) — miễn nhiễm khống chế (Bá Thể).
- Pháo Phân Mảnh (`cluster_gun`) — 2 chế độ đạn Phân Mảnh / Dễ Vỡ.
- Nhân Bản (`clone`) — nhân bản không giới hạn + nội tại Gánh Chịu.
- Phi Công (`jet_pilot`) — tách Chân & Phi Ảnh, chuyển điều khiển, hợp nhất.
- Thần Bài / Quái Đạo (`joker`) — tay bài 5 lá ngẫu nhiên, Joker, Thoát Hiểm.

## 2. HUD còn sót
- DJ, Móc Thép, Thiên Tài (chữ BR/LK, chế độ Mecha), Tiến Hóa vẫn dùng chữ → đổi sang biểu tượng.
- Thanh riêng của Paradox, Ghost, Mirror, Phong Trảm bị thanh máu mới che một phần.

## 3. Ghi chú / cần xác nhận
- Shotgun Evo 1: đang làm **mọi** phát bắn đều có đợt hai 3 viên.
- Pháo Cao Xạ: **có Evo bất kỳ** là nổ lặp 1 lần, Full Evo 2 lần.
- Tường Sniper chặn cả Đạn Lớn Full Evo (dù Đạn Lớn "xuyên mọi vật cản").
- Bot Sấm Chớp chưa biết dùng Lôi Trảm; bot DJ có thể mất đạn khi bấm hụt nốt.
- Gemini Full Evo từng thắng 95% trong mô phỏng → đã giảm (AI cấp 4, bùng nổ x1.3); cần chơi thử. Một số đòn đặc biệt (tia riêng của body, Gojo...) chưa trúng xe AI của Gemini.
- Chưa thử thật chế độ Online cho các thay đổi gần đây.
