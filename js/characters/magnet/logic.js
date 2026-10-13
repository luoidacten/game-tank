// ==========================================
// magnet (magnet) — Logic (cập nhật, bắn, kỹ năng)
// ==========================================

Object.assign(Player.prototype, {
    toggleMagnetPolarity() {
        this.magnetPolarity = (this.magnetPolarity === 1) ? -1 : 1;
        let isFullEvo = this.hasUpgrade('evo_mag_net_1') && this.hasUpgrade('evo_mag_net_2');
        if (typeof spawnSparkParticles === 'function') {
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, this.magnetPolarity === 1 ? '#ff3300' : '#00aaff', 16);
        }
        if (typeof addFloatingText === 'function') {
            addFloatingText(this.x + this.w / 2, this.y - 15, this.magnetPolarity === 1 ? "ĐẢO CỰC (+)" : "ĐẢO CỰC (-)", this.magnetPolarity === 1 ? "#ff3300" : "#00aaff", 14);
        }
        if (isFullEvo) {
            let enemy = (this.id === 1) ? p2 : p1;
            let edx = (enemy.x + enemy.w / 2) - (this.x + this.w / 2);
            let dirX = (edx >= 0 ? 1 : -1);
            enemy.x = Math.max(0, Math.min(canvas.width - enemy.w, enemy.x + dirX * 45));
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 65, 'rgba(0, 255, 255,', 0, this));
        }
        if (soundSystem && !soundSystem.muted) soundSystem.playPowerup();
    },

    fireMagnetBullet() {
        let dirY = (this.id === 1) ? -1 : 1;
        let bSpeed = C.bulletSpeed;
        if (typeof gameState !== 'undefined' && gameState.currentMap === 'overdrive') bSpeed *= 1.5;
        this.bullets.push({
            x: this.x + this.w / 2 - 4,
            y: (this.id === 1) ? this.y - 8 : this.y + this.h,
            w: 8, h: 8,
            vx: 0,
            vy: dirY * bSpeed,
            dmg: this.damage,
            owner: this,
            isMagnetBullet: true,
            polarity: this.magnetPolarity || 1,
            isPiercing: false,
            hitIds: [],
            bounceCount: 0
        });
        if (soundSystem && !soundSystem.muted) soundSystem.playShoot();
    },

    // [setupForNewRound] magnet
    setupMagnet() {
        if (this.weapon === 'magnet') {
            this.magnetPolarity = 1; // 1 = Dương (+), -1 = Âm (-)
            this.magnetHoldFrames = 0;
            this.isPolarDashing = false;
            this.polarDashTarget = null;
        }
    },

    // [update] magnet
    updateMagnet() {
        if (this.weapon === 'magnet') {
            // 1. Lướt Từ Tính (Polar Dash)
            // 1. Lướt Từ Tính (Polar Dash) - Chỉ lướt theo trục ngang (X) trên baseline
            if (this.isPolarDashing && this.polarDashTarget) {
                let t = this.polarDashTarget;
                let dx = t.x - (this.x + this.w / 2);
                let dist = Math.abs(dx);
                let dashSpeed = 26;
                this.y = (this.id === 1) ? canvas.height - this.h - 22 : 20;

                if (dist <= dashSpeed) {
                    this.x = Math.max(0, Math.min(canvas.width - this.w, t.x - this.w / 2));
                    this.isPolarDashing = false;
                    this.isInvulnerable = false;
                    t.active = false;
                    let dashDmg = this.hasUpgrade('evo_mag_net_1') ? 2.0 : 1.0;
                    let radius = 60;
                    explosions.push(new Explosion(t.x, t.y, radius, this.magnetPolarity === 1 ? 'rgba(255, 60, 0,' : 'rgba(0, 180, 255,', dashDmg, this));
                    let enemy = (this.id === 1) ? p2 : p1;
                    if (enemy && enemy.hp > 0 && Math.hypot((enemy.x + enemy.w / 2) - t.x, (enemy.y + enemy.h / 2) - t.y) <= radius) {
                        enemy.takeDamage(dashDmg, this);
                    }
                    triggerScreenShake(5, 8);
                } else {
                    this.x += (dx > 0 ? 1 : -1) * dashSpeed;
                }
            } else if (this.weapon === 'magnet') {
                this.y = (this.id === 1) ? canvas.height - this.h - 22 : 20;
            }

            // Visual vòng tụ lực đảo cực
            if (this.magnetHoldFrames > 0) {
                ctx.save();
                ctx.strokeStyle = this.magnetHoldFrames >= 25 ? (this.magnetPolarity === 1 ? "#00aaff" : "#ff3300") : "#ffffff";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                let progress = Math.min(1, this.magnetHoldFrames / 25);
                ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 24, 0, progress * Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        }
    },

    // [handleShooting] magnet — trả về true nếu cần dừng handleShooting()
    shootMagnet(inp, now) {
        if (this.weapon === 'magnet') {
            if (this.isPolarDashing) return true;
            if (inp.s) {
                this.magnetHoldFrames = (this.magnetHoldFrames || 0) + 1;
                return true;
            } else {
                if (this.magnetHoldFrames > 0) {
                    let held = this.magnetHoldFrames;
                    this.magnetHoldFrames = 0;
                    if (held >= 25) {
                        this.toggleMagnetPolarity();
                        return true;
                    } else {
                        let nowTap = Date.now();
                        let isDoubleTap = (nowTap - (this.lastMagnetTapTime || 0) < 320);
                        this.lastMagnetTapTime = nowTap;

                        let enemyHalfY = canvas.height / 2;
                        let eligibleNodes = magnetNodes.filter(m => m.active && m.polarity !== this.magnetPolarity && (this.id === 1 ? m.y < enemyHalfY : m.y > enemyHalfY));

                        if (isDoubleTap && eligibleNodes.length > 0) {
                            let closest = eligibleNodes.reduce((best, curr) => {
                                let dCurr = Math.hypot(curr.x - (this.x + this.w / 2), curr.y - (this.y + this.h / 2));
                                let dBest = Math.hypot(best.x - (this.x + this.w / 2), best.y - (this.y + this.h / 2));
                                return dCurr < dBest ? curr : best;
                            }, eligibleNodes[0]);

                            this.isPolarDashing = true;
                            this.polarDashTarget = closest;
                            this.isInvulnerable = true;
                            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, "LƯỚT TỪ TÍNH! 🧲💨", "#00ffff", 14);
                            if (soundSystem && !soundSystem.muted) soundSystem.playDash();
                            return true;
                        }

                        if (this.ammo > 0 && now - this.lastShot > 350) {
                            this.fireMagnetBullet();
                            this.ammo--;
                            this.lastShot = now;
                        }
                        return true;
                    }
                }
                return true;
            }
        }
    }
});
