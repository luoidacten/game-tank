// ==========================================
// inventor (inventor) — Vật triệu hồi / thực thể riêng
// ==========================================


// ==========================================
// --- CLASS INVENTOR DRONE (DRONE KHÔNG KÍCH) ---
// ==========================================
class InventorDrone {
    constructor(owner, offsetX = 0, lane = 0) {
        this.owner = owner;
        this.w = 26;
        this.h = 20;
        this.offsetX = offsetX;
        this.lane = lane;
        this.x = Math.max(20, Math.min(canvas.width - 40, (canvas.width / 2) + offsetX - this.w / 2));
        this.y = this.getLaneY();
        this.baseSpeed = 3;
        // [FIX] Hướng bay ban đầu theo phía được triển khai -> các drone tản ra thay vì dồn cục
        this.vx = (offsetX === 0 ? (Math.random() > 0.5 ? 1 : -1) : Math.sign(offsetX)) * this.baseSpeed;

        this.active = true;
        this.deadTimer = 0;
        this.lastShot = Date.now();

        this.hp = this.getMaxHp();

        this.lastPhao = 0;
        this.lastSmg = 0;
        this.lastBang = 0;
        this.lastLua = 0;
        this.lastTuGio = 0;
        this.lastKhien = 0;
    }

    // [FIX] Mỗi drone bay trên 1 làn riêng (lùi dần về phía sân nhà) để không chồng lên nhau,
    // tính theo chiều cao sân hiện tại nên vẫn đúng vị trí khi màn hình đổi kích thước.
    getLaneY() {
        let laneGap = this.h + 6;
        if (this.owner.id === 1) return canvas.height * 0.45 + this.lane * laneGap;
        return canvas.height * 0.55 - this.h - this.lane * laneGap;
    }

    getMaxHp() {
        let isFullEvo = this.owner.isFullEvoInventor || (hasFullEvo(this.owner, 'inventor') && this.owner.invUpgrades && this.owner.invUpgrades['inv_full_evo']);
        let ratio = 0.5;
        if (isFullEvo) ratio = 2.0; // 200% chỉ số từ chủ thể
        else if (this.owner.hasUpgrade('evo_inv_1')) ratio = 0.75; // 75% chỉ số
        let baseHp = Math.max(1, this.owner.maxHp * ratio);
        let khienLvl = (this.owner.invUpgrades && this.owner.invUpgrades['inv_khien_drone']) || 0;
        return baseHp + (khienLvl * 2);
    }

    get isOverclocking() {
        return !!(this.owner && this.owner.isOverclocking);
    }

    getRespawnTime() {
        let upg = this.owner.invUpgrades || {};
        let hasEvo2 = this.owner.hasUpgrade('evo_inv_2');
        let respawnTime = 10000;
        if (hasEvo2) respawnTime = 8000;
        else if (this.owner.hasUpgrade('evo_inv_1')) respawnTime = 8000;
        if (hasEvo2 && this.owner.hasUpgrade('evo_inv_1')) respawnTime = 6500;
        respawnTime -= (upg['inv_bodam'] || 0) * 500;
        return Math.max(2000, respawnTime);
    }

    update() {
        let upg = this.owner.invUpgrades || {};
        let hasEvo2 = this.owner.hasUpgrade('evo_inv_2');
        let isFullEvo = this.owner.isFullEvoInventor || (hasFullEvo(this.owner, 'inventor') && upg['inv_full_evo']);

        // Respawn logic (Bộ Đàm: giảm 0.5s hồi sinh mỗi cấp)
        let respawnTime = this.getRespawnTime();

        if (!this.active) {
            if (Date.now() - this.deadTimer > respawnTime) {
                this.active = true;
                this.hp = this.getMaxHp() / 2;
                explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 35, '#00ffcc', 0, this.owner));
            }
            return;
        }

        // TB Ổn Định: tăng tốc chạy & tốc bắn
        let speed = this.baseSpeed + ((upg['inv_ondinh'] || 0) * 0.6);
        if (hasEvo2) speed *= 1.2;
        if (isFullEvo) speed *= 1.3;

        let fireRate = 1000 - ((upg['inv_ondinh'] || 0) * 150);

        // Ép Xung (+50% tốc chạy, +100% tốc bắn)
        if (this.owner.isOverclocking) {
            speed *= 1.5;
            fireRate *= 0.5;
        }

        this.y = this.getLaneY();
        this.x += Math.sign(this.vx) * speed;
        if (this.x <= 4) { this.x = 4; this.vx = Math.abs(this.vx); }
        else if (this.x + this.w >= canvas.width - 4) { this.x = canvas.width - this.w - 4; this.vx = -Math.abs(this.vx); }

        // Bắn nòng chính
        if (Date.now() - this.lastShot > fireRate) {
            this.shootDefault(upg);
            this.lastShot = Date.now();
        }

        // Vũ khí phụ
        this.updateSubWeapons(upg);
    }

    shootDefault(upg) {
        let enemy = (this.owner.id === 1) ? p2 : p1;
        let baseDirY = (this.owner.id === 1) ? -1 : 1;
        let bulletSpd = 5.5;
        let vx = 0;
        let vy = baseDirY * bulletSpd;

        if (upg['inv_ngam'] && enemy && enemy.hp > 0) {
            // [FIX] Ngắm thật (có đón đầu). Trước đây vx bị kẹp ±1.8 nên địch lệch xa là bắn trượt.
            const a = aimVelocity(this.x + this.w / 2, this.y + this.h / 2, enemy, bulletSpd);
            if (a.vy * baseDirY > 0.5) { vx = a.vx; vy = a.vy; this.aimAngle = a.angle; }
        }

        let isPiercing = !!upg['inv_lazer'];
        let numBullets = 1 + (upg['inv_dan'] || 0);
        let isFullEvo = this.owner.isFullEvoInventor || (hasFullEvo(this.owner, 'inventor') && upg['inv_full_evo']);
        let dmgMultiplier = 1.0; // [CÂN BẰNG] 0.5 -> 1.0
        if (isFullEvo) dmgMultiplier = 2.0; // 200% chỉ số từ chủ thể
        else if (this.owner.hasUpgrade('evo_inv_1')) dmgMultiplier = 0.75;

        for (let i = 0; i < numBullets; i++) {
            let spreadVx = vx;
            if (numBullets > 1) {
                // Tỏa đều đối xứng hai bên, không bị văng lệch một phía
                spreadVx += (i - (numBullets - 1) / 2) * 1.2;
            }
            this.owner.bullets.push({
                x: this.x + this.w / 2 - 3,
                y: this.y + (vy > 0 ? this.h : -4),
                w: isPiercing ? 4 : 6,
                h: isPiercing ? 14 : 6,
                vx: spreadVx,
                vy: vy,
                dmg: Math.max(0.25, this.owner.damage * dmgMultiplier),
                owner: this.owner,
                isPiercing: isPiercing,
                isInventorBullet: true,
                hitIds: [],
                bounceCount: 0,
                active: true
            });
        }
        soundSystem.playShoot(isPiercing ? 'laser' : 'normal');
    }

    updateSubWeapons(upg) {
        let now = Date.now();
        let isFullEvo = this.owner.isFullEvoInventor || (hasFullEvo(this.owner, 'inventor') && upg['inv_full_evo']);
        let cdMod = isFullEvo ? 0.4 : 1.0;
        if (this.owner.isOverclocking) cdMod *= 0.5;

        if (upg['inv_phao'] && now - this.lastPhao > 3000 * cdMod) {
            this.fireAoEBullet('mortar', upg); this.lastPhao = now;
        }
        if (upg['inv_smg'] && now - this.lastSmg > 5000 * cdMod) {
            this.fireConeSMG(); this.lastSmg = now;
        }
        if (upg['inv_bang'] && now - this.lastBang > 4000 * cdMod) {
            this.fireAoEBullet('ice', upg); this.lastBang = now;
        }
        if (upg['inv_lua'] && now - this.lastLua > 4000 * cdMod) {
            this.fireAoEBullet('fire', upg); this.lastLua = now;
        }
        if (upg['inv_tugio'] && now - this.lastTuGio > 2000 * cdMod) {
            this.clearEnemyBulletsInRadius(100); this.lastTuGio = now;
        }
        if (upg['inv_khien'] && now - this.lastKhien > 20000) {
            if (this.owner.shield === 0) {
                this.owner.shield++;
                soundSystem.playPowerup();
                addFloatingText(this.owner.x + this.owner.w / 2, this.owner.y - 15, "+1 SHIELD", "#00ffff", 13);
            }
            this.lastKhien = now;
        }
    }

    fireAoEBullet(type, upg) {
        let enemy = (this.owner.id === 1) ? p2 : p1;
        let baseDirY = (this.owner.id === 1) ? -1 : 1;
        let vy = baseDirY * 4.5;
        let vx = 0;
        if (upg['inv_ngam'] && enemy && enemy.hp > 0) {
            const a = aimVelocity(this.x + this.w / 2, this.y + this.h / 2, enemy, 4.5);
            if (a.vy * baseDirY > 0.5) { vx = a.vx; vy = a.vy; }
        }
        this.owner.bullets.push({
            x: this.x + this.w / 2 - 5,
            y: this.y + this.h / 2 - 5,
            w: 10, h: 10,
            vx: vx, vy: vy,
            dmg: 1,
            owner: this.owner,
            specialType: type,
            isInventorBullet: true,
            hitIds: [],
            bounceCount: 0,
            active: true
        });
        soundSystem.playShoot('cannon');
    }

    fireConeSMG() {
        let baseVy = (this.owner.id === 1) ? -6 : 6;
        for (let i = 0; i < 12; i++) {
            let spreadVx = (i - 5.5) * 0.6;
            this.owner.bullets.push({
                x: this.x + this.w / 2 - 2,
                y: this.y + this.h / 2 - 2,
                w: 4, h: 4,
                vx: spreadVx, vy: baseVy,
                dmg: 0.3,
                owner: this.owner,
                isInventorBullet: true,
                hitIds: [],
                bounceCount: 0,
                active: true
            });
        }
        soundSystem.playShoot('normal');
    }

    clearEnemyBulletsInRadius(radius) {
        let enemy = (this.owner.id === 1) ? p2 : p1;
        if (!enemy || !enemy.bullets) return;
        let cleared = false;
        enemy.bullets.forEach(b => {
            if (b.active && Math.hypot(b.x - (this.x + this.w / 2), b.y - (this.y + this.h / 2)) < radius) {
                b.active = false;
                cleared = true;
                explosions.push(new Explosion(b.x, b.y, 14, 'white', 0, this.owner));
            }
        });
        if (cleared) soundSystem.playShieldBreak();
    }

    draw() {
        if (!this.active) return;
        ctx.save();

        // Thân Drone công nghệ
        ctx.fillStyle = this.owner.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = "#00ffcc";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        // Nòng súng Drone
        ctx.fillStyle = "#111";
        if (typeof this.aimAngle === 'number' && this.owner.invUpgrades && this.owner.invUpgrades['inv_ngam']) {
            // Thiết Bị Ngắm: nòng xoay theo hướng bắn
            ctx.save();
            ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
            ctx.rotate(this.aimAngle);
            ctx.fillRect(0, -3, this.w / 2 + 8, 6);
            ctx.restore();
        } else {
            ctx.fillRect(this.x + 6, this.y + (this.owner.id === 1 ? -6 : this.h), 14, 6);
        }

        // Động cơ bay
        ctx.fillStyle = "#00f0ff";
        ctx.fillRect(this.x + 2, this.y + (this.owner.id === 1 ? this.h : -3), 4, 3);
        ctx.fillRect(this.x + this.w - 6, this.y + (this.owner.id === 1 ? this.h : -3), 4, 3);

        // Khiên Drone nếu có inv_khien_drone
        if ((this.owner.invUpgrades && this.owner.invUpgrades['inv_khien_drone']) > 0) {
            ctx.strokeStyle = "rgba(0, 255, 200, 0.7)";
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - 3, this.y - 3, this.w + 6, this.h + 6);
        }

        // Thanh máu Drone
        let maxHp = this.getMaxHp();
        let hpPercent = Math.max(0, this.hp / maxHp);
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(this.x - 2, this.y - 7, this.w + 4, 4);
        ctx.fillStyle = "#00ffcc";
        ctx.fillRect(this.x - 2, this.y - 7, (this.w + 4) * hpPercent, 4);

        ctx.restore();
    }

    takeDamage(dmg) {
        if (!this.active) return;
        this.hp -= dmg;
        if (this.hp <= 0) {
            this.active = false;
            this.deadTimer = Date.now();
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 45, 'gray', 0, this.owner));
            soundSystem.playExplosion();
        }
    }
}
