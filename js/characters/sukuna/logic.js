// ==========================================
// sukuna (sukuna) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    // [setupForNewRound] sukuna
    setupSukuna() {
        if (this.weapon === 'sukuna') {
            this.cursedEnergy = 80;          // Thanh Chú Lực (0 - 100)
            this.sukunaChargeTimer = 0;      // Thời gian giữ nút bắn (tính bằng frame)
            this.lastRctHealTime = 0;        // Đánh dấu thời điểm hồi máu Phản Chuyển gần nhất
            this.domainActive = false;       // Trạng thái bật Lãnh địa
            this.sukunaDomainTick = 0;       // Số khung hình từ lúc mở Lãnh địa (chỉ dùng để vẽ)
            this.sukunaCeLockTimer = 0;      // Cooldown khóa hồi Chú Lực sau khi dính hit
            this.sukunaPassiveHealTimer = 0; // Hồi máu tự nhiên ngoài combat

            // THÊM 3 DÒNG NÀY ĐỂ TRACK NHÁT CHÉM THẾ GIỚI
            this.sukunaDomainUsed = false;   // Ghi nhận đã bật lãnh địa
            this.sukunaFugaCount = 0;        // Đếm số lần nổ Fuga
            this.worldCleaveTarget = null;   // Lưu mục tiêu đang bị ngắm
        }
    },

    // [update] sukuna — trả về true nếu cần dừng update()
    updateSukuna(now, effectiveInp) {
        if (this.weapon === 'sukuna') {
            let hasEvo1 = this.hasUpgrade('evo_sukuna_1');
            let hasEvo2 = this.hasUpgrade('evo_sukuna_2');
            let isFullEvo = hasEvo1 && hasEvo2;

            // 1. Tự động hồi Chú Lực theo thời gian
            // [BUFF]: Tăng Chú Lực cơ bản từ 5/s lên 10/s (0.167/frame), khi Full Evo & HP < 2 tăng lên 35/s
            let ceRegen = (this.hp < 2 && isFullEvo) ? (35 / 60) : (10 / 60);

            // BÙ LẠI: Khi nhận sát thương, sau 1s (60 frame) mới hồi Chú lực
            if (this.sukunaCeLockTimer > 0) {
                this.sukunaCeLockTimer--;
            } else if (!effectiveInp.s && !this.domainActive) {
                this.cursedEnergy = Math.min(100, this.cursedEnergy + ceRegen);
            }

            // [BUFF HỒI MÁU NỘI TẠI]: Hồi chậm ngoài giao tranh khi an toàn (+0.25 HP mỗi 4s)
            if ((this.sukunaCeLockTimer || 0) <= 0 && this.hp < this.maxHp) {
                this.sukunaPassiveHealTimer = (this.sukunaPassiveHealTimer || 0) + 1;
                if (this.sukunaPassiveHealTimer >= 240) {
                    this.hp = Math.min(this.maxHp, this.hp + 0.25);
                    this.sukunaPassiveHealTimer = 0;
                }
            } else {
                this.sukunaPassiveHealTimer = 0;
            }

            if (effectiveInp.s) {
                this.sukunaChargeTimer++;
                let chargeSec = this.sukunaChargeTimer / 60;
                let timePlayed = Date.now() - gameState.roundStartTime;
                let isSuddenDeath = timePlayed > C.suddenDeathTime;

                // ====================================================
                // [FIX LỖI CHÉM KHÔNG MƯỢT VÀ LỖI CHẠM ĐIỆN THOẠI]
                // Bắn NGAY LẬP TỨC ở Frame đầu tiên chạm nút (Chỉ 1 phát)
                // ====================================================
                if (this.sukunaChargeTimer === 1 && !this.domainActive) {
                    // ✅ THÊM COOLDOWN 300ms: now - this.lastShot > 300
                    if (this.cursedEnergy >= 10 && now - this.lastShot > 450) { // [CÂN BẰNG] 300 -> 450ms
                        this.cursedEnergy -= 5;
                        this.lastShot = now; // Lưu lại mốc thời gian bắn để chống spam
                        this.bullets.push({
                            type: 'sukuna_dismantle',
                            x: this.x + this.w / 2 - (hasEvo2 ? 30 : 15),
                            y: (this.id === 1) ? this.y - 15 : this.y + this.h,
                            w: hasEvo2 ? 60 : 30, h: 6,
                            vx: 0,
                            vy: (this.id === 1) ? -18 : 18,
                            dmg: 0.5, owner: this, hitIds: [], isSukunaSlash: true // [CÂN BẰNG] 1 -> 0.5
                        });
                    }
                }

                // --- CƠ CHẾ 4: NHÁT CHÉM THẾ GIỚI (WORLD CLEAVE) ---
                if (isFullEvo && isSuddenDeath && this.cursedEnergy >= 100 && this.sukunaDomainUsed && this.sukunaFugaCount >= 3) {
                    if (chargeSec >= 8.0) {
                        effectiveInp.l = false; effectiveInp.r = false;
                        let enemy = (this.id === 1) ? p2 : p1;
                        this.worldCleaveTarget = enemy;

                        if (chargeSec >= 9.0) {
                            enemy.hp = 0;
                            enemy.ghostHp = 0;
                            this.cursedEnergy = 0;
                            this.sukunaChargeTimer = 0;
                            this.worldCleaveTarget = null;
                            if (gameState.phase === 'playing') triggerFatalCinematic(this.id, enemy);
                        }
                        return true;
                    }
                }

                // --- CƠ CHẾ 3: BÀNH TRƯỚNG LÃNH ĐỊA ---
                if (isFullEvo && chargeSec >= 5.0 && chargeSec < 8.0) {
                    if (!this.domainActive && this.cursedEnergy >= 50) {
                        this.domainActive = true;
                        this.sukunaDomainUsed = true;
                        this.cursedEnergy -= 50;
                    }
                }

                if (this.domainActive) {
                    this.sukunaDomainTick = (this.sukunaDomainTick || 0) + 1; // đếm khung hình cho hiệu ứng mở Lãnh địa
                    this.cursedEnergy -= (2 / 60);
                    if (this.cursedEnergy <= 0) {
                        this.domainActive = false;
                    } else {
                        effectiveInp.l = false; effectiveInp.r = false;

                        if (Math.random() < 0.2) {
                            let enemy = (this.id === 1) ? p2 : p1;
                            let startX = (Math.random() > 0.5) ? enemy.x - 150 : enemy.x + enemy.w + 150;
                            let startY = enemy.y + (Math.random() * enemy.h * 2 - enemy.h);

                            this.bullets.push({
                                type: 'sukuna_dismantle',
                                x: Math.max(10, Math.min(canvas.width - 20, startX)), y: startY,
                                w: hasEvo2 ? 60 : 30, h: 8,
                                vx: (startX < enemy.x) ? 15 : -15, vy: (Math.random() * 4 - 2),
                                dmg: 0.5, owner: this, hitIds: [], isSukunaSlash: true
                            });
                        }

                        let enemy = (this.id === 1) ? p2 : p1;
                        if (enemy) {
                            enemy.takeDamage(0.1 / 60, this, { bypassShield: true });
                        }
                    }
                }

                // --- CƠ CHẾ 2: PHẢN CHUYỂN THẦN TỐC (RCT) ---
                if (!this.domainActive && !(hasEvo1 && this.cursedEnergy >= 100 && chargeSec >= 2.0)) {
                    if (chargeSec >= 1.2) {
                        effectiveInp.l = false; effectiveInp.r = false;

                        // [BUFF RCT]: Hồi máu nhanh và tốn ít Chú Lực hơn
                        let healInterval = isFullEvo ? 300 : 600;
                        let ceCost = isFullEvo ? 10 : 18;

                        let now = Date.now();
                        this.lastRctHealTime = this.lastRctHealTime || 0;

                        if (now - this.lastRctHealTime >= healInterval) {
                            if (this.cursedEnergy >= ceCost && this.hp < this.maxHp) {
                                this.hp = Math.min(this.maxHp, this.hp + 1.25);
                                this.cursedEnergy -= ceCost;
                                this.lastRctHealTime = now;
                                explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 45, 'rgba(0, 255, 100,', 0, this));
                                addFloatingText(this.x + this.w / 2, this.y - 15, "+1.25 HP", "#00ff88", 14);
                                soundSystem.playPowerup();
                            }
                        }
                    }
                }

            } else {
                // NHẢ NÚT BẮN
                let chargeSec = this.sukunaChargeTimer / 60;
                this.worldCleaveTarget = null;

                if (this.domainActive) {
                    this.domainActive = false;
                }
                this.sukunaDomainTick = 0;

                // PHÓNG FUGA (HỎA MŨI TÊN)
                if (hasEvo1 && this.cursedEnergy >= 99.5 && chargeSec >= 2.0 && chargeSec < 8.0) {
                    this.sukunaFugaCount++;
                    let fugaSize = 45;
                    this.bullets.push({
                        type: 'sukuna_fuga',
                        x: this.x + this.w / 2 - fugaSize / 2,
                        y: (this.id === 1) ? this.y - 10 : this.y + this.h,
                        w: fugaSize, h: fugaSize,
                        vx: 0,
                        vy: (this.id === 1) ? -7 : 7,
                        dmg: 3.5, owner: this, hitIds: [], isFuga: true
                    });
                    this.cursedEnergy = 0;
                }

                // Xóa bỏ code bắn Dismantle khi nhả nút ở đây để không bị đè nhát chém!
                this.sukunaChargeTimer = 0;
            }
        }
    },

    // [update] sukuna — trả về currentSpeed mới
    updateSukuna2(currentSpeed) {
        if (this.weapon === 'sukuna') {
            let isFullEvo = this.hasUpgrade('evo_sukuna_1') && this.hasUpgrade('evo_sukuna_2');
            // Nếu không có Full Evo và Chú Lực < 15 (không đủ tung Ngự Trảo)
            if (!isFullEvo && this.cursedEnergy < 15) {
                currentSpeed *= 0.75; // Giảm 25% tốc độ di chuyển
            }
        }
        return currentSpeed;
    },

    // [update] sukuna — trả về currentSpeed mới
    updateSukuna3(currentSpeed) {
        if (this.weapon === 'sukuna' && (this.sukunaChargeTimer || 0) > 0) {
            currentSpeed *= 0.35; // Làm chậm khi đang gồng niệm Lãnh Địa / Phản Chuyển
        }
        return currentSpeed;
    },

    // [handleShooting] sukuna — trả về true nếu cần dừng handleShooting()
    shootSukuna(inp, now) {
        if (this.weapon === 'sukuna') {
            let isFullEvo = this.hasUpgrade('evo_sukuna_1') && this.hasUpgrade('evo_sukuna_2');

            // Chỉ khi có Full Evo mới cho phép xả thêm đạn thường lúc giữ phím
            if (isFullEvo && inp.s) {
                if (this.ammo > 0 && now - this.lastShot > 1500) {
                    this.fireBullet(1);
                    this.ammo--;
                    this.lastShot = now;
                }
            }
            return true; // Nếu không có Full Evo -> Lệnh return này sẽ chặn mọi luồng bắn đạn thường!
        }
    }
});
