// ==========================================
// Batter — Vua Bóng Chày (batter) — Logic: "Home Run! Trả lại viên đạn cho ngươi này!"
// Nhấp (nhả < 0.35s): ném Bóng Chày 1.1 dame; pitch thứ 4 = Bóng Lửa x2 tốc, 1.6 dame.
// Giữ 0.35s: Vung Gậy (CD 4.5s) quét cung rộng phía trước 0.45s. Trúng đạn địch -> HOME RUN: phản bằng
//   reflectBulletClone (x2 tốc, +0.7 dame, hồi 0.3 HP). Không có đạn -> Bóng Vàng 1.4 dame.
// Evo1: CD 3.0s, cung rộng hơn, +20% tốc 1.5s sau vung. Evo2: đạn phản to x1.5 + xuyên + Khiên Bóng Chày 2s.
// FULL EVO: 1 cú vung phản MỌI đạn trong tầm, +$5 mỗi Home Run.
// Trạng thái: trường thuần trên player/đạn -> đồng bộ online.
// ==========================================

const BT_HOLD = 21, BT_SWING = 27, BT_CD = 270, BT_CD1 = 180, BT_V = 6.5;
const BT_RED = '#ef4444', BT_GOLD = '#fde047', BT_ORG = '#fb923c';

function btE1(p) { return p.hasUpgrade('evo_bat_1'); }
function btE2(p) { return p.hasUpgrade('evo_bat_2'); }
function btFull(p) { return btE1(p) && btE2(p) && hasFullEvo(p, 'batter'); }
function btIs(p) { return p && p.weapon === 'batter'; }
function btEnemy(p) { return p === p1 ? p2 : p1; }
function btSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function btTxt(p, s, c, sz) { addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -20 : p.h + 24), s, c, sz || 12); }
function btReach(p) { return btE1(p) ? 92 : 78; }       // bán kính vung
function btHalf(p) { return btE1(p) ? 1.75 : 1.4; }     // nửa góc cung (rad)

function btBall(p, o) {
    const dir = p.id === 1 ? -1 : 1;
    return spawnBullet(p, Object.assign({
        x: p.x + p.w / 2 - 4, y: p.id === 1 ? p.y - 8 : p.y + p.h + 2, w: 8, h: 8,
        vx: 0, vy: dir * BT_V, hook: 'batter',
    }, o));
}

function btPitch(p) {
    p.btPitches = (p.btPitches || 0) + 1;
    const strike = p.btPitches % 4 === 0, dir = p.id === 1 ? -1 : 1;
    btBall(p, { dmg: strike ? 1.6 : p.damage, vy: dir * BT_V * (strike ? 2 : 1), btFire: strike });
    if (strike) btTxt(p, 'STRIKE OUT!', BT_ORG, 12);
    p.ammo--; p.lastShot = Date.now(); p.btRecoil = 6;
    btSfx('playShoot');
}

function btStartSwing(p) {
    p.btSwing = BT_SWING; p.btHit = 0; p.btCd = btE1(p) ? BT_CD1 : BT_CD; p.btCdMax = p.btCd;
    btSfx('playClick');
}

function btHomeRun(p, b, e) {
    const idx = e.bullets.indexOf(b);
    if (idx >= 0) e.bullets.splice(idx, 1);
    const big = btE2(p);
    const c = reflectBulletClone(b, p, { from: e, speedMult: 2, tint: BT_GOLD });
    c.dmg += 0.7;
    c.btHome = true;
    if (big) {
        const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
        c.w *= 1.5; c.h *= 1.5; c.x = cx - c.w / 2; c.y = cy - c.h / 2; c.isPiercing = true;
    }
    p.hp = Math.min(p.maxHp, p.hp + 0.3);
    p.btHit++;
    if (big) { if (!p.btShieldOn) { p.shield = (p.shield || 0) + 1; p.btShieldOn = true; } p.btShieldT = 120; }
    if (btFull(p)) {
        if (p.id === 1) gameState.p1Coins += 5; else gameState.p2Coins += 5;
        addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -36 : p.h + 40), '+$5', '#fbbf24', 12);
    }
    btTxt(p, 'HOME RUN!', BT_GOLD, 14);
    spawnSparkParticles(c.x + c.w / 2, c.y + c.h / 2, BT_GOLD, 12);
    explosions.push(new Explosion(c.x + c.w / 2, c.y + c.h / 2, 26, 'rgba(253, 224, 71,', 0, null));
    triggerScreenShake(4, 8); btSfx('playHit');
}

// Quét cung: đạn địch nằm trong tầm & góc phía trước mũi xe
function btSweep(p) {
    const e = btEnemy(p); if (!e || !e.bullets) return;
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2, fw = p.id === 1 ? -1 : 1;
    const R = btReach(p) + 8, half = btHalf(p);
    const full = btFull(p);
    for (let i = e.bullets.length - 1; i >= 0; i--) {
        if (!full && p.btHit > 0) break;
        const b = e.bullets[i];
        if (!b || !rfCanReflect(b)) continue;
        const bx = b.x + (b.w || 6) / 2 - cx, by = b.y + (b.h || 6) / 2 - cy;
        if (Math.hypot(bx, by) > R) continue;
        if (Math.abs(Math.atan2(bx, by * fw)) > half) continue;   // lệch so với hướng trước mũi (0 = thẳng trước)
        btHomeRun(p, b, e);
    }
}

BulletHooks.register('batter', {});

CharHooks.register('batter', {
    setup() {
        this.btPitches = 0; this.btHold = 0; this.btPrevS = false; this.btUsed = false;
        this.btSwing = 0; this.btHit = 0; this.btCd = 0; this.btCdMax = BT_CD; this.btSpd = 0;
        this.btShieldOn = false; this.btShieldT = 0; this.btRecoil = 0;
    },
    update() {
        if (this.btCd > 0) this.btCd--;
        if (this.btSpd > 0) this.btSpd--;
        if (this.btRecoil > 0) this.btRecoil--;
        if (this.btShieldOn && (--this.btShieldT <= 0 || !(this.shield > 0))) {
            if (this.btShieldT <= 0 && this.shield > 0) this.shield--;
            this.btShieldOn = false;
        }
        if (this.btSwing > 0) {
            this.btSwing--;
            if (this.hp > 0) btSweep(this);
            if (this.btSwing === 0) {
                if (this.btHit === 0 && this.hp > 0) {
                    btBall(this, { dmg: 1.4, btGold: true, w: 10, h: 10, x: this.x + this.w / 2 - 5 });
                    btTxt(this, 'BÓNG VÀNG!', BT_GOLD, 12);
                }
                if (btE1(this)) this.btSpd = 90;
            }
        }
    },
    speed(s) { return this.btSpd > 0 ? s * 1.2 : s; },
    shieldBreak() { this.btShieldOn = false; },
    shoot(inp) {
        const s = !!inp.s;
        if (this.silenceTimer > 0 || this.freezeTimer > 0) { this.btHold = 0; this.btPrevS = s; return true; }
        if (s) {
            this.btHold++;
            if (this.btHold >= BT_HOLD && !this.btUsed && this.btCd <= 0 && this.btSwing <= 0) { btStartSwing(this); this.btUsed = true; }
        } else {
            if (this.btPrevS && !this.btUsed && this.ammo > 0 && this.btSwing <= 0) btPitch(this);
            this.btHold = 0; this.btUsed = false;
        }
        this.btPrevS = s;
        return true;
    },
});

// ---------- Kết liễu: HOME RUN ----------
const BTF_DUR = 150, BTF_HIT = 40;
class BtFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.ox = owner.x + owner.w / 2; this.oy = owner.y + owner.h / 2;
        this.t = 0; this.dur = BTF_DUR; this.active = true;
    }
    update() {
        this.t++;
        if (this.t === BTF_HIT) {
            explosions.push(new Explosion(this.x, this.y, 90, 'rgba(253, 224, 71,', 0, null));
            explosions.push(new Explosion(this.x, this.y, 55, 'rgba(239, 68, 68,', 0, null));
            spawnSparkParticles(this.x, this.y, BT_GOLD, 26); spawnSparkParticles(this.x, this.y, BT_RED, 16);
            triggerScreenShake(14, 22); btSfx('playExplosion');
        }
        if (this.t === 90) btSfx('playWin');
        if (this.t >= this.dur) this.active = false;
    }
    draw() { }
    drawOver() { if (typeof btDrawFinisher === 'function') btDrawFinisher(this); }
}
function btFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof BtFinisher && e.active) e.drawOver();
}
(function () {
    if (typeof Player === 'undefined') return;
    const orig = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker) {
        const before = this.hp;
        const r = orig.apply(this, arguments);
        if (before > 0 && this.hp <= 0 && typeof bodyEffects !== 'undefined') {
            const a = typeof bfAttacker === 'function' ? bfAttacker(attacker) : (attacker instanceof Player ? attacker : null);
            if (a && a !== this && btIs(a) && !(typeof finisherFxActive === 'function' && finisherFxActive())) {
                const fc = typeof fatalCinematic !== 'undefined' ? fatalCinematic : null;
                if (!(fc && fc.active && (a.id !== fc.winnerId || fc.fxSeen))) bodyEffects.push(new BtFinisher(a, this));
            }
        }
        return r;
    };
})();

// ---------- Bot: 'tap' | 'swing' | null ----------
function btBotAction(bot, enemy) {
    if (!enemy || !(enemy.hp > 0)) return null;
    if (bot.btCd <= 0 && bot.btSwing <= 0) {
        const cx = bot.x + bot.w / 2, cy = bot.y + bot.h / 2, fw = bot.id === 1 ? -1 : 1;
        for (const b of (enemy.bullets || [])) {
            const bx = b.x + (b.w || 6) / 2 - cx, by = b.y + (b.h || 6) / 2 - cy;
            if (by * fw > 0 && Math.hypot(bx, by) < btReach(bot) + 40 && Math.abs(bx) < btReach(bot)) return 'swing';
        }
    }
    const dx = Math.abs(enemy.x + enemy.w / 2 - (bot.x + bot.w / 2));
    return bot.ammo > 0 && dx < enemy.w / 2 + 8 ? 'tap' : null;
}
