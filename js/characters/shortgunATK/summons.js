// ==========================================
// Shotgun Tấn Công (shortgunATK) — Vật triệu hồi / thực thể riêng
// ==========================================



class ShortgunFireZone {
    constructor(x, y, dirY, length, angleSpread, duration, owner) {
        this.x = x;
        this.y = y;
        this.dirY = dirY;
        this.length = length || 130;
        this.angleSpread = angleSpread || 0.45;
        this.duration = duration || 180;
        this.owner = owner;
        this.active = true;
    }
    update(targets) {
        if (!this.active) return;
        this.duration--;
        if (this.duration <= 0) {
            this.active = false;
            return;
        }

        // Damage ticks every 15 frames (~4 times per second)
        if (this.duration % 15 === 0 && Array.isArray(targets)) {
            targets.forEach(t => {
                if (!t || t.hp <= 0) return;
                let tx = t.x + (t.w || 30) / 2;
                let ty = t.y + (t.h || 30) / 2;
                let dx = tx - this.x;
                let dy = ty - this.y;
                let dist = Math.hypot(dx, dy);

                if (dist <= this.length) {
                    let angle = Math.atan2(dy, dx);
                    let baseAngle = (this.dirY === -1) ? -Math.PI / 2 : Math.PI / 2;
                    let diff = Math.abs(angle - baseAngle);
                    if (diff > Math.PI) diff = Math.PI * 2 - diff;

                    if (diff <= this.angleSpread) {
                        t.burnStacks = (t.burnStacks || 0) + 1;
                        t.burnTimer = 120;
                        if (typeof t.takeDamage === 'function') {
                            t.takeDamage(0.2, this.owner, { isEnvironmental: true });
                        } else if (typeof t.hp === 'number') {
                            t.hp -= 0.2;
                        }
                        if (typeof spawnSparkParticles === 'function') spawnSparkParticles(tx, ty, "#ff5500", 2);
                    }
                }
            });
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        let baseAngle = (this.dirY === -1) ? -Math.PI / 2 : Math.PI / 2;
        let alpha = Math.min(0.35, this.duration / 60);

        ctx.fillStyle = `rgba(255, 69, 0, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, this.length, baseAngle - this.angleSpread, baseAngle + this.angleSpread);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 140, 0, ${alpha + 0.2})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Fiery sparks
        if (Math.random() < 0.3 && typeof spawnSparkParticles === 'function') {
            let rDist = Math.random() * this.length;
            let rAng = baseAngle + (Math.random() - 0.5) * (this.angleSpread * 2);
            let px = this.x + Math.cos(rAng) * rDist;
            let py = this.y + Math.sin(rAng) * rDist;
            spawnSparkParticles(px, py, "#ffaa00", 1);
        }
        ctx.restore();
    }
}
class FireZone {
    constructor(x, y, owner) {
        this.x = x; this.y = y;
        this.owner = owner;
        this.r = 45;
        this.lifeTime = 120; // Tồn tại 2s
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.lifeTime--;
        if (this.lifeTime <= 0) this.active = false;

        if (this.lifeTime % 30 === 0) {
            // 1. Tác động lên Địch (Player)
            const enemy = (this.owner.id === 1) ? p2 : p1;
            let d = Math.hypot(this.x - (enemy.x + enemy.w / 2), this.y - (enemy.y + enemy.h / 2));
            if (d < this.r) {
                enemy.burnTimer = this.owner.hasUpgrade('evo_furnace_2') ? 360 : 180;
                enemy.burnStacks++;
                if (enemy.burnStacks >= 5) {
                    enemy.takeDamage(5, this.owner);
                    enemy.burnStacks = 0;
                    explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 80, 'orange', 0, this.owner));
                }
            }

            // 2. Tác động lên Xe Tiền
            moneyTrucks.forEach(t => {
                if (t.active) {
                    let dt = Math.hypot(this.x - (t.x + t.w / 2), this.y - (t.y + t.h / 2));
                    if (dt < this.r) {
                        t.burnStacks = (t.burnStacks || 0) + 1;
                        t.hp -= 0.5; // DoT nhẹ
                        if (t.burnStacks >= 5) {
                            t.hp -= 5;
                            t.burnStacks = 0;
                            explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 80, 'orange', 0, this.owner));
                        }
                    }
                }
            });

            // 3. Tác động lên Ụ Súng Địch
            turrets.forEach(t => {
                if (t.active && t.owner.id !== this.owner.id) {
                    let dt = Math.hypot(this.x - (t.x + t.w / 2), this.y - (t.y + t.h / 2));
                    if (dt < this.r) {
                        t.burnStacks = (t.burnStacks || 0) + 1;
                        t.hp -= 0.5;
                        if (t.burnStacks >= 5) {
                            t.hp -= 5;
                            t.burnStacks = 0;
                            explosions.push(new Explosion(t.x + t.w / 2, t.y + t.h / 2, 60, 'orange', 0, this.owner));
                        }
                    }
                }
            });
        }
    }
    draw() {
        if (!this.active) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 69, 0, ${this.lifeTime / 240 + 0.2})`; // Cam đỏ
        ctx.fill();
        ctx.strokeStyle = '#ff4500';
        ctx.stroke();
    }
}
