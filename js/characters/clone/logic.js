// ==========================================
// Nhân Bản (clone) — Logic: "1 thành 2, sau đó 3 và 4..."
// ------------------------------------------
// Nhấp Bắn: đạn cơ bản (100% dame). Giữ Bắn 1.0s: tạo 1 CLONE THƯỜNG cạnh xe (giữ tiếp -> mỗi 1s thêm 1).
//   Clone Thường 24×24: Máu 30% MaxHP (Evo 2: 50% | Full: 60%), Đạn 4, đạn tự ngắm (xem clShotK). AI: clCloneAI.
//   Tự di chuyển trên làn của mình, bắn kẻ địch; là khối isStone -> chặn & bị đạn địch bắn hạ.
//   Giới hạn kỹ thuật: tối đa CL_CAP clone thường cùng lúc (hiệu năng + online).
// Nội tại GÁNH CHỊU: clone thường bị bắn hạ -> bản thể nhận 50% Max HP của clone đó (xuyên khiên).
//   Evo 2: miễn 2 lần đầu mỗi hiệp (Full: 4). Còn Clone Hoàn Hảo -> nó gánh thay phản phệ.
// Evo 1: đầu hiệp có 1 CLONE HOÀN HẢO (30×30, 100% chỉ số). Khi bản thể nhận đòn chí mạng -> HỒI SINH
//   vào vị trí Clone Hoàn Hảo (máu = máu clone, tối đa Max HP), clone đó biến mất.
// Full Evo: 2 Clone Hoàn Hảo (100% Max HP).
// Mọi state là trường thuần trên player / entity ClClone trong bodyEffects -> đồng bộ online.
// ==========================================

const CL_CYAN = '#22d3ee', CL_VIO = '#a78bfa', CL_GOLD = '#fde68a', CL_PINK = '#f472b6';
const CL_HOLD = 60;          // 1.0s giữ -> 1 clone
const CL_CAP = 6;            // giới hạn kỹ thuật số clone thường cùng lúc
const CL_GCD = 10;
const CL_BUL_V = 8.2;

function clE1(p) { return p.hasUpgrade('evo_clone_1'); }
function clE2(p) { return p.hasUpgrade('evo_clone_2'); }
function clFull(p) { return clE1(p) && clE2(p); }
function clIs(p) { return p && p.weapon === 'clone'; }
function clEnemy(p) { return p === p1 ? p2 : p1; }
function clDir(p) { return p.id === 1 ? -1 : 1; }
function clSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function clRatio(p) { return clFull(p) ? 0.6 : (clE2(p) ? 0.5 : 0.3); }
// Dame mỗi viên của clone (đạn tự ngắm đón đầu): Thường 15% (Evo 2+: 20%), Hoàn Hảo 50% (Full: 35%)
function clShotK(p, kind) { return kind ? (clFull(p) ? 0.35 : 0.5) : (clE2(p) ? 0.2 : 0.15); }
function clFreeMax(p) { return clFull(p) ? 4 : (clE2(p) ? 2 : 0); }
function clPerfectN(p) { return clFull(p) ? 2 : (clE1(p) ? 1 : 0); }
function clClones(p, kind) {
    return bodyEffects.filter(e => e instanceof ClClone && e.owner === p && e.active && (kind === undefined || e.kind === kind));
}
function clCount(p) { return clClones(p, 0).length; }

// ---------- Entity: Clone (kind 0 = Thường, 1 = Hoàn Hảo) ----------
class ClClone {
    constructor(owner, kind, side) {
        const full = clFull(owner);
        this.owner = owner; this.kind = kind;
        this.w = kind ? owner.w : 24; this.h = kind ? owner.h : 24;
        const k = kind ? 1 : clRatio(owner);
        this.k = k;
        this.maxHp = Math.max(0.5, Math.round(owner.maxHp * (kind ? 1 : k) * 4) / 4);
        this.hp = this.maxHp;
        this.side = side || 1;
        const cx = owner.x + owner.w / 2 + this.side * (owner.w / 2 + this.w / 2 + 4);
        this.x = Math.max(0, Math.min(canvas.width - this.w, cx - this.w / 2));
        this.y = owner.y + (owner.h - this.h) / 2;
        this.ammo = 4; this.maxAmmo = 4; this.reloadT = 0; this.id = owner.id;
        this.slot = 0; this.mx = null; this.retreat = false; this.dodgeFx = 0;
        this.fireT = 30 + Math.floor(Math.random() * 40);
        this.off = Math.round((Math.random() * 2 - 1) * 110);     // lệch mục tiêu riêng -> tản ra trên làn
        this.seed = Math.round(Math.random() * 628) / 100;
        this.recoil = 0; this.spawnFx = 24; this.hitFx = 0; this.lastHp = this.hp;
        this.isStone = true; this.isClClone = true; this.t = 0; this.dead = false; this.active = true;
    }
    update() {
        const o = this.owner;
        if (!this.active || this.hp <= 0) {
            this.active = false;
            if (!this.dead) { this.dead = true; clCloneDied(o, this); }
            return;
        }
        this.t++;
        if (this.spawnFx > 0) this.spawnFx--;
        if (this.recoil > 0) this.recoil--;
        if (this.hitFx > 0) this.hitFx--;
        if (this.hp < this.lastHp) this.hitFx = 10;
        this.lastHp = this.hp;
        if (!o || o.hp <= 0) return;
        this.y = o.y + (o.h - this.h) / 2;
        if (o.freezeTimer > 0) return;
        const e = clEnemy(o);
        clCloneAI(this, o, e);
    }
    draw() { if (typeof clDrawClone === 'function') clDrawClone(this); }
}


// ---------- AI Clone (chỉ host chạy update) ----------
// Dùng bộ dò mối nguy của SmartBot (đạn, cột cảnh báo hitscan, vòng rơi từ trời, pháo, tia...) rồi tự chọn vị trí:
//  - né đạn / đòn báo trước trên cột của mình, - tản đều theo "khe" quanh địch (không chồng nhau),
//  - máu thấp -> lùi xa trục bắn của địch, - ngắm đón đầu, - bắn dồn cùng lúc bản thể khai hoả.
const CL_BRAIN = {};
function clBrain(o) {
    const lvl = clFull(o) ? 5 : (clE2(o) ? 4 : 3);
    let b = CL_BRAIN[o.id];
    if (!b || typeof SmartBot === 'undefined') { if (typeof SmartBot === 'undefined') return null; b = CL_BRAIN[o.id] = new SmartBot(lvl); }
    if (b.levelIdx !== lvl) b.setLevel(lvl);
    return b;
}
function clCloneAI(c, o, e) {
    const W = canvas.width, cx = c.x + c.w / 2;
    const mates = clClones(o);
    c.slot = Math.max(0, mates.indexOf(c));
    const n = mates.length;
    const ex = e ? e.x + e.w / 2 : W / 2;
    c.retreat = c.hp < c.maxHp * 0.4;
    // khe đứng: rải đều quanh địch (±150px), con máu thấp lùi ra xa trục bắn của địch & về sau bản thể
    const spread = Math.min(100, 30 + n * 12);
    let goal = ex + (n > 1 ? (c.slot / (n - 1) * 2 - 1) * spread : (c.side || 1) * 40);
    if (c.retreat) {
        const ox = o.x + o.w / 2;
        goal = ox + (ox < ex ? -1 : 1) * 70 + (c.slot % 2 ? 26 : -26);
        if (Math.abs(goal - ex) < 110) goal = ex + (goal < ex ? -110 : 110);
    }
    goal = Math.max(c.w / 2, Math.min(W - c.w / 2, goal));
    // lập kế hoạch: mỗi 3 tick (lệch theo khe), gấp hơn khi có đòn sắp trúng
    const brain = clBrain(o);
    if (brain && e && e.hp > 0 && (c.mx === null || (c.t + c.slot) % 3 === 0)) {
        const threats = brain.collectThreats(c, e);
        const spd = (c.kind ? 2.6 : 2.3);
        let best = cx, bestCost = Infinity;
        for (let X = c.w / 2; X <= W - c.w / 2 + 0.1; X += 5) {
            let cost = Math.abs(X - goal) * 0.006;
            const edge = Math.min(X, W - X);
            if (edge < 30) cost += (30 - edge) / 30 * 0.3;
            for (const q of mates) { // tản ra: phạt đứng sát đồng đội
                if (q === c) continue;
                const d = Math.abs(X - (q.mx !== null && q.mx !== undefined ? q.mx : q.x + q.w / 2));
                if (d < 30) cost += (30 - d) / 30 * 0.25;
            }
            const dOwner = Math.abs(X - (o.x + o.w / 2));
            if (dOwner < 34) cost += (34 - dOwner) / 34 * 0.2;
            const dir = Math.sign(X - cx), dist = Math.abs(X - cx);
            for (const th of threats) {
                const pos = cx + dir * Math.min(dist, spd * th.t);
                const d = Math.abs(pos - th.x), half = th.half + 3;
                if (d < half) cost += th.w * (1 + (half - d) / half) * (th.t < 30 ? 2.5 : 1) * (c.retreat ? 1.5 : 1);
            }
            if (cost < bestCost) { bestCost = cost; best = X; }
        }
        if (Math.abs(best - goal) > 20 && threats.some(th => th.t < 35 && Math.abs(th.x - cx) < th.half)) c.dodgeFx = 12;
        c.mx = best;
    }
    if (c.dodgeFx > 0) c.dodgeFx--;
    const tx = c.mx === null ? goal : c.mx;
    const spd = (c.kind ? 2.6 : 2.3) * (c.dodgeFx > 0 ? 1.2 : 1);
    c.x += Math.max(-spd, Math.min(spd, tx - cx));
    c.x = Math.max(0, Math.min(W - c.w, c.x));
    // nạp đạn & bắn
    if (c.ammo < c.maxAmmo && ++c.reloadT >= (c.kind ? 70 : 90)) { c.reloadT = 0; c.ammo++; }
    if (c.fireT > 0) c.fireT--;
    if (!(c.ammo > 0) || !e || e.hp <= 0 || c.retreat && c.dodgeFx > 0) return;
    const bx = c.x + c.w / 2, dx = Math.abs(ex - bx);
    if (dx > 50) return; // chỉ bắn khi gần thẳng hàng (đạn ngắm chỉnh góc nhẹ để đón đầu)
    // bắn dồn: bản thể vừa khai hoả -> clone bắn theo (so le 2 tick/khe) nếu hồi bắn đã gần xong
    const volley = o.clVolley > 0 && o.clVolley <= 14 - (c.slot % 5) * 2 && c.fireT <= 30;
    if (c.fireT > 0 && !volley) return;
    c.ammo--; c.recoil = 8;
    c.fireT = (c.kind ? 55 : 80) + Math.floor(Math.random() * 20);
    const dir = clDir(o), bw = c.kind ? 8 : 6;
    const sy = dir < 0 ? c.y - 10 : c.y + c.h + 2;
    const v = aimVelocity(bx, sy, e, CL_BUL_V, true);
    spawnBullet(o, {
        x: bx - bw / 2, y: sy, w: bw, h: bw + 4,
        vx: v.vx, vy: v.vy, dmg: o.damage * clShotK(o, c.kind), // đạn ngắm đón đầu -> dame/viên thấp hơn
        hook: 'clone', clK: c.kind ? 2 : 1,
    });
}

// ---------- Entity: kết liễu VÔ HẠN (mọi bản sao hội tụ + gương vỡ) ----------
class ClFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        // điểm xuất phát của các bóng (bản thể + clone) — mảng số thuần
        const pts = [owner.x + owner.w / 2, owner.y + owner.h / 2];
        for (const c of clClones(owner)) pts.push(c.x + c.w / 2, c.y + c.h / 2);
        while (pts.length < 12) { // ít clone -> thêm bóng ảo dọc làn cho đẹp
            const i = pts.length / 2;
            pts.push((i * 97) % canvas.width, owner.y + owner.h / 2);
        }
        this.pts = pts.slice(0, 40);
        this.seed = Math.round(Math.random() * 628) / 100;
        this.t = 0; this.dur = 130; this.active = true;
    }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof clDrawFinisher === 'function') clDrawFinisher(this); }
    drawOver() { if (typeof clDrawFinisherOver === 'function') clDrawFinisherOver(this); }
}

// ---------- Nhân bản / Gánh Chịu / Hồi sinh ----------
function clSpawnClone(p) {
    if (clCount(p) >= CL_CAP) {
        addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -18 : p.h + 22), 'TỐI ĐA ' + CL_CAP + ' CLONE', '#94a3b8', 11);
        return false;
    }
    p.clSide = -(p.clSide || 1);
    const c = new ClClone(p, 0, p.clSide);
    bodyEffects.push(c);
    p.clMade = (p.clMade || 0) + 1;
    p.clSpawnFx = 20;
    const n = clCount(p) + 1; // + bản thể
    addFloatingText(c.x + c.w / 2, p.y + (p.id === 1 ? -18 : p.h + 22), '◈ ' + n + ' ◈', CL_CYAN, 13);
    spawnSparkParticles(c.x + c.w / 2, c.y + c.h / 2, CL_CYAN, 10);
    clSfx('playPowerup');
    return true;
}
function clSpawnPerfect(p, side) {
    const c = new ClClone(p, 1, side);
    bodyEffects.push(c);
    spawnSparkParticles(c.x + c.w / 2, c.y + c.h / 2, CL_GOLD, 12);
}

function clCloneDied(p, c) {
    const x = c.x + c.w / 2, y = c.y + c.h / 2;
    if (c.consumed) return; // dùng để hồi sinh -> không nổ, không phản phệ
    explosions.push(new Explosion(x, y, c.kind ? 34 : 24, 'rgba(34, 211, 238,', 0, p));
    spawnSparkParticles(x, y, c.kind ? CL_GOLD : CL_CYAN, 12);
    if (!p || p.hp <= 0) return;
    if (c.kind) { addFloatingText(x, y - 14, 'HOÀN HẢO VỠ!', CL_GOLD, 12); return; }
    // GÁNH CHỊU
    const dmg = Math.round(c.maxHp * 0.5 * 100) / 100;
    if ((p.clFree || 0) > 0) {
        p.clFree--;
        addFloatingText(x, y - 14, 'MIỄN PHẢN PHỆ (' + p.clFree + ')', CL_VIO, 11);
        p.clLinkFx = 14;
        return;
    }
    const pf = clClones(p, 1)[0];
    if (pf) { // Clone Hoàn Hảo gánh thay
        pf.hp -= dmg; pf.hitFx = 10;
        addFloatingText(pf.x + pf.w / 2, pf.y - 10, '-' + dmg + ' GÁNH THAY', CL_GOLD, 11);
        p.clLinkFx = 14; p.clLashFrom = [x, y, pf.x + pf.w / 2, pf.y + pf.h / 2];
        return;
    }
    p.clLinkFx = 18; p.clLashFrom = [x, y, p.x + p.w / 2, p.y + p.h / 2];
    addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -26 : p.h + 30), 'PHẢN PHỆ!', CL_PINK, 12);
    p.takeDamage(dmg, null, { unavoidable: true, bypassShield: true });
}

function clFire(p, now) {
    if (!(p.ammo > 0)) { addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -18 : p.h + 22), 'HẾT ĐẠN', '#94a3b8', 10); return; }
    p.ammo--; p.lastShot = now; p.clGCD = CL_GCD; p.clRecoil = 8; p.clVolley = 14; // clone bắn dồn theo bản thể
    const dir = clDir(p), cx = p.x + p.w / 2;
    spawnBullet(p, {
        x: cx - 4, y: dir < 0 ? p.y - 12 : p.y + p.h + 2, w: 8, h: 12,
        vx: 0, vy: dir * CL_BUL_V, dmg: p.damage, hook: 'clone', clK: 0,
    });
    clSfx('playShoot');
}

// Bot: thỉnh thoảng giữ để nhân bản (ít clone, máu còn khá)
function clBotWantsClone(bot) {
    const n = clCount(bot);
    if (n >= (clE2(bot) ? 5 : 3)) return false;
    if (bot.hp < bot.maxHp * 0.45 && !(bot.clFree > 0) && !clClones(bot, 1).length) return false;
    return Math.random() < 0.012;
}

BulletHooks.register('clone', {
    hit(b, o, v) { if (o && v) spawnSparkParticles(b.x + b.w / 2, b.y + b.h / 2, b.clK === 2 ? CL_GOLD : CL_CYAN, 4); },
    draw(b) { if (typeof clDrawBullet === 'function') clDrawBullet(b); },
});

CharHooks.register('clone', {
    setup() {
        this.clHold = 0; this.clPrevS = false; this.clHoldUsed = false; this.clGCD = 0; this.clRecoil = 0;
        this.clFree = clFreeMax(this); this.clPending = clPerfectN(this); this.clMade = 0;
        this.clVolley = 0; delete CL_BRAIN[this.id];
        this.clSpawnFx = 0; this.clLinkFx = 0; this.clReviveFx = 0; this.clSide = 1; this.clLashFrom = null;
    },
    update() {
        if (this.clGCD > 0) this.clGCD--;
        if (this.clRecoil > 0) this.clRecoil--;
        if (this.clSpawnFx > 0) this.clSpawnFx--;
        if (this.clLinkFx > 0) this.clLinkFx--;
        if (this.clReviveFx > 0) this.clReviveFx--;
        if (this.clVolley > 0) this.clVolley--;
        if (this.hp > 0 && clClones(this).length) { const b = clBrain(this); if (b) b.t++; }
        if (this.clPending > 0 && this.hp > 0) { // Clone Hoàn Hảo đầu hiệp (sau khi xe đã đặt vị trí)
            const n = this.clPending; this.clPending = 0;
            for (let i = 0; i < n; i++) clSpawnPerfect(this, i % 2 ? -1 : 1);
        }
    },
    shoot(inp, now) {
        const s = !!inp.s;
        const released = !s && this.clPrevS;
        this.clPrevS = s;
        if (s) {
            this.clHold++;
            if (this.clHold >= CL_HOLD) { this.clHold = 0; this.clHoldUsed = true; clSpawnClone(this); }
        } else {
            if (released && !this.clHoldUsed && this.clGCD <= 0) clFire(this, now);
            this.clHold = 0; this.clHoldUsed = false;
        }
        return true;
    },
    // Hồi sinh vào Clone Hoàn Hảo
    beforeLethal() {
        const pf = clClones(this, 1)[0];
        if (!pf) return false;
        pf.consumed = true; pf.active = false; pf.dead = true;
        const ox = this.x;
        this.x = Math.max(0, Math.min(canvas.width - this.w, pf.x + pf.w / 2 - this.w / 2));
        this.hp = Math.max(0.5, Math.min(this.maxHp, pf.hp));
        this.clReviveFx = 40; this.clLashFrom = [ox + this.w / 2, this.y + this.h / 2, this.x + this.w / 2, this.y + this.h / 2];
        this.clLinkFx = 18;
        addFloatingText(this.x + this.w / 2, this.y + (this.id === 1 ? -22 : this.h + 26), '◈ HỒI SINH ◈', CL_GOLD, 15);
        spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, CL_GOLD, 22);
        explosions.push(new Explosion(ox + this.w / 2, this.y + this.h / 2, 30, 'rgba(244, 114, 182,', 0, this));
        triggerScreenShake(6, 12);
        clSfx('playPowerup');
        return true;
    },
});

// takeDamage: kết liễu VÔ HẠN (nối tiếp wrapper sẵn có)
(function () {
    const orig = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker) {
        const before = this.hp;
        const r = orig.apply(this, arguments);
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && clIs(attacker)
            && typeof bodyEffects !== 'undefined' && !bodyEffects.some(e => e instanceof ClFinisher)) {
            bodyEffects.push(new ClFinisher(attacker, this));
            triggerScreenShake(10, 18);
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, CL_CYAN, 24);
            clSfx('playExplosion');
        }
        return r;
    };
})();
