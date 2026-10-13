// ==========================================
// thunder (thunder) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [drawUI] thunder
    drawUIForThunder(uiY, subUiY) {
        if (this.weapon === 'thunder') {
            let spearY = (this.id === 1) ? uiY - 14 : subUiY + 12;
            let startX = this.x + this.w / 2 - 18;
            for (let sIdx = 0; sIdx < 3; sIdx++) {
                ctx.fillStyle = (sIdx < (this.thunderSpears || 0)) ? "#ffff00" : "rgba(255, 255, 0, 0.2)";
                ctx.fillRect(startX + sIdx * 12, spearY, 8, 4);
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 0.8;
                ctx.strokeRect(startX + sIdx * 12, spearY, 8, 4);
            }
            if (this.thunderLoiMinhTimer > 0) {
                ctx.fillStyle = "#ffd700";
                ctx.font = "bold 9px 'Orbitron', Arial";
                ctx.textAlign = "center";
                drawWorldText(ctx, `⚡ THIÊN KIẾP (${Math.ceil(this.thunderLoiMinhTimer / 60)}s)`, this.x + this.w / 2, spearY - 5);
            } else if (this.thunderLoiMinhStacks > 0) {
                ctx.fillStyle = "#ffffaa";
                ctx.font = "bold 8px 'Orbitron', Arial";
                ctx.textAlign = "center";
                drawWorldText(ctx, `LÔI MINH: ${this.thunderLoiMinhStacks}/3`, this.x + this.w / 2, spearY - 5);
            }
            if (this.thunderShieldHits > 0) {
                ctx.strokeStyle = "#ffff00";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(this.x - 3, this.y - 3, this.w + 6, this.h + 6);
            }
        }
    }
});
