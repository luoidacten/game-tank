// ==========================================
// Tia Lazer (lazer_beam) — Logic: giữ nút để chiếu tia liên tục
// ------------------------------------------
// Giữ Bắn: tích tụ 0.5s (Evo1: 0.125s) -> đường cảnh báo 0.5s -> tia chiếu liên tục.
// Sát thương: 0.2 mỗi "tick sát thương" (1 tick = 10 khung = 6 lần/giây -> 1.2 dmg/s gốc).
// Đang chiếu: tụt Năng Lượng, xe chậm lại (Full Evo: không chậm). Nhả nút / cạn NL -> tia chớp tắt rồi tắt.
// Sau 0.5s không tiêu hao, NL tự hồi. Evo2: tia phình rộng dần + sát thương tăng tiến + Thiêu Đốt.
// Full Evo: mỗi 2s chiếu liên tục phóng thêm 1 Tia Bùng Nổ dọc luồng tia chính.
// Toàn bộ trạng thái là số trên player -> đồng bộ online.
// ==========================================

const LB_CHARGE = 30, LB_CHARGE_E1 = 8;   // tick tích tụ
const LB_WARN = 30;                       // tick đường cảnh báo
const LB_FLICKER = 14;                    // tick chớp tắt
const LB_DMG_EVERY = 10;                  // khung / tick sát thương
const LB_REGEN_DELAY = 30;                // 0.5s
const LB_BURST_EVERY = 120;               // Full Evo: 2s
const LB_COLOR = '#ff2bd6', LB_CORE = '#ffe6fb';

function lbE1(p) { return p.hasUpgrade('evo_beam_1'); }
function lbE2(p) { return p.hasUpgrade('evo_beam_2'); }
function lbFull(p) { return lbE1(p) && lbE2(p); }
function lbEnemy(p) { return p === p1 ? p2 : p1; }
function lbNozzle(p) {
    const dirY = p.id === 1 ? -1 : 1;
    return { x: p.x + p.w / 2, y: dirY < 0 ? p.y - 2 : p.y + p.h + 2, dirY };
}
// Bề ngang nửa tia (Evo2: phình dần theo thời gian chiếu, tối đa sau 2.5s)
function lbHalfW(p) {
    const base = 3.5;
    if (!lbE2(p)) return base;
    return base + 9 * Math.min(1, (p.lbFireT || 0) / 150);
}

// Tìm vật cản gần nhất trên đường tia. Trả về { y, obj, kind } (y = điểm dừng tia)
function lbTrace(p) {
    const n = lbNozzle(p), hw = lbHalfW(p), dir = n.dirY;
    let best = { y: dir < 0 ? 0 : canvas.height, obj: null, kind: 'edge' };
    let bestD = Math.abs(best.y - n.y);
    const consider = (o, kind) => {
        if (!o || o.active === false || typeof o.x !== 'number' || !o.w) return;
        if (n.x + hw < o.x || n.x - hw > o.x + o.w) return;
        const near = dir < 0 ? o.y + o.h : o.y;
        const far = dir < 0 ? o.y : o.y + o.h;
        if ((far - n.y) * dir < 0) return;          // sau lưng
        const d = Math.max(0, (near - n.y) * dir);
        if (d < bestD) { bestD = d; best = { y: n.y + dir * d, obj: o, kind }; }
    };
    if (typeof sniperWalls !== 'undefined') sniperWalls.forEach(w => { if (w.owner !== p) consider(w, 'wall'); });
    if (typeof movingObstacle !== 'undefined' && movingObstacle && movingObstacle.active) consider(movingObstacle, 'moving');
    if (typeof bastions !== 'undefined') bastions.forEach(b => { if (b.owner !== p) consider(b, 'bastion'); });
    moneyTrucks.forEach(t => consider(t, 'truck'));
    crates.forEach(c => consider(c, 'crate'));
    bodyEffects.forEach(s => { if (s.isStone && s.owner !== p) consider(s, 'stone'); });
    const e = lbEnemy(p);
    if (e && e.creatorShield && e.creatorShield.active) consider(e.creatorShield, 'shield');
    if (e && e.hp > 0 && !e.isInvisible) consider(e, 'enemy');
    return best;
}

// Áp sát thương 1 tick lên vật đầu tiên tia chạm
function lbApplyTick(p, tr) {
    const e = lbEnemy(p);
    const n = lbNozzle(p);
    let dmg = p.damage + (p.dmgBuff || 0) * 0.1;
    if (lbE2(p)) dmg *= 1 + Math.min(1, (p.lbRamp || 0) / 180); // tăng tiến tới x2 sau 3s trúng liên tục
    const o = tr.obj;
    if (tr.kind === 'wall') {
        // Tường Sniper địch chặn tia (dùng helper chung để tường nhận sát thương + tia lửa)
        sniperWallBlockY(p, n.x, n.y, n.dirY, lbHalfW(p), dmg);
    } else if (tr.kind === 'enemy') {
        e.takeDamage(dmg, p, { isDot: true });
        p.lbRamp = (p.lbRamp || 0) + LB_DMG_EVERY;
        if (lbE2(p)) { p.lbBurnT = 120; p.lbBurnAcc = p.lbBurnAcc || 0; }
        spawnSparkParticles(n.x, tr.y, LB_COLOR, 3);
    } else if (tr.kind === 'truck') {
        o.hp -= dmg * 2;
        if (o.hp <= 0 && o.active) {
            o.active = false;
            if (p.id === 1) gameState.p1Coins += 30; else gameState.p2Coins += 30;
            addFloatingText(o.x + o.w / 2, o.y - 8, '+30$', '#ffd700', 12);
            explosions.push(new Explosion(o.x + o.w / 2, o.y + o.h / 2, 40, 'gold', 0, p));
        }
    } else if (tr.kind === 'crate') {
        o.lbHeat = (o.lbHeat || 0) + dmg;
        if (o.lbHeat >= 0.4) { o.active = false; crateOnBreak(o, p); grantCrateLoot(o, p); explosions.push(new Explosion(o.x + o.w / 2, o.y + o.h / 2, 26, 'white', 0, p)); }
    } else if (tr.kind === 'bastion' || tr.kind === 'stone' || tr.kind === 'shield') {
        if (typeof o.takeDamage === 'function') o.takeDamage(dmg, p);
        else if (typeof o.hp === 'number' && !o.isImmortal) { o.hp -= dmg; if (o.hp <= 0) o.active = false; }
    }
    if (tr.kind !== 'enemy') p.lbRamp = Math.max(0, (p.lbRamp || 0) - LB_DMG_EVERY * 2);
}

// Full Evo: Tia Bùng Nổ dọc luồng tia chính
function lbBurst(p) {
    const n = lbNozzle(p), e = lbEnemy(p);
    const hw = lbHalfW(p) + 8;
    const sw = sniperWallBlockY(p, n.x, n.y, n.dirY, hw, 2);
    let stop = n.dirY < 0 ? 0 : canvas.height;
    if (sw) stop = sniperWallStopY(sw, n.dirY);
    else if (e && e.hp > 0 && n.x + hw > e.x && n.x - hw < e.x + e.w && ((e.y + e.h / 2) - n.y) * n.dirY > 0) {
        e.takeDamage(1.5 + (p.dmgBuff || 0) * 0.5, p);
        explosions.push(new Explosion(n.x, e.y + e.h / 2, 46, 'rgba(255, 60, 220,', 0, p));
        stop = e.y + e.h / 2;
    }
    p.lbBurstFx = 16; p.lbBurstStop = stop;
    triggerScreenShake(5, 8);
    if (soundSystem && !soundSystem.muted) soundSystem.playLaser();
}

function lbStop(p, flicker) {
    if (p.lbPhase === 3 && flicker) { p.lbPhase = 4; p.lbT = 0; }
    else if (p.lbPhase !== 4) { p.lbPhase = 0; p.lbT = 0; }
    p.lbFireT = 0;
}

CharHooks.register('lazer_beam', {
    setup() {
        this.maxAmmo = 0; this.ammo = 0;
        this.lbEnergy = 100; this.lbPhase = 0; this.lbT = 0; this.lbFireT = 0;
        this.lbRegenDelay = 0; this.lbRamp = 0; this.lbBurstT = 0; this.lbBurstFx = 0;
        this.lbBurnT = 0; this.lbBurnAcc = 0; this.lbEndY = null; this.lbLock = false;
    },

    update(inp, eff) {
        const e1 = lbE1(this);
        const held = !!(eff && eff.s) && !(this.freezeTimer > 0);
        if (this.lbBurstFx > 0) this.lbBurstFx--;
        // Thiêu Đốt (Evo2): 0.25 dmg/s trong 2s sau khi trúng tia
        const enemy = lbEnemy(this);
        if (this.lbBurnT > 0 && enemy && enemy.hp > 0) {
            this.lbBurnT--;
            this.lbBurnAcc += 0.25 / 60;
            if (this.lbBurnAcc >= 0.1) { const d = this.lbBurnAcc; this.lbBurnAcc = 0; enemy.takeDamage(d, this, { isDot: true }); }
        }
        if (this.lbLock && this.lbEnergy >= 25) this.lbLock = false;

        switch (this.lbPhase) {
            case 0: // nghỉ
                if (held && !this.lbLock && this.lbEnergy > 5) { this.lbPhase = 1; this.lbT = 0; }
                break;
            case 1: // tích tụ
                if (!held) { lbStop(this, false); break; }
                if (++this.lbT >= (e1 ? LB_CHARGE_E1 : LB_CHARGE)) { this.lbPhase = 2; this.lbT = 0; }
                break;
            case 2: // cảnh báo
                if (!held) { lbStop(this, false); break; }
                if (++this.lbT >= LB_WARN) {
                    this.lbPhase = 3; this.lbT = 0; this.lbFireT = 0; this.lbBurstT = 0;
                    if (soundSystem && !soundSystem.muted) soundSystem.playLaser();
                }
                break;
            case 3: { // chiếu tia
                if (!held || this.lbEnergy <= 0) {
                    if (this.lbEnergy <= 0) { this.lbLock = true; addFloatingText(this.x + this.w / 2, this.y - 14, '⚡ 0%', '#94a3b8', 12); }
                    lbStop(this, true); break;
                }
                this.lbFireT++;
                this.lbEnergy = Math.max(0, this.lbEnergy - (e1 ? 18 : 25) / 60);
                this.lbRegenDelay = LB_REGEN_DELAY;
                const tr = lbTrace(this);
                this.lbEndY = tr.y;
                if (this.lbFireT % LB_DMG_EVERY === 1) lbApplyTick(this, tr);
                if (lbFull(this) && ++this.lbBurstT >= LB_BURST_EVERY) { this.lbBurstT = 0; lbBurst(this); }
                break;
            }
            case 4: // chớp tắt (không gây sát thương)
                this.lbEndY = lbTrace(this).y;
                if (++this.lbT >= LB_FLICKER) { this.lbPhase = 0; this.lbT = 0; }
                break;
        }
        if (this.lbPhase !== 3) {
            this.lbRamp = Math.max(0, (this.lbRamp || 0) - 2);
            if (this.lbRegenDelay > 0) this.lbRegenDelay--;
            else this.lbEnergy = Math.min(100, this.lbEnergy + (e1 ? 40 : 25) / 60);
        }
        if (this.lbPhase === 1 || this.lbPhase === 2) this.lbEndY = lbTrace(this).y;
    },

    speed(s) {
        if (this.lbPhase === 3 && !lbFull(this)) return s * 0.5;
        if (this.lbPhase === 1 || this.lbPhase === 2) return s * 0.8;
        return s;
    },

    shoot() { return true; },
    roundEnd() { this.lbPhase = 0; this.lbT = 0; },
});
