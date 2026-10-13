// ==========================================
// Cổng Không Gian (portal) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    triggerPortalEffect() {
        const now = Date.now();
        const hasEvo1 = this.hasUpgrade('evo_portal_1');
        const hasEvo2 = this.hasUpgrade('evo_portal_2');
        const isFullEvo = hasEvo1 && hasEvo2;

        // Evo 1: Đạn nổ (Cũ - giữ nguyên)
        if (hasEvo1) this.nextShotExplosive = true;

        // --- LOGIC TĂNG TỐC & BONUS ---
        if (hasEvo2) {
            const MAX_SPEED_CAP = 20; // Giới hạn tốc độ là 60

            if (isFullEvo) {
                // =================================================
                // TRƯỜNG HỢP 1: FULL EVO (Evo 1 + Evo 2)
                // =================================================

                // 1. Luôn hồi đầy đạn & Tăng tốc đạn (Không có Cooldown)
                this.ammo = this.maxAmmo;
                this.portalBulletSpeedBonus += 1.5;

                // 2. Logic Tốc độ & Bonus
                if (this.speed < MAX_SPEED_CAP) {
                    // Chưa max tốc -> Cộng 6 tốc (Không hồi chiêu)
                    this.speed += 6;
                    if (this.speed > MAX_SPEED_CAP) this.speed = MAX_SPEED_CAP;

                    // Hiệu ứng visual tăng tốc
                    ctx.fillStyle = "#00ffff"; ctx.font = "10px Arial";
                    ctx.fillText("SPEED UP+++", this.x, this.y - 10);
                } else {
                    // Đã Max tốc -> Check Cooldown 6s để Hồi Máu & Tăng Dame
                    if (now - this.lastPortalFullBonus > 6000) {

                        // Hồi 1 HP
                        this.hp = Math.min(this.hp + 1, this.maxHp);

                        // Tăng Dame vĩnh viễn (Buff khủng)
                        this.damage += 1;

                        this.lastPortalFullBonus = now;

                        // Hiệu ứng Visual đặc biệt
                        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 100, 'gold', 0, this));
                        ctx.fillStyle = "gold"; ctx.font = "bold 14px Arial";
                        ctx.fillText("OVERDRIVE!", this.x - 10, this.y - 20);
                    }
                }

            } else {
                // =================================================
                // TRƯỜNG HỢP 2: CHỈ CÓ EVO 2 (Gia Tốc)
                // =================================================
                // Giữ logic cũ: Cooldown 1s, cộng 2 tốc
                if (now - this.lastPortalBoost > 1000) {
                    this.ammo = this.maxAmmo;

                    if (this.speed < MAX_SPEED_CAP) {
                        this.speed += 2;
                        if (this.speed > MAX_SPEED_CAP) this.speed = MAX_SPEED_CAP;

                        ctx.fillStyle = "#00ffff"; ctx.font = "10px Arial";
                        ctx.fillText("Speed Up", this.x, this.y - 10);
                    }
                    this.lastPortalBoost = now;
                }
            }
        }
    },

    // [update] Cổng Không Gian
    updatePortal() {
        if (this.weapon === 'portal') {
            if (this.x < -this.w) { this.x = canvas.width; this.triggerPortalEffect(); }
            else if (this.x > canvas.width) { this.x = -this.w; this.triggerPortalEffect(); }
        } else {
            if (this.x < 0) this.x = 0;
            if (this.x > canvas.width - this.w) this.x = canvas.width - this.w;
        }
    },

    // [handleShooting] Cổng Không Gian — trả về true nếu cần dừng handleShooting()
    shootPortal(inp, now) {
        if (this.weapon === 'portal') {
            let isFullEvo = (this.hasUpgrade('evo_portal_1') && this.hasUpgrade('evo_portal_2'));

            if (inp.s) {
                // Nếu Full Evo -> Chế độ Sấy (Auto fire)
                if (isFullEvo) {
                    // Tốc độ bắn nhanh (150ms)
                    if (this.ammo > 0 && now - this.lastShot > 150) {
                        this.fireBullet(1);
                        this.ammo--;
                        this.lastShot = now;
                    }
                }
                // Nếu chưa Full Evo -> Bắn từng viên (Semi-auto)
                else {
                    if (this.ammo > 0 && now - this.lastShot > 500) {
                        this.fireBullet(1);
                        this.ammo--;
                        this.lastShot = now;
                        inp.s = false; // Bắt buộc nhả phím
                    }
                }
            }
            return true;
        }
    }
});
