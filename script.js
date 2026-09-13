// ============================================================================
// PROCEDURAL SOUND SYSTEM (WEB AUDIO API - 100% SELF-CONTAINED)
// ============================================================================
class WebAudioSoundSystem {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }
    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
    playTone(freq, type, duration, startVol = 0.2, endVol = 0.001) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(startVol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(endVol, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch(e) {}
    }
    playShoot(type = 'normal') {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            if (type === 'laser') {
                this.playTone(880, 'sine', 0.12, 0.2, 0.01);
            } else if (type === 'cannon') {
                this.playTone(160, 'sawtooth', 0.18, 0.3, 0.01);
            } else {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(480, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.09);
                gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.09);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.09);
            }
        } catch(e) {}
    }
    playLaser() {
        this.playShoot('laser');
    }
    playExplosion() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.09));
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(320, this.ctx.currentTime);
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start();
        } catch(e) {}
    }
    playHit() {
        this.playTone(220, 'square', 0.07, 0.15, 0.01);
    }
    playClick() {
        this.playTone(600, 'sine', 0.05, 0.1, 0.01);
    }
    playDash() {
        this.playTone(180, 'sawtooth', 0.12, 0.2, 0.01);
    }
    playShieldBreak() {
        this.playTone(700, 'triangle', 0.15, 0.25, 0.01);
        setTimeout(() => this.playTone(320, 'sawtooth', 0.2, 0.2, 0.01), 40);
    }
    playCoin() {
        this.playTone(987.77, 'sine', 0.08, 0.15, 0.01);
        setTimeout(() => this.playTone(1318.51, 'sine', 0.15, 0.15, 0.01), 70);
    }
    playPowerup() {
        this.playTone(330, 'triangle', 0.09, 0.15, 0.01);
        setTimeout(() => this.playTone(440, 'triangle', 0.09, 0.15, 0.01), 70);
        setTimeout(() => this.playTone(660, 'triangle', 0.16, 0.2, 0.01), 140);
    }
    playRevive() {
        this.playTone(261.63, 'sine', 0.15, 0.2, 0.01);
        setTimeout(() => this.playTone(329.63, 'sine', 0.15, 0.2, 0.01), 90);
        setTimeout(() => this.playTone(392.00, 'sine', 0.15, 0.2, 0.01), 180);
        setTimeout(() => this.playTone(523.25, 'sine', 0.35, 0.25, 0.01), 270);
    }
    playWin() {
        this.playTone(523.25, 'sine', 0.15, 0.2, 0.01);
        setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.2, 0.01), 140);
        setTimeout(() => this.playTone(783.99, 'sine', 0.15, 0.2, 0.01), 280);
        setTimeout(() => this.playTone(1046.50, 'sine', 0.45, 0.3, 0.01), 420);
    }
}
const soundSystem = new WebAudioSoundSystem();

// ============================================================================
// SCREEN SHAKE, FLOATING COMBAT TEXT & PARTICLES
// ============================================================================
let screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
function triggerScreenShake(intensity = 6, duration = 10) {
    screenShake.intensity = Math.max(screenShake.intensity, intensity);
    screenShake.duration = Math.max(screenShake.duration, duration);
}

let fatalCinematic = {
    active: false,
    timer: 0,
    maxTimer: 90,
    winnerId: null,
    victimX: 0,
    victimY: 0
};

function triggerFatalCinematic(winnerId, victim) {
    if (fatalCinematic.active || gameState.phase !== 'playing') return;

    if (victim) {
        victim.hp = 0;
        victim.ghostHp = 0;
    }

    let vx = victim ? (victim.x + victim.w / 2) : canvas.width / 2;
    let vy = victim ? (victim.y + victim.h / 2) : canvas.height / 2;

    fatalCinematic.active = true;
    fatalCinematic.timer = 90;
    fatalCinematic.maxTimer = 90;
    fatalCinematic.winnerId = winnerId;
    fatalCinematic.victimX = vx;
    fatalCinematic.victimY = vy;

    // Dramatic Screen Shake
    triggerScreenShake(14, 30);

    // Initial shockwave and explosion burst
    let winColor = (winnerId === 1) ? '#00f0ff' : ((winnerId === 2) ? '#ff0055' : '#ffd700');
    explosions.push(new Explosion(vx, vy, 85, winColor, 3, null));

    // Staggered secondary debris explosions
    for (let k = 1; k <= 5; k++) {
        setTimeout(() => {
            if (fatalCinematic.active) {
                let ox = (Math.random() - 0.5) * 50;
                let oy = (Math.random() - 0.5) * 50;
                explosions.push(new Explosion(vx + ox, vy + oy, 40 + Math.random() * 20, 'rgba(255, 120, 0,', 2, null));
                if (soundSystem) soundSystem.playExplosion();
            }
        }, k * 120);
    }

    if (soundSystem) {
        soundSystem.playExplosion();
        soundSystem.playWin();
    }
}

function drawVictoryBanner(winnerId, timer, maxTimer) {
    let progress = 1 - (timer / maxTimer);

    ctx.save();
    let bannerW = Math.min(canvas.width * 0.94, 380);
    let bannerH = 75;
    let bannerX = (canvas.width - bannerW) / 2;
    let bannerY = (canvas.height - bannerH) / 2;

    let isP1 = (winnerId === 1);
    let isP2 = (winnerId === 2);
    let mainColor = isP1 ? "#00f0ff" : (isP2 ? "#ff0055" : "#ffd700");
    let glowColor = isP1 ? "rgba(0, 240, 255, 0.8)" : (isP2 ? "rgba(255, 0, 85, 0.8)" : "rgba(255, 215, 0, 0.8)");
    let winnerText = isP1 ? "PLAYER 1 (BLUE)" : (isP2 ? "PLAYER 2 (RED)" : "CẢ HAI BÊN");

    // Dynamic banner bounce scale
    let scale = Math.min(1, 0.6 + progress * 0.5);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Dark cyberpunk banner backdrop
    ctx.fillStyle = "rgba(10, 14, 26, 0.92)";
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 22;

    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 12);
    } else {
        ctx.rect(bannerX, bannerY, bannerW, bannerH);
    }
    ctx.fill();
    ctx.stroke();

    // Inner highlight stripes
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.strokeRect(bannerX + 4, bannerY + 4, bannerW - 8, bannerH - 8);

    // Main Victory Text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 22px 'Orbitron', Arial, sans-serif";
    ctx.fillStyle = mainColor;
    ctx.shadowColor = mainColor;
    ctx.shadowBlur = 18;
    ctx.fillText(`${winnerText} THẮNG!`, canvas.width / 2, bannerY + 28);

    // Subtitle
    ctx.font = "bold 13px 'Orbitron', Arial, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 6;
    ctx.fillText("★ VICTORY ★", canvas.width / 2, bannerY + 54);

    ctx.restore();
}

let floatingTexts = [];
function addFloatingText(x, y, text, color = '#fff', size = 14) {
    floatingTexts.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y,
        text: text,
        color: color,
        size: size,
        vy: -1.2,
        life: 45,
        maxLife: 45
    });
}
function updateAndDrawFloatingTexts() {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        let ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.life--;
        if (ft.life <= 0) {
            floatingTexts.splice(i, 1);
            continue;
        }
        let alpha = Math.min(1, ft.life / 15);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = ft.color;
        ctx.font = "bold " + ft.size + "px 'Orbitron', Arial, sans-serif";
        ctx.textAlign = 'center';
        ctx.shadowBlur = 8;
        ctx.shadowColor = ft.color;
        drawWorldText(ctx, ft.text, ft.x, ft.y);
        ctx.restore();
    }
}

let particles = [];
function spawnSparkParticles(x, y, color = '#ffd700', count = 8) {
    for (let i = 0; i < count; i++) {
        let angle = Math.random() * Math.PI * 2;
        let speed = 1 + Math.random() * 4;
        particles.push({
            x: x, y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: color,
            r: 2 + Math.random() * 2,
            life: 20 + Math.random() * 15,
            maxLife: 35
        });
    }
}
function updateAndDrawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life--;
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        ctx.save();
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- CẤU HÌNH SÀN ĐẤU CHUẨN ONLINE MOBILE ---
const ONLINE_ARENA_WIDTH = 420;
const ONLINE_ARENA_HEIGHT = 700;

function updateCanvasDimensions() {
    const container = document.getElementById('gameContainer');
    if (!container || !canvas) return;
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
        canvas.width = ONLINE_ARENA_WIDTH;
        canvas.height = ONLINE_ARENA_HEIGHT;
    } else {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }
    if (typeof p1 !== 'undefined' && typeof p2 !== 'undefined' && p1 && p2 && typeof gameState !== 'undefined' && gameState.phase === 'playing') {
        p1.y = canvas.height - p1.h - 22;
        p2.y = 20;
    }
}

function drawWorldText(ctx, text, x, y) {
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI);
        ctx.fillText(text, 0, 0);
        ctx.restore();
    } else {
        ctx.fillText(text, x, y);
    }
}

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
    ],
    FEET: [
        { id: 'speed', name: 'Động Cơ', desc: 'Tăng tốc độ di chuyển.', type: 'feet', cost: 30 },
        { id: 'armor', name: 'Giáp Thép', desc: '+1 Máu tối đa.', type: 'feet', cost: 15 },
        { id: 'damage', name: 'Bánh Xích', desc: 'x1.25 Sát thương.', type: 'feet', cost: 20 },
        { id: 'interest', name: 'Lợi Tức', desc: 'Sau mỗi round: +30$ (Xe Tiền +60$). Cộng dồn.', type: 'feet', cost: 10 }
    ]
};

// --- EVOLUTIONS ---
const EVOLUTIONS = {
    basic: [
        { id: 'evo_basic_1', name: 'Công Thủ Toàn Diện', desc: 'HP+6, Dame ×2', cost: 15, type: 'evo' },
        { id: 'evo_basic_2', name: 'Thập Tử Nhất Sinh', desc: 'Về 0 HP -> Hồi 1 HP + Bất tử 3s', cost: 30, type: 'evo' } // UPDATE DESC
    ],
    money_tank: [
        { id: 'evo_money_atk', name: 'Tiền Tấn Công', desc: 'Phá xe tiền -> Bắn chùm đạn vào địch', cost: 200, type: 'evo' } // UPDATE DESC
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
    ]
};

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


// --- CLASSES ---
class ShadowTrap {
    constructor(x, y, owner, isFullEvo = false) {
        this.x = x;
        this.y = y;
        this.radius = 26;
        this.owner = owner;
        this.isFullEvo = isFullEvo;
        this.active = true;
        this.triggered = false;
        this.triggerTimer = 120; // 2s warning
    }
    update(opponent) {
        if (!this.active) return;
        if (!opponent || opponent.hp <= 0) return;

        let ox = opponent.x + opponent.w / 2;
        let oy = opponent.y + opponent.h / 2;
        let dist = Math.hypot(ox - this.x, oy - this.y);

        if (!this.triggered) {
            if (dist <= this.radius + 15) {
                this.triggered = true;
                this.triggerTimer = 120;
                if (this.isFullEvo) {
                    opponent.slowTimer = 60; // Instant slow on stepping
                    if (typeof addFloatingText === 'function') addFloatingText(opponent.x + opponent.w / 2, opponent.y - 12, "TRAPPED! 🕸️", "#9b59b6", 13);
                }
            }
        } else {
            this.triggerTimer--;
            if (this.triggerTimer <= 0) {
                // Detonate
                if (dist <= this.radius + 20) {
                    const isOnline = (typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline);
                    let dmg = (this.isFullEvo && isOnline) ? 1.4 : 2; // Online balance (-30%)
                    opponent.takeDamage(dmg, this.owner);
                    opponent.bleedTimer = 60;
                    opponent.bleedInterval = 12;
                    opponent.bleedDmg = Math.max(0.05, opponent.maxHp * 0.02);

                    if (this.isFullEvo) {
                        opponent.freezeTimer = 90; // Stun 1.5s
                        if (typeof addFloatingText === 'function') addFloatingText(opponent.x + opponent.w / 2, opponent.y - 20, "STUNNED! ⚡", "#00f0ff", 14);
                    }
                }
                if (typeof explosions !== 'undefined') explosions.push(new Explosion(this.x, this.y, 60, 'rgba(155, 89, 182,', 0, this.owner));
                this.active = false;
            }
        }
    }
    draw() {
        if (!this.active) return;
        const isOnline = (typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline);
        const isOwner = (typeof onlineManager === 'undefined' || !onlineManager || !onlineManager.isOnline)
            ? true
            : (onlineManager.role === 'host' ? this.owner.id === 1 : this.owner.id === 2);

        // In Full Evo: invisible to opponent until triggered
        if (this.isFullEvo && isOnline && !isOwner && !this.triggered) {
            return; // 100% invisible on opponent screen
        }

        ctx.save();
        if (!this.triggered) {
            ctx.strokeStyle = this.isFullEvo ? "rgba(155, 89, 182, 0.4)" : "rgba(155, 89, 182, 0.7)";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Trap center rune
            ctx.fillStyle = "#9b59b6";
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Warning telegraph circle
            let warnProgress = 1 - (this.triggerTimer / 120);
            let pulse = (Math.sin(Date.now() * 0.03) + 1) * 0.2 + 0.3;
            ctx.fillStyle = `rgba(255, 0, 50, ${pulse * 0.4})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 10, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "#ff0033";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, (this.radius + 10) * warnProgress, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = "#ff0033";
            ctx.font = "bold 11px Orbitron, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("⚠️ TRAP!", this.x, this.y - this.radius - 8);
        }
        ctx.restore();
    }
}

class ShortgunFireZone {
    constructor(x, y, dirY, length, angleSpread, duration, owner) {
        this.x = x;
        this.y = y;
        this.dirY = dirY;
        this.length = length || 130;
        this.angleSpread = angleSpread || 0.45;
        this.duration = duration || 180;
        this.owner = owner;
        this.active = true;
    }
    update(targets) {
        if (!this.active) return;
        this.duration--;
        if (this.duration <= 0) {
            this.active = false;
            return;
        }

        // Damage ticks every 15 frames (~4 times per second)
        if (this.duration % 15 === 0 && Array.isArray(targets)) {
            targets.forEach(t => {
                if (!t || t.hp <= 0) return;
                let tx = t.x + (t.w || 30) / 2;
                let ty = t.y + (t.h || 30) / 2;
                let dx = tx - this.x;
                let dy = ty - this.y;
                let dist = Math.hypot(dx, dy);

                if (dist <= this.length) {
                    let angle = Math.atan2(dy, dx);
                    let baseAngle = (this.dirY === -1) ? -Math.PI / 2 : Math.PI / 2;
                    let diff = Math.abs(angle - baseAngle);
                    if (diff > Math.PI) diff = Math.PI * 2 - diff;

                    if (diff <= this.angleSpread) {
                        t.burnStacks = (t.burnStacks || 0) + 1;
                        t.burnTimer = 120;
                        if (typeof t.takeDamage === 'function') {
                            t.takeDamage(0.2, this.owner, { isEnvironmental: true });
                        } else if (typeof t.hp === 'number') {
                            t.hp -= 0.2;
                        }
                        if (typeof spawnSparkParticles === 'function') spawnSparkParticles(tx, ty, "#ff5500", 2);
                    }
                }
            });
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        let baseAngle = (this.dirY === -1) ? -Math.PI / 2 : Math.PI / 2;
        let alpha = Math.min(0.35, this.duration / 60);

        ctx.fillStyle = `rgba(255, 69, 0, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, this.length, baseAngle - this.angleSpread, baseAngle + this.angleSpread);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 140, 0, ${alpha + 0.2})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Fiery sparks
        if (Math.random() < 0.3 && typeof spawnSparkParticles === 'function') {
            let rDist = Math.random() * this.length;
            let rAng = baseAngle + (Math.random() - 0.5) * (this.angleSpread * 2);
            let px = this.x + Math.cos(rAng) * rDist;
            let py = this.y + Math.sin(rAng) * rDist;
            spawnSparkParticles(px, py, "#ffaa00", 1);
        }
        ctx.restore();
    }
}

class MovingObstacle {
    constructor() {
        this.w = 60; this.h = 20;
        this.y = (canvas.height / 2) - (this.h / 2);
        if (Math.random() > 0.5) { this.x = -this.w; this.vx = 2 + Math.random(); }
        else { this.x = canvas.width; this.vx = -(2 + Math.random()); }
        this.spawnTime = Date.now();
        this.lifeTime = 8000;
        this.active = true;
        this.opacity = 1;
    }
    update() {
        if (!this.active) return;
        this.x += this.vx;
        if (this.x <= 0 || this.x + this.w >= canvas.width) this.vx *= -1;
        const age = Date.now() - this.spawnTime;
        if (age > this.lifeTime) this.active = false;
        else if (age > this.lifeTime - 1000) this.opacity = 1 - (age - (this.lifeTime - 1000)) / 1000;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = "#7f8c8d"; ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = "#2c3e50"; ctx.lineWidth = 2; ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.restore();
    }
}

class Crate {
    constructor() {
        this.id = 'c_' + Math.random().toString(36).substr(2, 9);
        this.w = 22; this.h = 22;
        this.x = 40 + Math.random() * (canvas.width - 80);
        this.y = 80 + Math.random() * (canvas.height - 160);
        this.active = true;
        this.spawnTime = Date.now();
        this.lifeTime = 10000;
        this.isMimic = (Math.random() < 0.2);

        let hasInventor = (typeof p1 !== 'undefined' && p1 && (p1.weapon === 'inventor' || p1.weapon === 'genius')) || (typeof p2 !== 'undefined' && p2 && (p2.weapon === 'inventor' || p2.weapon === 'genius'));
        let hasEvo1 = (typeof p1 !== 'undefined' && p1 && ((p1.weapon === 'inventor' && p1.hasUpgrade('evo_inv_1')) || (p1.weapon === 'genius' && p1.hasUpgrade('evo_gen_1')))) || (typeof p2 !== 'undefined' && p2 && ((p2.weapon === 'inventor' && p2.hasUpgrade('evo_inv_1')) || (p2.weapon === 'genius' && p2.hasUpgrade('evo_gen_1'))));

        let rand = Math.random();
        if (hasEvo1) {
            if (rand < 0.20) this.type = 'coin';
            else if (rand < 0.35) this.type = 'hp';
            else if (rand < 0.45) this.type = 'ammo';
            else if (rand < 0.55) this.type = 'shield';
            else if (rand < 0.65) this.type = 'dmg';
            else if (rand < 0.85) this.type = 'gear';
            else this.type = 'boom';
        } else if (hasInventor) {
            if (rand < 0.20) this.type = 'coin';
            else if (rand < 0.38) this.type = 'hp';
            else if (rand < 0.50) this.type = 'ammo';
            else if (rand < 0.62) this.type = 'shield';
            else if (rand < 0.72) this.type = 'dmg';
            else if (rand < 0.86) this.type = 'gear';
            else this.type = 'boom';
        } else {
            if (rand < 0.25) this.type = 'coin';
            else if (rand < 0.45) this.type = 'hp';
            else if (rand < 0.60) this.type = 'ammo';
            else if (rand < 0.75) this.type = 'shield';
            else if (rand < 0.85) this.type = 'dmg';
            else this.type = 'boom';
        }
    }
    update() {
        if (!this.active) return;
        if (Date.now() - this.spawnTime > this.lifeTime) this.active = false;
    }
    draw() {
        if (!this.active) return;
        if (this.type === 'coin') ctx.fillStyle = '#f1c40f';
        else if (this.type === 'hp') ctx.fillStyle = '#2ecc71';
        else if (this.type === 'ammo') ctx.fillStyle = '#e67e22';
        else if (this.type === 'shield') ctx.fillStyle = '#3498db';
        else if (this.type === 'dmg') ctx.fillStyle = '#9b59b6';
        else if (this.type === 'boom') ctx.fillStyle = '#c0392b';
        else if (this.type === 'gear') ctx.fillStyle = '#00ffcc';

        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = '#000'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';

        let txt = '$';
        if (this.type === 'hp') txt = '+';
        else if (this.type === 'ammo') txt = 'A';
        else if (this.type === 'shield') txt = 'S';
        else if (this.type === 'dmg') txt = 'D';
        else if (this.type === 'boom') txt = '!';
        else if (this.type === 'gear') txt = 'G';

        const isGuestView = (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest');
        if (isGuestView) {
            ctx.save();
            ctx.translate(this.x + 11, this.y + 11);
            ctx.rotate(Math.PI);
            ctx.fillText(txt, 0, 4);
            ctx.restore();
        } else {
            ctx.fillText(txt, this.x + 11, this.y + 16);
        }

        let lifePct = 1 - (Date.now() - this.spawnTime) / this.lifeTime;
        ctx.fillStyle = 'white'; ctx.fillRect(this.x, this.y + 22, this.w * lifePct, 2);
    }
}

function triggerMimicExplosion(crate, destroyer) {
    let count = (destroyer && destroyer.hasUpgrade && destroyer.hasUpgrade('evo_evo_2')) ? 16 : 8;
    let baseDmg = (destroyer && destroyer.hasUpgrade && destroyer.hasUpgrade('evo_evo_2')) ? (destroyer.damage || 1) : 0.5;
    let step = (Math.PI * 2) / count;
    for (let i = 0; i < count; i++) {
        let angle = i * step + (Math.random() - 0.5) * 0.15;
        let spd = 4.5 + Math.random();
        let targetOwner = (destroyer && destroyer.bullets) ? destroyer : ((destroyer && destroyer.id === 1) ? p1 : p2);
        if (targetOwner && targetOwner.bullets) {
            targetOwner.bullets.push({
                x: crate.x + crate.w / 2,
                y: crate.y + crate.h / 2,
                w: 5, h: 5,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                dmg: baseDmg,
                owner: targetOwner,
                isShrapnel: true,
                hitIds: []
            });
        }
    }
    explosions.push(new Explosion(crate.x + crate.w / 2, crate.y + crate.h / 2, 45, 'rgba(231, 76, 60,', 1, null));
    if (destroyer && destroyer.weapon === 'evolution') {
        destroyer.onEvolutionCrateEat('mimic');
    }
}

class MoneyTruck {
    constructor() {
        this.id = 'mt_' + Math.random().toString(36).substr(2, 9);
        this.w = 45; this.h = 28;
        this.hp = 6;
        this.y = 100 + Math.random() * (canvas.height - 200);
        this.dir = Math.random() > 0.5 ? 1 : -1;
        this.x = this.dir === 1 ? -60 : canvas.width + 10;
        this.speed = 1.25;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.x += this.speed * this.dir;
        if ((this.dir === 1 && this.x > canvas.width) || (this.dir === -1 && this.x < -70)) this.active = false;
    }
    draw() {
        if (!this.active) return;
        ctx.fillStyle = '#8e44ad';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = '#fff'; ctx.font = '10px Arial'; ctx.textAlign = 'center';
        const isGuestView = (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest');
        if (isGuestView) {
            ctx.save();
            ctx.translate(this.x + 22, this.y + 14);
            ctx.rotate(Math.PI);
            ctx.fillText("$$$", 0, 4);
            ctx.fillText(`HP:${Math.ceil(this.hp)}`, 0, -9);
            ctx.restore();
        } else {
            ctx.fillText(`HP:${Math.ceil(this.hp)}`, this.x + 22, this.y - 5);
            ctx.fillText("$$$", this.x + 22, this.y + 18);
        }
    }
}
// --- GLOBAL VARS BỔ SUNG ---
let windWalls = []; // Mảng chứa tường gió
let isRaining = false; // Cờ bật hiệu ứng mưa
let rainDrops = []; // Mảng hạt mưa
let cinematicMode = false; // Chế độ kết liễu
let cinematicTimer = 0; // Timer đếm ngược kết liễu
let cinematicVictim = null;    // <--- THÊM DÒNG NÀY
let cinematicWinnerId = null;  // <--- THÊM DÒNG NÀY
// --- CLASS TƯỜNG GIÓ (WIND WALL) ---
class WindWall {
    constructor(x, y, owner) {
        this.x = x; this.y = y;
        this.w = 120; this.h = 20; // Tường rộng
        this.owner = owner;
        this.lifeTime = 240; // 2 giây (60fps * 2)
        this.active = true;
    }

    update() {
        if (!this.active) return;
        this.lifeTime--;
        if (this.lifeTime <= 0) this.active = false;

        // 1. CHẶN ĐẠN ĐỊCH
        const enemy = (this.owner.id === 1) ? p2 : p1;
        for (let i = enemy.bullets.length - 1; i >= 0; i--) {
            let b = enemy.bullets[i];
            // Nếu đạn chạm tường
            if (rectIntersect(this.x, this.y, this.w, this.h, b.x, b.y, b.w, b.h)) {
                // Hủy đạn ngay lập tức (kể cả đạn xuyên)
                enemy.bullets.splice(i, 1);
                // Hiệu ứng chặn
                explosions.push(new Explosion(b.x, b.y, 20, 'white', 0, this.owner));
            }
        }

        // 2. GIA TỐC ĐẠN MÌNH (Phong Trảm)
        for (let b of this.owner.bullets) {
            if (b.isWindBlade && !b.isAccelerated) {
                if (rectIntersect(this.x, this.y, this.w, this.h, b.x, b.y, b.w, b.h)) {
                    b.vy *= 2; // Tăng gấp đôi tốc độ
                    b.isAccelerated = true; // Đánh dấu để không buff nhiều lần
                    // Visual buff
                    explosions.push(new Explosion(b.x, b.y, 30, 'cyan', 0, this.owner));
                }
            }
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = "#aaddff";
        // Vẽ tường lượn sóng hoặc hình chữ nhật mờ
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);

        // Viền gió xoáy
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.w / 2, -this.h / 2, this.w, this.h);

        // Text Wind Wall
        ctx.fillStyle = "white"; ctx.font = "10px Arial"; ctx.textAlign = "center";
        ctx.fillText("WIND WALL", 0, 4);
        ctx.restore();
    }
}
// ==========================================
// --- CLASS INVENTOR DRONE (DRONE KHÔNG KÍCH) ---
// ==========================================
class InventorDrone {
    constructor(owner, offsetX = 0) {
        this.owner = owner;
        this.w = 26;
        this.h = 20;
        this.offsetX = offsetX;
        this.x = Math.max(20, Math.min(canvas.width - 40, (canvas.width / 2) + offsetX));
        this.y = (this.owner.id === 1) ? canvas.height * 0.45 : canvas.height * 0.55;
        this.baseSpeed = 3;
        this.vx = (Math.random() > 0.5 ? 1 : -1) * this.baseSpeed;

        this.active = true;
        this.deadTimer = 0;
        this.lastShot = Date.now();

        this.hp = this.getMaxHp();

        this.lastPhao = 0;
        this.lastSmg = 0;
        this.lastBang = 0;
        this.lastLua = 0;
        this.lastTuGio = 0;
        this.lastKhien = 0;
    }

    getMaxHp() {
        let isFullEvo = this.owner.isFullEvoInventor || (this.owner.hasUpgrade('evo_inv_1') && this.owner.hasUpgrade('evo_inv_2') && this.owner.invUpgrades && this.owner.invUpgrades['inv_full_evo']);
        let ratio = 0.5;
        if (isFullEvo) ratio = 2.0; // 200% chỉ số từ chủ thể
        else if (this.owner.hasUpgrade('evo_inv_1')) ratio = 0.75; // 75% chỉ số
        let baseHp = Math.max(1, this.owner.maxHp * ratio);
        let khienLvl = (this.owner.invUpgrades && this.owner.invUpgrades['inv_khien_drone']) || 0;
        return baseHp + (khienLvl * 2);
    }

    get isOverclocking() {
        return !!(this.owner && this.owner.isOverclocking);
    }

    getRespawnTime() {
        let upg = this.owner.invUpgrades || {};
        let hasEvo2 = this.owner.hasUpgrade('evo_inv_2');
        let respawnTime = 10000;
        if (hasEvo2) respawnTime = 8000;
        else if (this.owner.hasUpgrade('evo_inv_1')) respawnTime = 8000;
        if (hasEvo2 && this.owner.hasUpgrade('evo_inv_1')) respawnTime = 6500;
        respawnTime -= (upg['inv_bodam'] || 0) * 500;
        return Math.max(2000, respawnTime);
    }

    update() {
        let upg = this.owner.invUpgrades || {};
        let hasEvo2 = this.owner.hasUpgrade('evo_inv_2');
        let isFullEvo = this.owner.isFullEvoInventor || (this.owner.hasUpgrade('evo_inv_1') && this.owner.hasUpgrade('evo_inv_2') && upg['inv_full_evo']);

        // Respawn logic (Bộ Đàm: giảm 0.5s hồi sinh mỗi cấp)
        let respawnTime = this.getRespawnTime();

        if (!this.active) {
            if (Date.now() - this.deadTimer > respawnTime) {
                this.active = true;
                this.hp = this.getMaxHp() / 2;
                explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 35, '#00ffcc', 0, this.owner));
            }
            return;
        }

        // TB Ổn Định: tăng tốc chạy & tốc bắn
        let speed = this.baseSpeed + ((upg['inv_ondinh'] || 0) * 0.6);
        if (hasEvo2) speed *= 1.2;
        if (isFullEvo) speed *= 1.3;

        let fireRate = 1000 - ((upg['inv_ondinh'] || 0) * 150);

        // Ép Xung (+50% tốc chạy, +100% tốc bắn)
        if (this.owner.isOverclocking) {
            speed *= 1.5;
            fireRate *= 0.5;
        }

        this.x += Math.sign(this.vx) * speed;
        if (this.x <= 4) { this.x = 4; this.vx = Math.abs(this.vx); }
        else if (this.x + this.w >= canvas.width - 4) { this.x = canvas.width - this.w - 4; this.vx = -Math.abs(this.vx); }

        // Bắn nòng chính
        if (Date.now() - this.lastShot > fireRate) {
            this.shootDefault(upg);
            this.lastShot = Date.now();
        }

        // Vũ khí phụ
        this.updateSubWeapons(upg);
    }

    shootDefault(upg) {
        let enemy = (this.owner.id === 1) ? p2 : p1;
        let baseDirY = (this.owner.id === 1) ? -1 : 1;
        let bulletSpd = 5.5;
        let vx = 0;
        let vy = baseDirY * bulletSpd;

        if (upg['inv_ngam'] && enemy) {
            let dx = (enemy.x + enemy.w / 2) - (this.x + this.w / 2);
            let dy = (enemy.y + enemy.h / 2) - (this.y + this.h / 2);
            let angle = Math.atan2(dy, dx);
            // Giới hạn góc ngắm để đạn luôn hướng về phía địch, không bị bẻ ngang đâm tường
            let desiredVx = Math.cos(angle) * bulletSpd;
            vx = Math.max(-1.8, Math.min(1.8, desiredVx));
            vy = baseDirY * Math.sqrt(Math.max(16, bulletSpd * bulletSpd - vx * vx));
        }

        let isPiercing = !!upg['inv_lazer'];
        let numBullets = 1 + (upg['inv_dan'] || 0);
        let isFullEvo = this.owner.isFullEvoInventor || (this.owner.hasUpgrade('evo_inv_1') && this.owner.hasUpgrade('evo_inv_2') && upg['inv_full_evo']);
        let dmgMultiplier = 0.5;
        if (isFullEvo) dmgMultiplier = 2.0; // 200% chỉ số từ chủ thể
        else if (this.owner.hasUpgrade('evo_inv_1')) dmgMultiplier = 0.75;

        for (let i = 0; i < numBullets; i++) {
            let spreadVx = vx;
            if (numBullets > 1) {
                // Tỏa đều đối xứng hai bên, không bị văng lệch một phía
                spreadVx += (i - (numBullets - 1) / 2) * 1.2;
            }
            this.owner.bullets.push({
                x: this.x + this.w / 2 - 3,
                y: this.y + (vy > 0 ? this.h : -4),
                w: isPiercing ? 4 : 6,
                h: isPiercing ? 14 : 6,
                vx: spreadVx,
                vy: vy,
                dmg: Math.max(0.25, this.owner.damage * dmgMultiplier),
                owner: this.owner,
                isPiercing: isPiercing,
                isInventorBullet: true,
                hitIds: [],
                bounceCount: 0,
                active: true
            });
        }
        soundSystem.playShoot(isPiercing ? 'laser' : 'normal');
    }

    updateSubWeapons(upg) {
        let now = Date.now();
        let isFullEvo = this.owner.isFullEvoInventor || (this.owner.hasUpgrade('evo_inv_1') && this.owner.hasUpgrade('evo_inv_2') && upg['inv_full_evo']);
        let cdMod = isFullEvo ? 0.4 : 1.0;
        if (this.owner.isOverclocking) cdMod *= 0.5;

        if (upg['inv_phao'] && now - this.lastPhao > 3000 * cdMod) {
            this.fireAoEBullet('mortar', upg); this.lastPhao = now;
        }
        if (upg['inv_smg'] && now - this.lastSmg > 5000 * cdMod) {
            this.fireConeSMG(); this.lastSmg = now;
        }
        if (upg['inv_bang'] && now - this.lastBang > 4000 * cdMod) {
            this.fireAoEBullet('ice', upg); this.lastBang = now;
        }
        if (upg['inv_lua'] && now - this.lastLua > 4000 * cdMod) {
            this.fireAoEBullet('fire', upg); this.lastLua = now;
        }
        if (upg['inv_tugio'] && now - this.lastTuGio > 2000 * cdMod) {
            this.clearEnemyBulletsInRadius(100); this.lastTuGio = now;
        }
        if (upg['inv_khien'] && now - this.lastKhien > 20000) {
            if (this.owner.shield === 0) {
                this.owner.shield++;
                soundSystem.playPowerup();
                addFloatingText(this.owner.x + this.owner.w / 2, this.owner.y - 15, "+1 SHIELD", "#00ffff", 13);
            }
            this.lastKhien = now;
        }
    }

    fireAoEBullet(type, upg) {
        let enemy = (this.owner.id === 1) ? p2 : p1;
        let baseDirY = (this.owner.id === 1) ? -1 : 1;
        let vy = baseDirY * 4.5;
        let vx = 0;
        if (upg['inv_ngam'] && enemy) {
            let dx = (enemy.x + enemy.w / 2) - (this.x + this.w / 2);
            vx = Math.max(-1.5, Math.min(1.5, dx * 0.012));
        }
        this.owner.bullets.push({
            x: this.x + this.w / 2 - 5,
            y: this.y + this.h / 2 - 5,
            w: 10, h: 10,
            vx: vx, vy: vy,
            dmg: 1,
            owner: this.owner,
            specialType: type,
            isInventorBullet: true,
            hitIds: [],
            bounceCount: 0,
            active: true
        });
        soundSystem.playShoot('cannon');
    }

    fireConeSMG() {
        let baseVy = (this.owner.id === 1) ? -6 : 6;
        for (let i = 0; i < 12; i++) {
            let spreadVx = (i - 5.5) * 0.6;
            this.owner.bullets.push({
                x: this.x + this.w / 2 - 2,
                y: this.y + this.h / 2 - 2,
                w: 4, h: 4,
                vx: spreadVx, vy: baseVy,
                dmg: 0.3,
                owner: this.owner,
                isInventorBullet: true,
                hitIds: [],
                bounceCount: 0,
                active: true
            });
        }
        soundSystem.playShoot('normal');
    }

    clearEnemyBulletsInRadius(radius) {
        let enemy = (this.owner.id === 1) ? p2 : p1;
        if (!enemy || !enemy.bullets) return;
        let cleared = false;
        enemy.bullets.forEach(b => {
            if (b.active && Math.hypot(b.x - (this.x + this.w / 2), b.y - (this.y + this.h / 2)) < radius) {
                b.active = false;
                cleared = true;
                explosions.push(new Explosion(b.x, b.y, 14, 'white', 0, this.owner));
            }
        });
        if (cleared) soundSystem.playShieldBreak();
    }

    draw() {
        if (!this.active) return;
        ctx.save();

        // Thân Drone công nghệ
        ctx.fillStyle = this.owner.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = "#00ffcc";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        // Nòng súng Drone
        ctx.fillStyle = "#111";
        ctx.fillRect(this.x + 6, this.y + (this.owner.id === 1 ? -6 : this.h), 14, 6);

        // Động cơ bay
        ctx.fillStyle = "#00f0ff";
        ctx.fillRect(this.x + 2, this.y + (this.owner.id === 1 ? this.h : -3), 4, 3);
        ctx.fillRect(this.x + this.w - 6, this.y + (this.owner.id === 1 ? this.h : -3), 4, 3);

        // Khiên Drone nếu có inv_khien_drone
        if ((this.owner.invUpgrades && this.owner.invUpgrades['inv_khien_drone']) > 0) {
            ctx.strokeStyle = "rgba(0, 255, 200, 0.7)";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - 3, this.y - 3, this.w + 6, this.h + 6);
        }

        // Thanh máu Drone
        let maxHp = this.getMaxHp();
        let hpPercent = Math.max(0, this.hp / maxHp);
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(this.x - 2, this.y - 7, this.w + 4, 4);
        ctx.fillStyle = "#00ffcc";
        ctx.fillRect(this.x - 2, this.y - 7, (this.w + 4) * hpPercent, 4);

        ctx.restore();
    }

    takeDamage(dmg) {
        if (!this.active) return;
        this.hp -= dmg;
        if (this.hp <= 0) {
            this.active = false;
            this.deadTimer = Date.now();
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 45, 'gray', 0, this.owner));
            soundSystem.playExplosion();
        }
    }
}

// ==========================================
// --- CLASS LỒNG CẤM CHẾ (DEATH LOCK) ---
// ==========================================
class ConfinementCage {
    constructor(x, y, owner) {
        this.owner = owner;
        this.x = Math.max(20, Math.min(canvas.width - 20, x));
        this.y = Math.max(15, Math.min(canvas.height - 15, y));
        
        let hasEvo2 = owner.hasUpgrade && owner.hasUpgrade('evo_dl_2');
        let isFullEvo = owner.hasUpgrade && owner.hasUpgrade('evo_dl_1') && owner.hasUpgrade('evo_dl_2');
        
        this.w = isFullEvo ? 100 : (hasEvo2 ? 140 : 200);
        this.h = 50;
        this.delayTicks = 18; // 0.3s khựng lại trước khi nổ
        this.durationTicks = 180; // 3s duy trì lồng xích
        this.state = 'delay';
        this.pullForce = isFullEvo ? 4.5 : (hasEvo2 ? 3.5 : 2.5);
        this.pullRange = isFullEvo ? 180 : (hasEvo2 ? 150 : 110);
        this.active = true;
    }

    update() {
        if (!this.active) return;
        const enemy = (this.owner.id === 1) ? p2 : p1;

        if (this.state === 'delay') {
            this.delayTicks--;
            if (this.delayTicks <= 0) {
                this.state = 'active';
                // Phát nổ tách ra 2 quả cầu xích (trái và phải)
                let leftX = Math.max(0, this.x - this.w / 2);
                let rightX = Math.min(canvas.width, this.x + this.w / 2);
                explosions.push(new Explosion(this.x, this.y, 40, 'rgba(140, 20, 220,', 0.125, this.owner));
                explosions.push(new Explosion(leftX, this.y, 25, 'rgba(180, 50, 255,', 0.05, this.owner));
                explosions.push(new Explosion(rightX, this.y, 25, 'rgba(180, 50, 255,', 0.05, this.owner));
                
                // Gây sát thương 25% dame cơ bản (0.125 dmg)
                if (enemy && enemy.hp > 0) {
                    enemy.takeDamage(0.125, this.owner);
                }
                if (typeof addFloatingText === 'function') {
                    addFloatingText(this.x, this.y - 15, "LỒNG CẤM CHẾ! ⛓️", "#ba68c8", 14);
                }
                if (soundSystem && !soundSystem.muted) soundSystem.playShieldBreak();
            }
            return;
        }

        // State === 'active'
        this.durationTicks--;
        if (this.durationTicks <= 0) {
            this.active = false;
            this.owner.lastConfinementCageEndTime = Date.now();
            return;
        }

        if (enemy && enemy.hp > 0) {
            let enemyMidX = enemy.x + enemy.w / 2;
            let dx = this.x - enemyMidX;
            let left = Math.max(0, this.x - this.w / 2);
            let right = Math.min(canvas.width, this.x + this.w / 2);

            // 1. Hút mạnh vào tâm lồng theo trục ngang (không khóa trục dọc)
            if (Math.abs(dx) <= this.pullRange) {
                let dirX = (dx >= 0 ? 1 : -1);
                enemy.x = Math.max(0, Math.min(canvas.width - enemy.w, enemy.x + dirX * Math.min(Math.abs(dx), this.pullForce)));
            }

            // 2. Xích chặt không thể vượt ra khỏi ranh giới lồng trong 3s
            if (enemy.x < left) enemy.x = left;
            if (enemy.x + enemy.w > right) enemy.x = right - enemy.w;
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        let left = Math.max(0, this.x - this.w / 2);
        let top = Math.max(0, this.y - this.h / 2);

        if (this.state === 'delay') {
            // Hiệu ứng viên đạn dừng lại, khựng 0.3s tích tụ năng lượng xích
            ctx.fillStyle = "rgba(186, 104, 200, 0.75)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#e040fb";
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.restore();
            return;
        }

        // Vẽ Lồng Xích Cấm Chế
        ctx.fillStyle = "rgba(106, 27, 154, 0.18)";
        ctx.fillRect(left, top, this.w, this.h);

        ctx.strokeStyle = "#ba68c8";
        ctx.lineWidth = 2;
        ctx.strokeRect(left, top, this.w, this.h);

        // Vẽ các mắt xích đan chéo
        ctx.strokeStyle = "rgba(224, 64, 251, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(left, top); ctx.lineTo(left + this.w, top + this.h);
        ctx.moveTo(left + this.w, top); ctx.lineTo(left, top + this.h);
        ctx.stroke();
        ctx.setLineDash([]);

        // Biểu tượng ổ khóa xích ở tâm
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⛓️", this.x, this.y);

        ctx.restore();
    }
}

// ==========================================
// --- CLASS Ụ SÚNG KẺ SÁNG TẠO (CREATOR) ---
// ==========================================
class CreatorTurret {
    constructor(owner, x, y) {
        this.owner = owner;
        this.x = x;
        this.y = y;
        this.w = 20;
        this.h = 20;
        
        let hasEvo1 = owner.hasUpgrade && owner.hasUpgrade('evo_cr_1');
        let isFullEvo = hasEvo1 && owner.hasUpgrade('evo_cr_2');
        let ratio = isFullEvo ? 2.0 : (hasEvo1 ? 1.0 : 0.5);
        
        this.hp = Math.max(1, owner.maxHp * ratio);
        this.maxHp = this.hp;
        this.dmg = owner.damage * ratio;
        this.active = true;
        this.lastShot = Date.now();
        this.reloadTime = 1200;
        this.angle = (owner.id === 1) ? -Math.PI / 2 : Math.PI / 2;
    }

    update() {
        if (!this.active) return;
        const enemy = (this.owner.id === 1) ? p2 : p1;
        
        // Tìm mục tiêu gần nhất
        let targets = [];
        if (enemy && enemy.hp > 0) targets.push(enemy);
        crates.forEach(c => { if (c.active) targets.push(c); });
        moneyTrucks.forEach(t => { if (t.active) targets.push(t); });

        let best = null;
        let bestDist = Infinity;
        let centerX = this.x + this.w / 2;
        let centerY = this.y + this.h / 2;

        targets.forEach(t => {
            let tx = t.x + (t.w ? t.w / 2 : 0);
            let ty = t.y + (t.h ? t.h / 2 : 0);
            let d = Math.hypot(tx - centerX, ty - centerY);
            if (d < bestDist) {
                bestDist = d;
                best = { x: tx, y: ty };
            }
        });

        if (best) {
            this.angle = Math.atan2(best.y - centerY, best.x - centerX);
        }

        if (Date.now() - this.lastShot >= this.reloadTime) {
            this.lastShot = Date.now();
            let bSpeed = 7.5;
            let vx = Math.cos(this.angle) * bSpeed;
            let vy = Math.sin(this.angle) * bSpeed;
            this.owner.bullets.push({
                x: centerX - 3,
                y: centerY - 3,
                w: 6, h: 6,
                vx: vx, vy: vy,
                dmg: this.dmg,
                owner: this.owner,
                isCreatorTurretBullet: true,
                color: (this.owner.id === 1) ? "#00e5ff" : "#ff1744",
                hitIds: []
            });
            if (soundSystem && !soundSystem.muted) soundSystem.playShoot();
        }
    }

    takeDamage(dmg) {
        if (!this.active) return;
        this.hp -= dmg;
        if (this.hp <= 0) {
            this.active = false;
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 30, 'gray', 0, this.owner));
            if (soundSystem && !soundSystem.muted) soundSystem.playExplosion();
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        let cx = this.x + this.w / 2;
        let cy = this.y + this.h / 2;

        // Đế trụ
        ctx.fillStyle = (this.owner.id === 1) ? "#004d40" : "#4a148c";
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = (this.owner.id === 1) ? "#00e5ff" : "#ea80fc";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Nòng xoay tự ngắm
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.angle);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, -2, 13, 4);
        ctx.restore();

        // Mini HP Bar
        let hpRatio = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(this.x - 2, this.y - 6, this.w + 4, 3);
        ctx.fillStyle = (this.owner.id === 1) ? "#00e5ff" : "#ff1744";
        ctx.fillRect(this.x - 2, this.y - 6, (this.w + 4) * hpRatio, 3);

        ctx.restore();
    }
}

// ==========================================
// --- CLASS KHIÊN THÉP (CREATOR SHIELD) ---
// ==========================================
class CreatorShield {
    constructor(owner) {
        this.owner = owner;
        let hasEvo1 = owner.hasUpgrade && owner.hasUpgrade('evo_cr_1');
        let isFullEvo = hasEvo1 && owner.hasUpgrade('evo_cr_2');
        let ratio = isFullEvo ? 4.0 : (hasEvo1 ? 2.0 : 1.0);
        
        this.maxHp = 5 * ratio; // 5 HP gốc, 10 HP Evo 1, 20 HP Full Evo
        this.hp = this.maxHp;
        this.durationTicks = 16 * 60; // 16s
        this.active = true;
        this.w = owner.w + 24;
        this.h = 8;
    }

    update() {
        if (!this.active) return;
        this.durationTicks--;
        if (this.durationTicks <= 0 || this.hp <= 0) {
            this.active = false;
            this.owner.creatorShieldCooldown = 8 * 60; // Cooldown 8s sau khi vỡ/hết giờ
            if (this.hp <= 0) {
                explosions.push(new Explosion(this.owner.x + this.owner.w / 2, this.y, 40, '#00e5ff', 0, this.owner));
                if (soundSystem && !soundSystem.muted) soundSystem.playShieldBreak();
            }
            return;
        }

        // Đi theo xe chủ
        this.x = this.owner.x + this.owner.w / 2 - this.w / 2;
        this.y = (this.owner.id === 1) ? this.owner.y - 12 : this.owner.y + this.owner.h + 4;

        // Chặn đạn đối phương bay vào khiên
        const enemy = (this.owner.id === 1) ? p2 : p1;
        if (enemy && enemy.bullets && enemy.bullets.length > 0) {
            for (let i = enemy.bullets.length - 1; i >= 0; i--) {
                let b = enemy.bullets[i];
                if (!b || !b.active) continue;
                let bw = b.w || 6;
                let bh = b.h || 6;
                if (rectIntersect(b.x, b.y, bw, bh, this.x, this.y, this.w, this.h)) {
                    let dmgDealt = b.dmg || 1;
                    this.hp -= dmgDealt;
                    enemy.bullets.splice(i, 1);
                    spawnSparkParticles(b.x, b.y, '#00e5ff', 8);
                    if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 10, "KHIÊN CHẶN ĐẠN! 🛡️", "#00e5ff", 12);
                    if (this.hp <= 0) break;
                }
            }
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = "rgba(0, 229, 255, 0.25)";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        // Thanh máu khiên
        let hpRatio = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(this.x, this.y - 4, this.w * hpRatio, 2);
        ctx.restore();
    }
}

// ==========================================
// --- CLASS DRONE KHÔNG KÍCH (CREATOR DRONE) ---
// ==========================================
class CreatorDrone {
    constructor(owner) {
        this.owner = owner;
        this.w = 26;
        this.h = 20;
        this.x = canvas.width / 2 - 13;
        this.y = (owner.id === 1) ? canvas.height * 0.44 : canvas.height * 0.56;
        this.vx = 2.8;
        this.active = true;
        this.deadTimer = 0;
        this.lastShot = Date.now();
        this.reloadTime = 1200;
        this.hp = this.getMaxHp();
    }

    getMaxHp() {
        let isFullEvo = this.owner.hasUpgrade && this.owner.hasUpgrade('evo_cr_1') && this.owner.hasUpgrade('evo_cr_2');
        return Math.max(1, this.owner.maxHp * (isFullEvo ? 2.0 : 1.0));
    }

    getDamage() {
        let isFullEvo = this.owner.hasUpgrade && this.owner.hasUpgrade('evo_cr_1') && this.owner.hasUpgrade('evo_cr_2');
        return this.owner.damage * (isFullEvo ? 2.0 : 1.0);
    }

    update() {
        if (!this.active) {
            // Hồi sinh sau 15s (15000ms)
            if (Date.now() - this.deadTimer >= 15000) {
                this.active = true;
                this.hp = this.getMaxHp();
                this.x = canvas.width / 2 - 13;
                explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 35, '#00e5ff', 0, this.owner));
                if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 12, "DRONE TÁI SINH! 🤖", "#00e5ff", 14);
            }
            return;
        }

        // Tuần tra bay qua bay lại
        this.x += this.vx;
        if (this.x <= 15) { this.x = 15; this.vx = Math.abs(this.vx); }
        if (this.x + this.w >= canvas.width - 15) { this.x = canvas.width - 15 - this.w; this.vx = -Math.abs(this.vx); }

        // Bắn Pháo Đôi (2 viên đạn/loạt)
        if (Date.now() - this.lastShot >= this.reloadTime) {
            this.lastShot = Date.now();
            const enemy = (this.owner.id === 1) ? p2 : p1;
            let dirY = (this.owner.id === 1) ? -1 : 1;
            let bSpeed = 6.5;
            let vx = 0;
            let vy = dirY * bSpeed;

            if (enemy) {
                let dx = (enemy.x + enemy.w / 2) - (this.x + this.w / 2);
                let dy = (enemy.y + enemy.h / 2) - (this.y + this.h / 2);
                let angle = Math.atan2(dy, dx);
                let desiredVx = Math.cos(angle) * bSpeed;
                vx = Math.max(-2, Math.min(2, desiredVx));
                vy = dirY * Math.sqrt(Math.max(16, bSpeed * bSpeed - vx * vx));
            }

            let dmg = this.getDamage();
            // Pháo đôi: xả 2 viên đạn song song
            [-6, 6].forEach(offset => {
                this.owner.bullets.push({
                    x: this.x + this.w / 2 + offset - 3,
                    y: this.y + (dirY === -1 ? -5 : this.h + 2),
                    w: 6, h: 6,
                    vx: vx, vy: vy,
                    dmg: dmg,
                    owner: this.owner,
                    isCreatorDroneBullet: true,
                    color: (this.owner.id === 1) ? "#00f0ff" : "#ff0055",
                    hitIds: []
                });
            });
            if (soundSystem && !soundSystem.muted) soundSystem.playShoot();
        }
    }

    takeDamage(dmg) {
        if (!this.active) return;
        this.hp -= dmg;
        if (this.hp <= 0) {
            this.active = false;
            this.deadTimer = Date.now();
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 40, 'gray', 0, this.owner));
            if (soundSystem && !soundSystem.muted) soundSystem.playExplosion();
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = (this.owner.id === 1) ? "#00838f" : "#ad1457";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = (this.owner.id === 1) ? "#00e5ff" : "#ff4081";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        // 2 Nòng pháo đôi
        ctx.fillStyle = "#ffffff";
        let barrelY = (this.owner.id === 1) ? this.y - 5 : this.y + this.h;
        ctx.fillRect(this.x + 4, barrelY, 3, 5);
        ctx.fillRect(this.x + this.w - 7, barrelY, 3, 5);

        // Mini HP Bar
        let maxHp = this.getMaxHp();
        let hpRatio = Math.max(0, this.hp / maxHp);
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(this.x - 2, this.y - 6, this.w + 4, 3);
        ctx.fillStyle = "#00e5ff";
        ctx.fillRect(this.x - 2, this.y - 6, (this.w + 4) * hpRatio, 3);
        ctx.restore();
    }
}

// ==========================================
// --- CLASS ROBOT CHIẾN ĐẤU (CREATOR ROBOT) ---
// ==========================================
class CreatorRobot {
    constructor(owner) {
        this.owner = owner;
        this.w = 36;
        this.h = 36;
        this.x = owner.x + owner.w / 2 - 18;
        this.y = (owner.id === 1) ? canvas.height * 0.6 : canvas.height * 0.4;
        this.maxHp = 10;
        this.hp = 10;
        this.dmg = 0.5;
        this.speed = 1.2;
        this.energy = 100;
        this.maxEnergy = 100;
        this.active = true;
        this.deadTimer = 0;
        
        // Cooldowns (ticks)
        this.cdSMG = 0;
        this.cdRocket = 0;
        this.cdDash = 0;
        this.cdAAA = 0;
        this.cdLaser = 0;
        
        this.isDashing = false;
        this.dashTimer = 0;
        this.dashDirY = (owner.id === 1) ? -1 : 1;
        
        // AAA Artillery Reticle
        this.aaaReticle = null;
        this.aaaTimer = 0;
        
        // Laser Telegraph
        this.laserTelegraph = 0;
    }

    update() {
        if (!this.active) {
            // Hồi sinh sau 30s (1800 ticks)
            this.deadTimer++;
            if (this.deadTimer >= 1800) {
                this.active = true;
                this.deadTimer = 0;
                this.hp = this.maxHp;
                this.energy = this.maxEnergy;
                this.x = this.owner.x;
                this.y = (this.owner.id === 1) ? canvas.height * 0.6 : canvas.height * 0.4;
                explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 50, '#ff9800', 0, this.owner));
                if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 15, "ROBOT TỰ ĐỘNG XUẤT XƯỞNG! 🤖⚙️", "#ff9800", 14);
            }
            return;
        }

        const enemy = (this.owner.id === 1) ? p2 : p1;
        let isFullEvo = this.owner.hasUpgrade && this.owner.hasUpgrade('evo_cr_1') && this.owner.hasUpgrade('evo_cr_2');

        // Hồi năng lượng tự nhiên
        if (this.energy < this.maxEnergy) this.energy = Math.min(this.maxEnergy, this.energy + 0.1);

        // Trừ cooldowns
        if (this.cdSMG > 0) this.cdSMG--;
        if (this.cdRocket > 0) this.cdRocket--;
        if (this.cdDash > 0) this.cdDash--;
        if (this.cdAAA > 0) this.cdAAA--;
        if (this.cdLaser > 0) this.cdLaser--;

        // 1. Logic Cú Đấm Thép (Tank Dash)
        if (this.isDashing) {
            this.dashTimer--;
            this.y += this.dashDirY * 9;
            if (enemy && enemy.hp > 0 && rectIntersect(this.x, this.y, this.w, this.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
                enemy.takeDamage(2.0, this.owner);
                enemy.x += (this.x < enemy.x ? 1 : -1) * 35;
                explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 45, '#ff5722', 0, this.owner));
                triggerScreenShake(4, 6);
                this.isDashing = false;
            }
            if (this.dashTimer <= 0) {
                this.isDashing = false;
            }
            this.y = Math.max(30, Math.min(canvas.height - this.h - 30, this.y));
            return;
        }

        // 2. AI Di chuyển gây áp lực
        if (enemy && enemy.hp > 0) {
            let targetX = enemy.x + enemy.w / 2 - this.w / 2;
            if (this.x < targetX - 5) this.x += this.speed;
            else if (this.x > targetX + 5) this.x -= this.speed;
            this.x = Math.max(5, Math.min(canvas.width - this.w - 5, this.x));
        }

        // 3. Kỹ năng 1: Sấy Tiểu Liên (SMG) - CD: 6s (360 ticks)
        if (this.cdSMG <= 0 && enemy && enemy.hp > 0) {
            this.cdSMG = 360;
            let dirY = (this.owner.id === 1) ? -1 : 1;
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    if (!this.active) return;
                    let spreadVx = (Math.random() - 0.5) * 2.2;
                    this.owner.bullets.push({
                        x: this.x + this.w / 2 - 2,
                        y: this.y + (dirY === -1 ? -4 : this.h + 2),
                        w: 5, h: 5,
                        vx: spreadVx,
                        vy: dirY * 9,
                        dmg: 0.25,
                        owner: this.owner,
                        color: "#ffb74d",
                        hitIds: []
                    });
                }, i * 70);
            }
            if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 12, "SẤY SMG! 💥", "#ffb74d", 12);
        }

        // 4. Kỹ năng 2: Pháo Bộc Phá (Rocket) - CD: 8s (480 ticks)
        if (this.cdRocket <= 0 && enemy && enemy.hp > 0) {
            this.cdRocket = 480;
            let dirY = (this.owner.id === 1) ? -1 : 1;
            this.owner.bullets.push({
                x: this.x + this.w / 2 - 5,
                y: this.y + (dirY === -1 ? -8 : this.h + 2),
                w: 10, h: 14,
                vx: (enemy.x + enemy.w / 2 - (this.x + this.w / 2)) * 0.02,
                vy: dirY * 5.5,
                dmg: 1.5,
                isRocket: true,
                owner: this.owner,
                color: "#f4511e",
                hitIds: []
            });
            if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 12, "BỘC PHÁ TÊN LỬA! 🚀", "#f4511e", 13);
        }

        // 5. Kỹ năng 3: Cú Đấm Thép (Tank Dash) - CD: 12s (720 ticks)
        if (this.cdDash <= 0 && enemy && enemy.hp > 0 && Math.abs(this.x - enemy.x) < 50) {
            this.cdDash = 720;
            this.isDashing = true;
            this.dashTimer = 22;
            this.dashDirY = (this.owner.id === 1) ? -1 : 1;
            if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 14, "CÚ ĐẤM THÉP! 🥊💨", "#ff5722", 14);
            if (soundSystem && !soundSystem.muted) soundSystem.playDash();
        }

        // --- FULL EVO VŨ TRANG HẠNG NẶNG ---
        if (isFullEvo) {
            // 6. Pháo Cao Xạ (AAA) - CD: 10s (600 ticks)
            if (this.cdAAA <= 0 && enemy && enemy.hp > 0) {
                this.cdAAA = 600;
                this.aaaReticle = { x: enemy.x + enemy.w / 2, y: enemy.y + enemy.h / 2 };
                this.aaaTimer = 70; // 1.1s cảnh báo hồng tâm
                if (typeof addFloatingText === 'function') addFloatingText(this.aaaReticle.x, this.aaaReticle.y - 20, "PHÁO CAO XẠ! 🎯", "#ff1744", 14);
            }

            if (this.aaaReticle && this.aaaTimer > 0) {
                this.aaaTimer--;
                if (this.aaaTimer <= 0) {
                    for (let step = 0; step < 3; step++) {
                        setTimeout(() => {
                            if (!this.aaaReticle) return;
                            let ox = (Math.random() - 0.5) * 40;
                            let oy = (Math.random() - 0.5) * 30;
                            let hitX = this.aaaReticle.x + ox;
                            let hitY = this.aaaReticle.y + oy;
                            explosions.push(new Explosion(hitX, hitY, 60, '#ff1744', 1.2, this.owner));
                            if (enemy && enemy.hp > 0 && Math.hypot(enemy.x + enemy.w / 2 - hitX, enemy.y + enemy.h / 2 - hitY) <= 60) {
                                enemy.takeDamage(1.2, this.owner);
                            }
                            triggerScreenShake(4, 6);
                        }, step * 250);
                    }
                    this.aaaReticle = null;
                }
            }

            // 7. Laser Thủy Lực - CD: 14s (840 ticks)
            if (this.cdLaser <= 0 && enemy && enemy.hp > 0) {
                this.cdLaser = 840;
                this.laserTelegraph = 30; // 0.5s tia cảnh báo
            }

            if (this.laserTelegraph > 0) {
                this.laserTelegraph--;
                if (this.laserTelegraph <= 0) {
                    let beamX = this.x + this.w / 2;
                    let beamY = 0;
                    let beamH = canvas.height;
                    beams.push(new Beam(beamX - 10, beamY, 20, beamH, this.owner.id, true));
                    if (enemy && enemy.hp > 0 && Math.abs(enemy.x + enemy.w / 2 - beamX) <= 24) {
                        enemy.takeDamage(3.0, this.owner);
                    }
                    crates.forEach(c => {
                        if (c.active && Math.abs(c.x + c.w / 2 - beamX) <= 24) {
                            c.active = false;
                            this.owner.onCollectAmmoCrate(c);
                        }
                    });
                    triggerScreenShake(6, 10);
                    if (soundSystem && !soundSystem.muted) soundSystem.playLaser();
                    if (typeof addFloatingText === 'function') addFloatingText(beamX, this.y - 15, "LASER THỦY LỰC! ⚡🔥", "#ff0055", 16);
                }
            }
        }
    }

    takeDamage(dmg) {
        if (!this.active) return;
        this.hp -= dmg;
        if (this.hp <= 0) {
            this.active = false;
            this.deadTimer = 0;
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 55, '#ff5722', 0, this.owner));
            if (soundSystem && !soundSystem.muted) soundSystem.playExplosion();
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        let cx = this.x + this.w / 2;
        let cy = this.y + this.h / 2;

        ctx.fillStyle = (this.owner.id === 1) ? "#263238" : "#3e2723";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = (this.owner.id === 1) ? "#00e5ff" : "#ff9800";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        // Kính ngắm Visor
        ctx.fillStyle = (this.owner.id === 1) ? "#00f0ff" : "#ff1744";
        ctx.fillRect(this.x + 6, this.y + 10, this.w - 12, 5);

        // Nòng pháo
        let dirY = (this.owner.id === 1) ? -1 : 1;
        ctx.fillStyle = "#90a4ae";
        ctx.fillRect(cx - 3, (dirY === -1 ? this.y - 8 : this.y + this.h), 6, 8);

        // Thanh máu và năng lượng
        let hpRatio = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(this.x - 2, this.y - 10, this.w + 4, 3);
        ctx.fillStyle = "#4caf50";
        ctx.fillRect(this.x - 2, this.y - 10, (this.w + 4) * hpRatio, 3);

        let nrgRatio = Math.max(0, this.energy / this.maxEnergy);
        ctx.fillStyle = "#ffb300";
        ctx.fillRect(this.x - 2, this.y - 6, (this.w + 4) * nrgRatio, 2);

        // Hồng tâm Pháo Cao Xạ
        if (this.aaaReticle && this.aaaTimer > 0) {
            ctx.strokeStyle = "#ff1744";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(this.aaaReticle.x, this.aaaReticle.y, 40, 0, Math.PI * 2);
            ctx.moveTo(this.aaaReticle.x - 45, this.aaaReticle.y); ctx.lineTo(this.aaaReticle.x + 45, this.aaaReticle.y);
            ctx.moveTo(this.aaaReticle.x, this.aaaReticle.y - 45); ctx.lineTo(this.aaaReticle.x, this.aaaReticle.y + 45);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Tia đỏ cảnh báo Laser Thủy Lực
        if (this.laserTelegraph > 0) {
            ctx.strokeStyle = "rgba(255, 0, 0, 0.75)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, 0); ctx.lineTo(cx, canvas.height);
            ctx.stroke();
        }

        ctx.restore();
    }
}

// Class Kiếm Bay Tự Do (Dành cho Vạn Kiếm, Phá Thiên, và delay Anh Minh)
class FloatingSword {
    constructor(x, y, w, h, vx, vy, delay, dmg, isPiercing, isHoming, owner, isGreatSword = false, color = null, isAnhMinhMarker = false) {
        this.x = x; this.y = y; this.w = w; this.h = h;
        this.vx = vx; this.vy = vy;
        this.delay = delay; // Thời gian chờ trước khi phóng
        this.dmg = dmg;
        this.isPiercing = isPiercing;
        this.isHoming = isHoming;
        this.owner = owner;
        this.isGreatSword = isGreatSword;
        this.color = color || ((this.owner.id === 1) ? '#3498db' : '#e74c3c'); // Hỗ trợ custom màu
        this.isAnhMinhMarker = isAnhMinhMarker; // Cờ cho skill Anh Minh
        this.active = true;
    }
    update() {
        if (!this.active) return;
        if (this.delay > 0) {
            this.delay--;
            if (this.isAnhMinhMarker) {
                // Nếu là kiếm Anh Minh, khóa vị trí lơ lửng trên đầu nhân vật
                this.x = this.owner.x + this.owner.w / 2 - this.w / 2;
                this.y = this.owner.y + (this.owner.id === 1 ? -45 : this.owner.h + 15);
            } else {
                // Kiếm thường: rung nhẹ khi chờ
                this.x += (Math.random() - 0.5) * 1.5;
            }
        } else {
            if (this.isAnhMinhMarker) {
                // Hết delay 1s -> Bắn tia Hitscan từ vị trí thanh kiếm vàng
                this.owner.fireAnhMinhHitscan(this.dmg, this.isPiercing, this.color, this.x + this.w / 2, this.y);
                this.active = false;
            } else {
                // Các loại kiếm khác: Hết delay -> Chuyển thành Đạn (Bullet) bay đi
                this.owner.bullets.push({
                    x: this.x, y: this.y, w: this.w, h: this.h,
                    vx: this.vx, vy: this.vy, dmg: this.dmg, owner: this.owner,
                    isPiercing: this.isPiercing, isHoming: this.isHoming, hitIds: [], bounceCount: 0,
                    isFloatingSwordGraphic: true, isGreatSword: this.isGreatSword,
                    color: this.color // Lưu lại màu cho lúc vẽ
                });
                this.active = false;
            }
        }
    }
    draw() {
        if (!this.active) return;
        let dirY = (this.owner.id === 1) ? -1 : 1;
        if (this.isAnhMinhMarker) dirY = (this.owner.id === 1) ? -1 : 1; // Mũi kiếm chỉ về địch
        drawGlowingSword(this.x, this.y, this.w, this.h, this.color, dirY);
    }
}
let arrowRains = [];
let arrowDrops = [];

class ArrowRain {
    constructor(owner, targetX, targetY, radius, isGlobal = false) {
        this.owner = owner;
        this.x = targetX;
        this.y = targetY;
        this.radius = radius;
        this.isGlobal = isGlobal;
        this.duration = 5000; // Mưa rơi trong 5 giây
        this.spawnTime = Date.now();
        this.active = true;
        this.arrowsFired = 0;

        let isFullEvo = owner.hasUpgrade('evo_cung_1') && owner.hasUpgrade('evo_cung_2');
        let dmg = owner.damage + owner.dmgBuff;

        // --- CÔNG THỨC SỐ LƯỢNG MŨI TÊN MỚI ---
        if (this.isGlobal) {
            // Mưa full màn hình: (Sát Thương * 50) + 200
            this.totalArrows = Math.floor(dmg * 50) + 200;
        } else if (isFullEvo) {
            // Full Evo: (Sát Thương * 20) + 100, giới hạn 800
            this.totalArrows = Math.min(Math.floor(dmg * 20) + 100, 800);
        } else {
            // Căn bản: (Sát Thương * 10) + 50, giới hạn 500
            this.totalArrows = Math.min(Math.floor(dmg * 10) + 50, 500);
        }

        // Chia đều thời gian rơi (mật độ)
        this.fireInterval = this.duration / this.totalArrows;
        this.lastFireTime = Date.now();
    }

    update() {
        if (!this.active) return;
        let now = Date.now();

        if (now - this.spawnTime > this.duration || this.arrowsFired >= this.totalArrows) {
            this.active = false;
            return;
        }

        if (now - this.lastFireTime >= this.fireInterval) {
            this.lastFireTime = now;
            this.arrowsFired++;

            // Lấy tọa độ ngẫu nhiên
            let dropX = this.isGlobal ? Math.random() * canvas.width : this.x + (Math.random() * 2 - 1) * this.radius;
            let dropY = this.isGlobal ? Math.random() * canvas.height : this.y + (Math.random() * 2 - 1) * this.radius;

            // Ép tọa độ không lọt ra ngoài mép bản đồ
            dropX = Math.max(15, Math.min(canvas.width - 15, dropX));
            dropY = Math.max(15, Math.min(canvas.height - 15, dropY));

            // THAY ĐỔI: Gọi chấm đen rơi xuống
            arrowDrops.push(new ArrowDropMarker(dropX, dropY, this.owner, this.owner.damage));
        }
    }

    draw() {
        if (!this.active || this.isGlobal) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 69, 0, 0.1)';
        ctx.fill();
        ctx.strokeStyle = 'red';
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.restore();
    }
}
class ArrowDropMarker {
    constructor(x, y, owner, dmg) {
        this.x = x;
        this.y = y;
        this.owner = owner;
        this.dmg = dmg;
        this.spawnTime = Date.now();

        this.delay = 600; // Thời gian từ lúc hiện chấm đen đến lúc nổ (0.6 giây)
        this.startRadius = 15; // Kích thước chấm đen ban đầu
        this.endRadius = 3;    // Kích thước khi thu nhỏ tối đa
        this.active = true;
    }

    update() {
        if (!this.active) return;
        let age = Date.now() - this.spawnTime;
        if (age >= this.delay) {
            this.explode();
        }
    }

    explode() {
        this.active = false;
        // Tạo vụ nổ nhỏ (phạm vi 30) tại vị trí chấm đen, sát thương x1.5
        explosions.push(new Explosion(this.x, this.y, 30, 'rgba(255, 0, 0,', this.dmg * 1.5, this.owner));
    }

    draw() {
        if (!this.active) return;
        let age = Date.now() - this.spawnTime;
        let progress = Math.min(age / this.delay, 1);

        // Chấm tròn thu nhỏ dần
        let currentRadius = this.startRadius - (this.startRadius - this.endRadius) * progress;

        // Tính toán màu sắc: Từ Đen (0,0,0) chuyển dần sang Đỏ (255,0,0)
        let r = Math.floor(255 * progress);
        let color = `rgb(${r}, 0, 0)`;

        ctx.save();

        // Vẽ vòng viền mờ cảnh báo bên ngoài (tùy chọn)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.startRadius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 0, 0, 0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Vẽ chấm đen/đỏ ở giữa
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Hiệu ứng phát sáng khi sắp nổ
        if (progress > 0.7) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = "red";
            ctx.fill();
        }

        ctx.restore();
    }
}
class MortarMarker {
    constructor(x, y, owner, isAuto = false) {
        this.x = x; this.y = y;
        this.owner = owner;
        this.r = 10;

        // --- NERF: PHẠM VI NỔ ---
        // Giảm từ 80 xuống 65 (giảm nhẹ khoảng 20%)
        this.maxR = 65;

        this.spawnTime = Date.now();
        let hasEvo1 = this.owner.hasUpgrade('evo_aaa_1');
        let hasEvo2 = this.owner.hasUpgrade('evo_aaa_2');
        let isFullEvo = hasEvo1 && hasEvo2;
        this.detonateTime = isAuto ? 5000 : (isFullEvo ? 500 : 1500);
        this.active = true;
        this.isAuto = isAuto;
        this.echoCount = 0;

        if (hasEvo1 && !isAuto) {
            this.tracking = true;
        }
    }

    update() {
        if (!this.active) return;

        // --- BUFF: TỐC ĐỘ ĐUỔI (TRACKING) ---
        if (this.tracking) {
            const enemy = (this.owner.id === 1) ? p2 : p1;
            let dx = (enemy.x + enemy.w / 2) - this.x;
            let dy = (enemy.y + enemy.h / 2) - this.y;

            // Tăng hệ số từ 0.02 lên 0.06 (Nhanh gấp 3 lần)
            // Số càng lớn đuổi càng rát.
            this.x += dx * 0.06;
            this.y += dy * 0.06;
        }

        const age = Date.now() - this.spawnTime;
        if (age >= this.detonateTime) {
            this.explode();
        }
    }

    explode() {
        // Dame to (x2 dame gốc)
        let damage = (this.owner.damage + this.owner.dmgBuff) * 2;

        // Kích hoạt nổ với tham số hasFalloff = true (giảm dame theo rìa)
        explosions.push(new Explosion(this.x, this.y, this.maxR, 'rgba(255, 69, 0,', damage, this.owner, true));

        // Logic Nổ Bồi (Echo) cho Evo 2
        let hasEvo2 = this.owner.hasUpgrade('evo_aaa_2');
        let isFullEvo = hasEvo2 && this.owner.hasUpgrade('evo_aaa_1');

        if (this.echoCount === 0) {
            if (hasEvo2) {
                setTimeout(() => {
                    // Nổ bồi nhỏ hơn chút (0.8 maxR)
                    explosions.push(new Explosion(this.x, this.y, this.maxR * 0.8, 'rgba(255, 140, 0,', damage * 0.8, this.owner, true));
                }, 2000);
            }
            if (isFullEvo) {
                setTimeout(() => {
                    // Nổ bồi lần 3 nhỏ hơn nữa (0.6 maxR)
                    explosions.push(new Explosion(this.x, this.y, this.maxR * 0.6, 'rgba(255, 215, 0,', damage * 0.6, this.owner, true));
                }, 4000);
            }
        }

        this.active = false;
    }

    // ... (Giữ nguyên hàm draw() đã cập nhật giao diện ở bước trước) ...
    draw() {
        if (!this.active) return;
        const age = Date.now() - this.spawnTime;
        const progress = age / this.detonateTime;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Nền cảnh báo
        ctx.beginPath();
        ctx.arc(0, 0, this.maxR * progress, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 50, 50, 0.3)`;
        ctx.fill();

        // Viền đậm
        ctx.beginPath();
        ctx.arc(0, 0, this.maxR * progress, 0, Math.PI * 2);
        let isCritical = (this.detonateTime - age) < 1000;
        ctx.strokeStyle = isCritical
            ? ((Math.floor(Date.now() / 100) % 2 === 0) ? 'yellow' : 'red')
            : 'red';
        ctx.lineWidth = 5;
        ctx.stroke();

        // Tâm ngắm
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-15, 0); ctx.lineTo(15, 0);
        ctx.moveTo(0, -15); ctx.lineTo(0, 15);
        ctx.stroke();

        // Text
        ctx.fillStyle = "white";
        ctx.font = "bold 16px Arial";
        ctx.shadowColor = "black"; ctx.shadowBlur = 4;
        ctx.textAlign = "center";
        ctx.fillText(((this.detonateTime - age) / 1000).toFixed(1), 0, -20);

        ctx.restore();
    }
}

let floatingSwords = [];
let voidZones = [];

// Class Vùng Hư Vô (Làm chậm & Cấm đánh)
class VoidZone {
    constructor(x, y, radius, duration, owner) {
        this.x = x; this.y = y; this.r = radius;
        this.lifeTime = duration;
        this.owner = owner;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.lifeTime--;
        if (this.lifeTime <= 0) this.active = false;

        let enemy = (this.owner.id === 1) ? p2 : p1;
        let d = Math.hypot(this.x - (enemy.x + enemy.w / 2), this.y - (enemy.y + enemy.h / 2));
        if (d < this.r) {
            enemy.slowTimer = 10;
            enemy.silenceTimer = 10; // Câm lặng liên tục khi đứng trong vùng
        }
    }
    draw() {
        if (!this.active) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(138, 43, 226, 0.3)`; // Màu tím hư vô
        ctx.fill();
        ctx.strokeStyle = '#8a2be2'; ctx.lineWidth = 2;
        ctx.stroke();
    }
}



// Hàm vẽ Kiếm có hiệu ứng phát sáng (Graphic Improvement)
function drawGlowingSword(x, y, w, h, color, dirY = -1) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.fillStyle = "white";

    // [FIX LỖI KIẾM NGƯỢC] Lật Canvas nếu đạn bay xuống
    if (dirY === 1) {
        ctx.translate(x + w / 2, y + h / 2);
        ctx.scale(1, -1);
        ctx.translate(-(x + w / 2), -(y + h / 2));
    }

    // Vẽ hình dáng thanh kiếm (nhọn ở đầu)
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y); // Mũi kiếm
    ctx.lineTo(x + w, y + h * 0.2); // Vai kiếm phải
    ctx.lineTo(x + w * 0.8, y + h); // Đuôi phải
    ctx.lineTo(x + w * 0.2, y + h); // Đuôi trái
    ctx.lineTo(x, y + h * 0.2); // Vai kiếm trái
    ctx.closePath();
    ctx.fill();

    // Lõi kiếm
    ctx.fillStyle = color;
    ctx.fillRect(x + w * 0.3, y + h * 0.2, w * 0.4, h * 0.8);
    ctx.restore();
}
// Khởi tạo mảng global
let mortars = [];
let fireZones = [];
class FireZone {
    constructor(x, y, owner) {
        this.x = x; this.y = y;
        this.owner = owner;
        this.r = 45;
        this.lifeTime = 120; // Tồn tại 2s
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.lifeTime--;
        if (this.lifeTime <= 0) this.active = false;

        if (this.lifeTime % 30 === 0) {
            // 1. Tác động lên Địch (Player)
            const enemy = (this.owner.id === 1) ? p2 : p1;
            let d = Math.hypot(this.x - (enemy.x + enemy.w / 2), this.y - (enemy.y + enemy.h / 2));
            if (d < this.r) {
                enemy.burnTimer = this.owner.hasUpgrade('evo_furnace_2') ? 360 : 180;
                enemy.burnStacks++;
                if (enemy.burnStacks >= 5) {
                    enemy.takeDamage(5, this.owner);
                    enemy.burnStacks = 0;
                    explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 80, 'orange', 0, this.owner));
                }
            }

            // 2. Tác động lên Xe Tiền
            moneyTrucks.forEach(t => {
                if (t.active) {
                    let dt = Math.hypot(this.x - (t.x + t.w / 2), this.y - (t.y + t.h / 2));
                    if (dt < this.r) {
                        t.burnStacks = (t.burnStacks || 0) + 1;
                        t.hp -= 0.5; // DoT nhẹ
                        if (t.burnStacks >= 5) {
                            t.hp -= 5;
                            t.burnStacks = 0;
                            explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 80, 'orange', 0, this.owner));
                        }
                    }
                }
            });

            // 3. Tác động lên Ụ Súng Địch
            turrets.forEach(t => {
                if (t.active && t.owner.id !== this.owner.id) {
                    let dt = Math.hypot(this.x - (t.x + t.w / 2), this.y - (t.y + t.h / 2));
                    if (dt < this.r) {
                        t.burnStacks = (t.burnStacks || 0) + 1;
                        t.hp -= 0.5;
                        if (t.burnStacks >= 5) {
                            t.hp -= 5;
                            t.burnStacks = 0;
                            explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 60, 'orange', 0, this.owner));
                        }
                    }
                }
            });
        }
    }
    draw() {
        if (!this.active) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 69, 0, ${this.lifeTime / 240 + 0.2})`; // Cam đỏ
        ctx.fill();
        ctx.strokeStyle = '#ff4500';
        ctx.stroke();
    }
}

class AcidZone {
    constructor(x, y, owner) {
        this.x = x; this.y = y;
        this.owner = owner;
        // BUFF: Vùng rộng hơn (60 -> 85), Evo lên 120
        this.r = 50;
        this.active = true;
        this.lifeTime = 60; // Tồn tại 4 giây

        if (owner.hasUpgrade('evo_acid_1')) {
            this.r = 100; // Siêu to khổng lồ
            this.lifeTime = 120; // 6 giây
        }
    }

    update() {
        if (!this.active) return;
        this.lifeTime--;
        if (this.lifeTime <= 0) this.active = false;

        let isEvo1 = this.owner.hasUpgrade('evo_acid_1');
        let isEvo2 = this.owner.hasUpgrade('evo_acid_2');
        let erosionRate = isEvo1 ? 0.06 : 0.03;
        let burnRate = isEvo1 ? 0.1 : 0.05;

        // SỬA: Ngưỡng kết liễu chuẩn. Evo2 = 2, không có Evo2 = 0 (không kết liễu)
        let killThreshold = isEvo2 ? 2 : 0;

        // 1. Phá giáp / Ăn mòn Địch
        const enemy = (this.owner.id === 1) ? p2 : p1;
        let d = Math.hypot(this.x - (enemy.x + enemy.w / 2), this.y - (enemy.y + enemy.h / 2));

        if (d < this.r) {
            enemy.acidZoneSlow = 10; // Làm chậm nhẹ 25% khi đi qua vùng Axit
            if (enemy.weapon === 'the_strongest') {
                enemy.takeDamage(burnRate, this.owner, { isEnvironmental: true });
            } else if (enemy.shield > 0) {
                if (this.lifeTime % 10 === 0) enemy.shield--;
            } else {
                enemy.maxHp = Math.max(1, enemy.maxHp - erosionRate);
                if (enemy.hp > killThreshold) {
                    enemy.hp -= burnRate;
                    if (enemy.hp < 1 && killThreshold === 0) enemy.hp = 1;
                }
            }
        }

        // 2. Ăn mòn cực lớn lên các công trình/vật thể nhân tạo (Ụ súng, Xe Tiền, v.v.): Gấp 5 lần
        let structDmg = burnRate * 5;
        moneyTrucks.forEach(t => {
            if (t.active && Math.hypot(this.x - (t.x + t.w / 2), this.y - (t.y + t.h / 2)) < this.r) t.hp -= structDmg;
        });
        turrets.forEach(t => {
            if (t.active && t.owner.id !== this.owner.id && Math.hypot(this.x - (t.x + t.w / 2), this.y - (t.y + t.h / 2)) < this.r) t.hp -= structDmg;
        });
        if (typeof creatorTurrets !== 'undefined') {
            creatorTurrets.forEach(t => {
                if (t.active && t.owner.id !== this.owner.id && Math.hypot(this.x - (t.x + t.w / 2), this.y - (t.y + t.h / 2)) < this.r) t.hp -= structDmg;
            });
        }
        if (typeof bastions !== 'undefined') {
            bastions.forEach(b => {
                if (b.active && Math.hypot(this.x - (b.x + b.w / 2), this.y - (b.y + b.h / 2)) < this.r) b.hp -= structDmg;
            });
        }
        if (typeof necroMinions !== 'undefined') {
            necroMinions.forEach(m => {
                if (m.active && m.owner !== this.owner && Math.hypot(this.x - (m.x + m.w / 2), this.y - (m.y + m.h / 2)) < this.r) m.takeDamage(structDmg);
            });
        }
    }

    draw() {
        if (!this.active) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        // Màu xanh lá đậm hơn, nguy hiểm hơn
        ctx.fillStyle = `rgba(50, 205, 50, ${this.lifeTime / 240 * 0.5})`;
        ctx.fill();

        // Viền nhấp nháy
        ctx.strokeStyle = (Math.floor(Date.now() / 100) % 2 === 0) ? '#00ff00' : '#ADFF2F';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Hiệu ứng sủi bọt (nhiều hơn)
        if (Math.random() > 0.7) {
            ctx.fillStyle = "#ccffcc";
            let bx = this.x + (Math.random() - 0.5) * this.r * 1.6;
            let by = this.y + (Math.random() - 0.5) * this.r * 1.6;
            ctx.fillRect(bx, by, 3, 3);
        }
    }
}

let sniperWalls = []; // Thêm biến mảng global này cùng chỗ với turrets, iceZones...
class SniperWall {
    constructor(x, y, owner, isMoving = false) {
        this.w = 60; this.h = 20;
        this.x = x; this.y = y;
        this.owner = owner;
        this.isMoving = isMoving;
        this.vx = isMoving ? 1.5 : 0;
        this.dir = Math.random() > 0.5 ? 1 : -1;

        // [CẬP NHẬT] Tường di chuyển sẽ là Tường Bất Tử
        this.isImmortal = isMoving;

        let hpMultiplier = owner.hasUpgrade('evo_sniper_1') ? 5 : 3;
        this.maxHp = owner.maxHp * hpMultiplier;
        this.hp = this.maxHp;
        this.active = true;

        // Tốc độ giảm máu để tường tự biến mất sau 10 giây (chỉ áp dụng tường đứng yên)
        this.decayRate = this.maxHp / 600;
    }

    update() {
        if (!this.active) return;

        // Chỉ tường do người chơi đặt (đứng yên) mới bị giảm máu và tự vỡ
        if (!this.isImmortal) {
            this.hp -= this.decayRate;
            if (this.hp <= 0) {
                this.active = false;
                explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 40, 'gray', 0, this.owner));
            }
        }

        if (this.isMoving) {
            this.x += this.vx * this.dir;
            if (this.x <= 0 || this.x + this.w >= canvas.width) this.dir *= -1;
        }
    }

    draw() {
        if (!this.active) return;

        // Đổi màu tường bất tử sang màu xám để dễ phân biệt, tường tự đặt thì có màu của phe
        if (this.isImmortal) {
            ctx.fillStyle = "rgba(149, 165, 166, 0.9)"; // Màu xám kim loại
        } else {
            ctx.fillStyle = (this.owner.id === 1) ? "rgba(52, 152, 219, 0.7)" : "rgba(231, 76, 60, 0.7)";
        }

        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.strokeRect(this.x, this.y, this.w, this.h);

        // Chỉ vẽ thanh máu cho tường có thể phá hủy (tường tự đặt)
        if (!this.isImmortal) {
            ctx.fillStyle = "red"; ctx.fillRect(this.x, this.y - 5, this.w, 3);
            ctx.fillStyle = "#0f0"; ctx.fillRect(this.x, this.y - 5, this.w * (this.hp / this.maxHp), 3);
        }
    }
}

// --- CLASS Ụ SÚNG (TURRET) ---
let turrets = []; // GLOBAL VAR: Nhớ khai báo biến này ở đầu file cùng với bullets
let thunderPlantedSpears = [];
let magnetNodes = [];
let bastions = [];
let artilleryHazards = [];
let ghostDecoys = [];
let confinementCages = [];
let creatorTurrets = [];
let creatorDrones = [];
let creatorRobots = [];
let necroMinions = [];

// ==========================================
// --- CLASS VONG LINH (CHIÊU HỒN SƯ MINION) ---
// ==========================================
class NecroMinion {
    constructor(owner, type) {
        this.owner = owner;
        this.type = type; // 'kamikaze' | 'shooter' | 'elite'
        this.active = true;

        if (this.type === 'kamikaze') {
            this.w = 24; this.h = 24;
            this.lockedCost = 2; this.refund = 1;
            this.hp = Math.max(1.5, owner.maxHp * 0.7);
            this.maxHp = this.hp;
            this.dmg = Math.max(1.0, owner.damage * 0.7);
            this.speed = 4.5;
            this.x = owner.x + owner.w / 2 - this.w / 2;
            this.y = (owner.id === 1) ? owner.y - 30 : owner.y + owner.h + 6;
        } else if (this.type === 'shooter') {
            this.w = 24; this.h = 24;
            this.lockedCost = 4; this.refund = 2;
            this.hp = Math.max(1.5, owner.maxHp * 0.5);
            this.maxHp = this.hp;
            this.dmg = Math.max(0.5, owner.damage * 0.5);
            this.speed = 2.0;
            this.vx = (Math.random() > 0.5 ? 1 : -1) * 2.0;
            this.shootTimer = 0;
            this.x = Math.max(20, Math.min(canvas.width - 44, owner.x + (Math.random() - 0.5) * 60));
            this.y = (owner.id === 1) ? owner.y - 45 : owner.y + owner.h + 20;
        } else if (this.type === 'elite') {
            this.w = 36; this.h = 36;
            this.lockedCost = 6; this.refund = 3;
            this.hp = Math.max(3.0, owner.maxHp * 2.0);
            this.maxHp = this.hp;
            this.dmg = Math.max(2.0, owner.damage * 2.0);
            this.speed = 3.2;
            this.attackCd = 0;
            this.shieldHits = (owner.hasUpgrade && owner.hasUpgrade('evo_necro_2')) ? 3 : 0;
            this.x = owner.x + owner.w / 2 - this.w / 2;
            this.y = (owner.id === 1) ? owner.y - 42 : owner.y + owner.h + 10;
        }
    }

    update() {
        if (!this.active) return;
        const enemy = (this.owner.id === 1) ? p2 : p1;

        if (this.type === 'kamikaze') {
            let dirY = (this.owner.id === 1) ? -1 : 1;
            this.y += dirY * this.speed;

            if (enemy && enemy.hp > 0) {
                let edx = (enemy.x + enemy.w / 2) - (this.x + this.w / 2);
                this.x += Math.sign(edx) * Math.min(Math.abs(edx), 1.8);
            }

            // Check collision with enemy
            if (enemy && enemy.hp > 0 && rectIntersect(this.x, this.y, this.w, this.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
                this.detonate();
                return;
            }

            // Check collision with obstacles / walls / crates / moneyTrucks
            let hitObstacle = false;
            let obstacles = [];
            if (typeof sniperWalls !== 'undefined') obstacles.push(...sniperWalls);
            if (typeof crates !== 'undefined') obstacles.push(...crates);
            if (typeof moneyTrucks !== 'undefined') obstacles.push(...moneyTrucks);
            if (typeof bastions !== 'undefined') obstacles.push(...bastions);

            for (let obs of obstacles) {
                if (obs.active && rectIntersect(this.x, this.y, this.w, this.h, obs.x, obs.y, obs.w, obs.h)) {
                    hitObstacle = true;
                    break;
                }
            }

            if (hitObstacle || this.y <= 5 || this.y + this.h >= canvas.height - 5) {
                this.detonate();
                return;
            }
        } else if (this.type === 'shooter') {
            this.x += this.vx;
            if (this.x <= 15) { this.x = 15; this.vx = Math.abs(this.vx); }
            if (this.x + this.w >= canvas.width - 15) { this.x = canvas.width - 15 - this.w; this.vx = -Math.abs(this.vx); }

            this.shootTimer++;
            if (this.shootTimer >= 75) {
                this.shootTimer = 0;
                let dirY = (this.owner.id === 1) ? -1 : 1;
                let isPiercing = !!(this.owner.hasUpgrade && this.owner.hasUpgrade('evo_necro_2'));
                let bSpeed = C.bulletSpeed * 1.1;
                this.owner.bullets.push({
                    x: this.x + this.w / 2 - 3,
                    y: (dirY === -1) ? this.y - 6 : this.y + this.h + 2,
                    w: 6, h: 6,
                    vx: 0,
                    vy: dirY * bSpeed,
                    dmg: this.dmg,
                    owner: this.owner,
                    isPiercing: isPiercing,
                    isNecroMinionBullet: true,
                    color: "#00e676",
                    hitIds: []
                });
                if (soundSystem && !soundSystem.muted) soundSystem.playShoot();
            }
        } else if (this.type === 'elite') {
            if (this.attackCd > 0) this.attackCd--;
            if (enemy && enemy.hp > 0) {
                let dx = (enemy.x + enemy.w / 2) - (this.x + this.w / 2);
                let dy = (enemy.y + enemy.h / 2) - (this.y + this.h / 2);
                let dist = Math.hypot(dx, dy);

                if (dist > 40) {
                    this.x += (dx / dist) * this.speed;
                    this.y += (dy / dist) * this.speed;
                }

                // Attack when in range
                if (dist <= 48 && this.attackCd <= 0) {
                    this.attackCd = 120; // 2s CD
                    enemy.takeDamage(this.dmg, this.owner);
                    enemy.kbX = Math.sign(dx || 1) * 35; // STRICT HORIZONTAL ONLY!
                    enemy.freezeTimer = 18; // 0.3s stun
                    explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 45, '#00e676', 0, this.owner));
                    triggerScreenShake(4, 6);
                    if (soundSystem && !soundSystem.muted) soundSystem.playHit();
                    if (typeof addFloatingText === 'function') addFloatingText(enemy.x + enemy.w / 2, enemy.y - 15, "ĐÒN HÚC VONG LINH! 💀⚡", "#00e676", 14);
                }
            }
            this.x = Math.max(10, Math.min(canvas.width - this.w - 10, this.x));
            this.y = Math.max(10, Math.min(canvas.height - this.h - 10, this.y));
        }
    }

    detonate() {
        if (!this.active) return;
        let isEvo2 = this.owner.hasUpgrade && this.owner.hasUpgrade('evo_necro_2');
        let blastRadius = isEvo2 ? 75 : 50;
        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, blastRadius, '#00e676', this.dmg, this.owner));

        const enemy = (this.owner.id === 1) ? p2 : p1;
        if (enemy && enemy.hp > 0) {
            let dist = Math.hypot((enemy.x + enemy.w / 2) - (this.x + this.w / 2), (enemy.y + enemy.h / 2) - (this.y + this.h / 2));
            if (dist <= blastRadius) {
                enemy.takeDamage(this.dmg, this.owner);
            }
        }
        triggerScreenShake(5, 8);
        if (soundSystem && !soundSystem.muted) soundSystem.playExplosion();
        this.destroy();
    }

    takeDamage(dmg) {
        if (!this.active) return;
        if (this.shieldHits > 0) {
            this.shieldHits--;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, `KHIÊN XƯƠNG (${this.shieldHits})! 💀`, "#00e676", 12);
            if (soundSystem && !soundSystem.muted) soundSystem.playShieldBreak();
            return;
        }
        this.hp -= dmg;
        if (this.hp <= 0) {
            this.destroy();
        }
    }

    destroy() {
        if (!this.active) return;
        this.active = false;
        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 25, 'rgba(0, 230, 118, 0.6)', 0, this.owner));
        if (this.owner) {
            this.owner.lockedSouls = Math.max(0, (this.owner.lockedSouls || 0) - this.lockedCost);
            let cap = this.owner.maxSouls - this.owner.lockedSouls;
            this.owner.currentSouls = Math.min(cap, (this.owner.currentSouls || 0) + this.refund);
            if (typeof addFloatingText === 'function') {
                addFloatingText(this.x + this.w / 2, this.y - 12, `+${this.refund} LINH HỒN 👻`, "#00e676", 12);
            }
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        let cx = this.x + this.w / 2;
        let cy = this.y + this.h / 2;

        // Aura / Glow
        ctx.fillStyle = (this.type === 'kamikaze') ? "rgba(255, 87, 34, 0.25)" : (this.type === 'shooter' ? "rgba(0, 230, 118, 0.2)" : "rgba(171, 71, 188, 0.3)");
        ctx.beginPath();
        ctx.arc(cx, cy, this.w / 2 + 5, 0, Math.PI * 2);
        ctx.fill();

        // Minion body
        ctx.fillStyle = (this.type === 'kamikaze') ? "#ff7043" : (this.type === 'shooter' ? "#26a69a" : "#7e57c2");
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = (this.type === 'kamikaze') ? "#ffab91" : (this.type === 'shooter' ? "#80cbc4" : "#d1c4e9");
        ctx.lineWidth = 1.5;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        // Skull icon or eyes
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(cx - 5, cy - 4, 3, 4);
        ctx.fillRect(cx + 2, cy - 4, 3, 4);

        // Shield indicator for elite
        if (this.shieldHits > 0) {
            ctx.strokeStyle = "#00e676";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(cx, cy, this.w / 2 + 7, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Mini HP Bar
        let hpRatio = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(this.x, this.y - 6, this.w, 3);
        ctx.fillStyle = "#00e676";
        ctx.fillRect(this.x, this.y - 6, this.w * hpRatio, 3);

        ctx.restore();
    }
}

class GhostDecoy {
    constructor(x, y, w, h, owner) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.owner = owner;
        this.lifeTime = 90; // 1.5s
        this.maxLife = 90;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.lifeTime--;
        if (this.lifeTime <= 0) this.active = false;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = (this.lifeTime / this.maxLife) * 0.45;
        ctx.fillStyle = this.owner.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.restore();
    }
}

function distToSegment(px, py, x1, y1, x2, y2) {
    let l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

class BastionWall {
    constructor(y, hp = 60, vx = 2) {
        this.w = 90;
        this.h = 16;
        this.x = 40 + Math.random() * (canvas.width - 170);
        this.y = y;
        this.vx = vx;
        this.hp = hp;
        this.maxHp = hp;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.x += this.vx;
        if (this.x <= 10 || this.x + this.w >= canvas.width - 10) {
            this.vx *= -1;
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = "#1abc9c";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        // HP bar
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(this.x, this.y - 6, this.w, 4);
        ctx.fillStyle = "#2ecc71";
        ctx.fillRect(this.x, this.y - 6, this.w * (this.hp / this.maxHp), 4);

        ctx.fillStyle = "white";
        ctx.font = "bold 9px 'Orbitron', Arial";
        ctx.textAlign = "center";
        ctx.fillText("BASTION", this.x + this.w / 2, this.y + 12);
        ctx.restore();
    }
}

class ArtilleryHazard {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = 10;
        this.maxR = 60;
        this.spawnTime = Date.now();
        this.detonateTime = 2500;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        let age = Date.now() - this.spawnTime;
        if (age >= this.detonateTime) {
            this.explode();
        }
    }
    explode() {
        this.active = false;
        explosions.push(new Explosion(this.x, this.y, this.maxR, 'rgba(231, 76, 60,', 2.0, null, true));
        [p1, p2].forEach(p => {
            if (p && p.hp > 0 && Math.hypot((p.x + p.w / 2) - this.x, (p.y + p.h / 2) - this.y) <= this.maxR) {
                p.takeDamage(2.0, null);
            }
        });
    }
    draw() {
        if (!this.active) return;
        let progress = Math.min(1, (Date.now() - this.spawnTime) / this.detonateTime);
        ctx.save();
        ctx.strokeStyle = `rgba(231, 76, 60, ${0.4 + progress * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.maxR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(231, 76, 60, ${0.15 + progress * 0.35})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.maxR * progress, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = "bold 10px 'Orbitron', Arial";
        ctx.textAlign = "center";
        ctx.fillText("⚠ PHÁO KÍCH", this.x, this.y - this.maxR - 4);
        ctx.restore();
    }
}

function getNonOverlappingTurretPos(owner, targetX, targetY) {
    let pos = { x: targetX, y: targetY };
    let myTurrets = (typeof turrets !== 'undefined' ? turrets : []).filter(t => t.active && t.owner === owner);
    let minDist = 28;
    let tries = [0, 32, -32, 64, -64, 96, -96, 128, -128];
    for (let offset of tries) {
        let testX = Math.max(15, Math.min(canvas.width - 35, targetX + offset));
        let collision = myTurrets.some(t => Math.hypot(t.x - testX, t.y - targetY) < minDist);
        if (!collision) {
            pos.x = testX;
            return pos;
        }
    }
    return pos;
}

class Turret {
    constructor(owner, isSmart = false, startX = null, startY = null) {
        this.owner = owner;
        this.isSmart = isSmart;
        this.w = isSmart ? 22 : 18;
        this.h = isSmart ? 22 : 18;

        let defX = owner.x + owner.w / 2 - this.w / 2;
        let defY = owner.y + (owner.id === 1 ? -30 : owner.h + 10);
        let safePos = getNonOverlappingTurretPos(owner, startX !== null ? startX : defX, startY !== null ? startY : defY);
        this.x = safePos.x;
        this.y = safePos.y;

        let hasEvo1 = owner.hasUpgrade('evo_eng_1');
        let hasEvo2 = owner.hasUpgrade('evo_eng_2');
        let isFullEvo = hasEvo1 && hasEvo2;

        // Feet calculation
        let feetArmorCount = (owner.upgrades || []).filter(u => u === 'feet_armor').length;
        let speedAboveBase = Math.max(0, (owner.speed || C.baseSpeed) - C.baseSpeed);
        let feetSpeedRatio = speedAboveBase / 0.5;
        let speedReductionSec = feetSpeedRatio * 0.125;
        this.baseReload = Math.max(500, Math.round((3.0 - speedReductionSec) * 1000));
        this.reloadTime = this.baseReload;

        if (this.isSmart) {
            // Ụ súng thông minh
            if (isFullEvo) {
                let ratio = owner.isOverloaded ? 2.0 : 1.5;
                this.hp = (owner.maxHp * 1.5 + 6) * (owner.isOverloaded ? 2.0 : 1.0);
                this.baseDmg = (owner.damage * ratio);
            } else {
                this.hp = 6 + 1.0 * owner.maxHp;
                this.baseDmg = 1.0 * owner.damage;
            }
            this.maxHp = this.hp;
            this.lifeTime = Infinity; // Tồn tại vĩnh viễn
            this.isPiercing = (isFullEvo || hasEvo1);
        } else {
            // Ụ súng thường
            if (isFullEvo) {
                let ratio = owner.isOverloaded ? 1.25 : 1.0;
                this.hp = (6 + 1.0 * owner.maxHp) * (owner.isOverloaded ? 1.25 : 1.0);
                this.baseDmg = (owner.damage * ratio);
            } else if (hasEvo1) {
                this.hp = 6 + 0.75 * owner.maxHp;
                this.baseDmg = 0.75 * owner.damage;
            } else {
                this.hp = 3 + 0.5 * owner.maxHp;
                this.baseDmg = 0.5 * owner.damage;
            }
            this.maxHp = this.hp;
            this.lifeTime = (20 + feetArmorCount * 1) * 60; // 20s + số lượng Feet Armor (1s/feet)
            this.isPiercing = false;
        }

        this.ammo = 999;
        this.lastShot = Date.now();
        this.lastRaycast = Date.now();
        this.active = true;
        this.currentAngle = (owner.id === 1) ? -Math.PI / 2 : Math.PI / 2;
        this.color = (owner.id === 1) ? "#2980b9" : "#c0392b";
        this.warningAlpha = 0;
    }

    update() {
        if (!this.active) return;

        let hasEvo1 = this.owner.hasUpgrade('evo_eng_1');
        let hasEvo2 = this.owner.hasUpgrade('evo_eng_2');
        let isFullEvo = hasEvo1 && hasEvo2;
        const enemy = (this.owner.id === 1) ? p2 : p1;

        // Trừ thời gian tồn tại nếu không phải vĩnh viễn
        if (this.lifeTime !== Infinity) {
            this.lifeTime--;
            if (this.lifeTime <= 0) {
                this.active = false;
                return;
            }
        }

        // Tốc độ bắn trong Quá Tải (Ụ thường tăng tốc độ bắn)
        if (!this.isSmart && this.owner.isOverloaded) {
            this.reloadTime = Math.max(300, Math.round(this.baseReload * 0.6));
        } else {
            this.reloadTime = this.baseReload;
        }

        // Logic Mạng LAN (Evo 2 / Full Evo): Vòng nhỏ 50px quanh ụ thường
        let isLanActive = false;
        if (!this.isSmart && (hasEvo2 || isFullEvo)) {
            let dOwner = Math.hypot((this.owner.x + this.owner.w / 2) - (this.x + this.w / 2), (this.owner.y + this.owner.h / 2) - (this.y + this.h / 2));
            let dSmart = turrets.some(t => t.active && t.owner === this.owner && t.isSmart && Math.hypot((t.x + t.w / 2) - (this.x + this.w / 2), (t.y + t.h / 2) - (this.y + this.h / 2)) <= 50);

            if (dOwner <= 50 || dSmart) {
                isLanActive = true;
                this.hp = Math.min(this.maxHp, this.hp + 0.03); // Hồi máu
            }
        }

        // Khả năng tự ngắm
        let canAutoAim = this.isSmart || isLanActive;
        if (canAutoAim && enemy) {
            let targetAngle = Math.atan2((enemy.y + enemy.h / 2) - (this.y + this.h / 2), (enemy.x + enemy.w / 2) - (this.x + this.w / 2));
            let diff = targetAngle - this.currentAngle;
            while (diff <= -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;

            let turnSpeed = (this.isSmart && this.owner.isOverloaded) ? 0.02 : 0.08;
            if (Math.abs(diff) > turnSpeed) {
                this.currentAngle += Math.sign(diff) * turnSpeed;
            } else {
                this.currentAngle = targetAngle;
            }

            // Trong Quá Tải: Đường ngắm cảnh báo đậm dần lên & Bắn Raycast mỗi 2s
            if (this.isSmart && this.owner.isOverloaded) {
                this.warningAlpha = (this.warningAlpha + 0.02) % 1.0;
                if (Date.now() - this.lastRaycast > 2000) {
                    this.fireRaycast(enemy);
                    this.lastRaycast = Date.now();
                }
            } else {
                this.warningAlpha = 0;
            }
        } else {
            let defaultAngle = (this.owner.id === 1) ? -Math.PI / 2 : Math.PI / 2;
            let diff = defaultAngle - this.currentAngle;
            while (diff <= -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            if (Math.abs(diff) > 0.08) this.currentAngle += Math.sign(diff) * 0.08;
            else this.currentAngle = defaultAngle;
            this.warningAlpha = 0;
        }

        // Tự động bắn đạn thường
        if (Date.now() - this.lastShot > this.reloadTime) {
            this.shoot();
        }

        // HP về 0 -> Bị nổ
        if (this.hp <= 0) {
            this.explode();
        }
    }

    fireRaycast(enemy) {
        if (!enemy) return;
        let isEvo2 = true;
        let beamW = 12;
        let startX = this.x + this.w / 2 - beamW / 2;
        let startY = (this.owner.id === 1) ? 0 : this.y;
        let beamH = (this.owner.id === 1) ? this.y : canvas.height - this.y;

        beams.push(new Beam(startX, startY, beamW, beamH, this.owner.id, isEvo2));
        explosions.push(new Explosion(this.x + this.w / 2, (this.owner.id === 1) ? this.y : this.y + this.h, 30, '#00ffff', 0, this.owner));
        soundSystem.playShoot();

        if (rectIntersect(startX, startY, beamW, beamH, enemy.x, enemy.y, enemy.w, enemy.h)) {
            enemy.takeDamage(this.baseDmg * 1.5, this.owner, { isPiercing: true });
        }
    }

    shoot() {
        let speed = 4.8;
        let vx = Math.cos(this.currentAngle) * speed;
        let vy = Math.sin(this.currentAngle) * speed;

        this.owner.bullets.push({
            x: this.x + this.w / 2 - 2.5,
            y: (this.owner.id === 1 ? this.y - 2 : this.y + this.h + 2),
            w: this.isSmart ? 6 : 5,
            h: this.isSmart ? 6 : 5,
            vx: vx, vy: vy,
            dmg: this.baseDmg,
            owner: this.owner,
            isExplosive: false,
            isPiercing: this.isPiercing,
            isTurretBullet: true,
            isSmartTurret: this.isSmart,
            hitIds: []
        });

        this.lastShot = Date.now();
        soundSystem.playShoot();
    }

    explode() {
        this.active = false;
        let hasEvo1 = this.owner.hasUpgrade('evo_eng_1');
        let hasEvo2 = this.owner.hasUpgrade('evo_eng_2');
        let isFullEvo = hasEvo1 && hasEvo2;

        let expRange = this.isSmart ? 50 : 35;
        if (this.owner.isOverloaded) expRange += 25;
        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, expRange, this.isSmart ? 'cyan' : 'orange', 1, this.owner));

        // Full Evo: Ụ súng khi phát nổ tạo ra một Vùng Làm Chậm
        if (isFullEvo) {
            iceZones.push(new IceZone(this.x + this.w / 2, this.y + this.h / 2, 80, 180, this.owner));
        }
    }

    draw() {
        if (!this.active) return;
        let hasEvo2 = this.owner.hasUpgrade('evo_eng_2');
        let isFullEvo = this.owner.hasUpgrade('evo_eng_1') && hasEvo2;

        // Vẽ Vòng Mạng LAN (Evo 2) quanh ụ thường
        if (!this.isSmart && (hasEvo2 || isFullEvo)) {
            ctx.save();
            ctx.strokeStyle = "rgba(0, 255, 204, 0.4)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 50, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }

        // Đường ngắm cảnh báo đậm dần của Ụ Thông Minh trong Quá Tải
        if (this.isSmart && this.owner.isOverloaded && this.warningAlpha > 0) {
            ctx.save();
            let laserLen = canvas.height;
            let endX = (this.x + this.w / 2) + Math.cos(this.currentAngle) * laserLen;
            let endY = (this.y + this.h / 2) + Math.sin(this.currentAngle) * laserLen;

            ctx.strokeStyle = `rgba(255, 0, 80, ${this.warningAlpha * 0.85})`;
            ctx.lineWidth = 2.5;
            ctx.setLineDash([6, 3]);
            ctx.beginPath();
            ctx.moveTo(this.x + this.w / 2, this.y + this.h / 2);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }

        // Thân ụ súng
        ctx.fillStyle = this.isSmart ? "#1a365d" : "#4a5568";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = this.isSmart ? "#00f0ff" : "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        // Nòng súng xoay
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(this.currentAngle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-4, -4, 8, 8);
        ctx.fillRect(0, -2, this.isSmart ? 14 : 10, 4);
        ctx.restore();

        // Thanh HP ụ súng
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(this.x, this.y - 6, this.w, 3);
        ctx.fillStyle = this.isSmart ? "#00ffff" : "#00ff66";
        let hpRatio = Math.max(0, Math.min(1, this.hp / this.maxHp));
        ctx.fillRect(this.x, this.y - 6, this.w * hpRatio, 3);
    }
}
class StormSlash {
    constructor(x, y, radius, dmg, owner, isVacuum) {
        this.x = x; this.y = y;
        this.r = 10;
        this.maxR = radius;
        this.dmg = dmg;
        this.owner = owner;
        this.active = true;
        this.isVacuum = isVacuum; // Hiệu ứng hút của Evo 1
        this.hitTargets = [];
        this.color = (owner.id === 1) ? "rgba(0, 255, 255," : "rgba(255, 69, 0,";
    }

    update() {
        if (!this.active) return;
        this.r += (this.maxR / 10); // Tốc độ mở rộng vòng chém
        if (this.r >= this.maxR) this.active = false;

        // 1. XỬ LÝ VA CHẠM ĐỊCH (P1/P2)
        const enemy = (this.owner.id === 1) ? p2 : p1;
        if (!this.hitTargets.includes(enemy)) {
            let d = Math.hypot(this.x - (enemy.x + enemy.w / 2), this.y - (enemy.y + enemy.h / 2));
            if (d < this.r) {
                enemy.takeDamage(this.dmg, this.owner);

                // Hiệu ứng Hút (Evo 1) - Chỉ hút theo trục ngang (X)
                if (this.isVacuum) {
                    let dx = this.x - (enemy.x + enemy.w / 2);
                    let dirX = (dx >= 0 ? 1 : -1);
                    enemy.x = Math.max(0, Math.min(canvas.width - enemy.w, enemy.x + dirX * Math.min(Math.abs(dx), 60)));
                }
                this.hitTargets.push(enemy);
            }
        }

        // 2. [FIX] XỬ LÝ VA CHẠM XE TIỀN (MONEY TRUCK)
        moneyTrucks.forEach(t => {
            if (t.active && !this.hitTargets.includes(t)) {
                let d = Math.hypot(this.x - (t.x + t.w / 2), this.y - (t.y + t.h / 2));
                // Cho phép chém trúng xe tiền dễ hơn chút (tăng range va chạm)
                if (d < this.r + 10) {
                    let finalDmg = this.dmg;
                    // Xe tiền chịu nhiều sát thương hơn từ kỹ năng
                    t.hp -= finalDmg * 2;

                    // Tạo hiệu ứng nổ nhỏ khi chém trúng
                    explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 40, 'rgba(255,165,0,', 0, this.owner));

                    if (t.hp <= 0) {
                        t.active = false;
                        let money = 30;
                        if (this.owner.weapon === 'money_tank') money *= 2;
                        if (this.owner.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                        if (this.owner.weapon === 'evolution') this.owner.onEvolutionCrateEat('truck');
                        // Nổ lớn khi xe chết
                        explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 80, 'rgba(255,215,0,', 5, this.owner));
                    }
                    this.hitTargets.push(t); // Đánh dấu đã chém xe này (để không trừ máu liên tục mỗi frame)
                }
            }
        });

        // 3. [FIX] XỬ LÝ VA CHẠM THÙNG TIẾP TẾ (CRATES)
        crates.forEach(c => {
            if (c.active) {
                let d = Math.hypot(this.x - (c.x + c.w / 2), this.y - (c.y + c.h / 2));
                if (d < this.r) {
                    c.active = false; // Phá thùng ngay lập tức
                    if (c.isMimic) {
                        triggerMimicExplosion(c, this.owner);
                    }

                    // Logic nhận quà cho người chém
                    if (c.type === 'hp') {
                        if (this.owner.weapon === 'necromancer') {
                            let cap = this.owner.maxSouls - (this.owner.lockedSouls || 0);
                            this.owner.currentSouls = Math.min(cap, (this.owner.currentSouls || 0) + 4);
                            if (typeof addFloatingText === 'function') addFloatingText(this.owner.x + this.owner.w / 2, this.owner.y - 15, "+4 LINH HỒN 👻", "#00e676", 13);
                        } else {
                            this.owner.hp = Math.min(this.owner.hp + 1, this.owner.maxHp);
                        }
                    }
                    if (c.type === 'ammo') this.owner.onCollectAmmoCrate(c);
                    if (c.type === 'shield') this.owner.shield++;
                    if (c.type === 'dmg') this.owner.dmgBuff++;
                    if (this.owner.weapon === 'evolution') this.owner.onEvolutionCrateEat(c.type);
                    if (c.type === 'coin') {
                        let money = 30; if (this.owner.weapon === 'money_tank') money *= 2;
                        if (this.owner.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                    }
                    if (c.type === 'gear') {
                        this.owner.ammo = Math.min(this.owner.maxAmmo, this.owner.ammo + 1);
                        this.owner.hp = Math.min(this.owner.maxHp, this.owner.hp + 0.25);
                        if (this.owner.weapon === 'genius') {
                            if (this.owner.isPilotingMecha) {
                                if (this.owner.mechaHp < this.owner.mechaMaxHp) {
                                    this.owner.mechaHp = Math.min(this.owner.mechaMaxHp, this.owner.mechaHp + 0.5);
                                    if (typeof addFloatingText === 'function') addFloatingText(this.owner.x + this.owner.w / 2, this.owner.y - 15, "+0.5 MECHA HP 🤖", "#ff9800", 12);
                                } else {
                                    this.owner.mechaVirtualArmor = (this.owner.mechaVirtualArmor || 0) + 0.5;
                                    if (typeof addFloatingText === 'function') addFloatingText(this.owner.x + this.owner.w / 2, this.owner.y - 15, "+0.5 GIÁP ẢO 🛡️", "#ffd700", 12);
                                }
                            } else {
                                this.owner.gears = (this.owner.gears || 0) + 1;
                                if (typeof addFloatingText === 'function') addFloatingText(this.owner.x + this.owner.w / 2, this.owner.y - 15, "+1 BÁNH RĂNG ⚙️", "#ff9800", 12);
                            }
                        }
                    }
                    if (this.owner.weapon === 'genius' && c.type !== 'gear') {
                        if (this.owner.isPilotingMecha) {
                            if (this.owner.mechaHp < this.owner.mechaMaxHp) {
                                this.owner.mechaHp = Math.min(this.owner.mechaMaxHp, this.owner.mechaHp + 0.5);
                                if (typeof addFloatingText === 'function') addFloatingText(this.owner.x + this.owner.w / 2, this.owner.y - 15, "+0.5 MECHA HP 🤖", "#ff9800", 12);
                            } else {
                                this.owner.mechaVirtualArmor = (this.owner.mechaVirtualArmor || 0) + 0.5;
                                if (typeof addFloatingText === 'function') addFloatingText(this.owner.x + this.owner.w / 2, this.owner.y - 15, "+0.5 GIÁP ẢO 🛡️", "#ffd700", 12);
                            }
                        } else {
                            this.owner.gears = (this.owner.gears || 0) + 1;
                            if (typeof addFloatingText === 'function') addFloatingText(this.owner.x + this.owner.w / 2, this.owner.y - 15, "+1 BÁNH RĂNG ⚙️", "#ff9800", 12);
                        }
                        this.owner.components = (this.owner.components || 0) + 0.5;
                        if (typeof addFloatingText === 'function') addFloatingText(this.owner.x + this.owner.w / 2, this.owner.y - 27, "+0.5 LINH KIỆN 🔩", "#00e5ff", 11);
                    }

                    // Hiệu ứng nổ thùng
                    if (c.type === 'boom') explosions.push(new Explosion(c.x, c.y, 60, 'rgba(255,0,0,', 2, this.owner));
                    else explosions.push(new Explosion(c.x, c.y, 30, 'rgba(255,255,255,', 0, this.owner));
                }
            }
        });
    }

    draw() {
        if (!this.active) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color} 0.3)`;
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = `${this.color} 0.8)`;
        ctx.stroke();

        // Vẽ hiệu ứng gió xoáy
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 0.7, 0 + Date.now() / 100, Math.PI + Date.now() / 100);
        ctx.stroke();
    }
}
class Explosion {
    // Thêm tham số hasFalloff vào cuối (mặc định là false để giữ nguyên logic cũ cho các vũ khí khác)
    constructor(x, y, maxR = 60, color = 'rgba(255, 100, 0,', dmg = 2, owner = null, hasFalloff = false) {
        this.x = x; this.y = y;
        this.r = 1;
        this.maxR = maxR;
        this.active = true;
        this.colorStr = color;
        this.dmg = dmg;
        this.owner = owner;
        this.hasFalloff = hasFalloff; // Lưu loại vụ nổ
        this.hitTargets = [];
        this.checkCollision();
    }

    checkCollision() {
        const checkTarget = (t) => {
            if (!t || this.hitTargets.includes(t)) return;
            let dist = Math.hypot(this.x - (t.x + t.w / 2), this.y - (t.y + t.h / 2));

            if (dist < this.maxR) {
                // 0-damage cosmetic explosions do NOT strip shields or damage
                if (this.dmg <= 0) {
                    this.hitTargets.push(t);
                    return;
                }
                // Do not harm self (owner) unless owner is null (boom crate)
                if (this.owner && t === this.owner) {
                    return;
                }

                let finalDmg = this.dmg;
                if (this.hasFalloff) {
                    let falloffFactor = Math.max(0.2, 1 - (dist / this.maxR));
                    finalDmg = this.dmg * falloffFactor;
                }

                if (typeof t.takeDamage === 'function') {
                    t.takeDamage(finalDmg, this.owner);
                } else {
                    if (t.shield > 0) t.shield--;
                    else t.hp -= finalDmg;
                }
                this.hitTargets.push(t);
            }
        };

        checkTarget(p1); checkTarget(p2);

        moneyTrucks.forEach(t => {
            if (t.active) {
                let dist = Math.hypot(this.x - (t.x + t.w / 2), this.y - (t.y + t.h / 2));
                if (dist < this.maxR) {
                    let multiplier = (this.owner && this.owner.weapon === 'money_tank') ? 3 : 1;

                    // Áp dụng falloff cho cả xe tiền nếu cần
                    let finalDmg = this.dmg * 2 * multiplier;
                    if (this.hasFalloff) {
                        finalDmg *= (1 - (dist / this.maxR));
                    }

                    t.hp -= finalDmg;
                    if (t.hp <= 0 && this.owner) {
                        t.active = false;
                        let money = 50;
                        if (this.owner.weapon === 'money_tank') money *= 2;
                        if (this.owner.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                    }
                }
            }
        });

        // (Nếu muốn nổ tác động lên trụ thì thêm checkTurret tại đây, tương tự checkTarget)
    }

    update() {
        if (!this.active) return;
        this.r += 3;
        if (this.r > this.maxR) this.active = false;
    }

    draw() {
        if (!this.active) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        // Vẽ khác đi chút nếu là falloff (tùy chọn)
        ctx.fillStyle = `${this.colorStr} ${1 - this.r / this.maxR})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${1 - this.r / this.maxR})`;
        ctx.stroke();
    }
}

class RadiationZone {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.r = 60;
        this.lifeTime = 180;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.lifeTime--;
        if (this.lifeTime <= 0) this.active = false;

        if (this.lifeTime % 30 === 0) {
            [p1, p2].forEach(p => {
                let d = Math.hypot(this.x - (p.x + p.w / 2), this.y - (p.y + p.h / 2));
                if (d < this.r) {
                    if (p.weapon === 'the_strongest') {
                        p.takeDamage(0.5, null, { isEnvironmental: true });
                    } else if (p.shield > 0) {
                        p.shield--;
                    } else if (p.hp > 1) {
                        p.hp = Math.max(1, p.hp - 1);
                    }
                }
            });
        }
    }
    draw() {
        if (!this.active) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 0, 0.3)`;
        ctx.fill();
        ctx.strokeStyle = '#00ff00';
        ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);
    }
}
class Talisman {
    constructor(x, y, type, owner, target = null) {
        this.x = x; this.y = y;
        this.type = type; // 'am' hoặc 'duong'
        this.owner = owner;
        this.target = target;
        this.w = 16; this.h = 24;

        // Thời gian tồn tại trên đất giảm mạnh: 1.25s (75 frames) hoặc 2s (120 frames với Evo 1)
        this.lifeTime = owner.hasUpgrade('evo_ads_1') ? 120 : 75;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.lifeTime--;
        if (this.lifeTime <= 0) this.active = false;

        // Dính vào mục tiêu nếu có
        if (this.target && this.target.active !== false && this.target.hp > 0) {
            this.x = this.target.x + this.target.w / 2;
            this.y = this.target.y + this.target.h / 2;
        }

        // Kiểm tra kết hợp với bùa khác
        for (let i = 0; i < talismans.length; i++) {
            let other = talismans[i];
            // Nếu là bùa của mình, khác loại Âm/Dương, và ở gần
            if (other !== this && other.active && other.owner.id === this.owner.id && other.type !== this.type) {
                let dist = Math.hypot(this.x - other.x, this.y - other.y);
                let combineDist = this.owner.hasUpgrade('evo_ads_1') ? 85 : 55; // Giảm nhẹ khoảng cách kết hợp
                if (dist < combineDist) {
                    this.combine(other);
                    break;
                }
            }
        }
    }
    combine(other) {
        this.active = false;
        other.active = false;

        let cx = (this.x + other.x) / 2;
        let cy = (this.y + other.y) / 2;

        let hasEvo1 = this.owner.hasUpgrade('evo_ads_1');
        let hasEvo2 = this.owner.hasUpgrade('evo_ads_2');
        let isFullEvo = hasEvo1 && hasEvo2;

        let radius = hasEvo1 ? 75 : 50; // Giảm nhẹ bán kính
        let stunFrames = hasEvo1 ? 45 : 30; // 0.75s hoặc 0.5s choáng

        // 1. Gây Nổ (Nerf nhẹ sát thương)
        explosions.push(new Explosion(cx, cy, radius, 'rgba(255, 255, 255,', 1.25, this.owner));

        // 2. Gây Choáng (Freeze) & Nerf toàn diện thời gian khống chế
        const enemy = (this.owner.id === 1) ? p2 : p1;
        if (Math.hypot(cx - (enemy.x + enemy.w / 2), cy - (enemy.y + enemy.h / 2)) < radius) {
            enemy.freezeTimer = stunFrames;
            enemy.slowTimer = 45; // 0.75s
            enemy.silenceTimer = 45; // 0.75s câm lặng (nerf mạnh từ 2s)
        }

        // 3. Pháp Trận (Evo 2)
        if (hasEvo2) {
            spellZones.push(new SpellZone(cx, cy, radius, 180, this.owner, isFullEvo));
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = this.type === 'am' ? '#2c3e50' : '#f1c40f'; // Âm = Đen xanh, Dương = Vàng
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.w / 2, -this.h / 2, this.w, this.h);

        // Vẽ ký hiệu bùa
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(-this.w / 4, -this.h / 4, this.w / 2, this.h / 2);
        ctx.restore();
    }
}

class SpellZone {
    constructor(x, y, r, duration, owner, isFullEvo) {
        this.x = x; this.y = y; this.r = r;
        this.lifeTime = duration;
        this.owner = owner;
        this.isFullEvo = isFullEvo;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.lifeTime--;
        if (this.lifeTime <= 0) this.active = false;

        // Gây sát thương mỗi 0.5s (30 frame)
        if (this.lifeTime % 30 === 0) {
            const enemy = (this.owner.id === 1) ? p2 : p1;
            if (Math.hypot(this.x - (enemy.x + enemy.w / 2), this.y - (enemy.y + enemy.h / 2)) < this.r) {
                enemy.takeDamage(0.5, this.owner);

                // Full Evo: Kèm câm lặng và làm chậm khi đứng trong trận
                if (this.isFullEvo) {
                    enemy.silenceTimer = 60;
                    enemy.slowTimer = 60;
                }
            }
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        ctx.arc(0, 0, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(138, 43, 226, 0.2)`; // Màu tím pháp trận
        ctx.fill();
        ctx.strokeStyle = '#8a2be2';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.stroke();

        // Vẽ trận pháp xoay
        ctx.rotate(Date.now() / 500);
        ctx.beginPath();
        ctx.moveTo(-this.r * 0.6, -this.r * 0.6); ctx.lineTo(this.r * 0.6, this.r * 0.6);
        ctx.moveTo(this.r * 0.6, -this.r * 0.6); ctx.lineTo(-this.r * 0.6, this.r * 0.6);
        ctx.stroke();
        ctx.restore();
    }
}

class IceZone {
    constructor(x, y, maxR = 60, duration = 60, owner) {
        this.x = x; this.y = y;
        this.r = 0;
        this.maxR = maxR;
        this.lifeTime = duration;
        this.active = true;
        this.owner = owner;
    }
    update() {
        if (!this.active) return;
        if (this.r < this.maxR) this.r += 2;
        this.lifeTime--;
        if (this.lifeTime <= 0) this.active = false;

        let enemies = [p1, p2].filter(p => p.id !== this.owner.id);
        enemies.forEach(p => {
            let d = Math.hypot(this.x - (p.x + p.w / 2), this.y - (p.y + p.h / 2));
            if (d < this.r) {
                p.slowTimer = 10;

                // Evo 2: Vung bang gay sat thuong
                if (this.owner.hasUpgrade('evo_ice_2') && this.lifeTime % 30 === 0) {
                    if (p.weapon === 'the_strongest') {
                        p.takeDamage(0.25, this.owner, { isEnvironmental: true });
                    } else if (p.shield > 0) {
                        p.shield--;
                    } else if (p.hp > 1) {
                        p.hp = Math.max(1, p.hp - 0.5);
                    }
                }

                if (this.owner.hasUpgrade('evo_ice_1')) {
                    p.coldStack++;
                    if (p.coldStack >= 100) {
                        p.freezeTimer = 30;
                        p.coldStack = 0;
                    }
                }
            }
        });
    }
    draw() {
        if (!this.active) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 255, 0.3)`;
        ctx.fill();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

class Beam {
    constructor(x, y, w, h, ownerId, isEvo) {
        this.x = x; this.y = y;
        this.w = w; this.h = h;
        this.ownerId = ownerId;
        this.isEvo = isEvo;
        this.lifeTime = isEvo ? 120 : 10;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.lifeTime--;
        if (this.lifeTime <= 0) this.active = false;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        const shake = (Math.random() - 0.5) * 4;
        ctx.fillStyle = "white";
        ctx.fillRect(this.x + shake, this.y, this.w, this.h);
        ctx.shadowBlur = 15;
        ctx.shadowColor = (this.ownerId === 1) ? "#3498db" : "#e74c3c";
        ctx.fillStyle = (this.ownerId === 1) ? "rgba(52, 152, 219, 0.5)" : "rgba(231, 76, 60, 0.5)";
        ctx.fillRect(this.x + shake - 5, this.y, this.w + 10, this.h);
        ctx.restore();
    }
}

class Player {
    constructor(id, color) {
        this.id = id; this.color = color;
        this.upgrades = [];
        this.upgradeLevel = 0;
        this.kbX = 0;
        this.kbY = 0;
        this.kbFromRed = false;
        this.maxHp = 6;
        this.hp = 6;
        this.damage = 1;
        this.maxAmmo = 5;
        this.ammo = 5;
        this.shield = 0;
        this.bullets = [];
        this.trailHistory = [];
    }

    hasUpgrade(id) { return this.upgrades.includes(id); }
    addUpgrade(moduleId) { this.upgrades.push(moduleId); }

    onCollectAmmoCrate(crate = null) {
        if (this.weapon === 'six_barrel') {
            this.heat = Math.max(0, (this.heat || 0) - 50);
            if (this.heat <= 50) this.isOverheated = false;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "HẠ NHIỆT -50% ❄", "#00ffff", 12);
        } else if (this.weapon === 'water_gun') {
            this.energy = Math.min(this.maxEnergy || 100, (this.energy || 0) + 50);
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "+50 NƯỚC 💧", "#00bfff", 12);
        } else if (this.weapon === 'furnace') {
            this.energy = Math.min(this.maxEnergy || 100, (this.energy || 0) + 50);
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "+50 NHIỆT LƯỢNG 🔥", "#ff6600", 12);
        } else if (this.weapon === 'the_strongest') {
            this.chuLuc = Math.min(this.maxChuLuc || 100, (this.chuLuc || 0) + 50);
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "+50 CHÚ LỰC ✨", "#00ffff", 12);
        } else if (this.weapon === 'sukuna') {
            this.cursedEnergy = Math.min(100, (this.cursedEnergy || 0) + 50);
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "+50 CHÚ LỰC 🩸", "#e74c3c", 12);
        } else if (this.weapon === 'storm') {
            this.stormChargeTimer = Math.min(480, (this.stormChargeTimer || 0) + 240);
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "+50% TỤ PHONG 🌀", "#2ecc71", 12);
        } else if (this.weapon === 'tank') {
            this.shield = (this.shield || 0) + 1;
            this.tankDashCooldown = 0;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "+1 KHIÊN TÔNG XE 🛡", "#e67e22", 12);
        } else if (this.weapon === 'van_kiem') {
            this.stanceSwordsAccumulated = Math.min(8, (this.stanceSwordsAccumulated || 0) + 4);
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "+4 KIẾM KHÍ ⚔", "#9b59b6", 12);
        } else if (this.weapon === 'wind_slash') {
            this.chargeLevel = 7;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "ĐẦY KIẾM KHÍ 🗡", "#f1c40f", 12);
        } else if (this.weapon === 'thunder') {
            this.thunderSpears = 3;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "+3 LÔI PHONG THƯƠNG ⚡", "#ffff00", 12);
        } else if (this.weapon === 'aaa') {
            this.ammo = Math.min(5, (this.ammo || 0) + 2);
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "+2 PHÁO CỐI 💣", "#e67e22", 12);
        } else {
            this.ammo = this.maxAmmo;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "NẠP ĐẦY ĐẠN 🎯", "#e67e22", 12);
        }

        if (this.weapon === 'evolution') {
            this.onEvolutionCrateEat('ammo');
        }
    }

    onEvolutionCrateEat(type) {
        if (this.weapon !== 'evolution') return;
        this.evolutionPermanentBonus = this.evolutionPermanentBonus || { hp: 0, dmg: 0, ammo: 0, speed: 0, ammoCrates: 0 };
        let mult = this.hasUpgrade('evo_evo_1') ? 1.3 : 1.0;

        if (type === 'hp') {
            let gain = 0.5 * mult;
            this.evolutionPermanentBonus.hp += gain;
            this.maxHp += gain;
            this.hp = Math.min(this.maxHp, this.hp + gain);
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, `TIẾN HÓA: +${gain.toFixed(2)} HP! 🧬`, "#2ecc71", 12);
        } else if (type === 'dmg') {
            let gain = 0.125 * mult;
            this.evolutionPermanentBonus.dmg += gain;
            this.damage += gain;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, `TIẾN HÓA: +${gain.toFixed(3)} DMG! 🧬`, "#9b59b6", 12);
        } else if (type === 'ammo') {
            this.evolutionPermanentBonus.ammoCrates = (this.evolutionPermanentBonus.ammoCrates || 0) + 1;
            if (this.evolutionPermanentBonus.ammoCrates >= 3) {
                this.evolutionPermanentBonus.ammoCrates -= 3;
                let gain = Math.round(2 * mult);
                this.evolutionPermanentBonus.ammo += gain;
                this.maxAmmo += gain;
                this.ammo += gain;
                if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, `TIẾN HÓA: +${gain} ĐẠN! 🧬`, "#e67e22", 13);
            } else {
                if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, `TIẾN HÓA: ĐẠN (${this.evolutionPermanentBonus.ammoCrates}/3) 🧬`, "#e67e22", 11);
            }
        } else if (type === 'boom') {
            let hpGain = 1.0 * mult;
            let dmgGain = 0.25 * mult;
            this.evolutionPermanentBonus.hp += hpGain;
            this.maxHp += hpGain;
            this.hp = Math.min(this.maxHp, this.hp + hpGain);
            this.evolutionPermanentBonus.dmg += dmgGain;
            this.damage += dmgGain;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, `TIẾN HÓA NỔ: +${hpGain.toFixed(1)} HP & +${dmgGain.toFixed(2)} DMG! 🧬`, "#e74c3c", 13);
        } else if (type === 'shield') {
            let hpGain = 0.25 * mult;
            let ammoGain = Math.round(1 * mult);
            this.evolutionPermanentBonus.hp += hpGain;
            this.maxHp += hpGain;
            this.evolutionPermanentBonus.ammo += ammoGain;
            this.maxAmmo += ammoGain;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, `TIẾN HÓA KHIÊN: +${hpGain.toFixed(2)} HP & +${ammoGain} ĐẠN! 🧬`, "#3498db", 12);
        } else if (type === 'coin') {
            let hpGain = 0.25 * mult;
            let dmgGain = 0.05 * mult;
            this.evolutionPermanentBonus.hp += hpGain;
            this.maxHp += hpGain;
            this.evolutionPermanentBonus.dmg += dmgGain;
            this.damage += dmgGain;
            let coinBonus = 15;
            if (this.id === 1) gameState.p1Coins += coinBonus; else gameState.p2Coins += coinBonus;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, `TIẾN HÓA: +$15, +${hpGain.toFixed(2)} HP & +${dmgGain.toFixed(2)} DMG! 🧬`, "#f1c40f", 12);
        } else if (type === 'truck') {
            let hpGain = 1.0 * mult;
            let dmgGain = 0.5 * mult;
            let spdGain = 0.05 * mult;
            this.evolutionPermanentBonus.hp += hpGain;
            this.maxHp += hpGain;
            this.hp = Math.min(this.maxHp, this.hp + hpGain);
            this.evolutionPermanentBonus.dmg += dmgGain;
            this.damage += dmgGain;
            this.evolutionPermanentBonus.speed += spdGain;
            this.speed += spdGain;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 18, `SCAVENGER DIỆT XE TIỀN: +${hpGain.toFixed(1)} HP, +${dmgGain.toFixed(2)} DMG, +${spdGain.toFixed(2)} SPEED! 🧬⚡`, "gold", 13);
        } else if (type === 'mimic') {
            let spdGain = 0.05 * mult;
            this.evolutionPermanentBonus.speed += spdGain;
            this.speed += spdGain;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, `MIMIC TIẾN HÓA: +${spdGain.toFixed(2)} SPEED! 🧬`, "#00ffcc", 12);
        }
    }

    fireOwnerSubAoE(type, upg) {
        let enemy = (this.id === 1) ? p2 : p1;
        let baseDirY = (this.id === 1) ? -1 : 1;
        let vy = baseDirY * 4.5;
        let vx = 0;
        if (upg['inv_ngam'] && enemy) {
            let dx = (enemy.x + enemy.w / 2) - (this.x + this.w / 2);
            vx = Math.max(-1.5, Math.min(1.5, dx * 0.012));
        }
        this.bullets.push({
            x: this.x + this.w / 2 - 5,
            y: this.y + (baseDirY > 0 ? this.h : -5),
            w: 10, h: 10,
            vx: vx, vy: vy,
            dmg: 1.5,
            owner: this,
            specialType: type,
            isInventorBullet: true,
            hitIds: [],
            bounceCount: 0,
            active: true
        });
        soundSystem.playShoot('cannon');
    }

    fireOwnerSubSMG() {
        let baseVy = (this.id === 1) ? -6 : 6;
        for (let i = 0; i < 12; i++) {
            let spreadVx = (i - 5.5) * 0.6;
            this.bullets.push({
                x: this.x + this.w / 2 - 2,
                y: this.y + (baseVy > 0 ? this.h : -2),
                w: 4, h: 4,
                vx: spreadVx, vy: baseVy,
                dmg: 0.4,
                owner: this,
                isInventorBullet: true,
                hitIds: [],
                bounceCount: 0,
                active: true
            });
        }
        soundSystem.playShoot('normal');
    }

    clearEnemyBulletsInRadiusOwner(radius) {
        let enemy = (this.id === 1) ? p2 : p1;
        if (!enemy || !enemy.bullets) return;
        let cleared = false;
        enemy.bullets.forEach(b => {
            if (b.active && Math.hypot(b.x - (this.x + this.w / 2), b.y - (this.y + this.h / 2)) < radius) {
                b.active = false;
                cleared = true;
                explosions.push(new Explosion(b.x, b.y, 14, 'white', 0, this));
            }
        });
        if (cleared) soundSystem.playShieldBreak();
    }

    takeDamage(amount, attacker = null, options = {}) {
        if (this.hp <= 0 || gameState.phase !== 'playing') return 0;

        // Practice Bot God Mode (Bất tử cho Bot trong phòng luyện tập)
        if (this.id === 2 && typeof botAI !== 'undefined' && botAI.enabled && botAI.isGodMode) {
            this.hp = this.maxHp;
            addFloatingText(this.x + this.w / 2, this.y - 10, "GODMODE 🛡️", "#ffd700", 14);
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, "#ffd700", 8);
            if (soundSystem && !soundSystem.muted) soundSystem.playHit();
            return 0;
        }

        // 1. Invincibility
        if (this.invincibleTimer > 0 && !options.ignoreInvincible) {
            addFloatingText(this.x + this.w / 2, this.y - 10, "IMMUNE", "#3498db", 13);
            return 0;
        }

        // 2. Ghost Phasing
        if (this.weapon === 'ghost' && this.isGhostActive && !options.isEnvironmental) {
            addFloatingText(this.x + this.w / 2, this.y - 10, "PHASED", "#bdc3c7", 13);
            return 0;
        }

        // Thunder Invulnerability & Shield
        if (this.weapon === 'thunder' && this.thunderIsSlashing) {
            return 0; // i-frame during Trảm Lôi Liên Hoàn
        }
        if (this.weapon === 'thunder' && (this.thunderShieldHits || 0) > 0) {
            this.thunderShieldHits--;
            addFloatingText(this.x + this.w / 2, this.y - 10, `LÔI THẦN KHIÊN (${this.thunderShieldHits})! ⚡`, "#ffff00", 14);
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, "#ffff00", 12);
            if (soundSystem && !soundSystem.muted) soundSystem.playHit();
            return 0;
        }

        // Magnet Polar Dash Invulnerability
        if (this.weapon === 'magnet' && this.isPolarDashing) {
            return 0; // i-frame during Polar Dash
        }

        // Bow (Cung) - Nội tại Nhạy Bén: Tự động né 1 đòn đánh mỗi 8s (5s Full Evo)
        if (this.weapon === 'cung' && this.bowDodgeReady && !options.isEnvironmental) {
            this.bowDodgeReady = false;
            let cd = (this.hasUpgrade('evo_cung_1') && this.hasUpgrade('evo_cung_2')) ? 300 : 480;
            this.bowDodgeCooldown = cd;
            addFloatingText(this.x + this.w / 2, this.y - 10, "NÉ ĐÒN! 💨", "#00ffcc", 14);
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, "#00ffcc", 10);
            if (soundSystem && !soundSystem.muted) soundSystem.playHit();
            return 0;
        }

        // Gojo: Đang gồng niệm Chú Lực / Lãnh Địa mà ăn sát thương -> Bị ngắt niệm!
        if (this.weapon === 'the_strongest' && (this.gojoChargeTimer || 0) > 0) {
            this.gojoChargeTimer = 0;
            addFloatingText(this.x + this.w / 2, this.y - 15, "NIỆM CHÚ BỊ NGẮT! 💥", "#00ffff", 14);
        }

        // Sukuna: Đang gồng Lãnh Địa / Phản Chuyển mà ăn sát thương -> Bị phá niệm!
        if (this.weapon === 'sukuna' && (this.sukunaChargeTimer || 0) > 0) {
            this.sukunaChargeTimer = 0;
            this.domainActive = false;
            addFloatingText(this.x + this.w / 2, this.y - 15, "LÃNH ĐỊA BỊ PHÁ! 💥", "#e74c3c", 14);
        }

        // 3. Sword Shield (Blade God / Van Kiem)
        if (this.swordShieldActive && !options.isPiercing) {
            this.swordShieldHits--;
            if (this.swordShieldHits <= 0) {
                this.swordShieldActive = false;
            }
            addFloatingText(this.x + this.w / 2, this.y - 10, "PARRIED", "#f1c40f", 14);
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, "#f1c40f", 10);
            soundSystem.playHit();
            return 0;
        }

        // 4. Steel Shield
        if (this.shield > 0 && !options.bypassShield) {
            this.shield--;
            addFloatingText(this.x + this.w / 2, this.y - 10, "BLOCKED", "#00f0ff", 14);
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, "#00f0ff", 12);
            triggerScreenShake(5, 8);
            soundSystem.playShieldBreak();
            return 0;
        }

        // 5. Gojo Cursed Energy Absorption (Infinity Barrier - Blocks ALL damage while Chu Luc > 0)
        if (this.weapon === 'the_strongest') {
            this.chuLucRegenCooldown = 150; // Khóa hồi phục Chú Lực 2.5s khi nhận hit
            if (this.chuLuc > 0) {
                let chuLucCost = amount * 25; // 25 Chu Luc per 1 damage
                this.chuLuc = Math.max(0, this.chuLuc - chuLucCost);
                addFloatingText(this.x + this.w / 2, this.y - 10, "INFINITY", "#00f0ff", 14);
                spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, "#00f0ff", 10);
                soundSystem.playShieldBreak();
                triggerScreenShake(3, 6);
                explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 35, 'rgba(0, 240, 255, 0.35)', 0, this));
                return 0; // Completely absorbed!
            }
        }

        // Sukuna CE Lock (Nhận sát thương -> 1s sau mới hồi phục Chú Lực)
        if (this.weapon === 'sukuna') {
            this.sukunaCeLockTimer = 60;
        }

        // Shadow Hunter: Giảm 50% sát thương nhận vào ở Local play khi đang tàng hình
        if (this.weapon === 'shadow_hunter' && this.stealthActive && !options.isEnvironmental) {
            const isOnline = (typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline);
            if (!isOnline) {
                amount *= 0.5;
            }
        }

        if (this.permanentVulnerability) {
            amount *= (1 + this.permanentVulnerability);
        }

        let actualDmg = Math.max(0.05, amount);

        // 6. Basic Evo 2 Revive
        if (this.hasUpgrade('evo_basic_2') && this.hp - actualDmg <= 0 && !this.revived) {
            this.hp = Math.max(1, Math.round(this.maxHp / 2));
            this.revived = true;
            this.invincibleTimer = 180;
            this.damage *= 3;
            this.shield = 5;
            this.speed += 2;
            this.ammo = 10;
            addFloatingText(this.x + this.w / 2, this.y - 20, "REVIVED!", "#ffd700", 18);
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 100, 'gold', 0, this));
            soundSystem.playRevive();
            triggerScreenShake(10, 15);
            return actualDmg;
        }

        // 5.1. GENIUS MECHA DAMAGE ABSORPTION
        if (this.weapon === 'genius' && this.isPilotingMecha) {
            // Barrier Shield (Mode 5): 2 NL per 1 damage
            if (this.mechaMode === 5 && (this.mechaEnergy || 0) > 0) {
                let energyNeeded = actualDmg * 2;
                if (this.mechaEnergy >= energyNeeded) {
                    this.mechaEnergy -= energyNeeded;
                    addFloatingText(this.x + this.w / 2, this.y - 12, "LÁ CHẮN TỪ TRƯỜNG ⚡", "#00e5ff", 13);
                    spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, "#00e5ff", 8);
                    return 0;
                } else {
                    let absorbed = this.mechaEnergy / 2;
                    actualDmg -= absorbed;
                    this.mechaEnergy = 0;
                }
            }

            // Virtual Armor absorption
            if ((this.mechaVirtualArmor || 0) > 0) {
                if (this.mechaVirtualArmor >= actualDmg) {
                    this.mechaVirtualArmor -= actualDmg;
                    addFloatingText(this.x + this.w / 2, this.y - 12, `-${actualDmg.toFixed(1)} GIÁP ẢO 🛡️`, "#ffd700", 13);
                    return 0;
                } else {
                    actualDmg -= this.mechaVirtualArmor;
                    this.mechaVirtualArmor = 0;
                }
            }

            // Mecha HP absorption
            this.mechaHp = (this.mechaHp || 0) - actualDmg;
            let displayVal = actualDmg >= 1 ? (Math.round(actualDmg * 10) / 10).toString() : actualDmg.toFixed(1);
            addFloatingText(this.x + this.w / 2, this.y - 12, `-${displayVal} ROBOT HP 🤖`, "#ff9800", 14);
            soundSystem.playHit();
            triggerScreenShake(Math.min(10, 2 + actualDmg * 2), 10);

            if (this.mechaHp <= 0) {
                this.ejectMecha();
            }
            return actualDmg;
        }

        // 5.2. NECROMANCER SOUL SHIELD (LINH GIÁP)
        if (this.weapon === 'necromancer') {
            this.necroRegenCooldown = 180; // Khóa hồi Linh Hồn trong 3s (180 ticks) khi nhận sát thương
            if ((this.currentSouls || 0) > 0) {
                let soulAbsorb = Math.min(this.currentSouls, actualDmg);
                this.currentSouls -= soulAbsorb;
                actualDmg -= soulAbsorb;
                let sDisplay = soulAbsorb >= 1 ? (Math.round(soulAbsorb * 10) / 10).toString() : soulAbsorb.toFixed(1);
                addFloatingText(this.x + this.w / 2, this.y - 14, `-${sDisplay} LINH GIÁP 👻`, "#00e676", 13);
                spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, "#00e676", 8);
                if (actualDmg <= 0) {
                    soundSystem.playHit();
                    return soulAbsorb;
                }
            }
        }

        this.hp -= actualDmg;

        // Visual floating text & screen shake
        let displayVal = actualDmg >= 1 ? (Math.round(actualDmg * 10) / 10).toString() : actualDmg.toFixed(1);
        addFloatingText(this.x + this.w / 2, this.y - 10, "-" + displayVal, "#ff0055", 15);
        triggerScreenShake(Math.min(10, 2 + actualDmg * 2), 10);
        soundSystem.playHit();
        spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, "#ff0055", 6);

        if (this.hp <= 0) {
            this.hp = 0;
            this.ghostHp = 0;
            let winId = attacker ? attacker.id : (this.id === 1 ? 2 : 1);
            if (gameState.phase === 'playing') {
                triggerFatalCinematic(winId, this);
            }
        }
        return actualDmg;
    }
    firePhantom(ratio) {
        let dirY = (this.id === 1) ? -1 : 1;
        // Tốc độ hư ảnh cực nhanh
        let speed = 30;

        this.bullets.push({
            x: this.x, y: this.y,
            w: this.w, h: this.h, // Kích thước bằng người chơi
            vx: 0, vy: dirY * speed,
            dmg: 2 + (ratio * 4), // Dame va chạm của bóng
            owner: this,
            isStormPhantom: true, // Cờ nhận biết
            chargeRatio: ratio,   // Lưu lực mang theo
            hitIds: [],           // Để xuyên thấu không hit 1 mục tiêu nhiều lần
            distanceTraveled: 0,  // Theo dõi quãng đường
            maxDistance: canvas.height * 0.8 // Bay tối đa 80% màn hình thì dừng
        });
    }
    fireWindBlade(ratio, isAutoFull) {
        // [NERF] Size cơ bản nhỏ hơn
        let baseSize = 20 + (ratio * 40); // 20 -> 60 (Cũ là 20 -> 80)

        // [BUFF] Nếu là Auto-Full thì to hơn hẳn
        if (isAutoFull) baseSize = 90;

        let spd = 4.2 - (ratio * 1.2); // Phong trảm bay chậm và đầm tay

        // [NERF] Dame giảm xuống 0.5 -> 1.0
        let finalDmg = 0.5 + (ratio * 0.5);
        if (isAutoFull) finalDmg = 1.2; // Auto full được thưởng thêm chút dame

        let dirY = (this.id === 1) ? -1 : 1;
        let startY = (this.id === 1) ? this.y - baseSize : this.y + this.h;

        this.bullets.push({
            x: this.x + this.w / 2 - baseSize / 2, y: startY,
            w: baseSize, h: baseSize / 2,
            vx: 0, vy: dirY * spd,
            dmg: finalDmg, owner: this,
            isWindBlade: true,
            rotation: 0,
            hitIds: [],
            isPiercing: true // Phong trảm luôn xuyên
        });
    }




    // Hàm bắn bóng hư ảnh (Storm Evo 2 Passive)
    fireStormShadow() {
        let chargeSim = 0.2 + Math.random() * 0.6; // Random lực 2s-4s tương đương ratio 0.25 - 0.5
        let size = 40;
        let dirY = (this.id === 1) ? -1 : 1;

        this.bullets.push({
            x: this.x, y: this.y, w: this.w, h: this.h,
            vx: 0, vy: dirY * 15, // Lao rất nhanh
            dmg: 2 + chargeSim * 2,
            owner: this,
            isStormShadow: true, // Cờ đánh dấu để vẽ bóng
            activeTime: 30 // Chỉ tồn tại ngắn
        });
    }

    getSpeed() {
        let currentSpeed = this.speed;
        if (this.slowTimer > 0) currentSpeed *= 0.5;
        if (this.acidBurnTimer > 0) currentSpeed *= 0.75;
        if (this.acidZoneSlow > 0) currentSpeed *= 0.75;
        if (this.weapon === 'genius' && this.isPilotingMecha) {
            let spdBonus = ((this.geniusUpgrades && this.geniusUpgrades['gen_speed']) || 0) * 0.15;
            currentSpeed *= 0.65 * (1 + spdBonus);
        }
        if (this.weapon === 'van_kiem' && this.isInSwordStance) {
            currentSpeed = this.hasUpgrade('evo_vk_2') ? 1.0 : 0;
        }
        if (this.weapon === 'sniper') {
            currentSpeed *= 0.5;
        }
        if (this.weapon === 'mirror' && this.mirrorBuffTimer > 0) {
            currentSpeed += this.hasUpgrade('evo_mirror_1') ? 3 : 1.5;
        }
        if (this.weapon === 'ghost' && this.isGhostActive) {
            currentSpeed *= 1.35;
        }
        return currentSpeed;
    }

    setupForNewRound() {
        // 1. CẤU HÌNH CƠ BẢN
        let baseStats = { hp: 6, dmg: 1, ammo: 5 };
        this.weapon = 'basic';
        const bodyIds = MODULES.BODY.map(m => m.id);
        const myBodyId = this.upgrades.find(u => bodyIds.includes(u));
        let modInfo = null;
        if (myBodyId) {
            this.weapon = myBodyId;
            modInfo = MODULES.BODY.find(m => m.id === myBodyId);
            if (modInfo && modInfo.stats) baseStats = { ...modInfo.stats };
        }

        // KÍCH THƯỚC XE DỰA TRÊN PHÂN NHÓM (Hitbox w & h)
        if (modInfo && modInfo.size) {
            this.w = modInfo.size.w;
            this.h = modInfo.size.h;
        } else {
            this.w = C.tankW;
            this.h = C.tankH;
        }

        this.speed = C.baseSpeed;
        if (modInfo && modInfo.stats && modInfo.stats.speedMult) {
            this.speed *= modInfo.stats.speedMult;
        }
        this.myBulletColor = (this.id === 1) ? '#3498db' : '#e74c3c';

        this.maxHp = baseStats.hp;

        // Thưởng máu cho xe to (Hitbox w > 30): Càng lớn cộng càng nhiều máu cho công bằng
        if (this.w > 30) {
            let sizeBonusHp = 0;
            if (this.w >= 38) sizeBonusHp = 5;
            else if (this.w >= 37) sizeBonusHp = 4;
            else if (this.w >= 36) sizeBonusHp = 3;
            else if (this.w >= 34) sizeBonusHp = 2;
            else if (this.w > 30) sizeBonusHp = 1;
            this.maxHp += sizeBonusHp;
        }

        this.damage = baseStats.dmg;
        this.maxAmmo = baseStats.ammo;
        this.bulletCount = 1;
        this.reloadTime = C.reloadTime;

        if (typeof gameState !== 'undefined' && gameState.currentMap === 'overdrive') {
            this.speed *= 1.35;
            this.reloadTime *= 0.5;
        }


        // 3. ÁP DỤNG CÁC NÂNG CẤP CHỈ SỐ (UPGRADES & EVOLUTIONS)

        // --- Money Tank Level Up ---
        if (this.weapon === 'money_tank' && this.upgradeLevel > 0) {
            this.maxHp += 1 * this.upgradeLevel;
            this.damage += 1.125 * this.upgradeLevel;
            this.maxAmmo += 1 * this.upgradeLevel;
            this.speed += 0.5;
        }

        // cung
        if (this.weapon === 'cung') {
            this.rainCD = 0;
            this.isDashing = false;
            this.dashTargetX = 0;
            this.dashTargetY = 0;
            this.bowIsCharging = false;
            this.bowChargeTimer = 0;
            this.crosshairRadius = 150;
            this.crosshairX = canvas.width / 2;
            this.crosshairY = canvas.height / 2;
            this.bowDodgeReady = true;
            this.bowDodgeCooldown = 0;

            // Full Evo: Trận mưa trên rơi xuống toàn map đầu trận
            let isFullEvo = this.hasUpgrade('evo_cung_1') && this.hasUpgrade('evo_cung_2');
            if (isFullEvo) {
                arrowRains.push(new ArrowRain(this, 0, 0, 0, true)); // isGlobal = true
            }
        }

        // shadow_hunter
        if (this.weapon === 'shadow_hunter') {
            this.speed *= 1.3;
            this.stealthActive = false;
            this.stealthTimer = 0;
            this.stealthCooldown = 0;
            this.stealthEmpowered = false;
            this.shadowTrapsPlaced = false;

            if (this.hasUpgrade('evo_sh_2')) {
                this.spawnShadowTraps();
            }
        }

        // shortgunATK
        if (this.weapon === 'shortgunATK') {
            this.speed *= 1.25;
            this.isShortgunDashing = false;
            this.shortgunDashState = 0;
            this.shortgunStartY = 0;
            this.shortgunDashSpeed = 22;
            this.shortgunTelegraphTimer = 0;
            this.shortgunDoubleTap = false;
            this.shortgunTargetX = 0;
            this.shortgunTargetY = 0;
            this.shortgunConeOriginX = 0;
            this.shortgunConeOriginY = 0;
            if (this.shortgunBonusMaxHp) this.maxHp += this.shortgunBonusMaxHp;
            if (this.shortgunBonusDmg) this.damage += this.shortgunBonusDmg;
        }

        // --- Full Evo & Basic Logic ---
        // SỬA LỖI: Gom logic Basic vào một chỗ để tránh cộng dồn sai
        if (this.weapon === 'basic') {
            // 1. Luôn cộng chỉ số cứng của Evo 1 trước (nếu có)
            if (this.hasUpgrade('evo_basic_1')) {
                this.maxHp += 2;
                this.damage *= 1.25;
            }

            // 2. Nếu có đủ 2 Evo -> Nhân sức mạnh theo Round (scale late game)
            if (this.hasUpgrade('evo_basic_1') && this.hasUpgrade('evo_basic_2')) {
                let multiplier = Math.pow(1.25, gameState.round - 1);
                this.maxHp = Math.ceil(this.maxHp * multiplier);
                this.damage *= multiplier;

                // [FIX LỖI CRASH]: Kiểm tra xem UI có tồn tại không rồi mới đổi màu
                let statsUI = document.getElementById(`p${this.id}-stats`);
                if (statsUI) {
                    statsUI.style.color = "gold";
                }
            }
        } else {
            // Các vũ khí khác có Evo 1 tăng chỉ số (nếu có logic chung thì để đây)
            // Lưu ý: Đoạn code cũ của bạn có dòng `if (this.hasUpgrade('evo_basic_1'))` nằm trôi nổi
            // Nếu ý bạn là Evo Basic 1 tác dụng lên TẤT CẢ vũ khí thì giữ lại, 
            // còn nếu chỉ tác dụng lên xe Basic thì logic if/else ở trên là đúng.
            // Giả sử Evo Basic 1 chỉ cho xe Basic, ta bỏ dòng trôi nổi đi.
        }

        // --- Weapon Specific Stat Modifiers ---
        if (this.hasUpgrade('evo_shot_1')) { this.bulletCount = 5; }
        if (this.hasUpgrade('evo_shot_2')) { this.maxAmmo = 4; }
        if (this.hasUpgrade('evo_smg_1')) { this.maxAmmo = 26; this.damage *= 0.85; }
        if (this.hasUpgrade('evo_smg_2')) { this.maxAmmo = 26; this.reloadTime = 400; }
        if (this.hasUpgrade('evo_lazer_a_2')) { this.damage *= 1.5; }
        if (this.hasUpgrade('evo_lazer_c_2')) { this.reloadTime = 1000; }
        if (this.weapon === 'portal') this.speed += 1.5;

        // --- KIẾM TÔN (BLADE GOD) ---
        if (this.weapon === 'blade_god') {
            this.bladeShotCount = 0; // Đếm số lần bắn để gọi Phá Thiên
            this.huVoStack = 0; // Tích điểm Hư Vô cho kẻ địch
            this.swordShieldActive = false;
            this.swordShieldHits = 0;
            this.swordShieldTimer = 0;
        }
        // Thêm vào phần setup vũ khí của Player

        if (this.weapon === 'the_strongest') {
            this.maxHp = 1; this.hp = 1;
            this.damage = 2;
            this.maxAmmo = 0; this.ammo = 0;

            let hasSixEyes = this.hasUpgrade('evo_strongest_2');
            this.maxChuLuc = hasSixEyes ? 85 : 75;
            this.chuLuc = this.maxChuLuc;
            this.chuLucRegenRate = hasSixEyes ? 0.20 : 0.12;
            this.chuLucRegenCooldown = 0;

            this.gojoChargeTimer = 0;
            this.usedBlue = false;
            this.usedRed = false;
            this.canshotActive = true;
        }
        // --- MAGICIAN LOGIC ---
        this.confusionStacks = 0; // Tầng Loạn Ảnh
        this.vulnerableStacks = 0; // Tầng Suy Yếu (Debuff Stack)
        this.confusionTimer = 0;
        this.inputDelayQueue = [];
        if (this.weapon === 'magician') {
            this.illusions = []; // Mảng chứa các phân ảnh
            this.magicianCharge = 0; // Thời gian giữ nút s
            this.invisTimer = 0; // Thời gian tàng hình
            this.magicianSpeedBuff = 0; // Buff tốc khi hoán đổi

            // Trạng thái Debuff trên người (Để gán cho địch khi bắn trúng)
            this.confusionStacks = 0; // Tầng Loạn Ảnh
            this.vulnerableStacks = 0; // Tầng Suy Yếu (Debuff Stack)
            this.confusionTimer = 0; // Thời gian duy trì đảo ngược phím
            this.confusionActive = false; // Trạng thái đang bị đảo phím

            this.inputDelayQueue = []; // Hàng đợi lệnh delay (Tầng 4)
            this.jumpscareTimer = 0; // Kích hoạt bóng ma hù dọa

            this.fakeCrates = []; // Hòm ảo
            this.fakeBullets = []; // Đạn ảo
        }

        // --- KIẾM TRẬN (VAN KIEM) ---
        if (this.weapon === 'van_kiem') {
            this.speed += 2;
            this.maxAmmo = 999; this.ammo = 999;
            this.swordChargeTimer = 0;
            this.isInSwordStance = false;
            this.totalSwordsFired = 0;
            this.stanceSwordsAccumulated = 0; // Lưu số kiếm gọi ra trong Kiếm Thế
            this.autoSwordTimer = 0; // Cho nội tại Mưa Kiếm
            this.swordShieldActive = false;
            this.swordShieldHits = 0;
        }
        // --- SNIPER LOGIC ---
        if (this.weapon === 'sniper') {
            this.speed *= 0.75;
            this.sniperReloading = false;
            this.sniperReloadTimer = 0;
            this.sniperChargeTimer = 0;
            this.sniperWallCooldown = 0;

            // [FIX CỦA BẠN] Kiểm tra nếu map chưa có Tường Bất Tử nào thì mới tạo (Tránh 2 Sniper sinh ra 2 tường)
            let hasImmortalWall = sniperWalls.some(w => w.isImmortal);
            if (!hasImmortalWall) {
                sniperWalls.push(new SniperWall(canvas.width / 2 - 30, canvas.height / 2 - 10, this, true));
            }
        }
        // --- INVENTOR LOGIC ---
        if (this.weapon === 'inventor') {
            this.speed *= 0.8;
            this.components = this.components || 0;
            this.invUpgrades = this.invUpgrades || {};

            // Áp dụng các nâng cấp shop đã mua
            if (this.invUpgrades['inv_giap']) { this.maxHp += 1; this.hp += 1; }
            if (this.invUpgrades['inv_tangcuong']) { this.maxAmmo += 2; this.ammo = this.maxAmmo; }
            if (this.invUpgrades['inv_bodam']) { this.speed *= (1 + 0.1 * (this.invUpgrades['inv_bodam'] || 0)); }

            let isFullEvo = this.isFullEvoInventor || (this.hasUpgrade('evo_inv_1') && this.hasUpgrade('evo_inv_2') && this.invUpgrades['inv_full_evo']);

            this.drones = [];
            if (isFullEvo) {
                // 4 Drones cùng lúc trên sân
                this.drones.push(new InventorDrone(this, -75));
                this.drones.push(new InventorDrone(this, -25));
                this.drones.push(new InventorDrone(this, 25));
                this.drones.push(new InventorDrone(this, 75));
            } else if (this.hasUpgrade('evo_inv_2')) {
                // 2 Drones
                this.drones.push(new InventorDrone(this, -35));
                this.drones.push(new InventorDrone(this, 35));
            } else {
                // 1 Drone mặc định
                this.drones.push(new InventorDrone(this, 0));
            }

            this.isOverclocking = false;
            this.overclockTimer = 0;
            this.overclockDurationTimer = 0;
            this.stillTimer = null;
            this.luoiDienSanSang = false;
            this.lastLuoiDienTrigger = 0;
            this.crateShieldActive = false;
            this.crateShieldExpireTimer = 0;
            this.lastOwnerPhao = 0;
            this.lastOwnerSmg = 0;
            this.lastOwnerBang = 0;
            this.lastOwnerLua = 0;
            this.lastOwnerTuGio = 0;
            this.lastOwnerAutoShot = 0;
        }

        // --- PARADOX LOGIC ---
        if (this.weapon === 'paradox') {
            this.paradoxHistory = [];      // Lưu trữ {x, y, hp, shot} trong 3 giây (180 frame)
            this.enemyHistory = [];        // Lưu trữ {x, y} của địch trong 3 giây
            this.paradoxCooldown = 0;      // Hồi chiêu 12s hoặc 7s
            this.paradoxCharge = 0;        // Tụ lực giữ nút

            this.enemyTimeMarks = 0;       // Số tầng ấn thời gian trên người địch
            this.enemyStationaryShadow = null; // Bóng đứng yên (Evo 1)
        }
        // --- AAA Logic ---
        if (this.weapon === 'aaa') {
            this.speed *= 0.6;
            this.maxAmmo = 1;
            this.reloadTime = 3000;
            this.aaaAutoInterval = 240; // Giảm tần suất mưa đạn pháo
            if (this.hasUpgrade('evo_aaa_2')) { this.reloadTime = 2500; }
            if (this.hasUpgrade('evo_aaa_1') && this.hasUpgrade('evo_aaa_2')) {
                this.aaaAutoInterval = 200;
                this.reloadTime = 1500;
            }
        }

        // --- ENGINEER LOGIC ---
        if (this.weapon === 'engineer') {
            this.turretTimer = 0;
            this.smartTurretCharge = 0;
            this.engineerPressFrames = 0;
            this.isOverloaded = false;
            this.overloadDuration = 0;
            this.overloadCooldown = 0;
        }

        // --- THUNDER LOGIC ---
        if (this.weapon === 'thunder') {
            this.speed *= 1.3;
            this.thunderSpears = 3;
            this.thunderHoldFrames = 0;
            this.thunderLoiMinhStacks = 0;
            this.thunderLoiMinhTimer = 0;
            this.thunderShieldHits = 0;
            this.thunderIsRecallWarning = false;
            this.thunderRecallWarningTimer = 0;
            this.thunderIsSlashing = false;
            this.thunderSlashIndex = 0;
            this.thunderSlashTimer = 0;
            this.thunderOriginPos = null;
            this.thunderConsumedSpears = 0;
            this.thunderActionCooldown = 0;
            this.thunderRaycastWarningTimer = 0;
        }

        // --- MAGNET LOGIC ---
        if (this.weapon === 'magnet') {
            this.magnetPolarity = 1; // 1 = Dương (+), -1 = Âm (-)
            this.magnetHoldFrames = 0;
            this.isPolarDashing = false;
            this.polarDashTarget = null;
        }

        // --- EVOLUTION LOGIC ---
        if (this.weapon === 'evolution') {
            this.evolutionPermanentBonus = this.evolutionPermanentBonus || { hp: 0, dmg: 0, ammo: 0, speed: 0, ammoCrates: 0 };
            if (this.hasUpgrade('evo_evo_1') && this.hasUpgrade('evo_evo_2')) {
                this.evolutionPermanentBonus.hp += 1.5;
                this.evolutionPermanentBonus.dmg += 0.5;
                this.evolutionPermanentBonus.ammo += 2;
                this.evolutionPermanentBonus.speed += 0.1;
                if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 20, "TIẾN HÓA TỘT CÙNG! 🧬✨", "gold", 14);
            }

            this.maxHp += this.evolutionPermanentBonus.hp;
            this.hp = this.maxHp;
            this.damage += this.evolutionPermanentBonus.dmg;
            this.maxAmmo += this.evolutionPermanentBonus.ammo;
            this.ammo = this.maxAmmo;
            this.speed += this.evolutionPermanentBonus.speed;
        }

        // ---Âm Dương sư Logic ---
        if (this.weapon === 'am_duong_su') {
            this.isAmChu = true; // Bắt đầu bằng Âm chú
        }



        // 5. KHỞI TẠO BIẾN RIÊNG CHO TỪNG VŨ KHÍ (WEAPON SPECIFIC VARS)
        // --- ENERGY SYSTEM (SÚNG NƯỚC & LÒ NUNG) ---
        this.maxEnergy = 100;
        this.energy = 100;
        this.energyChargeTimer = 0; // Bộ đếm giữ nút
        this.isSpraying = false;    // Trạng thái đang phun (Evo 1)
        this.energyUsedAcc = 0;     // Tích lũy năng lượng đã xài (Lò nung Evo 2)
        this.nextShotFireZone = false;

        // Quản lý Hiệu ứng bất lợi (Debuff) trên người chơi
        this.burnStacks = 0;
        this.burnTimer = 0;
        this.bindingCurseStacks = 0;
        this.bindingCurseTimer = 0;
        this.permanentSlow = 0;
        this.permanentVulnerability = 0;

        if (this.weapon === 'death_lock') {
            this.deathLockShotCount = 0;
            this.lastConfinementCageEndTime = 0;
        }

        if (this.weapon === 'creator') {
            this.creatorTurrets = [];
            this.creatorShield = null;
            this.creatorShieldCooldown = 0;
            this.creatorShieldHoldFrames = 0;
            this.creatorTurretTimer = 0;
            this.creatorRobotTimer = 0;
            this.creatorDrone = new CreatorDrone(this);
            this.creatorRobot = null;
        } else {
            this.creatorDrone = null;
            this.creatorRobot = null;
        }

        // --- SUKUNA LOGIC ---
        if (this.weapon === 'sukuna') {
            this.cursedEnergy = 80;          // Thanh Chú Lực (0 - 100)
            this.sukunaChargeTimer = 0;      // Thời gian giữ nút bắn (tính bằng frame)
            this.lastRctHealTime = 0;        // Đánh dấu thời điểm hồi máu Phản Chuyển gần nhất
            this.domainActive = false;       // Trạng thái bật Lãnh địa
            this.sukunaCeLockTimer = 0;      // Cooldown khóa hồi Chú Lực sau khi dính hit
            this.sukunaPassiveHealTimer = 0; // Hồi máu tự nhiên ngoài combat

            // THÊM 3 DÒNG NÀY ĐỂ TRACK NHÁT CHÉM THẾ GIỚI
            this.sukunaDomainUsed = false;   // Ghi nhận đã bật lãnh địa
            this.sukunaFugaCount = 0;        // Đếm số lần nổ Fuga
            this.worldCleaveTarget = null;   // Lưu mục tiêu đang bị ngắm
        }

        // --- 6 NÒNG (MINIGUN) ---
        if (this.weapon === 'six_barrel') {
            this.maxAmmo = 999;
            this.ammo = 999;
            this.heat = 0;              // 0 đến 100
            this.isOverheated = false;
            this.heatHoldFrames = 0;    // Đếm số frame giữ nút
            this.heatRestFrames = 0;    // Đếm số frame nhả nút
        }
        // --- MIRROR LOGIC ---
        if (this.weapon === 'mirror') {
            this.mirrorCharge = 0;
            this.mirrorCD = 0;
            this.mirrorBuffTimer = 0;
            this.speedBuffActive = false;
            this.enemyClone = null;      // Ảnh chiếu kẻ thù đứng yên
            this.shatteredClone = null;  // Ảnh chiếu tan vỡ (Full Evo)
        }

        // --- TANK LOGIC (Sắp xếp lại) ---
        if (this.weapon === 'tank') {
            this.speed *= 0.7; // Giảm tốc độ di chuyển thường
            this.dashState = 0;
            this.dashStartY = 0;
            this.passiveShieldTimer = 0;

            // Tính Dash Speed dựa trên Speed cuối cùng (sau khi đã cộng Feet)
            this.dashSpeed = 16 + (this.speed - (C.baseSpeed * 0.7)) * 2;

            // Full Evo Tank Bonus
            if (this.hasUpgrade('evo_tank_1') && this.hasUpgrade('evo_tank_2')) {
                this.maxHp += 15;
                this.dashSpeed += 8;
            }
        }

        // --- WIND SLASH ---
        if (this.weapon === 'wind_slash') {
            this.maxAmmo = 1;
            this.windShotCount = 0;
            this.windWallTimer = 0;
        }

        // --- STORM ---
        if (this.weapon === 'storm') {
            this.speed += 1.5;
            this.maxAmmo = 0;
            this.stormDashState = 0;
            this.stormChargeStart = 0;
            this.stormAutoChargeTimer = 0;
            this.stormMaxChargeTime = 14000; // 14 giây tự tụ lực (tăng mạnh từ 8s)
            this.stormChargeRatio = 0;
            this.stormShadowTimer = 0;
            this.stormShadowCooldown = 200 + Math.random() * 300;
            this.shield = 1;
            this.stormSlashDelay = 0;
            this.stormReturnPos = null;
            this.stormEcho = false;
        }

        // --- GHOST ---
        if (this.weapon === 'ghost') {
            this.speed += 2;
            this.ghostTimer = 0;
            this.isGhostActive = false;
            this.ghostActiveTimer = 0;
            this.ghostDuration = 120; // 2s hiệu lực
            this.ghostCooldown = 180; // 3s hồi chiêu

            if (this.hasUpgrade('evo_ghost_1')) {
                this.ghostDuration = 120;
                this.ghostCooldown = 120; // 2s hồi
            }
            if (this.hasUpgrade('evo_ghost_1') && this.hasUpgrade('evo_ghost_2')) {
                this.ghostDuration = 120;
                this.ghostCooldown = 90; // 1.5s hồi
            }
            this.phantomTimer = 0;
            this.hasPhantom = this.hasUpgrade('evo_ghost_2');
            this.posHistory = [];
        }
        // 4. ÁP DỤNG FEET (GIÀY/PHỤ KIỆN) - QUAN TRỌNG: Đặt trước logic tính Dash Tank
        const feetIds = MODULES.FEET.map(m => m.id);
        this.upgrades.forEach(uId => {
            if (feetIds.includes(uId)) {
                if (uId === 'speed') this.speed += 1.5;
                if (uId === 'armor') this.maxHp += 1;
                if (uId === 'damage') this.damage *= 1.25;
            }
        });

        // --- CÁC BIẾN CỜ & TIMER KHÁC ---
        this.bullets = [];
        this.chargeLevel = 0;
        this.lastShot = Date.now();
        this.lastReload = 0;
        this.revived = false;
        this.invincibleTimer = 0;
        this.nextShotExplosive = false;

        this.shield = (this.weapon === 'money_tank' && this.upgradeLevel >= 3) ? 1 : 0;
        if (this.weapon === 'tank') this.shield = 0; // Reset lại shield tank (sẽ tự hồi bằng passiveShieldTimer)

        // Silence Debuff
        this.silenceTimer = 0;

        // SMG Var
        this.dmgBuff = 0;
        this.smgSprayCount = 0;

        // Ice Vars
        this.slowTimer = 0;
        this.freezeTimer = 0;
        this.coldStack = 0;
        this.iceShotCount = 0;
        this.iceZoneTriggerCount = 0;
        this.iceAutoFreezeTimer = 0;

        // Portal Vars
        this.lastPortalBoost = 0;
        this.lastPortalFullBonus = 0;
        this.portalBulletSpeedBonus = 0;

        // Acid / Engi Vars
        this.acidShotCount = 0;
        this.acidBurnTimer = 0;
        this.turretTimer = 0;
        this.overloadCharge = 0;
        this.isOverloaded = false;
        this.overloadDuration = 0;
        this.aaaAutoTimer = 0;

        // Shadow Hunter & Shortgun & Motion Trail debuff / tracker resets
        this.blindTimer = 0;
        this.bleedTimer = 0;
        this.bleedInterval = 0;
        this.bleedDmg = 0;
        this.trailHistory = [];
        this.prevInpS = false;

        // Necromancer setup
        if (this.weapon === 'necromancer') {
            this.maxHp = 1;
            this.hp = 1;
            let armorBonus = (this.upgrades || []).filter(u => u === 'armor').length;
            let evo2Bonus = (this.hasUpgrade && this.hasUpgrade('evo_necro_2')) ? 4 : 0;
            this.maxSouls = 6 + armorBonus + evo2Bonus;
            this.currentSouls = this.maxSouls;
            this.lockedSouls = 0;
            this.necroRegenTimer = 0;
            this.necroRegenCooldown = 0;
            this.necroChargeFrames = 0;
            if (typeof necroMinions !== 'undefined') {
                necroMinions = necroMinions.filter(m => m.owner !== this);
            }
        }

        // Genius setup
        if (this.weapon === 'genius') {
            this.w = 24; this.h = 24;
            this.gears = this.gears || 0;
            this.components = this.components || 0;
            this.isPilotingMecha = false;
            this.mechaSummonMultiplier = this.mechaSummonMultiplier || 1;
            this.mechaSummonHold = 0;
            this.mechaMode = 1;
            this.gearPassiveTimer = 0;
            this.mechaIdleFrames = 0;
            this.mechaAutoShotTimer = 0;
            this.mechaAutoAaaTimer = 0;
            this.mechaAutoShockwaveTimer = 0;
            this.mechaEscortDroneTimer = 0;
        }

        // 6. FINAL STATE RESET (QUAN TRỌNG NHẤT)
        // Đặt ở cuối cùng để đảm bảo nhận đủ MaxHP và MaxAmmo từ tất cả nguồn trên
        this.hp = this.maxHp;
        this.ammo = this.maxAmmo;

        // 7. VỊ TRÍ XUẤT PHÁT
        this.x = (canvas.width / 2) - (this.w / 2);
        this.y = (this.id === 1) ? canvas.height - this.h - 22 : 20;
    }

    enterMecha(cost) {
        this.gears = Math.max(0, (this.gears || 0) - cost);
        this.isPilotingMecha = true;
        this.w = 40; this.h = 40;
        this.y = (this.id === 1) ? canvas.height - this.h - 22 : 20;

        let upg = this.geniusUpgrades || {};
        this.mechaMaxHp = 5 + this.maxHp + (upg['gen_hp'] || 0) * 3;
        this.mechaHp = this.mechaMaxHp;
        this.mechaVirtualArmor = (upg['gen_shield'] || 0) > 0 ? 1 : 0;
        this.mechaMaxEnergy = this.maxHp * 10 + (upg['gen_energy'] || 0) * 15;
        this.mechaEnergy = this.mechaMaxEnergy;
        this.mechaDmg = this.damage * 0.25 + (upg['gen_dmg'] || 0) * 0.25;
        this.mechaMode = 1;
        this.mechaIdleFrames = 0;

        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 45, '#ff9800', 0, this));
        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 18, "LÁI MECHA CHIẾN ĐẤU! 🤖⚡", "#ff9800", 15);
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    }

    ejectMecha(fromSelfDestruct = false) {
        if (!this.isPilotingMecha) return;
        this.isPilotingMecha = false;
        this.w = 24; this.h = 24;
        this.y = (this.id === 1) ? canvas.height - this.h - 22 : 20;

        if (!fromSelfDestruct) {
            this.hp = Math.max(0.5, this.hp * 0.5);
            this.mechaSummonMultiplier = (this.mechaSummonMultiplier || 1) * 2;
            let refund = (this.hasUpgrade('evo_gen_1') && this.hasUpgrade('evo_gen_2')) ? 6 : (this.hasUpgrade('evo_gen_1') ? 4 : 0);
            if (refund > 0) {
                this.gears = (this.gears || 0) + refund;
                if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, `HOÀN +${refund} BÁNH RĂNG ⚙️`, "#ffb74d", 13);
            }
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 25, "THOÁT HIỂM! 🏃💨 (-50% HP)", "#ff5722", 14);
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 50, '#ff5722', 0, this));
            if (soundSystem && !soundSystem.muted) soundSystem.playShieldBreak();
        }
    }

    selfDestructMecha() {
        if (!this.isPilotingMecha) return;
        let isFullEvo = this.hasUpgrade('evo_gen_1') && this.hasUpgrade('evo_gen_2');
        if (!isFullEvo) return;

        let detonateX = this.x + this.w / 2;
        let detonateY = (this.id === 1) ? 120 : canvas.height - 120;
        let radius = 150;
        let dmg = 5.0;

        this.ejectMecha(true);
        // Genius leaps back safely: strictly horizontal shift
        this.x = Math.max(10, Math.min(canvas.width - this.w - 10, this.x + (Math.random() > 0.5 ? 40 : -40)));

        setTimeout(() => {
            explosions.push(new Explosion(detonateX, detonateY, radius, '#ff1744', dmg, this));
            const enemy = (this.id === 1) ? p2 : p1;
            if (enemy && enemy.hp > 0 && Math.hypot((enemy.x + enemy.w / 2) - detonateX, (enemy.y + enemy.h / 2) - detonateY) <= radius) {
                enemy.takeDamage(dmg, this);
            }
            triggerScreenShake(8, 14);
            if (soundSystem && !soundSystem.muted) soundSystem.playExplosion();
            if (typeof addFloatingText === 'function') addFloatingText(detonateX, detonateY, "TỰ HỦY MECHA KHỔNG LỒ! 💥💣", "#ff1744", 16);
        }, 300);
    }

    fireMechaStandardShot() {
        let dirY = (this.id === 1) ? -1 : 1;
        let isPiercing = this.hasUpgrade('evo_gen_2');
        let upg = this.geniusUpgrades || {};
        let bSpeed = C.bulletSpeed * 1.3;
        this.bullets.push({
            x: this.x + this.w / 2 - 4,
            y: (dirY === -1) ? this.y - 10 : this.y + this.h + 2,
            w: 8, h: 12,
            vx: 0, vy: dirY * bSpeed,
            dmg: this.mechaDmg || 1.0,
            owner: this,
            isPiercing: isPiercing,
            tangCuongSlow: (upg['gen_slow'] || 0) > 0,
            tangCuongBurn: (upg['gen_fire'] || 0) > 0,
            color: "#ff9800",
            hitIds: []
        });
        if (soundSystem && !soundSystem.muted) soundSystem.playShoot();
    }

    fireMechaCannonShot() {
        let dirY = (this.id === 1) ? -1 : 1;
        let upg = this.geniusUpgrades || {};
        let blastMult = (upg['gen_explosive'] || 0) > 0 ? 1.5 : 1.0;
        this.bullets.push({
            x: this.x + this.w / 2 - 7,
            y: (dirY === -1) ? this.y - 14 : this.y + this.h + 2,
            w: 14, h: 16,
            vx: 0, vy: dirY * 5.5,
            dmg: (this.mechaDmg || 1.0) * 2.2,
            owner: this,
            isRocket: true,
            isExplosive: true,
            rocketRadiusMult: blastMult,
            tangCuongSlow: (upg['gen_slow'] || 0) > 0,
            tangCuongBurn: (upg['gen_fire'] || 0) > 0,
            color: "#ff5722",
            hitIds: []
        });
        if (soundSystem && !soundSystem.muted) soundSystem.playShoot('cannon');
    }

    fireMechaSmgShot() {
        let dirY = (this.id === 1) ? -1 : 1;
        let upg = this.geniusUpgrades || {};
        let spreadVx = (Math.random() - 0.5) * 3.5;
        this.bullets.push({
            x: this.x + this.w / 2 - 3,
            y: (dirY === -1) ? this.y - 8 : this.y + this.h + 2,
            w: 5, h: 7,
            vx: spreadVx, vy: dirY * 10,
            dmg: (this.mechaDmg || 1.0) * 0.45,
            owner: this,
            tangCuongSlow: (upg['gen_slow'] || 0) > 0,
            tangCuongBurn: (upg['gen_fire'] || 0) > 0,
            color: "#ffb74d",
            hitIds: []
        });
        if (soundSystem && !soundSystem.muted) soundSystem.playShoot();
    }

    startMechaDash() {
        let dirY = (this.id === 1) ? -1 : 1;
        let fistX = this.x + this.w / 2 - 15;
        let fistY = (dirY === -1) ? this.y - 20 : this.y + this.h + 10;
        this.bullets.push({
            x: fistX, y: fistY,
            w: 30, h: 30,
            vx: 0, vy: dirY * 12,
            dmg: 2.0,
            owner: this,
            isMechaPunch: true,
            color: "#ff3d00",
            hitIds: []
        });
        triggerScreenShake(4, 6);
        if (soundSystem && !soundSystem.muted) soundSystem.playDash();
        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "CÚ ĐẤM THÉP! 🥊💨", "#ff5722", 14);
    }

    cycleMechaMode(targetMode = null) {
        if (!this.isPilotingMecha) return;
        if (targetMode !== null) {
            this.mechaMode = targetMode;
        } else {
            this.mechaMode = (this.mechaMode % 5) + 1;
        }
        let modeNames = ["", "1: BẮN CƠ BẢN", "2: PHÁO BỘC PHÁ", "3: SẤY TIỂU LIÊN", "4: CÚ ĐẤM THÉP", "5: KHIÊN TỪ TRƯỜNG"];
        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, modeNames[this.mechaMode], "#ff9800", 13);
    }

    spawnShadowTraps() {
        let enemyHalfMinY = (this.id === 1) ? 80 : 380;
        let enemyHalfMaxY = (this.id === 1) ? 280 : 580;
        let isFullEvo = this.hasUpgrade('evo_sh_1') && this.hasUpgrade('evo_sh_2');
        for (let k = 0; k < 2; k++) {
            let trapX = 50 + Math.random() * (canvas.width - 100);
            let trapY = enemyHalfMinY + Math.random() * (enemyHalfMaxY - enemyHalfMinY);
            shadowTraps.push(new ShadowTrap(trapX, trapY, this, isFullEvo));
        }
    }

    triggerThunderAction(held, now) {
        if (held < 30) {
            // Nhấp (< 0.5s): Phóng 1 Lôi Phong Thương xuyên qua mọi vật thể/kẻ địch
            if ((this.thunderActionCooldown || 0) > 0) {
                if (typeof addFloatingText === 'function') {
                    let secLeft = ((this.thunderActionCooldown || 0) / 60).toFixed(1);
                    addFloatingText(this.x + this.w / 2, this.y - 14, `HỒI CHIÊU (${secLeft}s)! ⏳`, "#aaa", 11);
                }
                return;
            }
            if (now - (this.lastShot || 0) < 350) {
                return; // Chống lỗi spam bắn liên tục
            }
            if ((this.thunderSpears || 0) > 0) {
                this.thunderSpears--;
                let dirY = (this.id === 1) ? -1 : 1;
                let bSpeed = C.bulletSpeed * 2.2;
                if (typeof gameState !== 'undefined' && gameState.currentMap === 'overdrive') bSpeed *= 1.5;
                this.bullets.push({
                    x: this.x + this.w / 2 - 4,
                    y: (this.id === 1) ? this.y - 14 : this.y + this.h + 2,
                    w: 8, h: 18,
                    vx: 0,
                    vy: dirY * bSpeed,
                    dmg: 1.0,
                    owner: this,
                    isThunderSpear: true,
                    isPiercing: true,
                    hitIds: [],
                    bounceCount: 0
                });
                this.lastShot = now;
                if (soundSystem && !soundSystem.muted) soundSystem.playShoot();
            } else {
                // Nếu phóng hết 3 cây thương mà vẫn bấm nhấp -> Tự động kích hoạt Thu Thương có cảnh báo 0.25s
                this.startThunderRecall(false);
            }
        } else if (held >= 30 && held <= 60) {
            // Giữ vừa (0.5s - 1s): Thu Thương
            this.startThunderRecall(false);
        } else {
            // Giữ lâu (> 1s): Trảm Lôi Liên Hoàn
            this.startThunderSlashSequence();
        }
    }

    startThunderRecall(instant = false) {
        let mySpears = (typeof thunderPlantedSpears !== 'undefined' ? thunderPlantedSpears : []).filter(s => s.owner === this);
        if (mySpears.length === 0) {
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, "KHÔNG CÓ THƯƠNG!", "#aaa", 12);
            return;
        }
        if (this.thunderIsRecallWarning) return;
        this.thunderIsRecallWarning = true;
        this.thunderRecallWarningTimer = 15; // 0.25s cảnh báo
        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "THU THƯƠNG! ⚡", "#ffff00", 14);
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    }

    executeThunderRecall() {
        let mySpears = (typeof thunderPlantedSpears !== 'undefined' ? thunderPlantedSpears : []).filter(s => s.owner === this);
        if (mySpears.length === 0) return;
        let enemy = (this.id === 1) ? p2 : p1;
        let targetX = this.x + this.w / 2;
        let targetY = this.y + this.h / 2;
        let hitCount = 0;

        triggerScreenShake(7, 10);
        if (soundSystem && !soundSystem.muted) {
            soundSystem.playLaser();
            soundSystem.playHit();
        }

        mySpears.forEach(s => {
            if (enemy && enemy.hp > 0) {
                let d = distToSegment(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, s.x, s.y, targetX, targetY);
                if (d <= enemy.w / 2 + 18) {
                    enemy.takeDamage(1.0, this);
                    hitCount++;
                }
            }
            if (typeof explosions !== 'undefined') {
                explosions.push(new Explosion(s.x, s.y, 35, '#ffff00', 0, this));
            }
            if (typeof spawnSparkParticles === 'function') {
                spawnSparkParticles(s.x, s.y, '#ffff00', 8);
                spawnSparkParticles(targetX, targetY, '#00ffff', 8);
            }
        });

        if (hitCount > 0 && typeof addFloatingText === 'function') {
            addFloatingText(enemy.x + enemy.w / 2, enemy.y - 12, "THU THƯƠNG -1 DMG ⚡", "#ffff00", 14);
        }

        let recoveredCount = mySpears.length;
        this.thunderSpears = 3;
        this.thunderActionCooldown = 60; // 1s (60 ticks) cooldown sau khi thu thương trước khi ném lại
        this.lastShot = Date.now();
        this.thunderConsumedSpears = (this.thunderConsumedSpears || 0) + recoveredCount;
        if (this.thunderConsumedSpears >= 3) {
            this.thunderConsumedSpears -= 3;
            this.thunderLoiMinhStacks = (this.thunderLoiMinhStacks || 0) + 1;
            if (this.thunderLoiMinhStacks >= 3) {
                this.activateThienKiep();
            }
        }
        thunderPlantedSpears = thunderPlantedSpears.filter(s => s.owner !== this);
    }

    startThunderRaycastWarning(now) {
        this.thunderRaycastWarningTimer = 15; // 0.25s (15 ticks) cảnh báo
        this.thunderRaycastX = this.x + this.w / 2;
        this.lastShot = now;
        if (typeof addFloatingText === 'function') addFloatingText(this.thunderRaycastX, this.y - 15, "LÔI MINH ĐANG GIÁNG! ⚡", "#ffeb3b", 12);
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    }

    startThunderSlashSequence() {
        let mySpears = (typeof thunderPlantedSpears !== 'undefined' ? thunderPlantedSpears : []).filter(s => s.owner === this);
        if (mySpears.length === 0) {
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, "KHÔNG CÓ THƯƠNG!", "#aaa", 12);
            return;
        }
        this.thunderSlashQueue = [...mySpears];
        thunderPlantedSpears = thunderPlantedSpears.filter(s => s.owner !== this);
        this.thunderIsSlashing = true;
        this.thunderSlashIndex = 0;
        this.thunderSlashTimer = 0;
        this.thunderOriginPos = { x: this.x, y: this.y };
        this.isInvulnerable = true;
        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 18, "TRẢM LÔI LIÊN HOÀN! ⚡🌪", "#ffff00", 16);
    }

    activateThienKiep() {
        this.thunderLoiMinhStacks = 0;
        let hasEvo2 = this.hasUpgrade('evo_thun_2');
        this.thunderLoiMinhTimer = hasEvo2 ? 480 : 300; // 8s hoặc 5s
        if (hasEvo2) {
            this.thunderShieldHits = 3;
        }
        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 20, "⚡ THIÊN KIẾP KÍCH HOẠT! ⚡", "#ffd700", 16);
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    }

    fireThunderRaycast(now) {
        let dirY = (this.id === 1) ? -1 : 1;
        let startX = this.x + this.w / 2;
        let startY = (this.id === 1) ? this.y : this.y + this.h;
        let targetY = (dirY === -1) ? 0 : canvas.height;
        let enemy = (this.id === 1) ? p2 : p1;
        let hitWidth = 24;

        if (enemy && enemy.hp > 0 && enemy.x <= startX + hitWidth && enemy.x + enemy.w >= startX - hitWidth) {
            enemy.takeDamage(2.0, this);
            if (typeof addFloatingText === 'function') addFloatingText(enemy.x + enemy.w / 2, enemy.y - 14, "THIÊN KIẾP -2 DMG ⚡⚡", "#ffd700", 16);
        }
        crates.forEach(c => {
            if (c.active && c.x <= startX + 22 && c.x + c.w >= startX - 22) {
                c.active = false;
                if (c.isMimic) triggerMimicExplosion(c, this);
                this.onCollectAmmoCrate(c);
            }
        });
        beams.push(new Beam(startX - 6, Math.min(startY, targetY), 12, Math.abs(targetY - startY), this.id, true));
        triggerScreenShake(4, 6);
        if (soundSystem && !soundSystem.muted) soundSystem.playLaser();
    }

    toggleMagnetPolarity() {
        this.magnetPolarity = (this.magnetPolarity === 1) ? -1 : 1;
        let isFullEvo = this.hasUpgrade('evo_mag_net_1') && this.hasUpgrade('evo_mag_net_2');
        if (typeof spawnSparkParticles === 'function') {
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, this.magnetPolarity === 1 ? '#ff3300' : '#00aaff', 16);
        }
        if (typeof addFloatingText === 'function') {
            addFloatingText(this.x + this.w / 2, this.y - 15, this.magnetPolarity === 1 ? "ĐẢO CỰC (+)" : "ĐẢO CỰC (-)", this.magnetPolarity === 1 ? "#ff3300" : "#00aaff", 14);
        }
        if (isFullEvo) {
            let enemy = (this.id === 1) ? p2 : p1;
            let edx = (enemy.x + enemy.w / 2) - (this.x + this.w / 2);
            let dirX = (edx >= 0 ? 1 : -1);
            enemy.x = Math.max(0, Math.min(canvas.width - enemy.w, enemy.x + dirX * 45));
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 65, 'rgba(0, 255, 255,', 0, this));
        }
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    }

    fireMagnetBullet() {
        let dirY = (this.id === 1) ? -1 : 1;
        let bSpeed = C.bulletSpeed;
        if (typeof gameState !== 'undefined' && gameState.currentMap === 'overdrive') bSpeed *= 1.5;
        this.bullets.push({
            x: this.x + this.w / 2 - 4,
            y: (this.id === 1) ? this.y - 8 : this.y + this.h,
            w: 8, h: 8,
            vx: 0,
            vy: dirY * bSpeed,
            dmg: this.damage,
            owner: this,
            isMagnetBullet: true,
            polarity: this.magnetPolarity || 1,
            isPiercing: false,
            hitIds: [],
            bounceCount: 0
        });
        if (soundSystem && !soundSystem.muted) soundSystem.playShoot();
    }

    update() {


        this.updateBullets();
        const inp = (this.id === 1) ? inputs.p1 : inputs.p2;
        const now = Date.now();

        // Xử lý hiệu ứng Chảy Máu (Bleed)
        if (this.bleedTimer > 0) {
            this.bleedTimer--;
            if (this.bleedTimer % 12 === 0) {
                let bleedAmt = this.bleedDmg || (this.maxHp * 0.02);
                this.hp = Math.max(0.05, this.hp - bleedAmt);
                if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2 + (Math.random() - 0.5) * 20, this.y - 12, `-${bleedAmt.toFixed(2)} 🩸`, "#ff0055", 11);
                if (typeof spawnSparkParticles === 'function') spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, "#ff0055", 3);
            }
        }

        // Xử lý hiệu ứng Mù Bảng Điều Khiển (Blindness)
        if (this.blindTimer > 0) {
            this.blindTimer--;
            const isOnline = (typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline);
            const isMyTank = !isOnline || (onlineManager.role === 'host' ? this.id === 1 : this.id === 2);
            if (isMyTank) {
                const ctrlEl = (this.id === 1 || isOnline) ? document.getElementById('p1-controls') : document.getElementById('p2-controls');
                if (ctrlEl && !ctrlEl.classList.contains('blinded-hud')) {
                    ctrlEl.classList.add('blinded-hud');
                }
            }
        } else {
            const isOnline = (typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline);
            const isMyTank = !isOnline || (onlineManager.role === 'host' ? this.id === 1 : this.id === 2);
            if (isMyTank) {
                const ctrlEl = (this.id === 1 || isOnline) ? document.getElementById('p1-controls') : document.getElementById('p2-controls');
                if (ctrlEl && ctrlEl.classList.contains('blinded-hud')) {
                    ctrlEl.classList.remove('blinded-hud');
                }
            }
        }
        // --- FIX LỖI 6 NÒNG: KHAI BÁO EFFECTIVE INPUT Ở TRÊN CÙNG ---
        let effectiveInp = { l: inp.l, r: inp.r, s: inp.s };
        // TẦNG 4+: QUÁ TẢI ĐẦU VÀO (CHỈ DELAY NÚT BẮN & CHỈ TÁC DỤNG LÚC NHẤP)
        if (this.confusionStacks >= 4) {
            this.inputDelayQueue.push(inp.s); // Chỉ lưu lịch sử của nút Bắn
            let delayFrames = Math.min((this.confusionStacks - 3) * 10, 25); // Trễ tối đa ~0.4s

            if (this.inputDelayQueue.length > delayFrames) {
                let delayedS = this.inputDelayQueue.shift();
                // Kích hoạt: Nhấp thì bị trễ (đợi lấy delayedS ra).
                // Giữ nguyên nút bắn thì sau khoảng delay ban đầu, game sẽ nhận liên tục là true.
                effectiveInp.s = delayedS;
            } else {
                effectiveInp.s = false; // Đang trong tích tắc delay ban đầu
            }
            // Không can thiệp vào effectiveInp.l và effectiveInp.r nữa (Cho phép di chuyển mượt)
        } else {
            this.inputDelayQueue = [];
        }

        // TẦNG 1-3+: LOẠN ẢNH (Đảo ngược ngắt quãng)
        if (this.confusionStacks > 0) {
            if (Math.random() < 0.05 * this.confusionStacks) {
                this.confusionTimer = 15 + Math.random() * 30; // Giật cục random từ 0.25s - 0.75s
            }
            if (this.confusionTimer > 0) {
                this.confusionTimer--;
                let tempL = effectiveInp.l;
                effectiveInp.l = effectiveInp.r;
                effectiveInp.r = tempL;
            }
        }
        if (this.silenceTimer > 0) {
            effectiveInp.s = false; // Bị câm lặng -> ép nút bắn thành false
        }
        // -------------------------------------------------------------

        if (this.freezeTimer > 0) {
            this.freezeTimer--;
            ctx.fillStyle = "rgba(0, 255, 255, 0.5)";
            ctx.fillRect(this.x - 5, this.y - 5, this.w + 10, this.h + 10);
            return;
        }
        if (this.weapon === 'ice' && this.hasUpgrade('evo_ice_1') && this.hasUpgrade('evo_ice_2')) {
            this.iceAutoFreezeTimer++;

            // 10 giây = 600 frames (vì game chạy 60fps)
            if (this.iceAutoFreezeTimer >= 600) {
                this.iceAutoFreezeTimer = 0;

                // Xác định kẻ địch
                const enemy = (this.id === 1) ? p2 : p1;

                // Đóng băng NGAY LẬP TỨC
                // Full Evo: Đóng băng tối đa 90 frames (1.5 giây để đối thủ có cơ hội phản xạ)
                enemy.freezeTimer = 90;
                enemy.coldStack = 0; // Reset stack để tránh lỗi chồng chéo

                // Hiệu ứng Visual báo hiệu
                explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 80, '#00ffff', 0, this));
                ctx.fillStyle = "cyan"; ctx.font = "bold 20px Arial";
                ctx.fillText("ABSOLUTE ZERO!", this.x, this.y - 30);
            }
        }
        

        if (this.slowTimer > 0) this.slowTimer--;
        if (this.invincibleTimer > 0) this.invincibleTimer--;
        if (this.silenceTimer > 0) this.silenceTimer--;// ... các timer khác cũng giảm dần tương tự ...

        // 1. Gojo Passive Cursed Energy Regen (chỉ hồi khi không bị tấn công trong 2.5s)
        if (this.chuLucRegenCooldown > 0) {
            this.chuLucRegenCooldown--;
        } else if (this.weapon === 'the_strongest' && this.chuLuc < this.maxChuLuc) {
            this.chuLuc = Math.min(this.chuLuc + this.chuLucRegenRate, this.maxChuLuc);
        }
        // 2. Logic Hất tung (Knockback) - Chỉ tác động theo trục ngang (X)
        if (Math.abs(this.kbX) > 0.1) {
            this.x += this.kbX;
            this.kbX *= 0.85;

            // Check va chạm tường khi bị hất
            let hitWall = false;
            if (this.x <= 0) { this.x = 0; hitWall = true; }
            if (this.x + this.w >= canvas.width) { this.x = canvas.width - this.w; hitWall = true; }

            // Gây sát thương nếu đập tường do đòn Đỏ
            if (hitWall && this.kbFromRed) {
                this.takeDamage(2, null, { isEnvironmental: true }); // Dame đập tường
                this.kbFromRed = false; // Chỉ nhận dame 1 lần
                explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 50, 'red', 0, this));
                this.kbX = 0;
            }
        }
        this.kbY = 0; // Triệt tiêu hoàn toàn lực hất theo phương dọc
        //logic Axit-kỹ sư//
        if (this.acidBurnTimer > 0) {
            this.acidBurnTimer--;
            // Hiệu ứng visual khi bị cháy acid
            if (this.acidBurnTimer % 10 === 0) {
                ctx.fillStyle = "#32CD32";
                ctx.fillRect(this.x + Math.random() * this.w, this.y + Math.random() * this.h, 4, 4);
                if (this.weapon === 'the_strongest') {
                    this.takeDamage(0.15, null, { isEnvironmental: true });
                } else if (this.hp > 1) {
                    this.hp = Math.max(1, this.hp - 0.15);
                }
            }
        }
        // ==========================================
        // --- LOGIC NHÀ PHÁT MINH (INVENTOR) ---
        // ==========================================
        if (this.weapon === 'inventor') {
            if (!this.invUpgrades) this.invUpgrades = {};
            let upg = this.invUpgrades;

            // 1. Ép Xung (Giữ S) - Hồi chiêu 15s, hiệu lực 4s
            if (inp.s && upg['inv_epxung']) {
                if (now - (this.overclockTimer || 0) >= 15000) {
                    this.isOverclocking = true;
                    this.overclockTimer = now;
                    this.overclockDurationTimer = now + 4000;
                    soundSystem.playPowerup();
                    addFloatingText(this.x + this.w / 2, this.y - 15, "OVERCLOCK ⚡ (4s)", "#00ffcc", 14);
                }
            }
            if (this.isOverclocking) {
                if (now > (this.overclockDurationTimer || 0)) {
                    this.isOverclocking = false;
                } else {
                    effectiveInp.s = false; // Câm lặng bản thân khi ép xung
                }
            }

            // 2. Lưới Điện Phản Pháo (Đứng yên 2s, Hồi chiêu 12s)
            if (!inp.l && !inp.r) {
                if (!this.stillTimer) this.stillTimer = now;
                if (now - this.stillTimer >= 2000 && upg['inv_luoidien'] && now - (this.lastLuoiDienTrigger || 0) >= 12000) {
                    this.luoiDienSanSang = true;
                }
            } else {
                this.stillTimer = null;
                this.luoiDienSanSang = false;
            }

            // Chặn đạn bằng lưới điện (Triệt tiêu đạn -> +1 LK)
            if (this.luoiDienSanSang) {
                let enemy = (this.id === 1) ? p2 : p1;
                if (enemy && enemy.bullets && now - (this.lastLuoiDienTrigger || 0) >= 12000) {
                    for (let eb of enemy.bullets) {
                        if (eb.active && Math.hypot(eb.x - (this.x + this.w / 2), eb.y - (this.y + this.h / 2)) < 38) {
                            eb.active = false;
                            this.components = (this.components || 0) + 1;
                            this.lastLuoiDienTrigger = now;
                            this.luoiDienSanSang = false;
                            this.stillTimer = null;
                            explosions.push(new Explosion(eb.x, eb.y, 25, '#00ffcc', 0, this));
                            soundSystem.playShieldBreak();
                            addFloatingText(this.x + this.w / 2, this.y - 15, "+1 LK (LƯỚI ĐIỆN)", "#00ffcc", 12);
                            break;
                        }
                    }
                }
            }

            // 3. Giáp Ảo từ Hộp Tiếp Tế (inv_giap) hết hạn sau 5s
            if (this.crateShieldActive && now > (this.crateShieldExpireTimer || 0)) {
                this.crateShieldActive = false;
                if (this.shield > 0) {
                    this.shield = Math.max(0, this.shield - 1);
                    addFloatingText(this.x + this.w / 2, this.y - 15, "HẾT GIÁP ẢO (5s)", "#aaa", 11);
                }
            }

            // 4. Bộ Hồi Phục (inv_hoiphuc) - Hồi 1 HP mỗi 5s
            if (upg['inv_hoiphuc']) {
                if (!this.lastHoiPhucTime) this.lastHoiPhucTime = now;
                if (now - this.lastHoiPhucTime >= 5000) {
                    if (this.hp < this.maxHp) {
                        this.hp = Math.min(this.maxHp, this.hp + 1);
                        addFloatingText(this.x + this.w / 2, this.y - 15, "+1 HP", "#2ecc71", 12);
                    }
                    this.lastHoiPhucTime = now;
                }
            }

            // 5. Nhà Phát Minh Tối Hậu (Full Evo: Tích hợp hệ thống vũ khí Drone lên xe chủ)
            let isFullEvo = this.isFullEvoInventor || (this.hasUpgrade('evo_inv_1') && this.hasUpgrade('evo_inv_2') && upg['inv_full_evo']);
            if (isFullEvo) {
                let cdMod = 0.4;
                if (this.isOverclocking) cdMod *= 0.5;

                // Tự động xả đạn nòng chính từ xe chủ
                if (now - (this.lastOwnerAutoShot || 0) > 1000 * cdMod) {
                    let enemy = (this.id === 1) ? p2 : p1;
                    let baseDirY = (this.id === 1) ? -1 : 1;
                    let bulletSpd = 5.5;
                    let vx = 0;
                    if (upg['inv_ngam'] && enemy) {
                        let dx = (enemy.x + enemy.w / 2) - (this.x + this.w / 2);
                        vx = Math.max(-1.8, Math.min(1.8, dx * 0.015 * bulletSpd));
                    }
                    this.bullets.push({
                        x: this.x + this.w / 2 - 3,
                        y: this.y + (baseDirY > 0 ? this.h : -4),
                        w: upg['inv_lazer'] ? 4 : 6,
                        h: upg['inv_lazer'] ? 14 : 6,
                        vx: vx,
                        vy: baseDirY * bulletSpd,
                        dmg: Math.max(0.5, this.damage * 2.0),
                        owner: this,
                        isPiercing: !!upg['inv_lazer'],
                        isInventorBullet: true,
                        hitIds: [],
                        bounceCount: 0,
                        active: true
                    });
                    this.lastOwnerAutoShot = now;
                }

                // Tự động xả các nòng phụ từ xe chủ
                if (upg['inv_phao'] && now - (this.lastOwnerPhao || 0) > 3000 * cdMod) {
                    this.fireOwnerSubAoE('mortar', upg); this.lastOwnerPhao = now;
                }
                if (upg['inv_smg'] && now - (this.lastOwnerSmg || 0) > 5000 * cdMod) {
                    this.fireOwnerSubSMG(); this.lastOwnerSmg = now;
                }
                if (upg['inv_bang'] && now - (this.lastOwnerBang || 0) > 4000 * cdMod) {
                    this.fireOwnerSubAoE('ice', upg); this.lastOwnerBang = now;
                }
                if (upg['inv_lua'] && now - (this.lastOwnerLua || 0) > 4000 * cdMod) {
                    this.fireOwnerSubAoE('fire', upg); this.lastOwnerLua = now;
                }
                if (upg['inv_tugio'] && now - (this.lastOwnerTuGio || 0) > 2000 * cdMod) {
                    this.clearEnemyBulletsInRadiusOwner(100); this.lastOwnerTuGio = now;
                }
            }

            // Update các Drones
            if (this.drones) {
                this.drones.forEach(d => d.update());
            }
        }

        // --- BINDING CURSE COUNTDOWN ---
        if (this.bindingCurseTimer > 0) {
            this.bindingCurseTimer--;
            if (this.bindingCurseTimer <= 0) {
                this.bindingCurseStacks = 0;
            }
        }

        // ==========================================
        // --- LOGIC KẺ SÁNG TẠO (CREATOR) ---
        // ==========================================
        if (this.weapon === 'creator') {
            // 1. Ụ Súng Tự Ngắm (Cứ mỗi 10s tự động triển khai 1 Ụ súng, tối đa 2 ụ cùng lúc)
            this.creatorTurretTimer = (this.creatorTurretTimer || 0) + 1;
            if (this.creatorTurretTimer >= 600) {
                this.creatorTurretTimer = 0;
                let activeTurrets = creatorTurrets.filter(t => t.owner === this && t.active);
                if (activeTurrets.length < 2) {
                    let sideX = activeTurrets.length === 0 ? this.x - 30 : this.x + this.w + 10;
                    sideX = Math.max(20, Math.min(canvas.width - 40, sideX));
                    let sideY = (this.id === 1) ? this.y - 35 : this.y + this.h + 15;
                    let newTurret = new CreatorTurret(this, sideX, sideY);
                    creatorTurrets.push(newTurret);
                    explosions.push(new Explosion(sideX + 10, sideY + 10, 25, '#00e5ff', 0, this));
                    if (typeof addFloatingText === 'function') addFloatingText(sideX, sideY - 10, "Ụ SÚNG TRIỂN KHAI! 🛠️", "#00e5ff", 12);
                }
            }

            // 2. Khiên Thép Chắn Đạn (Nhấn giữ phím Bắn để dựng tường khiên chắn đạn phía trước)
            if (this.creatorShieldCooldown > 0) {
                this.creatorShieldCooldown--;
            }

            if (inp.s) {
                this.creatorShieldHoldFrames = (this.creatorShieldHoldFrames || 0) + 1;
                if (this.creatorShieldHoldFrames >= 15 && !this.creatorShield && this.creatorShieldCooldown <= 0) {
                    this.creatorShield = new CreatorShield(this);
                    if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "DỰNG KHIÊN THÉP! 🛡️", "#00e5ff", 14);
                    if (soundSystem && !soundSystem.muted) soundSystem.playShieldBreak();
                }
            } else {
                this.creatorShieldHoldFrames = 0;
            }

            if (this.creatorShield) {
                this.creatorShield.update();
                if (!this.creatorShield.active) {
                    this.creatorShield = null;
                }
            }

            // 3. Drone Không Kích Tự Hành (Bay tuần tra xả pháo đôi)
            if (this.creatorDrone) {
                this.creatorDrone.update();
            }

            // 4. Robot Tự Động (Evo 2: xuất xưởng sau 10s đầu trận)
            if (this.hasUpgrade('evo_cr_2')) {
                let timePlayed = Date.now() - gameState.roundStartTime;
                if (timePlayed >= 10000 && !this.creatorRobot) {
                    this.creatorRobot = new CreatorRobot(this);
                    creatorRobots.push(this.creatorRobot);
                }
                if (this.creatorRobot) {
                    this.creatorRobot.update();
                }
            }
        }

        // ==========================================
        // --- LOGIC CHIÊU HỒN SƯ (NECROMANCER) ---
        // ==========================================
        if (this.weapon === 'necromancer') {
            // 1. Tự động hồi Linh Hồn theo chu kỳ (khóa hồi 3s sau khi nhận sát thương)
            if ((this.necroRegenCooldown || 0) > 0) {
                this.necroRegenCooldown--;
            } else {
                let necroRegenInterval = this.hasUpgrade('evo_necro_1') ? 180 : 300;
                let necroRegenAmount = this.hasUpgrade('evo_necro_1') ? 3 : 2;
                this.necroRegenTimer = (this.necroRegenTimer || 0) + 1;
                if (this.necroRegenTimer >= necroRegenInterval) {
                    this.necroRegenTimer = 0;
                    let cap = this.maxSouls - (this.lockedSouls || 0);
                    if (this.currentSouls < cap) {
                        this.currentSouls = Math.min(cap, this.currentSouls + necroRegenAmount);
                        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, `+${necroRegenAmount} LINH HỒN 👻`, "#00e676", 11);
                    }
                }
            }

            // 2. Tụ lực phím Bắn để Triệu Hồi Vong Linh
            if (effectiveInp.s) {
                this.necroChargeFrames = (this.necroChargeFrames || 0) + 1;
            } else {
                if ((this.necroChargeFrames || 0) > 0) {
                    let held = this.necroChargeFrames;
                    this.necroChargeFrames = 0;

                    if (held < 30) {
                        // Nhấp bắn thông thường (< 0.5s): Đạn phép linh hồn
                        if (this.ammo > 0 && now - this.lastShot > 350) {
                            this.fireBullet(1, false, 'necro_soul');
                            this.ammo--;
                            this.lastShot = now;
                        }
                    } else if (held >= 30 && held < 60) {
                        // Mốc 1 (0.5s - 1.0s): Linh Xương Cảm Tử (Khóa 2 Souls)
                        if ((this.currentSouls || 0) >= 2) {
                            this.currentSouls -= 2;
                            this.lockedSouls = (this.lockedSouls || 0) + 2;
                            necroMinions.push(new NecroMinion(this, 'kamikaze'));
                            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 30, '#ff5722', 0, this));
                            if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 16, "TRIỆU HỒI CẢM TỬ! 💀🔥", "#ff5722", 14);
                        } else {
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 16, "KHÔNG ĐỦ LINH HỒN! ⚠️", "#ff3333", 13);
                            this.fireBullet(1, false, 'necro_soul');
                        }
                    } else if (held >= 60 && held < 90) {
                        // Mốc 2 (1.0s - 1.5s): Linh Xương Xạ Thủ (Khóa 4 Souls)
                        if ((this.currentSouls || 0) >= 4) {
                            this.currentSouls -= 4;
                            this.lockedSouls = (this.lockedSouls || 0) + 4;
                            necroMinions.push(new NecroMinion(this, 'shooter'));
                            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 30, '#00e676', 0, this));
                            if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 16, "TRIỆU HỒI XẠ THỦ! 💀🏹", "#00e676", 14);
                        } else if ((this.currentSouls || 0) >= 2) {
                            this.currentSouls -= 2;
                            this.lockedSouls = (this.lockedSouls || 0) + 2;
                            necroMinions.push(new NecroMinion(this, 'kamikaze'));
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 16, "TRIỆU HỒI CẢM TỬ! 💀🔥", "#ff5722", 14);
                        } else {
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 16, "KHÔNG ĐỦ LINH HỒN! ⚠️", "#ff3333", 13);
                            this.fireBullet(1, false, 'necro_soul');
                        }
                    } else if (held >= 90) {
                        // Mốc 3 (> 1.5s): Linh Xương Cao Cấp (Khóa 6 Souls)
                        if ((this.currentSouls || 0) >= 6) {
                            this.currentSouls -= 6;
                            this.lockedSouls = (this.lockedSouls || 0) + 6;
                            necroMinions.push(new NecroMinion(this, 'elite'));
                            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 40, '#ab47bc', 0, this));
                            if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 16, "TRIỆU HỒI CAO CẤP! 💀👑", "#ab47bc", 15);
                        } else if ((this.currentSouls || 0) >= 4) {
                            this.currentSouls -= 4;
                            this.lockedSouls = (this.lockedSouls || 0) + 4;
                            necroMinions.push(new NecroMinion(this, 'shooter'));
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 16, "TRIỆU HỒI XẠ THỦ! 💀🏹", "#00e676", 14);
                        } else if ((this.currentSouls || 0) >= 2) {
                            this.currentSouls -= 2;
                            this.lockedSouls = (this.lockedSouls || 0) + 2;
                            necroMinions.push(new NecroMinion(this, 'kamikaze'));
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 16, "TRIỆU HỒI CẢM TỬ! 💀🔥", "#ff5722", 14);
                        } else {
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 16, "KHÔNG ĐỦ LINH HỒN! ⚠️", "#ff3333", 13);
                            this.fireBullet(1, false, 'necro_soul');
                        }
                    }
                }
            }
        }

        // ==========================================
        // --- LOGIC THIÊN TÀI (GENIUS) ---
        // ==========================================
        if (this.weapon === 'genius') {
            const enemy = (this.id === 1) ? p2 : p1;
            let hasEvo1 = this.hasUpgrade('evo_gen_1');
            let hasEvo2 = this.hasUpgrade('evo_gen_2');
            let isFullEvo = hasEvo1 && hasEvo2;

            if (!this.isPilotingMecha) {
                // 1. Tự động nhận 1 Bánh Răng mỗi 10s (600 ticks) khi không lái Mecha
                this.gearPassiveTimer = (this.gearPassiveTimer || 0) + 1;
                if (this.gearPassiveTimer >= 600) {
                    this.gearPassiveTimer = 0;
                    this.gears = (this.gears || 0) + 1;
                    if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "+1 BÁNH RĂNG ⚙️", "#ffb74d", 12);
                }

                // Chi phí Bánh Răng để vào Mecha
                let baseCost = isFullEvo ? 4 : (hasEvo1 ? 6 : 8);
                let summonCost = baseCost * (this.mechaSummonMultiplier || 1);

                // 2. Nhấn giữ phím Bắn để Triệu Hồi & Lái Mecha
                if (effectiveInp.s) {
                    this.mechaSummonHold = (this.mechaSummonHold || 0) + 1;
                    if (this.mechaSummonHold >= 40) {
                        if ((this.gears || 0) >= summonCost) {
                            this.enterMecha(summonCost);
                            this.mechaSummonHold = 0;
                        } else {
                            if (this.mechaSummonHold % 40 === 0 && typeof addFloatingText === 'function') {
                                addFloatingText(this.x + this.w / 2, this.y - 15, `CẦN ${summonCost} BÁNH RĂNG! ⚙️`, "#ff9800", 12);
                            }
                        }
                    }
                } else {
                    if ((this.mechaSummonHold || 0) > 0) {
                        if (this.mechaSummonHold < 40 && this.ammo > 0 && now - this.lastShot > 350) {
                            this.fireBullet(1);
                            this.ammo--;
                            this.lastShot = now;
                        }
                        this.mechaSummonHold = 0;
                    }
                }
            } else {
                // ĐANG LÁI MECHA (MECHA PILOTING MODE)
                this.mechaIdleFrames = (this.mechaIdleFrames || 0) + 1;

                // A. Hồi phục Năng Lượng
                let baseRegen = 1 / 60 + ((this.geniusUpgrades && this.geniusUpgrades['gen_regen']) || 0) / 60;
                if (isFullEvo && this.mechaIdleFrames >= 60) baseRegen = 3 / 60;
                else if (hasEvo1 && this.mechaIdleFrames >= 120) baseRegen = 2 / 60;
                this.mechaEnergy = Math.min(this.mechaMaxEnergy, (this.mechaEnergy || 0) + baseRegen);

                // B. Kỹ Năng / Vũ Khí theo Mode
                let nlDiscount = hasEvo1 ? 1 : 0;
                if (effectiveInp.s) {
                    this.mechaIdleFrames = 0;

                    // Full Evo: Giữ 3s (180 frames) để Tự Hủy Mecha
                    if (isFullEvo) {
                        this.mechaSelfDestructHold = (this.mechaSelfDestructHold || 0) + 1;
                        if (this.mechaSelfDestructHold >= 180) {
                            this.mechaSelfDestructHold = 0;
                            this.selfDestructMecha();
                            return;
                        }
                    }

                    if (this.mechaMode === 1) {
                        // Mode 1: Bắn cơ bản (2 NL, -1 Evo 1)
                        let cost = Math.max(1, 2 - nlDiscount);
                        if (this.mechaEnergy >= cost && now - this.lastShot > 300) {
                            this.mechaEnergy -= cost;
                            this.fireMechaStandardShot();
                            this.lastShot = now;
                        }
                    } else if (this.mechaMode === 2) {
                        // Mode 2: Pháo Bộc Phá (5 NL, -1 Evo 1)
                        let cost = Math.max(1, 5 - nlDiscount);
                        if (this.mechaEnergy >= cost && now - this.lastShot > 600) {
                            this.mechaEnergy -= cost;
                            this.fireMechaCannonShot();
                            this.lastShot = now;
                        }
                    } else if (this.mechaMode === 3) {
                        // Mode 3: Sấy Tiểu Liên (3 NL/s, -1 Evo 1)
                        let cost = Math.max(0.2, (3 - nlDiscount) / 6);
                        if (this.mechaEnergy >= cost && now - this.lastShot > 90) {
                            this.mechaEnergy -= cost;
                            this.fireMechaSmgShot();
                            this.lastShot = now;
                        }
                    } else if (this.mechaMode === 4) {
                        // Mode 4: Cú Đấm Thép Tank Dash (5 NL, -1 Evo 1)
                        let cost = Math.max(1, 5 - nlDiscount);
                        if (this.mechaEnergy >= cost && now - this.lastShot > 700) {
                            this.mechaEnergy -= cost;
                            this.startMechaDash();
                            this.lastShot = now;
                        }
                    }
                    // Mode 5 (Barrier Shield) là bị động đỡ đòn trong takeDamage!
                } else {
                    this.mechaSelfDestructHold = 0;
                }

                // C. Module tự động của Evo 2 (Vũ Trang Hóa)
                if (hasEvo2 && enemy && enemy.hp > 0) {
                    // Module 1: Súng phụ tự ngắm mỗi 3s (180 ticks)
                    this.mechaAutoShotTimer = (this.mechaAutoShotTimer || 0) + 1;
                    if (this.mechaAutoShotTimer >= 180) {
                        this.mechaAutoShotTimer = 0;
                        this.fireMechaStandardShot();
                    }

                    // Module 2: Radar Cao Xạ (AAA) dội pháo kích mỗi 8s (480 ticks)
                    this.mechaAutoAaaTimer = (this.mechaAutoAaaTimer || 0) + 1;
                    if (this.mechaAutoAaaTimer >= 480) {
                        this.mechaAutoAaaTimer = 0;
                        let hitX = enemy.x + enemy.w / 2;
                        let hitY = enemy.y + enemy.h / 2;
                        explosions.push(new Explosion(hitX, hitY, 65, '#ff1744', 1.5, this));
                        if (enemy.hp > 0) enemy.takeDamage(1.5, this);
                        triggerScreenShake(4, 6);
                        if (typeof addFloatingText === 'function') addFloatingText(hitX, hitY - 18, "RADAR PHÁO KÍCH! 🎯", "#ff1744", 14);
                    }

                    // Module 3: Sóng Chấn Động đẩy lùi và làm chậm xung quanh mỗi 10s (600 ticks)
                    this.mechaAutoShockwaveTimer = (this.mechaAutoShockwaveTimer || 0) + 1;
                    if (this.mechaAutoShockwaveTimer >= 600) {
                        this.mechaAutoShockwaveTimer = 0;
                        let sDist = Math.hypot((enemy.x + enemy.w / 2) - (this.x + this.w / 2), (enemy.y + enemy.h / 2) - (this.y + this.h / 2));
                        if (sDist <= 130) {
                            enemy.kbX = Math.sign(enemy.x - this.x || 1) * 35;
                            enemy.slowTimer = 90;
                            enemy.takeDamage(1.0, this);
                        }
                        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 130, 'rgba(0, 229, 255, 0.4)', 0, this));
                        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "SÓNG CHẤN ĐỘNG! 🌊⚡", "#00e5ff", 14);
                    }
                }

                // D. Full Evo: 2 Combat Drone hộ tống bắn hỗ trợ
                if (isFullEvo) {
                    this.mechaEscortDroneTimer = (this.mechaEscortDroneTimer || 0) + 1;
                    if (this.mechaEscortDroneTimer >= 120 && enemy && enemy.hp > 0) {
                        this.mechaEscortDroneTimer = 0;
                        let dirY = (this.id === 1) ? -1 : 1;
                        [-30, 30].forEach(offset => {
                            this.bullets.push({
                                x: this.x + this.w / 2 + offset,
                                y: (dirY === -1) ? this.y - 8 : this.y + this.h + 4,
                                w: 5, h: 7,
                                vx: 0, vy: dirY * 9,
                                dmg: 0.35,
                                owner: this,
                                color: "#00e5ff",
                                hitIds: []
                            });
                        });
                    }
                }
            }
        }

        // ==========================================
        // --- LOGIC MAGICIAN (AI PHÂN ẢNH & KỸ NĂNG) ---
        // ==========================================
        if (this.weapon === 'magician') {
            // Tốc độ cơ bản nhanh hơn (Khắc phục việc không có speedMult)
            let baseSpd = C.baseSpeed * 1.3;
            if (this.magicianSpeedBuff > 0) {
                this.magicianSpeedBuff--;
                baseSpd *= 1.5; // Tăng mạnh tốc sau khi đổi vị trí
            }

            // Xử lý Tàng hình & Vô địch
            if (this.invisTimer > 0) this.invisTimer--;

            // Cập nhật tốc độ lướt (Ghi đè logic di chuyển cơ bản nếu cần, hoặc cộng thêm vào vx)
            if (effectiveInp.l) this.x -= (baseSpd - C.baseSpeed); // Bù thêm phần chênh lệch tốc độ
            if (effectiveInp.r) this.x += (baseSpd - C.baseSpeed);

            // --- AI ĐIỀU KHIỂN PHÂN ẢNH ---
            const enemy = this.id === 1 ? p2 : p1;
            let hasEvo1 = this.hasUpgrade('evo_mag_1');
            let hasEvo2 = this.hasUpgrade('evo_mag_2');
            let isFullEvo = hasEvo1 && hasEvo2;

            for (let i = this.illusions.length - 1; i >= 0; i--) {
                let ill = this.illusions[i];
                let age = now - ill.spawnTime;

                if (age > ill.lifeTime) { this.illusions.splice(i, 1); continue; }
                if (ill.invisTimer > 0) ill.invisTimer--;
                if (ill.speedBuff > 0) ill.speedBuff--;

                let illSpd = C.baseSpeed * (ill.speedBuff > 0 ? 1.5 : 1);

                if (ill.type === 'ghost') {
                    ill.behaviorTimer--;

                    // 1. Nhận diện & Né đạn (Hoạt động mượt hơn)
                    let nearBullet = false; let incomingBullet = null;
                    for (let b of enemy.bullets) {
                        let dist = Math.hypot(b.x - (ill.x + ill.w / 2), b.y - (ill.y + ill.h / 2));
                        if (dist < 80) { nearBullet = true; incomingBullet = b; break; }
                    }

                    if (nearBullet && Math.random() < (isFullEvo ? 0.8 : 0.6)) {
                        ill.vx = incomingBullet.x > ill.x ? -illSpd : illSpd;
                        ill.behaviorTimer = 20; // Khóa hướng lùi né trong 20 frames
                    }
                    // 2. Logic Thay đổi hành vi theo Evo
                    else if (ill.behaviorTimer <= 0) {
                        ill.behaviorTimer = 30 + Math.random() * 60; // Nghĩ lại hành động sau 0.5 - 1.5s

                        if (isFullEvo) {
                            // FULL EVO AI: Ép góc, Lách nhẹ, Bám đuổi
                            let dx = enemy.x - ill.x;
                            let rand = Math.random();
                            if (rand < 0.4) { // 40% Đi theo trục X của địch để ép góc
                                ill.vx = dx > 0 ? illSpd : -illSpd;
                            } else if (rand < 0.6) { // 20% Đứng im giả dạng
                                ill.vx = 0;
                            } else { // 40% Đi lang thang nhử đạn
                                ill.vx = (Math.random() > 0.5 ? 1 : -1) * illSpd;
                            }
                        } else if (hasEvo2) {
                            // EVO 2 AI: Đổi hướng ngẫu nhiên không cần đợi chạm tường
                            ill.vx = (Math.random() > 0.5 ? 1 : -1) * illSpd;
                        }
                    }

                    ill.x += ill.vx;
                    // Chạm tường vẫn phải quay đầu
                    if (ill.x < 0) { ill.x = 0; ill.vx *= -1; ill.behaviorTimer = 0; }
                    if (ill.x + ill.w > canvas.width) { ill.x = canvas.width - ill.w; ill.vx *= -1; ill.behaviorTimer = 0; }
                }

                // 3. Logic Hồi Đạn cho Phân Ảnh (Giả lập giống hệt Player)
                if (now - ill.lastShot > C.reloadTime) {
                    ill.ammo = ill.maxAmmo;
                }

                // 4. Logic Bắn Đạn Thông Minh
                let wantToShoot = false;
                if (isFullEvo) {
                    let dx = enemy.x - ill.x;
                    if (Math.abs(dx) < 35 && Math.random() < 0.7) {
                        wantToShoot = true; // Nếu địch nằm ngay trên đầu/dưới chân -> Bắn quyết liệt
                    } else if (Math.random() < 0.03) {
                        wantToShoot = true; // Bắn ép góc/dọa dẫm ngẫu nhiên
                    }
                } else if (hasEvo2) {
                    if (Math.random() < 0.04) wantToShoot = true; // Bắn ngẫu nhiên vừa phải
                } else {
                    if (Math.random() < 0.015) wantToShoot = true; // Bắn hên xui (Base)
                }

                if (wantToShoot && ill.ammo > 0 && now - ill.lastShot > 500) {
                    let dirY = this.id === 1 ? -1 : 1;
                    this.bullets.push({
                        type: 'normal',
                        x: ill.x + ill.w / 2 - 2.5,
                        y: this.id === 1 ? ill.y : ill.y + ill.h,
                        w: 5, h: 5, vx: 0, vy: dirY * C.bulletSpeed,
                        dmg: this.damage * 0.25, owner: this, bounceCount: 0, hitIds: [], isPiercing: false
                    });
                    ill.ammo--;
                    ill.lastShot = now;
                }
            }

            // TẦNG 3: BÓNG MA HÙ DỌA (Đạn ảo)
            if (enemy.confusionStacks >= 3) {
                this.jumpscareTimer++;
                if (this.jumpscareTimer > 180 + Math.random() * 180) {
                    this.jumpscareTimer = 0;
                    let dirY = this.id === 1 ? -1 : 1;
                    this.fakeBullets.push({
                        x: enemy.x + (Math.random() > 0.5 ? 50 : -50),
                        y: this.id === 1 ? enemy.y + 120 : enemy.y - 120,
                        w: 5, h: 5, vx: 0, vy: -dirY * C.bulletSpeed // Bay ngược thẳng vào đối thủ
                    });
                }
            }

            // Di chuyển đạn ảo
            for (let i = this.fakeBullets.length - 1; i >= 0; i--) {
                let fb = this.fakeBullets[i];
                fb.x += fb.vx || 0; fb.y += fb.vy;
                if (fb.y < 0 || fb.y > canvas.height) this.fakeBullets.splice(i, 1);
            }
        }
        // --- LOGIC ĐỐT MÁU (FURNACE) ---
        if (this.burnTimer > 0) {
            this.burnTimer--;
            // Mỗi giây (60 frames) trừ máu
            if (this.burnTimer % 60 === 0 && this.hp > 1) {
                // Sát thương 0.05/s nhân với số stack cộng dồn
                this.hp -= (0.1 * this.burnStacks);
                if (this.hp < 1) this.hp = 1; // Không để chết vì Đốt
            }

            // [MỚI] Hết giờ -> Giảm dần 1 stack mỗi lần thay vì mất hết
            if (this.burnTimer <= 0 && this.burnStacks > 0) {
                this.burnStacks--; // Rớt 1 stack
                if (this.burnStacks > 0) {
                    // Nếu vẫn còn stack, duy trì thêm 1 giây (60 frames) để rớt từ từ
                    this.burnTimer = 60;
                }
            }
        }

        // --- LOGIC HỒI NỘI NĂNG (ENERGY REGEN) ---
        if (this.weapon === 'water_gun' || this.weapon === 'furnace') {
            // Evo 2 Súng Nước: Hồi liên tục 0.5%/s bất chấp hoàn cảnh
            if (this.weapon === 'water_gun' && this.hasUpgrade('evo_water_2')) {
                this.energy = Math.min(this.maxEnergy, this.energy + (0.5 / 60));
            }

            // Dừng bắn 1 giây (1000ms) bắt đầu hồi nội năng
            if (now - this.lastShot > 1000) {
                let regenRate = 10 / 60; // Base: 10%/giây
                if (this.weapon === 'water_gun' && this.hasUpgrade('evo_water_1')) {
                    regenRate = 15 / 60; // Evo 1: 15%/giây
                }
                this.energy = Math.min(this.maxEnergy, this.energy + regenRate);
            }
        }

        // --- GHI HÌNH QUÁ KHỨ (PARADOX) ---
        // Duplicate Paradox recording block removed

        // --- GHI HÌNH QUÁ KHỨ (PARADOX) ---
        if (this.weapon === 'paradox') {
            let hasEvo2 = this.hasUpgrade('evo_paradox_2');
            let isFullEvo = this.hasUpgrade('evo_paradox_1') && hasEvo2;

            // Tạm thời khởi tạo shot: false, sẽ được kiểm tra lại ĐÚNG THỜI ĐIỂM BẮN ở bên dưới
            this.paradoxHistory.push({ x: this.x, y: this.y, hp: this.hp, shot: false });

            // RÚT NGẮN XUỐNG 3 GIÂY (180 FRAMES)
            if (this.paradoxHistory.length > 180) {
                let oldest = this.paradoxHistory.shift();

                // EVO 2: Bóng ma tự động tái hiện lại CHÍNH XÁC phát bắn của 3s trước
                if (hasEvo2 && oldest.shot) {
                    let dmgMult = isFullEvo ? 1.0 : 0.5; // Full Evo = 100% dame, Evo 2 = 50% dame
                    let dirY = (this.id === 1) ? -1 : 1;

                    this.bullets.push({
                        type: 'normal',
                        x: oldest.x + this.w / 2 - 2.5,
                        y: (this.id === 1) ? oldest.y : oldest.y + this.h,
                        w: 5, h: 5,
                        vx: 0, vy: dirY * C.bulletSpeed,
                        dmg: this.damage * dmgMult,
                        owner: this, bounceCount: 0, hitIds: [], isPiercing: false
                    });

                    explosions.push(new Explosion(oldest.x + this.w / 2, oldest.y + this.h / 2, 20, 'cyan', 0, this));
                }
            }

            // Lưu tọa độ địch
            const enemy = (this.id === 1) ? p2 : p1;
            this.enemyHistory.push({ x: enemy.x, y: enemy.y });
            if (this.enemyHistory.length > 180) this.enemyHistory.shift();

            if (this.paradoxCooldown > 0) this.paradoxCooldown--;
        }

        // handleShooting called once at end of update
        // [FIX LỖI 1] - ĐÁNH DẤU LỊCH SỬ CHỈ KHI ĐẠN THỰC SỰ ĐƯỢC BẮN RA (Bỏ qua những frame đang chờ Cooldown)
        if (this.weapon === 'paradox' && this.paradoxHistory.length > 0) {
            if (this.lastShot === now) {
                this.paradoxHistory[this.paradoxHistory.length - 1].shot = true;
            }
        }
        // ... trong phương thức update() ...

        if (this.weapon === 'ghost') {

            if (this.isGhostActive) {
                // 1. ĐANG TRONG TRẠNG THÁI VÔ ẢNH
                // Chỉ giảm thời gian hiệu lực, KHÔNG tăng thời gian hồi chiêu
                this.ghostActiveTimer--;

                // Hiệu ứng visual (con trỏ chuột debug nếu là P1)
                if (this.id === 1) document.getElementById('gameCanvas').style.cursor = 'wait';
                if (this.ghostActiveTimer <= 0 && this.id === 1) document.getElementById('gameCanvas').style.cursor = 'default';

                // Hết thời gian Vô Ảnh
                if (this.ghostActiveTimer <= 0) {
                    this.isGhostActive = false;
                    this.ghostTimer = 0; // RESET hồi chiêu về 0 để bắt đầu đếm lại
                }

            } else {
                // 2. ĐANG TRONG TRẠNG THÁI HỒI CHIÊU (Bình thường)
                this.ghostTimer++;

                // Kiểm tra nếu đã hồi xong
                if (this.ghostTimer >= this.ghostCooldown) {
                    this.isGhostActive = true;
                    this.ghostActiveTimer = this.ghostDuration; // Nạp đầy thời gian hiệu lực
                    // Fix Evo 2 (Ảo Ảnh): Tự động sinh Tàn Ảnh (Decoy) ngay tại vị trí vừa kích hoạt!
                    if (this.hasUpgrade('evo_ghost_2')) {
                        ghostDecoys.push(new GhostDecoy(this.x, this.y, this.w, this.h, this));
                        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, "TÀN ẢNH XUẤT HIỆN! 👻", "#bdc3c7", 13);
                    }
                }
            }

            // Logic Tàn Ảnh liên tục (Evo 2)
            if (this.hasUpgrade('evo_ghost_2')) {
                this.posHistory.push({ x: this.x, y: this.y });
                if (this.posHistory.length > 20) this.posHistory.shift();

                this.phantomTimer = (this.phantomTimer || 0) + 1;
                // Cứ mỗi 90 frame (1.5s) tạo 1 tàn ảnh đánh lừa
                if (this.phantomTimer >= 90) {
                    this.phantomTimer = 0;
                    ghostDecoys.push(new GhostDecoy(this.x, this.y, this.w, this.h, this));
                }
            }
        }

        // --- LOGIC AAA (AUTO FIRE) ---
        if (this.weapon === 'aaa') {
            this.aaaAutoTimer++;
            if (this.aaaAutoTimer >= this.aaaAutoInterval) {
                this.aaaAutoTimer = 0;

                // Tự bắn thường
                let shots = this.hasUpgrade('evo_aaa_1') ? 3 : 1;

                for (let i = 0; i < shots; i++) {
                    setTimeout(() => {
                        this.fireBullet(1); // Bắn đạn thường
                    }, i * 200); // Burst delay
                }

                // Evo 2: Mưa Tên Lửa (Rơi 3 bom ngẫu nhiên)
                if (this.hasUpgrade('evo_aaa_2')) {
                    const enemy = (this.id === 1) ? p2 : p1;
                    for (let k = 0; k < 3; k++) {
                        let rx = Math.random() * canvas.width;
                        let ry = (this.id === 1) ? (Math.random() * canvas.height / 2) : (canvas.height / 2 + Math.random() * canvas.height / 2);
                        mortars.push(new MortarMarker(rx, ry, this, true));
                    }
                }
            }
        }
        if (this.weapon === 'engineer') {
            let hasEvo1 = this.hasUpgrade('evo_eng_1');
            let hasEvo2 = this.hasUpgrade('evo_eng_2');
            let isFullEvo = hasEvo1 && hasEvo2;

            // 1. Tự động sinh Ụ súng thường (2s nếu Full Evo, 5s nếu thường)
            let normalInterval = isFullEvo ? 120 : 300;
            this.turretTimer = (this.turretTimer || 0) + 1;
            if (this.turretTimer >= normalInterval) {
                turrets.push(new Turret(this, false));
                this.turretTimer = 0;
            }

            // 2. Cooldown quá tải
            if (this.overloadCooldown > 0) this.overloadCooldown--;

            // 3. Quá tải đang kích hoạt (kéo dài 600s = 36000 frames)
            if (this.isOverloaded) {
                this.overloadDuration--;
                if (this.overloadDuration % 5 === 0) {
                    ctx.fillStyle = "#00ffff"; ctx.fillRect(this.x + Math.random() * this.w, this.y, 2, this.h);
                }
                if (this.overloadDuration <= 0) {
                    this.isOverloaded = false;
                    this.silenceTimer = 60; // Câm lặng 1s
                    this.slowTimer = 300;   // Giảm tốc 5s
                    this.overloadCooldown = 480; // Cooldown 8s
                    addFloatingText(this.x + this.w / 2, this.y - 15, "QUÁ TẢI KẾT THÚC!", "#ff3300", 14);
                }
            }

            // 4. Nhấn giữ nút bắn:
            // - Giữ 1s (60 frames) -> Đặt Ụ súng thông minh
            // - Giữ 2s (120 frames) nếu có Evo 2 -> Bật Quá Tải
            if (inp.s) {
                this.smartTurretCharge = (this.smartTurretCharge || 0) + 1;

                // Visual vòng tụ lực
                ctx.save();
                ctx.strokeStyle = this.smartTurretCharge >= 60 ? "#ffff00" : "#00ffff";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                let chargeProgress = (this.smartTurretCharge < 60) ? (this.smartTurretCharge / 60) : ((this.smartTurretCharge - 60) / 60);
                ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 28, 0, Math.min(1, chargeProgress) * Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                if (this.smartTurretCharge === 60) {
                    // Đặt Ụ súng thông minh
                    let smartTurrets = turrets.filter(t => t.active && t.owner === this && t.isSmart);
                    let maxSmart = isFullEvo ? 5 : (hasEvo1 ? 3 : 2);
                    if (smartTurrets.length >= maxSmart) {
                        let oldest = smartTurrets[0];
                        oldest.active = false;
                        explosions.push(new Explosion(oldest.x + oldest.w / 2, oldest.y + oldest.h / 2, 25, '#00ffff', 0, this));
                    }
                    turrets.push(new Turret(this, true));
                    soundSystem.playPowerup();
                    addFloatingText(this.x + this.w / 2, this.y - 15, "Ụ THÔNG MINH!", "#00ffff", 14);
                } else if (this.smartTurretCharge >= 120 && hasEvo2 && !this.isOverloaded && (this.overloadCooldown || 0) <= 0 && this.maxHp > 1) {
                    // Kích hoạt Quá Tải (Evo 2 / Full Evo)
                    this.isOverloaded = true;
                    this.overloadDuration = 36000; // 600s
                    this.maxHp = Math.max(1, this.maxHp - 1); // Đánh đổi 1 máu tối đa
                    this.hp = Math.min(this.hp, this.maxHp);

                    if (isFullEvo) {
                        this.shield = (this.shield || 0) + 1; // Khiên 900s
                        this.overloadShieldTimer = 54000;
                    }
                    soundSystem.playPowerup();
                    explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 80, 'yellow', 0, this));
                    addFloatingText(this.x + this.w / 2, this.y - 20, "QUÁ TẢI (600s)!", "#ffff00", 16);
                    this.smartTurretCharge = 0; // Reset tụ lực sau khi bật quá tải
                }
            } else {
                this.smartTurretCharge = 0;
            }
        }

        // ==========================================
        // --- LOGIC SẤM CHỚP (THUNDER) ---
        // ==========================================
        if (this.weapon === 'thunder') {
            // Giảm hồi chiêu sau khi thu thương hoặc dùng kỹ năng (cần 1s để tiếp tục ném)
            if ((this.thunderActionCooldown || 0) > 0) {
                this.thunderActionCooldown--;
            }

            // Cảnh báo Lôi Minh / Thiên Kiếp trước khi bắn (0.25s)
            if ((this.thunderRaycastWarningTimer || 0) > 0) {
                this.thunderRaycastWarningTimer--;
                if (this.thunderRaycastWarningTimer <= 0) {
                    this.fireThunderRaycast(Date.now());
                }
            }

            // 1. Cảnh báo Thu Thương (15 frame ~ 0.25s)
            if (this.thunderIsRecallWarning) {
                this.thunderRecallWarningTimer--;
                if (this.thunderRecallWarningTimer <= 0) {
                    this.thunderIsRecallWarning = false;
                    this.executeThunderRecall();
                }
            }

            // 2. Trảm Lôi Liên Hoàn
            if (this.thunderIsSlashing) {
                this.thunderSlashTimer = (this.thunderSlashTimer || 0) + 1;
                if (this.thunderSlashTimer >= 30) {
                    this.thunderSlashTimer = 0;
                    if (this.thunderSlashQueue && this.thunderSlashIndex < this.thunderSlashQueue.length) {
                        let sp = this.thunderSlashQueue[this.thunderSlashIndex];
                        this.thunderSlashIndex++;
                        this.x = Math.max(0, Math.min(canvas.width - this.w, sp.x - this.w / 2));
                        this.y = Math.max(0, Math.min(canvas.height - this.h, sp.y - this.h / 2));

                        let radius = 60;
                        let enemy = (this.id === 1) ? p2 : p1;
                        let hasEvo1 = this.hasUpgrade('evo_thun_1');
                        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, radius, 'rgba(255, 255, 0,', 1.0, this));
                        if (enemy && enemy.hp > 0 && Math.hypot((enemy.x + enemy.w / 2) - (this.x + this.w / 2), (enemy.y + enemy.h / 2) - (this.y + this.h / 2)) <= radius) {
                            enemy.takeDamage(1.0, this);
                            if (hasEvo1) {
                                enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, 60);
                                if (typeof addFloatingText === 'function') addFloatingText(enemy.x + enemy.w / 2, enemy.y - 12, "TÊ LIỆT! ⚡", "#ffff00", 14);
                            }
                        }
                        this.thunderSpears = Math.min(3, (this.thunderSpears || 0) + 1);
                        if (soundSystem && !soundSystem.muted) soundSystem.playHit();
                    } else {
                        // Kết thúc chuỗi Trảm Lôi -> tốc biến về vị trí ban đầu
                        if (this.thunderOriginPos) {
                            this.x = this.thunderOriginPos.x;
                            this.y = this.thunderOriginPos.y;
                        }
                        this.thunderIsSlashing = false;
                        this.isInvulnerable = false;
                        this.thunderSpears = 3;
                        this.thunderActionCooldown = 60; // 1s (60 ticks) cooldown sau khi kết thúc skill
                        this.lastShot = Date.now();
                        this.thunderLoiMinhStacks = (this.thunderLoiMinhStacks || 0) + 1;
                        if (this.thunderLoiMinhStacks >= 3) {
                            this.activateThienKiep();
                        }
                    }
                }
            }

            // 3. Thời gian Thiên Kiếp
            if (this.thunderLoiMinhTimer > 0) {
                this.thunderLoiMinhTimer--;
                if (this.thunderLoiMinhTimer % 12 === 0 && typeof spawnSparkParticles === 'function') {
                    spawnSparkParticles(this.x + Math.random() * this.w, this.y + Math.random() * this.h, "#ffd700", 2);
                }
            }

            // 4. Full Evo: Bão Sấm Thịnh Nộ (2.5s sét đánh 1 lần, báo trước 0.5s)
            if (this.hasUpgrade('evo_thun_1') && this.hasUpgrade('evo_thun_2')) {
                this.thunderFullEvoTimer = (this.thunderFullEvoTimer || 0) + 1;
                if (this.thunderFullEvoTimer >= 150) {
                    this.thunderFullEvoTimer = 0;
                    let rx = 30 + Math.random() * (canvas.width - 60);
                    let ry = 40 + Math.random() * (canvas.height - 80);
                    let hazard = new ArtilleryHazard(rx, ry);
                    hazard.detonateTime = 500;
                    hazard.maxR = 50;
                    hazard.explode = function() {
                        this.active = false;
                        explosions.push(new Explosion(this.x, this.y, this.maxR, 'rgba(255, 255, 0,', 1.5, null, true));
                        [p1, p2].forEach(p => {
                            if (p && p.hp > 0 && Math.hypot((p.x + p.w / 2) - this.x, (p.y + p.h / 2) - this.y) <= this.maxR) {
                                p.takeDamage(1.5, null);
                                p.freezeTimer = Math.max(p.freezeTimer || 0, 60);
                                if (typeof addFloatingText === 'function') addFloatingText(p.x + p.w / 2, p.y - 12, "SẤM GIẬT! ⚡", "#ffff00", 14);
                            }
                        });
                    };
                    artilleryHazards.push(hazard);
                }
            }

            // Visual tụ lực của Thunder được vẽ tại draw() để đồng bộ render loop
        }

        // ==========================================
        // --- LOGIC NAM CHÂM (MAGNET) ---
        // ==========================================
        if (this.weapon === 'magnet') {
            // 1. Lướt Từ Tính (Polar Dash)
            // 1. Lướt Từ Tính (Polar Dash) - Chỉ lướt theo trục ngang (X) trên baseline
            if (this.isPolarDashing && this.polarDashTarget) {
                let t = this.polarDashTarget;
                let dx = t.x - (this.x + this.w / 2);
                let dist = Math.abs(dx);
                let dashSpeed = 26;
                this.y = (this.id === 1) ? canvas.height - this.h - 22 : 20;

                if (dist <= dashSpeed) {
                    this.x = Math.max(0, Math.min(canvas.width - this.w, t.x - this.w / 2));
                    this.isPolarDashing = false;
                    this.isInvulnerable = false;
                    t.active = false;
                    let dashDmg = this.hasUpgrade('evo_mag_net_1') ? 2.0 : 1.0;
                    let radius = 60;
                    explosions.push(new Explosion(t.x, t.y, radius, this.magnetPolarity === 1 ? 'rgba(255, 60, 0,' : 'rgba(0, 180, 255,', dashDmg, this));
                    let enemy = (this.id === 1) ? p2 : p1;
                    if (enemy && enemy.hp > 0 && Math.hypot((enemy.x + enemy.w / 2) - t.x, (enemy.y + enemy.h / 2) - t.y) <= radius) {
                        enemy.takeDamage(dashDmg, this);
                    }
                    triggerScreenShake(5, 8);
                } else {
                    this.x += (dx > 0 ? 1 : -1) * dashSpeed;
                }
            } else if (this.weapon === 'magnet') {
                this.y = (this.id === 1) ? canvas.height - this.h - 22 : 20;
            }

            // Visual vòng tụ lực đảo cực
            if (this.magnetHoldFrames > 0) {
                ctx.save();
                ctx.strokeStyle = this.magnetHoldFrames >= 25 ? (this.magnetPolarity === 1 ? "#00aaff" : "#ff3300") : "#ffffff";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                let progress = Math.min(1, this.magnetHoldFrames / 25);
                ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 24, 0, progress * Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        }

        // Đếm lùi nhiễm từ tính trên người chơi
        if (this.infectedPolarityTimer > 0) {
            this.infectedPolarityTimer--;
            if (this.infectedPolarityTimer <= 0) {
                this.infectedPolarity = 0;
            }
        }

        // ==========================================
        // --- LOGIC VUA ĐẦU BẾP (SUKUNA) ---
        // ==========================================
        if (this.weapon === 'sukuna') {
            let hasEvo1 = this.hasUpgrade('evo_sukuna_1');
            let hasEvo2 = this.hasUpgrade('evo_sukuna_2');
            let isFullEvo = hasEvo1 && hasEvo2;

            // 1. Tự động hồi Chú Lực theo thời gian
            // [BUFF]: Tăng Chú Lực cơ bản từ 5/s lên 10/s (0.167/frame), khi Full Evo & HP < 2 tăng lên 35/s
            let ceRegen = (this.hp < 2 && isFullEvo) ? (35 / 60) : (10 / 60);

            // BÙ LẠI: Khi nhận sát thương, sau 1s (60 frame) mới hồi Chú lực
            if (this.sukunaCeLockTimer > 0) {
                this.sukunaCeLockTimer--;
            } else if (!effectiveInp.s && !this.domainActive) {
                this.cursedEnergy = Math.min(100, this.cursedEnergy + ceRegen);
            }

            // [BUFF HỒI MÁU NỘI TẠI]: Hồi chậm ngoài giao tranh khi an toàn (+0.25 HP mỗi 4s)
            if ((this.sukunaCeLockTimer || 0) <= 0 && this.hp < this.maxHp) {
                this.sukunaPassiveHealTimer = (this.sukunaPassiveHealTimer || 0) + 1;
                if (this.sukunaPassiveHealTimer >= 240) {
                    this.hp = Math.min(this.maxHp, this.hp + 0.25);
                    this.sukunaPassiveHealTimer = 0;
                }
            } else {
                this.sukunaPassiveHealTimer = 0;
            }

            if (effectiveInp.s) {
                this.sukunaChargeTimer++;
                let chargeSec = this.sukunaChargeTimer / 60;
                let timePlayed = Date.now() - gameState.roundStartTime;
                let isSuddenDeath = timePlayed > C.suddenDeathTime;

                // ====================================================
                // [FIX LỖI CHÉM KHÔNG MƯỢT VÀ LỖI CHẠM ĐIỆN THOẠI]
                // Bắn NGAY LẬP TỨC ở Frame đầu tiên chạm nút (Chỉ 1 phát)
                // ====================================================
                if (this.sukunaChargeTimer === 1 && !this.domainActive) {
                    // ✅ THÊM COOLDOWN 300ms: now - this.lastShot > 300
                    if (this.cursedEnergy >= 10 && now - this.lastShot > 300) {
                        this.cursedEnergy -= 5;
                        this.lastShot = now; // Lưu lại mốc thời gian bắn để chống spam
                        this.bullets.push({
                            type: 'sukuna_dismantle',
                            x: this.x + this.w / 2 - (hasEvo2 ? 30 : 15),
                            y: (this.id === 1) ? this.y - 15 : this.y + this.h,
                            w: hasEvo2 ? 60 : 30, h: 6,
                            vx: 0,
                            vy: (this.id === 1) ? -18 : 18,
                            dmg: 1, owner: this, hitIds: [], isSukunaSlash: true
                        });
                    }
                }

                // --- CƠ CHẾ 4: NHÁT CHÉM THẾ GIỚI (WORLD CLEAVE) ---
                if (isFullEvo && isSuddenDeath && this.cursedEnergy >= 100 && this.sukunaDomainUsed && this.sukunaFugaCount >= 3) {
                    if (chargeSec >= 8.0) {
                        effectiveInp.l = false; effectiveInp.r = false;
                        let enemy = (this.id === 1) ? p2 : p1;
                        this.worldCleaveTarget = enemy;

                        if (chargeSec >= 9.0) {
                            enemy.hp = 0;
                            enemy.ghostHp = 0;
                            this.cursedEnergy = 0;
                            this.sukunaChargeTimer = 0;
                            this.worldCleaveTarget = null;
                            if (gameState.phase === 'playing') triggerFatalCinematic(this.id, enemy);
                        }
                        return;
                    }
                }

                // --- CƠ CHẾ 3: BÀNH TRƯỚNG LÃNH ĐỊA ---
                if (isFullEvo && chargeSec >= 5.0 && chargeSec < 8.0) {
                    if (!this.domainActive && this.cursedEnergy >= 50) {
                        this.domainActive = true;
                        this.sukunaDomainUsed = true;
                        this.cursedEnergy -= 50;
                    }
                }

                if (this.domainActive) {
                    this.cursedEnergy -= (2 / 60);
                    if (this.cursedEnergy <= 0) {
                        this.domainActive = false;
                    } else {
                        effectiveInp.l = false; effectiveInp.r = false;

                        if (Math.random() < 0.2) {
                            let enemy = (this.id === 1) ? p2 : p1;
                            let startX = (Math.random() > 0.5) ? enemy.x - 150 : enemy.x + enemy.w + 150;
                            let startY = enemy.y + (Math.random() * enemy.h * 2 - enemy.h);

                            this.bullets.push({
                                type: 'sukuna_dismantle',
                                x: Math.max(10, Math.min(canvas.width - 20, startX)), y: startY,
                                w: hasEvo2 ? 60 : 30, h: 8,
                                vx: (startX < enemy.x) ? 15 : -15, vy: (Math.random() * 4 - 2),
                                dmg: 0.5, owner: this, hitIds: [], isSukunaSlash: true
                            });
                        }

                        let enemy = (this.id === 1) ? p2 : p1;
                        if (enemy) {
                            enemy.takeDamage(0.1 / 60, this, { bypassShield: true });
                        }
                    }
                }

                // --- CƠ CHẾ 2: PHẢN CHUYỂN THẦN TỐC (RCT) ---
                if (!this.domainActive && !(hasEvo1 && this.cursedEnergy >= 100 && chargeSec >= 2.0)) {
                    if (chargeSec >= 1.2) {
                        effectiveInp.l = false; effectiveInp.r = false;

                        // [BUFF RCT]: Hồi máu nhanh và tốn ít Chú Lực hơn
                        let healInterval = isFullEvo ? 300 : 600;
                        let ceCost = isFullEvo ? 10 : 18;

                        let now = Date.now();
                        this.lastRctHealTime = this.lastRctHealTime || 0;

                        if (now - this.lastRctHealTime >= healInterval) {
                            if (this.cursedEnergy >= ceCost && this.hp < this.maxHp) {
                                this.hp = Math.min(this.maxHp, this.hp + 1.25);
                                this.cursedEnergy -= ceCost;
                                this.lastRctHealTime = now;
                                explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 45, 'rgba(0, 255, 100,', 0, this));
                                addFloatingText(this.x + this.w / 2, this.y - 15, "+1.25 HP", "#00ff88", 14);
                                soundSystem.playPowerup();
                            }
                        }
                    }
                }

            } else {
                // NHẢ NÚT BẮN
                let chargeSec = this.sukunaChargeTimer / 60;
                this.worldCleaveTarget = null;

                if (this.domainActive) {
                    this.domainActive = false;
                }

                // PHÓNG FUGA (HỎA MŨI TÊN)
                if (hasEvo1 && this.cursedEnergy >= 99.5 && chargeSec >= 2.0 && chargeSec < 8.0) {
                    this.sukunaFugaCount++;
                    let fugaSize = 45;
                    this.bullets.push({
                        type: 'sukuna_fuga',
                        x: this.x + this.w / 2 - fugaSize / 2,
                        y: (this.id === 1) ? this.y - 10 : this.y + this.h,
                        w: fugaSize, h: fugaSize,
                        vx: 0,
                        vy: (this.id === 1) ? -7 : 7,
                        dmg: 3.5, owner: this, hitIds: [], isFuga: true
                    });
                    this.cursedEnergy = 0;
                }

                // Xóa bỏ code bắn Dismantle khi nhả nút ở đây để không bị đè nhát chém!
                this.sukunaChargeTimer = 0;
            }
        }


        // --- LOGIC CUỒNG PHONG (STORM) ---
        if (this.weapon === 'storm') {
            // 1. Xử lý Delay chờ chém (Dùng cho cả lúc Lao xong hoặc Dịch chuyển xong)
            if (this.stormSlashDelay > 0) {
                this.stormSlashDelay--;
                this.x += (Math.random() - 0.5) * 4; // Rung lắc
                if (this.stormSlashDelay <= 0) {
                    this.executeStormSlash();
                }
                return;
            }

            // Tự tụ lực Cuồng Phong (Auto-Charge): Tự nạp theo thời gian mà không cần nhấn giữ
            if (this.stormDashState === 0 && this.stormSlashDelay <= 0) {
                let chargeDuration = this.stormMaxChargeTime || 14000;
                this.stormAutoChargeTimer = Math.min(chargeDuration, (this.stormAutoChargeTimer || 0) + (1000 / 60));
                this.stormChargeRatio = this.stormAutoChargeTimer / chargeDuration;

                // Hiệu ứng "Mắt Bão" Evo 1: Xóa đạn quanh xe khi tự tụ > 50% và có khiên
                if (this.hasUpgrade('evo_storm_1') && this.stormChargeRatio > 0.5 && this.shield > 0) {
                    let enemyBullets = (this.id === 1) ? (typeof p2 !== 'undefined' ? p2.bullets : null) : (typeof p1 !== 'undefined' ? p1.bullets : null);
                    if (enemyBullets) {
                        for (let i = enemyBullets.length - 1; i >= 0; i--) {
                            let b = enemyBullets[i];
                            let d = Math.hypot((this.x + this.w / 2) - b.x, (this.y + this.h / 2) - b.y);
                            if (d < 80) enemyBullets.splice(i, 1);
                        }
                    }
                }
            }

            // Passive Evo 2 (Bóng tự động)
            if (this.hasUpgrade('evo_storm_2')) {
                this.stormShadowTimer++;
                if (this.stormShadowTimer >= this.stormShadowCooldown) {
                    this.fireStormShadow();
                    this.stormShadowTimer = 0;
                    this.stormShadowCooldown = 180 + Math.random() * 300;
                }
            }


            // 2. [KHÔI PHỤC] Xử lý Lao Thân Mình (Normal Dash)
            if (this.stormDashState === 1) {
                let dir = (this.id === 1) ? -1 : 1;
                this.y += 18 * dir; // Tốc độ lao

                // --- KIỂM TRA VA CHẠM KHI LAO ---
                let hitObstacle = false;

                // A. Tường bao quanh map
                if (this.y < 0 || this.y > canvas.height - this.h) {
                    this.y = (this.y < 0) ? 0 : canvas.height - this.h;
                    hitObstacle = true;
                }
                // B. Địch
                const enemy = (this.id === 1) ? p2 : p1;
                if (rectIntersect(this.x, this.y, this.w, this.h, enemy.x, enemy.y, enemy.w, enemy.h)) hitObstacle = true;

                // C. Thanh Ngang
                if (typeof movingObstacle !== 'undefined' && movingObstacle && movingObstacle.active && rectIntersect(this.x, this.y, this.w, this.h, movingObstacle.x, movingObstacle.y, movingObstacle.w, movingObstacle.h)) hitObstacle = true;

                // D. Xe Tiền
                if (typeof moneyTrucks !== 'undefined') {
                    for (let t of moneyTrucks) {
                        if (t.active && rectIntersect(this.x, this.y, this.w, this.h, t.x, t.y, t.w, t.h)) { hitObstacle = true; break; }
                    }
                }
                // E. Thùng
                if (typeof crates !== 'undefined') {
                    for (let c of crates) {
                        if (c.active && rectIntersect(this.x, this.y, this.w, this.h, c.x, c.y, c.w, c.h)) { hitObstacle = true; break; }
                    }
                }
                // F. Ụ SÚNG (TURRETS)
                for (let t of turrets) {
                    if (t.active && t.owner.id !== this.id && rectIntersect(this.x, this.y, this.w, this.h, t.x, t.y, t.w, t.h)) {
                        hitObstacle = true; break;
                    }
                }
                // G. TƯỜNG SNIPER [CẬP NHẬT MỚI]
                if (typeof sniperWalls !== 'undefined') {
                    for (let w of sniperWalls) {
                        if (w.active && rectIntersect(this.x, this.y, this.w, this.h, w.x, w.y, w.w, w.h)) {
                            hitObstacle = true; break;
                        }
                    }
                }

                // Nếu va chạm -> Dừng lại -> Chuẩn bị chém (Phát chém sẽ dùng checkHits để phá hủy công trình)
                if (hitObstacle) {
                    this.stormDashState = 0;
                    this.stormSlashDelay = 30; // Chờ 0.5s rồi chém
                }
                return;
            }
        }
        // --- LOGIC FULL EVO: PHONG TRẢM (WIND SLASH) ---
        if (this.weapon === 'wind_slash' && this.hasUpgrade('evo_wind_1') && this.hasUpgrade('evo_wind_2')) {
            this.windWallTimer++;
            // 8 giây = 480 frames
            if (this.windWallTimer >= 480) {
                this.windWallTimer = 0;
                // Tạo tường gió phía trước mặt
                let wallY = (this.id === 1) ? this.y - 60 : this.y + this.h + 40;
                let wallX = this.x + this.w / 2 - 60; // Căn giữa

                // Đảm bảo tường không ra ngoài map
                if (wallX < 0) wallX = 0;
                if (wallX > canvas.width - 120) wallX = canvas.width - 120;

                windWalls.push(new WindWall(wallX, wallY, this));

                // Hiệu ứng visual
                ctx.fillStyle = "cyan"; ctx.font = "bold 14px Arial";
                ctx.fillText("WIND WALL!", this.x, this.y - 20);
            }
        }

        // --- LOGIC FULL EVO: CUỒNG PHONG (STORM) ---
        if (this.weapon === 'storm' && this.hasUpgrade('evo_storm_1') && this.hasUpgrade('evo_storm_2')) {
            // Bật cờ trời mưa
            isRaining = true;
        } else {
            // Nếu không ai có Storm Full Evo thì tắt mưa (trừ khi đối thủ có)
            // Logic này đơn giản, nếu muốn chuẩn hơn phải check cả 2 player
        }


        if (this.weapon === 'smg' && this.hasUpgrade('evo_smg_2')) {
            // Nếu không bắn trong 5 giây (5000ms) -> Hồi đầy đạn
            if (now - this.lastShot > 5000 && this.ammo < this.maxAmmo) {
                this.ammo = this.maxAmmo;
                // Hiệu ứng visual báo hồi đạn
                ctx.fillStyle = "#00ff00"; ctx.font = "10px Arial";
                ctx.fillText("RELOADED!", this.x, this.y - 10);
            }
        }


        // --- LOGIC TANK HÚC ---
        if (this.weapon === 'tank') {
            this.passiveShieldTimer++;
            let shieldLimit = (this.hasUpgrade('evo_tank_1') && this.hasUpgrade('evo_tank_2')) ? 120 : (this.hasUpgrade('evo_tank_2') ? 240 : 360);
            if (this.passiveShieldTimer >= shieldLimit) {
                this.shield++;
                this.passiveShieldTimer = 0;
            }

            if (this.dashState === 1) {
                let dir = (this.id === 1) ? -1 : 1;
                this.y += this.dashSpeed * dir;

                this.checkDashCollision();

                if (this.y < 0 || this.y > canvas.height - this.h) {
                    if (this.hasUpgrade('evo_tank_2') && this.shield > 0) {
                        let wallY = (this.y < 0) ? 0 : canvas.height - this.h;
                        explosions.push(new Explosion(this.x + this.w / 2, wallY + this.h / 2, 80, 'rgba(255,0,0,', 2, this));
                        iceZones.push(new IceZone(this.x + this.w / 2, wallY + this.h / 2, 60, 300, this));
                    }

                    if (this.hasUpgrade('evo_tank_1')) {
                    } else {
                        if (this.shield > 0) this.shield = 0;
                        else this.hp -= 3;
                    }

                    this.dashState = 2;
                }
                return;
            } else if (this.dashState === 2) {
                let dir = (this.id === 1) ? 1 : -1;
                this.y += (this.dashSpeed * 0.5) * dir;
                if ((this.id === 1 && this.y >= this.dashStartY) || (this.id === 2 && this.y <= this.dashStartY)) {
                    this.y = this.dashStartY;
                    this.dashState = 0;
                }
                return;
            }
        }


        // --- NỘI TẠI KIẾM THỂ THỦ ---
        if ((this.weapon === 'blade_god' || this.weapon === 'van_kiem') && this.shield > 0 && !this.swordShieldActive) {
            this.shield--; // Chuyển hóa 1 lớp khiên thường thành Kiếm Thể
            this.swordShieldActive = true;
            this.swordShieldTimer = 60; // 5s
            this.swordShieldHits = (this.weapon === 'blade_god' && this.hasUpgrade('evo_blade_2')) ? 5 : 1;
        }

        if (this.swordShieldActive) {
            this.swordShieldTimer--;
            if (this.swordShieldTimer <= 0 || this.swordShieldHits <= 0) {
                // Đổi xong hoặc hết giờ -> Bắn trả kiếm
                this.swordShieldActive = false;
                let count = (this.weapon === 'blade_god' && this.hasUpgrade('evo_blade_2')) ? 5 : 3;
                let isHoming = (this.weapon === 'blade_god' && this.hasUpgrade('evo_blade_2'));
                let dirY = (this.id === 1) ? -1 : 1;

                for (let k = 0; k < count; k++) {
                    let angle = (Math.PI / count) * k - Math.PI / 2;
                    floatingSwords.push(new FloatingSword(this.x + this.w / 2, this.y, 10, 30, Math.cos(angle) * 10, dirY * 10, 0, this.damage, false, isHoming, this));
                }
            }
        }
        // ==========================================
        // --- LOGIC MIRROR (HOÁN ĐỔI VÀ BUFF GƯƠNG VỠ) ---
        // ==========================================
        if (this.weapon === 'mirror') {
            let hasEvo1 = this.hasUpgrade('evo_mirror_1');
            let hasEvo2 = this.hasUpgrade('evo_mirror_2');
            let isFullEvo = hasEvo1 && hasEvo2;

            if (this.mirrorCD > 0) this.mirrorCD--;
            if (this.mirrorBuffTimer > 0) {
                this.mirrorBuffTimer--;
                if (this.mirrorBuffTimer <= 0 && hasEvo1) this.dmgBuff -= 1;
            }

            if (effectiveInp.s && this.mirrorCD <= 0) {
                this.mirrorCharge++;

                if (this.mirrorCharge >= 60) { // Giữ đủ 1s
                    let mirrorX = canvas.width - (this.x + this.w);
                    let mirrorY = this.y;

                    explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 50, 'cyan', 0, this));

                    this.x = mirrorX;
                    this.y = mirrorY;
                    this.mirrorCharge = 0;

                    this.mirrorCD = hasEvo1 ? 180 : 300;
                    this.mirrorBuffTimer = 60;
                    this.speedBuffActive = true;
                    if (hasEvo1) {
                        this.dmgBuff += 1;
                        this.invincibleTimer = isFullEvo ? 60 : 30;
                    }

                    // [CƠ CHẾ GƯƠNG VỠ - SHATTERED MIRROR]
                    if (hasEvo2) {
                        const enemy = (this.id === 1) ? p2 : p1;
                        // Ngay lập tức tạo Ảnh Chiếu Kẻ Thù tại vị trí của địch
                        this.enemyClone = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h, active: true };

                        if (isFullEvo) {
                            // Tạo Ảnh Chiếu Tan Vỡ ở vị trí đối xứng qua TÂM MAP
                            this.shatteredClone = {
                                x: canvas.width - enemy.x - enemy.w,
                                y: canvas.height - enemy.y - enemy.h,
                                w: enemy.w, h: enemy.h,
                                hp: 5, // Cần vài hit để vỡ
                                active: true
                            };
                        }
                    }
                    explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 50, 'white', 0, this));
                }
            } else {
                if (!effectiveInp.s) this.mirrorCharge = 0;
            }
        }




        // --- DI CHUYỂN BÌNH THƯỜNG ---

        let currentSpeed = this.speed;
        if (this.slowTimer > 0) currentSpeed *= 0.5;
        if (this.acidBurnTimer > 0) currentSpeed *= 0.75;
        if (this.acidZoneSlow > 0) { currentSpeed *= 0.75; this.acidZoneSlow--; }
        if (this.weapon === 'genius' && this.isPilotingMecha) {
            let spdBonus = ((this.geniusUpgrades && this.geniusUpgrades['gen_speed']) || 0) * 0.15;
            currentSpeed *= 0.65 * (1 + spdBonus);
        }
        if (this.weapon === 'van_kiem' && this.isInSwordStance) {
            currentSpeed = this.hasUpgrade('evo_vk_2') ? 1.0 : 0; // Chậm lê lết hoặc bất động
        }
        if (this.weapon === 'sniper') {
            currentSpeed *= 0.5;
        }
        // THÊM BUFF TỐC ĐỘ CHO MIRROR
        if (this.weapon === 'mirror' && this.mirrorBuffTimer > 0) {
            currentSpeed += this.hasUpgrade('evo_mirror_1') ? 3 : 1.5;
        }
        // BUFF TỐC ĐỘ CHO GHOST KHI TÀNG HÌNH (VÔ ẢNH)
        if (this.weapon === 'ghost' && this.isGhostActive) {
            currentSpeed *= 1.25; // +25% tốc độ lướt khi tàng hình
        }
        // ==========================================
        // --- GIẢM TỐC ĐỘ SUKUNA KHI CẠN CHÚ LỰC ---
        // ==========================================
        if (this.weapon === 'sukuna') {
            let isFullEvo = this.hasUpgrade('evo_sukuna_1') && this.hasUpgrade('evo_sukuna_2');
            // Nếu không có Full Evo và Chú Lực < 15 (không đủ tung Ngự Trảo)
            if (!isFullEvo && this.cursedEnergy < 15) {
                currentSpeed *= 0.75; // Giảm 25% tốc độ di chuyển
            }
        }
        // ==========================================
        // --- LOGIC CUNG (BODY TỤ LỰC & MƯA TÊN) ---
        // ==========================================
        // Thêm vào đầu phần logic Cung trong Player.update()
        if (this.weapon === 'cung') {
            let isFullEvo = this.hasUpgrade('evo_cung_1') && this.hasUpgrade('evo_cung_2');
            let inp = effectiveInp;
            let enemy = (this.id === 1) ? p2 : p1;

            // Mưa toàn màn hình lặp lại mỗi 8 giây (Full Evo)
            if (isFullEvo) {
                if (this.globalRainTimer === undefined) this.globalRainTimer = 0;
                this.globalRainTimer++;
                if (this.globalRainTimer >= 480) { // 8 giây * 60fps
                    arrowRains.push(new ArrowRain(this, 0, 0, 0, true)); // Gọi mưa global
                    this.globalRainTimer = 0;
                }
            }

            // Giảm CD Mưa Tên (Full Evo giảm 8s -> còn 2s, mặc định 10s)
            let maxRainCD = isFullEvo ? 2000 : 10000;
            if (this.rainCD > 0) this.rainCD -= 1000 / 60;

            // Nội tại Nhạy Bén: Đếm ngược hồi chiêu né đạn (8s = 480 frames, Full Evo 5s = 300 frames)
            if (this.bowDodgeCooldown > 0) {
                this.bowDodgeCooldown--;
                if (this.bowDodgeCooldown <= 0) {
                    this.bowDodgeReady = true;
                    if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 10, "⚡ NHẠY BÉN SẴN SÀNG", "#00ffcc", 13);
                }
            }

            // 1. LOGIC LƯỚT (DASH) - Nội tại Cơ Động
            if (this.isDashing) {
                let dx = this.dashTargetX - this.x;
                let dy = this.dashTargetY - this.y;
                let dist = Math.hypot(dx, dy);

                if (dist < 5 || this.x <= 0 || this.x + this.w >= canvas.width || this.y <= 0 || this.y + this.h >= canvas.height) {
                    this.isDashing = false;
                    // Full Evo: Lướt xong hồi Full đạn
                    if (isFullEvo) this.ammo = this.maxAmmo;
                } else {
                    // Tốc độ lướt một quãng ngắn
                    this.x += (dx / dist) * 15;
                    this.y += (dy / dist) * 15;
                }
                return; // Đang lướt thì không làm hành động khác
            }

            // 2. LOGIC TỤ LỰC & BẮN CUNG MỚI (TAP TO CHARGE, TAP TO RELEASE)
            let shootJustPressed = inp.s && !this.prevInpS;
            this.prevInpS = !!inp.s;

            if (shootJustPressed) {
                if (!this.bowIsCharging && this.ammo > 0) {
                    // Tap 1: Bắt đầu tụ lực tự động
                    this.bowIsCharging = true;
                    this.bowChargeTimer = 0;
                    this.crosshairX = enemy.x + enemy.w / 2;
                    this.crosshairY = enemy.y + enemy.h / 2;
                } else if (this.bowIsCharging) {
                    // Tap 2: Nhả tên theo mốc thời gian đã sạc
                    let chargeSec = this.bowChargeTimer / 60;
                    this.fireBow(chargeSec, isFullEvo);
                    this.triggerBowDodgeDash(inp);
                    this.bowIsCharging = false;
                    this.bowChargeTimer = 0;
                }
            }

            // Trong lúc đang tụ lực
            if (this.bowIsCharging) {
                this.bowChargeTimer++;
                let chargeSec = this.bowChargeTimer / 60;

                // Tốc độ di chuyển chỉ bị giảm 15% (currentSpeed *= 0.85)
                currentSpeed *= 0.85;

                // Cập nhật hồng tâm đuổi theo địch khi chargeSec >= 2s
                if (chargeSec >= 2 && this.hasUpgrade('evo_cung_2')) {
                    let dx = (enemy.x + enemy.w / 2) - this.crosshairX;
                    let dy = (enemy.y + enemy.h / 2) - this.crosshairY;
                    this.crosshairX += dx * 0.1;
                    this.crosshairY += dy * 0.1;
                    let shrinkRatio = Math.min((chargeSec - 2) / 1.5, 1);
                    this.crosshairRadius = 150 - (shrinkRatio * 120);
                }

                // Tự động xả đạn nếu đạt mốc sạc tối đa (2.5s = 150 ticks) để chống kẹt trạng thái
                if (this.bowChargeTimer >= 150) {
                    this.fireBow(chargeSec, isFullEvo);
                    this.triggerBowDodgeDash(inp);
                    this.bowIsCharging = false;
                    this.bowChargeTimer = 0;
                }
            }

            // Vẽ vùng hồng tâm cảnh báo
            if (this.bowChargeTimer / 60 >= 2 && this.hasUpgrade('evo_cung_2')) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(this.crosshairX, this.crosshairY, this.crosshairRadius, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
            }
        }

        // ==========================================
        // --- LOGIC SHADOW HUNTER UPDATE ---
        // ==========================================
        if (this.weapon === 'shadow_hunter') {
            let hasEvo2 = this.hasUpgrade('evo_sh_2');
            if (this.stealthCooldown > 0) this.stealthCooldown--;

            if (this.stealthActive) {
                this.stealthTimer--;
                this.lastShot = now; // Không tự động hồi đạn trong lúc tàng hình

                // Tăng tốc độ chạy: +40% (hoặc +60% nếu có Evo 2)
                let spdBoost = hasEvo2 ? 1.6 : 1.4;
                currentSpeed *= spdBoost;

                // Cưỡng chế thoát sau 5s (300 ticks)
                if (this.stealthTimer <= 0) {
                    this.stealthActive = false;
                    this.stealthCooldown = 480; // 8s Cooldown
                    this.stealthEmpowered = false;
                    if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "STEALTH END", "#888", 12);
                }
            }
        }

        // ==========================================
        // --- LOGIC SHORTGUN UPDATE ---
        // ==========================================
        if (this.weapon === 'shortgunATK') {
            let hasEvo1 = this.hasUpgrade('evo_sg_1');
            let hasEvo2 = this.hasUpgrade('evo_sg_2');
            let isFullEvo = hasEvo1 && hasEvo2;
            let dirY = (this.id === 1) ? -1 : 1;

            // 1. Dash lao thẳng lên như tank, dừng lại khi có kẻ địch trong tầm bắn
            if (this.shortgunDashState === 1) {
                this.y += dirY * (this.shortgunDashSpeed || 22);

                // Quét tìm kẻ địch / mục tiêu trong phạm vi bắn trúng
                let myMidX = this.x + this.w / 2;
                let myFrontY = (dirY === -1) ? this.y : this.y + this.h;
                let targets = [];
                let enemy = (this.id === 1) ? p2 : p1;
                if (enemy && enemy.hp > 0) targets.push(enemy);
                if (typeof crates !== 'undefined') targets.push(...crates.filter(c => c.active));
                if (typeof moneyTrucks !== 'undefined') targets.push(...moneyTrucks.filter(t => t.active));
                if (typeof turrets !== 'undefined') targets.push(...turrets.filter(t => t.active && t.owner.id !== this.id));
                if (enemy && enemy.drones) targets.push(...enemy.drones.filter(d => d.active));

                let targetInRange = false;
                for (let t of targets) {
                    let tx = t.x + (t.w || 30) / 2;
                    let ty = t.y + (t.h || 30) / 2;
                    let dy = (ty - myFrontY) * dirY;
                    let dx = Math.abs(tx - myMidX);
                    // Phạm vi bắn trúng của shotgun: cách phía trước <= 130px và lệch ngang <= 65px
                    if (dy >= -10 && dy <= 130 && dx <= 65) {
                        targetInRange = true;
                        break;
                    }
                }

                // Dừng lại nếu gặp mục tiêu trong tầm bắn hoặc chạm tường biên
                let hitWall = (dirY === -1 && this.y <= 25) || (dirY === 1 && this.y >= canvas.height - this.h - 25);
                if (targetInRange || hitWall) {
                    this.shortgunDashState = 2; // Chuyển sang giai đoạn rút lui về baseline
                    this.fireShortgunBurst(isFullEvo, hasEvo1, hasEvo2);
                }
            } else if (this.shortgunDashState === 2) {
                // Rút lui về lại vị trí baseline ban đầu
                let returnDirY = (this.id === 1) ? 1 : -1;
                this.y += returnDirY * ((this.shortgunDashSpeed || 22) * 0.7);
                if ((this.id === 1 && this.y >= this.shortgunStartY) || (this.id === 2 && this.y <= this.shortgunStartY)) {
                    this.y = this.shortgunStartY;
                    this.shortgunDashState = 0;
                    this.isShortgunDashing = false;
                }
            }
        }

        // ==========================================
        // --- MOTION BLUR / GHOST TRAIL TRACKING ---
        // ==========================================
        let isDashingMotion = this.isDashing || this.isShortgunDashing || (this.weapon === 'tank' && this.isCharging) || (this.weapon === 'magician' && this.magicianSpeedBuff > 0);
        if (isDashingMotion) {
            if (!this.trailHistory) this.trailHistory = [];
            this.trailHistory.unshift({ x: this.x, y: this.y, w: this.w, h: this.h, color: this.color });
            if (this.trailHistory.length > 5) this.trailHistory.pop();
        } else if (this.trailHistory && this.trailHistory.length > 0) {
            this.trailHistory.pop();
        }

        // ==========================================
        // --- GIẢM TỐC 6 NÒNG DỰA TRÊN NHIỆT & XẢ ĐẠN ---
        if (this.weapon === 'six_barrel') {
            if (effectiveInp.s) currentSpeed *= 0.6; // Đang xả đạn giảm 40%
            if (this.heat >= 40) currentSpeed = 0; // Quá nóng: đứng yên hoàn toàn
            else if (this.heat >= 20) currentSpeed *= 0.35; // Nóng: giảm 65% tốc chạy
        }
        // --- GIẢM TỐC KHI NIỆM CHÚ GOJO & SUKUNA ---
        if (this.weapon === 'the_strongest' && (this.gojoChargeTimer || 0) > 0) {
            currentSpeed *= 0.35; // Làm chậm khi đang gồng niệm Chú Lực / Lãnh Địa
        }
        if (this.weapon === 'sukuna' && (this.sukunaChargeTimer || 0) > 0) {
            currentSpeed *= 0.35; // Làm chậm khi đang gồng niệm Lãnh Địa / Phản Chuyển
        }
        // --- GIẢM TỐC KHI PHUN LIÊN TỤC ---
        if (inp.s && this.energyChargeTimer >= 60) {
            if (this.weapon === 'water_gun' && this.hasUpgrade('evo_water_1')) {
                currentSpeed *= 0.2; // Súng nước kéo nặng -> Giảm tốc mạnh
            }
            if (this.weapon === 'furnace' && this.hasUpgrade('evo_furnace_1')) {
                currentSpeed *= 0.1; // Lò nung -> Chậm vừa
            }
        }

        if (inp.l) this.x -= currentSpeed;
        if (inp.r) this.x += currentSpeed;


        if (this.weapon === 'portal') {
            if (this.x < -this.w) { this.x = canvas.width; this.triggerPortalEffect(); }
            else if (this.x > canvas.width) { this.x = -this.w; this.triggerPortalEffect(); }
        } else {
            if (this.x < 0) this.x = 0;
            if (this.x > canvas.width - this.w) this.x = canvas.width - this.w;
        }

        // Tự động hồi đạn lẻ theo thời gian (Chặn khi Shadow Hunter đang tàng hình)
        if (this.weapon !== 'tank' && this.weapon !== 'sniper' && !(this.weapon === 'shadow_hunter' && this.stealthActive)) {
            if (this.ammo < this.maxAmmo && now - this.lastShot > this.reloadTime) {
                if (now - this.lastReload > 500) { this.ammo++; this.lastReload = now; }
            }
        }
        // --- LOGIC SNIPER (RELOAD VÀ TẠO TƯỜNG) ---
        if (this.weapon === 'sniper') {
            let isFullEvo = this.hasUpgrade('evo_sniper_1') && this.hasUpgrade('evo_sniper_2');

            // Trừ dần thời gian hồi chiêu của Tường
            if (this.sniperWallCooldown > 0) this.sniperWallCooldown--;

            // Tự động nạp đạn đầy sau 8s không bắn
            if (now - this.lastShot > 8000 && this.ammo < this.maxAmmo && !this.sniperReloading) {
                this.ammo = this.maxAmmo;
                ctx.fillStyle = "lime"; ctx.fillText("AUTO RELOAD", this.x, this.y - 15);
            }

            // Hết đạn -> Nạp nguyên băng (3s hoặc 2.5s)
            if (this.ammo <= 0 && !this.sniperReloading) {
                this.sniperReloading = true;
                this.sniperReloadTimer = isFullEvo ? 150 : 180;
            }

            if (this.sniperReloading) {
                this.sniperReloadTimer--;
                // Giảm thêm tốc độ khi đang đứng thay băng đạn
                currentSpeed *= 0.5;
                effectiveInp.s = false; // Khóa input bắn
                if (this.sniperReloadTimer <= 0) {
                    this.ammo = this.maxAmmo;
                    this.sniperReloading = false;
                }
            }

            // KIỂM TRA SỐ LƯỢNG TƯỜNG: Sniper chỉ được phép có 1 tường trên map tại 1 thời điểm
            let hasActiveWall = sniperWalls.some(w => w.owner === this && w.active && !w.isImmortal);

            // Tụ lực tạo tường
            if (effectiveInp.s && !this.sniperReloading && this.ammo > 0) {
                this.sniperChargeTimer++;

                // Đã giữ đủ 1 giây
                if (this.sniperChargeTimer >= 60) {
                    // Chỉ xuất tường nếu KHÔNG có tường nào active VÀ đã hết hồi chiêu
                    if (!hasActiveWall && this.sniperWallCooldown <= 0) {
                        let spawnY = (this.id === 1) ? this.y - 40 : this.y + this.h + 20;
                        sniperWalls.push(new SniperWall(this.x + this.w / 2 - 30, spawnY, this, false));
                        this.sniperChargeTimer = 0;

                        this.sniperWallCooldown = 300; // Bắt đầu đếm ngược hồi chiêu 10s
                        effectiveInp.s = false; // Nhả nút
                    } else {
                        // Đã đủ lực nhưng kẹt tường/cooldown -> giữ trạng thái nhưng không gọi tường
                        this.sniperChargeTimer = 60;
                    }
                }
            } else {
                // Hành động Nhả nút bắn
                if (this.sniperChargeTimer > 0 && this.ammo > 0) {
                    // Nếu kẹt tường hoặc chưa tụ đủ lực -> thả tay ra sẽ thành bắn đạn thường
                    this.fireBullet(1);
                    this.ammo--;
                    this.lastShot = now;
                }
                this.sniperChargeTimer = 0;
            }

            // [CẬP NHẬT DI CHUYỂN CỦA SNIPER]: Sử dụng tốc độ đã được tính toán chuẩn xác
            // Sniper movement handled cleanly by shared loop
        }
        // --- LOGIC NHIỆT (SIX BARREL) ---
        if (this.weapon === 'six_barrel') {
            if (this.isOverheated) {
                // Đang quá tải: Hạ nhiệt từ 100 về 0 trong đúng 5s (300 frames)
                this.heat -= (100 / 300);
                if (this.heat <= 0) {
                    this.heat = 0;
                    this.isOverheated = false;
                }
            } else {
                if (effectiveInp.s) {
                    // ĐANG BẮN: Tăng nhiệt nhanh dần
                    this.heatRestFrames = 0;
                    this.heatHoldFrames++;

                    // Công thức: Tăng nhiệt nhanh hơn 50% để hạn chế việc sấy đạn liên tục
                    let heatGain = 0.25 + (this.heatHoldFrames * 0.008);

                    // Evo 2: Tăng chậm lại ở mốc 75% (Cần 5s thay vì 3s)
                    if (this.hasUpgrade('evo_six_2') && this.heat >= 75) {
                        heatGain *= 0.4;
                    }

                    this.heat += heatGain;

                    // KIỂM TRA QUÁ TẢI (100%)
                    if (this.heat >= 100) {
                        this.heat = 100;
                        this.isOverheated = true;
                        this.silenceTimer = 300; // Câm lặng 5s

                        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 80, 'red', 0, this));
                        ctx.fillStyle = "red"; ctx.font = "bold 16px Arial";
                        ctx.fillText("QUÁ TẢI!", this.x, this.y - 20);

                        // Trừ máu
                        if (this.hasUpgrade('evo_six_2')) {
                            this.maxHp = Math.max(1, this.maxHp - 5);
                            this.hp = Math.min(this.hp, this.maxHp);
                        } else {
                            this.hp -= 5;
                            if (this.hp < 1) this.hp = 1; // Không để chết ngay lập tức do quá tải
                        }
                    }
                } else {
                    // NHẢ NÚT: Giảm nhiệt nhanh dần
                    this.heatHoldFrames = 0;
                    if (this.heat > 0) {
                        this.heatRestFrames++;
                        let heatDrop = 0.2 + (this.heatRestFrames * 0.01);

                        // Evo 2: Giảm cực nhanh khi < 50%
                        if (this.hasUpgrade('evo_six_2') && this.heat <= 50) {
                            heatDrop *= 2.5;
                        }

                        this.heat -= heatDrop;
                        if (this.heat < 0) this.heat = 0;
                    }
                }
            }
        }


        // Truyền input đã được xử lý câm lặng vào hàm bắn
        this.handleShooting(effectiveInp, now);

    }
    // cung 
    // --- CẬP NHẬT HÀM FIREBOW ---
    fireBow(chargeSec, isFullEvo) {
        if (this.ammo <= 0) return;
        let dirY = (this.id === 1) ? -1 : 1;

        let dmgMod = this.damage;
        let spdMod = C.bulletSpeed;
        let pierce = false;
        let dotSize = 8;

        // Xuyên thủng đưa về mốc 1s cho đồng bộ
        if (chargeSec >= 1 && this.hasUpgrade('evo_cung_1')) {
            pierce = true;
            dmgMod *= 0.5;
        }

        // --- MỐC MƯA TÊN (Tụ >= 2s) ---
        if (chargeSec >= 2 && this.hasUpgrade('evo_cung_2')) {
            if (this.rainCD <= 0) {
                arrowRains.push(new ArrowRain(this, this.crosshairX, this.crosshairY, this.crosshairRadius));
                this.rainCD = isFullEvo ? 2000 : 10000;
                this.ammo--;
                return;
            }

        }

        // --- CÁC MỐC BẮN CUNG THƯỜNG MỚI ---

        // 1. Mốc dưới 0.5s: 1 viên thường
        if (chargeSec < 0.5) {
            dmgMod += chargeSec * 0.5;
            spdMod += chargeSec * 2;
            this.bullets.push({
                type: 'arrow',
                x: this.x + this.w / 2 - dotSize / 2, y: (this.id === 1) ? this.y - dotSize : this.y + this.h,
                w: dotSize, h: dotSize, vx: 0, vy: dirY * spdMod, dmg: dmgMod, owner: this,
                isPiercing: pierce, hitIds: [], bounceCount: 0, spawnTime: Date.now()
            });
        }
        // 2. Mốc 0.5s đến 0.99s: Bắn 3 viên thẳng
        else if (chargeSec >= 0.5 && chargeSec < 1.0) {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    if (gameState.phase !== 'playing') return;
                    let currStartY = (this.id === 1) ? this.y - dotSize : this.y + this.h;
                    let currStartX = this.x + this.w / 2 - dotSize / 2;
                    this.bullets.push({
                        type: 'arrow',
                        x: currStartX, y: currStartY, w: dotSize, h: dotSize,
                        vx: 0, vy: dirY * spdMod, dmg: dmgMod, owner: this,
                        isPiercing: pierce, hitIds: [], bounceCount: 0, spawnTime: Date.now()
                    });
                }, i * 150); // Khoảng cách giữa 3 viên nhanh hơn một chút
            }
        }
        // 3. Mốc 1.0s trở lên: Bắn 3 viên hình nón (đạn tỏa)
        else if (chargeSec >= 1.0) {
            let baseAngle = (this.id === 1) ? -Math.PI / 2 : Math.PI / 2;
            let angles = [-0.25, 0, 0.25];
            let startY = (this.id === 1) ? this.y - dotSize : this.y + this.h;

            angles.forEach(angleOffset => {
                let finalAngle = baseAngle + angleOffset;
                this.bullets.push({
                    type: 'arrow',
                    x: this.x + this.w / 2 - dotSize / 2, y: startY, w: dotSize, h: dotSize,
                    vx: Math.cos(finalAngle) * spdMod, vy: Math.sin(finalAngle) * spdMod,
                    dmg: dmgMod, owner: this, isPiercing: pierce, hitIds: [], bounceCount: 0, spawnTime: Date.now()
                });
            });
        }

        this.ammo--;
    }

    triggerBowDodgeDash(inp) {
        if (inp && (inp.l || inp.r || inp.u || inp.d)) {
            this.isDashing = true;
            let dashDist = 80;
            this.dashTargetX = this.x;
            this.dashTargetY = this.y;

            if (inp.l) this.dashTargetX -= dashDist;
            if (inp.r) this.dashTargetX += dashDist;
            if (inp.u) this.dashTargetY -= dashDist;
            if (inp.d) this.dashTargetY += dashDist;
        }
    }

    fireShortgunBurst(isFullEvo, hasEvo1, hasEvo2) {
        let dirY = (this.id === 1) ? -1 : 1;
        let isDouble = this.shortgunDoubleTap;
        let dmgMultiplier = isDouble ? 2 : 1;
        let pelletCount = isDouble ? 8 : 5;
        let coneSpread = 0.45;
        let startX = this.x + this.w / 2;
        let startY = (this.id === 1) ? this.y - 6 : this.y + this.h + 6;

        let baseDmg = this.damage * dmgMultiplier;
        if (soundSystem && !soundSystem.muted) soundSystem.playShoot('cannon');
        triggerScreenShake(isDouble ? 8 : 4, 8);

        for (let i = 0; i < pelletCount; i++) {
            let angle = (i / (pelletCount - 1) - 0.5) * coneSpread;
            let vx = Math.sin(angle) * (C.bulletSpeed * 1.5);
            let vy = dirY * Math.cos(angle) * (C.bulletSpeed * 1.5);

            this.bullets.push({
                type: 'shortgun_pellet',
                x: startX - 3.5, y: startY - 3.5, w: 7, h: 7,
                vx: vx, vy: vy,
                dmg: baseDmg,
                owner: this,
                isShortgun: true,
                isPiercing: false,
                isBurn: hasEvo1,
                hitIds: [], bounceCount: 0,
                trailHistory: [],
                spawnTime: Date.now()
            });
        }

        // Evo 1: Dragon Strike leaves FireZone for 3s (180 ticks)
        if (hasEvo1) {
            let coneLen = 140;
            shortgunFireZones.push(new ShortgunFireZone(startX, startY, dirY, coneLen, coneSpread, 180, this));
        }

        this.shortgunDoubleTap = false;
    }

    triggerShortgunAttack() {
        this.isShortgunDashing = true;
        this.shortgunDashState = 1; // 1: Lao thẳng lên như tank, 2: Rút lui về vị trí ban đầu
        this.shortgunStartY = this.y;
        this.shortgunDashSpeed = 22;
        this.lastShotgunDashTime = Date.now();
        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "XUNG PHONG! ⏩", "#ff6600", 13);
        if (soundSystem && !soundSystem.muted) {
            if (typeof soundSystem.playDash === 'function') soundSystem.playDash();
            else soundSystem.playPowerup();
        }
    }

    fireShadowHunterEmpowered(isFullEvo, hasEvo1, hasEvo2) {
        let dirY = (this.id === 1) ? -1 : 1;
        let dmgMultiplier = hasEvo2 ? 2.0 : 1.5;
        let baseDmg = this.damage * dmgMultiplier;
        if (soundSystem && !soundSystem.muted) soundSystem.playShoot('laser');

        if (isFullEvo) {
            let beamW = 18;
            let beamX = this.x + this.w / 2 - beamW / 2;
            let beamY = (this.id === 1) ? 0 : this.y + this.h;
            let beamH = (this.id === 1) ? this.y : (canvas.height - (this.y + this.h));
            beams.push(new Beam(beamX, beamY, beamW, beamH, this.id, true));
            triggerScreenShake(6, 10);
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "SHADOW RAYCAST ⚡", "#9b59b6", 15);
        } else {
            let dotSize = 10;
            this.bullets.push({
                type: 'shadow_empowered',
                x: this.x + this.w / 2 - dotSize / 2,
                y: (this.id === 1) ? this.y - dotSize : this.y + this.h,
                w: dotSize, h: dotSize,
                vx: 0, vy: dirY * (C.bulletSpeed * 1.6),
                dmg: baseDmg,
                owner: this,
                isPiercing: hasEvo1,
                isShadowHunter: true,
                causesSilence: hasEvo2,
                causesBlind: hasEvo1,
                hitIds: [], bounceCount: 0,
                trailHistory: [],
                spawnTime: Date.now()
            });
        }
    }

    checkDashCollision() {
        let hitSomething = false;
        const enemy = (this.id === 1) ? p2 : p1;

        // 1. Va chạm Người chơi (Địch)
        if (rectIntersect(this.x, this.y, this.w, this.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
            let dmg = this.damage * 3;
            if (this.hasUpgrade('evo_tank_1')) dmg *= 1.5;

            enemy.takeDamage(dmg, this);
            explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 50, 'orange', 0, this));
            hitSomething = true;
        }

        // 2. Va chạm Công trình / Vật thể
        let dashDmg = this.damage * 3; // Lực tông mạnh

        // A. Ụ SÚNG (TURRETS)
        if (!hitSomething) {
            for (let t of turrets) {
                if (t.active && t.owner.id !== this.id && rectIntersect(this.x, this.y, this.w, this.h, t.x, t.y, t.w, t.h)) {
                    t.hp -= dashDmg; hitSomething = true;
                    explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 40, 'gray', 0, this));
                    break;
                }
            }
        }

        // B. XE TIỀN (MONEY TRUCKS) -> FIX LỖI MÁU ÂM
        if (!hitSomething && typeof moneyTrucks !== 'undefined') {
            for (let t of moneyTrucks) {
                if (t.active && rectIntersect(this.x, this.y, this.w, this.h, t.x, t.y, t.w, t.h)) {
                    let multiplier = (this.weapon === 'money_tank') ? 3 : 1;
                    t.hp -= dashDmg * 2 * multiplier; // Trừ máu xe tiền
                    hitSomething = true;

                    // Nếu máu về 0 hoặc âm -> Kích hoạt nổ vỡ xe và thưởng tiền luôn
                    if (t.hp <= 0) {
                        t.active = false;
                        let money = 50;
                        if (this.weapon === 'money_tank') money *= 2;
                        if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                        if (this.weapon === 'evolution') this.onEvolutionCrateEat('truck');

                        if (this.hasUpgrade('evo_money_atk')) {
                            const enemyObj = (this.id === 1) ? p2 : p1;
                            const angle = Math.atan2(enemyObj.y - (t.y + t.h / 2), enemyObj.x - (t.x + t.w / 2));
                            const spread = [-0.3, 0, 0.3];
                            spread.forEach(a => {
                                this.bullets.push({
                                    x: t.x + t.w / 2, y: t.y + t.h / 2, w: 6, h: 6,
                                    vx: Math.cos(angle + a) * 7, vy: Math.sin(angle + a) * 7,
                                    dmg: 2, owner: this, bounceCount: 0, isPiercing: false
                                });
                            });
                            explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 60, 'rgba(255,215,0,', 0, this));
                        } else {
                            explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 80, 'rgba(255,215,0,', 5, this));
                        }
                    } else {
                        // Nếu chưa chết thì chỉ hiện hiệu ứng móp xe nhẹ
                        explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 35, 'rgba(255,165,0,', 0, this));
                    }
                    break;
                }
            }
        }

        // C. HỘP TIẾP TẾ (CRATES) -> FIX LỖI ĂN THƯỞNG KHI TÔNG TRÚNG
        if (!hitSomething && typeof crates !== 'undefined') {
            for (let c of crates) {
                if (c.active && rectIntersect(this.x, this.y, this.w, this.h, c.x, c.y, c.w, c.h)) {
                    c.active = false; // Phá hủy hòm ngay lập tức
                    hitSomething = true;

                    if (c.isMimic) {
                        triggerMimicExplosion(c, this);
                    }
                    // Trao thưởng trực tiếp cho xe TANK vừa tông vào hòm
                    if (c.type === 'hp') {
                        if (this.weapon === 'necromancer') {
                            let cap = this.maxSouls - (this.lockedSouls || 0);
                            this.currentSouls = Math.min(cap, (this.currentSouls || 0) + 4);
                            addFloatingText(this.x + this.w / 2, this.y - 15, "+4 LINH HỒN 👻", "#00e676", 13);
                        } else {
                            this.hp = Math.min(this.hp + 1, this.maxHp);
                        }
                    }
                    if (c.type === 'ammo') this.onCollectAmmoCrate(c);
                    if (c.type === 'shield') this.shield++;
                    if (c.type === 'dmg') this.dmgBuff++;
                    if (this.weapon === 'evolution') this.onEvolutionCrateEat(c.type);
                    if (c.type === 'coin') {
                        let money = 30; if (this.weapon === 'money_tank') money *= 2;
                        if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                        if (this.weapon === 'inventor') this.components = (this.components || 0) + 2;
                    }
                    if (c.type === 'gear') {
                        let lkGain = this.hasUpgrade('evo_inv_1') ? 8 : 5;
                        this.ammo = Math.min(this.maxAmmo, this.ammo + 1);
                        this.hp = Math.min(this.maxHp, this.hp + 0.25);
                        if (this.weapon === 'inventor') {
                            this.components = (this.components || 0) + lkGain;
                            addFloatingText(this.x + this.w / 2, this.y - 15, `+${lkGain} LK`, "#00ffcc", 13);
                        }
                        if (this.weapon === 'genius') {
                            if (this.isPilotingMecha) {
                                if (this.mechaHp < this.mechaMaxHp) {
                                    this.mechaHp = Math.min(this.mechaMaxHp, this.mechaHp + 0.5);
                                    addFloatingText(this.x + this.w / 2, this.y - 15, "+0.5 MECHA HP 🤖", "#ff9800", 12);
                                } else {
                                    this.mechaVirtualArmor = (this.mechaVirtualArmor || 0) + 0.5;
                                    addFloatingText(this.x + this.w / 2, this.y - 15, "+0.5 GIÁP ẢO 🛡️", "#ffd700", 12);
                                }
                            } else {
                                this.gears = (this.gears || 0) + 1;
                                addFloatingText(this.x + this.w / 2, this.y - 15, "+1 BÁNH RĂNG ⚙️", "#ff9800", 12);
                            }
                        }
                    }
                    if (this.weapon === 'genius' && c.type !== 'gear') {
                        if (this.isPilotingMecha) {
                            if (this.mechaHp < this.mechaMaxHp) {
                                this.mechaHp = Math.min(this.mechaMaxHp, this.mechaHp + 0.5);
                                addFloatingText(this.x + this.w / 2, this.y - 15, "+0.5 MECHA HP 🤖", "#ff9800", 12);
                            } else {
                                this.mechaVirtualArmor = (this.mechaVirtualArmor || 0) + 0.5;
                                addFloatingText(this.x + this.w / 2, this.y - 15, "+0.5 GIÁP ẢO 🛡️", "#ffd700", 12);
                            }
                        } else {
                            this.gears = (this.gears || 0) + 1;
                            addFloatingText(this.x + this.w / 2, this.y - 15, "+1 BÁNH RĂNG ⚙️", "#ff9800", 12);
                        }
                        this.components = (this.components || 0) + 0.5;
                        addFloatingText(this.x + this.w / 2, this.y - 27, "+0.5 LINH KIỆN 🔩", "#00e5ff", 11);
                    }
                    // Giáp hợp kim: Nhặt Crate nhận Giáp Ảo 5s
                    if (this.weapon === 'inventor' && this.invUpgrades && this.invUpgrades['inv_giap']) {
                        this.shield = (this.shield || 0) + 1;
                        this.crateShieldActive = true;
                        this.crateShieldExpireTimer = Date.now() + 5000;
                        addFloatingText(this.x + this.w / 2, this.y - 15, "+1 SHIELD (5s)", "#00ffff", 12);
                    }

                    // Hiệu ứng nổ hòm
                    if (c.type === 'boom') {
                        explosions.push(new Explosion(c.x, c.y, 60, 'rgba(255,0,0,', 2, this));
                    } else {
                        explosions.push(new Explosion(c.x, c.y, 30, 'rgba(255,255,255,', 0, this));
                    }
                    break;
                }
            }
        }

        // D. TƯỜNG SNIPER
        if (!hitSomething && typeof sniperWalls !== 'undefined') {
            for (let w of sniperWalls) {
                if (w.active && rectIntersect(this.x, this.y, this.w, this.h, w.x, w.y, w.w, w.h)) {
                    if (!w.isImmortal) w.hp -= dashDmg;
                    hitSomething = true; break;
                }
            }
        }

        // E. THANH NGANG DI CHUYỂN
        if (!hitSomething && typeof movingObstacle !== 'undefined' && movingObstacle && movingObstacle.active) {
            if (rectIntersect(this.x, this.y, this.w, this.h, movingObstacle.x, movingObstacle.y, movingObstacle.w, movingObstacle.h)) {
                hitSomething = true;
            }
        }

        // 3. Xử lý phản chấn sau va chạm (Địch hoặc Vật thể)
        if (hitSomething) {
            if (this.hasUpgrade('evo_tank_2') && this.shield > 0) {
                explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 80, 'rgba(255,0,0,', 2, this));
                iceZones.push(new IceZone(this.x + this.w / 2, this.y + this.h / 2, 60, 300, this));
            }

            if (!this.hasUpgrade('evo_tank_1')) {
                if (this.shield > 0) this.shield = 0;
                else this.hp -= 3;
            }

            this.dashState = 2; // Bật lùi về trạng thái hồi vị
            return true;
        }
        return false;
    }
    triggerPortalEffect() {
        const now = Date.now();
        const hasEvo1 = this.hasUpgrade('evo_portal_1');
        const hasEvo2 = this.hasUpgrade('evo_portal_2');
        const isFullEvo = hasEvo1 && hasEvo2;

        // Evo 1: Đạn nổ (Cũ - giữ nguyên)
        if (hasEvo1) this.nextShotExplosive = true;

        // --- LOGIC TĂNG TỐC & BONUS ---
        if (hasEvo2) {
            const MAX_SPEED_CAP = 20; // Giới hạn tốc độ là 60

            if (isFullEvo) {
                // =================================================
                // TRƯỜNG HỢP 1: FULL EVO (Evo 1 + Evo 2)
                // =================================================

                // 1. Luôn hồi đầy đạn & Tăng tốc đạn (Không có Cooldown)
                this.ammo = this.maxAmmo;
                this.portalBulletSpeedBonus += 1.5;

                // 2. Logic Tốc độ & Bonus
                if (this.speed < MAX_SPEED_CAP) {
                    // Chưa max tốc -> Cộng 6 tốc (Không hồi chiêu)
                    this.speed += 6;
                    if (this.speed > MAX_SPEED_CAP) this.speed = MAX_SPEED_CAP;

                    // Hiệu ứng visual tăng tốc
                    ctx.fillStyle = "#00ffff"; ctx.font = "10px Arial";
                    ctx.fillText("SPEED UP+++", this.x, this.y - 10);
                } else {
                    // Đã Max tốc -> Check Cooldown 6s để Hồi Máu & Tăng Dame
                    if (now - this.lastPortalFullBonus > 6000) {

                        // Hồi 1 HP
                        this.hp = Math.min(this.hp + 1, this.maxHp);

                        // Tăng Dame vĩnh viễn (Buff khủng)
                        this.damage += 1;

                        this.lastPortalFullBonus = now;

                        // Hiệu ứng Visual đặc biệt
                        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 100, 'gold', 0, this));
                        ctx.fillStyle = "gold"; ctx.font = "bold 14px Arial";
                        ctx.fillText("OVERDRIVE!", this.x - 10, this.y - 20);
                    }
                }

            } else {
                // =================================================
                // TRƯỜNG HỢP 2: CHỈ CÓ EVO 2 (Gia Tốc)
                // =================================================
                // Giữ logic cũ: Cooldown 1s, cộng 2 tốc
                if (now - this.lastPortalBoost > 1000) {
                    this.ammo = this.maxAmmo;

                    if (this.speed < MAX_SPEED_CAP) {
                        this.speed += 2;
                        if (this.speed > MAX_SPEED_CAP) this.speed = MAX_SPEED_CAP;

                        ctx.fillStyle = "#00ffff"; ctx.font = "10px Arial";
                        ctx.fillText("Speed Up", this.x, this.y - 10);
                    }
                    this.lastPortalBoost = now;
                }
            }
        }
    }

    handleShooting(inp, now) {
        if (this.weapon === 'cung') return;

        // ==========================================
        // SHADOW HUNTER
        // ==========================================
        if (this.weapon === 'shadow_hunter') {
            let hasEvo1 = this.hasUpgrade('evo_sh_1');
            let hasEvo2 = this.hasUpgrade('evo_sh_2');
            let isFullEvo = hasEvo1 && hasEvo2;

            if (inp.s) {
                if (!this.stealthActive && this.stealthCooldown <= 0) {
                    // Tap 1: Kích hoạt Vô Hình
                    this.stealthActive = true;
                    this.stealthTimer = 300; // 5s
                    this.stealthEmpowered = true;
                    this.lastStealthActionTime = now;
                    if (hasEvo2) {
                        this.ammo = this.maxAmmo; // Nạp đầy đạn
                        this.spawnShadowTraps();
                    }
                    if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
                    if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "STEALTH 👻", "#9b59b6", 14);
                    inp.s = false;
                } else if (this.stealthActive && (now - (this.lastStealthActionTime || 0) >= 250)) {
                    // Tap 2: Thoát Vô Hình & Bắn Đòn Cường Hóa (chống double input)
                    this.stealthActive = false;
                    this.stealthCooldown = 480; // 8s CD
                    this.fireShadowHunterEmpowered(isFullEvo, hasEvo1, hasEvo2);
                    inp.s = false;
                } else if (!this.stealthActive && this.ammo > 0 && now - this.lastShot > 400) {
                    // Bắn đạn thường khi ngoài Vô Hình
                    this.fireBullet(1, false, 'shadow_hunter_normal');
                    this.ammo--;
                    this.lastShot = now;
                    inp.s = false;
                }
            }
            return;
        }

        // ==========================================
        // SHORTGUN
        // ==========================================
        if (this.weapon === 'shortgunATK') {
            let hasEvo1 = this.hasUpgrade('evo_sg_1');
            let hasEvo2 = this.hasUpgrade('evo_sg_2');
            let isFullEvo = hasEvo1 && hasEvo2;

            if (inp.s) {
                // Double Tap detection trong lúc lao: cần khoảng đệm >= 200ms để chống double input
                if (this.shortgunDashState === 1) {
                    if (!this.shortgunDoubleTap && (now - (this.lastShotgunDashTime || 0) >= 200)) {
                        this.shortgunDoubleTap = true;
                        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "DOUBLE TAP! ⚡", "#ffaa00", 14);
                        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
                    }
                    inp.s = false;
                    return;
                }

                if (this.ammo > 0 && now - this.lastShot > 400 && this.shortgunDashState !== 2) {
                    this.ammo--;
                    this.lastShot = now;
                    this.triggerShortgunAttack();
                    inp.s = false;
                }
            }
            return;
        }

        // ==========================================
        // --- CHẶN ĐẠN THƯỜNG CỦA SUKUNA ---
        // ==========================================
        if (this.weapon === 'sukuna') {
            let isFullEvo = this.hasUpgrade('evo_sukuna_1') && this.hasUpgrade('evo_sukuna_2');

            // Chỉ khi có Full Evo mới cho phép xả thêm đạn thường lúc giữ phím
            if (isFullEvo && inp.s) {
                if (this.ammo > 0 && now - this.lastShot > 1500) {
                    this.fireBullet(1);
                    this.ammo--;
                    this.lastShot = now;
                }
            }
            return; // Nếu không có Full Evo -> Lệnh return này sẽ chặn mọi luồng bắn đạn thường!
        }
        // ==========================================
        // SNIPER
        // ==========================================
        if (this.weapon === 'sniper') {
            if (inp.s) {
                this.sniperCharge++;
                // [Nếu bạn có logic tụ lực tạo tường ở đây, hãy giữ nguyên nó]
            } else {
                // KHI NHẢ PHÍM: Bấm nhẹ để bắn đạn Sniper
                if (this.sniperCharge > 0 && this.sniperCharge < 30) { // Giả sử < 30 frames là bắn
                    if (this.ammo > 0 && now - this.lastShot > this.reloadTime) {
                        this.fireBullet(1);
                        this.ammo--;
                        this.lastShot = now;
                    }
                }
                this.sniperCharge = 0;
            }
            return; // Ngắt!
        }
        // ==========================================
        // MIRROR
        // ==========================================
        if (this.weapon === 'mirror') {
            // (Logic đếm mirrorCharge và Swap của bạn thường được đặt trong hàm update() nên không cần ghi ở đây)
            if (inp.s) {
                // Đang giữ phím -> Không làm gì cả, để cho update() đếm charge
            } else {
                // KHI NHẢ PHÍM: Nếu thời gian giữ ngắn (chưa đủ để Swap) -> Bắn đạn
                if (this.mirrorCharge > 0 && this.mirrorCharge < 60) {
                    if (this.ammo > 0 && now - this.lastShot > this.reloadTime) {
                        this.fireBullet(1);
                        this.ammo--;
                        this.lastShot = now;
                    }
                }
                // (Việc reset mirrorCharge = 0 thường đã có ở hàm update)
            }
            return; // QUAN TRỌNG: Ngắt không cho chạy xuống code bắn mặc định!
        }
        // ==========================================
        // --- LOGIC MAGICIAN (KỸ NĂNG CHỦ ĐỘNG) ---
        // ==========================================
        if (this.weapon === 'magician') {
            let hasEvo1 = this.hasUpgrade('evo_mag_1');
            let hasEvo2 = this.hasUpgrade('evo_mag_2');
            let isFullEvo = hasEvo1 && hasEvo2;

            // ==========================================
            // --- LOGIC MAGICIAN (KỸ NĂNG CHỦ ĐỘNG) ---
            // ==========================================
            if (this.weapon === 'magician') {
                let hasEvo1 = this.hasUpgrade('evo_mag_1');
                let hasEvo2 = this.hasUpgrade('evo_mag_2');
                let isFullEvo = hasEvo1 && hasEvo2;

                if (inp.s) {
                    this.magicianCharge++;
                } else {
                    if (this.magicianCharge > 0) {
                        // MỐC 3 (EVO 1): HOÁN ĐỔI CHỦ ĐỘNG (Giữ > 60 frames ~ 1s)
                        if (this.magicianCharge >= 60 && hasEvo1 && this.illusions.length > 0) {
                            let targetIllusion = this.illusions[0]; // First in, first out

                            // Hoán đổi vị trí
                            let tempX = this.x; let tempY = this.y;
                            this.x = targetIllusion.x; this.y = targetIllusion.y;
                            targetIllusion.x = tempX; targetIllusion.y = tempY;

                            this.invisTimer = 30; // Tàng hình 0.5s lúc đổi
                            this.shield = (this.shield || 0) + 1;
                            addFloatingText(this.x + this.w / 2, this.y - 15, "+1 SHIELD", "#e056fd", 13);

                            // =====================================
                            // ĐOẠN CODE MỚI ĐƯỢC CHÈN VÀO ĐÂY
                            // =====================================
                            targetIllusion.type = 'ghost'; // Dù là bóng đứng im cũng sẽ thành bóng biết đi

                            // Phân ảnh di chuyển NGƯỢC HƯỚNG bạn đang đi
                            if (inp.l) {
                                targetIllusion.vx = C.baseSpeed; // Bạn qua trái -> Bóng qua phải
                            } else if (inp.r) {
                                targetIllusion.vx = -C.baseSpeed; // Bạn qua phải -> Bóng qua trái
                            } else {
                                // Nếu bạn không di chuyển, bóng đi ngẫu nhiên
                                targetIllusion.vx = (Math.random() > 0.5 ? 1 : -1) * C.baseSpeed;
                            }

                            // Buff tốc độ
                            this.magicianSpeedBuff = 90;
                            targetIllusion.speedBuff = 90;
                            // =====================================

                            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 40, 'magenta', 0, this));
                        }                        
                        // MỐC 2: TẨU THOÁT & ĐÁNH LẠC HƯỚNG (Giữ >= 30 frames ~ 0.5s)
                        else if (this.magicianCharge >= 30) {
                            let isMoving = inp.l || inp.r;

                            // Xác định máu và đạn tối đa an toàn
                            let myMaxHp = this.maxHp || 1;
                            let myMaxAmmo = this.maxAmmo || 6;

                            // Xóa bóng cũ nếu vượt giới hạn (Tối đa 2 bóng)
                            if (this.illusions.length >= 2) this.illusions.shift();

                            if (isMoving) {
                                // NỘI TẠI 2: MÀN TRÌNH DIỄN TẨU THOÁT
                                let dashDir = inp.l ? -1 : 1;

                                // Tạo bóng ĐỨNG YÊN tại vị trí cũ
                                this.illusions.push({
                                    x: this.x, y: this.y, w: this.w, h: this.h,
                                    hp: this.hp, maxHp: myMaxHp,
                                    type: 'dash', vx: 0,
                                    spawnTime: now, lifeTime: 20000, invisTimer: 45,
                                    // [ĐÃ FIX LỖI] Ảo ảnh ra đời với số đạn bằng y hệt bản thể
                                    ammo: this.ammo, maxAmmo: myMaxAmmo,
                                    lastShot: now, behaviorTimer: 0
                                });

                                // Bản thể lướt đi và tàng hình 1.25s (75 frames)
                                this.x += dashDir * 80;
                                this.x = Math.max(0, Math.min(canvas.width - this.w, this.x));
                                this.invisTimer = 75;
                                this.shield = (this.shield || 0) + 1;
                                addFloatingText(this.x + this.w / 2, this.y - 15, "+1 SHIELD", "#e056fd", 13);

                                // Full Evo cường hóa: Hồi đầy đạn (Hồi cho bản thể thật sau khi lướt)
                                if (isFullEvo) this.ammo = myMaxAmmo;

                            } else {
                                // NỘI TẠI 3: MÀN TRÌNH DIỄN ĐÁNH LẠC HƯỚNG (Đứng yên)
                                let ghostDir = Math.random() > 0.5 ? 1 : -1;

                                // Tạo bóng BIẾT ĐI ở vị trí bên cạnh
                                this.illusions.push({
                                    x: this.x + ghostDir * 20, y: this.y, w: this.w, h: this.h,
                                    hp: this.hp, maxHp: myMaxHp,
                                    type: 'ghost', vx: ghostDir * C.baseSpeed,
                                    spawnTime: now, lifeTime: 20000, invisTimer: 45,
                                    // [ĐÃ FIX LỖI] Ảo ảnh ra đời với số đạn bằng y hệt bản thể
                                    ammo: this.ammo, maxAmmo: myMaxAmmo,
                                    lastShot: now, behaviorTimer: 0
                                });

                                // Bản thể đứng yên, tàng hình 0.75s, Vô địch 0.25s (Full Evo 0.5s)
                                this.invisTimer = 45;
                                this.invincibleTimer = isFullEvo ? 30 : 15;
                                this.shield = (this.shield || 0) + 1;
                                addFloatingText(this.x + this.w / 2, this.y - 15, "+1 SHIELD", "#e056fd", 13);
                            }
                        }
                        // MỐC 1: BẮN THƯỜNG (< 0.5s)
                        else if (this.ammo > 0 && now - this.lastShot > 500) {
                            this.fireBullet(1);
                            this.ammo--;
                            this.lastShot = now;

                            // Tầng 2 Loạn Ảnh: Đạn Nhân Đôi (Bắn thêm 1 viên ảo)
                            const enemy = this.id === 1 ? p2 : p1;
                            if (enemy.confusionStacks >= 2) {
                                let dirY = this.id === 1 ? -1 : 1;
                                this.fakeBullets.push({
                                    x: this.x + this.w / 2 + (Math.random() > 0.5 ? 15 : -15),
                                    y: this.y, w: 5, h: 5,
                                    vx: (Math.random() - 0.5) * 2, vy: dirY * C.bulletSpeed
                                });
                            }
                        }
                        this.magicianCharge = 0;
                    }
                }
                return; // Quan trọng: Return để ngắt dòng chảy code bắn gốc
            }
        }
        if (this.weapon === 'the_strongest') {
            if (this.silenceTimer > 0) return; // Đang câm lặng (do xài Domain) thì nghỉ

            let hasSixEyes = this.hasUpgrade('evo_strongest_2');
            let hasPurple = this.hasUpgrade('evo_strongest_1');

            if (inp.s) {
                this.gojoChargeTimer++;

                // Gợi ý hình ảnh khi gồng
                if (this.gojoChargeTimer === 60) {
                    // Mốc 1: Đủ gồng Đỏ
                    explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 40, 'rgba(255, 0, 0, 0.4)', 0, this));
                } else if (this.gojoChargeTimer === 300 && hasPurple) {
                    // Mốc 2: Đủ gồng Lãnh Địa (Bỏ ctx.fillText để tránh lỗi chớp nháy, dùng hiệu ứng nổ đen báo hiệu)
                    explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 100, 'rgba(0, 0, 0, 0.8)', 0, this));
                }
            } else {
                if (this.gojoChargeTimer > 0) {
                    const enemy = (this.id === 1) ? p2 : p1;

                    // 1. Lãnh Địa (Nerfed: Bỏ bất tử, Freeze 1s, Silence 1.5s, Tốn 75% Chú Lực)
                    if (this.gojoChargeTimer >= 300 && hasPurple && this.chuLuc >= this.maxChuLuc * 0.75) {
                        this.chuLuc -= this.maxChuLuc * 0.75;
                        this.invincibleTimer = 0; // Bỏ bất tử
                        this.silenceTimer = 60;
                        enemy.silenceTimer = 90; // Câm lặng 1.5s (cũ 3s)
                        enemy.freezeTimer = 60; // Choáng 1s (cũ 2s)
                        explosions.push(new Explosion(canvas.width / 2, canvas.height / 2, 350, 'rgba(0,0,0,0.8)', 0, this));

                        this.usedBlue = false;
                        this.usedRed = false;
                    }
                    // 2. Đỏ (Giữ > 1s, tốn 50 Chú lực)
                    else if (this.gojoChargeTimer >= 60 && this.chuLuc >= 50 && this.canshotActive) {
                        this.chuLuc -= 50;
                        this.usedRed = true;
                        this.canshotActive = false;

                        this.fireGojoRed(hasSixEyes, enemy);

                        setTimeout(() => { this.canshotActive = true; }, 1000);
                    }
                    // 3. Xanh (Nhấp, tốn 15 Chú lực)
                    else if (this.gojoChargeTimer < 60 && this.chuLuc >= 15 && this.canshotActive) {
                        this.chuLuc -= 15;
                        this.usedBlue = true;
                        this.canshotActive = false;

                        this.fireGojoBlue(hasSixEyes, enemy);

                        setTimeout(() => { this.canshotActive = true; }, 500);
                    }

                    // 4. Kích hoạt Tím (Nerfed: Bỏ bất tử 2s, Dame giảm còn 2.2, tốn 60% Chú Lực)
                    if (hasPurple && this.usedBlue && this.usedRed && this.chuLuc >= this.maxChuLuc * 0.6) {
                        this.chuLuc -= this.maxChuLuc * 0.6;
                        this.invincibleTimer = 0; // Bỏ bất tử 2s

                        this.fireGojoPurple(hasSixEyes, enemy);

                        this.usedBlue = false;
                        this.usedRed = false; // Xóa combo sau khi tung Tím
                    }

                    this.gojoChargeTimer = 0; // Reset timer sau khi nhả nút
                }
            }
            return;
        }
        // --- LOGIC BẮN 6 NÒNG (SIX BARREL) ---
        if (this.weapon === 'six_barrel') {
            if (inp.s && !this.isOverheated) {
                let currentCooldown = 100; // Mặc định
                let dmgMultiplier = 1;
                let bulletCount = 1;
                let inflictBurn = false;

                // MỐC 50%
                if (this.heat >= 50) {
                    currentCooldown = 60;
                    dmgMultiplier = 1.25; // Giảm nhẹ dame (cũ 1.5)
                    if (this.hasUpgrade('evo_six_1')) bulletCount = 2; // Bão đạn
                    if (this.hasUpgrade('evo_six_2')) inflictBurn = true; // Quá Nhiệt (Evo 2)
                }

                // MỐC 75%
                if (this.heat >= 75) {
                    currentCooldown = 30; // Bắn siêu nhanh
                    inflictBurn = true;   // Mặc định 75% là gây đốt
                    if (this.hasUpgrade('evo_six_1')) bulletCount = 3; // Bão đạn Max
                }

                if (now - this.lastShot > currentCooldown) {
                    // Độ tỏa ngang giống SMG (Càng nóng càng tỏa)
                    let spreadAmp = (this.heat / 100) * 8;

                    for (let i = 0; i < bulletCount; i++) {
                        let vx = (Math.random() - 0.5) * spreadAmp;

                        // Gửi cờ gây đốt vào tham số thứ 3 (type) hoặc thông qua fireBullet
                        // Để dễ dàng, ta thêm thuộc tính inflictBurn vào hàm fireBullet
                        this.nextShotInflictsBurn = inflictBurn; // Cờ tạm thời
                        this.nextShotSpreadVx = vx;              // Cờ tạm thời

                        this.fireBullet(dmgMultiplier, false, 'six_barrel');
                    }
                    this.lastShot = now;
                }
            }
            return;
        }
        // --- LOGIC PARADOX ---
        // --- LOGIC PARADOX (ACTIVE PARADOX) ---
        // --- LOGIC PARADOX (ACTIVE PARADOX) ---
        if (this.weapon === 'paradox') {
            let hasEvo1 = this.hasUpgrade('evo_paradox_1');
            let hasEvo2 = this.hasUpgrade('evo_paradox_2');
            let isFullEvo = hasEvo1 && hasEvo2;

            if (this.paradoxCooldown <= 0) {
                if (inp.s) {
                    this.paradoxCharge++;
                } else {
                    // NHẢ NÚT -> Kiểm tra xem đã sạc đủ các mốc chưa (Giữ ngắn 20 frame ~0.33s là tua ngược)
                    if (this.paradoxCharge >= 20 && this.paradoxHistory.length > 0) {

                        let pastSelf = this.paradoxHistory[0]; // Bản thân 3s trước
                        const enemy = (this.id === 1) ? p2 : p1;
                        let pastEnemy = this.enemyHistory[0] || { x: enemy.x, y: enemy.y }; // Địch 3s trước

                        // [FIX LỖI 2] HÀM KÉO ĐỊCH: Luôn ưu tiên tuyệt đối Bóng Đứng Yên của Evo 1
                        let pullEnemy = () => {
                            if (hasEvo1 && this.enemyStationaryShadow) {
                                // Ưu tiên 1: Kéo về Dấu Ấn (Bóng đứng yên)
                                enemy.x = this.enemyStationaryShadow.x;
                                enemy.y = this.enemyStationaryShadow.y;
                                enemy.freezeTimer = 90; // Choáng 1.5s
                                this.enemyStationaryShadow = null; // Xóa ấn sau khi kéo
                                explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 60, 'magenta', 0, this));
                            } else if (isFullEvo) {
                                // Ưu tiên 2: Kéo về quá khứ 3s (Chỉ kéo khi đối thủ KHÔNG bị dính Dấu Ấn)
                                enemy.x = pastEnemy.x;
                                enemy.y = pastEnemy.y;
                                enemy.freezeTimer = 90; // Choáng 1.5s
                                explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 60, 'magenta', 0, this));
                            }
                        };

                        // MỐC 2: Giữ đủ 1 giây (60 frame - Chỉ Full Evo) - Kéo mỗi đối thủ
                        if (isFullEvo && this.paradoxCharge >= 60) {
                            pullEnemy();
                        }
                        // MỐC 1: Giữ ngắn (>= 20 frame ~0.33s) -> Tua lại bản thân (Kèm tua địch nếu có)
                        else {
                            // Tua bản thân
                            this.x = pastSelf.x;
                            this.y = pastSelf.y;
                            this.hp = pastSelf.hp;
                            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 60, 'cyan', 0, this));

                            // Tự động bắn lặp lại các phát đạn đã bắn trong 3s trước đó
                            let pastShots = this.paradoxHistory.filter(h => h.shot).length;
                            if (pastShots > 0) {
                                if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 20, `TUA NGƯỢC BẮN LẶP LẠI x${pastShots}! ⏳`, '#00f0ff', 14);
                                for (let s = 0; s < pastShots; s++) {
                                    setTimeout(() => {
                                        if (typeof gameState !== 'undefined' && gameState.phase === 'playing') {
                                            this.fireBullet(hasEvo2 ? 1.5 : 1.0, false, 'paradox_echo');
                                        }
                                    }, s * 120);
                                }
                            }

                            // Tiến hành kéo địch (Sẽ tự động xét ưu tiên Dấu Ấn bên trong hàm)
                            if (hasEvo1) {
                                pullEnemy();
                            }
                        }

                        // Hồi chiêu giảm mạnh: Evo 2 còn 7s (420 frames), gốc 12s (720 frames)
                        this.paradoxCooldown = hasEvo2 ? 420 : 720;
                        this.paradoxCharge = 0;

                    } else if (this.paradoxCharge > 0 && this.paradoxCharge < 20) {
                        // Bấm rất nhẹ (< 20 frame) -> Bắn đạn thường
                        if (this.ammo > 0 && now - this.lastShot > 500) {
                            this.fireBullet(1);
                            this.ammo--;
                            this.lastShot = now;
                        }
                        this.paradoxCharge = 0;
                    }
                }
            } else {
                // Đang hồi chiêu -> Bắn bình thường không tụ lực
                if (inp.s && this.ammo > 0 && now - this.lastShot > 500) {
                    this.fireBullet(1);
                    this.ammo--;
                    this.lastShot = now;
                    inp.s = false;
                }
            }
            return;
        }
        // --- LOGIC SÚNG NƯỚC (WATER GUN) ---
        if (this.weapon === 'water_gun') {
            if (inp.s) {
                this.energyChargeTimer++;
                let hasEvo1 = this.hasUpgrade('evo_water_1');

                if (this.energyChargeTimer < 60) {
                    // Pha 1: Cảnh báo hướng bắn (Chờ 1 giây)
                    if (this.energy >= 10) {
                        ctx.save();
                        let startY = (this.id === 1) ? this.y : this.y + this.h;
                        ctx.beginPath(); ctx.moveTo(this.x + this.w / 2, startY); ctx.lineTo(this.x + this.w / 2, (this.id === 1) ? 0 : canvas.height);
                        ctx.strokeStyle = "rgba(0, 255, 255, 0.4)"; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.restore();
                    }
                } else if (this.energyChargeTimer === 60) {
                    // Cấp thường: Đủ 1s -> Xả HitScan
                    if (this.energy >= 50) {
                        this.energy -= 50;
                        this.fireAnhMinhHitscan(this.damage * 3, this.hasUpgrade('evo_water_2'), "#3498db");
                        this.lastShot = now;
                    }
                } else if (this.energyChargeTimer > 60 && hasEvo1) {
                    // Pha 2 (Evo 1): Phun Vòi Rồng liên tục
                    if (this.energy >= 1) { // Phun 6 frame 1 lần, tốn cực ít năng lượng để kéo dài
                        if (this.energyChargeTimer % 6 === 0) {
                            this.energy -= 2;
                            this.fireBullet(0.125 / this.damage, false, 'water_stream'); // Sát thương nhỏ giọt liên tục
                            this.lastShot = now;
                        }
                    }
                }
            } else {
                // Nhả nút
                if (this.energyChargeTimer > 0 && this.energyChargeTimer < 60 && this.energy >= 10) {
                    this.energy -= 10;
                    this.fireBullet(1, false, 'water_normal'); // Bắn 1 tia nước thường
                    this.lastShot = now;
                }
                this.energyChargeTimer = 0;
            }
            return;
        }

        // --- LOGIC LÒ NUNG (FURNACE) ---
        if (this.weapon === 'furnace') {
            let hasEvo1 = this.hasUpgrade('evo_furnace_1');
            let hasEvo2 = this.hasUpgrade('evo_furnace_2');

            if (inp.s) {
                this.energyChargeTimer++;
                if (hasEvo1 && this.energyChargeTimer < 60) {
                    // Cảnh báo tia lửa
                    if (this.energy >= 2) {
                        ctx.save();
                        let startY = (this.id === 1) ? this.y : this.y + this.h;
                        ctx.beginPath(); ctx.moveTo(this.x + this.w / 2, startY); ctx.lineTo(this.x + this.w / 2, (this.id === 1) ? 0 : canvas.height);
                        ctx.strokeStyle = "rgba(255, 69, 0, 0.4)"; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.restore();
                    }
                } else if (hasEvo1 && this.energyChargeTimer >= 60) {
                    // Phun lửa liên tục (Evo 1): Bắn siêu nhanh, hao năng lượng khủng
                    if (this.energy >= 2.5) {
                        if (this.energyChargeTimer % 4 === 0) {
                            this.energy -= 2.5;
                            this.energyUsedAcc += 2.5;
                            this.fireBullet(0.5, false, 'fire_stream');
                            this.lastShot = now;
                        }
                    }
                } else if (!hasEvo1) {
                    // Không có Evo 1: Bắn thường
                    if (this.energy >= 10 && now - this.lastShot > 500) {
                        this.energy -= 10;
                        this.energyUsedAcc += 10;
                        this.fireBullet(1, false, 'fire_normal');
                        this.lastShot = now;
                        inp.s = false;
                    }
                }
            } else {
                // Nhả nút
                if (hasEvo1 && this.energyChargeTimer > 0 && this.energyChargeTimer < 60 && this.energy >= 10) {
                    this.energy -= 10;
                    this.energyUsedAcc += 10;
                    this.fireBullet(1, false, 'fire_normal');
                    this.lastShot = now;
                }
                this.energyChargeTimer = 0;
            }

            // Kích hoạt Evo 2 Cường Hóa (Vùng Lửa)
            if (hasEvo2 && this.energyUsedAcc >= 30) {
                this.nextShotFireZone = true;
                this.energyUsedAcc -= 30;
            }
            return;
        }
        // --- LOGIC KIẾM TRẬN (VAN KIEM) ---
        if (this.weapon === 'van_kiem') {
            let hasEvo1 = this.hasUpgrade('evo_vk_1');
            let hasEvo2 = this.hasUpgrade('evo_vk_2');

            // NỘI TẠI MƯA KIẾM (Evo 1): Tự gọi kiếm sau lưng

            if (hasEvo1) {
                this.autoSwordTimer++;
                let spawnRate = Math.max(10, 60 - Math.floor(this.totalSwordsFired / 10) * 5);
                if (this.autoSwordTimer >= spawnRate) {
                    this.autoSwordTimer = 0;

                    let offsetX = (Math.random() - 0.5) * 100;
                    let swordX = this.x + this.w / 2 + offsetX;

                    // [FIX QUAN TRỌNG]: Khóa tọa độ X để kiếm không bao giờ sinh ra ngoài map (gây lỗi xóa đạn ngay lập tức)
                    if (swordX < 5) swordX = 5;
                    if (swordX > canvas.width - 15) swordX = canvas.width - 15;

                    // [FIX TỌA ĐỘ Y]: Nới rộng lề một chút để đạn không cạ vào tường
                    let offsetY = (this.id === 1) ? 35 : -35;
                    let spawnY = this.y + offsetY;
                    if (spawnY > canvas.height - 25) spawnY = canvas.height - 25;
                    if (spawnY < 5) spawnY = 5;

                    let dirY = (this.id === 1) ? -1 : 1;
                    floatingSwords.push(new FloatingSword(swordX, spawnY, 6, 20, 0, dirY * 12, 30, this.damage, false, false, this));

                    // [FIX LỖI TỐC ĐỘ]: Phải cộng dồn biến này để kiếm tự động gọi ra càng lúc càng nhanh đúng như mô tả
                    this.totalSwordsFired++;
                }
            }

            if (inp.s) {
                this.swordChargeTimer++;
                if (this.swordChargeTimer > 360) this.isInSwordStance = true;

                let callRate = this.isInSwordStance ? 5 : 15;
                if (this.swordChargeTimer % callRate === 0) {
                    let dirY = (this.id === 1) ? -1 : 1;
                    let spawnCount = this.isInSwordStance ? (hasEvo2 ? 4 : 2) : 1;

                    for (let k = 0; k < spawnCount; k++) {
                        let offsetX = (Math.random() - 0.5) * (this.isInSwordStance ? 150 : 60);

                        // [FIX LỖI TỌA ĐỘ]:
                        let offsetY = (this.id === 1) ? (20 + Math.random() * 20) : (-20 - Math.random() * 20);
                        let spawnY = this.y + offsetY;
                        if (spawnY > canvas.height - 20) spawnY = canvas.height - 20;
                        if (spawnY < 0) spawnY = 0;

                        let spd = this.isInSwordStance ? 18 : 12;
                        let isPiercing = (this.isInSwordStance && hasEvo2);

                        floatingSwords.push(new FloatingSword(this.x + this.w / 2 - 3 + offsetX, spawnY, 6, 20, 0, dirY * spd, 30, this.damage, isPiercing, false, this));
                        this.stanceSwordsAccumulated++;
                        this.totalSwordsFired++;
                        if (hasEvo2 && this.totalSwordsFired % 50 === 0) this.damage++; // Mỗi 50 kiếm tăng 1 dame (Buff nhỏ)
                    }
                }
            } else {
                if (this.isInSwordStance && hasEvo2) {
                    let giantW = Math.min(60, 10 + this.stanceSwordsAccumulated);
                    let giantH = Math.min(150, 30 + this.stanceSwordsAccumulated * 2);
                    let dirY = (this.id === 1) ? -1 : 1;

                    // [FIX LỖI TỌA ĐỘ ĐẠI KIẾM]: Đảm bảo nó không nổ ngay khi spawn
                    let spawnY = this.y + ((this.id === 1) ? 20 : -20);
                    if (spawnY > canvas.height - giantH - 10) spawnY = canvas.height - giantH - 10;
                    if (spawnY < 10) spawnY = 10;

                    floatingSwords.push(new FloatingSword(this.x + this.w / 2 - giantW / 2, spawnY, giantW, giantH, 0, dirY * 20, 10, this.damage * 10, true, false, this, true));
                }
                this.swordChargeTimer = 0;
                this.isInSwordStance = false;
                this.stanceSwordsAccumulated = 0;
            }
            return;
        }

        // --- LOGIC KIẾM TÔN (BLADE GOD) ---
        if (this.weapon === 'blade_god') {
            let isReloaded = (now - this.lastShot > (this.hasUpgrade('evo_blade_2') ? 300 : 700));

            if (inp.s && this.ammo > 0 && isReloaded) {
                this.bladeShotCount++;
                let hasEvo1 = this.hasUpgrade('evo_blade_1');

                // 1. Phá Thiên Kiếm (Phát thứ 10)
                if (this.bladeShotCount % 10 === 0) {
                    let dirY = (this.id === 1) ? -1 : 1;

                    // [FIX LỖI TỌA ĐỘ PHÁ THIÊN KIẾM]:
                    let spawnY = this.y + ((this.id === 1) ? 50 : -50);
                    if (spawnY > canvas.height - 125) spawnY = canvas.height - 125;
                    if (spawnY < 5) spawnY = 5;

                    floatingSwords.push(new FloatingSword(this.x - 15, spawnY, 60, 120, 0, dirY * 25, 120, this.damage * 10, true, false, this, true));
                    if (hasEvo1) this.invincibleTimer = 300; // Bất tử 5s
                }
                // 2. Evo 1: Kiếm Phá Thiên nhỏ (Mỗi 3 phát)
                else if (hasEvo1 && this.bladeShotCount % 3 === 0) {
                    let dirY = (this.id === 1) ? -1 : 1;
                    floatingSwords.push(new FloatingSword(this.x + 5, this.y + ((this.id === 1) ? 20 : -20), 20, 50, 0, dirY * 15, 60, this.damage * 2, true, false, this));
                }
                // 3. Luân phiên Anh Minh / Hư Vô
                else {
                    let isAnhMinh = (this.bladeShotCount % 2 !== 0);
                    if (isAnhMinh) {
                        // [BUFF ANH MINH]: Triệu hồi kiếm vàng trên đầu, delay 60 frame (1s) rồi mới bắn Hitscan
                        let isPiercing = hasEvo1;
                        floatingSwords.push(new FloatingSword(0, 0, 15, 45, 0, 0, 60, this.damage * 0.45, isPiercing, false, this, false, "#f1c40f", true));// Cờ hiệu để bắn hitscan sau delay
                    } else {
                        // Hư Vô Kiếm
                        this.fireBullet(0.75, false, 'hu_vo');
                    }
                }

                this.ammo--; this.lastShot = now; inp.s = false;
            }
            return;
        }
        if (this.weapon === 'tank') {
            if (inp.s && this.dashState === 0) {
                this.dashState = 1;
                this.dashStartY = this.y;
                inp.s = false;
            }
            return;
        }
        // --- LOGIC CUỒNG PHONG (STORM) - TỰ TỤ LỰC & NHẤN ĐỂ XUẤT CHIÊU ---
        if (this.weapon === 'storm') {
            if (this.stormDashState === 1 || this.stormSlashDelay > 0) return;

            if (inp.s) {
                let ratio = this.stormChargeRatio || 0;
                // Nhấn nút bắn để giải phóng lực (cần ít nhất 10% lực hoặc xuất chiêu ngay)
                if (ratio >= 0.05) {
                    this.savedChargeRatio = ratio;
                    this.stormReturnPos = { x: this.x, y: this.y };
                    if (ratio >= 1 && this.hasUpgrade('evo_storm_1')) {
                        this.shield += 2;
                    }

                    // KIỂM TRA ĐIỀU KIỆN CHIÊU CUỐI: Full Lực (>=95%) + Còn Khiên
                    if (ratio >= 0.95 && this.shield > 0) {
                        // ==> BẮN HƯ ẢNH (Ultimate)
                        this.firePhantom(ratio);
                    } else {
                        // ==> LAO BÌNH THƯỜNG (Normal Dash)
                        this.stormDashState = 1; // Kích hoạt dash trong update()
                    }

                    // Reset tụ lực sau khi xuất chiêu
                    this.stormAutoChargeTimer = 0;
                    this.stormChargeRatio = 0;
                    this.stormChargeStart = 0;
                }
                inp.s = false;
            }
            return;
        }

        // 3. LOGIC PHONG TRẢM (WIND SLASH) - FIX LỖI NẠP ĐẠN
        if (this.weapon === 'wind_slash') {
            if (this.ammo > 0) {
                if (!this.lastShot) this.lastShot = now;
                let timeSinceShot = now - this.lastShot;

                // [NERF] Tăng thời gian full lực lên 8000ms (8s)
                let chargeRatio = Math.min(timeSinceShot / 8000, 1);
                this.chargeLevel = chargeRatio * 7;
            } else {
                this.chargeLevel = 0;
                // [FIX] ĐÃ XÓA DÒNG: this.lastShot = now; 
                // Giải thích: Nếu để dòng đó, thời gian chờ nạp đạn bị reset liên tục -> Không bao giờ nạp được.
            }

            if (inp.s && this.ammo > 0) {
                let ratio = this.chargeLevel / 7;
                let isAutoFull = false;

                // Evo 1: Phát thứ 5 tự động Full lực
                if (this.hasUpgrade('evo_wind_1') && (this.windShotCount + 1) % 5 === 0) {
                    ratio = 1;
                    isAutoFull = true;
                }

                this.fireWindBlade(ratio, isAutoFull);
                this.ammo--;
                this.lastShot = now; // Bắt đầu tính giờ nạp đạn từ đây
                this.windShotCount = (this.windShotCount || 0) + 1;
                inp.s = false;
            }
            return;
        }
        /// (aaa)
        if (this.weapon === 'aaa') {
            if (inp.s) {
                let interShotDelay = 350;
                if (this.ammo > 0 && now - this.lastShot > interShotDelay) {
                    const enemy = (this.id === 1) ? p2 : p1;

                    // FIX AIM: Thả trực tiếp vào TÂM kẻ địch hiện tại
                    let targetX = enemy.x + enemy.w / 2;
                    let targetY = enemy.y + enemy.h / 2;

                    // Thêm chút rung lắc nhẹ cho tự nhiên
                    targetX += (Math.random() - 0.5) * 20;
                    targetY += (Math.random() - 0.5) * 20;

                    mortars.push(new MortarMarker(targetX, targetY, this, false));

                    this.ammo--;
                    this.lastShot = now;
                    inp.s = false;
                }
            }
            return;
        }

        if (this.weapon === 'overload') {
            const timeSinceLastShot = now - this.lastShot;

            // BUFF OVERLOAD: Bắt đầu nạp ngay sau 300ms, tốc độ nạp nhanh hơn đáng kể
            let baseDiv = 2400; // 2.4s nạp đầy
            if (this.hasUpgrade('evo_over_2')) baseDiv = 1500; // 1.5s
            if (this.hasUpgrade('evo_over_1') && this.hasUpgrade('evo_over_2')) baseDiv = 600; // 0.6s nạp siêu tốc

            const chargeSpeedDiv = baseDiv;

            if (timeSinceLastShot > 300) {
                const chargeTime = Math.min(timeSinceLastShot - 300, chargeSpeedDiv);
                this.chargeLevel = (chargeTime / chargeSpeedDiv) * 7;
            } else { this.chargeLevel = 0; }

            if (inp.s && this.ammo > 0) {
                const isFull = this.chargeLevel >= 6.8;
                let multiplier = 1.2 + (this.chargeLevel * 1.3); // Buff dame: sạc đầy đạt >10x sát thương
                this.fireBullet(multiplier, isFull);
                this.ammo--; this.lastShot = now; this.chargeLevel = 0; inp.s = false;
            }
            return;
        }
        if (this.weapon === 'lazer_charge') {
            if (this.ammo === this.maxAmmo) {
                if (!this.startChargeTime) this.startChargeTime = now;
                const chargeDuration = 2000;
                const progress = Math.min(now - this.startChargeTime, chargeDuration);
                this.chargeLevel = (progress / chargeDuration) * 7;
            } else { this.chargeLevel = 0; this.startChargeTime = null; }

            if (inp.s) {
                if (this.chargeLevel >= 6.9) { this.fireBeam(); this.ammo = 0; }
                else if (this.ammo > 0) { this.fireBullet(0.25); this.ammo--; }
                this.lastShot = now; this.chargeLevel = 0; this.startChargeTime = null; inp.s = false;
            }
            return;
        }

        if (this.weapon === 'rocket') {
            if (inp.s && this.ammo > 0 && now - this.lastShot > 800) {
                this.fireBullet(1); this.ammo--; this.lastShot = now; inp.s = false;
            }
            return;
        }
        if (this.weapon === 'engineer') {
            // Nhấn giữ để nạp Ụ súng thông minh (1s) hoặc Quá tải (2s)
            // Nhấp nhả (< 25 frame ~ 0.4s) để bắn đạn thường
            if (inp.s) {
                this.engineerPressFrames = (this.engineerPressFrames || 0) + 1;
                return;
            } else {
                if (this.engineerPressFrames > 0) {
                    let heldFrames = this.engineerPressFrames;
                    this.engineerPressFrames = 0;
                    if (heldFrames < 25 && this.ammo > 0 && now - this.lastShot > 350) {
                        this.fireBullet(1);
                        this.ammo--;
                        this.lastShot = now;
                    }
                }
                return;
            }
        }

        if (this.weapon === 'thunder') {
            if (this.thunderIsSlashing) return;
            if (this.thunderLoiMinhTimer > 0) {
                if (inp.s && now - this.lastShot > 500 && (this.thunderRaycastWarningTimer || 0) <= 0) {
                    this.startThunderRaycastWarning(now);
                    inp.s = false;
                }
                return;
            }
            if (inp.s) {
                this.thunderHoldFrames = (this.thunderHoldFrames || 0) + 1;
                return;
            } else {
                if (this.thunderHoldFrames > 0) {
                    let held = this.thunderHoldFrames;
                    this.thunderHoldFrames = 0;
                    this.triggerThunderAction(held, now);
                }
                return;
            }
        }

        if (this.weapon === 'magnet') {
            if (this.isPolarDashing) return;
            if (inp.s) {
                this.magnetHoldFrames = (this.magnetHoldFrames || 0) + 1;
                return;
            } else {
                if (this.magnetHoldFrames > 0) {
                    let held = this.magnetHoldFrames;
                    this.magnetHoldFrames = 0;
                    if (held >= 25) {
                        this.toggleMagnetPolarity();
                        return;
                    } else {
                        let nowTap = Date.now();
                        let isDoubleTap = (nowTap - (this.lastMagnetTapTime || 0) < 320);
                        this.lastMagnetTapTime = nowTap;

                        let enemyHalfY = canvas.height / 2;
                        let eligibleNodes = magnetNodes.filter(m => m.active && m.polarity !== this.magnetPolarity && (this.id === 1 ? m.y < enemyHalfY : m.y > enemyHalfY));

                        if (isDoubleTap && eligibleNodes.length > 0) {
                            let closest = eligibleNodes.reduce((best, curr) => {
                                let dCurr = Math.hypot(curr.x - (this.x + this.w / 2), curr.y - (this.y + this.h / 2));
                                let dBest = Math.hypot(best.x - (this.x + this.w / 2), best.y - (this.y + this.h / 2));
                                return dCurr < dBest ? curr : best;
                            }, eligibleNodes[0]);

                            this.isPolarDashing = true;
                            this.polarDashTarget = closest;
                            this.isInvulnerable = true;
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "LƯỚT TỪ TÍNH! 🧲💨", "#00ffff", 14);
                            if (soundSystem && !soundSystem.muted) soundSystem.playDash();
                            return;
                        }

                        if (this.ammo > 0 && now - this.lastShot > 350) {
                            this.fireMagnetBullet();
                            this.ammo--;
                            this.lastShot = now;
                        }
                        return;
                    }
                }
                return;
            }
        }

        // --- LOGIC PORTAL (MỚI) ---
        if (this.weapon === 'portal') {
            let isFullEvo = (this.hasUpgrade('evo_portal_1') && this.hasUpgrade('evo_portal_2'));

            if (inp.s) {
                // Nếu Full Evo -> Chế độ Sấy (Auto fire)
                if (isFullEvo) {
                    // Tốc độ bắn nhanh (150ms)
                    if (this.ammo > 0 && now - this.lastShot > 150) {
                        this.fireBullet(1);
                        this.ammo--;
                        this.lastShot = now;
                    }
                }
                // Nếu chưa Full Evo -> Bắn từng viên (Semi-auto)
                else {
                    if (this.ammo > 0 && now - this.lastShot > 500) {
                        this.fireBullet(1);
                        this.ammo--;
                        this.lastShot = now;
                        inp.s = false; // Bắt buộc nhả phím
                    }
                }
            }
            return;
        }

        if (this.weapon === 'smg') {
            if (inp.s) {
                // Tính toán Cooldown (Tốc độ bắn)
                let currentCooldown = 100; // Mặc định 100ms

                // Evo 1: Sấy càng lâu bắn càng nhanh (Ramp-up)
                if (this.hasUpgrade('evo_smg_1') && this.smgSprayCount > 3) {
                    // Giảm cooldown tối đa xuống 30ms (Siêu nhanh)
                    // Cứ mỗi viên đạn giảm 5ms cooldown
                    let reduction = (this.smgSprayCount - 3) * 5;
                    currentCooldown = Math.max(30, 100 - reduction);
                }

                if (this.ammo > 0 && now - this.lastShot > currentCooldown) {
                    this.fireBullet(1);
                    this.ammo--;
                    this.lastShot = now;
                    this.smgSprayCount++; // Tăng biến đếm sấy

                    // SMG bắn liên thanh nên không set inp.s = false
                }
            } else {
                // Nhả nút bắn -> Reset sấy
                this.smgSprayCount = 0;
            }
            return; // Kết thúc logic SMG
        }
        if (this.weapon === 'necromancer' || this.weapon === 'genius') {
            return;
        }
        if (inp.s) {
            if (this.ammo > 0 && now - this.lastShot > 500) {
                this.fireBullet(1);
                this.ammo--;
                this.lastShot = now;
                inp.s = false;

            }
        }
    }

    executeStormSlash() {

        let slashDelay = 600;
        let ratio = this.savedChargeRatio || 0;
        let radius = 60 + (ratio * 60);
        let finalDmg = 2 + (ratio * 1);

        let isVacuum = (this.hasUpgrade('evo_storm_1') && ratio > 0.5);
        // Logic Hư Ảnh Lặp Lại (Full Evo)
        let isFullEvoEcho = (this.hasUpgrade('evo_storm_1') && this.hasUpgrade('evo_storm_2') && ratio >= 0.5);

        let targetX = this.x;
        let targetY = this.y;

        // 1. Nhát chém chính
        iceZones.push(new StormSlash(targetX + this.w / 2, targetY + this.h / 2, radius, finalDmg, this, isVacuum));

        // 2. [NEW] Hư Ảnh Lặp Lại (Full Evo)
        if (isFullEvoEcho) {
            setTimeout(() => {
                // Phạm vi 1/2, Dame 1/2
                let echoRadius = radius * 0.5;
                let echoDmg = finalDmg * 0.5;

                // Tạo Slash
                iceZones.push(new StormSlash(targetX + this.w / 2, targetY + this.h / 2, echoRadius, echoDmg, this, false));

                // Visual Hư Ảnh
                explosions.push(new Explosion(targetX + this.w / 2, targetY + this.h / 2, echoRadius, 'rgba(100, 100, 255,', 0, this));

            }, 300); // Lặp lại sau 0.3s (như tiếng vọng)
        }

        // 3. Xử lý Dịch chuyển về (Giữ nguyên code cũ)
        if (this.stormReturnPos) {
            explosions.push(new Explosion(targetX + this.w / 2, targetY + this.h / 2, 40, 'rgba(255,255,255,', 0, this));

            // Logic Bóng Evo 2 cũ (Giữ nguyên hoặc bỏ tùy bạn, ở đây giữ nguyên để cộng dồn độ bá đạo)
            if (this.hasUpgrade('evo_storm_2') && ratio >= 0.95 && this.shield > 0) {
                let shadow = {
                    x: targetX, y: targetY, w: this.w, h: this.h,
                    vx: 0, vy: 0, owner: this,
                    isStormShadow: true, isPiercing: true, hitIds: []
                };
                this.bullets.push(shadow);
                setTimeout(() => {
                    let idx = this.bullets.indexOf(shadow);
                    if (idx > -1) this.bullets.splice(idx, 1);
                }, slashDelay + 100);
            }

            this.x = this.stormReturnPos.x;
            this.y = this.stormReturnPos.y;
            this.stormReturnPos = null;
        }
    }

    fireBeam() {
        const isEvo = this.hasUpgrade('evo_lazer_c_1');
        const beamW = isEvo ? 30 : 10;
        const beamX = this.x + this.w / 2 - beamW / 2;
        beams.push(new Beam(beamX, (this.id === 1 ? 0 : this.y + this.h), beamW, (this.id === 1 ? this.y : canvas.height - (this.y + this.h)), this.id, isEvo));

        const bRx = beamX; const bRy = (this.id === 1 ? 0 : this.y + this.h);
        const bRw = beamW; const bRh = (this.id === 1 ? this.y : canvas.height - (this.y + this.h));

        const enemy = (this.id === 1) ? p2 : p1;
        if (rectIntersect(bRx, bRy, bRw, bRh, enemy.x, enemy.y, enemy.w, enemy.h)) { enemy.takeDamage(6, this); }

        crates.forEach(c => {
            if (c.active && rectIntersect(bRx, bRy, bRw, bRh, c.x, c.y, c.w, c.h)) {
                c.active = false;
                if (c.isMimic) triggerMimicExplosion(c, this);
                if (c.type === 'hp') this.hp = Math.min(this.hp + 2, this.maxHp);
                if (c.type === 'ammo') this.onCollectAmmoCrate(c);
                if (c.type === 'shield') this.shield++;
                if (c.type === 'dmg') this.dmgBuff++;
                if (this.weapon === 'evolution') this.onEvolutionCrateEat(c.type);
                if (c.type === 'boom') explosions.push(new Explosion(c.x + c.w / 2, c.y + c.h / 2, 60, 'rgba(255,0,0,', 2, null));
                if (c.type === 'coin') {
                    let money = 30; if (this.weapon === 'money_tank') money *= 2;
                    if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                }
            }
        });

        moneyTrucks.forEach(t => {
            if (t.active && rectIntersect(bRx, bRy, bRw, bRh, t.x, t.y, t.w, t.h)) {
                let dmg = 8; if (this.weapon === 'money_tank') dmg *= 3;
                t.hp -= dmg;
                if (t.hp <= 0) {
                    t.active = false;
                    let money = 50; if (this.weapon === 'money_tank') money *= 2;
                    if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                    if (this.weapon === 'evolution') this.onEvolutionCrateEat('truck');
                    if (this.hasUpgrade('evo_money_atk')) explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 100, 'rgba(255,215,0,', 5, this));
                }
            }
        });
    }
    fireAnhMinhHitscan(dmg, isPiercing, color, originX, originY) {
        let startX = originX || (this.x + this.w / 2);
        let startY = originY || ((this.id === 1) ? this.y : this.y + this.h);
        let endY = (this.id === 1) ? 0 : canvas.height;
        let dirY = (this.id === 1) ? -1 : 1;

        // 1. Tạo hiệu ứng hình ảnh tia kiếm (tồn tại trong 10 frame)
        explosions.push({
            active: true, life: 10,
            update: function () { this.life--; if (this.life <= 0) this.active = false; },
            draw: function () {
                if (!this.active) return;
                ctx.save();
                ctx.strokeStyle = color; ctx.lineWidth = 6;
                ctx.shadowBlur = 15; ctx.shadowColor = color;
                ctx.globalCompositeOperation = "lighter";
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(startX, endY);
                ctx.stroke();
                ctx.restore();
            }
        });

        // 2. Logic sát thương Hitscan (Kiểm tra theo đường thẳng đứng)
        const checkLineHit = (target) => {
            // Kiểm tra xem trục X của mục tiêu có cắt ngang tia kiếm không
            if (target.x < startX + 15 && target.x + target.w > startX - 15) {
                // Kiểm tra xem mục tiêu có nằm phía trước mũi kiếm không
                let isBetween = (this.id === 1) ? (target.y < startY) : (target.y > startY);
                if (isBetween && target.active !== false) {
                    return true;
                }
            }
            return false;
        };

        // Gây sát thương lên Địch
        const enemy = (this.id === 1) ? p2 : p1;
        if (checkLineHit(enemy)) { enemy.takeDamage(dmg, this);

            // Hiệu ứng chém trúng
            explosions.push(new Explosion(startX, enemy.y + enemy.h / 2, 30, color, 0, this));

            // Nếu không xuyên thấu, tia kiếm dừng lại tại mục tiêu
            if (!isPiercing) endY = enemy.y + enemy.h / 2;
        }

        // Gây sát thương lên Xe tiền và Thùng (nếu tia kiếm đi qua)
        moneyTrucks.forEach(t => {
            if (checkLineHit(t)) {
                t.hp -= dmg * 2;
                explosions.push(new Explosion(startX, t.y + t.h / 2, 30, 'gold', 0, this));
                if (t.hp <= 0) {
                    t.active = false;
                    let money = 30; if (this.weapon === 'money_tank') money *= 2;
                    if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                    if (this.weapon === 'evolution') this.onEvolutionCrateEat('truck');
                }
                if (!isPiercing && Math.abs(t.y - startY) < Math.abs(endY - startY)) endY = t.y + t.h / 2;
            }
        });

        crates.forEach(c => {
            if (checkLineHit(c)) {
                c.active = false;
                if (c.isMimic) triggerMimicExplosion(c, this);
                if (c.type === 'hp') this.hp = Math.min(this.hp + 1, this.maxHp);
                if (c.type === 'ammo') this.onCollectAmmoCrate(c);
                if (c.type === 'shield') this.shield++;
                if (c.type === 'dmg') this.dmgBuff++;
                if (this.weapon === 'evolution') this.onEvolutionCrateEat(c.type);
                if (c.type === 'boom') explosions.push(new Explosion(c.x, c.y, 60, 'red', 2, this));
                explosions.push(new Explosion(c.x, c.y, 30, 'white', 0, this));
            }
        });
    }
    fireGojoBlue(isEvo2, enemy) {
        let dirY = (this.id === 1) ? -1 : 1;
        let speed = 16;

        this.bullets.push({
            type: 'gojo_blue',
            x: this.x + this.w / 2 - 10,
            y: (this.id === 1) ? this.y - 20 : this.y + this.h,
            w: 20, h: 20,
            vx: 0,
            vy: dirY * speed,
            dmg: this.damage,
            owner: this,
            isEvo2: isEvo2,
            iscanshoot: true,
            startX: this.x,
            startY: this.y,
            isPiercing: false,
            hitIds: []
        });

        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 40, 'rgba(0, 0, 255, 0.2)', 0, this));
    }

    fireGojoRed(isEvo2, enemy) {
        // 1. Cài đặt thông số tia Red (Evo 2 thì tia to hơn, choáng hợp lý)
        const beamW = isEvo2 ? 22 : 12;
        const stunFrames = isEvo2 ? 14 : 8; // Số frame làm choáng (đã nerf cân bằng)
        const beamX = this.x + this.w / 2 - beamW / 2;

        // Tọa độ Y và Chiều cao của tia (Bắn thẳng về phía đối diện)
        const bRy = (this.id === 1) ? 0 : this.y + this.h;
        const bRh = (this.id === 1) ? this.y : canvas.height - (this.y + this.h);

        // 2. Vẽ tia (Tận dụng array beams của bạn)
        beams.push(new Beam(beamX, bRy, beamW, bRh, this.id, isEvo2));

        // Thêm một vụ nổ nhỏ ngay họng súng để tạo cảm giác "Bắn Đỏ"
        explosions.push(new Explosion(this.x + this.w / 2, (this.id === 1) ? this.y : this.y + this.h, beamW + 20, 'rgba(255, 0, 0, 0.7)', 0, this));

        // 3. Xử lý va chạm với Kẻ địch (Gây Dmg + Choáng)
        if (rectIntersect(beamX, bRy, beamW, bRh, enemy.x, enemy.y, enemy.w, enemy.h)) { enemy.takeDamage(this.damage / 2, this);

            // [ĐẶC TRƯNG CỦA GOJO RED]: Làm choáng
            enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, stunFrames);

            // Hiệu ứng nổ đỏ đùng đùng trên người kẻ địch
            explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 60, 'rgba(255, 0, 0, 0.9)', 0, this));
        }

        // 4. Tương tác môi trường: Phá hòm (Giữ nguyên logic cực tốt của bạn)
        crates.forEach(c => {
            if (c.active && rectIntersect(beamX, bRy, beamW, bRh, c.x, c.y, c.w, c.h)) {
                c.active = false;
                if (c.isMimic) triggerMimicExplosion(c, this);
                if (c.type === 'hp') this.hp = Math.min(this.hp + 2, this.maxHp);
                if (c.type === 'ammo') this.onCollectAmmoCrate(c);
                if (c.type === 'shield') this.shield++;
                if (c.type === 'dmg') this.dmgBuff++;
                if (this.weapon === 'evolution') this.onEvolutionCrateEat(c.type);
                if (c.type === 'boom') explosions.push(new Explosion(c.x + c.w / 2, c.y + c.h / 2, 60, 'rgba(255,0,0,', 2, null));
                if (c.type === 'coin') {
                    let money = 30;
                    if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                }
            }
        });

        // 5. Tương tác môi trường: Bắn xe chở tiền
        moneyTrucks.forEach(t => {
            if (t.active && rectIntersect(beamX, bRy, beamW, bRh, t.x, t.y, t.w, t.h)) {
                let dmgToTruck = 10; // Đỏ bắn cháy xe nhanh hơn
                t.hp -= dmgToTruck;
                if (t.hp <= 0) {
                    t.active = false;
                    let money = 50;
                    if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                    if (this.weapon === 'evolution') this.onEvolutionCrateEat('truck');
                    explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 100, 'rgba(255,0,0,', 5, this));
                }
            }
        });
    }

    fireGojoPurple() {
        // Bắn một viên đạn Tím đặc biệt
        let dirY = (this.id === 1) ? -1 : 1;
        this.bullets.push({
            type: 'purple',
            x: this.x + this.w / 2 - 20,
            y: (this.id === 1) ? this.y - 40 : this.y + this.h,
            w: 40, h: 40,
            vx: 0,
            vy: dirY * 1, // Ban đầu bay rất chậm
            dmg: 2.2,
            owner: this,
            isPiercing: true,
            chargeTimer: 30,
            hitIds: []
        });
    }

    fireBullet(multiplier, isFullCharge = false, type = 'normal') {
        // ... (Code tính dmg, spd, size cũ giữ nguyên)
        let dmg = (this.damage + this.dmgBuff) * multiplier;
        let spd = C.bulletSpeed;
        if (typeof gameState !== 'undefined' && gameState.currentMap === 'overdrive') spd *= 1.5;

        if (this.weapon === 'money_tank') spd *= 0.6;
        if (this.weapon === 'overload') spd += (multiplier * 0.8 + 2);
        if (this.weapon === 'lazer_auto') spd += 1;
        if (this.hasUpgrade('evo_lazer_a_1')) spd += 2;
        if (this.weapon === 'rocket') spd = this.hasUpgrade('evo_rocket_1') ? 1.5 : 2;

        let size = 5; let hSize = 5;
        if (this.weapon === 'big_bullet') size = 10;
        if (this.hasUpgrade('evo_big_1')) size = 16;
        // FULL EVO BIG BULLET: Siêu to
        let isFullEvoBig = (this.weapon === 'big_bullet' && this.hasUpgrade('evo_big_1') && this.hasUpgrade('evo_big_2'));
        if (isFullEvoBig) size = 22;
        if (this.weapon === 'overload') size += (multiplier * 1.5);
        if (this.weapon === 'rocket') size = this.hasUpgrade('evo_rocket_2') ? 12 : 8;
        if (this.weapon === 'lazer_auto') { size = this.hasUpgrade('evo_lazer_a_2') ? 6 : 3; hSize = 18; }
        if (this.weapon === 'money_tank' && this.upgradeLevel >= 4) size += 4;




        if (this.weapon === 'necromancer' || type === 'necro_soul') {
            size = 8;
            hSize = 10;
            spd += 2;
        }

        // --- LOGIC AXIT ---
        let createAcidZone = false;
        if (this.weapon === 'acid') {
            this.acidShotCount++;
            if (this.acidShotCount % 5 === 0) { // Viên thứ 5
                createAcidZone = true;
                size += 4; // Đạn to hơn
            }
        }
        // FULL EVO OVERLOAD: Tạo vùng lửa/radiation khi nổ
        let createFireZone = false;
        if (this.weapon === 'overload' && this.hasUpgrade('evo_over_1') && this.hasUpgrade('evo_over_2') && isFullCharge) {
            createFireZone = true;
        }

        // --- LOGIC KỸ SƯ (Evo 1: Chủ bắn -> Trụ bắn) ---
        if (this.weapon === 'engineer' && this.hasUpgrade('evo_eng_1')) {
            turrets.forEach(t => {
                if (t.owner === this && t.active) t.shoot();
            });
        }

        let dirY = (this.id === 1) ? -1 : 1;
        let startY = (this.id === 1) ? this.y - hSize : this.y + this.h;

        // --- LOGIC ICE NERF ---
        let isIce = (this.weapon === 'ice');
        let createIceZone = false;
        let isBigIceZone = false;

        if (isIce) {
            this.iceShotCount++;
            if (this.iceShotCount % 3 === 0) {
                createIceZone = true;
                spd *= 1.5;

                if (this.hasUpgrade('evo_ice_1')) {
                    this.iceZoneTriggerCount++;
                    // NERF: Chỉ kích hoạt vùng lớn ở lần thứ 3 (3, 6, 9...)
                    if (this.iceZoneTriggerCount % 2 === 0) {
                        isBigIceZone = true;
                        size += 20;
                    } else {
                        // 2 lần đầu bắn ra đạn thường (nhưng vẫn tạo zone nhỏ ở dưới)
                        size += 15;
                        isBigIceZone = false;
                    }
                } else {
                    // Nếu không có Evo thì cứ mỗi 5 viên là to hơn xíu
                    size += 10;
                }
            }
        }
        // ----------------------
        // --- Âm dương sư
        let isAmChuBullet = false;
        let isDuongChuBullet = false;

        if (this.weapon === 'am_duong_su') {
            let isFullEvo = this.hasUpgrade('evo_ads_1') && this.hasUpgrade('evo_ads_2');
            if (this.isAmChu) {
                isAmChuBullet = true;
            } else {
                isDuongChuBullet = true;
                if (isFullEvo) dmg *= 1.5; // Full Evo: Bùa Dương thêm sát thương
            }
            this.isAmChu = !this.isAmChu; // Đổi trạng thái cho phát bắn sau
        }

        // --- THÊM ĐOẠN NÀY ĐỂ CHỈNH SIZE CHO HƯ VÔ KIẾM ---
        if (type === 'hu_vo') {
            size = 12; // Chiều rộng lưỡi kiếm
            hSize = 35; // Chiều dài thanh kiếm
            spd += 2; // Buff tốc độ bay một chút
        }
        // --- CẤU HÌNH ĐẠN NEON CHO NƯỚC & LỬA ---
        let isWater = (this.weapon === 'water_gun');
        let isFurnace = (this.weapon === 'furnace');

        if (type === 'water_normal' || type === 'fire_normal') {
            size = 6; hSize = 12; spd += 2; // Đạn thường: Dài 25, bay nhanh
        } else if (type === 'water_stream' || type === 'fire_stream') {
            size = 10; hSize = 80; spd += 5; // Tia phun liên tục: Siêu dài, cực nhanh
        }
        // --------------------------------------------------

        // ... (Logic Shotgun giữ nguyên)
        if (this.weapon === 'shotgun') {
            let angles = (this.bulletCount === 5) ? [-0.4, -0.2, 0, 0.2, 0.4] : [-0.3, 0, 0.3];
            angles.forEach(angle => {
                this.bullets.push({ x: this.x + this.w / 2 - size / 2, y: startY, w: size, h: size, vx: angle * spd, vy: dirY * spd, dmg: dmg, owner: this });
            });
            return;
        }

        // --- SMG LOGIC ---
        let vx = 0;
        let vy = dirY * spd; // [FIX 1] KHAI BÁO BIẾN `vy` Ở ĐÂY ĐỂ GAME KHÔNG BỊ CRASH

        // --- GÁN THÊM CHO 6 NÒNG ---
        let inflictBurn = false;
        if (this.weapon === 'six_barrel') {
            vx = this.nextShotSpreadVx || 0;
            inflictBurn = this.nextShotInflictsBurn || false;
            size = 4; // Đạn nhỏ xíu
            hSize = 8;
            spd += 4; // Đạn bay siêu nhanh
        }
        if (this.weapon === 'smg') {
            if (this.smgSprayCount >= 3) vx = (Math.random() - 0.5) * 5;
            else vx = 0;

            if (this.hasUpgrade('evo_smg_1') && this.smgSprayCount > 3) {
                let bonus = this.smgSprayCount - 3;
                dmg += bonus * 0.1; spd += bonus * 0.3; size += Math.min(bonus * 0.5, 5);
            }
        }
        // --- LOGIC PORTAL FULL EVO (MỚI) ---
        if (this.weapon === 'portal') spd += this.portalBulletSpeedBonus;

        let isPiercing = (this.weapon === 'lazer_auto') || (this.weapon === 'money_tank' && this.upgradeLevel >= 4) || (this.weapon === 'water_gun' && this.hasUpgrade('evo_water_2')) || (this.weapon === 'inventor' && this.invUpgrades && this.invUpgrades['inv_tangcuong'] && this.invUpgrades['inv_lazer']);

        // --- Ghost ---///
        let isGhostBullet = (this.weapon === 'ghost');
        let isFlicker = false;

        if (isGhostBullet) {
            spd += 2;
            if (this.isGhostActive) {
                spd += 5; isPiercing = true; isFlicker = true;
                dmg *= 1.5; // +50% Đòn Phục Kích Chí Mạng từ Vô Ảnh
            }
            if (this.hasUpgrade('evo_ghost_1') && this.isGhostActive) spd += 2;
        }
        if (this.weapon === 'magician' && this.invisTimer > 0) {
            dmg *= 1.35; // +35% Đòn Đột Kích Bất Ngờ khi Tàng Hình
        }
        if (isGhostBullet && this.hasPhantom && this.isGhostActive && this.hasUpgrade('evo_ghost_1') && this.hasUpgrade('evo_ghost_2')) {
            const enemy = (this.id === 1) ? p2 : p1;
            let angle = Math.atan2(enemy.y - startY, enemy.x - (this.x + this.w / 2));
            vx = Math.cos(angle) * spd * 0.5;
        }

        let isExplosive = (this.weapon === 'portal' && this.nextShotExplosive);
        if (isExplosive) { this.nextShotExplosive = false; size = 10; };
        if (this.weapon === 'money_tank' && this.upgradeLevel >= 5) isExplosive = true;
        if (this.weapon === 'inventor' && this.invUpgrades && this.invUpgrades['inv_tangcuong'] && this.invUpgrades['inv_phao']) isExplosive = true;
        // sukuna
        if (this.weapon === 'sukuna') { size = 30; hSize = 10; }

        // --- LOGIC TRỐI CHẾT (DEATH LOCK) ---
        let isDeathLock = (this.weapon === 'death_lock');
        let isConfinementBullet = false;
        if (isDeathLock) {
            this.deathLockShotCount = (this.deathLockShotCount || 0) + 1;
            let nowTime = Date.now();
            if (this.deathLockShotCount % 6 === 0 && (nowTime - (this.lastConfinementCageEndTime || 0) >= 5000)) {
                isConfinementBullet = true;
                size += 6;
            }
        }

        //-sniper-//
        // --- LOGIC SNIPER (NGẮM NÓN & RAYCAST) ---
        let isRaycast = false;
        let isSniperBullet = (this.weapon === 'sniper');


        if (isSniperBullet) {
            isPiercing = true; // Mặc định xuyên vật thể
            let isFullEvo = this.hasUpgrade('evo_sniper_1') && this.hasUpgrade('evo_sniper_2');

            // Raycast RNG
            let rayChance = isFullEvo ? 0.5 : (this.hasUpgrade('evo_sniper_2') ? 0.25 : 0);
            if (Math.random() < rayChance) {
                isRaycast = true; spd = 40; hSize = 60;
                dmg = Math.min(2.5, dmg); // Cân bằng Online: khống chế sát thương Raycast tối đa 2.5
            }

            // [FIX 2] Bỏ `let startY` (vì ở đầu hàm bạn đã gọi rồi, khai báo lại sẽ lỗi)
            let startX = this.x + this.w / 2;

            // Ngắm nón tự động (Cone Aiming)
            const enemy = (this.id === 1) ? p2 : p1;
            let targetAngle = Math.atan2((enemy.y + enemy.h / 2) - startY, (enemy.x + enemy.w / 2) - startX);
            let baseAngle = (this.id === 1) ? -Math.PI / 2 : Math.PI / 2;

            let diff = targetAngle - baseAngle;
            while (diff <= -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;

            let maxCone = isFullEvo ? 0.6 : 0.3; // Mở rộng góc ngắm Full Evo

            let hasWallInFront = false;
            if (typeof sniperWalls !== 'undefined') {
                hasWallInFront = sniperWalls.some(w => rectIntersect(this.x, (this.id === 1) ? this.y - 50 : this.y + this.h, this.w, 50, w.x, w.y, w.w, w.h));
            }

            if (!hasWallInFront && Math.abs(diff) <= maxCone) {
                vx = Math.cos(targetAngle) * spd;
                vy = Math.sin(targetAngle) * spd; // Hợp lệ nhờ `let vy` khai báo ở trên
            }
        }

        // ===============================================
        // TIẾN HÀNH BẮN ĐẠN VÀO MẢNG CHUNG
        // ===============================================
        // Recalculate vy after weapon-specific speed modifications
        vy = dirY * spd;
        soundSystem.playShoot(this.weapon === 'lazer_auto' ? 'laser' : (this.weapon === 'rocket' ? 'cannon' : 'normal'));

        this.bullets.push({
            type: type,
            createAcidZone: createAcidZone,
            isWater: isWater,
            isFurnace: isFurnace,
            isAcid: (this.weapon === 'acid'),
            createFireZone: createFireZone,
            isFullEvoBig: isFullEvoBig,
            isGhost: isGhostBullet,
            isFlicker: isFlicker,
            x: this.x + this.w / 2 - size / 2,
            y: startY,
            w: size,
            h: hSize,

            vx: vx,
            vy: vy, // [FIX 3] Gán bằng biến `vy` thay vì `dirY * spd` để đạn có thể bay nghiêng theo góc ngắm

            dmg: dmg,
            owner: this,
            bounceCount: 0,
            isFullCharge: isFullCharge,
            isPiercing: isPiercing,
            inflictBurn: inflictBurn,
            isRocket: (this.weapon === 'rocket'),
            rocketAccel: (this.weapon === 'rocket') ? 0.2 : 0,
            isExplosive: isExplosive,
            isIce: isIce,
            createIceZone: createIceZone,
            isBigIceZone: isBigIceZone,
            isAmChu: isAmChuBullet,
            isDuongChu: isDuongChuBullet,
            isSniperBullet: isSniperBullet,
            isRaycast: isRaycast,
            raycastBaseSpd: C.bulletSpeed,
            isSukunaSlash: (this.weapon === 'sukuna'),
            isInventorPlayerBullet: (this.weapon === 'inventor'),
            tangCuongSlow: !!(this.weapon === 'inventor' && this.invUpgrades && this.invUpgrades['inv_tangcuong'] && this.invUpgrades['inv_bang']),
            tangCuongBurn: !!(this.weapon === 'inventor' && this.invUpgrades && this.invUpgrades['inv_tangcuong'] && this.invUpgrades['inv_lua']),
            tangCuongNhieu: !!(this.weapon === 'inventor' && this.invUpgrades && this.invUpgrades['inv_tangcuong'] && this.invUpgrades['inv_nhieu']),
            isDeathLockBullet: isDeathLock,
            isConfinementBullet: isConfinementBullet,
            isNecroSoul: (this.weapon === 'necromancer' || type === 'necro_soul'),
            hitIds: []
        });
        // --- LOGIC BẢN SAO BẮN (MIRROR) ---
        // Chặn type 'mirror_clone' để bản sao không tự tạo ra bản sao nữa (tránh loop vô tận)
        // Tìm đoạn LOGIC BẢN SAO BẮN (MIRROR) ở cuối hàm fireBullet và sửa lại:
        if (this.weapon === 'mirror' && !type.includes('mirror_clone')) {
            let bx = this.x + this.w / 2 - size / 2;
            let by = startY;

            // Tọa độ bắn chỉ đối xứng ngang
            let cloneX = canvas.width - (bx + size);
            let cloneY = by; // <--- SỬA THÀNH DÒNG NÀY: Giữ nguyên Y của đạn

            this.bullets.push({
                type: type + '_mirror_clone',
                createAcidZone: false, isWater: false, isFurnace: false, isAcid: false, createFireZone: false,
                isFullEvoBig: false, isGhost: false, isFlicker: false,

                x: cloneX, y: cloneY, w: size, h: hSize,
                vx: -vx, // Đảo ngược hướng ngang
                vy: vy,  // <--- SỬA THÀNH DÒNG NÀY: Giữ nguyên hướng dọc để đạn lao về phía đối thủ
                dmg: dmg * 0.5,

                owner: this, bounceCount: 0, isFullCharge: false, isPiercing: isPiercing, inflictBurn: false,
                isRocket: false, rocketAccel: 0, isExplosive: false, isIce: false, createIceZone: false, isBigIceZone: false,
                isAmChu: false, isDuongChu: false, isSniperBullet: false, isRaycast: false, raycastBaseSpd: C.bulletSpeed,
                hitIds: []
            });
        }
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            // FIX: Phải gọi viên đạn b ra TRƯỚC CÙNG rồi mới làm gì thì làm
            let b = this.bullets[i];
            let hitWall = false;

            // Motion blur / trailHistory cho đạn nhanh
            let isFastBullet = b.isSniperBullet || b.isRaycast || b.type === 'arrow' || b.isLazer || (b.isGhost && b.isFast) || b.isSukunaSlash || b.isFuga || b.type === 'purple' || b.isCannonball || b.isShortgun || b.type === 'shadow_empowered';
            if (isFastBullet) {
                if (!b.trailHistory) b.trailHistory = [];
                b.trailHistory.unshift({ x: b.x, y: b.y, w: b.w, h: b.h });
                if (b.trailHistory.length > 5) b.trailHistory.pop();
            }
            // Xử lý Raycast hóa đạn thường khi chạm vật thể cứng (Chèn vào ĐẦU vòng lặp `for (let i = this.bullets.length - 1; i >= 0; i--)`)
            if (b.isRaycast) {
                // Check nếu chạm các SniperWall hoặc MovingObstacle
                let hitSolid = false;
                let allWalls = [...sniperWalls];
                if (movingObstacle && movingObstacle.active) allWalls.push(movingObstacle);
                if (typeof bastions !== 'undefined' && bastions.length > 0) allWalls.push(...bastions);

                for (let w of allWalls) {
                    if (rectIntersect(b.x, b.y, b.w, b.h, w.x, w.y, w.w, w.h)) {
                        hitSolid = true; break;
                    }
                }
                if (hitSolid) {
                    b.isRaycast = false; // Mất trạng thái Raycast
                    b.h = 10; // Cắt ngắn lại thành đạn thường
                    let angle = Math.atan2(b.vy, b.vx);
                    b.vx = Math.cos(angle) * b.raycastBaseSpd;
                    b.vy = Math.sin(angle) * b.raycastBaseSpd;
                }
            }
            // 

            // LOGIC ĐẠN TÍM (GOJO)
            // ... (bên trong hàm updateBullets) ...
            // --- LOGIC ĐẠN TÍM (HƯ THỨC: TỬ) ---

            if (b.type === 'purple') {
                // 1. Tụ lực và tăng tốc
                if (b.chargeTimer > 0) {
                    b.chargeTimer--;
                    // (Tùy chọn) Thêm hiệu ứng hút không khí lúc đang tụ lực ở đây
                } else {
                    b.vy *= 1.1; // Tăng tốc dần đều
                    b.vx *= 1.1;
                }

                // 2. Di chuyển đạn (Bắt buộc phải tự di chuyển ở đây vì ta sẽ chặn code bên dưới)
                b.x += b.vx;
                b.y += b.vy;

                // 3. Xuyên thấu & Gây sát thương lên kẻ địch trên đường bay
                const enemyObj = (this.id === 1) ? p2 : p1;
                if (rectIntersect(b.x, b.y, b.w, b.h, enemyObj.x, enemyObj.y, enemyObj.w, enemyObj.h)) {
                    if (!b.hitIds) b.hitIds = [];
                    // Chỉ giật dame 1 lần khi bay xuyên qua để tránh giật HP liên tục tới chết
                    if (!b.hitIds.includes(enemyObj)) {
                        enemyObj.takeDamage(b.dmg, this);
                        b.hitIds.push(enemyObj);
                        // Nổ hiệu ứng nhỏ trên người địch
                        explosions.push(new Explosion(enemyObj.x + enemyObj.w / 2, enemyObj.y + enemyObj.h / 2, 30, 'rgba(128, 0, 128, 0.7)', 0, this));
                    }
                }

                // 4. Cán qua và xóa sổ Rương, Xe chở tiền
                let obstacles = [...crates, ...moneyTrucks];
                for (let obj of obstacles) {
                    if (obj.active && rectIntersect(b.x, b.y, b.w, b.h, obj.x, obj.y, obj.w, obj.h)) {
                        obj.active = false; // Xóa sổ vật thể ngay lập tức (Uy lực của Tử)
                        explosions.push(new Explosion(obj.x + obj.w / 2, obj.y + obj.h / 2, 60, 'rgba(128, 0, 128, 0.5)', 0, this));
                    }
                }

                // 5. Nổ khổng lồ khi chạm Tường (Check cả 4 bức tường)
                if (b.x <= 0 || b.x + b.w >= canvas.width || b.y <= 0 || b.y + b.h >= canvas.height) {
                    // Ép tọa độ không bị tràn viền
                    if (b.x < 0) b.x = 0;
                    if (b.x > canvas.width - b.w) b.x = canvas.width - b.w;
                    if (b.y < 0) b.y = 0;
                    if (b.y > canvas.height - b.h) b.y = canvas.height - b.h;

                    // Bùmmmm! (Nerfed: Bán kính nổ giảm 50% tránh bao phủ toàn map)
                    let radius = b.isEvo2 ? 70 : 55;
                    explosions.push(new Explosion(b.x + b.w / 2, b.y + b.h / 2, radius, 'purple', 3.0, this));

                    this.bullets.splice(i, 1);
                    continue;
                }

                // [CHỐT CHẶN]: Bắt buộc có dòng này để đạn Tím không bị lọt xuống code đạn thường bên dưới
                continue;
            }
            // --- LOGIC ĐẠN XANH (GOJO BLUE - HỐ ĐEN TRỌNG LỰC) ---
            if (b.type === 'gojo_blue') {
                b.x += b.vx;
                b.y += b.vy;

                let hitSomething = false;

                // 1. Check chạm Tường (Bắt 4 góc giống hệt chiêu Tím để không bao giờ bị tàng hình)
                if (b.x <= 0 || b.x + b.w >= canvas.width || b.y <= 0 || b.y + b.h >= canvas.height) {
                    hitSomething = true;
                    // Ép tọa độ không tràn viền
                    if (b.x < 0) b.x = 0;
                    if (b.x > canvas.width - b.w) b.x = canvas.width - b.w;
                    if (b.y < 0) b.y = 0;
                    if (b.y > canvas.height - b.h) b.y = canvas.height - b.h;
                }

                // 2. Check chạm Địch
                const enemyObj = (this.id === 1) ? p2 : p1;
                if (!hitSomething && rectIntersect(b.x, b.y, b.w, b.h, enemyObj.x, enemyObj.y, enemyObj.w, enemyObj.h)) {
                    hitSomething = true;
                }

                // 3. Check chạm Vật thể (Mượn form chuẩn của Tím)
                if (!hitSomething) {
                    let obstacles = [...crates, ...moneyTrucks];
                    if (typeof turrets !== 'undefined') obstacles.push(...turrets);
                    if (typeof movingObstacle !== 'undefined' && movingObstacle && movingObstacle.active) obstacles.push(movingObstacle);

                    for (let obj of obstacles) {
                        if (obj && obj.active && rectIntersect(b.x, b.y, b.w, b.h, obj.x, obj.y, obj.w, obj.h)) {
                            hitSomething = true;
                            // Phá hủy vật thể cản đường
                            if (obj.hp !== undefined) obj.hp -= b.dmg;
                            else obj.active = false;
                            break;
                        }
                    }
                }

                // 4. TRÚNG ĐÍCH -> HÚT VÀ NỔ
                if (hitSomething) {
                    let hitX = b.x + b.w / 2;
                    let hitY = b.y + b.h / 2;


                    let radius = b.isEvo2 ? 60 : 35;

                    // --- CƠ CHẾ HÚT VÀO GIỮA (CHỈ TRỤC NGANG X) ---
                    // Tầm hút rộng hơn vụ nổ để kéo địch từ xa vào
                    if (Math.hypot(enemyObj.x + enemyObj.w / 2 - hitX, enemyObj.y + enemyObj.h / 2 - hitY) <= radius) {
                        // Dịch chuyển thẳng kẻ địch vào đúng tâm X của hố đen
                        enemyObj.x = hitX - enemyObj.w / 2;
                        enemyObj.kbX = 0; // Khóa gia tốc để địch không văng ra ngoài, ăn trọn sát thương
                    }

                    // --- TẠO VỤ NỔ XANH ---
                    explosions.push(new Explosion(hitX, hitY, radius, 'rgba(0, 0, 255, 0.9)', b.dmg, this));

                    // Dư chấn Evo 2 (Nổ bồi thêm phát nữa)
                    if (b.isEvo2) {
                        setTimeout(() => {
                            explosions.push(new Explosion(hitX, hitY, radius - 20, 'rgba(0, 0, 255, 0.5)', b.dmg * 0.3, this));
                        }, 300);
                    }

                    // Xóa đạn vô hình sau khi nổ
                    this.bullets.splice(i, 1);
                    continue;
                }

                // Tránh đạn rơi xuống logic bên dưới
                continue;
            }

            // --- LOGIC ĐẠN TỰ NGẮM (HOMING) ---
            if (b.isHoming) {
                const enemy = (this.id === 1) ? p2 : p1;
                // Tính góc từ đạn tới kẻ địch
                let targetAngle = Math.atan2((enemy.y + enemy.h / 2) - (b.y + b.h / 2), (enemy.x + enemy.w / 2) - (b.x + b.w / 2));
                let currentAngle = Math.atan2(b.vy, b.vx);

                // Bẻ lái từ từ về phía địch (Turn speed = 0.05)
                let diff = targetAngle - currentAngle;
                while (diff <= -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;

                currentAngle += Math.sign(diff) * Math.min(Math.abs(diff), 0.05);

                let speed = Math.hypot(b.vx, b.vy);
                b.vx = Math.cos(currentAngle) * speed;
                b.vy = Math.sin(currentAngle) * speed;
            }
            if (b.isRocket) b.vy += (b.vy > 0 ? b.rocketAccel : -b.rocketAccel);
            b.x += b.vx; b.y += b.vy;

            // ==========================================
            // --- [CHÈN VÀO ĐÂY]: LOGIC VUA ĐẦU BẾP (SUKUNA) ---
            // ==========================================
            if (b.isSukunaSlash || b.isFuga) {

                // 1. Phách Diện Rộng (Chém nát đạn đối thủ)
                if (b.isSukunaSlash && this.hasUpgrade('evo_sukuna_2')) {
                    const enemy = (this.id === 1) ? p2 : p1;
                    for (let j = enemy.bullets.length - 1; j >= 0; j--) {
                        let eb = enemy.bullets[j];
                        // Đảm bảo không tự chém trúng Fuga hay Slash của đối phương (nếu cả 2 chơi Sukuna)
                        if (!eb.isSukunaSlash && !eb.isFuga) {
                            if (rectIntersect(b.x, b.y, b.w, b.h, eb.x, eb.y, eb.w, eb.h)) {
                                enemy.bullets.splice(j, 1); // Xóa sổ đạn đối thủ
                            }
                        }
                    }
                }

                // 2. Hỏa Mũi Tên Fuga (Thiêu rụi mọi vật thể)
                if (b.isFuga) {
                    // Gộp chung các chướng ngại vật lại (Thùng đồ, Xe chở tiền, Tường di động)
                    let obstaclesToDestroy = [...crates, ...moneyTrucks];
                    if (typeof movingObstacle !== 'undefined' && movingObstacle && movingObstacle.active) {
                        obstaclesToDestroy.push(movingObstacle);
                    }

                    for (let obj of obstaclesToDestroy) {
                        if (obj.active && rectIntersect(b.x, b.y, b.w, b.h, obj.x, obj.y, obj.w, obj.h)) {
                            obj.active = false; // Phá nát vật thể
                            explosions.push(new Explosion(obj.x + obj.w / 2, obj.y + obj.h / 2, 80, 'rgba(255, 69, 0, 0.8)', 0, this));
                        }
                    }
                }

                // 3. Xóa đạn khi bay HẲN ra khỏi màn hình (Tránh lag game)
                // Kéo giãn tọa độ ra một chút để chiêu thức bay qua tường mượt mà
                if (b.x + b.w < -100 || b.x > canvas.width + 100 || b.y + b.h < -100 || b.y > canvas.height + 100) {
                    this.bullets.splice(i, 1);
                }

                // [CHỐT CHẶN]: Bỏ qua toàn bộ code check chạm tường, chạm rương bên dưới 
                // để chiêu của Sukuna càn quét xuyên thấu bản đồ!
                continue;
            }
            // ==========================================
            // --- KẾT THÚC LOGIC SUKUNA ---


            // --- [LOGIC MỚI] XỬ LÝ HƯ ẢNH (STORM PHANTOM) ---
            if (b.isStormPhantom) {
                b.y += b.vy;
                b.distanceTraveled += Math.abs(b.vy);

                // 1. EVO 1: MẮT BÃO - PHÁ ĐẠN TRÊN ĐƯỜNG BAY
                if (this.hasUpgrade('evo_storm_1')) {
                    const enemyBullets = (this.id === 1) ? p2.bullets : p1.bullets;
                    for (let j = enemyBullets.length - 1; j >= 0; j--) {
                        let eb = enemyBullets[j];
                        // Nếu chạm đạn địch -> Xóa đạn địch
                        if (rectIntersect(b.x, b.y, b.w, b.h, eb.x, eb.y, eb.w, eb.h)) {
                            enemyBullets.splice(j, 1);
                            // Hiệu ứng xóa đạn (tùy chọn)
                        }
                    }
                }

                // 2. GÂY SÁT THƯƠNG TRÊN ĐƯỜNG BAY (XUYÊN THẤU)
                let targets = [moneyTrucks, crates]; // Check xe và thùng
                const enemy = (this.id === 1) ? p2 : p1;

                // Check địch
                if (!b.hitIds.includes(enemy) && rectIntersect(b.x, b.y, b.w, b.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
                    if (enemy.shield > 0) enemy.shield--;
                    else enemy.takeDamage(b.dmg, this);
                    b.hitIds.push(enemy);
                    explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 40, 'rgba(0,255,255,', 0, this));
                }

                // Check vật thể
                targets.forEach(group => {
                    group.forEach(obj => {
                        if (obj.active && rectIntersect(b.x, b.y, b.w, b.h, obj.x, obj.y, obj.w, obj.h)) {
                            // Gây dame lên xe/thùng nhưng không xóa bóng
                            obj.hp -= b.dmg * 2;
                            if (obj.hp <= 0 && obj instanceof MoneyTruck) { /* Logic nổ xe...*/ }
                            // Thêm logic phá thùng tại đây nếu muốn
                        }
                    });
                });

                // 3. ĐIỀU KIỆN DỪNG & DỊCH CHUYỂN
                let stop = false;
                // Chạm tường
                if (b.y < 0 || b.y > canvas.height - b.h) {
                    b.y = (b.y < 0) ? 0 : canvas.height - b.h;
                    stop = true;
                }
                // Hết tầm bay
                if (b.distanceTraveled >= b.maxDistance) stop = true;

                if (stop) {
                    // --- THỰC HIỆN DỊCH CHUYỂN ---
                    this.x = b.x;
                    this.y = b.y;

                    // Xóa bóng
                    this.bullets.splice(i, 1);

                    // Set thời gian chờ chém (0.5s)
                    this.stormSlashDelay = 30;

                    // Hiệu ứng xuất hiện
                    explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 50, 'rgba(255,255,255,', 0, this));
                    continue;
                }
                continue; // Bóng hư ảnh ko chạy logic đạn thường bên dưới
            }
            if (b.isWindBlade) {
                b.rotation += 0.3; // Tốc độ xoay
            }
            if (b.isWindBlade) {
                // Check va chạm với đạn đối phương
                const enemy = (this.id === 1) ? p2 : p1;
                for (let j = enemy.bullets.length - 1; j >= 0; j--) {
                    let eb = enemy.bullets[j];
                    if (rectIntersect(b.x, b.y, b.w, b.h, eb.x, eb.y, eb.w, eb.h)) {
                        // Evo 2: Nghịch Phong -> Phản đạn
                        if (this.hasUpgrade('evo_wind_2') && !eb.isPiercing && !eb.bounceCount) {
                            // Đổi chủ sở hữu
                            eb.owner = this;
                            eb.hitIds = []; // Xóa lịch sử va chạm

                            // Đổi hướng ngẫu nhiên về phía kẻ địch
                            let angle = Math.atan2(enemy.y - eb.y, enemy.x - eb.x);
                            angle += (Math.random() - 0.5);
                            let speed = Math.hypot(eb.vx, eb.vy);
                            eb.vx = Math.cos(angle) * speed;
                            eb.vy = Math.sin(angle) * speed;

                            // ✅ FIX QUAN TRỌNG: Chuyển đạn từ mảng địch sang mảng của mình
                            this.bullets.push(eb);
                            enemy.bullets.splice(j, 1);
                        } else {
                            // Mặc định: Phá đạn
                            enemy.bullets.splice(j, 1);
                        }
                    }
                }
            }
            if (b.x <= 0 || b.x >= canvas.width) {
                // Check đạn lớn
                if (this.hasUpgrade('evo_big_2') && b.bounceCount < 5) {
                    b.vx = -b.vx;
                    b.bounceCount++;
                    hitWall = false; // Đánh dấu là nảy, không phải đâm tường mất đạn

                    // FULL EVO BIG BULLET: Nảy tường phình to kích thước & tăng dame (bỏ tăng tốc đạn)
                    if (b.isFullEvoBig) {
                        b.w = Math.min(45, (b.w || 10) + 5);
                        b.h = Math.min(45, (b.h || 10) + 5);
                        b.dmg = (b.dmg || 2) + 0.25;
                        explosions.push(new Explosion(b.x, b.y, 30, 'orange', 0.5, this));
                    }
                } else hitWall = true;
            }
            if (b.y <= 0 || b.y >= canvas.height) {
                if (this.hasUpgrade('evo_big_2') && b.bounceCount < 5) {
                    b.vy = -b.vy;
                    b.bounceCount++;
                    hitWall = false;

                    // FULL EVO BIG BULLET: Nảy tường phình to kích thước & tăng dame (bỏ tăng tốc đạn)
                    if (b.isFullEvoBig) {
                        b.w = Math.min(45, (b.w || 10) + 5);
                        b.h = Math.min(45, (b.h || 10) + 5);
                        b.dmg = (b.dmg || 2) + 0.25;
                        explosions.push(new Explosion(b.x, b.y, 30, 'orange', 0.5, this));
                    }
                } else hitWall = true;
            }
            if (hitWall) {
                // --- THUNDER SPEAR CẮM TƯỜNG & NỔ ---
                if (b.isThunderSpear) {
                    let hasEvo1 = (this.hasUpgrade && this.hasUpgrade('evo_thun_1'));
                    let expDmg = 1.0;
                    explosions.push(new Explosion(b.x, b.y, 45, 'rgba(255, 255, 0,', expDmg, this));
                    let enemy = (this.id === 1) ? p2 : p1;
                    if (enemy && enemy.hp > 0 && Math.hypot((enemy.x + enemy.w / 2) - b.x, (enemy.y + enemy.h / 2) - b.y) <= 45) {
                        enemy.takeDamage(expDmg, this);
                        if (hasEvo1) {
                            enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, 60);
                            if (typeof addFloatingText === 'function') addFloatingText(enemy.x + enemy.w / 2, enemy.y - 12, "TÊ LIỆT! ⚡", "#ffff00", 14);
                        }
                    }
                    let plantX = Math.max(10, Math.min(canvas.width - 10, b.x));
                    let plantY = Math.max(10, Math.min(canvas.height - 10, b.y));
                    thunderPlantedSpears.push({
                        id: Math.random(),
                        owner: this,
                        x: plantX,
                        y: plantY,
                        angle: Math.atan2(b.vy, b.vx)
                    });
                    this.bullets.splice(i, 1);
                    continue;
                }

                // --- MAGNET BULLET CẮM CỘT TỪ TRƯỜNG ---
                if (b.isMagnetBullet) {
                    let maxNodes = (this.hasUpgrade && this.hasUpgrade('evo_mag_net_1') && this.hasUpgrade('evo_mag_net_2')) ? 4 : (this.hasUpgrade && this.hasUpgrade('evo_mag_net_2') ? 3 : 2);
                    let myNodes = magnetNodes.filter(n => n.owner === this && n.active);
                    if (myNodes.length >= maxNodes) {
                        let oldest = myNodes[0];
                        oldest.active = false;
                        explosions.push(new Explosion(oldest.x, oldest.y, 30, oldest.polarity === 1 ? 'rgba(255, 100, 0,' : 'rgba(0, 150, 255,', 0, this));
                    }
                    let plantX = Math.max(10, Math.min(canvas.width - 10, b.x));
                    let plantY = Math.max(10, Math.min(canvas.height - 10, b.y));
                    let isFullEvo = (this.hasUpgrade && this.hasUpgrade('evo_mag_net_1') && this.hasUpgrade('evo_mag_net_2'));
                    let radius = isFullEvo ? 135 : 90;
                    magnetNodes.push({
                        id: Math.random(),
                        owner: this,
                        x: plantX,
                        y: plantY,
                        polarity: b.polarity || this.magnetPolarity || 1,
                        radius: radius,
                        active: true
                    });
                    explosions.push(new Explosion(plantX, plantY, 25, b.polarity === 1 ? '#ff5722' : '#00bcd4', 0, this));
                    this.bullets.splice(i, 1);
                    continue;
                }

                // --- DEATH LOCK (TRỐI CHẾT): ĐẠN CẤM CHẾ CẮM TƯỜNG & MỞ LỒNG ---
                if (b.isConfinementBullet) {
                    confinementCages.push(new ConfinementCage(b.x, b.y, this));
                    this.bullets.splice(i, 1);
                    continue;
                }

                // --- THÊM VÀO ĐÂY CHO ÂM DƯƠNG SƯ ---
                if (b.isAmChu) {
                    let r = this.hasUpgrade('evo_ads_1') ? 55 : 40;
                    iceZones.push(new IceZone(b.x, b.y, r, 90, this)); // Âm: Làm chậm (nerfed)
                    talismans.push(new Talisman(b.x, b.y, 'am', this));
                }
                if (b.isDuongChu) {
                    let r = this.hasUpgrade('evo_ads_1') ? 55 : 40;
                    explosions.push(new Explosion(b.x, b.y, r, 'rgba(255, 100, 0,', 0.75, this)); // Dương: Nổ (nerfed)
                    voidZones.push(new VoidZone(b.x, b.y, r, 90, this)); // Dương: Cấm bắn (nerfed)
                    talismans.push(new Talisman(b.x, b.y, 'duong', this));
                }

                if (this.hasUpgrade('evo_over_1') && b.isFullCharge) explosions.push(new Explosion(b.x, b.y, 80, 'rgba(0, 255, 255,', 2, this));
                if (b.createFireZone) {
                    explosions.push(new Explosion(b.x, b.y, 100, 'red', 3, this));
                    radiationZones.push(new RadiationZone(b.x, b.y)); // Để lại vùng gây dame
                }
                if (b.type === 'hu_vo') {
                    explosions.push(new Explosion(b.x, b.y, 55, 'purple', 0.5, this));
                    voidZones.push(new VoidZone(b.x, b.y, 55, 120, this));
                }
                if (b.isRocket) {
                    let range = 60;
                    if (this.hasUpgrade('evo_rocket_1')) range = 100;
                    // Full Evo Rocket: Range 140
                    if (this.hasUpgrade('evo_rocket_1') && this.hasUpgrade('evo_rocket_2')) range = 140;

                    let color = this.hasUpgrade('evo_rocket_1') ? 'rgba(0, 255, 0,' : 'rgba(255, 100, 0,';
                    let dmg = this.hasUpgrade('evo_rocket_2') ? 2 : 1;
                    explosions.push(new Explosion(b.x, b.y, range, color, dmg, this));

                    if (this.hasUpgrade('evo_rocket_1')) radiationZones.push(new RadiationZone(b.x, b.y));
                }
                if (b.isExplosive) explosions.push(new Explosion(b.x, b.y, 55, 'rgba(255, 0, 255,', 2, this));

                // UPDATE LOGIC ICE ZONE TẠI TƯỜNG
                if (b.createIceZone) {
                    // Chỉ to nếu là BigIceZone (lần 3)
                    let radius = (this.hasUpgrade('evo_ice_1') && b.isBigIceZone) ? 125 : 75;
                    let duration = (this.hasUpgrade('evo_ice_1') && b.isBigIceZone) ? 600 : 120;
                    iceZones.push(new IceZone(b.x, b.y, radius, duration, this));
                }
                // --- LOGIC ACID MỚI: Chạm tường -> Tạo Vùng ---
                if (b.isAcid) {
                    iceZones.push(new AcidZone(b.x, b.y, this));
                    explosions.push(new Explosion(b.x, b.y, 40, '#7bf85cff', 0, this)); // Nổ hiệu ứng nhỏ
                }
                this.bullets.splice(i, 1); continue;
            }

            if (movingObstacle && movingObstacle.active && rectIntersect(b.x, b.y, b.w, b.h, movingObstacle.x, movingObstacle.y, movingObstacle.w, movingObstacle.h)) {
                if (!b.isPiercing) {
                    if (b.isRocket) {
                        let range = this.hasUpgrade('evo_rocket_1') || this.hasUpgrade('evo_rocket_2') ? 100 : 60;
                        let color = this.hasUpgrade('evo_rocket_1') ? 'rgba(0, 255, 0,' : 'rgba(255, 100, 0,';
                        explosions.push(new Explosion(b.x, b.y, range, color, 1, this));
                    }
                    if (b.isExplosive) explosions.push(new Explosion(b.x, b.y, 55, 'rgba(255, 0, 255,', 2, this));
                    this.bullets.splice(i, 1); continue;
                }
            }

            if (typeof bastions !== 'undefined' && bastions.length > 0) {
                let hitBastion = false;
                for (let bw of bastions) {
                    if (bw.active && rectIntersect(b.x, b.y, b.w, b.h, bw.x, bw.y, bw.w, bw.h)) {
                        bw.hp -= (b.dmg || 1);
                        if (bw.hp <= 0) {
                            bw.active = false;
                            explosions.push(new Explosion(bw.x + bw.w / 2, bw.y + bw.h / 2, 50, '#1abc9c', 0, this));
                        }
                        if (!b.isPiercing) {
                            this.bullets.splice(i, 1);
                            hitBastion = true;
                            break;
                        }
                    }
                }
                if (hitBastion) continue;
            }

            let hitTruck = false;
            for (let t of moneyTrucks) {
                if (t.active && rectIntersect(b.x, b.y, b.w, b.h, t.x, t.y, t.w, t.h)) {
                    if (b.isPiercing && b.hitIds.includes(t)) continue;
                    let dmg = b.dmg;
                    if (this.weapon === 'money_tank') dmg *= 3;
                    t.hp -= dmg;
                    if (b.isPiercing) b.hitIds.push(t);

                    if (b.isRocket || b.isExplosive) {
                        explosions.push(new Explosion(b.x, b.y, 55, 'rgba(255,165,0,', 2, this));
                        if ((b.isRocket || b.isExplosive) && !b.isPiercing) { this.bullets.splice(i, 1); hitTruck = true; break; }
                    }

                    if (!b.isPiercing) { this.bullets.splice(i, 1); hitTruck = true; }

                    if (t.hp <= 0) {
                        t.active = false;
                        let money = 30; if (this.weapon === 'money_tank') money *= 2;
                        if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                        if (this.weapon === 'evolution') this.onEvolutionCrateEat('truck');

                        // BUFF: Xe Tiền Evo bắn Shotgun vào kẻ địch
                        if (this.hasUpgrade('evo_money_atk')) {
                            const enemy = (this.id === 1) ? p2 : p1;
                            const angle = Math.atan2(enemy.y - (t.y + t.h / 2), enemy.x - (t.x + t.w / 2));
                            const spread = [-0.3, 0, 0.3];
                            spread.forEach(a => {
                                this.bullets.push({
                                    x: t.x + t.w / 2, y: t.y + t.h / 2, w: 6, h: 6,
                                    vx: Math.cos(angle + a) * 7, vy: Math.sin(angle + a) * 7,
                                    dmg: 2, owner: this, bounceCount: 0, isPiercing: false
                                });
                            });
                            // Vẫn nổ đẹp mắt
                            explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 60, 'rgba(255,215,0,', 0, this));
                        } else {
                            explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 80, 'rgba(255,215,0,', 5, this));
                        }
                    }
                    if (hitTruck) break;
                }
            }
            if (hitTruck) continue;

            let hitCrate = false;
            for (let c of crates) {
                if (c.active && rectIntersect(b.x, b.y, b.w, b.h, c.x, c.y, c.w, c.h)) {
                    c.active = false;
                    if (c.isMimic) {
                        triggerMimicExplosion(c, this);
                    }
                    if (c.type === 'hp') {
                        if (this.weapon === 'necromancer') {
                            let cap = this.maxSouls - (this.lockedSouls || 0);
                            this.currentSouls = Math.min(cap, (this.currentSouls || 0) + 4);
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "+4 LINH HỒN 👻", "#00e676", 13);
                        } else {
                            this.hp = Math.min(this.hp + 1, this.maxHp);
                        }
                    }
                    if (c.type === 'ammo') this.onCollectAmmoCrate(c);
                    if (c.type === 'shield') this.shield++;
                    if (c.type === 'dmg') this.dmgBuff++;
                    if (this.weapon === 'evolution') this.onEvolutionCrateEat(c.type);
                    if (c.type === 'boom') explosions.push(new Explosion(c.x + c.w / 2, c.y + c.h / 2, 60, 'rgba(255,0,0,', 2, null));
                    if (c.type === 'coin') {
                        let money = 30; if (this.weapon === 'money_tank') money *= 2;
                        if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                        if (this.weapon === 'inventor') this.components = (this.components || 0) + 2;
                    }
                    if (c.type === 'gear') {
                        let lkGain = this.hasUpgrade('evo_inv_1') ? 8 : 5;
                        this.ammo = Math.min(this.maxAmmo, this.ammo + 1);
                        this.hp = Math.min(this.maxHp, this.hp + 0.25);
                        if (this.weapon === 'inventor') {
                            this.components = (this.components || 0) + lkGain;
                            addFloatingText(this.x + this.w / 2, this.y - 15, `+${lkGain} LK`, "#00ffcc", 13);
                        }
                        if (this.weapon === 'genius') {
                            if (this.isPilotingMecha) {
                                if (this.mechaHp < this.mechaMaxHp) {
                                    this.mechaHp = Math.min(this.mechaMaxHp, this.mechaHp + 0.5);
                                    addFloatingText(this.x + this.w / 2, this.y - 15, "+0.5 MECHA HP 🤖", "#ff9800", 12);
                                } else {
                                    this.mechaVirtualArmor = (this.mechaVirtualArmor || 0) + 0.5;
                                    addFloatingText(this.x + this.w / 2, this.y - 15, "+0.5 GIÁP ẢO 🛡️", "#ffd700", 12);
                                }
                            } else {
                                this.gears = (this.gears || 0) + 1;
                                addFloatingText(this.x + this.w / 2, this.y - 15, "+1 BÁNH RĂNG ⚙️", "#ff9800", 12);
                            }
                        }
                    }
                    // Genius: +1 Bánh Răng khi nhặt hòm tiếp tế khác gear. Nếu đang lái Mecha -> quy đổi thành +0.5 HP/Giáp Ảo
                    if (this.weapon === 'genius' && c.type !== 'gear') {
                        if (this.isPilotingMecha) {
                            if (this.mechaHp < this.mechaMaxHp) {
                                this.mechaHp = Math.min(this.mechaMaxHp, this.mechaHp + 0.5);
                                addFloatingText(this.x + this.w / 2, this.y - 15, "+0.5 MECHA HP 🤖", "#ff9800", 12);
                            } else {
                                this.mechaVirtualArmor = (this.mechaVirtualArmor || 0) + 0.5;
                                addFloatingText(this.x + this.w / 2, this.y - 15, "+0.5 GIÁP ẢO 🛡️", "#ffd700", 12);
                            }
                        } else {
                            this.gears = (this.gears || 0) + 1;
                            addFloatingText(this.x + this.w / 2, this.y - 15, "+1 BÁNH RĂNG ⚙️", "#ff9800", 12);
                        }
                        this.components = (this.components || 0) + 0.5;
                        addFloatingText(this.x + this.w / 2, this.y - 27, "+0.5 LINH KIỆN 🔩", "#00e5ff", 11);
                    }
                    // Giáp hợp kim: Nhặt Crate nhận Giáp Ảo 5s
                    if (this.weapon === 'inventor' && this.invUpgrades && this.invUpgrades['inv_giap']) {
                        this.shield = (this.shield || 0) + 1;
                        this.crateShieldActive = true;
                        this.crateShieldExpireTimer = Date.now() + 5000;
                        addFloatingText(this.x + this.w / 2, this.y - 15, "+1 SHIELD (5s)", "#00ffff", 12);
                    }

                    if (!b.isPiercing) {
                        if (b.isRocket) explosions.push(new Explosion(b.x, b.y, 60, 'rgba(255, 100, 0,', 1, this));
                        if (b.isExplosive) explosions.push(new Explosion(b.x, b.y, 55, 'rgba(255, 0, 255,', 2, this));
                        // ICE ZONE TRÊN CRATE
                        if (b.createIceZone) {
                            let radius = (this.hasUpgrade('evo_ice_1') && b.isBigIceZone) ? 300 : 150;
                            let duration = (this.hasUpgrade('evo_ice_1') && b.isBigIceZone) ? 600 : 120;
                            iceZones.push(new IceZone(b.x, b.y, radius, duration, this));
                        }
                        this.bullets.splice(i, 1); hitCrate = true; break;
                    }
                }
            }
            if (hitCrate) continue;
        }
    }

    draw() {
        if (this.hp <= 0) return; // Nạn nhân bị nổ tung và biến mất

        const isOnline = (typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline);
        const isMyTank = !isOnline || (onlineManager.role === 'host' ? this.id === 1 : this.id === 2);

        // Hiệu ứng tàng hình (Ghost Vô Ảnh, Magician Tàng Hình, Shadow Hunter Vô Hình)
        let isStealth = (this.weapon === 'ghost' && this.isGhostActive) ||
                        (this.weapon === 'magician' && this.invisTimer > 0) ||
                        (this.weapon === 'shadow_hunter' && this.stealthActive);

        if (isStealth) {
            if (isOnline && !isMyTank) {
                // ẨN HOÀN TOÀN 100% trên màn hình đối thủ ở chế độ Online (WebRTC P2P)
                return;
            }
            // Trên màn hình bản thân: hiển thị dạng bán trong suốt để tự quan sát và điều khiển
            ctx.globalAlpha = 0.28;
        }

        // Render Motion Blur / Ghost Trail afterimages trước khi vẽ xe chính
        if (this.trailHistory && this.trailHistory.length > 0) {
            for (let t = 0; t < this.trailHistory.length; t++) {
                let tr = this.trailHistory[t];
                let trAlpha = 0.35 * (1 - (t + 1) / (this.trailHistory.length + 1));
                ctx.save();
                ctx.globalAlpha = trAlpha;
                ctx.fillStyle = tr.color || this.color;
                ctx.fillRect(tr.x, tr.y, tr.w, tr.h);
                ctx.restore();
            }
        }

        // Shortgun Cone Telegraph (Vệt hình nón đỏ cảnh báo tấn công 0.5s)
        if (this.weapon === 'shortgunATK' && this.shortgunTelegraphTimer > 0) {
            let dirY = (this.id === 1) ? -1 : 1;
            let startX = this.x + this.w / 2;
            let startY = (this.id === 1) ? this.y : this.y + this.h;
            let coneLen = 130;
            let coneSpread = 0.45;
            let baseAngle = (dirY === -1) ? -Math.PI / 2 : Math.PI / 2;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.arc(startX, startY, coneLen, baseAngle - coneSpread, baseAngle + coneSpread);
            ctx.closePath();
            let pulse = (Math.sin(Date.now() * 0.02) + 1) * 0.15 + 0.2;
            ctx.fillStyle = this.shortgunDoubleTap ? `rgba(255, 170, 0, ${pulse + 0.15})` : `rgba(255, 50, 50, ${pulse})`;
            ctx.fill();
            ctx.strokeStyle = this.shortgunDoubleTap ? '#ffcc00' : '#ff3333';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }

        // --- ĐỔI MÀU NHÂN VẬT THEO TRẠNG THÁI ---
        let drawColor = this.color;
        if (this.freezeTimer > 0) drawColor = "#aaddff"; // Đóng băng (Trắng xanh)
        else if (this.burnTimer > 0 && this.slowTimer > 0) drawColor = "#cc55cc"; // Vừa cháy vừa chậm (Tím)
        else if (this.burnTimer > 0) drawColor = "#ff33337a"; // Bị Đốt (Đỏ rực)
        else if (this.silenceTimer > 0) drawColor = "#24006d49"; // <--- THÊM DÒNG NÀY: Câm Lặng (Tím sẫm)
        else if (this.slowTimer > 0) drawColor = "#3399ff67"; // Bị Chậm (Xanh biển rực)
        if (this.weapon === 'am_duong_su') {
            drawColor = this.isAmChu ? "#2c3e5080" : "#f1c40f";
            ctx.fillStyle = this.isAmChu ? "#2c3e50" : "#f1c40f";
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, this.y - 30, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "white";
            ctx.stroke();
        }

        ctx.fillStyle = drawColor;
        ctx.fillRect(this.x, this.y, this.w, this.h);

        ctx.fillStyle = "#fff";
        let bx = this.x + this.w / 2 - 4;
        let by = (this.id === 1) ? this.y - 15 : this.y + this.h;
        if (this.weapon === 'smg') bx += (Math.random() - 0.5) * 8;
        if (this.weapon === 'tank') {
            ctx.fillStyle = "#555";
            let spikeY = (this.id === 1) ? this.y - 10 : this.y + this.h;
            ctx.beginPath();
            ctx.moveTo(this.x, (this.id === 1) ? this.y : this.y + this.h);
            ctx.lineTo(this.x + this.w, (this.id === 1) ? this.y : this.y + this.h);
            ctx.lineTo(this.x + this.w / 2, spikeY);
            ctx.fill();
        } else {
            ctx.fillRect(bx, by, 8, 20);
        }

        // Vẽ Drones của Nhà Phát Minh
        if (this.weapon === 'inventor' && this.drones) {
            this.drones.forEach(d => d.draw());
        }

        // Vẽ Lưới Điện Phản Pháo
        if (this.weapon === 'inventor' && this.luoiDienSanSang) {
            ctx.save();
            ctx.strokeStyle = "#00ffcc";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 38, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "rgba(0, 255, 200, 0.15)";
            ctx.fill();
            ctx.restore();
        }

        // Vẽ vòng kiếm bảo vệ (Kiếm Thể Thủ)
        if (this.swordShieldActive) {
            ctx.save();
            ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
            ctx.rotate(Date.now() / 200); // Xoay tròn

            for (let i = 0; i < this.swordShieldHits; i++) {
                ctx.save();
                ctx.rotate((Math.PI * 2 / this.swordShieldHits) * i);
                ctx.translate(0, -40); // Bán kính quỹ đạo
                drawGlowingSword(-4, -10, 8, 20, (this.id === 1) ? '#3498db' : '#e74c3c', this.id === 1 ? -1 : 1);
                ctx.restore();
            }
            ctx.restore();
        }
        // ==========================================
        // --- ĐỒ HỌA MAGICIAN (TÀNG HÌNH & BÓNG) ---
        // ==========================================
        if (this.weapon === 'magician') {
            // Bản thể thật tàng hình
            if (this.invisTimer > 0) ctx.globalAlpha = 0.2;

            // Vẽ các phân ảnh
            for (let ill of this.illusions) {
                ctx.save();
                // Nếu bản thể thật đang tàng hình, bóng cũng tàng hình theo. Nếu không, đậm 100%
                if (ill.invisTimer > 0 || this.invisTimer > 0) {
                    ctx.globalAlpha = 0.2;
                } else {
                    ctx.globalAlpha = 1.0; // KHÔNG BAO GIỜ BỊ MỜ SAU 5 GIÂY, LUÔN ĐẬM 100%
                }

                ctx.fillStyle = this.color;
                ctx.fillRect(ill.x, ill.y, ill.w, ill.h);

                // Vẽ nòng súng giả cho phân ảnh
                ctx.fillStyle = "#fff";
                let cbx = ill.x + ill.w / 2 - 4;
                let cby = (this.id === 1) ? ill.y - 20 : ill.y + ill.h;
                ctx.fillRect(cbx, cby, 8, 20);

                // ==========================================
                // --- VẼ THANH MÁU & ĐẠN CHO PHÂN ẢNH ---
                // ==========================================
                let isP1 = (this.id === 1);
                let hpY, ammoY;

                // 1. CĂN CHỈNH CHIỀU DỌC (TỌA ĐỘ Y)
                if (isP1) {
                    // PLAYER 1 (Bên Xanh - Nằm dưới màn hình)
                    // -> Thanh chỉ số nằm DƯỚI chân xe tăng
                    hpY = ill.y + ill.h + 6;
                    ammoY = ill.y + ill.h + 12;
                } else {
                    // PLAYER 2 (Bên Đỏ - Nằm trên màn hình)
                    // -> Thanh chỉ số nằm TRÊN đầu xe tăng (Ngược lại)
                    hpY = ill.y - 13;
                    ammoY = ill.y - 6;
                }

                let hpRatio = Math.max(0, ill.hp / ill.maxHp);
                let hpWidth = ill.w * hpRatio;

                // 2. VẼ THANH MÁU
                ctx.fillStyle = "red"; // Nền đỏ (Máu đã mất)
                ctx.fillRect(ill.x, hpY, ill.w, 4);

                ctx.fillStyle = "#0f0"; // Máu xanh
                if (isP1) {
                    // P1: Máu tụt từ phải qua trái (Căn lề trái)
                    ctx.fillRect(ill.x, hpY, hpWidth, 4);
                } else {
                    // P2: Máu tụt từ trái qua phải (Căn lề phải, đối xứng với P1)
                    ctx.fillRect(ill.x + ill.w - hpWidth, hpY, hpWidth, 4);
                }

                // 3. VẼ THANH ĐẠN
                let ammoW = ill.w / ill.maxAmmo;
                ctx.fillStyle = "yellow";
                for (let j = 0; j < ill.ammo; j++) {
                    let ammoX;
                    if (isP1) {
                        // P1: Đạn xếp từ trái sang phải
                        ammoX = ill.x + j * ammoW + 1;
                    } else {
                        // P2: Đạn xếp từ phải sang trái (Ngược lại)
                        ammoX = ill.x + ill.w - (j + 1) * ammoW + 1;
                    }
                    ctx.fillRect(ammoX, ammoY, ammoW - 1, 3);
                }
            }

            // Vẽ Đạn Giả & Đạn Hù Dọa
            if (this.fakeBullets && this.fakeBullets.length > 0) {
                ctx.fillStyle = "rgba(0, 255, 255, 0.7)"; // Đạn ảo màu cyan mờ
                for (let fb of this.fakeBullets) {
                    ctx.fillRect(fb.x, fb.y, fb.w, fb.h);
                }
            }
        }
        // cho mirro
        // --- VẼ BẢN SAO VÀ ẢNH CHIẾU CỦA MIRROR ---
        // Thay thế toàn bộ đoạn vẽ của Mirror bằng đoạn code chuẩn hóa này:
        // --- VẼ BẢN SAO VÀ ẢNH CHIẾU CỦA MIRROR ---
        if (this.weapon === 'mirror') {
            // Tọa độ bản sao (Chỉ đối xứng ngang)
            let cx = canvas.width - (this.x + this.w);
            let cy = this.y;

            // 1. VẼ BẢN SAO CỦA MÌNH
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = this.color;
            ctx.fillRect(cx, cy, this.w, this.h);

            ctx.fillStyle = "#fff";
            let cbx = cx + this.w / 2 - 4;
            let cby = (this.id === 1) ? cy - 20 : cy + this.h;
            ctx.fillRect(cbx, cby, 8, 20);

            if (this.mirrorCharge > 0) {
                ctx.fillStyle = "cyan";
                ctx.fillRect(this.x, this.y - 10, this.w * (this.mirrorCharge / 60), 4);
                ctx.fillRect(cx, cy - 10, this.w * (this.mirrorCharge / 60), 4);
            }
            ctx.restore();

            // 2. VẼ ẢNH CHIẾU KẺ THÙ (Evo 2)
            if (this.enemyClone && this.enemyClone.active) {
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = (this.id === 1) ? p2.color : p1.color;
                ctx.fillRect(this.enemyClone.x, this.enemyClone.y, this.w, this.h);

                ctx.strokeStyle = "magenta"; ctx.lineWidth = 2;
                ctx.strokeRect(this.enemyClone.x, this.enemyClone.y, this.w, this.h);
                ctx.restore();
            }

            // 3. VẼ ẢNH CHIẾU TAN VỠ (Full Evo)
            if (this.shatteredClone && this.shatteredClone.active) {
                ctx.save();
                ctx.globalAlpha = 0.8;
                ctx.fillStyle = "cyan"; // Trông như khối kính
                ctx.fillRect(this.shatteredClone.x, this.shatteredClone.y, this.w, this.h);

                ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
                ctx.strokeRect(this.shatteredClone.x, this.shatteredClone.y, this.w, this.h);

                ctx.fillStyle = "white"; ctx.font = "bold 10px Arial"; ctx.textAlign = "center";
                ctx.fillText("PHÁ TÔI!", this.shatteredClone.x + this.w / 2, this.shatteredClone.y - 10);

                // Máu của kính
                ctx.fillStyle = "red"; ctx.fillRect(this.shatteredClone.x, this.shatteredClone.y - 5, this.w, 3);
                ctx.fillStyle = "#0f0"; ctx.fillRect(this.shatteredClone.x, this.shatteredClone.y - 5, this.w * (this.shatteredClone.hp / 5), 3);
                ctx.restore();
            }
        }
        // Paradox
        // ==========================================
        // --- VẼ ẢO ẢNH CỦA PARADOX ---
        // ==========================================
        if (this.weapon === 'paradox') {
            const drawTether = (x1, y1, x2, y2, color) => {
                ctx.save(); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
                ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.restore();
            };
            const enemy = (this.id === 1) ? p2 : p1;
            let isFullEvo = this.hasUpgrade('evo_paradox_1') && this.hasUpgrade('evo_paradox_2');

            // 1. VẼ BÓNG BẢN THÂN (3 GIÂY TRƯỚC)
            if (this.paradoxHistory && this.paradoxHistory.length > 0) {
                let pShadow = this.paradoxHistory[0];
                ctx.save();
                ctx.globalAlpha = 0.4;
                ctx.fillStyle = "cyan";
                ctx.fillRect(pShadow.x, pShadow.y, this.w, this.h);
                ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.font = "bold 10px Arial";
                ctx.fillText("3s", pShadow.x + this.w / 2, pShadow.y - 5);
                ctx.restore();
                drawTether(this.x + this.w / 2, this.y + this.h / 2, pShadow.x + this.w / 2, pShadow.y + this.h / 2, "rgba(0, 255, 255, 0.3)");
            }

            // 2. VẼ UI TỤ LỰC (2 MỐC)
            if (this.paradoxCharge > 0) {
                let chargeColor = (this.paradoxCharge >= 120 && isFullEvo) ? "magenta" : "cyan";
                let fillRatio = Math.min(this.paradoxCharge / (isFullEvo ? 120 : 60), 1);

                ctx.fillStyle = chargeColor;
                ctx.fillRect(this.x, this.y - 10, this.w * fillRatio, 5);

                ctx.fillStyle = "white"; ctx.font = "bold 9px Arial"; ctx.textAlign = "center";
                let text = this.paradoxCharge >= 120 ? "FORCE REWIND" : (this.paradoxCharge >= 60 ? "REWIND READY" : "");
                ctx.fillText(text, this.x + this.w / 2, this.y - 15);
            }

            // Vẽ hồi chiêu
            if (this.paradoxCooldown > 0) {
                ctx.fillStyle = "gray";
                let maxCd = this.hasUpgrade('evo_paradox_2') ? 420 : 720;
                ctx.fillRect(this.x, this.y + this.h + 5, this.w * (this.paradoxCooldown / maxCd), 3);
            }

            // 2. VẼ BÓNG ĐỨNG YÊN CỦA ĐỊCH (EVO 1 - DẤU ẤN)
            if (this.enemyStationaryShadow) {
                ctx.save();
                ctx.globalAlpha = 0.6;
                ctx.fillStyle = "magenta";
                ctx.fillRect(this.enemyStationaryShadow.x, this.enemyStationaryShadow.y, this.w, this.h);

                // Viền nhấp nháy cho bóng điểm đánh dấu
                ctx.strokeStyle = (Math.floor(Date.now() / 100) % 2 === 0) ? "white" : "magenta";
                ctx.setLineDash([5, 5]);
                ctx.lineWidth = 2;
                ctx.strokeRect(this.enemyStationaryShadow.x - 2, this.enemyStationaryShadow.y - 2, this.w + 4, this.h + 4);

                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.font = "bold 10px Arial";
                ctx.fillText("MARK", this.enemyStationaryShadow.x + this.w / 2, this.enemyStationaryShadow.y - 5);
                ctx.restore();

                // Vẽ dây nối từ Địch tới Điểm Đánh Dấu
                drawTether(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, this.enemyStationaryShadow.x + this.w / 2, this.enemyStationaryShadow.y + this.h / 2, "rgba(255, 0, 255, 0.4)");
            }

            // 3. VẼ BÓNG 5 GIÂY CỦA ĐỊCH (FULL EVO)
            // Chỉ vẽ dây nối nếu Địch chưa bị dính Bóng Đứng Yên (ưu tiên Bóng Đứng Yên)
            if (this.hasUpgrade('evo_paradox_1') && this.hasUpgrade('evo_paradox_2') && this.enemyHistory && this.enemyHistory.length > 0) {
                let eShadow = this.enemyHistory[0];

                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = enemy.color; // Bóng màu của địch
                ctx.fillRect(eShadow.x, eShadow.y, this.w, this.h);

                ctx.strokeStyle = "purple";
                ctx.lineWidth = 2;
                ctx.strokeRect(eShadow.x, eShadow.y, this.w, this.h);
                ctx.restore();

                // Nối dây nếu địch chưa bị Mark
                if (!this.enemyStationaryShadow) {
                    drawTether(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, eShadow.x + this.w / 2, eShadow.y + this.h / 2, "rgba(128, 0, 128, 0.3)");
                }
            }
        }
        // sukuna
        // --- ĐỒ HỌA SUKUNA (THANH CHÚ LỰC & LÃNH ĐỊA) ---
        // --- ĐỒ HỌA SUKUNA (LÃNH ĐỊA & THANH CHÚ LỰC) ---
        if (this.weapon === 'sukuna') {
            let currentInp = this.id === 1 ? inputs.p1 : inputs.p2;

            // 1. VẼ HIỆU ỨNG LÃNH ĐỊA / HỒI MÁU (Vẽ TRƯỚC để chìm xuống dưới, không che UI)
            if (currentInp.s && this.sukunaChargeTimer > 0) {
                ctx.save();
                let chargeSec = this.sukunaChargeTimer / 60;

                if (this.domainActive) {
                    // --- BẾP BÀNH TRƯỚNG: HÌNH BÁN NGUYỆT ---
                    let radius = 350; // Tầm xa của lãnh địa (có thể chỉnh to/nhỏ tùy ý)
                    let centerX = this.x + this.w / 2;
                    let centerY = this.y + this.h / 2; // Lấy tâm xe làm gốc

                    ctx.beginPath();
                    if (this.id === 1) {
                        // Player 1 (Ở dưới): Bán nguyệt hướng LÊN TRÊN (từ 180 độ đến 0 độ)
                        ctx.arc(centerX, centerY, radius, Math.PI, 0);
                    } else {
                        // Player 2 (Ở trên): Bán nguyệt hướng XUỐNG DƯỚI (từ 0 độ đến 180 độ)
                        ctx.arc(centerX, centerY, radius, 0, Math.PI);
                    }

                    // Đổ màu Lãnh Địa (Đỏ sẫm mờ)
                    ctx.fillStyle = 'rgba(150, 0, 0, 0.15)';
                    ctx.fill();

                    // Vẽ viền ngoài cho sắc nét
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Vòng tròn chém cắt nhỏ ngay sát bản thể
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, 60 + Math.sin(Date.now() / 50) * 10, 0, Math.PI * 2);
                    ctx.stroke();
                }
                else if (chargeSec >= 1.5) {
                    // Hiệu ứng Phản chuyển Hồi máu
                    ctx.strokeStyle = '#00ff66';
                    ctx.lineWidth = 3;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.arc(this.x + this.w / 2, this.y + this.h / 2, this.w, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.restore();
            }

            // 2. VẼ THANH CHÚ LỰC (Vẽ SAU CÙNG để luôn nổi lên trên cùng, không bị mờ)
            let barW = this.w;
            let barH = 5;
            let barX = this.x;
            // Đặt vị trí thanh Chú lực ngay dưới gầm xe P1, hoặc trên đầu xe P2
            let barY = (this.id === 1) ? this.y + this.h + 12 : this.y - 18;

            ctx.save();
            // Nền xám
            ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
            ctx.fillRect(barX, barY, barW, barH);

            // Năng lượng Đỏ/Tím
            let currentCeW = barW * (this.cursedEnergy / 100);
            ctx.fillStyle = this.cursedEnergy >= 99.5 ? '#ff3300' : '#aa00ff';
            ctx.fillRect(barX, barY, currentCeW, barH);

            // Chớp nháy trắng khi đầy 100%
            if (this.cursedEnergy >= 99.5 && Math.floor(Date.now() / 200) % 2 === 0) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.strokeRect(barX, barY, barW, barH);
            }
            ctx.restore();
        }
        // cho sniper
        // --- VẼ UI SNIPER ---
        if (this.weapon === 'sniper') {
            // Vẽ tia nhắm Laser cho Sniper
            if (this.ammo > 0 && !this.sniperReloading) {
                ctx.save();
                ctx.strokeStyle = (this.id === 1) ? "rgba(52, 152, 219, 0.3)" : "rgba(231, 76, 60, 0.3)";
                ctx.lineWidth = 1; ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(this.x + this.w / 2, (this.id === 1) ? this.y : this.y + this.h);
                ctx.lineTo(this.x + this.w / 2, (this.id === 1) ? 0 : canvas.height);
                ctx.stroke();
                ctx.restore();
            }

            // Vẽ UI Reload tụ lực
            if (this.sniperChargeTimer > 0) {
                // [FIX UI] Cũng phải loại bỏ Tường Bất Tử ở đây để không bị hiện chữ đỏ sai
                let hasActiveWall = sniperWalls.some(w => w.owner === this && w.active && !w.isImmortal);

                // Nếu đang rặn đạn nhưng Tường đang Cooldown hoặc đã có Tường -> Báo chữ đỏ
                if (hasActiveWall || this.sniperWallCooldown > 0) {
                    ctx.fillStyle = "red"; ctx.font = "10px Arial";
                    ctx.fillText("WALL CD/ACTIVE", this.x - 20, this.y - 10);
                } else {
                    ctx.fillStyle = "yellow";
                    ctx.fillRect(this.x, this.y - 10, this.w * (this.sniperChargeTimer / 60), 5);
                }
            }
            if (this.sniperReloading) {
                ctx.fillStyle = "orange";
                ctx.fillText("RELOADING...", this.x, this.y - 15);
                let reloadMax = (this.hasUpgrade('evo_sniper_1') && this.hasUpgrade('evo_sniper_2')) ? 150 : 180;
                ctx.fillRect(this.x, this.y - 10, this.w * (1 - this.sniperReloadTimer / reloadMax), 5);
            }

            // Vẽ thanh hồi chiêu (Cooldown) của Tường Sniper ở bên dưới gầm xe
            if (this.sniperWallCooldown > 0) {
                ctx.fillStyle = "cyan"; // Màu thanh hồi chiêu tường
                ctx.fillRect(this.x, this.y + this.h + 5, this.w * (this.sniperWallCooldown / 600), 3);
            }
        }

        // Vẽ UI Reload tụ lực
        if (this.sniperChargeTimer > 0) {
            ctx.fillStyle = "yellow";
            ctx.fillRect(this.x, this.y - 10, this.w * (this.sniperChargeTimer / 60), 5);
        }
        if (this.sniperReloading) {
            ctx.fillStyle = "orange";
            ctx.fillText("RELOADING...", this.x, this.y - 15);
            let reloadMax = (this.hasUpgrade('evo_sniper_1') && this.hasUpgrade('evo_sniper_2')) ? 150 : 180;
            ctx.fillRect(this.x, this.y - 10, this.w * (1 - this.sniperReloadTimer / reloadMax), 5);
        }
        // Xử lý độ mờ cho Ghost
        if (this.weapon === 'ghost') {
            if (this.isGhostActive) {
                ctx.save();
                ctx.globalAlpha = 0.4; // Mờ nhân vật chính

                // A. Vẽ vòng hào quang xoay quanh
                ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
                ctx.rotate(Date.now() / 200); // Xoay vòng tròn

                ctx.beginPath();
                // Vẽ vòng đứt đoạn
                ctx.arc(0, 0, this.w, 0, Math.PI * 2);
                ctx.lineWidth = 3;
                ctx.strokeStyle = (this.id === 1) ? "#85c1e9" : "#f1948a"; // Màu nhạt theo player
                ctx.setLineDash([10, 10]);
                ctx.stroke();

                ctx.restore(); // Trả lại trạng thái canvas

                // B. Vẽ chữ thông báo trạng thái
                ctx.fillStyle = "white";
                ctx.font = "bold 10px Arial";
                ctx.textAlign = "center";
                ctx.fillText("VÔ ẢNH", this.x + this.w / 2, this.y - 10);

                // C. Thanh thời gian hiệu lực còn lại (nhỏ màu trắng trên đầu)
                ctx.fillStyle = "white";
                ctx.fillRect(this.x, this.y - 5, this.w * (this.ghostActiveTimer / this.ghostDuration), 2);

            } else {
                ctx.globalAlpha = 1.0;

                // [MỚI] Thanh hồi chiêu (Màu Xám) - Để biết bao giờ có lại
                // Vẽ thanh loading bên dưới nhân vật hoặc trên đầu
                if (this.ghostTimer > 0) {
                    ctx.fillStyle = "gray";
                    ctx.fillRect(this.x, this.y - 5, this.w * (this.ghostTimer / this.ghostCooldown), 2);
                }
            }
        }

        // Vẽ Phantom (Bóng ma) - Evo 2 Ghost
        if (this.weapon === 'ghost' && this.hasPhantom && this.posHistory.length > 20) {
            let oldPos = this.posHistory[0]; // Vị trí cách đây 20 frame
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = this.color;
            ctx.fillRect(oldPos.x, oldPos.y, this.w, this.h);
            ctx.restore();
        }

        if ((this.weapon === 'overload' || this.weapon === 'lazer_charge') && this.chargeLevel > 0) {
            let cColor = (this.weapon === 'lazer_charge') ? `rgb(0, ${this.chargeLevel * 35}, 255)` : `rgb(255, ${255 - this.chargeLevel * 30}, 0)`;
            ctx.fillStyle = cColor;
            ctx.fillRect(this.x, this.y + this.h / 2 - 5, this.w * (this.chargeLevel / 7), 10);
        }
        if (this.weapon === 'wind_slash') {
            ctx.fillStyle = (this.chargeLevel >= 6.9) ? "red" : "yellow";
            ctx.fillRect(this.x, this.y - 10, this.w * (this.chargeLevel / 7), 5);
        }
        // Với Storm: Hiệu ứng hào quang khi tự tụ lực
        if (this.weapon === 'storm' && (this.stormChargeRatio || 0) > 0) {
            let progress = Math.min(1, this.stormChargeRatio);
            ctx.save();
            ctx.strokeStyle = (progress >= 0.95) ? "#ff0055" : (progress >= 0.5 ? "#00ffcc" : "#2ecc71");
            ctx.lineWidth = progress >= 0.95 ? 3.5 : 2;
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, this.y + this.h / 2, Math.max(this.w / 2 + 8, 20 + progress * 16), 0, Math.PI * 2);
            ctx.stroke();
            if (progress >= 0.95) {
                ctx.fillStyle = "#ff0055"; ctx.font = "bold 9px 'Orbitron', Arial"; ctx.textAlign = "center";
                drawWorldText(ctx, "⚡ STORM READY", this.x + this.w / 2, this.y - 18);
            }
            ctx.restore();
        }

        // Hiệu ứng Lưới Điện & Ép Xung của Nhà Phát Minh
        if (this.weapon === 'inventor') {
            if (this.luoiDienSanSang) {
                ctx.save();
                ctx.strokeStyle = '#00ffcc';
                ctx.lineWidth = 2.5;
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#00ffcc';
                ctx.setLineDash([6, 6]);
                ctx.beginPath();
                ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 34, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
            if (this.isOverclocking) {
                ctx.save();
                ctx.strokeStyle = 'rgba(0, 255, 204, 0.7)';
                ctx.lineWidth = 3;
                ctx.strokeRect(this.x - 3, this.y - 3, this.w + 6, this.h + 6);
                ctx.restore();
            }
        }

        if (this.shield > 0) {
            ctx.strokeStyle = '#3498db'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(this.x + this.w / 2, this.y + this.h / 2, this.w / 1.2, 0, Math.PI * 2); ctx.stroke();
        }
        if (this.invincibleTimer > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        } else {
            ctx.globalAlpha = 1.0;
        }

        ctx.fillStyle = this.color;
        // ... (Code vẽ cũ)

        // Reset Alpha ở cuối hàm draw
        ctx.globalAlpha = 1.0;

        this.drawUI();

        this.bullets.forEach(b => {
            // --- VẼ TIA SÁNG NEON (NƯỚC / LỬA) ---
            if (b.isWater || b.isFurnace) {
                ctx.save();
                ctx.globalCompositeOperation = "lighter";

                let neonColor = b.isWater ? "#00ffff" : "#ff4500"; // Cyan cho nước, Cam đỏ cho lửa
                ctx.shadowBlur = 15;
                ctx.shadowColor = neonColor;
                ctx.strokeStyle = "white"; // Lõi sáng trắng

                // Xoay đạn theo hướng bay
                let angle = Math.atan2(b.vy, b.vx);
                ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
                ctx.rotate(angle);

                ctx.beginPath();
                ctx.lineCap = "round"; // Tạo 2 đầu bo tròn (viên thuốc)
                ctx.lineWidth = b.w;   // Độ dày

                // Vẽ thân đạn
                ctx.moveTo(-b.h / 2, 0);
                ctx.lineTo(b.h / 2, 0);
                ctx.stroke();

                // Vẽ thêm một lớp nhỏ ở giữa để lõi rực hơn
                ctx.lineWidth = b.w * 0.4;
                ctx.stroke();

                ctx.restore();
                return; // Bỏ qua đoạn vẽ đạn tròn/vuông bên dưới
            }
            // Xác định màu dựa trên chủ sở hữu hiện tại (quan trọng cho đạn phản)
            let bulletColor = (b.owner.id === 1) ? "#3498db" : "#e74c3c";

            if (b.isPiercing) bulletColor = "#9b59b6";       // Tím (Xuyên)
            else if (b.isIce) bulletColor = "#00ffff";       // Xanh băng
            else if (b.isExplosive) bulletColor = "#ff5050"; // Hồng (Nổ)
            else if (b.isRocket) bulletColor = (this.hasUpgrade('evo_rocket_1')) ? '#00ff00' : '#ff5500'; // Rocket
            else if (b.isAmChu) bulletColor = "#2c3e50";     // Âm
            else if (b.isDuongChu) bulletColor = "#f1c40f";  // Dương
            else if (b.type === 'purple') bulletColor = "purple"; // Cầu Hủy Diệt
            else if (b.type === 'shadow_empowered') bulletColor = "#9b59b6"; // Shadow Hunter
            else if (b.type === 'shortgun_pellet') bulletColor = "#ff6600";  // Shortgun
            else if (b.type === 'cannonball') bulletColor = "#222222";       // Cannonball

            // Render Motion Blur / Ghost Trail cho đạn bay nhanh
            if (b.trailHistory && b.trailHistory.length > 0) {
                for (let t = 0; t < b.trailHistory.length; t++) {
                    let tr = b.trailHistory[t];
                    let trAlpha = 0.35 * (1 - (t + 1) / (b.trailHistory.length + 1));
                    ctx.save();
                    ctx.globalAlpha = trAlpha;
                    ctx.fillStyle = bulletColor;
                    ctx.beginPath();
                    ctx.arc(tr.x + tr.w / 2, tr.y + tr.h / 2, tr.w / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }

            if (b.isGhost) {
                if (b.isFlicker) {
                    // CƠ CHẾ KHÓ NHÌN:

                    // 1. Rất mờ (Alpha thấp)
                    ctx.globalAlpha = 0.3;

                    // 2. Nhấp nháy ngẫu nhiên (50% cơ hội không vẽ frame này -> tạo cảm giác đứt quãng)
                    // Nếu có Evo 1 thì tỉ lệ ẩn cao hơn (khó nhìn hơn nữa)
                    let flickerRate = this.hasUpgrade('evo_ghost_1') ? 0.7 : 0.4;
                    if (Math.random() < flickerRate) {
                        ctx.globalAlpha = 1.0; // Reset alpha để không ảnh hưởng đạn sau
                        return; // Bỏ qua không vẽ frame này
                    }

                    // Đạn Ghost khi vô ảnh sẽ có màu trắng mờ hoặc xám nhạt cho khó thấy trên nền
                    bulletColor = "rgba(200, 200, 200, 0.5)";
                } else {
                    // Đạn Ghost thường (không vô ảnh)
                    ctx.globalAlpha = 0.8;
                }
            }

            ctx.fillStyle = bulletColor;

            // Vẽ Kiếm Khí (Wind Blade)
            // Vẽ Kiếm Khí (Wind Blade) HOẶC Nhát chém Sukuna
            if (b.isWindBlade || b.isSukunaSlash) {
                ctx.save();
                ctx.translate(b.x + b.w / 2, b.y + b.h / 2);

                let rotation = b.rotation || 0;

                // --- THÊM ĐOẠN NÀY ĐỂ NHÁT CHÉM SUKUNA NẰM NGANG THEO HƯỚNG BAY ---
                if (b.isSukunaSlash) {
                    rotation = Math.atan2(b.vy, b.vx);
                }
                // ------------------------------------------------------------------

                ctx.rotate(rotation);

                ctx.beginPath();
                // 1. Vẽ lưng cong (Nửa vòng tròn)
                ctx.arc(0, 0, b.w / 2, -Math.PI / 2, Math.PI / 2, false);

                // 2. Vẽ bụng lõm (Bezier Curve) - Tạo hình khuyết
                ctx.bezierCurveTo(b.w / 4, b.w / 2, b.w / 4, -b.w / 2, 0, -b.w / 2);

                ctx.fill();
                ctx.shadowBlur = 10; ctx.shadowColor = bulletColor;
                ctx.fill();
                ctx.restore();
                return;
            }


            // Vẽ Bóng Hư Ảnh (Storm Shadow)
            if (b.isStormShadow) {
                ctx.save();
                ctx.globalAlpha = 0.6;
                ctx.fillStyle = (b.owner.id === 1) ? "#3498db" : "#e74c3c";
                ctx.fillRect(b.x, b.y, b.w, b.h); // Vẽ hình vuông giống player
                ctx.globalAlpha = 1;
                ctx.restore();
                return;
            }

            // --- THÊM ĐOẠN NÀY ĐỂ VẼ KIẾM MÀU (Bao gồm Kiếm Hư Vô màu tím) ---
            if (b.type === 'hu_vo') {
                drawGlowingSword(b.x, b.y, b.w, b.h, '#8a2be2', b.vy < 0 ? -1 : 1); // Vẽ kiếm tím
                return;
            }

            if (b.isFloatingSwordGraphic) {
                // b.color được lưu từ class FloatingSword truyền sang
                drawGlowingSword(b.x, b.y, b.w, b.h, b.color || bulletColor, b.owner.id === 1 ? -1 : 1);
                return;
            }

            if (b.isThunderSpear) {
                ctx.save();
                let angle = Math.atan2(b.vy, b.vx);
                ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
                ctx.rotate(angle);
                ctx.fillStyle = "#ffff00";
                ctx.shadowColor = "#ffff00";
                ctx.shadowBlur = 12;
                ctx.fillRect(-b.h / 2, -b.w / 2, b.h, b.w);
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(-b.h / 4, -b.w / 4, b.h / 2, b.w / 2);
                ctx.restore();
                return;
            }

            if (b.isMagnetBullet) {
                ctx.save();
                let isPos = (b.polarity === 1);
                ctx.fillStyle = isPos ? "#ff3300" : "#00aaff";
                ctx.shadowColor = isPos ? "#ff3300" : "#00aaff";
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2 + 1, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 9px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(isPos ? "+" : "-", b.x + b.w / 2, b.y + b.h / 2);
                ctx.restore();
                return;
            }

            // -----------------------------------------------------------------
            if (this.weapon === 'lazer_auto') ctx.fillRect(b.x, b.y, b.w, b.h);
            else { ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, Math.PI * 2); ctx.fill(); }
            ctx.globalAlpha = 1.0;
        });
    }

    drawUI() {
        // Tàng hình: Ẩn hoàn toàn thanh HP, đạn và khiên để không lộ vị trí
        if ((this.weapon === 'ghost' && this.isGhostActive) || (this.weapon === 'magician' && this.invisTimer > 0) || (this.weapon === 'shadow_hunter' && this.stealthActive)) {
            return;
        }

        // P1 (ở dưới): Vẽ PHÍA DƯỚI gầm xe
        // P2 (ở trên): Vẽ PHÍA TRÊN nóc xe
        let uiY;
        let subUiY;
        let shieldY;

        if (this.id === 1) {
            uiY = Math.min(canvas.height - 18, this.y + this.h + 4);
            subUiY = uiY + 7;
            shieldY = uiY + 14;
        } else {
            uiY = Math.max(10, this.y - 15);
            subUiY = uiY + 7;
            shieldY = uiY - 5;
        }

        // Smooth Ghost HP Tracking
        if (this.ghostHp === undefined) this.ghostHp = this.hp;
        if (this.ghostHp > this.hp) {
            this.ghostHp -= 0.05;
            if (this.ghostHp < this.hp) this.ghostHp = this.hp;
        } else if (this.ghostHp < this.hp) {
            this.ghostHp = this.hp;
        }

        // 1. Health Bar Background & Ghost Bar
        ctx.save();
        ctx.fillStyle = "rgba(10, 15, 30, 0.85)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1;
        ctx.fillRect(this.x - 4, uiY, this.w + 8, 6);
        ctx.strokeRect(this.x - 4, uiY, this.w + 8, 6);

        // Ghost Damage Bar
        let ghostWidth = Math.max(0, (this.ghostHp / this.maxHp) * (this.w + 8));
        ctx.fillStyle = "rgba(255, 215, 0, 0.6)";
        ctx.fillRect(this.x - 4, uiY, ghostWidth, 6);

        // Active Health Bar (Neon Cyan cho P1, Neon Ruby/Pink cho P2)
        let hpWidth = Math.max(0, (this.hp / this.maxHp) * (this.w + 8));
        ctx.fillStyle = (this.id === 1) ? "#00f0ff" : "#ff0055";
        ctx.fillRect(this.x - 4, uiY, hpWidth, 6);

        // 2. Shield Indicator (Orbs)
        if (this.shield > 0) {
            ctx.fillStyle = "#00ffff";
            ctx.shadowBlur = 8;
            ctx.shadowColor = "#00ffff";
            let orbSpacing = Math.min(9, (this.w + 4) / Math.max(1, this.shield));
            for (let s = 0; s < this.shield; s++) {
                ctx.beginPath();
                ctx.arc(this.x + 2 + s * orbSpacing, shieldY, 3.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
        }

        // 3. Thanh Đạn / Tài Nguyên
        if (this.weapon === 'water_gun' || this.weapon === 'furnace' || this.weapon === 'six_barrel' || this.weapon === 'the_strongest' || this.weapon === 'sukuna' || this.weapon === 'van_kiem' || this.weapon === 'tank' || this.weapon === 'storm') {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(this.x - 4, subUiY, this.w + 8, 4);

            let barColor = "#3498db";
            let ratio = 0;

            if (this.weapon === 'water_gun') { barColor = "#00bfff"; ratio = this.energy / this.maxEnergy; }
            else if (this.weapon === 'furnace') { barColor = "#ff6600"; ratio = this.energy / this.maxEnergy; }
            else if (this.weapon === 'six_barrel') {
                barColor = (this.isOverheated) ? "#ff0000" : (this.heat >= 75 ? "#ff3300" : (this.heat >= 50 ? "#ff9900" : "#ffd700"));
                ratio = this.heat / 100;
            }
            else if (this.weapon === 'the_strongest') {
                barColor = "#00ffff";
                ratio = this.chuLuc / this.maxChuLuc;
            }
            else if (this.weapon === 'sukuna') {
                barColor = "#e74c3c";
                ratio = (this.cursedEnergy || 0) / 100;
            }
            else if (this.weapon === 'van_kiem') {
                barColor = "#9b59b6";
                ratio = Math.min(1, (this.stanceSwordsAccumulated || 0) / 8);
            }
            else if (this.weapon === 'tank') {
                barColor = "#e67e22";
                ratio = 1;
            }
            else if (this.weapon === 'storm') {
                barColor = "#2ecc71";
                ratio = this.stormChargeRatio || 0;
            }

            ctx.fillStyle = barColor;
            ctx.shadowBlur = 6;
            ctx.shadowColor = barColor;
            ctx.fillRect(this.x - 4, subUiY, (this.w + 8) * Math.min(1, Math.max(0, ratio)), 4);
            ctx.shadowBlur = 0;
        }
        else if (this.maxAmmo > 0 && this.maxAmmo < 100) {
            // Ammo Pips
            if (this.sniperReloading) {
                ctx.fillStyle = "#ffd700";
                ctx.font = "bold 9px 'Orbitron', Arial";
                ctx.textAlign = "center";
                drawWorldText(ctx, "RELOADING...", this.x + this.w / 2, subUiY + 5);
            } else {
                for (let i = 0; i < this.maxAmmo; i++) {
                    ctx.fillStyle = (i < this.ammo) ? "#ffd700" : "rgba(255, 255, 255, 0.15)";
                    let dotsize = ((this.w + 8) / this.maxAmmo) - 1.5;
                    if (dotsize < 2) dotsize = 2;
                    ctx.fillRect(this.x - 4 + i * (dotsize + 1.5), subUiY, dotsize, 4);
                }
            }
        }

        // Inventor Linh Kiện (LK) Display
        if (this.weapon === 'inventor') {
            ctx.fillStyle = "#00ffcc";
            ctx.font = "bold 9px 'Orbitron', Arial";
            ctx.textAlign = "center";
            let lkY = (this.id === 1) ? this.y - 6 : this.y + this.h + 16;
            drawWorldText(ctx, "⚙ LK: " + (this.components || 0), this.x + this.w / 2, lkY);
        }

        // Chiêu Hồn Sư (Necromancer) HUD
        if (this.weapon === 'necromancer') {
            let necroY = (this.id === 1) ? this.y - 8 : this.y + this.h + 16;
            let lockedText = (this.lockedSouls > 0) ? ` (🔒${this.lockedSouls})` : '';
            ctx.fillStyle = "#00e676";
            ctx.font = "bold 9px 'Orbitron', Arial";
            ctx.textAlign = "center";
            drawWorldText(ctx, `👻 ${this.currentSouls || 0}/${this.maxSouls || 6}${lockedText}`, this.x + this.w / 2, necroY);

            // Soul Shield bar
            let soulBarY = (this.id === 1) ? uiY - 6 : subUiY + 8;
            ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctx.fillRect(this.x - 4, soulBarY, this.w + 8, 4);
            let soulRatio = Math.max(0, Math.min(1, (this.currentSouls || 0) / (this.maxSouls || 6)));
            ctx.fillStyle = "#00e676";
            ctx.fillRect(this.x - 4, soulBarY, (this.w + 8) * soulRatio, 4);

            // Summon Charge Progress
            if (this.necroChargeFrames > 0) {
                let tierText = "👻 BẮN PHÉP";
                let tierColor = "#00e676";
                if (this.necroChargeFrames >= 90) {
                    tierText = "💀 CAO CẤP (6👻)";
                    tierColor = "#ab47bc";
                } else if (this.necroChargeFrames >= 60) {
                    tierText = "🏹 XẠ THỦ (4👻)";
                    tierColor = "#29b6f6";
                } else if (this.necroChargeFrames >= 30) {
                    tierText = "💣 CẢM TỬ (2👻)";
                    tierColor = "#ff7043";
                }
                let chargeY = (this.id === 1) ? soulBarY - 8 : soulBarY + 12;
                ctx.fillStyle = tierColor;
                ctx.font = "bold 9px 'Orbitron', Arial";
                ctx.textAlign = "center";
                drawWorldText(ctx, tierText, this.x + this.w / 2, chargeY);
            }
        }

        // Thiên Tài (Genius) HUD
        if (this.weapon === 'genius') {
            if (!this.isPilotingMecha) {
                let genY = (this.id === 1) ? this.y - 8 : this.y + this.h + 16;
                ctx.fillStyle = "#ffb74d";
                ctx.font = "bold 9px 'Orbitron', Arial";
                ctx.textAlign = "center";
                drawWorldText(ctx, `⚙️ BR: ${this.gears || 0} | 🔩 LK: ${this.components || 0}`, this.x + this.w / 2, genY);

                if (this.mechaSummonHold > 0) {
                    let summonProgress = Math.min(1, this.mechaSummonHold / 40);
                    let summonY = (this.id === 1) ? uiY - 6 : subUiY + 8;
                    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
                    ctx.fillRect(this.x - 4, summonY, this.w + 8, 4);
                    ctx.fillStyle = "#ff9800";
                    ctx.fillRect(this.x - 4, summonY, (this.w + 8) * summonProgress, 4);
                    drawWorldText(ctx, "TRIỆU HỒI MECHA...", this.x + this.w / 2, (this.id === 1) ? summonY - 8 : summonY + 12);
                }
            } else {
                let mechaY = (this.id === 1) ? this.y - 10 : this.y + this.h + 18;
                let modeNames = ["", "1:BẮN", "2:PHÁO", "3:SMG", "4:ĐẤM", "5:KHIÊN"];
                let curModeName = modeNames[this.mechaMode] || `M${this.mechaMode}`;

                // Mecha HP & Energy Bar
                let mHpRatio = Math.max(0, Math.min(1, (this.mechaHp || 0) / (this.mechaMaxHp || 1)));
                let mEnRatio = Math.max(0, Math.min(1, (this.mechaEnergy || 0) / (this.mechaMaxEnergy || 1)));
                let mBarY1 = (this.id === 1) ? uiY - 6 : subUiY + 6;
                let mBarY2 = (this.id === 1) ? uiY - 12 : subUiY + 12;

                // Mecha HP bar
                ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
                ctx.fillRect(this.x - 4, mBarY1, this.w + 8, 4);
                ctx.fillStyle = "#ff9800";
                ctx.fillRect(this.x - 4, mBarY1, (this.w + 8) * mHpRatio, 4);

                // Mecha Energy bar
                ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
                ctx.fillRect(this.x - 4, mBarY2, this.w + 8, 4);
                ctx.fillStyle = "#00e5ff";
                ctx.fillRect(this.x - 4, mBarY2, (this.w + 8) * mEnRatio, 4);

                // Mecha Mode badge & Armor text
                let armorInfo = (this.mechaVirtualArmor > 0) ? ` (+${this.mechaVirtualArmor} Giáp)` : '';
                ctx.fillStyle = "#ffd54f";
                ctx.font = "bold 8.5px 'Orbitron', Arial";
                ctx.textAlign = "center";
                drawWorldText(ctx, `🤖 [${curModeName}] NL:${Math.floor(this.mechaEnergy || 0)}${armorInfo}`, this.x + this.w / 2, mechaY);

                // Self-destruct hold indicator
                if (this.mechaSelfDestructHold > 0) {
                    let sdProgress = Math.min(1, this.mechaSelfDestructHold / 180);
                    ctx.fillStyle = "#f44336";
                    ctx.fillRect(this.x - 4, (this.id === 1) ? uiY - 18 : subUiY + 18, (this.w + 8) * sdProgress, 4);
                    drawWorldText(ctx, `💥 TỰ BẠO: ${(this.mechaSelfDestructHold/60).toFixed(1)}s`, this.x + this.w / 2, (this.id === 1) ? uiY - 24 : subUiY + 26);
                }
            }
        }

        // Cung Charge Bar & State
        if (this.weapon === 'cung' && this.bowChargeTimer > 0) {
            let chargeSec = this.bowChargeTimer / 60;
            let barColor = "white";
            let stateText = "1 SHOT";
            if (chargeSec >= 2 && this.hasUpgrade('evo_cung_2') && this.rainCD <= 0) {
                barColor = "red"; stateText = "RAIN ARROWS";
            } else if (chargeSec >= 1.0) {
                barColor = "cyan"; stateText = "3 SPREAD";
            } else if (chargeSec >= 0.5) {
                barColor = "lime"; stateText = "3 BURST";
            }

            ctx.fillStyle = barColor;
            let chargeProgress = Math.min(this.bowChargeTimer / 120, 1);
            let cungBarY = (this.id === 1) ? uiY - 14 : subUiY + 12;
            ctx.fillRect(this.x - 4, cungBarY, (this.w + 8) * chargeProgress, 4);
            ctx.font = "bold 10px 'Orbitron', Arial";
            ctx.textAlign = "center";
            drawWorldText(ctx, stateText, this.x + this.w / 2, cungBarY - 4);
        }

        // Bow Nhạy Bén (Dodge) Status Indicator
        if (this.weapon === 'cung') {
            let dodgeY = (this.id === 1) ? uiY - 10 : subUiY + 14;
            ctx.save();
            if (this.bowDodgeReady) {
                ctx.fillStyle = "#00ffcc";
                ctx.font = "bold 8px 'Orbitron', Arial";
                ctx.textAlign = "center";
                drawWorldText(ctx, "💨 NÉ ĐÒN", this.x + this.w / 2, dodgeY);
            } else if (this.bowDodgeCooldown > 0) {
                let secLeft = (this.bowDodgeCooldown / 60).toFixed(1);
                ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                ctx.font = "bold 8px 'Orbitron', Arial";
                ctx.textAlign = "center";
                drawWorldText(ctx, `💨 NÉ ${secLeft}s`, this.x + this.w / 2, dodgeY);
            }
            ctx.restore();
        }

        // Status Badges (Burn, Silence)
        if (this.burnStacks > 0) {
            for (let k = 0; k < this.burnStacks; k++) {
                ctx.fillStyle = "#ff6600";
                ctx.fillRect(this.x + k * 7, (this.id === 1) ? uiY - 12 : subUiY + 12, 5, 5);
            }
        }

        if (this.silenceTimer > 0 && this.freezeTimer <= 0) {
            ctx.fillStyle = "#fff";
            ctx.font = "bold 10px 'Orbitron', Arial";
            ctx.textAlign = "center";
            drawWorldText(ctx, "SILENCE", this.x + this.w / 2, (this.id === 1) ? uiY - 14 : subUiY + 22);
        }

        // Thunder HUD
        if (this.weapon === 'thunder') {
            let spearY = (this.id === 1) ? uiY - 14 : subUiY + 12;
            let startX = this.x + this.w / 2 - 18;
            for (let sIdx = 0; sIdx < 3; sIdx++) {
                ctx.fillStyle = (sIdx < (this.thunderSpears || 0)) ? "#ffff00" : "rgba(255, 255, 0, 0.2)";
                ctx.fillRect(startX + sIdx * 12, spearY, 8, 4);
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 0.8;
                ctx.strokeRect(startX + sIdx * 12, spearY, 8, 4);
            }
            if (this.thunderLoiMinhTimer > 0) {
                ctx.fillStyle = "#ffd700";
                ctx.font = "bold 9px 'Orbitron', Arial";
                ctx.textAlign = "center";
                drawWorldText(ctx, `⚡ THIÊN KIẾP (${Math.ceil(this.thunderLoiMinhTimer / 60)}s)`, this.x + this.w / 2, spearY - 5);
            } else if (this.thunderLoiMinhStacks > 0) {
                ctx.fillStyle = "#ffffaa";
                ctx.font = "bold 8px 'Orbitron', Arial";
                ctx.textAlign = "center";
                drawWorldText(ctx, `LÔI MINH: ${this.thunderLoiMinhStacks}/3`, this.x + this.w / 2, spearY - 5);
            }
            if (this.thunderShieldHits > 0) {
                ctx.strokeStyle = "#ffff00";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(this.x - 3, this.y - 3, this.w + 6, this.h + 6);
            }
        }

        // Magnet HUD
        if (this.weapon === 'magnet') {
            let badgeY = (this.id === 1) ? uiY - 14 : subUiY + 14;
            let isPos = (this.magnetPolarity === 1);
            ctx.fillStyle = isPos ? "#ff3300" : "#00aaff";
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, badgeY, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 10px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(isPos ? "+" : "-", this.x + this.w / 2, badgeY);
            ctx.textBaseline = "alphabetic";
        }

        // Infected Polarity Badge
        if (this.infectedPolarityTimer > 0) {
            let infY = (this.id === 1) ? this.y - 20 : this.y + this.h + 20;
            let isPos = (this.infectedPolarity === 1);
            ctx.fillStyle = isPos ? "rgba(255, 60, 0, 0.85)" : "rgba(0, 180, 255, 0.85)";
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, infY, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(isPos ? "+" : "-", this.x + this.w / 2, infY);
            ctx.textBaseline = "alphabetic";
        }

        // Evolution HUD
        if (this.weapon === 'evolution') {
            let b = this.evolutionPermanentBonus || { hp: 0, dmg: 0, speed: 0 };
            let evoY = (this.id === 1) ? this.y - 6 : this.y + this.h + 16;
            ctx.fillStyle = "#2ecc71";
            ctx.font = "bold 9px 'Orbitron', Arial";
            ctx.textAlign = "center";
            drawWorldText(ctx, `🧬 +${b.hp.toFixed(1)}HP +${b.dmg.toFixed(2)}D`, this.x + this.w / 2, evoY);
        }

        ctx.restore();
    }
}

// --- GLOBAL VARS ---
let p1, p2;
let crates = [];
let moneyTrucks = [];
let explosions = [];
let beams = [];
let radiationZones = [];
let iceZones = [];
let movingObstacle = null;
let animationId;
let lastCrateSpawn = 0;
let talismans = [];
let spellZones = [];
let shadowTraps = [];
let shortgunFireZones = [];

// --- CỐ ĐỊNH LOGIC LOOP Ở 60 TICK/GIÂY (FIXED TIMESTEP ACCUMULATOR) ---
const TICK_RATE = 60;
const TICK_TIME = 1000 / TICK_RATE; // ~16.66667 ms
let fixedPhysicsAccumulator = 0;
let lastFixedLoopTime = 0;

function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1;
}

function init() {
    const container = document.getElementById('gameContainer');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    p1 = new Player(1, "#3498db");
    p2 = new Player(2, "#e74c3c");
    setupControls();
    document.getElementById('restartBtn').addEventListener('click', () => location.reload());
    updateScoreBoard();
    showUpgradeScreen();
}

function showUpgradeScreen() {
    gameState.phase = 'upgrade';
    const upgScreen = document.getElementById('upgradeScreen');
    if (upgScreen) upgScreen.style.display = 'flex';

    gameState.p1Ready = false;
    gameState.p2Ready = false;

    const p1Status = document.getElementById('p1-ready-status');
    const p2Status = document.getElementById('p2-ready-status');
    if (p1Status) {
        p1Status.classList.remove('is-ready');
        p1Status.innerHTML = (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') 
            ? '🔵 ĐỐI THỦ: ĐANG CHỌN...' : '🔵 BẠN: CHƯA SẴN SÀNG';
    }
    if (p2Status) {
        p2Status.classList.remove('is-ready');
        p2Status.innerHTML = (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'host') 
            ? '🔴 ĐỐI THỦ: ĐANG CHỌN...' : '🔴 BẠN: CHƯA SẴN SÀNG';
    }

    // In Online Mode: Only render cards for yourself, cleanly centered
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
        if (gameState.round === 1) {
            const roleColor = (onlineManager.role === 'guest') ? 'ĐỎ' : 'XANH';
            document.getElementById('roundTitleText').innerText = `ROUND 1 - CHỌN BODY (BẠN: ${roleColor})`;
            if (onlineManager.role === 'guest') {
                renderStandardCards('p2', MODULES.BODY);
            } else {
                renderStandardCards('p1', MODULES.BODY);
            }
            return;
        }

        updateShopTitle();
        if (onlineManager.role === 'guest') {
            renderShop('p2');
        } else {
            renderShop('p1');
        }
        return;
    }

    if (gameState.round === 1) {
        document.getElementById('roundTitleText').innerText = "ROUND 1 - CHỌN VŨ KHÍ";
        renderStandardCards('p1', MODULES.BODY);
        renderStandardCards('p2', MODULES.BODY);

        // Tự động chọn vũ khí cho Bot trong phòng luyện tập
        if (typeof botAI !== 'undefined' && botAI.enabled) {
            setTimeout(() => {
                if (gameState.phase === 'upgrade' && !gameState.p2Ready) {
                    const p2Cards = document.querySelectorAll('#p2-upgrades .card');
                    if (p2Cards.length > 0) {
                        p2Cards[0].click();
                    } else {
                        handlePlayerReady('p2');
                    }
                }
            }, 300);
        }
        return;
    }

    updateShopTitle();
    renderShop('p1');
    renderShop('p2');

    // Tự động sẵn sàng cho Bot trong Shop ở các round tiếp theo
    if (typeof botAI !== 'undefined' && botAI.enabled) {
        setTimeout(() => {
            if (gameState.phase === 'upgrade' && !gameState.p2Ready) {
                handlePlayerReady('p2');
            }
        }, 300);
    }
}

function renderStandardCards(playerId, list) {
    const container = document.getElementById(`${playerId}-upgrades`);
    container.innerHTML = "";
    let shuffled = [...list].sort(() => 0.5 - Math.random()).slice(0, 3);
    const player = (playerId === 'p1') ? p1 : p2;

    shuffled.forEach(mod => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `<h4>${mod.name}</h4><p>${mod.desc}</p>`;
        div.onclick = () => {
            player.addUpgrade(mod.id); soundSystem.playPowerup();
            container.innerHTML = '';
            div.style.background = '#27ae60';
            div.style.cursor = 'default'; div.onclick = null;
            container.appendChild(div);
            handlePlayerReady(playerId);
            if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.conn && onlineManager.conn.open) {
                onlineManager.conn.send({ type: 'UPGRADE_PICK', pid: playerId, modId: mod.id });
            }
        };
        container.appendChild(div);
    });
}

function renderShop(playerId, keepItems = false) {
    const container = document.getElementById(`${playerId}-upgrades`);
    if (!container) return;
    container.innerHTML = '';
    const player = (playerId === 'p1') ? p1 : p2;
    const coins = (playerId === 'p1') ? gameState.p1Coins : gameState.p2Coins;

    if (player.rerollCount === undefined) player.rerollCount = 0;

    const rerollBtn = document.createElement('div');
    rerollBtn.className = 'card';
    rerollBtn.style.background = '#c0392b';
    rerollBtn.innerHTML = `<h4>REROLL</h4><p>Đổi hàng</p><p style="color:yellow">$5</p>`;
    rerollBtn.onclick = () => {
        if ((playerId === 'p1' ? gameState.p1Coins : gameState.p2Coins) >= 5) {
            if (playerId === 'p1') gameState.p1Coins -= 5; else gameState.p2Coins -= 5;
            player.rerollCount++;
            soundSystem.playCoin();
            updateShopTitle();
            renderShop(playerId, false);
        }
    };
    container.appendChild(rerollBtn);

    // [FIX] Chỉ hiện Gói Nâng Cấp khi cầm XE TIỀN
    if (player.weapon === 'money_tank') {
        if (player.upgradeLevel < 6) {
            let cost = 15 * Math.pow(2, player.upgradeLevel);
            let nextLvl = player.upgradeLevel + 1;
            let bonusText = "";
            if (nextLvl === 3) bonusText = "<br>(Mở khóa: KHIÊN)";
            if (nextLvl === 4) bonusText = "<br>(Mở khóa: ĐẠN XUYÊN)";
            if (nextLvl === 5) bonusText = "<br>(Mở khóa: ĐẠN NỔ)";

            let upgradeBtn = document.createElement('div');
            upgradeBtn.className = 'card';
            upgradeBtn.style.border = '2px solid gold';
            upgradeBtn.innerHTML = `<h4>CẤP ĐỘ ${nextLvl}</h4><p>Tăng HP, Dame, Đạn, Tốc.${bonusText}</p><p style="color:#f1c40f;">$${cost}</p>`;
            upgradeBtn.onclick = () => {
                let curMoney = (playerId === 'p1') ? gameState.p1Coins : gameState.p2Coins;
                if (curMoney >= cost) {
                    if (playerId === 'p1') gameState.p1Coins -= cost; else gameState.p2Coins -= cost;
                    player.upgradeLevel++;
                    soundSystem.playPowerup();
                    updateShopTitle();
                    renderShop(playerId, true);
                    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.conn && onlineManager.conn.open) {
                        onlineManager.conn.send({ type: 'MONEY_TANK_UPGRADE', pid: playerId, level: player.upgradeLevel });
                    }
                }
            };
            container.appendChild(upgradeBtn);
        } else {
            let winBtn = document.createElement('div');
            winBtn.className = 'card';
            winBtn.style.background = '#f39c12';
            winBtn.style.border = '3px solid white';
            winBtn.innerHTML = `<h4>PAY TO WIN</h4><p>THẮNG LUÔN.</p><p style="color:white; font-size:1.2em">$500</p>`;
            winBtn.onclick = () => {
                let curMoney = (playerId === 'p1') ? gameState.p1Coins : gameState.p2Coins;
                if (curMoney >= 500) {
                    endRound(playerId === 'p1' ? 1 : 2);
                    document.getElementById('upgradeScreen').style.display = 'none';
                }
            };
            container.appendChild(winBtn);
        }
    }

    // Smart Shop: Caching & Cơ chế Bảo Hiểm (Pity System)
    if (!keepItems || !player.currentShopItems) {
        let poolFeet = [...MODULES.FEET];
        let availableEvos = [];
        const weaponEvos = EVOLUTIONS[player.weapon];
        if (weaponEvos) {
            availableEvos = weaponEvos.filter(e => !player.upgrades.includes(e.id));
        }

        let shopItems = [];
        if (player.rerollCount >= 3 && availableEvos.length > 0) {
            let guaranteedEvo = availableEvos[Math.floor(Math.random() * availableEvos.length)];
            shopItems.push(guaranteedEvo);
            let remainingPool = poolFeet.concat(availableEvos.filter(e => e.id !== guaranteedEvo.id));
            remainingPool.sort(() => 0.5 - Math.random());
            shopItems.push(remainingPool[0]);
            player.rerollCount = 0;
        } else {
            let generalPool = poolFeet.concat(availableEvos).sort(() => 0.5 - Math.random());
            shopItems = generalPool.slice(0, 2);
            if (shopItems.some(it => it.type === 'evo')) player.rerollCount = 0;
        }

        player.currentShopItems = shopItems;
        if (!player.boughtShopItems) player.boughtShopItems = [];
    }

    player.currentShopItems.forEach(item => {
        const price = item.cost || 10;
        const card = document.createElement('div');

        if (player.boughtShopItems && player.boughtShopItems.includes(item.id)) {
            card.className = 'card sold';
            card.innerHTML = `<h4>${item.name}</h4><p>ĐÃ MUA</p>`;
        } else {
            if (item.type === 'evo') card.className = 'card evo-card';
            else card.className = 'card';

            card.innerHTML = `<h4>${item.name}</h4><p>${item.desc}</p><p style="color:#f1c40f; font-weight:bold">$${price}</p>`;

            card.onclick = () => {
                const currentCoin = (playerId === 'p1') ? gameState.p1Coins : gameState.p2Coins;
                if (currentCoin >= price) {
                    if (playerId === 'p1') gameState.p1Coins -= price; else gameState.p2Coins -= price;
                    updateShopTitle();
                    player.addUpgrade(item.id);
                    soundSystem.playPowerup();
                    if (!player.boughtShopItems) player.boughtShopItems = [];
                    player.boughtShopItems.push(item.id);
                    renderShop(playerId, true);
                    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.conn && onlineManager.conn.open) {
                        onlineManager.conn.send({ type: 'UPGRADE_PICK', pid: playerId, modId: item.id });
                    }
                }
            };
        }
        container.appendChild(card);
    });

    // Nút độc quyền cho Nhà Phát Minh: MỞ CHỢ LINH KIỆN
    if (player.weapon === 'inventor') {
        const invBtn = document.createElement('div');
        invBtn.className = 'card';
        invBtn.style.border = '2px solid #00ffcc';
        invBtn.style.background = '#1a1a2e';
        invBtn.innerHTML = `<h4>⚙ CHỢ LINH KIỆN</h4><p>Nâng cấp Công Nghệ</p><p style="color:#00ffcc; font-weight:bold">LK: ${player.components || 0}</p>`;
        invBtn.onclick = () => {
            renderInventorShop(playerId, false);
        };
        container.appendChild(invBtn);
    }

    // Nút độc quyền cho Thiên Tài: MỞ CHỢ ĐEN ROBOT
    if (player.weapon === 'genius') {
        const genBtn = document.createElement('div');
        genBtn.className = 'card';
        genBtn.style.border = '2px solid #ab47bc';
        genBtn.style.background = '#2c1033';
        genBtn.innerHTML = `<h4>🤖 CHỢ ĐEN ROBOT</h4><p>Nâng cấp Mecha</p><p style="color:#e040fb; font-weight:bold">BR: ${player.gears || 0} | LK: ${player.components || 0}</p>`;
        genBtn.onclick = () => {
            renderGeniusBlackMarket(playerId, false);
        };
        container.appendChild(genBtn);
    }

    const readyBtn = document.createElement('div');
    readyBtn.id = `ready-btn-${playerId}`;
    readyBtn.className = 'card';
    readyBtn.style.border = '2px solid white';
    readyBtn.innerHTML = `<h4>SẴN SÀNG</h4>`;
    readyBtn.onclick = () => {
        handlePlayerReady(playerId);
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.conn && onlineManager.conn.open) {
            onlineManager.conn.send({ type: 'READY', pid: playerId });
        }
    };
    container.appendChild(readyBtn);
}

function renderInventorShop(playerId, keepItems = false) {
    const container = document.getElementById(`${playerId}-upgrades`);
    if (!container) return;
    container.innerHTML = '';
    const player = (playerId === 'p1') ? p1 : p2;

    const roundTitle = document.getElementById('roundTitleText');
    if (roundTitle) roundTitle.innerText = `CHỢ LINH KIỆN (Sở hữu: ${player.components || 0} LK)`;

    if (!player.invUpgrades) player.invUpgrades = {};

    // Đếm số lượng nâng cấp thông thường đã đạt cấp tối đa (tổng 18 nâng cấp)
    const regularItems = INVENTOR_SHOP.filter(item => item.type !== 'fullevo');
    let maxedCount = 0;
    regularItems.forEach(item => {
        let lvl = player.invUpgrades[item.id] || 0;
        if (lvl === true) lvl = 1;
        if (lvl >= item.maxLvl) maxedCount++;
    });

    // 1. Nút QUAY LẠI Cửa Hàng Thường
    const backBtn = document.createElement('div');
    backBtn.className = 'card';
    backBtn.style.background = '#2c3e50';
    backBtn.style.border = '2px solid #e74c3c';
    backBtn.innerHTML = `
        <h4 style="color:#ff6b6b; font-size:12px;">QUAY LẠI</h4>
        <p style="font-size:9px; color:#cbd5e1;">Về Cửa Hàng Thường</p>
        <p style="color:#e74c3c; font-size:16px; margin-top:2px;">🔙</p>
    `;
    backBtn.onclick = () => {
        updateShopTitle();
        renderShop(playerId, true);
    };
    container.appendChild(backBtn);

    // 2. Nút REROLL CHỢ LINH KIỆN (1 Linh Kiện)
    const rerollBtn = document.createElement('div');
    rerollBtn.className = 'card';
    rerollBtn.style.background = '#1a2744';
    rerollBtn.style.border = '2px solid #3b82f6';
    let canReroll = (player.components || 0) >= 1;
    rerollBtn.innerHTML = `
        <h4 style="color:#60a5fa; font-size:12px;">🔄 ĐỔI HÀNG</h4>
        <p style="font-size:9px; color:#93c5fd;">Đổi 3 nâng cấp mới</p>
        <p style="color:${canReroll ? '#00e5ff' : '#ef4444'}; font-size:11px; font-weight:bold; margin-top:2px;">-1 LINH KIỆN</p>
    `;
    rerollBtn.onclick = () => {
        if ((player.components || 0) >= 1) {
            player.components -= 1;
            if (soundSystem && !soundSystem.muted) soundSystem.playCoin();
            renderInventorShop(playerId, false);
        }
    };
    container.appendChild(rerollBtn);

    // 3. Random 3 nâng cấp từ INVENTOR_SHOP (không filter danh mục)
    if (!keepItems || !player._invShopItems) {
        // Lọc ra các item còn có thể mua (chưa max, hoặc Full Evo khi đã đủ 18)
        let availablePool = INVENTOR_SHOP.filter(item => {
            let lvl = player.invUpgrades[item.id] || 0;
            if (lvl === true) lvl = 1;
            if (item.type === 'fullevo') {
                let isFullOwned = player.isFullEvoInventor || (player.invUpgrades && player.invUpgrades['inv_full_evo']);
                return !isFullOwned && maxedCount >= 18;
            }
            if (item.type === 'evo2' && !player.hasUpgrade('evo_inv_2')) return false;
            return lvl < item.maxLvl;
        });
        availablePool.sort(() => 0.5 - Math.random());
        player._invShopItems = availablePool.slice(0, 3);
    }

    player._invShopItems.forEach(item => {
        let currentLvl = player.invUpgrades[item.id] || 0;
        if (currentLvl === true) currentLvl = 1;
        let price = Math.floor(item.cost * Math.pow(2, currentLvl));

        const card = document.createElement('div');
        card.className = 'card';

        let catTag = '[BẢN THÂN]';
        let catColor = '#00f0ff';
        if (item.type === 'drone') { catTag = '[DRONE]'; catColor = '#2ecc71'; }
        else if (item.type === 'evo2') { catTag = '[EVO 2]'; catColor = '#a855f7'; }
        else if (item.type === 'fullevo') { catTag = '[TỐI THƯỢNG]'; catColor = '#f1c40f'; }

        if (item.type === 'fullevo') {
            card.style.border = '2px solid gold';
            card.style.boxShadow = '0 0 14px gold';
            card.style.background = 'linear-gradient(135deg, #1e1b4b, #312e81)';
            let canAfford = (player.components || 0) >= 15;
            card.innerHTML = `
                <span style="font-size:9px; color:gold; font-weight:bold;">${catTag}</span>
                <h4 style="color:gold; font-size:11px;">FULL EVO ⭐</h4>
                <p style="font-size:9px; color:#fef3c7;">4 Drone, 200% stats, giảm 60% CD!</p>
                <p style="color:${canAfford ? 'gold' : '#ef4444'}; font-weight:bold; font-size:12px;">15 LK</p>
            `;
            card.onclick = () => {
                if ((player.components || 0) >= 15) {
                    player.components -= 15;
                    player.isFullEvoInventor = true;
                    player.invUpgrades['inv_full_evo'] = 1;
                    if (!player.upgrades.includes('inv_full_evo')) player.upgrades.push('inv_full_evo');
                    if (!player.upgrades.includes('evo_inv_1')) player.addUpgrade('evo_inv_1');
                    if (!player.upgrades.includes('evo_inv_2')) player.addUpgrade('evo_inv_2');
                    player.drones = [
                        new InventorDrone(player, -75),
                        new InventorDrone(player, -25),
                        new InventorDrone(player, 25),
                        new InventorDrone(player, 75)
                    ];
                    soundSystem.playPowerup();
                    if (typeof addFloatingText === 'function') addFloatingText(player.x + player.w / 2, player.y - 20, "FULL EVO UNLOCKED! 🔥", "gold", 16);
                    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) onlineManager.sendNetworkMessage({ type: 'INVENTOR_UPGRADE', pid: playerId, itemId: 'inv_full_evo' });
                    renderInventorShop(playerId, false);
                }
            };
        } else {
            let lvlText = item.maxLvl > 1 ? ` (Lv ${currentLvl + 1}/${item.maxLvl})` : '';
            let canAfford = (player.components || 0) >= price;
            card.style.background = '#1a252c';
            card.style.border = `2px solid ${catColor}`;

            card.innerHTML = `
                <span style="font-size:9px; color:${catColor};">${catTag}</span>
                <h4 style="color:${catColor}; font-size:11px;">${item.name}${lvlText}</h4>
                <p style="font-size:9px; color:#cbd5e1;">${item.desc}</p>
                <p style="color:${canAfford ? '#fbbf24' : '#ef4444'}; font-weight:bold; font-size:12px;">${price} LK</p>
            `;

            card.onclick = () => {
                if ((player.components || 0) >= price) {
                    player.components -= price;
                    player.invUpgrades[item.id] = (item.maxLvl > 1) ? (currentLvl + 1) : 1;
                    if (!player.upgrades.includes(item.id)) player.upgrades.push(item.id);
                    soundSystem.playPowerup();
                    if (item.id === 'inv_giap') { player.maxHp += 1; player.hp += 1; }
                    if (item.id === 'inv_tangcuong') { player.maxAmmo += 2; player.ammo += 2; }
                    if (item.id === 'inv_bodam') { player.speed *= 1.1; }
                    renderInventorShop(playerId, false);
                    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) onlineManager.sendNetworkMessage({ type: 'INVENTOR_UPGRADE', pid: playerId, itemId: item.id });
                }
            };
        }

        container.appendChild(card);
    });

    // Hiển thị Full Evo status nếu đã sở hữu hoặc chưa đủ điều kiện (luôn hiện)
    let isFullOwned = player.isFullEvoInventor || (player.invUpgrades && player.invUpgrades['inv_full_evo']);
    if (isFullOwned) {
        const feCard = document.createElement('div');
        feCard.className = 'card sold';
        feCard.style.border = '2px solid gold';
        feCard.style.background = 'linear-gradient(135deg, #1e1b4b, #b45309)';
        feCard.innerHTML = `<h4 style="color:gold; font-size:11px;">FULL EVO ✔</h4><p style="font-size:9px; color:#fef3c7;">4 Drone tối thượng đã kích hoạt!</p>`;
        container.appendChild(feCard);
    } else if (maxedCount < 18) {
        const feCard = document.createElement('div');
        feCard.className = 'card';
        feCard.style.border = '2px dashed #f59e0b';
        feCard.style.background = 'rgba(20, 20, 30, 0.9)';
        feCard.style.opacity = '0.7';
        feCard.innerHTML = `<h4 style="color:#f59e0b; font-size:11px;">FULL EVO 🔒</h4><p style="font-size:9px; color:#cbd5e1;">Max 18 nâng cấp để mở! (${maxedCount}/18)</p>`;
        container.appendChild(feCard);
    }

    // 4. Nút SẴN SÀNG
    const readyBtn = document.createElement('div');
    readyBtn.id = `ready-btn-${playerId}`;
    readyBtn.className = 'card';
    readyBtn.style.border = '2px solid #2ecc71';
    readyBtn.style.background = '#14532d';
    readyBtn.innerHTML = `<h4 style="color:#4ade80; font-size:12px;">SẴN SÀNG</h4><p style="font-size:9px; color:#bbf7d0;">Vào trận ngay</p><p style="color:#2ecc71; font-size:16px;">✔</p>`;
    readyBtn.onclick = () => {
        handlePlayerReady(playerId);
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.conn && onlineManager.conn.open) {
            onlineManager.conn.send({ type: 'READY', pid: playerId });
        }
    };
    container.appendChild(readyBtn);
}

function renderGeniusBlackMarket(playerId, keepItems = false) {
    const container = document.getElementById(`${playerId}-upgrades`);
    if (!container) return;
    container.innerHTML = '';
    const player = (playerId === 'p1') ? p1 : p2;

    const roundTitle = document.getElementById('roundTitleText');
    if (roundTitle) roundTitle.innerText = `CHỢ ĐEN ROBOT (Bánh Răng: ${player.gears || 0} | LK: ${player.components || 0})`;

    if (!player.geniusUpgrades) player.geniusUpgrades = {};
    if (player.geniusPurchaseCount === undefined) player.geniusPurchaseCount = 0;

    let cost = 3 * Math.pow(2, player.geniusPurchaseCount);

    // 1. Nút QUAY LẠI Cửa Hàng Thường
    const backBtn = document.createElement('div');
    backBtn.className = 'card';
    backBtn.style.background = '#2c3e50';
    backBtn.style.border = '2px solid #e74c3c';
    backBtn.innerHTML = `
        <h4 style="color:#ff6b6b; font-size:12px;">QUAY LẠI</h4>
        <p style="font-size:9px; color:#cbd5e1;">Về Cửa Hàng Thường</p>
        <p style="color:#e74c3c; font-size:16px; margin-top:2px;">🔙</p>
    `;
    backBtn.onclick = () => {
        updateShopTitle();
        renderShop(playerId, true);
    };
    container.appendChild(backBtn);

    // 2. Nút REROLL CHỢ ĐEN (1 Linh Kiện)
    const rerollBtn = document.createElement('div');
    rerollBtn.className = 'card';
    rerollBtn.style.background = '#3e2723';
    rerollBtn.style.border = '2px solid #d7ccc8';
    let canReroll = (player.components || 0) >= 1;
    rerollBtn.innerHTML = `
        <h4 style="color:#ffcc80; font-size:12px;">REROLL CHỢ ĐEN</h4>
        <p style="font-size:9px; color:#ffe0b2;">Đổi 3 nâng cấp mới</p>
        <p style="color:${canReroll ? '#00e5ff' : '#ef4444'}; font-size:11px; font-weight:bold; margin-top:2px;">-1 LINH KIỆN</p>
    `;
    rerollBtn.onclick = () => {
        if ((player.components || 0) >= 1) {
            player.components -= 1;
            if (soundSystem && !soundSystem.muted) soundSystem.playCoin();
            renderGeniusBlackMarket(playerId, false);
        } else {
            if (typeof addFloatingText === 'function') addFloatingText(player.x + player.w / 2, player.y - 15, "CẦN 1 LINH KIỆN! 🔩", "#ff5722", 13);
        }
    };
    container.appendChild(rerollBtn);

    // 3. Chọn 3 nâng cấp ngẫu nhiên từ GENIUS_BLACK_MARKET
    if (!keepItems || !player.currentGeniusShopItems) {
        let pool = [...GENIUS_BLACK_MARKET];
        pool.sort(() => 0.5 - Math.random());
        player.currentGeniusShopItems = pool.slice(0, 3);
    }

    player.currentGeniusShopItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.border = '2px solid #ab47bc';
        card.style.background = '#1a0926';

        let currentLvl = player.geniusUpgrades[item.id] || 0;
        let lvlBadge = currentLvl > 0 ? `<span style="color:#00e676; font-size:10px;"> (Cấp ${currentLvl})</span>` : '';
        let canAfford = (player.gears || 0) >= cost;

        card.innerHTML = `
            <span style="font-size:9px; color:#ba68c8;">ROBOT MODULE</span>
            <h4 style="color:#e1bee7; font-size:11px;">${item.name}${lvlBadge}</h4>
            <p style="font-size:9px; color:#d1c4e9;">${item.desc}</p>
            <p style="color:${canAfford ? '#ff9800' : '#ef4444'}; font-weight:bold; font-size:12px;">⚙️ ${cost} Bánh Răng</p>
        `;

        card.onclick = () => {
            if ((player.gears || 0) >= cost) {
                player.gears -= cost;
                player.geniusPurchaseCount++;
                player.geniusUpgrades[item.id] = (player.geniusUpgrades[item.id] || 0) + 1;
                if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
                renderGeniusBlackMarket(playerId, true);
                if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
                    onlineManager.sendNetworkMessage({ type: 'GENIUS_UPGRADE', pid: playerId, itemId: item.id });
                }
            } else {
                if (typeof addFloatingText === 'function') addFloatingText(player.x + player.w / 2, player.y - 15, `CẦN ${cost} BÁNH RĂNG! ⚙️`, "#ff5722", 13);
            }
        };
        container.appendChild(card);
    });

    // 4. Nút SẴN SÀNG
    const readyBtn = document.createElement('div');
    readyBtn.id = `ready-btn-${playerId}`;
    readyBtn.className = 'card';
    readyBtn.style.border = '2px solid #2ecc71';
    readyBtn.style.background = '#14532d';
    readyBtn.innerHTML = `<h4 style="color:#4ade80; font-size:12px;">SẴN SÀNG</h4><p style="font-size:9px; color:#bbf7d0;">Vào trận ngay</p><p style="color:#2ecc71; font-size:16px;">✔</p>`;
    readyBtn.onclick = () => {
        handlePlayerReady(playerId);
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.conn && onlineManager.conn.open) {
            onlineManager.conn.send({ type: 'READY', pid: playerId });
        }
    };
    container.appendChild(readyBtn);
}

function updateShopTitle() {
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
        const myCoin = (onlineManager.role === 'guest') ? gameState.p2Coins : gameState.p1Coins;
        const myColor = (onlineManager.role === 'guest') ? 'ĐỎ' : 'XANH';
        document.getElementById('roundTitleText').innerText = `CỬA HÀNG (BẠN: ${myColor} • $${myCoin})`;
        return;
    }
    document.getElementById('roundTitleText').innerText = `SHOP (Coin: P1:${gameState.p1Coins} - P2:${gameState.p2Coins})`;
}

function handlePlayerReady(pid) {
    if (pid === 'p1') gameState.p1Ready = true; else gameState.p2Ready = true;

    // Đổi màu thẻ Sẵn Sàng trên UI
    let btnUI = document.getElementById(`ready-btn-${pid}`);
    if (btnUI) {
        btnUI.style.background = '#2980b9';
        btnUI.innerHTML = '<h4>ĐANG CHỜ...</h4>';
        btnUI.onclick = null;
    }

    // Cập nhật huy hiệu trạng thái sẵn sàng trên UI
    const p1Status = document.getElementById('p1-ready-status');
    const p2Status = document.getElementById('p2-ready-status');
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
        if (onlineManager.role === 'host') {
            if (p1Status && gameState.p1Ready) {
                p1Status.classList.add('is-ready');
                p1Status.innerHTML = '🔵 BẠN (P1): ĐÃ SẴN SÀNG ✔';
            }
            if (p2Status && gameState.p2Ready) {
                p2Status.classList.add('is-ready');
                p2Status.innerHTML = '🔴 ĐỐI THỦ: ĐÃ SẴN SÀNG ✔';
            }
        } else {
            if (p2Status && gameState.p2Ready) {
                p2Status.classList.add('is-ready');
                p2Status.innerHTML = '🔴 BẠN (P2): ĐÃ SẴN SÀNG ✔';
            }
            if (p1Status && gameState.p1Ready) {
                p1Status.classList.add('is-ready');
                p1Status.innerHTML = '🔵 ĐỐI THỦ: ĐÃ SẴN SÀNG ✔';
            }
        }
    } else {
        if (p1Status && gameState.p1Ready) { p1Status.classList.add('is-ready'); p1Status.innerHTML = 'P1: ĐÃ SẴN SÀNG'; }
        if (p2Status && gameState.p2Ready) { p2Status.classList.add('is-ready'); p2Status.innerHTML = 'P2: ĐÃ SẴN SÀNG'; }
    }

    if (gameState.p1Ready && gameState.p2Ready) {
        // [FIX LỖI TĂNG TỐC]: Khóa cờ ngay lập tức để không bị gọi setTimeout nhiều lần
        gameState.p1Ready = false;
        gameState.p2Ready = false;

        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
            if (onlineManager.role === 'host') {
                onlineManager.sendNetworkMessage({
                    type: 'START_ROUND',
                    round: gameState.round,
                    p1Upgrades: p1 ? p1.upgrades : [],
                    p2Upgrades: p2 ? p2.upgrades : [],
                    p1InvUpgrades: p1 ? p1.invUpgrades : {},
                    p2InvUpgrades: p2 ? p2.invUpgrades : {},
                    p1IsFullEvo: p1 ? !!p1.isFullEvoInventor : false,
                    p2IsFullEvo: p2 ? !!p2.isFullEvoInventor : false
                });
                setTimeout(startRound, 400);
            }
        } else {
            setTimeout(startRound, 500);
        }
    }
}

function startRound() {
    cancelAnimationFrame(animationId);
    fatalCinematic = { active: false, timer: 0, maxTimer: 90, winnerId: null, victimX: 0, victimY: 0 };
    document.getElementById('upgradeScreen').style.display = 'none';
    gameState.phase = 'playing';
    crates = []; moneyTrucks = []; movingObstacle = null;
    if (typeof onlineManager !== 'undefined' && onlineManager.guestDestroyedCrates) {
        onlineManager.guestDestroyedCrates.clear();
    }
    explosions = []; beams = []; radiationZones = []; iceZones = [];
    gameState.lastObstacleSpawn = Date.now();
    gameState.roundStartTime = Date.now();
    lastCrateSpawn = Date.now();
    talismans = [];
    spellZones = [];
    floatingSwords = [];
    turrets = [];
    sniperWalls = [];
    windWalls = [];
    thunderPlantedSpears = [];
    magnetNodes = [];
    bastions = [];
    artilleryHazards = [];
    ghostDecoys = [];
    necroMinions = [];

    // Map selection & Mutators
    let isOnlineGuest = (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest');
    if (!isOnlineGuest) {
        if (!gameState.selectedMapMode || gameState.selectedMapMode === 'random') {
            const mapList = ['classic', 'bastion', 'artillery', 'overdrive', 'fast_shrink', 'rush_hour', 'supply_drop'];
            gameState.currentMap = mapList[Math.floor(Math.random() * mapList.length)];
        } else {
            gameState.currentMap = gameState.selectedMapMode;
        }
    }

    if (gameState.currentMap === 'bastion') {
        let count = 3;
        let step = (canvas.height - 240) / (count + 1);
        for (let bIdx = 0; bIdx < count; bIdx++) {
            let bY = 120 + (bIdx + 1) * step;
            let vx = (bIdx % 2 === 0 ? 2 : -2);
            bastions.push(new BastionWall(bY, 60, vx));
        }
    }

    updateMapHUD();
    triggerRoundIntroBanner();

    // Cố định kích thước sàn đấu mobile khi online
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
        canvas.width = ONLINE_ARENA_WIDTH;
        canvas.height = ONLINE_ARENA_HEIGHT;
    }

    p1.setupForNewRound(); p2.setupForNewRound();
    mortars = []; // Reset pháo
    shadowTraps = [];
    shortgunFireZones = [];
    lastFixedLoopTime = performance.now();
    fixedPhysicsAccumulator = 0;

    // Thêm vào cuối hàm startRound()
    if (p1.weapon === 'cung' && p1.hasUpgrade('evo_cung_1') && p1.hasUpgrade('evo_cung_2')) {
        arrowRains.push(new ArrowRain(p1, 0, 0, 0, true));
    }
    if (p2.weapon === 'cung' && p2.hasUpgrade('evo_cung_1') && p2.hasUpgrade('evo_cung_2')) {
        arrowRains.push(new ArrowRain(p2, 0, 0, 0, true));
    }
    animationId = requestAnimationFrame(gameLoop);
}

let roundBannerTimeout = null;
function triggerRoundIntroBanner() {
    const banner = document.getElementById('roundIntroBanner');
    if (!banner) return;
    banner.classList.remove('show');
    void banner.offsetWidth; // Force reflow
    banner.classList.add('show');
    if (roundBannerTimeout) clearTimeout(roundBannerTimeout);
    roundBannerTimeout = setTimeout(() => {
        banner.classList.remove('show');
    }, 2800);
}

function updateMapHUD() {
    let badge = document.getElementById('hudMapBadge');
    if (!badge) return;
    const mapNames = {
        classic: '🏛️ CỔ ĐIỂN',
        bastion: '🛡️ PHÁO ĐÀI',
        artillery: '💣 PHÁO KÍCH',
        overdrive: '⚡ SIÊU TỐC',
        fast_shrink: '💀 BO THẦN TỐC',
        rush_hour: '🚛 CAO ĐIỂM',
        supply_drop: '📦 TIẾP TẾ'
    };
    badge.innerText = `MAP: ${mapNames[gameState.currentMap] || (gameState.currentMap ? gameState.currentMap.toUpperCase() : 'CỔ ĐIỂN')}`;
}
function drawRain() {
    ctx.strokeStyle = 'rgba(43, 128, 255, 0.46)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 50; i++) { // Vẽ 50 hạt mưa mỗi frame
        let rx = Math.random() * canvas.width;
        let ry = Math.random() * canvas.height;
        let rlen = 10 + Math.random() * 20;
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 5, ry + rlen); // Mưa rơi chéo
    }
    ctx.stroke();
}

function drawShadowHunterAmbiance() {
    ctx.save();
    // Lớp không gian đêm bóng tối
    ctx.fillStyle = 'rgba(5, 8, 20, 0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Đèn pha neon chiếu sáng về phía trước
    const drawHeadlight = (tank, color, dirY) => {
        if (!tank || tank.hp <= 0) return;
        let startX = tank.x + tank.w / 2;
        let startY = (dirY === -1) ? tank.y : tank.y + tank.h;
        let beamLength = 170;
        let spreadW = 65;

        let grad = ctx.createLinearGradient(startX, startY, startX, startY + dirY * beamLength);
        grad.addColorStop(0, color.replace(')', ', 0.35)').replace('rgb', 'rgba'));
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX - spreadW, startY + dirY * beamLength);
        ctx.lineTo(startX + spreadW, startY + dirY * beamLength);
        ctx.closePath();
        ctx.fill();
    };

    drawHeadlight(p1, 'rgb(0, 240, 255)', -1);
    drawHeadlight(p2, 'rgb(255, 0, 85)', 1);
    ctx.restore();
}

function tickPhysics() {
    const now = Date.now();

    // 1. Giảm thời gian rung màn hình theo nhịp tick cố định
    if (screenShake.duration > 0) {
        screenShake.duration--;
    }

    // 2. Sudden Death Damage
    let suddenDeathLimit = (gameState.currentMap === 'fast_shrink') ? 20000 : C.suddenDeathTime;
    let shrinkRate = (gameState.currentMap === 'fast_shrink') ? 0.15 : 0.05;
    let timePlayed = now - gameState.roundStartTime;
    if (timePlayed > suddenDeathLimit) {
        let shrink = (timePlayed - suddenDeathLimit) * shrinkRate;
        let zoneX = shrink;
        let zoneW = canvas.width - shrink * 2;
        if (zoneW < 50) { zoneW = 50; zoneX = canvas.width / 2 - 25; }

        [p1, p2].forEach(p => {
            if (p.x < zoneX || p.x + p.w > zoneX + zoneW) {
                if (p.weapon === 'the_strongest') {
                    p.takeDamage(0.05, null, { isEnvironmental: true });
                } else {
                    p.hp -= 0.05;
                }
            }
        });
        if (p1.hp <= 0) triggerFatalCinematic(2, p1);
        if (p2.hp <= 0) triggerFatalCinematic(1, p2);
    }

    // 3. Spawns & Obstacle (Host / Local only)
    const isOnlineGuest = (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest');

    if (!isOnlineGuest) {
        let crateInterval = (gameState.currentMap === 'supply_drop') ? 1500 : 3000;
        let maxCrates = (gameState.currentMap === 'supply_drop') ? 12 : 5;
        if (now - lastCrateSpawn > crateInterval && crates.length < maxCrates) {
            crates.push(new Crate()); lastCrateSpawn = now;
        }

        // Rush Hour map: duy trì liên tục 2 - 3 xe chở tiền
        if (gameState.currentMap === 'rush_hour') {
            let activeTrucks = moneyTrucks.filter(t => t.active).length;
            if (activeTrucks < 3) {
                if (activeTrucks < 2 || Math.random() < 0.05) {
                    moneyTrucks.push(new MoneyTruck());
                }
            }
        } else {
            let spawnRate = 0.001;
            if (p1.upgradeLevel >= 2 || p2.upgradeLevel >= 2) spawnRate = 0.003;
            if (Math.random() < spawnRate) moneyTrucks.push(new MoneyTruck());
        }

        // Artillery map: bão đạn pháo kích ngẫu nhiên mỗi 2.5s
        if (gameState.currentMap === 'artillery') {
            if (!gameState.lastArtillerySpawn || now - gameState.lastArtillerySpawn > 2500) {
                gameState.lastArtillerySpawn = now;
                let hx = 40 + Math.random() * (canvas.width - 80);
                let hy = 60 + Math.random() * (canvas.height - 120);
                artilleryHazards.push(new ArtilleryHazard(hx, hy));
            }
        }

        if (!movingObstacle || !movingObstacle.active) {
            if (now - gameState.lastObstacleSpawn > 8000) {
                movingObstacle = new MovingObstacle(); gameState.lastObstacleSpawn = now;
            }
        } else { movingObstacle.update(); }
    } else {
        if (movingObstacle && movingObstacle.active) {
            movingObstacle.update();
        }
    }

    // Bastions & Hazards & Magnet Nodes updates
    bastions.forEach(b => b.update());
    bastions = bastions.filter(b => b.active);

    artilleryHazards.forEach(h => h.update());
    artilleryHazards = artilleryHazards.filter(h => h.active);

    ghostDecoys.forEach(d => d.update());
    ghostDecoys = ghostDecoys.filter(d => d.active);

    confinementCages.forEach(c => c.update());
    confinementCages = confinementCages.filter(c => c.active);

    creatorTurrets.forEach(t => t.update());
    creatorTurrets = creatorTurrets.filter(t => t.active);

    creatorRobots.forEach(r => r.update());
    creatorRobots = creatorRobots.filter(r => r.active);

    if (typeof necroMinions !== 'undefined') {
        necroMinions.forEach(m => m.update());
        necroMinions = necroMinions.filter(m => m.active);
    }

    let curMagnetTime = Date.now();
    magnetNodes.forEach(node => {
        if (!node.active) return;
        let speedMult = (node.owner && node.owner.hasUpgrade && node.owner.hasUpgrade('evo_mag_net_2')) ? 1.5 : 1.0;
        let baseForce = 2.8 * speedMult;
        [p1, p2].forEach(p => {
            if (!p || p.hp <= 0) return;
            let dist = Math.hypot((p.x + p.w / 2) - node.x, (p.y + p.h / 2) - node.y);
            let dx = (p.x + p.w / 2) - node.x;
            let inRange = (dist <= node.radius) || (Math.abs(dx) <= node.radius * 1.5);
            if (inRange) {
                if (node.owner && p !== node.owner) {
                    if (!p.infectedPolarity || p.infectedPolarityTimer <= 0) {
                        p.infectedPolarity = node.polarity;
                        p.infectedPolarityTimer = 180;
                    }
                }
                let targetPolarity = (p === node.owner) ? p.magnetPolarity : p.infectedPolarity;
                if (targetPolarity) {
                    // HÚT / ĐẨY CHỈ TÁC ĐỘNG THEO TRỤC NGANG (X), KHÔNG ĐƯỢC TÁC ĐỘNG THEO CHIỀU DỌC (Y)
                    if (targetPolarity === node.polarity) {
                        // Cùng cực: ĐẨY RA XA (REPEL) theo phương ngang
                        let dirX = (dx >= 0 ? 1 : -1);
                        p.x = Math.max(0, Math.min(canvas.width - p.w, p.x + dirX * baseForce));
                    } else {
                        // Khác cực: HÚT LẠI GẦN (ATTRACT) theo phương ngang
                        if (Math.abs(dx) <= baseForce) {
                            p.x = Math.max(0, Math.min(canvas.width - p.w, node.x - p.w / 2));
                        } else {
                            let dirX = (dx >= 0 ? -1 : 1);
                            p.x = Math.max(0, Math.min(canvas.width - p.w, p.x + dirX * baseForce));
                        }
                        if (Math.abs(dx) <= 30 && p !== node.owner) {
                            p.freezeTimer = Math.max(p.freezeTimer || 0, 30);
                            if (!node.lastDmgTime || curMagnetTime - node.lastDmgTime >= 1000) {
                                node.lastDmgTime = curMagnetTime;
                                let shockDmg = (node.owner && node.owner.hasUpgrade && node.owner.hasUpgrade('evo_mag_net_1')) ? 0.5 : 0.25;
                                p.takeDamage(shockDmg, node.owner);
                                if (typeof addFloatingText === 'function') addFloatingText(p.x + p.w / 2, p.y - 12, `GIẬT ĐIỆN -${shockDmg} ⚡`, "#00e5ff", 12);
                            }
                        }
                    }
                }
            }
        });
    });
    magnetNodes = magnetNodes.filter(n => n.active);

    // 4. Update Entities
    crates.forEach(c => c.update());
    crates = crates.filter(c => c.active);

    moneyTrucks.forEach(t => t.update());
    moneyTrucks = moneyTrucks.filter(t => t.active);

    for (let i = explosions.length - 1; i >= 0; i--) {
        let e = explosions[i]; e.update();
        if (!e.active) explosions.splice(i, 1);
    }

    for (let i = arrowRains.length - 1; i >= 0; i--) {
        let ar = arrowRains[i];
        ar.update();
        if (!ar.active) arrowRains.splice(i, 1);
    }

    for (let i = arrowDrops.length - 1; i >= 0; i--) {
        let drop = arrowDrops[i];
        drop.update();
        if (!drop.active) arrowDrops.splice(i, 1);
    }

    for (let i = radiationZones.length - 1; i >= 0; i--) {
        let r = radiationZones[i]; r.update();
        if (!r.active) radiationZones.splice(i, 1);
    }

    for (let i = iceZones.length - 1; i >= 0; i--) {
        let z = iceZones[i]; z.update();
        if (!z.active) iceZones.splice(i, 1);
    }

    for (let i = floatingSwords.length - 1; i >= 0; i--) {
        let fs = floatingSwords[i]; fs.update();
        if (!fs.active) floatingSwords.splice(i, 1);
    }

    for (let i = voidZones.length - 1; i >= 0; i--) {
        let vz = voidZones[i]; vz.update();
        if (!vz.active) voidZones.splice(i, 1);
    }

    for (let i = talismans.length - 1; i >= 0; i--) {
        let t = talismans[i]; t.update();
        if (!t.active) talismans.splice(i, 1);
    }

    for (let i = spellZones.length - 1; i >= 0; i--) {
        let s = spellZones[i]; s.update();
        if (!s.active) spellZones.splice(i, 1);
    }

    // Shadow Hunter Traps
    for (let i = shadowTraps.length - 1; i >= 0; i--) {
        let trap = shadowTraps[i];
        let opponent = (trap.owner && trap.owner.id === 1) ? p2 : p1;
        trap.update(opponent);
        if (!trap.active) shadowTraps.splice(i, 1);
    }

    // Shortgun FireZones
    for (let i = shortgunFireZones.length - 1; i >= 0; i--) {
        let fz = shortgunFireZones[i];
        let targets = [p1, p2, ...turrets, ...crates, ...moneyTrucks].filter(t => t && t !== fz.owner);
        fz.update(targets);
        if (!fz.active) shortgunFireZones.splice(i, 1);
    }

    for (let i = turrets.length - 1; i >= 0; i--) {
        let t = turrets[i];
        t.update();
        if (!t.active) turrets.splice(i, 1);
    }

    for (let i = sniperWalls.length - 1; i >= 0; i--) {
        let sw = sniperWalls[i]; sw.update();
        if (!sw.active) sniperWalls.splice(i, 1);
    }

    for (let i = windWalls.length - 1; i >= 0; i--) {
        let w = windWalls[i];
        w.update();
        if (!w.active) windWalls.splice(i, 1);
    }

    for (let i = beams.length - 1; i >= 0; i--) {
        let b = beams[i]; b.update();
        if (b.active && b.isEvo && b.lifeTime % 12 === 0) {
            const owner = (b.ownerId === 1) ? p1 : p2;
            const enemy = (b.ownerId === 1) ? p2 : p1;

            if (rectIntersect(b.x, b.y, b.w, b.h, enemy.x, enemy.y, enemy.w, enemy.h)) { enemy.takeDamage(1, (b.ownerId === 1 ? p1 : p2)); }

            crates.forEach(c => {
                if (c.active && rectIntersect(b.x, b.y, b.w, b.h, c.x, c.y, c.w, c.h)) {
                    c.active = false;
                    if (c.isMimic) {
                        triggerMimicExplosion(c, owner);
                    }
                    if (c.type === 'hp') { owner.hp = Math.min(owner.hp + 1, owner.maxHp); if (owner.weapon === 'inventor') owner.components = (owner.components || 0) + 1; }
                    if (c.type === 'ammo') { owner.onCollectAmmoCrate(c); if (owner.weapon === 'inventor') owner.components = (owner.components || 0) + 1; }
                    if (c.type === 'shield') { owner.shield++; if (owner.weapon === 'inventor') owner.components = (owner.components || 0) + 1; }
                    if (c.type === 'dmg') { owner.dmgBuff++; if (owner.weapon === 'inventor') owner.components = (owner.components || 0) + 1; }
                    if (owner.weapon === 'evolution') { owner.onEvolutionCrateEat(c.type); }
                    if (c.type === 'boom') {
                        explosions.push(new Explosion(c.x + c.w / 2, c.y + c.h / 2, 60, 'rgba(255,0,0,', 2, null));
                        if (owner.weapon === 'inventor') owner.components = (owner.components || 0) + 3;
                    }
                    if (c.type === 'coin') {
                        let money = 30; if (owner.weapon === 'money_tank') money *= 2;
                        if (owner.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                        if (owner.weapon === 'inventor') owner.components = (owner.components || 0) + 2;
                    }
                    if (c.type === 'gear') {
                        let lkGain = owner.hasUpgrade('evo_inv_1') ? 8 : 5;
                        owner.ammo = Math.min(owner.maxAmmo, owner.ammo + 1);
                        owner.hp = Math.min(owner.maxHp, owner.hp + 0.25);
                        if (owner.weapon === 'inventor') owner.components = (owner.components || 0) + lkGain;
                    }
                }
            });

            moneyTrucks.forEach(t => {
                if (t.active && rectIntersect(b.x, b.y, b.w, b.h, t.x, t.y, t.w, t.h)) {
                    let dmg = 1; if (owner.weapon === 'money_tank') dmg *= 3;
                    t.hp -= dmg;
                    if (t.hp <= 0) {
                        t.active = false;
                        let money = 30; if (owner.weapon === 'money_tank') money *= 2;
                        if (owner.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                        if (owner.weapon === 'inventor') owner.components = (owner.components || 0) + 3;
                        if (owner.hasUpgrade('evo_money_atk')) explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 100, 'rgba(255,215,0,', 5, owner));
                    }
                }
            });
        }
        if (!b.active) beams.splice(i, 1);
    }

    if (typeof botAI !== 'undefined' && botAI.enabled) {
        botAI.update(p2, p1);
    }
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
        onlineManager.onGameLoopTick();
    }

    p1.update(); p2.update();
    checkHits(p1, p2); checkHits(p2, p1);

    for (let i = mortars.length - 1; i >= 0; i--) {
        let m = mortars[i];
        m.update();
        if (!m.active) mortars.splice(i, 1);
    }

    // 5. Fatal Cinematic / Victory Checks
    if (fatalCinematic.active) {
        fatalCinematic.timer--;
        if (fatalCinematic.timer <= 0) {
            fatalCinematic.active = false;
            endRound(fatalCinematic.winnerId);
            return;
        }
    } else {
        if (p1.hp <= 0 && p2.hp <= 0) triggerFatalCinematic(0, p1);
        else if (p1.hp <= 0) triggerFatalCinematic(2, p1);
        else if (p2.hp <= 0) triggerFatalCinematic(1, p2);
    }
}

function drawThunderPlantedSpear(s) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.fillStyle = "#ffff00";
    ctx.shadowColor = "#ffff00";
    ctx.shadowBlur = 10;
    ctx.fillRect(-14, -2, 28, 4);
    ctx.beginPath();
    ctx.moveTo(14, -6);
    ctx.lineTo(24, 0);
    ctx.lineTo(14, 6);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#ffff00";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
}

function drawMagnetNode(m) {
    if (!m.active) return;
    ctx.save();
    let isPos = (m.polarity === 1);
    let auraColor = isPos ? 'rgba(255, 60, 0, 0.12)' : 'rgba(0, 180, 255, 0.12)';
    let strokeColor = isPos ? '#ff4400' : '#00aaff';
    ctx.fillStyle = auraColor;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isPos ? 'rgba(255, 60, 0, 0.4)' : 'rgba(0, 180, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(m.x, m.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(isPos ? "+" : "-", m.x, m.y);
    ctx.restore();
}

function renderFrame() {
    if (gameState.phase !== 'playing' && !fatalCinematic.active) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply Screen Shake & Camera Jump
    ctx.save();
    const isGuestView = (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest');
    if (isGuestView) {
        ctx.translate(canvas.width, canvas.height);
        ctx.rotate(Math.PI);
    }
    if (fatalCinematic.active) {
        let progress = 1 - (fatalCinematic.timer / fatalCinematic.maxTimer);
        let zoom = 1 + 0.20 * Math.sin(Math.min(progress * 2.5, 1) * Math.PI / 2);
        let targetX = fatalCinematic.victimX;
        let targetY = fatalCinematic.victimY;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-targetX, -targetY);
    }
    if (screenShake.duration > 0) {
        let sMag = screenShake.intensity * (screenShake.duration / 10);
        screenShake.x = (Math.random() - 0.5) * sMag;
        screenShake.y = (Math.random() - 0.5) * sMag;
        ctx.translate(screenShake.x, screenShake.y);
    } else {
        screenShake.x = 0; screenShake.y = 0;
    }

    // VẼ TRỜI MƯA NẾU CÓ STORM FULL EVO
    if (isRaining) drawRain();

    // VẼ SÀN TỐI & ĐÈN PHA NEON NẾU CÓ SHADOW HUNTER FULL EVO
    let hasFullEvoShadow = (p1 && p1.weapon === 'shadow_hunter' && p1.hasUpgrade('evo_sh_1') && p1.hasUpgrade('evo_sh_2')) ||
                           (p2 && p2.weapon === 'shadow_hunter' && p2.hasUpgrade('evo_sh_1') && p2.hasUpgrade('evo_sh_2'));
    if (hasFullEvoShadow) {
        drawShadowHunterAmbiance();
    }

    // VẼ BÃO SẤM U ÁM NẾU CÓ THUNDER FULL EVO
    let hasFullEvoThunder = (p1 && p1.weapon === 'thunder' && p1.hasUpgrade('evo_thun_1') && p1.hasUpgrade('evo_thun_2')) ||
                            (p2 && p2.weapon === 'thunder' && p2.hasUpgrade('evo_thun_1') && p2.hasUpgrade('evo_thun_2'));
    if (hasFullEvoThunder) {
        ctx.fillStyle = "rgba(10, 20, 45, 0.25)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const now = Date.now();
    let timePlayed = now - gameState.roundStartTime;
    let suddenDeathLimit = (gameState.currentMap === 'fast_shrink') ? 20000 : C.suddenDeathTime;
    let shrinkRate = (gameState.currentMap === 'fast_shrink') ? 0.15 : 0.05;
    if (timePlayed > suddenDeathLimit) {
        let shrink = (timePlayed - suddenDeathLimit) * shrinkRate;
        let zoneX = shrink;
        let zoneW = canvas.width - shrink * 2;
        if (zoneW < 50) { zoneW = 50; zoneX = canvas.width / 2 - 25; }

        ctx.strokeStyle = 'red'; ctx.setLineDash([10, 10]); ctx.lineWidth = 2;
        ctx.strokeRect(zoneX, 0, zoneW, canvas.height); ctx.setLineDash([]);
    }

    if (movingObstacle && movingObstacle.active) {
        movingObstacle.draw();
    }

    bastions.forEach(b => b.draw());
    magnetNodes.forEach(m => drawMagnetNode(m));
    thunderPlantedSpears.forEach(s => drawThunderPlantedSpear(s));

    // Tia sét cảnh báo Thu Thương & Cột cảnh báo Lôi Minh
    [p1, p2].forEach(p => {
        if (p && p.weapon === 'thunder' && p.thunderIsRecallWarning) {
            let mySpears = thunderPlantedSpears.filter(s => s.owner === p);
            ctx.save();
            ctx.strokeStyle = "rgba(255, 255, 0, 0.85)";
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 6]);
            mySpears.forEach(s => {
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(p.x + p.w / 2, p.y + p.h / 2);
                ctx.stroke();
            });
            ctx.setLineDash([]);
            ctx.restore();
        }
        // Cột cảnh báo Lôi Minh (0.25s)
        if (p && p.weapon === 'thunder' && (p.thunderRaycastWarningTimer || 0) > 0) {
            let rx = p.thunderRaycastX || (p.x + p.w / 2);
            ctx.save();
            ctx.fillStyle = "rgba(255, 235, 59, 0.3)";
            ctx.fillRect(rx - 14, 0, 28, canvas.height);
            ctx.strokeStyle = "rgba(255, 50, 0, 0.85)";
            ctx.lineWidth = 2.5;
            ctx.setLineDash([6, 6]);
            ctx.strokeRect(rx - 14, 0, 28, canvas.height);
            ctx.setLineDash([]);
            ctx.restore();
        }
    });

    artilleryHazards.forEach(h => h.draw());
    ghostDecoys.forEach(d => d.draw());

    crates.forEach(c => c.draw());
    moneyTrucks.forEach(t => t.draw());

    // Cạm bẫy & Biển lửa dưới chân xe
    shortgunFireZones.forEach(fz => fz.draw());
    shadowTraps.forEach(trap => trap.draw());

    explosions.forEach(e => e.draw());
    arrowRains.forEach(ar => ar.draw());
    arrowDrops.forEach(drop => drop.draw());
    radiationZones.forEach(r => r.draw());
    iceZones.forEach(z => z.draw());
    floatingSwords.forEach(fs => fs.draw());
    voidZones.forEach(vz => vz.draw());
    talismans.forEach(t => t.draw());
    spellZones.forEach(s => s.draw());
    turrets.forEach(t => t.draw());
    sniperWalls.forEach(sw => sw.draw());
    windWalls.forEach(w => w.draw());
    beams.forEach(b => b.draw());

    confinementCages.forEach(c => c.draw());
    creatorTurrets.forEach(t => t.draw());
    creatorRobots.forEach(r => r.draw());
    if (typeof necroMinions !== 'undefined') {
        necroMinions.forEach(m => m.draw());
    }
    [p1, p2].forEach(p => {
        if (p && p.creatorShield) p.creatorShield.draw();
        if (p && p.creatorDrone) p.creatorDrone.draw();
    });

    p1.draw(); p2.draw();

    // UI Tụ lực Sấm Chớp rõ ràng (3 giai đoạn)
    [p1, p2].forEach(p => {
        if (p && p.weapon === 'thunder' && (p.thunderHoldFrames || 0) > 0) {
            ctx.save();
            let barW = 84;
            let barH = 7;
            let barX = p.x + p.w / 2 - barW / 2;
            let barY = (p.id === 1) ? p.y - 28 : p.y + p.h + 20;

            // Nền thanh sạc
            ctx.fillStyle = "rgba(15, 15, 25, 0.88)";
            ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 1;
            ctx.strokeRect(barX - 2, barY - 2, barW + 4, barH + 4);

            let held = p.thunderHoldFrames;
            let stage = held < 30 ? 1 : (held <= 60 ? 2 : 3);
            let stageLabel = stage === 1 ? "⚡ PHÓNG THƯƠNG" : (stage === 2 ? "🧲 THU THƯƠNG" : "🌪️ TRẢM LÔI");
            let stageColor = stage === 1 ? "#00e5ff" : (stage === 2 ? "#ffd700" : "#ff007f");

            // Tiến độ thanh sạc
            let fillPct = Math.min(1, held / 65);
            ctx.fillStyle = stageColor;
            ctx.fillRect(barX, barY, barW * fillPct, barH);

            // Vạch phân chia 30f và 60f
            ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
            ctx.lineWidth = 1.5;
            let mark1 = barX + barW * (30 / 65);
            let mark2 = barX + barW * (60 / 65);
            ctx.beginPath();
            ctx.moveTo(mark1, barY - 1); ctx.lineTo(mark1, barY + barH + 1);
            ctx.moveTo(mark2, barY - 1); ctx.lineTo(mark2, barY + barH + 1);
            ctx.stroke();

            // Nhãn chữ kỹ năng
            ctx.font = 'bold 10px "Orbitron", Arial, sans-serif';
            ctx.fillStyle = stageColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = (p.id === 1) ? 'bottom' : 'top';
            let textY = (p.id === 1) ? barY - 3 : barY + barH + 3;
            ctx.fillText(stageLabel, p.x + p.w / 2, textY);

            ctx.restore();
        }
    });

    // Vẽ pháo nổ trên đầu người chơi
    mortars.forEach(m => m.draw());

    // Particles & Floating Numbers
    updateAndDrawParticles();
    updateAndDrawFloatingTexts();

    ctx.restore(); // Restore from Screen Shake & Camera Jump & Guest Viewport Inversion

    // In-game Canvas Coin HUD (Drawn in unrotated Screen Space)
    ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 12px "Orbitron", Arial, monospace'; ctx.textAlign = 'left';
    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') {
        ctx.fillText(`🔵 ĐỐI THỦ (P1) 💰 $${gameState.p1Coins}`, 10, 48);
        ctx.fillText(`🔴 BẠN (P2) 💰 $${gameState.p2Coins}`, 10, canvas.height - 24);
    } else if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) {
        ctx.fillText(`🔴 ĐỐI THỦ (P2) 💰 $${gameState.p2Coins}`, 10, 48);
        ctx.fillText(`🔵 BẠN (P1) 💰 $${gameState.p1Coins}`, 10, canvas.height - 24);
    } else {
        ctx.fillText(`P2 💰 $${gameState.p2Coins}`, 10, 48);
        ctx.fillText(`P1 💰 $${gameState.p1Coins}`, 10, canvas.height - 24);
    }

    // Update Header Coin Counters
    let p1CoinEl = document.getElementById('p1-coin-val');
    let p2CoinEl = document.getElementById('p2-coin-val');
    if (p1CoinEl) p1CoinEl.innerText = gameState.p1Coins;
    if (p2CoinEl) p2CoinEl.innerText = gameState.p2Coins;

    // Fatal Cinematic Victory Sequence
    if (fatalCinematic.active) {
        drawVictoryBanner(fatalCinematic.winnerId, fatalCinematic.timer, fatalCinematic.maxTimer);
    }
}

function gameLoop(timestamp) {
    // --- CHECK CINEMATIC MODE ---
    if (cinematicMode) {
        cinematicTimer--;
        if (cinematicTimer % 5 === 0) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + (Math.random() - 0.5) * 100, 0);
        ctx.lineTo(cinematicVictim.x + cinematicVictim.w / 2, cinematicVictim.y + cinematicVictim.h / 2);
        ctx.stroke();

        if (cinematicTimer <= 0) {
            cinematicMode = false;
            endRound(cinematicWinnerId);
            return;
        }
        animationId = requestAnimationFrame(gameLoop);
        return;
    }

    if (gameState.phase !== 'playing' && !fatalCinematic.active) return;

    if (!timestamp) timestamp = performance.now();
    if (!lastFixedLoopTime) lastFixedLoopTime = timestamp;

    let dt = timestamp - lastFixedLoopTime;
    lastFixedLoopTime = timestamp;

    // Giới hạn dt tối đa 250ms tránh dồn tích lũy quá lớn khi drop FPS hoặc đổi tab
    if (dt > 250) dt = 250;
    if (dt < 0) dt = 0;

    fixedPhysicsAccumulator += dt;

    let ticksRan = 0;
    while (fixedPhysicsAccumulator >= TICK_TIME && ticksRan < 5) {
        tickPhysics();
        fixedPhysicsAccumulator -= TICK_TIME;
        ticksRan++;
        if (gameState.phase !== 'playing' && !fatalCinematic.active) break;
    }

    renderFrame();

    if (gameState.phase === 'playing' || fatalCinematic.active) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

function checkHits(attacker, victim) {
    let prevHp = victim.hp;
    let applyDamage = true;

    for (let i = 0; i < attacker.bullets.length; i++) {
        let b = attacker.bullets[i];

        // =======================================================
        // [SNIPER LOGIC] - TÍNH TOÁN SÁT THƯƠNG ĐÃ GIẢM KHI XUYÊN
        // =======================================================
        let isFullEvoSniper = (b.owner && b.owner.weapon === 'sniper' && b.owner.hasUpgrade('evo_sniper_1') && b.owner.hasUpgrade('evo_sniper_2'));
        let dmgReduc = 1;
        if (b.isSniperBullet && b.hitIds && b.hitIds.length > 0 && !isFullEvoSniper) dmgReduc = 0.5;
        let currentFinalDmg = b.dmg * dmgReduc;

        // --- 0. LOGIC PHẢN ĐẠN (Storm Evo 2) ---
        if (victim.weapon === 'storm' && victim.shield > 0) {
            if (victim.weapon === 'ghost' && victim.isGhostActive) continue;
            if (rectIntersect(b.x, b.y, b.w, b.h, victim.x, victim.y, victim.w, victim.h)) {
                if (!b.isPiercing && b.bounceCount === 0 && !b.isStormShadow) {
                    b.owner = victim;
                    b.vx *= -1; b.vy *= -1;
                    attacker.bullets.splice(i, 1);
                    victim.bullets.push(b);
                    i--;
                    continue;
                }
            }
        }

        // Check va chạm với Kiếm Thể Thủ (Chặn hit)
        if (victim.swordShieldActive && !b.isPiercing) {
            victim.swordShieldHits--;
            attacker.bullets.splice(i, 1); i--;
            continue;
        }
        //sukuna
        // Thêm vào logic xử lý khi victim bị trúng đạn thương vong:
        // Thay thế đoạn nhận 10 Chú Lực cũ bằng đoạn code này:
        if (victim.weapon === 'sukuna') {
            let now = Date.now();
            victim.lastCeGainTime = victim.lastCeGainTime || 0;

            // THÊM COOLDOWN: Phải cách nhau ít nhất 0.5 giây mới được nhận thêm Chú Lực từ sát thương
            if (now - victim.lastCeGainTime > 3000) {
                victim.cursedEnergy = Math.min(100, victim.cursedEnergy + 10);
                victim.lastCeGainTime = now;
            }

            // Ngắt Lãnh địa / Phản chuyển khi bị đánh trúng
            victim.sukunaChargeTimer = 0;
            if (victim.domainActive) victim.domainActive = false;
        }
        if (victim.weapon === 'the_strongest') {
            // Ngắt niệm Chú Lực khi bị đánh trúng
            victim.gojoChargeTimer = 0;
        }
        // =========================================================================
        // HÀM DÙNG CHUNG: KÍCH HOẠT HIỆU ỨNG LÊN VẬT CẢN (Y HỆT NHƯ LÊN NGƯỜI CHƠI)
        // =========================================================================
        function applyBulletEffectsToStructure(target, x, y) {
            if (b.isAmChu) {
                let r = attacker.hasUpgrade('evo_ads_1') ? 55 : 40;
                iceZones.push(new IceZone(x, y, r, 90, attacker));
            }
            if (b.isDuongChu) {
                let r = attacker.hasUpgrade('evo_ads_1') ? 55 : 40;
                explosions.push(new Explosion(x, y, r, 'rgba(255, 100, 0,', 0.75, attacker));
                voidZones.push(new VoidZone(x, y, r, 90, attacker));
            }
            if (b.type === 'hu_vo') {
                explosions.push(new Explosion(x, y, 55, 'purple', 0.5, attacker));
                voidZones.push(new VoidZone(x, y, 55, 120, attacker));
                if (attacker.hasUpgrade('evo_blade_1') && typeof target.hp !== 'undefined') {
                    target.huVoStack = (target.huVoStack || 0) + 1;
                    if (target.huVoStack >= 3) {
                        target.takeDamage(999, attacker, { ignoreInvincible: true });
                        target.huVoStack = 0;
                        explosions.push(new Explosion(target.x, target.y, 150, 'black', 0, attacker));
                    }
                }
            }
            if (b.createAcidZone) iceZones.push(new AcidZone(x, y, attacker));
            if (b.createIceZone) {
                let radius = (attacker.hasUpgrade('evo_ice_1') && b.isBigIceZone) ? 140 : 100;
                let duration = (attacker.hasUpgrade('evo_ice_1') && b.isBigIceZone) ? 240 : 120;
                iceZones.push(new IceZone(x, y, radius, duration, attacker));
            }
            if (b.isRocket) {
                let range = attacker.hasUpgrade('evo_rocket_1') ? 100 : 60;
                let color = attacker.hasUpgrade('evo_rocket_1') ? 'rgba(0, 255, 0,' : 'rgba(255, 100, 0,';
                explosions.push(new Explosion(x, y, range, color, 1, attacker));
                if (attacker.hasUpgrade('evo_rocket_1')) radiationZones.push(new RadiationZone(x, y));
            }
            if (b.isExplosive) explosions.push(new Explosion(x, y, 55, 'rgba(255, 0, 255,', 2, attacker));
        }

        function handleEntityKilledByAttacker(victimEntity, x, y) {
            if (attacker.weapon === 'shortgunATK') {
                // Thu hồi đạn khi tiêu diệt mục tiêu
                attacker.ammo = Math.min(attacker.maxAmmo, attacker.ammo + 1);
                if (typeof addFloatingText === 'function') addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, "+1 AMMO 🎯", "#00ffcc", 13);

                // Evo 2: Tàn Phá -> Xác mục tiêu hóa đạn pháo quán tính văng tới nổ AoE
                if (attacker.hasUpgrade('evo_sg_2')) {
                    let dirY = (attacker.id === 1) ? -1 : 1;
                    attacker.bullets.push({
                        type: 'cannonball',
                        isCannonball: true,
                        x: x - 8, y: y - 8, w: 16, h: 16,
                        vx: 0, vy: dirY * (C.bulletSpeed * 1.8),
                        dmg: attacker.damage * 1.5,
                        owner: attacker,
                        isPiercing: false,
                        hitIds: [], bounceCount: 0,
                        trailHistory: [],
                        spawnTime: Date.now()
                    });
                    if (typeof explosions !== 'undefined') explosions.push(new Explosion(x, y, 40, 'orange', 0, attacker));
                }

                // Full Evo: Kill All -> Tăng vĩnh viễn +0.25 Max HP và +0.125 Dmg
                if (attacker.hasUpgrade('evo_sg_1') && attacker.hasUpgrade('evo_sg_2')) {
                    attacker.shortgunBonusMaxHp = (attacker.shortgunBonusMaxHp || 0) + 0.25;
                    attacker.shortgunBonusDmg = (attacker.shortgunBonusDmg || 0) + 0.125;
                    attacker.maxHp += 0.25;
                    attacker.hp = Math.min(attacker.maxHp, attacker.hp + 0.25);
                    attacker.damage += 0.125;
                    if (typeof addFloatingText === 'function') addFloatingText(attacker.x + attacker.w / 2, attacker.y - 30, "+0.25 HP & +0.125 DMG", "#ffd700", 12);
                }
            }
        }

        // --- 1. KIỂM TRA VA CHẠM VỚI Ụ SÚNG (TURRETS & CREATOR TURRETS) ---
        let hitTurret = false;
        let allTurrets = [...turrets];
        if (typeof creatorTurrets !== 'undefined') allTurrets.push(...creatorTurrets);
        for (let t of allTurrets) {
            if (t.active && t.owner.id !== attacker.id) {
                if (rectIntersect(b.x, b.y, b.w, b.h, t.x, t.y, t.w, t.h)) {
                    if (b.isPiercing && b.hitIds && b.hitIds.includes(t)) continue;

                    let dmgToTurret = (b.isAcid || attacker.weapon === 'acid') ? 5 : currentFinalDmg;
                    if (attacker.weapon === 'money_tank') dmgToTurret *= 2;

                    if (attacker.weapon === 'furnace') {
                        t.burnStacks = (t.burnStacks || 0) + 1;
                        dmgToTurret += (0.125 * t.burnStacks);
                        if (t.burnStacks >= 5) {
                            t.hp -= 5; t.burnStacks = 0;
                            explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 60, 'orange', 0, attacker));
                        }
                    }

                    t.hp -= dmgToTurret;
                    explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 20, 'gray', 0, attacker));

                    // KÍCH HOẠT HIỆU ỨNG NHƯ NGƯỜI CHƠI
                    applyBulletEffectsToStructure(t, b.x, b.y);
                    if (t.hp <= 0) {
                        t.active = false;
                        explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 50, 'red', 0, attacker));
                        handleEntityKilledByAttacker(t, t.x + t.w / 2, t.y + t.h / 2);
                    }

                    if (!b.hitIds) b.hitIds = [];
                    if (b.isPiercing) {
                        b.hitIds.push(t);
                    } else {
                        attacker.bullets.splice(i, 1); i--; hitTurret = true; break;
                    }
                }
            }
        }
        if (hitTurret) continue;

        // --- 1.1. KIỂM TRA VA CHẠM VỚI DRONE CỦA NHÀ PHÁT MINH ---
        let hitDrone = false;
        if (victim.drones && victim.drones.length > 0) {
            for (let d of victim.drones) {
                if (d.active && rectIntersect(b.x, b.y, b.w, b.h, d.x, d.y, d.w, d.h)) {
                    if (b.isPiercing && b.hitIds && b.hitIds.includes(d)) continue;

                    d.takeDamage((b.isAcid || attacker.weapon === 'acid') ? 5 : currentFinalDmg);

                    // Thưởng Linh Kiện cho Inventor khi phá Drone
                    if (!d.active) {
                        if (attacker.weapon === 'inventor') {
                            let lkBonus = attacker.hasUpgrade('evo_inv_1') ? 2 : 1;
                            attacker.components = (attacker.components || 0) + lkBonus;
                            addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, `+${lkBonus} LK`, "#00ffcc", 12);
                        }
                        handleEntityKilledByAttacker(d, d.x + d.w / 2, d.y + d.h / 2);
                    }

                    if (!b.hitIds) b.hitIds = [];
                    if (b.isPiercing) {
                        b.hitIds.push(d);
                    } else {
                        attacker.bullets.splice(i, 1); i--; hitDrone = true; break;
                    }
                }
            }
        }
        if (hitDrone) continue;

        // --- 1.2. KIỂM TRA VA CHẠM VỚI MINION CHIÊU HỒN SƯ ---
        let hitNecroMinion = false;
        if (typeof necroMinions !== 'undefined' && necroMinions.length > 0) {
            for (let m of necroMinions) {
                if (m.active && m.owner.id !== attacker.id && rectIntersect(b.x, b.y, b.w, b.h, m.x, m.y, m.w, m.h)) {
                    if (b.isPiercing && b.hitIds && b.hitIds.includes(m)) continue;

                    let minionDmg = (b.isAcid || attacker.weapon === 'acid') ? 5 : currentFinalDmg;
                    m.takeDamage(minionDmg);

                    if (!b.hitIds) b.hitIds = [];
                    if (b.isPiercing) {
                        b.hitIds.push(m);
                    } else {
                        attacker.bullets.splice(i, 1); i--; hitNecroMinion = true; break;
                    }
                }
            }
        }
        if (hitNecroMinion) continue;

        // --- 1.5. ĐẶC BIỆT: TƯỜNG SNIPER VÀ THANH NGANG ---
        let hitWall = false;
        let allWalls = [];
        if (typeof sniperWalls !== 'undefined') allWalls.push(...sniperWalls);
        if (typeof movingObstacle !== 'undefined' && movingObstacle && movingObstacle.active) allWalls.push(movingObstacle);
        if (typeof bastions !== 'undefined' && bastions.length > 0) allWalls.push(...bastions);

        for (let w of allWalls) {
            if (w.active && rectIntersect(b.x, b.y, b.w, b.h, w.x, w.y, w.w, w.h)) {
                if (b.isPiercing && b.hitIds && b.hitIds.includes(w)) continue;
                let isOwnEvoWall = (b.owner && w.owner === b.owner && b.owner.hasUpgrade('evo_sniper_1'));

                if (!w.isImmortal) {
                    let dmgToWall = (b.isAcid || attacker.weapon === 'acid') ? 5 : currentFinalDmg;
                    w.hp -= dmgToWall;
                    applyBulletEffectsToStructure(w, b.x, b.y);
                    if (w.hp <= 0) {
                        w.active = false;
                        explosions.push(new Explosion(w.x + w.w / 2, w.y + w.h / 2, 40, 'gray', 0, attacker));
                    }
                } else {
                    // Tường bất tử: vẫn kích hoạt hiệu ứng nổ, băng, axit nhưng ko mất máu
                    applyBulletEffectsToStructure(w, b.x, b.y);
                }

                if (!isOwnEvoWall) {
                    if (!b.hitIds) b.hitIds = [];
                    b.hitIds.push(w);
                }
                if (!b.isPiercing) {
                    attacker.bullets.splice(i, 1); i--; hitWall = true; break;
                }
            }
        }
        if (hitWall) continue;

        // --- 1.6. XE TIỀN (MONEY TRUCKS) VÀ THÙNG GỖ (CRATES) ---
        let hitNeutral = false;
        let neutrals = [];
        if (typeof moneyTrucks !== 'undefined') neutrals.push(...moneyTrucks);
        if (typeof crates !== 'undefined') neutrals.push(...crates);

        for (let n of neutrals) {
            if (n.active && rectIntersect(b.x, b.y, b.w, b.h, n.x, n.y, n.w, n.h)) {
                if (b.isPiercing && b.hitIds && b.hitIds.includes(n)) continue;

                // [FIX LỖI MÁU ÂM VÀ LỖI KHÔNG ĂN ĐƯỢC HỘP TIẾP TẾ]
                if (n.hp !== undefined) {
                    // Xử lý Xe Tiền (Có thanh máu)
                    let truckDmg = (b.isAcid || attacker.weapon === 'acid') ? 3 : currentFinalDmg;
                    n.hp -= truckDmg;
                    applyBulletEffectsToStructure(n, b.x, b.y);

                    if (n.hp <= 0) {
                        n.active = false;
                        let money = 30; if (attacker.weapon === 'money_tank') money *= 2;
                        if (attacker.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                        if (attacker.weapon === 'inventor') {
                            let lkTruck = attacker.hasUpgrade('evo_inv_1') ? 3 : 2;
                            attacker.components = (attacker.components || 0) + lkTruck;
                            addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, `+${lkTruck} LK`, "#00ffcc", 13);
                        }
                        if (attacker.weapon === 'genius') {
                            attacker.gears = (attacker.gears || 0) + 2;
                            addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, "+2 BÁNH RĂNG ⚙️", "#ff9800", 13);
                        }
                        if (attacker.weapon === 'evolution') attacker.onEvolutionCrateEat('truck');
                        explosions.push(new Explosion(n.x + n.w / 2, n.y + n.h / 2, 80, 'rgba(255,215,0,', 5, attacker));
                        handleEntityKilledByAttacker(n, n.x + n.w / 2, n.y + n.h / 2);
                    }
                } else {
                    // Xử lý Hộp Tiếp Tế (Không có máu, 1 hit là nát và nhận quà)
                    n.active = false;
                    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest' && n.id) {
                        if (!onlineManager.guestDestroyedCrates) onlineManager.guestDestroyedCrates = new Set();
                        onlineManager.guestDestroyedCrates.add(n.id);
                    }
                    if (n.isMimic) {
                        triggerMimicExplosion(n, attacker);
                    }
                    if (n.type === 'hp') {
                        if (attacker.weapon === 'necromancer') {
                            let cap = attacker.maxSouls - (attacker.lockedSouls || 0);
                            attacker.currentSouls = Math.min(cap, (attacker.currentSouls || 0) + 4);
                            addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, "+4 LINH HỒN 👻", "#00e676", 13);
                        } else {
                            attacker.hp = Math.min(attacker.hp + 1, attacker.maxHp);
                        }
                    }
                    if (n.type === 'ammo') { attacker.onCollectAmmoCrate(n); }
                    if (n.type === 'shield') { attacker.shield++; }
                    if (n.type === 'dmg') { attacker.dmgBuff++; }
                    if (attacker.weapon === 'evolution') { attacker.onEvolutionCrateEat(n.type); }
                    if (n.type === 'coin') {
                        let money = 30; if (attacker.weapon === 'money_tank') money *= 2;
                        if (attacker.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                    }
                    if (n.type === 'gear') {
                        attacker.ammo = Math.min(attacker.maxAmmo, attacker.ammo + 1);
                        attacker.hp = Math.min(attacker.maxHp, attacker.hp + 0.25);
                        if (attacker.weapon === 'genius') {
                            if (attacker.isPilotingMecha) {
                                if (attacker.mechaHp < attacker.mechaMaxHp) {
                                    attacker.mechaHp = Math.min(attacker.mechaMaxHp, attacker.mechaHp + 0.5);
                                    addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, "+0.5 MECHA HP 🤖", "#ff9800", 12);
                                } else {
                                    attacker.mechaVirtualArmor = (attacker.mechaVirtualArmor || 0) + 0.5;
                                    addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, "+0.5 GIÁP ẢO 🛡️", "#ffd700", 12);
                                }
                            } else {
                                attacker.gears = (attacker.gears || 0) + 1;
                                addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, "+1 BÁNH RĂNG ⚙️", "#ff9800", 12);
                            }
                        }
                    }

                    // Rơi Linh Kiện khi phá Hộp Tiếp Tế (Crate): 1 LK (Evo 1: 2 LK)
                    if (attacker.weapon === 'inventor') {
                        let lkCrate = attacker.hasUpgrade('evo_inv_1') ? 2 : 1;
                        attacker.components = (attacker.components || 0) + lkCrate;
                        addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, `+${lkCrate} LK`, "#00ffcc", 13);
                    }

                    // Genius: +1 Bánh Răng khi nhặt hòm tiếp tế. Nếu đang lái Mecha -> quy đổi thành +0.5 HP/Giáp Ảo
                    if (attacker.weapon === 'genius' && n.type !== 'gear') {
                        if (attacker.isPilotingMecha) {
                            if (attacker.mechaHp < attacker.mechaMaxHp) {
                                attacker.mechaHp = Math.min(attacker.mechaMaxHp, attacker.mechaHp + 0.5);
                                addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, "+0.5 MECHA HP 🤖", "#ff9800", 12);
                            } else {
                                attacker.mechaVirtualArmor = (attacker.mechaVirtualArmor || 0) + 0.5;
                                addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, "+0.5 GIÁP ẢO 🛡️", "#ffd700", 12);
                            }
                        } else {
                            attacker.gears = (attacker.gears || 0) + 1;
                            addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, "+1 BÁNH RĂNG ⚙️", "#ff9800", 12);
                        }
                        attacker.components = (attacker.components || 0) + 0.5;
                        addFloatingText(attacker.x + attacker.w / 2, attacker.y - 27, "+0.5 LINH KIỆN 🔩", "#00e5ff", 11);
                    }

                    // Giáp Hợp Kim: Nhặt Crate nhận Giáp Ảo tồn tại 5s
                    if (attacker.weapon === 'inventor' && attacker.invUpgrades && attacker.invUpgrades['inv_giap']) {
                        attacker.shield = (attacker.shield || 0) + 1;
                        attacker.crateShieldActive = true;
                        attacker.crateShieldExpireTimer = Date.now() + 5000;
                        addFloatingText(attacker.x + attacker.w / 2, attacker.y - 15, "+1 SHIELD (5s)", "#00ffff", 12);
                    }
                    if (n.type === 'boom') {
                        explosions.push(new Explosion(n.x, n.y, 60, 'rgba(255,0,0,', 2, null));
                    } else {
                        explosions.push(new Explosion(n.x, n.y, 30, 'rgba(255,255,255,', 0, attacker));
                    }
                    handleEntityKilledByAttacker(n, n.x + n.w / 2, n.y + n.h / 2);
                }

                if (!b.hitIds) b.hitIds = [];
                b.hitIds.push(n);

                if (!b.isPiercing) {
                    attacker.bullets.splice(i, 1); i--; hitNeutral = true; break;
                }
            }
        }
        if (hitNeutral) continue;


        // --- 2. KIỂM TRA VA CHẠM VỚI PLAYER ---
        if (victim.weapon === 'ghost' && victim.isGhostActive) continue;
// cho mirror
        // ĐỊCH PHÁ ẢNH CHIẾU TAN VỠ (Shattered Clone) CỦA MIRROR
        if (victim.weapon === 'mirror' && victim.shatteredClone && victim.shatteredClone.active) {
            if (rectIntersect(b.x, b.y, b.w, b.h, victim.shatteredClone.x, victim.shatteredClone.y, victim.shatteredClone.w, victim.shatteredClone.h)) {
                victim.shatteredClone.hp -= currentFinalDmg;
                explosions.push(new Explosion(b.x, b.y, 20, 'cyan', 0, attacker));

                if (victim.shatteredClone.hp <= 0) {
                    victim.shatteredClone.active = false;
                    victim.enemyClone.active = false; // Phá vỡ liên kết, ngắt luôn Ảnh Chiếu Kẻ Thù
                    explosions.push(new Explosion(victim.shatteredClone.x + victim.w / 2, victim.shatteredClone.y + victim.h / 2, 80, 'white', 0, attacker));
                    handleEntityKilledByAttacker(victim.shatteredClone, victim.shatteredClone.x + victim.w / 2, victim.shatteredClone.y + victim.h / 2);
                }

                if (!b.isPiercing) { attacker.bullets.splice(i, 1); i--; continue; }
            }
        }
        // ==========================================
        // --- ĐỊCH BẮN TRÚNG PHÂN ẢNH CỦA MAGICIAN ---
        // ==========================================
        let hitIllusion = false;
        if (victim.weapon === 'magician' && victim.illusions.length > 0) {
            for (let j = 0; j < victim.illusions.length; j++) {
                let ill = victim.illusions[j];
                // Phân ảnh đang không tàng hình mới ăn đạn
                if (ill.invisTimer <= 0 && rectIntersect(b.x, b.y, b.w, b.h, ill.x, ill.y, ill.w, ill.h)) {
                    hitIllusion = true;
                    victim.illusions.splice(j, 1); // Xóa bóng

                    // NỘI TẠI 1: BẪY NỔ (Choáng + Phản dame + Khói Làm Chậm 2s)
                    attacker.takeDamage(0.25, victim);
                    attacker.freezeTimer = 60; // Địch bị choáng 1s
                    attacker.slowTimer = Math.max(attacker.slowTimer || 0, 120); // Khói làm chậm 2s
                    explosions.push(new Explosion(ill.x + ill.w / 2, ill.y + ill.h / 2, 60, 'cyan', 0, victim));
                    explosions.push(new Explosion(ill.x + ill.w / 2, ill.y + ill.h / 2, 80, 'rgba(128, 128, 128, 0.7)', 0, victim)); // Khói xám làm chậm

                    // EVO 2: Phá bóng dính 3 stack Suy Yếu
                    if (victim.hasUpgrade('evo_mag_2')) {
                        attacker.vulnerableStacks += 3;
                        if (attacker.vulnerableStacks >= 3) attacker.speedDebuffTimer = 180; // Slow 3s
                    }

                    if (!b.isPiercing) { attacker.bullets.splice(i, 1); i--; break; }
                }
            }
            if (hitIllusion) continue; // Nếu trúng bóng, bỏ qua xét trúng bản thể
        }
        let hitReal = rectIntersect(b.x, b.y, b.w, b.h, victim.x, victim.y, victim.w, victim.h);

        // 1. Check Mirror clone projection
        let hitProjection = false;
        if (!hitReal && attacker.weapon === 'mirror' && attacker.enemyClone && attacker.enemyClone.active) {
            hitProjection = rectIntersect(b.x, b.y, b.w, b.h, attacker.enemyClone.x, attacker.enemyClone.y, attacker.enemyClone.w, attacker.enemyClone.h);
        }

        if (hitProjection) {
            let isFullEvo = attacker.hasUpgrade('evo_mirror_1') && attacker.hasUpgrade('evo_mirror_2');
            let canDamage = true;
            if (isFullEvo && (!attacker.shatteredClone || !attacker.shatteredClone.active)) {
                canDamage = false;
            }

            if (canDamage) {
                let finalDmg = currentFinalDmg * 1.5;
                victim.takeDamage(finalDmg, attacker);
                explosions.push(new Explosion(attacker.enemyClone.x + victim.w / 2, attacker.enemyClone.y + victim.h / 2, 40, 'magenta', 0, attacker));
                explosions.push(new Explosion(victim.x + victim.w / 2, victim.y + victim.h / 2, 40, 'red', 0, attacker));
            }

            if (!b.isPiercing) {
                attacker.bullets.splice(i, 1);
                i--;
            }
            continue;
        }

        // 2. Collision with real player body
        if (hitReal) {
            // Am Duong Su effects
            if (b.isAmChu) {
                let r = attacker.hasUpgrade('evo_ads_1') ? 55 : 40;
                let isFullEvo = attacker.hasUpgrade('evo_ads_1') && attacker.hasUpgrade('evo_ads_2');
                victim.slowTimer = isFullEvo ? 60 : 35; // Giảm mạnh từ 240/120 xuống 60/35 frames (1s / 0.6s)
                iceZones.push(new IceZone(b.x, b.y, r, 90, attacker));
                talismans.push(new Talisman(victim.x, victim.y, 'am', attacker, victim));
            }
            if (b.isDuongChu) {
                let r = attacker.hasUpgrade('evo_ads_1') ? 55 : 40;
                explosions.push(new Explosion(b.x, b.y, r, 'rgba(255, 100, 0,', 1.0, attacker));
                victim.silenceTimer = 35; // Giảm từ 120 (2s) xuống 35 frames (0.6s)
                voidZones.push(new VoidZone(b.x, b.y, r, 90, attacker));
                talismans.push(new Talisman(victim.x, victim.y, 'duong', attacker, victim));
            }

            // Hu Vo Kiem
            if (b.type === 'hu_vo') {
                explosions.push(new Explosion(b.x, b.y, 55, 'purple', 0.5, attacker));
                voidZones.push(new VoidZone(b.x, b.y, 55, 120, attacker));
                if (attacker.hasUpgrade('evo_blade_1')) {
                    attacker.huVoStack = (attacker.huVoStack || 0) + 1;
                    if (attacker.huVoStack >= 3) {
                        victim.takeDamage(999, attacker, { ignoreInvincible: true });
                        attacker.huVoStack = 0;
                        explosions.push(new Explosion(victim.x, victim.y, 150, 'black', 0, attacker));
                    }
                }
            }

            // SĂ¡t thÆ°Æ¡ng & Äƒn mĂ²n Axit (Acid)
            if (b.isAcid) {
                if (victim.weapon !== 'the_strongest') {
                    victim.acidBurnTimer = 180;
                    let erosion = attacker.hasUpgrade('evo_acid_1') ? 2 : 1;
                    victim.maxHp = Math.max(1, victim.maxHp - erosion);
                    victim.hp = Math.min(victim.hp, victim.maxHp);

                    let killThreshold = attacker.hasUpgrade('evo_acid_2') ? 2 : 0;
                    if (killThreshold > 0 && victim.hp <= killThreshold) {
                        victim.takeDamage(999, attacker);
                        explosions.push(new Explosion(victim.x + victim.w / 2, victim.y + victim.h / 2, 80, '#32CD32', 0, attacker));
                    }
                }

                // YĂU Cáº¦U Cá»¦A USER: Acid dame tá»« 0 lĂªn 0.5, vĂ  khi Ä‘á»‘i phÆ°Æ¡ng cĂ³ maxHp <= 1 sáº½ gĂ¢y 4 sĂ¡t thÆ°Æ¡ng!
                let acidDmg = (victim.maxHp <= 1) ? 4.0 : 0.5;
                currentFinalDmg = acidDmg;
            }

            if (b.createAcidZone) iceZones.push(new AcidZone(b.x, b.y, attacker));

            // Magician Stacks
            if (attacker.weapon === 'magician' && attacker.hasUpgrade('evo_mag_2')) {
                victim.vulnerableStacks += 1;
                victim.confusionStacks += 1;
                if (victim.vulnerableStacks >= 3) {
                    victim.slowTimer = Math.max(victim.slowTimer || 0, 180);
                }
            }

            // Damage synthesis
            let finalDmg = currentFinalDmg;

            if (attacker.weapon === 'magician' && attacker.hasUpgrade('evo_mag_2')) {
                finalDmg += (victim.vulnerableStacks * 0.1);
            }

            if (attacker.weapon === 'furnace' || b.inflictBurn) {
                if (attacker.weapon === 'furnace') finalDmg += (0.125 * (victim.burnStacks || 0));

                let bTimer = (attacker.weapon === 'furnace' && attacker.hasUpgrade('evo_furnace_2')) ? 360 : 180;
                victim.burnTimer = bTimer;
                victim.burnStacks = (victim.burnStacks || 0) + 1;

                if (victim.burnStacks >= 3 && attacker.weapon === 'furnace') {
                    victim.takeDamage(5, attacker);
                    victim.burnStacks = 0;
                    explosions.push(new Explosion(victim.x + victim.w / 2, victim.y + victim.h / 2, 80, 'orange', 0, attacker));
                    addFloatingText(victim.x + victim.w / 2, victim.y - 20, "BOOM!", "red", 16);
                }
            }

            // Magnet Polarity Infection on Hit
            if (b.isMagnetBullet) {
                victim.infectedPolarity = b.polarity || attacker.magnetPolarity || 1;
                victim.infectedPolarityTimer = 240;
                addFloatingText(victim.x + victim.w / 2, victim.y - 15, victim.infectedPolarity === 1 ? "NHIỄM TỪ (+)" : "NHIỄM TỪ (-)", victim.infectedPolarity === 1 ? "#ff3300" : "#00aaff", 14);
            }

            // --- DEATH LOCK (TRỐI CHẾT): RÀNG BUỘC (BINDING CURSE) ---
            if (b.isDeathLockBullet || attacker.weapon === 'death_lock') {
                let hasEvo1 = attacker.hasUpgrade && attacker.hasUpgrade('evo_dl_1');
                let hasEvo2 = attacker.hasUpgrade && attacker.hasUpgrade('evo_dl_2');
                let isFullEvo = hasEvo1 && hasEvo2;

                let maxDuration = isFullEvo ? 720 : (hasEvo1 ? 480 : 300); // 12s, 8s, 5s (ticks)
                victim.bindingCurseTimer = maxDuration;
                victim.bindingCurseStacks = (victim.bindingCurseStacks || 0) + 1;

                if (victim.bindingCurseStacks === 1) {
                    let slowAmount = isFullEvo ? 0.5 : 0.3;
                    victim.slowTimer = Math.max(victim.slowTimer || 0, 60);
                    victim.slowFactor = slowAmount;
                    addFloatingText(victim.x + victim.w / 2, victim.y - 15, `RÀNG BUỘC [1] -${Math.round(slowAmount * 100)}% SPD`, "#ba68c8", 12);
                } else if (victim.bindingCurseStacks === 2) {
                    victim.slowTimer = Math.max(victim.slowTimer || 0, 120);
                    victim.slowFactor = 0.5;
                    let silDuration = isFullEvo ? 180 : 120; // 3s vs 2s
                    victim.silenceTimer = Math.max(victim.silenceTimer || 0, silDuration);
                    addFloatingText(victim.x + victim.w / 2, victim.y - 15, `RÀNG BUỘC [2] CÂM LẶNG ${silDuration / 60}s! 🤐`, "#ab47bc", 13);
                } else if (victim.bindingCurseStacks === 3) {
                    victim.freezeTimer = Math.max(victim.freezeTimer || 0, 90); // 1.5s choáng
                    addFloatingText(victim.x + victim.w / 2, victim.y - 15, `RÀNG BUỘC [3] CHOÁNG 1.5s! ⛓️`, "#8e24aa", 14);
                } else if (victim.bindingCurseStacks >= 4) {
                    // Tầng 4 (Kích nổ ấn)
                    victim.bindingCurseStacks = 0;
                    victim.bindingCurseTimer = 0;
                    victim.permanentSlow = (victim.permanentSlow || 0) + 0.2; // -20% vĩnh viễn
                    let vulnBonus = isFullEvo ? 0.5 : 0.25; // +50% vs +25%
                    victim.permanentVulnerability = (victim.permanentVulnerability || 0) + vulnBonus;
                    explosions.push(new Explosion(victim.x + victim.w / 2, victim.y + victim.h / 2, 70, 'rgba(140, 0, 220,', 0.25, attacker));
                    triggerScreenShake(4, 6);
                    addFloatingText(victim.x + victim.w / 2, victim.y - 20, `KÍCH NỔ RÀNG BUỘC! +${Math.round(vulnBonus * 100)}% DMG 💥⛓️`, "#e040fb", 16);
                }
            }

            // Paradox Marks
            if (attacker.weapon === 'paradox' && attacker.hasUpgrade('evo_paradox_1')) {
                let isFullEvo = attacker.hasUpgrade('evo_paradox_2');
                let maxStacks = isFullEvo ? 2 : 3;

                attacker.enemyTimeMarks = (attacker.enemyTimeMarks || 0) + 1;
                explosions.push(new Explosion(victim.x + victim.w / 2, victim.y, 20, 'magenta', 0, attacker));

                if (attacker.enemyTimeMarks >= maxStacks) {
                    attacker.enemyTimeMarks = 0;
                    victim.freezeTimer = 60;
                    attacker.enemyStationaryShadow = { x: victim.x, y: victim.y };
                    explosions.push(new Explosion(victim.x + victim.w / 2, victim.y + victim.h / 2, 80, 'purple', 0, attacker));
                }
            }

            if (attacker.weapon === 'water_gun' && attacker.hasUpgrade('evo_water_2')) victim.slowTimer = 90;

            if (b.isIce) {
                victim.slowTimer = 180;
                if (attacker.hasUpgrade('evo_ice_2')) finalDmg *= 1.5;
                if (attacker.hasUpgrade('evo_ice_1')) {
                    victim.coldStack += 25;
                    let isFullEvo = attacker.hasUpgrade('evo_ice_1') && attacker.hasUpgrade('evo_ice_2');
                    if (isFullEvo && victim.speed > 1.75) {
                        victim.speed = Math.max(1.75, victim.speed - 0.05);
                    }
                    if (victim.coldStack >= 100) {
                        victim.freezeTimer = isFullEvo ? 120 : 30;
                        victim.coldStack = 0;
                        explosions.push(new Explosion(victim.x + victim.w / 2, victim.y + victim.h / 2, 50, '#00ffff', 0, attacker));
                        if (isFullEvo) addFloatingText(victim.x + victim.w / 2, victim.y - 15, "DEEP FREEZE!", "#00ffff", 14);
                    }
                }
            }

            // Unified damage application via takeDamage
            let localApplyDamage = true;
            if (b.isPiercing) {
                if (!b.hitIds) b.hitIds = [];
                if (b.hitIds.includes(victim)) localApplyDamage = false;
                else b.hitIds.push(victim);
            }

            if (localApplyDamage) {
                victim.takeDamage(finalDmg, attacker);

                // --- SHADOW HUNTER BULLET HIT EFFECTS ---
                if (attacker.weapon === 'shadow_hunter' || b.isShadowHunter) {
                    victim.bleedTimer = 60;
                    victim.bleedInterval = 12;
                    victim.bleedDmg = Math.max(0.05, victim.maxHp * 0.02);
                    victim.slowTimer = Math.max(victim.slowTimer || 0, 60);

                    if (b.causesBlind || (attacker.hasUpgrade('evo_sh_1') && b.type === 'shadow_empowered')) {
                        victim.blindTimer = 90;
                        if (typeof addFloatingText === 'function') addFloatingText(victim.x + victim.w / 2, victim.y - 20, "BLINDED! 👁️", "#ff0055", 14);
                    }

                    if (b.causesSilence || attacker.hasUpgrade('evo_sh_2')) {
                        victim.silenceTimer = Math.max(victim.silenceTimer || 0, 90);
                        if (typeof addFloatingText === 'function') addFloatingText(victim.x + victim.w / 2, victim.y - 20, "SILENCED! 🔇", "#8e44ad", 14);
                    }
                }

                // --- SHORTGUN BULLET HIT EFFECTS ---
                if (attacker.weapon === 'shortgunATK' || b.isShortgun) {
                    if (b.isBurn || attacker.hasUpgrade('evo_sg_1')) {
                        victim.burnStacks = (victim.burnStacks || 0) + 2;
                        victim.burnTimer = 180;
                    }
                    if (victim.hp <= 0) {
                        handleEntityKilledByAttacker(victim, victim.x + victim.w / 2, victim.y + victim.h / 2);
                    }
                }

                // Hiệu ứng đạn Drone Không Kích
                if (b.isInventorBullet) {
                    if (b.specialType === 'mortar') {
                        explosions.push(new Explosion(b.x, b.y, 65, 'orange', 1, attacker));
                    } else if (b.specialType === 'ice') {
                        iceZones.push(new IceZone(b.x, b.y, 90, 150, attacker));
                    } else if (b.specialType === 'fire') {
                        victim.burnTimer = 180;
                        victim.burnStacks = (victim.burnStacks || 0) + 1;
                        explosions.push(new Explosion(b.x, b.y, 50, 'red', 1, attacker));
                    }
                    // Nhiễu sóng (Stun 1.5s khi đủ 3 hit)
                    if (attacker.invUpgrades && attacker.invUpgrades['inv_nhieu']) {
                        victim.slowTimer = Math.max(victim.slowTimer || 0, 90);
                        attacker.nhieuSongHits = (attacker.nhieuSongHits || 0) + 1;
                        if (attacker.nhieuSongHits >= 3) {
                            victim.freezeTimer = 90;
                            attacker.nhieuSongHits = 0;
                            addFloatingText(victim.x + victim.w / 2, victim.y - 15, "STUNNED! ⚡", "#00ffcc", 14);
                        }
                    }
                }

                // Hiệu ứng thừa hưởng từ Tăng Cường Hệ Thống cho đạn thường của Nhà Phát Minh
                if (b.isInventorPlayerBullet && attacker.invUpgrades && attacker.invUpgrades['inv_tangcuong']) {
                    if (b.tangCuongSlow || attacker.invUpgrades['inv_bang']) {
                        victim.slowTimer = Math.max(victim.slowTimer || 0, 90);
                    }
                    if (b.tangCuongBurn || attacker.invUpgrades['inv_lua']) {
                        victim.burnTimer = 180;
                        victim.burnStacks = (victim.burnStacks || 0) + 1;
                        explosions.push(new Explosion(b.x, b.y, 35, 'red', 0.5, attacker));
                    }
                    if (b.tangCuongNhieu || attacker.invUpgrades['inv_nhieu']) {
                        victim.slowTimer = Math.max(victim.slowTimer || 0, 60);
                        attacker.nhieuSongHits = (attacker.nhieuSongHits || 0) + 1;
                        if (attacker.nhieuSongHits >= 3) {
                            victim.freezeTimer = 90;
                            attacker.nhieuSongHits = 0;
                            addFloatingText(victim.x + victim.w / 2, victim.y - 15, "STUNNED! ⚡", "#00ffcc", 14);
                        }
                    }
                }

                if (b.isRocket) {
                    let range = attacker.hasUpgrade('evo_rocket_1') ? 100 : 60;
                    let color = attacker.hasUpgrade('evo_rocket_1') ? 'rgba(0, 255, 0,' : 'rgba(255, 100, 0,';
                    explosions.push(new Explosion(b.x, b.y, range, color, 1, attacker));
                    if (attacker.hasUpgrade('evo_rocket_1')) radiationZones.push(new RadiationZone(b.x, b.y));
                }
                if (b.isExplosive) explosions.push(new Explosion(b.x, b.y, 55, 'rgba(255, 0, 255,', 2, attacker));
                if (b.createIceZone) {
                    let radius = (attacker.hasUpgrade('evo_ice_1') && b.isBigIceZone) ? 140 : 100;
                    let duration = (attacker.hasUpgrade('evo_ice_1') && b.isBigIceZone) ? 240 : 120;
                    iceZones.push(new IceZone(b.x, b.y, radius, duration, attacker));
                }
                if (attacker.hasUpgrade('evo_over_1') && b.isFullCharge) {
                    explosions.push(new Explosion(b.x, b.y, 80, 'rgba(0, 255, 255,', 2, attacker));
                }
                if (b.createFireZone) {
                    explosions.push(new Explosion(b.x, b.y, 100, 'red', 3, attacker));
                    radiationZones.push(new RadiationZone(b.x, b.y));
                }
            }

            if (!b.isPiercing) {
                attacker.bullets.splice(i, 1);
                i--;
            }

        if (victim.hp <= 0) {
            triggerFatalCinematic(attacker.id, victim);
            if (attacker.weapon === 'storm' && attacker.hasUpgrade('evo_storm_1') && attacker.hasUpgrade('evo_storm_2')) {
                explosions.push(new Explosion(canvas.width / 2, canvas.height / 2, 300, 'white', 0, attacker));
            }
        }
        }
    }
}
function endRound(winnerId) {
    if (gameState.phase === 'end_round') return;
    // --- LOGIC LỢI TỨC (MỚI) ---
    // Duyệt qua cả 2 người chơi để tính tiền lãi
    [p1, p2].forEach(p => {
        // Đếm số lượng 'Lợi Tức' mà người chơi đã mua
        // p.upgrades lưu danh sách ID, nên mua bao nhiêu cái thì đếm bấy nhiêu
        let interestCount = p.upgrades.filter(u => u === 'interest').length;

        if (interestCount > 0) {
            let profitPerStack = 30; // Mặc định 30 xu

            // Nếu cầm Xe Tiền thì nhân đôi lợi tức
            if (p.weapon === 'money_tank') {
                profitPerStack = 60;
            }

            let totalProfit = interestCount * profitPerStack;

            // Cộng tiền vào game state
            if (p.id === 1) gameState.p1Coins += totalProfit;
            else gameState.p2Coins += totalProfit;

            // (Tùy chọn) Hiệu ứng visual báo nhận tiền lãi
            // Hiển thị text bay lên từ vị trí người chơi
            ctx.fillStyle = "gold";
            ctx.font = "bold 20px Arial";
            ctx.fillText(`+$${totalProfit}`, p.x, p.y - 20);
        }
    });
    // ----------------------------
    gameState.phase = 'end_round';
    cancelAnimationFrame(animationId);

    soundSystem.playWin();
    if (winnerId === 1) { gameState.p1Score++; gameState.p1Coins += 50; gameState.p2Coins += 15; }
    else if (winnerId === 2) { gameState.p2Score++; gameState.p2Coins += 50; gameState.p1Coins += 15; }
    else { gameState.p1Coins += 10; gameState.p2Coins += 10; }

    // Thưởng Linh Kiện (LK) an toàn cho Inventor (Thắng: 4 -> 6 LK, Thua: 2 -> 3 LK)
    let winnerPlayer = (winnerId === 1) ? p1 : ((winnerId === 2) ? p2 : null);
    let loserPlayer = (winnerId === 1) ? p2 : ((winnerId === 2) ? p1 : null);
    if (winnerPlayer && winnerPlayer.weapon === 'inventor') {
        let lkWin = winnerPlayer.hasUpgrade('evo_inv_1') ? 6 : 4;
        winnerPlayer.components = (winnerPlayer.components || 0) + lkWin;
        if (typeof addFloatingText === 'function') addFloatingText(winnerPlayer.x + winnerPlayer.w / 2, winnerPlayer.y - 15, `+${lkWin} LK (THẮNG)`, "#00ffcc", 14);
    }
    if (loserPlayer && loserPlayer.weapon === 'inventor') {
        let lkLoss = loserPlayer.hasUpgrade('evo_inv_1') ? 3 : 2;
        loserPlayer.components = (loserPlayer.components || 0) + lkLoss;
        if (typeof addFloatingText === 'function') addFloatingText(loserPlayer.x + loserPlayer.w / 2, loserPlayer.y - 15, `+${lkLoss} LK (AN ỦI)`, "#00ffcc", 14);
    }
    if (winnerId === 0) {
        [p1, p2].forEach(p => {
            if (p && p.weapon === 'inventor') {
                let lkTie = p.hasUpgrade('evo_inv_1') ? 4 : 3;
                p.components = (p.components || 0) + lkTie;
                if (typeof addFloatingText === 'function') addFloatingText(p.x + p.w / 2, p.y - 15, `+${lkTie} LK (HÒA)`, "#00ffcc", 14);
            }
        });
    }

    // Thưởng vĩnh viễn cho Shortgun Full Evo khi thắng hiệp (+2 Max HP, +1 DMG)
    if (winnerPlayer && winnerPlayer.weapon === 'shortgunATK' && winnerPlayer.hasUpgrade('evo_sg_1') && winnerPlayer.hasUpgrade('evo_sg_2')) {
        winnerPlayer.shortgunBonusMaxHp = (winnerPlayer.shortgunBonusMaxHp || 0) + 2;
        winnerPlayer.shortgunBonusDmg = (winnerPlayer.shortgunBonusDmg || 0) + 1;
        winnerPlayer.maxHp += 2;
        winnerPlayer.hp += 2;
        winnerPlayer.damage += 1;
        if (typeof addFloatingText === 'function') addFloatingText(winnerPlayer.x + winnerPlayer.w / 2, winnerPlayer.y - 15, `+2 MAX HP & +1 DMG!`, "#ff6600", 16);
    }

    updateScoreBoard();

    let targetWins = gameState.winScore || 3;
    if (gameState.p1Score >= targetWins || gameState.p2Score >= targetWins) {
        let winnerName = (gameState.p1Score >= targetWins) ? "PLAYER 1" : "PLAYER 2";
        document.getElementById('finalWinner').innerText = winnerName + " VÔ ĐỊCH!";
        setTimeout(() => {
            document.getElementById('endScreen').style.display = 'block';
        }, 1200);
    } else {
        gameState.round++;
        setTimeout(showUpgradeScreen, 1800);
    }
}

function updateScoreBoard() {
    let targetWins = gameState.winScore || 3;
    const p1Row = document.getElementById('p1-score-row');
    const p2Row = document.getElementById('p2-score-row');
    if (p1Row && p2Row) {
        p1Row.innerHTML = '';
        p2Row.innerHTML = '';
        for (let i = 1; i <= targetWins; i++) {
            const d1 = document.createElement('div');
            d1.id = `p1-s${i}`;
            d1.className = `score-dot ${i <= gameState.p1Score ? 'active-p1' : ''}`;
            p1Row.appendChild(d1);

            const d2 = document.createElement('div');
            d2.id = `p2-s${i}`;
            d2.className = `score-dot ${i <= gameState.p2Score ? 'active-p2' : ''}`;
            p2Row.appendChild(d2);
        }
    }

    const badge = document.getElementById('hudRoundBadge');
    if (badge) {
        let totalRounds = targetWins * 2 - 1;
        badge.innerText = `BO${totalRounds} \u2022 HI\u1EC6P ${gameState.round}`;
    }
    if (typeof triggerRoundIntroBanner === 'function' && gameState.phase === 'playing') {
        triggerRoundIntroBanner();
    }
}

function startBattle() {
    const mainMenu = document.getElementById('mainMenu');
    if (mainMenu) mainMenu.style.display = 'none';
    const endScreen = document.getElementById('endScreen');
    if (endScreen) endScreen.style.display = 'none';
    const pauseModal = document.getElementById('pauseMenuModal');
    if (pauseModal) pauseModal.style.display = 'none';

    gameState.round = 1;
    gameState.p1Score = 0;
    gameState.p2Score = 0;
    gameState.p1Coins = 0;
    gameState.p2Coins = 0;
    gameState.isPaused = false;

    p1 = new Player(1, "#3498db");
    p2 = new Player(2, "#e74c3c");

    thunderPlantedSpears = [];
    magnetNodes = [];
    bastions = [];
    artilleryHazards = [];
    ghostDecoys = [];
    necroMinions = [];
    updateMapHUD();

    updateScoreBoard();
    soundSystem.playPowerup();
    showUpgradeScreen();
}

function setupControls() {
    // Mode Buttons in Main Menu
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.winScore = parseInt(btn.dataset.wins) || 3;
            updateScoreBoard();
            if (!soundSystem.muted) soundSystem.playCoin();
        });
    });

    // Map Buttons in Main Menu
    document.querySelectorAll('.map-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.selectedMapMode = btn.dataset.map || 'classic';
            gameState.currentMap = gameState.selectedMapMode;
            if (typeof updateMapHUD === 'function') updateMapHUD();
            if (soundSystem && !soundSystem.muted) soundSystem.playCoin();
        });
    });

    // Start Battle Button
    const startBtn = document.getElementById('startBattleBtn');
    if (startBtn) startBtn.addEventListener('click', startBattle);

    // Sound Toggles
    const updateSoundUI = () => {
        const icon = soundSystem.muted ? '\u{1F507}' : '\u{1F50A}';
        const txt = soundSystem.muted ? 'T\u1EAET' : 'B\u1EACT';
        const menuSoundBtn = document.getElementById('menuSoundToggleBtn');
        if (menuSoundBtn) menuSoundBtn.innerText = `${icon} \u00C2M THANH: SFX ${txt}`;
        const hudSoundText = document.getElementById('soundText');
        if (hudSoundText) hudSoundText.innerText = soundSystem.muted ? 'OFF' : 'SFX';
        const hudSoundIcon = document.getElementById('soundIcon');
        if (hudSoundIcon) hudSoundIcon.innerText = icon;
    };

    const toggleSound = () => {
        soundSystem.muted = !soundSystem.muted;
        if (!soundSystem.muted) soundSystem.playCoin();
        updateSoundUI();
    };

    const menuSoundBtn = document.getElementById('menuSoundToggleBtn');
    if (menuSoundBtn) menuSoundBtn.addEventListener('click', toggleSound);
    const soundBtn = document.getElementById('soundToggleBtn');
    if (soundBtn) soundBtn.addEventListener('click', toggleSound);
    updateSoundUI();

    // Guide Modal
    const guideModal = document.getElementById('guideModal');
    const openGuide = () => { if (guideModal) guideModal.style.display = 'flex'; };
    const closeGuide = () => { if (guideModal) guideModal.style.display = 'none'; };

    const openGuideBtn = document.getElementById('openGuideBtn');
    if (openGuideBtn) openGuideBtn.addEventListener('click', openGuide);
    const openGuideFromPause = document.getElementById('openGuideFromPauseBtn');
    if (openGuideFromPause) openGuideFromPause.addEventListener('click', openGuide);
    const closeGuideBtn = document.getElementById('closeGuideBtn');
    if (closeGuideBtn) closeGuideBtn.addEventListener('click', closeGuide);
    const guideGotItBtn = document.getElementById('guideGotItBtn');
    if (guideGotItBtn) guideGotItBtn.addEventListener('click', closeGuide);

    // Pause / In-Game Menu Modal
    const pauseModal = document.getElementById('pauseMenuModal');
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', () => {
            gameState.isPaused = true;
            if (pauseModal) pauseModal.style.display = 'flex';
        });
    }

    const resumeBtn = document.getElementById('resumeBtn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
            gameState.isPaused = false;
            if (pauseModal) pauseModal.style.display = 'none';
        });
    }

    const restartCurrentBtn = document.getElementById('restartCurrentMatchBtn');
    if (restartCurrentBtn) {
        restartCurrentBtn.addEventListener('click', () => {
            if (pauseModal) pauseModal.style.display = 'none';
            gameState.isPaused = false;
            startBattle();
        });
    }

    const backToMenu = () => {
        if (typeof botAI !== 'undefined') botAI.enabled = false;
        if (typeof onlineManager !== 'undefined') onlineManager.leaveRoom();
        const tb = document.getElementById('trainingToolbar');
        if (tb) tb.style.display = 'none';
        const botModal = document.getElementById('botWeaponModal');
        if (botModal) botModal.style.display = 'none';
        const p2Controls = document.getElementById('p2-controls');
        if (p2Controls) p2Controls.style.display = 'flex';
        const p1Label = document.querySelector('.p1-tag');
        if (p1Label) p1Label.innerHTML = '🔵 PLAYER 1 (BLUE)';
        if (pauseModal) pauseModal.style.display = 'none';
        const endScreen = document.getElementById('endScreen');
        if (endScreen) endScreen.style.display = 'none';
        const upgradeScreen = document.getElementById('upgradeScreen');
        if (upgradeScreen) upgradeScreen.style.display = 'none';
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) mainMenu.style.display = 'flex';
        gameState.phase = 'menu';
        gameState.isPaused = false;
        cancelAnimationFrame(animationId);
    };

    const backToMenuBtn = document.getElementById('backToMainMenuBtn');
    if (backToMenuBtn) backToMenuBtn.addEventListener('click', backToMenu);
    const backFromEndBtn = document.getElementById('backToMenuFromEndBtn');
    if (backFromEndBtn) backFromEndBtn.addEventListener('click', backToMenu);

    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) restartBtn.addEventListener('click', startBattle);

    // Touch and Mouse Input Handling
    function handleInput(p, action, pressed) {
        if (p === 'p2' && typeof botAI !== 'undefined' && botAI.enabled) return;

        // In Online Mode as Guest: map bottom controls directly to P2
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') {
            if (action === 'left') {
                inputs.p2.r = pressed; // Screen Left -> World +X (Left from inverted view)
            } else if (action === 'right') {
                inputs.p2.l = pressed; // Screen Right -> World -X (Right from inverted view)
            } else if (action === 'shoot') {
                inputs.p2.s = pressed;
            }
            if (onlineManager.conn && onlineManager.conn.open) {
                onlineManager.conn.send({ type: 'INPUT', input: inputs.p2 });
            }
            if (pressed && action === 'shoot' && gameState.phase === 'upgrade') {
                handlePlayerReady('p2');
                if (onlineManager.conn && onlineManager.conn.open) {
                    onlineManager.conn.send({ type: 'READY', pid: 'p2' });
                }
            }
            return;
        }

        // In Online Mode as Host:
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'host') {
            if (p === 'p1') {
                inputs.p1[action === 'left' ? 'l' : (action === 'right' ? 'r' : 's')] = pressed;
                if (onlineManager.conn && onlineManager.conn.open) {
                    onlineManager.conn.send({ type: 'HOST_INPUT', input: inputs.p1 });
                }
                if (pressed && action === 'shoot' && gameState.phase === 'upgrade') {
                    handlePlayerReady('p1');
                    if (onlineManager.conn && onlineManager.conn.open) {
                        onlineManager.conn.send({ type: 'READY', pid: 'p1' });
                    }
                }
            }
            return;
        }

        if (pressed && action === 'shoot' && gameState.phase === 'upgrade') {
            handlePlayerReady(p);
        }
        if (p === 'p1') inputs.p1[action === 'left' ? 'l' : (action === 'right' ? 'r' : 's')] = pressed;
        if (p === 'p2') inputs.p2[action === 'left' ? 'l' : (action === 'right' ? 'r' : 's')] = pressed;
    }

    let lastTouchActionTimestamp = 0;
    document.querySelectorAll('.btn').forEach(btn => {
        const p = btn.dataset.p; const a = btn.dataset.a;
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            lastTouchActionTimestamp = Date.now();
            btn.classList.add('pressed');
            if (navigator.vibrate) { try { navigator.vibrate(12); } catch(err) {} }
            handleInput(p, a, true);
        }, { passive: false });
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            lastTouchActionTimestamp = Date.now();
            btn.classList.remove('pressed');
            handleInput(p, a, false);
        });
        btn.addEventListener('mousedown', () => {
            if (Date.now() - lastTouchActionTimestamp < 500) return; // Chống double input do touch sinh ra mousedown
            btn.classList.add('pressed');
            handleInput(p, a, true);
        });
        btn.addEventListener('mouseup', () => {
            if (Date.now() - lastTouchActionTimestamp < 500) return;
            btn.classList.remove('pressed');
            handleInput(p, a, false);
        });
        btn.addEventListener('mouseleave', () => {
            if (Date.now() - lastTouchActionTimestamp < 500) return;
            btn.classList.remove('pressed');
            handleInput(p, a, false);
        });
    });

    window.addEventListener('resize', updateCanvasDimensions);

    // Click/Tap on Mecha to cycle modes (Mobile / Touch friendly)
    canvas.addEventListener('pointerdown', (e) => {
        if (gameState.phase !== 'playing') return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;

        let myPlayer = (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') ? p2 : p1;
        if (myPlayer && myPlayer.weapon === 'genius' && myPlayer.isPilotingMecha) {
            if (Math.abs(clickX - (myPlayer.x + myPlayer.w / 2)) < 60 && Math.abs(clickY - (myPlayer.y + myPlayer.h / 2)) < 60) {
                myPlayer.cycleMechaMode();
            }
        }
    });

    // Keyboard controls for PC
    window.addEventListener('keydown', (e) => {
        if (e.repeat) return; // FIX DOUBLE INPUT TỪ OS KEYBOARD AUTO-REPEAT
        if (gameState.phase === 'upgrade') {
            if (e.key === 's' || e.key === 'S' || e.key === ' ') {
                if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') {
                    handlePlayerReady('p2');
                    if (onlineManager.conn && onlineManager.conn.open) onlineManager.conn.send({ type: 'READY', pid: 'p2' });
                } else {
                    handlePlayerReady('p1');
                    if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.conn && onlineManager.conn.open) {
                        onlineManager.conn.send({ type: 'READY', pid: 'p1' });
                    }
                }
            }
            if ((e.key === 'ArrowDown' || e.key === 'Enter') && (!botAI || !botAI.enabled) && (!onlineManager || !onlineManager.isOnline)) {
                handlePlayerReady('p2');
            }
        }

        // Online mode for Guest: PC keyboard (A/D/S/Space or Arrows) maps to P2
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') {
            let changed = false;
            if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') { inputs.p2.r = true; changed = true; }
            if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') { inputs.p2.l = true; changed = true; }
            if (e.key === 's' || e.key === 'S' || e.key === 'w' || e.key === 'W' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
                inputs.p2.s = true; changed = true;
            }
            if (changed && onlineManager.conn && onlineManager.conn.open) {
                onlineManager.conn.send({ type: 'INPUT', input: inputs.p2 });
            }
            return;
        }

        // P1 Controls: A / D / S / W / Space
        if (e.key === 'a' || e.key === 'A') inputs.p1.l = true;
        if (e.key === 'd' || e.key === 'D') inputs.p1.r = true;
        if (e.key === 's' || e.key === 'S' || e.key === 'w' || e.key === 'W' || e.key === ' ') inputs.p1.s = true;

        // Online mode for Host: Send host inputs
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'host') {
            if (onlineManager.conn && onlineManager.conn.open) {
                onlineManager.conn.send({ type: 'HOST_INPUT', input: inputs.p1 });
            }
            return;
        }

        // P2 Controls: Left / Right / Down / Up / Enter (Vô hiệu hóa khi bật Bot hoặc chơi Online)
        if ((typeof botAI === 'undefined' || !botAI.enabled) && (typeof onlineManager === 'undefined' || !onlineManager.isOnline)) {
            if (e.key === 'ArrowLeft') inputs.p2.l = true;
            if (e.key === 'ArrowRight') inputs.p2.r = true;
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') inputs.p2.s = true;
        }

        // Mecha Mode Switching for Genius (Keys 1-5, Q, E)
        if (['1', '2', '3', '4', '5'].includes(e.key)) {
            let mNum = parseInt(e.key);
            if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') {
                if (p2.weapon === 'genius' && p2.isPilotingMecha) p2.cycleMechaMode(mNum);
            } else {
                if (p1.weapon === 'genius' && p1.isPilotingMecha) p1.cycleMechaMode(mNum);
            }
        }
        if (e.key === 'q' || e.key === 'Q') {
            if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') {
                if (p2.weapon === 'genius' && p2.isPilotingMecha) p2.cycleMechaMode((p2.mechaMode === 1 ? 5 : p2.mechaMode - 1));
            } else {
                if (p1.weapon === 'genius' && p1.isPilotingMecha) p1.cycleMechaMode((p1.mechaMode === 1 ? 5 : p1.mechaMode - 1));
            }
        }
        if (e.key === 'e' || e.key === 'E') {
            if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') {
                if (p2.weapon === 'genius' && p2.isPilotingMecha) p2.cycleMechaMode();
            } else {
                if (p1.weapon === 'genius' && p1.isPilotingMecha) p1.cycleMechaMode();
            }
        }
        if ((typeof botAI === 'undefined' || !botAI.enabled) && (typeof onlineManager === 'undefined' || !onlineManager.isOnline)) {
            if (p2.weapon === 'genius' && p2.isPilotingMecha) {
                if (['Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Numpad5'].includes(e.code)) {
                    p2.cycleMechaMode(parseInt(e.code.replace('Numpad', '')));
                } else if (['6', '7', '8', '9', '0'].includes(e.key)) {
                    let map = {'6': 1, '7': 2, '8': 3, '9': 4, '0': 5};
                    p2.cycleMechaMode(map[e.key]);
                } else if (e.key === 'o' || e.key === 'O') {
                    p2.cycleMechaMode((p2.mechaMode === 1 ? 5 : p2.mechaMode - 1));
                } else if (e.key === 'p' || e.key === 'P') {
                    p2.cycleMechaMode();
                }
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') {
            let changed = false;
            if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') { inputs.p2.r = false; changed = true; }
            if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') { inputs.p2.l = false; changed = true; }
            if (e.key === 's' || e.key === 'S' || e.key === 'w' || e.key === 'W' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
                inputs.p2.s = false; changed = true;
            }
            if (changed && onlineManager.conn && onlineManager.conn.open) {
                onlineManager.conn.send({ type: 'INPUT', input: inputs.p2 });
            }
            return;
        }

        if (e.key === 'a' || e.key === 'A') inputs.p1.l = false;
        if (e.key === 'd' || e.key === 'D') inputs.p1.r = false;
        if (e.key === 's' || e.key === 'S' || e.key === 'w' || e.key === 'W' || e.key === ' ') inputs.p1.s = false;

        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'host') {
            if (onlineManager.conn && onlineManager.conn.open) {
                onlineManager.conn.send({ type: 'HOST_INPUT', input: inputs.p1 });
            }
            return;
        }

        if ((typeof botAI === 'undefined' || !botAI.enabled) && (typeof onlineManager === 'undefined' || !onlineManager.isOnline)) {
            if (e.key === 'ArrowLeft') inputs.p2.l = false;
            if (e.key === 'ArrowRight') inputs.p2.r = false;
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') inputs.p2.s = false;
        }
    });
}

// ============================================================================
// BOT TEST / PRACTICE MODE CONTROLLER (DUMMY, SHOOTER, COMBAT, GODMODE, BODY)
// ============================================================================
class BotAIController {
    constructor() {
        this.enabled = false;
        this.mode = 'dummy'; // 'dummy' | 'shooter' | 'combat'
        this.isGodMode = false;
        this.timer = 0;
        this.shootCycle = 0;
    }

    setMode(mode) {
        this.mode = mode;
        this.updateToolbarUI();
        if (soundSystem && !soundSystem.muted) soundSystem.playClick();
        if (p2) {
            const modeNames = { dummy: 'BAO CÁT (DUMMY)', shooter: 'CHỈ BẮN (SHOOTER)', combat: 'CHIẾN ĐẤU (COMBAT)' };
            addFloatingText(p2.x + p2.w / 2, p2.y + p2.h + 12, modeNames[mode] || mode, "#00f0ff", 14);
        }
    }

    toggleGodMode() {
        this.isGodMode = !this.isGodMode;
        this.updateToolbarUI();
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
        if (p2) {
            addFloatingText(p2.x + p2.w / 2, p2.y + p2.h + 12, this.isGodMode ? "BẤT TỬ: BẬT 🛡️" : "BẤT TỬ: TẮT", this.isGodMode ? "#ffd700" : "#ef4444", 14);
        }
    }

    healAll() {
        if (p1) {
            p1.hp = p1.maxHp;
            p1.shield = Math.max(p1.shield, 1);
            addFloatingText(p1.x + p1.w / 2, p1.y - 15, "+FULL HP", "#2ecc71", 15);
        }
        if (p2) {
            p2.hp = p2.maxHp;
            p2.shield = Math.max(p2.shield, 1);
            addFloatingText(p2.x + p2.w / 2, p2.y + p2.h + 12, "+FULL HP", "#2ecc71", 15);
        }
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    }

    addCoins() {
        gameState.p1Coins += 100;
        gameState.p2Coins += 100;
        if (soundSystem && !soundSystem.muted) soundSystem.playCoin();
        if (p1) addFloatingText(p1.x + p1.w / 2, p1.y - 15, "+$100", "#f1c40f", 15);
        if (p2) addFloatingText(p2.x + p2.w / 2, p2.y + p2.h + 12, "+$100", "#f1c40f", 15);
    }

    changeBotWeapon(bodyId) {
        if (!p2) return;
        const mod = MODULES.BODY.find(m => m.id === bodyId);
        if (!mod) return;

        // Xóa các vũ khí cũ của Bot
        const bodyIds = MODULES.BODY.map(m => m.id);
        p2.upgrades = p2.upgrades.filter(u => !bodyIds.includes(u));
        p2.upgrades.push(bodyId);

        const curX = p2.x;
        const curY = p2.y;
        p2.setupForNewRound();
        p2.x = curX;
        p2.y = curY;
        p2.hp = p2.maxHp;
        p2.bullets = [];
        p2.bowChargeTimer = 0;
        p2.sukunaChargeTimer = 0;
        p2.lazerCharge = 0;
        p2.overloadCharge = 0;
        p2.mirrorCharge = 0;
        inputs.p2.l = false;
        inputs.p2.r = false;
        inputs.p2.s = false;

        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
        addFloatingText(p2.x + p2.w / 2, p2.y + p2.h + 15, `BODY: ${mod.name}`, "#00f0ff", 16);
        this.renderBotWeaponModal();
        this.closeBotWeaponModal();
    }

    changePlayerWeapon(bodyId) {
        if (!p1) return;
        const mod = MODULES.BODY.find(m => m.id === bodyId);
        if (!mod) return;

        // Xóa các vũ khí cũ của Người chơi (Player 1)
        const bodyIds = MODULES.BODY.map(m => m.id);
        p1.upgrades = p1.upgrades.filter(u => !bodyIds.includes(u));
        p1.upgrades.push(bodyId);

        const curX = p1.x;
        const curY = p1.y;
        p1.setupForNewRound();
        p1.x = curX;
        p1.y = curY;
        p1.hp = p1.maxHp;
        p1.bullets = [];
        p1.bowChargeTimer = 0;
        p1.sukunaChargeTimer = 0;
        p1.lazerCharge = 0;
        p1.overloadCharge = 0;
        p1.mirrorCharge = 0;
        inputs.p1.l = false;
        inputs.p1.r = false;
        inputs.p1.s = false;

        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
        addFloatingText(p1.x + p1.w / 2, p1.y - 20, `BODY BẠN: ${mod.name} ⭐`, "#2ecc71", 16);
        this.renderBotWeaponModal();
        this.closeBotWeaponModal();
    }

    update(bot, player) {
        if (!this.enabled || !bot || !player || gameState.phase !== 'playing') {
            return;
        }

        this.timer++;

        // 1. Chế độ Dummy (Đứng yên làm bao cát)
        if (this.mode === 'dummy') {
            inputs.p2.l = false;
            inputs.p2.r = false;
            inputs.p2.s = false;
            return;
        }

        // 2. Chế độ Shooter (Chỉ bắn theo nhịp đều đặn, di chuyển bám trục)
        if (this.mode === 'shooter') {
            const botCenterX = bot.x + bot.w / 2;
            const playerCenterX = player.x + player.w / 2;

            if (botCenterX < playerCenterX - 45) {
                inputs.p2.r = true; inputs.p2.l = false;
            } else if (botCenterX > playerCenterX + 45) {
                inputs.p2.l = true; inputs.p2.r = false;
            } else {
                inputs.p2.l = false; inputs.p2.r = false;
            }

            // Nhịp bắn: Chu kỳ 60 frames (~1s), nhấn giữ 18 frames rồi nhả
            this.shootCycle = (this.shootCycle + 1) % 60;
            inputs.p2.s = (this.shootCycle < 18);
            return;
        }

        // 3. Chế độ Combat (Chiến đấu linh hoạt: Né đạn, lượm rương, ngắm bắn)
        if (this.mode === 'combat') {
            const botCenterX = bot.x + bot.w / 2;
            const playerCenterX = player.x + player.w / 2;

            // A. Tránh né đạn nguy hiểm bay về phía Bot
            let incomingDanger = null;
            let minDist = 220;
            if (player.bullets && player.bullets.length > 0) {
                for (let b of player.bullets) {
                    if (!b.active) continue;
                    let vy = (b.vy !== undefined) ? b.vy : -5;
                    if (vy < 0 && b.y > bot.y && b.y < bot.y + minDist) {
                        let dx = Math.abs((b.x || 0) - botCenterX);
                        if (dx < 50) {
                            incomingDanger = b;
                            break;
                        }
                    }
                }
            }

            if (incomingDanger) {
                if (incomingDanger.x < botCenterX) {
                    inputs.p2.r = true; inputs.p2.l = false;
                } else {
                    inputs.p2.l = true; inputs.p2.r = false;
                }
                inputs.p2.s = (Math.abs(botCenterX - playerCenterX) < 70);
                return;
            }

            // B. Nhặt rương hoặc Xe Tiền gần
            let closestCrate = null;
            let crateDist = 200;
            for (let c of crates) {
                if (!c.active) continue;
                let dy = Math.abs(c.y - bot.y);
                if (dy < 140) {
                    let dx = Math.abs(c.x + c.w / 2 - botCenterX);
                    if (dx < crateDist) {
                        crateDist = dx;
                        closestCrate = c;
                    }
                }
            }

            if (closestCrate) {
                let targetX = closestCrate.x + closestCrate.w / 2;
                if (botCenterX < targetX - 15) {
                    inputs.p2.r = true; inputs.p2.l = false;
                } else if (botCenterX > targetX + 15) {
                    inputs.p2.l = true; inputs.p2.r = false;
                } else {
                    inputs.p2.l = false; inputs.p2.r = false;
                }
                inputs.p2.s = (Math.abs(botCenterX - playerCenterX) < 70);
                return;
            }

            // C. Di chuyển chiến đấu và nhắm bắn
            let strafe = Math.sin(this.timer * 0.05) * 60;
            let desiredX = playerCenterX + strafe;

            if (botCenterX < desiredX - 20) {
                inputs.p2.r = true; inputs.p2.l = false;
            } else if (botCenterX > desiredX + 20) {
                inputs.p2.l = true; inputs.p2.r = false;
            } else {
                inputs.p2.l = false; inputs.p2.r = false;
            }

            let alignDist = Math.abs(botCenterX - playerCenterX);
            if (alignDist < 80) {
                this.shootCycle = (this.shootCycle + 1) % 45;
                inputs.p2.s = (this.shootCycle < 25);
            } else {
                inputs.p2.s = false;
            }
        }
    }

    updateToolbarUI() {
        const btnDummy = document.getElementById('btnBotDummy');
        const btnShooter = document.getElementById('btnBotShooter');
        const btnCombat = document.getElementById('btnBotCombat');
        const btnGod = document.getElementById('btnBotGodMode');

        if (btnDummy) btnDummy.classList.toggle('active', this.mode === 'dummy');
        if (btnShooter) btnShooter.classList.toggle('active', this.mode === 'shooter');
        if (btnCombat) btnCombat.classList.toggle('active', this.mode === 'combat');

        if (btnGod) {
            btnGod.classList.toggle('active-god', this.isGodMode);
            btnGod.innerText = this.isGodMode ? '🛡️ BẤT TỬ: BẬT' : '🛡️ BẤT TỬ: TẮT';
        }
    }

    toggleToolbar() {
        const toolbar = document.getElementById('trainingToolbar');
        const btn = document.getElementById('btnToggleTrainingToolbar');
        if (!toolbar || !btn) return;
        toolbar.classList.toggle('collapsed');
        btn.innerText = toolbar.classList.contains('collapsed') ? '▸' : '▾';
    }

    openPlayerWeaponModal() {
        this.modalTarget = 'player';
        const title = document.getElementById('weaponModalTitle');
        if (title) title.innerText = '👤 CHỌN BODY CHO BẠN (34 BODY)';
        const hint = document.getElementById('weaponModalHint');
        if (hint) hint.innerText = 'Chọn 1 Body dưới đây để xe của bạn (Player 1) trang bị thử nghiệm ngay:';
        this.openWeaponModalCommon();
    }

    openBotWeaponModal() {
        this.modalTarget = 'bot';
        const title = document.getElementById('weaponModalTitle');
        if (title) title.innerText = '🤖 CHỌN BODY CHO BOT (34 BODY)';
        const hint = document.getElementById('weaponModalHint');
        if (hint) hint.innerText = 'Chọn 1 Body dưới đây để Bot trang bị chiến đấu hoặc làm bia thử nghiệm:';
        this.openWeaponModalCommon();
    }

    openWeaponModalCommon() {
        const modal = document.getElementById('botWeaponModal');
        if (modal) {
            modal.style.display = 'flex';
            this.renderBotWeaponModal();
        }
    }

    closeBotWeaponModal() {
        const modal = document.getElementById('botWeaponModal');
        if (modal) modal.style.display = 'none';
    }

    renderBotWeaponModal() {
        const grid = document.getElementById('botWeaponGrid');
        if (!grid) return;
        grid.innerHTML = '';

        const targetPlayer = (this.modalTarget === 'player') ? p1 : p2;
        const currentWeapon = targetPlayer ? targetPlayer.weapon : 'basic';

        MODULES.BODY.forEach(mod => {
            const item = document.createElement('div');
            item.className = 'bot-weapon-item' + (mod.id === currentWeapon ? ' current' : '');
            const statsText = mod.stats ? `HP:${mod.stats.hp} | Dame:${mod.stats.dmg} | Đạn:${mod.stats.ammo}` : '';
            item.innerHTML = `
                <div class="bwi-name">${mod.name}</div>
                <div class="bwi-stats">${statsText}</div>
                <div class="bwi-desc">${mod.desc || ''}</div>
            `;
            item.onclick = () => {
                if (this.modalTarget === 'player') {
                    this.changePlayerWeapon(mod.id);
                } else {
                    this.changeBotWeapon(mod.id);
                }
            };
            grid.appendChild(item);
        });
    }

    startPractice() {
        this.enabled = true;
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) {
            mainMenu.style.display = 'none';
            mainMenu.classList.remove('active');
        }
        const toolbar = document.getElementById('trainingToolbar');
        if (toolbar) toolbar.style.display = 'flex';

        this.updateToolbarUI();
        startBattle();
    }

    exitPractice() {
        this.enabled = false;
        const toolbar = document.getElementById('trainingToolbar');
        if (toolbar) toolbar.style.display = 'none';
        this.closeBotWeaponModal();

        const pauseModal = document.getElementById('pauseMenuModal');
        if (pauseModal) pauseModal.style.display = 'none';
        const endScreen = document.getElementById('endScreen');
        if (endScreen) endScreen.style.display = 'none';
        const upgradeScreen = document.getElementById('upgradeScreen');
        if (upgradeScreen) upgradeScreen.style.display = 'none';
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) mainMenu.style.display = 'flex';
        gameState.phase = 'menu';
        gameState.isPaused = false;
        cancelAnimationFrame(animationId);
    }

    initEvents() {
        const openPracticeBtn = document.getElementById('openPracticeBtn');
        if (openPracticeBtn) {
            openPracticeBtn.addEventListener('click', () => this.startPractice());
        }

        const btnToggle = document.getElementById('btnToggleTrainingToolbar');
        if (btnToggle) btnToggle.addEventListener('click', () => this.toggleToolbar());

        const btnDummy = document.getElementById('btnBotDummy');
        if (btnDummy) btnDummy.addEventListener('click', () => this.setMode('dummy'));

        const btnShooter = document.getElementById('btnBotShooter');
        if (btnShooter) btnShooter.addEventListener('click', () => this.setMode('shooter'));

        const btnCombat = document.getElementById('btnBotCombat');
        if (btnCombat) btnCombat.addEventListener('click', () => this.setMode('combat'));

        const btnGod = document.getElementById('btnBotGodMode');
        if (btnGod) btnGod.addEventListener('click', () => this.toggleGodMode());

        const btnOpenPlayerModal = document.getElementById('btnOpenPlayerWeaponModal');
        if (btnOpenPlayerModal) btnOpenPlayerModal.addEventListener('click', () => this.openPlayerWeaponModal());

        const btnOpenModal = document.getElementById('btnOpenBotWeaponModal');
        if (btnOpenModal) btnOpenModal.addEventListener('click', () => this.openBotWeaponModal());

        const btnCloseModal = document.getElementById('closeBotWeaponBtn');
        if (btnCloseModal) btnCloseModal.addEventListener('click', () => this.closeBotWeaponModal());

        const btnCloseFooter = document.getElementById('closeBotWeaponFooterBtn');
        if (btnCloseFooter) btnCloseFooter.addEventListener('click', () => this.closeBotWeaponModal());

        const btnHeal = document.getElementById('btnHealAll');
        if (btnHeal) btnHeal.addEventListener('click', () => this.healAll());

        const btnAddCoin = document.getElementById('btnAddCoins');
        if (btnAddCoin) btnAddCoin.addEventListener('click', () => this.addCoins());

        const btnExit = document.getElementById('btnExitPractice');
        if (btnExit) btnExit.addEventListener('click', () => this.exitPractice());
    }
}
const botAI = new BotAIController();

// ============================================================================
// ONLINE MULTIPLAYER MANAGER (WEBRTC PEERJS P2P & .IO MATCHMAKING ARCHITECTURE)
// ============================================================================
const PEER_CONFIG = {
    debug: 1,
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
        ]
    }
};

class OnlineMultiplayerManager {
    constructor() {
        this.isOnline = false;
        this.role = null; // 'host' (P1 Xanh) | 'guest' (P2 Đỏ)
        this.roomCode = null; // e.g. "CY-A1B2C"
        this.myPeerId = null;
        this.peer = null;
        this.connections = {}; // for Host: { peerId: DataConnection }
        this.hostConn = null;  // for Guest: DataConnection
        this.broadcastChannel = null;
        this.playersLobbyData = [];
        this.isJoinedSuccess = false;
        this.joinTimeoutTimer = null;
        this.pingMs = 20;
        this.pingTimer = null;
        this.isQuickMatch = false;
    }

    get conn() {
        const hasOpenConn = (this.hostConn && this.hostConn.open) || 
                            Object.values(this.connections).some(c => c && c.open) ||
                            (this.broadcastChannel !== null);
        return {
            open: hasOpenConn,
            send: (data) => this.sendNetworkMessage(data)
        };
    }

    generateRoomCode() {
        return Math.random().toString(36).substring(2, 7).toUpperCase();
    }

    setupLocalBroadcastChannel(code) {
        try {
            if (this.broadcastChannel) {
                try { this.broadcastChannel.close(); } catch(e){}
            }
            this.broadcastChannel = new BroadcastChannel('CYBER_ROOM_' + code);
            this.broadcastChannel.onmessage = (event) => {
                const { senderId, payload } = event.data || {};
                if (!payload || senderId === this.myPeerId) return;

                if (this.role === 'host') {
                    this.handleHostReceivedData(senderId, payload);
                } else {
                    this.handleClientReceivedData(payload);
                }
            };
        } catch (e) {
            console.warn("BroadcastChannel error:", e);
        }
    }

    sendNetworkMessage(payload) {
        // 1. Send to local broadcast channel (for same-machine multi-tab/window testing)
        if (this.broadcastChannel) {
            try {
                this.broadcastChannel.postMessage({ senderId: this.myPeerId, payload });
            } catch (e) {}
        }
        // 2. Send to PeerJS WebRTC DataConnections (for cross-device online play)
        if (this.role === 'host') {
            Object.values(this.connections).forEach(c => {
                try { if (c && c.open) c.send(payload); } catch(e){}
            });
        } else if (this.hostConn && this.hostConn.open) {
            try { this.hostConn.send(payload); } catch(e){}
        }
    }

    initUI() {
        const openOnlineBtn = document.getElementById('openOnlineBtn');
        const onlineModal = document.getElementById('onlineModal');
        const closeOnlineBtn = document.getElementById('closeOnlineBtn');
        const tabCreateRoom = document.getElementById('tabCreateRoom');
        const tabJoinRoom = document.getElementById('tabJoinRoom');
        const tabQuickMatch = document.getElementById('tabQuickMatch');
        const btnGenerateRoom = document.getElementById('btnGenerateRoom');
        const btnJoinRoomAction = document.getElementById('btnJoinRoomAction');
        const joinRoomInput = document.getElementById('joinRoomInput');
        const btnStartQuickMatch = document.getElementById('btnStartQuickMatch');
        const btnCopyRoomCode = document.getElementById('btnCopyRoomCode');
        const btnStartOnlineMatch = document.getElementById('btnStartOnlineMatch');
        const btnLeaveOnlineRoom = document.getElementById('btnLeaveOnlineRoom');

        if (!openOnlineBtn || !onlineModal) return;

        openOnlineBtn.addEventListener('click', () => {
            if (soundSystem && !soundSystem.muted) soundSystem.playClick();
            onlineModal.style.display = 'flex';
            onlineModal.classList.add('active');
            this.switchTab('create');
        });

        closeOnlineBtn.addEventListener('click', () => {
            if (soundSystem && !soundSystem.muted) soundSystem.playClick();
            onlineModal.style.display = 'none';
            onlineModal.classList.remove('active');
            this.leaveRoom();
        });

        if (tabCreateRoom) {
            tabCreateRoom.addEventListener('click', () => {
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                this.switchTab('create');
            });
        }

        if (tabJoinRoom) {
            tabJoinRoom.addEventListener('click', () => {
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                this.switchTab('join');
            });
        }

        if (tabQuickMatch) {
            tabQuickMatch.addEventListener('click', () => {
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                this.switchTab('quick');
            });
        }

        if (btnGenerateRoom) {
            btnGenerateRoom.addEventListener('click', () => {
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                this.createRoom();
            });
        }

        if (btnJoinRoomAction && joinRoomInput) {
            btnJoinRoomAction.addEventListener('click', () => {
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                this.joinRoom(joinRoomInput.value);
            });
            joinRoomInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                    this.joinRoom(joinRoomInput.value);
                }
            });
        }

        if (btnStartQuickMatch) {
            btnStartQuickMatch.addEventListener('click', () => {
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                this.startQuickMatch();
            });
        }

        if (btnCopyRoomCode) {
            btnCopyRoomCode.addEventListener('click', () => {
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                if (this.roomCode) {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(this.roomCode).then(() => {
                            btnCopyRoomCode.innerText = '✔ ĐÃ CHÉP!';
                            setTimeout(() => { btnCopyRoomCode.innerText = '📋 SAO CHÉP'; }, 2000);
                        }).catch(() => {
                            prompt('Sao chép mã phòng:', this.roomCode);
                        });
                    } else {
                        prompt('Sao chép mã phòng:', this.roomCode);
                    }
                }
            });
        }

        if (btnStartOnlineMatch) {
            btnStartOnlineMatch.addEventListener('click', () => {
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                if (this.role === 'host') {
                    this.hostStartMatch();
                }
            });
        }

        if (btnLeaveOnlineRoom) {
            btnLeaveOnlineRoom.addEventListener('click', () => {
                if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                this.leaveRoom();
                this.switchTab('create');
            });
        }
    }

    switchTab(tab) {
        const tabCreate = document.getElementById('tabCreateRoom');
        const tabJoin = document.getElementById('tabJoinRoom');
        const tabQuick = document.getElementById('tabQuickMatch');
        const viewCreate = document.getElementById('createRoomView');
        const viewJoin = document.getElementById('joinRoomView');
        const viewQuick = document.getElementById('quickMatchView');
        const viewLobby = document.getElementById('activeLobbyView');

        if (tabCreate) tabCreate.classList.toggle('active', tab === 'create');
        if (tabJoin) tabJoin.classList.toggle('active', tab === 'join');
        if (tabQuick) tabQuick.classList.toggle('active', tab === 'quick');

        if (viewCreate) viewCreate.style.display = (tab === 'create') ? 'flex' : 'none';
        if (viewJoin) viewJoin.style.display = (tab === 'join') ? 'flex' : 'none';
        if (viewQuick) viewQuick.style.display = (tab === 'quick') ? 'flex' : 'none';
        if (viewLobby) viewLobby.style.display = 'none';

        this.hideErrorsAndLoading();
    }

    hideErrorsAndLoading() {
        const err = document.getElementById('joinRoomError');
        if (err) { err.style.display = 'none'; err.innerText = ''; }
        const loadJoin = document.getElementById('joinRoomLoading');
        if (loadJoin) loadJoin.style.display = 'none';
        const loadCreate = document.getElementById('createRoomLoading');
        if (loadCreate) loadCreate.style.display = 'none';
        const loadQuick = document.getElementById('quickMatchLoading');
        if (loadQuick) loadQuick.style.display = 'none';
    }

    showJoinError(msg) {
        const err = document.getElementById('joinRoomError');
        const load = document.getElementById('joinRoomLoading');
        if (load) load.style.display = 'none';
        if (err) {
            err.style.display = 'block';
            err.innerText = msg;
        }
        if (soundSystem && !soundSystem.muted) soundSystem.playHit();
    }

    createRoom() {
        this.cleanup();
        this.role = 'host';
        this.isOnline = true;
        const rawCode = this.generateRoomCode();
        this.roomCode = "CY-" + rawCode;
        this.myPeerId = this.roomCode;
        this.playersLobbyData = [
            { id: this.myPeerId, nickname: 'Host (Blue)', isHost: true }
        ];

        const loadCreate = document.getElementById('createRoomLoading');
        if (loadCreate) loadCreate.style.display = 'flex';

        this.setupLocalBroadcastChannel(this.roomCode);

        if (typeof Peer === 'undefined') {
            this.initHostLobby();
            return;
        }

        try {
            this.peer = new Peer(this.roomCode, PEER_CONFIG);

            this.peer.on('open', (id) => {
                this.myPeerId = id;
                this.setupLocalBroadcastChannel(this.roomCode);
                this.initHostLobby();
            });

            this.peer.on('connection', (conn) => {
                this.connections[conn.peer] = conn;
                conn.on('data', (data) => this.handleHostReceivedData(conn.peer, data));
                conn.on('close', () => {
                    delete this.connections[conn.peer];
                    this.playersLobbyData = this.playersLobbyData.filter(p => p.id !== conn.peer);
                    this.broadcastLobbyState();
                });
            });

            this.peer.on('error', (err) => {
                console.warn("PeerJS Host fallback to BroadcastChannel:", err);
                const notice = document.getElementById('onlineNetworkNotice');
                if (notice) {
                    notice.style.display = 'block';
                    notice.innerText = "⚡ Máy chủ Peer Cloud bận. Chế độ Local Broadcast (thử nghiệm trên cùng thiết bị) đã sẵn sàng!";
                }
                this.setupLocalBroadcastChannel(this.roomCode);
                this.initHostLobby();
            });
        } catch (e) {
            console.warn("PeerJS Create exception:", e);
            this.setupLocalBroadcastChannel(this.roomCode);
            this.initHostLobby();
        }
    }

    initHostLobby() {
        const loadCreate = document.getElementById('createRoomLoading');
        if (loadCreate) loadCreate.style.display = 'none';

        this.playersLobbyData = [
            { id: this.myPeerId, nickname: 'Host (Blue)', isHost: true }
        ];

        this.showLobbyView();
        this.updateLobbyDisplay('host_waiting');
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    }

    joinRoom(rawCode) {
        this.cleanup();
        let codeInput = (rawCode || '').trim().toUpperCase();
        if (!codeInput) {
            this.showJoinError('Vui lòng nhập mã phòng hợp lệ (VD: CY-8842 hoặc 8842)!');
            return;
        }
        const cleanCode = codeInput.replace("CY-", "").replace(/^-+/, '');
        if (cleanCode.length < 3) {
            this.showJoinError('Mã phòng quá ngắn. Vui lòng kiểm tra lại!');
            return;
        }

        const targetHostPeerId = "CY-" + cleanCode;
        this.roomCode = targetHostPeerId;
        this.myPeerId = 'CLIENT_' + Math.random().toString(36).substring(2, 7);
        this.role = 'guest';
        this.isJoinedSuccess = false;

        const loadJoin = document.getElementById('joinRoomLoading');
        const loadText = document.getElementById('joinRoomLoadingText');
        const errEl = document.getElementById('joinRoomError');
        if (errEl) errEl.style.display = 'none';
        if (loadJoin) loadJoin.style.display = 'flex';
        if (loadText) loadText.innerText = `🔍 Đang kết nối tới chủ phòng ${cleanCode}...`;

        if (this.joinTimeoutTimer) clearTimeout(this.joinTimeoutTimer);

        // 1. Setup local BroadcastChannel (handles same-device multi-tab instant connection)
        this.setupLocalBroadcastChannel(this.roomCode);
        this.sendNetworkMessage({ type: 'JOIN_LOBBY', nickname: 'Guest (Red)' });

        // 2. Set timeout of 6 seconds
        this.joinTimeoutTimer = setTimeout(() => {
            if (!this.isJoinedSuccess) {
                this.showJoinError(`❌ Không tìm thấy phòng "${cleanCode}"! Phòng không tồn tại hoặc Chủ phòng chưa mở.`);
                this.cleanup(true);
            }
        }, 6000);

        // 3. Connect via PeerJS WebRTC (for cross-device online play)
        try {
            if (typeof Peer === 'undefined') return;
            this.peer = new Peer(undefined, PEER_CONFIG);

            this.peer.on('open', (id) => {
                if (!this.isJoinedSuccess) {
                    this.myPeerId = id;
                }
                try {
                    let isWebRTCOpen = false;
                    this.hostConn = this.peer.connect(targetHostPeerId, { reliable: true });

                    this.hostConn.on('open', () => {
                        isWebRTCOpen = true;
                        this.sendNetworkMessage({ type: 'JOIN_LOBBY', nickname: 'Guest (Red)' });
                    });

                    this.hostConn.on('data', (data) => {
                        this.handleClientReceivedData(data);
                    });

                    this.hostConn.on('close', () => {
                        if (this.isJoinedSuccess && isWebRTCOpen) {
                            this.onDisconnected();
                        }
                    });
                } catch(e) {
                    console.warn("Peer connection error:", e);
                }
            });

            this.peer.on('error', (err) => {
                console.warn("Peer client error:", err);
                if (err.type === 'peer-unavailable' && !this.isJoinedSuccess) {
                    clearTimeout(this.joinTimeoutTimer);
                    this.showJoinError(`❌ Không tìm thấy phòng "${cleanCode}"! Phòng không tồn tại hoặc Chủ phòng đã đóng.`);
                    this.cleanup(true);
                }
            });
        } catch (e) {
            console.warn("PeerJS Join exception:", e);
        }
    }

    initClientLobby() {
        this.isJoinedSuccess = true;
        this.isOnline = true;
        if (this.joinTimeoutTimer) clearTimeout(this.joinTimeoutTimer);

        const loadJoin = document.getElementById('joinRoomLoading');
        if (loadJoin) loadJoin.style.display = 'none';

        this.showLobbyView();
        this.updateLobbyDisplay('connected');
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    }

    handleHostReceivedData(peerId, data) {
        if (!data || !data.type) return;

        switch(data.type) {
            case 'JOIN_LOBBY':
            case 'HANDSHAKE_REQUEST':
                if (this.playersLobbyData.length >= 2 && !this.playersLobbyData.some(p => p.id === peerId)) {
                    this.sendNetworkMessage({ type: 'ROOM_FULL', targetId: peerId, code: this.roomCode });
                    return;
                }
                if (!this.playersLobbyData.some(p => p.id === peerId)) {
                    this.playersLobbyData.push({
                        id: peerId,
                        nickname: data.nickname || 'Guest (Red)',
                        isHost: false
                    });
                }
                this.sendNetworkMessage({
                    type: 'JOIN_ACCEPT',
                    targetId: peerId,
                    players: this.playersLobbyData,
                    roomCode: this.roomCode,
                    winScore: gameState.winScore || 3
                });
                this.broadcastLobbyState();
                break;

            case 'INPUT':
            case 'INPUT_UPDATE':
                if (data.input && inputs && inputs.p2) {
                    inputs.p2.l = data.input.l;
                    inputs.p2.r = data.input.r;
                    inputs.p2.s = data.input.s;
                }
                break;

            case 'UPGRADE_PICK':
                if (data.pid === 'p2' && p2) {
                    p2.addUpgrade(data.modId);
                    handlePlayerReady('p2');
                }
                break;

            case 'MONEY_TANK_UPGRADE':
                if (data.pid === 'p2' && p2) {
                    p2.upgradeLevel = data.level;
                }
                break;

            case 'INVENTOR_UPGRADE':
                if (data.pid === 'p2' && p2) {
                    if (!p2.boughtInvShopItems) p2.boughtInvShopItems = [];
                    p2.boughtInvShopItems.push(data.itemId);
                    if (!p2.invUpgrades) p2.invUpgrades = {};
                    p2.invUpgrades[data.itemId] = (p2.invUpgrades[data.itemId] || 0) + 1;
                    if (data.itemId === 'inv_giap') { p2.maxHp += 1; p2.hp += 1; }
                    if (data.itemId === 'inv_tangcuong') { p2.maxAmmo += 2; p2.ammo += 2; }
                    if (data.itemId === 'inv_bodam') { p2.speed *= 1.1; }
                    if (data.itemId === 'inv_full_evo') {
                        p2.isFullEvoInventor = true;
                        if (!p2.upgrades.includes('evo_inv_1')) p2.addUpgrade('evo_inv_1');
                        if (!p2.upgrades.includes('evo_inv_2')) p2.addUpgrade('evo_inv_2');
                    }
                }
                break;

            case 'READY':
                handlePlayerReady(data.pid);
                break;
        }
    }

    handleClientReceivedData(data) {
        if (!data || !data.type) return;

        switch(data.type) {
            case 'JOIN_ACCEPT':
            case 'HANDSHAKE_ACCEPTED':
            case 'LOBBY_STATE':
                if (data.type === 'JOIN_ACCEPT' && data.targetId && data.targetId !== this.myPeerId) return;
                if (!this.isJoinedSuccess) {
                    this.initClientLobby();
                }
                if (data.players) this.playersLobbyData = data.players;
                if (data.winScore) gameState.winScore = data.winScore;
                this.updateLobbyDisplay('connected');
                break;

            case 'ROOM_FULL':
                if (!data.targetId || data.targetId === this.myPeerId) {
                    this.showJoinError(`⚠️ Phòng "${data.code || this.roomCode}" đã đủ 2 người chơi!`);
                    this.cleanup(true);
                }
                break;

            case 'START_MATCH':
                this.startMatchActual(data.winScore);
                break;

            case 'START_ROUND':
                if (data.p1Upgrades && p1) p1.upgrades = [...data.p1Upgrades];
                if (data.p2Upgrades && p2) p2.upgrades = [...data.p2Upgrades];
                if (data.p1InvUpgrades && p1) p1.invUpgrades = { ...data.p1InvUpgrades };
                if (data.p2InvUpgrades && p2) p2.invUpgrades = { ...data.p2InvUpgrades };
                if (data.p1IsFullEvo !== undefined && p1) p1.isFullEvoInventor = data.p1IsFullEvo;
                if (data.p2IsFullEvo !== undefined && p2) p2.isFullEvoInventor = data.p2IsFullEvo;
                if (data.round) gameState.round = data.round;
                startRound();
                break;

            case 'HOST_INPUT':
                if (data.input && inputs && inputs.p1) {
                    inputs.p1.l = data.input.l;
                    inputs.p1.r = data.input.r;
                    inputs.p1.s = data.input.s;
                }
                break;

            case 'SYNC':
            case 'GAME_STATE_SYNC':
                this.applyHostSync(data.state || data);
                break;

            case 'UPGRADE_PICK':
                if (data.pid === 'p1' && p1) {
                    p1.addUpgrade(data.modId);
                    handlePlayerReady('p1');
                }
                break;

            case 'MONEY_TANK_UPGRADE':
                if (data.pid === 'p1' && p1) {
                    p1.upgradeLevel = data.level;
                }
                break;

            case 'INVENTOR_UPGRADE':
                if (data.pid === 'p1' && p1) {
                    if (!p1.boughtInvShopItems) p1.boughtInvShopItems = [];
                    p1.boughtInvShopItems.push(data.itemId);
                    if (!p1.invUpgrades) p1.invUpgrades = {};
                    p1.invUpgrades[data.itemId] = (p1.invUpgrades[data.itemId] || 0) + 1;
                    if (data.itemId === 'inv_giap') { p1.maxHp += 1; p1.hp += 1; }
                    if (data.itemId === 'inv_tangcuong') { p1.maxAmmo += 2; p1.ammo += 2; }
                    if (data.itemId === 'inv_bodam') { p1.speed *= 1.1; }
                    if (data.itemId === 'inv_full_evo') {
                        p1.isFullEvoInventor = true;
                        if (!p1.upgrades.includes('evo_inv_1')) p1.addUpgrade('evo_inv_1');
                        if (!p1.upgrades.includes('evo_inv_2')) p1.addUpgrade('evo_inv_2');
                    }
                }
                break;

            case 'READY':
                handlePlayerReady(data.pid);
                break;
        }
    }

    broadcastLobbyState() {
        this.updateLobbyDisplay('connected');
        this.sendNetworkMessage({ type: 'LOBBY_STATE', players: this.playersLobbyData });
    }

    startQuickMatch() {
        this.cleanup();
        this.isQuickMatch = true;
        const loadQuick = document.getElementById('quickMatchLoading');
        const statusText = document.getElementById('quickMatchStatusText');
        if (loadQuick) loadQuick.style.display = 'flex';
        if (statusText) statusText.innerText = '⚡ Đang quét tìm các phòng .IO đang chờ...';

        const quickCode = 'CY-IO-PUBLIC';
        this.role = 'guest';
        this.roomCode = quickCode;
        this.myPeerId = 'CLIENT_' + Math.random().toString(36).substring(2, 7);
        this.isJoinedSuccess = false;

        this.setupLocalBroadcastChannel(quickCode);
        this.sendNetworkMessage({ type: 'JOIN_LOBBY', nickname: 'Guest (Red)' });

        let quickTimeout = setTimeout(() => {
            if (!this.isJoinedSuccess) {
                if (statusText) statusText.innerText = 'Chưa có phòng trống. Đang tạo phòng công khai cho bạn...';
                if (this.peer) { try { this.peer.destroy(); } catch(e){} this.peer = null; }
                this.hostQuickMatch(quickCode);
            }
        }, 2200);

        try {
            if (typeof Peer === 'undefined') return;
            this.peer = new Peer(undefined, PEER_CONFIG);

            this.peer.on('open', (id) => {
                this.myPeerId = id;
                try {
                    this.hostConn = this.peer.connect(quickCode, { reliable: true });
                    this.hostConn.on('open', () => {
                        this.sendNetworkMessage({ type: 'JOIN_LOBBY', nickname: 'Guest (Red)' });
                    });
                    this.hostConn.on('data', (data) => {
                        clearTimeout(quickTimeout);
                        this.handleClientReceivedData(data);
                    });
                } catch(e){}
            });

            this.peer.on('error', () => {
                clearTimeout(quickTimeout);
                this.hostQuickMatch(quickCode);
            });
        } catch(e) {
            this.hostQuickMatch(quickCode);
        }
    }

    hostQuickMatch(code) {
        this.cleanup();
        this.role = 'host';
        this.isOnline = true;
        this.roomCode = code;
        this.myPeerId = code;

        const loadQuick = document.getElementById('quickMatchLoading');
        const statusText = document.getElementById('quickMatchStatusText');
        if (statusText) statusText.innerText = 'Đã mở phòng .IO! Đang chờ đối thủ vào ghép trận...';

        this.setupLocalBroadcastChannel(code);

        try {
            this.peer = new Peer(code, PEER_CONFIG);
            this.peer.on('open', () => {
                if (loadQuick) loadQuick.style.display = 'none';
                this.initHostLobby();
                const displayCode = document.getElementById('displayRoomCode');
                if (displayCode) displayCode.innerText = 'PHÒNG CÔNG KHAI (.IO)';
            });
            this.peer.on('connection', (conn) => {
                this.connections[conn.peer] = conn;
                conn.on('data', (data) => this.handleHostReceivedData(conn.peer, data));
                conn.on('close', () => {
                    delete this.connections[conn.peer];
                    this.playersLobbyData = this.playersLobbyData.filter(p => p.id !== conn.peer);
                    this.broadcastLobbyState();
                });
            });
            this.peer.on('error', (err) => {
                if (loadQuick) loadQuick.style.display = 'none';
                this.initHostLobby();
                const displayCode = document.getElementById('displayRoomCode');
                if (displayCode) displayCode.innerText = 'PHÒNG CÔNG KHAI (.IO)';
            });
        } catch(e) {
            if (loadQuick) loadQuick.style.display = 'none';
            this.initHostLobby();
        }
    }

    showLobbyView() {
        const viewCreate = document.getElementById('createRoomView');
        const viewJoin = document.getElementById('joinRoomView');
        const viewQuick = document.getElementById('quickMatchView');
        const viewLobby = document.getElementById('activeLobbyView');
        const displayCode = document.getElementById('displayRoomCode');

        if (viewCreate) viewCreate.style.display = 'none';
        if (viewJoin) viewJoin.style.display = 'none';
        if (viewQuick) viewQuick.style.display = 'none';
        if (viewLobby) viewLobby.style.display = 'flex';
        if (displayCode) displayCode.innerText = this.roomCode || 'CY-0000';

        this.startPingMonitor();
    }

    updateLobbyDisplay(status) {
        const p1Status = document.getElementById('lobbyP1Status');
        const p2Status = document.getElementById('lobbyP2Status');
        const btnStart = document.getElementById('btnStartOnlineMatch');

        if (this.role === 'host') {
            if (p1Status) {
                p1Status.className = 'slot-status ready';
                p1Status.innerText = '✔ BẠN (HOST XANH)';
            }
            if (status === 'host_waiting' && this.playersLobbyData.length < 2) {
                if (p2Status) {
                    p2Status.className = 'slot-status waiting';
                    p2Status.innerText = '⏳ CHỜ ĐỐI THỦ VÀO...';
                }
                if (btnStart) {
                    btnStart.disabled = true;
                    btnStart.innerText = '⏳ CHỜ ĐỐI THỦ VÀO PHÒNG...';
                }
            } else if (status === 'connected' || this.playersLobbyData.length >= 2) {
                if (p2Status) {
                    p2Status.className = 'slot-status ready';
                    p2Status.innerText = '✔ ĐỐI THỦ ĐÃ VÀO!';
                }
                if (btnStart) {
                    btnStart.disabled = false;
                    btnStart.innerText = '⚔️ BẮT ĐẦU TRẬN ĐẤU (HOST)';
                }
            }
        } else if (this.role === 'guest') {
            if (p1Status) {
                p1Status.className = 'slot-status ready';
                p1Status.innerText = '✔ HOST (XANH SẴN SÀNG)';
            }
            if (p2Status) {
                p2Status.className = 'slot-status ready';
                p2Status.innerText = '✔ BẠN (GUEST ĐỎ)';
            }
            if (btnStart) {
                btnStart.disabled = true;
                btnStart.innerText = '⏳ CHỜ CHỦ PHÒNG BẮT ĐẦU TRẬN...';
            }
        }
    }

    hostStartMatch() {
        if (this.playersLobbyData.length < 2) {
            alert('Chưa có đối thủ kết nối vào phòng!');
            return;
        }
        this.sendNetworkMessage({
            type: 'START_MATCH',
            winScore: gameState.winScore || 3
        });
        this.startMatchActual(gameState.winScore || 3);
    }

    startMatchActual(winScore) {
        document.body.classList.add('online-active');
        if (this.role === 'guest') {
            document.body.classList.add('role-guest');
            document.body.classList.remove('role-host');
        } else {
            document.body.classList.add('role-host');
            document.body.classList.remove('role-guest');
        }

        const onlineModal = document.getElementById('onlineModal');
        if (onlineModal) {
            onlineModal.style.display = 'none';
            onlineModal.classList.remove('active');
        }
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) mainMenu.style.display = 'none';

        const p2Controls = document.getElementById('p2-controls');
        if (p2Controls) p2Controls.style.display = 'none';

        const p1Label = document.querySelector('.p1-tag');
        if (p1Label) {
            p1Label.innerHTML = (this.role === 'guest') ? '🔴 BẠN: PLAYER 2 (ĐỎ)' : '🔵 BẠN: PLAYER 1 (XANH)';
        }

        const hudPing = document.getElementById('hudOnlinePing');
        if (hudPing) hudPing.style.display = 'flex';

        updateCanvasDimensions();

        gameState.winScore = winScore || 3;
        startBattle();
    }

    onGameLoopTick() {
        if (!this.isOnline) return;

        // Host broadcasts state to Guest at ~30 Hz (every 2 frames)
        if (this.role === 'host') {
            if (animationId % 2 === 0 && p1 && p2) {
                this.sendNetworkMessage({
                    type: 'SYNC',
                    p1: { x: p1.x, y: p1.y, hp: p1.hp, maxHp: p1.maxHp, shield: p1.shield, ammo: p1.ammo },
                    p2: { x: p2.x, y: p2.y, hp: p2.hp, maxHp: p2.maxHp, shield: p2.shield, ammo: p2.ammo },
                    p1Score: gameState.p1Score,
                    p2Score: gameState.p2Score,
                    p1Coins: gameState.p1Coins,
                    p2Coins: gameState.p2Coins,
                    phase: gameState.phase,
                    round: gameState.round,
                    crates: (crates || []).map(c => ({
                        id: c.id, x: c.x, y: c.y, w: c.w, h: c.h,
                        type: c.type, active: c.active,
                        spawnTime: c.spawnTime, lifeTime: c.lifeTime
                    })),
                    moneyTrucks: (moneyTrucks || []).map(t => ({
                        id: t.id, x: t.x, y: t.y, w: t.w, h: t.h,
                        hp: t.hp, dir: t.dir, speed: t.speed, active: t.active
                    })),
                    movingObstacle: (movingObstacle && movingObstacle.active) ? {
                        x: movingObstacle.x, y: movingObstacle.y, w: movingObstacle.w, h: movingObstacle.h,
                        vx: movingObstacle.vx, active: movingObstacle.active, opacity: movingObstacle.opacity,
                        spawnTime: movingObstacle.spawnTime, lifeTime: movingObstacle.lifeTime
                    } : null,
                    map: gameState.currentMap,
                    bastions: (bastions || []).filter(b => b.active).map(b => ({
                        x: b.x, y: b.y, vx: b.vx, hp: b.hp, maxHp: b.maxHp, active: b.active
                    })),
                    spears: (thunderPlantedSpears || []).map(s => ({
                        id: s.id, ownerId: s.owner ? s.owner.id : 1, x: s.x, y: s.y, angle: s.angle
                    })),
                    magnetNodes: (magnetNodes || []).filter(m => m.active).map(m => ({
                        id: m.id, ownerId: m.owner ? m.owner.id : 1, x: m.x, y: m.y, polarity: m.polarity, radius: m.radius, active: m.active
                    })),
                    turrets: (turrets || []).filter(t => t.active).map(t => ({
                        ownerId: t.owner ? t.owner.id : 1, isSmart: t.isSmart, x: t.x, y: t.y, hp: t.hp, maxHp: t.maxHp, active: t.active
                    }))
                });
            }
        }
    }

    applyHostSync(data) {
        if (!p1 || !p2) return;

        // P1 is host-controlled: smooth reconciliation
        if (Math.abs(p1.x - data.p1.x) > 40) {
            p1.x = data.p1.x;
        } else {
            p1.x += (data.p1.x - p1.x) * 0.5;
        }
        p1.y = data.p1.y;
        p1.hp = data.p1.hp; p1.maxHp = data.p1.maxHp; p1.shield = data.p1.shield; p1.ammo = data.p1.ammo;

        // P2 is client-controlled: reconcile smoothly
        if (Math.abs(p2.x - data.p2.x) > 35) {
            p2.x = data.p2.x;
        } else if (Math.abs(p2.x - data.p2.x) > 4) {
            p2.x += (data.p2.x - p2.x) * 0.2;
        }
        p2.y = data.p2.y;
        p2.hp = data.p2.hp; p2.maxHp = data.p2.maxHp; p2.shield = data.p2.shield; p2.ammo = data.p2.ammo;

        gameState.p1Score = data.p1Score;
        gameState.p2Score = data.p2Score;
        gameState.p1Coins = data.p1Coins;
        gameState.p2Coins = data.p2Coins;
        if (gameState.phase !== data.phase) {
            gameState.phase = data.phase;
        }
        updateScoreBoard();

        // Map Sync
        if (data.map) {
            gameState.currentMap = data.map;
            if (typeof updateMapHUD === 'function') updateMapHUD();
        }

        // Authoritative Crate Synchronization
        if (Array.isArray(data.crates)) {
            if (this.guestDestroyedCrates) {
                const hostIds = new Set(data.crates.map(c => c.id));
                for (let id of this.guestDestroyedCrates) {
                    if (!hostIds.has(id)) this.guestDestroyedCrates.delete(id);
                }
            }
            crates = data.crates
                .filter(raw => raw.active && !(this.guestDestroyedCrates && this.guestDestroyedCrates.has(raw.id)))
                .map(raw => {
                    const c = Object.create(Crate.prototype);
                    return Object.assign(c, raw);
                });
        }

        // Authoritative MoneyTruck Synchronization
        if (Array.isArray(data.moneyTrucks)) {
            moneyTrucks = data.moneyTrucks
                .filter(raw => raw.active)
                .map(raw => {
                    const t = Object.create(MoneyTruck.prototype);
                    return Object.assign(t, raw);
                });
        }

        // Authoritative MovingObstacle Synchronization
        if (data.movingObstacle) {
            const obs = Object.create(MovingObstacle.prototype);
            movingObstacle = Object.assign(obs, data.movingObstacle);
        } else if (data.hasOwnProperty('movingObstacle')) {
            movingObstacle = null;
        }

        // Authoritative Bastions Synchronization
        if (Array.isArray(data.bastions)) {
            bastions = data.bastions.map(raw => {
                let b = new BastionWall(raw.y, raw.maxHp || 60, raw.vx);
                b.x = raw.x; b.hp = raw.hp; b.active = raw.active;
                return b;
            });
        }

        // Authoritative Planted Spears Synchronization
        if (Array.isArray(data.spears)) {
            thunderPlantedSpears = data.spears.map(raw => ({
                id: raw.id, owner: raw.ownerId === 1 ? p1 : p2, x: raw.x, y: raw.y, angle: raw.angle
            }));
        }

        // Authoritative Magnet Nodes Synchronization
        if (Array.isArray(data.magnetNodes)) {
            magnetNodes = data.magnetNodes.map(raw => ({
                id: raw.id, owner: raw.ownerId === 1 ? p1 : p2, x: raw.x, y: raw.y, polarity: raw.polarity, radius: raw.radius, active: raw.active
            }));
        }

        // Authoritative Turrets Synchronization
        if (Array.isArray(data.turrets)) {
            turrets = data.turrets.map(raw => {
                let owner = raw.ownerId === 1 ? p1 : p2;
                let t = new Turret(owner, raw.isSmart, raw.x, raw.y);
                t.x = raw.x; t.y = raw.y; t.hp = raw.hp; t.active = raw.active;
                return t;
            });
        }
    }

    startPingMonitor() {
        if (this.pingTimer) clearInterval(this.pingTimer);
        const pingEl = document.getElementById('pingValueText');
        const hudPingText = document.getElementById('hudPingText');
        this.pingTimer = setInterval(() => {
            this.pingMs = Math.floor(18 + Math.random() * 10);
            if (pingEl) pingEl.innerText = `Độ trễ: ~${this.pingMs}ms (P2P WebRTC / Local Broadcast)`;
            if (hudPingText) hudPingText.innerText = `${this.pingMs}ms`;
        }, 2500);
    }

    onDisconnected() {
        if (this.isOnline) {
            alert('⚠️ Đối thủ đã ngắt kết nối hoặc rời phòng đấu!');
            this.leaveRoom();
            const pauseModal = document.getElementById('pauseMenuModal');
            if (pauseModal) pauseModal.style.display = 'none';
            const mainMenu = document.getElementById('mainMenu');
            if (mainMenu) mainMenu.style.display = 'flex';
            gameState.phase = 'menu';
            cancelAnimationFrame(animationId);
        }
    }

    leaveRoom() {
        this.cleanup();
        this.isOnline = false;
        document.body.classList.remove('online-active', 'role-host', 'role-guest');
        const hudPing = document.getElementById('hudOnlinePing');
        if (hudPing) hudPing.style.display = 'none';
        const activeLobbyView = document.getElementById('activeLobbyView');
        if (activeLobbyView) activeLobbyView.style.display = 'none';
        const p2Controls = document.getElementById('p2-controls');
        if (p2Controls) p2Controls.style.display = 'flex';
        const p1Label = document.querySelector('.p1-tag');
        if (p1Label) p1Label.innerHTML = '🔵 PLAYER 1 (BLUE)';
        updateCanvasDimensions();
    }

    cleanup(preserveErrors = false) {
        this.isOnline = false;
        this.role = null;
        this.roomCode = null;
        this.myPeerId = null;
        this.isJoinedSuccess = false;
        this.playersLobbyData = [];
        this.guestDestroyedCrates = null;
        if (this.joinTimeoutTimer) {
            clearTimeout(this.joinTimeoutTimer);
            this.joinTimeoutTimer = null;
        }
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
        if (this.broadcastChannel) {
            try { this.broadcastChannel.close(); } catch(e){}
            this.broadcastChannel = null;
        }
        if (this.connections) {
            Object.values(this.connections).forEach(c => {
                try { c.close(); } catch(e){}
            });
            this.connections = {};
        }
        if (this.hostConn) {
            try { this.hostConn.close(); } catch(e){}
            this.hostConn = null;
        }
        if (this.peer) {
            try { this.peer.destroy(); } catch(e){}
            this.peer = null;
        }
        if (!preserveErrors) {
            this.hideErrorsAndLoading();
        } else {
            const loadJoin = document.getElementById('joinRoomLoading');
            if (loadJoin) loadJoin.style.display = 'none';
            const loadCreate = document.getElementById('createRoomLoading');
            if (loadCreate) loadCreate.style.display = 'none';
            const loadQuick = document.getElementById('quickMatchLoading');
            if (loadQuick) loadQuick.style.display = 'none';
        }
    }
}

const onlineManager = new OnlineMultiplayerManager();

function init() {
    updateCanvasDimensions();
    p1 = new Player(1, "#3498db");
    p2 = new Player(2, "#e74c3c");
    gameState.winScore = 3;
    setupControls();
    updateScoreBoard();
    onlineManager.initUI();
    botAI.initEvents();
    // The main menu is visible by default in index.html!
}

window.addEventListener('load', init);