// ==========================================
// Kusarigama (kusarigama) — "Nếm máu... có vị gì nhỉ?" (docs/BODY_MOI_3.md #73)
// ------------------------------------------
// Không đạn: vũ khí xích liêm. Nhấp: ra đòn theo Phong Cách; giữ 0.5s (Evo1 0.3s): đổi Phong Cách.
// HÚT MÁU 25% (Evo1 50% / Evo2 50% / Full 100%) mọi st vũ khí & Chảy Máu (0.2 HP/s 3s, Evo1 cộng 3 tầng + chậm 20%).
// TÍCH LŨY SÁT Ý 0 -> 5 tầng (+2/s khi không ra đòn; Evo1 nhanh 40%): dame x1.0 -> x3.0 (Evo1 x3.5), ra đòn về 0.
// TRẢM: liềm bay đi (không st) chạm biên rồi giật về chém 1.0x; địch đang Chảy Máu -> x2, kéo giật, hút máu x2. Hồi 0.6s.
// KHÓA: tạ xích tạo LỐC MÁU r 55->110 tối đa 3s: chậm 35%, 0.5x mỗi 0.25s; nhấp lại thu xích nổ 1.0x. Hồi 1.2s.
// LINH: lướt lên (vẫn ăn đạn) -> dừng khi chạm địch / vật cản / hết tầm -> Vòng Cảnh Báo 1s r 75->140 -> xoay 360°
//   hút mạnh, choáng 1s, tổng 4.0x, rồi bật về làn. Hồi 2.5s.
// CUỒNG HUYẾT (1 lần / hiệp, khi máu chạm 1.0): chặn ở 1 HP, giải khống chế, bất tử 3s; máu khoá (không hồi),
//   hút máu & mọi nguồn hồi -> Giáp Trắng (gearWhiteShield dùng chung) x1.25, tụt 0.2/s; tích lũy x2, +15% tốc, chiêu mạnh hơn.
// Juggernaut (miễn khống chế): không bị kéo / choáng / chậm.
// Trạng thái là trường thuần trên player / entity trong bodyEffects (đồng bộ online).
// ==========================================

const KG_RED = '#ef4444', KG_CRIM = '#991b1b', KG_STEEL = '#e2e8f0', KG_GOLD = '#fbbf24', KG_WS = '#f1f5f9';
const KG_STYLES = ['TRẢM', 'KHÓA', 'LINH'], KG_ICONS = ['⚔', '⛓', '🌀'];
const KG_CDS = [36, 72, 150];

function kgE1(p) { return p.hasUpgrade('evo_kusa_1'); }
function kgE2(p) { return p.hasUpgrade('evo_kusa_2'); }
function kgFull(p) { return hasFullEvo(p, 'kusarigama'); } // cần thêm thẻ FULL EVO (FULL_EVO_GATE)
function kgIs(p) { return !!p && p.weapon === 'kusarigama'; }
function kgEnemy(p) { return p === p1 ? p2 : p1; }
function kgTeam(id) { return id === 1 ? p1 : p2; }
function kgDir(p) { return p.id === 1 ? -1 : 1; }
function kgAlive(t) { return t && t.hp > 0; }
function kgSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function kgTxt(o, s, c, sz) { addFloatingText(o.x + o.w / 2, o.y + (o.id === 1 ? -18 : o.h + 22), s, c, sz || 12); }
function kgImmune(e) { return e && e.weapon === 'juggernaut'; }
function kgCx(o) { return o.x + o.w / 2; }
function kgCy(o) { return o.y + o.h / 2; }
function kgHoldN(p) { return kgE1(p) ? 18 : 30; }
function kgLs(p) { return kgFull(p) ? 1.0 : ((kgE1(p) || kgE2(p)) ? 0.5 : 0.25); }
function kgEff(p) { return kgE2(p) ? 1.5 : 1.25; }
function kgMaxMult(p) { return (kgFull(p) && p.kgBers) ? 4.0 : (kgE1(p) ? 3.5 : 3.0); }
function kgMult(p) { return 1 + (kgMaxMult(p) - 1) * Math.min(5, p.kgStk || 0) / 5; }
function kgRate(p) { return (kgE1(p) ? 5 / 1.5 : 2) * (p.kgBers ? 2 : 1) / 60; }
function kgMine(p, C) { return bodyEffects.filter(o => o instanceof C && o.active && o.team === p.id); }
function kgBusy(p) { return p.kgMode !== 'idle' || kgMine(p, KgSickle).length > 0 || kgMine(p, KgVortex).length > 0; }
function kgPull(e, tx, max) {
    if (kgImmune(e) || !kgAlive(e)) return;
    const d = tx - kgCx(e);
    e.x = Math.max(0, Math.min(canvas.width - e.w, e.x + Math.sign(d) * Math.min(max, Math.abs(d))));
}
function kgStun(e, t) { if (!kgImmune(e) && kgAlive(e)) e.freezeTimer = Math.max(e.freezeTimer || 0, t); }
function kgSegRect(ax, ay, bx, by, o, pad) {
    const x0 = o.x - pad, y0 = o.y - pad, x1 = o.x + (o.w || 6) + pad, y1 = o.y + (o.h || 6) + pad;
    let t0 = 0, t1 = 1; const dx = bx - ax, dy = by - ay;
    const P = [-dx, dx, -dy, dy], Q = [ax - x0, x1 - ax, ay - y0, y1 - ay];
    for (let i = 0; i < 4; i++) {
        if (P[i] === 0) { if (Q[i] < 0) return false; continue; }
        const r = Q[i] / P[i];
        if (P[i] < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; }
    }
    return true;
}
function kgInR(x, y, r, o) {
    const nx = Math.max(o.x, Math.min(o.x + o.w, x)), ny = Math.max(o.y, Math.min(o.y + o.h, y));
    return Math.hypot(x - nx, y - ny) <= r;
}
function kgBreakCrates(p, x, y, r) {
    if (typeof crates === 'undefined') return false;
    let hit = false;
    for (const c of crates) if (c.active && kgInR(x, y, r, c)) { c.active = false; crateOnBreak(c, p); grantCrateLoot(c, p); hit = true; }
    return hit;
}

// ---------- Hút Máu / Giáp Trắng ----------
function kgSteal(p, dealt) {
    if (!(dealt > 0) || !kgAlive(p)) return;
    const amt = dealt * kgLs(p);
    if (p.kgBers) { kgAddWS(p, amt * kgEff(p)); return; }
    const heal = Math.min(Math.max(0, p.maxHp - p.hp), amt);
    p.hp += heal; p.kgLsAcc = (p.kgLsAcc || 0) + heal;
    if (kgFull(p) && amt > heal) kgAddWS(p, (amt - heal) * 0.5);
}
function kgAddWS(p, v) {
    if (!(v > 0)) return;
    p.gearWhiteShield = (p.gearWhiteShield || 0) + v; p.kgWsAcc = (p.kgWsAcc || 0) + v; p.kgWsFx = 12;
}
// Gây st + Chảy Máu + Hút Máu theo lượng st thực (máu + Giáp Trắng mất)
function kgHit(p, e, amt, o) {
    o = o || {};
    if (!kgAlive(e) || gameState.phase !== 'playing') return 0;
    const hp0 = e.hp, ws0 = e.gearWhiteShield || 0;
    e.takeDamage(amt, p, o.opt || {});
    const dealt = Math.max(0, hp0 - e.hp) + Math.max(0, ws0 - (e.gearWhiteShield || 0));
    if (o.bleed !== false && kgAlive(e)) kgBleed(p, e);
    kgSteal(p, dealt * (o.ls || 1));
    return dealt;
}
function kgBleed(p, e) {
    e.kgBlS = kgE1(p) ? Math.min(3, (e.kgBlT > 0 ? (e.kgBlS || 0) : 0) + 1) : 1;
    e.kgBlT = 180; e.kgBlBy = p.id;
}
function kgClearVictim(e) { if (e) { e.kgBlS = 0; e.kgBlT = 0; e.kgBlBy = 0; } }
function kgSpend(p) { p.kgStk = (kgFull(p) && p.kgBers) ? 2 : 0; }

// ---------- Entity: Lưỡi Liềm (Trảm) ----------
class KgSickle {
    constructor(team, x, y, vx, vy, dmg, bers, lead) {
        this.team = team; this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.dmg = dmg; this.bers = !!bers;
        this.lead = !!lead; this.mode = 'out'; this.t = 0; this.ang = 0; this.hitOut = false; this.hitBack = false; this.active = true;
    }
    update() {
        const own = kgTeam(this.team), e = own ? kgEnemy(own) : null;
        if (!own || !kgIs(own) || !kgAlive(own) || gameState.phase !== 'playing') { this.active = false; return; }
        this.t++; this.ang += 0.55;
        const px = this.x, py = this.y;
        if (this.mode === 'out') {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 8 || this.x > canvas.width - 8) { this.vx = -this.vx; this.x = Math.max(8, Math.min(canvas.width - 8, this.x)); }
            if (this.bers && !this.hitOut && kgAlive(e) && kgSegRect(px, py, this.x, this.y, e, 6)) {
                this.hitOut = true; kgHit(own, e, this.dmg * 0.5, {});
                spawnSparkParticles(kgCx(e), kgCy(e), KG_RED, 6);
            }
            kgBreakCrates(own, this.x, this.y, 8);
            if (this.y < 4 || this.y > canvas.height - 4 || this.t > 70) {
                this.y = Math.max(4, Math.min(canvas.height - 4, this.y)); this.mode = 'back'; this.t = 0;
                spawnSparkParticles(this.x, this.y, KG_STEEL, 5); kgSfx('playHit');
            }
        } else {
            const tx = kgCx(own), ty = kgCy(own), dx = tx - this.x, dy = ty - this.y, L = Math.hypot(dx, dy), sp = 22;
            this.x += L > 0 ? dx / L * Math.min(sp, L) : 0; this.y += L > 0 ? dy / L * Math.min(sp, L) : 0;
            if (!this.hitBack && kgAlive(e) && kgSegRect(px, py, this.x, this.y, e, 7)) { this.hitBack = true; kgSickleHit(own, e, this); }
            kgBreakCrates(own, this.x, this.y, 8);
            if (L <= sp + 1 || this.t > 60) {
                this.active = false;
                if (kgMine(own, KgSickle).length === 0) own.kgCds[0] = KG_CDS[0];
            }
        }
    }
    draw() { if (typeof kgDrawSickle === 'function') kgDrawSickle(this); }
}
function kgSickleHit(p, e, s) {
    const bleeding = e.kgBlT > 0;
    const x2 = bleeding || s.bers;
    kgHit(p, e, s.dmg * (x2 ? 2 : 1), { ls: bleeding ? 2 : 1 });
    if (bleeding) kgPull(e, kgCx(p), 26);
    spawnSparkParticles(kgCx(e), kgCy(e), x2 ? KG_RED : KG_STEEL, x2 ? 12 : 6);
    if (x2) addFloatingText(kgCx(e), e.y + (e.id === 1 ? -26 : e.h + 30), 'XÉ VẾT THƯƠNG!', KG_RED, 12);
    if (s.bers) bodyEffects.push(new KgPool(p.id, kgCx(e), kgCy(e)));
    triggerScreenShake(x2 ? 4 : 2, 6);
    kgSfx('playHit');
}

// ---------- Entity: Vệt Máu (Trảm Cuồng Huyết) — đứng trong bị làm mới Chảy Máu ----------
class KgPool {
    constructor(team, x, y) { this.team = team; this.x = x; this.y = y; this.r = 20; this.life = 240; this.maxLife = 240; this.active = true; this.seed = Math.round(Math.random() * 600) / 100; }
    update() {
        const own = kgTeam(this.team), e = own ? kgEnemy(own) : null;
        if (!own || !kgIs(own) || --this.life <= 0) { this.active = false; return; }
        if (kgAlive(e) && this.life % 20 === 0 && kgInR(this.x, this.y, this.r, e)) kgBleed(own, e);
    }
    draw() { if (typeof kgDrawPool === 'function') kgDrawPool(this); }
}

// ---------- Entity: Tạ Xích -> Lốc Máu (Khóa) ----------
class KgVortex {
    constructor(team, x, y, ty, r, dmg, bers) {
        this.team = team; this.x = x; this.y = y; this.ty = ty; this.r = r; this.dmg = dmg; this.bers = !!bers;
        this.mode = 'fly'; this.t = 0; this.life = 180; this.blast = 0; this.active = true;
    }
    update() {
        const own = kgTeam(this.team), e = own ? kgEnemy(own) : null;
        if (!own || !kgIs(own) || !kgAlive(own) || gameState.phase !== 'playing') { this.active = false; return; }
        this.t++;
        if (this.blast > 0) this.blast--;
        if (this.mode === 'fly') {
            const d = this.ty - this.y;
            this.y += Math.sign(d) * Math.min(14, Math.abs(d));
            kgBreakCrates(own, this.x, this.y, 8);
            if (Math.abs(d) <= 14 || this.t > 60) { this.mode = 'spin'; this.t = 0; spawnSparkParticles(this.x, this.y, KG_RED, 10); }
        } else if (this.mode === 'spin') {
            if (kgAlive(e)) {
                if (this.bers) {
                    const d = kgCx(e) - this.x; this.x += Math.sign(d) * Math.min(1.3, Math.abs(d));
                }
                if (kgInR(this.x, this.y, this.r, e)) {
                    if (!kgImmune(e)) addStatusSlow(e, 0.65);
                    if (this.bers) kgPull(e, this.x, 0.8);
                    if (this.t % 15 === 0) kgHit(own, e, this.dmg * 0.5, { ls: this.bers ? 1.2 : 1 });
                }
            }
            if (this.t % 20 === 0) kgBreakCrates(own, this.x, this.y, this.r * 0.6);
            if (this.t >= this.life) kgRecall(own, this);
        } else {
            const tx = kgCx(own), ty = kgCy(own), dx = tx - this.x, dy = ty - this.y, L = Math.hypot(dx, dy), sp = 20;
            this.x += L > 0 ? dx / L * Math.min(sp, L) : 0; this.y += L > 0 ? dy / L * Math.min(sp, L) : 0;
            if (L <= sp + 1 || this.t > 60) { this.active = false; own.kgCds[1] = KG_CDS[1]; }
        }
    }
    draw() { if (typeof kgDrawVortex === 'function') kgDrawVortex(this); }
}
function kgRecall(p, v) {
    if (v.mode !== 'spin') return;
    const e = kgEnemy(p);
    if (kgAlive(e) && kgInR(v.x, v.y, v.r, e)) {
        kgHit(p, e, v.dmg, { ls: v.bers ? 1.2 : 1 });
        if (kgFull(p) && p.kgBers) kgPull(e, kgCx(p), 70);
    }
    explosions.push(new Explosion(v.x, v.y, v.r * 0.7, 'rgba(239, 68, 68,', 0, p));
    spawnSparkParticles(v.x, v.y, KG_RED, 14);
    triggerScreenShake(4, 8);
    kgSfx('playExplosion');
    v.mode = 'ret'; v.t = 0;
}

// ---------- Entity: Kết liễu "HUYẾT LIÊM ĐOẠT MỆNH" ----------
class KgFinisher {
    constructor(owner, victim) {
        this.team = owner.id; this.x = kgCx(victim); this.y = kgCy(victim); this.ox = kgCx(owner); this.oy = kgCy(owner);
        this.vw = victim.w; this.vh = victim.h; this.t = 0; this.dur = 150; this.active = true;
        this.seed = Math.round(Math.random() * 1000) / 100;
    }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { }
    drawOver() { if (typeof kgDrawFinisherOver === 'function') kgDrawFinisherOver(this); }
}
function kgSpawnFinisher(p, v) {
    if (typeof bodyEffects === 'undefined' || bodyEffects.some(e => e instanceof KgFinisher)) return;
    bodyEffects.push(new KgFinisher(p, v));
    triggerScreenShake(12, 22);
    spawnSparkParticles(kgCx(v), kgCy(v), KG_RED, 30);
    kgSfx('playExplosion');
}

// ---------- Ra đòn ----------
function kgTap(p) {
    const vs = kgMine(p, KgVortex).filter(v => v.mode === 'spin');
    if (vs.length) { vs.forEach(v => kgRecall(p, v)); return; }
    if (kgBusy(p)) return;
    const st = p.kgStyle;
    if (p.kgCds[st] > 0) return;
    const m = kgMult(p), dmg = p.damage * m, dir = kgDir(p), cx = kgCx(p);
    const y0 = dir < 0 ? p.y - 4 : p.y + p.h + 4;
    kgSpend(p); p.kgSwing = 12;
    if (st === 0) {
        const sp = 16;
        if (kgFull(p) && p.kgBers) {
            bodyEffects.push(new KgSickle(p.id, cx, y0, -3.2, dir * sp, dmg, true, true));
            bodyEffects.push(new KgSickle(p.id, cx, y0, 3.2, dir * sp, dmg, true, false));
        } else bodyEffects.push(new KgSickle(p.id, cx, y0, 0, dir * sp, dmg, p.kgBers, true));
        kgSfx('playShoot');
    } else if (st === 1) {
        const e = kgEnemy(p);
        const ty = e ? kgCy(e) : (dir < 0 ? 60 : canvas.height - 60);
        let r = 55 + 55 * (m - 1) / (kgMaxMult(p) - 1);
        if (p.kgBers) r *= 1.2;
        bodyEffects.push(new KgVortex(p.id, cx, y0, ty, Math.round(r), dmg, p.kgBers));
        kgSfx('playShoot');
    } else {
        let r = 75 + 65 * (m - 1) / (kgMaxMult(p) - 1);
        if (p.kgBers) r *= 1.2;
        p.kgMode = 'dash'; p.kgModeT = 0; p.kgOrigin = { x: p.x, y: p.y }; p.kgLinhM = dmg; p.kgLinhR = Math.round(r); p.kgLinhHit = false;
        kgTxt(p, 'LINH!', KG_RED, 12);
        kgSfx('playDash');
    }
}
function kgSwitch(p) {
    p.kgStyle = (p.kgStyle + 1) % 3;
    if (!kgE1(p)) p.kgStk = 0;
    p.kgSwitchFx = 20;
    kgTxt(p, KG_ICONS[p.kgStyle] + ' ' + KG_STYLES[p.kgStyle], p.kgStyle === 0 ? KG_STEEL : (p.kgStyle === 1 ? KG_RED : KG_GOLD), 13);
    kgSfx('playPowerup');
}

// ---------- Linh: lướt -> cảnh báo -> xoay -> về làn ----------
function kgBack(p, silent) {
    if (silent || !p.kgOrigin) {
        if (p.kgOrigin) { p.x = Math.max(0, Math.min(canvas.width - p.w, p.kgOrigin.x)); p.y = p.kgOrigin.y; }
        if (p.kgMode !== 'idle') p.kgCds[2] = KG_CDS[2];
        p.kgMode = 'idle'; p.kgOrigin = null; p.kgModeT = 0; return;
    }
    p.kgMode = 'back'; p.kgModeT = 0;
}
function kgLinhStep(p) {
    const e = kgEnemy(p), dir = kgDir(p), o = p.kgOrigin;
    if (!o) { p.kgMode = 'idle'; return; }
    p.kbX = 0; p.kbY = 0;
    if (p.kgMode !== 'back' || p.freezeTimer < 0) p.freezeTimer = 0;
    p.kgModeT++;
    if (p.kgMode === 'dash') {
        p.y += dir * 13;
        let stop = p.kgModeT > 70 || p.y < 0 || p.y > canvas.height - p.h;
        if (kgAlive(e)) {
            const dy = Math.abs(kgCy(p) - kgCy(e));
            if (dy < (e.h + p.h) / 2 + 6) stop = true;
        }
        if (kgBreakCrates(p, kgCx(p), kgCy(p), p.w / 2)) stop = true;
        const mo = typeof movingObstacle !== 'undefined' ? movingObstacle : null;
        if (mo && mo.active !== false && p.x < mo.x + mo.w && p.x + p.w > mo.x && p.y < mo.y + mo.h && p.y + p.h > mo.y) stop = true;
        if (stop) {
            p.y = Math.max(0, Math.min(canvas.height - p.h, p.y));
            if (kgAlive(e) && dir < 0) p.y = Math.max(p.y, e.y + e.h + 2);
            if (kgAlive(e) && dir > 0) p.y = Math.min(p.y, e.y - p.h - 2);
            p.kgMode = 'warn'; p.kgModeT = 0; p.kgWarnN = p.kgBers ? 30 : 60;
        }
    } else if (p.kgMode === 'warn') {
        if (kgE2(p)) kgCleanse(p);
        if (p.kgModeT >= p.kgWarnN) { p.kgMode = 'spin'; p.kgModeT = 0; kgSpinStart(p, e); }
    } else if (p.kgMode === 'spin') {
        if (p.kgModeT % 6 === 1 && p.kgModeT <= 19 && kgAlive(e) && kgInR(kgCx(p), kgCy(p), p.kgLinhR, e)) {
            kgHit(p, e, p.kgLinhM, {});
            if (!p.kgLinhHit) { p.kgLinhHit = true; if (p.kgBers) kgAddWS(p, 0.5); }
            spawnSparkParticles(kgCx(e), kgCy(e), KG_RED, 8);
        }
        if (p.kgModeT >= 24) kgBack(p);
    } else if (p.kgMode === 'back') {
        const dx = o.x - p.x, dy = o.y - p.y, L = Math.hypot(dx, dy), sp = 18;
        if (L <= sp || p.kgModeT > 60) { kgBack(p, true); return; }
        p.x += dx / L * sp; p.y += dy / L * sp;
    } else kgBack(p, true);
}
function kgSpinStart(p, e) {
    const cx = kgCx(p), cy = kgCy(p);
    if (kgAlive(e) && kgInR(cx, cy, p.kgLinhR, e)) { kgPull(e, cx, 200); kgStun(e, 60); }
    kgBreakCrates(p, cx, cy, p.kgLinhR * 0.7);
    if (kgFull(p) && p.kgBers) {
        for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4;
            spawnBullet(p, { x: cx - 4, y: cy - 4, w: 8, h: 8, vx: Math.cos(a) * 9, vy: Math.sin(a) * 9, dmg: p.damage * 1.5, isPiercing: true, hook: 'kusarigama' });
        }
    }
    explosions.push(new Explosion(cx, cy, p.kgLinhR, 'rgba(239, 68, 68,', 0, p));
    triggerScreenShake(6, 10);
    kgSfx('playExplosion');
}
BulletHooks.register('kusarigama', {
    hit(b, o, v) { if (v && v.takeDamage && kgIs(o)) { kgBleed(o, v); kgSteal(o, b.dmg || 0); } },
    draw(b) { if (typeof kgDrawBlade === 'function') kgDrawBlade(b); },
});

// ---------- Cuồng Huyết ----------
function kgCleanse(p) {
    const F = (typeof JG_CC_FIELDS !== 'undefined') ? JG_CC_FIELDS.map(f => f[0]) : ['freezeTimer', 'slowTimer', 'silenceTimer', 'blindTimer'];
    for (const f of F) if (p[f] > 0) p[f] = 0;
    if (p.isFrozen) p.isFrozen = false;
    p.bleedTimer = 0; p.burnTimer = 0; p.acidBurnTimer = 0; p.coldStack = 0; p.bindingCurseStacks = 0;
    if (p.statusSpeedMult !== undefined && p.statusSpeedMult < 1) p.statusSpeedMult = 1;
    p._nextSpeedMult = 1; p.kbX = 0; p.kbY = 0;
}
function kgBerserk(p) {
    if (p.kgBers || !kgIs(p) || gameState.phase !== 'playing') return false;
    p.kgBers = true; p.hp = 1; p.kgHpCap = 1; p.kgInvul = 180; p.kgBersFx = 60;
    kgCleanse(p);
    if (kgE2(p)) kgAddWS(p, 2.0);
    kgTxt(p, 'CUỒNG HUYẾT!', KG_RED, 17);
    explosions.push(new Explosion(kgCx(p), kgCy(p), 60, 'rgba(220, 38, 38,', 0, p));
    spawnSparkParticles(kgCx(p), kgCy(p), KG_RED, 24);
    triggerScreenShake(8, 14);
    kgSfx('playPowerup');
    return true;
}

// ---------- Tick chính ----------
function kgTick(p) {
    for (let i = 0; i < 3; i++) if (p.kgCds[i] > 0) p.kgCds[i]--;
    if (p.kgSwing > 0) p.kgSwing--;
    if (p.kgSwitchFx > 0) p.kgSwitchFx--;
    if (p.kgWsFx > 0) p.kgWsFx--;
    if (p.kgBersFx > 0) p.kgBersFx--;
    if (p.kgInvul > 0) p.kgInvul--;
    if (p.hp <= 0) { if (p.kgMode !== 'idle') kgBack(p, true); return; }
    if (gameState.phase !== 'playing') return;
    if (!p.kgBers && p.hp < 1) kgBerserk(p);
    if (p.kgMode !== 'idle') kgLinhStep(p);
    // Tích Lũy (chỉ nạp khi không ra đòn)
    if (!kgBusy(p) && p.kgStk < 5) p.kgStk = Math.min(5, p.kgStk + kgRate(p));
    // Cuồng Huyết: máu khoá, hồi máu -> Giáp Trắng, Giáp Trắng tụt dần
    if (p.kgBers) {
        if (p.hp > p.kgHpCap + 1e-6) { kgAddWS(p, (p.hp - p.kgHpCap) * kgEff(p)); p.hp = p.kgHpCap; }
        p.kgHpCap = Math.min(p.kgHpCap, p.hp);
        if (p.gearWhiteShield > 0) p.gearWhiteShield = Math.max(0, p.gearWhiteShield - (kgE2(p) ? 0.1 : 0.2) / 60);
    }
    // chữ nổi gộp (hút máu / giáp)
    if (++p.kgTxtT >= 24) {
        p.kgTxtT = 0;
        if (p.kgLsAcc >= 0.05) addFloatingText(kgCx(p) + 14, p.y + (p.id === 1 ? -8 : p.h + 12), '+' + p.kgLsAcc.toFixed(2) + ' 🩸', '#4ade80', 11);
        if (p.kgWsAcc >= 0.05) addFloatingText(kgCx(p) - 14, p.y + (p.id === 1 ? -8 : p.h + 12), '+' + p.kgWsAcc.toFixed(2) + ' GIÁP', KG_WS, 11);
        p.kgLsAcc = 0; p.kgWsAcc = 0;
    }
    // Chảy Máu trên địch
    const e = kgEnemy(p);
    if (kgAlive(e) && e.kgBlT > 0 && e.kgBlBy === p.id) {
        e.kgBlT--;
        if (kgE1(p) && !kgImmune(e)) addStatusSlow(e, 0.8);
        if (e.kgBlT % 15 === 0) kgHit(p, e, 0.05 * Math.max(1, e.kgBlS || 1), { bleed: false, opt: { unavoidable: true, isDot: true } });
        if (e.kgBlT <= 0) e.kgBlS = 0;
    }
}

// Bot: 'tap' | 'hold' | null
function kgBotAction(p, e) {
    if (!kgIs(p) || !kgAlive(e) || p.kgMode !== 'idle') return null;
    const v = kgMine(p, KgVortex).find(o => o.mode === 'spin');
    if (v) return (v.t > 100 || (kgAlive(e) && !kgInR(v.x, v.y, v.r, e) && v.t > 40)) ? 'tap' : null;
    if (kgBusy(p)) return null;
    const dx = Math.abs(kgCx(e) - kgCx(p));
    const want = dx < 60 && (p.kgCds[2] || 0) <= 0 ? 2 : (dx < 90 ? 1 : 0);
    if (p.kgStyle !== want && (kgE1(p) || p.kgStk < 1.5) && Math.random() < 0.05) return 'hold';
    if ((p.kgCds[p.kgStyle] || 0) > 0) return null;
    const ready = p.kgStk >= 4.5 || (p.kgBers && p.kgStk >= 3) || (e.kgBlT > 0 && p.kgStk >= 2.5);
    if (!ready) return null;
    if (p.kgStyle === 0 && dx > 30) return null;
    if (p.kgStyle === 1 && dx > 100) return null;
    if (p.kgStyle === 2 && dx > p.w + 70) return null;
    return 'tap';
}

CharHooks.register('kusarigama', {
    setup() {
        this.kgStyle = 0; this.kgStk = 0; this.kgCds = [0, 0, 0]; this.kgMode = 'idle'; this.kgOrigin = null; this.kgModeT = 0;
        this.kgPrevS = false; this.kgHold = 0; this.kgUsed = false; this.kgSwing = 0; this.kgSwitchFx = 0;
        this.kgBers = false; this.kgHpCap = 99; this.kgInvul = 0; this.kgBersFx = 0; this.kgWsFx = 0;
        this.kgLsAcc = 0; this.kgWsAcc = 0; this.kgTxtT = 0; this.kgLinhM = 0; this.kgLinhR = 75; this.kgWarnN = 60; this.kgLinhHit = false;
        this.maxAmmo = 0; this.ammo = 0;
        kgClearVictim(this); kgClearVictim(kgEnemy(this));
    },
    speed(cur) {
        if (this.kgMode !== 'idle') return 0;
        return this.kgBers ? cur * 1.15 : cur;
    },
    shoot(inp) {
        const s = !!inp.s, rel = !s && this.kgPrevS;
        this.kgPrevS = s;
        if (this.kgMode !== 'idle') { this.kgHold = 0; this.kgUsed = s; return true; }
        if (s) {
            if (this.kgUsed) return true;
            this.kgHold++;
            if (this.kgHold >= kgHoldN(this)) { this.kgUsed = true; this.kgHold = 0; kgSwitch(this); }
        } else {
            if (rel && !this.kgUsed) kgTap(this);
            this.kgHold = 0; this.kgUsed = false;
        }
        return true;
    },
    beforeLethal() {
        if (kgBerserk(this)) return true;
        return false;
    },
    roundEnd() {
        kgBack(this, true);
        this.kgBers = false; this.kgInvul = 0;
        kgClearVictim(kgEnemy(this));
    },
});

// ---------- Bọc update: tick luôn chạy (kể cả khi bị choáng) ----------
(function () {
    const origU = Player.prototype.update;
    Player.prototype.update = function () {
        if (kgIs(this)) { try { kgTick(this); } catch (err) { console.error(err); } }
        return origU.apply(this, arguments);
    };
})();

// ---------- Bọc takeDamage: bất tử Cuồng Huyết, giảm st khi lướt / cảnh báo, ngưỡng 1 HP, kết liễu ----------
(function () {
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        if (kgIs(this) && this.hp > 0) {
            if (this.kgInvul > 0) return 0;
            if (typeof amount === 'number' && amount > 0 &&
                ((this.kgBers && this.kgMode === 'dash') || (kgE2(this) && this.kgMode === 'warn'))) amount *= 0.5;
        }
        const before = this.hp;
        const r = origTD.call(this, amount, attacker, options, ...Array.prototype.slice.call(arguments, 3));
        if (kgIs(this)) {
            if (this.hp > 0 && this.hp < 1 && !this.kgBers) kgBerserk(this);
            if (this.hp <= 0 && this.kgMode !== 'idle') kgBack(this, true);
        }
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && kgIs(attacker)) kgSpawnFinisher(attacker, this);
        return r;
    };
})();
