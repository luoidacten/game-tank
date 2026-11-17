# Đánh giá chuyển 91 body sang 2D MOVE (đi 4 hướng, có vật cản — kiểu Bang Bang)

> Chưa code. Đánh giá dựa trên mô tả kỹ năng (`js/data/modules.js`, `body-guides.js`) và số liệu code từng body
> (độ dài, số chỗ cố định hướng bắn lên/xuống, số chỗ dựa vào mép sân / tường / laser).
> Áp dụng cho cả bản web lẫn bản Unity riêng: trên Unity mọi body đều viết lại bằng C#,
> nên "độ khó" ở đây là **độ khó thiết kế lại cho 4 hướng + vật cản**, cộng với khối lượng.

## Thang xếp loại

| Mức | Ý nghĩa | Số body |
|---|---|---:|
| 🟢 **DỄ** | Bắn đạn / hiệu ứng theo điểm trúng. Chỉ cần đổi hướng đạn = hướng xe đang nhìn. Giữ nguyên bộ kỹ năng. | 31 |
| 🟡 **TRUNG BÌNH** | Có lao, tia, vùng, triệu hồi, cơ chế "theo trục X / giữa sân / làn địch" → đổi sang "theo hướng nhìn / theo khoảng cách / theo điểm ngắm". Giữ ý tưởng, sửa từng chiêu. | 47 |
| 🟠 **KHÓ** | Cơ chế lõi gắn với sân dọc (tường ngang làn, rơi xuống làn địch, chạy hết sân, nhiều xe điều khiển…) hoặc quá đồ sộ. Phải thiết kế lại 1–2 kỹ năng chính. | 9 |
| 🔴 **LÀM LẠI CẢ BỘ** | Bản sắc dựa hoàn toàn vào đối xứng / làn / trục X, hoặc bộ kỹ năng hiện tại nhiều lỗi. Viết lại toàn bộ kỹ năng. | 4 |

Quy ước chuyển chung (dùng cho mọi body):
- "Bắn lên/xuống" → bắn theo **hướng xe đang nhìn** (4 hướng; 8 hướng nếu chọn).
- "Trục X của địch / làn địch" → **vị trí địch** hoặc **điểm ngắm** (hồng tâm tự bám địch trong tầm).
- "Giữa sân" → **sau N px bay**. "Tới cuối sân" → **tới tầm tối đa hoặc chạm vật cản**.
- "Tường biên" → **mọi vật cản cứng** (bản đồ dạng ô, mặt phẳng ngang/dọc → nảy chỉ cần đảo vx hoặc vy).
- "Lướt ngang" → **lướt vuông góc với hướng nhìn**.
- Đòn "rơi từ trời" (cối, Thiên Tiễn, bom cao) → **bay vòng qua vật cản**, đây là điểm mạnh mới của nhóm này.
- Màn kết liễu (`BODY_FINISHERS`) và Evo 3/4: làm lại riêng sau khi body chạy ổn.

## Bảng 91 body

Cột "Code" = số dòng code hiện tại (đo khối lượng). Ghi chú = việc chính cần làm.

### 🟢 DỄ (31)

| Body | Code | Ghi chú |
|---|---:|---|
| basic — Cơ Bản | 437 | Đạn thẳng; MAIN/Hồi Ức giữ nguyên |
| money_tank — Xe Tiền | 271 | Farm tiền + cấp độ, không phụ thuộc hướng |
| ice — Pháo Băng | 235 | Đạn chậm; Evo 3 "làn băng" → vệt băng theo đường bay |
| shotgun | 15 | Nón 5 viên theo hướng nhìn |
| overload — Cuộn Quá Tải | 462 | Đạn sạc nổ |
| smg — Tiểu Liên | 71 | Lắc nòng quanh hướng nhìn |
| rocket — Pháo Tên Lửa | 15 | Nổ lan |
| wind_slash — Phong Trảm | 300 | Kiếm khí phá đạn |
| acid — Axit Hóa | 161 | Vùng ăn mòn tại điểm trúng; x10 dame lên vật cản → rất hợp map có tường phá được |
| ghost | 195 | Vô ảnh, tàn ảnh |
| furnace — Lò Nung | 61 | Đốt cộng dồn |
| am_duong_su — Âm Dương Sư | 242 | Luân phiên bùa |
| six_barrel — 6 Nòng | 151 | Khởi động nòng, nhiệt |
| shadow_hunter | 281 | Vô hình + đòn cường hóa |
| evolution — Tiến Hóa | 167 | Ăn rương/xe; map 2D có nhiều rương hơn |
| kiem_khach — Kiếm Khách | 496 | Phi kiếm; vài Bài Tập Luyện Kiếm cần đổi điều kiện |
| kiem_su — Kiếm Sư | 247 | Ngũ hành tại điểm trúng (Thổ dựng đá = vật cản tạm → rất hợp) |
| revolver — Cao Bồi | 539 | Quạt Cò khóa hồng tâm |
| dj | 810 | Nhịp nút bắn độc lập với hướng; sóng âm theo hướng nhìn |
| healer — Y Sư | 613 | Hồi máu, đạn hút máu |
| chrononeo — Chrono & Neo | 915 | Đạn xuyên vật cản; lướt theo hướng nhìn |
| berserker — Cuồng Chiến | 845 | Sấy liên thanh tỏa góc |
| juggernaut | 663 | Miễn khống chế; "đi xuyên tường giới hạn" → đi xuyên lồng/tường tạm |
| jack_6_lo — Jack 6 Lỗ | 874 | Tung xu, chỉ số bất định |
| arachnid — Nhện Độc | 654 | Vùng tơ tại điểm trúng / vật cản |
| the_clock | 586 | Time Zone toàn sân, đếm nhịp |
| the_adapter | 567 | Thích ứng vai trò; "đẩy lùi ngang" → đẩy theo hướng đạn |
| tinh — Tỉnh | 561 | Đo quãng đường địch chạy → còn hợp hơn ở 2D |
| wind | 665 | Ngưng phong / liên phong / hóa gió |
| twin_gun — Hai Nòng | 309 | 2 viên song song hai bên nòng |
| fire_cannon — Pháo Lửa | 505 | Vùng lửa tại điểm trúng |

(shotgun, rocket gần như chỉ là cấu hình đạn trong code chung.)

### 🟡 TRUNG BÌNH (47)

| Body | Code | Việc chính |
|---|---:|---|
| tank — Xe TANK | 508 | Húc theo hướng nhìn, va vật cản dừng/nổ; Evo 3 bẻ lái rất hợp 2D |
| big_bullet — Đạn Lớn | 316 | Nảy trên mọi vật cản (đảo vx/vy); Hành Tinh lăn theo hướng |
| lazer_charge — Lazer Xuyên Phá | 121 | Tia theo hướng nhìn, cảnh báo dạng đường thẳng |
| lazer_auto — Lazer Pháo | 54 | Dòng laser xuyên; quyết định vật cản có chặn không |
| engineer — Kỹ Sư | 617 | Ụ tự ngắm 360° (dễ); giới hạn ụ, đặt ụ theo ô |
| aaa — Pháo Cao Xạ | 238 | Pháo kích vào vị trí địch sau 1.5s → giữ nguyên ý |
| blade_god — Kiếm Tôn | 545 | Quang Kiếm ngắm địch 2D; Phá Thiên Kiếm |
| van_kiem — Kiếm Trận | 111 | Kiếm bay quanh xe |
| water_gun — Súng Nước | 121 | Cột cảnh báo → đường cảnh báo theo hướng |
| the_strongest — Kẻ Mạnh Nhất | 351 | Tia Đỏ thẳng + Xanh hút |
| cung — Bow | 546 | 3 kiểu bắn; Thiên Tiễn rơi từ trời (vượt vật cản) |
| sukuna — Vua Đầu Bếp | 352 | Chém nón theo hướng nhìn |
| paradox | 621 | Dư âm, tua ngược, neo vị trí — vị trí 2D còn hay hơn |
| magician — Nhà Ảo Thuật | 815 | Phân ảnh, dịch chuyển thoát chết (chọn ô trống) |
| inventor — Nhà Phát Minh | 609 | Drone không kích theo vị trí địch |
| shortgunATK — Shortgun | 350 | Quét 180px → lao áp sát; vật cản chặn đường lao |
| magnet — Nam Châm | 556 | Hút/đẩy là vector 2D tự nhiên |
| death_lock — Trối Chết | 144 | Lồng xích hút & giam |
| creator — Kẻ Sáng Tạo | 750 | Ụ, khiên chắn (đặt theo hướng), drone |
| necromancer — Chiêu Hồn Sư | 381 | Vong linh tự tìm đường (cần AI né vật cản) |
| genius — Thiên Tài | 466 | Mecha 5 chế độ; sửa lỗi Chợ Đen/robot luôn |
| sprayer — Bình Phun | 386 | Phun nón theo hướng nhìn |
| customize — Tùy Biến | 662 | Mọi lối bắn là cấu hình đạn → chuyển theo hệ đạn chung |
| t_zero | 1211 | Khiên boomerang, lao đấm, bay lên bỏ qua vật cản rồi đáp |
| raven_oca — Raven | 892 | Lướt vuông góc; Oca khóa vị trí địch |
| lazer_beam — Tia Lazer | 400 | Tia liên tục theo hướng |
| blood_lord — Huyết Ma | 1092 | Hút máu, bể máu; vài chiêu tia |
| kazuki | 904 | Chém nón/chữ X/đâm cột → đâm theo đường thẳng |
| tsukiyo | 1492 | Phi tiêu, hỏa cầu, lướt chém theo hướng; khối lượng lớn |
| joker | 1495 | Hiệu ứng theo chất bài; "bay qua làn địch" → sau N px |
| cluster_gun — Pháo Phân Mảnh | 461 | "Tách giữa sân" → tách sau N px |
| clone — Nhân Bản | 638 | AI clone tản quanh địch — cần tìm đường quanh vật cản |
| one_punch — Nhất Quyền | 794 | Cột áp lực khóa trục X → đường thẳng theo hướng, vẫn cảnh báo |
| boomerang | 756 | "Bay theo trục X tới làn địch" → bay tầm tối đa rồi về |
| psychokinesis — Siêu Năng | 912 | Đạn trôi lệch rồi vút; vùng niệm lực bắt đạn |
| tailor — Thợ May | 918 | Kim cắm vật cản → chỉ căng (map nhiều vật cản càng hay) |
| kusarigama | 773 | Xích liềm ném/kéo theo hướng |
| coc | 991 | 6 vũ khí, từng cái chuyển như nhóm DỄ |
| prism — Phản Chiếu | 719 | Tia nảy 1 lần trên vật cản ô (đảo vx/vy); kính phản đạn = đảo vector |
| railgun | 850 | Cầu năng lượng theo xe; lõi laser chiếu thẳng |
| skinwalker | 716 | "Địch đứng đối diện X±35" → địch trong nón phía trước |
| idol | 979 | Lướt nổ sóng âm, spotlight laser xuyên vật cản |
| dynamite | 696 | Ném cao vòng qua vật cản tới điểm ngắm — rất hợp 2D |
| mortar — Pháo Cối | 458 | Rơi từ trời tới điểm ngắm, bỏ qua vật cản |
| batter — Vua Bóng Chày | 311 | Vung gậy cung phía trước đập ngược đạn |
| hellrider | 314 | Lái xe gia tốc, drift khi chạm vật cản — rất hợp 2D |
| collector | 439 | Hologram 10 body cơ bản → phụ thuộc các body đó đã chuyển |

### 🟠 KHÓ (9)

| Body | Code | Vì sao khó / hướng xử lý |
|---|---:|---|
| sniper | 492 | Lõi là **dựng tường chặn ngang làn**. 2D: tường đặt vuông góc hướng nhìn, chặn đòn từ phía trước; map đã có vật cản nên phải cân lại hoàn toàn |
| storm — Cuồng Phong | 1010 | "Lao lên làn địch" → lao tới vị trí địch / theo hướng tới khi chạm vật cản; lốc gió theo điểm |
| thunder — Sấm Chớp | 1369 | Thương "cắm tường" + Lôi Trảm tại từng thương + thương rơi trời. Vật cản 2D làm cơ chế phong phú nhưng phải viết lại logic cắm/thu |
| steel_hook — Móc Thép | 958 | Móc lắc ±70° + xích nảy tối đa 9 lần trên vật cản bất kỳ → cần dò tia nảy trên lưới ô; kéo xe qua vật cản |
| flower_shadow — Hoa Ảnh | 1674 | Cánh hoa "bay tới cuối sân, nằm trên sân địch, bị xe địch cán" → khái niệm "sân địch" mất; đổi thành cánh bay tới tầm tối đa / vật cản, nằm tại chỗ |
| diep_thanh_phong — Diệp Thanh Phong | 1549 | Hệ Khí Áp + Toàn Phong toàn sân, nhiều đòn kéo đẩy theo làn; đồ sộ nhất nhóm |
| tat_sat — Tất Sát | 908 | Lướt chém tới biên, slow-motion, "chém nát màn hình" → camera 2D + vật cản chặn lướt |
| jet_pilot — Phi Công | 765 | Tách 2 xe (Chân + Phi Ảnh bay), đổi điều khiển → 2 xe tự do 2D khó điều khiển trên điện thoại |
| the_admin | 1376 | 29 ĐK / 35 KQ, nhiều KQ theo làn; khối lượng lớn nhưng chia nhỏ được |

Ngoài 9 body trên, các body TRUNG BÌNH nhưng đồ sộ (> 900 dòng hoặc nhiều chế độ: tsukiyo, joker, coc, blood_lord,
t_zero, psychokinesis, tailor) tốn công gần như KHÓ. Nếu chơi thử storm hoặc flower_shadow theo cách trên không vui
thì chuyển sang LÀM LẠI CẢ BỘ.

### 🔴 LÀM LẠI CẢ BỘ KỸ NĂNG (4)

| Body | Vì sao | Đề xuất bộ kỹ năng mới |
|---|---|---|
| **portal — Cổng Không Gian** | Bộ hiện tại nhiều lỗi, khó giữ. Cơ chế "đạn dịch chuyển" không có ý nghĩa rõ khi có vật cản | **Nội tại XUYÊN KHÔNG** (hồi chiêu ~4s, vòng quanh xe báo): chạy vào vật cản → dịch chuyển ra **phía bên kia vật cản** (giới hạn độ dày, ví dụ ≤3 ô; không xuyên biên bản đồ). **Đạn Không Gian**: đạn bay **xuyên tường** (có thể giảm 20% dame sau khi xuyên để cân bằng). **Giữ Bắn**: đặt cặp cổng A↔B (tối đa 1 cặp, tồn tại 8s): xe và đạn (cả đạn địch) đi vào A ra B. Evo gợi ý: E1 xuyên vật cản dày hơn + giảm hồi chiêu; E2 ra khỏi cổng được +tốc & đạn kế x1.5; Full: 2 cặp cổng, Xuyên Không không hồi chiêu khi vừa bắn trúng |
| **mirror** | Bản sắc = bản sao **đối xứng qua trục sân** + hoán đổi vị trí. Ở 2D tự do không còn "trục sân" tự nhiên | Bản sao đứng **đối xứng qua tâm xe/tâm bản đồ** hoặc "phản chiếu" theo hướng xe: bản sao đi ngược hướng bạn; giữ để hoán đổi. Viết lại toàn bộ, giữ tên + chất "gương" |
| **gemini** | Điều khiển **2 xe** + bản sao AI "trong làn của bạn". 2D tự do + vật cản → điều khiển 2 xe bằng 1 cần gạt rất khó | 1 xe chính + 1 xe đồng hành AI bám đội hình (theo sau/bên cạnh), cộng hưởng Song Hưởng giữ nguyên; bỏ khái niệm làn |
| **kiem_vu — Kiếm Vũ** | Lõi = phóng kiếm **tới trục X của địch rồi cắm xuống**, thu về **nửa sân mình** | Phóng kiếm tới điểm ngắm (bám địch) cắm xuống; nhấp lần 2 kéo kiếm về theo đường thẳng (trúng cả đường về); kiếm cắm tạo vùng Tâm Định. Viết lại điều kiện phóng/thu |

## Kết luận & thứ tự gợi ý

1. **Đợt chơi thử (6–8 body DỄ đa dạng):** basic, tank, ice, shotgun, rocket, big_bullet, ghost, healer
   — đủ lối đánh: đạn thường, húc, khống chế, nổ lan, nảy tường, tàng hình, hồi máu.
2. **Đợt 2:** phần còn lại nhóm DỄ (~20 body, nhanh) + body đặc trưng 2D: dynamite, mortar, hellrider, magnet, tailor, portal (bộ mới).
3. **Đợt 3:** nhóm TRUNG BÌNH theo cụm (kiếm, laser, triệu hồi, đổi thế).
4. **Đợt 4:** nhóm KHÓ và LÀM LẠI — chỉ sau khi đã chơi thử thật nhiều; có thể bỏ hẳn vài body khỏi 2D MOVE.

Rủi ro chung: cân bằng làm lại toàn bộ; AI bot + vật triệu hồi cần tìm đường (A* trên lưới ô); màn kết liễu, Evo 3/4 làm lại sau.
