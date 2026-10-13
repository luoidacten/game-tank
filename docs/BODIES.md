# 📘 Cẩm nang Body — CYBER TANK 1v1

> File này được tạo tự động từ dữ liệu trong game (`js/data/modules.js`, `js/data/evolutions.js`, `js/data/shops.js`).
> Khi sửa chỉ số trong code, hãy cập nhật lại file này cho khớp.

## Luật chung

- Mỗi người chọn **1 Body** ở Hiệp 1. Các hiệp sau mua Module / Tiến hoá (Evo) trong shop bằng tiền thắng trận.
- Thông số gốc: kích thước xe 30×30, tốc độ 3.5, tốc đạn 4.8, nạp đạn 1.5s. Sau 60s bắt đầu **Đột Tử**: vùng an toàn thu hẹp hai bên.
- **Xe to được cộng máu**: rộng 31–33 → +1, 34–35 → +2, 36 → +3, 37 → +4, ≥38 → +5 HP.
- Các bảng dưới ghi **chỉ số thực đầu hiệp** (đo bằng cách chạy `setupForNewRound()` trong game, map Cổ Điển, chưa mua gì): đã gồm máu cộng do kích thước và điều chỉnh tốc độ riêng của từng body. Tốc độ cơ bản là 3.5.
- Mỗi Body có 2 Evo. Sở hữu **cả 2 Evo = FULL EVO**, mở khoá sức mạnh tối thượng của Body đó.
- Map *Overdrive*: tốc độ ×1.35, thời gian nạp đạn ×0.5.

## Bảng tổng hợp

| # | Body | ID | HP | Sát thương | Đạn | Tốc độ | Kích thước | Vật triệu hồi |
|---|------|----|---:|-----------:|----:|-------:|:----------:|:-------------:|
| 1 | **Cơ Bản** | `basic` | 8 | 1 | 8 | 3.5 | 30×30 |  |
| 2 | **Xe Tiền** | `money_tank` | 1 | 1 | 2 | 3.5 | 28×28 |  |
| 3 | **Xe TANK** | `tank` | 15 | 3 | — (năng lượng riêng) | 2.45 | 38×38 |  |
| 4 | **Pháo Băng** | `ice` | 5 | 1 | 5 | 3.5 | 30×30 |  |
| 5 | **Đạn Lớn** | `big_bullet` | 5 | 2 | 2 | 3.5 | 30×30 |  |
| 6 | **Shotgun** | `shotgun` | 3.5 | 0.5 | 2 | 3.5 | 26×26 |  |
| 7 | **Cuộn Quá Tải** | `overload` | 5 | 1.2 | 6 | 3.5 | 30×30 |  |
| 8 | **Tiểu Liên** | `smg` | 4 | 0.5 | 12 | 3.5 | 24×24 |  |
| 9 | **Lazer Xuyên Phá** | `lazer_charge` | 2 | 0.25 | 20 | 3.5 | 30×30 |  |
| 10 | **Lazer Pháo** | `lazer_auto` | 4 | 1 | 6 | 3.5 | 30×30 |  |
| 11 | **Pháo Tên Lửa** | `rocket` | 5 | 2 | 3 | 3.5 | 30×30 |  |
| 12 | **Cổng Không Gian** | `portal` | 5 | 1 | 7 | 5 | 30×30 |  |
| 13 | **Phong Trảm** | `wind_slash` | 4 | 1 | 1 | 3.5 | 30×30 | ✅ |
| 14 | **Cuồng Phong** | `storm` | 3.5 | 2 | — (năng lượng riêng) | 5 | 30×30 | ✅ |
| 15 | **Axit Hóa** | `acid` | 4 | 0.5 | 1 | 3.5 | 30×30 | ✅ |
| 16 | **Kỹ Sư** | `engineer` | 5 | 0.5 | 2 | 3.5 | 34×34 | ✅ |
| 17 | **Ghost** | `ghost` | 2.5 | 1.75 | 4 | 5.5 | 24×24 | ✅ |
| 18 | **Pháo Cao Xạ** | `aaa` | 9 | 2 | 1 | 2.1 | 37×37 | ✅ |
| 19 | **Kiếm Tôn** | `blade_god` | 5 | 1.5 | 4 | 3.5 | 30×30 |  |
| 20 | **Kiếm Trận** | `van_kiem` | 3.5 | 0.25 | ∞ | 5.5 | 26×26 |  |
| 21 | **Súng Nước** | `water_gun` | 6 | 1.5 | — (năng lượng riêng) | 3.5 | 34×34 |  |
| 22 | **Lò Nung** | `furnace` | 9 | 0.25 | — (năng lượng riêng) | 3.5 | 36×36 |  |
| 23 | **Âm Dương Sư** | `am_duong_su` | 5 | 0.5 | 4 | 3.5 | 30×30 | ✅ |
| 24 | **6 Nòng** | `six_barrel` | 9 | 0.4 | ∞ | 3.5 | 36×36 |  |
| 25 | **Kẻ Mạnh Nhất** | `the_strongest` | 1 | 2 | — (năng lượng riêng) | 3.5 | 30×30 |  |
| 26 | **Sniper** | `sniper` | 3 | 2 | 5 | 2.62 | 24×24 | ✅ |
| 27 | **Bow** | `cung` | 3 | 0.5 | 3 | 4.38 | 24×24 | ✅ |
| 28 | **Mirror** | `mirror` | 4 | 1 | 6 | 3.5 | 30×30 |  |
| 29 | **Vua Đầu Bếp** | `sukuna` | 10 | 3 | ∞ | 3.5 | 36×36 |  |
| 30 | **Paradox** | `paradox` | 5 | 1 | 5 | 3.5 | 30×30 |  |
| 31 | **Nhà Ảo Thuật** | `magician` | 3.5 | 1.5 | 7 | 4.73 | 26×26 | ✅ |
| 32 | **Nhà Phát Minh** | `inventor` | 2 | 0.5 | 4 | 2.24 | 30×30 | ✅ |
| 33 | **Shadow Hunter** | `shadow_hunter` | 2 | 1 | 6 | 5.92 | 24×24 | ✅ |
| 34 | **Shortgun** | `shortgunATK` | 7 | 2 | 2 | 5.47 | 34×34 | ✅ |
| 35 | **Sấm Chớp** | `thunder` | 2 | 1 | — (năng lượng riêng) | 5.92 | 26×26 | ✅ |
| 36 | **Nam Châm** | `magnet` | 7 | 0.5 | 6 | 3.5 | 34×34 | ✅ |
| 37 | **Tiến Hóa** | `evolution` | 1 | 1 | 1 | 3.5 | 30×30 |  |
| 38 | **Trối Chết (DeathLock)** | `death_lock` | 7 | 0.5 | 3 | 2.8 | 34×34 | ✅ |
| 39 | **Kẻ Sáng Tạo** | `creator` | 1 | 0.25 | 1 | 3.5 | 24×24 | ✅ |
| 40 | **Chiêu Hồn Sư** | `necromancer` | 1 (+6 Linh Hồn) | 1 | 1 | 2.8 | 32×32 | ✅ |
| 41 | **Thiên Tài** | `genius` | 1 | 1 | 1 | 4.55 | 24×24 | ✅ |

## Module chân (FEET)

| Module | ID | Giá | Hiệu ứng |
|---|---|---:|---|
| Động Cơ | `speed` | $30 | Tăng tốc độ di chuyển. |
| Giáp Thép | `armor` | $15 | +1 Máu tối đa. |
| Bánh Xích | `damage` | $20 | x1.25 Sát thương. |
| Lợi Tức | `interest` | $10 | Sau mỗi round: +30$ (Xe Tiền +60$). Cộng dồn. |

## Chi tiết từng Body

### 1. Cơ Bản (`basic`)

HP:8 | Dame:1 | Đạn:8

- **Chỉ số thực đầu hiệp:** HP 8 · Sát thương 1 · Đạn 8 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Công Thủ Toàn Diện (`evo_basic_1`) | $15 | HP+6, Dame ×2 |
  | Thập Tử Nhất Sinh (`evo_basic_2`) | $30 | Về 0 HP -> Hồi 1 HP + Bất tử 3s |

- **Mã nguồn:** `js/characters/basic/logic.js`

### 2. Xe Tiền (`money_tank`)

HP:1 | Dame:1 | Đạn:2 (Evo: Nâng cấp toàn diện)

- **Chỉ số thực đầu hiệp:** HP 1 · Sát thương 1 · Đạn 2 · Tốc độ 3.5 · Kích thước 28×28
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Tiền Tấn Công (`evo_money_atk`) | $200 | Phá xe tiền -> Bắn chùm đạn vào địch |

- **Mã nguồn:** `js/characters/money_tank/logic.js`

### 3. Xe TANK (`tank`)

HP:10 (+5 máu xe lớn) | Dame:3 | Tốc: Chậm (Lao húc)

- **Chỉ số thực đầu hiệp:** HP 15 · Sát thương 3 · Đạn — (năng lượng riêng) · Tốc độ 2.45 · Kích thước 38×38
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Không Thể Cản Phá (`evo_tank_1`) | $100 | Lao xuyên vật thể, Bất tử khi lao |
  | Tàn Phá!!! (`evo_tank_2`) | $45 | Húc nổ lan + Hồi khiên nội tại nhanh hơn |

- **Mã nguồn:** `js/characters/tank/logic.js`, `js/characters/tank/render.js`

### 4. Pháo Băng (`ice`)

HP:5 | Dame:1 | Đạn:5 (Làm chậm)

- **Chỉ số thực đầu hiệp:** HP 5 · Sát thương 1 · Đạn 5 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Bão Tuyết (`evo_ice_1`) | $100 | Mỗi 3 lần kích hoạt -> Tạo vùng Băng Cực Đại |
  | Hàn Băng (`evo_ice_2`) | $60 | x1.5 Dame lên kẻ bị chậm, Vùng băng gây dame |

- **Mã nguồn:** `js/characters/ice/logic.js`

### 5. Đạn Lớn (`big_bullet`)

HP:5 | Dame:2 | Đạn:2. Nảy tường phình to & tăng dame.

- **Chỉ số thực đầu hiệp:** HP 5 · Sát thương 2 · Đạn 2 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | To Hơn Nữa (`evo_big_1`) | $20 | Đạn siêu to khổng lồ |
  | Bóng Cao Su (`evo_big_2`) | $100 | Đạn nảy lại 1 lần khi chạm tường |

### 6. Shotgun (`shotgun`)

HP:3.5 | Dame:0.5 | Đạn:2 (3 tia)

- **Chỉ số thực đầu hiệp:** HP 3.5 · Sát thương 0.5 · Đạn 2 · Tốc độ 3.5 · Kích thước 26×26
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Mưa Đạn (`evo_shot_1`) | $45 | Tỏa 5 tia |
  | Đạn Dự Phòng (`evo_shot_2`) | $30 | Băng đạn 4 viên |

### 7. Cuộn Quá Tải (`overload`)

HP:5 | Dame:1.2-12 (Tự tụ) | Đạn:6. Đạn sạc nổ xung kích điện.

- **Chỉ số thực đầu hiệp:** HP 5 · Sát thương 1.2 · Đạn 6 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Cầu Điện (`evo_over_1`) | $50 | Nổ xanh TO khi full lực chạm tường |
  | Năng Lượng Xanh (`evo_over_2`) | $20 | Tụ lực nhanh hơn |

- **Mã nguồn:** `js/characters/overload/logic.js`

### 8. Tiểu Liên (`smg`)

HP:4 | Dame:0.75 | Đạn:12 (Lắc)

- **Chỉ số thực đầu hiệp:** HP 4 · Sát thương 0.5 · Đạn 12 · Tốc độ 3.5 · Kích thước 24×24
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Hỏa Lực +++ (`evo_smg_1`) | $80 | Sấy càng lâu: Dame tăng, Tốc bắn tăng, Đạn bay nhanh. |
  | Băng Đạn X (`evo_smg_2`) | $120 | Đạn: 26. Không bắn 5s -> Hồi FULL đạn. |

- **Mã nguồn:** `js/characters/smg/logic.js`

### 9. Lazer Xuyên Phá (`lazer_charge`)

HP:2 | Dame:8 (Tụ full)

- **Chỉ số thực đầu hiệp:** HP 2 · Sát thương 0.25 · Đạn 20 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Pháo Diệt Tinh (`evo_lazer_c_1`) | $150 | Tia to, tồn tại 2s gây sát thương |
  | Năng Lượng Xanh (`evo_lazer_c_2`) | $50 | Nạp đạn nhanh hơn |

- **Mã nguồn:** `js/characters/lazer_charge/logic.js`

### 10. Lazer Pháo (`lazer_auto`)

HP:4 | Dame:1 | Đạn:6 (Xuyên)

- **Chỉ số thực đầu hiệp:** HP 4 · Sát thương 1 · Đạn 6 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Xuyên Phá (`evo_lazer_a_1`) | $30 | Đạn bay cực nhanh |
  | Phá Hủy (`evo_lazer_a_2`) | $45 | Tăng dame, đạn to hơn |

### 11. Pháo Tên Lửa (`rocket`)

HP:5 | Dame:2 (Nổ lan) | Đạn:3

- **Chỉ số thực đầu hiệp:** HP 5 · Sát thương 2 · Đạn 3 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Đầu Đạn Hạt Nhân (`evo_rocket_1`) | $220 | Vùng nổ siêu rộng + Phóng xạ |
  | Đầu Đạn Lớn (`evo_rocket_2`) | $40 | Tăng dame nổ + Phạm vi |

- **Mã nguồn:** `js/characters/rocket/logic.js`

### 12. Cổng Không Gian (`portal`)

HP:5 | Dame:1 | Đạn:7 (Dịch chuyển)

- **Chỉ số thực đầu hiệp:** HP 5 · Sát thương 1 · Đạn 7 · Tốc độ 5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Cổng Cường Hóa (`evo_portal_1`) | $55 | Dịch chuyển nhận đạn nổ |
  | Cổng Gia Tốc (`evo_portal_2`) | $40 | Dịch chuyển hồi đầy đạn + Tốc |

- **Mã nguồn:** `js/characters/portal/logic.js`

### 13. Phong Trảm (`wind_slash`)

HP:4 | Tụ lực bắn Kiếm Khí (Phá đạn)

- **Chỉ số thực đầu hiệp:** HP 4 · Sát thương 1 · Đạn 1 · Tốc độ 3.5 · Kích thước 30×30
- **Vật triệu hồi:** Tường Gió (WindWall)
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Cuồng Phong Tích Tụ (`evo_wind_1`) | $120 | Mỗi phát bắn thứ 5 -> Tự động Full Lực |
  | Nghịch Phong (`evo_wind_2`) | $100 | Chém vào đạn địch -> Phản lại về phía địch |

- **Mã nguồn:** `js/characters/wind_slash/logic.js`, `js/characters/wind_slash/render.js`, `js/characters/wind_slash/summons.js`

### 14. Cuồng Phong (`storm`)

HP:3.5 | Tự tụ lực 14s -> Lao & Chém Tròn (Phản đạn)

- **Chỉ số thực đầu hiệp:** HP 3.5 · Sát thương 2 · Đạn — (năng lượng riêng) · Tốc độ 5 · Kích thước 30×30
- **Vật triệu hồi:** Lốc Xoáy Chém (StormSlash)
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Mắt Bão (`evo_storm_1`) | $80 | Tụ >50% + Khiên: Xóa đạn quanh người. Chém xong hút địch. |
  | Phong Ảnh Trảm (`evo_storm_2`) | $100 | Mỗi 3-8s bóng lao lên chém. Full lực + Khiên: Chém bồi thêm phát nữa. |

- **Mã nguồn:** `js/characters/storm/logic.js`, `js/characters/storm/render.js`, `js/characters/storm/summons.js`

### 15. Axit Hóa (`acid`)

HP:4 | Dame:0.5 | Đạn:1. Ăn mòn Max HP (Max HP<=1 nhận 4 Dame). Đạn tạo vùng

- **Chỉ số thực đầu hiệp:** HP 4 · Sát thương 0.5 · Đạn 1 · Tốc độ 3.5 · Kích thước 30×30
- **Vật triệu hồi:** Vùng Axit (AcidZone)
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Bào Mòn (`evo_acid_1`) | $40 | Vùng Axit rộng hơn, tốc độ ăn mòn Max HP gấp đôi. |
  | Độc Hại (`evo_acid_2`) | $60 | Ngưỡng kết liễu tăng lên 2 Max HP. |

- **Mã nguồn:** `js/characters/acid/summons.js`

### 16. Kỹ Sư (`engineer`)

HP:3 (+2 máu xe lớn) | Dame:0.5 | Đạn:2. Tự tạo Ụ Thường. Giữ 1s đặt Ụ Thông Minh.

- **Chỉ số thực đầu hiệp:** HP 5 · Sát thương 0.5 · Đạn 2 · Tốc độ 3.5 · Kích thước 34×34
- **Vật triệu hồi:** Ụ Súng thường & Ụ Súng thông minh
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Cải Tiến Hệ Thống (`evo_eng_1`) | $100 | Ụ súng thường VIP (75% chỉ số). Ụ súng thông minh VIP tối đa 3 cái, đạn Xuyên. Tương tác Mạng LAN. |
  | Quá Tải / Mạng LAN (`evo_eng_2`) | $200 | Vòng Mạng LAN hồi máu & giúp ụ thường tự ngắm. Giữ bắn 2s bật Quá Tải 600s (-1 Max HP, Ụ thông minh bắn Raycast mỗi 2s). Hết quá tải câm lặng 1s & chậm 5s (CD 8s). |

- **Mã nguồn:** `js/characters/engineer/logic.js`, `js/characters/engineer/summons.js`

### 17. Ghost (`ghost`)

HP:2.5 | Tốc: Rất Nhanh | Đạn:4. Vô Ảnh 2s (CD 3s). Tàn Ảnh phân thân.

- **Chỉ số thực đầu hiệp:** HP 2.5 · Sát thương 1.75 · Đạn 4 · Tốc độ 5.5 · Kích thước 24×24
- **Vật triệu hồi:** Tàn Ảnh (GhostDecoy)
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Bóng Mờ (`evo_ghost_1`) | $60 | Vô ảnh: 2s (Hồi 1s). Đạn tàng hình khi buff. Đạn chớp tắt giữa map. |
  | Ảo Ảnh (`evo_ghost_2`) | $120 | Chu kỳ Vô ảnh nhanh hơn. Mỗi 12s triệu hồi Hư Ảnh bắn phụ. |

- **Mã nguồn:** `js/characters/ghost/logic.js`, `js/characters/ghost/render.js`, `js/characters/ghost/summons.js`

### 18. Pháo Cao Xạ (`aaa`)

HP:5 (+4 máu xe lớn) | Tốc: Chậm | Dame:2. Pháo Kích (1.5s nổ) + Xả nhanh khi có đạn.

- **Chỉ số thực đầu hiệp:** HP 9 · Sát thương 2 · Đạn 1 · Tốc độ 2.1 · Kích thước 37×37
- **Vật triệu hồi:** Pháo cối đánh dấu (MortarMarker)
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Nhắm Đánh Dấu (`evo_aaa_1`) | $80 | Pháo kích tự ghim mục tiêu. Tự bắn thường: 3 tia liên tiếp. |
  | Mưa Tên Lửa (`evo_aaa_2`) | $100 | Tự bắn -> Rơi 3 bom ngẫu nhiên. Pháo kích nổ bồi lần 2. |

- **Mã nguồn:** `js/characters/aaa/logic.js`, `js/characters/aaa/summons.js`

### 19. Kiếm Tôn (`blade_god`)

HP:5 | Dame:1.5 | Đạn:4. Luân phiên: Anh Minh (Hitscan), Hư Vô (Nổ+Câm lặng). Nhát thứ 10: Phá Thiên Kiếm.

- **Chỉ số thực đầu hiệp:** HP 5 · Sát thương 1.5 · Đạn 4 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Kiếm Thế Vô Chủ (`evo_blade_1`) | $150 | Anh Minh xuyên thấu. Hư Vô 3 stack = Tử hình. Gọi Phá Thiên -> Bất tử 5s. |
  | Kiếm Thể Phòng Hộ (`evo_blade_2`) | $150 | Khiên đỡ 5 hit. Khi vỡ phóng 5 kiếm tự ngắm. Nạp đạn cực nhanh. |

- **Mã nguồn:** `js/characters/blade_god/logic.js`

### 20. Kiếm Trận (`van_kiem`)

HP:3.5 | Dame:0.25 | Đạn: Vô Hạn. Tự gọi kiếm. Giữ bắn để vào Kiếm Thế.

- **Chỉ số thực đầu hiệp:** HP 3.5 · Sát thương 0.25 · Đạn ∞ · Tốc độ 5.5 · Kích thước 26×26
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Mưa Kiếm (`evo_vk_1`) | $150 | Tự động gọi kiếm ngẫu nhiên sau lưng. Gọi càng nhanh khi đã bắn nhiều kiếm. |
  | Kiếm Thế Hoàn Chỉnh (`evo_vk_2`) | $150 | Trong Kiếm Thế: Có thể di chuyển siêu chậm, đạn xuyên thấu. Nhả nút phóng Đại Kiếm. |

- **Mã nguồn:** `js/characters/van_kiem/logic.js`

### 21. Súng Nước (`water_gun`)

HP:4 (+2 máu xe lớn) | Dame:1.5. Đạn: Nội năng (100%). Bấm: Tia nước. Giữ 1s: Laser nước.

- **Chỉ số thực đầu hiệp:** HP 6 · Sát thương 1.5 · Đạn — (năng lượng riêng) · Tốc độ 3.5 · Kích thước 34×34
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Vòi Rồng (`evo_water_1`) | $100 | Giữ bắn -> Phun liên tục (10%/0.5s), vừa đi vừa phun chậm. Nghỉ bắn hồi nội năng nhanh (15%/s). |
  | Vòi Cao Áp (`evo_water_2`) | $120 | Tự hồi nội năng (0.5%/s) kể cả khi đang bắn. Đạn làm chậm và xuyên thấu. |

- **Mã nguồn:** `js/characters/water_gun/logic.js`

### 22. Lò Nung (`furnace`)

HP:6 (+3 máu xe lớn) | Chậm | Dame:0.25. Đạn: Nội năng. Gây Đốt. 5 stack Đốt -> Nổ 5 dame.

- **Chỉ số thực đầu hiệp:** HP 9 · Sát thương 0.25 · Đạn — (năng lượng riêng) · Tốc độ 3.5 · Kích thước 36×36
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Nhiệt Năng (`evo_furnace_1`) | $100 | Giữ bắn 1s -> Bắn tia lửa liên tục, hao năng lượng cực nhanh. |
  | Tích Tụ (`evo_furnace_2`) | $150 | Đốt kéo dài 6s. Cứ tiêu hao 30% nội năng -> Đạn kế tiếp gây nổ tạo Vùng Lửa. |

- **Mã nguồn:** `js/characters/furnace/logic.js`

### 23. Âm Dương Sư (`am_duong_su`)

HP:5 | Dame:0.5 | Đạn:4. Luân phiên Âm/Dương chú. Bùa kích nổ nhanh.

- **Chỉ số thực đầu hiệp:** HP 5 · Sát thương 0.5 · Đạn 4 · Tốc độ 3.5 · Kích thước 30×30
- **Vật triệu hồi:** Bùa chú, Pháp trận, Vùng hư vô, Vùng phóng xạ
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Pháp Chú (`evo_ads_1`) | $80 | Nổ/Choáng rộng và lâu hơn. Bùa tồn tại lâu hơn. |
  | Pháp Trận (`evo_ads_2`) | $100 | Bùa kết hợp nổ để lại Pháp Trận sát thương liên tục. |

- **Mã nguồn:** `js/characters/am_duong_su/logic.js`, `js/characters/am_duong_su/render.js`, `js/characters/am_duong_su/summons.js`

### 24. 6 Nòng (`six_barrel`)

HP:6 (+3 máu xe lớn) | Dame:0.4 | Đạn: Vô hạn. Bắn liên tục tăng Nhiệt, đi chậm. Quá nhiệt gây câm lặng.

- **Chỉ số thực đầu hiệp:** HP 9 · Sát thương 0.4 · Đạn ∞ · Tốc độ 3.5 · Kích thước 36×36
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Bão Đạn (`evo_six_1`) | $80 | Nhiệt >50%: Bắn 2 viên. Nhiệt >75%: Bắn 3 viên. |
  | Quá Nhiệt (`evo_six_2`) | $100 | Nhiệt >50% đã gây Đốt. Hạ nhiệt cực nhanh khi <50%. Lâu quá tải hơn. Nhược điểm: Quá tải trừ 5 Max HP. |

- **Mã nguồn:** `js/characters/six_barrel/logic.js`

### 25. Kẻ Mạnh Nhất (`the_strongest`)

HP 1. Dùng Chú Lực vô hiệu sát thương. Nhấp: Lướt (Thương). Giữ: Hit-scan (Hách). Bị trúng đòn ngắt niệm.

- **Chỉ số thực đầu hiệp:** HP 1 · Sát thương 2 · Đạn — (năng lượng riêng) · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | HÆ° Thá»©c: Tá»­ (TĂ­m) (`evo_strongest_1`) | $90 | KĂ­ch hoáº¡t cáº£ 2 ná»™i táº¡i khi ChĂº lá»±c >50% táº¡o cáº§u há»§y diá»‡t ná»• diá»‡n rá»™ng. |
  | Lá»¥c NhĂ£n (Máº¯t Xanh) (`evo_strongest_2`) | $90 | TÄƒng max & há»“i ChĂº lá»±c. Nháº¥p: Äáº¡n Xanh hĂºt Ä‘á»‹ch. Giá»¯: Tia Äá» choĂ¡ng. |

- **Mã nguồn:** `js/characters/the_strongest/logic.js`

### 26. Sniper (`sniper`)

HP:3 | Dame:2 | Đạn:5. Tốc chậm. Giữ bắn tạo tường. Xuyên giảm dame. Nạp cả băng.

- **Chỉ số thực đầu hiệp:** HP 3 · Sát thương 2 · Đạn 5 · Tốc độ 2.62 · Kích thước 24×24
- **Vật triệu hồi:** Tường Sniper (SniperWall)
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Tường Thép (`evo_sniper_1`) | $80 | Tường HP x5. Đạn Sniper đi qua tường phe mình KHÔNG bị giảm sát thương. |
  | Xuyên Thủng (`evo_sniper_2`) | $100 | 25% đạn thành tia Raycast (chạm tường/chướng ngại vật sẽ thành đạn thường). |

- **Mã nguồn:** `js/characters/sniper/logic.js`, `js/characters/sniper/render.js`, `js/characters/sniper/summons.js`

### 27. Bow (`cung`)

HP:3 | Dame:0.5 | Đạn:3 | Tốc: Nhanh. Tụ lực: Tăng sát thương/Tốc đạn. Nội tại Nhạy Bén: Tự né 1 lần đạn mỗi 8s (Full Evo 5s).

- **Chỉ số thực đầu hiệp:** HP 3 · Sát thương 0.5 · Đạn 3 · Tốc độ 4.38 · Kích thước 24×24
- **Vật triệu hồi:** Mưa Tên (ArrowRain)
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Xuyên Thủng (`evo_cung_1`) | $80 | Tụ >2s: Đạn xuyên qua mục tiêu nhưng giảm 50% dame. |
  | Mưa Tên (`evo_cung_2`) | $120 | Tụ >3s: Tạo hồng tâm đuổi địch. Nhả bắn rơi Mưa Tên (CD: 10s). |

- **Mã nguồn:** `js/characters/cung/logic.js`, `js/characters/cung/render.js`, `js/characters/cung/summons.js`

### 28. Mirror (`mirror`)

HP:4 | Dame:1 | Đạn:6. Tạo bản sao đối xứng bắn cùng lúc (50% dame). Giữ bắn 1s để hoán đổi vị trí.

- **Chỉ số thực đầu hiệp:** HP 4 · Sát thương 1 · Đạn 6 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Tái Lập (`evo_mirror_1`) | $80 | CD Đổi còn 3s. Sau khi đổi: Tăng Tốc, Dame và Bất tử 0.5s. |
  | Hình Chiếu (`evo_mirror_2`) | $100 | Tạo Ảnh chiếu cho địch. Đánh vào Ảnh chiếu địch chịu 50% dame. |

- **Mã nguồn:** `js/characters/mirror/logic.js`, `js/characters/mirror/render.js`

### 29. Vua Đầu Bếp (`sukuna`)

HP:7 (+3 máu xe lớn) | Chú Lực tấn công. Giữ bắn Phản Chuyển (+1.25 HP). Bị trúng đòn ngắt niệm Lãnh Địa.

- **Chỉ số thực đầu hiệp:** HP 10 · Sát thương 3 · Đạn ∞ · Tốc độ 3.5 · Kích thước 36×36
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Hỏa Mũi Tên (Fuga) (`evo_sukuna_1`) | $100 | Khi đầy 100 Chú Lực, giữ bắn 2s phóng đại hồng tâm lửa gây 3.5 dame. |
  | Phách Diện Rộng (`evo_sukuna_2`) | $100 | Nhát chém to gấp đôi, có thể triệt tiêu đạn thường của kẻ địch. |

- **Mã nguồn:** `js/characters/sukuna/logic.js`, `js/characters/sukuna/render.js`

### 30. Paradox (`paradox`)

HP:5 | Dame:1 | Đạn:5. Có bóng đi sau 3s. Giữ ngắn (0.33s) tua ngược & tự xả đạn lặp lại (CD: 12s/7s).

- **Chỉ số thực đầu hiệp:** HP 5 · Sát thương 1 · Đạn 5 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Dấu Ấn Thời Gian (`evo_paradox_1`) | $100 | Bắn trúng địch tích ấn (Max 3). Đủ ấn tạo Bóng Đứng Yên + Choáng. Kích hoạt tua ngược kéo địch về Bóng Đứng. |
  | Nghịch Đảo (`evo_paradox_2`) | $120 | Hồi chiêu Tua Ngược còn 10s. Kéo địch về gây Làm Chậm. Đủ 2 Evo: Kéo địch về Bóng 5s (Choáng 0.5s) hoặc Bóng Đứng (Choáng 1.5s, 2 hit tạo bóng). |

- **Mã nguồn:** `js/characters/paradox/logic.js`, `js/characters/paradox/render.js`

### 31. Nhà Ảo Thuật (`magician`)

HP:3.5 | Dame:1.5 | Rất Nhanh | Đạn:7. Giữ bắn+Đi: Lướt, Khiên, Tàng hình. Giữ bắn+Đứng: Khiên & Vô địch. Giữ 1s: Hoán đổi & Khiên.

- **Chỉ số thực đầu hiệp:** HP 3.5 · Sát thương 1.5 · Đạn 7 · Tốc độ 4.73 · Kích thước 26×26
- **Vật triệu hồi:** Phân Ảnh (illusions), Hòm ảo
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Hoán Đổi Chủ Động (`evo_mag_1`) | $100 | Giữ bắn 1s: Tàng hình & Đổi vị trí với Phân ảnh. Đổi với bóng Đứng: Bóng tự đi. Đổi bóng Đi: Cả hai tăng tốc. |
  | Loạn Ảnh & Suy Yếu (`evo_mag_2`) | $120 | Bắn trúng +1, Địch phá bóng +3 stack Suy Yếu (Nhận thêm dame). Đủ 3 stack: Địch bị Slow. Đạn trúng địch gây Loạn Phím. |

- **Mã nguồn:** `js/characters/magician/logic.js`, `js/characters/magician/render.js`

### 32. Nhà Phát Minh (`inventor`)

HP:2 | Tốc: 0.8x | Dame: 0.5 | Đạn: 4. Dùng Linh Kiện (LK) nâng cấp. Sở hữu Drone Không Kích.

- **Chỉ số thực đầu hiệp:** HP 2 · Sát thương 0.5 · Đạn 4 · Tốc độ 2.24 · Kích thước 30×30
- **Vật triệu hồi:** Drone Không Kích (1/2/4 chiếc)
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Cải Tiến Và Tiến Hóa (`evo_inv_1`) | $80 | Drone nhận 75% chỉ số. Drone hồi sinh nhanh. Thắng +6 LK, Crate +2 LK, Xe tiền +3 LK. |
  | Bản Thiết Kế ++ (`evo_inv_2`) | $100 | Có 2 Drone. Hồi sinh 8s. Mở khóa Tụ Gió & Khiên Drone trong Chợ LK. |

- **Mã nguồn:** `js/characters/inventor/logic.js`, `js/characters/inventor/render.js`, `js/characters/inventor/summons.js`

### 33. Shadow Hunter (`shadow_hunter`)

HP:2 | Dame:1 | Đạn:6. Vô Hình (Nhấn Bắn: +40% Tốc, +50% Dame, Đòn Cường Hóa). Chảy máu & Chậm.

- **Chỉ số thực đầu hiệp:** HP 2 · Sát thương 1 · Đạn 6 · Tốc độ 5.92 · Kích thước 24×24
- **Vật triệu hồi:** Bẫy Bóng Tối (ShadowTrap)
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Bóng Mờ (`evo_sh_1`) | $90 | Đòn cường hóa xuyên thấu. Gây Mù HUD điều khiển đối thủ trong 1.5s. |
  | Phục Kích (`evo_sh_2`) | $110 | Vào Vô Hình: Nạp đầy đạn, +60% tốc, +100% dame. Đạn câm lặng 1.5s. Rải 2 cạm bẫy bóng đêm. |

- **Mã nguồn:** `js/characters/shadow_hunter/logic.js`, `js/characters/shadow_hunter/summons.js`

### 34. Shortgun (`shortgunATK`)

HP:5 | Dame:2 | Đạn:2. Quét 180px -> Lao áp sát (cách 40px) -> Nón bộc phá 0.5s. Nhấp đúp: x2 đạn & x2 dame. Phá hủy hồi 1 đạn.

- **Chỉ số thực đầu hiệp:** HP 7 · Sát thương 2 · Đạn 2 · Tốc độ 5.47 · Kích thước 34×34
- **Vật triệu hồi:** Biển Lửa
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Dragon Strike (`evo_sg_1`) | $90 | Đạn gây Đốt 2 tầng. Vùng nón cảnh báo để lại Vùng Biển Lửa (FireZone) 3s. |
  | Tàn Phá (`evo_sg_2`) | $110 | Tiêu diệt mục tiêu biến xác thành đạn pháo quán tính văng thẳng phía trước nổ AoE. |

- **Mã nguồn:** `js/characters/shortgunATK/logic.js`, `js/characters/shortgunATK/render.js`, `js/characters/shortgunATK/summons.js`

### 35. Sấm Chớp (`thunder`)

HP:2 | Dame:1 | Đạn:0 (3 Lôi Phong Thương). Nhấp: Phóng thương cắm tường nổ AoE. Giữ 0.5-1s: Thu thương. Giữ >1s: Trảm Lôi. Lôi Minh: Raycast toàn map.

- **Chỉ số thực đầu hiệp:** HP 2 · Sát thương 1 · Đạn — (năng lượng riêng) · Tốc độ 5.92 · Kích thước 26×26
- **Vật triệu hồi:** Lôi Phong Thương cắm đất
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Phá Sấm (`evo_thun_1`) | $90 | Nổ tường & đòn chém xoay gây Choáng 1s. |
  | Rẽ Mây (`evo_thun_2`) | $110 | Lôi Minh kéo dài 8s; Nhận 3 lần miễn nhiễm sát thương hoàn toàn. |

- **Mã nguồn:** `js/characters/thunder/logic.js`, `js/characters/thunder/render.js`, `js/characters/thunder/summons.js`

### 36. Nam Châm (`magnet`)

HP:5 | Dame:0.5 | Đạn:6. Đổi Cực Âm/Dương (+/-). Bắn cắm Cột Từ Trường. Hút/Đẩy kẻ địch nhiễm từ. Lướt Cực Tính đâm cột.

- **Chỉ số thực đầu hiệp:** HP 7 · Sát thương 0.5 · Đạn 6 · Tốc độ 3.5 · Kích thước 34×34
- **Vật triệu hồi:** Nút Từ Trường (magnet nodes)
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Từ Trường Tăng Cường (`evo_mag_net_1`) | $90 | Hút gây 0.5 dame (x2); Lướt Cực Tính (Polar Dash) gây x2 dame. |
  | Lưới Từ Cực (`evo_mag_net_2`) | $110 | Tối đa 3 Cột Từ Trường. |

- **Mã nguồn:** `js/characters/magnet/logic.js`, `js/characters/magnet/render.js`, `js/characters/magnet/summons.js`

### 37. Tiến Hóa (`evolution`)

HP:1 | Dame:1 | Đạn:1 (Thuần Farm). Ăn/Phá Rương cộng vĩnh viễn chỉ số. Rương Giả Mạo (Mimic). Late game bất khả chiến bại.

- **Chỉ số thực đầu hiệp:** HP 1 · Sát thương 1 · Đạn 1 · Tốc độ 3.5 · Kích thước 30×30
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Mưa Tiến Hóa (`evo_evo_1`) | $90 | Tăng mạnh tỉ lệ rương; Chỉ số nhận từ thùng đồ tăng +30%. |
  | Dị Thể Cộng Hưởng (`evo_evo_2`) | $110 | Mảnh văng Mimic x2 số lượng & gây 100% Dame của xe. |

- **Mã nguồn:** `js/characters/evolution/logic.js`, `js/characters/evolution/render.js`

### 38. Trối Chết (DeathLock) (`death_lock`)

HP:5 (+2 máu xe lớn) | Dame:0.5 | Đạn:3 | Tốc: 0.8x. Nội tại Ràng Buộc: 4 tầng ấn. Đạn Cấm Chế: Lồng Xích hút & giam giữ.

- **Chỉ số thực đầu hiệp:** HP 7 · Sát thương 0.5 · Đạn 3 · Tốc độ 2.8 · Kích thước 34×34
- **Vật triệu hồi:** Lồng Cấm Chế (ConfinementCage)
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Trói (`evo_dl_1`) | $90 | Thời gian duy trì ấn Ràng Buộc tăng từ 5s lên 8s (Full Evo: 12s). |
  | Quản Chế (`evo_dl_2`) | $110 | Lực kéo tâm xích mạnh & xa hơn; Chiều rộng Lồng thu hẹp còn 140px (Full: 100px). |

- **Mã nguồn:** `js/characters/death_lock/logic.js`, `js/characters/death_lock/summons.js`

### 39. Kẻ Sáng Tạo (`creator`)

HP:1 | Dame:0.25 | Đạn:1 | Tốc: 1.0x. Bản Thiết Kế Toàn Năng: Ụ Súng Tự Ngắm (max 2), Khiên Thép Chắn Đạn (5 HP), Drone Không Kích.

- **Chỉ số thực đầu hiệp:** HP 1 · Sát thương 0.25 · Đạn 1 · Tốc độ 3.5 · Kích thước 24×24
- **Vật triệu hồi:** Ụ Súng Tự Ngắm, Khiên Thép, Drone Không Kích, Robot Chiến Đấu (Evo 2)
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Sản Phẩm Mới (`evo_cr_1`) | $90 | Ụ súng và Khiên thép nhận 100% chỉ số (Ụ súng x2 dame, Khiên 10 HP). |
  | Robot Tự Động (`evo_cr_2`) | $120 | Sau 10s xuất xưởng Robot Chiến Đấu (36x36, 10 HP, SMG/Rocket/Dash, Hồi sinh 30s). |

- **Mã nguồn:** `js/characters/creator/logic.js`, `js/characters/creator/summons.js`

### 40. Chiêu Hồn Sư (`necromancer`)

HP:1 | Dame:1 | Đạn:1 | Tốc: 0.8x. Linh Minh Hộ Thể: Khởi đầu 6 Linh Hồn (Linh Giáp đỡ đòn). Tụ lực phím Bắn triệu hồi 3 mốc Vong Linh.

- **Chỉ số thực đầu hiệp:** HP 1 + 6 Linh Hồn · Sát thương 1 · Đạn 1 · Tốc độ 2.8 · Kích thước 32×32
- **Vật triệu hồi:** Vong Linh: Cảm Tử / Xạ Thủ / Cao Cấp
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Linh Thể (`evo_necro_1`) | $90 | Tốc độ hồi Linh Hồn nhanh hơn (3 Linh Hồn mỗi 3s). |
  | Thống Trị (`evo_necro_2`) | $110 | +4 Linh Hồn tối đa. Quái triệu hồi nhận nội tại bổ sung (Cảm Tử +50% bán kính nổ; Xạ Thủ bắn đạn Xuyên; Cao Cấp có khiên đỡ 3 đòn). |

- **Mã nguồn:** `js/characters/necromancer/logic.js`, `js/characters/necromancer/render.js`, `js/characters/necromancer/summons.js`

### 41. Thiên Tài (`genius`)

HP:1 | Dame:1 | Đạn:1 | Tốc: 1.3x. Thu thập Bánh Răng & Linh Kiện. Mở Chợ Đen nâng cấp Robot. Đủ Bánh Răng nhấn giữ để trực tiếp Lái Mecha!

- **Chỉ số thực đầu hiệp:** HP 1 · Sát thương 1 · Đạn 1 · Tốc độ 4.55 · Kích thước 24×24
- **Vật triệu hồi:** Mecha chiến đấu (lái được)
- **Tiến hoá:**

  | Evo | Giá | Hiệu ứng |
  |---|---:|---|
  | Tối Ưu Hóa (`evo_gen_1`) | $90 | Giảm tiêu hao Bánh Răng vào Mecha còn 6 BR; Kỹ năng giảm 1 NL; Hoàn lại 4 BR khi Mecha vỡ; Hồi 2 NL/s khi không dùng kỹ năng 2s. |
  | Vũ Trang Hóa (`evo_gen_2`) | $110 | Bắn thường Mecha có Xuyên Thấu. Trang bị 4 module tự động (Bắn phụ 3s, Radar AAA 8s, Chấn Động 10s, Pháo Thủy Lực 8 NL). |

- **Mã nguồn:** `js/characters/genius/logic.js`, `js/characters/genius/render.js`

## Cửa hàng riêng

### ⚙ Chợ Linh Kiện — Nhà Phát Minh (trả bằng Linh Kiện LK)

| Món | ID | Nhóm | Giá (LK) | Cấp tối đa | Hiệu ứng |
|---|---|---|---:|---:|---|
| Bộ Đàm | `inv_bodam` | body | 1 | 3 | Tốc chạy +10%, Drone hồi sinh nhanh hơn 0.5s. |
| Giáp Hợp Kim | `inv_giap` | body | 3 | 1 | +1 Max HP. Nhặt Crate nhận Giáp Ảo tồn tại 5s. |
| Tăng Cường HT | `inv_tangcuong` | body | 5 | 1 | +2 Đạn. Đạn chủ thừa hưởng hiệu ứng của Drone. |
| Lưới Điện | `inv_luoidien` | body | 4 | 1 | Đứng yên 2s tạo lưới chặn đạn -> 1 LK (CD: 12s). |
| Ép Xung | `inv_epxung` | body | 5 | 1 | Giữ S: Câm lặng mình 4s, Drone +50% tốc, x2 tốc bắn (CD: 15s). |
| Pháo Drone | `inv_phao` | drone | 2 | 1 | Mỗi 3s bắn đạn nổ lan AoE diện rộng. |
| Khiên Chắn | `inv_khien` | drone | 5 | 1 | Drone hồi 1 Khiên bảo vệ chủ mỗi 20s. |
| Tăng Số Đạn | `inv_dan` | drone | 1 | 3 | +1 viên đạn cho Drone mỗi loạt bắn. |
| TB Ổn Định | `inv_ondinh` | drone | 1 | 3 | Tăng tốc bắn & tốc bay qua lại của Drone. |
| Thiết Bị Ngắm | `inv_ngam` | drone | 3 | 1 | Drone tự ngắm xoay nòng vào kẻ địch. |
| Nhiễu Sóng | `inv_nhieu` | drone | 3 | 1 | Đạn làm chậm, tích 3 hit choáng 1.5s. |
| Bộ Hồi Phục | `inv_hoiphuc` | drone | 5 | 1 | Tự hồi 1 HP cho chủ thể mỗi 5s. |
| Drone Tiểu Liên | `inv_smg` | drone | 4 | 1 | Mỗi 5s xả 12 viên đạn tỏa nón như SMG. |
| Drone Laser | `inv_lazer` | drone | 4 | 1 | Đạn đổi thành Laser xuyên tường & vật thể. |
| Drone Pháo Băng | `inv_bang` | drone | 4 | 1 | Mỗi 4s bắn cầu băng tạo vùng làm chậm. |
| Drone Lửa | `inv_lua` | drone | 4 | 1 | Mỗi 4s bắn cầu lửa tạo vùng thiêu đốt. |
| Tụ Gió (Evo 2) | `inv_tugio` | evo2 | 4 | 1 | Mỗi 2s chém nát đạn địch bay tới. |
| Khiên Drone (Evo) | `inv_khien_drone` | evo2 | 2 | 3 | Tăng máu, giáp ảo trực tiếp cho Drone. |
| Nâng Cấp Cuối Cùng | `inv_full_evo` | fullevo | 15 | 1 | FULL EVO: 4 Drone (200% chỉ số), giảm 60% CD nòng phụ, xe chủ tích hợp toàn bộ vũ khí! |

### 🤖 Chợ Đen Robot — Thiên Tài (trả bằng Bánh Răng)

| Món | ID | Hiệu ứng |
|---|---|---|
| Gia Cố Thân Vỏ | `gen_hp` | +3 Máu Robot |
| Lõi Xung Kích | `gen_dmg` | +0.25 Sát Thương Robot |
| Pin Lượng Tử | `gen_energy` | +15 Năng Lượng Tối Đa |
| Động Cơ Turbo | `gen_speed` | +15% Tốc Độ Di Chuyển Robot |
| Tụ Điện Phục Hồi | `gen_regen` | +1 Năng Lượng Hồi Phục/s |
| Đạn Hàn Băng | `gen_slow` | Đạn làm chậm đối thủ 40% trong 2s |
| Đạn Nhiệt Hạch | `gen_fire` | Đạn gây thiêu đốt trong 3s |
| Ngòi Nổ Phá Khối | `gen_explosive` | Tăng 50% bán kính nổ đạn |
| Lá Chắn Khởi Đầu | `gen_shield` | Bắt đầu trận có 1 lớp khiên chặn 1 đòn |
