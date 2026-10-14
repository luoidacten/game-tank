// ==========================================
// T-Zero (t_zero) — Logic: "Hệ Thống KÍCH HOẠT: T-ZERO ON"
// Thiết Luật: giữ nhẹ nút Bắn (~0.25s) đổi chế độ THỦ -> CÔNG -> THIÊN LUẬT THỨC, nhấp = đòn của chế độ.
//   THỦ  : ném Khiên Boomerang (chạm vật -> gây sát thương / mở hòm rồi bay về). Khiên trên tay -> phản đạn địch.
//   CÔNG : tăng tốc & sát thương; nhấp = Thiết Quyền Xung Kích (lao thẳng lên như Xe TANK rồi lùi về làn).
//   THIÊN: bay lên (không thể bị nhắm), lái Tâm Ngắm, tự dội pháo; nhấp lần nữa = đáp xuống gây nổ choáng.
// Năng Lượng (NL) 0..100: mọi lần tiêu hao khóa tự hồi đúng 1 giây.
// Toàn bộ trạng thái là trường thường trên player / thực thể trong bodyEffects (đồng bộ online được).
// ==========================================

const TZ_MODES = ['thu', 'cong', 'thien'];
const TZ_MODE_NAME = { thu: 'THỦ 🛡', cong: 'CÔNG 👊', thien: 'THIÊN LUẬT ☄' };
const TZ_MODE_COLOR = { thu: '#22d3ee', cong: '#ff4d6d', thien: '#facc15' };
const TZ_HOLD_TICKS = 15;          // giữ ~0.25s để đổi chế độ
const TZ_HOLD_REPEAT = 28;         // giữ tiếp -> đổi tiếp
const TZ_REGEN_LOCK = 60;          // khóa hồi NL 1 giây sau mỗi lần tiêu hao
const TZ_DASH_SPEED = 16, TZ_DASH_BACK = 11;

function tzEvo1(p) { return p.hasUpgrade('evo_tzero_1'); }
function tzEvo2(p) { return p.hasUpgrade('evo_tzero_2'); }
function tzFull(p) { return tzEvo1(p) && tzEvo2(p); }
function tzEnemy(p) { return p === p1 ? p2 : p1; }
function tzDir(p) { return p.id === 1 ? -1 : 1; }
function tzBaseDmg(p) { return (p.damage || 1) + (p.dmgBuff || 0); }

// Bảng tiêu hao NL (Evo 1 giảm toàn bộ)
function tzCost(p, key, bulletDmg = 1) {
    const e1 = tzEvo1(p);
    switch (key) {
        case 'shield': return e1 ? 3 : 5;
        case 'reflect': return e1 ? 10 + bulletDmg * 7 : 15 + bulletDmg * 10;
        case 'punch': return e1 ? 7 : 10;
        case 'fly': return e1 ? 18 : 25;
        case 'flyDrain': return (e1 ? 3 : 5) / 60;
        case 'smg': return 1 / 60;
    }
    return 0;
}

function tzSpend(p, amount) {
    if (p.tzEnergy < amount - 1e-6) return false;
    p.tzEnergy = Math.max(0, p.tzEnergy - amount);
    p.tzRegenLock = TZ_REGEN_LOCK;
    return true;
}

function tzSfx(fn) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[fn]) soundSystem[fn](); }

// ------------------------------------------
// Va chạm chung với vật thể (dùng cho Khiên & Cú Đấm)
// Trả về vật đầu tiên bị trúng (đã áp sát thương), hoặc null.
// ------------------------------------------
function tzHitObjects(p, r, dmg, skip) {
    const enemy = tzEnemy(p);
    const hitObj = (o) => {
        if (!o || o.active === false || o === p || o === p1 || o === p2) return false;
        if (o.owner && o.owner === p) return false;
        if (typeof o.x !== 'number' || !o.w || !o.h) return false;
        if (skip && skip.includes(o.id || o)) return false;
        if (!rectIntersect(r.x, r.y, r.w, r.h, o.x, o.y, o.w, o.h)) return false;
        if (o instanceof Crate) {
            o.active = false; crateOnBreak(o, p); grantCrateLoot(o, p);
            return true;
        }
        if (o === movingObstacle || o.isImmortal) return true; // chỉ nảy về
        if (typeof o.takeDamage === 'function') { o.takeDamage(dmg, p); return true; }
        if (typeof o.hp === 'number') {
            o.hp -= (o instanceof MoneyTruck) ? dmg * 2 : dmg;
            if (o.hp <= 0) {
                o.active = false;
                if (o instanceof MoneyTruck) {
                    const m = 30;
                    if (p.id === 1) gameState.p1Coins += m; else gameState.p2Coins += m;
                    addFloatingText(o.x + o.w / 2, o.y - 8, '+30$', '#ffd700', 12);
                }
                explosions.push(new Explosion(o.x + o.w / 2, o.y + o.h / 2, 32, 'rgba(34, 211, 238,', 0, p));
            }
            return true;
        }
        return true;
    };
    const lists = [crates, moneyTrucks, turrets, creatorTurrets, creatorDrones, creatorRobots,
        (typeof necroMinions !== 'undefined' ? necroMinions : []), sniperWalls, bastions, ghostDecoys,
        (typeof confinementCages !== 'undefined' ? confinementCages : [])];
    for (const list of lists) {
        for (const o of (list || [])) if (hitObj(o)) return o;
    }
    for (const e of bodyEffects) if (e.isStone && hitObj(e)) return e;
    if (enemy && enemy.creatorShield && enemy.creatorShield.active && hitObj(enemy.creatorShield)) return enemy.creatorShield;
    if (movingObstacle && movingObstacle.active && hitObj(movingObstacle)) return movingObstacle;
    return null;
}

// ------------------------------------------
// THỦ: Khiên Boomerang (đối tượng thường trên player: this.tzShield)
// ------------------------------------------
function tzThrowShield(p) {
    if (p.tzShield) return;
    if (!tzSpend(p, tzCost(p, 'shield'))) { tzNoEnergy(p); return; }
    const big = tzEvo2(p);
    const w = big ? 34 : 24, h = big ? 14 : 11;
    const dir = tzDir(p);
    p.tzShield = {
        x: p.x + p.w / 2 - w / 2, y: dir < 0 ? p.y - h - 2 : p.y + p.h + 2, w, h,
        vy: dir * (big ? 9.5 : 7), ret: false, hitEnemy: false, life: 0, spin: 0, trailTick: 0,
    };
    tzSfx('playShoot');
}

function tzUpdateShield(p) {
    const s = p.tzShield;
    if (!s) return;
    const enemy = tzEnemy(p);
    s.life++; s.spin += 0.35;
    const dmg = tzBaseDmg(p) * (tzEvo2(p) ? 1.25 : 1);
    if (!s.ret) {
        s.y += s.vy;
        let bounce = false;
        if (s.y <= 0 || s.y + s.h >= canvas.height) { bounce = true; s.y = Math.max(0, Math.min(canvas.height - s.h, s.y)); }
        if (!bounce && enemy && enemy.hp > 0 && !s.hitEnemy && rectIntersect(s.x, s.y, s.w, s.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
            s.hitEnemy = true; bounce = true;
            enemy.takeDamage(dmg, p);
            spawnSparkParticles(s.x + s.w / 2, s.y + s.h / 2, '#22d3ee', 10);
        }
        if (!bounce && tzHitObjects(p, s, dmg)) bounce = true;
        if (bounce) {
            s.ret = true;
            explosions.push(new Explosion(s.x + s.w / 2, s.y + s.h / 2, 22, 'rgba(34, 211, 238,', 0, p));
            tzSfx('playHit');
        }
        if (s.life > 240) s.ret = true;
        // Evo 2: vệt điện làm chậm
        if (tzEvo2(p) && ++s.trailTick >= 7) {
            s.trailTick = 0;
            bodyEffects.push(new TzZone(s.x + s.w / 2, s.y + s.h / 2, 20, 'spark', p, 100));
        }
    } else {
        // Bay về tay (bám theo vị trí hiện tại của T-Zero)
        const tx = p.x + p.w / 2 - s.w / 2, ty = p.y + p.h / 2 - s.h / 2;
        const dx = tx - s.x, dy = ty - s.y, L = Math.hypot(dx, dy) || 1;
        const sp = tzEvo2(p) ? 11 : 9;
        if (L <= sp + 4) { p.tzShield = null; addFloatingText(p.x + p.w / 2, p.y - 12, 'KHIÊN VỀ', '#22d3ee', 10); return; }
        s.x += dx / L * sp; s.y += dy / L * sp;
    }
}

// Khiên Từ Trường Phản Đạn: chặn đạn địch sắp chạm T-Zero khi khiên đang trên tay (chế độ THỦ)
function tzCanReflect(p) {
    return p.tzMode === 'thu' && !p.tzShield && p.tzDash === 0 && !p.tzFly && p.hp > 0;
}
function tzInterceptBullets(p) {
    const enemy = tzEnemy(p);
    if (!enemy || !enemy.bullets || !enemy.bullets.length) return;
    const flying = !!p.tzFly;
    if (!flying && !tzCanReflect(p)) return;
    const pad = 3;
    for (let i = enemy.bullets.length - 1; i >= 0; i--) {
        const b = enemy.bullets[i];
        if (!b || typeof b.vx !== 'number' || typeof b.vy !== 'number') continue;
        if (b.type === 'purple' || b.type === 'gojo_blue') continue; // đòn đặc biệt quá lớn: không phản
        // Hộp quét: vị trí hiện tại -> vị trí tick sau
        const x0 = Math.min(b.x, b.x + b.vx) - pad, y0 = Math.min(b.y, b.y + b.vy) - pad;
        const x1 = Math.max(b.x, b.x + b.vx) + (b.w || 6) + pad, y1 = Math.max(b.y, b.y + b.vy) + (b.h || 6) + pad;
        if (!rectIntersect(x0, y0, x1 - x0, y1 - y0, p.x, p.y, p.w, p.h)) continue;
        if (flying) continue; // trên không: đạn dưới đất không thể chạm (beforeDamage chặn)
        const bd = Math.max(0.25, Number(b.dmg) || 1);
        const cost = tzCost(p, 'reflect', bd);
        if (p.tzEnergy < cost) {
            if (!p.tzLowWarn) { p.tzLowWarn = 40; addFloatingText(p.x + p.w / 2, p.y - 14, 'KHÔNG ĐỦ NL PHẢN ĐẠN!', '#94a3b8', 11); }
            continue;
        }
        tzSpend(p, cost);
        enemy.bullets.splice(i, 1);
        const sx = p.x + p.w / 2, sy = p.id === 1 ? p.y - 6 : p.y + p.h + 6;
        const sp = Math.max(7, Math.min(12, Math.hypot(b.vx, b.vy)));
        const v = aimVelocity(sx, sy, enemy, sp, true);
        spawnBullet(p, { x: sx - 4, y: sy - 4, w: 8, h: 8, vx: v.vx, vy: v.vy, dmg: Math.min(3, bd), hook: 'tz_reflect' });
        p.tzReflectFlash = 14;
        explosions.push(new Explosion(sx, sy, 26, 'rgba(34, 211, 238,', 0, p));
        spawnSparkParticles(sx, sy, '#a5f3fc', 10);
        addFloatingText(sx, p.y - 16, 'PHẢN ĐẠN! ⟲', '#67e8f9', 12);
        tzSfx('playShieldBreak');
    }
}

// ------------------------------------------
// CÔNG: Thiết Quyền Xung Kích (lao như Xe TANK)
// ------------------------------------------
function tzStartPunch(p) {
    if (p.tzDash !== 0 || p.tzPunchCd > 0) return;
    if (!tzSpend(p, tzCost(p, 'punch'))) { tzNoEnergy(p); return; }
    p.tzDash = 1; p.tzLaneY = p.y; p.tzDashHit = false;
    tzSfx('playShoot');
}

function tzUpdatePunch(p) {
    const dir = tzDir(p);
    const enemy = tzEnemy(p);
    if (p.tzDash === 1) {
        p.y += TZ_DASH_SPEED * dir;
        const fist = { x: p.x - 2, y: dir < 0 ? p.y - 12 : p.y + p.h - 2, w: p.w + 4, h: 14 };
        const body = { x: p.x, y: Math.min(p.y, fist.y), w: p.w, h: p.h + 14 };
        // Evo 2: phá đạn địch trên đường lao
        if (tzEvo2(p) && enemy && enemy.bullets) {
            for (let i = enemy.bullets.length - 1; i >= 0; i--) {
                const b = enemy.bullets[i];
                if (b && rectIntersect(body.x - 8, body.y - 8, body.w + 16, body.h + 16, b.x, b.y, b.w || 6, b.h || 6)) {
                    enemy.bullets.splice(i, 1);
                    spawnSparkParticles(b.x, b.y, '#ff4d6d', 5);
                }
            }
        }
        let hit = null;
        const dmg = tzBaseDmg(p) * 0.8 * 1.3; // cú đấm 0.8x, Thế Công +30% sát thương
        if (!p.tzDashHit && enemy && enemy.hp > 0 && rectIntersect(body.x, body.y, body.w, body.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
            p.tzDashHit = true;
            enemy.takeDamage(dmg, p);
            enemy.kbX = (enemy.x + enemy.w / 2 < p.x + p.w / 2 ? -1 : 1) * 4;
            hit = enemy;
        }
        if (!hit) hit = tzHitObjects(p, body, dmg * 1.5);
        const atEdge = p.y <= 0 || p.y >= canvas.height - p.h;
        if (hit || atEdge) {
            p.y = Math.max(0, Math.min(canvas.height - p.h, p.y));
            const hx = p.x + p.w / 2, hy = dir < 0 ? p.y - 4 : p.y + p.h + 4;
            explosions.push(new Explosion(hx, hy, hit ? 38 : 26, 'rgba(255, 77, 109,', 0, p));
            triggerScreenShake(hit ? 6 : 3, 8);
            if (hit) { addFloatingText(hx, hy + dir * 14, 'THIẾT QUYỀN!', '#ff4d6d', 13); tzSfx('playHit'); }
            if (tzEvo2(p)) {
                // Sóng xung kích nổ lan phía trước
                explosions.push(new Explosion(hx, hy + dir * 30, 62, 'rgba(255, 120, 60,', tzBaseDmg(p) * 0.6, p));
                p.tzWave = 18;
            }
            p.tzDash = 2;
        }
    } else if (p.tzDash === 2) {
        p.y -= TZ_DASH_BACK * dir;
        if ((dir < 0 && p.y >= p.tzLaneY) || (dir > 0 && p.y <= p.tzLaneY)) {
            p.y = p.tzLaneY; p.tzDash = 0; p.tzPunchCd = 40;
        }
    }
}

// ------------------------------------------
// THIÊN LUẬT THỨC: bay lên, dội pháo, đáp xuống
// ------------------------------------------
function tzStartFly(p) {
    if (p.tzFly) return;
    if (p.tzFlyCd > 0) { addFloatingText(p.x + p.w / 2, p.y - 14, `ĐỘNG CƠ NGUỘI ${(p.tzFlyCd / 60).toFixed(1)}s`, '#94a3b8', 11); return; }
    if (!tzSpend(p, tzCost(p, 'fly'))) { tzNoEnergy(p); return; }
    const enemy = tzEnemy(p);
    p.tzFly = { t: 0, phase: 'up', cx: p.x + p.w / 2, cy: enemy ? enemy.y + enemy.h / 2 : canvas.height / 2, mortar: 40, missile: 20, anim: 0 };
    p.tzLaneY = p.y;
    explosions.push(new Explosion(p.x + p.w / 2, p.y + p.h / 2, 40, 'rgba(250, 204, 21,', 0, p));
    addFloatingText(p.x + p.w / 2, p.y - 18, 'THIÊN LUẬT THỨC!', '#facc15', 14);
    triggerScreenShake(4, 8);
    tzSfx('playShoot');
}

function tzSlamRadius(p) { return tzEvo2(p) ? 76 : 64; }

function tzUpdateFly(p, inp) {
    const f = p.tzFly;
    if (!f) return;
    const enemy = tzEnemy(p);
    f.t++;
    if (enemy) f.cy = enemy.y + enemy.h / 2; // tâm ngắm luôn nằm trên làn địch
    if (f.phase === 'up' || f.phase === 'air') {
        if (f.phase === 'up' && ++f.anim >= 16) f.phase = 'air';
        // Lái tâm ngắm
        const sp = 5.2;
        if (inp && inp.l) f.cx -= sp;
        if (inp && inp.r) f.cx += sp;
        f.cx = Math.max(16, Math.min(canvas.width - 16, f.cx));
        // Duy trì: trừ NL mỗi tick
        const drain = tzCost(p, 'flyDrain');
        p.tzEnergy = Math.max(0, p.tzEnergy - drain); p.tzRegenLock = TZ_REGEN_LOCK;
        // Pháo kích tự động
        const evo2 = tzEvo2(p), full = tzFull(p);
        if (--f.mortar <= 0 && enemy && enemy.hp > 0) {
            f.mortar = full ? 55 : (evo2 ? 75 : 110);
            const n = full ? 2 : 1;
            for (let k = 0; k < n; k++) {
                const pt = laneTargetPoint(enemy, k === 0 ? 40 : 90);
                bodyEffects.push(new TzMortar(pt.x, pt.y, p, tzBaseDmg(p) * 0.5, 40, 54));
            }
        }
        if (full && --f.missile <= 0) { f.missile = 45; tzFireMissiles(p, 3, true); }
        if (p.tzEnergy <= 0) tzStartSlam(p, true);
    } else if (f.phase === 'dive') {
        if (++f.anim >= 12) tzSlamImpact(p);
    } else if (f.phase === 'back') {
        if (++f.anim >= 14) { p.tzFly = null; p.y = p.tzLaneY; p.tzFlyCd = 150; }
    }
}

function tzStartSlam(p, auto = false) {
    const f = p.tzFly;
    if (!f || (f.phase !== 'air' && f.phase !== 'up')) return;
    f.phase = 'dive'; f.anim = 0;
    if (auto) addFloatingText(p.x + p.w / 2, p.y - 16, 'CẠN NL - ĐÁP XUỐNG!', '#facc15', 12);
}

function tzSlamImpact(p) {
    const f = p.tzFly;
    const enemy = tzEnemy(p);
    const R = tzSlamRadius(p);
    const dmg = tzBaseDmg(p) * 1.25;
    explosions.push(new Explosion(f.cx, f.cy, R, 'rgba(250, 204, 21,', 0, p));
    explosions.push(new Explosion(f.cx, f.cy, R * 0.6, 'rgba(255, 255, 255,', 0, p));
    if (enemy && enemy.hp > 0 && Math.abs(enemy.x + enemy.w / 2 - f.cx) < R + enemy.w / 2 && Math.abs(enemy.y + enemy.h / 2 - f.cy) < R * 0.75 + enemy.h / 2) {
        const d = enemy.takeDamage(dmg, p);
        if (d > 0 || enemy.hp > 0) {
            enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, tzEvo2(p) ? 60 : 45);
            addFloatingText(enemy.x + enemy.w / 2, enemy.y - 18, 'CHẤN ĐỘNG! 💫', '#facc15', 15);
        }
    }
    // Phá vật thể quanh điểm đáp
    tzHitObjects(p, { x: f.cx - R * 0.6, y: f.cy - R * 0.45, w: R * 1.2, h: R * 0.9 }, dmg);
    if (tzEvo2(p)) bodyEffects.push(new TzZone(f.cx, f.cy, 46, 'magnet', p, 240));
    triggerScreenShake(10, 14);
    tzSfx('playShieldBreak');
    f.phase = 'back'; f.anim = 0;
}

// ------------------------------------------
// FULL EVO: tên lửa tầm nhiệt & tiểu liên
// ------------------------------------------
function tzFireMissiles(p, n, fromSky) {
    const enemy = tzEnemy(p);
    if (!enemy || enemy.hp <= 0) return;
    const dir = tzDir(p);
    for (let k = 0; k < n; k++) {
        const side = (k - (n - 1) / 2);
        const sx = p.x + p.w / 2 + side * 14;
        const sy = fromSky ? (p.y + p.h / 2 + dir * 60) : (dir < 0 ? p.y : p.y + p.h);
        const a = Math.atan2(dir, 0) + side * 0.7;
        spawnBullet(p, {
            x: sx - 3, y: sy - 3, w: 7, h: 7, vx: Math.cos(a) * 4.2, vy: Math.sin(a) * 4.2,
            dmg: tzBaseDmg(p) * 0.4, hook: 'tz_missile', tzLife: 0,
        });
    }
    tzSfx('playShoot');
}

function tzUpdateMissiles(p) {
    const enemy = tzEnemy(p);
    for (let i = p.bullets.length - 1; i >= 0; i--) {
        const b = p.bullets[i];
        if (b.hook !== 'tz_missile') continue;
        b.tzLife = (b.tzLife || 0) + 1;
        if (b.tzLife > 200) { explosions.push(new Explosion(b.x, b.y, 18, 'rgba(255, 140, 60,', 0, p)); p.bullets.splice(i, 1); continue; }
        if (!enemy || enemy.hp <= 0 || b.tzLife < 8) continue;
        const ta = Math.atan2(enemy.y + enemy.h / 2 - b.y, enemy.x + enemy.w / 2 - b.x);
        let ca = Math.atan2(b.vy, b.vx), d = ta - ca;
        while (d <= -Math.PI) d += Math.PI * 2;
        while (d > Math.PI) d -= Math.PI * 2;
        ca += Math.sign(d) * Math.min(Math.abs(d), 0.09);
        const sp = Math.min(7, Math.hypot(b.vx, b.vy) + 0.08);
        b.vx = Math.cos(ca) * sp; b.vy = Math.sin(ca) * sp;
    }
}

function tzNoEnergy(p) {
    if (p.tzLowWarn) return;
    p.tzLowWarn = 40;
    addFloatingText(p.x + p.w / 2, p.y - 14, 'THIẾU NĂNG LƯỢNG!', '#94a3b8', 12);
}

// ------------------------------------------
// Thực thể: Pháo cối T-Zero (nhịp theo tick) & vùng điện / từ trường
// ------------------------------------------
class TzMortar {
    constructor(x, y, owner, dmg, r = 40, delay = 48) {
        this.x = x; this.y = y; this.owner = owner; this.dmg = dmg; this.r = r;
        this.delay = delay; this.maxDelay = delay; this.boom = 0; this.active = true;
    }
    update() {
        if (!this.active) return;
        if (this.delay > 0) {
            const enemy = this.owner === p1 ? p2 : p1;
            if (enemy) this.x += ((enemy.x + enemy.w / 2) - this.x) * 0.02; // bám nhẹ theo địch
            if (--this.delay === 0) {
                explosions.push(new Explosion(this.x, this.y, this.r, 'rgba(255, 150, 40,', this.dmg, this.owner, true));
                triggerScreenShake(3, 5);
            }
            return;
        }
        if (++this.boom > 10) this.active = false;
    }
    draw() {
        if (!this.active || this.delay <= 0) return;
        const k = 1 - this.delay / this.maxDelay;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.strokeStyle = `rgba(250, 204, 21, ${0.5 + 0.5 * k})`;
        ctx.fillStyle = `rgba(250, 120, 20, ${0.06 + 0.18 * k})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 0, this.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(0, 0, this.r * (1 - k), 0, Math.PI * 2); ctx.stroke();
        // Tâm ngắm
        ctx.rotate(k * Math.PI);
        ctx.beginPath();
        for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8); ctx.lineTo(Math.cos(a) * 15, Math.sin(a) * 15); }
        ctx.stroke();
        ctx.restore();
        // Đạn pháo rơi từ trên cao (theo hướng màn hình, dạng chấm sáng + vệt)
        const dropY = this.y - (1 - k) * 120;
        ctx.save();
        ctx.globalAlpha = 0.4 + 0.6 * k;
        ctx.strokeStyle = 'rgba(255, 200, 80, 0.6)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(this.x, dropY - 18); ctx.lineTo(this.x, dropY); ctx.stroke();
        ctx.fillStyle = '#fff7cc'; ctx.shadowBlur = 10; ctx.shadowColor = '#facc15';
        ctx.beginPath(); ctx.arc(this.x, dropY, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}

class TzZone {
    constructor(x, y, r, kind, owner, life = 120) {
        this.x = x; this.y = y; this.r = r; this.kind = kind; this.owner = owner;
        this.life = life; this.maxLife = life; this.active = true; this.tick = 0;
        zoneFit(this);
    }
    update() {
        if (!this.active) return;
        this.tick++;
        if (--this.life <= 0) { this.active = false; return; }
        const enemy = this.owner === p1 ? p2 : p1;
        if (!enemy || enemy.hp <= 0) return;
        const ex = enemy.x + enemy.w / 2, ey = enemy.y + enemy.h / 2;
        const inside = Math.abs(ex - this.x) < this.r * ZONE_AX + enemy.w / 2 && Math.abs(ey - this.y) < this.r * ZONE_AY + enemy.h / 2;
        if (!inside) return;
        if (this.kind === 'spark') {
            addStatusSlow(enemy, 0.55);
        } else if (this.kind === 'magnet') {
            addStatusSlow(enemy, 0.6);
            enemy.x += Math.sign(this.x - ex) * Math.min(0.9, Math.abs(this.x - ex)); // hút về tâm
            if (this.tick % 30 === 0) enemy.takeDamage(0.25, this.owner, { isEnvironmental: true });
        }
    }
    draw() {
        if (!this.active) return;
        const k = Math.min(1, this.life / 30);
        const t = this.tick;
        ctx.save();
        ctx.globalAlpha = k;
        if (this.kind === 'spark') {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.10)';
            zoneRectPath(this.x, this.y, this.r); ctx.fill();
            ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 1.2; ctx.shadowBlur = 6; ctx.shadowColor = '#38bdf8';
            ctx.beginPath();
            const hw = this.r * ZONE_AX, hh = this.r * ZONE_AY;
            let px = this.x - hw, py = this.y;
            ctx.moveTo(px, py);
            for (let i = 1; i <= 6; i++) {
                px = this.x - hw + (hw * 2) * i / 6;
                py = this.y + Math.sin(i * 2.3 + t * 0.7) * hh * 0.8;
                ctx.lineTo(px, py);
            }
            ctx.stroke();
        } else {
            const pulse = 0.5 + 0.5 * Math.sin(t * 0.15);
            ctx.fillStyle = `rgba(168, 85, 247, ${0.14 + 0.08 * pulse})`;
            zoneRectPath(this.x, this.y, this.r); ctx.fill();
            ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 1.6; ctx.setLineDash([6, 4]); ctx.lineDashOffset = -t * 0.6;
            ctx.shadowBlur = 8; ctx.shadowColor = '#a855f7';
            zoneRectPath(this.x, this.y, this.r); ctx.stroke(); ctx.setLineDash([]);
            // Vòng từ trường co dần về tâm
            for (let i = 0; i < 3; i++) {
                const f = 1 - ((t * 0.02 + i / 3) % 1);
                ctx.globalAlpha = k * (1 - f) * 0.9;
                zoneRectPath(this.x, this.y, this.r * f); ctx.stroke();
            }
            ctx.globalAlpha = k;
            ctx.fillStyle = '#f0abfc';
            for (let i = 0; i < 5; i++) {
                const a = t * 0.05 + i * 1.256;
                ctx.beginPath(); ctx.arc(this.x + Math.cos(a) * this.r * 0.9, this.y + Math.sin(a) * this.r * 0.5, 1.8, 0, Math.PI * 2); ctx.fill();
            }
        }
        ctx.restore();
    }
}

// ------------------------------------------
// Đăng ký hook
// ------------------------------------------
CharHooks.register('t_zero', {
    setup() {
        if (typeof tzResetShootButton === 'function') tzResetShootButton();
        this.maxAmmo = 0; this.ammo = 0;
        this.tzEnergy = 100; this.tzRegenLock = 0;
        this.tzMode = 'thu'; this.tzHold = 0; this.tzPrevS = false;
        this.tzShield = null; this.tzDash = 0; this.tzLaneY = this.y; this.tzDashHit = false; this.tzPunchCd = 0;
        this.tzFly = null; this.tzFlyCd = 0; this.tzSmgTick = 0; this.tzMissileTick = 150; this.tzLowWarn = 0;
        this.tzReflectFlash = 0; this.tzWave = 0; this.tzModeFlash = 0; this.tzSmgOn = false;
    },

    update(inp, effectiveInp) {
        if (this.tzLowWarn > 0) this.tzLowWarn--;
        if (this.tzMissText > 0) this.tzMissText--;
        if (this.tzReflectFlash > 0) this.tzReflectFlash--;
        if (this.tzWave > 0) this.tzWave--;
        if (this.tzModeFlash > 0) this.tzModeFlash--;
        if (this.tzPunchCd > 0 && this.tzDash === 0) this.tzPunchCd--;
        if (this.tzFlyCd > 0 && !this.tzFly) this.tzFlyCd--;

        tzUpdateShield(this);
        if (this.tzDash) tzUpdatePunch(this);
        if (this.tzFly) tzUpdateFly(this, effectiveInp);
        tzInterceptBullets(this);
        tzUpdateMissiles(this);

        // FULL EVO: tên lửa tự ngắm định kỳ (cả khi ở dưới đất)
        if (tzFull(this) && !this.tzFly && --this.tzMissileTick <= 0) {
            this.tzMissileTick = 170;
            tzFireMissiles(this, 2, false);
        }
        // FULL EVO: Tiểu liên khi khiên đang bay (chế độ THỦ)
        this.tzSmgOn = false;
        if (tzFull(this) && this.tzMode === 'thu' && this.tzShield && this.tzDash === 0 && !this.tzFly && this.silenceTimer <= 0) {
            if (tzSpend(this, tzCost(this, 'smg'))) {
                this.tzSmgOn = true;
                if (++this.tzSmgTick >= 7) {
                    this.tzSmgTick = 0;
                    const dir = tzDir(this);
                    const sx = this.x + this.w / 2 + (Math.random() - 0.5) * 6;
                    spawnBullet(this, { x: sx - 2, y: dir < 0 ? this.y - 6 : this.y + this.h + 2, w: 4, h: 8, vx: (Math.random() - 0.5) * 0.6, vy: dir * 9, dmg: tzBaseDmg(this) * 0.2, hook: 'tz_smg' });
                }
            }
        }

        // Hồi năng lượng sau 1 giây không tiêu hao
        if (this.tzRegenLock > 0) this.tzRegenLock--;
        else this.tzEnergy = Math.min(100, this.tzEnergy + (tzEvo1(this) ? 22 : 12) / 60);
    },

    speed(s) {
        if (this.tzDash !== 0 || this.tzFly) return 0;
        return this.tzMode === 'cong' ? s * 1.3 : s;
    },

    beforeDamage(amount, attacker, options) {
        // Đang trên không: đòn dưới mặt đất không chạm tới
        if (this.tzFly) {
            if (!(this.tzMissText > 0)) { this.tzMissText = 30; addFloatingText(this.x + this.w / 2, this.y - 10, 'TRÊN KHÔNG', '#facc15', 11); }
            return true;
        }
        return false;
    },

    shoot(inp) {
        if (this.tzDash !== 0) { this.tzPrevS = inp.s; this.tzHold = 0; return true; }
        if (inp.s) {
            this.tzHold++;
            const h = this.tzHold;
            if (!this.tzFly && (h === TZ_HOLD_TICKS || (h > TZ_HOLD_TICKS && (h - TZ_HOLD_TICKS) % TZ_HOLD_REPEAT === 0))) {
                this.tzMode = TZ_MODES[(TZ_MODES.indexOf(this.tzMode) + 1) % TZ_MODES.length];
                this.tzModeFlash = 30;
                addFloatingText(this.x + this.w / 2, this.y - 18, `THIẾT LUẬT: ${TZ_MODE_NAME[this.tzMode]}`, TZ_MODE_COLOR[this.tzMode], 13);
                if (this.tzMode === 'cong') spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, '#ff4d6d', 12);
                tzSfx('playClick');
            }
        } else {
            if (this.tzPrevS && this.tzHold > 0 && this.tzHold < TZ_HOLD_TICKS) {
                if (this.tzFly) {
                    if (this.tzFly.t > 10) tzStartSlam(this);
                } else if (this.tzMode === 'thu') tzThrowShield(this);
                else if (this.tzMode === 'cong') tzStartPunch(this);
                else tzStartFly(this);
            }
            this.tzHold = 0;
        }
        this.tzPrevS = inp.s;
        return true;
    },

    roundEnd() {
        tzResetShootButton(this);
    },
});

// Viên đạn phản / tiểu liên / tên lửa: hiệu ứng khi trúng
BulletHooks.register('tz_reflect', {
    hit(b, attacker, victim) { spawnSparkParticles(b.x, b.y, '#67e8f9', 8); },
});
BulletHooks.register('tz_missile', {
    hit(b, attacker) { explosions.push(new Explosion(b.x, b.y, 22, 'rgba(255, 120, 40,', 0, attacker)); },
});
BulletHooks.register('tz_smg', {});
