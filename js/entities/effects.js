// ==========================================
// Hiệu ứng dùng chung: vụ nổ, vùng băng, tia laser
// ==========================================


class Explosion {
    // Thêm tham số hasFalloff vào cuối (mặc định là false để giữ nguyên logic cũ cho các vũ khí khác)
    constructor(x, y, maxR = 60, color = 'rgba(255, 100, 0,', dmg = 2, owner = null, hasFalloff = false) {
        this.x = x; this.y = y;
        this.r = 1;
        this.maxR = maxR;
        this.active = true;
        this.colorStr = color;
        this.dmg = dmg;
        this.owner = owner;
        this.hasFalloff = hasFalloff; // Lưu loại vụ nổ
        this.hitTargets = [];
        this.checkCollision();
    }

    checkCollision() {
        const checkTarget = (t) => {
            if (!t || this.hitTargets.includes(t)) return;
            let dist = Math.hypot(this.x - (t.x + t.w / 2), this.y - (t.y + t.h / 2));

            if (dist < this.maxR) {
                // 0-damage cosmetic explosions do NOT strip shields or damage
                if (this.dmg <= 0) {
                    this.hitTargets.push(t);
                    return;
                }
                // Do not harm self (owner) unless owner is null (boom crate)
                if (this.owner && t === this.owner) {
                    return;
                }

                let finalDmg = this.dmg;
                if (this.hasFalloff) {
                    let falloffFactor = Math.max(0.2, 1 - (dist / this.maxR));
                    finalDmg = this.dmg * falloffFactor;
                }

                if (typeof t.takeDamage === 'function') {
                    t.takeDamage(finalDmg, this.owner);
                } else {
                    if (t.shield > 0) t.shield--;
                    else t.hp -= finalDmg;
                }
                this.hitTargets.push(t);
            }
        };

        checkTarget(p1); checkTarget(p2);

        moneyTrucks.forEach(t => {
            if (t.active) {
                let dist = Math.hypot(this.x - (t.x + t.w / 2), this.y - (t.y + t.h / 2));
                if (dist < this.maxR) {
                    let multiplier = (this.owner && this.owner.weapon === 'money_tank') ? 3 : 1;

                    // Áp dụng falloff cho cả xe tiền nếu cần
                    let finalDmg = this.dmg * 2 * multiplier;
                    if (this.hasFalloff) {
                        finalDmg *= (1 - (dist / this.maxR));
                    }

                    t.hp -= finalDmg;
                    if (t.hp <= 0 && this.owner) {
                        t.active = false;
                        let money = 50;
                        if (this.owner.weapon === 'money_tank') money *= 2;
                        if (this.owner.id === 1) gameState.p1Coins += money; else gameState.p2Coins += money;
                    }
                }
            }
        });

        // (Nếu muốn nổ tác động lên trụ thì thêm checkTurret tại đây, tương tự checkTarget)
    }

    update() {
        if (!this.active) return;
        this.r += 3;
        if (this.r > this.maxR) this.active = false;
    }

    draw() {
        if (!this.active) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        // Vẽ khác đi chút nếu là falloff (tùy chọn)
        ctx.fillStyle = `${this.colorStr} ${1 - this.r / this.maxR})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${1 - this.r / this.maxR})`;
        ctx.stroke();
    }
}

class IceZone {
    constructor(x, y, maxR = 60, duration = 60, owner) {
        this.x = x; this.y = y;
        this.r = 0;
        this.maxR = maxR;
        this.lifeTime = duration;
        this.active = true;
        this.owner = owner;
    }
    update() {
        if (!this.active) return;
        if (this.r < this.maxR) this.r += 2;
        this.lifeTime--;
        if (this.lifeTime <= 0) this.active = false;

        let enemies = [p1, p2].filter(p => p.id !== this.owner.id);
        enemies.forEach(p => {
            let d = Math.hypot(this.x - (p.x + p.w / 2), this.y - (p.y + p.h / 2));
            if (d < this.r) {
                p.slowTimer = 10;

                // Evo 2: Vung bang gay sat thuong
                if (this.owner.hasUpgrade('evo_ice_2') && this.lifeTime % 30 === 0) {
                    if (p.weapon === 'the_strongest') {
                        p.takeDamage(0.25, this.owner, { isEnvironmental: true });
                    } else if (p.shield > 0) {
                        p.shield--;
                    } else if (p.hp > 1) {
                        p.hp = Math.max(1, p.hp - 0.5);
                    }
                }

                if (this.owner.hasUpgrade('evo_ice_1')) {
                    p.coldStack++;
                    if (p.coldStack >= 100) {
                        p.freezeTimer = 30;
                        p.coldStack = 0;
                    }
                }
            }
        });
    }
    draw() {
        if (!this.active) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 255, 0.3)`;
        ctx.fill();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

class Beam {
    constructor(x, y, w, h, ownerId, isEvo) {
        this.x = x; this.y = y;
        this.w = w; this.h = h;
        this.ownerId = ownerId;
        this.isEvo = isEvo;
        this.lifeTime = isEvo ? 120 : 10;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.lifeTime--;
        if (this.lifeTime <= 0) this.active = false;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        const shake = (Math.random() - 0.5) * 4;
        ctx.fillStyle = "white";
        ctx.fillRect(this.x + shake, this.y, this.w, this.h);
        ctx.shadowBlur = 15;
        ctx.shadowColor = (this.ownerId === 1) ? "#3498db" : "#e74c3c";
        ctx.fillStyle = (this.ownerId === 1) ? "rgba(52, 152, 219, 0.5)" : "rgba(231, 76, 60, 0.5)";
        ctx.fillRect(this.x + shake - 5, this.y, this.w + 10, this.h);
        ctx.restore();
    }
}
