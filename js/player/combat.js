// ==========================================
// Player — Nhận sát thương, bắn đạn, nhặt hòm
// ==========================================

Object.assign(Player.prototype, {
    onCollectAmmoCrate(crate = null) {
        if (this.weapon === 'six_barrel') {
            this.heat = Math.max(0, (this.heat || 0) - 50);
            if (this.heat <= 50) this.isOverheated = false;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "HẠ NHIỆT -50% ❄", "#00ffff", 12);
        } else if (this.weapon === 'lazer_auto') {
            this.laHeat = 0; this.laOver = 0;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "HẠ NHIỆT ❄", "#00e5ff", 12);
        } else if (this.weapon === 'water_gun') {
            this.energy = Math.min(this.maxEnergy || 100, (this.energy || 0) + 50);
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "+50 NƯỚC 💧", "#00bfff", 12);
        } else if (this.weapon === 'furnace') {
            this.energy = Math.min(this.maxEnergy || 100, (this.energy || 0) + 50);
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "+50 NHIỆT LƯỢNG 🔥", "#ff6600", 12);
        } else if (this.weapon === 'the_strongest') {
            this.chuLuc = Math.min(this.maxChuLuc || 100, (this.chuLuc || 0) + 50);
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "+50 CHÚ LỰC ✨", "#00ffff", 12);
        } else if (this.weapon === 'sukuna') {
            this.cursedEnergy = Math.min(100, (this.cursedEnergy || 0) + 50);
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "+50 CHÚ LỰC 🩸", "#e74c3c", 12);
        } else if (this.weapon === 'storm') {
            this.stormChargeTimer = Math.min(480, (this.stormChargeTimer || 0) + 240);
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "+50% TỤ PHONG 🌀", "#2ecc71", 12);
        } else if (this.weapon === 'tank') {
            this.shield = (this.shield || 0) + 1;
            this.tankDashCooldown = 0;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "+1 KHIÊN TÔNG XE 🛡", "#e67e22", 12);
        } else if (this.weapon === 'van_kiem') {
            this.stanceSwordsAccumulated = Math.min(8, (this.stanceSwordsAccumulated || 0) + 4);
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "+4 KIẾM KHÍ ⚔", "#9b59b6", 12);
        } else if (this.weapon === 'wind_slash') {
            this.chargeLevel = 7;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "ĐẦY KIẾM KHÍ 🗡", "#f1c40f", 12);
        } else if (this.weapon === 'thunder') {
            this.thunderSpears = thunderSpearCap(this); this.thunderRegenTimer = 0;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, `+${this.thunderSpears} LÔI PHONG THƯƠNG ⚡`, "#ffff00", 12);
        } else if (this.weapon === 'aaa') {
            this.ammo = Math.min(5, (this.ammo || 0) + 2);
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "+2 PHÁO CỐI 💣", "#e67e22", 12);
        } else {
            this.ammo = this.maxAmmo;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, "NẠP ĐẦY ĐẠN 🎯", "#e67e22", 12);
        }

        if (this.weapon === 'evolution') {
            this.onEvolutionCrateEat('ammo');
        }
    },

    takeDamage(amount, attacker = null, options = {}) {
        if (this.hp <= 0 || gameState.phase !== 'playing') return 0;

        // Practice Bot God Mode (Bất tử cho Bot trong phòng luyện tập)
        if (this.id === 2 && typeof botAI !== 'undefined' && botAI.enabled && botAI.isGodMode) {
            this.hp = this.maxHp;
            addFloatingText(this.x + this.w / 2, this.y - 10, "GODMODE 🛡️", "#ffd700", 14);
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, "#ffd700", 8);
            if (soundSystem && !soundSystem.muted) soundSystem.playHit();
            return 0;
        }

        // 1. Invincibility
        // options.unavoidable: đòn không thể né (bỏ qua bất tử / né / lướt), nhưng các loại khiên vẫn chặn
        const canDodge = !options.unavoidable;
        if (this.invincibleTimer > 0 && !options.ignoreInvincible && canDodge) {
            addFloatingText(this.x + this.w / 2, this.y - 10, "IMMUNE", "#3498db", 13);
            return 0;
        }
        if (canDodge && CharHooks.call(this, 'beforeDamage', amount, attacker, options) === true) return 0;

        // 2. Ghost Phasing
        if (canDodge && this.weapon === 'ghost' && this.isGhostActive && !options.isEnvironmental) {
            addFloatingText(this.x + this.w / 2, this.y - 10, "PHASED", "#bdc3c7", 13);
            return 0;
        }

        // Thunder Invulnerability & Shield
        if (canDodge && this.weapon === 'thunder' && this.thunderIsSlashing) {
            return 0; // i-frame during Trảm Lôi Liên Hoàn
        }
        if (this.weapon === 'thunder' && (this.thunderShieldHits || 0) > 0) {
            this.thunderShieldHits--;
            addFloatingText(this.x + this.w / 2, this.y - 10, `LÔI THẦN KHIÊN (${this.thunderShieldHits})! ⚡`, "#ffff00", 14);
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, "#ffff00", 12);
            if (soundSystem && !soundSystem.muted) soundSystem.playHit();
            return 0;
        }

        // Magnet Polar Dash Invulnerability
        if (canDodge && this.weapon === 'magnet' && this.isPolarDashing && this.polarDashPhase === 1) {
            return 0; // i-frame khi đang lao (pha bật về thì không)
        }

        // Bow (Cung) - Nội tại Nhạy Bén: Tự động né 1 đòn đánh mỗi 8s (5s Full Evo)
        if (canDodge && this.weapon === 'cung' && this.bowDodgeReady && !options.isEnvironmental) {
            this.bowDodgeReady = false;
            let cd = (this.hasUpgrade('evo_cung_1') && this.hasUpgrade('evo_cung_2')) ? 300 : 480;
            this.bowDodgeCooldown = cd;
            addFloatingText(this.x + this.w / 2, this.y - 10, "NÉ ĐÒN! 💨", "#00ffcc", 14);
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, "#00ffcc", 10);
            if (soundSystem && !soundSystem.muted) soundSystem.playHit();
            return 0;
        }

        // Gojo: Đang gồng niệm Chú Lực / Lãnh Địa mà ăn sát thương -> Bị ngắt niệm!
        if (this.weapon === 'the_strongest' && (this.gojoChargeTimer || 0) > 0) {
            this.gojoChargeTimer = 0;
            addFloatingText(this.x + this.w / 2, this.y - 15, "NIỆM CHÚ BỊ NGẮT! 💥", "#00ffff", 14);
        }

        // Sukuna: Đang gồng Lãnh Địa / Phản Chuyển mà ăn sát thương -> Bị phá niệm!
        if (this.weapon === 'sukuna' && (this.sukunaChargeTimer || 0) > 0) {
            this.sukunaChargeTimer = 0;
            this.domainActive = false;
            addFloatingText(this.x + this.w / 2, this.y - 15, "LÃNH ĐỊA BỊ PHÁ! 💥", "#e74c3c", 14);
        }

        // 3. Sword Shield (Blade God / Van Kiem)
        if (this.swordShieldActive && !options.isPiercing) {
            this.swordShieldHits--;
            if (this.swordShieldHits <= 0) {
                this.swordShieldActive = false;
            }
            addFloatingText(this.x + this.w / 2, this.y - 10, "PARRIED", "#f1c40f", 14);
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, "#f1c40f", 10);
            soundSystem.playHit();
            return 0;
        }

        // 4. Steel Shield
        if (this.shield > 0 && !options.bypassShield) {
            this.shield--;
            CharHooks.call(this, 'shieldBreak', attacker, options);
            addFloatingText(this.x + this.w / 2, this.y - 10, "BLOCKED", "#00f0ff", 14);
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, "#00f0ff", 12);
            triggerScreenShake(5, 8);
            soundSystem.playShieldBreak();
            return 0;
        }

        // 5. Gojo Cursed Energy Absorption (Infinity Barrier - Blocks ALL damage while Chu Luc > 0)
        if (this.weapon === 'the_strongest') {
            this.chuLucRegenCooldown = 150; // Khóa hồi phục Chú Lực 2.5s khi nhận hit
            if (this.chuLuc > 0) {
                let chuLucCost = amount * 25; // 25 Chu Luc per 1 damage
                this.chuLuc = Math.max(0, this.chuLuc - chuLucCost);
                addFloatingText(this.x + this.w / 2, this.y - 10, "INFINITY", "#00f0ff", 14);
                spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, "#00f0ff", 10);
                soundSystem.playShieldBreak();
                triggerScreenShake(3, 6);
                explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 35, 'rgba(0, 240, 255, 0.35)', 0, this));
                return 0; // Completely absorbed!
            }
        }

        // Sukuna CE Lock (Nhận sát thương -> 1s sau mới hồi phục Chú Lực)
        if (this.weapon === 'sukuna') {
            this.sukunaCeLockTimer = 60;
        }

        // Shadow Hunter: Giảm 50% sát thương nhận vào ở Local play khi đang tàng hình
        if (this.weapon === 'shadow_hunter' && this.stealthActive && !options.isEnvironmental) {
            const isOnline = (typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline);
            if (!isOnline) {
                amount *= 0.5;
            }
        }

        // Xe TANK: đang lao húc -> giảm mạnh sát thương nhận (65%, Evo 1: 80%)
        if (this.weapon === 'tank' && this.dashState > 0) {
            amount *= this.hasUpgrade('evo_tank_1') ? 0.2 : 0.35;
        }

        if (this.permanentVulnerability) {
            amount *= (1 + this.permanentVulnerability);
        }
        if (this.statusVuln) amount *= (1 + this.statusVuln); // Suy Yếu từ vùng / lớp phủ axit

        let actualDmg = Math.max(0.05, amount);

        // (Basic Evo 2 "Hồi Ức" -> CharHooks beforeLethal: js/characters/basic/logic.js)

        // 5.1. GENIUS MECHA DAMAGE ABSORPTION
        if (this.weapon === 'genius' && this.isPilotingMecha) {
            // Barrier Shield (Mode 5): 2 NL per 1 damage
            if (this.mechaMode === 5 && (this.mechaEnergy || 0) > 0) {
                let energyNeeded = actualDmg * 2;
                if (this.mechaEnergy >= energyNeeded) {
                    this.mechaEnergy -= energyNeeded;
                    addFloatingText(this.x + this.w / 2, this.y - 12, "LÁ CHẮN TỪ TRƯỜNG ⚡", "#00e5ff", 13);
                    spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, "#00e5ff", 8);
                    return 0;
                } else {
                    let absorbed = this.mechaEnergy / 2;
                    actualDmg -= absorbed;
                    this.mechaEnergy = 0;
                }
            }

            // Virtual Armor absorption
            if ((this.mechaVirtualArmor || 0) > 0) {
                if (this.mechaVirtualArmor >= actualDmg) {
                    this.mechaVirtualArmor -= actualDmg;
                    addFloatingText(this.x + this.w / 2, this.y - 12, `-${actualDmg.toFixed(1)} GIÁP ẢO 🛡️`, "#ffd700", 13);
                    return 0;
                } else {
                    actualDmg -= this.mechaVirtualArmor;
                    this.mechaVirtualArmor = 0;
                }
            }

            // Mecha HP absorption
            this.mechaHp = (this.mechaHp || 0) - actualDmg;
            let displayVal = actualDmg >= 1 ? (Math.round(actualDmg * 10) / 10).toString() : actualDmg.toFixed(1);
            addFloatingText(this.x + this.w / 2, this.y - 12, `-${displayVal} ROBOT HP 🤖`, "#ff9800", 14);
            soundSystem.playHit();
            triggerScreenShake(Math.min(10, 2 + actualDmg * 2), 10);

            if (this.mechaHp <= 0) {
                this.ejectMecha();
            }
            return actualDmg;
        }

        // 5.2. NECROMANCER SOUL SHIELD (LINH GIÁP)
        if (this.weapon === 'necromancer') {
            this.necroRegenCooldown = 180; // Khóa hồi Linh Hồn trong 3s (180 ticks) khi nhận sát thương
            if ((this.currentSouls || 0) > 0) {
                let soulAbsorb = Math.min(this.currentSouls, actualDmg);
                this.currentSouls -= soulAbsorb;
                actualDmg -= soulAbsorb;
                let sDisplay = soulAbsorb >= 1 ? (Math.round(soulAbsorb * 10) / 10).toString() : soulAbsorb.toFixed(1);
                addFloatingText(this.x + this.w / 2, this.y - 14, `-${sDisplay} LINH GIÁP 👻`, "#00e676", 13);
                spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, "#00e676", 8);
                if (actualDmg <= 0) {
                    soundSystem.playHit();
                    return soulAbsorb;
                }
            }
        }

        if (this.hp - actualDmg <= 0 && CharHooks.call(this, 'beforeLethal', actualDmg, attacker) === true) return actualDmg;
        this.hp -= actualDmg;
        CharHooks.call(this, 'damaged', actualDmg, attacker);

        // Visual floating text & screen shake
        let displayVal = actualDmg >= 1 ? (Math.round(actualDmg * 10) / 10).toString() : actualDmg.toFixed(1);
        addFloatingText(this.x + this.w / 2, this.y - 10, "-" + displayVal, "#ff0055", 15);
        triggerScreenShake(Math.min(10, 2 + actualDmg * 2), 10);
        soundSystem.playHit();
        spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, "#ff0055", 6);

        if (this.hp <= 0) {
            this.hp = 0;
            this.ghostHp = 0;
            let winId = attacker ? attacker.id : (this.id === 1 ? 2 : 1);
            if (gameState.phase === 'playing') {
                triggerFatalCinematic(winId, this);
            }
        }
        return actualDmg;
    },

    fireAnhMinhHitscan(dmg, isPiercing, color, originX, originY) {
        let startX = originX || (this.x + this.w / 2);
        let startY = originY || ((this.id === 1) ? this.y : this.y + this.h);
        let endY = (this.id === 1) ? 0 : canvas.height;
        let dirY = (this.id === 1) ? -1 : 1;
        const swW = sniperWallBlockY(this, startX, startY, dirY, 4, dmg); // Tường Sniper chặn tia
        if (swW) endY = sniperWallStopY(swW, dirY);

        // 1. Tạo hiệu ứng hình ảnh tia kiếm (tồn tại trong 10 frame)
        explosions.push({
            active: true, life: 10,
            update: function () { this.life--; if (this.life <= 0) this.active = false; },
            draw: function () {
                if (!this.active) return;
                ctx.save();
                ctx.strokeStyle = color; ctx.lineWidth = 6;
                ctx.shadowBlur = 15; ctx.shadowColor = color;
                ctx.globalCompositeOperation = "lighter";
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(startX, endY);
                ctx.stroke();
                ctx.restore();
            }
        });

        // 2. Logic sát thương Hitscan (Kiểm tra theo đường thẳng đứng)
        const checkLineHit = (target) => {
            // Kiểm tra xem trục X của mục tiêu có cắt ngang tia kiếm không
            if (target.x < startX + 15 && target.x + target.w > startX - 15) {
                // Kiểm tra xem mục tiêu có nằm phía trước mũi kiếm không
                let isBetween = (this.id === 1) ? (target.y < startY) : (target.y > startY);
                if (isBetween && target.active !== false) {
                    return true;
                }
            }
            return false;
        };

        // Gây sát thương lên Địch
        const enemy = (this.id === 1) ? p2 : p1;
        if (!swW && checkLineHit(enemy)) { enemy.takeDamage(dmg, this);

            // Hiệu ứng chém trúng
            explosions.push(new Explosion(startX, enemy.y + enemy.h / 2, 30, color, 0, this));

            // Nếu không xuyên thấu, tia kiếm dừng lại tại mục tiêu
            if (!isPiercing) endY = enemy.y + enemy.h / 2;
        }

        // Gây sát thương lên Xe tiền và Thùng (nếu tia kiếm đi qua)
        moneyTrucks.forEach(t => {
            if (checkLineHit(t)) {
                t.hp -= dmg * 2;
                explosions.push(new Explosion(startX, t.y + t.h / 2, 30, 'gold', 0, this));
                if (t.hp <= 0) {
                    t.active = false;
                    let money = 30; if (this.weapon === 'money_tank') money *= 2;
                    if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                    if (this.weapon === 'evolution') this.onEvolutionCrateEat('truck');
                }
                if (!isPiercing && Math.abs(t.y - startY) < Math.abs(endY - startY)) endY = t.y + t.h / 2;
            }
        });

        crates.forEach(c => {
            if (checkLineHit(c)) {
                c.active = false;
                crateOnBreak(c, this);
                if (c.isMimic) triggerMimicExplosion(c, this);
                if (c.type === 'hp') this.hp = Math.min(this.hp + 1, this.maxHp);
                if (c.type === 'ammo') this.onCollectAmmoCrate(c);
                if (c.type === 'shield') this.shield++;
                if (c.type === 'dmg') this.dmgBuff++;
                if (this.weapon === 'evolution') this.onEvolutionCrateEat(c.type);
                if (c.type === 'boom') explosions.push(new Explosion(c.x, c.y, 60, 'red', 0, this));
                explosions.push(new Explosion(c.x, c.y, 30, 'white', 0, this));
            }
        });
    },

    fireBullet(multiplier, isFullCharge = false, type = 'normal') {
        // ... (Code tính dmg, spd, size cũ giữ nguyên)
        let dmg = (this.damage + this.dmgBuff) * multiplier;
        let spd = C.bulletSpeed;
        if (typeof gameState !== 'undefined' && gameState.currentMap === 'overdrive') spd *= 1.5;

        if (this.weapon === 'money_tank') spd *= 0.6 + 0.12 * (this.upgradeLevel || 0); // Mỗi cấp: đạn bay nhanh hơn
        if (this.weapon === 'basic') spd += 1;
        if (this.weapon === 'shotgun') spd *= 1.4;
        if (this.weapon === 'sniper') spd *= 3; // Đạn Sniper bay nhanh gấp 3
        if (this.weapon === 'overload') spd += (multiplier * 0.8 + 2);
        if (this.weapon === 'lazer_auto') spd += 1;
        if (this.hasUpgrade('evo_lazer_a_1')) spd += 2;
        if (this.weapon === 'rocket') spd = this.hasUpgrade('evo_rocket_1') ? 1.5 : 2;

        let size = 5; let hSize = 5;
        if (this.weapon === 'big_bullet') size = 20;
        if (this.hasUpgrade('evo_big_1')) size = 32;
        // FULL EVO BIG BULLET: Siêu to
        let isFullEvoBig = (this.weapon === 'big_bullet' && this.hasUpgrade('evo_big_1') && this.hasUpgrade('evo_big_2'));
        if (isFullEvoBig) size = 44;
        if (this.weapon === 'big_bullet') hSize = size; // quả cầu tròn: hitbox vuông
        if (this.weapon === 'overload') size += (multiplier * 1.5);
        if (this.weapon === 'rocket') size = this.hasUpgrade('evo_rocket_2') ? 12 : 8;
        if (this.weapon === 'lazer_auto') { size = this.hasUpgrade('evo_lazer_a_2') ? 6 : 3; hSize = 18; }
        if (this.weapon === 'money_tank' && this.upgradeLevel >= 4) size += 4;

        if (this.weapon === 'necromancer' || type === 'necro_soul') {
            size = 8;
            hSize = 10;
            spd += 2;
        }

        // --- LOGIC AXIT ---
        let createAcidZone = false;
        if (this.weapon === 'acid') {
            this.acidShotCount++;
            if (this.acidShotCount % 5 === 0) { // Viên thứ 5
                createAcidZone = true;
                size += 4; // Đạn to hơn
            }
        }
        // FULL EVO OVERLOAD: Tạo vùng lửa/radiation khi nổ
        let createFireZone = false;

        // --- LOGIC KỸ SƯ (Evo 1: Chủ bắn -> Trụ bắn) ---
        if (this.weapon === 'engineer' && this.hasUpgrade('evo_eng_1')) {
            turrets.forEach(t => {
                if (t.owner === this && t.active) t.shoot();
            });
        }

        let dirY = (this.id === 1) ? -1 : 1;
        let startY = (this.id === 1) ? this.y - hSize : this.y + this.h;

        // --- LOGIC ICE NERF ---
        let isIce = (this.weapon === 'ice');
        let createIceZone = false;
        let isBigIceZone = false;

        if (isIce) {
            this.iceShotCount++;
            if (this.iceShotCount % 3 === 0) {
                createIceZone = true;
                spd *= 1.5;

                if (this.hasUpgrade('evo_ice_1')) {
                    this.iceZoneTriggerCount++;
                    // NERF: Chỉ kích hoạt vùng lớn ở lần thứ 3 (3, 6, 9...)
                    if (this.iceZoneTriggerCount % 2 === 0) {
                        isBigIceZone = true;
                        size += 20;
                    } else {
                        // 2 lần đầu bắn ra đạn thường (nhưng vẫn tạo zone nhỏ ở dưới)
                        size += 15;
                        isBigIceZone = false;
                    }
                } else {
                    // Nếu không có Evo thì cứ mỗi 5 viên là to hơn xíu
                    size += 10;
                }
            }
        }
        // ----------------------
        // --- Âm dương sư
        let isAmChuBullet = false;
        let isDuongChuBullet = false;

        if (this.weapon === 'am_duong_su') {
            let isFullEvo = this.hasUpgrade('evo_ads_1') && this.hasUpgrade('evo_ads_2');
            if (this.isAmChu) {
                isAmChuBullet = true;
            } else {
                isDuongChuBullet = true;
                if (isFullEvo) dmg *= 1.5; // Full Evo: Bùa Dương thêm sát thương
            }
            this.isAmChu = !this.isAmChu; // Đổi trạng thái cho phát bắn sau
        }

        // --- THÊM ĐOẠN NÀY ĐỂ CHỈNH SIZE CHO HƯ VÔ KIẾM ---
        if (type === 'hu_vo') {
            size = 12; // Chiều rộng lưỡi kiếm
            hSize = 35; // Chiều dài thanh kiếm
            spd += 2; // Buff tốc độ bay một chút
        }
        // --- CẤU HÌNH ĐẠN NEON CHO NƯỚC & LỬA ---
        let isWater = (this.weapon === 'water_gun');
        let isFurnace = (this.weapon === 'furnace');

        if (type === 'water_normal' || type === 'fire_normal') {
            size = 6; hSize = 12; spd += 2; // Đạn thường: Dài 25, bay nhanh
        } else if (type === 'water_stream' || type === 'fire_stream') {
            size = 10; hSize = 80; spd += 5; // Tia phun liên tục: Siêu dài, cực nhanh
        }
        // --------------------------------------------------

        // ... (Logic Shotgun giữ nguyên)
        if (this.weapon === 'shotgun') {
            // Gốc: 5 viên | Evo 1: 6 viên + đợt 2 (3 viên) bắn theo sau mỗi phát
            let angles = (type === 'shot_wave') ? [-0.15, 0, 0.15]
                : (this.bulletCount >= 6 ? [-0.45, -0.27, -0.09, 0.09, 0.27, 0.45] : [-0.36, -0.18, 0, 0.18, 0.36]);
            if (type !== 'shot_wave' && this.hasUpgrade('evo_shot_1')) this.shotWaveT = 8;
            angles.forEach(angle => {
                this.bullets.push({ x: this.x + this.w / 2 - size / 2, y: startY, w: size, h: size, vx: angle * spd, vy: dirY * spd, dmg: dmg, owner: this });
            });
            return;
        }

        // --- SMG LOGIC ---
        let vx = 0;
        let vy = dirY * spd; // [FIX 1] KHAI BÁO BIẾN `vy` Ở ĐÂY ĐỂ GAME KHÔNG BỊ CRASH

        // --- GÁN THÊM CHO 6 NÒNG ---
        let inflictBurn = false;
        if (this.weapon === 'six_barrel') {
            vx = this.nextShotSpreadVx || 0;
            inflictBurn = this.nextShotInflictsBurn || false;
            size = 4; // Đạn nhỏ xíu
            hSize = 8;
            spd += 4; // Đạn bay siêu nhanh
        }
        if (this.weapon === 'smg') {
            if (this.smgSprayCount >= 3) vx = (Math.random() - 0.5) * 5;
            else vx = 0;

            if (this.hasUpgrade('evo_smg_1') && this.smgSprayCount > 3) {
                let bonus = this.smgSprayCount - 3;
                dmg += Math.min(bonus * 0.05, 0.5); spd += Math.min(bonus * 0.3, 4); size += Math.min(bonus * 0.5, 5); // trần: +0.5 dame
            }
        }
        // --- LOGIC PORTAL FULL EVO (MỚI) ---
        if (this.weapon === 'portal') spd += this.portalBulletSpeedBonus;

        let isPiercing = (this.weapon === 'lazer_auto') || (this.weapon === 'money_tank' && this.upgradeLevel >= 4) || (this.weapon === 'water_gun' && this.hasUpgrade('evo_water_2')) || (this.weapon === 'inventor' && this.invUpgrades && this.invUpgrades['inv_tangcuong'] && this.invUpgrades['inv_lazer']);

        // --- Ghost ---///
        let isGhostBullet = (this.weapon === 'ghost');
        let isFlicker = false;

        if (isGhostBullet) {
            spd += 2;
            if (this.isGhostActive) {
                spd += 5; isPiercing = true; isFlicker = true;
                dmg *= 1.5; // +50% Đòn Phục Kích Chí Mạng từ Vô Ảnh
            }
            if (this.hasUpgrade('evo_ghost_1') && this.isGhostActive) spd += 2;
        }
        if (this.weapon === 'magician' && this.invisTimer > 0) {
            dmg *= 1.35; // +35% Đòn Đột Kích Bất Ngờ khi Tàng Hình
        }
        if (isGhostBullet && this.hasPhantom && this.isGhostActive && this.hasUpgrade('evo_ghost_1') && this.hasUpgrade('evo_ghost_2')) {
            const enemy = (this.id === 1) ? p2 : p1;
            let angle = Math.atan2(enemy.y - startY, enemy.x - (this.x + this.w / 2));
            vx = Math.cos(angle) * spd * 0.5;
        }

        let isExplosive = (this.weapon === 'portal' && this.nextShotExplosive);
        if (isExplosive) { this.nextShotExplosive = false; size = 10; };
        if (this.weapon === 'money_tank' && this.upgradeLevel >= 5) isExplosive = true;
        if (this.weapon === 'inventor' && this.invUpgrades && this.invUpgrades['inv_tangcuong'] && this.invUpgrades['inv_phao']) isExplosive = true;
        // sukuna
        if (this.weapon === 'sukuna') { size = 30; hSize = 10; }

        // --- LOGIC TRỐI CHẾT (DEATH LOCK) ---
        let isDeathLock = (this.weapon === 'death_lock');
        let isConfinementBullet = false;
        if (isDeathLock) {
            this.deathLockShotCount = (this.deathLockShotCount || 0) + 1;
            let nowTime = Date.now();
            if (this.deathLockShotCount % 6 === 0 && (nowTime - (this.lastConfinementCageEndTime || 0) >= 5000)) {
                isConfinementBullet = true;
                size += 6;
            }
        }

        //-sniper-//
        // --- LOGIC SNIPER (NGẮM NÓN & RAYCAST) ---
        let isRaycast = false;
        let isSniperBullet = (this.weapon === 'sniper');
        let sniperAng = null;

        if (isSniperBullet) {
            isPiercing = true; // Mặc định xuyên vật thể
            let isFullEvo = this.hasUpgrade('evo_sniper_1') && this.hasUpgrade('evo_sniper_2');

            // Raycast RNG
            let rayChance = isFullEvo ? 0.5 : (this.hasUpgrade('evo_sniper_2') ? 0.25 : 0);
            hSize = 16; // đạn nhanh: thân dài hơn để không xuyên qua hitbox
            if (Math.random() < rayChance) {
                isRaycast = true; spd = 40; hSize = 60;
                dmg = Math.min(2.5, dmg); // Cân bằng Online: khống chế sát thương Raycast tối đa 2.5
            }

            // Ngắm nón tự động: dùng chung với tia ngắm (sniperAimAngle) -> hướng bắn khớp tuyệt đối
            sniperAng = sniperAimAngle(this);
        }

        // ===============================================
        // TIẾN HÀNH BẮN ĐẠN VÀO MẢNG CHUNG
        // ===============================================
        // Recalculate vy after weapon-specific speed modifications
        vy = dirY * spd;
        if (sniperAng !== null) { vx = Math.cos(sniperAng) * spd; vy = Math.sin(sniperAng) * spd; }
        soundSystem.playShoot(this.weapon === 'lazer_auto' ? 'laser' : (this.weapon === 'rocket' ? 'cannon' : 'normal'));

        this.bullets.push({
            type: type,
            createAcidZone: createAcidZone,
            isWater: isWater,
            isFurnace: isFurnace,
            isAcid: (this.weapon === 'acid'),
            createFireZone: createFireZone,
            isFullEvoBig: isFullEvoBig,
            hook: (this.weapon === 'big_bullet' && type === 'normal') ? 'big_bullet' : undefined, // quả cầu tròn + Full Evo
            isGhost: isGhostBullet,
            isFlicker: isFlicker,
            x: this.x + this.w / 2 - size / 2,
            y: startY,
            w: size,
            h: hSize,

            vx: vx,
            vy: vy, // [FIX 3] Gán bằng biến `vy` thay vì `dirY * spd` để đạn có thể bay nghiêng theo góc ngắm

            dmg: dmg,
            owner: this,
            bounceCount: 0,
            isFullCharge: isFullCharge,
            isPiercing: isPiercing,
            inflictBurn: inflictBurn,
            isRocket: (this.weapon === 'rocket'),
            rocketAccel: (this.weapon === 'rocket') ? 0.2 : 0,
            isExplosive: isExplosive,
            isIce: isIce,
            createIceZone: createIceZone,
            isBigIceZone: isBigIceZone,
            isAmChu: isAmChuBullet,
            isDuongChu: isDuongChuBullet,
            isSniperBullet: isSniperBullet,
            isRaycast: isRaycast,
            raycastBaseSpd: C.bulletSpeed,
            isSukunaSlash: (this.weapon === 'sukuna'),
            isInventorPlayerBullet: (this.weapon === 'inventor'),
            tangCuongSlow: !!(this.weapon === 'inventor' && this.invUpgrades && this.invUpgrades['inv_tangcuong'] && this.invUpgrades['inv_bang']),
            tangCuongBurn: !!(this.weapon === 'inventor' && this.invUpgrades && this.invUpgrades['inv_tangcuong'] && this.invUpgrades['inv_lua']),
            tangCuongNhieu: !!(this.weapon === 'inventor' && this.invUpgrades && this.invUpgrades['inv_tangcuong'] && this.invUpgrades['inv_nhieu']),
            isDeathLockBullet: isDeathLock,
            isConfinementBullet: isConfinementBullet,
            isNecroSoul: (this.weapon === 'necromancer' || type === 'necro_soul'),
            hitIds: []
        });
        // --- LOGIC BẢN SAO BẮN (MIRROR) ---
        // Chặn type 'mirror_clone' để bản sao không tự tạo ra bản sao nữa (tránh loop vô tận)
        // Tìm đoạn LOGIC BẢN SAO BẮN (MIRROR) ở cuối hàm fireBullet và sửa lại:
        if (this.weapon === 'mirror' && !type.includes('mirror_clone')) {
            let bx = this.x + this.w / 2 - size / 2;
            let by = startY;

            // Tọa độ bắn chỉ đối xứng ngang
            let cloneX = canvas.width - (bx + size);
            let cloneY = by; // <--- SỬA THÀNH DÒNG NÀY: Giữ nguyên Y của đạn

            this.bullets.push({
                type: type + '_mirror_clone',
                createAcidZone: false, isWater: false, isFurnace: false, isAcid: false, createFireZone: false,
                isFullEvoBig: false, isGhost: false, isFlicker: false,

                x: cloneX, y: cloneY, w: size, h: hSize,
                vx: -vx, // Đảo ngược hướng ngang
                vy: vy,  // <--- SỬA THÀNH DÒNG NÀY: Giữ nguyên hướng dọc để đạn lao về phía đối thủ
                dmg: dmg * 0.5,

                owner: this, bounceCount: 0, isFullCharge: false, isPiercing: isPiercing, inflictBurn: false,
                isRocket: false, rocketAccel: 0, isExplosive: false, isIce: false, createIceZone: false, isBigIceZone: false,
                isAmChu: false, isDuongChu: false, isSniperBullet: false, isRaycast: false, raycastBaseSpd: C.bulletSpeed,
                hitIds: []
            });
        }
    }
});
