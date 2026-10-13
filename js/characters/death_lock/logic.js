// ==========================================
// death_lock (death_lock) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [setupForNewRound] death_lock
    setupDeathLock() {
        if (this.weapon === 'death_lock') {
            this.deathLockShotCount = 0;
            this.lastConfinementCageEndTime = 0;
        }
    }
});
