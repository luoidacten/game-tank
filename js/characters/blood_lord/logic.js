// ==========================================
// Huyết Ma (blood_lord) — Logic: Bể Máu, Tứ Huyết Thức (Đạn Thường / Huyết Phá /
// Huyết Tiễn / Huyết Cầu), Bóng Ma Màn Đêm, thoát chết & hồi sinh
// "Máu = sức mạnh!"
// ------------------------------------------
// Mọi trạng thái là trường thường trên player (bd*) hoặc thực thể trong bodyEffects
// (BdBatZone, BdLaser, BdOrb — đều có trong NET_CLASSES) -> đồng bộ online được.
// ==========================================

const BD_RED = '#ff1f4b', BD_DEEP = '#9b0a2a', BD_LIGHT = '#ffd0da', BD_VIOLET = '#b14dff';
const BD_NAME = ['ĐẠN MÁU', 'HUYẾT PHÁ', 'HUYẾT TIỄN', 'HUYẾT CẦU'];
const BD_ICON = ['🩸', '🦇', '🗡️', '🔴'];
const BD_AMMO = [1, 2, 3, 1];
const BD_COL = ['#ff2d55', '#ff8c1a', '#ff4fd8', '#ffcf33'];           // màu riêng từng dạng
const BD_RGBA = ['rgba(255, 45, 85,', 'rgba(255, 140, 26,', 'rgba(255, 79, 216,', 'rgba(255, 207, 51,'];
const BD_HOLD_TICKS = 15;   // giữ 0.25s để đổi dạng (mỗi lần giữ chỉ đổi 1 dạng, phải THẢ nút mới đổi tiếp)
const BD_BASE_HP = 3;       // HP gốc (Huyết Tế tính phần Max HP thưởng vượt mức này)
const BD_LAND_LOCK = 30;    // Bóng Ma Màn Đêm: vòng khóa 0.5s trước khi đáp
const BD_HP_FLOOR = 0.5;    // kỹ năng tự trừ máu không làm HP tụt dưới 0.5

function bdEvo1(p) { return p.hasUpgrade('evo_bd_1'); }
function bdEvo2(p) { return p.hasUpgrade('evo_bd_2'); }
function bdFull(p) { return hasFullEvo(p, 'blood_lord'); } // cần thêm thẻ FULL EVO (FULL_EVO_GATE)
function bdPow(p) { return bdFull(p) ? 0.85 : 1; }
const BD_NERF = 1; // hệ số sát thương kỹ năng chung
function bdDmgMult(p) { return bdPow(p) * BD_NERF; }
function bdGainMult(p) { return bdFull(p) ? 1.6 : (bdEvo1(p) ? 1.4 : 1); }
function bdHpCost(p) { return bdFull(p) ? 0.5 : (bdEvo2(p) ? 0.5 : 1); }
function bdCalmNeed(p) { return bdFull(p) ? 300 : (bdEvo2(p) ? 360 : 480); }
function bdRatio(p) { return bdFull(p) ? 2.5 : (bdEvo2(p) ? 2.5 : 3); }
// Đủ máu để dùng kỹ năng tốn máu (sau khi trừ vẫn còn >= 0.5 HP)
function bdHpOk(p) { return p.hp - bdHpCost(p) >= BD_HP_FLOOR - 1e-6; }
function bdPoolMax(p) { return (p.maxHp || 3) * 2; }
function bdDir(p) { return p.id === 1 ? -1 : 1; }
function bdEnemy(p) { return p === p1 ? p2 : p1; }
function bdLaneY(p) { return p.id === 1 ? canvas.height - p.h - 22 : 20; }
function bdSfx(name) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[name]) soundSystem[name](); }
// Hút máu: 10% gốc + Huyết Tế (+5% mỗi 2 Max HP thưởng vượt HP gốc)
function bdBonusHp(p) { return Math.max(0, (p.maxHp || BD_BASE_HP) - BD_BASE_HP); }
function bdLifesteal(p) { return Math.min(0.6, 0.10 + 0.05 * bdBonusHp(p) / 2); }
function bdLeech(p, d, extra = 0) {
    if (!(d > 0) || !p || p.hp <= 0) return;
    const got = bdHeal(p, d * (bdLifesteal(p) + extra));
    p.bdLeechShow = (p.bdLeechShow || 0) + got;
    if (p.bdLeechShow >= 0.15) {
        addFloatingText(p.x + p.w / 2, p.y - 22, `+${p.bdLeechShow.toFixed(2)} HÚT 🩸`, '#ff7a93', 11);
        p.bdLeechShow = 0;
    }
}
// Gây sát thương + hút máu
function bdHit(p, e, dmg, opts, extra) {
    const d = e.takeDamage(dmg, p, opts) || 0;
    if (d > 0) bdLeech(p, d, extra);
    return d;
}
function bdIsBot(p) { return p.id === 2 && typeof botAI !== 'undefined' && botAI.enabled; }

// Mục tiêu "người" của đối phương (kẻ địch + Bản Sao AI của Gemini)
function bdFoes(p) {
    const out = [];
    const e = bdEnemy(p);
    if (e && e.hp > 0) out.push(e);
    if (typeof gmExtraTargets === 'function') gmExtraTargets(p).forEach(t => { if (t && t.hp > 0) out.push(t); });
    return out;
}
// Vật thể có thể va chạm / gây sát thương (không gồm người chơi)
function bdObjects(p) {
    const out = [];
    const add = (o) => {
        if (!o || o.active === false || o === p1 || o === p2) return;
        if (o.owner && o.owner === p) return;
        if (typeof o.x !== 'number' || !o.w || o.isImmortal) return;
        out.push(o);
    };
    crates.forEach(add);
    moneyTrucks.forEach(add);
    [typeof turrets !== 'undefined' ? turrets : null, typeof creatorTurrets !== 'undefined' ? creatorTurrets : null,
        typeof necroMinions !== 'undefined' ? necroMinions : null, typeof creatorDrones !== 'undefined' ? creatorDrones : null,
        typeof creatorRobots !== 'undefined' ? creatorRobots : null, typeof ghostDecoys !== 'undefined' ? ghostDecoys : null,
        typeof sniperWalls !== 'undefined' ? sniperWalls : null, typeof bastions !== 'undefined' ? bastions : null]
        .forEach(list => (list || []).forEach(add));
    bodyEffects.forEach(e => { if (e.isStone) add(e); });
    return out;
}
function bdHitObject(p, o, dmg) {
    if (!o || o.active === false) return;
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    if (o instanceof Crate) {
        o.active = false; crateOnBreak(o, p); grantCrateLoot(o, p);
        spawnSparkParticles(cx, cy, BD_RED, 6);
        return;
    }
    if (dmg <= 0) return;
    if (typeof o.takeDamage === 'function') { o.takeDamage(dmg, p); return; }
    if (typeof o.hp !== 'number') return;
    o.hp -= (o instanceof MoneyTruck) ? dmg * 1.5 : dmg;
    spawnSparkParticles(cx, cy, BD_LIGHT, 3);
    if (o.hp <= 0) {
        o.active = false;
        if (o instanceof MoneyTruck) {
            if (p.id === 1) gameState.p1Coins += 30; else gameState.p2Coins += 30;
            addFloatingText(cx, o.y - 8, '+30$', '#ffd700', 12);
        }
        explosions.push(new Explosion(cx, cy, 34, 'rgba(255, 31, 75,', 0, p));
    }
}

// --- Bể Máu ---
function bdGain(p, amt) {
    if (!(amt > 0) || (p.bdGainLock || 0) > 0) return;
    p.bdPool = Math.min(bdPoolMax(p), (p.bdPool || 0) + amt * bdGainMult(p));
}
// Hồi máu do chính Huyết Ma (không tính vào tích lũy để tránh vòng lặp)
function bdHeal(p, amt, label) {
    const before = p.hp;
    p.hp = Math.min(p.maxHp, p.hp + amt);
    const got = p.hp - before;
    p.bdLastHp = p.hp;
    if (got > 0.01 && label) addFloatingText(p.x + p.w / 2, p.y - 20, `+${got.toFixed(got >= 1 ? 1 : 2)} ${label}`, '#ff7a93', 12);
    return got;
}
// Trả giá máu: không bao giờ tụt dưới 0.5 HP
function bdPayHp(p) {
    const c = bdHpCost(p);
    if (p.hp > BD_HP_FLOOR) p.hp = Math.max(BD_HP_FLOOR, p.hp - c);
    p.bdLastHp = p.hp;
    p.bdCalm = 0;
    addFloatingText(p.x + p.w / 2, p.y - 4, `-${c} 🩸`, BD_DEEP, 10);
}

// Theo dõi biến động máu của mọi mục tiêu trên sân -> nạp Bể Máu
function bdTrack(p) {
    const hp = p.hp;
    if (typeof p.bdLastHp === 'number') {
        const d = hp - p.bdLastHp;
        if (d < -1e-6) { bdGain(p, -d); p.bdCalm = 0; }
        else if (d > 1e-6) bdGain(p, d);
    }
    p.bdLastHp = hp;
    const e = bdEnemy(p);
    if (e) {
        if (typeof p.bdLastEnemyHp === 'number' && e.hp >= 0) {
            const d = e.hp - p.bdLastEnemyHp;
            if (d < -1e-6) bdGain(p, Math.min(4, -d));
            else if (d > 1e-6 && bdFull(p)) bdGain(p, d * 0.5); // Full Evo: kẻ địch hồi máu cũng nạp
        }
        p.bdLastEnemyHp = e.hp;
    }
    // Vật triệu hồi / xe tiền...: lưu máu tick trước ngay trên vật thể (trường số thường)
    const key = '_bdHp' + p.id;
    const scan = (o) => {
        if (!o || o === p1 || o === p2 || typeof o.hp !== 'number') return;
        if (typeof o[key] === 'number' && o.hp < o[key]) bdGain(p, Math.min(1, (o[key] - o.hp) * 0.5));
        o[key] = o.hp;
    };
    moneyTrucks.forEach(scan);
    [typeof turrets !== 'undefined' ? turrets : null, typeof creatorTurrets !== 'undefined' ? creatorTurrets : null,
        typeof necroMinions !== 'undefined' ? necroMinions : null, typeof creatorDrones !== 'undefined' ? creatorDrones : null,
        typeof creatorRobots !== 'undefined' ? creatorRobots : null, typeof sniperWalls !== 'undefined' ? sniperWalls : null,
        typeof bastions !== 'undefined' ? bastions : null]
        .forEach(list => (list || []).forEach(scan));
    if (typeof gmExtraTargets === 'function') gmExtraTargets(p).forEach(scan);
}

// ==========================================
// Thực thể
// ==========================================
// Vùng Bầy Dơi (Huyết Phá) / Đại Tiệc Máu (Bóng Ma Màn Đêm)
class BdBatZone {
    constructor(owner, x, y, r, life, opts = {}) {
        this.owner = owner; this.x = x; this.y = y; this.r = r;
        this.life = life; this.maxLife = life; this.active = true; this.t = 0;
        this.feast = !!opts.feast; this.dmg = opts.dmg || 0.15; this.every = opts.every || 15;
        this.ticksTotal = Math.floor(life / this.every); this.stayHits = 0;
        this.isBdZone = true; this.leechT = 0; this.leechX = x; this.leechY = y;
    }
    // Vùng TRÒN
    contains(t) { return Math.hypot(t.x + t.w / 2 - this.x, t.y + t.h / 2 - this.y) < this.r + Math.min(t.w, t.h) * 0.35; }
    update() {
        if (!this.active) return;
        this.t++;
        const o = this.owner;
        const foes = (o && o.hp > 0) ? bdFoes(o) : [];
        let anyIn = false;
        for (const e of foes) {
            if (!this.contains(e)) continue;
            anyIn = true;
            addStatusSlow(e, this.feast ? 0.45 : 0.55);
            // Bầy dơi hút vào tâm
            const dx = this.x - (e.x + e.w / 2);
            e.x = Math.max(0, Math.min(canvas.width - e.w, e.x + Math.max(-0.9, Math.min(0.9, dx * 0.08))));
        }
        if (this.t % this.every === 0) {
            let hitEnemy = false;
            for (const e of foes) {
                if (!this.contains(e)) continue;
                // Vùng máu: hút thêm +25% (Đại Tiệc +40%) ngoài hút máu gốc
                const d = bdHit(o, e, this.dmg, { isEnvironmental: true }, this.feast ? 0.25 : 0.15);
                if (e === bdEnemy(o)) hitEnemy = true;
                if (d > 0) {
                    if (!this.feast) bdGain(o, d * 2); // "rất nhiều" Bể Máu (Đại Tiệc Máu: chỉ hồi HP)
                    bdHeal(o, this.feast ? 0.06 : 0.04);
                    this.leechT = 14; this.leechX = e.x + e.w / 2; this.leechY = e.y + e.h / 2;
                }
            }
            for (const ob of bdObjects(o)) {
                if (ob instanceof Crate) { if (this.contains(ob)) bdHitObject(o, ob, 0); continue; }
                if (this.contains(ob)) bdHitObject(o, ob, this.dmg);
            }
            if (hitEnemy) this.stayHits++;
            const a = Math.random() * Math.PI * 2, rr = Math.random() * this.r;
            spawnSparkParticles(this.x + Math.cos(a) * rr, this.y + Math.sin(a) * rr, this.feast ? BD_VIOLET : BD_RED, 2);
        }
        if (this.leechT > 0) this.leechT--;
        if (--this.life <= 0) {
            this.active = false;
            // Kẻ địch đứng trong Bầy Dơi đủ 2s -> Huyết Ma hồi 2 HP
            if (!this.feast && o && this.ticksTotal > 0 && this.stayHits >= this.ticksTotal) bdHeal(o, 1.5, 'HUYẾT YẾN 🦇');
        }
        void anyIn;
    }
    draw() { if (typeof bdDrawBatZone === 'function') bdDrawBatZone(this); }
}

// Huyết Tiễn: cảnh báo ngắn rồi tia máu xuyên dọc sân (tường Sniper chặn)
class BdLaser {
    constructor(owner, x, dmg, warn = 24, halfW = 6) {
        this.owner = owner; this.x = x; this.dmg = dmg; this.halfW = halfW;
        this.warn = warn; this.maxWarn = warn; this.flash = 0; this.active = true; this.stopY = null;
        this.fromY = owner.id === 1 ? owner.y : owner.y + owner.h;
    }
    update() {
        if (!this.active) return;
        if (this.warn > 0) { if (--this.warn === 0) this.fire(); return; }
        if (++this.flash > 12) this.active = false;
    }
    fire() {
        const o = this.owner, dir = bdDir(o);
        this.fromY = o.id === 1 ? bdLaneY(o) : bdLaneY(o) + o.h;
        const sw = (typeof sniperWallBlockY === 'function') ? sniperWallBlockY(o, this.x, this.fromY, dir, this.halfW, this.dmg) : null;
        if (sw && typeof sniperWallStopY === 'function') this.stopY = sniperWallStopY(sw, dir);
        const passed = (y) => this.stopY == null || (dir < 0 ? y > this.stopY : y < this.stopY);
        const inCol = (t) => this.x + this.halfW > t.x && this.x - this.halfW < t.x + t.w;
        for (const e of bdFoes(o)) {
            if (!inCol(e) || !passed(e.y + e.h / 2)) continue;
            const d = bdHit(o, e, this.dmg);
            if (d > 0) bdGain(o, 0.5);
            spawnSparkParticles(this.x, e.y + e.h / 2, BD_RED, 10);
        }
        for (const ob of bdObjects(o)) {
            if (ob.isImmortal || (typeof SniperWall !== 'undefined' && ob instanceof SniperWall)) continue;
            if (inCol(ob) && passed(ob.y + ob.h / 2)) bdHitObject(o, ob, this.dmg);
        }
        triggerScreenShake(4, 8);
        bdSfx('playLaser');
    }
    draw() { if (typeof bdDrawLaser === 'function') bdDrawLaser(this); }
}

// Huyết Cầu: bay xuyên mọi thứ, nổ khi chạm biên đối diện
class BdOrb {
    constructor(owner, x, y, vy, r, dmg, exDmg, exR, big) {
        this.owner = owner; this.x = x; this.y = y; this.vy = vy; this.r = r;
        this.dmg = dmg; this.exDmg = exDmg; this.exR = exR; this.big = !!big;
        this.active = true; this.t = 0; this.hits = [];
    }
    update() {
        if (!this.active) return;
        this.t++;
        this.y += this.vy;
        const o = this.owner;
        for (const e of bdFoes(o)) {
            if (this.hits.includes(e)) continue;
            const nx = Math.max(e.x, Math.min(e.x + e.w, this.x)), ny = Math.max(e.y, Math.min(e.y + e.h, this.y));
            if (Math.hypot(nx - this.x, ny - this.y) < this.r) {
                this.hits.push(e);
                bdHit(o, e, this.dmg, { isPiercing: true });
                spawnSparkParticles(this.x, this.y, BD_RED, 12);
            }
        }
        for (const ob of bdObjects(o)) {
            if (this.hits.includes(ob) || (typeof SniperWall !== 'undefined' && ob instanceof SniperWall)) continue;
            if (rectIntersect(this.x - this.r, this.y - this.r, this.r * 2, this.r * 2, ob.x, ob.y, ob.w, ob.h)) {
                this.hits.push(ob);
                bdHitObject(o, ob, this.dmg * 0.5);
            }
        }
        const far = this.vy < 0 ? this.y - this.r <= 0 : this.y + this.r >= canvas.height;
        if (far || this.t > 400) {
            this.active = false;
            const ey = this.vy < 0 ? 12 : canvas.height - 12;
            explosions.push(new Explosion(this.x, ey, this.exR, 'rgba(255, 31, 75,', 0, o));
            // Sát thương nổ tự tính (để hút máu)
            for (const e of bdFoes(o)) {
                const nx = Math.max(e.x, Math.min(e.x + e.w, this.x)), ny = Math.max(e.y, Math.min(e.y + e.h, ey));
                if (Math.hypot(nx - this.x, ny - ey) < this.exR) bdHit(o, e, this.exDmg);
            }
            for (const ob of bdObjects(o)) if (Math.hypot(ob.x + ob.w / 2 - this.x, ob.y + ob.h / 2 - ey) < this.exR + ob.w / 2) bdHitObject(o, ob, this.exDmg);
            explosions.push(new Explosion(this.x, ey, this.exR * 0.55, 'rgba(255, 208, 218,', 0, o));
            spawnSparkParticles(this.x, ey, BD_RED, this.big ? 26 : 10);
            triggerScreenShake(this.big ? 9 : 4, 12);
            bdSfx('playExplosion');
        }
    }
    draw() { if (typeof bdDrawOrb === 'function') bdDrawOrb(this); }
}

// Đạn máu thường: trúng -> cộng thêm Bể Máu
BulletHooks.register('bd_blood', {
    hit(b, attacker, victim, dmg) {
        if (!attacker || attacker.weapon !== 'blood_lord') return;
        bdGain(attacker, 0.2);
        if (victim && (victim === p1 || victim === p2)) bdLeech(attacker, dmg);
    },
});

// ==========================================
// Kỹ năng
// ==========================================
function bdNoAmmo(p) {
    if ((p.bdWarnCd || 0) > 0) return;
    addFloatingText(p.x + p.w / 2, p.y - 14, 'THIẾU ĐẠN 🩸', '#fda4af', 11);
    p.bdWarnCd = 40;
}

function bdCast(p, now) {
    if ((p.bdCd || 0) > 0) return;
    const cx = p.x + p.w / 2;
    const pw = bdPow(p);
    if (p.bdNight) { p.bdNight = false; bdSkyStart(p); p.lastShot = now; return; }
    const f = p.bdForm || 0;
    if (p.ammo < BD_AMMO[f]) { bdNoAmmo(p); return; }
    if ((f === 1 || f === 2) && !bdHpOk(p)) {
        if ((p.bdWarnCd || 0) <= 0) { addFloatingText(cx, p.y - 14, 'THIẾU MÁU 🩸', '#94a3b8', 11); p.bdWarnCd = 40; }
        return;
    }
    p.bdCd = 12;
    p.lastShot = now;
    if (f === 0) {
        p.ammo -= 1;
        spawnBullet(p, { x: cx - 3.5, w: 7, h: 9, dmg: p.damage * 1.1 * (1 + (pw - 1) * 0.5), hook: 'bd_blood', isBdBlood: true });
        bdSfx('playShoot');
    } else if (f === 1) {
        p.ammo -= 2;
        bdPayHp(p);
        p.bdMode = 'dash'; p.bdHomeX = p.x; p.bdTrail = [];
        addFloatingText(cx, p.y - 16, 'HUYẾT PHÁ 🦇', BD_RED, 12);
        bdSfx('playDash');
    } else if (f === 2) {
        p.ammo -= 3;
        bdPayHp(p);
        bodyEffects.push(new BdLaser(p, cx, 1.5 * pw * BD_NERF, 24, bdEvo2(p) ? 9 : 7));
        addFloatingText(cx, p.y - 16, 'HUYẾT TIỄN 🗡️', BD_RED, 12);
    } else {
        const used = Math.max(1, p.ammo);
        p.ammo = 0;
        const max = bdPoolMax(p), X = p.bdPool || 0, frac = Math.min(1, X / max);
        p.bdPool = 0;
        const big = frac >= 0.5;
        const ammoB = 1 + 0.03 * (used - 1);
        const r = big ? 8 + frac * 10 : 5;
        const dmg = (big ? 0.3 + 0.9 * frac : 0.3) * pw * BD_NERF * ammoB;
        const exDmg = (big ? 0.2 + 0.6 * frac : 0.2) * pw * BD_NERF * ammoB;
        const exR = big ? 40 + 50 * frac : 26;
        const sy = p.id === 1 ? p.y - r : p.y + p.h + r;
        bodyEffects.push(new BdOrb(p, cx, sy, bdDir(p) * (big ? 5 : 6.5), r, dmg, exDmg, exR, big));
        addFloatingText(cx, p.y - 16, big ? 'HUYẾT CẦU!! 🔴' : 'huyết cầu 🔴', big ? '#ff4d6d' : '#fda4af', big ? 14 : 11);
        if (big) {
            p.bdNight = true;
            addFloatingText(cx, p.y - 32, 'BÓNG MA MÀN ĐÊM SẴN SÀNG 🦇', BD_VIOLET, 11);
            bdSfx('playPowerup');
        } else bdSfx('playShoot');
    }
}

// Đổi dạng: nổ màu dạng mới + chữ lớn + chớp màu trên xe
function bdSwitchForm(p) {
    const f = ((p.bdForm || 0) + 1) % 4;
    p.bdForm = f;
    p.bdSwitchFx = 30;
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    explosions.push(new Explosion(cx, cy, 30, BD_RGBA[f], 0, p));
    spawnSparkParticles(cx, cy, BD_COL[f], 12);
    addFloatingText(cx, p.y - 18, `${BD_ICON[f]} ${BD_NAME[f]}`, BD_COL[f], 15);
    bdSfx('playClick');
}

// Huyết Phá: dơi bất tử lao thẳng lên, chạm vật thể/mục tiêu -> Bầy Dơi 2s rồi giật về chỗ cũ
function bdDashUpdate(p) {
    const dir = bdDir(p);
    p.y += dir * 16;
    if (!p.bdTrail) p.bdTrail = [];
    p.bdTrail.unshift(Math.round(p.y));
    if (p.bdTrail.length > 6) p.bdTrail.length = 6;
    let hit = null;
    for (const e of bdFoes(p)) if (rectIntersect(p.x - 2, p.y - 2, p.w + 4, p.h + 4, e.x, e.y, e.w, e.h)) { hit = e; break; }
    if (!hit) for (const ob of bdObjects(p)) if (rectIntersect(p.x, p.y, p.w, p.h, ob.x, ob.y, ob.w, ob.h)) { hit = ob; break; }
    const farEdge = dir < 0 ? p.y <= 2 : p.y >= canvas.height - p.h - 2;
    if (!hit && !farEdge) return;
    const pw = bdDmgMult(p);
    const cx = p.x + p.w / 2, cy = Math.max(p.h / 2, Math.min(canvas.height - p.h / 2, p.y + p.h / 2));
    if (hit) {
        if (hit === p1 || hit === p2 || bdFoes(p).includes(hit)) {
            const d = bdHit(p, hit, 0.8 * pw);
            if (d > 0) bdGain(p, d * 2);
        } else bdHitObject(p, hit, 0.8 * pw);
    }
    const zr = bdFull(p) ? 50 : (bdEvo2(p) ? 48 : 46);
    bodyEffects.push(new BdBatZone(p, cx, cy, zr, 120, { dmg: 0.2 * pw }));
    explosions.push(new Explosion(cx, cy, zr, 'rgba(255, 140, 26,', 0, p));
    explosions.push(new Explosion(cx, cy, zr * 0.5, 'rgba(255, 31, 75,', 0, p));
    spawnSparkParticles(cx, cy, BD_RED, 14);
    bdSfx('playExplosion');
    // Hóa thành bầy dơi: ẩn khỏi sân 2s
    p.bdMode = 'swarm'; p.bdSwarmT = 120; p.bdTrail = [];
    p.y = p.id === 1 ? canvas.height + 300 : -300 - p.h;
}

function bdReturn(p, x) {
    p.bdMode = 'idle';
    p.bdCircle = null;
    p.x = Math.max(0, Math.min(canvas.width - p.w, x));
    p.y = bdLaneY(p);
    p.invincibleTimer = Math.max(p.invincibleTimer || 0, 12);
    spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, BD_LIGHT, 10);
}

// Bóng Ma Màn Đêm: bay lên trời (không thể bị nhắm), điều khiển vòng cảnh báo
function bdSkyStart(p) {
    p.bdMode = 'sky';
    p.bdHomeX = p.x;
    const r = bdFull(p) ? 64 : (bdEvo2(p) ? 61 : 58);
    p.bdCircle = { x: p.x + p.w / 2, y: bdLaneY(p) + p.h / 2, r, t: 0, max: 300, landing: 0, landMax: BD_LAND_LOCK };
    explosions.push(new Explosion(p.x + p.w / 2, p.y + p.h / 2, 36, 'rgba(177, 77, 255,', 0, p));
    spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, BD_VIOLET, 14);
    addFloatingText(p.x + p.w / 2, p.y - 16, 'BÓNG MA MÀN ĐÊM 🦇', BD_VIOLET, 13);
    p.y = p.id === 1 ? canvas.height + 300 : -300 - p.h;
    bdSfx('playDash');
}
function bdSkyUpdate(p, inp) {
    const c = p.bdCircle;
    if (!c) { bdReturn(p, p.bdHomeX); return; }
    if (c.landing > 0) { if (--c.landing === 0) bdSkyImpact(p); return; }
    c.t++;
    const e = bdEnemy(p);
    let l = inp.l, r = inp.r;
    if (bdIsBot(p) && e) {
        const dx = e.x + e.w / 2 - c.x;
        l = dx < -4; r = dx > 4;
        if (c.t > 50 && Math.abs(dx) < 12) bdSkyLand(p);
    }
    if (l) c.x -= 4.2;
    if (r) c.x += 4.2;
    c.x = Math.max(c.r * 0.5, Math.min(canvas.width - c.r * 0.5, c.x));
    const dir = bdDir(p);
    const stopY = e ? bdLaneY(e) + e.h / 2 : (dir < 0 ? 34 : canvas.height - 34);
    if (dir < 0) c.y = Math.max(stopY, c.y - 5); else c.y = Math.min(stopY, c.y + 5);
    if (c.t >= c.max) bdSkyLand(p);
}
function bdSkyLand(p) {
    const c = p.bdCircle;
    if (!c || c.landing > 0) return;
    c.landing = BD_LAND_LOCK; c.landMax = BD_LAND_LOCK;
    bdSfx('playDash');
}
function bdSkyImpact(p) {
    const c = p.bdCircle;
    const pw = bdDmgMult(p);
    for (const e of bdFoes(p)) {
        if (Math.hypot(e.x + e.w / 2 - c.x, e.y + e.h / 2 - c.y) < c.r + e.w / 2) {
            bdHit(p, e, 1.3 * pw, undefined, 0.2);
            addFloatingText(e.x + e.w / 2, e.y - 16, 'ĐẠI TIỆC MÁU! 🦇', BD_RED, 14);
        }
    }
    for (const ob of bdObjects(p)) if (Math.hypot(ob.x + ob.w / 2 - c.x, ob.y + ob.h / 2 - c.y) < c.r + ob.w / 2) bdHitObject(p, ob, 1.3 * pw);
    bodyEffects.push(new BdBatZone(p, c.x, c.y, c.r, 180, { feast: true, dmg: 0.2 * pw }));
    explosions.push(new Explosion(c.x, c.y, c.r + 16, 'rgba(255, 31, 75,', 0, p));
    explosions.push(new Explosion(c.x, c.y, c.r * 0.6, 'rgba(177, 77, 255,', 0, p));
    spawnSparkParticles(c.x, c.y, BD_RED, 22);
    triggerScreenShake(8, 12);
    bdSfx('playExplosion');
    // Chỉ hồi HP (không nạp Bể Máu). Khóa tích Bể Máu 5s (Full Evo: chỉ trong lúc Đại Tiệc diễn ra)
    bdHeal(p, 1.2 * bdPow(p), 'HP 🩸');
    p.bdGainLock = bdFull(p) ? 180 : 300;
    // Huyết Ma hóa thành Đại Tiệc Máu (ẩn, không thể bị nhắm) tới khi vùng tan rồi về chỗ cũ
    p.bdCircle = null;
    p.bdMode = 'swarm'; p.bdSwarmT = 180;
}

// ==========================================
// Hook
// ==========================================
CharHooks.register('blood_lord', {
    setup() {
        this.maxAmmo = 6;
        this.reloadTime = 400; // nghỉ đánh 0.4s mới hồi đạn (0.4s/viên)
        if (bdEvo2(this)) this.maxHp += 2;
        if (bdFull(this)) this.maxHp += 1;
        this.bdPool = 0; this.bdForm = 0; this.bdHold = 0; this.bdPrevS = false; this.bdHoldValid = false;
        this.bdCd = 0; this.bdWarnCd = 0; this.bdCalm = 0; this.bdNight = false;
        this.bdMode = 'idle'; this.bdHomeX = 0; this.bdCircle = null; this.bdSwarmT = 0; this.bdTrail = [];
        this.bdLastHp = undefined; this.bdLastEnemyHp = undefined; this.bdTick = 0;
        this.bdEscUsed = false; this.bdGainLock = 0;
        this.bdSwitchFx = 0; this.bdSwitched = false; this.bdLeechShow = 0;
        if (!(gameState.round > 1) || this.bdRevived === undefined) this.bdRevived = false;
    },
    update(inp, effInp, now) {
        this.bdTick++;
        if (this.bdCd > 0) this.bdCd--;
        if (this.bdWarnCd > 0) this.bdWarnCd--;
        if (this.bdGainLock > 0) this.bdGainLock--;
        if (this.bdSwitchFx > 0) this.bdSwitchFx--;
        bdTrack(this);
        // Chuyển hóa Bể Máu -> HP sau thời gian yên ổn
        this.bdCalm++;
        if (this.bdCalm >= bdCalmNeed(this) && this.bdPool > 0 && this.hp > 0 && this.hp < this.maxHp) {
            const ratio = bdRatio(this);
            const drain = Math.min(this.bdPool, 2 / 60, (this.maxHp - this.hp) * ratio);
            this.bdPool -= drain;
            bdHeal(this, drain / ratio);
            if (this.bdTick % 30 === 0) spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, '#ff7a93', 3);
        }
        if (this.bdMode !== 'idle') this.lastShot = now; // đang thi triển = đang tấn công -> chưa hồi đạn
        if (this.bdMode === 'dash') bdDashUpdate(this);
        else if (this.bdMode === 'swarm') { if (--this.bdSwarmT <= 0) bdReturn(this, this.bdHomeX); }
        else if (this.bdMode === 'sky') bdSkyUpdate(this, effInp || inp);
        // Bot phòng tập: tự chọn dạng bắn
        if (bdIsBot(this) && this.bdMode === 'idle' && this.bdHold === 0 && this.bdTick % 30 === 0) {
            const r = Math.random(), half = this.bdPool >= bdPoolMax(this) * 0.5;
            this.bdForm = (half && r < 0.4) ? 3 : ((this.ammo >= 3 && r < 0.6) ? 2 : ((this.ammo >= 2 && r < 0.8) ? 1 : 0));
        }
    },
    speed(s) { return this.bdMode === 'idle' ? s : 0; },
    shoot(inp, now) {
        const s = !!inp.s;
        const pressed = s && !this.bdPrevS, released = !s && this.bdPrevS;
        this.bdPrevS = s;
        if (this.bdMode === 'sky') {
            if (pressed && this.bdCircle && this.bdCircle.t > 6) bdSkyLand(this);
            this.bdHoldValid = false; this.bdHold = 0;
            return true;
        }
        if (this.bdMode !== 'idle') { this.bdHoldValid = false; this.bdHold = 0; return true; }
        if (pressed) { this.bdHoldValid = true; this.bdHold = 0; this.bdSwitched = false; }
        if (s && this.bdHoldValid) {
            this.bdHold++;
            // Giữ đủ 0.25s -> đổi ĐÚNG 1 dạng; phải THẢ nút rồi giữ lại mới đổi tiếp
            if (this.bdHold >= BD_HOLD_TICKS) {
                bdSwitchForm(this);
                this.bdHoldValid = false; this.bdHold = 0; this.bdSwitched = true;
            }
        } else if (released) {
            if (this.bdHoldValid && this.bdHold < BD_HOLD_TICKS) bdCast(this, now);
            this.bdHold = 0; this.bdHoldValid = false; this.bdSwitched = false;
        }
        return true;
    },
    // Dơi Bất Tử (Huyết Phá) / bầy dơi / bay trên trời: không thể bị đánh trúng
    beforeDamage() { return this.bdMode !== 'idle'; },
    beforeLethal(dmg) {
        // Evo 1: Huyết Ảnh Đào Thoát (1 lần/hiệp)
        if (bdEvo1(this) && !this.bdEscUsed) {
            this.bdEscUsed = true;
            const ox = this.x;
            let nx = canvas.width - this.x - this.w;
            if (Math.abs(nx - ox) < 90) nx = ox + this.w / 2 < canvas.width / 2 ? canvas.width - this.w - 24 : 24;
            explosions.push(new Explosion(ox + this.w / 2, this.y + this.h / 2, 30, 'rgba(177, 77, 255,', 0, this));
            this.x = Math.max(0, Math.min(canvas.width - this.w, nx));
            this.invincibleTimer = Math.max(this.invincibleTimer || 0, 120);
            this.bdPool = Math.min(bdPoolMax(this), (this.bdPool || 0) + bdPoolMax(this) * (bdFull(this) ? 1 : 0.5));
            this.bdLastHp = this.hp;
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, BD_VIOLET, 16);
            addFloatingText(this.x + this.w / 2, this.y - 18, 'HUYẾT ẢNH ĐÀO THOÁT 🦇', BD_VIOLET, 13);
            bdSfx('playDash');
            return true;
        }
        // Full Evo: Hồi Sinh (1 lần/trận) khi Bể Máu đầy
        if (bdFull(this) && !this.bdRevived && this.bdPool >= bdPoolMax(this) - 0.01) {
            this.bdRevived = true;
            this.bdPool = 0;
            this.hp = Math.max(this.hp, this.maxHp * 0.5);
            this.bdLastHp = this.hp;
            this.invincibleTimer = Math.max(this.invincibleTimer || 0, 90);
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 60, 'rgba(255, 31, 75,', 0, this));
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, BD_RED, 24);
            addFloatingText(this.x + this.w / 2, this.y - 20, 'HUYẾT TỔ BẤT DIỆT! 🩸', '#ff4d6d', 15);
            triggerScreenShake(8, 14);
            bdSfx('playPowerup');
            return true;
        }
        return false;
    },
});
