// ==========================================
// Diệp Thanh Phong — Gió Nhẹ (diep_thanh_phong) — docs/BODY_MOI_6.md #81
// ------------------------------------------
// Đạn = thanh GIÓ (p.ammo, 100 / Evo1 130, hồi 8/s). KHÍ ÁP p.dtpP 0..100 (khởi đầu 50): 3 vùng
//   Thuận Phong (0-33) +20% tốc, +35% hồi Gió, đòn trúng hoàn 35% Gió | Bão Hòa (34-66) -25% Gió, +12% dame,
//   +10% tốc, nhạy Khí Áp x1.5, Loạn Phong mỗi 10s (+1 Khiên Gió) | Nghịch Phong (67-100) +25% dame,
//   ở đủ 8s (hoặc chạm 100 -> ngay 4s) TOÀN PHONG: địch -20% tốc, +15% st nhận, trúng đòn -> Gió Cắt.
// Nút Bắn: nhấp = chiêu theo Thế Quạt | giữ 0.5s rồi nhả = đổi Thế (Thuận <-> Nghịch Vũ)
//   | giữ tới 1.0s = Đổi Khí Áp tức thì (hồi 8s) | trên không (Cửu Thiên): nhấp = đáp, giữ 0.5s = để lại vòng + về nhà.
// Thuận Phong Vũ (nhấp, -10 Khí Áp, Chuỗi 3 Nhịp) / Nghịch Phong Vũ (nuôi chiêu, +20 Khí Áp).
// Khiên Xanh = Khiên Gió (vỡ -> lốc xung kích xoá đạn thường gần, +25% tốc 1.5s).
// Trạng thái: trường thuần trên player + entity trong bodyEffects (summons.js) -> đồng bộ online.
// ==========================================

const DTP_JADE = '#34d399', DTP_LEAF = '#86efac', DTP_TEAL = '#2dd4bf', DTP_STORM = '#8b5cf6', DTP_WHITE = '#ecfdf5';
const DTP_ZONE_C = ['#86efac', '#2dd4bf', '#8b5cf6'];
const DTP_ZONE_N = ['THUẬN PHONG', 'BÃO HÒA', 'NGHỊCH PHONG'];
const DTP_ZONE_HOLD = 60;   // giữ 1.0s: Đổi Khí Áp
const DTP_SKY_HOLD = 30;    // trên không: giữ 0.5s để lại Vòng Cảnh Báo
const DTP_IMMUNE_MODES = ['sky', 'cyc_go', 'cyc_dance', 'cyc_back'];

function dtpE1(p) { return !!p && p.hasUpgrade('evo_dtp_1'); }
function dtpE2(p) { return !!p && p.hasUpgrade('evo_dtp_2'); }
function dtpFull(p) { return dtpE1(p) && dtpE2(p); }
function dtpIs(p) { return !!p && p.weapon === 'diep_thanh_phong'; }
function dtpTeam(id) { return id === 1 ? p1 : p2; }
function dtpEnemy(p) { return p === p1 ? p2 : p1; }
function dtpAlive(t) { return !!t && t.hp > 0; }
function dtpDir(p) { return p && p.id === 1 ? -1 : 1; }
function dtpLaneY(p) { return p.id === 1 ? canvas.height - p.h - 22 : 20; }
function dtpCx(o) { return o.x + o.w / 2; }
function dtpCy(o) { return o.y + o.h / 2; }
function dtpSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function dtpTxt(o, s, c, sz, dy) { addFloatingText(o.x + o.w / 2, o.y + (o.id === 1 ? -18 - (dy || 0) : o.h + 22 + (dy || 0)), s, c, sz || 12); }
function dtpSwitchN(p) { return dtpE1(p) ? 15 : 30; }
function dtpBeatN(p) { return dtpFull(p) ? 2 : 3; }
function dtpZoneCdMax(p) { return dtpE1(p) ? 300 : 480; }
function dtpTpNeed(p) { return dtpE2(p) ? 270 : 480; }
function dtpSkyR(T) { return Math.min(95, 42 + 11 * T / 60); }
function dtpImmune(p) { return DTP_IMMUNE_MODES.includes(p.dtpMode); }
function dtpCC(e) { return dtpAlive(e) && e.weapon !== 'juggernaut'; }
function dtpZone(p) { const v = p.dtpP || 0; return v < 33.5 ? 0 : (v < 66.5 ? 1 : 2); }
// Trọng số hiệu ứng vùng: vùng hiện tại 1; Full Evo ở Bão Hòa +50% hai vùng kia; giữ buff vùng cũ 4s khi Đổi Khí Áp
function dtpW(p) {
    const z = dtpZone(p), w = [0, 0, 0]; w[z] = 1;
    if (dtpFull(p) && z === 1) { w[0] = 0.5; w[2] = 0.5; }
    if (p.dtpCarryT > 0) w[p.dtpCarryZ || 0] = 1;
    return w;
}
function dtpDmgMul(p) { const w = dtpW(p); return (1 + 0.12 * w[1] + 0.25 * w[2]) * dtpHpMul(p); }
function dtpCostMul(p) { return dtpW(p)[1] >= 1 ? 0.75 : 1; }
function dtpTP(p) { return dtpIs(p) && ((p.dtpNgT || 0) >= dtpTpNeed(p) || p.dtpTpT > 0); }
function dtpInR(x, y, r, o) {
    const nx = Math.max(o.x, Math.min(o.x + o.w, x)), ny = Math.max(o.y, Math.min(o.y + o.h, y));
    return Math.hypot(x - nx, y - ny) <= r;
}
function dtpPull(e, tx, max) {
    if (!dtpCC(e)) return;
    const d = tx - dtpCx(e);
    e.x = Math.max(0, Math.min(canvas.width - e.w, e.x + Math.sign(d) * Math.min(max, Math.abs(d))));
}
function dtpStun(e, t) { if (dtpCC(e)) e.freezeTimer = Math.max(e.freezeTimer || 0, t); }
function dtpNormalB(b) { return !!b && !b.isLaser && !b.isBeam && !b.isHitscan && !b.unblockable && (b.w || 0) <= 26 && (b.h || 0) <= 32; }
// Xoá / nuốt đạn thường của địch trong bán kính r -> số viên
function dtpClearBullets(p, x, y, r, normalOnly) {
    const e = dtpEnemy(p);
    if (!e || !e.bullets) return 0;
    let n = 0;
    for (let j = e.bullets.length - 1; j >= 0; j--) {
        const b = e.bullets[j];
        if (normalOnly !== false && !dtpNormalB(b)) continue;
        if (Math.hypot(b.x + (b.w || 0) / 2 - x, b.y + (b.h || 0) / 2 - y) < r + (b.w || 0) / 2) {
            e.bullets.splice(j, 1); n++;
            if (n <= 4) spawnSparkParticles(b.x, b.y, DTP_LEAF, 3);
        }
    }
    return n;
}
// Phản đạn thường (Bão Quạt lao): đạn đổi chủ & bay ngược lại
function dtpReflect(p, x, y, r) {
    const e = dtpEnemy(p);
    if (!e || !e.bullets) return;
    for (let j = e.bullets.length - 1; j >= 0; j--) {
        const b = e.bullets[j];
        if (!dtpNormalB(b) || Math.hypot(b.x + (b.w || 0) / 2 - x, b.y + (b.h || 0) / 2 - y) > r + (b.w || 0) / 2) continue;
        e.bullets.splice(j, 1);
        b.owner = p; b.vy = -(b.vy || 0); b.vx = -(b.vx || 0); b.hitIds = []; b.hook = 'dtp'; b.dtpK = 'refl';
        p.bullets.push(b);
        spawnSparkParticles(b.x, b.y, DTP_JADE, 4);
    }
}
function dtpBreakCrates(p, x, y, r) {
    if (typeof crates === 'undefined') return 0;
    let n = 0;
    for (const c of crates) if (c.active && dtpInR(x, y, r, c)) { c.active = false; crateOnBreak(c, p); grantCrateLoot(c, p); n++; }
    return n;
}
const DTP_SUMMON_ROOTS = [
    () => typeof turrets !== 'undefined' ? turrets : null,
    () => typeof creatorTurrets !== 'undefined' ? creatorTurrets : null,
    () => typeof creatorRobots !== 'undefined' ? creatorRobots : null,
    () => typeof creatorDrones !== 'undefined' ? creatorDrones : null,
    () => typeof necroMinions !== 'undefined' ? necroMinions : null,
    () => typeof ghostDecoys !== 'undefined' ? ghostDecoys : null,
    () => typeof bastions !== 'undefined' ? bastions : null,
];
function dtpOwnedBy(o, e) { return !!o && (o.owner === e || (o.team !== undefined && o.team === e.id) || (o.ownerId !== undefined && o.ownerId === e.id)); }
// Mảnh vật thể bị quạt văng thẳng về phía địch (nổ 1.0 dame khi va chạm)
function dtpDebris(p, sx, sy) {
    const e = dtpEnemy(p);
    if (!dtpAlive(e)) return;
    const v = aimVelocity(sx, sy, e, 9, true);
    spawnBullet(p, { x: sx - 6, y: sy - 6, w: 12, h: 12, vx: v.vx, vy: v.vy, dmg: 1.0 * p.damage * dtpDmgMul(p), hook: 'dtp', dtpK: 'debris' });
}
// Quạt trúng vật thể / thùng / xe tiền / triệu hồi -> văng về phía địch
function dtpHitObjects(p, x, y, r, dmg) {
    const e = dtpEnemy(p);
    let n = 0;
    if (typeof crates !== 'undefined') for (const c of crates) {
        if (!c.active || !dtpInR(x, y, r, c)) continue;
        c.active = false; crateOnBreak(c, p); grantCrateLoot(c, p);
        if (n++ < 3) dtpDebris(p, c.x + c.w / 2, c.y + c.h / 2);
    }
    if (typeof moneyTrucks !== 'undefined') for (const t of moneyTrucks) {
        if (!t.active || !dtpInR(x, y, r, t)) continue;
        t.hp -= dmg;
        if (t.hp <= 0) { t.active = false; if (p.id === 1) gameState.p1Coins += 30; else gameState.p2Coins += 30; }
        if (n++ < 3) dtpDebris(p, t.x + t.w / 2, t.y + t.h / 2);
    }
    if (e) for (const g of DTP_SUMMON_ROOTS) {
        const a = g(); if (!a) continue;
        for (const o of a) {
            if (!o || o.active === false || typeof o.hp !== 'number' || !dtpOwnedBy(o, e)) continue;
            const ow = o.w || 20, oh = o.h || 20;
            if (!dtpInR(x, y, r, { x: o.x, y: o.y, w: ow, h: oh })) continue;
            o.hp -= dmg; if (o.hp <= 0) o.active = false;
            if (n++ < 3) dtpDebris(p, o.x + ow / 2, o.y + oh / 2);
        }
    }
    return n;
}

// Lướt chạm vật thể? (thùng, xe tiền, chướng ngại, tường, triệu hồi địch, khối đá)
function dtpTouchObj(p, x, y, r) {
    const e = dtpEnemy(p), hit = o => !!o && o.active !== false && dtpInR(x, y, r, { x: o.x, y: o.y, w: o.w || 20, h: o.h || 20 });
    if (typeof crates !== 'undefined' && crates.some(c => c.active && hit(c))) return true;
    if (typeof moneyTrucks !== 'undefined' && moneyTrucks.some(t => t.active && hit(t))) return true;
    if (typeof movingObstacle !== 'undefined' && movingObstacle && movingObstacle.active && hit(movingObstacle)) return true;
    if (typeof sniperWalls !== 'undefined' && sniperWalls.some(w => !dtpOwnedBy(w, p) && hit(w))) return true;
    if (typeof bodyEffects !== 'undefined' && bodyEffects.some(f => f.isStone && f.active && hit(f))) return true;
    if (e) for (const g of DTP_SUMMON_ROOTS) { const a = g(); if (a && a.some(o => dtpOwnedBy(o, e) && hit(o))) return true; }
    return false;
}
// Vòng Cảnh Báo (sky zone) / vùng gió (gale / storm) gần địch nhất của DTP
function dtpNearZone(p, e) {
    let best = null, bd = 1e9;
    for (const f of bodyEffects) {
        if (!f.active || f.team !== p.id) continue;
        if (!(f instanceof DtpSkyZone || (f instanceof DtpStorm && f.r > 0))) continue;
        const d = Math.abs(f.x - dtpCx(e));
        if (Math.abs(f.y - dtpCy(e)) < f.r + 40 && d < 170 && d < bd) { bd = d; best = f; }
    }
    return best ? { x: best.x, y: best.y, r: best.r } : null;
}

// ---------- HỢP PHONG: phối hợp 2 Thế Quạt ----------
// Đổi Thế xen kẽ (trong 2.5s) -> +1 tầng (tối đa 3): +10% dame & +10% hoàn Gió mỗi tầng; đủ 3 tầng -> chiêu kế tiếp cường hóa.
// Lặp cùng Thế >= 3 lần liên tiếp -> mất 1 tầng + LẶP THẾ (-15% dame mỗi lần lặp, sàn 70%).
const DTP_HP_WIN = 150;
function dtpHpMul(p) {
    const rep = Math.max(0, (p.dtpHpRep || 0) - 2);
    return (1 + 0.1 * (p.dtpHpS || 0)) * Math.max(0.7, 1 - 0.15 * rep) * (p.dtpHpPow > 1 ? 1.2 : 1);
}
function dtpCombo(p, st) {
    p.dtpHpPow = p.dtpHpEmp ? 1.25 : 1;
    if (p.dtpHpEmp) { p.dtpHpEmp = false; p.dtpHpFx = 30; dtpTxt(p, '✦ HỢP PHONG BỘC PHÁT!', '#fde047', 13, 28); }
    const last = p.dtpHpLast === 0 || p.dtpHpLast === 1 ? p.dtpHpLast : -1;
    if (last >= 0 && last !== st && p.dtpHpT > 0) {
        p.dtpHpS = Math.min(3, (p.dtpHpS || 0) + 1); p.dtpHpRep = 1; p.dtpHpFx = 24;
        if (p.dtpHpS >= 3) p.dtpHpEmp = true;
        dtpTxt(p, 'HỢP PHONG! x' + p.dtpHpS, DTP_JADE, 12, 40);
        p.ammo = Math.min(p.maxAmmo, p.ammo + 2 * p.dtpHpS);
    } else if (last === st) {
        p.dtpHpRep = (p.dtpHpRep || 1) + 1;
        if (p.dtpHpRep >= 3) { p.dtpHpS = Math.max(0, (p.dtpHpS || 0) - 1); p.dtpHpEmp = false; p.dtpRepFx = 40; dtpTxt(p, 'LẶP THẾ -' + Math.round(100 - 100 * Math.max(0.7, 1 - 0.15 * (p.dtpHpRep - 2))) + '%', '#f87171', 11, 40); }
    } else p.dtpHpRep = 1;
    p.dtpHpLast = st; p.dtpHpT = DTP_HP_WIN;
}

// ---------- Sát thương & hiệu ứng khi trúng ----------
function dtpHit(p, e, amt, opt, cost) {
    if (!dtpAlive(e) || !dtpPlaying()) return 0;
    const v = amt * p.damage * dtpDmgMul(p);
    const hp0 = e.hp;
    e.takeDamage(v, p, Object.assign({}, opt || {}));
    dtpOnHit(p, e, cost || 0);
    return Math.max(0, hp0 - e.hp);
}
function dtpOnHit(p, e, cost) {
    if (!dtpIs(p) || !e || e === p) return;
    if (dtpTP(p) && e.hp > 0) {
        e.dtpCutS = dtpE2(p) ? Math.min(3, (e.dtpCutT > 0 ? (e.dtpCutS || 0) : 0) + 1) : 1;
        e.dtpCutT = 150; e.dtpCutBy = p.id;
    }
    const w0 = dtpW(p)[0];
    if (cost > 0 && w0 > 0) p.ammo = Math.min(p.maxAmmo, p.ammo + cost * 0.35 * w0 * (1 + 0.1 * (p.dtpHpS || 0)));
}
function dtpAddP(p, d) {
    if (dtpZone(p) === 1) d *= 1.5;
    const old = p.dtpP;
    p.dtpP = Math.max(0, Math.min(100, old + d));
    if (p.dtpP >= 100 && old < 100) {
        p.dtpTpT = 240;
        dtpTxt(p, '⛈ TOÀN PHONG SÂN ĐẤU!', DTP_STORM, 14, 14);
        triggerScreenShake(5, 10);
    }
    const zo = old < 33.5 ? 0 : (old < 66.5 ? 1 : 2), zn = dtpZone(p);
    if (zo !== zn) { p.dtpZoneFx = 24; dtpTxt(p, DTP_ZONE_N[zn], DTP_ZONE_C[zn], 11, 26); }
}
function dtpSpend(p, c) {
    if (p.ammo + 1e-6 < c) {
        if (!(p.dtpNoWindT > 0)) { dtpTxt(p, 'THIẾU GIÓ!', '#94a3b8', 11); p.dtpNoWindT = 30; }
        return false;
    }
    p.ammo -= c;
    return true;
}
function dtpBuff(p, t, m) { (p.dtpBuffs = p.dtpBuffs || []).push([t, m]); }
function dtpMuzzle(p, h) { return p.id === 1 ? p.y - h - 2 : p.y + p.h + 2; }

// ---------- Khiên Gió / Loạn Phong / Đổi Khí Áp / Đổi Thế ----------
function dtpWindBurst(p) {
    const r = dtpZone(p) === 1 ? 165 : 110, cx = dtpCx(p), cy = dtpCy(p), e = dtpEnemy(p);
    const n = dtpClearBullets(p, cx, cy, r, true);
    if (dtpCC(e) && Math.hypot(dtpCx(e) - cx, dtpCy(e) - cy) < r + e.w / 2) e.kbX = (dtpCx(e) >= cx ? 1 : -1) * 7;
    dtpBuff(p, 90, 1.25);
    p.dtpBurstFx = 26; p.dtpBurstR = r;
    explosions.push(new Explosion(cx, cy, r, 'rgba(52, 211, 153,', 0, null));
    dtpTxt(p, 'KHIÊN GIÓ!' + (n ? ' -' + n + ' ĐẠN' : ''), DTP_JADE, 12, 14);
    if (dtpFull(p)) {
        p.ammo = Math.min(p.maxAmmo, p.ammo + 25);
        for (let i = 0; i < 4; i++) {
            const vx = (i - 1.5) * 2.2;
            spawnBullet(p, { x: cx - 6, y: dtpMuzzle(p, 12), w: 12, h: 12, vx, vy: dtpDir(p) * 6, dmg: 0.4 * p.damage * dtpDmgMul(p), hook: 'dtp', dtpK: 'mini', dtpHome: true });
        }
    }
    triggerScreenShake(4, 8);
}
function dtpLoanPhong(p) {
    const cx = dtpCx(p), cy = dtpCy(p);
    const n = dtpClearBullets(p, cx, cy, 80, true);
    if ((p.shield || 0) < 3) p.shield = (p.shield || 0) + 1;
    p.dtpLpFx = 30;
    dtpTxt(p, 'LOẠN PHONG! +KHIÊN GIÓ' + (n ? ' (-' + n + ')' : ''), DTP_TEAL, 11, 14);
    dtpSfx('playPowerup');
}
function dtpZoneSwitch(p) {
    const zo = dtpZone(p), zn = (zo + 1) % 3;
    if (dtpFull(p)) { p.dtpCarryZ = zo; p.dtpCarryT = 240; }
    p.dtpP = [17, 50, 83][zn];
    p.ammo = Math.min(p.maxAmmo, p.ammo + 20);
    p.dtpZoneCd = dtpZoneCdMax(p);
    p.dtpZoneFx = 30;
    dtpClearBullets(p, dtpCx(p), dtpCy(p), 60, true);
    if (dtpE1(p) && (p.shield || 0) < 3) p.shield = (p.shield || 0) + 1;
    explosions.push(new Explosion(dtpCx(p), dtpCy(p), 55, zn === 0 ? 'rgba(134, 239, 172,' : (zn === 1 ? 'rgba(45, 212, 191,' : 'rgba(139, 92, 246,'), 0, null));
    dtpTxt(p, '🌀 ĐỔI KHÍ ÁP: ' + DTP_ZONE_N[zn], DTP_ZONE_C[zn], 13, 14);
    triggerScreenShake(3, 6);
    dtpSfx('playPowerup');
}
function dtpStanceSwitch(p) {
    p.dtpStance = p.dtpStance ? 0 : 1;
    p.dtpSwFx = 22;
    dtpTxt(p, p.dtpStance ? '🪭 NGHỊCH PHONG VŨ' : '🪭 THUẬN PHONG VŨ', p.dtpStance ? '#c4b5fd' : DTP_LEAF, 12);
    dtpSfx('playClick');
}

// ---------- THẾ 1: THUẬN PHONG VŨ (nhấp, Chuỗi Nhịp) ----------
function dtpStrike(p) {
    const z = dtpZone(p), emp = (p.dtpBeats || 0) + 1 >= dtpBeatN(p);
    const cost = [10, 8, 12][z] * dtpCostMul(p);
    if (z === 2 && groundedBlock(p)) return;
    if (!dtpSpend(p, cost)) return;
    dtpCombo(p, 0);
    const dir = dtpDir(p), cx = dtpCx(p), mul = dtpDmgMul(p) * p.damage;
    if (z === 0) {
        if (emp) {
            bodyEffects.push(new DtpBigTornado(p.id, cx, dtpMuzzle(p, 0) + dir * 16, dir * 4.6));
            dtpTxt(p, 'ĐẠI CUỒNG PHONG!', DTP_LEAF, 13, 14);
            triggerScreenShake(3, 6);
        } else {
            spawnBullet(p, { x: cx - 7, y: dtpMuzzle(p, 16), w: 14, h: 16, vy: dir * 7.5, dmg: 0.8 * mul, hook: 'dtp', dtpK: 'tor', dtpCost: cost });
            dtpBuff(p, 60, 1.2);
        }
        dtpSfx('playShoot');
    } else if (z === 1) {
        if (emp) {
            spawnBullet(p, { x: cx - 4, y: dtpMuzzle(p, 20), w: 8, h: 20, vy: dir * 11, dmg: 1.2 * mul, hook: 'dtp', dtpK: 'blade', dtpBig: true, dtpCost: cost });
            for (const s of [-1, 1]) spawnBullet(p, { x: cx - 3, y: dtpMuzzle(p, 16), w: 6, h: 16, vx: s * 3.4, vy: dir * 9.5, dmg: 0.7 * mul, hook: 'dtp', dtpK: 'blade', dtpBounce: 1, dtpCost: cost / 3 });
            dtpTxt(p, 'TAM LIÊN PHONG NHẬN!', DTP_TEAL, 12, 14);
        } else {
            spawnBullet(p, { x: cx - 3, y: dtpMuzzle(p, 18), w: 6, h: 18, vy: dir * 11.5, dmg: 1.0 * mul, hook: 'dtp', dtpK: 'blade', dtpCost: cost });
        }
        if (!isGrounded(p)) { p.dtpDashT = emp ? 14 : 8; p.dtpDashDir = p.dtpLastDir || (cx < canvas.width / 2 ? 1 : -1); }
        dtpSfx('playShoot');
    } else {
        if (emp) dtpCycStart(p); else dtpLungeStart(p);
    }
    p.dtpBeats = emp ? 0 : (p.dtpBeats || 0) + 1;
    p.dtpCastFx = 12;
    dtpAddP(p, -10);
}
function dtpLungeStart(p) {
    p.dtpMode = 'lunge'; p.dtpModeT = 0; p.dtpHomeX = p.x;
    dtpTxt(p, 'PHONG VŨ!', '#c4b5fd', 12);
    dtpSfx('playDash');
}
function dtpCycStart(p) {
    p.dtpMode = 'cyc_go'; p.dtpModeT = 0; p.dtpHomeX = p.x;
    dtpTxt(p, '🌪 BÃO QUẠT TUYỆT VŨ!', DTP_STORM, 14, 14);
    triggerScreenShake(5, 10);
    dtpSfx('playDash');
}

// ---------- THẾ 2: NGHỊCH PHONG VŨ (nuôi chiêu) ----------
function dtpRelease(p) {
    const uid = p.dtpChUid;
    p.dtpCh = ''; p.dtpChUid = 0;
    for (const f of bodyEffects) if (f.active && f.uid === uid && f.team === p.id && f.launch) { f.launch(); break; }
}
function dtpSustain(p) {
    if (p.dtpCh) { dtpRelease(p); return; }
    const z = dtpZone(p), cost = [10, 12, 15][z] * dtpCostMul(p);
    if (z === 2 && groundedBlock(p)) return;
    if (!dtpSpend(p, cost)) return;
    dtpCombo(p, 1);
    const cx = dtpCx(p), dir = dtpDir(p);
    if (z === 0) {
        const uid = DTP_UID++;
        bodyEffects.push(new DtpOrb(p.id, uid, cx, dtpMuzzle(p, 0) + dir * 12));
        p.dtpCh = 'orb'; p.dtpChUid = uid; p.dtpChT = 0;
        dtpTxt(p, 'PHONG TỤ CẦU', DTP_LEAF, 12);
    } else if (z === 1) {
        const uid = DTP_UID++;
        bodyEffects.push(new DtpGrowTornado(p.id, uid, cx, dtpCy(p) + dir * 78));
        p.dtpCh = 'tor'; p.dtpChUid = uid; p.dtpChT = 0;
        dtpTxt(p, 'NUÔI LỐC HỘ THỂ — GIÁP GIÓ', DTP_TEAL, 12);
    } else {
        dtpSkyStart(p);
    }
    p.dtpCastFx = 12;
    dtpSfx('playPowerup');
    dtpAddP(p, 20);
}
function dtpSkyStart(p) {
    p.dtpMode = 'sky'; p.dtpModeT = 0; p.dtpHomeX = p.x;
    p.dtpSkyX = dtpCx(p); p.dtpSkyY = dtpCy(p); p.dtpSkyT = 0;
    explosions.push(new Explosion(dtpCx(p), dtpCy(p), 36, 'rgba(139, 92, 246,', 0, null));
    spawnSparkParticles(dtpCx(p), dtpCy(p), DTP_JADE, 14);
    dtpTxt(p, '☁ CỬU THIÊN PHONG VŨ!', '#c4b5fd', 13);
    p.y = p.id === 1 ? canvas.height + 300 : -300 - p.h;   // bay khỏi mặt sàn: không thể bị nhắm / trúng
    dtpSfx('playDash');
}
// Tạo cú đáp (bản thể hoặc Ảo Ảnh) -> số tick bản thể đứng lại
function dtpSpawnLanding(o, x, y, T, scale, auto) {
    const Ts = T / 60, big = Ts >= (dtpE2(o) ? 2.8 : 4), R = dtpSkyR(T) * scale;
    let cfg, stay, name;
    if (big) {
        cfg = { kind: 'tempest', r: R * 1.15, dur: 360, dot: 0.15 * scale, dotI: 24, pull: 1.6 * scale, sweeps: [[60, 0.8 * scale, 7], [180, 0.8 * scale, 7], [300, 0.8 * scale, 7]] };
        if (!auto) { cfg.phantomAt = 180; cfg.pScale = dtpE2(o) ? 1 : 0.6; }
        stay = 180; name = 'THIÊN PHONG BÃO VŨ!';
    } else if (Ts >= 2) {
        cfg = { kind: 'dance', r: R, dur: 132, dot: 0.22 * scale, dotI: 12, pull: 0.6 * scale, sweeps: [[126, 1.0 * scale, 8]] };
        stay = 134; name = 'MÚA QUẠT LIÊN HOÀN!';
    } else {
        cfg = { kind: 'sweep', r: R, dur: 26, sweeps: [[6, 1.4 * scale, 9]] };
        stay = 22; name = 'QUÉT QUẠT!';
    }
    cfg.x = x; cfg.y = y; cfg.phantom = !!auto; cfg.body = !auto;
    bodyEffects.push(new DtpStorm(o.id, cfg));
    explosions.push(new Explosion(x, y, R, 'rgba(52, 211, 153,', 0, null));
    spawnSparkParticles(x, y, DTP_JADE, 18);
    addFloatingText(x, y - R * 0.6, (auto ? 'ẢO ẢNH GIÓ: ' : '') + name, auto ? '#a7f3d0' : DTP_JADE, auto ? 12 : 14);
    triggerScreenShake(big ? 10 : 6, big ? 16 : 10);
    dtpSfx('playExplosion');
    return stay;
}
function dtpSkyLand(p) {
    const T = p.dtpSkyT || 0;
    p.dtpStay = dtpSpawnLanding(p, p.dtpSkyX, p.dtpSkyY, T, 1, false);
    p.dtpBigLand = T / 60 >= (dtpE2(p) ? 2.8 : 4);
    p.x = Math.max(0, Math.min(canvas.width - p.w, p.dtpSkyX - p.w / 2));
    p.y = Math.max(0, Math.min(canvas.height - p.h, p.dtpSkyY - p.h / 2));
    p.dtpMode = 'land'; p.dtpModeT = 0;
}
function dtpLeaveSky(p) {
    if (groundedBlock(p)) return;
    const T = p.dtpSkyT || 0;
    bodyEffects.push(new DtpSkyZone(p.id, p.dtpSkyX, p.dtpSkyY, T, dtpE2(p) ? 180 : 240, dtpE2(p) ? 0.85 : 0.65));
    p.x = Math.max(0, Math.min(canvas.width - p.w, p.dtpHomeX)); p.y = dtpLaneY(p);
    p.dtpMode = 'idle'; p.dtpModeT = 0; p.invincibleTimer = Math.max(p.invincibleTimer || 0, 10);
    p.dtpArriveFx = 22;
    if (dtpE1(p)) { p.ammo = Math.min(p.maxAmmo, p.ammo + 10); dtpBuff(p, 90, 1.25); }
    addFloatingText(p.dtpSkyX, p.dtpSkyY - 20, 'VÒNG CẢNH BÁO TỰ NUÔI', '#a7f3d0', 12);
    spawnSparkParticles(dtpCx(p), dtpCy(p), DTP_JADE, 12);
    dtpSfx('playDash');
}
function dtpTap(p) {
    if (p.dtpMode !== 'idle') return;
    if (p.dtpStance === 0) dtpStrike(p); else dtpSustain(p);
}
function dtpGoHome(p, mode) { p.dtpMode = mode || 'return'; p.dtpModeT = 0; }

// ---------- Máy trạng thái lướt / bay / đáp ----------
function dtpModeStep(p) {
    const e = dtpEnemy(p), dir = dtpDir(p), m = p.dtpMode;
    p.dtpModeT = (p.dtpModeT || 0) + 1;
    const T = p.dtpModeT;
    const I = typeof inputs !== 'undefined' ? (p.id === 1 ? inputs.p1 : inputs.p2) : null;
    if (m !== 'return' && m !== 'cyc_back') { p.kbX = 0; }
    if (m === 'sky') {
        p.dtpSkyT++;
        const drain = 10 * dtpCostMul(p) / 60;
        if (p.ammo < drain || p.dtpSkyT >= 300) { dtpSkyLand(p); return; }
        p.ammo -= drain;
        const ty = e ? dtpLaneY(e) + e.h / 2 : (dir < 0 ? 33 : canvas.height - 33);
        p.dtpSkyY = dir < 0 ? Math.max(ty, p.dtpSkyY - 4) : Math.min(ty, p.dtpSkyY + 4);
        if (I && !(p.freezeTimer > 0)) { if (I.l) p.dtpSkyX -= 3.4; if (I.r) p.dtpSkyX += 3.4; }
        const R = dtpSkyR(p.dtpSkyT);
        p.dtpSkyX = Math.max(R * 0.4, Math.min(canvas.width - R * 0.4, p.dtpSkyX));
        if (p.dtpSkyT >= 120 && dtpAlive(e) && dtpInR(p.dtpSkyX, p.dtpSkyY, R, e)) dtpPull(e, p.dtpSkyX, 0.55);
        return;
    }
    if (m === 'land') {
        if (T >= p.dtpStay) {
            if (p.dtpBigLand && isGrounded(p) && T < 360) return;    // Sa Lầy: không hóa gió về được
            if (p.dtpBigLand) dtpTxt(p, 'HÓA GIÓ VỀ NHÀ!', '#a7f3d0', 11);
            dtpGoHome(p);
        }
        return;
    }
    if (m === 'lunge') {
        // lướt thẳng sang phía địch tới khi chạm vật thể / thân địch / tới rìa làn địch (Sa Lầy -> dừng tại chỗ)
        let stop = T > 90 || isGrounded(p);
        if (!stop) p.y += dir * 13;
        if (p.y < 0 || p.y > canvas.height - p.h) stop = true;
        const lim = e ? (dir < 0 ? dtpLaneY(e) + e.h + 2 : dtpLaneY(e) - p.h - 2) : (dir < 0 ? 40 : canvas.height - p.h - 40);
        if ((dir < 0 && p.y <= lim) || (dir > 0 && p.y >= lim)) { p.y = lim; stop = true; }
        if (dtpAlive(e) && Math.abs(dtpCy(p) - dtpCy(e)) < (e.h + p.h) / 2 + 6 && Math.abs(dtpCx(p) - dtpCx(e)) < (e.w + p.w) / 2 + 6) stop = true;
        if (dtpTouchObj(p, dtpCx(p), dtpCy(p), p.w / 2 + 2)) stop = true;
        if (stop) {
            p.y = Math.max(0, Math.min(canvas.height - p.h, p.y));
            if (dtpAlive(e) && Math.abs(dtpCx(p) - dtpCx(e)) < (e.w + p.w) / 2 + 6) {
                if (dir < 0) p.y = Math.max(p.y, e.y + e.h + 2);
                if (dir > 0) p.y = Math.min(p.y, e.y - p.h - 2);
            }
            p.dtpMode = 'warn'; p.dtpModeT = 0; p.dtpWarnN = dtpE1(p) ? 45 : 72;
        }
        return;
    }
    if (m === 'warn') {
        if (T >= p.dtpWarnN) {
            const cx = dtpCx(p), cy = dtpCy(p), R = 60 * (p.dtpHpPow > 1 ? 1.25 : 1);
            p.dtpWarnR = R;
            if (dtpAlive(e) && dtpInR(cx, cy, R, e)) {
                dtpHit(p, e, 1.2, {}, 12 * dtpCostMul(p));
                // Hợp Phong: quạt địch văng về phía Vòng Cảnh Báo / vùng gió đang mở (đáp vào -> thêm dame)
                const z = dtpNearZone(p, e);
                if (dtpCC(e)) { e.kbX = (z ? (z.x >= dtpCx(e) ? 1 : -1) * 12 : (dtpCx(e) >= cx ? 1 : -1) * 9); e.dtpSlowT = 90; }
                if (z) { p.dtpKbT = 45; p.dtpKbX = z.x; p.dtpKbY = z.y; p.dtpKbR = z.r; dtpTxt(e, 'QUẠT VÀO VÒNG GIÓ!', DTP_JADE, 11); }
                else dtpTxt(e, 'ĐẨY LÙI + CHẬM', '#c4b5fd', 11);
            }
            const n = dtpHitObjects(p, cx, cy, R, 1.2);
            if (n) addFloatingText(cx, cy - 26, 'QUẠT VĂNG!', '#c4b5fd', 12);
            p.dtpSpinFx = 20;
            explosions.push(new Explosion(cx, cy, R, 'rgba(139, 92, 246,', 0, null));
            triggerScreenShake(5, 8);
            dtpSfx('playExplosion');
            dtpGoHome(p);
        }
        return;
    }
    if (m === 'cyc_go') {
        p.y += dir * 14;
        dtpReflect(p, dtpCx(p), dtpCy(p), 30);
        const ty = e ? dtpLaneY(e) + e.h / 2 - p.h / 2 : (dir < 0 ? 20 : canvas.height - p.h - 22);
        if ((dir < 0 && p.y <= ty) || (dir > 0 && p.y >= ty) || T > 60) {
            p.y = ty; p.dtpMode = 'cyc_dance'; p.dtpModeT = 0;
            explosions.push(new Explosion(dtpCx(p), dtpCy(p), 62, 'rgba(139, 92, 246,', 0, null));
            triggerScreenShake(6, 10);
        }
        return;
    }
    if (m === 'cyc_dance') {
        if (I && !(p.freezeTimer > 0)) { if (I.l) p.x -= 2.4; if (I.r) p.x += 2.4; p.x = Math.max(0, Math.min(canvas.width - p.w, p.x)); }
        const cx = dtpCx(p), cy = dtpCy(p);
        dtpReflect(p, cx, cy, 40);
        if (dtpAlive(e) && Math.abs(dtpCx(e) - cx) < 110) dtpPull(e, cx, 1.0);
        if (T % 18 === 0 && dtpAlive(e) && dtpInR(cx, cy, 62, e)) { dtpHit(p, e, 0.4, {}, 0); spawnSparkParticles(dtpCx(e), dtpCy(e), DTP_JADE, 5); }
        if (T >= 180) {
            if (dtpAlive(e) && Math.abs(dtpCx(e) - cx) < 90 && Math.abs(dtpCy(e) - cy) < 70) dtpHit(p, e, 2.0, {}, 0);
            p.dtpSlashFx = 26; p.dtpSlashX = cx; p.dtpSlashY = cy;
            dtpHitObjects(p, cx, cy, 70, 1.0);
            explosions.push(new Explosion(cx, cy, 90, 'rgba(52, 211, 153,', 0, null));
            triggerScreenShake(9, 14);
            dtpSfx('playExplosion');
            dtpGoHome(p, 'cyc_back');
        }
        return;
    }
    if (m === 'return' || m === 'cyc_back') {
        const hx = Math.max(0, Math.min(canvas.width - p.w, p.dtpHomeX)), hy = dtpLaneY(p);
        const dx = hx - p.x, dy = hy - p.y, L = Math.hypot(dx, dy), sp = 18;
        if (L <= sp || T > 80) {
            p.x = hx; p.y = hy; p.dtpMode = 'idle'; p.dtpModeT = 0; p.dtpArriveFx = 16;
            p.invincibleTimer = Math.max(p.invincibleTimer || 0, 8);
            return;
        }
        p.x += dx / L * sp; p.y += dy / L * sp;
        return;
    }
    p.dtpMode = 'idle';
}

// ---------- Tick chính (chạy cả khi bị choáng) ----------
function dtpTick(p) {
    for (const k of ['dtpCastFx', 'dtpSwFx', 'dtpZoneFx', 'dtpLpFx', 'dtpBurstFx', 'dtpSpinFx', 'dtpSlashFx', 'dtpArriveFx', 'dtpNoWindT', 'dtpImmTxt', 'dtpHpFx', 'dtpRepFx'])
        if (p[k] > 0) p[k]--;
    p.groundLunge = p.dtpMode === 'lunge';
    if (p.hp <= 0 && p.dtpMode && p.dtpMode !== 'idle' && p.dtpMode !== 'sky') dtpResetMode(p);   // chết giữa đường -> về làn
    if (p.hp <= 0 || gameState.phase !== 'playing') return;
    // bị Phản Chấn (Siêu Năng / Railgun) giữa cú lướt -> huỷ, ghim về làn
    if ((p.psyPinT > 0 || p.rgPinT > 0) && (p.dtpMode === 'lunge' || p.dtpMode === 'warn')) { dtpResetMode(p); p.groundLunge = false; }
    // Hợp Phong: cửa sổ xen kẽ (đóng băng khi đang nuôi chiêu / đang bay / lướt)
    if (p.dtpHpT > 0 && p.dtpMode === 'idle' && !p.dtpCh) { if (--p.dtpHpT <= 0 && p.dtpHpS > 0) { p.dtpHpS--; p.dtpHpEmp = false; if (p.dtpHpS > 0) p.dtpHpT = DTP_HP_WIN; } }
    if (p.dtpKbT > 0) {
        p.dtpKbT--;
        const ee = dtpEnemy(p);
        if (dtpAlive(ee) && dtpInR(p.dtpKbX, p.dtpKbY, p.dtpKbR, ee)) {
            p.dtpKbT = 0; dtpHit(p, ee, 0.8, {}, 0);
            explosions.push(new Explosion(dtpCx(ee), dtpCy(ee), 46, 'rgba(52, 211, 153,', 0, null));
            dtpTxt(ee, 'HỢP PHONG: CUỐN VÀO VÒNG!', DTP_JADE, 12);
        }
    }
    if (p.dtpZoneCd > 0) p.dtpZoneCd--;
    if (p.dtpCarryT > 0) p.dtpCarryT--;
    if (p.dtpTpT > 0) p.dtpTpT--;
    if (p.dtpBuffs && p.dtpBuffs.length) { for (const b of p.dtpBuffs) b[0]--; p.dtpBuffs = p.dtpBuffs.filter(b => b[0] > 0); }
    p.lastReload = Date.now();   // Gió tự hồi theo luật riêng (chặn hồi đạn chung)
    // Gió
    const busy = !!p.dtpCh || p.dtpMode === 'sky';
    if (!busy) {
        const w = dtpW(p);
        p.ammo += 8 / 60 * (dtpE1(p) ? 1.3 : 1) * (1 + 0.35 * w[0]);
    }
    if (p.ammo > p.maxAmmo) p.ammo = p.maxAmmo;
    if (p.ammo < 0) p.ammo = 0;
    // Nuôi chiêu: tiêu hao Gió mỗi giây, tối đa 4s / 5s
    if (p.dtpCh) {
        p.dtpChT = (p.dtpChT || 0) + 1;
        const drain = (p.dtpCh === 'orb' ? 8 : 6) * dtpCostMul(p) / 60, max = p.dtpCh === 'orb' ? 240 : 300;
        if (p.ammo < drain || p.dtpChT >= max) dtpRelease(p); else p.ammo -= drain;
    }
    // Vùng Khí Áp: Toàn Phong / Loạn Phong
    const w = dtpW(p);
    const wasTP = dtpTP(p);
    if (w[2] > 0) p.dtpNgT = (p.dtpNgT || 0) + w[2]; else p.dtpNgT = 0;
    if (!wasTP && dtpTP(p)) { dtpTxt(p, '⛈ TOÀN PHONG SÂN ĐẤU!', DTP_STORM, 14, 14); triggerScreenShake(4, 8); }
    if (w[1] > 0) { p.dtpLpT = (p.dtpLpT || 0) + w[1]; if (p.dtpLpT >= (dtpE2(p) ? 390 : 600)) { p.dtpLpT = 0; dtpLoanPhong(p); } }
    const e = dtpEnemy(p);
    if (dtpAlive(e)) {
        if (dtpTP(p)) { addStatusSlow(e, 0.8); addStatusVuln(e, 0.15); }
        if (e.dtpSlowT > 0) { e.dtpSlowT--; addStatusSlow(e, 0.6); }
        if (e.dtpLiftT > 0) e.dtpLiftT--;
        // Gió Cắt: 0.25 HP/s (x tầng), Evo2: -40% hồi máu
        if (e.dtpCutT > 0) {
            if (dtpE2(p) && typeof e.dtpPrevHp === 'number' && e.hp > e.dtpPrevHp && e.dtpPrevHp > 0) e.hp -= (e.hp - e.dtpPrevHp) * 0.4;
            e.dtpCutT--;
            if (e.dtpCutT % 30 === 0) e.takeDamage(0.125 * (e.dtpCutS || 1), p, { unavoidable: true, bypassShield: true, dtpDot: true });
        }
        e.dtpPrevHp = e.hp;
    }
    // Đạn tự tìm (lốc nhỏ / lưỡi gió phản)
    if (dtpAlive(e)) for (const b of p.bullets) {
        if (!b.dtpHome) continue;
        const sc = homingTurnScale(b, p.id, dtpCx(e), dtpCy(e));
        if (sc <= 0) continue;
        const sp = Math.hypot(b.vx || 0, b.vy || 0) || 6;
        const v = aimVelocity(b.x + b.w / 2, b.y + b.h / 2, e, sp, false);
        b.vx += (v.vx - b.vx) * 0.08 * sc; b.vy += (v.vy - b.vy) * 0.08 * sc;
        if (Math.sign(b.vy) !== dtpDir(p) && Math.abs(b.vy) < 2) b.vy = dtpDir(p) * 2;
    }
    // Khai Phong: lướt nhẹ
    if (p.dtpDashT > 0 && p.dtpMode === 'idle') { p.dtpDashT--; p.x = Math.max(0, Math.min(canvas.width - p.w, p.x + (p.dtpDashDir || 1) * 3.5)); }
    if (p.dtpMode && p.dtpMode !== 'idle') dtpModeStep(p);
}

BulletHooks.register('dtp', {
    hit(b, o, v) {
        if (!dtpIs(o) || !v || (v !== p1 && v !== p2) || v === o) return;
        dtpOnHit(o, v, b.dtpCost || 0);
        if (b.dtpK === 'debris') { explosions.push(new Explosion(b.x + b.w / 2, b.y + b.h / 2, 36, 'rgba(196, 181, 253,', 0, null)); triggerScreenShake(4, 6); }
        else spawnSparkParticles(b.x + b.w / 2, b.y + b.h / 2, DTP_JADE, 6);
    },
    edge(b) {
        if (b.dtpBounce > 0 && (b.x <= 0 || b.x >= canvas.width)) {
            b.vx = -(b.vx || 0); b.dtpBounce--; b.x = Math.max(1, Math.min(canvas.width - 1, b.x));
            return 'keep';
        }
    },
    draw(b) { if (typeof dtpDrawBullet === 'function') dtpDrawBullet(b); },
});

function dtpSpawnFinisher(p, v) {
    if (typeof bodyEffects === 'undefined' || bodyEffects.some(e => e instanceof DtpFinisher)) return;
    bodyEffects.push(new DtpFinisher(p, v));
    triggerScreenShake(6, 12);
    dtpSfx('playPowerup');
}
function dtpResetMode(p) {
    if (p.dtpMode && p.dtpMode !== 'idle') { p.x = Math.max(0, Math.min(canvas.width - p.w, p.dtpHomeX || p.x)); p.y = dtpLaneY(p); }
    p.dtpMode = 'idle'; p.dtpModeT = 0; p.dtpCh = ''; p.dtpChUid = 0; p.dtpChT = 0;
}

CharHooks.register('diep_thanh_phong', {
    setup() {
        this.maxAmmo = dtpE1(this) ? 130 : 100; this.ammo = this.maxAmmo;
        this.dtpP = 50; this.dtpStance = 0; this.dtpBeats = 0; this.dtpHold = 0; this.dtpPrevS = false; this.dtpUsed = false; this.dtpValid = false;
        this.dtpZoneCd = 0; this.dtpCarryT = 0; this.dtpCarryZ = 0; this.dtpTpT = 0; this.dtpNgT = 0; this.dtpLpT = 0;
        this.dtpBuffs = []; this.dtpMode = 'idle'; this.dtpModeT = 0; this.dtpHomeX = this.x; this.dtpCh = ''; this.dtpChUid = 0; this.dtpChT = 0;
        this.dtpSkyX = 0; this.dtpSkyY = 0; this.dtpSkyT = 0; this.dtpStay = 0; this.dtpBigLand = false; this.dtpWarnN = 72;
        this.dtpDashT = 0; this.dtpDashDir = 1; this.dtpLastDir = 0; this.dtpBurstR = 110;
        this.dtpHpS = 0; this.dtpHpT = 0; this.dtpHpLast = -1; this.dtpHpRep = 0; this.dtpHpEmp = false; this.dtpHpPow = 1; this.dtpKbT = 0; this.groundLunge = false;
        for (const k of ['dtpCastFx', 'dtpSwFx', 'dtpZoneFx', 'dtpLpFx', 'dtpBurstFx', 'dtpSpinFx', 'dtpSlashFx', 'dtpArriveFx', 'dtpNoWindT', 'dtpImmTxt', 'dtpHpFx', 'dtpRepFx']) this[k] = 0;
        const e = dtpEnemy(this);
        if (e) { e.dtpCutT = 0; e.dtpCutS = 0; e.dtpSlowT = 0; e.dtpLiftT = 0; e.dtpPrevHp = e.hp; }
    },
    speed(cur) {
        if (this.dtpMode !== 'idle') return 0;
        const w = dtpW(this);
        let m = 1 + 0.2 * w[0] + 0.1 * w[1];
        if (this.dtpCh === 'orb') m *= 1.25;
        if (this.dtpCh === 'tor') m *= 1.2;
        for (const b of this.dtpBuffs || []) m *= b[1];
        return cur * m;
    },
    shoot(inp) {
        const s = !!inp.s, pressed = s && !this.dtpPrevS, released = !s && this.dtpPrevS;
        this.dtpPrevS = s;
        if (inp.l && !inp.r) this.dtpLastDir = -1; else if (inp.r && !inp.l) this.dtpLastDir = 1;
        const m = this.dtpMode;
        if (pressed) { this.dtpHold = 0; this.dtpUsed = false; this.dtpValid = true; }
        if (m !== 'idle' && m !== 'sky') { this.dtpHold = 0; this.dtpValid = false; return true; }
        if (s && this.dtpValid) {
            this.dtpHold++;
            if (this.dtpUsed) return true;
            if (m === 'sky') {
                if (this.dtpHold >= DTP_SKY_HOLD) { this.dtpUsed = true; dtpLeaveSky(this); }
            } else if (this.dtpHold >= DTP_ZONE_HOLD) {
                this.dtpUsed = true;
                if (this.dtpZoneCd > 0) dtpTxt(this, 'ĐỔI KHÍ ÁP: HỒI ' + (this.dtpZoneCd / 60).toFixed(1) + 's', '#94a3b8', 11);
                else dtpZoneSwitch(this);
            }
        } else if (released && this.dtpValid) {
            if (!this.dtpUsed) {
                if (m === 'sky') { if (this.dtpSkyT > 6) dtpSkyLand(this); }
                else if (this.dtpHold >= dtpSwitchN(this)) dtpStanceSwitch(this);
                else dtpTap(this);
            }
            this.dtpHold = 0; this.dtpUsed = false; this.dtpValid = false;
        }
        return true;
    },
    shieldBreak() { dtpWindBurst(this); },
    roundEnd() { dtpResetMode(this); this.groundLunge = false; this.dtpKbT = 0; },
});

// ---------- Bọc update: tick luôn chạy (kể cả khi bị choáng) ----------
(function () {
    const origU = Player.prototype.update;
    Player.prototype.update = function () {
        if (dtpIs(this)) { try { dtpTick(this); } catch (err) { console.error(err); } }
        return origU.apply(this, arguments);
    };
})();

// ---------- Bọc takeDamage: Miễn Chọn / Bất Tử khi bay / Bão Quạt, Giáp Gió -25%, kết liễu ----------
(function () {
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        if (dtpIs(this) && this.hp > 0 && dtpImmune(this)) {
            if (!(this.dtpImmTxt > 0) && this.dtpMode !== 'sky') { addFloatingText(this.x + this.w / 2, this.y - 10, 'MIỄN NHIỄM', DTP_JADE, 12); this.dtpImmTxt = 30; }
            return 0;
        }
        if (dtpIs(this) && this.dtpCh === 'tor' && typeof amount === 'number' && attacker !== this) amount *= 0.75;
        const before = this.hp;
        const r = origTD.call(this, amount, attacker, options, ...Array.prototype.slice.call(arguments, 3));
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && dtpIs(attacker)) dtpSpawnFinisher(attacker, this);
        return r;
    };
})();

// ---------- Bot: trả về 'tap' | 'switch' | 'zone' | 'leave' | null ----------
function dtpBotAction(p, e, aligned) {
    if (!dtpIs(p) || !dtpAlive(e) || p.hp <= 0) return null;
    const m = p.dtpMode;
    if (m === 'sky') {
        const dx = Math.abs(p.dtpSkyX - dtpCx(e));
        if (p.dtpSkyT > 90 && p.dtpSkyT < 200 && Math.random() < 0.006) return 'leave';
        if ((p.dtpSkyT > 70 && dx < 22) || p.dtpSkyT > 260) return 'tap';
        return null;
    }
    if (m !== 'idle') return null;
    const z = dtpZone(p);
    if (p.dtpCh) {
        if (p.dtpStance === 1 && (p.dtpChT > 100 && aligned || p.dtpChT > 200)) return 'tap';
        if (p.dtpStance === 1 && Math.random() < 0.01) return 'switch';
        if (p.dtpStance === 0 && aligned && p.ammo > 20 && Math.random() < 0.08) return 'tap';
        if (p.dtpStance === 0 && p.dtpChT > 150) return 'switch';
        return null;
    }
    if (p.dtpZoneCd <= 0 && Math.random() < (p.ammo < 25 ? 0.03 : 0.006)) return 'zone';
    // Hợp Phong: thỉnh thoảng đổi Thế sau khi vừa ra chiêu để xen kẽ
    if (p.dtpHpT > 60 && p.dtpHpLast === p.dtpStance && (p.dtpHpRep || 0) >= 2 && p.ammo > 25 && Math.random() < 0.08) return 'switch';
    if (p.dtpStance === 0) {
        if (z === 2 && (p.dtpNgT || 0) > 120 && Math.random() < 0.01) return 'switch';
        if (aligned && p.ammo >= 14 && Math.random() < 0.12) return 'tap';
        if (z === 0 && Math.random() < 0.008) return 'switch';
        return null;
    }
    // Nghịch Phong Vũ
    if (p.ammo >= 30 && aligned && Math.random() < 0.05) return 'tap';
    if (p.ammo < 30 || Math.random() < 0.004) return 'switch';
    return null;
}
