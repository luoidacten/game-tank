// ==========================================
// Diệp Thanh Phong (diep_thanh_phong) — Vật triệu hồi độc lập trên sân (docs/BODY_MOI_6.md #81)
// Phong Tụ Cầu (DtpOrb), Lốc Nuôi (DtpGrowTornado), Cơn Lốc Lớn (DtpBigTornado),
// Bão / Vùng Cuồng Phong / Ảo Ảnh Gió (DtpStorm), Vòng Cảnh Báo Tự Nuôi (DtpSkyZone), kết liễu (DtpFinisher).
// Mọi trường là dữ liệu thuần (chủ sở hữu lưu bằng team id) -> đồng bộ online qua NET_CLASSES.
// Logic phụ trợ (dtpHit, dtpTeam...) ở logic.js; hình vẽ ở render.js.
// ==========================================

let DTP_UID = 1;
function dtpEnemyLaneCy(owner) {
    const e = dtpEnemy(owner);
    if (e) return dtpLaneY(e) + e.h / 2;
    return owner.id === 1 ? 33 : canvas.height - 35;
}
function dtpPlaying() { return typeof gameState !== 'undefined' && gameState.phase === 'playing'; }

// ---------- Phong Tụ Cầu ----------
class DtpOrb {
    constructor(team, uid, x, y) {
        this.team = team; this.uid = uid; this.x = x; this.y = y; this.r = 9; this.k = 0;
        this.st = 'charge'; this.t = 0; this.vy = 0; this.hit = false; this.reso = false; this.active = true;
    }
    launch() {
        if (this.st !== 'charge') return;
        const o = dtpTeam(this.team);
        this.st = 'fly'; this.t = 0;
        this.vy = dtpDir(o) * (6.2 - 1.6 * this.k); // càng to bay càng đầm chắc
        if (o && o.dtpChUid === this.uid) { o.dtpCh = ''; o.dtpChUid = 0; }
        dtpSfx('playShoot');
    }
    update() {
        const o = dtpTeam(this.team);
        if (!o || !dtpPlaying()) { this.active = false; return; }
        this.t++;
        if (this.st === 'charge') {
            if (o.hp <= 0 || o.dtpChUid !== this.uid) { this.launch(); return; }
            this.k = Math.min(1, o.dtpChT / 240);
            this.r = 9 + 15 * this.k;
            this.x = dtpCx(o);
            this.y = (o.id === 1 ? o.y - 8 : o.y + o.h + 8) + dtpDir(o) * this.r;
            return;
        }
        if (this.reso) this.r = Math.min(54, this.r + 0.6);
        this.y += this.vy;
        const e = dtpEnemy(o);
        if (this.reso) { dtpClearBullets(o, this.x, this.y, this.r * 1.5, true); if (dtpAlive(e) && dtpInR(this.x, this.y, this.r * 1.6, e)) dtpPull(e, this.x, (this.resoM || 1.5) >= 1.5 ? 1.0 : 0.7); }
        if (!this.hit && dtpAlive(e) && dtpInR(this.x, this.y, this.r, e)) {
            this.hit = true;
            dtpHit(o, e, 1.0 + 1.5 * this.k, {}, 0);
            spawnSparkParticles(dtpCx(e), dtpCy(e), DTP_LEAF, 12);
        }
        if (this.y < 10 || this.y > canvas.height - 10) {
            const k = this.k;
            bodyEffects.push(new DtpStorm(this.team, {
                kind: 'gale', x: this.x, y: dtpEnemyLaneCy(o), r: Math.round((52 + 26 * k) * (this.reso ? (this.resoM || 1.5) : 1)),
                dur: Math.round(150 + 150 * k), dot: 0.35, dotI: 30, slow: 0.55, pull: this.reso ? ((this.resoM || 1.5) >= 1.5 ? 0.8 : 0.55) : 0,
            }));
            explosions.push(new Explosion(this.x, dtpEnemyLaneCy(o), 50 + 20 * k, 'rgba(134, 239, 172,', 0, null));
            triggerScreenShake(4, 8);
            dtpSfx('playExplosion');
            this.active = false;
        }
    }
    draw() { if (typeof dtpDrawOrb === 'function') dtpDrawOrb(this); }
}

// ---------- Lốc Nuôi Hộ Thể (Bão Hòa) ----------
class DtpGrowTornado {
    constructor(team, uid, x, y) {
        this.team = team; this.uid = uid; this.x = x; this.y = y; this.gt = 0; this.k = 0; this.r = 12;
        this.st = 'grow'; this.t = 0; this.vx = 0; this.hit = false; this.reso = false; this.active = true; this.ph = Math.random() * 6;
    }
    launch() {
        if (this.st !== 'grow') return;
        const o = dtpTeam(this.team);
        this.st = 'fly'; this.t = 0;
        if (o && o.dtpChUid === this.uid) { o.dtpCh = ''; o.dtpChUid = 0; }
        dtpSfx('playDash');
    }
    update() {
        const o = dtpTeam(this.team);
        if (!o || !dtpPlaying()) { this.active = false; return; }
        this.t++;
        const e = dtpEnemy(o);
        if (this.st === 'grow') {
            if (o.hp <= 0 || o.dtpChUid !== this.uid) { this.launch(); return; }
            this.gt++;
            if (dtpE2(o)) { const n = dtpClearBullets(o, this.x, this.y, this.r + 18, true); if (n) this.gt += 30 * n; }
            this.k = Math.min(1, this.gt / 300);
            this.r = (12 + 22 * this.k) * (this.reso ? (this.resoM || 1.5) : 1);
            return;
        }
        this.r = (12 + 22 * this.k) * (this.reso ? (this.resoM || 1.5) : 1);
        const tx = dtpAlive(e) ? dtpCx(e) : canvas.width / 2;
        this.vx = Math.sin(this.t * 0.13 + this.ph) * 3.2 + Math.max(-2.2, Math.min(2.2, (tx - this.x) * 0.03));
        this.x = Math.max(this.r * 0.5, Math.min(canvas.width - this.r * 0.5, this.x + this.vx));
        this.y += dtpDir(o) * 4.2;
        if (this.reso) { dtpClearBullets(o, this.x, this.y, this.r * 1.5, true); if (dtpAlive(e) && dtpInR(this.x, this.y, this.r * 1.6, e)) dtpPull(e, this.x, (this.resoM || 1.5) >= 1.5 ? 1.0 : 0.7); }
        dtpBreakCrates(o, this.x, this.y, this.r);
        if (!this.hit && dtpAlive(e) && dtpInR(this.x, this.y, this.r, e)) {
            this.hit = true;
            const k = this.k;
            dtpStun(e, Math.round(90 + 90 * k));
            e.dtpLiftT = Math.round(90 + 90 * k);
            dtpHit(o, e, 1.5 + 1.3 * k, {}, 0);
            dtpTxt(e, 'HẤT TUNG!', DTP_TEAL, 13);
            explosions.push(new Explosion(dtpCx(e), dtpCy(e), 40 + 20 * k, 'rgba(45, 212, 191,', 0, null));
            triggerScreenShake(6, 10);
            this.active = false; return;
        }
        if (this.y < -20 || this.y > canvas.height + 20) this.active = false;
    }
    draw() { if (typeof dtpDrawGrowTornado === 'function') dtpDrawGrowTornado(this); }
}

// ---------- Cơn Lốc Lớn (Đại Cuồng Phong — Nhịp 3 Thuận Phong) ----------
class DtpBigTornado {
    constructor(team, x, y, vy) {
        this.team = team; this.x = x; this.y = y; this.vy = vy; this.r = 15; this.dmg = 1.2; this.n = 0;
        this.hit = false; this.t = 0; this.active = true;
    }
    update() {
        const o = dtpTeam(this.team);
        if (!o || !dtpPlaying()) { this.active = false; return; }
        this.t++;
        this.y += this.vy;
        const e = dtpEnemy(o);
        // nuốt đạn thường của địch: +15% kích thước, +0.35 dame mỗi viên
        const n = dtpClearBullets(o, this.x, this.y, this.r + 4, true);
        for (let i = 0; i < n; i++) { this.n++; this.r = Math.min(40, this.r * 1.15); this.dmg += 0.35; }
        // Cộng Hưởng Phong Bạo (Hợp Phong — gốc x1.25, Evo 1 x1.5) với cầu / lốc đang bay / Vòng Cảnh Báo của Nghịch Phong Vũ
        const rm = dtpE1(o) ? 1.5 : 1.25;
        for (const f of bodyEffects) {
            if (!f.active || f.team !== this.team || f.reso) continue;
            const sky = f instanceof DtpSkyZone;
            if (!(sky || (f instanceof DtpOrb && f.st === 'fly') || (f instanceof DtpGrowTornado && f.st === 'fly'))) continue;
            if (Math.hypot(f.x - this.x, f.y - this.y) < f.r + this.r) {
                f.reso = true; f.resoM = rm;
                if (f instanceof DtpOrb) f.r *= rm;
                if (sky) { f.scale *= rm; f.r = dtpSkyR(f.air + f.g) * f.scale; if (dtpAlive(e) && dtpInR(f.x, f.y, f.r * 1.3, e)) dtpPull(e, f.x, 4); }
                addFloatingText(f.x, f.y - 16, 'CỘNG HƯỞNG PHONG BẠO!', DTP_JADE, 13);
                explosions.push(new Explosion(f.x, f.y, f.r * 1.5, 'rgba(52, 211, 153,', 0, null));
                triggerScreenShake(5, 8);
            }
        }
        if (!this.hit && dtpAlive(e) && dtpInR(this.x, this.y, this.r, e)) {
            this.hit = true;
            dtpHit(o, e, this.dmg, {}, 10);
            spawnSparkParticles(dtpCx(e), dtpCy(e), DTP_LEAF, 14);
        }
        if (this.y < 12 || this.y > canvas.height - 12) {
            const cy = dtpEnemyLaneCy(o), sc = this.r / 15;
            bodyEffects.push(new DtpStorm(this.team, { kind: 'bigstorm', x: this.x, y: cy, r: Math.round(48 + 14 * sc), dur: 150, dot: 0.4, dotI: 30, pull: 0.5 }));
            explosions.push(new Explosion(this.x, cy, 50 + 10 * sc, 'rgba(134, 239, 172,', 0, null));
            // Evo 2: bắn trả toàn bộ đạn đã nuốt thành lưỡi gió tự ngắm
            if (dtpE2(o) && this.n > 0 && dtpAlive(e)) {
                const cnt = Math.min(10, this.n);
                for (let i = 0; i < cnt; i++) {
                    const sx = this.x + (i - (cnt - 1) / 2) * 9, sy = cy;
                    const v = aimVelocity(sx, sy, e, 7.5, true);
                    spawnBullet(o, { x: sx - 4, y: sy - 4, w: 8, h: 8, vx: v.vx + (i - (cnt - 1) / 2) * 0.3, vy: v.vy, dmg: 0.4 * dtpDmgMul(o) * o.damage, hook: 'dtp', dtpK: 'blade', dtpHome: true });
                }
                dtpTxt(o, 'PHẢN PHONG x' + cnt + '!', DTP_LEAF, 12);
            }
            triggerScreenShake(5, 10);
            dtpSfx('playExplosion');
            this.active = false;
        }
    }
    draw() { if (typeof dtpDrawBigTornado === 'function') dtpDrawBigTornado(this); }
}

// ---------- Bão / Vùng Cuồng Phong / Múa Quạt / Ảo Ảnh Gió ----------
// o: { kind, x, y, r, dur, dot, dotI, pull, slow, sweeps:[[t,dmg,kb]], phantomAt, pScale, phantom, body }
class DtpStorm {
    constructor(team, o) {
        this.team = team; this.kind = o.kind || 'storm'; this.x = o.x; this.y = o.y; this.r = o.r || 60;
        this.dur = o.dur || 120; this.t = 0; this.dot = o.dot || 0; this.dotI = o.dotI || 30; this.pull = o.pull || 0;
        this.slow = o.slow || 0; this.sweeps = o.sweeps || []; this.phantomAt = o.phantomAt === undefined ? -1 : o.phantomAt;
        this.pScale = o.pScale || 1; this.phantom = !!o.phantom; this.body = !!o.body; this.sw = 0; this.swT = -99;
        this.active = true;
    }
    eff() { return (this.phantomAt >= 0 && this.t >= this.phantomAt) ? this.pScale : 1; }
    update() {
        const o = dtpTeam(this.team);
        if (!o || !dtpPlaying()) { this.active = false; return; }
        this.t++;
        const e = dtpEnemy(o), s = this.eff(), R = this.r * s;
        if (this.phantomAt >= 0 && this.t === this.phantomAt) this.phantom = true;
        if (dtpAlive(e)) {
            const inside = Math.hypot(dtpCx(e) - this.x, dtpCy(e) - this.y) < R + e.w / 2;
            if (inside) {
                if (this.pull > 0) dtpPull(e, this.x, this.pull * s);
                if (this.slow > 0) addStatusSlow(e, 1 - this.slow);
                if (this.dot > 0 && this.t % this.dotI === 0) dtpHit(o, e, this.dot * s, {}, 0);
            }
            for (const sw of this.sweeps) {
                if (sw[0] !== this.t) continue;
                this.swT = this.t; this.sw++;
                explosions.push(new Explosion(this.x, this.y, R * 1.1, 'rgba(52, 211, 153,', 0, null));
                triggerScreenShake(4, 8);
                dtpSfx('playExplosion');
                if (Math.hypot(dtpCx(e) - this.x, dtpCy(e) - this.y) < R * 1.15 + e.w / 2) {
                    dtpHit(o, e, sw[1] * s, {}, 0);
                    if (sw[2] && dtpCC(e)) e.kbX = (dtpCx(e) >= this.x ? 1 : -1) * sw[2];
                }
                dtpBreakCrates(o, this.x, this.y, R);
            }
        }
        if (this.t >= this.dur) this.active = false;
    }
    draw() { if (typeof dtpDrawStorm === 'function') dtpDrawStorm(this); }
}

// ---------- Vòng Cảnh Báo Tự Nuôi (Cửu Thiên để lại khi giữ 0.5s trên không) ----------
class DtpSkyZone {
    constructor(team, x, y, air, grow, scale) {
        this.team = team; this.x = x; this.y = y; this.air = air; this.g = 0; this.grow = grow; this.scale = scale;
        this.r = dtpSkyR(air) * scale; this.active = true;
    }
    update() {
        const o = dtpTeam(this.team);
        if (!o || !dtpPlaying()) { this.active = false; return; }
        this.g++;
        const T = this.air + this.g;
        this.r = dtpSkyR(T) * this.scale;
        const e = dtpEnemy(o);
        if (T >= 120 && dtpAlive(e) && dtpInR(this.x, this.y, this.r, e)) dtpPull(e, this.x, 0.5 * this.scale);
        if (this.g >= this.grow) {
            dtpSpawnLanding(o, this.x, this.y, T, this.scale, true);
            this.active = false;
        }
    }
    draw() { if (typeof dtpDrawSkyZone === 'function') dtpDrawSkyZone(this); }
}

// ---------- Kết liễu PHONG THẦN TUYỆT TỨC ----------
class DtpFinisher {
    constructor(owner, victim) {
        this.team = owner.id; this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.ox = owner.x + owner.w / 2; this.oy = owner.y + owner.h / 2; this.vw = victim.w; this.vh = victim.h;
        this.t = 0; this.dur = 180; this.active = true; this.boom = false; this.seed = Math.floor(Math.random() * 1000);
    }
    update() {
        this.t++;
        if (this.t === 132 && !this.boom) {
            this.boom = true;
            explosions.push(new Explosion(this.x, Math.max(30, this.y - 120), 80, 'rgba(52, 211, 153,', 0, null));
            spawnSparkParticles(this.x, Math.max(30, this.y - 120), DTP_JADE, 30);
            spawnSparkParticles(this.x, Math.max(30, this.y - 120), '#d6d3d1', 22);
            triggerScreenShake(14, 22);
            dtpSfx('playExplosion');
        }
        if (this.t % 20 === 0 && this.t < 120) dtpSfx('playDash');
        if (this.t >= this.dur) this.active = false;
    }
    draw() { if (typeof dtpDrawFinisherUnder === 'function') dtpDrawFinisherUnder(this); }
    drawOver() { if (typeof dtpDrawFinisherOver === 'function') dtpDrawFinisherOver(this); }
}
