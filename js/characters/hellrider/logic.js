// ==========================================
// Hellrider — Chiến Xa Địa Ngục (hellrider) — Logic: "Tốc độ chính là sát thương!"
// Nội tại 1: giữ chạy ngang -> tích gia tốc 3.0 -> 5.6. Mỗi 0.2 tốc vượt 3.0 (đọc tốc ĐỘ THẬT hiện tại, gồm đồ Shop/Gear/Nitro)
//   cho đạn +0.07 dame, +5% tốc đạn, +4% cỡ đạn.
// Nội tại 2: chạm mép Trái/Phải -> tự đảo chiều (Drift), giữ nguyên đà, +0.4 tốc 1.5s. Tốc >= 4.8: BỐC LỬA
//   (giảm 25% sát thương nhận, đạn Thiêu Đốt 0.2 HP/s 1.5s).
// Kỹ năng: giữ bắn 0.4s -> Rồ Ga Nitro (CD 5s): 2.5s +30% tốc, +1 đạn, phát tiếp theo là Đạn Xích Lửa xuyên vật cản.
// Evo1: gia tốc nhanh +50%, +0.09 dame/bậc, mỗi Drift +1 đạn & +0.6 tốc. Evo2: trần tốc 6.2, bốc lửa miễn Làm Chậm, giảm 35%.
// FULL EVO: mỗi Drift / Nitro phun 2 Cầu Lửa ống xả (50% dame); tốc >= 6.0 đạn xuyên khiên 50%.
// Trạng thái: trường thuần trên player/đạn -> đồng bộ online.
// ==========================================

const HL_BASE = 3.0, HL_HOLD = 24, HL_CD = 300, HL_NITRO = 150, HL_FIRE_SPD = 4.8;
const HL_ORG = '#fb923c', HL_RED = '#ef4444', HL_YEL = '#fde047';

function hlE1(p) { return p.hasUpgrade('evo_hell_1'); }
function hlE2(p) { return p.hasUpgrade('evo_hell_2'); }
function hlFull(p) { return hlE1(p) && hlE2(p) && hasFullEvo(p, 'hellrider'); }
function hlIs(p) { return p && p.weapon === 'hellrider'; }
function hlSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function hlTxt(p, s, c, sz) { addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -20 : p.h + 24), s, c, sz || 12); }
function hlSpeedNow(p) { return p.hlSpd > 0 ? p.hlSpd : p.speed; }
function hlSteps(p) { return Math.max(0, (hlSpeedNow(p) - HL_BASE) / 0.2); }
function hlConv(p) { return hlE1(p) ? 0.09 : 0.07; }
function hlOnFire(p) { return hlSpeedNow(p) >= HL_FIRE_SPD && p.hp > 0; }
function hlDR(p) { return hlOnFire(p) ? (hlE2(p) ? 0.35 : 0.25) : 0; }

function hlBullet(p, o) {
    const k = hlSteps(p), dir = p.id === 1 ? -1 : 1;
    const size = Math.min(14, 6 * (1 + 0.04 * k));
    return spawnBullet(p, Object.assign({
        x: p.x + p.w / 2 - size / 2, y: p.id === 1 ? p.y - 8 : p.y + p.h + 2, w: size, h: size,
        vx: 0, vy: dir * C.bulletSpeed * Math.min(3, 1 + 0.05 * k), dmg: p.damage + k * hlConv(p), hook: 'hellrider',
        hlBurn: hlOnFire(p), hlPierce: hlFull(p) && hlSpeedNow(p) >= 6.0,
    }, o));
}

function hlShoot(p) {
    const chain = p.hlChain > 0;
    hlBullet(p, chain ? { isPiercing: true, hlChain: true } : {});
    if (chain) p.hlChain = 0;
    p.ammo--; p.lastShot = Date.now(); p.hlRecoil = 6;
    hlSfx('playShoot');
}

// Cầu Lửa ống xả (Full Evo): 2 quả bay dọc lên sân địch, 50% dame đạn hiện tại
function hlExhaust(p) {
    if (!hlFull(p)) return;
    const dmg = (p.damage + hlSteps(p) * hlConv(p)) * 0.5, dir = p.id === 1 ? -1 : 1;
    for (const ox of [-9, 9]) {
        spawnBullet(p, { x: p.x + p.w / 2 + ox - 5, y: p.id === 1 ? p.y - 6 : p.y + p.h + 2, w: 10, h: 10, vy: dir * C.bulletSpeed * 1.3, dmg, hook: 'hellrider', hlBall: true, hlBurn: true });
    }
    hlTxt(p, 'CẦU LỬA!', HL_ORG, 11);
}

function hlDrift(p) {
    p.hlRev = !p.hlRev; p.hlBounceCd = 18;
    p.hlBoostT = 90; p.hlBoost = hlE1(p) ? 1.0 : 0.4;
    if (hlE1(p)) p.ammo = Math.min(p.maxAmmo, p.ammo + 1);
    spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, HL_ORG, 10);
    hlTxt(p, 'DRIFT!', HL_YEL, 12);
    hlSfx('playClick'); triggerScreenShake(2, 5);
    hlExhaust(p);
}

function hlNitro(p) {
    p.hlNitroT = HL_NITRO; p.hlCd = HL_CD; p.hlChain = 1;
    p.ammo = Math.min(p.maxAmmo, p.ammo + 1);
    if (p.hlHeld) p.hlRev = !p.hlRev;       // bẻ lái giữ nguyên đà
    hlTxt(p, 'RỒ GA NITRO!', HL_RED, 13);
    explosions.push(new Explosion(p.x + p.w / 2, p.y + p.h / 2, 40, 'rgba(239, 68, 68,', 0, null));
    hlSfx('playClick'); triggerScreenShake(3, 8);
    hlExhaust(p);
}

BulletHooks.register('hellrider', {
    hit(b, attacker, victim) {
        if (!b.hlBurn || !victim) return;
        if (!(victim.bleedTimer > 0)) victim.bleedDmg = 0.04;
        victim.bleedTimer = Math.max(victim.bleedTimer || 0, 90);
    },
});

CharHooks.register('hellrider', {
    setup() {
        this.hlAcc = 0; this.hlIdle = 0; this.hlHeld = ''; this.hlRev = false; this.hlBounceCd = 0;
        this.hlBoostT = 0; this.hlBoost = 0; this.hlNitroT = 0; this.hlCd = 0; this.hlChain = 0; this.hlSpd = this.speed;
        this.hlHold = 0; this.hlPrevS = false; this.hlUsed = false; this.hlRecoil = 0; this.hlTrail = 0;
    },
    update(inp, eff) {
        if (this.hlCd > 0) this.hlCd--;
        if (this.hlBounceCd > 0) this.hlBounceCd--;
        if (this.hlRecoil > 0) this.hlRecoil--;
        if (this.hlBoostT > 0) this.hlBoostT--;
        if (this.hlNitroT > 0) this.hlNitroT--;
        const i = eff || inp;
        const held = (i.l && !i.r) ? 'l' : (i.r && !i.l) ? 'r' : '';
        if (held !== this.hlHeld) { this.hlRev = false; this.hlHeld = held; }
        // gia tốc
        const cap = hlE2(this) ? 3.2 : 2.6, rate = hlE1(this) ? 0.054 : 0.036;
        if (held) { this.hlIdle = 0; this.hlAcc = Math.min(cap, this.hlAcc + rate); }
        else if (++this.hlIdle > 15) this.hlAcc = Math.max(0, this.hlAcc - 0.06);
        if (this.hlAcc > cap) this.hlAcc = cap;
        // Drift bật tường (giữ nguyên đà)
        if (held && this.hlBounceCd <= 0) {
            const dir = (held === 'l' ? -1 : 1) * (this.hlRev ? -1 : 1);
            if ((dir < 0 && this.x <= 1) || (dir > 0 && this.x + this.w >= canvas.width - 1)) hlDrift(this);
        }
        // miễn Làm Chậm khi bốc lửa (Evo2)
        if (hlE2(this) && hlOnFire(this)) {
            this.slowTimer = 0; this.acidBurnTimer = 0; this.acidZoneSlow = 0;
            if (this.statusSpeedMult !== undefined && this.statusSpeedMult < 1) this.statusSpeedMult = 1;
        }
        if (hlOnFire(this) && (this.hlTrail = (this.hlTrail || 0) + 1) % 4 === 0)
            spawnSparkParticles(this.x + this.w / 2, this.y + (this.id === 1 ? this.h : 0), HL_ORG, 1);
    },
    speed(cur) {
        if (!(cur > 0)) { this.hlSpd = cur; return cur; }
        let s = cur + this.hlAcc + (this.hlBoostT > 0 ? this.hlBoost : 0);
        if (this.hlNitroT > 0) s = Math.min(s * 1.3, (hlE2(this) ? 8.3 : 7.7) + Math.max(0, cur - HL_BASE) * 1.3);   // Nitro +30% (trần 7.7 / Evo2 8.3)
        this.hlSpd = s;
        return this.hlRev ? -s : s;     // âm = chạy ngược hướng đang bấm (Drift)
    },
    shoot(inp) {
        const s = !!inp.s;
        if (this.silenceTimer > 0 || this.freezeTimer > 0) { this.hlHold = 0; this.hlPrevS = s; return true; }
        if (s) {
            this.hlHold++;
            if (this.hlHold >= HL_HOLD && !this.hlUsed && this.hlCd <= 0) { hlNitro(this); this.hlUsed = true; }
        } else {
            if (this.hlPrevS && !this.hlUsed && this.ammo > 0) hlShoot(this);
            this.hlHold = 0; this.hlUsed = false;
        }
        this.hlPrevS = s;
        return true;
    },
});

// Giảm sát thương khi Bốc Lửa + Đạn Xuyên Khiên 50% (Full Evo) + Kết liễu
(function () {
    if (typeof Player === 'undefined') return;
    const orig = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        if (hlIs(this) && !(options && options.unavoidable)) amount *= (1 - hlDR(this));
        const gb = options && options.gearBullet;
        if (gb && gb.hook === 'hellrider' && gb.hlPierce && this.shield > 0 && !options.bypassShield && gb.owner) {
            gb.owner.hlPierceN = (gb.owner.hlPierceN || 0) + 1;
            if (gb.owner.hlPierceN % 2 === 0) options = Object.assign({}, options, { bypassShield: true });
        }
        const before = this.hp;
        const r = orig.call(this, amount, attacker, options);
        if (before > 0 && this.hp <= 0 && typeof bodyEffects !== 'undefined') {
            const a = typeof bfAttacker === 'function' ? bfAttacker(attacker) : (attacker instanceof Player ? attacker : null);
            if (a && a !== this && hlIs(a) && !(typeof finisherFxActive === 'function' && finisherFxActive())) {
                const fc = typeof fatalCinematic !== 'undefined' ? fatalCinematic : null;
                if (!(fc && fc.active && (a.id !== fc.winnerId || fc.fxSeen))) bodyEffects.push(new HlFinisher(a, this));
            }
        }
        return r;
    };
})();

// ---------- Kết liễu: HIGHWAY TO HELL ----------
const HLF_DUR = 170, HLF_HIT = 52;
class HlFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.ox = owner.x + owner.w / 2; this.oy = owner.y + owner.h / 2;
        this.t = 0; this.dur = HLF_DUR; this.active = true;
    }
    update() {
        this.t++;
        if (this.t === 4) hlSfx('playClick');
        if (this.t === HLF_HIT) {
            explosions.push(new Explosion(this.x, this.y, 100, 'rgba(251, 146, 60,', 0, null));
            explosions.push(new Explosion(this.x, this.y, 60, 'rgba(239, 68, 68,', 0, null));
            spawnSparkParticles(this.x, this.y, HL_ORG, 28); spawnSparkParticles(this.x, this.y, HL_YEL, 16);
            triggerScreenShake(15, 24); hlSfx('playExplosion');
        }
        if (this.t === 100) hlSfx('playWin');
        if (this.t >= this.dur) this.active = false;
    }
    draw() { }
    drawOver() { if (typeof hlDrawFinisher === 'function') hlDrawFinisher(this); }
}
function hlFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof HlFinisher && e.active) e.drawOver();
}

// ---------- Bot: 'nitro' | 'tap' | null ----------
function hlBotAction(bot, enemy, aligned) {
    if (!enemy || !(enemy.hp > 0)) return null;
    if (bot.hlCd <= 0 && bot.hlNitroT <= 0 && bot.hlAcc > 1.2) return 'nitro';
    return aligned && bot.ammo > 0 ? 'tap' : null;
}
