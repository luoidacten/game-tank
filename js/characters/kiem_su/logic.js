// ==========================================
// Kiếm Sư (kiem_su) — Logic: Ngũ Hành Luân Chuyển & phản ứng Giao Thoa
// ==========================================

const KS_ELEMENTS = ['white', 'kim', 'moc', 'hoa', 'tho', 'thuy'];
const KS_COLOR = { white: '#f8fafc', kim: '#facc15', moc: '#22c55e', hoa: '#ef4444', tho: '#b45309', thuy: '#3b82f6' };
const KS_NAME = { white: 'Vô', kim: 'Kim', moc: 'Mộc', hoa: 'Hỏa', tho: 'Thổ', thuy: 'Thủy' };

// 15 phản ứng (cặp không thứ tự)
const KS_COMBOS = {
    'kim+kim': 'Bạch Kim Sắc Bén', 'moc+moc': 'Tươi Tốt Hồi Sinh', 'thuy+thuy': 'Thủy Triều Dâng',
    'hoa+hoa': 'Bộc Phá Hỏa Diệm', 'tho+tho': 'Bàn Thạch Vững Chãi',
    'kim+thuy': 'Lãnh Thủy Cương Hóa', 'moc+thuy': 'Dây Leo Bất Tận', 'hoa+moc': 'Cháy Bùng Lan Tỏa',
    'hoa+tho': 'Nham Thạch Cường Hóa', 'kim+tho': 'Khoáng Thạch Đúc Kiếm',
    'kim+moc': 'Rừng Kiếm Chém Đứt', 'moc+tho': 'Rễ Xuyên Bàn Thạch', 'tho+thuy': 'Đầm Lầy Hỗn Tạp',
    'hoa+thuy': 'Hơi Nước Mù Mịt', 'hoa+kim': 'Kim Loại Nóng Chảy',
};
function ksComboKey(a, b) { return [a, b].sort().join('+'); }

function ksRandomEl(exclude) {
    let e;
    do { e = KS_ELEMENTS[Math.floor(Math.random() * KS_ELEMENTS.length)]; } while (e === exclude);
    return e;
}
function ksFull(p) { return hasFullEvo(p, 'kiem_su'); }
function ksPow(p) { return ksFull(p) ? 1.6 : (p.hasUpgrade('evo_ks_1') ? 1.3 : 1); }

function ksGiveCoins(p, n) { if (p.id === 1) gameState.p1Coins += n; else gameState.p2Coins += n; }

function ksAddStone(p, x, y, hpMult = 1, lifeMult = 1, lava = false) {
    const mine = bodyEffects.filter(e => e.isStone && e.owner === p && e.active);
    if (mine.length >= 3) mine[0].active = false;
    const base = p.hasUpgrade('evo_ks_1') ? 5 : 3;
    bodyEffects.push(new StoneBlock(x, y, p, base * hpMult, Math.round(360 * lifeMult), lava));
}

// Hiệu ứng nguyên tố + phản ứng tại điểm va chạm
function ksImpact(b, owner, x, y, victim, kind) {
    if (!owner || owner.weapon !== 'kiem_su') return; // đạn bị phản đổi chủ
    const pw = ksPow(owner);
    const el = b.ksEl, combo = b.ksCombo;
    const enemy = owner === p1 ? p2 : p1;
    const isTarget = !!victim || kind === 'crate' || kind === 'truck' || kind === 'turret';
    const isWall = kind === 'edge' || kind === 'wall' || kind === 'stone' || kind === 'moving' || kind === 'bastion' || kind === 'truck';
    // Toạ độ trên làn đối thủ khi đạn chạm mép sân phía sau họ
    const laneY = (kind === 'edge' && enemy) ? enemy.y + enemy.h / 2 : y;

    if (el === 'kim' && isTarget) { ksGiveCoins(owner, Math.round(2 * pw)); spawnSparkParticles(x, y, '#facc15', 5); }
    if (el === 'moc' && isWall) bodyEffects.push(new BodyZone(x, laneY, 32 * pw, 'root', owner, 210, pw));
    if (el === 'hoa' && (isTarget || isWall)) {
        let r = 42 * pw;
        if (combo === 'hoa+hoa') {
            r *= 2;
            if (enemy) enemy.bullets = enemy.bullets.filter(eb => Math.hypot(eb.x - x, eb.y - y) > r);
        }
        explosions.push(new Explosion(x, kind === 'edge' ? laneY : y, r, 'rgba(255, 80, 40,', 0.5 * owner.damage * pw, owner));
    }
    if (el === 'tho' && isWall && kind !== 'stone') {
        ksAddStone(owner, x, laneY, combo === 'tho+tho' ? 2 : 1, combo === 'tho+tho' ? 2 : 1, combo === 'hoa+tho');
    }
    if (el === 'thuy' && (victim || kind === 'crate')) {
        owner.hp = Math.min(owner.maxHp, owner.hp + 0.5 * pw);
        addFloatingText(owner.x + owner.w / 2, owner.y - 12, `+${(0.5 * pw).toFixed(1)} HP 💧`, '#3b82f6', 12);
    }

    // --- Phản ứng tại điểm chạm ---
    if (!combo) return;
    if (combo === 'moc+thuy') bodyEffects.push(new BodyZone(x, laneY, 64 * pw, 'drain', owner, 240, pw));
    if (combo === 'hoa+moc') bodyEffects.push(new BodyZone(x, laneY, 58 * pw, 'fire', owner, 180, 1.5 * pw));
    if (combo === 'kim+moc') bodyEffects.push(new BodyZone(x, laneY, 40 * pw, 'spikes', owner, 300, pw));
    if (combo === 'tho+thuy') bodyEffects.push(new BodyZone(x, laneY, 48 * pw, 'mud', owner, 240, pw));
    if (combo === 'hoa+thuy' && enemy && Math.hypot(enemy.x + enemy.w / 2 - x, enemy.y + enemy.h / 2 - laneY) < 80 * pw) {
        enemy.blindTimer = Math.max(enemy.blindTimer || 0, 90);
        explosions.push(new Explosion(x, laneY, 60, 'rgba(220, 230, 240,', 0, owner));
        addFloatingText(enemy.x + enemy.w / 2, enemy.y - 16, 'HƠI NƯỚC MÙ MỊT! 🌫️', '#e2e8f0', 13);
    }
    if (combo === 'hoa+kim' && victim) {
        victim.silenceTimer = Math.max(victim.silenceTimer || 0, Math.round(90 * pw));
        addFloatingText(victim.x + victim.w / 2, victim.y - 16, 'TƯỚC KHÍ! 🔥🔇', '#facc15', 13);
    }
}

// Áp hiệu ứng tức thời lên bản thân khi phản ứng kích hoạt lúc bắn
function ksSelfCombo(p, combo, b) {
    const pw = ksPow(p);
    switch (combo) {
        case 'kim+kim': b.w = 9; b.h = 27; b.isPiercing = true; b.dmg += 1 * pw; break;
        case 'moc+moc': p.hp = Math.min(p.maxHp, p.hp + 0.5 * pw); p.ksSpeedBuff = 120; break;
        case 'thuy+thuy': p.shield = (p.shield || 0) + 1; p.ksWaterShield = true; break;
        case 'kim+thuy': p.hp = Math.min(p.maxHp, p.hp + 0.5 * pw); p.ammo = Math.min(p.maxAmmo, p.ammo + 2); ksSyncQueue(p); break;
        case 'kim+tho': ksGiveCoins(p, Math.round(30 * pw)); p.ksFastShots = 3; break;
        case 'moc+tho': b.isPiercing = true; break;
    }
}

function ksSyncQueue(p) {
    if (!p.ksQueue) p.ksQueue = [];
    while (p.ksQueue.length < p.ammo) p.ksQueue.push(ksRandomEl());
    if (p.ksQueue.length > Math.max(p.ammo, 2)) p.ksQueue.length = Math.max(p.ammo, 2);
}

function ksFire(p) {
    ksSyncQueue(p);
    const el = p.ksQueue.shift() || 'white';
    const dirY = p.id === 1 ? -1 : 1;
    let speed = 7 * (el === 'white' ? 1.4 : 1);
    if (p.ksFastShots > 0) { speed *= 1.4; p.ksFastShots--; }
    // Phản ứng giao thoa (Evo 2)
    let combo = null;
    if (p.hasUpgrade('evo_ks_2') && el !== 'white' && p.ksPrevEl && p.ksPrevEl !== 'white') {
        combo = ksComboKey(p.ksPrevEl, el);
        p.ksPrevEl = null;
        addFloatingText(p.x + p.w / 2, p.y - 20, `${KS_COMBOS[combo]}!`, KS_COLOR[el], 13);
    } else p.ksPrevEl = el;
    const mk = (dx, ang, dmgMult) => spawnBullet(p, {
        x: p.x + p.w / 2 - 3 + dx, y: dirY < 0 ? p.y - 18 : p.y + p.h, w: 6, h: 18,
        vx: Math.sin(ang) * speed, vy: dirY * Math.cos(ang) * speed,
        dmg: p.damage * dmgMult, hook: 'kiem_su', ksEl: el, ksCombo: combo, swordDir: dirY,
    });
    const main = mk(0, 0, 1);
    if (combo) ksSelfCombo(p, combo, main);
    // Full Evo: 2 kiếm hộ tống 2 bên
    if (ksFull(p)) { mk(-14, -0.1, 0.5); mk(14, 0.1, 0.5); }
    if (soundSystem && !soundSystem.muted) soundSystem.playShoot('normal');
}

BulletHooks.register('kiem_su', {
    hit(b, attacker, victim) { ksImpact(b, attacker, b.x + b.w / 2, b.y + b.h / 2, victim, 'player'); },
    obstacle(b, owner, obj, kind) {
        // Mộc + Thổ: xuyên & phá hủy vật cản nhân tạo
        if (b.ksCombo === 'moc+tho' && (kind === 'wall' || kind === 'turret' || kind === 'stone') && !obj.isImmortal) {
            obj.hp = 0; obj.active = false;
            explosions.push(new Explosion(obj.x + obj.w / 2, obj.y + obj.h / 2, 40, '#a16207', 0, owner));
            return 'pass';
        }
        ksImpact(b, owner, b.x + b.w / 2, b.y + b.h / 2, null, kind);
        if (kind === 'truck' && b.ksEl === 'kim' && obj.hp <= 0 && !obj.ksPaid) { obj.ksPaid = true; ksGiveCoins(owner, 30); addFloatingText(obj.x + obj.w / 2, obj.y - 10, '+30$ x2 💰', '#facc15', 13); }
        return undefined;
    },
    edge(b, owner) { ksImpact(b, owner, b.x + b.w / 2, b.y + b.h / 2, null, 'edge'); },
    truckDmgMult(b) { return b.ksEl === 'kim' ? 5 : 1; },
    // Tường nham thạch: đạn địch bắn vào -> phản đòn tia lửa
    lavaHit(_, stone, bullet) {
        const owner = stone.owner;
        const enemy = owner === p1 ? p2 : p1;
        if (!enemy) return;
        explosions.push(new Explosion(stone.x + stone.w / 2, stone.y + stone.h / 2, 30, 'rgba(255, 120, 30,', 0, owner));
        const dx = enemy.x + enemy.w / 2 - (stone.x + stone.w / 2), dy = enemy.y + enemy.h / 2 - (stone.y + stone.h / 2);
        const L = Math.hypot(dx, dy) || 1;
        spawnBullet(owner, { x: stone.x + stone.w / 2 - 3, y: stone.y + stone.h / 2, w: 6, h: 14, vx: dx / L * 7, vy: dy / L * 7, dmg: 0.5 * owner.damage, hook: 'kiem_su', ksEl: 'hoa', swordDir: dy < 0 ? -1 : 1 });
    },
    draw(b) { drawGlowingSword(b.x, b.y, b.w, b.h, KS_COLOR[b.ksEl] || '#fff', b.swordDir || (b.vy < 0 ? -1 : 1)); },
});

CharHooks.register('kiem_su', {
    setup() {
        this.ksQueue = [];
        this.ksPrevEl = null; this.ksHold = 0; this.ksPrevS = false;
        this.ksSpeedBuff = 0; this.ksFastShots = 0; this.ksWaterShield = false;
    },
    update() {
        ksSyncQueue(this);
        if (this.ksSpeedBuff > 0) this.ksSpeedBuff--;
    },
    speed(s) { return this.ksSpeedBuff > 0 ? s * 1.2 : s; },
    shoot(inp, now) {
        const evo1 = this.hasUpgrade('evo_ks_1');
        const pressed = inp.s && !this.ksPrevS;
        const released = !inp.s && this.ksPrevS;
        this.ksPrevS = !!inp.s;
        const canFire = this.ammo > 0 && now - this.lastShot > 320;
        if (!evo1) {
            if (pressed && canFire) { ksFire(this); this.ammo--; this.lastShot = now; }
            return true;
        }
        // Evo 1: nhấp = bắn, giữ 0.25s = đổi chỗ viên hiện tại & viên kế tiếp
        if (inp.s) {
            this.ksHold++;
            if (this.ksHold === 15) {
                ksSyncQueue(this);
                const q = this.ksQueue;
                if (q.length >= 2) {
                    if (q[0] === q[1]) q[1] = ksRandomEl(q[0]);
                    [q[0], q[1]] = [q[1], q[0]];
                    addFloatingText(this.x + this.w / 2, this.y - 16, `ĐỔI: ${KS_NAME[q[0]]} ⇄ ${KS_NAME[q[1]]}`, KS_COLOR[q[0]], 12);
                    if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                }
            }
        } else if (released) {
            if (this.ksHold < 15 && canFire) { ksFire(this); this.ammo--; this.lastShot = now; }
            this.ksHold = 0;
        }
        return true;
    },
    shieldBreak(attacker) {
        // Thủy + Thủy: khiên nước vỡ -> sóng nước đẩy lùi đối thủ
        if (this.ksWaterShield) {
            this.ksWaterShield = false;
            const enemy = this === p1 ? p2 : p1;
            if (enemy) enemy.kbX = Math.sign((enemy.x + enemy.w / 2) - (this.x + this.w / 2) || 1) * 12;
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 70, '#3b82f6', 0, this));
        }
    },
});
