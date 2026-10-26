// ==========================================
// Dữ liệu Tiến hoá (Evo) của từng nhân vật
// Đã cân bằng kinh tế: Phân tầng Đầu Game / Giữa Game / Cuối Game & Phá Game ($60 -> $480)
// ==========================================

// --- EVOLUTIONS ---
const EVOLUTIONS = {
    basic: [
        { id: 'evo_basic_1', name: 'Công Thủ Toàn Diện', desc: 'HP +2, Dame ×1.25 (bản MAIN: có sẵn từ đầu trận)', cost: 60, type: 'evo' },
        { id: 'evo_basic_2', name: 'Bản Lĩnh', desc: '+2 đạn, nạp đạn nhanh hơn 15%. (Bản MAIN 8%/trận: có sẵn và thay bằng HỒI ỨC — lần đầu trong trận bị hạ gục -> hồi sinh 100% máu, Thức Tỉnh MAIN vĩnh viễn: x2 Max HP, +1 Dame, 10 đạn, bất tử 3s)', cost: 140, type: 'evo' }
    ],
    money_tank: [
        { id: 'evo_money_atk', name: 'Tiền Tấn Công', desc: 'Mỗi 8s phóng 1 xe tiền trên 1 cột dọc ngẫu nhiên quanh địch, lao thẳng từ làn bạn sang (có CẢNH BÁO đường chạy 2s trước khi lao để né; tông trúng 1.5 dame, chạm tường nổ 1.5 dame, phá xe tiền/thùng trên đường). Phá xe tiền bằng đạn -> bắn chùm đạn vào địch.', cost: 260, type: 'evo' },
        { id: 'evo_money_2', name: 'Sức Mạnh Đồng Tiền', desc: 'Mọi nâng cấp giảm 25%. Mỗi 100$ tiêu (tối đa 2500$, tính từ lúc mua) nhận 1 mốc thưởng vĩnh viễn: HP, Dame, Đạn, Tốc, Khiên. FULL EVO: mọi mặt hàng giảm 50%, thêm xe tiền trên sân, mỗi 5s phóng 3 xe tấn công LẦN LƯỢT (cách nhau 1s, mỗi xe 1 cột ngẫu nhiên, đều cảnh báo 2s, mạnh hơn).', cost: 480, type: 'evo' }
    ],
    tank: [
        { id: 'evo_tank_1', name: 'Không Thể Cản Phá', desc: 'Lao húc x1.5 dame, không bị phản chấn khi tông tường/vật thể, khi lao chỉ nhận 20% sát thương', cost: 170, type: 'evo' },
        { id: 'evo_tank_2', name: 'Tàn Phá!!!', desc: 'Húc nổ lan + băng (khi còn khiên) + Hồi khiên nội tại nhanh hơn (6s -> 4s, Full Evo 2s, +15 HP)', cost: 280, type: 'evo' }
    ],
    ice: [
        { id: 'evo_ice_1', name: 'Bão Tuyết', desc: 'Mỗi 3 lần kích hoạt -> Tạo vùng Băng Cực Đại', cost: 230, type: 'evo' },
        { id: 'evo_ice_2', name: 'Hàn Băng', desc: 'x1.5 Dame lên kẻ bị chậm, Vùng băng gây dame', cost: 130, type: 'evo' }
    ],
    big_bullet: [
        { id: 'evo_big_1', name: 'To Hơn Nữa', desc: 'Đạn siêu to khổng lồ (gấp đôi: 32px). Full Evo: từ lần nảy thứ 2 đạn hóa Xuyên Thấu (xuyên mọi vật cản, vẫn trúng địch) và vẫn nảy tiếp', cost: 150, type: 'evo' },
        { id: 'evo_big_2', name: 'Bóng Cao Su', desc: 'Đạn nảy tường tối đa 7 lần (Full Evo 9), càng nảy càng to; nảy đủ thì tự nổ khi tới giữa sân. Full Evo: đạn kết thúc/bị phá sẽ nổ thành vòng mảnh đạn 360° (chỉ hại địch)', cost: 290, type: 'evo' }
    ],
    shotgun: [
        { id: 'evo_shot_1', name: 'Mưa Đạn', desc: 'Tỏa 6 viên; ngay sau mỗi phát bắn thêm đợt 2 gồm 3 viên tụm giữa', cost: 220, type: 'evo' },
        { id: 'evo_shot_2', name: 'Đạn Dự Phòng', desc: 'Băng đạn 4 viên', cost: 120, type: 'evo' }
    ],
    overload: [
        { id: 'evo_over_1', name: 'Thanh Năng Lượng Phụ', desc: '+1 thanh phụ, nạp sau khi thanh chính đầy. Đầy -> trữ 2 Đạn Sạc, bắn liền 2 phát.', cost: 160, type: 'evo' },
        { id: 'evo_over_2', name: 'Vụ Nổ EMP', desc: 'Đạn Sạc nổ phát vòng EMP rộng hơn vụ nổ: không gây dame nhưng Câm Lặng địch 2s & đóng băng trụ/drone/robot/bẫy/xe... của địch 2s (đứng im, không bắn, không di chuyển). Trúng EMP vào CHỦ -> TOÀN BỘ vật triệu hồi của chủ cũng bị đóng băng. FULL EVO (Lõi Tứ Quá Tải): +4 thanh phụ (5 thanh nạp đồng thời), vụ nổ & vòng EMP to hơn hẳn.', cost: 300, type: 'evo' }
    ],
    smg: [
        { id: 'evo_smg_1', name: 'Hỏa Lực +++', desc: 'Sấy càng lâu: Dame tăng (tối đa +0.5), Tốc bắn tăng gấp đôi, Đạn bay nhanh. Băng 22 viên, dame gốc ×0.9.', cost: 130, type: 'evo' },
        { id: 'evo_smg_2', name: 'Băng Đạn X', desc: 'Băng 30 viên, nạp băng 1.2s. FULL EVO: nạp 0.8s, 6 viên đầu mỗi băng xuyên thấu.', cost: 240, type: 'evo' }
    ],
    lazer_charge: [
        { id: 'evo_lazer_c_1', name: 'Pháo Diệt Tinh', desc: 'Tia Xuyên Phá to gấp 3, lưu ảnh 2s', cost: 460, type: 'evo' },
        { id: 'evo_lazer_c_2', name: 'Năng Lượng Xanh', desc: 'Tự Nạp nhanh hơn (4s), đạn thường nạp 0.4s/viên. FULL EVO: Tự Nạp 3.5s, Tia Xuyên Phá HẠ GỤC NGAY bất kể máu & xuyên khiên.', cost: 180, type: 'evo' }
    ],
    lazer_auto: [
        { id: 'evo_lazer_a_1', name: 'Xuyên Phá', desc: 'Laser bay cực nhanh, nhịp bắn tối đa 0.13s/tia. FULL EVO: mỗi tia chỉ +7% Nhiệt, Quá Nhiệt chỉ 0.8s.', cost: 120, type: 'evo' },
        { id: 'evo_lazer_a_2', name: 'Phá Hủy', desc: 'Dame ×1.5, laser to hơn, Nóng Đỏ từ 50% Nhiệt.', cost: 230, type: 'evo' }
    ],
    rocket: [
        { id: 'evo_rocket_1', name: 'Đầu Đạn Hạt Nhân', desc: 'Vùng nổ siêu rộng + Phóng xạ', cost: 380, type: 'evo' },
        { id: 'evo_rocket_2', name: 'Đầu Đạn Lớn', desc: 'Tăng dame nổ + Phạm vi', cost: 150, type: 'evo' }
    ],
    portal: [
        { id: 'evo_portal_1', name: 'Cổng Cường Hóa', desc: 'Dịch chuyển nhận đạn nổ. Tự mở Cổng Bắn trên NỬA SÂN CỦA MÌNH (hồi chiêu 5s, tối đa 2 cổng cùng lúc). Mỗi cổng hiện tia ngắm rồi khoá hướng 0.4s trước mỗi phát (3 phát) -> địch có thể né. FULL EVO: tối đa 3 cổng.', cost: 240, type: 'evo' },
        { id: 'evo_portal_2', name: 'Cổng Gia Tốc', desc: 'Dịch chuyển hồi đầy đạn + Tốc', cost: 130, type: 'evo' }
    ],
    wind_slash: [
        { id: 'evo_wind_1', name: 'Cuồng Phong Tích Tụ', desc: 'Mỗi phát bắn thứ 5 -> Tự động Full Lực', cost: 290, type: 'evo' },
        { id: 'evo_wind_2', name: 'Nghịch Phong', desc: 'Chém vào đạn địch -> Phản lại về phía địch', cost: 170, type: 'evo' }
    ],
    storm: [
        { id: 'evo_storm_1', name: 'Mắt Bão', desc: 'Tụ >50% + Khiên: Xóa đạn quanh người. Nhát chém chẻ lốc hút địch. Tụ 100%: +2 Khiên.', cost: 180, type: 'evo' },
        { id: 'evo_storm_2', name: 'Phong Ảnh Trảm', desc: 'Mỗi 3-8s Phân Thân lao lên chém, cuối đường lao để lại Cơn Lốc Nhỏ (0.3 dame, chậm 25%). Lôi Bão + Khiên: chém bồi nhát 2 (+50%). Full Evo: tụ 2.5s, Phân Thân 3-5s.', cost: 340, type: 'evo' }
    ],
    acid: [
        { id: 'evo_acid_1', name: 'Bào Mòn', desc: 'Vùng Ăn Mòn rộng hơn & tồn tại lâu hơn, tốc độ rút HP / Max HP gấp đôi.', cost: 150, type: 'evo' },
        { id: 'evo_acid_2', name: 'Độc Hại', desc: 'Ngưỡng kết liễu tăng lên 2 Max HP.', cost: 280, type: 'evo' }
    ],

    engineer: [
        { id: 'evo_eng_1', name: 'Cải Tiến Hệ Thống', desc: 'Ụ súng thường VIP (75% chỉ số). Ụ súng thông minh VIP tối đa 3 cái, đạn Xuyên. Tương tác Mạng LAN.', cost: 180, type: 'evo' },
        { id: 'evo_eng_2', name: 'Quá Tải / Mạng LAN', desc: 'Vòng Mạng LAN hồi máu & giúp ụ thường tự ngắm. Giữ bắn 2s bật Quá Tải 600s (-1 Max HP, Ụ thông minh bắn Raycast mỗi 2s). Hết quá tải câm lặng 1s & chậm 5s (CD 8s).', cost: 350, type: 'evo' }
    ],
    ghost: [
        { id: 'evo_ghost_1', name: 'Bóng Mờ', desc: 'Vô ảnh: 2s (Hồi 1s). Đạn tàng hình khi buff. Đạn chớp tắt giữa map.', cost: 130, type: 'evo' },
        { id: 'evo_ghost_2', name: 'Ảo Ảnh', desc: 'Chu kỳ Vô ảnh nhanh hơn. Mỗi 12s triệu hồi Hư Ảnh bắn phụ.', cost: 250, type: 'evo' }
    ],
    aaa: [
        { id: 'evo_aaa_1', name: 'Nhắm Đánh Dấu', desc: 'Pháo kích tự ghim mục tiêu. Tự bắn thường: 3 tia liên tiếp. FULL EVO: pháo kích KHÔNG tự đuổi nữa nhưng rơi thêm 2 quả phụ 2 bên mục tiêu.', cost: 175, type: 'evo' },
        { id: 'evo_aaa_2', name: 'Mưa Tên Lửa', desc: 'Tự bắn -> Rơi 3 bom ngẫu nhiên trên làn địch. Pháo kích nổ bồi 1 lần tại chỗ (có cảnh báo, 50% dame). FULL EVO: nổ bồi 2 lần, nổ nhanh hơn (0.8s), không tự đuổi, +2 quả phụ quanh mục tiêu.', cost: 330, type: 'evo' }
    ],
    blade_god: [
        { id: 'evo_blade_1', name: 'Kiếm Thế Vô Chủ', desc: 'Quang Kiếm tự rải ngẫu nhiên trên sân. Nội tại Quang Kiếm Loạn Ảnh: mỗi 10s 1 Quang Kiếm VIP bay quanh xe 3s, lao tới chém tan mọi loại đạn bay. Full Evo: Quang & Ám Kiếm tự xuất hiện, lơ lửng 2s rồi tự phóng; 2 nội tại mạnh hơn.', cost: 205, type: 'evo' },
        { id: 'evo_blade_2', name: 'Kiếm Thể Phòng Hộ', desc: 'Ám Kiếm tạo hố đen nhỏ hút nhẹ về tâm. Nội tại Ám Kiếm Tuyệt Diệt: mỗi 15s (Full Evo 12s) 4 kiếm (Full 6) cảnh báo 0.75s rơi xuống địch; sau ~3s 1 Ám Kiếm khổng lồ cảnh báo 1.5s rồi giáng, cắm 2s hút nhẹ + gây sát thương nhỏ.', cost: 380, type: 'evo' }
    ],
    van_kiem: [
        { id: 'evo_vk_1', name: 'Mưa Kiếm', desc: 'Tự động gọi kiếm ngẫu nhiên sau lưng. Gọi càng nhanh khi đã bắn nhiều kiếm.', cost: 230, type: 'evo' },
        { id: 'evo_vk_2', name: 'Kiếm Thế Hoàn Chỉnh', desc: 'Trong Kiếm Thế: Có thể di chuyển siêu chậm, đạn xuyên thấu. Nhả nút phóng Đại Kiếm.', cost: 400, type: 'evo' }
    ],
    water_gun: [
        { id: 'evo_water_1', name: 'Vòi Rồng', desc: 'Giữ bắn: sau phát Laser nước mở màn (to, mạnh) -> Vòi Rồng phun liên tục như tia laser (hitscan dọc cột, 0.125 dame/0.1s, 2%/0.1s nội năng; cột tia trễ theo nòng nên né được, tường Sniper chặn), vừa đi vừa phun chậm. Nghỉ bắn hồi nội năng nhanh (15%/s).', cost: 165, type: 'evo' },
        { id: 'evo_water_2', name: 'Vòi Cao Áp', desc: 'Tự hồi nội năng (0.5%/s) kể cả khi đang bắn. Đạn & tia Vòi Rồng làm chậm và xuyên thấu.', cost: 290, type: 'evo' }
    ],
    furnace: [
        { id: 'evo_furnace_1', name: 'Nhiệt Năng', desc: 'Giữ bắn 1s -> Bắn tia lửa liên tục, hao năng lượng cực nhanh.', cost: 170, type: 'evo' },
        { id: 'evo_furnace_2', name: 'Tích Tụ', desc: 'Đốt kéo dài 6s. Cứ tiêu hao 30% nội năng -> Đạn kế tiếp gây nổ tạo Vùng Lửa.', cost: 310, type: 'evo' }
    ],
    am_duong_su: [
        { id: 'evo_ads_1', name: 'Pháp Chú', desc: 'Nổ/Choáng rộng và lâu hơn. Bùa tồn tại lâu hơn.', cost: 160, type: 'evo' },
        { id: 'evo_ads_2', name: 'Pháp Trận', desc: 'Bùa kết hợp nổ để lại Pháp Trận sát thương liên tục.', cost: 280, type: 'evo' }
    ],
    six_barrel: [
        { id: 'evo_six_1', name: 'Bão Đạn', desc: 'Nhiệt >50%: Bắn 2 viên. Nhiệt >75%: Bắn 3 viên.', cost: 160, type: 'evo' },
        { id: 'evo_six_2', name: 'Quá Nhiệt', desc: 'Nhiệt >50% đã gây Đốt. Hạ nhiệt cực nhanh khi <50%. Lâu quá tải hơn. Nhược điểm: Quá tải trừ 5 Max HP.', cost: 290, type: 'evo' }
    ],
    the_strongest: [
        { id: 'evo_strongest_1', name: 'Hư Thức: Tử (Tím)', type: 'evo', desc: 'Đã dùng cả Xanh & Đỏ: lần ra chiêu kế tiếp còn >= 60% Chú Lực tung HƯ THỨC: TỬ (tụ 0.75s có cột cảnh báo + thông báo, xuyên thấu 2.9 dame, nổ tường 3.9 bán kính lớn). Giữ 5s: Bành Trướng Lãnh Địa Vô Lượng Không Xứ (75% CL) — 5s địch câm lặng & chậm 50% (choáng 1s đầu); bạn đứng yên niệm 4s, 1s cuối mới di chuyển / ra chiêu.', cost: 480 },
        { id: 'evo_strongest_2', name: 'Lục Nhãn (Mắt Xanh)', type: 'evo', desc: 'Tăng max & hồi Chú lực. Nhấp: Đạn Xanh hút địch. Giữ: Tia Đỏ choáng.', cost: 240 }
    ],
    // THÊM TIẾN HÓA SNIPER VÀO ĐÂY:
    sniper: [
        { id: 'evo_sniper_1', name: 'Tường Thép', type: 'evo', desc: 'Tường HP x5. Đạn Sniper đi qua tường phe mình KHÔNG bị giảm sát thương. Full Evo: tường dài & cứng hơn (HP x7), không tự mục, bất tử 2s đầu, đạn phe mình không làm hại tường.', cost: 165 },
        { id: 'evo_sniper_2', name: 'Xuyên Thủng', type: 'evo', desc: '25% đạn thành tia Raycast (chạm tường/chướng ngại vật sẽ thành đạn thường).', cost: 300 }
    ],
    cung: [
        { id: 'evo_cung_1', name: 'Cung Thần', desc: 'Tụ Lực kéo nhanh hơn & nhịp nhanh hơn, căng tối đa thì Xuyên Thủng. Liên Hoàn: loạt 7 mũi. Bắn 3 Mũi -> 5 mũi tỏa.', cost: 135, type: 'evo' },
        { id: 'evo_cung_2', name: 'Mưa Tên', desc: 'Thiên Tiễn kéo theo trận Mưa Tên trút xuống hồng tâm 1.5s. Hồi Ngắm 7s. FULL EVO (Vạn Tiễn): Mưa Tên phủ KHẮP sân mỗi 12s — điểm cảnh báo rải toàn bản đồ, nhiều mũi trên làn địch (số mũi tăng theo dame), Ngắm hồi 5s, Nhạy Bén hồi 5s.', cost: 260, type: 'evo' }
    ],
    mirror: [
        { id: 'evo_mirror_1', name: 'Tái Lập', desc: 'CD Đổi còn 3s. Sau khi đổi: Tăng Tốc, Dame và Bất tử 0.5s.', cost: 160, type: 'evo' },
        { id: 'evo_mirror_2', name: 'Hình Chiếu', desc: 'Tạo Ảnh chiếu cho địch. Đánh vào Ảnh chiếu địch chịu 50% dame.', cost: 280, type: 'evo' }
    ],
    sukuna: [
        { id: 'evo_sukuna_1', name: 'Hỏa Mũi Tên (Fuga)', desc: 'Bấm khi Chú Lực >= 60 để nạp Fuga (vòng lửa cam, trúng đòn không bị ngắt), giữ 1.5s rồi nhả: phóng mũi tên lửa 2.1 dame, tốn 60 Chú Lực. Full Evo: giữ 5s mở Lãnh Địa (50 CL); đã mở Lãnh Địa + phóng >= 2 Fuga trong hiệp -> giữ 8s khoá mục tiêu, 9s Nhát Chém Thế Giới kết liễu (1 lần/hiệp, trúng đòn là ngắt).', cost: 450, type: 'evo' },
        { id: 'evo_sukuna_2', name: 'Phách Diện Rộng', desc: 'Nhát chém to gấp đôi (7 CL/nhát), có thể triệt tiêu đạn thường của kẻ địch.', cost: 230, type: 'evo' }
    ],
    paradox: [
        { id: 'evo_paradox_1', name: 'Dấu Ấn Thời Gian', type: 'evo', desc: 'Bắn trúng địch tích ấn (Max 3). Đủ ấn tạo Bóng Đứng Yên + Choáng. Kích hoạt tua ngược kéo địch về Bóng Đứng.', cost: 185 },
        { id: 'evo_paradox_2', name: 'Nghịch Đảo', type: 'evo', desc: 'Hồi chiêu Tua Ngược còn 5.5s; bóng 3s tái hiện phát bắn 60% dame; Dư Âm 50% dame. Kéo địch về gây Làm Chậm. Đủ 2 Evo: Kéo địch về Bóng 5s (Choáng 0.5s) hoặc Bóng Đứng (Choáng 1.5s, 2 hit tạo bóng). Đủ 2 Evo: Vết Nứt Thời Gian bắn 60% dame (gốc 35%), bóng tái hiện 100% dame, Dư Âm 60% dame.', cost: 340 }
    ],
    magician: [
        { id: 'evo_mag_1', name: 'Hoán Đổi Chủ Động', type: 'evo', desc: 'Bản thể & phân ảnh phóng 3 lá bài nối đuôi theo trục dọc (mỗi lá 50% dame). Giữ bắn 1s: Tàng hình & Đổi vị trí với Phân ảnh (+1 Khiên, dùng chung hồi chiêu 10s với Phân Ảnh). Đổi với bóng Đứng: Bóng tự đi. Đổi bóng Đi: Cả hai tăng tốc. Đủ 2 Evo: Thoát Chết 2 lần/hiệp.', cost: 185 },
        { id: 'evo_mag_2', name: 'Loạn Ảnh & Suy Yếu', type: 'evo', desc: 'Đầu hiệp tạo 1 Ảo Ảnh Hoàn Hảo (50% máu & dame, tự đi, tự phóng bài, đôi khi đứng im giả dạng; bị phá hồi sinh sau 30s). Bắn trúng +1, Địch phá bóng +3 stack Suy Yếu (Nhận thêm dame). Đủ 3 stack: Địch bị Slow. Đạn trúng địch gây Loạn Phím. Đủ 2 Evo: 2 Ảo Ảnh Hoàn Hảo (hồi sinh 20s), Thoát Chết 2 lần/hiệp.', cost: 350 }
    ],
    inventor: [
        { id: 'evo_inv_1', name: 'Cải Tiến Và Tiến Hóa', desc: 'Drone nhận 75% chỉ số. Drone hồi sinh nhanh. Thắng +6 LK, Crate +2 LK, Xe tiền +3 LK.', cost: 170, type: 'evo' },
        { id: 'evo_inv_2', name: 'Bản Thiết Kế ++', desc: 'Có 2 Drone. Hồi sinh 8s. Mở khóa Tụ Gió & Khiên Drone trong Chợ LK.', cost: 320, type: 'evo' }
    ],
    shadow_hunter: [
        { id: 'evo_sh_1', name: 'Bóng Mờ', desc: 'Đòn cường hóa xuyên thấu. Gây Mù HUD điều khiển đối thủ trong 1.5s.', cost: 140, type: 'evo' },
        { id: 'evo_sh_2', name: 'Phục Kích', desc: 'Vào Vô Hình: Nạp đầy đạn, +60% tốc, +100% dame. Đạn câm lặng 1.5s. Rải 2 cạm bẫy bóng đêm.', cost: 260, type: 'evo' }
    ],
    shortgunATK: [
        { id: 'evo_sg_1', name: 'Dragon Strike', desc: 'Đạn gây Đốt 2 tầng. Vùng nón cảnh báo để lại Vùng Biển Lửa (FireZone) 3s.', cost: 140, type: 'evo' },
        { id: 'evo_sg_2', name: 'Tàn Phá', desc: 'Tiêu diệt mục tiêu biến xác thành đạn pháo quán tính văng thẳng phía trước nổ AoE.', cost: 270, type: 'evo' }
    ],
    thunder: [
        { id: 'evo_thun_1', name: 'Phá Sấm', desc: 'Nổ tường & Lôi Trảm gây Choáng 0.5s (1 lần mỗi chuỗi); càng gom nhiều thương, nhát Lôi Trảm chính càng to & mạnh (tối đa x1.3); nhát chém cuối Lôi Độn gây Choáng 0.33s. Full Evo: Thiên Lôi Giáng để lại Lôi Vực & sét trời ngẫu nhiên (báo trước 1.5s, vùng nhỏ) đánh nửa sân địch mỗi 5.5-8s.', cost: 185, type: 'evo' },
        { id: 'evo_thun_2', name: 'Rẽ Mây', desc: 'Mỗi nhát Lôi Trảm, mọi cây thương còn lại trên sân chém phụ (cảnh báo 0.67s, 40% sát thương). Thiên Kiếp kéo dài 8s & 3 lần miễn nhiễm sát thương. Full Evo: chém phụ 70% sát thương nhát chính.', cost: 350, type: 'evo' }
    ],
    magnet: [
        { id: 'evo_mag_net_1', name: 'Từ Trường Tăng Cường', desc: 'Giật điện từ trường gây 0.5 dame (x2); Lướt Cực Tính: húc 1.5 dame, nổ cột 2 dame, va chạm giữa sân 2 dame.', cost: 160, type: 'evo' },
        { id: 'evo_mag_net_2', name: 'Lưới Từ Cực', desc: 'Tối đa 3 Cột Từ Trường, lực hút/đẩy x1.5, Ấn Từ kéo dài 8s. FULL EVO: 4 cột, bán kính từ trường & vùng Ấn Từ lớn hơn, nổ va chạm to hơn, đảo cực giật kẻ địch lại gần.', cost: 290, type: 'evo' }
    ],
    evolution: [
        { id: 'evo_evo_1', name: 'Mưa Tiến Hóa', desc: 'Tăng mạnh tỉ lệ rương; Chỉ số nhận từ thùng đồ tăng +30%.', cost: 190, type: 'evo' },
        { id: 'evo_evo_2', name: 'Dị Thể Cộng Hưởng', desc: 'Mảnh văng Mimic x2 số lượng & gây 100% Dame của xe.', cost: 380, type: 'evo' }
    ],
    death_lock: [
        { id: 'evo_dl_1', name: 'Trói', desc: 'Thời gian duy trì ấn Ràng Buộc tăng từ 5s lên 8s (Full Evo: 12s).', cost: 165, type: 'evo' },
        { id: 'evo_dl_2', name: 'Quản Chế', desc: 'Lực kéo tâm xích mạnh & xa hơn; Chiều rộng Lồng thu hẹp còn 140px (Full: 100px).', cost: 290, type: 'evo' }
    ],
    creator: [
        { id: 'evo_cr_1', name: 'Sản Phẩm Mới', desc: 'Ụ súng và Khiên thép nhận 100% chỉ số (Ụ súng x2 dame, Khiên 10 HP).', cost: 185, type: 'evo' },
        { id: 'evo_cr_2', name: 'Robot Tự Động', desc: 'Sau 10s xuất xưởng Robot Chiến Đấu (36x36, 10 HP, SMG/Rocket/Dash, Hồi sinh 30s).', cost: 350, type: 'evo' }
    ],
    necromancer: [
        { id: 'evo_necro_1', name: 'Linh Thể', desc: 'Tốc độ hồi Linh Hồn nhanh hơn (3 Linh Hồn mỗi 3s).', cost: 180, type: 'evo' },
        { id: 'evo_necro_2', name: 'Thống Trị', desc: '+4 Linh Hồn tối đa. Quái triệu hồi nhận nội tại bổ sung (Cảm Tử +50% bán kính nổ; Xạ Thủ bắn đạn Xuyên; Cao Cấp có khiên đỡ 3 đòn).', cost: 340, type: 'evo' }
    ],
    genius: [
        { id: 'evo_gen_1', name: 'Tối Ưu Hóa', desc: 'Giảm tiêu hao Bánh Răng vào Mecha còn 6 BR; Kỹ năng giảm 1 NL; Hoàn lại 4 BR khi Mecha vỡ; Hồi 2 NL/s khi không dùng kỹ năng 2s.', cost: 180, type: 'evo' },
        { id: 'evo_gen_2', name: 'Vũ Trang Hóa', desc: 'Bắn thường Mecha có Xuyên Thấu. Trang bị 4 module tự động (Bắn phụ 3s, Radar AAA 8s, Chấn Động 10s, Pháo Thủy Lực 8 NL).', cost: 340, type: 'evo' }
    ],
    kiem_khach: [
        { id: 'evo_kk_1', name: 'Lấy Tâm Luyện Kiếm', desc: 'Giảm 50% yêu cầu của mọi bài tập. Tập Trung khi mất khiên kéo dài 5s (thay vì 3s).', cost: 180, type: 'evo' },
        { id: 'evo_kk_2', name: 'Thí Luyện', desc: '+1 ô bài tập làm cùng lúc. Đầu mỗi hiệp nhận sẵn 1 Khiên. FULL EVO: +2 ô bài tập, yêu cầu giảm sâu, mở 5 Bài Tập Cuối -> Hóa Thần.', cost: 360, type: 'evo' }
    ],
    sprayer: [
        { id: 'evo_spray_1', name: 'Năng Lượng Xanh', desc: 'Hồi năng lượng nhanh hơn 50%, phun tiêu hao chậm hơn ~26%.', cost: 160, type: 'evo' },
        { id: 'evo_spray_2', name: 'Dấu Vết Độc Địa', desc: 'Lớp phủ bám lâu hơn. Phun liên tục để lại vũng Lửa/Axit/Băng 3s. FULL EVO: phun cùng lúc cả 3 chất, góc phun rộng hơn, phun lâu hơn; Nổ 7 dmg lan, Axit ăn mòn x2 & câm thêm 1s, Đóng băng 2.5s.', cost: 300, type: 'evo' }
    ],
    customize: [
        { id: 'evo_cu_1', name: 'Gói VIP', desc: 'Mọi mô-đun đã lắp lên +1 cấp ngay, +2 Điểm Tùy Chỉnh, cấp tối đa +1. Mở mô-đun VIP: Tự Ngắm, Đạn Hút (kéo & làm chậm), Nảy Tường (bắn chéo, +dame mỗi lần nảy).', cost: 175, type: 'evo' },
        { id: 'evo_cu_2', name: 'Cá Nhân Hóa', desc: 'Nổ, Vũng, Hút Máu, Đạn Hút, Nảy Tường, Tiến Công mạnh hơn 30%. +1 Điểm Tùy Chỉnh mỗi hiệp. FULL EVO: chọn miễn phí 1 Nội Tại Độc Quyền (Hồi Sinh, Vô Ảnh, Tập Trung, Phản Lực).', cost: 340, type: 'evo' }
    ],
    kiem_su: [
        { id: 'evo_ks_1', name: 'Điều Tức Chuyển Khí', desc: 'Cường hóa mọi nguyên tố. Giữ Bắn 0.25s: đổi chỗ viên đạn hiện tại và viên kế tiếp (trùng màu thì tự đổi màu).', cost: 165, type: 'evo' },
        { id: 'evo_ks_2', name: 'Ngũ Hành Giao Thoa', desc: '2 phi kiếm liên tiếp tạo phản ứng: Đồng nguyên tố / Tương sinh / Tương khắc (15 phản ứng). FULL EVO: mỗi phát kèm 2 kiếm hộ tống, phản ứng mạnh hơn.', cost: 300, type: 'evo' }
    ],
    revolver: [
        { id: 'evo_rev_1', name: 'Đạn Độc Đắc', desc: 'Viên 1-5 có 50% Nổ khi trúng đích. Viên thứ 6 luôn Nổ lớn và gây Choáng.', cost: 140, type: 'evo' },
        { id: 'evo_rev_2', name: 'Rút Súng Thần Tốc', desc: 'Nạp ổ còn 0.9s. Bắn điểm xạ trúng 6/6 -> hồi đầy ổ ngay + 1 dame cho ổ kế tiếp. Quạt Cò trúng >= 50% -> hồi đầy ổ. FULL EVO: Ổ Đạn Ngũ Sắc (viên 1-2 Chậm, 3-4 Chảy Máu, 5 Choáng 0.3s, 6 Chí Mạng x2.5), nạp nhanh hơn nữa, Quạt Cò Song Lục (gấp đôi đạn) & mọi đạn quạt đều Xuyên Thấu.', cost: 260, type: 'evo' }
    ],
    dj: [
        { id: 'evo_dj_1', name: 'Cảm Âm Dung Sai', desc: 'Được bấm sai / lỡ nhịp tối đa 3 lần mới mất chuỗi Combo. Hồi lại đủ 3 lượt bảo hộ sau mỗi 30 Combo.', cost: 160, type: 'evo' },
        { id: 'evo_dj_2', name: 'Giai Điệu Thăng Hoa', desc: 'Sóng Âm mở khóa theo Combo: 15 Xuyên Thấu, 30 Phát Nổ, 60 để lại Vùng Âm Nhiệt (thiêu đốt + làm chậm), 120 hóa tia Hitscan. FULL EVO: vào hiệp sẵn 30 Combo, bấm chuẩn Combo x2, buff mạnh hơn; sai 6 lần, lần thứ 6 tự đánh chuẩn; 2 Loa nổi bắn sóng phụ mỗi nhịp; mở Bản Nhạc Huyền Thoại (rất nhanh, dày đặc Nốt Đôi - thử thách cực hạn).', cost: 310, type: 'evo' }
    ],
    steel_hook: [
        { id: 'evo_hook_1', name: 'Tời Thủy Lực', desc: 'Đu dây & kéo nhanh hơn. Tụ lực tối đa 15 lần nảy (mạng nhện xích kín bản đồ).', cost: 180, type: 'evo' },
        { id: 'evo_hook_2', name: 'Quặp Sắt Trọng Lực', desc: 'Đầu móc to gấp rưỡi. Va đập khi kéo địch x2 (+2 dame/vật thể). Mỗi 7s móc phụ tự quặp Xe Tiền/vật thể trên sân rồi ném thẳng vào địch gây nổ lớn. FULL EVO: x2 Máu tối đa, đầu móc máu 100%, tối đa 17 lần nảy, mỗi lần phóng 3 móc cùng lúc (2 móc phụ chỉ có 25% máu, dễ bắn đứt hơn).', cost: 330, type: 'evo' }
    ],
    flower_shadow: [
        { id: 'evo_flw_1', name: 'Hoa Ảnh Song Hành', desc: 'Thanh Hoa hồi nhanh hơn mạnh. Tối đa 24 cánh Khai trên sân. Kho Hoa mở rộng 200% (phần trên 100% chỉ nạp được bằng thu hồi cánh hoa). Bách Hoa Nở Rộ chỉ cần tiêu hao 50% Hoa. 1 Bóng Hoa đi theo đường cũ của bạn, lặp lại Vũ Điệu bạn vừa múa sau 3 giây.', cost: 175, type: 'evo' },
        { id: 'evo_flw_2', name: 'Hương Sắc Tuyệt Trần', desc: 'Khai: cánh hoa nằm nghỉ tỏa phấn làm chậm. Phá: chém nát đạn thường của địch trên đường lướt. Thiên: hút & làm chậm mạnh hơn, +1 dame. FULL EVO: không giới hạn cánh Khai, cánh nằm nghỉ 2s rồi thu về, Kho Hoa tự hồi tới 200% và thu hồi cánh nạp được tới 300%, cánh bay ra xuyên vật cản (lượt thu về vẫn bị chặn), Bách Hoa Nở Rộ trọn vẹn (Khai 5 cánh x1.5, Phá 2 bản sao, Ngôi Sao Trảm 2s); hoa rơi khắp màn hình, định kỳ hoa tự ngắm lao vào địch, mọi Vũ Điệu mạnh hơn, thêm Bóng Hoa thứ hai trễ 5s.', cost: 320, type: 'evo' }
    ],
    kiem_vu: [
        { id: 'evo_kv_1', name: 'Tâm Nhãn', desc: 'Tâm Định đầy nhanh hơn (0.8s, vẫn chờ 1.25s sau khi dùng kỹ năng), +50% Sát Ý mỗi lần phản đạn. Bản Mệnh Kiếm cắm trên sân địch tỏa kiếm khí làm chậm đối thủ đi ngang qua.', cost: 175, type: 'evo' },
        { id: 'evo_kv_2', name: 'Lưu Thủy Phản Chiếu', desc: 'Tập Trung kéo dài 1.0s. Đạn phản bay thẳng chuẩn xác về phía địch. Vẫn điều khiển Bản Mệnh Kiếm khi đang Tập Trung. FULL EVO (Vạn Kiếm Quy Tâm): kiếm bay nhanh hơn, dame x1.15 + Chảy Máu; đi ngang chậm khi Tập Trung; mỗi 5 lần Điều Kiếm, lần kế tiếp triệu hồi 4 Kiếm Phụ tấn công rồi tự thu về.', cost: 320, type: 'evo' }
    ],
    t_zero: [
        { id: 'evo_tzero_1', name: 'Năng Lượng Xanh', desc: 'Hồi NL nhanh hơn mạnh (sau 1s nghỉ). Giảm mọi tiêu hao: Ném khiên 3%, Phản đạn 10% + dame×7%, Đấm 7%, Bay lên 18% và duy trì 6%/s (vẫn gấp đôi mỗi 2.5s bay).', cost: 175, type: 'evo' },
        { id: 'evo_tzero_2', name: 'Trạng Thái Hủy Diệt', desc: 'THỦ: khiên to & nhanh hơn, để lại vệt điện làm chậm. CÔNG: cú đấm tạo sóng xung kích nổ lan phía trước & phá đạn địch trên đường lao. THIÊN: dội pháo dày hơn, đáp xuống để lại vùng từ trường đốt máu & hút địch. FULL EVO: định kỳ phóng tên lửa tầm nhiệt bay RẤT chậm, rẽ nhẹ (né được; đạn địch bắn hạ được) và tên lửa KHÔNG KÍCH vút lên trời, hiện ra ở cạnh trái/phải mục tiêu rồi bay chậm dọc làn tới vòng cảnh báo (2s, thấy rõ đường bay) mới cắm xuống; THỦ: khi khiên đang bay tự xả Tiểu Liên (1% NL/s).', cost: 320, type: 'evo' }
    ],
    raven_oca: [
        { id: 'evo_raven_1', name: 'Chiến Thuật Đặc Nhiệm', desc: 'Đạn Răng Cưa: mọi viên đạn (cả 2 súng) gây Chảy Máu. Khói Đặc Quánh: Bom Khói +2s (4s). Bộ Pháp Xung Kích: cầm Tiểu Liên tăng mạnh tốc độ. Thay Đạn Tức Thì: đổi súng là nạp đầy băng súng mới.', cost: 200, type: 'evo' },
        { id: 'evo_raven_2', name: 'Hỏa Lực Không Kích', desc: 'Oca máu 80% Raven & định kỳ hiện vòng cảnh báo đỏ ⚠ (ít nhất 1s) rồi thả Bom xuống địch. Tiểu Liên xả loạt 5 viên, băng 15. Sniper bay nhanh hơn, mạnh hơn & gây Trọng Thương: máu bị mất do Sniper không thể hồi trong 10s. FULL EVO: Oca Bất Tử (không bị tiêu diệt, không chặn đạn), đổi súng hồi 2s, Oca vừa lao cắn làm chậm vừa thả mưa bom liên hoàn vừa giữ khóa mục tiêu vĩnh viễn cho cả 2 súng (Tiểu Liên tự ngắm vào vị trí hiện tại, không đón đầu, hơi tản -> di chuyển là né được).', cost: 380, type: 'evo' }
    ],
    lazer_beam: [
        { id: 'evo_beam_1', name: 'Năng Lượng Xanh', desc: 'Tích tụ khởi động chỉ 0.125s. Chiếu tia tiêu hao chậm hơn, hồi Năng Lượng nhanh hơn.', cost: 115, type: 'evo' },
        { id: 'evo_beam_2', name: 'Khuếch Đại Nhiệt Quang', desc: 'Tia phình rộng dần khi chiếu lâu. Trúng liên tục -> sát thương tăng tiến (tới x2.5) & Thiêu Đốt. FULL EVO: Quá Tải Quang Học — không còn giảm tốc khi chiếu; mỗi 2s chiếu liên tục phóng thêm 1 Tia Bùng Nổ (1.5 dmg).', cost: 240, type: 'evo' }
    ],
    healer: [
        { id: 'evo_heal_1', name: 'Hồi Phục Vượt Ngưỡng', desc: 'Đầy máu: lượng hồi dư chuyển thành Giáp Trắng (tối đa 4 + 50% MaxHP), đỡ đòn trước máu. Đạn Cường Hóa mạnh hơn (65% MaxHP, nổ lan 30%).', cost: 165, type: 'evo' },
        { id: 'evo_heal_2', name: 'Nghịch Lý Y Đạo', desc: 'Mỗi lần được hồi máu (mọi nguồn, kể cả vào Giáp Trắng) phóng 1 Tia Xung tự ngắm gây dame = lượng vừa hồi. Giảm Năng Lượng cần cho Đạn Cường Hóa. FULL EVO: Bất Tử Y Thần — Tái Tạo nhanh gấp đôi (1.5s); đạn gắn ấn Kháng Hồi Phục 5s: địch hồi máu bị cướp sang bạn; Đạn Cường Hóa = 100% MaxHP + dame.', cost: 310, type: 'evo' }
    ],
    chrononeo: [
        { id: 'evo_cn_1', name: 'Bước Thời Gian', desc: 'Thời Khắc chỉ cần giữ thế 2.5s. Đổi Thế Hoàn Hảo: đổi thế trong 3s sau đòn Thời Khắc -> băng thế mới nạp đầy ngay; nếu đang có Ảnh Chiếu -> hoán đổi vị trí với nó.', cost: 210, type: 'evo' },
        { id: 'evo_cn_2', name: 'Dòng Chảy Hội Tụ', desc: 'Đầu hiệp +2 đạn Chrono / +3 đạn Neo; điểm Thời Đại từ thùng & xe tiền x2. Liên Xạ +2 viên, viên cuối nổ choáng 0.5s. Mưa Đạn bắn 2 đợt, Ảnh Chiếu 8s bắn đạn làm chậm. FULL EVO: Liên Hoa Thời Gian — băng tối đa ngay (7/14), đổi thế hồi 4s; Phân Thân Nghịch Đảo (AI cầm thế ngược trên làn bạn, đổi thế đồng bộ kèm hiệu ứng); cứ 2 lần Thời Khắc -> 2.5s bão đạn Liên Hoa rồi 3 cột đại pháo Nở Rộ (có cảnh báo, có khe để né).', cost: 400, type: 'evo' }
    ],
    gemini: [
        { id: 'evo_gem_1', name: 'Liên Kết Thần Kinh', desc: 'AI phối hợp: giữ giãn cách tránh nổ lan, bắn ép góc, ưu tiên chạy lại cứu bạn (bám vòng cứu). Chuyển Giao hồi chỉ 1.2s; thanh cứu không bị tụt khi rời vòng. Vòng cứu rộng +50%; lần cứu đầu tiên mỗi hiệp chỉ 1s và không tính nhân đôi.', cost: 190, type: 'evo' },
        { id: 'evo_gem_2', name: 'Đệ Quy Vô Tận', desc: 'Cả 2 xe tăng dần tốc chạy & tốc bắn theo thời gian giao tranh; mỗi hiệp đã qua cộng dồn +0.25 MaxHP, +6% dame, đạn to hơn (tối đa 8 tầng). Sau Chuyển Giao: 1s cả 2 xe +50% tốc chạy, x1.8 tốc bắn, x1.3 dame. FULL EVO: Siêu Trí Tuệ Song Hành — AI tối thượng (tự cân đối cứu / kết liễu); lần gục đầu tiên của mỗi xe tự khởi động lại, các lần sau thanh cứu tự tăng tới 99% (chạm là dậy); 0.5s sau Chuyển Giao đạn của xe bạn điều khiển tự khoá mục tiêu.', cost: 360, type: 'evo' }
    ],
    blood_lord: [
        { id: 'evo_bd_1', name: 'Huyết Ảnh Đào Thoát', desc: 'Tích Bể Máu nhanh hơn (x1.4). Khi nhận sát thương chí tử: hóa dơi dịch chuyển sang vị trí khác, Bất Tử 2s và hồi ngay 50% Bể Máu (1 lần/hiệp).', cost: 190, type: 'evo' },
        { id: 'evo_bd_2', name: 'Huyết Thể Cường Hóa', desc: '+4 Max HP (Bể Máu x2 theo). Kỹ năng mạnh hơn x1.25, chỉ tốn 0.5 HP. Tự hồi máu sau 6s với tỉ lệ 2.5 Bể Máu = 1 HP. FULL EVO: Huyết Tổ Bất Diệt — thêm +2 Max HP, kỹ năng x1.5, chỉ tốn 0.25 HP, tích Bể Máu x2 (kẻ địch hồi máu cũng nạp); Đào Thoát hồi 100% Bể Máu; tự hồi sau 4s (2 Bể Máu = 1 HP); Đại Tiệc Máu không khóa tích Bể Máu sau khi tan; HỒI SINH tại chỗ 1 lần/trận khi chết lúc Bể Máu đầy.', cost: 360, type: 'evo' }
    ],
    berserker: [
        { id: 'evo_bers_1', name: 'Khát Máu Cực Hạn', desc: 'Cuồng Chiến mạnh x1.5 (giảm st nhận tối đa 45%). Tích Huyết Chiến nhanh hơn 25%. Vừa vào Huyết Chiến: thanh giữ nguyên 100 (không tụt, không bị trừ) trong 1s đầu. Tản nhiệt nhanh hơn 25% sau khi ngừng bắn.', cost: 180, type: 'evo' },
        { id: 'evo_bers_2', name: 'Đấu Trường Huyết Địa', desc: 'Khi Huyết Chiến: dựng 2 bức tường biên (vùng 260px quanh xe). Cả 2 xe không thể đi/lướt ra ngoài; Cổng Không Gian không thể mở cổng hay xuyên ra ngoài. FULL EVO: Chiến Thần Bất Tử — Cuồng Chiến x1.8 (tối đa -50% st), giữ thanh 1.5s, vùng 220px & làm chậm địch 25%; TÀN HƠI CUỐI CÙNG: hết Huyết Chiến không chết mà còn 0.5 HP (tối đa 2 lần/hiệp), sau đó mỗi phát trúng chỉ +1 Huyết Chiến; tản nhiệt nhanh hơn 50% và QUÁ NHIỆT chỉ khoá 1.2s.', cost: 340, type: 'evo' }
    ],
    kazuki: [
        { id: 'evo_kaz_1', name: 'Vô Niệm Lưu Thủy', desc: 'Hồi Ý Niệm +10/s, mọi thức kiếm tốn ít hơn 25%. Kiếm Thế Quyết +2 Kiếm Ý. Nghịch Trảm hồi 10s, thủ thế 0.8s, đỡ hụt không bị khựng.', cost: 220, type: 'evo' },
        { id: 'evo_kaz_2', name: 'Bách Biến Kiếm Thế', desc: 'AA: lốc kiếm to gấp rưỡi & phản đạn nhỏ. AB: xuyên mọi vật cản & 100% Khiên. BA: để lại vệt kiếm 3s (Làm Chậm + Cấm Hồi Máu). BB: để lại 1 Hư Ảnh chém bồi 1 nhát nổ. Loạn Vũ Hư Ảnh: bản thân Bất Tử. FULL EVO (Vạn Cảnh Trảm Vực): vào hiệp sẵn 5 Kiếm Ý, Tốc 4.2; Loạn Vũ / Nghịch Trảm thành công mở Trảm Vực 4s quanh địch (sát thương liên tục, hút về tâm, cấm lướt/dịch chuyển).', cost: 450, type: 'evo' }
    ],
    tsukiyo: [
        { id: 'evo_tsu_1', name: 'Thích Ứng Sắc Bén', desc: 'Nội Năng tối đa 150, mọi kỹ năng tốn ít hơn 25%, đổi phong cách chỉ cần giữ 0.5s, Phi Tiêu ném trượt vẫn hồi +2 Nội Năng.', cost: 220, type: 'evo' },
        { id: 'evo_tsu_2', name: 'Nhẫn Đạo Hoàn Chỉnh', desc: 'Yêu cầu Nhẫn Đạo giảm 50% (1 cấp mỗi loại, bản thân Evo cũng tính 1 cấp), +1 Max HP, +0.25 Tốc, +25% Dame, Phi Tiêu trúng hồi +12 Nội Năng, mọi nhánh Nhẫn Đạo mạnh hơn. FULL EVO (Đỉnh Cao Nhẫn Giả): Nội Năng 200, thêm 1 bậc chỉ số; Phi Tiêu +40% tốc, xuyên 1 mục tiêu, trúng +15 / trượt +4; Kết Ấn 0.25s, Hỏa Cầu nhanh +35%, nổ rộng +30% & Vũng Lửa 2.5s; lướt nhanh +50%, chém vỡ đạn, Chảy Máu 3s & xuyên 50% Khiên; 9 nhánh Nhẫn Đạo lên bản Tuyệt Đỉnh.', cost: 480, type: 'evo' },
    ],
    joker: [
        { id: 'evo_joker_1', name: 'Gian Lận Tinh Vi', desc: 'Tay bài 10 lá, mỗi lần ném 2 lá liên tiếp (mỗi lá 0.6 dame). Joker hóa JOKER ĐỎ (nổ lớn + hồi +0.5 HP + choáng 0.5s) hoặc JOKER ĐEN (Câm Lặng 1s + vùng câm lặng 2s). 5 lần ném không ra Joker -> lần kế chắc chắn Joker. Tráo Bài rút thêm 2 lá & Tàng Hình 0.5s.', cost: 210, type: 'evo' },
        { id: 'evo_joker_2', name: 'Sao Chép Tuyệt Kỹ', desc: 'Xào bài chỉ 0.75s. Thoát Hiểm hồi lại sau 60s (mỗi Joker trúng -2s). Lá Bài A mạnh x1.25. WILDCARD COPY: Joker trúng địch -> chép Vai Trò Chính của body địch cho TOÀN BỘ tay bài nạp kế tiếp (cả Lá Rỗng nhận hiệu ứng chung; Joker kích hoạt cả 4 chất). ĐỐI ĐẦU (mỗi lá +4% Max HP địch): ♥ +0.5 HP & st theo % máu | ♦ +$10, chí mạng x1.5 xuyên khiên | ♣ nổ 2 lần, đẩy lùi + choáng 0.4s | ♠ chảy máu theo % Max HP & địch nhận +20% st 3s. KIỂM SOÁT (vùng làm chậm 35% 2.5s): ♥ +0.25 HP, vùng to +30% gây chảy máu | ♦ +$5, Khóa Chân 0.75s | ♣ vùng sát thương liên tục + EMP 1.5s (câm, xóa khiên) | ♠ vùng chậm 50% + Câm Lặng 2s. CƠ ĐỘNG (ném -> lướt nhẹ, +25% tốc 1s): ♥ +0.25 HP khi ném & giải Làm Chậm | ♦ đạn x2 tốc tự khóa mục tiêu, +$5, Tráo Bài -1s | ♣ để lại Phân Ảnh Bài 2s (máu = 25% máu hiện tại) tự ném bài rồi lao lên cảm tử | ♠ kèm 1 lá Bích phụ xuyên thấu, trúng +40% tốc 1.5s. SINH TỒN (ném -> giảm 25% st nhận 2s): ♥ +1 HP & 1 Khiên khi ném | ♦ +$5, giảm thêm 15% st 3s | ♣ địch bị cấm hồi máu & nhận khiên 3s | ♠ hút máu 100%, cướp 1 buff của địch & giải 1 hiệu ứng xấu. FULL EVO (Sòng Bạc Hoàng Gia): hiệu ứng lá bài, Lá Bài A & Sao Chép x1.5; xào bài 10% ra BỘ BÀI TOÀN JOKER; Tráo Bài 30% ra Joker; Thoát Hiểm tích tối đa 2 (hồi 45s); 5 lá Joker trúng xe địch (kể cả bị chặn, hiện tiến độ 0/5 trên HUD) -> PHÁN QUYẾT JOKER (hồi 25s): lá bài khổng lồ lật trên đầu địch nổ SHOWDOWN, rút ngay 50% máu hiện tại (bỏ qua bất tử/khiên), xóa Khiên & buff, +1 Thoát Hiểm (có thể vượt giới hạn, tối đa 3).', cost: 460, type: 'evo' },
    ],
    juggernaut: [
        { id: 'evo_jug_1', name: 'Kháng Thể Tuyệt Đối', desc: 'Giảm 25% sát thương theo thời gian (Đốt, Chảy Máu, Axit); không thể bị ăn mòn Max HP bởi Axit hay khóa máu bởi Trọng Thương. Mỗi lần kích hoạt MIỄN NHIỄM! nạp ngay 1 viên đạn.', cost: 175, type: 'evo' },
        { id: 'evo_jug_2', name: 'Gậy Ông Đập Lưng Ông', desc: 'Đạn Bá Khí lưu giữ khống chế đã hấp thụ (Chậm, Choáng, Đóng băng, Câm lặng, Kéo/Hút, Mù...) và trả ngược lên địch khi trúng. Giáp Phản Chấn giảm 60% st nhận. FULL EVO (Thần Chiến Bất Bại): +3 Max HP, tự tích 1 Bá Khí mỗi 3s, giảm DoT 50%, Đạn Bá Khí KHÔNG THỂ CẢN PHÁ (không bị xóa/phản, xuyên mọi tường/khiên).', cost: 320, type: 'evo' },
    ],
    cluster_gun: [
        { id: 'evo_frag_1', name: 'Vỡ Vụn', desc: 'GIA TỐC MẢNH VĂNG: sau khi đạn tách (Phân Mảnh tách hoặc Dễ Vỡ bị đạn địch bắn nổ), mọi mảnh đạn con bay nhanh hơn 50%.', cost: 150, type: 'evo' },
        { id: 'evo_frag_2', name: 'Phân Chia', desc: 'Phân Mảnh vỡ thành 5 mảnh, Dễ Vỡ phóng 12 mảnh. Mọi mảnh con nảy tường 2 lần. FULL EVO (Bão Mảnh Hủy Diệt): Phân Mảnh vỡ 8 mảnh, Dễ Vỡ nổ tung 360° phóng 36 mảnh càn quét khắp sân; mảnh con bay cực nhanh & nảy tường 4 lần.', cost: 340, type: 'evo' },
    ],
    clone: [
        { id: 'evo_clone_1', name: 'Nhân Bản Song Song', desc: 'CLONE HOÀN HẢO: đầu mỗi hiệp tự tạo 1 Clone Hoàn Hảo cùng kích thước, 100% Máu của bạn, Đạn 4, mỗi viên 50% dame; dùng chung AI né/tản/ngắm/bắn dồn của clone. Khi bạn nhận đòn chí mạng -> HỒI SINH vào vị trí Clone Hoàn Hảo (máu = máu còn lại của clone), clone đó biến mất. Còn Clone Hoàn Hảo -> nó gánh thay phản phệ Gánh Chịu của clone thường.', cost: 185, type: 'evo' },
        { id: 'evo_clone_2', name: 'Khuếch Đại Bản Sao', desc: 'Clone Thường có 50% Máu của bạn, mỗi viên 20% dame; AI clone lên cấp Cao Thủ. Miễn trừ phản phệ: 2 lần đầu có Clone bị tiêu diệt mỗi hiệp không gây sát thương Gánh Chịu. FULL EVO (Quân Đoàn Bất Tử): miễn 4 lần Gánh Chịu mỗi hiệp; 2 Clone Hoàn Hảo cùng lúc (hồi sinh tới 2 lần, mỗi viên 35% dame); Clone Thường có 60% Máu của bạn; AI clone phản xạ cấp Huyền Thoại.', cost: 350, type: 'evo' },
    ],
    jet_pilot: [
        { id: 'evo_pilot_1', name: 'Phi Đội Ánh Sao', desc: 'CƯỜNG HÓA TOÀN DIỆN: mọi hỏa lực của Hợp Nhất, Chân & Phi Ảnh +15% sát thương, AI bắn/pháo cối dày hơn, sóng Cất Cánh rộng hơn. VỆT LỬA THIÊU ĐỐT: bom của Phi Ảnh (oanh tạc định kỳ lẫn khi Hợp Nhất) để lại Vệt Lửa đốt máu theo thời gian.', cost: 195, type: 'evo' },
        { id: 'evo_pilot_2', name: 'AI Tự Hành', desc: 'HỎA LỰC TOÀN PHẦN: AI của cả Chân lẫn Phi Ảnh LUÔN bật kể cả khi bạn đang lái (pháo cối + tự nhắm + oanh tạc), Chân nạp đạn nhanh hơn. AI CHIẾN THUẬT: lái Phi Ảnh -> Chân tự lách né đạn; lái Chân -> Phi Ảnh tự bay ép góc sát sườn địch. FULL EVO (Bá Chủ Bầu Trời): +2 Max HP (10 HP), +25% sát thương, hồi Cất Cánh 15s / Hợp Nhất 30s, oanh tạc 3.5–5.5s/lần với bom dày hơn, thảm bom Hợp Nhất 7 quả.', cost: 360, type: 'evo' },
    ],
    tat_sat: [
        { id: 'evo_ts_1', name: 'Thuấn Kiếm Sát Ý', desc: 'Tụ đầy chỉ còn 3.5s. Khi đang tụ >= 50%: giảm 30% sát thương nhận vào. Chém trượt tướng địch ở Nhánh 2 hoặc 3 được hoàn 35% thanh tụ lực.', cost: 210, type: 'evo' },
        { id: 'evo_ts_2', name: 'Phá Vọng Đoạt Hồn', desc: 'Nhánh 1: vùng nổ xóa đạn thường & Làm Chậm 35% 2s. Nhánh 2: Phân Ảnh xuyên Thùng Tiếp Tế / Xe Tiền, Vùng 1 phá hủy vật triệu hồi, Vùng 2 hút nhẹ địch vào tâm. Nhánh 3: tia rộng 32px & Xuyên 100% Khiên. FULL EVO (Vô Thượng Nhất Kiếm): +1.5 Max HP, mỗi lần Chém Nát Màn Hình thành công hồi +1 HP, ngưỡng Nhánh 3 giảm còn 75%, Nhánh 3 trượt vẫn để lại 2 vùng cảnh báo (Choáng 2s + Nổ dame) tại cuối đường kiếm.', cost: 390, type: 'evo' },
    ],
    one_punch: [
        { id: 'evo_punch_1', name: 'Đấm Bồi Hai Tay', desc: 'Nạp đạn chỉ 1.5s. Trong 0.4s sau Đấm Thường, nhấp tiếp -> phóng thêm 4 luồng quyền phong nhỏ liên tiếp (tổng +1.2 st). Thú Vị tích +30% mỗi 1 dame nhận; hồi máu chỉ tốn 7% Thú Vị / 1 HP.', cost: 220, type: 'evo' },
        { id: 'evo_punch_2', name: 'Nhảy Liên Hoàn Nghiêm Túc', desc: 'Khi đang tụ Đấm Nghiêm Túc: bấm Trái/Phải -> bật nhảy ngang 120px, đường cảnh báo di chuyển theo. FULL EVO (DEATH PUNCH): giữ chỉ 0.5s, hồi 8s, Thú Vị +40% mỗi 1 dame; Thú Vị không giảm khi hồi máu (5s không bị đánh tự hồi +0.5 HP/s); Giáp Ảo tồn tại vĩnh viễn; khi tụ hút nhẹ địch về tâm đường cảnh báo; địch trúng tâm cú Đấm Nghiêm Túc mà máu <= 35% -> "DEATH (TỬ)" HẠ GỤC NGAY (xuyên Khiên & Bất tử tạm thời).', cost: 460, type: 'evo' },
    ],
    boomerang: [
        { id: 'evo_boom_1', name: 'Thuần Thục Đón Gió', desc: 'Đổi chiếc chỉ cần giữ 0.25s, ném xong tự chuyển sang chiếc còn trên tay. TRỌNG LUÂN: phạm vi bắt +25px (hút nhẹ vào tay); bắt trúng -> buff 3.5s (+30% tốc chạy & dame, hồi 0.25 HP); rơi mất chỉ hồi 4.5s. NGUYỆT LUÂN: bay nhanh hơn 35% (~1.1s một vòng elip), phạm vi bắt +25px, nửa đi trúng địch -> Làm Chậm 35% 1.5s.', cost: 160, type: 'evo' },
        { id: 'evo_boom_2', name: 'Cộng Hưởng Song Luân', desc: 'TRỌNG LUÂN đang xoay: Hút Nhẹ địch vào tâm & Xé Giáp (+15% st nhận). NGUYỆT LUÂN: ném cùng lúc 2 chiếc bay 2 elip đối xứng hai cánh (trượt cả cặp mới về tay sau 2s). ĐIỂM GIAO CẮT: Nguyệt Luân chạm Trọng Luân đang xoay -> Bão Kiếm Khí nổ 85px 1.35x dame, Choáng 0.75s, Trọng Luân xoay thêm 1s. FULL EVO (Vạn Luân Quy Tông): Trọng Luân & Nguyệt Luân bay về bẻ lái nhẹ về phía bạn, xoay 2.5s & phá mọi đạn nhỏ bay vào tâm xoay; buff bắt trúng cộng dồn 2 tầng (+50%) và cấp 1 Khiên Gió (hồi 6s); mỗi Điểm Giao Cắt bắn 6 lưỡi gió 360°.', cost: 300, type: 'evo' },
    ],
    arachnid: [
        { id: 'evo_spider_1', name: 'Tơ Trói Thần Kinh', desc: 'Chỉ cần 3 tầng Tơ Quấn là Hóa Kén. Tầng Tơ duy trì 8s. Địch đứng trên Vùng Tơ Nhện quá 2s liên tục -> +1 tầng. Phá Kén bằng Cú Vồ: địch bị Câm Lặng thêm 1.5s và nhiễm Kịch Độc (0.3 HP/s trong 3s).', cost: 145, type: 'evo' },
        { id: 'evo_spider_2', name: 'Ổ Nhện Phục Kích', desc: 'Băng đạn 4 viên. Mỗi Vùng Tơ Nhện xuất hiện hoặc khi địch bị Hóa Kén -> nở 2 Nhện Con (HP 0.5, bò chậm, bẻ lái ngang kém nên dễ né; cắn 0.2 st & làm mới thời gian tầng Tơ; tối đa 3 con). FULL EVO (Nữ Hoàng Nhện Độc): đầu hiệp rải sẵn 2 Vùng Tơ lớn bên sân địch; đứng trên tơ giảm 25% st nhận; Hóa Kén kéo dài 2.25s & xoá sạch Khiên; ngưỡng Xử Tử của Cú Vồ tăng lên 25% Max HP; địch chưa trong kén nhưng có >= 2 tầng Tơ -> Cú Vồ bẻ lái tìm mục tiêu và đóng kén ngay khi chạm.', cost: 270, type: 'evo' },
    ],
    psychokinesis: [
        { id: 'evo_psy_1', name: 'Tâm Ý Tương Thông', desc: 'Đạn Niệm Lực chỉ lơ lửng 0.3s, trong lúc lơ lửng tự khoá góc nhắm thẳng vào địch và +0.25 st. Bật Vùng Niệm Lực -> gọi sẵn 3 viên Đạn Niệm Lực của bản thân vào đám đạn bắt giữ. Khoá Tâm Tất Sát chỉ cần giữ 0.5s.', cost: 165, type: 'evo' },
        { id: 'evo_psy_2', name: 'Trường Lực Tuyệt Đối', desc: 'Vùng r=175, không còn giảm tốc chạy, hồi 8s, bắt tối đa 25 viên. Đạn phóng trả (giữ nguyên hình & hiệu ứng gốc) +35% st, +50% tốc & Làm Chậm 30% 1.5s. ÁP LỰC TÂM LINH: xe địch lọt vào vùng bị Làm Chậm 40%; lúc phóng trả phát sóng xung kích đẩy lùi & gây 1.0 st trong vùng (cả vật triệu hồi). CHẶN TIA: hitscan / tia lazer / raycast của địch bị chặn đứng tại rìa vùng - đổi lại mất 1.0s thời gian vùng mỗi 1.0 st chặn (về 0 -> vùng đỡ trọn đòn đó rồi VỠ); tia bị chặn ngưng tụ thành 1 Đạn Năng Lượng (tối đa 3 st) để ném trả. FULL EVO (Thần Niệm Chưởng Khống): cứ 4 phát, phát kế tiếp gọi 3 viên; vùng kéo dài 6.5s, hồi 6.5s, mở vùng nhận 1 Khiên Tâm Linh (mất khi tắt vùng); Khoá Tâm bắn dồn lệch nhịp 0.06s/viên như mưa thiên thạch, xuyên 1 mục tiêu.', cost: 310, type: 'evo' },
    ],
    tailor: [
        { id: 'evo_tailor_1', name: 'Chỉ Tơ Hoàng Kim', desc: 'Tối đa 4 Cọc Chỉ, tồn tại 12s. Đường Chỉ Căng làm chậm 50% và làm chậm 30% tốc độ bay của đạn thường địch xuyên qua màn chỉ. Rút Chỉ Xiết Chặt: mỗi Cọc Chỉ thu về +0.25 Giáp Ảo (tối đa 2.0).', cost: 175, type: 'evo' },
        { id: 'evo_tailor_2', name: 'Búp Bê Thế Mạng', desc: 'Búp Bê Kép hồi sinh nhanh hơn: 8s (thay 14s). Rút Chỉ: Búp Bê Trắng phóng kim về phía địch. FULL EVO (Tuyệt Tác Định Mệnh): Búp Bê Trắng HP = 75% Max HP, chỉ nhận x1.5 st, Trạm Chỉ hồi +0.55; Búp Bê Đen HP 4, sợi chỉ xuyên qua -> st chỉ & Rút Chỉ +65%; tối đa 5 Cọc Chỉ, băng đạn 5 Kim; >= 3 Cọc bên sân địch tạo LĨNH VỰC CẮT MAY (cấm lướt/dịch chuyển, rút 0.4 HP/s); Rút Chỉ hồi 4.5s, cọc không mất mà chụm quanh địch rồi bung ngược ra.', cost: 330, type: 'evo' },
    ],
    jack_6_lo: [
        { id: 'evo_jack_1', name: 'Thú Vị Hơn', desc: 'Luck 16s (+30% tốc, né 30%, giảm 25% st nhận); mỗi tầng Nợ phạt nặng hơn (-5% tốc, +8% st nhận). The BOY (mỗi viên trong loạt 6): Phát 1 x0.6 (tổng x3.6); Phát 2–3 x0.42 (tổng x2.5); Phát 4–5 x0.3 (tổng x1.8); nổ ngược Phát 6 tự nhận 4.5 st & Choáng 2.2s.', cost: 170, type: 'evo' },
        { id: 'evo_jack_2', name: 'High Risk, High Reward', desc: 'Chí Mạng x3.0 nhưng đạn The Hand không chí mạng chỉ gây 50% dame. Kích hoạt Luck nhận 1 Khiên. Mỗi tầng Nợ đốt 0.01 HP/s (không dưới 0.25 HP). ĐỔI ĐỜI (mỗi viên trong loạt 6): Phát 1 +(1 + Nợ)/6; Phát 2–3 +Nợ/12. Ra đạn khi đang Nợ -> XÓA SẠCH NỢ; nổ ngay Phát 1 -> Luck 12s x số Nợ. Nổ ngược: tự nhận 2.6 x số Nợ st (tối thiểu như thường). ĐỘC ĐẮC: >= 10 Nợ mà ra đạn Phát 1 -> siêu đạn x100 KHÔNG THỂ NÉ, khóa chết mục tiêu, xuyên mọi tường & khiên. FULL EVO (THÚ VỊ HƠN NỮA!!!): tung xu mỗi 2s; rút The BOY rồi giữ lố thêm mỗi 0.3s -> vay nóng +1 Nợ; The Hand nạp nhanh 1.5s, đạn chí mạng nảy tường 1 lần; bóp cò 0.43s/lần; Độc Đắc chỉ cần >= 7 Nợ; nổ ngược tạo vụ nổ lớn, địch đứng gần chịu chung 100% st.', cost: 330, type: 'evo' },
    ],
    coc: [
        { id: 'evo_coc_1', name: 'Reroll — Đổi Vận', desc: 'Giữ bắn 0.6s để chủ động ReRoll vũ khí (hồi 10s): không ra lại vũ khí đang cầm, làm mới đạn / hồi chiêu và bộ đếm 12s.', cost: 150, type: 'evo' },
        { id: 'evo_coc_2', name: '1 Và 6 — Đỉnh Cao Vận Mệnh', desc: '1) Cường hóa 6 vũ khí: Lục lướt xa hơn, phát thứ 3 mỗi chuỗi xuyên khiên; SMG chỉ cần trúng >= 7 viên là hồi đầy, phạt nạp 2.5s; Pháo băng 3 viên, để lại vùng lửa 2s; Dao lao nhanh hơn, vòng chém to hơn, Chí Mạng 50% & hồi 0.25 HP khi chí mạng; Búp Bê L hồi 3.5s (tia to hơn), R bắn 4 viên làm chậm nhẹ; Súng Vàng xuyên mọi vật cản, nạp 1.8s, trúng địch +$10. 2) XÚC XẮC NỘI TẠI: mỗi lần roll vũ khí lăn kèm 1 nội tại 12s (không trùng lượt trước): ⚀ KHIÊN PHẢN CHẤN (+1 Khiên, tối đa 2; vỡ -> sóng xóa đạn thường 120px, +30% tốc 2s, bắn trả tia 1.0) | ⚁ HUYẾT MẠCH (+0.5 HP / đầy máu +0.75 Giáp Trắng; Hút Máu 25%, hồi máu +30%) | ⚂ HÀN BĂNG (chậm 35% 2s; trúng địch đang chậm 3 lần (Pháo / Búp Bê L / Súng Vàng: 1 lần) -> Đóng Băng 0.75s + 0.5 st chuẩn, hồi 4s) | ⚃ HỎA NGỤC (đốt 0.25 HP/s 3s, tối đa 2 tầng + Xé Giáp +15% st nhận; vệt lửa khi di chuyển +15% tốc, đốt vật triệu hồi) | ⚄ GIÁP GAI (-20% st nhận, miễn Làm Chậm; bị đánh -> phản 35% st bằng tia sét đỏ không thể né, giảm 0.5s hồi ReRoll) | ⚅ HOÀNG KIM (+30% tốc bắn, +40% tốc nạp / hồi chiêu, +25% tốc đạn; trúng địch 35% +$5 (Vàng / Pháo 100%), 20% không tốn đạn). FULL EVO (Bậc Thầy Định Mệnh): mỗi lần roll tung 2 xúc xắc phụ -> 2 nội tại song song, mọi nội tại mạnh hơn 25%; PHÂN ẢNH VŨ KHÍ cầm 1 vũ khí khác chiến đấu bên cạnh (60% st), thừa hưởng 100% nội tại.', cost: 320, type: 'evo' },
    ],
    kusarigama: [
        { id: 'evo_kusa_1', name: 'Huyết Xích Khát Máu', desc: 'Hút Máu 25% -> 50% (cộng dồn với Evo 2). Tích Lũy nạp nhanh hơn 40% (1.5s đầy 5 tầng), hệ số tầng 5 lên x3.5. Đổi Phong Cách chỉ cần giữ 0.3s và không mất tầng Tích Lũy. Chảy Máu cộng dồn tối đa 3 tầng (0.6 HP/s) & làm chậm địch 20%.', cost: 190, type: 'evo' },
        { id: 'evo_kusa_2', name: 'Bất Tử Huyết Ma', desc: 'Hút Máu +25% (chỉ Evo 2: 50%; Evo 1 + Evo 2: 100%). Cuồng Huyết: ngoài 3s Bất Tử nhận ngay 2.0 Giáp Trắng, Giáp Trắng chỉ tụt 0.1/s, đổi Hút Máu -> Giáp Trắng x1.5. LINH: khi đang hiện Vòng Cảnh Báo nhận 50% Giảm Sát Thương & Miễn Khống Chế. FULL EVO (Tu La Huyết Liêm): Hút Máu 100%; đầy máu thì 50% lượng hút dư thành Giáp Trắng; trong Cuồng Huyết Tích Lũy luôn còn tối thiểu 2 tầng sau khi ra đòn, tầng 5 đạt x4.0; TAM THỨC HỢP NHẤT: Trảm phóng 2 lưỡi liềm chéo, Khóa thu về kéo giật địch trong lốc theo, Linh khi xoay bắn tỏa 8 tia huyết kiếm.', cost: 360, type: 'evo' },
    ],
    the_clock: [
        { id: 'evo_clock_1', name: 'Dây Cót Dư Trữ', desc: 'Băng đạn +1 (5 viên), nạp đạn thường nhanh hơn 25%. Kích hoạt Time Zone: hồi ngay +2 viên & +35% tốc chạy ngang trong lúc ngưng đọng.', cost: 140, type: 'evo' },
        { id: 'evo_clock_2', name: 'Kim Giờ Gia Tốc', desc: 'Hồi Time Zone 9s -> 6.5s. Kim Giờ Cường Hóa bay nhanh hơn 45%, Làm Chậm 45%. NHẢY KIM: mỗi lần Choáng 3 nhịp mà địch đang bị chậm bởi Kim Giờ -> hồi +1 viên. FULL EVO (Chúa Tể Thời Không — Án Tử 12 Giờ): Dư Chấn mở từ 7 nhịp (khựng 0.6s), KẾT LIỄU chỉ cần 16 nhịp; chủ động tắt sớm Time Zone: mỗi 1s còn dư giảm 1.2s hồi chiêu.', cost: 260, type: 'evo' },
    ],
    prism: [
        { id: 'evo_prism_1', name: 'Lăng Kính Khuếch Đại', desc: 'Phản thường 40% -> 70% dame, phạt khi phản 0.5 -> 0.25 HP. Cửa Sổ Vàng phản 125%. Mở Kính kéo dài 2.5s, hồi chiêu 7s. Đạn bị phản (giữ nguyên bản gốc) tự bẻ góc nhẹ về phía địch.', cost: 155, type: 'evo' },
        { id: 'evo_prism_2', name: 'Gương Vỡ Tái Sinh', desc: 'Đầu hiệp nhận sẵn 1 Khiên Kính Lấp Lánh. Cửa sổ phản ngược Lazer Xuyên Phá 0.125s -> 0.2s. Kính vỡ bắn 5 mảnh kính (0.35 dame mỗi mảnh). FULL EVO (Thần Quang Vạn Tượng — Bất Hoại Lăng Kính): miễn hoàn toàn phạt máu khi phản; phản thường 100% dame; Cửa Sổ Vàng phản 150% + đạn gốc bị phản tăng tốc cực đại (x1.8).', cost: 290, type: 'evo' },
    ],
    wind: [
        { id: 'evo_wind_breeze_1', name: 'Thuận Chiều Gió Thổi', desc: 'Ngưng Phong tích nhanh hơn 40% (~2.5s đạt x2.5), phát tích đầy XUYÊN THẤU vật cản. Liên Phong tối đa 8 tầng (+120% tốc bắn & +100% tốc nạp); ở tầng tối đa mỗi phát bắn +15% tốc chạy. Bắn phát Ngưng Phong (>=50%) nhận ngay 3 tầng Liên Phong.', cost: 140, type: 'evo' },
        { id: 'evo_wind_breeze_2', name: 'Vô Hình Phong Thể', desc: 'Hóa Gió hồi 4s, duy trì tối đa 5s. Mỗi viên đạn địch bay xuyên qua luồng gió: -0.5s hồi chiêu, +1 đạn, +25% Ngưng Phong. Hiện hình nổ vòng gió đẩy lùi đạn thường ở gần; Cuồng Phong Tốc Xạ 3.5s (+75% tốc bắn). FULL EVO (Tinh Linh Gió — Cơn Gió Vĩnh Cửu): phát Ngưng Phong chỉ tiêu 50% lượng tích; Hóa Gió lướt qua đạn nhỏ của địch sẽ làm lệch/xóa sổ chúng, lướt đủ 2s rồi hiện hình nhận 1 Khiên Gió 4s; mỗi 6 viên trúng địch giảm 1.5s hồi Hóa Gió.', cost: 260, type: 'evo' },
    ],
    the_adapter: [
        { id: 'evo_adapter_1', name: 'Học Sâu Thời Gian Thực', desc: 'Vòng Xoay Thích Ứng tối đa 6 -> 8 nấc (48% Giảm Sát Thương, +0.96 dame). Tự xoay mỗi 2.5s thay vì 3.5s. Mỗi khi địch dùng Kỹ năng Giữ Bắn: +1 nấc ngay & +1 tầng Lộ Điểm Yếu lên địch.', cost: 170, type: 'evo' },
        { id: 'evo_adapter_2', name: 'Phá Giải Hoàn Toàn', desc: 'Lộ Điểm Yếu tối đa 5 -> 7 tầng (+49% sát thương nhận, -28% tốc đạn/nạp đạn của địch). Từ 4 tầng trở lên: mỗi phát bắn thường trúng hút +0.15 HP & cướp 10% tốc chạy ngang của địch trong 1.5s. FULL EVO (Thần Cơ Bất Bại): đầu hiệp có sẵn 2 nấc & địch bị gắn sẵn 1 tầng; TRẠNG THÁI HOÀN MỸ (8/8 nấc): đạn thường to gấp rưỡi, xuyên vật cản, mỗi 6s tự tạo 1 lớp Khiên Thích Ứng, đòn trúng địch đủ 7 tầng nổ thêm 0.4 sát thương chuẩn.', cost: 320, type: 'evo' },
    ],
    tinh: [
        { id: 'evo_tinh_1', name: 'Ánh Nhìn Áp Chế', desc: 'Khó Chịu tối đa 10 -> 15. Đi bộ chỉ cần 120px trong 1.2s là bị tính Khó Chịu. Tầng Ngưng tồn tại 7s; mỗi tầng Ngưng làm địch nhận thêm +10% sát thương từ Tỉnh. Địch đứng im quá 2.5s -> +1 Khó Chịu mỗi giây.', cost: 160, type: 'evo' },
        { id: 'evo_tinh_2', name: 'Lĩnh Vực Tĩnh Lặng', desc: 'Đạn Cấm Chế chỉ tốn 4 Khó Chịu. Vùng Cấm Chế r155, 5s, rút 0.3 HP/s & đạn địch bắn từ trong vùng chậm 35%. Địch bị Choáng do 3 tầng Ngưng -> Tỉnh hồi đầy đạn, +1 Khiên, phát bắn kế tiếp Chí Mạng x2. FULL EVO (Tuyệt Đối Tĩnh Lặng): Đạn Cấm Chế trúng trực tiếp +1 tầng Ngưng; địch trong vùng hoặc >= 2 tầng Ngưng -> vật triệu hồi của địch chậm 50%.', cost: 300, type: 'evo' },
    ],
    diep_thanh_phong: [
        { id: 'evo_dtp_1', name: 'Khí Lưu Tuần Hoàn', desc: 'Gió tối đa 130, hồi Gió +30%. Giữ đổi Thế Quạt 0.5s -> 0.25s; Đổi Khí Áp hồi 9s -> 7s và mỗi lần đổi nhận 1 Khiên Gió. CỘNG HƯỞNG PHONG BẠO mạnh hơn: bán kính x1.25 -> x1.5, hút địch mạnh hơn. Phong Vũ: Vòng Cảnh Báo 1.0s. Giữ trên không để lại vòng: hoàn 10 Gió & +25% tốc 1.5s.', cost: 185, type: 'evo' },
        { id: 'evo_dtp_2', name: 'Phong Thần Giáng Thế', desc: 'Thuận Phong: Cơn Lốc Lớn nổ ở tường bắn trả toàn bộ đạn đã nuốt thành lưỡi gió tự ngắm. Bão Hòa: Loạn Phong mỗi 8s; Lốc Nuôi hút đạn địch để lớn nhanh. Nghịch Phong: Toàn Phong sau 4.5s, Gió Cắt cộng dồn 3 tầng & -40% hồi máu địch; Cửu Thiên chỉ cần 2.8s để đạt Đại Bão Tố, Ảo Ảnh giữ 100% uy lực, Vòng Cảnh Báo để lại tự nuôi 3s với 85% hiệu quả. FULL EVO (Vạn Lý Trường Phong — Thiên Nhân Hợp Nhất): ở Bão Hòa hưởng thêm 50% nội tại Thuận & Nghịch Phong; Đổi Khí Áp giữ buff vùng cũ 4s; chiêu đặc biệt Thuận Phong Vũ chỉ cần 2 Nhịp; Khiên Gió vỡ phóng 4 Lốc Nhỏ truy kích & hồi 25 Gió.', cost: 350, type: 'evo' },
    ],
    railgun: [
        { id: 'evo_rail_1', name: 'Cuộn Cảm Siêu Dẫn', desc: 'Cầu Năng Lượng (Nội tại & trong Vùng Điện Tích) tự nạp nhanh hơn 35%: 0.65s Xuyên Vật Thể, 1.3s Xuyên Giáp-Khiên, 2.0s hóa LAZER. Khi giữ 1 cầu lơ lửng trước mặt: +20% tốc chạy ngang và vẫn nạp đạn trong băng như bình thường.', cost: 155, type: 'evo' },
        { id: 'evo_rail_2', name: 'Lưới Điện Cao Thế', desc: 'Vùng Điện Tích hồi 15s -> 11s, tồn tại 6s; vừa mở vùng tự tạo miễn phí 1 Cầu Năng Lượng trước mặt. Giữ 1.0s Khoá Mục Tiêu bắn 4 viên liên tiếp, trúng đích Làm Chậm 30% 1.2s. Địch lao cận chiến mặt đất chạm vùng -> bị giật điện chặn đứng, hất về làn cũ, 1.0 st & Choáng 1.25s. FULL EVO (Pháo Điện Từ Hủy Diệt — Bão Từ Trường): QUÁ TẢI (mốc 4.0s) — cầu trúng đích nổ xung +0.5 st AoE & TÊ LIỆT (khoá Giữ Bắn của địch 1s); HOÀN NĂNG LƯỢNG — mỗi 2 đạn địch bị bắt trong vùng: +0.25 HP & -1s hồi Vùng; BẮT TOÀN BỘ — vùng bắt mọi loại đạn (kể cả siêu đạn bị loại trừ: Fuga, chém Sukuna, Tím/Lam Gojo, Hư Ảnh Bão, quyền phong...), giữ đạn gốc trong cầu và phóng trả nguyên bản (hình, hook, hiệu ứng), st x1.0 -> x2.0 theo mức nạp.', cost: 290, type: 'evo' },
    ],
    skinwalker: [
        { id: 'evo_skin_1', name: 'Gen Tiến Hóa Cực Hạn', desc: 'Cường hóa Hình Thái Chính. 🩸 Phá Giáp: đạn 1.1 + 8% Máu tối đa, giảm st cận chiến 45%, địch đối diện -35% tốc bắn. 👁 Hư Không: miễn nhiễm 100% Làm Chậm, phá vật triệu hồi +0.25 HP & +1 đạn, đạn để lại vệt hư không xóa 1 đạn thường của địch. 🕸 Tróc Ảnh: 3 đạn, Bắt Tốc +0.3 tốc/s, Rách Cơ 1.5 st chuẩn + Khóa Chân 1.0s. ☣ Độc Thực: Trọng Thương -75% hồi máu, hấp thụ 40%, chỉ cần địch vỡ 2 Khiên -> +1 Khiên.', cost: 150, type: 'evo' },
        { id: 'evo_skin_2', name: 'Kết Hợp Song Thể — Thay Da', desc: 'Đầu hiệp Thay Da theo Vai Trò Phụ của địch (1 vai trò: nhận luôn; >=2: gacha; 0: không gì). Lớp Da Phụ ~50% hiệu ứng gốc: Phá Giáp +0.5 HP, đạn +2.5% Máu tối đa, -15% st khi địch áp sát, -12% tốc bắn đối diện | Hư Không +0.2 tốc, x2 dame lên vật triệu hồi, -50% st Vũng, phá vật +0.06 HP | Tróc Ảnh: đạn bẻ lái nhẹ vào địch đang chạy, chậm 15%, 0.5 st chuẩn khi địch Lướt | Độc Thực: độc 0.125 HP/s 2s, -30% hồi máu, hấp thụ 12.5%. FULL EVO (Apex Skinwalker): Da Phụ 80% sức mạnh; địch thuần 1 vai trò -> nhân đôi Hình Thái Chính +35% hiệu lực; lần đầu tụt dưới 25% máu: LỘT BỎ LỚP DA CŨ — xóa khống chế, lướt ẩn thân bất tử 1.25s, hồi 1.5 HP, đầy đạn.', cost: 280, type: 'evo' },
    ],
    idol: [
        { id: 'evo_idol_1', name: 'Chuyến Lưu Diễn Toàn Cầu', desc: 'CẦN ≥ 6 FAN (tụt dưới 6 -> tạm khóa). CD Buổi Trình Diễn 30s -> 22s; giữ mở Sân Khấu 1.0s -> 0.6s. Giữ đổi Phong Cách 0.5s -> 0.25s, mỗi lần đổi giảm 1.0s CD của Phong Cách vừa chuyển tới. Thời gian trước khi mất Fan 6s -> 10s.', cost: 140, type: 'evo' },
        { id: 'evo_idol_2', name: 'Hiện Tượng Mạng', desc: 'CẦN ≥ 12 FAN (tụt dưới 12 -> tạm khóa). Cứ mỗi 2 Fan +2% Sát thương & +1.5% tốc chạy ngang (tối đa ở 20 Fan: +20% / +15%). Ba Phong Cách tách thành 3 CD riêng (combo Tim -> Lazer -> Vũ Đạo). FULL EVO (Huyền Thoại Sân Khấu, duy trì ≥ 18 Fan): Buổi Trình Diễn = 100% Sân Khấu đã chọn + 50% của 2 Sân Khấu còn lại; mỗi 5s khi Sân Khấu mở ném về làn Idol 1 Hộp Quà Fan (+0.4 HP & +20 Náo Nhiệt) và 1 Lightstick Phát Nổ xuống vị trí địch (cảnh báo 0.8s, 1.0 st + chậm 30%).', cost: 260, type: 'evo' },
    ],
};

// ==========================================
// KHOÁ FULL EVO: các body có Full Evo quá mạnh phải mua thêm 1 thẻ "FULL EVO"
// (chỉ xuất hiện trong Shop khi đã có đủ Evo 1 + Evo 2). Body không có trong bảng:
// Full Evo vẫn tự kích hoạt khi có đủ 2 Evo như cũ.
// ==========================================
const FULL_EVO_GATE = {
    steel_hook: 220,   // Móc Thép
    tank: 250,         // Full Evo ~99% thắng trong mô phỏng
    one_punch: 250,
    gemini: 220,
    kusarigama: 220,
    blood_lord: 200,   // Full Evo nhảy vọt mạnh nhất (+42% tỉ lệ thắng)
    genius: 200,
    psychokinesis: 180,
};
for (const body in FULL_EVO_GATE) {
    if (!EVOLUTIONS[body]) continue;
    // Mô tả Evo có nhắc Full Evo -> ghi chú cần thẻ FULL EVO
    EVOLUTIONS[body].forEach(e => { if (/full\s*evo/i.test(e.desc)) e.desc += ' (🔒 Full Evo cần mua thêm thẻ ★ FULL EVO ★ — chỉ bày bán khi đã có Evo 1 + Evo 2)'; });
    EVOLUTIONS[body].push({
        id: 'evo_' + body + '_full', name: '★ FULL EVO ★', cost: FULL_EVO_GATE[body], type: 'evo', fullEvoGate: true,
        desc: 'Mở khoá sức mạnh FULL EVO của body này (có Evo 1 + Evo 2 vẫn CHƯA đủ — phải mua thêm thẻ này mới kích hoạt Full Evo).'
    });
}
// id thẻ FULL EVO của body (null nếu body không bị khoá)
function fullEvoGateId(body) { return FULL_EVO_GATE[body] ? 'evo_' + body + '_full' : null; }
// Đã có Full Evo chưa: đủ Evo 1 + Evo 2 (+ thẻ FULL EVO nếu body bị khoá). body mặc định = p.weapon
function hasFullEvo(p, body) {
    body = body || (p && p.weapon);
    const list = EVOLUTIONS[body];
    if (!p || !list || list.length < 2 || typeof p.hasUpgrade !== 'function') return false;
    return list.every(e => p.hasUpgrade(e.id));
}
// Thẻ Evo có được bày trong Shop chưa (thẻ FULL EVO chỉ hiện khi đã có 2 Evo thường)
function evoShopAvailable(p, e) {
    if (!e || !e.fullEvoGate) return true;
    const list = EVOLUTIONS[p.weapon] || [];
    return list.filter(x => !x.fullEvoGate).every(x => p.hasUpgrade(x.id));
}
