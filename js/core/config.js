// ==========================================
// Cấu hình chung, trạng thái trận, phím điều khiển
// ==========================================



// --- CẤU HÌNH ---
const C = {
    tankW: 30, tankH: 30,
    baseSpeed: 3.5,
    bulletSpeed: 4.8,
    reloadTime: 1500,
    suddenDeathTime: 60000
};

// --- GAME STATE ---
let gameState = {
    round: 1,
    p1Score: 0, p2Score: 0,
    p1Coins: 0, p2Coins: 0,
    phase: 'upgrade',
    p1Ready: false, p2Ready: false,
    lastObstacleSpawn: 0,
    roundStartTime: 0,
    currentMap: 'classic',
    selectedMapMode: 'classic'
};

const inputs = {
    p1: { l: false, r: false, s: false },
    p2: { l: false, r: false, s: false }
};

// --- CỐ ĐỊNH LOGIC LOOP Ở 60 TICK/GIÂY (FIXED TIMESTEP ACCUMULATOR) ---
const TICK_RATE = 60;
const TICK_TIME = 1000 / TICK_RATE;
