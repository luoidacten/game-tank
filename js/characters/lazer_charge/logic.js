// ==========================================
// Lazer Xuyên Phá (lazer_charge) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    fireBeam() {
        const isEvo = this.hasUpgrade('evo_lazer_c_1');
        const beamW = isEvo ? 30 : 10;
        const beamX = this.x + this.w / 2 - beamW / 2;
        const bRx = beamX; let bRy = (this.id === 1 ? 0 : this.y + this.h);
        const bRw = beamW; let bRh = (this.id === 1 ? this.y : canvas.height - (this.y + this.h));
        const swBlk = sniperWallClipBeam(this, bRx, bRy, bRw, bRh, this.id === 1 ? -1 : 1, 20); // Tường Sniper chặn tia
        if (swBlk) { bRy = swBlk.y; bRh = swBlk.h; }
        beams.push(new Beam(beamX, bRy, beamW, bRh, this.id, isEvo));

        const enemy = (this.id === 1) ? p2 : p1;
        // [ĐỔI] Tia lớn 20 dame (one-shot), Full Evo xuyên khiên. Đây là đòn hitscan duy nhất không cảnh báo:
        // người chơi phải giữ nạp 1.5s (thanh nạp & nòng sáng là tín hiệu cho đối thủ).
        const lcFull = this.hasUpgrade('evo_lazer_c_1') && this.hasUpgrade('evo_lazer_c_2');
        if (rectIntersect(bRx, bRy, bRw, bRh, enemy.x, enemy.y, enemy.w, enemy.h)) {
            enemy.takeDamage(20, this, lcFull ? { bypassShield: true, isPiercing: true } : {});
            if (typeof fxSlashHit === 'function') fxSlashHit(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#7dd3fc', 30);
        }

        crates.forEach(c => {
            if (c.active && rectIntersect(bRx, bRy, bRw, bRh, c.x, c.y, c.w, c.h)) {
                c.active = false;
                crateOnBreak(c, this);
                if (c.isMimic) triggerMimicExplosion(c, this);
                if (c.type === 'hp') this.hp = Math.min(this.hp + 2, this.maxHp);
                if (c.type === 'ammo') this.onCollectAmmoCrate(c);
                if (c.type === 'shield') this.shield++;
                if (c.type === 'dmg') this.dmgBuff++;
                if (this.weapon === 'evolution') this.onEvolutionCrateEat(c.type);
                if (c.type === 'boom') explosions.push(new Explosion(c.x + c.w / 2, c.y + c.h / 2, 60, 'rgba(255,0,0,', 0, null));
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
            // [ĐỔI CƠ CHẾ] Giữ nút để tụ tia (1.2s), nhả ra phóng tia Xuyên Phá. Nhấp nhanh = đạn thường.
            if (inp.s) {
                this.lcHold = (this.lcHold || 0) + 1;
                this.chargeLevel = Math.min(7, (this.lcHold / 90) * 7);
            } else if (this.lcHold > 0) {
                const held = this.lcHold;
                this.lcHold = 0; this.chargeLevel = 0;
                if (held >= 90 && this.ammo >= 6) { this.fireBeam(); this.ammo -= 6; this.lastShot = now; }
                else if (held < 90 && this.ammo > 0 && now - this.lastShot > 220) { this.fireBullet(1); this.ammo--; this.lastShot = now; }
            }
            return true;
        }
    }
});
