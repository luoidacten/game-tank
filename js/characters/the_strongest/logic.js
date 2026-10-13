// ==========================================
// Kẻ Mạnh Nhất (the_strongest) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    fireGojoBlue(isEvo2, enemy) {
        let dirY = (this.id === 1) ? -1 : 1;
        let speed = 16;

        this.bullets.push({
            type: 'gojo_blue',
            x: this.x + this.w / 2 - 10,
            y: (this.id === 1) ? this.y - 20 : this.y + this.h,
            w: 20, h: 20,
            vx: 0,
            vy: dirY * speed,
            dmg: this.damage,
            owner: this,
            isEvo2: isEvo2,
            iscanshoot: true,
            startX: this.x,
            startY: this.y,
            isPiercing: false,
            hitIds: []
        });

        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 40, 'rgba(0, 0, 255, 0.2)', 0, this));
    },

    fireGojoRed(isEvo2, enemy) {
        // 1. Cài đặt thông số tia Red (Evo 2 thì tia to hơn, choáng hợp lý)
        const beamW = isEvo2 ? 22 : 12;
        const stunFrames = isEvo2 ? 14 : 8; // Số frame làm choáng (đã nerf cân bằng)
        const beamX = this.x + this.w / 2 - beamW / 2;

        // Tọa độ Y và Chiều cao của tia (Bắn thẳng về phía đối diện)
        const bRy = (this.id === 1) ? 0 : this.y + this.h;
        const bRh = (this.id === 1) ? this.y : canvas.height - (this.y + this.h);

        // 2. Vẽ tia (Tận dụng array beams của bạn)
        beams.push(new Beam(beamX, bRy, beamW, bRh, this.id, isEvo2));

        // Thêm một vụ nổ nhỏ ngay họng súng để tạo cảm giác "Bắn Đỏ"
        explosions.push(new Explosion(this.x + this.w / 2, (this.id === 1) ? this.y : this.y + this.h, beamW + 20, 'rgba(255, 0, 0, 0.7)', 0, this));

        // 3. Xử lý va chạm với Kẻ địch (Gây Dmg + Choáng)
        if (rectIntersect(beamX, bRy, beamW, bRh, enemy.x, enemy.y, enemy.w, enemy.h)) { enemy.takeDamage(this.damage / 2, this);

            // [ĐẶC TRƯNG CỦA GOJO RED]: Làm choáng
            enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, stunFrames);

            // Hiệu ứng nổ đỏ đùng đùng trên người kẻ địch
            explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 60, 'rgba(255, 0, 0, 0.9)', 0, this));
        }

        // 4. Tương tác môi trường: Phá hòm (Giữ nguyên logic cực tốt của bạn)
        crates.forEach(c => {
            if (c.active && rectIntersect(beamX, bRy, beamW, bRh, c.x, c.y, c.w, c.h)) {
                c.active = false;
                if (c.isMimic) triggerMimicExplosion(c, this);
                if (c.type === 'hp') this.hp = Math.min(this.hp + 2, this.maxHp);
                if (c.type === 'ammo') this.onCollectAmmoCrate(c);
                if (c.type === 'shield') this.shield++;
                if (c.type === 'dmg') this.dmgBuff++;
                if (this.weapon === 'evolution') this.onEvolutionCrateEat(c.type);
                if (c.type === 'boom') explosions.push(new Explosion(c.x + c.w / 2, c.y + c.h / 2, 60, 'rgba(255,0,0,', 2, null));
                if (c.type === 'coin') {
                    let money = 30;
                    if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                }
            }
        });

        // 5. Tương tác môi trường: Bắn xe chở tiền
        moneyTrucks.forEach(t => {
            if (t.active && rectIntersect(beamX, bRy, beamW, bRh, t.x, t.y, t.w, t.h)) {
                let dmgToTruck = 10; // Đỏ bắn cháy xe nhanh hơn
                t.hp -= dmgToTruck;
                if (t.hp <= 0) {
                    t.active = false;
                    let money = 50;
                    if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                    if (this.weapon === 'evolution') this.onEvolutionCrateEat('truck');
                    explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 100, 'rgba(255,0,0,', 5, this));
                }
            }
        });
    },

    fireGojoPurple() {
        // Bắn một viên đạn Tím đặc biệt
        let dirY = (this.id === 1) ? -1 : 1;
        this.bullets.push({
            type: 'purple',
            x: this.x + this.w / 2 - 20,
            y: (this.id === 1) ? this.y - 40 : this.y + this.h,
            w: 40, h: 40,
            vx: 0,
            vy: dirY * 1, // Ban đầu bay rất chậm
            dmg: 2.2,
            owner: this,
            isPiercing: true,
            chargeTimer: 30,
            hitIds: []
        });
    },

    // [setupForNewRound] Kẻ Mạnh Nhất
    setupTheStrongest() {
        if (this.weapon === 'the_strongest') {
            this.maxHp = 1; this.hp = 1;
            this.damage = 2;
            this.maxAmmo = 0; this.ammo = 0;

            let hasSixEyes = this.hasUpgrade('evo_strongest_2');
            this.maxChuLuc = hasSixEyes ? 85 : 75;
            this.chuLuc = this.maxChuLuc;
            this.chuLucRegenRate = hasSixEyes ? 0.20 : 0.12;
            this.chuLucRegenCooldown = 0;

            this.gojoChargeTimer = 0;
            this.usedBlue = false;
            this.usedRed = false;
            this.canshotActive = true;
        }
    },

    // [update] Kẻ Mạnh Nhất — trả về currentSpeed mới
    updateTheStrongest(currentSpeed) {
        if (this.weapon === 'the_strongest' && (this.gojoChargeTimer || 0) > 0) {
            currentSpeed *= 0.35; // Làm chậm khi đang gồng niệm Chú Lực / Lãnh Địa
        }
        return currentSpeed;
    },

    // [handleShooting] Kẻ Mạnh Nhất — trả về true nếu cần dừng handleShooting()
    shootTheStrongest(inp) {
        if (this.weapon === 'the_strongest') {
            if (this.silenceTimer > 0) return true; // Đang câm lặng (do xài Domain) thì nghỉ

            let hasSixEyes = this.hasUpgrade('evo_strongest_2');
            let hasPurple = this.hasUpgrade('evo_strongest_1');

            if (inp.s) {
                this.gojoChargeTimer++;

                // Gợi ý hình ảnh khi gồng
                if (this.gojoChargeTimer === 60) {
                    // Mốc 1: Đủ gồng Đỏ
                    explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 40, 'rgba(255, 0, 0, 0.4)', 0, this));
                } else if (this.gojoChargeTimer === 300 && hasPurple) {
                    // Mốc 2: Đủ gồng Lãnh Địa (Bỏ ctx.fillText để tránh lỗi chớp nháy, dùng hiệu ứng nổ đen báo hiệu)
                    explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 100, 'rgba(0, 0, 0, 0.8)', 0, this));
                }
            } else {
                if (this.gojoChargeTimer > 0) {
                    const enemy = (this.id === 1) ? p2 : p1;

                    // 1. Lãnh Địa (Nerfed: Bỏ bất tử, Freeze 1s, Silence 1.5s, Tốn 75% Chú Lực)
                    if (this.gojoChargeTimer >= 300 && hasPurple && this.chuLuc >= this.maxChuLuc * 0.75) {
                        this.chuLuc -= this.maxChuLuc * 0.75;
                        this.invincibleTimer = 0; // Bỏ bất tử
                        this.silenceTimer = 60;
                        enemy.silenceTimer = 90; // Câm lặng 1.5s (cũ 3s)
                        enemy.freezeTimer = 60; // Choáng 1s (cũ 2s)
                        explosions.push(new Explosion(canvas.width / 2, canvas.height / 2, 350, 'rgba(0,0,0,0.8)', 0, this));

                        this.usedBlue = false;
                        this.usedRed = false;
                    }
                    // 2. Đỏ (Giữ > 1s, tốn 50 Chú lực)
                    else if (this.gojoChargeTimer >= 60 && this.chuLuc >= 50 && this.canshotActive) {
                        this.chuLuc -= 50;
                        this.usedRed = true;
                        this.canshotActive = false;

                        this.fireGojoRed(hasSixEyes, enemy);

                        setTimeout(() => { this.canshotActive = true; }, 1000);
                    }
                    // 3. Xanh (Nhấp, tốn 15 Chú lực)
                    else if (this.gojoChargeTimer < 60 && this.chuLuc >= 15 && this.canshotActive) {
                        this.chuLuc -= 15;
                        this.usedBlue = true;
                        this.canshotActive = false;

                        this.fireGojoBlue(hasSixEyes, enemy);

                        setTimeout(() => { this.canshotActive = true; }, 500);
                    }

                    // 4. Kích hoạt Tím (Nerfed: Bỏ bất tử 2s, Dame giảm còn 2.2, tốn 60% Chú Lực)
                    if (hasPurple && this.usedBlue && this.usedRed && this.chuLuc >= this.maxChuLuc * 0.6) {
                        this.chuLuc -= this.maxChuLuc * 0.6;
                        this.invincibleTimer = 0; // Bỏ bất tử 2s

                        this.fireGojoPurple(hasSixEyes, enemy);

                        this.usedBlue = false;
                        this.usedRed = false; // Xóa combo sau khi tung Tím
                    }

                    this.gojoChargeTimer = 0; // Reset timer sau khi nhả nút
                }
            }
            return true;
        }
    }
});
