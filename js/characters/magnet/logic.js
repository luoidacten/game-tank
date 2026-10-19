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
            this.polarDashKind = null;   // 'node' (Cột Từ Trường) | 'enemy' (kẻ địch nhiễm từ)
            this.polarDashPhase = 0;     // 1 = lao lên, 2 = bật về
            this.polarDashHomeY = 0;
            this.polarDashHit = false;
            this.polarDashCd = 0;
            this.polarDashT = 0;
        }
    },

    // Tìm mục tiêu KHÁC CỰC ở phía trước (cột từ trường hoặc kẻ địch nhiễm từ) để Lướt Cực Tính
    findPolarDashTarget() {
        const cx = this.x + this.w / 2;
        const range = 170;
        const fwd = (y) => (this.id === 1) ? (y < this.y) : (y > this.y + this.h);
        let best = null, bestDx = 1e9, kind = null;
        const enemy = (this.id === 1) ? p2 : p1;
        if (enemy && enemy.hp > 0 && enemy.infectedPolarityTimer > 0 && enemy.infectedPolarity && enemy.infectedPolarity !== this.magnetPolarity) {
            const dx = Math.abs(enemy.x + enemy.w / 2 - cx);
            if (dx <= range) { best = enemy; bestDx = dx - 20; kind = 'enemy'; } // ưu tiên kẻ địch
        }
        for (const m of magnetNodes) {
            if (!m.active || m.polarity === this.magnetPolarity || !fwd(m.y)) continue;
            const dx = Math.abs(m.x - cx);
            if (dx <= range && dx < bestDx) { best = m; bestDx = dx; kind = 'node'; }
        }
        return best ? { t: best, kind } : null;
    },

    startPolarDash(found) {
        this.isPolarDashing = true;
        this.polarDashTarget = found.t;
        this.polarDashKind = found.kind;
        this.polarDashPhase = 1;
        this.polarDashHomeY = (this.id === 1) ? canvas.height - this.h - 22 : 20;
        this.polarDashHit = false;
        this.polarDashT = 0;
        if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 15, found.kind === 'enemy' ? "HÚT & HÚC! 🧲💥" : "LƯỚT CỰC TÍNH! 🧲💨", "#00ffff", 14);
        if (soundSystem && !soundSystem.muted) soundSystem.playDash();
    },

    // Kết thúc pha lao: nổ từ tính tại điểm húc, bật về
    polarDashImpact(x, y) {
        let dmg = this.hasUpgrade('evo_mag_net_1') ? 2.0 : 1.0;
        let radius = 60;
        explosions.push(new Explosion(x, y, radius, this.magnetPolarity === 1 ? 'rgba(255, 60, 0,' : 'rgba(0, 180, 255,', 0, this));
        let enemy = (this.id === 1) ? p2 : p1;
        if (!this.polarDashHit && enemy && enemy.hp > 0 && Math.hypot((enemy.x + enemy.w / 2) - x, (enemy.y + enemy.h / 2) - y) <= radius + enemy.w / 2) {
            this.polarDashHit = true;
            enemy.takeDamage(dmg, this);
        }
        triggerScreenShake(5, 8);
        this.polarDashPhase = 2;
    },

    // Va chạm khi đang lao (giống xe TANK): húc địch 1 lần, phá thùng đồ
    polarDashCollide() {
        let enemy = (this.id === 1) ? p2 : p1;
        if (!this.polarDashHit && enemy && enemy.hp > 0 && rectIntersect(this.x, this.y, this.w, this.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
            this.polarDashHit = true;
            let dmg = this.hasUpgrade('evo_mag_net_1') ? 1.5 : 1.0;
            enemy.takeDamage(dmg, this);
            enemy.kbX = ((enemy.x + enemy.w / 2) >= (this.x + this.w / 2) ? 1 : -1) * 6;
            explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 50, this.magnetPolarity === 1 ? 'rgba(255, 60, 0,' : 'rgba(0, 180, 255,', 0, this));
            triggerScreenShake(6, 10);
            if (this.polarDashKind === 'enemy') { this.polarDashPhase = 2; return; }
        }
        if (typeof crates !== 'undefined') {
            for (let c of crates) {
                if (c.active && rectIntersect(this.x, this.y, this.w, this.h, c.x, c.y, c.w, c.h)) {
                    c.active = false;
                    crateOnBreak(c, this);
                    if (typeof grantCrateLoot === 'function') grantCrateLoot(c, this);
                    break;
                }
            }
        }
    },

    // [update] magnet — trả về true nếu cần dừng update() (đang Lướt Cực Tính)
    updateMagnet() {
        if (this.weapon === 'magnet') {
            if (this.polarDashCd > 0 && !this.isPolarDashing) this.polarDashCd--;
            // Lướt Cực Tính: lao THẲNG lên phía trước (như xe TANK) về phía mục tiêu khác cực, đồng thời hút mục tiêu lại
            if (this.isPolarDashing) {
                let t = this.polarDashTarget;
                let dir = (this.id === 1) ? -1 : 1;
                let cx = this.x + this.w / 2;
                this.polarDashT++;
                if (this.polarDashPhase === 1) {
                    let alive = t && (this.polarDashKind === 'enemy' ? t.hp > 0 : t.active);
                    if (!alive) { this.polarDashPhase = 2; return true; }
                    let tx = (this.polarDashKind === 'enemy') ? t.x + t.w / 2 : t.x;
                    let ty = (this.polarDashKind === 'enemy') ? t.y + t.h / 2 : t.y;
                    // Bẻ lái ngang về phía mục tiêu
                    let sdx = tx - cx;
                    this.x = Math.max(0, Math.min(canvas.width - this.w, this.x + Math.max(-7, Math.min(7, sdx))));
                    cx = this.x + this.w / 2;
                    this.y += dir * 18;
                    // Hút mục tiêu về phía mình
                    let enemy = (this.id === 1) ? p2 : p1;
                    if (enemy && enemy.hp > 0) {
                        let pullX = null, force = 0;
                        if (this.polarDashKind === 'enemy') { pullX = cx; force = 7; }
                        else if (Math.abs(enemy.x + enemy.w / 2 - t.x) <= t.radius * 1.5) { pullX = t.x; force = 5; }
                        if (pullX !== null) {
                            let edx = pullX - (enemy.x + enemy.w / 2);
                            enemy.x = Math.max(0, Math.min(canvas.width - enemy.w, enemy.x + Math.max(-force, Math.min(force, edx))));
                        }
                    }
                    this.polarDashCollide();
                    if (this.polarDashPhase !== 1) return true;
                    let myY = this.y + this.h / 2;
                    if (this.polarDashKind === 'node' && (dir < 0 ? myY <= t.y + 14 : myY >= t.y - 14)) {
                        t.active = false;
                        this.polarDashImpact(t.x, t.y);
                    } else if (this.polarDashKind === 'enemy' && (dir < 0 ? myY < ty - 30 : myY > ty + 30)) {
                        this.polarDashPhase = 2;
                    }
                    if (this.y < 0 || this.y > canvas.height - this.h) {
                        this.y = Math.max(0, Math.min(canvas.height - this.h, this.y));
                        if (this.polarDashPhase === 1) this.polarDashImpact(this.x + this.w / 2, this.y + this.h / 2);
                    }
                } else {
                    // Bật về làn của mình
                    let home = this.polarDashHomeY;
                    let step = 13;
                    if (Math.abs(home - this.y) <= step) {
                        this.y = home;
                        this.isPolarDashing = false;
                        this.polarDashPhase = 0;
                        this.polarDashTarget = null;
                        this.polarDashCd = 60;
                    } else {
                        this.y += (home > this.y ? 1 : -1) * step;
                    }
                }
                return true;
            } else {
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
        return false;
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

                        let found = (isDoubleTap && this.polarDashCd <= 0) ? this.findPolarDashTarget() : null;
                        if (found) {
                            this.startPolarDash(found);
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
