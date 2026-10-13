// ==========================================
// creator (creator) — Vật triệu hồi / thực thể riêng
// ==========================================



// ==========================================
// --- CLASS Ụ SÚNG KẺ SÁNG TẠO (CREATOR) ---
// ==========================================
class CreatorTurret {
    constructor(owner, x, y) {
        this.owner = owner;
        this.x = x;
        this.y = y;
        this.w = 20;
        this.h = 20;
        
        let hasEvo1 = owner.hasUpgrade && owner.hasUpgrade('evo_cr_1');
        let isFullEvo = hasEvo1 && owner.hasUpgrade('evo_cr_2');
        let ratio = isFullEvo ? 2.0 : (hasEvo1 ? 1.0 : 0.5);
        
        this.hp = Math.max(1, owner.maxHp * ratio);
        this.maxHp = this.hp;
        this.dmg = owner.damage * ratio;
        this.active = true;
        this.lastShot = Date.now();
        this.reloadTime = 1200;
        this.angle = (owner.id === 1) ? -Math.PI / 2 : Math.PI / 2;
    }

    update() {
        if (!this.active) return;
        const enemy = (this.owner.id === 1) ? p2 : p1;
        
        // Tìm mục tiêu gần nhất
        let targets = [];
        if (enemy && enemy.hp > 0) targets.push(enemy);
        crates.forEach(c => { if (c.active) targets.push(c); });
        moneyTrucks.forEach(t => { if (t.active) targets.push(t); });

        let best = null;
        let bestDist = Infinity;
        let centerX = this.x + this.w / 2;
        let centerY = this.y + this.h / 2;

        targets.forEach(t => {
            let tx = t.x + (t.w ? t.w / 2 : 0);
            let ty = t.y + (t.h ? t.h / 2 : 0);
            let d = Math.hypot(tx - centerX, ty - centerY);
            if (d < bestDist) {
                bestDist = d;
                best = { x: tx, y: ty };
            }
        });

        if (best) {
            this.angle = Math.atan2(best.y - centerY, best.x - centerX);
        }

        if (Date.now() - this.lastShot >= this.reloadTime) {
            this.lastShot = Date.now();
            let bSpeed = 7.5;
            let vx = Math.cos(this.angle) * bSpeed;
            let vy = Math.sin(this.angle) * bSpeed;
            this.owner.bullets.push({
                x: centerX - 3,
                y: centerY - 3,
                w: 6, h: 6,
                vx: vx, vy: vy,
                dmg: this.dmg,
                owner: this.owner,
                isCreatorTurretBullet: true,
                color: (this.owner.id === 1) ? "#00e5ff" : "#ff1744",
                hitIds: []
            });
            if (soundSystem && !soundSystem.muted) soundSystem.playShoot();
        }
    }

    takeDamage(dmg) {
        if (!this.active) return;
        this.hp -= dmg;
        if (this.hp <= 0) {
            this.active = false;
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 30, 'gray', 0, this.owner));
            if (soundSystem && !soundSystem.muted) soundSystem.playExplosion();
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        let cx = this.x + this.w / 2;
        let cy = this.y + this.h / 2;

        // Đế trụ
        ctx.fillStyle = (this.owner.id === 1) ? "#004d40" : "#4a148c";
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = (this.owner.id === 1) ? "#00e5ff" : "#ea80fc";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Nòng xoay tự ngắm
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.angle);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, -2, 13, 4);
        ctx.restore();

        // Mini HP Bar
        let hpRatio = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(this.x - 2, this.y - 6, this.w + 4, 3);
        ctx.fillStyle = (this.owner.id === 1) ? "#00e5ff" : "#ff1744";
        ctx.fillRect(this.x - 2, this.y - 6, (this.w + 4) * hpRatio, 3);

        ctx.restore();
    }
}

// ==========================================
// --- CLASS KHIÊN THÉP (CREATOR SHIELD) ---
// ==========================================
class CreatorShield {
    constructor(owner) {
        this.owner = owner;
        let hasEvo1 = owner.hasUpgrade && owner.hasUpgrade('evo_cr_1');
        let isFullEvo = hasEvo1 && owner.hasUpgrade('evo_cr_2');
        let ratio = isFullEvo ? 4.0 : (hasEvo1 ? 2.0 : 1.0);
        
        this.maxHp = 5 * ratio; // 5 HP gốc, 10 HP Evo 1, 20 HP Full Evo
        this.hp = this.maxHp;
        this.durationTicks = 16 * 60; // 16s
        this.active = true;
        this.w = owner.w + 24;
        this.h = 8;
    }

    update() {
        if (!this.active) return;
        this.durationTicks--;
        if (this.durationTicks <= 0 || this.hp <= 0) {
            this.active = false;
            this.owner.creatorShieldCooldown = 8 * 60; // Cooldown 8s sau khi vỡ/hết giờ
            if (this.hp <= 0) {
                explosions.push(new Explosion(this.owner.x + this.owner.w / 2, this.y, 40, '#00e5ff', 0, this.owner));
                if (soundSystem && !soundSystem.muted) soundSystem.playShieldBreak();
            }
            return;
        }

        // Đi theo xe chủ
        this.x = this.owner.x + this.owner.w / 2 - this.w / 2;
        this.y = (this.owner.id === 1) ? this.owner.y - 12 : this.owner.y + this.owner.h + 4;

        // Chặn đạn đối phương bay vào khiên
        const enemy = (this.owner.id === 1) ? p2 : p1;
        if (enemy && enemy.bullets && enemy.bullets.length > 0) {
            for (let i = enemy.bullets.length - 1; i >= 0; i--) {
                let b = enemy.bullets[i];
                if (!b || !b.active) continue;
                let bw = b.w || 6;
                let bh = b.h || 6;
                if (rectIntersect(b.x, b.y, bw, bh, this.x, this.y, this.w, this.h)) {
                    let dmgDealt = b.dmg || 1;
                    this.hp -= dmgDealt;
                    enemy.bullets.splice(i, 1);
                    spawnSparkParticles(b.x, b.y, '#00e5ff', 8);
                    if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 10, "KHIÊN CHẶN ĐẠN! 🛡️", "#00e5ff", 12);
                    if (this.hp <= 0) break;
                }
            }
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = "rgba(0, 229, 255, 0.25)";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        // Thanh máu khiên
        let hpRatio = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(this.x, this.y - 4, this.w * hpRatio, 2);
        ctx.restore();
    }
}

// ==========================================
// --- CLASS DRONE KHÔNG KÍCH (CREATOR DRONE) ---
// ==========================================
class CreatorDrone {
    constructor(owner) {
        this.owner = owner;
        this.w = 26;
        this.h = 20;
        this.x = canvas.width / 2 - 13;
        this.y = this.getHomeY();
        this.vx = 2.8;
        this.active = true;
        this.deadTimer = 0;
        this.lastShot = Date.now();
        this.reloadTime = 1200;
        this.hp = this.getMaxHp();
    }

    // [FIX] Đối xứng chuẩn giữa 2 phe & cập nhật theo kích thước sân hiện tại
    getHomeY() {
        return (this.owner.id === 1) ? canvas.height * 0.44 : canvas.height * 0.56 - this.h;
    }

    getMaxHp() {
        let isFullEvo = this.owner.hasUpgrade && this.owner.hasUpgrade('evo_cr_1') && this.owner.hasUpgrade('evo_cr_2');
        return Math.max(1, this.owner.maxHp * (isFullEvo ? 2.0 : 1.0));
    }

    getDamage() {
        let isFullEvo = this.owner.hasUpgrade && this.owner.hasUpgrade('evo_cr_1') && this.owner.hasUpgrade('evo_cr_2');
        return this.owner.damage * (isFullEvo ? 2.0 : 1.0);
    }

    update() {
        if (!this.active) {
            // Hồi sinh sau 15s (15000ms)
            if (Date.now() - this.deadTimer >= 15000) {
                this.active = true;
                this.hp = this.getMaxHp();
                this.x = canvas.width / 2 - 13;
                explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 35, '#00e5ff', 0, this.owner));
                if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 12, "DRONE TÁI SINH! 🤖", "#00e5ff", 14);
            }
            return;
        }

        // Tuần tra bay qua bay lại
        this.y = this.getHomeY();
        this.x += this.vx;
        if (this.x <= 15) { this.x = 15; this.vx = Math.abs(this.vx); }
        if (this.x + this.w >= canvas.width - 15) { this.x = canvas.width - 15 - this.w; this.vx = -Math.abs(this.vx); }

        // Bắn Pháo Đôi (2 viên đạn/loạt)
        if (Date.now() - this.lastShot >= this.reloadTime) {
            this.lastShot = Date.now();
            const enemy = (this.owner.id === 1) ? p2 : p1;
            let dirY = (this.owner.id === 1) ? -1 : 1;
            let bSpeed = 6.5;
            let vx = 0;
            let vy = dirY * bSpeed;

            if (enemy) {
                let dx = (enemy.x + enemy.w / 2) - (this.x + this.w / 2);
                let dy = (enemy.y + enemy.h / 2) - (this.y + this.h / 2);
                let angle = Math.atan2(dy, dx);
                let desiredVx = Math.cos(angle) * bSpeed;
                vx = Math.max(-2, Math.min(2, desiredVx));
                vy = dirY * Math.sqrt(Math.max(16, bSpeed * bSpeed - vx * vx));
            }

            let dmg = this.getDamage();
            // Pháo đôi: xả 2 viên đạn song song
            [-6, 6].forEach(offset => {
                this.owner.bullets.push({
                    x: this.x + this.w / 2 + offset - 3,
                    y: this.y + (dirY === -1 ? -5 : this.h + 2),
                    w: 6, h: 6,
                    vx: vx, vy: vy,
                    dmg: dmg,
                    owner: this.owner,
                    isCreatorDroneBullet: true,
                    color: (this.owner.id === 1) ? "#00f0ff" : "#ff0055",
                    hitIds: []
                });
            });
            if (soundSystem && !soundSystem.muted) soundSystem.playShoot();
        }
    }

    takeDamage(dmg) {
        if (!this.active) return;
        this.hp -= dmg;
        if (this.hp <= 0) {
            this.active = false;
            this.deadTimer = Date.now();
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 40, 'gray', 0, this.owner));
            if (soundSystem && !soundSystem.muted) soundSystem.playExplosion();
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = (this.owner.id === 1) ? "#00838f" : "#ad1457";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = (this.owner.id === 1) ? "#00e5ff" : "#ff4081";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        // 2 Nòng pháo đôi
        ctx.fillStyle = "#ffffff";
        let barrelY = (this.owner.id === 1) ? this.y - 5 : this.y + this.h;
        ctx.fillRect(this.x + 4, barrelY, 3, 5);
        ctx.fillRect(this.x + this.w - 7, barrelY, 3, 5);

        // Mini HP Bar
        let maxHp = this.getMaxHp();
        let hpRatio = Math.max(0, this.hp / maxHp);
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(this.x - 2, this.y - 6, this.w + 4, 3);
        ctx.fillStyle = "#00e5ff";
        ctx.fillRect(this.x - 2, this.y - 6, (this.w + 4) * hpRatio, 3);
        ctx.restore();
    }
}

// ==========================================
// --- CLASS ROBOT CHIẾN ĐẤU (CREATOR ROBOT) ---
// ==========================================
class CreatorRobot {
    constructor(owner) {
        this.owner = owner;
        this.w = 36;
        this.h = 36;
        this.x = Math.max(5, Math.min(canvas.width - this.w - 5, owner.x + owner.w / 2 - this.w / 2));
        this.y = this.getHomeY();
        this.maxHp = 10;
        this.hp = 10;
        this.dmg = 0.5;
        this.speed = 1.2;
        this.energy = 100;
        this.maxEnergy = 100;
        this.active = true;
        this.deadTimer = 0;
        
        // Cooldowns (ticks)
        this.cdSMG = 0;
        this.cdRocket = 0;
        this.cdDash = 0;
        this.cdAAA = 0;
        this.cdLaser = 0;
        
        this.isDashing = false;
        this.dashTimer = 0;
        this.dashDirY = (owner.id === 1) ? -1 : 1;
        
        // AAA Artillery Reticle
        this.aaaReticle = null;
        this.aaaTimer = 0;
        
        // Laser Telegraph
        this.laserTelegraph = 0;
    }

    getHomeY() {
        return (this.owner.id === 1) ? canvas.height * 0.6 : canvas.height * 0.4 - this.h;
    }

    update() {
        if (!this.active) {
            // Hồi sinh sau 30s (1800 ticks)
            this.deadTimer++;
            if (this.deadTimer >= 1800) {
                this.active = true;
                this.deadTimer = 0;
                this.hp = this.maxHp;
                this.energy = this.maxEnergy;
                this.x = Math.max(5, Math.min(canvas.width - this.w - 5, this.owner.x + this.owner.w / 2 - this.w / 2));
                this.y = this.getHomeY();
                this.isDashing = false;
                explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 50, '#ff9800', 0, this.owner));
                if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 15, "ROBOT TỰ ĐỘNG XUẤT XƯỞNG! 🤖⚙️", "#ff9800", 14);
            }
            return;
        }

        const enemy = (this.owner.id === 1) ? p2 : p1;
        let isFullEvo = this.owner.hasUpgrade && this.owner.hasUpgrade('evo_cr_1') && this.owner.hasUpgrade('evo_cr_2');

        // Hồi năng lượng tự nhiên
        if (this.energy < this.maxEnergy) this.energy = Math.min(this.maxEnergy, this.energy + 0.1);

        // Trừ cooldowns
        if (this.cdSMG > 0) this.cdSMG--;
        if (this.cdRocket > 0) this.cdRocket--;
        if (this.cdDash > 0) this.cdDash--;
        if (this.cdAAA > 0) this.cdAAA--;
        if (this.cdLaser > 0) this.cdLaser--;

        // 1. Logic Cú Đấm Thép (Tank Dash)
        if (this.isDashing) {
            this.dashTimer--;
            this.y += this.dashDirY * 9;
            if (enemy && enemy.hp > 0 && rectIntersect(this.x, this.y, this.w, this.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
                enemy.takeDamage(2.0, this.owner);
                enemy.x += (this.x < enemy.x ? 1 : -1) * 35;
                explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 45, '#ff5722', 0, this.owner));
                triggerScreenShake(4, 6);
                this.isDashing = false;
            }
            if (this.dashTimer <= 0) {
                this.isDashing = false;
            }
            this.y = Math.max(30, Math.min(canvas.height - this.h - 30, this.y));
            return;
        }

        // [FIX] Sau Cú Đấm Thép, robot từ từ quay về vị trí trực chiến thay vì kẹt ở làn đối thủ
        let homeY = this.getHomeY();
        if (Math.abs(this.y - homeY) > 1) this.y += (homeY - this.y) * 0.08;
        else this.y = homeY;

        // 2. AI Di chuyển gây áp lực
        if (enemy && enemy.hp > 0) {
            let targetX = enemy.x + enemy.w / 2 - this.w / 2;
            if (this.x < targetX - 5) this.x += this.speed;
            else if (this.x > targetX + 5) this.x -= this.speed;
            this.x = Math.max(5, Math.min(canvas.width - this.w - 5, this.x));
        }

        // 3. Kỹ năng 1: Sấy Tiểu Liên (SMG) - CD: 6s (360 ticks)
        if (this.cdSMG <= 0 && enemy && enemy.hp > 0) {
            this.cdSMG = 360;
            let dirY = (this.owner.id === 1) ? -1 : 1;
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    if (!this.active) return;
                    let spreadVx = (Math.random() - 0.5) * 2.2;
                    this.owner.bullets.push({
                        x: this.x + this.w / 2 - 2,
                        y: this.y + (dirY === -1 ? -4 : this.h + 2),
                        w: 5, h: 5,
                        vx: spreadVx,
                        vy: dirY * 9,
                        dmg: 0.25,
                        owner: this.owner,
                        color: "#ffb74d",
                        hitIds: []
                    });
                }, i * 70);
            }
            if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 12, "SẤY SMG! 💥", "#ffb74d", 12);
        }

        // 4. Kỹ năng 2: Pháo Bộc Phá (Rocket) - CD: 8s (480 ticks)
        if (this.cdRocket <= 0 && enemy && enemy.hp > 0) {
            this.cdRocket = 480;
            let dirY = (this.owner.id === 1) ? -1 : 1;
            this.owner.bullets.push({
                x: this.x + this.w / 2 - 5,
                y: this.y + (dirY === -1 ? -8 : this.h + 2),
                w: 10, h: 14,
                vx: (enemy.x + enemy.w / 2 - (this.x + this.w / 2)) * 0.02,
                vy: dirY * 5.5,
                dmg: 1.5,
                isRocket: true,
                owner: this.owner,
                color: "#f4511e",
                hitIds: []
            });
            if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 12, "BỘC PHÁ TÊN LỬA! 🚀", "#f4511e", 13);
        }

        // 5. Kỹ năng 3: Cú Đấm Thép (Tank Dash) - CD: 12s (720 ticks)
        if (this.cdDash <= 0 && enemy && enemy.hp > 0 && Math.abs(this.x - enemy.x) < 50) {
            this.cdDash = 720;
            this.isDashing = true;
            this.dashTimer = 22;
            this.dashDirY = (this.owner.id === 1) ? -1 : 1;
            if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 14, "CÚ ĐẤM THÉP! 🥊💨", "#ff5722", 14);
            if (soundSystem && !soundSystem.muted) soundSystem.playDash();
        }

        // --- FULL EVO VŨ TRANG HẠNG NẶNG ---
        if (isFullEvo) {
            // 6. Pháo Cao Xạ (AAA) - CD: 10s (600 ticks)
            if (this.cdAAA <= 0 && enemy && enemy.hp > 0) {
                this.cdAAA = 600;
                this.aaaReticle = { x: enemy.x + enemy.w / 2, y: enemy.y + enemy.h / 2 };
                this.aaaTimer = 70; // 1.1s cảnh báo hồng tâm
                if (typeof addFloatingText === 'function') addFloatingText(this.aaaReticle.x, this.aaaReticle.y - 20, "PHÁO CAO XẠ! 🎯", "#ff1744", 14);
            }

            if (this.aaaReticle && this.aaaTimer > 0) {
                this.aaaTimer--;
                if (this.aaaTimer <= 0) {
                    for (let step = 0; step < 3; step++) {
                        setTimeout(() => {
                            if (!this.aaaReticle) return;
                            let ox = (Math.random() - 0.5) * 40;
                            let oy = (Math.random() - 0.5) * 30;
                            let hitX = this.aaaReticle.x + ox;
                            let hitY = this.aaaReticle.y + oy;
                            explosions.push(new Explosion(hitX, hitY, 60, '#ff1744', 1.2, this.owner));
                            if (enemy && enemy.hp > 0 && Math.hypot(enemy.x + enemy.w / 2 - hitX, enemy.y + enemy.h / 2 - hitY) <= 60) {
                                enemy.takeDamage(1.2, this.owner);
                            }
                            triggerScreenShake(4, 6);
                        }, step * 250);
                    }
                    this.aaaReticle = null;
                }
            }

            // 7. Laser Thủy Lực - CD: 14s (840 ticks)
            if (this.cdLaser <= 0 && enemy && enemy.hp > 0) {
                this.cdLaser = 840;
                this.laserTelegraph = 30; // 0.5s tia cảnh báo
            }

            if (this.laserTelegraph > 0) {
                this.laserTelegraph--;
                if (this.laserTelegraph <= 0) {
                    let beamX = this.x + this.w / 2;
                    let beamY = 0;
                    let beamH = canvas.height;
                    beams.push(new Beam(beamX - 10, beamY, 20, beamH, this.owner.id, true));
                    if (enemy && enemy.hp > 0 && Math.abs(enemy.x + enemy.w / 2 - beamX) <= 24) {
                        enemy.takeDamage(3.0, this.owner);
                    }
                    crates.forEach(c => {
                        if (c.active && Math.abs(c.x + c.w / 2 - beamX) <= 24) {
                            c.active = false;
                            this.owner.onCollectAmmoCrate(c);
                        }
                    });
                    triggerScreenShake(6, 10);
                    if (soundSystem && !soundSystem.muted) soundSystem.playLaser();
                    if (typeof addFloatingText === 'function') addFloatingText(beamX, this.y - 15, "LASER THỦY LỰC! ⚡🔥", "#ff0055", 16);
                }
            }
        }
    }

    takeDamage(dmg) {
        if (!this.active) return;
        this.hp -= dmg;
        if (this.hp <= 0) {
            this.active = false;
            this.deadTimer = 0;
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 55, '#ff5722', 0, this.owner));
            if (soundSystem && !soundSystem.muted) soundSystem.playExplosion();
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        let cx = this.x + this.w / 2;
        let cy = this.y + this.h / 2;

        ctx.fillStyle = (this.owner.id === 1) ? "#263238" : "#3e2723";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = (this.owner.id === 1) ? "#00e5ff" : "#ff9800";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        // Kính ngắm Visor
        ctx.fillStyle = (this.owner.id === 1) ? "#00f0ff" : "#ff1744";
        ctx.fillRect(this.x + 6, this.y + 10, this.w - 12, 5);

        // Nòng pháo
        let dirY = (this.owner.id === 1) ? -1 : 1;
        ctx.fillStyle = "#90a4ae";
        ctx.fillRect(cx - 3, (dirY === -1 ? this.y - 8 : this.y + this.h), 6, 8);

        // Thanh máu và năng lượng
        let hpRatio = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(this.x - 2, this.y - 10, this.w + 4, 3);
        ctx.fillStyle = "#4caf50";
        ctx.fillRect(this.x - 2, this.y - 10, (this.w + 4) * hpRatio, 3);

        let nrgRatio = Math.max(0, this.energy / this.maxEnergy);
        ctx.fillStyle = "#ffb300";
        ctx.fillRect(this.x - 2, this.y - 6, (this.w + 4) * nrgRatio, 2);

        // Hồng tâm Pháo Cao Xạ
        if (this.aaaReticle && this.aaaTimer > 0) {
            ctx.strokeStyle = "#ff1744";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(this.aaaReticle.x, this.aaaReticle.y, 40, 0, Math.PI * 2);
            ctx.moveTo(this.aaaReticle.x - 45, this.aaaReticle.y); ctx.lineTo(this.aaaReticle.x + 45, this.aaaReticle.y);
            ctx.moveTo(this.aaaReticle.x, this.aaaReticle.y - 45); ctx.lineTo(this.aaaReticle.x, this.aaaReticle.y + 45);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Tia đỏ cảnh báo Laser Thủy Lực
        if (this.laserTelegraph > 0) {
            ctx.strokeStyle = "rgba(255, 0, 0, 0.75)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, 0); ctx.lineTo(cx, canvas.height);
            ctx.stroke();
        }

        ctx.restore();
    }
}
