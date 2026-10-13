// ==========================================
// mirror (mirror) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [setupForNewRound] mirror
    setupMirror() {
        if (this.weapon === 'mirror') {
            this.mirrorCharge = 0;
            this.mirrorCD = 0;
            this.mirrorBuffTimer = 0;
            this.mirrorQuickShot = 0;
            this.speedBuffActive = false;
            this.enemyClone = null;      // Ảnh chiếu kẻ thù đứng yên
            this.shatteredClone = null;  // Ảnh chiếu tan vỡ (Full Evo)
        }
    },

    // [update] mirror
    updateMirror(effectiveInp) {
        if (this.weapon === 'mirror') {
            let hasEvo1 = this.hasUpgrade('evo_mirror_1');
            let hasEvo2 = this.hasUpgrade('evo_mirror_2');
            let isFullEvo = hasEvo1 && hasEvo2;

            if (this.mirrorCD > 0) this.mirrorCD--;
            if (this.mirrorQuickShot > 0) this.mirrorQuickShot--;
            if (this.mirrorBuffTimer > 0) {
                this.mirrorBuffTimer--;
                if (this.mirrorBuffTimer <= 0 && hasEvo1) this.dmgBuff -= 1;
            }

            if (effectiveInp.s && this.mirrorCD <= 0) {
                this.mirrorCharge++;

                if (this.mirrorCharge >= 60) { // Giữ đủ 1s
                    let mirrorX = canvas.width - (this.x + this.w);
                    let mirrorY = this.y;

                    explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 50, 'cyan', 0, this));

                    this.x = mirrorX;
                    this.y = mirrorY;
                    this.mirrorCharge = 0;

                    this.mirrorCD = hasEvo1 ? 180 : 300;
                    this.mirrorBuffTimer = 60;
                    this.mirrorQuickShot = 90; // [MỚI] 1.5s sau dịch chuyển: bắn ngay, nhịp & tốc độ đạn x2
                    this.lastShot = 0;
                    this.speedBuffActive = true;
                    if (hasEvo1) {
                        this.dmgBuff += 1;
                        this.invincibleTimer = isFullEvo ? 60 : 30;
                    }

                    // [CƠ CHẾ GƯƠNG VỠ - SHATTERED MIRROR]
                    if (hasEvo2) {
                        const enemy = (this.id === 1) ? p2 : p1;
                        // Ngay lập tức tạo Ảnh Chiếu Kẻ Thù tại vị trí của địch
                        this.enemyClone = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h, active: true };

                        if (isFullEvo) {
                            // Tạo Ảnh Chiếu Tan Vỡ ở vị trí đối xứng qua TÂM MAP
                            this.shatteredClone = {
                                x: canvas.width - enemy.x - enemy.w,
                                y: canvas.height - enemy.y - enemy.h,
                                w: enemy.w, h: enemy.h,
                                hp: 5, // Cần vài hit để vỡ
                                active: true
                            };
                        }
                    }
                    explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 50, 'white', 0, this));
                }
            } else {
                if (!effectiveInp.s) {
                    // [FIX] Ghi lại thời gian giữ trước khi reset để hàm bắn biết đây là nhấp ngắn
                    if (this.mirrorCharge > 0) this.mirrorReleasedCharge = this.mirrorCharge;
                    this.mirrorCharge = 0;
                }
            }
        }
    },

    // [update] mirror — trả về currentSpeed mới
    updateMirror2(currentSpeed) {
        if (this.weapon === 'mirror' && this.mirrorBuffTimer > 0) {
            currentSpeed += this.hasUpgrade('evo_mirror_1') ? 3 : 1.5;
        }
        return currentSpeed;
    },

    // [handleShooting] mirror — trả về true nếu cần dừng handleShooting()
    shootMirror(inp, now) {
        if (this.weapon === 'mirror') {
            // (Logic đếm mirrorCharge và Swap của bạn thường được đặt trong hàm update() nên không cần ghi ở đây)
            if (this.mirrorQuickShot > 0) {
                // [MỚI] Vừa dịch chuyển: giữ/nhấn là bắn ngay, nhịp bắn x2 (175ms) và đạn bay x2
                this.mirrorReleasedCharge = 0;
                if (inp.s && this.ammo > 0 && now - this.lastShot > 175) {
                    const n0 = this.bullets.length;
                    this.fireBullet(1);
                    for (let i = n0; i < this.bullets.length; i++) { this.bullets[i].vx *= 2; this.bullets[i].vy *= 2; }
                    this.ammo--;
                    this.lastShot = now;
                }
            } else if (inp.s) {
                // Đang giữ phím -> Không làm gì cả, để cho update() đếm charge
            } else {
                // KHI NHẢ PHÍM: Nếu thời gian giữ ngắn (chưa đủ để Swap) -> Bắn đạn
                const held = this.mirrorReleasedCharge || 0;
                this.mirrorReleasedCharge = 0;
                if (held > 0 && held < 60) {
                    if (this.ammo > 0 && now - this.lastShot > 350) {
                        this.fireBullet(1);
                        this.ammo--;
                        this.lastShot = now;
                    }
                }
                // (Việc reset mirrorCharge = 0 thường đã có ở hàm update)
            }
            return true; // QUAN TRỌNG: Ngắt không cho chạy xuống code bắn mặc định!
        }
    }
});
