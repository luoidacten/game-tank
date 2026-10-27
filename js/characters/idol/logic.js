// ==========================================
// 96. IDOL — Siêu Sao Thần Tượng (docs/BODY_MOI_7.md mục C)
// ------------------------------------------
// Đạn = Náo Nhiệt (Hype, 0..100, p.ammo). 1 nút:
//   nhấp -> kỹ năng Phong Cách (đang CD / thiếu Náo Nhiệt -> Đạn Sóng Âm)
//   giữ 0.5s rồi nhả -> đổi Phong Cách 1 Vũ Đạo -> 2 Tâm Điểm -> 3 Quyến Rũ
//   giữ 1.0s -> 3 Sân Khấu xoay vòng trên đầu xe, nhấp ở màu nào mở Sân Khấu đó (15s, CD 30s)
// Fan (p.idolData.fans) tồn tại suốt trận; Evo cần mốc Fan, tụt dưới mốc -> Evo tạm khoá.
// Cửa Hàng Yêu Thích (💗): js/characters/idol/fan_shop.js. Vẽ: render.js.
// Mọi trạng thái là dữ liệu thuần trên người chơi / thực thể trong bodyEffects (đồng bộ online).
// ==========================================

const IDOL_PINK = '#ff4fd8', IDOL_GOLD = '#ffe066', IDOL_WHITE = '#fff4fd';
const IDOL_STAGES = [
    { id: 'rock', name: 'ROCK RỰC LỬA', icon: '🔥', c: '#ff2d55', c2: '#ff8a00' },
    { id: 'pop', name: 'POP LẤP LÁNH', icon: '💎', c: '#22d3ee', c2: '#ff6ad5' },
    { id: 'ballad', name: 'BALLAD HUYỀN ẢO', icon: '💜', c: '#a855f7', c2: '#6366f1' },
];
const IDOL_STYLES = [
    { name: 'VŨ ĐẠO', cost: 20, cd: 300, c: '#ff6ad5' },
    { name: 'TÂM ĐIỂM', cost: 30, cd: 300, c: '#ffe066' },
    { name: 'QUYẾN RŨ', cost: 35, cd: 480, c: '#ff4f9a' },
];
const IDOL_EVO_FANS = { evo_idol_1: 6, evo_idol_2: 12, full: 18 };
const IDOL_SEL_CYCLE = 20;          // 0.33s / màu
const IDOL_SEL_TIMEOUT = 240;       // chọn Sân Khấu tối đa 4s rồi huỷ

function idolIs(p) { return !!p && p.weapon === 'idol'; }
function idolEnemy(p) { return p === p1 ? p2 : p1; }
function idolDir(p) { return p.id === 1 ? -1 : 1; }
function idolAlive(t) { return !!t && t.hp > 0; }
function idolSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function idolTxt(o, s, c, sz, dy) { addFloatingText(o.x + o.w / 2, o.y + (o.id === 1 ? -18 - (dy || 0) : o.h + 22 + (dy || 0)), s, c, sz || 12); }
function idolData(p) {
    if (!p.idolData) p.idolData = { fans: 0, pts: 0, lv: { stick: 0, guard: 0, ad: 0, encore: 0 }, last: null };
    return p.idolData;
}
function idolFans(p) { return (p && p.idolData && p.idolData.fans) || 0; }
function idolLv(p, k) { return (p && p.idolData && p.idolData.lv && p.idolData.lv[k]) || 0; }
// Evo đã mua và ĐỦ Fan mới có hiệu lực
function idolOwn1(p) { return p.hasUpgrade('evo_idol_1'); }
function idolOwn2(p) { return p.hasUpgrade('evo_idol_2'); }
function idolE1(p) { return idolOwn1(p) && idolFans(p) >= IDOL_EVO_FANS.evo_idol_1; }
function idolE2(p) { return idolOwn2(p) && idolFans(p) >= IDOL_EVO_FANS.evo_idol_2; }
function idolFull(p) { return idolOwn1(p) && idolOwn2(p) && idolFans(p) >= IDOL_EVO_FANS.full && hasFullEvo(p, 'idol'); }
// Danh sách Evo đã mua nhưng đang tạm khoá (cho HUD)
function idolEvoLocked(p) {
    const out = [];
    if (idolOwn1(p) && !idolE1(p)) out.push(1);
    if (idolOwn2(p) && !idolE2(p)) out.push(2);
    if (idolOwn1(p) && idolOwn2(p) && !idolFull(p)) out.push(3);
    return out;
}
// Mức hiệu lực của Sân Khấu s: 1 = Sân Khấu đang mở, 0.5 = Full Evo (2 Sân Khấu còn lại), 0 = không
function idolSK(p, s) {
    if (!p || !(p.idolStage >= 0) || !(p.idolStageT > 0)) return 0;
    if (p.idolStage === s) return 1;
    return idolFull(p) ? 0.5 : 0;
}
function idolPrimary(p, s) { return !!p && p.idolStage === s && p.idolStageT > 0; }
// Hệ số sát thương: Dame thân (0.9 + Bánh Xích) × Rock × Hiện Tượng Mạng
function idolDS(p) {
    let m = (p.damage || 0.9) / 0.9;
    m *= 1 + 0.2 * idolSK(p, 0);
    if (idolE2(p)) m *= 1 + 0.02 * Math.min(10, Math.floor(idolFans(p) / 2));
    return m;
}
function idolBS(p) { return 1 + 0.25 * idolSK(p, 0); }
function idolCCM(p) { return 1 + 0.25 * idolSK(p, 2); }
function idolHoldStage(p) { return idolE1(p) ? 36 : 60; }
function idolHoldSwap(p) { return idolE1(p) ? 15 : 30; }
function idolCC(e) { return idolAlive(e) && e.weapon !== 'juggernaut'; }
function idolHeal(p, v) { if (v > 0 && idolAlive(p)) p.hp = Math.min(p.maxHp, p.hp + v); }
function idolGainHype(p, v) { p.ammo = Math.max(0, Math.min(p.maxAmmo || 100, (p.ammo || 0) + v)); }
function idolFan(p, n, why) {
    const d = idolData(p), f0 = d.fans;
    d.fans = Math.max(0, Math.min(99, d.fans + n));
    if (d.fans !== f0 && why) idolTxt(p, `${n > 0 ? '+' : ''}${d.fans - f0} FAN${why === true ? '' : ' ' + why}`, n > 0 ? '#ff9de6' : '#94a3b8', 10, 12);
}
function idolStun(p, e, ticks) {
    if (!idolCC(e)) { if (idolAlive(e) && e.weapon === 'juggernaut') idolTxt(e, 'KHÁNG KHỐNG CHẾ!', '#ff6f00', 11); return; }
    e.freezeTimer = Math.max(e.freezeTimer || 0, Math.round(ticks * idolCCM(p)));
}
function idolSlow(e, mult, ticks) {
    if (!idolCC(e)) return;
    if (!(e.idolSlowT > 0) || mult <= (e.idolSlowM || 1)) e.idolSlowM = mult;
    e.idolSlowT = Math.max(e.idolSlowT || 0, ticks);
}
// Hit vào tướng địch (gọi từ bọc takeDamage)
function idolOnHit(p) {
    idolGainHype(p, 12 * (1 + idolSK(p, 0)));
    p.idolNoHitT = 0; p.idolLoseT = 0;
}

// ---------- Thực thể (đều đồng bộ online qua NET_CLASSES) ----------
// Tia Lazer Âm Nhạc (hình ảnh)
class IdolBeam {
    constructor(team, x, y0, y1, w, kind) { this.team = team; this.x = x; this.y0 = y0; this.y1 = y1; this.w = w; this.kind = kind || 0; this.t = 0; this.dur = 22; this.active = true; }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof idolDrawBeam === 'function') idolDrawBeam(this); }
}
// Vệt sáng Ballad: chậm 40% trên làn địch 2s
class IdolTrail {
    constructor(team, x, y) { this.team = team; this.x = x; this.y = y; this.t = 0; this.dur = 120; this.active = true; }
    update() {
        if (++this.t >= this.dur) { this.active = false; return; }
        const o = this.team === 1 ? p1 : p2, e = o ? idolEnemy(o) : null;
        if (idolCC(e) && Math.abs(e.x + e.w / 2 - this.x) < 26 + e.w / 2 && Math.abs(e.y + e.h / 2 - this.y) < 40) addStatusSlow(e, 0.6);
    }
    draw() { if (typeof idolDrawTrail === 'function') idolDrawTrail(this); }
}
// Vòng sóng âm (hình ảnh nổ Vũ Đạo)
class IdolRing {
    constructor(x, y, r, color) { this.x = x; this.y = y; this.r = r; this.color = color || IDOL_PINK; this.t = 0; this.dur = 26; this.active = true; }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof idolDrawRing === 'function') idolDrawRing(this); }
}
// Full Evo: Hộp Quà Fan bay về làn Idol, nhặt +0.4 HP & +20 Náo Nhiệt
class IdolGift {
    constructor(team, x, y0, y1) { this.team = team; this.x = x; this.y = y0; this.y0 = y0; this.y1 = y1; this.t = 0; this.land = 40; this.life = 420; this.active = true; this.w = 14; this.h = 14; }
    update() {
        this.t++;
        const k = Math.min(1, this.t / this.land);
        this.y = this.y0 + (this.y1 - this.y0) * k;
        if (this.t >= this.life) { this.active = false; return; }
        if (this.t < this.land) return;
        const o = this.team === 1 ? p1 : p2;
        if (idolAlive(o) && rectIntersect(o.x - 4, o.y - 6, o.w + 8, o.h + 12, this.x - 7, this.y - 7, 14, 14)) {
            this.active = false;
            idolHeal(o, 0.4); idolGainHype(o, 20);
            idolTxt(o, '🎁 QUÀ FAN +0.4 HP', '#ffd1f3', 11);
            spawnSparkParticles(this.x, this.y, IDOL_PINK, 12);
            idolSfx('playPowerup');
        }
    }
    draw() { if (typeof idolDrawGift === 'function') idolDrawGift(this); }
}
// Full Evo: Lightstick Phát Nổ rơi xuống vị trí địch (cảnh báo 0.8s, 1.0 st + chậm 30%)
class IdolStick {
    constructor(team, x, y, dmg) { this.team = team; this.x = x; this.y = y; this.dmg = dmg; this.t = 0; this.warn = 48; this.r = 48; this.active = true; }
    update() {
        this.t++;
        if (this.t === this.warn) {
            const o = this.team === 1 ? p1 : p2, e = o ? idolEnemy(o) : null;
            explosions.push(new Explosion(this.x, this.y, this.r, 'rgba(255, 79, 216,', 0, o));
            spawnSparkParticles(this.x, this.y, IDOL_GOLD, 14);
            if (idolAlive(e) && Math.abs(e.x + e.w / 2 - this.x) < this.r + e.w / 2 && Math.abs(e.y + e.h / 2 - this.y) < this.r) {
                e.takeDamage(this.dmg, o);
                idolSlow(e, 0.7, 90);
            }
            triggerScreenShake(3, 6); idolSfx('playExplosion');
        }
        if (this.t >= this.warn + 14) this.active = false;
    }
    draw() { if (typeof idolDrawStick === 'function') idolDrawStick(this); }
}
// Kết liễu "BỨC MÀN NHUNG KHÉP LẠI — GRAND FINALE"
class IdolFinisher {
    constructor(owner, victim) {
        this.team = owner.id; this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.t = 0; this.dur = 210; this.active = true; this.boom = false;
    }
    update() {
        this.t++;
        if (this.t === 62 && !this.boom) {
            this.boom = true;
            explosions.push(new Explosion(this.x, this.y, 110, 'rgba(255, 79, 216,', 0, null));
            explosions.push(new Explosion(this.x, this.y, 60, 'rgba(255, 224, 102,', 0, null));
            spawnSparkParticles(this.x, this.y, IDOL_PINK, 30);
            spawnSparkParticles(this.x, this.y, IDOL_GOLD, 24);
            triggerScreenShake(12, 22);
            idolSfx('playExplosion');
        }
        if (this.t === 120) idolSfx('playWin');
        if (this.t >= this.dur) this.active = false;
    }
    // Camera: zoom vào xe địch khi Spotlight hội tụ, lùi ra toàn sân khi rèm khép
    camPath() {
        const W = canvas.width, H = canvas.height;
        return fcamKeys(this.t, [[0, W / 2, H / 2, 1], [50, this.x, this.y, 1.55], [95, this.x, this.y, 1.4], [135, W / 2, H / 2, 1]]);
    }
    draw() { }
    drawOver() { if (typeof idolDrawFinisherOver === 'function') idolDrawFinisherOver(this); }
}
function idolFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof IdolFinisher && e.active) e.drawOver();
}

// ---------- Kỹ năng ----------
function idolStyleCd(p, i) { return Math.round(IDOL_STYLES[i].cd * (1 - 0.2 * idolSK(p, 1))); }
function idolSpendStyle(p, i) {
    const st = IDOL_STYLES[i], cd = idolStyleCd(p, i);
    p.ammo = Math.max(0, p.ammo - st.cost);
    const bk = idolSK(p, 2);
    if (bk > 0) { idolGainHype(p, st.cost * 0.3 * bk); idolHeal(p, 0.25 * bk); }
    if (!p.idolCd) p.idolCd = [0, 0, 0];
    if (idolE2(p)) p.idolCd[i] = cd;
    else p.idolCd = [cd, cd, cd];   // chưa tách CD: dùng 1 Phong Cách khoá cả 3
    p.idolCdMax = p.idolCdMax || [300, 300, 480];
    p.idolCdMax[i] = cd;
    if (!idolE2(p)) p.idolCdMax = [cd, cd, cd];
    p.idolCastFx = 18;
}
// Đạn Sóng Âm (khi Phong Cách đang CD)
function idolFireWave(p) {
    if (p.idolWaveCd > 0) return;
    const lv = idolLv(p, 'stick'), dir = idolDir(p), cx = p.x + p.w / 2;
    const sp = C.bulletSpeed * 1.3 * (1 + 0.25 * lv) * idolBS(p);
    spawnBullet(p, { x: cx - 8, y: dir < 0 ? p.y - 10 : p.y + p.h + 2, w: 16, h: 7, vx: 0, vy: dir * sp, dmg: (0.8 + 0.25 * lv) * idolDS(p), hook: 'idol_wave' });
    p.idolWaveCd = 18; p.idolRecoil = 6;
    idolSfx('playShoot');
}
// 1. Vũ Đạo Xung Kích: lướt dọc lên trước
function idolStartDash(p) {
    if (typeof isGrounded === 'function' && isGrounded(p)) { groundedBlock(p); return false; }
    p.idolLM = 'go'; p.idolLT = 0; p.idolHomeY = p.y; p.groundLunge = true; p.idolBoomed = false;
    idolSfx('playDash');
    return true;
}
function idolEndDash(p) {
    if (p.idolLM && typeof p.idolHomeY === 'number') p.y = p.idolHomeY;
    p.idolLM = ''; p.idolLT = 0; p.groundLunge = false;
}
function idolRectHit(p, o) { return !!o && o.active !== false && rectIntersect(p.x - 2, p.y - 2, p.w + 4, p.h + 4, o.x, o.y, o.w || 20, o.h || 20); }
function idolTouchObj(p) {
    const e = idolEnemy(p), H = o => idolRectHit(p, o);
    if (idolAlive(e) && H(e)) return true;
    if (typeof crates !== 'undefined' && crates.some(c => c.active && H(c))) return true;
    if (typeof moneyTrucks !== 'undefined' && moneyTrucks.some(t => t.active && H(t))) return true;
    if (typeof movingObstacle !== 'undefined' && movingObstacle && movingObstacle.active && H(movingObstacle)) return true;
    if (typeof sniperWalls !== 'undefined' && sniperWalls.some(w => w.owner !== p && H(w))) return true;
    if (typeof bodyEffects !== 'undefined' && bodyEffects.some(f => f.isStone && f.active && H(f))) return true;
    return false;
}
function idolDashBoom(p) {
    p.idolBoomed = true;
    const e = idolEnemy(p), cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    const R = 62 * (idolPrimary(p, 2) ? 1.4 : 1), ds = idolDS(p);
    bodyEffects.push(new IdolRing(cx, cy, R, idolPrimary(p, 0) ? '#ff5a1f' : IDOL_PINK));
    explosions.push(new Explosion(cx, cy, R * 0.8, idolPrimary(p, 0) ? 'rgba(255, 90, 31,' : 'rgba(255, 79, 216,', 0, p));
    triggerScreenShake(5, 8); idolSfx('playExplosion');
    if (idolAlive(e) && Math.hypot(e.x + e.w / 2 - cx, e.y + e.h / 2 - cy) < R + e.w / 2) {
        let dmg = 1.2 * ds;
        if (idolPrimary(p, 0)) { dmg += 0.6 * ds; if (e.shield > 0) { e.shield--; idolTxt(e, 'PHÁ KHIÊN!', '#ff8a00', 11); } }
        const hp0 = e.hp;
        e.takeDamage(dmg, p);
        if (idolCC(e)) e.kbX = (e.x + e.w / 2 >= cx ? 1 : -1) * 9;
        idolSlow(e, 0.65, 90);
        idolStun(p, e, idolPrimary(p, 2) ? 60 : 30);
        if (e.hp < hp0 || e.hp <= 0) idolFan(p, 1, true);
    }
    if (idolPrimary(p, 1)) {
        // Pop: xoá đạn thường địch gần điểm nổ
        if (e && e.bullets) for (let i = e.bullets.length - 1; i >= 0; i--) {
            const b = e.bullets[i];
            if (b && !b.hook && !b.unstoppable && Math.hypot(b.x + (b.w || 0) / 2 - cx, b.y + (b.h || 0) / 2 - cy) < R * 1.5) e.bullets.splice(i, 1);
        }
        p.idolPopShield = 1;
    }
}
function idolDashTick(p) {
    const dir = idolDir(p), e = idolEnemy(p), T = ++p.idolLT, home = p.idolHomeY;
    if (p.psyPinT > 0 || p.rgPinT > 0) { p.idolLM = ''; p.groundLunge = false; p.idolLT = 0; return; }   // bị Phản Chấn: đã bị hất về làn
    if (p.idolLM === 'go') {
        if (isGrounded(p)) { p.idolLM = 'back'; p.groundLunge = false; return; }
        p.y += dir * 14;
        const eHome = e ? (e.id === 1 ? canvas.height - e.h - 22 : 20) : (dir < 0 ? 20 : canvas.height - 48);
        const reached = dir < 0 ? p.y <= eHome + p.h * 0.5 : p.y + p.h >= eHome + e.h * 0.5;
        if (idolTouchObj(p) || reached || T > 70) {
            if (dir < 0) p.y = Math.max(0, p.y); else p.y = Math.min(canvas.height - p.h, p.y);
            idolDashBoom(p);
            p.idolLM = 'back'; p.idolLT = 0; p.groundLunge = false;
        }
        return;
    }
    if (p.idolLM === 'back') {
        const dy = home - p.y;
        if (Math.abs(dy) <= 18 || T > 70) {
            idolEndDash(p);
            if (p.idolPopShield) { p.idolPopShield = 0; p.shield = (p.shield || 0) + 1; p.idolLShT = 150; idolTxt(p, 'KHIÊN ÁNH SÁNG', '#a5f3fc', 10); }
            return;
        }
        p.y += Math.sign(dy) * 18;
    }
}
// 2. Tia Lazer Tâm Điểm
function idolCastLaser(p) {
    const x = p.x + p.w / 2, delay = idolPrimary(p, 1) ? 27 : 42;
    const rock = idolPrimary(p, 0), dmg = (rock ? 3.0 : 2.4) * idolDS(p);
    const pop = idolPrimary(p, 1), bal = idolPrimary(p, 2);
    scheduleHitscan(p, delay, rock ? '#ff2d55' : IDOL_GOLD, 26, () => idolLaserFire(p, x, dmg, rock, pop, bal), x);
}
function idolLaserFire(p, x, dmg, rock, pop, bal) {
    const e = idolEnemy(p), d = idolDir(p), from = d < 0 ? p.y : p.y + p.h, to = d < 0 ? 0 : canvas.height;
    const hitCol = (cx, half) => idolAlive(e) && Math.abs(cx - (e.x + e.w / 2)) < e.w / 2 + half;
    if (hitCol(x, 8)) {
        const hp0 = e.hp;
        e.takeDamage(dmg, p, { isPiercing: true });
        spawnSparkParticles(x, e.y + e.h / 2, IDOL_GOLD, 14);
        if (e.hp < hp0 || e.hp <= 0) {
            idolFan(p, 1, true);
            if (pop && p.idolCd) { p.idolCd[1] = Math.max(0, p.idolCd[1] - 150); if (!idolE2(p)) p.idolCd = p.idolCd.map(v => Math.max(0, v - 150)); }
            if (bal) { idolHeal(p, 0.6); bodyEffects.push(new IdolTrail(p.id, x, e.y + e.h / 2)); }
        }
    }
    if (rock) for (const s of [-1, 1]) {
        const sx = x + s * 30;
        if (hitCol(sx, 4)) e.takeDamage(0.6 * idolDS(p), p, { isPiercing: true });
        bodyEffects.push(new IdolBeam(p.id, sx, from, to, 8, 1));
    }
    if (typeof crates !== 'undefined') for (const c of crates) {
        if (c.active && x > c.x - 8 && x < c.x + c.w + 8) { c.active = false; if (typeof crateOnBreak === 'function') crateOnBreak(c, p); if (typeof grantCrateLoot === 'function') grantCrateLoot(c, p); }
    }
    bodyEffects.push(new IdolBeam(p.id, x, from, to, 22, rock ? 1 : 0));
    triggerScreenShake(5, 8);
    idolSfx('playLaser');
}
// 3. Trái Tim Mê Hoặc
function idolCastHeart(p) {
    const pop = idolPrimary(p, 1), dir = idolDir(p), cx = p.x + p.w / 2, s = pop ? 17 : 13;
    spawnBullet(p, { x: cx - s / 2, y: dir < 0 ? p.y - s - 2 : p.y + p.h + 2, w: s, h: s, vx: 0, vy: dir * C.bulletSpeed * (pop ? 1.4 : 1.0) * idolBS(p), dmg: 0.8 * idolDS(p), hook: 'idol_heart', idolPop: pop ? 1 : 0, idolRock: idolPrimary(p, 0) ? 1 : 0, idolBal: idolPrimary(p, 2) ? 1 : 0 });
    idolSfx('playPowerup');
}
function idolCastStyle(p) {
    const i = p.idolStyle || 0, st = IDOL_STYLES[i];
    if ((p.idolCd && p.idolCd[i] > 0) || p.ammo < st.cost || (i === 0 && p.idolLM)) { idolFireWave(p); return; }
    if (i === 0 && !idolStartDash(p)) return;
    idolSpendStyle(p, i);
    if (i === 1) idolCastLaser(p);
    if (i === 2) idolCastHeart(p);
}
function idolSwapStyle(p) {
    p.idolStyle = ((p.idolStyle || 0) + 1) % 3;
    if (idolE1(p) && p.idolCd) p.idolCd[p.idolStyle] = Math.max(0, p.idolCd[p.idolStyle] - 60);
    p.idolSwapFx = 20;
    idolTxt(p, `${p.idolStyle + 1}. ${IDOL_STYLES[p.idolStyle].name}`, IDOL_STYLES[p.idolStyle].c, 11);
    idolSfx('playClick');
}
function idolStageCdMax(p) { return idolE1(p) ? 1320 : 1800; }
function idolOpenStage(p, s) {
    p.idolStage = s; p.idolStageMax = idolLv(p, 'encore') ? 1200 : 900; p.idolStageT = p.idolStageMax;
    p.idolStageCd = idolStageCdMax(p); p.idolStageCdMax = p.idolStageCd;
    p.idolGiftT = 300; p.idolStageFx = 40;
    if (idolLv(p, 'guard')) {
        p.shield = (p.shield || 0) + 1;
        p.freezeTimer = 0; p.slowTimer = 0; p.silenceTimer = 0; p.burnTimer = 0; p.burnStacks = 0; p.bleedTimer = 0; p.acidBurnTimer = 0;
        p.groundedTimer = 0; p.blindTimer = 0; p.confusionStacks = 0; p.idolCharmT = 0; p.idolSlowT = 0;
    }
    const S = IDOL_STAGES[s];
    idolTxt(p, `${S.icon} ${S.name}!`, S.c, 13, 6);
    triggerScreenShake(4, 10);
    idolSfx('playPowerup');
}

// ---------- Tick chính (luôn chạy, kể cả khi bị choáng) ----------
function idolTick(p, now) {
    if (gameState.phase !== 'playing' || !idolAlive(p)) return;
    const d = idolData(p), e = idolEnemy(p);
    if (!p.idolCd) p.idolCd = [0, 0, 0];
    if (!p.idolInit) { p.idolInit = true; p.ammo = 50; }   // setupForNewRound đổ đầy đạn sau hook -> khởi đầu 50 Náo Nhiệt
    for (let i = 0; i < 3; i++) if (p.idolCd[i] > 0) p.idolCd[i]--;
    if (p.idolStageCd > 0) p.idolStageCd--;
    if (p.idolWaveCd > 0) p.idolWaveCd--;
    ['idolSwapFx', 'idolStageFx', 'idolCastFx', 'idolRecoil'].forEach(k => { if (p[k] > 0) p[k]--; });
    if (p.idolLShT > 0 && --p.idolLShT === 0 && p.shield > 0) p.shield--;   // Khiên Ánh Sáng hết hạn
    // Sân Khấu
    if (p.idolStageT > 0) {
        p.idolStageT--;
        if (p.idolStageT === 0) p.idolStage = -1;
        else if (idolFull(p) && --p.idolGiftT <= 0) {
            p.idolGiftT = 300;
            const cx = Math.max(20, Math.min(canvas.width - 20, p.x + p.w / 2 + (Math.random() * 2 - 1) * 70));
            bodyEffects.push(new IdolGift(p.id, cx, canvas.height / 2, p.y + p.h / 2));
            if (idolAlive(e)) bodyEffects.push(new IdolStick(p.id, e.x + e.w / 2, e.y + e.h / 2, 1.0 * idolDS(p)));
        }
    }
    // Náo Nhiệt tự hồi
    p.lastShot = now; // tự quản đạn
    idolGainHype(p, (6 * (1 + idolSK(p, 1)) + 8 * idolSK(p, 2)) / 60);
    // Fan: giữ ≥80 Náo Nhiệt 4s -> +1
    if (p.ammo >= 80) { if (++p.idolHiT >= 240) { p.idolHiT = 0; idolFan(p, 1, true); } } else p.idolHiT = 0;
    // Mất Fan: không trúng địch 6s (Evo1: 10s) -> -1 mỗi 3s
    p.idolNoHitT = (p.idolNoHitT || 0) + 1;
    if (p.idolNoHitT > (idolE1(p) ? 600 : 360)) { if (++p.idolLoseT >= 180) { p.idolLoseT = 0; if (d.fans > 0) idolFan(p, -1, 'MẤT'); } } else p.idolLoseT = 0;
    // Lướt Vũ Đạo
    if (p.idolLM) idolDashTick(p);
    // Chọn Sân Khấu
    if (p.idolSel) { p.idolSelT++; if (!p.idolSelHeld && p.idolSelT - (p.idolSelRel || 0) > IDOL_SEL_TIMEOUT) p.idolSel = false; }
    // Hiệu ứng Sân Khấu lên địch
    if (idolAlive(e)) {
        const rk = idolSK(p, 0), pk = idolSK(p, 1), bk = idolSK(p, 2);
        if (rk > 0) addStatusVuln(e, 0.15 * rk);
        if (bk > 0 && idolCC(e)) addStatusSlow(e, 1 - 0.2 * bk);
        if (e.bullets) for (const b of e.bullets) if (b && !b.idolSl) { b.idolSl = 1; if (pk > 0) { b.vx *= 1 - 0.2 * pk; b.vy *= 1 - 0.2 * pk; } }
        if (pk > 0 && typeof e.lastReload === 'number') e.lastReload += 1000 / 60 * 0.15 * pk; // nạp đạn chậm 15%
    }
}
// Hiệu ứng trên nạn nhân (chậm, Mê Hoặc)
function idolTickVictim(v) {
    if (v.idolSlowT > 0) { v.idolSlowT--; addStatusSlow(v, v.idolSlowM || 0.65); }
}
function idolCharmInput(v, raw) {
    const o = idolEnemy(v);
    const dx = o ? (o.x + o.w / 2) - (v.x + v.w / 2) : 0, sp = Math.max(1.5, v.speed || 3);
    return { l: dx < -sp, r: dx > sp, s: false };
}

// ---------- Đạn ----------
BulletHooks.register('idol_wave', {
    hit(b, attacker) { idolGainHype(attacker, -4 * (1 + idolSK(attacker, 0))); },   // Sóng Âm: +8 thay vì +12
    draw(b) { if (typeof idolDrawWave === 'function') idolDrawWave(b); },
});
BulletHooks.register('idol_heart', {
    hit(b, attacker, victim) {
        if (!idolAlive(victim) && !(victim && victim.hp <= 0)) return;
        idolFan(attacker, b.idolPop ? 3 : 1, true);
        if (!idolCC(victim)) { if (victim && victim.weapon === 'juggernaut') idolTxt(victim, 'KHÁNG KHỐNG CHẾ!', '#ff6f00', 11); return; }
        victim.idolCharmT = Math.round((b.idolBal ? 144 : 105) * idolCCM(attacker));
        if (b.idolRock) victim.idolMark = 1;
        idolTxt(victim, '💘 MÊ HOẶC!', '#ff7ad9', 13);
        spawnSparkParticles(victim.x + victim.w / 2, victim.y + victim.h / 2, '#ff7ad9', 14);
    },
    draw(b) { if (typeof idolDrawHeart === 'function') idolDrawHeart(b); },
});

// ---------- Hook nhân vật ----------
CharHooks.register('idol', {
    setup() {
        idolData(this);
        this.maxAmmo = 100; this.ammo = 50; this.idolInit = false;
        this.idolStyle = 0; this.idolCd = [0, 0, 0]; this.idolCdMax = [300, 300, 480];
        this.idolStage = -1; this.idolStageT = 0; this.idolStageMax = 900; this.idolStageCd = 0; this.idolStageCdMax = 1800;
        this.idolHold = 0; this.idolPrevS = false; this.idolHoldUsed = false; this.idolSel = false; this.idolSelT = 0; this.idolSelHeld = false; this.idolSelRel = 0;
        this.idolHiT = 0; this.idolNoHitT = 0; this.idolLoseT = 0; this.idolWaveCd = 0; this.idolLShT = 0; this.idolGiftT = 300;
        this.idolLM = ''; this.idolLT = 0; this.groundLunge = false; this.idolPopShield = 0;
        this.idolSwapFx = 0; this.idolStageFx = 0; this.idolCastFx = 0; this.idolRecoil = 0;
    },
    speed(v) {
        let m = 1 + 0.25 * idolSK(this, 1);
        if (idolE2(this)) m *= 1 + 0.015 * Math.min(10, Math.floor(idolFans(this) / 2));
        if (this.idolLM) m *= 0.5;
        return v * m;
    },
    shoot(inp, now) {
        const p = this, s = !!inp.s, pressed = s && !p.idolPrevS, released = !s && p.idolPrevS;
        p.idolPrevS = s;
        if (gameState.phase !== 'playing') return true;
        // Đang chọn Sân Khấu: nhấp mở Sân Khấu đang sáng
        if (p.idolSel && pressed && !p.idolSelHeld) {
            const idx = Math.floor(p.idolSelT / IDOL_SEL_CYCLE) % 3;
            p.idolSel = false; p.idolHoldUsed = true; p.idolHold = 1;
            idolOpenStage(p, idx);
            return true;
        }
        if (s) {
            p.idolHold++;
            if (!p.idolHoldUsed && !p.idolSel && p.idolHold >= idolHoldStage(p) && !(p.idolStageCd > 0) && !(p.idolStageT > 0)) {
                p.idolSel = true; p.idolSelT = 0; p.idolSelHeld = true; p.idolHoldUsed = true;
                idolSfx('playClick');
            }
            return true;
        }
        if (released) {
            const h = p.idolHold;
            p.idolHold = 0;
            if (p.idolSelHeld) { p.idolSelHeld = false; p.idolSelRel = p.idolSelT; p.idolHoldUsed = false; return true; }
            if (p.idolHoldUsed) { p.idolHoldUsed = false; return true; }
            if (h >= idolHoldSwap(p)) idolSwapStyle(p);
            else idolCastStyle(p);
        }
        return true;
    },
    roundEnd(result) {
        idolEndDash(this);
        this.idolSel = false; this.idolStage = -1; this.idolStageT = 0; this.idolCharmT = 0;
        const d = idolData(this);
        if (result === 'win') idolFan(this, 5);
        else if (result === 'lose') idolFan(this, -4);
        const pts = d.fans * 2;
        d.pts += pts;
        let ad = 0;
        if (idolLv(this, 'ad')) {
            ad = Math.min(25, Math.floor(d.fans / 3) * 5);
            if (ad > 0) { if (this.id === 1) gameState.p1Coins += ad; else gameState.p2Coins += ad; }
        }
        d.last = { pts, ad, fans: d.fans, res: result };
    },
    evoLock(item) { return typeof idolEvoLockText === 'function' ? idolEvoLockText(this, item) : null; },
    shopButtons(container, playerId) { if (typeof idolFanShopButton === 'function') idolFanShopButton(this, container, playerId); },
});

// ---------- Bọc update: tick Idol + Mê Hoặc (ghi đè input ngang & cấm bắn) ----------
(function () {
    const origU = Player.prototype.update;
    Player.prototype.update = function () {
        let swapped = null;
        try {
            if (idolIs(this)) idolTick(this, Date.now());
            if (this.idolSlowT > 0) idolTickVictim(this);
            if (this.idolCharmT > 0) {
                if (gameState.phase !== 'playing' || this.weapon === 'juggernaut' || !(this.hp > 0)) this.idolCharmT = 0;
                else {
                    this.idolCharmT--;
                    const key = this.id === 1 ? 'p1' : 'p2';
                    if (typeof inputs !== 'undefined' && inputs[key]) { swapped = { key, v: inputs[key] }; inputs[key] = idolCharmInput(this, inputs[key]); }
                }
            }
        } catch (err) { console.error(err); }
        try { return origU.apply(this, arguments); }
        finally { if (swapped) inputs[swapped.key] = swapped.v; }
    };
})();

// ---------- Bọc takeDamage: Ballad giảm st, Rock (+30% đòn kế khi Mê Hoặc, -20% hiệu quả Khiên), Hype khi trúng, kết liễu ----------
(function () {
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        let opt = options;
        const enemyHit = attacker && attacker !== this && attacker instanceof Player;
        if (typeof amount === 'number' && amount > 0 && enemyHit) {
            if (idolIs(this)) amount *= 1 - 0.2 * idolSK(this, 2);
            if (idolIs(attacker)) {
                if (this.idolMark) { this.idolMark = 0; amount *= 1.3; }
                const rk = idolSK(attacker, 0);
                if (rk > 0 && this.shield > 0 && Math.random() < 0.2 * rk) opt = Object.assign({}, options || {}, { bypassShield: true });
            }
        }
        const hp0 = this.hp, sh0 = this.shield || 0;
        const r = origTD.call(this, amount, attacker, opt);
        if (enemyHit && idolIs(attacker) && gameState.phase === 'playing' && (this.hp < hp0 || (this.shield || 0) < sh0)) idolOnHit(attacker);
        if (enemyHit && idolIs(attacker) && hp0 > 0 && this.hp <= 0 && typeof bodyEffects !== 'undefined' && !bodyEffects.some(e => e instanceof IdolFinisher)) {
            bodyEffects.push(new IdolFinisher(attacker, this));
        }
        return r;
    };
})();

// ---------- Bot: nhấp kỹ năng khi thẳng hàng, giữ đổi Phong Cách / mở Sân Khấu ----------
// Trả về chuỗi nút bấm (mảng true/false theo tick) hoặc null
function idolBotPlan(bot, enemy, aligned) {
    if (!enemy || !(enemy.hp > 0) || bot.idolLM) return null;
    const rnd = Math.random();
    if (bot.idolSel) return [false, false, ...Array(Math.floor(rnd * 30)).fill(false), true, true, false];
    if (!(bot.idolStageCd > 0) && !(bot.idolStageT > 0) && rnd < 0.05) return Array(idolHoldStage(bot) + 3).fill(true).concat([false, false]);
    const i = bot.idolStyle || 0, cd = bot.idolCd || [0, 0, 0];
    const ready = j => !(cd[j] > 0) && bot.ammo >= IDOL_STYLES[j].cost;
    const dx = Math.abs(enemy.x + enemy.w / 2 - (bot.x + bot.w / 2));
    // Phong Cách hiện tại chưa dùng được nhưng Phong Cách khác dùng được (Evo 2) -> đổi
    if (!ready(i) && [0, 1, 2].some(j => j !== i && ready(j)) && rnd < 0.08) return Array(idolHoldSwap(bot) + 2).fill(true).concat([false, false]);
    if (ready(i)) {
        if (i === 0 && dx < 60) return [true, true, false];
        if (i !== 0 && aligned) return [true, true, false];
        if (i === 0 && rnd < 0.02) return Array(idolHoldSwap(bot) + 2).fill(true).concat([false, false]);
        return null;
    }
    if (aligned && !(bot.idolWaveCd > 0)) return [true, false];
    return null;
}
