// ==========================================
// Lò Nung (furnace) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [handleShooting] Lò Nung — trả về true nếu cần dừng handleShooting()
    shootFurnace(inp, now) {
        if (this.weapon === 'furnace') {
            let hasEvo1 = this.hasUpgrade('evo_furnace_1');
            let hasEvo2 = this.hasUpgrade('evo_furnace_2');

            if (inp.s) {
                this.energyChargeTimer++;
                if (hasEvo1 && this.energyChargeTimer < 60) {
                    // Cảnh báo tia lửa
                    if (this.energy >= 2) {
                        ctx.save();
                        let startY = (this.id === 1) ? this.y : this.y + this.h;
                        ctx.beginPath(); ctx.moveTo(this.x + this.w / 2, startY); ctx.lineTo(this.x + this.w / 2, (this.id === 1) ? 0 : canvas.height);
                        ctx.strokeStyle = "rgba(255, 69, 0, 0.4)"; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.restore();
                    }
                } else if (hasEvo1 && this.energyChargeTimer >= 60) {
                    // Phun lửa liên tục (Evo 1): Bắn siêu nhanh, hao năng lượng khủng
                    if (this.energy >= 2.5) {
                        if (this.energyChargeTimer % 4 === 0) {
                            this.energy -= 2.5;
                            this.energyUsedAcc += 2.5;
                            this.fireBullet(0.5, false, 'fire_stream');
                            this.lastShot = now;
                        }
                    }
                } else if (!hasEvo1) {
                    // Không có Evo 1: Bắn thường
                    if (this.energy >= 10 && now - this.lastShot > 500) {
                        this.energy -= 10;
                        this.energyUsedAcc += 10;
                        this.fireBullet(1, false, 'fire_normal');
                        this.lastShot = now;
                        inp.s = false;
                    }
                }
            } else {
                // Nhả nút
                if (hasEvo1 && this.energyChargeTimer > 0 && this.energyChargeTimer < 60 && this.energy >= 10) {
                    this.energy -= 10;
                    this.energyUsedAcc += 10;
                    this.fireBullet(1, false, 'fire_normal');
                    this.lastShot = now;
                }
                this.energyChargeTimer = 0;
            }

            // Kích hoạt Evo 2 Cường Hóa (Vùng Lửa)
            if (hasEvo2 && this.energyUsedAcc >= 30) {
                this.nextShotFireZone = true;
                this.energyUsedAcc -= 30;
            }
            return true;
        }
    }
});
