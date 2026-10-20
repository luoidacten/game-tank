// ==========================================
// Dữ liệu Body / Module
// ==========================================



// --- MODULES & DATA ---
const MODULES = {
    BODY: [
        { id: 'basic', name: 'Cơ Bản', desc: 'HP:9 | Dame:1.2 | Đạn:8 | Tốc +10%. Chuẩn mực vững vàng: nạp đạn nhanh hơn 20%, đạn bay nhanh hơn.', type: 'body', role: ['Đối Đầu', 'Sinh Tồn'], size: { w: 30, h: 30 }, stats: { hp: 9, dmg: 1.2, ammo: 8, speedMult: 1.1 } },
        { id: 'money_tank', name: 'Xe Tiền', desc: 'HP:2 | Dame:1.5 | Đạn:2. Farm tiền, mua CẤP ĐỘ trong shop (mỗi cấp +1 HP, đạn bay nhanh hơn; Cấp 3: Khiên +2 HP, Cấp 6: +3 HP, Cấp 4: Xuyên +0.5 dame, Cấp 5: Đạn nổ, Cấp 6: Đế Chế Tiền Tệ). Lợi Tức & tiền nhặt x2.', type: 'body', role: ['Sinh Tồn', 'Đối Đầu'], size: { w: 28, h: 28 }, stats: { hp: 2, dmg: 1.5, ammo: 2 } },
        { id: 'tank', name: 'Xe TANK', desc: 'HP:4.5 (+5 máu xe lớn) | Dame:2.5 | Tốc: Khá. Nhấn Bắn: Lao húc (1.1x dame, hồi chiêu 2s; tông hòm tiếp tế không mất máu; khi lao chỉ nhận 35% sát thương). Nội tại: tự hồi 1 khiên mỗi 6s (vòng quanh xe báo tiến độ).', type: 'body', role: ['Đối Đầu', 'Cơ Động'], size: { w: 38, h: 38 }, stats: { hp: 4.5, dmg: 2.5, ammo: 0 } },
        { id: 'ice', name: 'Pháo Băng', desc: 'HP:5 | Dame:1 | Đạn:5 (Làm chậm)', type: 'body', role: ['Kiểm Soát', 'Đối Đầu'], size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 1, ammo: 5 } },
        { id: 'big_bullet', name: 'Đạn Lớn', desc: 'HP:5 | Dame:2 | Đạn:2. Quả cầu đạn khổng lồ (gấp đôi cỡ cũ, Evo 1 & Full Evo càng to hơn). Full Evo: nảy 1 lần hóa Xuyên Thấu, tan ở giữa sân & nổ 360° mảnh đạn.', type: 'body', role: ['Đối Đầu'], size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 2, ammo: 2 } },
        { id: 'shotgun', name: 'Shotgun', desc: 'HP:5.5 | Dame:1 | Đạn:2. Mỗi phát tỏa 5 viên bay nhanh.', type: 'body', role: ['Đối Đầu'], size: { w: 26, h: 26 }, stats: { hp: 5.5, dmg: 1, ammo: 2 } },
        { id: 'overload', name: 'Cuộn Quá Tải', desc: 'HP:4.5 | Dame:0.7-7 (Tự tụ) | Đạn:6. Thanh năng lượng tự tụ 2.4s; đầy -> phát kế tiếp là Đạn Sạc nổ xung kích điện (vụ nổ 0.5 dame, Full Evo 1.25).', type: 'body', role: ['Đối Đầu'], size: { w: 30, h: 30 }, stats: { hp: 4.5, dmg: 0.7, ammo: 6 } },
        { id: 'smg', name: 'Tiểu Liên', desc: 'HP:5 | Dame:0.9 | Băng 18 viên (Lắc). Giữ để sấy; hết băng -> nạp nguyên băng 1.8s (vòng nạp quanh xe). Nghỉ bắn 2.5s tự thay băng.', type: 'body', role: ['Đối Đầu'], size: { w: 24, h: 24 }, stats: { hp: 5, dmg: 0.9, ammo: 12 } },
        { id: 'lazer_charge', name: 'Lazer Xuyên Phá', desc: 'HP:4 | Đạn:12. Năng lượng TỰ NẠP đầy sau 5s -> nhấp phóng Tia Xuyên Phá 20 dame. Giữ 0.4s: bật/tắt Tự Nạp (tắt: nhấp bắn đạn thường 0.01 dame, năng lượng ngừng nạp). Full Evo: tia hạ gục ngay bất kể máu, xuyên khiên.', type: 'body', role: ['Đối Đầu'], size: { w: 30, h: 30 }, stats: { hp: 4, dmg: 0.5, ammo: 12 } },
        { id: 'lazer_auto', name: 'Lazer Pháo', desc: 'HP:5 | Dame:1 | Không cần đạn: GIỮ bắn xả dòng laser xuyên thấu, nhịp bắn tăng dần (0.43s -> 0.17s/tia). Mỗi tia +9% Nhiệt; Nhiệt >= 60%: tia Nóng Đỏ +35% dame. Đầy 100% -> QUÁ NHIỆT khóa bắn 1.5s. Nhả nút để hạ nhiệt; hòm đạn xả sạch nhiệt.', type: 'body', role: ['Đối Đầu'], size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 1, ammo: 6 } },
        { id: 'rocket', name: 'Pháo Tên Lửa', desc: 'HP:5 | Dame:1.15 (Nổ lan) | Đạn:3', type: 'body', role: ['Đối Đầu', 'Kiểm Soát'], size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 1.15, ammo: 3 } },
        { id: 'portal', name: 'Cổng Không Gian', desc: 'HP:5 | Dame:1 | Đạn:7 (Dịch chuyển)', type: 'body', role: ['Cơ Động', 'Đối Đầu'], size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 1, ammo: 7 } },
        { id: 'wind_slash', name: 'Phong Trảm', desc: 'HP:4 | Tụ lực bắn Kiếm Khí (Phá đạn)', type: 'body', role: ['Đối Đầu', 'Kiểm Soát'], size: { w: 30, h: 30 }, stats: { hp: 4, dmg: 0.9, ammo: 1 } },
        { id: 'storm', name: 'Cuồng Phong', desc: 'HP:3.5 | Giữ nút tụ lực 3.5s, nhả -> Lao & Chém Tròn (Phản đạn)', type: 'body', role: ['Cơ Động', 'Đối Đầu'], size: { w: 30, h: 30 }, stats: { hp: 3.5, dmg: 2, ammo: 0 } },
        { id: 'acid', name: 'Axit Hóa', desc: 'HP:4 | Dame:0.5 | Đạn:1. Ăn mòn Max HP (Max HP<=1 nhận 4 Dame). Mỗi viên thứ 5 (đạn cường hóa) tạo VÙNG ĂN MÒN tím: rút cả HP lẫn Max HP & làm chậm. Mọi đạn/vùng Axit gây x10 dame + 50% Max HP lên vật cản, công trình, xe tiền/phương tiện & vật triệu hồi.', type: 'body', role: ['Kiểm Soát', 'Đối Đầu'], size: { w: 30, h: 30 }, stats: { hp: 4, dmg: 0.5, ammo: 1 } },
        { id: 'engineer', name: 'Kỹ Sư', desc: 'HP:3 (+2 máu xe lớn) | Dame:0.5 | Đạn:2. Tự tạo Ụ Thường. Giữ 1s đặt Ụ Thông Minh. Ụ tồn tại quá 10s tự mất máu chậm.', type: 'body', role: ['Kiểm Soát', 'Sinh Tồn'], size: { w: 34, h: 34 }, stats: { hp: 3, dmg: 0.5, ammo: 2 } },
        { id: 'ghost', name: 'Ghost', desc: 'HP:2.5 | Tốc: Rất Nhanh | Đạn:4. Vô Ảnh 2s (CD 3s). Tàn Ảnh phân thân.', type: 'body', role: ['Cơ Động', 'Đối Đầu'], size: { w: 24, h: 24 }, stats: { hp: 2.5, dmg: 1.75, ammo: 4 } },
        { id: 'aaa', name: 'Pháo Cao Xạ', desc: 'HP:3.5 (+4 máu xe lớn) | Tốc: Chậm | Dame:1.15 Pháo Kích (1.5s nổ) + Xả nhanh khi có đạn. Tự bắn mỗi 4s (vòng đếm ngược quanh xe để canh thời điểm).', type: 'body', role: ['Kiểm Soát', 'Đối Đầu'], size: { w: 37, h: 37 }, stats: { hp: 3.5, dmg: 1.15, ammo: 1 } },
        { id: 'blade_god', name: 'Kiếm Tôn', desc: 'HP:5 | Dame:1.05 | Đạn:4. Luân phiên: Quang Kiếm (lơ lửng tại chỗ, ngắm 2s rồi tự phóng tia sáng) / Ám Kiếm (kiếm bay, nổ + câm lặng). Nhát thứ 10: Phá Thiên Kiếm.', type: 'body', role: ['Đối Đầu', 'Kiểm Soát'], size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 1.05, ammo: 4 } },
        { id: 'van_kiem', name: 'Kiếm Trận', desc: 'HP:4.5 | Dame:0.6 | Đạn: Vô Hạn. Tự gọi kiếm. Giữ bắn để vào Kiếm Thế.', type: 'body', role: ['Kiểm Soát', 'Đối Đầu'], size: { w: 26, h: 26 }, stats: { hp: 4.5, dmg: 0.6, ammo: 999 } },
        { id: 'water_gun', name: 'Súng Nước', desc: 'HP:4 (+2 máu xe lớn) | Dame:1.5 Đạn: Nội năng (100%). Bấm: Tia nước. Giữ 1s: Laser nước (hiện cột cảnh báo 0.5s rồi mới bắn).', type: 'body', role: ['Kiểm Soát', 'Đối Đầu'], size: { w: 34, h: 34 }, stats: { hp: 4, dmg: 1.5, ammo: 0 } },
        { id: 'furnace', name: 'Lò Nung', desc: 'HP:6 (+3 máu xe lớn) | Chậm | Dame:0.25 Đạn: Nội năng. Gây Đốt. 5 stack Đốt -> Nổ 5 dame.', type: 'body', role: ['Đối Đầu', 'Kiểm Soát'], size: { w: 36, h: 36 }, stats: { hp: 6, dmg: 0.25, ammo: 0 } },
        { id: 'am_duong_su', name: 'Âm Dương Sư', desc: 'HP:5 | Dame:0.5 | Đạn:4. Luân phiên Âm/Dương chú. Bùa kích nổ nhanh.', type: 'body', role: ['Kiểm Soát', 'Đối Đầu'], size: { w: 30, h: 30 }, stats: { hp: 5, dmg: 0.5, ammo: 4 } },
        { id: 'six_barrel', name: '6 Nòng', desc: 'HP:6 (+3 máu xe lớn) | Dame:0.4 | Đạn: Vô hạn. Giữ 0.5s khởi động nòng rồi mới bắn (đã quay thì nhấp vẫn bắn). Bắn liên tục tăng Nhiệt, đi chậm. Quá nhiệt gây câm lặng.', type: 'body', role: ['Đối Đầu', 'Sinh Tồn'], size: { w: 36, h: 36 }, stats: { hp: 6, dmg: 0.4, ammo: 999 } },
        { id: 'the_strongest', name: 'Kẻ Mạnh Nhất', type: 'body', role: ['Sinh Tồn', 'Đối Đầu'], size: { w: 30, h: 30 }, desc: 'HP 1. Dùng Chú Lực vô hiệu sát thương. Nhấp: Lướt (Thương). Giữ: Hit-scan (Hách). Bị trúng đòn ngắt niệm.', stats: { hp: 1, dmg: 0.5, ammo: 999 } },
        { id: 'sniper', name: 'Sniper', desc: 'HP:3 | Dame:2 | Đạn:5. Tốc chậm. Giữ bắn tạo tường chặn MỌI đòn địch (cả tia hitscan & đạn xuyên); đạn mình bay qua. Tường tự mục sau 5s. Xuyên giảm dame. Đạn bay cực nhanh, tia ngắm chỉ đúng hướng bắn. Hết đạn nạp cả băng (vòng nạp).', type: 'body', role: ['Đối Đầu', 'Kiểm Soát'], size: { w: 24, h: 24 }, stats: { hp: 3, dmg: 2, ammo: 5 } },
        {
            id: 'cung',
            name: 'Bow',
            desc: 'HP:3 | Dame:0.5 | Đạn:3 | Tốc: Nhanh. Nhấp: bắn theo kiểu hiện tại. Giữ 0.5s: đổi kiểu — Tụ Lực (cung tự kéo, căng càng lâu mũi càng to/mạnh, nhịp chậm) / Liên Hoàn (loạt 5 mũi nhanh, dame thấp) / Bắn 3 Mũi (3 hướng, bay nhanh). Giữ 2.5s: NGẮM — hồng tâm đuổi địch & thu hẹp (tối đa 5s), nhả: Thiên Tiễn từ trời (khóa đỏ 0.5s, x2-x5 dame, hồi 8s). Nội tại Nhạy Bén: Tự né 1 đòn mỗi 8s.',
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
            desc: 'HP:3 | Dame:1 | Rất Nhanh | Đạn:7. Giữ bắn 0.5s tạo Phân Ảnh + Khiên (CD riêng 10s): +Đi = Lướt & Tàng hình, Đứng = Vô địch. Thoát Chết: đòn chí mạng -> dịch chuyển đi chỗ khác, để lại phân ảnh mồi (1 lần/hiệp). Mưa mũ ảo thuật khi tạo bóng.',
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
            desc: 'HP:2 | Dame:1 | Đạn:0 (3 Lôi Phong Thương). Nhấp: Phóng thương cắm tường nổ AoE. Giữ 0.5-1s: Thu thương. Giữ >1s: Lôi Trảm (chém rộng ở từng cây thương, càng nhiều thương càng nhanh, tối đa 3s; xong được buff tốc chạy + sát thương ngắn & 1-3 thương rơi từ trời xuống địch, báo trước 3s). Mất hết thương: hồi lại sau 5s. Lôi Minh chỉ tích khi Thu thương, Lôi Trảm, hoặc thương phóng trúng địch. Thiên Kiếp (Lôi Minh 3/3): Nhấp = Lôi Độn (hóa sét lao tới, hút địch, chém nhanh, bất tử); kết thúc bằng Thiên Lôi Giáng (bay lên trời, lái vòng, giáng gây choáng).',
            type: 'body', role: ['Đối Đầu', 'Cơ Động'],
            size: { w: 26, h: 26 },
            stats: { hp: 2, dmg: 1, ammo: 0, speedMult: 1.3 }
        },
        {
            id: 'magnet',
            name: 'Nam Châm',
            desc: 'HP:4.5 | Dame:0.5 | Đạn:6. Giữ: Đổi Cực Âm/Dương (+/-). Bắn cắm Cột Từ Trường (mạnh 2s đầu rồi yếu dần); kẻ địch chạm vùng từ bị NHIỄM TỪ (chỉ bị hút/đẩy). Đạn trúng trực tiếp gắn ẤN TỪ 6s (mang cực của đạn, tự toả vùng từ nhỏ). Bản thân không bị từ trường của mình tác động. Nhấp khi phía trước có Cột của mình / kẻ địch mang Ấn Từ KHÁC CỰC: Lướt Cực Tính (hồi 3s) — lao tới Cột húc nổ rồi bay về; hoặc hai xe hút nhau va chạm giữa sân (1.5 dame, tiêu hao Ấn Từ) rồi cùng bay về làn.',
            type: 'body', role: ['Kiểm Soát', 'Cơ Động'],
            size: { w: 34, h: 34 },
            stats: { hp: 4.5, dmg: 0.5, ammo: 6, speedMult: 1.0 }
        },
        {
            id: 'evolution',
            name: 'Tiến Hóa',
            desc: 'HP:2 | Dame:1 | Đạn:1 (Thuần Farm). Ăn/Phá Rương cộng vĩnh viễn chỉ số. Rương Giả Mạo (Mimic). Late game bất khả chiến bại.',
            type: 'body', role: ['Sinh Tồn', 'Đối Đầu'],
            size: { w: 30, h: 30 },
            stats: { hp: 2, dmg: 1, ammo: 1, speedMult: 1.0 }
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
            desc: 'HP:5 (+2 xe lớn) | Năng lượng. Nhấp: Bật/Tắt phun hình nón. Giữ 0.5s: đổi chất Lửa/Axit/Băng. Lớp phủ đầy 100% -> Nổ / Câm Lặng / Đóng Băng. Axit ăn mòn mọi vật không phải body (thùng, xe tiền, triệu hồi, công trình): x10 dame + mất 50% Max HP mỗi giây hứng luồng; xe tiền/xe bị đốt nhanh gấp 3. Vật cản chặn luồng phun.',
            type: 'body', role: ['Kiểm Soát', 'Đối Đầu'],
            size: { w: 34, h: 34 },
            stats: { hp: 5, dmg: 0, ammo: 0, speedMult: 0.825 }
        },
        {
            id: 'customize',
            name: 'Tùy Biến',
            desc: 'HP:6 | Dame:1.5. Xe lắp ghép: mỗi hiệp nhận 2+ Điểm Tùy Chỉnh (thua / chuỗi thua nhận thêm) để lắp & nâng cấp Lối Bắn (Tap, Loạt, Shotgun, SMG, Tích Tụ, Tiến Công), Dạng Đạn, Tính Chất (Nổ, Xuyên, Chí Mạng, Hút Máu, Song Nòng, Vũng...), Kích Thước và Chỉ Số nâng mãi.',
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
            desc: 'HP:4 | Dame:0.75 | Đạn:2 (∞ khi đúng nhịp) | Tốc: 1.15x. "Lắng nghe nhịp điệu nào!" Nút Bắn đổi màu theo nhịp Xanh -> Vàng -> Đỏ: bấm lúc ĐỎ (vùng rộng, dễ bấm trên điện thoại) = Cảm Âm Hoàn Hảo (sóng âm rộng, không tốn đạn, làm chậm, +1 Combo). Bấm lúc VÀNG = vẫn bắn sóng âm nhưng KHÔNG cộng Combo. Bấm sai = Loạn Âm (đứt combo, nửa dame, tốn đạn). Để nốt trôi qua vùng mà không bấm = LỠ NHỊP: mất phát bắn (tốn 1 đạn) & đứt Combo. Hết đạn khóa 1.5s. Giữ 0.4s: đổi bản nhạc Dễ (nốt chậm, thưa, Hoàn Hảo rất dễ) / Trung Bình (vừa phải, thỉnh thoảng Nốt Đôi: bấm 2 lần liên tiếp) / Khó (nhanh, cho người đã luyện). Combo tăng tốc & dame; mỗi 30 combo +1 Khiên, mỗi 45 combo +1 HP.',
            type: 'body',
            role: ['Đối Đầu', 'Cơ Động', 'Sinh Tồn'],
            size: { w: 28, h: 28 },
            stats: { hp: 4, dmg: 0.75, ammo: 2, speedMult: 1.15 }
        },
        {
            id: 'steel_hook',
            name: 'Móc Thép',
            desc: 'HP:3 (+3 xe lớn) | Dame:2 | Đạn:1 | Chậm. Móc lắc trái-phải ±70° trước mũi xe. Giữ Bắn tụ lực 4 mốc (+2 lần nảy mỗi mốc, tối đa 9), nhả để phóng xích nảy tường; giữ càng lâu móc bay càng nhanh (đi hết đường xích trong 1.25s -> 0.5s); đã tụ ≥1 mốc thì khi nhả xích khoá hướng, hiện đường cảnh báo đỏ 0.33s rồi mới phóng (đối thủ kịp né). Xuyên & phá hòm, 2 dame lên triệu hồi/công trình, ghim Xe Tiền làm trụ phản xạ (hết lượt nảy: ngoạm & spam Bắn để kéo về ăn tiền). Móc dừng: Bắn lần nữa -> Đu Dây Đột Kích (lao theo xích húc mọi thứ, nổ 2 dame) hoặc Lôi Xích Hành Hình nếu trúng địch (kéo địch ngược đường xích, +1 dame mỗi vật bị đập, nổ 2 dame). Móc đã neo: giữ Bắn 0.75s để tự cắt xích và phóng lại. Đầu móc có máu = 50% máu xe: bắn trúng sẽ đứt xích.',
            type: 'body',
            role: ['Kiểm Soát', 'Đối Đầu', 'Sinh Tồn'],
            size: { w: 36, h: 36 },
            stats: { hp: 3, dmg: 2, ammo: 1, speedMult: 0.85 }
        },
        {
            id: 'flower_shadow',
            name: 'Hoa Ảnh',
            desc: '"Khiêu vũ nào!" HP:3 | Dame:0.5 | Thanh Hoa 100% (hồi sau 0.5s không múa) | Tốc: 1.35x. Giữ Bắn 0.25s đổi Vũ Điệu Khai → Phá → Thiên, nhấp để múa. KHAI (10%): 3 cánh hoa bay tới cuối sân, nghỉ 3s rồi trôi về (gây dame, mỗi cánh về tới hoàn 5%); tối đa 12 cánh trên sân. Cánh bay ra / thu về chạm vật cản, công trình, triệu hồi, xe tiền thì gây dame rồi vỡ; cánh đang nằm trên sân địch bị xe địch lăn qua sẽ nát. PHÁ (25%): lướt xuyên thẳng tới cuối sân rồi về, 1s sau mọi mục tiêu bị xuyên chịu 5 nhát chém. THIÊN (50%): biến mất, lái Vòng Cảnh Báo (hút & làm chậm) tối đa 5s, nhấp để đáp: vòng khóa đỏ 0.5s rồi giáng 2.7 dame + choáng 1.5s. Tiêu hao 75% Hoa: vũ điệu kế tiếp được Cường Hóa (Bách Hoa Nở Rộ: cánh hoa hồng nhạt ánh kim, không thể bị chặn hay đè nát, xuyên vật cản cả lượt bay ra lẫn lượt thu về), đòn cường hóa không tính vào bộ đếm và bộ đếm về 0 sau đó.',
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
            desc: 'HP:6 (+2 xe lớn) | Dame:1 | Năng Lượng | Tốc: 0.9x. "Hệ Thống KÍCH HOẠT: T-ZERO ON". Giữ nhẹ Bắn 0.25s đổi Thiết Luật: THỦ (ném Khiên Boomerang 5% NL; khiên trên tay phản đạn địch 15%+dame×10% NL) -> CÔNG (tăng tốc & dame, lao đấm như Xe TANK 10% NL) -> THIÊN LUẬT THỨC (bay lên 25% NL, duy trì 9%/s và GẤP ĐÔI mỗi 2.5s bay, không thể bị bắn, tự dội pháo; nhấp lần nữa -> tâm ngắm KHÓA 0.5s rồi đáp xuống nổ choáng; đáp xong chờ 2.5s mới bay lại). Mỗi lần tiêu hao khóa hồi NL 1s.',
            type: 'body',
            role: ['Sinh Tồn', 'Đối Đầu', 'Kiểm Soát'],
            size: { w: 34, h: 34 },
            stats: { hp: 6, dmg: 1, ammo: 0, speedMult: 0.9 }
        },
        {
            id: 'raven_oca',
            name: 'Raven - Oca',
            desc: '"Cuộc săn bắt đầu, Oca tìm chúng!" HP:4 | Dame:0.5 (Tiểu Liên) / 4 (Sniper) | Đạn:10 / 4 | Tốc: 3.8. Giữ Bắn 0.4s đổi súng (hồi 4s). TIỂU LIÊN: nhấp xả loạt 3 viên; đổi sang -> lướt ngang. SNIPER: nhấp -> đứng yên ngắm 0.4s rồi bắn đạn cực nhanh; đổi sang -> thả Bom Khói 2s (đứng trong khói né mọi đạn). OCA (máu = 50% Raven, tự hồi sinh): khi cầm Tiểu Liên thì tàng hình, định kỳ lao cắn địch gây dame + làm chậm; khi cầm Sniper thì bay cao đánh dấu radar -> đạn Sniper tự khóa mục tiêu, xuyên vật thể & bay nhanh hơn.',
            type: 'body',
            role: ['Đối Đầu', 'Cơ Động', 'Kiểm Soát'],
            size: { w: 26, h: 26 },
            stats: { hp: 4, dmg: 0.5, ammo: 10, speedMult: 1.086 }
        },
        {
            id: 'lazer_beam',
            name: 'Tia Lazer',
            desc: 'HP:3 | Dame:0.2/tick (6 tick/s) | Năng Lượng | Tốc: 3.8. Giữ Bắn: tích tụ 0.5s -> cảnh báo 0.5s -> chiếu tia liên tục (chậm khi chiếu, tụt Năng Lượng; nghỉ 0.5s mới hồi). Tường Sniper địch chặn tia.',
            type: 'body', role: ['Đối Đầu'],
            size: { w: 28, h: 28 },
            stats: { hp: 3, dmg: 0.2, ammo: 0, speedMult: 1.086 }
        },
        {
            id: 'healer',
            name: 'Y Sư',
            desc: 'HP:3.5 | Dame:0.75 | Đạn:4 | Tốc: 3.5. "Hồi Phục": 3s không mất máu +0.5 HP. Đạn Hấp Huyết +0.25 HP (hồi 20s). Mọi lượng máu được hồi nạp Năng Lượng Sinh Mệnh -> đầy: phát kế tiếp là Đạn Cường Hóa (50% MaxHP + dame, nổ lan).',
            type: 'body', role: ['Sinh Tồn', 'Kiểm Soát'],
            size: { w: 30, h: 30 },
            stats: { hp: 3.5, dmg: 0.75, ammo: 4, speedMult: 1.0 }
        },
        {
            id: 'chrononeo',
            name: 'Chrono & Neo',
            desc: '"Hai thời đại, một dòng chảy!" HP:4.5 | Dame:1 | Đạn:3 (Chrono) / 8 (Neo) | Tốc: 3.3. THAM FARM: phá thùng, xe tiền, triệu hồi địch & qua mỗi hiệp -> băng đạn tăng vĩnh viễn (Chrono 3->7, Neo 8->14). Giữ Bắn 0.4s đổi thế (hồi 6s), 2 băng riêng (băng kia tự nạp ngầm). CHRONO: đạn đồng x1.5 xuyên vật cản, Xé Giáp; vào thế -> sóng đẩy lùi + giảm 25% sát thương 1.5s. NEO: nhấp bắn 2 viên x0.75, nhanh hơn; vào thế -> lướt ngang +40% tốc 1.5s. THỜI KHẮC: giữ 1 thế 4s -> phát kế tiếp cường hóa: Chrono radar khóa mọi mục tiêu & xả cả băng đạn tự tìm (không thể cản phá); Neo chùm 6-8 viên hình nón (Xé Giáp, chậm 35%) + Ảnh Chiếu bất tử 5s tự bắn.',
            type: 'body',
            role: ['Đối Đầu', 'Cơ Động', 'Sinh Tồn'],
            size: { w: 28, h: 28 },
            stats: { hp: 4.5, dmg: 1, ammo: 4, speedMult: 0.943 }
        },
        {
            id: 'gemini',
            name: 'Gemini',
            desc: '"Hai cá thể, một ý thức!" HP:3.5 x2 xe | Dame:0.75 | Đạn:4 | Tốc: 3.6. Làn của bạn có thêm Bản Sao AI (chỉ số 100% như bạn, kể cả module chân) tự né đạn, phá thùng/xe tiền & bắn địch. Về 0 HP -> GỤC: đồng đội đứng trong Vòng Cứu 2s để hồi sinh 50% HP (rời vòng >1s thanh tụt; mỗi lần cứu thời gian x2). Chỉ thua khi CẢ HAI cùng gục. Giữ Bắn 0.4s: Chuyển Giao Ý Thức — đổi quyền điều khiển sang xe kia (hồi 3s).',
            type: 'body', role: ['Sinh Tồn', 'Kiểm Soát', 'Đối Đầu'],
            size: { w: 26, h: 26 },
            stats: { hp: 3.5, dmg: 0.75, ammo: 4, speedMult: 1.029 }
        },
        {
            id: 'blood_lord',
            name: 'Huyết Ma',
            desc: '"Máu = sức mạnh!" HP:3 | Dame:0.25 | Đạn:6 (nghỉ 0.5s mới hồi) | Tốc: 4.0. BỂ MÁU (tối đa MaxHP x2): tăng khi bạn hồi máu, đánh trúng địch hoặc BẤT KỲ mục tiêu nào trên sân mất máu; 8s yên ổn -> rút ra hồi HP (3 Bể Máu = 1 HP). Kỹ năng tốn máu chỉ dùng được khi trừ xong vẫn còn >= 0.5 HP (THIẾU MÁU -> nút xám). Giữ Bắn 0.25s xoay 4 dạng: ĐẠN MÁU (1 đạn) | HUYẾT PHÁ (2 đạn + 1 HP): hóa dơi bất tử lao thẳng lên, chạm mục tiêu -> Bầy Dơi 2s rồi giật về (kẻ địch đứng trong đủ 2s -> +1.5 HP) | HUYẾT TIỄN (3 đạn + 1 HP): cảnh báo rồi tia máu xuyên dọc sân | HUYẾT CẦU (toàn bộ đạn + toàn bộ Bể Máu): cầu máu xuyên mọi thứ, nổ ở biên đối diện; từ 50% Bể Máu trở lên cầu to & mạnh và mở BÓNG MA MÀN ĐÊM: lần bắn kế tiếp bay lên trời (không thể bị nhắm), lái vòng cảnh báo, bấm để đáp -> hóa thành Đại Tiệc Máu 3s (ẩn, không thể bị nhắm) rồi về chỗ cũ; chỉ hồi HP (không nạp Bể Máu) và khóa tích Bể Máu 5s.',
            type: 'body', role: ['Sinh Tồn', 'Đối Đầu', 'Cơ Động'],
            size: { w: 28, h: 28 },
            stats: { hp: 3, dmg: 0.25, ammo: 6, speedMult: 1.143 }
        },
        {
            id: 'berserker',
            name: 'Cuồng Chiến Binh',
            desc: '"Càng đau càng mạnh!" HP:6 | Dame:0.25 | Đạn: Vô hạn | Tốc: 4.2. CUỒNG CHIẾN (mốc thay thế nhau theo % Max HP): <=75%: +15% tốc bắn, -10% st nhận, +8% tốc chạy, +15% dame | <=50%: +30%/-20%/+15%/+30% và mở SẤY LIÊN THANH (giữ bắn càng lâu càng nhanh, toả tới 28° sau 1.5s) | <=25%: +50%/-30%/+25%/+50%. Trên 50% HP: bắn nhấp. ĐÁNH TRẢ: nhận >=0.25 st (kể cả mất Khiên) -> +25% tốc chạy 1.5s, +12 Huyết Chiến, viên kế tiếp thành HUYẾT ĐẠN (16x16, x3 dame). HUYẾT CHIẾN (0-100, +4 mỗi phát trúng): đầy mà nhận đòn chí tử -> không chết, khoá máu, giải khống chế; sát thương x10 trừ vào thanh, -12/s, +2 mỗi phát trúng, ngoài vùng an toàn của Bo -40/s; luôn mốc <=25% +35% tốc bắn, +20% tốc chạy, +30% dame. Hết thanh -> chết. NHIỆT (0-100): mỗi phát +3 (Huyết Đạn +6, Huyết Chiến -25%); ngừng bắn 0.4s thì nguội nhanh (35/s khi vẫn giữ nút, 55/s khi thả; luôn tự nguội 5/s). Sấy liên thanh liên tục ~3-4s là QUÁ NHIỆT: không bắn được 1.5s, nhiệt tụt về 40.',
            type: 'body', role: ['Đối Đầu', 'Sinh Tồn'],
            size: { w: 30, h: 30 },
            stats: { hp: 6, dmg: 0.25, ammo: 999, speedMult: 1.2 }
        },
        {
            id: 'kazuki',
            name: 'Kazuki',
            desc: '"Song kiếm vô niệm!" (Collab) HP:5 | Dame:1 | Ý Niệm 100 (+6/s) | Tốc: 3.8. Nhấp: TẢ TRẢM [A] (kiếm khí nón 0.85 dame, gạt vỡ đạn nhỏ, 10 Ý Niệm). Giữ 0.25s rồi nhả: HỮU TRẢM [B] (nhát chém rộng 1.25 dame, 15). Đủ 2 nhịp -> lần bấm kế tung KIẾM THẾ QUYẾT (25, +1 Kiếm Ý): AA Toàn Phong Trảm (lốc kiếm xóa đạn, 1.6) | AB Đột Kích Điểm Huyệt (cảnh báo rồi đâm cột 1.5 + choáng 1s) | BA Thập Tự Trảm (chữ X 1.8 + Vết Thương Sâu: chảy máu, -60% hồi máu 4s) | BB Ảnh Bộ Xuyên Phá (bất tử lướt xuyên địch 1.6 + choáng 1s). Có >=5 Kiếm Ý: Kiếm Thế Quyết hóa LOẠN VŨ HƯ ẢNH (-5 Kiếm Ý): 5 Hư Ảnh khóa chân 1.5s, tổng 2.5 dame, hất tung, -4s hồi Nghịch Trảm. Giữ 0.6s: VÔ TƯỚNG NGHỊCH TRẢM (hồi 14s) thủ thế 0.6s: đỡ trúng -> chặn đòn, choáng địch 1s, Hư Ảnh nổ 2 dame sau 2s, +5 Kiếm Ý & Kiếm Thế Quyết sẵn sàng; đỡ hụt -> khựng 0.3s.',
            type: 'body', role: ['Đối Đầu', 'Cơ Động', 'Kiểm Soát'],
            size: { w: 28, h: 28 },
            stats: { hp: 5, dmg: 1, ammo: 0, speedMult: 1.086 }
        },
        {
            id: 'tsukiyo',
            name: 'Tsukiyo',
            desc: '"Nhận Lệnh!" Nhẫn Giả Thích Ứng. HP:4 | Dame:0.25 | Nội Năng 100 (tự hồi chậm) | Tốc: 3.4. Giữ Bắn 0.75s: đổi 3 PHONG CÁCH. ✦ KỸ THUẬT: nhấp ném Phi Tiêu (3 NN, trúng +8 NN, trượt 0). 🔥 BÍ THUẬT: nhấp (25 NN) đứng yên 0.5s Kết Ấn rồi phun Hỏa Cầu nổ lớn. ⚔ TẤT SÁT: nhấp (30 NN) lướt vút lên chém xuyên mục tiêu (Bất Tử khi lướt). NHẪN ĐẠO: đủ 2 cấp Động Cơ / Bánh Xích / Giáp Thép (Evo 2: 1 cấp; Evo 2 & Full Evo tính thêm 1 cấp mỗi loại) -> chọn 1 trong 3 nhánh (Kỹ Thuật / Bí Thuật / Tất Sát) cho mốc đó trong nút NHẪN ĐẠO ở shop. Hạ gục địch -> kết liễu NGUYỆT TRẢM.',
            type: 'body', role: ['Cơ Động', 'Đối Đầu', 'Kiểm Soát'],
            size: { w: 26, h: 26 },
            stats: { hp: 4, dmg: 0.25, ammo: 0, speedMult: 0.971 }
        },
        {
            id: 'joker',
            name: 'Joker',
            desc: '"Lá bài của ta là JOKER!" (Collab) HP:3.5 | Dame:1 | Đạn: tay bài 5 lá | Tốc: 4.4. RÚT BÀI ĐỊNH MỆNH: hết bài -> xào 1.5s rút tay mới (thấy được bài cạnh xe & trên nút Bắn). Nhấp: PHI BÀI theo chất — Rỗng 15% (không hiệu ứng) | ♥ Cơ 10% (trúng +0.25 HP) | ♦ Rô 25% (trúng +$5, phá thùng +$5, x10 dame lên xe tiền) | ♣ Chuồn 20% (nổ AoE đẩy lùi khi trúng / bay qua làn địch) | ♠ Bích 25% (xuyên thấu + Chảy Máu) | 🃏 JOKER 5% (bay cực nhanh lượn cong, cả 4 hiệu ứng, x2 dame). Giữ 0.35s: TRÁO BÀI (hồi 4s) lướt ngắn + đổi lá kế tiếp sang chất khác. THOÁT HIỂM (1 lần/hiệp): nhận đòn chí tử -> dịch chuyển, để lại hình nhân (địch bắn trúng bị choáng 1.25s), bất tử 2s. Hạ gục địch -> kết liễu ALL IN.',
            type: 'body', role: ['Cơ Động', 'Kiểm Soát', 'Đối Đầu'],
            size: { w: 26, h: 26 },
            stats: { hp: 3.5, dmg: 1, ammo: 0, speedMult: 1.257 }
        },
        {
            id: 'juggernaut',
            name: 'Juggernaut',
            desc: '"Đơn giản là miễn nhiễm!" HP:5.5 (+3 máu xe lớn) | Dame:1.2 | Đạn:4 | Tốc: 3.4. BÁ THỂ TUYỆT ĐỐI: miễn nhiễm 100% khống chế (Chậm, Đóng Băng, Choáng, Trói, Hút/Đẩy/Kéo, Câm Lặng, Mù HUD, Loạn Phím) và đi xuyên lồng giam / tường giới hạn. Mỗi lần hấp thụ khống chế -> MIỄN NHIỄM! (hồi 2s): +0.25 HP, +20% tốc 1.5s, +1 Bá Khí (tối đa 3). Nhấp: ĐẠN PHÁ XIỀNG 1.2 dame; có Bá Khí -> ĐẠN BÁ KHÍ (to x1.5, cực nhanh, +0.8 sát thương chuẩn xuyên khiên). Giữ 0.5s: GIÁP PHẢN CHẤN 1.5s (hồi 6s) giảm 40% st nhận; bị dính hiệu ứng xấu/DoT khi bật -> gạt phăng & phóng Sóng Phản Chấn (hồi 2s). Hạ gục địch -> kết liễu PHÁ XIỀNG.',
            type: 'body', role: ['Sinh Tồn', 'Đối Đầu'],
            size: { w: 36, h: 36 },
            stats: { hp: 5.5, dmg: 1.2, ammo: 4, speedMult: 0.971 }
        },
        {
            id: 'cluster_gun',
            name: 'Pháo Phân Mảnh',
            desc: '"Đạn tách ra: 1 thành nhiều!" HP:5 | Dame:1.5 | Đạn:2 | Tốc: 3.5. Giữ Bắn 0.4s: đổi chế độ đạn. ✸ PHÂN MẢNH: đạn gốc tự tách ở giữa sân thành 3 mảnh tỏa hình nón (chia sát thương gốc); đạn đã bay 0.25s -> nhấp Bắn lần nữa để TÁCH SỚM ngay tại chỗ. ◆ DỄ VỠ (đạn trừng phạt, không thể tự tách): bay như đạn thường, chạm tường/vật cản/xe địch chỉ gây st đơn; nhưng nếu bị ĐẠN ĐỊCH bắn trúng -> nổ tung, phá đạn đó và phóng 8 mảnh văng về phía địch. Hạ gục địch -> kết liễu PHÂN MẢNH.',
            type: 'body', role: ['Đối Đầu', 'Kiểm Soát'],
            size: { w: 30, h: 30 },
            stats: { hp: 5, dmg: 1.5, ammo: 2, speedMult: 1 }
        },
        {
            id: 'clone',
            name: 'Nhân Bản',
            desc: '"1 thành 2, sau đó 3 và 4..." HP:6 | Dame:1 | Đạn:4 | Tốc: 3.5. Nhấp: bắn đạn 1 dame. Giữ Bắn 1s: tạo 1 CLONE THƯỜNG cạnh xe (giữ tiếp -> mỗi 1s thêm 1, tối đa 8 cùng lúc): 24×24, 25% chỉ số của bạn (HP 1.5 | Dame 0.25 | Đạn 4), tự di chuyển & bắn địch, chặn và bị đạn địch bắn hạ. GÁNH CHỊU: mỗi Clone Thường bị hạ -> bạn nhận phản phệ = 50% Máu tối đa của clone đó (xuyên khiên). Hạ gục địch -> kết liễu VÔ HẠN.',
            type: 'body', role: ['Kiểm Soát', 'Đối Đầu', 'Sinh Tồn'],
            size: { w: 30, h: 30 },
            stats: { hp: 6, dmg: 1, ammo: 4, speedMult: 1 }
        },
        {
            id: 'jet_pilot',
            name: 'Phi Công',
            desc: '"Chuẩn bị cất cánh!" HP:8 (6 + 2 máu xe lớn) | Dame:0.5 | Đạn:3 (Hợp Nhất) / 1 (Chân) / 6 (Phi Ảnh) | Tốc: 3.2. Nhấp: 1 TÊN LỬA chủ lực + 2 đạn phụ kẹp hai bên. Giữ 0.5s: CẤT CÁNH (hồi 20s) – sóng năng lượng phá đạn địch xung quanh, tách thành CHÂN (28×28, đạn 1, ăn đạn như thường) và PHI ẢNH (26×26, đạn 6, bay trên không, MIỄN NHIỄM đạn). Khi tách: giữ 0.5s đổi điều khiển. Tự lái Chân: Đạn Nổ diện rộng; Chân AI: pháo cối đánh dấu rơi xuống đầu địch. Tự lái Phi Ảnh: 3 đợt × 2 viên song song; Phi Ảnh AI: tự nhắm 3 viên/đợt + mỗi 5–8s bay oanh tạc rải bom. Giữ 1s: HỢP NHẤT KHẨN CẤP (hồi 40s) – Phi Ảnh thả thảm bom xuống làn địch rồi ghép lại, +1 Khiên. Hạ gục địch -> kết liễu BÁ CHỦ BẦU TRỜI.',
            type: 'body', role: ['Kiểm Soát', 'Cơ Động', 'Đối Đầu'],
            size: { w: 34, h: 34 },
            stats: { hp: 6, dmg: 0.5, ammo: 3, speedMult: 0.914 }
        },
    ],
    FEET: [
        { id: 'speed', name: 'Động Cơ', desc: 'Tăng tốc độ di chuyển. Tối đa 3 lần.', type: 'feet', cost: 30 },
        { id: 'armor', name: 'Giáp Thép', desc: '+1 Máu tối đa.', type: 'feet', cost: 15 },
        { id: 'damage', name: 'Bánh Xích', desc: 'x1.25 Sát thương (3 lần đầu), sau đó giảm dần.', type: 'feet', cost: 20 },
        { id: 'interest', name: 'Lợi Tức', desc: 'Sau mỗi round nhận tiền; càng nhiều tầng mỗi tầng càng sinh lời (30$/72$/126$/192$..., Xe Tiền x2).', type: 'feet', cost: 10 }
    ]
};
