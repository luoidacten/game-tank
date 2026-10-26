// ==========================================
// Móc Thép (steel_hook) — Logic: móc lắc kiểu "Đào Vàng", xích nảy tường,
// Giai đoạn 2: Đu Dây Đột Kích (tự lao theo xích) / Lôi Xích Hành Hình (kéo địch về)
// ------------------------------------------
// Toàn bộ trạng thái nằm trên player dưới dạng object/mảng thuần (đồng bộ online được):
//   shPhase: 'ready' | 'aim' | 'fly' | 'hold' | 'zip' | 'zipBack' | 'drag' | 'dragBack' | 'retract' | 'cool'
//   shHooks: [{ sid, pts:[{x,y}], x, y, vx, vy, b (lượt nảy còn lại), len, cap, hp, maxHp, st, truckId, hits:[] }]
//     st: 'fly' | 'stuck' | 'enemy' | 'truck'
// ==========================================

const SH_SWING_MAX = 70 * Math.PI / 180;   // lắc -70°..+70°
const SH_SWING_SPEED = 0.035;              // rad/tick cho pha lắc
const SH_TIER_TICKS = 24;                  // mỗi mốc tụ lực
const SH_COOLDOWN = 45;                    // nghỉ sau mỗi lượt móc
const SH_HOLD_TIMEOUT = 240;               // không bấm giai đoạn 2 -> thu xích
const SH_TRUCK_IDLE = 150;                 // ngoạm xe tiền mà không spam -> nhả
const SH_SIDE_ANGLE = 0.42;                // Full Evo: 2 móc lệch ±24°
const SH_AUTO_PERIOD = 420;                // Evo 2: móc phụ tự động mỗi 7s
const SH_FLY_SLOW = 75;                    // nhấp nhanh: móc đi hết đường xích trong 1.25s
const SH_FLY_FAST = 30;                    // tụ lực tối đa: chỉ 0.5s
const SH_BREAK_TICKS = 45;                 // móc đã neo: giữ Bắn 0.75s -> tự cắt xích
const SH_SIDE_HP = 0.25;                   // Full Evo: 2 móc phụ chỉ có 25% máu tối đa (dễ bắn đứt)
const SH_AIM_DELAY = 20;                   // tụ lực (≥1 mốc): khoá hướng + cảnh báo đỏ 0.33s rồi mới phóng

function shIsFull(p) { return hasFullEvo(p, 'steel_hook'); } // cần thêm thẻ FULL EVO (FULL_EVO_GATE)
function shMaxBounces(p) { return shIsFull(p) ? 17 : (p.hasUpgrade('evo_hook_1') ? 15 : 9); }
function shBouncesForTier(p, tier) { return Math.floor(1 + tier * (shMaxBounces(p) - 1) / 4); }
// Thời gian bay hết đường xích theo lực tụ (giữ càng lâu càng nhanh)
function shFlyTicks(charge) {
    const k = Math.max(0, Math.min(1, (charge || 0) / (SH_TIER_TICKS * 4)));
    return Math.round(SH_FLY_SLOW + (SH_FLY_FAST - SH_FLY_SLOW) * k);
}
// Ước lượng chiều dài đường xích (chỉ tính nảy tường + giới hạn chiều dài, giống shFlyStep)
function shPlanLen(p, x, y, dx, dy, bounces, cap) {
    const W = canvas.width, H = canvas.height, r = shHeadR(p);
    let len = 0, b = bounces;
    while (len < cap) {
        x += dx * 4; y += dy * 4; len += 4;
        let hit = false;
        if (x < r) { x = r; dx = Math.abs(dx); hit = true; } else if (x > W - r) { x = W - r; dx = -Math.abs(dx); hit = true; }
        if (y < r) { y = r; dy = Math.abs(dy); hit = true; } else if (y > H - r) { y = H - r; dy = -Math.abs(dy); hit = true; }
        if (hit && b-- <= 0) break;
    }
    return Math.min(len, cap);
}
function shHeadR(p) { return p.hasUpgrade('evo_hook_2') ? 10.5 : 7; }
function shLaneY(p) { return p.id === 1 ? canvas.height - p.h - 22 : 20; }
function shFwd(p) { return p.id === 1 ? -1 : 1; }
function shNose(p) { return { x: p.x + p.w / 2, y: p.id === 1 ? p.y - 3 : p.y + p.h + 3 }; }
function shDir(p, ang) { return { x: Math.sin(ang), y: shFwd(p) * Math.cos(ang) }; }
function shAngle(p) { return SH_SWING_MAX * Math.sin(p.shSwing || 0); }
function shEnemy(p) { return p === p1 ? p2 : p1; }

// ---------- Hình học đường xích ----------
function shPath(h) { return h.pts.concat([{ x: h.x, y: h.y }]); }
function shPathLen(path) { let L = 0; for (let i = 1; i < path.length; i++) L += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y); return L; }
function shPointAt(path, s) {
    if (s <= 0) return { x: path[0].x, y: path[0].y, i: 0 };
    for (let i = 1; i < path.length; i++) {
        const a = path[i - 1], b = path[i];
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        if (s <= d) { const k = d > 0 ? s / d : 0; return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, i }; }
        s -= d;
    }
    const e = path[path.length - 1];
    return { x: e.x, y: e.y, i: path.length - 1 };
}
// Cắt đoạn đường [s0, s1]
function shSubPath(path, s0, s1) {
    const a = shPointAt(path, s0), b = shPointAt(path, s1);
    const out = [{ x: a.x, y: a.y }];
    for (let i = Math.max(a.i, 1); i < b.i; i++) out.push({ x: path[i].x, y: path[i].y });
    out.push({ x: b.x, y: b.y });
    return out;
}
function shCircleRect(cx, cy, r, o) {
    const nx = Math.max(o.x, Math.min(cx, o.x + o.w)), ny = Math.max(o.y, Math.min(cy, o.y + o.h));
    return (cx - nx) * (cx - nx) + (cy - ny) * (cy - ny) <= r * r;
}

// Vật triệu hồi / công trình (không phải của mình)
function shStructs(p) {
    const out = [];
    const add = (o) => { if (o && o.active !== false && o.owner !== p && typeof o.x === 'number' && o.w) out.push(o); };
    [turrets, creatorTurrets, creatorDrones, creatorRobots, necroMinions, sniperWalls, bastions, ghostDecoys].forEach(l => (l || []).forEach(add));
    bodyEffects.forEach(e => { if (e.isStone) add(e); });
    return out;
}
// Gây sát thương lên vật thể (không phải xe)
function shHurtObj(o, d, p) {
    if (!o || o.isImmortal) return;
    if (typeof o.takeDamage === 'function') { o.takeDamage(d, p); return; }
    if (typeof o.hp === 'number') {
        o.hp -= d;
        // Ụ súng / tường sniper tự xử lý khi hết máu trong update()
        if (o.hp <= 0 && !(o instanceof Turret) && !(o instanceof SniperWall)) {
            o.active = false;
            explosions.push(new Explosion(o.x + o.w / 2, o.y + o.h / 2, 36, 'rgba(180,200,220,', 0, p));
        }
    } else o.active = false; // vật không có máu (phân thân Ghost...) -> vỡ luôn
}
function shBreakCrate(c, p) {
    if (!c.active) return;
    c.active = false;
    crateOnBreak(c, p);
    grantCrateLoot(c, p);
    spawnSparkParticles(c.x + c.w / 2, c.y + c.h / 2, '#ffd27a', 8);
}
function shGiveMoney(p, m, x, y) {
    if (p.id === 1) gameState.p1Coins += m; else gameState.p2Coins += m;
    addFloatingText(x, y, `+${m}$ 💰`, '#ffd700', 14);
    if (soundSystem && !soundSystem.muted && soundSystem.playCoin) soundSystem.playCoin();
}
function shHurtTruck(t, d, p) {
    if (!t.active) return;
    t.hp -= d;
    if (t.hp <= 0) {
        t.active = false;
        shGiveMoney(p, 30, t.x + t.w / 2, t.y - 8);
        explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 60, 'rgba(255,215,0,', 0, p));
    }
}
function shMarked(o, key, sid) { return o[key] === sid; }
function shMark(o, key, sid) { o[key] = sid; }

// ---------- Xe tiền bị ghim ----------
function shTruckById(id) { return moneyTrucks.find(t => t.id === id && t.active); }
function shPinTruck(p, t) {
    if (t.shPinBy) return;
    t.shPinBy = p.id; t.shSpeed = t.speed; t.speed = 0;
    if (!p.shPinned.includes(t.id)) p.shPinned.push(t.id);
}
function shUnpinAll(p) {
    (p.shPinned || []).forEach(id => {
        const t = moneyTrucks.find(x => x.id === id);
        if (t && t.shPinBy === p.id) { t.speed = (typeof t.shSpeed === 'number') ? t.shSpeed : 1.25; t.shPinBy = 0; }
    });
    p.shPinned = [];
}

// ---------- Phóng móc ----------
function shLaunch(p, tier, charge) {
    const n = shNose(p);
    const bounces = shBouncesForTier(p, tier);
    const base = shAngle(p);
    const angs = shIsFull(p) ? [base, base - SH_SIDE_ANGLE, base + SH_SIDE_ANGLE] : [base];
    const ticks = shFlyTicks(charge);
    const cap = 600 + 220 * bounces;
    p.shHooks = angs.map((a, i) => {
        a = Math.max(-1.4, Math.min(1.4, a));
        const d = shDir(p, a);
        // Tốc độ = chiều dài cả đường xích / thời gian mong muốn -> mọi móc tới đích cùng lúc
        const spd = Math.max(3, shPlanLen(p, n.x, n.y, d.x, d.y, bounces, cap) / ticks);
        const hp = i === 0 ? p.maxHp * (shIsFull(p) ? 1 : 0.5) : p.maxHp * SH_SIDE_HP;
        return {
            sid: ++p.shSerial, pts: [{ x: n.x, y: n.y }], x: n.x, y: n.y, vx: d.x * spd, vy: d.y * spd,
            b: bounces, len: 0, cap, hp, maxHp: hp, st: 'fly', truckId: '', main: i === 0, flash: 0,
        };
    });
    p.shPhase = 'fly';
    p.shLaunchBounces = bounces;
    addFloatingText(n.x, n.y + shFwd(p) * 14, `XÍCH THÉP ×${bounces}`, '#bfe6ff', 12);
    if (soundSystem && !soundSystem.muted) soundSystem.playDash();
}

// Nảy: còn lượt -> trừ lượt & thêm chốt; hết lượt -> cắm lại
function shBounce(p, h, color) {
    spawnSparkParticles(h.x, h.y, color || '#ffe9a8', 7);
    if (h.b > 0) {
        h.b--;
        h.pts.push({ x: h.x, y: h.y });
        h.flash = 6;
        return true;
    }
    h.st = 'stuck';
    explosions.push(new Explosion(h.x, h.y, 18, 'rgba(200,230,255,', 0, p));
    return false;
}

function shFlyStep(p, h) {
    const W = canvas.width, H = canvas.height;
    const r = shHeadR(p);
    const enemy = shEnemy(p);
    const spd = Math.hypot(h.vx, h.vy);
    const steps = Math.max(1, Math.ceil(spd / 5));
    const structs = shStructs(p);
    for (let k = 0; k < steps && h.st === 'fly'; k++) {
        const px = h.x, py = h.y;
        h.x += h.vx / steps; h.y += h.vy / steps;
        h.len += spd / steps;
        // Tường sân: trái/phải/trên/dưới
        if (h.x < r) { h.x = r; h.vx = Math.abs(h.vx); if (!shBounce(p, h)) break; }
        else if (h.x > W - r) { h.x = W - r; h.vx = -Math.abs(h.vx); if (!shBounce(p, h)) break; }
        if (h.y < r) { h.y = r; h.vy = Math.abs(h.vy); if (!shBounce(p, h)) break; }
        else if (h.y > H - r) { h.y = H - r; h.vy = -Math.abs(h.vy); if (!shBounce(p, h)) break; }
        // Kẻ địch: ghim & choáng
        if (enemy && enemy.hp > 0 && shCircleRect(h.x, h.y, r, enemy)) {
            const d = enemy.takeDamage(0.5, p);
            if (d > 0) {
                h.st = 'enemy';
                h.x = Math.max(enemy.x, Math.min(h.x, enemy.x + enemy.w));
                h.y = Math.max(enemy.y, Math.min(h.y, enemy.y + enemy.h));
                enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, 3);
                addFloatingText(enemy.x + enemy.w / 2, enemy.y - 18, 'Bắt được rồi nhé! ⛓', '#9fe0ff', 15);
                triggerScreenShake(5, 8);
                if (soundSystem && !soundSystem.muted) soundSystem.playHit();
            } else {
                h.st = 'stuck'; // bị khiên/né đỡ -> móc bật ra, cắm lại tại chỗ
                spawnSparkParticles(h.x, h.y, '#00f0ff', 8);
            }
            break;
        }
        // Xe tiền: còn lượt -> ghim làm trụ phản xạ; hết lượt -> ngoạm chặt
        let stop = false;
        for (const t of moneyTrucks) {
            if (!t.active || !shCircleRect(h.x, h.y, r, t)) continue;
            shPinTruck(p, t);
            if (h.b > 0) {
                const wasOutX = px < t.x || px > t.x + t.w;
                h.x = px; h.y = py;
                if (wasOutX) h.vx = -h.vx; else h.vy = -h.vy;
                shBounce(p, h, '#ffd700');
                addFloatingText(t.x + t.w / 2, t.y - 8, 'GHIM! 📌', '#ffd700', 11);
            } else {
                h.st = 'truck'; h.truckId = t.id; h.idle = 0;
                h.x = Math.max(t.x, Math.min(h.x, t.x + t.w)); h.y = Math.max(t.y, Math.min(h.y, t.y + t.h));
                addFloatingText(t.x + t.w / 2, t.y - 10, 'NGOẠM! SPAM BẮN 💰', '#ffd700', 13);
            }
            stop = true; break;
        }
        if (stop) { if (h.st !== 'fly') break; continue; }
        // Hòm tiếp tế: phá & xuyên qua
        for (const c of crates) if (c.active && shCircleRect(h.x, h.y, r, c)) shBreakCrate(c, p);
        // Triệu hồi / công trình: 2 sát thương & xuyên qua
        for (const o of structs) {
            if (o.active === false || shMarked(o, '_shHit', h.sid) || !shCircleRect(h.x, h.y, r, o)) continue;
            shMark(o, '_shHit', h.sid);
            shHurtObj(o, 2, p);
            spawnSparkParticles(h.x, h.y, '#ff9f43', 8);
            addFloatingText(o.x + o.w / 2, o.y - 6, '-2 ⛓', '#ff9f43', 11);
        }
        // Hết chiều dài xích -> khoá lại giữa không trung
        if (h.len >= h.cap) { h.st = 'stuck'; spawnSparkParticles(h.x, h.y, '#bfe6ff', 5); break; }
    }
}

// Đạn địch bắn trúng đầu móc / chốt xích -> đứt xích
function shBulletsVsHooks(p) {
    const enemy = shEnemy(p);
    if (!enemy || !enemy.bullets || !p.shHooks.length) return;
    const r = shHeadR(p) + 4;
    for (let j = enemy.bullets.length - 1; j >= 0; j--) {
        const b = enemy.bullets[j];
        const bx = b.x + (b.w || 6) / 2, by = b.y + (b.h || 6) / 2;
        for (const h of p.shHooks) {
            if (h.hp <= 0) continue;
            let hit = Math.hypot(bx - h.x, by - h.y) < r + (b.w || 6) / 2;
            if (!hit) for (let i = 1; i < h.pts.length && !hit; i++) hit = Math.hypot(bx - h.pts[i].x, by - h.pts[i].y) < 9;
            if (!hit) continue;
            const key = 'shk' + h.sid;
            if (b.hitIds && b.hitIds.includes(key)) continue;
            h.hp -= (b.dmg || 1);
            h.flash = 6;
            spawnSparkParticles(bx, by, '#ffffff', 5);
            if (b.isPiercing) { if (b.hitIds) b.hitIds.push(key); } else enemy.bullets.splice(j, 1);
            if (h.hp <= 0) shSnap(p, h);
            break;
        }
    }
    p.shHooks = p.shHooks.filter(h => h.hp > 0);
    if (!p.shHooks.length && ['fly', 'hold', 'retract'].includes(p.shPhase)) { shUnpinAll(p); shEnd(p); }
}
function shSnap(p, h) {
    addFloatingText(h.x, h.y - 10, 'ĐỨT XÍCH! 💥', '#ff6b6b', 13);
    explosions.push(new Explosion(h.x, h.y, 26, 'rgba(255,120,120,', 0, p));
    spawnSparkParticles(h.x, h.y, '#cfd8e3', 12);
    if (h.st === 'enemy') { const e = shEnemy(p); if (e) e.freezeTimer = Math.min(e.freezeTimer || 0, 1); }
}
// Tự cắt xích (giữ Bắn 0.75s khi móc đã neo): huỷ mọi móc, hồi gần như ngay để phóng lại
function shCutChains(p) {
    (p.shHooks || []).forEach(h => {
        spawnSparkParticles(h.x, h.y, '#cfd8e3', 8);
        if (h.st === 'enemy') { const e = shEnemy(p); if (e) e.freezeTimer = Math.min(e.freezeTimer || 0, 1); }
    });
    const n = shNose(p);
    addFloatingText(n.x, n.y + shFwd(p) * 16, 'CẮT XÍCH! ✂', '#ffb4b4', 13);
    explosions.push(new Explosion(n.x, n.y, 20, 'rgba(255,160,160,', 0, p));
    if (soundSystem && !soundSystem.muted) soundSystem.playClick();
    shUnpinAll(p);
    shEnd(p);
    p.shT = SH_COOLDOWN - 12;
}
function shEnd(p) { p.shPhase = 'cool'; p.shT = 0; p.shHooks = []; p.shDrag = null; p.shZip = null; }

// ---------- Giai đoạn 2 ----------
function shStage2(p) {
    const caught = p.shHooks.find(h => h.st === 'enemy');
    const truckH = p.shHooks.find(h => h.st === 'truck');
    if (caught) {
        const path = shPath(caught);
        p.shDrag = { sid: ++p.shSerial, path, s: shPathLen(path), anchor: caught.pts.length - 1, slams: 0 };
        p.shHooks = [caught];
        p.shPhase = 'drag';
        addFloatingText(p.x + p.w / 2, p.y + shFwd(p) * 20, 'LÔI XÍCH HÀNH HÌNH! ⛓', '#9fe0ff', 14);
        if (soundSystem && !soundSystem.muted) soundSystem.playDash();
        return;
    }
    if (truckH) {
        const t = shTruckById(truckH.truckId);
        if (!t) { truckH.st = 'stuck'; return shStage2(p); }
        const path = shPath(truckH);
        if (typeof truckH.reelS !== 'number') truckH.reelS = shPathLen(path);
        truckH.reelS -= p.hasUpgrade('evo_hook_1') ? 52 : 38;
        truckH.idle = 0;
        spawnSparkParticles(t.x + t.w / 2, t.y + t.h / 2, '#ffd700', 4);
        if (truckH.reelS <= 30) {
            t.active = false;
            shGiveMoney(p, 45, p.x + p.w / 2, p.y + shFwd(p) * 18);
            explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 45, 'rgba(255,215,0,', 0, p));
            p.shHooks = p.shHooks.filter(h => h !== truckH);
            if (!p.shHooks.length) { shUnpinAll(p); shEnd(p); }
        } else {
            const pt = shPointAt(path, truckH.reelS);
            t.x = pt.x - t.w / 2; t.y = pt.y - t.h / 2;
            truckH.x = pt.x; truckH.y = pt.y;
            truckH.pts = shSubPath(path, 0, truckH.reelS).slice(0, -1);
            if (!truckH.pts.length) truckH.pts = [{ x: path[0].x, y: path[0].y }];
        }
        return;
    }
    const stuck = p.shHooks.find(h => h.main && h.st === 'stuck') || p.shHooks.find(h => h.st === 'stuck');
    if (stuck) {
        const path = shPath(stuck);
        p.shZip = { sid: ++p.shSerial, path, s: 0, L: shPathLen(path), hitEnemy: false };
        p.shHooks = [stuck];
        p.shPhase = 'zip';
        addFloatingText(p.x + p.w / 2, p.y + shFwd(p) * 20, 'ĐU DÂY ĐỘT KÍCH! 🪝', '#bfe6ff', 14);
        if (soundSystem && !soundSystem.muted) soundSystem.playDash();
    }
}

function shZipUpdate(p) {
    const z = p.shZip;
    const spd = p.hasUpgrade('evo_hook_1') ? 24 : 18;
    const enemy = shEnemy(p);
    const steps = 4;
    for (let k = 0; k < steps; k++) {
        z.s = Math.min(z.L, z.s + spd / steps);
        const pt = shPointAt(z.path, z.s);
        p.x = pt.x - p.w / 2; p.y = pt.y - p.h / 2;
        // Húc mọi thứ trên đường
        if (!z.hitEnemy && enemy && enemy.hp > 0 && rectIntersect(p.x, p.y, p.w, p.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
            z.hitEnemy = true;
            enemy.takeDamage(p.damage, p);
            triggerScreenShake(6, 10);
            addFloatingText(enemy.x + enemy.w / 2, enemy.y - 16, 'HÚC! 💥', '#ff9f43', 14);
        }
        for (const c of crates) if (c.active && rectIntersect(p.x, p.y, p.w, p.h, c.x, c.y, c.w, c.h)) shBreakCrate(c, p);
        for (const t of moneyTrucks) {
            if (!t.active || shMarked(t, '_shRam', z.sid) || !rectIntersect(p.x, p.y, p.w, p.h, t.x, t.y, t.w, t.h)) continue;
            shMark(t, '_shRam', z.sid); shHurtTruck(t, 2, p);
        }
        for (const o of shStructs(p)) {
            if (shMarked(o, '_shRam', z.sid) || !rectIntersect(p.x, p.y, p.w, p.h, o.x, o.y, o.w, o.h)) continue;
            shMark(o, '_shRam', z.sid); shHurtObj(o, 2, p);
            spawnSparkParticles(o.x + o.w / 2, o.y + o.h / 2, '#ff9f43', 8);
        }
        if (z.s >= z.L) break;
    }
    // Rút xích phía sau xe
    const h = p.shHooks[0];
    if (h) { h.zipFrom = z.s; }
    if (z.s >= z.L) {
        const e = z.path[z.path.length - 1];
        explosions.push(new Explosion(e.x, e.y, 62, 'rgba(160,220,255,', p.damage, p));
        triggerScreenShake(8, 12);
        if (soundSystem && !soundSystem.muted) soundSystem.playExplosion();
        p.shHooks = [];
        p.shPhase = 'zipBack';
    }
}

function shBackToLane(o, spd) {
    const ly = shLaneY(o);
    const dy = ly - o.y;
    o.y = Math.abs(dy) <= spd ? ly : o.y + Math.sign(dy) * spd;
    o.x = Math.max(0, Math.min(canvas.width - o.w, o.x));
    return o.y === ly;
}

function shDragUpdate(p) {
    const d = p.shDrag;
    const enemy = shEnemy(p);
    const h = p.shHooks[0];
    if (!enemy || enemy.hp <= 0 || !h) { p.shHooks = []; p.shPhase = 'dragBack'; return; }
    enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, 3);
    const spd = p.hasUpgrade('evo_hook_1') ? 20 : 15;
    const endS = 34;
    const objDmg = p.hasUpgrade('evo_hook_2') ? 2 : 1;
    const steps = 4;
    for (let k = 0; k < steps; k++) {
        d.s = Math.max(endS, d.s - spd / steps);
        const pt = shPointAt(d.path, d.s);
        enemy.x = pt.x - enemy.w / 2; enemy.y = pt.y - enemy.h / 2;
        // Đập tường tại chốt nảy
        while (d.anchor >= 1 && pt.i <= d.anchor) {
            const a = d.path[d.anchor];
            d.anchor--;
            enemy.takeDamage(0.5, p, { isPiercing: true });
            spawnSparkParticles(a.x, a.y, '#ffe9a8', 10);
            addFloatingText(a.x, a.y - 8, 'ĐẬP TƯỜNG -0.5', '#ffe9a8', 11);
            d.slams++;
        }
        // Đập vào vật thể trên đường
        const slam = (o, hurt) => {
            if (shMarked(o, '_shSlam', d.sid) || !rectIntersect(enemy.x, enemy.y, enemy.w, enemy.h, o.x, o.y, o.w, o.h)) return;
            shMark(o, '_shSlam', d.sid);
            enemy.takeDamage(objDmg, p, { isPiercing: true });
            hurt(o);
            d.slams++;
            triggerScreenShake(4, 6);
            spawnSparkParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#ff9f43', 10);
            addFloatingText(enemy.x + enemy.w / 2, enemy.y - 14, `VA ĐẬP -${objDmg}`, '#ff9f43', 12);
        };
        crates.forEach(c => { if (c.active) slam(c, c2 => shBreakCrate(c2, p)); });
        moneyTrucks.forEach(t => { if (t.active) slam(t, t2 => shHurtTruck(t2, objDmg, p)); });
        shStructs(p).forEach(o => slam(o, o2 => shHurtObj(o2, objDmg, p)));
        if (movingObstacle && movingObstacle.active) slam(movingObstacle, () => {});
        if (enemy.hp <= 0) break;
        if (d.s <= endS) break;
    }
    h.x = enemy.x + enemy.w / 2; h.y = enemy.y + enemy.h / 2;
    h.pts = shSubPath(d.path, 0, d.s).slice(0, -1);
    if (!h.pts.length) h.pts = [{ x: d.path[0].x, y: d.path[0].y }];
    if (d.s <= endS || enemy.hp <= 0) {
        // Giật xích chốt hạ
        const ex = enemy.x + enemy.w / 2, ey = enemy.y + enemy.h / 2;
        explosions.push(new Explosion(ex, ey, 46, 'rgba(150,215,255,', p.damage, p));
        triggerScreenShake(9, 14);
        addFloatingText(ex, ey - 22, d.slams ? `HÀNH HÌNH! (${d.slams} va đập)` : 'HÀNH HÌNH!', '#ffffff', 14);
        if (soundSystem && !soundSystem.muted) soundSystem.playExplosion();
        p.shHooks = [];
        p.shPhase = 'dragBack';
    }
}

// ---------- Evo 2: móc phụ tự động ném xe tiền / vật thể vào địch ----------
function shAutoTarget(p) {
    const n = shNose(p);
    let best = null, bd = 1e9;
    const consider = (o, kind) => {
        if (!o || o.active === false || o.shPinBy) return;
        const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
        if (cx < 0 || cx > canvas.width || cy < 0 || cy > canvas.height) return;
        const d = Math.hypot(cx - n.x, cy - n.y) * (kind === 'truck' ? 0.6 : 1);
        if (d < bd) { bd = d; best = { o, kind }; }
    };
    moneyTrucks.forEach(t => consider(t, 'truck'));
    crates.forEach(c => { if (c.type !== 'boom') consider(c, 'crate'); });
    shStructs(p).forEach(o => { if (!o.isImmortal) consider(o, 'obj'); });
    return best;
}
// Thuộc tính không liệt kê (enumerable:false) -> NetState bỏ qua khi tuần tự hoá
function shSetAutoObj(p, o) { Object.defineProperty(p, 'shAutoObj', { value: o, writable: true, enumerable: false, configurable: true }); }
function shAutoUpdate(p) {
    if (!p.hasUpgrade('evo_hook_2')) return;
    const enemy = shEnemy(p);
    const a = p.shAuto;
    if (!a) {
        if (++p.shAutoT < SH_AUTO_PERIOD) return;
        const tg = shAutoTarget(p);
        if (!tg) { p.shAutoT = SH_AUTO_PERIOD - 60; return; }
        p.shAutoT = 0;
        const n = shNose(p);
        p.shAuto = { st: 'out', x: n.x, y: n.y, tx: tg.o.x + tg.o.w / 2, ty: tg.o.y + tg.o.h / 2, kind: tg.kind, w: tg.o.w, h: tg.o.h, ref: tg.o.id || '', t: 0, rot: 0 };
        shSetAutoObj(p, tg.o); // tham chiếu tạm (chỉ dùng trên host, không đồng bộ)
        return;
    }
    a.t++;
    if (a.st === 'out') {
        const o = p.shAutoObj;
        if (o && o.active !== false) { a.tx = o.x + o.w / 2; a.ty = o.y + o.h / 2; }
        const dx = a.tx - a.x, dy = a.ty - a.y, L = Math.hypot(dx, dy);
        const spd = 15;
        if (L <= spd || a.t > 90) {
            a.x = a.tx; a.y = a.ty;
            if (o && o.active !== false) {
                if (o instanceof Crate) { o._broke = true; } // ném luôn cả hòm (không mở hòm)
                o.active = false;
                if (o instanceof MoneyTruck) o.hp = 0;
            }
            shSetAutoObj(p, null);
            a.st = 'throw'; a.t = 0;
            a.sx = a.x; a.sy = a.y;
            addFloatingText(a.x, a.y - 12, 'QUẶP! 🪝', '#c4b5fd', 12);
            if (enemy) { const v = aimVelocity(a.x, a.y, enemy, 9, true); a.vx = v.vx; a.vy = v.vy; }
            else { a.vx = 0; a.vy = shFwd(p) * 9; }
        } else { a.x += dx / L * spd; a.y += dy / L * spd; }
    } else if (a.st === 'throw') {
        a.x += a.vx; a.y += a.vy; a.rot += 0.25;
        let boom = a.t > 110 || a.y < 0 || a.y > canvas.height || a.x < -20 || a.x > canvas.width + 20;
        if (enemy && enemy.hp > 0 && rectIntersect(a.x - a.w / 2, a.y - a.h / 2, a.w, a.h, enemy.x, enemy.y, enemy.w, enemy.h)) boom = true;
        if (boom) {
            const big = a.kind === 'truck';
            explosions.push(new Explosion(a.x, a.y, big ? 85 : 65, big ? 'rgba(255,190,40,' : 'rgba(200,170,255,', big ? 3 : 2, p));
            triggerScreenShake(big ? 10 : 7, 14);
            if (soundSystem && !soundSystem.muted) soundSystem.playExplosion();
            p.shAuto = null;
        }
    }
}

CharHooks.register('steel_hook', {
    setup() {
        if (shIsFull(this)) this.maxHp *= 2; // FULL EVO: x2 máu tối đa
        this.maxAmmo = 1;
        this.shBaseSpeed = this.speed;
        this.shPhase = 'ready'; this.shT = 0; this.shSwing = 0; this.shCharge = -1; this.shPrevS = false;
        this.shHoldS = -1; this.shAimTier = 0; this.shAimCharge = 0;
        this.shHooks = []; this.shPinned = []; this.shSerial = 0; this.shDrag = null; this.shZip = null;
        this.shAuto = null; shSetAutoObj(this, null); this.shAutoT = 0; this.shTick = 0; this.shLaunchBounces = 0;
    },

    update() {
        this.shTick++;
        const ph = this.shPhase;
        // Khoá di chuyển khi móc đang ra ngoài (dùng speed để guest online cũng không tự dự đoán sai)
        this.speed = (ph === 'ready' || ph === 'cool') ? this.shBaseSpeed : 0;
        if (ph === 'ready' || ph === 'cool') this.shSwing += SH_SWING_SPEED * (this.shCharge >= 0 ? 0.8 : 1);

        if (ph === 'aim') {
            // Cảnh báo: đường xích đã khoá, đối thủ có ~0.33s để né
            if (++this.shT >= SH_AIM_DELAY) { this.shT = 0; shLaunch(this, this.shAimTier || 0, this.shAimCharge || 0); }
        } else if (ph === 'fly') {
            this.shHooks.forEach(h => { if (h.st === 'fly') shFlyStep(this, h); if (h.flash > 0) h.flash--; });
            if (this.shHooks.every(h => h.st !== 'fly')) { this.shPhase = 'hold'; this.shT = 0; }
        } else if (ph === 'hold') {
            this.shT++;
            this.shHooks.forEach(h => { if (h.flash > 0) h.flash--; });
            const enemy = shEnemy(this);
            const caught = this.shHooks.find(h => h.st === 'enemy');
            if (caught && enemy) {
                enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, 3);
                caught.x = Math.max(enemy.x, Math.min(caught.x, enemy.x + enemy.w));
                caught.y = Math.max(enemy.y, Math.min(caught.y, enemy.y + enemy.h));
            }
            const th = this.shHooks.find(h => h.st === 'truck');
            if (th) {
                const t = shTruckById(th.truckId);
                if (!t) th.st = 'stuck';
                else if (++th.idle > SH_TRUCK_IDLE && typeof th.reelS === 'number') { th.st = 'stuck'; t.speed = t.shSpeed || 1.25; }
            }
            if (this.shT > SH_HOLD_TIMEOUT && !(th && th.idle <= SH_TRUCK_IDLE)) {
                this.shPhase = 'retract'; this.shT = 0;
            }
        } else if (ph === 'zip') {
            shZipUpdate(this);
        } else if (ph === 'zipBack') {
            if (shBackToLane(this, 14)) { shUnpinAll(this); shEnd(this); }
        } else if (ph === 'drag') {
            shDragUpdate(this);
        } else if (ph === 'dragBack') {
            const enemy = shEnemy(this);
            if (!enemy || enemy.hp <= 0) { shUnpinAll(this); shEnd(this); }
            else {
                enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, 3);
                if (shBackToLane(enemy, 16)) { enemy.freezeTimer = 12; shUnpinAll(this); shEnd(this); }
            }
        } else if (ph === 'retract') {
            // Thu xích về: rút ngắn từng móc
            this.shT++;
            this.shHooks.forEach(h => {
                const path = shPath(h);
                const L = shPathLen(path) - 30;
                if (L <= 0) { h.hp = 0; return; }
                const pt = shPointAt(path, L);
                h.pts = shSubPath(path, 0, L).slice(0, -1);
                if (!h.pts.length) h.pts = [{ x: path[0].x, y: path[0].y }];
                h.x = pt.x; h.y = pt.y; h.st = 'stuck';
            });
            this.shHooks = this.shHooks.filter(h => h.hp > 0);
            if (!this.shHooks.length || this.shT > 200) { shUnpinAll(this); shEnd(this); }
        } else if (ph === 'cool') {
            if (++this.shT >= SH_COOLDOWN) { this.shPhase = 'ready'; this.shT = 0; }
        }
        // Gốc xích luôn gắn mũi xe (khi xe đứng yên)
        if (['fly', 'hold', 'retract'].includes(this.shPhase)) {
            const n = shNose(this);
            this.shHooks.forEach(h => { if (h.pts[0]) { h.pts[0].x = n.x; h.pts[0].y = n.y; } });
        }
        if (this.shHooks.length && (this.shPhase === 'fly' || this.shPhase === 'hold')) shBulletsVsHooks(this);
        shAutoUpdate(this);
    },

    speed(s) { return (this.shPhase === 'ready' && this.shCharge >= 0) ? s * 0.6 : s; },

    shoot(inp) {
        const s = !!inp.s;
        const press = s && !this.shPrevS, release = !s && this.shPrevS;
        this.shPrevS = s;
        if (this.shPhase === 'ready') {
            if (press) this.shCharge = 0;
            else if (s && this.shCharge >= 0) {
                this.shCharge++;
                if (this.shCharge % SH_TIER_TICKS === 0 && this.shCharge <= SH_TIER_TICKS * 4) {
                    spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, '#bfe6ff', 5);
                    if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                }
            } else if (release && this.shCharge >= 0) {
                const tier = Math.min(4, Math.floor(this.shCharge / SH_TIER_TICKS));
                if (tier >= 1) {
                    // Tụ lực -> móc bay nhanh: khoá hướng, hiện cảnh báo rồi mới phóng
                    this.shPhase = 'aim'; this.shT = 0; this.shAimTier = tier; this.shAimCharge = this.shCharge;
                    if (soundSystem && !soundSystem.muted) soundSystem.playClick();
                } else shLaunch(this, tier, this.shCharge);
                this.shCharge = -1;
            }
            this.shHoldS = -1;
        } else {
            this.shCharge = -1;
            if (this.shPhase === 'hold') {
                // Nhấp (nhả trước 0.75s) -> giai đoạn 2; giữ đủ 0.75s -> tự cắt xích để phóng lại
                if (press) this.shHoldS = 0;
                else if (s && this.shHoldS >= 0) {
                    if (++this.shHoldS >= SH_BREAK_TICKS) { this.shHoldS = -1; shCutChains(this); }
                } else if (release && this.shHoldS >= 0) { this.shHoldS = -1; shStage2(this); }
            } else this.shHoldS = -1;
        }
        this.ammo = this.shPhase === 'ready' ? 1 : 0;
        return true;
    },

    roundEnd() { shUnpinAll(this); this.shHooks = []; this.shAuto = null; shSetAutoObj(this, null); },
});
