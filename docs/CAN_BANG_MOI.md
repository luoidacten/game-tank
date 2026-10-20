

# 🃏 HỒ SƠ BODY: JOKER (`joker` — Tướng Collab) Chỉnh sửa và thêm mới


## 2. Nội Tại: Lá Bài A (Ace Passive — Theo Vai Trò Chính Của Địch)
* Đầu trận, kiểm tra `enemy.mainRole` (`'DUEL'`, `'CONTROL'`, `'MOBILITY'`, `'SURVIVAL'`). Tăng `+5%` tỷ lệ rút chất bài đại diện (trừ vào `CARD_BLANK` từ `15%` xuống `10%`) và cường hóa chất bài đó:
  1. **Địch là `DUEL` (Đối Đầu) -> Buff `CARD_SPADE` (♠️):**
     * Lá Bích gây thêm `+0.25` sát thương xuyên giáp, Chảy Máu kéo dài `3.0s` và giảm `15%` tốc bắn của địch.
  2. **Địch là `CONTROL` (Kiểm Soát) -> Buff `CARD_CLUB` (♣️):**
     * Lá Chuồn tăng `+35%` bán kính nổ AoE,để lại vùng làm chăm (2s)  ,gây `x3` sát thương lên Vật Triệu Hồi/Tường chắn và xóa Vũng mặt đất của địch tại tâm nổ.
  3. **Địch là `MOBILITY` (Cơ Động) -> Buff `CARD_DIAMOND` (♦️):**
     * Lá Rô bay nhanh hơn `+25%`, có Homing nhẹ và gây **Làm Chậm `30%` trong `1.5s`** khi trúng đích.
  4. **Địch là `SURVIVAL` (Sinh Tồn) -> Buff `CARD_HEART` (♥️):**
     * Lá Cơ hồi `+0.4 HP` (thay vì `+0.25`) và gây hiệu ứng **Giảm `50%` hồi máu** lên địch trong `4.0s`.
(tất cả hiệu ứng trên mạnh hơn khi có Evo2 và mạnh hơn nữa khi FUllEVO)
### Evo 2: Sao Chép Tuyệt Kỹ (`evo_joker_2` — Giá: `$120`)
* Thời gian nạp đạn giảm một nửa còn **`0.75s`**. Mở cơ chế `CD 60s` cho *Thoát Hiểm* (`-2s` mỗi lá Joker).
* **Sao Chép Vai Trò Chính:** Khi 1 lá `CARD_JOKER` bắn **trúng xe địch**, đánh dấu `copiedRole = enemy.mainRole` cho **toàn bộ băng đạn ở lần nạp đạn tiếp theo**:
  1. **Sao chép `DUEL` (Đối Đầu — Cộng thêm sát thương = `4% Max HP` của địch):**
     * ♥️ **Cơ:** Hồi `+0.5 HP` khi trúng + gây thêm sát thương theo `% máu` địch.
     * ♦️ **Rô:** Rơi `+$10` + gây Chí Mạng `x1.5` xuyên Khiên + sát thương `% máu`.
     * ♣️ **Chuồn:** Nổ AoE 2 lần theo `% máu` + đẩy lùi & Choáng `0.4s`.
     * ♠️ **Bích:** Xuyên vật cản + Chảy máu theo `% Max HP` & làm địch nhận thêm `+20%` sát thương trong `3s`.
  2. **Sao chép `CONTROL` (Kiểm Soát — Tạo Vùng Mặt Đất `2.5s` làm chậm `35%`):**
     * ♥️ **Cơ:** Hồi `+0.25 HP` + tạo Vùng lớn hơn (`+30%`) làm chậm & gây **Chảy Máu** khi địch trong vùng - 0,5 máu tối đa của địch.
     * ♦️ **Rô:** Rơi `+$5` + tạo Vùng làm chậm & **Khóa Chân (Root) `0.75s`**.
     * ♣️ **Chuồn:** Nổ AoE + tạo Vùng làm chậm, sát thương liên tục & nổ  **EMP trong `1.5s`**.
     * ♠️ **Bích:** Xuyên vật cản + tạo Vùng làm chậm `50%`, chảy máu & **gây căm lặng** (2s).
  3. **Sao chép `MOBILITY` (Cơ Động — Khi bắn lướt nhẹ + tăng `25%` tốc chạy `1s`):**
     * ♥️ **Cơ:** Hồi ngay **`+0.25 HP` khi vừa bắn** + xóa Làm Chậm cho bản thân.
     * ♦️ **Rô:** Đạn bay nhanh gấp đôi tự khóa mục tiêu, rơi `+$5` & giảm `1s` CD *Tráo Bài*.
     * ♣️ **Chuồn:** Để lại `1 Phân Ảnh Bài` (`2s`) tại chỗ vừa lướt đi 'phân ảnh tự tấn công và sẻ lao lên cảm tử trước khi mất hoặc hết máu' (máu bằng 25% máu hiện tại của Joker).
     * ♠️ **Bích:** Phóng kèm 1 lá Bích phụ xuyên thấu; trúng đích tăng `+40%` tốc chạy `1.5s`.
  4. **Sao chép `SURVIVAL` (Sinh Tồn — Khi bắn nhận Giảm `25%` sát thương trong `2.0s`):**
     * ♥️ **Cơ:** Hồi ngay **`+1.0 HP`** và nhận **`1 Khiên chắn đạn`** ngay khi bắn!
     * ♦️ **Rô:** Rơi `+$5` và tăng mức giảm sát thương nhận vào thêm `+15%` trong `3s`.
     * ♣️ **Chuồn:** Nổ AoE + Vô hiểu hóa khả năng hồi máu và nhận khiên của địch trong 3s.
     * ♠️ **Bích:** Xuyên vật cản, Hút máu `100%` sát thương gây ra, xóa 1 buff trên người địch copy qua Joker & xóa 1 hiệu ứng bất lợi trên người Joker.
(Lưu ý: Khi đang có băng đạn Sao Chép, ngay cả ⬜ Lá Rỗng cũng nhận Hiệu Ứng Chung Cả Băng, còn 🃏 Lá Joker sẽ kích hoạt tổng hợp cả 4 chất cường hóa cùng lúc!)
(các ứng trên mạnh hơn khi có FullEVO)



Nhà Ảo Thuật Đánh Thường Là Phóng bài, các ảo ảnh khó phân biệt hơn, Evo2 Giúp tạo ra ảo ảnh hoàn hỏa đầu game (Cd hồi sinh 30s) Copy 50% chỉ số và khi full tạo ra 2 ảo ảnh hoàn hỏa Cd 20s. (ảo ảnh hào hỏa sẻ tự di chuyển và tấn công đôi khi đứng yên fake), Nhà ảo thuật có thể Fake khiên kẻ thù (khiên giả và số đạn giả với ảo giác từ 2 trở lên) và Evo1 giúp cô ta và các ảo ảnh bắn liên tiếp 3 lá bài (theo trục dộc)
Xe tiền: Evo gợi xe tiền tong đối thủ là sẻ ngẫu nhiên trên 1 và lần lước 3 xe (không phải cùng lúc) theo trục dộc, trước khi tông 2s sẻ có cảnh báo đường xe chay.
Phi Công: Oan Tặc có cảnh báo trước khi nổ xuống (1s).
OCA: khi tấn công lao đến sau khi sát định vị trí lúc lao không đổi hướng, và lúc ném bom cũng có cảnh báo (EMP có thể vô hiểu hóa OCA), tự AIM khi Full Evo của Revan SMG dễ né hơn.
Pradox: sao mỗi lần tua ngược ảo ta tạo thêm 1 vết nứt thời gian, khi khai hỏa neo và dự đoán 3s điều cùng khai hỏa với sát thương còn 25% nếu fullEvo là 50%.
Thêm các xe mới vào game ngoài xe tiền (xe buff dame (buff dame trong 10s nhiều hơn cái kìa), xe hồi máu phá sẻ nổ ra rất nhiều cục hồi máu (xe này rất trâu), Xe tấn công xe này sẻ ngắm vào bắn các người chới phá không được gì ngoài 20 tiền (Có nhiều biến thể pháo,smg,lazer,...) (Các sẻ sẻ trâu hơn qua các (R) phá xe nào cũng cho tiền it nhiều thôi ) Thêm 3 loại thùng mới (Thùng Băng gây choáng và làm chậm) (Thùng Miễn Nhiễm Miễn nhiễm 3 hiệu ứng bất lợi) (Thùng tốc tăng tốc trong 5s)(Đồng nghĩa Body Tiến Hóa cũng cần Thêm mới)


