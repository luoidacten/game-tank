// ==========================================
// inventor (inventor) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    fireOwnerSubAoE(type, upg) {
        let enemy = (this.id === 1) ? p2 : p1;
        let baseDirY = (this.id === 1) ? -1 : 1;
        let vy = baseDirY * 4.5;
        let vx = 0;
        if (upg['inv_ngam'] && enemy) {
            let dx = (enemy.x + enemy.w / 2) - (this.x + this.w / 2);
            vx = Math.max(-1.5, Math.min(1.5, dx * 0.012));
        }
        this.bullets.push({
            x: this.x + this.w / 2 - 5,
            y: this.y + (baseDirY > 0 ? this.h : -5),
            w: 10, h: 10,
            vx: vx, vy: vy,
            dmg: 1.5,
            owner: this,
            specialType: type,
            isInventorBullet: true,
            hitIds: [],
            bounceCount: 0,
            active: true
        });
        soundSystem.playShoot('cannon');
    },

    fireOwnerSubSMG() {
        let baseVy = (this.id === 1) ? -6 : 6;
        for (let i = 0; i < 12; i++) {
            let spreadVx = (i - 5.5) * 0.6;
            this.bullets.push({
                x: this.x + this.w / 2 - 2,
                y: this.y + (baseVy > 0 ? this.h : -2),
                w: 4, h: 4,
                vx: spreadVx, vy: baseVy,
                dmg: 0.4,
                owner: this,
                isInventorBullet: true,
                hitIds: [],
                bounceCount: 0,
                active: true
            });
        }
        soundSystem.playShoot('normal');
    },

    clearEnemyBulletsInRadiusOwner(radius) {
        let enemy = (this.id === 1) ? p2 : p1;
        if (!enemy || !enemy.bullets) return;
        let cleared = false;
        enemy.bullets.forEach(b => {
            if (b.active && Math.hypot(b.x - (this.x + this.w / 2), b.y - (this.y + this.h / 2)) < radius) {
                b.active = false;
                cleared = true;
                explosions.push(new Explosion(b.x, b.y, 14, 'white', 0, this));
            }
        });
        if (cleared) soundSystem.playShieldBreak();
    },

    // [setupForNewRound] inventor
    setupInventor() {
        if (this.weapon === 'inventor') {
            this.speed *= 0.8;
            this.components = this.components || 0;
            this.invUpgrades = this.invUpgrades || {};

            // Áp dụng các nâng cấp shop đã mua
            if (this.invUpgrades['inv_giap']) { this.maxHp += 1; this.hp += 1; }
            if (this.invUpgrades['inv_tangcuong']) { this.maxAmmo += 2; this.ammo = this.maxAmmo; }
            if (this.invUpgrades['inv_bodam']) { this.speed *= (1 + 0.1 * (this.invUpgrades['inv_bodam'] || 0)); }

            let isFullEvo = this.isFullEvoInventor || (hasFullEvo(this, 'inventor') && this.invUpgrades['inv_full_evo']);

            this.drones = [];
            if (isFullEvo) {
                // 4 Drones cùng lúc trên sân
                this.drones.push(new InventorDrone(this, -75, 0));
                this.drones.push(new InventorDrone(this, -25, 1));
                this.drones.push(new InventorDrone(this, 25, 2));
                this.drones.push(new InventorDrone(this, 75, 3));
            } else if (this.hasUpgrade('evo_inv_2')) {
                // 2 Drones
                this.drones.push(new InventorDrone(this, -35, 0));
                this.drones.push(new InventorDrone(this, 35, 1));
            } else {
                // 1 Drone mặc định
                this.drones.push(new InventorDrone(this, 0));
            }

            this.isOverclocking = false;
            this.overclockTimer = 0;
            this.overclockDurationTimer = 0;
            this.stillTimer = null;
            this.luoiDienSanSang = false;
            this.lastLuoiDienTrigger = 0;
            this.crateShieldActive = false;
            this.crateShieldExpireTimer = 0;
            this.lastOwnerPhao = 0;
            this.lastOwnerSmg = 0;
            this.lastOwnerBang = 0;
            this.lastOwnerLua = 0;
            this.lastOwnerTuGio = 0;
            this.lastOwnerAutoShot = 0;
        }
    },

    // [update] inventor
    updateInventor(inp, now, effectiveInp) {
        if (this.weapon === 'inventor') {
            if (!this.invUpgrades) this.invUpgrades = {};
            let upg = this.invUpgrades;

            // 1. Ép Xung (Giữ S) - Hồi chiêu 15s, hiệu lực 4s
            if (inp.s && upg['inv_epxung']) {
                if (now - (this.overclockTimer || 0) >= 15000) {
                    this.isOverclocking = true;
                    this.overclockTimer = now;
                    this.overclockDurationTimer = now + 4000;
                    soundSystem.playPowerup();
                    addFloatingText(this.x + this.w / 2, this.y - 15, "OVERCLOCK ⚡ (4s)", "#00ffcc", 14);
                }
            }
            if (this.isOverclocking) {
                if (now > (this.overclockDurationTimer || 0)) {
                    this.isOverclocking = false;
                } else {
                    effectiveInp.s = false; // Câm lặng bản thân khi ép xung
                }
            }

            // 2. Lưới Điện Phản Pháo (Đứng yên 2s, Hồi chiêu 12s)
            if (!inp.l && !inp.r) {
                if (!this.stillTimer) this.stillTimer = now;
                if (now - this.stillTimer >= 2000 && upg['inv_luoidien'] && now - (this.lastLuoiDienTrigger || 0) >= 12000) {
                    this.luoiDienSanSang = true;
                }
            } else {
                this.stillTimer = null;
                this.luoiDienSanSang = false;
            }

            // Chặn đạn bằng lưới điện (Triệt tiêu đạn -> +1 LK)
            if (this.luoiDienSanSang) {
                let enemy = (this.id === 1) ? p2 : p1;
                if (enemy && enemy.bullets && now - (this.lastLuoiDienTrigger || 0) >= 12000) {
                    for (let eb of enemy.bullets) {
                        if (eb.active && Math.hypot(eb.x - (this.x + this.w / 2), eb.y - (this.y + this.h / 2)) < 38) {
                            eb.active = false;
                            this.components = (this.components || 0) + 1;
                            this.lastLuoiDienTrigger = now;
                            this.luoiDienSanSang = false;
                            this.stillTimer = null;
                            explosions.push(new Explosion(eb.x, eb.y, 25, '#00ffcc', 0, this));
                            soundSystem.playShieldBreak();
                            addFloatingText(this.x + this.w / 2, this.y - 15, "+1 LK (LƯỚI ĐIỆN)", "#00ffcc", 12);
                            break;
                        }
                    }
                }
            }

            // 3. Giáp Ảo từ Hộp Tiếp Tế (inv_giap) hết hạn sau 5s
            if (this.crateShieldActive && now > (this.crateShieldExpireTimer || 0)) {
                this.crateShieldActive = false;
                if (this.shield > 0) {
                    this.shield = Math.max(0, this.shield - 1);
                    addFloatingText(this.x + this.w / 2, this.y - 15, "HẾT GIÁP ẢO (5s)", "#aaa", 11);
                }
            }

            // 4. Bộ Hồi Phục (inv_hoiphuc) - Hồi 1 HP mỗi 5s
            if (upg['inv_hoiphuc']) {
                if (!this.lastHoiPhucTime) this.lastHoiPhucTime = now;
                if (now - this.lastHoiPhucTime >= 5000) {
                    if (this.hp < this.maxHp) {
                        this.hp = Math.min(this.maxHp, this.hp + 1);
                        addFloatingText(this.x + this.w / 2, this.y - 15, "+1 HP", "#2ecc71", 12);
                    }
                    this.lastHoiPhucTime = now;
                }
            }

            // 5. Nhà Phát Minh Tối Hậu (Full Evo: Tích hợp hệ thống vũ khí Drone lên xe chủ)
            let isFullEvo = this.isFullEvoInventor || (hasFullEvo(this, 'inventor') && upg['inv_full_evo']);
            if (isFullEvo) {
                let cdMod = 0.4;
                if (this.isOverclocking) cdMod *= 0.5;

                // Tự động xả đạn nòng chính từ xe chủ
                if (now - (this.lastOwnerAutoShot || 0) > 1000 * cdMod) {
                    let enemy = (this.id === 1) ? p2 : p1;
                    let baseDirY = (this.id === 1) ? -1 : 1;
                    let bulletSpd = 5.5;
                    let vx = 0;
                    if (upg['inv_ngam'] && enemy) {
                        let dx = (enemy.x + enemy.w / 2) - (this.x + this.w / 2);
                        vx = Math.max(-1.8, Math.min(1.8, dx * 0.015 * bulletSpd));
                    }
                    this.bullets.push({
                        x: this.x + this.w / 2 - 3,
                        y: this.y + (baseDirY > 0 ? this.h : -4),
                        w: upg['inv_lazer'] ? 4 : 6,
                        h: upg['inv_lazer'] ? 14 : 6,
                        vx: vx,
                        vy: baseDirY * bulletSpd,
                        dmg: Math.max(0.5, this.damage * 2.0),
                        owner: this,
                        isPiercing: !!upg['inv_lazer'],
                        isInventorBullet: true,
                        hitIds: [],
                        bounceCount: 0,
                        active: true
                    });
                    this.lastOwnerAutoShot = now;
                }

                // Tự động xả các nòng phụ từ xe chủ
                if (upg['inv_phao'] && now - (this.lastOwnerPhao || 0) > 3000 * cdMod) {
                    this.fireOwnerSubAoE('mortar', upg); this.lastOwnerPhao = now;
                }
                if (upg['inv_smg'] && now - (this.lastOwnerSmg || 0) > 5000 * cdMod) {
                    this.fireOwnerSubSMG(); this.lastOwnerSmg = now;
                }
                if (upg['inv_bang'] && now - (this.lastOwnerBang || 0) > 4000 * cdMod) {
                    this.fireOwnerSubAoE('ice', upg); this.lastOwnerBang = now;
                }
                if (upg['inv_lua'] && now - (this.lastOwnerLua || 0) > 4000 * cdMod) {
                    this.fireOwnerSubAoE('fire', upg); this.lastOwnerLua = now;
                }
                if (upg['inv_tugio'] && now - (this.lastOwnerTuGio || 0) > 2000 * cdMod) {
                    this.clearEnemyBulletsInRadiusOwner(100); this.lastOwnerTuGio = now;
                }
            }

            // Update các Drones
            if (this.drones) {
                this.drones.forEach(d => d.update());
            }
        }
    }
});
