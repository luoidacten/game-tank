// ==========================================
// Cuộn Quá Tải (overload) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [handleShooting] Cuộn Quá Tải — trả về true nếu cần dừng handleShooting()
    shootOverload(inp, now) {
        if (this.weapon === 'overload') {
            const timeSinceLastShot = now - this.lastShot;

            // BUFF OVERLOAD: Bắt đầu nạp ngay sau 300ms, tốc độ nạp nhanh hơn đáng kể
            let baseDiv = 2400; // 2.4s nạp đầy
            if (this.hasUpgrade('evo_over_2')) baseDiv = 1500; // 1.5s
            if (this.hasUpgrade('evo_over_1') && this.hasUpgrade('evo_over_2')) baseDiv = 600; // 0.6s nạp siêu tốc

            const chargeSpeedDiv = baseDiv;

            if (timeSinceLastShot > 300) {
                const chargeTime = Math.min(timeSinceLastShot - 300, chargeSpeedDiv);
                this.chargeLevel = (chargeTime / chargeSpeedDiv) * 7;
            } else { this.chargeLevel = 0; }

            if (inp.s && this.ammo > 0) {
                const isFull = this.chargeLevel >= 6.8;
                let multiplier = 1.2 + (this.chargeLevel * 1.3); // Buff dame: sạc đầy đạt >10x sát thương
                this.fireBullet(multiplier, isFull);
                this.ammo--; this.lastShot = now; this.chargeLevel = 0; inp.s = false;
            }
            return true;
        }
    }
});
