# Đặc tả nhóm Cờ Bạc + 2 body mới (người dùng gửi)

## 📌 Quy tắc chung — Nhóm Cờ Bạc (Joker, Jack, COC)
- Nội tại Cờ Bạc (áp dụng cho `joker`, `jack_6_lo`, `coc`):
  - Mỗi hiệp vào Shop được **miễn phí 1 lần Reroll đầu tiên**.
  - Số lựa chọn trang bị/module (Gear) xuất hiện mỗi lần mở hoặc Reroll shop **+1 ô**.

---

## 68. Jack - 6 Lỗ (`jack_6_lo`) 🆕
*"MỘT VÁN NỮA, CƯỢC ĐI CƯỢC ĐI NÀO HAAHAHA!"*
HP 4.5 (dao động 3.0 – 6.5 mỗi hiệp) | Dame 1.0 (0.7 – 1.4) | Đạn 4 (đôi khi nạp ra 5–6) | Tốc 3.6 (3.0 – 4.3) | Kích thước 28×28.

### Cơ chế
- **Chỉ Số Bất Định:** đầu mỗi hiệp, chỉ số gốc random lại trong biên độ ±30% (tổng chỉ số quy đổi vẫn cân bằng để không bị phế).
- **Chance & Luck (Tung Xu Định Mệnh):**
  - Chance: mọi phát đạn thường có 25% Chí Mạng (x2 dame).
  - Tung Xu: cứ mỗi 3s tự tung đồng xu (50/50):
    - **Mặt Ngửa — LUCK** (12s, tạm ngưng tung xu tới khi hết Luck): xóa sạch mọi tầng Nợ. +20% tốc chạy, +15% giảm sát thương nhận, 20% né đòn, Chí Mạng lên 50%, tăng may mắn cho các kỹ năng khác.
    - **Mặt Úp — NỢ** (cộng dồn vô hạn, sau 3s tung tiếp): +1 tầng Nợ. Mỗi tầng: -4% tốc chạy (tối đa -40%), +5% sát thương nhận, giảm may mắn kỹ năng.
- **Hander (Nhấp bắn):** khẩu lục kỳ dị 4 viên. Mỗi lần nhấp xả ngẫu nhiên 1–4 viên cùng lúc (tiêu hao số đạn tương ứng, tỏa nhẹ hình nón). Nạp đạn 1.4s, 25% nhét lố thành 5 hoặc 6 viên (đang Luck: 60% ra 6 viên).
- **THE BOY — Cò Quay Nga (Giữ bắn 1s để rút súng):**
  - Nhét 1 viên vào ổ 6 lỗ và xoay cò (GAME ON!).
  - KHÔNG THỂ CẤT SÚNG: đã rút thì không đổi lại súng thường, không nạp đạn, không hủy chiêu — phải bóp cò tới khi ra đạn hoặc súng nổ ở phát 6.
  - Mỗi lần nhấp = bóp cò 1 lỗ (giữa các lần bóp cò hồi 1s). Viên đạn thật ở ngẫu nhiên 1 trong 6 vị trí (đang Luck: tỉ lệ nổ ở các phát đầu tăng cao; nhiều Nợ & chưa có Evo 2: dễ kẹt tới phát 6):
    - Phát 1 ra đạn (1/6): đại đạn nổ x6 Dame, bay nhanh, homing nhẹ.
    - Phát 2 hoặc 3: x2 Dame, nổ nhỏ, homing nhẹ.
    - Phát 4 hoặc 5: x1.5 Dame, homing nhẹ (hiện chữ "Nah, chán!").
    - Lỗ trống: hiện "CẠCH!", chờ 1s bóp lỗ tiếp.
    - Phát 6 (chắc chắn nổ): súng nổ ngược vào mặt — Choáng 1.25s, tự nhận 2.0 sát thương (bỏ qua khiên), không bắn ra đạn.
  - Hồi chiêu sau ván cược: ra đạn ở phát 1–5 → CD 2s (về Hander); nổ ở phát 6 → CD 6s.

### Tiến hóa
| Evo | Giá | Hiệu ứng |
|---|---|---|
| Thú Vị Hơn (`evo_jack_1`) | $90 | Luck 16s (+30% tốc, né 30%, giảm thương 25%), mỗi tầng Nợ phạt nặng hơn (-5% tốc, +8% sát thương nhận). The BOY: Phát 1 x8 (nổ to); Phát 2–3 x3; Phát 4–5 x2; Phát 6 tự nhận 3.5 & Choáng 1.75s. |
| High Risk, High Reward (`evo_jack_2`) | $120 | Chí Mạng x3.0 nhưng đạn thường không chí mạng chỉ gây 50% dame gốc. Kích hoạt Luck nhận ngay 1 Khiên. Mỗi tầng Nợ đốt máu (0.01 × số Nợ HP/s, không tự gây chết dưới 0.25 HP). ĐỔI ĐỜI CÙNG THE BOY: Phát 1 x(6 + 2 + Nợ) (có Evo 1: x(8 + 2 + Nợ)); Phát 2–3 x(2 + Nợ/2) (có Evo 1: x(3 + Nợ/2)). Ra đạn (phát 1–5) khi đang có Nợ → XÓA SẠCH NỢ; nổ ngay Phát 1 → nhận Luck thời gian 12s × số Nợ đã tích. Nổ súng Phát 6: tự nhận 2.0 × số Nợ sát thương. ĐỘC ĐẮC: ≥ 10 Nợ mà ra đạn ngay Phát 1 → siêu đạn x100 Dame, KHÔNG THỂ NÉ (khóa chết mục tiêu, xuyên mọi tường & khiên). |
| FULL EVO (THÚ VỊ HƠN NỮA!!!) | — | Tung xu mỗi 2s; khi rút The BOY (giữ 1s), giữ lố thêm mỗi 0.3s trước khi nhả → vay nóng +1 Nợ; Hander luôn nạp 6 viên và đạn chí mạng nảy tường 1 lần; The BOY bóp cò 0.5s/lần, ngưỡng Độc Đắc x100 chỉ cần ≥ 7 Nợ; nổ súng Phát 6 tạo vụ nổ lớn quanh mình, địch đứng gần chịu chung 100% sát thương nổ súng. |

- Kết liễu: hạ gục bằng The BOY → **JACKPOT 777!** (mưa tiền vàng & pháo hoa nổ tung màn hình).

---

## 69. The Change or Chance — COC (`coc`) 🆕
*"Vận mệnh trong tay ta nắm!"*
HP 4.5 | Dame gốc 1.0 (theo vũ khí) | Đạn theo vũ khí | Tốc gốc 3.5 (± vũ khí) | Kích thước 28×28.
Vật triệu hồi: Búp Bê L & R (mặt 5), Phân Ảnh Vũ Khí (Full Evo).

### Xúc Xắc Vận Mệnh (nội tại)
Đầu hiệp và mỗi 12s, xúc xắc 6 mặt lăn trên đầu xe, trao 1 trong 6 vũ khí (không ra trùng mặt vừa dùng). Trong 12s đó bắt buộc dùng vũ khí này; Sát thương / Băng đạn / Tốc chạy đổi theo vũ khí:
- ⚀ **Súng Lục:** Dame 2.0 | Đạn 10 | Tốc +1.0 (4.5) — bắn từng viên chuẩn xác, sau mỗi phát xe lướt nhẹ theo hướng đang đi. Hết đạn nạp 1.2s.
- ⚁ **Tiểu Liên:** Dame 0.5 | Đạn 20 | Tốc +0.5 (4.0) — liên thanh. Hết băng: trúng > 50% băng (> 10 viên) → hồi đầy ngay (0s); ≤ 50% → phạt nạp 6s.
- ⚂ **Đại Pháo:** Dame 2.0 | Đạn 2 | Tốc -0.5 (3.0) — đạn nổ lan; x3 sát thương lên đối tượng không phải Body (tường, ụ súng, triệu hồi, thùng, xe tiền). Nạp 1.8s.
- ⚃ **Đoản Đao:** Dame 1.0 | Đạn vô hạn (hồi chém 0.6s) | Tốc +2.0 (5.5) — nhấp để lao lên chém vòng tròn nhỏ (chém vỡ đạn thường sát người). 35% Chí Mạng x3.
- ⚄ **Búp Bê Song Sinh:** Dame bản thể 0 | Đạn 0 | Tốc +0.25 (3.75) — 2 búp bê tấn công theo lệnh nhấp (L ưu tiên trước R):
  - L (CD 5s): đứng tụ lực, cảnh báo thẳng 0.5s rồi bắn tia lazer xuyên 2.0 dame.
  - R (CD 1s): loạt 3 viên về phía địch, mỗi viên 0.5.
- ⚅ **Súng Vàng:** Dame 5.0 | Đạn 1 | Tốc +0 (3.5) — 1 viên đạn vàng cực mạnh, homing nhẹ. Nạp 2.5s.

### Tiến hóa
| Evo | Giá | Hiệu ứng |
|---|---|---|
| Reroll — Đổi Vận (`evo_coc_1`) | $50 | Giữ bắn 0.6s để chủ động ReRoll vũ khí (CD 10s), không ra lại vũ khí đang cầm, làm mới đạn/hồi chiêu và bộ đếm 12s. |
| 1 Và 6 — Đỉnh Cao Vận Mệnh (`evo_coc_2`) | $110 | 1) Cường hóa 6 vũ khí: Lục lướt xa hơn, phát thứ 3 mỗi chuỗi xuyên khiên; SMG chỉ cần trúng ≥ 35% (7 viên) là hồi đầy, phạt nạp hỏng 2.5s; Pháo để lại vùng lửa 2s, băng 3 viên; Dao lao xa hơn, Chí Mạng x3 lên 50% & hồi 0.25 HP khi chí mạng; Búp Bê L CD 3.5s (tia to hơn), R bắn 4 viên làm chậm nhẹ; Súng Vàng xuyên mọi vật cản, nạp 1.8s, trúng địch +$10. 2) Xúc Xắc Nội Tại mới: mỗi lần roll vũ khí lắc thêm 1 xúc xắc phụ cấp 1 trong 6 nội tại trong 12s: *(1: Nhận 1 Khiên | … — PHẦN CÒN LẠI BỊ CẮT, chờ người dùng gửi bổ sung)* |
| FULL EVO | — | *(chưa có — chờ người dùng gửi; có nhắc "Phân Ảnh Vũ Khí")* |

- Kết liễu: **ĐỊNH MỆNH AN BÀI** (xúc xắc khổng lồ rơi từ trời đè bẹp mục tiêu và nổ tung số 6).
