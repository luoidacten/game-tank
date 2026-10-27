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
            this.sukunaWorldUsed = false;    // Nhát Chém Thế Giới: 1 lần/hiệp
            this.skPrevS = false; this.skHeld = 0; this.skSinceRel = 999; this.skLastTapLen = 999;
            this.skFugaArmed = false; this.skBroken = false; this.skBF = false; this.jjkBfCd = 0;
        }
    },

    // [update] sukuna — trả về true nếu cần dừng update()
    updateSukuna(now, effectiveInp) {
        if (this.weapon === 'sukuna') {
            let hasEvo1 = this.hasUpgrade('evo_sukuna_1');
            let hasEvo2 = this.hasUpgrade('evo_sukuna_2');
            let isFullEvo = hasEvo1 && hasEvo2 && hasFullEvo(this, 'sukuna');

            // 1. Tự động hồi Chú Lực theo thời gian
            // [NERF]: 10/s -> 8/s (Full Evo & HP < 2: 35/s)
            let ceRegen = (this.hp < 2 && isFullEvo) ? (35 / 60) : ((isFullEvo ? 10 : 8) / 60);

            // BÙ LẠI: Khi nhận sát thương, sau 1s (60 frame) mới hồi Chú lực
            if (this.sukunaCeLockTimer > 0) {
                this.sukunaCeLockTimer--;
            } else if (!effectiveInp.s && !this.domainActive) {
                this.cursedEnergy = Math.min(100, this.cursedEnergy + ceRegen);
            }

            // Hồi máu nội tại chậm ngoài giao tranh (+0.25 HP mỗi 6s) [NERF 4s -> 6s]
            if ((this.sukunaCeLockTimer || 0) <= 0 && this.hp < this.maxHp) {
                this.sukunaPassiveHealTimer = (this.sukunaPassiveHealTimer || 0) + 1;
                if (this.sukunaPassiveHealTimer >= 360) {
                    this.hp = Math.min(this.maxHp, this.hp + 0.25);
                    this.sukunaPassiveHealTimer = 0;
                }
            } else {
                this.sukunaPassiveHealTimer = 0;
            }

            // Phát hiện nhấn / nhả (đếm tick, không phụ thuộc thứ tự cập nhật)
            const s = !!effectiveInp.s;
            const pressed = s && !this.skPrevS;
            const released = !s && this.skPrevS;
            this.skPrevS = s;
            if ((this.skSinceRel || 0) < 999) this.skSinceRel = (this.skSinceRel || 0) + 1;
            if (this.jjkBfCd > 0) this.jjkBfCd--;

            if (s) {
                if (pressed) {
                    this.sukunaChargeTimer = 0; this.skHeld = 0; this.skBroken = false; this.skBF = false;
                    // Hắc Thiểm: nhấp đúp nhanh
                    if (this.jjkTryBlackFlash()) this.skBF = true;
                    else {
                        // Fuga: đủ Chú Lực ngay lúc bấm -> "nạp" Fuga cho lần giữ này (không bị Phản Chuyển / nhát chém ăn mất Chú Lực)
                        this.skFugaArmed = hasEvo1 && this.cursedEnergy >= 60; // [SỬA] nới điều kiện: chỉ cần >= 60 Chú Lực
                        // Nhát chém Giải (Dismantle) ngay khi chạm nút (chỉ 1 phát; không chém khi đang nạp Fuga)
                        if (!this.skFugaArmed && !this.domainActive && this.cursedEnergy >= 10 && now - this.lastShot > 700) { // [NERF] 450 -> 700ms
                            this.cursedEnergy -= hasEvo2 ? 7 : 9; // [NERF] 5 -> 9 Chú Lực mỗi nhát (Evo 2: 7)
                            this.lastShot = now;
                            this.bullets.push({
                                type: 'sukuna_dismantle',
                                x: this.x + this.w / 2 - (hasEvo2 ? 30 : 15),
                                y: (this.id === 1) ? this.y - 15 : this.y + this.h,
                                w: hasEvo2 ? 60 : 30, h: 6,
                                vx: 0,
                                vy: (this.id === 1) ? -18 : 18,
                                dmg: 0.3, owner: this, hitIds: [], isSukunaSlash: true // [NERF] 0.5 -> 0.3
                            });
                        }
                    }
                } else if ((this.skHeld || 0) > 0 && this.sukunaChargeTimer === 0 && !this.skBroken && !this.skBF && !this.skFugaArmed) {
                    // Bị trúng đòn ngắt niệm (combat.js đặt sukunaChargeTimer = 0): huỷ cả lần giữ này
                    this.skBroken = true; this.skFugaArmed = false;
                    addFloatingText(this.x + this.w / 2, this.y - 12, 'NGẮT NIỆM', '#f87171', 11);
                }
                this.skHeld = (this.skHeld || 0) + 1;
                if (this.skBroken || this.skBF) return;

                this.sukunaChargeTimer++;
                let chargeSec = this.sukunaChargeTimer / 60;
                if (this.skFugaArmed && this.sukunaChargeTimer === 90) {
                    addFloatingText(this.x + this.w / 2, this.y - 14, 'FUGA ✓', '#ff8a00', 13);
                    explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 38, 'rgba(255, 120, 0,', 0, this));
                }

                // --- CƠ CHẾ 4: NHÁT CHÉM THẾ GIỚI (WORLD CLEAVE) ---
                // Full Evo, đã mở Lãnh Địa & đã phóng >= 2 Fuga trong hiệp: giữ 8s khoá mục tiêu, 9s kết liễu (1 lần/hiệp)
                if (isFullEvo && this.sukunaDomainUsed && this.sukunaFugaCount >= 2 && !this.sukunaWorldUsed && chargeSec >= 8.0) {
                    effectiveInp.l = false; effectiveInp.r = false;
                    let enemy = (this.id === 1) ? p2 : p1;
                    this.worldCleaveTarget = enemy;
                    if (this.sukunaChargeTimer === 480) addFloatingText(enemy.x + enemy.w / 2, enemy.y - 18, 'NHÁT CHÉM THẾ GIỚI', '#ff3b3b', 14);
                    if (chargeSec >= 9.0) {
                        this.sukunaWorldUsed = true;
                        this.domainActive = false;
                        enemy.hp = 0;
                        enemy.ghostHp = 0;
                        this.cursedEnergy = 0;
                        this.sukunaChargeTimer = 0;
                        this.skBroken = true; // phải nhả nút
                        this.worldCleaveTarget = null;
                        if (gameState.phase === 'playing') triggerFatalCinematic(this.id, enemy);
                    }
                    return true;
                }

                // --- CƠ CHẾ 3: BÀNH TRƯỚNG LÃNH ĐỊA ---
                if (isFullEvo && chargeSec >= 5.0 && chargeSec < 8.0) {
                    if (!this.domainActive && this.cursedEnergy >= 50) {
                        this.domainActive = true;
                        this.sukunaDomainUsed = true;
                        this.skFugaArmed = false; // mở Lãnh Địa thay cho Fuga
                        this.cursedEnergy -= 50;
                    }
                }

                if (this.domainActive) {
                    this.sukunaDomainTick = (this.sukunaDomainTick || 0) + 1; // đếm khung hình cho hiệu ứng mở Lãnh địa
                    this.cursedEnergy -= (2 / 60);
                    if (this.cursedEnergy <= 0) {
                        this.cursedEnergy = Math.max(0, this.cursedEnergy);
                        this.domainActive = false;
                    } else {
                        effectiveInp.l = false; effectiveInp.r = false;

                        if (Math.random() < 0.1) { // [NERF] 0.2 -> 0.1
                            let enemy = (this.id === 1) ? p2 : p1;
                            let startX = (Math.random() > 0.5) ? enemy.x - 150 : enemy.x + enemy.w + 150;
                            let startY = enemy.y + (Math.random() * enemy.h * 2 - enemy.h);

                            this.bullets.push({
                                type: 'sukuna_dismantle',
                                x: Math.max(10, Math.min(canvas.width - 20, startX)), y: startY,
                                w: hasEvo2 ? 60 : 30, h: 8,
                                vx: (startX < enemy.x) ? 15 : -15, vy: (Math.random() * 4 - 2),
                                dmg: 0.3, owner: this, hitIds: [], isSukunaSlash: true // [NERF] 0.5 -> 0.3
                            });
                        }

                        let enemy = (this.id === 1) ? p2 : p1;
                        if (enemy) {
                            enemy.takeDamage(0.1 / 60, this, { bypassShield: true });
                        }
                    }
                }

                // --- CƠ CHẾ 2: PHẢN CHUYỂN THẦN TỐC (RCT) --- (không chạy khi đang nạp Fuga)
                if (!this.domainActive && !this.skFugaArmed && chargeSec >= 1.2) {
                    effectiveInp.l = false; effectiveInp.r = false;

                    // [NERF RCT]: +1.25 -> +0.6 HP, chậm hơn & tốn nhiều Chú Lực hơn
                    let healInterval = isFullEvo ? 500 : 800;
                    let ceCost = isFullEvo ? 14 : 22;

                    let now = Date.now();
                    this.lastRctHealTime = this.lastRctHealTime || 0;

                    if (now - this.lastRctHealTime >= healInterval) {
                        if (this.cursedEnergy >= ceCost && this.hp < this.maxHp) {
                            this.hp = Math.min(this.maxHp, this.hp + 0.6);
                            this.cursedEnergy -= ceCost;
                            this.lastRctHealTime = now;
                            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 45, 'rgba(0, 255, 100,', 0, this));
                            addFloatingText(this.x + this.w / 2, this.y - 15, "+0.6 HP", "#00ff88", 14);
                            soundSystem.playPowerup();
                        }
                    }
                }

            } else {
                // NHẢ NÚT BẮN
                let chargeSec = this.sukunaChargeTimer / 60;
                this.worldCleaveTarget = null;
                if (released) { this.skLastTapLen = this.skHeld || 0; this.skSinceRel = 0; this.skHeld = 0; }

                if (this.domainActive) {
                    this.domainActive = false;
                }
                this.sukunaDomainTick = 0;

                // PHÓNG FUGA (HỎA MŨI TÊN): đã "nạp" lúc bấm, giữ >= 2s rồi nhả
                if (released && this.skFugaArmed && !this.skBroken && chargeSec >= 1.5 && this.cursedEnergy >= 50) {
                    this.sukunaFugaCount++;
                    let fugaSize = 45;
                    this.bullets.push({
                        type: 'sukuna_fuga',
                        x: this.x + this.w / 2 - fugaSize / 2,
                        y: (this.id === 1) ? this.y - 10 : this.y + this.h,
                        w: fugaSize, h: fugaSize,
                        vx: 0,
                        vy: (this.id === 1) ? -7 : 7,
                        dmg: 2.1, owner: this, hitIds: [], isFuga: true // [NERF] 3.5 -> 2.1
                    });
                    this.cursedEnergy = Math.max(0, this.cursedEnergy - 60);
                    addFloatingText(this.x + this.w / 2, this.y - 16, 'FUGA', '#ff8a00', 16);
                }
                this.skFugaArmed = false;
                this.skBroken = false; this.skBF = false;

                this.sukunaChargeTimer = 0;
            }
        }
    },

    // [update] sukuna — trả về currentSpeed mới
    updateSukuna2(currentSpeed) {
        if (this.weapon === 'sukuna') {
            let isFullEvo = hasFullEvo(this, 'sukuna');
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
            let isFullEvo = hasFullEvo(this, 'sukuna');

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
