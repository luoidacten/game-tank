// ==========================================
// Lazer Xuyên Phá (lazer_charge) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    fireBeam() {
        const isEvo = this.hasUpgrade('evo_lazer_c_1');
        const beamW = isEvo ? 30 : 10;
        const beamX = this.x + this.w / 2 - beamW / 2;
        beams.push(new Beam(beamX, (this.id === 1 ? 0 : this.y + this.h), beamW, (this.id === 1 ? this.y : canvas.height - (this.y + this.h)), this.id, isEvo));

        const bRx = beamX; const bRy = (this.id === 1 ? 0 : this.y + this.h);
        const bRw = beamW; const bRh = (this.id === 1 ? this.y : canvas.height - (this.y + this.h));

        const enemy = (this.id === 1) ? p2 : p1;
        if (rectIntersect(bRx, bRy, bRw, bRh, enemy.x, enemy.y, enemy.w, enemy.h)) { enemy.takeDamage(6, this); }

        crates.forEach(c => {
            if (c.active && rectIntersect(bRx, bRy, bRw, bRh, c.x, c.y, c.w, c.h)) {
                c.active = false;
                if (c.isMimic) triggerMimicExplosion(c, this);
                if (c.type === 'hp') this.hp = Math.min(this.hp + 2, this.maxHp);
                if (c.type === 'ammo') this.onCollectAmmoCrate(c);
                if (c.type === 'shield') this.shield++;
                if (c.type === 'dmg') this.dmgBuff++;
                if (this.weapon === 'evolution') this.onEvolutionCrateEat(c.type);
                if (c.type === 'boom') explosions.push(new Explosion(c.x + c.w / 2, c.y + c.h / 2, 60, 'rgba(255,0,0,', 2, null));
                if (c.type === 'coin') {
                    let money = 30; if (this.weapon === 'money_tank') money *= 2;
                    if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                }
            }
        });

        moneyTrucks.forEach(t => {
            if (t.active && rectIntersect(bRx, bRy, bRw, bRh, t.x, t.y, t.w, t.h)) {
                let dmg = 8; if (this.weapon === 'money_tank') dmg *= 3;
                t.hp -= dmg;
                if (t.hp <= 0) {
                    t.active = false;
                    let money = 50; if (this.weapon === 'money_tank') money *= 2;
                    if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                    if (this.weapon === 'evolution') this.onEvolutionCrateEat('truck');
                    if (this.hasUpgrade('evo_money_atk')) explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 100, 'rgba(255,215,0,', 5, this));
                }
            }
        });
    },

    // [handleShooting] Lazer Xuyên Phá — trả về true nếu cần dừng handleShooting()
    shootLazerCharge(inp, now) {
        if (this.weapon === 'lazer_charge') {
            if (this.ammo === this.maxAmmo) {
                if (!this.startChargeTime) this.startChargeTime = now;
                const chargeDuration = 2000;
                const progress = Math.min(now - this.startChargeTime, chargeDuration);
                this.chargeLevel = (progress / chargeDuration) * 7;
            } else { this.chargeLevel = 0; this.startChargeTime = null; }

            if (inp.s) {
                if (this.chargeLevel >= 6.9) { this.fireBeam(); this.ammo = 0; }
                else if (this.ammo > 0) { this.fireBullet(0.25); this.ammo--; }
                this.lastShot = now; this.chargeLevel = 0; this.startChargeTime = null; inp.s = false;
            }
            return true;
        }
    }
});
