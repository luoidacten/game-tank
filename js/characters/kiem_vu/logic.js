// ==========================================
// Kiếm Vũ (kiem_vu) — Logic: "Lấy Kiếm làm tâm"
// ------------------------------------------
// • Bản Mệnh Kiếm (lơ lửng trước mặt): nhấp Bắn lần 1 phóng tới trục X của địch rồi cắm xuống làn địch,
//   nhấp lần 2 thu kiếm về tay. Gây sát thương cả lượt đi lẫn lượt về.
// • Lưu Thủy Kiếm (trên tay): đứng yên tích Tâm Định. Trúng đòn khi đứng yên & ≥25% Tâm Định
//   -> tốn 25% để phản đòn & vào TẬP TRUNG (0.5s, Evo2: 1s): không di chuyển, mọi viên đạn tiếp theo
//   tự phản miễn phí và làm mới thời gian. Máu < 25% -> loạn tâm, không thể Tập Trung.
// • Đạn thường: phản 100%, 0 dame. Xuyên / Nổ: phản nhưng chịu 25%. Hitscan: hóa đạn vật lý trả về, chịu 75%.
//   Cận chiến / lao húc: tốn 25% Tâm Định gạt đỡ, không vào Tập Trung.
// • Sát Ý: mỗi lần phản +20% (Evo1 +30%), hòm Nạp Đạn +25%. Đầy 100% -> phát phóng kế tiếp là TÂM KIẾM:
//   chém hitscan dọc cả cột, xuyên Khiên & Tường.
// Toàn bộ trạng thái là trường số/boolean/mảng thường trên Player (đồng bộ online được).
// ==========================================

const KV_WATER = '#38bdf8';
const KV_WATER_LIGHT = '#bae6fd';
const KV_BLOOD = '#ff3860';
const KV_SW_FLOAT = 0, KV_SW_FLY = 1, KV_SW_PLANT = 2, KV_SW_RETURN = 3;
const KV_AMMO_SENTINEL = 1000; // maxAmmo ảo: hòm Nạp Đạn đặt ammo = maxAmmo -> nhận biết được

function kvEvo1(p) { return p.hasUpgrade('evo_kv_1'); }
function kvEvo2(p) { return p.hasUpgrade('evo_kv_2'); }
function kvFull(p) { return kvEvo1(p) && kvEvo2(p); }
function kvEnemy(p) { return p === p1 ? p2 : p1; }
function kvDirY(p) { return p.id === 1 ? -1 : 1; }
function kvSwordDmg(p) { return (p.damage + (p.dmgBuff || 0)) * (kvFull(p) ? 1.15 : 1); }
function kvSwordSpeed(p) { return kvFull(p) ? 15 : 11; }
function kvFocusDur(p) { return kvEvo2(p) ? 60 : 30; }
function kvLowHp(p) { return p.hp < p.maxHp * 0.25; }
// Vị trí Bản Mệnh Kiếm khi lơ lửng trước mặt
function kvFloatPos(p) {
    const bob = Math.sin((p.kvTick || 0) / 12) * 2.5;
    return { x: p.x + p.w / 2, y: p.id === 1 ? p.y - 18 + bob : p.y + p.h + 18 - bob };
}
// Đang ở thế Kiếm Tâm (có thể phản đòn đầu tiên) hoặc đang Tập Trung
function kvInStance(p) { return p.kvFocus > 0 || (p.kvStill && p.kvTam >= 25); }
function kvCanReflect(p) { return p.hp > 0 && !kvLowHp(p) && !(p.freezeTimer > 0) && kvInStance(p); }

function kvGiveCoins(p, n) { if (p.id === 1) gameState.p1Coins += n; else gameState.p2Coins += n; }

// Phân loại đạn địch khi bị gạt
function kvBulletKind(b) {
    if (b.isRaycast || b.isLazer || b.isHitscan) return 'hitscan';
    if (b.isExplosive || b.isRocket || b.createFireZone || b.type === 'hu_vo' || b.type === 'purple' || b.type === 'gojo_blue' || b.isCannonball) return 'explosive';
    if (b.isPiercing || b.isSniperBullet || b.isSukunaSlash || b.isFuga) return 'pierce';
    return 'normal';
}
const KV_RESIDUAL = { normal: 0, pierce: 0.25, explosive: 0.25, hitscan: 0.75 };

// Bắn trả 1 viên kiếm khí (đạn phản) từ trước mặt về phía địch
function kvSpawnReflect(p, srcX, srcY, srcVx, srcVy, dmg, opts = {}) {
    const enemy = kvEnemy(p);
    const dirY = kvDirY(p);
    let spd = Math.max(7, Math.min(13, Math.hypot(srcVx, srcVy) || 8));
    let vx, vy;
    if (kvEvo2(p) && enemy) {
        const a = aimVelocity(srcX, srcY, enemy, spd, true);
        vx = a.vx; vy = a.vy;
    } else {
        // Văng ngược lại, lệch ngẫu nhiên
        let rvx = -(srcVx || 0), rvy = -(srcVy || 0);
        if (Math.sign(rvy) !== dirY) rvy = dirY * Math.max(3, Math.abs(rvy)); // luôn bay về phía địch
        let ang = Math.atan2(rvy, rvx) + (Math.random() - 0.5) * 0.25;
        vx = Math.cos(ang) * spd; vy = Math.sin(ang) * spd;
        if (Math.sign(vy) !== dirY) vy = dirY * Math.max(3, Math.abs(vy));
    }
    const b = spawnBullet(p, {
        x: srcX - 4, y: srcY - 9, w: 8, h: 18, vx, vy,
        dmg: Math.max(0.25, Math.min(3, dmg)), hook: 'kiem_vu_ref',
        kvRefCount: opts.refCount || 1, isExplosive: !!opts.explosive, isHoming: kvEvo2(p),
    });
    return b;
}

// Một lần phản đòn thành công (đạn hoặc hitscan)
function kvOnReflect(p, kind, srcDmg, attacker, fxX, fxY) {
    const entering = !(p.kvFocus > 0);
    if (entering) {
        p.kvTam = Math.max(0, p.kvTam - 25);
        addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -26 : p.h + 30), 'TẬP TRUNG!', KV_WATER_LIGHT, 13);
        if (soundSystem && !soundSystem.muted) soundSystem.playShieldBreak();
    } else if (soundSystem && !soundSystem.muted) soundSystem.playHit();
    p.kvFocus = kvFocusDur(p);
    p.kvFocusMax = p.kvFocus;
    const prevSat = p.kvSat;
    p.kvSat = Math.min(100, p.kvSat + (kvEvo1(p) ? 30 : 20));
    if (prevSat < 100 && p.kvSat >= 100) addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -54 : p.h + 58), 'SÁT Ý ĐẦY — TÂM KIẾM!', KV_BLOOD, 13);
    p.kvReflects = (p.kvReflects || 0) + 1;
    kvParryFx(p, fxX, fxY);
    const frac = KV_RESIDUAL[kind] || 0;
    if (frac > 0 && srcDmg > 0) {
        addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -12 : p.h + 16), kind === 'hitscan' ? 'CHÉM GÃY TIA!' : 'DƯ CHẤN!', '#fca5a5', 11);
        p.takeDamage(srcDmg * frac, attacker, { kvPass: true, isPiercing: true });
    }
}

function kvParryFx(p, x, y) {
    p.kvParryFx = 14;
    p.kvParrySide = -(p.kvParrySide || 1);
    const cx = x !== undefined ? x : p.x + p.w / 2;
    const cy = y !== undefined ? y : (p.id === 1 ? p.y - 6 : p.y + p.h + 6);
    spawnSparkParticles(cx, cy, KV_WATER_LIGHT, 7);
    spawnSparkParticles(cx, cy, '#ffffff', 3);
}

// Quét đạn địch sắp chạm thân -> phản trước khi va chạm được tính
function kvScanBullets(p) {
    const enemy = kvEnemy(p);
    if (!enemy || !enemy.bullets || !enemy.bullets.length) return;
    const dirY = kvDirY(p);
    // Tầm gạt của Lưu Thủy Kiếm: rộng hơn thân 6px, vươn về phía trước 12px
    const bx = p.x - 6, bw = p.w + 12;
    const by = dirY < 0 ? p.y - 14 : p.y - 2, bh = p.h + 16;
    const pcx = p.x + p.w / 2, pcy = p.y + p.h / 2;
    for (let i = enemy.bullets.length - 1; i >= 0; i--) {
        if (!kvCanReflect(p)) return;
        const b = enemy.bullets[i];
        if (!b || b.isStormPhantom || b.isStormShadow) continue;
        if (!(b.dmg > 0)) continue;
        if ((b.kvRefCount || 0) >= 3) continue; // tránh 2 Kiếm Vũ đánh bóng bàn vô hạn
        if (b.hitIds && b.hitIds.includes && b.hitIds.includes(p)) continue;
        const vx = b.vx || 0, vy = b.vy || 0;
        const x0 = Math.min(b.x, b.x + vx), y0 = Math.min(b.y, b.y + vy);
        const x1 = Math.max(b.x, b.x + vx) + (b.w || 6), y1 = Math.max(b.y, b.y + vy) + (b.h || 6);
        if (!rectIntersect(x0, y0, x1 - x0, y1 - y0, bx, by, bw, bh)) continue;
        // Chỉ gạt đạn đang lao tới
        const toward = (pcx - (b.x + (b.w || 6) / 2)) * vx + (pcy - (b.y + (b.h || 6) / 2)) * vy;
        if (toward < 0 && !rectIntersect(b.x, b.y, b.w || 6, b.h || 6, p.x, p.y, p.w, p.h)) continue;
        const kind = kvBulletKind(b);
        enemy.bullets.splice(i, 1);
        const fy = dirY < 0 ? p.y - 8 : p.y + p.h + 8;
        const fx = Math.max(p.x, Math.min(p.x + p.w, b.x + (b.w || 6) / 2));
        kvSpawnReflect(p, fx, fy, vx, vy, b.dmg, { refCount: (b.kvRefCount || 0) + 1, explosive: kind === 'explosive' });
        kvOnReflect(p, kind, b.dmg, enemy, fx, fy);
    }
}

// Phá hòm / đâm xe tiền trên đường bay của kiếm
function kvSwordHitWorld(p, x, y, w, h, dmg) {
    for (const c of crates) {
        if (c.active && rectIntersect(x, y, w, h, c.x, c.y, c.w, c.h)) {
            c.active = false; crateOnBreak(c, p); grantCrateLoot(c, p);
        }
    }
    for (const t of moneyTrucks) {
        if (!t.active || !rectIntersect(x, y, w, h, t.x, t.y, t.w, t.h)) continue;
        if ((p.kvTick - (t._kvHitT === undefined ? -999 : t._kvHitT)) < 20) continue;
        t._kvHitT = p.kvTick;
        t.hp -= dmg;
        spawnSparkParticles(t.x + t.w / 2, t.y + t.h / 2, 'gold', 5);
        if (t.hp <= 0) {
            t.active = false;
            kvGiveCoins(p, 30);
            explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 60, 'rgba(255,215,0,', 0, p));
        }
    }
}

function kvSwordStrikeEnemy(p, enemy, dmg) {
    enemy.takeDamage(dmg, p, { kvSword: true });
    if (kvFull(p)) {
        enemy.bleedTimer = Math.max(enemy.bleedTimer || 0, 60);
        enemy.bleedDmg = Math.max(enemy.bleedDmg || 0, 0.04);
    }
    explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 26, 'rgba(56, 189, 248,', 0, p));
    spawnSparkParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, KV_WATER_LIGHT, 8);
}

function kvPushTrail(p) {
    if (!p.kvTrail) p.kvTrail = [];
    p.kvTrail.unshift([Math.round(p.kvSwX * 10) / 10, Math.round(p.kvSwY * 10) / 10]);
    if (p.kvTrail.length > 12) p.kvTrail.length = 12;
}

function kvUpdateSword(p) {
    const enemy = kvEnemy(p);
    const spd = kvSwordSpeed(p);
    const dmg = kvSwordDmg(p);
    if (p.kvSwState === KV_SW_FLOAT) {
        const f = kvFloatPos(p);
        p.kvSwX = f.x; p.kvSwY = f.y;
        p.kvSwAng = kvDirY(p) < 0 ? -Math.PI / 2 : Math.PI / 2;
        if (p.kvTrail && p.kvTrail.length) p.kvTrail.pop();
        return;
    }
    if (p.kvSwState === KV_SW_PLANT) {
        if (p.kvTrail && p.kvTrail.length) p.kvTrail.pop();
        // Evo 1: kiếm cắm tỏa kiếm khí làm chậm
        if (kvEvo1(p) && enemy && enemy.hp > 0 && Math.abs(enemy.x + enemy.w / 2 - p.kvSwX) < 44 && Math.abs(enemy.y + enemy.h / 2 - p.kvSwY) < 40) {
            addStatusSlow(enemy, 0.55);
        }
        return;
    }
    let tx, ty;
    if (p.kvSwState === KV_SW_FLY) { tx = p.kvSwTx; ty = p.kvSwTy; }
    else { const f = kvFloatPos(p); tx = f.x; ty = f.y; }
    const dx = tx - p.kvSwX, dy = ty - p.kvSwY;
    const d = Math.hypot(dx, dy);
    const s = p.kvSwState === KV_SW_RETURN ? spd * 1.1 : spd;
    p.kvSwAng = Math.atan2(dy, dx);
    // Lướt theo nhiều bước nhỏ để không xuyên qua mục tiêu
    const steps = Math.max(1, Math.ceil(Math.min(s, d) / 8));
    const stepLen = Math.min(s, d) / steps;
    for (let k = 0; k < steps; k++) {
        p.kvSwX += dx / (d || 1) * stepLen;
        p.kvSwY += dy / (d || 1) * stepLen;
        const hx = p.kvSwX - 8, hy = p.kvSwY - 12;
        if (enemy && enemy.hp > 0 && !p.kvSwHit && rectIntersect(hx, hy, 16, 24, enemy.x, enemy.y, enemy.w, enemy.h)) {
            p.kvSwHit = true;
            kvSwordStrikeEnemy(p, enemy, dmg);
        }
        kvSwordHitWorld(p, hx, hy, 16, 24, dmg);
    }
    kvPushTrail(p);
    if (d <= s) {
        p.kvSwX = tx; p.kvSwY = ty;
        if (p.kvSwState === KV_SW_FLY) {
            p.kvSwState = KV_SW_PLANT;
            p.kvPlantFx = 24;
            p.kvSwAng = kvDirY(p) < 0 ? -Math.PI / 2 : Math.PI / 2;
            spawnSparkParticles(tx, ty, KV_WATER_LIGHT, 6);
        } else {
            p.kvSwState = KV_SW_FLOAT;
            spawnSparkParticles(tx, ty, KV_WATER, 4);
        }
    }
}

// Full Evo: 4 Kiếm Phụ lao ra tấn công rồi tự thu về
function kvSummonMinis(p) {
    if (!p.kvMinis) p.kvMinis = [];
    const f = kvFloatPos(p);
    for (let k = 0; k < 4; k++) {
        const off = (k - 1.5) * 16;
        p.kvMinis.push({ x: f.x + off, y: f.y, ph: 0, delay: k * 4, life: 200, ang: kvDirY(p) < 0 ? -Math.PI / 2 : Math.PI / 2, off });
    }
    addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -34 : p.h + 38), 'VẠN KIẾM QUY TÂM!', '#e0f2fe', 13);
}

function kvUpdateMinis(p) {
    if (!p.kvMinis || !p.kvMinis.length) return;
    const enemy = kvEnemy(p);
    for (let i = p.kvMinis.length - 1; i >= 0; i--) {
        const m = p.kvMinis[i];
        if (m.delay > 0) { m.delay--; const f = kvFloatPos(p); m.x = f.x + m.off; m.y = f.y; continue; }
        if (--m.life <= 0) { p.kvMinis.splice(i, 1); continue; }
        let tx, ty;
        if (m.ph === 0 && enemy && enemy.hp > 0) { tx = enemy.x + enemy.w / 2 + m.off * 0.3; ty = enemy.y + enemy.h / 2; }
        else { m.ph = 1; tx = p.x + p.w / 2 + m.off; ty = p.y + p.h / 2; }
        const dx = tx - m.x, dy = ty - m.y, d = Math.hypot(dx, dy) || 1;
        const s = 10;
        // Bẻ lái mượt
        const want = Math.atan2(dy, dx);
        let diff = want - m.ang;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        m.ang += Math.max(-0.35, Math.min(0.35, diff));
        if (d < 60) m.ang = want;
        m.x += Math.cos(m.ang) * Math.min(s, d);
        m.y += Math.sin(m.ang) * Math.min(s, d);
        if (m.ph === 0 && enemy && rectIntersect(m.x - 5, m.y - 9, 10, 18, enemy.x, enemy.y, enemy.w, enemy.h)) {
            m.ph = 1;
            enemy.takeDamage(0.25 * kvSwordDmg(p), p, { kvSword: true });
            spawnSparkParticles(m.x, m.y, KV_WATER_LIGHT, 4);
        } else if (m.ph === 1 && d < 14) {
            p.kvMinis.splice(i, 1);
        }
    }
}

// Tâm Kiếm: chém hitscan dọc cả cột, xuyên Khiên & Tường
function kvTamKiem(p) {
    const enemy = kvEnemy(p);
    const cx = p.x + p.w / 2;
    const dmg = 2 * kvSwordDmg(p);
    p.kvSat = 0;
    p.kvSlashFx = 30; p.kvSlashX = cx;
    if (enemy && enemy.hp > 0 && enemy.x < cx + 14 && enemy.x + enemy.w > cx - 14) {
        enemy.takeDamage(dmg, p, { bypassShield: true, kvHitscan: true });
        if (kvFull(p)) { enemy.bleedTimer = Math.max(enemy.bleedTimer || 0, 60); enemy.bleedDmg = Math.max(enemy.bleedDmg || 0, 0.04); }
        explosions.push(new Explosion(cx, enemy.y + enemy.h / 2, 44, 'rgba(255, 56, 96,', 0, p));
    }
    kvSwordHitWorld(p, cx - 14, 0, 28, canvas.height, dmg);
    // Bản Mệnh Kiếm hiện thân cắm ngay trên làn địch
    p.kvSwState = KV_SW_PLANT;
    p.kvSwX = cx;
    p.kvSwY = enemy ? enemy.y + enemy.h / 2 : (p.id === 1 ? 40 : canvas.height - 40);
    p.kvSwAng = kvDirY(p) < 0 ? -Math.PI / 2 : Math.PI / 2;
    p.kvPlantFx = 24;
    p.kvTrail = [];
    addFloatingText(cx, p.y + (p.id === 1 ? -30 : p.h + 34), 'TÂM KIẾM!', '#ffffff', 15);
    triggerScreenShake(7, 12);
    if (soundSystem && !soundSystem.muted) soundSystem.playLaser();
}

// Một lần "Điều Kiếm" (nhấp nút Bắn)
function kvCommand(p) {
    const enemy = kvEnemy(p);
    let acted = false;
    if (p.kvSwState === KV_SW_FLOAT) {
        if (p.kvSat >= 100) { kvTamKiem(p); acted = true; }
        else {
            p.kvSwState = KV_SW_FLY;
            p.kvSwHit = false;
            p.kvSwTx = enemy ? Math.max(10, Math.min(canvas.width - 10, enemy.x + enemy.w / 2)) : p.x + p.w / 2;
            p.kvSwTy = enemy ? enemy.y + enemy.h / 2 : (p.id === 1 ? 40 : canvas.height - 40);
            acted = true;
            if (soundSystem && !soundSystem.muted) soundSystem.playShoot('normal');
        }
    } else if (p.kvSwState === KV_SW_FLY || p.kvSwState === KV_SW_PLANT) {
        p.kvSwState = KV_SW_RETURN;
        p.kvSwHit = false;
        acted = true;
        if (soundSystem && !soundSystem.muted) soundSystem.playDash();
    }
    if (!acted) return;
    p.kvCmdCd = 8;
    if (kvFull(p)) {
        if ((p.kvCmdCount || 0) >= 5) { p.kvCmdCount = 0; kvSummonMinis(p); }
        else p.kvCmdCount = (p.kvCmdCount || 0) + 1;
    }
}

BulletHooks.register('kiem_vu_ref', {}); // draw: xem render.js

CharHooks.register('kiem_vu', {
    setup() {
        this.maxAmmo = KV_AMMO_SENTINEL; // ẩn thanh đạn mặc định; xem kvAmmo
        this.kvArmed = false;
        this.kvTick = 0;
        this.kvTam = 0; this.kvSat = 0;
        this.kvFocus = 0; this.kvFocusMax = 30;
        this.kvStill = false; this.kvStillT = 0;
        this.kvPrevS = false; this.kvCmdCd = 0; this.kvCmdCount = 0;
        this.kvSwState = KV_SW_FLOAT; this.kvSwX = this.x + this.w / 2; this.kvSwY = this.y;
        this.kvSwTx = 0; this.kvSwTy = 0; this.kvSwAng = 0; this.kvSwHit = false;
        this.kvTrail = []; this.kvMinis = [];
        this.kvParryFx = 0; this.kvParrySide = 1; this.kvPlantFx = 0; this.kvSlashFx = 0; this.kvSlashX = 0;
        this.kvPrevShield = this.shield || 0;
        this.kvReflects = 0;
    },

    update(inp) {
        this.kvTick++;
        // --- Nhận biết hòm Nạp Đạn (ammo bị đặt = maxAmmo) & hòm Khiên (shield tăng) ---
        if (this.kvArmed && this.ammo >= KV_AMMO_SENTINEL / 2) {
            this.kvSat = Math.min(100, this.kvSat + 25);
            addFloatingText(this.x + this.w / 2, this.y + (this.id === 1 ? -14 : this.h + 18), '+25% SÁT Ý 🩸', KV_BLOOD, 12);
        }
        this.ammo = this.kvSwState === KV_SW_FLOAT ? 1 : 0;
        this.kvArmed = true;
        const sh = this.shield || 0;
        if (sh > this.kvPrevShield) {
            this.kvTam = Math.min(100, this.kvTam + 50 * (sh - this.kvPrevShield));
            addFloatingText(this.x + this.w / 2, this.y + (this.id === 1 ? -24 : this.h + 28), '+50% TÂM ĐỊNH 💧', KV_WATER_LIGHT, 12);
        }
        this.kvPrevShield = sh;

        // --- Tâm Định: đứng yên tích lũy (1.2s đầy, Evo1 0.8s) ---
        this.kvStill = !inp.l && !inp.r;
        if (this.kvStill) {
            this.kvStillT++;
            this.kvTam = Math.min(100, this.kvTam + 100 / (kvEvo1(this) ? 48 : 72));
        } else this.kvStillT = 0;

        // --- Tập Trung ---
        if (this.kvFocus > 0) {
            this.kvFocus--;
            if (kvLowHp(this)) {
                this.kvFocus = 0;
                addFloatingText(this.x + this.w / 2, this.y + (this.id === 1 ? -20 : this.h + 24), 'LOẠN TÂM!', '#f87171', 12);
            }
        }
        if (kvCanReflect(this)) kvScanBullets(this);

        if (this.kvCmdCd > 0) this.kvCmdCd--;
        kvUpdateSword(this);
        kvUpdateMinis(this);
        if (this.kvParryFx > 0) this.kvParryFx--;
        if (this.kvPlantFx > 0) this.kvPlantFx--;
        if (this.kvSlashFx > 0) this.kvSlashFx--;
    },

    speed(s) {
        if (this.kvFocus > 0) return kvFull(this) ? s * 0.35 : 0;
        return s;
    },

    shoot(inp) {
        const pressed = inp.s && !this.kvPrevS;
        this.kvPrevS = !!inp.s;
        if (!pressed || this.kvCmdCd > 0) return true;
        if (this.kvFocus > 0 && !kvEvo2(this)) return true; // đang Tập Trung: chỉ Evo 2 mới điều kiếm được
        kvCommand(this);
        return true;
    },

    beforeDamage(amount, attacker, options) {
        if (options.kvPass || options.isEnvironmental || options.isDot) return false;
        if (!attacker || attacker === this || (attacker !== p1 && attacker !== p2)) return false;
        if (this.freezeTimer > 0 || amount < 0.15) return false;
        const near = Math.abs((attacker.y + attacker.h / 2) - (this.y + this.h / 2)) < 70;
        const st = (new Error().stack) || '';
        const isExplosion = st.indexOf('Explosion') >= 0;
        // Cận chiến / lao húc: gạt đỡ, tốn 25% Tâm Định, không vào Tập Trung
        if (near && !isExplosion && !options.kvSword) {
            if (!kvInStance(this)) return false;
            this.kvTam = Math.max(0, this.kvTam - 25);
            kvParryFx(this, attacker.x + attacker.w / 2, (attacker.y + this.y + this.h) / 2);
            addFloatingText(this.x + this.w / 2, this.y + (this.id === 1 ? -14 : this.h + 18), 'GẠT ĐỠ!', KV_WATER_LIGHT, 13);
            if (soundSystem && !soundSystem.muted) soundSystem.playShieldBreak();
            triggerScreenShake(3, 6);
            return true;
        }
        if (!kvCanReflect(this)) return false;
        const fy = this.id === 1 ? this.y - 8 : this.y + this.h + 8;
        const fx = this.x + this.w / 2;
        if (isExplosion) {
            kvOnReflect(this, 'explosive', amount, attacker, fx, fy);
            return true;
        }
        // Hitscan / đòn tầm xa không phải đạn: hóa thành đạn vật lý trả về
        const kind = options.kvSword ? 'normal' : 'hitscan';
        const ax = attacker.x + attacker.w / 2 - fx, ay = attacker.y + attacker.h / 2 - fy;
        const L = Math.hypot(ax, ay) || 1;
        kvSpawnReflect(this, fx, fy, -ax / L * 10, -ay / L * 10, amount, { refCount: 2 });
        kvOnReflect(this, kind, amount, attacker, fx, fy);
        return true;
    },
});
