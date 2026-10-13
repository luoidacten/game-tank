// ==========================================
// Súng Nước (water_gun) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [handleShooting] Súng Nước — trả về true nếu cần dừng handleShooting()
    shootWaterGun(inp, now) {
        if (this.weapon === 'water_gun') {
            if (inp.s) {
                this.energyChargeTimer++;
                let hasEvo1 = this.hasUpgrade('evo_water_1');

                if (this.energyChargeTimer < 60) {
                    // Pha 1: Cảnh báo hướng bắn (Chờ 1 giây)
                    if (this.energy >= 10) {
                        ctx.save();
                        let startY = (this.id === 1) ? this.y : this.y + this.h;
                        ctx.beginPath(); ctx.moveTo(this.x + this.w / 2, startY); ctx.lineTo(this.x + this.w / 2, (this.id === 1) ? 0 : canvas.height);
                        ctx.strokeStyle = "rgba(0, 255, 255, 0.4)"; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.restore();
                    }
                } else if (this.energyChargeTimer === 60) {
                    // Cấp thường: Đủ 1s -> Xả HitScan
                    if (this.energy >= 50) {
                        this.energy -= 50;
                        this.fireAnhMinhHitscan(this.damage * 3, this.hasUpgrade('evo_water_2'), "#3498db");
                        this.lastShot = now;
                    }
                } else if (this.energyChargeTimer > 60 && hasEvo1) {
                    // Pha 2 (Evo 1): Phun Vòi Rồng liên tục
                    if (this.energy >= 1) { // Phun 6 frame 1 lần, tốn cực ít năng lượng để kéo dài
                        if (this.energyChargeTimer % 6 === 0) {
                            this.energy -= 2;
                            this.fireBullet(0.125 / this.damage, false, 'water_stream'); // Sát thương nhỏ giọt liên tục
                            this.lastShot = now;
                        }
                    }
                }
            } else {
                // Nhả nút
                if (this.energyChargeTimer > 0 && this.energyChargeTimer < 60 && this.energy >= 10) {
                    this.energy -= 10;
                    this.fireBullet(1, false, 'water_normal'); // Bắn 1 tia nước thường
                    this.lastShot = now;
                }
                this.energyChargeTimer = 0;
            }
            return true;
        }
    }
});
