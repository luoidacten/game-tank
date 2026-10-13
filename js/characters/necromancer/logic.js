// ==========================================
// necromancer (necromancer) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [setupForNewRound] necromancer
    setupNecromancer() {
        if (this.weapon === 'necromancer') {
            this.maxHp = 1;
            this.hp = 1;
            let armorBonus = (this.upgrades || []).filter(u => u === 'armor').length;
            let evo2Bonus = (this.hasUpgrade && this.hasUpgrade('evo_necro_2')) ? 4 : 0;
            this.maxSouls = 6 + armorBonus + evo2Bonus;
            this.currentSouls = this.maxSouls;
            this.lockedSouls = 0;
            this.necroRegenTimer = 0;
            this.necroRegenCooldown = 0;
            this.necroChargeFrames = 0;
            if (typeof necroMinions !== 'undefined') {
                necroMinions = necroMinions.filter(m => m.owner !== this);
            }
        }
    },

    // [update] necromancer
    updateNecromancer(now, effectiveInp) {
        if (this.weapon === 'necromancer') {
            // 1. Tự động hồi Linh Hồn theo chu kỳ (khóa hồi 3s sau khi nhận sát thương)
            if ((this.necroRegenCooldown || 0) > 0) {
                this.necroRegenCooldown--;
            } else {
                let necroRegenInterval = this.hasUpgrade('evo_necro_1') ? 180 : 300;
                let necroRegenAmount = this.hasUpgrade('evo_necro_1') ? 3 : 2;
                this.necroRegenTimer = (this.necroRegenTimer || 0) + 1;
                if (this.necroRegenTimer >= necroRegenInterval) {
                    this.necroRegenTimer = 0;
                    let cap = this.maxSouls - (this.lockedSouls || 0);
                    if (this.currentSouls < cap) {
                        this.currentSouls = Math.min(cap, this.currentSouls + necroRegenAmount);
                        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, `+${necroRegenAmount} LINH HỒN 👻`, "#00e676", 11);
                    }
                }
            }

            // 2. Tụ lực phím Bắn để Triệu Hồi Vong Linh
            if (effectiveInp.s) {
                this.necroChargeFrames = (this.necroChargeFrames || 0) + 1;
            } else {
                if ((this.necroChargeFrames || 0) > 0) {
                    let held = this.necroChargeFrames;
                    this.necroChargeFrames = 0;

                    if (held < 30) {
                        // Nhấp bắn thông thường (< 0.5s): Đạn phép linh hồn
                        if (this.ammo > 0 && now - this.lastShot > 350) {
                            this.fireBullet(1, false, 'necro_soul');
                            this.ammo--;
                            this.lastShot = now;
                        }
                    } else if (held >= 30 && held < 60) {
                        // Mốc 1 (0.5s - 1.0s): Linh Xương Cảm Tử (Khóa 2 Souls)
                        if ((this.currentSouls || 0) >= 2) {
                            this.currentSouls -= 2;
                            this.lockedSouls = (this.lockedSouls || 0) + 2;
                            necroMinions.push(new NecroMinion(this, 'kamikaze'));
                            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 30, '#ff5722', 0, this));
                            if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 16, "TRIỆU HỒI CẢM TỬ! 💀🔥", "#ff5722", 14);
                        } else {
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 16, "KHÔNG ĐỦ LINH HỒN! ⚠️", "#ff3333", 13);
                            this.fireBullet(1, false, 'necro_soul');
                        }
                    } else if (held >= 60 && held < 90) {
                        // Mốc 2 (1.0s - 1.5s): Linh Xương Xạ Thủ (Khóa 4 Souls)
                        if ((this.currentSouls || 0) >= 4) {
                            this.currentSouls -= 4;
                            this.lockedSouls = (this.lockedSouls || 0) + 4;
                            necroMinions.push(new NecroMinion(this, 'shooter'));
                            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 30, '#00e676', 0, this));
                            if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 16, "TRIỆU HỒI XẠ THỦ! 💀🏹", "#00e676", 14);
                        } else if ((this.currentSouls || 0) >= 2) {
                            this.currentSouls -= 2;
                            this.lockedSouls = (this.lockedSouls || 0) + 2;
                            necroMinions.push(new NecroMinion(this, 'kamikaze'));
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 16, "TRIỆU HỒI CẢM TỬ! 💀🔥", "#ff5722", 14);
                        } else {
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 16, "KHÔNG ĐỦ LINH HỒN! ⚠️", "#ff3333", 13);
                            this.fireBullet(1, false, 'necro_soul');
                        }
                    } else if (held >= 90) {
                        // Mốc 3 (> 1.5s): Linh Xương Cao Cấp (Khóa 6 Souls)
                        if ((this.currentSouls || 0) >= 6) {
                            this.currentSouls -= 6;
                            this.lockedSouls = (this.lockedSouls || 0) + 6;
                            necroMinions.push(new NecroMinion(this, 'elite'));
                            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 40, '#ab47bc', 0, this));
                            if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 16, "TRIỆU HỒI CAO CẤP! 💀👑", "#ab47bc", 15);
                        } else if ((this.currentSouls || 0) >= 4) {
                            this.currentSouls -= 4;
                            this.lockedSouls = (this.lockedSouls || 0) + 4;
                            necroMinions.push(new NecroMinion(this, 'shooter'));
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 16, "TRIỆU HỒI XẠ THỦ! 💀🏹", "#00e676", 14);
                        } else if ((this.currentSouls || 0) >= 2) {
                            this.currentSouls -= 2;
                            this.lockedSouls = (this.lockedSouls || 0) + 2;
                            necroMinions.push(new NecroMinion(this, 'kamikaze'));
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 16, "TRIỆU HỒI CẢM TỬ! 💀🔥", "#ff5722", 14);
                        } else {
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 16, "KHÔNG ĐỦ LINH HỒN! ⚠️", "#ff3333", 13);
                            this.fireBullet(1, false, 'necro_soul');
                        }
                    }
                }
            }
        }
    }
});
