// ==========================================
// Kiếm Tôn (blade_god) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [setupForNewRound] Kiếm Tôn
    setupBladeGod() {
        if (this.weapon === 'blade_god') {
            this.bladeShotCount = 0; // Đếm số lần bắn để gọi Phá Thiên
            this.huVoStack = 0; // Tích điểm Hư Vô cho kẻ địch
            this.swordShieldActive = false;
            this.swordShieldHits = 0;
            this.swordShieldTimer = 0;
        }
    },

    // [handleShooting] Kiếm Tôn — trả về true nếu cần dừng handleShooting()
    shootBladeGod(inp, now) {
        if (this.weapon === 'blade_god') {
            let isReloaded = (now - this.lastShot > (this.hasUpgrade('evo_blade_2') ? 300 : 700));

            if (inp.s && this.ammo > 0 && isReloaded) {
                this.bladeShotCount++;
                let hasEvo1 = this.hasUpgrade('evo_blade_1');

                // 1. Phá Thiên Kiếm (Phát thứ 10)
                if (this.bladeShotCount % 10 === 0) {
                    let dirY = (this.id === 1) ? -1 : 1;

                    // [FIX LỖI TỌA ĐỘ PHÁ THIÊN KIẾM]:
                    let spawnY = this.y + ((this.id === 1) ? 50 : -50);
                    if (spawnY > canvas.height - 125) spawnY = canvas.height - 125;
                    if (spawnY < 5) spawnY = 5;

                    floatingSwords.push(new FloatingSword(this.x - 15, spawnY, 60, 120, 0, dirY * 25, 120, this.damage * 10, true, false, this, true));
                    if (hasEvo1) this.invincibleTimer = 300; // Bất tử 5s
                }
                // 2. Evo 1: Kiếm Phá Thiên nhỏ (Mỗi 3 phát)
                else if (hasEvo1 && this.bladeShotCount % 3 === 0) {
                    let dirY = (this.id === 1) ? -1 : 1;
                    floatingSwords.push(new FloatingSword(this.x + 5, this.y + ((this.id === 1) ? 20 : -20), 20, 50, 0, dirY * 15, 60, this.damage * 2, true, false, this));
                }
                // 3. Luân phiên Anh Minh / Hư Vô
                else {
                    let isAnhMinh = (this.bladeShotCount % 2 !== 0);
                    if (isAnhMinh) {
                        // [BUFF ANH MINH]: Triệu hồi kiếm vàng trên đầu, delay 60 frame (1s) rồi mới bắn Hitscan
                        let isPiercing = hasEvo1;
                        floatingSwords.push(new FloatingSword(0, 0, 15, 45, 0, 0, 60, this.damage * 0.45, isPiercing, false, this, false, "#f1c40f", true));// Cờ hiệu để bắn hitscan sau delay
                    } else {
                        // Hư Vô Kiếm
                        this.fireBullet(0.75, false, 'hu_vo');
                    }
                }

                this.ammo--; this.lastShot = now; inp.s = false;
            }
            return true;
        }
    }
});
