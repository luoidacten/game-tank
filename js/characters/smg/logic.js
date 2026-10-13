// ==========================================
// Tiểu Liên (smg) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [update] Tiểu Liên
    updateSmg(now) {
        if (this.weapon === 'smg' && this.hasUpgrade('evo_smg_2')) {
            // Nếu không bắn trong 5 giây (5000ms) -> Hồi đầy đạn
            if (now - this.lastShot > 5000 && this.ammo < this.maxAmmo) {
                this.ammo = this.maxAmmo;
                // Hiệu ứng visual báo hồi đạn
                ctx.fillStyle = "#00ff00"; ctx.font = "10px Arial";
                ctx.fillText("RELOADED!", this.x, this.y - 10);
            }
        }
    },

    // [handleShooting] Tiểu Liên — trả về true nếu cần dừng handleShooting()
    shootSmg(inp, now) {
        if (this.weapon === 'smg') {
            if (inp.s) {
                // Tính toán Cooldown (Tốc độ bắn)
                let currentCooldown = 100; // Mặc định 100ms

                // Evo 1: Sấy càng lâu bắn càng nhanh (Ramp-up)
                if (this.hasUpgrade('evo_smg_1') && this.smgSprayCount > 3) {
                    // Giảm cooldown tối đa xuống 30ms (Siêu nhanh)
                    // Cứ mỗi viên đạn giảm 5ms cooldown
                    let reduction = (this.smgSprayCount - 3) * 5;
                    currentCooldown = Math.max(30, 100 - reduction);
                }

                if (this.ammo > 0 && now - this.lastShot > currentCooldown) {
                    this.fireBullet(1);
                    this.ammo--;
                    this.lastShot = now;
                    this.smgSprayCount++; // Tăng biến đếm sấy

                    // SMG bắn liên thanh nên không set inp.s = false
                }
            } else {
                // Nhả nút bắn -> Reset sấy
                this.smgSprayCount = 0;
            }
            return true; // Kết thúc logic SMG
        }
    }
});
