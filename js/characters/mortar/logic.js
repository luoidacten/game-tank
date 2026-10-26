// ==========================================
// Mortar — Pháo Cối Công Thành (mortar) — Logic: "Hãy ngước nhìn bầu trời trên đầu ngươi kìa!"
// ------------------------------------------
// Nội tại Sky-Drop: mọi đạn cối là thực thể rơi từ trời (isAerialDrop = true), KHÔNG nằm trong owner.bullets
//   -> không bị Tường / Ụ súng / Búp bê / Khiên chắn / Trường Niệm Lực / Vùng Điện Tích chặn hay bắt.
//   Hồng Tâm: lệch trục X <= 18px -> +0.4 Dame & phá ngay 1 lớp Khiên.
// Nhấp: 1 quả đạn cối theo X hiện tại của Mortar, Vòng Cảnh Báo 70px trên làn địch 0.75s -> nổ 1.7 + hất 50px.
// Giữ 0.5s: Mưa Pháo Rải Thảm (CD 8s, không tốn đạn): 3 quả cách 0.2s vào X địch / X-85 / X+85,
//   vòng 55px, 1.0 + chậm 30% 1.5s.
// Evo 1: rơi 0.55s, +1 đạn, nạp nhanh 25%. Evo 2: Hố Đạn Nóng Đỏ 65px 2.5s (0.3 HP/s, chậm 25%), CD 5.5s.
// FULL: mỗi phát thứ 3 = Đại Pháo Cối (90px, 2.2) nảy 2 Đạn Chùm ±70px (0.35s, 0.8);
//   Hồng Tâm -> +0.3 Giáp Trắng & -1s CD Rải Thảm.
// Trạng thái: trường thuần trên player & thực thể trong bodyEffects (có trong NET_CLASSES).
// ==========================================

const MR_HOLD = 30, MR_GCD = 20, MR_BULL = 18;
const MR_RED = '#ff3b3b', MR_ORANGE = '#ff8a1f', MR_GOLD = '#fde047', MR_CYAN = '#22d3ee';

function mrE1(p) { return p.hasUpgrade('evo_mortar_1'); }
function mrE2(p) { return p.hasUpgrade('evo_mortar_2'); }
function mrFull(p) { return mrE1(p) && mrE2(p); }
function mrIs(p) { return p && p.weapon === 'mortar'; }
function mrEnemy(p) { return p === p1 ? p2 : p1; }
function mrSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function mrTxt(p, s, c, sz) { addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -20 : p.h + 24), s, c, sz || 12); }
function mrWarn(p) { return mrE1(p) ? 33 : 45; }            // 0.75s -> 0.55s
function mrBarrageCD(p) { return mrE2(p) ? 330 : 480; }     // 8.0s -> 5.5s
function mrClampX(x) { return Math.max(12, Math.min(canvas.width - 12, x)); }

// ---------- Đạn cối rơi từ trời ----------
// kind: 'main' (thường) | 'big' (Đại Pháo Cối) | 'small' (Rải Thảm) | 'frag' (Đạn Chùm)
class MrShell {
    constructor(owner, x, y, kind, delay) {
        this.owner = owner; this.isAerialDrop = true;
        this.x = mrClampX(x); this.y = y; this.kind = kind;
        this.ox = owner.x + owner.w / 2; this.oy = owner.y + owner.h / 2;
        this.r = kind === 'big' ? 45 : (kind === 'small' ? 27.5 : (kind === 'frag' ? 22 : 35));
        this.dmg = kind === 'big' ? 2.2 : (kind === 'small' ? 1.0 : (kind === 'frag' ? 0.8 : 1.7));
        this.t = 0; this.dur = delay; this.boom = 0; this.active = true;
    }
    update() {
        if (this.boom > 0) { if (++this.boom > 18) this.active = false; return; }
        if (++this.t >= this.dur) this.land();
    }
    land() {
        const p = this.owner, e = mrEnemy(p);
        this.boom = 1;
        const big = this.kind === 'big';
        explosions.push(new Explosion(this.x, this.y, this.r + 14, big ? 'rgba(255, 140, 30,' : 'rgba(255, 70, 40,', 0, p));
        spawnSparkParticles(this.x, this.y, MR_ORANGE, big ? 18 : 10);
        triggerScreenShake(big ? 9 : (this.kind === 'main' ? 6 : 3), big ? 14 : 8);
        mrSfx('playExplosion');
        if (e && e.hp > 0) {
            const ex = e.x + e.w / 2, dx = ex - this.x;
            const inLane = Math.abs(e.y + e.h / 2 - this.y) < e.h / 2 + 22;
            if (inLane && Math.abs(dx) <= this.r + e.w / 2 - 6) {
                let dmg = this.dmg, bull = false;
                if ((this.kind === 'main' || big) && Math.abs(dx) <= MR_BULL) {
                    bull = true; dmg += 0.4;
                    if (e.shield > 0) { e.shield--; CharHooks.call(e, 'shieldBreak', p, { isAerialDrop: true }); addFloatingText(ex, e.y + (e.id === 1 ? -26 : e.h + 30), 'PHÁ KHIÊN!', MR_CYAN, 11); }
                    addFloatingText(ex, e.y + (e.id === 1 ? -12 : e.h + 16), '◎ HỒNG TÂM!', MR_GOLD, 13);
                    if (mrFull(p)) { p.gearWhiteShield = (p.gearWhiteShield || 0) + 0.3; p.mrCd = Math.max(0, (p.mrCd || 0) - 60); }
                }
                e.takeDamage(dmg, p, { isAerialDrop: true });
                if (this.kind === 'small') e.mrSlowT = Math.max(e.mrSlowT || 0, 90);
                if (this.kind === 'main' || big) { e.mrKnockT = 10; e.mrKnockV = (Math.sign(dx) || (Math.random() < 0.5 ? -1 : 1)) * 5; }
                p.mrBullFx = bull ? 20 : 0;
            }
        }
        if (typeof gmZoneHitTwin === 'function') gmZoneHitTwin(p, this.x, this.y, this.r, this.dmg);
        if ((this.kind === 'main' || big) && mrE2(p)) bodyEffects.push(new MrCrater(p, this.x, this.y));
        if (big) [-70, 70].forEach(o => bodyEffects.push(new MrShell(p, this.x + o, this.y, 'frag', 21)));
    }
    // né cho bot đối phương: vòng cảnh báo trên làn
    botThreat(bot) {
        if (this.boom > 0 || bot === this.owner) return null;
        if (Math.abs(bot.y + bot.h / 2 - this.y) > bot.h / 2 + 22) return null;
        return { t: Math.max(1, this.dur - this.t), x: this.x, half: this.r + bot.w / 2 - 4, w: this.kind === 'small' || this.kind === 'frag' ? 1.5 : 2.5 };
    }
    draw() { if (typeof mrDrawShell === 'function') mrDrawShell(this); }
}

// ---------- Hố Đạn Nóng Đỏ (Evo 2) ----------
class MrCrater {
    constructor(owner, x, y) {
        this.owner = owner; this.x = x; this.y = y; this.r = 32.5;
        this.t = 0; this.dur = 150; this.acc = 0; this.active = true;
    }
    update() {
        if (++this.t >= this.dur) { this.active = false; return; }
        const p = this.owner, e = mrEnemy(p);
        if (!e || !(e.hp > 0)) return;
        if (Math.abs(e.y + e.h / 2 - this.y) < e.h / 2 + 22 && Math.abs(e.x + e.w / 2 - this.x) < this.r + e.w / 2 - 4) {
            addStatusSlow(e, 0.75);
            this.acc += 0.3 / 60;
            if (this.acc >= 0.1) { e.takeDamage(this.acc, p, { isDot: true }); this.acc = 0; }
        }
    }
    draw() { if (typeof mrDrawCrater === 'function') mrDrawCrater(this); }
}

function mrFire(p) {
    const e = mrEnemy(p); if (!e) return;
    p.mrShots = (p.mrShots || 0) + 1;
    const big = mrFull(p) && p.mrShots % 3 === 0;
    bodyEffects.push(new MrShell(p, p.x + p.w / 2, e.y + e.h / 2, big ? 'big' : 'main', mrWarn(p)));
    p.ammo--; p.lastShot = Date.now(); p.mrGcd = MR_GCD; p.mrRecoil = 10;
    if (big) mrTxt(p, 'ĐẠI PHÁO CỐI!', MR_GOLD, 13);
    mrSfx('playShoot');
}

function mrBarrage(p) {
    const e = mrEnemy(p); if (!e) return;
    const x = e.x + e.w / 2;
    p.mrQ = [{ t: 0, x }, { t: 12, x: x - 85 }, { t: 24, x: x + 85 }];
    p.mrQT = 0; p.mrCd = mrBarrageCD(p);
    mrTxt(p, 'MƯA PHÁO RẢI THẢM!', MR_ORANGE, 13);
}

CharHooks.register('mortar', {
    setup() {
        if (mrE1(this)) { this.maxAmmo += 1; this.reloadTime *= 0.75; }
        this.ammo = this.maxAmmo;
        this.mrHold = 0; this.mrPrevS = false; this.mrHoldUsed = false; this.mrGcd = 0; this.mrCd = 0;
        this.mrQ = null; this.mrQT = 0; this.mrShots = 0; this.mrRecoil = 0; this.mrBullFx = 0;
        const e = mrEnemy(this); if (e) { e.mrKnockT = 0; e.mrSlowT = 0; }
    },
    update(inp, eff, now) {
        if (this.mrGcd > 0) this.mrGcd--;
        if (this.mrCd > 0) this.mrCd--;
        if (this.mrRecoil > 0) this.mrRecoil--;
        if (this.mrBullFx > 0) this.mrBullFx--;
        // Evo 1: nạp nhanh 25% (nhịp hồi 1 quả 500ms -> 375ms)
        if (mrE1(this) && this.ammo < this.maxAmmo && now - this.lastShot > this.reloadTime && now - this.lastReload > 375) { this.ammo++; this.lastReload = now; }
        if (this.mrQ && this.mrQ.length) {
            const e = mrEnemy(this);
            while (this.mrQ.length && this.mrQ[0].t <= this.mrQT) {
                const s = this.mrQ.shift();
                if (e) bodyEffects.push(new MrShell(this, s.x, e.y + e.h / 2, 'small', mrWarn(this)));
                this.mrRecoil = 8; mrSfx('playShoot');
            }
            this.mrQT++;
            if (!this.mrQ.length) this.mrQ = null;
        }
        const e = mrEnemy(this);
        if (e) {
            if (e.mrKnockT > 0) { e.mrKnockT--; e.x = Math.max(0, Math.min(canvas.width - e.w, e.x + (e.mrKnockV || 0))); }
            if (e.mrSlowT > 0) { e.mrSlowT--; addStatusSlow(e, 0.7); }
        }
    },
    shoot(inp) {
        const s = !!inp.s;
        if (this.silenceTimer > 0 || this.freezeTimer > 0) { this.mrHold = 0; this.mrPrevS = s; return true; }
        if (s) {
            this.mrHold++;
            if (this.mrHold === MR_HOLD && !this.mrHoldUsed) {
                this.mrHoldUsed = true;
                if (this.mrCd <= 0 && !this.mrQ) mrBarrage(this);
                else mrTxt(this, 'RẢI THẢM: ' + (this.mrCd / 60).toFixed(1) + 's', '#94a3b8', 11);
            }
        } else if (this.mrPrevS) {
            if (!this.mrHoldUsed && this.mrHold < MR_HOLD && this.mrGcd <= 0 && this.ammo > 0) mrFire(this);
            this.mrHold = 0; this.mrHoldUsed = false;
        }
        this.mrPrevS = s;
        return true;
    },
});

// ---------- Kết liễu: TỌA ĐỘ HỦY DIỆT — ĐẠI PHÁO KÍCH ----------
const MRF_DUR = 230, MRF_LOCK = 40, MRF_RAIN = 70, MRF_N = 22;
function mrfR(s, i) { const x = Math.sin(s * 12.9898 + i * 78.233) * 43758.5453; return x - Math.floor(x); }
class MrFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.ox = owner.x + owner.w / 2; this.oy = owner.y + owner.h / 2;
        this.t = 0; this.dur = MRF_DUR; this.active = true;
        this.seed = Math.round(Math.random() * 1000) / 100;
    }
    // thời điểm chạm đất & vị trí quả thứ i (tất định)
    shell(i) { return { at: MRF_RAIN + i * 4, x: this.x + (mrfR(this.seed, i) - 0.5) * 150, y: this.y + (mrfR(this.seed, i + 50) - 0.5) * 34 }; }
    update() {
        this.t++;
        const t = this.t;
        if (t === 8 || t === 24) mrSfx('playLaser');
        for (let i = 0; i < MRF_N; i++) {
            const s = this.shell(i);
            if (t === s.at) {
                explosions.push(new Explosion(s.x, s.y, 34 + (i % 3) * 10, i % 2 ? 'rgba(255, 120, 30,' : 'rgba(255, 60, 40,', 0, null));
                if (i % 3 === 0) { triggerScreenShake(7, 8); mrSfx('playExplosion'); }
            }
        }
        const last = MRF_RAIN + (MRF_N - 1) * 4 + 6;
        if (t === last) {
            explosions.push(new Explosion(this.x, this.y, 110, 'rgba(255, 170, 40,', 0, null));
            spawnSparkParticles(this.x, this.y, MR_ORANGE, 30); spawnSparkParticles(this.x, this.y, MR_GOLD, 16);
            triggerScreenShake(16, 24); mrSfx('playExplosion');
        }
        if (t === 185) mrSfx('playWin');
        if (t >= this.dur) this.active = false;
    }
    camPath() {
        if (typeof fcamKeys !== 'function') return null;
        const W = canvas.width, H = canvas.height, A = this.team === 1 ? -1 : 1;
        return fcamKeys(this.t, [[0, W / 2, H / 2, 1], [12, this.ox, this.oy + A * 30, 1.5], [34, this.ox, this.oy + A * 40, 1.5],
            [58, this.x, this.y, 1.45], [MRF_RAIN + 40, this.x, this.y, 1.25], [MRF_RAIN + 96, this.x, this.y - A * 10, 1.55], [200, W / 2, H / 2, 1]]);
    }
    draw() { }
    drawOver() { if (typeof mrDrawFinisher === 'function') mrDrawFinisher(this); }
}
function mrFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof MrFinisher && e.active) e.drawOver();
}
(function () {
    if (typeof Player === 'undefined') return;
    const orig = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker) {
        const before = this.hp;
        const r = orig.apply(this, arguments);
        if (before > 0 && this.hp <= 0 && typeof bodyEffects !== 'undefined') {
            const a = typeof bfAttacker === 'function' ? bfAttacker(attacker) : (attacker instanceof Player ? attacker : null);
            if (a && a !== this && mrIs(a) && !(typeof finisherFxActive === 'function' && finisherFxActive())) {
                const fc = typeof fatalCinematic !== 'undefined' ? fatalCinematic : null;
                if (!(fc && fc.active && (a.id !== fc.winnerId || fc.fxSeen))) bodyEffects.push(new MrFinisher(a, this));
            }
        }
        return r;
    };
})();

// ---------- Bot: 'tap' | 'barrage' | null ----------
function mrBotAction(bot, enemy) {
    if (!enemy || !(enemy.hp > 0)) return null;
    const ex = enemy.x + enemy.w / 2, pred = ex + (enemy._vx || 0) * mrWarn(bot) * 0.7;
    if (bot.mrCd <= 0 && !bot.mrQ && Math.random() < 0.04) return 'barrage';
    if (bot.mrGcd > 0 || bot.ammo <= 0) return null;
    return Math.abs(pred - (bot.x + bot.w / 2)) < 22 ? 'tap' : null;
}
