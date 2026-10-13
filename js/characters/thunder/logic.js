// ==========================================
// thunder (thunder) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    triggerThunderAction(held, now) {
        if (held < 30) {
            // Nhấp (< 0.5s): Phóng 1 Lôi Phong Thương xuyên qua mọi vật thể/kẻ địch
            if ((this.thunderActionCooldown || 0) > 0) {
                if (typeof addFloatingText === 'function') {
                    let secLeft = ((this.thunderActionCooldown || 0) / 60).toFixed(1);
                    addFloatingText(this.x + this.w / 2, this.y - 14, `HỒI CHIÊU (${secLeft}s)! ⏳`, "#aaa", 11);
                }
                return;
            }
            if (now - (this.lastShot || 0) < 350) {
                return; // Chống lỗi spam bắn liên tục
            }
            if ((this.thunderSpears || 0) > 0) {
                this.thunderSpears--;
                let dirY = (this.id === 1) ? -1 : 1;
                let bSpeed = C.bulletSpeed * 2.2;
                if (typeof gameState !== 'undefined' && gameState.currentMap === 'overdrive') bSpeed *= 1.5;
                this.bullets.push({
                    x: this.x + this.w / 2 - 4,
                    y: (this.id === 1) ? this.y - 14 : this.y + this.h + 2,
                    w: 8, h: 18,
                    vx: 0,
                    vy: dirY * bSpeed,
                    dmg: 1.0,
                    owner: this,
                    isThunderSpear: true,
                    isPiercing: true,
                    hitIds: [],
                    bounceCount: 0
                });
                this.lastShot = now;
                if (soundSystem && !soundSystem.muted) soundSystem.playShoot();
            } else {
                // Nếu phóng hết 3 cây thương mà vẫn bấm nhấp -> Tự động kích hoạt Thu Thương có cảnh báo 0.25s
                this.startThunderRecall(false);
            }
        } else if (held >= 30 && held <= 60) {
            // Giữ vừa (0.5s - 1s): Thu Thương
            this.startThunderRecall(false);
        } else {
            // Giữ lâu (> 1s): Trảm Lôi Liên Hoàn
            this.startThunderSlashSequence();
        }
    },

    startThunderRecall(instant = false) {
        let mySpears = (typeof thunderPlantedSpears !== 'undefined' ? thunderPlantedSpears : []).filter(s => s.owner === this);
        if (mySpears.length === 0) {
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, "KHÔNG CÓ THƯƠNG!", "#aaa", 12);
            return;
        }
        if (this.thunderIsRecallWarning) return;
        this.thunderIsRecallWarning = true;
        this.thunderRecallWarningTimer = 15; // 0.25s cảnh báo
        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "THU THƯƠNG! ⚡", "#ffff00", 14);
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    },

    executeThunderRecall() {
        let mySpears = (typeof thunderPlantedSpears !== 'undefined' ? thunderPlantedSpears : []).filter(s => s.owner === this);
        if (mySpears.length === 0) return;
        let enemy = (this.id === 1) ? p2 : p1;
        let targetX = this.x + this.w / 2;
        let targetY = this.y + this.h / 2;
        let hitCount = 0;

        triggerScreenShake(7, 10);
        if (soundSystem && !soundSystem.muted) {
            soundSystem.playLaser();
            soundSystem.playHit();
        }

        mySpears.forEach(s => {
            if (enemy && enemy.hp > 0) {
                let d = distToSegment(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, s.x, s.y, targetX, targetY);
                if (d <= enemy.w / 2 + 18) {
                    enemy.takeDamage(1.0, this);
                    hitCount++;
                }
            }
            if (typeof explosions !== 'undefined') {
                explosions.push(new Explosion(s.x, s.y, 35, '#ffff00', 0, this));
            }
            if (typeof spawnSparkParticles === 'function') {
                spawnSparkParticles(s.x, s.y, '#ffff00', 8);
                spawnSparkParticles(targetX, targetY, '#00ffff', 8);
            }
        });

        if (hitCount > 0 && typeof addFloatingText === 'function') {
            addFloatingText(enemy.x + enemy.w / 2, enemy.y - 12, "THU THƯƠNG -1 DMG ⚡", "#ffff00", 14);
        }

        let recoveredCount = mySpears.length;
        this.thunderSpears = 3;
        this.thunderActionCooldown = 60; // 1s (60 ticks) cooldown sau khi thu thương trước khi ném lại
        this.lastShot = Date.now();
        this.thunderConsumedSpears = (this.thunderConsumedSpears || 0) + recoveredCount;
        if (this.thunderConsumedSpears >= 3) {
            this.thunderConsumedSpears -= 3;
            this.thunderLoiMinhStacks = (this.thunderLoiMinhStacks || 0) + 1;
            if (this.thunderLoiMinhStacks >= 3) {
                this.activateThienKiep();
            }
        }
        thunderPlantedSpears = thunderPlantedSpears.filter(s => s.owner !== this);
    },

    startThunderRaycastWarning(now) {
        this.thunderRaycastWarningTimer = 15; // 0.25s (15 ticks) cảnh báo
        this.thunderRaycastX = this.x + this.w / 2;
        this.lastShot = now;
        if (typeof addFloatingText === 'function') addFloatingText(this.thunderRaycastX, this.y - 15, "LÔI MINH ĐANG GIÁNG! ⚡", "#ffeb3b", 12);
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    },

    startThunderSlashSequence() {
        let mySpears = (typeof thunderPlantedSpears !== 'undefined' ? thunderPlantedSpears : []).filter(s => s.owner === this);
        if (mySpears.length === 0) {
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 14, "KHÔNG CÓ THƯƠNG!", "#aaa", 12);
            return;
        }
        this.thunderSlashQueue = [...mySpears];
        thunderPlantedSpears = thunderPlantedSpears.filter(s => s.owner !== this);
        this.thunderIsSlashing = true;
        this.thunderSlashIndex = 0;
        this.thunderSlashTimer = 0;
        this.thunderOriginPos = { x: this.x, y: this.y };
        this.isInvulnerable = true;
        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 18, "TRẢM LÔI LIÊN HOÀN! ⚡🌪", "#ffff00", 16);
    },

    activateThienKiep() {
        this.thunderLoiMinhStacks = 0;
        let hasEvo2 = this.hasUpgrade('evo_thun_2');
        this.thunderLoiMinhTimer = hasEvo2 ? 480 : 300; // 8s hoặc 5s
        if (hasEvo2) {
            this.thunderShieldHits = 3;
        }
        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 20, "⚡ THIÊN KIẾP KÍCH HOẠT! ⚡", "#ffd700", 16);
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    },

    fireThunderRaycast(now) {
        let dirY = (this.id === 1) ? -1 : 1;
        let startX = this.x + this.w / 2;
        let startY = (this.id === 1) ? this.y : this.y + this.h;
        let targetY = (dirY === -1) ? 0 : canvas.height;
        let enemy = (this.id === 1) ? p2 : p1;
        let hitWidth = 24;

        if (enemy && enemy.hp > 0 && enemy.x <= startX + hitWidth && enemy.x + enemy.w >= startX - hitWidth) {
            enemy.takeDamage(2.0, this);
            if (typeof addFloatingText === 'function') addFloatingText(enemy.x + enemy.w / 2, enemy.y - 14, "THIÊN KIẾP -2 DMG ⚡⚡", "#ffd700", 16);
        }
        crates.forEach(c => {
            if (c.active && c.x <= startX + 22 && c.x + c.w >= startX - 22) {
                c.active = false;
                crateOnBreak(c, this);
                if (c.isMimic) triggerMimicExplosion(c, this);
                this.onCollectAmmoCrate(c);
            }
        });
        beams.push(new Beam(startX - 6, Math.min(startY, targetY), 12, Math.abs(targetY - startY), this.id, true));
        triggerScreenShake(4, 6);
        if (soundSystem && !soundSystem.muted) soundSystem.playLaser();
    },

    // [setupForNewRound] thunder
    setupThunder() {
        if (this.weapon === 'thunder') {
            this.speed *= 1.3;
            this.thunderSpears = 3;
            this.thunderHoldFrames = 0;
            this.thunderLoiMinhStacks = 0;
            this.thunderLoiMinhTimer = 0;
            this.thunderShieldHits = 0;
            this.thunderIsRecallWarning = false;
            this.thunderRecallWarningTimer = 0;
            this.thunderIsSlashing = false;
            this.thunderSlashIndex = 0;
            this.thunderSlashTimer = 0;
            this.thunderOriginPos = null;
            this.thunderConsumedSpears = 0;
            this.thunderActionCooldown = 0;
            this.thunderRaycastWarningTimer = 0;
        }
    },

    // [update] thunder
    updateThunder() {
        if (this.weapon === 'thunder') {
            // Giảm hồi chiêu sau khi thu thương hoặc dùng kỹ năng (cần 1s để tiếp tục ném)
            if ((this.thunderActionCooldown || 0) > 0) {
                this.thunderActionCooldown--;
            }

            // Cảnh báo Lôi Minh / Thiên Kiếp trước khi bắn (0.25s)
            if ((this.thunderRaycastWarningTimer || 0) > 0) {
                this.thunderRaycastWarningTimer--;
                if (this.thunderRaycastWarningTimer <= 0) {
                    this.fireThunderRaycast(Date.now());
                }
            }

            // 1. Cảnh báo Thu Thương (15 frame ~ 0.25s)
            if (this.thunderIsRecallWarning) {
                this.thunderRecallWarningTimer--;
                if (this.thunderRecallWarningTimer <= 0) {
                    this.thunderIsRecallWarning = false;
                    this.executeThunderRecall();
                }
            }

            // 2. Trảm Lôi Liên Hoàn
            if (this.thunderIsSlashing) {
                this.thunderSlashTimer = (this.thunderSlashTimer || 0) + 1;
                if (this.thunderSlashTimer >= 30) {
                    this.thunderSlashTimer = 0;
                    if (this.thunderSlashQueue && this.thunderSlashIndex < this.thunderSlashQueue.length) {
                        let sp = this.thunderSlashQueue[this.thunderSlashIndex];
                        this.thunderSlashIndex++;
                        this.x = Math.max(0, Math.min(canvas.width - this.w, sp.x - this.w / 2));
                        this.y = Math.max(0, Math.min(canvas.height - this.h, sp.y - this.h / 2));

                        let radius = 60;
                        let enemy = (this.id === 1) ? p2 : p1;
                        let hasEvo1 = this.hasUpgrade('evo_thun_1');
                        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, radius, 'rgba(255, 255, 0,', 1.0, this));
                        if (enemy && enemy.hp > 0 && Math.hypot((enemy.x + enemy.w / 2) - (this.x + this.w / 2), (enemy.y + enemy.h / 2) - (this.y + this.h / 2)) <= radius) {
                            enemy.takeDamage(1.0, this);
                            if (hasEvo1) {
                                enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, 60);
                                if (typeof addFloatingText === 'function') addFloatingText(enemy.x + enemy.w / 2, enemy.y - 12, "TÊ LIỆT! ⚡", "#ffff00", 14);
                            }
                        }
                        this.thunderSpears = Math.min(3, (this.thunderSpears || 0) + 1);
                        if (soundSystem && !soundSystem.muted) soundSystem.playHit();
                    } else {
                        // Kết thúc chuỗi Trảm Lôi -> tốc biến về vị trí ban đầu
                        if (this.thunderOriginPos) {
                            this.x = this.thunderOriginPos.x;
                            this.y = this.thunderOriginPos.y;
                        }
                        this.thunderIsSlashing = false;
                        this.isInvulnerable = false;
                        this.thunderSpears = 3;
                        this.thunderActionCooldown = 60; // 1s (60 ticks) cooldown sau khi kết thúc skill
                        this.lastShot = Date.now();
                        this.thunderLoiMinhStacks = (this.thunderLoiMinhStacks || 0) + 1;
                        if (this.thunderLoiMinhStacks >= 3) {
                            this.activateThienKiep();
                        }
                    }
                }
            }

            // 3. Thời gian Thiên Kiếp
            if (this.thunderLoiMinhTimer > 0) {
                this.thunderLoiMinhTimer--;
                if (this.thunderLoiMinhTimer % 12 === 0 && typeof spawnSparkParticles === 'function') {
                    spawnSparkParticles(this.x + Math.random() * this.w, this.y + Math.random() * this.h, "#ffd700", 2);
                }
            }

            // 4. Full Evo: Bão Sấm Thịnh Nộ (2.5s sét đánh 1 lần, báo trước 0.5s)
            if (this.hasUpgrade('evo_thun_1') && this.hasUpgrade('evo_thun_2')) {
                this.thunderFullEvoTimer = (this.thunderFullEvoTimer || 0) + 1;
                if (this.thunderFullEvoTimer >= 150) {
                    this.thunderFullEvoTimer = 0;
                    // [FIX] Sét rơi đúng làn đối thủ (trước: ngẫu nhiên khắp sân)
                    const lt = laneTargetPoint((this.id === 1) ? p2 : p1, 90);
                    let rx = lt.x, ry = lt.y;
                    let hazard = new ArtilleryHazard(rx, ry);
                    hazard.detonateTime = 500;
                    hazard.maxR = 50;
                    hazard.explode = function() {
                        this.active = false;
                        explosions.push(new Explosion(this.x, this.y, this.maxR, 'rgba(255, 255, 0,', 1.5, null, true));
                        [p1, p2].forEach(p => {
                            if (p && p.hp > 0 && Math.hypot((p.x + p.w / 2) - this.x, (p.y + p.h / 2) - this.y) <= this.maxR) {
                                p.takeDamage(1.5, null);
                                p.freezeTimer = Math.max(p.freezeTimer || 0, 60);
                                if (typeof addFloatingText === 'function') addFloatingText(p.x + p.w / 2, p.y - 12, "SẤM GIẬT! ⚡", "#ffff00", 14);
                            }
                        });
                    };
                    artilleryHazards.push(hazard);
                }
            }

            // Visual tụ lực của Thunder được vẽ tại draw() để đồng bộ render loop
        }
    },

    // [handleShooting] thunder — trả về true nếu cần dừng handleShooting()
    shootThunder(inp, now) {
        if (this.weapon === 'thunder') {
            if (this.thunderIsSlashing) return true;
            if (this.thunderLoiMinhTimer > 0) {
                if (inp.s && now - this.lastShot > 500 && (this.thunderRaycastWarningTimer || 0) <= 0) {
                    this.startThunderRaycastWarning(now);
                    inp.s = false;
                }
                return true;
            }
            if (inp.s) {
                this.thunderHoldFrames = (this.thunderHoldFrames || 0) + 1;
                return true;
            } else {
                if (this.thunderHoldFrames > 0) {
                    let held = this.thunderHoldFrames;
                    this.thunderHoldFrames = 0;
                    this.triggerThunderAction(held, now);
                }
                return true;
            }
        }
    }
});
