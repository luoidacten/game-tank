# 🦅 HỒ SƠ BODY: RAVEN - OCA (`raven_oca` — Tướng Collab)

> *"Cuộc săn bắt đầu, Oca tìm chúng!"*

* **Xuất xứ:** Những Lữ Khách (Nhân vật Collab đặc biệt)
* **Vai trò:** Đối Đầu / Cơ Động / Kiểm Soát (Chuyển đổi linh hoạt Tầm Gần & Tầm Xa kết hợp Thú Cưng)
* **Chỉ số thực đầu hiệp:** `HP: 4 | Sát thương: 0.5 (Tiểu Liên) / 4.0 (Sniper) | Đạn: 10 (Tiểu Liên) / 4 (Sniper) | Tốc độ: 3.8 | Kích thước: 26×26`
* **Vật triệu hồi đồng hành:** **Oca** (Chim săn mồi cơ khí / thực thể bay lượn ở khu vực giữa sân đấu).

---

## 1. Nội Tại 1: Linh Hoạt (Chuyển Đổi Vũ Khí — CD: 4s)

Raven sở hữu 2 chế độ vũ khí riêng biệt. **Nhấn giữ nút Bắn (~0.4s)** để chuyển đổi qua lại giữa **Tiểu Liên** và **Sniper** (Hồi chiêu chuyển dạng: **4 giây**):

### 🔫 Dạng 1: Tiểu Liên (SMG — Cơ Động Càn Quét)

* **Thông số:** `Băng đạn: 10 viên | Sát thương: 0.5/viên`.
* **Cơ chế bắn (Nhấp Bắn):** Mỗi lần bóp cò xả 1 loạt **3 viên đạn liên tiếp (Burst-fire)** về phía trước.
* **Hiệu ứng khi chuyển từ Sniper $\rightarrow$ Tiểu Liên:** Raven lập tức tung người **lướt ngang một đoạn ngắn (Dash)** theo hướng đang di chuyển để né đòn và áp sát.

### 🎯 Dạng 2: Sniper (Bắn Tỉa — Sát Thương Chí Mạng)

* **Thông số:** `Băng đạn: 4 viên | Sát thương: 4.0/viên`.
* **Cơ chế bắn (Nhấp Bắn):** Raven phải **đứng yên ngắn hạn để ngắm bắn**; bù lại viên đạn bắn ra bay với tốc độ cực cao và gây sát thương khủng khiếp (`4.0` dame).
* **Hiệu ứng khi chuyển từ Tiểu Liên $\rightarrow$ Sniper:** Raven đập xuống sàn một quả **Bom Khói** ngay tại vị trí đứng tồn tại trong **2 giây**. Khi đứng trong màn khói, Raven được **né tránh đạn** của kẻ địch đồng thời thoải mái ngắm khóa mục tiêu như một pháo đài ẩn nấp.

---

## 2. Nội Tại 2: Người Bạn Đồng Hành — OCA

* **Chỉ số của Oca:** Bay lượn ở giữa bản đồ, có lượng máu bằng **50% Max HP của Raven** (`2.0 HP` khởi điểm; nếu tăng máu cho Raven thì máu Oca cũng tăng theo). Khi bị bắn hạ, Oca sẽ tự động hồi sinh sau một khoảng thời gian ngắn.
* **Hành vi của Oca thay đổi đồng bộ theo súng của Raven:**
1. **Khi Raven cầm Tiểu Liên (Oca Quấy Rối & Ám Sát):**
* Oca tiến vào trạng thái **Tàng Hình** trên sân đấu.
* Định kỳ Oca bất ngờ **hiện hình lao thẳng vào tấn công kẻ thù**, gây sát thương quấy rối và tỏa sóng xung kích **Làm Chậm (Slow)** bước di chuyển ngang của địch.


2. **Khi Raven cầm Sniper (Oca Trinh Sát & Khóa Mục Tiêu):**
* Oca bay cao phát sóng radar **Đánh Dấu Mục Tiêu liên tục** lên đầu kẻ địch.
* Nhờ dấu ấn chỉ điểm của Oca, phát bắn Sniper của Raven sẽ **tự động nhắm khóa thẳng vào vị trí kẻ địch dù đang đứng ở bất kỳ đâu trên trục ngang**, đồng thời viên đạn nhận hiệu ứng **Xuyên Vật Thể** (xuyên tường, ụ súng, rương) và **bay nhanh hơn** nữa!





---

## 3. Hệ Thống Tiến Hóa (Evolutions)

| Tiến Hóa | Giá | Hiệu Ứng Chi Tiết |
| --- | --- | --- |
| **Evo 1: Chiến Thuật Đặc Nhiệm** (`evo_raven_1`) | **$100** | • **Đạn Răng Cưa:** Mọi viên đạn bắn ra từ cả 2 dạng súng đều gây thêm hiệu ứng **Chảy Máu (Bleed)**.<br>

<br>• **Khói Đặc Quánh:** Thời gian tồn tại của **Bom Khói tăng thêm +2s** (tổng cộng **4 giây** ẩn mình né đạn).<br>

<br>• **Bộ Pháp Xung Kích:** Khi cầm **Tiểu Liên**, Raven được **tăng mạnh tốc độ di chuyển ngang**.<br>

<br>• **Thay Đạn Tức Thì:** Mỗi khi kích hoạt *Linh Hoạt* để chuyển đổi súng, băng đạn của súng mới sẽ được **nạp đầy ngay lập tức** (bỏ qua thời gian nạp đạn). |
| **Evo 2: Hỏa Lực Không Kích** (`evo_raven_2`) | **$120** | • **Giáp Cường Hóa Oca:** Oca trâu hơn hẳn (tăng máu lên 80% Max HP của Raven) và định kỳ sẽ **hiện vòng cảnh báo đỏ rồi thả Bom** dội thẳng xuống đầu kẻ thù.<br>

<br>• **Tiểu Liên Nâng Cấp:** Mỗi lần bóp cò bắn ra **loạt 5 viên đạn** (thay vì 3 viên) với băng đạn dồi dào hơn.<br>

<br>• **Sniper Hủy Diệt:** Đạn Sniper bay nhanh hơn, lực bắn mạnh hơn và gây hiệu ứng **Trọng Thương (Grievous Wound)**: Toàn bộ lượng máu kẻ địch bị mất do phát bắn Sniper sẽ bị khóa xám — **kẻ địch KHÔNG THỂ hồi phục lại phần máu đó trong vòng 10 giây** (khắc chế cứng các hệ Hồi máu/Hút máu)! |
| **FULL EVO: Huyền Thoại Săn Đêm** | *(Mua đủ 2 Evo)* | • **Oca Bất Tử:** Oca tiến hóa hoàn chỉnh, trở nên **Bất Tử hoàn toàn** (không thể bị tiêu diệt và không còn chặn đạn giùm địch, chỉ tập trung càn quét).<br>

<br>• **Cường Hóa Toàn Diện:** Giảm hồi chiêu chuyển súng *Linh Hoạt* xuống còn `2s`; Oca vừa lao cắn làm chậm, vừa thả mưa bom liên hoàn, vừa giữ khóa mục tiêu vĩnh viễn cho cả Tiểu Liên lẫn Sniper! |

---

Bản thiết kế hồ sơ chuẩn hóa cho Body **Tia Lazer (`lazer_beam`)** — gọn gàng, trực diện, giữ nguyên 100% cơ chế giữ bắn (Hold) như mô-đun của Tùy Biến kèm hiệu ứng chớp tắt:

---

# ⚡ HỒ SƠ BODY: TIA LAZER (`lazer_beam`)

* **Xuất xứ:** Thành Phố Cơ Khí Alano
* **Vai trò:** Đối Đầu (Duy trì sát thương liên tục theo đường thẳng)
* **Chỉ số thực đầu hiệp:** `HP: 3 | Sát thương: 0.2 (mỗi tick) | Đạn: Năng Lượng (100%) | Tốc độ: 3.8 | Kích thước: 28×28`

---

## 1. Cơ Chế Nút Bắn — Chiếu Tia Liên Tục (Hold)

Hoạt động theo cơ chế **Giữ nút Bắn (Hold)** tương tự lối bắn *Hold (tia)* của Body Tùy Biến:

1. **Khởi động & Cảnh báo:** Khi bắt đầu nhấn giữ nút Bắn, xe mất **0.5s tích tụ** năng lượng, tiếp theo hiện đường **cảnh báo 0.5s** dọc theo hướng bắn.
2. **Duy trì Tia Lazer:** Sau thời gian cảnh báo, một luồng tia Lazer được chiếu thẳng ra liên tục gây sát thương (`0.2` dame/tick) chừng nào người chơi còn giữ nút và còn năng lượng.
* **Giảm tốc:** Trong lúc đang chiếu tia Lazer, tốc độ di chuyển ngang của xe bị **giảm xuống**.
* **Tiêu hao & Hồi phục:** Chiếu tia làm tụt thanh Năng Lượng liên tục. Khi nhả nút (hoặc hết năng lượng), cần **0.5s không tiêu hao** để thanh Năng Lượng bắt đầu tự hồi phục lại.


3. **Hiệu ứng Chớp Tắt (Visual & Logic):** Ngay trước khi tia Lazer tắt hẳn (do người chơi nhả nút hoặc do cạn sạch năng lượng), tia Lazer sẽ **chớp tắt liên hồi (flicker)** vài nhịp rồi mới biến mất hoàn toàn để mô phỏng chuẩn hiệu ứng đèn lazer tắt nguồn.

---

## 2. Hệ Thống Tiến Hóa (Evolutions)

| Tiến Hóa | Giá | Hiệu Ứng Chi Tiết |
| --- | --- | --- |
| **Evo 1: Năng Lượng Xanh** (`evo_beam_1`) | **$40** | • Thời gian tích tụ khởi động giảm mạnh từ `0.5s` xuống chỉ còn **0.125s**.<br>

<br>• Tốc độ tiêu hao năng lượng khi giữ bắn **chậm hơn** và tốc độ hồi năng lượng (sau 0.5s nghỉ) **nhanh hơn**. |
| **Evo 2: Khuếch Đại Nhiệt Quang** (`evo_beam_2`) | **$90** | • **Mở Rộng Tia:** Càng giữ chiếu tia lâu, bề ngang của tia Lazer **càng ngày càng phình to và mở rộng ra**.<br>

<br>• **Sát Thương Tăng Tiến & Đốt:** Kẻ địch bị tia Lazer chiếu trúng liên tục càng lâu thì sát thương nhận vào **càng lúc càng đau (ramping damage)**, đồng thời tia Lazer gây thêm hiệu ứng **Thiêu Đốt (Burn)**. |
| **FULL EVO: Quá Tải Quang Học** | *(Mua đủ 2 Evo)* | • **Xóa bỏ giảm tốc:** Khi đang chiếu tia Lazer, xe **không còn bị giảm tốc độ di chuyển** (giữ nguyên tốc `3.8`).<br>

<br>• **Xung Kích Định Kỳ (Mỗi 2s):** Cứ mỗi **2 giây** duy trì đốt/chiếu tia liên tục, nòng súng sẽ tự động phóng chồng thêm **1 Tia Lazer Cực Mạnh (Burst Beam)** dọc theo luồng tia chính gây sát thương nổ lớn! |

---

# 💉 HỒ SƠ BODY: Y SƯ / THÁNH GIẢ TÁI SINH (`healer` / `regenerator`)

> *"Hồi Phục"*

* **Xuất xứ:** Thành Phố Cơ Khí Alano (Y sinh học Nano) hoặc Đế Quốc Phương Đông (Y Tiên)
* **Vai trò:** Sinh Tồn / Kiểm Soát (Biến lượng máu hồi phục dư thừa thành giáp ảo và sát thương nổ theo Max HP)
* **Chỉ số thực đầu hiệp:** `HP: 5 | Sát thương: 0.75 | Đạn: 4 | Tốc độ: 3.5 | Kích thước: 30×30`

---

## 1. Cơ Chế Nút Bắn — Nội Tại: Sinh Mệnh Tuần Hoàn

### 🌿 A. Nội Tại Tự Tái Tạo

* Cứ mỗi **3 giây** không nhận sát thương, xe tự động phát sáng dòng chữ **"Hồi Phục"** và hồi lại **`+0.5 HP`**.

### 🔫 B. Nhấp Nút Bắn — Đạn Hấp Huyết

* Bắn ra viên đạn sinh học màu xanh lục gây **`0.75` sát thương**.
* **Hiệu ứng Hấp Huyết (CD nội tại: 20s):** Khi đạn bắn trúng kẻ địch hoặc Vật triệu hồi sẽ **hồi lại `+0.25 HP**` cho bản thân (sau đó hiệu ứng hút máu từ đạn này vào thời gian hồi **20s**; mỗi khi bắn **Phát Cường Hóa** sẽ **giảm ngay 10s** thời gian hồi này).

### 💥 C. Tích Năng Lượng Hồi Phục & Phát Bắn Cường Hóa

* **Nạp Năng Lượng:** Mỗi khi bản thân được hồi máu (từ nội tại Tự Tái Tạo, Đạn Hấp Huyết, ăn Hòm Máu...), thanh **Năng Lượng Sinh Mệnh** sẽ được nạp đầy dần.
* **Kích hoạt Phát Cường Hóa:** Khi thanh Năng Lượng đầy (Full), phát bắn tiếp theo tự động biến thành **Đạn Sinh Học Cường Hóa**:
* **Sát thương trực tiếp:**

$$\text{Dame Cường Hóa} = 50\% \text{ Max HP} + \text{Dame gốc}$$



*(Ví dụ khởi điểm 5 Max HP, 0.75 Dame $\rightarrow$ gây $2.5 + 0.75 = 3.25$ sát thương).*
* **Hiệu ứng Nổ Lan:** Viên đạn chạm mục tiêu hoặc tường sẽ phát nổ diện rộng (AoE), với **sát thương nổ bằng 15% Dame gốc**.
* **Giảm hồi chiêu:** Ngay khi bắn Phát Cường Hóa, giảm **-10 giây** thời gian hồi của hiệu ứng *Đạn Hấp Huyết*.



---

## 2. Hệ Thống Tiến Hóa (Evolutions)

| Tiến Hóa | Giá | Hiệu Ứng Chi Tiết |
| --- | --- | --- |
| **Evo 1: Hồi Phục Vượt Ngưỡng** (`evo_heal_1`) | **$90** | • **Chuyển Hóa Giáp Trắng (Overheal):** Khi máu đã đầy **100% Max HP**, mọi lượng máu hồi phục dư thừa sẽ không bị mất đi mà tự động chuyển hóa thành **Thanh Máu Ảo (Giáp Trắng)** cộng dồn lên tới tối đa: **`4 + 50% Max HP`**!<br>

<br>• **Cường Hóa Hỏa Lực:** Tăng thêm sát thương cho *Phát Bắn Cường Hóa* (tăng tỉ lệ cộng theo Max HP và sát thương nổ). |
| **Evo 2: Nghịch Lý Y Đạo** (`evo_heal_2`) | **$110** | • *"Thuốc bổ quá liều thành thuốc độc"* — Mỗi khi bạn được hồi máu (từ bất kỳ nguồn nào, kể cả khi đã đầy máu chuyển sang Giáp Trắng), xe tự động phóng ra **1 Tia Xung Năng Lượng Tự Ngắm** bay thẳng vào kẻ địch, gây sát thương bằng **100% lượng máu vừa hồi**.<br>

<br>• **Tối Ưu Nạp:** Giảm lượng Năng Lượng yêu cầu để kích hoạt *Phát Bắn Cường Hóa* (bắn đạn nổ Max HP thường xuyên hơn). |
| **FULL EVO: Bất Tử Y Thần** | *(Mua đủ 2 Evo)* | • **Tái Tạo Cực Đại:** Tốc độ tự hồi máu của nội tại **tăng gấp đôi** (chỉ 1.5s hoặc hồi gấp đôi lượng máu).<br>

<br>• **Độc Dược Cướp Sinh Mệnh (Kháng Hồi Phục):** Đạn bắn trúng kẻ địch sẽ gắn ấn *Kháng Hồi Phục* — Nếu kẻ địch ăn hộp máu hoặc tự hồi máu/hút máu, **toàn bộ lượng máu đó sẽ bị cướp sạch và chuyển thẳng sang hồi cho bạn**!<br>

<br>• **Phát Cường Hóa Tối Thượng:** Sát thương của *Phát Bắn Cường Hóa* tăng vọt lên bằng: **`100% Max HP + Dame gốc`**! |

---
# ⏳ HỒ SƠ BODY: CHRONO & NEO (`chrononeo` — Tướng Collab)

> *"Hai thời đại, một dòng chảy — kẻ làm chủ thời gian sẽ nắm giữ chiến trường!"*

* **Xuất xứ:** Những Lữ Khách (Nhân vật Collab đặc biệt)
* **Vai trò:** Đối Đầu / Cơ Động / Sinh Tồn (Chuyển đổi 2 Thế Súng & Tích lũy Thời Khắc)
* **Chỉ số thực đầu hiệp:** `HP: 4.5 | Sát thương gốc: 1.0 | Đạn: 4 (Chrono) / 10 (Neo) | Tốc độ: 3.3 | Kích thước: 28×28`

---

## 1. Nội Tại 1: Hai Thời Đại & Tham Farm

### 🌾 A. Cơ Chế "Tham Farm" (Tăng Cấp Băng Đạn Vĩnh Viễn)

* Mỗi khi bạn **phá Thùng Tiếp Tế (`Crate`), phá Xe Tiền (`MoneyTruck`), tiêu diệt Vật Triệu Hồi của địch hoặc qua mỗi Hiệp đấu mới**, Chrono & Neo tích lũy **Điểm Thời Đại** để tăng vĩnh viễn dung lượng của cả 2 băng đạn:


* **Băng đạn Chrono (Súng Nặng):** Tăng dần từ **4 viên $\rightarrow$ tối đa 10 viên**.
* **Băng đạn Neo (Súng Nhẹ):** Tăng dần từ **10 viên $\rightarrow$ tối đa 20 viên**.



### 🔄 B. Hai Thế Chiến Đấu & Chuyển Thế (Nhấn Giữ Nút Bắn 0.4s)

Hai thế sở hữu **2 băng đạn tách biệt hoàn toàn** (khi đang cầm Neo thì băng Chrono tự động nạp ngầm và ngược lại). **Nhấn giữ nút Bắn `0.4s**` để **Chuyển Thế (CD: 4s)**:

#### 🕰️ THẾ 1: CHRONO (Cổ Đại — Trọng Pháo Xuyên Phá)

* **Hiệu ứng khi vừa chuyển sang Chrono:** Phát ra một vòng sóng xung kích quanh xe **đẩy lùi đạn/vật thể áp sát** và giúp bản thân **giảm 25% sát thương nhận vào trong 1.5s**.
* **Đánh thường (Nhấp Bắn):** Bắn 1 viên đạn đồng cỡ lớn gây **`×1.5` sát thương (`1.5` dame)**, đi kèm hiệu ứng **Xuyên Vật Cản / Xé Giáp** (phá Khiên cực mạnh). Đánh đổi: Tốc độ bắn chậm hơn `-25%`, nạp lại băng đạn mất `2.5s`.

#### ⚡ THẾ 2: NEO (Tương Lai — Song Kích Tốc Độ)

* **Hiệu ứng khi vừa chuyển sang Neo:** Lướt nhẹ sang ngang và tăng vọt **`+40%` tốc độ chạy ngang trong 1.5s**.
* **Đánh thường (Nhấp Bắn):** Mỗi lần nhấp bắn xả **2 viên đạn liên tiếp** (mỗi viên gây **`×0.75` sát thương = tổng `1.5` dame**). Tăng `+25%` tốc độ bắn, `+10%` tốc độ chạy ngang thường trực, nạp đạn nhanh (`1.5s`).



---

## 2. Nội Tại 2: "Thời Khắc" (Duy Trì Thế Đủ Lâu $\rightarrow$ Đòn Cường Hóa)

Phía dưới chân xe có một **Thanh Đồng Hồ Cát (Thời Khắc)**. Khi bạn **duy trì đứng ở một Thế liên tục đủ 4 giây** (mà không đổi thế), đồng hồ sẽ đầy 100% và phát sáng báo hiệu **Thời Khắc Đã Điểm**.

Lúc này, **lần Nhấp Bắn tiếp theo** sẽ tự động tung ra **Tuyệt Kỹ Cường Hóa (Thời Khắc)** của thế đó (sau khi bắn xong thanh đồng hồ reset về 0 để tích lại 4s mới):

* **💥 Thời Khắc của CHRONO — Liên Xạ Khóa Mục Tiêu:**
* Phát bắn tung ra một sóng Radar quét dọc bản đồ **đánh dấu khóa chết mọi mục tiêu** (Kẻ địch, Vật triệu hồi, Xe tiền, Thùng đồ).


* Ngay lập tức trong `0.5s`, Chrono bước vào trạng thái **Không Thể Cản Phá (Miễn khống chế)** và **xả toàn bộ số đạn đang có trong băng (tối đa 10 viên) bay tự tìm (Homing) chia đều vào các mục tiêu đã đánh dấu BẤT KỂ VỊ TRÍ ĐỨNG**, đồng thời đẩy giật lùi kẻ địch!


* **🌪️ Thời Khắc của NEO — Mưa Đạn Hình Nón & Ảnh Chiếu:**
* Xả tức thì một chùm **8 – 12 viên đạn tỏa hình quạt (nón rộng)** về phía trước mặt, **Xé Toạc Khiên** của đối thủ và gây **Làm Chậm 35% trong 1.5s**.
* Đồng thời tại vị trí vừa đứng sẽ để lại 1 **Ảnh Chiếu Bất Tử tồn tại 5 giây** tự động bắn phụ (`25%` sát thương)!



---

## 3. Hệ Thống Tiến Hóa (Evolutions)

| Tiến Hóa | Giá | Hiệu Ứng Chi Tiết |
| --- | --- | --- |
| **Evo 1: Bước Thời Gian** (`evo_cn_1`) | **$100** | • **Rút Ngắn Thời Khắc:** Thời gian duy trì ở một thế để tích đầy *Thời Khắc* giảm từ `4s` xuống chỉ còn **`2.5 giây`**.<br>

<br>• **Đổi Thế Hoàn Hảo:** Nếu bạn nhấn giữ `0.4s` để **Chuyển Thế ngay sau khi vừa tung đòn Thời Khắc**, băng đạn của thế mới sẽ được **nạp đầy ngay lập tức**; đặc biệt nếu trên sân đang có **Ảnh Chiếu Bất Tử** của thế Neo, khi Chuyển Thế bạn sẽ **Hoán Đổi Vị Trí (Swap)** với Ảnh Chiếu đó! |
| **Evo 2: Dòng Chảy Hội Tụ** (`evo_cn_2`) | **$120** | • **Tăng Tốc Farm:** Bắt đầu hiệp đấu có sẵn **+3 đạn Chrono / +6 đạn Neo**; điểm Thời Đại nhận được từ việc phá thùng/xe tiền nhân đôi.

<br>

<br>• **Nâng Cấp Đòn Thời Khắc:**<br>

<br>  - *Chrono:* Khi kích hoạt *Liên Xạ Khóa Mục Tiêu*, tự động cộng thêm **+4 viên đạn phụ** miễn phí vào loạt xả và viên cuối cùng gây **Nổ Choáng `0.5s**`.<br>

<br>  - *Neo:* *Mưa Đạn Hình Nón* bắn ra 2 đợt liên tiếp và nâng cấp **Ảnh Chiếu Bất Tử** tồn tại lâu hơn (`8s`), bắn ra đạn gây làm chậm. |
| **FULL EVO: Liên Hoa Thời Gian** | *(Mua đủ 2 Evo)* | • Mở khóa **Dung lượng đạn tối đa ngay lập tức** (`10 viên Chrono / 20 viên Neo`) và giảm hồi chiêu Chuyển Thế còn `2s`.<br>

<br>• **Phân Thân Nghịch Đảo (AI Đồng Hành):** Triệu hồi vĩnh viễn **1 AI Phụ** cùng di chuyển và tự động chiến đấu trên làn đường của bạn, nhưng **luôn cầm dạng súng NGƯỢC LẠI với dạng hiện tại của bạn**:<br>

<br>  - Khi bạn đang cầm **Chrono**, AI Phụ sẽ ở dạng **Neo** (chạy nhanh xả đạn kép).<br>

<br>  - Khi bạn đang cầm **Neo**, AI Phụ sẽ ở dạng **Chrono** (bắn đại pháo xuyên giáp).<br>

<br>  - **Đồng Bộ Đổi Dạng:** Mỗi khi bạn bấm **Chuyển Thế**, AI Phụ cũng **lập tức đổi sang dạng ngược lại tương ứng** (kích hoạt luôn hiệu ứng sóng đẩy của Chrono hoặc lướt tăng tốc của Neo tại vị trí của nó!).<br>

<br>• **Hợp Nhất Liên Hoa:** Cứ sau mỗi **2 lần kích hoạt đòn Cường Hóa *Thời Khắc***, bạn và AI Phụ sẽ đồng loạt xả bão đạn Liên Hoa dọc màn hình trong `4s` và kết thúc bằng loạt đại pháo **Nở Rộ** phủ kín sân địch! |

# ♊ HỒ SƠ BODY: GEMINI (`gemini` — Song Sinh AI)

> *"Hai cá thể, một ý thức — chừng nào một người còn đứng vững, chúng ta là bất bại!"*

* **Xuất xứ:** Thành Phố Cơ Khí Alano (Dự án Trí Tuệ Nhân Tạo Song Bản)
* **Vai trò:** Sinh Tồn / Kiểm Soát / Đối Đầu (Tác chiến 2v1, bọc lót hồi sinh và tăng tiến sức mạnh theo số Hiệp đấu `R`)
* **Chỉ số thực đầu hiệp (cho mỗi cá thể):** `HP: 3.5 (×2 xe = tổng 7 HP) | Sát thương: 0.75 | Đạn: 4 | Tốc độ: 3.6 | Kích thước: 26×26`
* **Vật triệu hồi đặc biệt:** **Bản Sao AI (Twin AI)** có thanh máu, băng đạn và chỉ số ngang bằng 100% với bản thể người chơi.

---

## 1. Nội Tại 1: AI Tự Hành (Tác Chiến Độc Lập)

* Ngay khi bắt đầu hiệp đấu, trên làn đường ngang của bạn xuất hiện **2 xe Gemini**: **Bạn (Bản thể chính)** và **AI Tự Hành (Bản sao)**.
* **Hành vi độc lập:** Bản sao AI tự động di chuyển Trái/Phải trên trục ngang để né đạn, tự nhặt Thùng Tiếp Tế (`Crate`), bắn phá Xe Tiền (`MoneyTruck`) và chủ động xả đạn tấn công kẻ địch hoàn toàn độc lập với thao tác bấm nút của bạn.


* Mọi nâng cấp Module chân (Động Cơ, Giáp Thép, Bánh Xích) bạn mua trong Shop đều được áp dụng cho cả bạn lẫn AI!



---

## 2. Nội Tại 2: Sinh Mệnh Song Hành (Gục & Thanh Tiến Độ Cứu)

* **Trạng thái Gục (Downed State):**
* Khi **Bạn** hoặc **AI** bị bắn cạn máu về `0 HP`, cá thể đó rơi vào trạng thái **GỤC**: Đứng im tại chỗ, không thể di chuyển hay tấn công, dưới chân hiện một **Vòng Tròn Cứu Trợ** kèm **Thanh Tiến Độ Cứu (0% – 100%)**.
* *Điều kiện thua hiệp đấu:* Hiệp đấu chỉ kết thúc (Thua) khi **CẢ HAI (Bạn và AI) cùng bị Gục một lúc**!


* **Cơ chế Cứu Dậy & Tụt Thanh Cứu (Decay):**
* Người còn sống chỉ cần đi vào đứng trong **Vòng Tròn Cứu Trợ** của người bị gục đủ **`2.0 giây`** (tích đầy 100% thanh cứu) để **hồi sinh đồng đội dậy với 50% Max HP**!
* **Tụt thanh cứu khi rời vùng (Cơ bản):** Nếu đang cứu dở mà người cứu phải bước ra khỏi vòng để né đạn **quá lâu (trên `1.0s`)**, thanh tiến độ cứu sẽ **bị giảm (tụt ngược) dần về 0%**.
* **Nhân đôi thời gian sau mỗi lần gục:** Cứ sau mỗi lần được cứu dậy trong cùng 1 hiệp, thời gian cần đứng để tích đầy thanh cứu lần tiếp theo sẽ **tăng gấp đôi**:

$$\text{Thời gian cứu} = 2\text{s} \rightarrow 4\text{s} \rightarrow 8\text{s} \rightarrow 16\text{s}...$$





---

## 3. Thao Tác Chủ Động: Chuyển Giao Ý Thức (Nhấn Giữ Nút Bắn 0.4s — CD: 3s)

* **Không cần chờ gục:** Bất cứ lúc nào trong trận đấu, bạn đều có thể **nhấn giữ nhẹ nút Bắn trong `0.4s**` để thực hiện **Chuyển Giao Ý Thức**: Lập tức hoán đổi quyền điều khiển trực tiếp qua lại giữa Bạn và xe AI (giúp bạn linh hoạt né đạn bằng cả 2 xe hoặc đổi góc xả súng bất ngờ).

---

## 4. Hệ Thống Tiến Hóa (Evolutions)

| Tiến Hóa | Giá | Hiệu Ứng Chi Tiết |
| --- | --- | --- |
| **Evo 1: Liên Kết Thần Kinh** (`evo_gem_1`) | **$90** | • **AI Phối Hợp:** AI thông minh hơn, biết giữ khoảng cách tránh đạn nổ lan, biết bắn ép góc và ưu tiên chạy lại cứu bạn.

<br>

<br>• **Tối Ưu Chuyển Giao:** Hồi chiêu của thao tác *Chuyển Giao Ý Thức* được **giảm mạnh**. Đồng thời, thanh tiến độ cứu **sẽ không bị giảm** khi rời vùng cứu.<br>

<br>• **Cấp Cứu Thần Tốc:** Vòng tròn hồi sinh rộng hơn 50%. Lần hồi sinh đầu tiên trong hiệp nhanh gấp đôi (`1.0s`) và không tính nhân đôi thời gian. |
| **Evo 2: Đệ Quy Vô Tận** (`evo_gem_2`) | **$120** | • **Tăng Tiến Đệ Quy (Càng Đánh Càng Mạnh & Trâu theo Round `R`):** Cả 2 xe tự động tăng tốc chạy, tốc bắn theo thời gian giao tranh và cộng dồn chỉ số (Max HP, Dame, hiệu ứng đạn) qua mỗi Round (`R`).<br>

<br>• **Búp Sức Mạnh Chuyển Giao:** Ngay sau khi thực hiện *Chuyển Giao Ý Thức*, **cả hai xe (cả bạn lẫn AI) đều được tăng mạnh Tốc độ di chuyển, Tốc độ bắn và Sát thương trong vòng 1 giây**. |
| **FULL EVO: Siêu Trí Tuệ Song Hành** | *(Mua đủ 2 Evo)* | • **AI Cảnh Giới Tối Thượng:** AI đạt trí khôn tối đa, tự cân đối giữa việc cứu đồng đội hay kết liễu kẻ địch.<br>

<br>• **Tự Tái Khởi Động:** Lần gục đầu tiên tự động đứng dậy 100% không cần cứu; các lần sau tự tăng đến 99% chỉ cần chạm nhẹ là hồi sinh.<br>

<br>• **Đạn Tự Ngắp Cực Hạn (Auto-Aim):** Hiệu ứng tăng sức mạnh sau khi chuyển đổi được buff cực mạnh — **ngay sau khi bạn thực hiện *Chuyển Giao Ý Thức*, toàn bộ đường đạn của cả 2 xe sẽ tự động khóa mục tiêu (Auto-Aim) chuẩn xác vào kẻ địch trong 0.5 giây tiếp theo**, kết hợp hiệu ứng Đệ Quy bùng nổ! |
Hồ sơ chuẩn hóa của **Huyết Ma (`blood_lord`)** đã được cập nhật đầy đủ theo đúng các quy tắc tiêu hao đạn, ngưỡng 50% Bể Máu của Huyết Cầu và tốc độ `4.0`:

---

### 9. Huyết Ma (`blood_lord`) — *"Máu = sức mạnh!"*

* **Chỉ số:** `HP: 3 | Dame: 0.25 | Đạn: 6 (Nghỉ đánh 0.5s mới bắt đầu hồi đạn) | Bể Máu: Max HP × 2 | Tốc: 4.0 | Size: 28×28`
* **Nội tại — Bể Máu (Blood Pool):**
* **Dung lượng tối đa:** `Max HP × 2` (khởi điểm = `6` điểm Bể Máu).
* **Cách tích lũy:** Tăng khi bản thân hồi máu, khi đánh trúng địch, hoặc **bất kỳ mục tiêu nào trên sân (bạn, kẻ địch, vật triệu hồi, xe tiền...) bị mất máu**.
* **Chuyển hóa Hồi Phục:** Sau **8s** không mất máu/không dùng kỹ năng tốn máu, Bể Máu tự động rút ra để hồi lại máu cơ bản (HP) theo tỉ lệ: **`2 Bể Máu = 1 HP`**.
* *(Bảo hiểm sinh mạng: Kỹ năng tự trừ máu sẽ không làm HP tụt xuống dưới `0.5 HP`).*


* **Kỹ năng (Tứ Huyết Thức — Giữ nút Bắn 0.25s để xoay vòng 4 dạng bắn):**
*(Lưu ý: Mọi dạng tấn công đều tiêu hao từ băng đạn 6 viên; chỉ bắt đầu hồi lại đạn sau **0.5s không tấn công**).*
1. **Đạn Thường (Tiêu hao: `1 Đạn`):** Bắn đạn máu cơ bản gây `0.25 dame` để cấu rỉa và tích Bể Máu an toàn.
2. **Huyết Phá (Tiêu hao: `2 Đạn` + `1 HP`):** Hóa thành dơi **Bất Tử** lướt cực nhanh lao thẳng lên phía trước (như `Xe TANK` hoặc *Phá* của Hoa Ảnh). Khi chạm vật thể/mục tiêu sẽ hóa thành vùng **Bầy Dơi** gây sát thương liên tục trong **2s** rồi giật về chỗ cũ.


* *Thưởng:* Gây sát thương cộng **rất nhiều điểm Bể Máu** và hồi nhẹ HP; nếu kẻ địch đứng trong vùng Bầy Dơi suốt **đủ 2s** sẽ giúp Huyết Ma **hồi lại `2 HP**`.


3. **Huyết Tiễn (Tiêu hao: `3 Đạn` + `1 HP`):** Hiện đường cảnh báo ngắn rồi bắn một **Tia Máu Lazer** xuyên dọc màn hình.
4. **Huyết Cầu (Tiêu hao: `Toàn bộ số đạn còn lại (tối thiểu 1)` + `Toàn bộ X điểm Bể Máu`):** Phóng ra Quả Cầu Máu bay xuyên qua mọi thứ và phát nổ khi chạm tường biên đối diện.
* **Dưới 50% Bể Máu:** Vẫn dùng được nhưng quả cầu **rất nhỏ, sát thương và vụ nổ yếu**, đồng thời **KHÔNG kích hoạt** *Bóng Ma Màn Đêm*.
* **Từ 50% Bể Máu trở lên:** Quả cầu phình to, **tăng mạnh sát thương xuyên & bán kính nổ** theo lượng Bể Máu tiêu hao, đồng thời mở khóa đòn kế tiếp thành **Nội tại 2 — Bóng Ma Màn Đêm**:
* **Bóng Ma Màn Đêm:** Lần bấm bắn tiếp theo sẽ bay vút lên trời (**không thể bị chọn làm mục tiêu**, điều khiển vòng cảnh báo dưới đất giống *Thiên* của Hoa Ảnh). Khi chủ động bấm bắn đáp xuống (hoặc hết giờ), tạo ra vùng **Đại Tiệc Máu** tại điểm rơi (giống *Huyết Phá* nhưng **rộng hơn và lâu hơn**), vừa nạp đầy Bể Máu vừa **hồi lượng lớn HP**!






* **Tiến hóa:**
* **Evo 1 — Huyết Ảnh Đào Thoát ($90):** Tích lũy Bể Máu nhanh hơn. Khi nhận **sát thương chí tử**, lập tức **hóa dơi dịch chuyển đến vị trí khác, Bất Tử 2s và hồi ngay 50% Bể Máu** (1 lần/hiệp).
* **Evo 2 — Huyết Thể Cường Hóa ($120):** Cộng thêm **`+4 Max HP`** (lên 7 HP $\rightarrow$ Bể Máu 14). Các kỹ năng mạnh hơn và **ít tiêu hao máu hơn** (chỉ tốn `0.5 HP`). Sau **6s** tự hồi máu với tỉ lệ **`1.5 Bể Máu = 1 HP`**.
* **Full Evo — Huyết Tổ Bất Diệt:**
* Cộng thêm **`+2 Max HP`** (lên 9 HP $\rightarrow$ Bể Máu 18), giảm sâu mức tiêu hao máu, kỹ năng mạnh vượt trội và tích Bể Máu cực nhanh (kẻ địch hồi máu bạn cũng nhận được tích lũy Bể Máu).
* Dịch chuyển thoát chết của *Evo 1* hồi **100% Bể Máu**; tự hồi máu chỉ sau **4s** với tỉ lệ **`1 Bể Máu = 1 HP`**.
* **Hồi Sinh (1 lần/trận):** Khi chết mà **Bể Máu đang Đầy (100%)**, lập tức tiêu hết Bể Máu để **hồi sinh tại chỗ**!
# CẬP NHẬT CHÍNH XÁC LOGIC: CUỒNG CHIẾN BINH (`berserker`)

Hãy chỉnh sửa lại thông số và logic của `berserker` theo bản chuẩn dưới đây (ưu tiên bản này thay cho bản cũ):

## 1. Chỉ Số Gốc
* **HP:** `6` | **Sát thương:** `0.25` | **Đạn:** `∞` (Vô hạn) | **Tốc độ:** `4.2` (1.2x gốc) | **Kích thước:** `30×30`

## 2. Nội Tại 1: Cuồng Chiến (Theo % Max HP hiện tại)
* Tính theo tỷ lệ `HP hiện tại / Max HP hiện tại` (để tương thích khi mua thêm Giáp Thép +HP).
* Các mốc **THAY THẾ NHAU (Override)** theo ngưỡng máu thấp nhất đạt được (KHÔNG cộng dồn chồng 3 mốc vào nhau để tránh lỗi >100% giảm sát thương):
  * **Mốc 1 (`HP <= 75% Max HP`):** `+15%` Tốc bắn | `-10%` Sát thương nhận vào | `+8%` Tốc chạy | `+15%` Sát thương.
  * **Mốc 2 (`HP <= 50% Max HP`):** `+30%` Tốc bắn | `-20%` Sát thương nhận vào | `+15%` Tốc chạy | `+30%` Sát thương.
  * **Mốc 3 (`HP <= 25% Max HP`):** `+50%` Tốc bắn | `-30%` Sát thương nhận vào | `+25%` Tốc chạy | `+50%` Sát thương.
* **Chuyển đổi lối bắn ở mốc `<= 50% Max HP`:**
  * **Khi `HP > 50%`:** Bắn đơn từng viên (Tap).
  * **Khi `HP <= 50%` (hoặc đang trong trạng thái Huyết Chiến):** Mở khóa cơ chế **Sấy Liên Thanh (Hold)** giống `smg`. Giữ nút Bắn càng lâu đạn xả càng nhanh và độ lệch (spread) tỏa dần từ `0°` lên tối đa `28°` sau `1.5s`.

## 3. Nội Tại 2: Đánh Trả & Đạn Cường Hóa (Huyết Đạn)
* **Kích hoạt:** Mỗi khi nhận sát thương trực tiếp `>= 0.25` (tính cả khi mất Khiên hoặc mất máu):
  * Nhận buff **+25% Tốc độ di chuyển trong `1.5s`** (làm mới thời gian nếu nhận tiếp sát thương).
  * Cộng **`+12` điểm** vào thanh **Huyết Chiến**.
  * Chuyển viên đạn bắn ra kế tiếp thành **Huyết Đạn** (tối đa tích trữ 1 viên tại một thời điểm):
    * **Kích thước đạn:** To gấp đôi viên đạn thường (`16×16 px` — lưu ý KHÔNG phải `60×60 px`).
    * **Sát thương:** `0.75` (gấp 3 lần đạn gốc, cộng thêm % buff từ nội tại Cuồng Chiến).

## 4. Nội Tại 3: Huyết Chiến (Thanh 0 – 100)
* **Cách tích lũy (ở trạng thái thường):**
  * Nhận sát thương (`>= 0.25`): **`+12` điểm**.
  * Bắn đạn trúng kẻ địch: **`+4` điểm**.
* **Kích hoạt Trạng Thái Huyết Chiến:**
  * Khi thanh Huyết Chiến đạt **100/100** và xe nhận **sát thương chí tử** (đòn đánh làm `HP <= 0`): Xe **KHÔNG CHẾT**, khóa máu ở mức tối thiểu (`1 HP` hoặc `< 1 HP`), xóa mọi hiệu ứng khống chế và bước vào trạng thái **HUYẾT CHIẾN**.
* **Quy tắc trong trạng thái Huyết Chiến:**
  * **Bất tử máu:** Không bị trừ HP; mọi sát thương nhận vào từ kẻ địch sẽ trừ thẳng vào thanh Huyết Chiến theo công thức:
    `Điểm Huyết Chiến bị trừ = Sát thương nhận vào × 10`
  * **Buff trạng thái:** Luôn kích hoạt tối đa mốc `<= 25% HP` của *Cuồng Chiến*, cộng thêm **`+35%` Tốc bắn, `+20%` Tốc chạy, `+30%` Sát thương** và luôn bắn ở chế độ **Sấy Liên Thanh (SMG)**.
  * **Tự tụt & Hồi phục:**
    * Thanh Huyết Chiến tự động giảm **`12 điểm / giây`**.
    * Mỗi viên đạn bắn trúng đối thủ trong lúc này giúp hồi lại **`+2 điểm` Huyết Chiến**.
  * ⚠️ **Quy tắc Chống Câu Giờ Ngoài Bo (Đột Tử / Sudden Death sau 60s):**
    * Chữ "Đốt" trong thiết kế là **sát thương đốt từ Vòng Bo Đột Tử (Sudden Death ngoài vùng an toàn)**, KHÔNG phải hiệu ứng lửa của Lò Nung.
    * Nếu xe đứng ngoài vùng an toàn của Vòng Bo Đột Tử, thanh Huyết Chiến sẽ bị đốt tụt cực nhanh (**`-40 điểm / giây`**), bất tử không chặn được sát thương bo!
  * **Kết thúc:** Khi thanh Huyết Chiến tụt về `0`:
    * Nếu **chưa có FULL EVO**: Xe chết ngay lập tức.
    * Nếu **đã có FULL EVO**: Kích hoạt nội tại *Tàn Hơi Cuối Cùng* (xem mục Full Evo).

## 5. Hệ Thống Tiến Hóa (Evolutions)

* **Evo 1 — Khát Máu Cực Hạn (`evo_bers_1` — Giá: `$90`):**
  * Tăng **×1.5 lần** hiệu quả chỉ số của nội tại *Cuồng Chiến* (nhưng giới hạn Giảm sát thương nhận vào tối đa ở mức `-45%`), tăng tốc độ tích thanh Huyết Chiến thêm `+25%`.
  * **Duy trì Bất Bại (Grace Period):** Khi vừa bước vào *Huyết Chiến*, thanh Huyết Chiến được **giữ nguyên ở mức 100 (không bị tụt theo giây và không bị trừ bởi sát thương địch) trong `1.0 giây` đầu tiên**.

* **Evo 2 — Đấu Trường Huyết Địa (`evo_bers_2` — Giá: `$110`):**
  * Trong suốt thời gian trạng thái **Huyết Chiến**, tạo ra một **Vùng Giới Hạn Di Chuyển** (2 bức tường biên khóa hai bên Trái – Phải, độ rộng vùng khoảng `260px` lấy vị trí lúc kích hoạt làm tâm, luôn nằm gọn trong sân).
  * Cả Cuồng Chiến Binh lẫn đối thủ đều **không thể đi bộ hoặc lướt vượt ra ngoài biên vùng này** (nhưng vẫn di chuyển qua lại tự do bên trong vùng).
  * **Tương tác Cổng Không Gian (`portal`):** Biên của vùng này được tính là **Tường Cứng** — `portal` không thể bắn cổng xuyên qua hoặc dịch chuyển ra ngoài vùng.

* **FULL EVO — Chiến Thần Bất Tử (Mua đủ Evo 1 + Evo 2):**
  * **Cường hóa Evo 1 & Evo 2:**
    * Hiệu quả nội tại *Cuồng Chiến* tăng **×1.8 lần** (Giảm sát thương nhận vào tối đa `-50%`).
    * Thời gian giữ nguyên thanh Huyết Chiến lúc đầu tăng từ `1.0s` lên **`1.5 giây`**.
    * Vùng Huyết Địa của Evo 2 thu gọn còn `220px` (ép góc sát hơn) và **làm chậm 25% tốc độ di chuyển của kẻ địch** đứng trong vùng.
  * **Nội tại mới — Tàn Hơi Cuối Cùng (Sống Sót Sau Huyết Chiến):**
    * Khi thanh Huyết Chiến tụt hết về `0`, Cuồng Chiến Binh **KHÔNG CHẾT** mà vẫn sống sót với **`0.5 HP` (dưới 1 máu)** và mất trạng thái bất tử.
    * Ở trạng thái `0.5 HP` này, thanh Huyết Chiến có thể được tích lũy lại từ `0`, nhưng **mỗi phát đạn bắn trúng kẻ địch chỉ cộng `+1 điểm` Huyết Chiến**.
    * Nếu người chơi sống sót và tích đầy lại **100/100 Huyết Chiến** (bằng cách bắn trúng hoặc dùng Khiên đỡ đòn kích hoạt *Đánh Trả*), xe có thể **kích hoạt lại trạng thái Huyết Chiến một lần nữa**! (Giới hạn hồi sinh giữ mạng theo cơ chế này tối đa **2 lần mỗi hiệp** để tránh lỗi ván đấu vô tận).