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
        let isFullEvo = hasEvo1 && owner.hasUpgrade('evo_cr_2') && hasFullEvo(owner, 'creator');
        let ratio = isFullEvo ? 2.0 : (hasEvo1 ? 1.0 : 0.5);
        
        this.hp = Math.max(1, owner.maxHp * ratio) * (1 + 0.5 * bodyShopLvl(owner, 'cr_turret_hp'));
        this.maxHp = this.hp;
        this.dmg = owner.damage * ratio * (1 + 0.25 * bodyShopLvl(owner, 'cr_turret_dmg'));
        this.active = true;
        this.lastShot = Date.now();
        this.reloadTime = Math.round(1200 * (1 - 0.15 * bodyShopLvl(owner, 'cr_turret_rate')));
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
        let isFullEvo = hasEvo1 && owner.hasUpgrade('evo_cr_2') && hasFullEvo(owner, 'creator');
        let ratio = isFullEvo ? 4.0 : (hasEvo1 ? 2.0 : 1.0);
        
        this.maxHp = 5 * ratio + 3 * bodyShopLvl(owner, 'cr_shield'); // 5 HP gốc, 10 HP Evo 1, 20 HP Full Evo (+3/cấp Xưởng)
        this.hp = this.maxHp;
        this.durationTicks = 16 * 60; // 16s
        this.active = true;
        this.w = owner.w + 24;
        this.h = 8;
        this.x = owner.x + owner.w / 2 - this.w / 2;
        this.y = (owner.id === 1) ? owner.y - 12 : owner.y + owner.h + 4;
        this.msgCd = 0; this.hitFlash = 0;
    }

    update() {
        if (!this.active) return;
        this.durationTicks--;
        if (this.msgCd > 0) this.msgCd--;
        if (this.hitFlash > 0) this.hitFlash--;
        if (this.durationTicks <= 0 || this.hp <= 0) {
            this.active = false;
            this.owner.creatorShieldCooldown = Math.round((8 - 1.5 * bodyShopLvl(this.owner, 'cr_shield')) * 60); // Cooldown 8s sau khi vỡ/hết giờ (-1.5s/cấp Xưởng)
            if (this.hp <= 0) {
                explosions.push(new Explosion(this.owner.x + this.owner.w / 2, this.y, 40, '#00e5ff', 0, this.owner));
                if (soundSystem && !soundSystem.muted) soundSystem.playShieldBreak();
            }
            return;
        }

        // Đi theo xe chủ
        this.x = this.owner.x + this.owner.w / 2 - this.w / 2;
        this.y = (this.owner.id === 1) ? this.owner.y - 12 : this.owner.y + this.owner.h + 4;

        // Chặn đạn đối phương bay vào khiên (kiểm tra cả ở checkHits để đạn nhanh không xuyên qua)
        this.blockEnemyBullets();
    }

    // [FIX] Trước đây kiểm tra `!b.active` -> đạn (object thường, không có `active`) luôn bị bỏ qua => khiên không chặn gì.
    // Quét cả quãng đường đạn đi trong tick vừa rồi để đạn nhanh không "nhảy" qua khiên mỏng.
    blocksBullet(b) {
        if (!this.active || !b || b.active === false || typeof this.x !== 'number') return false;
        const bw = b.w || 6, bh = b.h || 6;
        const px = b.x - (b.vx || 0), py = b.y - (b.vy || 0);
        const x0 = Math.min(b.x, px), y0 = Math.min(b.y, py);
        const x1 = Math.max(b.x, px) + bw, y1 = Math.max(b.y, py) + bh;
        return x1 > this.x && x0 < this.x + this.w && y1 > this.y && y0 < this.y + this.h;
    }

    takeHit(dmg) {
        if (!this.active) return;
        this.hp -= Math.max(0.1, dmg || 0);
        this.hitFlash = 8;
    }

    blockEnemyBullets() {
        const enemy = (this.owner.id === 1) ? p2 : p1;
        if (!enemy || !enemy.bullets || !enemy.bullets.length) return;
        for (let i = enemy.bullets.length - 1; i >= 0; i--) {
            const b = enemy.bullets[i];
            if (!this.blocksBullet(b)) continue;
            this.absorb(b);
            enemy.bullets.splice(i, 1);
            if (this.hp <= 0) break;
        }
    }

    absorb(b) {
        this.takeHit(b.dmg || 1);
        spawnSparkParticles(b.x + (b.w || 6) / 2, this.y + this.h / 2, '#00e5ff', 8);
        if ((this.msgCd || 0) <= 0) {
            this.msgCd = 30;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 10, "KHIÊN CHẶN ĐẠN! 🛡️", "#00e5ff", 12);
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = this.hitFlash > 0 ? "rgba(200, 250, 255, 0.7)" : "rgba(0, 229, 255, 0.25)";
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
        let isFullEvo = this.owner.hasUpgrade && hasFullEvo(this.owner, 'creator');
        return Math.max(1, this.owner.maxHp * (isFullEvo ? 2.0 : 1.0)) + bodyShopLvl(this.owner, 'cr_drone');
    }

    getDamage() {
        let isFullEvo = this.owner.hasUpgrade && hasFullEvo(this.owner, 'creator');
        return this.owner.damage * (isFullEvo ? 2.0 : 1.0) * (1 + 0.25 * bodyShopLvl(this.owner, 'cr_drone'));
    }

    update() {
        if (!this.active) {
            // Hồi sinh sau 15s (15000ms)
            if (Date.now() - this.deadTimer >= 15000 - 3000 * bodyShopLvl(this.owner, 'cr_drone')) {
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
        this.maxHp = 10 + 4 * bodyShopLvl(owner, 'cr_robot');
        this.hp = this.maxHp;
        this.dmg = 0.5;
        this.speed = 0.75; // [ĐỔI] đi chậm hơn (1.2 -> 0.75)
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
        // [ĐỔI] Đứng gần sân nhà hơn (trước 60% -> nay 75% chiều sâu sân)
        return (this.owner.id === 1) ? canvas.height * 0.75 - this.h / 2 : canvas.height * 0.25 - this.h / 2;
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
        let isFullEvo = this.owner.hasUpgrade && hasFullEvo(this.owner, 'creator');

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
                bodyShopCredit(this.owner, enemy.takeDamage(2.0, this.owner), enemy);
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

        // 2. AI Di chuyển gây áp lực (đứng yên khi đang ngắm Laser)
        if (enemy && enemy.hp > 0 && !(this.laserTelegraph > 0)) {
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
                    // Đạn bay ra từ nòng Robot, ngắm về phía đối thủ (có tản nhẹ)
                    const tgt = (this.owner.id === 1) ? p2 : p1;
                    let a = (tgt && tgt.hp > 0) ? aimVelocity(this.x + this.w / 2, this.y + this.h / 2, tgt, 9) : { vx: 0, vy: dirY * 9 };
                    if (a.vy * dirY <= 0.5) a = { vx: 0, vy: dirY * 9 };
                    this.owner.bullets.push({
                        x: this.x + this.w / 2 - 2,
                        y: this.y + (dirY === -1 ? -4 : this.h + 2),
                        w: 5, h: 5,
                        vx: a.vx + (Math.random() - 0.5) * 1.2,
                        vy: a.vy,
                        dmg: 0.25,
                        owner: this.owner,
                        isCreatorRobotBullet: true,
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
                isCreatorRobotBullet: true,
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
                                bodyShopCredit(this.owner, enemy.takeDamage(1.2, this.owner), enemy);
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
                this.laserTelegraph = 50; // ~0.8s cảnh báo, khoá vị trí bắn
                this.laserX = this.x + this.w / 2;
                if (typeof addFloatingText === 'function') addFloatingText(this.laserX, this.y - 12, "⚠️ NẠP LASER", "#ff0055", 12);
            }

            if (this.laserTelegraph > 0) {
                this.laserTelegraph--;
                if (this.laserTelegraph <= 0) {
                    // [ĐỔI] Tia phát ra từ Robot về phía đối thủ (trước đây phủ cả màn hình)
                    let beamX = this.laserX || (this.x + this.w / 2);
                    let beamY = this.owner.id === 1 ? 0 : this.y + this.h;
                    let beamH = this.owner.id === 1 ? this.y : canvas.height - (this.y + this.h);
                    beams.push(new Beam(beamX - 10, beamY, 20, beamH, this.owner.id, true));
                    if (enemy && enemy.hp > 0 && Math.abs(enemy.x + enemy.w / 2 - beamX) <= 10 + enemy.w / 2) {
                        bodyShopCredit(this.owner, enemy.takeDamage(3.0, this.owner), enemy);
                    }
                    crates.forEach(c => {
                        if (c.active && Math.abs(c.x + c.w / 2 - beamX) <= 10 + c.w / 2 && (this.owner.id === 1 ? c.y < this.y : c.y > this.y)) {
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

        // Vùng cảnh báo Laser Thủy Lực: đúng bề rộng tia, từ Robot về phía đối thủ, nhấp nháy nhanh dần
        if (this.laserTelegraph > 0) {
            const lx = this.laserX || cx;
            const y0 = this.owner.id === 1 ? 0 : this.y + this.h;
            const hgt = this.owner.id === 1 ? this.y : canvas.height - (this.y + this.h);
            const k = 1 - this.laserTelegraph / 50;
            const blink = Math.floor(this.laserTelegraph / Math.max(2, 8 - k * 6)) % 2 === 0;
            ctx.fillStyle = `rgba(255, 0, 60, ${0.08 + 0.18 * k})`;
            ctx.fillRect(lx - 10, y0, 20, hgt);
            ctx.strokeStyle = blink ? "rgba(255, 40, 80, 0.95)" : "rgba(255, 40, 80, 0.35)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 4]);
            ctx.strokeRect(lx - 10, y0, 20, hgt);
            ctx.setLineDash([]);
            ctx.fillStyle = "#ff0055";
            ctx.beginPath(); ctx.arc(lx, this.owner.id === 1 ? this.y : this.y + this.h, 4 + 3 * k, 0, Math.PI * 2); ctx.fill();
        }

        ctx.restore();
    }
}
