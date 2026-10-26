// ==========================================
// Nhất Quyền / Một Đấm (one_punch) — Logic (docs/BODY_MOI_2.md)
// ------------------------------------------
// Nội tại: maxAmmo cố định 1 (mỗi viên cộng thêm -> +20% tốc nạp & +15% st). Thanh THÚ VỊ (opExc 0..100)
//   tích theo sát thương GỐC nhận (trước giảm): x22 / Evo1 x30 / Full x40 mỗi 1.0 dame.
//   Buff: +exc*0.35% tốc chạy, -exc*0.30% st nhận. 5s không bị đánh -> hồi máu (base tiêu 10%/HP,
//   Evo1 7%/HP, xả 20%/s; Full: không tiêu Thú Vị, +0.5 HP/s khi Thú Vị > 0).
// Nhấp: ĐẤM THƯỜNG — gồng 0.35s (vạch cảnh báo đỏ khoá trục X lúc nhấp) rồi phóng cột áp lực: tâm |dx|<30 = 0.72x + đẩy nhẹ + phá 1 lớp Khiên; rìa 30–85 = 0.24x.
//   Xoá đạn thường trên đường quyền, x3 st lên Tường chắn/Vật triệu hồi (tường đầu tiên chặn cú đấm).
//   Evo 1: trong 0.4s sau Đấm Thường, nhấp tiếp -> 4 luồng quyền phong nhỏ (tổng +1.2).
// Giữ 1s (Full 0.5s) khi THÚ VỊ >= 55% & hồi 12s (Full 8s) xong: ĐẤM NGHIÊM TÚC. Khi tụ: -50% st nhận, miễn
//   đẩy/kéo, đường cảnh báo đỏ rộng (Full: hút nhẹ địch về tâm); Evo 2: Trái/Phải -> bật ngang 120px.
//   Nhả: tiêu hết Thú Vị -> GIÁP ẢO = consumed/100*4 (giảm dần 12s; Full vĩnh viễn), hitscan 4.0 xuyên MỌI
//   tường, xoá đạn/triệu hồi/vũng trên đường. Full: DEATH PUNCH hạ gục ngay địch ở tâm có hp <= 35%.
// Toàn bộ trạng thái là trường thuần trên player / entity trong bodyEffects -> đồng bộ online.
// ==========================================

const OP_YEL = '#facc15', OP_RED = '#ef4444', OP_CRIMSON = '#b91c1c', OP_WHITE = '#f8fafc';
const OP_CENTER = 30, OP_EDGE = 85, OP_SER_HW = 52;
const OP_TAP = 14, OP_CHARGE_START = 8, OP_NOHIT = 300, OP_FOLLOW = 24;

function opE1(p) { return p.hasUpgrade('evo_punch_1'); }
function opE2(p) { return p.hasUpgrade('evo_punch_2'); }
function opFull(p) { return hasFullEvo(p, 'one_punch'); } // cần thêm thẻ FULL EVO (FULL_EVO_GATE)
function opIs(p) { return p && p.weapon === 'one_punch'; }
function opEnemy(p) { return p === p1 ? p2 : p1; }
function opDir(p) { return p.id === 1 ? -1 : 1; }
function opAlive(t) { return t && t.hp > 0; }
function opSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function opTxt(p, s, c, sz) { addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -20 : p.h + 24), s, c, sz || 12); }
function opScale(p) { return (p.damage || 2.5) / 2.5; }
function opHoldN(p) { return opFull(p) ? 30 : 60; }
function opSerCdMax(p) { return opFull(p) ? 480 : 720; }
function opUnlocked(p) { return (p.opSerCd || 0) <= 0 && (p.opExc || 0) >= 55; }
function opBotWantsSerious(p) { return opUnlocked(p) && !p.opCharging; }

// ---------- Chuyển hoá đạn: maxAmmo luôn = 1 ----------
function opConvertAmmo(p) {
    if (p.maxAmmo > 1) {
        const old = p.opAmmoBonus || 0, n = old + (p.maxAmmo - 1);
        p.reloadTime *= (1 + 0.2 * old) / (1 + 0.2 * n);
        p.damage *= (1 + 0.15 * n) / (1 + 0.15 * old);
        p.opAmmoBonus = n;
        p.maxAmmo = 1;
        if (p.ammo > 1) p.ammo = 1;
    } else if (p.maxAmmo < 1) p.maxAmmo = 1;
}

// ---------- Vật cản / triệu hồi ----------
function opWalls(p) {
    const L = [];
    if (typeof movingObstacle !== 'undefined' && movingObstacle && movingObstacle.active) L.push(movingObstacle);
    if (typeof bastions !== 'undefined') bastions.forEach(o => o && o.active !== false && o.owner !== p && L.push(o));
    if (typeof sniperWalls !== 'undefined') sniperWalls.forEach(o => o && o.active !== false && o.owner !== p && L.push(o));
    if (typeof bodyEffects !== 'undefined') bodyEffects.forEach(o => o && o.isStone && o.active && o.owner !== p && L.push(o));
    return L;
}
function opSummons(p) {
    const L = [];
    const A = [typeof turrets !== 'undefined' ? turrets : null, typeof creatorTurrets !== 'undefined' ? creatorTurrets : null,
        typeof creatorDrones !== 'undefined' ? creatorDrones : null, typeof creatorRobots !== 'undefined' ? creatorRobots : null,
        typeof necroMinions !== 'undefined' ? necroMinions : null, typeof ghostDecoys !== 'undefined' ? ghostDecoys : null];
    for (const a of A) if (Array.isArray(a)) for (const o of a) if (o && o.active !== false && o.owner !== p && o.player !== p) L.push(o);
    return L;
}
function opInCol(o, cx, hw, ya, yb) {
    const ox = o.x + (o.w || 0) / 2, oy = o.y + (o.h || 0) / 2;
    return Math.abs(ox - cx) < hw + (o.w || 0) / 2 && oy >= Math.min(ya, yb) - (o.h || 0) / 2 && oy <= Math.max(ya, yb) + (o.h || 0) / 2;
}
function opHitObj(o, d, p) {
    if (typeof o.takeDamage === 'function') { try { o.takeDamage(d, p); } catch (e) { } }
    else if (typeof o.hp === 'number') { o.hp -= d; if (o.hp <= 0) o.active = false; }
    spawnSparkParticles(o.x + (o.w || 0) / 2, o.y + (o.h || 0) / 2, OP_YEL, 8);
}
function opKillObj(o) {
    if (typeof o.hp === 'number') o.hp = 0;
    o.active = false;
    spawnSparkParticles(o.x + (o.w || 0) / 2, o.y + (o.h || 0) / 2, OP_RED, 10);
}
function opBreakCrates(p, cx, hw, ya, yb) {
    if (typeof crates === 'undefined') return;
    for (const c of crates) if (c.active && opInCol(c, cx, hw, ya, yb)) { c.active = false; crateOnBreak(c, p); grantCrateLoot(c, p); }
}
function opSmallBullet(b) { return b && !b.isLazer && !b.isRaycast && !b.isBeam && !b.isUltimate && (b.w || 6) <= 18 && (b.h || 6) <= 30; }
function opClearBullets(p, cx, hw, ya, yb, all) {
    const e = opEnemy(p);
    if (!e || !e.bullets) return 0;
    let n = 0;
    for (let j = e.bullets.length - 1; j >= 0; j--) {
        const b = e.bullets[j];
        if (!opInCol(b, cx, hw, ya, yb) || (!all && !opSmallBullet(b))) continue;
        spawnSparkParticles(b.x + (b.w || 0) / 2, b.y + (b.h || 0) / 2, OP_WHITE, 3);
        e.bullets.splice(j, 1); n++;
    }
    return n;
}
function opClearZones(p, cx, hw) {
    let n = 0;
    const hit = z => z && z.active !== false && z.owner !== p && Math.abs((z.x || 0) + (z.w || 0) / 2 - cx) < hw + (z.r || z.radius || (z.w || 0) / 2 || 0);
    const A = [typeof iceZones !== 'undefined' ? iceZones : null, typeof voidZones !== 'undefined' ? voidZones : null,
        typeof radiationZones !== 'undefined' ? radiationZones : null];
    for (const a of A) if (Array.isArray(a)) for (const z of a) if (hit(z)) { z.active = false; z.life = 0; n++; }
    if (typeof bodyEffects !== 'undefined' && typeof BodyZone !== 'undefined') for (const z of bodyEffects) if (z instanceof BodyZone && hit(z)) { z.active = false; n++; }
    return n;
}

// ---------- Entity: VFX luồng quyền (cột áp lực) ----------
class OpPunchFx {
    constructor(owner, cx, y0, y1, kind) {
        this.team = owner.id; this.x = cx; this.y0 = y0; this.y1 = y1; this.kind = kind;
        this.t = 0; this.dur = kind === 'serious' ? 40 : (kind === 'gust' ? 14 : 22); this.active = true;
        this.seed = Math.round(Math.random() * 600) / 100;
    }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof opDrawPunchFx === 'function') opDrawPunchFx(this); }
}

// ---------- Entity: Kết liễu "Cú Đấm Rẽ Đôi Bầu Trời" ----------
class OpFinisher {
    constructor(owner, victim, death) {
        this.team = owner.id; this.dir = opDir(owner);
        this.ox = owner.x + owner.w / 2; this.oy = owner.y + owner.h / 2;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2; this.vw = victim.w; this.vh = victim.h;
        this.death = !!death; this.seed = Math.round(Math.random() * 1000) / 100;
        this.t = 0; this.dur = 130; this.active = true;
    }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { }
    drawOver() { if (typeof opDrawFinisherOver === 'function') opDrawFinisherOver(this); }
}

// ---------- Đấm Thường ----------
// Nhấp: gồng quyền 0.35s (OP_WIND) — vạch cảnh báo đỏ khoá trục X lúc nhấp — rồi mới phóng cột áp lực.
const OP_WIND = 21, OP_DMG_C = 0.72, OP_DMG_E = 0.24;
function opNormalPunch(p, now) {
    if (!(p.ammo > 0)) { opTxt(p, 'ĐANG NẠP...', '#94a3b8', 10); return; }
    if (p.opWindT > 0) return;
    p.ammo--; p.lastShot = now;
    p.opWindT = OP_WIND; p.opWindX = p.x + p.w / 2;
    opSfx('playCharge');
}
function opFirePunch(p, cx) {
    p.opRecoil = 12;
    if (opE1(p)) { p.opFollowT = OP_FOLLOW; p.opFollowUsed = false; }
    const dir = opDir(p), y0 = dir < 0 ? p.y : p.y + p.h, e = opEnemy(p);
    // tường đầu tiên trên đường quyền chặn cú đấm (nhận x3)
    let wall = null, wy = null;
    for (const o of opWalls(p)) {
        if (Math.abs(o.x + o.w / 2 - cx) > OP_CENTER + o.w / 2) continue;
        const oy = dir < 0 ? o.y + o.h : o.y;
        if ((oy - y0) * dir < 0) continue;
        if (e && (oy - (e.y + e.h / 2)) * dir > 0) continue;
        if (wy === null || (oy - wy) * dir < 0) { wall = o; wy = oy; }
    }
    const yEnd = wall ? wy : (dir < 0 ? -20 : canvas.height + 20);
    if (wall && typeof wall.hp === 'number') opHitObj(wall, p.damage * 3, p);
    for (const o of opSummons(p)) if (opInCol(o, cx, OP_CENTER, y0, yEnd)) opHitObj(o, p.damage * 3, p);
    opBreakCrates(p, cx, OP_CENTER, y0, yEnd);
    opClearBullets(p, cx, OP_CENTER, y0, yEnd, false);
    bodyEffects.push(new OpPunchFx(p, cx, y0, yEnd, 'normal'));
    if (wall) {
        explosions.push(new Explosion(cx, wy, 28, 'rgba(250, 204, 21,', 0, p));
        addFloatingText(cx, wy, 'x3 TƯỜNG', OP_YEL, 11);
    } else if (opAlive(e)) {
        const dx = Math.abs(e.x + e.w / 2 - cx);
        if (dx < OP_CENTER) {
            if (e.shield > 0) { e.shield--; addFloatingText(e.x + e.w / 2, e.y + (e.id === 1 ? -28 : e.h + 30), 'PHÁ KHIÊN!', '#00f0ff', 12); }
            e.takeDamage(p.damage * OP_DMG_C, p, { bypassShield: true });
            if (opAlive(e)) e.kbX = (e.x + e.w / 2 < cx ? -1 : 1) * 4;
            explosions.push(new Explosion(e.x + e.w / 2, e.y + e.h / 2, 34, 'rgba(250, 204, 21,', 0, p));
            triggerScreenShake(5, 8);
        } else if (dx < OP_EDGE) {
            e.takeDamage(p.damage * OP_DMG_E, p);
        }
    }
    opSfx('playExplosion');
}

function opGust(p) {
    const dir = opDir(p), cx = p.x + p.w / 2 + ((p.opGustQ % 2) ? -7 : 7);
    spawnBullet(p, { x: cx - 5, y: dir < 0 ? p.y - 14 : p.y + p.h, w: 10, h: 14, vx: 0, vy: dir * 12, dmg: 0.6 * opScale(p), hook: 'one_punch', opGust: true });
    p.opRecoil = 6;
    opSfx('playShoot');
}

// ---------- Đấm Nghiêm Túc ----------
function opStartCharge(p) {
    p.opCharging = true; p.opLineX = p.x + p.w / 2; p.opLockX = p.x; p.opLockY = p.y;
    opTxt(p, 'NGHIÊM TÚC...', OP_RED, 13);
    opSfx('playPowerup');
}
function opSeriousPunch(p) {
    const consumed = p.opExc || 0;
    p.opExc = 0; p.opCharging = false; p.opSerCd = opSerCdMax(p); p.opRecoil = 16;
    const gain = consumed / 100 * 4;
    p.opVS = Math.max(p.opVS || 0, gain); p.opVSMax = p.opVS;
    p.opVSDecay = opFull(p) ? 0 : p.opVS / 720;
    const dir = opDir(p), cx = p.x + p.w / 2, y0 = dir < 0 ? p.y : p.y + p.h, yEnd = dir < 0 ? -40 : canvas.height + 40, e = opEnemy(p);
    opClearBullets(p, cx, OP_SER_HW, y0, yEnd, true);
    for (const o of opSummons(p)) if (opInCol(o, cx, OP_SER_HW, y0, yEnd)) opKillObj(o);
    for (const o of opWalls(p)) if (o !== (typeof movingObstacle !== 'undefined' ? movingObstacle : null) && opInCol(o, cx, OP_SER_HW, y0, yEnd)) opHitObj(o, 4 * opScale(p) * 3, p);
    opClearZones(p, cx, OP_SER_HW);
    opBreakCrates(p, cx, OP_SER_HW, y0, yEnd);
    bodyEffects.push(new OpPunchFx(p, cx, y0, yEnd, 'serious'));
    opTxt(p, 'ĐẤM NGHIÊM TÚC!', OP_RED, 15);
    if (gain > 0) addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -34 : p.h + 38), 'GIÁP ẢO +' + gain.toFixed(1), OP_WHITE, 12);
    triggerScreenShake(12, 18);
    opSfx('playExplosion');
    if (!opAlive(e)) return;
    const dx = Math.abs(e.x + e.w / 2 - cx);
    if (dx >= OP_SER_HW) return;
    if (opFull(p) && dx < OP_CENTER && e.hp <= e.maxHp * 0.35) {
        addFloatingText(e.x + e.w / 2, e.y + (e.id === 1 ? -30 : e.h + 34), 'DEATH (TỬ)', OP_RED, 20);
        p.opDeathMark = true;
        e.invincibleTimer = 0;
        e.takeDamage(e.hp + 99, p, { unavoidable: true, bypassShield: true, ignoreInvincible: true, isPiercing: true });
        if (e.hp > 0 && gameState.phase === 'playing') {
            e.hp = 0; e.ghostHp = 0;
            opSpawnFinisher(p, e);
            triggerFatalCinematic(p.id, e);
        }
        p.opDeathMark = false;
        return;
    }
    e.takeDamage(4 * opScale(p), p, { isPiercing: true });
    explosions.push(new Explosion(e.x + e.w / 2, e.y + e.h / 2, 60, 'rgba(239, 68, 68,', 0, p));
}

function opSpawnFinisher(p, v) {
    if (typeof bodyEffects === 'undefined' || bodyEffects.some(e => e instanceof OpFinisher)) return;
    bodyEffects.push(new OpFinisher(p, v, p.opDeathMark));
    triggerScreenShake(14, 24);
    spawnSparkParticles(v.x + v.w / 2, v.y + v.h / 2, OP_RED, 26);
    opSfx('playExplosion');
}

BulletHooks.register('one_punch', {
    hit(b, o, v) { if (v) spawnSparkParticles(b.x + b.w / 2, v.y + v.h / 2, OP_YEL, 5); },
    draw(b) { if (typeof opDrawGust === 'function') opDrawGust(b); },
});

CharHooks.register('one_punch', {
    setup() {
        this.reloadTime *= (opE1(this) ? 1500 : 2200) / 1500;
        this.opAmmoBonus = 0; opConvertAmmo(this);
        this.opExc = 0; this.opNoHit = 0; this.opLastHp = this.maxHp; this.opRegenFx = 0;
        this.opPrevS = false; this.opHold = 0; this.opHoldEat = false; this.opCharging = false;
        this.opSerCd = 0; this.opFollowT = 0; this.opFollowUsed = true; this.opGustQ = 0; this.opGustT = 0;
        this.opVS = 0; this.opVSMax = 0; this.opVSDecay = 0; this.opVSFx = 0;
        this.opLineX = 0; this.opLockX = this.x; this.opLockY = this.y; this.opDashT = 0; this.opDashV = 0; this.opDashCd = 0;
        this.opPrevL = false; this.opPrevR = false; this.opRecoil = 0; this.opDeathMark = false; this.opWindT = 0; this.opWindX = 0;
    },
    update(inp, eff) {
        opConvertAmmo(this);
        if (this.opSerCd > 0) this.opSerCd--;
        if (this.opFollowT > 0) this.opFollowT--;
        if (this.opRecoil > 0) this.opRecoil--;
        if (this.opWindT > 0 && --this.opWindT <= 0) { this.opWindT = 0; if (this.hp > 0) opFirePunch(this, this.opWindX); }
        if (this.opVSFx > 0) this.opVSFx--;
        if (this.opRegenFx > 0) this.opRegenFx--;
        // Giáp Ảo giảm dần (Full Evo: vĩnh viễn)
        if (this.opVS > 0 && this.opVSDecay > 0) this.opVS = Math.max(0, this.opVS - this.opVSDecay);
        // Evo 1: 4 luồng quyền phong
        if (this.opGustQ > 0 && ++this.opGustT >= 5) { this.opGustT = 0; opGust(this); this.opGustQ--; }
        // Hồi máu sau 5s không nhận sát thương
        if (this.hp < this.opLastHp - 1e-6) this.opNoHit = 0; else this.opNoHit++;
        if (this.opNoHit >= OP_NOHIT && this.hp > 0 && this.hp < this.maxHp && this.opExc > 0) {
            if (opFull(this)) this.hp = Math.min(this.maxHp, this.hp + 0.5 / 60);
            else {
                const use = Math.min(this.opExc, 20 / 60);
                this.opExc -= use;
                this.hp = Math.min(this.maxHp, this.hp + use / (opE1(this) ? 7 : 10));
            }
            this.opRegenFx = 10;
        }
        this.opLastHp = this.hp;
        // Đang tụ Đấm Nghiêm Túc: miễn đẩy/kéo, khoá vị trí, Evo 2 bật ngang, Full hút địch
        if (this.opCharging) {
            const i = eff || inp || {};
            if (opE2(this)) {
                if (this.opDashCd > 0) this.opDashCd--;
                const l = !!i.l, r = !!i.r;
                if (this.opDashT <= 0 && this.opDashCd <= 0 && ((l && !this.opPrevL) || (r && !this.opPrevR))) {
                    this.opDashT = 8; this.opDashV = (l && !this.opPrevL ? -1 : 1) * 15; this.opDashCd = 14;
                    opSfx('playDash');
                }
                this.opPrevL = l; this.opPrevR = r;
            }
            if (this.opDashT > 0) {
                this.opDashT--;
                this.opLockX = Math.max(0, Math.min(canvas.width - this.w, this.opLockX + this.opDashV));
            }
            this.kbX = 0; this.kbY = 0;
            if (this.magPullPhase) { this.magPullPhase = 0; this.magPullT = 0; }
            this.x = this.opLockX; if (gameState.phase === 'playing') this.y = this.opLockY;
            this.opLineX = this.x + this.w / 2;
            const e = opEnemy(this);
            if (opFull(this) && opAlive(e) && !opIs(e)) {
                const d = this.opLineX - (e.x + e.w / 2);
                if (Math.abs(d) > 1) e.x = Math.max(0, Math.min(canvas.width - e.w, e.x + Math.sign(d) * Math.min(0.9, Math.abs(d))));
            }
        } else { this.opDashT = 0; this.opPrevL = !!(eff || inp || {}).l; this.opPrevR = !!(eff || inp || {}).r; }
    },
    speed(cur) {
        if (this.opCharging) { this.kbX = 0; return 0; }
        return cur * (1 + Math.min(35, (this.opExc || 0) * 0.35) / 100);
    },
    shoot(inp, now) {
        const s = !!inp.s, pressed = s && !this.opPrevS, released = !s && this.opPrevS;
        this.opPrevS = s;
        if (pressed) {
            this.opHold = 0; this.opHoldEat = false;
            if (opE1(this) && this.opFollowT > 0 && !this.opFollowUsed) {
                this.opFollowUsed = true; this.opFollowT = 0; this.opGustQ = 4; this.opGustT = 4; this.opHoldEat = true;
                opTxt(this, 'ĐẤM BỒI!', OP_YEL, 12);
                return true;
            }
        }
        if (s) {
            if (this.opHoldEat) return true;
            this.opHold++;
            if (!this.opCharging && this.opHold >= OP_CHARGE_START && opUnlocked(this)) opStartCharge(this);
        } else if (released) {
            if (this.opHoldEat) { this.opHoldEat = false; return true; }
            if (this.opCharging) {
                if (this.opHold >= opHoldN(this)) opSeriousPunch(this);
                else { this.opCharging = false; if (this.opHold < OP_TAP) opNormalPunch(this, now); else opTxt(this, 'HỦY', '#94a3b8', 10); }
            } else opNormalPunch(this, now);
            this.opHold = 0;
        } else { this.opHold = 0; if (this.opCharging) this.opCharging = false; }
        return true;
    },
});

// ---------- Bọc takeDamage: Thú Vị (st gốc), giảm st, Giáp Ảo, kết liễu ----------
(function () {
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        const me = opIs(this) && typeof amount === 'number' && this.hp > 0 && typeof gameState !== 'undefined' && gameState.phase === 'playing';
        const before = this.hp;
        let r;
        if (me) {
            const opt = options || {};
            const raw = amount;
            let a = amount * (1 - Math.min(30, (this.opExc || 0) * 0.30) / 100);
            if (this.opCharging) a *= 0.5;
            const blocked = (this.invincibleTimer > 0 && !opt.ignoreInvincible && !opt.unavoidable) || (this.shield > 0 && !opt.bypassShield);
            let absorbed = 0;
            if (!blocked && this.opVS > 0) {
                absorbed = Math.min(this.opVS, a); this.opVS -= absorbed; a -= absorbed; this.opVSFx = 16;
                if (this.opVS <= 1e-4) { this.opVS = 0; this.opVSDecay = 0; }
            }
            if (absorbed > 0 && a <= 1e-4) {
                addFloatingText(this.x + this.w / 2, this.y - 10, 'GIÁP ẢO', OP_WHITE, 13);
                spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, OP_WHITE, 8);
                r = 0;
            } else r = origTD.call(this, a, attacker, options);
            if (this.hp < before || absorbed > 0) {
                const rate = opFull(this) ? 40 : (opE1(this) ? 30 : 22);
                this.opExc = Math.min(100, (this.opExc || 0) + raw * rate);
                this.opNoHit = 0;
            }
        } else r = origTD.apply(this, arguments);
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && opIs(attacker)) opSpawnFinisher(attacker, this);
        return r;
    };
})();
