// ==========================================
// Cuồng Chiến Binh (berserker) — Logic
// ------------------------------------------
// HP 6 | Dame 0.25 | Đạn ∞ | Tốc 4.2 | 30×30
//  - Cuồng Chiến: mốc theo % Max HP (75/50/25%) THAY THẾ nhau: +tốc bắn, -sát thương nhận, +tốc chạy, +dame.
//    > 50% HP: bắn nhấp; <= 50% (hoặc Huyết Chiến): giữ để sấy (nhanh dần, toả 0° -> 28° sau 1.5s).
//  - Đánh Trả: nhận >= 0.25 sát thương (kể cả mất Khiên) -> +25% tốc chạy 1.5s, +12 Huyết Chiến, viên kế tiếp = Huyết Đạn (16×16, x3 dame).
//  - Huyết Chiến (0..100): đầy + nhận đòn chí tử -> khoá máu, sát thương x10 trừ vào thanh, -12/s, +2 mỗi phát trúng,
//    ngoài vùng an toàn của Bo -40/s. Hết thanh -> chết (Full Evo: Tàn Hơi Cuối Cùng, 0.5 HP, tối đa 2 lần/hiệp).
//  - Evo 1: Cuồng Chiến x1.5 (giảm st tối đa 45%), tích thanh +25%, giữ thanh 100 trong 1s đầu.
//  - Evo 2: Đấu Trường Huyết Địa (BersArena, 260px) khoá di chuyển 2 xe + cổng Portal trong vùng.
//  - Full: x1.8 (tối đa 50%), giữ 1.5s, vùng 220px + làm chậm địch 25%, Tàn Hơi Cuối Cùng.
// Mọi trạng thái là số/boolean trên player hoặc BersArena (có trong NET_CLASSES) -> đồng bộ online được.
// ==========================================

const BERS_RED = '#ff2d3d', BERS_ORANGE = '#ff8a1f', BERS_GOLD = '#ffd166';
const BERS_TIERS = [null,
    { fr: 0.15, red: 0.10, spd: 0.08, dmg: 0.15 },
    { fr: 0.30, red: 0.20, spd: 0.15, dmg: 0.30 },
    { fr: 0.50, red: 0.30, spd: 0.25, dmg: 0.50 },
];
const BERS_RAMP = 90; // 1.5s để sấy đạt tốc tối đa & toả 28°

function bersE1(p) { return p.hasUpgrade('evo_bers_1'); }
function bersE2(p) { return p.hasUpgrade('evo_bers_2'); }
function bersFull(p) { return bersE1(p) && bersE2(p); }
function bersEnemy(p) { return p === p1 ? p2 : p1; }
function bersSfx(name) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[name]) soundSystem[name](); }
function bersHpFrac(p) { return p.maxHp > 0 ? p.hp / p.maxHp : 1; }
function bersTier(p) {
    if (p.bersHC) return 3;
    const f = bersHpFrac(p);
    return f <= 0.25 ? 3 : (f <= 0.5 ? 2 : (f <= 0.75 ? 1 : 0));
}
function bersStats(p) {
    const T = BERS_TIERS[bersTier(p)];
    const o = { fr: 0, red: 0, spd: 0, dmg: 0 };
    if (T) {
        const full = bersFull(p), e1 = bersE1(p);
        const m = full ? 1.8 : (e1 ? 1.5 : 1), cap = full ? 0.5 : (e1 ? 0.45 : 0.3);
        o.fr = T.fr * m; o.red = Math.min(cap, T.red * m); o.spd = T.spd * m; o.dmg = T.dmg * m;
    }
    if (p.bersHC) { o.fr += 0.35; o.spd += 0.20; o.dmg += 0.30; }
    return o;
}
function bersSpray(p) { return !!p.bersHC || bersHpFrac(p) <= 0.5; }

// Giảm sát thương nhận vào qua permanentVulnerability (giữ nguyên phần cộng thêm từ body khác)
function bersSyncPv(p) {
    const cur = p.permanentVulnerability || 0;
    if (Math.abs(cur - (p.bersPvSet || 0)) > 1e-9) p.bersPvBase = (p.bersPvBase || 0) + (cur - (p.bersPvSet || 0));
    const red = bersStats(p).red;
    p.permanentVulnerability = (1 + (p.bersPvBase || 0)) * (1 - red) - 1;
    p.bersPvSet = p.permanentVulnerability;
}

function bersGain(p, amt) {
    if (p.bersHC) return;
    if (bersE1(p)) amt *= 1.25;
    p.bersBar = Math.min(100, (p.bersBar || 0) + amt);
}

// Đánh Trả: nhận >= 0.25 sát thương trực tiếp
function bersCounter(p, raw) {
    if (!(raw >= 0.25 - 1e-6)) return;
    p.bersRageT = 90;
    if (!p.bersBloodReady) {
        p.bersBloodReady = true;
        spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, BERS_RED, 8);
    }
    if (!p.bersHC) bersGain(p, 12);
}

function bersOutsideZone(p) {
    if (typeof getZoneState !== 'function' || !gameState.roundStartTime) return false;
    const zs = getZoneState(Date.now() - gameState.roundStartTime);
    return !!zs && (p.x < zs.x0 || p.x + p.w > zs.x1);
}

function bersDrain(p, pts) {
    if (!p.bersHC || p.bersGrace > 0) return;
    p.bersBar = Math.max(0, p.bersBar - pts);
}

const BERS_CC = ['freezeTimer', 'slowTimer', 'silenceTimer', 'confusionTimer', 'blindTimer', 'bindingCurseTimer', 'stunTimer', 'rootTimer', 'burnTimer', 'acidBurnTimer', 'bleedTimer'];
function bersEnterHC(p) {
    p.bersHC = true;
    p.bersHCCount = (p.bersHCCount || 0) + 1;
    p.bersLockHp = Math.max(0.3, Math.min(1, p.hp));
    p.hp = p.bersLockHp;
    p.bersBar = 100;
    p.bersGrace = bersFull(p) ? 90 : (bersE1(p) ? 60 : 0);
    p.bersHold = 0;
    BERS_CC.forEach(k => { if (p[k] > 0) p[k] = 0; });
    if (p.isFrozen) p.isFrozen = false;
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    if (bersE2(p)) bodyEffects.push(new BersArena(p, cx, bersFull(p) ? 110 : 130, bersFull(p)));
    explosions.push(new Explosion(cx, cy, 70, 'rgba(255, 45, 61,', 0, p));
    spawnSparkParticles(cx, cy, BERS_RED, 26);
    addFloatingText(cx, p.id === 1 ? p.y - 20 : p.y + p.h + 22, 'HUYẾT CHIẾN!', BERS_RED, 16);
    triggerScreenShake(9, 16);
    bersSfx('playPowerup');
}

function bersEndHC(p) {
    p.bersHC = false; p.bersBar = 0; p.bersGrace = 0;
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    if (bersFull(p) && (p.bersRevives || 0) < 2) {
        p.bersRevives = (p.bersRevives || 0) + 1;
        p.bersLastBreath = true;
        p.hp = 0.5;
        p.invincibleTimer = Math.max(p.invincibleTimer || 0, 45);
        explosions.push(new Explosion(cx, cy, 45, 'rgba(255, 209, 102,', 0, p));
        spawnSparkParticles(cx, cy, BERS_GOLD, 18);
        addFloatingText(cx, p.id === 1 ? p.y - 20 : p.y + p.h + 22, `TÀN HƠI ${p.bersRevives}/2`, BERS_GOLD, 14);
        bersSfx('playRevive');
        return;
    }
    p.hp = 0; p.ghostHp = 0;
    spawnSparkParticles(cx, cy, BERS_RED, 20);
    if (gameState.phase === 'playing') triggerFatalCinematic(bersEnemy(p).id, p);
}

function bersFire(p, angDeg, st) {
    const blood = !!p.bersBloodReady;
    p.bersBloodReady = false;
    const dir = p.id === 1 ? -1 : 1;
    let spd = C.bulletSpeed * ((typeof gameState !== 'undefined' && gameState.currentMap === 'overdrive') ? 1.5 : 1);
    if (blood) spd *= 0.9;
    const a = angDeg * Math.PI / 180;
    const sz = blood ? 16 : 6;
    const dmg = (p.damage + (p.dmgBuff || 0)) * (blood ? 3 : 1) * (1 + st.dmg);
    spawnBullet(p, {
        x: p.x + p.w / 2 - sz / 2, y: p.id === 1 ? p.y - sz - 2 : p.y + p.h + 2, w: sz, h: sz,
        vx: Math.sin(a) * spd, vy: dir * Math.cos(a) * spd, dmg, hook: 'bers', isBersBlood: blood,
    });
    p.lastShot = Date.now();
    p.bersRecoil = blood ? 6 : 3;
    if (blood) {
        spawnSparkParticles(p.x + p.w / 2, p.id === 1 ? p.y : p.y + p.h, BERS_RED, 6);
        bersSfx('playExplosion');
    } else bersSfx('playShoot');
}

BulletHooks.register('bers', {
    hit(b, attacker, victim) {
        if (!attacker || attacker.weapon !== 'berserker' || victim === attacker) return;
        if (attacker.bersHC) attacker.bersBar = Math.min(100, attacker.bersBar + 2);
        else if (attacker.bersLastBreath) attacker.bersBar = Math.min(100, (attacker.bersBar || 0) + 1);
        else bersGain(attacker, 4);
        if (b.isBersBlood) {
            explosions.push(new Explosion(b.x + b.w / 2, b.y + b.h / 2, 26, 'rgba(255, 45, 61,', 0, attacker));
            spawnSparkParticles(b.x + b.w / 2, b.y + b.h / 2, BERS_RED, 10);
        }
    },
});

// ==========================================
// Evo 2: Đấu Trường Huyết Địa — 2 bức tường biên trái/phải
// ==========================================
class BersArena {
    constructor(owner, cx, half, slow) {
        this.owner = owner;
        const W = canvas.width;
        const w = Math.min(W, half * 2);
        let x0 = cx - w / 2;
        x0 = Math.max(0, Math.min(W - w, x0));
        this.x0 = x0; this.x1 = x0 + w;
        this.slow = !!slow;
        this.on = true;
        this.t = 0;
        this.fade = 20;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.t++;
        const o = this.owner;
        if (this.on && (!o || !o.bersHC || o.hp <= 0 || gameState.phase !== 'playing')) this.on = false;
        if (!this.on) { if (--this.fade <= 0) this.active = false; return; }
        const enemy = bersEnemy(o);
        // Full Evo: làm chậm 25% kẻ địch trong vùng
        if (this.slow && enemy && enemy.x + enemy.w > this.x0 && enemy.x < this.x1) addStatusSlow(enemy, 0.75);
        // Tường cứng với Cổng Không Gian: cổng không thể mở ra ngoài vùng
        if (typeof PortalGate !== 'undefined') {
            for (const g of bodyEffects) {
                if (g instanceof PortalGate && g.active) g.x = Math.max(this.x0 + 14, Math.min(this.x1 - 14, g.x));
            }
        }
    }
    draw() { if (typeof bersDrawArena === 'function') bersDrawArena(this); }
}

// Khoá vị trí 2 xe trong vùng — chạy sau khi cả 2 xe đã di chuyển (trong commitStatuses cuối tick).
// Xe đang ở ngoài vùng lúc vùng mở bị đẩy dần vào trong (6px/tick) và không thể đi xa thêm.
function bersArenaClamp(p) {
    if (!p || typeof bodyEffects === 'undefined' || !bodyEffects.length) return;
    for (const e of bodyEffects) {
        if (!(e instanceof BersArena) || !e.on) continue;
        const lo = e.x0, hi = e.x1 - p.w;
        if (hi < lo) continue;
        const prev = typeof p._lastX === 'number' ? p._lastX : p.x;
        if (p.x < lo) p.x = Math.min(lo, Math.max(p.x, prev) + 6);
        else if (p.x > hi) p.x = Math.max(hi, Math.min(p.x, prev) - 6);
    }
}
(function () {
    if (typeof commitStatuses !== 'function') return;
    const orig = commitStatuses;
    commitStatuses = function (p) { bersArenaClamp(p); return orig(p); };
})();

// ==========================================
// Hook
// ==========================================
CharHooks.register('berserker', {
    setup() {
        this.maxAmmo = 999; this.ammo = 999;
        this.bersBar = 0; this.bersHC = false; this.bersGrace = 0; this.bersLockHp = 1; this.bersHCCount = 0;
        this.bersRageT = 0; this.bersBloodReady = false; this.bersCd = 0; this.bersHold = 0; this.bersPrevS = false;
        this.bersQueued = 0; this.bersRevives = 0; this.bersLastBreath = false; this.bersRecoil = 0;
        this.bersPvBase = this.permanentVulnerability || 0; this.bersPvSet = this.bersPvBase;
        this.bersTick = 0; this.bersLastTier = 0; this.bersOut = false;
        bersSyncPv(this);
    },
    update() {
        this.bersTick++;
        if (this.bersRageT > 0) this.bersRageT--;
        if (this.bersCd > 0) this.bersCd--;
        if (this.bersQueued > 0) this.bersQueued--;
        if (this.bersRecoil > 0) this.bersRecoil--;
        this.ammo = this.maxAmmo;
        if (this.bersHC) {
            this.hp = this.bersLockHp;
            if (this.bersGrace > 0) { this.bersGrace--; this.bersBar = 100; }
            else this.bersBar -= 12 / 60;
            this.bersOut = bersOutsideZone(this);
            if (this.bersOut) this.bersBar -= 40 / 60; // Bo Đột Tử: bất tử không chặn được
            if (this.bersBar <= 0) bersEndHC(this);
        } else this.bersOut = false;
        // Đổi mốc Cuồng Chiến -> hiệu ứng ngắn
        const tier = bersTier(this);
        if (tier > (this.bersLastTier || 0) && !this.bersHC && this.hp > 0) {
            const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
            explosions.push(new Explosion(cx, cy, 22 + tier * 8, 'rgba(255, 138, 31,', 0, this));
            addFloatingText(cx, this.id === 1 ? this.y - 14 : this.y + this.h + 18, 'CUỒNG ' + ['', 'I', 'II', 'III'][tier], BERS_ORANGE, 12);
        }
        this.bersLastTier = tier;
        bersSyncPv(this);
    },
    speed(s) {
        const st = bersStats(this);
        return s * (1 + st.spd + (this.bersRageT > 0 ? 0.25 : 0));
    },
    shoot(inp, now) {
        const s = !!inp.s;
        const pressed = s && !this.bersPrevS;
        this.bersPrevS = s;
        const st = bersStats(this);
        const rate = 1 + st.fr;
        if (!bersSpray(this)) {
            this.bersHold = 0;
            if (pressed) this.bersQueued = 10; // nhấp sớm một chút vẫn được tính
            if (this.bersQueued > 0 && this.bersCd <= 0) {
                bersFire(this, 0, st);
                this.bersCd = Math.round(30 / rate);
                this.bersQueued = 0;
            }
            return true;
        }
        if (s) {
            this.bersHold++;
            const k = Math.min(1, (this.bersHold - 1) / BERS_RAMP);
            if (this.bersCd <= 0) {
                const spread = 28 * k;
                bersFire(this, (Math.random() * 2 - 1) * spread / 2, st);
                this.bersCd = Math.max(2, Math.round((14 - 7 * k) / rate));
            }
        } else this.bersHold = 0;
        return true;
    },
    beforeDamage(amount, attacker, options) {
        bersSyncPv(this);
        if (!this.bersHC) return false;
        const env = options && options.isEnvironmental;
        if (!env) {
            const real = Math.max(0.05, amount * (1 + (this.permanentVulnerability || 0)) * (1 + (this.statusVuln || 0)));
            bersDrain(this, real * 10);
            bersCounter(this, amount);
            addFloatingText(this.x + this.w / 2, this.y - 10, this.bersGrace > 0 ? 'BẤT BẠI' : '-' + Math.round(real * 10), this.bersGrace > 0 ? BERS_GOLD : BERS_RED, 13);
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, BERS_RED, 5);
            if (this.bersBar <= 0) bersEndHC(this);
        }
        return true;
    },
    shieldBreak(attacker, options) {
        if (!(options && options.isEnvironmental)) bersCounter(this, 0.25);
    },
    beforeLethal(dmg, attacker) {
        if (this.bersHC) {
            bersDrain(this, dmg * 10);
            this.hp = this.bersLockHp;
            if (this.bersBar <= 0) bersEndHC(this);
            return true;
        }
        if ((this.bersBar || 0) >= 100 - 1e-6) { bersEnterHC(this); return true; }
        return false;
    },
    damaged(dmg) {
        if (this.bersHC) { // đòn không thể né lọt qua -> vẫn khoá máu, trừ vào thanh
            this.hp = this.bersLockHp;
            bersDrain(this, dmg * 10);
            if (this.bersBar <= 0) bersEndHC(this);
            return;
        }
        const raw = this.permanentVulnerability > -1 ? dmg / (1 + this.permanentVulnerability) : dmg;
        bersCounter(this, raw);
    },
});
