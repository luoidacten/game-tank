// ==========================================
// Raven - Oca (raven_oca) — Logic
// "Cuộc săn bắt đầu, Oca tìm chúng!"
// ------------------------------------------
// - Linh Hoạt: giữ Bắn 0.4s đổi Tiểu Liên <-> Sniper (hồi 4s, Full Evo 2s).
//   + Sang Tiểu Liên: lướt ngang (né đòn). + Sang Sniper: Bom Khói 2s (Evo 1: 4s) né mọi đạn khi đứng trong khói.
// - Tiểu Liên: nhấp -> loạt 3 viên (Evo 2: 5 viên, băng 15). Sniper: nhấp -> đứng yên ngắm 0.4s rồi bắn đạn cực nhanh.
// - Oca (máu = 50% / 80% Max HP Raven, tự hồi sinh): Tiểu Liên -> tàng hình, định kỳ lao cắn + làm chậm;
//   Sniper -> bay cao đánh dấu radar: đạn Sniper tự khóa mục tiêu, xuyên vật thể, bay nhanh hơn.
// - Evo 2: Oca định kỳ thả bom (vòng cảnh báo đỏ). Sniper gây Trọng Thương (khóa hồi máu 10s).
// - Oca lao cắn: KHÓA vị trí mục tiêu trước (vạch ngắm 0.3s) rồi lao THẲNG tới điểm đó, không đổi hướng giữa chừng.
// - EMP (Cuộn Quá Tải...) vô hiệu Oca: rơi lơ lửng tại chỗ, không lao/không thả bom/không radar — disableSummonEMP().
// - Full Evo: Oca bất tử & không chặn đạn, vừa cắn vừa mưa bom, khóa mục tiêu vĩnh viễn cho cả 2 súng.
// Mọi trạng thái là trường thuần trên player (đồng bộ online), bộ đếm theo tick.
// ==========================================

const RV_HOLD = 24;              // giữ 0.4s -> đổi súng
const RV_AIM = 24;               // Sniper đứng yên ngắm 0.4s
const RV_BURST_GAP = 4;          // khoảng cách giữa các viên trong loạt
const RV_SMOKE_W = 46, RV_SMOKE_H = 30; // bán kính vùng khói (ngang / dọc)
const RV_OCA_R = 9;              // bán kính thân Oca (hitbox 18×18)
const RV_GW_TICKS = 600;         // Trọng Thương 10s
const RV_DIVE_AIM = 18;          // khóa mục tiêu 0.3s trước khi lao
const RV_DIVE_SP = 7.5;
const RV_BOMB_WARN = 60;         // bom Oca: cảnh báo tối thiểu 1s
const RV_CYAN = '#22d3ee', RV_PINK = '#f472b6', RV_VIOLET = '#a78bfa';

function rvE1(p) { return p.hasUpgrade('evo_raven_1'); }
function rvE2(p) { return p.hasUpgrade('evo_raven_2'); }
function rvFull(p) { return rvE1(p) && rvE2(p); }
function rvEnemy(p) { return p === p1 ? p2 : p1; }
function rvDir(p) { return p.id === 1 ? -1 : 1; }
function rvSwitchMax(p) { return rvFull(p) ? 120 : 240; }
function rvSmgMax(p) { return rvE2(p) ? 15 : 10; }
function rvSmokeMax(p) { return rvE1(p) ? 240 : 120; }
function rvOcaMaxHp(p) { return Math.max(0.5, p.maxHp * (rvE2(p) ? 0.8 : 0.5)); }
function rvOcaAlive(p) { return p.rvOcaSt !== 'dead'; }
// Radar khóa mục tiêu: Oca còn sống & Raven cầm Sniper (Full Evo: luôn luôn)
function rvOcaEmpd(p) { return p.rvOcaEmp > 0; }
function rvMarked(p) { const e = rvEnemy(p); return rvOcaAlive(p) && !rvOcaEmpd(p) && (p.rvMode === 'sniper' || rvFull(p)) && e && e.hp > 0; }
// Oca đang tàng hình (Tiểu Liên, không lao cắn)
function rvOcaHidden(p) { return p.rvMode === 'smg' && p.rvOcaSt !== 'dive' && p.rvOcaSt !== 'aim' && !rvOcaEmpd(p) && p.rvOcaSt !== 'dead' && !(p.rvOcaFlash > 0); }
function rvHoverY(p) { return canvas.height / 2 + (p.rvMode === 'sniper' ? rvDir(p) * 46 : 0); }
function rvInSmoke(p) {
    if (!(p.rvSmokeT > 0)) return false;
    return Math.abs(p.x + p.w / 2 - p.rvSmokeX) < RV_SMOKE_W && Math.abs(p.y + p.h / 2 - p.rvSmokeY) < RV_SMOKE_H + p.h / 2;
}

function rvSfx(kind) {
    if (typeof soundSystem === 'undefined' || !soundSystem || soundSystem.muted) return;
    try {
        if (kind === 'smg') soundSystem.playShoot('normal');
        else if (kind === 'sniper') soundSystem.playShoot('cannon');
        else if (kind === 'switch') soundSystem.playPowerup();
        else if (kind === 'click') soundSystem.playClick();
        else if (kind === 'hit') soundSystem.playHit();
    } catch (e) { }
}

function rvFx(p, fx) {
    if (!p.rvFx) p.rvFx = [];
    p.rvFx.push(fx);
    if (p.rvFx.length > 30) p.rvFx.shift();
}

function rvMuzzle(p) {
    const d = rvDir(p);
    const len = p.rvMode === 'sniper' ? 15 : 10;
    return { x: p.x + p.w / 2, y: p.y + p.h / 2 + d * len };
}

// ---------- Bắn ----------
function rvFireSmg(p) {
    const m = rvMuzzle(p);
    const d = rvDir(p);
    const sp = 7.5;
    let vx, vy;
    if (rvFull(p) && rvMarked(p)) {
        // [CÂN BẰNG] tự ngắm KHÔNG đón đầu + tản mát nhẹ -> di chuyển liên tục là né được
        const a = aimVelocity(m.x, m.y, rvEnemy(p), sp, false);
        const ang = Math.atan2(a.vy, a.vx) + (Math.random() * 2 - 1) * 0.09;
        vx = Math.cos(ang) * sp; vy = Math.sin(ang) * sp;
    } else {
        const spread = (Math.random() * 2 - 1) * 0.05;
        vx = Math.sin(spread) * sp; vy = d * Math.cos(spread) * sp;
    }
    spawnBullet(p, {
        x: m.x - 2, y: m.y - 4, w: 4, h: 8, vx, vy,
        dmg: p.damage + (p.dmgBuff || 0),
        hook: 'raven_oca', rvKind: 'smg',
    });
    p.ammo--;
    p.lastShot = Date.now();
    p.rvKick = 3;
    rvFx(p, { k: 'flash', x: m.x, y: m.y, life: 4, max: 4, c: RV_CYAN });
    rvSfx('smg');
}

function rvFireSniper(p) {
    const m = rvMuzzle(p);
    const d = rvDir(p);
    const marked = rvMarked(p);
    let sp = 14 + (marked ? 5 : 0) + (rvE2(p) ? 4 : 0);
    let vx = 0, vy = d * sp;
    if (marked) {
        const a = aimVelocity(m.x, m.y, rvEnemy(p), sp, false);
        // không bao giờ bắn ra sau lưng
        if (a.vy * d > sp * 0.25) { vx = a.vx; vy = a.vy; }
    }
    let dmg = (p.damage + (p.dmgBuff || 0)) * 8;
    if (rvE2(p)) dmg *= 1.25;
    spawnBullet(p, {
        x: m.x - 2, y: m.y - 9, w: 4, h: 18, vx, vy, dmg,
        isPiercing: marked, hook: 'raven_oca', rvKind: 'sniper', rvMarkedShot: marked,
        rvSX: m.x, rvSY: m.y,
    });
    p.ammo--;
    p.lastShot = Date.now();
    p.rvKick = 7;
    rvFx(p, { k: 'flash', x: m.x, y: m.y, life: 7, max: 7, c: RV_PINK, big: true });
    triggerScreenShake(3, 6);
    rvSfx('sniper');
}

// ---------- Linh Hoạt: đổi súng ----------
function rvSwitch(p, inp) {
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    p.rvAimT = 0; p.rvBurstLeft = 0;
    if (p.rvMode === 'smg') {
        p.rvAmmoSmg = p.ammo;
        p.rvMode = 'sniper';
        p.maxAmmo = 4;
        p.reloadTime = 1600;
        p.ammo = rvE1(p) ? p.maxAmmo : Math.min(p.maxAmmo, p.rvAmmoSn);
        // Bom Khói tại chỗ
        p.rvSmokeX = cx; p.rvSmokeY = cy; p.rvSmokeT = rvSmokeMax(p); p.rvSmokeMaxT = p.rvSmokeT;
        explosions.push(new Explosion(cx, cy, 40, 'rgba(160, 150, 200,', 0, p));
        addFloatingText(cx, p.y + (p.id === 1 ? -18 : p.h + 22), '🎯 SNIPER', RV_PINK, 13);
    } else {
        p.rvAmmoSn = p.ammo;
        p.rvMode = 'smg';
        p.maxAmmo = rvSmgMax(p);
        p.reloadTime = 700;
        p.ammo = rvE1(p) ? p.maxAmmo : Math.min(p.maxAmmo, p.rvAmmoSmg);
        // Lướt ngang theo hướng đang di chuyển
        const dir = inp.l && !inp.r ? -1 : (inp.r && !inp.l ? 1 : (p.rvFace || 1));
        p.rvDashDir = dir; p.rvDashT = 10;
        addFloatingText(cx, p.y + (p.id === 1 ? -18 : p.h + 22), '🔫 TIỂU LIÊN', RV_CYAN, 13);
    }
    if (rvE1(p)) spawnSparkParticles(cx, cy, '#fde047', 8);
    p.lastShot = Date.now();
    p.rvSwCd = rvSwitchMax(p);
    p.rvSwFlash = 14;
    rvSfx('switch');
}

// ---------- Oca ----------
function rvOcaKill(p) {
    p.rvOcaSt = 'dead';
    p.rvOcaHp = 0;
    p.rvOcaRespawn = 420; // 7s
    explosions.push(new Explosion(p.rvOcaX, p.rvOcaY, 30, 'rgba(167, 139, 250,', 0, p));
    spawnSparkParticles(p.rvOcaX, p.rvOcaY, RV_VIOLET, 14);
    addFloatingText(p.rvOcaX, p.rvOcaY - 12, 'OCA RƠI! 🪶', RV_VIOLET, 12);
}

function rvOcaBlock(p) {
    if (rvFull(p) || !rvOcaAlive(p) || rvOcaHidden(p)) return;
    const e = rvEnemy(p);
    if (!e || !e.bullets) return;
    const ox = p.rvOcaX - RV_OCA_R, oy = p.rvOcaY - RV_OCA_R, S = RV_OCA_R * 2;
    for (let i = e.bullets.length - 1; i >= 0; i--) {
        const b = e.bullets[i];
        if (!b || typeof b.x !== 'number') continue;
        if (!rectIntersect(b.x, b.y, b.w || 6, b.h || 6, ox, oy, S, S)) continue;
        if (b.isPiercing) {
            if (!b.hitIds) b.hitIds = [];
            if (b.hitIds.includes('rvOca' + p.id)) continue;
            b.hitIds.push('rvOca' + p.id);
        } else {
            e.bullets.splice(i, 1);
        }
        p.rvOcaHp -= Math.min(3, Math.max(0.1, b.dmg || 1));
        p.rvOcaHurt = 8;
        spawnSparkParticles(p.rvOcaX, p.rvOcaY, RV_VIOLET, 5);
        if (p.rvOcaHp <= 0) { rvOcaKill(p); return; }
    }
}

// ---------- EMP: vô hiệu Oca (gọi từ mọi hiệu ứng EMP) ----------
// owner: chủ của vật triệu hồi (player). Nếu truyền (x, y, R) thì chỉ trúng khi Oca nằm trong bán kính
// (hoặc force = true: chủ bị EMP -> toàn bộ vật triệu hồi). Trả về true nếu có vô hiệu được gì.
function disableSummonEMP(owner, ticks, x, y, R, force) {
    if (!owner || owner.weapon !== 'raven_oca' || !rvOcaAlive(owner)) return false;
    if (!force && typeof x === 'number' && Math.hypot(owner.rvOcaX - x, owner.rvOcaY - y) > (R || 0) + RV_OCA_R) return false;
    const T = ticks || 120;
    owner.rvOcaEmp = Math.max(owner.rvOcaEmp || 0, T);
    owner.rvOcaEmpMax = Math.max(owner.rvOcaEmp, owner.rvOcaEmpMax || 0);
    if (owner.rvOcaSt === 'dive' || owner.rvOcaSt === 'aim') owner.rvOcaSt = 'back';
    owner.rvOcaDiveCd = Math.max(owner.rvOcaDiveCd || 0, 30);
    spawnSparkParticles(owner.rvOcaX, owner.rvOcaY, '#a5f3fc', 10);
    addFloatingText(owner.rvOcaX, owner.rvOcaY - 14, 'OCA · EMP ⚡', '#c4b5fd', 12);
    return true;
}

function rvOcaUpdate(p) {
    const e = rvEnemy(p);
    const full = rvFull(p);
    // Đang dính EMP: rơi lơ lửng chậm tại chỗ, không làm gì khác
    if (p.rvOcaEmp > 0 && p.rvOcaSt !== 'dead') {
        p.rvOcaEmp--;
        if (p.rvOcaEmp <= 0) p.rvOcaEmpMax = 0;
        if (p.rvOcaHurt > 0) p.rvOcaHurt--;
        p.rvOcaY += Math.sin(p.rvOcaEmp / 6) * 0.4;
        rvOcaBlock(p);
        return;
    }
    p.rvOcaMaxHp = rvOcaMaxHp(p);
    if (p.rvOcaHurt > 0) p.rvOcaHurt--;
    if (p.rvOcaFlash > 0) p.rvOcaFlash--;
    p.rvOcaFlap = (p.rvOcaFlap || 0) + 1;
    if (!isFinite(p.rvOcaX) || !isFinite(p.rvOcaY)) { p.rvOcaX = isFinite(p.x) ? p.x + p.w / 2 : canvas.width / 2; p.rvOcaY = canvas.height / 2; }

    if (p.rvOcaSt === 'dead') {
        if (full) { p.rvOcaSt = 'hover'; p.rvOcaHp = p.rvOcaMaxHp; return; }
        if (--p.rvOcaRespawn <= 0) {
            p.rvOcaSt = 'hover'; p.rvOcaHp = p.rvOcaMaxHp;
            p.rvOcaX = p.x + p.w / 2; p.rvOcaY = canvas.height / 2;
            p.rvOcaFlash = 30;
            addFloatingText(p.rvOcaX, p.rvOcaY - 14, 'OCA HỒI SINH! 🦅', RV_VIOLET, 12);
        }
        return;
    }
    if (full) p.rvOcaHp = p.rvOcaMaxHp;
    p.rvOcaHp = Math.min(p.rvOcaHp, p.rvOcaMaxHp);

    const ex = e ? e.x + e.w / 2 : canvas.width / 2, ey = e ? e.y + e.h / 2 : canvas.height / 2;
    const prevX = p.rvOcaX;
    if (p.rvOcaSt === 'hover') {
        const tx = ex + Math.sin(p.rvOcaFlap / 50) * 40;
        const ty = rvHoverY(p) + Math.sin(p.rvOcaFlap / 23) * 8;
        p.rvOcaX += (Math.max(16, Math.min(canvas.width - 16, tx)) - p.rvOcaX) * 0.04;
        p.rvOcaY += (ty - p.rvOcaY) * 0.06;
        // Lao cắn: Tiểu Liên (Full Evo: mọi lúc)
        if (p.rvMode === 'smg' || full) {
            if (--p.rvOcaDiveCd <= 0 && e && e.hp > 0) {
                // Khóa vị trí mục tiêu NGAY lúc này -> vạch ngắm ngắn rồi lao thẳng, không bám theo
                p.rvOcaSt = 'aim'; p.rvOcaAimT = RV_DIVE_AIM;
                p.rvOcaTX = ex; p.rvOcaTY = ey;
                p.rvOcaFlash = 10;
            }
        }
    } else if (p.rvOcaSt === 'aim') {
        p.rvOcaX += (Math.random() - 0.5) * 0.8; // rung nhẹ báo hiệu
        if (--p.rvOcaAimT <= 0) {
            const dx = p.rvOcaTX - p.rvOcaX, dy = p.rvOcaTY - p.rvOcaY;
            const L = Math.hypot(dx, dy) || 1;
            p.rvOcaVX = dx / L * RV_DIVE_SP; p.rvOcaVY = dy / L * RV_DIVE_SP;
            p.rvOcaDiveT = Math.min(90, Math.ceil(L / RV_DIVE_SP) + 6); // tới điểm khóa (+ trớn nhẹ)
            p.rvOcaSt = 'dive';
        }
    } else if (p.rvOcaSt === 'dive') {
        p.rvOcaX += p.rvOcaVX || 0; p.rvOcaY += p.rvOcaVY || 0;
        p.rvOcaDiveT--;
        const hit = e && e.hp > 0 && rectIntersect(p.rvOcaX - RV_OCA_R, p.rvOcaY - RV_OCA_R, RV_OCA_R * 2, RV_OCA_R * 2, e.x, e.y, e.w, e.h);
        if (hit) {
            // Cắn + sóng xung kích làm chậm
            e.takeDamage(p.damage * 1.2, p);
            e.slowTimer = Math.max(e.slowTimer || 0, 72);
            explosions.push(new Explosion(ex, ey, 34, 'rgba(34, 211, 238,', 0, p));
            rvFx(p, { k: 'wave', x: ex, y: ey, life: 22, max: 22 });
            if (rvE1(p)) { e.bleedTimer = Math.max(e.bleedTimer || 0, 60); e.bleedDmg = Math.max(e.bleedDmg || 0, 0.03); }
            p.rvOcaSt = 'back';
            p.rvOcaDiveCd = full ? 150 : 210;
        } else if (p.rvOcaDiveT <= 0) {
            p.rvOcaSt = 'back'; p.rvOcaDiveCd = full ? 120 : 150;
        }
    } else if (p.rvOcaSt === 'back') {
        const ty = rvHoverY(p);
        const dx = ex - p.rvOcaX, dy = ty - p.rvOcaY;
        const L = Math.hypot(dx, dy) || 1;
        if (L < 8) p.rvOcaSt = 'hover';
        else { p.rvOcaX += dx / L * Math.min(6, L); p.rvOcaY += dy / L * Math.min(6, L); }
    }
    p.rvOcaFace = (p.rvOcaX - prevX) * 0.3 + (p.rvOcaFace || 0) * 0.7;

    // Evo 2: thả bom (Full Evo: mưa bom liên hoàn 3 quả)
    if (rvE2(p) && e && e.hp > 0) {
        if (--p.rvOcaBombCd <= 0) {
            const n = full ? 3 : 1;
            for (let i = 0; i < n; i++) {
                const pt = laneTargetPoint(e, i === 0 ? 10 : 70);
                const T = RV_BOMB_WARN + i * 18; // mỗi quả cảnh báo >= 1s, rơi lần lượt
                p.rvBombs.push({ x: pt.x, y: pt.y, sx: p.rvOcaX, sy: p.rvOcaY, t: T, max: T });
            }
            p.rvOcaBombCd = full ? 240 : 330;
        }
    }
    rvOcaBlock(p);
}

function rvBombsUpdate(p) {
    if (!p.rvBombs || !p.rvBombs.length) return;
    const e = rvEnemy(p);
    for (const bm of p.rvBombs) {
        if (--bm.t > 0) continue;
        if (e && e.hp > 0 && Math.abs(e.x + e.w / 2 - bm.x) < 30 + e.w / 2 && Math.abs(e.y + e.h / 2 - bm.y) < 26 + e.h / 2) {
            e.takeDamage(p.damage * 2, p);
            if (rvE1(p)) { e.bleedTimer = Math.max(e.bleedTimer || 0, 60); e.bleedDmg = Math.max(e.bleedDmg || 0, 0.03); }
        }
        explosions.push(new Explosion(bm.x, bm.y, 40, 'rgba(255, 80, 60,', 0, p));
        triggerScreenShake(3, 6);
    }
    p.rvBombs = p.rvBombs.filter(bm => bm.t > 0);
}

// Trọng Thương: máu mất do Sniper bị khóa xám, không hồi được trong 10s
function rvGrievousUpdate(p) {
    if (!(p.rvGwT > 0)) return;
    const e = rvEnemy(p);
    p.rvGwT--;
    if (!e || e.hp <= 0) return;
    const cap = Math.max(0.05, e.maxHp - p.rvGwLock);
    if (e.hp > cap) e.hp = cap;
    if (p.rvGwT <= 0) p.rvGwLock = 0;
}

BulletHooks.register('raven_oca', {
    hit(b, attacker, victim, dmg) {
        if (!attacker || attacker.weapon !== 'raven_oca' || !victim) return;
        const hx = b.x + b.w / 2, hy = b.y + b.h / 2;
        if (rvE1(attacker)) { // Đạn Răng Cưa
            victim.bleedTimer = Math.max(victim.bleedTimer || 0, 60);
            victim.bleedDmg = Math.max(victim.bleedDmg || 0, b.rvKind === 'sniper' ? 0.08 : 0.03);
        }
        if (b.rvKind === 'sniper') {
            spawnSparkParticles(hx, hy, RV_PINK, 12);
            rvFx(attacker, { k: 'hitmark', x: hx, y: hy, life: 18, max: 18 });
            if (rvE2(attacker) && dmg > 0) {
                attacker.rvGwLock = Math.min(victim.maxHp, (attacker.rvGwLock || 0) + dmg);
                attacker.rvGwT = RV_GW_TICKS;
                addFloatingText(victim.x + victim.w / 2, victim.y - 24, 'TRỌNG THƯƠNG ☠', '#cbd5e1', 12);
            }
        } else {
            spawnSparkParticles(hx, hy, RV_CYAN, 3);
        }
    },
});

CharHooks.register('raven_oca', {
    setup() {
        this.rvMode = 'smg';
        this.maxAmmo = rvSmgMax(this);
        this.ammo = this.maxAmmo;
        this.reloadTime = 700;
        this.rvAmmoSmg = this.maxAmmo; this.rvAmmoSn = 4; this.rvBgReload = 0;
        this.rvSwCd = 0; this.rvSwFlash = 0; this.rvHold = 0; this.rvPrevS = false; this.rvHoldUsed = false;
        this.rvBurstLeft = 0; this.rvBurstT = 0; this.rvBurstCd = 0;
        this.rvAimT = 0; this.rvKick = 0; this.rvFace = 1;
        this.rvDashT = 0; this.rvDashDir = 1;
        this.rvSmokeT = 0; this.rvSmokeMaxT = 120; this.rvSmokeX = 0; this.rvSmokeY = 0; this.rvDodgeTxt = 0;
        this.rvOcaSt = 'hover';
        this.rvOcaMaxHp = rvOcaMaxHp(this); this.rvOcaHp = this.rvOcaMaxHp;
        this.rvOcaX = canvas.width / 2; this.rvOcaY = canvas.height / 2;
        this.rvOcaDiveCd = 150; this.rvOcaBombCd = 240; this.rvOcaRespawn = 0;
        this.rvOcaFlap = 0; this.rvOcaFace = 0; this.rvOcaHurt = 0; this.rvOcaFlash = 0; this.rvOcaDiveT = 0;
        this.rvBombs = [];
        this.rvOcaEmp = 0; this.rvOcaEmpMax = 0; this.rvOcaAimT = 0;
        this.rvOcaTX = 0; this.rvOcaTY = 0; this.rvOcaVX = 0; this.rvOcaVY = 0;
        this.rvGwT = 0; this.rvGwLock = 0;
        this.rvFx = [];
    },

    update(inp) {
        if (inp.l && !inp.r) this.rvFace = -1; else if (inp.r && !inp.l) this.rvFace = 1;
        if (this.rvSwCd > 0) this.rvSwCd--;
        if (this.rvSwFlash > 0) this.rvSwFlash--;
        if (this.rvKick > 0) this.rvKick--;
        if (this.rvBurstCd > 0) this.rvBurstCd--;
        if (this.rvSmokeT > 0) this.rvSmokeT--;
        if (this.rvDodgeTxt > 0) this.rvDodgeTxt--;
        if (this.rvFx && this.rvFx.length) {
            for (const f of this.rvFx) f.life--;
            this.rvFx = this.rvFx.filter(f => f.life > 0);
        }
        // Giữ đúng băng đạn theo súng
        const max = this.rvMode === 'sniper' ? 4 : rvSmgMax(this);
        if (this.maxAmmo !== max) this.maxAmmo = max;
        if (this.ammo > this.maxAmmo) this.ammo = this.maxAmmo;
        this.reloadTime = this.rvMode === 'sniper' ? 1600 : 700;
        // Súng đang cất tự nạp chậm
        if (++this.rvBgReload >= 45) {
            this.rvBgReload = 0;
            if (this.rvMode === 'smg') this.rvAmmoSn = Math.min(4, (this.rvAmmoSn || 0) + 1);
            else this.rvAmmoSmg = Math.min(rvSmgMax(this), (this.rvAmmoSmg || 0) + 1);
        }

        // Lướt ngang
        if (this.rvDashT > 0) {
            this.rvDashT--;
            this.x = Math.max(0, Math.min(canvas.width - this.w, this.x + this.rvDashDir * 7.5));
            if (this.rvDashT % 2 === 0) rvFx(this, { k: 'ghost', x: this.x, y: this.y, life: 12, max: 12 });
        }

        // Loạt Tiểu Liên
        if (this.rvBurstLeft > 0 && this.rvMode === 'smg') {
            if (--this.rvBurstT <= 0) {
                if (this.ammo > 0 && !(this.silenceTimer > 0) && !(this.freezeTimer > 0)) {
                    rvFireSmg(this);
                    this.rvBurstLeft--;
                    this.rvBurstT = RV_BURST_GAP;
                } else this.rvBurstLeft = 0;
                if (this.rvBurstLeft <= 0) this.rvBurstCd = 8;
            }
        }
        // Sniper ngắm
        if (this.rvAimT > 0) {
            if (this.silenceTimer > 0 || this.freezeTimer > 0 || this.rvMode !== 'sniper') this.rvAimT = 0;
            else if (--this.rvAimT <= 0 && this.ammo > 0) rvFireSniper(this);
        }

        rvOcaUpdate(this);
        rvBombsUpdate(this);
        rvGrievousUpdate(this);
    },

    speed(s) {
        if (this.rvAimT > 0 || this.rvDashT > 0) return 0;
        if (this.rvMode === 'smg' && rvE1(this)) return s * 1.35;
        if (this.rvMode === 'sniper') return s * 0.9;
        return s;
    },

    shoot(inp, now) {
        if (inp.s) {
            this.rvHold++;
            if (this.rvHold === RV_HOLD) {
                if (this.rvSwCd <= 0 && this.rvAimT <= 0) { rvSwitch(this, inp); this.rvHoldUsed = true; }
                else { rvSfx('click'); this.rvHoldUsed = true; this.rvCdDeny = 20; }
            }
        } else {
            if (this.rvPrevS && this.rvHold < RV_HOLD) {
                if (this.ammo <= 0) rvSfx('click');
                else if (this.rvMode === 'smg') {
                    if (this.rvBurstLeft <= 0 && this.rvBurstCd <= 0) {
                        this.rvBurstLeft = rvE2(this) ? 5 : 3;
                        this.rvBurstT = 0;
                    }
                } else if (this.rvAimT <= 0) {
                    this.rvAimT = RV_AIM;
                }
            }
            this.rvHold = 0; this.rvHoldUsed = false;
        }
        if (this.rvCdDeny > 0) this.rvCdDeny--;
        this.rvPrevS = !!inp.s;
        return true;
    },

    beforeDamage(amount, attacker, options) {
        if (options && options.isEnvironmental) return false;
        if (this.rvDashT > 0 || rvInSmoke(this)) {
            if (this.rvDodgeTxt <= 0) {
                addFloatingText(this.x + this.w / 2, this.y - 12, this.rvDashT > 0 ? 'LƯỚT NÉ 💨' : 'KHÓI CHE 🌫', '#e2e8f0', 12);
                this.rvDodgeTxt = 20;
            }
            return true;
        }
        return false;
    },
});

