// ==========================================
// Thợ May (tailor) — "Kim chỉ là vũ khí sao?" (docs/BODY_MOI_3.md #71)
// ------------------------------------------
// Nhấp: KIM KHÂU bay nhanh (0.8) -> chạm biên / vật cản / trúng đích cắm thành CỌC CHỈ 8s (tối đa 3, cọc cũ nhất mất).
// ĐƯỜNG CHỈ CĂNG: Thợ May -> mỗi cọc + chuỗi cọc nối nhau. Địch chạm chỉ: chậm 35% + 0.25 st/s.
// Trúng trực tiếp: MŨI KHÂU 5s, nối vào cọc gần nhất (lệch ngang > 180px -> bị giật ngược lại).
// Giữ 0.6s (hồi 7s): RÚT CHỈ XIẾT CHẶT — mọi cọc phóng về Thợ May, cắt xuyên mọi thứ (0.6 mỗi cây).
//   KHÂU CHÉO: địch đang Mũi Khâu / chạm chỉ -> kéo về tâm các cọc, 1.2 st + Trói Chân 1.25s.
// Evo 1: 4 cọc 12s, chỉ chậm 50% + làm chậm 30% đạn thường địch xuyên qua; mỗi cọc thu về +0.25 Giáp Ảo (tối đa 2).
// BÚP BÊ KÉP (kit gốc, hồi sinh 14s sau khi bị phá):
//   BÚP BÊ TRẮNG "Hộ Mệnh" (nửa sân mình): HP = 50% Max HP Thợ May; st từ địch vào Thợ May chuyển sang Búp Bê x2.0;
//     mọi hồi máu của bộ kỹ năng vào Búp Bê trước (tràn -> 50% cho Thợ May). Bắn Kim vào Búp Bê -> TRẠM CHỈ:
//     nối chỉ vào mạng, mỗi lần mạng chỉ gây st lên địch -> Búp Bê +0.35 HP (tối đa 1 lần / 0.75s).
//   BÚP BÊ ĐEN "Nguyền Rủa" (trước làn địch, trôi chậm, HP 3, đạn địch phá được): Kim trúng -> choáng địch 0.75s
//     (hồi 3.5s mỗi mục tiêu, Juggernaut miễn) & cắm Cọc tại đó; sợi chỉ xuyên qua Búp Bê Đen -> st chỉ & Rút Chỉ +40%.
// Evo 2: Búp Bê hồi sinh 8s; Rút Chỉ -> Búp Bê Trắng phóng kim về phía địch.
//   Full: Búp Bê Trắng 75% Max HP, nhận x1.5, hồi +0.55; Búp Bê Đen HP 4, +65%.
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
function tlDollRespawn(p) { return tlE2(p) ? 480 : 840; }
function tlWhite(p) { return bodyEffects.find(d => d instanceof TlWhite && d.active && d.team === p.id) || null; }
function tlBlack(p) { return bodyEffects.find(d => d instanceof TlBlack && d.active && d.team === p.id) || null; }
// hệ số st chỉ / Rút Chỉ khi sợi chỉ xuyên Búp Bê Đen
function tlAmp(p) { return p.tlCurse ? (tlFull(p) ? 1.65 : 1.4) : 1; }
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
    // Trạm Chỉ: Búp Bê Trắng nối với Thợ May & mọi cọc
    const w = typeof TlWhite !== 'undefined' ? tlWhite(p) : null;
    if (w && w.relay) {
        const wx = w.x + w.w / 2, wy = w.y + w.h / 2;
        S.push([cx, cy, wx, wy]);
        for (const q of pins) S.push([wx, wy, q.x, q.y]);
    }
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
        e.takeDamage(0.6 * tlScale(own) * tlAmp(own), own, { unavoidable: true });
        spawnSparkParticles(e.x + e.w / 2, e.y + e.h / 2, TL_SILVER, 6);
    }
    if (typeof crates !== 'undefined') for (const c of crates) if (c.active && tlHitR(k.x, k.y, 6, c)) { c.active = false; crateOnBreak(c, own); grantCrateLoot(c, own); }
}

// ---------- Entity: Búp Bê Trắng "Hộ Mệnh" (nửa sân Thợ May) ----------
class TlWhite {
    constructor(team, x, y, maxHp) {
        this.team = team; this.w = 22; this.h = 28; this.x = x - 11; this.y = y - 14;
        this.hp = maxHp; this.maxHp = maxHp; this.relay = false; this.t = 0; this.hitFx = 0; this.healFx = 0; this.linkFx = 0; this.active = true;
    }
    update() {
        const own = tlTeam(this.team);
        if (!own || !tlIs(own)) { this.active = false; return; }
        this.t++;
        if (this.hitFx > 0) this.hitFx--;
        if (this.healFx > 0) this.healFx--;
        if (this.linkFx > 0) this.linkFx--;
    }
    draw() { if (typeof tlDrawWhite === 'function') tlDrawWhite(this); }
}
// ---------- Entity: Búp Bê Đen "Nguyền Rủa" (trước làn địch, trôi chậm) ----------
class TlBlack {
    constructor(team, x, y, maxHp) {
        this.team = team; this.w = 22; this.h = 28; this.x = x - 11; this.y = y - 14; this.vx = Math.random() < 0.5 ? -0.3 : 0.3;
        this.hp = maxHp; this.maxHp = maxHp; this.t = 0; this.hitFx = 0; this.stunFx = 0; this.did = 1 + Math.floor(Math.random() * 1e6); this.active = true;
    }
    update() {
        const own = tlTeam(this.team), e = own ? tlEnemy(own) : null;
        if (!own || !tlIs(own)) { this.active = false; return; }
        if (this.hitFx > 0) this.hitFx--;
        if (this.stunFx > 0) this.stunFx--;
        if (gameState.phase !== 'playing') return;
        this.t++;
        this.x += this.vx;
        if (this.x < 24 || this.x + this.w > canvas.width - 24) { this.vx = -this.vx; this.x = Math.max(24, Math.min(canvas.width - 24 - this.w, this.x)); }
        // cọc ghim trên búp bê trôi theo
        for (const q of bodyEffects) if (q instanceof TlPin && q.active && q.stuck === this.did && q.mode === 'pin') { q.x = this.x + this.w / 2 + q.sdx; q.ox = q.x; }
        if (!e || !e.bullets) return;
        for (let j = e.bullets.length - 1; j >= 0; j--) {
            const b = e.bullets[j];
            if (b.tlDoll === this.did) continue;
            if (!(b.x < this.x + this.w && b.x + (b.w || 6) > this.x && b.y < this.y + this.h && b.y + (b.h || 6) > this.y)) continue;
            this.hp -= Math.max(0.2, b.dmg || 1); this.hitFx = 8;
            if (b.isPiercing) b.tlDoll = this.did; else e.bullets.splice(j, 1);
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, '#a855f7', 4);
            if (this.hp <= 0) { tlDollDie(own, this); return; }
        }
    }
    draw() { if (typeof tlDrawBlack === 'function') tlDrawBlack(this); }
}
function tlDollDie(own, d) {
    d.active = false;
    const white = d instanceof TlWhite;
    if (white) own.tlWT = tlDollRespawn(own); else { own.tlBT = tlDollRespawn(own); own.tlCurse = false; }
    explosions.push(new Explosion(d.x + d.w / 2, d.y + d.h / 2, 26, white ? 'rgba(255, 255, 255,' : 'rgba(168, 85, 247,', 0, own));
    addFloatingText(d.x + d.w / 2, d.y - 10, white ? 'BÚP BÊ TRẮNG VỠ!' : 'BÚP BÊ ĐEN VỠ!', white ? '#ffffff' : '#c084fc', 11);
}
function tlSpawnDolls(p) {
    if (typeof bodyEffects === 'undefined') return;
    if (!tlWhite(p) && !(--p.tlWT > 0)) {
        const x = 50 + Math.random() * (canvas.width - 100), y = canvas.height * (p.id === 1 ? 0.66 : 0.34);
        bodyEffects.push(new TlWhite(p.id, x, y, Math.round(p.maxHp * (tlFull(p) ? 0.75 : 0.5) * 100) / 100));
        addFloatingText(x, y - 20, 'BÚP BÊ HỘ MỆNH', '#ffffff', 11);
        spawnSparkParticles(x, y, '#ffffff', 8);
    }
    if (!tlBlack(p) && !(--p.tlBT > 0)) {
        const x = 50 + Math.random() * (canvas.width - 100), y = canvas.height * (p.id === 1 ? 0.2 : 0.8);
        bodyEffects.push(new TlBlack(p.id, x, y, tlFull(p) ? 4 : 3));
        addFloatingText(x, y - 20, 'BÚP BÊ NGUYỀN RỦA', '#c084fc', 11);
        spawnSparkParticles(x, y, '#a855f7', 8);
    }
}
// Hồi máu của bộ kỹ năng: vào Búp Bê Trắng trước, tràn -> 50% cho Thợ May
function tlHeal(p, amt) {
    const w = tlWhite(p);
    if (w) {
        const add = Math.min(amt, w.maxHp - w.hp);
        w.hp += add; w.healFx = 16;
        addFloatingText(w.x + w.w / 2, w.y - 6, '+' + (Math.round(amt * 100) / 100), '#ffffff', 10);
        amt = (amt - add) * 0.5;
    }
    if (amt > 0 && p.hp > 0) p.hp = Math.min(p.maxHp, p.hp + amt);
}
// Kim của Thợ May va chạm Búp Bê: Trắng -> Trạm Chỉ; Đen -> choáng địch + cắm cọc
function tlNeedleDolls(p) {
    const w = tlWhite(p), k = tlBlack(p), e = tlEnemy(p);
    if (!p.bullets || (!w && !k)) return;
    const ov = (b, d) => b.x < d.x + d.w && b.x + (b.w || 4) > d.x && b.y < d.y + d.h && b.y + (b.h || 14) > d.y;
    for (let j = p.bullets.length - 1; j >= 0; j--) {
        const b = p.bullets[j];
        if (b.hook !== 'tailor' || b.tlDone) continue;
        if (w && !w.relay && ov(b, w)) {
            b.tlDone = true; p.bullets.splice(j, 1);
            w.relay = true; w.linkFx = 20;
            addFloatingText(w.x + w.w / 2, w.y - 8, 'TRẠM CHỈ!', TL_CYAN, 11);
            spawnSparkParticles(w.x + w.w / 2, w.y + w.h / 2, TL_SILVER, 8);
            continue;
        }
        if (k && ov(b, k)) {
            b.tlDone = true; p.bullets.splice(j, 1);
            // ghim vào mép búp bê phía Thợ May (chỉ luôn xuyên qua búp bê, cọc trôi theo)
            const q = tlPlant(p, b.x + (b.w || 4) / 2, p.id === 1 ? k.y + k.h - 4 : k.y + 4);
            q.stuck = k.did; q.sdx = Math.max(-k.w / 2 + 3, Math.min(k.w / 2 - 3, q.x - (k.x + k.w / 2)));
            k.stunFx = 24; k.hitFx = 6;
            spawnSparkParticles(k.x + k.w / 2, k.y + k.h / 2, '#a855f7', 8);
            if (tlAlive(e) && gameState.phase === 'playing') {
                if (tlImmune(e)) tlTxt(e, 'MIỄN CHOÁNG', '#94a3b8', 10);
                else if (!(e.tlStunCd > 0)) {
                    e.freezeTimer = Math.max(e.freezeTimer || 0, 45); e.tlStunCd = 210; e.tlCurseFx = 30;
                    tlTxt(e, 'NGUYỀN RỦA!', '#c084fc', 13);
                    spawnSparkParticles(e.x + e.w / 2, e.y + e.h / 2, '#a855f7', 10);
                }
            }
        }
    }
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
        e.takeDamage(1.2 * s * tlAmp(p), p, { unavoidable: true });
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
    // Evo 2: Búp Bê Trắng phóng kim về phía địch
    const d = tlWhite(p);
    if (tlE2(p) && tlAlive(e) && d) {
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
    if (p.tlRelayCd > 0) p.tlRelayCd--;
    // Búp Bê Kép
    if (playing && p.hp > 0) { tlSpawnDolls(p); tlNeedleDolls(p); }
    const e = tlEnemy(p);
    p.tlDom = [];
    if (!tlAlive(e) || !playing) { p.tlCurse = false; return; }
    const imm = tlImmune(e), threads = tlThreads(p);
    if (e.tlCrossFx > 0) e.tlCrossFx--;
    if (e.tlStunCd > 0) e.tlStunCd--;
    if (e.tlCurseFx > 0) e.tlCurseFx--;
    // Búp Bê Đen: sợi chỉ xuyên qua -> khuếch đại st chỉ / Rút Chỉ
    const bk = tlBlack(p);
    p.tlCurse = !!bk && threads.some(s => tlSegRect(s[0], s[1], s[2], s[3], bk, 0));
    // Đường Chỉ Căng
    e.tlOnThread = threads.some(s => tlSegRect(s[0], s[1], s[2], s[3], e, 1));
    if (e.tlOnThread) {
        if (!imm) addStatusSlow(e, tlE1(p) ? 0.5 : 0.65);
        if (p.tlT % 15 === 0) e.takeDamage(0.0625 * tlScale(p) * tlAmp(p), p, { unavoidable: true, isDot: true });
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
            if (p.tlT % 15 === 0) e.takeDamage(0.1 * tlAmp(p), p, { unavoidable: true, isDot: true });
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
        this.tlVS = 0; this.tlVSFx = 0; this.tlYankFx = 0; this.tlT = 0; this.tlDom = [];
        this.tlWT = 1; this.tlBT = 1; this.tlCurse = false; this.tlRelayCd = 0;
        if (typeof bodyEffects !== 'undefined') bodyEffects.forEach(d => { if ((d instanceof TlWhite || d instanceof TlBlack) && d.team === this.id) d.active = false; });
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
                if (tlPins(this).length || (tlE2(this) && tlWhite(this))) tlYank(this);
                else tlTxt(this, 'CHƯA CÓ CỌC', '#94a3b8', 10);
            }
        } else {
            if (released && !this.tlUsed) tlShoot(this, now);
            this.tlHold = 0; this.tlUsed = false;
        }
        return true;
    },
    roundEnd() { tlClearVictim(tlEnemy(this)); this.tlVS = 0; this.tlCurse = false; },
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
        // Búp Bê Trắng gánh st từ địch (khuếch đại)
        if (tlIs(this) && typeof amount === 'number' && amount > 0 && this.hp > 0 && attacker && attacker === tlEnemy(this)) {
            const opt = options || {}, w = tlWhite(this);
            const blocked = (this.invincibleTimer > 0 && !opt.ignoreInvincible && !opt.unavoidable) || (this.shield > 0 && !opt.bypassShield);
            if (w && !blocked) {
                const amp = tlFull(this) ? 1.5 : 2, take = amount * amp;
                w.hitFx = 10;
                if (take < w.hp) {
                    w.hp -= take;
                    if (!opt.isDot) addFloatingText(w.x + w.w / 2, w.y - 6, '-' + (Math.round(take * 100) / 100), '#fda4af', 10);
                    return 0;
                }
                amount = (take - w.hp) / amp; w.hp = 0;
                tlDollDie(this, w);
                if (amount <= 1e-4) return 0;
            }
        }
        const before = this.hp;
        const r = origTD.call(this, amount, attacker, options, ...Array.prototype.slice.call(arguments, 3));
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && tlIs(attacker)) tlSpawnFinisher(attacker, this);
        // Trạm Chỉ: mạng chỉ gây st lên địch -> hồi Búp Bê Trắng
        if (attacker && attacker !== this && tlIs(attacker) && this.hp < before && !(attacker.tlRelayCd > 0)) {
            const w = tlWhite(attacker);
            if (w && w.relay) { attacker.tlRelayCd = 45; w.linkFx = 14; tlHeal(attacker, tlFull(attacker) ? 0.55 : 0.35); }
        }
        return r;
    };
})();
