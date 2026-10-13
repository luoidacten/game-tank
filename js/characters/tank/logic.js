// ==========================================
// Xe TANK (tank) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    checkDashCollision() {
        let hitSomething = false;
        const enemy = (this.id === 1) ? p2 : p1;

        // 1. Va chạm Người chơi (Địch)
        // [CÂN BẰNG] Mỗi cú lao chỉ trúng địch 1 lần (trước đây trúng mỗi tick khi đi xuyên qua)
        if (!this.tankDashHitEnemy && rectIntersect(this.x, this.y, this.w, this.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
            this.tankDashHitEnemy = true;
            let dmg = this.damage * 1.1; // [CÂN BẰNG] 3x -> 1.1x
            if (this.hasUpgrade('evo_tank_1')) dmg *= 1.5;

            enemy.takeDamage(dmg, this);
            explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 50, 'orange', 0, this));
            hitSomething = true;
        }

        // 2. Va chạm Công trình / Vật thể
        let dashDmg = this.damage * 3; // Lực tông mạnh

        // A. Ụ SÚNG (TURRETS)
        if (!hitSomething) {
            for (let t of turrets) {
                if (t.active && t.owner.id !== this.id && rectIntersect(this.x, this.y, this.w, this.h, t.x, t.y, t.w, t.h)) {
                    t.hp -= dashDmg; hitSomething = true;
                    explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 40, 'gray', 0, this));
                    break;
                }
            }
        }

        // B. XE TIỀN (MONEY TRUCKS) -> FIX LỖI MÁU ÂM
        if (!hitSomething && typeof moneyTrucks !== 'undefined') {
            for (let t of moneyTrucks) {
                if (t.active && rectIntersect(this.x, this.y, this.w, this.h, t.x, t.y, t.w, t.h)) {
                    let multiplier = (this.weapon === 'money_tank') ? 3 : 1;
                    t.hp -= dashDmg * 2 * multiplier; // Trừ máu xe tiền
                    hitSomething = true;

                    // Nếu máu về 0 hoặc âm -> Kích hoạt nổ vỡ xe và thưởng tiền luôn
                    if (t.hp <= 0) {
                        t.active = false;
                        let money = 50;
                        if (this.weapon === 'money_tank') money *= 2;
                        if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                        if (this.weapon === 'evolution') this.onEvolutionCrateEat('truck');

                        if (this.hasUpgrade('evo_money_atk')) {
                            const enemyObj = (this.id === 1) ? p2 : p1;
                            const angle = Math.atan2(enemyObj.y - (t.y + t.h / 2), enemyObj.x - (t.x + t.w / 2));
                            const spread = [-0.3, 0, 0.3];
                            spread.forEach(a => {
                                this.bullets.push({
                                    x: t.x + t.w / 2, y: t.y + t.h / 2, w: 6, h: 6,
                                    vx: Math.cos(angle + a) * 7, vy: Math.sin(angle + a) * 7,
                                    dmg: 2, owner: this, bounceCount: 0, isPiercing: false
                                });
                            });
                            explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 60, 'rgba(255,215,0,', 0, this));
                        } else {
                            explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 80, 'rgba(255,215,0,', 5, this));
                        }
                    } else {
                        // Nếu chưa chết thì chỉ hiện hiệu ứng móp xe nhẹ
                        explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 35, 'rgba(255,165,0,', 0, this));
                    }
                    break;
                }
            }
        }

        // C. HỘP TIẾP TẾ (CRATES) -> FIX LỖI ĂN THƯỞNG KHI TÔNG TRÚNG
        if (!hitSomething && typeof crates !== 'undefined') {
            for (let c of crates) {
                if (c.active && rectIntersect(this.x, this.y, this.w, this.h, c.x, c.y, c.w, c.h)) {
                    c.active = false; // Phá hủy hòm ngay lập tức
                    hitSomething = true;

                    crateOnBreak(c, this);

                    if (c.isMimic) {
                        triggerMimicExplosion(c, this);
                    }
                    // Trao thưởng trực tiếp cho xe TANK vừa tông vào hòm
                    if (c.type === 'hp') {
                        if (this.weapon === 'necromancer') {
                            let cap = this.maxSouls - (this.lockedSouls || 0);
                            this.currentSouls = Math.min(cap, (this.currentSouls || 0) + 4);
                            addFloatingText(this.x + this.w / 2, this.y - 15, "+4 LINH HỒN 👻", "#00e676", 13);
                        } else {
                            this.hp = Math.min(this.hp + 1, this.maxHp);
                        }
                    }
                    if (c.type === 'ammo') this.onCollectAmmoCrate(c);
                    if (c.type === 'shield') this.shield++;
                    if (c.type === 'dmg') this.dmgBuff++;
                    if (this.weapon === 'evolution') this.onEvolutionCrateEat(c.type);
                    if (c.type === 'coin') {
                        let money = 30; if (this.weapon === 'money_tank') money *= 2;
                        if (this.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                        if (this.weapon === 'inventor') this.components = (this.components || 0) + 2;
                    }
                    if (c.type === 'gear') {
                        let lkGain = this.hasUpgrade('evo_inv_1') ? 8 : 5;
                        this.ammo = Math.min(this.maxAmmo, this.ammo + 1);
                        this.hp = Math.min(this.maxHp, this.hp + 0.25);
                        if (this.weapon === 'inventor') {
                            this.components = (this.components || 0) + lkGain;
                            addFloatingText(this.x + this.w / 2, this.y - 15, `+${lkGain} LK`, "#00ffcc", 13);
                        }
                        if (this.weapon === 'genius') {
                            if (this.isPilotingMecha) {
                                if (this.mechaHp < this.mechaMaxHp) {
                                    this.mechaHp = Math.min(this.mechaMaxHp, this.mechaHp + 0.5);
                                    addFloatingText(this.x + this.w / 2, this.y - 15, "+0.5 MECHA HP 🤖", "#ff9800", 12);
                                } else {
                                    this.mechaVirtualArmor = (this.mechaVirtualArmor || 0) + 0.5;
                                    addFloatingText(this.x + this.w / 2, this.y - 15, "+0.5 GIÁP ẢO 🛡️", "#ffd700", 12);
                                }
                            } else {
                                this.gears = (this.gears || 0) + 1;
                                addFloatingText(this.x + this.w / 2, this.y - 15, "+1 BÁNH RĂNG ⚙️", "#ff9800", 12);
                            }
                        }
                    }
                    if (this.weapon === 'genius' && c.type !== 'gear') {
                        if (this.isPilotingMecha) {
                            if (this.mechaHp < this.mechaMaxHp) {
                                this.mechaHp = Math.min(this.mechaMaxHp, this.mechaHp + 0.5);
                                addFloatingText(this.x + this.w / 2, this.y - 15, "+0.5 MECHA HP 🤖", "#ff9800", 12);
                            } else {
                                this.mechaVirtualArmor = (this.mechaVirtualArmor || 0) + 0.5;
                                addFloatingText(this.x + this.w / 2, this.y - 15, "+0.5 GIÁP ẢO 🛡️", "#ffd700", 12);
                            }
                        } else {
                            this.gears = (this.gears || 0) + 1;
                            addFloatingText(this.x + this.w / 2, this.y - 15, "+1 BÁNH RĂNG ⚙️", "#ff9800", 12);
                        }
                        this.components = (this.components || 0) + 0.5;
                        addFloatingText(this.x + this.w / 2, this.y - 27, "+0.5 LINH KIỆN 🔩", "#00e5ff", 11);
                    }
                    // Giáp hợp kim: Nhặt Crate nhận Giáp Ảo 5s
                    if (this.weapon === 'inventor' && this.invUpgrades && this.invUpgrades['inv_giap']) {
                        this.shield = (this.shield || 0) + 1;
                        this.crateShieldActive = true;
                        this.crateShieldExpireTimer = Date.now() + 5000;
                        addFloatingText(this.x + this.w / 2, this.y - 15, "+1 SHIELD (5s)", "#00ffff", 12);
                    }

                    // Hiệu ứng nổ hòm
                    if (c.type === 'boom') {
                        explosions.push(new Explosion(c.x, c.y, 60, 'rgba(255,0,0,', 0, this));
                    } else {
                        explosions.push(new Explosion(c.x, c.y, 30, 'rgba(255,255,255,', 0, this));
                    }
                    break;
                }
            }
        }

        // D. TƯỜNG SNIPER
        if (!hitSomething && typeof sniperWalls !== 'undefined') {
            for (let w of sniperWalls) {
                if (w.active && rectIntersect(this.x, this.y, this.w, this.h, w.x, w.y, w.w, w.h)) {
                    if (!w.isImmortal) w.hp -= dashDmg;
                    hitSomething = true; break;
                }
            }
        }

        // E. THANH NGANG DI CHUYỂN
        if (!hitSomething && typeof movingObstacle !== 'undefined' && movingObstacle && movingObstacle.active) {
            if (rectIntersect(this.x, this.y, this.w, this.h, movingObstacle.x, movingObstacle.y, movingObstacle.w, movingObstacle.h)) {
                hitSomething = true;
            }
        }

        // 3. Xử lý phản chấn sau va chạm (Địch hoặc Vật thể)
        if (hitSomething) {
            if (this.hasUpgrade('evo_tank_2') && this.shield > 0) {
                explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 80, 'rgba(255,0,0,', 2, this));
                iceZones.push(new IceZone(this.x + this.w / 2, this.y + this.h / 2, 60, 300, this));
            }

            if (!this.hasUpgrade('evo_tank_1')) {
                if (this.shield > 0) this.shield = 0;
                else this.hp -= 3;
            }

            this.dashState = 2; // Bật lùi về trạng thái hồi vị
            return true;
        }
        return false;
    },

    // [setupForNewRound] Xe TANK
    setupTank() {
        if (this.weapon === 'tank') {
            this.speed *= 0.7; // Giảm tốc độ di chuyển thường
            this.dashState = 0;
            this.dashStartY = 0;
            this.passiveShieldTimer = 0;

            // Tính Dash Speed dựa trên Speed cuối cùng (sau khi đã cộng Feet)
            this.dashSpeed = 16 + (this.speed - (C.baseSpeed * 0.7)) * 2;

            // Full Evo Tank Bonus
            if (this.hasUpgrade('evo_tank_1') && this.hasUpgrade('evo_tank_2')) {
                this.maxHp += 15;
                this.dashSpeed += 8;
            }
        }
    },

    // [update] Xe TANK — trả về true nếu cần dừng update()
    updateTank() {
        if (this.weapon === 'tank') {
            if ((this.tankDashCooldown || 0) > 0 && this.dashState === 0) this.tankDashCooldown--;
            this.passiveShieldTimer++;
            let shieldLimit = (this.hasUpgrade('evo_tank_1') && this.hasUpgrade('evo_tank_2')) ? 120 : (this.hasUpgrade('evo_tank_2') ? 240 : 360);
            if (this.passiveShieldTimer >= shieldLimit) {
                this.shield++;
                this.passiveShieldTimer = 0;
            }

            if (this.dashState === 1) {
                let dir = (this.id === 1) ? -1 : 1;
                this.y += this.dashSpeed * dir;

                this.checkDashCollision();

                if (this.y < 0 || this.y > canvas.height - this.h) {
                    if (this.hasUpgrade('evo_tank_2') && this.shield > 0) {
                        let wallY = (this.y < 0) ? 0 : canvas.height - this.h;
                        explosions.push(new Explosion(this.x + this.w / 2, wallY + this.h / 2, 80, 'rgba(255,0,0,', 2, this));
                        iceZones.push(new IceZone(this.x + this.w / 2, wallY + this.h / 2, 60, 300, this));
                    }

                    if (this.hasUpgrade('evo_tank_1')) {
                    } else {
                        if (this.shield > 0) this.shield = 0;
                        else this.hp -= 3;
                    }

                    this.dashState = 2;
                }
                return true;
            } else if (this.dashState === 2) {
                let dir = (this.id === 1) ? 1 : -1;
                this.y += (this.dashSpeed * 0.5) * dir;
                if ((this.id === 1 && this.y >= this.dashStartY) || (this.id === 2 && this.y <= this.dashStartY)) {
                    this.y = this.dashStartY;
                    this.dashState = 0;
                    this.tankDashCooldown = 120; // [CÂN BẰNG] hồi chiêu 2s (hòm đạn reset ngay)
                }
                return true;
            }
        }
    },

    // [handleShooting] Xe TANK — trả về true nếu cần dừng handleShooting()
    shootTank(inp) {
        if (this.weapon === 'tank') {
            if (inp.s && this.dashState === 0 && (this.tankDashCooldown || 0) <= 0) {
                this.tankDashHitEnemy = false;
                this.dashState = 1;
                this.dashStartY = this.y;
                inp.s = false;
            }
            return true;
        }
    }
});
