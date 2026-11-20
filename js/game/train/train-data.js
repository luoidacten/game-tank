// ==========================================
// MẢNH KÝ ỨC 1 — THE TRAIN: dữ liệu tĩnh (loại toa, biến thể Phase, thẻ Ký Ức)
// Thiết kế: docs/MANH_KY_UC_THE_TRAIN.md
// ------------------------------------------
// Mỗi BIẾN THỂ là 1 cấu hình riêng trong TRAIN_VARIANTS:
//   cars      : danh sách toa theo thứ tự (toa đầu = Đầu Tàu, đi đầu bên trái)
//   hp        : máu gốc từng loại toa (trước hệ số)
//   hpMult / dmgMult / rateMult : hệ số chỉ số
//   stopTicks / moveTicks       : nhịp dừng / chạy
//   skills    : (tuỳ chọn) ghi đè kỹ năng theo loại toa: { smg(boss, car), mortar(...), ... }
//   hooks     : (tuỳ chọn) { setup(boss), update(boss), carHit(boss, car, dmg) -> dmg }
//   fallback  : true = biến thể chưa làm logic riêng -> dùng logic Phase 1 với hệ số tăng (bản dự phòng)
// Thêm biến thể mới: thêm 1 mục ở đây (+ skills/hooks nếu đổi logic toa), không phải sửa TrainBoss.
// ==========================================

// Loại toa: tên hiển thị, màu chủ đạo, kỹ năng, hồi chiêu (tick, trước hệ số tốc bắn)
const TRAIN_CAR_TYPES = {
    loco:   { name: 'ĐẦU TÀU',       short: 'ĐẦU',   color: '#ff3b3b', icon: '🚂', skill: 'Còi Tàu · Xông Ga',   cd: 300 },
    smg:    { name: 'TOA SMG',       short: 'SMG',   color: '#ffc531', icon: '🔫', skill: 'Xả Hai Phía',         cd: 230 },
    mortar: { name: 'TOA PHÁO KÍCH', short: 'PHÁO',  color: '#ff7a1a', icon: '💣', skill: 'Nả Pháo',             cd: 210 },
    laser:  { name: 'TOA LAZER',     short: 'LAZER', color: '#28e0ff', icon: '⚡', skill: 'Tia Ray',             cd: 170 },
    summon: { name: 'TOA GỌI QUÂN',  short: 'QUÂN',  color: '#5dff7a', icon: '🪖', skill: 'Mở Cửa Toa',          cd: 300 },
};

// Máu gốc Phase 1 (tổng 36): Đầu Tàu 7, SMG 4.5+4.5, Pháo 4.5+4.5, Lazer 4, Gọi Quân 3.5+3.5.
// Cân theo mô phỏng 91 body (body gốc, chưa Evo, AI đơn giản bất tử, tối đa 120s): DPS trung bình ~0.39/s.
//   50 máu: 43/91 body qua Phase 1 (trung vị 84s) · 40 máu: 51/91 (trung vị 79s) · 36 máu: xem báo cáo.
// TRAIN_HP_SCALE nhân toàn bộ (co-op ×1.6).
const TRAIN_HP_SCALE = 1;
const TRAIN_COOP_HP_MULT = 1.6;

// Sát thương gốc lên người chơi (HP xe thường 3–10)
const TRAIN_DMG = {
    smg: 0.3, shell: 0.9, laser: 1.2, runner: 0.8, gunner: 0.4, horn: 0.4, dash: 1.5,
};

const TRAIN_BASE_CARS = ['loco', 'smg', 'mortar', 'summon', 'laser', 'smg', 'mortar', 'summon'];
const TRAIN_BASE_HP = { loco: 7, smg: 4.5, mortar: 4.5, laser: 4, summon: 3.5 };

const TRAIN_VARIANTS = {
    p1: {
        id: 'p1', phase: 1, code: '1', name: 'THE TRAIN', stars: 0, theme: 'base',
        desc: 'Đoàn tàu 8 toa chạy ngang giữa sân, dừng lộ 3 toa rồi chạy tiếp.',
        cars: TRAIN_BASE_CARS, hp: TRAIN_BASE_HP,
        hpMult: 1, dmgMult: 1, rateMult: 1, stopTicks: 360, moveTicks: 140,
    },
    // ---- Phase 2 (kế hoạch) — tạm thời là BẢN DỰ PHÒNG: logic Phase 1 + tăng chỉ số ----
    '2.1': {
        id: '2.1', phase: 2, code: '2.1', name: 'TÀU THIẾT GIÁP', stars: 1, theme: 'armor', fallback: true,
        desc: 'Bò chậm liên tục, Giáp Mặt đổi phía mỗi 4s, Súng Máy Hạng Nặng, Khiên Binh.',
        cars: TRAIN_BASE_CARS, hp: TRAIN_BASE_HP,
        hpMult: 1.25, dmgMult: 1.1, rateMult: 1.05, stopTicks: 360, moveTicks: 140,
    },
    '2.2': {
        id: '2.2', phase: 2, code: '2.2', name: 'TÀU ĐÊM / TÀU MA', stars: 2, theme: 'night', fallback: true,
        desc: 'Đường hầm tối, Đèn Pha Truy Lùng đánh dấu, Toa Ảo Ảnh phản đạn, Bóng Ma Ray.',
        cars: TRAIN_BASE_CARS, hp: TRAIN_BASE_HP,
        hpMult: 1.35, dmgMult: 1.18, rateMult: 1.12, stopTicks: 330, moveTicks: 130,
    },
    '2.3': {
        id: '2.3', phase: 2, code: '2.3', name: 'TÀU HỎA NGỤC', stars: 3, theme: 'fire', fallback: true,
        desc: 'Toa Bồn Dầu nổ dây chuyền, Bom Xăng thành vũng lửa, Đầu Tàu Quá Nhiệt.',
        cars: TRAIN_BASE_CARS, hp: TRAIN_BASE_HP,
        hpMult: 1.45, dmgMult: 1.28, rateMult: 1.2, stopTicks: 300, moveTicks: 120,
    },
    // ---- Phase 3 (kế hoạch) — BẢN DỰ PHÒNG ----
    '3.1': {
        id: '3.1', phase: 3, code: '3.1', name: 'SIÊU TỐC TUYẾN ĐẦU', stars: 1, theme: 'speed', fallback: true,
        desc: '2 đường ray, 2 đoàn ngắn chạy ngược chiều, dừng ngắn 3s, Va Chạm giữa sân.',
        cars: TRAIN_BASE_CARS, hp: TRAIN_BASE_HP,
        hpMult: 1.5, dmgMult: 1.25, rateMult: 1.2, stopTicks: 260, moveTicks: 100,
    },
    '3.2': {
        id: '3.2', phase: 3, code: '3.2', name: 'PHÁO ĐÀI DI ĐỘNG', stars: 2, theme: 'fortress', fallback: true,
        desc: 'Tàu ghép thành pháo đài, băng chuyền toa, Pháo Ray Khổng Lồ nạp 6s, 2 tụ điện.',
        cars: TRAIN_BASE_CARS, hp: TRAIN_BASE_HP,
        hpMult: 1.65, dmgMult: 1.32, rateMult: 1.25, stopTicks: 380, moveTicks: 130,
    },
    '3.3': {
        id: '3.3', phase: 3, code: '3.3', name: 'ĐOÀN TÀU KÝ ỨC', stars: 3, theme: 'memory', fallback: true,
        desc: 'Mỗi toa sao chép kỹ năng 1 body, đổi ký ức mỗi vòng, Người Lái Ký Ức.',
        cars: TRAIN_BASE_CARS, hp: TRAIN_BASE_HP,
        hpMult: 1.8, dmgMult: 1.4, rateMult: 1.3, stopTicks: 300, moveTicks: 115,
    },
};

// Bảng màu theo chủ đề biến thể (hình minh hoạ thẻ + nhuộm tàu)
const TRAIN_THEMES = {
    base:     { sky: '#1a1030', glow: '#ff9f1c', steel: '#3a4458', accent: '#ff3b3b' },
    armor:    { sky: '#10161f', glow: '#9fb4d0', steel: '#4b5567', accent: '#cbd5e1' },
    night:    { sky: '#05060f', glow: '#a78bfa', steel: '#262a3d', accent: '#c4b5fd' },
    fire:     { sky: '#1d0705', glow: '#ff5a1f', steel: '#3d2b25', accent: '#ffb020' },
    speed:    { sky: '#04141c', glow: '#22d3ee', steel: '#2f4a5a', accent: '#67e8f9' },
    fortress: { sky: '#0f0b18', glow: '#f472b6', steel: '#3b3050', accent: '#f9a8d4' },
    memory:   { sky: '#0b0f1f', glow: '#facc15', steel: '#2f3550', accent: '#fde68a' },
};

// ---- Buff cho người chơi (giữ tới hết lượt chơi) ----
const TRAIN_PLAYER_BUFFS = {
    khoi_san_ga: { name: 'KHÓI SÂN GA',   icon: '🌫️', tier: 1, desc: 'Mỗi lần tàu đổi trạng thái (dừng ↔ chạy): bất tử 0.5s.' },
    tin_hieu_do: { name: 'TÍN HIỆU ĐỎ',   icon: '🚦', tier: 1, desc: 'Bắn trúng Đầu Tàu: tàu dừng thêm 1.5s (1 lần mỗi lượt dừng).' },
    tho_may:     { name: 'KÝ ỨC THỢ MÁY', icon: '🔧', tier: 2, desc: 'Mỗi toa bị phá: +1 đạn tối đa vĩnh viễn.' },
    ve_hang_nhat:{ name: 'VÉ HẠNG NHẤT',  icon: '🎫', tier: 2, desc: '+2 Máu tối đa, hồi đầy đầu mỗi Phase.' },
    pha_ray:     { name: 'PHÁ RAY',       icon: '⛏️', tier: 3, desc: '+35% sát thương lên toa tàu và lính.' },
    ve_khu_hoi:  { name: 'VÉ KHỨ HỒI',    icon: '🎟️', tier: 3, desc: 'Hồi sinh 1 lần trong lượt chơi (co-op: cả đội).' },
};

// ---- Buff cho boss ----
const TRAIN_BOSS_BUFFS = {
    warn01:    { name: 'Cảnh báo ngắn hơn 0.1s', icon: '⏱️', tier: 1 },
    rate15:    { name: '+15% tốc bắn',          icon: '🔥', tier: 1 },
    minion1:   { name: 'Lính +1 mỗi lần thả',   icon: '🪖', tier: 2 },
    armor20:   { name: 'Giáp toa (−20% dame nhận)', icon: '🛡️', tier: 2 },
    hp20:      { name: '+20% máu',              icon: '❤️', tier: 2 },
    extra_car: { name: 'Thêm 1 toa ngẫu nhiên', icon: '🚃', tier: 3 },
};

// Gói thẻ cho Phase kế tiếp: mỗi thẻ = 1 buff bạn + 1 biến thể + buff boss (★ càng cao càng mạnh / càng khó)
const TRAIN_MEMORY_SLOTS = {
    2: ['2.1', '2.2', '2.3'],
    3: ['3.1', '3.2', '3.3'],
};
const TRAIN_STAR_COLORS = { 1: '#38e8ff', 2: '#c26bff', 3: '#ff4d4d' };

function trainPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Tạo 3 thẻ Ký Ức cho phase (2 hoặc 3). taken: buff bạn đã có (tránh trùng trong cùng 1 lần chọn)
function trainBuildMemoryCards(phase) {
    const slots = TRAIN_MEMORY_SLOTS[phase] || TRAIN_MEMORY_SLOTS[2];
    const used = new Set();
    return slots.map((vid, i) => {
        const star = (TRAIN_VARIANTS[vid] && TRAIN_VARIANTS[vid].stars) || (i + 1);
        const pool = Object.keys(TRAIN_PLAYER_BUFFS).filter(k => TRAIN_PLAYER_BUFFS[k].tier === star && !used.has(k));
        const pb = pool.length ? trainPick(pool) : trainPick(Object.keys(TRAIN_PLAYER_BUFFS).filter(k => !used.has(k)));
        used.add(pb);
        let boss;
        if (star === 1) boss = [trainPick(['warn01', 'rate15'])];
        else if (star === 2) boss = [trainPick(['minion1', 'armor20', 'hp20'])];
        else boss = ['extra_car', trainPick(['hp20', 'rate15', 'minion1'])];
        return { star, variant: vid, playerBuff: pb, bossBuffs: boss };
    });
}
