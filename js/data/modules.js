// ==========================================
// Dữ liệu Body / Module
// ==========================================



// --- MODULES & DATA ---
const MODULES = {
    BODY: [
        { id: 'basic', name: 'Cơ Bản', desc: 'HP:9 | Dame:1.2 | Đạn:8 | Tốc +10%. Nạp đạn nhanh hơn 20%, đạn bay nhanh. Evo mua trong shop như thường. BẢN MAIN (8% mỗi trận, Phòng Tập chọn được thẳng): THIÊN PHÚ BẨM SINH có sẵn Full Evo + HỒI ỨC: lần đầu trong trận bị hạ gục -> hồi sinh 100% máu, sóng xung kích, bất tử 3s, Thức Tỉnh vĩnh viễn dạng MAIN (x2 Max HP, +1 Dame/viên, 10 đạn). CƠ HỘI CUỐI (MAIN, hiệp quyết định): tốc chạy/tốc bắn/HP/khiên tăng, đạn Hợp Nhất to + xuyên, làm chậm + thiêu đốt + nổ lan, chạm đúp ←/→ để lướt.', type: 'body', role: ['Đối Đầu', 'Sinh Tồn'], size: { w: 30, h: 30 }, stats: { hp: 9, dmg: 1.2, ammo: 8, speedMult: 1.1 } },
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
        { id: 'storm', name: 'Cuồng Phong', desc: 'HP:3.5 | Giữ tụ lực 3.5s, nhả -> Lao lên làn địch (phản đạn). <50%: Chém. 50%: Gió Lốc 2s. 100%: Lôi Bão 4s (ẩn, bất tử) rồi chém chẻ đôi lốc', type: 'body', role: ['Cơ Động', 'Đối Đầu'], size: { w: 30, h: 30 }, stats: { hp: 3.5, dmg: 2, ammo: 0 } },
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
        { id: 'the_strongest', name: 'Kẻ Mạnh Nhất', type: 'body', role: ['Sinh Tồn', 'Đối Đầu'], size: { w: 30, h: 30 }, desc: 'HP 1. Dùng Chú Lực vô hiệu sát thương. Nhấp: Xanh (Thương, 15 CL). Giữ 1s: tia Đỏ (Hách, 50 CL, cảnh báo 0.5s - đứng yên). Bấm lúc hồi chiêu được xếp hàng. Nhấp đúp nhanh: Hắc Thiểm (1.3 dame + choáng 0.3s, 20 CL, hồi 6s). Bị trúng đòn / câm lặng ngắt niệm (phải nhả nút).', stats: { hp: 1, dmg: 0.5, ammo: 999 } },
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
            desc: 'HP:3.5 (+3 máu xe lớn) | Chú Lực tấn công. Nhấp: nhát Giải 0.3 dame (9 CL, hồi 0.7s). Giữ 1.2s: Phản Chuyển (+0.6 HP, 22 CL). Nhấp đúp nhanh: Hắc Thiểm (1.1 dame + choáng 0.3s, 15 CL, hồi 6s). Bị trúng đòn ngắt niệm.',
            type: 'body', role: ['Đối Đầu', 'Sinh Tồn'],
            size: { w: 36, h: 36 },
            stats: { hp: 3.5, dmg: 2.0, ammo: 999 }
        },
        {
            id: 'paradox',
            name: 'Paradox',
            desc: 'HP:6 | Dame:1.2 | Đạn:5. Có bóng đi sau 3s. Giữ 0.2s tua ngược & tự xả đạn lặp lại (CD: 12s/7s). Giữ tới mốc trống cuối: đặt Neo Thời Không (10s, CD 20s) - lần tua tới về neo (vị trí, máu, đạn). Mỗi lần tua ngược/về neo để lại 1 Vết Nứt Thời Gian (10s, tối đa 3): khi đặt neo, tua ngược hoặc bóng 3s tái hiện phát bắn, mọi vết nứt cùng khai hoả (tụ sáng 0.2s, 25% dame; Full Evo 50%).',
            type: 'body', role: ['Sinh Tồn', 'Cơ Động', 'Kiểm Soát'],
            size: { w: 30, h: 30 },
            stats: { hp: 6, dmg: 1.2, ammo: 5 }
        },
        {
            id: 'magician',
            name: 'Nhà Ảo Thuật',
            desc: 'HP:3 | Dame:1 | Rất Nhanh | Đạn:7. Đánh thường: Phóng Bài (lá bài xoay). Giữ bắn 0.5s tạo Phân Ảnh + Khiên (CD riêng 10s): +Đi = Lướt & Tàng hình, Đứng = Vô địch. Phân ảnh giống hệt bản thể (cùng hình, thanh máu, đạn, khiên). Có >= 2 phân ảnh: địch thấy Khiên Giả & Số Đạn Giả. Thoát Chết: đòn chí mạng -> dịch chuyển đi chỗ khác, để lại phân ảnh mồi (1 lần/hiệp). Mưa mũ ảo thuật khi tạo bóng.',
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
            desc: 'HP:2 | Dame:1 | Đạn:1 (Thuần Farm). Ăn/Phá Rương & Xe cộng vĩnh viễn chỉ số (Thùng Băng: tỉ lệ làm chậm khi bắn trúng; Miễn Nhiễm: +HP & lượt miễn nhiễm đầu hiệp; Tốc: +tốc chạy; Lazer: +ST; Khống Chế: +HP; Giáp Ảo: +HP & Giáp Trắng đầu hiệp; Giảm ST: giảm sát thương nhận vĩnh viễn (tối đa 10%); Xe Buff/Hồi Máu/Tấn Công: +ST/+HP/+tốc). Rương Giả Mạo (Mimic). Late game bất khả chiến bại.',
            type: 'body', role: ['Sinh Tồn', 'Đối Đầu'],
            size: { w: 30, h: 30 },
            stats: { hp: 2, dmg: 1, ammo: 1, speedMult: 1.0 }
        },
        {
            id: 'death_lock',
            name: 'Trối Chết (DeathLock)',
            desc: 'HP:6 (+2 máu xe lớn) | Dame:0.8 | Đạn:3 | Tốc: 0.8x. Nội tại Ràng Buộc: 4 tầng ấn (tầng 3: Choáng 1.5s + KHÓA CƠ ĐỘNG - cấm lướt/nhảy/lao/bay/dịch chuyển tới khi hết ấn hoặc nổ tầng 4). Đạn Cấm Chế: Lồng Xích hút & giam giữ; địch trong Lồng luôn bị Khóa Cơ Động (trừ Juggernaut).',
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
            desc: '"Cuộc săn bắt đầu, Oca tìm chúng!" HP:4 | Dame:0.5 (Tiểu Liên) / 4 (Sniper) | Đạn:10 / 4 | Tốc: 3.8. Giữ Bắn 0.4s đổi súng (hồi 4s). TIỂU LIÊN: nhấp xả loạt 3 viên; đổi sang -> lướt ngang. SNIPER: nhấp -> đứng yên ngắm 0.4s rồi bắn đạn cực nhanh; đổi sang -> thả Bom Khói 2s (đứng trong khói né mọi đạn). OCA (máu = 50% Raven, tự hồi sinh): khi cầm Tiểu Liên thì tàng hình, định kỳ khóa vị trí địch (vạch ngắm đỏ) rồi lao THẲNG tới điểm đó cắn gây dame + làm chậm (không đổi hướng giữa chừng -> né được); dính EMP thì Oca bị vô hiệu tạm thời; khi cầm Sniper thì bay cao đánh dấu radar -> đạn Sniper tự khóa mục tiêu, xuyên vật thể & bay nhanh hơn.',
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
            desc: '"Hai cá thể, một ý thức!" HP:3.5 x2 xe | Dame:0.75 | Đạn:4 | Tốc: 3.6. Làn của bạn có thêm Bản Sao AI (chỉ số 100% như bạn, kể cả module chân) tự né đạn (nhưng biết MỆT: né liên tục sẽ chậm & phản xạ kém dần, hồi khi nghỉ; né tia/hitscan kém hơn), phá thùng/xe tiền & bắn địch. Về 0 HP -> GỤC: đồng đội đứng trong Vòng Cứu 2s để hồi sinh 50% HP (rời vòng >1s thanh tụt; mỗi lần cứu thời gian x2). Chỉ thua khi CẢ HAI cùng gục. Giữ Bắn 0.4s: Chuyển Giao Ý Thức — đổi quyền điều khiển sang xe kia (hồi 3s).',
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
            desc: '"Lá bài của ta là JOKER!" (Collab) HP:3.5 | Dame:1 | Đạn: tay bài 5 lá | Tốc: 4.4. RÚT BÀI ĐỊNH MỆNH: hết bài -> xào 1.5s rút tay mới (thấy được bài cạnh xe & trên nút Bắn). Nhấp: PHI BÀI theo chất — Rỗng 15% (không hiệu ứng) | ♥ Cơ 10% (trúng +0.25 HP) | ♦ Rô 25% (trúng +$5, phá thùng +$5, x10 dame lên xe tiền) | ♣ Chuồn 20% (nổ AoE đẩy lùi khi trúng / bay qua làn địch) | ♠ Bích 25% (xuyên thấu + Chảy Máu) | 🃏 JOKER 5% (bay cực nhanh lượn cong, cả 4 hiệu ứng, x2 dame). LÁ BÀI A (nội tại): đầu hiệp đọc Vai Trò Chính của body địch -> chất tương ứng +5% tỉ lệ rút (Rỗng còn 10%) & được cường hóa (huy hiệu A trên HUD): địch Đối Đầu -> ♠ +0.25 st xuyên giáp, Chảy Máu 3s, địch -15% tốc bắn 3s | Kiểm Soát -> ♣ nổ to +35%, để vùng làm chậm 2s, x3 st lên Vật Triệu Hồi/Tường, xóa Vũng mặt đất của địch tại tâm nổ | Cơ Động -> ♦ bay nhanh +25%, homing nhẹ, làm chậm 30% 1.5s | Sinh Tồn -> ♥ hồi +0.4 HP & địch -50% hồi máu 4s (Evo 2 x1.25, Full Evo x1.5). Giữ 0.35s: TRÁO BÀI (hồi 4s) lướt ngắn + đổi lá kế tiếp sang chất khác. THOÁT HIỂM (1 lần/hiệp): nhận đòn chí tử -> dịch chuyển, để lại hình nhân (địch bắn trúng bị choáng 1.25s), bất tử 2s. Hạ gục địch -> kết liễu ALL IN.',
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
            desc: '"Chuẩn bị cất cánh!" HP:8 (6 + 2 máu xe lớn) | Dame:0.5 | Đạn:3 (Hợp Nhất) / 1 (Chân) / 6 (Phi Ảnh) | Tốc: 3.2. Nhấp: 1 TÊN LỬA chủ lực + 2 đạn phụ kẹp hai bên. Giữ 0.5s: CẤT CÁNH (hồi 20s) – sóng năng lượng phá đạn địch xung quanh, tách thành CHÂN (28×28, đạn 1, ăn đạn như thường) và PHI ẢNH (26×26, đạn 6, bay trên không, MIỄN NHIỄM đạn). Khi tách: giữ 0.5s đổi điều khiển. Tự lái Chân: Đạn Nổ diện rộng; Chân AI: pháo cối đánh dấu rơi xuống đầu địch. Tự lái Phi Ảnh: 3 đợt × 2 viên song song; Phi Ảnh AI: tự nhắm 3 viên/đợt + mỗi 5–8s bay oanh tạc rải bom. Giữ 1s: HỢP NHẤT KHẨN CẤP (hồi 40s) – Phi Ảnh thả thảm bom xuống làn địch rồi ghép lại, +1 Khiên. Mọi bom oanh tạc đều có vòng cảnh báo ⚠ 1s trước khi nổ. Hạ gục địch -> kết liễu BÁ CHỦ BẦU TRỜI.',
            type: 'body', role: ['Kiểm Soát', 'Cơ Động', 'Đối Đầu'],
            size: { w: 34, h: 34 },
            stats: { hp: 6, dmg: 0.5, ammo: 3, speedMult: 0.914 }
        },
        {
            id: 'tat_sat',
            name: 'Tất Sát',
            desc: '"Quên ta rồi sao? NHẤT KIẾM TẤT SÁT!" HP:3.5 | Dame:2 | Năng lượng: Tụ lực (4.5s đầy 100%) | Tốc: 5.0. Giữ Bắn tụ lực, nhả theo mốc: 1–49% LƯỚT CHÉM CẢNH BÁO – lao lên, chạm vật/biên tạo vùng đỏ (32–68px theo lực) nổ sau 0.7s 1x dame, xe giật về chỗ cũ. 50–85% PHÂN ẢNH ĐOẠT MỆNH – slow-motion 0.4s, phóng Phân Ảnh: trúng tướng -> ẩn thân 2s (Bất Tử, không thể bị nhắm) LIÊN HOÀN TRẢM & CHÉM NÁT MÀN HÌNH x3 dame; trúng thứ khác -> 2 vùng đồng tâm (42px Choáng 2s sau 0.4s | 78px nổ 1x sau 0.7s). 86–100% NHẤT KIẾM TẤT SÁT – cột cảnh báo 0.6s (rộng 24px) rồi chém hitscan (Tường Sniper chặn): trúng -> combo ẩn thân 2s x6 dame; trượt -> lướt vút theo đường kiếm rồi về. Hạ gục địch -> kết liễu NHẤT KIẾM TẤT SÁT!',
            type: 'body', role: ['Đối Đầu', 'Cơ Động'],
            size: { w: 30, h: 30 },
            stats: { hp: 3.5, dmg: 2, ammo: 0, speedMult: 1.4286 }
        },
        {
            id: 'one_punch',
            name: 'Nhất Quyền / Một Đấm',
            desc: '"Chỉ cần một đấm." HP:8 | Dame:2.5 | Đạn:1 (nạp 2.2s; mỗi viên đạn cộng thêm -> +20% tốc nạp & +15% st) | Tốc: 3.6. THÚ VỊ: nhận sát thương (tính st gốc) -> +22% Thú Vị mỗi 1 dame; Thú Vị tăng tốc chạy (tối đa +35%) & giảm st nhận (tối đa 30%). 5s không bị đánh -> tiêu Thú Vị hồi máu (10% = +1 HP). Nhấp: ĐẤM THƯỜNG - gồng quyền 0.35s, vạch cảnh báo đỏ khoá trục X lúc nhấp (né được!) rồi phóng cột áp lực dọc sân: tâm 1.8 st, đẩy lùi & phá 1 lớp Khiên; rìa 0.6 st; xoá đạn thường trên đường quyền, x3 st lên Tường/Vật triệu hồi. Giữ 1s khi Thú Vị >= 55% (hồi 12s): ĐẤM NGHIÊM TÚC - khi tụ giảm 50% st nhận, miễn đẩy/kéo, hiện đường cảnh báo đỏ; nhả -> tiêu hết Thú Vị nhận GIÁP ẢO (tối đa 4, giảm dần 12s), hitscan 4.0 st xuyên MỌI tường, xoá đạn/triệu hồi/vũng trên đường. Hạ gục địch -> kết liễu CÚ ĐẤM RẼ ĐÔI BẦU TRỜI.',
            type: 'body', role: ['Đối Đầu', 'Sinh Tồn'],
            size: { w: 30, h: 30 },
            stats: { hp: 8, dmg: 2.5, ammo: 1, speedMult: 1.0286 }
        },
        {
            id: 'boomerang',
            name: 'Boomerang',
            desc: '"Ném đi... và luôn quay về!" HP:4.5 | Dame:1.0 | Đạn: 2 Boomerang độc lập | Tốc: 3.9. Nhấp: ném chiếc đang chọn; giữ 0.4s: đổi chiếc. TRỌNG LUÂN (Thẳng): bay dọc theo trục x cố định gây 0.75x mọi thứ xuyên qua, tới làn địch dừng lại phóng to (r=46) xoay 2s (0.18x mỗi 0.2s, làm chậm nhẹ), rồi bay ngược về cùng trục x gây 0.75x (vạch chỉ đường xanh lá). BẮT được khi nó về -> hồi 0.5s + HỨNG KHỞI 3s (+20% tốc chạy & dame cả 2 chiếc); để lọt qua lưng -> rơi mất, hồi 8s. NGUYỆT LUÂN (Vòng Cung): bay theo quỹ đạo ELIP cố định (hiện vạch nét đứt) — 2 đỉnh là chỗ bạn ném và mép xa làn địch, phình ra 1 cánh (ưu tiên phía địch / hướng đang chạy); nửa đi 0.9x, nửa về 0.6x, ~1.5s một vòng. Đứng ở đỉnh ném khi nó về -> BẮT, về tay ngay; bỏ đi chỗ khác -> TRƯỢT, hồi 2s. Hạ gục địch -> kết liễu KHÔNG LỐI THOÁT.',
            type: 'body', role: ['Kiểm Soát', 'Cơ Động'],
            size: { w: 28, h: 28 },
            stats: { hp: 4.5, dmg: 1.0, ammo: 2, speedMult: 1.1143 }
        },
        {
            id: 'arachnid',
            name: 'Nhện Độc',
            desc: '"Hóa kén... rồi kết liễu!" HP:5.5 | Dame:1.1 | Đạn:3 | Tốc: 3.8. Nhấp: ĐẠN TƠ ĐỘC 1.1 st -> để lại VÙNG TƠ NHỆN 4s (chậm 30%) dưới chân địch & +1 tầng TƠ QUẤN (6s). Đạn chạm biên / vật cản cũng tạo Vùng Tơ (tối đa 3 vùng); Nhện đứng trên tơ +25% tốc chạy. Đủ 4 tầng -> HÓA KÉN 1.75s: choáng hoàn toàn (không đi, không bắn, không kỹ năng) & Lộ Điểm Yếu +25% st nhận (Juggernaut vẫn bị bọc kén nhưng miễn choáng). Giữ 0.5s (hồi 9s): CÚ VỒ ĐOẠT MỆNH - lao thẳng lên cắn 1.5 st, +2 tầng Tơ, hồi 0.5 HP rồi bật về làn. Khi địch trong Kén: khoá mục tiêu 100% (bất tử khi lao), xé kén 2.5x dame + 15% máu đã mất, hút 1.25 HP, hoàn 50% hồi chiêu; máu địch < 15% Max HP -> XỬ TỬ (xuyên Khiên). Hạ gục địch -> kết liễu HÓA KÉN KẾT LIỄU.',
            type: 'body', role: ['Đối Đầu', 'Kiểm Soát'],
            size: { w: 30, h: 30 },
            stats: { hp: 5.5, dmg: 1.1, ammo: 3, speedMult: 1.0857 }
        },
        {
            id: 'psychokinesis',
            name: 'Siêu Năng',
            desc: '"Tất cả... dừng lại cho ta!" HP:4 | Dame:0.85 | Đạn:6 (nạp 1.2s/viên) | Tốc: 3.65. Nhấp: ĐẠN NIỆM LỰC trôi lệch sang bên, lơ lửng giảm tốc 0.45s rồi vút đi (tốc 12); xả liên tiếp được nhiều viên. Giữ 1s (hồi 11s): VÙNG NIỆM LỰC r=135 theo xe tối đa 5s (xe -20% tốc): MỌI đạn đạo của địch (đạn thường/lớn, tên lửa, pháo cối, bom, phi kiếm, cầu lửa/băng, mìn bay, kim, boomerang, liềm xích... cả đạn Xe Tấn Công & chùm đạn Thùng Đạn) lọt vào bị thắng phanh, dừng lơ lửng lệch nhịp, hoá xanh lơ & thuộc về bạn (giữ nguyên st; tối đa 15 viên). Không chặn: hitscan / tia lazer (mở ở Evo 2). PHẢN CHẤN: địch lao cận chiến mặt đất (Xe TANK, lướt chém, lao húc...) chạm vùng -> bị chặn tại rìa, hất về làn cũ, nhận 1.0 st & Choáng 1.25s (Juggernaut không bị choáng; đòn bổ từ trên trời như Thiên của Hoa Ảnh bỏ qua). Trong vùng: nhấp (hoặc hết giờ) -> PHẢN HỒI NGƯỢC QUỸ ĐẠO +30% tốc; giữ 1s -> KHOÁ TÂM TẤT SÁT: hiện đường ngắm rồi hội tụ về địch (homing nhẹ), hồi chiêu +2s. Hạ gục địch -> kết liễu TÂM NIỆM NGHIỀN NÁT.',
            type: 'body', role: ['Kiểm Soát'],
            size: { w: 28, h: 28 },
            stats: { hp: 4.0, dmg: 0.85, ammo: 6, speedMult: 1.0429 }
        },
        {
            id: 'tailor',
            name: 'Thợ May',
            desc: '"Kim chỉ là vũ khí sao?" HP:4 | Dame:0.8 | Đạn:4 Kim Khâu | Tốc: 3.7. Nhấp: KIM KHÂU bay nhanh -> chạm biên / vật cản / trúng đích cắm thành CỌC CHỈ 8s (tối đa 3, bắn cây thứ 4 cọc cũ nhất mất). ĐƯỜNG CHỈ CĂNG nối Thợ May với các cọc & các cọc với nhau: địch chạm chỉ bị Làm Chậm 35% & 0.25 st/s. Trúng trực tiếp -> MŨI KHÂU 5s nối địch vào cọc gần nhất (chạy xa quá 180px bị giật ngược lại). Giữ 0.6s (hồi 7s): RÚT CHỈ XIẾT CHẶT - mọi cọc phóng về Thợ May cắt xuyên mọi thứ (0.6 st mỗi cây); địch đang Mũi Khâu / chạm chỉ -> KHÂU CHÉO: kéo về tâm các cọc, 1.2 st & Trói Chân 1.25s (Juggernaut miễn kéo/trói/chậm). BÚP BÊ KÉP (bị phá -> hồi sinh 14s): BÚP BÊ TRẮNG HỘ MỆNH trên nửa sân mình (HP = 50% Max HP) gánh thay mọi st từ địch nhưng nhận x2.0; mọi hồi máu của kỹ năng vào Búp Bê trước (tràn -> 50% cho xe); bắn Kim vào Búp Bê -> TRẠM CHỈ nối vào mạng chỉ, mỗi lần mạng chỉ / kim gây st lên địch hồi Búp Bê +0.35 (tối đa 1 lần / 0.75s). BÚP BÊ ĐEN NGUYỀN RỦA trôi chậm trước làn địch (HP 3, đạn địch phá được): Kim trúng -> choáng địch 0.75s (hồi 3.5s, Juggernaut miễn) & cắm Cọc tại đó; sợi chỉ xuyên qua Búp Bê Đen -> st chỉ & Rút Chỉ +40%. Hạ gục địch -> kết liễu ĐƯỜNG KIM MŨI CHỈ.',
            type: 'body', role: ['Kiểm Soát'],
            size: { w: 26, h: 26 },
            stats: { hp: 4.0, dmg: 0.8, ammo: 4, speedMult: 1.0571 }
        },
        {
            id: 'jack_6_lo',
            name: 'Jack - 6 Lỗ',
            desc: '"MỘT VÁN NỮA, CƯỢC ĐI CƯỢC ĐI NÀO HAAHAHA!" HP:4.5 | Dame:1.0 | Đạn:4 (đôi khi 5–6) | Tốc: 3.6. NỘI TẠI CỜ BẠC: Reroll shop đầu tiên mỗi hiệp miễn phí, +1 ô lựa chọn shop & G.E.A.R. CHỈ SỐ BẤT ĐỊNH: đầu hiệp HP/Dame/Tốc random ±30% (tổng cân bằng). TUNG XU mỗi 3s: NGỬA -> LUCK 12s (xóa Nợ, +20% tốc, -15% st nhận, 20% né, Chí Mạng 50%); ÚP -> +1 NỢ (-4% tốc tối đa -40%, +5% st nhận). Đạn thường 25% Chí Mạng x2. Nhấp: HANDER xả ngẫu nhiên 1–4 viên hình nón; nạp 1.4s, 25% nhét lố 5–6 viên (Luck: 60% ra 6). Giữ 1s: THE BOY - Cò Quay Nga, không thể cất súng, mỗi nhấp bóp 1 lỗ (1s/lần): Phát 1 x6 đại đạn nổ homing | Phát 2–3 x2 nổ nhỏ | Phát 4–5 x1.5 "Nah, chán!" | trống "CẠCH!" | Phát 6 nổ ngược: Choáng 1.25s & tự nhận 2.0 st (bỏ qua khiên). Hồi 2s (nổ ngược: 6s). Hạ gục bằng The BOY -> kết liễu JACKPOT 777!',
            type: 'body', role: ['Đối Đầu', 'Cơ Động'],
            size: { w: 28, h: 28 },
            stats: { hp: 4.5, dmg: 1.0, ammo: 4, speedMult: 1.0286 }
        },
        {
            id: 'kusarigama',
            name: 'Kusarigama',
            desc: '"Nếm máu... có vị gì nhỉ?" HP:5 | Dame:0.25 (Tích Lũy x1 -> x3) | Đạn: — (Xích Liêm) | Tốc: 4.5. HÚT MÁU 25% mọi st gây ra; mọi đòn trúng gây CHẢY MÁU 0.2 HP/s trong 3s (cũng hút máu). TÍCH LŨY SÁT Ý: không ra đòn +2 tầng/s (tối đa 5) -> dame x1.0 -> x3.0, ra đòn về 0. Giữ 0.5s: đổi Phong Cách; nhấp: ra đòn. ⚔ TRẢM (hồi 0.6s): ném liềm xuyên tới biên (không st) rồi giật về chém 1.0x; địch đang Chảy Máu -> x2, kéo giật & hút máu x2. ⛓ KHÓA (hồi 1.2s): tạ xích tạo LỐC MÁU r 55->110 tối đa 3s, chậm 35%, 0.5x mỗi 0.25s; nhấp lại thu xích nổ 1.0x. 🌀 LINH (hồi 2.5s): lướt lên (vẫn ăn đạn), chạm địch / vật cản / hết tầm -> Vòng Cảnh Báo 1s r 75->140 rồi xoay 360°: hút mạnh, Choáng 1s, tổng 4.0x, bật về làn. CUỒNG HUYẾT (máu chạm 1.0, 1 lần / hiệp): chặn ở 1 HP, giải khống chế, Bất Tử 3s; máu khoá, mọi hút máu / hồi máu -> GIÁP TRẮNG x1.25 (tụt 0.2/s); Tích Lũy nhanh x2, +15% tốc, chiêu cường hoá (Trảm lượt đi 50% st & luôn x2 + vệt máu; Lốc to hơn đuổi theo & hút vào; Linh giảm 50% st khi lướt, cảnh báo 0.5s, +0.5 Giáp Trắng). Juggernaut miễn kéo/choáng/chậm. Hạ gục địch -> kết liễu HUYẾT LIÊM ĐOẠT MỆNH.',
            type: 'body', role: ['Đối Đầu', 'Sinh Tồn'],
            size: { w: 26, h: 26 },
            stats: { hp: 5.0, dmg: 0.25, ammo: 0, speedMult: 1.2857 }
        },
        {
            id: 'the_clock',
            name: 'The Clock',
            desc: '"Tích tắc... Đủ 24 nhịp kim gõ, thời gian sống của ngươi chính thức khép lại!" HP:4.5 | Dame:0.25 (Time Zone: 0.5) | Đạn:4 | Tốc: 3.8. Nhấp: bắn Kim Giây. ĐẾM NGƯỢC: mỗi phát trúng +1 nhịp trên địch (1 -> 24, giữ cả hiệp): cứ mỗi 3 nhịp CHOÁNG 1s; 12 nhịp mở DƯ CHẤN (mỗi lần Time Zone kết thúc địch khựng 0.25s); 24 nhịp -> KẾT LIỄU TỨC THÌ (xuyên máu, giáp, khiên). Giữ 0.5s (hồi 12s): TIME ZONE 5s toàn sân — địch, vật triệu hồi & đạn địch ngưng đọng; bạn di chuyển & bắn tự do nhưng không nạp đạn, đạn bắn ra hóa KIM GIỜ CƯỜNG HÓA (0.5 dame, xuyên vật cản, chậm 35% 1.5s) treo lơ lửng, hết giờ (hoặc giữ 0.4s tắt sớm) đồng loạt phóng đi. Ngoại lệ: Chrono vẫn bắn nhưng không di chuyển, Neo di chuyển nhưng không bắn; Paradox vừa Tua Ngược hoạt động bình thường. Hạ gục -> ĐỒNG HỒ ĐIỂM 12 GIỜ.',
            type: 'body', role: ['Kiểm Soát', 'Cơ Động'],
            size: { w: 28, h: 28 },
            stats: { hp: 4.5, dmg: 0.25, ammo: 4, speedMult: 1.0857 }
        },
        {
            id: 'coc',
            name: 'The Change or Chance — COC',
            desc: '"Vận mệnh trong tay ta nắm!" HP:4.5 | Dame: theo vũ khí | Đạn: theo vũ khí | Tốc: 3.5 (± vũ khí). NỘI TẠI CỜ BẠC: Reroll shop đầu tiên mỗi hiệp miễn phí, +1 ô lựa chọn shop & G.E.A.R. XÚC XẮC VẬN MỆNH: đầu hiệp & mỗi 12s lăn ra 1 trong 6 vũ khí (không trùng mặt vừa dùng): ⚀ SÚNG LỤC 2.0 | 10 viên | tốc 4.5 - bắn chuẩn, sau mỗi phát lướt nhẹ, nạp 1.2s. ⚁ TIỂU LIÊN 0.5 | 20 viên | tốc 4.0 - giữ liên thanh; hết băng: trúng > 10 viên -> hồi đầy ngay, không thì phạt nạp 6s. ⚂ ĐẠI PHÁO 2.0 | 2 viên | tốc 3.0 - đạn nổ lan, x3 st lên vật không phải Body, nạp 1.8s. ⚃ ĐOẢN ĐAO 1.0 | vô hạn (0.6s) | tốc 5.5 - nhấp lao lên chém vòng (chém vỡ đạn thường) + kiếm khí ngắn, 35% Chí Mạng x3. ⚄ BÚP BÊ SONG SINH | tốc 3.75 - nhấp ra lệnh: L (hồi 5s) cảnh báo 0.5s rồi bắn tia lazer xuyên 2.0; R (hồi 1s) loạt 3 viên 0.5. ⚅ SÚNG VÀNG 5.0 | 1 viên | tốc 3.5 - đạn vàng homing nhẹ, nạp 2.5s. Hạ gục địch -> kết liễu ĐỊNH MỆNH AN BÀI.',
            type: 'body', role: ['Đối Đầu', 'Cơ Động'],
            size: { w: 28, h: 28 },
            stats: { hp: 4.5, dmg: 1.0, ammo: 10, speedMult: 1.0 }
        },
        {
            id: 'prism',
            name: 'Phản Chiếu',
            desc: '"Lazer sao? Hay là đạn xuyên thủng? Nếu không chuẩn xác... ngươi sẽ phải trả giá bằng máu của chính mình!" HP:4.5 | Dame:1.0 | Đạn:5 | Tốc: 3.6. Nhấp: Tia Khúc Xạ bay cực nhanh, nảy tường 1 lần. KÍNH LẤP LÁNH: mọi Khiên hóa Khiên Kính — bị đánh trúng thì bật Kính 1.2s phản mọi đòn (40% dame, bị phạt 0.5 HP mỗi đợt) rồi vỡ. Giữ 0.4s (hồi 9s): MỞ KÍNH 1.5s (dùng trước mọi khiên khác); 0.25s đầu = CỬA SỔ VÀNG: miễn sát thương, phản 100% + đạn phản tăng tốc. Lazer Xuyên Phá: chỉ phản ngược được trong 0.125s đầu, ngoài ra bị khúc xạ lệch & mất 2.0 HP. Hạ gục -> VẠN KÍNH QUY QUANG.',
            type: 'body', role: ['Sinh Tồn', 'Kiểm Soát'],
            size: { w: 28, h: 28 },
            stats: { hp: 4.5, dmg: 1.0, ammo: 5, speedMult: 1.0286 }
        },
        {
            id: 'the_adapter',
            name: 'The Adapter',
            desc: '"Ngươi càng ra đòn, ta càng bất bại. Đánh càng lâu... tử huyệt của ngươi càng phơi bày!" HP:5.5 | Dame:1.0 (tăng dần) | Đạn:4 | Tốc:3.6. THÍCH ỨNG VAI TRÒ (đầu hiệp, theo vai trò chính của địch): Đối Đầu +0.5 Max HP & đạn đẩy lùi ngang; Kiểm Soát đạn x2.5 lên vật triệu hồi/tường & -35% Làm Chậm nhận vào; Cơ Động +0.3 tốc & đạn nhanh hơn 30%; Sinh Tồn địch -35% hồi máu & +0.3 dame vào Giáp Trắng. VÒNG XOAY THÍCH ỨNG (tối đa 6 nấc): +1 nấc mỗi 3.5s hoặc mỗi 1.0 sát thương nhận vào; mỗi nấc -6% sát thương nhận, +0.12 dame, +5% tốc chạy & tốc nạp. Lên nấc khi đang bị Đốt/Chảy Máu -> xoá hiệu ứng; khi đang ăn đạn liên thanh -> +0.3 Giáp Trắng. PHÂN TÍCH TỬ HUYỆT: địch bắn đủ 4 lần hoặc bạn bắn trúng 2 lần -> +1 tầng Lộ Điểm Yếu (tối đa 5): địch nhận +7% sát thương từ bạn, đạn địch chậm 4% & nạp đạn chậm 4% mỗi tầng. Giữ 0.4s (hồi 7.5s) ÉP XUNG BẮT BÀI: +1 nấc, hồi 0.3 HP, lướt ngang né đạn & bắn Đạn Khai Thác Tử Huyệt (1.1 + 0.2/tầng dame, Làm Chậm 30% 1.5s). Hạ gục -> PHÂN TÍCH HOÀN TẤT: 100% LỖI.',
            type: 'body', role: ['Sinh Tồn', 'Đối Đầu'],
            size: { w: 30, h: 30 },
            stats: { hp: 5.5, dmg: 1.0, ammo: 4, speedMult: 1.0286 }
        },
        {
            id: 'tinh',
            name: 'Tỉnh',
            desc: '"Ngươi đang cố chạy sao?" HP:5.5 | Dame:1.1 | Đạn:4 | Tốc:3.4. KHÓ CHỊU (0-10): địch Lướt/Lao/Dịch Chuyển -> +2; địch đi > 160px trong 1.2s -> +1. Mỗi hành động gây khó chịu đóng +1 tầng NGƯNG lên địch (5s, -20% tốc mỗi tầng); đủ 3 tầng: CHOÁNG CỨNG 3s + 0.8 sát thương chuẩn (miễn tích lại 1.5s sau khi tỉnh). ĐẠN CẤM CHẾ: khi Khó Chịu >= 5, phát bắn kế tiếp tự tiêu 5 điểm (hoặc giữ 0.4s để nạp sẵn, nhả để bắn): to x1.5, nhanh x2, x1.6 dame, xuyên vật cản; trúng/chạm biên sân địch mở VÙNG CẤM CHẾ r125 trong 4s — địch bên trong bị nhốt, không thể bước hay lướt ra (trừ Juggernaut). Hạ gục -> NGƯNG ĐỌNG VĨNH HẰNG.',
            type: 'body', role: ['Kiểm Soát', 'Đối Đầu'],
            size: { w: 30, h: 30 },
            stats: { hp: 5.5, dmg: 1.1, ammo: 4, speedMult: 0.9714 }
        },
        {
            id: 'wind',
            name: 'Wind',
            desc: '"Cơn gió mỏng manh... chạm vào là tan biến, ngưng đọng là cuồng phong!" HP:3 | Dame:0.8 | Đạn:6 | Tốc: 4.4. GIÓ NHẸ: ngừng bắn 0.5s thì NGƯNG PHONG tích +35% dame/giây (tối đa x2.5, đạn gió to, bay nhanh, đẩy lùi); bắn liên tục (cách nhau <1.2s) tích LIÊN PHONG tối đa 6 tầng (+15% tốc bắn & +12% tốc nạp mỗi tầng). Giữ 0.4s (hồi 8s): HÓA GIÓ tối đa 3.5s — bất tử, đạn bay xuyên qua, +35%→55% tốc chạy, nạp đạn & tích Ngưng Phong x2; PHẢI di chuyển liên tục (đứng yên 0.15s, bắn hoặc hết giờ là hiện hình). Hiện hình: CUỒNG PHONG TỐC XẠ +50% tốc bắn 2.5s, phát đầu giữ nguyên Ngưng Phong.',
            type: 'body', role: ['Đối Đầu', 'Cơ Động'],
            size: { w: 24, h: 24 },
            stats: { hp: 3, dmg: 0.8, ammo: 6, speedMult: 1.2571 }
        },
        {
            id: 'diep_thanh_phong',
            name: 'Diệp Thanh Phong',
            desc: '"Cơn gió nhẹ thoảng qua... nhưng đủ sức cuốn phăng vạn vật!" (Collab) HP:4 | Dame:1 | Đạn: 100 Gió (hồi 8/s) | Tốc: 3.9. KHÍ ÁP 0-100 (khởi đầu 50): THUẬN PHONG (0-33) +20% tốc, +35% hồi Gió, đòn trúng hoàn 35% Gió | BÃO HÒA (34-66) -25% Gió tiêu hao, +12% dame, +10% tốc, Khí Áp nhạy x1.5, LOẠN PHONG mỗi 10s gạt đạn & +1 Khiên Gió | NGHỊCH PHONG (67-100) +25% dame; ở đủ 8s (hoặc chạm 100: ngay 4s) TOÀN PHONG: địch -20% tốc, +15% st nhận, trúng đòn bị GIÓ CẮT 0.25 HP/s 2.5s. KHIÊN GIÓ: khiên xanh vỡ -> lốc xung kích 110px (Bão Hòa 165px) xoá đạn thường, đẩy lùi, +25% tốc 1.5s. Nhấp: chiêu theo Thế Quạt; giữ 0.5s rồi nhả: đổi Thế (Thuận <-> Nghịch Vũ); giữ tới 1s (hồi 8s): ĐỔI KHÍ ÁP sang vùng kế tiếp, +20 Gió. THUẬN PHONG VŨ (-10 Khí Áp, Chuỗi 3 Nhịp): Lốc Xoáy 0.8 (+20% tốc) / Nhịp 3 Đại Cuồng Phong nuốt đạn địch lớn dần, nổ Bão Lớn 2.5s | Khai Phong lưỡi gió 1.0 + lướt / Nhịp 3 Tam Liên Phong Nhận | Phong Vũ lướt lên, Vòng Cảnh Báo 1.2s rồi xoay quạt 1.2 (vật thể văng về phía địch nổ 1.0; địch bị đẩy lùi + chậm 40%) / Nhịp 3 BÃO QUẠT TUYỆT VŨ hóa lốc phản đạn lao tới, Múa Quạt 3s bất tử (hút, 0.4/0.3s) rồi nhát chém 2.0. NGHỊCH PHONG VŨ (+20 Khí Áp, nhấp mở nuôi / nhấp lại phóng): Phong Tụ Cầu (10 + 8/s, 4s) xuyên vật cản 1.0-2.5, nổ Vùng Cuồng Phong chậm 45% | Nuôi Lốc Hộ Thể (12 + 6/s, 5s) Giáp Gió -25% st & +20% tốc, lốc ngoằn ngoèo hất tung choáng 1.5-3s, 1.5-2.8 dame | CỬU THIÊN PHONG VŨ (15 + 10/s, 5s): bay lên trời (bất tử) lái Vòng Cảnh Báo; nhấp đáp: <2s quét 1.4, 2-4s múa quạt 2s, >4s THIÊN PHONG BÃO VŨ 6s hút cực mạnh, giây thứ 3 bản thể về nhà để Ảo Ảnh Gió múa tiếp; giữ 0.5s trên không: để lại Vòng Cảnh Báo tự nuôi 4s (Ảo Ảnh tự đáp 65%) & dịch chuyển về nhà. Hạ gục -> PHONG THẦN TUYỆT TỨC.',
            type: 'body', role: ['Kiểm Soát', 'Cơ Động'],
            size: { w: 26, h: 26 },
            stats: { hp: 4.0, dmg: 1.0, ammo: 100, speedMult: 1.1143 }
        },
        {
            id: 'railgun',
            name: 'Railgun',
            desc: '"Only my railgun - Đùa Thôi" HP:4.5 | Dame:0.9 → 2.4 (theo thời gian nạp) | Đạn:4 (nạp 0.9s/viên) | Tốc: 3.6. TỪ TRƯỜNG: nhấp lần 1 (tốn 1 đạn) tạo QUẢ CẦU NĂNG LƯỢNG lơ lửng trước mũi xe, bám theo xe & tự nạp: 1s SƠ CẤP 1.4 st +35% tốc, XUYÊN VẬT THỂ | 2s TRUNG CẤP 1.9 st +70% tốc, XUYÊN GIÁP & KHIÊN | 3s LÕI LAZER 2.4 st. Nhấp lần 2 phóng thẳng; cầu Lazer khoá cột, cảnh báo 0.35s (xe đứng yên) rồi chiếu xuyên toàn sân. Giữ 0.5s (hồi 15s): VÙNG ĐIỆN TÍCH trước mặt 5s — đạn đạo địch lọt vào hoá Cầu Năng Lượng của bạn; hitscan / lazer địch bị chặn ở rìa vùng, kết tinh 1 cầu (vùng -1s / 1 st, về 0 thì đỡ trọn rồi vỡ). Trong vùng: nhấp thả cầu (phát đầu giữa mặt, sau đó ngẫu nhiên); giữ 0.5s (hoặc hết giờ) đóng vùng & PHÓNG ĐỒNG LOẠT theo cột (Lazer cảnh báo 0.4s); giữ 1.0s KHOÁ MỤC TIÊU: 3 cầu nạp lâu nhất tự ngắm bắn lần lượt cách 0.25s (mỗi viên chiếu hồng tâm 0.25s), vùng vẫn giữ. Hạ gục địch -> kết liễu LEVEL 5: RAILGUN.',
            type: 'body', role: ['Kiểm Soát', 'Đối Đầu'],
            size: { w: 28, h: 28 },
            stats: { hp: 4.5, dmg: 0.9, ammo: 4, speedMult: 1.0286 }
        },
    ],
    FEET: [
        { id: 'speed', name: 'Động Cơ', desc: 'Tăng tốc độ di chuyển. Tối đa 3 lần.', type: 'feet', cost: 35 },
        { id: 'armor', name: 'Giáp Thép', desc: '+1 Máu tối đa.', type: 'feet', cost: 20 },
        { id: 'damage', name: 'Bánh Xích', desc: 'x1.25 Sát thương (3 lần đầu), sau đó giảm dần.', type: 'feet', cost: 25 },
        { id: 'interest', name: 'Lợi Tức', desc: 'Sau mỗi hiệp nhận Lãi Cố Định tăng tiến (45$/108$/189$/288$...; Xe Tiền x2) + Lãi Tiết Kiệm: +15% số tiền đang giữ trong ví mỗi tầng (tối đa +35$/tầng).', type: 'feet', cost: 25 }
    ]
};
