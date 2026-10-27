// ==========================================
// Tỉnh (tinh) — Kẻ Trấn Áp (docs/BODY_MOI_5.md #83)
// ------------------------------------------
// KHÓ CHỊU (0-10 / Evo1 15): địch lướt/dịch chuyển (+2) hoặc đi > 160px (Evo1 120px) trong 1.2s (+1).
//   Mỗi hành động gây khó chịu -> +1 tầng NGƯNG lên địch (5s / Evo1 7s, -20% tốc mỗi tầng);
//   đủ 3 tầng: CHOÁNG 3s + 0.8 st chuẩn, rồi miễn tích tầng 1.5s.
// ĐẠN CẤM CHẾ (tốn 5 / Evo2 4 Khó Chịu): phát bắn kế tiếp tự hoá (hoặc giữ 0.4s để nạp sẵn, nhả để bắn):
//   to x1.5, nhanh x2, x1.6 dame, xuyên vật cản; trúng/chạm biên sân địch -> VÙNG CẤM CHẾ r125 4s
//   (Evo2 r155 5s, rút 0.3 HP/s, đạn địch bắn từ trong vùng chậm 35%): địch trong vùng bị nhốt (trừ Juggernaut).
// Trạng thái: trường thuần trên player / entity trong bodyEffects (đồng bộ online).
// ==========================================

const TN_VIO = '#a78bfa', TN_ICE = '#e0e7ff', TN_IND = '#6366f1', TN_PINK = '#f0abfc', TN_GRAY = '#94a3b8';
const TN_HOLD = 24;

function tnE1(p) { return p.hasUpgrade('evo_tinh_1'); }
function tnE2(p) { return p.hasUpgrade('evo_tinh_2'); }
function tnFull(p) { return tnE1(p) && tnE2(p) && hasFullEvo(p, 'tinh'); }
function tnIs(p) { return !!p && p.weapon === 'tinh'; }
function tnEnemy(p) { return p === p1 ? p2 : p1; }
function tnAlive(t) { return t && t.hp > 0; }
function tnSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function tnTxt(o, s, c, sz, dy) { addFloatingText(o.x + o.w / 2, o.y + (o.id === 1 ? -18 - (dy || 0) : o.h + 22 + (dy || 0)), s, c, sz || 12); }
function tnMax(p) { return tnE1(p) ? 15 : 10; }
function tnCost(p) { return tnE2(p) ? 4 : 5; }
function tnStasisDur(p) { return tnE1(p) ? 420 : 300; }

// ---------- Entity: Vùng Cấm Chế ----------
class TnZone {
    constructor(owner, x, y, evo2, full) {
        this.team = owner.id; this.x = x; this.y = y;
        this.r = evo2 ? 155 : 125; this.dur = evo2 ? 300 : 240; this.t = 0;
        this.drain = !!evo2; this.full = !!full; this.active = true; this.caging = false;
    }
    owner() { return this.team === 1 ? p1 : p2; }
    update() {
        this.t++;
        if (this.t >= this.dur) { this.active = false; return; }
        const o = this.owner(), e = o ? tnEnemy(o) : null;
        this.caging = false;
        if (!tnAlive(e) || gameState.phase !== 'playing') return;
        const ecx = e.x + e.w / 2, ecy = e.y + e.h / 2;
        const inside = Math.abs(ecx - this.x) <= this.r && Math.abs(ecy - this.y) <= this.r;
        if (!inside) return;
        this.caging = true;
        e.tnInZone = 2;
        if (e.weapon !== 'juggernaut') {
            e.tnCageL = Math.max(0, this.x - this.r); e.tnCageR = Math.min(canvas.width, this.x + this.r); e.tnCageT = 2;
        }
        if (this.drain && this.t % 30 === 0) e.takeDamage(0.15, o, { unavoidable: true, bypassShield: true, tnTrue: true, isDot: true });
        if (this.drain && e.bullets) for (const b of e.bullets) {
            if (b.tnZs) continue;
            b.tnZs = 1;
            if (Math.abs(b.x + (b.w || 0) / 2 - this.x) <= this.r && Math.abs(b.y - this.y) <= this.r * 0.6) { b.vx = (b.vx || 0) * 0.65; b.vy = (b.vy || 0) * 0.65; }
        }
    }
    draw() { if (typeof tnDrawZone === 'function') tnDrawZone(this); }
}

// ---------- Entity: Kết liễu "NGƯNG ĐỌNG VĨNH HẰNG" ----------
class TnFinisher {
    constructor(owner, victim) {
        this.team = owner.id; this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.vw = victim.w; this.t = 0; this.dur = 170; this.active = true; this.boom = false;
        this.seed = Math.floor(Math.random() * 1000);
    }
    update() {
        this.t++;
        if (this.t === 120 && !this.boom) {
            this.boom = true;
            if (typeof explosions !== 'undefined') explosions.push(new Explosion(this.x, this.y, 80, 'rgba(167,139,250,', 0, null));
            spawnSparkParticles(this.x, this.y, TN_ICE, 26);
            spawnSparkParticles(this.x, this.y, TN_GRAY, 20);
            triggerScreenShake(16, 24);
            tnSfx('playExplosion');
        }
        if (this.t >= this.dur) this.active = false;
    }
    draw() { if (typeof tnDrawFinisherUnder === 'function') tnDrawFinisherUnder(this); }
    drawOver() { if (typeof tnDrawFinisherOver === 'function') tnDrawFinisherOver(this); }
}
function tnSpawnFinisher(p, v) {
    if (typeof bodyEffects === 'undefined' || bodyEffects.some(e => e instanceof TnFinisher)) return;
    bodyEffects.push(new TnFinisher(p, v));
    triggerScreenShake(5, 12);
    tnSfx('playPowerup');
}

// ---------- Khó Chịu & Ngưng ----------
function tnAddStasis(p, e) {
    if (!tnAlive(e) || e.tnImmune > 0 || e.tnStunT > 0) return;
    e.tnStasis = (e.tnStasis || 0) + 1; e.tnStasisT = tnStasisDur(p); e.tnPop = 18;
    if (e.tnStasis >= 3) {
        e.tnStasis = 0; e.tnStasisT = 0; e.tnStunT = 180;
        e.freezeTimer = Math.max(e.freezeTimer || 0, 180);
        e.takeDamage(0.8, p, { unavoidable: true, bypassShield: true, tnTrue: true });
        tnTxt(e, 'NGƯNG ĐỌNG THỜI KHÔNG!', TN_ICE, 14, 14);
        spawnSparkParticles(e.x + e.w / 2, e.y + e.h / 2, TN_VIO, 18);
        triggerScreenShake(8, 14);
        tnSfx('playExplosion');
        if (tnE2(p)) {
            p.ammo = p.maxAmmo; p.shield = (p.shield || 0) + 1; p.tnCrit = true;
            tnTxt(p, 'TRỪNG PHẠT: ĐẦY ĐẠN + KHIÊN', TN_PINK, 11, 14);
        }
    } else tnTxt(e, 'NGƯNG x' + e.tnStasis, TN_VIO, 12);
}
function tnAnnoy(p, e, amount, why) {
    const m = tnMax(p), a0 = p.tnAnn || 0;
    p.tnAnn = Math.min(m, a0 + amount); p.tnAnnPop = 16;
    if (why) tnTxt(p, why + ' +' + amount, TN_PINK, 10, 26);
    if (why !== 'ĐỨNG IM') tnAddStasis(p, e);
}

// ---------- Bắn ----------
function tnFire(p, now, forced) {
    if (!(p.ammo > 0) || now - (p.lastShot || 0) < 280) return false;
    const e = tnEnemy(p);
    const sup = forced || (p.tnAnn || 0) >= tnCost(p);
    if (sup && !forced) p.tnAnn -= tnCost(p);
    p.ammo--; p.lastShot = now; p.tnRecoil = 8;
    let dmg = p.damage * (sup ? 1.6 : 1);
    let crit = false;
    if (p.tnCrit && e && (e.tnStunT > 0 || e.freezeTimer > 0)) { dmg *= 2; crit = true; p.tnCrit = false; }
    const w = sup ? 10 : 6, h = sup ? 18 : 12, dir = p.id === 1 ? -1 : 1;
    spawnBullet(p, {
        w, h, x: p.x + p.w / 2 - w / 2, y: p.id === 1 ? p.y - h - 2 : p.y + p.h + 2,
        vy: dir * C.bulletSpeed * (sup ? 2 : 1), dmg, isPiercing: sup, hook: 'tinh', tnSup: sup, tnCritB: crit,
    });
    if (sup) {
        tnTxt(p, 'ĐẠN CẤM CHẾ!', TN_VIO, 13, 14);
        spawnSparkParticles(p.x + p.w / 2, p.id === 1 ? p.y - 10 : p.y + p.h + 10, TN_VIO, 10);
        triggerScreenShake(3, 6);
        tnSfx('playPowerup');
    } else tnSfx('playShoot');
    if (crit) tnTxt(p, 'CHÍ MẠNG x2!', '#fde047', 13, 26);
    return true;
}
function tnOpenZone(o, x, y) {
    if (typeof bodyEffects === 'undefined') return;
    for (const z of bodyEffects) if (z instanceof TnZone && z.team === o.id && z.active) z.active = false;
    bodyEffects.push(new TnZone(o, Math.max(20, Math.min(canvas.width - 20, x)), y, tnE2(o), tnFull(o)));
    spawnSparkParticles(x, y, TN_VIO, 16);
    triggerScreenShake(5, 10);
}

BulletHooks.register('tinh', {
    hit(b, o, v) {
        if (!tnIs(o) || !v || (v !== p1 && v !== p2) || v === o) return;
        if (b.tnSup) {
            tnOpenZone(o, v.x + v.w / 2, v.y + v.h / 2); b.tnZoned = true;
            if (tnFull(o)) { v.tnImmune = 0; tnAddStasis(o, v); }
        }
    },
    edge(b, o) {
        if (!tnIs(o) || !b.tnSup || b.tnZoned) return;
        const e = tnEnemy(o);
        if (!e) return;
        // chỉ khi bay về phía sân địch
        if ((o.id === 1 && b.vy < 0) || (o.id === 2 && b.vy > 0)) { b.tnZoned = true; tnOpenZone(o, b.x + b.w / 2, e.y + e.h / 2); }
    },
    draw(b) { if (typeof tnDrawBullet === 'function') tnDrawBullet(b); },
});

// ---------- Tick chính (Tỉnh) ----------
const TN_SUMMON_ARRS = ['turrets', 'creatorTurrets', 'creatorDrones', 'creatorRobots', 'necroMinions', 'ghostDecoys'];
function tnSummonArr(n) {
    switch (n) {
        case 'turrets': return typeof turrets !== 'undefined' ? turrets : null;
        case 'creatorTurrets': return typeof creatorTurrets !== 'undefined' ? creatorTurrets : null;
        case 'creatorDrones': return typeof creatorDrones !== 'undefined' ? creatorDrones : null;
        case 'creatorRobots': return typeof creatorRobots !== 'undefined' ? creatorRobots : null;
        case 'necroMinions': return typeof necroMinions !== 'undefined' ? necroMinions : null;
        case 'ghostDecoys': return typeof ghostDecoys !== 'undefined' ? ghostDecoys : null;
    }
    return null;
}
function tnInitRound(p) {
    const e = tnEnemy(p);
    p.tnInit = true;
    if (e) {
        e.tnStasis = 0; e.tnStasisT = 0; e.tnStunT = 0; e.tnImmune = 0; e.tnPop = 0; e.tnInZone = 0; e.tnCageT = 0;
        e.tnPx = e.x; e.tnPy = e.y; e.tnWin = 0; e.tnWinT = 0; e.tnDashCd = 0; e.tnStill = 0; e.tnStillAcc = 0;
    }
}
function tnTick(p) {
    if (p.tnRecoil > 0) p.tnRecoil--;
    if (p.tnAnnPop > 0) p.tnAnnPop--;
    const e = tnEnemy(p);
    if (e && e.tnPop > 0) e.tnPop--;
    if (p.hp <= 0 || gameState.phase !== 'playing') return;
    if (!p.tnInit) tnInitRound(p);
    if (!tnAlive(e)) return;
    if (e.tnInZone > 0) e.tnInZone--;
    // Choáng & miễn nhiễm
    if (e.tnStunT > 0) { e.tnStunT--; if (e.tnStunT === 0) e.tnImmune = 90; }
    else if (e.tnImmune > 0) e.tnImmune--;
    // Tầng Ngưng giảm dần
    if (e.tnStasis > 0 && e.tnStasisT > 0) { e.tnStasisT--; if (e.tnStasisT === 0) { e.tnStasis--; if (e.tnStasis > 0) e.tnStasisT = 60; } }
    if (e.tnStasis > 0) addStatusSlow(e, 1 - 0.2 * e.tnStasis);
    // Theo dõi chuyển động địch
    // quãng dịch chuyển trong 1 tick (cả trục dọc: Lao Húc lên sân / nhảy)
    const dx = Math.hypot(e.x - (typeof e.tnPx === 'number' ? e.tnPx : e.x), e.y - (typeof e.tnPy === 'number' ? e.tnPy : e.y));
    e.tnPx = e.x; e.tnPy = e.y;
    if (e.tnDashCd > 0) e.tnDashCd--;
    if (e.tnStunT > 0 || e.freezeTimer > 0) { e.tnWin = 0; e.tnWinT = 0; e.tnStill = 0; return; }
    const walk = (e.speed || 3.5) * 1.8;
    if (dx > walk && dx < canvas.width) {
        // 1 cú lướt liên tục chỉ tính 1 lần (hồi 0.4s kể từ tick lướt cuối)
        if (!(e.tnDashCd > 0)) tnAnnoy(p, e, 2, dx > 60 ? 'DỊCH CHUYỂN' : 'LƯỚT');
        e.tnDashCd = 24;
    } else e.tnWin = (e.tnWin || 0) + dx;
    e.tnWinT = (e.tnWinT || 0) + 1;
    if (e.tnWinT >= 72) {
        if (e.tnWin >= (tnE1(p) ? 120 : 160)) tnAnnoy(p, e, 1, 'CHẠY');
        e.tnWin = 0; e.tnWinT = 0;
    }
    // Evo1: đứng im > 2.5s -> +1 Khó Chịu mỗi giây
    if (tnE1(p)) {
        if (dx < 0.5) e.tnStill = (e.tnStill || 0) + 1; else e.tnStill = 0;
        if (e.tnStill > 150 && (e.tnStill - 150) % 60 === 0) tnAnnoy(p, e, 1, 'ĐỨNG IM');
    }
    // Full: vật triệu hồi địch chậm 50% khi địch trong vùng hoặc >= 2 tầng Ngưng
    if (tnFull(p)) {
        const slow = e.tnInZone > 0 || e.tnStasis >= 2;
        for (const n of TN_SUMMON_ARRS) {
            const arr = tnSummonArr(n);
            if (!Array.isArray(arr)) continue;
            for (const s of arr) {
                if (!s || (s.owner !== e && s.ownerId !== e.id)) continue;
                if (slow && typeof s.tnSx === 'number') {
                    s.x = s.tnSx + (s.x - s.tnSx) * 0.5;
                    if (typeof s.y === 'number' && typeof s.tnSy === 'number') s.y = s.tnSy + (s.y - s.tnSy) * 0.5;
                }
                s.tnSx = s.x; s.tnSy = s.y;
            }
        }
    }
}

CharHooks.register('tinh', {
    setup() {
        this.tnAnn = 0; this.tnAnnPop = 0; this.tnHold = 0; this.tnUsed = false; this.tnLoaded = false;
        this.tnInit = false; this.tnRecoil = 0; this.tnCrit = false; this.lastShot = 0;
    },
    shoot(inp, now) {
        const s = !!inp.s;
        if (s) {
            this.tnHold++;
            if (this.tnHold === TN_HOLD && !this.tnLoaded) {
                if ((this.tnAnn || 0) >= tnCost(this)) {
                    this.tnAnn -= tnCost(this); this.tnLoaded = true;
                    tnTxt(this, 'NẠP CẤM CHẾ', TN_VIO, 11, 14); tnSfx('playHit');
                } else tnTxt(this, 'KHÓ CHỊU ' + Math.floor(this.tnAnn || 0) + '/' + tnCost(this), TN_GRAY, 10, 14);
            }
        } else {
            if (this.tnHold > 0) {
                if (this.tnLoaded) { if (tnFire(this, now, true)) this.tnLoaded = false; }
                else if (this.tnHold < TN_HOLD) tnFire(this, now, false);
            }
            this.tnHold = 0;
        }
        return true;
    },
});

// ---------- Bọc update: tick Tỉnh + nhốt trong Vùng Cấm Chế ----------
(function () {
    const origU = Player.prototype.update;
    Player.prototype.update = function () {
        if (tnIs(this)) { try { tnTick(this); } catch (err) { console.error(err); } }
        const r = origU.apply(this, arguments);
        if (this.tnCageT > 0) {
            this.tnCageT--;
            const L = this.tnCageL, R = this.tnCageR;
            if (typeof L === 'number' && typeof R === 'number' && R - L > this.w) this.x = Math.max(L, Math.min(R - this.w, this.x));
        }
        return r;
    };
})();

// ---------- Bọc takeDamage: Evo1 +10% st mỗi tầng Ngưng, kết liễu ----------
(function () {
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        const o = options || {};
        if (tnIs(attacker) && attacker !== this && !o.tnTrue && typeof amount === 'number' && tnE1(attacker)) amount *= 1 + 0.1 * (this.tnStasis || 0);
        const before = this.hp;
        const r = origTD.call(this, amount, attacker, options);
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && tnIs(attacker)) tnSpawnFinisher(attacker, this);
        return r;
    };
})();

// Bot: 'hold' (nạp sẵn Cấm Chế) | 'tap' | null
function tnBotAction(p, e, aligned) {
    if (!tnIs(p) || !tnAlive(e)) return null;
    if (!(p.ammo > 0) || Date.now() - (p.lastShot || 0) < 300) return null;
    if (!aligned) return null;
    if ((p.tnAnn || 0) >= tnCost(p) && Math.random() < 0.5) return 'hold';
    return 'tap';
}
