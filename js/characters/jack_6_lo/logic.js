// ==========================================
// Jack - 6 Lỗ (jack_6_lo) — "MỘT VÁN NỮA, CƯỢC ĐI CƯỢC ĐI NÀO HAAHAHA!" (docs/BODY_MOI_4.md #68)
// ------------------------------------------
// Chỉ Số Bất Định: đầu hiệp HP / Dame / Tốc random ±30% (tổng hệ số = 0 -> cân bằng).
// Tung Xu mỗi 3s (Full 2s): NGỬA -> LUCK 12s (xóa Nợ, +tốc, giảm st, né, crit 50%; ngưng tung) | ÚP -> +1 NỢ (-tốc, +st nhận).
// Hander (nhấp): xả 1–4 viên hình nón, 25% chí mạng x2. Nạp 1.4s, 25% nhét lố 5–6 viên (Luck: 60% ra 6).
// THE BOY (giữ 1s): Cò Quay Nga — không cất súng, mỗi nhấp bóp 1 lỗ (1s/lần), viên thật ở 1..6 (Luck/Nợ lệch tỉ lệ).
//   Phát 1: x6 đại đạn nổ | 2–3: x2 nổ nhỏ | 4–5: x1.5 "Nah, chán!" | trống: "CẠCH!" | 6: nổ ngược (choáng + tự nhận st bỏ qua khiên).
// Evo 1 / Evo 2 / Full theo bảng spec. Kết liễu bằng The BOY -> JACKPOT 777!
// Trạng thái: trường thuần trên player + JlFinisher trong bodyEffects (đồng bộ online).
// ==========================================

const JL_GOLD = '#fcd34d', JL_RED = '#ef4444', JL_GREEN = '#34d399', JL_PURP = '#a855f7';
const JL_HOLD = 60;

function jlE1(p) { return p.hasUpgrade('evo_jack_1'); }
function jlE2(p) { return p.hasUpgrade('evo_jack_2'); }
function jlFull(p) { return jlE1(p) && jlE2(p); }
function jlIs(p) { return !!p && p.weapon === 'jack_6_lo'; }
function jlEnemy(p) { return p === p1 ? p2 : p1; }
function jlDir(p) { return p.id === 1 ? -1 : 1; }
function jlAlive(t) { return t && t.hp > 0; }
function jlSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function jlTxt(o, s, c, sz, dy) { addFloatingText(o.x + o.w / 2, o.y + (o.id === 1 ? -18 - (dy || 0) : o.h + 22 + (dy || 0)), s, c, sz || 12); }
function jlLuckDur(p) { return jlE1(p) ? 960 : 720; }
function jlFlipEvery(p) { return jlFull(p) ? 120 : 180; }
function jlPullGap(p) { return jlFull(p) ? 30 : 60; }
function jlCrit(p) { return p.jlLuck > 0 ? 0.5 : 0.25; }
function jlSpeedMult(p) {
    if (p.jlLuck > 0) return jlE1(p) ? 1.3 : 1.2;
    return 1 - Math.min(0.4, (p.jlDebt || 0) * (jlE1(p) ? 0.05 : 0.04));
}
function jlTakenMult(p) {
    if (p.jlLuck > 0) return jlE1(p) ? 0.75 : 0.85;
    return 1 + (p.jlDebt || 0) * (jlE1(p) ? 0.08 : 0.05);
}
function jlDodge(p) { return p.jlLuck > 0 ? (jlE1(p) ? 0.3 : 0.2) : 0; }
function jlJackpotNeed(p) { return jlFull(p) ? 7 : 10; }

// ---------- Tung Xu ----------
function jlStartLuck(p, ticks, why) {
    p.jlLuck = Math.max(p.jlLuck || 0, ticks); p.jlLuckMax = Math.max(p.jlLuck, 1);
    if (p.jlDebt > 0) jlTxt(p, 'XÓA ' + p.jlDebt + ' NỢ!', JL_GREEN, 11, 14);
    p.jlDebt = 0;
    if (jlE2(p)) { p.shield = (p.shield || 0) + 1; }
    jlTxt(p, why || 'LUCK!', JL_GOLD, 15);
    spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, JL_GOLD, 14);
    jlSfx('playCoin');
}
function jlFlip(p) {
    p.jlFlipFx = 42;
    if (Math.random() < 0.5) { p.jlFlipRes = 1; jlStartLuck(p, jlLuckDur(p), 'NGỬA — LUCK!'); }
    else {
        p.jlFlipRes = 2; p.jlDebt = (p.jlDebt || 0) + 1;
        jlTxt(p, 'ÚP — NỢ x' + p.jlDebt, JL_RED, 12);
        jlSfx('playHit');
    }
}

// ---------- Hander ----------
function jlReloadDone(p) {
    let n = 4;
    if (jlFull(p)) n = 6;
    else if (Math.random() < 0.25) n = (p.jlLuck > 0 ? Math.random() < 0.6 : Math.random() < 0.4) ? 6 : 5;
    p.maxAmmo = n; p.ammo = n; p.jlReload = 0;
    if (n > 4) jlTxt(p, 'NHÉT LỐ ' + n + ' VIÊN!', JL_GOLD, 11);
}
function jlHander(p, now) {
    if (p.jlReload > 0 || !(p.ammo > 0)) return;
    const n = Math.min(p.ammo, 1 + Math.floor(Math.random() * 4));
    p.ammo -= n; p.lastShot = now; p.jlIdle = 0; p.jlRecoil = 8; p.jlCylRot = (p.jlCylRot || 0) + n;
    const dir = jlDir(p), sp = C.bulletSpeed * 1.25, cx = p.x + p.w / 2, sy = dir < 0 ? p.y - 8 : p.y + p.h + 2;
    let crits = 0;
    for (let i = 0; i < n; i++) {
        const a = (n === 1 ? 0 : (i / (n - 1) - 0.5) * 0.32) + (Math.random() - 0.5) * 0.06;
        const crit = Math.random() < jlCrit(p);
        let dmg = p.damage;
        if (jlE2(p)) dmg *= crit ? 3 : 0.5; else if (crit) dmg *= 2;
        if (crit) crits++;
        spawnBullet(p, {
            x: cx - 3, y: sy, w: crit ? 7 : 5, h: crit ? 7 : 5,
            vx: Math.sin(a) * sp, vy: Math.cos(a) * sp * dir, dmg, hook: 'jl_hander', jlCrit: crit, jlBounce: 0,
        });
    }
    if (crits) jlTxt(p, crits > 1 ? 'CRIT x' + crits + '!' : 'CRIT!', JL_GOLD, 10, 10);
    if (p.ammo <= 0) p.jlReload = 84;
    jlSfx('playShoot');
}
BulletHooks.register('jl_hander', {
    hit(b, o, v) { if (b.jlCrit && v) spawnSparkParticles(v.x + v.w / 2, v.y + v.h / 2, JL_GOLD, 6); },
    edge(b, o) {
        // Full Evo: đạn chí mạng nảy tường bên 1 lần
        if (b.jlCrit && jlFull(o) && !b.jlBounce && (b.x <= 0 || b.x >= canvas.width) && b.y > 0 && b.y < canvas.height) {
            b.jlBounce = 1; b.vx = -b.vx; b.x = Math.max(1, Math.min(canvas.width - b.w - 1, b.x));
            spawnSparkParticles(b.x, b.y, JL_GOLD, 4);
            return 'keep';
        }
    },
    draw(b) { if (typeof jlDrawHanderBullet === 'function') jlDrawHanderBullet(b); },
});

// ---------- THE BOY ----------
function jlRollLive(p) {
    let w = [1, 1, 1, 1, 1, 1];
    if (p.jlLuck > 0) w = [3, 2.4, 1.9, 1.3, 0.9, 0.5];
    else if (!jlE2(p) && p.jlDebt > 0) w[5] += 0.35 * p.jlDebt;
    const tot = w.reduce((a, x) => a + x, 0);
    let r = Math.random() * tot;
    for (let i = 0; i < 6; i++) { r -= w[i]; if (r <= 0) return i + 1; }
    return 6;
}
function jlDraw(p) {
    p.jlMode = 'boy'; p.jlPulled = 0; p.jlLive = jlRollLive(p); p.jlPullCd = 20; p.jlBorrowT = 0; p.jlDrawFx = 30;
    p.jlCylRot = (p.jlCylRot || 0) + 13;
    jlTxt(p, 'GAME ON!', JL_PURP, 15);
    triggerScreenShake(2, 6); jlSfx('playDash');
}
function jlMults(p, ch) {
    const e1 = jlE1(p), e2 = jlE2(p), d = p.jlDebt || 0;
    if (ch === 1) return (e1 ? 8 : 6) + (e2 ? 2 + d : 0);
    if (ch <= 3) return (e1 ? 3 : 2) + (e2 ? d / 2 : 0);
    return e1 ? 2 : 1.5;
}
function jlBoyFire(p, ch) {
    const e = jlEnemy(p), dir = jlDir(p), cx = p.x + p.w / 2, sy = dir < 0 ? p.y - 14 : p.y + p.h + 4;
    const debt = p.jlDebt || 0;
    const jackpot = ch === 1 && jlE2(p) && debt >= jlJackpotNeed(p);
    const mult = jackpot ? 100 : jlMults(p, ch);
    const sz = jackpot ? 18 : (ch === 1 ? 14 : (ch <= 3 ? 9 : 7));
    const sp = C.bulletSpeed * (jackpot ? 2.2 : (ch === 1 ? 1.8 : 1.35));
    const b = spawnBullet(p, {
        x: cx - sz / 2, y: sy - (dir < 0 ? sz : 0), w: sz, h: sz, vx: 0, vy: dir * sp,
        dmg: p.damage * mult, hook: 'jl_boy', jlCh: ch, jlMult: mult, isHoming: !jackpot, jlBig: jlE1(p),
    });
    if (jackpot) { b.unstoppable = true; b.isPiercing = true; b.jlJackpot = true; b.isHoming = false; }
    p.jlRecoil = 14; p.jlShotFx = 24;
    if (jackpot) {
        jlTxt(p, 'ĐỘC ĐẮC x100!!!', JL_GOLD, 18);
        triggerScreenShake(10, 20);
    } else if (ch === 1) { jlTxt(p, 'BANG! x' + (Math.round(mult * 10) / 10), JL_GOLD, 15); triggerScreenShake(5, 10); }
    else if (ch <= 3) jlTxt(p, 'BANG! x' + (Math.round(mult * 10) / 10), '#fb923c', 13);
    else jlTxt(p, 'Nah, chán!', '#94a3b8', 12);
    // Evo 2: ra đạn khi đang Nợ -> xóa Nợ; nổ Phát 1 -> Luck 12s x Nợ
    if (jlE2(p) && debt > 0) {
        if (ch === 1) jlStartLuck(p, Math.min(5400, 720 * debt), 'ĐỔI ĐỜI! LUCK ' + (12 * debt) + 's');
        else { p.jlDebt = 0; jlTxt(p, 'XÓA SẠCH NỢ!', JL_GREEN, 11, 14); }
    }
    jlSfx('playExplosion');
    jlEndBoy(p, 120);
}
function jlBackfire(p) {
    const e1 = jlE1(p), debt = p.jlDebt || 0;
    let dmg = e1 ? 3.5 : 2.0;
    if (jlE2(p)) dmg = Math.max(dmg, 2.0 * debt);
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    p.freezeTimer = Math.max(p.freezeTimer || 0, e1 ? 105 : 75);
    p.jlBackFx = 40;
    jlTxt(p, 'BÙM! NỔ NGƯỢC!', JL_RED, 15);
    explosions.push(new Explosion(cx, cy, jlFull(p) ? 110 : 40, 'rgba(239, 68, 68,', 0, p));
    triggerScreenShake(8, 14); jlSfx('playExplosion');
    // Full: địch đứng gần chịu chung 100% st nổ súng
    const e = jlEnemy(p);
    if (jlFull(p) && jlAlive(e) && Math.hypot(e.x + e.w / 2 - cx, e.y + e.h / 2 - cy) < 110 + e.w / 2) {
        const before = e.hp;
        e.takeDamage(dmg, p, { unavoidable: true });
        if (before > 0 && e.hp <= 0) jlSpawnFinisher(p, e);
    }
    p.takeDamage(dmg, p, { bypassShield: true, unavoidable: true, ignoreInvincible: true, jlSelf: true });
    jlEndBoy(p, 360);
}
function jlEndBoy(p, cd) {
    p.jlMode = 'hander'; p.jlBoyCd = cd; p.jlBoyCdMax = cd; p.jlPulled = 0; p.jlLive = 0;
}
function jlPull(p) {
    p.jlPulled++; p.jlPullCd = jlPullGap(p); p.jlCylRot = (p.jlCylRot || 0) + 1; p.jlPullFx = 12;
    if (p.jlPulled >= p.jlLive) {
        if (p.jlPulled >= 6) jlBackfire(p); else jlBoyFire(p, p.jlPulled);
    } else {
        jlTxt(p, 'CẠCH! (' + p.jlPulled + '/6)', '#cbd5e1', 12);
        jlSfx('playHit');
    }
}
BulletHooks.register('jl_boy', {
    hit(b, o, v) {
        if (!v) return;
        const cx = v.x + v.w / 2, cy = v.y + v.h / 2;
        if (b.jlCh === 1) { explosions.push(new Explosion(cx, cy, b.jlBig ? 80 : 65, 'rgba(252, 211, 77,', 0, o)); triggerScreenShake(6, 10); }
        else if (b.jlCh <= 3) explosions.push(new Explosion(cx, cy, 34, 'rgba(251, 146, 60,', 0, o));
        else spawnSparkParticles(cx, cy, '#cbd5e1', 6);
        if (v.hp <= 0) jlSpawnFinisher(o, v);
    },
    edge(b, o) { if (b.jlCh <= 3) explosions.push(new Explosion(b.x + b.w / 2, b.y + b.h / 2, b.jlCh === 1 ? 40 : 22, 'rgba(252, 211, 77,', 0, o)); },
    draw(b) { if (typeof jlDrawBoyBullet === 'function') jlDrawBoyBullet(b); },
});

// ---------- Tick chính (chạy cả khi bị choáng) ----------
function jlTick(p) {
    p.jlT = (p.jlT || 0) + 1;
    ['jlRecoil', 'jlFlipFx', 'jlPullFx', 'jlShotFx', 'jlBackFx', 'jlDrawFx', 'jlBoyCd'].forEach(k => { if (p[k] > 0) p[k]--; });
    if (p.jlPullCd > 0) p.jlPullCd--;
    if (p.jlT === 20 && p.jlRoll) {
        const r = p.jlRoll, f = v => (v >= 0 ? '+' : '') + Math.round(v * 100) + '%';
        jlTxt(p, '🎲 HP' + f(r.h) + ' DMG' + f(r.d) + ' TỐC' + f(r.s), JL_GOLD, 10);
    }
    if (gameState.phase !== 'playing' || p.hp <= 0) return;
    // Luck / Tung Xu
    if (p.jlLuck > 0) { p.jlLuck--; if (p.jlLuck === 0) { jlTxt(p, 'HẾT LUCK', '#94a3b8', 10); p.jlFlipT = jlFlipEvery(p); } }
    else if (--p.jlFlipT <= 0) { p.jlFlipT = jlFlipEvery(p); jlFlip(p); }
    // Evo 2: Nợ đốt máu 0.01 x Nợ HP/s (không dưới 0.25 HP)
    if (jlE2(p) && p.jlDebt > 0 && p.hp > 0.25) p.hp = Math.max(0.25, p.hp - 0.01 * p.jlDebt / 60);
    // Hander nạp đạn
    if (p.jlMode !== 'boy') {
        if (p.jlReload > 0) { if (--p.jlReload <= 0) jlReloadDone(p); }
        else if (p.ammo < 4 && p.ammo < p.maxAmmo && ++p.jlIdle > 90) { p.jlReload = 84; jlTxt(p, 'NẠP ĐẠN...', '#cbd5e1', 9); }
    }
}

function jlSpawnFinisher(p, v) {
    if (typeof bodyEffects === 'undefined' || bodyEffects.some(e => e instanceof JlFinisher)) return;
    bodyEffects.push(new JlFinisher(p, v));
    triggerScreenShake(12, 24);
    spawnSparkParticles(v.x + v.w / 2, v.y + v.h / 2, JL_GOLD, 30);
    jlSfx('playCoin');
}

// ---------- Entity: Kết liễu "JACKPOT 777!" ----------
class JlFinisher {
    constructor(owner, victim) {
        this.team = owner.id; this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.t = 0; this.dur = 140; this.active = true; this.seed = Math.round(Math.random() * 1000) / 100;
    }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { }
    drawOver() { if (typeof jlDrawFinisherOver === 'function') jlDrawFinisherOver(this); }
}

CharHooks.register('jack_6_lo', {
    setup() {
        // Chỉ Số Bất Định: 3 hệ số ±30%, tổng = 0
        let r1 = 0, r2 = 0, r3 = 0;
        for (let i = 0; i < 20; i++) { r1 = (Math.random() - 0.5) * 0.6; r2 = (Math.random() - 0.5) * 0.6; r3 = -(r1 + r2); if (Math.abs(r3) <= 0.3) break; }
        if (Math.abs(r3) > 0.3) { r1 = r2 = r3 = 0; }
        this.jlRoll = { h: Math.round(r1 * 100) / 100, d: Math.round(r2 * 100) / 100, s: Math.round(r3 * 100) / 100 };
        this.maxHp = Math.max(1, Math.round((this.maxHp + 4.5 * this.jlRoll.h) * 10) / 10);
        this.damage = Math.max(0.1, this.damage * (1 + this.jlRoll.d));
        this.jlSpdRoll = 1 + this.jlRoll.s;
        this.jlLuck = 0; this.jlLuckMax = 1; this.jlDebt = 0; this.jlFlipT = jlFlipEvery(this); this.jlFlipFx = 0; this.jlFlipRes = 0;
        this.jlMode = 'hander'; this.jlHold = 0; this.jlPrevS = false; this.jlUsed = false; this.jlReload = 0; this.jlIdle = 0;
        this.jlBoyCd = 0; this.jlBoyCdMax = 1; this.jlPulled = 0; this.jlLive = 0; this.jlPullCd = 0; this.jlBorrowT = 0;
        this.jlRecoil = 0; this.jlCylRot = 0; this.jlT = 0; this.jlPullFx = 0; this.jlShotFx = 0; this.jlBackFx = 0; this.jlDrawFx = 0;
        if (jlFull(this)) this.maxAmmo = 6;
    },
    speed(v) { return v * (this.jlSpdRoll || 1) * jlSpeedMult(this); },
    update(inp, eff, now) { this.lastShot = now; }, // tự quản nạp đạn (chặn hồi đạn lẻ mặc định)
    beforeDamage(amount, attacker, options) {
        if (attacker === this || (options && options.isEnvironmental)) return false;
        if (this.jlLuck > 0 && Math.random() < jlDodge(this)) {
            jlTxt(this, 'NÉ! 🍀', JL_GREEN, 12);
            return true;
        }
        return false;
    },
    shoot(inp, now) {
        const s = !!inp.s, pressed = s && !this.jlPrevS, released = !s && this.jlPrevS;
        this.jlPrevS = s;
        if (this.jlMode === 'boy') {
            // Full: vay nóng khi giữ lố sau lúc rút súng
            if (this.jlUsed) {
                if (s) {
                    if (jlFull(this) && ++this.jlBorrowT >= 18) {
                        this.jlBorrowT = 0; this.jlDebt = (this.jlDebt || 0) + 1;
                        jlTxt(this, 'VAY NÓNG +1 NỢ (' + this.jlDebt + ')', JL_RED, 11);
                    }
                } else { this.jlUsed = false; this.jlHold = 0; }
                return true;
            }
            if (pressed && this.jlPullCd <= 0) jlPull(this);
            return true;
        }
        if (s) {
            if (this.jlUsed) return true;
            this.jlHold++;
            if (this.jlHold >= JL_HOLD && this.jlBoyCd <= 0) { this.jlUsed = true; this.jlHold = 0; jlDraw(this); }
        } else {
            if (released && !this.jlUsed && this.jlHold < JL_HOLD) jlHander(this, now);
            this.jlHold = 0; this.jlUsed = false;
        }
        return true;
    },
    roundEnd() { this.jlMode = 'hander'; this.jlLuck = 0; this.jlDebt = 0; },
});

// ---------- Bọc update: tick luôn chạy ----------
(function () {
    const origU = Player.prototype.update;
    Player.prototype.update = function () {
        if (jlIs(this)) { try { jlTick(this); } catch (err) { console.error(err); } }
        return origU.apply(this, arguments);
    };
})();

// ---------- Bọc updateBullets: siêu đạn Độc Đắc khóa chết mục tiêu, xuyên mọi tường & khiên ----------
(function () {
    const origUB = Player.prototype.updateBullets;
    Player.prototype.updateBullets = function () {
        if (jlIs(this) && this.bullets && this.bullets.length) {
            const e = jlEnemy(this);
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const b = this.bullets[i];
                if (!b || !b.jlJackpot) continue;
                if (!jlAlive(e) || gameState.phase !== 'playing') { this.bullets.splice(i, 1); continue; }
                const tx = e.x + e.w / 2, ty = e.y + e.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2;
                const L = Math.hypot(tx - bx, ty - by), sp = Math.max(8, Math.hypot(b.vx, b.vy));
                b.vx = (tx - bx) / Math.max(1, L) * sp; b.vy = (ty - by) / Math.max(1, L) * sp;
                if (L <= sp + e.w / 2 + b.w / 2) {
                    this.bullets.splice(i, 1);
                    const before = e.hp;
                    e.takeDamage(b.dmg, this, { unavoidable: true, bypassShield: true, ignoreInvincible: true, isPiercing: true });
                    explosions.push(new Explosion(tx, ty, 110, 'rgba(252, 211, 77,', 0, this));
                    triggerScreenShake(14, 24);
                    if (before > 0 && e.hp <= 0) jlSpawnFinisher(this, e);
                }
            }
        }
        return origUB.apply(this, arguments);
    };
})();

// ---------- Bọc takeDamage: Luck giảm st / Nợ tăng st nhận ----------
(function () {
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        if (jlIs(this) && typeof amount === 'number' && amount > 0 && attacker !== this && !(options && options.jlSelf)) amount *= jlTakenMult(this);
        return origTD.call(this, amount, attacker, options, ...Array.prototype.slice.call(arguments, 3));
    };
})();

// Bot: rút The BOY khi Luck hoặc (Evo 2 & nhiều Nợ), rồi bóp cò liên tục
function jlBotWantBoy(p, e) {
    if (!jlIs(p) || p.jlMode === 'boy' || p.jlBoyCd > 0 || !jlAlive(e)) return false;
    if (p.jlLuck > 0) return Math.random() < 0.03;
    if (jlE2(p) && p.jlDebt >= 3) return Math.random() < 0.04;
    return Math.random() < 0.006;
}
