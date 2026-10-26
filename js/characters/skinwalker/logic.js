// ==========================================
// Skinwalker (skinwalker) — Dị Thể Thích Ứng (docs/BODY_MOI_6.md #80)
// ------------------------------------------
// Thuần nhấp bắn. Đầu hiệp (tick đầu tiên) đánh hơi VAI TRÒ CHÍNH của địch (MODULES.BODY role[0], giống Joker/Adapter)
// -> biến hình 1 trong 4 Hình Thái (đổi kích thước, chỉ số, đạn, nội tại):
//   Đối Đầu -> 🩸 PHÁ GIÁP (pha) | Kiểm Soát -> 👁 HƯ KHÔNG (hu) | Cơ Động -> 🕸 TRÓC ẢNH (troc) | Sinh Tồn -> ☣ ĐỘC THỰC (doc)
// Evo 2: Thay Da theo VAI TRÒ PHỤ (role[1..]): 1 vai trò -> nhận luôn, >=2 -> gacha, 0 -> không gì (Full: nhân đôi Hình Thái Chính +35%).
// Lớp Da Phụ = 50% (Full 80%) hiệu ứng gốc. Full Evo: Lột Bỏ Lớp Da Cũ khi < 25% máu lần đầu.
// Mọi trạng thái là trường thuần trên player / entity bodyEffects (đồng bộ online).
// ==========================================

const SW_FORMS = {
    pha: { n: 'PHÁ GIÁP THỂ', ic: '🩸', c: '#f43f5e', size: 30, hp: 6.0, spd: 3.8, ammo: 4, dmg: 1.1 },
    hu: { n: 'HƯ KHÔNG THỂ', ic: '👁', c: '#a855f7', size: 26, hp: 5.0, spd: 4.1, ammo: 5, dmg: 1.1 },
    troc: { n: 'TRÓC ẢNH THỂ', ic: '🕸', c: '#22d3ee', size: 26, hp: 5.0, spd: 4.4, ammo: 2, dmg: 1.1 },
    doc: { n: 'ĐỘC THỰC THỂ', ic: '☣', c: '#84cc16', size: 28, hp: 5.5, spd: 3.7, ammo: 4, dmg: 1.2 },
};
const SW_ROLE_FORM = { 'Đối Đầu': 'pha', 'Kiểm Soát': 'hu', 'Cơ Động': 'troc', 'Sinh Tồn': 'doc' };
const SW_DARK = '#1a0b1f';

function swE1(p) { return p.hasUpgrade('evo_skin_1'); }
function swE2(p) { return p.hasUpgrade('evo_skin_2'); }
function swFull(p) { return swE1(p) && swE2(p); }
function swIs(p) { return !!p && p.weapon === 'skinwalker'; }
function swEnemy(p) { return p === p1 ? p2 : p1; }
function swAlive(t) { return t && t.hp > 0; }
function swSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function swTxt(o, s, c, sz, dy) { addFloatingText(o.x + o.w / 2, o.y + (o.id === 1 ? -18 - (dy || 0) : o.h + 22 + (dy || 0)), s, c, sz || 12); }
function swRoles(e) {
    if (!e || typeof MODULES === 'undefined') return [];
    const m = MODULES.BODY.find(x => x.id === e.weapon);
    return (m && m.role) || [];
}
// Hệ số hiệu lực của Hình Thái f: chính = 1 (Full nhân đôi = 1.35), da phụ = 0.5 (Full 0.8), không có = 0
function swK(p, f) { return p.swForm === f ? (p.swDup ? 1.35 : 1) : (p.swSub === f ? (p.swSubK || 0) : 0); }
// Giá trị hiệu ứng: hình thái chính dùng số Evo1 nếu có, da phụ = số gốc x hệ số da phụ
function swV(p, f, base, e1) {
    if (p.swForm === f) return (swE1(p) && e1 !== undefined ? e1 : base) * (p.swDup ? 1.35 : 1);
    if (p.swSub === f) return base * (p.swSubK || 0);
    return 0;
}
function swNormalBullet(b) { return b && !b.hook && !b.isBig && (b.w || 6) <= 14 && (b.h || 6) <= 22 && !(b.dmg > 2); }

// ---------- Entity: Kết liễu "THÔN PHỆ ĐỒNG HÓA" ----------
class SwFinisher {
    constructor(owner, victim) {
        this.team = owner.id; this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.ox = owner.x + owner.w / 2; this.oy = owner.y + owner.h / 2; this.vw = victim.w;
        this.vWeapon = victim.weapon; this.t = 0; this.dur = 175; this.active = true; this.crunch = false;
    }
    update() {
        this.t++;
        const o = this.team === 1 ? p1 : p2;
        if (o) { this.ox = o.x + o.w / 2; this.oy = o.y + o.h / 2; }
        if (this.t === 96 && !this.crunch) {
            this.crunch = true;
            spawnSparkParticles(this.x, this.y, '#7e22ce', 24);
            spawnSparkParticles(this.x, this.y, '#f43f5e', 14);
            triggerScreenShake(13, 24);
            swSfx('playExplosion');
        }
        if (this.t === 120 && o) { o.swMorph = this.vWeapon; o.swMorphT = 1; swSfx('playPowerup'); }
        if (this.t >= this.dur) this.active = false;
    }
    draw() { if (typeof swDrawFinisherUnder === 'function') swDrawFinisherUnder(this); }
    drawOver() { if (typeof swDrawFinisherOver === 'function') swDrawFinisherOver(this); }
}
function swSpawnFinisher(p, v) {
    if (typeof bodyEffects === 'undefined' || bodyEffects.some(e => e instanceof SwFinisher)) return;
    bodyEffects.push(new SwFinisher(p, v));
    triggerScreenShake(5, 12);
}

// ---------- Biến hình đầu hiệp ----------
function swInitRound(p) {
    const e = swEnemy(p);
    p.swInit = true;
    const roles = swRoles(e);
    const form = SW_ROLE_FORM[roles[0]] || 'pha';
    p.swForm = form; p.swSub = ''; p.swSubK = 0; p.swDup = false;
    if (swE2(p)) {
        const subs = [];
        for (const r of roles.slice(1)) { const f = SW_ROLE_FORM[r]; if (f && f !== form && !subs.includes(f)) subs.push(f); }
        if (subs.length) { p.swSub = subs[Math.floor(Math.random() * subs.length)]; p.swSubK = swFull(p) ? 0.8 : 0.5; }
        else if (swFull(p)) p.swDup = true;
    }
    const F = SW_FORMS[form];
    const dHp = (F.hp - 5) + (p.swSub === 'pha' ? 1 * p.swSubK : 0);
    p.maxHp += dHp; p.hp = Math.min(p.maxHp, p.hp + dHp);
    p.swSpdAdd = (F.spd - 3.7) + (p.swSub === 'hu' ? 0.4 * p.swSubK : 0);   // qua hook speed (G.E.A.R khôi phục this.speed sau mỗi tick)
    p.damage += F.dmg - 1.1;
    p.maxAmmo = Math.max(1, p.maxAmmo + (F.ammo + (form === 'troc' && swE1(p) ? 1 : 0)) - 4); p.ammo = p.maxAmmo;
    const cx = p.x + p.w / 2;
    p.w = F.size; p.h = F.size;
    p.x = Math.max(0, Math.min(canvas.width - p.w, cx - p.w / 2));
    p.y = (p.id === 1) ? canvas.height - p.h - 22 : 20;
    p.swMorphFx = 50;
    swTxt(p, F.ic + ' ' + F.n + (p.swDup ? ' x2' : ''), F.c, 13, 10);
    if (p.swSub) swTxt(p, 'THAY DA: ' + SW_FORMS[p.swSub].ic + ' ' + SW_FORMS[p.swSub].n, SW_FORMS[p.swSub].c, 11, 26);
    else if (swE2(p) && !p.swDup) swTxt(p, 'KHÔNG CÓ DA PHỤ...', '#94a3b8', 10, 26);
    spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, F.c, 20);
    triggerScreenShake(4, 10);
    swSfx('playPowerup');
    if (e) {
        e.swPx = e.x; e.swPy = e.y; e.swPrevHp = e.hp; e.swPrevWs = e.gearWhiteShield || 0; e.swPrevSh = e.shield || 0;
        e.swMarkT = 0; e.swRotT = 0; e.swRotAcc = 0; e.swWoundT = 0; e.swSlowT = 0; e.swRootT = 0; e.swBroke = 0; e.swRachCd = 0;
    }
}

// ---------- Bắn ----------
function swFire(p, now) {
    if (!(p.ammo > 0) || now - (p.lastShot || 0) < 280) return;
    const e = swEnemy(p), dir = p.id === 1 ? -1 : 1, f = p.swForm || 'pha';
    p.ammo--; p.lastShot = now; p.swRecoil = 8;
    let dmg = p.damage;
    const pct = swV(p, 'pha', 0.05, 0.08);
    if (pct > 0 && e) dmg += e.maxHp * pct;
    const subHome = p.swSub === 'troc' ? p.swSubK : 0;
    const my = (h) => p.id === 1 ? p.y - h - 2 : p.y + p.h + 2;
    if (f === 'pha') {
        spawnBullet(p, { w: 7, h: 15, x: p.x + p.w / 2 - 3.5, y: my(15), vy: dir * C.bulletSpeed * 1.1, dmg, hook: 'skinwalker', swT: 'pha', swHome: subHome });
    } else if (f === 'hu') {
        spawnBullet(p, { w: 5, h: 20, x: p.x + p.w / 2 - 2.5, y: my(20), vy: dir * C.bulletSpeed * 1.75, dmg, hook: 'skinwalker', swT: 'hu', swVoid: swE1(p) ? 1 : 0, swHome: subHome });
    } else if (f === 'troc') {
        for (const s of [-1, 1]) spawnBullet(p, {
            w: 7, h: 9, x: p.x + p.w / 2 - 3.5 + s * 7, y: my(9), vx: s * 0.7, vy: dir * 1.3, dmg: dmg / 2,
            hook: 'skinwalker', swT: 'troc', swAge: 0, swLock: 0, swSide: s,
        });
    } else {
        spawnBullet(p, { w: 9, h: 9, x: p.x + p.w / 2 - 4.5, y: my(9), vy: dir * C.bulletSpeed * 0.95, dmg, hook: 'skinwalker', swT: 'doc', swHome: subHome });
    }
    spawnSparkParticles(p.x + p.w / 2, p.id === 1 ? p.y : p.y + p.h, SW_FORMS[f].c, 5);
    swSfx('playShoot');
}

// Đạn bay: Nanh Truy Kích, bẻ lái da phụ, phá đạn thường (Phá Giáp), vệt hư không (Hư Không Evo1)
function swBulletTick(p, e) {
    const dir = p.id === 1 ? -1 : 1;
    const moving = e && Math.abs(e._vx || 0) > 0.4;
    for (const b of p.bullets) {
        if (b.hook !== 'skinwalker') continue;
        if (b.swT === 'troc') {
            b.swAge = (b.swAge || 0) + 1;
            if (!b.swLock && b.swAge <= 120) {
                b.vx *= 0.94; b.vy = dir * 1.3;
                if (moving && b.swAge > 6) { b.swLock = 1; spawnSparkParticles(b.x + 3, b.y + 4, '#22d3ee', 4); }
            } else if (!b.swLock && b.swAge === 121) { b.vx = 0; b.vy = dir * C.bulletSpeed * 1.1; }
            if (b.swLock && swAlive(e)) {
                const v = aimVelocity(b.x + b.w / 2, b.y + b.h / 2, e, C.bulletSpeed * 1.35, true);
                const sc = homingTurnScale(b, p.id, e.x + e.w / 2, e.y + e.h / 2) > 0 ? 0.2 : 0.04;
                b.vx += (v.vx - b.vx) * sc; b.vy += (v.vy - b.vy) * sc;
                if (b.vy * dir < 1.5) b.vy = dir * 1.5;
            }
        } else if (b.swHome > 0 && moving && swAlive(e)) {
            const dx = e.x + e.w / 2 - (b.x + b.w / 2);
            const sc = homingTurnScale(b, p.id, e.x + e.w / 2, e.y + e.h / 2);
            b.vx = Math.max(-2.5, Math.min(2.5, (b.vx || 0) + Math.sign(dx) * 0.05 * b.swHome * sc));
        }
        if (!e || !e.bullets) continue;
        const eat = b.swT === 'pha' ? 99 : (b.swVoid > 0 ? 1 : 0);
        if (!eat) continue;
        const pad = b.swT === 'pha' ? 4 : 10;
        for (let i = e.bullets.length - 1; i >= 0; i--) {
            const eb = e.bullets[i];
            if (!swNormalBullet(eb)) continue;
            if (rectIntersect(b.x - pad, b.y - 6, b.w + pad * 2, b.h + 12, eb.x, eb.y, eb.w || 6, eb.h || 6)) {
                e.bullets.splice(i, 1);
                spawnSparkParticles(eb.x, eb.y, b.swT === 'pha' ? '#fda4af' : '#c084fc', 6);
                if (b.swT !== 'pha') { b.swVoid--; break; }
            }
        }
    }
}

BulletHooks.register('skinwalker', {
    hit(b, o, v, dealt) {
        if (!swIs(o) || !v || (v !== p1 && v !== p2) || v === o) return;
        const kt = swK(o, 'troc');
        if (kt > 0) {
            v.swMarkT = 150;
            v.swMarkSlow = Math.min(0.6, swV(o, 'troc', 0.3));
            v.swMarkDmg = swV(o, 'troc', 1.0, 1.5);
            v.swMarkRoot = o.swForm === 'troc' ? (swE1(o) ? 60 : 45) : 0;
        }
        const kd = swK(o, 'doc');
        if (kd > 0) {
            const main = o.swForm === 'doc';
            v.swRotT = main ? 180 : 120; v.swRotAcc = 0;
            v.swRotDps = 0.25 * kd + (main ? 0.01 * v.maxHp * kd : 0);
            v.swWoundT = 240;
            v.swWoundR = Math.min(0.9, main ? (swE1(o) ? 0.75 : 0.6) * (o.swDup ? 1.2 : 1) : 0.6 * o.swSubK);
            if (main && typeof explosions !== 'undefined') explosions.push(new Explosion(b.x + b.w / 2, b.y + b.h / 2, 22, 'rgba(132,204,22,', 0, null));
        }
        spawnSparkParticles(v.x + v.w / 2, v.y + v.h / 2, SW_FORMS[b.swT] ? SW_FORMS[b.swT].c : '#f43f5e', 6);
    },
    obstacle(b, o, obj, kind) {
        if (!swIs(o) || !obj || kind === 'truck' || kind === 'crate') return;
        const main = o.swForm === 'hu';
        const extra = main ? 3 * (o.swDup ? 1.35 : 1) : (o.swSub === 'hu' ? 2 * o.swSubK : 0);
        const pass = main && (kind === 'wall' || kind === 'stone' || kind === 'moving');
        if (main && kind === 'moving') { b.isPiercing = true; return; }   // thanh chắn di động: xuyên qua (bullets.js bỏ qua giá trị trả về)
        if (!b.hitIds) b.hitIds = [];
        if (b.hitIds.includes(obj)) return pass ? 'pass' : undefined;
        b.hitIds.push(obj);
        if (kind !== 'moving' && typeof obj.hp === 'number' && !obj.isImmortal && obj.active !== false && (extra > 0 || pass)) {
            obj.hp -= b.dmg * (extra + (pass ? 1 : 0));
            if (pass) spawnSparkParticles(b.x, b.y, '#c084fc', 5);
            if (obj.hp <= 0 && !obj.swGone) {
                obj.swGone = 1; obj.active = false;
                const heal = swV(o, 'hu', 0.125, 0.25);
                if (heal > 0 && o.hp > 0) { o.hp = Math.min(o.maxHp, o.hp + heal); if (main) o.ammo = Math.min(o.maxAmmo, o.ammo + 1); swTxt(o, '+' + heal.toFixed(2) + ' NUỐT', '#c084fc', 10, 14); }
            }
        }
        return pass ? 'pass' : undefined;
    },
    draw(b) { if (typeof swDrawBullet === 'function') swDrawBullet(b); },
});

// ---------- Lột Bỏ Lớp Da Cũ (Full Evo) ----------
function swShed(p) {
    p.swShedUsed = true; p.swShedT = 75;
    p.freezeTimer = 0; p.bleedTimer = 0; p.burnTimer = 0; p.burnStacks = 0; if (p.poisonTimer) p.poisonTimer = 0;
    p.groundedTimer = 0; p.stunTimer = 0; p._nextSpeedMult = 1;
    p.hp = Math.min(p.maxHp, Math.max(p.hp, 0.05) + 1.5); p.ammo = p.maxAmmo;
    p.swDashT = 12; p.swDashDir = (p.x + p.w / 2 < canvas.width / 2) ? 1 : -1;
    swTxt(p, 'LỘT BỎ LỚP DA CŨ!', '#e9d5ff', 14, 14);
    spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, '#a855f7', 22);
    triggerScreenShake(6, 12);
    swSfx('playPowerup');
}

// ---------- Tick chính ----------
function swTick(p) {
    if (p.swRecoil > 0) p.swRecoil--;
    if (p.swMorphFx > 0) p.swMorphFx--;
    if (p.swShedT > 0) p.swShedT--;
    if (p.swReflCd > 0) p.swReflCd--;
    if (p.hp <= 0 || gameState.phase !== 'playing') return;
    if (!p.swInit) swInitRound(p);
    p.swT = (p.swT || 0) + 1;
    if (swFull(p) && !p.swShedUsed && p.hp < p.maxHp * 0.25) swShed(p);
    if (p.swDashT > 0) { p.swDashT--; p.x = Math.max(0, Math.min(canvas.width - p.w, p.x + (p.swDashDir || 1) * 5)); }
    const e = swEnemy(p);
    swBulletTick(p, e);
    if (!swAlive(e)) return;
    const ecx = e.x + e.w / 2, mcx = p.x + p.w / 2;
    // 🩸 Áp lực sát khí: đối diện (X ± 35px) -> địch chậm bắn/nạp
    const fa = Math.min(0.6, swV(p, 'pha', 0.25, 0.35));
    p.swFacing = fa > 0 && Math.abs(ecx - mcx) <= 35;
    let fired = false;
    if (e.bullets) for (const b of e.bullets) { if (!b.swSeen) { b.swSeen = 1; fired = true; } }
    if (p.swFacing) {
        if (e.ammo < e.maxAmmo && typeof e.lastReload === 'number') e.lastReload += 16.67 * fa;
        if (fired && typeof e.lastShot === 'number') e.lastShot += 300 * fa;
    }
    // 🕸 Bắt Tốc
    if (p.swForm === 'troc') {
        const eSpd = (e.speed || 0) * (e.statusSpeedMult === undefined ? 1 : e.statusSpeedMult);
        const cap = Math.max(0, eSpd - p.speed - (p.swSpdAdd || 0));
        if (Math.abs(e._vx || 0) > 0.5 && (p.swChase || 0) < cap) p.swChase = Math.min(cap, (p.swChase || 0) + (swE1(p) ? 0.3 : 0.15) * (p.swDup ? 1.35 : 1) / 60);
    }
    // Tê Liệt & Rách Cơ: địch lướt / dịch chuyển (di chuyển lớn trong 1 tick) khi đang dính ấn
    const mv = Math.hypot(e.x - (typeof e.swPx === 'number' ? e.swPx : e.x), e.y - (typeof e.swPy === 'number' ? e.swPy : e.y));
    e.swPx = e.x; e.swPy = e.y;
    if (e.swRachCd > 0) e.swRachCd--;
    if (e.swMarkT > 0) {
        e.swMarkT--;
        addStatusSlow(e, 1 - (e.swMarkSlow || 0));
        const walk = (e.speed || 3.5) * 1.6 + 3;
        if (mv > walk && mv < canvas.height && !isGrounded(e) && !(e.swRachCd > 0)) {
            e.swRachCd = 30; e.swMarkT = 0;
            if (e.swMarkRoot > 0) e.swRootT = e.swMarkRoot;
            if (e.swMarkDmg > 0) e.takeDamage(e.swMarkDmg, p, { unavoidable: true, bypassShield: true, swTrue: true });
            swTxt(e, 'RÁCH CƠ!', '#22d3ee', 13, 14);
            spawnSparkParticles(ecx, e.y + e.h / 2, '#f43f5e', 14);
            triggerScreenShake(5, 10);
        }
    }
    if (e.swRootT > 0) { e.swRootT--; addStatusSlow(e, 0); }
    if (e.swSlowT > 0) { e.swSlowT--; addStatusSlow(e, 0.65); }
    // ☣ Hoại Tử
    if (e.swRotT > 0) {
        e.swRotT--; e.swRotAcc = (e.swRotAcc || 0) + 1;
        if (e.swRotAcc >= 60) { e.swRotAcc = 0; e.takeDamage(e.swRotDps || 0.25, p, { unavoidable: true, bypassShield: true, swTrue: true, isDot: true }); }
    }
    if (e.swWoundT > 0) e.swWoundT--;
    // ☣ Trọng Thương & Ký Sinh Hồi Phục
    const ab = swV(p, 'doc', 0.25, 0.4);
    if (ab > 0 && e.hp > 0) {
        let gain = 0;
        const dh = e.hp - (typeof e.swPrevHp === 'number' ? e.swPrevHp : e.hp);
        if (dh > 0.001 && e.swPrevHp > 0) { gain += dh * ab; if (e.swWoundT > 0) e.hp -= dh * (e.swWoundR || 0); }
        const ws = e.gearWhiteShield || 0, dw = ws - (e.swPrevWs || 0);
        if (dw > 0.001) { gain += dw * ab; if (e.swWoundT > 0) e.gearWhiteShield = ws - dw * (e.swWoundR || 0); }
        if (gain > 0) {
            const room = p.maxHp - p.hp, toHp = Math.min(room, gain);
            p.hp += toHp; if (gain > toHp) p.gearWhiteShield = (p.gearWhiteShield || 0) + (gain - toHp);
            p.swLeech = 20;
        }
    }
    e.swPrevHp = e.hp; e.swPrevWs = e.gearWhiteShield || 0;
    // ☣ Ăn Mòn Khiên: địch vỡ đủ 3 (Evo1: 2) Khiên -> +1 Khiên
    const sh = e.shield || 0;
    if (p.swForm === 'doc' && sh < (e.swPrevSh || 0)) {
        e.swBroke = (e.swBroke || 0) + (e.swPrevSh - sh);
        const need = swE1(p) ? 2 : 3;
        while (e.swBroke >= need) { e.swBroke -= need; p.shield = (p.shield || 0) + 1; swTxt(p, '+1 KHIÊN ĂN MÒN', '#bef264', 11, 26); }
    }
    e.swPrevSh = sh;
}

CharHooks.register('skinwalker', {
    setup() {
        this.swInit = false; this.swForm = ''; this.swSub = ''; this.swSubK = 0; this.swDup = false;
        this.swPrevS = false; this.swRecoil = 0; this.swMorphFx = 0; this.swChase = 0; this.swShedUsed = false; this.swShedT = 0;
        this.swDashT = 0; this.swDashDir = 1; this.swReflCd = 0; this.swFacing = false; this.swLeech = 0; this.swT = 0;
        this.swMorph = ''; this.swMorphT = 0; this.lastShot = 0; this.swSpdAdd = 0;
    },
    speed(cur) { return !(cur > 0) ? cur : cur + ((this.swSpdAdd || 0) + (this.swChase || 0)) * (this.statusSpeedMult === undefined ? 1 : this.statusSpeedMult); },
    shoot(inp, now) {
        const s = !!inp.s;
        if (s && !this.swPrevS) swFire(this, now);
        this.swPrevS = s;
        return true;
    },
    beforeDamage() { return this.swShedT > 0; },
    beforeLethal() {
        if (swFull(this) && !this.swShedUsed) { swShed(this); return true; }
        return false;
    },
});

// ---------- Bọc update ----------
(function () {
    const origU = Player.prototype.update;
    Player.prototype.update = function () {
        if (swIs(this)) { try { swTick(this); } catch (err) { console.error(err); } }
        return origU.apply(this, arguments);
    };
})();

// ---------- Bọc takeDamage: vỏ gai, miễn vũng, ăn mòn khiên, kết liễu ----------
(function () {
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        const o = options || {};
        if (swIs(this) && typeof amount === 'number' && this.swInit) {
            if (o.isEnvironmental) {
                if (this.swForm === 'hu') return 0;
                if (this.swSub === 'hu') amount *= Math.max(0, 1 - this.swSubK);
            }
            if (attacker && attacker !== this && (attacker === p1 || attacker === p2)) {
                const d = Math.hypot(attacker.x + attacker.w / 2 - (this.x + this.w / 2), attacker.y + attacker.h / 2 - (this.y + this.h / 2));
                if (d < 160) {
                    const red = Math.min(0.7, swV(this, 'pha', 0.3, 0.45));
                    if (red > 0) amount *= 1 - red;
                    if (this.swForm === 'pha' && !(this.swReflCd > 0) && attacker.hp > 0 && !o.swTrue) {
                        this.swReflCd = 30; attacker.swSlowT = 90;
                        attacker.takeDamage(0.8, this, { unavoidable: true, swTrue: true });
                        swTxt(this, 'VỎ GAI!', '#fda4af', 11, 14);
                        spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, '#f43f5e', 10);
                    }
                }
            }
        }
        const atkSw = swIs(attacker) && attacker !== this && !o.swTrue;
        const sh0 = this.shield || 0, before = this.hp;
        const r = origTD.call(this, amount, attacker, options);
        if (atkSw && attacker.swForm === 'doc' && sh0 > 0 && (this.shield || 0) < sh0 && this.hp > 0) {
            this.takeDamage(1.0, attacker, { unavoidable: true, bypassShield: true, swTrue: true });
            swTxt(this, 'ĂN MÒN KHIÊN!', '#bef264', 11, 14);
        }
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && swIs(attacker)) swSpawnFinisher(attacker, this);
        return r;
    };
})();

// ---------- 👁 Hư Không: kháng Làm Chậm 50% (Evo1: 100%) ----------
(function () {
    if (typeof addStatusSlow !== 'function') return;
    const origS = addStatusSlow;
    addStatusSlow = function (p, mult) {
        if (swIs(p) && p.swForm === 'hu' && mult < 1) mult = swE1(p) ? 1 : 1 - (1 - mult) * 0.5;
        return origS(p, mult);
    };
})();

// Bot: true nếu nên nhấp bắn
function swBotFire(p, e, aligned) {
    if (!swIs(p) || !swAlive(e) || !(p.ammo > 0) || Date.now() - (p.lastShot || 0) < 300) return false;
    if (p.swForm === 'troc') return Math.abs(e._vx || 0) > 0.4 || aligned;
    if (p.swForm === 'hu') return aligned || Math.random() < 0.03;
    return aligned;
}
