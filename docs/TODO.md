# 📋 Việc còn lại (TODO)

> Danh sách các yêu cầu **chưa làm / đang làm dở**. Làm xong mục nào thì xoá khỏi đây và ghi vào `docs/BODIES.md`.
> Thứ tự = thứ tự ưu tiên. Mỗi lần chỉ làm 1 mục để tiết kiệm token.
> Phiên mới: đọc `docs/HANDOVER.md` trước (công cụ test ở `tools/`).

## 0. Chỉnh sửa gấp (làm TRƯỚC mục 1)
- Nam Châm: không bị hiệu ứng từ của chính mình hút/đẩy; tách Nhiễm Từ (chạm vùng từ, chỉ là dấu) và Ấn Từ (bắn trúng trực tiếp, tồn tại lâu, tạo vùng từ quanh địch); bấm bắn khi phía trước có mục tiêu khác cực: Cột → lao tới húc nổ như TANK rồi về chỗ cũ; địch có Ấn Từ → cả hai bị hút vào giữa map va chạm gây sát thương rồi rơi về chỗ cũ.
- Hoa Ảnh cải thiện hiệu ứng hơn nữa đặc biệt là rút về vị trí cũ (hóa thành 1 tìa sáng hồng ra giật về vị trí cũng) (các hiệu ứng khác cũng mượt và đẹp hơn) (đặc biệt thêm hiệu ứng kết liễu)
- Phong trảm: lưỡi kiếm gió xấu quá giống cái mong quá (1 hình bán nguyệt xoay tròn thêm hiệu ứng được rồi

## 1. Body mới ưu tiên (phần Đồ họa đã XONG → làm tiếp mục này)
Đặc tả đầy đủ: **`docs/BODY_MOI_UU_TIEN.md`**. Làm lần lượt từng body (theo `tools/agents/common.md`), mỗi body xong thì gộp → smoke test → push:
- Kazuki (`kazuki`) — song kiếm, nhịp A/B → Kiếm Thế Quyết, Nghịch Trảm, Ý Niệm & Kiếm Ý.
- Tsukiyo (`tsukiyo`) — nhẫn giả 3 phong cách, Nhẫn Đạo theo mốc Tốc độ/Sát thương/Máu.
- Joker (`joker`) — tay bài 5 lá ngẫu nhiên, Joker, Thoát Hiểm.
- Juggernaut(`juggernaut`) — miễn nhiễm khống chế (Bá Thể).
- Pháo Phân Mảnh (`cluster_gun`) — 2 chế độ đạn Phân Mảnh / Dễ Vỡ.
- Nhân Bản (`clone`) — nhân bản không giới hạn + nội tại Gánh Chịu.
- Phi Công (`jet_pilot`) — tách Chân & Phi Ảnh, chuyển điều khiển, hợp nhất.


## 2. HUD còn sót
- DJ, Móc Thép, Thiên Tài (chữ BR/LK, chế độ Mecha), Tiến Hóa vẫn dùng chữ → đổi sang biểu tượng.
- Thanh riêng của Paradox, Ghost, Mirror, Phong Trảm bị thanh máu mới che một phần.
- UI shop đẹp hơn và (đặc biệt là các shop đặc trường từng xe) phải đẹp hơn
- Thêm UI thông báo Ghép nhanh đạn có ai đang ghép không
## 2.1 Hoạt Ảnh các vụ nổ và màu
- các vụ nổ cần có màu đặc trương và đẹp hơn

## 3. Ghi chú / cần xác nhận
- Shotgun Evo 1: đang làm **mọi** phát bắn đều có đợt hai 3 viên. (Đúng đã sát nhận)
- Pháo Cao Xạ: **có Evo bất kỳ** là nổ lặp 1 lần, Full Evo 2 lần.(Sai) **có Evo bất kỳ**  (chỉ tính Evo2) 
- Pháo Cao Xa: Full Evo bá quá nó tự đuổi mà còn rơi nhanh nữa không thể né (Full evo không tự đuổi nữa) bù lại nhiều tên lửa rơi xuống hơn
- Tường Sniper chặn cả Đạn Lớn Full Evo (dù Đạn Lớn "xuyên mọi vật cản").(Đúng)
- Bot Sấm Chớp chưa biết dùng Lôi Trảm;(đúng) bot DJ có thể mất đạn khi bấm hụt nốt.(không cần)
- Gemini Full Evo từng thắng 95% trong mô phỏng → đã giảm (AI cấp 4, bùng nổ x1.3); cần chơi thử. Một số đòn đặc biệt (tia riêng của body, Gojo...) chưa trúng xe AI của Gemini.) (AI sẻ dần chậm lại khi né quá nhiều hoặc sẻ chặm đi khi né các đòn lazer (giống người chơi thôi)
- Chưa thử thật chế độ Online cho các thay đổi gần đây.(Có rất nhiều lỗi về HUB bay loạn xạ và sai độ họa)
## 4. Y Cầu Cân bằng/chỉnh sửa
- Mốc Sát: khi nhấn giữ làm mốc bay nhanh hơn thì sẻ cần có Cảnh báo để có thể né và sẻ có 1 độ trể nhỏ
- Súng Nước khi có vồi rồng sẻ phung như tia lazer (phát đầu to mạnh sao đó thành vồi rồng sẻ phung như lazer)
- Bow: (Mưa tên (từ nội tại) các điểm cảnh báo xuất toàn map (không bị giới hạn) để người chơi có thể né (còn mưa tên nhất giữa để vậy được rồi)
- Các tướng Collap rất mạnh nên phân biệt với tương thường ở phần chọn tướng. NẾU bạn chọn **tướng Collap** đối thủ sẻ được bù 100-200 tiền đầu game tùy tướng.
- Cơ Bản ----> Nhân Vật Chính (MAIN)
