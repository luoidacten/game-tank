// ==========================================
// Xe Tiền (money_tank) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [setupForNewRound] Xe Tiền
    setupMoneyTank() {
        if (this.weapon === 'money_tank' && this.upgradeLevel > 0) {
            this.maxHp += 1 * this.upgradeLevel;
            this.damage += 1.125 * this.upgradeLevel;
            this.maxAmmo += 1 * this.upgradeLevel;
            this.speed += 0.5;
        }
    }
});
