// ==========================================
// Dynamite (dynamite) — Thực thể: Bó Thuốc Nổ cài sẵn / dính người, Ném Cao, Khói Đen, Cục Vàng
// Mọi thực thể chỉ chứa dữ liệu thuần (team = id phe), có trong NET_CLASSES.
// ==========================================

const DYN_RING = 55;            // vòng cảnh báo / bán kính nổ của 1 bó
const DYN_BOMB_DMG = 1.8;       // sát thương 1 bó nổ (tự nổ / bị kích)
const DYN_EARLY_BONUS = 0.4;    // Evo 2: kích nổ sớm +0.4 (2.2)
const DYN_CHAIN_WIN = 36;       // cửa sổ 0.6s: bom trúng liên tiếp cùng 1 mục tiêu bị giảm dần
const DYN_CHAIN_MULT = [1, 0.7, 0.5, 0.35]; // bom 1 / 2 / 3 / 4+
const DYN_STUN = 36;            // Evo 2: bó dính người bị Nhấp Bắn kích sớm -> choáng 0.6s
let dynUid = 1;

function dynTeam(id) { return id === 1 ? p1 : p2; }
function dynFoe(p) { return p === p1 ? p2 : p1; }
function dynE1(p) { return !!p && p.hasUpgrade('evo_dyn_1'); }
function dynE2(p) { return !!p && p.hasUpgrade('evo_dyn_2'); }
function dynFull(p) { return dynE1(p) && dynE2(p) && (typeof hasFullEvo !== 'function' || hasFullEvo(p)); }
function dynLife(p) { return dynFull(p) ? 720 : (dynE1(p) ? 540 : 360); }
function dynMax(p) { return dynFull(p) ? 5 : (dynE1(p) ? 3 : 2); }
function dynChainR(p) { return dynE1(p) ? 196 : 140; }
function dynObjMult(p) { return dynFull(p) ? 5 : 3; }
function dynScale(p) { return Math.max(0.5, (p.damage || 1.5) / 1.5); } // nâng cấp Bánh Xích cũng tăng sát thương bom
function dynSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function dynBombs(team) { return bodyEffects.filter(e => e instanceof DynBomb && e.active && e.team === team); }
function dynCount(team) { return bodyEffects.filter(e => (e instanceof DynBomb || e instanceof DynLob) && e.active && e.team === team).length; }
function dynAlive(e) { return !!e && e.hp > 0; }
function dynRectDist(x, y, o) {
    const nx = Math.max(o.x, Math.min(x, o.x + o.w)), ny = Math.max(o.y, Math.min(y, o.y + o.h));
    return Math.hypot(x - nx, y - ny);
}

// ---------- Vàng (Gold Rush) ----------
function dynAddGold(p, amt, x, y) {
    if (!p || amt <= 0) return;
    if (p.id === 1) gameState.p1Coins += amt; else gameState.p2Coins += amt;
    addFloatingText(x, y - 10, `+$${amt} 💰`, '#ffd700', 13);
    bodyEffects.push(new DynNugget(p.id, x, y));
}

// ---------- Sát thương ----------
function dynHurtEnemy(p, e, dmg, chain) {
    if (!dynAlive(e)) return 0;
    if (!(e.dynChainT > 0)) e.dynChainN = 0;
    dmg *= DYN_CHAIN_MULT[Math.min(e.dynChainN | 0, DYN_CHAIN_MULT.length - 1)];
    e.dynChainN = (e.dynChainN | 0) + 1; e.dynChainT = DYN_CHAIN_WIN;
    const r = e.takeDamage(dmg, p, {}) || 0;
    if (r > 0) dynOnHit(p, e);
    return r;
}
function dynOnHit(p, e) {
    p.dynHits = (p.dynHits || 0) + 1;
    if (p.dynHits % 3 === 0) dynAddGold(p, 5, e.x + e.w / 2, e.y + e.h / 2); // Cục Vàng mỗi 3 lần trúng
}
function dynHurtObj(o, d, owner) {
    if (!o || d <= 0 || o.isImmortal) return;
    if (typeof o.takeHit === 'function') o.takeHit(d, owner);
    else if (typeof o.takeDamage === 'function') o.takeDamage(d, owner);
    else if (typeof o.hp === 'number') { o.hp -= d; if (o.hp <= 0) o.active = false; }
}
function dynSummons(team) {
    const L = [];
    const add = a => { if (Array.isArray(a)) for (const o of a) if (o && o.active !== false && (o.hp === undefined || o.hp > 0)) L.push(o); };
    if (typeof turrets !== 'undefined') add(turrets);
    if (typeof creatorTurrets !== 'undefined') add(creatorTurrets);
    if (typeof creatorRobots !== 'undefined') add(creatorRobots);
    if (typeof creatorDrones !== 'undefined') add(creatorDrones);
    if (typeof necroMinions !== 'undefined') add(necroMinions);
    if (typeof sniperWalls !== 'undefined') add(sniperWalls);
    if (typeof bastions !== 'undefined') add(bastions);
    if (typeof ghostDecoys !== 'undefined') add(ghostDecoys);
    add(bodyEffects.filter(o => o && o.isStone));
    const me = dynTeam(team), foe = dynFoe(me);
    if (foe && Array.isArray(foe.drones)) add(foe.drones);
    return L.filter(o => typeof o.x === 'number' && o.w && o.owner !== me && o.player !== me && !(o.owner && o.owner.id === team));
}
function dynKillTruck(t, p) {
    t.active = false;
    explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 60, 'rgba(255,215,0,', 0, p));
    dynAddGold(p, 30 + 10, t.x + t.w / 2, t.y + t.h / 2 - 12); // tiền xe thường $30 + Đào Vàng $10
}
// Vụ nổ (x,y,r) lên công trình / vật triệu hồi / thùng / xe tiền: x3 (Full Evo x5)
function dynBlastStructures(p, x, y, r, d) {
    const D = d * dynObjMult(p);
    for (const o of dynSummons(p.id)) if (dynRectDist(x, y, o) < r) {
        dynHurtObj(o, D, p);
        if (typeof spawnSparkParticles === 'function') spawnSparkParticles(o.x + o.w / 2, o.y + o.h / 2, '#ff8a1f', 5);
    }
    for (const c of crates) if (c.active && dynRectDist(x, y, c) < r) {
        c.active = false; crateOnBreak(c, p); grantCrateLoot(c, p);
        dynAddGold(p, 10, c.x + c.w / 2, c.y + c.h / 2);
    }
    for (const t of moneyTrucks) if (t.active && dynRectDist(x, y, t) < r) {
        t.hp -= D;
        if (t.hp <= 0) dynKillTruck(t, p);
    }
}

// ---------- Kích nổ ----------
function dynTrigger(b, cause, chain, delay) {
    if (!b.active || b.fuse >= 0) return;
    b.fuse = Math.max(0, delay | 0); b.cause = cause; b.chain = chain; b.early = cause !== 'time';
}
function dynNewChain(p) { p.dynChainSeq = (p.dynChainSeq || 0) + 1; return p.id * 100000 + p.dynChainSeq; }
function dynExplode(b) {
    if (!b.active) return;
    b.active = false;
    const p = dynTeam(b.team); if (!p) return;
    const e = dynFoe(p);
    const e2 = dynE2(p), early = b.early && e2;
    const sc = dynScale(p);
    const r = DYN_RING * (early ? 1.35 : 1);
    const dmg = (DYN_BOMB_DMG + (early ? DYN_EARLY_BONUS : 0)) * sc;
    const chain = b.chain || dynNewChain(p);
    // Địch
    if (dynAlive(e) && dynRectDist(b.x, b.y, e) < r) {
        const got = dynHurtEnemy(p, e, dmg, chain);
        if (early && b.stuck && b.cause === 'tap' && got > 0) {
            e.freezeTimer = Math.max(e.freezeTimer || 0, DYN_STUN);
            addFloatingText(e.x + e.w / 2, e.y + (e.id === 1 ? -26 : e.h + 26), 'CHOÁNG! 💫', '#fde047', 13);
        }
        // hất văng trượt ngang
        let dir = Math.sign(e.x + e.w / 2 - b.x);
        if (!dir || b.stuck) dir = (b.uid % 2) ? 1 : -1;
        e.dynKb = dir * (b.cause === 'time' ? 7 : 5);
    }
    dynBlastStructures(p, b.x, b.y, r, dmg);
    // Nổ lan
    const R = dynChainR(p);
    for (const o of dynBombs(b.team)) if (o !== b && o.fuse < 0 && Math.hypot(o.x - b.x, o.y - b.y) <= R) dynTrigger(o, 'chain', chain, 5);
    // Full Evo: vàng + khói đen
    if (dynFull(p)) {
        dynAddGold(p, 5, b.x, b.y);
        bodyEffects.push(new DynSmoke(b.team, b.x, b.y));
    }
    // Hình ảnh
    explosions.push(new Explosion(b.x, b.y, r, 'rgba(255, 120, 30,', 0, p));
    explosions.push(new Explosion(b.x, b.y, r * 0.55, 'rgba(255, 230, 120,', 0, p));
    if (typeof spawnSparkParticles === 'function') { spawnSparkParticles(b.x, b.y, '#ff6a1a', 14); spawnSparkParticles(b.x, b.y, '#ffd34d', 8); }
    if (typeof triggerScreenShake === 'function') triggerScreenShake(early ? 7 : 5, 10);
    if (b.early && b.cause === 'chain') addFloatingText(b.x, b.y - 18, 'NỔ LAN!', '#ff9d2e', 12);
    dynSfx('playExplosion');
}
// Nhấp Bắn nổ tại (x,y): kích nổ mọi bó có vòng cảnh báo chạm điểm này
function dynTapBlast(p, x, y) {
    const chain = dynNewChain(p);
    let n = 0;
    for (const o of dynBombs(p.id)) if (o.fuse < 0 && Math.hypot(o.x - x, o.y - y) <= DYN_RING) { dynTrigger(o, 'tap', chain, 0); n++; }
    explosions.push(new Explosion(x, y, 30, 'rgba(255, 140, 40,', 0, p));
    if (typeof spawnSparkParticles === 'function') spawnSparkParticles(x, y, '#ffb347', 8);
    if (n && dynE2(p)) addFloatingText(x, y - 20, 'KÍCH NỔ SỚM!', '#ffd34d', 13);
    return { chain, n };
}

// ---------- Bó Thuốc Nổ nằm trên sân / dính người ----------
class DynBomb {
    constructor(team, x, y, life, stuck, sdx) {
        this.uid = dynUid++;
        this.team = team; this.x = x; this.y = y;
        this.t = 0; this.life = life; this.active = true;
        this.stuck = !!stuck; this.sdx = sdx || 0;
        this.fuse = -1; this.cause = ''; this.chain = 0; this.early = false;
    }
    update() {
        const p = dynTeam(this.team), e = p ? dynFoe(p) : null;
        if (!p) { this.active = false; return; }
        if (this.stuck) {
            if (dynAlive(e)) { this.x = e.x + e.w / 2 + this.sdx; this.y = e.y + e.h / 2; }
            else this.stuck = false;
        }
        this.t++;
        if (this.fuse >= 0) { if (this.fuse-- <= 0) dynExplode(this); return; }
        if (this.t >= this.life) { this.cause = 'time'; this.early = false; this.chain = dynNewChain(p); dynExplode(this); }
    }
    draw() { if (typeof dynDrawBomb === 'function') dynDrawBomb(this); }
}

// ---------- Ném Cao (bay vòng cung trên không: không vật cản / vùng chặn đạn nào chặn được) ----------
class DynLob {
    constructor(team, sx, sy, tx, dur) {
        this.team = team; this.sx = sx; this.sy = sy; this.tx = tx;
        const e = dynFoe(dynTeam(team));
        this.ty = e ? e.y + e.h / 2 : (team === 1 ? 40 : canvas.height - 40);
        this.t = 0; this.dur = dur; this.active = true; this.isAerial = true;
    }
    update() {
        const p = dynTeam(this.team), e = p ? dynFoe(p) : null;
        if (!p) { this.active = false; return; }
        if (e) this.ty = e.y + e.h / 2;
        if (++this.t < this.dur) return;
        this.active = false;
        const life = dynLife(p);
        if (dynAlive(e) && Math.abs(this.tx - (e.x + e.w / 2)) <= e.w / 2 + 6) {
            const sdx = Math.max(-e.w / 2 + 3, Math.min(e.w / 2 - 3, this.tx - (e.x + e.w / 2)));
            bodyEffects.push(new DynBomb(this.team, this.tx, this.ty, life, true, sdx));
            addFloatingText(e.x + e.w / 2, e.y + (e.id === 1 ? -22 : e.h + 22), 'DÍNH BOM! 🧨', '#ff5a36', 13);
        } else {
            bodyEffects.push(new DynBomb(this.team, this.tx, this.ty, life, false, 0));
        }
        if (typeof spawnSparkParticles === 'function') spawnSparkParticles(this.tx, this.ty, '#c08a4a', 6);
        dynSfx('playClick');
    }
    draw() { if (typeof dynDrawLob === 'function') dynDrawLob(this); }
}

// ---------- Đám Khói Đen (Full Evo): chậm 30% trong 2s ----------
class DynSmoke {
    constructor(team, x, y) { this.team = team; this.x = x; this.y = y; this.r = 42; this.t = 0; this.life = 120; this.active = true; this.seed = (Math.random() * 1000) | 0; }
    update() {
        const p = dynTeam(this.team), e = p ? dynFoe(p) : null;
        if (dynAlive(e) && dynRectDist(this.x, this.y, e) < this.r) addStatusSlow(e, 0.7);
        if (++this.t >= this.life) this.active = false;
    }
    draw() { if (typeof dynDrawSmoke === 'function') dynDrawSmoke(this); }
}

// ---------- Cục Vàng bay về túi tiền (chỉ hình ảnh) ----------
class DynNugget {
    constructor(team, x, y) { this.team = team; this.x0 = x; this.y0 = y; this.t = 0; this.dur = 36; this.active = true; }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof dynDrawNugget === 'function') dynDrawNugget(this); }
}
