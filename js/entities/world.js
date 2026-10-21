// ==========================================
// Vật thể bản đồ: chướng ngại, hòm, xe tiền, tường thành, pháo kích
// ==========================================



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

// ==========================================
// BẢNG GACHA THÙNG TIẾP TẾ — trọng số xuất hiện của MỌI loại thùng (sửa tỉ lệ ở đây).
// Tỉ lệ = trọng số / tổng. Thùng bánh răng (gear) cộng thêm khi trận có body chế tạo.
// ==========================================
const CRATE_WEIGHTS = {
    coin: 25,    // $ tiền
    hp: 20,      // + máu
    ammo: 15,    // đạn
    shield: 13,  // khiên
    dmg: 10,     // +1 sát thương
    boom: 9,     // thùng nổ (phản sát thương người phá)
    bullets: 8,  // chùm đạn 360°
    frost: 6,    // Băng: đóng băng đối thủ
    haste: 6,    // Tốc: +40% tốc chạy 5s
    immune: 5,   // Miễn Nhiễm ×3
    phantom: 5,  // Giáp Ảo: Giáp Trắng 2.0 tan dần trong 5s
    guard: 5,    // Giảm Sát Thương: -35% sát thương nhận 5s
    trap: 5,     // Khống Chế: người phá bị choáng 1s (bẫy)
    laser: 3,    // Lazer: cảnh báo cột dọc rồi bắn tia cực mạnh (HIẾM)
};

class Crate {
    constructor() {
        this.id = 'c_' + Math.random().toString(36).substr(2, 9);
        this.w = 22; this.h = 22;
        this.x = 40 + Math.random() * (canvas.width - 80);
        this.y = 80 + Math.random() * (canvas.height - 160);
        this.active = true;
        this.spawnTime = Date.now();
        this.lifeTime = 10000;
        const ws = [typeof p1 !== 'undefined' && p1 ? p1 : null, typeof p2 !== 'undefined' && p2 ? p2 : null].filter(Boolean);
        // [ĐỔI] Thùng giả (Mimic) chỉ xuất hiện khi trận có body Tiến Hóa
        this.isMimic = ws.some(p => p.weapon === 'evolution') && Math.random() < 0.2;
        // [ĐỔI] Thùng bánh răng chỉ xuất hiện khi có Kỹ Sư / Kẻ Sáng Tạo / Thiên Tài / Nhà Phát Minh
        const hasMaker = ws.some(p => CRATE_GEAR_BODIES.includes(p.weapon));
        const hasEvo1 = ws.some(p => (p.weapon === 'inventor' && p.hasUpgrade('evo_inv_1')) || (p.weapon === 'genius' && p.hasUpgrade('evo_gen_1')));
        // GACHA: bốc thăm theo trọng số trong bảng CRATE_WEIGHTS (thùng mạnh = hiếm)
        const weights = Object.assign({}, CRATE_WEIGHTS);
        if (hasMaker) weights.gear = hasEvo1 ? 24 : 16;
        let total = 0; for (const k in weights) total += weights[k];
        let rand = Math.random() * total;
        this.type = 'coin';
        for (const k in weights) { if ((rand -= weights[k]) < 0) { this.type = k; break; } }
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
        else if (this.type === 'bullets') ctx.fillStyle = '#ff9f1a';

        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = '#000'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';

        let txt = '$';
        if (this.type === 'hp') txt = '+';
        else if (this.type === 'ammo') txt = 'A';
        else if (this.type === 'shield') txt = 'S';
        else if (this.type === 'dmg') txt = 'D';
        else if (this.type === 'boom') txt = '!';
        else if (this.type === 'gear') txt = 'G';
        else if (this.type === 'bullets') txt = '✸';

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

const CRATE_GEAR_BODIES = ['engineer', 'creator', 'genius', 'inventor'];
const CRATE_BOOM_DMG = 1.5;

// Hiệu ứng chung khi 1 thùng bị phá (gọi ở MỌI đường phá thùng: đạn, lao, chém, tia...)
//  - Thùng nổ (boom): người phá bị PHẢN SÁT THƯƠNG ngay lập tức, không thể né, khiên chặn được.
//  - Thùng đạn (bullets): bắn 16 viên ra 360 độ, trúng cả người phá lẫn đối thủ
//    (người phá là body Tiến Hóa thì chỉ gây sát thương lên đối thủ).
function crateOnBreak(c, opener) {
    if (!c || c._broke) return;
    c._broke = true;
    const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
    const hasAllyCrate = !!(opener && typeof opener.hasGear === 'function' && (opener.hasGear('gear_ally_crate_s') || opener.hasGear('gear_ally_crate_p')));
    if (c.type === 'boom' && opener && typeof opener.takeDamage === 'function' && !hasAllyCrate) {
        explosions.push(new Explosion(opener.x + opener.w / 2, opener.y + opener.h / 2, 40, 'rgba(255,0,0,', 0, null));
        addFloatingText(opener.x + opener.w / 2, opener.y - 18, 'PHẢN NỔ! 💥', '#ff4d4d', 14);
        opener.takeDamage(CRATE_BOOM_DMG, null, { unavoidable: true, isEnvironmental: true });
        triggerScreenShake(6, 10);
    }
    if (c.type === 'bullets') {
        bodyEffects.push(new CrateBurst(cx, cy, opener, !!(opener && (opener.weapon === 'evolution' || hasAllyCrate))));
        explosions.push(new Explosion(cx, cy, 34, 'rgba(255,160,30,', 0, null));
    }
    // Thùng Băng / Miễn Nhiễm / Tốc (js/entities/map-vehicles.js)
    if (typeof mvCrateBreak === 'function') mvCrateBreak(c, opener);
    // Thùng Lazer / Khống Chế / Giáp Ảo / Giảm Sát Thương (js/entities/gacha-crates.js)
    if (typeof crGachaBreak === 'function') crGachaBreak(c, opener, hasAllyCrate);
    if (typeof onGearCrateBroken === 'function') onGearCrateBroken(c, opener);
}

// Chùm đạn 360 độ từ Thùng Đạn (đạn trung lập: trúng cả 2 xe)
class CrateBurst {
    constructor(x, y, breaker, onlyEnemy) {
        this.breakerId = breaker ? breaker.id : 0;
        this.onlyEnemy = onlyEnemy;
        this.dmg = 0.75;
        this.active = true;
        this.life = 240;
        this.pellets = [];
        const n = 16, spd = 4.2;
        for (let i = 0; i < n; i++) {
            const a = i * Math.PI * 2 / n; // có cả 2 viên bay thẳng lên / xuống làn xe
            this.pellets.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, on: true });
        }
    }
    update() {
        if (!this.active) return;
        if (--this.life <= 0) { this.active = false; return; }
        const breaker = this.breakerId === 1 ? p1 : (this.breakerId === 2 ? p2 : null);
        let alive = 0;
        for (const b of this.pellets) {
            if (!b.on) continue;
            b.x += b.vx; b.y += b.vy;
            if (b.x < -10 || b.x > canvas.width + 10 || b.y < -10 || b.y > canvas.height + 10) { b.on = false; continue; }
            for (const p of [p1, p2]) {
                if (!p || p.hp <= 0) continue;
                if (this.onlyEnemy && p === breaker) continue;
                if (rectIntersect(b.x - 3, b.y - 3, 6, 6, p.x, p.y, p.w, p.h)) {
                    p.takeDamage(this.dmg, p === breaker ? null : breaker, { isEnvironmental: p === breaker });
                    spawnSparkParticles(b.x, b.y, '#ff9f1a', 5);
                    b.on = false; break;
                }
            }
            if (b.on) alive++;
        }
        if (!alive) this.active = false;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = '#ffb347'; ctx.strokeStyle = '#7a3a00'; ctx.lineWidth = 1;
        for (const b of this.pellets) {
            if (!b.on) continue;
            ctx.beginPath(); ctx.arc(b.x, b.y, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
        ctx.restore();
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
        this.hp = 7;
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
