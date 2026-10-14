// ==========================================
// Dữ liệu Tiến hoá (Evo) của từng nhân vật
// ==========================================



// --- EVOLUTIONS ---
const EVOLUTIONS = {
    basic: [
        { id: 'evo_basic_1', name: 'Công Thủ Toàn Diện', desc: 'HP+6, Dame ×2', cost: 15, type: 'evo' },
        { id: 'evo_basic_2', name: 'Thập Tử Nhất Sinh', desc: 'Về 0 HP -> Hồi 1 HP + Bất tử 3s', cost: 30, type: 'evo' } // UPDATE DESC
    ],
    money_tank: [
        { id: 'evo_money_atk', name: 'Tiền Tấn Công', desc: 'Mỗi 8s phóng 2 xe tiền từ làn bạn lao thẳng về phía địch (tông trúng 1.5 dame, chạm tường nổ 1.5 dame, phá xe tiền/thùng trên đường). Phá xe tiền bằng đạn -> bắn chùm đạn vào địch.', cost: 150, type: 'evo' },
        { id: 'evo_money_2', name: 'Sức Mạnh Đồng Tiền', desc: 'Mọi nâng cấp giảm 25%. Mỗi 100$ tiêu (tối đa 2500$, tính từ lúc mua) nhận 1 mốc thưởng vĩnh viễn: HP, Dame, Đạn, Tốc, Khiên. FULL EVO: mọi mặt hàng giảm 50%, thêm xe tiền trên sân, 3 xe tấn công mỗi 5s (mạnh hơn).', cost: 120, type: 'evo' }
    ],
    tank: [
        { id: 'evo_tank_1', name: 'Không Thể Cản Phá', desc: 'Lao xuyên vật thể, Bất tử khi lao', cost: 100, type: 'evo' }, // UPDATE COST
        { id: 'evo_tank_2', name: 'Tàn Phá!!!', desc: 'Húc nổ lan + Hồi khiên nội tại nhanh hơn', cost: 45, type: 'evo' } // UPDATE DESC
    ],
    ice: [
        { id: 'evo_ice_1', name: 'Bão Tuyết', desc: 'Mỗi 3 lần kích hoạt -> Tạo vùng Băng Cực Đại', cost: 100, type: 'evo' }, // UPDATE DESC
        { id: 'evo_ice_2', name: 'Hàn Băng', desc: 'x1.5 Dame lên kẻ bị chậm, Vùng băng gây dame', cost: 60, type: 'evo' }
    ],
    big_bullet: [
        { id: 'evo_big_1', name: 'To Hơn Nữa', desc: 'Đạn siêu to khổng lồ', cost: 20, type: 'evo' },
        { id: 'evo_big_2', name: 'Bóng Cao Su', desc: 'Đạn nảy lại 1 lần khi chạm tường', cost: 100, type: 'evo' }
    ],
    shotgun: [
        { id: 'evo_shot_1', name: 'Mưa Đạn', desc: 'Tỏa 5 tia', cost: 45, type: 'evo' },
        { id: 'evo_shot_2', name: 'Đạn Dự Phòng', desc: 'Băng đạn 4 viên', cost: 30, type: 'evo' }
    ],
    overload: [
        { id: 'evo_over_1', name: 'Cầu Điện', desc: 'Nổ xanh TO khi full lực chạm tường', cost: 50, type: 'evo' },
        { id: 'evo_over_2', name: 'Năng Lượng Xanh', desc: 'Tụ lực nhanh hơn', cost: 20, type: 'evo' }
    ],
    smg: [
        { id: 'evo_smg_1', name: 'Hỏa Lực +++', desc: 'Sấy càng lâu: Dame tăng, Tốc bắn tăng, Đạn bay nhanh.', cost: 80, type: 'evo' },
        { id: 'evo_smg_2', name: 'Băng Đạn X', desc: 'Đạn: 26. Không bắn 5s -> Hồi FULL đạn.', cost: 120, type: 'evo' } // Đã tăng giá lên 60
    ],
    lazer_charge: [
        { id: 'evo_lazer_c_1', name: 'Pháo Diệt Tinh', desc: 'Tia to, tồn tại 2s gây sát thương', cost: 150, type: 'evo' },
        { id: 'evo_lazer_c_2', name: 'Năng Lượng Xanh', desc: 'Nạp đạn nhanh hơn', cost: 50, type: 'evo' }
    ],
    lazer_auto: [
        { id: 'evo_lazer_a_1', name: 'Xuyên Phá', desc: 'Đạn bay cực nhanh', cost: 30, type: 'evo' },
        { id: 'evo_lazer_a_2', name: 'Phá Hủy', desc: 'Tăng dame, đạn to hơn', cost: 45, type: 'evo' }
    ],
    rocket: [
        { id: 'evo_rocket_1', name: 'Đầu Đạn Hạt Nhân', desc: 'Vùng nổ siêu rộng + Phóng xạ', cost: 220, type: 'evo' },
        { id: 'evo_rocket_2', name: 'Đầu Đạn Lớn', desc: 'Tăng dame nổ + Phạm vi', cost: 40, type: 'evo' }
    ],
    portal: [
        { id: 'evo_portal_1', name: 'Cổng Cường Hóa', desc: 'Dịch chuyển nhận đạn nổ', cost: 55, type: 'evo' },
        { id: 'evo_portal_2', name: 'Cổng Gia Tốc', desc: 'Dịch chuyển hồi đầy đạn + Tốc', cost: 40, type: 'evo' }
    ],
    wind_slash: [
        { id: 'evo_wind_1', name: 'Cuồng Phong Tích Tụ', desc: 'Mỗi phát bắn thứ 5 -> Tự động Full Lực', cost: 120, type: 'evo' },
        { id: 'evo_wind_2', name: 'Nghịch Phong', desc: 'Chém vào đạn địch -> Phản lại về phía địch', cost: 100, type: 'evo' }
    ],
    storm: [
        { id: 'evo_storm_1', name: 'Mắt Bão', desc: 'Tụ >50% + Khiên: Xóa đạn quanh người. Chém xong hút địch.', cost: 80, type: 'evo' },
        { id: 'evo_storm_2', name: 'Phong Ảnh Trảm', desc: 'Mỗi 3-8s bóng lao lên chém. Full lực + Khiên: Chém bồi thêm phát nữa.', cost: 100, type: 'evo' }
    ],
    acid: [
        { id: 'evo_acid_1', name: 'Bào Mòn', desc: 'Vùng Axit rộng hơn, tốc độ ăn mòn Max HP gấp đôi.', cost: 40, type: 'evo' },
        { id: 'evo_acid_2', name: 'Độc Hại', desc: 'Ngưỡng kết liễu tăng lên 2 Max HP.', cost: 60, type: 'evo' }
    ],

    engineer: [
        { id: 'evo_eng_1', name: 'Cải Tiến Hệ Thống', desc: 'Ụ súng thường VIP (75% chỉ số). Ụ súng thông minh VIP tối đa 3 cái, đạn Xuyên. Tương tác Mạng LAN.', cost: 100, type: 'evo' },
        { id: 'evo_eng_2', name: 'Quá Tải / Mạng LAN', desc: 'Vòng Mạng LAN hồi máu & giúp ụ thường tự ngắm. Giữ bắn 2s bật Quá Tải 600s (-1 Max HP, Ụ thông minh bắn Raycast mỗi 2s). Hết quá tải câm lặng 1s & chậm 5s (CD 8s).', cost: 200, type: 'evo' }
    ],
    ghost: [
        { id: 'evo_ghost_1', name: 'Bóng Mờ', desc: 'Vô ảnh: 2s (Hồi 1s). Đạn tàng hình khi buff. Đạn chớp tắt giữa map.', cost: 60, type: 'evo' },
        { id: 'evo_ghost_2', name: 'Ảo Ảnh', desc: 'Chu kỳ Vô ảnh nhanh hơn. Mỗi 12s triệu hồi Hư Ảnh bắn phụ.', cost: 120, type: 'evo' }
    ],
    aaa: [
        { id: 'evo_aaa_1', name: 'Nhắm Đánh Dấu', desc: 'Pháo kích tự ghim mục tiêu. Tự bắn thường: 3 tia liên tiếp.', cost: 80, type: 'evo' },
        { id: 'evo_aaa_2', name: 'Mưa Tên Lửa', desc: 'Tự bắn -> Rơi 3 bom ngẫu nhiên. Pháo kích nổ bồi lần 2.', cost: 100, type: 'evo' }
    ],
    blade_god: [
        { id: 'evo_blade_1', name: 'Kiếm Thế Vô Chủ', desc: 'Anh Minh xuyên thấu. Hư Vô 3 stack = Tử hình. Gọi Phá Thiên -> Bất tử 5s.', cost: 150, type: 'evo' },
        { id: 'evo_blade_2', name: 'Kiếm Thể Phòng Hộ', desc: 'Khiên đỡ 5 hit. Khi vỡ phóng 5 kiếm tự ngắm. Nạp đạn cực nhanh.', cost: 150, type: 'evo' }
    ],
    van_kiem: [
        { id: 'evo_vk_1', name: 'Mưa Kiếm', desc: 'Tự động gọi kiếm ngẫu nhiên sau lưng. Gọi càng nhanh khi đã bắn nhiều kiếm.', cost: 150, type: 'evo' },
        { id: 'evo_vk_2', name: 'Kiếm Thế Hoàn Chỉnh', desc: 'Trong Kiếm Thế: Có thể di chuyển siêu chậm, đạn xuyên thấu. Nhả nút phóng Đại Kiếm.', cost: 150, type: 'evo' }
    ],
    water_gun: [
        { id: 'evo_water_1', name: 'Vòi Rồng', desc: 'Giữ bắn -> Phun liên tục (10%/0.5s), vừa đi vừa phun chậm. Nghỉ bắn hồi nội năng nhanh (15%/s).', cost: 100, type: 'evo' },
        { id: 'evo_water_2', name: 'Vòi Cao Áp', desc: 'Tự hồi nội năng (0.5%/s) kể cả khi đang bắn. Đạn làm chậm và xuyên thấu.', cost: 120, type: 'evo' }
    ],
    furnace: [
        { id: 'evo_furnace_1', name: 'Nhiệt Năng', desc: 'Giữ bắn 1s -> Bắn tia lửa liên tục, hao năng lượng cực nhanh.', cost: 100, type: 'evo' },
        { id: 'evo_furnace_2', name: 'Tích Tụ', desc: 'Đốt kéo dài 6s. Cứ tiêu hao 30% nội năng -> Đạn kế tiếp gây nổ tạo Vùng Lửa.', cost: 150, type: 'evo' }
    ],
    am_duong_su: [
        { id: 'evo_ads_1', name: 'Pháp Chú', desc: 'Nổ/Choáng rộng và lâu hơn. Bùa tồn tại lâu hơn.', cost: 80, type: 'evo' },
        { id: 'evo_ads_2', name: 'Pháp Trận', desc: 'Bùa kết hợp nổ để lại Pháp Trận sát thương liên tục.', cost: 100, type: 'evo' }
    ],
    six_barrel: [
        { id: 'evo_six_1', name: 'Bão Đạn', desc: 'Nhiệt >50%: Bắn 2 viên. Nhiệt >75%: Bắn 3 viên.', cost: 80, type: 'evo' },
        { id: 'evo_six_2', name: 'Quá Nhiệt', desc: 'Nhiệt >50% đã gây Đốt. Hạ nhiệt cực nhanh khi <50%. Lâu quá tải hơn. Nhược điểm: Quá tải trừ 5 Max HP.', cost: 100, type: 'evo' }
    ],
    the_strongest: [
        { id: 'evo_strongest_1', name: 'HÆ° Thá»©c: Tá»­ (TĂ­m)', type: 'evo', desc: 'KĂ­ch hoáº¡t cáº£ 2 ná»™i táº¡i khi ChĂº lá»±c >50% táº¡o cáº§u há»§y diá»‡t ná»• diá»‡n rá»™ng.', cost: 90 },
        { id: 'evo_strongest_2', name: 'Lá»¥c NhĂ£n (Máº¯t Xanh)', type: 'evo', desc: 'TÄƒng max & há»“i ChĂº lá»±c. Nháº¥p: Äáº¡n Xanh hĂºt Ä‘á»‹ch. Giá»¯: Tia Äá» choĂ¡ng.', cost: 90 }
    ],
    // THÊM TIẾN HÓA SNIPER VÀO ĐÂY:
    sniper: [
        { id: 'evo_sniper_1', name: 'Tường Thép', type: 'evo', desc: 'Tường HP x5. Đạn Sniper đi qua tường phe mình KHÔNG bị giảm sát thương.', cost: 80 },
        { id: 'evo_sniper_2', name: 'Xuyên Thủng', type: 'evo', desc: '25% đạn thành tia Raycast (chạm tường/chướng ngại vật sẽ thành đạn thường).', cost: 100 }
    ],
    cung: [
        { id: 'evo_cung_1', name: 'Xuyên Thủng', desc: 'Tụ >2s: Đạn xuyên qua mục tiêu nhưng giảm 50% dame.', cost: 80, type: 'evo' },
        { id: 'evo_cung_2', name: 'Mưa Tên', desc: 'Tụ >3s: Tạo hồng tâm đuổi địch. Nhả bắn rơi Mưa Tên (CD: 10s).', cost: 120, type: 'evo' }
    ],
    mirror: [
        { id: 'evo_mirror_1', name: 'Tái Lập', desc: 'CD Đổi còn 3s. Sau khi đổi: Tăng Tốc, Dame và Bất tử 0.5s.', cost: 80, type: 'evo' },
        { id: 'evo_mirror_2', name: 'Hình Chiếu', desc: 'Tạo Ảnh chiếu cho địch. Đánh vào Ảnh chiếu địch chịu 50% dame.', cost: 100, type: 'evo' }
    ],
    sukuna: [
        { id: 'evo_sukuna_1', name: 'Hỏa Mũi Tên (Fuga)', desc: 'Khi đầy 100 Chú Lực, giữ bắn 2s phóng đại hồng tâm lửa gây 3.5 dame.', cost: 100, type: 'evo' },
        { id: 'evo_sukuna_2', name: 'Phách Diện Rộng', desc: 'Nhát chém to gấp đôi, có thể triệt tiêu đạn thường của kẻ địch.', cost: 100, type: 'evo' }
    ],
    paradox: [
        { id: 'evo_paradox_1', name: 'Dấu Ấn Thời Gian', type: 'evo', desc: 'Bắn trúng địch tích ấn (Max 3). Đủ ấn tạo Bóng Đứng Yên + Choáng. Kích hoạt tua ngược kéo địch về Bóng Đứng.', cost: 100 },
        { id: 'evo_paradox_2', name: 'Nghịch Đảo', type: 'evo', desc: 'Hồi chiêu Tua Ngược còn 10s. Kéo địch về gây Làm Chậm. Đủ 2 Evo: Kéo địch về Bóng 5s (Choáng 0.5s) hoặc Bóng Đứng (Choáng 1.5s, 2 hit tạo bóng).', cost: 120 }
    ],
    magician: [
        { id: 'evo_mag_1', name: 'Hoán Đổi Chủ Động', type: 'evo', desc: 'Giữ bắn 1s: Tàng hình & Đổi vị trí với Phân ảnh. Đổi với bóng Đứng: Bóng tự đi. Đổi bóng Đi: Cả hai tăng tốc.', cost: 100 },
        { id: 'evo_mag_2', name: 'Loạn Ảnh & Suy Yếu', type: 'evo', desc: 'Bắn trúng +1, Địch phá bóng +3 stack Suy Yếu (Nhận thêm dame). Đủ 3 stack: Địch bị Slow. Đạn trúng địch gây Loạn Phím.', cost: 120 }
    ],
    inventor: [
        { id: 'evo_inv_1', name: 'Cải Tiến Và Tiến Hóa', desc: 'Drone nhận 75% chỉ số. Drone hồi sinh nhanh. Thắng +6 LK, Crate +2 LK, Xe tiền +3 LK.', cost: 80, type: 'evo' },
        { id: 'evo_inv_2', name: 'Bản Thiết Kế ++', desc: 'Có 2 Drone. Hồi sinh 8s. Mở khóa Tụ Gió & Khiên Drone trong Chợ LK.', cost: 100, type: 'evo' }
    ],
    shadow_hunter: [
        { id: 'evo_sh_1', name: 'Bóng Mờ', desc: 'Đòn cường hóa xuyên thấu. Gây Mù HUD điều khiển đối thủ trong 1.5s.', cost: 90, type: 'evo' },
        { id: 'evo_sh_2', name: 'Phục Kích', desc: 'Vào Vô Hình: Nạp đầy đạn, +60% tốc, +100% dame. Đạn câm lặng 1.5s. Rải 2 cạm bẫy bóng đêm.', cost: 110, type: 'evo' }
    ],
    shortgunATK: [
        { id: 'evo_sg_1', name: 'Dragon Strike', desc: 'Đạn gây Đốt 2 tầng. Vùng nón cảnh báo để lại Vùng Biển Lửa (FireZone) 3s.', cost: 90, type: 'evo' },
        { id: 'evo_sg_2', name: 'Tàn Phá', desc: 'Tiêu diệt mục tiêu biến xác thành đạn pháo quán tính văng thẳng phía trước nổ AoE.', cost: 110, type: 'evo' }
    ],
    thunder: [
        { id: 'evo_thun_1', name: 'Phá Sấm', desc: 'Nổ tường & đòn chém xoay gây Choáng 1s.', cost: 90, type: 'evo' },
        { id: 'evo_thun_2', name: 'Rẽ Mây', desc: 'Lôi Minh kéo dài 8s; Nhận 3 lần miễn nhiễm sát thương hoàn toàn.', cost: 110, type: 'evo' }
    ],
    magnet: [
        { id: 'evo_mag_net_1', name: 'Từ Trường Tăng Cường', desc: 'Hút gây 0.5 dame (x2); Lướt Cực Tính (Polar Dash) gây x2 dame.', cost: 90, type: 'evo' },
        { id: 'evo_mag_net_2', name: 'Lưới Từ Cực', desc: 'Tối đa 3 Cột Từ Trường.', cost: 110, type: 'evo' }
    ],
    evolution: [
        { id: 'evo_evo_1', name: 'Mưa Tiến Hóa', desc: 'Tăng mạnh tỉ lệ rương; Chỉ số nhận từ thùng đồ tăng +30%.', cost: 90, type: 'evo' },
        { id: 'evo_evo_2', name: 'Dị Thể Cộng Hưởng', desc: 'Mảnh văng Mimic x2 số lượng & gây 100% Dame của xe.', cost: 110, type: 'evo' }
    ],
    death_lock: [
        { id: 'evo_dl_1', name: 'Trói', desc: 'Thời gian duy trì ấn Ràng Buộc tăng từ 5s lên 8s (Full Evo: 12s).', cost: 90, type: 'evo' },
        { id: 'evo_dl_2', name: 'Quản Chế', desc: 'Lực kéo tâm xích mạnh & xa hơn; Chiều rộng Lồng thu hẹp còn 140px (Full: 100px).', cost: 110, type: 'evo' }
    ],
    creator: [
        { id: 'evo_cr_1', name: 'Sản Phẩm Mới', desc: 'Ụ súng và Khiên thép nhận 100% chỉ số (Ụ súng x2 dame, Khiên 10 HP).', cost: 90, type: 'evo' },
        { id: 'evo_cr_2', name: 'Robot Tự Động', desc: 'Sau 10s xuất xưởng Robot Chiến Đấu (36x36, 10 HP, SMG/Rocket/Dash, Hồi sinh 30s).', cost: 120, type: 'evo' }
    ],
    necromancer: [
        { id: 'evo_necro_1', name: 'Linh Thể', desc: 'Tốc độ hồi Linh Hồn nhanh hơn (3 Linh Hồn mỗi 3s).', cost: 90, type: 'evo' },
        { id: 'evo_necro_2', name: 'Thống Trị', desc: '+4 Linh Hồn tối đa. Quái triệu hồi nhận nội tại bổ sung (Cảm Tử +50% bán kính nổ; Xạ Thủ bắn đạn Xuyên; Cao Cấp có khiên đỡ 3 đòn).', cost: 110, type: 'evo' }
    ],
    genius: [
        { id: 'evo_gen_1', name: 'Tối Ưu Hóa', desc: 'Giảm tiêu hao Bánh Răng vào Mecha còn 6 BR; Kỹ năng giảm 1 NL; Hoàn lại 4 BR khi Mecha vỡ; Hồi 2 NL/s khi không dùng kỹ năng 2s.', cost: 90, type: 'evo' },
        { id: 'evo_gen_2', name: 'Vũ Trang Hóa', desc: 'Bắn thường Mecha có Xuyên Thấu. Trang bị 4 module tự động (Bắn phụ 3s, Radar AAA 8s, Chấn Động 10s, Pháo Thủy Lực 8 NL).', cost: 110, type: 'evo' }
    ],
    kiem_khach: [
        { id: 'evo_kk_1', name: 'Lấy Tâm Luyện Kiếm', desc: 'Giảm 50% yêu cầu của mọi bài tập. Tập Trung khi mất khiên kéo dài 5s (thay vì 3s).', cost: 90, type: 'evo' },
        { id: 'evo_kk_2', name: 'Thí Luyện', desc: '+1 ô bài tập làm cùng lúc. Đầu mỗi hiệp nhận sẵn 1 Khiên. FULL EVO: +2 ô bài tập, yêu cầu giảm sâu, mở 5 Bài Tập Cuối -> Hóa Thần.', cost: 110, type: 'evo' }
    ],
    sprayer: [
        { id: 'evo_spray_1', name: 'Năng Lượng Xanh', desc: 'Hồi năng lượng nhanh hơn 50%, phun tiêu hao chậm hơn 30%.', cost: 80, type: 'evo' },
        { id: 'evo_spray_2', name: 'Dấu Vết Độc Địa', desc: 'Lớp phủ bám lâu hơn. Phun liên tục để lại vũng Lửa/Axit/Băng 3s. FULL EVO: phun cùng lúc cả 3 chất, góc phun rộng hơn, phun lâu hơn; Nổ 7 dmg lan, Axit ăn mòn x2 & câm thêm 1s, Đóng băng 2.5s.', cost: 110, type: 'evo' }
    ],
    customize: [
        { id: 'evo_cu_1', name: 'Gói VIP', desc: 'Mở thêm mô-đun: Đạn Tự Ngắm, Đạn Hút (kéo đối thủ), Nảy Tường (+sát thương mỗi lần nảy).', cost: 80, type: 'evo' },
        { id: 'evo_cu_2', name: 'Cá Nhân Hóa', desc: 'Mọi hiệu ứng lắp ghép mạnh hơn 30%. +1 Điểm Tùy Chỉnh mỗi hiệp. FULL EVO: chọn 1 Nội Tại Độc Quyền.', cost: 110, type: 'evo' }
    ],
    kiem_su: [
        { id: 'evo_ks_1', name: 'Điều Tức Chuyển Khí', desc: 'Cường hóa mọi nguyên tố. Giữ Bắn 0.25s: đổi chỗ viên đạn hiện tại và viên kế tiếp (trùng màu thì tự đổi màu).', cost: 90, type: 'evo' },
        { id: 'evo_ks_2', name: 'Ngũ Hành Giao Thoa', desc: '2 phi kiếm liên tiếp tạo phản ứng: Đồng nguyên tố / Tương sinh / Tương khắc (15 phản ứng). FULL EVO: mỗi phát kèm 2 kiếm hộ tống, phản ứng mạnh hơn.', cost: 120, type: 'evo' }
    ],
    kiem_vu: [
        { id: 'evo_kv_1', name: 'Tâm Nhãn', desc: 'Tâm Định đầy nhanh hơn (0.8s), +50% Sát Ý mỗi lần phản đạn. Bản Mệnh Kiếm cắm trên sân địch tỏa kiếm khí làm chậm đối thủ đi ngang qua.', cost: 100, type: 'evo' },
        { id: 'evo_kv_2', name: 'Lưu Thủy Phản Chiếu', desc: 'Tập Trung kéo dài 1.0s. Đạn phản bay thẳng chuẩn xác về phía địch. Vẫn điều khiển Bản Mệnh Kiếm khi đang Tập Trung. FULL EVO (Vạn Kiếm Quy Tâm): kiếm bay nhanh hơn, dame x1.15 + Chảy Máu; đi ngang chậm khi Tập Trung; mỗi 5 lần Điều Kiếm, lần kế tiếp triệu hồi 4 Kiếm Phụ tấn công rồi tự thu về.', cost: 120, type: 'evo' }
    ]
};
