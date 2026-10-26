// ==========================================
// Siêu Năng — Psychokinesis (psychokinesis) — "Tất cả... dừng lại cho ta!"
// ------------------------------------------
// Nhấp: ĐẠN NIỆM LỰC trôi lệch sang bên, lơ lửng giảm tốc 0.45s (Evo1 0.3s + tự ngắm địch) rồi vút đi tốc 12.
//       Nạp 1.2s/viên (tự quản lý). Full Evo: cứ 4 phát, phát kế tiếp gọi 3 viên.
// Giữ 1s (hồi 11s / Evo2 8s / Full 6.5s): VÙNG NIỆM LỰC r=135 (Evo2 175) theo xe, tối đa 5s (Full 6.5s), xe -20% tốc
//       (Evo2 bỏ). Đạn THƯỜNG của địch lọt vào bị thắng phanh theo ma sát riêng từng viên (dừng lệch nhau 15–55px
//       tính từ viền), nhấp nhô, hoá xanh lơ và CHUYỂN SANG mảng bullets của Siêu Năng (owner = Siêu Năng) giữ nguyên
//       dmg/kích thước/hiệu ứng/hình gốc (rfAdopt + rfDrawAs, js/core/reflect.js; thực thể bắt được vẽ lại bằng class gốc). Tối đa 15 viên (Evo2 25). Ngoại lệ: hitscan/lazer/raycast, chiêu lao húc (không phải
//       đạn), siêu đạn b.unstoppable / Liên Xạ Chrono / quyền Nhất Quyền / Juggernaut Full (JgSlug không phải đạn).
//   Trong vùng: nhấp (hoặc hết giờ) = PHẢN HỒI NGƯỢC QUỸ ĐẠO (-v gốc, +30% tốc; Evo2 +50% tốc +35% st, chậm 30% 1.5s);
//               giữ 1s (Evo1 0.5s) = KHOÁ TÂM TẤT SÁT: hiện đường ngắm rồi hội tụ về địch (homing nhẹ), +2s hồi chiêu.
//               Full: bắn dồn lệch nhịp 0.06s/viên, xuyên 1 mục tiêu; bẻ cong lazer (-50% st); bắt pháo cối / bom.
// Mọi trạng thái là trường thuần trên player / bullet / entity trong bodyEffects (đồng bộ online).
// ==========================================

const PSY_CYAN = '#00f2ff', PSY_SOFT = '#a5f3fc', PSY_VIO = '#a78bfa';
const PSY_HOLD = 60, PSY_RELOAD = 72;

function psyE1(p) { return p.hasUpgrade('evo_psy_1'); }
function psyE2(p) { return p.hasUpgrade('evo_psy_2'); }
function psyFull(p) { return hasFullEvo(p, 'psychokinesis'); } // cần thêm thẻ FULL EVO (FULL_EVO_GATE)
function psyIs(p) { return !!p && p.weapon === 'psychokinesis'; }
function psyEnemy(p) { return p.id === 1 ? p2 : p1; }
function psyDir(p) { return p.id === 1 ? -1 : 1; }
function psySfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function psyTxt(p, s, c, z) { addFloatingText(p.x + p.w / 2, p.id === 1 ? p.y - 16 : p.y + p.h + 20, s, c || PSY_CYAN, z || 11); }
function psyR(p) { return psyE2(p) ? 175 : 135; }
function psyCapMax(p) { return psyE2(p) ? 25 : 15; }
function psyDur(p) { return psyFull(p) ? 390 : 300; }
function psyCdMax(p) { return psyFull(p) ? 390 : (psyE2(p) ? 480 : 660); }
function psyLockN(p) { return psyE1(p) ? 30 : 60; }
function psyHoverN(p) { return psyE1(p) ? 18 : 27; }
function psyCx(p) { return p.x + p.w / 2; }
function psyCy(p) { return p.y + p.h / 2; }

// Đạn địch có bắt giữ được không? (đạn bay thường; loại trừ hitscan / lazer / siêu đạn không thể cản phá)
const PSY_NO_TYPES = ['purple', 'gojo_blue'];
function psyCanCatch(b) {
    if (!b || typeof b.vx !== 'number' || typeof b.vy !== 'number' || b.psyCap || !rfCanReflect(b)) return false;
    // Bắt MỌI đạn đạo vật lý (đạn thường/lớn, tên lửa, phi kiếm, cầu lửa/băng, kim, mìn bay, Fuga, Phong Trảm...).
    // Loại trừ: hitscan / lazer / raycast (Evo 2 chặn riêng ở rìa vùng), chiêu tối thượng / chém không gian, quyền phong.
    if (b.isLazer || b.isRaycast || b.isBeam || b.isHitscan || b.isUltimate) return false;
    if (b.isSukunaSlash || b.isStormPhantom) return false;
    if (b.type && PSY_NO_TYPES.includes(b.type)) return false;
    if (b.hook === 'one_punch') return false;                          // quyền phong Nhất Quyền
    if (Math.hypot(b.vx, b.vy) < 1) return false;
    return true;
}
function psyLaserLike(b) { return !!(b && (b.isLazer || b.isRaycast || b.isBeam)); }

// ---------- Bắt giữ ----------
function psyCatch(p, e, i) {
    const b = e.bullets[i];
    e.bullets.splice(i, 1);
    const sp = Math.hypot(b.vx, b.vy);
    const depth = 15 + Math.random() * 40;
    b.psyOVx = b.vx; b.psyOVy = b.vy; b.psyOId = e.id;
    b.psyFr = Math.max(0.6, Math.min(0.95, depth / (sp + depth)));
    b.psyPh = Math.random() * Math.PI * 2;
    b.psyCap = 1;
    rfAdopt(b, e, p); // đổi chủ tại chỗ: giữ nguyên loại / hình / cờ, hoán đổi mục tiêu, +1 lần phản
    b.psyOH = b.hook || '';
    b.hook = 'psy_cap';
    if (b.isRocket) { b.psyRocket = true; b.isRocket = false; }
    p.bullets.push(b);
    p.psyCapN = (p.psyCapN || 0) + 1;
    spawnSparkParticles(b.x + (b.w || 6) / 2, b.y + (b.h || 6) / 2, PSY_CYAN, 3);
}

// Viên Đạn Niệm Lực của bản thân
function psySpawnOrb(p, side, held, k) {
    const cx = psyCx(p), cy = psyCy(p), dir = psyDir(p);
    const o = {
        x: cx - 4 + side * 6, y: cy - 4 + dir * 10, w: 8, h: 8,
        vx: side * 3.4, vy: dir * 0.6, dmg: p.damage + (psyE1(p) ? 0.25 : 0),
        hook: 'psychokinesis', psyK: 'orb', psyT: held ? 0 : psyHoverN(p) + (k || 0) * 4, psyPh: Math.random() * 6.28,
    };
    if (held) {
        const a = -Math.PI / 2 * -dir + (side * 0.9);
        o.x = cx - 4 + Math.cos(a) * 46 * (k === 1 ? 1 : 0.8); o.y = cy - 4 + dir * 40 + (k || 0) * dir * 8;
        o.vx = 0; o.vy = 0; o.psyCap = 2; o.psyAx = o.x; o.psyAy = o.y; o.psyOVx = 0; o.psyOVy = 0;
    }
    return spawnBullet(p, o);
}

function psyShoot(p) {
    if (!(p.ammo > 0)) { psyTxt(p, 'HẾT NIỆM LỰC', '#94a3b8', 10); return; }
    p.ammo--; p.psyRl = 0; p.lastShot = Date.now();
    let triple = false;
    if (psyFull(p)) { if ((p.psyShots || 0) >= 4) { triple = true; p.psyShots = 0; } else p.psyShots = (p.psyShots || 0) + 1; }
    p.psySide = -(p.psySide || 1);
    if (triple) { psySpawnOrb(p, p.psySide, false, 0); psySpawnOrb(p, -p.psySide, false, 1); psySpawnOrb(p, p.psySide * 0.3, false, 2); psyTxt(p, 'TAM NIỆM!', PSY_VIO, 11); }
    else psySpawnOrb(p, p.psySide, false, 0);
    p.psyPushFx = 10;
    psySfx('playShoot');
}

// ---------- Vùng Niệm Lực ----------
function psyFieldOn(p) {
    p.psyField = psyDur(p); p.psyFieldMax = p.psyField; p.psyCapN = 0; p.psyLastX = p.x; p.psyLockT = 0;
    if (psyE1(p)) for (let k = 0; k < 3; k++) psySpawnOrb(p, k - 1, true, k);
    if (psyFull(p)) { p.shield = (p.shield || 0) + 1; p.psyShieldOn = true; psyTxt(p, 'KHIÊN TÂM LINH', PSY_VIO, 10); }
    psyTxt(p, 'TẤT CẢ... DỪNG LẠI!', PSY_CYAN, 13);
    explosions.push(new Explosion(psyCx(p), psyCy(p), 60, 'rgba(0, 242, 255,', 0, p));
    triggerScreenShake(3, 8);
    psySfx('playPowerup');
}
function psyFieldEnd(p, lock) {
    p.psyField = 0;
    p.psyCd = psyCdMax(p) + (lock ? 120 : 0); p.psyCdMax = p.psyCd;
    if (p.psyShieldOn) { p.psyShieldOn = false; if ((p.shield || 0) > 0) p.shield--; }
}
function psyFree(p, b, vx, vy) {
    const sp = Math.hypot(vx, vy);
    if (sp < 6) { const k = 6 / (sp || 1); vx *= k; vy *= k; if (!sp) vy = psyDir(p) * 6; }
    b.vx = vx; b.vy = vy; b.psyCap = 0; b.psyRel = 1; b.hitIds = [];
    if (b.psyRocket) { b.isRocket = true; b.psyRocket = false; }
    if (psyE2(p)) { b.dmg = (b.dmg || 0) * 1.35; b.psySlow = 1; }
}
function psyCaptured(p) { return p.bullets.filter(b => b.psyCap > 0); }

// Cách 1: phản hồi ngược quỹ đạo
function psyReflect(p) {
    const e = psyEnemy(p), mult = psyE2(p) ? 1.5 : 1.3;
    const L = psyCaptured(p);
    for (const b of L) {
        let vx = -(b.psyOVx || 0) * mult, vy = -(b.psyOVy || 0) * mult;
        if (!vx && !vy) { const v = aimVelocity(b.x + b.w / 2, b.y + b.h / 2, e, 9 * mult, true); vx = v.vx; vy = v.vy; }
        psyFree(p, b, vx, vy);
    }
    psyFieldEnd(p, false);
    psyShock(p);
    bodyEffects.push(new PsyWave(p.id, psyCx(p), psyCy(p), psyR(p), 0));
    if (L.length) psyTxt(p, 'PHẢN HỒI x' + L.length, PSY_CYAN, 12);
    triggerScreenShake(2 + Math.min(4, L.length * 0.3), 8);
    psySfx('playExplosion');
}
// Cách 2: khoá tâm tất sát
function psyLockOn(p) {
    p.psyLockT = 1; p.psyField = Math.max(1, p.psyField);
    psyCaptured(p).forEach((b, i) => { b.psyCap = 3; b.psyQ = i; });
    psyTxt(p, 'KHOÁ TÂM TẤT SÁT!', PSY_VIO, 13);
    psySfx('playPowerup');
}
function psyLockTick(p) {
    const e = psyEnemy(p), t = ++p.psyLockT, AIM = 22;
    if (t === AIM) { psyShock(p); bodyEffects.push(new PsyWave(p.id, psyCx(p), psyCy(p), psyR(p), 1)); }
    if (t < AIM) return;
    const full = psyFull(p), mult = psyE2(p) ? 1.5 : 1.3;
    let left = 0;
    for (const b of p.bullets) {
        if (b.psyCap !== 3) continue;
        if (full && (t - AIM) < b.psyQ * 4) { left++; continue; }
        const v = aimVelocity(b.x + b.w / 2, b.y + b.h / 2, e, 8.5 * mult, true);
        psyFree(p, b, v.vx, v.vy);
        b.isHoming = true;
        if (full) { b.isPiercing = true; b.psyPierce = 1; }
        spawnSparkParticles(b.x + b.w / 2, b.y + b.h / 2, PSY_VIO, 2);
    }
    if (!left) { p.psyLockT = 0; psyFieldEnd(p, true); triggerScreenShake(4, 10); psySfx('playExplosion'); }
}

// Evo 2: sóng xung kích khi phóng trả — 1.0 st & đẩy lùi nhẹ trong vùng
function psyShock(p) {
    if (!psyE2(p)) return;
    const cx = psyCx(p), cy = psyCy(p), R = psyR(p), e = psyEnemy(p);
    if (e && e.hp > 0 && Math.hypot(psyCx(e) - cx, psyCy(e) - cy) < R + e.w / 2) {
        e.takeDamage(1.0, p);
        e.x = Math.max(0, Math.min(canvas.width - e.w, e.x + Math.sign(psyCx(e) - cx || 1) * 22));
    }
    for (const o of psySummons(p)) {
        if (Math.hypot(o.x + o.w / 2 - cx, o.y + (o.h || 0) / 2 - cy) > R) continue;
        if (typeof o.takeHit === 'function') o.takeHit(1.0, p);
        else if (typeof o.takeDamage === 'function') o.takeDamage(1.0, p);
        else if (typeof o.hp === 'number') { o.hp -= 1.0; if (o.hp <= 0) o.active = false; }
    }
}
function psySummons(p) {
    const L = [];
    const add = a => { if (Array.isArray(a)) for (const o of a) if (o && o.active !== false && typeof o.x === 'number' && o.w && (o.hp === undefined || o.hp > 0)) L.push(o); };
    if (typeof turrets !== 'undefined') add(turrets);
    if (typeof creatorTurrets !== 'undefined') add(creatorTurrets);
    if (typeof creatorDrones !== 'undefined') add(creatorDrones);
    if (typeof creatorRobots !== 'undefined') add(creatorRobots);
    if (typeof necroMinions !== 'undefined') add(necroMinions);
    if (typeof ghostDecoys !== 'undefined') add(ghostDecoys);
    return L.filter(o => o.owner !== p && o.player !== p && o.team !== p.id && !(o.owner && o.owner.id === p.id));
}

// Full Evo: bắt pháo cối / bom rơi vào vùng
function psyCatchBombs(p, cx, cy, R) {
    const e = psyEnemy(p), dir = psyDir(p);
    const mk = (x, y, dmg) => {
        if ((p.psyCapN || 0) >= psyCapMax(p)) return;
        p.psyCapN++;
        spawnBullet(p, { x: x - 6, y: y - 6, w: 12, h: 12, vx: 0, vy: 0, dmg, hook: 'psy_cap', psyOH: '', psyOId: e.id, psyCap: 2,
            psyAx: x - 6, psyAy: y - 6, psyOVx: 0, psyOVy: -dir * 6, psyPh: Math.random() * 6.28, psyBomb: 1, isPiercing: false });
        explosions.push(new Explosion(x, y, 24, 'rgba(0, 242, 255,', 0, p));
    };
    if (typeof mortars !== 'undefined') for (const m of mortars) {
        if (!m || !m.active || m.owner !== e || (m.echoCount || 0) > 0) continue;
        if (Math.hypot(m.x - cx, m.y - cy) > R) continue;
        m.active = false;
        mk(m.x, m.y, ((e.damage || 1) + (e.dmgBuff || 0)) * 1.5);
    }
    for (const o of bodyEffects) {
        if (!o || !o.active || typeof JpBomb === 'undefined' || !(o instanceof JpBomb) || o.team === p.id || !(o.delay > 0)) continue;
        if (Math.hypot(o.x - cx, o.y - cy) > R) continue;
        o.active = false;
        mk(o.x, o.y, o.dmg || 1);
    }
}

// Bắt đạn của MÔI TRƯỜNG: đạn Xe Tấn Công (MvShot) + chùm đạn Thùng Đạn (CrateBurst) -> thành đạn Siêu Năng
function psyCatchEnv(p, cx, cy, R) {
    const mk = (x, y, sz, vx, vy, dmg, env) => {
        const sp = Math.hypot(vx, vy), depth = 15 + Math.random() * 40;
        spawnBullet(p, { x: x - sz / 2, y: y - sz / 2, w: sz, h: sz, vx, vy, dmg, hook: 'psy_cap', psyOH: '', psyOId: 0, psyCap: 1,
            psyOVx: vx, psyOVy: vy, psyFr: Math.max(0.6, Math.min(0.95, depth / (sp + depth))), psyPh: Math.random() * 6.28, psyEnv: env, isPiercing: false });
        p.psyCapN = (p.psyCapN || 0) + 1;
        spawnSparkParticles(x, y, PSY_CYAN, 3);
    };
    for (const o of bodyEffects) {
        if (!o || !o.active) continue;
        if (typeof MvShot !== 'undefined' && o instanceof MvShot) {
            if ((p.psyCapN || 0) >= psyCapMax(p) || Math.hypot(o.x - cx, o.y - cy) > R) continue;
            o.active = false;
            mk(o.x, o.y, Math.max(6, o.r * 2), o.vx, o.vy, o.dmg || 0.5, o.kind === 'shell' ? 'shell' : 'smg');
        } else if (typeof CrateBurst !== 'undefined' && o instanceof CrateBurst && o.pellets) {
            if (o.onlyEnemy && o.breakerId === p.id) continue; // chùm đạn phe mình -> để bay tiếp
            for (const b of o.pellets) {
                if (!b.on || (p.psyCapN || 0) >= psyCapMax(p) || Math.hypot(b.x - cx, b.y - cy) > R) continue;
                b.on = false;
                mk(b.x, b.y, 6, b.vx, b.vy, o.dmg || 0.75, 'pellet');
            }
        }
    }
}

// Bắt ĐẠN DẠNG THỰC THỂ của địch (bodyEffects): Trọng/Nguyệt Luân, Huyết Cầu, Phi Tiêu Nguyệt, Liềm Xích, Cánh Hoa...
// -> thực thể biến mất, sinh 1 viên đạn bắt giữ (psy_cap) cùng sát thương nằm lơ lửng trong vùng.
function psyEntInfo(o, team) {
    const own = o.owner && typeof o.owner.id === 'number' ? o.owner.id : o.team;
    if (own === team || (own !== 1 && own !== 2)) return null;
    const ow = own === 1 ? p1 : p2;
    if (typeof BmStraight !== 'undefined' && o instanceof BmStraight) {
        if (o.st === 'spin') return null;
        return { r: 10, vx: 0, vy: (o.st === 'out' ? o.dir * 9 : -o.dir * 8), dmg: (ow.damage || 1) * 0.75, fx: { psySlow: 1 }, lost: () => o.end(ow, 'miss') };
    }
    if (typeof BmCurve !== 'undefined' && o instanceof BmCurve) return { r: 9, vx: 0, vy: (team === 1 ? 6 : -6), dmg: (ow.damage || 1) * 0.75, fx: { psySlow: 1 }, lost: () => o.finish(ow, 'miss') };
    if (typeof BdOrb !== 'undefined' && o instanceof BdOrb) return { r: Math.min(10, o.r || 8), vx: 0, vy: o.vy || 0, dmg: o.dmg || 1, fx: { psyExD: o.exDmg || 0, psyExR: o.exR || 40, psyExC: 'rgba(255, 31, 75,' } };
    if (typeof TsBigStar !== 'undefined' && o instanceof TsBigStar) return { r: Math.min(10, o.r || 8), vx: o.vx || 0, vy: o.vy || 0, dmg: o.dmg || 1, fx: { psyExD: (o.dmg || 1) * 0.75, psyExR: 40 + (o.r || 8) * 1.5, psyExC: 'rgba(34, 211, 238,' } };
    if (typeof KgSickle !== 'undefined' && o instanceof KgSickle) {
        if (o.mode !== 'out') return null;
        return { r: 8, vx: o.vx || 0, vy: o.vy || 0, dmg: o.dmg || 1, fx: { psyBleed: 1 },
            lost: () => { if (typeof kgMine === 'function' && typeof KG_CDS !== 'undefined' && ow.kgCds && kgMine(ow, KgSickle).length === 0) ow.kgCds[0] = KG_CDS[0]; } };
    }
    if (typeof FsPetal !== 'undefined' && o instanceof FsPetal) { if (o.state !== 'fly') return null; return { r: 6, vx: o.vx || 0, vy: o.vy || 0, dmg: o.dmg || 0.5 }; }
    return null;
}
function psyCatchEnts(p, cx, cy, R) {
    if (typeof bodyEffects === 'undefined') return;
    const e = psyEnemy(p);
    for (const o of bodyEffects) {
        if (!o || !o.active || typeof o.x !== 'number' || (p.psyCapN || 0) >= psyCapMax(p)) continue;
        if (Math.hypot(o.x - cx, o.y - cy) > R) continue;
        const I = psyEntInfo(o, p.id);
        if (!I) continue;
        o.active = false;
        try { if (I.lost) I.lost(); } catch (err) { }
        const sp = Math.hypot(I.vx, I.vy) || 6, depth = 15 + Math.random() * 40, sz = I.r * 2;
        spawnBullet(p, Object.assign({ x: o.x - sz / 2, y: o.y - sz / 2, w: sz, h: sz, vx: I.vx, vy: I.vy || 0.01, dmg: I.dmg, hook: 'psy_cap', psyOH: '', psyOId: e ? e.id : 0,
            psyCap: 1, psyOVx: I.vx, psyOVy: I.vy || -psyDir(p) * 6, psyFr: Math.max(0.6, Math.min(0.95, depth / (sp + depth))), psyPh: Math.random() * 6.28, psyEnv: 'ent', isPiercing: false,
            psyEntK: o.constructor && o.constructor.name, psyEnt: rfEntSnap(o), rfId: e ? e.id : 0, reflects: 1 }, I.fx || {}));
        p.psyCapN = (p.psyCapN || 0) + 1;
        spawnSparkParticles(o.x, o.y, PSY_CYAN, 5);
    }
}

// ---------- Evo 2: chặn HITSCAN / LAZER tại rìa vùng ----------
// Mất 1.0s thời gian vùng / 1.0 dame chặn; về 0 -> vùng đỡ trọn đòn đó rồi VỠ. Tia bị chặn ngưng tụ thành 1 Đạn Năng Lượng.
let psyHsDepth = 0, psyBeamHot = 0;
function psyHsWrap(K) {
    if (!K || !K.prototype || !K.prototype.update || K.prototype.update.__psy) return;
    const o = K.prototype.update;
    K.prototype.update = function () { psyHsDepth++; try { return o.apply(this, arguments); } finally { psyHsDepth--; } };
    K.prototype.update.__psy = true;
}
function psyInstallHs() {
    psyHsWrap(typeof HitscanWarning !== 'undefined' ? HitscanWarning : null);
    psyHsWrap(typeof HitscanTelegraph !== 'undefined' ? HitscanTelegraph : null);
    psyHsWrap(typeof DjBeam !== 'undefined' ? DjBeam : null);
    psyHsWrap(typeof BdLaser !== 'undefined' ? BdLaser : null);
    if (typeof Beam === 'function' && !Beam.prototype.update.__psy) {
        const o = Beam.prototype.update;
        Beam.prototype.update = function () { const r = o.apply(this, arguments); if (this.active && this.isEvo && this.lifeTime % 12 === 0) psyBeamHot = this.ownerId; return r; };
        Beam.prototype.update.__psy = true;
    }
    if (Player.prototype.fireAnhMinhHitscan && !Player.prototype.fireAnhMinhHitscan.__psy) {
        const o = Player.prototype.fireAnhMinhHitscan;
        Player.prototype.fireAnhMinhHitscan = function () { psyHsDepth++; try { return o.apply(this, arguments); } finally { psyHsDepth--; } };
        Player.prototype.fireAnhMinhHitscan.__psy = true;
    }
}
function psyHsBlock(p, amount, fromX, fromY) {
    const cx = psyCx(p), cy = psyCy(p), R = psyR(p), e = psyEnemy(p);
    const fx = fromX === undefined ? (e ? psyCx(e) : cx) : fromX, fy = fromY === undefined ? (e ? psyCy(e) : cy + psyDir(p) * 100) : fromY;
    const a = Math.atan2(fy - cy, fx - cx);
    const ex = cx + Math.cos(a) * R * 0.8, ey = cy + Math.sin(a) * R * 0.8;
    p.psyField -= amount * 60;
    p.psyHsFx = 14; p.psyHsX = ex; p.psyHsY = ey;
    let orb = null;
    for (const b of p.bullets) if (b.psyHs && b.psyCap > 0 && b.dmg < 3) { orb = b; break; }
    if (orb) orb.dmg = Math.min(3, orb.dmg + amount);
    else spawnBullet(p, { x: ex - 6, y: ey - 6, w: 12, h: 12, vx: 0, vy: 0, dmg: Math.min(3, amount), hook: 'psy_cap', psyOH: '', psyOId: 0, psyCap: 2, psyHs: 1,
        psyAx: ex - 6, psyAy: ey - 6, psyOVx: 0, psyOVy: -psyDir(p) * 7, psyPh: Math.random() * 6.28, isPiercing: false });
    spawnSparkParticles(ex, ey, PSY_VIO, 6);
    if (!(p.psyHsTxtT > 0)) { addFloatingText(ex, ey - 10, 'CHẶN TIA! -' + amount.toFixed(1) + 's', PSY_VIO, 11); p.psyHsTxtT = 30; }
    if (p.psyField <= 0) {
        p.psyField = 0;
        addFloatingText(cx, cy - 40, 'VÙNG VỠ!', '#f472b6', 14);
        explosions.push(new Explosion(cx, cy, R * 0.6, 'rgba(167, 139, 250,', 0, p));
        triggerScreenShake(6, 10);
        psyReflect(p);
    }
}

// ---------- Phản chấn cận chiến (lao mặt đất chạm vùng) ----------
function psyHomeY(e) { return e.id === 1 ? canvas.height - e.h - 22 : 20; }
function psyIsSky(e) { return !!(e.thunderSky || e.tzFly || e.fsMode === 'thien' || e.fsHidden); }
function psyDashFlag(e) {
    return e.dashState === 1 || e.isDashing || e.isShortgunDashing || e.stormDashState === 1 || e.isPolarDashing
        || e.kazMode === 'dash' || e.tatMode === 'dash' || e.tsPhase > 0 || e.isCharging || e.groundLunge;
}
function psyMeleeCounter(p, e, cx, cy, R) {
    if (!e || !(e.hp > 0) || psyIsSky(e) || e.psyPinT > 0) { if (e) e.psyPY = e.y; return; }
    const d = psyDir(e), home = psyHomeY(e), off = (e.y - home) * d, mv = (e.y - (typeof e.psyPY === 'number' ? e.psyPY : e.y)) * d;
    e.psyPY = e.y;
    if (off < 20 || !(mv > 1.5 || psyDashFlag(e))) return;
    const nx = Math.max(e.x, Math.min(e.x + e.w, cx)), ny = Math.max(e.y, Math.min(e.y + e.h, cy));
    if (Math.hypot(nx - cx, ny - cy) > R) return;
    // chặn tại rìa vùng -> hất về làn cũ
    const hx = e.x + e.w / 2, hy = ny;
    explosions.push(new Explosion(hx, hy, 46, 'rgba(0, 242, 255,', 0, p));
    spawnSparkParticles(hx, hy, PSY_CYAN, 16);
    if (e.dashState === 1 || e.dashState === 2) { e.dashState = 0; e.tankDashCooldown = Math.max(e.tankDashCooldown || 0, 120); if (typeof e.dashStartY === 'number') e.dashStartY = home; }
    if (e.isShortgunDashing) { e.isShortgunDashing = false; e.shortgunDashState = 0; }
    if (e.stormDashState) e.stormDashState = 0;
    if (e.isPolarDashing) e.isPolarDashing = false;
    e.y = home; e.psyPY = home; e.psyPinT = 75;
    e.takeDamage(1.0, p);
    if (e.weapon !== 'juggernaut' && e.hp > 0) e.freezeTimer = Math.max(e.freezeTimer || 0, 75);
    addFloatingText(hx, hy + d * 20, 'PHẢN CHẤN!', PSY_CYAN, 14);
    triggerScreenShake(6, 10);
    psySfx('playShieldBreak');
}

function psyFieldTick(p) {
    const e = psyEnemy(p), cx = psyCx(p), cy = psyCy(p), R = psyR(p), full = psyFull(p);
    const dx = p.x - (typeof p.psyLastX === 'number' ? p.psyLastX : p.x);
    p.psyLastX = p.x;
    const W = canvas.width;
    // giữ / thắng phanh đạn đã bắt
    for (const b of p.bullets) {
        if (!(b.psyCap > 0)) continue;
        if (b.psyCap === 1) {
            b.vx *= b.psyFr; b.vy *= b.psyFr;
            if (Math.hypot(b.vx, b.vy) < 0.15) { b.vx = 0; b.vy = 0; b.psyCap = 2; b.psyAx = b.x; b.psyAy = b.y; }
            continue;
        }
        b.vx = 0; b.vy = 0;
        b.psyAx = Math.max(3, Math.min(W - (b.w || 6) - 3, (b.psyAx === undefined ? b.x : b.psyAx) + dx * 0.6));
        if (b.psyAy === undefined) b.psyAy = b.y;
        const ph = (p.psyTk || 0) * 0.1 + (b.psyPh || 0);
        b.x = b.psyAx + Math.cos(ph * 0.7) * 0.8;
        b.y = b.psyAy + Math.sin(ph) * 1.5;
    }
    if (p.psyLockT > 0) return;
    // bắt đạn mới
    if (e && e.bullets) for (let i = e.bullets.length - 1; i >= 0; i--) {
        const b = e.bullets[i];
        if (!b) continue;
        const bx = b.x + (b.w || 6) / 2, by = b.y + (b.h || 6) / 2;
        if (Math.hypot(bx - cx, by - cy) > R) continue;
        if (psyLaserLike(b)) {
            if (psyE2(p)) { e.bullets.splice(i, 1); psyHsBlock(p, b.dmg || 1, bx, by); if (!(p.psyField > 0)) return; }
            continue;
        }
        if ((p.psyCapN || 0) >= psyCapMax(p) || !psyCanCatch(b)) continue;
        psyCatch(p, e, i);
    }
    psyCatchEnv(p, cx, cy, R);
    psyCatchEnts(p, cx, cy, R);
    psyCatchBombs(p, cx, cy, R);
    psyMeleeCounter(p, e, cx, cy, R);
    if (psyE2(p) && e && e.hp > 0 && Math.hypot(psyCx(e) - cx, psyCy(e) - cy) < R + e.w / 2) addStatusSlow(e, 0.6);
    if (--p.psyField <= 0) psyReflect(p);
}

// ---------- Tick (chạy cả khi bị choáng) ----------
function psyTick(p) {
    if (gameState.phase !== 'playing') return;
    p.psyTk = (p.psyTk || 0) + 1;
    psyInstallHs(); psyBeamHot = 0;
    if (p.psyHsFx > 0) p.psyHsFx--;
    if (p.psyHsTxtT > 0) p.psyHsTxtT--;
    if (p.psyCd > 0) p.psyCd--;
    if (p.psyPushFx > 0) p.psyPushFx--;
    if (p.ammo < p.maxAmmo) { if (++p.psyRl >= PSY_RELOAD) { p.ammo++; p.psyRl = 0; } } else p.psyRl = 0;
    const e = psyEnemy(p), dir = psyDir(p), W = canvas.width;
    // Đạn Niệm Lực lơ lửng -> phóng
    for (let i = p.bullets.length - 1; i >= 0; i--) {
        const b = p.bullets[i];
        if (b.psyKill) { p.bullets.splice(i, 1); continue; }
        if (b.psyK !== 'orb' || !(b.psyT > 0) || b.psyCap) continue;
        b.vx *= 0.86; b.vy *= 0.86;
        if (b.x < 2) { b.x = 2; b.vx = 0; } if (b.x > W - b.w - 2) { b.x = W - b.w - 2; b.vx = 0; }
        let a = dir < 0 ? -Math.PI / 2 : Math.PI / 2;
        if (psyE1(p) && e && e.hp > 0) a = aimVelocity(b.x + b.w / 2, b.y + b.h / 2, e, 12, true).angle;
        b.psyAim = a;
        if (--b.psyT <= 0) {
            b.vx = Math.cos(a) * 12; b.vy = Math.sin(a) * 12; b.psyGo = 1;
            spawnSparkParticles(b.x + b.w / 2, b.y + b.h / 2, PSY_CYAN, 3);
        }
    }
    if (p.psyField > 0 || p.psyLockT > 0) psyFieldTick(p);
    if (p.psyLockT > 0) psyLockTick(p);
    // làm chậm 30% (Evo 2) trên địch
    if (e && e.psySlowT > 0) { e.psySlowT--; if (e.hp > 0) addStatusSlow(e, 0.7); }
}

// ---------- Entity: sóng giải phóng (hình ảnh) ----------
class PsyWave {
    constructor(team, x, y, r, kind) { this.team = team; this.x = x; this.y = y; this.r = r; this.kind = kind; this.t = 0; this.dur = 24; this.active = true; }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof psyDrawWave === 'function') psyDrawWave(this); }
}
// ---------- Kết liễu TÂM NIỆM NGHIỀN NÁT ----------
class PsyFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.ox = psyCx(owner); this.oy = psyCy(owner);
        this.x = psyCx(victim); this.y = psyCy(victim); this.vw = victim.w; this.vh = victim.h;
        this.t = 0; this.dur = 150; this.active = true;
    }
    update() {
        this.t++;
        if (this.t === 10 || this.t === 60) triggerScreenShake(4, 20);
        if (this.t === 92) {
            triggerScreenShake(15, 14);
            explosions.push(new Explosion(this.x, this.y - 40, 80, 'rgba(0, 242, 255,', 0, this.team === 1 ? p1 : p2));
            spawnSparkParticles(this.x, this.y - 40, PSY_CYAN, 40);
            spawnSparkParticles(this.x, this.y - 40, '#e2e8f0', 30);
            psySfx('playExplosion');
        }
        if (this.t >= this.dur) this.active = false;
    }
    draw() { }
    drawOver() { if (typeof psyDrawFinisherOver === 'function') psyDrawFinisherOver(this); }
}

// ---------- Bullet hooks ----------
BulletHooks.register('psychokinesis', {
    hit(b, o, v) { if (v) spawnSparkParticles(b.x + b.w / 2, b.y + b.h / 2, PSY_CYAN, 5); },
    draw(b) { if (typeof psyDrawOrb === 'function') psyDrawOrb(b); },
});
// Đạn bắt giữ: uỷ quyền cho hook gốc (bọc try/catch vì hook gốc có thể giả định chủ cũ) + hiệu ứng Siêu Năng
function psyDelegate(b, name, args) {
    const h = b.psyOH && BulletHooks.registry[b.psyOH];
    if (!h || !h[name]) return undefined;
    const hk = b.hook; b.hook = b.psyOH;
    try { return h[name](b, ...args); } catch (err) { return undefined; } finally { b.hook = hk; }
}
function psyPierceHit(b) { if (b.psyPierce !== undefined && ++b.psyPH > b.psyPierce) b.psyKill = 1; }
BulletHooks.register('psy_cap', {
    hit(b, o, v, d) {
        const r = psyDelegate(b, 'hit', [o, v, d]);
        if (v && b.psySlow) v.psySlowT = 90;
        if (b.psyBomb) explosions.push(new Explosion(b.x + b.w / 2, b.y + b.h / 2, 40, 'rgba(0, 242, 255,', 0, o));
        // hiệu ứng trúng đích gốc của thực thể bị bắt (Huyết Cầu / Sao nổ, Liềm Xích gây chảy máu)
        if (v && b.psyExD > 0) { explosions.push(new Explosion(b.x + b.w / 2, b.y + b.h / 2, b.psyExR || 40, b.psyExC || 'rgba(0, 242, 255,', b.psyExD, o)); b.psyExD = 0; }
        if (v && b.psyBleed && (v === p1 || v === p2)) { v.bleedTimer = Math.max(v.bleedTimer || 0, 90); v.bleedDmg = Math.max(v.bleedDmg || 0, 0.08); }
        if (v) spawnSparkParticles(b.x + b.w / 2, b.y + b.h / 2, PSY_CYAN, 5);
        b.psyPH = b.psyPH || 0; psyPierceHit(b);
        return r;
    },
    edge(b, o) { return psyDelegate(b, 'edge', [o]); },
    obstacle(b, o, obj, kind) { const r = psyDelegate(b, 'obstacle', [o, obj, kind]); b.psyPH = b.psyPH || 0; psyPierceHit(b); return r; },
    truckDmgMult(b, o, t) { return psyDelegate(b, 'truckDmgMult', [o, t]); },
    draw(b) { if (typeof psyDrawCap === 'function') psyDrawCap(b); },
});

CharHooks.register('psychokinesis', {
    setup() {
        this.reloadTime = 1e9; // tự nạp 1.2s/viên trong psyTick
        this.psyRl = 0; this.psyHold = 0; this.psyPrevS = false; this.psyUsed = false;
        this.psyField = 0; this.psyFieldMax = 1; this.psyCd = 0; this.psyCdMax = 1; this.psyCapN = 0; this.psyLockT = 0;
        this.psyShots = 0; this.psySide = 1; this.psyPushFx = 0; this.psyShieldOn = false; this.psyTk = 0;
    },
    speed(s) { return (this.psyField > 0 || this.psyLockT > 0) && !psyE2(this) ? s * 0.8 : s; },
    shoot(inp) {
        const s = !!inp.s, pressed = s && !this.psyPrevS, released = !s && this.psyPrevS;
        this.psyPrevS = s;
        if (this.psyLockT > 0) { this.psyHold = 0; this.psyUsed = true; return true; }
        if (pressed) { this.psyHold = 0; this.psyUsed = false; }
        if (s) {
            this.psyHold++;
            if (!this.psyUsed) {
                if (this.psyField > 0) { if (this.psyHold >= psyLockN(this)) { this.psyUsed = true; psyLockOn(this); } }
                else if (this.psyHold >= PSY_HOLD && this.psyCd <= 0) { this.psyUsed = true; psyFieldOn(this); }
            }
        } else if (released) {
            if (!this.psyUsed) {
                if (this.psyField > 0) psyReflect(this);
                else if (this.psyHold < PSY_HOLD) psyShoot(this);
                else psyTxt(this, 'VÙNG HỒI ' + Math.ceil(this.psyCd / 60) + 's', '#94a3b8', 10);
            }
            this.psyHold = 0;
        }
        return true;
    },
    roundEnd() { this.psyField = 0; this.psyLockT = 0; this.psyShieldOn = false; },
});

// ---------- Bọc update: tick luôn chạy ----------
(function () {
    const origU = Player.prototype.update;
    Player.prototype.update = function () {
        if (psyIs(this)) { try { psyTick(this); } catch (err) { console.error(err); } }
        const r = origU.apply(this, arguments);
        // bị Phản Chấn: ghim về làn cũ
        if (this.psyPinT > 0) { this.psyPinT--; this.y = psyHomeY(this); }
        return r;
    };
})();

// ---------- Bọc takeDamage: Full bẻ cong tia lazer (-50%), kết liễu ----------
const PSY_BEAM_BODIES = ['lazer_beam', 'lazer_charge', 'lazer_auto', 'water_gun'];
(function () {
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        // Evo 2: đòn hitscan / tia lazer của địch -> chặn tại rìa vùng (đổi thời gian vùng)
        if (psyIs(this) && psyE2(this) && this.psyField > 0 && !(this.psyLockT > 0) && this.hp > 0 && attacker && attacker !== this && attacker.id !== this.id
            && typeof amount === 'number' && amount > 0 && gameState.phase === 'playing'
            && (psyHsDepth > 0 || psyBeamHot === attacker.id || PSY_BEAM_BODIES.includes(attacker.weapon))) {
            if (psyBeamHot === attacker.id) psyBeamHot = 0;
            psyHsBlock(this, amount);
            return 0;
        }
        const before = this.hp;
        const r = origTD.call(this, amount, attacker, options, ...Array.prototype.slice.call(arguments, 3));
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && psyIs(attacker)
            && typeof bodyEffects !== 'undefined' && !bodyEffects.some(f => f instanceof PsyFinisher)) {
            bodyEffects.push(new PsyFinisher(attacker, this));
        }
        return r;
    };
})();

// Bot: số đạn địch đang lao tới trong tầm
function psyIncoming(bot) {
    const e = psyEnemy(bot); if (!e || !e.bullets) return 0;
    const cx = psyCx(bot), cy = psyCy(bot); let n = 0;
    for (const b of e.bullets) {
        if (!psyCanCatch(b)) continue;
        const by = b.y + (b.h || 6) / 2;
        if (Math.abs(by - cy) < 300 && Math.abs(b.x - cx) < 160 && (cy - by) * b.vy > 0) n++;
    }
    return n;
}
// Bot: 'field' (giữ mở vùng), 'reflect' (nhấp), 'lock' (giữ), null
function psyBotAction(bot) {
    if (bot.psyLockT > 0) return null;
    if (bot.psyField > 0) {
        const n = psyCaptured(bot).length, left = bot.psyField;
        if (n >= Math.min(8, psyCapMax(bot)) || (left < 50 && n > 0) || (n >= 3 && psyIncoming(bot) === 0 && left < bot.psyFieldMax - 90)) return Math.random() < 0.4 ? 'lock' : 'reflect';
        return null;
    }
    if ((bot.psyCd || 0) <= 0 && psyIncoming(bot) >= 3) return 'field';
    return null;
}
