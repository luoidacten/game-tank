// ==========================================
// Thợ May (tailor) — "Kim chỉ là vũ khí sao?" (docs/BODY_MOI_3.md #71)
// ------------------------------------------
// Nhấp: KIM KHÂU bay nhanh (0.8) -> chạm biên / vật cản / trúng đích cắm thành CỌC CHỈ 8s (tối đa 3, cọc cũ nhất mất).
// ĐƯỜNG CHỈ CĂNG: Thợ May -> mỗi cọc + chuỗi cọc nối nhau. Địch chạm chỉ: chậm 35% + 0.25 st/s.
// Trúng trực tiếp: MŨI KHÂU 5s, nối vào cọc gần nhất (lệch ngang > 180px -> bị giật ngược lại).
// Giữ 0.6s (hồi 7s): RÚT CHỈ XIẾT CHẶT — mọi cọc phóng về Thợ May, cắt xuyên mọi thứ (0.6 mỗi cây).
//   KHÂU CHÉO: địch đang Mũi Khâu / chạm chỉ -> kéo về tâm các cọc, 1.2 st + Trói Chân 1.25s.
// Evo 1: 4 cọc 12s, chỉ chậm 50% + làm chậm 30% đạn thường địch xuyên qua; mỗi cọc thu về +0.25 Giáp Ảo (tối đa 2).
// Evo 2: Búp Bê Vải (HP 3) đầu hiệp & mỗi 14s trên nửa sân mình; st vào búp bê truyền 60% sang địch đang Mũi Khâu;
//   Rút Chỉ -> búp bê phóng kim về phía địch.
// Full: 5 cọc, 5 kim; >= 3 cọc bên sân địch tạo LĨNH VỰC CẮT MAY (bao lồi): cấm lướt/dịch chuyển, 0.4 HP/s;
//   Rút Chỉ hồi 4.5s, cọc không mất mà chụm quanh địch rồi bung ngược về chỗ cũ.
// Juggernaut (miễn khống chế): không bị chậm / giật / trói (vẫn nhận sát thương).
// Trạng thái là trường thuần trên player / entity trong bodyEffects (đồng bộ online).
// ==========================================

const TL_SILVER = '#e0f7fa', TL_CYAN = '#67e8f9', TL_GOLD = '#fcd34d', TL_PINK = '#f472b6';
const TL_HOLD = 36, TL_LEASH = 180;

function tlE1(p) { return p.hasUpgrade('evo_tailor_1'); }
function tlE2(p) { return p.hasUpgrade('evo_tailor_2'); }
function tlFull(p) { return tlE1(p) && tlE2(p); }
function tlIs(p) { return !!p && p.weapon === 'tailor'; }
function tlEnemy(p) { return p === p1 ? p2 : p1; }
function tlTeam(id) { return id === 1 ? p1 : p2; }
function tlDir(p) { return p.id === 1 ? -1 : 1; }
function tlAlive(t) { return t && t.hp > 0; }
function tlSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function tlTxt(o, s, c, sz) { addFloatingText(o.x + o.w / 2, o.y + (o.id === 1 ? -18 : o.h + 22), s, c, sz || 12); }
function tlScale(p) { return (p.damage || 0.8) / 0.8; }
function tlImmune(e) { return e && e.weapon === 'juggernaut'; }
function tlMaxPins(p) { return tlFull(p) ? 5 : (tlE1(p) ? 4 : 3); }
function tlPinLife(p) { return tlE1(p) ? 720 : 480; }
function tlCdMax(p) { return tlFull(p) ? 270 : 420; }
function tlPins(p, all) {
    return bodyEffects.filter(o => o instanceof TlPin && o.active && o.team === p.id && (all || o.mode === 'pin')).sort((a, b) => a.uid - b.uid);
}
function tlEnemySide(p, o) { return p.id === 1 ? o.y < canvas.height / 2 : o.y > canvas.height / 2; }
function tlHitR(x, y, r, o) {
    const nx = Math.max(o.x, Math.min(o.x + o.w, x)), ny = Math.max(o.y, Math.min(o.y + o.h, y));
    return (x - nx) * (x - nx) + (y - ny) * (y - ny) <= r * r;
}
// đoạn thẳng cắt hình chữ nhật (Liang–Barsky), nới pad px
function tlSegRect(ax, ay, bx, by, o, pad) {
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
// Các sợi chỉ: Thợ May -> từng cọc, cọc nối tiếp nhau (Full & >= 3 cọc: khép vòng)
function tlThreads(p) {
    const pins = tlPins(p), S = [];
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    for (const q of pins) S.push([cx, cy, q.x, q.y]);
    for (let i = 1; i < pins.length; i++) S.push([pins[i - 1].x, pins[i - 1].y, pins[i].x, pins[i].y]);
    if (tlFull(p) && pins.length >= 3) S.push([pins[pins.length - 1].x, pins[pins.length - 1].y, pins[0].x, pins[0].y]);
    return S;
}
// bao lồi (monotone chain)
function tlHull(pts) {
    const P = pts.map(q => ({ x: Math.round(q.x * 10) / 10, y: Math.round(q.y * 10) / 10 })).sort((a, b) => a.x - b.x || a.y - b.y);
    if (P.length < 3) return [];
    const cr = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    const lo = [], up = [];
    for (const q of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (let i = P.length - 1; i >= 0; i--) { const q = P[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    const h = lo.slice(0, -1).concat(up.slice(0, -1));
    return h.length >= 3 ? h : [];
}
function tlInPoly(x, y, poly) {
    let ins = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const a = poly[i], b = poly[j];
        if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) ins = !ins;
    }
    return ins;
}

// ---------- Entity: Cọc Chỉ / Kim bay ----------
// mode: 'pin' (cắm) | 'ret' (bay về Thợ May rồi mất) | 'conv' (Full: chụm vào địch) | 'back' (Full: bung về chỗ cũ)
class TlPin {
    constructor(team, uid, x, y, life) {
        this.team = team; this.uid = uid; this.x = x; this.y = y; this.ox = x; this.oy = y;
        this.tx = x; this.ty = y; this.life = life; this.maxLife = life; this.mode = 'pin';
        this.t = 0; this.mt = 0; this.hitDone = false; this.ang = 0; this.active = true;
        this.seed = Math.round(Math.random() * 600) / 100;
    }
    update() {
        const own = tlTeam(this.team);
        if (!own || !tlIs(own)) { this.active = false; return; }
        this.t++;
        if (this.mode === 'pin') { if (--this.life <= 0) this.active = false; return; }
        this.mt++;
        let tx = this.tx, ty = this.ty;
        if (this.mode === 'ret') { tx = own.x + own.w / 2; ty = own.y + own.h / 2; }
        const dx = tx - this.x, dy = ty - this.y, L = Math.hypot(dx, dy), sp = 14;
        this.ang = Math.atan2(dy, dx);
        const step = Math.min(sp, L);
        const px = this.x, py = this.y;
        this.x += L > 0 ? dx / L * step : 0; this.y += L > 0 ? dy / L * step : 0;
        if (this.mode !== 'back') tlCutPath(own, this, px, py);
        if (L <= sp + 0.5 || this.mt > 90) {
            if (this.mode === 'ret') {
                this.active = false;
                if (tlE1(own) && own.hp > 0) {
                    own.tlVS = Math.min(2, (own.tlVS || 0) + 0.25); own.tlVSFx = 14;
                    spawnSparkParticles(own.x + own.w / 2, own.y + own.h / 2, TL_GOLD, 4);
                }
            } else if (this.mode === 'conv') {
                this.mode = 'back'; this.mt = 0; this.tx = this.ox; this.ty = this.oy;
                spawnSparkParticles(this.x, this.y, TL_SILVER, 4);
            } else { this.mode = 'pin'; this.x = this.ox; this.y = this.oy; this.mt = 0; }
        }
    }
    draw() { if (typeof tlDrawPin === 'function') tlDrawPin(this); }
}
// Kim thu về cắt xuyên: địch (1 lần mỗi kim), thùng, vật cản
function tlCutPath(own, k, px, py) {
    const e = tlEnemy(own);
    if (!k.hitDone && tlAlive(e) && (tlSegRect(px, py, k.x, k.y, e, 5)) && gameState.phase === 'playing') {
        k.hitDone = true;
        e.takeDamage(0.6 * tlScale(own), own, { unavoidable: true });
        spawnSparkParticles(e.x + e.w / 2, e.y + e.h / 2, TL_SILVER, 6);
    }
    if (typeof crates !== 'undefined') for (const c of crates) if (c.active && tlHitR(k.x, k.y, 6, c)) { c.active = false; crateOnBreak(c, own); grantCrateLoot(c, own); }
}

// ---------- Entity: Búp Bê Vải (Evo 2) ----------
class TlDoll {
    constructor(team, x, y) {
        this.team = team; this.w = 18; this.h = 22; this.x = x - 9; this.y = y - 11;
        this.hp = 3; this.maxHp = 3; this.did = 1 + Math.floor(Math.random() * 1e6); this.t = 0; this.linkFx = 0; this.hitFx = 0; this.active = true;
    }
    update() {
        const own = tlTeam(this.team), e = own ? tlEnemy(own) : null;
        if (!own || !tlIs(own) || gameState.phase !== 'playing') { if (!own || !tlIs(own)) this.active = false; return; }
        this.t++;
        if (this.linkFx > 0) this.linkFx--;
        if (this.hitFx > 0) this.hitFx--;
        if (!e || !e.bullets) return;
        for (let j = e.bullets.length - 1; j >= 0; j--) {
            const b = e.bullets[j];
            if (b.tlDoll === this.did) continue;
            if (!(b.x < this.x + this.w && b.x + (b.w || 6) > this.x && b.y < this.y + this.h && b.y + (b.h || 6) > this.y)) continue;
            const d = Math.max(0, b.dmg || 1);
            this.hp -= d; this.hitFx = 8;
            if (b.isPiercing) b.tlDoll = this.did; else e.bullets.splice(j, 1);
            if (tlAlive(e) && e.tlStitch > 0) {
                e.takeDamage(0.6 * d, own, { unavoidable: true });
                this.linkFx = 18;
                spawnSparkParticles(e.x + e.w / 2, e.y + e.h / 2, TL_PINK, 6);
            }
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, TL_PINK, 4);
            if (this.hp <= 0) { this.active = false; explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 24, 'rgba(244, 114, 182,', 0, own)); return; }
        }
    }
    draw() { if (typeof tlDrawDoll === 'function') tlDrawDoll(this); }
}

// ---------- Entity: Kết liễu "ĐƯỜNG KIM MŨI CHỈ" ----------
class TlFinisher {
    constructor(owner, victim) {
        this.team = owner.id; this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.vw = victim.w; this.vh = victim.h; this.t = 0; this.dur = 130; this.active = true;
        this.seed = Math.round(Math.random() * 1000) / 100;
    }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { }
    drawOver() { if (typeof tlDrawFinisherOver === 'function') tlDrawFinisherOver(this); }
}

// ---------- Cọc / Mũi Khâu ----------
function tlPlant(p, x, y) {
    const pins = tlPins(p, true);
    while (pins.length >= tlMaxPins(p)) { const o = pins.shift(); o.active = false; spawnSparkParticles(o.x, o.y, TL_SILVER, 3); }
    x = Math.max(4, Math.min(canvas.width - 4, x)); y = Math.max(4, Math.min(canvas.height - 4, y));
    p.tlUid = (p.tlUid || 0) + 1;
    const q = new TlPin(p.id, p.tlUid, x, y, tlPinLife(p));
    bodyEffects.push(q);
    spawnSparkParticles(x, y, TL_SILVER, 4);
    return q;
}
function tlNearestPin(p, x, exclude) {
    let best = null, bd = 1e9;
    for (const q of tlPins(p)) { if (q === exclude) continue; const d = Math.abs(q.x - x); if (d < bd) { bd = d; best = q; } }
    return best;
}
function tlStitchOn(p, e, hx, hy) {
    const near = tlNearestPin(p, e.x + e.w / 2, null);
    const q = tlPlant(p, hx, hy);
    e.tlStitch = 300; e.tlAnchor = (near && near.active ? near : q).uid;
    tlTxt(e, 'MŨI KHÂU!', TL_PINK, 12);
}
function tlClearVictim(e) {
    if (!e) return;
    e.tlStitch = 0; e.tlAnchor = 0; e.tlRoot = 0; e.tlOnThread = false; e.tlInDom = false; e.tlLastX = undefined;
}

// ---------- Bắn ----------
function tlShoot(p, now) {
    if (!(p.ammo > 0)) return;
    p.ammo--; p.lastShot = now; p.tlRecoil = 8;
    const dir = tlDir(p);
    spawnBullet(p, { x: p.x + p.w / 2 - 2, y: dir < 0 ? p.y - 16 : p.y + p.h + 2, w: 4, h: 14, vy: dir * C.bulletSpeed * 1.5, dmg: p.damage, hook: 'tailor' });
    tlSfx('playShoot');
}
BulletHooks.register('tailor', {
    hit(b, o, v) {
        if (b.tlDone) return; b.tlDone = true;
        if (v && tlAlive(v)) tlStitchOn(o, v, b.x + b.w / 2, b.y + b.h / 2);
        else tlPlant(o, b.x + b.w / 2, b.y + b.h / 2);
    },
    edge(b, o) { if (!b.tlDone) { b.tlDone = true; tlPlant(o, b.x + b.w / 2, b.y + b.h / 2); } },
    obstacle(b, o) { if (!b.tlDone) { b.tlDone = true; tlPlant(o, b.x + b.w / 2, b.y + b.h / 2); } },
    draw(b) { if (typeof tlDrawNeedle === 'function') tlDrawNeedle(b); },
});
BulletHooks.register('tailor_doll', { draw(b) { if (typeof tlDrawNeedle === 'function') tlDrawNeedle(b, true); } });

// ---------- Rút Chỉ Xiết Chặt ----------
function tlYank(p) {
    const pins = tlPins(p), e = tlEnemy(p), s = tlScale(p);
    p.tlCd = tlCdMax(p); p.tlYankFx = 24;
    triggerScreenShake(4, 8); tlSfx('playDash');
    tlTxt(p, 'RÚT CHỈ!', TL_SILVER, 13);
    // Khâu Chéo
    if (tlAlive(e) && (e.tlStitch > 0 || e.tlOnThread) && gameState.phase === 'playing') {
        let cx = p.x + p.w / 2;
        if (pins.length) cx = pins.reduce((a, q) => a + q.x, 0) / pins.length;
        if (!tlImmune(e)) {
            const dx = cx - (e.x + e.w / 2);
            e.x = Math.max(0, Math.min(canvas.width - e.w, e.x + Math.max(-90, Math.min(90, dx * 0.6))));
            e.kbX = 0; e.tlRoot = 75; e.tlRootX = e.x;
        }
        e.tlStitch = 0;
        e.takeDamage(1.2 * s, p, { unavoidable: true });
        e.tlCrossFx = 30;
        addFloatingText(e.x + e.w / 2, e.y + (e.id === 1 ? -30 : e.h + 34), tlImmune(e) ? 'KHÂU CHÉO! (MIỄN TRÓI)' : 'KHÂU CHÉO!', TL_PINK, 14);
        spawnSparkParticles(e.x + e.w / 2, e.y + e.h / 2, TL_SILVER, 14);
    }
    // Cọc phóng về (Full: chụm quanh địch rồi bung ra)
    pins.forEach((q, i) => {
        q.mt = 0; q.hitDone = false;
        if (tlFull(p) && tlAlive(e)) {
            const an = q.seed + i * Math.PI * 2 / Math.max(1, pins.length);
            q.mode = 'conv'; q.tx = e.x + e.w / 2 + Math.cos(an) * 12; q.ty = e.y + e.h / 2 + Math.sin(an) * 10;
        } else q.mode = 'ret';
    });
    // Búp bê phóng kim về phía địch
    if (tlE2(p) && tlAlive(e)) for (const d of bodyEffects) {
        if (!(d instanceof TlDoll) || !d.active || d.team !== p.id) continue;
        const sx = d.x + d.w / 2, sy = d.y + d.h / 2, v = aimVelocity(sx, sy, e, C.bulletSpeed * 1.4);
        spawnBullet(p, { x: sx - 2, y: sy - 2, w: 4, h: 10, vx: v.vx, vy: v.vy, dmg: 0.6 * s, hook: 'tailor_doll' });
        d.linkFx = 12;
    }
}

// ---------- Tick chính (chạy cả khi bị choáng) ----------
function tlTick(p) {
    if (p.tlCd > 0) p.tlCd--;
    if (p.tlRecoil > 0) p.tlRecoil--;
    if (p.tlYankFx > 0) p.tlYankFx--;
    if (p.tlVSFx > 0) p.tlVSFx--;
    p.tlT = (p.tlT || 0) + 1;
    const playing = gameState.phase === 'playing';
    // Búp Bê Vải (Evo 2)
    if (tlE2(p) && playing && p.hp > 0 && --p.tlDollT <= 0) {
        p.tlDollT = 840;
        bodyEffects.forEach(d => { if (d instanceof TlDoll && d.team === p.id) d.active = false; });
        const x = 40 + Math.random() * (canvas.width - 80), y = canvas.height * (p.id === 1 ? 0.64 : 0.36);
        bodyEffects.push(new TlDoll(p.id, x, y));
        addFloatingText(x, y - 18, 'BÚP BÊ VẢI', TL_PINK, 11);
    }
    const e = tlEnemy(p);
    p.tlDom = [];
    if (!tlAlive(e) || !playing) return;
    const imm = tlImmune(e), threads = tlThreads(p);
    if (e.tlCrossFx > 0) e.tlCrossFx--;
    // Đường Chỉ Căng
    e.tlOnThread = threads.some(s => tlSegRect(s[0], s[1], s[2], s[3], e, 1));
    if (e.tlOnThread) {
        if (!imm) addStatusSlow(e, tlE1(p) ? 0.5 : 0.65);
        if (p.tlT % 15 === 0) e.takeDamage(0.0625 * tlScale(p), p, { unavoidable: true, isDot: true });
    }
    // Evo 1: chậm 30% đạn thường địch xuyên màn chỉ
    if (tlE1(p) && e.bullets && threads.length) for (const b of e.bullets) {
        if (b.hook || b.tlSlowed) continue;
        if (threads.some(s => tlSegRect(s[0], s[1], s[2], s[3], b, 1))) {
            b.tlSlowed = true; b.vx = (b.vx || 0) * 0.7; b.vy = (b.vy || 0) * 0.7;
            spawnSparkParticles(b.x + (b.w || 6) / 2, b.y + (b.h || 6) / 2, TL_SILVER, 2);
        }
    }
    // Mũi Khâu: dây nối cọc, lệch > 180px -> giật ngược
    if (e.tlStitch > 0) {
        e.tlStitch--;
        let a = tlPins(p).find(q => q.uid === e.tlAnchor);
        if (!a) { a = tlNearestPin(p, e.x + e.w / 2, null); e.tlAnchor = a ? a.uid : 0; }
        if (a && !imm) {
            const dx = e.x + e.w / 2 - a.x;
            if (Math.abs(dx) > TL_LEASH) {
                e.x = Math.max(0, Math.min(canvas.width - e.w, a.x + Math.sign(dx) * (TL_LEASH - 40) - e.w / 2));
                e.kbX = 0; e.tlYankT = 12;
                tlTxt(e, 'GIẬT!', TL_PINK, 11);
                spawnSparkParticles(e.x + e.w / 2, e.y + e.h / 2, TL_PINK, 6);
            }
        }
    }
    if (e.tlYankT > 0) e.tlYankT--;
    // Trói Chân
    if (e.tlRoot > 0) {
        e.tlRoot--;
        if (!imm) { addStatusSlow(e, 0); e.x = e.tlRootX; }
    }
    // Full: Lĩnh Vực Cắt May
    e.tlInDom = false;
    if (tlFull(p)) {
        const hull = tlHull(tlPins(p).filter(q => tlEnemySide(p, q)));
        p.tlDom = hull;
        if (hull.length && tlInPoly(e.x + e.w / 2, e.y + e.h / 2, hull)) {
            e.tlInDom = true;
            if (typeof e.tlLastX === 'number' && Math.abs(e.x - e.tlLastX) > 12) e.x = e.tlLastX + Math.sign(e.x - e.tlLastX) * 4;
            if (p.tlT % 15 === 0) e.takeDamage(0.1, p, { unavoidable: true, isDot: true });
        }
    }
    e.tlLastX = e.x;
}

function tlSpawnFinisher(p, v) {
    if (typeof bodyEffects === 'undefined' || bodyEffects.some(e => e instanceof TlFinisher)) return;
    bodyEffects.push(new TlFinisher(p, v));
    triggerScreenShake(12, 22);
    spawnSparkParticles(v.x + v.w / 2, v.y + v.h / 2, TL_SILVER, 24);
    tlSfx('playExplosion');
}

// Bot: giữ 0.6s khi địch đang Mũi Khâu / chạm chỉ / trong Lĩnh Vực, hoặc đã đủ cọc
function tlBotHold(p, e) {
    if (!tlIs(p) || (p.tlCd || 0) > 0 || !tlAlive(e)) return false;
    const n = tlPins(p).length;
    if (n < 1) return false;
    return e.tlStitch > 0 || e.tlOnThread || (n >= tlMaxPins(p) && Math.random() < 0.05);
}

CharHooks.register('tailor', {
    setup() {
        this.tlCd = 0; this.tlPrevS = false; this.tlHold = 0; this.tlUsed = false; this.tlRecoil = 0;
        this.tlVS = 0; this.tlVSFx = 0; this.tlYankFx = 0; this.tlT = 0; this.tlDollT = 1; this.tlDom = [];
        tlClearVictim(this); tlClearVictim(tlEnemy(this));
        if (tlFull(this)) { this.maxAmmo += 1; this.ammo = this.maxAmmo; }
    },
    shoot(inp, now) {
        const s = !!inp.s, released = !s && this.tlPrevS;
        this.tlPrevS = s;
        if (s) {
            if (this.tlUsed) return true;
            this.tlHold++;
            if (this.tlHold >= TL_HOLD && (this.tlCd || 0) <= 0) {
                this.tlUsed = true; this.tlHold = 0;
                if (tlPins(this).length || (tlE2(this) && bodyEffects.some(d => d instanceof TlDoll && d.active && d.team === this.id))) tlYank(this);
                else tlTxt(this, 'CHƯA CÓ CỌC', '#94a3b8', 10);
            }
        } else {
            if (released && !this.tlUsed) tlShoot(this, now);
            this.tlHold = 0; this.tlUsed = false;
        }
        return true;
    },
    roundEnd() { tlClearVictim(tlEnemy(this)); this.tlVS = 0; },
});

// ---------- Bọc update: tick luôn chạy ----------
(function () {
    const origU = Player.prototype.update;
    Player.prototype.update = function () {
        if (tlIs(this)) { try { tlTick(this); } catch (err) { console.error(err); } }
        return origU.apply(this, arguments);
    };
})();

// ---------- Bọc takeDamage: Giáp Ảo (Evo 1), kết liễu ----------
(function () {
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        if (tlIs(this) && this.tlVS > 0 && typeof amount === 'number' && amount > 0 && this.hp > 0) {
            const opt = options || {};
            const blocked = (this.invincibleTimer > 0 && !opt.ignoreInvincible && !opt.unavoidable) || (this.shield > 0 && !opt.bypassShield);
            if (!blocked) {
                const ab = Math.min(this.tlVS, amount);
                this.tlVS -= ab; amount -= ab; this.tlVSFx = 14;
                if (this.tlVS < 1e-4) this.tlVS = 0;
                if (amount <= 1e-4) { addFloatingText(this.x + this.w / 2, this.y - 10, 'GIÁP ẢO', TL_SILVER, 12); return 0; }
            }
        }
        const before = this.hp;
        const r = origTD.call(this, amount, attacker, options, ...Array.prototype.slice.call(arguments, 3));
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && tlIs(attacker)) tlSpawnFinisher(attacker, this);
        return r;
    };
})();
