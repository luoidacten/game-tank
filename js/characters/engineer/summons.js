// ==========================================
// Kỹ Sư (engineer) — Vật triệu hồi / thực thể riêng
// ==========================================



function getNonOverlappingTurretPos(owner, targetX, targetY) {
    let pos = { x: targetX, y: targetY };
    let myTurrets = (typeof turrets !== 'undefined' ? turrets : []).filter(t => t.active && t.owner === owner);
    let minDist = 28;
    let tries = [0, 32, -32, 64, -64, 96, -96, 128, -128];
    for (let offset of tries) {
        let testX = Math.max(15, Math.min(canvas.width - 35, targetX + offset));
        let collision = myTurrets.some(t => Math.hypot(t.x - testX, t.y - targetY) < minDist);
        if (!collision) {
            pos.x = testX;
            return pos;
        }
    }
    return pos;
}

class Turret {
    constructor(owner, isSmart = false, startX = null, startY = null) {
        this.owner = owner;
        this.isSmart = isSmart;
        this.w = isSmart ? 22 : 18;
        this.h = isSmart ? 22 : 18;

        let defX = owner.x + owner.w / 2 - this.w / 2;
        let defY = owner.y + (owner.id === 1 ? -30 : owner.h + 10);
        let safePos = getNonOverlappingTurretPos(owner, startX !== null ? startX : defX, startY !== null ? startY : defY);
        this.x = safePos.x;
        this.y = safePos.y;

        let hasEvo1 = owner.hasUpgrade('evo_eng_1');
        let hasEvo2 = owner.hasUpgrade('evo_eng_2');
        let isFullEvo = hasEvo1 && hasEvo2;

        // Feet calculation
        let feetArmorCount = (owner.upgrades || []).filter(u => u === 'feet_armor').length;
        let speedAboveBase = Math.max(0, (owner.speed || C.baseSpeed) - C.baseSpeed);
        let feetSpeedRatio = speedAboveBase / 0.5;
        let speedReductionSec = feetSpeedRatio * 0.125;
        this.baseReload = Math.max(500, Math.round((3.0 - speedReductionSec) * 1000));
        this.reloadTime = this.baseReload;

        if (this.isSmart) {
            // Ụ súng thông minh
            if (isFullEvo) {
                let ratio = owner.isOverloaded ? 2.0 : 1.5;
                this.hp = (owner.maxHp * 1.5 + 6) * (owner.isOverloaded ? 2.0 : 1.0);
                this.baseDmg = (owner.damage * ratio);
            } else {
                this.hp = 6 + 1.0 * owner.maxHp;
                this.baseDmg = 1.0 * owner.damage;
            }
            this.maxHp = this.hp;
            this.lifeTime = Infinity; // Tồn tại vĩnh viễn
            this.isPiercing = (isFullEvo || hasEvo1);
        } else {
            // Ụ súng thường
            if (isFullEvo) {
                let ratio = owner.isOverloaded ? 1.25 : 1.0;
                this.hp = (6 + 1.0 * owner.maxHp) * (owner.isOverloaded ? 1.25 : 1.0);
                this.baseDmg = (owner.damage * ratio);
            } else if (hasEvo1) {
                this.hp = 6 + 0.75 * owner.maxHp;
                this.baseDmg = 0.75 * owner.damage;
            } else {
                this.hp = 3 + 0.5 * owner.maxHp;
                this.baseDmg = 0.5 * owner.damage;
            }
            this.maxHp = this.hp;
            this.lifeTime = (20 + feetArmorCount * 1) * 60; // 20s + số lượng Feet Armor (1s/feet)
            this.isPiercing = false;
        }

        this.ammo = 999;
        this.lastShot = Date.now();
        this.lastRaycast = Date.now();
        this.active = true;
        this.currentAngle = (owner.id === 1) ? -Math.PI / 2 : Math.PI / 2;
        this.color = (owner.id === 1) ? "#2980b9" : "#c0392b";
        this.warningAlpha = 0;
    }

    update() {
        if (!this.active) return;

        let hasEvo1 = this.owner.hasUpgrade('evo_eng_1');
        let hasEvo2 = this.owner.hasUpgrade('evo_eng_2');
        let isFullEvo = hasEvo1 && hasEvo2;
        const enemy = (this.owner.id === 1) ? p2 : p1;

        // Trừ thời gian tồn tại nếu không phải vĩnh viễn
        if (this.lifeTime !== Infinity) {
            this.lifeTime--;
            if (this.lifeTime <= 0) {
                this.active = false;
                return;
            }
        }

        // Tốc độ bắn trong Quá Tải (Ụ thường tăng tốc độ bắn)
        if (!this.isSmart && this.owner.isOverloaded) {
            this.reloadTime = Math.max(300, Math.round(this.baseReload * 0.6));
        } else {
            this.reloadTime = this.baseReload;
        }

        // Logic Mạng LAN (Evo 2 / Full Evo): Vòng nhỏ 50px quanh ụ thường
        let isLanActive = false;
        if (!this.isSmart && (hasEvo2 || isFullEvo)) {
            let dOwner = Math.hypot((this.owner.x + this.owner.w / 2) - (this.x + this.w / 2), (this.owner.y + this.owner.h / 2) - (this.y + this.h / 2));
            let dSmart = turrets.some(t => t.active && t.owner === this.owner && t.isSmart && Math.hypot((t.x + t.w / 2) - (this.x + this.w / 2), (t.y + t.h / 2) - (this.y + this.h / 2)) <= 50);

            if (dOwner <= 50 || dSmart) {
                isLanActive = true;
                this.hp = Math.min(this.maxHp, this.hp + 0.03); // Hồi máu
            }
        }

        // Khả năng tự ngắm
        let canAutoAim = this.isSmart || isLanActive;
        if (canAutoAim && enemy) {
            let targetAngle = Math.atan2((enemy.y + enemy.h / 2) - (this.y + this.h / 2), (enemy.x + enemy.w / 2) - (this.x + this.w / 2));
            let diff = targetAngle - this.currentAngle;
            while (diff <= -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;

            let turnSpeed = (this.isSmart && this.owner.isOverloaded) ? 0.02 : 0.08;
            if (Math.abs(diff) > turnSpeed) {
                this.currentAngle += Math.sign(diff) * turnSpeed;
            } else {
                this.currentAngle = targetAngle;
            }

            // Trong Quá Tải: Đường ngắm cảnh báo đậm dần lên & Bắn Raycast mỗi 2s
            if (this.isSmart && this.owner.isOverloaded) {
                this.warningAlpha = (this.warningAlpha + 0.02) % 1.0;
                if (Date.now() - this.lastRaycast > 2000) {
                    this.fireRaycast(enemy);
                    this.lastRaycast = Date.now();
                }
            } else {
                this.warningAlpha = 0;
            }
        } else {
            let defaultAngle = (this.owner.id === 1) ? -Math.PI / 2 : Math.PI / 2;
            let diff = defaultAngle - this.currentAngle;
            while (diff <= -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            if (Math.abs(diff) > 0.08) this.currentAngle += Math.sign(diff) * 0.08;
            else this.currentAngle = defaultAngle;
            this.warningAlpha = 0;
        }

        // Tự động bắn đạn thường
        if (Date.now() - this.lastShot > this.reloadTime) {
            this.shoot();
        }

        // HP về 0 -> Bị nổ
        if (this.hp <= 0) {
            this.explode();
        }
    }

    fireRaycast(enemy) {
        if (!enemy) return;
        let isEvo2 = true;
        let beamW = 12;
        let startX = this.x + this.w / 2 - beamW / 2;
        let startY = (this.owner.id === 1) ? 0 : this.y;
        let beamH = (this.owner.id === 1) ? this.y : canvas.height - this.y;

        beams.push(new Beam(startX, startY, beamW, beamH, this.owner.id, isEvo2));
        explosions.push(new Explosion(this.x + this.w / 2, (this.owner.id === 1) ? this.y : this.y + this.h, 30, '#00ffff', 0, this.owner));
        soundSystem.playShoot();

        if (rectIntersect(startX, startY, beamW, beamH, enemy.x, enemy.y, enemy.w, enemy.h)) {
            enemy.takeDamage(this.baseDmg * 1.5, this.owner, { isPiercing: true });
        }
    }

    shoot() {
        let speed = 4.8;
        let vx = Math.cos(this.currentAngle) * speed;
        let vy = Math.sin(this.currentAngle) * speed;

        this.owner.bullets.push({
            x: this.x + this.w / 2 - 2.5,
            y: (this.owner.id === 1 ? this.y - 2 : this.y + this.h + 2),
            w: this.isSmart ? 6 : 5,
            h: this.isSmart ? 6 : 5,
            vx: vx, vy: vy,
            dmg: this.baseDmg,
            owner: this.owner,
            isExplosive: false,
            isPiercing: this.isPiercing,
            isTurretBullet: true,
            isSmartTurret: this.isSmart,
            hitIds: []
        });

        this.lastShot = Date.now();
        soundSystem.playShoot();
    }

    explode() {
        this.active = false;
        let hasEvo1 = this.owner.hasUpgrade('evo_eng_1');
        let hasEvo2 = this.owner.hasUpgrade('evo_eng_2');
        let isFullEvo = hasEvo1 && hasEvo2;

        let expRange = this.isSmart ? 50 : 35;
        if (this.owner.isOverloaded) expRange += 25;
        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, expRange, this.isSmart ? 'cyan' : 'orange', 1, this.owner));

        // Full Evo: Ụ súng khi phát nổ tạo ra một Vùng Làm Chậm
        if (isFullEvo) {
            iceZones.push(new IceZone(this.x + this.w / 2, this.y + this.h / 2, 80, 180, this.owner));
        }
    }

    draw() {
        if (!this.active) return;
        let hasEvo2 = this.owner.hasUpgrade('evo_eng_2');
        let isFullEvo = this.owner.hasUpgrade('evo_eng_1') && hasEvo2;

        // Vẽ Vòng Mạng LAN (Evo 2) quanh ụ thường
        if (!this.isSmart && (hasEvo2 || isFullEvo)) {
            ctx.save();
            ctx.strokeStyle = "rgba(0, 255, 204, 0.4)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 50, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }

        // Đường ngắm cảnh báo đậm dần của Ụ Thông Minh trong Quá Tải
        if (this.isSmart && this.owner.isOverloaded && this.warningAlpha > 0) {
            ctx.save();
            let laserLen = canvas.height;
            let endX = (this.x + this.w / 2) + Math.cos(this.currentAngle) * laserLen;
            let endY = (this.y + this.h / 2) + Math.sin(this.currentAngle) * laserLen;

            ctx.strokeStyle = `rgba(255, 0, 80, ${this.warningAlpha * 0.85})`;
            ctx.lineWidth = 2.5;
            ctx.setLineDash([6, 3]);
            ctx.beginPath();
            ctx.moveTo(this.x + this.w / 2, this.y + this.h / 2);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }

        // Thân ụ súng
        ctx.fillStyle = this.isSmart ? "#1a365d" : "#4a5568";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = this.isSmart ? "#00f0ff" : "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        // Nòng súng xoay
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(this.currentAngle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-4, -4, 8, 8);
        ctx.fillRect(0, -2, this.isSmart ? 14 : 10, 4);
        ctx.restore();

        // Thanh HP ụ súng
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(this.x, this.y - 6, this.w, 3);
        ctx.fillStyle = this.isSmart ? "#00ffff" : "#00ff66";
        let hpRatio = Math.max(0, Math.min(1, this.hp / this.maxHp));
        ctx.fillRect(this.x, this.y - 6, this.w * hpRatio, 3);
    }
}
