// ==========================================
// Hiệu ứng dùng chung: vụ nổ, vùng băng, tia laser
// ==========================================


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
        // Hình ảnh: bảng màu [r,g,b] thuần, hạt giống tia lửa, đồng hồ hoạt ảnh (đồng bộ online được)
        this.pal = expPaletteFor(color, owner);
        this.seed = (Math.random() * 1000) | 0;
        this.t = 0; this.life = expLifeFor(maxR);
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
        if (typeof gmExtraTargets === 'function') gmExtraTargets(this.owner).forEach(checkTarget); // Gemini: Bản Sao AI

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
        // Thời gian hoạt ảnh (chỉ hình ảnh, sát thương đã tính ở constructor)
        if (!this.life) { this.t = 0; this.life = expLifeFor(this.maxR); }
        this.t++;
        let k = Math.min(1, this.t / (this.life * 0.5));
        this.r = Math.max(1, this.maxR * (1 - Math.pow(1 - k, 3)));
        if (this.t >= this.life) this.active = false;
    }

    draw() {
        if (!this.active) return;
        if (!this.pal) this.pal = expPaletteFor(this.colorStr, this.owner);
        if (!this.life) { this.t = 0; this.life = expLifeFor(this.maxR); }
        if (this.seed === undefined) this.seed = (Math.random() * 1000) | 0;
        drawExplosionFx(this);
    }
}

// ---------- Bảng màu & vẽ vụ nổ (chỉ hình ảnh) ----------
// Màu đặc trưng của từng thân xe: dùng khi nơi gọi chỉ truyền màu chung chung ('orange','red','white'...)
const BODY_SIGNATURE_COLORS = {
    basic: '#4fc3f7', money_tank: '#ffd54f', tank: '#ff8a3d', ice: '#7fe9ff', big_bullet: '#ff6e40',
    shotgun: '#ffab40', overload: '#ffee58', smg: '#b2ff59', lazer_charge: '#ff4081', lazer_auto: '#ea80fc',
    rocket: '#ff5722', portal: '#b388ff', wind_slash: '#a7ffeb', storm: '#82b1ff', acid: '#76ff03',
    engineer: '#ffc400', ghost: '#c5cae9', aaa: '#ff9100', blade_god: '#ffe082', van_kiem: '#80d8ff',
    water_gun: '#40c4ff', furnace: '#ff3d00', am_duong_su: '#e0e0ff', six_barrel: '#ffb300',
    the_strongest: '#7c4dff', sniper: '#69f0ae', berserker: '#ff1744', blood_lord: '#d50000',
    chrononeo: '#18ffff', clone: '#64ffda', cluster_gun: '#ff6d00', creator: '#00e5ff', cung: '#c6ff00',
    customize: '#40c4ff', death_lock: '#aa00ff', dj: '#ff40ff', evolution: '#00e676', flower_shadow: '#ff80ab',
    gemini: '#536dfe', genius: '#ffd740', healer: '#69f0ae', inventor: '#ffab00', jet_pilot: '#4fc3f7',
    joker: '#d500f9', juggernaut: '#ff6f00', kazuki: '#ff5252', kiem_khach: '#e1f5fe', kiem_su: '#84ffff',
    kiem_vu: '#b9f6ca', lazer_beam: '#ff1744', magician: '#ea80fc', magnet: '#ff5252', mirror: '#e0f7fa',
    necromancer: '#76ff03', paradox: '#7c4dff', raven_oca: '#9575cd', revolver: '#ffca28',
    shadow_hunter: '#651fff', shortgunATK: '#ff9e40', sprayer: '#00e5ff', steel_hook: '#90a4ae',
    sukuna: '#ff1744', t_zero: '#00b0ff', thunder: '#ffff00', tsukiyo: '#b39ddb'
};
// Màu "chung chung" -> lấy theo màu đặc trưng của chủ nổ
const EXP_GENERIC = { '': 1, orange: 1, red: 1, white: 1, 'rgba(255,100,0,': 1, 'rgba(255,0,0,': 1,
    'rgba(255,255,255,': 1, 'rgba(255,165,0,': 1 };
const EXP_NAMED = { orange: [255, 140, 30], red: [255, 50, 50], white: [255, 255, 255], gray: [150, 150, 160],
    grey: [150, 150, 160], gold: [255, 215, 0], purple: [180, 80, 255], magenta: [255, 0, 255], cyan: [0, 255, 255],
    yellow: [255, 240, 0], lime: [120, 255, 0], green: [0, 230, 118], blue: [60, 140, 255], pink: [255, 105, 180],
    violet: [200, 120, 255], black: [40, 40, 50] };
const _expPalCache = {};
function expParseColor(c) {
    if (typeof c !== 'string') return null;
    let s = c.replace(/\s+/g, '').toLowerCase();
    if (_expPalCache[s]) return _expPalCache[s];
    let out = null;
    if (s[0] === '#') {
        let h = s.slice(1);
        if (h.length === 3 || h.length === 4) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        if (h.length >= 6) out = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    } else if (s.startsWith('rgb')) {
        let m = s.match(/[\d.]+/g);
        if (m && m.length >= 3) out = [+m[0], +m[1], +m[2]];
    } else if (EXP_NAMED[s]) out = EXP_NAMED[s];
    if (out && out.some(v => isNaN(v))) out = null;
    if (out) _expPalCache[s] = out;
    return out;
}
// Trả về mảng [r,g,b] thuần (đồng bộ online được)
function expPaletteFor(color, owner) {
    let key = (typeof color === 'string') ? color.replace(/\s+/g, '').toLowerCase() : '';
    let rgb = EXP_GENERIC[key] ? null : expParseColor(color);
    if (!rgb && owner) {
        let o = owner.weapon ? owner : (owner.owner && owner.owner.weapon ? owner.owner : owner);
        let sig = o.weapon && BODY_SIGNATURE_COLORS[o.weapon];
        rgb = expParseColor(sig || o.color);
    }
    if (!rgb) rgb = expParseColor(color) || [255, 120, 30];
    return rgb.slice(0, 3);
}
function expLifeFor(maxR) { return Math.round(Math.max(16, Math.min(42, 12 + maxR * 0.3))); }
function _expMix(c, t, k) { return [(c[0] + (t[0] - c[0]) * k) | 0, (c[1] + (t[1] - c[1]) * k) | 0, (c[2] + (t[2] - c[2]) * k) | 0]; }
function _expRgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a.toFixed(3) + ')'; }
function _expHash(n) { let x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

function drawExplosionFx(e) {
    const c = e.pal, R = e.maxR, p = Math.min(1, e.t / e.life);
    const light = _expMix(c, [255, 255, 255], 0.6), dark = _expMix(c, [12, 8, 20], 0.7);
    const eo = 1 - Math.pow(1 - Math.min(1, p * 2), 3); // ease-out nhanh
    const x = e.x, y = e.y, seed = e.seed || 0;
    ctx.save();
    // 1) Khói tối dần (lớp dưới)
    if (p > 0.12) {
        const sp = (p - 0.12) / 0.88, puffs = R > 40 ? 5 : 3;
        ctx.fillStyle = _expRgba(dark, (1 - sp) * 0.32);
        ctx.beginPath();
        for (let i = 0; i < puffs; i++) {
            const a = _expHash(seed + i * 3.1) * Math.PI * 2;
            const d = R * (0.25 + 0.35 * sp) * (0.6 + _expHash(seed + i) * 0.6);
            const pr = R * (0.28 + 0.3 * sp) * (0.7 + _expHash(seed + i * 7) * 0.5);
            const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d - sp * R * 0.15;
            ctx.moveTo(px + pr, py); ctx.arc(px, py, pr, 0, Math.PI * 2);
        }
        ctx.fill();
    }
    ctx.globalCompositeOperation = 'lighter';
    // 2) Quả cầu lửa: trắng -> màu đặc trưng -> mép tối
    const fa = Math.max(0, 1 - p / 0.7);
    if (fa > 0) {
        const fr = Math.max(2, R * (0.35 + 0.55 * eo));
        const g = ctx.createRadialGradient(x, y, 0, x, y, fr);
        g.addColorStop(0, 'rgba(255,255,255,' + (0.95 * fa).toFixed(3) + ')');
        g.addColorStop(0.3, _expRgba(light, 0.85 * fa));
        g.addColorStop(0.65, _expRgba(c, 0.6 * fa));
        g.addColorStop(1, _expRgba(dark, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, fr, 0, Math.PI * 2); ctx.fill();
    }
    // 3) Chớp lõi trắng
    if (p < 0.25) {
        const k = 1 - p / 0.25;
        ctx.fillStyle = 'rgba(255,255,255,' + (0.9 * k).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(x, y, Math.max(1.5, R * 0.28 * (0.6 + 0.4 * k)), 0, Math.PI * 2); ctx.fill();
    }
    // 4) Vòng sóng xung kích
    const rp = Math.min(1, p * 1.5);
    if (rp < 1) {
        const rr = R * (0.2 + 0.95 * (1 - Math.pow(1 - rp, 2)));
        ctx.strokeStyle = _expRgba(light, 0.9 * (1 - rp));
        ctx.lineWidth = Math.max(1, (R > 30 ? 4 : 2.5) * (1 - rp));
        ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.stroke();
        if (R > 30) {
            ctx.strokeStyle = _expRgba(c, 0.45 * (1 - rp));
            ctx.lineWidth = Math.max(1, 8 * (1 - rp));
            ctx.beginPath(); ctx.arc(x, y, rr * 0.88, 0, Math.PI * 2); ctx.stroke();
        }
    }
    // 5) Tia lửa & mảnh vỡ bắn ra
    if (p < 0.85) {
        const n = Math.max(5, Math.min(14, Math.round(R / 5)));
        const sa = 1 - p / 0.85;
        ctx.strokeStyle = _expRgba(light, sa);
        ctx.lineWidth = R > 30 ? 2 : 1.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2 + _expHash(seed + i * 1.7) * 0.9;
            const spd = 0.55 + _expHash(seed + i * 2.3) * 0.75;
            const d1 = R * (0.15 + 1.05 * eo * spd), d0 = Math.max(0, d1 - R * 0.22 * sa * spd);
            const ca = Math.cos(a), sn = Math.sin(a), drop = p * p * R * 0.25;
            ctx.moveTo(x + ca * d0, y + sn * d0 + drop * 0.6);
            ctx.lineTo(x + ca * d1, y + sn * d1 + drop);
        }
        ctx.stroke();
        ctx.fillStyle = _expRgba(c, sa);
        ctx.beginPath();
        const m = Math.ceil(n / 2);
        for (let i = 0; i < m; i++) {
            const a = _expHash(seed + i * 5.3 + 9) * Math.PI * 2;
            const d = R * (0.2 + 0.8 * eo * (0.5 + _expHash(seed + i * 4.1) * 0.6));
            const s = (R > 30 ? 2.2 : 1.4) * (1 - p * 0.5);
            const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d + p * p * R * 0.3;
            ctx.moveTo(px + s, py); ctx.arc(px, py, s, 0, Math.PI * 2);
        }
        ctx.fill();
    }
    ctx.restore();
}

class IceZone {
    constructor(x, y, maxR = 60, duration = 60, owner) {
        this.x = x; this.y = y;
        this.r = 0;
        this.maxR = maxR;
        this.lifeTime = duration;
        this.active = true;
        this.owner = owner;
        zoneFit(this);
    }
    update() {
        if (!this.active) return;
        if (this.r < this.maxR) this.r += 2;
        this.lifeTime--;
        if (this.lifeTime <= 0) this.active = false;

        let enemies = [p1, p2].filter(p => p.id !== this.owner.id);
        enemies.forEach(p => {
            let d = zoneDist(this.x - (p.x + p.w / 2), this.y - (p.y + p.h / 2));
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
        zoneRectPath(this.x, this.y, this.r);
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
