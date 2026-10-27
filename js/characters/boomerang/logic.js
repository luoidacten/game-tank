// ==========================================
// Boomerang — Thợ Săn Gió Xoáy (boomerang) — "Ném đi... và luôn quay về!"
// ------------------------------------------
// 2 chiếc Boomerang độc lập (trạng thái riêng: 'hand' | 'fly' | 'cd'). Nhấp = ném chiếc đang chọn, giữ 0.4s = đổi chiếc
// (Evo 1: 0.25s + tự chuyển sang chiếc còn trên tay sau khi ném).
//  • Chiếc 1 — THẲNG (BmStraight): bay dọc theo x cố định (1.0x mọi thứ xuyên qua) -> tới làn địch/biên dừng lại,
//    phóng to r=55 xoay 2.0s (0.25x / 0.2s, chậm nhẹ) -> bay ngược về cùng trục x (1.0x, vạch chỉ đường xanh lá).
//    BẮT (chạm xe) -> hồi 0.5s + HỨNG KHỞI 3s (+25% tốc & dame cả 2 chiếc). LỌT (qua lưng chạm biên sau) -> hồi 8s.
//  • Chiếc 2 — VÒNG CUNG (BmCurve): bay theo quỹ đạo ELIP cố định (đỉnh = điểm ném & mép xa làn địch), phình ra cánh
//    (ưu tiên phía địch / hướng đang chạy); nửa đi 1.2x, nửa về 0.8x, có vạch nét đứt báo trước để địch né.
//    Về đỉnh ném: xe chạm -> bắt (về tay ngay); không chạm -> TRƯỢT, hồi 2s. Full Evo: đoạn cuối bẻ lái về phía xe.
//  • Evo 2: chiếc Thẳng đang xoay hút nhẹ + xé giáp (+15% st nhận); 2 chiếc vòng cung đối xứng; ĐIỂM GIAO CẮT.
//  • Full Evo: chiếc Thẳng về bẻ lái về phía xe, xoay 2.5s, phá đạn nhỏ; buff cộng 2 tầng (+60%), Khiên Gió; giao cắt
//    bắn 6 lưỡi gió 360°.
// Mọi trạng thái là trường thuần trên player / entity trong bodyEffects (đồng bộ online).
// ==========================================

const BM_GREEN = '#4ade80', BM_TEAL = '#2dd4bf', BM_CYAN = '#67e8f9', BM_GOLD = '#fde047';
const BM_R0 = 12, BM_RBIG = 46;
// [NERF] hệ số sát thương & bán kính trúng đòn (bán kính bắt giữ giữ nguyên)
const BM_M_STR = 0.75, BM_M_SPIN = 0.18, BM_M_OUT = 0.9, BM_M_RET = 0.6, BM_M_CROSS = 1.35, BM_CROSS_R = 85, BM_M_BLADE = 0.26, BM_HIT_K = 0.8;

function bmE1(p) { return p.hasUpgrade('evo_boom_1'); }
function bmE2(p) { return p.hasUpgrade('evo_boom_2'); }
function bmFull(p) { return bmE1(p) && bmE2(p) && hasFullEvo(p, 'boomerang'); }
function bmIs(p) { return !!p && p.weapon === 'boomerang'; }
function bmTeam(id) { return id === 1 ? p1 : p2; }
function bmEnemyOf(id) { return id === 1 ? p2 : p1; }
function bmDir(p) { return p.id === 1 ? -1 : 1; }
function bmSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function bmTxt(p, s, c, z) { addFloatingText(p.x + p.w / 2, p.id === 1 ? p.y - 16 : p.y + p.h + 20, s, c, z || 11); }
function bmSwitchN(p) { return bmE1(p) ? 15 : 24; }
function bmBuffPer(p) { return bmFull(p) ? 0.25 : (bmE1(p) ? 0.30 : 0.20); }
function bmBuffMult(p) { return 1 + ((p.bmBuffT || 0) > 0 ? (p.bmBuffN || 1) * bmBuffPer(p) : 0); }
function bmDmg(p, m) { return p.damage * m * bmBuffMult(p); }
function bmHitR(x, y, r, o) {
    if (!o) return false;
    const nx = Math.max(o.x, Math.min(o.x + o.w, x)), ny = Math.max(o.y, Math.min(o.y + o.h, y));
    return (x - nx) * (x - nx) + (y - ny) * (y - ny) <= r * r;
}
let bmTick = 0;

// Vật triệu hồi / công trình phe địch
function bmSummons(team) {
    const L = [];
    const add = a => { if (Array.isArray(a)) for (const o of a) if (o && o.active !== false && (o.hp === undefined || o.hp > 0)) L.push(o); };
    if (typeof turrets !== 'undefined') add(turrets);
    if (typeof creatorTurrets !== 'undefined') add(creatorTurrets);
    if (typeof creatorRobots !== 'undefined') add(creatorRobots);
    if (typeof necroMinions !== 'undefined') add(necroMinions);
    if (typeof sniperWalls !== 'undefined') add(sniperWalls);
    if (typeof bastions !== 'undefined') add(bastions);
    if (typeof ghostDecoys !== 'undefined') add(ghostDecoys);
    if (typeof bodyEffects !== 'undefined') add(bodyEffects.filter(o => o && o.isStone));
    const me = bmTeam(team);
    return L.filter(o => typeof o.x === 'number' && o.w && o.owner !== me && o.player !== me && !(o.owner && o.owner.id === team));
}
// Thùng / xe tiền / vật triệu hồi trong vòng tròn (mỗi vật tối đa 1 lần / 0.5s)
function bmHitWorld(p, x, y, r, d) {
    if (typeof crates !== 'undefined') for (const c of crates) if (c.active && bmHitR(x, y, r, c)) { c.active = false; crateOnBreak(c, p); grantCrateLoot(c, p); }
    const ok = o => { if ((o._bmLast || -999) + 30 > bmTick) return false; o._bmLast = bmTick; return true; };
    if (typeof moneyTrucks !== 'undefined') for (const t of moneyTrucks) {
        if (!t.active || !bmHitR(x, y, r, t) || !ok(t)) continue;
        t.hp -= d * 2;
        if (t.hp <= 0) {
            t.active = false;
            let m = 30; if (p.weapon === 'money_tank') m *= 2;
            if (p.id === 1) gameState.p1Coins += m; else gameState.p2Coins += m;
            addFloatingText(t.x + t.w / 2, t.y - 8, `+${m}$ 💰`, '#ffd700', 13);
        }
    }
    for (const o of bmSummons(p.id)) {
        if (!bmHitR(x, y, r, o) || !ok(o)) continue;
        if (typeof o.takeHit === 'function') o.takeHit(d, p);
        else if (typeof o.takeDamage === 'function') o.takeDamage(d, p);
        else if (typeof o.hp === 'number') { o.hp -= d; if (o.hp <= 0) o.active = false; }
        spawnSparkParticles(o.x + o.w / 2, o.y + o.h / 2, BM_GREEN, 5);
    }
}
function bmHitEnemy(p, e, d, color) {
    if (!e || e.hp <= 0) return;
    e.takeDamage(d, p);
    spawnSparkParticles(e.x + e.w / 2, e.y + e.h / 2, color || BM_GREEN, 6);
}

// ---------- Chiếc 1: Boomerang Thẳng ----------
class BmStraight {
    constructor(owner) {
        const e = bmEnemyOf(owner.id);
        this.team = owner.id; this.dir = bmDir(owner);
        this.x = owner.x + owner.w / 2; this.y = owner.id === 1 ? owner.y - 4 : owner.y + owner.h + 4;
        this.r = BM_R0; this.st = 'out'; this.t = 0; this.spinT = 0;
        this.spinMax = bmFull(owner) ? 150 : 120;
        this.tgtY = e && e.hp > 0 ? e.y + e.h / 2 : (this.dir < 0 ? 26 : canvas.height - 26);
        this.hitOut = false; this.hitRet = false; this.combo = false; this.caught = false;
        this.ang = 0; this.active = true;
    }
    update() {
        const o = bmTeam(this.team), e = bmEnemyOf(this.team);
        if (!o || !bmIs(o) || gameState.phase !== 'playing') { this.end(o, 'drop'); return; }
        this.t++;
        this.ang += this.st === 'spin' ? 0.55 : 0.32;
        if (this.st === 'out') {
            this.y += this.dir * 9;
            if (!this.hitOut && e && e.hp > 0 && bmHitR(this.x, this.y, this.r * BM_HIT_K, e)) { this.hitOut = true; bmHitEnemy(o, e, bmDmg(o, BM_M_STR)); }
            bmHitWorld(o, this.x, this.y, this.r * BM_HIT_K, bmDmg(o, BM_M_STR));
            const edge = this.dir < 0 ? this.y <= 26 : this.y >= canvas.height - 26;
            if ((this.y - this.tgtY) * this.dir >= 0 || edge || this.t > 150) {
                this.st = 'spin'; this.spinT = 0;
                bmSfx('playDash');
            }
        } else if (this.st === 'spin') {
            this.spinT++;
            this.r = Math.min(BM_RBIG, this.r + 5);
            if (e && e.hp > 0 && bmHitR(this.x, this.y, this.r * BM_HIT_K, e)) {
                addStatusSlow(e, 0.8);
                if (bmE2(o)) {
                    addStatusVuln(e, 0.15);
                    const dx = this.x - (e.x + e.w / 2);
                    e.x = Math.max(0, Math.min(canvas.width - e.w, e.x + Math.sign(dx) * Math.min(Math.abs(dx), 1.1)));
                }
                if (this.spinT % 12 === 0) bmHitEnemy(o, e, bmDmg(o, BM_M_SPIN), BM_TEAL);
            }
            if (this.spinT % 12 === 0) bmHitWorld(o, this.x, this.y, this.r * BM_HIT_K, bmDmg(o, BM_M_SPIN));
            if (bmFull(o) && e && e.bullets) {
                for (let i = e.bullets.length - 1; i >= 0; i--) {
                    const b = e.bullets[i];
                    if (b.isLazer || b.isBeam || b.isUltimate || (b.w || 6) > 18) continue;
                    if (Math.hypot(b.x + (b.w || 6) / 2 - this.x, b.y + (b.h || 6) / 2 - this.y) < this.r * 0.8) { e.bullets.splice(i, 1); spawnSparkParticles(b.x, b.y, BM_GREEN, 3); }
                }
            }
            if (this.spinT >= this.spinMax) { this.st = 'ret'; this.t = 0; }
        } else {
            this.r = Math.max(BM_R0, this.r - 4);
            this.y -= this.dir * 8;
            if (bmFull(o) && o.hp > 0) { const dx = o.x + o.w / 2 - this.x; this.x += Math.sign(dx) * Math.min(Math.abs(dx), 1.3); }
            if (!this.hitRet && e && e.hp > 0 && bmHitR(this.x, this.y, this.r * BM_HIT_K, e)) { this.hitRet = true; bmHitEnemy(o, e, bmDmg(o, BM_M_STR)); }
            bmHitWorld(o, this.x, this.y, this.r * BM_HIT_K, bmDmg(o, BM_M_STR));
            if (o.hp > 0) {
                const ocx = o.x + o.w / 2, ocy = o.y + o.h / 2;
                const mag = bmE1(o) ? 25 : 0;
                if (mag && Math.abs(this.y - ocy) < 60 && Math.abs(this.x - ocx) < o.w / 2 + this.r + mag + 8) this.x += Math.sign(ocx - this.x) * 2; // hút nhẹ vào tay
                if (Math.abs(this.x - ocx) <= o.w / 2 + this.r + 4 + mag && Math.abs(this.y - ocy) <= o.h / 2 + this.r + 4) { this.end(o, 'catch'); return; }
            }
            if (this.dir < 0 ? this.y > canvas.height + this.r : this.y < -this.r) { this.end(o, 'miss'); return; }
        }
    }
    end(o, how) {
        if (!this.active) return;
        this.active = false;
        if (!o || !bmIs(o)) return;
        if (how === 'catch') {
            this.caught = true;
            o.bmSSt = 'cd'; o.bmSCd = 30;
            bmCatchFx(o, this.x, this.y, 0);
            bmOnCatch(o);
        } else if (how === 'miss') {
            o.bmSSt = 'cd'; o.bmSCd = bmE1(o) ? 270 : 480;
            bmTxt(o, 'RƠI MẤT! ' + (bmE1(o) ? '4.5s' : '8s'), '#94a3b8', 11);
        } else { o.bmSSt = 'hand'; o.bmSCd = 0; }
    }
    draw() { if (typeof bmDrawStraight === 'function') bmDrawStraight(this); }
}

function bmOnCatch(o) {
    const full = bmFull(o);
    o.bmBuffN = full ? Math.min(2, ((o.bmBuffT || 0) > 0 ? (o.bmBuffN || 1) : 0) + 1) : 1;
    o.bmBuffT = bmE1(o) ? 210 : 180;
    o.bmCatchFx = 24;
    if (bmE1(o) && o.hp > 0) o.hp = Math.min(o.maxHp, o.hp + 0.25);
    if (full && (o.bmShieldCd || 0) <= 0) { o.shield = Math.max(o.shield || 0, 1); o.bmShieldCd = 360; bmTxt(o, 'KHIÊN GIÓ', BM_CYAN, 10); }
    bmTxt(o, 'HỨNG KHỞI!' + (o.bmBuffN > 1 ? ' x2' : ''), BM_GREEN, 13);
    spawnSparkParticles(o.x + o.w / 2, o.y + o.h / 2, BM_GREEN, 12);
    bmSfx('playPowerup');
}

// ---------- Chiếc 2: Boomerang Vòng Cung (quỹ đạo ELIP) ----------
// Elip có trục lớn dọc: đỉnh A = vị trí ném (tâm xe lúc ném), đỉnh B = mép xa của làn địch; phình sang 1 bên
// (bán trục nhỏ ~85px, kẹp trong màn hình). Bay ĐI theo nửa elip phía side (1.2x), VỀ theo nửa còn lại (0.8x),
// tốc độ đều trên quỹ đạo. Về tới đỉnh A: xe chạm -> BẮT (về tay ngay); không chạm -> TRƯỢT, hồi thêm 2s.
// Tham số: th ∈ [0, 2π]; x = x0 + side·b·sin(th) (+ bẻ lái Full Evo), y = cy + (y0 - cy)·cos(th).
const BM_CURVE_MISS_CD = 120;
function bmCurveCatchR(o) { return 16 + (bmE1(o) ? 25 : 0); }
class BmCurve {
    constructor(owner, side, twin) {
        const e = bmEnemyOf(owner.id), W = canvas.width, H = canvas.height, fast = bmE1(owner);
        this.team = owner.id;
        this.x0 = owner.x + owner.w / 2; this.y0 = owner.y + owner.h / 2;
        // đỉnh xa B = mép xa của làn địch
        const yB = owner.id === 1 ? (e ? e.y - 4 : 22) : (e ? e.y + e.h + 4 : H - 22);
        this.yB = owner.id === 1 ? Math.max(14, yB) : Math.min(H - 14, yB);
        this.cy = (this.y0 + this.yB) / 2; this.ay = this.y0 - this.cy;          // bán trục lớn (có dấu)
        const room = s => s > 0 ? W - 6 - this.x0 : this.x0 - 6;
        if (!twin && room(side) < 55 && room(-side) > room(side)) side = -side;   // sát tường -> phình sang phía rộng
        this.side = side;
        this.b = Math.max(12, Math.min(85, room(side)));                            // bán trục nhỏ
        const A = Math.abs(this.ay), B = this.b;
        const per = Math.PI * (3 * (A + B) - Math.sqrt((3 * A + B) * (A + 3 * B)));  // chu vi (Ramanujan)
        this.v = per / (fast ? 68 : 92);                                           // ~1.53s / Evo 1 ~1.13s
        this.th = 0; this.bend = 0; this.t = 0;
        this.x = this.x0; this.y = this.y0;
        this.hitOut = false; this.hitRet = false; this.combo = false;
        this.r = 11; this.ang = 0; this.active = true;
    }
    pos(th) { return { x: this.x0 + this.side * this.b * Math.sin(th), y: this.cy + this.ay * Math.cos(th) }; }
    update() {
        const o = bmTeam(this.team), e = bmEnemyOf(this.team);
        if (!o || !bmIs(o) || gameState.phase !== 'playing') { this.finish(o, 'drop'); return; }
        this.t++; this.ang += 0.4 * this.side;
        const sp = Math.hypot(this.b * Math.cos(this.th), this.ay * Math.sin(this.th));
        this.th = Math.min(Math.PI * 2, this.th + this.v / Math.max(4, sp));
        const p = this.pos(this.th);
        // Full Evo: đoạn cuối bẻ lái nhẹ về phía xe cho dễ bắt
        if (bmFull(o) && o.hp > 0 && this.th > Math.PI * 1.6) {
            const w = Math.min(1, (this.th - Math.PI * 1.6) / (Math.PI * 0.4));
            const want = Math.max(-110, Math.min(110, o.x + o.w / 2 - this.x0)) * w;
            this.bend += Math.sign(want - this.bend) * Math.min(Math.abs(want - this.bend), 5);
        }
        this.x = Math.max(4, Math.min(canvas.width - 4, p.x + this.bend)); this.y = p.y;
        const out = this.th < Math.PI, m = out ? BM_M_OUT : BM_M_RET;
        if (e && e.hp > 0 && !(out ? this.hitOut : this.hitRet) && bmHitR(this.x, this.y, this.r - 2, e)) {
            if (out) this.hitOut = true; else this.hitRet = true;
            bmHitEnemy(o, e, bmDmg(o, m), BM_CYAN);
            if (out && bmE1(o)) { e.bmSlowT = 90; addFloatingText(e.x + e.w / 2, e.y + (e.id === 1 ? -14 : e.h + 18), 'CHẬM 35%', BM_CYAN, 10); }
        }
        bmHitWorld(o, this.x, this.y, this.r - 2, bmDmg(o, m));
        if (bmE2(o) && !this.combo) bmTryCross(o, this);
        if (!this.active) return;
        // đón: đoạn về gần đỉnh A
        if (this.th > Math.PI * 1.5 && o.hp > 0 && bmHitR(this.x, this.y, this.r + bmCurveCatchR(o), o)) { this.finish(o, 'catch'); return; }
        if (this.th >= Math.PI * 2) this.finish(o, 'miss');
    }
    finish(o, how) {
        if (!this.active) return;
        this.active = false;
        if (!o || !bmIs(o)) return;
        if (how === 'catch') { spawnSparkParticles(this.x, this.y, BM_CYAN, 10); bmCatchFx(o, this.x, this.y, 1); }
        if (how === 'miss') { o.bmCMiss = true; spawnSparkParticles(this.x, this.y, '#94a3b8', 6); }
        // Evo 2: 2 chiếc đối xứng -> chỉ về tay khi cả 2 đã về
        if (bodyEffects.some(b => b !== this && b.active && b instanceof BmCurve && b.team === this.team)) return;
        if (o.bmCMiss && how !== 'drop') {
            o.bmCSt = 'cd'; o.bmCCd = BM_CURVE_MISS_CD;
            addFloatingText(this.x0, o.id === 1 ? o.y - 16 : o.y + o.h + 20, 'TRƯỢT +2s', '#f87171', 12);
        } else { o.bmCSt = 'hand'; o.bmCCd = 0; }
        o.bmCMiss = false;
    }
    draw() { if (typeof bmDrawCurve === 'function') bmDrawCurve(this); }
}

// ĐIỂM GIAO CẮT: chiếc vòng cung chạm chiếc Thẳng đang phóng to xoay
function bmTryCross(o, c) {
    for (const s of bodyEffects) {
        if (!(s instanceof BmStraight) || !s.active || s.team !== c.team || s.st !== 'spin' || s.combo) continue;
        if (Math.hypot(s.x - c.x, s.y - c.y) > s.r + c.r) continue;
        s.combo = true; c.combo = true;
        s.spinMax += 60;
        const bx = (s.x + c.x) / 2, by = (s.y + c.y) / 2, e = bmEnemyOf(o.id);
        if (e && e.hp > 0 && Math.hypot(e.x + e.w / 2 - bx, e.y + e.h / 2 - by) <= BM_CROSS_R + e.w / 2) {
            const hp0 = e.hp;
            e.takeDamage(bmDmg(o, BM_M_CROSS), o);
            if (e.hp > 0 && (e.invincibleTimer || 0) <= 0 && e.hp <= hp0) e.freezeTimer = Math.max(e.freezeTimer || 0, 45);
        }
        bmHitWorld(o, bx, by, BM_CROSS_R, bmDmg(o, BM_M_CROSS));
        bodyEffects.push(new BmBlast(o.id, bx, by));
        explosions.push(new Explosion(bx, by, 70, 'rgba(74, 222, 128,', 0, o));
        addFloatingText(bx, by - 30, 'ĐIỂM GIAO CẮT!', BM_GOLD, 14);
        triggerScreenShake(7, 12);
        bmSfx('playExplosion');
        if (bmFull(o)) for (let i = 0; i < 6; i++) {
            const a = i * Math.PI / 3 + 0.3;
            spawnBullet(o, { x: bx - 4, y: by - 4, w: 8, h: 8, vx: Math.cos(a) * 7, vy: Math.sin(a) * 7, dmg: bmDmg(o, BM_M_BLADE), isPiercing: true, hook: 'boomerang', bmAng: a });
        }
        return;
    }
}

// ---------- Hiệu ứng BẮT THÀNH CÔNG (hình ảnh): vòng sáng + lấp lánh + chữ "BẮT!" ----------
class BmCatch {
    constructor(team, x, y, kind) { this.team = team; this.x = x; this.y = y; this.kind = kind; this.t = 0; this.dur = 34; this.active = true; this.seed = Math.round(Math.random() * 600) / 100; }
    update() { const o = bmTeam(this.team); if (o) { this.x += (o.x + o.w / 2 - this.x) * 0.3; this.y += (o.y + o.h / 2 - this.y) * 0.3; } if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof bmDrawCatch === 'function') bmDrawCatch(this); }
}
function bmCatchFx(o, x, y, kind) {
    if (typeof bodyEffects !== 'undefined') bodyEffects.push(new BmCatch(o.id, x, y, kind));
    spawnSparkParticles(x, y, kind ? BM_CYAN : BM_GOLD, 10);
    triggerScreenShake(2, 5);
}

// ---------- Bão Kiếm Khí (hình ảnh) ----------
class BmBlast {
    constructor(team, x, y) { this.team = team; this.x = x; this.y = y; this.t = 0; this.dur = 30; this.active = true; }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof bmDrawBlast === 'function') bmDrawBlast(this); }
}

// ---------- Kết liễu KHÔNG LỐI THOÁT ----------
class BmFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.ox = owner.x + owner.w / 2; this.oy = owner.y + owner.h / 2;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2; this.vw = victim.w; this.vh = victim.h;
        this.t = 0; this.dur = 140; this.active = true;
    }
    update() {
        this.t++;
        if (this.t === 40 || this.t === 66 || this.t === 84) triggerScreenShake(this.t === 84 ? 14 : 6, 10);
        if (this.t === 84) { explosions.push(new Explosion(this.x, this.y, 70, 'rgba(74, 222, 128,', 0, bmTeam(this.team))); bmSfx('playExplosion'); }
        if (this.t >= this.dur) this.active = false;
    }
    draw() { }
    drawOver() { if (typeof bmDrawFinisherOver === 'function') bmDrawFinisherOver(this); }
    // Camera: cận cảnh lúc ném -> bám 2 boomerang bay tới -> giữ ở mục tiêu lúc xẻ -> lùi về 1x
    camPath() {
        if (typeof fcamKeys !== 'function') return null;
        return fcamKeys(this.t, [[0, this.ox, this.oy, 1.6], [40, this.x, this.y, 1.4], [96, this.x, this.y, 1.35], [126, this.x, this.y, 1]]);
    }
}

// Wind blades (Full Evo) — đạn thường có hook
BulletHooks.register('boomerang', {
    hit(b, o, v) { if (v) spawnSparkParticles(b.x + b.w / 2, b.y + b.h / 2, BM_GREEN, 4); },
    draw(b) { if (typeof bmDrawBlade === 'function') bmDrawBlade(b); },
});

function bmInHand(p, i) { return (i === 0 ? p.bmSSt : p.bmCSt) === 'hand'; }
function bmThrow(p, i) {
    if (i === 0) {
        p.bmSSt = 'fly';
        bodyEffects.push(new BmStraight(p));
    } else {
        p.bmCSt = 'fly';
        const e = bmEnemyOf(p.id), cx = p.x + p.w / 2;
        let side = 0;
        if (e && e.hp > 0 && Math.abs(e.x + e.w / 2 - cx) > 24) side = Math.sign(e.x + e.w / 2 - cx);
        if (!side && Math.abs(p._vx || 0) > 0.3) side = Math.sign(p._vx);
        if (!side) side = cx < canvas.width / 2 ? 1 : -1;
        p.bmCMiss = false;
        const c1 = new BmCurve(p, side, bmE2(p));
        bodyEffects.push(c1);
        if (bmE2(p)) bodyEffects.push(new BmCurve(p, -c1.side, true));
    }
    p.bmThrowFx = 10;
    bmSfx('playShoot');
    if (bmE1(p) && bmInHand(p, 1 - i)) p.bmSel = 1 - i;
}

CharHooks.register('boomerang', {
    setup() {
        this.maxAmmo = 0; this.ammo = 0;
        this.bmSel = 0; this.bmSSt = 'hand'; this.bmCSt = 'hand'; this.bmSCd = 0; this.bmCCd = 0; this.bmCMiss = false;
        this.bmHold = 0; this.bmPrevS = false; this.bmUsed = false;
        this.bmBuffT = 0; this.bmBuffN = 0; this.bmShieldCd = 0; this.bmCatchFx = 0; this.bmThrowFx = 0; this.bmSwFx = 0;
    },
    update() {
        if (this.id === 1 || !bmIs(p1)) bmTick++;
        if (this.bmBuffT > 0 && --this.bmBuffT <= 0) this.bmBuffN = 0;
        if (this.bmShieldCd > 0) this.bmShieldCd--;
        if (this.bmCatchFx > 0) this.bmCatchFx--;
        if (this.bmThrowFx > 0) this.bmThrowFx--;
        if (this.bmSwFx > 0) this.bmSwFx--;
        if (this.bmSSt === 'cd' && --this.bmSCd <= 0) { this.bmSSt = 'hand'; this.bmSCd = 0; }
        if (this.bmCSt === 'cd' && --this.bmCCd <= 0) { this.bmCSt = 'hand'; this.bmCCd = 0; }
        // an toàn: đang 'fly' mà không còn entity
        if (this.bmSSt === 'fly' && !bodyEffects.some(b => b instanceof BmStraight && b.active && b.team === this.id)) this.bmSSt = 'hand';
        if (this.bmCSt === 'fly' && !bodyEffects.some(b => b instanceof BmCurve && b.active && b.team === this.id)) this.bmCSt = 'hand';
        // làm chậm 35% của Evo 1 trên địch
        const e = bmEnemyOf(this.id);
        if (e && e.bmSlowT > 0) { e.bmSlowT--; if (e.hp > 0) addStatusSlow(e, 0.65); }
    },
    speed(s) { return s * bmBuffMult(this); },
    shoot(inp) {
        const s = !!inp.s, pressed = s && !this.bmPrevS, released = !s && this.bmPrevS;
        this.bmPrevS = s;
        if (pressed) { this.bmHold = 0; this.bmUsed = false; }
        if (s) {
            this.bmHold++;
            if (!this.bmUsed && this.bmHold >= bmSwitchN(this)) {
                this.bmUsed = true; this.bmSel = 1 - (this.bmSel || 0); this.bmSwFx = 16;
                bmTxt(this, this.bmSel ? 'NGUYỆT LUÂN' : 'TRỌNG LUÂN', this.bmSel ? BM_CYAN : BM_GREEN, 10);
            }
        } else if (released) {
            if (!this.bmUsed) {
                const i = this.bmSel || 0;
                if (bmInHand(this, i)) bmThrow(this, i);
                else { const cd = i === 0 ? (this.bmSSt === 'cd' ? this.bmSCd : 0) : (this.bmCSt === 'cd' ? this.bmCCd : 0);
                    bmTxt(this, cd > 0 ? 'HỒI ' + Math.ceil(cd / 60) + 's' : 'ĐANG BAY · GIỮ ĐỂ ĐỔI', '#94a3b8', 9); }
            }
            this.bmHold = 0;
        }
        return true;
    },
});

// Bot: chạy ra đón chiếc Thẳng đang bay về (x đích hoặc null)
function boomBotCatchX(bot) {
    if (typeof bodyEffects === 'undefined') return null;
    for (const s of bodyEffects) if (s instanceof BmStraight && s.active && s.team === bot.id && (s.st === 'ret' || (s.st === 'spin' && s.spinT > s.spinMax - 50))) return s.x;
    for (const c of bodyEffects) if (c instanceof BmCurve && c.active && c.team === bot.id && c.th > Math.PI * 1.1) return c.x0; // về đỉnh ném để bắt Nguyệt Luân
    return null;
}
// Bot: chiếc đang chọn không trên tay mà chiếc kia có -> giữ để đổi
function boomBotWantsSwitch(bot) { const i = bot.bmSel || 0; return !bmInHand(bot, i) && bmInHand(bot, 1 - i); }

// Kết liễu
(function () {
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        const before = this.hp;
        const r = origTD.apply(this, arguments);
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && bmIs(attacker)
            && typeof bodyEffects !== 'undefined' && !bodyEffects.some(e => e instanceof BmFinisher)) {
            bodyEffects.push(new BmFinisher(attacker, this));
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, BM_GREEN, 24);
        }
        return r;
    };
})();
