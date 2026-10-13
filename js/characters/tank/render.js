// ==========================================
// Xe TANK (tank) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [draw] Xe TANK
    drawTank(bx, by) {
        if (this.weapon === 'tank') {
            ctx.fillStyle = "#555";
            let spikeY = (this.id === 1) ? this.y - 10 : this.y + this.h;
            ctx.beginPath();
            ctx.moveTo(this.x, (this.id === 1) ? this.y : this.y + this.h);
            ctx.lineTo(this.x + this.w, (this.id === 1) ? this.y : this.y + this.h);
            ctx.lineTo(this.x + this.w / 2, spikeY);
            ctx.fill();
        } else {
            ctx.fillRect(bx, by, 8, 20);
        }
    }
});
