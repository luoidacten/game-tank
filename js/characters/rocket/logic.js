// ==========================================
// Pháo Tên Lửa (rocket) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [handleShooting] Pháo Tên Lửa — trả về true nếu cần dừng handleShooting()
    shootRocket(inp, now) {
        if (this.weapon === 'rocket') {
            if (inp.s && this.ammo > 0 && now - this.lastShot > 800) {
                this.fireBullet(1); this.ammo--; this.lastShot = now; inp.s = false;
            }
            return true;
        }
    }
});
