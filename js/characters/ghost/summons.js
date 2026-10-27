// ==========================================
// Ghost (ghost) — Vật triệu hồi / thực thể riêng
// ==========================================



class GhostDecoy {
    constructor(x, y, w, h, owner) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.owner = owner;
        this.lifeTime = 90; // 1.5s
        this.maxLife = 90;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        this.lifeTime--;
        if (this.lifeTime <= 0) { this.active = false; return; }
        // Tàn Ảnh bắn phụ: 2 phát thẳng về phía địch (ở 2/3 và 1/3 đời sống)
        if (this.lifeTime === 60 || this.lifeTime === 30) this.fire();
    }
    fire() {
        const o = this.owner;
        if (!o || !o.bullets) return;
        const dirY = (o.id === 1) ? -1 : 1;
        const sz = 6;
        spawnBullet(o, {
            x: this.x + this.w / 2 - sz / 2,
            y: o.id === 1 ? this.y - 8 : this.y + this.h + 2,
            w: sz, h: sz, vx: 0, vy: dirY * (C.bulletSpeed + 2),
            dmg: o.damage * 0.6, isGhost: true, isFlicker: true,
        });
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = (this.lifeTime / this.maxLife) * 0.45;
        ctx.fillStyle = this.owner.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.restore();
    }
}
