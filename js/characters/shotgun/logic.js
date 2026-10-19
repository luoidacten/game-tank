// ==========================================
// Shotgun (shotgun) — Đợt đạn thứ 2 (Evo 1)
// ------------------------------------------
// Gốc: mỗi phát 5 viên (bay nhanh). Evo 1: 6 viên + 0.13s sau bắn thêm đợt 2 gồm 3 viên tụm giữa.
// Hẹn giờ bằng tick (shotWaveT) trên player -> đồng bộ online.
// ==========================================
CharHooks.register('shotgun', {
    setup() { this.shotWaveT = 0; },
    update() {
        if (this.shotWaveT > 0 && --this.shotWaveT === 0 && this.hp > 0 && gameState.phase === 'playing') {
            this.fireBullet(1, false, 'shot_wave');
            if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted) soundSystem.playShoot('normal');
        }
    },
});
