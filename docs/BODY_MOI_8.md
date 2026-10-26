# Đặc tả đợt 8 (người dùng gửi)

- Sảnh chính: nút **Cẩm Nang Tướng** (xem hướng dẫn mọi tướng).
- **Pháo Lửa** (`fire_cannon`): giống Pháo Băng nhưng đạn gây đốt và tạo vùng lửa gây dame.
- Làm cái dễ trước, xong cái nào push cái đó.

### 86. Dynamite — Chuyên Gia Thuốc Nổ (`dynamite`) ⭐⭐ *(2/5 - Dễ làm quen, sâu về đặt bẫy)*

*"Bùm! The deeper the mine, the brighter the gold."*
**Vai trò chính:** Kiểm Soát (Khắc chế cứng các Body triệu hồi vật thể/tường chắn).
**Chỉ số:** HP: 5.0 | Dame: 1.5 (Ném cao: 1.8) | Đạn: 3 (Bó Thuốc Nổ TNT) | Tốc: 3.5 | Kích thước: 30×30.

* **Chỉ số thực đầu hiệp:** HP 5.0 · Sát thương 1.5 · Đạn 1 · Tốc độ 3.5 · Kích thước 30×30
* **Vật triệu hồi / hiệu ứng:** Bó Thuốc Nổ Cài Sẵn (Tối đa 2 / 3 / 5 bó), Dây Dẫn Nổ Lan, Cục Vàng.

#### 🧨 Cơ chế Kỹ năng & Nội tại

1. **Nhấp Bắn (Tap) — Ném Thẳng Kích Nổ:**
* Ném 1 bó **Thuốc Nổ Dynamite** bay thẳng dọc sang làn của địch:
* Nếu trúng trực tiếp **xe địch, vật thể, tường chắn, vật cản, Xe Tiền, Xe Tấn Công** (hoặc bay chạm vào vòng cảnh báo của một bó Dynamite đang nằm sẵn trên sân): **Phát nổ ngay lập tức gây `1.5 Dame**`!
* **Nội tại Phá Công Trình:** Đối với mọi mục tiêu **không phải Body địch** (Tường, Ụ súng, Cọc, Búp bê, Vật triệu hồi, Thùng, Xe Tiền...), vụ nổ của Dynamite gây **x3.0 Sát thương** (và tăng lên **x5.0 Sát thương** khi đạt **Full Evo**)!


2. **Nhấn Giữ 0.5s (Hold) — Ném Cao Gài Bẫy (Vượt Mọi Vật Cản):**
* Ném 1 bó Dynamite bay vòng cung cao trên không trung (**không thể bị chặn bởi bất kỳ tường chắn, vật thể hay vùng chặn đạn nào ở giữa sân**), rơi thẳng xuống tọa độ trục X tương ứng trên làn của địch:
* **Nếu rơi xuống mặt đất:** Bó Dynamite nằm lại ngay trên làn của địch tại tọa độ X đó với **vòng cảnh báo rộng `55px**` khóa góc đứng đó.
* **Nếu lúc rơi xuống trúng ngay người xe địch:** Bó Dynamite **DÍNH THẲNG VÀO NGƯỜI KẺ ĐỊCH** (di chuyển theo xe địch cho đến khi phát nổ)!





3. **Nội tại 1 — Vụ Nổ Lan (Chain Reaction Setup):**
* Các bó thuốc nổ nằm trên sân có **sợi dây dẫn lửa kết nối với nhau** (trong phạm vi 140px).
* **Khi 1 bó phát nổ, toàn bộ các bó thuốc nổ xung quanh sẽ lập tức PHÁT NỔ DÂY CHUYỀN cùng lúc!**
* *Lối chơi cốt lõi:* Dùng **Nhấn Giữ 0.5s** để rải trước các bó thuốc nổ lên làn địch (hoặc dính lên người địch), sau đó dùng **Nhấp Bắn (Tap)** ném nhanh một bó bay thẳng vào để **kích nổ toàn bộ chuỗi bom sớm hơn thời gian tự nổ** khiến kẻ địch không kịp trở tay!


4. **Nội tại 2 — Đào Vàng (`Gold Rush`):**
* Phá hủy Thùng Tiếp Tế hoặc Xe Tiền bằng vụ nổ Dynamite nhận thêm **+$10 Vàng** mỗi cái.
* Cứ mỗi **3 lần** vụ nổ Dynamite gây sát thương trúng tướng địch sẽ văng ra **1 Cục Vàng (+$5)** tự động bay về túi tiền của bạn!



---

#### 🧬 Tiến hoá (Evo — Đã thiết kế lại chuẩn theo cơ chế Ném Cao & Nổ Lan)

| Evo | Giá | Hiệu ứng |
| --- | --- | --- |
| **Kho Thuốc Nổ Mở Rộng** (`evo_dyn_1`) | $65 | **Tăng Số Lượng Bẫy & Thời Gian Duy Trì:** <br>

<br>• Băng đạn tăng thêm **+1 bó** (thành **4 bó**), tốc độ bay của đòn **Ném Cao (Giữ 0.5s)** nhanh hơn **+30%**. <br>

<br>• Thời gian tồn tại của bó Dynamite trên sân tăng từ 6.0s lên **`9.0s`**, và số lượng bó tối đa cùng tồn tại tăng từ 2 lên **`3 bó`**! <br>

<br>• Khoảng cách kết nối **Vụ Nổ Lan** giữa các bó thuốc nổ mở rộng thêm **+40%** (rất dễ nối chuỗi nổ khắp làn địch). |
| **Thuốc Nổ Nhiệt Nhôm** (`evo_dyn_2`) | $100 | **Cường Hóa Nổ Dây Chuyền & Bám Dính:** <br>

<br>• **Thưởng Kích Nổ Sớm:** Khi một bó Dynamite đang nằm trên sân (hoặc đang dính trên người địch) được **kích nổ sớm bởi một vụ nổ khác (nhờ Nhấp Bắn hoặc Nổ Lan)**, bán kính nổ của nó tăng **+35%** và gây thêm **+0.4 Dame (thành `2.2 Dame`)**! <br>

<br>• Đặc biệt: Nếu bó Dynamite đang **dính trực tiếp trên người địch** mà bị bạn kích nổ sớm bằng Nhấp Bắn, nó sẽ gây **Choáng 0.6s**! <br>

<br>**FULL EVO (Vua Mỏ Vàng — Đại Địa Chấn):** <br>

<br>• Thời gian tồn tại của bó Dynamite tăng lên **`12.0s`**, giới hạn tối đa trên sân tăng lên **`5 bó`**, và sát thương lên mọi vật thể/tường/vật triệu hồi tăng lên **`x5.0 Dame`**! <br>

<br>• Mỗi bó Dynamite khi nổ trên làn địch sẽ **rơi thẳng +$5 Vàng** và để lại **Đám Khói Đen** tại điểm nổ làm **Chậm 30% trong 2.0s**! |

* **Kết liễu:** Hạ gục địch → **SẬP HẦM MỎ VÀNG** (Hàng chục bó Dynamite đỏ rực rơi xuống xếp thành vòng tròn quanh xe địch, dây cháy chậm xẹt lửa nối liền nhau rồi kích hoạt một chuỗi đại bộc phá liên hoàn hất tung mục tiêu lên trời cùng một cơn mưa vàng lấp lánh).
* **Mã nguồn dự kiến:** `js/characters/dynamite/logic.js`, `js/characters/dynamite/render.js`, `js/characters/dynamite/bombs.js`

---

---

85. Hai Nòng (twin_gun) ⭐ (1/5 - Rất Dễ)
"Hai viên song song, lách đi đâu?"Vai trò chính: Đối Đầu.Chỉ số: HP: 5.5 | Dame: 0.75 (×2 viên = 1.5) | Đạn: 6 | Tốc: 3.6 | Kích thước: 30×30.

Nhấp Bắn: Phóng 2 viên đạn bay dọc 1 viên trái trước và sao đó là phải, cách nhau 24px (vừa khít thân xe), lập lại ngược lại ở phát ti. Nếu cả 2 viên trong cùng 1 phát đều trúng đích, phát bắn kế tiếp được +25% tốc đạn và +0.3 Dame.

Giữ Bắn 0.4s (Đổi Khoảng Cách Nòng): Chuyển qua lại giữa Nòng Hẹp (2 viên sát nhau 20px để dồn sát thương 1 mục tiêu) và Nòng Rộng (2 viên cách nhau 75px để khóa 2 bên Trái/Phải, ở giữa có khe trống).

Tiến hoá:

Evo 1 — Nòng Xoay Liên Thanh ($60): Tăng +2 đạn (thành 8 viên) và tốc độ nạp đạn nhanh hơn 30%.

Evo 2 — Đạn Từ Tính ($90): Nếu chỉ trúng 1 trong 2 viên, viên trúng đích sẽ đẩy lệch nhẹ kẻ địch sang ngang về phía đường bay của phát tiếp theo. FULL EVO: Mỗi phát bắn thứ 3 sẽ bắn kèm thêm 1 viên đạn thứ 3 ở chính giữa (xuyên vật cản).


* **Thời gian tồn tại & Giới hạn số lượng trên sân:**
* Bó Dynamite nằm tồn tại trong **`6.0s`** (tăng lên **`9.0s` ở Evo 1** và **`12.0s` ở Full Evo**). Khi hết thời gian sẽ tự phát nổ gây **`1.8 Dame`** và **hất văng xe địch trượt ngang (Trái hoặc Phải)**.
* **Giới hạn tối đa cùng tồn tại trên sân:** Tối đa **`2 bó`** (tăng lên **`3 bó` ở Evo 1** và **`5 bó` ở Full Evo** — Không thể ném khi quá giới hạn đến khi có gói đã nổ


Mortar — Pháo Cối Công Thành (mortar) 🆕 ⭐ (1/5 - Rất Dễ)"Đừng nhìn phía trước mặt... Hãy ngước nhìn bầu trời trên đầu ngươi kìa!"Vai trò chính: Kiểm Soát / Đối Đầu (Khắc chế cứng các Body dựng tường, nấp sau vật triệu hồi hoặc mở vùng chặn đạn như Kỹ Sư, Siêu Năng, Railgun).Độ khó: ⭐ (1/5 — Rất Dễ: Cơ chế cực kỳ trực quan, không bị cản đạn bởi bất kỳ chướng ngại vật nào giữa sân, chỉ cần căn đón đầu hướng di chuyển ngang của địch).Chỉ số: HP: 5.5 | Dame: 1.7 (Tâm nổ: 2.1) | Đạn: 3 (Đạn Cối Hạng Nặng) | Tốc: 3.4 | Kích thước: 32×32.Chỉ số thực đầu hiệp: HP 5.5 · Sát thương 1.7 · Đạn 3 · Tốc độ 3.4 · Kích thước 32×32Vật triệu hồi / hiệu ứng: Vòng Cảnh Báo Pháo Kích (Sky-Drop), Hố Đạn Nóng Đỏ, Mưa Pháo Rải Thảm.💣 Cơ chế Kỹ năng & Nội tại (Chuẩn trục ngang 1D & Đạn Đạo Trên Không)Nội tại — Quỹ Đạo Vòm Trời (Sky-Drop Artillery):Toàn bộ đạn của Mortar đều được bắn vọt thẳng lên bầu trời rồi rơi từ trên không trung thẳng xuống làn của kẻ địch (isAerialDrop = true).Bỏ Qua Mọi Vật Cản Giữa Sân: Đạn cối hoàn toàn không thể bị chặn bởi Tường chắn, Ụ súng, Búp bê, Khiên chắn trước mặt hay cả Trường Niệm Lực (Siêu Năng) và Vùng Điện Tích (Railgun)!Thưởng Hồng Tâm (Bullseye): Nếu quả đạn cối rơi trúng chính giữa tâm xe địch (khoảng cách trục X lệch không quá 18px), vụ nổ gây thêm +0.4 Dame (thành 2.1 Dame) và phá vỡ ngay 1 lớp Khiên của mục tiêu!Nhấp Bắn (Tap) — Pháo Kích Tầm Cao:Khai hỏa 1 quả đạn cối bay vọt lên trời theo tọa độ trục X hiện tại của bạn.Ngay lập tức, trên làn ngang của kẻ địch xuất hiện 1 Vòng Cảnh Báo Đỏ (rộng 70px) tồn tại trong 0.75s (để kẻ địch nhìn thấy và lách Trái/Phải né đòn).Sau 0.75s, quả đạn cối rơi thẳng từ trên trời xuống tâm vòng cảnh báo, phát nổ gây 1.7 Dame và hất trượt kẻ địch sang ngang (50px) ra xa tâm vụ nổ!Nhấn Giữ 0.5s (Hold) — Mưa Pháo Rải Thảm (Carpet Barrage | Hồi chiêu: 8.0s):Không tốn đạn trong băng: Mortar nã liên tiếp 3 quả đạn cối nhỏ lên bầu trời (cách nhau 0.2s mỗi quả), rơi xuống 3 vị trí trên làn của kẻ địch:Quả 1: Nhắm thẳng vào tọa độ trục X hiện tại của kẻ địch.Quả 2 & Quả 3: Rơi lệch sang hai bên Trái (X - 85px) và Phải (X + 85px) để khóa đường lách ngang của địch (giữa các vòng nổ vẫn có khe trống an toàn để địch lách khéo né đòn).Mỗi quả có vòng cảnh báo rộng 55px (rơi sau 0.75s), khi nổ gây 1.0 Dame và làm kẻ địch bị Làm Chậm 30% tốc chạy ngang trong 1.5s!🧬 Tiến hoá (Evo)EvoGiáHiệu ứngThuốc Phóng Áp Suất Cao (evo_mortar_1)$65Rút Ngắn Độ Trễ Rơi & Tăng Đạn:• Thời gian đạn rơi từ trên trời xuống (vòng cảnh báo) rút ngắn từ 0.75s xuống còn 0.55s (ép đối thủ phải phản xạ lách ngang cực nhanh!).• Băng đạn tối đa tăng thêm +1 quả (thành 4 quả) và tốc độ nạp đạn nhanh hơn 25%.Đạn Cối Nhiệt Nhôm (evo_mortar_2)$100Hố Đạn Cháy & Giảm Hồi Chiêu Rải Thảm:• Mỗi quả đạn cối bắn thường sau khi nổ sẽ để lại 1 Hố Đạn Nóng Đỏ (rộng 65px) trên làn địch trong 2.5s: kẻ địch đi ngang qua bị đốt 0.3 HP/s và bị Làm Chậm 25%.• Hồi chiêu kỹ năng Mưa Pháo Rải Thảm (Giữ 0.5s) giảm từ 8.0s xuống còn 5.5s.FULL EVO (Pháo Đài Bầu Trời — Tọa Độ Hủy Diệt):• Siêu Đạn Cối Phân Mảnh (Mỗi phát bắn thứ 3): Cứ mỗi phát bắn thường thứ 3, Mortar khai hỏa Đại Pháo Cối (vòng nổ rộng 90px, gây 2.2 Dame); ngay khi chạm đất, nó nảy văng ra thêm 2 Quả Đạn Chùm Nhỏ sang hai bên Trái và Phải (±70px, nổ sau 0.35s gây 0.8 Dame/quả)!• Mỗi lần bắn trúng tâm nổ (Bullseye), Mortar nhận ngay +0.3 Giáp Trắng và giảm 1.0s hồi chiêu Mưa Pháo Rải Thảm!Kết liễu: Hạ gục địch → TỌA ĐỘ HỦY DIỆT: ĐẠI PHÁO KÍCH (Một tia laser chỉ thị mục tiêu màu đỏ khóa chặt lấy chiếc xe địch từ trên bầu trời; hàng chục quả đạn cối hạng nặng nối đuôi nhau rơi xuống như mưa thiên thạch, san phẳng toàn bộ khu vực đứng của địch thành một hố sâu bốc khói nghi ngút).Mã nguồn dự kiến: js/characters/mortar/logic.js, js/characters/mortar/render.js