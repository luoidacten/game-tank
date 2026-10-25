# Đặc tả body mới đợt 6 (người dùng gửi)

> Gồm: Skinwalker (`skinwalker`), Diệp Thanh Phong (`diep_thanh_phong`, làm TRƯỚC), và phần Evo/kết liễu bổ sung của Idol (cơ chế chính Idol vẫn ở docs/BODY_MOI_5.md).

Dưới đây là bản thiết kế **Skinwalker (`skinwalker`)** đã được chuẩn hóa lại toàn bộ theo đúng chỉnh sửa của bạn: **bỏ hoàn toàn kỹ năng Giữ nút (thuần Nội Tại & Bắn thường)**, tích hợp chi tiết các cơ chế khắc chế mới, cơ chế **Thay Da theo Vai Trò Phụ (Evo 2)** và cập nhật giá **Evo 1 ($140) / Evo 2 ($220)** để bạn đưa thẳng cho Claude Opus code:

---

### 80. Skinwalker — Dị Thể Thích Ứng (`skinwalker`) 🆕

*"Lớp da này... vừa vặn đấy!"*
**Vai trò chính:** Thích Ứng (Biến đổi theo Hình Thái đang mang).
HP: 5.0 (Thay đổi theo Hình Thái) | Dame: 1.1 | Đạn: 4 | Tốc: 3.7 | Kích thước: 28×28 (Biến đổi theo Hình Thái).

* **Chỉ số thực đầu hiệp:** HP 5.0 · Sát thương 1.1 · Đạn 4 · Tốc độ 3.7 · Kích thước 28×28
* **Vật triệu hồi / hiệu ứng:** 4 Hình Thái Tiến Hóa Khắc Chế, Lớp Da Phụ (Evo 2).
* **Cơ chế điều khiển:** **Thuần Nhấp Bắn (Không sử dụng kỹ năng Giữ nút)** — toàn bộ sức mạnh nằm ở Nội tại Thích Ứng và Đòn bắn thường biến đổi theo kẻ địch.
* **Cơ chế kỹ năng & Nội tại — Săn Mồi Thích Ứng (Adaptive Predator):**
* **Đầu mỗi hiệp đấu:** Skinwalker tự động đánh hơi **Vai Trò Chính của Body kẻ địch** (*Đối Đầu, Kiểm Soát, Cơ Động, hoặc Sinh Tồn* — dùng chung bảng phân loại vai trò với *Joker*) và lập tức biến hình thành **Hình Thái Khắc Chế tương ứng** trong 4 Hình Thái dưới đây.


* Mỗi Hình Thái thay đổi hoàn toàn **Ngoại hình, Chỉ số phụ, Đòn bắn thường (Nhấp) và Nội tại khắc chế**:


* **🩸 Hình thái 1 — PHÁ GIÁP THỂ (Kích hoạt khi gặp địch ĐỐI ĐẦU / Tanker / Cận chiến):**
* *Chỉ số biến đổi:* `Kích thước: 30×30 | +1.0 Max HP (6.0 HP) | Tốc: 3.8 | Đạn: 4`.
* *Nhấp Bắn (Gai Xương Xuyên Thấu):* Bắn đạn gai xương bay thẳng gây **1.1 Dame + 5% Máu tối đa của địch** (xuyên 50% hiệu ứng giảm sát thương của địch). Trên đường bay, đạn gai xương **phá hủy mọi đạn thường của địch bay ngược chiều theo đường thẳng** (Lưu ý: Không thể phá được Kiếm Khí của Phong Trảm hoặc các siêu đạn đặc biệt mạnh hơn).


* *Nội tại Khắc Chế:*
1. Khi kẻ địch đứng **đối diện trực tiếp (cùng trục dọc X ± 35px)** với Skinwalker, áp lực sát khí làm kẻ địch bị **giảm 25% tốc độ đánh/tốc độ bắn**.
2. Khi kẻ địch lại gần trong phạm vi **160px** hoặc lao húc vào bạn, lớp vỏ gai tự động bật ra giúp **giảm 30% sát thương nhận vào** và phản lại **0.8 Dame + Làm Chậm 35%**.




* **👁 Hình thái 2 — HƯ KHÔNG THỂ (Kích hoạt khi gặp địch KIỂM SOÁT / Triệu hồi / Pháo kích):**
* *Chỉ số biến đổi:* `Kích thước: 26×26 | Tốc: 4.1 | Đạn: 5`.
* *Nhấp Bắn (Tia Thực Thể):* Bắn luồng năng lượng bay cực nhanh xuyên qua mọi vật cản/tường, gây **1.1 Dame** lên tướng địch nhưng gây tới **x4.0 Dame (4.4 Dame)** lên Vật Triệu Hồi, Ụ súng, Tường, Cọc, Bẫy của địch!
* *Nội tại Khắc Chế:* **Miễn nhiễm 50% hiệu ứng Làm Chậm** và **không chịu sát thương từ các Vũng Hiệu Ứng mặt đất** (Axit, Lửa, Băng, Pháp trận...). Mỗi khi phá hủy 1 vật triệu hồi hoặc công trình của địch, hồi ngay **+0.125 HP & +1 đạn**.




* **🕸 Hình thái 3 — TRÓC ẢNH THỂ (Kích hoạt khi gặp địch CƠ ĐỘNG / Sát thủ / Tốc độ cao):**
* *Chỉ số biến đổi:* `Kích thước: 26×26 | Tốc: 4.4 | Đạn: 2 (Nạp nhanh 1.0s)`.
* *Nhấp Bắn (Nanh Truy Kích):* Bắn ra 2 luồng đạn móc câu gây tổng **1.1 Dame** (0.55 dame/luồng).
* **Cơ chế Cảm Biến Chuyển Động:** Khi bắn ra, đạn lơ lửng/bay chậm theo dõi trong tối đa **2.0s**: nếu phát hiện kẻ địch **đang di chuyển**, đạn lập tức kích hoạt **tự ngắm bẻ lái cực gắt (Homing mạnh)** lao vút tới bám đuôi mục tiêu!
* **Điểm yếu bù trừ:** Nếu trong suốt 2.0s đó kẻ địch **đứng yên hoàn toàn**, đạn sẽ không thể khóa mục tiêu và khi hết 2.0s chỉ bay thẳng theo hướng cũ.


* *Nội tại Khắc Chế:*
1. **Bắt Tốc:** Nếu tốc độ di chuyển hiện tại của kẻ địch cao hơn Skinwalker, tốc độ của Skinwalker sẽ **tăng dần từ từ mỗi giây (+0.15 tốc/s)** cho đến khi đuổi kịp bằng tốc độ của kẻ địch!
2. **Tê Liệt & Rách Cơ:** Đòn đánh trúng đích gắn ấn **Tê Liệt** trong **2.5s** (giảm **30% tốc chạy** của địch). Nếu kẻ địch dùng kỹ năng **Lướt (Dash) hoặc Dịch Chuyển** khi đang dính ấn Tê Liệt, chúng sẽ bị **Rách Cơ**: nhận ngay **1.0 sát thương chuẩn** và bị **Khóa Chân (Root) 0.75s** ngay tại điểm dừng!




* **☣ Hình thái 4 — ĐỘC THỰC THỂ (Kích hoạt khi gặp địch SINH TỒN / Hồi máu / Giáp dày):**
* *Chỉ số biến đổi:* `Kích thước: 28×28 | +0.5 Max HP (5.5 HP) | Dame: 1.2 | Đạn: 4`.
* *Nhấp Bắn (Dịch Nhầy Hoại Tử):* Bắn đạn độc nổ nhỏ khi trúng đích, gây **1.2 Dame** và rút độc **Hoại Tử** trong **3.0s**: mỗi giây rút **0.25 HP + 1% Máu tối đa của địch**, đồng thời **chặn hồi máu tự nhiên** của mục tiêu trong thời gian dính độc.
* *Nội tại Khắc Chế:*
1. **Trọng Thương & Ký Sinh Hồi Phục:** Đòn đánh gây **Trọng Thương (-60% hiệu quả hồi máu & tạo Giáp Trắng của địch)**. Mỗi khi kẻ địch hồi máu hoặc nhận Giáp Trắng, Skinwalker tự động **hấp thụ nhận lại lượng Máu (hoặc Giáp Trắng nếu đã đầy máu) bằng 25% lượng mà địch vừa hồi**!
2. **Ăn Mòn Khiên:** Đạn đánh vào Khiên sẽ **phá vỡ lập tức lớp Khiên đó chỉ với 1 viên** và gây xuyên thêm **1.0 Dame** vào máu địch. Cứ mỗi khi kẻ địch bị vỡ đủ **3 lớp Khiên** (tính cộng dồn trong hiệp), Skinwalker tự động nhận **+1 lớp Khiên** cho bản thân!







---

## Tiến hoá (Evo)

| Evo | Giá | Hiệu ứng |
| --- | --- | --- |
| **Gen Tiến Hóa Cực Hạn** (`evo_skin_1`) | **$140** | **Cường hóa toàn diện Hình Thái Khắc Chế Chính:** <br>

<br>• **🩸 Phá Giáp Thể:** Đạn gây **1.1 Dame + 8% Máu tối đa** của địch; giảm sát thương cận chiến tăng lên **45%**; kẻ địch đứng đối diện bị giảm tới **35% tốc đánh**. <br>

<br>• **👁 Hư Không Thể:** **Miễn nhiễm 100% Làm Chậm**; mỗi lần phá vật triệu hồi/công trình hồi **+0.25 HP & +1 đạn**; đạn bắn ra để lại vệt hư không xóa 1 viên đạn thường của địch bay ngang qua. <br>

<br>• **🕸 Tróc Ảnh Thể:** Băng đạn tăng lên **3 viên**; tốc độ tăng dần khi địch nhanh hơn nhanh gấp đôi (+0.3 tốc/s); sát thương phạt **Rách Cơ** khi địch Lướt/Dịch chuyển tăng lên **1.5 sát thương chuẩn + Khóa Chân 1.0s**. <br>

<br>• **☣ Độc Thực Thể:** Trọng Thương giảm **75% hồi máu** của địch; tỉ lệ hấp thụ máu/giáp trắng khi địch hồi máu tăng từ 25% lên **40%**; chỉ cần địch vỡ **2 lớp Khiên** là Skinwalker nhận **+1 Khiên**! |
| **Kết Hợp Song Thể — Thay Da** (`evo_skin_2`) | **$220** | **Lột Da Nhận Thêm Vai Trò Phụ (Sub-Role Mutation):** <br>

<br>• Đầu hiệp đấu, ngoài Hình Thái Chính (theo Vai Trò Chính của địch), Skinwalker thực hiện **1 lần Thay Da** dựa trên **Vai Trò Phụ của Body kẻ địch**: <br>

<br>  - Nếu kẻ địch có **1 Vai Trò Phụ**: Nhận luôn hiệu ứng **Lột Da** của hình thái tương ứng đó. <br>

<br>  - Nếu kẻ địch có **từ 2 Vai Trò Phụ trở lên**: Tự động **Gacha (Random)** chọn 1 trong các vai trò phụ đó để tiến hóa Lột Da. <br>

<br>  - **Nếu kẻ địch KHÔNG có Vai Trò Phụ (thuần 1 vai trò):** **Không tiến hóa thêm lớp da phụ (Không có đền bù chỉ số!)** — đúng chất đánh cược sinh học! <br>

<br>• **Hiệu ứng Lớp Da Phụ (Bằng ~50% hiệu ứng gốc, cộng dồn với Hình Thái Chính):** <br>

<br>  - *Da Phụ Phá Giáp:* +0.5 Max HP, đạn kèm +2.5% Max HP địch, giảm 15% st nhận khi địch áp sát (<160px) và giảm 12% tốc đánh khi đối diện. <br>

<br>  - *Da Phụ Hư Không:* +0.2 Tốc chạy, gây x2.0 Dame lên Vật triệu hồi/Tường, giảm 50% sát thương từ Vũng mặt đất, phá vật triệu hồi hồi +0.06 HP. <br>

<br>  - *Da Phụ Tróc Ảnh:* Đạn của Hình Thái Chính có khả năng bẻ lái nhẹ vào mục tiêu đang di chuyển; trúng đạn làm chậm 15% và phạt **0.5 sát thương chuẩn** nếu địch Lướt/Dịch chuyển. <br>

<br>  - *Da Phụ Độc Thực:* Đạn kèm độc rút 0.125 HP/s trong 2s, gây -30% hồi máu địch và hấp thụ **12.5%** lượng máu địch hồi. <br>

<br>**FULL EVO (Dị Thể Hoàn Mỹ — Apex Skinwalker):** <br>

<br>• Hiệu ứng của **Lớp Da Phụ** được nâng từ 50% lên **80% sức mạnh của Hình Thái Chính**! <br>

<br>• *(Đặc biệt ở Full Evo: Nếu gặp kẻ địch thuần 1 vai trò không có Vai Trò Phụ, lần Thay Da sẽ tự động đột biến nhân đôi chính Hình Thái Chính đang mang thêm +35% hiệu lực!)* <br>

<br>• Lần đầu tiên trong hiệp máu tụt xuống dưới **25% Max HP**, Skinwalker tự động **Lột Bỏ Lớp Da Cũ**: xóa mọi khống chế, lướt ẩn thân bất tử **1.25s**, hồi **1.5 HP** và làm mới đầy băng đạn! |

* **Kết liễu:** Hạ gục địch -> **THÔN PHỆ ĐỒNG HÓA** (Skinwalker hóa thành khối bóng tối xúc tu nuốt chửng lấy xe địch, nghiền nát mục tiêu rồi lột xác biến thành hình dáng quái dị của kẻ vừa bị ăn thịt).
* **Mã nguồn dự kiến:** `js/characters/skinwalker/logic.js`, `js/characters/skinwalker/render.js`

---

### 💡 Gợi ý cấu trúc dữ liệu `primaryRole` & `subRoles` cho Claude Opus khi code:

Để cơ chế **Thay Da (Evo 2)** chạy chuẩn xác theo ý bạn (có 1 vai trò phụ -> lấy luôn; có $\ge 2$ vai trò phụ -> Gacha; có $0$ vai trò phụ -> không tiến hóa, không bù), Claude Opus chỉ cần khai báo bảng Role của các Body như sau:

```javascript
// Ví dụ bảng phân loại Vai Trò cho Joker & Skinwalker:
const BODY_ROLES = {
  basic:        { primary: 'DUELIST',  sub: [] },                    // Không có vai trò phụ -> Evo 2 không tiến hóa!
  tank:         { primary: 'DUELIST',  sub: ['SURVIVAL', 'MOBILE'] },// 2 vai trò phụ -> Gacha 50/50 giữa Độc Thực & Tróc Ảnh
  engineer:     { primary: 'CONTROL',  sub: ['SURVIVAL'] },          // 1 vai trò phụ -> Chắc chắn nhận Da Phụ Độc Thực
  ghost:        { primary: 'MOBILE',   sub: [] },                    // Thuần Cơ Động -> Không tiến hóa phụ
  arachnid:     { primary: 'DUELIST',  sub: ['CONTROL'] },           // Nhện: Chính Đối Đầu, Phụ Kiểm Soát
  kusarigama:   { primary: 'DUELIST',  sub: ['SURVIVAL', 'MOBILE'] } // 2 vai trò phụ -> Gacha
};

```

Bản này đã bám sát 100% từng con số và luật khắc chế của bạn, bạn có thể copy đưa thẳng cho Claude Opus code luôn nhé!

Dưới đây là bản thiết kế **hoàn chỉnh nguyên khối** của **Diệp Thanh Phong (`diep_thanh_phong`)** đã được gộp trực tiếp cơ chế **nhấn giữ khi đang trên không để cài lại Vòng Cảnh Báo tự nuôi 4s** vào đúng mục kỹ năng, bảng Evo và code mẫu để bạn copy một lần duy nhất đưa cho Claude Opus:

---

### 81. Diệp Thanh Phong — Gió Nhẹ (`diep_thanh_phong`) 🆕 *(Collab)*

*"Cơn gió nhẹ thoảng qua... nhưng đủ sức cuốn phăng vạn vật!"*
**Vai trò chính:** Kiểm Soát / Cơ Động (Tương tác với nội tại của *Joker* và *Skinwalker*).
HP: 4.0 | Dame: 1.0 | Đạn: 100 Gió (Tự hồi 8 Gió/s) | Tốc: 3.9 | Kích thước: 26×26.

* **Chỉ số thực đầu hiệp:** HP 4.0 · Sát thương 1.0 · Đạn — (100 Gió) · Tốc độ 3.9 · Kích thước 26×26
* **Vật triệu hồi / hiệu ứng:** Khiên Gió, Bão Lốc, Phong Tụ Cầu, Lốc Nuôi, Vùng Cảnh Báo Tự Nuôi, Ảo Ảnh Bão Quạt.

---

### 🌪 Cơ chế Nội tại & Hệ thống Điều khiển

1. **Nội tại 1 — Khiên Gió (Wind Barrier):**
* Mọi lớp **Khiên Xanh** (khiên chặn 1 đòn từ kỹ năng, hộp tiếp tế hoặc trang bị) trên người Diệp Thanh Phong đều tự động hóa thành **Khiên Gió**.
* Khi Khiên Gió bị vỡ: Phát nổ một luồng lốc xung kích (bán kính 110px) **thổi bay và xóa sạch mọi đạn thường của địch ở gần**, đẩy lùi nhẹ kẻ địch áp sát và giúp Diệp Thanh Phong nhận **+25% tốc chạy trong 1.5s**.


2. **Nội tại 2 — Thanh Khí Áp (Barometric Gauge: 0 – 100 điểm, khởi đầu ở 50):**
* Thanh Khí Áp chia làm **3 vùng trạng thái** (việc dùng *Thuận Phong Vũ* sẽ **-10 Khí Áp**, dùng *Nghịch Phong Vũ* sẽ **+20 Khí Áp** — điều chỉnh Khí Áp trôi qua lại giữa 3 vùng để kích hoạt combo):
* **🍃 Vùng 1 — THUẬN PHONG (0 – 33 Khí Áp):**
* Nhận **+20% Tốc độ di chuyển** và **+35% tốc độ tự hồi Gió**.
* Mọi đòn tấn công trúng đích sẽ **hoàn trả lại 35% lượng Gió đã tiêu hao**.


* **⚖️ Vùng 2 — BÃO HÒA (34 – 66 Khí Áp):**
* Mọi kỹ năng **giảm 25% Gió tiêu hao**, nhận **+12% Sát thương & +10% Tốc chạy**.
* **Hệ số nhạy Khí Áp x1.5:** Khi đang ở Bão Hòa, mọi mức tăng/giảm Khí Áp đều mạnh hơn (giúp bẻ lái nhanh sang Thuận hoặc Nghịch).
* **Loạn Phong (Mỗi 10s):** Tự động quét một cơn lốc nhỏ quanh thân (gạt đạn gần) và nhận **+1 Khiên Gió** (Khiên Gió vỡ trong trạng thái Bão Hòa có **bán kính nổ lớn gấp rưỡi: 165px**!).


* **⛈ Vùng 3 — NGHỊCH PHONG (67 – 100 Khí Áp):**
* Nhận **+25% Sát thương** cho mọi đòn đánh.
* **Toàn Phong Sân Đấu:** Nếu duy trì ở vùng Nghịch Phong đủ **8s** (hoặc lập tức kích hoạt trong 4s khi vừa chạm mốc 100 Khí Áp), toàn bộ sân đấu nổi **Toàn Phong**: kẻ địch bị **Giảm 20% tốc chạy**, chịu trạng thái **Suy Yếu (+15% sát thương nhận vào)**, và mỗi khi trúng đòn của Diệp Thanh Phong sẽ bị **Gió Cắt** (rút **0.25 HP/s trong 2.5s**).






3. **Cơ chế Nút Bắn (3 Thao Tác Không Xung Đột):**
* **Nhấp Bắn (Tap):** Tung chiêu theo thế quạt hiện tại (**Thuận Phong Vũ** hoặc **Nghịch Phong Vũ**).
* **Nhấn Giữ 0.5s rồi nhả:** **Đổi Thế Quạt** qua lại giữa **Thuận Phong Vũ** $\leftrightarrow$ **Nghịch Phong Vũ** *(Có thể đổi thế ngay cả khi đang nuôi cầu/nuôi lốc ở thế kia! Riêng khi đang bay trên không ở Cửu Thiên Phong Vũ, Giữ 0.5s sẽ dùng để cài lại Vòng Cảnh Báo và dịch chuyển về)*.
* **Nhấn Giữ 1.0s (Hồi chiêu: 8s):** **Đổi Khí Áp Tức Thì** — Lập tức nhảy sang vùng Khí Áp kế tiếp theo chu kỳ (*Thuận Phong $\rightarrow$ Bão Hòa $\rightarrow$ Nghịch Phong $\rightarrow$ Thuận Phong*), hồi ngay **20 Gió** và phát xung khí nhẹ quanh xe!



---

### 🪭 Bộ Kỹ Năng Theo 2 Thế Quạt & 3 Vùng Khí Áp

#### I. THẾ 1: THUẬN PHONG VŨ (Đánh Nhấp — Mỗi lần dùng: `-10 Khí Áp`)

* **Nội tại Chuỗi 3 Nhịp:** Mỗi lần tung đòn tích **+1 Nhịp** (bộ đếm **giữ nguyên không bị mất** kể cả khi bạn đổi vùng Khí Áp hay đổi Thế Quạt!). Đủ **3 Nhịp**, đòn kế tiếp tự động hóa thành **Đòn Cường Hóa Tuyệt Kỹ**:
* **Tại THUẬN PHONG — Lốc Xoáy (Tốn 10 Gió):**
* *Nhịp 1–2:* Phóng 1 cơn lốc nhỏ bay về phía trước gây **0.8 Dame** và giúp bạn **+20% tốc chạy trong 1s**.
* *Nhịp 3 (Đại Cuồng Phong):* Phóng ra **1 Cơn Lốc Lớn** bay dọc sân — trên đường bay nó **hút và nuốt chửng mọi viên đạn thường của địch** để tự **tăng kích thước (+15%/viên) và tăng sát thương (+0.35 Dame/viên)**! Khi chạm tường đối diện, nó nổ tung thành **Bão Lớn** tồn tại **2.5s** (hút nhẹ & gây **0.4 Dame/0.5s**).


* **Tại BÃO HÒA — Khai Phong (Tốn 8 Gió):**
* *Nhịp 1–2:* Phóng 1 lưỡi gió sắc bén bay nhanh gây **1.0 Dame**; sau mỗi phát bắn xe tự **lướt nhẹ** theo hướng di chuyển.
* *Nhịp 3 (Tam Liên Phong Nhận):* Phóng lưỡi gió chính (1.2 Dame) kèm **2 lưỡi gió phụ tỏa chéo 2 bên** (mỗi lưỡi 0.7 Dame, nảy tường 1 lần) và lướt xa hơn.


* **Tại NGHỊCH PHONG — Phong Vũ (Tốn 12 Gió):**
* *Nhịp 1–2:* Lướt nhanh lên phía trước; khi chạm mục tiêu (hoặc hết tầm) sẽ hiện **Vòng Cảnh Báo 1.2s** (gốc 2s được rút gọn để dễ trúng hơn) rồi xoay quạt tròn gây **1.2 Dame**: nếu trúng **vật thể/thùng/xe tiền/triệu hồi** sẽ **đánh bay văng thẳng về phía tướng địch** (nổ gây thêm 1.0 Dame khi va chạm!); nếu trúng **Body địch** sẽ gây **Đẩy Lùi + Làm Chậm 40% trong 1.5s** rồi xe giật về làn.
* *Nhịp 3 (Bão Quạt Tuyệt Vũ):* Hóa thân thành **Cơn Lốc Xoáy** lao thẳng tới trước (**phản lại mọi đạn thường trên đường lao & xuyên qua mọi vật cản**). Khi chạm tường đối diện, hóa thành **Lốc Múa Quạt trong 3.0s** (**Miễn Chọn / Bất Tử**, liên tục hút kẻ địch vào tâm và chém **0.4 Dame mỗi 0.3s**), hết 3s sẽ **lướt xuyên ngược về sân mình**, kéo theo một nhát chém gió khổng lồ gây **2.0 Dame**!





---

#### II. THẾ 2: NGHỊCH PHONG VŨ (Kỹ năng Bật/Tắt Duy Trì — Kích hoạt: `+20 Khí Áp`)

*(Các kỹ năng này dùng cơ chế: **Nhấp lần 1** để bắt đầu Tích/Nuôi chiêu [tiêu hao Gió mỗi giây] $\rightarrow$ **Nhấp lần 2** để Phóng/Đáp. Đặc biệt: Trong lúc đang nuôi chiêu ở lần 1, bạn có thể **Giữ 0.5s đổi sang Thuận Phong Vũ để vừa bắn thường vừa nuôi chiêu**!)*

* **Tại THUẬN PHONG — Phong Tụ Cầu (10 Gió mở + 8 Gió/s, tối đa 4s):**
* *Nhấp lần 1:* Tụ một quả **Cầu Gió** trước mặt (tích càng lâu cầu càng phình to và tồn tại lâu hơn; trong lúc tụ bạn được **+25% tốc độ di chuyển**).
* *Nhấp lần 2 (Hoặc hết 4s):* Đẩy quả cầu bay đi (**xuyên mọi vật cản**, tích càng to bay càng đầm chắc, gây **1.0 $\rightarrow$ 2.5 Dame** trên đường bay). Khi chạm tường đối diện, cầu phát nổ tạo ra **Vùng Cuồng Phong** tồn tại **2.5s $\rightarrow$ 5.0s** (gây **0.35 Dame/0.5s** và **Làm Chậm 45%** kẻ địch bên trong).


* **Tại BÃO HÒA — Nuôi Lốc Hộ Thể (12 Gió mở + 6 Gió/s, tối đa 5s):**
* *Nhấp lần 1:* Tạo **Lớp Giáp Gió** quanh người (**giảm 25% sát thương nhận & +20% tốc chạy**), đồng thời dựng 1 **Cơn Lốc Tại Chỗ** trên sân cứ lớn dần theo thời gian nuôi. *(Mẹo Combo: Lúc đang nuôi lốc, có thể Giữ 0.5s đổi về Thuận Phong Vũ để xả đạn như thường!)*.
* *Nhấp lần 2:* Ra lệnh cho cơn lốc đã nuôi **phóng đi theo quỹ đạo lượn sóng ngoằn ngoèo** (tự bẻ hướng khóa về phía khu vực của địch). Kẻ địch hoặc vật thể bị lốc cuốn trúng sẽ bị **Hất Tung & Choáng Cứng từ 1.5s $\rightarrow$ 3.0s** (tùy kích cỡ lốc đã nuôi) kèm **1.5 $\rightarrow$ 2.8 Dame**!


* **Tại NGHỊCH PHONG — Cửu Thiên Phong Vũ (15 Gió mở + 10 Gió/s, tối đa 5s):**
* *Nhấp lần 1:* Tung mình **bay vút lên bầu trời** (giống *Thiên* của *Hoa Ảnh*: **Miễn Chọn / Bất Tử**, điều khiển **Vòng Cảnh Báo** di chuyển dưới mặt đất). Ở trên trời càng lâu, Vòng Cảnh Báo càng mở rộng và sát thương tích lũy càng cao; từ **giây thứ 2 trở đi**, vòng cảnh báo bắt đầu phát sinh lực **Hút Nhẹ** kéo kẻ địch vào tâm!


* **Nhấp lần 2 để Đích Thân Đáp Xuống (Chia 3 mốc theo thời gian trên không):**
* **Dưới 2s:** Đáp nhanh xuống quét quạt gây **1.4 Dame + Đẩy Lùi**.
* **Từ 2s – dưới 4s:** Đáp xuống **Múa Quạt Liên Tục trong 2.0s** (chém liên hoàn gây tổng **2.2 Dame**) rồi quét quạt kết thúc gây **1.0 Dame** trước khi lướt về.
* **Trên 4s (Thiên Phong Bão Vũ — Tối đa 6s tại điểm đáp):** Giáng xuống cực mạnh mở ra **Đại Bão Tố** có lực **Hút Cực Mạnh**, múa quạt liên hoàn và tung **3 cú Quét Quạt lớn** trong tổng thời gian **6.0s**!
* **🔥 Cơ chế Thoát Thân Ảo Ảnh (Giây thứ 3):** Đúng vào **giây thứ 3** của cơn bão (sau cú quét quạt đầu tiên), bản thể thật của Diệp Thanh Phong **hóa thành làn gió xanh giật lùi an toàn về lại sân của mình**, để lại **1 Ảo Ảnh Gió** tiếp tục đứng múa nốt **3 giây còn lại** (bán kính và sát thương của Ảo Ảnh trong 3s cuối giảm còn **60%**, nhưng vẫn giữ lực hút và ép góc cực gắt trong khi bản thể thật đã rảnh tay ở nhà xả đạn bồi thêm!).




* **🌪 Nhấn Giữ 0.5s khi đang trên không (Để Lại Vùng Cảnh Báo & Dịch Chuyển Về):**
* Nếu đang ở trên không mà bạn **nhấn giữ nút Bắn 0.5s**, Diệp Thanh Phong sẽ **để lại Vòng Cảnh Báo ngay tại vị trí đó** và lập tức **dịch chuyển an toàn về lại sân nhà** (ngừng tiêu hao Gió duy trì và có thể tự do tung chiêu khác ngay!).
* Vòng Cảnh Báo để lại sẽ tiếp tục tồn tại, **tự nuôi thêm 4.0s** (vẫn mở rộng phạm vi và có lực hút nhẹ), sau đó một **Ảo Ảnh Gió tự động đáp xuống** đúng tâm vòng cảnh báo giống hệt như đòn đáp của bạn nhưng **giảm sát thương và hiệu quả hơn (đạt 65% sát thương, phạm vi và lực hút so với bản thể tự đáp)**!





---

### 🔗 Gợi ý 3 Chuỗi Combo Liên Hoàn (Để AI lập trình Bot & Người chơi sử dụng)

1. **Combo "Nuôi Lốc Ép Góc":**
Ở **Bão Hòa (Nghịch Phong Vũ)** nhấp 1 lần để đặt **Lốc Nuôi** + nhận Giáp Gió $\rightarrow$ Việc kích hoạt cộng `+20 Khí Áp` đẩy bạn lên **Nghịch Phong** $\rightarrow$ Giữ 0.5s đổi sang **Thuận Phong Vũ** dùng *Phong Vũ* lao lên đá thùng/đẩy địch vào hướng lốc $\rightarrow$ Cơn lốc tự phóng đi theo đường ngoằn ngoèo hất tung Choáng 3s!
2. **Combo "Bão Quạt + Cầu Gió Kép":**
Tích sẵn **2 Nhịp** ở *Thuận Phong Vũ* $\rightarrow$ Ở **Thuận Phong (Nghịch Phong Vũ)** tụ **Phong Tụ Cầu** đẩy đi làm chậm cả vùng sân địch $\rightarrow$ Giữ 1.0s **Đổi Khí Áp** nhảy lên **Nghịch Phong** $\rightarrow$ Nhấp *Thuận Phong Vũ* (Nhịp 3) hóa lốc xuyên thẳng vào vùng cầu gió đang nổ để **Múa Quạt 3s** không thể né!
3. **Combo "Thả Bẫy Bão Trên Không & Song Kích":**
Ở **Nghịch Phong (Nghịch Phong Vũ)** bay lên trời $\rightarrow$ Nhấn giữ 0.5s để **cài lại Vòng Cảnh Báo tự nuôi 4s** trên sân địch rồi dịch chuyển về nhà $\rightarrow$ Bản thể ở nhà đổi sang *Thuận Phong Vũ* xả *Lốc Xoáy / Phong Vũ* ép góc đẩy thẳng kẻ địch vào đúng Vòng Cảnh Báo lúc nó tự giáng bão xuống!

---

### 🧬 Tiến hoá (Evo)

| Evo | Giá | Hiệu ứng |
| --- | --- | --- |
| **Khí Lưu Tuần Hoàn** (`evo_dtp_1`) | $100 | **Tối ưu Gió & Nối Mạch Combo:** <br>

<br>• Gió tối đa tăng lên **130**, tốc độ hồi Gió tự nhiên **+30%**. Thời gian **Giữ đổi Thế Quạt** giảm từ 0.5s còn **0.25s**; hồi chiêu **Đổi Khí Áp (Giữ 1s)** giảm từ 8s còn **5.0s** và mỗi lần đổi Khí Áp nhận ngay **1 Khiên Gió**. <br>

<br>• **Tương Tác Liên Hoàn:** Khi **Phong Tụ Cầu** (Thuận Phong) hoặc **Lốc Ngoằn Ngoèo** (Bão Hòa) vẫn đang bay trên sân, nếu bạn tung đòn **Nhịp 3 của Thuận Phong Vũ** chạm vào chúng sẽ kích hoạt **Cộng Hưởng Phong Bạo**: mở rộng bán kính gấp 1.5 lần và hút toàn bộ đạn/kẻ địch xung quanh vào tâm! <br>

<br>• Ở *Phong Vũ (Nghịch Phong)*, thời gian Vòng Cảnh Báo giảm còn **0.75s**. Khi **nhấn giữ trên không để lại Vòng Cảnh Báo**, bạn được hoàn lại **10 Gió** và nhận **+25% tốc chạy 1.5s** khi dịch chuyển về. |
| **Phong Thần Giáng Thế** (`evo_dtp_2`) | $130 | **Cường hóa Cực Đại 3 Trạng Thái Khí Áp:** <br>

<br>• **Thuận Phong:** Cơn Lốc Lớn (Nhịp 3) sau khi hút đạn địch sẽ **bắn trả lại toàn bộ số đạn đó thành chùm lưỡi gió tự ngắm** vào kẻ địch khi nổ ở tường! <br>

<br>• **Bão Hòa:** Chu kỳ *Loạn Phong* giảm từ 10s còn **6.5s**; khi **Lốc Nuôi** đang lớn dần trên sân, nó tự động hút nhẹ đạn địch bay ngang qua để tăng kích thước nhanh gấp đôi. <br>

<br>• **Nghịch Phong:** *Toàn Phong* kích hoạt chỉ sau **4.5s** (hiệu ứng **Gió Cắt** cộng dồn tối đa 3 tầng và làm giảm 40% hồi máu của địch). Ở chiêu **Bay Lên Trời (>4s)**, chỉ cần bay **2.8s** đã đạt mốc Đại Bão Tố tối đa, **Ảo Ảnh** để lại ở giây thứ 3 giữ nguyên **100% phạm vi & sát thương**, và **Vòng Cảnh Báo để lại khi nhấn giữ trên không** chỉ cần tự nuôi **3.0s** với hiệu quả tăng từ 65% lên **85%**! <br>

<br>**FULL EVO (Vạn Lý Trường Phong — Thiên Nhân Hợp Nhất):** <br>

<br>• **Hợp Nhất Khí Áp:** Khi ở vùng **Bão Hòa**, bạn được hưởng thêm **50% nội tại của cả Thuận Phong lẫn Nghịch Phong cùng lúc**; và khi bấm **Đổi Khí Áp (Giữ 1s)**, bạn giữ lại buff của vùng Khí Áp cũ thêm **4.0s**! <br>

<br>• **Chuỗi Nhịp Thần Tốc:** Đòn đặc biệt của *Thuận Phong Vũ* chỉ cần **2 Nhịp** là kích hoạt (thay vì 3 Nhịp)! <br>

<br>• Khi bất kỳ **Khiên Gió** nào trên người bị vỡ, ngoài việc thổi bay đạn gần sẽ lập tức phóng ra **4 Cơn Lốc Nhỏ** truy kích kẻ địch và hồi ngay **25 Gió**! |

* **Kết liễu:** Hạ gục địch -> **PHONG THẦN TUYỆT TỨC** (Diệp Thanh Phong khép quạt, bầu trời nổi cơn đại cuồng phong màu ngọc bích cuốn bổng mục tiêu lên chín tầng mây, hàng ngàn lưỡi đao gió cắt ngang dọc trước khi quạt mở ra thổi tan thành cát bụi).
* **Mã nguồn dự kiến:** `js/characters/diep_thanh_phong/logic.js`, `js/characters/diep_thanh_phong/render.js`, `js/characters/diep_thanh_phong/summons.js`

---

### 💡 Gợi ý kỹ thuật cho Claude Opus khi code:

1. **Xử lý nút Giữ 0.5s vs 1.0s & Khi đang trên không (`isAirborne`):**
* **Khi đang ở mặt đất:**
* Từ `0.4s -> 0.85s`: Vòng sáng màu **Xanh Ngọc** báo hiệu *"Nhả ngay để Đổi Thế Quạt (Thuận $\leftrightarrow$ Nghịch Vũ)"*.
* Chạm mốc `1.0s`: Tự động nổ hiệu ứng **Đổi Khí Áp** ngay lập tức (nếu không đang CD 8s) mà không cần đợi nhả nút!


* **Khi đang bay trên không ở Cửu Thiên Phong Vũ (`player.isAirborne === true`):**
* Nếu người chơi **Nhấp thả (`< 0.5s`)**: Đích thân đáp xuống ngay tại tâm Vòng Cảnh Báo với 100% uy lực theo thời gian đã bay.
* Nếu người chơi **Nhấn Giữ (`>= 0.5s`)**: Gọi hàm `spawnAutonomousSkyZone(x, y, autoGrowTime = 4.0, powerScale = 0.65)` để cài lại Vòng Cảnh Báo tự nuôi thêm 4s rồi tự đáp xuống (giảm dame & hiệu quả còn 65%), đồng thời dịch chuyển `player` về lại sân nhà ngay lập tức (`player.isAirborne = false`)!




2. **Biến trạng thái độc lập cho các chiêu Nuôi (Nghịch Phong Vũ):**
* Lưu `activeChargeOrb` (Phong Tụ Cầu), `activeGrowingTornado` (Lốc Nuôi Bão Hòa) và `autonomousSkyZone` (Vòng Cảnh Báo Cửu Thiên để lại) thành các thực thể độc lập trên sân (`summons`). Nhờ vậy, khi người chơi tạo chiêu hoặc để lại Vòng Cảnh Báo rồi đổi sang *Thuận Phong Vũ*, các thực thể đó vẫn tiếp tục tự nuôi và phát nổ độc lập!

🧬 Tiến hoá (Evo — Yêu Cầu Đủ Fan Để Mua & Duy Trì!) (Bản Hoàn Chỉnh)EvoGiá & Điều kiện FanHiệu ứngChuyến Lưu Diễn Toàn Cầu (evo_idol_1)$95(Yêu cầu: $\ge 6$ Fan để mua & kích hoạt)⚠️ Nếu Fan tụt $< 6$, Evo này tạm thời bị khóa!• Hồi chiêu Buổi Trình Diễn giảm từ 30s xuống còn 22.0s, thời gian giữ nút để mở Sân Khấu giảm từ 1.0s còn 0.6s.• Thời gian giữ nút đổi Phong Cách (1/2/3) giảm từ 0.5s còn 0.25s và mỗi lần đổi Phong Cách giúp giảm 1.0s CD của Phong Cách vừa chuyển tới.• Giảm tốc độ mất Fan khi không đánh trúng địch từ 6s lên 10.0s.Hiện Tượng Mạng (evo_idol_2)$125(Yêu cầu: $\ge 12$ Fan để mua & kích hoạt)⚠️ Nếu Fan tụt $< 12$, Evo này tạm thời bị khóa!• Hội Chứng Cuồng Thần Tượng: Cứ mỗi 2 Fan bạn đang có sẽ cộng thêm +2% Sát thương & +1.5% Tốc chạy ngang (tối đa ở 20 Fan: +20% Dame & +15% Tốc chạy).• Combo Liên Hoàn Phong Cách: Ba Phong Cách không còn dùng chung 1 bộ hồi chiêu mà tách thành 3 CD riêng biệt! (Bạn có thể: Bắn Trái Tim [Phong cách 3] ép địch chạy thẳng hàng theo mình $\rightarrow$ Đổi sang Phong cách 2 bắn Lazer trúng 100% $\rightarrow$ Đổi sang Phong cách 1 Lướt lên nổ Sóng Âm ngay lập tức!).FULL EVO — Huyền Thoại Sân Khấu (Yêu cầu duy trì: $\ge 18$ Fan!):• (Nếu số Fan tụt xuống dưới 18, hiệu ứng Full Evo sẽ tạm ngắt cho đến khi kiếm lại đủ 18 Fan!).• Sân Khấu Rực Rỡ Hợp Nhất: Khi kích hoạt Buổi Trình Diễn, bạn nhận 100% hiệu ứng của Sân Khấu đã chọn + 50% hiệu ứng của cả 2 Sân Khấu còn lại cùng lúc!• Khán Giả Cuồng Nhiệt: Cứ mỗi 5.0s trong lúc Sân Khấu đang mở, Fan hâm mộ từ hai bên khán đài sẽ ném 1 Quả Bóng Ánh Sáng (hoặc Quà Tiếp Tế) vào sân:- Ném về làn của Idol 1 Hộp Quà Fan (nhặt giúp hồi +0.4 HP & +20 Náo Nhiệt).- Đồng thời ném 1 Cây Lightstick Phát Nổ rơi xuống vị trí của kẻ địch (có vòng cảnh báo 0.8s trên làn địch để địch lách ngang né, nổ gây 1.0 Dame + Làm Chậm 30%)!Kết liễu: Hạ gục địch -> BỨC MÀN NHUNG KHÉP LẠI (GRAND FINALE) (Toàn bộ đèn Spotlight trên sân chiếu hội tụ vào xe địch, pháo giấy và hàng ngàn chiếc Lightstick phát sáng nổ tung xung quanh mục tiêu trong tiếng reo hò vang dội của khán giả trước khi tấm rèm nhung đỏ khép lại với dòng chữ SOLD OUT!).
Idot full 