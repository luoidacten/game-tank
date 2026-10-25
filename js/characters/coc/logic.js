// ==========================================
// The Change or Chance — COC (coc) — "Vận mệnh trong tay ta nắm!" (docs/BODY_MOI_4.md #69)
// ------------------------------------------
// Nội tại Cờ Bạc (js/game/shop-ui.js isGamblerBody): Reroll shop đầu tiên miễn phí, +1 ô shop & G.E.A.R.
// XÚC XẮC VẬN MỆNH: đầu hiệp & mỗi 12s đổi 1 trong 6 vũ khí (không trùng mặt vừa dùng):
//   1 Súng Lục | 2 Tiểu Liên | 3 Đại Pháo | 4 Đoản Đao | 5 Búp Bê Song Sinh | 6 Súng Vàng.
// Evo 1: giữ 0.6s ReRoll (CD 10s). Evo 2: cường hóa 6 vũ khí + Xúc Xắc Nội Tại (6 nội tại, 12s).
// FULL: 2 nội tại song song (+25% thông số) + Phân Ảnh Vũ Khí. Kết liễu: ĐỊNH MỆNH AN BÀI.
// Trạng thái: trường thuần trên player (cocSh = Phân Ảnh) + CocLaser/CocFireZone/CocBolt/CocSlash/CocFinisher (bodyEffects).
// ==========================================

const COC_GOLD = '#fcd34d', COC_PURP = '#a855f7', COC_RED = '#ef4444', COC_CYAN = '#22d3ee';
const COC_WEAPON_T = 720, COC_HOLD = 36, COC_REROLL_CD = 600;
const COC_W = {
    1: { n: 'SÚNG LỤC', dmg: 2.0, ammo: 10, spd: 4.5, c: '#38bdf8' },
    2: { n: 'TIỂU LIÊN', dmg: 0.5, ammo: 20, spd: 4.0, c: '#a3e635' },
    3: { n: 'ĐẠI PHÁO', dmg: 2.0, ammo: 2, spd: 3.0, c: '#fb923c' },
    4: { n: 'ĐOẢN ĐAO', dmg: 1.0, ammo: 0, spd: 5.5, c: '#f43f5e' },
    5: { n: 'BÚP BÊ SONG SINH', dmg: 0, ammo: 0, spd: 3.75, c: '#e879f9' },
    6: { n: 'SÚNG VÀNG', dmg: 5.0, ammo: 1, spd: 3.5, c: '#fcd34d' },
};
const COC_P = {
    1: { n: 'KHIÊN PHẢN CHẤN', c: '#22d3ee', ic: '🛡' },
    2: { n: 'HUYẾT MẠCH TÁI SINH', c: '#f87171', ic: '❤' },
    3: { n: 'HÀN BĂNG TRÓI BUỘC', c: '#93c5fd', ic: '❄' },
    4: { n: 'HỎA NGỤC THIÊU ĐỐT', c: '#fb923c', ic: '🔥' },
    5: { n: 'GIÁP GAI PHẢN NGHỊCH', c: '#dc2626', ic: '⚡' },
    6: { n: 'THỜI KHẮC HOÀNG KIM', c: '#fcd34d', ic: '★' },
};
const COC_SHADE_MULT = 0.6; // Phân Ảnh gây 60% st

function cocE1(p) { return p.hasUpgrade('evo_coc_1'); }
function cocE2(p) { return p.hasUpgrade('evo_coc_2'); }
function cocFull(p) { return cocE1(p) && cocE2(p); }
function cocIs(p) { return !!p && p.weapon === 'coc'; }
function cocEnemy(p) { return p === p1 ? p2 : p1; }
function cocDir(p) { return p.id === 1 ? -1 : 1; }
function cocAlive(t) { return t && t.hp > 0; }
function cocSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function cocTxt(o, s, c, sz, dy) { addFloatingText(o.x + o.w / 2, o.y + (o.id === 1 ? -18 - (dy || 0) : o.h + 22 + (dy || 0)), s, c, sz || 12); }
function cocHasP(p, id) { return !!p && Array.isArray(p.cocP) && p.cocP.includes(id); }
function cocPM(p) { return cocFull(p) ? 1.25 : 1; } // Full: mọi nội tại +25%
function cocFR(p) { return cocHasP(p, 6) ? 1 / (1 + 0.3 * cocPM(p)) : 1; } // hệ số thời gian giữa 2 phát
function cocRL(p) { return cocHasP(p, 6) ? 1 / (1 + 0.4 * cocPM(p)) : 1; } // hệ số thời gian nạp / hồi chiêu
function cocBS(p) { return cocHasP(p, 6) ? 1 + 0.25 * cocPM(p) : 1; }
function cocHomeY(p) { return p.id === 1 ? canvas.height - p.h - 22 : 20; }
function cocCoins(p, n) { if (p.id === 1) gameState.p1Coins += n; else gameState.p2Coins += n; }
function cocHeal(p, v) {
    if (!(v > 0) || !cocAlive(p)) return;
    if (cocHasP(p, 2)) v *= 1 + 0.3 * cocPM(p);
    p.hp = Math.min(p.maxHp, p.hp + v);
}
function cocPick(n, excl) {
    const pool = [1, 2, 3, 4, 5, 6].filter(x => !excl.includes(x));
    const out = [];
    while (out.length < n && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    return out;
}

// ---------- Lăn xúc xắc ----------
function cocSetWeapon(p, w) {
    const d = COC_W[w];
    p.cocW = w; p.cocWT = COC_WEAPON_T; p.cocDiceFx = 46;
    p.cocReload = 0; p.cocFireCd = 0; p.cocKnifeCd = 0; p.cocLcd = 0; p.cocRcd = 0; p.cocRBurst = 0;
    p.cocSmgHits = 0; p.cocSmgPend = 0; p.cocPistolN = 0; p.cocDashT = 0;
    if (p.cocLunge > 0) cocEndLunge(p);
    p.maxAmmo = w === 3 && cocE2(p) ? 3 : d.ammo; p.ammo = p.maxAmmo;
    p.damage = Math.max(0, d.dmg * (p.cocBaseDmg || 1));
}
function cocRoll(p, why) {
    const w = cocPick(1, [p.cocW || 0])[0];
    cocSetWeapon(p, w);
    cocTxt(p, '🎲 ' + (why ? why + ' · ' : '') + COC_W[w].n, COC_W[w].c, 13);
    if (cocE2(p)) {
        const n = cocFull(p) ? 2 : 1;
        const prev = Array.isArray(p.cocP) ? p.cocP : [];
        let pick = cocPick(n, prev);
        if (pick.length < n) pick = pick.concat(cocPick(n - pick.length, pick));
        p.cocP = pick; p.cocPrevP = prev.slice(); p.cocInnerFx = 46;
        pick.forEach((id, i) => { cocGainPassive(p, id); cocTxt(p, COC_P[id].ic + ' ' + COC_P[id].n, COC_P[id].c, 10, 14 + i * 12); });
    }
    if (cocFull(p)) {
        const sw = cocPick(1, [w])[0];
        p.cocSh = { w: sw, cd: 40, burst: 0, bt: 0, side: (p.x + p.w / 2 < canvas.width / 2) ? 1 : -1, fx: 30 };
    } else p.cocSh = null;
    spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, COC_W[w].c, 12);
    cocSfx('playCoin');
}
function cocGainPassive(p, id) {
    const pm = cocPM(p);
    if (id === 1) { if ((p.shield || 0) < 2) p.shield = Math.min(2, (p.shield || 0) + 1); }
    else if (id === 2) {
        if (p.hp >= p.maxHp - 0.01) p.gearWhiteShield = (p.gearWhiteShield || 0) + 0.75 * pm;
        else cocHeal(p, 0.5 * pm);
    }
}

// ---------- Hiệu ứng trúng đòn chung (vũ khí, Búp Bê, Dao, Phân Ảnh) ----------
// k: mặt vũ khí (1..6) hoặc 'L' (Búp Bê L)
function cocOnHit(o, v, dealt, k) {
    if (!cocIs(o) || !v || v === o || !(v instanceof Player)) return;
    const pm = cocPM(o);
    if (cocHasP(o, 2) && dealt > 0) cocHeal(o, dealt * 0.25 * pm);
    if (!cocAlive(v)) return;
    if (cocHasP(o, 3)) {
        if (v.cocSlowT > 0) v.cocFrostN = (v.cocFrostN || 0) + 1;
        const heavy = k === 3 || k === 6 || k === 'L';
        if ((v.cocFrostN || 0) >= (heavy ? 1 : 3) && !(v.cocFrostCd > 0)) {
            v.cocFrostN = 0; v.cocFrostCd = 240;
            v.freezeTimer = Math.max(v.freezeTimer || 0, Math.round(45 * pm));
            explosions.push(new Explosion(v.x + v.w / 2, v.y + v.h / 2, 40, 'rgba(147, 197, 253,', 0, o));
            addFloatingText(v.x + v.w / 2, v.y - 14, '❄ ĐÓNG BĂNG!', '#93c5fd', 13);
            v.takeDamage(0.5 * pm, o, { unavoidable: true, cocDot: true });
        }
        v.cocSlowT = 120; v.cocSlowM = 1 - 0.35 * pm;
    }
    if (cocHasP(o, 4)) {
        v.cocBurnS = Math.min(2, (v.cocBurnT > 0 ? (v.cocBurnS || 0) : 0) + 1);
        v.cocBurnT = 180; v.cocBurnBy = o.id; v.cocBurnPm = pm;
        v.cocShredT = 180; v.cocShredM = 1 + 0.15 * pm;
    }
    if (cocHasP(o, 6)) {
        if (Math.random() < ((k === 3 || k === 6) ? 1 : 0.35 * pm)) { cocCoins(o, 5); addFloatingText(v.x + v.w / 2, v.y - 4, '+$5', COC_GOLD, 11); }
        if (typeof k === 'number' && o.maxAmmo > 0 && o.ammo < o.maxAmmo && k === o.cocW && Math.random() < 0.2 * pm) { o.ammo++; cocTxt(o, 'MIỄN PHÍ!', COC_GOLD, 9, 26); }
    }
}
// St trực tiếp (Búp Bê L, Dao chém vòng) + hiệu ứng trúng
function cocDeal(o, v, amt, k, opt) {
    if (!cocAlive(v) || gameState.phase !== 'playing') return 0;
    const d = v.takeDamage(amt, o, opt || {}) || 0;
    cocOnHit(o, v, d, k);
    return d;
}

// ---------- Bắn ----------
function cocMuzzle(p) { return { cx: p.x + p.w / 2, sy: cocDir(p) < 0 ? p.y - 8 : p.y + p.h + 2 }; }
function cocUseAmmo(p, reloadT) {
    p.ammo--;
    if (p.ammo <= 0) {
        if (p.cocW === 2) p.cocSmgPend = 30; // chờ đạn bay tới rồi chấm điểm băng
        else p.cocReload = Math.round(reloadT * cocRL(p));
    }
}
function cocFirePistol(p, inp) {
    const { cx, sy } = cocMuzzle(p), dir = cocDir(p);
    p.cocPistolN = (p.cocPistolN || 0) + 1;
    const pierce = cocE2(p) && p.cocPistolN % 3 === 0;
    spawnBullet(p, { x: cx - 2.5, y: sy - (dir < 0 ? 6 : 0), w: 5, h: 9, vx: 0, vy: dir * C.bulletSpeed * 1.5 * cocBS(p), dmg: p.damage, hook: 'coc_b', cocK: 1, cocBypass: pierce });
    if (pierce) cocTxt(p, 'XUYÊN KHIÊN!', '#38bdf8', 9, 12);
    const md = inp && inp.l ? -1 : (inp && inp.r ? 1 : Math.sign(p._vx || 0));
    if (md && !(typeof isGrounded === 'function' && isGrounded(p))) { p.cocDashT = cocE2(p) ? 12 : 8; p.cocDashDir = md; }
    p.cocRecoil = 8; p.cocFireCd = Math.round(30 * cocFR(p));
    cocUseAmmo(p, 72); cocSfx('playShoot');
}
function cocFireSmg(p) {
    const { cx, sy } = cocMuzzle(p), dir = cocDir(p), a = (Math.random() - 0.5) * 0.09, sp = C.bulletSpeed * 1.35 * cocBS(p);
    spawnBullet(p, { x: cx - 2 + (Math.random() - 0.5) * 6, y: sy, w: 4, h: 6, vx: Math.sin(a) * sp, vy: Math.cos(a) * sp * dir, dmg: p.damage, hook: 'coc_b', cocK: 2 });
    p.cocRecoil = 4; p.cocFireCd = Math.max(3, Math.round(8 * cocFR(p)));
    cocUseAmmo(p, 0);
    if (p.cocT % 2 === 0) cocSfx('playShoot');
}
function cocFireCannon(p) {
    const { cx, sy } = cocMuzzle(p), dir = cocDir(p);
    spawnBullet(p, { x: cx - 5, y: sy - (dir < 0 ? 10 : 0), w: 10, h: 10, vx: 0, vy: dir * C.bulletSpeed * 0.95 * cocBS(p), dmg: p.damage, hook: 'coc_b', cocK: 3 });
    p.cocRecoil = 14; p.cocFireCd = Math.round(14 * cocFR(p));
    triggerScreenShake(2, 5);
    cocUseAmmo(p, 108); cocSfx('playExplosion');
}
function cocFireGold(p) {
    const { cx, sy } = cocMuzzle(p), dir = cocDir(p);
    const b = spawnBullet(p, { x: cx - 4.5, y: sy - (dir < 0 ? 9 : 0), w: 9, h: 9, vx: 0, vy: dir * C.bulletSpeed * 1.35 * cocBS(p), dmg: p.damage, hook: 'coc_b', cocK: 6, isHoming: true });
    if (cocE2(p)) b.isPiercing = true;
    p.cocRecoil = 14; p.cocFireCd = 20;
    triggerScreenShake(3, 6);
    cocUseAmmo(p, cocE2(p) ? 108 : 150); cocSfx('playLaser');
}
// Đoản Đao: lao lên chém vòng tròn rồi bật về
function cocStartLunge(p) {
    if (typeof isGrounded === 'function' && isGrounded(p)) { groundedBlock(p); return; }
    p.cocLunge = 1; p.cocLungeMax = cocE2(p) ? 26 : 22; p.cocLungeDist = cocE2(p) ? 165 : 115;
    p.cocKnifeCd = Math.round(36 * cocRL(p)); p.cocSlashed = false;
    cocSfx('playDash');
}
function cocEndLunge(p) { p.cocLunge = 0; p.y = cocHomeY(p); }
function cocKnifeSlash(p) {
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2, r = cocE2(p) ? 54 : 46, e = cocEnemy(p);
    const critC = cocE2(p) ? 0.5 : 0.35, crit = Math.random() < critC;
    const dmg = p.damage * (crit ? 3 : 1);
    bodyEffects.push(new CocSlash(p, cx, cy, r, crit));
    // chém vỡ đạn thường địch sát người
    if (e && e.bullets) for (let i = e.bullets.length - 1; i >= 0; i--) {
        const b = e.bullets[i];
        if (b && !b.hook && !b.unstoppable && !b.isPiercing && Math.hypot(b.x + (b.w || 0) / 2 - cx, b.y + (b.h || 0) / 2 - cy) < r + 6) {
            e.bullets.splice(i, 1); spawnSparkParticles(b.x, b.y, '#fda4af', 4);
        }
    }
    if (cocAlive(e) && Math.hypot(e.x + e.w / 2 - cx, e.y + e.h / 2 - cy) < r + e.w / 2) {
        cocDeal(p, e, dmg, 4);
        if (crit && cocE2(p)) cocHeal(p, 0.25);
    }
    // kiếm khí bay tiếp ~200px
    const dir = cocDir(p);
    spawnBullet(p, { x: cx - 13, y: cy + dir * 14 - 4, w: 26, h: 8, vx: 0, vy: dir * C.bulletSpeed * 1.25 * cocBS(p), dmg, hook: 'coc_b', cocK: 4, cocLife: 75, cocCrit: crit, isPiercing: true });
    if (crit) cocTxt(p, 'CHÍ MẠNG x3!', '#f43f5e', 11, 12);
    triggerScreenShake(2, 4);
}
// Búp Bê: vị trí theo xe (L trái, R phải)
function cocDollPos(p, side) { return { x: p.x + p.w / 2 + side * 24, y: p.y + p.h / 2 + 4 }; }
function cocDollCmd(p) {
    if (!(p.cocLcd > 0)) {
        const d = cocDollPos(p, -1);
        p.cocLcd = Math.round((cocE2(p) ? 210 : 300) * cocRL(p));
        bodyEffects.push(new CocLaser(p, d.x, 2.0 * (p.cocBaseDmg || 1), cocE2(p) ? 14 : 8, 'L'));
        cocTxt(p, 'BÚP BÊ L: TỤ LỰC!', '#e879f9', 10, 12);
        return;
    }
    if (!(p.cocRcd > 0) && !(p.cocRBurst > 0)) {
        p.cocRcd = Math.round(60 * cocRL(p)); p.cocRBurst = cocE2(p) ? 4 : 3; p.cocRBT = 0;
    }
}
function cocDollRShot(p, sx, sy, dmg, shade) {
    const e = cocEnemy(p); if (!cocAlive(e)) return;
    const v = aimVelocity(sx, sy, e, C.bulletSpeed * 1.25 * cocBS(p));
    spawnBullet(p, { x: sx - 2.5, y: sy - 2.5, w: 5, h: 5, vx: v.vx, vy: v.vy, dmg, hook: 'coc_b', cocK: 5, cocSlowR: cocE2(p), cocShade: !!shade });
}

BulletHooks.register('coc_b', {
    hit(b, o, v, dmg) {
        if (!v) return;
        const cx = v.x + v.w / 2, cy = v.y + v.h / 2;
        if (b.cocK === 2 && !b.cocShade) o.cocSmgHits = (o.cocSmgHits || 0) + 1;
        if (b.cocK === 3) cocCannonBlast(o, cx, cy, true);
        else if (b.cocK === 6) { explosions.push(new Explosion(cx, cy, 34, 'rgba(252, 211, 77,', 0, o)); if (cocE2(o) && !b.cocShade) { cocCoins(o, 10); addFloatingText(cx, cy - 18, '+$10 💰', COC_GOLD, 12); } }
        else spawnSparkParticles(cx, cy, b.cocK === 0 ? COC_CYAN : (COC_W[b.cocK] || COC_W[1]).c, 5);
        if (b.cocSlowR && v instanceof Player) { v.cocSlow2T = 60; }
        cocOnHit(o, v, dmg || 0, b.cocK);
    },
    edge(b, o) {
        if (b.cocK === 3) cocCannonBlast(o, b.x + b.w / 2, Math.max(0, Math.min(canvas.height, b.y + b.h / 2)), false, b);
    },
    obstacle(b, o, obj, kind) {
        if (b.cocK === 6 && cocE2(o) && (kind === 'wall' || kind === 'stone' || kind === 'bastion' || kind === 'moving')) return 'pass';
        if (b.cocK === 3) {
            // x3 st lên đối tượng không phải Body (lõi đã trừ x1 -> cộng thêm x2)
            if (obj && typeof obj.hp === 'number' && kind !== 'truck' && kind !== 'crate' && !obj.isImmortal) obj.hp -= b.dmg * 2;
            cocCannonBlast(o, b.x + b.w / 2, b.y + b.h / 2, false);
        }
    },
    truckDmgMult(b) { return b.cocK === 3 ? 3 : 1; },
    draw(b) { if (typeof cocDrawBullet === 'function') cocDrawBullet(b); },
});
// Đại Pháo nổ lan (trượt cũng nổ: địch trong 50px nhận 50% st) + Evo 2 vùng lửa 2s
function cocCannonBlast(o, x, y, direct, b) {
    explosions.push(new Explosion(x, y, 52, 'rgba(251, 146, 60,', 0, o));
    triggerScreenShake(3, 6);
    const e = cocEnemy(o);
    if (!direct && b && cocAlive(e) && Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < 50 + e.w / 2) cocDeal(o, e, b.dmg * 0.5, 3);
    if (cocE2(o)) bodyEffects.push(new CocFireZone(o, x, y, 38, 120, 'blast'));
}

// ---------- Phân Ảnh Vũ Khí (Full Evo) ----------
function cocShadeX(p) {
    const sh = p.cocSh; let x = p.x + p.w / 2 + sh.side * 40;
    if (x < 14 || x > canvas.width - 14) { sh.side = -sh.side; x = p.x + p.w / 2 + sh.side * 40; }
    return Math.max(14, Math.min(canvas.width - 14, x));
}
function cocShadeTick(p) {
    const sh = p.cocSh; if (!sh || !cocFull(p)) return;
    if (sh.fx > 0) sh.fx--;
    const e = cocEnemy(p); if (!cocAlive(e)) return;
    const x = cocShadeX(p), dir = cocDir(p), sy = p.id === 1 ? p.y - 4 : p.y + p.h + 4, base = (p.cocBaseDmg || 1) * COC_SHADE_MULT;
    const fr = cocFR(p), rl = cocRL(p);
    if (sh.burst > 0) {
        if (--sh.bt <= 0) {
            sh.burst--; sh.bt = sh.w === 2 ? Math.max(2, Math.round(7 * fr)) : 5;
            if (sh.w === 2) spawnBullet(p, { x: x - 2, y: sy, w: 4, h: 6, vx: (Math.random() - 0.5) * 0.4, vy: dir * C.bulletSpeed * 1.35 * cocBS(p), dmg: 0.5 * base, hook: 'coc_b', cocK: 2, cocShade: true });
            else cocDollRShot(p, x, sy, 0.5 * base, true);
        }
        return;
    }
    if (--sh.cd > 0) return;
    const aligned = Math.abs(e.x + e.w / 2 - x) < 70;
    if (!aligned && sh.w !== 5 && sh.w !== 6) { sh.cd = 6; return; }
    sh.fx = 10;
    const mk = (o) => spawnBullet(p, Object.assign({ hook: 'coc_b', cocShade: true }, o));
    switch (sh.w) {
        case 1: mk({ x: x - 2.5, y: sy, w: 5, h: 9, vy: dir * C.bulletSpeed * 1.5 * cocBS(p), dmg: 2.0 * base, cocK: 1 }); sh.cd = Math.round(45 * fr); break;
        case 2: sh.burst = 8; sh.bt = 0; sh.cd = Math.round(100 * rl); break;
        case 3: mk({ x: x - 5, y: sy, w: 10, h: 10, vy: dir * C.bulletSpeed * 0.95 * cocBS(p), dmg: 2.0 * base, cocK: 3 }); sh.cd = Math.round(110 * rl); break;
        case 4: mk({ x: x - 13, y: sy, w: 26, h: 8, vy: dir * C.bulletSpeed * 1.25 * cocBS(p), dmg: 1.0 * base, cocK: 4, cocLife: 75, isPiercing: true }); sh.cd = Math.round(55 * rl); break;
        case 5: sh.burst = 3; sh.bt = 0; sh.cd = Math.round(75 * rl); break;
        case 6: { const b = mk({ x: x - 4.5, y: sy, w: 9, h: 9, vy: dir * C.bulletSpeed * 1.35 * cocBS(p), dmg: 5.0 * base, cocK: 6, isHoming: true }); sh.cd = Math.round(160 * rl); b.isPiercing = true; break; }
    }
}

// ---------- Tick chính (chạy cả khi bị choáng) ----------
function cocTickVictim(v) {
    // hiệu ứng nội tại COC đặt lên mục tiêu (bất kỳ body nào)
    if (v.cocFrostCd > 0) v.cocFrostCd--;
    if (v.cocShredT > 0) v.cocShredT--;
    if (v.cocSlowT > 0) { v.cocSlowT--; addStatusSlow(v, v.cocSlowM || 0.65); }
    if (v.cocSlow2T > 0) { v.cocSlow2T--; addStatusSlow(v, 0.85); }
    if (v.cocBurnT > 0) {
        v.cocBurnT--;
        if (v.cocBurnT % 30 === 0 && gameState.phase === 'playing' && v.hp > 0) {
            const by = v.cocBurnBy === 1 ? p1 : p2;
            v.takeDamage(0.125 * (v.cocBurnS || 1) * (v.cocBurnPm || 1), by, { unavoidable: true, cocDot: true });
            spawnSparkParticles(v.x + v.w / 2, v.y + v.h / 2, '#fb923c', 3);
        }
        if (v.cocBurnT <= 0) v.cocBurnS = 0;
    }
}
function cocTick(p, inp) {
    p.cocT = (p.cocT || 0) + 1;
    ['cocDiceFx', 'cocInnerFx', 'cocRecoil', 'cocHasteT', 'cocRerollCd', 'cocFireCd', 'cocKnifeCd', 'cocWaveFx', 'cocHitFx'].forEach(k => { if (p[k] > 0) p[k]--; });
    if (gameState.phase !== 'playing' || p.hp <= 0) return;
    if (!p.cocW) cocRoll(p);
    if (--p.cocWT <= 0) cocRoll(p, '12s');
    // Giáp Gai: miễn Làm Chậm
    if (cocHasP(p, 5)) { p.statusSpeedMult = Math.max(1, p.statusSpeedMult || 1); p.slowTimer = 0; p.cocSlowT = 0; p.cocSlow2T = 0; }
    // nạp đạn / hồi chiêu
    if (p.cocReload > 0 && --p.cocReload <= 0) { p.ammo = p.maxAmmo; cocTxt(p, 'NẠP XONG', '#cbd5e1', 9); }
    if (p.cocSmgPend > 0 && --p.cocSmgPend <= 0) {
        const need = cocE2(p) ? 7 : 11;
        if ((p.cocSmgHits || 0) >= need) { p.ammo = p.maxAmmo; cocTxt(p, 'TRÚNG ' + p.cocSmgHits + ' — HỒI ĐẦY!', '#a3e635', 11); }
        else { p.cocReload = Math.round((cocE2(p) ? 150 : 360) * cocRL(p)); cocTxt(p, 'TRƯỢT! PHẠT NẠP ' + Math.round(p.cocReload / 6) / 10 + 's', COC_RED, 11); }
        p.cocSmgHits = 0;
    }
    if (p.cocLcd > 0) p.cocLcd--;
    if (p.cocRcd > 0) p.cocRcd--;
    if (p.cocRBurst > 0 && --p.cocRBT <= 0) {
        const d = cocDollPos(p, 1); p.cocRBurst--; p.cocRBT = 6; p.cocRFx = 6;
        cocDollRShot(p, d.x, p.id === 1 ? d.y - 10 : d.y + 10, 0.5 * (p.cocBaseDmg || 1));
    }
    if (p.cocRFx > 0) p.cocRFx--;
    // Súng Lục: lướt nhẹ
    if (p.cocDashT > 0) {
        p.cocDashT--;
        if (!(p.freezeTimer > 0)) p.x = Math.max(0, Math.min(canvas.width - p.w, p.x + p.cocDashDir * (cocE2(p) ? 3.6 : 3)));
    }
    // Đoản Đao: lao lên / bật về
    if (p.cocLunge > 0) {
        if (p.freezeTimer > 0) cocEndLunge(p);
        else {
            const k = p.cocLunge / p.cocLungeMax;
            p.y = cocHomeY(p) + cocDir(p) * p.cocLungeDist * Math.sin(Math.PI * k);
            if (!p.cocSlashed && k >= 0.5) { p.cocSlashed = true; cocKnifeSlash(p); }
            if (++p.cocLunge > p.cocLungeMax) cocEndLunge(p);
        }
    }
    // Hỏa Ngục: vệt lửa khi di chuyển / lướt
    if (cocHasP(p, 4) && (Math.abs(p._vx || 0) > 0.8 || p.cocLunge > 0) && p.cocT % 7 === 0) {
        let n = 0; for (const e of bodyEffects) if (e instanceof CocFireZone && e.owner === p && e.kind === 'trail') n++;
        if (n < 20) bodyEffects.push(new CocFireZone(p, p.x + p.w / 2, p.y + p.h / 2, 13, 120, 'trail'));
    }
    cocShadeTick(p);
}

function cocSpawnFinisher(p, v) {
    if (typeof bodyEffects === 'undefined' || bodyEffects.some(e => e instanceof CocFinisher)) return;
    bodyEffects.push(new CocFinisher(p, v));
    triggerScreenShake(10, 20);
    cocSfx('playExplosion');
}

// ---------- Entities (đồng bộ online: NET_CLASSES) ----------
// Búp Bê L: cảnh báo thẳng 0.5s rồi bắn tia lazer xuyên
class CocLaser {
    constructor(owner, x, dmg, width, k) {
        this.owner = owner; this.x = x; this.dmg = dmg; this.width = width; this.k = k;
        this.delay = 30; this.flash = 0; this.active = true;
    }
    update() {
        if (!this.active) return;
        if (gameState.phase !== 'playing') { this.active = false; return; }
        if (this.delay > 0) { if (--this.delay === 0) this.fire(); return; }
        if (++this.flash > 12) this.active = false;
    }
    fire() {
        const o = this.owner, e = cocEnemy(o);
        if (cocAlive(e) && this.x > e.x - this.width / 2 && this.x < e.x + e.w + this.width / 2) cocDeal(o, e, this.dmg, this.k, { isPiercing: true });
        triggerScreenShake(3, 6); cocSfx('playLaser');
    }
    draw() { if (typeof cocDrawLaser === 'function') cocDrawLaser(this); }
}
// Vùng lửa: Đại Pháo Evo 2 (st địch đứng trong) / Vệt Lửa Hỏa Ngục (đốt vật triệu hồi địch)
class CocFireZone {
    constructor(owner, x, y, r, life, kind) {
        this.owner = owner; this.x = x; this.y = y; this.r = r; this.life = life; this.max = life; this.kind = kind; this.active = true; this.t = 0;
    }
    update() {
        if (!this.active) return;
        if (gameState.phase !== 'playing' || --this.life <= 0) { this.active = false; return; }
        this.t++;
        const o = this.owner, e = cocEnemy(o);
        if (this.t % 15 !== 0) return;
        if (this.kind === 'blast' && cocAlive(e) && Math.hypot(e.x + e.w / 2 - this.x, e.y + e.h / 2 - this.y) < this.r + e.w / 2) {
            e.takeDamage(0.125, o, { unavoidable: true, cocDot: true });
        }
        // đốt vật triệu hồi / công trình địch đi qua
        const lists = [typeof turrets !== 'undefined' ? turrets : [], typeof creatorTurrets !== 'undefined' ? creatorTurrets : [], typeof creatorRobots !== 'undefined' ? creatorRobots : [], typeof necroMinions !== 'undefined' ? necroMinions : [], typeof ghostDecoys !== 'undefined' ? ghostDecoys : []];
        for (const L of lists) for (const s of L) {
            if (!s || s.active === false || typeof s.hp !== 'number' || s.owner === o || s.owner === o.id) continue;
            const sx = s.x + (s.w || 0) / 2, sy = s.y + (s.h || 0) / 2;
            if (Math.hypot(sx - this.x, sy - this.y) < this.r + (s.w || 20) / 2) { s.hp -= 0.15; if (s.hp <= 0 && 'active' in s) s.active = false; }
        }
    }
    draw() { if (typeof cocDrawFireZone === 'function') cocDrawFireZone(this); }
}
// Tia năng lượng / tia sét đỏ (hình ảnh)
class CocBolt {
    constructor(x1, y1, x2, y2, color) { this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2; this.color = color; this.t = 0; this.active = true; this.seed = Math.round(Math.random() * 1000); }
    update() { if (++this.t > 16) this.active = false; }
    draw() { if (typeof cocDrawBolt === 'function') cocDrawBolt(this); }
}
// Vệt chém vòng Đoản Đao (hình ảnh)
class CocSlash {
    constructor(owner, x, y, r, crit) { this.team = owner.id; this.x = x; this.y = y; this.r = r; this.crit = crit; this.t = 0; this.active = true; }
    update() { if (++this.t > 14) this.active = false; }
    draw() { if (typeof cocDrawSlash === 'function') cocDrawSlash(this); }
}
// Kết liễu "ĐỊNH MỆNH AN BÀI": xúc xắc khổng lồ rơi đè bẹp mục tiêu, nổ tung số 6
class CocFinisher {
    constructor(owner, victim) {
        this.team = owner.id; this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.t = 0; this.dur = 130; this.active = true; this.boomed = false;
    }
    update() {
        this.t++;
        if (this.t === 26 && !this.boomed) {
            this.boomed = true;
            explosions.push(new Explosion(this.x, this.y, 120, 'rgba(168, 85, 247,', 0, null));
            explosions.push(new Explosion(this.x, this.y, 70, 'rgba(252, 211, 77,', 0, null));
            triggerScreenShake(16, 26);
            spawnSparkParticles(this.x, this.y, COC_GOLD, 30);
            cocSfx('playExplosion');
        }
        if (this.t >= this.dur) this.active = false;
    }
    draw() { }
    drawOver() { if (typeof cocDrawFinisherOver === 'function') cocDrawFinisherOver(this); }
}

CharHooks.register('coc', {
    setup() {
        this.cocBaseDmg = this.damage || 1; // gồm nâng cấp Bánh Xích...
        this.cocW = 0; this.cocWT = 0; this.cocP = []; this.cocPrevP = []; this.cocSh = null;
        this.cocT = 0; this.cocPrevS = false; this.cocHold = 0; this.cocHoldUsed = false; this.cocRerollCd = 0;
        this.cocReload = 0; this.cocFireCd = 0; this.cocKnifeCd = 0; this.cocLcd = 0; this.cocRcd = 0; this.cocRBurst = 0; this.cocRBT = 0;
        this.cocSmgHits = 0; this.cocSmgPend = 0; this.cocPistolN = 0; this.cocDashT = 0; this.cocDashDir = 0; this.cocLunge = 0;
        this.cocHasteT = 0; this.cocRecoil = 0; this.cocDiceFx = 0; this.cocInnerFx = 0;
        this.cocSlowT = 0; this.cocSlow2T = 0; this.cocBurnT = 0; this.cocBurnS = 0; this.cocShredT = 0;
        cocRoll(this);
    },
    speed(v) {
        const d = COC_W[this.cocW] || COC_W[6];
        let m = d.spd / 3.5;
        if (this.cocHasteT > 0) m *= 1 + 0.3 * cocPM(this);
        if (cocHasP(this, 4)) m *= 1 + 0.15 * cocPM(this);
        if (this.cocLunge > 0) m *= 0.6;
        return v * m;
    },
    update(inp, eff, now) { this.lastShot = now; }, // tự quản nạp đạn
    shieldBreak(attacker) {
        // Khiên Phản Chấn: sóng xung kích xoá đạn thường địch 120px, +30% tốc 2s, bắn trả 1 tia tự ngắm
        if (!cocHasP(this, 1) || !attacker || attacker === this || !(attacker instanceof Player)) return;
        const pm = cocPM(this), cx = this.x + this.w / 2, cy = this.y + this.h / 2, R = 120 * pm, e = cocEnemy(this);
        if (e && e.bullets) for (let i = e.bullets.length - 1; i >= 0; i--) {
            const b = e.bullets[i];
            if (b && !b.hook && !b.unstoppable && Math.hypot(b.x + (b.w || 0) / 2 - cx, b.y + (b.h || 0) / 2 - cy) < R) e.bullets.splice(i, 1);
        }
        explosions.push(new Explosion(cx, cy, R, 'rgba(34, 211, 238,', 0, this));
        this.cocHasteT = 120;
        if (cocAlive(e)) {
            const sy = cocDir(this) < 0 ? this.y - 6 : this.y + this.h + 6, v = aimVelocity(cx, sy, e, C.bulletSpeed * 1.8);
            spawnBullet(this, { x: cx - 3, y: sy - 3, w: 6, h: 10, vx: v.vx, vy: v.vy, dmg: 1.0 * pm, hook: 'coc_b', cocK: 0 });
        }
        cocTxt(this, 'PHẢN CHẤN!', COC_CYAN, 12, 12);
    },
    shoot(inp, now) {
        const s = !!inp.s, pressed = s && !this.cocPrevS;
        this.cocPrevS = s;
        if (s) this.cocHold++; else { this.cocHold = 0; this.cocHoldUsed = false; }
        if (this.cocHoldUsed) return true;
        if (s && cocE1(this) && this.cocHold >= COC_HOLD && !(this.cocRerollCd > 0) && gameState.phase === 'playing') {
            this.cocHoldUsed = true; this.cocRerollCd = COC_REROLL_CD;
            cocRoll(this, 'REROLL');
            triggerScreenShake(3, 6);
            return true;
        }
        const w = this.cocW, rdy = !(this.cocReload > 0) && !(this.cocFireCd > 0) && this.ammo > 0;
        if (w === 1 && pressed && rdy) cocFirePistol(this, inp);
        else if (w === 2 && s && rdy && !(this.cocSmgPend > 0)) cocFireSmg(this);
        else if (w === 3 && pressed && rdy) cocFireCannon(this);
        else if (w === 4 && pressed && !(this.cocKnifeCd > 0) && !(this.cocLunge > 0)) cocStartLunge(this);
        else if (w === 5 && pressed) cocDollCmd(this);
        else if (w === 6 && pressed && rdy) cocFireGold(this);
        return true;
    },
    roundEnd() { if (this.cocLunge > 0) cocEndLunge(this); this.cocSh = null; this.cocP = []; },
});

// ---------- Bọc update: tick luôn chạy + hiệu ứng nội tại trên mục tiêu ----------
(function () {
    const origU = Player.prototype.update;
    Player.prototype.update = function (inp) {
        try {
            if (cocIs(this)) cocTick(this, inp);
            if (this.cocSlowT > 0 || this.cocSlow2T > 0 || this.cocBurnT > 0 || this.cocShredT > 0 || this.cocFrostCd > 0) cocTickVictim(this);
        } catch (err) { console.error(err); }
        return origU.apply(this, arguments);
    };
})();

// ---------- Bọc updateBullets: kiếm khí có tầm ----------
(function () {
    const origUB = Player.prototype.updateBullets;
    Player.prototype.updateBullets = function () {
        if (cocIs(this) && this.bullets && this.bullets.length) {
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const b = this.bullets[i];
                if (b && b.cocLife > 0 && --b.cocLife <= 0) this.bullets.splice(i, 1);
            }
        }
        return origUB.apply(this, arguments);
    };
})();

// ---------- Bọc checkHits: phát Súng Lục xuyên khiên (Evo 2) ----------
function cocWrapCheckHits() {
    if (typeof checkHits !== 'function' || checkHits.cocWrapped) return;
    const origCH = checkHits;
    checkHits = function (attacker, victim) {
        if (cocIs(attacker) && victim && victim.hp > 0 && attacker.bullets && gameState.phase === 'playing') {
            for (let i = attacker.bullets.length - 1; i >= 0; i--) {
                const b = attacker.bullets[i];
                if (!b || !b.cocBypass || !rectIntersect(b.x, b.y, b.w, b.h, victim.x, victim.y, victim.w, victim.h)) continue;
                attacker.bullets.splice(i, 1);
                const d = victim.takeDamage(b.dmg, attacker, { bypassShield: true });
                BulletHooks.call(b, 'hit', attacker, victim, d);
            }
        }
        return origCH.apply(this, arguments);
    };
    checkHits.cocWrapped = true;
}
if (typeof window !== 'undefined') window.addEventListener('load', cocWrapCheckHits); // combat.js nạp sau file này

// ---------- Bọc takeDamage: Xé Giáp, Giáp Gai (giảm st + phản), kết liễu ĐỊNH MỆNH AN BÀI ----------
(function () {
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        const opt = options || {}, raw = amount;
        const enemyHit = attacker && attacker !== this && attacker instanceof Player;
        if (typeof amount === 'number' && amount > 0) {
            if (this.cocShredT > 0 && enemyHit) amount *= (this.cocShredM || 1.15);
            if (cocIs(this) && cocHasP(this, 5) && enemyHit) amount *= 1 - 0.2 * cocPM(this);
        }
        const hp0 = this.hp, sh0 = this.shield || 0;
        const r = origTD.call(this, amount, attacker, options, ...Array.prototype.slice.call(arguments, 3));
        // Giáp Gai: phản 35% st gốc bằng tia sét đỏ không thể né (kể cả khi mất Khiên)
        if (cocIs(this) && cocHasP(this, 5) && enemyHit && raw > 0 && !opt.cocReflect && !opt.isEnvironmental && cocAlive(attacker)
            && (this.hp < hp0 || (this.shield || 0) < sh0)) {
            const pm = cocPM(this);
            bodyEffects.push(new CocBolt(this.x + this.w / 2, this.y + this.h / 2, attacker.x + attacker.w / 2, attacker.y + attacker.h / 2, COC_RED));
            attacker.takeDamage(raw * 0.35 * pm, this, { unavoidable: true, cocReflect: true, cocDot: true });
            if (this.cocRerollCd > 0) this.cocRerollCd = Math.max(0, this.cocRerollCd - 30);
        }
        if (cocIs(attacker) && attacker !== this && hp0 > 0 && this.hp <= 0) cocSpawnFinisher(attacker, this);
        return r;
    };
})();

// Bot: Tiểu Liên giữ bắn khi thẳng hàng; Evo 1 ReRoll khi vũ khí bất lợi
function cocBotWantReroll(p, e) {
    if (!cocIs(p) || !cocE1(p) || p.cocRerollCd > 0 || !cocAlive(e)) return false;
    if (p.cocWT < 150) return false;
    if (p.cocReload > 150) return Math.random() < 0.08;
    if (p.cocW === 5 && p.cocLcd > 0 && p.cocRcd > 0) return Math.random() < 0.01;
    return Math.random() < 0.002;
}
