// ==========================================
// Sniper (sniper) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [setupForNewRound] Sniper
    setupSniper() {
        if (this.weapon === 'sniper') {
            this.speed *= 0.75;
            this.sniperReloading = false;
            this.sniperReloadTimer = 0;
            this.sniperChargeTimer = 0;
            this.sniperWallCooldown = 0;

            // [FIX CỦA BẠN] Kiểm tra nếu map chưa có Tường Bất Tử nào thì mới tạo (Tránh 2 Sniper sinh ra 2 tường)
            let hasImmortalWall = sniperWalls.some(w => w.isImmortal);
            if (!hasImmortalWall) {
                sniperWalls.push(new SniperWall(canvas.width / 2 - 30, canvas.height / 2 - 10, this, true));
            }
        }
    },

    // [update] Sniper — trả về currentSpeed mới
    updateSniper(currentSpeed) {
        if (this.weapon === 'sniper') {
            currentSpeed *= 0.5;
        }
        return currentSpeed;
    },

    // [update] Sniper — trả về currentSpeed mới
    updateSniper2(now, effectiveInp, currentSpeed) {
        if (this.weapon === 'sniper') {
            let isFullEvo = this.hasUpgrade('evo_sniper_1') && this.hasUpgrade('evo_sniper_2');

            // Trừ dần thời gian hồi chiêu của Tường
            if (this.sniperWallCooldown > 0) this.sniperWallCooldown--;

            // Tự động nạp đạn đầy sau 8s không bắn
            if (now - this.lastShot > 8000 && this.ammo < this.maxAmmo && !this.sniperReloading) {
                this.ammo = this.maxAmmo;
                ctx.fillStyle = "lime"; ctx.fillText("AUTO RELOAD", this.x, this.y - 15);
            }

            // Hết đạn -> Nạp nguyên băng (3s hoặc 2.5s)
            if (this.ammo <= 0 && !this.sniperReloading) {
                this.sniperReloading = true;
                this.sniperReloadTimer = isFullEvo ? 150 : 180;
            }

            if (this.sniperReloading) {
                this.sniperReloadTimer--;
                // Giảm thêm tốc độ khi đang đứng thay băng đạn
                currentSpeed *= 0.5;
                effectiveInp.s = false; // Khóa input bắn
                if (this.sniperReloadTimer <= 0) {
                    this.ammo = this.maxAmmo;
                    this.sniperReloading = false;
                }
            }

            // KIỂM TRA SỐ LƯỢNG TƯỜNG: Sniper chỉ được phép có 1 tường trên map tại 1 thời điểm
            let hasActiveWall = sniperWalls.some(w => w.owner === this && w.active && !w.isImmortal);

            // Tụ lực tạo tường
            if (effectiveInp.s && !this.sniperReloading && this.ammo > 0) {
                this.sniperChargeTimer++;

                // Đã giữ đủ 1 giây
                if (this.sniperChargeTimer >= 60) {
                    // Chỉ xuất tường nếu KHÔNG có tường nào active VÀ đã hết hồi chiêu
                    if (!hasActiveWall && this.sniperWallCooldown <= 0) {
                        let spawnY = (this.id === 1) ? this.y - 40 : this.y + this.h + 20;
                        sniperWalls.push(new SniperWall(this.x + this.w / 2 - 30, spawnY, this, false));
                        this.sniperChargeTimer = 0;

                        this.sniperWallCooldown = 300; // Bắt đầu đếm ngược hồi chiêu 10s
                        effectiveInp.s = false; // Nhả nút
                    } else {
                        // Đã đủ lực nhưng kẹt tường/cooldown -> giữ trạng thái nhưng không gọi tường
                        this.sniperChargeTimer = 60;
                    }
                }
            } else {
                // Hành động Nhả nút bắn
                if (this.sniperChargeTimer > 0 && this.ammo > 0) {
                    // Nếu kẹt tường hoặc chưa tụ đủ lực -> thả tay ra sẽ thành bắn đạn thường
                    this.fireBullet(1);
                    this.ammo--;
                    this.lastShot = now;
                }
                this.sniperChargeTimer = 0;
            }

            // [CẬP NHẬT DI CHUYỂN CỦA SNIPER]: Sử dụng tốc độ đã được tính toán chuẩn xác
            // Sniper movement handled cleanly by shared loop
        }
        return currentSpeed;
    },

    // [handleShooting] Sniper — trả về true nếu cần dừng handleShooting()
    shootSniper(inp, now) {
        if (this.weapon === 'sniper') {
            if (inp.s) {
                this.sniperCharge++;
                // [Nếu bạn có logic tụ lực tạo tường ở đây, hãy giữ nguyên nó]
            } else {
                // KHI NHẢ PHÍM: Bấm nhẹ để bắn đạn Sniper
                if (this.sniperCharge > 0 && this.sniperCharge < 30) { // Giả sử < 30 frames là bắn
                    if (this.ammo > 0 && now - this.lastShot > this.reloadTime) {
                        this.fireBullet(1);
                        this.ammo--;
                        this.lastShot = now;
                    }
                }
                this.sniperCharge = 0;
            }
            return true; // Ngắt!
        }
    }
});
