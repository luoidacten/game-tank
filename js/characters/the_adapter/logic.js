// ==========================================
// The Adapter (the_adapter) — Cỗ Máy Thích Nghi (docs/BODY_MOI_5.md #98)
// ------------------------------------------
// Thích Ứng Vai Trò (đầu hiệp, theo vai trò chính của địch) + VÒNG XOAY THÍCH ỨNG (nấc: mỗi 3.5s / Evo1 2.5s
//   hoặc mỗi 1.0 st nhận vào; -6% st nhận, +0.12 dame, +5% tốc chạy & nạp mỗi nấc; tối đa 6 / Evo1 8).
// PHÂN TÍCH TỬ HUYỆT: địch bắn 4 lần / mình trúng 2 lần -> +1 tầng Lộ Điểm Yếu (tối đa 5 / Evo2 7):
//   +7% st từ Adapter, đạn địch chậm 4%, nạp đạn địch chậm 4% mỗi tầng; 5 tầng: xuyên 50% Giảm Sát Thương của địch.
// Giữ 0.4s (hồi 7.5s): ÉP XUNG BẮT BÀI — +1 nấc, +0.3 HP, lướt ngang, Đạn Khai Thác Tử Huyệt (1.1 + 0.2/tầng, chậm 30% 1.5s).
// Trạng thái là trường thuần trên player / entity trong bodyEffects (đồng bộ online).
// ==========================================

const AD_GOLD = '#facc15', AD_CYAN = '#22d3ee', AD_RED = '#f43f5e', AD_WHITE = '#f8fafc', AD_LIME = '#a3e635';
const AD_HOLD = 24, AD_CD = 450;
const AD_ROLE_FX = {
    'Đối Đầu': { c: '#fb923c', n: 'ĐỐI ĐẦU: +0.5 HP & ĐẨY LÙI' },
    'Kiểm Soát': { c: '#c084fc', n: 'KIỂM SOÁT: PHÁ TRIỆU HỒI & KHÁNG CHẬM' },
    'Cơ Động': { c: '#22d3ee', n: 'CƠ ĐỘNG: +TỐC & ĐẠN NHANH' },
    'Sinh Tồn': { c: '#4ade80', n: 'SINH TỒN: CHỐNG HỒI MÁU & PHÁ GIÁP' },
};

function adE1(p) { return p.hasUpgrade('evo_adapter_1'); }
function adE2(p) { return p.hasUpgrade('evo_adapter_2'); }
function adFull(p) { return adE1(p) && adE2(p) && hasFullEvo(p, 'the_adapter'); }
function adIs(p) { return !!p && p.weapon === 'the_adapter'; }
function adEnemy(p) { return p === p1 ? p2 : p1; }
function adAlive(t) { return t && t.hp > 0; }
function adSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function adTxt(o, s, c, sz, dy) { addFloatingText(o.x + o.w / 2, o.y + (o.id === 1 ? -18 - (dy || 0) : o.h + 22 + (dy || 0)), s, c, sz || 12); }
function adCap(p) { return adE1(p) ? 8 : 6; }
function adWeakCap(p) { return adE2(p) ? 7 : 5; }
function adPerfect(p) { return adFull(p) && (p.adStacks || 0) >= 8; }
function adRole(p) { return p.adRole || ''; }
function adEnemyRole(e) {
    if (!e || typeof MODULES === 'undefined') return '';
    const m = MODULES.BODY.find(x => x.id === e.weapon);
    return (m && m.role && m.role[0]) || '';
}

// ---------- Entity: Kết liễu "PHÂN TÍCH HOÀN TẤT: 100% LỖI" ----------
class AdFinisher {
    constructor(owner, victim) {
        this.team = owner.id; this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.ox = owner.x + owner.w / 2; this.oy = owner.y + owner.h / 2; this.vw = victim.w;
        this.t = 0; this.dur = 165; this.active = true; this.boom = false;
    }
    update() {
        this.t++;
        if (this.t === 112 && !this.boom) {
            this.boom = true;
            if (typeof explosions !== 'undefined') explosions.push(new Explosion(this.x, this.y, 70, 'rgba(250,204,21,', 0, null));
            spawnSparkParticles(this.x, this.y, AD_GOLD, 26);
            spawnSparkParticles(this.x, this.y, AD_CYAN, 14);
            triggerScreenShake(14, 22);
            adSfx('playExplosion');
        }
        if (this.t >= this.dur) this.active = false;
    }
    draw() { if (typeof adDrawFinisherUnder === 'function') adDrawFinisherUnder(this); }
    drawOver() { if (typeof adDrawFinisherOver === 'function') adDrawFinisherOver(this); }
}
function adSpawnFinisher(p, v) {
    if (typeof bodyEffects === 'undefined' || bodyEffects.some(e => e instanceof AdFinisher)) return;
    bodyEffects.push(new AdFinisher(p, v));
    triggerScreenShake(6, 12);
    adSfx('playPowerup');
}

// ---------- Nấc Thích Ứng & Lộ Điểm Yếu ----------
function adAddStack(p, why) {
    const cap = adCap(p);
    if ((p.adStacks || 0) >= cap) return false;
    p.adStacks = (p.adStacks || 0) + 1; p.adClick = 20;
    if (why === 'dmg') {
        if (p.bleedTimer > 0 || p.burnTimer > 0 || p.poisonTimer > 0) {
            p.bleedTimer = 0; p.burnTimer = 0; p.burnStacks = 0; if (p.poisonTimer) p.poisonTimer = 0;
            adTxt(p, 'XOÁ ĐỐT/ĐỘC!', AD_LIME, 11, 14);
        }
        if ((p.adBurst || 0) >= 3) {
            p.gearWhiteShield = (p.gearWhiteShield || 0) + 0.3;
            adTxt(p, '+0.3 GIÁP TRẮNG', AD_WHITE, 11, 26);
        }
    }
    adTxt(p, 'CẠCH! NẤC ' + p.adStacks + '/' + cap, AD_GOLD, 12);
    if (adPerfect(p)) { adTxt(p, 'TRẠNG THÁI HOÀN MỸ!', AD_GOLD, 15, 14); triggerScreenShake(4, 8); }
    adSfx('playHit');
    return true;
}
function adAddWeak(p, e, n) {
    if (!adAlive(e)) return;
    const cap = adWeakCap(p), w0 = e.adWeak || 0;
    e.adWeak = Math.min(cap, w0 + (n || 1));
    if (e.adWeak > w0) {
        e.adWeakPop = 20;
        adTxt(e, 'LỘ ĐIỂM YẾU x' + e.adWeak, AD_RED, 12);
        if (e.adWeak >= 5 && w0 < 5) adTxt(e, 'ĐÃ BẮT BÀI HOÀN TOÀN!', AD_GOLD, 13, 14);
    }
}

// ---------- Bắn ----------
function adMuzzleY(p) { return p.id === 1 ? p.y - 12 : p.y + p.h + 2; }
function adBulletSpeed(p) { return C.bulletSpeed * 1.1 * (adRole(p) === 'Cơ Động' ? 1.3 : 1); }
function adFire(p, now) {
    if (!(p.ammo > 0) || now - (p.lastShot || 0) < 300) return;
    p.ammo--; p.lastShot = now; p.adRecoil = 8;
    const big = adPerfect(p) ? 1.5 : 1, w = 6 * big, h = 11 * big;
    spawnBullet(p, {
        w, h, x: p.x + p.w / 2 - w / 2, y: p.id === 1 ? p.y - h - 2 : p.y + p.h + 2,
        vy: (p.id === 1 ? -1 : 1) * adBulletSpeed(p), dmg: p.damage + 0.12 * (p.adStacks || 0),
        isPiercing: adPerfect(p), hook: 'the_adapter', adBig: big > 1,
    });
    adSfx('playShoot');
}
function adSkill(p) {
    const e = adEnemy(p);
    p.adCd = AD_CD; p.adSkillFx = 30;
    adAddStack(p, 'skill');
    p.hp = Math.min(p.maxHp, p.hp + 0.3);
    adTxt(p, 'ÉP XUNG BẮT BÀI! +0.3', AD_CYAN, 13, 14);
    // lướt ngang: tránh viên đạn địch gần nhất, không có thì chạy về phía rộng hơn
    let dir = (p.x + p.w / 2 < canvas.width / 2) ? 1 : -1;
    if (e && e.bullets && e.bullets.length) {
        let best = null, bd = 1e9;
        for (const b of e.bullets) { const d = Math.abs((b.y || 0) - (p.y + p.h / 2)); if (d < bd) { bd = d; best = b; } }
        if (best && bd < 220) dir = (best.x + (best.w || 0) / 2 < p.x + p.w / 2) ? 1 : -1;
        if (p.x < 30) dir = 1; else if (p.x > canvas.width - p.w - 30) dir = -1;
    }
    p.adDashT = 10; p.adDashDir = dir;
    const wk = (e && e.adWeak) || 0;
    spawnBullet(p, {
        w: 9, h: 16, x: p.x + p.w / 2 - 4.5, y: p.id === 1 ? p.y - 18 : p.y + p.h + 2,
        vy: (p.id === 1 ? -1 : 1) * adBulletSpeed(p) * 1.25, dmg: 1.1 + 0.2 * wk,
        isPiercing: adPerfect(p), hook: 'the_adapter', adExploit: true,
    });
    spawnSparkParticles(p.x + p.w / 2, adMuzzleY(p), AD_CYAN, 10);
    triggerScreenShake(4, 8);
    adSfx('playPowerup');
}

BulletHooks.register('the_adapter', {
    hit(b, o, v) {
        if (!adIs(o) || !v || (v !== p1 && v !== p2) || v === o) return;
        const role = adRole(o);
        if (role === 'Đối Đầu' && v.hp > 0 && v.weapon !== 'juggernaut') {
            const dir = (v.x + v.w / 2) >= (b.x + b.w / 2) ? 1 : -1;
            v.x = Math.max(0, Math.min(canvas.width - v.w, v.x + dir * 9));
        }
        if (b.adExploit) { v.adSlowT = 90; spawnSparkParticles(v.x + v.w / 2, v.y + v.h / 2, AD_RED, 12); }
        o.adHitCnt = (o.adHitCnt || 0) + 1;
        if (o.adHitCnt % 2 === 0) adAddWeak(o, v, 1);
        const wk = v.adWeak || 0;
        if (!b.adExploit && adE2(o) && wk >= 4 && o.hp > 0) {
            o.hp = Math.min(o.maxHp, o.hp + 0.15); v.adStealT = 90;
            adTxt(o, '+0.15 HÚT', AD_LIME, 10, 26);
        }
        if (adPerfect(o) && wk >= 7 && v.hp > 0) {
            v.takeDamage(0.4, o, { unavoidable: true, bypassShield: true, adTrue: true });
            spawnSparkParticles(v.x + v.w / 2, v.y + v.h / 2, AD_GOLD, 8);
        }
    },
    obstacle(b, o, obj, kind) {
        // Kiểm Soát: x2.5 dame lên vật triệu hồi / tường (bù thêm 1.5x phần đã trừ)
        if (!adIs(o) || adRole(o) !== 'Kiểm Soát' || !obj || kind === 'truck' || kind === 'crate') return;
        if (typeof obj.hp === 'number' && !obj.isImmortal && obj.active !== false) {
            obj.hp -= b.dmg * 1.5;
            if (obj.hp <= 0) obj.active = false;
        }
    },
    draw(b) { if (typeof adDrawBullet === 'function') adDrawBullet(b); },
});

// ---------- Tick chính ----------
function adInitRound(p) {
    const e = adEnemy(p);
    p.adInit = true;
    p.adRole = adEnemyRole(e);
    if (e) { e.adWeak = 0; e.adShotCnt = 0; e.adWeakPop = 0; e.adSlowT = 0; e.adStealT = 0; e.adSHold = 0; e.adSkCd = 0; e.adPrevHp = e.hp; e.adFrameN = 0; }
    if (p.adRole === 'Đối Đầu') { p.maxHp += 0.5; p.hp += 0.5; }
    if (adFull(p)) { p.adStacks = Math.max(p.adStacks, 2); if (e) e.adWeak = 1; }
    const f = AD_ROLE_FX[p.adRole];
    if (f) adTxt(p, 'QUÉT: ' + f.n, f.c, 11, 14);
    p.adPrevHp = p.hp; p.adPrevWs = p.gearWhiteShield || 0;
}
function adTick(p) {
    if (p.adRecoil > 0) p.adRecoil--;
    if (p.adClick > 0) p.adClick--;
    if (p.adSkillFx > 0) p.adSkillFx--;
    const e = adEnemy(p);
    if (e && e.adWeakPop > 0) e.adWeakPop--;
    if (p.hp <= 0 || gameState.phase !== 'playing') return;
    if (!p.adInit) adInitRound(p);
    p.adT = (p.adT || 0) + 1;
    if (p.adCd > 0) p.adCd--;
    const st = p.adStacks || 0;
    // Nấc theo thời gian
    p.adTimer = (p.adTimer || 0) + 1;
    if (p.adTimer >= (adE1(p) ? 150 : 210)) { p.adTimer = 0; adAddStack(p, 'time'); }
    // Nấc theo sát thương nhận vào (máu + Giáp Trắng mất, kể cả đốt/chảy máu)
    const ws = p.gearWhiteShield || 0;
    let lost = Math.max(0, (p.adPrevHp || p.hp) - p.hp) + Math.max(0, (p.adPrevWs || 0) - ws);
    if (p.adBurst > 0 && p.adT % 20 === 0) p.adBurst--;
    if (lost > 0.001) {
        p.adBurst = Math.min(6, (p.adBurst || 0) + 1);
        p.adDmgAcc = (p.adDmgAcc || 0) + lost;
        while (p.adDmgAcc >= 1.0) { p.adDmgAcc -= 1.0; adAddStack(p, 'dmg'); }
    }
    // Tốc nạp +5%/nấc
    if (st > 0 && p.ammo < p.maxAmmo && typeof p.lastReload === 'number') p.lastReload -= 16.67 * 0.05 * st * 1.2;
    // Lướt ngang
    if (p.adDashT > 0) { p.adDashT--; p.x = Math.max(0, Math.min(canvas.width - p.w, p.x + (p.adDashDir || 1) * 4.5)); }
    // Full: Khiên Thích Ứng mỗi 6s khi Hoàn Mỹ
    if (adPerfect(p)) {
        p.adShT = (p.adShT || 0) + 1;
        if (p.adShT >= 360) { p.adShT = 0; if ((p.shield || 0) < 2) { p.shield = (p.shield || 0) + 1; adTxt(p, 'KHIÊN THÍCH ỨNG', AD_GOLD, 11, 26); } }
    } else p.adShT = 0;
    p.adPrevHp = p.hp; p.adPrevWs = p.gearWhiteShield || 0;
    if (!adAlive(e)) return;
    const wk = e.adWeak || 0;
    // Đạn địch mới: đếm phát bắn & làm chậm đạn
    let fired = false;
    if (e.bullets) for (const b of e.bullets) {
        if (b.adMk) continue;
        b.adMk = 1; fired = true;
        if (wk > 0) { const k = 1 - 0.04 * wk; b.vx = (b.vx || 0) * k; b.vy = (b.vy || 0) * k; }
    }
    if (fired) { e.adShotCnt = (e.adShotCnt || 0) + 1; if (e.adShotCnt % 4 === 0) adAddWeak(p, e, 1); }
    // Nạp đạn địch chậm 4%/tầng
    if (wk > 0 && e.ammo < e.maxAmmo && typeof e.lastReload === 'number') e.lastReload += 16.67 * 0.04 * wk;
    // Sinh Tồn: -35% hồi máu của địch
    if (adRole(p) === 'Sinh Tồn' && typeof e.adPrevHp === 'number' && e.hp > e.adPrevHp && e.adPrevHp > 0) e.hp -= (e.hp - e.adPrevHp) * 0.35;
    e.adPrevHp = e.hp;
    // Làm chậm từ Đạn Khai Thác / cướp tốc
    if (e.adSlowT > 0) { e.adSlowT--; addStatusSlow(e, 0.7); }
    if (e.adStealT > 0) { e.adStealT--; addStatusSlow(e, 0.9); }
    // Evo 1: địch dùng kỹ năng Giữ Bắn -> +1 nấc & +1 tầng
    if (adE1(p) && typeof inputs !== 'undefined') {
        const I = e.id === 1 ? inputs.p1 : inputs.p2;
        if (e.adSkCd > 0) e.adSkCd--;
        if (I && I.s) e.adSHold = (e.adSHold || 0) + 1;
        else {
            if ((e.adSHold || 0) >= 24 && !(e.adSkCd > 0)) {
                e.adSkCd = 90; adAddStack(p, 'evo'); adAddWeak(p, e, 1);
                adTxt(p, 'PHÂN TÍCH CHIÊU THỨC!', AD_CYAN, 11, 26);
            }
            e.adSHold = 0;
        }
    }
}

CharHooks.register('the_adapter', {
    setup() {
        this.adStacks = 0; this.adTimer = 0; this.adDmgAcc = 0; this.adCd = 0; this.adHold = 0; this.adPrevS = false; this.adUsed = false;
        this.adHitCnt = 0; this.adInit = false; this.adRole = ''; this.adRecoil = 0; this.adClick = 0; this.adSkillFx = 0;
        this.adDashT = 0; this.adDashDir = 1; this.adBurst = 0; this.adShT = 0; this.adT = 0; this.lastShot = 0;
        this.adPrevHp = this.hp; this.adPrevWs = 0;
    },
    speed(cur) {
        let m = 1 + 0.05 * (this.adStacks || 0);
        if (adRole(this) === 'Cơ Động') m *= 1 + 0.3 / 3.6;
        const e = adEnemy(this);
        if (e && e.adStealT > 0) m *= 1.1;
        return cur * m;
    },
    shoot(inp, now) {
        const s = !!inp.s;
        this.adPrevS = s;
        if (s) {
            if (this.adUsed) return true;
            this.adHold++;
            if (this.adHold >= AD_HOLD) {
                this.adUsed = true; this.adHold = 0;
                if (this.adCd <= 0) adSkill(this);
                else adTxt(this, 'HỒI ' + (this.adCd / 60).toFixed(1) + 's', '#94a3b8', 11);
            }
        } else {
            if (this.adHold > 0 && !this.adUsed) adFire(this, now);
            this.adHold = 0; this.adUsed = false;
        }
        return true;
    },
});

// ---------- Bọc update: tick Adapter ----------
(function () {
    const origU = Player.prototype.update;
    Player.prototype.update = function () {
        if (adIs(this)) { try { adTick(this); } catch (err) { console.error(err); } }
        return origU.apply(this, arguments);
    };
})();

// ---------- Bọc takeDamage: Giảm st theo nấc, Lộ Điểm Yếu, phá Giáp Trắng, kết liễu ----------
(function () {
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        const o = options || {};
        if (adIs(this) && attacker && attacker !== this && typeof amount === 'number') amount *= Math.max(0.2, 1 - 0.06 * (this.adStacks || 0));
        if (adIs(attacker) && attacker !== this && !o.adTrue && typeof amount === 'number') {
            const wk = this.adWeak || 0;
            amount *= 1 + 0.07 * wk;
            // 5+ tầng: xuyên 50% Giảm Sát Thương của địch (các nguồn giảm st theo hệ số đã biết)
            if (wk >= 5) {
                let red = 0;
                if (adIs(this)) red = Math.min(0.8, 0.06 * (this.adStacks || 0));
                else if (this.weapon === 'tank' && this.dashState > 0) red = this.hasUpgrade('evo_tank_1') ? 0.8 : 0.65;
                else if (this.weapon === 'shadow_hunter' && this.stealthActive) red = 0.5;
                if (red > 0) amount *= (1 - red / 2) / (1 - red);
            }
            if (adRole(attacker) === 'Sinh Tồn' && (this.gearWhiteShield || 0) > 0) amount += 0.3;
        }
        const before = this.hp;
        const r = origTD.call(this, amount, attacker, options);
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && adIs(attacker)) adSpawnFinisher(attacker, this);
        return r;
    };
})();

// ---------- Kiểm Soát: -35% hiệu ứng Làm Chậm nhận vào ----------
(function () {
    if (typeof addStatusSlow !== 'function') return;
    const origS = addStatusSlow;
    addStatusSlow = function (p, mult) {
        if (adIs(p) && adRole(p) === 'Kiểm Soát' && mult < 1) mult = 1 - (1 - mult) * 0.65;
        return origS(p, mult);
    };
})();

// Bot: 'skill' (giữ 0.4s) | 'tap' | null
function adBotAction(p, e, aligned) {
    if (!adIs(p) || !adAlive(e)) return null;
    if (p.adCd <= 0) {
        let danger = false;
        if (e.bullets) for (const b of e.bullets) if (Math.abs(b.y - (p.y + p.h / 2)) < 120 && Math.abs(b.x - (p.x + p.w / 2)) < 26) { danger = true; break; }
        if (danger || (aligned && Math.random() < 0.05)) return 'skill';
    }
    if (aligned && p.ammo > 0 && Date.now() - (p.lastShot || 0) >= 320) return 'tap';
    return null;
}
