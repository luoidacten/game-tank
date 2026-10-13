// ==========================================
// Sniper (sniper) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [draw] Sniper
    drawSniper() {
        if (this.weapon === 'sniper') {
            // Vẽ tia nhắm Laser cho Sniper
            if (this.ammo > 0 && !this.sniperReloading) {
                ctx.save();
                ctx.strokeStyle = (this.id === 1) ? "rgba(52, 152, 219, 0.3)" : "rgba(231, 76, 60, 0.3)";
                ctx.lineWidth = 1; ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(this.x + this.w / 2, (this.id === 1) ? this.y : this.y + this.h);
                ctx.lineTo(this.x + this.w / 2, (this.id === 1) ? 0 : canvas.height);
                ctx.stroke();
                ctx.restore();
            }

            // Vẽ UI Reload tụ lực
            if (this.sniperChargeTimer > 0) {
                // [FIX UI] Cũng phải loại bỏ Tường Bất Tử ở đây để không bị hiện chữ đỏ sai
                let hasActiveWall = sniperWalls.some(w => w.owner === this && w.active && !w.isImmortal);

                // Nếu đang rặn đạn nhưng Tường đang Cooldown hoặc đã có Tường -> Báo chữ đỏ
                if (hasActiveWall || this.sniperWallCooldown > 0) {
                    ctx.fillStyle = "red"; ctx.font = "10px Arial";
                    ctx.fillText("WALL CD/ACTIVE", this.x - 20, this.y - 10);
                } else {
                    ctx.fillStyle = "yellow";
                    ctx.fillRect(this.x, this.y - 10, this.w * (this.sniperChargeTimer / 60), 5);
                }
            }
            if (this.sniperReloading) {
                ctx.fillStyle = "orange";
                ctx.fillText("RELOADING...", this.x, this.y - 15);
                let reloadMax = (this.hasUpgrade('evo_sniper_1') && this.hasUpgrade('evo_sniper_2')) ? 150 : 180;
                ctx.fillRect(this.x, this.y - 10, this.w * (1 - this.sniperReloadTimer / reloadMax), 5);
            }

            // Vẽ thanh hồi chiêu (Cooldown) của Tường Sniper ở bên dưới gầm xe
            if (this.sniperWallCooldown > 0) {
                ctx.fillStyle = "cyan"; // Màu thanh hồi chiêu tường
                ctx.fillRect(this.x, this.y + this.h + 5, this.w * (this.sniperWallCooldown / 600), 3);
            }
        }
    }
});
