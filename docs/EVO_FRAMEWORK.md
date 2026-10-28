# Khung Evo 3/4 — giai đoạn 1

Theo issue #1 và toàn bộ comment, đặc biệt comment cập nhật luật ngày 28/10/2026. Body mẫu là **Đạn Lớn (`big_bullet`)**. Không triển khai Evo 3/4 hoặc hai Evo đặc biệt cho `basic`; `MAIN_EVO_RESERVED` chừa các ô cho giai đoạn sau. Bản MAIN hiện có vẫn nhận bồi thường khi xuất hiện.

## Quy tắc đã triển khai

- Mặc định tối đa 2 Evo thường. Thẻ Full Evo không chiếm ô; đủ bất kỳ 2 Evo mới được mua. Giá `FULL_EVO_GATE` giữ nguyên.
- `evoOrder` ghi thứ tự mua. `fullEvoCombo(p, body)` trả `1+2`, `1+3`, … theo hai Evo mua đầu; mua Evo thứ 3 không đổi tổ hợp. Gọi `hasFullEvo` để kiểm tra đã mở sức mạnh, vì helper tổ hợp chỉ cho biết cặp đang có.
- Lõi Lăng Kính **Tiến Hóa Lần Nữa** mở 3 ô; **Con Đường Tiến Hóa** mở 4 ô và thay thế lõi 3 ô cùng dòng. Không xuất hiện cho `basic` hoặc lượt chọn đầu trận.
- Đủ 4 Evo với Con Đường Tiến Hóa và đã mua Full Evo: tự nâng thành `1+2+3+4`. Bảng `FULL_EVO_COMBOS` giữ mô tả và các cờ cho từng body; tổ hợp chưa khai báo có phần chung +1 Max HP, +10% dame, +1 khiên đầu hiệp.
- Con Đường Tiến Hóa: mỗi Evo +12% dame, −4% sát thương nhận, +3% tốc, −7% thời lượng khống chế. Max HP theo **tổng mốc** +3/+5/+6/+10; giữ FEET cũ, cấm mua thêm trừ Lợi Tức. Số nằm tại `EVO_PATH_CONFIG`.
- Đối thủ nhận $200 và một lượt chọn lõi Vàng. Cờ chi trả được giữ theo Player, không sao chép từ loadout guest. Host chọn các ứng viên hợp lệ và duyệt lựa chọn của guest; không đủ ứng viên thì đổi lượt thành $100. MAIN hiện tại cũng nhận cơ chế bồi thường, không nhân đôi $200 vốn có của lõi #106.

## API cho body

Evo thường có `evoSlot: 1..4`. Evo 4 có `skill: { name, cooldown, ultimateName, ultimateTicks, rageTime, rageDamage }`; cooldown dùng giây, timer trên Player dùng tick 60 Hz. Body khác chưa khai báo Evo 3/4 không có thẻ/nút mới.

Các hook `CharHooks` nhận `this` và tham số `p` là người chơi:

- `skill(p)`, `ultimate(p)`: trả `false` để từ chối, không tiêu CD/Nộ.
- `ultimateReady(p)`: tùy chọn; `false` khóa Tuyệt Kỹ khi chưa đủ điều kiện, dù Nộ đầy.
- `rageGain(p, kind, amount)`: trả lượng Nộ thay thế; `undefined` giữ mặc định. Gọi `EvoSystem.gain(p, kind, amount)` cho sự kiện riêng.

Nộ lưu bằng số nguyên `rageUnits` (100 đơn vị = 1 Nộ), giới hạn 10000; `rage` là số nguyên hiển thị. Mặc định +4/s và +8 mỗi HP thực mất (khiên bằng nửa, tối đa 18/đòn). Body mẫu dùng +0.5/s, +8/nảy tường và +15/đạn nuốt. Nộ dừng khi choáng/băng/câm hoặc Ultimate đang hoạt động. Sang hiệp giữ floor(50% Nộ), reset CD; không đụng cơ chế hồi sinh hiện tại của MAIN.

`inputs.p1.k` / `inputs.p2.k` là phím Skill; mặc định Q và `/`, đổi tại `EVO_SKILL_KEYS`. Một lần nhấn chỉ kích một lần. Ultimate ưu tiên hơn Skill và dùng được khi Skill còn CD; CD tiếp tục chạy. Guest gửi input, host xử lý; Player và `BigPlanet` được đồng bộ qua `NetState`. `BigPlanet` nằm trong `NET_CLASSES`.

Nút 56px nằm sát Bắn (cách 8px), thành cặp đối xứng với hai nút di chuyển; P2 xoay 180°. Nộ là vòng ngoài, CD ở vòng trong; đầy Nộ đổi màu, thiếu điều kiện hiện khóa. Banner tên chiêu ở mép sân phía người tung, không che giữa sân. SmartBot nhấn Skill/Ultimate theo cùng input.

## Đạn Lớn

- Evo 3 **Ôm Bóng**, $140: giữ Bắn để ôm cầu, tốn một đạn; cầu nuốt đạn địch và lớn dần, nhả để sút. Câm lặng hủy cầu đang ôm.
- Evo 4 **Cú Sút Bẻ Lái**, $150, CD 9s: bẻ hướng cầu đang bay về địch, thêm một lần nảy. Không có cầu thì không tiêu CD.
- **HÀNH TINH**: cầu rộng 1/3 sân chạy ngang làn địch, hút nhẹ, ăn đạn để lớn, chạm biên nổ mảnh. Ngân sách dame thường có trần theo Max HP địch. Tổ hợp `1+2+3+4` cho nảy ba lần giữa hai biên.
- `1+2` giữ Full Evo cũ; `1+3` tăng cỡ cầu ôm; `2+3` thêm lần nảy theo số đạn đã nuốt. Không áp sức mạnh legacy `1+2` vào mọi cặp bất kỳ.

## Kiểm chứng

- Kiểm tra cú pháp bằng lệnh trong AGENTS.md; smoke test `node tools/smoke.js` phải in `done 91`, không lỗi trang.
- Ca riêng kiểm tra 6 cặp Evo, giới hạn 2/3/4 ô, thứ tự mua, bồi thường một lần, chọn Vàng, chỉ số, khóa FEET, CD/Nộ/điều kiện Ultimate, Ôm Bóng/sút ở cả P1/P2, round-trip NetState và tương thích đối tượng legacy chỉ có `hasUpgrade()`.
- Online kiểm tra bằng kênh BroadcastChannel có sẵn, hai trang host/guest: 5 trận × 4 hiệp, đối chiếu 40 mốc 10 giây; so theo độ làm tròn hiện tại của NetState. Có thử input Skill, host duyệt lõi Vàng, ngắt kết nối khi đang Ultimate.
- Ảnh mobile 390×844, DPR 2, và kiểm tra hình học nút: đủ 56px, không chồng nút Bắn. Kiểm tra thêm các cỡ màn hình và bố cục cũ.
- Đặt `window.FEATURE_EVO34 = false` trước khi nạp script để tắt khung, Evo mới và hai lõi mới.

Đây là kiểm chứng chức năng khung, chưa phải kết luận cân bằng 45–55% hoặc kiểm thử WebRTC giữa hai máy qua Internet. Chỉ hai lõi ô Evo thuộc phạm vi issue này; các lõi Skill/Nộ khác và nội dung MAIN để giai đoạn sau.
