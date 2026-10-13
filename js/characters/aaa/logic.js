// ==========================================
// Pháo Cao Xạ (aaa) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [setupForNewRound] Pháo Cao Xạ
    setupAaa() {
        if (this.weapon === 'aaa') {
            this.speed *= 0.6;
            this.maxAmmo = 1;
            this.reloadTime = 3000;
            this.aaaAutoInterval = 240; // Giảm tần suất mưa đạn pháo
            if (this.hasUpgrade('evo_aaa_2')) { this.reloadTime = 2500; }
            if (this.hasUpgrade('evo_aaa_1') && this.hasUpgrade('evo_aaa_2')) {
                this.aaaAutoInterval = 200;
                this.reloadTime = 1500;
            }
        }
    },

    // [update] Pháo Cao Xạ
    updateAaa() {
        if (this.weapon === 'aaa') {
            this.aaaAutoTimer++;
            if (this.aaaAutoTimer >= this.aaaAutoInterval) {
                this.aaaAutoTimer = 0;

                // Tự bắn thường
                let shots = this.hasUpgrade('evo_aaa_1') ? 3 : 1;

                for (let i = 0; i < shots; i++) {
                    setTimeout(() => {
                        this.fireBullet(1); // Bắn đạn thường
                    }, i * 200); // Burst delay
                }

                // Evo 2: Mưa Tên Lửa (Rơi 3 bom ngẫu nhiên)
                if (this.hasUpgrade('evo_aaa_2')) {
                    const enemy = (this.id === 1) ? p2 : p1;
                    for (let k = 0; k < 3; k++) {
                        // [FIX] Bom rơi trên làn đối thủ (trước: ngẫu nhiên nửa sân, ít khi trúng)
                        const lt = laneTargetPoint(enemy, 120);
                        let rx = lt.x, ry = lt.y;
                        mortars.push(new MortarMarker(rx, ry, this, true));
                    }
                }
            }
        }
    },

    // [handleShooting] Pháo Cao Xạ — trả về true nếu cần dừng handleShooting()
    shootAaa(inp, now) {
        if (this.weapon === 'aaa') {
            if (inp.s) {
                let interShotDelay = 350;
                if (this.ammo > 0 && now - this.lastShot > interShotDelay) {
                    const enemy = (this.id === 1) ? p2 : p1;

                    // FIX AIM: Thả trực tiếp vào TÂM kẻ địch hiện tại
                    let targetX = enemy.x + enemy.w / 2;
                    let targetY = enemy.y + enemy.h / 2;

                    // Thêm chút rung lắc nhẹ cho tự nhiên
                    targetX += (Math.random() - 0.5) * 20;
                    targetY += (Math.random() - 0.5) * 20;

                    mortars.push(new MortarMarker(targetX, targetY, this, false));

                    this.ammo--;
                    this.lastShot = now;
                    inp.s = false;
                }
            }
            return true;
        }
    }
});
