// ==========================================
// Cuồng Phong (storm) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [draw] Cuồng Phong
    drawStorm() {
        if (this.weapon === 'storm' && (this.stormChargeRatio || 0) > 0) {
            let progress = Math.min(1, this.stormChargeRatio);
            ctx.save();
            ctx.strokeStyle = (progress >= 0.95) ? "#ff0055" : (progress >= 0.5 ? "#00ffcc" : "#2ecc71");
            ctx.lineWidth = progress >= 0.95 ? 3.5 : 2;
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, this.y + this.h / 2, Math.max(this.w / 2 + 8, 20 + progress * 16), 0, Math.PI * 2);
            ctx.stroke();
            if (progress >= 0.95) {
                ctx.fillStyle = "#ff0055"; ctx.font = "bold 9px 'Orbitron', Arial"; ctx.textAlign = "center";
                drawWorldText(ctx, "⚡ STORM READY", this.x + this.w / 2, this.y - 18);
            }
            ctx.restore();
        }
    }
});
