// ==========================================
// Axit Hóa (acid) — Vật triệu hồi / thực thể riêng
// ==========================================



class AcidZone {
    constructor(x, y, owner) {
        this.x = x; this.y = y;
        this.owner = owner;
        // BUFF: Vùng rộng hơn (60 -> 85), Evo lên 120
        this.r = 50;
        this.active = true;
        this.lifeTime = 60; // Tồn tại 4 giây

        if (owner.hasUpgrade('evo_acid_1')) {
            this.r = 100; // Siêu to khổng lồ
            this.lifeTime = 120; // 6 giây
        }
    }

    update() {
        if (!this.active) return;
        this.lifeTime--;
        if (this.lifeTime <= 0) this.active = false;

        let isEvo1 = this.owner.hasUpgrade('evo_acid_1');
        let isEvo2 = this.owner.hasUpgrade('evo_acid_2');
        let erosionRate = isEvo1 ? 0.06 : 0.03;
        let burnRate = isEvo1 ? 0.1 : 0.05;

        // SỬA: Ngưỡng kết liễu chuẩn. Evo2 = 2, không có Evo2 = 0 (không kết liễu)
        let killThreshold = isEvo2 ? 2 : 0;

        // 1. Phá giáp / Ăn mòn Địch
        const enemy = (this.owner.id === 1) ? p2 : p1;
        let d = zoneDist(this.x - (enemy.x + enemy.w / 2), this.y - (enemy.y + enemy.h / 2));

        if (d < this.r) {
            enemy.acidZoneSlow = 10; // Làm chậm nhẹ 25% khi đi qua vùng Axit
            if (enemy.weapon === 'the_strongest') {
                enemy.takeDamage(burnRate, this.owner, { isEnvironmental: true });
            } else if (enemy.shield > 0) {
                if (this.lifeTime % 10 === 0) enemy.shield--;
            } else {
                enemy.maxHp = Math.max(1, enemy.maxHp - erosionRate);
                if (enemy.hp > killThreshold) {
                    enemy.hp -= burnRate;
                    if (enemy.hp < 1 && killThreshold === 0) enemy.hp = 1;
                }
            }
        }

        // 2. Ăn mòn cực lớn lên các công trình/vật thể nhân tạo (Ụ súng, Xe Tiền, v.v.): Gấp 5 lần
        let structDmg = burnRate * 5;
        moneyTrucks.forEach(t => {
            if (t.active && zoneDist(this.x - (t.x + t.w / 2), this.y - (t.y + t.h / 2)) < this.r) t.hp -= structDmg;
        });
        turrets.forEach(t => {
            if (t.active && t.owner.id !== this.owner.id && zoneDist(this.x - (t.x + t.w / 2), this.y - (t.y + t.h / 2)) < this.r) t.hp -= structDmg;
        });
        if (typeof creatorTurrets !== 'undefined') {
            creatorTurrets.forEach(t => {
                if (t.active && t.owner.id !== this.owner.id && zoneDist(this.x - (t.x + t.w / 2), this.y - (t.y + t.h / 2)) < this.r) t.hp -= structDmg;
            });
        }
        if (typeof bastions !== 'undefined') {
            bastions.forEach(b => {
                if (b.active && zoneDist(this.x - (b.x + b.w / 2), this.y - (b.y + b.h / 2)) < this.r) b.hp -= structDmg;
            });
        }
        if (typeof necroMinions !== 'undefined') {
            necroMinions.forEach(m => {
                if (m.active && m.owner !== this.owner && zoneDist(this.x - (m.x + m.w / 2), this.y - (m.y + m.h / 2)) < this.r) m.takeDamage(structDmg);
            });
        }
    }

    draw() {
        if (!this.active) return;
        ctx.beginPath();
        zoneRectPath(this.x, this.y, this.r);
        // Màu xanh lá đậm hơn, nguy hiểm hơn
        ctx.fillStyle = `rgba(50, 205, 50, ${this.lifeTime / 240 * 0.5})`;
        ctx.fill();

        // Viền nhấp nháy
        ctx.strokeStyle = (Math.floor(Date.now() / 100) % 2 === 0) ? '#00ff00' : '#ADFF2F';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Hiệu ứng sủi bọt (nhiều hơn)
        if (Math.random() > 0.7) {
            ctx.fillStyle = "#ccffcc";
            let bx = this.x + (Math.random() - 0.5) * this.r * 1.6;
            let by = this.y + (Math.random() - 0.5) * this.r * 1.6;
            ctx.fillRect(bx, by, 3, 3);
        }
    }
}
