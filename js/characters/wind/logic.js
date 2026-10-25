// ==========================================
// Wind — Cơn Gió Mỏng Manh (wind) (docs/BODY_MOI_5.md #82)
// ------------------------------------------
// Nhấp (thả nút trước 0.4s): bắn Đạn Gió 0.8 dame.
// GIÓ NHẸ: ngừng bắn 0.5s -> NGƯNG PHONG tích +35%/s (tối đa +150% = x2.5, Evo1 nhanh hơn 40%).
//   Bắn liên tục (cách < 1.2s) -> LIÊN PHONG +1 tầng (tối đa 6 / Evo1 8): +15% tốc bắn, +12% tốc nạp mỗi tầng.
// Giữ 0.4s (hồi 8s / Evo2 5.5s): HÓA GIÓ 3.5s (Evo2 4.5s) — bất tử, đạn xuyên qua, +35%→55% tốc chạy,
//   nạp đạn & Ngưng Phong x2. Đứng yên 0.15s / nhấn bắn / hết giờ -> hiện hình + CUỒNG PHONG TỐC XẠ.
// Mọi state là trường thuần trên player (đồng bộ online), timer tính bằng tick.
// ==========================================

const WD_CYAN = '#7dd3fc', WD_MINT = '#99f6e4', WD_WHITE = '#f0f9ff', WD_SILVER = '#e2e8f0', WD_GOLD = '#fde68a';
const WD_HOLD = 24, WD_CHARGE_DELAY = 30, WD_CHAIN = 72, WD_STILL = 9, WD_MAXCH = 1.5;
const WD_BASE_INT = 18, WD_RELOAD = 45;

function wdE1(p) { return p.hasUpgrade('evo_wind_breeze_1'); }
function wdE2(p) { return p.hasUpgrade('evo_wind_breeze_2'); }
function wdFull(p) { return wdE1(p) && wdE2(p); }
function wdIs(p) { return !!p && p.weapon === 'wind'; }
function wdEnemy(p) { return p === p1 ? p2 : p1; }
function wdDir(p) { return p.id === 1 ? -1 : 1; }
function wdSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function wdTxt(o, s, c, sz, dy) { addFloatingText(o.x + o.w / 2, o.y + (o.id === 1 ? -18 - (dy || 0) : o.h + 22 + (dy || 0)), s, c, sz || 12); }
function wdMaxStacks(p) { return wdE1(p) ? 8 : 6; }
function wdFormMax(p) { return wdE2(p) ? 270 : 210; }
function wdCdMax(p) { return wdE2(p) ? 330 : 480; }
function wdBuffMax(p) { return wdE2(p) ? 210 : 150; }
function wdBuffAmt(p) { return wdE2(p) ? 0.75 : 0.5; }
function wdRateMult(p) { return 1 + 0.15 * (p.wdStacks || 0) + ((p.wdBuff || 0) > 0 ? wdBuffAmt(p) : 0); }
function wdReloadMult(p) { return (1 + (wdE1(p) ? 0.125 : 0.12) * (p.wdStacks || 0)) * ((p.wdForm || 0) > 0 ? 2 : 1); }

// ---------- Entity: Kết liễu "TAN VÀO HƯ KHÔNG" ----------
// 0-24: không gian ngưng lại, bóng gió bạc tụ ở mép sân | 24-44: lướt xuyên mục tiêu tốc độ âm thanh (vệt Mach)
// 44-100: hàng chục vết cắt tơ gió hiện dần trên xe | 100-170: xe vỡ vụn, mảnh vỡ bị gió cuốn bay ngang
class WdFinisher {
    constructor(owner, victim) {
        this.team = owner.id; this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.w = victim.w; this.h = victim.h; this.dirX = (owner.x + owner.w / 2) < this.x ? 1 : -1;
        this.t = 0; this.dur = 170; this.active = true; this.seed = Math.floor(Math.random() * 1000);
    }
    update() {
        this.t++;
        if (this.t === 30) { triggerScreenShake(10, 12); wdSfx('playDash'); wdSfx('playLaser'); }
        if (this.t === 100) {
            triggerScreenShake(12, 18);
            spawnSparkParticles(this.x, this.y, WD_SILVER, 22);
            spawnSparkParticles(this.x, this.y, WD_CYAN, 14);
            wdSfx('playExplosion');
        }
        if (this.t > 44 && this.t < 100 && this.t % 7 === 0) wdSfx('playHit');
        if (this.t >= this.dur) this.active = false;
    }
    draw() { if (typeof wdDrawFinisherUnder === 'function') wdDrawFinisherUnder(this); }
    drawOver() { if (typeof wdDrawFinisherOver === 'function') wdDrawFinisherOver(this); }
}
function wdSpawnFinisher(p, v) {
    if (typeof bodyEffects === 'undefined' || bodyEffects.some(e => e instanceof WdFinisher)) return;
    bodyEffects.push(new WdFinisher(p, v));
    p.wdForm = 0;
    triggerScreenShake(6, 10);
}

// ---------- Bắn ----------
function wdMuzzle(p) { return { x: p.x + p.w / 2, y: p.id === 1 ? p.y - 6 : p.y + p.h + 6 }; }
function wdFire(p) {
    if (!(p.ammo > 0) || (p.wdShotCd || 0) > 0) return false;
    p.ammo--; p.lastShot = Date.now();
    p.wdShotCd = Math.max(4, Math.round(WD_BASE_INT / wdRateMult(p)));
    const ch = p.wdCharge || 0, full = ch >= WD_MAXCH - 0.001, m = wdMuzzle(p);
    const dmg = Math.round(p.damage * (1 + ch) * 100) / 100;
    const sz = full ? 12 : 6 + Math.round(ch * 2.5);
    const sp = C.bulletSpeed * (full ? 2.1 : 1.25 + ch * 0.3);
    const e = wdEnemy(p);
    let vx = 0;
    if (e && e.hp > 0) { const v = aimVelocity(m.x, m.y, e, sp, true); vx = Math.max(-sp * 0.3, Math.min(sp * 0.3, v.vx)); }
    const vy = wdDir(p) * Math.sqrt(Math.max(1, sp * sp - vx * vx));
    spawnBullet(p, {
        w: sz, h: sz + (full ? 6 : 2), x: m.x - sz / 2, y: m.y - sz / 2, vx, vy, dmg, hook: 'wind',
        wdCh: Math.round(ch / WD_MAXCH * 100) / 100, wdFull: full, wdKb: full, isPiercing: full && wdE1(p),
    });
    // Liên Phong
    if ((p.wdSince || 0) <= WD_CHAIN) p.wdStacks = Math.min(wdMaxStacks(p), (p.wdStacks || 0) + 1);
    else p.wdStacks = 1;
    if (wdE1(p) && ch >= WD_MAXCH * 0.5) p.wdStacks = Math.max(p.wdStacks, 3);
    if (wdE1(p) && p.wdStacks >= wdMaxStacks(p)) p.wdSpdT = 60;
    if (ch > 0.3) {
        wdTxt(p, (full ? 'CUỒNG PHONG ' : 'NGƯNG PHONG ') + 'x' + (1 + ch).toFixed(1), full ? WD_GOLD : WD_MINT, full ? 14 : 11);
        spawnSparkParticles(m.x, m.y, full ? WD_GOLD : WD_MINT, full ? 12 : 5);
    } else spawnSparkParticles(m.x, m.y, WD_CYAN, 2);
    p.wdCharge = wdFull(p) ? ch * 0.5 : 0;
    p.wdSince = 0; p.wdRecoil = 6;
    wdSfx('playShoot');
    return true;
}

BulletHooks.register('wind', {
    hit(b, o, v, dealt) {
        if (!v || (v !== p1 && v !== p2) || v === o) return;
        spawnSparkParticles(b.x + b.w / 2, b.y + b.h / 2, b.wdFull ? WD_GOLD : WD_CYAN, b.wdFull ? 10 : 4);
        if (b.wdKb && v.hp > 0) { // đẩy lùi nhẹ theo hướng ngang của đạn
            const s = b.vx ? Math.sign(b.vx) : ((v.x + v.w / 2) < canvas.width / 2 ? -1 : 1);
            v.x = Math.max(0, Math.min(canvas.width - v.w, v.x + s * 14));
        }
        if (wdIs(o) && wdFull(o) && o.wdForm <= 0) {
            o.wdHits = (o.wdHits || 0) + 1;
            if (o.wdHits >= 6) { o.wdHits = 0; o.wdCd = Math.max(0, (o.wdCd || 0) - 90); wdTxt(o, 'GIÓ HỒI -1.5s', WD_MINT, 11, 12); }
        }
    },
    draw(b) { if (typeof wdDrawBullet === 'function') wdDrawBullet(b); },
});

// ---------- Hóa Gió ----------
function wdEnter(p) {
    p.wdForm = wdFormMax(p); p.wdFormAge = 0; p.wdStill = 0; p.wdFx = 18;
    wdTxt(p, 'HÓA GIÓ!', WD_MINT, 15);
    spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, WD_MINT, 14);
    wdSfx('playDash');
}
function wdExit(p, why) {
    if (!(p.wdForm > 0)) return;
    const age = p.wdFormAge || 0;
    p.wdForm = 0; p.wdStill = 0; p.wdCd = Math.max(0, wdCdMax(p) - (p.wdCdBank || 0)); p.wdCdBank = 0;
    p.wdBuff = wdBuffMax(p); p.wdStacks = Math.max(p.wdStacks || 0, 3); p.wdSince = 0;
    p.wdExitFx = 20;
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    wdTxt(p, why === 'shot' ? 'XUẤT KÍCH!' : 'HIỆN HÌNH', WD_WHITE, 13);
    spawnSparkParticles(cx, cy, WD_CYAN, 10);
    if (wdE2(p)) { // vòng gió đẩy lùi đạn thường ở gần
        p.wdRingFx = 24;
        const e = wdEnemy(p);
        if (e) for (const b of e.bullets) {
            if (b.isPiercing || b.isLazer || b.isRaycast) continue;
            const bx = b.x + (b.w || 0) / 2, by = b.y + (b.h || 0) / 2, d = Math.hypot(bx - cx, by - cy);
            if (d > 90) continue;
            const sp = Math.max(2, Math.hypot(b.vx || 0, b.vy || 0));
            b.vx = (bx - cx) / (d || 1) * sp; b.vy = (by - cy) / (d || 1) * sp;
            if (wdDir(p) * b.vy < 0) b.vy = -b.vy; // luôn đẩy về phía địch
        }
    }
    if (wdFull(p) && age >= 120) {
        p.shield = (p.shield || 0) + 1; p.wdShieldT = 240;
        wdTxt(p, 'KHIÊN GIÓ!', WD_MINT, 12, 14);
    }
}
function wdFormTick(p) {
    p.wdFormAge = (p.wdFormAge || 0) + 1;
    const moving = Math.abs(p.x - (p.wdLastX === undefined ? p.x : p.wdLastX)) > 0.1;
    if (moving) p.wdStill = 0; else p.wdStill = (p.wdStill || 0) + 1;
    if (p.wdStill >= WD_STILL) { wdExit(p, 'still'); return; }
    if (--p.wdForm <= 0) { p.wdForm = 1; wdExit(p, 'time'); return; }
    // Đạn địch xuyên qua luồng gió
    const e = wdEnemy(p);
    if (!e || !(wdE2(p) || wdFull(p))) return;
    for (let i = e.bullets.length - 1; i >= 0; i--) {
        const b = e.bullets[i];
        if (b.wdPass || !rectIntersect(b.x, b.y, b.w || 0, b.h || 0, p.x - 4, p.y - 4, p.w + 8, p.h + 8)) continue;
        b.wdPass = true;
        if (wdE2(p)) {
            p.wdCdBank = Math.min(wdCdMax(p), (p.wdCdBank || 0) + 30);
            if (p.ammo < p.maxAmmo) p.ammo++;
            p.wdCharge = Math.min(WD_MAXCH, (p.wdCharge || 0) + WD_MAXCH * 0.25);
            p.wdAbsFx = 10;
            spawnSparkParticles(b.x + (b.w || 0) / 2, b.y + (b.h || 0) / 2, WD_MINT, 4);
        }
        if (wdFull(p)) { // Áp Suất Chân Không
            const small = !b.isPiercing && !b.isLazer && (b.w || 0) <= 14 && (b.h || 0) <= 20;
            if (small) { e.bullets.splice(i, 1); spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, WD_WHITE, 3); }
            else b.vx = (b.vx || 0) + ((b.x < p.x + p.w / 2) ? -2.5 : 2.5);
        }
    }
}

// ---------- Tick chính (chạy cả khi bị choáng) ----------
function wdTick(p) {
    ['wdRecoil', 'wdFx', 'wdExitFx', 'wdRingFx', 'wdAbsFx', 'wdShotCd', 'wdSpdT'].forEach(k => { if (p[k] > 0) p[k]--; });
    if (p.hp <= 0 || gameState.phase !== 'playing') { p.wdLastX = p.x; return; }
    p.wdSince = (p.wdSince || 0) + 1;
    if (p.wdSince > WD_CHAIN && !(p.wdBuff > 0)) p.wdStacks = 0;
    if (p.wdBuff > 0) p.wdBuff--;
    if (p.wdSince > WD_CHARGE_DELAY && (p.wdCharge || 0) < WD_MAXCH)
        p.wdCharge = Math.min(WD_MAXCH, (p.wdCharge || 0) + 0.35 / 60 * (wdE1(p) ? 1.4 : 1) * (p.wdForm > 0 ? 2 : 1));
    if (p.wdForm > 0) wdFormTick(p);
    else if (p.wdCd > 0) p.wdCd--;
    if (p.wdShieldT > 0 && --p.wdShieldT <= 0 && p.shield > 0) p.shield--;
    // Nạp đạn riêng (theo tick, nhanh hơn theo Liên Phong / Hóa Gió)
    if (p.ammo < p.maxAmmo) {
        p.wdRl = (p.wdRl || 0) + wdReloadMult(p);
        if (p.wdRl >= WD_RELOAD) { p.wdRl = 0; p.ammo++; }
    } else p.wdRl = 0;
    p.wdLastX = p.x;
}

CharHooks.register('wind', {
    setup() {
        this.wdForm = 0; this.wdFormAge = 0; this.wdCd = 0; this.wdCdBank = 0; this.wdStill = 0; this.wdBuff = 0;
        this.wdCharge = 0; this.wdStacks = 0; this.wdSince = 999; this.wdShotCd = 0; this.wdRl = 0; this.wdSpdT = 0;
        this.wdHold = 0; this.wdPrevS = false; this.wdUsed = false; this.wdHits = 0; this.wdShieldT = 0;
        this.wdRecoil = 0; this.wdFx = 0; this.wdExitFx = 0; this.wdRingFx = 0; this.wdAbsFx = 0; this.wdLastX = this.x;
        this.reloadTime = 1e12; // nạp đạn do wdTick xử lý
    },
    speed(s) {
        if (this.wdForm > 0) return s * (1.35 + 0.2 * Math.min(1, (this.wdFormAge || 0) / wdFormMax(this)));
        if (this.wdSpdT > 0) return s * 1.15;
        return s;
    },
    beforeDamage(amount, attacker, options) {
        if (this.wdForm > 0) {
            if (!(this.wdImmT > 0) || Date.now() - this.wdImmT > 400) { this.wdImmT = Date.now(); addFloatingText(this.x + this.w / 2, this.y - 10, 'GIÓ 💨', WD_MINT, 12); }
            return true;
        }
    },
    shoot(inp) {
        const s = !!inp.s, press = s && !this.wdPrevS, rel = !s && this.wdPrevS;
        this.wdPrevS = s;
        if (this.wdForm > 0) {
            if (press) { wdExit(this, 'shot'); wdFire(this); this.wdUsed = true; }
            return true;
        }
        if (s) {
            if (this.wdUsed) return true;
            if (++this.wdHold >= WD_HOLD) {
                this.wdUsed = true; this.wdHold = 0;
                if (this.wdCd <= 0 && !isGrounded(this)) wdEnter(this);
                else if (this.wdCd > 0) wdTxt(this, 'HỒI ' + (this.wdCd / 60).toFixed(1) + 's', '#94a3b8', 11);
                else groundedBlock(this);
            }
        } else {
            if (rel && !this.wdUsed) wdFire(this);
            this.wdHold = 0; this.wdUsed = false;
        }
        return true;
    },
    roundEnd() { this.wdForm = 0; this.wdBuff = 0; this.wdShieldT = 0; },
});

(function () {
    const origU = Player.prototype.update;
    Player.prototype.update = function () {
        if (wdIs(this)) { try { wdTick(this); } catch (err) { console.error(err); } }
        return origU.apply(this, arguments);
    };
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        const before = this.hp;
        const r = origTD.apply(this, arguments);
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && wdIs(attacker)) wdSpawnFinisher(attacker, this);
        return r;
    };
})();

// Bot: 'form' = giữ để Hóa Gió | 'tap' = nhấp bắn | 'wait' = đứng tích Ngưng Phong | null = mặc định
function wdBotAction(p, e, aligned) {
    if (!wdIs(p) || !e || !(e.hp > 0)) return null;
    if (p.wdForm > 0) {
        if (aligned && (p.wdCharge || 0) >= 1.2 && p.ammo > 0) return 'tap';
        return 'glide';
    }
    if (p.wdCd <= 0 && !isGrounded(p)) {
        const cx = p.x + p.w / 2, my = p.id === 1 ? p.y : p.y + p.h;
        for (const b of e.bullets) {
            const vy = b.vy || 0;
            if (!(p.id === 1 ? vy > 0 : vy < 0)) continue;
            if (Math.abs(b.x + (b.w || 0) / 2 - cx) > p.w * 1.2) continue;
            const t = Math.abs(my - (b.y + (b.h || 0) / 2)) / Math.abs(vy);
            if (t >= WD_HOLD + 1 && t <= WD_HOLD + 14) return 'form';
        }
        if (p.hp <= p.maxHp * 0.5 && Math.random() < 0.01) return 'form';
    }
    if (!aligned || !(p.ammo > 0)) return 'wait';
    // xả loạt khi đang có Liên Phong / buff, hoặc khi Ngưng Phong đủ lớn
    if ((p.wdStacks || 0) > 0 || p.wdBuff > 0 || (p.wdCharge || 0) >= 0.9 || p.ammo >= p.maxAmmo) return 'tap';
    return 'wait';
}
