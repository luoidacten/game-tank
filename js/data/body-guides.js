// ==========================================
// Hướng Dẫn Tướng (bản rút gọn, dễ đọc) — hiển thị ở nút "📖 HƯỚNG DẪN" khi chọn Body
// Mỗi entry: { tag, diff (1-5), controls:[{input,name,what}], passive:[], evo:{e1,e2,full}, tips:[] }
// input: 'TAP' | 'TAP x2' (nhấp đúp) | 'TAP lại' | 'HOLD 0.5s' | 'HOLD' (giữ liên tục) | 'AUTO' | '←/→'
// Body thiếu entry -> tự sinh từ desc (xem js/game/body-guide-ui.js)
// ==========================================
const BODY_GUIDES = {
    basic: {
        tag: 'Xe chuẩn mực, dễ chơi nhất', diff: 1,
        controls: [{ input: 'TAP', name: 'Bắn thường', what: 'Đạn bay nhanh, nạp nhanh hơn 20%' }],
        passive: ['Máu trâu (9 HP), chạy nhanh +10%', 'Bản MAIN: hồi sinh 1 lần/trận, mạnh gấp đôi'],
        evo: { e1: '+2 HP, Dame x1.25', e2: '+2 đạn, nạp nhanh hơn 15%', full: 'Xe toàn diện, máu dày đạn nhiều' },
        tips: ['Né đạn trước, bắn sau — xe bền nên cứ đấu tay đôi']
    },
    money_tank: {
        tag: 'Farm tiền, càng giàu càng mạnh', diff: 2,
        controls: [{ input: 'TAP', name: 'Bắn thường', what: '2 viên, mạnh dần theo Cấp Độ' }],
        passive: ['Tiền nhặt & Lợi Tức x2', 'Mua CẤP ĐỘ trong shop: +HP, khiên, xuyên, nổ'],
        evo: { e1: 'Mỗi 8s phóng xe tiền húc địch', e2: 'Mọi nâng cấp rẻ 25%, tiêu tiền thành buff', full: 'Giảm giá 50%, 3 xe tiền lao liên tục' },
        tips: ['Đầu game rất yếu (2 HP) — ưu tiên né & nhặt tiền', 'Mua Cấp Độ sớm']
    },
    tank: {
        tag: 'Lao húc cận chiến, tự hồi khiên', diff: 1,
        controls: [{ input: 'TAP', name: 'Lao Húc', what: 'Lao lên húc địch, hồi chiêu 2s' }],
        passive: ['Khi lao chỉ nhận 65% sát thương', 'Tự hồi mỗi 6s, nội tại tối đa 1 khiên'],
        evo: { e3: "Cần Lái Thủy Lực: giữ Bắn húc 1.5s, trái/phải để bẻ lái; giảm 3.5 Max HP.", e4: "Xả Khiên Dự Phòng (CD 12s); Nộ từ húc/nhận dame khi lao; XE ỦI kết liễu địch ≤20%.", e1: 'Húc x1.5 dame, chỉ nhận 40% st', e2: 'Húc nổ lan + băng, hồi khiên 5s, nội tại tối đa 1', full: '1+2: hồi khiên 4s, +6 HP trước cân bằng, húc hồi 5s' },
        tips: ['Canh lúc địch vừa bắn xong rồi mới lao']
    },
    ice: {
        tag: 'Đạn băng làm chậm địch', diff: 1,
        controls: [{ input: 'TAP', name: 'Đạn Băng', what: 'Trúng địch là làm chậm' }],
        passive: ['Địch bị chậm dễ trúng đạn hơn'],
        evo: { e3: "Hơi Thở Băng Giá: Giữ 1s, nhả bắn mũi băng xuyên và tạo làn băng trượt 4s.", e4: "Đông Cứng Tức Thì: Đóng băng địch đang chậm 0.8s (CD 12s). Nộ: +10/lần chậm mới, +20/Bão Tuyết. Tuyệt Kỹ ĐỘ KHÔNG TUYỆT ĐỐI: băng 2s rồi vỡ (tối đa 3 dame); kết liễu địch đóng băng ≤20%.", e1: 'Mỗi 3 lần trúng: vùng Băng Cực Đại', e2: 'x1.5 dame lên địch bị chậm', full: 'Vùng băng gây sát thương' },
        tips: ['Bắn liên tục để địch luôn bị chậm']
    },
    big_bullet: {
        tag: 'Quả cầu đạn khổng lồ', diff: 1,
        controls: [{ input: 'TAP', name: 'Đạn Lớn', what: 'Cầu đạn to 2 dame, khó né' }],
        passive: ['Chỉ 2 viên — mỗi phát phải giá trị'],
        evo: { e1: 'Đạn to gấp đôi nữa', e2: 'Nảy tường tới 7 lần, càng nảy càng to', full: 'Xuyên thấu + nổ 360° mảnh đạn' },
        tips: ['Bắn khi địch kẹt sát tường', 'Evo 3: giữ Bắn ôm cầu nuốt đạn; nhả để sút. Evo 4: Q hoặc / để bẻ cầu về địch, mỗi lần nảy +8 Nộ, nuốt đạn +15. Đầy Nộ: HÀNH TINH.']
    },
    shotgun: {
        tag: 'Mỗi phát tỏa 5 viên', diff: 1,
        controls: [{ input: 'TAP', name: 'Bắn Tỏa', what: '5 viên xòe quạt, bay nhanh' }],
        passive: ['Đứng thẳng hàng địch để trúng nhiều viên'],
        evo: { e1: '6 viên + đợt 3 viên bồi', e2: 'Băng 4 phát', full: 'Mưa đạn dày đặc' },
        tips: ['Áp sát cột địch rồi bắn']
    },
    overload: {
        tag: 'Tự tụ điện, phát sạc nổ to', diff: 1,
        controls: [
            { input: 'TAP', name: 'Bắn thường', what: 'Đạn 0.7 dame' },
            { input: 'AUTO', name: 'Đạn Sạc', what: 'Thanh đầy 2.4s -> phát kế nổ điện' }
        ],
        passive: ['Thanh năng lượng tự tụ, không cần giữ'],
        evo: { e1: 'Thêm thanh phụ, trữ 2 Đạn Sạc', e2: 'Đạn Sạc nổ EMP câm lặng 2s', full: '5 thanh nạp cùng lúc, nổ cực to' },
        tips: ['Chờ thanh đầy rồi mới bắn phát quan trọng']
    },
    smg: {
        tag: 'Giữ nút sấy đạn liên thanh', diff: 1,
        controls: [{ input: 'HOLD', name: 'Sấy Đạn', what: 'Giữ để xả băng 18 viên' }],
        passive: ['Hết băng nạp 1.8s', 'Nghỉ bắn 2.5s tự thay băng'],
        evo: { e1: 'Sấy càng lâu càng mạnh & nhanh', e2: 'Băng 30 viên, nạp 1.2s', full: 'Nạp 0.8s, 6 viên đầu xuyên' },
        tips: ['Nhả nút khi địch núp, đừng phí băng']
    },
    lazer_charge: {
        tag: 'Một tia xuyên phá 20 dame', diff: 2,
        controls: [
            { input: 'TAP', name: 'Tia Xuyên Phá', what: 'Năng lượng đầy (5s) -> phóng tia 20 dame' },
            { input: 'HOLD 0.4s', name: 'Bật/Tắt Tự Nạp', what: 'Tắt: bắn đạn thường yếu' }
        ],
        passive: ['Năng lượng tự nạp đầy sau 5s'],
        evo: { e1: 'Tia to gấp 3, lưu 2s', e2: 'Tự nạp nhanh hơn (4s)', full: 'Tia hạ gục ngay, xuyên khiên' },
        tips: ['Chỉ 1 phát — đợi địch đứng yên hoặc kẹt']
    },
    lazer_auto: {
        tag: 'Giữ xả laser, coi chừng quá nhiệt', diff: 2,
        controls: [{ input: 'HOLD', name: 'Xả Laser', what: 'Giữ để bắn liên tục, càng lúc càng nhanh' }],
        passive: ['Nhiệt ≥60%: tia Nóng Đỏ +35% dame', 'Nhiệt 100% -> khóa bắn 1.5s'],
        evo: { e1: 'Laser cực nhanh, nhịp 0.13s', e2: 'Dame x1.5, laser to hơn', full: 'Ít nóng hơn, quá nhiệt 0.8s' },
        tips: ['Nhả nút trước khi đầy nhiệt', 'Nhặt hòm đạn để xả nhiệt']
    },
    rocket: {
        tag: 'Tên lửa nổ lan', diff: 1,
        controls: [{ input: 'TAP', name: 'Tên Lửa', what: 'Nổ lan, trúng gần cũng mất máu' }],
        passive: ['Nổ trúng cả mục tiêu đứng cạnh'],
        evo: { e1: 'Nổ siêu rộng + phóng xạ', e2: 'Nổ mạnh & rộng hơn', full: 'Bom hạt nhân thật sự' },
        tips: ['Bắn vào chỗ địch sắp chạy tới']
    },
    portal: {
        tag: 'Dịch chuyển đạn & cổng bắn', diff: 2,
        controls: [{ input: 'TAP', name: 'Bắn Cổng', what: 'Đạn kèm hiệu ứng dịch chuyển' }],
        passive: ['Cơ động nhờ dịch chuyển'],
        evo: { e1: 'Tự mở Cổng Bắn trên sân mình', e2: 'Dịch chuyển hồi đầy đạn + tốc', full: 'Tối đa 3 cổng bắn' },
        tips: ['Cổng có tia ngắm báo trước — địch né được']
    },
    wind_slash: {
        tag: 'Tụ lực chém kiếm khí phá đạn', diff: 2,
        controls: [
            { input: 'TAP', name: 'Kiếm Khí', what: 'Chờ càng lâu (tối đa 8s) chém càng mạnh' }
        ],
        passive: ['Kiếm khí phá đạn địch trên đường bay'],
        evo: { e1: 'Mỗi phát thứ 5 tự Full Lực', e2: 'Chém đạn địch -> phản lại', full: 'Phản đạn + Full Lực liên tục' },
        tips: ['Đừng bắn vội — nghỉ lâu thì phát chém to']
    },
    storm: {
        tag: 'Tụ lực lao lên làn địch chém', diff: 3,
        controls: [
            { input: 'HOLD <1.75s', name: 'Chém', what: 'Nhả sớm (<50%): lao lên chém' },
            { input: 'HOLD 1.75s', name: 'Gió Lốc', what: 'Nhả ở 50%: lốc xoáy 2s' },
            { input: 'HOLD 3.5s', name: 'Lôi Bão', what: 'Đầy 100%: ẩn, bất tử 4s rồi chém' }
        ],
        passive: ['Khi lao phản đạn địch'],
        evo: { e1: 'Tụ >50% xóa đạn quanh người, +khiên', e2: 'Phân thân tự lao chém mỗi 3-8s', full: 'Tụ chỉ 2.5s, phân thân dày hơn' },
        tips: ['Tụ đầy Lôi Bão để né đòn nguy hiểm']
    },
    acid: {
        tag: 'Ăn mòn Max HP của địch', diff: 2,
        controls: [
            { input: 'TAP', name: 'Đạn Axit', what: 'Trừ cả Max HP địch' },
            { input: 'AUTO', name: 'Vùng Ăn Mòn', what: 'Mỗi viên thứ 5 tạo vùng tím' }
        ],
        passive: ['Địch còn ≤1 Max HP nhận 4 dame', 'x10 dame lên vật cản, triệu hồi, xe tiền'],
        evo: { e1: 'Vùng ăn mòn to, lâu, rút x2', e2: 'Kết liễu khi địch ≤2 Max HP', full: 'Ăn mòn cực nhanh' },
        tips: ['Trận càng dài càng có lợi']
    },
    engineer: {
        tag: 'Dựng ụ súng tự bắn', diff: 2,
        controls: [
            { input: 'TAP', name: 'Bắn thường', what: 'Ụ Thường tự xuất hiện' },
            { input: 'HOLD 1s', name: 'Ụ Thông Minh', what: 'Đặt ụ tự ngắm tại chỗ' },
            { input: 'HOLD 2s', name: 'Quá Tải', what: '(Evo 2) Ụ bắn tia mạnh, -1 Max HP' }
        ],
        passive: ['Ụ sống quá 10s tự mất máu dần'],
        evo: { e3: "Ụ Gắn Nóc: Nhấp đúp gắn/thả ụ nóc, bắn khi di chuyển ở 60% tốc độ; giảm 1.5 Max HP.", e4: "Đồng Loạt Khai Hỏa: Mọi ụ bắn ngay loạt x2 dame và hồi 30% HP (CD 10s). Nộ: +6/Phụ Tùng, +1/s/ụ. PHÁO ĐÀI cần ≥3 ụ: hợp thể 6s bắn tia cảnh báo mỗi 0.6s rồi tách lại đầy máu.", e1: 'Ụ VIP, tối đa 3 ụ thông minh xuyên', e2: 'Mạng LAN hồi máu, mở Quá Tải', full: 'Trận địa ụ súng' },
        tips: ['Đặt ụ ở góc khó bị bắn']
    },
    ghost: {
        tag: 'Siêu nhanh, tàng hình theo chu kỳ', diff: 2,
        controls: [{ input: 'TAP', name: 'Bắn thường', what: '4 viên, dame cao' }],
        passive: ['Vô Ảnh 2s (hồi 3s) — địch khó nhắm', 'Tàn Ảnh phân thân đánh lừa'],
        evo: { e1: 'Đạn tàng hình khi đang buff', e2: 'Mỗi 12s gọi Hư Ảnh bắn phụ', full: 'Gần như luôn vô hình' },
        tips: ['Máu ít (2.5) — chạy liên tục, đừng đứng yên']
    },
    aaa: {
        tag: 'Pháo kích tự rơi trúng địch', diff: 2,
        controls: [
            { input: 'TAP', name: 'Xả Nhanh', what: 'Bắn liên tiếp khi có đạn' },
            { input: 'AUTO', name: 'Pháo Kích', what: 'Mỗi 4s tự bắn, 1.5s sau nổ' }
        ],
        passive: ['Vòng đếm ngược quanh xe báo lúc pháo tự bắn'],
        evo: { e1: 'Pháo ghim mục tiêu, 3 tia liên tiếp', e2: 'Rơi thêm 3 bom, nổ bồi', full: 'Thêm 2 quả phụ, nổ nhanh 0.8s' },
        tips: ['Xe chậm — dựa vào máu dày và pháo tự động']
    },
    blade_god: {
        tag: 'Luân phiên Quang Kiếm & Ám Kiếm', diff: 2,
        controls: [{ input: 'TAP', name: 'Phóng Kiếm', what: 'Quang (tia sáng) / Ám (nổ, câm lặng) xen kẽ' }],
        passive: ['Nhát thứ 10: Phá Thiên Kiếm'],
        evo: { e1: 'Quang Kiếm tự rải, kiếm VIP chặn đạn', e2: 'Mỗi 15s mưa kiếm + Ám Kiếm khổng lồ', full: 'Kiếm tự xuất hiện và tự phóng' },
        tips: ['Quang Kiếm ngắm 2s mới bắn — đặt trước đường địch']
    },
    van_kiem: {
        tag: 'Giữ nút gọi kiếm liên tục', diff: 2,
        controls: [
            { input: 'HOLD', name: 'Gọi Kiếm', what: 'Giữ để kiếm bay ra liên tục' },
            { input: 'HOLD 6s', name: 'Kiếm Thế', what: 'Giữ lâu: gọi kiếm nhanh gấp 3' }
        ],
        passive: ['Đạn vô hạn'],
        evo: { e1: 'Tự gọi kiếm sau lưng', e2: 'Trong Kiếm Thế: xuyên thấu, nhả ra Đại Kiếm', full: 'Bão kiếm không ngừng' },
        tips: ['Giữ nút càng lâu càng lợi, đứng ở chỗ an toàn']
    },
    water_gun: {
        tag: 'Tia nước & laser nước', diff: 2,
        controls: [
            { input: 'TAP', name: 'Tia Nước', what: 'Bắn nhanh, tốn nội năng' },
            { input: 'HOLD 1s', name: 'Laser Nước', what: 'Cột cảnh báo 0.5s rồi bắn mạnh' }
        ],
        passive: ['Không đạn — dùng thanh nội năng 100%'],
        evo: { e1: 'Giữ tiếp -> Vòi Rồng phun liên tục', e2: 'Tự hồi nội năng, đạn chậm + xuyên', full: 'Vòi rồng không ngừng' },
        tips: ['Nghỉ bắn để hồi nội năng nhanh']
    },
    furnace: {
        tag: 'Đốt cháy, đủ 5 tầng là nổ', diff: 2,
        controls: [
            { input: 'TAP', name: 'Lửa', what: 'Gây Đốt, 5 tầng -> nổ 5 dame' },
            { input: 'HOLD 1s', name: 'Tia Lửa', what: '(Evo 1) Phun lửa liên tục' }
        ],
        passive: ['Xe to, máu dày, chậm'],
        evo: { e1: 'Giữ 1s phun lửa liên tục', e2: 'Đốt 6s, tiêu 30% NL -> vùng lửa', full: 'Lò lửa bất tận' },
        tips: ['Bắn dồn để chồng đủ 5 tầng Đốt']
    },
    am_duong_su: {
        tag: 'Bùa Âm Dương nổ & choáng', diff: 2,
        controls: [{ input: 'TAP', name: 'Bùa Chú', what: 'Âm / Dương luân phiên, kích nổ nhanh' }],
        passive: ['Phối 2 loại bùa để nổ & choáng'],
        evo: { e1: 'Nổ/choáng rộng & lâu hơn', e2: 'Để lại Pháp Trận gây sát thương', full: 'Trận pháp phủ sân' },
        tips: ['Bắn 2 bùa liên tiếp trúng cùng chỗ']
    },
    six_barrel: {
        tag: 'Súng 6 nòng xả đạn vô hạn', diff: 2,
        controls: [
            { input: 'HOLD 0.5s', name: 'Quay Nòng', what: 'Khởi động 0.5s rồi xả liên tục' },
            { input: 'TAP', name: 'Bắn tiếp', what: 'Nòng đã quay thì nhấp vẫn bắn' }
        ],
        passive: ['Bắn tăng Nhiệt, đi chậm', 'Quá nhiệt -> câm lặng'],
        evo: { e1: 'Nhiệt >50% bắn 2 viên, >75% 3 viên', e2: 'Nhiệt >50% gây Đốt', full: 'Bão đạn cháy' },
        tips: ['Ngắt quãng để không quá nhiệt']
    },
    the_strongest: {
        tag: '1 HP, Chú Lực chặn mọi sát thương', diff: 4,
        controls: [
            { input: 'TAP', name: 'Xanh', what: 'Đạn hút, tốn 15 Chú Lực' },
            { input: 'TAP x2', name: 'Hắc Thiểm', what: '1.3 dame + choáng, hồi 6s' },
            { input: 'HOLD 1s', name: 'Đỏ', what: 'Tia đẩy mạnh, đứng yên 0.5s' },
            { input: 'HOLD 5s', name: 'Lãnh Địa', what: '(Evo 1) Địch câm lặng & chậm 5s' }
        ],
        passive: ['Chú Lực chặn sát thương — hết CL là chết', 'Bị trúng đòn bị ngắt niệm'],
        evo: { e1: 'Dùng Xanh+Đỏ -> mở Tím; mở Lãnh Địa', e2: 'Chú Lực nhiều & hồi nhanh', full: 'Xanh hút, Đỏ choáng, Tím xuyên' },
        tips: ['Giữ Chú Lực — đó là máu của bạn']
    },
    sniper: {
        tag: 'Đạn cực nhanh + tường chắn', diff: 2,
        controls: [
            { input: 'TAP', name: 'Bắn Tỉa', what: 'Đạn 2 dame bay cực nhanh' },
            { input: 'HOLD', name: 'Dựng Tường', what: 'Tường chặn mọi đòn địch 5s' }
        ],
        passive: ['Đạn mình bay xuyên tường mình', 'Hết đạn nạp cả băng'],
        evo: { e3: "Lỗ Châu Mai: Đạn qua tường mình +40% dame, +30% tốc; chỉ nhận buff một lần.", e4: "Dời Tường: Dời tường gần nhất về trục xe (CD 6s). +12 Nộ/phát trúng, +6/đòn tường chặn. ĐIỂM ĐẦU cần trúng ≥2 lần: khóa ngắm 2.5s rồi tia xuyên tường; kết liễu khi ≤40%.", e1: 'Tường HP x5, đạn qua không giảm dame', e2: '25% đạn thành tia Raycast', full: 'Tường không mục, cứng x7' },
        tips: ['Dựng tường trước rồi bắn từ sau']
    },
    cung: {
        tag: 'Cung 3 kiểu bắn + Thiên Tiễn', diff: 4,
        controls: [
            { input: 'TAP', name: 'Bắn Cung', what: 'Bắn theo kiểu đang chọn' },
            { input: 'HOLD 0.5s', name: 'Đổi Kiểu', what: 'Tụ Lực / Liên Hoàn / 3 Mũi' },
            { input: 'HOLD 2.5s', name: 'Ngắm Thiên Tiễn', what: 'Hồng tâm đuổi địch, nhả: tên từ trời' }
        ],
        passive: ['Nhạy Bén: tự né 1 đòn mỗi 8s'],
        evo: { e1: 'Tụ lực nhanh, Liên Hoàn 7, 3 Mũi -> 5', e2: 'Thiên Tiễn kéo Mưa Tên', full: 'Vạn Tiễn: mưa tên khắp sân' },
        tips: ['Giữ 2.5s khi địch đang kẹt để ra Thiên Tiễn']
    },
    mirror: {
        tag: 'Bản sao đối xứng, hoán đổi', diff: 3,
        controls: [
            { input: 'TAP', name: 'Bắn Đôi', what: 'Bản sao bắn cùng (50% dame)' },
            { input: 'HOLD 1s', name: 'Hoán Đổi', what: 'Đổi chỗ với bản sao' }
        ],
        passive: ['Bản sao luôn ở vị trí đối xứng'],
        evo: { e1: 'Đổi hồi 3s, sau đổi +tốc +dame', e2: 'Ảnh chiếu chia sát thương', full: 'Hoán đổi liên tục, Ảnh chiếu động luôn đối xứng địch (đánh trúng = dame lên địch)' },
        tips: ['Hoán đổi để né đạn sắp trúng']
    },
    sukuna: {
        tag: 'Chém Giải liên tục, tự hồi máu', diff: 4,
        controls: [
            { input: 'TAP', name: 'Giải', what: 'Nhát chém 0.3 dame, 9 CL' },
            { input: 'TAP x2', name: 'Hắc Thiểm', what: '1.1 dame + choáng, hồi 6s' },
            { input: 'HOLD 1.2s', name: 'Phản Chuyển', what: 'Hồi +0.6 HP, 22 CL' },
            { input: 'HOLD 1.5s', name: 'Fuga', what: '(Evo 1, CL ≥60) mũi tên lửa 2.1' }
        ],
        passive: ['Chú Lực là năng lượng tấn công', 'Bị trúng đòn ngắt niệm'],
        evo: { e1: 'Mở Fuga mũi tên lửa', e2: 'Chém to gấp đôi, phá đạn', full: 'Lãnh Địa + Nhát Chém Thế Giới' },
        tips: ['Chỉ hồi máu khi địch không bắn được bạn']
    },
    paradox: {
        tag: 'Bậc thầy thời gian — tua ngược', diff: 5,
        controls: [
            { input: 'TAP', name: 'Bắn', what: 'Mỗi phát lặp lại 1 lần (Dư Âm)' },
            { input: 'HOLD 0.2s', name: 'Tua Ngược', what: 'Về quá khứ, giải hiệu ứng xấu' },
            { input: 'HOLD', name: 'Neo Thời Không', what: 'Giữ tới mốc cuối: đặt Neo 10s' }
        ],
        passive: ['Bóng 3s đi sau tái hiện phát bắn', 'Tua ngược để lại Vết Nứt khai hỏa'],
        evo: { e3: "Dấu Nhân Quả: Dư Âm trúng khắc tối đa 4 Dấu; lần tua/về neo kế tiếp nổ 0.3 dame mỗi Dấu.", e4: "Quy Neo: Về Neo ngay, chưa có thì đặt Neo (CD 12s). +10 Nộ/lần tua, +4/Dư Âm trúng. VÒNG LẶP VÔ TẬN kéo địch về vị trí 5s trước, tái hiện loạt đạn 5s qua với trần ngân sách dame.", e1: 'Tích ấn -> Bóng Đứng + choáng', e2: 'Tua hồi 5.5s, kéo địch gây chậm', full: 'Vết nứt & bóng mạnh hơn nhiều' },
        tips: ['Đặt Neo khi đầy máu, tua về khi sắp chết']
    },
    magician: {
        tag: 'Phân ảnh & thoát chết ảo thuật', diff: 4,
        controls: [
            { input: 'TAP', name: 'Phóng Bài', what: 'Lá bài xoay' },
            { input: 'HOLD 0.5s', name: 'Phân Ảnh', what: 'Tạo bóng + khiên; đi = tàng hình' },
            { input: 'HOLD 1s', name: 'Đổi Chỗ', what: '(Evo 1) Đổi vị trí với phân ảnh' }
        ],
        passive: ['Thoát Chết: đòn chí mạng -> dịch chuyển (1/hiệp)', '≥2 bóng: địch thấy khiên & đạn giả'],
        evo: { e1: '3 lá bài nối đuôi, giữ 1s đổi chỗ', e2: 'Ảo Ảnh tự đánh, gây Suy Yếu', full: '2 Ảo Ảnh, thoát chết 2 lần' },
        tips: ['Đứng yên khi tạo bóng = vô địch ngắn']
    },
    inventor: {
        tag: 'Drone không kích + Linh Kiện', diff: 3,
        controls: [{ input: 'TAP', name: 'Bắn thường', what: 'Drone tự không kích địch' }],
        passive: ['Nhặt Linh Kiện để nâng cấp ở Chợ LK'],
        evo: { e1: 'Drone 75% chỉ số, thêm LK', e2: '2 Drone, mở Khiên Drone', full: 'Phi đội drone' },
        tips: ['Phá thùng & xe tiền để kiếm LK']
    },
    shadow_hunter: {
        tag: 'Tàng hình rồi đánh cường hóa', diff: 2,
        controls: [
            { input: 'TAP', name: 'Vô Hình', what: '+40% tốc, +50% dame' },
            { input: 'TAP lại', name: 'Đòn Cường Hóa', what: 'Gây chảy máu & chậm' }
        ],
        passive: ['Máu thấp (2 HP) — sống nhờ tàng hình'],
        evo: { e1: 'Đòn xuyên thấu, làm mù HUD địch', e2: 'Vào vô hình đầy đạn, rải bẫy', full: 'Sát thủ bóng đêm' },
        tips: ['Áp sát khi đang vô hình']
    },
    shortgunATK: {
        tag: 'Lao áp sát rồi nổ nón', diff: 3,
        controls: [
            { input: 'TAP', name: 'Đột Kích', what: 'Lao áp sát rồi nón bộc phá' },
            { input: 'TAP x2', name: 'Bắn Đôi', what: 'x2 đạn & x2 dame' }
        ],
        passive: ['Phá vật thể hồi 1 đạn'],
        evo: { e1: 'Đạn Đốt, để lại Biển Lửa', e2: 'Xác địch thành đạn pháo nổ', full: 'Rồng lửa cận chiến' },
        tips: ['Nón có cảnh báo — dùng khi địch kẹt']
    },
    thunder: {
        tag: 'Ném thương sét, Lôi Trảm', diff: 5,
        controls: [
            { input: 'TAP', name: 'Phóng Thương', what: 'Cắm tường nổ (3 cây)' },
            { input: 'HOLD 0.5s', name: 'Thu Thương', what: 'Giữ 0.5-1s: thu thương về' },
            { input: 'HOLD 1s', name: 'Lôi Trảm', what: 'Chém tại mỗi cây thương' }
        ],
        passive: ['Lôi Minh 3/3 -> Thiên Kiếp: lao sét & giáng trời', 'Mất hết thương: hồi sau 5s'],
        evo: { e1: 'Nổ & Lôi Trảm gây choáng', e2: 'Thương còn lại chém phụ', full: 'Lôi Vực + sét trời ngẫu nhiên' },
        tips: ['Cắm nhiều thương rồi mới Lôi Trảm']
    },
    magnet: {
        tag: 'Cột từ trường hút / đẩy', diff: 4,
        controls: [
            { input: 'TAP', name: 'Cột Từ', what: 'Cắm cột, địch bị hút/đẩy' },
            { input: 'HOLD 0.4s', name: 'Đổi Cực', what: 'Âm (+) / Dương (-)' },
            { input: 'TAP', name: 'Lướt Cực Tính', what: 'Có cột/ấn khác cực: lao húc' }
        ],
        passive: ['Đạn trúng gắn Ấn Từ 6s', 'Bạn không bị từ trường mình tác động'],
        evo: { e1: 'Từ trường giật điện, húc mạnh hơn', e2: '3 cột, lực x1.5', full: '4 cột, từ trường cực rộng' },
        tips: ['Khác cực hút, cùng cực đẩy']
    },
    evolution: {
        tag: 'Ăn rương để mạnh mãi mãi', diff: 2,
        controls: [{ input: 'TAP', name: 'Bắn thường', what: '1 viên — chủ yếu để phá rương' }],
        passive: ['Phá rương / xe tiền -> chỉ số vĩnh viễn', 'Có Rương Giả (Mimic)'],
        evo: { e1: 'Nhiều rương hơn, chỉ số +30%', e2: 'Mảnh Mimic x2, gây full dame', full: 'Late game bất khả chiến bại' },
        tips: ['Đầu game né đòn, farm thật nhiều']
    },
    death_lock: {
        tag: 'Xích trói, khóa cơ động', diff: 2,
        controls: [{ input: 'TAP', name: 'Đạn Cấm Chế', what: 'Tạo Lồng Xích hút & giam địch' }],
        passive: ['4 tầng ấn: tầng 3 choáng 1.5s + cấm lướt', 'Địch trong lồng không lướt/dịch chuyển'],
        evo: { e1: 'Ấn kéo dài 8s', e2: 'Xích kéo mạnh, lồng hẹp', full: 'Ấn 12s, lồng 100px' },
        tips: ['Khắc chế tướng cơ động']
    },
    creator: {
        tag: 'Ụ súng, khiên thép, drone', diff: 2,
        controls: [
            { input: 'TAP', name: 'Bắn thường', what: 'Ụ súng & drone tự đánh' },
            { input: 'HOLD 0.25s', name: 'Khiên Thép', what: 'Dựng khiên chắn đạn 5 HP' }
        ],
        passive: ['Tối đa 2 Ụ Súng Tự Ngắm'],
        evo: { e1: 'Ụ x2 dame, khiên 10 HP', e2: 'Sau 10s có Robot Chiến Đấu', full: 'Xưởng máy tự động' },
        tips: ['Núp sau khiên thép để ụ súng làm việc']
    },
    necromancer: {
        tag: 'Triệu hồi vong linh, linh hồn đỡ đòn', diff: 3,
        controls: [
            { input: 'TAP', name: 'Bắn thường', what: 'Nhả sớm (<0.5s)' },
            { input: 'HOLD 0.5s', name: 'Vong Linh 2', what: 'Nhả ở 0.5-1s, tốn 2 Linh Hồn' },
            { input: 'HOLD 1s', name: 'Vong Linh 3', what: 'Nhả ở 1-1.5s, tốn 4 Linh Hồn' }
        ],
        passive: ['1 HP nhưng có 6 Linh Hồn làm giáp'],
        evo: { e1: 'Hồi 3 Linh Hồn mỗi 3s', e2: '+4 Linh Hồn, quái mạnh hơn', full: 'Đạo quân vong linh' },
        tips: ['Đừng tiêu hết Linh Hồn — đó là máu']
    },
    genius: {
        tag: 'Gom bánh răng, lái Mecha', diff: 4,
        controls: [
            { input: 'TAP', name: 'Bắn thường', what: 'Nhặt bánh răng & linh kiện' },
            { input: 'HOLD 0.67s', name: 'Lái Mecha', what: 'Đủ bánh răng: gọi Mecha' }
        ],
        passive: ['Mở Chợ Đen nâng cấp Robot'],
        evo: { e1: 'Mecha rẻ hơn, hồi năng lượng', e2: 'Mecha xuyên + 4 module tự động', full: 'Mecha tối thượng' },
        tips: ['Farm đủ bánh răng rồi mới lái']
    },
    kiem_khach: {
        tag: 'Luyện kiếm, mạnh dần vĩnh viễn', diff: 3,
        controls: [{ input: 'TAP', name: 'Phi Kiếm', what: 'Bắn phi kiếm 1.2 dame' }],
        passive: ['Mất khiên -> Tập Trung 3s né mọi đòn', 'Làm Bài Tập Luyện Kiếm để tăng sức mạnh'],
        evo: { e1: 'Bài tập dễ 50%, Tập Trung 5s', e2: '+1 ô bài tập, đầu hiệp 1 khiên', full: 'Bài tập cuối -> Hóa Thần' },
        tips: ['Xem bài tập và chơi theo yêu cầu']
    },
    sprayer: {
        tag: 'Phun Lửa / Axit / Băng', diff: 3,
        controls: [
            { input: 'TAP', name: 'Bật/Tắt Phun', what: 'Phun hình nón liên tục' },
            { input: 'HOLD 0.37s', name: 'Đổi Chất', what: 'Lửa → Axit → Băng' }
        ],
        passive: ['Lớp phủ 100% -> Nổ / Câm Lặng / Đóng Băng', 'Đổi chất xoay vòng để dồn tầng Ngấm'],
        evo: { e1: 'Hồi năng lượng nhanh 50%', e2: 'Để lại vũng, lớp phủ bám lâu', full: 'Phun cả 3 chất cùng lúc' },
        tips: ['Khi phun bạn chạy chậm — chọn thời điểm']
    },
    customize: {
        tag: 'Tự lắp ghép xe theo ý', diff: 3,
        controls: [{ input: 'TAP', name: 'Bắn', what: 'Tùy Lối Bắn bạn đã lắp' }],
        passive: ['Mỗi hiệp nhận Điểm Tùy Chỉnh', 'Lắp Lối Bắn, Dạng Đạn, Tính Chất'],
        evo: { e1: 'Mô-đun +1 cấp, mở mô-đun VIP', e2: 'Hiệu ứng +30%, +1 điểm/hiệp', full: 'Chọn 1 Nội Tại Độc Quyền' },
        tips: ['Tập trung nâng 1-2 mô-đun mạnh']
    },
    kiem_su: {
        tag: 'Phi kiếm Ngũ Hành ngẫu nhiên', diff: 3,
        controls: [
            { input: 'TAP', name: 'Phi Kiếm', what: 'Kim/Mộc/Hỏa/Thổ/Thủy ngẫu nhiên' },
            { input: 'HOLD 0.25s', name: 'Đổi Kiếm', what: '(Evo 1) Đổi viên hiện tại & kế tiếp' }
        ],
        passive: ['Kim tiền, Mộc trói, Hỏa nổ, Thổ đá, Thủy hồi máu'],
        evo: { e1: 'Nguyên tố mạnh hơn, đổi thứ tự kiếm', e2: '2 kiếm liên tiếp tạo phản ứng', full: 'Kiếm hộ tống, phản ứng mạnh' },
        tips: ['Xem màu kiếm kế tiếp trước khi bắn']
    },
    revolver: {
        tag: 'Ổ 6 viên, viên thứ 6 chí mạng', diff: 2,
        controls: [
            { input: 'TAP', name: 'Bắn Xuyên', what: 'Viên 6 là đạn đồng x2, xuyên khiên' },
            { input: 'HOLD 0.4s', name: 'Quạt Cò', what: 'Khóa 1s rồi xả hết ổ' }
        ],
        passive: ['Chỉ nạp khi bắn cạn ổ (1.8s)'],
        evo: { e1: 'Đạn có thể nổ, viên 6 nổ choáng', e2: 'Nạp 0.9s, trúng 6/6 hồi ổ', full: 'Ổ Ngũ Sắc, Quạt Cò gấp đôi' },
        tips: ['Đếm đạn — giữ viên 6 cho lúc chắc trúng']
    },
    dj: {
        tag: 'Bấm theo nhịp nhạc', diff: 4,
        controls: [
            { input: 'TAP', name: 'Đúng Nhịp', what: 'Bấm khi nút ĐỎ: sóng âm, +Combo' },
            { input: 'HOLD 0.4s', name: 'Đổi Bản Nhạc', what: 'Dễ / Trung Bình / Khó' }
        ],
        passive: ['Sai nhịp / lỡ nhịp: đứt Combo', 'Combo tăng tốc & dame, 30 combo +khiên'],
        evo: { e1: 'Được sai 3 lần mới mất Combo', e2: 'Combo mở xuyên, nổ, vùng, hitscan', full: 'Sẵn 30 combo, 2 loa bắn phụ' },
        tips: ['Mới chơi chọn bản Dễ']
    },
    steel_hook: {
        tag: 'Móc xích nảy tường, kéo địch', diff: 4,
        controls: [
            { input: 'TAP', name: 'Phóng Móc', what: 'Móc lắc trái-phải, xích nảy tường' },
            { input: 'HOLD 0.4s', name: 'Tụ Mốc', what: 'Mỗi 0.4s +1 mốc (tối đa 4), +2 nảy' },
            { input: 'TAP lại', name: 'Đu / Kéo', what: 'Móc dừng: đu tới hoặc kéo địch về' },
            { input: 'HOLD 0.75s', name: 'Cắt Xích', what: 'Móc đã neo: cắt và phóng lại' }
        ],
        passive: ['Đầu móc có máu — bị bắn trúng sẽ đứt xích'],
        evo: { e1: 'Đu & kéo nhanh, tối đa 15 nảy', e2: 'Móc to, móc phụ ném xe tiền', full: '3 móc cùng lúc, x2 Max HP' },
        tips: ['Tụ mốc có đường đỏ cảnh báo — địch né được']
    },
    flower_shadow: {
        tag: 'Vũ công hoa: 3 điệu múa', diff: 5,
        controls: [
            { input: 'TAP', name: 'Múa', what: 'Dùng Vũ Điệu đang chọn' },
            { input: 'HOLD 0.25s', name: 'Đổi Vũ Điệu', what: 'Khai → Phá → Thiên' },
            { input: '←/→', name: 'Lái Vòng (Thiên)', what: 'Trên trời lái vòng, nhấp để đáp' }
        ],
        passive: ['Khai 10%: cánh hoa · Phá 25%: lướt · Thiên 50%: giáng', 'Tiêu 75% Hoa -> Bách Hoa Nở Rộ'],
        evo: { e1: 'Kho Hoa 200%, Bóng Hoa lặp điệu', e2: 'Cánh làm chậm, Phá chém đạn', full: 'Hoa vô hạn, 2 Bóng Hoa' },
        tips: ['Rải Khai trước, Thiên đáp choáng để kết']
    },
    kiem_vu: {
        tag: 'Phóng kiếm & phản đạn khi đứng yên', diff: 4,
        controls: [
            { input: 'TAP', name: 'Phóng Kiếm', what: 'Kiếm bay tới trục X của địch' },
            { input: 'TAP lại', name: 'Thu Kiếm', what: 'Kéo kiếm về, gây dame lượt về' }
        ],
        passive: ['Đứng yên tích Tâm Định -> phản đạn', 'Phản đạn đầy Sát Ý -> Tâm Kiếm xuyên'],
        evo: { e1: 'Tâm Định nhanh, kiếm cắm làm chậm', e2: 'Tập Trung 1s, đạn phản bay thẳng', full: 'Vạn Kiếm: kiếm phụ tấn công' },
        tips: ['Máu rất thấp (1.5) — đứng yên đúng lúc để phản']
    },
    t_zero: {
        tag: 'Robot 3 Thiết Luật: Thủ/Công/Thiên', diff: 4,
        controls: [
            { input: 'TAP', name: 'Dùng Luật', what: 'Ném khiên / Đấm lao / Bay lên' },
            { input: 'HOLD 0.25s', name: 'Đổi Luật', what: 'THỦ → CÔNG → THIÊN' },
            { input: '←/→', name: 'Lái Tâm (Thiên)', what: 'Trên trời lái tâm, nhấp để đáp' }
        ],
        passive: ['Khiên trên tay phản đạn địch', 'Bay lên tốn NL gấp đôi mỗi 2.5s'],
        evo: { e1: 'Hồi NL nhanh, mọi chiêu rẻ hơn', e2: 'Khiên vệt điện, đấm sóng xung kích', full: 'Tên lửa tầm nhiệt + không kích' },
        tips: ['Đáp xuống sớm trước khi hết năng lượng']
    },
    raven_oca: {
        tag: 'Xạ thủ + chim Oca săn mồi', diff: 3,
        controls: [
            { input: 'TAP', name: 'Bắn', what: 'Tiểu Liên: loạt 3 · Sniper: ngắm 0.4s' },
            { input: 'HOLD 0.4s', name: 'Đổi Súng', what: 'Sang SMG: lướt · Sang Sniper: bom khói' }
        ],
        passive: ['Oca tàng hình lao cắn (SMG)', 'Oca đánh dấu: Sniper tự khóa (Sniper)'],
        evo: { e1: 'Chảy máu, khói 4s, đổi súng đầy băng', e2: 'Oca thả bom, Sniper Trọng Thương', full: 'Oca bất tử, khóa mục tiêu vĩnh viễn' },
        tips: ['Đứng trong khói để né mọi đạn']
    },
    lazer_beam: {
        tag: 'Giữ chiếu tia laser liên tục', diff: 2,
        controls: [{ input: 'HOLD 0.5s', name: 'Chiếu Tia', what: 'Tụ 0.5s, cảnh báo 0.5s, rồi chiếu' }],
        passive: ['Chiếu tia đi chậm, tụt Năng Lượng', 'Tường Sniper chặn tia'],
        evo: { e1: 'Khởi động chỉ 0.125s', e2: 'Tia to dần, dame tới x2.5 + Đốt', full: 'Không giảm tốc, tia bùng nổ' },
        tips: ['Bám theo địch khi chiếu']
    },
    healer: {
        tag: 'Tự hồi máu, máu thành đạn mạnh', diff: 2,
        controls: [
            { input: 'TAP', name: 'Đạn Hấp Huyết', what: '+0.25 HP khi trúng (hồi 20s)' },
            { input: 'AUTO', name: 'Đạn Cường Hóa', what: 'Đầy Năng Lượng: phát nổ lan mạnh' }
        ],
        passive: ['3s không mất máu: +0.5 HP'],
        evo: { e3: "Kim Đảo Mệnh: +2 Max HP dự trữ máu. Giữ 0.5s, nhả: đổi 0.5 HP thành kim 1 dame xuyên khiên; không tự hạ dưới 1 HP.", e4: "Truyền Máu Khẩn: Hồi ngay 1 HP (CD 16s); Năng Lượng Sinh Mệnh ≥50% thì nạp đầy. +10 Nộ/0.5 HP hồi thực. SINH TỬ ĐẢO NGƯỢC: 4s hồi máu địch thành dame, dame địch nhận hồi bạn 50%.", e1: 'Máu dư thành Giáp Trắng', e2: 'Mỗi lần hồi bắn Tia Xung', full: 'Cướp máu hồi của địch' },
        tips: ['Né đòn để kích hoạt hồi máu']
    },
    chrononeo: {
        tag: 'Hai thế: đạn đồng & đạn nhanh', diff: 4,
        controls: [
            { input: 'TAP', name: 'Bắn', what: 'Chrono: x1.5 xuyên · Neo: 2 viên nhanh' },
            { input: 'HOLD 0.4s', name: 'Đổi Thế', what: 'Hồi 6s, mỗi thế 1 băng riêng' }
        ],
        passive: ['Giữ 1 thế 4s -> Thời Khắc cường hóa', 'Farm thùng/xe tiền: băng tăng vĩnh viễn'],
        evo: { e1: 'Thời Khắc 2.5s, đổi thế đầy băng', e2: 'Thêm đạn đầu hiệp, Liên Xạ nổ choáng', full: 'Phân Thân + bão đạn Liên Hoa' },
        tips: ['Đổi thế ngay sau Thời Khắc để nạp đầy']
    },
    gemini: {
        tag: 'Hai xe song sinh, cứu nhau', diff: 3,
        controls: [
            { input: 'TAP', name: 'Bắn', what: 'Alpha & Beta trúng liên tiếp -> nổ +50%' },
            { input: 'HOLD 0.4s', name: 'Chuyển Giao', what: 'Đổi điều khiển sang xe kia' }
        ],
        passive: ['Xe kia do AI lái, tự né', 'Gục: đứng trong Vòng Cứu 2s để hồi sinh'],
        evo: { e1: 'AI phối hợp, Chuyển Giao 1.2s', e2: 'Mạnh dần theo thời gian & hiệp', full: 'AI tối thượng, tự khởi động lại' },
        tips: ['Chỉ thua khi CẢ HAI cùng gục']
    },
    blood_lord: {
        tag: 'Máu là sức mạnh — hút máu, 4 dạng huyết', diff: 5,
        controls: [
            { input: 'TAP', name: 'Ra Chiêu', what: 'Theo dạng đang chọn (huy hiệu cạnh xe)' },
            { input: 'HOLD 0.25s', name: 'Đổi Dạng', what: 'Đổi 1 dạng / lần giữ — thả nút mới đổi tiếp' },
            { input: '←/→', name: 'Bóng Ma', what: 'Cầu ≥50%: bay lên lái vòng, nhấp đáp' }
        ],
        passive: ['Hút máu 10% mọi sát thương', 'Huyết Tế: +5% hút máu mỗi 2 Max HP thưởng', 'Bầy Dơi / Đại Tiệc Máu: vùng tròn lớn, hút máu thêm'],
        evo: { e1: 'Bể Máu nhanh, chí tử hóa dơi né', e2: '+2 Max HP, chiêu tốn ít máu, vùng rộng', full: 'Hồi sinh 1 lần khi Bể Máu đầy' },
        tips: ['Mua Giáp tăng Max HP -> hút máu nhiều hơn', 'Tích đầy Bể Máu rồi tung Huyết Cầu']
    },
    berserker: {
        tag: 'Càng mất máu càng mạnh', diff: 3,
        controls: [
            { input: 'TAP', name: 'Bắn nhấp', what: 'Trên 50% HP' },
            { input: 'HOLD', name: 'Sấy Liên Thanh', what: '≤50% HP: giữ bắn càng lâu càng nhanh' }
        ],
        passive: ['≤75% / ≤50% / ≤25% HP: mạnh dần', 'Huyết Chiến đầy: không chết khi nhận đòn chí tử'],
        evo: { e3: "Tự Rạch: Nhấp đúp (hồi 1s): mất 0.5 HP, không dưới 1; +12 Huyết Chiến và chuẩn bị Huyết Đạn.", e4: "Gào Thét: Hưởng buff mốc ≤25% trong 4s (CD 18s). Nộ từ dame nhận x1.5 và dame gây. CUỒNG HUYẾT VÔ TẬN cần HP≤50%: vào Huyết Chiến, giữ thanh 100 bốn giây, mỗi hit hồi 0.1 HP; Huyết Đạn kết liễu ≤20%.", e1: 'Cuồng Chiến x1.5, tản nhiệt nhanh', e2: 'Huyết Chiến dựng tường nhốt địch', full: 'Tàn Hơi: 2 lần không chết/hiệp' },
        tips: ['Sấy 3-4s là quá nhiệt — nhả nút nghỉ']
    },
    kazuki: {
        tag: 'Song kiếm combo A/B', diff: 5,
        controls: [
            { input: 'TAP', name: 'Tả Trảm [A]', what: 'Kiếm khí nón, gạt đạn nhỏ' },
            { input: 'HOLD 0.25s', name: 'Hữu Trảm [B]', what: 'Giữ rồi nhả: nhát chém rộng' },
            { input: 'HOLD 0.6s', name: 'Nghịch Trảm', what: 'Thủ thế đỡ đòn, choáng 1s' }
        ],
        passive: ['2 nhịp (AA/AB/BA/BB) -> Kiếm Thế Quyết', '≥5 Kiếm Ý -> Loạn Vũ Hư Ảnh'],
        evo: { e1: 'Ý Niệm hồi nhanh, chiêu rẻ 25%', e2: 'Mỗi combo thêm hiệu ứng', full: 'Sẵn 5 Kiếm Ý, Trảm Vực' },
        tips: ['Nghịch Trảm đúng lúc địch bắn = choáng']
    },
    tsukiyo: {
        tag: 'Nhẫn giả 3 phong cách', diff: 4,
        controls: [
            { input: 'TAP', name: 'Ra Chiêu', what: 'Phi Tiêu / Hỏa Cầu / Lướt Chém' },
            { input: 'HOLD 0.75s', name: 'Đổi Phong Cách', what: 'Kỹ Thuật → Bí Thuật → Tất Sát' }
        ],
        passive: ['Phi tiêu trúng hồi Nội Năng', 'Nâng chân xe -> chọn nhánh Nhẫn Đạo'],
        evo: { e1: 'NN 150, rẻ 25%, đổi 0.5s', e2: 'Nhẫn Đạo dễ, +HP +dame', full: 'Đỉnh Cao Nhẫn Giả' },
        tips: ['Phi tiêu trúng để nuôi Nội Năng']
    },
    joker: {
        tag: 'Ném bài may rủi, 5% JOKER', diff: 3,
        controls: [
            { input: 'TAP', name: 'Phi Bài', what: '♥ hồi ♦ tiền ♣ nổ ♠ xuyên 🃏 cả 4' },
            { input: 'HOLD 0.35s', name: 'Tráo Bài', what: 'Lướt ngắn + đổi lá kế tiếp' }
        ],
        passive: ['Lá Bài A: buff chất khắc vai trò địch', 'Thoát Hiểm: né đòn chí tử 1 lần/hiệp'],
        evo: { e1: '10 lá, ném 2 lá, Joker Đỏ/Đen', e2: 'Joker chép vai trò địch', full: 'Phán Quyết Joker: -50% máu' },
        tips: ['Xem lá kế trên nút Bắn, tráo nếu xấu']
    },
    juggernaut: {
        tag: 'Miễn nhiễm mọi khống chế', diff: 2,
        controls: [
            { input: 'TAP', name: 'Đạn Phá Xiềng', what: 'Có Bá Khí: đạn to, xuyên khiên' },
            { input: 'HOLD 0.5s', name: 'Giáp Phản Chấn', what: '1.5s giảm 40% st, hồi 6s' }
        ],
        passive: ['Miễn Chậm, Choáng, Trói, Câm Lặng...', 'Hấp thụ khống chế -> +HP, +tốc, +Bá Khí'],
        evo: { e1: 'Giảm DoT 25%, miễn nhiễm nạp đạn', e2: 'Trả ngược khống chế lên địch', full: 'Đạn Bá Khí không thể cản phá' },
        tips: ['Khắc chế tướng khống chế']
    },
    cluster_gun: {
        tag: 'Đạn tách thành nhiều mảnh', diff: 3,
        controls: [
            { input: 'TAP', name: 'Bắn', what: 'Phân Mảnh tách ở giữa sân' },
            { input: 'TAP lại', name: 'Tách Sớm', what: 'Đạn bay 0.25s: nhấp để tách ngay' },
            { input: 'HOLD 0.4s', name: 'Đổi Chế Độ', what: 'Phân Mảnh / Dễ Vỡ' }
        ],
        passive: ['Dễ Vỡ: địch bắn trúng -> nổ 8 mảnh'],
        evo: { e1: 'Mảnh bay nhanh hơn 50%', e2: '5 / 12 mảnh, nảy tường', full: '36 mảnh 360° khắp sân' },
        tips: ['Dùng Dễ Vỡ với địch hay bắn đạn']
    },
    clone: {
        tag: 'Tạo quân đoàn bản sao', diff: 3,
        controls: [
            { input: 'TAP', name: 'Bắn', what: 'Clone bắn dồn theo bạn' },
            { input: 'HOLD 1s', name: 'Tạo Clone', what: 'Giữ tiếp: mỗi 1s thêm 1 (tối đa 6)' }
        ],
        passive: ['Clone tự né, tản quanh địch', 'Clone bị hạ: bạn mất 50% máu clone'],
        evo: { e1: 'Clone Hoàn Hảo — hồi sinh vào nó', e2: 'Clone mạnh, miễn phản phệ 2 lần', full: '2 Clone Hoàn Hảo, AI Huyền Thoại' },
        tips: ['Đừng tạo quá nhiều khi địch có nổ lan']
    },
    jet_pilot: {
        tag: 'Tách đôi: Chân + Phi Ảnh bay', diff: 4,
        controls: [
            { input: 'TAP', name: 'Tên Lửa', what: '1 tên lửa + 2 đạn phụ' },
            { input: 'HOLD 0.5s', name: 'Cất Cánh', what: 'Tách đôi (đã tách: đổi điều khiển)' },
            { input: 'HOLD 1s', name: 'Hợp Nhất', what: 'Thả thảm bom rồi ghép lại, +khiên' }
        ],
        passive: ['Phi Ảnh bay trên trời, miễn đạn', 'Bom có vòng cảnh báo 1s'],
        evo: { e1: '+15% dame, bom để vệt lửa', e2: 'AI luôn bật cả khi bạn lái', full: '10 HP, hồi chiêu ngắn, bom dày' },
        tips: ['Cất cánh để né khi bị dồn ép']
    },
    tat_sat: {
        tag: 'Tụ lực 3 mốc, nhất kiếm tất sát', diff: 4,
        controls: [
            { input: 'HOLD <2.25s', name: 'Lướt Chém', what: 'Nhả 1-49%: vùng đỏ nổ' },
            { input: 'HOLD 2.25s', name: 'Phân Ảnh', what: 'Nhả 50-85%: phân ảnh đoạt mệnh' },
            { input: 'HOLD 3.9s', name: 'Nhất Kiếm', what: 'Nhả 86-100%: chém hitscan x6' }
        ],
        passive: ['Tụ đầy 100% mất 4.5s'],
        evo: { e1: 'Tụ đầy 3.5s, giảm st khi tụ', e2: 'Mỗi nhánh thêm hiệu ứng', full: 'Nhánh 3 từ 75%, chém hồi máu' },
        tips: ['Nhánh 3 có cột cảnh báo — chờ địch kẹt']
    },
    one_punch: {
        tag: 'Một đấm — càng ăn đòn càng mạnh', diff: 3,
        controls: [
            { input: 'TAP', name: 'Đấm Thường', what: 'Cột áp lực dọc sân, báo trước 0.53s' },
            { input: 'HOLD 1.25s', name: 'Đấm Nghiêm Túc', what: 'Thú Vị ≥65%: hitscan 1.8 xuyên tường (hồi 17s)' }
        ],
        passive: ['Bị đánh tích Thú Vị: tăng tốc, giảm st', '6s không bị đánh: Thú Vị hồi máu'],
        evo: { e3: "Chạy Bộ Mỗi Ngày: Di chuyển liên tục 3s tăng 5% Thú Vị; giảm 2 Max HP.", e4: "Né Bình Thường: Bước ngang né 0.25s, +10% Thú Vị (CD 6s). +1 Nộ/1% Thú Vị tăng. ĐẤM NGHIÊM TÚC: CHẾT ĐI cần Thú Vị 100%, cảnh báo 0.8s rồi tia rộng 1/3 sân xuyên tường; kết liễu ≤50%, còn lại 3 dame.", e1: 'Nạp 2.0s, đấm bồi 4 luồng', e2: 'Khi tụ: ←/→ bật nhảy ngang', full: 'DEATH PUNCH: kết liễu ≤20% máu' },
        tips: ['Ăn vài đòn để có Thú Vị rồi Đấm Nghiêm Túc']
    },
    boomerang: {
        tag: 'Ném 2 boomerang, nhớ bắt lại', diff: 4,
        controls: [
            { input: 'TAP', name: 'Ném', what: 'Ném chiếc đang chọn' },
            { input: 'HOLD 0.4s', name: 'Đổi Chiếc', what: 'Trọng Luân (thẳng) / Nguyệt Luân (cung)' }
        ],
        passive: ['Bắt được khi bay về -> Hứng Khởi +20%', 'Để lọt -> rơi mất, hồi lâu'],
        evo: { e1: 'Đổi 0.25s, bắt dễ hơn, buff mạnh', e2: 'Ném 2 chiếc, giao cắt nổ bão', full: 'Boomerang tự về tay, phá đạn' },
        tips: ['Đứng đúng đường bay về để bắt']
    },
    arachnid: {
        tag: 'Tơ nhện quấn địch thành kén', diff: 3,
        controls: [
            { input: 'TAP', name: 'Đạn Tơ Độc', what: 'Để vùng tơ chậm 30%, +1 tầng' },
            { input: 'HOLD 0.5s', name: 'Cú Vồ', what: 'Lao lên cắn (hồi 9s)' }
        ],
        passive: ['4 tầng Tơ -> Hóa Kén choáng 1.75s', 'Vồ địch trong kén: xé kén, có thể xử tử'],
        evo: { e1: 'Chỉ cần 3 tầng, kén câm lặng', e2: '4 đạn, nở Nhện Con', full: 'Nữ Hoàng Nhện: xử tử 25%' },
        tips: ['Bọc kén rồi mới Cú Vồ']
    },
    psychokinesis: {
        tag: 'Bắt đạn địch rồi ném trả', diff: 4,
        controls: [
            { input: 'TAP', name: 'Đạn Niệm Lực', what: 'Lơ lửng 0.45s rồi vút đi' },
            { input: 'HOLD 1s', name: 'Vùng Niệm Lực', what: 'Bắt đạn địch tối đa 5s (hồi 11s)' },
            { input: 'HOLD 1s', name: 'Khóa Tâm', what: 'Trong vùng: đạn tự tìm về địch' }
        ],
        passive: ['Trong vùng: nhấp -> trả đạn ngược quỹ đạo', 'Địch lao cận chiến bị chặn & choáng'],
        evo: { e1: 'Đạn tự ngắm, Khóa Tâm 0.5s', e2: 'Vùng to, chặn cả tia laser', full: 'Vùng 6.5s, mưa thiên thạch' },
        tips: ['Mở vùng khi địch vừa xả đạn']
    },
    tailor: {
        tag: 'Kim chỉ giăng lưới, búp bê thế mạng', diff: 4,
        controls: [
            { input: 'TAP', name: 'Kim Khâu', what: 'Cắm Cọc Chỉ, chỉ căng làm chậm' },
            { input: 'HOLD 0.6s', name: 'Rút Chỉ', what: 'Cọc bay về cắt xuyên, trói địch' }
        ],
        passive: ['Búp Bê Trắng gánh sát thương thay bạn', 'Kim trúng Búp Bê Đen -> choáng địch'],
        evo: { e1: '4 cọc 12s, chỉ chậm 50%', e2: 'Búp bê hồi sinh 8s, phóng kim', full: '5 cọc, Lĩnh Vực Cắt May' },
        tips: ['Cắm cọc quanh địch rồi Rút Chỉ']
    },
    jack_6_lo: {
        tag: 'Con bạc: đạn random, cò quay Nga', diff: 4,
        controls: [
            { input: 'TAP', name: 'The Hand', what: 'Ổ 6 viên random 12 loại' },
            { input: 'HOLD 1s', name: 'The Boy', what: 'Cò Quay Nga: nhấp bóp từng lỗ' }
        ],
        passive: ['Tung xu 3s: Ngửa = LUCK, Úp = +1 Nợ', 'Chỉ số đầu hiệp random ±30%'],
        evo: { e1: 'Luck mạnh & lâu hơn, The Boy x1.2', e2: 'Chí mạng x3, Nợ nhiều -> Độc Đắc', full: 'Tung xu 2s, vay nóng Nợ' },
        tips: ['Phát 6 The Boy nổ ngược — biết điểm dừng']
    },
    kusarigama: {
        tag: 'Liềm xích hút máu, 3 phong cách', diff: 4,
        controls: [
            { input: 'TAP', name: 'Ra Đòn', what: 'Trảm / Khóa / Linh tùy phong cách' },
            { input: 'HOLD 0.5s', name: 'Đổi Phong Cách', what: '⚔ Trảm → ⛓ Khóa → 🌀 Linh' }
        ],
        passive: ['Hút máu 35%, mọi đòn gây Chảy Máu', 'Máu thấp: hút máu -> Giáp Trắng cực mạnh', 'Giáp chỉ tụt sau 2s không nhận giáp & không bị đánh', 'HP chỉ 3 — dễ vỡ'],
        evo: { e1: 'Hút máu 65%, tích nhanh', e2: 'Cuồng Huyết mạnh, Linh giảm st', full: 'Hút 120%, Tam Thức Hợp Nhất' },
        tips: ['Nghỉ 2-3s để tích Sát Ý rồi ra đòn']
    },
    the_clock: {
        tag: 'Đếm 20 nhịp là kết liễu', diff: 3,
        controls: [
            { input: 'TAP', name: 'Kim Giây', what: 'Trúng +1 nhịp, 3 nhịp choáng 1s' },
            { input: 'HOLD 0.33s', name: 'Time Zone', what: 'Ngưng đọng toàn sân 5s (hồi 14s)' }
        ],
        passive: ['20 nhịp -> kết liễu tức thì', 'Hết Time Zone: đạn địch bị đảo chiều'],
        evo: { e1: '5 đạn, Time Zone hồi +2 viên', e2: 'Time Zone hồi 10s, kim nhanh', full: 'Chỉ cần 16 nhịp để kết liễu' },
        tips: ['Trong Time Zone bắn thật nhiều kim treo']
    },
    coc: {
        tag: 'Xúc xắc: 6 vũ khí ngẫu nhiên', diff: 4,
        controls: [
            { input: 'TAP', name: 'Bắn', what: 'Theo vũ khí xúc xắc đang cầm' },
            { input: 'HOLD 0.6s', name: 'ReRoll', what: '(Evo 1) Đổi vũ khí, hồi 10s' }
        ],
        passive: ['Mỗi 12s đổi vũ khí: Lục/SMG/Pháo/Dao/Búp Bê/Vàng', 'Reroll shop đầu tiên miễn phí'],
        evo: { e1: 'Chủ động ReRoll vũ khí', e2: '6 vũ khí mạnh hơn + nội tại xúc xắc', full: '2 nội tại, Phân Ảnh vũ khí' },
        tips: ['Học nhanh cách dùng từng vũ khí']
    },
    prism: {
        tag: 'Khiên kính phản lại đòn', diff: 3,
        controls: [
            { input: 'TAP', name: 'Tia Khúc Xạ', what: 'Bay cực nhanh, nảy tường 1 lần' },
            { input: 'HOLD 0.4s', name: 'Mở Kính', what: '1.5s phản đòn, 0.25s đầu miễn st' }
        ],
        passive: ['Mọi khiên thành Khiên Kính phản đạn', 'Phản đòn bị trừ 0.5 HP mỗi đợt'],
        evo: { e3: "Khúc Xạ Kép: Tia Khúc Xạ nảy thêm một lần; lần nảy đầu tách đôi (mỗi tia 50% dame).", e4: "Lăng Kính Tức Thì: Bật Cửa Sổ Vàng 0.35s, không tiêu CD Mở Kính (CD Skill 10s). +10 Nộ/đòn phản, +20/phản vàng. VẠN KÍNH QUY QUANG: 4s phản x1.5, cuối chiêu hội tụ tia cảnh báo 0.4s; kết liễu ≤25%.", e1: 'Phản 70%, Kính 2.5s, hồi 7s', e2: 'Sẵn 1 Khiên Kính, kính vỡ bắn mảnh', full: 'Phản 100%, không mất máu' },
        tips: ['Mở Kính đúng lúc đạn sắp chạm']
    },
    the_adapter: {
        tag: 'Đánh càng lâu càng bất bại', diff: 2,
        controls: [
            { input: 'TAP', name: 'Bắn', what: 'Dame tăng theo nấc Thích Ứng' },
            { input: 'HOLD 0.4s', name: 'Ép Xung', what: 'Lướt né + đạn khai thác (hồi 7.5s)' }
        ],
        passive: ['Mỗi 3.5s +1 nấc: giảm st, +dame', 'Bắn trúng gắn Lộ Điểm Yếu lên địch'],
        evo: { e1: '8 nấc, xoay nhanh 2.5s', e2: '7 tầng Lộ Điểm Yếu, hút máu', full: 'Trạng Thái Hoàn Mỹ 8/8' },
        tips: ['Sống sót lâu là thắng']
    },
    tinh: {
        tag: 'Phạt địch chạy nhảy, nhốt địch', diff: 3,
        controls: [
            { input: 'TAP', name: 'Bắn', what: 'Khó Chịu ≥5: tự thành Đạn Cấm Chế' },
            { input: 'HOLD 0.4s', name: 'Nạp Cấm Chế', what: 'Nạp sẵn, nhả để bắn' }
        ],
        passive: ['Địch lướt/chạy nhiều -> +Khó Chịu, +Ngưng', '3 tầng Ngưng -> choáng cứng 3s'],
        evo: { e1: 'Khó Chịu 15, đứng im cũng bị tính', e2: 'Cấm Chế rẻ, vùng to, rút máu', full: 'Cấm Chế trúng +1 tầng Ngưng' },
        tips: ['Khắc chế tướng cơ động']
    },
    wind: {
        tag: 'Ngưng gió tích lực, hóa gió né', diff: 4,
        controls: [
            { input: 'TAP', name: 'Đạn Gió', what: 'Nghỉ bắn: to dần · bắn liên: nhanh dần' },
            { input: 'HOLD 0.3s', name: 'Hóa Gió', what: 'Bất tử 4s, phải di chuyển liên tục' }
        ],
        passive: ['Ngưng Phong: nghỉ 0.3s, dame tới x2.5', 'Liên Phong: bắn liên tục +tốc bắn'],
        evo: { e1: 'Ngưng nhanh, phát đầy xuyên', e2: 'Hóa Gió hồi 4s, đạn địch hồi chiêu', full: 'Hóa Gió xóa đạn, Khiên Gió' },
        tips: ['Hóa Gió thì đừng đứng yên']
    },
    diep_thanh_phong: {
        tag: 'Quạt gió: 2 Thế, 3 Khí Áp', diff: 5,
        controls: [
            { input: 'TAP', name: 'Chiêu Quạt', what: 'Theo Thế Quạt đang dùng' },
            { input: 'HOLD 0.3s', name: 'Đổi Thế', what: 'Thuận Phong Vũ ↔ Nghịch Phong Vũ' },
            { input: 'HOLD 0.7s', name: 'Đổi Khí Áp', what: 'Sang vùng Khí Áp kế, +20 Gió' },
            { input: '←/→', name: 'Cửu Thiên', what: 'Bay lên lái vòng, nhấp để giáng' }
        ],
        passive: ['Khí Áp: Thuận (nhanh) / Bão Hòa / Nghịch (mạnh)', 'Xen kẽ 2 Thế -> Hợp Phong +dame'],
        evo: { e1: 'Gió 130, đổi Thế 0.18s, +Khiên', e2: 'Mỗi vùng Khí Áp mạnh hơn', full: 'Bão Hòa nhận cả 2 nội tại' },
        tips: ['Đổi Thế liên tục, đừng lặp 1 Thế 3 lần']
    },
    railgun: {
        tag: 'Cầu năng lượng nạp càng lâu càng mạnh', diff: 4,
        controls: [
            { input: 'TAP', name: 'Tạo Cầu', what: 'Cầu lơ lửng tự nạp trước mũi xe' },
            { input: 'TAP lại', name: 'Phóng Cầu', what: '1s xuyên vật · 2s xuyên khiên · 3s Lazer' },
            { input: 'HOLD 0.5s', name: 'Vùng Điện Tích', what: 'Bắt đạn địch thành cầu (hồi 15s)' },
            { input: 'HOLD 1s', name: 'Khóa Mục Tiêu', what: 'Trong vùng: 3 cầu tự ngắm bắn' }
        ],
        passive: ['Cầu nạp 1s / 2s / 3s lên cấp'],
        evo: { e1: 'Cầu nạp nhanh 35%, +tốc', e2: 'Vùng hồi 11s, chặn lao húc', full: 'Bắt MỌI đạn, nổ tê liệt' },
        tips: ['Chờ cầu đủ 3s thành Lazer rồi phóng']
    },
    skinwalker: {
        tag: 'Tự biến hình khắc chế địch', diff: 2,
        controls: [{ input: 'TAP', name: 'Bắn', what: 'Đạn theo Hình Thái đang mang' }],
        passive: ['Đầu hiệp biến hình theo vai trò địch', '🩸 Phá Giáp · 👁 Hư Không · 🕸 Tróc Ảnh · ☣ Độc'],
        evo: { e1: 'Hình Thái Chính mạnh hơn', e2: 'Thêm Lớp Da Phụ (vai trò phụ)', full: 'Lột Da: bất tử, hồi máu' },
        tips: ['Chỉ cần nhấp bắn — xe tự thích nghi']
    },
    idol: {
        tag: 'Ngôi sao sân khấu, kéo Fan', diff: 4,
        controls: [
            { input: 'TAP', name: 'Phong Cách', what: 'Vũ Đạo / Tâm Điểm / Quyến Rũ' },
            { input: 'HOLD 0.5s', name: 'Đổi Phong Cách', what: 'Giữ rồi nhả: đổi kiểu' },
            { input: 'HOLD 1s', name: 'Sân Khấu', what: 'Chọn Rock/Pop/Ballad, nhấp mở 15s' }
        ],
        passive: ['Trúng chiêu & thắng hiệp: +Fan', 'Evo cần đủ mốc Fan (6/12/18)'],
        evo: { e1: 'Cần 6 Fan: Show hồi nhanh', e2: 'Cần 12 Fan: +dame theo Fan', full: 'Cần 18 Fan: Show trọn cả 3' },
        tips: ['Quyến Rũ (tim) khóa bắn địch 1.75s']
    },
    dynamite: {
        tag: 'Gài bẫy thuốc nổ, nổ dây chuyền', diff: 2,
        controls: [
            { input: 'TAP', name: 'Ném Thẳng', what: 'Nổ khi chạm địch / vật cản / vòng bom (1.5)' },
            { input: 'HOLD 0.5s', name: 'Ném Cao', what: 'Bay qua mọi vật cản, nằm lại làn địch hoặc DÍNH vào xe' }
        ],
        passive: ['Bom trong 140px nổ lan cả chuỗi (trúng liên tiếp 0.6s: 100/70/50/35%)', 'x3 sát thương lên công trình / vật triệu hồi', 'Phá thùng/xe tiền +$10, mỗi 3 lần trúng +$5'],
        evo: { e1: '2 bó, bom sống 9s, tối đa 3, nổ lan xa hơn', e2: 'Kích nổ sớm 2.2 dame, bom dính bị kích -> choáng', full: '3 bó, 12s, x5 công trình, vàng + khói chậm' },
        tips: ['Ném Cao rải bom trước, rồi Nhấp Bắn kích nổ cả chuỗi']
    },
    twin_gun: {
        tag: 'Hai viên song song, khó lách', diff: 1,
        controls: [
            { input: 'TAP', name: 'Song Xạ', what: '2 viên trái/phải, cách 24px' },
        ],
        passive: ['Trúng cả 2 viên: phát kế +25% tốc đạn, +0.3 Dame'],
        evo: { e1: '+2 đạn, nạp nhanh 30%', e2: 'Trúng 1 viên: hút địch về làn viên kia', full: 'Mỗi phát thứ 3: +1 viên giữa xuyên vật cản' },
        tips: ['Căn giữa xe địch để trúng cả 2 viên và nhận thưởng phát kế']
    },
    mortar: {
        tag: 'Pháo kích từ trời, vượt mọi vật cản', diff: 1,
        controls: [
            { input: 'TAP', name: 'Pháo Kích', what: 'Rơi xuống làn địch tại X của bạn' },
            { input: 'HOLD 0.5s', name: 'Rải Thảm', what: '3 quả: X địch, ±85px (hồi 10s)' }
        ],
        passive: ['Đạn rơi từ trời: không bị chặn/bắt', 'Hồng Tâm (lệch ≤18px): +0.3 Dame, phá 1 Khiên'],
        evo: { e1: 'Rơi 0.65s, +1 đạn, nạp nhanh', e2: 'Hố lửa 2.5s, Rải Thảm hồi 7s', full: 'Phát thứ 3: Đại Pháo Cối + 2 đạn chùm' },
        tips: ['Đứng đón đầu hướng chạy của địch rồi mới bắn']
    },
    fire_cannon: {
        tag: 'Đạn lửa thiêu đốt, rải vùng lửa', diff: 1,
        controls: [
            { input: 'TAP', name: 'Đạn Lửa', what: 'Trúng địch là Đốt 1.5s' },
            { input: 'AUTO', name: 'Hỏa Cầu', what: 'Phát thứ 3: để lại Vùng Lửa trên làn địch' }
        ],
        passive: ['Đứng trong Vùng Lửa luôn bị Đốt', '3 chấm cạnh xe: đủ 2 chấm -> phát tới là Hỏa Cầu'],
        evo: { e1: '+1 Máu, vùng to hơn, cứ 2 vùng có 1 Đại Hỏa', e2: 'x1.4 dame lên địch cháy, Đốt 3 tầng, kích nổ', full: 'Tường Lửa + Hỏa Ngục mỗi 7s' },
        tips: ['Rải Hỏa Cầu cạnh nhau để dồn địch vào góc', 'Đốt địch trước rồi mới tung Hỏa Cầu']
    },
    batter: {
        tag: 'Phản đạn địch bằng gậy, hồi máu', diff: 1,
        controls: [
            { input: 'TAP', name: 'Ném Bóng', what: 'Pitch thứ 4 là Bóng Lửa nhanh x2, 1.6 dame' },
            { input: 'HOLD 0.35s', name: 'Vung Gậy', what: 'Cung rộng 0.45s, CD 4.5s: đạn địch bị đập ngược' }
        ],
        passive: ['Home Run: đạn phản x2 tốc, +0.7 dame, hồi 0.3 HP', 'Vung trượt không mất máu, ra Bóng Vàng 1.4 dame'],
        evo: { e1: 'CD 3.0s, cung rộng, +20% tốc sau vung', e2: 'Đạn phản to x1.5, xuyên, Khiên 2s', full: 'Phản mọi đạn trong tầm, +$5 mỗi Home Run' },
        tips: ['Giữ nút ngay khi đạn địch sắp tới gần mũi xe']
    },
    hellrider: {
        tag: 'Chạy càng nhanh đạn càng đau', diff: 1,
        controls: [
            { input: 'TAP', name: 'Bắn Xích Lửa', what: 'Mỗi 0.2 tốc vượt 3.0: +0.07 dame, +5% tốc đạn, +4% cỡ đạn' },
            { input: 'HOLD 0.4s', name: 'Rồ Ga Nitro', what: '+30% tốc 2.5s (CD 5s), +1 đạn, phát sau xuyên vật cản' }
        ],
        passive: ['Giữ chạy ngang: tốc 3.0 -> 5.6; dừng 0.25s thì tụt dần', 'Chạm tường tự Drift đảo chiều giữ nguyên đà, +0.4 tốc 1.5s', 'Tốc >= 4.8 BỐC LỬA: giảm 25% sát thương, đạn Thiêu Đốt'],
        evo: { e1: 'Gia tốc +50%, +0.09 dame/bậc, Drift +1 đạn +0.6 tốc', e2: 'Trần tốc 6.2, bốc lửa miễn Làm Chậm, giảm 35%', full: 'Drift/Nitro phun 2 Cầu Lửa; tốc >= 6.0 xuyên khiên 50%' },
        tips: ['Đừng đứng yên: luôn giữ phím chạy và bắn lúc đang lướt', 'Bấm Nitro lúc đang chạy để đổi hướng mà không mất đà']
    },
    collector: {
        tag: 'Triệu hồi bóng ma 10 loại súng', diff: 2,
        controls: [
            { input: 'TAP', name: 'Bắn đạn đang cầm', what: 'Mặc định 1.0 dame, 5 viên; đổi loại theo kho đạn' },
            { input: 'HOLD 0.5s', name: 'Khui Kho Vũ Khí', what: 'Nạp đầy + đổi 1 trong 10 loại đạn ngẫu nhiên (CD 12s)' }
        ],
        passive: ['Mỗi 2–8s: Hologram (10 body) hiện trên làn bạn, bắn đúng 1 lượt (70% dame) rồi tan', 'Hologram không chặn đạn, địch không nhắm được'],
        evo: { e1: 'CD đổi đạn 6s, +1 đạn, nạp nhanh 25%, sau đổi +25% tốc & 2 phát +30%', e2: 'Hologram 1.5–4.5s, 100% dame + Evo 1, đổi đạn gọi thêm 1 Hologram', full: '50% gọi 2 Hologram; đạn Khui Kho mang hiệu ứng Full Evo gốc' },
        tips: ['Đứng gần vị trí cổng dữ liệu để canh tia Lazer/Sniper của Hologram', 'Khui Kho khi hết đạn để vừa nạp vừa có loại đạn mới']
    },
    the_admin: {
        tag: 'Tự lập trình Luật IF -> THEN', diff: 3,
        controls: [
            { input: 'TAP', name: 'Đạn Mã Nguồn', what: '1.1 dame, 4 viên' },
            { input: 'HOLD 0.4s', name: '/execute', what: 'Lướt nhẹ sang ngang + ép chạy mọi Luật 1 lần (CD 8s)' },
            { input: 'SHOP', name: 'Admin Terminal', what: 'Mua Luật / ĐK / KQ (giá x2), ĐỔI khe, XÓA hoàn 50%; chọn trong 3/5/12 lựa chọn ngẫu nhiên, Reroll $5' }
        ],
        passive: ['1 ĐK bất kỳ của Luật nổ -> chạy đồng loạt mọi KQ của Luật', 'Từ ĐK thứ 2 mỗi ĐK +15% hiệu lực KQ', 'Luật #1 miễn phí, chọn lại ở shop đầu tiên', 'Cờ Bạc: Reroll đầu tiên mỗi hiệp miễn phí, +1 ô shop & G.E.A.R'],
        evo: { e1: '2 ĐK + 2 KQ / Luật, /execute 5.5s, +$15 đầu hiệp', e2: '5 Luật, 3+3 khe, mở ĐK/KQ Evo 2 (Vùng Axit, Bản Sao, Không Kích...), 5 lựa chọn, ĐK nhạy hơn 25%', full: 'Vô hạn Luật & khe, 12 lựa chọn, mở ĐK/KQ Lớn (/ban, /godmode, /sudo_jackpot, Phân Ảnh Chém/Lazer)' },
        tips: ['Ghép ĐK thường nổ (Chu Kỳ, Xả Đạn) với KQ sát thương', 'Giữ /execute để né đạn và tung toàn bộ Luật đúng lúc']
    }
};

