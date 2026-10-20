// ==========================================
// Phong Trảm (wind_slash) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    fireWindBlade(ratio, isAutoFull) {
        // [NERF] Size cơ bản nhỏ hơn
        let baseSize = 20 + (ratio * 40); // 20 -> 60 (Cũ là 20 -> 80)

        // [BUFF] Nếu là Auto-Full thì to hơn hẳn
        if (isAutoFull) baseSize = 90;

        let spd = 4.2 - (ratio * 1.2); // Phong trảm bay chậm và đầm tay

        // [NERF] Dame giảm xuống 0.5 -> 1.0
        let finalDmg = 0.5 + (ratio * 0.5);
        if (isAutoFull) finalDmg = 1.2; // Auto full được thưởng thêm chút dame

        let dirY = (this.id === 1) ? -1 : 1;
        let startY = (this.id === 1) ? this.y - baseSize : this.y + this.h;

        this.bullets.push({
            x: this.x + this.w / 2 - baseSize / 2, y: startY,
            w: baseSize, h: baseSize / 2,
            vx: 0, vy: dirY * spd,
            dmg: finalDmg, owner: this,
            isWindBlade: true,
            rotation: 0,
            hitIds: [],
            isPiercing: true // Phong trảm luôn xuyên
        });
    },

    // [setupForNewRound] Phong Trảm
    setupWindSlash() {
        if (this.weapon === 'wind_slash') {
            this.maxAmmo = 1;
            this.windShotCount = 0;
            this.windWallTimer = 0;
        }
    },

    // [update] Phong Trảm
    updateWindSlash() {
        if (this.weapon === 'wind_slash' && this.hasUpgrade('evo_wind_1') && this.hasUpgrade('evo_wind_2')) {
            this.windWallTimer++;
            // 8 giây = 480 frames
            if (this.windWallTimer >= 480) {
                this.windWallTimer = 0;
                // Tạo tường gió phía trước mặt
                let wallY = (this.id === 1) ? this.y - 60 : this.y + this.h + 40;
                let wallX = this.x + this.w / 2 - 60; // Căn giữa

                // Đảm bảo tường không ra ngoài map
                if (wallX < 0) wallX = 0;
                if (wallX > canvas.width - 120) wallX = canvas.width - 120;

                windWalls.push(new WindWall(wallX, wallY, this));

                // Hiệu ứng visual
                ctx.fillStyle = "cyan"; ctx.font = "bold 14px Arial";
                ctx.fillText("WIND WALL!", this.x, this.y - 20);
            }
        }
    },

    // [handleShooting] Phong Trảm — trả về true nếu cần dừng handleShooting()
    shootWindSlash(inp, now) {
        if (this.weapon === 'wind_slash') {
            if (this.ammo > 0) {
                if (!this.lastShot) this.lastShot = now;
                let timeSinceShot = now - this.lastShot;

                // [NERF] Tăng thời gian full lực lên 8000ms (8s)
                let chargeRatio = Math.min(timeSinceShot / 8000, 1);
                this.chargeLevel = chargeRatio * 7;
            } else {
                this.chargeLevel = 0;
                // [FIX] ĐÃ XÓA DÒNG: this.lastShot = now; 
                // Giải thích: Nếu để dòng đó, thời gian chờ nạp đạn bị reset liên tục -> Không bao giờ nạp được.
            }

            if (inp.s && this.ammo > 0) {
                let ratio = this.chargeLevel / 7;
                let isAutoFull = false;

                // Evo 1: Phát thứ 5 tự động Full lực
                if (this.hasUpgrade('evo_wind_1') && (this.windShotCount + 1) % 5 === 0) {
                    ratio = 1;
                    isAutoFull = true;
                }

                this.fireWindBlade(ratio, isAutoFull);
                this.ammo--;
                this.lastShot = now; // Bắt đầu tính giờ nạp đạn từ đây
                this.windShotCount = (this.windShotCount || 0) + 1;
                inp.s = false;
            }
            return true;
        }
    }
});

// takeDamage: kết liễu PHONG TRẢM (nối tiếp wrapper sẵn có)
(function () {
    const orig = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker) {
        const before = this.hp;
        const r = orig.apply(this, arguments);
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && attacker.weapon === 'wind_slash'
            && typeof bodyEffects !== 'undefined' && !bodyEffects.some(e => e instanceof WsFinisher)) {
            bodyEffects.push(new WsFinisher(attacker, this));
            triggerScreenShake(6, 10);
            if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem.playExplosion) soundSystem.playExplosion();
        }
        return r;
    };
})();
