// ==========================================
// Joker (joker) — Logic: "Lá bài của ta là JOKER!" (Collab: Thần Bài Ma Thuật / Quái Đạo)
// ------------------------------------------
// Băng đạn = 1 tay bài (5 lá; Evo 1: 10 lá, mỗi lần ném 2 lá). Hết bài -> xào bài 1.5s (Evo 2: 0.75s).
// Chất: Rỗng / ♥ Cơ / ♦ Rô / ♣ Chuồn / ♠ Bích / 🃏 JOKER (Evo 1: Joker Đỏ / Joker Đen).
// Nhấp = Phi Bài. Giữ 0.35s = TRÁO BÀI (hồi 4s): lướt ngắn + đổi lá kế tiếp.
// THOÁT HIỂM (beforeLethal): dịch chuyển, để lại hình nhân (bắn trúng -> địch choáng), bất tử 2s.
// Evo 2: Wildcard Copy (Joker trúng -> chép Vai Trò Chính của body địch). Full Evo: All-In & Phán Quyết.
// Toàn bộ trạng thái là trường thuần trên player / entity trong bodyEffects -> đồng bộ online.
// ==========================================

const JK_PURPLE = '#a855f7', JK_GOLD = '#fde047', JK_GREEN = '#4ade80', JK_PINK = '#f472b6';
const JK_HOLD = 21;                 // 0.35s
const JK_SUIT = {
    E: { g: '·', c: '#94a3b8', n: 'RỖNG' },
    H: { g: '♥', c: '#f43f5e', n: 'CƠ' },
    D: { g: '♦', c: '#fb923c', n: 'RÔ' },
    C: { g: '♣', c: '#4ade80', n: 'CHUỒN' },
    S: { g: '♠', c: '#60a5fa', n: 'BÍCH' },
    J: { g: '🃏', c: JK_PURPLE, n: 'JOKER' },
};
// Tỉ lệ rút: Joker 5% | ♥ 10% | ♦ 25% | ♣ 20% | ♠ 25% | Rỗng 15%
const JK_ODDS = [['J', 0.05], ['H', 0.10], ['D', 0.25], ['C', 0.20], ['S', 0.25], ['E', 0.15]];

function jkE1(p) { return p.hasUpgrade('evo_joker_1'); }
function jkE2(p) { return p.hasUpgrade('evo_joker_2'); }
function jkFull(p) { return jkE1(p) && jkE2(p); }
function jkEnemy(p) { return p === p1 ? p2 : p1; }
function jkDir(p) { return p.id === 1 ? -1 : 1; }
function jkAlive(t) { return t && t.hp > 0; }
function jkSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function jkPow(p) { return jkFull(p) ? 1.5 : 1; }           // Full Evo: hiệu ứng lá bài mạnh hơn
function jkHandMax(p) { return jkE1(p) ? 10 : 5; }
function jkReloadMax(p) { return jkE2(p) ? 45 : 90; }
function jkSuitOf(card) { return (card || 'E')[0]; }
function jkCoins(p, v) { if (p.id === 1) gameState.p1Coins += v; else gameState.p2Coins += v; }
function jkRole(t) {
    const m = (typeof MODULES !== 'undefined' && MODULES.BODY || []).find(b => b.id === (t && t.weapon));
    return m && m.role && m.role[0] || 'Đối Đầu';
}

// Rút 1 lá (jokerP: tỉ lệ Joker ghi đè, vd. khi Tráo Bài ở Full Evo)
function jkDrawCard(p, jokerP) {
    let r = Math.random(), s = 'E';
    if (jokerP !== undefined) {
        if (r < jokerP) s = 'J';
        else { r = Math.random() * 0.95; let acc = 0; for (const [k, w] of JK_ODDS) { if (k === 'J') continue; acc += w; if (r < acc) { s = k; break; } } }
    } else {
        let acc = 0;
        for (const [k, w] of JK_ODDS) { acc += w; if (r < acc) { s = k; break; } }
    }
    if (s === 'J' && jkE1(p)) s = Math.random() < 0.5 ? 'JR' : 'JB';
    return s;
}
function jkJoker(p) { return jkE1(p) ? (Math.random() < 0.5 ? 'JR' : 'JB') : 'J'; }

function jkNewHand(p) {
    const n = jkHandMax(p);
    p.jkAllIn = jkFull(p) && Math.random() < 0.10;
    p.jkHand = [];
    for (let i = 0; i < n; i++) p.jkHand.push(p.jkAllIn ? jkJoker(p) : jkDrawCard(p));
    p.jkReload = 0;
    // Wildcard Copy: còn hiệu lực hết tay bài kế tiếp
    if (p.jkCopy) { if (p.jkCopyHands > 0) p.jkCopyHands--; else p.jkCopy = ''; }
    if (p.jkAllIn) {
        addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -24 : p.h + 28), '♠ ALL-IN JOKER! ♠', JK_GOLD, 15);
        triggerScreenShake(3, 8);
        jkSfx('playPowerup');
    }
}

// ---------- Entity: Hình nhân thế mạng (Thoát Hiểm) ----------
class JkDecoy {
    constructor(owner, x, y) {
        this.owner = owner; this.x = x; this.y = y; this.w = owner.w; this.h = owner.h;
        this.life = 240; this.maxLife = 240; this.pop = 0; this.active = true;
    }
    update() {
        if (!this.active) return;
        if (this.pop > 0) { if (--this.pop <= 0) this.active = false; return; }
        if (--this.life <= 0) { this.active = false; return; }
        const o = this.owner, e = jkEnemy(o);
        if (!e || !e.bullets) return;
        for (let j = e.bullets.length - 1; j >= 0; j--) {
            const b = e.bullets[j];
            if (!rectIntersect(b.x, b.y, b.w || 6, b.h || 6, this.x, this.y, this.w, this.h)) continue;
            e.bullets.splice(j, 1);
            if (jkAlive(e)) e.freezeTimer = Math.max(e.freezeTimer || 0, 75);
            addFloatingText(e.x + e.w / 2, e.y + (e.id === 1 ? -16 : e.h + 20), 'BỊ LỪA! CHOÁNG', JK_PURPLE, 13);
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 46, 'rgba(168, 85, 247,', 0, o));
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, JK_GOLD, 14);
            jkSfx('playExplosion');
            this.pop = 24;
            return;
        }
    }
    draw() { if (typeof jkDrawDecoy === 'function') jkDrawDecoy(this); }
}

// ---------- Entity: Lá Joker xoay 1 vòng rồi Joker hiện ra (Thoát Hiểm) ----------
class JkEscapeFx {
    constructor(owner, x, y) { this.team = owner.id; this.x = x; this.y = y; this.t = 0; this.dur = 70; this.active = true; }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof jkDrawEscapeFx === 'function') jkDrawEscapeFx(this); }
}

// ---------- Entity: Vùng bài (Joker Đen: câm lặng | Kiểm Soát copy: làm chậm) ----------
class JkZone {
    constructor(owner, x, y, r, life, kind, bleed) {
        this.owner = owner; this.x = x; this.y = y; this.r = r;
        this.life = life; this.maxLife = life; this.kind = kind; this.bleed = !!bleed;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        if (--this.life <= 0) { this.active = false; return; }
        const e = jkEnemy(this.owner);
        if (!jkAlive(e)) return;
        if (zoneDist(e.x + e.w / 2 - this.x, e.y + e.h / 2 - this.y) >= this.r) return;
        if (this.kind === 'silence') e.silenceTimer = Math.max(e.silenceTimer || 0, 6);
        else addStatusSlow(e, 0.6);
        if (this.bleed) { e.bleedTimer = Math.max(e.bleedTimer || 0, 24); e.bleedDmg = Math.max(e.bleedDmg || 0, 0.04); }
    }
    draw() { if (typeof jkDrawZone === 'function') jkDrawZone(this); }
}

// ---------- Entity: PHÁN QUYẾT JOKER (Full Evo) ----------
class JkVerdict {
    constructor(owner, target) {
        this.owner = owner; this.target = target;
        this.x = target.x + target.w / 2; this.y = target.y + target.h / 2;
        this.t = 0; this.hitT = 40; this.dur = 80; this.done = false; this.active = true;
    }
    update() {
        if (!this.active) return;
        const tg = this.target, o = this.owner;
        if (jkAlive(tg)) { this.x = tg.x + tg.w / 2; this.y = tg.y + tg.h / 2; }
        this.t++;
        if (!this.done && this.t >= this.hitT) {
            this.done = true;
            if (jkAlive(tg)) {
                tg.shield = 0;
                tg.invincibleTimer = 0; tg.invisTimer = 0; tg.stealthActive = false;
                const d = tg.hp * 0.5;
                if (d > 0) tg.takeDamage(d, o, { unavoidable: true, bypassShield: true, isPiercing: true });
                o.jkEsc = Math.min(3, (o.jkEsc || 0) + 1);   // có thể vượt giới hạn 2
                addFloatingText(this.x, this.y + (tg.id === 1 ? -30 : 34), 'SHOWDOWN! -50% HP', JK_GOLD, 16);
                addFloatingText(o.x + o.w / 2, o.y + (o.id === 1 ? -22 : o.h + 26), '+1 THOÁT HIỂM', JK_PURPLE, 12);
            }
            explosions.push(new Explosion(this.x, this.y, 90, 'rgba(253, 224, 71,', 0, o));
            spawnSparkParticles(this.x, this.y, JK_PURPLE, 24);
            triggerScreenShake(9, 14);
            jkSfx('playExplosion');
        }
        if (this.t >= this.dur) this.active = false;
    }
    draw() { if (typeof jkDrawVerdict === 'function') jkDrawVerdict(this); }
}

// ---------- Entity: Kết liễu ALL IN ----------
class JkFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.seed = Math.round(Math.random() * 1000) / 100;
        this.t = 0; this.dur = 120; this.active = true;
    }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof jkDrawFinisher === 'function') jkDrawFinisher(this); }
    drawOver() { if (typeof jkDrawFinisherOver === 'function') jkDrawFinisherOver(this); }
}

// ==========================================
// Ném bài
// ==========================================
function jkSpawnCard(p, card, off, mult) {
    const dir = jkDir(p), s = jkSuitOf(card), joker = s === 'J';
    const cx = p.x + p.w / 2 + off;
    const allIn = joker && p.jkAllIn;
    const dmg = p.damage * mult * (joker ? (allIn ? 1.5 : 2) : 1);
    const spd = joker ? 12.5 : 9;
    spawnBullet(p, {
        x: cx - 5, y: dir < 0 ? p.y - 14 : p.y + p.h, w: 10, h: 14,
        vx: 0, vy: dir * spd, dmg,
        isPiercing: s === 'S' || joker,
        hook: 'joker', jk: s, jkV: card.length > 1 ? card[1] : '', jkCopy: p.jkCopy || '',
        jkT: 0, jkPh: Math.round(Math.random() * 628) / 100, jkAmp: joker ? 2.6 + Math.round(Math.random() * 15) / 10 : 0,
        jkBoom: false, jkHit: false,
    });
}

function jkThrow(p) {
    if (!p.jkHand || !p.jkHand.length || p.jkReload > 0) return;
    const pair = jkE1(p) && p.jkHand.length >= 2;
    const n = pair ? 2 : 1;
    // Evo 1: sau 5 lần ném không ra Joker -> chắc chắn Joker
    if (jkE1(p)) {
        const hasJ = p.jkHand.slice(0, n).some(c => jkSuitOf(c) === 'J');
        if (!hasJ && p.jkPity >= 4) { p.jkHand[0] = jkJoker(p); addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -18 : p.h + 22), 'BÀI TẨY!', JK_PURPLE, 12); }
    }
    const cards = p.jkHand.splice(0, n);
    if (cards.some(c => jkSuitOf(c) === 'J')) p.jkPity = 0; else p.jkPity = (p.jkPity || 0) + 1;
    const mult = pair ? 0.6 : 1;                         // 2 lá/lần: mỗi lá 0.6 dame (cân bằng)
    cards.forEach((c, i) => jkSpawnCard(p, c, pair ? (i ? 5 : -5) : 0, mult));
    p.jkGCD = 15; p.jkThrowFx = 10;
    jkCopyOnThrow(p, cards);
    if (!p.jkHand.length) p.jkReload = jkReloadMax(p);
    jkSfx('playShoot');
}

// Evo 2 — hiệu ứng copy kích hoạt khi ném (Cơ Động / Sinh Tồn)
function jkCopyOnThrow(p, cards) {
    const role = p.jkCopy;
    if (!role) return;
    const heart = cards.some(c => jkSuitOf(c) === 'H' || jkSuitOf(c) === 'J');
    if (role === 'Cơ Động') {
        p.jkDashT = Math.max(p.jkDashT || 0, 4);
        p.jkDashDir = p.jkMoveDir || (Math.random() < 0.5 ? -1 : 1); p.jkDashV = 6;
        if (heart) p.hp = Math.min(p.maxHp, p.hp + 0.25 * jkPow(p));
    } else if (role === 'Sinh Tồn') {
        p.jkDR = 120;
        if (heart) {
            p.hp = Math.min(p.maxHp, p.hp + 1);
            if (!((p.shield || 0) >= 1)) p.shield = (p.shield || 0) + 1;
            addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -18 : p.h + 22), '+1 HP +1 KHIÊN', '#67e8f9', 11);
        }
    }
}

// Tráo Bài (giữ 0.35s)
function jkSwap(p) {
    p.jkSwapCd = 240;
    p.jkDashT = 8; p.jkDashV = 7;
    p.jkDashDir = p.jkMoveDir || (p.x + p.w / 2 < canvas.width / 2 ? 1 : -1);
    if (p.jkHand && p.jkHand.length && p.jkReload <= 0) {
        const cur = jkSuitOf(p.jkHand[0]);
        let nc = cur, guard = 0;
        while (jkSuitOf(nc) === cur && guard++ < 30) nc = jkDrawCard(p, jkFull(p) ? 0.3 : undefined);
        p.jkHand[0] = nc;
    }
    if (jkE1(p)) {
        if (!p.jkHand) p.jkHand = [];
        for (let i = 0; i < 2 && p.jkHand.length < jkHandMax(p); i++) p.jkHand.push(jkDrawCard(p));
        if (p.jkReload > 0) p.jkReload = 0;
        p.jkInvis = 30;
        p.invincibleTimer = Math.max(p.invincibleTimer || 0, 30);
    }
    p.jkSwapFx = 20;
    addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -18 : p.h + 22), 'TRÁO BÀI!', JK_GOLD, 12);
    spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, JK_PURPLE, 10);
    jkSfx('playDash');
}

// ==========================================
// Thoát Hiểm
// ==========================================
function jkEscapeX(p) {
    const e = jkEnemy(p), ox = p.x;
    let best = ox, bestS = -1e9;
    for (let x = 6; x <= canvas.width - p.w - 6; x += 8) {
        const far = Math.abs(x - ox);
        let s = Math.min(far, 220) + Math.random() * 40;
        if (far < 100) s -= 400;
        if (e && e.bullets) for (const b of e.bullets) {
            const tw = p.id === 1 ? b.vy > 0 : b.vy < 0;
            if (tw && Math.abs(b.x + (b.w || 0) / 2 - (x + p.w / 2)) < p.w) s -= 60;
        }
        if (e && Math.abs(e.x + e.w / 2 - (x + p.w / 2)) < 30) s -= 50;
        if (s > bestS) { bestS = s; best = x; }
    }
    return Math.max(0, Math.min(canvas.width - p.w, best));
}
function jkTryEscape(p) {
    if (!((p.jkEsc || 0) > 0)) return false;
    p.jkEsc--;
    if (jkE2(p) && p.jkEsc < p.jkEscMax && !(p.jkEscT > 0)) p.jkEscT = jkFull(p) ? 2700 : 3600;
    const ox = p.x, oy = p.y;
    bodyEffects.push(new JkDecoy(p, ox, oy));
    p.x = jkEscapeX(p);
    p.hp = Math.max(p.hp, 0.05);
    p.invincibleTimer = Math.max(p.invincibleTimer || 0, 120);
    p.bleedTimer = 0; p.burnTimer = 0; p.acidBurnTimer = 0; p.kbX = 0;
    p.jkDashT = 0;
    bodyEffects.push(new JkEscapeFx(p, p.x + p.w / 2, p.y + p.h / 2));
    explosions.push(new Explosion(ox + p.w / 2, oy + p.h / 2, 60, 'rgba(168, 85, 247,', 0, p));
    addFloatingText(ox + p.w / 2, oy + (p.id === 1 ? -26 : p.h + 30), 'THOÁT HIỂM!', JK_PURPLE, 17);
    triggerScreenShake(5, 12);
    jkSfx('playRevive');
    return true;
}

// ==========================================
// Hiệu ứng lá bài khi trúng
// ==========================================
function jkClubBoom(b, owner, x, y, victim) {
    if (b.jkBoom) return;
    b.jkBoom = true;
    const e = jkEnemy(owner), pw = jkPow(owner);
    const big = b.jk === 'J' && b.jkV === 'R';
    const R = big ? 70 : 44;
    explosions.push(new Explosion(x, y, R, big ? 'rgba(244, 63, 94,' : 'rgba(74, 222, 128,', 0, owner));
    if (jkAlive(e) && Math.abs(e.x + e.w / 2 - x) < R + e.w / 2 && Math.abs(e.y + e.h / 2 - y) < R * 0.8) {
        if (e !== victim) e.takeDamage(0.4 * owner.damage * pw, owner);
        if (jkAlive(e)) e.kbX = (e.x + e.w / 2 < x ? -1 : 1) * (big ? 9 : 6) * pw;
    }
}

BulletHooks.register('joker', {
    hit(b, o, v, dealt) {
        if (!o || !v) return;
        const x = b.x + b.w / 2, y = b.y + b.h / 2, s = b.jk, J = s === 'J', pw = jkPow(o);
        b.jkHit = true;
        spawnSparkParticles(x, y, JK_SUIT[s].c, 6);
        if (s === 'H' || J) o.hp = Math.min(o.maxHp, o.hp + 0.25 * pw);
        if (s === 'D' || J) { const c = Math.round(5 * pw); jkCoins(o, c); addFloatingText(x, y - 10, '+$' + c, JK_GOLD, 11); }
        if (s === 'C' || J) jkClubBoom(b, o, x, v.y + v.h / 2, v);
        if ((s === 'S' || J) && jkAlive(v)) { v.bleedTimer = Math.max(v.bleedTimer || 0, Math.round(120 * pw)); v.bleedDmg = Math.max(v.bleedDmg || 0, 0.05); }
        // Joker Đỏ / Đen (Evo 1)
        if (J && b.jkV === 'R') {
            o.hp = Math.min(o.maxHp, o.hp + 0.5 * pw);
            if (jkAlive(v)) v.freezeTimer = Math.max(v.freezeTimer || 0, 30);
            addFloatingText(x, y - 18, 'JOKER ĐỎ!', '#f43f5e', 13);
        } else if (J && b.jkV === 'B') {
            if (jkAlive(v)) v.silenceTimer = Math.max(v.silenceTimer || 0, 60);
            bodyEffects.push(new JkZone(o, x, v.y + v.h / 2, 40, 120, 'silence', false));
            addFloatingText(x, y - 18, 'JOKER ĐEN - CÂM!', '#c4b5fd', 13);
        }
        // Wildcard Copy (Evo 2) — hiệu ứng copy khi trúng
        if (b.jkCopy === 'Đối Đầu' && jkAlive(v)) {
            v.takeDamage(v.maxHp * 0.04 * pw, o, { unavoidable: true });
            if ((s === 'H' || J) && jkAlive(v)) {
                o.hp = Math.min(o.maxHp, o.hp + 0.25 * pw);
                v.bleedTimer = Math.max(v.bleedTimer || 0, 120); v.bleedDmg = Math.max(v.bleedDmg || 0, v.maxHp * 0.01);
            }
        } else if (b.jkCopy === 'Kiểm Soát') {
            const hb = s === 'H' || J;
            bodyEffects.push(new JkZone(o, x, v.y + v.h / 2, hb || s === 'C' ? 46 : 34, 120, 'slow', hb || s === 'S'));
        }
        if (J && dealt > 0) {
            if (jkE2(o)) {
                o.jkCopy = jkRole(v); o.jkCopyHands = 1;
                addFloatingText(o.x + o.w / 2, o.y + (o.id === 1 ? -22 : o.h + 26), 'SAO CHÉP: ' + o.jkCopy.toUpperCase(), JK_PINK, 12);
                if (o.jkEscT > 0) o.jkEscT = Math.max(1, o.jkEscT - 120);
            }
            if (jkFull(o)) {
                o.jkJHits = (o.jkJHits || 0) + 1;
                if (o.jkJHits >= 5 && !(o.jkVerdictCd > 0) && jkAlive(v)) {
                    o.jkJHits = 0; o.jkVerdictCd = 1500;
                    bodyEffects.push(new JkVerdict(o, v));
                    addFloatingText(v.x + v.w / 2, v.y + (v.id === 1 ? -26 : v.h + 30), 'PHÁN QUYẾT JOKER!', JK_GOLD, 15);
                }
            }
        }
    },
    truckDmgMult(b) { return b.jk === 'D' || b.jk === 'J' ? 10 : 1; },
    obstacle(b, o, obj, kind) {
        if (kind === 'crate' && (b.jk === 'D' || b.jk === 'J')) { const c = Math.round(5 * jkPow(o)); jkCoins(o, c); addFloatingText(b.x, b.y - 10, '+$' + c, JK_GOLD, 11); }
        if (b.jk === 'C' && !b.jkBoom) jkClubBoom(b, o, b.x + b.w / 2, b.y + b.h / 2, null);
        if (b.jkCopy === 'Kiểm Soát' && kind !== 'truck') bodyEffects.push(new JkZone(o, b.x + b.w / 2, b.y + b.h / 2, 34, 120, 'slow', false));
    },
    draw(b) { if (typeof jkDrawBullet === 'function') jkDrawBullet(b); },
});

// Đạn Joker lượn cong + Chuồn nổ khi bay qua làn địch
function jkUpdateBullets(p) {
    const e = jkEnemy(p);
    const ey = e ? e.y + e.h / 2 : (p.id === 1 ? 40 : canvas.height - 40);
    for (let i = p.bullets.length - 1; i >= 0; i--) {
        const b = p.bullets[i];
        if (b.hook !== 'joker') continue;
        b.jkT++;
        if (b.jk === 'J' && b.jkAmp) {
            b.vx = Math.sin(b.jkPh + b.jkT * 0.16) * b.jkAmp;
            if (b.x < 6) b.vx = Math.abs(b.vx); else if (b.x + b.w > canvas.width - 6) b.vx = -Math.abs(b.vx);
        }
        if ((b.jk === 'C' || b.jk === 'J') && !b.jkBoom) {
            const cy = b.y + b.h / 2;
            const past = p.id === 1 ? cy <= ey : cy >= ey;
            if (past) {
                jkClubBoom(b, p, b.x + b.w / 2, ey, null);
                if (b.jk === 'C') { p.bullets.splice(i, 1); continue; }
            }
        }
    }
}

CharHooks.register('joker', {
    setup() {
        this.jkHand = []; this.jkReload = 0; this.jkPity = 0; this.jkAllIn = false;
        this.jkGCD = 0; this.jkHold = 0; this.jkPrevS = false; this.jkHoldUsed = false;
        this.jkSwapCd = 0; this.jkDashT = 0; this.jkDashDir = 0; this.jkDashV = 0; this.jkMoveDir = 0;
        this.jkInvis = 0; this.jkDR = 0; this.jkThrowFx = 0; this.jkSwapFx = 0;
        this.jkCopy = ''; this.jkCopyHands = 0;
        this.jkEscMax = jkFull(this) ? 2 : 1; this.jkEsc = 1; this.jkEscT = 0;
        this.jkJHits = 0; this.jkVerdictCd = 0;
        this.ammo = 0;
        jkNewHand(this);
    },
    update() {
        if (this.jkGCD > 0) this.jkGCD--;
        if (this.jkSwapCd > 0) this.jkSwapCd--;
        if (this.jkInvis > 0) this.jkInvis--;
        if (this.jkDR > 0) this.jkDR--;
        if (this.jkThrowFx > 0) this.jkThrowFx--;
        if (this.jkSwapFx > 0) this.jkSwapFx--;
        if (this.jkVerdictCd > 0) this.jkVerdictCd--;
        // Hòm đạn -> rút ngay tay bài mới
        if (this.ammo > 0) { this.ammo = 0; jkNewHand(this); }
        if (this.jkReload > 0 && --this.jkReload <= 0) jkNewHand(this);
        if ((!this.jkHand || !this.jkHand.length) && !(this.jkReload > 0)) this.jkReload = jkReloadMax(this);
        // Hồi Thoát Hiểm (Evo 2 / Full Evo — chỉ đếm sau khi đã kích hoạt)
        if (this.jkEscT > 0 && --this.jkEscT <= 0) {
            this.jkEsc = Math.min(Math.max(this.jkEscMax, this.jkEsc), this.jkEsc + 1);
            if (this.jkEsc < this.jkEscMax) this.jkEscT = jkFull(this) ? 2700 : 3600;
            addFloatingText(this.x + this.w / 2, this.y + (this.id === 1 ? -20 : this.h + 24), 'THOÁT HIỂM SẴN SÀNG', JK_PURPLE, 11);
        }
        if (this.jkDashT > 0) {
            this.jkDashT--;
            this.x = Math.max(0, Math.min(canvas.width - this.w, this.x + this.jkDashDir * this.jkDashV));
        }
        jkUpdateBullets(this);
    },
    speed(s) { return s; },
    shoot(inp) {
        const s = !!inp.s;
        const released = !s && this.jkPrevS;
        this.jkPrevS = s;
        this.jkMoveDir = inp.l && !inp.r ? -1 : (inp.r && !inp.l ? 1 : 0);
        if (s) {
            this.jkHold++;
            if (this.jkHold === JK_HOLD && !this.jkHoldUsed) {
                this.jkHoldUsed = true;
                if (this.jkSwapCd <= 0) jkSwap(this);
                else addFloatingText(this.x + this.w / 2, this.y + (this.id === 1 ? -16 : this.h + 20), 'TRÁO BÀI ' + Math.ceil(this.jkSwapCd / 60) + 's', '#94a3b8', 10);
            }
        } else if (released) {
            if (!this.jkHoldUsed && this.jkHold < JK_HOLD && this.jkGCD <= 0) jkThrow(this);
            this.jkHold = 0; this.jkHoldUsed = false;
        } else { this.jkHold = 0; this.jkHoldUsed = false; }
        return true;
    },
    beforeLethal() { return jkTryEscape(this); },
});

// Takedamage wrapper: giảm sát thương (copy Sinh Tồn) + kết liễu ALL IN (nối tiếp wrapper sẵn có)
(function () {
    const orig = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker) {
        if (this.weapon === 'joker' && this.jkDR > 0 && typeof amount === 'number') arguments[0] = amount * 0.7;
        const before = this.hp;
        const r = orig.apply(this, arguments);
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && attacker.weapon === 'joker'
            && typeof bodyEffects !== 'undefined' && !bodyEffects.some(e => e instanceof JkFinisher)) {
            bodyEffects.push(new JkFinisher(attacker, this));
            triggerScreenShake(10, 18);
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, JK_GOLD, 24);
            jkSfx('playExplosion');
        }
        return r;
    };
})();
