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

const TURRET_DECAY_DELAY = 600;   // 10s đầu không tự mất máu
const TURRET_DECAY_TICKS = 2400;  // sau đó mất dần: hết máu sau thêm ~40s nếu không được hồi

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
        let isFullEvo = hasEvo1 && hasEvo2 && hasLegacyFullEvo(owner, 'engineer');

        // Feet calculation
        let feetArmorCount = (owner.upgrades || []).filter(u => u === 'feet_armor').length;
        let speedAboveBase = Math.max(0, (owner.speed || C.baseSpeed) - C.baseSpeed);
        let feetSpeedRatio = speedAboveBase / 0.5;
        let speedReductionSec = feetSpeedRatio * 0.125;
        this.baseReload = Math.max(500, Math.round((3.0 - speedReductionSec) * 1000));
        this.baseReload = Math.max(400, Math.round(this.baseReload * (1 - 0.12 * bodyShopLvl(owner, 'eng_rate')))); // Kho Phụ Tùng
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
            this.lifeTime = (20 + feetArmorCount * 1 + 5 * bodyShopLvl(owner, 'eng_life')) * 60; // 20s + số lượng Feet Armor (1s/feet) + Pin Bền Bỉ
            this.isPiercing = false;
        }
        // Kho Phụ Tùng: +25% máu / +20% dame mỗi cấp
        this.hp *= 1 + 0.25 * bodyShopLvl(owner, 'eng_hp');
        this.maxHp = this.hp;
        this.baseDmg *= 1 + 0.2 * bodyShopLvl(owner, 'eng_dmg');
        this.isIceTurret = !isSmart && bodyShopLvl(owner, 'eng_ice') > 0;
        this.shotCount = 0;

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
        let isFullEvo = hasEvo1 && hasEvo2 && hasLegacyFullEvo(this.owner, 'engineer');
        const enemy = (this.owner.id === 1) ? p2 : p1;

        // Trừ thời gian tồn tại nếu không phải vĩnh viễn
        if (this.lifeTime !== Infinity) {
            this.lifeTime--;
            if (this.lifeTime <= 0) {
                this.active = false;
                return;
            }
        }

        // Ụ súng tồn tại quá 10s bắt đầu tự mất máu chậm (~1/40 máu tối đa mỗi giây)
        this.age = (this.age || 0) + 1;
        if (this.age > TURRET_DECAY_DELAY) {
            this.hp -= this.maxHp / (TURRET_DECAY_TICKS * (1 + 0.5 * bodyShopLvl(this.owner, 'eng_life')));
            if (this.hp <= 0) {
                this.hp = 0; this.active = false;
                explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 25, 'gray', 0, this.owner));
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

    // Ụ thông minh: cảnh báo 0.5s (khoá cột) rồi mới bắn tia
    fireRaycast(enemy) {
        if (!enemy || this.raycastPending) return;
        this.raycastPending = true;
        scheduleHitscan(this, 30, '#00ffff', 20, () => { this.raycastPending = false; if (this.active !== false) this.fireRaycastNow(enemy); });
    }

    fireRaycastNow(enemy) {
        if (!enemy) return;
        let isEvo2 = true;
        let beamW = 12;
        let startX = this.x + this.w / 2 - beamW / 2;
        let startY = (this.owner.id === 1) ? 0 : this.y;
        let beamH = (this.owner.id === 1) ? this.y : canvas.height - this.y;
        const swBlk = sniperWallClipBeam(this, startX, startY, beamW, beamH, this.owner.id === 1 ? -1 : 1, this.baseDmg * 1.5); // Tường Sniper chặn tia
        if (swBlk) { startY = swBlk.y; beamH = swBlk.h; }

        beams.push(new Beam(startX, startY, beamW, beamH, this.owner.id, isEvo2));
        explosions.push(new Explosion(this.x + this.w / 2, (this.owner.id === 1) ? this.y : this.y + this.h, 30, '#00ffff', 0, this.owner));
        soundSystem.playShoot();

        if (rectIntersect(startX, startY, beamW, beamH, enemy.x, enemy.y, enemy.w, enemy.h)) {
            bodyShopCredit(this.owner, enemy.takeDamage(this.baseDmg * 1.5, this.owner, { isPiercing: true }), enemy);
        }
    }

    shoot() {
        let speed = 4.8;
        let vx = Math.cos(this.currentAngle) * speed;
        let vy = Math.sin(this.currentAngle) * speed;
        this.shotCount = (this.shotCount || 0) + 1;
        const ice = !!this.isIceTurret && this.shotCount % 2 === 0; // Ụ Hàn Băng: cứ 2 phát 1 phát băng

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
            isIce: ice,
            hitIds: []
        });

        this.lastShot = Date.now();
        soundSystem.playShoot();
    }

    explode() {
        this.active = false;
        let hasEvo1 = this.owner.hasUpgrade('evo_eng_1');
        let hasEvo2 = this.owner.hasUpgrade('evo_eng_2');
        let isFullEvo = hasEvo1 && hasEvo2 && hasLegacyFullEvo(this.owner, 'engineer');

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
        let isFullEvo = this.owner.hasUpgrade('evo_eng_1') && hasEvo2 && hasLegacyFullEvo(this.owner, 'engineer');

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

        // Thân ụ súng (Ụ Hàn Băng: thân xanh băng)
        ctx.fillStyle = this.isSmart ? "#1a365d" : (this.isIceTurret ? "#0e4a5c" : "#4a5568");
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = this.isSmart ? "#00f0ff" : (this.isIceTurret ? "#7dd3fc" : "rgba(255, 255, 255, 0.3)");
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
