// ==========================================
// Dữ liệu Tiến hoá (Evo) của từng nhân vật
// ==========================================



// --- EVOLUTIONS ---
const EVOLUTIONS = {
    basic: [
        { id: 'evo_basic_1', name: 'Công Thủ Toàn Diện', desc: 'HP +2, Dame ×1.25', cost: 15, type: 'evo' },
        { id: 'evo_basic_2', name: 'Thập Tử Nhất Sinh', desc: 'Về 0 HP -> Hồi 1 HP + Bất tử 3s', cost: 30, type: 'evo' } // UPDATE DESC
    ],
    money_tank: [
        { id: 'evo_money_atk', name: 'Tiền Tấn Công', desc: 'Mỗi 8s phóng 2 xe tiền từ làn bạn lao thẳng về phía địch (tông trúng 1.5 dame, chạm tường nổ 1.5 dame, phá xe tiền/thùng trên đường). Phá xe tiền bằng đạn -> bắn chùm đạn vào địch.', cost: 150, type: 'evo' },
        { id: 'evo_money_2', name: 'Sức Mạnh Đồng Tiền', desc: 'Mọi nâng cấp giảm 25%. Mỗi 100$ tiêu (tối đa 2500$, tính từ lúc mua) nhận 1 mốc thưởng vĩnh viễn: HP, Dame, Đạn, Tốc, Khiên. FULL EVO: mọi mặt hàng giảm 50%, thêm xe tiền trên sân, 3 xe tấn công mỗi 5s (mạnh hơn).', cost: 120, type: 'evo' }
    ],
    tank: [
        { id: 'evo_tank_1', name: 'Không Thể Cản Phá', desc: 'Lao húc x1.5 dame, không bị phản chấn khi tông tường/vật thể, khi lao chỉ nhận 20% sát thương', cost: 100, type: 'evo' }, // UPDATE COST
        { id: 'evo_tank_2', name: 'Tàn Phá!!!', desc: 'Húc nổ lan + băng (khi còn khiên) + Hồi khiên nội tại nhanh hơn (6s -> 4s, Full Evo 2s, +15 HP)', cost: 45, type: 'evo' } // UPDATE DESC
    ],
    ice: [
        { id: 'evo_ice_1', name: 'Bão Tuyết', desc: 'Mỗi 3 lần kích hoạt -> Tạo vùng Băng Cực Đại', cost: 100, type: 'evo' }, // UPDATE DESC
        { id: 'evo_ice_2', name: 'Hàn Băng', desc: 'x1.5 Dame lên kẻ bị chậm, Vùng băng gây dame', cost: 60, type: 'evo' }
    ],
    big_bullet: [
        { id: 'evo_big_1', name: 'To Hơn Nữa', desc: 'Đạn siêu to khổng lồ (gấp đôi: 32px). Full Evo: sau lần nảy đầu đạn hóa Xuyên Thấu (xuyên vật cản, vẫn trúng địch), không nảy nữa mà tan ở giữa sân', cost: 20, type: 'evo' },
        { id: 'evo_big_2', name: 'Bóng Cao Su', desc: 'Đạn nảy lại khi chạm tường. Full Evo: đạn kết thúc/bị phá sẽ nổ thành vòng mảnh đạn 360° (chỉ hại địch)', cost: 100, type: 'evo' }
    ],
    shotgun: [
        { id: 'evo_shot_1', name: 'Mưa Đạn', desc: 'Tỏa 6 viên; ngay sau mỗi phát bắn thêm đợt 2 gồm 3 viên tụm giữa', cost: 45, type: 'evo' },
        { id: 'evo_shot_2', name: 'Đạn Dự Phòng', desc: 'Băng đạn 4 viên', cost: 30, type: 'evo' }
    ],
    overload: [
        { id: 'evo_over_1', name: 'Thanh Năng Lượng Phụ', desc: '+1 thanh phụ, nạp sau khi thanh chính đầy. Đầy -> trữ 2 Đạn Sạc, bắn liền 2 phát.', cost: 50, type: 'evo' },
        { id: 'evo_over_2', name: 'Vụ Nổ EMP', desc: 'Đạn Sạc nổ phát vòng EMP rộng hơn vụ nổ: không gây dame nhưng Câm Lặng địch 2s & đóng băng trụ/drone/robot/bẫy/xe... của địch 2s (đứng im, không bắn, không di chuyển). Trúng EMP vào CHỦ -> TOÀN BỘ vật triệu hồi của chủ cũng bị đóng băng. FULL EVO (Lõi Tứ Quá Tải): +4 thanh phụ (5 thanh nạp đồng thời), vụ nổ & vòng EMP to hơn hẳn.', cost: 60, type: 'evo' }
    ],
    smg: [
        { id: 'evo_smg_1', name: 'Hỏa Lực +++', desc: 'Sấy càng lâu: Dame tăng (tối đa +0.5), Tốc bắn tăng gấp đôi, Đạn bay nhanh. Băng 22 viên, dame gốc ×0.9.', cost: 80, type: 'evo' },
        { id: 'evo_smg_2', name: 'Băng Đạn X', desc: 'Băng 30 viên, nạp băng 1.2s. FULL EVO: nạp 0.8s, 6 viên đầu mỗi băng xuyên thấu.', cost: 120, type: 'evo' } // Đã tăng giá lên 60
    ],
    lazer_charge: [
        { id: 'evo_lazer_c_1', name: 'Pháo Diệt Tinh', desc: 'Tia Xuyên Phá to gấp 3, lưu ảnh 2s', cost: 150, type: 'evo' },
        { id: 'evo_lazer_c_2', name: 'Năng Lượng Xanh', desc: 'Tự Nạp nhanh hơn (4s), đạn thường nạp 0.4s/viên. FULL EVO: Tự Nạp 3.5s, Tia Xuyên Phá HẠ GỤC NGAY bất kể máu & xuyên khiên.', cost: 50, type: 'evo' }
    ],
    lazer_auto: [
        { id: 'evo_lazer_a_1', name: 'Xuyên Phá', desc: 'Laser bay cực nhanh, nhịp bắn tối đa 0.13s/tia. FULL EVO: mỗi tia chỉ +7% Nhiệt, Quá Nhiệt chỉ 0.8s.', cost: 30, type: 'evo' },
        { id: 'evo_lazer_a_2', name: 'Phá Hủy', desc: 'Dame ×1.5, laser to hơn, Nóng Đỏ từ 50% Nhiệt.', cost: 45, type: 'evo' }
    ],
    rocket: [
        { id: 'evo_rocket_1', name: 'Đầu Đạn Hạt Nhân', desc: 'Vùng nổ siêu rộng + Phóng xạ', cost: 220, type: 'evo' },
        { id: 'evo_rocket_2', name: 'Đầu Đạn Lớn', desc: 'Tăng dame nổ + Phạm vi', cost: 40, type: 'evo' }
    ],
    portal: [
        { id: 'evo_portal_1', name: 'Cổng Cường Hóa', desc: 'Dịch chuyển nhận đạn nổ. Mỗi 6s tự mở 2 Cổng Bắn trên sân, mỗi cổng nhắm & bắn 3 viên vào kẻ thù. Đi xuyên mép màn hình -> hồi chiêu mở cổng ngay. FULL EVO: mở x3 cổng (6 cổng).', cost: 55, type: 'evo' },
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
        { id: 'evo_acid_1', name: 'Bào Mòn', desc: 'Vùng Ăn Mòn rộng hơn & tồn tại lâu hơn, tốc độ rút HP / Max HP gấp đôi.', cost: 40, type: 'evo' },
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
        { id: 'evo_aaa_1', name: 'Nhắm Đánh Dấu', desc: 'Pháo kích tự ghim mục tiêu. Tự bắn thường: 3 tia liên tiếp. Pháo kích nổ bồi 1 lần tại chỗ (có cảnh báo, 50% dame). FULL EVO: nổ bồi 2 lần.', cost: 80, type: 'evo' },
        { id: 'evo_aaa_2', name: 'Mưa Tên Lửa', desc: 'Tự bắn -> Rơi 3 bom ngẫu nhiên trên làn địch. Pháo kích nổ bồi 1 lần tại chỗ (có cảnh báo, 50% dame). FULL EVO: nổ bồi 2 lần, nổ nhanh hơn.', cost: 100, type: 'evo' }
    ],
    blade_god: [
        { id: 'evo_blade_1', name: 'Kiếm Thế Vô Chủ', desc: 'Quang Kiếm tự rải ngẫu nhiên trên sân. Nội tại Quang Kiếm Loạn Ảnh: mỗi 10s 1 Quang Kiếm VIP bay quanh xe 3s, lao tới chém tan mọi loại đạn bay. Full Evo: Quang & Ám Kiếm tự xuất hiện, lơ lửng 2s rồi tự phóng; 2 nội tại mạnh hơn.', cost: 150, type: 'evo' },
        { id: 'evo_blade_2', name: 'Kiếm Thể Phòng Hộ', desc: 'Ám Kiếm tạo hố đen hút mạnh rồi hút yếu về tâm. Nội tại Ám Kiếm Tuyệt Diệt: mỗi 10s mưa kiếm cảnh báo 0.5s rơi xuống địch; sau 3s 1 Ám Kiếm VIP khổng lồ cảnh báo 1.25s rồi giáng, cắm 2s hút + gây sát thương.', cost: 150, type: 'evo' }
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
        { id: 'evo_sniper_1', name: 'Tường Thép', type: 'evo', desc: 'Tường HP x5. Đạn Sniper đi qua tường phe mình KHÔNG bị giảm sát thương. Full Evo: tường dài & cứng hơn (HP x7), không tự mục, bất tử 2s đầu, đạn phe mình không làm hại tường.', cost: 80 },
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
        { id: 'evo_thun_1', name: 'Phá Sấm', desc: 'Nổ tường & Lôi Trảm gây Choáng 0.75s (1 lần mỗi chuỗi); càng gom nhiều thương, nhát Lôi Trảm chính càng to & mạnh; nhát chém cuối Lôi Độn gây Choáng 0.5s. Full Evo: Thiên Lôi Giáng để lại Lôi Vực & sét trời ngẫu nhiên đánh nửa sân địch mỗi 4-6s.', cost: 90, type: 'evo' },
        { id: 'evo_thun_2', name: 'Rẽ Mây', desc: 'Mỗi nhát Lôi Trảm, mọi cây thương còn lại trên sân chém phụ (có cảnh báo, 1/2 sát thương). Thiên Kiếp kéo dài 8s & 3 lần miễn nhiễm sát thương. Full Evo: chém phụ = sát thương nhát chính.', cost: 110, type: 'evo' }
    ],
    magnet: [
        { id: 'evo_mag_net_1', name: 'Từ Trường Tăng Cường', desc: 'Giật điện từ trường gây 0.5 dame (x2); Lướt Cực Tính: húc 1.5 dame, nổ cột 2 dame.', cost: 90, type: 'evo' },
        { id: 'evo_mag_net_2', name: 'Lưới Từ Cực', desc: 'Tối đa 3 Cột Từ Trường, lực hút/đẩy x1.5. FULL EVO: 4 cột, bán kính từ trường lớn hơn, đảo cực giật kẻ địch lại gần.', cost: 110, type: 'evo' }
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
        { id: 'evo_cu_1', name: 'Gói VIP', desc: 'Mọi mô-đun đã lắp lên +1 cấp ngay, +2 Điểm Tùy Chỉnh, cấp tối đa +1. Mở mô-đun VIP: Tự Ngắm, Đạn Hút (kéo & làm chậm), Nảy Tường (bắn chéo, +dame mỗi lần nảy).', cost: 80, type: 'evo' },
        { id: 'evo_cu_2', name: 'Cá Nhân Hóa', desc: 'Nổ, Vũng, Hút Máu, Đạn Hút, Nảy Tường, Tiến Công mạnh hơn 30%. +1 Điểm Tùy Chỉnh mỗi hiệp. FULL EVO: chọn miễn phí 1 Nội Tại Độc Quyền (Hồi Sinh, Vô Ảnh, Tập Trung, Phản Lực).', cost: 110, type: 'evo' }
    ],
    kiem_su: [
        { id: 'evo_ks_1', name: 'Điều Tức Chuyển Khí', desc: 'Cường hóa mọi nguyên tố. Giữ Bắn 0.25s: đổi chỗ viên đạn hiện tại và viên kế tiếp (trùng màu thì tự đổi màu).', cost: 90, type: 'evo' },
        { id: 'evo_ks_2', name: 'Ngũ Hành Giao Thoa', desc: '2 phi kiếm liên tiếp tạo phản ứng: Đồng nguyên tố / Tương sinh / Tương khắc (15 phản ứng). FULL EVO: mỗi phát kèm 2 kiếm hộ tống, phản ứng mạnh hơn.', cost: 120, type: 'evo' }
    ],
    revolver: [
        { id: 'evo_rev_1', name: 'Đạn Độc Đắc', desc: 'Viên 1-5 có 50% Nổ khi trúng đích. Viên thứ 6 luôn Nổ lớn và gây Choáng.', cost: 90, type: 'evo' },
        { id: 'evo_rev_2', name: 'Rút Súng Thần Tốc', desc: 'Nạp ổ còn 0.9s. Bắn điểm xạ trúng 6/6 -> hồi đầy ổ ngay + 1 dame cho ổ kế tiếp. Quạt Cò trúng >= 50% -> hồi đầy ổ. FULL EVO: Ổ Đạn Ngũ Sắc (viên 1-2 Chậm, 3-4 Chảy Máu, 5 Choáng 0.3s, 6 Chí Mạng x2.5), nạp nhanh hơn nữa, Quạt Cò Song Lục (gấp đôi đạn) & mọi đạn quạt đều Xuyên Thấu.', cost: 110, type: 'evo' }
    ],
    dj: [
        { id: 'evo_dj_1', name: 'Cảm Âm Dung Sai', desc: 'Được bấm sai / lỡ nhịp tối đa 3 lần mới mất chuỗi Combo. Hồi lại đủ 3 lượt bảo hộ sau mỗi 30 Combo.', cost: 90, type: 'evo' },
        { id: 'evo_dj_2', name: 'Giai Điệu Thăng Hoa', desc: 'Sóng Âm mở khóa theo Combo: 15 Xuyên Thấu, 30 Phát Nổ, 60 để lại Vùng Âm Nhiệt (thiêu đốt + làm chậm), 120 hóa tia Hitscan. FULL EVO: vào hiệp sẵn 30 Combo, bấm chuẩn Combo x2, buff mạnh hơn; sai 6 lần, lần thứ 6 tự đánh chuẩn; 2 Loa nổi bắn sóng phụ mỗi nhịp; mở Bản Nhạc Huyền Thoại (rất nhanh, dày đặc Nốt Đôi - thử thách cực hạn).', cost: 120, type: 'evo' }
    ],
    steel_hook: [
        { id: 'evo_hook_1', name: 'Tời Thủy Lực', desc: 'Đu dây & kéo nhanh hơn. Tụ lực tối đa 15 lần nảy (mạng nhện xích kín bản đồ).', cost: 125, type: 'evo' },
        { id: 'evo_hook_2', name: 'Quặp Sắt Trọng Lực', desc: 'Đầu móc to gấp rưỡi. Va đập khi kéo địch x2 (+2 dame/vật thể). Mỗi 7s móc phụ tự quặp Xe Tiền/vật thể trên sân rồi ném thẳng vào địch gây nổ lớn. FULL EVO: x2 Máu tối đa, đầu móc máu 100%, tối đa 17 lần nảy, mỗi lần phóng 3 móc cùng lúc (2 móc phụ chỉ có 25% máu, dễ bắn đứt hơn).', cost: 150, type: 'evo' }
    ],
    flower_shadow: [
        { id: 'evo_flw_1', name: 'Hoa Ảnh Song Hành', desc: 'Thanh Hoa hồi nhanh hơn mạnh. Tối đa 24 cánh Khai trên sân. Kho Hoa mở rộng 200% (phần trên 100% chỉ nạp được bằng thu hồi cánh hoa). Bách Hoa Nở Rộ chỉ cần tiêu hao 50% Hoa. 1 Bóng Hoa đi theo đường cũ của bạn, lặp lại Vũ Điệu bạn vừa múa sau 3 giây.', cost: 100, type: 'evo' },
        { id: 'evo_flw_2', name: 'Hương Sắc Tuyệt Trần', desc: 'Khai: cánh hoa nằm nghỉ tỏa phấn làm chậm. Phá: chém nát đạn thường của địch trên đường lướt. Thiên: hút & làm chậm mạnh hơn, +1 dame. FULL EVO: không giới hạn cánh Khai, cánh nằm nghỉ 2s rồi thu về, Kho Hoa tự hồi tới 200% và thu hồi cánh nạp được tới 300%, cánh bay ra xuyên vật cản (lượt thu về vẫn bị chặn), Bách Hoa Nở Rộ trọn vẹn (Khai 5 cánh x1.5, Phá 2 bản sao, Ngôi Sao Trảm 2s); hoa rơi khắp màn hình, định kỳ hoa tự ngắm lao vào địch, mọi Vũ Điệu mạnh hơn, thêm Bóng Hoa thứ hai trễ 5s.', cost: 120, type: 'evo' }
    ],
    kiem_vu: [
        { id: 'evo_kv_1', name: 'Tâm Nhãn', desc: 'Tâm Định đầy nhanh hơn (0.8s, vẫn chờ 1.25s sau khi dùng kỹ năng), +50% Sát Ý mỗi lần phản đạn. Bản Mệnh Kiếm cắm trên sân địch tỏa kiếm khí làm chậm đối thủ đi ngang qua.', cost: 100, type: 'evo' },
        { id: 'evo_kv_2', name: 'Lưu Thủy Phản Chiếu', desc: 'Tập Trung kéo dài 1.0s. Đạn phản bay thẳng chuẩn xác về phía địch. Vẫn điều khiển Bản Mệnh Kiếm khi đang Tập Trung. FULL EVO (Vạn Kiếm Quy Tâm): kiếm bay nhanh hơn, dame x1.15 + Chảy Máu; đi ngang chậm khi Tập Trung; mỗi 5 lần Điều Kiếm, lần kế tiếp triệu hồi 4 Kiếm Phụ tấn công rồi tự thu về.', cost: 120, type: 'evo' }
    ],
    t_zero: [
        { id: 'evo_tzero_1', name: 'Năng Lượng Xanh', desc: 'Hồi NL nhanh hơn mạnh (sau 1s nghỉ). Giảm mọi tiêu hao: Ném khiên 3%, Phản đạn 10% + dame×7%, Đấm 7%, Bay lên 18% và duy trì 6%/s (vẫn gấp đôi mỗi 2.5s bay).', cost: 90, type: 'evo' },
        { id: 'evo_tzero_2', name: 'Trạng Thái Hủy Diệt', desc: 'THỦ: khiên to & nhanh hơn, để lại vệt điện làm chậm. CÔNG: cú đấm tạo sóng xung kích nổ lan phía trước & phá đạn địch trên đường lao. THIÊN: dội pháo dày hơn, đáp xuống để lại vùng từ trường đốt máu & hút địch. FULL EVO: định kỳ phóng tên lửa tầm nhiệt bay RẤT chậm, rẽ nhẹ (né được; đạn địch bắn hạ được) và tên lửa KHÔNG KÍCH vút lên trời, hiện ra ở cạnh trái/phải mục tiêu rồi bay chậm dọc làn tới vòng cảnh báo (2s, thấy rõ đường bay) mới cắm xuống; THỦ: khi khiên đang bay tự xả Tiểu Liên (1% NL/s).', cost: 120, type: 'evo' }
    ],
    raven_oca: [
        { id: 'evo_raven_1', name: 'Chiến Thuật Đặc Nhiệm', desc: 'Đạn Răng Cưa: mọi viên đạn (cả 2 súng) gây Chảy Máu. Khói Đặc Quánh: Bom Khói +2s (4s). Bộ Pháp Xung Kích: cầm Tiểu Liên tăng mạnh tốc độ. Thay Đạn Tức Thì: đổi súng là nạp đầy băng súng mới.', cost: 100, type: 'evo' },
        { id: 'evo_raven_2', name: 'Hỏa Lực Không Kích', desc: 'Oca máu 80% Raven & định kỳ hiện vòng cảnh báo đỏ rồi thả Bom xuống địch. Tiểu Liên xả loạt 5 viên, băng 15. Sniper bay nhanh hơn, mạnh hơn & gây Trọng Thương: máu bị mất do Sniper không thể hồi trong 10s. FULL EVO: Oca Bất Tử (không bị tiêu diệt, không chặn đạn), đổi súng hồi 2s, Oca vừa lao cắn làm chậm vừa thả mưa bom liên hoàn vừa giữ khóa mục tiêu vĩnh viễn cho cả 2 súng.', cost: 120, type: 'evo' }
    ],
    lazer_beam: [
        { id: 'evo_beam_1', name: 'Năng Lượng Xanh', desc: 'Tích tụ khởi động chỉ 0.125s. Chiếu tia tiêu hao chậm hơn, hồi Năng Lượng nhanh hơn.', cost: 40, type: 'evo' },
        { id: 'evo_beam_2', name: 'Khuếch Đại Nhiệt Quang', desc: 'Tia phình rộng dần khi chiếu lâu. Trúng liên tục -> sát thương tăng tiến (tới x2.5) & Thiêu Đốt. FULL EVO: Quá Tải Quang Học — không còn giảm tốc khi chiếu; mỗi 2s chiếu liên tục phóng thêm 1 Tia Bùng Nổ (1.5 dmg).', cost: 90, type: 'evo' }
    ],
    healer: [
        { id: 'evo_heal_1', name: 'Hồi Phục Vượt Ngưỡng', desc: 'Đầy máu: lượng hồi dư chuyển thành Giáp Trắng (tối đa 4 + 50% MaxHP), đỡ đòn trước máu. Đạn Cường Hóa mạnh hơn (65% MaxHP, nổ lan 30%).', cost: 90, type: 'evo' },
        { id: 'evo_heal_2', name: 'Nghịch Lý Y Đạo', desc: 'Mỗi lần được hồi máu (mọi nguồn, kể cả vào Giáp Trắng) phóng 1 Tia Xung tự ngắm gây dame = lượng vừa hồi. Giảm Năng Lượng cần cho Đạn Cường Hóa. FULL EVO: Bất Tử Y Thần — Tái Tạo nhanh gấp đôi (1.5s); đạn gắn ấn Kháng Hồi Phục 5s: địch hồi máu bị cướp sang bạn; Đạn Cường Hóa = 100% MaxHP + dame.', cost: 110, type: 'evo' }
    ],
    chrononeo: [
        { id: 'evo_cn_1', name: 'Bước Thời Gian', desc: 'Thời Khắc chỉ cần giữ thế 2.5s. Đổi Thế Hoàn Hảo: đổi thế trong 3s sau đòn Thời Khắc -> băng thế mới nạp đầy ngay; nếu đang có Ảnh Chiếu -> hoán đổi vị trí với nó.', cost: 100, type: 'evo' },
        { id: 'evo_cn_2', name: 'Dòng Chảy Hội Tụ', desc: 'Đầu hiệp +3 đạn Chrono / +6 đạn Neo; điểm Thời Đại từ thùng & xe tiền x2. Liên Xạ +4 viên, viên cuối nổ choáng 0.5s. Mưa Đạn bắn 2 đợt, Ảnh Chiếu 8s bắn đạn làm chậm. FULL EVO: Liên Hoa Thời Gian — băng tối đa ngay (10/20), đổi thế hồi 2s; Phân Thân Nghịch Đảo (AI cầm thế ngược trên làn bạn, đổi thế đồng bộ kèm hiệu ứng); cứ 2 lần Thời Khắc -> 4s bão đạn Liên Hoa rồi đại pháo Nở Rộ phủ kín sân địch.', cost: 120, type: 'evo' }
    ],
    gemini: [
        { id: 'evo_gem_1', name: 'Liên Kết Thần Kinh', desc: 'AI phối hợp: giữ giãn cách tránh nổ lan, bắn ép góc, ưu tiên chạy lại cứu bạn (bám vòng cứu). Chuyển Giao hồi chỉ 1.2s; thanh cứu không bị tụt khi rời vòng. Vòng cứu rộng +50%; lần cứu đầu tiên mỗi hiệp chỉ 1s và không tính nhân đôi.', cost: 90, type: 'evo' },
        { id: 'evo_gem_2', name: 'Đệ Quy Vô Tận', desc: 'Cả 2 xe tăng dần tốc chạy & tốc bắn theo thời gian giao tranh; mỗi hiệp đã qua cộng dồn +0.25 MaxHP, +6% dame, đạn to hơn (tối đa 8 tầng). Sau Chuyển Giao: 1s cả 2 xe +50% tốc chạy, x1.8 tốc bắn, x1.3 dame. FULL EVO: Siêu Trí Tuệ Song Hành — AI tối thượng (tự cân đối cứu / kết liễu); lần gục đầu tiên của mỗi xe tự khởi động lại, các lần sau thanh cứu tự tăng tới 99% (chạm là dậy); 0.5s sau Chuyển Giao mọi đạn của 2 xe tự khoá mục tiêu.', cost: 120, type: 'evo' }
    ],
    blood_lord: [
        { id: 'evo_bd_1', name: 'Huyết Ảnh Đào Thoát', desc: 'Tích Bể Máu nhanh hơn (x1.4). Khi nhận sát thương chí tử: hóa dơi dịch chuyển sang vị trí khác, Bất Tử 2s và hồi ngay 50% Bể Máu (1 lần/hiệp).', cost: 90, type: 'evo' },
        { id: 'evo_bd_2', name: 'Huyết Thể Cường Hóa', desc: '+4 Max HP (Bể Máu x2 theo). Kỹ năng mạnh hơn x1.25, chỉ tốn 0.5 HP. Tự hồi máu sau 6s với tỉ lệ 1.5 Bể Máu = 1 HP. FULL EVO: Huyết Tổ Bất Diệt — thêm +2 Max HP, kỹ năng x1.5, chỉ tốn 0.25 HP, tích Bể Máu x2 (kẻ địch hồi máu cũng nạp); Đào Thoát hồi 100% Bể Máu; tự hồi sau 4s (1 Bể Máu = 1 HP); HỒI SINH tại chỗ 1 lần/trận khi chết lúc Bể Máu đầy.', cost: 120, type: 'evo' }
    ],
};
