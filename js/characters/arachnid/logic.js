// ==========================================
// Nhện Độc (arachnid) — "Hóa kén... rồi kết liễu!" (docs/BODY_MOI_3.md #72)
// ------------------------------------------
// Nhấp: ĐẠN TƠ ĐỘC (1.1) -> trúng: Vùng Tơ Nhện dưới chân địch 4s (chậm 30%) + 1 tầng Tơ Quấn (6s / Evo1 8s).
//   Đạn chạm biên / vật cản cũng tạo Vùng Tơ (tối đa 3 vùng). Nhện đứng trên tơ: +25% tốc chạy.
// Đủ 4 tầng (Evo1: 3) -> HÓA KÉN 1.75s (Full 2.25s): choáng hoàn toàn + Lộ Điểm Yếu +25% st nhận.
//   Juggernaut (miễn khống chế): vẫn bị bọc kén (Lộ Điểm Yếu, Cú Vồ kết liễu) nhưng KHÔNG bị choáng.
// Giữ 0.5s (hồi 9s): CÚ VỒ ĐOẠT MỆNH — thường: lao thẳng lên cắn 1.5 st, +2 tầng, hồi 0.5 HP, bật về làn.
//   Địch trong kén: khoá mục tiêu 100% (bất tử khi lao), xé kén 2.5x dame gốc + 15% máu đã mất, hút 1.25 HP,
//   hoàn 50% hồi chiêu; máu địch < 15% (Full 25%) Max HP -> XỬ TỬ (xuyên Khiên).
// Evo 2: nở Nhện Con (HP 0.5, cắn 0.2, chậm & bẻ lái ngang kém, làm mới tầng Tơ; tối đa 3). Full: 2 vùng tơ lớn đầu hiệp bên sân địch,
//   đứng trên tơ giảm 25% st nhận, kén xoá Khiên, Cú Vồ bẻ lái khi địch >= 2 tầng & chạm là đóng kén.
// Trạng thái là trường thuần trên player / entity trong bodyEffects (đồng bộ online).
// ==========================================

const AR_SILK = '#f1f5f9', AR_LIME = '#a3e635', AR_VIOLET = '#a855f7', AR_RED = '#ef4444';
const AR_HOLD = 30, AR_CD = 540, AR_ZONE_T = 240, AR_ZONE_R = 24, AR_BIG_R = 44;

function arE1(p) { return p.hasUpgrade('evo_spider_1'); }
function arE2(p) { return p.hasUpgrade('evo_spider_2'); }
function arFull(p) { return arE1(p) && arE2(p); }
function arIs(p) { return p && p.weapon === 'arachnid'; }
function arEnemy(p) { return p === p1 ? p2 : p1; }
function arTeam(id) { return id === 1 ? p1 : p2; }
function arDir(p) { return p.id === 1 ? -1 : 1; }
function arAlive(t) { return t && t.hp > 0; }
function arSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function arTxt(p, s, c, sz) { addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -20 : p.h + 24), s, c, sz || 12); }
function arScale(p) { return (p.damage || 1.1) / 1.1; }
function arNeed(p) { return arE1(p) ? 3 : 4; }
function arStackDur(p) { return arE1(p) ? 480 : 360; }
function arCocoonDur(p) { return arFull(p) ? 135 : 105; }
function arImmune(e) { return e && e.weapon === 'juggernaut'; }
function arZones(p) { return bodyEffects.filter(z => z instanceof ArWeb && z.active && z.team === p.id); }
function arInZone(z, o) { return zoneDist(o.x + o.w / 2 - z.x, o.y + o.h / 2 - z.y) < z.r; }

// ---------- Entity: Vùng Tơ Nhện ----------
class ArWeb {
    constructor(team, x, y, r, life, big) {
        this.team = team; this.x = x; this.y = y; this.r = r; this.maxR = r;
        this.life = life; this.maxLife = life; this.big = !!big; this.t = 0; this.active = true;
        this.seed = Math.round(Math.random() * 600) / 100;
        zoneFit(this, r);
    }
    update() { this.t++; if (!this.big && --this.life <= 0) this.active = false; }
    draw() { if (typeof arDrawWeb === 'function') arDrawWeb(this); }
}

// ---------- Entity: Nhện Con (Evo 2) ----------
class ArSpiderling {
    constructor(team, x, y) {
        this.team = team; this.x = x; this.y = y; this.w = 12; this.h = 12; this.hp = 0.5; // [NERF] 0.8 -> 0.5
        this.t = 0; this.life = 300; // [NERF] 6s -> 5s this.active = true; this.seed = Math.round(Math.random() * 600) / 100;
    }
    update() {
        const own = arTeam(this.team), e = own ? arEnemy(own) : null;
        if (!own || !arAlive(e) || ++this.t > this.life || gameState.phase !== 'playing') { this.active = false; return; }
        const tx = e.x + e.w / 2, ty = e.y + e.h / 2, cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const dx = tx - cx, dy = ty - cy, L = Math.hypot(dx, dy) || 1, sp = 1.8; // [NERF] 2.6 -> 1.8
        // [NERF] bẻ lái ngang chậm (tối đa 0.9px/tick) -> dễ né bằng cách chạy ngang
        this.x += Math.max(-0.9, Math.min(0.9, dx / L * Math.min(sp, L))); this.y += dy / L * Math.min(sp, L);
        // trúng đạn địch
        if (e.bullets) for (let j = e.bullets.length - 1; j >= 0; j--) {
            const b = e.bullets[j];
            if (b.x < this.x + this.w && b.x + (b.w || 6) > this.x && b.y < this.y + this.h && b.y + (b.h || 6) > this.y) {
                this.hp -= (b.dmg || 1); if (!b.isPiercing) e.bullets.splice(j, 1);
                if (this.hp <= 0) { spawnSparkParticles(cx, cy, AR_LIME, 6); this.active = false; return; }
            }
        }
        if (Math.abs(dx) < e.w / 2 + 5 && Math.abs(dy) < e.h / 2 + 5) {
            e.takeDamage(0.2 * arScale(own), own); // [NERF] 0.3 -> 0.2
            if (e.arVStk > 0) e.arVStkT = arStackDur(own);
            spawnSparkParticles(tx, ty, AR_LIME, 6);
            this.active = false;
        }
    }
    draw() { if (typeof arDrawSpiderling === 'function') arDrawSpiderling(this); }
}

// ---------- Entity: Kết liễu "HÓA KÉN KẾT LIỄU" ----------
class ArFinisher {
    constructor(owner, victim) {
        this.team = owner.id; this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.vw = victim.w; this.vh = victim.h; this.t = 0; this.dur = 140; this.active = true;
        this.seed = Math.round(Math.random() * 1000) / 100;
    }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { }
    drawOver() { if (typeof arDrawFinisherOver === 'function') arDrawFinisherOver(this); }
}

// ---------- Vùng tơ / tầng Tơ Quấn / Kén ----------
function arAddZone(p, x, y, big) {
    if (!big) {
        const small = arZones(p).filter(z => !z.big);
        while (small.length >= 3) { const o = small.shift(); o.active = false; }
    }
    const z = new ArWeb(p.id, x, y, big ? AR_BIG_R : AR_ZONE_R, AR_ZONE_T, big);
    bodyEffects.push(z);
    if (arE2(p) && !big) arSpawnLings(p, z.x, z.y);
    return z;
}
function arSpawnLings(p, x, y) {
    const n = bodyEffects.filter(s => s instanceof ArSpiderling && s.active && s.team === p.id).length;
    for (let i = 0; i < Math.min(2, 3 - n); i++) bodyEffects.push(new ArSpiderling(p.id, x - 6 + (i ? 10 : -10), y - 6));
}
function arAddStacks(p, e, n) {
    if (!arAlive(e) || e.arVCoc > 0) return;
    e.arVStk = (e.arVStk || 0) + n; e.arVStkT = arStackDur(p);
    if (e.arVStk >= arNeed(p)) arCocoon(p, e);
}
function arCocoon(p, e) {
    const d = arCocoonDur(p);
    e.arVStk = 0; e.arVStkT = 0; e.arVCoc = d; e.arVCocMax = d;
    if (!arImmune(e)) { e.freezeTimer = Math.max(e.freezeTimer || 0, d); e.kbX = 0; }
    if (arFull(p) && e.shield > 0) { e.shield = 0; addFloatingText(e.x + e.w / 2, e.y + (e.id === 1 ? -30 : e.h + 34), 'XOÁ KHIÊN!', '#00f0ff', 12); }
    addFloatingText(e.x + e.w / 2, e.y + (e.id === 1 ? -16 : e.h + 20), arImmune(e) ? 'KÉN! (MIỄN CHOÁNG)' : 'HÓA KÉN!', AR_SILK, 15);
    spawnSparkParticles(e.x + e.w / 2, e.y + e.h / 2, AR_SILK, 16);
    if (arE2(p)) arSpawnLings(p, e.x + e.w / 2, e.y + e.h / 2);
    triggerScreenShake(4, 8);
    arSfx('playPowerup');
}
function arClearVictim(e) {
    if (!e) return;
    e.arVStk = 0; e.arVStkT = 0; e.arVCoc = 0; e.arVCocMax = 0; e.arVWebT = 0; e.arVPois = 0;
}

// ---------- Bắn ----------
function arShoot(p, now) {
    if (!(p.ammo > 0)) return;
    p.ammo--; p.lastShot = now; p.arRecoil = 8;
    const dir = arDir(p);
    spawnBullet(p, { x: p.x + p.w / 2 - 4, y: dir < 0 ? p.y - 12 : p.y + p.h + 2, w: 8, h: 12, vy: dir * C.bulletSpeed * 1.25, dmg: p.damage, hook: 'arachnid' });
    arSfx('playShoot');
}
BulletHooks.register('arachnid', {
    hit(b, o, v) {
        if (!v || b.arDone) return; b.arDone = true;
        arAddZone(o, v.x + v.w / 2, v.y + v.h / 2, false);
        arAddStacks(o, v, 1);
        spawnSparkParticles(b.x + b.w / 2, b.y + b.h / 2, AR_SILK, 5);
    },
    edge(b, o) { if (!b.arDone) { b.arDone = true; arAddZone(o, b.x + b.w / 2, b.y + b.h / 2, false); } },
    obstacle(b, o) { if (!b.arDone) { b.arDone = true; arAddZone(o, b.x + b.w / 2, b.y + b.h / 2, false); } },
    draw(b) { if (typeof arDrawShot === 'function') arDrawShot(b); },
});

// ---------- Cú Vồ Đoạt Mệnh ----------
function arPounce(p) {
    const e = arEnemy(p);
    p.arCd = AR_CD; p.arOrigin = { x: p.x, y: p.y }; p.arModeT = 0;
    if (arAlive(e) && e.arVCoc > 0) {
        p.arMode = 'lunge';
        arTxt(p, 'KẾT LIỄU KÉN!', AR_RED, 14);
    } else {
        p.arMode = 'leap';
        arTxt(p, 'CÚ VỒ!', AR_LIME, 12);
    }
    arSfx('playDash');
}
function arBack(p, silent) {
    if (silent || !p.arOrigin) {
        if (p.arOrigin) { p.x = Math.max(0, Math.min(canvas.width - p.w, p.arOrigin.x)); p.y = p.arOrigin.y; }
        p.arMode = 'idle'; p.arOrigin = null; p.arModeT = 0; return;
    }
    p.arMode = 'back'; p.arModeT = 0;
}
function arBite(p, e) {
    const s = arScale(p);
    e.takeDamage(1.5 * s, p);
    p.hp = Math.min(p.maxHp, p.hp + 0.5);
    explosions.push(new Explosion(e.x + e.w / 2, e.y + e.h / 2, 26, 'rgba(163, 230, 53,', 0, p));
    if (arAlive(e)) {
        if (arFull(p) && (e.arVStk || 0) >= 2) arAddStacks(p, e, arNeed(p));
        else arAddStacks(p, e, 2);
    }
    triggerScreenShake(4, 6);
}
function arTear(p, e) {
    const s = arScale(p), miss = Math.max(0, e.maxHp - e.hp);
    e.arVCoc = 0; e.arVCocMax = 0;
    if (!arImmune(e)) e.freezeTimer = 0;
    e.takeDamage(2.5 * p.damage + 0.15 * miss, p, { unavoidable: true });
    p.hp = Math.min(p.maxHp, p.hp + 1.25);
    p.arCd = Math.round(AR_CD * 0.5);
    spawnSparkParticles(e.x + e.w / 2, e.y + e.h / 2, AR_SILK, 20);
    explosions.push(new Explosion(e.x + e.w / 2, e.y + e.h / 2, 40, 'rgba(239, 68, 68,', 0, p));
    triggerScreenShake(8, 12);
    if (arAlive(e) && e.hp < e.maxHp * (arFull(p) ? 0.25 : 0.15) && gameState.phase === 'playing') {
        addFloatingText(e.x + e.w / 2, e.y + (e.id === 1 ? -30 : e.h + 34), 'XỬ TỬ!', AR_RED, 20);
        e.invincibleTimer = 0;
        e.takeDamage(e.hp + 99, p, { unavoidable: true, bypassShield: true, ignoreInvincible: true, isPiercing: true });
        if (e.hp > 0 && gameState.phase === 'playing') {
            e.hp = 0; e.ghostHp = 0;
            arSpawnFinisher(p, e);
            if (typeof triggerFatalCinematic === 'function') triggerFatalCinematic(p.id, e);
        }
        return;
    }
    if (arAlive(e) && arE1(p)) {
        if (!arImmune(e)) e.silenceTimer = Math.max(e.silenceTimer || 0, 90);
        e.arVPois = 180;
        addFloatingText(e.x + e.w / 2, e.y + (e.id === 1 ? -30 : e.h + 34), 'KỊCH ĐỘC!', AR_LIME, 12);
    }
    arSfx('playExplosion');
}
// mỗi tick (gọi trước Player.update gốc -> chạy cả khi Nhện bị choáng/nam châm giữ)
function arPounceStep(p) {
    const e = arEnemy(p), dir = arDir(p), o = p.arOrigin;
    if (!o) { p.arMode = 'idle'; return; }
    p.freezeTimer = 0; p.kbX = 0; p.kbY = 0;
    p.arModeT++;
    if (p.arMode === 'lunge') {
        if (!arAlive(e)) { arBack(p); return; }
        const tx = e.x + e.w / 2 - p.w / 2, ty = e.y + e.h / 2 - p.h / 2, dx = tx - p.x, dy = ty - p.y, L = Math.hypot(dx, dy);
        const sp = 24;
        if (L <= sp + 4 || p.arModeT > 60) { p.x = tx; p.y = ty; if (e.arVCoc > 0 || p.arModeT <= 60) arTear(p, e); arBack(p); return; }
        p.x += dx / L * sp; p.y += dy / L * sp;
    } else if (p.arMode === 'leap') {
        p.y += dir * 15;
        if (arAlive(e) && arFull(p) && (e.arVStk || 0) >= 2) {
            const d = e.x + e.w / 2 - (p.x + p.w / 2);
            p.x = Math.max(0, Math.min(canvas.width - p.w, p.x + Math.sign(d) * Math.min(4, Math.abs(d))));
        }
        if (arAlive(e) && Math.abs(p.y + p.h / 2 - (e.y + e.h / 2)) < (e.h + p.h) / 2) {
            if (Math.abs(p.x + p.w / 2 - (e.x + e.w / 2)) < (e.w + p.w) / 2 + 4) arBite(p, e);
            else addFloatingText(p.x + p.w / 2, p.y + p.h / 2, 'TRƯỢT', '#94a3b8', 10);
            arBack(p); return;
        }
        if (p.y < 0 || p.y > canvas.height - p.h || p.arModeT > 70) { p.y = Math.max(0, Math.min(canvas.height - p.h, p.y)); arBack(p); }
    } else if (p.arMode === 'back') {
        const dx = o.x - p.x, dy = o.y - p.y, L = Math.hypot(dx, dy), sp = 18;
        if (L <= sp || p.arModeT > 60) { arBack(p, true); return; }
        p.x += dx / L * sp; p.y += dy / L * sp;
    } else arBack(p, true);
}

// ---------- Tick chính ----------
function arTick(p) {
    if (p.arCd > 0) p.arCd--;
    if (p.arRecoil > 0) p.arRecoil--;
    if (p.arMode && p.arMode !== 'idle') arPounceStep(p);
    if (p.hp <= 0 && p.arMode !== 'idle') arBack(p, true);
    const e = arEnemy(p);
    const zones = arZones(p);
    p.arOnWeb = zones.some(z => arInZone(z, p));
    if (!arAlive(e)) return;
    // vùng tơ: làm chậm 30%; Evo 1: đứng >2s liên tục -> +1 tầng
    let inWeb = false;
    for (const z of zones) if (arInZone(z, e)) { inWeb = true; break; }
    if (inWeb) {
        addStatusSlow(e, 0.7);
        if (arE1(p) && ++e.arVWebT >= 120) { e.arVWebT = 0; arAddStacks(p, e, 1); }
    } else e.arVWebT = 0;
    // tầng Tơ Quấn hết hạn
    if (e.arVStk > 0 && --e.arVStkT <= 0) { e.arVStk = 0; e.arVStkT = 0; }
    // Kén: choáng + Lộ Điểm Yếu
    if (e.arVCoc > 0) {
        e.arVCoc--;
        addStatusVuln(e, 0.25);
        if (!arImmune(e)) e.freezeTimer = Math.max(e.freezeTimer || 0, e.arVCoc);
    }
    // Kịch Độc (Evo 1): 0.3 HP/s trong 3s
    if (e.arVPois > 0) {
        e.arVPois--;
        if (e.arVPois % 30 === 0) e.takeDamage(0.15, p, { unavoidable: true, isDot: true });
    }
}

function arSpawnFinisher(p, v) {
    if (typeof bodyEffects === 'undefined' || bodyEffects.some(e => e instanceof ArFinisher)) return;
    bodyEffects.push(new ArFinisher(p, v));
    triggerScreenShake(12, 22);
    spawnSparkParticles(v.x + v.w / 2, v.y + v.h / 2, AR_SILK, 26);
    arSfx('playExplosion');
}

// Bot: giữ 0.5s khi địch trong kén / có tầng & thẳng hàng
function arBotHold(p, e, aligned) {
    if (!arIs(p) || p.arMode !== 'idle' || (p.arCd || 0) > 0 || !arAlive(e)) return false;
    if (e.arVCoc > 4) return true;
    const dx = Math.abs(e.x + e.w / 2 - (p.x + p.w / 2));
    return dx < 26 && ((e.arVStk || 0) >= 2 || (aligned && Math.random() < 0.02));
}

CharHooks.register('arachnid', {
    setup() {
        this.arMode = 'idle'; this.arOrigin = null; this.arModeT = 0; this.arCd = 0;
        this.arPrevS = false; this.arHold = 0; this.arUsed = false; this.arRecoil = 0; this.arOnWeb = false;
        arClearVictim(this); arClearVictim(arEnemy(this));
        if (arE2(this)) { this.maxAmmo += 1; this.ammo = this.maxAmmo; }
        if (arFull(this) && typeof bodyEffects !== 'undefined') {
            const eh = (arEnemy(this) && arEnemy(this).h) || 30;
            const ey = this.id === 1 ? 20 + eh / 2 : canvas.height - 22 - eh / 2; // làn địch (js/player/setup.js)
            arAddZone(this, canvas.width * 0.28, ey, true);
            arAddZone(this, canvas.width * 0.72, ey, true);
        }
    },
    speed(cur) {
        if (this.arMode !== 'idle') return 0;
        return this.arOnWeb ? cur * 1.25 : cur;
    },
    shoot(inp, now) {
        const s = !!inp.s, released = !s && this.arPrevS;
        this.arPrevS = s;
        if (this.arMode !== 'idle') { this.arHold = 0; this.arUsed = s; return true; }
        if (s) {
            if (this.arUsed) return true;
            this.arHold++;
            if (this.arHold >= AR_HOLD && (this.arCd || 0) <= 0) { this.arUsed = true; this.arHold = 0; arPounce(this); }
        } else {
            if (released && !this.arUsed) arShoot(this, now);
            this.arHold = 0; this.arUsed = false;
        }
        return true;
    },
    roundEnd() {
        arBack(this, true);
        arClearVictim(arEnemy(this));
    },
});

// ---------- Bọc update: tick luôn chạy (kể cả khi Nhện bị choáng) ----------
(function () {
    const origU = Player.prototype.update;
    Player.prototype.update = function () {
        if (arIs(this)) { try { arTick(this); } catch (err) { console.error(err); } }
        return origU.apply(this, arguments);
    };
})();

// ---------- Bọc takeDamage: bất tử khi lao vào kén, giảm st trên tơ (Full), kết liễu ----------
(function () {
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        if (arIs(this)) {
            if (this.arMode === 'lunge') return 0;
            if (arFull(this) && this.arOnWeb && typeof amount === 'number' && amount > 0) amount *= 0.75;
        }
        const before = this.hp;
        const r = origTD.call(this, amount, attacker, options, ...Array.prototype.slice.call(arguments, 3));
        if (arIs(this) && this.hp <= 0 && this.arMode !== 'idle') arBack(this, true);
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && arIs(attacker)) arSpawnFinisher(attacker, this);
        return r;
    };
})();
