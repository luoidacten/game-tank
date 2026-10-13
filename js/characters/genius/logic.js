// ==========================================
// genius (genius) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    enterMecha(cost) {
        this.gears = Math.max(0, (this.gears || 0) - cost);
        this.isPilotingMecha = true;
        // [FIX] Giữ nguyên tâm xe khi phóng to thành Mecha (trước đây bị lệch sang phải)
        let cxM = this.x + this.w / 2;
        this.w = 40; this.h = 40;
        this.x = Math.max(0, Math.min(canvas.width - this.w, cxM - this.w / 2));
        this.y = (this.id === 1) ? canvas.height - this.h - 22 : 20;

        let upg = this.geniusUpgrades || {};
        this.mechaMaxHp = 5 + this.maxHp + (upg['gen_hp'] || 0) * 3;
        this.mechaHp = this.mechaMaxHp;
        this.mechaVirtualArmor = (upg['gen_shield'] || 0) > 0 ? 1 : 0;
        this.mechaMaxEnergy = this.maxHp * 10 + (upg['gen_energy'] || 0) * 15;
        this.mechaEnergy = this.mechaMaxEnergy;
        this.mechaDmg = this.damage * 0.25 + (upg['gen_dmg'] || 0) * 0.25;
        this.mechaMode = 1;
        this.mechaIdleFrames = 0;

        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 45, '#ff9800', 0, this));
        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 18, "LÁI MECHA CHIẾN ĐẤU! 🤖⚡", "#ff9800", 15);
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    },

    ejectMecha(fromSelfDestruct = false) {
        if (!this.isPilotingMecha) return;
        this.isPilotingMecha = false;
        let cxM = this.x + this.w / 2;
        this.w = 24; this.h = 24;
        this.x = Math.max(0, Math.min(canvas.width - this.w, cxM - this.w / 2));
        this.y = (this.id === 1) ? canvas.height - this.h - 22 : 20;

        if (!fromSelfDestruct) {
            this.hp = Math.max(0.5, this.hp * 0.5);
            this.mechaSummonMultiplier = (this.mechaSummonMultiplier || 1) * 2;
            let refund = (this.hasUpgrade('evo_gen_1') && this.hasUpgrade('evo_gen_2')) ? 6 : (this.hasUpgrade('evo_gen_1') ? 4 : 0);
            if (refund > 0) {
                this.gears = (this.gears || 0) + refund;
                if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, `HOÀN +${refund} BÁNH RĂNG ⚙️`, "#ffb74d", 13);
            }
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 25, "THOÁT HIỂM! 🏃💨 (-50% HP)", "#ff5722", 14);
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 50, '#ff5722', 0, this));
            if (soundSystem && !soundSystem.muted) soundSystem.playShieldBreak();
        }
    },

    selfDestructMecha() {
        if (!this.isPilotingMecha) return;
        let isFullEvo = this.hasUpgrade('evo_gen_1') && this.hasUpgrade('evo_gen_2');
        if (!isFullEvo) return;

        // [ĐỔI CƠ CHẾ] Ném Robot: lao thẳng về phía trước, chạm tường mới phát nổ
        const throwX = this.x + this.w / 2, throwY = this.y + this.h / 2;
        this.ejectMecha(true);
        bodyEffects.push(new ThrownMecha(this, throwX, throwY, 5.0, 150));
        addFloatingText(throwX, this.y - 16, 'NÉM ROBOT! 🤖💨', '#ff9800', 14);
        // Genius lùi sang bên an toàn
        this.x = Math.max(10, Math.min(canvas.width - this.w - 10, this.x + (Math.random() > 0.5 ? 40 : -40)));
    },

    fireMechaStandardShot() {
        let dirY = (this.id === 1) ? -1 : 1;
        let isPiercing = this.hasUpgrade('evo_gen_2');
        let upg = this.geniusUpgrades || {};
        let bSpeed = C.bulletSpeed * 1.3;
        this.bullets.push({
            x: this.x + this.w / 2 - 4,
            y: (dirY === -1) ? this.y - 10 : this.y + this.h + 2,
            w: 8, h: 12,
            vx: 0, vy: dirY * bSpeed,
            dmg: this.mechaDmg || 1.0,
            owner: this,
            isPiercing: isPiercing,
            tangCuongSlow: (upg['gen_slow'] || 0) > 0,
            tangCuongBurn: (upg['gen_fire'] || 0) > 0,
            color: "#ff9800",
            hitIds: []
        });
        if (soundSystem && !soundSystem.muted) soundSystem.playShoot();
    },

    fireMechaCannonShot() {
        let dirY = (this.id === 1) ? -1 : 1;
        let upg = this.geniusUpgrades || {};
        let blastMult = (upg['gen_explosive'] || 0) > 0 ? 1.5 : 1.0;
        this.bullets.push({
            x: this.x + this.w / 2 - 7,
            y: (dirY === -1) ? this.y - 14 : this.y + this.h + 2,
            w: 14, h: 16,
            vx: 0, vy: dirY * 5.5,
            dmg: (this.mechaDmg || 1.0) * 2.2,
            owner: this,
            isRocket: true,
            isExplosive: true,
            rocketRadiusMult: blastMult,
            tangCuongSlow: (upg['gen_slow'] || 0) > 0,
            tangCuongBurn: (upg['gen_fire'] || 0) > 0,
            color: "#ff5722",
            hitIds: []
        });
        if (soundSystem && !soundSystem.muted) soundSystem.playShoot('cannon');
    },

    fireMechaSmgShot() {
        let dirY = (this.id === 1) ? -1 : 1;
        let upg = this.geniusUpgrades || {};
        let spreadVx = (Math.random() - 0.5) * 3.5;
        this.bullets.push({
            x: this.x + this.w / 2 - 3,
            y: (dirY === -1) ? this.y - 8 : this.y + this.h + 2,
            w: 5, h: 7,
            vx: spreadVx, vy: dirY * 10,
            dmg: (this.mechaDmg || 1.0) * 0.45,
            owner: this,
            tangCuongSlow: (upg['gen_slow'] || 0) > 0,
            tangCuongBurn: (upg['gen_fire'] || 0) > 0,
            color: "#ffb74d",
            hitIds: []
        });
        if (soundSystem && !soundSystem.muted) soundSystem.playShoot();
    },

    startMechaDash() {
        let dirY = (this.id === 1) ? -1 : 1;
        let fistX = this.x + this.w / 2 - 15;
        let fistY = (dirY === -1) ? this.y - 20 : this.y + this.h + 10;
        this.bullets.push({
            x: fistX, y: fistY,
            w: 30, h: 30,
            vx: 0, vy: dirY * 12,
            dmg: 2.0,
            owner: this,
            isMechaPunch: true,
            color: "#ff3d00",
            hitIds: []
        });
        triggerScreenShake(4, 6);
        if (soundSystem && !soundSystem.muted) soundSystem.playDash();
        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "CÚ ĐẤM THÉP! 🥊💨", "#ff5722", 14);
    },

    cycleMechaMode(targetMode = null) {
        if (!this.isPilotingMecha) return;
        if (targetMode !== null) {
            this.mechaMode = targetMode;
        } else {
            this.mechaMode = (this.mechaMode % 5) + 1;
        }
        let modeNames = ["", "1: BẮN CƠ BẢN", "2: PHÁO BỘC PHÁ", "3: SẤY TIỂU LIÊN", "4: CÚ ĐẤM THÉP", "5: KHIÊN TỪ TRƯỜNG"];
        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, modeNames[this.mechaMode], "#ff9800", 13);
    },

    // [setupForNewRound] genius
    setupGenius() {
        if (this.weapon === 'genius') {
            this.w = 24; this.h = 24;
            this.gears = this.gears || 0;
            this.components = this.components || 0;
            this.isPilotingMecha = false;
            this.mechaSummonMultiplier = this.mechaSummonMultiplier || 1;
            this.mechaSummonHold = 0;
            this.mechaMode = 1;
            this.gearPassiveTimer = 0;
            this.mechaIdleFrames = 0;
            this.mechaAutoShotTimer = 0;
            this.mechaAutoAaaTimer = 0;
            this.mechaAutoShockwaveTimer = 0;
            this.mechaEscortDroneTimer = 0;
        }
    },

    // [update] genius — trả về true nếu cần dừng update()
    updateGenius(now, effectiveInp) {
        if (this.weapon === 'genius') {
            const enemy = (this.id === 1) ? p2 : p1;
            let hasEvo1 = this.hasUpgrade('evo_gen_1');
            let hasEvo2 = this.hasUpgrade('evo_gen_2');
            let isFullEvo = hasEvo1 && hasEvo2;

            if (!this.isPilotingMecha) {
                // 1. Tự động nhận 1 Bánh Răng mỗi 10s (600 ticks) khi không lái Mecha
                this.gearPassiveTimer = (this.gearPassiveTimer || 0) + 1;
                if (this.gearPassiveTimer >= 600) {
                    this.gearPassiveTimer = 0;
                    this.gears = (this.gears || 0) + 1;
                    if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "+1 BÁNH RĂNG ⚙️", "#ffb74d", 12);
                }

                // Chi phí Bánh Răng để vào Mecha
                let baseCost = isFullEvo ? 4 : (hasEvo1 ? 6 : 8);
                let summonCost = baseCost * (this.mechaSummonMultiplier || 1);

                // 2. Nhấn giữ phím Bắn để Triệu Hồi & Lái Mecha
                if (effectiveInp.s) {
                    this.mechaSummonHold = (this.mechaSummonHold || 0) + 1;
                    if (this.mechaSummonHold >= 40) {
                        if ((this.gears || 0) >= summonCost) {
                            this.enterMecha(summonCost);
                            this.mechaSummonHold = 0;
                        } else {
                            if (this.mechaSummonHold % 40 === 0 && typeof addFloatingText === 'function') {
                                addFloatingText(this.x + this.w / 2, this.y - 15, `CẦN ${summonCost} BÁNH RĂNG! ⚙️`, "#ff9800", 12);
                            }
                        }
                    }
                } else {
                    if ((this.mechaSummonHold || 0) > 0) {
                        if (this.mechaSummonHold < 40 && this.ammo > 0 && now - this.lastShot > 350) {
                            this.fireBullet(1);
                            this.ammo--;
                            this.lastShot = now;
                        }
                        this.mechaSummonHold = 0;
                    }
                }
            } else {
                // ĐANG LÁI MECHA (MECHA PILOTING MODE)
                this.mechaIdleFrames = (this.mechaIdleFrames || 0) + 1;

                // A. Hồi phục Năng Lượng
                let baseRegen = 1 / 60 + ((this.geniusUpgrades && this.geniusUpgrades['gen_regen']) || 0) / 60;
                if (isFullEvo && this.mechaIdleFrames >= 60) baseRegen = 3 / 60;
                else if (hasEvo1 && this.mechaIdleFrames >= 120) baseRegen = 2 / 60;
                this.mechaEnergy = Math.min(this.mechaMaxEnergy, (this.mechaEnergy || 0) + baseRegen);

                // B. Kỹ Năng / Vũ Khí theo Mode
                let nlDiscount = hasEvo1 ? 1 : 0;
                if (effectiveInp.s) {
                    this.mechaIdleFrames = 0;

                    // Full Evo: Giữ 3s (180 frames) để Tự Hủy Mecha
                    if (isFullEvo) {
                        this.mechaSelfDestructHold = (this.mechaSelfDestructHold || 0) + 1;
                        if (this.mechaSelfDestructHold >= 180) {
                            this.mechaSelfDestructHold = 0;
                            this.selfDestructMecha();
                            return true;
                        }
                    }

                    if (this.mechaMode === 1) {
                        // Mode 1: Bắn cơ bản (2 NL, -1 Evo 1)
                        let cost = Math.max(1, 2 - nlDiscount);
                        if (this.mechaEnergy >= cost && now - this.lastShot > 300) {
                            this.mechaEnergy -= cost;
                            this.fireMechaStandardShot();
                            this.lastShot = now;
                        }
                    } else if (this.mechaMode === 2) {
                        // Mode 2: Pháo Bộc Phá (5 NL, -1 Evo 1)
                        let cost = Math.max(1, 5 - nlDiscount);
                        if (this.mechaEnergy >= cost && now - this.lastShot > 600) {
                            this.mechaEnergy -= cost;
                            this.fireMechaCannonShot();
                            this.lastShot = now;
                        }
                    } else if (this.mechaMode === 3) {
                        // Mode 3: Sấy Tiểu Liên (3 NL/s, -1 Evo 1)
                        let cost = Math.max(0.2, (3 - nlDiscount) / 6);
                        if (this.mechaEnergy >= cost && now - this.lastShot > 90) {
                            this.mechaEnergy -= cost;
                            this.fireMechaSmgShot();
                            this.lastShot = now;
                        }
                    } else if (this.mechaMode === 4) {
                        // Mode 4: Cú Đấm Thép Tank Dash (5 NL, -1 Evo 1)
                        let cost = Math.max(1, 5 - nlDiscount);
                        if (this.mechaEnergy >= cost && now - this.lastShot > 700) {
                            this.mechaEnergy -= cost;
                            this.startMechaDash();
                            this.lastShot = now;
                        }
                    }
                    // Mode 5 (Barrier Shield) là bị động đỡ đòn trong takeDamage!
                } else {
                    this.mechaSelfDestructHold = 0;
                }

                // C. Module tự động của Evo 2 (Vũ Trang Hóa)
                if (hasEvo2 && enemy && enemy.hp > 0) {
                    // Module 1: Súng phụ tự ngắm mỗi 3s (180 ticks)
                    this.mechaAutoShotTimer = (this.mechaAutoShotTimer || 0) + 1;
                    if (this.mechaAutoShotTimer >= 180) {
                        this.mechaAutoShotTimer = 0;
                        this.fireMechaStandardShot();
                    }

                    // Module 2: Radar Cao Xạ (AAA) dội pháo kích mỗi 8s (480 ticks)
                    this.mechaAutoAaaTimer = (this.mechaAutoAaaTimer || 0) + 1;
                    if (this.mechaAutoAaaTimer >= 480) {
                        this.mechaAutoAaaTimer = 0;
                        let hitX = enemy.x + enemy.w / 2;
                        let hitY = enemy.y + enemy.h / 2;
                        explosions.push(new Explosion(hitX, hitY, 65, '#ff1744', 1.5, this));
                        if (enemy.hp > 0) enemy.takeDamage(1.5, this);
                        triggerScreenShake(4, 6);
                        if (typeof addFloatingText === 'function') addFloatingText(hitX, hitY - 18, "RADAR PHÁO KÍCH! 🎯", "#ff1744", 14);
                    }

                    // Module 3: Sóng Chấn Động đẩy lùi và làm chậm xung quanh mỗi 10s (600 ticks)
                    this.mechaAutoShockwaveTimer = (this.mechaAutoShockwaveTimer || 0) + 1;
                    if (this.mechaAutoShockwaveTimer >= 600) {
                        this.mechaAutoShockwaveTimer = 0;
                        let sDist = Math.hypot((enemy.x + enemy.w / 2) - (this.x + this.w / 2), (enemy.y + enemy.h / 2) - (this.y + this.h / 2));
                        if (sDist <= 130) {
                            enemy.kbX = Math.sign(enemy.x - this.x || 1) * 35;
                            enemy.slowTimer = 90;
                            enemy.takeDamage(1.0, this);
                        }
                        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 130, 'rgba(0, 229, 255, 0.4)', 0, this));
                        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "SÓNG CHẤN ĐỘNG! 🌊⚡", "#00e5ff", 14);
                    }
                }

                // D. Full Evo: 2 Combat Drone hộ tống bắn hỗ trợ
                if (isFullEvo) {
                    this.mechaEscortDroneTimer = (this.mechaEscortDroneTimer || 0) + 1;
                    if (this.mechaEscortDroneTimer >= 120 && enemy && enemy.hp > 0) {
                        this.mechaEscortDroneTimer = 0;
                        let dirY = (this.id === 1) ? -1 : 1;
                        [-30, 30].forEach(offset => {
                            this.bullets.push({
                                x: this.x + this.w / 2 + offset,
                                y: (dirY === -1) ? this.y - 8 : this.y + this.h + 4,
                                w: 5, h: 7,
                                vx: 0, vy: dirY * 9,
                                dmg: 0.35,
                                owner: this,
                                color: "#00e5ff",
                                hitIds: []
                            });
                        });
                    }
                }
            }
        }
    },

    // [update] genius — trả về currentSpeed mới
    updateGenius2(currentSpeed) {
        if (this.weapon === 'genius' && this.isPilotingMecha) {
            let spdBonus = ((this.geniusUpgrades && this.geniusUpgrades['gen_speed']) || 0) * 0.15;
            currentSpeed *= 0.65 * (1 + spdBonus);
        }
        return currentSpeed;
    }
});
