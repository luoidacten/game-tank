// ==========================================
// Y Sư (healer) — Logic: Sinh Mệnh Tuần Hoàn
// ------------------------------------------
// - Tự Tái Tạo: mỗi 3s không mất máu -> "Hồi Phục" +0.5 HP (Full Evo: mỗi 1.5s).
// - Đạn Hấp Huyết: trúng địch/công trình -> +0.25 HP, rồi hồi chiêu 20s (Phát Cường Hóa: -10s).
// - Năng Lượng Sinh Mệnh: nạp bằng MỌI lượng máu được hồi -> đầy thì phát kế tiếp là Đạn Cường Hóa
//   (50% MaxHP + dame gốc, nổ lan 15% dame gốc; Evo1: 65% & 30%; Full Evo: 100% MaxHP).
// - Evo1: hồi dư khi đầy máu -> Giáp Trắng (tối đa 4 + 50% MaxHP), đỡ đòn trước máu.
// - Evo2: mỗi lần được hồi -> 1 Tia Xung tự ngắm, dame = lượng vừa hồi; giảm yêu cầu năng lượng.
// - Full Evo: hồi gấp đôi tốc độ; đạn gắn ấn Kháng Hồi Phục 5s: địch hồi máu -> bị cướp sang bạn.
// Phát hiện hồi máu: hlHeal() cho nguồn của chính body; mọi nguồn khác (hòm máu, kỹ năng...) được bắt
// bằng so sánh HP mỗi tick + bọc crateOnBreak để bắt phần hồi dư khi đầy máu.
// Tương thích Trọng Thương (Raven Evo2): trần hồi máu = MaxHP - phần máu bị khóa.
// ==========================================

const HL_GREEN = '#4ade80', HL_LIME = '#bef264', HL_GOLD = '#fde047', HL_ANTI = '#c026d3';
const HL_REGEN = 180, HL_REGEN_FULL = 90;
const HL_LS_CD = 1200;          // 20s
const HL_MARK = 300;            // 5s ấn Kháng Hồi Phục

function healE1(p) { return p.hasUpgrade('evo_heal_1'); }
function healE2(p) { return p.hasUpgrade('evo_heal_2'); }
function healFull(p) { return healE1(p) && healE2(p) && hasLegacyFullEvo(p, 'healer'); }
function hlEnemy(p) { return p === p1 ? p2 : p1; }
function hlLifeReq(p) { return healFull(p) ? 1.5 : (healE2(p) ? 1.25 : 2); }
function hlOverMax(p) { return 4 + 0.5 * p.maxHp; }
// Trần máu hiện tại (Trọng Thương của Raven khóa một phần máu)
function hlHpCap(p) {
    const e = hlEnemy(p);
    if (e && e.weapon === 'raven_oca' && e.rvGwT > 0) return Math.max(0.05, p.maxHp - (e.rvGwLock || 0));
    return p.maxHp;
}

// Hồi máu từ nguồn của Y Sư. Trả về lượng hồi được tính (0 nếu bị khóa hoàn toàn).
function hlHeal(p, amt, src) {
    if (!(amt > 0) || p.hp <= 0) return 0;
    const cap = hlHpCap(p);
    const toHp = Math.max(0, Math.min(amt, cap - p.hp));
    p.hp += toHp;
    let over = amt - toHp;
    const wounded = cap < p.maxHp - 1e-6;
    if (over > 0 && wounded) over = 0; // đang bị Trọng Thương: phần dư mất
    const over0 = p.hlOver || 0;
    hlAddOver(p, over);
    p.hlLastHp = p.hp;
    const eff = toHp + ((p.hlOver || 0) - over0);
    if (eff <= 1e-6) { if (wounded) addFloatingText(p.x + p.w / 2, p.y - 12, '✚ KHÓA', '#94a3b8', 11); return 0; }
    hlOnHealed(p, eff, src);
    return eff;
}
function hlAddOver(p, over) {
    if (!(over > 0) || !healE1(p)) return;
    p.hlOver = Math.min(hlOverMax(p), (p.hlOver || 0) + over);
}

// Mọi lượng máu được hồi (kể cả nguồn ngoài) đi qua đây
function hlOnHealed(p, amt, src) {
    p.hlHealFx = 24;
    if (src !== 'regen' && src !== 'steal') addFloatingText(p.x + p.w / 2 + 10, p.y - 4, '+' + (Math.round(amt * 100) / 100), HL_GREEN, 12);
    const req = hlLifeReq(p);
    if (!p.hlReady) {
        p.hlLife = Math.min(req, (p.hlLife || 0) + amt);
        if (p.hlLife >= req - 1e-6) { p.hlReady = true; addFloatingText(p.x + p.w / 2, p.y - 22, '✚ CƯỜNG HÓA', HL_GOLD, 13); }
    }
    // Evo2: Tia Xung tự ngắm, dame = lượng vừa hồi
    if (healE2(p)) hlPulse(p, amt);
}

function hlPulse(p, amt) {
    const e = hlEnemy(p);
    if (!e) return;
    const sx = p.x + p.w / 2, sy = p.id === 1 ? p.y - 4 : p.y + p.h + 4;
    const v = aimVelocity(sx, sy, e, 5.5, true);
    spawnBullet(p, {
        x: sx - 4, y: sy - 4, w: 8, h: 8, vx: v.vx, vy: v.vy,
        dmg: amt, isHoming: true, hook: 'healer', hlKind: 'pulse',
    });
}

// Bắn đạn thường / cường hóa
function hlFire(p) {
    const dirY = p.id === 1 ? -1 : 1;
    const base = p.damage + (p.dmgBuff || 0);
    if (p.hlReady) {
        const ratio = healFull(p) ? 1 : (healE1(p) ? 0.65 : 0.5);
        const dmg = ratio * p.maxHp + base;
        spawnBullet(p, {
            x: p.x + p.w / 2 - 7, y: dirY < 0 ? p.y - 14 : p.y + p.h, w: 14, h: 14,
            vy: dirY * C.bulletSpeed * 1.1, dmg, hook: 'healer', hlKind: 'emp',
            hlAoe: base * (healE1(p) ? 0.3 : 0.15),
        });
        p.hlReady = false; p.hlLife = 0;
        p.hlLsCd = Math.max(0, (p.hlLsCd || 0) - 600);
        triggerScreenShake(3, 6);
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    } else {
        spawnBullet(p, {
            x: p.x + p.w / 2 - 3.5, y: dirY < 0 ? p.y - 8 : p.y + p.h, w: 7, h: 7,
            vy: dirY * C.bulletSpeed, dmg: base, hook: 'healer', hlKind: 'bio',
        });
        if (soundSystem && !soundSystem.muted) soundSystem.playShoot();
    }
}

// Trúng mục tiêu: hấp huyết, ấn kháng hồi phục, nổ lan
function hlOnImpact(b, owner, victim, x, y, isStructure) {
    if (!owner || owner.weapon !== 'healer') return;
    if (b.hlKind === 'pulse') { explosions.push(new Explosion(x, y, 18, 'rgba(190, 242, 100,', 0, owner)); return; }
    if ((victim || isStructure) && !(owner.hlLsCd > 0)) {
        owner.hlLsCd = HL_LS_CD;
        hlHeal(owner, 0.25, 'lifesteal');
        spawnSparkParticles(x, y, HL_GREEN, 6);
    }
    if (victim && healFull(owner)) {
        owner.hlMarkT = HL_MARK;
        owner.hlEnemyLast = victim.hp;
    }
    if (b.hlKind === 'emp' && !b.hlBoom) {
        b.hlBoom = true;
        explosions.push(new Explosion(x, y, 56, 'rgba(74, 222, 128,', b.hlAoe || 0.1, owner));
        explosions.push(new Explosion(x, y, 30, 'rgba(253, 224, 71,', 0, owner));
        triggerScreenShake(5, 8);
    }
}

BulletHooks.register('healer', {
    hit(b, attacker, victim) { hlOnImpact(b, attacker, victim, b.x + b.w / 2, b.y + b.h / 2, false); },
    obstacle(b, owner, obj, kind) { hlOnImpact(b, owner, null, b.x + b.w / 2, b.y + b.h / 2, kind === 'truck' || kind === 'bastion'); },
    edge(b, owner) {
        if (b.hlKind === 'emp') hlOnImpact(b, owner, null, Math.max(0, Math.min(canvas.width, b.x + b.w / 2)), Math.max(0, Math.min(canvas.height, b.y + b.h / 2)), false);
        return undefined;
    },
});

// Bắt phần hồi dư từ Hòm Máu khi đã đầy máu (hồi trong ngưỡng được bắt bằng so sánh HP mỗi tick)
(function hlWrapCrate() {
    if (typeof crateOnBreak !== 'function') return;
    const base = crateOnBreak;
    crateOnBreak = function (c, opener) {
        if (c && !c._broke && c.type === 'hp' && opener && opener.weapon === 'healer' && opener.hp > 0) {
            const over = opener.hp + 1 - opener.maxHp;
            if (over > 0) opener.hlPendingOver = (opener.hlPendingOver || 0) + Math.min(1, over);
        }
        return base.apply(this, arguments);
    };
})();

CharHooks.register('healer', {
    setup() {
        this.hlLastHp = this.hp; this.hlCalm = 0; this.hlLife = 0; this.hlReady = false;
        this.hlLsCd = 0; this.hlOver = 0; this.hlPendingOver = 0; this.hlMarkT = 0; this.hlEnemyLast = null;
        this.hlHealFx = 0; this.hlRegenFx = 0; this.hlPrevS = false; this.hlStealFx = 0;
    },

    update() {
        if (this.hp <= 0) return;
        // 1) Nguồn hồi máu bên ngoài: HP tăng so với tick trước
        const d = this.hp - (this.hlLastHp == null ? this.hp : this.hlLastHp);
        if (d > 1e-4) hlOnHealed(this, d, 'ext');
        else if (d < -1e-4) this.hlCalm = 0; // mất máu (kể cả chảy máu / axit trừ thẳng HP)
        this.hlLastHp = this.hp;
        if (this.hlPendingOver > 0) {
            const o = this.hlPendingOver; this.hlPendingOver = 0;
            hlAddOver(this, o); hlOnHealed(this, o, 'ext');
        }
        if (this.hlOver > hlOverMax(this)) this.hlOver = hlOverMax(this);

        // 2) Tự Tái Tạo
        if (this.hlHealFx > 0) this.hlHealFx--;
        if (this.hlRegenFx > 0) this.hlRegenFx--;
        if (this.hlStealFx > 0) this.hlStealFx--;
        this.hlCalm++;
        const every = healFull(this) ? HL_REGEN_FULL : HL_REGEN;
        if (this.hlCalm >= every) {
            this.hlCalm = 0;
            const amt = 0.5;
            const got = hlHeal(this, amt, 'regen');
            if (got > 0) {
                this.hlRegenFx = 50;
                addFloatingText(this.x + this.w / 2, this.y - 14, 'Hồi Phục', HL_GREEN, 13);
                spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, HL_GREEN, 8);
            }
        }
        if (this.hlLsCd > 0) this.hlLsCd--;

        // 3) Full Evo: cướp máu kẻ địch mang ấn Kháng Hồi Phục
        const e = hlEnemy(this);
        if (e) {
            if (this.hlMarkT > 0 && healFull(this) && e.hp > 0 && this.hlEnemyLast != null) {
                const gain = e.hp - this.hlEnemyLast;
                if (gain > 1e-4 && gain <= 2.5) { // bỏ qua hồi sinh / reset hiệp (tăng vọt)
                    e.hp -= gain;
                    addFloatingText(e.x + e.w / 2, e.y - 14, '⊘ -' + (Math.round(gain * 100) / 100), HL_ANTI, 12);
                    this.hlStealFx = 30;
                    hlHeal(this, gain, 'steal');
                }
            }
            if (this.hlMarkT > 0) this.hlMarkT--;
            this.hlEnemyLast = e.hp;
        }
    },

    // Giáp Trắng đỡ đòn trước máu (hoàn lại phần máu vừa trừ)
    damaged(dmg) {
        this.hlCalm = 0;
        if (this.hlOver > 0) {
            const a = Math.min(this.hlOver, dmg);
            this.hlOver -= a;
            this.hp += a;
            if (a > 0) spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, '#ffffff', 6);
        }
        this.hlLastHp = this.hp;
    },

    shoot(inp, now) {
        const pressed = inp.s && !this.hlPrevS;
        this.hlPrevS = !!inp.s;
        if (pressed && this.ammo > 0 && now - this.lastShot > 350) {
            hlFire(this);
            this.ammo--;
            this.lastShot = now;
        }
        return true;
    },
});
