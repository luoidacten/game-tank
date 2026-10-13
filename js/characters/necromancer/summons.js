// ==========================================
// necromancer (necromancer) — Vật triệu hồi / thực thể riêng
// ==========================================



// ==========================================
// --- CLASS VONG LINH (CHIÊU HỒN SƯ MINION) ---
// ==========================================
class NecroMinion {
    constructor(owner, type) {
        this.owner = owner;
        this.type = type; // 'kamikaze' | 'shooter' | 'elite'
        this.active = true;

        if (this.type === 'kamikaze') {
            this.w = 24; this.h = 24;
            this.lockedCost = 2; this.refund = 1;
            this.hp = Math.max(1.5, owner.maxHp * 0.7);
            this.maxHp = this.hp;
            this.dmg = Math.max(1.0, owner.damage * 0.7);
            this.speed = 4.5;
            this.x = owner.x + owner.w / 2 - this.w / 2;
            this.y = (owner.id === 1) ? owner.y - 30 : owner.y + owner.h + 6;
        } else if (this.type === 'shooter') {
            this.w = 24; this.h = 24;
            this.lockedCost = 4; this.refund = 2;
            this.hp = Math.max(1.5, owner.maxHp * 0.5);
            this.maxHp = this.hp;
            this.dmg = Math.max(0.5, owner.damage * 0.5);
            this.speed = 2.0;
            this.vx = (Math.random() > 0.5 ? 1 : -1) * 2.0;
            this.shootTimer = 0;
            this.x = Math.max(20, Math.min(canvas.width - 44, owner.x + (Math.random() - 0.5) * 60));
            this.y = (owner.id === 1) ? owner.y - 45 : owner.y + owner.h + 20;
        } else if (this.type === 'elite') {
            this.w = 36; this.h = 36;
            this.lockedCost = 6; this.refund = 3;
            this.hp = Math.max(3.0, owner.maxHp * 2.0);
            this.maxHp = this.hp;
            this.dmg = Math.max(2.0, owner.damage * 2.0);
            this.speed = 3.2;
            this.attackCd = 0;
            this.shieldHits = (owner.hasUpgrade && owner.hasUpgrade('evo_necro_2')) ? 3 : 0;
            this.x = owner.x + owner.w / 2 - this.w / 2;
            this.y = (owner.id === 1) ? owner.y - 42 : owner.y + owner.h + 10;
        }
    }

    update() {
        if (!this.active) return;
        const enemy = (this.owner.id === 1) ? p2 : p1;

        if (this.type === 'kamikaze') {
            let dirY = (this.owner.id === 1) ? -1 : 1;
            this.y += dirY * this.speed;

            if (enemy && enemy.hp > 0) {
                // [FIX] Bám theo vị trí dự đoán của địch (trước đây chỉ trượt ngang 1.8px/tick, chậm hơn xe nên không bao giờ tới)
                const a = aimVelocity(this.x + this.w / 2, this.y + this.h / 2, enemy, this.speed);
                this.x += Math.max(-3.4, Math.min(3.4, a.vx));
            }

            // Check collision with enemy
            if (enemy && enemy.hp > 0 && rectIntersect(this.x, this.y, this.w, this.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
                this.detonate();
                return;
            }

            // Check collision with obstacles / walls / crates / moneyTrucks
            let hitObstacle = false;
            let obstacles = [];
            if (typeof sniperWalls !== 'undefined') obstacles.push(...sniperWalls);
            if (typeof crates !== 'undefined') obstacles.push(...crates);
            if (typeof moneyTrucks !== 'undefined') obstacles.push(...moneyTrucks);
            if (typeof bastions !== 'undefined') obstacles.push(...bastions);

            for (let obs of obstacles) {
                if (obs.active && rectIntersect(this.x, this.y, this.w, this.h, obs.x, obs.y, obs.w, obs.h)) {
                    hitObstacle = true;
                    break;
                }
            }

            if (hitObstacle || this.y <= 5 || this.y + this.h >= canvas.height - 5) {
                this.detonate();
                return;
            }
        } else if (this.type === 'shooter') {
            this.x += this.vx;
            if (this.x <= 15) { this.x = 15; this.vx = Math.abs(this.vx); }
            if (this.x + this.w >= canvas.width - 15) { this.x = canvas.width - 15 - this.w; this.vx = -Math.abs(this.vx); }

            this.shootTimer++;
            if (this.shootTimer >= 75) {
                this.shootTimer = 0;
                let dirY = (this.owner.id === 1) ? -1 : 1;
                let isPiercing = !!(this.owner.hasUpgrade && this.owner.hasUpgrade('evo_necro_2'));
                let bSpeed = C.bulletSpeed * 1.1;
                // [FIX] Xạ Thủ ngắm (có đón đầu) thay vì bắn thẳng
                let svx = 0, svy = dirY * bSpeed;
                if (enemy && enemy.hp > 0) {
                    const a = aimVelocity(this.x + this.w / 2, this.y + this.h / 2, enemy, bSpeed);
                    if (a.vy * dirY > 0.5) { svx = a.vx; svy = a.vy; }
                }
                this.owner.bullets.push({
                    x: this.x + this.w / 2 - 3,
                    y: (dirY === -1) ? this.y - 6 : this.y + this.h + 2,
                    w: 6, h: 6,
                    vx: svx,
                    vy: svy,
                    dmg: this.dmg,
                    owner: this.owner,
                    isPiercing: isPiercing,
                    isNecroMinionBullet: true,
                    color: "#00e676",
                    hitIds: []
                });
                if (soundSystem && !soundSystem.muted) soundSystem.playShoot();
            }
        } else if (this.type === 'elite') {
            // [ĐỔI CƠ CHẾ] Lính Cao Cấp đứng giữ vị trí phía sân nhà, canh thẳng hàng rồi LAO HÚC như TANK,
            // trúng 1 lần rồi quay về chỗ cũ (trước đây bò tới ngồi đè lên đối thủ).
            if (this.homeY === undefined) this.homeY = this.y;
            if (this.attackCd > 0) this.attackCd--;
            const dirY = (this.owner.id === 1) ? -1 : 1;
            if (!this.dashState) this.dashState = 'hold';
            if (this.dashState === 'hold') {
                if (enemy && enemy.hp > 0) {
                    const ex = enemy.x + enemy.w / 2 + (enemy._vx || 0) * 18 - this.w / 2;
                    const dx = ex - this.x;
                    this.x += Math.sign(dx) * Math.min(Math.abs(dx), this.speed);
                    if (Math.abs(dx) < 14 && this.attackCd <= 0) { this.dashState = 'dash'; this.hitDone = false; }
                }
                this.y += (this.homeY - this.y) * 0.2;
            } else if (this.dashState === 'dash') {
                this.y += dirY * 13;
                if (!this.hitDone && enemy && enemy.hp > 0 && rectIntersect(this.x, this.y, this.w, this.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
                    this.hitDone = true;
                    enemy.takeDamage(this.dmg, this.owner);
                    enemy.kbX = Math.sign((enemy.x + enemy.w / 2) - (this.x + this.w / 2) || 1) * 30;
                    enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, 18);
                    explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 45, '#00e676', 0, this.owner));
                    triggerScreenShake(4, 6);
                    if (soundSystem && !soundSystem.muted) soundSystem.playHit();
                    if (typeof addFloatingText === 'function') addFloatingText(enemy.x + enemy.w / 2, enemy.y - 15, "ĐÒN HÚC VONG LINH! 💀⚡", "#00e676", 14);
                    this.dashState = 'return';
                }
                if (this.y < 12 || this.y + this.h > canvas.height - 12) this.dashState = 'return';
            } else if (this.dashState === 'return') {
                this.y -= dirY * 7;
                if ((dirY < 0 && this.y >= this.homeY) || (dirY > 0 && this.y <= this.homeY)) {
                    this.y = this.homeY; this.dashState = 'hold'; this.attackCd = 120;
                }
            }
            this.x = Math.max(10, Math.min(canvas.width - this.w - 10, this.x));
            this.y = Math.max(10, Math.min(canvas.height - this.h - 10, this.y));
        }
    }

    detonate() {
        if (!this.active) return;
        let isEvo2 = this.owner.hasUpgrade && this.owner.hasUpgrade('evo_necro_2');
        let blastRadius = isEvo2 ? 75 : 50;
        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, blastRadius, '#00e676', this.dmg, this.owner));

        const enemy = (this.owner.id === 1) ? p2 : p1;
        if (enemy && enemy.hp > 0) {
            let dist = Math.hypot((enemy.x + enemy.w / 2) - (this.x + this.w / 2), (enemy.y + enemy.h / 2) - (this.y + this.h / 2));
            if (dist <= blastRadius) {
                enemy.takeDamage(this.dmg, this.owner);
            }
        }
        triggerScreenShake(5, 8);
        if (soundSystem && !soundSystem.muted) soundSystem.playExplosion();
        this.destroy();
    }

    takeDamage(dmg) {
        if (!this.active) return;
        if (this.shieldHits > 0) {
            this.shieldHits--;
            if (typeof addFloatingText === 'function') addFloatingText(this.x + this.w / 2, this.y - 12, `KHIÊN XƯƠNG (${this.shieldHits})! 💀`, "#00e676", 12);
            if (soundSystem && !soundSystem.muted) soundSystem.playShieldBreak();
            return;
        }
        this.hp -= dmg;
        if (this.hp <= 0) {
            this.destroy();
        }
    }

    destroy() {
        if (!this.active) return;
        this.active = false;
        explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 25, 'rgba(0, 230, 118, 0.6)', 0, this.owner));
        if (this.owner) {
            this.owner.lockedSouls = Math.max(0, (this.owner.lockedSouls || 0) - this.lockedCost);
            let cap = this.owner.maxSouls - this.owner.lockedSouls;
            this.owner.currentSouls = Math.min(cap, (this.owner.currentSouls || 0) + this.refund);
            if (typeof addFloatingText === 'function') {
                addFloatingText(this.x + this.w / 2, this.y - 12, `+${this.refund} LINH HỒN 👻`, "#00e676", 12);
            }
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        let cx = this.x + this.w / 2;
        let cy = this.y + this.h / 2;

        // Aura / Glow
        ctx.fillStyle = (this.type === 'kamikaze') ? "rgba(255, 87, 34, 0.25)" : (this.type === 'shooter' ? "rgba(0, 230, 118, 0.2)" : "rgba(171, 71, 188, 0.3)");
        ctx.beginPath();
        ctx.arc(cx, cy, this.w / 2 + 5, 0, Math.PI * 2);
        ctx.fill();

        // Minion body
        ctx.fillStyle = (this.type === 'kamikaze') ? "#ff7043" : (this.type === 'shooter' ? "#26a69a" : "#7e57c2");
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = (this.type === 'kamikaze') ? "#ffab91" : (this.type === 'shooter' ? "#80cbc4" : "#d1c4e9");
        ctx.lineWidth = 1.5;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        // Skull icon or eyes
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(cx - 5, cy - 4, 3, 4);
        ctx.fillRect(cx + 2, cy - 4, 3, 4);

        // Shield indicator for elite
        if (this.shieldHits > 0) {
            ctx.strokeStyle = "#00e676";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(cx, cy, this.w / 2 + 7, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Mini HP Bar
        let hpRatio = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(this.x, this.y - 6, this.w, 3);
        ctx.fillStyle = "#00e676";
        ctx.fillRect(this.x, this.y - 6, this.w * hpRatio, 3);

        ctx.restore();
    }
}
