// ==========================================
// Cuồng Phong (storm) — Logic (cập nhật, bắn, kỹ năng)
// Nhả nút: lao lên làn địch (xoay tròn phản đạn thường). Cuối đường lao theo % lực:
//   <50%: chém 1 nhát rồi lướt về | 50–99%: GIÓ LỐC 2s | 100%: LÔI BÃO 4s (ẩn, bất tử, không thể bị nhắm)
// ==========================================
const ST_DMG = 2.0;          // Dame gốc
const ST_WINDUP = 30;        // 0.5s rung lắc = đang chém (radar quét kiếm + vùng cảnh báo)
const ST_TIER = [
    null,
    { kind: 'wind', dur: 120, r: 75, mult: 0.25, pull: 0.55, slow: 0.25, cut: 1.2, name: 'GIÓ LỐC 🌪️', col: '#5eead4' },
    { kind: 'thunder', dur: 240, r: 105, mult: 0.3, pull: 1.0, slow: 0.35, cut: 1.8, name: 'LÔI BÃO ⚡', col: '#a78bfa' },
];

function stFull(p) { return p.hasUpgrade('evo_storm_1') && p.hasUpgrade('evo_storm_2'); }
function stEnemy(p) { return p.id === 1 ? p2 : p1; }
function stSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
// Tâm làn địch (tọa độ y)
function stEnemyLaneY(p) { const e = stEnemy(p); return e.y + e.h / 2; }

// Lướt giật về vị trí cũ (an toàn: gọi được ở bất kỳ trạng thái nào)
function stReturn(p, silent) {
    const o = p.stOrigin;
    const fx = p.x + p.w / 2, fy = p.y + p.h / 2;
    p.stMode = 'idle'; p.stHidden = false; p.stormDashState = 0; p.stormSlashDelay = 0;
    if (!o) return;
    p.x = Math.max(0, Math.min(canvas.width - p.w, o.x)); p.y = o.y;
    p.stOrigin = null;
    if (silent) return;
    p.invincibleTimer = Math.max(p.invincibleTimer || 0, 10);
    if (typeof bodyEffects !== 'undefined') bodyEffects.push(new StDashTrail(p.id, fx, fy, p.x + p.w / 2, p.y + p.h / 2));
    if (typeof spawnSparkParticles === 'function') spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, '#99f6e4', 10);
    stSfx('playDash');
}

// Kết thúc Gió Lốc / Lôi Bão: nhát chém chẻ đôi cơn lốc -> lướt về
function stEndStorm(p, tor) {
    const tier = ST_TIER[tor.kind === 'thunder' ? 2 : 1];
    const R = tor.r * 1.05, dmg = ST_DMG * tier.cut;
    iceZones.push(new StormSlash(tor.x, tor.y, R, dmg, p, p.hasUpgrade('evo_storm_1')));
    bodyEffects.push(new StSplitFx(p.id, tor.x, tor.y, tor.r, tor.kind));
    // Lôi Bão + Evo 2 + đang có Khiên: chém bồi nhát 2 (+50%)
    if (tor.kind === 'thunder' && p.hasUpgrade('evo_storm_2') && p.shield > 0) {
        bodyEffects.push(new StDelayedSlash(p.id, tor.x, tor.y, R * 0.85, dmg * 0.5, 14, true, 'thunder'));
    }
    // Full Evo: Hư Ảnh Lặp Lại (phạm vi 1/2, dame 1/2 sau 0.3s)
    if (stFull(p)) bodyEffects.push(new StDelayedSlash(p.id, tor.x, tor.y, R * 0.5, dmg * 0.5, 18, false, tor.kind));
    addFloatingText(tor.x, tor.y - tor.r * 0.6, tor.kind === 'thunder' ? 'LÔI BÃO TRẢM!' : 'PHONG TRẢM!', tier.col, 15);
    triggerScreenShake(tor.kind === 'thunder' ? 12 : 8, 14);
    stSfx('playExplosion');
    stReturn(p);
}

// Cơn Lốc Nhỏ của Phân Thân (Evo 2) tại điểm cuối đường lao
function stCloneEnd(b, x, y) {
    if (b.stDone) return; b.stDone = true;
    const o = b.owner; if (!o || typeof bodyEffects === 'undefined') return;
    bodyEffects.push(new StTornado(o.id, 'mini', x, y, 55, 60, 0.3));
}
BulletHooks.register('storm_clone', {
    hit(b, attacker, victim) { stCloneEnd(b, victim.x + victim.w / 2, victim.y + victim.h / 2); },
    edge(b) { stCloneEnd(b, b.x + b.w / 2, Math.max(20, Math.min(canvas.height - 20, b.y + b.h / 2))); },
    obstacle(b) { stCloneEnd(b, b.x + b.w / 2, b.y + b.h / 2); },
});

Object.assign(Player.prototype, {
    // Phân Thân Lốc Xoáy (Evo 2): lao thẳng lên chém
    fireStormShadow() {
        let chargeSim = 0.2 + Math.random() * 0.6;
        let dirY = (this.id === 1) ? -1 : 1;
        this.bullets.push({
            x: this.x, y: this.y, w: this.w, h: this.h,
            vx: 0, vy: dirY * 15,
            dmg: 2 + chargeSim * 2,
            owner: this, hook: 'storm_clone',
            isStormShadow: true, stClone: true, stDone: false, hitIds: []
        });
    },

    // Nhát chém cơ bản (<50%) rồi lướt về
    executeStormSlash() {
        let ratio = this.savedChargeRatio || 0;
        let radius = 60 + (ratio * 60);
        let finalDmg = ST_DMG + (ratio * 1);
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        iceZones.push(new StormSlash(cx, cy, radius, finalDmg, this, this.hasUpgrade('evo_storm_1') && ratio > 0.5));
        explosions.push(new Explosion(cx, cy, 40, 'rgba(255,255,255,', 0, this));
        stReturn(this);
    },

    // [setupForNewRound] Cuồng Phong
    setupStorm() {
        if (this.weapon === 'storm') {
            this.speed += 1.5; // 3.5 + 1.5 = 5.0
            this.maxAmmo = 0;
            this.stormDashState = 0;
            this.stormChargeStart = 0;
            this.stormAutoChargeTimer = 0;
            this.stormMaxChargeTime = stFull(this) ? 2500 : 3500; // Giữ 3.5s đầy lực (Full Evo 2.5s)
            this.stormChargeRatio = 0;
            this.stormShadowTimer = 0;
            this.stormShadowCooldown = stFull(this) ? 180 + Math.random() * 120 : 180 + Math.random() * 300;
            this.shield = 1;
            this.stormSlashDelay = 0;
            this.stormReturnPos = null;
            this.stormEcho = false;
            this.stormHeld = false;
            this.stMode = 'idle'; this.stHidden = false; this.stOrigin = null; this.stTier = 0; this.stSlashR = 0;
        }
    },

    // [update] Cuồng Phong — trả về true nếu cần dừng update()
    updateStorm(inp) {
        if (this.weapon !== 'storm') return;
        // Passive Evo 2: Phân Thân Lốc Xoáy (mỗi 3–8s, Full Evo 3–5s)
        if (this.hasUpgrade('evo_storm_2')) {
            this.stormShadowTimer++;
            if (this.stormShadowTimer >= this.stormShadowCooldown) {
                this.fireStormShadow();
                this.stormShadowTimer = 0;
                this.stormShadowCooldown = stFull(this) ? 180 + Math.random() * 120 : 180 + Math.random() * 300;
            }
            // Phân Thân chạm làn địch -> kết thúc đường lao -> Cơn Lốc Nhỏ
            const ly = stEnemyLaneY(this), dir = this.id === 1 ? -1 : 1;
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const b = this.bullets[i];
                if (!b.stClone) continue;
                if ((dir < 0 && b.y + b.h / 2 <= ly) || (dir > 0 && b.y + b.h / 2 >= ly)) {
                    stCloneEnd(b, b.x + b.w / 2, ly);
                    this.bullets.splice(i, 1);
                }
            }
        }

        // Đang trong Gió Lốc / Lôi Bão: xe ẩn, đứng yên (cơn lốc tự điều khiển dòng thời gian)
        if (this.stMode === 'storm') {
            this.freezeTimer = 0;
            if (!bodyEffects.some(e => e instanceof StTornado && e.active && e.team === this.id && e.kind !== 'mini')) stReturn(this, true); // an toàn
            return true;
        }

        // 1. Rung lắc = đang chém (radar quét kiếm)
        if (this.stormSlashDelay > 0) {
            this.stormSlashDelay--;
            this.x += (Math.random() - 0.5) * 4;
            this.x = Math.max(0, Math.min(canvas.width - this.w, this.x));
            if (this.stormSlashDelay <= 0) this.executeStormSlash();
            return true;
        }

        // Tụ lực khi GIỮ nút bắn; nhả nút để xuất chiêu
        if (this.stormDashState === 0 && inp && inp.s) {
            let chargeDuration = this.stormMaxChargeTime || 3500;
            this.stormAutoChargeTimer = Math.min(chargeDuration, (this.stormAutoChargeTimer || 0) + (1000 / 60));
            this.stormChargeRatio = this.stormAutoChargeTimer / chargeDuration;
            // Mắt Bão (Evo 1): xóa đạn quanh xe khi tụ > 50% và có khiên
            if (this.hasUpgrade('evo_storm_1') && this.stormChargeRatio > 0.5 && this.shield > 0) {
                let enemyBullets = stEnemy(this).bullets;
                for (let i = enemyBullets.length - 1; i >= 0; i--) {
                    let b = enemyBullets[i];
                    if (Math.hypot((this.x + this.w / 2) - b.x, (this.y + this.h / 2) - b.y) < 80) enemyBullets.splice(i, 1);
                }
            }
        }

        // 2. Lao thân lên làn địch (xoay tròn phản đạn thường)
        if (this.stormDashState === 1) {
            const dir = (this.id === 1) ? -1 : 1;
            const enemy = stEnemy(this);
            this.y += 18 * dir;
            let hitObstacle = false;
            // Tới làn địch (tâm xe trùng tâm làn địch)
            const ly = enemy.y + enemy.h / 2 - this.h / 2;
            if ((dir < 0 && this.y <= ly) || (dir > 0 && this.y >= ly)) { this.y = ly; hitObstacle = true; }
            if (this.y < 0 || this.y > canvas.height - this.h) { this.y = (this.y < 0) ? 0 : canvas.height - this.h; hitObstacle = true; }
            // Gió Lốc / Lôi Bão: lao xuyên vật cản tới tận làn địch; nhát chém thường (<50%) dừng khi chạm địch / vật cản như cũ
            if (this.stTier === 0) {
            if (rectIntersect(this.x, this.y, this.w, this.h, enemy.x, enemy.y, enemy.w, enemy.h)) hitObstacle = true;
            if (typeof movingObstacle !== 'undefined' && movingObstacle && movingObstacle.active && rectIntersect(this.x, this.y, this.w, this.h, movingObstacle.x, movingObstacle.y, movingObstacle.w, movingObstacle.h)) hitObstacle = true;
            const groups = [typeof moneyTrucks !== 'undefined' ? moneyTrucks : [], typeof crates !== 'undefined' ? crates : [], typeof sniperWalls !== 'undefined' ? sniperWalls : []];
            for (const g of groups) for (const o of g) if (o.active && rectIntersect(this.x, this.y, this.w, this.h, o.x, o.y, o.w, o.h)) hitObstacle = true;
            for (let t of turrets) if (t.active && t.owner.id !== this.id && rectIntersect(this.x, this.y, this.w, this.h, t.x, t.y, t.w, t.h)) hitObstacle = true;
            }

            // Phản Đạn thường của địch trên đường lao
            const eb = enemy.bullets;
            for (let i = eb.length - 1; i >= 0; i--) {
                const b = eb[i];
                if (b.isPiercing || b.hook || b.isStormShadow || b.isStormPhantom || b.isBeam) continue;
                if (!rectIntersect(b.x, b.y, b.w || 4, b.h || 4, this.x - 10, this.y - 10, this.w + 20, this.h + 20)) continue;
                eb.splice(i, 1);
                b.owner = this; b.vx = -(b.vx || 0); b.vy = -(b.vy || 0); b.hitIds = [];
                this.bullets.push(b);
                if (typeof spawnSparkParticles === 'function') spawnSparkParticles(b.x, b.y, '#ccfbf1', 4);
            }

            if (hitObstacle) {
                this.stormDashState = 0;
                const tier = ST_TIER[this.stTier];
                if (!tier) { this.stormSlashDelay = ST_WINDUP; this.stSlashR = 60 + (this.savedChargeRatio || 0) * 60; }
                else {
                    // Gió Lốc / Lôi Bão: ẩn mình trong cơn lốc
                    const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
                    this.stMode = 'storm'; this.stHidden = true;
                    bodyEffects.push(new StTornado(this.id, tier.kind, cx, cy, tier.r, tier.dur, ST_DMG * tier.mult));
                    explosions.push(new Explosion(cx, cy, tier.r * 0.7, tier.kind === 'thunder' ? 'rgba(167, 139, 250,' : 'rgba(94, 234, 212,', 0, this));
                    addFloatingText(cx, cy - tier.r * 0.5, tier.name, tier.col, 15);
                    triggerScreenShake(6, 10);
                    stSfx('playPowerup');
                }
            }
            return true;
        }
    },

    // [update] Cuồng Phong
    updateStorm2() {
        if (this.weapon === 'storm' && stFull(this)) isRaining = true;
    },

    // [handleShooting] Cuồng Phong — trả về true nếu cần dừng handleShooting()
    shootStorm(inp) {
        if (this.weapon !== 'storm') return;
        if (this.stormDashState === 1 || this.stormSlashDelay > 0 || this.stMode === 'storm') { this.stormHeld = !!inp.s; inp.s = false; return true; }
        const released = !inp.s && this.stormHeld;
        this.stormHeld = !!inp.s;
        if (released) {
            let ratio = this.stormChargeRatio || 0;
            if (ratio >= 0.05) {
                this.savedChargeRatio = ratio;
                this.stOrigin = { x: this.x, y: this.y };
                this.stTier = ratio >= 0.999 ? 2 : (ratio >= 0.5 ? 1 : 0);
                if (ratio >= 0.999 && this.hasUpgrade('evo_storm_1')) this.shield += 2;
                this.stormDashState = 1;
                stSfx('playDash');
            }
            this.stormAutoChargeTimer = 0;
            this.stormChargeRatio = 0;
            this.stormChargeStart = 0;
        }
        inp.s = false;
        return true;
    }
});

// Bot: thỉnh thoảng tụ tới 50% / 100% (số tick giữ nút)
function stBotHoldN(bot) {
    const full = Math.ceil((bot.stormMaxChargeTime || 3500) / (1000 / 60)) + 2;
    const r = Math.random();
    return r < 0.45 ? 40 : (r < 0.8 ? Math.ceil(full * 0.62) : full);
}

CharHooks.register('storm', {
    roundEnd() { stReturn(this, true); },
});

// takeDamage: ẩn trong lốc = Bất Tử; chết giữa chiêu -> về vị trí cũ; kết liễu CUỒNG PHONG / THIÊN PHONG
(function () {
    const orig = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker) {
        if (this.weapon === 'storm' && this.stHidden) return 0;
        const before = this.hp;
        const r = orig.apply(this, arguments);
        if (this.weapon === 'storm' && this.hp <= 0 && (this.stOrigin || this.stMode !== 'idle')) stReturn(this, true);
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && attacker.weapon === 'storm'
            && typeof bodyEffects !== 'undefined' && !bodyEffects.some(e => e instanceof StFinisher)) {
            bodyEffects.push(new StFinisher(attacker, this));
            triggerScreenShake(8, 12);
            if (typeof spawnSparkParticles === 'function') spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, '#5eead4', 24);
            stSfx('playExplosion');
        }
        return r;
    };
})();
