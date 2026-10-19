// ==========================================
// inventor (inventor) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [draw] inventor
    drawInventor() {
        if (this.weapon === 'inventor' && this.drones) {
            this.drones.forEach(d => d.draw());
        }
    },

    // [draw] inventor
    drawInventor2() {
        if (this.weapon === 'inventor' && this.luoiDienSanSang) {
            ctx.save();
            ctx.strokeStyle = "#00ffcc";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 38, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "rgba(0, 255, 200, 0.15)";
            ctx.fill();
            ctx.restore();
        }
    },

    // [draw] inventor
    drawInventor3() {
        if (this.weapon === 'inventor') {
            if (this.luoiDienSanSang) {
                ctx.save();
                ctx.strokeStyle = '#00ffcc';
                ctx.lineWidth = 2.5;
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#00ffcc';
                ctx.setLineDash([6, 6]);
                ctx.beginPath();
                ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 34, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
            if (this.isOverclocking) {
                ctx.save();
                ctx.strokeStyle = 'rgba(0, 255, 204, 0.7)';
                ctx.lineWidth = 3;
                ctx.strokeRect(this.x - 3, this.y - 3, this.w + 6, this.h + 6);
                ctx.restore();
            }
        }
    },

    // [drawUI] inventor
    drawUIForInventor() {
        // Số Linh Kiện: vòng cạnh xe (js/render/empower-providers.js)
    }
});
