// ==========================================
// Kỹ Sư (engineer) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [setupForNewRound] Kỹ Sư
    setupEngineer() {
        if (this.weapon === 'engineer') {
            this.turretTimer = 0;
            this.smartTurretCharge = 0;
            this.engineerPressFrames = 0;
            this.isOverloaded = false;
            this.overloadDuration = 0;
            this.overloadCooldown = 0;
        }
    },

    // [update] Kỹ Sư
    updateEngineer(inp) {
        if (this.weapon === 'engineer') {
            let hasEvo1 = this.hasUpgrade('evo_eng_1');
            let hasEvo2 = this.hasUpgrade('evo_eng_2');
            let isFullEvo = hasEvo1 && hasEvo2;

            // 1. Tự động sinh Ụ súng thường (2s nếu Full Evo, 5s nếu thường)
            let normalInterval = (isFullEvo ? 120 : 300) - (isFullEvo ? 12 : 36) * bodyShopLvl(this, 'eng_build'); // Lắp Ráp Siêu Tốc
            this.turretTimer = (this.turretTimer || 0) + 1;
            if (this.turretTimer >= normalInterval) {
                turrets.push(new Turret(this, false));
                this.turretTimer = 0;
            }

            // Cờ Lê Hiện Trường (Kho Phụ Tùng): hồi máu ụ gần Kỹ Sư
            if (bodyShopLvl(this, 'eng_repair') > 0) {
                const ocx = this.x + this.w / 2, ocy = this.y + this.h / 2;
                turrets.forEach(t => { if (t.active && t.owner === this && Math.hypot(t.x + t.w / 2 - ocx, t.y + t.h / 2 - ocy) <= 70) t.hp = Math.min(t.maxHp, t.hp + 0.01); });
            }

            // 2. Cooldown quá tải
            if (this.overloadCooldown > 0) this.overloadCooldown--;

            // 3. Quá tải đang kích hoạt (kéo dài 600s = 36000 frames)
            if (this.isOverloaded) {
                this.overloadDuration--;
                if (this.overloadDuration % 5 === 0) {
                    ctx.fillStyle = "#00ffff"; ctx.fillRect(this.x + Math.random() * this.w, this.y, 2, this.h);
                }
                if (this.overloadDuration <= 0) {
                    this.isOverloaded = false;
                    this.silenceTimer = 60; // Câm lặng 1s
                    this.slowTimer = 300;   // Giảm tốc 5s
                    this.overloadCooldown = 480; // Cooldown 8s
                    addFloatingText(this.x + this.w / 2, this.y - 15, "QUÁ TẢI KẾT THÚC!", "#ff3300", 14);
                }
            }

            // 4. Nhấn giữ nút bắn:
            // - Giữ 1s (60 frames) -> Đặt Ụ súng thông minh
            // - Giữ 2s (120 frames) nếu có Evo 2 -> Bật Quá Tải
            if (inp.s) {
                this.smartTurretCharge = (this.smartTurretCharge || 0) + 1;

                // Visual vòng tụ lực
                ctx.save();
                ctx.strokeStyle = this.smartTurretCharge >= 60 ? "#ffff00" : "#00ffff";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                let chargeProgress = (this.smartTurretCharge < 60) ? (this.smartTurretCharge / 60) : ((this.smartTurretCharge - 60) / 60);
                ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 28, 0, Math.min(1, chargeProgress) * Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                if (this.smartTurretCharge === 60) {
                    // Đặt Ụ súng thông minh
                    let smartTurrets = turrets.filter(t => t.active && t.owner === this && t.isSmart);
                    let maxSmart = (isFullEvo ? 5 : (hasEvo1 ? 3 : 2)) + bodyShopLvl(this, 'eng_smart');
                    if (smartTurrets.length >= maxSmart) {
                        let oldest = smartTurrets[0];
                        oldest.active = false;
                        explosions.push(new Explosion(oldest.x + oldest.w / 2, oldest.y + oldest.h / 2, 25, '#00ffff', 0, this));
                    }
                    turrets.push(new Turret(this, true));
                    soundSystem.playPowerup();
                    addFloatingText(this.x + this.w / 2, this.y - 15, "Ụ THÔNG MINH!", "#00ffff", 14);
                } else if (this.smartTurretCharge >= 120 && hasEvo2 && !this.isOverloaded && (this.overloadCooldown || 0) <= 0 && this.maxHp > 1) {
                    // Kích hoạt Quá Tải (Evo 2 / Full Evo)
                    this.isOverloaded = true;
                    this.overloadDuration = 36000; // 600s
                    this.maxHp = Math.max(1, this.maxHp - 1); // Đánh đổi 1 máu tối đa
                    this.hp = Math.min(this.hp, this.maxHp);

                    if (isFullEvo) {
                        this.shield = (this.shield || 0) + 1; // Khiên 900s
                        this.overloadShieldTimer = 54000;
                    }
                    soundSystem.playPowerup();
                    explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 80, 'yellow', 0, this));
                    addFloatingText(this.x + this.w / 2, this.y - 20, "QUÁ TẢI (600s)!", "#ffff00", 16);
                    this.smartTurretCharge = 0; // Reset tụ lực sau khi bật quá tải
                }
            } else {
                this.smartTurretCharge = 0;
            }
        }
    },

    // [handleShooting] Kỹ Sư — trả về true nếu cần dừng handleShooting()
    shootEngineer(inp, now) {
        if (this.weapon === 'engineer') {
            // Nhấn giữ để nạp Ụ súng thông minh (1s) hoặc Quá tải (2s)
            // Nhấp nhả (< 25 frame ~ 0.4s) để bắn đạn thường
            if (inp.s) {
                this.engineerPressFrames = (this.engineerPressFrames || 0) + 1;
                return true;
            } else {
                if (this.engineerPressFrames > 0) {
                    let heldFrames = this.engineerPressFrames;
                    this.engineerPressFrames = 0;
                    if (heldFrames < 25 && this.ammo > 0 && now - this.lastShot > 350) {
                        this.fireBullet(1);
                        this.ammo--;
                        this.lastShot = now;
                    }
                }
                return true;
            }
        }
    }
});
