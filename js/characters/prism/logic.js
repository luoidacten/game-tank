// ==========================================
// Phản Chiếu — Lăng Kính Tuyệt Đối (prism) (docs/BODY_MOI_5.md #84)
// ------------------------------------------
// Nhấp: Tia Khúc Xạ 1.0 dame, bay cực nhanh, nảy tường 1 lần.
// KÍNH LẤP LÁNH: mọi Khiên hóa Khiên Kính — bị đánh trúng thì bật Kính 1.2s (phản mọi đòn) rồi vỡ.
//   Phản thường: 40% (Evo1 70%, Full 100%) dame, bị phạt 0.5 HP (Evo1 0.25, Full 0) mỗi đợt.
//   Đạn chạm Kính (bắt ở checkHits): trả lại CHÍNH viên đạn (reflectBulletClone, js/core/reflect.js) bay ngược về kẻ bắn.
//   Đòn không phải đạn (hitscan / cận chiến / nổ): bắn trả 1 tia hitscan dọc cột Kính (không khoá di chuyển).
// Giữ 0.4s (hồi 9s / Evo1 7s): MỞ KÍNH 1.5s (Evo1 2.5s) — dùng lớp kính kỹ năng trước mọi khiên khác.
//   0.25s đầu = CỬA SỔ VÀNG: miễn sát thương, phản 100% (Evo1 125%, Full 150%) + đạn phản tăng tốc.
// Lazer Xuyên Phá vào kính: chỉ phản ngược được trong 0.125s đầu (Evo2 0.2s); ngoài ra bị khúc xạ
//   lệch sang bên & mất 2.0 HP (quá tải).
// Evo2: đầu hiệp +1 Khiên Kính; kính vỡ bắn mảnh kính diện rộng.
// State là trường thuần trên player / entity trong bodyEffects (đồng bộ online).
// ==========================================

const PR_CYAN = '#a5f3fc', PR_WHITE = '#f8fafc', PR_GOLD = '#fde047', PR_VIO = '#c4b5fd', PR_PINK = '#f9a8d4';
const PR_RAINBOW = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#22d3ee', '#818cf8', '#e879f9'];
const PR_HOLD = 24, PR_GOLDEN = 15, PR_GLASS = 72;

function prE1(p) { return p.hasUpgrade('evo_prism_1'); }
function prE2(p) { return p.hasUpgrade('evo_prism_2'); }
function prFull(p) { return prE1(p) && prE2(p); }
function prIs(p) { return !!p && p.weapon === 'prism'; }
function prEnemy(p) { return p === p1 ? p2 : p1; }
function prDir(p) { return p.id === 1 ? -1 : 1; }
function prSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function prTxt(o, s, c, sz, dy) { addFloatingText(o.x + o.w / 2, o.y + (o.id === 1 ? -18 - (dy || 0) : o.h + 22 + (dy || 0)), s, c, sz || 12); }
function prDur(p) { return prE1(p) ? 150 : 90; }
function prCdMax(p) { return prE1(p) ? 420 : 540; }
function prLaserWin(p) { return prE2(p) ? 12 : 8; }
function prNormRatio(p) { return prFull(p) ? 1.0 : prE1(p) ? 0.7 : prE2(p) ? 0.5 : 0.4; }
function prGoldRatio(p) { return prFull(p) ? 1.5 : prE1(p) ? 1.25 : 1.0; }
function prPenalty(p) { return prFull(p) ? 0 : (prE1(p) ? 0.25 : 0.5); }
function prGolden(p) { return p.prOn > 0 && (p.prAge || 0) < PR_GOLDEN; }
function prGlassOn(p) { return p.prOn > 0 || p.prGlass > 0; }
function prIsLaser(att, amount) { return !!att && att.weapon === 'lazer_charge' && amount >= 10; }

// ---------- Entity: tia lazer phản / khúc xạ (chỉ hình) ----------
class PrBeam {
    constructor(owner, x, y0, y1, kind, side) {
        this.team = owner.id; this.x = x; this.y0 = y0; this.y1 = y1;
        this.kind = kind; this.side = side || 1; this.t = 0; this.dur = kind === 'back' ? 26 : 22; this.active = true;
    }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof prDrawBeam === 'function') prDrawBeam(this); }
}

// ---------- Entity: Kết liễu "VẠN KÍNH QUY QUANG" ----------
class PrFinisher {
    constructor(owner, victim) {
        this.team = owner.id; this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.ox = owner.x + owner.w / 2; this.oy = owner.id === 1 ? owner.y : owner.y + owner.h;
        this.t = 0; this.dur = 160; this.active = true; this.seed = Math.floor(Math.random() * 1000);
    }
    update() {
        this.t++;
        if (this.t === 120) {
            triggerScreenShake(14, 22);
            for (let i = 0; i < 3; i++) spawnSparkParticles(this.x, this.y, PR_RAINBOW[(i * 2 + this.seed) % 7], 16);
            explosions.push(new Explosion(this.x, this.y, 70, 'rgba(165,243,252,', 0, null));
            prSfx('playExplosion');
        } else if (this.t < 120 && this.t % 6 === 0) prSfx('playLaser');
        if (this.t >= this.dur) this.active = false;
    }
    draw() { if (typeof prDrawFinisherUnder === 'function') prDrawFinisherUnder(this); }
    drawOver() { if (typeof prDrawFinisherOver === 'function') prDrawFinisherOver(this); }
    // Camera: cận cảnh lăng kính phát tia (0-10) -> bám đầu tia tới mục tiêu (10-30) -> giữ -> lùi về 1x trước băng rôn
    camPath() {
        if (typeof fcamKeys !== 'function' || this.ox === undefined) return null;
        return fcamKeys(this.t, [[0, this.ox, this.oy, 1], [6, this.ox, this.oy, 1.6], [10, this.ox, this.oy, 1.6],
            [30, this.x, this.y, 1.35], [124, this.x, this.y, 1.3], [150, this.x, this.y, 1]]);
    }
}
function prSpawnFinisher(p, v) {
    if (typeof bodyEffects === 'undefined' || bodyEffects.some(e => e instanceof PrFinisher)) return;
    bodyEffects.push(new PrFinisher(p, v));
    triggerScreenShake(8, 14);
    spawnSparkParticles(v.x + v.w / 2, v.y + v.h / 2, PR_CYAN, 24);
}

// ---------- Bắn ----------
function prMuzzle(p) { return { x: p.x + p.w / 2, y: p.id === 1 ? p.y - 8 : p.y + p.h + 8 }; }
function prFire(p, now) {
    if (!(p.ammo > 0) || now - (p.lastShot || 0) < 280) return;
    p.ammo--; p.lastShot = now; p.prRecoil = 8;
    const e = prEnemy(p), m = prMuzzle(p), sp = C.bulletSpeed * 1.75;
    let vx = 0;
    if (e && e.hp > 0) {
        const v = aimVelocity(m.x, m.y, e, sp, true);
        vx = Math.max(-sp * 0.35, Math.min(sp * 0.35, v.vx));
    }
    const vy = prDir(p) * Math.sqrt(Math.max(1, sp * sp - vx * vx));
    spawnBullet(p, { w: 4, h: 12, x: m.x - 2, y: m.y - 6, vx, vy, hook: 'prism', prKind: 'shot', prBounce: 0 });
    spawnSparkParticles(m.x, m.y, PR_CYAN, 3);
    prSfx('playShoot');
}
// Tia phản (đòn không phải đạn: hitscan / cận chiến / vụ nổ): bắn ngược 1 tia hitscan theo cột của Kính (không khoá di chuyển)
function prEmitRay(p, dmg, fast) {
    const e = prEnemy(p), m = prMuzzle(p), cx = m.x, top = p.id === 1;
    const yEnd = e ? (top ? e.y + e.h : e.y) : (top ? 0 : canvas.height);
    bodyEffects.push(new PrBeam(p, cx, m.y, yEnd, 'back', 1));
    const d = Math.max(0.15, Math.round(dmg * 100) / 100);
    if (e && e.hp > 0 && typeof e.takeDamage === 'function' && Math.abs((e.x + e.w / 2) - cx) < e.w / 2 + 10) {
        e.takeDamage(d, p, { isPiercing: true });
        spawnSparkParticles(e.x + e.w / 2, top ? e.y + e.h : e.y, fast ? PR_GOLD : PR_CYAN, 8);
    }
    spawnSparkParticles(m.x, m.y, fast ? PR_GOLD : PR_WHITE, fast ? 10 : 5);
    prTxt(p, (fast ? 'PHẢN TIA TUYỆT ĐỐI ' : 'PHẢN TIA ') + d.toFixed(2), fast ? PR_GOLD : PR_CYAN, fast ? 14 : 11);
    prSfx('playLaser');
}
// Đạn chạm Kính: trả lại CHÍNH viên đạn đó (bản sao giữ nguyên loại / hình / hiệu ứng — js/core/reflect.js)
function prCatchBullets(att, p) {
    if (!att || att === p || !att.bullets || !att.bullets.length || !(p.hp > 0) || gameState.phase !== 'playing') return;
    if (!prGlassOn(p) && !(p.shield > 0)) return;
    for (let i = att.bullets.length - 1; i >= 0; i--) {
        const b = att.bullets[i];
        if (!b || !rfCanReflect(b) || (b.hitIds && b.hitIds.includes(p))) continue;
        if (!rectIntersect(b.x, b.y, b.w || 6, b.h || 6, p.x, p.y, p.w, p.h)) continue;
        const r = prAbsorb(p, b.dmg || 0, att, {}, false);
        if (!r) continue;
        att.bullets.splice(i, 1);
        const fast = r.fast;
        const c = reflectBulletClone(b, p, { from: att, dmgMult: r.ratio, speedMult: fast ? (prFull(p) ? 1.8 : 1.5) : 1, target: att, tint: fast ? PR_GOLD : PR_CYAN });
        c.prHome = prE1(p);
        spawnSparkParticles(c.x + c.w / 2, c.y + c.h / 2, fast ? PR_GOLD : PR_WHITE, fast ? 10 : 5);
        if (!(p.prTxtT > 0)) { prTxt(p, (fast ? 'PHẢN TUYỆT ĐỐI ' : 'PHẢN ') + c.dmg.toFixed(2), fast ? PR_GOLD : PR_CYAN, fast ? 14 : 11); p.prTxtT = 8; }
    }
}
// Mảnh kính vỡ (Evo2)
function prShatter(p) {
    p.prBreakFx = 20;
    spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, PR_CYAN, 14);
    prSfx('playShieldBreak');
    if (!prE2(p)) return;
    const m = prMuzzle(p), sp = C.bulletSpeed * 1.5;
    for (let i = -2; i <= 2; i++) {
        const a = i * 0.3;
        spawnBullet(p, {
            w: 5, h: 5, x: m.x - 2.5, y: m.y - 2.5, vx: Math.sin(a) * sp, vy: prDir(p) * Math.cos(a) * sp,
            dmg: 0.35, hook: 'prism', prKind: 'shard', prBounce: 1, prSpin: i,
        });
    }
}

// ---------- Phản đòn ----------
function prRawHit(p, amount, attacker, lethal) {
    if (!(amount > 0)) return;
    if (lethal) {
        p.prRaw = true;
        try { p.takeDamage(amount, attacker, { unavoidable: true, bypassShield: true, isPiercing: true }); } finally { p.prRaw = false; }
        return;
    }
    const d = Math.min(amount, Math.max(0, p.hp - 0.1));
    if (d <= 0) return;
    p.hp -= d;
    addFloatingText(p.x + p.w / 2, p.y + p.h / 2, '-' + d.toFixed(2), '#fca5a5', 11);
}
function prReflectLaser(p, amount, attacker) {
    const top = p.id === 1, yMy = top ? p.y : p.y + p.h, cx = p.x + p.w / 2;
    const back = p.prOn > 0 && (p.prAge || 0) < prLaserWin(p);
    if (back) {
        const yEnd = attacker ? (top ? attacker.y + attacker.h : attacker.y) : (top ? 0 : canvas.height);
        bodyEffects.push(new PrBeam(p, cx, yMy, yEnd, 'back', 1));
        prTxt(p, 'PHẢN NGƯỢC LAZER!!', PR_GOLD, 16);
        triggerScreenShake(12, 18);
        prSfx('playLaser');
        if (attacker && attacker.hp > 0 && typeof attacker.takeDamage === 'function' && Math.abs((attacker.x + attacker.w / 2) - cx) < attacker.w / 2 + 26)
            attacker.takeDamage(amount * prGoldRatio(p), p, { isPiercing: true, bypassShield: prFull(p) });
        return;
    }
    const side = (cx < canvas.width / 2) ? 1 : -1;
    bodyEffects.push(new PrBeam(p, cx, yMy, top ? 0 : canvas.height, 'bend', side));
    prTxt(p, 'KHÚC XẠ LỆCH! QUÁ TẢI -2', '#fca5a5', 13);
    triggerScreenShake(8, 12);
    prRawHit(p, 2.0, attacker, true);
}
// Kính có xử lý đòn này không? -> { ratio, fast } | { laser } | null (bật Kính Lấp Lánh từ khiên, tính phạt)
function prAbsorb(p, amount, attacker, options, laser) {
    options = options || {};
    if (p.prRaw || !(p.hp > 0) || gameState.phase !== 'playing' || !(amount > 0)) return null;
    if (!attacker || attacker === p || options.isEnvironmental) return null;
    if (!laser && options.ignoreInvincible && options.bypassShield) return null; // kết liễu tuyệt đối
    if (!prGlassOn(p)) {
        if (!(p.shield > 0) || (options.bypassShield && !laser)) return null;
        p.prGlass = PR_GLASS; p.prGlassFx = 14; // Khiên -> Kính Lấp Lánh 1.2s rồi vỡ
        prTxt(p, 'KÍNH LẤP LÁNH!', PR_CYAN, 13, 12);
    }
    p.prHitFx = 10;
    if (laser) return { laser: true };
    if (prGolden(p)) {
        spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, PR_GOLD, 8);
        prSfx('playHit');
        return { ratio: prGoldRatio(p), fast: true };
    }
    if (!(p.prPenCd > 0)) { p.prPenCd = 18; prRawHit(p, prPenalty(p), attacker, false); }
    spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, PR_CYAN, 6);
    prSfx('playHit');
    return { ratio: prNormRatio(p), fast: false };
}
// Đòn không phải đạn (đạn đã được bắt ở checkHits): Lazer -> luật Lazer; còn lại -> tích lại, bắn trả bằng tia
function prIntercept(p, amount, attacker, options) {
    const laser = prIsLaser(attacker, amount);
    const r = prAbsorb(p, amount, attacker, options, laser);
    if (!r) return false;
    if (r.laser) { prReflectLaser(p, amount, attacker); return true; }
    p.prPend = (p.prPend || 0) + amount * r.ratio;
    if (r.fast) p.prPendFast = true;
    return true;
}

BulletHooks.register('prism', {
    edge(b, o) {
        if (b.x <= 0 || b.x >= canvas.width) {
            if ((b.prBounce || 0) < 1 && b.y > 0 && b.y < canvas.height) {
                b.prBounce = (b.prBounce || 0) + 1; b.vx = -b.vx;
                b.x = Math.max(1, Math.min(canvas.width - 1 - (b.w || 0), b.x));
                spawnSparkParticles(b.x, b.y, PR_CYAN, 4);
                return 'keep';
            }
        }
    },
    hit(b, o, v) {
        if (v && (v === p1 || v === p2) && v !== o) spawnSparkParticles(b.x + 2, b.y + 4, b.prFast ? PR_GOLD : PR_CYAN, 6);
    },
    draw(b) { if (typeof prDrawBullet === 'function') prDrawBullet(b); },
});

// ---------- Tick chính (chạy cả khi bị choáng) ----------
function prTick(p) {
    ['prRecoil', 'prTxtT', 'prHitFx', 'prGlassFx', 'prBreakFx', 'prPenCd', 'prRefCd', 'prOpenFx'].forEach(k => { if (p[k] > 0) p[k]--; });
    if (p.hp <= 0 || gameState.phase !== 'playing') return;
    if (p.prOn > 0) {
        p.prAge = (p.prAge || 0) + 1;
        if (--p.prOn <= 0) { p.prOn = 0; p.prCd = prCdMax(p); prShatter(p); }
    } else if (p.prCd > 0) p.prCd--;
    if (p.prGlass > 0 && p.prOn <= 0) {
        if (--p.prGlass <= 0) { p.prGlass = 0; if (p.shield > 0) p.shield--; prShatter(p); }
    }
    if (p.prPend > 0 && !(p.prRefCd > 0)) {
        prEmitRay(p, p.prPend, !!p.prPendFast);
        p.prPend = 0; p.prPendFast = false; p.prRefCd = 5;
    }
    // Evo1: đạn phản bẻ góc nhẹ về phía địch
    const e = prEnemy(p);
    if (e && e.hp > 0) for (const b of p.bullets) {
        if (!b.prHome || (b.hook !== 'prism' && b.hook !== 'reflect')) continue;
        const tx = e.x + e.w / 2, ty = e.y + e.h / 2, cx = b.x + b.w / 2;
        const k = typeof homingTurnScale === 'function' ? homingTurnScale(b, p.id, tx, ty) : 1;
        b.vx += Math.sign(tx - cx) * 0.12 * k;
        b.vx = Math.max(-2.4, Math.min(2.4, b.vx));
    }
}
function prOpen(p) {
    p.prOn = prDur(p); p.prAge = 0; p.prOpenFx = 18;
    prTxt(p, 'MỞ KÍNH!', PR_GOLD, 15);
    spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, PR_GOLD, 12);
    triggerScreenShake(3, 6);
    prSfx('playPowerup');
}

CharHooks.register('prism', {
    setup() {
        this.prOn = 0; this.prAge = 0; this.prCd = 0; this.prHold = 0; this.prPrevS = false; this.prUsed = false;
        this.prGlass = 0; this.prPend = 0; this.prPendFast = false; this.prRefCd = 0; this.prPenCd = 0;
        this.prRecoil = 0; this.prHitFx = 0; this.prGlassFx = 0; this.prBreakFx = 0; this.prOpenFx = 0; this.prRaw = false; this.lastShot = 0;
        if (prE2(this)) this.shield = (this.shield || 0) + 1;
    },
    shoot(inp, now) {
        const s = !!inp.s, rel = !s && this.prPrevS;
        this.prPrevS = s;
        if (s) {
            if (this.prUsed) return true;
            if (++this.prHold >= PR_HOLD) {
                this.prUsed = true; this.prHold = 0;
                if (this.prOn > 0) { /* đang mở */ }
                else if (this.prCd <= 0) prOpen(this);
                else prTxt(this, 'HỒI ' + (this.prCd / 60).toFixed(1) + 's', '#94a3b8', 11);
            }
        } else {
            if (rel && !this.prUsed) prFire(this, now);
            this.prHold = 0; this.prUsed = false;
        }
        return true;
    },
    roundEnd() { this.prOn = 0; this.prGlass = 0; this.prPend = 0; },
});

(function () {
    const origU = Player.prototype.update;
    Player.prototype.update = function () {
        if (prIs(this)) { try { prTick(this); } catch (err) { console.error(err); } }
        return origU.apply(this, arguments);
    };
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        if (prIs(this) && prIntercept(this, amount, attacker, options)) return 0;
        const before = this.hp;
        const r = origTD.apply(this, arguments);
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && prIs(attacker)) prSpawnFinisher(attacker, this);
        return r;
    };
    // Đạn địch chạm Kính -> bắt ngay trước khi tính trúng (không nổ / không hiệu ứng lên Phản Chiếu)
    function prWrapCheckHits() {
        if (typeof checkHits !== 'function' || checkHits.prWrapped) return;
        const origCH = checkHits;
        checkHits = function (attacker, victim) {
            if (prIs(victim)) { try { prCatchBullets(attacker, victim); } catch (err) { console.error(err); } }
            return origCH.apply(this, arguments);
        };
        checkHits.prWrapped = true;
    }
    if (typeof window !== 'undefined') window.addEventListener('load', prWrapCheckHits);
})();

// Bot: số tick cần giữ nút để Mở Kính đúng nhịp, hoặc 0
function prBotWantsOpen(p, e) {
    if (!prIs(p) || p.prOn > 0 || p.prCd > 0 || !e || !(e.hp > 0)) return 0;
    const cx = p.x + p.w / 2, my = p.id === 1 ? p.y : p.y + p.h;
    if (e.weapon === 'lazer_charge' && e.lcAuto && (e.lcEnergy || 0) >= 100 && Math.abs((e.x + e.w / 2) - cx) < 30 && Math.random() < 0.25) return PR_HOLD + 2;
    for (const b of e.bullets) {
        const vy = b.vy || 0;
        if (!(p.id === 1 ? vy > 0 : vy < 0)) continue;
        if (Math.abs(b.x + (b.w || 0) / 2 - cx) > p.w * 0.8) continue;
        const t = Math.abs(my - (b.y + (b.h || 0) / 2)) / Math.abs(vy);
        if (t >= PR_HOLD + 1 && t <= PR_HOLD + 10 && (b.dmg || 1) >= 0.5) return PR_HOLD + 2;
    }
    return 0;
}
