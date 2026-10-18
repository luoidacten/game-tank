// ==========================================
// Hoa Ảnh (flower_shadow) — Logic: Tam Vũ Điệu (Khai / Phá / Thiên),
// Bách Hoa Nở Rộ, bóng trễ, hoa tự ngắm
// "Khiêu vũ nào!"
// ------------------------------------------
// Mọi trạng thái là trường thường trên player (fs*) hoặc thực thể trong bodyEffects
// (đều có trong NET_CLASSES) -> đồng bộ online được.
// ==========================================

const FS_COST = [10, 25, 50];
const FS_NAME = ['KHAI', 'PHÁ', 'THIÊN'];
const FS_ICON = ['🌺', '⚔️', '☄️'];
const FS_PINK = '#ff7eb6', FS_DEEP = '#ff3d8b', FS_LIGHT = '#ffd6e8';
const FS_HOLD_TICKS = 15;   // giữ 0.25s để đổi vũ điệu
const FS_REGEN_DELAY = 30;  // Hoa chỉ bắt đầu hồi sau 0.5s không dùng vũ điệu
const FS_LAND_LOCK = 30;    // Thiên: vòng khóa 0.5s trước khi giáng (RULE 11)
const FS_EMP_GOLD = '#ffd34d', FS_EMP_LIGHT = '#fff6c8';

function fsEvo1(p) { return p.hasUpgrade('evo_flw_1'); }
function fsEvo2(p) { return p.hasUpgrade('evo_flw_2'); }
function fsFull(p) { return fsEvo1(p) && fsEvo2(p); }
function fsPow(p) { return fsFull(p) ? 1.25 : 1; }
const FS_PETAL_NERF = 0.78; // cánh hoa (Khai / hoa tự ngắm) giảm ~22% dame
const FS_SKILL_NERF = 0.9;  // Phá / Thiên / Ngôi Sao giảm 10% dame
// Kho Hoa: Base 100%, Evo 1: 200%, Full Evo: 300%
function fsMaxHoa(p) { return fsFull(p) ? 300 : (fsEvo1(p) ? 200 : 100); }
// Mức tự hồi tối đa (phần trên chỉ nạp được bằng thu hồi cánh hoa): Full Evo 200%, còn lại 100%
function fsRegenCap(p) { return fsFull(p) ? 200 : 100; }
// Thời gian cánh hoa nằm nghỉ trước khi tự thu về: 3s (Full Evo: 2s)
function fsRestTicks(p) { return fsFull(p) ? 120 : 180; }
// Giới hạn cánh hoa Khai trên sân: Base 12, Evo 1: 24, Full Evo: không giới hạn
function fsPetalCap(p) { return fsFull(p) ? Infinity : (fsEvo1(p) ? 24 : 12); }
// Bách Hoa Nở Rộ: ngưỡng Hoa tiêu hao để cường hóa (Base 75%, Evo 1 trở lên 50%)
function fsBloomNeed(p) { return fsEvo1(p) ? 50 : 75; }
function fsKhaiCount(p) {
    let n = 0;
    for (const e of bodyEffects) if (e instanceof FsPetal && e.active && e.khai && e.owner === p && !e.fade) n++;
    return n;
}
function fsDir(p) { return p.id === 1 ? -1 : 1; }
function fsEnemy(p) { return p === p1 ? p2 : p1; }
function fsLaneY(p) { return p.id === 1 ? canvas.height - p.h - 22 : 20; }
// Vị trí "nhà" của Hoa Ảnh (kể cả khi đang ẩn thân)
function fsHome(p) {
    const x = p.fsHidden ? (p.fsHomeX || 0) + p.w / 2 : p.x + p.w / 2;
    return { x, y: fsLaneY(p) + p.h / 2 };
}
function fsSfx(name) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[name]) soundSystem[name](); }

// Đoạn thẳng cắt hình chữ nhật (Liang–Barsky)
function fsSegHitsRect(x1, y1, x2, y2, r, pad = 0) {
    let t0 = 0, t1 = 1;
    const dx = x2 - x1, dy = y2 - y1;
    const rx = r.x - pad, ry = r.y - pad, rw = r.w + pad * 2, rh = r.h + pad * 2;
    const ps = [-dx, dx, -dy, dy];
    const qs = [x1 - rx, rx + rw - x1, y1 - ry, ry + rh - y1];
    for (let i = 0; i < 4; i++) {
        if (ps[i] === 0) { if (qs[i] < 0) return false; continue; }
        const t = qs[i] / ps[i];
        if (ps[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
        else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
    return true;
}

// Vật thể có thể chém (thùng, xe tiền, triệu hồi & công trình của đối thủ)
function fsObjects(p) {
    const out = [];
    const add = (o) => {
        if (!o || o.active === false || o === p1 || o === p2) return;
        if (o.owner && o.owner === p) return;
        if (typeof o.x !== 'number' || !o.w || o.isImmortal) return;
        out.push(o);
    };
    crates.forEach(add);
    moneyTrucks.forEach(add);
    [turrets, creatorTurrets, necroMinions, creatorDrones, creatorRobots, ghostDecoys, sniperWalls, bastions]
        .forEach(list => (list || []).forEach(add));
    bodyEffects.forEach(e => { if (e.isStone) add(e); });
    return out;
}

// Gây sát thương lên 1 vật thể (không phải xe)
function fsHitObject(p, o, dmg) {
    if (!o || o.active === false) return;
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    if (o instanceof Crate) {
        o.active = false; crateOnBreak(o, p); grantCrateLoot(o, p);
        spawnSparkParticles(cx, cy, FS_PINK, 6);
        return;
    }
    if (typeof o.takeDamage === 'function') { o.takeDamage(dmg, p); return; }
    if (typeof o.hp !== 'number') return;
    o.hp -= (o instanceof MoneyTruck) ? dmg * 1.5 : dmg;
    spawnSparkParticles(cx, cy, FS_LIGHT, 3);
    if (o.hp <= 0) {
        o.active = false;
        if (o instanceof MoneyTruck) {
            const m = 30;
            if (p.id === 1) gameState.p1Coins += m; else gameState.p2Coins += m;
            addFloatingText(cx, o.y - 8, '+30$', '#ffd700', 12);
        }
        explosions.push(new Explosion(cx, cy, 36, 'rgba(255, 126, 182,', 0, p));
    }
}

function fsDamage(p, target, dmg) {
    if (!target) return 0;
    if (target === p1 || target === p2) return target.hp > 0 ? target.takeDamage(dmg, p) : 0;
    fsHitObject(p, target, dmg);
    return dmg;
}

function fsTargetAlive(t) {
    if (!t) return false;
    if (t === p1 || t === p2) return t.hp > 0;
    return t.active !== false;
}

// ==========================================
// Cánh hoa (Khai, Khai cường hóa, hoa tự ngắm)
// state: fly -> rest -> (aim) -> return | seekAim -> seek
// ==========================================
class FsPetal {
    constructor(owner, x, y, vx, vy, dmg, opts = {}) {
        this.owner = owner; this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.dmg = dmg; this.r = 6;
        this.state = opts.state || 'fly';
        this.emp = !!opts.emp; this.refund = opts.refund !== false;
        this.khai = !!opts.khai; // cánh hoa Khai (tính vào giới hạn trên sân)
        this.timer = opts.timer || 0;
        this.restY = owner.id === 1 ? 12 : canvas.height - 12;
        this.hitOut = false; this.hitBack = false; this.hitObj = [];
        this.rot = Math.random() * 6.28; this.spin = (Math.random() < 0.5 ? -1 : 1) * (0.08 + Math.random() * 0.08);
        this.age = 0; this.flash = 0; this.fade = 0;
        this.tx = opts.tx || 0; this.ty = opts.ty || 0; // điểm khóa (hoa tự ngắm / tia thu hồi)
        this.trail = [];
        this.active = true;
    }
    enemy() { return fsEnemy(this.owner); }
    touchEnemy() {
        const e = this.enemy();
        return e && e.hp > 0 && this.x > e.x - this.r && this.x < e.x + e.w + this.r && this.y > e.y - this.r && this.y < e.y + e.h + this.r;
    }
    // pierce=false: chạm vật cản / công trình / triệu hồi / xe tiền -> gây dame rồi vỡ (trả về true)
    touchObjects(pierce = true) {
        for (const o of fsObjects(this.owner)) {
            if (this.hitObj.includes(o)) continue;
            if (this.x > o.x - this.r && this.x < o.x + o.w + this.r && this.y > o.y - this.r && this.y < o.y + o.h + this.r) {
                this.hitObj.push(o);
                fsHitObject(this.owner, o, this.dmg);
                if (!pierce) { this.shatter(); return true; }
            }
        }
        const m = typeof movingObstacle !== 'undefined' ? movingObstacle : null;
        if (!pierce && m && m.active && this.x > m.x - this.r && this.x < m.x + m.w + this.r && this.y > m.y - this.r && this.y < m.y + m.h + this.r) {
            this.shatter(); return true;
        }
        return false;
    }
    shatter() {
        spawnSparkParticles(this.x, this.y, this.emp ? FS_EMP_GOLD : FS_PINK, 6);
        this.trail = []; this.fade = 1;
    }
    // Cánh hoa nằm trên sân địch: xe địch lăn qua -> nát ngay (không thu về được nữa)
    crushedByEnemy() {
        const e = this.enemy();
        if (!e || e.hp <= 0) return false;
        if (this.x > e.x - this.r && this.x < e.x + e.w + this.r && this.y > e.y - 12 && this.y < e.y + e.h + 12) {
            spawnSparkParticles(this.x, this.y, FS_LIGHT, 8);
            addFloatingText(this.x, this.y + (this.owner.id === 1 ? 14 : -14), '🥀', FS_PINK, 10);
            this.fade = 1;
            return true;
        }
        return false;
    }
    pushTrail() {
        this.trail.unshift(Math.round(this.x * 10) / 10, Math.round(this.y * 10) / 10);
        if (this.trail.length > 12) this.trail.length = 12;
    }
    update() {
        if (!this.active) return;
        const o = this.owner;
        this.age++; this.rot += this.spin;
        if (this.fade > 0) { if (++this.fade > 20) this.active = false; return; }
        if (!o || o.hp <= 0) { this.fade = 1; return; }
        const e = this.enemy();
        switch (this.state) {
            case 'fly': {
                this.x += this.vx; this.y += this.vy;
                if (this.x < 6 || this.x > canvas.width - 6) { this.vx = -this.vx; this.x = Math.max(6, Math.min(canvas.width - 6, this.x)); }
                this.pushTrail();
                if (!this.hitOut && this.touchEnemy()) {
                    this.hitOut = true;
                    e.takeDamage(this.dmg, o);
                    spawnSparkParticles(this.x, this.y, FS_PINK, 6);
                }
                // Lượt bay ra: bị chặn (trừ cường hóa; Full Evo xuyên khi bay ra)
                if (this.touchObjects(this.emp || fsFull(o))) break;
                if ((o.id === 1 && this.y <= this.restY) || (o.id === 2 && this.y >= this.restY)) {
                    this.y = this.restY; this.state = 'rest'; this.timer = this.restMax = fsRestTicks(o); this.trail = [];
                }
                break;
            }
            case 'rest': {
                // Lưu Ảnh: nằm nghỉ, không gây sát thương. Evo 2: tỏa phấn làm chậm
                if (this.crushedByEnemy()) break;
                if (fsEvo2(o) && e && Math.hypot(e.x + e.w / 2 - this.x, e.y + e.h / 2 - this.y) < 58) addStatusSlow(e, 0.7);
                if (--this.timer <= 0) {
                    if (this.emp) { this.state = 'aim'; this.timer = 60; }
                    else { this.state = 'return'; this.vx = 0; this.vy = -fsDir(o) * 1.2; this.hitObj = []; }
                }
                break;
            }
            case 'aim': { // Khai cường hóa: cảnh báo 1s rồi thu về dạng tia
                if (this.crushedByEnemy()) break;
                const h = fsHome(o);
                this.tx = h.x; this.ty = h.y;
                if (--this.timer <= 0) this.fireLine();
                break;
            }
            case 'line': { // vệt chém vừa bắn ra
                if (++this.flash > 14) {
                    if (this.refund) fsGainHoa(o, 5, this.x, this.y, true);
                    this.active = false;
                }
                break;
            }
            case 'return': {
                const h = fsHome(o);
                const dx = h.x - this.x, dy = h.y - this.y, L = Math.hypot(dx, dy) || 1;
                const spd = 3.4;
                this.vx += (dx / L * spd - this.vx) * 0.06;
                this.vy += (dy / L * spd - this.vy) * 0.06;
                this.x += this.vx; this.y += this.vy;
                this.pushTrail();
                if (!this.hitBack && this.touchEnemy()) {
                    this.hitBack = true;
                    e.takeDamage(this.dmg, o);
                    spawnSparkParticles(this.x, this.y, FS_PINK, 6);
                }
                // Lượt thu hồi: luôn bị chặn (trừ cường hóa)
                if (this.touchObjects(this.emp)) break;
                if (L < 18) {
                    if (this.refund) fsGainHoa(o, 5, this.x, this.y, true);
                    this.active = false;
                } else if (this.age > 1600) this.fade = 1;
                break;
            }
            case 'seekAim': { // Full Evo: hoa tự ngắm (vệt cảnh báo trước)
                if (--this.timer <= 0) {
                    const dx = this.tx - this.x, dy = this.ty - this.y, L = Math.hypot(dx, dy) || 1;
                    this.vx = dx / L * 11; this.vy = dy / L * 11; this.state = 'seek';
                }
                break;
            }
            case 'seek': {
                this.x += this.vx; this.y += this.vy;
                this.pushTrail();
                if (!this.hitOut && this.touchEnemy()) {
                    this.hitOut = true; e.takeDamage(this.dmg, o);
                    spawnSparkParticles(this.x, this.y, FS_PINK, 8);
                    this.fade = 1;
                }
                this.touchObjects();
                if (this.x < -20 || this.x > canvas.width + 20 || this.y < -20 || this.y > canvas.height + 20) this.active = false;
                break;
            }
        }
    }
    fireLine() {
        const o = this.owner, e = this.enemy();
        this.state = 'line'; this.flash = 0;
        if (e && e.hp > 0 && fsSegHitsRect(this.x, this.y, this.tx, this.ty, e, 4)) {
            e.takeDamage(this.dmg, o);
            bodyEffects.push(new FsSlashMark(o, e, 0, 5, 6, o.damage * fsPow(o) * FS_PETAL_NERF, 0.8));
        }
        for (const ob of fsObjects(o)) if (fsSegHitsRect(this.x, this.y, this.tx, this.ty, ob, 2)) fsHitObject(o, ob, this.dmg * 2);
        fsSfx('playLaser');
    }
    draw() { fsDrawPetalEntity(this); }
}

// ==========================================
// Dấu chém trễ: sau `delay` tick, chém `hits` nhát liên tục lên mục tiêu
// ==========================================
class FsSlashMark {
    constructor(owner, target, delay, hits, interval, dmg, scale = 1) {
        this.owner = owner; this.target = target;
        this.delay = delay; this.maxDelay = Math.max(1, delay);
        this.hits = hits; this.interval = interval; this.dmg = dmg; this.scale = scale;
        this.t = 0; this.done = 0; this.slashes = [];
        this.seed = Math.random() * 6.28;
        this.x = 0; this.y = 0; this.size = 20;
        this.follow();
        this.active = true;
    }
    follow() {
        const t = this.target;
        if (t && typeof t.x === 'number') { this.x = t.x + (t.w || 0) / 2; this.y = t.y + (t.h || 0) / 2; this.size = Math.max(16, Math.max(t.w || 0, t.h || 0)); }
    }
    update() {
        if (!this.active) return;
        if (fsTargetAlive(this.target)) this.follow();
        if (this.delay > 0) { this.delay--; return; }
        this.t++;
        if (this.done < this.hits && (this.t - 1) % this.interval === 0) {
            if (fsTargetAlive(this.target)) fsDamage(this.owner, this.target, this.dmg);
            this.slashes.push(this.t, Math.round((this.seed + this.done * 2.4) * 100) / 100);
            if (this.slashes.length > 12) this.slashes.splice(0, 2);
            this.done++;
            if (this.done === 1) { fsSfx('playHit'); triggerScreenShake(2, 4); }
        }
        if (this.done >= this.hits && this.t > (this.hits - 1) * this.interval + 16) this.active = false;
    }
    draw() { fsDrawSlashMark(this); }
}

// --- Bước lướt Phá dùng chung cho xe / bản sao / bóng (o có x,y,w,h,phase,hits) ---
function fsDashStep(o, owner, laneY, cleanseBullets) {
    const dir = fsDir(owner);
    const fwd = 18, back = 13;
    if (o.phase === 1) o.y += dir * fwd;
    else o.y -= dir * back;
    if (!o.trail) o.trail = [];
    o.trail.unshift(Math.round(o.y));
    if (o.trail.length > 7) o.trail.length = 7;
    // Đâm xuyên: ghi nhận mọi mục tiêu trên đường
    const e = fsEnemy(owner);
    if (e && e.hp > 0 && !o.hits.includes(e) && rectIntersect(o.x, o.y, o.w, o.h, e.x, e.y, e.w, e.h)) {
        o.hits.push(e);
        spawnSparkParticles(e.x + e.w / 2, e.y + e.h / 2, FS_PINK, 10);
        addFloatingText(e.x + e.w / 2, e.y - 12, 'ẢNH ẤN ✿', FS_PINK, 12);
    }
    for (const ob of fsObjects(owner)) {
        if (o.hits.includes(ob)) continue;
        if (rectIntersect(o.x, o.y, o.w, o.h, ob.x, ob.y, ob.w, ob.h)) {
            if (ob instanceof Crate) fsHitObject(owner, ob, 0); // thùng vỡ ngay khi lướt qua
            else o.hits.push(ob);
        }
    }
    // Evo 2: chém nát đạn thường của đối thủ trên đường lướt
    if (cleanseBullets && e && e.bullets && e.bullets.length) {
        for (let j = e.bullets.length - 1; j >= 0; j--) {
            const b = e.bullets[j];
            if (b.isLazer || b.isRaycast || b.type === 'purple' || (b.w > 24 && b.h > 24)) continue;
            if (rectIntersect(o.x - 8, o.y - 8, o.w + 16, o.h + 16, b.x, b.y, b.w || 6, b.h || 6)) {
                spawnSparkParticles(b.x, b.y, FS_LIGHT, 3);
                e.bullets.splice(j, 1);
            }
        }
    }
    if (o.phase === 1) {
        const far = dir < 0 ? (o.y <= 2) : (o.y >= canvas.height - o.h - 2);
        if (far) {
            o.y = dir < 0 ? 2 : canvas.height - o.h - 2;
            o.phase = 2;
            explosions.push(new Explosion(o.x + o.w / 2, o.y + o.h / 2, 30, 'rgba(255, 126, 182,', 0, owner));
        }
        return false;
    }
    const home = dir < 0 ? (o.y >= laneY) : (o.y <= laneY);
    if (home) { o.y = laneY; o.trail = []; return true; }
    return false;
}

// Kết thúc lướt: 1s sau mọi mục tiêu bị xuyên qua chịu `hits` nhát chém
function fsPhaFinish(owner, hits, n, mult) {
    for (const t of hits) {
        if (!fsTargetAlive(t)) continue;
        bodyEffects.push(new FsSlashMark(owner, t, 60, n, 7, owner.damage * fsPow(owner) * FS_SKILL_NERF * mult));
    }
}

// ==========================================
// Bản sao Phá (Phá cường hóa): 5s, tự đi ngang & tự tung Phá
// ==========================================
class FsClone {
    constructor(owner, x) {
        this.owner = owner; this.w = owner.w; this.h = owner.h;
        this.x = Math.max(0, Math.min(canvas.width - this.w, x));
        this.y = fsLaneY(owner);
        this.life = 300; this.cd = 24 + Math.floor(Math.random() * 20);
        this.phase = 0; this.hits = []; this.trail = [];
        this.side = x < owner.x ? -1 : 1;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        const o = this.owner;
        if (!o || o.hp <= 0) { this.active = false; return; }
        if (this.phase > 0) {
            if (fsDashStep(this, o, fsLaneY(o), fsEvo2(o))) {
                this.phase = 0; fsPhaFinish(o, this.hits, 3, 1); this.hits = [];
                this.cd = 105;
            }
            return;
        }
        if (--this.life <= 0) {
            this.active = false;
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 26, 'rgba(255, 126, 182,', 0, o));
            return;
        }
        // Đi ngang bám theo đối thủ (lệch 1 bên)
        const e = fsEnemy(o);
        const tx = e ? e.x + this.side * 34 : this.x;
        const dx = tx - this.x;
        this.x += Math.max(-2.8, Math.min(2.8, dx));
        this.x = Math.max(0, Math.min(canvas.width - this.w, this.x));
        if (--this.cd <= 0 && this.life > 20) { this.phase = 1; this.hits = []; fsSfx('playDash'); }
    }
    draw() { fsDrawCloneEntity(this, false); }
}

// ==========================================
// Bóng trễ (Evo 1: 3s, Full Evo thêm bóng 5s): đi theo đường cũ & lặp lại vũ điệu
// ==========================================
class FsShadow {
    constructor(owner, delay) {
        this.owner = owner; this.delay = delay; this.w = owner.w; this.h = owner.h;
        this.x = owner.fsHidden ? owner.fsHomeX : owner.x; this.y = fsLaneY(owner);
        this.hist = []; this.queue = []; this.age = 0;
        this.phase = 0; this.hits = []; this.trail = [];
        this.isFsShadow = true; this.active = true;
    }
    update() {
        if (!this.active) return;
        const o = this.owner;
        if (!o || o.weapon !== 'flower_shadow') { this.active = false; return; }
        this.age++;
        // Ghi lại vị trí mỗi 3 tick -> đi theo đúng đường của chủ với độ trễ
        if (this.age % 3 === 0) {
            this.hist.push(Math.round(o.fsHidden ? o.fsHomeX : o.x));
            const keep = Math.ceil(this.delay / 3) + 2;
            if (this.hist.length > keep) this.hist.splice(0, this.hist.length - keep);
        }
        if (o.hp <= 0) return;
        if (this.phase > 0) {
            if (fsDashStep(this, o, fsLaneY(o), fsEvo2(o))) { this.phase = 0; fsPhaFinish(o, this.hits, 5, 0.6); this.hits = []; }
        } else {
            const idx = this.hist.length - Math.ceil(this.delay / 3);
            const tx = idx >= 0 ? this.hist[idx] : this.hist[0];
            if (typeof tx === 'number') this.x += (tx - this.x) * 0.35;
            this.y = fsLaneY(o);
        }
        // Lặp lại vũ điệu
        while (this.queue.length && this.queue[0].at <= this.age) {
            const q = this.queue.shift();
            this.replay(q);
        }
    }
    replay(q) {
        const o = this.owner;
        if (q.dance === 0) {
            fsKhai(o, false, this.x + this.w / 2, fsDir(o) < 0 ? this.y - 4 : this.y + this.h + 4, 0.6, false);
        } else if (q.dance === 1) {
            if (this.phase === 0) { this.phase = 1; this.hits = []; }
        } else if (q.dance === 2) {
            bodyEffects.push(new FsLandStrike(o, q.x, q.y, q.r || 36, 0.5));
        }
        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 22, 'rgba(190, 120, 255,', 0, o));
    }
    draw() { fsDrawCloneEntity(this, true); }
}

// Cú đáp bóng (bóng lặp lại Thiên): cảnh báo rồi giáng xuống
class FsLandStrike {
    constructor(owner, x, y, r, mult) {
        this.owner = owner; this.x = x; this.y = y; this.r = r; this.mult = mult;
        this.delay = 40; this.maxDelay = 40; this.fall = 0; this.active = true;
    }
    update() {
        if (!this.active) return;
        if (this.delay > 0) { if (--this.delay === 0) this.strike(); return; }
        if (++this.fall > 20) this.active = false;
    }
    strike() {
        const o = this.owner, e = fsEnemy(o);
        const dmg = o.damage * fsPow(o) * FS_SKILL_NERF * 6 * this.mult;
        if (e && e.hp > 0 && Math.hypot(e.x + e.w / 2 - this.x, e.y + e.h / 2 - this.y) < this.r + e.w / 2) {
            e.takeDamage(dmg, o);
            e.freezeTimer = Math.max(e.freezeTimer || 0, 45);
        }
        for (const ob of fsObjects(o)) if (Math.hypot(ob.x + ob.w / 2 - this.x, ob.y + ob.h / 2 - this.y) < this.r + ob.w / 2) fsHitObject(o, ob, dmg);
        explosions.push(new Explosion(this.x, this.y, this.r + 8, 'rgba(190, 120, 255,', 0, o));
        triggerScreenShake(3, 6);
    }
    draw() { fsDrawLandStrike(this); }
}

// ==========================================
// Ngôi Sao Trảm (Thiên cường hóa): 2s chém liên tục + hút, rồi nhát kết liễu
// ==========================================
class FsStar {
    constructor(owner, x, y, r, dur = 120, fin = 5) {
        this.owner = owner; this.x = x; this.y = y; this.r = r;
        this.t = 0; this.dur = dur; this.fin = fin; this.done = false; this.active = true;
        this.rot = Math.random() * 6.28;
    }
    inside(e) { return e && e.hp > 0 && Math.hypot(e.x + e.w / 2 - this.x, e.y + e.h / 2 - this.y) < this.r + e.w / 2; }
    update() {
        if (!this.active) return;
        const o = this.owner, e = fsEnemy(o);
        this.t++;
        if (this.t <= this.dur) {
            if (this.inside(e)) {
                addStatusSlow(e, 0.6);
                const dx = this.x - (e.x + e.w / 2);
                e.x += Math.max(-1.3, Math.min(1.3, dx * 0.08));
                e.x = Math.max(0, Math.min(canvas.width - e.w, e.x));
                if (this.t % 15 === 0) e.takeDamage(o.damage * fsPow(o) * FS_SKILL_NERF * 0.4, o);
            }
            if (this.t === this.dur) {
                const fin = o.damage * fsPow(o) * FS_SKILL_NERF * (this.fin || 5);
                if (this.inside(e)) {
                    e.takeDamage(fin, o);
                    addFloatingText(e.x + e.w / 2, e.y - 18, 'VẠN HOA TRẢM! 🌸', FS_DEEP, 15);
                }
                for (const ob of fsObjects(o)) if (Math.hypot(ob.x + ob.w / 2 - this.x, ob.y + ob.h / 2 - this.y) < this.r + ob.w / 2) fsHitObject(o, ob, fin);
                explosions.push(new Explosion(this.x, this.y, this.r * 1.3, 'rgba(255, 61, 139,', 0, o));
                triggerScreenShake(8, 12);
                fsSfx('playExplosion');
            }
        } else if (this.t > this.dur + 24) this.active = false;
    }
    draw() { fsDrawStar(this); }
}

// ==========================================
// Thanh Hoa & thi triển
// ==========================================
// recall=true: hoa thu hồi -> nạp tới trần kho; nguồn khác chỉ tới mức tự hồi
function fsGainHoa(p, amt, x, y, recall = false) {
    const cap = recall ? fsMaxHoa(p) : fsRegenCap(p);
    const cur = p.fsHoa || 0;
    if (cur < cap) p.fsHoa = Math.min(cap, cur + amt);
    if (x !== undefined) spawnSparkParticles(x, y, FS_LIGHT, 3);
}

function fsShadows(p) { return bodyEffects.filter(e => e.isFsShadow && e.owner === p && e.active); }
function fsLogDance(p, rec) {
    for (const s of fsShadows(p)) s.queue.push(Object.assign({ at: s.age + s.delay }, rec));
}

// Trả về số cánh thực sự bắn ra (bị giới hạn bởi số cánh Khai đang có trên sân)
function fsKhai(p, emp, sx, sy, mult = 1, refund = true) {
    const full = fsFull(p);
    const want = emp ? (full ? 5 : 4) : 3;
    const n = Math.max(0, Math.min(want, fsPetalCap(p) - fsKhaiCount(p)));
    if (n <= 0) return 0;
    const spread = (emp ? 0.34 : 0.2) * (n - 1) / Math.max(1, want - 1);
    const dir = fsDir(p), spd = 7.5;
    const dmg = p.damage * fsPow(p) * FS_PETAL_NERF * (emp ? (full ? 1.5 : 1.25) : 1) * mult;
    for (let i = 0; i < n; i++) {
        const a = n > 1 ? (i - (n - 1) / 2) * (spread * 2 / (n - 1)) : 0;
        bodyEffects.push(new FsPetal(p, sx, sy, Math.sin(a) * spd, dir * Math.cos(a) * spd, dmg, { emp, refund, khai: true }));
    }
    return n;
}

function fsCast(p, d) {
    const cost = FS_COST[d];
    if ((p.fsCd || 0) > 0) return;
    if (p.fsHoa < cost) {
        if ((p.fsWarnCd || 0) <= 0) { addFloatingText(p.x + p.w / 2, p.y - 14, 'THIẾU HOA 🥀', '#f9a8d4', 11); p.fsWarnCd = 40; }
        return;
    }
    if (d === 0 && fsKhaiCount(p) >= fsPetalCap(p)) {
        if ((p.fsWarnCd || 0) <= 0) { addFloatingText(p.x + p.w / 2, p.y - 14, `TỐI ĐA ${fsPetalCap(p)} CÁNH 🌸`, '#f9a8d4', 11); p.fsWarnCd = 40; }
        return;
    }
    p.fsHoa -= cost;
    p.fsCd = 18;
    p.fsRegenWait = FS_REGEN_DELAY;
    const emp = !!p.fsEmpowered;
    p.fsEmpowered = false;
    // Bách Hoa Nở Rộ: tiêu hao đủ ngưỡng (Base 75%, Evo 1+: 50%) -> vũ điệu kế tiếp được cường hóa.
    // Đòn cường hóa kích hoạt -> bộ đếm Hoa tiêu hao về 0.
    let bloom = false;
    if (emp) p.fsSpent = 0;
    else {
        p.fsSpent = (p.fsSpent || 0) + cost;
        if (p.fsSpent >= fsBloomNeed(p)) { p.fsSpent = 0; bloom = true; }
    }
    const cx = p.x + p.w / 2;
    addFloatingText(cx, p.y - 16, `${emp ? '✿ ' : ''}${FS_NAME[d]} ${FS_ICON[d]}`, emp ? '#fff0f7' : FS_PINK, emp ? 14 : 12);
    if (d === 0) {
        fsKhai(p, emp, cx, fsDir(p) < 0 ? p.y - 4 : p.y + p.h + 4);
        fsLogDance(p, { dance: 0 });
        fsSfx('playShoot');
    } else if (d === 1) {
        p.fsMode = 'pha'; p.phase = 1; p.hits = []; p.trail = [];
        if (emp) {
            // Full Evo: 2 bản sao; Base / Evo 1: 1 bản sao (phía rộng hơn của sân)
            if (fsFull(p)) {
                bodyEffects.push(new FsClone(p, p.x - 64));
                bodyEffects.push(new FsClone(p, p.x + 64));
            } else {
                const left = p.x + p.w / 2 > canvas.width / 2;
                bodyEffects.push(new FsClone(p, left ? p.x - 64 : p.x + 64));
            }
        }
        fsLogDance(p, { dance: 1 });
        fsSfx('playDash');
    } else {
        fsThienStart(p, emp);
    }
    if (bloom) {
        p.fsEmpowered = true;
        addFloatingText(cx, p.y - 30, 'BÁCH HOA NỞ RỘ! 🌸', '#fff0f7', 13);
        fsSfx('playPowerup');
    }
}

function fsThienStart(p, emp) {
    p.fsMode = 'thien';
    p.fsHidden = true;
    p.fsHomeX = p.x;
    p.fsCircle = {
        x: p.x + p.w / 2, y: fsLaneY(p) + p.h / 2,
        r: emp ? (fsFull(p) ? 54 : 46) : 36, t: 0, max: 300, emp, landing: 0, landMax: FS_LAND_LOCK,
    };
    explosions.push(new Explosion(p.x + p.w / 2, p.y + p.h / 2, 34, 'rgba(255, 126, 182,', 0, p));
    spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, FS_PINK, 14);
    // Biến mất khỏi mặt sàn: dời xe ra ngoài sân (không thể bị nhắm / trúng)
    p.y = p.id === 1 ? canvas.height + 300 : -300 - p.h;
    fsSfx('playDash');
}

function fsThienUpdate(p, inp) {
    const c = p.fsCircle;
    if (!c) { fsReturn(p, p.fsHomeX + p.w / 2); return; }
    const e = fsEnemy(p);
    const e2 = fsEvo2(p);
    // RULE 11: vòng đã khóa (đứng yên, đỏ đặc) 0.5s rồi mới giáng
    if (c.landing > 0) {
        if (--c.landing === 0) fsThienImpact(p);
        return;
    }
    c.t++;
    const dir = fsDir(p);
    const lat = (c.emp ? 4.0 : 3.0) + (e2 ? 0.4 : 0);
    const fwd = c.emp ? 3.0 : 2.2;
    if (inp.l) c.x -= lat;
    if (inp.r) c.x += lat;
    c.x = Math.max(c.r * 0.5, Math.min(canvas.width - c.r * 0.5, c.x));
    // Trôi dần về làn đối thủ
    const stopY = e ? fsLaneY(e) + e.h / 2 : (dir < 0 ? 32 : canvas.height - 32);
    if (dir < 0) c.y = Math.max(stopY, c.y - fwd); else c.y = Math.min(stopY, c.y + fwd);
    // Vòng cảnh báo: làm chậm nhẹ & hút rất nhẹ
    if (e && e.hp > 0 && Math.hypot(e.x + e.w / 2 - c.x, e.y + e.h / 2 - c.y) < c.r + e.w / 2) {
        addStatusSlow(e, e2 ? 0.55 : 0.78);
        const pull = (e2 ? 0.9 : 0.45) + (c.emp ? 0.3 : 0);
        const dx = c.x - (e.x + e.w / 2);
        e.x += Math.max(-pull, Math.min(pull, dx));
        e.x = Math.max(0, Math.min(canvas.width - e.w, e.x));
    }
    if (c.t >= c.max) fsThienLand(p);
}

function fsThienLand(p) {
    const c = p.fsCircle;
    if (!c || c.landing > 0) return;
    c.landMax = FS_LAND_LOCK;
    c.landing = FS_LAND_LOCK;
    fsSfx('playDash');
}

function fsThienImpact(p) {
    const c = p.fsCircle;
    const e = fsEnemy(p);
    const dmg = p.damage * fsPow(p) * FS_SKILL_NERF * (6 + (fsEvo2(p) ? 2 : 0));
    if (e && e.hp > 0 && Math.hypot(e.x + e.w / 2 - c.x, e.y + e.h / 2 - c.y) < c.r + e.w / 2) {
        e.takeDamage(dmg, p);
        e.freezeTimer = Math.max(e.freezeTimer || 0, 90);
        addFloatingText(e.x + e.w / 2, e.y - 16, 'THIÊN GIÁNG! ☄️', FS_DEEP, 15);
    }
    for (const ob of fsObjects(p)) if (Math.hypot(ob.x + ob.w / 2 - c.x, ob.y + ob.h / 2 - c.y) < c.r + ob.w / 2) fsHitObject(p, ob, dmg);
    explosions.push(new Explosion(c.x, c.y, c.r + 14, 'rgba(255, 61, 139,', 0, p));
    explosions.push(new Explosion(c.x, c.y, c.r * 0.6, 'rgba(255, 240, 247,', 0, p));
    spawnSparkParticles(c.x, c.y, FS_PINK, 18);
    triggerScreenShake(7, 10);
    fsSfx('playExplosion');
    fsLogDance(p, { dance: 2, x: c.x, y: c.y, r: c.r });
    if (c.emp) {
        // Full Evo: Ngôi Sao Trảm nguyên bản (2s, kết liễu x5); Base / Evo 1: 1.5s, x3.5
        const full = fsFull(p);
        bodyEffects.push(new FsStar(p, c.x, c.y, c.r * 1.25, full ? 120 : 90, full ? 5 : 3.5));
        p.fsMode = 'star'; p.fsStarT = full ? 120 : 90; p.fsLandX = c.x;
        p.fsCircle = null;
    } else {
        p.fsCircle = null;
        fsReturn(p, c.x);
    }
}

// Lộn về làn ngang của mình (tại hoành độ cú đáp)
function fsReturn(p, cx) {
    p.fsHidden = false;
    p.fsMode = 'idle';
    p.fsCircle = null;
    p.x = Math.max(0, Math.min(canvas.width - p.w, cx - p.w / 2));
    p.y = fsLaneY(p);
    p.invincibleTimer = Math.max(p.invincibleTimer || 0, 12);
    spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, FS_LIGHT, 10);
}

// Full Evo: định kỳ vài cánh hoa tự khóa mục tiêu
function fsAutoPetals(p) {
    const e = fsEnemy(p);
    if (!e || e.hp <= 0) return;
    const h = fsHome(p);
    const dir = fsDir(p);
    for (const off of [-36, 36]) {
        const sx = h.x + off, sy = h.y + dir * 26;
        const ex = e.x + e.w / 2 + (e._vx || 0) * 20, ey = e.y + e.h / 2;
        bodyEffects.push(new FsPetal(p, sx, sy, 0, 0, p.damage * fsPow(p) * FS_PETAL_NERF, { state: 'seekAim', timer: 36, tx: ex, ty: ey, refund: false }));
    }
}

// Hòm đạn: +40% Hoa
(function () {
    const orig = Player.prototype.onCollectAmmoCrate;
    Player.prototype.onCollectAmmoCrate = function (crate) {
        if (this.weapon === 'flower_shadow') {
            fsGainHoa(this, 40);
            addFloatingText(this.x + this.w / 2, this.y - 12, '+40% HOA 🌸', FS_PINK, 12);
            return;
        }
        return orig.apply(this, arguments);
    };
})();

CharHooks.register('flower_shadow', {
    setup() {
        this.maxAmmo = 0; this.ammo = 0;
        this.fsHoa = 100; this.fsDance = 0; this.fsHold = 0; this.fsPrevS = false; this.fsHoldValid = false;
        this.fsSpent = 0; this.fsEmpowered = false; this.fsCd = 0; this.fsWarnCd = 0; this.fsRegenWait = 0;
        this.fsMode = 'idle'; this.fsHidden = false; this.fsHomeX = 0; this.fsCircle = null;
        this.fsStarT = 0; this.fsLandX = 0; this.fsTick = 0; this.fsBotT = 0;
        this.phase = 0; this.hits = []; this.trail = [];
    },
    update(inp, effInp) {
        this.fsTick++;
        if (this.fsCd > 0) this.fsCd--;
        if (this.fsWarnCd > 0) this.fsWarnCd--;
        // Hồi Hoa: chỉ hồi sau 0.5s không dùng vũ điệu (đang múa Phá/Thiên cũng tính là đang dùng)
        if (this.fsMode !== 'idle') this.fsRegenWait = FS_REGEN_DELAY;
        else if (this.fsRegenWait > 0) this.fsRegenWait--;
        if (!(this.fsRegenWait > 0)) {
            const regen = fsFull(this) ? 8 : (fsEvo1(this) ? 6.5 : 4);
            const cap = fsRegenCap(this);
            if (this.fsHoa < cap) this.fsHoa = Math.min(cap, this.fsHoa + regen / 60);
        }

        // Bóng trễ
        if (fsEvo1(this)) {
            const sh = fsShadows(this);
            if (!sh.some(s => s.delay === 180)) bodyEffects.push(new FsShadow(this, 180));
            if (fsFull(this) && !sh.some(s => s.delay === 300)) bodyEffects.push(new FsShadow(this, 300));
        }
        if (fsFull(this) && this.fsTick % 240 === 0) fsAutoPetals(this);

        if (this.fsMode === 'pha') {
            if (fsDashStep(this, this, fsLaneY(this), fsEvo2(this))) {
                this.fsMode = 'idle'; this.phase = 0;
                fsPhaFinish(this, this.hits, 5, 1);
                this.hits = [];
            }
        } else if (this.fsMode === 'thien') {
            fsThienUpdate(this, effInp || inp);
        } else if (this.fsMode === 'star') {
            if (--this.fsStarT <= 0) fsReturn(this, this.fsLandX);
        }

        // Bot phòng tập: tự chọn vũ điệu theo lượng Hoa
        if (this.id === 2 && typeof botAI !== 'undefined' && botAI.enabled && this.fsMode === 'idle' && this.fsHold === 0 && this.fsTick % 30 === 0) {
            const r = Math.random();
            this.fsDance = (this.fsHoa >= 70 && r < 0.35) ? 2 : ((this.fsHoa >= 35 && r < 0.6) ? 1 : 0);
        }
    },
    speed(s) { return this.fsMode === 'idle' ? s : 0; },
    shoot(inp) {
        const s = !!inp.s;
        const pressed = s && !this.fsPrevS, released = !s && this.fsPrevS;
        this.fsPrevS = s;
        if (this.fsMode === 'thien') {
            // Nhấp để đáp xuống ngay
            if (pressed && this.fsCircle && this.fsCircle.t > 6) fsThienLand(this);
            this.fsHoldValid = false; this.fsHold = 0;
            return true;
        }
        if (this.fsMode !== 'idle') { this.fsHoldValid = false; this.fsHold = 0; return true; }
        if (pressed) { this.fsHoldValid = true; this.fsHold = 0; }
        if (s && this.fsHoldValid) {
            this.fsHold++;
            if (this.fsHold >= FS_HOLD_TICKS && (this.fsHold - FS_HOLD_TICKS) % 20 === 0) {
                this.fsDance = (this.fsDance + 1) % 3;
                addFloatingText(this.x + this.w / 2, this.y - 14, `${FS_ICON[this.fsDance]} ${FS_NAME[this.fsDance]}`, FS_PINK, 12);
                fsSfx('playClick');
            }
        } else if (released) {
            if (this.fsHoldValid && this.fsHold < FS_HOLD_TICKS) fsCast(this, this.fsDance);
            this.fsHold = 0; this.fsHoldValid = false;
        }
        return true;
    },
    // Đang ẩn thân (Thiên / Ngôi Sao): không thể bị đánh trúng
    beforeDamage() { return !!this.fsHidden; },
});
