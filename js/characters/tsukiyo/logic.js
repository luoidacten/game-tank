// ==========================================
// Tsukiyo (tsukiyo) — Logic: Nhẫn Giả Thích Ứng
// ------------------------------------------
// Nội Năng (chakra) + 3 phong cách (giữ Bắn 0.75s để đổi): Kỹ Thuật (phi tiêu, hồi Nội Năng) /
// Bí Thuật (kết ấn Hỏa Cầu) / Tất Sát (lướt chém).
// Nhẫn Đạo: đủ mốc Tốc Độ / Sát Thương / Máu (cấp Động Cơ / Bánh Xích / Giáp Thép, Evo 2 & Full Evo
// tính thêm 1 cấp) -> chọn 1 trong 3 nhánh ở shop (lưu vào p.upgrades: 'tsu_s1'..'tsu_h3').
// Kết liễu "NGUYỆT TRẢM" khi đòn của Tsukiyo hạ gục đối thủ.
// Toàn bộ trạng thái là trường thuần trên player / entity trong bodyEffects -> đồng bộ online.
// ==========================================

const TS_CYAN = '#22d3ee', TS_FIRE = '#fb923c', TS_VIO = '#c084fc', TS_MOON = '#e0e7ff', TS_RED = '#f43f5e';
const TS_STYLE_C = [TS_CYAN, TS_FIRE, TS_VIO];
const TS_STYLE_N = ['KỸ THUẬT', 'BÍ THUẬT', 'TẤT SÁT'];
const TS_STYLE_I = ['✦', '🔥', '⚔'];
const TS_MOD = { s: 'speed', d: 'damage', h: 'armor' };
const TS_BR_NAME = {
    s: ['Ảo Ảnh Phi Tiêu', 'Phân Thân Chi Thuật', 'Loạn Trảm Tuyệt Kỹ'],
    d: ['Tam Tinh Tiêu', 'Tam Cấp Kết Ấn & Hắc Nguyệt', 'Cực Tốc Trảm'],
    h: ['Ảo Thân & Đại Phong Ma Tiêu', 'Thổ Lưu Bích', 'Tâm Nhãn Phản Đòn'],
};
const TS_BR_DESC = {
    s: ['Ném phi tiêu -> lướt ngang, để lại Hư Ảnh bắn theo sau 1s.', 'Đầu hiệp gọi 1 Phân Thân (50% chỉ số) sao chép mọi chiêu; bị hạ hồi sinh sau 20s.', 'Lướt trúng địch -> hóa vùng Loạn Trảm 2s (Bất Tử), đủ 50% sát thương vùng -> Choáng; Thu Kiếm -> chém chẻ đôi nổ lớn.'],
    d: ['Bắn 3 phi tiêu hình quạt, bay nhanh & mạnh hơn.', 'Hỏa Cầu to hơn. Giữ kết ấn: 1s Đại Hỏa Cầu | 2s +2 Phân Thân ôm Hỏa Cầu lao tới | 3s bản thể hóa Hắc Nguyệt (vùng Hút + Câm Lặng). Mỗi bậc +15 Nội Năng.', 'Tăng mạnh sát thương & tốc độ lướt kiếm.'],
    h: ['Mỗi lần ném kèm 2 đợt phi tiêu phụ. Né Đòn (8s) -> phát kế tiếp là Đại Phi Tiêu.', 'Niệm Hỏa Cầu tự dựng tường chắn đạn (3 HP, +8 Nội Năng).', 'Thế Tất Sát đứng yên 2s -> Cảnh Giác: phản đạn & Tập Trung 1s (làm mới khi phản tiếp). Hồi 18s.'],
};

function tsE1(p) { return p.hasUpgrade('evo_tsu_1'); }
function tsE2(p) { return p.hasUpgrade('evo_tsu_2'); }
function tsFull(p) { return tsE1(p) && tsE2(p); }
function tsEnemy(p) { return p === p1 ? p2 : p1; }
function tsDir(p) { return p.id === 1 ? -1 : 1; }
function tsAlive(t) { return t && t.hp > 0; }
function tsSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function tsLane(p) { return p.id === 1 ? canvas.height - p.h - 22 : 20; }
function tsHideY(p) { return p.id === 1 ? canvas.height + 300 : -300 - p.h; }
function tsBr(p, k) { for (let i = 1; i <= 3; i++) if (p.hasUpgrade('tsu_' + k + i)) return i; return 0; }
function tsLevel(p, k) { return p.upgrades.filter(u => u === TS_MOD[k]).length + (tsE2(p) ? 1 : 0) + (tsFull(p) ? 1 : 0); }
function tsNeed(p) { return tsE2(p) ? 1 : 2; }
function tsUnlocked(p, k) { return tsLevel(p, k) >= tsNeed(p); }
function tsMaxNN(p) { return tsFull(p) ? 200 : (tsE1(p) ? 150 : 100); }
function tsCost(p, base) { return base * (tsE1(p) ? 0.75 : 1); }
function tsSwitchT(p) { return tsE1(p) ? 30 : 45; }
function tsPow(p) { return tsFull(p) ? 1.3 : (tsE2(p) ? 1.15 : 1); } // Evo 2 / Full: cường hóa các nhánh Nhẫn Đạo
function tsGain(p, n) { p.tsNN = Math.min(tsMaxNN(p), (p.tsNN || 0) + n); }
function tsHitGain(p) { return tsFull(p) ? 15 : (tsE2(p) ? 12 : 8); }
function tsMissGain(p) { return tsFull(p) ? 4 : (tsE1(p) ? 2 : 0); }
function tsOverlap(cx, cy, hw, hh, t) {
    return Math.abs(t.x + t.w / 2 - cx) < hw + t.w / 2 && Math.abs(t.y + t.h / 2 - cy) < hh + t.h / 2;
}
function tsBreakCrates(owner, cx, cy, hw, hh) {
    if (typeof crates === 'undefined') return 0;
    let n = 0;
    for (const c of crates) {
        if (c.active && tsOverlap(cx, cy, hw, hh, c)) { c.active = false; crateOnBreak(c, owner); grantCrateLoot(c, owner); n++; }
    }
    return n;
}
function tsSmallBullet(b) {
    if (!b || b.isLazer || b.isRaycast || b.isBeam || b.isUltimate) return false;
    return (b.w || 6) <= 18 && (b.h || 6) <= 30;
}
function tsClearBullets(p, cx, cy, r) {
    const e = tsEnemy(p);
    let n = 0;
    if (!e || !e.bullets) return 0;
    for (let j = e.bullets.length - 1; j >= 0; j--) {
        const b = e.bullets[j];
        if (!tsSmallBullet(b)) continue;
        if (Math.hypot(b.x + (b.w || 6) / 2 - cx, b.y + (b.h || 6) / 2 - cy) > r) continue;
        e.bullets.splice(j, 1); n++;
        spawnSparkParticles(b.x, b.y, TS_MOON, 2);
    }
    return n;
}
function tsSmoke(x, y, r, color) {
    explosions.push(new Explosion(x, y, r, color || 'rgba(167, 139, 250,', 0, null));
    spawnSparkParticles(x, y, '#94a3b8', 8);
}

// ---------- Entity: Hư Ảnh (Ảo Ảnh Phi Tiêu) ----------
class TsShade {
    constructor(owner, x, y, delay, auto) {
        this.owner = owner; this.x = x; this.y = y;
        this.delay = delay; this.auto = auto; this.t = 0; this.fired = false; this.active = true;
    }
    update() {
        if (!this.active) return;
        this.t++;
        const o = this.owner, e = tsEnemy(o);
        if (!this.fired && this.t >= this.delay) {
            this.fired = true;
            const dir = tsDir(o), sy = this.y + dir * 14, dmg = 0.5 * o.damage * tsPow(o);
            if (this.auto && e && tsAlive(e)) {
                for (const off of [-7, 7]) {
                    const v = aimVelocity(this.x + off, sy, e, 10, true);
                    spawnBullet(o, { x: this.x + off - 4, y: sy - 4, w: 8, h: 8, vx: v.vx, vy: v.vy, dmg, hook: 'tsukiyo', ts: 'shw' });
                }
            } else {
                spawnBullet(o, { x: this.x - 4, y: sy - 4, w: 8, h: 8, vx: 0, vy: dir * 9, dmg, hook: 'tsukiyo', ts: 'shw' });
            }
            spawnSparkParticles(this.x, this.y, TS_CYAN, 5);
        }
        if (this.t >= this.delay + 18) this.active = false;
    }
    draw() { if (typeof tsDrawShade === 'function') tsDrawShade(this); }
}

// ---------- Entity: Phân Thân (Phân Thân Chi Thuật) — khối isStone: chặn đạn địch, có máu ----------
class TsClone {
    constructor(owner) {
        this.owner = owner; this.w = 22; this.h = 22;
        this.side = owner.x + owner.w / 2 < canvas.width / 2 ? 1 : -1;
        this.x = Math.max(0, Math.min(canvas.width - this.w, owner.x + owner.w / 2 + this.side * 40 - this.w / 2));
        this.y = tsLane(owner) + (owner.h - this.h) / 2;
        this.maxHp = Math.max(1, Math.round(owner.maxHp * (tsFull(owner) ? 0.8 : 0.5) * 4) / 4);
        this.hp = this.maxHp; this.isStone = true; this.away = 0; this.t = 0; this.active = true;
    }
    update() {
        const o = this.owner;
        if (!this.active) { // vừa bị bắn hạ (combat đặt active=false)
            if (!this.dead) { this.dead = true; tsCloneDied(o, this); }
            return;
        }
        this.t++;
        if (this.away > 0) { this.away--; this.isStone = this.away <= 0; }
        const homeX = o.y === tsHideY(o) ? (o.tsHomeX || o.x) : o.x;
        let tx = homeX + o.w / 2 + this.side * 40;
        if (tx < 14 || tx > canvas.width - 14) { this.side = -this.side; tx = homeX + o.w / 2 + this.side * 40; }
        const cx = this.x + this.w / 2;
        this.x += (tx - cx) * 0.18;
        this.x = Math.max(0, Math.min(canvas.width - this.w, this.x));
        this.y = tsLane(o) + (o.h - this.h) / 2;
    }
    draw() { if (typeof tsDrawClone === 'function') tsDrawClone(this); }
}
function tsCloneOf(p) { return bodyEffects.find(e => e instanceof TsClone && e.owner === p && e.active); }
function tsCloneDied(p, c) {
    p.tsCloneT = tsFull(p) ? 600 : 1200;
    const x = c.x + c.w / 2, y = c.y + c.h / 2;
    tsSmoke(x, y, 34);
    addFloatingText(x, y - 14, 'PHÂN THÂN TAN', '#94a3b8', 11);
    if (tsFull(p)) { // Chân Ảnh: nổ Khói Mù xóa đạn + hồi 25 Nội Năng
        tsClearBullets(p, x, y, 80);
        tsSmoke(x, y, 70, 'rgba(148, 163, 184,');
        tsGain(p, 25);
        addFloatingText(x, y - 26, 'KHÓI MÙ +25', TS_MOON, 12);
    }
}
// Phân Thân sao chép chiêu (50% / Full 80% sức mạnh)
function tsCloneCopy(p, style) {
    const c = tsCloneOf(p);
    if (!c || c.away > 0) return;
    const k = tsFull(p) ? 0.8 : 0.5, dir = tsDir(p), cx = c.x + c.w / 2, fy = dir < 0 ? c.y - 8 : c.y + c.h + 2;
    if (style === 0) spawnBullet(p, { x: cx - 4, y: fy, w: 8, h: 8, vx: 0, vy: dir * 9, dmg: p.damage * k, hook: 'tsukiyo', ts: 'cln' });
    else if (style === 1) spawnBullet(p, { x: cx - 7, y: fy, w: 14, h: 14, vx: 0, vy: dir * 6, dmg: p.damage * k, hook: 'tsukiyo', ts: 'fire', tier: 0, boomK: k });
    else spawnBullet(p, { x: cx - 13, y: fy, w: 26, h: 10, vx: 0, vy: dir * 10, dmg: 2.5 * p.damage * k, hook: 'tsukiyo', ts: 'cres' });
    spawnSparkParticles(cx, c.y + c.h / 2, TS_STYLE_C[style], 4);
}

// ---------- Entity: Thổ Lưu Bích ----------
class TsWall {
    constructor(owner) {
        const dir = tsDir(owner);
        this.owner = owner; this.w = 46; this.h = 10;
        this.x = Math.max(0, Math.min(canvas.width - this.w, owner.x + owner.w / 2 - this.w / 2));
        this.y = dir < 0 ? owner.y - 30 : owner.y + owner.h + 20;
        this.maxHp = tsFull(owner) ? 6 : 3; this.hp = this.maxHp;
        this.isStone = true; this.life = 420; this.t = 0; this.burst = false; this.active = true;
    }
    update() {
        const o = this.owner;
        if (!this.active) { if (this.hp <= 0 && !this.burst) this.boom(); return; }
        this.t++;
        if (--this.life <= 0) { this.active = false; tsSmoke(this.x + this.w / 2, this.y + this.h / 2, 24, 'rgba(161, 98, 7,'); return; }
        // Full Evo: Hỏa Cầu của chính mình bay xuyên qua tường -> tường nổ phản hỏa
        if (tsFull(o) && o.bullets) {
            for (const b of o.bullets) {
                if (b.ts === 'fire' && !b.wallLit && rectIntersect(b.x, b.y, b.w, b.h, this.x, this.y, this.w, this.h)) {
                    b.wallLit = true; this.active = false; this.boom(); return;
                }
            }
        }
    }
    boom() {
        this.burst = true;
        const o = this.owner, cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        tsSmoke(cx, cy, 30, 'rgba(234, 88, 12,');
        if (!tsFull(o)) return;
        const e = tsEnemy(o), dir = tsDir(o);
        for (let i = -1; i <= 1; i++) { // Hỏa Long Thành Lũy: 3 tia lửa bắn trả
            const v = e && tsAlive(e) ? aimVelocity(cx + i * 14, cy, e, 8, false) : { vx: 0, vy: dir * 8 };
            spawnBullet(o, { x: cx + i * 14 - 4, y: cy - 4, w: 8, h: 14, vx: v.vx + i * 1.2, vy: v.vy, dmg: 0.8 * o.damage, hook: 'tsukiyo', ts: 'ember' });
        }
        addFloatingText(cx, cy - 12, 'PHẢN HỎA!', TS_FIRE, 12);
    }
    draw() { if (typeof tsDrawWall === 'function') tsDrawWall(this); }
}

// ---------- Entity: Vũng Lửa (Full Evo Hỏa Cầu) ----------
class TsFirePool {
    constructor(owner, x, y, r) {
        this.owner = owner; this.x = x; this.y = y; this.r = r;
        this.life = 150; this.maxLife = 150; this.t = 0; this.active = true;
    }
    update() {
        if (!this.active) return;
        this.t++;
        if (--this.life <= 0) { this.active = false; return; }
        const o = this.owner, e = tsEnemy(o);
        if (this.t % 20 === 0 && e && tsAlive(e) && zoneDist(e.x + e.w / 2 - this.x, e.y + e.h / 2 - this.y) < this.r) {
            e.takeDamage(0.3 * o.damage, o);
            spawnSparkParticles(e.x + e.w / 2, e.y + e.h / 2, TS_FIRE, 3);
        }
    }
    draw() { if (typeof tsDrawFirePool === 'function') tsDrawFirePool(this); }
}

// ---------- Entity: Phân Thân lao tới ôm Hỏa Cầu (Tam Cấp Kết Ấn bậc 2+) ----------
class TsRush {
    constructor(owner, x, inv) {
        this.owner = owner; this.w = 20; this.h = 20; this.inv = !!inv;
        this.x = Math.max(0, Math.min(canvas.width - this.w, x - this.w / 2));
        this.y = owner.y + (owner.h - this.h) / 2;
        this.vy = tsDir(owner) * 8.5;
        this.isStone = !this.inv;                      // phân thân phụ có thể bị bắn hạ trên đường lao
        this.maxHp = tsFull(owner) ? 2 : 1; this.hp = this.maxHp; // Full Evo: thêm 1 lớp khiên
        this.t = 0; this.done = false; this.active = true;
    }
    update() {
        const o = this.owner;
        if (!this.active) { if (!this.done) { this.done = true; tsSmoke(this.x + this.w / 2, this.y + this.h / 2, 26); } return; }
        this.t++;
        this.y += this.vy;
        const e = tsEnemy(o), cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const far = this.vy < 0 ? this.y <= 4 : this.y >= canvas.height - this.h - 4;
        if (far || (e && tsAlive(e) && rectIntersect(this.x, this.y, this.w, this.h, e.x, e.y, e.w, e.h))) {
            this.done = true; this.active = false;
            explosions.push(new Explosion(cx, cy, 52, 'rgba(251, 146, 60,', 1.2 * o.damage * tsPow(o), o));
            triggerScreenShake(4, 8);
            tsSfx('playExplosion');
        }
    }
    draw() { if (typeof tsDrawRush === 'function') tsDrawRush(this); }
}

// ---------- Entity: Vùng Hắc Nguyệt (Hút + Câm Lặng) ----------
class TsVoid {
    constructor(owner, x, y) {
        const f = tsFull(owner);
        this.owner = owner; this.x = x; this.y = y;
        this.r = 56 * (f ? 1.4 : 1); this.life = f ? 270 : 180; this.maxLife = this.life; this.t = 0; this.active = true;
    }
    update() {
        if (!this.active) return;
        this.t++;
        if (--this.life <= 0) { this.active = false; return; }
        const o = this.owner, e = tsEnemy(o);
        if (!e || !tsAlive(e)) return;
        const dx = this.x - (e.x + e.w / 2);
        if (Math.abs(dx) < this.r * 1.7 && Math.abs(e.y + e.h / 2 - this.y) < this.r) {
            if (Math.abs(dx) > 2) e.x += Math.sign(dx) * 1.1;
            e.x = Math.max(0, Math.min(canvas.width - e.w, e.x));
            if (Math.abs(dx) < this.r) {
                e.silenceTimer = Math.max(e.silenceTimer || 0, 6);
                if (tsFull(o) && this.t % 15 === 0) e.takeDamage(e.maxHp * 0.05 / 4, o, { bypassShield: true }); // 5% Max HP/giây
            }
        }
    }
    draw() { if (typeof tsDrawVoid === 'function') tsDrawVoid(this); }
}

// ---------- Entity: Loạn Trảm ----------
class TsLoan {
    constructor(owner, x, y) {
        const big = tsBr(owner, 'd') === 3;
        this.owner = owner; this.x = x; this.y = y;
        this.r = big ? 52 : 34; this.big = big;
        this.life = 120; this.t = 0; this.hits = 0; this.total = 15; this.stunned = false;
        this.pull = big && tsFull(owner);
        this.seed = Math.round(Math.random() * 600) / 100; this.final = 0; this.active = true;
    }
    update() {
        if (!this.active) return;
        this.t++;
        const o = this.owner, e = tsEnemy(o);
        if (this.final > 0) { if (++this.final > 24) this.active = false; return; }
        const inside = e && tsAlive(e) && tsOverlap(this.x, this.y, this.r, this.r * 0.75, e);
        if (this.pull && e && tsAlive(e) && Math.abs(e.x + e.w / 2 - this.x) < this.r * 1.8) {
            e.x += Math.sign(this.x - (e.x + e.w / 2)) * 0.8;
        }
        if (this.t % 8 === 0) {
            if (inside) {
                e.takeDamage(0.12 * o.damage * tsPow(o), o);
                this.hits++;
                fxSlashHit(e.x + e.w / 2 + (Math.random() - 0.5) * 16, e.y + e.h / 2 + (Math.random() - 0.5) * 10, this.big ? '#e9d5ff' : TS_VIO, 16);
                const need = Math.ceil(this.total * (tsFull(o) ? 0.35 : 0.5));
                if (!this.stunned && this.hits >= need) {
                    this.stunned = true;
                    e.freezeTimer = Math.max(e.freezeTimer || 0, tsFull(o) ? 75 : 60);
                    addFloatingText(e.x + e.w / 2, e.y - 16, 'CHOÁNG!', TS_VIO, 13);
                }
            }
            tsBreakCrates(o, this.x, this.y, this.r, this.r * 0.75);
            tsSfx('playHit');
        }
        if (this.t >= this.life) { // Hắc Ảnh nhập thể -> chém chẻ đôi + nổ
            this.final = 1;
            const f = tsFull(o);
            if (e && tsAlive(e) && f && tsOverlap(this.x, this.y, this.r * 1.3, this.r, e)) e.shield = 0;
            explosions.push(new Explosion(this.x, this.y, this.r * 1.35, 'rgba(192, 132, 252,', 1.5 * o.damage * tsPow(o) * (f ? 1.5 : 1), o));
            bodyEffects.push(new TsStreak(this.x, this.y, o.x + o.w / 2, o.y + o.h / 2, 14, 1));
            fxSweep(this.x, this.y, this.r * 1.2, -0.6, Math.PI - 0.6, '#ffffff', 16, 10);
            if (f) fxSweep(this.x, this.y, this.r * 1.2, 0.6, Math.PI + 0.6, TS_MOON, 16, 10);
            triggerScreenShake(7, 12);
            addFloatingText(this.x, this.y - 26, f ? 'VÔ ẢNH TUYỆT SÁT!' : 'THU KIẾM TRẢM!', '#f5f3ff', 14);
            tsSfx('playExplosion');
        }
    }
    draw() { if (typeof tsDrawLoan === 'function') tsDrawLoan(this); }
}

// ---------- Entity: Vệt bóng (thuần hình ảnh): kind 0 = đường kiếm đen, 1 = Hắc Ảnh ----------
class TsStreak {
    constructor(x0, y0, x1, y1, dur, kind) {
        this.x0 = x0; this.y0 = y0; this.x1 = x1; this.y1 = y1; this.dur = dur; this.kind = kind; this.t = 0; this.active = true;
    }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof tsDrawStreak === 'function') tsDrawStreak(this); }
}

// ---------- Entity: Đại Phi Tiêu ----------
class TsBigStar {
    constructor(owner, x, y, vx, vy, r, dmg, opt) {
        this.owner = owner; this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.r = r; this.dmg = dmg; this.absorb = !!opt.absorb; this.mark = !!opt.mark;
        this.eaten = 0; this.hitE = false; this.t = 0; this.active = true;
    }
    update() {
        if (!this.active) return;
        this.t++;
        const o = this.owner, e = tsEnemy(o);
        this.x += this.vx; this.y += this.vy;
        if (this.x < this.r || this.x > canvas.width - this.r) { this.vx = -this.vx; this.x = Math.max(this.r, Math.min(canvas.width - this.r, this.x)); }
        if (this.absorb) {
            const n = tsClearBullets(o, this.x, this.y, this.r + 6);
            if (n) { this.eaten += n; this.r = Math.min(34, this.r + 1.4 * n); }
        }
        tsBreakCrates(o, this.x, this.y, this.r * 0.8, this.r * 0.8);
        if (e && tsAlive(e) && !this.hitE && tsOverlap(this.x, this.y, this.r * 0.8, this.r * 0.8, e)) {
            this.hitE = true;
            e.takeDamage(this.dmg, o);
            fxSlashHit(e.x + e.w / 2, e.y + e.h / 2, TS_CYAN, 24);
            tsGain(o, tsHitGain(o));
            if (this.mark) {
                o.tsMarked = 1;
                addFloatingText(e.x + e.w / 2, e.y - 16, 'ĐÁNH DẤU!', TS_RED, 12);
                if (o.tsMode === 'idle') tsVanish(o);
            }
            if (!this.absorb) { this.active = false; return; }
        }
        if (this.y < -this.r || this.y > canvas.height + this.r) {
            this.active = false;
            if (this.absorb) { // nổ lớn ở cuối đường
                const ex = this.x, ey = Math.max(10, Math.min(canvas.height - 10, this.y));
                const bonus = Math.min(1.5, this.eaten * (tsFull(o) ? 0.25 : 0.1));
                explosions.push(new Explosion(ex, ey, 40 + this.r * 1.5, 'rgba(34, 211, 238,', 1.5 * o.damage + bonus, o));
                triggerScreenShake(5, 8);
                tsSfx('playExplosion');
            }
        }
    }
    draw() { if (typeof tsDrawBigStar === 'function') tsDrawBigStar(this); }
}

// ---------- Entity: Kết liễu NGUYỆT TRẢM ----------
class TsFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.ang = Math.round((-0.42 + (Math.random() - 0.5) * 0.4) * 100) / 100;
        this.seed = Math.round(Math.random() * 1000) / 100;
        this.t = 0; this.dur = 110; this.active = true;
    }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof tsDrawFinisher === 'function') tsDrawFinisher(this); }
    drawOver() { if (typeof tsDrawFinisherOver === 'function') tsDrawFinisherOver(this); }
}

// ==========================================
// Kỹ năng
// ==========================================
function tsFront(p) { return tsDir(p) < 0 ? p.y - 10 : p.y + p.h + 2; }

// Phi tiêu (wave: đợt phụ / không lướt)
function tsThrow(p, wave) {
    const dir = tsDir(p), cx = p.x + p.w / 2, fy = tsFront(p);
    const d1 = tsBr(p, 'd') === 1, full = tsFull(p);
    if (!wave && p.tsBigNext) { tsThrowBig(p); return; }
    const n = d1 ? (full ? 5 : 3) : 1;
    const spd = 9 * (d1 ? 1.2 : 1) * (full ? 1.4 : 1);
    const dmg = p.damage * (d1 ? 1.1 * tsPow(p) : 1) * (wave ? 0.3 : 1);
    for (let i = 0; i < n; i++) {
        const a = n > 1 ? (i - (n - 1) / 2) * 0.17 : 0;
        const edge = n === 5 && (i === 0 || i === 4);
        spawnBullet(p, {
            x: cx - 4.5, y: fy, w: 9, h: 9, vx: Math.sin(a) * spd, vy: dir * Math.cos(a) * spd, dmg,
            hook: 'tsukiyo', ts: wave ? 'shw' : 'shu', isPiercing: full, tsPierce: 1, tsBounce: edge ? 1 : 0, tsHit: false,
        });
    }
    if (wave) return;
    // Ảo Ảnh Phi Tiêu: lướt ngang + để lại Hư Ảnh
    if (tsBr(p, 's') === 1) {
        const shades = bodyEffects.filter(e => e instanceof TsShade && e.owner === p && !e.fired).length;
        if (shades < 1) bodyEffects.push(new TsShade(p, cx, p.y + p.h / 2, full ? 30 : 60, full));
        let sd = p.tsMoveDir || p.tsSideDir || 1;
        const dist = 44 * (full ? 1.3 : 1) * (tsE2(p) ? 1.1 : 1);
        if ((sd > 0 && p.x + p.w + dist > canvas.width - 2) || (sd < 0 && p.x - dist < 2)) sd = -sd;
        p.x = Math.max(0, Math.min(canvas.width - p.w, p.x + sd * dist));
        p.tsSideDir = -sd; p.tsSideFx = 10; p.tsSideFrom = cx;
    }
    // Ảo Thân: 2 đợt phi tiêu phụ
    if (tsBr(p, 'h') === 1) p.tsWaves = [8, 16];
}

function tsThrowBig(p) {
    p.tsBigNext = false;
    const dir = tsDir(p), cx = p.x + p.w / 2, fy = tsFront(p);
    const full = tsFull(p), big = full ? 1.5 : 1;
    const r = 13 * big, dmg = 2.5 * p.damage * tsPow(p) * big;
    const absorb = tsBr(p, 'd') === 1, mark = tsBr(p, 's') === 3;
    if (mark) {
        for (const off of [-13, 13]) bodyEffects.push(new TsBigStar(p, cx + off, fy, 0, dir * 8, r * 0.65, dmg * 0.55, { absorb, mark }));
    } else bodyEffects.push(new TsBigStar(p, cx, fy, 0, dir * 7.5, r, dmg, { absorb, mark }));
    addFloatingText(cx, p.y - 18, 'ĐẠI PHONG MA TIÊU!', TS_CYAN, 13);
    triggerScreenShake(3, 6);
}

// Biến mất -> 1s sau hiện thân chém các mục tiêu bị Đánh Dấu
function tsVanish(p) {
    p.tsMode = 'vanish'; p.tsT = 60; p.tsHomeX = p.x;
    tsSmoke(p.x + p.w / 2, p.y + p.h / 2, 30);
    p.y = tsHideY(p);
    p.invincibleTimer = Math.max(p.invincibleTimer || 0, 62);
    tsSfx('playDash');
}
function tsVanishEnd(p) {
    p.tsMode = 'idle';
    const e = tsEnemy(p), full = tsFull(p);
    p.y = tsLane(p);
    if (e && tsAlive(e) && p.tsMarked) {
        p.x = Math.max(0, Math.min(canvas.width - p.w, e.x + e.w / 2 - p.w / 2));
        const n = full ? 2 : 1;
        for (let i = 0; i < n && tsAlive(e); i++) e.takeDamage(1.6 * p.damage * tsPow(p), p, { unavoidable: i > 0 });
        bodyEffects.push(new TsStreak(e.x + e.w / 2, e.y + e.h / 2, p.x + p.w / 2, p.y + p.h / 2, 14, 0));
        fxSweep(e.x + e.w / 2, e.y + e.h / 2, 30, -0.8, 2.3, '#ffffff', 14, 9);
        if (full) fxSweep(e.x + e.w / 2, e.y + e.h / 2, 30, 0.8, 3.9, TS_RED, 16, 9);
        addFloatingText(e.x + e.w / 2, e.y - 18, 'ẢNH SÁT!', TS_RED, 14);
        triggerScreenShake(5, 8);
    } else p.x = p.tsHomeX;
    if (full) p.invincibleTimer = Math.max(p.invincibleTimer || 0, 60);
    p.tsMarked = 0;
    tsSmoke(p.x + p.w / 2, p.y + p.h / 2, 26);
}

// Hỏa Cầu theo bậc (0 thường, 1 Đại Hỏa Cầu)
function tsFireball(p, tier) {
    const dir = tsDir(p), cx = p.x + p.w / 2, full = tsFull(p), d2 = tsBr(p, 'd') === 2;
    const w = tier >= 1 ? 32 : (d2 ? 20 : 15);
    spawnBullet(p, {
        x: cx - w / 2, y: dir < 0 ? p.y - w : p.y + p.h, w, h: w, vx: 0, vy: dir * 6 * (full ? 1.35 : 1),
        dmg: p.damage * (tier >= 1 ? 1.5 : 1), hook: 'tsukiyo', ts: 'fire', tier, boomK: 1,
    });
    tsSfx('playShoot');
}
function tsFireBoom(b, owner, x, y) {
    if (b.boomed) return;
    b.boomed = true;
    const full = tsFull(owner), d2 = tsBr(owner, 'd') === 2;
    const k = b.boomK || 1;
    let R = b.tier >= 1 ? 76 : (d2 ? 50 : 40), dmg = (b.tier >= 1 ? 2.6 : 2) * owner.damage * k * (d2 ? 1.15 * tsPow(owner) : 1);
    if (full) R *= 1.3;
    explosions.push(new Explosion(x, y, R, 'rgba(251, 146, 60,', dmg, owner));
    if (full && k >= 1) bodyEffects.push(new TsFirePool(owner, x, y, R * 0.6));
    triggerScreenShake(b.tier >= 1 ? 6 : 3, 8);
    tsSfx('playExplosion');
}

function tsReleaseCharge(p) {
    const tier = p.tsTier || 0;
    p.tsMode = 'idle'; p.tsCharge = 0; p.tsTier = 0;
    p.tsGcd = 20; p.tsRegenWait = 60;
    const cx = p.x + p.w / 2;
    if (tier >= 2) {
        for (const off of [-42, 42]) bodyEffects.push(new TsRush(p, cx + off, false));
        const c = tsCloneOf(p);
        if (c && c.away <= 0) { bodyEffects.push(new TsRush(p, c.x + c.w / 2, true)); c.away = 70; c.isStone = false; }
        addFloatingText(cx, p.y - 20, tier >= 3 ? 'HẮC NGUYỆT!' : 'ẢNH PHÂN THÂN HỎA CẦU!', tier >= 3 ? TS_VIO : TS_FIRE, 14);
    }
    if (tier >= 3) { tsStartMoon(p); return; }
    tsFireball(p, tier >= 1 ? 1 : 0);
    if (tier === 1) addFloatingText(cx, p.y - 20, 'ĐẠI HỎA CẦU!', TS_FIRE, 14);
}

// Lướt chém (Tất Sát) / Hắc Nguyệt (moon)
function tsDashSpeed(p) { return 15 * (tsBr(p, 'd') === 3 ? 1.3 : 1) * (tsFull(p) ? 1.5 : 1); }
function tsStartDash(p, kind) {
    p.tsMode = kind; p.tsPhase = 1; p.tsDashHit = false; p.tsTrail = [];
    p.invincibleTimer = Math.max(p.invincibleTimer || 0, 4);
    tsSfx('playDash');
}
function tsStartMoon(p) { tsStartDash(p, 'moon'); }
function tsSwordHit(p, e) {
    const full = tsFull(p), d3 = tsBr(p, 'd') === 3;
    let dmg = 3 * p.damage * (d3 ? (full ? 1.8 : 1.4) : 1);
    if (d3 && full && e.hp < e.maxHp * 0.25) { dmg *= 1.5; addFloatingText(e.x + e.w / 2, e.y - 26, 'NHẤT KÍCH TẤT SÁT!', '#fde047', 13); }
    if (full && e.shield > 0) { e.takeDamage(dmg * 0.5, p); if (tsAlive(e)) e.takeDamage(dmg * 0.5, p, { bypassShield: true }); }
    else e.takeDamage(dmg, p);
    if (full && tsAlive(e)) { e.bleedTimer = Math.max(e.bleedTimer || 0, 180); e.bleedDmg = Math.max(e.bleedDmg || 0, 0.02); }
    fxSlashHit(e.x + e.w / 2, e.y + e.h / 2, TS_VIO, 26);
    spawnSparkParticles(e.x + e.w / 2, e.y + e.h / 2, '#ffffff', 10);
    triggerScreenShake(4, 6);
}
function tsDashStep(p) {
    const dir = tsDir(p), moon = p.tsMode === 'moon';
    const spd = moon ? 13 : tsDashSpeed(p);
    p.y += p.tsPhase === 1 ? dir * spd : -dir * spd * 0.8;
    p.tsTrail.unshift(Math.round(p.y));
    if (p.tsTrail.length > 7) p.tsTrail.length = 7;
    p.invincibleTimer = Math.max(p.invincibleTimer || 0, 2);
    const e = tsEnemy(p), cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    if (p.tsPhase === 1) {
        if (tsFull(p) && !moon) tsClearBullets(p, cx, cy, p.w);
        tsBreakCrates(p, cx, cy, p.w / 2, p.h / 2);
        const touch = e && tsAlive(e) && !p.tsDashHit && rectIntersect(p.x, p.y, p.w, p.h, e.x, e.y, e.w, e.h);
        const far = dir < 0 ? (p.y <= 2) : (p.y >= canvas.height - p.h - 2);
        if (moon && (touch || far)) {
            p.tsDashHit = true;
            const x = cx, y = touch ? e.y + e.h / 2 : cy;
            explosions.push(new Explosion(x, y, 80, 'rgba(139, 92, 246,', 2.5 * p.damage * tsPow(p), p));
            bodyEffects.push(new TsVoid(p, x, y));
            triggerScreenShake(9, 14);
            addFloatingText(x, y - 24, 'HẮC NGUYỆT GIÁNG!', TS_VIO, 15);
            tsSfx('playExplosion');
            p.tsPhase = 2;
            return;
        }
        if (touch) {
            p.tsDashHit = true;
            tsSwordHit(p, e);
            if (tsBr(p, 's') === 3) { // Loạn Trảm: hóa thành vùng chém
                bodyEffects.push(new TsLoan(p, e.x + e.w / 2, e.y + e.h / 2));
                p.tsMode = 'loan'; p.tsT = 60; p.tsLoanX = e.x + e.w / 2; p.tsLoanY = e.y + e.h / 2;
                p.tsHomeX = p.x; p.y = tsHideY(p); p.tsTrail = [];
                p.invincibleTimer = Math.max(p.invincibleTimer || 0, 62);
                addFloatingText(e.x + e.w / 2, e.y - 28, 'LOẠN TRẢM!', TS_VIO, 15);
                return;
            }
        }
        if (far) { p.y = dir < 0 ? 2 : canvas.height - p.h - 2; p.tsPhase = 2; }
        return;
    }
    const lane = tsLane(p);
    const home = dir < 0 ? (p.y >= lane) : (p.y <= lane);
    if (home) { p.y = lane; p.tsMode = 'idle'; p.tsPhase = 0; p.tsTrail = []; }
}

function tsCast(p) {
    if (p.tsGcd > 0) return;
    const style = p.tsStyle || 0, cx = p.x + p.w / 2;
    let cost = tsCost(p, [3, 25, 30][style]);
    const wall = style === 1 && tsBr(p, 'h') === 2;
    if (wall && !tsFull(p)) cost += 8;
    if (p.tsNN < cost) {
        if ((p.tsWarnCd || 0) <= 0) { addFloatingText(cx, p.y - 14, 'THIẾU NỘI NĂNG', '#94a3b8', 11); p.tsWarnCd = 40; }
        return;
    }
    p.tsNN -= cost; p.tsRegenWait = 60;
    if (style === 0) { tsThrow(p, false); p.tsGcd = 20; tsSfx('playShoot'); }
    else if (style === 1) {
        p.tsMode = 'seal'; p.tsT = tsFull(p) ? 15 : 30; p.tsSealMax = p.tsT; p.tsGcd = 20;
        if (wall) bodyEffects.push(new TsWall(p));
        tsSfx('playClick');
    } else { tsStartDash(p, 'dash'); p.tsGcd = 24; }
    tsCloneCopy(p, style);
}

function tsSwitch(p) {
    p.tsStyle = ((p.tsStyle || 0) + 1) % 3;
    p.tsAlert = false; p.tsStill = 0; p.tsSwitchFx = 20;
    addFloatingText(p.x + p.w / 2, p.y - 18, TS_STYLE_I[p.tsStyle] + ' ' + TS_STYLE_N[p.tsStyle], TS_STYLE_C[p.tsStyle], 12);
    spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, TS_STYLE_C[p.tsStyle], 8);
    tsSfx('playClick');
}

BulletHooks.register('tsukiyo', {
    hit(b, attacker, victim) {
        const x = b.x + b.w / 2, y = b.y + b.h / 2;
        if (!attacker) return;
        if (b.ts === 'shu' || b.ts === 'shw') {
            b.tsHit = true;
            tsGain(attacker, b.ts === 'shu' ? tsHitGain(attacker) : Math.round(tsHitGain(attacker) / 2));
            spawnSparkParticles(x, y, TS_CYAN, 4);
        } else if (b.ts === 'fire') tsFireBoom(b, attacker, x, y);
        else if (b.ts === 'cres' || b.ts === 'refl') fxSlashHit(x, y, TS_VIO, 18);
    },
    obstacle(b, owner, obj) {
        const x = b.x + b.w / 2, y = b.y + b.h / 2;
        if (b.ts === 'shu' || b.ts === 'shw') {
            b.tsHit = true;
            if (b.ts === 'shu') tsGain(owner, tsHitGain(owner));
            if (b.isPiercing) { if (b.tsPierce > 0) b.tsPierce--; else b.isPiercing = false; }
        } else if (b.ts === 'fire' && !(obj && obj.owner === owner)) tsFireBoom(b, owner, x, y);
    },
    edge(b, owner) {
        const side = b.x <= 0 || b.x >= canvas.width;
        if (side && b.tsBounce > 0) {
            b.tsBounce--; b.vx = -b.vx;
            b.x = Math.max(1, Math.min(canvas.width - b.w - 1, b.x));
            return 'keep';
        }
        if (b.ts === 'shu' && !b.tsHit) { const g = tsMissGain(owner); if (g > 0) tsGain(owner, g); }
        if (b.ts === 'fire') tsFireBoom(b, owner, Math.max(8, Math.min(canvas.width - 8, b.x + b.w / 2)), Math.max(8, Math.min(canvas.height - 8, b.y + b.h / 2)));
    },
    draw(b) { if (typeof tsDrawBullet === 'function') tsDrawBullet(b); },
});

CharHooks.register('tsukiyo', {
    setup() {
        const steps = (tsE2(this) ? 1 : 0) + (tsFull(this) ? 1 : 0);
        this.maxHp += steps; this.speed += 0.25 * steps; this.damage *= Math.pow(1.25, steps); // "+0.25 Sát thương" hiểu là +25%
        // Bot luyện tập: tự chọn nhánh Nhẫn Đạo đã mở khóa
        if (typeof botAI !== 'undefined' && botAI.enabled && this.id === 2) {
            for (const k of ['s', 'd', 'h']) if (tsUnlocked(this, k) && !tsBr(this, k)) this.upgrades.push('tsu_' + k + (1 + Math.floor(Math.random() * 3)));
        }
        this.tsNN = tsMaxNN(this); this.tsStyle = 0;
        this.tsHold = 0; this.tsPrevS = false; this.tsHoldUsed = false; this.tsMoveDir = 0; this.tsSideDir = 1;
        this.tsMode = 'idle'; this.tsT = 0; this.tsPhase = 0; this.tsGcd = 0; this.tsRegenWait = 0; this.tsWarnCd = 0;
        this.tsTrail = []; this.tsDashHit = false; this.tsHomeX = this.x; this.tsLoanX = 0; this.tsLoanY = 0;
        this.tsCharge = 0; this.tsTier = 0; this.tsSealMax = 30; this.tsWaves = [];
        this.tsBigNext = false; this.tsDodgeCd = 0; this.tsMarked = 0;
        this.tsStill = 0; this.tsAlert = false; this.tsFocus = 0; this.tsAlertCd = 0;
        this.tsCloneT = tsBr(this, 's') === 2 ? 1 : 0;
        this.tsSideFx = 0; this.tsSideFrom = 0; this.tsSwitchFx = 0; this.tsTick = 0;
    },
    update() {
        this.tsTick++;
        if (this.tsGcd > 0) this.tsGcd--;
        if (this.tsWarnCd > 0) this.tsWarnCd--;
        if (this.tsDodgeCd > 0) this.tsDodgeCd--;
        if (this.tsSideFx > 0) this.tsSideFx--;
        if (this.tsSwitchFx > 0) this.tsSwitchFx--;
        if (this.tsRegenWait > 0) this.tsRegenWait--;
        else tsGain(this, (tsFull(this) ? 6 : 4) / 60);
        // Phân Thân: triệu hồi đầu hiệp / hồi sinh
        if (tsBr(this, 's') === 2 && this.tsCloneT > 0 && --this.tsCloneT <= 0 && !tsCloneOf(this)) {
            bodyEffects.push(new TsClone(this));
            addFloatingText(this.x + this.w / 2, this.y - 18, 'PHÂN THÂN CHI THUẬT!', TS_MOON, 12);
        }
        // Đợt phi tiêu phụ
        if (this.tsWaves.length) {
            for (let i = this.tsWaves.length - 1; i >= 0; i--) if (--this.tsWaves[i] <= 0) { this.tsWaves.splice(i, 1); tsThrow(this, true); }
        }
        // Tâm Nhãn: Cảnh Giác / Tập Trung
        if (this.tsAlertCd > 0) this.tsAlertCd--;
        if (this.tsFocus > 0 && --this.tsFocus <= 0) { this.tsAlertCd = tsFull(this) ? 720 : 1080; this.tsAlert = false; }
        if (tsBr(this, 'h') === 3 && this.tsStyle === 2 && this.tsMode === 'idle' && this.tsFocus <= 0 && this.tsAlertCd <= 0 && !this.tsAlert) {
            if (!this.tsMoveDir) {
                if (++this.tsStill >= (tsFull(this) ? 60 : 120)) {
                    this.tsAlert = true;
                    addFloatingText(this.x + this.w / 2, this.y - 16, 'CẢNH GIÁC', '#f5f3ff', 11);
                }
            } else this.tsStill = 0;
        }
        if (this.tsAlert && (this.tsMoveDir || this.tsStyle !== 2)) { this.tsAlert = false; this.tsStill = 0; }
        // Trạng thái chiêu
        const m = this.tsMode;
        if (m === 'seal') {
            if (--this.tsT <= 0) {
                if (tsBr(this, 'd') === 2 && this.tsPrevS) { this.tsMode = 'charge'; this.tsCharge = 0; this.tsTier = 0; }
                else { this.tsMode = 'idle'; tsFireball(this, 0); }
            }
        } else if (m === 'charge') {
            this.tsCharge++;
            const f = tsFull(this), step = f ? 42 : 60;
            const want = Math.min(3, Math.floor(this.tsCharge / step));
            if (want > this.tsTier) {
                const extra = tsCost(this, 15);
                if (this.tsNN >= extra) {
                    this.tsNN -= extra; this.tsTier = want;
                    spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, TS_FIRE, 8);
                    tsSfx('playPowerup');
                } else this.tsCharge = this.tsTier * step;
            }
            if (this.tsCharge >= step * 3 + 30) tsReleaseCharge(this);
        } else if (m === 'dash' || m === 'moon') tsDashStep(this);
        else if (m === 'loan') {
            this.invincibleTimer = Math.max(this.invincibleTimer || 0, 2);
            if (--this.tsT <= 0) { // để lại đường kiếm đen, giật về chỗ cũ, Thu Kiếm 1s
                this.y = tsLane(this); this.x = this.tsHomeX;
                bodyEffects.push(new TsStreak(this.tsLoanX, this.tsLoanY, this.x + this.w / 2, this.y + this.h / 2, 60, 0));
                this.tsMode = 'sheathe'; this.tsT = 60;
            }
        } else if (m === 'sheathe') {
            this.invincibleTimer = Math.max(this.invincibleTimer || 0, 2);
            if (--this.tsT <= 0) this.tsMode = 'idle';
        } else if (m === 'vanish') {
            if (--this.tsT <= 0) tsVanishEnd(this);
        }
    },
    speed(s) {
        if (this.tsMode !== 'idle' || this.tsFocus > 0) return 0;
        return s;
    },
    shoot(inp) {
        const s = !!inp.s;
        const released = !s && this.tsPrevS;
        this.tsPrevS = s;
        this.tsMoveDir = inp.l && !inp.r ? -1 : (inp.r && !inp.l ? 1 : 0);
        if (this.tsMode === 'charge') { if (!s) tsReleaseCharge(this); this.tsHoldUsed = true; this.tsHold = 0; return true; }
        if (this.tsMode !== 'idle') { this.tsHold = 0; this.tsHoldUsed = this.tsHoldUsed || s; return true; }
        if (s) {
            this.tsHold++;
            if (this.tsHold === tsSwitchT(this) && !this.tsHoldUsed) { this.tsHoldUsed = true; tsSwitch(this); }
        } else if (released) {
            if (!this.tsHoldUsed && this.tsHold < tsSwitchT(this)) tsCast(this);
            this.tsHold = 0; this.tsHoldUsed = false;
        } else { this.tsHold = 0; this.tsHoldUsed = false; }
        return true;
    },
    beforeDamage(amount, attacker, options) {
        if (options && options.isEnvironmental) return false;
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2, full = tsFull(this);
        // Tâm Nhãn Phản Đòn
        if ((this.tsAlert || this.tsFocus > 0) && attacker && attacker !== this) {
            const e = tsEnemy(this), dir = tsDir(this);
            const dmg = Math.min(2, amount || 0.5) * (full ? 1.5 : 1);
            const v = full && e && tsAlive(e) ? aimVelocity(cx, cy, e, 10, true) : { vx: 0, vy: dir * 10 };
            spawnBullet(this, { x: cx - 5, y: tsFront(this), w: 10, h: 10, vx: v.vx, vy: v.vy, dmg, hook: 'tsukiyo', ts: 'refl' });
            this.tsAlert = false; this.tsFocus = full ? 90 : 60;
            if (full) this.hp = Math.min(this.maxHp, this.hp + 0.25);
            addFloatingText(cx, this.y - 16, full ? 'MINH KÍNH CHỈ THỦY!' : 'PHẢN ĐÒN!', '#f5f3ff', 12);
            fxSlashHit(cx, cy, '#ffffff', 22);
            tsSfx('playShieldBreak');
            return true;
        }
        // Ảo Thân: Né Đòn
        if (tsBr(this, 'h') === 1 && this.tsDodgeCd <= 0) {
            this.tsDodgeCd = full ? 300 : 480;
            this.tsBigNext = true;
            if (full) tsGain(this, 15);
            tsSmoke(cx, cy, 26);
            addFloatingText(cx, this.y - 16, 'ẢO THÂN - NÉ!', TS_CYAN, 12);
            return true;
        }
        return false;
    },
    shopButtons(container, playerId) {
        const st = ['s', 'd', 'h'].map(k => tsBr(this, k) ? '✔' : (tsUnlocked(this, k) ? '★' : '🔒')).join(' ');
        const btn = document.createElement('div');
        btn.className = 'card';
        btn.style.border = '2px solid #c084fc';
        btn.style.background = '#170f2b';
        btn.innerHTML = `<h4 style="color:#c084fc">🥷 NHẪN ĐẠO</h4><p>💨 Tốc / 💥 Dame / 🛡️ Máu</p><p style="color:#e9d5ff">${st}</p>`;
        btn.onclick = () => tsRenderPanel(playerId);
        container.appendChild(btn);
    },
});

// Bảng chọn nhánh Nhẫn Đạo (trong shop)
function tsRenderPanel(playerId) {
    const container = document.getElementById(`${playerId}-upgrades`);
    if (!container) return;
    const p = playerId === 'p1' ? p1 : p2;
    container.innerHTML = '';
    const title = document.getElementById('roundTitleText');
    if (title) title.innerText = `NHẪN ĐẠO — mỗi mốc cần ${tsNeed(p)} cấp (Evo 2 giảm 50%)`;
    const back = document.createElement('div');
    back.className = 'card';
    back.style.border = '2px solid #e74c3c';
    back.innerHTML = '<h4 style="color:#ff6b6b">QUAY LẠI</h4><p>Về cửa hàng</p><p>🔙</p>';
    back.onclick = () => { updateShopTitle(); renderShop(playerId, true); };
    container.appendChild(back);
    const HEAD = { s: ['💨 MỐC TỐC ĐỘ', 'Động Cơ'], d: ['💥 MỐC SÁT THƯƠNG', 'Bánh Xích'], h: ['🛡️ MỐC MÁU', 'Giáp Thép'] };
    for (const k of ['s', 'd', 'h']) {
        const lv = tsLevel(p, k), open = tsUnlocked(p, k), chosen = tsBr(p, k);
        for (let i = 1; i <= 3; i++) {
            const card = document.createElement('div');
            const mine = chosen === i;
            card.className = 'card' + (mine ? ' evo-card' : ((!open || chosen) ? ' sold' : ''));
            const c = TS_STYLE_C[i - 1];
            card.innerHTML = `<h4 style="color:${c}">${HEAD[k][0]} · ${TS_STYLE_I[i - 1]} ${TS_BR_NAME[k][i - 1]}</h4>` +
                `<p>${TS_BR_DESC[k][i - 1]}</p>` +
                `<p style="color:${mine ? '#4ade80' : (open && !chosen ? c : '#94a3b8')}">${mine ? 'ĐÃ CHỌN' : (chosen ? '—' : (open ? 'CHỌN' : `🔒 ${HEAD[k][1]} ${Math.min(lv, tsNeed(p))}/${tsNeed(p)}`))}</p>`;
            card.onclick = () => {
                if (!open || tsBr(p, k)) return;
                p.upgrades.push('tsu_' + k + i);
                tsSfx('playPowerup');
                if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) onlineManager.sendLoadout(playerId);
                tsRenderPanel(playerId);
            };
            container.appendChild(card);
        }
    }
}

// Kết liễu: đòn của Tsukiyo làm máu đối thủ về 0 -> NGUYỆT TRẢM (không đổi logic dame)
(function () {
    const orig = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker) {
        const before = this.hp;
        const r = orig.apply(this, arguments);
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && attacker.weapon === 'tsukiyo'
            && !bodyEffects.some(e => e instanceof TsFinisher)) {
            bodyEffects.push(new TsFinisher(attacker, this));
            triggerScreenShake(10, 18);
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, TS_MOON, 24);
            tsSfx('playExplosion');
        }
        return r;
    };
})();
