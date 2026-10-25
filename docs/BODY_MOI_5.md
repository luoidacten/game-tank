# Đặc tả body mới đợt 5 (người dùng gửi)

> Ghi chú: phần Idol chỉ có bảng Evo/kết liễu (thiếu phần cơ chế chính) — chờ người dùng gửi đủ. Đặc tả đầy đủ Diệp Thanh Phong + Skinwalker ở docs/BODY_MOI_6.md.

### 97. The Clock — Kẻ Ngưng Đọng Thời Gian (`the_clock`) 🆕 *(Bản Cập Nhật Chuẩn Hóa)*

*"Tích tắc... Đủ 24 nhịp kim gõ, thời gian sống của ngươi chính thức khép lại!"*
**Vai trò chính:** Kiểm Soát / Cơ Động (Tương tác với nội tại của *Joker* và *Skinwalker*).
HP: 4.5 | Dame: 0.25 (Trong `Time_Zone`: 0.5) | Đạn: 4 (Đạn Kim Đồng Hồ) | Tốc: 3.8 | Kích thước: 28×28.

* **Chỉ số thực đầu hiệp:** HP 4.5 · Sát thương 0.25 · Đạn 4 · Tốc độ 3.8 · Kích thước 28×28
* **Vật triệu hồi / hiệu ứng:** Không Gian Ngưng Đọng (`Time_Zone`), Ấn Đếm Ngược (1 → 24 nhịp).
* **Cơ chế kỹ năng & Nội tại:**
1. **Đòn bắn thường — Kim Giây & Cường Hóa Thời Không (Nhấp Bắn):**
* **Ở trạng thái thường:** Bắn ra mũi kim đồng hồ gây **0.25 Dame** (sát thương cơ bản thấp để bù cho nội tại khống chế & kết liễu).
* **Khi bắn trong `Time_Zone` (Đạn Cường Hóa Thời Không):** Các viên đạn được khai hỏa trong lúc `Time_Zone` đang mở sẽ tự động chuyển hóa thành **Kim Giờ Cường Hóa** (treo lơ lửng tại vị trí bắn): khi `Time_Zone` kết thúc và thời gian trôi trở lại, chúng lao vút đi với sát thương gấp đôi (**0.5 Dame**), có khả năng **Xuyên Thấu (xuyên mọi vật cản/tường)** và gây **Làm Chậm 35% trong 1.5s** khi trúng đích!


2. **Nội tại Cốt Lõi — ĐẾM NGƯỢC (Countdown — Tích Lũy Số Phát Trúng):**
* Mỗi viên đạn của The Clock bắn **trúng tướng địch** sẽ cộng **+1 Nhịp Đếm Ngược** lên mục tiêu (hiển thị mặt đồng hồ số từ `1` đến `24` trên đầu kẻ địch, không bị mất đi trong hiệp):
* **Mốc Lặp Lại (Cứ mỗi 3 phát trúng — Nhịp 3, 6, 9, 12, 15, 18, 21):** Ngay khi trúng phát thứ 3 của mỗi chu kỳ, tiếng chuông điểm nhịp vang lên khiến kẻ địch lập tức bị **CHOÁNG 1.0s**!
* **Mốc 12 Phát Trúng (Nửa Vòng Sinh Mệnh):** Vẫn nổ Choáng 1.0s của chu kỳ 3 phát như bình thường, đồng thời mở khóa vĩnh viễn hiệu ứng **Dư Chấn Thời Không** cho hiệp đó: mỗi khi `Time_Zone` kết thúc, ngay khoảnh khắc vừa thoát khỏi ngưng đọng, kẻ địch lập tức bị **Khựng Choáng 0.25s** (làm địch không thể lách né ngay ở tích tắc đầu tiên khi các mũi kim gài sẵn vừa lao tới!).
* **Mốc 24 Phát Trúng (Điểm Cuối Thời Gian — Tử Hình):** Ngay khi viên đạn thứ 24 chạm vào người kẻ địch, đồng hồ điểm đúng 12 giờ đêm — kẻ địch bị **KẾT LIỄU NGAY LẬP TỨC (Instant Execute — xuyên qua mọi lượng Máu, Giáp Trắng và Khiên còn lại)**!




3. **Kỹ năng chủ động — `Time_Zone` (Nhấn Giữ 0.5s | Hồi chiêu: 12.0s):**
* **Kích hoạt Ngưng Đọng:** Mở ra vùng **`Time_Zone`** bao phủ toàn sân đấu trong tối đa **5.0s** *(Có thể nhấn **Giữ 0.4s lần nữa** để chủ động kết thúc sớm)*.
* **Quy Luật Trong `Time_Zone`:**
* **Đóng Băng Kẻ Thù:** Tướng địch, vật triệu hồi và toàn bộ đạn của địch đang bay trên sân lập tức **ngưng đọng hoàn toàn tại chỗ**.
* **Đạn Bạn Cũng Ngưng Đọng & Khóa Nạp Đạn:** Bạn được tự do di chuyển Trái/Phải và nhấp bắn để gài các mũi **Kim Giờ Cường Hóa (0.5 Dame, Xuyên Thấu, Làm Chậm)** treo lơ lửng dọc theo làn ngang của mình, nhưng **KHÔNG THỂ nạp lại đạn** trong suốt lúc `Time_Zone` mở. Khi hết 5.0s (hoặc chủ động tắt), toàn bộ đạn đã gài đồng loạt phóng thẳng lên sân địch!




4. **⚡ Ngoại Lệ Thời Không (Tương tác đặc biệt với các Body hệ Thời Gian):**
* **Đối với *Chrono & Neo* (`chrono_neo`):**
* **Dạng Chrono:** Đạn của Chrono **vẫn bay bình thường** trong khoảng thời gian đóng băng, nhưng bản thân xe Chrono **không thể di chuyển ngang**.
* **Dạng Neo:** Neo **vẫn có thể di chuyển ngang (Trái/Phải) bình thường** trong lúc đóng băng, nhưng **không thể tấn công**.


* **Đối với *Paradox* (`paradox`):**
* Sau khi kích hoạt **Tua Ngược (Rewind)**, Paradox có thể **di chuyển hoặc tấn công hoàn toàn bình thường** bên trong `Time_Zone`.







---

## 🧬 Tiến hoá (Evo)

| Evo | Giá | Hiệu ứng |
| --- | --- | --- |
| **Dây Cót Dư Trữ** (`evo_clock_1`) | $95 | **Thêm Đạn Gài & Tăng Tốc Tích Nhịp:** <br>

<br>• Băng đạn tối đa tăng thêm **+1 viên** (thành **5 viên**), tốc độ nạp đạn ở trạng thái thường nhanh hơn **25%**. <br>

<br>• Ngay khi kích hoạt `Time_Zone`, bạn được **hồi ngay lập tức +2 viên đạn** vào băng (trước khi bị khóa nạp) và nhận **+35% Tốc chạy ngang** trong suốt lúc ngưng đọng để dễ dàng chạy rải đạn! |
| **Kim Giờ Gia Tốc** (`evo_clock_2`) | $125 | **Đẩy Nhanh Đếm Ngược & Cường Hóa Time_Zone:** <br>

<br>• Hồi chiêu `Time_Zone` giảm từ 12.0s xuống còn **8.5s**. Đạn Cường Hóa bắn trong `Time_Zone` khi phóng đi bay **nhanh hơn +45%** và hiệu ứng Làm Chậm tăng lên **45%**. <br>

<br>• **Nhảy Kim Đồng Hồ:** Mỗi lần kích hoạt **Choáng 1.0s (sau mỗi 3 phát trúng)**, nếu kẻ địch đang ở trong trạng thái bị Làm Chậm (từ đạn `Time_Zone`), bạn được **hồi ngay +1 viên đạn**! <br>

<br>**FULL EVO (Chúa Tể Thời Không — Án Tử 12 Giờ):** <br>

<br>• **Rút Ngắn Định Mệnh:** Ngưỡng kích hoạt hiệu ứng choáng sau khi thoát `Time_Zone` giảm từ 12 xuống **10 phát trúng** (thời gian choáng khi vừa thoát `Time_Zone` tăng từ 0.25s lên **0.4s**), và ngưỡng **KẾT LIỄU TỨC THÌ giảm từ 24 xuống chỉ còn 20 phát trúng**! <br>

<br>• **Hoàn Trả Thời Gian:** Nếu bạn chủ động kết thúc sớm `Time_Zone`, mỗi **1 giây còn dư** sẽ giúp **giảm 1.2s hồi chiêu** của lần `Time_Zone` kế tiếp! |

* **Kết liễu:** Hạ gục địch -> **ĐỒNG HỒ ĐIỂM 12 GIỜ** (Mặt đồng hồ La Mã khổng lồ hiện lên dưới nền sân đấu điểm đúng số `XXIV (24)`, kim giờ và kim phút chập làm một tạo ra vết nứt thời không xóa sổ hoàn toàn mục tiêu).
* **Mã nguồn dự kiến:** `js/characters/the_clock/logic.js`, `js/characters/the_clock/render.js`

---

### 💡 Gợi ý kỹ thuật cho Claude Opus khi code nội tại `Đếm Ngược`:

```javascript
// 1. Khi tạo đạn (onShoot):
const inTZ = game.timeZoneActive && game.timeZoneOwner === player;
spawnBullet({
  damage: inTZ ? 0.5 : 0.25,     // Thường: 0.25 | Trong Time_Zone: 0.5
  pierceObstacles: inTZ,         // Trong Time_Zone: Xuyên vật cản/tường
  slowAmount: inTZ ? (player.hasEvo2 ? 0.45 : 0.35) : 0,
  slowDuration: inTZ ? 1.5 : 0,
  frozenInTimeZone: inTZ
});

// 2. Khi đạn của The Clock bắn trúng tướng địch (onBulletHitEnemy):
enemy.clockHitCount = (enemy.clockHitCount || 0) + 1;
const hits = enemy.clockHitCount;
const executeThreshold = (player.hasEvo1 && player.hasEvo2) ? 20 : 24;

// Kiểm tra Kết Liễu Tức Thì (24 phát, Full Evo: 20 phát):
if (hits >= executeThreshold) {
  executeTargetInstantly(enemy, 'CLOCK_24_HITS_EXECUTE');
  return;
}

// Kiểm tra lặp lại mỗi 3 phát trúng (3, 6, 9, 12, 15, 18, 21...):
if (hits % 3 === 0) {
  enemy.stunTimer = Math.max(enemy.stunTimer || 0, 1.0); // Choáng 1s
}

// 3. Khi Time_Zone kết thúc (onTimeZoneEnd):
const postTZStunThreshold = (player.hasEvo1 && player.hasEvo2) ? 10 : 12;
if ((enemy.clockHitCount || 0) >= postTZStunThreshold) {
  const postStunDur = (player.hasEvo1 && player.hasEvo2) ? 0.4 : 0.25;
  enemy.stunTimer = Math.max(enemy.stunTimer || 0, postStunDur); // Choáng 0.25s ngay khi thoát Time_Zone
}

```

Bạn xem bản cập nhật của **#97. The Clock** với sát thương `0.25 / 0.5` và chuỗi nội tại **Đếm Ngược `3 / 12 / 24**` này đã chuẩn xác 100% ý bạn chưa nhé! Giờ chúng ta chỉ còn đúng **3 vị trí đơn giản (#94, #95, #96)** nữa là hoàn thiện trọn bộ 100 Body!
Dưới đây là phần hoàn thiện nốt cho bảng **Tiến hoá (Evo)**, hiệu ứng kết liễu và gợi ý code của **#96. Idol (`idol`)**, nối tiếp ngay từ dòng đang bị đứt đoạn của bạn:

---

### 🧬 Tiến hoá (Evo — Yêu Cầu Đủ Fan Để Mua & Duy Trì!) *(Bản Hoàn Chỉnh)*

| Evo | Giá & Điều kiện Fan | Hiệu ứng |
| --- | --- | --- |
| **Chuyến Lưu Diễn Toàn Cầu** (`evo_idol_1`) | **$95**<br>

<br>*(Yêu cầu: $\ge 6$ Fan để mua & kích hoạt)*<br>

<br>⚠️ *Nếu Fan tụt $< 6$, Evo này tạm thời bị khóa!* | • Hồi chiêu **Buổi Trình Diễn** giảm từ 30s xuống còn **22.0s**, thời gian giữ nút để mở Sân Khấu giảm từ 1.0s còn **0.6s**. <br>

<br>• Thời gian giữ nút đổi **Phong Cách (1/2/3)** giảm từ 0.5s còn **0.25s** và mỗi lần đổi Phong Cách giúp **giảm 1.0s CD** của Phong Cách vừa chuyển tới. <br>

<br>• Giảm tốc độ mất Fan khi không đánh trúng địch từ 6s lên **10.0s**. |
| **Hiện Tượng Mạng** (`evo_idol_2`) | **$125**<br>

<br>*(Yêu cầu: $\ge 12$ Fan để mua & kích hoạt)*<br>

<br>⚠️ *Nếu Fan tụt $< 12$, Evo này tạm thời bị khóa!* | • **Hội Chứng Cuồng Thần Tượng:** Cứ mỗi **2 Fan** bạn đang có sẽ cộng thêm **+2% Sát thương & +1.5% Tốc chạy ngang** (tối đa ở 20 Fan: **+20% Dame & +15% Tốc chạy**). <br>

<br>• **Combo Liên Hoàn Phong Cách:** Ba Phong Cách không còn dùng chung 1 bộ hồi chiêu mà **tách thành 3 CD riêng biệt**! *(Bạn có thể: Bắn Trái Tim [Phong cách 3] ép địch chạy thẳng hàng theo mình $\rightarrow$ Đổi sang Phong cách 2 bắn Lazer trúng 100% $\rightarrow$ Đổi sang Phong cách 1 Lướt lên nổ Sóng Âm ngay lập tức!)*. <br>

<br>**FULL EVO — Huyền Thoại Sân Khấu (Yêu cầu duy trì: $\ge 18$ Fan!):** <br>

<br>• *(Nếu số Fan tụt xuống dưới 18, hiệu ứng Full Evo sẽ tạm ngắt cho đến khi kiếm lại đủ 18 Fan!)*. <br>

<br>• **Sân Khấu Rực Rỡ Hợp Nhất:** Khi kích hoạt *Buổi Trình Diễn*, bạn nhận **100% hiệu ứng của Sân Khấu đã chọn + 50% hiệu ứng của cả 2 Sân Khấu còn lại cùng lúc**! <br>

<br>• **Khán Giả Cuồng Nhiệt:** Cứ mỗi **5.0s** trong lúc Sân Khấu đang mở, Fan hâm mộ từ hai bên khán đài sẽ ném **1 Quả Bóng Ánh Sáng (hoặc Quà Tiếp Tế)** vào sân: <br>

<br>  - Ném về làn của Idol **1 Hộp Quà Fan** (nhặt giúp hồi **+0.4 HP & +20 Náo Nhiệt**). <br>

<br>  - Đồng thời ném **1 Cây Lightstick Phát Nổ** rơi xuống vị trí của kẻ địch (có vòng cảnh báo 0.8s trên làn địch để địch lách ngang né, nổ gây **1.0 Dame + Làm Chậm 30%**)! |

* **Kết liễu:** Hạ gục địch -> **BỨC MÀN NHUNG KHÉP LẠI (GRAND FINALE)** (Toàn bộ đèn Spotlight trên sân chiếu hội tụ vào xe địch, pháo giấy và hàng ngàn chiếc Lightstick phát sáng nổ tung xung quanh mục tiêu trong tiếng reo hò vang dội của khán giả trước khi tấm rèm nhung đỏ khép lại với dòng chữ `SOLD OUT!`).
* **Mã nguồn dự kiến:** `js/characters/idol/logic.js`, `js/characters/idol/render.js`, `js/characters/idol/fan_shop.js`

---

### 💡 Gợi ý kỹ thuật cho Claude Opus khi code cơ chế `Idol`:

1. **Kiểm tra điều kiện bật/tắt Evo theo số Fan (`checkIdolEvoActive`):**
```javascript
// Trong hàm update(dt) của Idol:
const fans = player.fans || 0;
player.isEvo1Active = player.hasEvo1 && (fans >= 6);
player.isEvo2Active = player.hasEvo2 && (fans >= 12);
player.isFullEvoActive = player.hasEvo1 && player.hasEvo2 && (fans >= 18);
// Mọi kiểm tra sức mạnh Evo của Idol đều gọi qua 3 biến boolean này thay vì hasEvo1/hasEvo2!

```


2. **Xử lý hiệu ứng `Mê Hoặc` (Charm) chuẩn trục ngang 1D (`Phong Cách 3`):**
```javascript
// Khi enemy đang dính hiệu ứng Mê Hoặc (enemy.charmedTimer > 0):
enemy.canAttack = false; // Khóa bắn (Câm lặng đòn đánh)
// Tự động di chuyển sang Trái/Phải để luôn đứng thẳng hàng dọc (cùng trục X) với Idol:
const diffX = idolPlayer.x - enemy.x;
if (Math.abs(diffX) > 4) {
  enemy.x += Math.sign(diffX) * Math.min(Math.abs(diffX), enemy.speed * dt);
}

```



---

98. The Adapter — Cỗ Máy Thích Nghi (the_adapter) 🆕"Ngươi càng ra đòn, ta càng bất bại. Đánh càng lâu... tử huyệt của ngươi càng phơi bày!"Vai trò chính: Sinh Tồn / Đối Đầu (Tương tác với nội tại của Joker và Skinwalker).HP: 5.5 | Dame: 1.0 (Tăng dần theo thời gian) | Đạn: 4 | Tốc: 3.6 | Kích thước: 30×30.Chỉ số thực đầu hiệp: HP 5.5 · Sát thương 1.0 · Đạn 4 · Tốc độ 3.6 · Kích thước 30×30Vật triệu hồi / hiệu ứng: Vòng Xoay Thích Ứng (Adaptation Wheel), Ấn Lộ Điểm Yếu (Exposed Weakness).Cơ chế kỹ năng & Nội tại (Lối chơi "Càng đánh lâu càng áp đảo"):Nội tại 1 — Thích Ứng Vai Trò & Đòn Đánh (Vòng Xoay Thích Ứng):Thích Ứng Vai Trò (Đầu hiệp): Ngay khi vào hiệp, hệ thống quét Vai Trò Chính của kẻ địch để kích hoạt vĩnh viễn 1 mô-đun khắc chế nền tảng:Gặp Địch Đối Đầu: Nhận +0.5 Max HP và đạn đẩy lùi nhẹ kẻ địch sang ngang.Gặp Địch Kiểm Soát: Đạn gây x2.5 Dame lên Vật triệu hồi/Tường và giảm 35% hiệu ứng Làm Chậm nhận vào.Gặp Địch Cơ Động: Nhận +0.3 Tốc chạy ngang và đạn bay nhanh hơn +30% (dễ bắn trúng mục tiêu chạy nhanh).Gặp Địch Sinh Tồn: Đạn gây -35% hiệu quả hồi máu của địch và gây thêm +0.3 Dame khi bắn vào Khiên/Giáp trắng.Vòng Xoay Thích Ứng (Tích lũy tối đa 6 Nấc):Cứ mỗi 3.5s giao tranh trôi qua — HOẶC mỗi khi nhận đủ 1.0 sát thương từ kẻ địch — chiếc Vòng Xoay trên lưng xe sẽ kêu "Cạch!" và xoay thêm +1 Nấc Thích Ứng:Mỗi Nấc Thích Ứng giúp The Adapter nhận: +6% Giảm Sát Thương nhận vào, +0.12 Sát thương đạn, và +5% Tốc chạy ngang & Tốc nạp đạn (Tại 6 Nấc: Giảm 36% sát thương, +0.72 Dame, +30% Tốc chạy & Tốc nạp!).Kháng Hiệu Ứng Đòn Đánh: Nếu nấc xoay kích hoạt do trúng đòn đốt/độc (DoT), Vòng Xoay lập tức xóa sạch hiệu ứng đốt/độc đó; nếu kích hoạt do trúng đạn liên thanh, nhận ngay +0.3 Giáp Trắng!Nội tại 2 — Phân Tích Tử Huyệt (Kẻ Thù Càng Đánh Lâu Càng Lộ Điểm Yếu):Mỗi khi kẻ địch khai hỏa đủ 4 lần (hoặc mỗi khi đạn của The Adapter bắn trúng xe địch 2 lần), hệ thống máy tính sẽ bắt bài quỹ đạo và gắn +1 tầng Lộ Điểm Yếu lên người kẻ địch (tối đa 5 tầng, tồn tại đến hết hiệp):Hiệu ứng mỗi tầng Lộ Điểm Yếu lên kẻ địch:Kẻ địch phải nhận thêm +7% Sát Thương từ mọi đòn đánh của The Adapter (Tối đa ở 5 tầng: +35% sát thương nhận vào!).Do đã bị bắt bài hành động, mỗi tầng làm đạn của kẻ địch bắn ra bị giảm 4% tốc độ bay và tốc độ nạp đạn của địch bị chậm đi 4% (Tối đa -20% ở 5 tầng).Đạt 5 Tầng (Đã Bắt Bài Hoàn Toàn): Mọi viên đạn của The Adapter bắn vào kẻ địch sẽ xuyên qua 50% hiệu ứng Giảm Sát Thương của chúng!Kỹ năng chủ động — Ép Xung Bắt Bài (Giữ Bắn 0.4s | Hồi chiêu: 7.5s):Lập tức thúc đẩy Vòng Xoay nhích thêm +1 Nấc Thích Ứng, tự hồi +0.3 HP, lướt nhẹ sang ngang để né đạn và bắn ra 1 viên Đạn Khai Thác Tử Huyệt bay dọc sân:Gây 1.1 Dame cơ bản + 0.2 Dame với mỗi tầng Lộ Điểm Yếu đang có trên người kẻ địch (lên tới 2.1 Dame ở 5 tầng!) và làm kẻ địch bị Làm Chậm 30% trong 1.5s.🧬 Tiến hoá (Evo)EvoGiáHiệu ứngHọc Sâu Thời Gian Thực (evo_adapter_1)$90Thích Ứng Nhanh Gấp Bội:• Giới hạn Vòng Xoay Thích Ứng mở rộng từ 6 lên 8 Nấc (đạt tối đa 48% Giảm Sát Thương & +0.96 Dame!). Thời gian tự xoay mỗi nấc giảm từ 3.5s xuống chỉ còn 2.5s.• Mỗi khi kẻ địch sử dụng Kỹ năng Giữ Bắn, The Adapter lập tức phân tích chiêu thức đó: xoay ngay +1 Nấc Thích Ứng và gắn thẳng +1 tầng Lộ Điểm Yếu lên kẻ địch!Phá Giải Hoàn Toàn (evo_adapter_2)$120Khai Thác Tận Cùng Điểm Yếu:• Giới hạn Lộ Điểm Yếu trên kẻ địch tăng từ 5 lên 7 tầng (kẻ địch nhận thêm tới +49% sát thương và giảm 28% tốc đạn/tốc nạp!).• Khi kẻ địch đã bị gắn từ 4 tầng Lộ Điểm Yếu trở lên, mỗi phát bắn thường của The Adapter trúng đích sẽ hút lại +0.15 HP và đánh cắp 10% tốc chạy ngang của địch trong 1.5s.FULL EVO (Thần Cơ Bất Bại — Kẻ Thống Trị Hậu Kỳ):• Ký Ức Chiến Đấu: Bắt đầu mỗi hiệp đấu mới, The Adapter có sẵn 2 Nấc Thích Ứng và kẻ địch bị gắn sẵn 1 tầng Lộ Điểm Yếu ngay từ giây đầu tiên!• Trạng Thái Hoàn Mỹ (Khi đạt 8/8 Nấc Thích Ứng): Vòng Xoay phát sáng rực rỡ — đạn bắn thường to gấp rưỡi, Xuyên Vật Cản, cứ mỗi 6.0s tự động tạo 1 lớp Khiên Thích Ứng, và mọi đòn đánh trúng kẻ địch đang có đủ 7 tầng Điểm Yếu sẽ nổ thêm 0.4 sát thương chuẩn!Kết liễu: Hạ gục địch -> PHÂN TÍCH HOÀN TẤT: 100% LỖI (Vòng xoay sau lưng The Adapter quay tít phát sáng vàng kim, hiện bảng thông số giải phẫu toàn bộ điểm yếu trên thân xe địch trước khi một tia năng lượng chuẩn xác bắn xuyên qua lõi động cơ làm xe địch nổ tung).Mã nguồn dự kiến: js/characters/the_adapter/logic.js, js/characters/the_adapter/render.js💡 Gợi ý kỹ thuật cho Claude Opus khi code:Biến trạng thái cực gọn trên player và enemy:player.adaptStacks (0 $\rightarrow$ 6, Evo 1: 8): Tăng mỗi khi adaptTimer >= 3.5 (Evo 1: 2.5) hoặc damageTakenAccumulator >= 1.0.enemy.weaknessStacks (0 $\rightarrow$ 5, Evo 2: 7): Tăng mỗi khi enemy.shotsFiredCount % 4 === 0 hoặc khi đạn của the_adapter trúng enemy 2 lần.Hiển thị trực quan (render.js):Vẽ một Vòng Tròn 8 Chấu (như bánh đà cơ khí) phía sau lưng xe: mỗi khi lên 1 nấc adaptStacks, vòng bánh đà quay thêm 45 độ và sáng thêm 1 mắt đèn vàng.Trên người enemy, vẽ biểu tượng Hồng Tâm Quét Điểm Yếu kèm con số x1 $\rightarrow$ x7 để người chơi thấy rõ kẻ địch đang ngày càng mỏng manh!

Dưới đây là bản thiết kế đã được điều chỉnh và cân bằng lại hoàn toàn cho **Phản Chiếu (`prism`)** theo đúng các yêu cầu mới của bạn (bỏ tích khiên tự động, nerf dame phản cơ bản, thêm cơ chế nhận sát thương nhỏ khi phản chưa có Evo, tạo cửa sổ timing 0.25s cực gắt cho kỹ năng giữ để phản 100-150% và cơ chế khắc chế đặc biệt với *Lazer Xuyên Phá*):

---

### 84. Phản Chiếu — Lăng Kính Tuyệt Đối (`prism`) 🆕

*"Lazer sao? Hay là đạn xuyên thủng? Nếu không chuẩn xác... ngươi sẽ phải trả giá bằng máu của chính mình!"*
**Vai trò chính:** Sinh Tồn / Kiểm Soát (Tương tác với nội tại của *Joker* và *Skinwalker*).
HP: 4.5 | Dame: 1.0 | Đạn: 5 (Tia Khúc Xạ) | Tốc: 3.6 | Kích thước: 28×28.

* **Chỉ số thực đầu hiệp:** HP 4.5 · Sát thương 1.0 · Đạn 5 · Tốc độ 3.6 · Kích thước 28×28
* **Vật triệu hồi / hiệu ứng:** Khiên Kính Lấp Lánh, Tia Phản Xạ Khúc Xạ.
* **Cơ chế kỹ năng & Nội tại:**
1. **Đòn bắn thường — Tia Khúc Xạ (Nhấp Bắn):**
* Bắn ra một luồng đạn ánh sáng sắc nét bay cực nhanh gây **1.0 Dame** (nảy tường 1 lần).


* *(Lưu ý: Đã loại bỏ hoàn toàn cơ chế tự động tích khiên qua thời gian hoặc số phát bắn).*


2. **Nội tại Cốt Lõi — KÍNH LẤP LÁNH (Sparkling Glass):**
* Mọi lớp **Khiên** (nhận từ hộp tiếp tế, module hoặc kỹ năng) trên người Phản Chiếu đều hóa thành **Khiên Kính Lấp Lánh**.
* **Cơ chế Phản Xạ & Nhận Sát Thương (Neft Dame Phản):**
* Khi Khiên bị đánh trúng, nó kích hoạt **Kính Lấp Lánh trong 1.2s** trước khi vỡ hoàn toàn.
* **Sát thương phản & Phạt khi chưa có Evo:** Mặc định sát thương phản lại khá yếu. Nếu **chưa có Evo**, khi phản đòn Phản Chiếu vẫn sẽ **bị trừ 0.5 HP** cho mỗi đợt nhận sát thương. Lên Evo 1 sẽ giảm trừ này, và sẽ được **miễn hoàn toàn sát thương phạt** khi đạt Full Evo. Sát thương phản tối đa (khi full Evo) cũng chỉ đạt mức **100% sát thương gốc**.




3. **Kỹ năng chủ động — Mở Kính Chủ Động (Giữ Bắn 0.4s | Hồi chiêu: 9.0s):**
* **Ưu tiên khiên:** Hệ thống sẽ **luôn luôn ưu tiên tiêu hao lớp lá chắn từ kỹ năng Mở Kính** trước khi trừ vào các nguồn khiên khác.
* **Cửa Sổ Vàng — Timing 0.25s Đầu Tiên (Phản Tuyệt Đối):**
* Trong **0.25s đầu tiên** ngay khi vừa bật kỹ năng giữ, Phản Chiếu đạt trạng thái **Phản Tuyệt Đối**: hoàn toàn **không chịu sát thương**, phản lại **100% – 150% sát thương** (tăng dần theo cấp Evo), và đạn bị phản sẽ được **tăng tốc độ bay**.
* Sau 0.25s đầu đó cho đến hết thời gian kỹ năng, kính chuyển về trạng thái phản bình thường (chịu phạt 0.5 máu nếu chưa có Evo và dame phản bị giới hạn).




4. **Tương Tác Đặc Biệt — Khắc Chế Lazer Xuyên Phá:**
* Do *Lazer Xuyên Phá* quá mạnh, nếu bạn bật kính đỡ thông thường (ngoài cửa sổ 0.25s đầu), tia lazer sẽ không thể phản ngược lại mà bị **chuyển góc khúc xạ lệch hướng sang bên cạnh**, đồng thời bạn sẽ **bị mất 2.0 HP** do quá tải năng lượng!


* **Phá giải bằng Timing:** Trừ khi bạn cực kỳ cao thủ, dùng kỹ năng giữ chuẩn xác đến từng **0.125s đầu tiên** để timing đúng nhịp — lúc này bạn mới có thể phản ngược hoàn toàn *Lazer Xuyên Phá* về mặt kẻ địch!





---

## Tiến hoá (Evo)

| Evo | Giá | Hiệu ứng |
| --- | --- | --- |
| **Lăng Kính Khuếch Đại** (`evo_prism_1`) | $90 | • Sát thương phản trả trong cửa sổ vàng 0.25s đầu được tăng lên, đồng thời **giảm bớt lượng máu bị phạt** khi phản đòn ở trạng thái kính thường. <br>

<br>• Kéo dài thời gian bật chủ động lên **2.5s** (hồi chiêu giảm còn **7.0s**). Đạn bị phản tự động bẻ góc nhẹ hướng về phía tướng địch. |
| **Gương Vỡ Tái Sinh** (`evo_prism_2`) | $120 | • Đầu hiệp đấu nhận sẵn **1 lớp Khiên Kính Lấp Lánh**. <br>

<br>• Tối ưu hóa cửa sổ timing phản đòn: giúp việc bắt nhịp 0.125s với *Lazer Xuyên Phá* dễ thở hơn một chút, đồng thời khi kính vỡ sẽ phóng ra mảnh kính gây sát thương diện rộng. <br>

<br>**FULL EVO (Thần Quang Vạn Tượng — Bất Hoại Lăng Kính):** <br>

<br>• **Miễn Nhiễm Hoàn Toàn:** **Miễn phí hoàn toàn 0.5 HP bị phạt** khi phản đòn (không còn mất máu khi đỡ đòn bằng kính). <br>

<br>• Đạt mức **100% Dame phản tối đa** cùng khả năng đẩy hiệu suất cửa sổ vàng 0.25s lên mức tối đa (**phản 150% sát thương** + tăng tốc đạn cực đại). |

* **Kết liễu:** Hạ gục địch -> **VẠN KÍNH QUY QUANG** (Hàng chục tấm gương lăng kính hiện ra bủa vây mục tiêu, một tia sáng phản xạ qua lại với tốc độ ánh sáng cắt nát đối thủ trước khi đồng loạt nổ tung).
* **Mã nguồn dự kiến:** `js/characters/prism/logic.js`, `js/characters/prism/render.js`
* ### 83. Tỉnh — Kẻ Trấn Áp (`tinh`) 🆕

*"Ngươi đang cố chạy sao?"*
**Vai trò chính:** Kiểm Soát / Đối Đầu (Tương tác với nội tại Lá Bài A và Sao Chép của *Joker* cũng như *Skinwalker*).
HP: 5.5 | Dame: 1.1 | Đạn: 4 (Đạn Trọng Lực) | Tốc: 3.4 | Kích thước: 30×30.

* **Chỉ số thực đầu hiệp:** HP 5.5 · Sát thương 1.1 · Đạn 4 · Tốc độ 3.4 · Kích thước 30×30
* **Vật triệu hồi / hiệu ứng:** Vùng Cấm Chế (Suppression Zone), Ấn Ngưng (Stasis Mark).
* **Cơ chế kỹ năng & Nội tại:**
1. **Nội tại 1 — Khó Chịu (Annoyance Gauge: 0 – 10 điểm):**
* Tỉnh cực kỳ ghét những kẻ tăng động. Bất cứ khi nào kẻ địch thực hiện **Hành Động Gây Khó Chịu**, Tỉnh lập tức nhận điểm **Khó Chịu** và kích hoạt phán quyết **Ngưng** lên kẻ địch:
* **Kẻ địch dùng kỹ năng Lướt (Dash), Nhảy, Lao Húc, hoặc Dịch Chuyển (Teleport/Hoán đổi):** Tỉnh nhận ngay **+2 Khó Chịu**.
* **Kẻ địch di chuyển quãng đường dài trong thời gian ngắn (đi bộ/tăng tốc dịch chuyển $> 160\text{px}$ trong vòng $1.2\text{s}$):** Tỉnh nhận **+1 Khó Chịu** (hồi kiểm tra quãng đường mỗi $1.2\text{s}$).




2. **Nội tại 2 — Ngưng (Stasis Punishment):**
* Mỗi khi kẻ địch thực hiện **Hành Động Gây Khó Chịu** nêu trên, chúng lập tức bị đóng **+1 tầng Ngưng** (tồn tại **5.0s**, tích thêm tầng mới sẽ làm mới thời gian 5s; nếu sau 5s không tích thêm sẽ tự giảm dần).
* **Hiệu ứng mỗi tầng Ngưng:** Mỗi tầng làm kẻ địch bị **Giảm 20% Tốc độ di chuyển** (1 tầng: -20%, 2 tầng: -40%).
* **ĐỦ 3 TẦNG NGƯNG (Ngưng Đọng Thời Không):** Kẻ địch lập tức bị **CHOÁNG CỨNG 3.0s** ngay tại vị trí vừa dừng, đồng thời nhận **0.8 sát thương chuẩn**! Sau khi hết choáng, số tầng Ngưng reset về 0 (miễn tích lại tầng Ngưng trong 1.5s ngay sau khi vừa tỉnh dậy để tránh khóa chết vĩnh viễn).


3. **Cơ chế Tiêu Hao (5 Khó Chịu) — Đạn Cấm Chế:**
* **Tự động hoặc Chủ động:** Khi thanh **Khó Chịu đạt $\ge 5$ điểm**, phát bắn kế tiếp (hoặc nhấn **Giữ Bắn 0.4s** để chủ động nạp sẵn vào nòng) sẽ tiêu hao **5 Khó Chịu**, biến thành **Đạn Cấm Chế**:
* **Tốc độ bay & Uy lực:** Đạn to gấp rưỡi, bay nhanh gấp **x2.0 tốc đạn gốc**, gây **x1.6 Dame (1.75 Dame)** và xuyên vật cản.
* **Vùng Cấm Chế (Suppression Zone):** Khi Đạn Cấm Chế trúng đích (hoặc chạm biên sân địch), nó mở ra một **Vùng Cấm Chế** hình chữ nhật/tròn lớn (bán kính **125px**) tồn tại trong **4.0s**:
* **Khóa Cơ Động (Sa Lầy):** Kẻ địch đứng bên trong bị **Cấm hoàn toàn mọi kỹ năng Lướt, Lao, Bay lên trời hoặc Dịch Chuyển**!
* **Giới Hạn Phạm Vi Di Chuyển:** Dựng rào cản trọng lực quanh viền vùng — kẻ địch đã nằm trong Vùng Cấm Chế sẽ **không thể bước hay lướt ra khỏi phạm vi vùng đó** suốt 4.0s (tương tự lồng giam của *Trối Chết*, trừ *Juggernaut* có Bá Thể)!











---

## Tiến hoá (Evo)

| Evo | Giá | Hiệu ứng |
| --- | --- | --- |
| **Ánh Nhìn Áp Chế** (`evo_tinh_1`) | $90 | **Tích Khó Chịu & Ngưng Nhạy Hơn:** <br>

<br>• Giới hạn lưu trữ **Khó Chịu** tăng lên **15 điểm** (có thể bắn liền 3 phát Đạn Cấm Chế nếu địch lướt nhiều). Quãng đường di chuyển kích hoạt Khó Chịu giảm từ $160\text{px}$ xuống chỉ còn **$120\text{px}$ trong $1.2\text{s}$** (địch chỉ cần đi qua lại né đạn bình thường cũng tự bị dính **Ngưng**!). <br>

<br>• Thời gian tồn tại của tầng **Ngưng** kéo dài từ 5s lên **7.0s**; mỗi tầng Ngưng ngoài giảm tốc còn làm kẻ địch **nhận thêm +10% sát thương** từ Tỉnh. <br>

<br>• Nếu kẻ địch cố tình đứng im một chỗ quá **2.5s** để né nội tại *Ngưng*, Tỉnh tự động nhận **+1 Khó Chịu mỗi giây** ("Đứng im cũng làm ta khó chịu!"). |
| **Lĩnh Vực Tĩnh Lặng** (`evo_tinh_2`) | $120 | **Cường hóa Đạn Cấm Chế & Trừng Phạt Choáng:** <br>

<br>• Chi phí kích hoạt **Đạn Cấm Chế** giảm từ 5 xuống chỉ còn **4 Khó Chịu**! <br>

<br>• **Vùng Cấm Chế** mở rộng bán kính lên **155px**, tồn tại **5.0s**, rút máu kẻ địch bên trong (**0.3 HP/s**) và làm **đạn của kẻ địch bắn ra từ trong vùng bị giảm 35% tốc độ bay**. <br>

<br>• Khi kẻ địch bị **Choáng 3.0s do đủ 3 tầng Ngưng**, Tỉnh lập tức được **hồi đầy băng đạn**, nhận **1 lớp Khiên** và phát bắn đầu tiên vào mục tiêu đang bị choáng gây **Chí Mạng x2.0 Dame**! <br>

<br>**FULL EVO (Tuyệt Đối Tĩnh Lặng — "Đứng Yên Cho Ta!"):** <br>

<br>• **Cưỡng Chế Ngưng Đọng:** Đạn Cấm Chế khi bắn trúng trực tiếp tướng địch sẽ lập tức cộng thẳng **+1 tầng Ngưng** (giúp Tỉnh chủ động kích nổ Choáng 3s kể cả khi địch sợ không dám di chuyển!). <br>

<br>• **Phản Chấn Dịch Chuyển:** Nếu kẻ địch đang ở trong **Vùng Cấm Chế** hoặc đang có **$\ge 2$ tầng Ngưng**, mọi vật triệu hồi của địch cũng bị làm chậm 50%; và khi kẻ địch bị nổ **Choáng 3s (đủ 3 Ngưng)**, thời gian hồi chiêu của toàn bộ kỹ năng kẻ địch bị **đóng băng (không hồi)** suốt 3s đó! |

* **Kết liễu:** Hạ gục địch -> **NGƯNG ĐỌNG VĨNH HẰNG** (Không gian quanh mục tiêu chuyển sang màu trắng đen tĩnh lặng, hàng chục xiềng xích trọng lực khóa chặt từng bánh xe của kẻ địch trước khi một viên đạn trọng lực khổng lồ nghiền nát mục tiêu thành tro bụi).
* **Mã nguồn dự kiến:** `js/characters/tinh/logic.js`, `js/characters/tinh/render.js`, `js/characters/tinh/summons.js`

---

### 💡 Gợi ý kỹ thuật cho Claude Opus khi code:

1. **Cách bắt sự kiện "Hành Động Gây Khó Chịu" (`checkEnemyMovementAndDash`):**
* **Bắt Lướt / Dịch chuyển:** Trong `update(dt)`, kiểm tra nếu trong 1 frame mà khoảng cách dịch chuyển của `enemy` vượt quá tốc độ đi bộ bình thường (`frameDist > enemy.speed * 1.8`) hoặc `enemy.isDashing / enemy.justTeleported === true` (có cooldown chống lặp `0.4s` cho cùng 1 cú lướt):
* Gọi `triggerAnnoyance(player, enemy, amount = 2)`.


* **Bắt Di chuyển quãng đường ngắn trong thời gian ngắn:** Lưu một mảng lịch sử vị trí hoặc biến `rollingDistance` của `enemy` trong cửa sổ thời gian `1.2s`. Nếu `rollingDistance >= 160` (Evo 1: `120`):
* Gọi `triggerAnnoyance(player, enemy, amount = 1)` và reset `rollingDistance = 0`.




2. **Hàm `triggerAnnoyance(player, enemy, amount)`:**
* Cộng `player.annoyance = Math.min(maxAnnoyance, player.annoyance + amount)`.
* Cộng `enemy.stasisStacks = (enemy.stasisStacks || 0) + 1`, đặt `enemy.stasisDecayTimer = player.hasEvo1 ? 7.0 : 5.0`.
* Nếu `enemy.stasisStacks >= 3`:
* Gây **Choáng 3.0s** (`enemy.stunTimer = Math.max(enemy.stunTimer, 3.0)`).
* Reset `enemy.stasisStacks = 0`, gán `enemy.stasisImmunityTimer = 1.5` (tránh vừa hết choáng đã bị cộng dồn chồng ngay lập tức).





### 82. Wind — Cơn Gió Mỏng Manh (`wind`) 🆕

*"Cơn gió mỏng manh... chạm vào là tan biến, ngưng đọng là cuồng phong!"*
**Vai trò chính:** Đối Đầu / Cơ Động (Tương tác với nội tại Lá Bài A và Sao Chép của *Joker* cũng như *Skinwalker*).
HP: 3.0 | Dame: 0.8 (Tích tụ lên tới x2.5) | Đạn: 6 (Đạn Gió) | Tốc: 4.4 | Kích thước: 24×24.

* **Chỉ số thực đầu hiệp:** HP 3.0 · Sát thương 0.8 · Đạn 6 · Tốc độ 4.4 · Kích thước 24×24
* **Vật triệu hồi / hiệu ứng:** Trạng thái Hóa Gió (Wind Form), Dư Phong.
* **Cơ chế kỹ năng & Nội tại:**
1. **Nội tại — Gió Nhẹ (Gentle Breeze - Biến thiên Tụ Lực & Liên Xạ):**
* **Ngưng Phong (Khi KHÔNG bắn):** Sau 0.5s ngừng bắn, dòng gió quanh xe bắt đầu nén lại, tăng dần sát thương cho phát bắn kế tiếp thêm **+35% Dame mỗi giây** (tối đa **+150% = x2.5 Dame [2.0 Dame]** sau ~4.2s không bắn). Ở mức tối đa, viên đạn gió to gấp đôi, bay cực nhanh và đẩy lùi nhẹ mục tiêu. Ngay khi bắn ra, lượng sát thương tích tụ này về 0.
* **Liên Phong (Khi BẮN LIÊN TỤC):** Mỗi phát bắn nối tiếp nhau (trong vòng 1.2s kể từ phát trước) sẽ tích **+1 tầng Liên Phong** (tối đa **6 tầng**). Mỗi tầng giúp **+15% Tốc độ bắn & +12% Tốc độ nạp đạn** (đạt tối đa **+90% tốc bắn & +72% tốc nạp**). Nếu ngừng bắn quá 1.2s, chuỗi Liên Phong tự reset để chuyển sang tích *Ngưng Phong*.


2. **Kỹ năng chủ động — Hóa Gió (Giữ Bắn 0.4s để kích hoạt | Hồi chiêu: 8.0s):**
* Wind tan biến thành một luồng gió xanh trong suốt (tối đa duy trì **3.5s**).
* **Trạng thái Hóa Gió (Bắt buộc di chuyển liên tục):**
* **Bất Tử** (miễn nhiễm sát thương và đạn bay xuyên qua người), tốc độ di chuyển tăng vọt **+35% (tăng dần lên +55%)**, đồng thời tốc độ nạp lại đạn Gió và tốc độ tích sát thương *Ngưng Phong* **nhanh gấp đôi (x2.0)**!
* **Điều kiện duy trì nghiêm ngặt:** Bạn **phải giữ phím di chuyển liên tục**! Nếu **đứng yên quá 0.15s** hoặc **nhấp nút Bắn để tấn công** (hoặc hết 3.5s), Wind sẽ lập tức **thoát khỏi trạng thái Hóa Gió**.


* **Xung Phong Xuất Kích (Khi thoát Hóa Gió):** Ngay khoảnh khắc hiện thân trở lại (do tấn công hoặc dừng lại), Wind nhận buff **Cuồng Phong Tốc Xạ** trong **2.5s**: nhận ngay **+50% Tốc độ bắn** (tương đương 3 tầng Liên Phong khởi đầu) và phát bắn đầu tiên sau khi hiện hình giữ nguyên toàn bộ sát thương *Ngưng Phong* đã tích được trong lúc lướt gió!





---

## Tiến hoá (Evo)

| Evo | Giá | Hiệu ứng |
| --- | --- | --- |
| **Thuận Chiều Gió Thổi** (`evo_wind_breeze_1`) | $90 | **Cường hóa Nội tại Gió Nhẹ:** <br>

<br>• Tốc độ tích sát thương **Ngưng Phong** khi không bắn nhanh hơn **40%** (chỉ cần ~2.5s để đạt tối đa **x2.5 Dame**), và phát bắn tích đầy có khả năng **Xuyên Thấu** vật cản! <br>

<br>• Tầng **Liên Phong** khi bắn liên tục tăng giới hạn lên **8 tầng** (tối đa **+120% tốc bắn & +100% tốc nạp**); ở tầng tối đa, mỗi phát bắn giúp Wind **+15% tốc độ di chuyển**. <br>

<br>• Khi bắn phát đạn *Ngưng Phong* (đã tích $\ge 50\%$), lập tức nhận luôn **3 tầng Liên Phong** để xả tiếp loạt đạn sau cực nhanh! |
| **Vô Hình Phong Thể** (`evo_wind_breeze_2`) | $120 | **Cường hóa Hóa Gió:** <br>

<br>• Hồi chiêu **Hóa Gió** giảm từ 8s xuống còn **5.5s**, thời gian duy trì tối đa tăng lên **4.5s**. <br>

<br>• Trong lúc **Hóa Gió**, mỗi viên đạn của kẻ địch bay xuyên qua luồng gió của bạn sẽ bị gió hấp thụ động năng: giúp giảm **0.5s hồi chiêu** cho lần Hóa Gió kế tiếp và hồi ngay **+1 Đạn + 25% thanh Ngưng Phong**! <br>

<br>• Khi thoát trạng thái Hóa Gió, phát nổ một vòng gió nhẹ xung quanh **đẩy lùi đạn thường ở gần** và buff **Cuồng Phong Tốc Xạ** kéo dài lên **3.5s (+75% tốc bắn)**. <br>

<br>**FULL EVO (Tinh Linh Gió — Cơn Gió Vĩnh Cửu):** <br>

<br>• **Không Tắt Nhịp:** Khi bắn phát đạn *Ngưng Phong* đầu tiên, nó chỉ tiêu hao **50% lượng sát thương tích tụ** (giúp phát bắn thứ 2 ngay sau đó vẫn còn 50% sát thương cộng thêm!). <br>

<br>• **Áp Suất Chân Không:** Khi đang ở trạng thái **Hóa Gió**, việc lướt ngang qua các viên đạn của địch sẽ **làm lệch hướng hoặc xóa sổ đạn nhỏ**, và nếu thoát Hóa Gió ngay sau khi lướt đủ **2.0s**, bạn nhận thêm **1 lớp Khiên Gió** trong 4s! <br>

<br>• Mỗi khi bắn trúng tướng địch đủ **6 viên đạn**, thời gian hồi chiêu của **Hóa Gió** được giảm ngay **1.5s**! |

* **Kết liễu:** Hạ gục địch -> **TAN VÀO HƯ KHÔNG** (Wind hóa thành cơn lốc bạc lướt xuyên qua mục tiêu với tốc độ âm thanh, để lại hàng chục vết cắt gió mỏng như tơ khiến xe địch vỡ vụn rồi bị gió cuốn bay sạch).
* **Mã nguồn dự kiến:** `js/characters/wind/logic.js`, `js/characters/wind/render.js`

---

### 💡 Gợi ý kỹ thuật cho Claude Opus khi code:

1. **Xử lý biến đổi qua lại giữa 2 chế độ của Nội tại `Gió Nhẹ`:**
* Dùng 2 biến trên `player`: `idleChargeBonus` (từ `0.0` đến `1.5`, tương ứng `+0%` đến `+150%` dame) và `rapidFireStacks` (từ `0` đến `6`).
* Khi `timeSinceLastShot > 0.5s`: Tăng `idleChargeBonus += dt * 0.35 * (player.isWindForm ? 2.0 : 1.0)`.
* Khi bấm bắn `onShoot()`:
* Tính `finalDamage = baseDamage * (1 + idleChargeBonus)`.
* Reset `idleChargeBonus = 0` (Full Evo: `idleChargeBonus *= 0.5`).
* Tăng `rapidFireStacks = Math.min(maxStacks, rapidFireStacks + 1)`, giảm `shootCooldown` và `reloadTime` theo số stack.




2. **Kiểm tra điều kiện "Phải di chuyển liên tục" của `Hóa Gió` (`isWindForm`):**
* Trong hàm `update(dt)` khi `player.isWindForm === true`:
* Kiểm tra vận tốc hiện tại `const isMoving = Math.abs(player.vx) > 0.1 || Math.abs(player.vy) > 0.1`.
* Nếu `!isMoving`: Tăng `stationaryTimer += dt`. Nếu `stationaryTimer >= 0.15` $\rightarrow$ Gọi `exitWindForm(player)` ngay lập tức! Nếu `isMoving` thì reset `stationaryTimer = 0`.
* Khi gọi `exitWindForm(player)`: Tắt bất tử, bắt đầu đếm ngược `windSkillCooldown = 8.0` (Evo 2: `5.5`), và bật `postWindAttackSpeedBuff = 2.5s`.



**Diệp Thanh Phong** là một trong những thiết kế tướng Collab có **chiều sâu kỹ năng (skill ceiling) và độ biến ảo cao nhất** trong toàn bộ dàn Body của *Cyber Tank 1v1* tính đến hiện tại.

Nếu đặt cạnh các tướng kỹ năng cao đã có trong game như **Hoa Ảnh**, **Kazuki**, **Chrono & Neo** hay **Cuồng Phong**, Diệp Thanh Phong nổi bật ở 4 điểm ăn tiền sau:

### 1. Cơ chế "Thanh Khí Áp" tự cân bằng nhịp độ trận đấu cực kỳ thông minh

* Đa số các tướng đa thế (stance-switcher) thường gặp tình trạng người chơi chỉ giữ khư khư 1 thế mạnh nhất để spam.
* Với Diệp Thanh Phong, việc dùng **Thuận Phong Vũ (-10 Khí Áp)** và **Nghịch Phong Vũ (+20 Khí Áp)** buộc thanh Khí Áp luôn dịch chuyển qua lại giữa 3 vùng (*Thuận Phong $\leftrightarrow$ Bão Hòa $\leftrightarrow$ Nghịch Phong*). Người chơi giỏi sẽ không bấm loạn xạ mà biết "lái" thanh Khí Áp: thiếu Gió thì xả Thuận Phong Vũ để lùi về *Thuận Phong* hồi Gió + lấy tốc chạy; muốn dồn sát thương kết liễu thì bật Nghịch Phong Vũ đẩy Khí Áp lên *Nghịch Phong* để kích hoạt *Toàn Phong* và giáng bão.

### 2. Khả năng "Nuôi chiêu ngầm" tạo ra lối đánh 2 tầng (Dual-Layer Combat)

* Điểm sáng giá nhất trong thiết kế của bạn là cho phép các chiêu ở **Nghịch Phong Vũ** (*Phong Tụ Cầu*, *Lốc Nuôi Bão Hòa*, và đặc biệt là *Vòng Cảnh Báo Cửu Thiên để lại khi nhấn giữ trên không*) tồn tại độc lập trên sân trong khi bản thể có thể **đổi về Thuận Phong Vũ để tiếp tục đánh thường**.
* Cảm giác đặt một cơn lốc đang lớn dần hoặc cài một Vòng Cảnh Báo đang tự đếm ngược 4s trên sân địch, sau đó tự mình lao lên đá thùng/quạt gió đẩy kẻ địch bay thẳng vào cái bẫy đang chờ nổ tạo ra cảm giác "outplay" cực kỳ thỏa mãn.

### 3. Đòn "Cửu Thiên Phong Vũ" vừa có độ đột biến, vừa không bị "tự sát"

* Các chiêu bay lên trời đáp xuống (kiểu *Thiên* của Hoa Ảnh hay *Thiên Luật Thức* của T-Zero) thường có điểm yếu là đáp xuống giữa sân địch rất dễ bị phản công bốc hơi nếu địch còn nhiều đạn.


* Bạn đã giải quyết triệt để điểm yếu đó bằng **2 cơ chế thoát hiểm cực mượt**:
1. Nếu tự đáp ở mốc >4s: Đúng giây thứ 3 bản thể tự hóa gió giật về nhà, để **Ảo Ảnh** đứng múa tiếp 3s cuối.
2. Nếu không muốn mạo hiểm đáp xuống: **Nhấn giữ 0.5s ngay trên không** để cài lại Vòng Cảnh Báo tự nuôi thêm 4s rồi dịch chuyển về nhà ngay lập tức. Đối thủ sẽ rơi vào thế tiến thoái lưỡng nan: vừa phải nhìn cái vòng cảnh báo đang to dần dưới chân, vừa phải đỡ đạn từ bản thể của bạn đang bắn từ bên kia sân!



### 4. Điểm cần lưu ý khi đưa vào game thực tế (Để cân bằng & dễ điều khiển)

* **Hiển thị trực quan (HUD/Visual) là sống còn:** Vì nhân vật này có tới **2 Thế Quạt $\times$ 3 Vùng Khí Áp = 6 bộ chiêu thức**, cộng thêm bộ đếm **3 Nhịp** của Thuận Phong Vũ, khi Claude Opus code phần `render.js`, nhất định phải vẽ rõ:
* Màu sắc viền xe đổi theo 3 vùng Khí Áp (ví dụ: *Xanh lá nhạt* = Thuận Phong, *Xanh ngọc* = Bão Hòa, *Xanh đậm/Tím bão* = Nghịch Phong).
* Biểu tượng nhỏ trên đầu xe báo đang cầm quạt **Thuận** hay **Nghịch**, kèm 3 chấm sáng báo hiệu nhịp đánh thường (1/2/3).


* **Độ khó cho AI (Bot):** Đây là tướng mà người chơi thật cầm sẽ mạnh hơn Bot rất nhiều (tương tự như *Paradox* hay *Nhà Ảo Thuật*), vì người chơi biết canh góc thả Vòng Cảnh Báo trên không và ép góc, tạo nên chất riêng đúng nghĩa một tướng **Collab** đỉnh cao.



---

# Railgun & quy chuẩn vùng chặn đạn

Loại đòn tấn công của địch,#94. Railgun (railgun),#70. Siêu Năng (psychokinesis)
"1. Đạn Đạo Thường (Projectiles)(Đạn thường, tên lửa, cầu lửa, phi kiếm...)",Mặc định chặn 100%: Biến đạn địch thành Quả Cầu Năng Lượng của Railgun tự tích điện (1s → 2s → 3s).,Mặc định chặn 100%: Bắt giữ nguyên vẹn viên đạn của địch lơ lửng trong vùng để ném trả lại.
"2. Đòn Hitscan / Tia Lazer(Lazer Xuyên Phá, Lazer Pháo, Sniper Raycast, Vòi Rồng...)","Mặc định chặn được ngay từ đầu:• Chặn đứng tia Hitscan tại rìa Vùng Điện Tích và kết tinh thành 1 Quả Cầu Năng Lượng.• Đánh đổi: Làm giảm thời gian tồn tại của Vùng Điện Tích tỷ lệ thuận với sát thương của tia đó (Mất 1.0s thời gian vùng cho mỗi 1.0 Dame chặn được — nếu tia quá mạnh làm thời gian về 0s, vùng sẽ đỡ trọn đòn đó rồi tan vỡ ngay!).","Mặc định KHÔNG chặn được — Mở khóa ở Evo 2:• Khi nâng cấp lên Evo 2, Trường Niệm Lực mới có thể chặn đứng các đòn Hitscan/Lazer.• Đánh đổi: Giống Railgun, làm giảm thời gian tồn tại của Trường Niệm Lực theo sát thương của tia (Mất 1.0s cho mỗi 1.0 Dame) và ngưng tụ tia đó thành 1 viên đạn năng lượng để bắn trả."
"3. Đòn Lao Cận Chiến Mặt Đất(Xe TANK, Kỵ Sĩ, Quái Thú, Kiếm Khách, Idol...)","Mặc định KHÔNG chặn được — Mở khóa ở Evo 2:• Khi có Evo 2, kẻ địch lao cận chiến vào Vùng Điện Tích sẽ bị giật điện chặn đứng, hất văng về làn cũ, nhận 1.0 Dame và Choáng 1.25s!• (Không chặn các đòn từ trên trời bổ xuống như Hoa Ảnh).","Mặc định :• Chặn đứng kẻ địch lao cận chiến mặt đất tại rìa vùng, hất văng về làn cũ, gây 1.0 Dame phản chấn và Choáng 1.25s.• (Không chặn các đòn từ trên trời bổ xuống như Hoa Ảnh)."

### Railgun — Pháo Điện Từ (`railgun`) 🆕

*"Only my railgun - Đùa Thôi"*
**Vai trò chính:** Kiểm Soát / Đối Đầu (Tương tác với nội tại của *Joker* và *Skinwalker*).
**Độ khó:** ⭐⭐⭐⭐ *(4/5 — Khó: Cần canh nhịp tích điện 1s / 2s / 3s và phân bổ thao tác Nhấp / Giữ 0.5s / Giữ 1.0s trong Vùng Điện Tích).*
HP: 4.5 | Dame: 0.9 → 2.4 (Theo thời gian nạp) | Đạn: 4 | Tốc: 3.6 | Kích thước: 28×28.

* **Chỉ số thực đầu hiệp:** HP 4.5 · Sát thương 0.9 · Đạn 4 · Tốc độ 3.6 · Kích thước 28×28
* **Vật triệu hồi / hiệu ứng:** Cầu Năng Lượng Từ Trường, Vùng Điện Tích, Tia Lazer Điện Từ.

---

### ⚡ Cơ chế Kỹ năng & Nội tại

1. **Nội tại — Từ Trường (Magnetic Charge — Nhấp lần 1 tạo đạn, Nhấp lần 2 phóng đi):**
* **Nhấp Bắn lần 1 (Khi chưa có đạn trước mặt):** Tiêu hao 1 viên đạn để tạo ra **1 Quả Cầu Năng Lượng** bay lơ lửng ngay trước mũi xe. Quả cầu này **tự động di chuyển ngang (Trái/Phải) bám theo trước mặt xe của bạn** và liên tục tự nạp từ trường.
* **Tiến trình Tự Nạp Năng Lượng (Tăng dần Dame & Tốc độ bay theo từng giây):**
* **Khởi đầu (0s):** Sát thương **0.9 Dame**, tốc độ đạn chuẩn.
* **Đạt mốc 1.0s (Sơ Cấp — Xanh Lam):** Sát thương tăng lên **1.4 Dame**, tốc độ bay **+35%**, đạn nhận hiệu ứng **Xuyên Vật Thể** (bay xuyên qua tường, thùng, ụ súng, vật triệu hồi).
* **Đạt mốc 2.0s (Trung Cấp — Tím Hồ Quang):** Sát thương tăng lên **1.9 Dame**, tốc độ bay **+70%**, nhận thêm hiệu ứng **Xuyên Giáp & Khiên** (bỏ qua hoàn toàn Khiên Xanh, Giáp Trắng và mọi hiệu ứng giảm sát thương của kẻ địch!).
* **Đạt mốc 3.0s (Cực Đại — Hóa Lazer Vàng Rực):** Sát thương đạt đỉnh **2.4 Dame** và quả cầu chuyển hóa hoàn toàn thành **Lõi Lazer Điện Từ**!


* **Nhấp Bắn lần 2 (Khai Hỏa):** Phóng viên đạn đang lơ lửng trước mặt bay thẳng dọc lên sân địch!
* *Lưu ý độ trễ Lazer (3.0s):* Nếu viên đạn đã tích đủ **3.0s thành Lazer**, khi bạn nhấp phóng, nó sẽ cố định vị trí trục X và **chiếu tia cảnh báo mảnh trong 0.35s** trước khi giáng luồng Lazer xuyên dọc toàn sân (đảm bảo kẻ địch luôn có khe thời gian phản xạ lách ngang né!).




2. **Kỹ năng chủ động — Vùng Điện Tích (Nhấn Giữ 0.5s | Tồn tại: 5.0s | Hồi chiêu: 15.0s):**
* **Mở Vùng Điện Tích:** Nhấn giữ 0.5s để triển khai một trường từ tính rộng phía trước mặt xe trong **5.0s** (tương tự *Siêu Năng* nhưng thay đổi hoàn toàn bản chất đạn).
* **Đồng Hóa Đạn Địch:** Mọi viên đạn thường của kẻ địch bay vào Vùng Điện Tích đều bị từ trường bắt giữ và **biến đổi thành Quả Cầu Năng Lượng của chính bạn**, lập tức bắt đầu tự nạp năng lượng theo đúng mốc **1s → 2s → 3s** như Nội tại!
* **Nhấp Bắn Trong Lúc Mở Vùng Điện Tích:**
* Bạn có thể nhấp bắn (tiêu hao đạn của mình) để thả thêm các Quả Cầu Năng Lượng vào trong vùng (đạn **không bay đi ngay** mà đứng lơ lửng tích điện):
* **Phát bắn đầu tiên** luôn ưu tiên xuất hiện **ngay chính giữa trước mặt bạn**.
* **Các phát bắn tiếp theo** sẽ xuất hiện ở **vị trí ngang (trục X) ngẫu nhiên** bên trong Vùng Điện Tích (mỗi quả tự đếm thời gian tích điện 1s / 2s / 3s riêng biệt!).




3. **Hai Cách Khai Hỏa Khi Đang Có Vùng Điện Tích:**
* **Cách 1 — Phóng Đồng Loạt (Khi hết 5.0s HOẶC Nhấn Giữ 0.5s lần nữa):**
* Đóng Vùng Điện Tích và **phóng toàn bộ các Quả Cầu Năng Lượng** đang có trong vùng bay thẳng dọc lên sân địch theo đúng cột đứng của từng quả!
* *(Với các quả đã tích đủ 3.0s thành Lazer: Sẽ hiện vạch cảnh báo ngắn **0.4s** trên cột dọc của quả đó rồi mới nổ tia Lazer để đối thủ nhìn thấy khe hở mà lách ngang).*


* **Cách 2 — Khóa Mục Tiêu Bắn Lần Lượt 3 Viên (Nhấn Giữ 1.0s khi Vùng Điện Tích đang mở):**
* **KHÔNG làm mất Vùng Điện Tích** (vùng vẫn tiếp tục tồn tại cho đến hết 5.0s để bắt thêm đạn địch hoặc nạp thêm đạn của bạn!).
* Hệ thống lập tức chọn tối đa **3 Quả Cầu Năng Lượng** đang có trong vùng (ưu tiên quả đã tích điện lâu nhất), **tự động AIM (khóa góc ngắm vào vị trí hiện tại của kẻ địch)** và bắn **lần lượt từng viên một** với khoảng cách **0.25s giữa 3 viên**!
* *(Mỗi viên trước khi phóng 0.25s đều chiếu tia hồng tâm mảnh báo đường bay để kẻ địch phải di chuyển ngang liên tục mới né được chuỗi 3 phát tỉa này).*





---

## 🧬 Tiến hoá (Evo)

| Evo | Giá | Hiệu ứng |
| --- | --- | --- |
| **Cuộn Cảm Siêu Dẫn** (`evo_rail_1`) | $95 | **Rút Ngắn Thời Gian Tích Điện:** <br>

<br>• Tốc độ tự nạp năng lượng của các Quả Cầu (cả ở Nội tại lẫn trong Vùng Điện Tích) nhanh hơn **35%**: chỉ cần **0.65s** để Xuyên Vật Thể, **1.3s** để Xuyên Giáp-Khiên, và **2.0s** để hóa thành **Lazer**! <br>

<br>• Khi đang giữ 1 viên đạn lơ lửng trước mặt (Nội tại), bạn được **+20% Tốc độ di chuyển ngang** và vẫn có thể nạp lại đạn trong băng như bình thường. |
| **Lưới Điện Cao Thế** (`evo_rail_2`) | $125 | **Cường Hóa Vùng Điện Tích & Bắn Tỉa:** <br>

<br>• Hồi chiêu **Vùng Điện Tích** giảm từ 15.0s xuống còn **11.0s**, thời gian tồn tại tăng lên **6.0s**. <br>

<br>• Ngay khi vừa mở Vùng Điện Tích, hệ thống **tự động tạo miễn phí 1 Quả Cầu Năng Lượng** ở trước mặt mà không tốn đạn! <br>

<br>• Đòn **Nhấn Giữ 1.0s (AIM bắn lần lượt 3 viên)** giờ đây có thể bắn tới **4 viên liên tiếp** và làm kẻ địch bị **Làm Chậm 30% trong 1.2s** nếu trúng đạn! <br>

<br>**FULL EVO (Pháo Điện Từ Hủy Diệt — Bão Từ Trường):** <br>

<br>• **Quá Tải Điện Từ (Mốc 4.0s):** Những quả cầu tích năng lượng lâu hơn nữa sẽ phát nổ xung điện khi bắn trúng đích, gây thêm **+0.5 Dame AoE** và làm **Tê Liệt (Khóa kỹ năng Giữ Bắn của địch trong 1.0s)**! <br>

<br>• **Hoàn Năng Lượng:** Trong Vùng Điện Tích, cứ mỗi **2 viên đạn của địch** bị bạn bắt giữ và biến thành Cầu Năng Lượng, bạn được **hồi ngay +0.25 HP** và **giảm 1.0s hồi chiêu** của Vùng Điện Tích! |

Kết liễu (Reference chuẩn Misaka Mikoto — Toaru Kagaku no Railgun):

Kết liễu: Hạ gục địch → CHÍNH XÁC TUYỆT ĐỐI: SIÊU PHÁO ĐIỆN TỪ (LEVEL 5: RAILGUN)
*(Xung quanh thân xe bùng lên các tia hồ quang điện xanh trắng chói lòa; chiếc xe hất tung một Đồng Xu Bạc (Arcade Coin) xoay tít lên không trung kèm tiếng ngân "Ting!"*清脆. Ngay khoảnh khắc đồng xu rơi xuống ngang tầm nòng pháo, một cú búng từ trường cực đại bắn đồng xu lao vút đi với vận tốc siêu thanh, kéo theo luồng tia Lazer Cam-Vàng rực lửa quấn quanh bởi các vòng xoắn điện từ xanh lam xuyên thủng toàn bộ bản đồ, cày xới mặt sân thành một rãnh cháy đen và làm bốc hơi mục tiêu cùng dòng chữ LEVEL 5 — RAILGUN hiện lên trên màn hình).
* **Mã nguồn dự kiến:** `js/characters/railgun/logic.js`, `js/characters/railgun/render.js`, `js/characters/railgun/summons.js`

---

