// ==========================================
// The Clock (the_clock) — Kẻ Ngưng Đọng Thời Gian (docs/BODY_MOI_5.md #97)
// ------------------------------------------
// Nhấp: bắn Kim Giây 0.25 dame. Giữ 0.5s (hồi 12s, Evo2 8.5s): mở TIME_ZONE 5s toàn sân —
//   địch, vật triệu hồi & đạn của địch ngưng đọng; đạn của mình cũng treo tại chỗ, khóa nạp đạn.
//   Bắn trong Time_Zone -> Kim Giờ Cường Hóa (0.5 dame, xuyên vật cản, chậm 35% 1.5s) treo lơ lửng,
//   hết giờ (hoặc giữ 0.4s để tắt sớm) thì đồng loạt phóng đi.
// ĐẾM NGƯỢC: mỗi phát trúng +1 nhịp trên địch: mỗi 3 nhịp Choáng 1s; 12 nhịp (Full 10) mở Dư Chấn
//   (thoát Time_Zone -> địch khựng 0.25s / Full 0.4s); 24 nhịp (Full 20) -> KẾT LIỄU TỨC THÌ.
// Ngoại lệ: Chrono (đạn vẫn bay, xe không di chuyển) / Neo (di chuyển được, không bắn);
//   Paradox vừa Tua Ngược (<3s) hoạt động bình thường trong Time_Zone.
// Trạng thái là trường thuần trên player / entity trong bodyEffects (đồng bộ online).
// ==========================================

const TC_GOLD = '#fbbf24', TC_CYAN = '#67e8f9', TC_WHITE = '#f8fafc', TC_VIO = '#a78bfa';
const TC_TZ_DUR = 300;

function tcE1(p) { return p.hasUpgrade('evo_clock_1'); }
function tcE2(p) { return p.hasUpgrade('evo_clock_2'); }
function tcFull(p) { return tcE1(p) && tcE2(p); }
function tcIs(p) { return !!p && p.weapon === 'the_clock'; }
function tcEnemy(p) { return p === p1 ? p2 : p1; }
function tcAlive(t) { return t && t.hp > 0; }
function tcDir(p) { return p.id === 1 ? -1 : 1; }
function tcSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function tcTxt(o, s, c, sz, dy) { addFloatingText(o.x + o.w / 2, o.y + (o.id === 1 ? -18 - (dy || 0) : o.h + 22 + (dy || 0)), s, c, sz || 12); }
function tcImmune(e) { return e && e.weapon === 'juggernaut'; }
function tcCdMax(p) { return tcE2(p) ? 510 : 720; }
function tcExecN(p) { return tcFull(p) ? 20 : 24; }
function tcAfterN(p) { return tcFull(p) ? 10 : 12; }
function tcStun(e, t) { if (tcAlive(e) && !tcImmune(e)) e.freezeTimer = Math.max(e.freezeTimer || 0, t); }
// Đồng hồ (đối thủ) đang mở Time_Zone lên p?
function tcZoneOn(p) {
    const c = p ? tcEnemy(p) : null;
    return (tcIs(c) && c.tcTZ > 0 && c.hp > 0) ? c : null;
}

// ---------- Entity: Kết liễu "ĐỒNG HỒ ĐIỂM 12 GIỜ" ----------
class TcFinisher {
    constructor(owner, victim) {
        this.team = owner.id; this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.t = 0; this.dur = 150; this.active = true;
    }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof tcDrawFinisherUnder === 'function') tcDrawFinisherUnder(this); }
    drawOver() { if (typeof tcDrawFinisherOver === 'function') tcDrawFinisherOver(this); }
}
function tcSpawnFinisher(p, v) {
    if (typeof bodyEffects === 'undefined' || bodyEffects.some(e => e instanceof TcFinisher)) return;
    bodyEffects.push(new TcFinisher(p, v));
    triggerScreenShake(12, 24);
    spawnSparkParticles(v.x + v.w / 2, v.y + v.h / 2, TC_GOLD, 30);
    tcSfx('playExplosion');
}

// ---------- Time_Zone ----------
function tcStartTZ(p) {
    p.tcTZ = TC_TZ_DUR; p.tcTZFx = 24; p.tcFreeE = false;
    if (tcE1(p)) p.ammo = Math.min(p.maxAmmo, (p.ammo || 0) + 2);
    tcTxt(p, 'TIME ZONE!', TC_CYAN, 16);
    triggerScreenShake(5, 10);
    tcSfx('playPowerup');
    tcHoldBullets(p);
}
function tcHoldBullets(p) {
    for (const b of p.bullets) {
        if (b.tcHeld || (!b.vx && !b.vy)) continue;
        b.tcHeld = true; b.tcVx = b.vx; b.tcVy = b.vy; b.vx = 0; b.vy = 0;
    }
}
function tcEndTZ(p, early, silent) {
    if (!(p.tcTZ > 0)) return;
    const left = p.tcTZ;
    p.tcTZ = 0; p.tcTZFx = 0;
    let cd = tcCdMax(p);
    if (early && tcFull(p)) cd = Math.max(60, cd - Math.round(left / 60 * 72));
    p.tcCd = cd;
    const e = tcEnemy(p);
    if (e) { e.tcFrozen = false; e.tcFreeE = false; }
    if (silent) { p.bullets.forEach(b => { if (b.tcHeld) { b.vx = b.tcVx || 0; b.vy = b.tcVy || 0; b.tcHeld = false; } }); return; }
    let n = 0;
    for (const b of p.bullets) {
        if (!b.tcHeld) continue;
        b.vx = b.tcVx || 0; b.vy = b.tcVy || 0; b.tcHeld = false; n++;
        if (b.tcTZ) spawnSparkParticles(b.x + 3, b.y + 3, TC_GOLD, 3);
    }
    if (p.tcAfter && tcAlive(e)) {
        tcStun(e, tcFull(p) ? 24 : 15);
        if (!tcImmune(e)) tcTxt(e, 'DƯ CHẤN!', TC_VIO, 12);
    }
    tcTxt(p, n ? 'THỜI GIAN TRÔI! x' + n : 'THỜI GIAN TRÔI!', TC_GOLD, 13);
    p.tcRelFx = 20;
    triggerScreenShake(n ? 6 : 3, 10);
    tcSfx('playShoot');
}

// ---------- Bắn ----------
function tcFire(p, now) {
    if (!(p.ammo > 0)) return;
    const inTZ = p.tcTZ > 0;
    if (now - (p.lastShot || 0) < (inTZ ? 220 : 450)) return;
    p.ammo--; p.lastShot = now; p.tcRecoil = 8;
    const dir = tcDir(p), sp = C.bulletSpeed * 1.15;
    if (inTZ) {
        spawnBullet(p, {
            w: 6, h: 10, x: p.x + p.w / 2 - 3, y: p.id === 1 ? p.y - 12 : p.y + p.h + 2,
            vx: 0, vy: 0, tcHeld: true, tcTZ: true, tcVx: 0, tcVy: dir * sp * (tcE2(p) ? 1.45 : 1),
            dmg: p.damage * 2, isPiercing: true, hook: 'the_clock',
        });
        spawnSparkParticles(p.x + p.w / 2, p.id === 1 ? p.y - 8 : p.y + p.h + 8, TC_GOLD, 4);
    } else {
        spawnBullet(p, { w: 5, h: 10, x: p.x + p.w / 2 - 2.5, y: p.id === 1 ? p.y - 12 : p.y + p.h + 2, vy: dir * sp, hook: 'the_clock' });
    }
    tcSfx('playShoot');
}

// ---------- Đếm Ngược ----------
function tcCount(p, e) {
    if (!tcAlive(e) || gameState.phase !== 'playing') return;
    e.tcHits = (e.tcHits || 0) + 1; e.tcPop = 18;
    const h = e.tcHits;
    if (h >= tcExecN(p)) { tcExecute(p, e); return; }
    if (!p.tcAfter && h >= tcAfterN(p)) {
        p.tcAfter = true;
        tcTxt(p, 'DƯ CHẤN THỜI KHÔNG!', TC_VIO, 12, 14);
    }
    if (h % 3 === 0) {
        tcStun(e, 60);
        e.tcRing = 30;
        tcTxt(e, '🔔 ' + h + ' — CHOÁNG!', TC_GOLD, 13);
        spawnSparkParticles(e.x + e.w / 2, e.y + e.h / 2, TC_GOLD, 10);
        tcSfx('playHit');
        if (tcE2(p) && e.tcSlowT > 0 && p.ammo < p.maxAmmo) { p.ammo++; tcTxt(p, '+1 KIM', TC_GOLD, 11); }
    }
}
function tcExecute(p, e) {
    addFloatingText(e.x + e.w / 2, e.y + (e.id === 1 ? -30 : e.h + 34), 'XXIV — HẾT GIỜ!', TC_GOLD, 20);
    e.invincibleTimer = 0;
    p.tcExec = true;
    e.takeDamage(e.hp + 99, p, { unavoidable: true, bypassShield: true, ignoreInvincible: true, isPiercing: true });
    p.tcExec = false;
    if (e.hp > 0 && gameState.phase === 'playing') {
        e.hp = 0; e.ghostHp = 0;
        tcSpawnFinisher(p, e);
        triggerFatalCinematic(p.id, e);
    }
}
BulletHooks.register('the_clock', {
    hit(b, o, v) {
        if (!tcIs(o) || !v || (v !== p1 && v !== p2) || v === o) return;
        if (b.tcTZ && !tcImmune(v)) { v.tcSlowT = 90; v.tcSlowM = tcE2(o) ? 0.55 : 0.65; }
        tcCount(o, v);
    },
    draw(b) { if (typeof tcDrawNeedle === 'function') tcDrawNeedle(b); },
});

// ---------- Tick chính (chạy cả khi bị choáng) ----------
function tcTick(p) {
    if (p.tcRecoil > 0) p.tcRecoil--;
    if (p.tcTZFx > 0) p.tcTZFx--;
    if (p.tcRelFx > 0) p.tcRelFx--;
    const e = tcEnemy(p);
    if (e) { if (e.tcPop > 0) e.tcPop--; if (e.tcRing > 0) e.tcRing--; }
    if (p.hp <= 0 || gameState.phase !== 'playing') { if (p.tcTZ > 0) tcEndTZ(p, false, true); return; }
    if (p.tcTZ > 0) {
        p.lastReload = Date.now(); // khóa nạp đạn
        tcHoldBullets(p);
        if (--p.tcTZ <= 0) { p.tcTZ = 1; tcEndTZ(p, false); }
    } else if (p.tcCd > 0) p.tcCd--;
    if (tcAlive(e) && e.tcSlowT > 0) { e.tcSlowT--; addStatusSlow(e, e.tcSlowM || 0.65); }
}

CharHooks.register('the_clock', {
    setup() {
        this.tcTZ = 0; this.tcCd = 0; this.tcHold = 0; this.tcPrevS = false; this.tcUsed = false;
        this.tcAfter = false; this.lastShot = 0; this.tcTZFx = 0; this.tcRelFx = 0; this.tcRecoil = 0; this.tcExec = false;
        if (tcE1(this)) { this.maxAmmo = 5; this.ammo = 5; this.reloadTime = Math.round(this.reloadTime * 0.75); }
        const e = tcEnemy(this);
        if (e) { e.tcHits = 0; e.tcSlowT = 0; e.tcPop = 0; e.tcRing = 0; e.tcFrozen = false; e.tcFreeE = false; }
    },
    speed(cur) { return (this.tcTZ > 0 && tcE1(this)) ? cur * 1.35 : cur; },
    shoot(inp, now) {
        const s = !!inp.s, rel = !s && this.tcPrevS;
        this.tcPrevS = s;
        if (s) {
            if (this.tcUsed) return true;
            this.tcHold++;
            const need = this.tcTZ > 0 ? 24 : 30;
            if (this.tcHold >= need) {
                this.tcUsed = true; this.tcHold = 0;
                if (this.tcTZ > 0) tcEndTZ(this, true);
                else if (this.tcCd <= 0) tcStartTZ(this);
                else tcTxt(this, 'HỒI ' + (this.tcCd / 60).toFixed(1) + 's', '#94a3b8', 11);
            }
        } else {
            if (rel && !this.tcUsed) tcFire(this, now);
            this.tcHold = 0; this.tcUsed = false;
        }
        return true;
    },
    roundEnd() { tcEndTZ(this, false, true); },
});

// ---------- Bọc update: tick Đồng Hồ + đóng băng địch trong Time_Zone ----------
(function () {
    const origU = Player.prototype.update;
    Player.prototype.update = function () {
        if (tcIs(this)) { try { tcTick(this); } catch (err) { console.error(err); } }
        const c = tcZoneOn(this);
        if (c && this.hp > 0 && gameState.phase === 'playing') {
            if (this.weapon === 'paradox' && (this.tcFreeE || Date.now() - (this.tcRewindAt || -1e9) < 3000)) {
                this.tcFreeE = true; this.tcFrozen = false;
                return origU.apply(this, arguments);
            }
            this.tcFrozen = true;
            if (this.weapon === 'chrononeo' && typeof inputs !== 'undefined') {
                const I = this.id === 1 ? inputs.p1 : inputs.p2, sv = { l: I.l, r: I.r, s: I.s };
                if (this.cnSt === 'chrono') { I.l = false; I.r = false; } else I.s = false;
                try { return origU.apply(this, arguments); } finally { I.l = sv.l; I.r = sv.r; I.s = sv.s; }
            }
            this.netMoveSpd = 0;
            return;
        }
        if (this.tcFrozen) this.tcFrozen = false;
        return origU.apply(this, arguments);
    };
    if (typeof Player.prototype.paradoxRewind === 'function') {
        const origR = Player.prototype.paradoxRewind;
        Player.prototype.paradoxRewind = function () { this.tcRewindAt = Date.now(); if (tcZoneOn(this)) this.tcFreeE = true; return origR.apply(this, arguments); };
    }
})();

// ---------- Bọc takeDamage: kết liễu khi Đồng Hồ hạ gục ----------
(function () {
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        const before = this.hp;
        const r = origTD.apply(this, arguments);
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && tcIs(attacker)) tcSpawnFinisher(attacker, this);
        return r;
    };
})();

// ---------- Bọc tickPhysics: vật triệu hồi của địch ngưng đọng trong Time_Zone ----------
const TC_FREEZE_ROOTS = [
    () => typeof bodyEffects !== 'undefined' ? bodyEffects : null,
    () => typeof turrets !== 'undefined' ? turrets : null,
    () => typeof creatorTurrets !== 'undefined' ? creatorTurrets : null,
    () => typeof creatorRobots !== 'undefined' ? creatorRobots : null,
    () => typeof creatorDrones !== 'undefined' ? creatorDrones : null,
    () => typeof necroMinions !== 'undefined' ? necroMinions : null,
    () => typeof ghostDecoys !== 'undefined' ? ghostDecoys : null,
    () => typeof bastions !== 'undefined' ? bastions : null,
    () => typeof sniperWalls !== 'undefined' ? sniperWalls : null,
];
function tcOwnedBy(o, e) {
    if (!o || o instanceof TcFinisher) return false;
    return o.owner === e || (o.team !== undefined && o.team === e.id) || (o.ownerId !== undefined && o.ownerId === e.id);
}
window.addEventListener('load', function () {
    if (typeof tickPhysics !== 'function') return;
    const origTP = tickPhysics;
    tickPhysics = function () {
        const guest = typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest';
        const frozenE = guest || typeof p1 === 'undefined' ? null : [p1, p2].find(pp => pp && tcZoneOn(pp) && !pp.tcFreeE);
        if (!frozenE) return origTP.apply(this, arguments);
        const held = [];
        TC_FREEZE_ROOTS.forEach((g, gi) => {
            const a = g(); if (!a || !a.length) return;
            for (let i = a.length - 1; i >= 0; i--) if (tcOwnedBy(a[i], frozenE)) { held.push([gi, a[i]]); a.splice(i, 1); }
        });
        try { return origTP.apply(this, arguments); }
        finally { for (let i = held.length - 1; i >= 0; i--) { const a = TC_FREEZE_ROOTS[held[i][0]](); if (a) a.push(held[i][1]); } }
    };
});

// Bot: 'tz' (giữ mở Time_Zone) | 'end' (giữ tắt sớm) | 'tap' | null
function tcBotAction(p, e) {
    if (!tcIs(p) || !tcAlive(e)) return null;
    const now = Date.now();
    if (p.tcTZ > 0) {
        const planted = p.bullets.filter(b => b.tcTZ && b.tcHeld).length;
        if (p.ammo <= 0 && planted > 0 && p.tcTZ > 60) return 'end';
        if (p.ammo > 0 && now - (p.lastShot || 0) >= 240 && Math.abs((p.x + p.w / 2) - (e.x + e.w / 2)) < 40 + planted * 8) return 'tap';
        return null;
    }
    if (p.tcCd <= 0 && p.ammo >= Math.min(3, p.maxAmmo) && Math.random() < 0.04) return 'tz';
    return null;
}
