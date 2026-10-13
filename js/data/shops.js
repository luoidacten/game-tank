// ==========================================
// Dữ liệu cửa hàng riêng (Chợ Đen Thiên Tài, Shop Nhà Phát Minh)
// ==========================================



// --- DATA CHỢ ĐEN ROBOT ĐỘC QUYỀN CHO THIÊN TÀI (GENIUS) ---
const GENIUS_BLACK_MARKET = [
    { id: 'gen_hp', name: 'Gia Cố Thân Vỏ', desc: '+3 Máu Robot' },
    { id: 'gen_dmg', name: 'Lõi Xung Kích', desc: '+0.25 Sát Thương Robot' },
    { id: 'gen_energy', name: 'Pin Lượng Tử', desc: '+15 Năng Lượng Tối Đa' },
    { id: 'gen_speed', name: 'Động Cơ Turbo', desc: '+15% Tốc Độ Di Chuyển Robot' },
    { id: 'gen_regen', name: 'Tụ Điện Phục Hồi', desc: '+1 Năng Lượng Hồi Phục/s' },
    { id: 'gen_slow', name: 'Đạn Hàn Băng', desc: 'Đạn làm chậm đối thủ 40% trong 2s' },
    { id: 'gen_fire', name: 'Đạn Nhiệt Hạch', desc: 'Đạn gây thiêu đốt trong 3s' },
    { id: 'gen_explosive', name: 'Ngòi Nổ Phá Khối', desc: 'Tăng 50% bán kính nổ đạn' },
    { id: 'gen_shield', name: 'Lá Chắn Khởi Đầu', desc: 'Bắt đầu trận có 1 lớp khiên chặn 1 đòn' }
];

// --- DATA SHOP ĐỘC QUYỀN CHO INVENTOR ---
const INVENTOR_SHOP = [
    // Nhóm 1: Bản thân xe
    { id: 'inv_bodam', name: 'Bộ Đàm', desc: 'Tốc chạy +10%, Drone hồi sinh nhanh hơn 0.5s.', cost: 1, type: 'body', maxLvl: 3 },
    { id: 'inv_giap', name: 'Giáp Hợp Kim', desc: '+1 Max HP. Nhặt Crate nhận Giáp Ảo tồn tại 5s.', cost: 3, type: 'body', maxLvl: 1 },
    { id: 'inv_tangcuong', name: 'Tăng Cường HT', desc: '+2 Đạn. Đạn chủ thừa hưởng hiệu ứng của Drone.', cost: 5, type: 'body', maxLvl: 1 },
    { id: 'inv_luoidien', name: 'Lưới Điện', desc: 'Đứng yên 2s tạo lưới chặn đạn -> 1 LK (CD: 12s).', cost: 4, type: 'body', maxLvl: 1 },
    { id: 'inv_epxung', name: 'Ép Xung', desc: 'Giữ S: Câm lặng mình 4s, Drone +50% tốc, x2 tốc bắn (CD: 15s).', cost: 5, type: 'body', maxLvl: 1 },
    // Nhóm 2: Drone
    { id: 'inv_phao', name: 'Pháo Drone', desc: 'Mỗi 3s bắn đạn nổ lan AoE diện rộng.', cost: 2, type: 'drone', maxLvl: 1 },
    { id: 'inv_khien', name: 'Khiên Chắn', desc: 'Drone hồi 1 Khiên bảo vệ chủ mỗi 20s.', cost: 5, type: 'drone', maxLvl: 1 },
    { id: 'inv_dan', name: 'Tăng Số Đạn', desc: '+1 viên đạn cho Drone mỗi loạt bắn.', cost: 1, type: 'drone', maxLvl: 3 },
    { id: 'inv_ondinh', name: 'TB Ổn Định', desc: 'Tăng tốc bắn & tốc bay qua lại của Drone.', cost: 1, type: 'drone', maxLvl: 3 },
    { id: 'inv_ngam', name: 'Thiết Bị Ngắm', desc: 'Drone tự ngắm xoay nòng vào kẻ địch.', cost: 3, type: 'drone', maxLvl: 1 },
    { id: 'inv_nhieu', name: 'Nhiễu Sóng', desc: 'Đạn làm chậm, tích 3 hit choáng 1.5s.', cost: 3, type: 'drone', maxLvl: 1 },
    { id: 'inv_hoiphuc', name: 'Bộ Hồi Phục', desc: 'Tự hồi 1 HP cho chủ thể mỗi 5s.', cost: 5, type: 'drone', maxLvl: 1 },
    { id: 'inv_smg', name: 'Drone Tiểu Liên', desc: 'Mỗi 5s xả 12 viên đạn tỏa nón như SMG.', cost: 4, type: 'drone', maxLvl: 1 },
    { id: 'inv_lazer', name: 'Drone Laser', desc: 'Đạn đổi thành Laser xuyên tường & vật thể.', cost: 4, type: 'drone', maxLvl: 1 },
    { id: 'inv_bang', name: 'Drone Pháo Băng', desc: 'Mỗi 4s bắn cầu băng tạo vùng làm chậm.', cost: 4, type: 'drone', maxLvl: 1 },
    { id: 'inv_lua', name: 'Drone Lửa', desc: 'Mỗi 4s bắn cầu lửa tạo vùng thiêu đốt.', cost: 4, type: 'drone', maxLvl: 1 },
    // Nhóm 3: Độc quyền Evo 2
    { id: 'inv_tugio', name: 'Tụ Gió (Evo 2)', desc: 'Mỗi 2s chém nát đạn địch bay tới.', cost: 4, type: 'evo2', maxLvl: 1 },
    { id: 'inv_khien_drone', name: 'Khiên Drone (Evo)', desc: 'Tăng máu, giáp ảo trực tiếp cho Drone.', cost: 2, type: 'evo2', maxLvl: 3 },
    // Nhóm 4: Tối thượng Full Evo
    { id: 'inv_full_evo', name: 'Nâng Cấp Cuối Cùng', desc: 'FULL EVO: 4 Drone (200% chỉ số), giảm 60% CD nòng phụ, xe chủ tích hợp toàn bộ vũ khí!', cost: 15, type: 'fullevo', maxLvl: 1 }
];
