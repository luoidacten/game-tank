// ==========================================
// Railgun — Pháo Điện Từ (railgun) — "Only my railgun - Đùa Thôi"
// ------------------------------------------
// TỪ TRƯỜNG: nhấp lần 1 (tốn 1 đạn) tạo QUẢ CẦU NĂNG LƯỢNG lơ lửng trước mũi xe (bám theo xe, tự nạp):
//   0s 0.9 st | 1s Sơ Cấp xanh lam 1.4 st, +35% tốc, XUYÊN VẬT THỂ | 2s Trung Cấp tím 1.9 st, +70% tốc, XUYÊN GIÁP & KHIÊN
//   | 3s Cực Đại: LÕI LAZER VÀNG 2.4 st. Nhấp lần 2 phóng thẳng; Lazer: khoá cột, cảnh báo 0.35s rồi chiếu xuyên toàn sân.
//   (Evo1: nạp nhanh 35% (0.65s/1.3s/2.0s), +20% tốc chạy khi giữ cầu, vẫn nạp đạn khi giữ cầu.)
// Giữ 0.5s (hồi 15s / Evo2 11s): VÙNG ĐIỆN TÍCH trước mặt 5s (Evo2 6s, tặng 1 cầu miễn phí) bám theo xe.
//   Đạn đạo địch lọt vào -> hoá Cầu Năng Lượng của Railgun (tự nạp lại từ 0). Hitscan / Lazer địch -> chặn ở rìa vùng,
//   kết tinh 1 cầu, vùng mất 1.0s / 1.0 st (về 0 -> đỡ trọn đòn rồi VỠ). Evo2: địch lao cận chiến mặt đất chạm vùng
//   -> bị chặn, hất về làn cũ, 1.0 st + Choáng 1.25s (đòn bổ từ trên trời bỏ qua).
//   Trong vùng: nhấp = thả cầu (tốn đạn; phát đầu giữa mặt, sau đó ngẫu nhiên trong vùng);
//   giữ 0.5s (hoặc hết giờ) = đóng vùng + PHÓNG ĐỒNG LOẠT theo cột (cầu Lazer: cảnh báo 0.4s);
//   giữ 1.0s = KHOÁ MỤC TIÊU: 3 cầu (Evo2 4, chậm 30% 1.2s) nạp lâu nhất lần lượt cách 0.25s, mỗi viên chiếu hồng tâm 0.25s.
// FULL: QUÁ TẢI (mốc 4.0s): trúng đích nổ xung +0.5 st AoE & TÊ LIỆT (khoá Giữ Bắn của địch 1s);
//   HOÀN NĂNG LƯỢNG: mỗi 2 đạn địch bị bắt -> +0.25 HP & -1s hồi Vùng.
//   BẮT TOÀN BỘ: bắt mọi đạn (kể cả loại trừ), cầu giữ bản sao đạn gốc (o.bd) -> phóng trả nguyên bản (js/core/reflect.js).
// Mọi trạng thái là trường thuần trên player / bullet / entity trong bodyEffects (đồng bộ online).
// ==========================================

const RG_CYAN = '#7dd3fc', RG_BLUE = '#38bdf8', RG_VIO = '#c084fc', RG_GOLD = '#fbbf24', RG_WHITE = '#f0f9ff', RG_ORANGE = '#fb923c';
const RG_LV_COL = ['#e0f2fe', RG_BLUE, RG_VIO, RG_GOLD, '#fff7c2'];
const RG_LV_DMG = [0.9, 1.4, 1.9, 2.4, 2.4];
const RG_LV_SPD = [7, 9.45, 11.9, 14, 14];
const RG_HOLD_ZONE = 30, RG_HOLD_AIM = 60, RG_RELOAD = 54, RG_ZW = 115, RG_ZD = 172, RG_CAP = 12;

function rgIs(p) { return !!p && p.weapon === 'railgun'; }
function rgE1(p) { return p.hasUpgrade('evo_rail_1'); }
function rgE2(p) { return p.hasUpgrade('evo_rail_2'); }
function rgFull(p) { return rgE1(p) && rgE2(p) && hasFullEvo(p, 'railgun'); }
function rgEnemy(p) { return p.id === 1 ? p2 : p1; }
function rgDir(p) { return p.id === 1 ? -1 : 1; }
function rgCx(p) { return p.x + p.w / 2; }
function rgFront(p) { return p.id === 1 ? p.y : p.y + p.h; }
function rgSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function rgTxt(p, s, c, z) { addFloatingText(rgCx(p), p.id === 1 ? p.y - 16 : p.y + p.h + 20, s, c || RG_CYAN, z || 11); }
function rgZoneDur(p) { return rgE2(p) ? 360 : 300; }
function rgCdMax(p) { return rgE2(p) ? 660 : 900; }
function rgRate(p) { return rgE1(p) ? 1.5 : 1; }
function rgLv(p, c) { if (c >= 240 && rgFull(p)) return 4; if (c >= 180) return 3; if (c >= 120) return 2; if (c >= 60) return 1; return 0; }
function rgDmg(p, lv) { return (p.damage || 0.9) * RG_LV_DMG[lv] / 0.9; }
function rgZx(p) { return Math.max(RG_ZW, Math.min(canvas.width - RG_ZW, rgCx(p))); }
// Hình chữ nhật Vùng Điện Tích (bám theo xe)
function rgZoneRect(p) {
    const f = rgFront(p), d = rgDir(p), a = f + d * 6, b = f + d * RG_ZD, zx = rgZx(p);
    return { x0: zx - RG_ZW, x1: zx + RG_ZW, y0: Math.min(a, b), y1: Math.max(a, b), zx };
}
function rgOrbPos(p, o) {
    if (!o.z) return { x: rgCx(p), y: rgFront(p) + rgDir(p) * 15 };
    return { x: rgZx(p) + o.ox, y: rgFront(p) + rgDir(p) * o.dp };
}
function rgOrbsIn(p) { return (p.rgOrbs || []).filter(o => o.z); }
function rgFrontOrb(p) { return (p.rgOrbs || []).find(o => !o.z); }
function rgAddOrb(p, z, ox, dp, c) {
    if (!p.rgOrbs) p.rgOrbs = [];
    const o = { z: z ? 1 : 0, ox: ox || 0, dp: dp || 30, c: c || 0, aim: 0, ax: 0, ay: 0, sp: (p.rgSeq = (p.rgSeq || 0) + 1) % 997 };
    p.rgOrbs.push(o);
    return o;
}

// ---------- Khai hoả ----------
function rgShot(p, x, y, lv, vx, vy, extra) {
    const s = lv >= 3 ? 9 : 8 + lv * 1.5;
    return spawnBullet(p, Object.assign({
        x: x - s / 2, y: y - s / 2, w: s, h: s, vx, vy, dmg: rgDmg(p, lv), hook: 'railgun', rgLv: lv,
        isPiercing: lv >= 1, rgTr: 0,
    }, extra || {}));
}
// Lazer Điện Từ: khoá cột x, cảnh báo `delay` tick (người bắn đứng yên — hitscanOwnerLocked) rồi chiếu xuyên toàn sân
function rgLaser(p, x, lv, delay) {
    const dmg = rgDmg(p, lv), over = lv >= 4;
    scheduleHitscan(p, delay, over ? '#fff7c2' : RG_GOLD, 22, () => rgLaserFire(p, x, dmg, over), x);
}
function rgLaserFire(p, x, dmg, over) {
    const e = rgEnemy(p), d = rgDir(p), from = rgFront(p);
    let stopY = null;
    const sw = (typeof sniperWallBlockY === 'function') ? sniperWallBlockY(p, x, from, d, 6, dmg) : null; // Tường Sniper chặn tia
    if (sw) stopY = sniperWallStopY(sw, d);
    if (!sw) {
        if (e && e.hp > 0 && Math.abs(x - (e.x + e.w / 2)) < e.w / 2 + 7) {
            const hp0 = e.hp;
            e.takeDamage(dmg, p, { bypassShield: true, isPiercing: true });
            if (e.hp < hp0 && over) rgOverload(p, e, x, e.y + e.h / 2);
            spawnSparkParticles(x, e.y + e.h / 2, RG_GOLD, 14);
        }
        if (typeof gmTwinAlso === 'function') gmTwinAlso(e, t => Math.abs(x - (t.x + t.w / 2)) < t.w / 2 + 7, dmg, p);
        // cày xuyên thùng hàng trên đường
        if (typeof crates !== 'undefined') for (const c of crates) {
            if (c.active && x > c.x - 6 && x < c.x + c.w + 6) { c.active = false; if (typeof crateOnBreak === 'function') crateOnBreak(c, p); if (typeof grantCrateLoot === 'function') grantCrateLoot(c, p); }
        }
    }
    bodyEffects.push(new RgBeam(p.id, x, from, stopY == null ? (d < 0 ? 0 : canvas.height) : stopY, over ? 1 : 0));
    triggerScreenShake(over ? 7 : 5, 8);
    rgSfx('playLaser');
}
function rgOverload(p, v, x, y) {
    explosions.push(new Explosion(x, y, 46, 'rgba(255, 240, 160,', 0, p));
    spawnSparkParticles(x, y, RG_BLUE, 12);
    if (v && v.hp > 0) {
        v.takeDamage(0.5, p, { isPiercing: true });
        v.rgJamT = 60; v.rgJamH = 0;
        addFloatingText(v.x + v.w / 2, v.y - 14, 'TÊ LIỆT ⚡', '#fde68a', 12);
    }
}
// Phóng 1 cầu theo cột đứng của nó
// FULL: cầu chứa đạn gốc bị bắt -> phóng trả CHÍNH viên đạn đó (giữ loại / hình / hook / hiệu ứng), mạnh hơn theo mức nạp
function rgLaunchBd(p, o, q, lv, ax, ay) {
    const c = o.bd; o.bd = null;
    c.owner = p; c.hitIds = [];
    c.dmg = (c.dmg || 0) * (1 + 0.25 * lv);
    const sp = Math.max(6, Math.hypot(c.vx || 0, c.vy || 0)) * (1 + 0.1 * lv);
    const vx = (ax || ay) ? ax * sp : 0, vy = (ax || ay) ? ay * sp : rgDir(p) * sp;
    if (typeof rfSetVel === 'function') rfSetVel(c, vx, vy); else { c.vx = vx; c.vy = vy; }
    c.x = Math.max(0, Math.min(canvas.width - (c.w || 6), q.x - (c.w || 6) / 2)); c.y = q.y - (c.h || 6) / 2;
    if (typeof c.startX === 'number') c.startX = c.x;
    if (typeof c.startY === 'number') c.startY = c.y;
    c.rfTint = RG_LV_COL[lv];
    p.bullets.push(c);
    return c;
}
function rgLaunch(p, o, laserDelay) {
    const q = rgOrbPos(p, o), lv = rgLv(p, o.c);
    if (o.bd) rgLaunchBd(p, o, q, lv, 0, 0);
    else if (lv >= 3) rgLaser(p, q.x, lv, laserDelay);
    else rgShot(p, q.x, q.y, lv, 0, rgDir(p) * RG_LV_SPD[lv]);
    spawnSparkParticles(q.x, q.y, RG_LV_COL[lv], 5);
}
function rgVolley(p) {
    const list = rgOrbsIn(p).filter(o => !(o.aim > 0));
    for (const o of list) rgLaunch(p, o, 24);
    p.rgOrbs = (p.rgOrbs || []).filter(o => !o.z || o.aim > 0);
    if (list.length) { triggerScreenShake(4, 8); rgSfx('playShoot'); rgTxt(p, 'PHÓNG x' + list.length, RG_CYAN, 12); }
}
function rgZoneOpen(p) {
    p.rgZone = rgZoneDur(p); p.rgZoneMax = p.rgZone; p.rgFirst = 0; p.rgCapN = 0; p.rgCdBank = 0; p.rgZoneFx = 20;
    const f = rgFrontOrb(p);
    if (f) { f.z = 1; f.ox = 0; f.dp = 22; }
    if (rgE2(p)) { rgAddOrb(p, 1, f ? 26 : 0, 30, 0); p.rgFirst = 1; }
    rgTxt(p, 'VÙNG ĐIỆN TÍCH!', RG_CYAN, 13);
    rgSfx('playPowerup');
}
function rgZoneClose(p) {
    p.rgZone = 0;
    rgVolley(p);
    p.rgCd = Math.max(60, rgCdMax(p) - (p.rgCdBank || 0)); p.rgCdBank = 0;
    p.rgZoneFx = -16;
}
// Cách 2: khoá mục tiêu bắn lần lượt
function rgAimStart(p) {
    const n = rgE2(p) ? 4 : 3;
    const list = rgOrbsIn(p).filter(o => !(o.aim > 0)).sort((a, b) => b.c - a.c).slice(0, n);
    if (!list.length) { rgTxt(p, 'KHÔNG CÓ CẦU', '#94a3b8', 10); return; }
    list.forEach((o, k) => { o.aim = 15 + k * 15; });
    rgTxt(p, 'KHOÁ MỤC TIÊU x' + list.length, RG_VIO, 12);
    rgSfx('playClick');
}
function rgAimTick(p) {
    const e = rgEnemy(p);
    for (let i = p.rgOrbs.length - 1; i >= 0; i--) {
        const o = p.rgOrbs[i];
        if (!(o.aim > 0)) continue;
        const q = rgOrbPos(p, o);
        if (o.aim === 15 || !(o.ax || o.ay)) { // khoá góc vào vị trí hiện tại của địch
            const tx = e ? e.x + e.w / 2 : q.x, ty = e ? e.y + e.h / 2 : q.y + rgDir(p) * 300;
            const L = Math.max(1, Math.hypot(tx - q.x, ty - q.y));
            o.ax = (tx - q.x) / L; o.ay = (ty - q.y) / L;
        }
        if (--o.aim <= 0) {
            const lv = rgLv(p, o.c), sp = lv >= 3 ? 16 : RG_LV_SPD[lv] * 1.1;
            if (o.bd) rgLaunchBd(p, o, q, lv, o.ax, o.ay);
            else rgShot(p, q.x, q.y, Math.max(lv, 0), o.ax * sp, o.ay * sp, { rgSlow: rgE2(p) ? 1 : 0, rgAimed: 1, isPiercing: true });
            spawnSparkParticles(q.x, q.y, RG_LV_COL[lv], 6);
            rgSfx('playShoot');
            p.rgOrbs.splice(i, 1);
        }
    }
}

// ---------- Vùng Điện Tích: bắt đạn / chặn tia / phản chấn ----------
const RG_NO_TYPES = ['purple', 'gojo_blue'];
function rgLaserLike(b) { return !!(b && (b.isLazer || b.isRaycast || b.isBeam || b.isHitscan)); }
function rgCanCatch(b, p) {
    if (!b || typeof b.vx !== 'number' || typeof b.vy !== 'number' || !rfCanReflect(b)) return false;
    if (p && rgFull(p)) return Math.hypot(b.vx, b.vy) >= 0.3; // FULL: bắt MỌI đạn (kể cả siêu đạn, Fuga, chém Sukuna, Tím/Lam Gojo, Hư Ảnh, quyền phong)
    if (b.isUltimate || b.isSukunaSlash || b.isStormPhantom || b.hook === 'one_punch') return false;
    if (b.type && RG_NO_TYPES.includes(b.type)) return false;
    return Math.hypot(b.vx, b.vy) >= 1;
}
function rgInZone(R, x, y) { return x >= R.x0 && x <= R.x1 && y >= R.y0 && y <= R.y1; }
function rgCatch(p, R, bx, by, b, from) {
    const n = rgOrbsIn(p).length;
    if (n < RG_CAP) {
        const dp = Math.max(14, Math.min(RG_ZD - 8, (by - rgFront(p)) * rgDir(p)));
        const o = rgAddOrb(p, 1, Math.max(-RG_ZW + 8, Math.min(RG_ZW - 8, bx - R.zx)), dp, 0);
        // FULL: giữ nguyên viên đạn gốc trong cầu (bản sao dữ liệu thuần, đổi chủ) để phóng trả đúng hình / hiệu ứng
        if (b && rgFull(p) && typeof reflectBulletClone === 'function') { o.bd = reflectBulletClone(b, p, { from, noPush: true }); delete o.bd.owner; }
    }
    spawnSparkParticles(bx, by, RG_CYAN, 4);
    if (rgFull(p) && ++p.rgCapN % 2 === 0) {
        p.hp = Math.min(p.maxHp, p.hp + 0.25); p.rgCdBank = (p.rgCdBank || 0) + 60;
        addFloatingText(bx, by - 10, '+0.25 HP ⚡', '#86efac', 11);
    }
}
// Chặn hitscan / tia lazer tại rìa vùng: mất 1s vùng / 1 st; về 0 -> đỡ trọn rồi vỡ
function rgHsBlock(p, amount, fromX) {
    const R = rgZoneRect(p), x = Math.max(R.x0 + 8, Math.min(R.x1 - 8, fromX === undefined ? R.zx : fromX));
    const y = rgFront(p) + rgDir(p) * (RG_ZD - 4);
    p.rgZone -= amount * 60;
    if (rgOrbsIn(p).length < RG_CAP) rgAddOrb(p, 1, x - R.zx, RG_ZD - 10, 0);
    p.rgHsFx = 14; p.rgHsX = x;
    spawnSparkParticles(x, y, RG_GOLD, 8);
    if (!(p.rgHsTxtT > 0)) { addFloatingText(x, y, 'CHẶN TIA! -' + amount.toFixed(1) + 's', RG_GOLD, 11); p.rgHsTxtT = 30; }
    if (p.rgZone <= 0) {
        addFloatingText(R.zx, y, 'VÙNG VỠ!', '#f472b6', 14);
        explosions.push(new Explosion(R.zx, y, 60, 'rgba(56, 189, 248,', 0, p));
        triggerScreenShake(6, 10);
        rgZoneClose(p);
    }
}
function rgHomeY(e) { return e.id === 1 ? canvas.height - e.h - 22 : 20; }
function rgIsSky(e) { return !!(e.thunderSky || e.tzFly || e.fsMode === 'thien' || e.fsHidden); }
function rgDashFlag(e) {
    return e.dashState === 1 || e.isDashing || e.isShortgunDashing || e.stormDashState === 1 || e.isPolarDashing
        || e.kazMode === 'dash' || e.tatMode === 'dash' || e.tsPhase > 0 || e.isCharging || e.groundLunge;
}
function rgMeleeCounter(p, e, R) {
    if (!e || !(e.hp > 0) || rgIsSky(e) || e.rgPinT > 0) { if (e) e.rgPY = e.y; return; }
    const d = rgDir(e), home = rgHomeY(e), off = (e.y - home) * d, mv = (e.y - (typeof e.rgPY === 'number' ? e.rgPY : e.y)) * d;
    e.rgPY = e.y;
    if (off < 20 || !(mv > 1.5 || rgDashFlag(e))) return;
    if (e.x + e.w < R.x0 || e.x > R.x1 || e.y + e.h < R.y0 || e.y > R.y1) return;
    const hx = e.x + e.w / 2, hy = e.y + e.h / 2;
    explosions.push(new Explosion(hx, hy, 46, 'rgba(56, 189, 248,', 0, p));
    spawnSparkParticles(hx, hy, RG_CYAN, 16);
    if (e.dashState === 1 || e.dashState === 2) { e.dashState = 0; e.tankDashCooldown = Math.max(e.tankDashCooldown || 0, 120); if (typeof e.dashStartY === 'number') e.dashStartY = home; }
    if (e.isShortgunDashing) { e.isShortgunDashing = false; e.shortgunDashState = 0; }
    if (e.stormDashState) e.stormDashState = 0;
    if (e.isPolarDashing) e.isPolarDashing = false;
    e.y = home; e.rgPY = home; e.rgPinT = 75;
    e.takeDamage(1.0, p);
    if (e.weapon !== 'juggernaut' && e.hp > 0) e.freezeTimer = Math.max(e.freezeTimer || 0, 75);
    addFloatingText(hx, hy, 'GIẬT ĐIỆN!', RG_CYAN, 14);
    triggerScreenShake(6, 10);
    rgSfx('playShieldBreak');
}
function rgZoneTick(p) {
    const e = rgEnemy(p), R = rgZoneRect(p);
    if (e && e.bullets) for (let i = e.bullets.length - 1; i >= 0; i--) {
        const b = e.bullets[i];
        if (!b || b.isAerialDrop) continue; // đạn rơi từ trời (Mortar...) bay trên đầu vùng
        const bx = b.x + (b.w || 6) / 2, by = b.y + (b.h || 6) / 2;
        if (!rgInZone(R, bx, by)) continue;
        if (rgLaserLike(b)) { e.bullets.splice(i, 1); rgHsBlock(p, b.dmg || 1, bx); if (!(p.rgZone > 0)) return; continue; }
        if (!rgCanCatch(b, p)) continue;
        e.bullets.splice(i, 1);
        rgCatch(p, R, bx, by, b, e);
    }
    if (rgE2(p)) rgMeleeCounter(p, e, R);
    if (--p.rgZone <= 0) rgZoneClose(p);
}

// ---------- Tick (chạy cả khi bị choáng) ----------
function rgTick(p) {
    if (gameState.phase !== 'playing') return;
    rgInstallHs(); rgBeamHot = 0;
    p.rgTk = (p.rgTk || 0) + 1;
    if (!p.rgOrbs) p.rgOrbs = [];
    if (p.hp <= 0) { p.rgOrbs.length = 0; p.rgZone = 0; return; }
    if (p.rgHsFx > 0) p.rgHsFx--;
    if (p.rgHsTxtT > 0) p.rgHsTxtT--;
    if (p.rgZoneFx > 0) p.rgZoneFx--; else if (p.rgZoneFx < 0) p.rgZoneFx++;
    if (p.rgCd > 0 && !(p.rgZone > 0)) p.rgCd--;
    const front = rgFrontOrb(p);
    if (p.ammo < p.maxAmmo && (!front || rgE1(p))) { if (++p.rgRl >= RG_RELOAD) { p.ammo++; p.rgRl = 0; } } else if (p.ammo >= p.maxAmmo) p.rgRl = 0;
    const rate = rgRate(p);
    for (const o of p.rgOrbs) {
        const l0 = rgLv(p, o.c);
        o.c = Math.min(270, o.c + rate);
        const l1 = rgLv(p, o.c);
        if (l1 > l0) { const q = rgOrbPos(p, o); spawnSparkParticles(q.x, q.y, RG_LV_COL[l1], l1 >= 3 ? 8 : 4); if (l1 >= 3 && !o.z) rgSfx('playCharge'); }
    }
    if (p.rgZone > 0) rgZoneTick(p);
    rgAimTick(p);
    const e = rgEnemy(p);
    if (e && e.rgSlowT > 0) { e.rgSlowT--; if (e.hp > 0) addStatusSlow(e, 0.7); }
}

// ---------- Chặn hitscan: bối cảnh đòn tia (bọc update các thực thể tia) ----------
let rgHsDepth = 0, rgBeamHot = 0;
function rgHsWrap(K) {
    if (!K || !K.prototype || !K.prototype.update || K.prototype.update.__rg) return;
    const o = K.prototype.update;
    K.prototype.update = function () { rgHsDepth++; try { return o.apply(this, arguments); } finally { rgHsDepth--; } };
    K.prototype.update.__rg = true;
}
function rgInstallHs() {
    if (rgInstallHs.done) return; rgInstallHs.done = true;
    rgHsWrap(typeof HitscanWarning !== 'undefined' ? HitscanWarning : null);
    rgHsWrap(typeof HitscanTelegraph !== 'undefined' ? HitscanTelegraph : null);
    rgHsWrap(typeof DjBeam !== 'undefined' ? DjBeam : null);
    rgHsWrap(typeof BdLaser !== 'undefined' ? BdLaser : null);
    rgHsWrap(typeof CocLaser !== 'undefined' ? CocLaser : null);
    rgHsWrap(typeof PrBeam !== 'undefined' ? PrBeam : null);
    rgHsWrap(typeof CrLaser !== 'undefined' ? CrLaser : null);
    if (typeof Beam === 'function' && !Beam.prototype.update.__rg) {
        const o = Beam.prototype.update;
        Beam.prototype.update = function () { const r = o.apply(this, arguments); if (this.active && this.isEvo && this.lifeTime % 12 === 0) rgBeamHot = this.ownerId; return r; };
        Beam.prototype.update.__rg = true;
    }
    if (Player.prototype.fireAnhMinhHitscan && !Player.prototype.fireAnhMinhHitscan.__rg) {
        const o = Player.prototype.fireAnhMinhHitscan;
        Player.prototype.fireAnhMinhHitscan = function () { rgHsDepth++; try { return o.apply(this, arguments); } finally { rgHsDepth--; } };
        Player.prototype.fireAnhMinhHitscan.__rg = true;
    }
}
const RG_BEAM_BODIES = ['lazer_beam', 'lazer_charge', 'lazer_auto', 'water_gun'];

// ---------- Entities ----------
// Tia Lazer Điện Từ (hình ảnh, sát thương đã tính khi bắn)
class RgBeam {
    constructor(team, x, y0, y1, over) { this.team = team; this.x = x; this.y0 = y0; this.y1 = y1; this.over = over; this.t = 0; this.dur = 22; this.active = true; }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof rgDrawBeam === 'function') rgDrawBeam(this); }
}
// Kết liễu: SIÊU PHÁO ĐIỆN TỪ (LEVEL 5: RAILGUN)
class RgFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.ox = owner.x + owner.w / 2; this.oy = owner.id === 1 ? owner.y : owner.y + owner.h;
        this.vx = victim.x + victim.w / 2; this.vy = victim.y + victim.h / 2; this.vw = victim.w;
        const dx = this.vx - this.ox, dy = this.vy - this.oy, L = Math.max(1, Math.hypot(dx, dy));
        this.dx = dx / L; this.dy = dy / L; this.fd = owner.id === 1 ? -1 : 1;
        this.t = 0; this.dur = 185; this.active = true; this.seed = Math.floor(Math.random() * 1000);
    }
    update() {
        this.t++;
        if (this.t === 4) rgSfx('playCoin');
        if (this.t === 56) rgSfx('playLaser');
        if (this.t === RG_FIN_HIT) { // đầu tia chạm mục tiêu (camera lia tới đúng lúc này)
            triggerScreenShake(16, 22);
            explosions.push(new Explosion(this.vx, this.vy, 90, 'rgba(251, 146, 60,', 0, this.team === 1 ? p1 : p2));
            spawnSparkParticles(this.vx, this.vy, RG_GOLD, 40);
            spawnSparkParticles(this.vx, this.vy, RG_BLUE, 30);
            rgSfx('playExplosion');
        }
        if (this.t >= this.dur) this.active = false;
    }
    draw() { if (typeof rgDrawFinisherUnder === 'function') rgDrawFinisherUnder(this); }
    drawOver() { if (typeof rgDrawFinisherOver === 'function') rgDrawFinisherOver(this); }
    // Camera: cận cảnh Railgun tung xu (0-54) -> lia theo đầu tia (56-66) -> dừng ở mục tiêu -> lùi về 1x trước băng rôn
    camPath() {
        if (typeof fcamKeys !== 'function') return null;
        const wx = this.ox, wy = this.oy + this.fd * 60, hy = this.vy - this.fd * 20;
        return fcamKeys(this.t, [[0, wx, wy, 1], [10, wx, wy, 1.6], [54, wx, wy, 1.6], [RG_FIN_HIT, this.vx, hy, 1.35],
            [128, this.vx, hy, 1.3], [168, this.vx, hy, 1]]);
    }
}
const RG_FIN_HIT = 66; // tick đầu tia chạm mục tiêu

// ---------- Bullet hook ----------
BulletHooks.register('railgun', {
    hit(b, o, v) {
        if (!v) return;
        const x = b.x + b.w / 2, y = b.y + b.h / 2;
        spawnSparkParticles(x, y, RG_LV_COL[b.rgLv || 0], 6);
        if (b.rgSlow && v.weapon !== 'juggernaut') v.rgSlowT = 72;
        if ((b.rgLv || 0) >= 4) rgOverload(o, v, x, y);
    },
    draw(b) { if (typeof rgDrawShot === 'function') rgDrawShot(b); },
});

CharHooks.register('railgun', {
    setup() {
        this.reloadTime = 1e12; // nạp đạn 0.9s/viên trong rgTick
        this.rgOrbs = []; this.rgRl = 0; this.rgHold = 0; this.rgPrevS = false; this.rgUsed = false;
        this.rgZone = 0; this.rgZoneMax = 1; this.rgCd = 0; this.rgFirst = 0; this.rgCapN = 0; this.rgCdBank = 0;
        this.rgTk = 0; this.rgHsFx = 0; this.rgZoneFx = 0; this.rgSeq = 0;
    },
    speed(s) { return rgE1(this) && rgFrontOrb(this) ? s * 1.2 : s; },
    shoot(inp) {
        const s = !!inp.s, pressed = s && !this.rgPrevS, released = !s && this.rgPrevS;
        this.rgPrevS = s;
        if (pressed) { this.rgHold = 0; this.rgUsed = false; }
        if (s) {
            this.rgHold++;
            if (!this.rgUsed) {
                if (this.rgZone > 0) { if (this.rgHold >= RG_HOLD_AIM) { this.rgUsed = true; rgAimStart(this); } }
                else if (this.rgHold >= RG_HOLD_ZONE && this.rgCd <= 0) { this.rgUsed = true; rgZoneOpen(this); }
            }
        } else if (released) {
            if (!this.rgUsed) {
                if (this.rgZone > 0) {
                    if (this.rgHold >= RG_HOLD_ZONE) rgZoneClose(this);
                    else if (this.ammo > 0 && rgOrbsIn(this).length < RG_CAP) {
                        this.ammo--;
                        const W = canvas.width, zx = rgZx(this);
                        const center = !this.rgFirst;
                        const ox = center ? 0 : Math.max(-RG_ZW + 10, Math.min(RG_ZW - 10, (Math.random() * 2 - 1) * (RG_ZW - 12)));
                        rgAddOrb(this, 1, Math.max(8 - zx, Math.min(W - 8 - zx, ox)), center ? 30 : 26 + Math.random() * (RG_ZD - 50), 0);
                        this.rgFirst = 1;
                        rgSfx('playClick');
                    } else rgTxt(this, this.ammo > 0 ? 'VÙNG ĐẦY' : 'HẾT ĐẠN', '#94a3b8', 10);
                } else if (this.rgHold < RG_HOLD_ZONE) {
                    const f = rgFrontOrb(this);
                    if (f) {
                        rgLaunch(this, f, 21);
                        this.rgOrbs.splice(this.rgOrbs.indexOf(f), 1);
                        rgSfx('playShoot');
                    } else if (this.ammo > 0) {
                        this.ammo--; rgAddOrb(this, 0, 0, 15, 0); rgSfx('playClick');
                    }
                } else rgTxt(this, 'VÙNG HỒI ' + Math.ceil(this.rgCd / 60) + 's', '#94a3b8', 10);
            }
            this.rgHold = 0;
        }
        return true;
    },
    roundEnd() { this.rgOrbs = []; this.rgZone = 0; this.rgCd = 0; },
});

// ---------- Bọc Player.update / takeDamage / checkHits ----------
(function () {
    const origU = Player.prototype.update;
    Player.prototype.update = function () {
        if (rgIs(this)) { try { rgTick(this); } catch (err) { console.error(err); } }
        // Tê Liệt (Quá Tải): khoá Giữ Bắn — nút Bắn chỉ còn nhấp (giữ > 6 tick bị nhả)
        let I = null, sv;
        if (this.rgJamT > 0 && gameState.phase === 'playing') {
            this.rgJamT--;
            I = this.id === 1 ? inputs.p1 : inputs.p2; sv = I.s;
            if (I.s) { if (++this.rgJamH > 6) I.s = false; } else this.rgJamH = 0;
        }
        let r;
        try { r = origU.apply(this, arguments); } finally { if (I) I.s = sv; }
        if (this.rgPinT > 0) { this.rgPinT--; this.y = rgHomeY(this); } // Giật Điện: ghim về làn cũ
        return r;
    };
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        // Vùng Điện Tích: chặn hitscan / tia lazer địch tại rìa vùng (đổi thời gian vùng)
        if (rgIs(this) && this.rgZone > 0 && this.hp > 0 && attacker && attacker !== this && attacker.id !== this.id
            && typeof amount === 'number' && amount > 0 && gameState.phase === 'playing'
            && (rgHsDepth > 0 || rgBeamHot === attacker.id || RG_BEAM_BODIES.includes(attacker.weapon))) {
            if (rgBeamHot === attacker.id) rgBeamHot = 0;
            rgHsBlock(this, amount, attacker.x + (attacker.w || 0) / 2);
            return 0;
        }
        const before = this.hp;
        const r = origTD.apply(this, arguments);
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && rgIs(attacker)
            && typeof bodyEffects !== 'undefined' && !bodyEffects.some(f => f instanceof RgFinisher)) {
            bodyEffects.push(new RgFinisher(attacker, this));
        }
        return r;
    };
})();
// Cầu Trung Cấp trở lên (Xuyên Giáp & Khiên): tự xử lý va chạm với địch, bỏ qua khiên / vật cản (combat.js nạp sau file này)
function rgWrapCheckHits() {
    if (typeof checkHits !== 'function' || checkHits.rgWrapped) return;
    {
        const origCH = checkHits;
        checkHits = function (attacker, victim) {
            if (!rgIs(attacker) || !attacker.bullets || !attacker.bullets.some(b => b.hook === 'railgun' && b.rgLv >= 2)) return origCH.apply(this, arguments);
            const arr = attacker.bullets, sp = arr.filter(b => b.hook === 'railgun' && b.rgLv >= 2), rest = arr.filter(b => !(b.hook === 'railgun' && b.rgLv >= 2));
            arr.length = 0; arr.push(...rest);
            let r;
            try { r = origCH.apply(this, arguments); }
            finally {
                for (const b of sp) {
                    if (!b.hitIds) b.hitIds = [];
                    if (victim && victim.hp > 0 && !b.hitIds.includes(victim) && rectIntersect(b.x, b.y, b.w, b.h, victim.x, victim.y, victim.w, victim.h)) {
                        b.hitIds.push(victim);
                        const d = victim.takeDamage(b.dmg, attacker, { bypassShield: true, isPiercing: true });
                        BulletHooks.call(b, 'hit', attacker, victim, d);
                        continue; // trúng đích -> tan
                    }
                    arr.push(b);
                }
            }
            return r;
        };
        checkHits.rgWrapped = true;
    }
}
if (typeof window !== 'undefined') window.addEventListener('load', rgWrapCheckHits);

// Bot: hành động gợi ý — 'open' | 'tap' | 'volley' | 'aim' | null (đứng chờ)
function rgBotAction(p, e, aligned) {
    if (!rgIs(p) || !e || !(e.hp > 0)) return null;
    if (p.rgZone > 0) {
        const n = rgOrbsIn(p).filter(o => !(o.aim > 0)).length;
        if (n >= 3 && (p.rgZone < 120 || n >= 5) && Math.random() < 0.5) return 'aim';
        if (p.rgZone < 40 && n > 0) return 'volley';
        if (n >= 6 && aligned) return 'volley';
        if (p.ammo > 0 && n < 6 && (p.rgTk % 25) === 0) return 'tap';
        return null;
    }
    if (!(p.rgCd > 0)) {
        let inc = 0;
        const cx = rgCx(p), cy = p.y + p.h / 2;
        for (const b of e.bullets || []) {
            const by = b.y + (b.h || 6) / 2;
            if (Math.abs(by - cy) < 320 && Math.abs(b.x - cx) < 140 && (cy - by) * (b.vy || 0) > 0) inc++;
        }
        const beam = bodyEffects.some(f => f && f.active && f.delay > 0 && f.owner === e && Math.abs(f.x - cx) < 40);
        if (inc >= 2 || beam || (!rgFrontOrb(p) && p.ammo >= 3 && Math.random() < 0.004)) return 'open';
    }
    const f = rgFrontOrb(p);
    if (f) {
        const lv = rgLv(p, f.c);
        if (aligned && (lv >= 2 || (lv >= 1 && Math.random() < 0.03))) return 'tap';
        if (lv >= 3 && Math.abs(rgCx(e) - rgCx(p)) < e.w) return 'tap';
        return null;
    }
    return p.ammo > 0 ? 'tap' : null;
}
