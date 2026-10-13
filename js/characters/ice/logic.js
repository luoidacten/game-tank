// ==========================================
// Pháo Băng (ice) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [update] Pháo Băng
    updateIce() {
        if (this.weapon === 'ice' && this.hasUpgrade('evo_ice_1') && this.hasUpgrade('evo_ice_2')) {
            this.iceAutoFreezeTimer++;

            // 10 giây = 600 frames (vì game chạy 60fps)
            if (this.iceAutoFreezeTimer >= 600) {
                this.iceAutoFreezeTimer = 0;

                // Xác định kẻ địch
                const enemy = (this.id === 1) ? p2 : p1;

                // Đóng băng NGAY LẬP TỨC
                // Full Evo: Đóng băng tối đa 90 frames (1.5 giây để đối thủ có cơ hội phản xạ)
                enemy.freezeTimer = 90;
                enemy.coldStack = 0; // Reset stack để tránh lỗi chồng chéo

                // Hiệu ứng Visual báo hiệu
                explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 80, '#00ffff', 0, this));
                ctx.fillStyle = "cyan"; ctx.font = "bold 20px Arial";
                ctx.fillText("ABSOLUTE ZERO!", this.x, this.y - 30);
            }
        }
    }
});
