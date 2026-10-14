// ==========================================
// Dữ liệu Body / Module
// ==========================================



// --- MODULES & DATA ---
const MODULES = {
    BODY: [
        { id: 'basic', name: 'Cơ Bản', desc: 'HP:8 | Dame:1 | Đạn:8', type: 'body', role: ['Đối Đầu', 'Sinh Tồn'], size: { w: 30, h: 30 }, stats: { hp: 8, dmg: 1, ammo: 8 } },
        { id: 'money_tank', name: 'Xe Tiền', desc: 'HP:9 | Dame:1.5 | Đạn:2. Farm tiền, mua CẤP ĐỘ trong shop (Cấp 3: Khiên +2 HP, Cấp 4: Xuyên +0.5 dame, Cấp 5: Đạn nổ, Cấp 6: Đế Chế Tiền Tệ). Lợi Tức & tiền nhặt x2.', type: 'body', role: ['Sinh Tồn', 'Đối Đầu'], size: { w: 28, h: 28 }, stats: { hp: 9, dmg: 1.5, ammo: 2 } },
        { id: 'tank', name: 'Xe TANK', desc: 'HP:4.5 (+5 máu xe lớn) | Dame:2.5 | Tốc: Chậm. Nhấn Bắn: Lao húc (1.1x dame, hồi chiêu 2s, tự hồi khiên).', type: 'body', role: ['Đối Đầu', 'Cơ Động'], size: { w: 38, h: 38 }, stats: { hp: 4.5, dmg: 2.5, ammo: 0 } },
        { id: 'ice', name: 'Pháo Băng', desc: 'HP:5 | Dame:1 | Đạn:5 (Làm chậm)', type: 'body', role: ['Kiểm Soát', 'Đối Đầu'], size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 1, ammo: 5 } },
        { id: 'big_bullet', name: 'Đạn Lớn', desc: 'HP:5 | Dame:2 | Đạn:2. Nảy tường phình to & tăng dame.', type: 'body', role: ['Đối Đầu'], size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 2, ammo: 2 } },
        { id: 'shotgun', name: 'Shotgun', desc: 'HP:5.5 | Dame:0.9 | Đạn:2 (3 tia)', type: 'body', role: ['Đối Đầu'], size: { w: 26, h: 26 }, stats: { hp: 5.5, dmg: 0.9, ammo: 2 } },
        { id: 'overload', name: 'Cuộn Quá Tải', desc: 'HP:4.5 | Dame:0.7-12 (Tự tụ) | Đạn:6. Đạn sạc nổ xung kích điện.', type: 'body', role: ['Đối Đầu'], size: { w: 30, h: 30 }, stats: { hp: 4.5, dmg: 0.7, ammo: 6 } },
        { id: 'smg', name: 'Tiểu Liên', desc: 'HP:5 | Dame:0.9 | Đạn:12 (Lắc)', type: 'body', role: ['Đối Đầu'], size: { w: 24, h: 24 }, stats: { hp: 5, dmg: 0.9, ammo: 12 } },
        { id: 'lazer_charge', name: 'Lazer Xuyên Phá', desc: 'HP:4 | Dame:0.5 | Đạn:12 (nạp nhanh 0.6s/viên). Nhấp: đạn thường. Giữ 1.5s rồi nhả: Tia Xuyên Phá 20 dmg - một phát hạ gục (tốn 6 đạn). Full Evo: tia xuyên khiên, nạp 0.25s/viên.', type: 'body', role: ['Đối Đầu'], size: { w: 30, h: 30 }, stats: { hp: 4, dmg: 0.5, ammo: 12 } },
        { id: 'lazer_auto', name: 'Lazer Pháo', desc: 'HP:5 | Dame:1 | Đạn:6 (Xuyên)', type: 'body', role: ['Đối Đầu'], size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 1, ammo: 6 } },
        { id: 'rocket', name: 'Pháo Tên Lửa', desc: 'HP:5 | Dame:1.15 (Nổ lan) | Đạn:3', type: 'body', role: ['Đối Đầu', 'Kiểm Soát'], size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 1.15, ammo: 3 } },
        { id: 'portal', name: 'Cổng Không Gian', desc: 'HP:5 | Dame:1 | Đạn:7 (Dịch chuyển)', type: 'body', role: ['Cơ Động', 'Đối Đầu'], size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 1, ammo: 7 } },
        { id: 'wind_slash', name: 'Phong Trảm', desc: 'HP:4 | Tụ lực bắn Kiếm Khí (Phá đạn)', type: 'body', role: ['Đối Đầu', 'Kiểm Soát'], size: { w: 30, h: 30 }, stats: { hp: 4, dmg: 0.9, ammo: 1 } },
        { id: 'storm', name: 'Cuồng Phong', desc: 'HP:3.5 | Giữ nút tụ lực 3.5s, nhả -> Lao & Chém Tròn (Phản đạn)', type: 'body', role: ['Cơ Động', 'Đối Đầu'], size: { w: 30, h: 30 }, stats: { hp: 3.5, dmg: 2, ammo: 0 } },
        { id: 'acid', name: 'Axit Hóa', desc: 'HP:4 | Dame:0.5 | Đạn:1. Ăn mòn Max HP (Max HP<=1 nhận 4 Dame). Đạn tạo vùng', type: 'body', role: ['Kiểm Soát', 'Đối Đầu'], size: { w: 30, h: 30 }, stats: { hp: 4, dmg: 0.5, ammo: 1 } },
        { id: 'engineer', name: 'Kỹ Sư', desc: 'HP:3 (+2 máu xe lớn) | Dame:0.5 | Đạn:2. Tự tạo Ụ Thường. Giữ 1s đặt Ụ Thông Minh.', type: 'body', role: ['Kiểm Soát', 'Sinh Tồn'], size: { w: 34, h: 34 }, stats: { hp: 3, dmg: 0.5, ammo: 2 } },
        { id: 'ghost', name: 'Ghost', desc: 'HP:2.5 | Tốc: Rất Nhanh | Đạn:4. Vô Ảnh 2s (CD 3s). Tàn Ảnh phân thân.', type: 'body', role: ['Cơ Động', 'Đối Đầu'], size: { w: 24, h: 24 }, stats: { hp: 2.5, dmg: 1.75, ammo: 4 } },
        { id: 'aaa', name: 'Pháo Cao Xạ', desc: 'HP:3.5 (+4 máu xe lớn) | Tốc: Chậm | Dame:1.15 Pháo Kích (1.5s nổ) + Xả nhanh khi có đạn.', type: 'body', role: ['Kiểm Soát', 'Đối Đầu'], size: { w: 37, h: 37 }, stats: { hp: 3.5, dmg: 1.15, ammo: 1 } },
        { id: 'blade_god', name: 'Kiếm Tôn', desc: 'HP:5 | Dame:1.05 | Đạn:4. Luân phiên: Anh Minh (Hitscan), Hư Vô (Nổ+Câm lặng). Nhát thứ 10: Phá Thiên Kiếm.', type: 'body', role: ['Đối Đầu', 'Kiểm Soát'], size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 1.05, ammo: 4 } },
        { id: 'van_kiem', name: 'Kiếm Trận', desc: 'HP:4.5 | Dame:0.6 | Đạn: Vô Hạn. Tự gọi kiếm. Giữ bắn để vào Kiếm Thế.', type: 'body', role: ['Kiểm Soát', 'Đối Đầu'], size: { w: 26, h: 26 }, stats: { hp: 4.5, dmg: 0.6, ammo: 999 } },
        { id: 'water_gun', name: 'Súng Nước', desc: 'HP:4 (+2 máu xe lớn) | Dame:1.5 Đạn: Nội năng (100%). Bấm: Tia nước. Giữ 1s: Laser nước.', type: 'body', role: ['Kiểm Soát', 'Đối Đầu'], size: { w: 34, h: 34 }, stats: { hp: 4, dmg: 1.5, ammo: 0 } },
        { id: 'furnace', name: 'Lò Nung', desc: 'HP:6 (+3 máu xe lớn) | Chậm | Dame:0.25 Đạn: Nội năng. Gây Đốt. 5 stack Đốt -> Nổ 5 dame.', type: 'body', role: ['Đối Đầu', 'Kiểm Soát'], size: { w: 36, h: 36 }, stats: { hp: 6, dmg: 0.25, ammo: 0 } },
        { id: 'am_duong_su', name: 'Âm Dương Sư', desc: 'HP:5 | Dame:0.5 | Đạn:4. Luân phiên Âm/Dương chú. Bùa kích nổ nhanh.', type: 'body', role: ['Kiểm Soát', 'Đối Đầu'], size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 0.5, ammo: 4 } },
        { id: 'six_barrel', name: '6 Nòng', desc: 'HP:6 (+3 máu xe lớn) | Dame:0.4 | Đạn: Vô hạn. Giữ 0.5s khởi động nòng rồi mới bắn (đã quay thì nhấp vẫn bắn). Bắn liên tục tăng Nhiệt, đi chậm. Quá nhiệt gây câm lặng.', type: 'body', role: ['Đối Đầu', 'Sinh Tồn'], size: { w: 36, h: 36 }, stats: { hp: 6, dmg: 0.4, ammo: 999 } },
        { id: 'the_strongest', name: 'Kẻ Mạnh Nhất', type: 'body', role: ['Sinh Tồn', 'Đối Đầu'], size: { w: 30, h: 30 }, desc: 'HP 1. Dùng Chú Lực vô hiệu sát thương. Nhấp: Lướt (Thương). Giữ: Hit-scan (Hách). Bị trúng đòn ngắt niệm.', stats: { hp: 1, dmg: 0.5, ammo: 999 } },
        { id: 'sniper', name: 'Sniper', desc: 'HP:3 | Dame:2 | Đạn:5. Tốc chậm. Giữ bắn tạo tường. Xuyên giảm dame. Nạp cả băng.', type: 'body', role: ['Đối Đầu', 'Kiểm Soát'], size: { w: 24, h: 24 }, stats: { hp: 3, dmg: 2, ammo: 5 } },
        {
            id: 'cung',
            name: 'Bow',
            desc: 'HP:3 | Dame:0.5 | Đạn:3 | Tốc: Nhanh. Giữ nút kéo cung (đầy lực ~1.5s), nhả để bắn: Tăng sát thương/Tốc đạn. Nội tại Nhạy Bén: Tự né 1 lần đạn mỗi 8s (Full Evo 5s).',
            type: 'body', role: ['Cơ Động', 'Đối Đầu'],
            size: { w: 24, h: 24 },
            stats: { hp: 3, dmg: 0.5, ammo: 3, speedMult: 1.25 }
        },
        {
            id: 'mirror',
            name: 'Mirror',
            desc: 'HP:5.5 | Dame:1.3 | Đạn:6. Tạo bản sao đối xứng bắn cùng lúc (50% dame). Giữ bắn 1s để hoán đổi vị trí.',
            type: 'body', role: ['Cơ Động', 'Đối Đầu'],
            size: { w: 30, h: 30 },
            stats: { hp: 5.5, dmg: 1.3, ammo: 6 }
        },
        {
            id: 'sukuna',
            name: 'Vua Đầu Bếp',
            desc: 'HP:4.5 (+3 máu xe lớn) | Chú Lực tấn công. Giữ bắn Phản Chuyển (+1.25 HP). Bị trúng đòn ngắt niệm Lãnh Địa.',
            type: 'body', role: ['Đối Đầu', 'Sinh Tồn'],
            size: { w: 36, h: 36 },
            stats: { hp: 4.5, dmg: 2.0, ammo: 999 }
        },
        {
            id: 'paradox',
            name: 'Paradox',
            desc: 'HP:6 | Dame:1.2 | Đạn:5. Có bóng đi sau 3s. Giữ 0.2s tua ngược & tự xả đạn lặp lại (CD: 12s/7s). Giữ tới mốc trống cuối: đặt Neo Thời Không (10s, CD 20s) - lần tua tới về neo (vị trí, máu, đạn).',
            type: 'body', role: ['Sinh Tồn', 'Cơ Động', 'Kiểm Soát'],
            size: { w: 30, h: 30 },
            stats: { hp: 6, dmg: 1.2, ammo: 5 }
        },
        {
            id: 'magician',
            name: 'Nhà Ảo Thuật',
            desc: 'HP:3 | Dame:1 | Rất Nhanh | Đạn:7. Giữ bắn+Đi: Lướt, Khiên, Tàng hình. Giữ bắn+Đứng: Khiên & Vô địch. Giữ 1s: Hoán đổi & Khiên.',
            type: 'body', role: ['Cơ Động', 'Sinh Tồn'],
            size: { w: 26, h: 26 },
            stats: { hp: 3, dmg: 1.0, ammo: 7, speedMult: 1.35 }
        },
        {
            id: 'inventor',
            name: 'Nhà Phát Minh',
            desc: 'HP:5.5 | Tốc: 0.8x | Dame:0.7 | Đạn: 4. Dùng Linh Kiện (LK) nâng cấp. Sở hữu Drone Không Kích.',
            type: 'body', role: ['Kiểm Soát', 'Sinh Tồn'],
            size: { w: 30, h: 30 },
            stats: { hp: 5.5, dmg: 0.7, ammo: 4, speedMult: 0.8 }
        },
        {
            id: 'shadow_hunter',
            name: 'Shadow Hunter',
            desc: 'HP:2 | Dame:1 | Đạn:6. Vô Hình (Nhấn Bắn: +40% Tốc, +50% Dame, Đòn Cường Hóa). Chảy máu & Chậm.',
            type: 'body', role: ['Cơ Động', 'Đối Đầu'],
            size: { w: 24, h: 24 },
            stats: { hp: 2, dmg: 1, ammo: 6, speedMult: 1.3 }
        },
        {
            id: 'shortgunATK',
            name: 'Shortgun',
            desc: 'HP:3.5 | Dame:1.3 | Đạn:2. Quét 180px -> Lao áp sát (cách 40px) -> Nón bộc phá 0.5s. Nhấp đúp: x2 đạn & x2 dame. Phá hủy hồi 1 đạn.',
            type: 'body', role: ['Đối Đầu', 'Sinh Tồn'],
            size: { w: 34, h: 34 },
            stats: { hp: 3.5, dmg: 1.3, ammo: 2, speedMult: 1.25 }
        },
        {
            id: 'thunder',
            name: 'Sấm Chớp',
            desc: 'HP:2 | Dame:1 | Đạn:0 (3 Lôi Phong Thương). Nhấp: Phóng thương cắm tường nổ AoE. Giữ 0.5-1s: Thu thương. Giữ >1s: Trảm Lôi. Lôi Minh: Raycast toàn map.',
            type: 'body', role: ['Đối Đầu', 'Cơ Động'],
            size: { w: 26, h: 26 },
            stats: { hp: 2, dmg: 1, ammo: 0, speedMult: 1.3 }
        },
        {
            id: 'magnet',
            name: 'Nam Châm',
            desc: 'HP:4.5 | Dame:0.5 | Đạn:6. Đổi Cực Âm/Dương (+/-). Bắn cắm Cột Từ Trường. Hút/Đẩy kẻ địch nhiễm từ. Lướt Cực Tính đâm cột.',
            type: 'body', role: ['Kiểm Soát', 'Cơ Động'],
            size: { w: 34, h: 34 },
            stats: { hp: 4.5, dmg: 0.5, ammo: 6, speedMult: 1.0 }
        },
        {
            id: 'evolution',
            name: 'Tiến Hóa',
            desc: 'HP:5.5 | Dame:1 | Đạn:1 (Thuần Farm). Ăn/Phá Rương cộng vĩnh viễn chỉ số. Rương Giả Mạo (Mimic). Late game bất khả chiến bại.',
            type: 'body', role: ['Sinh Tồn', 'Đối Đầu'],
            size: { w: 30, h: 30 },
            stats: { hp: 5.5, dmg: 1, ammo: 1, speedMult: 1.0 }
        },
        {
            id: 'death_lock',
            name: 'Trối Chết (DeathLock)',
            desc: 'HP:6 (+2 máu xe lớn) | Dame:0.8 | Đạn:3 | Tốc: 0.8x. Nội tại Ràng Buộc: 4 tầng ấn. Đạn Cấm Chế: Lồng Xích hút & giam giữ.',
            type: 'body', role: ['Kiểm Soát', 'Đối Đầu'],
            size: { w: 34, h: 34 },
            stats: { hp: 6, dmg: 0.8, ammo: 3, speedMult: 0.8 }
        },
        {
            id: 'creator',
            name: 'Kẻ Sáng Tạo',
            desc: 'HP:3 | Dame:0.25 | Đạn:1 | Tốc: 1.0x. Bản Thiết Kế Toàn Năng: Ụ Súng Tự Ngắm (max 2), Khiên Thép Chắn Đạn (5 HP), Drone Không Kích.',
            type: 'body', role: ['Kiểm Soát', 'Sinh Tồn'],
            size: { w: 24, h: 24 },
            stats: { hp: 3, dmg: 0.25, ammo: 1, speedMult: 1.0 }
        },
        {
            id: 'necromancer',
            name: 'Chiêu Hồn Sư',
            desc: 'HP:1 | Dame:1 | Đạn:1 | Tốc: 0.8x. Linh Minh Hộ Thể: Khởi đầu 6 Linh Hồn (Linh Giáp đỡ đòn). Tụ lực phím Bắn triệu hồi 3 mốc Vong Linh.',
            type: 'body', role: ['Kiểm Soát', 'Sinh Tồn'],
            size: { w: 32, h: 32 },
            stats: { hp: 1, dmg: 1, ammo: 1, speedMult: 0.8 }
        },
        {
            id: 'genius',
            name: 'Thiên Tài',
            desc: 'HP:2.5 | Dame:1 | Đạn:1 | Tốc: 1.3x. Thu thập Bánh Răng & Linh Kiện. Mở Chợ Đen nâng cấp Robot. Đủ Bánh Răng nhấn giữ để trực tiếp Lái Mecha!',
            type: 'body', role: ['Sinh Tồn', 'Kiểm Soát'],
            size: { w: 24, h: 24 },
            stats: { hp: 2.5, dmg: 1, ammo: 1, speedMult: 1.3 }
        },
        {
            id: 'kiem_khach',
            name: 'Kiếm Khách',
            desc: 'HP:3 | Dame:1.2 | Đạn:3. Bắn phi kiếm. Mất khiên -> Tập Trung 3s (né mọi đòn). Làm 3 Bài Tập Luyện Kiếm cùng lúc (+1 ô mỗi hiệp), đầu trận tự nhận 3 bài ngẫu nhiên; xong bài tăng sức mạnh vĩnh viễn.',
            type: 'body', role: ['Sinh Tồn', 'Đối Đầu'],
            size: { w: 30, h: 30 },
            stats: { hp: 3, dmg: 1.2, ammo: 3, speedMult: 1.0 }
        },
        {
            id: 'sprayer',
            name: 'Bình Phun',
            desc: 'HP:5 (+2 xe lớn) | Năng lượng. Nhấp: Bật/Tắt phun hình nón. Giữ 0.5s: đổi chất Lửa/Axit/Băng. Lớp phủ đầy 100% -> Nổ / Câm Lặng / Đóng Băng. Axit ăn mòn 2 dame/s mọi vật không phải body (thùng, xe tiền, triệu hồi, công trình). Vật cản chặn luồng phun.',
            type: 'body', role: ['Kiểm Soát', 'Đối Đầu'],
            size: { w: 34, h: 34 },
            stats: { hp: 5, dmg: 0, ammo: 0, speedMult: 0.825 }
        },
        {
            id: 'customize',
            name: 'Tùy Biến',
            desc: 'HP:6 | Dame:1.5 | Đạn:1. Xe lắp ghép: mỗi hiệp nhận Điểm Tùy Chỉnh để lắp Lối Bắn, Dạng Đạn, Tính Chất Đạn, Kích Thước. Thua liên tiếp nhận thêm điểm.',
            type: 'body', role: ['Đối Đầu', 'Sinh Tồn'],
            size: { w: 30, h: 30 },
            stats: { hp: 6, dmg: 1.5, ammo: 1, speedMult: 1.0 }
        },
        {
            id: 'kiem_su',
            name: 'Kiếm Sư',
            desc: 'HP:4 | Dame:1 | Đạn:5 | Tốc: 1.1x. Ngũ Hành: mỗi phi kiếm mang 1 nguyên tố ngẫu nhiên (Kim tiền, Mộc trói, Hỏa nổ, Thổ dựng đá, Thủy hồi máu).',
            type: 'body', role: ['Đối Đầu', 'Kiểm Soát'],
            size: { w: 28, h: 28 },
            stats: { hp: 4, dmg: 1, ammo: 5, speedMult: 1.1 }
        },
        {
            id: 'revolver',
            name: 'Cao Bồi',
            desc: 'HP:3.5 | Dame:1.25 | Đạn:6 (ổ cố định) | Tốc: 1.2x. "6 viên là đủ!" Chỉ nạp khi bắn cạn cả ổ (1.8s). Nhấp: đạn xuyên thủng; viên thứ 6 là đạn đồng x2 dame, xuyên khiên. Giữ 0.4s: Quạt Cò — khóa hồng tâm 1s rồi xả hết ổ (0.1s/viên).',
            type: 'body',
            role: ['Đối Đầu', 'Cơ Động'],
            size: { w: 26, h: 26 },
            stats: { hp: 3.5, dmg: 1.25, ammo: 6, speedMult: 1.2 }
        },
        {
            id: 'dj',
            name: 'DJ',
            desc: 'HP:4 | Dame:0.75 | Đạn:2 (∞ khi đúng nhịp) | Tốc: 1.15x. "Lắng nghe nhịp điệu nào!" Nút Bắn đổi màu theo nhịp Xanh -> Vàng -> Đỏ: bấm lúc ĐỎ = Cảm Âm Hoàn Hảo (sóng âm rộng, không tốn đạn, làm chậm, +1 Combo). Bấm sai = Loạn Âm (đứt combo, nửa dame, tốn đạn; hết đạn khóa 1.5s). Giữ 0.4s: đổi bản nhạc Dễ/Trung Bình/Khó. Combo tăng tốc & dame; mỗi 30 combo +1 Khiên, mỗi 45 combo +1 HP.',
            type: 'body',
            role: ['Đối Đầu', 'Cơ Động', 'Sinh Tồn'],
            size: { w: 28, h: 28 },
            stats: { hp: 4, dmg: 0.75, ammo: 2, speedMult: 1.15 }
        },
        {
            id: 'steel_hook',
            name: 'Móc Thép',
            desc: 'HP:3 (+3 xe lớn) | Dame:2 | Đạn:1 | Chậm. Móc lắc trái-phải ±70° trước mũi xe. Giữ Bắn tụ lực 4 mốc (+2 lần nảy mỗi mốc, tối đa 9), nhả để phóng xích nảy tường; giữ càng lâu móc bay càng nhanh (đi hết đường xích trong 1.25s -> 0.5s). Xuyên & phá hòm, 2 dame lên triệu hồi/công trình, ghim Xe Tiền làm trụ phản xạ (hết lượt nảy: ngoạm & spam Bắn để kéo về ăn tiền). Móc dừng: Bắn lần nữa -> Đu Dây Đột Kích (lao theo xích húc mọi thứ, nổ 2 dame) hoặc Lôi Xích Hành Hình nếu trúng địch (kéo địch ngược đường xích, +1 dame mỗi vật bị đập, nổ 2 dame). Móc đã neo: giữ Bắn 0.75s để tự cắt xích và phóng lại. Đầu móc có máu = 50% máu xe: bắn trúng sẽ đứt xích.',
            type: 'body',
            role: ['Kiểm Soát', 'Đối Đầu', 'Sinh Tồn'],
            size: { w: 36, h: 36 },
            stats: { hp: 3, dmg: 2, ammo: 1, speedMult: 0.85 }
        },
        {
            id: 'flower_shadow',
            name: 'Hoa Ảnh',
            desc: '"Khiêu vũ nào!" HP:3 | Dame:0.5 | Thanh Hoa 100% (tự hồi) | Tốc: 1.35x. Giữ Bắn 0.25s đổi Vũ Điệu Khai → Phá → Thiên, nhấp để múa. KHAI (10%): 3 cánh hoa bay tới cuối sân, nghỉ 5s rồi trôi về (gây dame, mỗi cánh hoàn 5%). PHÁ (25%): lướt xuyên thẳng tới cuối sân rồi về, 1s sau mọi mục tiêu bị xuyên chịu 5 nhát chém. THIÊN (50%): biến mất, lái Vòng Cảnh Báo (hút & làm chậm) tối đa 5s, nhấp để đáp: 3 dame + choáng 1.5s. Mỗi 50% Hoa tiêu hao: vũ điệu kế tiếp được Cường Hóa (Bách Hoa Nở Rộ).',
            type: 'body',
            role: ['Cơ Động', 'Đối Đầu', 'Kiểm Soát'],
            size: { w: 24, h: 24 },
            stats: { hp: 3, dmg: 0.5, ammo: 0, speedMult: 1.35 }
        },
        {
            id: 'kiem_vu',
            name: 'Kiếm Vũ',
            desc: 'HP:1.5 | Dame:1.5 | Đạn:1 (Bản Mệnh Kiếm). Nhấp: phóng kiếm tới trục X của địch rồi cắm xuống; nhấp lần 2: thu kiếm về (dame cả 2 lượt). Chỉ phóng được khi kiếm trên tay hoặc đã thu về nửa sân mình (đang bay về mà qua giữa sân -> nhấp để phóng lại ngay). Đứng yên tích Tâm Định (chỉ hồi sau 1.25s không dùng kỹ năng / tiêu Tâm Định): trúng đòn khi đứng yên (≥25%) -> phản đạn & Tập Trung 0.5s (đạn tiếp theo tự phản). Phản đạn tích Sát Ý; đầy 100% -> Tâm Kiếm hitscan xuyên Khiên & Tường.',
            type: 'body',
            size: { w: 28, h: 28 },
            stats: { hp: 1.5, dmg: 1.5, ammo: 1, speedMult: 1.0 },
            role: ['Đối Đầu', 'Sinh Tồn', 'Kiểm Soát']
        },
        {
            id: 't_zero',
            name: 'T-Zero',
            desc: 'HP:6 (+2 xe lớn) | Dame:1 | Năng Lượng | Tốc: 0.9x. "Hệ Thống KÍCH HOẠT: T-ZERO ON". Giữ nhẹ Bắn 0.25s đổi Thiết Luật: THỦ (ném Khiên Boomerang 5% NL; khiên trên tay phản đạn địch 15%+dame×10% NL) -> CÔNG (tăng tốc & dame, lao đấm như Xe TANK 10% NL) -> THIÊN LUẬT THỨC (bay lên 25% NL + 5%/s, không thể bị bắn, tự dội pháo; nhấp lần nữa đáp xuống nổ choáng). Mỗi lần tiêu hao khóa hồi NL 1s.',
            type: 'body',
            role: ['Sinh Tồn', 'Đối Đầu', 'Kiểm Soát'],
            size: { w: 34, h: 34 },
            stats: { hp: 6, dmg: 1, ammo: 0, speedMult: 0.9 }
        },
    ],
    FEET: [
        { id: 'speed', name: 'Động Cơ', desc: 'Tăng tốc độ di chuyển. Tối đa 3 lần.', type: 'feet', cost: 30 },
        { id: 'armor', name: 'Giáp Thép', desc: '+1 Máu tối đa.', type: 'feet', cost: 15 },
        { id: 'damage', name: 'Bánh Xích', desc: 'x1.25 Sát thương (3 lần đầu), sau đó giảm dần.', type: 'feet', cost: 20 },
        { id: 'interest', name: 'Lợi Tức', desc: 'Sau mỗi round nhận tiền; càng nhiều tầng mỗi tầng càng sinh lời (30$/72$/126$/192$..., Xe Tiền x2).', type: 'feet', cost: 10 }
    ]
};
