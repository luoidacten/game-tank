// ==========================================
// death_lock (death_lock) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [setupForNewRound] death_lock
    setupDeathLock() {
        this.groundedTimer = 0; this.groundedTxtT = 0;
        if (this.weapon === 'death_lock') {
            this.deathLockShotCount = 0;
            this.lastConfinementCageEndTime = 0;
        }
    }
});
