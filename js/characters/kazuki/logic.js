// ==========================================
// Kazuki (kazuki) — Logic: Song Kiếm Vô Niệm
// ------------------------------------------
// 1 nút Bắn: nhấp = Tả Trảm [A] | giữ 0.25s rồi nhả = Hữu Trảm [B] | đủ 2 nhịp -> lần bấm kế = Kiếm Thế Quyết
// (AA Toàn Phong / AB Đột Kích / BA Thập Tự / BB Ảnh Bộ). >= 5 Kiếm Ý -> Loạn Vũ Hư Ảnh.
// Giữ 0.6s (khi hồi xong) = Vô Tướng Nghịch Trảm (thủ thế phản đòn).
// Toàn bộ trạng thái là trường thuần trên player / entity trong bodyEffects -> đồng bộ online.
// ==========================================

const KZ_A = '#22d3ee', KZ_B = '#f472b6', KZ_GOLD = '#fde047', KZ_VIOLET = '#a78bfa';
const KZ_HOLD_B = 15, KZ_HOLD_PARRY = 36;
const KZ_NAMES = { AA: 'TOÀN PHONG TRẢM', AB: 'ĐỘT KÍCH ĐIỂM HUYỆT', BA: 'THẬP TỰ TRẢM', BB: 'ẢNH BỘ XUYÊN PHÁ' };

function kzE1(p) { return p.hasUpgrade('evo_kaz_1'); }
function kzE2(p) { return p.hasUpgrade('evo_kaz_2'); }
function kzFull(p) { return kzE1(p) && kzE2(p); }
function kzEnemy(p) { return p === p1 ? p2 : p1; }
function kzDir(p) { return p.id === 1 ? -1 : 1; }
function kzCost(p, base) { return base * (kzE1(p) ? 0.75 : 1); }
function kzSfx(n) { if (soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function kzAlive(t) { return t && t.hp > 0; }
// Đạn "nhỏ" có thể gạt / xóa (không tính tia, chiêu lớn)
function kzSmall(b, max = 16) {
    if (!b || b.isLazer || b.isRaycast || b.isBeam || b.isUltimate) return false;
    return (b.w || 6) <= max && (b.h || 6) <= max * 1.8;
}
function kzOverlap(cx, cy, hw, hh, t) {
    return Math.abs(t.x + t.w / 2 - cx) < hw + t.w / 2 && Math.abs(t.y + t.h / 2 - cy) < hh + t.h / 2;
}
function kzBreakCrates(owner, cx, cy, hw, hh) {
    if (typeof crates === 'undefined') return;
    for (const c of crates) {
        if (c.active && kzOverlap(cx, cy, hw, hh, c)) { c.active = false; crateOnBreak(c, owner); grantCrateLoot(c, owner); }
    }
}

// ---------- Entity: Lốc kiếm Toàn Phong Trảm (AA) ----------
class KazTornado {
    constructor(owner, x, y, r, laneY) {
        this.owner = owner; this.x = x; this.y = y; this.r = r;
        this.vy = kzDir(owner) * 8; this.laneY = laneY;
        this.phase = 0; this.spinT = 50; this.t = 0;
        this.hitCd = 0; this.hitsLeft = 4; this.dmg = 0.4 * owner.damage;
        this.reflect = kzE2(owner);
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.t++;
        const o = this.owner, e = kzEnemy(o);
        if (this.phase === 0) {
            this.y += this.vy;
            if ((this.vy < 0 && this.y <= this.laneY) || (this.vy > 0 && this.y >= this.laneY)) { this.y = this.laneY; this.phase = 1; }
        } else {
            if (e) this.x += Math.sign(e.x + e.w / 2 - this.x) * 0.6;
            if (--this.spinT <= 0) this.active = false;
        }
        // Xóa / phản đạn thường trên đường đi
        if (e && e.bullets) {
            for (let j = e.bullets.length - 1; j >= 0; j--) {
                const b = e.bullets[j];
                if (!kzSmall(b, 24)) continue;
                if (Math.hypot(b.x + (b.w || 6) / 2 - this.x, b.y + (b.h || 6) / 2 - this.y) > this.r + 4) continue;
                e.bullets.splice(j, 1);
                spawnSparkParticles(b.x, b.y, KZ_A, 3);
                if (this.reflect && o.bullets) {
                    spawnBullet(o, { x: b.x, y: b.y, w: b.w || 6, h: b.h || 6, vx: -(b.vx || 0), vy: kzDir(o) * Math.max(5, Math.abs(b.vy || 6)), dmg: Math.min(1, b.dmg || 0.5), hook: 'kazuki', kz: 'R' });
                }
            }
        }
        kzBreakCrates(o, this.x, this.y, this.r * 0.8, this.r * 0.8);
        if (this.hitCd > 0) this.hitCd--;
        if (e && kzAlive(e) && this.hitsLeft > 0 && this.hitCd <= 0 && kzOverlap(this.x, this.y, this.r * 0.85, this.r * 0.85, e)) {
            e.takeDamage(this.dmg, o);
            this.hitCd = 10; this.hitsLeft--;
            fxSlashHit(e.x + e.w / 2, e.y + e.h / 2, KZ_A, 18);
        }
    }
    draw() { if (typeof kzDrawTornado === 'function') kzDrawTornado(this); }
}

// ---------- Entity: Vệt kiếm dưới đất (BA Evo 2): chậm + cấm hồi máu ----------
class KazScar {
    constructor(owner, x, y) {
        this.owner = owner; this.x = x; this.y = y; this.hw = 46; this.hh = 16;
        this.life = 180; this.maxLife = 180; this.active = true;
    }
    update() {
        if (!this.active) return;
        if (--this.life <= 0) { this.active = false; return; }
        const o = this.owner, e = kzEnemy(o);
        if (e && kzAlive(e) && kzOverlap(this.x, this.y, this.hw, this.hh, e)) {
            addStatusSlow(e, 0.6);
            o.kazCutT = Math.max(o.kazCutT || 0, 2); o.kazCutMult = 1;
        }
    }
    draw() { if (typeof kzDrawScar === 'function') kzDrawScar(this); }
}

// ---------- Entity: Hư Ảnh bám mục tiêu, nổ sau `delay` tick ----------
class KazEcho {
    constructor(owner, target, delay, dmg, kb, color) {
        this.owner = owner; this.target = target;
        this.delay = delay; this.maxDelay = delay; this.dmg = dmg; this.kb = kb;
        this.color = color || KZ_VIOLET;
        this.x = target.x + target.w / 2; this.y = target.y + target.h / 2;
        this.t = 0; this.done = false; this.active = true;
    }
    update() {
        if (!this.active) return;
        const tg = this.target;
        if (kzAlive(tg)) { this.x = tg.x + tg.w / 2; this.y = tg.y + tg.h / 2; }
        this.t++;
        if (!this.done && this.t >= this.delay) {
            this.done = true;
            if (kzAlive(tg)) {
                tg.takeDamage(this.dmg, this.owner);
                if (this.kb) tg.kbX = (tg.x + tg.w / 2 < canvas.width / 2 ? -1 : 1) * 11;
            }
            explosions.push(new Explosion(this.x, this.y, 46, 'rgba(167, 139, 250,', 0, this.owner));
            fxSlashHit(this.x, this.y, '#ffffff', 26);
            triggerScreenShake(4, 8);
            kzSfx('playExplosion');
        }
        if (this.done && this.t > this.delay + 14) this.active = false;
    }
    draw() { if (typeof kzDrawEcho === 'function') kzDrawEcho(this); }
}

// ---------- Entity: Loạn Vũ Hư Ảnh ----------
class KazLoanVu {
    constructor(owner, target) {
        this.owner = owner; this.target = target;
        this.x = target.x + target.w / 2; this.y = target.y + target.h / 2;
        this.phase = 0; this.t = 0; this.warn = 24; this.hit = 0;
        this.seed = Math.round(Math.random() * 600) / 100;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        const o = this.owner, tg = this.target;
        this.t++;
        if (this.phase === 0) {                    // dấu khóa: còn trong vòng khi hết cảnh báo -> trúng
            if (this.t >= this.warn) {
                if (kzAlive(tg) && Math.abs(tg.x + tg.w / 2 - this.x) < 48) {
                    this.phase = 1; this.t = 0;
                    addFloatingText(this.x, this.y - 20, 'KHÓA CHÂN!', KZ_VIOLET, 13);
                } else { this.phase = 2; this.t = 0; addFloatingText(this.x, this.y - 20, 'HỤT', '#94a3b8', 11); }
            }
            return;
        }
        if (this.phase === 2) { if (this.t > 16) this.active = false; return; }
        // phase 1: 5 nhát trong 1.5s, trói chân mục tiêu
        if (kzAlive(tg)) { this.x = tg.x + tg.w / 2; this.y = tg.y + tg.h / 2; addStatusSlow(tg, 0); }
        if (this.t % 18 === 0 && this.hit < 5) {
            this.hit++;
            const a = this.seed + this.hit * 1.2566;
            fxSweep(this.x, this.y, 24, a - 1.2, a + 1.2, this.hit === 5 ? KZ_GOLD : KZ_VIOLET, 14, this.hit === 5 ? 10 : 6);
            if (kzAlive(tg)) {
                if (this.hit < 5) tg.takeDamage(0.3 * o.damage, o);
                else {
                    tg.takeDamage(1.3 * o.damage, o);
                    tg.freezeTimer = Math.max(tg.freezeTimer || 0, 45);
                    tg.kbX = (tg.x + tg.w / 2 < canvas.width / 2 ? -1 : 1) * 9;
                    explosions.push(new Explosion(this.x, this.y, 60, 'rgba(253, 224, 71,', 0, o));
                    addFloatingText(this.x, this.y - 22, 'HẤT TUNG!', KZ_GOLD, 14);
                    triggerScreenShake(6, 10);
                }
            }
            kzSfx('playHit');
        }
        if (this.t >= 106) this.active = false;
    }
    draw() { if (typeof kzDrawLoanVu === 'function') kzDrawLoanVu(this); }
}

// ---------- Entity: Vạn Cảnh Trảm Vực (Full Evo) ----------
class KazDomain {
    constructor(owner, target) {
        this.owner = owner;
        this.x = target.x + target.w / 2; this.y = target.y + target.h / 2;
        this.hw = 95; this.hh = 34;
        this.life = 240; this.maxLife = 240; this.tick = 0;
        this.lastX = target.x; this.active = true;
    }
    update() {
        if (!this.active) return;
        if (--this.life <= 0) { this.active = false; return; }
        this.tick++;
        const o = this.owner, e = kzEnemy(o);
        if (!e || !kzAlive(e)) return;
        const inside = kzOverlap(this.x, this.y, this.hw, this.hh, e);
        if (inside) {
            // Cấm lướt / dịch chuyển: chặn mọi cú nhảy ngang lớn trong 1 tick
            if (Math.abs(e.x - this.lastX) > 12) e.x = this.lastX + Math.sign(e.x - this.lastX) * 4;
            // Hút nhẹ về tâm
            const dx = this.x - (e.x + e.w / 2);
            if (Math.abs(dx) > 3) e.x += Math.sign(dx) * 0.7;
            e.x = Math.max(0, Math.min(canvas.width - e.w, e.x));
            if (this.tick % 15 === 0) {
                e.takeDamage(0.1 * o.damage, o, { bypassShield: true });
                fxSlashHit(e.x + e.w / 2 + (Math.random() - 0.5) * 20, e.y + e.h / 2, KZ_A, 14);
            }
        }
        this.lastX = e.x;
    }
    draw() { if (typeof kzDrawDomain === 'function') kzDrawDomain(this); }
}

function kzOpenDomain(p) {
    const e = kzEnemy(p);
    if (!kzFull(p) || !e) return;
    bodyEffects.push(new KazDomain(p, e));
    addFloatingText(e.x + e.w / 2, e.y - 26, 'VẠN CẢNH TRẢM VỰC!', KZ_A, 14);
}

// ---------- Nhịp A / B ----------
function kzSlashA(p) {
    const dir = kzDir(p), cx = p.x + p.w / 2, cy = p.y + p.h / 2, fwd = dir < 0 ? -Math.PI / 2 : Math.PI / 2;
    spawnBullet(p, { x: cx - 14, y: dir < 0 ? p.y - 14 : p.y + p.h, w: 28, h: 12, vx: 0, vy: dir * 9, dmg: 0.85 * p.damage, hook: 'kazuki', kz: 'A' });
    // Gạt vỡ đạn nhỏ bay tới trong hình nón trước mặt
    const e = kzEnemy(p);
    let n = 0;
    if (e && e.bullets) {
        for (let j = e.bullets.length - 1; j >= 0; j--) {
            const b = e.bullets[j];
            if (!kzSmall(b)) continue;
            const bx = b.x + (b.w || 6) / 2, by = b.y + (b.h || 6) / 2;
            const d = Math.hypot(bx - cx, by - cy);
            if (d > 130) continue;
            const ang = Math.abs(Math.atan2(bx - cx, (by - cy) * dir)); // 0 = thẳng trước mặt
            if (d > 30 && ang > 0.95) continue;
            e.bullets.splice(j, 1); n++;
            spawnSparkParticles(bx, by, KZ_A, 4);
        }
    }
    if (n) addFloatingText(cx, p.y - 14, 'GẠT ĐẠN!', KZ_A, 11);
    fxSweep(cx, cy, 26, fwd + 1.15, fwd - 1.15, KZ_A, 12, 8);
    p.kazSwing = 12; p.kazSwingSide = 'A';
    kzSfx('playShoot');
}
function kzSlashB(p) {
    const dir = kzDir(p), cx = p.x + p.w / 2, cy = p.y + p.h / 2, fwd = dir < 0 ? -Math.PI / 2 : Math.PI / 2;
    spawnBullet(p, { x: cx - 32, y: dir < 0 ? p.y - 16 : p.y + p.h, w: 64, h: 14, vx: 0, vy: dir * 7.5, dmg: 1.25 * p.damage, hook: 'kazuki', kz: 'B' });
    fxSweep(cx, cy, 34, fwd - 1.45, fwd + 1.45, KZ_B, 15, 13);
    triggerScreenShake(2, 4);
    p.kazSwing = 15; p.kazSwingSide = 'B';
    kzSfx('playShoot');
}

// ---------- Kiếm Thế Quyết ----------
function kzThrust(p) {
    const e = kzEnemy(p), dir = kzDir(p);
    const cx = p.x + p.w / 2, y0 = dir < 0 ? p.y : p.y + p.h;
    const hw = 11;
    let stopY = null;
    if (!kzE2(p)) {
        // Vật cản trên cột chặn luồng kiếm (Evo 2 xuyên tất cả)
        const obs = [];
        if (movingObstacle && movingObstacle.active) obs.push(movingObstacle);
        if (typeof bastions !== 'undefined') bastions.forEach(o => o.active && obs.push(o));
        if (typeof sniperWalls !== 'undefined') sniperWalls.forEach(o => o.active !== false && o.owner !== p && obs.push(o));
        bodyEffects.forEach(o => o.isStone && o.active && obs.push(o));
        for (const o of obs) {
            if (Math.abs(o.x + o.w / 2 - cx) > hw + o.w / 2) continue;
            const oy = dir < 0 ? o.y + o.h : o.y;
            if ((oy - y0) * dir < 0) continue;
            if (e && (oy - (e.y + e.h / 2)) * dir > 0) continue; // sau lưng địch
            if (stopY === null || (oy - stopY) * dir < 0) stopY = oy;
        }
    }
    if (stopY !== null) {
        explosions.push(new Explosion(cx, stopY, 26, 'rgba(34, 211, 238,', 0, p));
        addFloatingText(cx, stopY, 'BỊ CHẶN', '#94a3b8', 11);
        return;
    }
    kzBreakCrates(p, cx, canvas.height / 2, hw, canvas.height / 2);
    if (e && kzAlive(e) && Math.abs(e.x + e.w / 2 - cx) < hw + e.w / 2) {
        const d = e.takeDamage(1.5 * p.damage, p, { bypassShield: kzE2(p), isPiercing: kzE2(p) });
        if (d > 0) {
            e.freezeTimer = Math.max(e.freezeTimer || 0, 60);
            addFloatingText(e.x + e.w / 2, e.y - 14, 'ĐIỂM HUYỆT!', KZ_A, 13);
        }
        fxSlashHit(e.x + e.w / 2, e.y + e.h / 2, KZ_A, 24);
        triggerScreenShake(4, 6);
    }
}

function kzStartDash(p, kind) {
    p.kazMode = 'dash'; p.kazDashKind = kind; p.kazPhase = 1; p.kazHits = [];
    p.kazLaneY = p.y; p.kazTrail = [];
    p.invincibleTimer = Math.max(p.invincibleTimer || 0, 100);
    kzSfx('playDash');
}
function kzDashStep(p) {
    const dir = kzDir(p);
    if (p.kazPhase === 1) p.y += dir * 18; else p.y -= dir * 13;
    p.kazTrail.unshift(Math.round(p.y));
    if (p.kazTrail.length > 7) p.kazTrail.length = 7;
    p.invincibleTimer = Math.max(p.invincibleTimer || 0, 2);
    const e = kzEnemy(p);
    if (e && kzAlive(e) && !p.kazHits.includes(e) && rectIntersect(p.x, p.y, p.w, p.h, e.x, e.y, e.w, e.h)) {
        p.kazHits.push(e);
        if (p.kazDashKind === 'bb') {
            e.takeDamage(1.6 * p.damage, p);
            e.freezeTimer = Math.max(e.freezeTimer || 0, 60);
            addFloatingText(e.x + e.w / 2, e.y - 14, 'ẢNH BỘ!', KZ_B, 13);
            if (kzE2(p)) bodyEffects.push(new KazEcho(p, e, 40, 0.6 * p.damage, false, KZ_B));
        }
        fxSlashHit(e.x + e.w / 2, e.y + e.h / 2, p.kazDashKind === 'bb' ? KZ_B : KZ_VIOLET, 24);
        spawnSparkParticles(e.x + e.w / 2, e.y + e.h / 2, '#ffffff', 10);
    }
    kzBreakCrates(p, p.x + p.w / 2, p.y + p.h / 2, p.w / 2, p.h / 2);
    if (p.kazPhase === 1) {
        const far = dir < 0 ? (p.y <= 2) : (p.y >= canvas.height - p.h - 2);
        if (far) { p.y = dir < 0 ? 2 : canvas.height - p.h - 2; p.kazPhase = 2; }
        return;
    }
    const home = dir < 0 ? (p.y >= p.kazLaneY) : (p.y <= p.kazLaneY);
    if (home) { p.y = p.kazLaneY; p.kazMode = 'idle'; p.kazPhase = 0; p.kazTrail = []; p.kazHits = []; }
}

function kzLoanVu(p) {
    const e = kzEnemy(p);
    if (!e) return;
    bodyEffects.push(new KazLoanVu(p, e));
    p.kazParryCD = Math.max(0, p.kazParryCD - 240);
    if (kzE2(p)) p.invincibleTimer = Math.max(p.invincibleTimer || 0, 130);
    p.kazAura = 130;
    addFloatingText(p.x + p.w / 2, p.y - 22, 'LOẠN VŨ HƯ ẢNH!', KZ_VIOLET, 15);
    triggerScreenShake(3, 8);
    kzOpenDomain(p);
}

function kzFinisher(p, combo) {
    const dir = kzDir(p), cx = p.x + p.w / 2, cy = p.y + p.h / 2, fwd = dir < 0 ? -Math.PI / 2 : Math.PI / 2;
    const e = kzEnemy(p);
    if (p.kazKY >= 5) { p.kazKY -= 5; kzLoanVu(p); return; }
    p.kazKY = Math.min(10, p.kazKY + (kzE1(p) ? 2 : 1));
    p.kazLastName = combo; p.kazNameT = 50;
    addFloatingText(cx, p.y - 22, KZ_NAMES[combo] + '!', combo[0] === 'A' ? KZ_A : KZ_B, 13);
    if (combo === 'AA') {
        const laneY = e ? e.y + e.h / 2 : (dir < 0 ? 40 : canvas.height - 40);
        bodyEffects.push(new KazTornado(p, cx, cy + dir * 20, kzE2(p) ? 33 : 22, laneY));
        fxSweep(cx, cy, 24, 0, Math.PI * 2, KZ_A, 16, 7);
    } else if (combo === 'AB') {
        scheduleHitscan(p, 16, KZ_A, 22, () => kzThrust(p));
        fxSweep(cx, cy, 22, fwd - 0.4, fwd + 0.4, KZ_A, 12, 6);
    } else if (combo === 'BA') {
        spawnBullet(p, { x: cx - 20, y: dir < 0 ? p.y - 40 : p.y + p.h, w: 40, h: 40, vx: 0, vy: dir * 8, dmg: 1.8 * p.damage, hook: 'kazuki', kz: 'X' });
        fxSweep(cx, cy, 30, fwd - 1.2, fwd + 0.6, KZ_B, 14, 9);
        fxSweep(cx, cy, 30, fwd + 1.2, fwd - 0.6, KZ_B, 16, 9);
    } else {
        kzStartDash(p, 'bb');
    }
    p.kazSwing = 16; p.kazSwingSide = 'X';
    kzSfx('playShoot');
}

function kzAction(p, kind) {
    if (p.kazGCD > 0) return;
    const cx = p.x + p.w / 2;
    if (p.kazMarks.length >= 2 || p.kazFree) {
        const cost = kzCost(p, 25);
        if (p.kazYN < cost) { addFloatingText(cx, p.y - 14, 'THIẾU Ý NIỆM', '#94a3b8', 11); return; }
        p.kazYN -= cost;
        const combo = (p.kazMarks + kind + kind).slice(0, 2);
        p.kazMarks = ''; p.kazFree = false; p.kazGCD = 24;
        kzFinisher(p, combo);
        return;
    }
    const cost = kzCost(p, kind === 'A' ? 10 : 15);
    if (p.kazYN < cost) { addFloatingText(cx, p.y - 14, 'THIẾU Ý NIỆM', '#94a3b8', 11); return; }
    p.kazYN -= cost;
    p.kazMarks += kind;
    p.kazGCD = kind === 'A' ? 14 : 20;
    if (kind === 'A') kzSlashA(p); else kzSlashB(p);
}

function kzParrySuccess(p, attacker) {
    const e = kzEnemy(p);
    p.kazParryT = 0; p.kazParryOK = true;
    p.kazKY = Math.min(10, p.kazKY + 5);
    p.kazFree = true;
    p.invincibleTimer = Math.max(p.invincibleTimer || 0, 60);
    addFloatingText(p.x + p.w / 2, p.y - 22, 'VÔ TƯỚNG NGHỊCH TRẢM!', KZ_GOLD, 15);
    explosions.push(new Explosion(p.x + p.w / 2, p.y + p.h / 2, 42, 'rgba(253, 224, 71,', 0, p));
    triggerScreenShake(5, 8);
    kzSfx('playShieldBreak');
    if (e && kzAlive(e)) {
        e.freezeTimer = Math.max(e.freezeTimer || 0, 60);
        bodyEffects.push(new KazEcho(p, e, 120, 2.0 * p.damage, true, KZ_VIOLET));
        kzStartDash(p, 'parry');
    }
    kzOpenDomain(p);
}

BulletHooks.register('kazuki', {
    hit(b, attacker, victim) {
        const x = b.x + b.w / 2, y = b.y + b.h / 2;
        if (b.kz === 'X' && victim) {
            victim.bleedTimer = Math.max(victim.bleedTimer || 0, 240);
            victim.bleedDmg = 0.025;
            if (attacker) { attacker.kazCutT = Math.max(attacker.kazCutT || 0, 240); attacker.kazCutMult = Math.max(attacker.kazCutMult || 0, 0.6); }
            addFloatingText(victim.x + victim.w / 2, victim.y - 14, 'VẾT THƯƠNG SÂU!', KZ_B, 12);
            if (attacker && kzE2(attacker)) bodyEffects.push(new KazScar(attacker, x, victim.y + victim.h / 2));
        }
        fxSlashHit(x, y, b.kz === 'A' ? KZ_A : (b.kz === 'R' ? KZ_A : KZ_B), b.kz === 'A' ? 16 : 22);
    },
    edge(b, owner) {
        if (b.kz === 'X' && owner && kzE2(owner)) {
            const e = kzEnemy(owner);
            if (e) bodyEffects.push(new KazScar(owner, b.x + b.w / 2, e.y + e.h / 2));
        }
    },
    draw(b) { if (typeof kzDrawBullet === 'function') kzDrawBullet(b); },
});

CharHooks.register('kazuki', {
    setup() {
        this.kazYN = 100;
        this.kazKY = kzFull(this) ? 5 : 0;
        this.kazMarks = ''; this.kazFree = false;
        this.kazHold = 0; this.kazPrevS = false; this.kazHoldUsed = false;
        this.kazParryCD = 0; this.kazParryT = 0; this.kazParryOK = false; this.kazStagger = 0;
        this.kazGCD = 0; this.kazMode = 'idle'; this.kazDashKind = ''; this.kazPhase = 0;
        this.kazHits = []; this.kazTrail = []; this.kazLaneY = this.y;
        this.kazSwing = 0; this.kazSwingSide = ''; this.kazAura = 0;
        this.kazCutT = 0; this.kazCutMult = 0; this.kazEHp = null;
        this.kazLastName = ''; this.kazNameT = 0;
    },
    update() {
        const e1 = kzE1(this);
        this.kazYN = Math.min(100, this.kazYN + (e1 ? 10 : 6) / 60);
        if (this.kazGCD > 0) this.kazGCD--;
        if (this.kazParryCD > 0) this.kazParryCD--;
        if (this.kazStagger > 0) this.kazStagger--;
        if (this.kazSwing > 0) this.kazSwing--;
        if (this.kazAura > 0) this.kazAura--;
        if (this.kazNameT > 0) this.kazNameT--;
        // Vết Thương Sâu / Cấm Hồi Máu: cắt phần máu địch hồi lại
        const e = kzEnemy(this);
        if (e) {
            if (this.kazCutT > 0 && typeof this.kazEHp === 'number' && e.hp > this.kazEHp && e.hp > 0) {
                e.hp = this.kazEHp + (e.hp - this.kazEHp) * (1 - this.kazCutMult);
            }
            this.kazEHp = e.hp;
        }
        if (this.kazCutT > 0 && --this.kazCutT <= 0) this.kazCutMult = 0;
        // Thủ thế Nghịch Trảm
        if (this.kazParryT > 0 && --this.kazParryT <= 0 && !this.kazParryOK) {
            if (!e1) this.kazStagger = 18;
            addFloatingText(this.x + this.w / 2, this.y - 14, e1 ? 'ĐỠ HỤT' : 'ĐỠ HỤT - KHỰNG!', '#94a3b8', 11);
        }
        if (this.kazMode === 'dash') kzDashStep(this);
    },
    speed(s) {
        if (this.kazMode !== 'idle' || this.kazParryT > 0 || this.kazStagger > 0) return 0;
        return kzFull(this) ? s * 4.2 / 3.8 : s;
    },
    shoot(inp) {
        const s = !!inp.s;
        const released = !s && this.kazPrevS;
        this.kazPrevS = s;
        if (this.kazMode !== 'idle' || this.kazStagger > 0 || this.kazParryT > 0) {
            this.kazHold = 0; this.kazHoldUsed = this.kazHoldUsed || s;
            return true;
        }
        if (s) {
            this.kazHold++;
            if (this.kazHold === KZ_HOLD_PARRY && !this.kazHoldUsed && this.kazParryCD <= 0) {
                this.kazHoldUsed = true;
                this.kazParryT = kzE1(this) ? 48 : 36;
                this.kazParryOK = false;
                this.kazParryCD = kzE1(this) ? 600 : 840;
                addFloatingText(this.x + this.w / 2, this.y - 16, 'THỦ THẾ', KZ_GOLD, 12);
                kzSfx('playClick');
            }
        } else if (released) {
            if (!this.kazHoldUsed) kzAction(this, this.kazHold < KZ_HOLD_B ? 'A' : 'B');
            this.kazHold = 0; this.kazHoldUsed = false;
        } else { this.kazHold = 0; this.kazHoldUsed = false; }
        return true;
    },
    beforeDamage(amount, attacker, options) {
        if (this.kazParryT > 0 && !(options && options.isEnvironmental)) {
            kzParrySuccess(this, attacker);
            return true;
        }
        return false;
    },
});
