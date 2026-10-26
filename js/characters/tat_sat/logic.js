// ==========================================
// Tất Sát (tat_sat) — "Quên ta rồi sao? NHẤT KIẾM TẤT SÁT!"
// ------------------------------------------
// Giữ Bắn tụ lực 0 -> 100% trong 4.5s (Evo 1: 3.5s). Nhả theo mốc:
//   1–49%  : LƯỚT CHÉM CẢNH BÁO — lao lên 14px/tick, chạm vật/biên -> vùng đỏ 0.5s nổ 1x dame, xe giật về.
//   50–85% : PHÂN ẢNH ĐOẠT MỆNH — (slow-motion hình ảnh 0.4s) phân ảnh 18px/tick:
//            2A trúng tướng: ẩn thân 2s (bất tử, không thể bị nhắm), Liên Hoàn Trảm & Chém Nát Màn Hình -> x3 dame.
//            2B trúng thứ khác: 2 vùng đồng tâm (60px choáng 2s sau 0.25s | 110px nổ 1x sau 0.5s).
//   86–100%: NHẤT KIẾM TẤT SÁT — cột cảnh báo 0.35s rồi hitscan (Tường Sniper chặn):
//            trúng -> combo ẩn thân 2s x6 dame | trượt -> lướt vút theo đường kiếm rồi về.
// Full Evo: mốc 3 từ 75%. Mọi trạng thái là trường thuần trên player / entity trong bodyEffects (đồng bộ online).
// ==========================================

const TAT_RED = '#ff2d55', TAT_GOLD = '#fde047', TAT_VIOLET = '#c084fc', TAT_STEEL = '#e2e8f0';

function tatE1(p) { return p.hasUpgrade('evo_ts_1'); }
function tatE2(p) { return p.hasUpgrade('evo_ts_2'); }
function tatFull(p) { return tatE1(p) && tatE2(p); }
function tatEnemy(p) { return p.id === 1 ? p2 : p1; }
function tatTeam(id) { return id === 1 ? p1 : p2; }
function tatDir(p) { return p.id === 1 ? -1 : 1; }
function tatSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function tatMaxT(p) { return tatE1(p) ? 210 : 270; }             // 3.5s / 4.5s
function tatPct(p) { return Math.min(1, (p.tatCharge || 0) / tatMaxT(p)); }
function tatT3(p) { return tatFull(p) ? 75 : 86; }                 // ngưỡng Nhánh 3 (%)
function tatBranch(p, pct) {
    const v = Math.floor(pct * 100 + 1e-6);
    if (v < 1) return 0;
    if (v < 50) return 1;
    return v < tatT3(p) ? 2 : 3;
}
function tatTargetable(e) { return !!e && e.hp > 0 && !(e.weapon === 'storm' && e.stHidden) && !(e.weapon === 'tat_sat' && e.tatHidden) && !(e.weapon === 'ghost' && e.isGhostActive); }
function tatHit(ax, ay, aw, ah, o) { return o && ax < o.x + o.w && ax + aw > o.x && ay < o.y + o.h && ay + ah > o.y; }

// Vật triệu hồi / công trình của phe địch (tường Sniper, ụ súng, robot, lính, đá...)
function tatSummons(team) {
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
    const me = tatTeam(team);
    return L.filter(o => typeof o.x === 'number' && o.w && o.owner !== me && o.player !== me && !(o.owner && o.owner.id === team));
}
function tatHurtObj(o, d, owner) {
    if (!o || d <= 0) return;
    if (typeof o.takeHit === 'function') o.takeHit(d, owner);
    else if (typeof o.takeDamage === 'function') o.takeDamage(d, owner);
    else if (typeof o.hp === 'number') { o.hp -= d; if (o.hp <= 0) o.active = false; }
    if (typeof spawnSparkParticles === 'function') spawnSparkParticles(o.x + o.w / 2, o.y + o.h / 2, TAT_RED, 6);
}
function tatHurtTruck(t, d, p) {
    if (!t.active) return;
    t.hp -= d;
    if (t.hp <= 0) {
        t.active = false;
        let m = 30; if (p.weapon === 'money_tank') m *= 2;
        if (p.id === 1) gameState.p1Coins += m; else gameState.p2Coins += m;
        addFloatingText(t.x + t.w / 2, t.y - 8, `+${m}$ 💰`, '#ffd700', 13);
        explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 60, 'rgba(255,215,0,', 0, p));
    }
}
function tatBreakCrate(c, p) { c.active = false; crateOnBreak(c, p); grantCrateLoot(c, p); }

// Vật đầu tiên chạm hình chữ nhật (x,y,w,h): 'enemy' | 'crate' | 'truck' | 'summon' | null
function tatFirstHit(p, x, y, w, h, passLoot) {
    const e = tatEnemy(p);
    if (tatTargetable(e) && tatHit(x, y, w, h, e)) return { kind: 'enemy', o: e };
    for (const o of tatSummons(p.id)) if (tatHit(x, y, w, h, o)) return { kind: 'summon', o };
    if (!passLoot) {
        if (typeof crates !== 'undefined') for (const c of crates) if (c.active && tatHit(x, y, w, h, c)) return { kind: 'crate', o: c };
        if (typeof moneyTrucks !== 'undefined') for (const t of moneyTrucks) if (t.active && tatHit(x, y, w, h, t)) return { kind: 'truck', o: t };
    }
    if (typeof movingObstacle !== 'undefined' && movingObstacle && movingObstacle.active && tatHit(x, y, w, h, movingObstacle)) return { kind: 'wall', o: movingObstacle };
    return null;
}

// Về vị trí cũ (gọi được ở mọi trạng thái)
function tatReturn(p, silent) {
    const o = p.tatOrigin;
    const fx = p.x + p.w / 2, fy = p.y + p.h / 2;
    p.tatMode = 'idle'; p.tatHidden = false; p.tatModeT = 0;
    if (!o) return;
    p.x = Math.max(0, Math.min(canvas.width - p.w, o.x)); p.y = o.y;
    p.tatOrigin = null;
    if (silent) return;
    p.invincibleTimer = Math.max(p.invincibleTimer || 0, 8);
    if (Math.abs(fy - (p.y + p.h / 2)) > 6 && typeof bodyEffects !== 'undefined') bodyEffects.push(new TatTrail(p.id, fx, fy, p.x + p.w / 2, p.y + p.h / 2));
    if (typeof spawnSparkParticles === 'function') spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, TAT_RED, 8);
    tatSfx('playDash');
}

// Cặp vùng đồng tâm (2B / Full Evo trượt Nhánh 3)
function tatDoubleZone(p, x, y) {
    const pull = tatE2(p);
    bodyEffects.push(new TatZone(p.id, x, y, 42, 24, 'stun', 0, { breakSummon: pull }));
    bodyEffects.push(new TatZone(p.id, x, y, 78, 42, 'dmg', p.damage, { pull }));
}
function tatRefund(p) {
    if (!tatE1(p)) return;
    p.tatCharge = Math.round(tatMaxT(p) * 0.35);
    addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -18 : p.h + 22), 'HOÀN 35% ⚡', TAT_GOLD, 11);
}

// Bắt đầu combo ẩn thân 2s (2A / Nhánh 3 trúng)
function tatStartCombo(p, e, mult, big) {
    if (!e || e.hp <= 0) return;
    p.tatMode = 'combo'; p.tatHidden = true; p.tatModeT = 0;
    p.freezeTimer = 0;
    const pierce = big && tatE2(p);
    bodyEffects.push(new TatCombo(p.id, e.id, p.damage * mult, !!big, pierce));
    addFloatingText(e.x + e.w / 2, e.y + (e.id === 1 ? -18 : e.h + 22), big ? 'NHẤT KIẾM TẤT SÁT!' : 'LIÊN HOÀN TRẢM!', big ? TAT_GOLD : TAT_RED, big ? 16 : 14);
    triggerScreenShake(big ? 8 : 5, 12);
    tatSfx('playPowerup');
}

// ---------- Entity: Vùng cảnh báo đỏ -> chém nổ ----------
// kind 'dmg' (sát thương) | 'stun' (choáng 2s, 0 dame). opts: clear (xóa đạn + chậm 35% 2s), pull (hút vào tâm), breakSummon
class TatZone {
    constructor(team, x, y, r, delay, kind, dmg, opts) {
        opts = opts || {};
        // Vùng tròn: bán kính ~ cùng diện tích với vùng chữ nhật cũ (r*1.3 x r*0.75)
        this.team = team; this.x = x; this.y = y; this.r = r * 1.11;
        this.delay = delay; this.maxDelay = delay; this.kind = kind; this.dmg = dmg;
        this.clear = !!opts.clear; this.pull = !!opts.pull; this.breakSummon = !!opts.breakSummon;
        this.t = 0; this.fired = false; this.slowT = 0; this.active = true;
        const R = this.r;
        if (canvas.height > R * 2) this.y = Math.max(R, Math.min(canvas.height - R, this.y));
        if (canvas.width > R * 2) this.x = Math.max(R, Math.min(canvas.width - R, this.x));
    }
    // tròn: khoảng cách từ tâm tới điểm gần nhất của mục tiêu <= bán kính
    inZone(o) {
        if (!o || typeof o.x !== 'number') return false;
        const w = o.w || 0, h = o.h || 0;
        const nx = Math.max(o.x, Math.min(this.x, o.x + w)), ny = Math.max(o.y, Math.min(this.y, o.y + h));
        return Math.hypot(nx - this.x, ny - this.y) <= this.r;
    }
    update() {
        const o = tatTeam(this.team), e = tatEnemy(o);
        this.t++;
        if (!this.fired) {
            if (this.pull && e && e.hp > 0 && this.inZone(e)) {
                const dx = this.x - (e.x + e.w / 2);
                e.x = Math.max(0, Math.min(canvas.width - e.w, e.x + Math.sign(dx) * Math.min(Math.abs(dx), 1.2)));
            }
            if (this.t >= this.delay) this.fire(o, e);
            return;
        }
        if (this.slowT > 0) { this.slowT--; if (e && e.hp > 0) addStatusSlow(e, 0.65); }
        if (this.t >= this.delay + 22 && this.slowT <= 0) this.active = false;
    }
    fire(o, e) {
        this.fired = true;
        if (!o) return;
        const hitE = e && e.hp > 0 && this.inZone(e);
        if (this.kind === 'stun') {
            if (hitE) {
                const inv = (e.invincibleTimer || 0) > 0;
                if (!inv) { e.freezeTimer = Math.max(e.freezeTimer || 0, 120); addFloatingText(e.x + e.w / 2, e.y - 14, 'CHOÁNG 2s!', TAT_VIOLET, 13); }
            }
            if (this.breakSummon) for (const s of tatSummons(this.team)) if (this.inZone(s)) tatHurtObj(s, 999, o);
        } else {
            if (hitE) {
                e.takeDamage(this.dmg, o);
                if (typeof fxSlashHit === 'function') fxSlashHit(e.x + e.w / 2, e.y + e.h / 2, '#ffffff', 22);
            }
            for (const s of tatSummons(this.team)) if (this.inZone(s)) tatHurtObj(s, this.dmg, o);
            if (typeof moneyTrucks !== 'undefined') for (const t of moneyTrucks) if (t.active && this.inZone(t)) tatHurtTruck(t, this.dmg * 2, o);
            if (typeof crates !== 'undefined') for (const c of crates) if (c.active && this.inZone(c)) tatBreakCrate(c, o);
            if (this.clear && e && e.bullets) {
                for (let i = e.bullets.length - 1; i >= 0; i--) {
                    const b = e.bullets[i];
                    if (b.isLazer || b.isBeam || b.isUltimate) continue;
                    if (Math.hypot(b.x + (b.w || 6) / 2 - this.x, b.y + (b.h || 6) / 2 - this.y) < this.r) { e.bullets.splice(i, 1); spawnSparkParticles(b.x, b.y, '#fecdd3', 3); }
                }
                if (hitE) this.slowT = 120;
            }
        }
        explosions.push(new Explosion(this.x, this.y, this.r * 0.6, this.kind === 'stun' ? 'rgba(192, 132, 252,' : 'rgba(255, 45, 85,', 0, o));
        triggerScreenShake(this.kind === 'stun' ? 4 : 6, 8);
        tatSfx('playExplosion');
    }
    draw() { if (typeof tatDrawZone === 'function') tatDrawZone(this); }
}

// ---------- Entity: Phân Ảnh (Nhánh 2) ----------
class TatPhantom {
    constructor(team, x, y, pass) {
        this.team = team; this.x = x; this.y = y; this.w = 26; this.h = 26;
        this.x0 = x; this.y0 = y; this.vy = (team === 1 ? -1 : 1) * 18;
        this.pass = !!pass; this.phase = 0; this.t = 0; this.active = true;
        this.hx = x; this.hy = y;
    }
    update() {
        const o = tatTeam(this.team);
        this.t++;
        if (!o || o.hp <= 0 || o.tatMode !== 'phantom') { if (this.phase === 0) { this.active = false; return; } }
        if (this.phase === 0) {
            this.y += this.vy;
            const bx = this.x - this.w / 2, by = this.y - this.h / 2;
            let hit = tatFirstHit(o, bx, by, this.w, this.h, this.pass);
            let edge = false;
            if (!hit && (this.y < 14 || this.y > canvas.height - 14)) { edge = true; this.y = Math.max(14, Math.min(canvas.height - 14, this.y)); }
            if (hit || edge) {
                this.phase = 1; this.t = 0; this.hx = this.x; this.hy = this.y;
                o.tatMode = 'idle'; o.tatOrigin = null;
                if (hit && hit.kind === 'enemy') {
                    tatStartCombo(o, hit.o, 3, false);
                } else {
                    tatDoubleZone(o, this.x, this.y);
                    addFloatingText(this.x, this.y - 22, 'PHÂN ẢNH TRẢM!', TAT_RED, 13);
                    tatRefund(o);
                }
            }
            return;
        }
        // phase 1: giật về chỗ chủ thể (hình ảnh)
        const tx = o ? o.x + o.w / 2 : this.x0, ty = o ? o.y + o.h / 2 : this.y0;
        this.x += (tx - this.x) * 0.35; this.y += (ty - this.y) * 0.35;
        if (this.t >= 12) this.active = false;
    }
    draw() { if (typeof tatDrawPhantom === 'function') tatDrawPhantom(this); }
}

// ---------- Entity: Liên Hoàn Trảm & Chém Nát Màn Hình (2s) ----------
class TatCombo {
    constructor(team, targetId, dmg, big, pierce) {
        this.team = team; this.tid = targetId; this.dmg = dmg; this.big = big; this.pierce = pierce;
        const e = tatTeam(targetId);
        this.x = e ? e.x + e.w / 2 : canvas.width / 2; this.y = e ? e.y + e.h / 2 : canvas.height / 2;
        this.t = 0; this.dur = 120; this.tail = 34; this.done = false; this.hitOk = false;
        this.seed = Math.round(Math.random() * 1000) / 100; this.active = true;
    }
    update() {
        const o = tatTeam(this.team), e = tatTeam(this.tid);
        this.t++;
        if (!this.done) {
            if (!o || o.hp <= 0 || gameState.phase !== 'playing') { this.finish(o, false); return; }
            if (e && e.hp > 0) {
                this.x = e.x + e.w / 2; this.y = e.y + e.h / 2;
                addStatusSlow(e, 0.15);                                   // khóa nhẹ tại chỗ
                if (this.t % 10 === 0 && typeof spawnSparkParticles === 'function') spawnSparkParticles(this.x, this.y, this.t % 20 ? '#ffffff' : TAT_RED, 4);
                if (this.t % 20 === 0) triggerScreenShake(3, 5);
            }
            if (this.t >= this.dur || !e || e.hp <= 0) this.finish(o, e && e.hp > 0);
            return;
        }
        if (this.t >= this.dur + this.tail) this.active = false;
    }
    finish(o, hit) {
        this.done = true; this.t = Math.max(this.t, this.dur);
        const e = tatTeam(this.tid);
        if (o) {
            o.tatHidden = false; o.tatMode = 'idle'; o.tatModeT = 0;
            o.invincibleTimer = Math.max(o.invincibleTimer || 0, 15);
        }
        if (hit && o && e && e.hp > 0) {
            this.hitOk = true;
            e.takeDamage(this.dmg, o, { unavoidable: true, bypassShield: this.pierce, isPiercing: this.pierce });
            explosions.push(new Explosion(this.x, this.y, this.big ? 90 : 60, 'rgba(255, 45, 85,', 0, o));
            if (typeof fxSlashHit === 'function') { fxSlashHit(this.x, this.y, '#ffffff', 40); fxSlashHit(this.x, this.y, TAT_RED, 30); }
            triggerScreenShake(this.big ? 14 : 9, 16);
            tatSfx('playExplosion');
            if (tatFull(o) && o.hp > 0) {
                o.hp = Math.min(o.maxHp, o.hp + 1);
                addFloatingText(o.x + o.w / 2, o.y + (o.id === 1 ? -16 : o.h + 20), '+1 HP', '#4ade80', 12);
            }
        } else if (o && !hit) this.t = this.dur + this.tail - 6;
    }
    draw() { if (typeof tatDrawCombo === 'function') tatDrawCombo(this); }
    drawOver() { if (typeof tatDrawComboOver === 'function') tatDrawComboOver(this); }
}

// ---------- Entity: vệt lướt (hình ảnh) ----------
class TatTrail {
    constructor(team, x0, y0, x1, y1) {
        this.team = team; this.x0 = x0; this.y0 = y0; this.x1 = x1; this.y1 = y1;
        this.t = 0; this.dur = 16; this.active = true;
    }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof tatDrawTrail === 'function') tatDrawTrail(this); }
}

// ---------- Entity: kết liễu NHẤT KIẾM TẤT SÁT! ----------
class TatFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.t = 0; this.dur = 140; this.active = true;
    }
    update() {
        this.t++;
        if (this.t === 30) { triggerScreenShake(14, 18); explosions.push(new Explosion(this.x, this.y, 70, 'rgba(255, 45, 85,', 0, tatTeam(this.team))); }
        if (this.t >= this.dur) this.active = false;
    }
    draw() { }
    drawOver() { if (typeof tatDrawFinisherOver === 'function') tatDrawFinisherOver(this); }
}

// ---------- Nhánh 3: hitscan ----------
function tatFire3(p) {
    const e = tatEnemy(p), dir = tatDir(p);
    const cx = p.x + p.w / 2, hw = tatE2(p) ? 16 : 12; // [CÂN BẰNG] thu hẹp tia (24/18 -> 16/12)
    const fromY = p.id === 1 ? p.y : p.y + p.h;
    const sw = typeof sniperWallBlockY === 'function' ? sniperWallBlockY(p, cx, fromY, dir, hw, p.damage) : null;
    const stopY = sw ? sniperWallStopY(sw, dir) : (dir < 0 ? 16 : canvas.height - 16);
    // phá thùng / vật trên đường kiếm
    const y0 = Math.min(fromY, stopY), y1 = Math.max(fromY, stopY);
    if (typeof crates !== 'undefined') for (const c of crates) if (c.active && tatHit(cx - hw, y0, hw * 2, y1 - y0, c)) tatBreakCrate(c, p);
    if (typeof moneyTrucks !== 'undefined') for (const t of moneyTrucks) if (t.active && tatHit(cx - hw, y0, hw * 2, y1 - y0, t)) tatHurtTruck(t, p.damage * 2, p);
    const hitE = !sw && tatTargetable(e) && e.x < cx + hw && e.x + e.w > cx - hw;
    p.tatSlashFx = 14; p.tatSlashX = cx; p.tatSlashY0 = fromY; p.tatSlashY1 = hitE ? e.y + e.h / 2 : stopY; p.tatSlashW = hw * 2;
    if (hitE) { tatStartCombo(p, e, 6, true); return; }
    // trượt: lướt vút theo đường kiếm rồi giật về
    p.tatMode = 'sweep'; p.tatModeT = 0; p.tatOrigin = { x: p.x, y: p.y };
    p.tatSweepY = stopY - (dir < 0 ? 0 : p.h);
    p.invincibleTimer = Math.max(p.invincibleTimer || 0, 30);
    if (tatFull(p)) tatDoubleZone(p, cx, stopY - dir * 30);
    tatRefund(p);
    addFloatingText(cx, fromY + dir * 30, 'HỤT...', '#94a3b8', 11);
    tatSfx('playLaser');
}

// ---------- Xuất chiêu khi nhả nút ----------
function tatRelease(p, pct) {
    const br = tatBranch(p, pct);
    p.tatPct = pct;
    if (!br) return;
    p.tatLastBr = br; p.tatBrFx = 30;
    if (br === 1 && groundedBlock(p)) return;
    if (br === 1) {
        p.tatMode = 'dash'; p.tatModeT = 0; p.tatOrigin = { x: p.x, y: p.y };
        tatSfx('playDash');
    } else if (br === 2) {
        p.tatMode = 'phantom'; p.tatModeT = 0; p.tatOrigin = { x: p.x, y: p.y };
        p.tatSlowFx = 24;
        bodyEffects.push(new TatPhantom(p.id, p.x + p.w / 2, p.y + p.h / 2, tatE2(p)));
        tatSfx('playDash');
    } else {
        p.tatMode = 'warn3'; p.tatModeT = 0;
        p.tatSlowFx = 24;
        scheduleHitscan(p, 36, TAT_GOLD, tatE2(p) ? 32 : 24, () => { if (p.tatMode === 'warn3') { p.tatMode = 'idle'; tatFire3(p); } });
        addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -26 : p.h + 30), 'NHẤT KIẾM...', TAT_GOLD, 13);
    }
}

// Lướt chém (Nhánh 1): mỗi tick
function tatDashStep(p) {
    const dir = tatDir(p);
    p.y += 14 * dir;
    let hit = tatFirstHit(p, p.x, p.y, p.w, p.h, false), edge = false;
    if (!hit && (p.y < 0 || p.y > canvas.height - p.h)) { p.y = Math.max(0, Math.min(canvas.height - p.h, p.y)); edge = true; }
    if (++p.tatModeT > 90) edge = true; // an toàn
    if (!hit && !edge) return;
    const pct = Math.min(0.49, p.tatPct || 0);
    const r = 32 + (pct / 0.49) * 36; // [CÂN BẰNG] 45-100 -> 32-68
    let hx = p.x + p.w / 2, hy = p.y + p.h / 2;
    if (hit && hit.o) hy = hit.o.y + hit.o.h / 2;
    bodyEffects.push(new TatZone(p.id, hx, hy, r, 42, 'dmg', p.damage, { clear: tatE2(p) }));
    tatReturn(p);
}

// Bot: tụ tới 3 mốc
function tatBotHoldN(bot) {
    const M = tatMaxT(bot), r = Math.random(), t3 = tatT3(bot) / 100;
    if (r < 0.45) return Math.ceil(M * (0.15 + Math.random() * 0.3));
    if (r < 0.8) return Math.ceil(M * (0.55 + Math.random() * (t3 - 0.6)));
    return M + 2;
}

CharHooks.register('tat_sat', {
    setup() {
        this.maxAmmo = 0; this.ammo = 0;
        if (tatFull(this)) this.maxHp += 1.5;
        this.tatCharge = 0; this.tatPrevS = false; this.tatMode = 'idle'; this.tatHidden = false;
        this.tatOrigin = null; this.tatPct = 0; this.tatModeT = 0; this.tatSlowFx = 0;
        this.tatSlashFx = 0; this.tatBrFx = 0; this.tatLastBr = 0; this.tatSweepY = 0;
    },
    update() {
        if (this.tatSlowFx > 0) {
            this.tatSlowFx--;
            const e = tatEnemy(this); if (e && e.hp > 0) addStatusSlow(e, 0.8); // "slow-motion" nhẹ: chỉ địch chậm 20%
        }
        if (this.tatSlashFx > 0) this.tatSlashFx--;
        if (this.tatBrFx > 0) this.tatBrFx--;
        if (this.tatMode === 'combo') {
            this.freezeTimer = 0;
            if (!bodyEffects.some(e => e instanceof TatCombo && e.active && !e.done && e.team === this.id)) { this.tatHidden = false; this.tatMode = 'idle'; } // an toàn
        } else if (this.tatMode === 'dash') tatDashStep(this);
        else if (this.tatMode === 'sweep') {
            const dir = tatDir(this);
            this.y += 40 * dir;
            if ((dir < 0 && this.y <= this.tatSweepY) || (dir > 0 && this.y >= this.tatSweepY) || ++this.tatModeT > 30) { this.y = this.tatSweepY; tatReturn(this); }
        } else if (this.tatMode === 'phantom') {
            if (++this.tatModeT > 60 || !bodyEffects.some(e => e instanceof TatPhantom && e.active && e.team === this.id)) { this.tatMode = 'idle'; this.tatOrigin = null; }
        } else if (this.tatMode === 'warn3') {
            if (++this.tatModeT > 40) this.tatMode = 'idle'; // an toàn
        }
    },
    speed(s) { return this.tatMode !== 'idle' ? 0 : s; },
    shoot(inp) {
        const s = !!inp.s;
        const released = !s && this.tatPrevS;
        this.tatPrevS = s;
        if (this.tatMode !== 'idle') return true;
        if (s) this.tatCharge = Math.min(tatMaxT(this), (this.tatCharge || 0) + 1);
        else if (released) {
            const pct = tatPct(this);
            this.tatCharge = 0;
            tatRelease(this, pct);
        }
        return true;
    },
    roundEnd() {
        tatReturn(this, true);
        this.tatCharge = 0; this.tatSlowFx = 0;
    },
});

// takeDamage: ẩn thân = Bất Tử & không thể bị nhắm; Evo 1 tụ >= 50% giảm 30% st; chết giữa chiêu -> về chỗ; kết liễu
(function () {
    const orig = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        if (this.weapon === 'tat_sat') {
            if (this.tatHidden) return 0;
            if (tatE1(this) && this.tatMode === 'idle' && tatPct(this) >= 0.5 && amount > 0) amount *= 0.7;
        }
        const before = this.hp;
        const r = orig.call(this, amount, attacker, options, ...Array.prototype.slice.call(arguments, 3));
        if (this.weapon === 'tat_sat' && this.hp <= 0 && (this.tatOrigin || this.tatMode !== 'idle')) tatReturn(this, true);
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && attacker.weapon === 'tat_sat'
            && typeof bodyEffects !== 'undefined' && !bodyEffects.some(e => e instanceof TatFinisher)) {
            bodyEffects.push(new TatFinisher(attacker, this));
            if (typeof spawnSparkParticles === 'function') spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, TAT_RED, 26);
            tatSfx('playExplosion');
        }
        return r;
    };
})();
