// ==========================================
// The Admin — Hệ Thống Kiến Tạo Luật Lệ (the_admin) — Logic
// Nhấp bắn: Đạn Mã Nguồn. GIỮ 0.4s: /execute — lướt nhẹ sang ngang + ÉP chạy mọi Luật 1 lần (CD 8s, Evo 1: 5.5s).
// Luật / ĐK / KQ: rules_engine.js. Cửa hàng Admin Terminal: admin_shop.js. Hình ảnh + kết liễu SYSTEM SHUTDOWN: render.js.
// Evo 1: 2 ĐK + 2 KQ / Luật, CD /execute 5.5s, +$15 đầu hiệp. Evo 2: 5 Luật, 3 ĐK + 3 KQ / Luật, mở ĐK 13-18 / KQ 13-16, ĐK cơ bản nhạy hơn 25%.
// FULL EVO: vô hạn Luật & khe, mở ĐK 19-21 / KQ 17-19, 33-34, tặng miễn phí 1 ĐK/KQ Lớn.
// ĐK 22-29 / KQ 20-35 (bổ sung): mỗi KQ mới có hồi chiêu riêng (p.tadRC). Nội tại Cờ Bạc (shop-ui.js GAMBLER_BODIES).
// ==========================================

const TAD_HOLD = 24, TAD_CD = 480, TAD_CD_E1 = 330;

function tadShoot(p, now) {
    const n0 = p.bullets.length;
    p.fireBullet(1);
    const sc = 1 + 0.1 * (p.tadDmgSt || 0);
    const made = p.bullets.slice(n0);
    for (const b of made) {
        b.hook = 'tad'; b.x -= b.w * (sc - 1) / 2; b.w *= sc; b.h *= sc;
        if (p.tadElT > 0 && p.tadEl) { b.tadEl = p.tadEl; b.tadElM = p.tadElM || 1; b.tadC = TAD_EL_COL[p.tadEl]; }
    }
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
    p.tadDashT = 8; p.tadDashDir = dir; p.tadDashV = 6; p.tadDir = dir;
    p.invincibleTimer = Math.max(p.invincibleTimer || 0, 12);
    p.tadCd = tadE1(p) ? TAD_CD_E1 : TAD_CD;
    p.tadExecFx = 30;
    tadTxt(p, '/execute', TAD_GREEN, 13);
    tadSfx('playPowerup');
    tadExecuteAll(p);
}

function tadResetRound(p) {
    p.tadK = { t2: 0, mv: 0, still: 0, t19: 0, t18: 0, es: 0, eh: 0, emv: 0, ea: 0, al: 0, sh: 0, ms: 0, hit: 0, dmg: 0, wall: 0, s3: 0, s5: 0, h3: 0, h5: 0 };
    p.tadRC = {}; p.tadInvT = 0; p.tadEl = ''; p.tadElT = 0; p.tadElM = 1; p.tadDU = 0; p.tadDUT = 0; p.tadImmFx = 0; p.tadDashV = 6;
    if (typeof TAD_PEND !== 'undefined' && TAD_PEND[p.id]) TAD_PEND[p.id].length = 0;
    const e0 = typeof p1 !== 'undefined' && p1 && p2 ? tadEnemy(p) : null;
    if (e0) { e0.tadIceT = 0; e0.tadBurnT = 0; e0.tadAcidT = 0; }
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
        d.rrN = 0;   // số lần Reroll lựa chọn ở shop (Cờ Bạc: lần đầu miễn phí)
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
        if (p.tadDashT > 0) { p.tadDashT--; p.x = Math.max(0, Math.min(W - p.w, p.x + p.tadDashDir * (p.tadDashV || 6))); }
        if (p.tadRC) for (const k in p.tadRC) if (p.tadRC[k] > 0) p.tadRC[k]--;
        if (p.tadInvT > 0) p.tadInvT--;
        if (p.tadImmFx > 0) p.tadImmFx--;
        if (p.tadElT > 0 && --p.tadElT <= 0) p.tadEl = '';
        if (p.tadDUT > 0 && --p.tadDUT <= 0) { p.dmgBuff -= p.tadDU || 0; p.tadDU = 0; }
        // Đánh Cắp Thông Số hết hạn -> trả lại
        for (let i = p.tadSteal.length - 1; i >= 0; i--) {
            if (--p.tadSteal[i] <= 0) { p.tadSteal.splice(i, 1); p.dmgBuff -= 0.15; if (e) e.dmgBuff += 0.15; }
        }
        if (gameState.phase !== 'playing' || p.hp <= 0) return;
        if (e && e.hp > 0) {
            if (p.tadEnSlow > 0) { p.tadEnSlow--; addStatusSlow(e, 0.65); }
            // hiệu ứng Đạn Nguyên Tố trên địch
            if (e.tadIceT > 0) { e.tadIceT--; addStatusSlow(e, 0.6); }
            if (e.tadAcidT > 0) { e.tadAcidT--; addStatusVuln(e, 0.2); }
            if (e.tadBurnT > 0 && --e.tadBurnT % 30 === 0) e.takeDamage(e.tadBurnD || 0.12, p, { isEnvironmental: true });
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
                if (gameState.phase === 'playing') tadOnHold(this);
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
    shieldBreak() { if (gameState.phase === 'playing') { tadFire(this, 3); tadOnHurtAny(this); } },
    // Vô Hình (KQ 24): 40% né đòn thường
    beforeDamage(amount, attacker, options) {
        if (this.tadInvT > 0 && !(options && options.isEnvironmental) && Math.random() < 0.4) { tadTxt(this, 'MISS', '#cbd5e1', 11); return true; }
    },
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
        if (b.tadEl) tadElHit(o, victim, b.tadEl, b.tadElM);
        if (b.tadR) tadResEffect(o, b.tadRule);
        else if (gameState.phase === 'playing') tadOnHit(o);
    },
    obstacle(b, owner, obj) {
        if (!tadIs(owner) || gameState.phase !== 'playing') return;
        tadNoteObj(owner, obj);
        if (!b.tadR) tadOnObstacle(owner);
    },
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

// ---------- Thực thể KQ mới (đồng bộ online: NET_CLASSES) ----------
// KQ 30: Bản Sao — mồi nhử đứng cạnh Admin, chặn đạn địch (isStone), tự bắn đạn ngắm
class TadClone {
    constructor(owner, ri, m) {
        this.owner = owner; this.id = owner.id; this.ri = ri; this.m = m || 1;
        this.w = 22; this.h = 22; this.maxHp = 1.5; this.hp = 1.5;
        this.side = (owner.tadCloneSide = -(owner.tadCloneSide || 1));
        this.x = Math.max(0, Math.min(canvas.width - this.w, owner.x + owner.w / 2 + this.side * 46 - this.w / 2));
        this.y = owner.y + (owner.h - this.h) / 2;
        this.life = 480; this.cd = 30; this.t = 0; this.isStone = true; this.active = true;
    }
    update() {
        const o = this.owner;
        if (!this.active) return;
        this.t++;
        if (this.hp <= 0 || --this.life <= 0 || !o || o.hp <= 0) {
            this.active = false;
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 22, 'rgba(34, 211, 238,', 0, null));
            return;
        }
        this.y = o.y + (o.h - this.h) / 2;
        const W = canvas.width, gx = o.x + o.w / 2 + this.side * 46 - this.w / 2;
        this.x += Math.max(-2.5, Math.min(2.5, gx - this.x));
        this.x = Math.max(0, Math.min(W - this.w, this.x));
        const e = tadEnemy(o);
        if (--this.cd <= 0 && e && e.hp > 0 && gameState.phase === 'playing') {
            this.cd = 50;
            const bx = this.x + this.w / 2, sy = o.id === 1 ? this.y - 10 : this.y + this.h + 2;
            const v = aimVelocity(bx, sy, e, 6, true);
            spawnBullet(o, { x: bx - 2.5, y: sy, w: 5, h: 10, vx: v.vx, vy: v.vy, dmg: 0.4 * this.m, hook: 'tad', tadR: 1, tadRule: this.ri, tadK: 'clone', tadC: TAD_CYAN });
        }
    }
    draw() { if (typeof tadDrawClone === 'function') tadDrawClone(this); }
}
// KQ 32: Vùng Chắn & Phản Đạn — màn chắn trước mũi xe, đạn địch chạm vào bị phản lại (80% dame)
class TadWall {
    constructor(owner, m) {
        this.owner = owner; this.id = owner.id; this.m = m || 1;
        this.w = 96; this.h = 12; this.life = 150; this.maxLife = 150; this.n = 0; this.active = true;
        this.place();
    }
    place() {
        const o = this.owner;
        this.x = Math.max(0, Math.min(canvas.width - this.w, o.x + o.w / 2 - this.w / 2));
        this.y = o.id === 1 ? o.y - 34 : o.y + o.h + 22;
    }
    update() {
        const o = this.owner;
        if (!this.active) return;
        if (--this.life <= 0 || !o || o.hp <= 0) { this.active = false; return; }
        this.place();
        const e = tadEnemy(o);
        if (!e) return;
        for (let i = e.bullets.length - 1; i >= 0; i--) {
            const b = e.bullets[i];
            if (b.isHitscan || b.isBeam || !rectIntersect(b.x, b.y, b.w || 6, b.h || 6, this.x, this.y, this.w, this.h)) continue;
            e.bullets.splice(i, 1);
            if (this.n++ < 10 && typeof reflectBulletClone === 'function') {
                reflectBulletClone(b, o, { from: e, dmgMult: 0.8 * Math.min(1.3, this.m), x: b.x + (b.w || 6) / 2, y: o.id === 1 ? this.y - 8 : this.y + this.h + 8, tint: TAD_GOLD });
            }
            spawnSparkParticles(b.x, b.y, TAD_GOLD, 5);
        }
    }
    draw() { if (typeof tadDrawWall === 'function') tadDrawWall(this); }
}
// KQ 33/34: Phân Ảnh — 'slash': cảnh báo 2s rồi lướt tới chém vòng; 'laser': khóa cột, cảnh báo 2s rồi bắn Lazer (phân ảnh là người bắn)
class TadPhantom {
    constructor(owner, kind, tx, ri, m) {
        const W = canvas.width;
        this.owner = owner; this.id = owner.id; this.kind = kind; this.ri = ri; this.m = m || 1;
        this.w = owner.w; this.h = owner.h;
        this.tx = Math.max(20, Math.min(W - 20, tx));
        const e = tadEnemy(owner);
        this.ty = e ? e.y + e.h / 2 : (owner.id === 1 ? 80 : canvas.height - 80);
        const ox = owner.x + owner.w / 2;
        this.x = kind === 'laser' ? this.tx - this.w / 2 : Math.max(0, Math.min(W - this.w, ox + (ox < W / 2 ? 50 : -50) - this.w / 2));
        this.y = owner.y; this.sx = this.x; this.sy = this.y;
        this.t = 0; this.warn = 120; this.dur = 160; this.hitDone = false; this.active = true;
        if (kind === 'laser') {
            const ri0 = ri, mm = this.m, tx0 = this.tx;
            scheduleHitscan(this, this.warn, TAD_VIO, 22, () => tadColumnHit(owner, tx0, 12, 1.8 * mm, { isPiercing: true }, ri0, 0), tx0);
        }
        tadSfx('playClick');
    }
    update() {
        if (!this.active) return;
        this.t++;
        const o = this.owner;
        if (this.t >= this.dur || !o || o.hp <= 0) { this.active = false; return; }
        if (this.kind !== 'slash') return;
        const L = this.warn;
        if (this.t > L && this.t <= L + 10) {          // lướt tới tâm cảnh báo
            const k = (this.t - L) / 10;
            this.x = this.sx + (this.tx - this.w / 2 - this.sx) * k;
            this.y = this.sy + (this.ty - this.h / 2 - this.sy) * k;
        }
        if (this.t === L + 10 && !this.hitDone) {
            this.hitDone = true;
            const e = tadEnemy(o), R = 46;
            explosions.push(new Explosion(this.tx, this.ty, R, 'rgba(168, 85, 247,', 0, null));
            triggerScreenShake(4, 8); tadSfx('playExplosion');
            if (e && e.hp > 0 && gameState.phase === 'playing' && Math.hypot(e.x + e.w / 2 - this.tx, e.y + e.h / 2 - this.ty) < R + e.w * 0.4) {
                e.takeDamage(1.6 * this.m, o, {});
                tadResEffect(o, this.ri);
            }
        }
    }
    draw() { if (typeof tadDrawPhantom === 'function') tadDrawPhantom(this); }
}
// KQ 35: Không Kích — đánh dấu vị trí địch (bám nhẹ 0.5s rồi khóa đỏ), 1.3s sau nổ
class TadMark {
    constructor(owner, x, y, ri, m) {
        this.owner = owner; this.id = owner.id; this.x = x; this.y = y; this.ri = ri; this.m = m || 1;
        this.r = 44; this.t = 0; this.dur = 78; this.lock = 30; this.active = true;
    }
    update() {
        if (!this.active) return;
        const o = this.owner, e = o ? tadEnemy(o) : null;
        this.t++;
        if (this.t < this.lock && e) this.x += (e.x + e.w / 2 - this.x) * 0.06;
        if (this.t >= this.dur) {
            this.active = false;
            explosions.push(new Explosion(this.x, this.y, this.r, 'rgba(255, 59, 92,', 0, null));
            spawnSparkParticles(this.x, this.y, TAD_RED, 14); tadSfx('playExplosion');
            if (o && o.hp > 0 && e && e.hp > 0 && gameState.phase === 'playing' && Math.abs(e.x + e.w / 2 - this.x) < this.r + e.w / 2 - 6) {
                e.takeDamage(1.3 * this.m, o, {});
                tadResEffect(o, this.ri);
            }
        }
    }
    draw() { if (typeof tadDrawMark === 'function') tadDrawMark(this); }
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
