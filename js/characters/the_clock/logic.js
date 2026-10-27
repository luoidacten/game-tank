// ==========================================
// The Clock (the_clock) — Kẻ Ngưng Đọng Thời Gian (docs/BODY_MOI_5.md #97)
// ------------------------------------------
// Nhấp: bắn Kim Giây 0.4 dame. Giữ 0.33s (hồi 9s, Evo2 6.5s): mở TIME_ZONE 5s toàn sân —
//   địch, vật triệu hồi & đạn của địch ngưng đọng; đạn của mình cũng treo tại chỗ, nạp đạn chậm 50%.
//   Bắn trong Time_Zone -> Kim Giờ Cường Hóa (0.8 dame, xuyên vật cản, chậm 35% 1.5s) treo lơ lửng,
//   hết giờ (hoặc giữ 0.3s để tắt sớm) thì đồng loạt phóng đi.
//   KIM NGHỊCH CHUYỂN: khi Time_Zone kết thúc, tối đa 6 viên đạn thường của địch đang lao về phía mình
//   bị đảo chiều thành Kim Giờ tím bắn ngược về địch. Kim Giờ (kể cả Nghịch Chuyển) khi phóng tự chụm về địch, trúng gõ 2 nhịp.
// ĐẾM NGƯỢC: mỗi phát trúng +1 nhịp trên địch: mỗi 3 nhịp Choáng 1s; 9 nhịp (Full 7) mở Dư Chấn
//   (thoát Time_Zone -> địch khựng 0.25s / Full 0.4s); 20 nhịp (Full 16) -> KẾT LIỄU TỨC THÌ.
// Ngoại lệ: Chrono (đạn vẫn bay, xe không di chuyển) / Neo (di chuyển được, không bắn);
//   Paradox vừa Tua Ngược (<3s) hoạt động bình thường trong Time_Zone.
// Trạng thái là trường thuần trên player / entity trong bodyEffects (đồng bộ online).
// ==========================================

const TC_GOLD = '#fbbf24', TC_CYAN = '#67e8f9', TC_WHITE = '#f8fafc', TC_VIO = '#a78bfa';
const TC_TZ_DUR = 300;
const TC_HOLD_TZ = 20, TC_HOLD_END = 18, TC_REV_MAX = 6; // [BUFF] giữ ngắn hơn; Kim Nghịch Chuyển tối đa 6 viên

function tcE1(p) { return p.hasUpgrade('evo_clock_1'); }
function tcE2(p) { return p.hasUpgrade('evo_clock_2'); }
function tcFull(p) { return tcE1(p) && tcE2(p) && hasFullEvo(p, 'the_clock'); }
function tcIs(p) { return !!p && p.weapon === 'the_clock'; }
function tcEnemy(p) { return p === p1 ? p2 : p1; }
function tcAlive(t) { return t && t.hp > 0; }
function tcDir(p) { return p.id === 1 ? -1 : 1; }
function tcSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function tcTxt(o, s, c, sz, dy) { addFloatingText(o.x + o.w / 2, o.y + (o.id === 1 ? -18 - (dy || 0) : o.h + 22 + (dy || 0)), s, c, sz || 12); }
function tcImmune(e) { return e && e.weapon === 'juggernaut'; }
function tcCdMax(p) { return tcE2(p) ? 600 : 840; } // [NERF] 9s/6.5s -> 14s/10s
function tcExecN(p) { return tcFull(p) ? 16 : 20; }
function tcAfterN(p) { return tcFull(p) ? 7 : 9; }
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
        // [MỚI] Kim Giờ HỘI TỤ: kim treo khi phóng đi tự chỉnh hướng về địch (như kim đồng hồ chụm về 12 giờ)
        if (b.tcTZ && tcAlive(e)) {
            const sp = Math.hypot(b.vx, b.vy) || C.bulletSpeed * 1.15, v = aimVelocity(b.x + b.w / 2, b.y + b.h / 2, e, sp, false);
            if (v.vy * tcDir(p) > 0) { b.vx = v.vx; b.vy = v.vy; }
        }
        if (b.tcTZ) spawnSparkParticles(b.x + 3, b.y + 3, TC_GOLD, 3);
    }
    n += tcReverse(p, e);
    if (tcAlive(e)) tcStun(e, p.tcAfter ? (tcFull(p) ? 36 : 27) : 12); // [BUFF] Trễ Thời Gian 0.2s; Dư Chấn 0.45s / Full 0.6s
    if (p.tcAfter && tcAlive(e)) {
        if (!tcImmune(e)) tcTxt(e, 'DƯ CHẤN!', TC_VIO, 12);
    }
    tcTxt(p, n ? 'THỜI GIAN TRÔI! x' + n : 'THỜI GIAN TRÔI!', TC_GOLD, 13);
    p.tcRelFx = 20;
    triggerScreenShake(n ? 6 : 3, 10);
    tcSfx('playShoot');
}

function tcRevVx(x, y, e, sp, dir) { const v = aimVelocity(x, y, e, sp, false); return v.vy * dir > 0 ? v.vx / Math.abs(v.vy) * sp : 0; }
// Kim Nghịch Chuyển: đảo chiều đạn thường của địch đang lao về phía mình thành Kim Giờ vàng
function tcReverse(p, e) {
    if (!e || !e.bullets || !tcAlive(e)) return 0;
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2, dir = tcDir(p), sp = C.bulletSpeed * 1.15 * (tcE2(p) ? 1.45 : 1);
    const cand = [];
    for (let i = 0; i < e.bullets.length; i++) {
        const b = e.bullets[i];
        if (!b || b.isLazer || b.isRaycast || b.isBeam || b.hook && b.hook !== 'basic' && (b.w || 0) > 30) continue;
        const vy = b.vy || 0;
        if (!(p.id === 1 ? vy > 0 : vy < 0) && !(e.tcFrozen && (b.vy || 0) * dir < 0)) continue;
        if ((b.w || 0) > 40 || (b.h || 0) > 60) continue;
        const bx = b.x + (b.w || 0) / 2, by = b.y + (b.h || 0) / 2;
        cand.push([Math.hypot(bx - cx, by - cy), i, bx, by]);
    }
    cand.sort((a, b) => a[0] - b[0]);
    const take = cand.slice(0, TC_REV_MAX).sort((a, b) => b[1] - a[1]);
    for (const c of take) {
        e.bullets.splice(c[1], 1);
        spawnBullet(p, {
            w: 6, h: 10, x: c[2] - 3, y: c[3] - 5, vx: tcRevVx(c[2], c[3], e, sp, dir), vy: dir * sp, tcTZ: true, tcRev: true,
            dmg: p.damage * 2, isPiercing: true, hook: 'the_clock',
        });
        spawnSparkParticles(c[2], c[3], TC_VIO, 5);
    }
    if (take.length) tcTxt(p, 'NGHỊCH CHUYỂN x' + take.length, TC_VIO, 12, 14);
    return take.length;
}

// ---------- Bắn ----------
function tcFire(p, now) {
    if (!(p.ammo > 0)) return;
    const inTZ = p.tcTZ > 0;
    if (now - (p.lastShot || 0) < (inTZ ? 200 : 330)) return;
    p.ammo--; p.lastShot = now; p.tcRecoil = 8;
    const dir = tcDir(p), sp = C.bulletSpeed * 1.4;
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
        if (b.tcTZ && tcAlive(v)) tcCount(o, v); // [BUFF] Kim Giờ gõ 2 nhịp
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
        p.lastReload = Math.max(p.lastReload || 0, Date.now() - 500) + 1000 / 120; // nạp đạn chậm 50%
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
            const need = this.tcTZ > 0 ? TC_HOLD_END : TC_HOLD_TZ;
            if (this.tcHold === need) {
                // [QoL] Time Zone đang hồi: không nuốt input — thả nút vẫn bắn Kim Giây
                if (this.tcTZ > 0) { this.tcUsed = true; this.tcHold = 0; tcEndTZ(this, true); }
                else if (this.tcCd <= 0) { this.tcUsed = true; this.tcHold = 0; tcStartTZ(this); }
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
        if (p.ammo > 0 && now - (p.lastShot || 0) >= 220 && Math.abs((p.x + p.w / 2) - (e.x + e.w / 2)) < 12) return 'tap';
        return null;
    }
    if (p.tcCd <= 0 && p.ammo >= Math.min(2, p.maxAmmo)) {
        // mở Time Zone khi có nhiều đạn địch đang lao tới (để Nghịch Chuyển) hoặc địch vừa bị choáng
        const inc = e.bullets.filter(b => (p.id === 1 ? (b.vy || 0) > 0 : (b.vy || 0) < 0)).length;
        if (inc >= 2 || (e.freezeTimer || 0) > 20 || Math.random() < 0.03) return 'tz';
    }
    return null;
}
