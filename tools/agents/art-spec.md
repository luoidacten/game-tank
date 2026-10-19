# Đặc tả hình dáng xe & đạn — CYBER TANK 1v1

Tài liệu này mô tả hình dáng đặc trưng của từng xe và từng loại đạn, để người/AI khác viết code vẽ. Mô tả dựa trên tên và cơ chế trong game (`js/data/modules.js`), không phải hình đã có sẵn.

## 1. Quy tắc bắt buộc

1. **Khung vuông.** Mỗi xe có một khung vuông `S × S` (S = kích thước ghi trong bảng ở mục 2). Khung này cũng là hitbox va chạm. Mọi chi tiết hình vẽ phải nằm trọn trong khung, không tràn ra ngoài.
2. **Thiết kế trên lưới 32×32.** Vẽ mọi xe trong hệ tọa độ 0–32, rồi scale theo `S/32`. Nhờ vậy một bản thiết kế dùng được cho cả khung 24 lẫn 38.
3. **Hướng nòng.** Vẽ xe với nòng hướng lên trên (góc 0). Code sẽ xoay theo hướng nhắm.
4. **Đạn có khung vuông `d × d`.** Đường kính d là kích thước đạn (mục 3). Đạn tròn phải có đường kính đúng bằng d.
5. **Màu đội.** Đội P1 dùng `#3498db` (xanh), đội P2 dùng `#e74c3c` (đỏ). Màu này chỉ làm điểm nhấn (viền, lõi, vệt), không phủ toàn thân, để giữ silhouette của từng xe dễ nhận.
6. **Silhouette khác nhau.** Không để hai xe có đường viền ngoài giống nhau. Người chơi phải nhận ra xe đối thủ khi nó chuyển động, kể cả khi màu đã đổi do hiệu ứng.
7. **Chi tiết tối thiểu.** Mỗi chi tiết nhỏ phải dày ít nhất 1.5 px thực tế, để không mờ ở khung 24×24.
8. **Màu là màu viên hoặc là màu đặc trương.**: nghĩa là nhìn vẫn phải nổi bật team xanh hoặc đỏ, còn cái màu là màu chủ đạo hoặc viền
9. Các Evo sẻ làm 1 số xe đẹp và đặc trưng. Riêng xe tiền các Cấp sẻ thay đổi. FUll Evo tạo hiệu ứng hoặc đặc trương cho người chơi phân biệt

## 2. Bảng kích thước khung

| Khung | Số xe | Danh sách |
|---|---:|---|
| 24×24 | 8 | Tiểu Liên, Ghost, Sniper, Bow, Shadow Hunter, Kẻ Sáng Tạo, Thiên Tài, Hoa Ảnh |
| 26×26 | 5 | Shotgun, Kiếm Trận, Nhà Ảo Thuật, Sấm Chớp, Cao Bồi |
| 28×28 | 4 | Xe Tiền, Kiếm Sư, DJ, Kiếm Vũ |
| 30×30 | 20 | Cơ Bản, Pháo Băng, Đạn Lớn, Cuộn Quá Tải, Lazer Xuyên Phá, Lazer Pháo, Pháo Tên Lửa, Cổng Không Gian, Phong Trảm, Cuồng Phong, Axit Hóa, Kiếm Tôn, Âm Dương Sư, Kẻ Mạnh Nhất, Mirror, Paradox, Nhà Phát Minh, Tiến Hóa, Kiếm Khách, Tùy Biến |
| 32×32 | 1 | Chiêu Hồn Sư |
| 34×34 | 7 | Kỹ Sư, Súng Nước, Shortgun ATK, Nam Châm, Trối Chết, Bình Phun, T-Zero |
| 36×36 | 4 | Lò Nung, 6 Nòng, Vua Đầu Bếp, Móc Thép |
| 37×37 | 1 | Pháo Cao Xạ |
| 38×38 | 1 | Xe TANK |

## 3. Quy tắc đạn

| Loại | Đường kính d | Hình dạng |
|---|---:|---|
| Đạn thường (mặc định) | 5 | Sao chổi: đầu tròn sáng, đuôi gradient |
| Đạn Lớn / Đạn lớn cấp 1 | 10 | **Tròn thuần**, quầng sáng, không đuôi |
| Đạn Evo 1 | 16 | **Tròn thuần**, quầng sáng đậm |
| Đạn Full Evo | 22 | **Tròn thuần**, quầng sáng lớn, có vòng xoay |

Quy tắc chung cho đạn:
- Đạn có `d ≥ 10` luôn là **hình tròn thuần**, không đuôi, không mũi nhọn.
- Đạn `d = 5` vẫn là sao chổi để người chơi đọc hướng bay.
- Đạn đặc biệt (tia, lưỡi, móc, tên lửa...) giữ hình riêng nhưng vẫn nằm trong khung vuông của đạn.

## 4. Hình dáng từng xe

Ghi chú: "Đạn" mô tả hình dạng đạn của xe. "Màu gợi ý" là một tông màu chủ đạo ngoài màu đội.

### 4.1. Khung 24×24

**Tiểu Liên (`smg`)**
- Hình: thân gầy, khung ngắn, hai nòng song song ngắn đặt cạnh nhau.
- Đạn: sao chổi nhỏ (d = 5), màu vàng ánh, bắn liên tục.
- Màu gợi ý: vàng đồng.

**Ghost (`ghost`)**
- Hình: thân dẹt hình giọt nước, không có tháp pháo lớn.
- Đạn: sao chổi bạc mờ (alpha 0.6), gợi cảm giác bóng ma.
- Khi tàng hình: viền xanh lạnh, toàn thân mờ.
- Màu gợi ý: bạc xanh.

**Sniper (`sniper`)**
- Hình: thân dài dẹt hình chữ nhật hẹp, ống kính lớn ở đầu nòng.
- Đạn: tia laser đỏ mảnh, dài, có lõi trắng.
- Màu gợi ý: xám thép với viền đỏ.

**Bow (`cung`)**
- Hình: thân tròn, hai nhánh cung lộ ra hai bên thân.
- Đạn: mũi tên mảnh, có lông đuôi, ánh xanh lá.
- Màu gợi ý: xanh rừng.

**Shadow Hunter (`shadow_hunter`)**
- Hình: thân nhọn kiểu bóng đêm, viền tím sẫm, hai vết mờ phía sau.
- Đạn: vệt tối tím; khi cường hóa có thêm vết đỏ nhỏ.
- Màu gợi ý: tím sẫm.

**Kẻ Sáng Tạo (`creator`)**
- Hình: thân khối vuông, trên nắp có một bánh răng nhỏ.
- Đạn: một cầu vàng đồng (d = 5).
- Màu gợi ý: vàng đồng và xám.

**Thiên Tài (`genius`)**
- Hình: thân gọn, đầu có ánh kính cyan, trên nắp có biểu tượng bóng đèn.
- Đạn: tia cyan nhỏ.
- Màu gợi ý: cyan.

**Hoa Ảnh (`flower_shadow`)**
- Hình: thân tròn, ba cánh hoa nhỏ xoay quanh thân.
- Đạn: cánh hoa hồng bay, không phải đạn tròn.
- Màu gợi ý: hồng nhạt.

### 4.2. Khung 26×26

**Shotgun (`shotgun`)**
- Hình: thân vuông, nòng ngắn và to, hai vòng khóa lớn ở hai bên.
- Đạn: ba chấm vàng nhỏ tỏa hình quạt.
- Màu gợi ý: cam đất.

**Kiếm Trận (`van_kiem`)**
- Hình: thân vuông bình thường, bốn thanh kiếm nhỏ xoay quanh thân.
- Đạn: thanh kiếm mảnh, dài theo chiều bay.
- Màu gợi ý: xanh bạc.

**Nhà Ảo Thuật (`magician`)**
- Hình: thân gọn, đầu nhọn, trên nắp có mũ phù thủy nhỏ.
- Đạn: sao chổi tím nhạt.
- Màu gợi ý: tím nhạt.

**Sấm Chớp (`thunder`)**
- Hình: thân nhỏ, trên nắp có một ngọn giáo điện.
- Đạn: thương điện vàng, dài và mảnh, có vệt sét phía sau.
- Màu gợi ý: vàng điện.

**Cao Bồi (`revolver`)**
-đẹp rồi

### 4.3. Khung 28×28

**Xe Tiền (`money_tank`)**
- Hình: thân vàng kim, có ký hiệu $ trên thân, thùng tiền lớn phía sau.
- Đạn: hai viên tròn vàng (d = 6), có quầng sáng vàng.
- Màu gợi ý: vàng kim.

**Kiếm Sư (`kiem_su`)**
- Hình: thân xám xanh gọn, hai thanh kiếm dài gắn ở hai bên thân.
- Đạn: phi kiếm nhỏ, màu theo nguyên tố (kim vàng, mộc xanh lá, hỏa đỏ, thổ nâu, thủy xanh dương).
- Màu gợi ý: xám xanh.

**DJ (`dj`)**
- Hình: loa lớn trên nắp, đèn LED nhấp nháy chạy theo nhịp.
- Đạn: sóng âm dạng vòng cung nhấp nháy.
- Màu gợi ý: đen với điểm LED xanh, vàng, đỏ.

**Kiếm Vũ (`kiem_vu`)**
- Hình: thân hẹp, một thanh kiếm lớn cắm dọc giữa thân.
- Đạn: thanh kiếm dài ánh trắng.
- Màu gợi ý: trắng bạc.

### 4.4. Khung 30×30 (20 xe)

**Cơ Bản (`basic`)**
- Hình: thân vuông trơn, nòng ngắn chuẩn ở giữa, không chi tiết thừa.
- Đạn: sao chổi nhỏ (d = 5).
- Màu gợi ý: xám trung tính. Đây là xe chuẩn để so sánh các xe khác.

**Pháo Băng (`ice`)**
- Hình: thân xanh băng, tinh thể nhọn gắn ở hai bên tháp pháo.
- Đạn: tinh thể băng nhọn, có viền trắng.
- Màu gợi ý: xanh băng.

**Đạn Lớn (`big_bullet`)**
- Hình: ống nòng rất dày, thân gọn.
- Đạn: cầu tròn lớn (d = 10), tròn thuần, có quầng sáng.
- Màu gợi ý: cam đậm.

**Cuộn Quá Tải (`overload`)**
- Hình: cuộn dây điện quấn quanh nòng, có vài tia điện nhỏ.
- Đạn: cầu điện tròn xanh có viền sét, phình to dần theo mức tụ lực.
- Màu gợi ý: xanh điện.

**Lazer Xuyên Phá (`lazer_charge`)**
- Hình: nòng dài mảnh, thanh tụ lực chạy dọc thân.
- Đạn: tia laser mảnh, dài; khi tụ đầy là tia xuyên lớn có lõi trắng.
- Màu gợi ý: xanh lam sáng.

**Lazer Pháo (`lazer_auto`)**
- Hình: nòng kép lớn, có khe làm mát ở thân.
- Đạn: tia laser ngắn có lõi trắng, xuyên qua mục tiêu.
- Màu gợi ý: xanh lam.

**Pháo Tên Lửa (`rocket`)**
- Hình: hai ống phóng trên nắp.
- Đạn: tên lửa mini có đuôi lửa cam.
- Màu gợi ý: xám thép với cam.

**Cổng Không Gian (`portal`)**
- Hình: vòng xoáy tím ở hai bên thân.
- Đạn: quả cầu tròn có vòng xoay, tạo cảm giác cổng dịch chuyển.
- Màu gợi ý: tím.

**Phong Trảm (`wind_slash`)**
- Hình: thân mỏng, lưỡi cong phía trước như thanh kiếm ngang.
- Đạn: lưỡi gió cong dạng cung, trắng xanh.
- Màu gợi ý: trắng xanh.

**Cuồng Phong (`storm`)**
- Hình: cánh quạt xoáy hai bên thân.
- Đạn: vòng xoáy gió (không phải đạn tròn thường).
- Màu gợi ý: xanh ngọc.

**Axit Hóa (`acid`)**
- Hình: thân xanh lục, bình chứa nhỏ dưới đáy, vài giọt nước rơi.
- Đạn: giọt axit tròn xanh lục, có vùng lan mờ.
- Màu gợi ý: xanh lục.

**Kiếm Tôn (`blade_god`)**
- Hình: một thanh kiếm lớn gắn ngang phía trên xe.
- Đạn: lưỡi kiếm tia thẳng (Anh Minh) và cầu đen tròn có quầng câm lặng (Hư Vô).
- Màu gợi ý: trắng và đen.

**Âm Dương Sư (`am_duong_su`)**
- Hình: thân chia đôi đen và vàng.
- Đạn: bùa âm dương tròn xoay (d = 5 đến 8).
- Màu gợi ý: đen và vàng.

**Kẻ Mạnh Nhất (`the_strongest`)**
- Hình: thân gọn, có dải năng lượng quấn quanh cổ tay (hai bên thân).
- Đạn: mũi giáo ngắn đỏ tím khi lướt; không có đạn thường.
- Màu gợi ý: đỏ tím.

**Mirror (`mirror`)**
- Hình: thân có bề mặt bóng như gương, chia đôi đối xứng.
- Đạn: hai sao chổi đối xứng qua tâm xe.
- Màu gợi ý: bạc sáng.

**Paradox (`paradox`)**
- Hình: viền đồng hồ tròn trên nắp.
- Đạn: quả cầu có bóng đi sau 3 giây; khi tua ngược có vệt xanh phía sau.
- Màu gợi ý: xanh dương nhạt.

**Nhà Phát Minh (`inventor`)**
- Hình: ăng-ten và đồ nghề trên nắp, một drone bay trên đầu.
- Đạn: sao chổi bạc.
- Màu gợi ý: bạc và cam.

**Tiến Hóa (`evolution`)**
- Hình: thân lắp thêm các mảnh giáp, giống một khối đang lớn dần.
- Đạn: một cầu trắng nhỏ, đổi sang xanh lá khi tiến hóa.
- Màu gợi ý: xanh lá nhạt.

**Kiếm Khách (`kiem_khach`)**
- Hình: thân gọn, một thanh kiếm đeo sau lưng, có vòng khí quanh thân.
- Đạn: phi kiếm mảnh.
- Màu gợi ý: xanh ngọc.

**Tùy Biến (`customize`)**
- Hình: thân lắp ghép từ các khối vuông nhỏ, có thể gắn thêm module.
- Đạn: sao chổi có màu theo lựa chọn người chơi (mặc định trắng).
- Màu gợi ý: xám và trắng.

### 4.5. Khung 32×32

**Chiêu Hồn Sư (`necromancer`)**
- Hình: thân tối, đầu có bùa hoặc chuông, hai hồn ma trắng mờ lượn quanh thân (Linh Giáp).
- Đạn: cầu hồn tím nhạt, tròn.
- Màu gợi ý: tím đen.

### 4.6. Khung 34×34

**Kỹ Sư (`engineer`)**
- Hình: thân lớn, mui trụ có cờ lê, một thùng nhỏ chứa ụ.
- Đạn: sao chổi cam.
- Màu gợi ý: cam và xám.

**Súng Nước (`water_gun`)**
- Hình: bình nước lớn trên lưng, có ống dẫn xuống nòng.
- Đạn: giọt nước tròn xanh; khi giữ bắn là tia nước dài.
- Màu gợi ý: xanh dương.

**Shortgun ATK (`shortgunATK`)**
- Hình: nòng kép lớn xoắn, khung cứng, rõ hướng.
- Đạn: hai sao chổi đỏ; nón bộc phá hình quạt khi nổ.
- Màu gợi ý: đỏ và đen.

**Nam Châm (`magnet`)**
- Hình: thân chia hai nửa đỏ và xanh (cực + và -), cột từ trường trên nắp.
- Đạn: cầu tròn đỏ (+) hoặc xanh (-), có dấu cực ở giữa.
- Màu gợi ý: đỏ và xanh.

**Trối Chết (`death_lock`)**
- Hình: thân đen xám, xích quấn quanh thân.
- Đạn: vòng xích lồng vào nhau (lồng cấm chế).
- Màu gợi ý: đen xám.

**Bình Phun (`sprayer`)**
- Hình: vòi phun hình nón lớn ở đầu, bình chứa ba màu.
- Đạn: nón phun theo nguyên tố đang chọn (lửa đỏ, axit xanh lục, băng xanh nhạt).
- Màu gợi ý: theo nguyên tố.

**T-Zero (`t_zero`)**
- đẹp rồi

### 4.7. Khung 36×36

**Lò Nung (`furnace`)**
- Hình: thân đen, lò lửa trên lưng, khói bốc lên.
- Đạn: cầu lửa cam tròn; khi giữ bắn là tia lửa dài.
- Màu gợi ý: đen và cam.

**6 Nòng (`six_barrel`)**
- Hình: cụm sáu nòng xoay quanh một trục trung tâm.
- Đạn: viên tròn nhỏ bắn liên tục, sáu vệt đều nhau.
- Màu gợi ý: xám thép và đỏ khi quá nhiệt.

**Vua Đầu Bếp (`sukuna`)**
- Hình: thân đỏ sẫm, khắc hoa văn ký tự.
- Đạn: lưỡi chém đỏ lớn (d = 30, dài 10), dạng cung chém.
- Màu gợi ý: đỏ sẫm và đen.

**Móc Thép (`steel_hook`)**
- Hình: thân vuông lớn, móc xích dài phía trước.
- Đạn: móc sắt cong nối với sợi xích.
- Màu gợi ý: xám thép.

### 4.8. Khung 37×37

**Pháo Cao Xạ (`aaa`)**
- Hình: thân lớn, pháo hai nòng chĩa lên.
- Đạn: quả pháo tròn thép xám lớn, có vệt khói.
- Màu gợi ý: xám thép và xanh rêu.

### 4.9. Khung 38×38

**Xe TANK (`tank`)**
- Hình: thân lớn nhất, bánh xích hai bên lộ rõ, gai nhọn phía trước.
- Đạn: không có đạn; khi húc là vệt sóng xung kích phía trước.
- Màu gợi ý: xám đậm và cam cảnh báo.

## 5. Tóm tắt nhanh để kiểm tra

- Mọi xe vẽ trên lưới 32×32, scale theo khung S.
- Đạn d ≥ 10 luôn tròn thuần.
- Đạn d = 5 là sao chổi.
- Đội xanh `#3498db`, đội đỏ `#e74c3c`, chỉ dùng làm điểm nhấn.
- Không hai xe trùng silhouette.
