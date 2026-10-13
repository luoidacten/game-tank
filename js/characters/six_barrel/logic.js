// ==========================================
// 6 Nòng (six_barrel) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [setupForNewRound] 6 Nòng
    setupSixBarrel() {
        if (this.weapon === 'six_barrel') {
            this.maxAmmo = 999;
            this.ammo = 999;
            this.heat = 0;              // 0 đến 100
            this.isOverheated = false;
            this.heatHoldFrames = 0;    // Đếm số frame giữ nút
            this.heatRestFrames = 0;    // Đếm số frame nhả nút
        }
    },

    // [update] 6 Nòng — trả về currentSpeed mới
    updateSixBarrel(effectiveInp, currentSpeed) {
        if (this.weapon === 'six_barrel') {
            if (effectiveInp.s) currentSpeed *= 0.6; // Đang xả đạn giảm 40%
            if (this.heat >= 40) currentSpeed = 0; // Quá nóng: đứng yên hoàn toàn
            else if (this.heat >= 20) currentSpeed *= 0.35; // Nóng: giảm 65% tốc chạy
        }
        return currentSpeed;
    },

    // [update] 6 Nòng
    updateSixBarrel2(effectiveInp) {
        if (this.weapon === 'six_barrel') {
            if (this.isOverheated) {
                // Đang quá tải: Hạ nhiệt từ 100 về 0 trong đúng 5s (300 frames)
                this.heat -= (100 / 300);
                if (this.heat <= 0) {
                    this.heat = 0;
                    this.isOverheated = false;
                }
            } else {
                if (effectiveInp.s) {
                    // ĐANG BẮN: Tăng nhiệt nhanh dần
                    this.heatRestFrames = 0;
                    this.heatHoldFrames++;

                    // Công thức: Tăng nhiệt nhanh hơn 50% để hạn chế việc sấy đạn liên tục
                    let heatGain = 0.25 + (this.heatHoldFrames * 0.008);

                    // Evo 2: Tăng chậm lại ở mốc 75% (Cần 5s thay vì 3s)
                    if (this.hasUpgrade('evo_six_2') && this.heat >= 75) {
                        heatGain *= 0.4;
                    }

                    this.heat += heatGain;

                    // KIỂM TRA QUÁ TẢI (100%)
                    if (this.heat >= 100) {
                        this.heat = 100;
                        this.isOverheated = true;
                        this.silenceTimer = 300; // Câm lặng 5s

                        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 80, 'red', 0, this));
                        ctx.fillStyle = "red"; ctx.font = "bold 16px Arial";
                        ctx.fillText("QUÁ TẢI!", this.x, this.y - 20);

                        // Trừ máu
                        if (this.hasUpgrade('evo_six_2')) {
                            this.maxHp = Math.max(1, this.maxHp - 5);
                            this.hp = Math.min(this.hp, this.maxHp);
                        } else {
                            this.hp -= 5;
                            if (this.hp < 1) this.hp = 1; // Không để chết ngay lập tức do quá tải
                        }
                    }
                } else {
                    // NHẢ NÚT: Giảm nhiệt nhanh dần
                    this.heatHoldFrames = 0;
                    if (this.heat > 0) {
                        this.heatRestFrames++;
                        let heatDrop = 0.2 + (this.heatRestFrames * 0.01);

                        // Evo 2: Giảm cực nhanh khi < 50%
                        if (this.hasUpgrade('evo_six_2') && this.heat <= 50) {
                            heatDrop *= 2.5;
                        }

                        this.heat -= heatDrop;
                        if (this.heat < 0) this.heat = 0;
                    }
                }
            }
        }
    },

    // [handleShooting] 6 Nòng — trả về true nếu cần dừng handleShooting()
    shootSixBarrel(inp, now) {
        if (this.weapon === 'six_barrel') {
            if (inp.s && !this.isOverheated) {
                let currentCooldown = 100; // Mặc định
                let dmgMultiplier = 1;
                let bulletCount = 1;
                let inflictBurn = false;

                // MỐC 50%
                if (this.heat >= 50) {
                    currentCooldown = 60;
                    dmgMultiplier = 1.25; // Giảm nhẹ dame (cũ 1.5)
                    if (this.hasUpgrade('evo_six_1')) bulletCount = 2; // Bão đạn
                    if (this.hasUpgrade('evo_six_2')) inflictBurn = true; // Quá Nhiệt (Evo 2)
                }

                // MỐC 75%
                if (this.heat >= 75) {
                    currentCooldown = 30; // Bắn siêu nhanh
                    inflictBurn = true;   // Mặc định 75% là gây đốt
                    if (this.hasUpgrade('evo_six_1')) bulletCount = 3; // Bão đạn Max
                }

                if (now - this.lastShot > currentCooldown) {
                    // Độ tỏa ngang giống SMG (Càng nóng càng tỏa)
                    let spreadAmp = (this.heat / 100) * 8;

                    for (let i = 0; i < bulletCount; i++) {
                        let vx = (Math.random() - 0.5) * spreadAmp;

                        // Gửi cờ gây đốt vào tham số thứ 3 (type) hoặc thông qua fireBullet
                        // Để dễ dàng, ta thêm thuộc tính inflictBurn vào hàm fireBullet
                        this.nextShotInflictsBurn = inflictBurn; // Cờ tạm thời
                        this.nextShotSpreadVx = vx;              // Cờ tạm thời

                        this.fireBullet(dmgMultiplier, false, 'six_barrel');
                    }
                    this.lastShot = now;
                }
            }
            return true;
        }
    }
});
