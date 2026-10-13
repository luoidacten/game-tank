// ==========================================
// Dữ liệu Body / Module
// ==========================================



// --- MODULES & DATA ---
const MODULES = {
    BODY: [
        { id: 'basic', name: 'Cơ Bản', desc: 'HP:8 | Dame:1 | Đạn:8', type: 'body', size: { w: 30, h: 30 }, stats: { hp: 8, dmg: 1, ammo: 8 } },
        { id: 'money_tank', name: 'Xe Tiền', desc: 'HP:1 | Dame:1 | Đạn:2 (Evo: Nâng cấp toàn diện)', type: 'body', size: { w: 28, h: 28 }, stats: { hp: 1, dmg: 1, ammo: 2 } },
        { id: 'tank', name: 'Xe TANK', desc: 'HP:10 (+5 máu xe lớn) | Dame:3 | Tốc: Chậm (Lao húc)', type: 'body', size: { w: 38, h: 38 }, stats: { hp: 10, dmg: 3, ammo: 0 } },
        { id: 'ice', name: 'Pháo Băng', desc: 'HP:5 | Dame:1 | Đạn:5 (Làm chậm)', type: 'body', size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 1, ammo: 5 } },
        { id: 'big_bullet', name: 'Đạn Lớn', desc: 'HP:5 | Dame:2 | Đạn:2. Nảy tường phình to & tăng dame.', type: 'body', size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 2, ammo: 2 } },
        { id: 'shotgun', name: 'Shotgun', desc: 'HP:3.5 | Dame:0.5 | Đạn:2 (3 tia)', type: 'body', size: { w: 26, h: 26 }, stats: { hp: 3.5, dmg: 0.5, ammo: 2 } },
        { id: 'overload', name: 'Cuộn Quá Tải', desc: 'HP:5 | Dame:1.2-12 (Tự tụ) | Đạn:6. Đạn sạc nổ xung kích điện.', type: 'body', size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 1.2, ammo: 6 } },
        { id: 'smg', name: 'Tiểu Liên', desc: 'HP:4 | Dame:0.75 | Đạn:12 (Lắc)', type: 'body', size: { w: 24, h: 24 }, stats: { hp: 4, dmg: 0.5, ammo: 12 } },
        { id: 'lazer_charge', name: 'Lazer Xuyên Phá', desc: 'HP:2 | Dame:8 (Tụ full)', type: 'body', size: { w: 30, h: 30 }, stats: { hp: 2, dmg: 0.25, ammo: 20 } },
        { id: 'lazer_auto', name: 'Lazer Pháo', desc: 'HP:4 | Dame:1 | Đạn:6 (Xuyên)', type: 'body', size: { w: 30, h: 30 }, stats: { hp: 4, dmg: 1, ammo: 6 } },
        { id: 'rocket', name: 'Pháo Tên Lửa', desc: 'HP:5 | Dame:2 (Nổ lan) | Đạn:3', type: 'body', size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 2, ammo: 3 } },
        { id: 'portal', name: 'Cổng Không Gian', desc: 'HP:5 | Dame:1 | Đạn:7 (Dịch chuyển)', type: 'body', size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 1, ammo: 7 } },
        { id: 'wind_slash', name: 'Phong Trảm', desc: 'HP:4 | Tụ lực bắn Kiếm Khí (Phá đạn)', type: 'body', size: { w: 30, h: 30 }, stats: { hp: 4, dmg: 1, ammo: 1 } },
        { id: 'storm', name: 'Cuồng Phong', desc: 'HP:3.5 | Tự tụ lực 14s -> Lao & Chém Tròn (Phản đạn)', type: 'body', size: { w: 30, h: 30 }, stats: { hp: 3.5, dmg: 2, ammo: 0 } },
        { id: 'acid', name: 'Axit Hóa', desc: 'HP:4 | Dame:0.5 | Đạn:1. Ăn mòn Max HP (Max HP<=1 nhận 4 Dame). Đạn tạo vùng', type: 'body', size: { w: 30, h: 30 }, stats: { hp: 4, dmg: 0.5, ammo: 1 } },
        { id: 'engineer', name: 'Kỹ Sư', desc: 'HP:3 (+2 máu xe lớn) | Dame:0.5 | Đạn:2. Tự tạo Ụ Thường. Giữ 1s đặt Ụ Thông Minh.', type: 'body', size: { w: 34, h: 34 }, stats: { hp: 3, dmg: 0.5, ammo: 2 } },
        { id: 'ghost', name: 'Ghost', desc: 'HP:2.5 | Tốc: Rất Nhanh | Đạn:4. Vô Ảnh 2s (CD 3s). Tàn Ảnh phân thân.', type: 'body', size: { w: 24, h: 24 }, stats: { hp: 2.5, dmg: 1.75, ammo: 4 } },
        { id: 'aaa', name: 'Pháo Cao Xạ', desc: 'HP:5 (+4 máu xe lớn) | Tốc: Chậm | Dame:2. Pháo Kích (1.5s nổ) + Xả nhanh khi có đạn.', type: 'body', size: { w: 37, h: 37 }, stats: { hp: 5, dmg: 2, ammo: 1 } },
        { id: 'blade_god', name: 'Kiếm Tôn', desc: 'HP:5 | Dame:1.5 | Đạn:4. Luân phiên: Anh Minh (Hitscan), Hư Vô (Nổ+Câm lặng). Nhát thứ 10: Phá Thiên Kiếm.', type: 'body', size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 1.5, ammo: 4 } },
        { id: 'van_kiem', name: 'Kiếm Trận', desc: 'HP:3.5 | Dame:0.25 | Đạn: Vô Hạn. Tự gọi kiếm. Giữ bắn để vào Kiếm Thế.', type: 'body', size: { w: 26, h: 26 }, stats: { hp: 3.5, dmg: 0.25, ammo: 999 } },
        { id: 'water_gun', name: 'Súng Nước', desc: 'HP:4 (+2 máu xe lớn) | Dame:1.5. Đạn: Nội năng (100%). Bấm: Tia nước. Giữ 1s: Laser nước.', type: 'body', size: { w: 34, h: 34 }, stats: { hp: 4, dmg: 1.5, ammo: 0 } },
        { id: 'furnace', name: 'Lò Nung', desc: 'HP:6 (+3 máu xe lớn) | Chậm | Dame:0.25. Đạn: Nội năng. Gây Đốt. 5 stack Đốt -> Nổ 5 dame.', type: 'body', size: { w: 36, h: 36 }, stats: { hp: 6, dmg: 0.25, ammo: 0 } },
        { id: 'am_duong_su', name: 'Âm Dương Sư', desc: 'HP:5 | Dame:0.5 | Đạn:4. Luân phiên Âm/Dương chú. Bùa kích nổ nhanh.', type: 'body', size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 0.5, ammo: 4 } },
        { id: 'six_barrel', name: '6 Nòng', desc: 'HP:6 (+3 máu xe lớn) | Dame:0.4 | Đạn: Vô hạn. Bắn liên tục tăng Nhiệt, đi chậm. Quá nhiệt gây câm lặng.', type: 'body', size: { w: 36, h: 36 }, stats: { hp: 6, dmg: 0.4, ammo: 999 } },
        { id: 'the_strongest', name: 'Kẻ Mạnh Nhất', type: 'body', size: { w: 30, h: 30 }, desc: 'HP 1. Dùng Chú Lực vô hiệu sát thương. Nhấp: Lướt (Thương). Giữ: Hit-scan (Hách). Bị trúng đòn ngắt niệm.', stats: { hp: 1, dmg: 0.5, ammo: 999 } },
        { id: 'sniper', name: 'Sniper', desc: 'HP:3 | Dame:2 | Đạn:5. Tốc chậm. Giữ bắn tạo tường. Xuyên giảm dame. Nạp cả băng.', type: 'body', size: { w: 24, h: 24 }, stats: { hp: 3, dmg: 2, ammo: 5 } },
        {
            id: 'cung',
            name: 'Bow',
            desc: 'HP:3 | Dame:0.5 | Đạn:3 | Tốc: Nhanh. Tụ lực: Tăng sát thương/Tốc đạn. Nội tại Nhạy Bén: Tự né 1 lần đạn mỗi 8s (Full Evo 5s).',
            type: 'body',
            size: { w: 24, h: 24 },
            stats: { hp: 3, dmg: 0.5, ammo: 3, speedMult: 1.25 }
        },
        {
            id: 'mirror',
            name: 'Mirror',
            desc: 'HP:4 | Dame:1 | Đạn:6. Tạo bản sao đối xứng bắn cùng lúc (50% dame). Giữ bắn 1s để hoán đổi vị trí.',
            type: 'body',
            size: { w: 30, h: 30 },
            stats: { hp: 4, dmg: 1, ammo: 6 }
        },
        {
            id: 'sukuna',
            name: 'Vua Đầu Bếp',
            desc: 'HP:7 (+3 máu xe lớn) | Chú Lực tấn công. Giữ bắn Phản Chuyển (+1.25 HP). Bị trúng đòn ngắt niệm Lãnh Địa.',
            type: 'body',
            size: { w: 36, h: 36 },
            stats: { hp: 7, dmg: 3, ammo: 999 }
        },
        {
            id: 'paradox',
            name: 'Paradox',
            desc: 'HP:5 | Dame:1 | Đạn:5. Có bóng đi sau 3s. Giữ ngắn (0.33s) tua ngược & tự xả đạn lặp lại (CD: 12s/7s).',
            type: 'body',
            size: { w: 30, h: 30 },
            stats: { hp: 5, dmg: 1, ammo: 5 }
        },
        {
            id: 'magician',
            name: 'Nhà Ảo Thuật',
            desc: 'HP:3.5 | Dame:1.5 | Rất Nhanh | Đạn:7. Giữ bắn+Đi: Lướt, Khiên, Tàng hình. Giữ bắn+Đứng: Khiên & Vô địch. Giữ 1s: Hoán đổi & Khiên.',
            type: 'body',
            size: { w: 26, h: 26 },
            stats: { hp: 3.5, dmg: 1.5, ammo: 7, speedMult: 1.35 }
        },
        {
            id: 'inventor',
            name: 'Nhà Phát Minh',
            desc: 'HP:2 | Tốc: 0.8x | Dame: 0.5 | Đạn: 4. Dùng Linh Kiện (LK) nâng cấp. Sở hữu Drone Không Kích.',
            type: 'body',
            size: { w: 30, h: 30 },
            stats: { hp: 2, dmg: 0.5, ammo: 4, speedMult: 0.8 }
        },
        {
            id: 'shadow_hunter',
            name: 'Shadow Hunter',
            desc: 'HP:2 | Dame:1 | Đạn:6. Vô Hình (Nhấn Bắn: +40% Tốc, +50% Dame, Đòn Cường Hóa). Chảy máu & Chậm.',
            type: 'body',
            size: { w: 24, h: 24 },
            stats: { hp: 2, dmg: 1, ammo: 6, speedMult: 1.3 }
        },
        {
            id: 'shortgunATK',
            name: 'Shortgun',
            desc: 'HP:5 | Dame:2 | Đạn:2. Quét 180px -> Lao áp sát (cách 40px) -> Nón bộc phá 0.5s. Nhấp đúp: x2 đạn & x2 dame. Phá hủy hồi 1 đạn.',
            type: 'body',
            size: { w: 34, h: 34 },
            stats: { hp: 5, dmg: 2, ammo: 2, speedMult: 1.25 }
        },
        {
            id: 'thunder',
            name: 'Sấm Chớp',
            desc: 'HP:2 | Dame:1 | Đạn:0 (3 Lôi Phong Thương). Nhấp: Phóng thương cắm tường nổ AoE. Giữ 0.5-1s: Thu thương. Giữ >1s: Trảm Lôi. Lôi Minh: Raycast toàn map.',
            type: 'body',
            size: { w: 26, h: 26 },
            stats: { hp: 2, dmg: 1, ammo: 0, speedMult: 1.3 }
        },
        {
            id: 'magnet',
            name: 'Nam Châm',
            desc: 'HP:5 | Dame:0.5 | Đạn:6. Đổi Cực Âm/Dương (+/-). Bắn cắm Cột Từ Trường. Hút/Đẩy kẻ địch nhiễm từ. Lướt Cực Tính đâm cột.',
            type: 'body',
            size: { w: 34, h: 34 },
            stats: { hp: 5, dmg: 0.5, ammo: 6, speedMult: 1.0 }
        },
        {
            id: 'evolution',
            name: 'Tiến Hóa',
            desc: 'HP:1 | Dame:1 | Đạn:1 (Thuần Farm). Ăn/Phá Rương cộng vĩnh viễn chỉ số. Rương Giả Mạo (Mimic). Late game bất khả chiến bại.',
            type: 'body',
            size: { w: 30, h: 30 },
            stats: { hp: 1, dmg: 1, ammo: 1, speedMult: 1.0 }
        },
        {
            id: 'death_lock',
            name: 'Trối Chết (DeathLock)',
            desc: 'HP:5 (+2 máu xe lớn) | Dame:0.5 | Đạn:3 | Tốc: 0.8x. Nội tại Ràng Buộc: 4 tầng ấn. Đạn Cấm Chế: Lồng Xích hút & giam giữ.',
            type: 'body',
            size: { w: 34, h: 34 },
            stats: { hp: 5, dmg: 0.5, ammo: 3, speedMult: 0.8 }
        },
        {
            id: 'creator',
            name: 'Kẻ Sáng Tạo',
            desc: 'HP:1 | Dame:0.25 | Đạn:1 | Tốc: 1.0x. Bản Thiết Kế Toàn Năng: Ụ Súng Tự Ngắm (max 2), Khiên Thép Chắn Đạn (5 HP), Drone Không Kích.',
            type: 'body',
            size: { w: 24, h: 24 },
            stats: { hp: 1, dmg: 0.25, ammo: 1, speedMult: 1.0 }
        },
        {
            id: 'necromancer',
            name: 'Chiêu Hồn Sư',
            desc: 'HP:1 | Dame:1 | Đạn:1 | Tốc: 0.8x. Linh Minh Hộ Thể: Khởi đầu 6 Linh Hồn (Linh Giáp đỡ đòn). Tụ lực phím Bắn triệu hồi 3 mốc Vong Linh.',
            type: 'body',
            size: { w: 32, h: 32 },
            stats: { hp: 1, dmg: 1, ammo: 1, speedMult: 0.8 }
        },
        {
            id: 'genius',
            name: 'Thiên Tài',
            desc: 'HP:1 | Dame:1 | Đạn:1 | Tốc: 1.3x. Thu thập Bánh Răng & Linh Kiện. Mở Chợ Đen nâng cấp Robot. Đủ Bánh Răng nhấn giữ để trực tiếp Lái Mecha!',
            type: 'body',
            size: { w: 24, h: 24 },
            stats: { hp: 1, dmg: 1, ammo: 1, speedMult: 1.3 }
        },
        {
            id: 'kiem_khach',
            name: 'Kiếm Khách',
            desc: 'HP:2 | Dame:1 | Đạn:3. Bắn phi kiếm. Mất khiên -> Tập Trung 3s (né mọi đòn). Mỗi hiệp nhận Bài Tập Luyện Kiếm để tăng sức mạnh vĩnh viễn.',
            type: 'body',
            size: { w: 30, h: 30 },
            stats: { hp: 2, dmg: 1, ammo: 3, speedMult: 1.0 }
        },
        {
            id: 'sprayer',
            name: 'Bình Phun',
            desc: 'HP:5 (+2 xe lớn) | Năng lượng. Nhấp: Bật/Tắt phun hình nón. Giữ 0.5s: đổi chất Lửa/Axit/Băng. Lớp phủ đầy 100% -> Nổ / Câm Lặng / Đóng Băng. Vật cản chặn luồng phun.',
            type: 'body',
            size: { w: 34, h: 34 },
            stats: { hp: 5, dmg: 0, ammo: 0, speedMult: 0.825 }
        },
        {
            id: 'customize',
            name: 'Tùy Biến',
            desc: 'HP:3 | Dame:1 | Đạn:1. Xe lắp ghép: mỗi hiệp nhận Điểm Tùy Chỉnh để lắp Lối Bắn, Dạng Đạn, Tính Chất Đạn, Kích Thước. Thua liên tiếp nhận thêm điểm.',
            type: 'body',
            size: { w: 30, h: 30 },
            stats: { hp: 3, dmg: 1, ammo: 1, speedMult: 1.0 }
        },
        {
            id: 'kiem_su',
            name: 'Kiếm Sư',
            desc: 'HP:4 | Dame:1 | Đạn:5 | Tốc: 1.1x. Ngũ Hành: mỗi phi kiếm mang 1 nguyên tố ngẫu nhiên (Kim tiền, Mộc trói, Hỏa nổ, Thổ dựng đá, Thủy hồi máu).',
            type: 'body',
            size: { w: 28, h: 28 },
            stats: { hp: 4, dmg: 1, ammo: 5, speedMult: 1.1 }
        },
    ],
    FEET: [
        { id: 'speed', name: 'Động Cơ', desc: 'Tăng tốc độ di chuyển.', type: 'feet', cost: 30 },
        { id: 'armor', name: 'Giáp Thép', desc: '+1 Máu tối đa.', type: 'feet', cost: 15 },
        { id: 'damage', name: 'Bánh Xích', desc: 'x1.25 Sát thương.', type: 'feet', cost: 20 },
        { id: 'interest', name: 'Lợi Tức', desc: 'Sau mỗi round: +30$ (Xe Tiền +60$). Cộng dồn.', type: 'feet', cost: 10 }
    ]
};
