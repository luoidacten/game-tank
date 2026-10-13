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
        if (this.lifeTime <= 0) this.active = false;
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
