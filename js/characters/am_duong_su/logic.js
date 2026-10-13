// ==========================================
// Âm Dương Sư (am_duong_su) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [setupForNewRound] Âm Dương Sư
    setupAmDuongSu() {
        if (this.weapon === 'am_duong_su') {
            this.isAmChu = true; // Bắt đầu bằng Âm chú
        }
    }
});
