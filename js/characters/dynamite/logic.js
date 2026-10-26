// ==========================================
// Dynamite — Chuyên Gia Thuốc Nổ (dynamite) — Logic
//  NHẤP: Ném Thẳng (nổ khi chạm xe địch / vật cản / vòng cảnh báo của bó đang nằm) 1.5 dame, x3 lên công trình
//  GIỮ 0.5s THẢ: Ném Cao vòng cung trên không (không bị chặn) -> nằm lại làn địch (vòng 55px) hoặc DÍNH vào xe địch
//  Nổ Lan 140px, Đào Vàng (+$10 thùng/xe tiền, +$5 mỗi 3 lần trúng). Thực thể: js/characters/dynamite/bombs.js
// ==========================================

const DYN_HOLD = 30;        // giữ 0.5s
const DYN_TAP_SPEED = 6.4;
const DYN_TAP_CD = 260;     // ms giữa 2 lần ném thẳng
function dynLobDur(p) { return dynE1(p) ? 32 : 42; } // Evo 1: Ném Cao nhanh hơn 30%

function dynThrowTap(p, now) {
    const dir = p.id === 1 ? -1 : 1;
    spawnBullet(p, {
        x: p.x + p.w / 2 - 4, y: dir < 0 ? p.y - 14 : p.y + p.h + 2, w: 8, h: 14,
        vx: 0, vy: dir * DYN_TAP_SPEED, dmg: p.damage, hook: 'dyn_tap', spin: 0,
    });
    p.ammo--; p.lastShot = now;
    dynSfx('playShoot');
}
function dynThrowLob(p, now) {
    if (dynCount(p.id) >= dynMax(p)) {
        addFloatingText(p.x + p.w / 2, p.id === 1 ? p.y - 16 : p.y + p.h + 22, `TỐI ĐA ${dynMax(p)} BÓ!`, '#94a3b8', 12);
        return;
    }
    const cx = p.x + p.w / 2;
    bodyEffects.push(new DynLob(p.id, cx, p.y + p.h / 2, Math.max(10, Math.min(canvas.width - 10, cx)), dynLobDur(p)));
    p.ammo--; p.lastShot = now;
    dynSfx('playShoot');
}

// ---------- Đạn Ném Thẳng ----------
BulletHooks.register('dyn_tap', {
    truckDmgMult(b, owner) { return dynObjMult(owner); },
    obstacle(b, owner, obj, kind) {
        if (b.dynDone) return;
        const extra = (b.dmg || 1) * (dynObjMult(owner) - 1);
        if (kind === 'turret' || kind === 'bastion' || kind === 'wall' || kind === 'stone') {
            if (obj && obj.active !== false && !obj.isImmortal) dynHurtObj(obj, extra, owner);
        } else if (kind === 'truck') {
            if (obj.hp <= 0) dynAddGold(owner, 10, obj.x + obj.w / 2, obj.y + obj.h / 2); // xe tiền tự cộng $30 thường
        } else if (kind === 'crate') {
            dynAddGold(owner, 10, obj.x + obj.w / 2, obj.y + obj.h / 2);
        }
        if (!b.isPiercing) b.dynDone = true;
        dynTapBlast(owner, b.x + b.w / 2, b.y + b.h / 2);
        if (typeof triggerScreenShake === 'function') triggerScreenShake(3, 6);
    },
    hit(b, attacker, victim, dmg) {
        if (b.dynDone) return;
        b.dynDone = true;
        if (dmg > 0) dynOnHit(attacker, victim);
        dynTapBlast(attacker, victim.x + victim.w / 2, victim.y + victim.h / 2);
        explosions.push(new Explosion(victim.x + victim.w / 2, victim.y + victim.h / 2, 38, 'rgba(255, 120, 30,', 0, attacker));
        if (typeof triggerScreenShake === 'function') triggerScreenShake(4, 8);
        dynSfx('playExplosion');
    },
    draw(b) { if (typeof dynDrawTapStick === 'function') dynDrawTapStick(b); },
});

// Đạn ném thẳng chạm vòng cảnh báo của bó đang nằm -> nổ ngay
function dynTapVsRings(p) {
    const bombs = dynBombs(p.id);
    if (!bombs.length) return;
    for (let i = p.bullets.length - 1; i >= 0; i--) {
        const b = p.bullets[i];
        if (b.hook !== 'dyn_tap' || b.dynDone) continue;
        const bx = b.x + b.w / 2, by = b.y + b.h / 2;
        if (bombs.some(o => o.active && o.fuse < 0 && Math.hypot(o.x - bx, o.y - by) <= DYN_RING)) {
            dynTapBlast(p, bx, by);
            p.bullets.splice(i, 1);
        }
    }
}

CharHooks.register('dynamite', {
    setup() {
        if (dynE1(this)) this.maxAmmo += 1;
        this.ammo = this.maxAmmo;
        this.dynHold = 0; this.dynHits = 0; this.dynChainSeq = 0;
        const e = dynFoe(this); if (e) { e.dynKb = 0; e.dynLastChain = 0; }
        if (typeof bodyEffects !== 'undefined') bodyEffects = bodyEffects.filter(o => !((o instanceof DynBomb || o instanceof DynLob) && o.team === this.id));
    },
    update() {
        const e = dynFoe(this);
        // hất văng trượt ngang
        if (e && e.dynKb) {
            e.x = Math.max(0, Math.min(canvas.width - e.w, e.x + e.dynKb));
            e.dynKb *= 0.86;
            if (Math.abs(e.dynKb) < 0.3) e.dynKb = 0;
        }
        dynTapVsRings(this);
    },
    shoot(inp, now) {
        if (inp.s) { this.dynHold = (this.dynHold || 0) + 1; return true; }
        const h = this.dynHold || 0;
        this.dynHold = 0;
        if (h <= 0 || this.ammo <= 0) return true;
        if (h >= DYN_HOLD) dynThrowLob(this, now);
        else if (now - this.lastShot > DYN_TAP_CD) dynThrowTap(this, now);
        return true;
    },
});

// ---------- Kết liễu: SẬP HẦM MỎ VÀNG ----------
const DYNF_DUR = 215, DYNF_N = 14, DYNF_DROP = 48, DYNF_LIT = 60, DYNF_BOOM0 = 104, DYNF_BIG = 150;
class DynFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.ox = owner.x + owner.w / 2; this.oy = owner.y + owner.h / 2;
        this.vw = victim.w; this.vh = victim.h; this.vid = victim.id;
        this.t = 0; this.dur = DYNF_DUR; this.active = true;
        this.seed = Math.round(Math.random() * 1000) / 100;
    }
    ringPos(i) {
        const a = -Math.PI / 2 + i / DYNF_N * Math.PI * 2;
        return { x: this.x + Math.cos(a) * 62, y: this.y + (this.vid === 2 ? 20 : -20) + Math.sin(a) * 40 };
    }
    update() {
        const t = ++this.t;
        if (t > 4 && t <= DYNF_DROP && t % 4 === 0) dynSfx('playClick');
        if (t === DYNF_LIT) dynSfx('playLaser');
        if (t >= DYNF_BOOM0 && t < DYNF_BIG && (t - DYNF_BOOM0) % 3 === 0) {
            const i = Math.floor((t - DYNF_BOOM0) / 3);
            if (i < DYNF_N) {
                const q = this.ringPos(i);
                explosions.push(new Explosion(q.x, q.y, 34, 'rgba(255, 110, 30,', 0, null));
                if (typeof spawnSparkParticles === 'function') spawnSparkParticles(q.x, q.y, '#ffb347', 5);
                if (typeof triggerScreenShake === 'function') triggerScreenShake(4, 5);
                if (i % 3 === 0) dynSfx('playExplosion');
            }
        }
        if (t === DYNF_BIG) {
            explosions.push(new Explosion(this.x, this.y, 110, 'rgba(255, 90, 20,', 0, null));
            explosions.push(new Explosion(this.x, this.y, 70, 'rgba(255, 215, 0,', 0, null));
            if (typeof spawnSparkParticles === 'function') { spawnSparkParticles(this.x, this.y, '#ffd700', 30); spawnSparkParticles(this.x, this.y, '#ff5a1f', 20); }
            if (typeof triggerScreenShake === 'function') triggerScreenShake(18, 28);
            dynSfx('playExplosion');
        }
        if (t === 175) dynSfx('playWin');
        if (t >= this.dur) this.active = false;
    }
    camPath() {
        if (typeof fcamKeys !== 'function') return null;
        const W = canvas.width, H = canvas.height;
        return fcamKeys(this.t, [[0, W / 2, H / 2, 1], [14, this.x, this.y, 1.5], [DYNF_BIG - 4, this.x, this.y, 1.6],
            [DYNF_BIG + 10, this.x, this.y, 1.25], [195, W / 2, H / 2, 1]]);
    }
    draw() { }
    drawOver() { if (typeof dynDrawFinisher === 'function') dynDrawFinisher(this); }
}
function dynFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof DynFinisher && e.active) e.drawOver();
}
(function () {
    if (typeof Player === 'undefined') return;
    const orig = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        const before = this.hp;
        const r = orig.apply(this, arguments);
        if (before > 0 && this.hp <= 0 && typeof bodyEffects !== 'undefined') {
            const a = typeof bfAttacker === 'function' ? bfAttacker(attacker) : (attacker instanceof Player ? attacker : null);
            if (a && a !== this && a.weapon === 'dynamite' && !(typeof finisherFxActive === 'function' && finisherFxActive())) {
                const fc = typeof fatalCinematic !== 'undefined' ? fatalCinematic : null;
                if (!(fc && fc.active && (a.id !== fc.winnerId || fc.fxSeen))) bodyEffects.push(new DynFinisher(a, this));
            }
        }
        return r;
    };
})();

// ---------- Bot ----------
// 'lob' | 'tap' | null
function dynBotAction(bot, enemy) {
    if (!enemy || bot.ammo <= 0) return null;
    const bx = bot.x + bot.w / 2, ex = enemy.x + enemy.w / 2, dx = Math.abs(bx - ex);
    const bombs = dynBombs(bot.id);
    const armed = bombs.some(o => o.stuck || dynRectDist(o.x, o.y, enemy) < DYN_RING * 0.8);
    // bom đã sẵn sát địch: ném thẳng kích nổ (đạn sẽ chạm vòng của bó gần nhất trên đường bay)
    if (armed && bombs.some(o => Math.abs(o.x - bx) < DYN_RING * 0.9)) return 'tap';
    if (dynCount(bot.id) < dynMax(bot) && dx < 22 && bot.ammo >= 1 && !armed) return 'lob';
    if (dx < 16 && (bot.ammo >= 2 || !bombs.length)) return 'tap';
    return null;
}
