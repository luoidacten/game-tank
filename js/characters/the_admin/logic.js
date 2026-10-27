// ==========================================
// The Admin — Hệ Thống Kiến Tạo Luật Lệ (the_admin) — Logic
// Nhấp bắn: Đạn Mã Nguồn. GIỮ 0.4s: /execute — lướt nhẹ sang ngang + ÉP chạy mọi Luật 1 lần (CD 8s, Evo 1: 5.5s).
// Luật / ĐK / KQ: rules_engine.js. Cửa hàng Admin Terminal: admin_shop.js. Hình ảnh + kết liễu SYSTEM SHUTDOWN: render.js.
// Evo 1: 2 ĐK + 2 KQ / Luật, CD /execute 5.5s, +$15 đầu hiệp. Evo 2: 5 Luật, 3 ĐK + 3 KQ / Luật, mở ĐK 13-18 / KQ 13-16, ĐK cơ bản nhạy hơn 25%.
// FULL EVO: vô hạn Luật & khe, mở ĐK 19-21 / KQ 17-19, tặng miễn phí 1 ĐK/KQ Lớn.
// ==========================================

const TAD_HOLD = 24, TAD_CD = 480, TAD_CD_E1 = 330;

function tadShoot(p, now) {
    const n0 = p.bullets.length;
    p.fireBullet(1);
    const sc = 1 + 0.1 * (p.tadDmgSt || 0);
    const made = p.bullets.slice(n0);
    for (const b of made) { b.hook = 'tad'; b.x -= b.w * (sc - 1) / 2; b.w *= sc; b.h *= sc; }
    if (p.tadTri && made.length) {
        p.tadTri = 0;
        const b0 = made[0];
        b0.isPiercing = true; b0.tadK = 'tri';
        for (const k of [-1, 1]) {
            const b = Object.assign({}, b0, { hitIds: [], vx: (b0.vx || 0) + k * 1.3 });
            p.bullets.push(b);
        }
    }
    if (p.tadJack && made.length) { p.tadJack = 0; made[0].tadJack = 1; made[0].tadC = TAD_GOLD; }
    p.ammo--;
    p.lastShot = now;
    tadOnShot(p);
}

function tadExecute(p, inp) {
    const W = canvas.width;
    const dir = inp.l ? -1 : (inp.r ? 1 : (p.x + p.w / 2 < W / 2 ? 1 : -1));
    p.tadDashT = 8; p.tadDashDir = dir; p.tadDir = dir;
    p.invincibleTimer = Math.max(p.invincibleTimer || 0, 12);
    p.tadCd = tadE1(p) ? TAD_CD_E1 : TAD_CD;
    p.tadExecFx = 30;
    tadTxt(p, '/execute', TAD_GREEN, 13);
    tadSfx('playPowerup');
    tadExecuteAll(p);
}

function tadResetRound(p) {
    p.tadK = { t2: 0, mv: 0, still: 0, t19: 0, t18: 0, es: 0, eh: 0, emv: 0, ea: 0, al: 0, sh: 0, ms: 0, hit: 0, dmg: 0, wall: 0 };
    p.tadT = 0; p.tadGap = []; p.tadFl = []; p.tadTickN = 0; p.tadTickCap = 6; p.tadDepth = 0; p.tadChain = 0;
    p.tadRecN = 0; p.tadRecT = 0; p.tadCd = 0; p.tadHold = 0; p.tadPrevS = false; p.tadUsed = false; p.tadDashT = 0; p.tadDir = 1;
    p.tadDrT = 0; p.tadShT = 0; p.tadTmpSh = 0; p.tadDmgSt = 0; p.tadSpdT = 0; p.tadSpdM = 0; p.tadC9 = 0; p.tadEnSlow = 0;
    p.tadTri = 0; p.tadDrones = []; p.tadLaneT = 0; p.tadSteal = []; p.tadGodCd = 0; p.tadGodT = 0; p.tadJack = 0; p.tadOver = 0;
    p.tadExecFx = 0; p.tadFires = 0; p.tadCoinPrev = undefined; p.tadMoney = 0; p.tadC13 = 0; p.tadC17 = 0; p.tadC19 = 0;
}

CharHooks.register('the_admin', {
    setup() {
        const d = tadData(this);
        d.setups = (d.setups || 0) + 1;
        if (d.setups >= 2) d.freePick = 0;   // chỉ chọn lại Luật #1 miễn phí ở shop đầu tiên
        tadResetRound(this);
        if (d.hpBonus > 0) this.maxHp += d.hpBonus;
        if (tadE1(this) && !tadIsGuest()) { tadAddCoins(this, 15); }
    },
    update(inp) {
        const p = this, W = canvas.width, e = tadEnemy(p);
        if (!p.tadK) tadResetRound(p);
        p.tadTickN = 0;
        if (p.tadCd > 0) p.tadCd--;
        if (p.tadExecFx > 0) p.tadExecFx--;
        for (let i = 0; i < p.tadGap.length; i++) if (p.tadGap[i] > 0) p.tadGap[i]--;
        for (let i = 0; i < p.tadFl.length; i++) if (p.tadFl[i] > 0) p.tadFl[i]--;
        if (inp && inp.l) p.tadDir = -1; else if (inp && inp.r) p.tadDir = 1;
        if (p.tadRecT > 0 && --p.tadRecT <= 0) p.tadRecN = 0;
        if (p.tadC9 > 0) p.tadC9--;
        if (p.tadC13 > 0) p.tadC13--;
        if (p.tadC17 > 0) p.tadC17--;
        if (p.tadC19 > 0) p.tadC19--;
        if (p.tadGodCd > 0) p.tadGodCd--;
        if (p.tadDrT > 0) p.tadDrT--;
        if (p.tadSpdT > 0) p.tadSpdT--;
        if (p.tadShT > 0 && --p.tadShT <= 0 && p.tadTmpSh > 0) { p.shield = Math.max(0, (p.shield || 0) - p.tadTmpSh); p.tadTmpSh = 0; }
        if (p.tadDashT > 0) { p.tadDashT--; p.x = Math.max(0, Math.min(W - p.w, p.x + p.tadDashDir * 6)); }
        // Đánh Cắp Thông Số hết hạn -> trả lại
        for (let i = p.tadSteal.length - 1; i >= 0; i--) {
            if (--p.tadSteal[i] <= 0) { p.tadSteal.splice(i, 1); p.dmgBuff -= 0.15; if (e) e.dmgBuff += 0.15; }
        }
        if (gameState.phase !== 'playing' || p.hp <= 0) return;
        if (e && e.hp > 0) {
            if (p.tadEnSlow > 0) { p.tadEnSlow--; addStatusSlow(e, 0.65); }
            if (p.tadSteal.length) addStatusSlow(e, 1 - 0.12 * p.tadSteal.length);
            if (p.tadLaneT > 0) { p.tadLaneT--; e.x = Math.max(W * 0.175, Math.min(W * 0.825 - e.w, e.x)); }
            // /godmode: phản đạn thường chạm người bay trả lại sân địch
            if (p.tadGodT > 0) {
                p.tadGodT--;
                for (let i = e.bullets.length - 1; i >= 0; i--) {
                    const b = e.bullets[i];
                    if (b.isHitscan || b.x + b.w < p.x - 14 || b.x > p.x + p.w + 14 || b.y + b.h < p.y - 14 || b.y > p.y + p.h + 14) continue;
                    e.bullets.splice(i, 1);
                    b.owner = p; b.vy = -(b.vy || 0); b.vx = -(b.vx || 0); b.hitIds = []; b.hook = 'tad'; b.tadK = 'refl';
                    p.bullets.push(b);
                    spawnSparkParticles(b.x, b.y, TAD_GOLD, 4);
                }
            }
        }
        // Drone Admin
        for (let i = p.tadDrones.length - 1; i >= 0; i--) {
            const dr = p.tadDrones[i];
            if (--dr.t <= 0) { p.tadDrones.splice(i, 1); continue; }
            if (--dr.cd <= 0) {
                dr.cd = 40;
                const x = p.x + p.w / 2 + dr.s * 24;
                spawnBullet(p, { x: x - 2, w: 4, h: 10, dmg: 0.35 * dr.m, hook: 'tad', tadR: 1, tadRule: dr.r, tadK: 'drone', tadC: TAD_CYAN });
            }
        }
        tadTickConds(p);
    },
    speed(cur) {
        let m = 1;
        if (this.tadSpdT > 0) m += this.tadSpdM || 0.35;
        if (this.tadSteal && this.tadSteal.length) m += 0.12 * this.tadSteal.length;
        return cur * m;
    },
    shoot(inp, now) {
        const s = !!inp.s;
        if (this.silenceTimer > 0 || this.freezeTimer > 0) { this.tadHold = 0; this.tadPrevS = s; return true; }
        if (s) {
            this.tadHold++;
            if (this.tadHold >= TAD_HOLD && !this.tadUsed) {
                this.tadUsed = true;
                if (this.tadCd <= 0) tadExecute(this, inp);
                else tadTxt(this, 'CD ' + Math.ceil(this.tadCd / 60) + 's', '#94a3b8', 10);
            }
        } else {
            if (this.tadPrevS && !this.tadUsed && this.ammo > 0 && now - this.lastShot > 380) tadShoot(this, now);
            this.tadHold = 0; this.tadUsed = false;
        }
        this.tadPrevS = s;
        return true;
    },
    shieldBreak() { if (gameState.phase === 'playing') tadFire(this, 3); },
    shopButtons(container, playerId) { if (typeof tadShopButton === 'function') tadShopButton(this, container, playerId); },
});

BulletHooks.register('tad', {
    hit(b, attacker, victim, dmg) {
        const o = b.owner;
        if (!tadIs(o) || !victim || victim === o) return;
        if (b.tadJack && victim.hp > 0) {
            b.tadJack = 0;
            if (victim.hp < victim.maxHp * 0.15) { victim.takeDamage(victim.hp + 10, o, { unavoidable: true, bypassShield: true, isPiercing: true }); addFloatingText(victim.x + victim.w / 2, victim.y, 'JACKPOT EXECUTE', TAD_GOLD, 14); }
            else victim.takeDamage(victim.maxHp * 0.12, o, { bypassShield: true, isPiercing: true });
        }
        if (b.tadR) tadResEffect(o, b.tadRule);
        else if (gameState.phase === 'playing') tadOnHit(o);
    },
    obstacle(b, owner) { if (tadIs(owner) && !b.tadR && gameState.phase === 'playing') tadOnObstacle(owner); },
});

// Giảm sát thương Tường Lửa, ĐK 03 (mất máu) & kết liễu SYSTEM SHUTDOWN
(function () {
    if (typeof Player === 'undefined') return;
    const orig = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        if (tadIs(this) && this.tadDrT > 0 && amount > 0) amount *= 0.7;
        const before = this.hp;
        const r = orig.call(this, amount, attacker, options);
        if (tadIs(this) && before > this.hp && this.hp > 0 && gameState.phase === 'playing') tadOnHurt(this, before - this.hp);
        if (before > 0 && this.hp <= 0 && typeof bodyEffects !== 'undefined') {
            const a = typeof bfAttacker === 'function' ? bfAttacker(attacker) : (attacker instanceof Player ? attacker : null);
            if (a && a !== this && tadIs(a) && !(typeof finisherFxActive === 'function' && finisherFxActive())) {
                const fc = typeof fatalCinematic !== 'undefined' ? fatalCinematic : null;
                if (!(fc && fc.active && (a.id !== fc.winnerId || fc.fxSeen))) bodyEffects.push(new TadFinisher(a, this));
            }
        }
        return r;
    };
})();

// Kết liễu SYSTEM SHUTDOWN: /delete_enemy (ROOT ACCESS)
const TADF_DUR = 230, TADF_CLICK = 96;
class TadFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.ax = owner.x + owner.w / 2; this.ay = owner.y + owner.h / 2;
        this.lines = tadData(owner).rules.map((r, i) => `RULE_${i + 1}: IF(${r.conds.map(c => 'c' + c).join('||') || 'null'}) => ${r.results.map(k => 'r' + k).join('+') || 'void'}`);
        this.t = 0; this.dur = TADF_DUR; this.active = true;
    }
    update() {
        this.t++;
        if (this.t === TADF_CLICK) { tadSfx('playClick'); triggerScreenShake(10, 16); }
        if (this.t === TADF_CLICK + 6) { tadSfx('playExplosion'); explosions.push(new Explosion(this.x, this.y, 70, 'rgba(52, 245, 197,', 0, null)); spawnSparkParticles(this.x, this.y, TAD_GREEN, 26); }
        if (this.t === 170) tadSfx('playWin');
        if (this.t >= this.dur) this.active = false;
    }
    draw() { }
    drawOver() { if (typeof tadDrawFinisher === 'function') tadDrawFinisher(this); }
}
function tadFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof TadFinisher && e.active) e.drawOver();
}

// ---------- Bot: 'exec' | 'tap' | null ----------
function tadBotAction(bot, enemy, aligned) {
    if (!enemy || !(enemy.hp > 0)) return null;
    if (bot.tadCd <= 0) {
        const danger = enemy.bullets.some(b => Math.abs(b.y - bot.y) < 70 && b.x + b.w > bot.x - 8 && b.x < bot.x + bot.w + 8);
        if (danger || Math.random() < 0.01) return 'exec';
    }
    return aligned && bot.ammo > 0 ? 'tap' : null;
}
