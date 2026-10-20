// ==========================================
// Cuồng Phong (storm) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    firePhantom(ratio) {
        let dirY = (this.id === 1) ? -1 : 1;
        // Tốc độ hư ảnh cực nhanh
        let speed = 30;

        this.bullets.push({
            x: this.x, y: this.y,
            w: this.w, h: this.h, // Kích thước bằng người chơi
            vx: 0, vy: dirY * speed,
            dmg: 2 + (ratio * 4), // Dame va chạm của bóng
            owner: this,
            isStormPhantom: true, // Cờ nhận biết
            chargeRatio: ratio,   // Lưu lực mang theo
            hitIds: [],           // Để xuyên thấu không hit 1 mục tiêu nhiều lần
            distanceTraveled: 0,  // Theo dõi quãng đường
            maxDistance: canvas.height * 0.8 // Bay tối đa 80% màn hình thì dừng
        });
    },

    // Hàm bắn bóng hư ảnh (Storm Evo 2 Passive)
    fireStormShadow() {
        let chargeSim = 0.2 + Math.random() * 0.6; // Random lực 2s-4s tương đương ratio 0.25 - 0.5
        let size = 40;
        let dirY = (this.id === 1) ? -1 : 1;

        this.bullets.push({
            x: this.x, y: this.y, w: this.w, h: this.h,
            vx: 0, vy: dirY * 15, // Lao rất nhanh
            dmg: 2 + chargeSim * 2,
            owner: this,
            isStormShadow: true, // Cờ đánh dấu để vẽ bóng
            activeTime: 30 // Chỉ tồn tại ngắn
        });
    },

    executeStormSlash() {

        let slashDelay = 600;
        let ratio = this.savedChargeRatio || 0;
        let radius = 60 + (ratio * 60);
        let finalDmg = 2 + (ratio * 1);

        let isVacuum = (this.hasUpgrade('evo_storm_1') && ratio > 0.5);
        // Logic Hư Ảnh Lặp Lại (Full Evo)
        let isFullEvoEcho = (this.hasUpgrade('evo_storm_1') && this.hasUpgrade('evo_storm_2') && ratio >= 0.5);

        let targetX = this.x;
        let targetY = this.y;

        // 1. Nhát chém chính
        iceZones.push(new StormSlash(targetX + this.w / 2, targetY + this.h / 2, radius, finalDmg, this, isVacuum));

        // 2. [NEW] Hư Ảnh Lặp Lại (Full Evo)
        if (isFullEvoEcho) {
            setTimeout(() => {
                // Phạm vi 1/2, Dame 1/2
                let echoRadius = radius * 0.5;
                let echoDmg = finalDmg * 0.5;

                // Tạo Slash
                iceZones.push(new StormSlash(targetX + this.w / 2, targetY + this.h / 2, echoRadius, echoDmg, this, false));

                // Visual Hư Ảnh
                explosions.push(new Explosion(targetX + this.w / 2, targetY + this.h / 2, echoRadius, 'rgba(100, 100, 255,', 0, this));

            }, 300); // Lặp lại sau 0.3s (như tiếng vọng)
        }

        // 3. Xử lý Dịch chuyển về (Giữ nguyên code cũ)
        if (this.stormReturnPos) {
            explosions.push(new Explosion(targetX + this.w / 2, targetY + this.h / 2, 40, 'rgba(255,255,255,', 0, this));

            // Logic Bóng Evo 2 cũ (Giữ nguyên hoặc bỏ tùy bạn, ở đây giữ nguyên để cộng dồn độ bá đạo)
            if (this.hasUpgrade('evo_storm_2') && ratio >= 0.95 && this.shield > 0) {
                let shadow = {
                    x: targetX, y: targetY, w: this.w, h: this.h,
                    vx: 0, vy: 0, owner: this,
                    isStormShadow: true, isPiercing: true, hitIds: []
                };
                this.bullets.push(shadow);
                setTimeout(() => {
                    let idx = this.bullets.indexOf(shadow);
                    if (idx > -1) this.bullets.splice(idx, 1);
                }, slashDelay + 100);
            }

            this.x = this.stormReturnPos.x;
            this.y = this.stormReturnPos.y;
            this.stormReturnPos = null;
        }
    },

    // [setupForNewRound] Cuồng Phong
    setupStorm() {
        if (this.weapon === 'storm') {
            this.speed += 1.5;
            this.maxAmmo = 0;
            this.stormDashState = 0;
            this.stormChargeStart = 0;
            this.stormAutoChargeTimer = 0;
            this.stormMaxChargeTime = 3500; // [ĐỔI] Giữ nút 3.5s là đầy lực (trước: tự nạp 14s)
            this.stormChargeRatio = 0;
            this.stormShadowTimer = 0;
            this.stormShadowCooldown = 200 + Math.random() * 300;
            this.shield = 1;
            this.stormSlashDelay = 0;
            this.stormReturnPos = null;
            this.stormEcho = false;
            this.stormHeld = false;
        }
    },

    // [update] Cuồng Phong — trả về true nếu cần dừng update()
    updateStorm(inp) {
        if (this.weapon === 'storm') {
            // 1. Xử lý Delay chờ chém (Dùng cho cả lúc Lao xong hoặc Dịch chuyển xong)
            if (this.stormSlashDelay > 0) {
                this.stormSlashDelay--;
                this.x += (Math.random() - 0.5) * 4; // Rung lắc
                if (this.stormSlashDelay <= 0) {
                    this.executeStormSlash();
                }
                return true;
            }

            // [ĐỔI] Tụ lực khi GIỮ nút bắn (không còn tự nạp); nhả nút để xuất chiêu
            if (this.stormDashState === 0 && this.stormSlashDelay <= 0 && inp && inp.s) {
                let chargeDuration = this.stormMaxChargeTime || 14000;
                this.stormAutoChargeTimer = Math.min(chargeDuration, (this.stormAutoChargeTimer || 0) + (1000 / 60));
                this.stormChargeRatio = this.stormAutoChargeTimer / chargeDuration;

                // Hiệu ứng "Mắt Bão" Evo 1: Xóa đạn quanh xe khi tự tụ > 50% và có khiên
                if (this.hasUpgrade('evo_storm_1') && this.stormChargeRatio > 0.5 && this.shield > 0) {
                    let enemyBullets = (this.id === 1) ? (typeof p2 !== 'undefined' ? p2.bullets : null) : (typeof p1 !== 'undefined' ? p1.bullets : null);
                    if (enemyBullets) {
                        for (let i = enemyBullets.length - 1; i >= 0; i--) {
                            let b = enemyBullets[i];
                            let d = Math.hypot((this.x + this.w / 2) - b.x, (this.y + this.h / 2) - b.y);
                            if (d < 80) enemyBullets.splice(i, 1);
                        }
                    }
                }
            }

            // Passive Evo 2 (Bóng tự động)
            if (this.hasUpgrade('evo_storm_2')) {
                this.stormShadowTimer++;
                if (this.stormShadowTimer >= this.stormShadowCooldown) {
                    this.fireStormShadow();
                    this.stormShadowTimer = 0;
                    this.stormShadowCooldown = 180 + Math.random() * 300;
                }
            }


            // 2. [KHÔI PHỤC] Xử lý Lao Thân Mình (Normal Dash)
            if (this.stormDashState === 1) {
                let dir = (this.id === 1) ? -1 : 1;
                this.y += 18 * dir; // Tốc độ lao

                // --- KIỂM TRA VA CHẠM KHI LAO ---
                let hitObstacle = false;

                // A. Tường bao quanh map
                if (this.y < 0 || this.y > canvas.height - this.h) {
                    this.y = (this.y < 0) ? 0 : canvas.height - this.h;
                    hitObstacle = true;
                }
                // B. Địch
                const enemy = (this.id === 1) ? p2 : p1;
                if (rectIntersect(this.x, this.y, this.w, this.h, enemy.x, enemy.y, enemy.w, enemy.h)) hitObstacle = true;

                // C. Thanh Ngang
                if (typeof movingObstacle !== 'undefined' && movingObstacle && movingObstacle.active && rectIntersect(this.x, this.y, this.w, this.h, movingObstacle.x, movingObstacle.y, movingObstacle.w, movingObstacle.h)) hitObstacle = true;

                // D. Xe Tiền
                if (typeof moneyTrucks !== 'undefined') {
                    for (let t of moneyTrucks) {
                        if (t.active && rectIntersect(this.x, this.y, this.w, this.h, t.x, t.y, t.w, t.h)) { hitObstacle = true; break; }
                    }
                }
                // E. Thùng
                if (typeof crates !== 'undefined') {
                    for (let c of crates) {
                        if (c.active && rectIntersect(this.x, this.y, this.w, this.h, c.x, c.y, c.w, c.h)) { hitObstacle = true; break; }
                    }
                }
                // F. Ụ SÚNG (TURRETS)
                for (let t of turrets) {
                    if (t.active && t.owner.id !== this.id && rectIntersect(this.x, this.y, this.w, this.h, t.x, t.y, t.w, t.h)) {
                        hitObstacle = true; break;
                    }
                }
                // G. TƯỜNG SNIPER [CẬP NHẬT MỚI]
                if (typeof sniperWalls !== 'undefined') {
                    for (let w of sniperWalls) {
                        if (w.active && rectIntersect(this.x, this.y, this.w, this.h, w.x, w.y, w.w, w.h)) {
                            hitObstacle = true; break;
                        }
                    }
                }

                // Nếu va chạm -> Dừng lại -> Chuẩn bị chém (Phát chém sẽ dùng checkHits để phá hủy công trình)
                if (hitObstacle) {
                    this.stormDashState = 0;
                    this.stormSlashDelay = 30; // Chờ 0.5s rồi chém
                }
                return true;
            }
        }
    },

    // [update] Cuồng Phong
    updateStorm2() {
        if (this.weapon === 'storm' && this.hasUpgrade('evo_storm_1') && this.hasUpgrade('evo_storm_2')) {
            // Bật cờ trời mưa
            isRaining = true;
        } else {
            // Nếu không ai có Storm Full Evo thì tắt mưa (trừ khi đối thủ có)
            // Logic này đơn giản, nếu muốn chuẩn hơn phải check cả 2 player
        }
    },

    // [handleShooting] Cuồng Phong — trả về true nếu cần dừng handleShooting()
    shootStorm(inp) {
        if (this.weapon === 'storm') {
            if (this.stormDashState === 1 || this.stormSlashDelay > 0) return true;

            const released = !inp.s && this.stormHeld;
            this.stormHeld = !!inp.s;
            if (released) {
                let ratio = this.stormChargeRatio || 0;
                // Nhả nút để giải phóng lực (cần ít nhất 5% lực)
                if (ratio >= 0.05) {
                    this.savedChargeRatio = ratio;
                    this.stormReturnPos = { x: this.x, y: this.y };
                    if (ratio >= 1 && this.hasUpgrade('evo_storm_1')) {
                        this.shield += 2;
                    }

                    // KIỂM TRA ĐIỀU KIỆN CHIÊU CUỐI: Full Lực (>=95%) + Còn Khiên
                    if (ratio >= 0.95 && this.shield > 0) {
                        // ==> BẮN HƯ ẢNH (Ultimate)
                        this.firePhantom(ratio);
                    } else {
                        // ==> LAO BÌNH THƯỜNG (Normal Dash)
                        this.stormDashState = 1; // Kích hoạt dash trong update()
                    }

                    // Reset tụ lực sau khi xuất chiêu
                    this.stormAutoChargeTimer = 0;
                    this.stormChargeRatio = 0;
                    this.stormChargeStart = 0;
                } else {
                    this.stormAutoChargeTimer = 0;
                    this.stormChargeRatio = 0;
                }
            }
            inp.s = false;
            return true;
        }
    }
});

// takeDamage: kết liễu CUỒNG PHONG / THIÊN PHONG (nối tiếp wrapper sẵn có)
(function () {
    const orig = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker) {
        const before = this.hp;
        const r = orig.apply(this, arguments);
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && attacker.weapon === 'storm'
            && typeof bodyEffects !== 'undefined' && !bodyEffects.some(e => e instanceof StFinisher)) {
            bodyEffects.push(new StFinisher(attacker, this));
            triggerScreenShake(8, 12);
            if (typeof spawnSparkParticles === 'function') spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, '#5eead4', 24);
            if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem.playExplosion) soundSystem.playExplosion();
        }
        return r;
    };
})();
