// ==========================================
// Âm Dương Sư (am_duong_su) — Vật triệu hồi / thực thể riêng
// ==========================================



// Class Vùng Hư Vô (Làm chậm & Cấm đánh)
class VoidZone {
    constructor(x, y, radius, duration, owner) {
        this.x = x; this.y = y; this.r = radius;
        this.lifeTime = duration;
        this.owner = owner;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.lifeTime--;
        if (this.lifeTime <= 0) this.active = false;

        let enemy = (this.owner.id === 1) ? p2 : p1;
        let d = Math.hypot(this.x - (enemy.x + enemy.w / 2), this.y - (enemy.y + enemy.h / 2));
        if (d < this.r) {
            enemy.slowTimer = 10;
            enemy.silenceTimer = 10; // Câm lặng liên tục khi đứng trong vùng
        }
    }
    draw() {
        if (!this.active) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(138, 43, 226, 0.3)`; // Màu tím hư vô
        ctx.fill();
        ctx.strokeStyle = '#8a2be2'; ctx.lineWidth = 2;
        ctx.stroke();
    }
}

class RadiationZone {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.r = 60;
        this.lifeTime = 180;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.lifeTime--;
        if (this.lifeTime <= 0) this.active = false;

        if (this.lifeTime % 30 === 0) {
            [p1, p2].forEach(p => {
                let d = Math.hypot(this.x - (p.x + p.w / 2), this.y - (p.y + p.h / 2));
                if (d < this.r) {
                    if (p.weapon === 'the_strongest') {
                        p.takeDamage(0.5, null, { isEnvironmental: true });
                    } else if (p.shield > 0) {
                        p.shield--;
                    } else if (p.hp > 1) {
                        p.hp = Math.max(1, p.hp - 1);
                    }
                }
            });
        }
    }
    draw() {
        if (!this.active) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 0, 0.3)`;
        ctx.fill();
        ctx.strokeStyle = '#00ff00';
        ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);
    }
}
class Talisman {
    constructor(x, y, type, owner, target = null) {
        this.x = x; this.y = y;
        this.type = type; // 'am' hoặc 'duong'
        this.owner = owner;
        this.target = target;
        this.w = 16; this.h = 24;

        // Thời gian tồn tại trên đất giảm mạnh: 1.25s (75 frames) hoặc 2s (120 frames với Evo 1)
        this.lifeTime = owner.hasUpgrade('evo_ads_1') ? 120 : 75;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.lifeTime--;
        if (this.lifeTime <= 0) this.active = false;

        // Dính vào mục tiêu nếu có
        if (this.target && this.target.active !== false && this.target.hp > 0) {
            this.x = this.target.x + this.target.w / 2;
            this.y = this.target.y + this.target.h / 2;
        }

        // Kiểm tra kết hợp với bùa khác
        for (let i = 0; i < talismans.length; i++) {
            let other = talismans[i];
            // Nếu là bùa của mình, khác loại Âm/Dương, và ở gần
            if (other !== this && other.active && other.owner.id === this.owner.id && other.type !== this.type) {
                let dist = Math.hypot(this.x - other.x, this.y - other.y);
                let combineDist = this.owner.hasUpgrade('evo_ads_1') ? 85 : 55; // Giảm nhẹ khoảng cách kết hợp
                if (dist < combineDist) {
                    this.combine(other);
                    break;
                }
            }
        }
    }
    combine(other) {
        this.active = false;
        other.active = false;

        let cx = (this.x + other.x) / 2;
        let cy = (this.y + other.y) / 2;

        let hasEvo1 = this.owner.hasUpgrade('evo_ads_1');
        let hasEvo2 = this.owner.hasUpgrade('evo_ads_2');
        let isFullEvo = hasEvo1 && hasEvo2;

        let radius = hasEvo1 ? 75 : 50; // Giảm nhẹ bán kính
        let stunFrames = hasEvo1 ? 45 : 30; // 0.75s hoặc 0.5s choáng

        // 1. Gây Nổ (Nerf nhẹ sát thương)
        explosions.push(new Explosion(cx, cy, radius, 'rgba(255, 255, 255,', 1.25, this.owner));

        // 2. Gây Choáng (Freeze) & Nerf toàn diện thời gian khống chế
        const enemy = (this.owner.id === 1) ? p2 : p1;
        if (Math.hypot(cx - (enemy.x + enemy.w / 2), cy - (enemy.y + enemy.h / 2)) < radius) {
            enemy.freezeTimer = stunFrames;
            enemy.slowTimer = 45; // 0.75s
            enemy.silenceTimer = 45; // 0.75s câm lặng (nerf mạnh từ 2s)
        }

        // 3. Pháp Trận (Evo 2)
        if (hasEvo2) {
            spellZones.push(new SpellZone(cx, cy, radius, 180, this.owner, isFullEvo));
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = this.type === 'am' ? '#2c3e50' : '#f1c40f'; // Âm = Đen xanh, Dương = Vàng
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.w / 2, -this.h / 2, this.w, this.h);

        // Vẽ ký hiệu bùa
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(-this.w / 4, -this.h / 4, this.w / 2, this.h / 2);
        ctx.restore();
    }
}

class SpellZone {
    constructor(x, y, r, duration, owner, isFullEvo) {
        this.x = x; this.y = y; this.r = r;
        this.lifeTime = duration;
        this.owner = owner;
        this.isFullEvo = isFullEvo;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.lifeTime--;
        if (this.lifeTime <= 0) this.active = false;

        // Gây sát thương mỗi 0.5s (30 frame)
        if (this.lifeTime % 30 === 0) {
            const enemy = (this.owner.id === 1) ? p2 : p1;
            if (Math.hypot(this.x - (enemy.x + enemy.w / 2), this.y - (enemy.y + enemy.h / 2)) < this.r) {
                enemy.takeDamage(0.5, this.owner);

                // Full Evo: Kèm câm lặng và làm chậm khi đứng trong trận
                if (this.isFullEvo) {
                    enemy.silenceTimer = 60;
                    enemy.slowTimer = 60;
                }
            }
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        ctx.arc(0, 0, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(138, 43, 226, 0.2)`; // Màu tím pháp trận
        ctx.fill();
        ctx.strokeStyle = '#8a2be2';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.stroke();

        // Vẽ trận pháp xoay
        ctx.rotate(Date.now() / 500);
        ctx.beginPath();
        ctx.moveTo(-this.r * 0.6, -this.r * 0.6); ctx.lineTo(this.r * 0.6, this.r * 0.6);
        ctx.moveTo(this.r * 0.6, -this.r * 0.6); ctx.lineTo(-this.r * 0.6, this.r * 0.6);
        ctx.stroke();
        ctx.restore();
    }
}
